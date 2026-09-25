import {
  VoiceNavigationIntent,
  VoiceNavigationLanguage,
  VoiceNavLangCode,
  VoiceNavigationMatch,
  VoiceNavigationRoute,
} from './voiceNavigationTypes';
import {
  VOICE_COMMAND_DICTIONARY,
  SupportedVoiceNavLang,
} from './voiceCommandDictionary';
import {
  VOICE_NAVIGATION_ROUTES,
  VOICE_NAVIGATION_ROUTE_LIST,
  getRouteByIntent,
} from './voiceNavigationRoutes';
import {
  normalizeText,
  isMedicalStatement,
  detectLanguageFromScript,
  langCodeToBcp47,
  bcp47ToLangCode,
  stripFillers,
} from './voiceNavigationUtils';
import { multilingualLanguageIdentifier } from '../voice/multilingualLanguageIdentifier';
import { SupportedLanguageCode } from '../../data/languages';

export type CommandMatchResult = VoiceNavigationMatch & {
  // Backwards compatibility for existing route object access
  routeDetails?: VoiceNavigationRoute;
  detectedLanguage?: SupportedVoiceNavLang;
};

export class VoiceCommandMatcher {
  /**
   * Normalizes an utterance for deterministic dictionary lookup.
   */
  public normalizeText(text: string): string {
    return normalizeText(text);
  }

  /**
   * Detects the language of the text.
   */
  public detectLanguage(
    text: string,
    preferredLang?: SupportedVoiceNavLang
  ): SupportedVoiceNavLang {
    if (!text.trim()) return preferredLang || 'en';

    // 1. Instant script check
    const scriptLang = detectLanguageFromScript(text);
    if (scriptLang) return scriptLang;

    // 2. If user preferred language is non-English, keep it
    if (preferredLang && preferredLang !== 'en') {
      return preferredLang;
    }

    // 3. Fallback to multilingualLanguageIdentifier if applicable
    try {
      const bcpPref = `${preferredLang || 'en'}-IN` as SupportedLanguageCode;
      const detected = multilingualLanguageIdentifier.identifyLanguage(text, bcpPref, false);
      const code = detected.detectedLanguage.slice(0, 2) as SupportedVoiceNavLang;
      if (['en', 'ta', 'hi', 'te', 'ml', 'kn'].includes(code)) {
        return code;
      }
    } catch {}

    return 'en';
  }

  /**
   * Checks if the utterance is a medical complaint / symptom rather than navigation.
   */
  public isMedicalStatement(text: string): boolean {
    return isMedicalStatement(text);
  }

  /**
   * Matches a recognized or typed string to a known Medora route.
   */
  public matchCommand(
    rawText: string,
    forcedLang?: SupportedVoiceNavLang | 'app' | 'auto',
    appLang: string = 'en'
  ): CommandMatchResult {
    const text = normalizeText(rawText);

    if (!text) {
      return {
        matched: false,
        intent: null,
        confidence: 0,
        language: null,
        reason: 'empty_input',
        feedbackText: 'Please speak or type a navigation destination.',
      };
    }

    // Safety rule: Do NOT interpret symptoms/complaints as navigation
    if (isMedicalStatement(text)) {
      return {
        matched: false,
        intent: null,
        confidence: 0,
        language: null,
        reason: 'medical_statement',
        feedbackText:
          'Medical complaint detected. Voice navigation is for page opening only. Please consult Medora AI or a Doctor.',
      };
    }

    // Determine target language
    let langCode: SupportedVoiceNavLang = 'en';
    if (forcedLang && forcedLang !== 'app' && forcedLang !== 'auto') {
      langCode = forcedLang;
    } else if (forcedLang === 'app') {
      langCode = (['ta', 'hi', 'te', 'ml', 'kn', 'en'].includes(appLang) ? appLang : 'en') as SupportedVoiceNavLang;
    } else {
      // auto
      langCode = this.detectLanguage(
        text,
        (['ta', 'hi', 'te', 'ml', 'kn', 'en'].includes(appLang) ? appLang : 'en') as SupportedVoiceNavLang
      );
    }

    const bcpLang = langCodeToBcp47(langCode);

    // Clean filler words
    const cleanedText = stripFillers(text, langCode);

    // Match candidate routes in target language + English fallback
    const targetDictionary = VOICE_COMMAND_DICTIONARY[langCode] || VOICE_COMMAND_DICTIONARY.en;
    const englishDictionary = VOICE_COMMAND_DICTIONARY.en;

    let bestIntent: VoiceNavigationIntent | null = null;
    let highestScore = 0;
    let matchedPhrase = '';

    const evaluatePhrases = (
      phrasesList: { intent: VoiceNavigationIntent; phrases: string[]; keywords?: string[] }[]
    ) => {
      for (const item of phrasesList) {
        for (const phrase of item.phrases) {
          const normPhrase = normalizeText(phrase);

          // 1. Exact match
          if (cleanedText === normPhrase || text === normPhrase) {
            if (1.0 > highestScore) {
              highestScore = 1.0;
              bestIntent = item.intent;
              matchedPhrase = phrase;
            }
            break;
          }

          // 2. Starts with / Ends with / Contains whole phrase
          if (text.includes(normPhrase) || cleanedText.includes(normPhrase)) {
            const score = 0.94;
            if (score > highestScore) {
              highestScore = score;
              bestIntent = item.intent;
              matchedPhrase = phrase;
            }
          }

          // 3. Reverse containment (e.g. user said "medicines", phrase is "open medicines")
          if (normPhrase.includes(cleanedText) && cleanedText.length >= 3) {
            const score = 0.88;
            if (score > highestScore) {
              highestScore = score;
              bestIntent = item.intent;
              matchedPhrase = phrase;
            }
          }

          // 4. Token overlap matching for natural variations
          const textTokens = cleanedText.split(' ').filter((w) => w.length > 2);
          const phraseTokens = normPhrase.split(' ').filter((w) => w.length > 2);

          if (textTokens.length > 0 && phraseTokens.length > 0) {
            const common = textTokens.filter((t) => phraseTokens.includes(t));
            if (
              common.length >= 2 ||
              (common.length === 1 && (textTokens.length === 1 || phraseTokens.length === 1))
            ) {
              const overlapScore =
                0.78 + (common.length / Math.max(textTokens.length, phraseTokens.length)) * 0.15;
              if (overlapScore > highestScore) {
                highestScore = overlapScore;
                bestIntent = item.intent;
                matchedPhrase = phrase;
              }
            }
          }
        }

        // 5. Keyword match fallback
        if (item.keywords && highestScore < 0.85) {
          for (const kw of item.keywords) {
            const normKw = normalizeText(kw);
            if (text.includes(normKw) || cleanedText.includes(normKw)) {
              const kwScore = 0.80;
              if (kwScore > highestScore) {
                highestScore = kwScore;
                bestIntent = item.intent;
                matchedPhrase = kw;
              }
            }
          }
        }
      }
    };

    // First evaluate against selected language
    evaluatePhrases(targetDictionary);

    // If no strong match and language wasn't English, evaluate against English as universal fallback
    if (highestScore < 0.70 && langCode !== 'en') {
      evaluatePhrases(englishDictionary);
    }

    if (bestIntent && highestScore >= 0.70) {
      const routePath = VOICE_NAVIGATION_ROUTES[bestIntent];
      const routeItem = getRouteByIntent(bestIntent);

      const destName = routeItem ? (routeItem.name[langCode] || routeItem.name.en) : bestIntent;
      const feedbackMessages: Record<SupportedVoiceNavLang, string> = {
        en: `✓ Opening ${destName}`,
        ta: `✓ ${destName} திறக்கப்படுகிறது...`,
        hi: `✓ ${destName} खोला जा रहा है...`,
        te: `✓ ${destName} తెరవబడుతోంది...`,
        ml: `✓ ${destName} തുറക്കുന്നു...`,
        kn: `✓ ${destName} ತೆರೆಯಲಾಗುತ್ತಿದೆ...`,
      };

      return {
        matched: true,
        intent: bestIntent,
        route: routePath,
        routeDetails: routeItem,
        confidence: highestScore,
        matchedPhrase,
        language: bcpLang,
        detectedLanguage: langCode,
        reason: 'matched',
        feedbackText: feedbackMessages[langCode] || `✓ Opening ${destName}`,
      };
    }

    const notUnderstoodMessages: Record<SupportedVoiceNavLang, string> = {
      en: "Sorry, I didn't understand. Please try saying where you want to go, or type your destination.",
      ta: 'மன்னிக்கவும், விளங்கவில்லை. நீங்கள் செல்ல விரும்பும் பக்கத்தைக் கூறவும் அல்லது தட்டச்சு செய்யவும்.',
      hi: 'माफ़ कीजिए, समझ नहीं आया। कृपया बताएं आप कहां जाना चाहते हैं या टाइप करें।',
      te: 'క్షమించండి, అర్థం కాలేదు. దయచేసి మీరు ఎక్కడికి వెళ్లాలనుకుంటున్నారో చెప్పండి లేదా టైప్ చేయండి.',
      ml: 'ക്ഷമിക്കണം, മനസ്സിലായില്ല. എവിടെ പോകണമെന്ന് പറയുകയോ ടൈപ്പ് ചെയ്യുകയോ ചെയ്യുക.',
      kn: 'ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕೆಂದು ಹೇಳಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.',
    };

    return {
      matched: false,
      intent: null,
      confidence: highestScore,
      language: bcpLang,
      detectedLanguage: langCode,
      reason: 'unrecognized_command',
      feedbackText: notUnderstoodMessages[langCode] || notUnderstoodMessages.en,
    };
  }
}

export const voiceCommandMatcher = new VoiceCommandMatcher();

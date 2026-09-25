import { VOICE_COMMAND_DICTIONARY, SupportedVoiceNavLang } from './voiceCommandDictionary';
import { VOICE_NAVIGATION_ROUTES, VoiceNavigationRoute } from './voiceNavigationRoutes';
import { multilingualLanguageIdentifier } from '../voice/multilingualLanguageIdentifier';
import { SupportedLanguageCode } from '../../data/languages';

export interface CommandMatchResult {
  matched: boolean;
  route?: VoiceNavigationRoute;
  confidence: number;
  matchedPhrase?: string;
  detectedLanguage?: SupportedVoiceNavLang;
  feedbackText: string;
  reason?: 'matched' | 'medical_statement' | 'unrecognized_command' | 'empty_input';
}

// Medical symptom and complaint expressions that MUST NOT be interpreted as navigation
const MEDICAL_COMPLAINT_PATTERNS = [
  // English
  /\b(headache|fever|cough|cold|vomit|vomiting|stomach\s*pain|chest\s*pain|dizziness|bleeding|nausea|diarrhea|rash|throat\s*pain|breathless|cannot\s*breathe)\b/i,
  /\bi\s*(have|feel|am\s*having|got)\s*(a|an)?\s*(headache|fever|cough|cold|pain|chills|vomiting)/i,
  // Tamil
  /(தலைவலி|காய்ச்சல்|இருமல்|சளி|வாந்தி|வயிற்று\s*வலி|நெஞ்சு\s*வலி|மயக்கம்|மூச்சுத்திணறல்)/,
  // Hindi
  /(सिरदर्द|बुखार|खांसी|जुकाम|उल्टी|पेट\s*दर्द|सीने\s*में\s*दर्द|चक्कर|सांस\s*फूलना)/,
  // Telugu
  /(తలనొప్పి|జ్వరం|దగ్గు|రొంప|వాంతులు|కడుపు\s*నొప్పి|ఛాతీ\s*నొప్పి|కళ్ళు\s*తిరగడం)/,
  // Malayalam
  /(തലവേദന|പനി|ചുമ|ഛർദ്ദി|വയറുവേദന|നെഞ്ചുവേദന|ശ്വാസതടസ്സം)/,
  // Kannada
  /(ತಲೆನೋವು|ಜ್ವರ|ಕೆಮ್ಮು|ನೆಗಡಿ|ವಾಂತಿ|ಹೊಟ್ಟೆ\s*ನೋವು|ಎದೆ\s*ನೋವು|ಉಸಿರಾಟ)/,
];

// Filler words to remove for cleaner intent matching
const FILLER_WORDS: Record<SupportedVoiceNavLang, string[]> = {
  en: ['please', 'can you', 'could you', 'i want to', 'take me to', 'navigate to', 'would like to', 'kindly'],
  ta: ['தயவுசெய்து', 'கொஞ்சம்', 'எனக்கு', 'வேண்டும்'],
  hi: ['कृपया', 'जरा', 'मुझे', 'चाहिए'],
  te: ['దయచేసి', 'నాకు', 'కావాలి'],
  ml: ['ദയവായി', 'എനിക്ക്', 'വേണം'],
  kn: ['ದಯವಿಟ್ಟು', 'ನನಗೆ', 'ಬೇಕು'],
};

export class VoiceCommandMatcher {
  /**
   * Normalizes an utterance for deterministic dictionary lookup.
   */
  public normalizeText(text: string): string {
    return (text || '')
      .toLowerCase()
      .replace(/[.,?!;:()[\]{}"'\\/_\-+—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Detects the language script of the text or falls back to provided language.
   */
  public detectLanguage(text: string, preferredLang?: SupportedVoiceNavLang): SupportedVoiceNavLang {
    if (!text.trim()) return preferredLang || 'en';

    // Fast script detection for Indic languages
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';

    if (preferredLang && preferredLang !== 'en') {
      return preferredLang;
    }

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
    const trimmed = text.trim();
    return MEDICAL_COMPLAINT_PATTERNS.some((pattern) => pattern.test(trimmed));
  }

  /**
   * Matches a recognized or typed string to a known Medora route.
   */
  public matchCommand(
    rawText: string,
    forcedLang?: SupportedVoiceNavLang | 'app' | 'auto',
    appLang: string = 'en'
  ): CommandMatchResult {
    const text = this.normalizeText(rawText);

    if (!text) {
      return {
        matched: false,
        confidence: 0,
        reason: 'empty_input',
        feedbackText: 'Please speak or type a navigation destination.',
      };
    }

    // Safety rule: Do NOT interpret symptoms/complaints as navigation
    if (this.isMedicalStatement(text)) {
      return {
        matched: false,
        confidence: 0,
        reason: 'medical_statement',
        feedbackText: 'Medical complaint detected. Voice navigation is for page opening only. Please consult Medora AI or a Doctor.',
      };
    }

    // Determine target language
    let lang: SupportedVoiceNavLang = 'en';
    if (forcedLang && forcedLang !== 'app' && forcedLang !== 'auto') {
      lang = forcedLang;
    } else if (forcedLang === 'app') {
      lang = (['ta', 'hi', 'te', 'ml', 'kn', 'en'].includes(appLang) ? appLang : 'en') as SupportedVoiceNavLang;
    } else {
      // auto
      lang = this.detectLanguage(text, (['ta', 'hi', 'te', 'ml', 'kn', 'en'].includes(appLang) ? appLang : 'en') as SupportedVoiceNavLang);
    }

    // Clean filler words
    let cleanedText = text;
    const fillers = FILLER_WORDS[lang] || [];
    for (const f of fillers) {
      cleanedText = cleanedText.replace(new RegExp(`\\b${f}\\b`, 'gi'), ' ').trim();
    }

    // Match candidate routes in target language + English fallback
    const targetDictionary = VOICE_COMMAND_DICTIONARY[lang] || VOICE_COMMAND_DICTIONARY.en;
    const englishDictionary = VOICE_COMMAND_DICTIONARY.en;

    let bestRouteId: string | null = null;
    let highestScore = 0;
    let matchedPhrase = '';

    const evaluatePhrases = (phrasesList: { routeId: string; phrases: string[] }[]) => {
      for (const item of phrasesList) {
        for (const phrase of item.phrases) {
          const normPhrase = this.normalizeText(phrase);

          // 1. Exact match
          if (cleanedText === normPhrase || text === normPhrase) {
            if (1.0 > highestScore) {
              highestScore = 1.0;
              bestRouteId = item.routeId;
              matchedPhrase = phrase;
            }
            break;
          }

          // 2. Starts with / Ends with / Contains whole phrase
          if (text.includes(normPhrase) || cleanedText.includes(normPhrase)) {
            const score = 0.92;
            if (score > highestScore) {
              highestScore = score;
              bestRouteId = item.routeId;
              matchedPhrase = phrase;
            }
          }

          // 3. Phrase contains the user's primary word(s)
          if (normPhrase.includes(cleanedText) && cleanedText.length >= 4) {
            const score = 0.85;
            if (score > highestScore) {
              highestScore = score;
              bestRouteId = item.routeId;
              matchedPhrase = phrase;
            }
          }

          // 4. Token overlap matching for natural variations
          const textTokens = cleanedText.split(' ').filter((w) => w.length > 2);
          const phraseTokens = normPhrase.split(' ').filter((w) => w.length > 2);

          if (textTokens.length > 0 && phraseTokens.length > 0) {
            const common = textTokens.filter((t) => phraseTokens.includes(t));
            if (common.length >= 2 || (common.length === 1 && (textTokens.length === 1 || phraseTokens.length === 1))) {
              const overlapScore = 0.75 + (common.length / Math.max(textTokens.length, phraseTokens.length)) * 0.15;
              if (overlapScore > highestScore) {
                highestScore = overlapScore;
                bestRouteId = item.routeId;
                matchedPhrase = phrase;
              }
            }
          }
        }
      }
    };

    // First evaluate against selected language
    evaluatePhrases(targetDictionary);

    // If no strong match and language wasn't English, evaluate against English as universal fallback
    if (highestScore < 0.70 && lang !== 'en') {
      evaluatePhrases(englishDictionary);
    }

    if (bestRouteId && highestScore >= 0.70) {
      const route = VOICE_NAVIGATION_ROUTES.find((r) => r.id === bestRouteId);
      if (route) {
        const destName = route.name[lang] || route.name.en;
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
          route,
          confidence: highestScore,
          matchedPhrase,
          detectedLanguage: lang,
          reason: 'matched',
          feedbackText: feedbackMessages[lang] || `✓ Opening ${destName}`,
        };
      }
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
      confidence: highestScore,
      detectedLanguage: lang,
      reason: 'unrecognized_command',
      feedbackText: notUnderstoodMessages[lang] || notUnderstoodMessages.en,
    };
  }
}

export const voiceCommandMatcher = new VoiceCommandMatcher();

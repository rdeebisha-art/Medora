import { ALL_DICTIONARIES, SupportedLanguageCode } from '../../data/languages';

export interface LanguageDetectionResult {
  language: SupportedLanguageCode;
  confidence: number;
  confidenceLevel: 'high' | 'medium' | 'uncertain';
  method: 'explicit' | 'script' | 'keywords' | 'combined' | 'locked';
  detectedScripts: Record<string, number>;
  matchedKeywords: string[];
}

export class LanguageDetectionService {
  private static SCRIPT_RANGES: Record<string, { lang: SupportedLanguageCode; regex: RegExp }> = {
    tamil: { lang: 'ta-IN', regex: /[\u0B80-\u0BFF]/g },
    telugu: { lang: 'te-IN', regex: /[\u0C00-\u0C7F]/g },
    malayalam: { lang: 'ml-IN', regex: /[\u0D00-\u0D7F]/g },
    kannada: { lang: 'kn-IN', regex: /[\u0C80-\u0CFF]/g },
    hindi: { lang: 'hi-IN', regex: /[\u0900-\u097F]/g },
    latin: { lang: 'en-IN', regex: /[a-zA-Z]/g }
  };

  private static TRANSLITERATED_INDIC: Record<SupportedLanguageCode, string[]> = {
    'ta-IN': [
      'vanakkam', 'kaichal', 'kaachal', 'juram', 'thalavali', 'thala vali', 'vayiru vali',
      'udambu vali', 'marunthu', 'mathirai', 'marundhu', 'vali', 'sothanai', 'rathathazhutham',
      'seeni', 'asathiya', 'maruthuvar', 'udambu', 'erichal', 'kashtam', 'udane', 'udhavi'
    ],
    'te-IN': [
      'namaskaram', 'jwaram', 'mandulu', 'mandhu', 'thala noppi', 'thalanoppi', 'kadupu noppi',
      'ontlo baaledu', 'ontlo nallaga', 'raktapotu', 'sugaru', 'vaidhyudu', 'baadha', 'kadupu',
      'cheppandi', 'sahayam', 'aushadham'
    ],
    'ml-IN': [
      'namaskaram', 'pani', 'thala vedhana', 'thalavedhana', 'vayaru vedhana', 'marunnu',
      'gulika', 'rakthasamardham', 'chumma', 'sheenam', 'shwasamuttal', 'vaidyan', 'vedhana',
      'sahayam', 'ashupathri'
    ],
    'kn-IN': [
      'namaskara', 'jwara', 'aushadhi', 'mathre', 'thale novu', 'thalenovu', 'hotte novu',
      'rakthadottada', 'kemmu', 'susthu', 'vaidyaru', 'aarogya', 'sahaya', 'aaspagre'
    ],
    'hi-IN': [
      'namaste', 'namaskar', 'bukhar', 'dard', 'sar dard', 'sardard', 'pet dard', 'petdard',
      'sardi', 'jukaam', 'khansi', 'davai', 'dawa', 'goli', 'raktachaap', 'kamzori', 'ilaj',
      'sehat', 'madad', 'aspataal'
    ],
    'en-IN': [
      'hello', 'hi', 'fever', 'headache', 'pain', 'cough', 'cold', 'stomach', 'medicine',
      'doctor', 'hospital', 'blood pressure', 'sugar', 'emergency', 'help', 'chest', 'vomiting',
      'i have', 'i feel', 'prescription', 'appointment'
    ]
  };

  /**
   * Detects the language from input text using multiple independent signals with strict language locking.
   * @param text The input utterance or transcript
   * @param lockedLanguage Optional currently locked language in conversation state
   * @param preferredLanguage The current application/active language context (never blindly default to English)
   */
  public detectLanguage(
    text: string,
    lockedLanguage?: SupportedLanguageCode,
    preferredLanguage: SupportedLanguageCode = 'en-IN'
  ): LanguageDetectionResult {
    const cleanText = (text || '').trim().toLowerCase();
    const fallback = lockedLanguage || preferredLanguage || 'en-IN';

    if (!cleanText) {
      return {
        language: fallback,
        confidence: 0.85,
        confidenceLevel: 'high',
        method: 'locked',
        detectedScripts: {},
        matchedKeywords: []
      };
    }

    // 1. Check for EXPLICIT user language switch requests (always takes precedence)
    for (const [code, dict] of Object.entries(ALL_DICTIONARIES) as [SupportedLanguageCode, any][]) {
      for (const phrase of dict.explicitSwitchPhrases) {
        if (cleanText.includes(phrase.toLowerCase())) {
          return {
            language: code,
            confidence: 1.0,
            confidenceLevel: 'high',
            method: 'explicit',
            detectedScripts: {},
            matchedKeywords: [phrase]
          };
        }
      }
    }

    // 2. Script character frequency analysis
    const scriptCounts: Record<SupportedLanguageCode, number> = {
      'ta-IN': (cleanText.match(LanguageDetectionService.SCRIPT_RANGES.tamil.regex) || []).length,
      'te-IN': (cleanText.match(LanguageDetectionService.SCRIPT_RANGES.telugu.regex) || []).length,
      'ml-IN': (cleanText.match(LanguageDetectionService.SCRIPT_RANGES.malayalam.regex) || []).length,
      'kn-IN': (cleanText.match(LanguageDetectionService.SCRIPT_RANGES.kannada.regex) || []).length,
      'hi-IN': (cleanText.match(LanguageDetectionService.SCRIPT_RANGES.hindi.regex) || []).length,
      'en-IN': (cleanText.match(LanguageDetectionService.SCRIPT_RANGES.latin.regex) || []).length
    };

    const totalIndicChars = scriptCounts['ta-IN'] + scriptCounts['te-IN'] + scriptCounts['ml-IN'] + scriptCounts['kn-IN'] + scriptCounts['hi-IN'];
    const totalChars = totalIndicChars + scriptCounts['en-IN'];

    // If Indic script characters are present
    if (totalIndicChars > 0) {
      let dominantIndic: SupportedLanguageCode = preferredLanguage !== 'en-IN' ? preferredLanguage : 'ta-IN';
      let maxIndicCount = -1;

      (['ta-IN', 'te-IN', 'ml-IN', 'kn-IN', 'hi-IN'] as SupportedLanguageCode[]).forEach((lang) => {
        if (scriptCounts[lang] > maxIndicCount) {
          maxIndicCount = scriptCounts[lang];
          dominantIndic = lang;
        }
      });

      if (maxIndicCount > 0) {
        if (!lockedLanguage || dominantIndic === lockedLanguage || maxIndicCount >= 3) {
          const ratio = maxIndicCount / Math.max(1, totalChars);
          const confidence = Math.min(0.99, 0.80 + ratio * 0.19);
          return {
            language: dominantIndic,
            confidence,
            confidenceLevel: 'high',
            method: 'script',
            detectedScripts: scriptCounts,
            matchedKeywords: []
          };
        }
      }
    }

    // 3. Check transliterated Indic phonetics in Latin alphabet
    for (const [langCode, phrases] of Object.entries(LanguageDetectionService.TRANSLITERATED_INDIC) as [SupportedLanguageCode, string[]][]) {
      if (langCode === 'en-IN') continue;
      for (const phrase of phrases) {
        if (cleanText.includes(phrase)) {
          return {
            language: langCode,
            confidence: 0.90,
            confidenceLevel: 'high',
            method: 'keywords',
            detectedScripts: scriptCounts,
            matchedKeywords: [phrase]
          };
        }
      }
    }

    // 4. STRICT LANGUAGE LOCKING:
    if (lockedLanguage) {
      const lockedDict = ALL_DICTIONARIES[lockedLanguage];
      const matchedLocked: string[] = [];
      if (lockedDict) {
        lockedDict.commonWords.forEach((w: string) => {
          if (cleanText.includes(w.toLowerCase())) matchedLocked.push(w);
        });
        Object.values(lockedDict.healthcareTerms).forEach((terms: any) => {
          if (Array.isArray(terms)) {
            terms.forEach((t: string) => {
              if (cleanText.includes(t.toLowerCase())) matchedLocked.push(t);
            });
          }
        });
      }

      return {
        language: lockedLanguage,
        confidence: 0.95,
        confidenceLevel: 'high',
        method: 'locked',
        detectedScripts: scriptCounts,
        matchedKeywords: matchedLocked
      };
    }

    // 5. Keyword / Vocabulary matching against local healthcare dictionaries
    const langScores: Record<SupportedLanguageCode, number> = {
      'ta-IN': 0,
      'te-IN': 0,
      'ml-IN': 0,
      'kn-IN': 0,
      'hi-IN': 0,
      'en-IN': 0
    };
    const matchedWordsByLang: Record<SupportedLanguageCode, string[]> = {
      'ta-IN': [],
      'te-IN': [],
      'ml-IN': [],
      'kn-IN': [],
      'hi-IN': [],
      'en-IN': []
    };

    const tokens = cleanText.split(/[\s,?.!;:()"]+/).filter((t) => t.length > 1);

    for (const [langCode, dict] of Object.entries(ALL_DICTIONARIES) as [SupportedLanguageCode, any][]) {
      dict.commonWords.forEach((word: string) => {
        const wLower = word.toLowerCase();
        if (tokens.includes(wLower) || cleanText.includes(wLower)) {
          langScores[langCode] += 2;
          matchedWordsByLang[langCode].push(wLower);
        }
      });

      Object.values(dict.healthcareTerms).forEach((terms: any) => {
        if (Array.isArray(terms)) {
          terms.forEach((term: string) => {
            const tLower = term.toLowerCase();
            if (tokens.includes(tLower) || cleanText.includes(tLower)) {
              langScores[langCode] += 3;
              matchedWordsByLang[langCode].push(tLower);
            }
          });
        }
      });
    }

    let bestLang: SupportedLanguageCode = fallback;
    let highestScore = 0;

    for (const [code, score] of Object.entries(langScores) as [SupportedLanguageCode, number][]) {
      if (score > highestScore) {
        highestScore = score;
        bestLang = code;
      }
    }

    if (highestScore >= 6) {
      return {
        language: bestLang,
        confidence: 0.92,
        confidenceLevel: 'high',
        method: 'combined',
        detectedScripts: scriptCounts,
        matchedKeywords: matchedWordsByLang[bestLang]
      };
    } else if (highestScore >= 2) {
      return {
        language: bestLang,
        confidence: 0.78,
        confidenceLevel: 'medium',
        method: 'keywords',
        detectedScripts: scriptCounts,
        matchedKeywords: matchedWordsByLang[bestLang]
      };
    }

    // 6. Explicit English validation: Only claim English if unambiguous English tokens are present
    const englishTokens = ['the', 'this', 'that', 'with', 'from', 'have', 'feel', 'pain', 'headache', 'fever', 'doctor', 'medicine', 'hospital', 'help', 'emergency'];
    const matchedEnglish = tokens.filter((tok) => englishTokens.includes(tok));

    if (matchedEnglish.length >= 1 && preferredLanguage === 'en-IN') {
      return {
        language: 'en-IN',
        confidence: 0.90,
        confidenceLevel: 'high',
        method: 'combined',
        detectedScripts: scriptCounts,
        matchedKeywords: matchedEnglish
      };
    }

    // 7. Context preservation: If user is in an Indic session/UI, preserve their language
    if (preferredLanguage !== 'en-IN') {
      return {
        language: preferredLanguage,
        confidence: 0.85,
        confidenceLevel: 'high',
        method: 'combined',
        detectedScripts: scriptCounts,
        matchedKeywords: []
      };
    }

    // Fallback to English only when application is explicitly in English
    return {
      language: 'en-IN',
      confidence: 0.70,
      confidenceLevel: 'medium',
      method: 'combined',
      detectedScripts: scriptCounts,
      matchedKeywords: []
    };
  }
}

export const languageDetectionService = new LanguageDetectionService();

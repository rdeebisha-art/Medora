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
    latin: { lang: 'en-IN', regex: /[a-zA-Z]/g }
  };

  /**
   * Detects the language from input text using multiple independent signals.
   * @param text The input utterance or transcript
   * @param lockedLanguage Optional currently locked language in conversation state
   */
  public detectLanguage(text: string, lockedLanguage?: SupportedLanguageCode): LanguageDetectionResult {
    const cleanText = (text || '').trim().toLowerCase();
    if (!cleanText) {
      const fallback = lockedLanguage || 'en-IN';
      return {
        language: fallback,
        confidence: 0.5,
        confidenceLevel: 'uncertain',
        method: 'locked',
        detectedScripts: {},
        matchedKeywords: []
      };
    }

    // 1. Check for EXPLICIT user language switch requests
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
      'en-IN': (cleanText.match(LanguageDetectionService.SCRIPT_RANGES.latin.regex) || []).length
    };

    const totalIndicChars = scriptCounts['ta-IN'] + scriptCounts['te-IN'] + scriptCounts['ml-IN'] + scriptCounts['kn-IN'];
    const totalChars = totalIndicChars + scriptCounts['en-IN'];

    // If Indic script characters are overwhelmingly present
    if (totalIndicChars > 0) {
      let dominantIndic: SupportedLanguageCode = 'ta-IN';
      let maxIndicCount = -1;

      (['ta-IN', 'te-IN', 'ml-IN', 'kn-IN'] as SupportedLanguageCode[]).forEach((lang) => {
        if (scriptCounts[lang] > maxIndicCount) {
          maxIndicCount = scriptCounts[lang];
          dominantIndic = lang;
        }
      });

      if (maxIndicCount > 0) {
        const ratio = maxIndicCount / Math.max(1, totalChars);
        const confidence = Math.min(0.98, 0.70 + ratio * 0.28);
        return {
          language: dominantIndic,
          confidence,
          confidenceLevel: confidence >= 0.85 ? 'high' : 'medium',
          method: 'script',
          detectedScripts: scriptCounts,
          matchedKeywords: []
        };
      }
    }

    // 3. Keyword / Vocabulary matching against local healthcare dictionaries
    const langScores: Record<SupportedLanguageCode, number> = {
      'ta-IN': 0,
      'te-IN': 0,
      'ml-IN': 0,
      'kn-IN': 0,
      'en-IN': 0
    };
    const matchedWordsByLang: Record<SupportedLanguageCode, string[]> = {
      'ta-IN': [],
      'te-IN': [],
      'ml-IN': [],
      'kn-IN': [],
      'en-IN': []
    };

    // Tokenize text into words
    const tokens = cleanText.split(/[\s,?.!;:()"]+/).filter((t) => t.length > 1);

    for (const [langCode, dict] of Object.entries(ALL_DICTIONARIES) as [SupportedLanguageCode, any][]) {
      // Check common words
      dict.commonWords.forEach((word: string) => {
        const wLower = word.toLowerCase();
        if (tokens.includes(wLower) || cleanText.includes(wLower)) {
          langScores[langCode] += 2;
          matchedWordsByLang[langCode].push(wLower);
        }
      });

      // Check healthcare vocabulary
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

    // Determine highest scoring language
    let bestLang: SupportedLanguageCode = lockedLanguage || 'en-IN';
    let highestScore = 0;

    for (const [code, score] of Object.entries(langScores) as [SupportedLanguageCode, number][]) {
      if (score > highestScore) {
        highestScore = score;
        bestLang = code;
      }
    }

    // 4. Handle Mixed-Language Logic:
    // If user has a locked Indic language and says a mixed English word (e.g. "fever", "sugar"), retain Indic language!
    if (lockedLanguage && lockedLanguage !== 'en-IN' && bestLang === 'en-IN') {
      const englishMedicalLoanwords = ['fever', 'cough', 'cold', 'pain', 'bp', 'sugar', 'doctor', 'tablet', 'medicine', 'hospital', 'baby'];
      const isJustLoanwords = tokens.every(
        (token) => englishMedicalLoanwords.includes(token) || ['my', 'has', 'i', 'the', 'is'].includes(token)
      );
      if (!isJustLoanwords || langScores[lockedLanguage] > 0) {
        bestLang = lockedLanguage;
        highestScore += 2;
      }
    }

    // Calculate final confidence
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
        confidence: 0.75,
        confidenceLevel: 'medium',
        method: 'keywords',
        detectedScripts: scriptCounts,
        matchedKeywords: matchedWordsByLang[bestLang]
      };
    }

    // If script is pure Latin and no specific Indic keywords matched
    if (scriptCounts['en-IN'] > 3 && totalIndicChars === 0 && !lockedLanguage) {
      return {
        language: 'en-IN',
        confidence: 0.88,
        confidenceLevel: 'high',
        method: 'script',
        detectedScripts: scriptCounts,
        matchedKeywords: []
      };
    }

    // Fallback to locked language or uncertain
    const fallbackLang = lockedLanguage || 'en-IN';
    return {
      language: fallbackLang,
      confidence: lockedLanguage ? 0.70 : 0.50,
      confidenceLevel: lockedLanguage ? 'medium' : 'uncertain',
      method: lockedLanguage ? 'locked' : 'combined',
      detectedScripts: scriptCounts,
      matchedKeywords: []
    };
  }
}

export const languageDetectionService = new LanguageDetectionService();

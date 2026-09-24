import { SupportedLanguageCode, ALL_DICTIONARIES } from '../../data/languages';
import { MULTILINGUAL_HEALTHCARE_VOCABULARY } from '../../data/languages/multilingualHealthcareVocabulary';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';
export type LanguageDetectionSource =
  | 'USER_SELECTED'
  | 'SCRIPT_DETECTION'
  | 'PHRASE_DETECTION'
  | 'VOICE_RECOGNITION'
  | 'CONVERSATION_CONTEXT'
  | 'FALLBACK';

export interface MultilingualIdentificationResult {
  detectedLanguage: SupportedLanguageCode;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  source: LanguageDetectionSource;
  isLocked: boolean;
  dominantScript: string;
  detectedScripts: Record<string, number>;
  matchedKeywords: string[];
}

export class MultilingualLanguageIdentifier {
  private static SCRIPT_PATTERNS = {
    tamil: /[\u0B80-\u0BFF]/g,
    telugu: /[\u0C00-\u0C7F]/g,
    malayalam: /[\u0D00-\u0D7F]/g,
    kannada: /[\u0C80-\u0CFF]/g,
    hindi: /[\u0900-\u097F]/g,
    latin: /[a-zA-Z]/g
  };

  private static EXPLICIT_LANGUAGE_SWITCHES: Record<SupportedLanguageCode, string[]> = {
    'ta-IN': [
      'தமிழ்', 'தமிழில் பேசு', 'தமிழில் சொல்லு', 'தமிழில் பேசுங்கள்', 'தமிழ் பேசு', 'speak in tamil', 'switch to tamil'
    ],
    'te-IN': [
      'తెలుగు', 'తెలుగులో మాట్లాడు', 'తెలుగులో చెప్పు', 'తెలుగులో చెప్పండి', 'speak in telugu', 'switch to telugu'
    ],
    'ml-IN': [
      'മലയാളം', 'മലയാളത്തിൽ സംസാരിക്കൂ', 'മലയാളത്തിൽ പറയൂ', 'മലയാളം പറയൂ', 'speak in malayalam', 'switch to malayalam'
    ],
    'kn-IN': [
      'ಕನ್ನಡ', 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ', 'ಕನ್ನಡದಲ್ಲಿ ಹೇಳಿ', 'ಕನ್ನಡ ಬಳಸಿ', 'speak in kannada', 'switch to kannada'
    ],
    'hi-IN': [
      'हिंदी', 'हिन्दी', 'हिंदी में बात करो', 'हिंदी में बोलो', 'हिंदी में बताएं', 'speak in hindi', 'switch to hindi'
    ],
    'en-IN': [
      'english', 'speak in english', 'switch to english', 'talk in english', 'in english'
    ]
  };

  private static TRANSLITERATED_INDIC: Record<SupportedLanguageCode, string[]> = {
    'ta-IN': [
      'enakku', 'kaichal', 'kaachal', 'irukku', 'irukkirathu', 'ullathu', 'thalavali', 'thala vali',
      'vayiru vali', 'marunthu', 'mathirai', 'marundhu', 'kuzhandhai', 'udambu', 'rathathazhutham',
      'seeni', 'valikuthu', 'maruthuvar', 'aaspathiri', 'mudiyala', 'doctor kitta', 'kashtam'
    ],
    'te-IN': [
      'naaku', 'jwaram', 'undi', 'talanoppi', 'thala noppi', 'kadupunoppi', 'kadupu noppi',
      'mandulu', 'mandhu', 'raktapotu', 'sugaru', 'vaidhyudu', 'pillalu', 'baaledu', 'ontlo'
    ],
    'ml-IN': [
      'enikku', 'pani', 'undu', 'thalavedhana', 'thala vedhana', 'vayaru vedhana', 'marunnu',
      'gulika', 'rakthasamardham', 'shwasamuttal', 'vaidyan', 'aashupathri', 'kunjin'
    ],
    'kn-IN': [
      'nanage', 'jwara', 'ide', 'thalenovu', 'thale novu', 'hottenovu', 'hotte novu',
      'aushadhi', 'mathre', 'rakthadottada', 'kemmu', 'vaidyaru', 'aaspathre', 'makkalu'
    ],
    'hi-IN': [
      'mujhe', 'bukhar', 'hai', 'dard', 'sar dard', 'sardard', 'pet dard', 'petdard',
      'sardi', 'jukaam', 'khansi', 'dawa', 'davai', 'goli', 'raktachaap', 'kamzori', 'aspataal'
    ],
    'en-IN': [
      'i have', 'i feel', 'my', 'headache', 'fever', 'cough', 'cold', 'stomach', 'pain',
      'difficulty breathing', 'chest pain', 'medicine', 'doctor', 'hospital'
    ]
  };

  /**
   * Identifies the language of user input.
   * Priority:
   * 1. Explicit user language switch command -> HIGH confidence (1.0)
   * 2. Indic script detection (including code-switching like "எனக்கு fever இருக்கு") -> HIGH confidence (0.95)
   * 3. Locked language consistency -> HIGH confidence
   * 4. Transliterated Indic phrases in Latin script -> HIGH / MEDIUM confidence
   * 5. Unambiguous English phrases (e.g. "I have had fever for three days") -> HIGH confidence
   * 6. Selected language priority fallback -> If ambiguous or single loanword (e.g. "fever", "BP"), NEVER switch to English if user selected an Indic language!
   */
  public identifyLanguage(
    text: string,
    selectedLanguage: SupportedLanguageCode = 'en-IN',
    isLocked = false,
    currentLockedLanguage?: SupportedLanguageCode
  ): MultilingualIdentificationResult {
    const raw = (text || '').trim();
    const clean = raw.toLowerCase();

    if (!clean) {
      return {
        detectedLanguage: selectedLanguage,
        confidence: 0.90,
        confidenceLevel: 'high',
        source: 'USER_SELECTED',
        isLocked,
        dominantScript: 'none',
        detectedScripts: {},
        matchedKeywords: []
      };
    }

    // 1. Check for EXPLICIT user language switch requests
    for (const [code, phrases] of Object.entries(MultilingualLanguageIdentifier.EXPLICIT_LANGUAGE_SWITCHES) as [SupportedLanguageCode, string[]][]) {
      for (const phrase of phrases) {
        if (clean === phrase.toLowerCase() || clean.startsWith(phrase.toLowerCase() + ' ') || clean.endsWith(' ' + phrase.toLowerCase())) {
          return {
            detectedLanguage: code,
            confidence: 1.0,
            confidenceLevel: 'high',
            source: 'PHRASE_DETECTION',
            isLocked: true,
            dominantScript: 'explicit',
            detectedScripts: {},
            matchedKeywords: [phrase]
          };
        }
      }
    }

    // 2. SCRIPT DETECTION via Unicode ranges
    const scriptCounts = {
      tamil: (raw.match(MultilingualLanguageIdentifier.SCRIPT_PATTERNS.tamil) || []).length,
      telugu: (raw.match(MultilingualLanguageIdentifier.SCRIPT_PATTERNS.telugu) || []).length,
      malayalam: (raw.match(MultilingualLanguageIdentifier.SCRIPT_PATTERNS.malayalam) || []).length,
      kannada: (raw.match(MultilingualLanguageIdentifier.SCRIPT_PATTERNS.kannada) || []).length,
      hindi: (raw.match(MultilingualLanguageIdentifier.SCRIPT_PATTERNS.hindi) || []).length,
      latin: (raw.match(MultilingualLanguageIdentifier.SCRIPT_PATTERNS.latin) || []).length
    };

    const indicCounts: Record<SupportedLanguageCode, number> = {
      'ta-IN': scriptCounts.tamil,
      'te-IN': scriptCounts.telugu,
      'ml-IN': scriptCounts.malayalam,
      'kn-IN': scriptCounts.kannada,
      'hi-IN': scriptCounts.hindi,
      'en-IN': 0
    };

    const totalIndicChars =
      scriptCounts.tamil +
      scriptCounts.telugu +
      scriptCounts.malayalam +
      scriptCounts.kannada +
      scriptCounts.hindi;

    // CODE-SWITCHING & DOMINANT INDIC SCRIPT CHECK
    if (totalIndicChars > 0) {
      let dominantLang: SupportedLanguageCode = 'ta-IN';
      let maxCount = -1;

      (['ta-IN', 'te-IN', 'ml-IN', 'kn-IN', 'hi-IN'] as SupportedLanguageCode[]).forEach((lang) => {
        if (indicCounts[lang] > maxCount) {
          maxCount = indicCounts[lang];
          dominantLang = lang;
        }
      });

      // Even if there are Latin characters (e.g. "எனக்கு fever இருக்கு" or "నాకు sugar ఉంది"),
      // the Indic script dictates the language identity!
      if (maxCount >= 2) {
        return {
          detectedLanguage: dominantLang,
          confidence: 0.98,
          confidenceLevel: 'high',
          source: 'SCRIPT_DETECTION',
          isLocked: true,
          dominantScript: dominantLang.slice(0, 2),
          detectedScripts: scriptCounts,
          matchedKeywords: []
        };
      }
    }

    // 3. Transliterated Indic vocabulary check
    for (const [langCode, phrases] of Object.entries(MultilingualLanguageIdentifier.TRANSLITERATED_INDIC) as [SupportedLanguageCode, string[]][]) {
      if (langCode === 'en-IN') continue;
      const matched: string[] = [];
      for (const phrase of phrases) {
        if (typeof phrase === 'string' && clean.includes(phrase)) {
          matched.push(phrase);
        }
      }
      if (matched.length >= 1) {
        return {
          detectedLanguage: langCode,
          confidence: matched.length >= 2 ? 0.92 : 0.85,
          confidenceLevel: 'high',
          source: 'PHRASE_DETECTION',
          isLocked: true,
          dominantScript: 'transliterated',
          detectedScripts: scriptCounts,
          matchedKeywords: matched
        };
      }
    }

    // 4. Vocabulary checks across comprehensive 35-category healthcare dictionary
    const vocabScores: Record<SupportedLanguageCode, number> = {
      'ta-IN': 0,
      'te-IN': 0,
      'ml-IN': 0,
      'kn-IN': 0,
      'hi-IN': 0,
      'en-IN': 0
    };
    const vocabMatches: Record<SupportedLanguageCode, string[]> = {
      'ta-IN': [],
      'te-IN': [],
      'ml-IN': [],
      'kn-IN': [],
      'hi-IN': [],
      'en-IN': []
    };

    Object.values(MULTILINGUAL_HEALTHCARE_VOCABULARY).forEach((catMap) => {
      (Object.entries(catMap) as [SupportedLanguageCode, { terms: string[]; transliterations?: string[] }][]).forEach(([lang, vocab]) => {
        vocab.terms.forEach((term) => {
          if (clean.includes(term.toLowerCase())) {
            vocabScores[lang] += 3;
            vocabMatches[lang].push(term);
          }
        });
        if (vocab.transliterations) {
          vocab.transliterations.forEach((trans) => {
            if (clean.includes(trans.toLowerCase())) {
              vocabScores[lang] += 2;
              vocabMatches[lang].push(trans);
            }
          });
        }
      });
    });

    let bestLang: SupportedLanguageCode = selectedLanguage;
    let highestScore = 0;
    (Object.entries(vocabScores) as [SupportedLanguageCode, number][]).forEach(([lang, score]) => {
      if (score > highestScore) {
        highestScore = score;
        bestLang = lang;
      }
    });

    // If strong Indic vocabulary match
    if (highestScore >= 3 && bestLang !== 'en-IN') {
      return {
        detectedLanguage: bestLang,
        confidence: 0.90,
        confidenceLevel: 'high',
        source: 'PHRASE_DETECTION',
        isLocked: true,
        dominantScript: bestLang.slice(0, 2),
        detectedScripts: scriptCounts,
        matchedKeywords: vocabMatches[bestLang]
      };
    }

    // 5. Explicit English sentence check
    // Unambiguous English phrases (require full English structure, not just isolated loanwords like "fever" or "BP")
    const englishSentenceMarkers = [
      'i have', 'i feel', 'my head', 'my stomach', 'i am suffering', 'for three days', 'for 3 days',
      'since yesterday', 'since morning', 'what should i do', 'can you help', 'severe pain',
      'please help', 'i need a doctor', 'medicine for', 'how to treat'
    ];

    const hasEnglishSentenceStructure = englishSentenceMarkers.some((marker) => clean.includes(marker));
    const pureEnglishWords = clean.split(/[\s,?.!;:()"]+/).filter((w) => w.length > 2);
    const standardEnglishTokens = ['the', 'this', 'that', 'with', 'from', 'have', 'feel', 'days', 'since', 'cannot', 'breathe', 'head', 'chest'];
    const englishGrammarCount = pureEnglishWords.filter((w) => standardEnglishTokens.includes(w)).length;

    if (hasEnglishSentenceStructure || (englishGrammarCount >= 2 && selectedLanguage === 'en-IN')) {
      return {
        detectedLanguage: 'en-IN',
        confidence: 0.95,
        confidenceLevel: 'high',
        source: 'SCRIPT_DETECTION',
        isLocked: true,
        dominantScript: 'latin',
        detectedScripts: scriptCounts,
        matchedKeywords: pureEnglishWords.slice(0, 5)
      };
    }

    // 6. Locked language preservation
    if (isLocked && currentLockedLanguage) {
      return {
        detectedLanguage: currentLockedLanguage,
        confidence: 0.90,
        confidenceLevel: 'high',
        source: 'CONVERSATION_CONTEXT',
        isLocked: true,
        dominantScript: 'locked',
        detectedScripts: scriptCounts,
        matchedKeywords: []
      };
    }

    // 7. SELECTED LANGUAGE PRIORITY (PHASE 13 & 12)
    // If the input was short or only had an English loanword (e.g., "fever", "BP", "tablet", "sugar"),
    // and the user has selected an Indic language (e.g. Tamil or Telugu):
    // DO NOT switch to English! Use the selected language with MEDIUM or LOW confidence.
    if (selectedLanguage !== 'en-IN') {
      return {
        detectedLanguage: selectedLanguage,
        confidence: 0.80,
        confidenceLevel: 'medium',
        source: 'USER_SELECTED',
        isLocked: false,
        dominantScript: 'selected',
        detectedScripts: scriptCounts,
        matchedKeywords: []
      };
    }

    // Fallback when user selected English
    return {
      detectedLanguage: 'en-IN',
      confidence: 0.75,
      confidenceLevel: 'medium',
      source: 'FALLBACK',
      isLocked: false,
      dominantScript: 'latin',
      detectedScripts: scriptCounts,
      matchedKeywords: []
    };
  }
}

export const multilingualLanguageIdentifier = new MultilingualLanguageIdentifier();

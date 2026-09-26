import { MEDICAL_PHRASE_LIBRARY } from '../../data/languageBridge/phraseLibrary';
import {
  BridgeLang,
  BridgeTranslationResult,
  MedicalPhrase,
  TranslationConfidence,
  CanonicalTranslationStatus,
} from '../../data/languageBridge/types';
import { SupportedLanguageCode } from '../../data/languages';
import { languageDetectionService } from '../voice/languageDetectionService';
import { intentClassifier } from '../voice/intentClassifier';
import { toBridgeLang, toSupportedLang } from './langMap';
import { extractProtectedTokens, restoreProtectedTokens } from './tokenPreserver';
import {
  protectMedicalValues,
  restoreMedicalValues,
  validatePreservedMedicalValues,
} from '../medicalSafety/medicalValueProtection';

function normalize(text: string): string {
  return text
    .trim()
    .replace(/[“”"']/g, '')
    .replace(/[?.!,;।]+$/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function phraseTexts(phrase: MedicalPhrase, lang: BridgeLang): string[] {
  return [phrase.texts[lang], ...(phrase.aliases?.[lang] || [])].filter(Boolean);
}

function findBestPhrase(sourceText: string, sourceLang: BridgeLang): MedicalPhrase | null {
  const normalized = normalize(sourceText);
  if (!normalized) return null;

  let best: { phrase: MedicalPhrase; score: number } | null = null;

  for (const phrase of MEDICAL_PHRASE_LIBRARY) {
    for (const candidate of phraseTexts(phrase, sourceLang)) {
      const n = normalize(candidate);
      if (!n) continue;
      if (normalized === n) {
        return phrase;
      }
      if (normalized.includes(n) || n.includes(normalized)) {
        const score = Math.min(normalized.length, n.length) / Math.max(normalized.length, n.length);
        if (!best || score > best.score) best = { phrase, score };
      }
    }
  }

  if (best && best.score >= 0.70) return best.phrase;
  return null;
}

function findPhraseAnyLanguage(sourceText: string): { phrase: MedicalPhrase; lang: BridgeLang } | null {
  const langs: BridgeLang[] = ['ta', 'te', 'ml', 'kn', 'hi', 'en'];
  for (const lang of langs) {
    const phrase = findBestPhrase(sourceText, lang);
    if (phrase) return { phrase, lang };
  }
  return null;
}

// Multilingual Medical Vocabulary Mappings for Offline Fallback
interface VocabItem {
  en: string;
  ta: string;
  te: string;
  hi: string;
  ml: string;
  kn: string;
}

const MEDICAL_VOCAB_MAP: Record<string, VocabItem> = {
  fever: {
    en: 'fever',
    ta: 'காய்ச்சல்',
    te: 'జ్వరం',
    hi: 'बुखार',
    ml: 'പനി',
    kn: 'ಜ್ವರ',
  },
  cough: {
    en: 'cough',
    ta: 'இருமல்',
    te: 'దగ్గు',
    hi: 'खांसी',
    ml: 'ചുമ',
    kn: 'ಕೆಮ್ಮು',
  },
  cold: {
    en: 'cold',
    ta: 'சளி',
    te: 'జలుబు',
    hi: 'जुकाम',
    ml: 'ജലദോഷം',
    kn: 'ಶೀತ',
  },
  headache: {
    en: 'headache',
    ta: 'தலைவலி',
    te: 'తలనొప్పి',
    hi: 'सिरदर्द',
    ml: 'തലവേദന',
    kn: 'ತಲೆನೋವು',
  },
  stomach_pain: {
    en: 'stomach pain',
    ta: 'வயிற்று வலி',
    te: 'కడుపు నొప్పి',
    hi: 'पेट दर्द',
    ml: 'വയറുവേദന',
    kn: 'ಹೊಟ್ಟೆ ನೋವು',
  },
  chest_pain: {
    en: 'chest pain',
    ta: 'நெஞ்சு வலி',
    te: 'ఛాతీ నొప్పి',
    hi: 'सीने में दर्द',
    ml: 'നെഞ്ചുവേദന',
    kn: 'ಎದೆ ನೋವು',
  },
  vomiting: {
    en: 'vomiting',
    ta: 'வாந்தி',
    te: 'వాంతులు',
    hi: 'उल्टी',
    ml: 'ഛർദ്ദി',
    kn: 'ವಾಂತಿ',
  },
  diarrhea: {
    en: 'diarrhea',
    ta: 'வயிற்றுப்போக்கு',
    te: 'విరేచనాలు',
    hi: 'दस्त',
    ml: 'വയറിളക്കം',
    kn: 'ಭೇದಿ',
  },
  breathing_difficulty: {
    en: 'difficulty breathing',
    ta: 'மூச்சுத்திணறல்',
    te: 'శ్వాస తీసుకోవడంలో ఇబ్బంది',
    hi: 'सांस लेने में कठिनाई',
    ml: 'ശ്വാസതടസ്സം',
    kn: 'ಉಸಿರಾಟದ ತೊಂದರೆ',
  },
};

/**
 * Synchronous local healthcare text translation engine.
 * 100% offline-compatible using local medical phrase library and clinical dictionary.
 */
export function translateHealthcareText(
  originalText: string,
  sourceLang: SupportedLanguageCode,
  targetLang: SupportedLanguageCode
): BridgeTranslationResult {
  const original = originalText.trim();
  const source = toBridgeLang(sourceLang);
  const target = toBridgeLang(targetLang);

  const { masked, tokens } = extractProtectedTokens(original);
  const { values: medValues } = protectMedicalValues(original);

  const intent = intentClassifier.classifyIntent(original, sourceLang);
  const isEmergency = intent.isEmergency;
  const isCritical =
    isEmergency ||
    /allerg|pregnant|dosage|chest|bleed|breath|மூச்சு|ஒவ்வாமை|கர்ப்ப|రక్తం|గుండె|सांस|दमा/i.test(original);

  // 1. Same Language check
  if (source === target) {
    return {
      originalLanguage: sourceLang,
      originalText: original,
      translatedLanguage: targetLang,
      translatedText: original,
      translationConfidence: 'HIGH',
      translationStatus: 'TRANSLATED',
      engine: 'same-language',
      preservedTokens: tokens,
      emergencyIntent: isEmergency ? intent.intent : undefined,
      isEmergency,
      isCritical,
      isAppointment: false,
      needsConfirmation: false,
    };
  }

  // 2. Direct / Masked phrase match in MEDICAL_PHRASE_LIBRARY
  let phrase = findBestPhrase(masked, source) || findBestPhrase(original, source);
  let matchedFrom = source;
  if (!phrase) {
    const any = findPhraseAnyLanguage(masked) || findPhraseAnyLanguage(original);
    if (any) {
      phrase = any.phrase;
      matchedFrom = any.lang;
    }
  }

  if (phrase) {
    const translatedRaw = phrase.texts[target] || phrase.texts.en;
    let translatedText = restoreProtectedTokens(translatedRaw, tokens);
    translatedText = restoreMedicalValues(translatedText, medValues);

    // Validate that critical medical numbers were preserved
    const valCheck = validatePreservedMedicalValues(original, translatedText);
    const confidence: TranslationConfidence =
      valCheck.isValid && matchedFrom === source ? 'HIGH' : 'MEDIUM';

    const status: CanonicalTranslationStatus = valCheck.isValid
      ? 'TRANSLATED'
      : 'NEEDS_CONFIRMATION';

    return {
      originalLanguage: sourceLang,
      originalText: original,
      translatedLanguage: targetLang,
      translatedText,
      translationConfidence: confidence,
      translationStatus: status,
      engine: 'local-phrase',
      preservedTokens: tokens,
      emergencyIntent: phrase.emergency || isEmergency ? intent.intent || 'BREATHING_DIFFICULTY' : undefined,
      isEmergency: Boolean(phrase.emergency || isEmergency),
      isCritical: Boolean(phrase.critical || isCritical),
      isAppointment: Boolean(phrase.appointment),
      matchedPhraseId: phrase.id,
      needsConfirmation: !valCheck.isValid || confidence !== 'HIGH' || Boolean(phrase.critical || phrase.emergency),
      displayNotice: valCheck.isValid ? undefined : 'Translation needs confirmation.',
    };
  }

  // 3. Clinical Vocabulary / Pattern match (Offline)
  const norm = normalize(original);
  for (const [key, vocab] of Object.entries(MEDICAL_VOCAB_MAP)) {
    const sourceTerm = vocab[source];
    if (sourceTerm && norm.includes(normalize(sourceTerm))) {
      const targetTerm = vocab[target] || vocab.en;

      // Extract duration if present
      const durationMatch = original.match(/(\d+)\s*(?:days?|weeks?|months?|hours?|நாட்கள்|நாட்களாக|రోజులు|दिन|ദിവസം|ದಿನ)/i);
      const numDays = durationMatch ? durationMatch[1] : null;

      let translatedText = '';
      if (target === 'en') {
        translatedText = numDays
          ? `I have had a ${targetTerm} for ${numDays} days.`
          : `I have ${targetTerm}.`;
      } else if (target === 'ta') {
        translatedText = numDays
          ? `எனக்கு ${numDays} நாட்களாக ${targetTerm} இருக்கிறது.`
          : `எனக்கு ${targetTerm} இருக்கிறது.`;
      } else if (target === 'te') {
        translatedText = numDays
          ? `నాకు ${numDays} రోజులుగా ${targetTerm} ఉంది.`
          : `నాకు ${targetTerm} ఉంది.`;
      } else if (target === 'hi') {
        translatedText = numDays
          ? `मुझे ${numDays} दिनों से ${targetTerm} है।`
          : `मुझे ${targetTerm} है।`;
      } else if (target === 'ml') {
        translatedText = numDays
          ? `എനിക്ക് ${numDays} ദിവസമായി ${targetTerm} ഉണ്ട്.`
          : `എനിക്ക് ${targetTerm} ഉണ്ട്.`;
      } else if (target === 'kn') {
        translatedText = numDays
          ? `ನನಗೆ ${numDays} ದಿನಗಳಿಂದ ${targetTerm} ಇದೆ.`
          : `ನನಗೆ ${targetTerm} ಇದೆ.`;
      }

      if (translatedText) {
        translatedText = restoreMedicalValues(translatedText, medValues);
        const valCheck = validatePreservedMedicalValues(original, translatedText);
        return {
          originalLanguage: sourceLang,
          originalText: original,
          translatedLanguage: targetLang,
          translatedText,
          translationConfidence: valCheck.isValid ? 'HIGH' : 'MEDIUM',
          translationStatus: valCheck.isValid ? 'TRANSLATED' : 'NEEDS_CONFIRMATION',
          engine: 'clinical-dictionary',
          preservedTokens: tokens,
          emergencyIntent: isEmergency ? intent.intent : undefined,
          isEmergency,
          isCritical,
          isAppointment: false,
          needsConfirmation: !valCheck.isValid,
          displayNotice: valCheck.isValid ? undefined : 'Translation needs confirmation.',
        };
      }
    }
  }

  // 4. If completely unsupported locally:
  // CRITICAL RULE: NEVER return original text and label it as translated!
  return {
    originalLanguage: sourceLang,
    originalText: original,
    translatedLanguage: targetLang,
    translatedText: '', // NEVER echo source text!
    translationConfidence: 'LOW',
    translationStatus: 'UNSUPPORTED',
    engine: 'unsupported',
    preservedTokens: tokens,
    emergencyIntent: isEmergency ? intent.intent : undefined,
    isEmergency,
    isCritical,
    isAppointment: false,
    needsConfirmation: true,
    displayNotice: 'Advanced translation unavailable offline. Please confirm with clinician.',
  };
}

/**
 * Asynchronous translation engine.
 * First evaluates high-confidence local phrase matching;
 * if unavailable, calls server-side AI translation service (/api/translate)
 * and strictly validates medical value preservation.
 */
export async function translateHealthcareTextAsync(
  originalText: string,
  sourceLang: SupportedLanguageCode,
  targetLang: SupportedLanguageCode
): Promise<BridgeTranslationResult> {
  const localResult = translateHealthcareText(originalText, sourceLang, targetLang);

  // If local match is high confidence or same language, return immediately
  if (localResult.translationStatus === 'TRANSLATED' && localResult.translationConfidence === 'HIGH') {
    return localResult;
  }

  // If online, call server translation endpoint
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const targetShort = toBridgeLang(targetLang);
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: [originalText],
          language: targetShort,
          sourceLanguage: toBridgeLang(sourceLang),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const translatedRaw = Array.isArray(data.translations) ? data.translations[0] : null;

        if (translatedRaw && typeof translatedRaw === 'string' && translatedRaw.trim() && translatedRaw.trim() !== originalText.trim()) {
          // Validate number & medicine preservation
          const valCheck = validatePreservedMedicalValues(originalText, translatedRaw);
          const status: CanonicalTranslationStatus = valCheck.isValid
            ? 'TRANSLATED'
            : 'NEEDS_CONFIRMATION';

          return {
            originalLanguage: sourceLang,
            originalText,
            translatedLanguage: targetLang,
            translatedText: translatedRaw.trim(),
            translationConfidence: valCheck.isValid ? 'HIGH' : 'MEDIUM',
            translationStatus: status,
            engine: 'online-model',
            preservedTokens: localResult.preservedTokens,
            isEmergency: localResult.isEmergency,
            isCritical: localResult.isCritical,
            isAppointment: localResult.isAppointment,
            needsConfirmation: !valCheck.isValid,
            displayNotice: valCheck.isValid ? undefined : 'Translation needs confirmation.',
          };
        }
      }
    } catch (err) {
      console.warn('[LanguageBridge] Server translation unavailable, using local result:', err);
    }
  }

  return localResult;
}

export function detectSpokenLanguage(
  text: string,
  expected?: SupportedLanguageCode
): { language: SupportedLanguageCode; confidence: number; mismatch: boolean } {
  const detected = languageDetectionService.detectLanguage(text, expected);
  const language = toSupportedLang(detected.language);
  return {
    language,
    confidence: detected.confidence,
    mismatch: Boolean(expected && language !== expected && detected.confidence >= 0.70),
  };
}

export { MEDICAL_PHRASE_LIBRARY };

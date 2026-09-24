import { MEDICAL_PHRASE_LIBRARY } from '../../data/languageBridge/phraseLibrary';
import {
  BridgeLang,
  BridgeTranslationResult,
  MedicalPhrase,
  TranslationConfidence,
} from '../../data/languageBridge/types';
import { SupportedLanguageCode } from '../../data/languages';
import { languageDetectionService } from '../voice/languageDetectionService';
import { intentClassifier } from '../voice/intentClassifier';
import { toBridgeLang, toSupportedLang } from './langMap';
import { extractProtectedTokens, restoreProtectedTokens } from './tokenPreserver';

function normalize(text: string): string {
  return text
    .trim()
    .replace(/[“”"']/g, '')
    .replace(/[?.!,;]+$/g, '')
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

  if (best && best.score >= 0.72) return best.phrase;
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

export function translateHealthcareText(
  originalText: string,
  sourceLang: SupportedLanguageCode,
  targetLang: SupportedLanguageCode
): BridgeTranslationResult {
  const original = originalText.trim();
  const { masked, tokens } = extractProtectedTokens(original);
  const source = toBridgeLang(sourceLang);
  const target = toBridgeLang(targetLang);

  const intent = intentClassifier.classifyIntent(original, sourceLang);
  const isEmergency = intent.isEmergency;
  const isCritical =
    isEmergency ||
    /allerg|pregnant|dosage|chest|bleed|breath|மூச்சு|ஒவ்வாமை|கர்ப்ப/i.test(original);

  if (source === target) {
    return {
      originalLanguage: sourceLang,
      originalText: original,
      translatedLanguage: targetLang,
      translatedText: original,
      translationConfidence: 'HIGH',
      translationStatus: 'SameLanguage',
      engine: 'same-language',
      preservedTokens: tokens,
      emergencyIntent: isEmergency ? intent.intent : undefined,
      isEmergency,
      isCritical,
      isAppointment: false,
      needsConfirmation: false,
    };
  }

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
    const translatedText = restoreProtectedTokens(translatedRaw, tokens);
    const confidence: TranslationConfidence =
      matchedFrom === source ? 'HIGH' : 'MEDIUM';
    return {
      originalLanguage: sourceLang,
      originalText: original,
      translatedLanguage: targetLang,
      translatedText,
      translationConfidence: confidence,
      translationStatus: 'Translated',
      engine: 'local-phrase',
      preservedTokens: tokens,
      emergencyIntent: phrase.emergency || isEmergency ? intent.intent || 'BREATHING_DIFFICULTY' : undefined,
      isEmergency: Boolean(phrase.emergency || isEmergency),
      isCritical: Boolean(phrase.critical || isCritical),
      isAppointment: Boolean(phrase.appointment),
      matchedPhraseId: phrase.id,
      needsConfirmation: confidence !== 'HIGH' || Boolean(phrase.critical || phrase.emergency),
    };
  }

  return {
    originalLanguage: sourceLang,
    originalText: original,
    translatedLanguage: targetLang,
    translatedText: original,
    translationConfidence: 'LOW',
    translationStatus: 'Unsupported',
    engine: 'unsupported',
    preservedTokens: tokens,
    emergencyIntent: isEmergency ? intent.intent : undefined,
    isEmergency,
    isCritical,
    isAppointment: false,
    needsConfirmation: true,
  };
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
    mismatch: Boolean(expected && language !== expected && detected.confidence >= 0.75),
  };
}

export { MEDICAL_PHRASE_LIBRARY };

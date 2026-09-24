import { ALL_DICTIONARIES, SupportedLanguageCode } from '../../data/languages';
import { multilingualLanguageIdentifier } from './multilingualLanguageIdentifier';

export interface LanguageDetectionResult {
  language: SupportedLanguageCode;
  confidence: number;
  confidenceLevel: 'high' | 'medium' | 'uncertain';
  method: 'explicit' | 'script' | 'keywords' | 'combined' | 'locked';
  detectedScripts: Record<string, number>;
  matchedKeywords: string[];
}

export class LanguageDetectionService {
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
    const isLocked = !!lockedLanguage;
    const res = multilingualLanguageIdentifier.identifyLanguage(
      text,
      preferredLanguage,
      isLocked,
      lockedLanguage
    );

    let method: 'explicit' | 'script' | 'keywords' | 'combined' | 'locked' = 'combined';
    if (res.source === 'PHRASE_DETECTION' && res.matchedKeywords.length > 0) {
      method = 'explicit';
    } else if (res.source === 'SCRIPT_DETECTION') {
      method = 'script';
    } else if (res.source === 'CONVERSATION_CONTEXT' || res.isLocked) {
      method = 'locked';
    } else if (res.source === 'USER_SELECTED') {
      method = 'combined';
    }

    const confidenceLevel: 'high' | 'medium' | 'uncertain' =
      res.confidenceLevel === 'high'
        ? 'high'
        : res.confidenceLevel === 'medium'
        ? 'medium'
        : 'uncertain';

    return {
      language: res.detectedLanguage,
      confidence: res.confidence,
      confidenceLevel,
      method,
      detectedScripts: res.detectedScripts,
      matchedKeywords: res.matchedKeywords
    };
  }
}

export const languageDetectionService = new LanguageDetectionService();

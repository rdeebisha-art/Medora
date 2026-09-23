import { LanguageDictionary, tamilDictionary } from './tamilHealthcare';
import { teluguDictionary } from './teluguHealthcare';
import { malayalamDictionary, kannadaDictionary, englishDictionary } from './otherLanguages';

export * from './tamilHealthcare';
export * from './teluguHealthcare';
export * from './otherLanguages';

export type SupportedLanguageCode = 'ta-IN' | 'te-IN' | 'ml-IN' | 'kn-IN' | 'en-IN';

export const LANGUAGE_METADATA: Record<SupportedLanguageCode, { code: SupportedLanguageCode; name: string; nativeName: string; flag: string }> = {
  'ta-IN': { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  'te-IN': { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  'ml-IN': { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  'kn-IN': { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  'en-IN': { code: 'en-IN', name: 'English', nativeName: 'English', flag: '🌐' }
};

export const ALL_DICTIONARIES: Record<SupportedLanguageCode, LanguageDictionary> = {
  'ta-IN': tamilDictionary,
  'te-IN': teluguDictionary,
  'ml-IN': malayalamDictionary,
  'kn-IN': kannadaDictionary,
  'en-IN': englishDictionary
};

import { SupportedLanguageCode } from '../../data/languages';
import { BridgeLang } from '../../data/languageBridge/types';

export function toBridgeLang(code: SupportedLanguageCode | string): BridgeLang {
  const short = code.slice(0, 2).toLowerCase();
  if (short === 'ta' || short === 'te' || short === 'ml' || short === 'kn' || short === 'en') {
    return short;
  }
  return 'en';
}

export function toSupportedLang(code: string): SupportedLanguageCode {
  const map: Record<string, SupportedLanguageCode> = {
    en: 'en-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    kn: 'kn-IN',
    'en-IN': 'en-IN',
    'ta-IN': 'ta-IN',
    'te-IN': 'te-IN',
    'ml-IN': 'ml-IN',
    'kn-IN': 'kn-IN',
  };
  return map[code] || 'en-IN';
}

export function languageDisplayName(code: SupportedLanguageCode | BridgeLang | string): string {
  const names: Record<string, string> = {
    en: 'English',
    ta: 'Tamil',
    te: 'Telugu',
    ml: 'Malayalam',
    kn: 'Kannada',
    'en-IN': 'English',
    'ta-IN': 'Tamil',
    'te-IN': 'Telugu',
    'ml-IN': 'Malayalam',
    'kn-IN': 'Kannada',
  };
  return names[code] || code;
}

export function nativeLanguageName(code: SupportedLanguageCode | BridgeLang | string): string {
  const names: Record<string, string> = {
    en: 'English',
    ta: 'தமிழ்',
    te: 'తెలుగు',
    ml: 'മലയാളം',
    kn: 'ಕನ್ನಡ',
    'en-IN': 'English',
    'ta-IN': 'தமிழ்',
    'te-IN': 'తెలుగు',
    'ml-IN': 'മലയാളം',
    'kn-IN': 'ಕನ್ನಡ',
  };
  return names[code] || code;
}

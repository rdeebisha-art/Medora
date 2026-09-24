import en from '../locales/en.json';
import hi from '../locales/hi.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';

type LocaleRecord = Record<string, any>;

export interface TranslationAuditResult {
  totalReferenceKeys: number;
  languageResults: Record<
    string,
    {
      missingKeys: string[];
      coveragePercent: number;
      isComplete: boolean;
    }
  >;
  allComplete: boolean;
}

function getAllKeys(obj: LocaleRecord, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getNestedValue(obj: LocaleRecord, keyPath: string): any {
  const parts = keyPath.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

export function checkTranslationCompleteness(): TranslationAuditResult {
  const referenceKeys = getAllKeys(en);
  const total = referenceKeys.length;

  const targetLocales: Record<string, LocaleRecord> = {
    hi,
    ta,
    te,
    kn,
    ml
  };

  const languageResults: TranslationAuditResult['languageResults'] = {};
  let allComplete = true;

  for (const [lang, locale] of Object.entries(targetLocales)) {
    const missing: string[] = [];
    for (const key of referenceKeys) {
      const val = getNestedValue(locale, key);
      if (val === undefined || val === null || val === '') {
        missing.push(key);
      }
    }

    const coverage = total > 0 ? Math.round(((total - missing.length) / total) * 100) : 100;
    const isComplete = missing.length === 0;
    if (!isComplete) allComplete = false;

    languageResults[lang] = {
      missingKeys: missing,
      coveragePercent: coverage,
      isComplete
    };
  }

  return {
    totalReferenceKeys: total,
    languageResults,
    allComplete
  };
}

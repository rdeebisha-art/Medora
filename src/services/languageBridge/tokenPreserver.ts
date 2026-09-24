import { MEDICINE_NAMES, ProtectedToken } from '../../data/languageBridge/types';

const MEASUREMENT_PATTERNS: Array<{ kind: ProtectedToken['kind']; regex: RegExp }> = [
  { kind: 'measurement', regex: /\b\d{2,3}\s*\/\s*\d{2,3}\b/g },
  { kind: 'measurement', regex: /\b\d{2,3}(?:\.\d+)?\s*(?:°\s*)?[FfCc]\b/g },
  { kind: 'measurement', regex: /\b\d{2,3}(?:\.\d+)?\s*degree(?:s)?\b/gi },
  { kind: 'measurement', regex: /\b\d{2,4}\s*mg\/?dL\b/gi },
  { kind: 'measurement', regex: /\b\d{2,3}\s*%/g },
  { kind: 'measurement', regex: /\b\d{1,3}(?:\.\d+)?\s*kg\b/gi },
  { kind: 'measurement', regex: /\b\d{1,3}\s*(?:years?|yrs?|year old)\b/gi },
  { kind: 'datetime', regex: /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\b/g },
  { kind: 'datetime', regex: /\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi },
  { kind: 'datetime', regex: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g },
  { kind: 'identifier', regex: /\b(?:\+91[-\s]?)?\d{10}\b/g },
];

export function extractProtectedTokens(text: string): { masked: string; tokens: ProtectedToken[] } {
  let masked = text;
  const tokens: ProtectedToken[] = [];
  let index = 0;

  const pushMatch = (value: string, kind: ProtectedToken['kind']) => {
    if (!value.trim()) return;
    const placeholder = `__T${index}__`;
    tokens.push({ placeholder, value, kind });
    index += 1;
    return placeholder;
  };

  for (const { kind, regex } of MEASUREMENT_PATTERNS) {
    masked = masked.replace(regex, (match) => pushMatch(match, kind) || match);
  }

  for (const name of MEDICINE_NAMES) {
    const re = new RegExp(`\\b${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    masked = masked.replace(re, (match) => pushMatch(match, 'medicine') || match);
  }

  return { masked, tokens };
}

export function restoreProtectedTokens(text: string, tokens: ProtectedToken[]): string {
  let restored = text;
  for (const token of tokens) {
    restored = restored.split(token.placeholder).join(token.value);
  }
  return restored;
}

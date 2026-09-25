import { VoiceNavigationLanguage, VoiceNavLangCode } from './voiceNavigationTypes';

// Medical symptom and complaint expressions that MUST NOT be interpreted as navigation
export const MEDICAL_COMPLAINT_PATTERNS = [
  // English
  /\b(headache|fever|cough|cold|vomit|vomiting|stomach\s*pain|chest\s*pain|dizziness|bleeding|nausea|diarrhea|rash|throat\s*pain|breathless|cannot\s*breathe)\b/i,
  /\bi\s*(have|feel|am\s*having|got)\s*(a|an)?\s*(headache|fever|cough|cold|pain|chills|vomiting)/i,
  // Tamil
  /(தலைவலி|காய்ச்சல்|இருமல்|சளி|வாந்தி|வயிற்று\s*வலி|நெஞ்சு\s*வலி|மயக்கம்|மூச்சுத்திணறல்)/,
  // Hindi
  /(सिरदर्द|बुखार|खांसी|जुकाम|उल्टी|पेट\s*दर्द|सीने\s*में\s*दर्द|चक्कर|सांस\s*फूलना)/,
  // Telugu
  /(తలనొప్పి|జ్వరం|దగ్గు|రొంప|వాంతులు|కడుపు\s*నొప్పి|ఛాతీ\s*నొప్పి|కళ్ళు\s*తిరగడం)/,
  // Malayalam
  /(തലവേദന|പനി|ചുമ|ഛർദ്ദി|വയറുവേദന|നെഞ്ചുവേദന|ശ്വാസതടസ്സം)/,
  // Kannada
  /(ತಲೆನೋವು|ಜ್ವರ|ಕೆಮ್ಮು|ನೆಗಡಿ|ವಾಂತಿ|ಹೊಟ್ಟೆ\s*ನೋವು|ಎದೆ\s*ನೋವು|ಉಸಿರಾಟ)/,
];

// Filler words to remove for cleaner intent matching
export const FILLER_WORDS: Record<VoiceNavLangCode, string[]> = {
  en: ['please', 'can you', 'could you', 'i want to', 'take me to', 'navigate to', 'would like to', 'kindly'],
  ta: ['தயவுசெய்து', 'கொஞ்சம்', 'எனக்கு', 'வேண்டும்'],
  hi: ['कृपया', 'जरा', 'मुझे', 'चाहिए'],
  te: ['దయచేసి', 'నాకు', 'కావాలి'],
  ml: ['ദയവായി', 'എനിക്ക്', 'വേണം'],
  kn: ['ದಯವಿಟ್ಟು', 'ನನಗೆ', 'ಬೇಕು'],
};

/**
 * Normalizes text: lowercase, removes punctuation, trims extra whitespace.
 */
export function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[.,?!;:()[\]{}"'\\/_\-+—`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if the utterance contains acute medical symptoms or clinical complaints.
 */
export function isMedicalStatement(text: string): boolean {
  const trimmed = text.trim();
  return MEDICAL_COMPLAINT_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Detects the language script of the text.
 */
export function detectLanguageFromScript(text: string): VoiceNavLangCode | null {
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  return null;
}

/**
 * Converts a 2-letter language code to full BCP-47 tag.
 */
export function langCodeToBcp47(code: VoiceNavLangCode): VoiceNavigationLanguage {
  switch (code) {
    case 'ta': return 'ta-IN';
    case 'hi': return 'hi-IN';
    case 'te': return 'te-IN';
    case 'ml': return 'ml-IN';
    case 'kn': return 'kn-IN';
    case 'en':
    default: return 'en-IN';
  }
}

/**
 * Converts a BCP-47 tag to a 2-letter language code.
 */
export function bcp47ToLangCode(bcp: VoiceNavigationLanguage | string): VoiceNavLangCode {
  const prefix = bcp.split('-')[0].toLowerCase();
  if (prefix === 'ta') return 'ta';
  if (prefix === 'hi') return 'hi';
  if (prefix === 'te') return 'te';
  if (prefix === 'ml') return 'ml';
  if (prefix === 'kn') return 'kn';
  return 'en';
}

/**
 * Removes filler words for the specified language.
 */
export function stripFillers(text: string, lang: VoiceNavLangCode): string {
  let cleaned = text;
  const fillers = FILLER_WORDS[lang] || [];
  for (const f of fillers) {
    cleaned = cleaned.replace(new RegExp(`\\b${f}\\b`, 'gi'), ' ');
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Calculates token overlap ratio between two strings.
 */
export function calculateTokenOverlap(input: string, target: string): number {
  const inTokens = input.split(' ').filter((w) => w.length > 2);
  const targetTokens = target.split(' ').filter((w) => w.length > 2);
  if (!inTokens.length || !targetTokens.length) return 0;

  const matches = inTokens.filter((token) => targetTokens.includes(token));
  return matches.length / Math.max(inTokens.length, targetTokens.length);
}

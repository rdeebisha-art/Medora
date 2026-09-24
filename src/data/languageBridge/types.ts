import { SupportedLanguageCode } from '../languages';

export type BridgeLang = 'en' | 'ta' | 'te' | 'ml' | 'kn' | 'hi';

export type TranslationConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type TranslationStatus =
  | 'Translated'
  | 'SameLanguage'
  | 'NeedsConfirmation'
  | 'Unsupported';

export type BridgeSpeaker = 'patient' | 'doctor' | 'medora';

export interface MedicalPhrase {
  id: string;
  category: string;
  emergency?: boolean;
  critical?: boolean;
  appointment?: boolean;
  texts: Record<BridgeLang, string>;
  aliases?: Partial<Record<BridgeLang, string[]>>;
}

export interface ProtectedToken {
  placeholder: string;
  value: string;
  kind: 'measurement' | 'medicine' | 'identifier' | 'datetime';
}

export interface BridgeTranslationResult {
  originalLanguage: SupportedLanguageCode;
  originalText: string;
  translatedLanguage: SupportedLanguageCode;
  translatedText: string;
  translationConfidence: TranslationConfidence;
  translationStatus: TranslationStatus;
  engine: 'local-phrase' | 'same-language' | 'unsupported';
  preservedTokens: ProtectedToken[];
  emergencyIntent?: string;
  isEmergency: boolean;
  isCritical: boolean;
  isAppointment: boolean;
  matchedPhraseId?: string;
  needsConfirmation: boolean;
}

export const BRIDGE_LANGS: BridgeLang[] = ['en', 'ta', 'te', 'ml', 'kn', 'hi'];

export const MEDICINE_NAMES = [
  'Paracetamol',
  'Acetaminophen',
  'Metformin',
  'Amlodipine',
  'Aspirin',
  'Folic Acid',
  'Ferrous Sulphate',
  'ORS',
  'Ibuprofen',
  'Amoxicillin',
  'Azithromycin',
  'Insulin',
  'Losartan',
  'Atenolol',
  'Omeprazole',
  'Cetirizine',
  'Salbutamol',
  'Iron',
  'Calcium',
];

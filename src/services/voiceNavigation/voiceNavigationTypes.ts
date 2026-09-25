export type VoiceNavigationLanguage =
  | 'en-IN'
  | 'ta-IN'
  | 'hi-IN'
  | 'te-IN'
  | 'ml-IN'
  | 'kn-IN';

export type VoiceNavLangCode = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';

export type VoiceNavigationIntent =
  | 'DASHBOARD'
  | 'MY_HEALTH'
  | 'FAMILY_HEALTH'
  | 'MEDICAL_RECORDS'
  | 'MEDICINES'
  | 'VACCINATIONS'
  | 'HEALTH_TESTS'
  | 'HEALTH_REPORTS'
  | 'REPORT_SCANNER'
  | 'XRAY'
  | 'AI_ASSISTANT'
  | 'DOCTOR_CONSULTATION'
  | 'DOCTOR_SUMMARY'
  | 'APPOINTMENTS'
  | 'EMERGENCY'
  | 'NEARBY_HOSPITALS'
  | 'GOVERNMENT_SCHEMES'
  | 'HEALTH_EDUCATION'
  | 'SMS_COMMUNICATION'
  | 'USSD'
  | 'SETTINGS'
  | 'LANGUAGE'
  | 'FAMILY'
  | 'ELDERLY_CARE'
  | 'CHILD_CARE'
  | 'PREGNANCY'
  | 'NEWBORN_CARE'
  | 'NEW_MOTHER_CARE';

export interface VoiceCommand {
  intent: VoiceNavigationIntent;
  language: VoiceNavigationLanguage;
  phrases: string[];
  keywords?: string[];
}

export interface VoiceNavigationMatch {
  intent: VoiceNavigationIntent | null;
  confidence: number;
  language: VoiceNavigationLanguage | null;
  matchedPhrase?: string;
  route?: string;
  feedbackText: string;
  matched: boolean;
  reason?: 'matched' | 'medical_statement' | 'unrecognized_command' | 'empty_input';
}

export type VoiceNavState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'COMMAND_RECOGNIZED'
  | 'NAVIGATING'
  | 'NOT_UNDERSTOOD'
  | 'MICROPHONE_DENIED'
  | 'UNSUPPORTED'
  | 'OFFLINE_UNSUPPORTED';

export interface VoiceNavEvent {
  state: VoiceNavState;
  transcript: string;
  feedbackText: string;
  matchResult?: VoiceNavigationMatch;
  isOffline: boolean;
}

export type VoiceNavListener = (event: VoiceNavEvent) => void;

export interface VoiceNavigationRoute {
  id: string;
  intent: VoiceNavigationIntent;
  path: string;
  name: {
    en: string;
    ta: string;
    hi: string;
    te: string;
    ml: string;
    kn: string;
  };
  category: 'core' | 'care' | 'records' | 'services' | 'system';
  icon: string;
}

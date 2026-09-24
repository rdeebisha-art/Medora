import { SupportedLanguageCode } from '../../data/languages';
import { HealthcareIntent } from '../../data/healthKnowledge/knowledgeBase';

export interface TelephonyCallSession {
  callId: string;
  callerNumber: string;
  status: 'idle' | 'ringing' | 'connected' | 'ended' | 'failed';
  isDemoSimulation: boolean;
  detectedLanguage?: SupportedLanguageCode;
  intent?: HealthcareIntent;
  lastSpokenText?: string;
  durationSeconds: number;
  providerNotice: string;
  createdAt: string;
}

export interface TelephonyProvider {
  isConfigured(): boolean;
  startCall(phoneNumber: string): Promise<TelephonyCallSession>;
  endCall(callId: string): Promise<void>;
  receiveSpeech(callId: string, transcript: string): Promise<{ responseText: string; language: SupportedLanguageCode }>;
  getCallStatus(callId: string): TelephonyCallSession | null;
}

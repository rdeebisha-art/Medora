import { LanguageCode, SeverityLevel } from '../../types';

export type CommunicationChannel = 'web' | 'sms' | 'ussd' | 'voice' | 'ivr' | 'assisted';

export interface SharedResponseObject {
  responseId: string;
  requestId: string;
  patientId: string;
  urgency: SeverityLevel;
  summary: string;
  keyFindings: string[];
  generalGuidance: string[];
  warningSigns: string[];
  doctorRecommendation: string;
  followUp: string;
  language: LanguageCode;
  channel: CommunicationChannel;
  createdAt: string;
}

export interface FormattedChannelResponse {
  channel: CommunicationChannel;
  payload: string;
  metadata?: Record<string, any>;
}

export interface OutgoingSMSMessage {
  id: string;
  recipientPhone: string;
  content: string;
  status: 'QUEUED' | 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'NOT_CONFIGURED';
  timestamp: string;
  isDemo: boolean;
}

export interface USSDSessionState {
  sessionId: string;
  currentMenu: 'MAIN' | 'HEALTH' | 'SYMPTOMS' | 'SYMPTOM_DURATION' | 'REPORT_STATUS' | 'DOCTOR' | 'EMERGENCY' | 'LANGUAGE';
  enteredSymptom?: string;
  enteredDuration?: string;
  patientId: string;
  language: LanguageCode;
}


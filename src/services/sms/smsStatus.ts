export type SmsRealStatus =
  | 'DRAFT'
  | 'QUEUED'
  | 'SUBMITTED'
  | 'DELIVERED'
  | 'FAILED'
  | 'OFFLINE_OUTBOX'
  | 'DEMO_ONLY'
  | 'SENDING'
  | 'SENT'
  | 'PENDING_SYNC'
  | 'NOT_CONFIGURED';

export interface SmsSendPayload {
  recipientPhone: string;
  message: string;
  patientId?: number | string;
  familyId?: number | string;
  consultationId?: number | string;
  alertType?: string;
  senderId?: string;
  templateId?: string;
  language?: string;
  isDemoMode?: boolean;
}

export interface SmsResponseData {
  messageId: string;
  providerMessageId?: string;
  status: SmsRealStatus;
  recipientPhone: string;
  messageText: string;
  patientId?: number | string;
  familyId?: number | string;
  consultationId?: number | string;
  alertType?: string;
  senderId?: string;
  templateId?: string;
  provider?: string;
  providerStatus?: string;
  error?: string;
  info?: string;
  demoNotice?: string;
  configured?: boolean;
  createdAt: string;
  updatedAt: string;
  isOfflineQueued?: boolean;
}

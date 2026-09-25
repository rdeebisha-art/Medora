export type SmsRealStatus =
  | 'QUEUED'
  | 'SENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED'
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
  createdAt: string;
  updatedAt: string;
  isOfflineQueued?: boolean;
}

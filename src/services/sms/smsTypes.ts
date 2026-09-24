export type SmsDeliveryStatus =
  | 'Queued'
  | 'Sending'
  | 'Sent'
  | 'Delivered'
  | 'Failed'
  | 'Pending Sync';

export interface SmsMessageRecord {
  messageId: string;
  recipientPhone: string;
  messageText: string;
  patientId?: number;
  language: string;
  status: SmsDeliveryStatus;
  isOfflineQueued: boolean;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
}

export interface SmsProvider {
  isOnline(): boolean;
  sendSMS(recipientPhone: string, messageText: string, patientId?: number, language?: string): Promise<SmsMessageRecord>;
  getDeliveryStatus(messageId: string): Promise<SmsDeliveryStatus>;
  getOutbox(): Promise<SmsMessageRecord[]>;
}

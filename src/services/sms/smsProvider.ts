import { SmsProvider, SmsMessageRecord, SmsDeliveryStatus } from './smsTypes';
import { db } from '../../db/db';

export class LocalSmsProvider implements SmsProvider {
  private memoryOutbox = new Map<string, SmsMessageRecord>();

  public isOnline(): boolean {
    return navigator.onLine;
  }

  public async sendSMS(
    recipientPhone: string,
    messageText: string,
    patientId?: number,
    language = 'en'
  ): Promise<SmsMessageRecord> {
    const messageId = `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const isOnline = navigator.onLine;

    const initialStatus: SmsDeliveryStatus = isOnline ? 'Queued' : 'Pending Sync';

    const record: SmsMessageRecord = {
      messageId,
      recipientPhone,
      messageText,
      patientId,
      language,
      status: initialStatus,
      isOfflineQueued: !isOnline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.memoryOutbox.set(messageId, record);

    // Save to Dexie smsOutbox
    try {
      await db.smsOutbox.add({
        toPhone: recipientPhone,
        message: messageText,
        type: 'HEALTH_UPDATE',
        language,
        status: isOnline ? 'pending' : 'PENDING_OFFLINE',
        createdAt: new Date().toISOString()
      });
    } catch {
      // IndexedDB fallback
    }

    if (isOnline) {
      // Simulate asynchronous delivery transitions
      setTimeout(() => {
        const item = this.memoryOutbox.get(messageId);
        if (item && item.status === 'Queued') {
          item.status = 'Sending';
          item.updatedAt = new Date().toISOString();
          this.memoryOutbox.set(messageId, item);
        }
      }, 1200);

      setTimeout(() => {
        const item = this.memoryOutbox.get(messageId);
        if (item && item.status === 'Sending') {
          item.status = 'Delivered';
          item.updatedAt = new Date().toISOString();
          this.memoryOutbox.set(messageId, item);
        }
      }, 3500);
    }

    return record;
  }

  public async getDeliveryStatus(messageId: string): Promise<SmsDeliveryStatus> {
    const item = this.memoryOutbox.get(messageId);
    return item ? item.status : 'Queued';
  }

  public async getOutbox(): Promise<SmsMessageRecord[]> {
    return Array.from(this.memoryOutbox.values());
  }
}

export const activeSmsProvider: SmsProvider = new LocalSmsProvider();

import { SmsSendPayload, SmsResponseData } from './smsStatus';
import { smsQueue } from './smsQueue';
import { db } from '../../db/db';

export interface ISmsProvider {
  isOnline(): boolean;
  send(payload: SmsSendPayload): Promise<SmsResponseData>;
  getStatus(messageId: string): Promise<SmsResponseData | null>;
  getHistory(): Promise<SmsResponseData[]>;
}

export class ConfiguredTwilioSmsProvider implements ISmsProvider {
  public isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public async send(payload: SmsSendPayload): Promise<SmsResponseData> {
    if (!this.isOnline()) {
      return smsQueue.enqueueOffline(payload);
    }

    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: SmsResponseData = await res.json();

      // Record in Dexie smsOutbox for persistent local records
      try {
        await db.smsOutbox.add({
          toPhone: payload.recipientPhone,
          message: payload.message,
          type: payload.alertType || 'HEALTH_ALERT',
          language: payload.language || 'en',
          status: data.status === 'SENT' || data.status === 'DELIVERED' ? 'sent' : data.status === 'NOT_CONFIGURED' ? 'pending' : 'failed',
          createdAt: new Date().toISOString(),
        });
      } catch {
        // IDB fallback
      }

      return data;
    } catch (err: any) {
      // If network fails while online, enqueue offline
      return smsQueue.enqueueOffline(payload);
    }
  }

  public async getStatus(messageId: string): Promise<SmsResponseData | null> {
    try {
      const res = await fetch(`/api/sms/status/${messageId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async getHistory(): Promise<SmsResponseData[]> {
    try {
      const res = await fetch('/api/sms/logs');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }
}

export const activeSmsProvider: ISmsProvider = new ConfiguredTwilioSmsProvider();

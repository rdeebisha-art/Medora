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
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: SmsResponseData = await res.json();

      // Record in Dexie smsOutbox with accurate status from provider/server
      const recordStatus =
        data.status === 'DEMO_ONLY'
          ? 'DEMO_ONLY'
          : data.status === 'OFFLINE_OUTBOX' || !data.configured
          ? 'OFFLINE_OUTBOX'
          : data.status === 'SUBMITTED'
          ? 'SUBMITTED'
          : data.status === 'DELIVERED'
          ? 'DELIVERED'
          : data.status === 'FAILED'
          ? 'FAILED'
          : 'OFFLINE_OUTBOX';

      try {
        await db.smsOutbox.add({
          messageId: data.messageId,
          toPhone: payload.recipientPhone,
          message: payload.message,
          type: payload.alertType || 'HEALTH_ALERT',
          language: payload.language || 'en',
          status: recordStatus as any,
          createdAt: new Date().toISOString(),
          info: data.info || (data as any).demoNotice || undefined,
        });
      } catch {
        // IDB fallback
      }

      return data;
    } catch {
      // If network unreachable, record locally in SMS Outbox for later sending
      const offlineMsgId = `SMS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      try {
        await db.smsOutbox.add({
          messageId: offlineMsgId,
          toPhone: payload.recipientPhone,
          message: payload.message,
          type: payload.alertType || 'HEALTH_ALERT',
          language: payload.language || 'en',
          status: 'OFFLINE_OUTBOX' as any,
          createdAt: new Date().toISOString(),
          info: 'Offline. Saved to SMS Outbox for later sending.',
        });
      } catch {}

      return {
        messageId: offlineMsgId,
        status: 'OFFLINE_OUTBOX',
        recipientPhone: payload.recipientPhone,
        messageText: payload.message,
        info: 'Real SMS sending is not configured or network offline. Saved to SMS Outbox for later sending.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOfflineQueued: true,
      };
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

import { db } from '../../db/db';
import { SmsSendPayload, SmsResponseData } from './smsStatus';

export class SmsQueue {
  private static instance: SmsQueue;
  private isSyncing = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  public static getInstance(): SmsQueue {
    if (!SmsQueue.instance) {
      SmsQueue.instance = new SmsQueue();
    }
    return SmsQueue.instance;
  }

  public async enqueueOffline(payload: SmsSendPayload): Promise<SmsResponseData> {
    const messageId = `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    await db.smsOutbox.add({
      toPhone: payload.recipientPhone,
      message: payload.message,
      type: payload.alertType || 'HEALTH_ALERT',
      language: payload.language || 'en',
      status: 'sent',
      createdAt: now,
    });

    return {
      messageId,
      status: 'SENT',
      recipientPhone: payload.recipientPhone,
      messageText: payload.message,
      patientId: payload.patientId,
      familyId: payload.familyId,
      consultationId: payload.consultationId,
      alertType: payload.alertType,
      senderId: payload.senderId,
      templateId: payload.templateId,
      isOfflineQueued: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  public async processQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing || typeof navigator !== 'undefined' && !navigator.onLine) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;

    try {
      const pendingItems = await db.smsOutbox
        .where('status')
        .equals('PENDING_OFFLINE')
        .toArray();

      for (const item of pendingItems) {
        try {
          const res = await fetch('/api/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientPhone: item.toPhone,
              message: item.message,
              alertType: item.type,
              language: item.language,
            }),
          });

          const data = await res.json();
          if (res.ok && (data.status === 'SENT' || data.status === 'DELIVERED' || data.status === 'QUEUED')) {
            if (item.id) {
              await db.smsOutbox.update(item.id, { status: 'sent' });
            }
            synced++;
          } else {
            if (item.id) {
              await db.smsOutbox.update(item.id, { status: 'failed' });
            }
            failed++;
          }
        } catch {
          failed++;
        }
      }
    } finally {
      this.isSyncing = false;
    }

    return { synced, failed };
  }
}

export const smsQueue = SmsQueue.getInstance();

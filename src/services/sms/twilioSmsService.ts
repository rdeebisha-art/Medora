/**
 * Twilio SMS Service for Medora
 * Interfaces with Twilio API via server proxy using credentials configured in .env:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_FROM_NUMBER
 * - SMS_SENDER_ID
 * 
 * Provides local state persistence mechanism using existing Medora storage utility
 * (Dexie db.smsOutbox + LocalStorage sync fallback) to track full history of sent SMS messages.
 */

import { db, SmsOutbox, SmsOutboxStatus } from '../../db/db';

export interface TwilioSmsRequest {
  to: string;
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

export interface TwilioSmsResult {
  success: boolean;
  messageId: string;
  providerMessageId?: string;
  status: SmsOutboxStatus;
  recipientPhone: string;
  messageText: string;
  provider: string;
  providerStatus?: string;
  error?: string;
  info?: string;
  configured: boolean;
  createdAt: string;
  updatedAt: string;
  isOfflineQueued?: boolean;
}

export interface TwilioConfigResponse {
  configured: boolean;
  provider: string;
  fromNumber?: string | null;
  senderId?: string;
}

const LOCAL_STORAGE_HISTORY_KEY = 'medora_twilio_sms_history_cache';

export class TwilioSmsService {
  private static instance: TwilioSmsService;

  public static getInstance(): TwilioSmsService {
    if (!TwilioSmsService.instance) {
      TwilioSmsService.instance = new TwilioSmsService();
    }
    return TwilioSmsService.instance;
  }

  /**
   * Normalize and validate phone numbers (E.164 compliant)
   */
  public normalizePhone(phone: string): { isValid: boolean; normalized: string; formatted: string } {
    const raw = (phone || '').trim();
    if (!raw) return { isValid: false, normalized: '', formatted: '' };

    const digits = raw.replace(/\D/g, '');

    // 10-digit Indian number: 9876543210 -> +919876543210
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return {
        isValid: true,
        normalized: `+91${digits}`,
        formatted: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
      };
    }

    // 11-digit with leading zero: 09876543210 -> +919876543210
    if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) {
      const ten = digits.slice(1);
      return {
        isValid: true,
        normalized: `+91${ten}`,
        formatted: `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`,
      };
    }

    // 12-digit Indian number with country code: 919876543210 -> +919876543210
    if (digits.length === 12 && digits.startsWith('91')) {
      const ten = digits.slice(2);
      return {
        isValid: true,
        normalized: `+${digits}`,
        formatted: `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`,
      };
    }

    // Explicit international format with +: +14155552671, +447123456789
    if (raw.startsWith('+') && digits.length >= 10 && digits.length <= 15) {
      return {
        isValid: true,
        normalized: `+${digits}`,
        formatted: `+${digits}`,
      };
    }

    // General international 10-15 digits
    if (digits.length >= 10 && digits.length <= 15) {
      const normalized = raw.startsWith('+') ? `+${digits}` : digits.length === 10 ? `+91${digits}` : `+${digits}`;
      return {
        isValid: true,
        normalized,
        formatted: normalized,
      };
    }

    return {
      isValid: false,
      normalized: raw,
      formatted: raw,
    };
  }

  /**
   * Check backend Twilio configuration status loaded from .env
   */
  public async checkConfig(): Promise<TwilioConfigResponse> {
    try {
      const res = await fetch('/api/sms/config');
      if (!res.ok) {
        return { configured: false, provider: 'None' };
      }
      const data = await res.json();
      return {
        configured: Boolean(data.configured),
        provider: data.provider || 'Twilio',
        fromNumber: data.fromNumber || null,
        senderId: data.senderId || 'MEDORA',
      };
    } catch {
      return { configured: false, provider: 'None' };
    }
  }

  /**
   * Interface with Twilio API to send actual SMS message to the phone number.
   * Uses backend proxy route /api/sms/send with credentials from .env.
   * Automatically persists record into existing storage utility (Dexie db.smsOutbox).
   */
  public async sendSms(req: TwilioSmsRequest): Promise<TwilioSmsResult> {
    const norm = this.normalizePhone(req.to);
    const targetPhone = norm.isValid ? norm.normalized : req.to.trim();
    const messageText = req.message.trim();
    const createdAt = new Date().toISOString();

    const payload = {
      recipientPhone: targetPhone,
      message: messageText,
      patientId: req.patientId,
      familyId: req.familyId,
      consultationId: req.consultationId,
      alertType: req.alertType || 'HEALTH_ALERT',
      senderId: req.senderId || 'MEDORA',
      templateId: req.templateId,
      language: req.language || 'en',
      isDemoMode: Boolean(req.isDemoMode),
    };

    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const isOk = res.ok && data.status !== 'FAILED';

      let outboxStatus: SmsOutboxStatus = 'OFFLINE_OUTBOX';
      if (data.status === 'DEMO_ONLY') {
        outboxStatus = 'DEMO_ONLY';
      } else if (data.status === 'DELIVERED') {
        outboxStatus = 'DELIVERED';
      } else if (data.status === 'SUBMITTED' || data.status === 'SENT') {
        outboxStatus = 'SUBMITTED';
      } else if (data.status === 'FAILED') {
        outboxStatus = 'failed';
      } else if (!data.configured) {
        outboxStatus = 'OFFLINE_OUTBOX';
      }

      const result: TwilioSmsResult = {
        success: isOk,
        messageId: data.messageId || `SMS-${Date.now()}`,
        providerMessageId: data.providerMessageId,
        status: outboxStatus,
        recipientPhone: targetPhone,
        messageText,
        provider: data.provider || 'Twilio',
        providerStatus: data.providerStatus,
        error: data.error,
        info: data.info || (data.status === 'DEMO_ONLY' ? 'DEMO ONLY — NOT SENT TO PHONE' : undefined),
        configured: Boolean(data.configured),
        createdAt: data.createdAt || createdAt,
        updatedAt: data.updatedAt || createdAt,
      };

      // Persist to existing Dexie storage utility
      await this.persistToStorage({
        messageId: result.messageId,
        toPhone: targetPhone,
        message: messageText,
        type: req.alertType || 'HEALTH_ALERT',
        language: req.language || 'en',
        status: outboxStatus,
        createdAt: result.createdAt,
        info: result.info,
        patientId: req.patientId,
        provider: result.provider,
        providerStatus: result.providerStatus,
        providerMessageId: result.providerMessageId,
        error: result.error,
      });

      return result;
    } catch (err: any) {
      // Offline fallback: save to local state storage as OFFLINE_OUTBOX
      const offlineId = `SMS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const offlineRecord: SmsOutbox = {
        messageId: offlineId,
        toPhone: targetPhone,
        message: messageText,
        type: req.alertType || 'HEALTH_ALERT',
        language: req.language || 'en',
        status: 'OFFLINE_OUTBOX',
        createdAt,
        info: 'Offline or network error. Stored safely in local SMS Outbox.',
        patientId: req.patientId,
        provider: 'Twilio',
        error: err?.message || 'Network request failed',
      };

      await this.persistToStorage(offlineRecord);

      return {
        success: false,
        messageId: offlineId,
        status: 'OFFLINE_OUTBOX',
        recipientPhone: targetPhone,
        messageText,
        provider: 'Twilio',
        error: err?.message || 'Network request failed. Saved to SMS Outbox.',
        info: 'Saved to local SMS Outbox for later cellular sending.',
        configured: false,
        createdAt,
        updatedAt: createdAt,
        isOfflineQueued: true,
      };
    }
  }

  /**
   * Persist a record into the existing storage utility:
   * 1. Primary: Dexie IndexedDB (db.smsOutbox)
   * 2. Secondary: LocalStorage cache for immediate hydration and resiliency
   */
  public async persistToStorage(record: SmsOutbox): Promise<number | undefined> {
    let savedId: number | undefined;

    // 1. IndexedDB Dexie
    try {
      savedId = await db.smsOutbox.add(record);
    } catch {
      // Ignore if table schema or duplicate
    }

    // 2. LocalStorage cache mechanism
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
        const list: SmsOutbox[] = raw ? JSON.parse(raw) : [];
        list.unshift({ ...record, id: savedId || Date.now() });
        // Keep up to 200 items in localStorage cache
        if (list.length > 200) list.length = 200;
        window.localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(list));
      }
    } catch {
      // Quota exceeded fallback
    }

    return savedId;
  }

  /**
   * Retrieve full sent SMS history using existing storage utility
   */
  public async getHistory(): Promise<SmsOutbox[]> {
    try {
      const records = await db.smsOutbox.orderBy('createdAt').reverse().toArray();
      if (records && records.length > 0) {
        return records;
      }
    } catch (e) {
      console.warn('[TwilioSmsService] IndexedDB query failed, checking localStorage fallback:', e);
    }

    // Fallback to localStorage cache
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      }
    } catch {}

    return [];
  }

  /**
   * Poll live status of an SMS from Twilio API via backend
   */
  public async pollStatus(messageId: string): Promise<TwilioSmsResult | null> {
    try {
      const res = await fetch(`/api/sms/status/${messageId}`);
      if (!res.ok) return null;
      const data = await res.json();

      let outboxStatus: SmsOutboxStatus = 'OFFLINE_OUTBOX';
      if (data.status === 'DELIVERED') outboxStatus = 'DELIVERED';
      else if (data.status === 'SENT' || data.status === 'SUBMITTED') outboxStatus = 'SUBMITTED';
      else if (data.status === 'FAILED') outboxStatus = 'failed';
      else if (data.status === 'DEMO_ONLY') outboxStatus = 'DEMO_ONLY';

      // Update Dexie database if record exists
      try {
        const existing = await db.smsOutbox.where('messageId').equals(messageId).first();
        if (existing && existing.id) {
          await db.smsOutbox.update(existing.id, {
            status: outboxStatus,
            providerStatus: data.providerStatus,
            info: data.info || (data.status === 'DELIVERED' ? 'Delivered to handset' : undefined),
          });
        }
      } catch {}

      return {
        success: data.status !== 'FAILED',
        messageId: data.messageId || messageId,
        providerMessageId: data.providerMessageId,
        status: outboxStatus,
        recipientPhone: data.recipientPhone,
        messageText: data.messageText,
        provider: data.provider || 'Twilio',
        providerStatus: data.providerStatus,
        error: data.error,
        info: data.info,
        configured: Boolean(data.configured ?? true),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Resend an SMS message
   */
  public async resend(record: SmsOutbox): Promise<TwilioSmsResult> {
    return this.sendSms({
      to: record.toPhone,
      message: record.message,
      alertType: record.type,
      language: record.language,
      patientId: record.patientId,
    });
  }

  /**
   * Delete an SMS record from local storage persistence
   */
  public async deleteRecord(id: number): Promise<void> {
    try {
      await db.smsOutbox.delete(id);
    } catch {}

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
        if (raw) {
          const list: SmsOutbox[] = JSON.parse(raw);
          const filtered = list.filter((r) => r.id !== id);
          window.localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(filtered));
        }
      }
    } catch {}
  }

  /**
   * Clear all SMS history from local storage persistence
   */
  public async clearHistory(): Promise<void> {
    try {
      await db.smsOutbox.clear();
    } catch {}

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
      }
    } catch {}
  }
}

export const twilioSmsService = TwilioSmsService.getInstance();

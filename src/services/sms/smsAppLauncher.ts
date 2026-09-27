import { db, SmsOutbox } from '../../db/db';

export type SmsAppLaunchStatus =
  | 'DRAFT'
  | 'READY_TO_OPEN'
  | 'SMS_APP_OPEN_REQUESTED'
  | 'USER_MUST_SEND'
  | 'SENT_STATUS_UNKNOWN'
  | 'FAILED_TO_OPEN';

export interface SmsLaunchResult {
  success: boolean;
  status: SmsAppLaunchStatus;
  smsUri: string;
  message: string;
  recipientPhone: string;
  messageText: string;
  isIos: boolean;
  outboxId?: number;
}

/**
 * Detects whether the current device is running iOS (iPhone, iPad, iPod)
 */
export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Builds platform-aware sms: URI with safe URL encoding for Unicode (Tamil, Telugu, Hindi, etc.)
 */
export function buildSmsUri(recipientPhone: string, message: string): string {
  const cleanPhone = (recipientPhone || '').trim();
  const cleanMessage = (message || '').trim();
  const encodedPhone = encodeURIComponent(cleanPhone);
  const encodedBody = encodeURIComponent(cleanMessage);

  if (isIosDevice()) {
    // iOS uses semicolon or ampersand separator for query parameters in sms: scheme
    return `sms:${encodedPhone}&body=${encodedBody}`;
  }

  // Android & RFC 5724 standard format
  return `sms:${encodedPhone}?body=${encodedBody}`;
}

/**
 * Opens device's external SMS app with recipient & message prefilled.
 * Does NOT send the message automatically.
 * Does NOT mark it as sent or delivered.
 * Preserves draft in local IndexedDB outbox.
 */
export async function openExternalSmsApp(
  recipientPhone: string,
  message: string,
  options?: {
    alertType?: string;
    language?: string;
    patientId?: number;
    consultationId?: string | number;
  }
): Promise<SmsLaunchResult> {
  const cleanPhone = (recipientPhone || '').trim();
  const cleanMessage = (message || '').trim();
  const isIos = isIosDevice();
  const smsUri = buildSmsUri(cleanPhone, cleanMessage);

  // 1. Immediately launch external SMS app synchronously within user click gesture
  try {
    if (typeof window !== 'undefined') {
      try {
        window.location.href = smsUri;
      } catch {}
      try {
        const link = document.createElement('a');
        link.href = smsUri;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {}
    }
  } catch (launchErr) {
    console.warn('[SmsAppLauncher] Launch attempt:', launchErr);
  }

  // 2. Save draft to local Outbox so patient/clinician can reopen later
  let outboxId: number | undefined;
  try {
    const record: SmsOutbox = {
      toPhone: cleanPhone,
      message: cleanMessage,
      type: options?.alertType || 'CONSULTATION_SMS',
      language: options?.language || 'en',
      status: 'PENDING_USER_SEND',
      createdAt: new Date().toISOString(),
      info: 'SMS app open requested via native sms handler',
      patientId: options?.patientId,
    };
    outboxId = await db.smsOutbox.add(record);
  } catch (e) {
    console.warn('[SmsAppLauncher] Error saving to local outbox:', e);
  }

  return {
    success: true,
    status: 'SMS_APP_OPEN_REQUESTED',
    smsUri,
    message: `SMS app opened for ${cleanPhone}. Message pre-filled. Press Send in your phone app.`,
    recipientPhone: cleanPhone,
    messageText: cleanMessage,
    isIos,
    outboxId,
  };
}

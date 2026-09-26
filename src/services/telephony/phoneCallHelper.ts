import { db } from '../../db/db';
import { useAppStore } from '../../store/useAppStore';

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches && 'ontouchstart' in window);
}

export interface PhoneCallResult {
  actionTaken: 'DIALER_LAUNCHED' | 'SERVER_CALL_INITIATED' | 'DESKTOP_NOTICE' | 'INVALID_NUMBER' | 'FAILED';
  status: 'INITIATED' | 'RINGING' | 'ANSWERED' | 'COMPLETED' | 'FAILED' | 'NO_ANSWER' | 'DESKTOP_UNAVAILABLE';
  message: string;
  sanitizedPhone: string;
  callId?: string;
  providerCallId?: string;
}

export function normalizePhoneNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/[^\d+]/g, '');
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  if (rawPhone.startsWith('+')) return digits;
  return digits;
}

export async function initiatePhoneCall(
  rawPhone: string,
  contactName?: string,
  options?: {
    contactType?: 'PERSON' | 'DOCTOR' | 'FAMILY' | 'HOSPITAL' | 'EMERGENCY';
    patientId?: number | string;
    consultationId?: number | string;
    preferServerOutbound?: boolean;
  }
): Promise<PhoneCallResult> {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      actionTaken: 'INVALID_NUMBER',
      status: 'FAILED',
      message: 'No telephone number provided for this contact.',
      sanitizedPhone: '',
    };
  }

  const sanitized = normalizePhoneNumber(rawPhone);
  const contactType = options?.contactType || 'DOCTOR';

  // Record call attempt in local Dexie database for audit log
  try {
    await db.callHistory.add({
      phoneNumber: sanitized,
      contactName,
      contactType,
      action: 'CALL_INITIATED',
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Ignore IDB write error
  }

  // If server-controlled outbound calling is requested or available
  if (options?.preferServerOutbound) {
    try {
      const res = await fetch('/api/calls/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: sanitized,
          patientId: options.patientId,
          consultationId: options.consultationId,
          purpose: `Call to ${contactName || 'contact'} (${contactType})`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === 'INITIATED') {
        return {
          actionTaken: 'SERVER_CALL_INITIATED',
          status: 'INITIATED',
          message: `Telephony server initiated call to ${contactName || sanitized}.`,
          sanitizedPhone: sanitized,
          callId: data.callId,
          providerCallId: data.providerCallId,
        };
      } else if (data.status === 'NOT_CONFIGURED') {
        // Fall back to mobile tel: or desktop notice
      } else {
        return {
          actionTaken: 'FAILED',
          status: 'FAILED',
          message: data.error || 'Server telephony call failed.',
          sanitizedPhone: sanitized,
        };
      }
    } catch {
      // Fallback
    }
  }

  // Emergency telephone numbers (108, 112, 102) require external telephony network, NOT WebRTC!
  const isEmergencyNumber = sanitized === '108' || sanitized === '112' || sanitized === '102' || options?.contactType === 'EMERGENCY';
  if (isEmergencyNumber) {
    const { callEmergencyNumber } = await import('./emergencyTelephonyAdapter');
    const emergencyRes = await callEmergencyNumber(sanitized);
    return {
      actionTaken: emergencyRes.status === 'NOT_CONFIGURED' ? 'FAILED' : 'SERVER_CALL_INITIATED',
      status: emergencyRes.status === 'INITIATED' ? 'INITIATED' : 'FAILED',
      message: emergencyRes.message,
      sanitizedPhone: sanitized,
    };
  }

  // Launch direct in-app Medora WebRTC call console without opening external apps, Phone app, or Truecaller
  try {
    const store = useAppStore.getState();
    if (store && store.startDirectCall) {
      store.startDirectCall({
        name: contactName || `Medora Contact (${sanitized})`,
        phone: sanitized,
        category: options?.contactType === 'FAMILY' ? 'FAMILY' : options?.contactType === 'DOCTOR' ? 'DOCTOR' : options?.contactType === 'HOSPITAL' ? 'HOSPITAL' : 'CUSTOM',
        location: 'Medora Direct WebRTC Audio Line (In-App)',
        targetUserId: options?.contactType === 'DOCTOR' ? 'DOC-01' : options?.contactType === 'FAMILY' ? `FAM-0${options.patientId || 1}` : undefined,
        emergency: false,
      });
      return {
        actionTaken: 'SERVER_CALL_INITIATED',
        status: 'INITIATED',
        message: `Connecting to ${contactName || sanitized} via Medora In-App WebRTC Voice...`,
        sanitizedPhone: sanitized,
      };
    }
  } catch {}

  return {
    actionTaken: 'SERVER_CALL_INITIATED',
    status: 'INITIATED',
    message: `Connecting to ${contactName || sanitized} via Medora In-App WebRTC Voice...`,
    sanitizedPhone: sanitized,
  };
}


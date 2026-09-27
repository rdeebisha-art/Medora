import { useAppStore, ActiveCallInfo } from '../../store/useAppStore';

/**
 * Phone Number Utilities for Medora
 * Normalizes phone numbers for safe tel: URI generation
 * Works completely offline without external APIs
 */

export interface NormalizedPhoneResult {
  isValid: boolean;
  raw: string;
  normalized: string;
  telUri: string | null;
  error?: string;
}

/**
 * Normalizes phone number, preserving country code if entered, removing formatting spaces/dashes
 */
export function normalizePhoneNumber(input: string): NormalizedPhoneResult {
  const raw = (input || '').trim();

  if (!raw) {
    return {
      isValid: false,
      raw,
      normalized: '',
      telUri: null,
      error: 'Please enter a phone number',
    };
  }

  // Prevent injection or script tags
  if (/[<>"'`;\\]/.test(raw)) {
    return {
      isValid: false,
      raw,
      normalized: '',
      telUri: null,
      error: 'Invalid characters in phone number',
    };
  }

  const hasLeadingPlus = raw.startsWith('+');
  const digitsOnly = raw.replace(/\D/g, '');

  if (digitsOnly.length < 3) {
    return {
      isValid: false,
      raw,
      normalized: '',
      telUri: null,
      error: 'Phone number is too short',
    };
  }

  if (digitsOnly.length > 15) {
    return {
      isValid: false,
      raw,
      normalized: '',
      telUri: null,
      error: 'Phone number is too long',
    };
  }

  // Standard emergency numbers like 108, 112, 102, 100
  if (digitsOnly.length === 3 || digitsOnly.length === 4) {
    return {
      isValid: true,
      raw,
      normalized: digitsOnly,
      telUri: `tel:${digitsOnly}`,
    };
  }

  let normalized = hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;

  // If 10 digits and starts with 6-9 (standard Indian mobile), format cleanly
  if (!hasLeadingPlus && digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
    normalized = `+91${digitsOnly}`;
  }

  return {
    isValid: true,
    raw,
    normalized,
    telUri: `tel:${normalized}`,
  };
}

export function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches && 'ontouchstart' in window);
}

export type DeviceCallStatus =
  | 'IDLE'
  | 'DIALER_OPEN_REQUESTED'
  | 'CALL_INITIATED_BY_DEVICE'
  | 'CALL_IN_PROGRESS'
  | 'CALL_ENDED'
  | 'CALL_FAILED'
  | 'STATUS_UNKNOWN';

export interface DeviceDialerResult {
  success: boolean;
  status: DeviceCallStatus;
  actionTaken: 'DIALER_OPEN_REQUESTED' | 'INVALID_NUMBER' | 'DESKTOP_FALLBACK' | 'FAILED';
  message: string;
  normalizedPhone: string;
  rawInput: string;
  telUri: string | null;
  isMobile: boolean;
}

/**
 * Initiates an external phone call using the device's native phone dialer via safe tel: URI.
 * Does NOT pretend that Medora itself connected the call.
 * Does NOT claim the call was answered or connected.
 */
export function openDeviceDialer(phoneNumber: string, contactName?: string): DeviceDialerResult {
  const result = normalizePhoneNumber(phoneNumber);
  const isMobile = isMobileBrowser();

  if (!result.isValid || !result.telUri) {
    return {
      success: false,
      status: 'CALL_FAILED',
      actionTaken: 'INVALID_NUMBER',
      message: result.error || 'Please enter a valid phone number with 3 to 15 digits.',
      normalizedPhone: result.normalized || '',
      rawInput: phoneNumber,
      telUri: null,
      isMobile,
    };
  }

  const cleanNum = result.normalized;

  try {
    if (typeof window !== 'undefined') {
      try {
        window.location.href = result.telUri;
      } catch {}
      try {
        const link = document.createElement('a');
        link.href = result.telUri;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {}
    }

    const message = isMobile
      ? 'Phone dialer opened. Review the number and press Call in your phone app.'
      : 'Phone dialer requested. A compatible calling application or mobile device is required to place the call.';

    return {
      success: true,
      status: 'DIALER_OPEN_REQUESTED',
      actionTaken: isMobile ? 'DIALER_OPEN_REQUESTED' : 'DESKTOP_FALLBACK',
      message,
      normalizedPhone: cleanNum,
      rawInput: phoneNumber,
      telUri: result.telUri,
      isMobile,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'CALL_FAILED',
      actionTaken: 'FAILED',
      message: `Failed to open phone dialer: ${err?.message || 'Unsupported browser'}. Please dial ${cleanNum} manually.`,
      normalizedPhone: cleanNum,
      rawInput: phoneNumber,
      telUri: result.telUri,
      isMobile,
    };
  }
}

/**
 * Backward compatibility wrapper for in-app or dialer calls.
 * Clearly separates WebRTC in-app calls (for Medora users) from external phone numbers.
 */
export function callPhoneNumber(
  phoneNumber: string,
  contactName?: string,
  category?: ActiveCallInfo['category'],
  location?: string
): { success: boolean; message: string; telUri?: string; actionTaken: string } {
  const dialerResult = openDeviceDialer(phoneNumber, contactName);

  return {
    success: dialerResult.success,
    message: dialerResult.message,
    telUri: dialerResult.telUri || undefined,
    actionTaken: dialerResult.actionTaken,
  };
}


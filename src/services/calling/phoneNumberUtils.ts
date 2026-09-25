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

/**
 * Initiates native phone dialer via tel: URI on mobile, or desktop advisory
 * Returns status indicating whether action was dispatched
 */
export function callPhoneNumber(phoneNumber: string): { success: boolean; message: string; telUri?: string; actionTaken: string } {
  const result = normalizePhoneNumber(phoneNumber);

  if (!result.isValid || !result.telUri) {
    return {
      success: false,
      message: result.error || 'Please enter a valid phone number.',
      actionTaken: 'INVALID_NUMBER',
    };
  }

  if (isMobileBrowser()) {
    try {
      // Hand off to device native dialer via tel: URI
      window.location.href = result.telUri;
      return {
        success: true,
        message: `Opening phone dialer for ${result.normalized}...`,
        telUri: result.telUri,
        actionTaken: 'DIALER_LAUNCHED',
      };
    } catch {
      return {
        success: false,
        message: 'Could not open phone dialer on this device.',
        actionTaken: 'FAILED',
      };
    }
  } else {
    return {
      success: false,
      message: `This device cannot place a cellular call. Use a supported calling application or dial ${result.normalized} on your mobile phone.`,
      telUri: result.telUri,
      actionTaken: 'DESKTOP_NOTICE',
    };
  }
}


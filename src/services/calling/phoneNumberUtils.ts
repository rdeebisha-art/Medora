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

/**
 * Initiates native phone dialer via tel: URI
 * Returns status indicating whether action was dispatched
 */
export function callPhoneNumber(phoneNumber: string): { success: boolean; message: string; telUri?: string } {
  const result = normalizePhoneNumber(phoneNumber);

  if (!result.isValid || !result.telUri) {
    return {
      success: false,
      message: result.error || 'Please enter a valid phone number.',
    };
  }

  try {
    // Hand off to device native dialer via tel: URI
    window.location.href = result.telUri;
    return {
      success: true,
      message: 'Opening your phone app...',
      telUri: result.telUri,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Could not open phone dialer on this device.',
    };
  }
}

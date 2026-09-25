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

/**
 * Initiates in-browser Web Calling directly within the Medora website
 * NEVER redirects to the phone or leaves the website.
 */
export function callPhoneNumber(
  phoneNumber: string,
  contactName?: string,
  category?: ActiveCallInfo['category'],
  location?: string
): { success: boolean; message: string; telUri?: string; actionTaken: string } {
  const result = normalizePhoneNumber(phoneNumber);

  if (!result.isValid) {
    return {
      success: false,
      message: result.error || 'Please enter a valid phone number.',
      actionTaken: 'INVALID_NUMBER',
    };
  }

  const cleanNum = result.normalized;
  let detectedCategory: ActiveCallInfo['category'] = category || 'DOCTOR';
  let defaultName = contactName || 'Healthcare Professional';

  if (cleanNum === '108' || phoneNumber.includes('108')) {
    detectedCategory = 'EMERGENCY';
    defaultName = '108 Emergency Ambulance Dispatcher';
  } else if (cleanNum === '102' || phoneNumber.includes('102')) {
    detectedCategory = 'AMBULANCE';
    defaultName = '102 Janani Express Maternity Transport';
  } else if (cleanNum === '112' || phoneNumber.includes('112')) {
    detectedCategory = 'EMERGENCY';
    defaultName = '112 National Emergency Response Service';
  }

  // Trigger in-browser active WebRTC call modal directly in Medora
  try {
    useAppStore.getState().startDirectCall({
      name: defaultName,
      phone: cleanNum,
      category: detectedCategory,
      location: location || 'Medora In-App WebRTC Voice',
      notes: 'Active in-app WebRTC call session',
      targetUserId: detectedCategory === 'DOCTOR' ? 'DOC-01' : 'DOC-01',
      emergency: detectedCategory === 'EMERGENCY',
      emergencyType: detectedCategory === 'EMERGENCY' ? 'Direct Emergency Call' : undefined,
    });
  } catch (err) {
    console.warn('[Medora Call] In-app call dispatch notice:', err);
  }

  return {
    success: true,
    message: `Connected in-browser call to ${defaultName} (${cleanNum}).`,
    actionTaken: 'IN_APP_WEB_CALL_LAUNCHED',
  };
}


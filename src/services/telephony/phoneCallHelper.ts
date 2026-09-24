export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches && 'ontouchstart' in window);
}

export interface PhoneCallResult {
  actionTaken: 'DIALER_LAUNCHED' | 'DESKTOP_NOTICE' | 'INVALID_NUMBER';
  message: string;
  sanitizedPhone: string;
}

export function initiatePhoneCall(rawPhone: string, contactName?: string): PhoneCallResult {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      actionTaken: 'INVALID_NUMBER',
      message: 'Calling is not configured for this demo contact.',
      sanitizedPhone: ''
    };
  }

  // Remove spaces, dashes, parentheses
  const sanitized = rawPhone.replace(/[^\d+]/g, '');

  if (isMobileDevice()) {
    // Attempt native browser telephone URI dispatch
    try {
      window.location.href = `tel:${sanitized}`;
      return {
        actionTaken: 'DIALER_LAUNCHED',
        message: contactName 
          ? `Opening native phone dialer for ${contactName} (${sanitized})...` 
          : `Opening native phone dialer (${sanitized})...`,
        sanitizedPhone: sanitized
      };
    } catch {
      return {
        actionTaken: 'DESKTOP_NOTICE',
        message: 'Phone calling is not available from this browser.',
        sanitizedPhone: sanitized
      };
    }
  } else {
    // Desktop browser notification - no false "Call Connected" claims
    return {
      actionTaken: 'DESKTOP_NOTICE',
      message: `Phone calling is not available from this browser. Please dial ${rawPhone} on your mobile telephone.`,
      sanitizedPhone: sanitized
    };
  }
}

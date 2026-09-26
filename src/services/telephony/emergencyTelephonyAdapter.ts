export interface EmergencyCallResult {
  status: 'NOT_CONFIGURED' | 'INITIATED' | 'FAILED';
  message: string;
}

/**
 * Emergency Telephony Adapter
 *
 * Emergency numbers (108 Ambulance, 112 National Emergency, 102 Maternity)
 * require a direct PSTN/telephony provider gateway (such as Twilio, Exotel, or local SIP trunk).
 * In-browser WebRTC connects peer-to-peer or to Medora WebRTC rooms, but cannot route
 * to public safety answering points (PSAP) without an active PSTN trunk.
 *
 * In accordance with Medora safety guidelines:
 * - Never fake an emergency call success state.
 * - Return NOT_CONFIGURED when gateway credentials are not present.
 */
export async function callEmergencyNumber(phoneNumber: string): Promise<EmergencyCallResult> {
  // Check if server-side telephony trunk is available (e.g., via backend env)
  try {
    const res = await fetch('/api/telephony/emergency-status');
    if (res.ok) {
      const data = await res.json();
      if (data.configured) {
        const dialRes = await fetch('/api/telephony/call-emergency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: phoneNumber }),
        });
        if (dialRes.ok) {
          return {
            status: 'INITIATED',
            message: `Emergency gateway dispatch initiated for ${phoneNumber}.`,
          };
        }
      }
    }
  } catch {
    // API endpoint not present or offline
  }

  return {
    status: 'NOT_CONFIGURED',
    message: `PSTN emergency calling to ${phoneNumber} is NOT CONFIGURED. Browser WebRTC lines cannot route to government emergency dispatch without an active telecom trunk. Please dial ${phoneNumber} directly on your mobile device.`,
  };
}

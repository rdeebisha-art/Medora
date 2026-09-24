import { TelephonyProvider, TelephonyCallSession } from './telephonyTypes';
import { conversationEngine } from '../voice/conversationEngine';

export class LocalTelephoneProvider implements TelephonyProvider {
  private activeCalls = new Map<string, TelephonyCallSession>();

  public isConfigured(): boolean {
    return false; // Local simulation only
  }

  public async startCall(phoneNumber: string): Promise<TelephonyCallSession> {
    const callId = `LOCAL-CALL-${Date.now()}`;
    const session: TelephonyCallSession = {
      callId,
      callerNumber: phoneNumber,
      status: 'connected',
      isDemoSimulation: true,
      durationSeconds: 0,
      providerNotice: 'AI Telephone Service – Demo. Real toll-free calling requires a connected telecom/voice provider.',
      createdAt: new Date().toISOString()
    };

    this.activeCalls.set(callId, session);
    return session;
  }

  public async endCall(callId: string): Promise<void> {
    const call = this.activeCalls.get(callId);
    if (call) {
      call.status = 'ended';
      this.activeCalls.set(callId, call);
    }
  }

  public async receiveSpeech(callId: string, transcript: string) {
    const turn = await conversationEngine.processUserInput(transcript);
    const call = this.activeCalls.get(callId);
    if (call) {
      call.detectedLanguage = turn.detectedLanguage;
      call.intent = turn.intent;
      call.lastSpokenText = turn.responseText;
      this.activeCalls.set(callId, call);
    }

    return {
      responseText: turn.responseText,
      language: turn.detectedLanguage
    };
  }

  public getCallStatus(callId: string): TelephonyCallSession | null {
    return this.activeCalls.get(callId) || null;
  }
}

export class RealTelephonyProvider implements TelephonyProvider {
  public isConfigured(): boolean {
    // Requires server side Twilio / Telecom integration
    return false;
  }

  public async startCall(phoneNumber: string): Promise<TelephonyCallSession> {
    throw new Error('Real telephonic gateway not initialized in offline mode.');
  }

  public async endCall(_callId: string): Promise<void> {}

  public async receiveSpeech(_callId: string, _transcript: string) {
    return { responseText: '', language: 'en-IN' as const };
  }

  public getCallStatus(_callId: string): TelephonyCallSession | null {
    return null;
  }
}

export const activeTelephonyProvider: TelephonyProvider = new LocalTelephoneProvider();

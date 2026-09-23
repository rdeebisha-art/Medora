import { SupportedLanguageCode } from '../../data/languages';
import { conversationEngine } from './conversationEngine';

export interface AudioData {
  sampleRate: number;
  channels: number;
  data: ArrayBuffer | string;
  transcript?: string;
  language?: SupportedLanguageCode;
}

export interface TelephonyAdapter {
  connect(): Promise<void>;
  receiveAudio(): Promise<AudioData>;
  sendAudio(audio: AudioData): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): 'idle' | 'ringing' | 'connected' | 'ended';
}

/**
 * MockTelephonyAdapter
 * Demonstrates how the same Medora conversation engine connects to a telephony audio stream
 * for future Toll-Free voice calls without requiring numeric DTMF menus.
 */
export class MockTelephonyAdapter implements TelephonyAdapter {
  private status: 'idle' | 'ringing' | 'connected' | 'ended' = 'idle';
  private onCallStateChange?: (state: 'idle' | 'ringing' | 'connected' | 'ended') => void;
  private onSpeechOutput?: (text: string, language: SupportedLanguageCode) => void;

  constructor(callbacks?: {
    onCallStateChange?: (state: 'idle' | 'ringing' | 'connected' | 'ended') => void;
    onSpeechOutput?: (text: string, language: SupportedLanguageCode) => void;
  }) {
    this.onCallStateChange = callbacks?.onCallStateChange;
    this.onSpeechOutput = callbacks?.onSpeechOutput;
  }

  public async connect(): Promise<void> {
    this.status = 'ringing';
    this.onCallStateChange?.(this.status);

    await new Promise((r) => setTimeout(r, 1200));

    this.status = 'connected';
    this.onCallStateChange?.(this.status);

    // Initial greeting in English or last detected
    const greeting = "Welcome to Medora Health Helpline. Please speak naturally in Tamil, Telugu, Malayalam, Kannada or English. How can I help you?";
    this.onSpeechOutput?.(greeting, 'en-IN');
  }

  public async receiveAudio(): Promise<AudioData> {
    return {
      sampleRate: 8000, // standard PSTN telephony rate
      channels: 1,
      data: new ArrayBuffer(0),
      transcript: ''
    };
  }

  public async processSpokenUtterance(spokenText: string): Promise<{
    responseText: string;
    language: SupportedLanguageCode;
    agentName: string;
    isEmergency: boolean;
  }> {
    if (this.status !== 'connected') {
      throw new Error('Telephony connection is not active.');
    }

    const result = await conversationEngine.processUserInput(spokenText);
    this.onSpeechOutput?.(result.responseText, result.detectedLanguage);

    return {
      responseText: result.responseText,
      language: result.detectedLanguage,
      agentName: result.agentName,
      isEmergency: result.isEmergency
    };
  }

  public async sendAudio(audio: AudioData): Promise<void> {
    console.log('[Telephony Audio Stream Outbound]', audio);
  }

  public async disconnect(): Promise<void> {
    this.status = 'ended';
    this.onCallStateChange?.(this.status);
    await new Promise((r) => setTimeout(r, 500));
    this.status = 'idle';
    this.onCallStateChange?.(this.status);
  }

  public getStatus(): 'idle' | 'ringing' | 'connected' | 'ended' {
    return this.status;
  }
}

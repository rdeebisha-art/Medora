import { SupportedLanguageCode } from '../../data/languages';
import { conversationEngine } from './conversationEngine';
import { conversationMemory } from './conversationMemory';

export interface AudioData {
  sampleRate: number;
  channels: number;
  data: ArrayBuffer | string;
  transcript?: string;
  language?: SupportedLanguageCode;
}

export interface PhoneNumberValidationResult {
  status: 'EMPTY' | 'INVALID' | 'VALID';
  message: string;
  formattedNumber: string;
  isValid: boolean;
}

/**
 * Validates entered Toll-Free or Mobile Phone Numbers.
 * Supports +91, hyphens, spaces, 10-digit Indian mobile, and 1800/1860 toll-free numbers.
 */
export function validatePhoneNumber(rawNumber: string): PhoneNumberValidationResult {
  const trimmed = (rawNumber || '').trim();

  if (!trimmed) {
    return {
      status: 'EMPTY',
      message: 'Please enter a phone number or toll-free number.',
      formattedNumber: '',
      isValid: false
    };
  }

  // Remove spaces, hyphens, brackets
  const cleaned = trimmed.replace(/[\s\-()]/g, '');

  // 1. Check Indian 1800 / 1860 Toll-Free numbers (e.g. 1800-123-4567 or 1800123456)
  if (/^(1800|1860)\d{6,7}$/.test(cleaned)) {
    return {
      status: 'VALID',
      message: 'Toll-Free number accepted. Connecting to Medora Voice Gateway...',
      formattedNumber: trimmed,
      isValid: true
    };
  }

  // 2. Check Standard Indian Mobile (+91 or 10 digits starting with 6, 7, 8, 9)
  const isPlus91 = cleaned.startsWith('+91');
  const digitsOnly = isPlus91 ? cleaned.substring(3) : cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;

  if (/^[6-9]\d{9}$/.test(digitsOnly)) {
    const formatted = `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
    return {
      status: 'VALID',
      message: 'Mobile number accepted. Starting Medora Voice Demo...',
      formattedNumber: formatted,
      isValid: true
    };
  }

  // 3. Fallback for international demo numbers with 7 to 15 digits
  if (/^\+?\d{7,15}$/.test(cleaned)) {
    return {
      status: 'VALID',
      message: 'Number accepted. Starting Medora Voice Demo...',
      formattedNumber: trimmed,
      isValid: true
    };
  }

  return {
    status: 'INVALID',
    message: 'Please enter a valid 10-digit mobile number or 1800 toll-free number.',
    formattedNumber: trimmed,
    isValid: false
  };
}

export interface TelephonyAdapter {
  connect(callerNumber?: string): Promise<void>;
  receiveAudio(): Promise<AudioData>;
  sendAudio(audio: AudioData): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): 'idle' | 'ringing' | 'connected' | 'ended';
  getCallerNumber(): string;
  setCallerNumber(num: string): void;
}

/**
 * MockTelephonyAdapter
 * Demonstrates how the same Medora conversation engine connects to a telephony audio stream
 * for future Toll-Free voice calls without requiring numeric DTMF menus.
 */
export class MockTelephonyAdapter implements TelephonyAdapter {
  private status: 'idle' | 'ringing' | 'connected' | 'ended' = 'idle';
  private callerNumber: string = '+91 9876543210';
  private onCallStateChange?: (state: 'idle' | 'ringing' | 'connected' | 'ended') => void;
  private onSpeechOutput?: (text: string, language: SupportedLanguageCode) => void;

  constructor(callbacks?: {
    onCallStateChange?: (state: 'idle' | 'ringing' | 'connected' | 'ended') => void;
    onSpeechOutput?: (text: string, language: SupportedLanguageCode) => void;
  }) {
    this.onCallStateChange = callbacks?.onCallStateChange;
    this.onSpeechOutput = callbacks?.onSpeechOutput;
  }

  public setCallerNumber(num: string) {
    this.callerNumber = num;
    conversationMemory.setCallerNumber(num);
  }

  public getCallerNumber(): string {
    return this.callerNumber || conversationMemory.getCallerNumber();
  }

  public async connect(callerNumber?: string): Promise<void> {
    if (callerNumber) {
      this.setCallerNumber(callerNumber);
    }

    this.status = 'ringing';
    this.onCallStateChange?.(this.status);

    await new Promise((r) => setTimeout(r, 1000));

    this.status = 'connected';
    this.onCallStateChange?.(this.status);

    // Initial greeting
    const greeting = "Welcome to Medora Health Helpline. Please speak naturally in Tamil, Telugu, Malayalam, Kannada or English. Tell me what is wrong.";
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
    await new Promise((r) => setTimeout(r, 400));
    this.status = 'idle';
    this.onCallStateChange?.(this.status);
  }

  public getStatus(): 'idle' | 'ringing' | 'connected' | 'ended' {
    return this.status;
  }
}

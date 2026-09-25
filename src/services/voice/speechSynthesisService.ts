import { SupportedLanguageCode, LANGUAGE_METADATA } from '../../data/languages';

export type SpeechStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'PAUSED' | 'STOPPED' | 'ERROR';

export interface TTSVoiceStatus {
  isSupported: boolean;
  hasMatchingVoice: boolean;
  voiceName?: string;
  langCode: SupportedLanguageCode;
}

export class SpeechSynthesisService {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private status: SpeechStatus = 'IDLE';
  private statusListeners: Array<(status: SpeechStatus) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public setStatus(status: SpeechStatus) {
    this.status = status;
    this.statusListeners.forEach((fn) => {
      try {
        fn(status);
      } catch (e) {
        console.warn('Speech status listener error:', e);
      }
    });
  }

  public getStatus(): SpeechStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: SpeechStatus) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Validates that detected language, response language, and TTS language strictly match.
   */
  public validateConversationLanguage(
    detected: SupportedLanguageCode,
    response: SupportedLanguageCode,
    tts: SupportedLanguageCode
  ): boolean {
    return detected === response && response === tts;
  }

  /**
   * Finds the best matching SpeechSynthesis voice for a given language.
   */
  public getVoiceForLanguage(targetLang: SupportedLanguageCode): SpeechSynthesisVoice | undefined {
    if (!this.synth) return undefined;
    const voices = this.synth.getVoices();
    const prefix = targetLang.slice(0, 2).toLowerCase();
    return (
      voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix))
    );
  }

  /**
   * Checks if an installed native voice exists on this device for the given language.
   */
  public checkVoiceAvailability(targetLang: SupportedLanguageCode): TTSVoiceStatus {
    if (!this.synth) {
      return { isSupported: false, hasMatchingVoice: false, langCode: targetLang };
    }

    const matchedVoice = this.getVoiceForLanguage(targetLang);

    return {
      isSupported: true,
      hasMatchingVoice: !!matchedVoice,
      voiceName: matchedVoice?.name,
      langCode: targetLang
    };
  }

  /**
   * Speaks the response with strict same-language guarantee.
   * NEVER speaks English if the conversation language is Tamil/Telugu/Malayalam/Kannada.
   * Cancels any prior ongoing speech immediately before starting new utterance.
   */
  public speakResponse(
    text: string,
    targetLang: SupportedLanguageCode,
    conversationLang: SupportedLanguageCode,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (reason: string) => void
  ): boolean {
    // 1. Same-language pipeline validation check
    if (!this.validateConversationLanguage(conversationLang, targetLang, targetLang)) {
      console.error(
        `Safety Violation: Language mismatch safeguard. Target=${targetLang}, Conversation=${conversationLang}`
      );
      this.setStatus('ERROR');
      onError?.(`Language mismatch safeguard prevented audio playback.`);
      return false;
    }

    if (!this.synth) {
      this.setStatus('ERROR');
      onError?.('Speech synthesis is not supported in this browser environment.');
      return false;
    }

    // 2. CRITICAL: Cancel any existing speech before starting new speech!
    this.stop();

    const matchedVoice = this.getVoiceForLanguage(targetLang);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.rate = 0.90; // Clear, measured pace for rural healthcare users
    utterance.pitch = 1.0;

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.setStatus('SPEAKING');
      onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.setStatus('IDLE');
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.setStatus('STOPPED');
      onError?.('Speech playback was stopped or interrupted.');
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  /**
   * CRITICAL: Immediate speech cancellation when user taps "Stop Speaking".
   * Stops audio immediately, updates status to STOPPED, and leaves conversation state intact.
   */
  public stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('Speech cancel notice:', e);
      }
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.setStatus('STOPPED');
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public pause(): void {
    if (this.synth && this.isSpeaking) {
      try {
        this.synth.pause();
        this.setStatus('PAUSED');
      } catch (e) {
        console.warn('Speech pause notice:', e);
      }
    }
  }

  public resume(): void {
    if (this.synth && this.status === 'PAUSED') {
      try {
        this.synth.resume();
        this.setStatus('SPEAKING');
      } catch (e) {
        console.warn('Speech resume notice:', e);
      }
    }
  }
}

export const speechSynthesisService = new SpeechSynthesisService();
export const speechService = speechSynthesisService;

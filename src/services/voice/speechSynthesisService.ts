import { SupportedLanguageCode, LANGUAGE_METADATA } from '../../data/languages';

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

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  /**
   * Checks if an installed voice exists on the device for the given language.
   */
  public checkVoiceAvailability(targetLang: SupportedLanguageCode): TTSVoiceStatus {
    if (!this.synth) {
      return { isSupported: false, hasMatchingVoice: false, langCode: targetLang };
    }

    const voices = this.synth.getVoices();
    const prefix = targetLang.slice(0, 2).toLowerCase();
    const matchedVoice = voices.find(
      (v) => v.lang.toLowerCase() === targetLang.toLowerCase() || v.lang.toLowerCase().replace('_', '-').startsWith(prefix)
    );

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
   */
  public speakResponse(
    text: string,
    targetLang: SupportedLanguageCode,
    conversationLang: SupportedLanguageCode,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (reason: string) => void
  ): boolean {
    // 1. Same-language safety check
    if (targetLang !== conversationLang) {
      console.error(`Safety Violation: Attempted to speak in ${targetLang} while conversation is in ${conversationLang}`);
      onError?.(`Language mismatch safeguard prevented audio playback.`);
      return false;
    }

    if (!this.synth) {
      onError?.('Speech synthesis is not supported in this browser environment.');
      return false;
    }

    this.stop();

    const voiceStatus = this.checkVoiceAvailability(targetLang);

    // If an Indic voice is not installed on this device, do NOT speak English
    if (!voiceStatus.hasMatchingVoice && targetLang !== 'en-IN') {
      const meta = LANGUAGE_METADATA[targetLang];
      console.warn(`No native voice pack found for ${meta.nativeName} (${targetLang}). Falling back to visual text display.`);
      onError?.(`Native voice for ${meta.nativeName} (${meta.name}) is not installed on this device. Please read the response text below.`);
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.rate = 0.90; // Slower and clear for rural users
    utterance.pitch = 1.0;

    const voices = this.synth.getVoices();
    const prefix = targetLang.slice(0, 2).toLowerCase();
    const matchedVoice = voices.find(
      (v) => v.lang.toLowerCase() === targetLang.toLowerCase() || v.lang.toLowerCase().replace('_', '-').startsWith(prefix)
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis playback notice:', e);
      this.isSpeaking = false;
      this.currentUtterance = null;
      onError?.('Speech playback was interrupted.');
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechSynthesisService = new SpeechSynthesisService();

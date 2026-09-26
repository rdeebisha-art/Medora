import { SupportedLanguageCode, LANGUAGE_METADATA } from '../../data/languages';

export type SpeechStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'PAUSED' | 'STOPPED' | 'ERROR';

export interface TTSVoiceStatus {
  isSupported: boolean;
  hasMatchingVoice: boolean;
  voiceName?: string;
  langCode: SupportedLanguageCode;
  statusMessage: string;
}

export interface SpeechCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onPause?: () => void;
  onResume?: () => void;
}

export class SpeechSynthesisService {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private status: SpeechStatus = 'IDLE';
  private statusListeners: Array<(status: SpeechStatus) => void> = [];
  private voiceListeners: Array<() => void> = [];
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
    }
  }

  private initVoices(): void {
    if (!this.synth) return;
    try {
      this.cachedVoices = this.synth.getVoices();
      const onVoicesHandler = () => {
        if (this.synth) {
          this.cachedVoices = this.synth.getVoices();
          this.voiceListeners.forEach((fn) => {
            try { fn(); } catch (e) { console.warn('Voice listener error:', e); }
          });
        }
      };

      if (this.synth.addEventListener) {
        this.synth.addEventListener('voiceschanged', onVoicesHandler);
      } else {
        this.synth.onvoiceschanged = onVoicesHandler;
      }
    } catch (e) {
      console.warn('[SpeechSynthesis] Error initializing voices:', e);
    }
  }

  public onVoicesChanged(callback: () => void): () => void {
    this.voiceListeners.push(callback);
    return () => {
      this.voiceListeners = this.voiceListeners.filter((cb) => cb !== callback);
    };
  }

  public setStatus(status: SpeechStatus): void {
    this.status = status;
    this.isSpeaking = status === 'SPEAKING';
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

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.cachedVoices.length === 0) {
      this.cachedVoices = this.synth.getVoices();
    }
    return this.cachedVoices;
  }

  /**
   * Finds the best matching SpeechSynthesis voice for a given language.
   * Matches exact BCP-47 tag first (e.g. 'ta-IN'), then language prefix (e.g. 'ta').
   */
  public getVoiceForLanguage(targetLang: SupportedLanguageCode): SpeechSynthesisVoice | undefined {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return undefined;

    const normalizedTarget = targetLang.toLowerCase().replace('_', '-');
    const prefix = targetLang.slice(0, 2).toLowerCase();

    // 1. Exact match e.g. 'ta-IN' or 'en-IN'
    const exactMatch = voices.find(
      (v) => v.lang.toLowerCase().replace('_', '-') === normalizedTarget
    );
    if (exactMatch) return exactMatch;

    // 2. Prefix match e.g. 'ta' or 'hi'
    const prefixMatch = voices.find((v) =>
      v.lang.toLowerCase().replace('_', '-').startsWith(prefix)
    );
    if (prefixMatch) return prefixMatch;

    return undefined;
  }

  /**
   * Checks if an installed native voice exists on this device for the given language.
   * Explains limitations clearly without crashing or assuming voices exist.
   */
  public checkVoiceAvailability(targetLang: SupportedLanguageCode): TTSVoiceStatus {
    if (!this.synth) {
      return {
        isSupported: false,
        hasMatchingVoice: false,
        langCode: targetLang,
        statusMessage: 'Speech synthesis is not supported on this browser or device.',
      };
    }

    const matchedVoice = this.getVoiceForLanguage(targetLang);
    const langName = LANGUAGE_METADATA[targetLang]?.name || targetLang;

    if (matchedVoice) {
      return {
        isSupported: true,
        hasMatchingVoice: true,
        voiceName: matchedVoice.name,
        langCode: targetLang,
        statusMessage: `Voice available: ${matchedVoice.name} (${matchedVoice.lang})`,
      };
    }

    return {
      isSupported: true,
      hasMatchingVoice: false,
      langCode: targetLang,
      statusMessage: `Speech output for ${langName} (${targetLang}) is unavailable on this device.`,
    };
  }

  /**
   * Speaks the response in the selected response language.
   * If no voice exists for the target language, DOES NOT silently speak in English.
   * Shows a clear notice and keeps text visible.
   */
  public speakResponse(
    text: string,
    targetLang: SupportedLanguageCode,
    _deprecatedConversationLang?: SupportedLanguageCode,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (reason: string) => void
  ): boolean {
    return this.speak(text, targetLang, {
      onStart,
      onEnd,
      onError,
    });
  }

  /**
   * Primary speak method with full lifecycle, voice matching, and error handling.
   */
  public speak(text: string, targetLang: SupportedLanguageCode, callbacks?: SpeechCallbacks): boolean {
    const cleanText = (text || '').trim();
    if (!cleanText) {
      this.setStatus('IDLE');
      return false;
    }

    if (!this.synth) {
      this.setStatus('ERROR');
      callbacks?.onError?.('Speech synthesis is not supported on this browser or device.');
      return false;
    }

    // Always stop and cancel any previous speech first to prevent overlapping
    this.stop();

    const voiceStatus = this.checkVoiceAvailability(targetLang);

    // If language is not English and device has no voice for this language:
    // DO NOT silently speak English! Inform user.
    if (!voiceStatus.hasMatchingVoice && !targetLang.startsWith('en')) {
      this.setStatus('ERROR');
      const langName = LANGUAGE_METADATA[targetLang]?.name || targetLang;
      const errorMsg = `Speech output for ${langName} (${targetLang}) is unavailable on this device.`;
      callbacks?.onError?.(errorMsg);
      return false;
    }

    const matchedVoice = this.getVoiceForLanguage(targetLang);

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = targetLang;
      utterance.rate = 0.90; // Clear, measured pace for rural healthcare users
      utterance.pitch = 1.0;

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.setStatus('SPEAKING');
        callbacks?.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.setStatus('IDLE');
        callbacks?.onEnd?.();
      };

      utterance.onpause = () => {
        this.setStatus('PAUSED');
        callbacks?.onPause?.();
      };

      utterance.onresume = () => {
        this.setStatus('SPEAKING');
        callbacks?.onResume?.();
      };

      utterance.onerror = (e) => {
        console.warn('[SpeechSynthesis] Error event:', e);
        this.isSpeaking = false;
        this.currentUtterance = null;
        // 'canceled' or 'interrupted' is common when stop() is called
        if (e.error === 'canceled' || e.error === 'interrupted') {
          this.setStatus('STOPPED');
          return;
        }
        this.setStatus('ERROR');
        callbacks?.onError?.(`Speech synthesis error: ${e.error || 'Playback failed'}`);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      return true;
    } catch (err: any) {
      console.warn('[SpeechSynthesis] Execution error:', err);
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.setStatus('ERROR');
      callbacks?.onError?.(`Speech failed: ${err?.message || 'Could not start audio'}`);
      return false;
    }
  }

  /**
   * Pauses the current speaking utterance if supported.
   */
  public pause(): void {
    if (this.synth && this.isSpeaking) {
      try {
        this.synth.pause();
        this.setStatus('PAUSED');
      } catch (e) {
        console.warn('[SpeechSynthesis] Pause error:', e);
      }
    }
  }

  /**
   * Resumes the paused utterance if supported.
   */
  public resume(): void {
    if (this.synth && this.status === 'PAUSED') {
      try {
        this.synth.resume();
        this.setStatus('SPEAKING');
      } catch (e) {
        console.warn('[SpeechSynthesis] Resume error:', e);
      }
    }
  }

  /**
   * Immediately cancels and stops all speech synthesis.
   * Clears queue, updates state to STOPPED, and ensures no overlapping audio.
   */
  public stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('[SpeechSynthesis] Cancel error:', e);
      }
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.setStatus('STOPPED');
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechSynthesisService = new SpeechSynthesisService();
export const speechService = speechSynthesisService;

import { VoiceNavigationLanguage } from './voiceNavigationTypes';

export interface VoiceRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string, errorCode?: string) => void;
  onEnd?: () => void;
}

export class VoiceRecognitionService {
  private recognition: any = null;
  private isListeningActive = false;

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  /**
   * Starts speech recognition with the requested BCP-47 language tag.
   */
  public startListening(
    language: VoiceNavigationLanguage,
    callbacks: VoiceRecognitionCallbacks
  ): boolean {
    if (!this.isSupported()) {
      callbacks.onError?.(
        'Voice recognition is not supported on this browser.',
        'not-supported'
      );
      return false;
    }

    this.stopListening();

    try {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognitionConstructor();
      this.recognition = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 2;

      recognition.onstart = () => {
        this.isListeningActive = true;
        callbacks.onStart?.();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcript = item[0]?.transcript || '';
          if (item.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const text = (finalTranscript || interimTranscript).trim();
        const isFinal = Boolean(finalTranscript);

        if (text) {
          callbacks.onResult?.(text, isFinal);
        }
      };

      recognition.onerror = (event: any) => {
        const error = event.error || 'unknown';
        const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;

        let message = 'Could not process audio.';
        if (error === 'not-allowed' || error === 'permission-denied') {
          message = 'Microphone permission denied. Please allow microphone access or type your command.';
        } else if (error === 'network') {
          if (isOffline) {
            message = 'Offline voice recognition is not available on this browser. Use the menu or type your command.';
          } else {
            message = 'Network connection error during voice recognition.';
          }
        } else if (error === 'no-speech') {
          message = 'No speech detected. Please speak clearly.';
        }

        callbacks.onError?.(message, error);
      };

      recognition.onend = () => {
        this.isListeningActive = false;
        callbacks.onEnd?.();
      };

      recognition.start();
      return true;
    } catch (err: any) {
      this.isListeningActive = false;
      callbacks.onError?.(
        err?.message || 'Failed to initialize speech recognition.',
        'init-failed'
      );
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    this.isListeningActive = false;
  }

  public abort(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
    this.isListeningActive = false;
  }

  public isListening(): boolean {
    return this.isListeningActive;
  }
}

export const voiceRecognitionService = new VoiceRecognitionService();

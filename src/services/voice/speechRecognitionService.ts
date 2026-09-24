import { SupportedLanguageCode } from '../../data/languages';

export interface SpeechRecognitionCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onStart: () => void;
  onEnd: () => void;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: SupportedLanguageCode = 'en-IN';

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;

      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    language: SupportedLanguageCode,
    callbacks: SpeechRecognitionCallbacks
  ): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      callbacks.onError('Speech recognition is not supported in this browser environment. Please use keyboard input.');
      return false;
    }

    try {
      this.stopListening();

      this.currentLanguage = language;
      this.recognition.lang = language;

      this.recognition.onstart = () => {
        this.isListening = true;
        callbacks.onStart();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const resultText = finalTranscript || interimTranscript;
        callbacks.onResult(resultText, !!finalTranscript);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        this.isListening = false;
        // Benign cancellation / interruption event: do not show scary toast
        if (event.error === 'aborted') {
          return;
        }
        let userMessage = 'Speech recognition error: ' + event.error;
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          userMessage = 'Microphone permission was denied. Please allow microphone access.';
        } else if (event.error === 'no-speech') {
          userMessage = 'No speech detected. Please tap Speak and speak clearly into your microphone.';
        }
        callbacks.onError(userMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        callbacks.onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      console.warn('Speech recognition start failed:', e);
      callbacks.onError(e?.message || 'Failed to start microphone.');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore stop error
      }
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();

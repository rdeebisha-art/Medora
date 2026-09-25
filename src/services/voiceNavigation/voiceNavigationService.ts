import { speechRecognitionService } from '../voice/speechRecognitionService';
import { voiceCommandMatcher, CommandMatchResult } from './voiceCommandMatcher';
import { SupportedLanguageCode } from '../../data/languages';
import { SupportedVoiceNavLang } from './voiceCommandDictionary';

export type VoiceNavState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'COMMAND_RECOGNIZED'
  | 'NAVIGATING'
  | 'NOT_UNDERSTOOD'
  | 'MICROPHONE_DENIED'
  | 'UNSUPPORTED'
  | 'OFFLINE_UNSUPPORTED';

export interface VoiceNavEvent {
  state: VoiceNavState;
  transcript: string;
  feedbackText: string;
  matchResult?: CommandMatchResult;
  isOffline: boolean;
}

export type VoiceNavListener = (event: VoiceNavEvent) => void;

class VoiceNavigationService {
  private state: VoiceNavState = 'IDLE';
  private transcript = '';
  private feedbackText = '';
  private lastMatchResult?: CommandMatchResult;
  private listeners: Set<VoiceNavListener> = new Set();
  private navigationTimer: ReturnType<typeof setTimeout> | null = null;

  public subscribe(listener: VoiceNavListener): () => void {
    this.listeners.add(listener);
    listener(this.getCurrentEvent());
    return () => this.listeners.delete(listener);
  }

  public getCurrentEvent(): VoiceNavEvent {
    return {
      state: this.state,
      transcript: this.transcript,
      feedbackText: this.feedbackText,
      matchResult: this.lastMatchResult,
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    };
  }

  private emit(partial?: Partial<VoiceNavEvent>) {
    const event = {
      ...this.getCurrentEvent(),
      ...partial,
    };
    this.state = event.state;
    this.transcript = event.transcript;
    this.feedbackText = event.feedbackText;
    this.lastMatchResult = event.matchResult;

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('[VoiceNav] Listener error:', err);
      }
    }
  }

  public getBcp47Code(lang: SupportedVoiceNavLang): SupportedLanguageCode {
    switch (lang) {
      case 'ta': return 'ta-IN';
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'ml': return 'ml-IN';
      case 'kn': return 'kn-IN';
      case 'en':
      default: return 'en-IN';
    }
  }

  /**
   * Starts listening for a navigation command in the selected language.
   */
  public startListening(
    selectedLanguage: SupportedVoiceNavLang | 'app' | 'auto',
    appLanguage: string,
    onNavigate: (path: string) => void
  ): boolean {
    if (this.navigationTimer) {
      clearTimeout(this.navigationTimer);
      this.navigationTimer = null;
    }

    const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;

    // Check browser speech recognition support
    if (!speechRecognitionService.isSupported()) {
      this.emit({
        state: 'UNSUPPORTED',
        transcript: '',
        feedbackText: 'Voice navigation is not supported on this browser. You can type your command below.',
      });
      return false;
    }

    // Determine target BCP-47 code
    let langCode: SupportedVoiceNavLang = 'en';
    if (selectedLanguage === 'app') {
      langCode = (['ta', 'hi', 'te', 'ml', 'kn', 'en'].includes(appLanguage) ? appLanguage : 'en') as SupportedVoiceNavLang;
    } else if (selectedLanguage === 'auto') {
      langCode = (['ta', 'hi', 'te', 'ml', 'kn', 'en'].includes(appLanguage) ? appLanguage : 'en') as SupportedVoiceNavLang;
    } else {
      langCode = selectedLanguage;
    }

    const bcpCode = this.getBcp47Code(langCode);

    this.emit({
      state: 'LISTENING',
      transcript: '',
      feedbackText: 'Listening... Say where you want to go (e.g. "Open medicines")',
    });

    const success = speechRecognitionService.startListening(bcpCode, {
      onStart: () => {
        this.emit({
          state: 'LISTENING',
          transcript: '',
          feedbackText: 'Listening... Say where you want to go',
        });
      },
      onResult: (text: string, isFinal: boolean) => {
        this.emit({
          transcript: text,
          feedbackText: isFinal ? 'Processing command...' : text,
          state: isFinal ? 'PROCESSING' : 'LISTENING',
        });

        if (isFinal && text.trim()) {
          this.processCommand(text, selectedLanguage, appLanguage, onNavigate);
        }
      },
      onError: (_errText: string, errorCode?: string) => {
        if (errorCode === 'not-allowed' || errorCode === 'permission-denied') {
          this.emit({
            state: 'MICROPHONE_DENIED',
            feedbackText: 'Microphone permission denied. Please enable microphone or type your command.',
          });
        } else if (errorCode === 'network') {
          if (isOffline) {
            this.emit({
              state: 'OFFLINE_UNSUPPORTED',
              feedbackText: 'Offline voice recognition is not available on this browser. Use the menu or type your command.',
            });
          } else {
            this.emit({
              state: 'NOT_UNDERSTOOD',
              feedbackText: 'Network interruption during voice recognition. You can type your command below.',
            });
          }
        } else if (errorCode === 'no-speech') {
          this.emit({
            state: 'NOT_UNDERSTOOD',
            feedbackText: 'No speech heard. Please tap Speak and say where you want to go.',
          });
        } else {
          this.emit({
            state: 'NOT_UNDERSTOOD',
            feedbackText: 'Could not process audio. Please try again or type your command.',
          });
        }
      },
      onEnd: () => {
        if (this.state === 'LISTENING') {
          this.emit({ state: 'IDLE' });
        }
      },
    });

    return success;
  }

  /**
   * Processes a recognized or typed command string.
   */
  public processCommand(
    text: string,
    forcedLang: SupportedVoiceNavLang | 'app' | 'auto',
    appLang: string,
    onNavigate: (path: string) => void
  ): CommandMatchResult {
    const result = voiceCommandMatcher.matchCommand(text, forcedLang, appLang);

    if (result.matched && result.route) {
      this.emit({
        state: 'COMMAND_RECOGNIZED',
        transcript: text,
        feedbackText: result.feedbackText,
        matchResult: result,
      });

      // Give visual confirmation before navigating
      this.navigationTimer = setTimeout(() => {
        this.emit({
          state: 'NAVIGATING',
          feedbackText: result.feedbackText,
        });
        onNavigate(result.route!.path);

        // Reset to idle after navigation
        setTimeout(() => {
          this.emit({ state: 'IDLE', transcript: '', feedbackText: '' });
        }, 1200);
      }, 700);
    } else {
      this.emit({
        state: 'NOT_UNDERSTOOD',
        transcript: text,
        feedbackText: result.feedbackText,
        matchResult: result,
      });
    }

    return result;
  }

  /**
   * Text fallback: Executes typed commands 100% offline.
   */
  public executeTextCommand(
    typedText: string,
    selectedLanguage: SupportedVoiceNavLang | 'app' | 'auto',
    appLanguage: string,
    onNavigate: (path: string) => void
  ): CommandMatchResult {
    this.stopListening();
    this.emit({
      state: 'PROCESSING',
      transcript: typedText,
      feedbackText: 'Matching command...',
    });
    return this.processCommand(typedText, selectedLanguage, appLanguage, onNavigate);
  }

  public stopListening(): void {
    if (this.navigationTimer) {
      clearTimeout(this.navigationTimer);
      this.navigationTimer = null;
    }
    speechRecognitionService.stopListening();
    this.emit({ state: 'IDLE' });
  }

  public reset(): void {
    this.stopListening();
    this.emit({
      state: 'IDLE',
      transcript: '',
      feedbackText: '',
      matchResult: undefined,
    });
  }
}

export const voiceNavigationService = new VoiceNavigationService();

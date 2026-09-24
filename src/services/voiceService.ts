import { LanguageCode } from '../types';

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  private getVoiceLocale(lang: LanguageCode): string {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'ta': return 'ta-IN';
      case 'ml': return 'ml-IN';
      case 'kn': return 'kn-IN';
      case 'en':
      default: return 'en-IN';
    }
  }

  public speak(text: string, lang: LanguageCode, onStart?: () => void, onEnd?: () => void): void {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      // Simulate audio feedback callback
      onStart?.();
      setTimeout(() => onEnd?.(), 2500);
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLocale = this.getVoiceLocale(lang);
    utterance.lang = targetLocale;
    utterance.rate = 0.95; // slightly slower, clear for rural listeners
    utterance.pitch = 1.0;

    // Try finding matching voice
    const voices = this.synth.getVoices();
    const languagePrefix = targetLocale.slice(0, 2).toLowerCase();
    const matchedVoice = voices.find(v => v.lang.toLowerCase() === targetLocale.toLowerCase())
      || voices.find(v => v.lang.toLowerCase().startsWith(languagePrefix));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    } else {
      console.warn(`No installed speech voice matches ${targetLocale}. Install the browser/OS voice pack for this language.`);
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
      console.warn('Speech synthesis notice:', e);
      this.isSpeaking = false;
      this.currentUtterance = null;
      onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export const voiceService = new VoiceService();

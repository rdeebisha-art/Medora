import { LanguageCode } from '../types';
import { speechSynthesisService } from './voice/speechSynthesisService';
import { SupportedLanguageCode } from '../data/languages';

class VoiceService {
  private getVoiceLocale(lang: LanguageCode): SupportedLanguageCode {
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
    const locale = this.getVoiceLocale(lang);
    speechSynthesisService.speak(text, locale, {
      onStart,
      onEnd,
      onError: (err) => {
        console.warn('[VoiceService] Speak error:', err);
        onEnd?.();
      },
    });
  }

  public pause(): void {
    speechSynthesisService.pause();
  }

  public resume(): void {
    speechSynthesisService.resume();
  }

  public stop(): void {
    speechSynthesisService.stop();
  }

  public getSpeakingState(): boolean {
    return speechSynthesisService.getIsSpeaking();
  }
}

export const voiceService = new VoiceService();

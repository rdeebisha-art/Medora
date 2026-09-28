/**
 * Global Emergency Voice Trigger Service for Medora
 * Listens in the background for specific emergency phrases (e.g. "Help Medora", "Call 108")
 * and triggers immediate emergency call or alert protocols on the EmergencyPage.
 */

export type EmergencyActionType = 'call108' | 'doctor' | 'alert';

export interface EmergencyTriggerEvent {
  detectedPhrase: string;
  action: EmergencyActionType;
  timestamp: string;
  transcript: string;
}

export interface TriggerPhraseRule {
  phrase: string;
  action: EmergencyActionType;
  regex: RegExp;
  language: string;
}

export const EMERGENCY_TRIGGER_PHRASES: TriggerPhraseRule[] = [
  // English
  { phrase: 'help medora', action: 'alert', regex: /\b(help medora|medora help)\b/i, language: 'en' },
  { phrase: 'medora emergency', action: 'alert', regex: /\b(medora emergency|emergency medora)\b/i, language: 'en' },
  { phrase: 'call 108', action: 'call108', regex: /\b(call 108|dial 108|call one zero eight|108)\b/i, language: 'en' },
  { phrase: 'call ambulance', action: 'call108', regex: /\b(call ambulance|need ambulance|ambulance emergency)\b/i, language: 'en' },
  { phrase: 'call doctor', action: 'doctor', regex: /\b(call doctor|emergency doctor|doctor emergency)\b/i, language: 'en' },
  { phrase: 'emergency alert', action: 'alert', regex: /\b(emergency alert|send emergency alert|sos alert)\b/i, language: 'en' },

  // Tamil (தமிழ்)
  { phrase: 'உதவி', action: 'alert', regex: /உதவி|உதவி செய்யுங்கள்|காப்பாற்றுங்கள்/i, language: 'ta' },
  { phrase: '108 அழைக்கவும்', action: 'call108', regex: /108 அழைக்கவும்|ஆம்புலன்ஸ் அழைக்கவும்|ஆம்புலன்ஸ்/i, language: 'ta' },
  { phrase: 'அவசர சிகிச்சை', action: 'alert', regex: /அவசரம்|அவசர உதவி|மருத்துவ அவசரம்/i, language: 'ta' },
  { phrase: 'டாக்டரை அழைக்கவும்', action: 'doctor', regex: /டாக்டரை அழைக்கவும்|மருத்துவரை அழைக்கவும்/i, language: 'ta' },

  // Hindi (हिन्दी)
  { phrase: 'मदद करो', action: 'alert', regex: /मदद करो|मुझे मदद चाहिए|बचाओ/i, language: 'hi' },
  { phrase: '108 बुलाओ', action: 'call108', regex: /108 बुलाओ|एम्बुलेंस बुलाओ|108 को फोन करो/i, language: 'hi' },
  { phrase: 'आपातकाल', action: 'alert', regex: /आपातकाल|इमरजेंसी|संकट/i, language: 'hi' },
  { phrase: 'डॉक्टर को बुलाओ', action: 'doctor', regex: /डॉक्टर को बुलाओ|डॉक्टर से बात कराओ/i, language: 'hi' },

  // Telugu (తెలుగు)
  { phrase: 'సహాయం చేయండి', action: 'alert', regex: /సహాయం చేయండి|సహాయం|కాపాడండి/i, language: 'te' },
  { phrase: '108 కి కాల్ చేయండి', action: 'call108', regex: /108 కి కాల్ చేయండి|అంబులెన్స్ పిలవండి/i, language: 'te' },
  { phrase: 'అత్యవసరం', action: 'alert', regex: /అత్యవసరం|ఎమర్జెన్సీ/i, language: 'te' },

  // Malayalam (മലയാളം)
  { phrase: 'സഹായം', action: 'alert', regex: /സഹായം|രക്ഷിക്കൂ|സഹായിക്കൂ/i, language: 'ml' },
  { phrase: '108 വിളിക്കുക', action: 'call108', regex: /108 വിളിക്കുക|ആംബുലൻസ് വിളിക്കുക/i, language: 'ml' },
  { phrase: 'അടിയന്തരാവസ്ഥ', action: 'alert', regex: /അടിയന്തരാവസ്ഥ|അടിയന്തര സഹായം/i, language: 'ml' },

  // Kannada (ಕನ್ನಡ)
  { phrase: 'ಸಹಾಯ ಮಾಡಿ', action: 'alert', regex: /ಸಹಾಯ ಮಾಡಿ|ಕಾಪಾಡಿ/i, language: 'kn' },
  { phrase: '108 ಕರೆ ಮಾಡಿ', action: 'call108', regex: /108 ಕರೆ ಮಾಡಿ|ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆ ಮಾಡಿ/i, language: 'kn' },
  { phrase: 'ತುರ್ತು', action: 'alert', regex: /ತುರ್ತು|ತುರ್ತು ಸಹಾಯ/i, language: 'kn' },
];

export type EmergencyTriggerListener = (event: EmergencyTriggerEvent) => void;

class EmergencyVoiceTriggerService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isEnabled: boolean = false;
  private isTemporarilyPaused: boolean = false;
  private listeners: Set<EmergencyTriggerListener> = new Set();
  private restartTimeout: any = null;
  private lastTriggerTimestamp: number = 0;
  private cooldownMs: number = 6000; // 6-second debounce between triggers
  private currentLanguage: string = 'en-IN';

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('medora_emergency_voice_trigger');
        // Default to enabled so users have hands-free safety by default
        this.isEnabled = stored !== null ? stored === 'true' : true;
      } catch {
        this.isEnabled = true;
      }
    }
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;
    return !!SpeechRecognitionClass;
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    try {
      if (this.recognition) {
        try { this.recognition.abort(); } catch {}
        this.recognition = null;
      }

      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex || 0; i < event.results.length; i++) {
          transcript += event.results[i][0]?.transcript || '';
        }
        if (transcript.trim()) {
          this.evaluateTranscript(transcript.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        const err = event?.error;
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          this.isListening = false;
          return;
        }
        // Auto recover on transient errors
        this.scheduleRestart(1500);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.isEnabled && !this.isTemporarilyPaused) {
          this.scheduleRestart(1000);
        }
      };
    } catch (e) {
      console.warn('[EmergencyVoiceTrigger] Init error:', e);
      this.recognition = null;
      this.isListening = false;
    }
  }

  private scheduleRestart(delayMs = 1000) {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (!this.isEnabled || this.isTemporarilyPaused) return;

    this.restartTimeout = setTimeout(() => {
      if (this.isEnabled && !this.isTemporarilyPaused && !this.isListening) {
        this.startListening();
      }
    }, delayMs);
  }

  /**
   * Tests if the transcript contains any emergency phrases
   */
  public evaluateTranscript(transcript: string): EmergencyTriggerEvent | null {
    const now = Date.now();
    if (now - this.lastTriggerTimestamp < this.cooldownMs) {
      return null;
    }

    const clean = transcript.trim();
    for (const rule of EMERGENCY_TRIGGER_PHRASES) {
      if (rule.regex.test(clean)) {
        this.lastTriggerTimestamp = now;
        const event: EmergencyTriggerEvent = {
          detectedPhrase: rule.phrase,
          action: rule.action,
          timestamp: new Date().toISOString(),
          transcript: clean,
        };

        this.notifyListeners(event);
        return event;
      }
    }

    return null;
  }

  private notifyListeners(event: EmergencyTriggerEvent) {
    this.listeners.forEach((cb) => {
      try { cb(event); } catch (e) { console.error('Emergency trigger listener error:', e); }
    });
  }

  public addListener(listener: EmergencyTriggerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public setLanguage(langCode: string) {
    let bcp = 'en-IN';
    switch (langCode) {
      case 'ta': bcp = 'ta-IN'; break;
      case 'hi': bcp = 'hi-IN'; break;
      case 'te': bcp = 'te-IN'; break;
      case 'ml': bcp = 'ml-IN'; break;
      case 'kn': bcp = 'kn-IN'; break;
      default: bcp = 'en-IN'; break;
    }

    if (this.currentLanguage !== bcp) {
      this.currentLanguage = bcp;
      if (this.isListening) {
        this.stopListening();
        this.startListening();
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('medora_emergency_voice_trigger', String(enabled));
    } catch {}

    if (enabled) {
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public pause() {
    this.isTemporarilyPaused = true;
    this.stopListening();
  }

  public resume() {
    this.isTemporarilyPaused = false;
    if (this.isEnabled) {
      this.startListening();
    }
  }

  public startListening() {
    if (!this.isSupported() || !this.isEnabled || this.isTemporarilyPaused) return;
    if (this.isListening) return;

    if (!this.recognition) {
      this.initRecognition();
    }

    try {
      this.recognition?.start();
      this.isListening = true;
    } catch {
      // If already started or browser in transitional state
      this.initRecognition();
      try {
        this.recognition?.start();
        this.isListening = true;
      } catch {}
    }
  }

  public stopListening() {
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (!this.recognition) return;

    try {
      this.recognition.abort();
    } catch {}
    this.isListening = false;
  }

  /**
   * Helper to manually simulate a trigger (useful for testing and accessibility fallback)
   */
  public simulateTrigger(phrase: string = 'help medora', action: EmergencyActionType = 'alert') {
    const event: EmergencyTriggerEvent = {
      detectedPhrase: phrase,
      action,
      timestamp: new Date().toISOString(),
      transcript: `[SIMULATED VOICE TRIGGER] "${phrase}"`,
    };
    this.notifyListeners(event);
  }
}

export const emergencyVoiceTriggerService = new EmergencyVoiceTriggerService();

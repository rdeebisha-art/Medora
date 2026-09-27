import { SupportedLanguageCode } from '../../data/languages';

export interface SpeechRecognitionCallbacks {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string, errorCode?: string) => void;
  onStart: () => void;
  onEnd: () => void;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: SupportedLanguageCode = 'en-IN';
  private listeningTimeout: any = null;
  private silenceTimeout: any = null;
  private accumulatedTranscript: string = '';
  private activeCallbacks: SpeechRecognitionCallbacks | null = null;
  private hasDispatchedFinal: boolean = false;

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
        try {
          this.recognition = new SpeechRecognitionClass();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.maxAlternatives = 1;
        } catch (e) {
          console.warn('[SpeechRecognition] Init error:', e);
          this.recognition = null;
        }
      }
    }
  }

  public isSupported(): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }
    return !!this.recognition;
  }

  /**
   * Queries microphone permission state using browser Permissions API where supported.
   */
  public async getMicrophonePermissionStatus(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
    if (typeof navigator === 'undefined' || !navigator.permissions) {
      return 'unsupported';
    }
    try {
      // TypeScript lib sometimes does not have 'microphone' in PermissionName enum
      const status = await (navigator.permissions as any).query({ name: 'microphone' });
      return (status.state as 'granted' | 'denied' | 'prompt') || 'prompt';
    } catch {
      return 'unsupported';
    }
  }

  public getLocalizedError(errorCode: string, lang: SupportedLanguageCode): string {
    const langCode = lang.slice(0, 2);

    switch (errorCode) {
      case 'aborted':
        switch (langCode) {
          case 'ta':
            return 'குரல் கேட்பு நிறுத்தப்பட்டது. மீண்டும் பேச முயற்சிக்கவும்.';
          case 'te':
            return 'వినడం ఆగిపోయింది. దయచేసి మళ్లీ మాట్లాడండి.';
          case 'ml':
            return 'ശബ്ദം കേൾക്കുന്നത് നിർത്തി. ദയവായി വീണ്ടും സംസാരിക്കുക.';
          case 'kn':
            return 'ಧ್ವನಿ ಕೇಳುವಿಕೆ ನಿಂತಿದೆ. ಮತ್ತೆ ಮಾತನಾಡಲು ಪ್ರಯತ್ನಿಸಿ.';
          case 'hi':
            return 'सुनना रुक गया। कृपया फिर से बोलें।';
          case 'en':
          default:
            return 'Listening stopped. Please try speaking again.';
        }

      case 'not-allowed':
      case 'permission-denied':
        switch (langCode) {
          case 'ta':
            return 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. உங்கள் உலாவி அமைப்புகளில் மைக்ரோஃபோன் அனுமதியை வழங்கவும்.';
          case 'te':
            return 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్‌లలో మైక్రోఫోన్ అనుమతిని ఇవ్వండి.';
          case 'ml':
            return 'മൈക്രോഫോൺ അനുമതി നിരസിച്ചു. ബ്രൗസർ ക്രമീകരണങ്ങളിൽ മൈക്രോഫോൺ അനുമതി നൽകുക.';
          case 'kn':
            return 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು ನೀಡಿ.';
          case 'hi':
            return 'माइक्रोफ़ोन की अनुमति अस्वीकृत की गई। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।';
          case 'en':
          default:
            return 'Microphone permission was denied. Please allow microphone access in your browser settings.';
        }

      case 'audio-capture':
        switch (langCode) {
          case 'ta':
            return 'மைக்ரோஃபோன் கிடைக்கவில்லை அல்லது இணைக்கப்படவில்லை. மைக் அமைப்புகளை சரிபார்க்கவும்.';
          case 'te':
            return 'మైక్రోఫోన్ అందుబాటులో లేదు. దయచేసి మైక్ సెట్టింగ్‌లను తనిఖీ చేయండి.';
          case 'ml':
            return 'മൈക്രോഫോൺ ലഭ്യമല്ല. മൈക്ക് ക്രമീകരണങ്ങൾ പരിശോധിക്കുക.';
          case 'kn':
            return 'ಮೈಕ್ರೊಫೋನ್ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.';
          case 'hi':
            return 'माइक्रोफ़ोन उपलब्ध नहीं है। कृपया माइक सेटिंग्स जांचें।';
          case 'en':
          default:
            return 'Microphone unavailable. Please ensure your microphone is connected and working.';
        }

      case 'language-not-supported':
        switch (langCode) {
          case 'ta':
            return 'இந்த மொழிக்கான குரல் அறிதல் உங்கள் சாதனத்தில் கிடைக்கவில்லை. தட்டச்சு செய்யலாம்.';
          case 'te':
            return 'ఈ భాషకు వాయిస్ రికగ్నిషన్ అందుబాటులో లేదు. మీరు క్రింద టైప్ చేయవచ్చు.';
          case 'ml':
            return 'ഈ ഭാഷയ്ക്കുള്ള വോയ്സ് തിരിച്ചറിയൽ ലഭ്യമല്ല. നിങ്ങൾക്ക് ടൈപ്പ് ചെയ്യാം.';
          case 'kn':
            return 'ಈ ಭಾಷೆಯ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಟೈಪ್ ಮಾಡಿ.';
          case 'hi':
            return 'इस भाषा के लिए आवाज़ पहचान इस डिवाइस पर उपलब्ध नहीं है। आप नीचे टाइप कर सकते हैं।';
          case 'en':
          default:
            return 'Speech recognition is not supported for this language on your browser. Please type your message.';
        }

      case 'no-speech':
        switch (langCode) {
          case 'ta':
            return 'பேச்சு எதுவும் கேட்கவில்லை. பேசத் தட்டவும் மற்றும் மைக்கில் தெளிவாகப் பேசவும்.';
          case 'te':
            return 'మాటలేవీ వినిపించలేదు. మాట్లాడటానికి నొక్కండి మరియు స్పష్టంగా మాట్లాడండి.';
          case 'ml':
            return 'സംസാരം ഒന്നും കണ്ടെത്തിയില്ല. സംസാരിക്കാൻ തട്ടുക, വ്യക്തമായി സംസാരിക്കുക.';
          case 'kn':
            return 'ಯಾವುದೇ ಧ್ವನಿ ಪತ್ತೆಯಾಗಿಲ್ಲ. ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ ಮತ್ತು ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ.';
          case 'hi':
            return 'कोई आवाज़ नहीं सुनाई दी। कृपया बोलने के लिए टैप करें और माइक में साफ़ बोलें।';
          case 'en':
          default:
            return 'No speech detected. Please tap Speak and speak clearly into your microphone.';
        }

      case 'network':
      case 'service-not-allowed':
        switch (langCode) {
          case 'ta':
            return 'உலாவி குரல் சேவை தற்காலிகமாக கிடைக்கவில்லை. உங்கள் மொழியில் தட்டச்சு செய்யலாம்.';
          case 'te':
            return 'బ్రౌజర్ వాయిస్ సేవ తాత్కాలికంగా అందుబాటులో లేదు. మీ భాషలో టైప్ చేయవచ్చు.';
          case 'ml':
            return 'ബ്രൗസർ ശബ്ദ സേവനം താൽക്കാലികമായി ലഭ്യമല്ല. നിങ്ങൾക്ക് സ്വന്തം ഭാഷയിൽ ടൈപ്പ് ചെയ്യാം.';
          case 'kn':
            return 'ಬ್ರೌಸರ್ ಧ್ವನಿ ಸೇವೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಟೈಪ್ ಮಾಡಬಹುದು.';
          case 'hi':
            return 'ब्राउज़र आवाज़ सेवा अस्थायी रूप से अनुपलब्ध है। आप अपनी भाषा में टाइप कर सकते हैं।';
          case 'en':
          default:
            return 'Browser voice recognition service temporarily unavailable. You can type in your language.';
        }

      case 'unsupported':
        switch (langCode) {
          case 'ta':
            return 'இந்த உலாவியில் குரல் அறிதல் ஆதரிக்கப்படவில்லை. கீழே உங்கள் மொழியில் தட்டச்சு செய்யலாம்.';
          case 'te':
            return 'ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. మీరు క్రింద టైప్ చేయవచ్చు.';
          case 'ml':
            return 'ഈ ബ്രൗസറിൽ ശബ്ദം തിരിച്ചറിയൽ ലഭ്യമല്ല. നിങ്ങൾക്ക് താഴെ ടൈപ്പ് ചെയ്യാം.';
          case 'kn':
            return 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಬಹುದು.';
          case 'hi':
            return 'इस ब्राउज़र में आवाज़ पहचान समर्थित नहीं है। आप नीचे अपनी भाषा में टाइप कर सकते हैं।';
          case 'en':
          default:
            return 'Speech recognition is not supported in this browser. You can type in your language below.';
        }

      default:
        switch (langCode) {
          case 'ta':
            return 'குரல் உள்ளீட்டில் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும் அல்லது தட்டச்சு செய்யவும்.';
          case 'te':
            return 'వాయిస్ ఇన్‌పుట్‌లో సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి లేదా టైప్ చేయండి.';
          case 'ml':
            return 'ശബ്ദ ഇൻപുട്ടിൽ പ്രശ്നമുണ്ടായി. വീണ്ടും ശ്രമിക്കുക അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക.';
          case 'kn':
            return 'ಧ್ವನಿ ಇನ್‌ಪುಟ್‌ನಲ್ಲಿ ಸಮಸ್ಯೆ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.';
          case 'hi':
            return 'आवाज़ पहचान में समस्या आई। कृपया पुनः प्रयास करें या टाइप करें।';
          case 'en':
          default:
            return 'Voice recognition error occurred. Please try speaking again or type.';
        }
    }
  }

  public async requestMicrophonePermission(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  public startListening(
    language: SupportedLanguageCode,
    callbacks: SpeechRecognitionCallbacks
  ): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      const msg = this.getLocalizedError('unsupported', language);
      callbacks.onError(msg, 'unsupported');
      return false;
    }

    try {
      this.stopListening();
      if (!this.recognition) {
        this.initRecognition();
      }

      this.currentLanguage = language;
      this.activeCallbacks = callbacks;
      this.accumulatedTranscript = '';
      this.hasDispatchedFinal = false;
      this.recognition.lang = language;

      this.recognition.onstart = () => {
        this.isListening = true;
        // Safety timeout (30 seconds) to prevent infinite listening lock if browser hangs
        if (this.listeningTimeout) clearTimeout(this.listeningTimeout);
        this.listeningTimeout = setTimeout(() => {
          if (this.isListening) {
            this.stopListening();
          }
        }, 30000);
        callbacks.onStart();
      };

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalTranscript += text + ' ';
          } else {
            interimTranscript += text;
          }
        }

        const fullResult = (finalTranscript + interimTranscript).trim();
        if (fullResult) {
          this.accumulatedTranscript = fullResult;
          // Real-time word catching: immediately update caller
          callbacks.onResult(fullResult, false);

          // Debounce silence timer (1800ms) to auto-finalize when user finishes speaking
          if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
          this.silenceTimeout = setTimeout(() => {
            if (this.isListening && this.accumulatedTranscript.trim() && !this.hasDispatchedFinal) {
              this.hasDispatchedFinal = true;
              callbacks.onResult(this.accumulatedTranscript.trim(), true);
              this.stopListening();
            }
          }, 1800);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (this.listeningTimeout) clearTimeout(this.listeningTimeout);
        if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
        const errCode = event.error || 'unknown';

        // If no-speech or aborted, but words were already caught, deliver them
        if ((errCode === 'no-speech' || errCode === 'aborted') && this.accumulatedTranscript.trim() && !this.hasDispatchedFinal) {
          this.hasDispatchedFinal = true;
          callbacks.onResult(this.accumulatedTranscript.trim(), true);
          this.isListening = false;
          callbacks.onEnd();
          return;
        }

        this.isListening = false;

        // 'aborted' is a benign cancellation event when user stops speaking or taps mic again
        if (errCode === 'aborted') {
          callbacks.onEnd();
          return;
        }

        const localizedMsg = this.getLocalizedError(errCode, this.currentLanguage);
        callbacks.onError(localizedMsg, errCode);
      };

      this.recognition.onend = () => {
        if (this.listeningTimeout) clearTimeout(this.listeningTimeout);
        if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
        this.isListening = false;

        // CRITICAL: Deliver any caught words before closing session
        if (this.accumulatedTranscript.trim() && !this.hasDispatchedFinal) {
          this.hasDispatchedFinal = true;
          callbacks.onResult(this.accumulatedTranscript.trim(), true);
        }

        callbacks.onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      if (this.listeningTimeout) clearTimeout(this.listeningTimeout);
      if (this.silenceTimeout) clearTimeout(this.silenceTimeout);
      this.isListening = false;
      const msg = this.getLocalizedError('unknown', this.currentLanguage);
      callbacks.onError(msg, 'unknown');
      callbacks.onEnd();
      return false;
    }
  }

  public stopListening(): void {
    if (this.listeningTimeout) {
      clearTimeout(this.listeningTimeout);
      this.listeningTimeout = null;
    }
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore stop error
      }
      this.isListening = false;
    }

    if (this.accumulatedTranscript.trim() && !this.hasDispatchedFinal && this.activeCallbacks) {
      this.hasDispatchedFinal = true;
      this.activeCallbacks.onResult(this.accumulatedTranscript.trim(), true);
    }
  }

  public getAccumulatedTranscript(): string {
    return this.accumulatedTranscript;
  }

  public clearAccumulatedTranscript(): void {
    this.accumulatedTranscript = '';
    this.hasDispatchedFinal = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();

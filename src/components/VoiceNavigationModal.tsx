import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore, VoiceNavLanguageOption } from '../store/useAppStore';
import { voiceNavigationService, VoiceNavEvent } from '../services/voiceNavigation/voiceNavigationService';
import { SupportedVoiceNavLang } from '../services/voiceNavigation/voiceCommandDictionary';
import {
  Mic, MicOff, X, ArrowRight, Keyboard, Volume2,
  CheckCircle2, AlertCircle, RefreshCw, Globe, Wifi, WifiOff,
  Navigation, ShieldAlert, Sparkles
} from 'lucide-react';

const LANGUAGE_OPTIONS: Array<{ code: VoiceNavLanguageOption; label: string; bcp: string }> = [
  { code: 'app', label: 'Use Medora language', bcp: 'Sync with App' },
  { code: 'auto', label: 'Detect automatically', bcp: 'Auto' },
  { code: 'en', label: 'English (India)', bcp: 'en-IN' },
  { code: 'ta', label: 'தமிழ் (Tamil)', bcp: 'ta-IN' },
  { code: 'hi', label: 'हिन्दी (Hindi)', bcp: 'hi-IN' },
  { code: 'te', label: 'తెలుగు (Telugu)', bcp: 'te-IN' },
  { code: 'ml', label: 'മലയാളം (Malayalam)', bcp: 'ml-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', bcp: 'kn-IN' },
];

const SAMPLE_COMMANDS: Record<SupportedVoiceNavLang, string[]> = {
  en: ['Go to medicines', 'Open dashboard', 'Open emergency', 'Show appointments', 'Family health', 'Report scanner'],
  ta: ['மருந்துகளுக்கு செல்லுங்கள்', 'முகப்பு', 'அவசர உதவி', 'சந்திப்புகள்', 'குடும்ப நலம்', 'அறிக்கை ஸ்கேனர்'],
  hi: ['दवाइयों पर जाएं', 'डैशबोर्ड खोलो', 'आपातकालीन सहायता', 'अपॉइंटमेंट दिखाओ', 'परिवार स्वास्थ्य', 'रिपोर्ट स्कैनर'],
  te: ['మందులకు వెళ్ళండి', 'డ్యాష్‌బోర్డ్', 'అత్యవసర సహాయం', 'అపాయింట్‌మెంట్లు', 'కుటుంబ ఆరోగ్యం'],
  ml: ['മരുന്നുകളിലേക്ക് പോകുക', 'ഡാഷ്‌ബോർഡ്', 'അടിയന്തര സഹായം', 'അപ്പോയിന്റ്മെന്റുകൾ', 'കുടുംബാരോഗ്യം'],
  kn: ['ಔಷಧಿಗಳಿಗೆ ಹೋಗಿ', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'ತುರ್ತು ಸಹಾಯ', 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು', 'ಕುಟುಂಬ ಆರೋಗ್ಯ'],
};

export default function VoiceNavigationModal() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    isVoiceNavOpen,
    setVoiceNavOpen,
    voiceNavigationLanguage,
    setVoiceNavigationLanguage,
    appLanguage,
    isOffline
  } = useAppStore();

  const [navEvent, setNavEvent] = useState<VoiceNavEvent>(voiceNavigationService.getCurrentEvent());
  const [typedInput, setTypedInput] = useState('');
  const [showTypeMode, setShowTypeMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to voice navigation service events
  useEffect(() => {
    const unsubscribe = voiceNavigationService.subscribe((event) => {
      setNavEvent(event);
    });
    return () => unsubscribe();
  }, []);

  // When modal opens, auto-start listening if not in type-mode
  useEffect(() => {
    if (isVoiceNavOpen && !showTypeMode) {
      voiceNavigationService.startListening(
        voiceNavigationLanguage,
        appLanguage,
        (path) => {
          navigate(path);
          setVoiceNavOpen(false);
        }
      );
    } else {
      voiceNavigationService.stopListening();
    }
  }, [isVoiceNavOpen, voiceNavigationLanguage, appLanguage, showTypeMode]);

  // Focus input when type mode is toggled
  useEffect(() => {
    if (showTypeMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTypeMode]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVoiceNavOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVoiceNavOpen]);

  const handleClose = () => {
    voiceNavigationService.stopListening();
    setVoiceNavOpen(false);
    setShowTypeMode(false);
    setTypedInput('');
  };

  const handleToggleListening = () => {
    if (navEvent.state === 'LISTENING') {
      voiceNavigationService.stopListening();
    } else {
      voiceNavigationService.startListening(
        voiceNavigationLanguage,
        appLanguage,
        (path) => {
          navigate(path);
          setVoiceNavOpen(false);
        }
      );
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;

    voiceNavigationService.executeTextCommand(
      typedInput,
      voiceNavigationLanguage,
      appLanguage,
      (path) => {
        navigate(path);
        setVoiceNavOpen(false);
      }
    );
  };

  const handleSampleClick = (command: string) => {
    setTypedInput(command);
    voiceNavigationService.executeTextCommand(
      command,
      voiceNavigationLanguage,
      appLanguage,
      (path) => {
        navigate(path);
        setVoiceNavOpen(false);
      }
    );
  };

  if (!isVoiceNavOpen) return null;

  // Resolve current effective language for sample chips
  const effectiveLang: SupportedVoiceNavLang = (
    voiceNavigationLanguage === 'app'
      ? (['ta', 'hi', 'te', 'ml', 'kn', 'en'].includes(appLanguage) ? appLanguage : 'en')
      : voiceNavigationLanguage === 'auto'
      ? (['ta', 'hi', 'te', 'ml', 'kn', 'en'].includes(appLanguage) ? appLanguage : 'en')
      : voiceNavigationLanguage
  ) as SupportedVoiceNavLang;

  const samples = SAMPLE_COMMANDS[effectiveLang] || SAMPLE_COMMANDS.en;

  const isListening = navEvent.state === 'LISTENING';
  const isRecognized = navEvent.state === 'COMMAND_RECOGNIZED' || navEvent.state === 'NAVIGATING';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-nav-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-200 border border-white/20">
              <Navigation className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 id="voice-nav-title" className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2">
                <span>Voice Navigation</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-700/80 border border-teal-500/40 text-teal-200">
                  Multilingual
                </span>
              </h2>
              <p className="text-xs text-teal-100/80">
                Offline-capable local navigation by voice or text
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Voice Navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Connectivity & Offline notice banner */}
        <div
          role="status"
          aria-live="polite"
          className={`px-4 py-2 border-b text-xs flex items-center justify-between font-medium ${
            isOffline
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {isOffline ? (
              <>
                <WifiOff size={14} className="text-amber-700 flex-shrink-0" />
                <span>
                  <strong>Offline Mode:</strong> Local command dictionary active.
                </span>
              </>
            ) : (
              <>
                <Wifi size={14} className="text-emerald-700 flex-shrink-0" />
                <span>
                  <strong>Online Mode:</strong> Browser speech recognition ready.
                </span>
              </>
            )}
          </div>
          <span className="text-[11px] opacity-80 hidden sm:inline">No Cloud LLM Required</span>
        </div>

        {/* Language Selection Bar */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="voice-lang-select" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Globe size={13} className="text-teal-700" />
            <span>Voice Language:</span>
          </label>
          <select
            id="voice-lang-select"
            value={voiceNavigationLanguage}
            onChange={(e) => setVoiceNavigationLanguage(e.target.value as VoiceNavLanguageOption)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label} {opt.code === 'app' ? `(${appLanguage.toUpperCase()})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center space-y-5">
          {!showTypeMode ? (
            <>
              {/* Giant Listening Pulse / Mic Button */}
              <div className="relative my-2">
                {isListening && (
                  <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping pointer-events-none" />
                )}
                {isListening && (
                  <div className="absolute -inset-3 rounded-full bg-teal-400/30 animate-pulse pointer-events-none" />
                )}

                <button
                  type="button"
                  onClick={handleToggleListening}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                    isListening
                      ? 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white scale-105 ring-4 ring-teal-200'
                      : isRecognized
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-teal-50 text-teal-800 border-2 border-teal-600/40 hover:scale-105'
                  }`}
                  aria-label={isListening ? 'Listening. Tap to stop' : 'Tap to speak navigation command'}
                >
                  {isListening ? (
                    <>
                      <Mic className="w-10 h-10 animate-bounce" />
                      <span className="text-[10px] font-black uppercase tracking-wider mt-1">Listening</span>
                    </>
                  ) : isRecognized ? (
                    <>
                      <CheckCircle2 className="w-10 h-10" />
                      <span className="text-[10px] font-black uppercase tracking-wider mt-1">Found</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-10 h-10 text-teal-700" />
                      <span className="text-[10px] font-bold text-slate-600 mt-1">Tap to Speak</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Message / Live Transcript */}
              <div
                role="status"
                aria-live="polite"
                className="w-full min-h-[56px] flex flex-col items-center justify-center px-3"
              >
                {navEvent.transcript ? (
                  <p className="text-sm sm:text-base font-bold text-slate-800 max-w-sm break-words bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    "{navEvent.transcript}"
                  </p>
                ) : null}

                <p
                  className={`text-xs sm:text-sm font-semibold mt-1.5 text-center ${
                    navEvent.state === 'COMMAND_RECOGNIZED' || navEvent.state === 'NAVIGATING'
                      ? 'text-emerald-700 font-bold'
                      : navEvent.state === 'MICROPHONE_DENIED' || navEvent.state === 'OFFLINE_UNSUPPORTED'
                      ? 'text-rose-700 font-medium'
                      : navEvent.state === 'NOT_UNDERSTOOD'
                      ? 'text-amber-800 font-medium'
                      : 'text-slate-600'
                  }`}
                >
                  {navEvent.feedbackText || 'Tap microphone and say where you want to go'}
                </p>
              </div>

              {/* Offline Voice Limitation honest guidance */}
              {navEvent.state === 'OFFLINE_UNSUPPORTED' && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs text-left w-full space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle size={14} className="text-rose-700" />
                    <span>Browser Offline Speech Limitation</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Offline voice recognition is not available on this browser. Use the menu or type your command.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Type Command Mode */
            <form onSubmit={handleTextSubmit} className="w-full space-y-3">
              <div className="text-left">
                <label htmlFor="voice-text-cmd" className="text-xs font-bold text-slate-700 block mb-1">
                  Type navigation command ({effectiveLang.toUpperCase()} or English):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="voice-text-cmd"
                    ref={inputRef}
                    type="text"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder={samples[0] || 'e.g. Go to medicines'}
                    className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Go</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {navEvent.feedbackText && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`text-xs font-semibold ${
                    navEvent.state === 'COMMAND_RECOGNIZED' ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  {navEvent.feedbackText}
                </p>
              )}
            </form>
          )}

          {/* Sample Commands Quick Chips */}
          <div className="w-full pt-2 border-t border-slate-100 text-left">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Try saying or tapping:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samples.slice(0, 5).map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => handleSampleClick(cmd)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer switch between Voice and Type */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <button
            type="button"
            onClick={() => setShowTypeMode(!showTypeMode)}
            className="flex items-center gap-1.5 font-bold text-teal-800 hover:text-teal-950 underline cursor-pointer"
          >
            {showTypeMode ? (
              <>
                <Mic size={14} />
                <span>Switch to Voice Input</span>
              </>
            ) : (
              <>
                <Keyboard size={14} />
                <span>⌨️ Type Command</span>
              </>
            )}
          </button>

          <span className="text-[11px] text-slate-500">
            Esc to close
          </span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { voiceService } from '../services/ai/voiceService';
import { speechRecognitionService } from '../services/voice/speechRecognitionService';
import { speechSynthesisService, SpeechStatus, TTSVoiceStatus } from '../services/voice/speechSynthesisService';
import { SupportedLanguageCode, LANGUAGE_METADATA } from '../data/languages';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  ArrowRight,
  Stethoscope,
  ShieldCheck,
  Compass,
  Play,
  Pause,
  Square,
  AlertTriangle,
  CheckCircle2,
  Info,
  Globe,
  Settings,
  Sparkles,
} from 'lucide-react';

interface VoiceMessageItem {
  id: string;
  sender: 'user' | 'voice_ai';
  text: string;
  time: string;
  isTransfer?: boolean;
  userQuery?: string;
  navRoute?: string;
  responseLang?: SupportedLanguageCode;
}

interface VoiceAIPanelProps {
  onSwitchToMedicalAI?: () => void;
}

const SUPPORTED_VOICE_LANGS: Array<{ code: SupportedLanguageCode; label: string; bcp: string }> = [
  { code: 'en-IN', label: 'English (India)', bcp: 'en-IN' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)', bcp: 'ta-IN' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)', bcp: 'hi-IN' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)', bcp: 'te-IN' },
  { code: 'ml-IN', label: 'മലയാളം (Malayalam)', bcp: 'ml-IN' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)', bcp: 'kn-IN' },
];

export const VoiceAIPanel: React.FC<VoiceAIPanelProps> = ({ onSwitchToMedicalAI }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, language, setVoiceNavOpen } = useAppStore();

  const getInitialLangCode = (): SupportedLanguageCode => {
    switch (language) {
      case 'ta': return 'ta-IN';
      case 'te': return 'te-IN';
      case 'hi': return 'hi-IN';
      case 'kn': return 'kn-IN';
      case 'ml': return 'ml-IN';
      default: return 'en-IN';
    }
  };

  // Requirement 5: Keep these states separate!
  // appLanguage comes from store (language)
  // recognitionLanguage is used for speech recognition input
  // responseLanguage is used for AI generation & TTS output
  const [recognitionLanguage, setRecognitionLanguage] = useState<SupportedLanguageCode>(getInitialLangCode());
  const [responseLanguage, setResponseLanguage] = useState<SupportedLanguageCode>(getInitialLangCode());

  const [input, setInput] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('IDLE');
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);
  const [autoSpeakResponse, setAutoSpeakResponse] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unsupported'>('prompt');
  const [voiceStatus, setVoiceStatus] = useState<TTSVoiceStatus>(
    speechSynthesisService.checkVoiceAvailability(responseLanguage)
  );

  const [messages, setMessages] = useState<VoiceMessageItem[]>([
    {
      id: 'init-1',
      sender: 'voice_ai',
      text: "Hello! I am Medora Voice AI. Speak or type to ask questions, navigate features, or get healthcare guidance. (For medical symptoms, I will connect you with Medora Medical AI.)",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responseLang: getInitialLangCode(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync languages when store language changes
  useEffect(() => {
    const code = getInitialLangCode();
    setRecognitionLanguage(code);
    setResponseLanguage(code);
  }, [language]);

  // Check microphone permissions & voice availability
  useEffect(() => {
    speechRecognitionService.getMicrophonePermissionStatus().then(setMicPermission);
    setVoiceStatus(speechSynthesisService.checkVoiceAvailability(responseLanguage));

    const unsubscribeVoices = speechSynthesisService.onVoicesChanged(() => {
      setVoiceStatus(speechSynthesisService.checkVoiceAvailability(responseLanguage));
    });

    const unsubscribeStatus = speechSynthesisService.onStatusChange((status) => {
      setSpeechStatus(status);
      if (status === 'IDLE' || status === 'STOPPED' || status === 'ERROR') {
        setActiveSpeakingMsgId(null);
      }
    });

    return () => {
      unsubscribeVoices();
      unsubscribeStatus();
      speechSynthesisService.stop();
      speechRecognitionService.stopListening();
    };
  }, [responseLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript, isListening]);

  // Handle sending a message to Medora Voice AI
  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend) return;

    // Requirement: Do not start listening while AI is processing or speaking
    speechSynthesisService.stop();
    setErrorMessage(null);
    setInput('');
    setLiveTranscript('');

    const userMsg: VoiceMessageItem = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responseLang: recognitionLanguage,
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      // Process through existing Medora Voice Service
      const response = await voiceService.processVoiceRequest({
        text: textToSend,
        language: responseLanguage,
        userName: currentUser?.name,
      });

      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg: VoiceMessageItem = {
        id: aiMsgId,
        sender: 'voice_ai',
        text: response.responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTransfer: response.isMedicalQuery || response.suggestedAction === 'TRANSFER_TO_MEDICAL_AI',
        userQuery: textToSend,
        navRoute: response.suggestedAction === 'NAVIGATE' ? response.destinationRoute : undefined,
        responseLang: responseLanguage,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Automatically speak response if enabled by user
      if (autoSpeakResponse) {
        handleSpeakMessage(aiMsgId, response.responseText, responseLanguage);
      }
    } catch (err: any) {
      console.error('[VoiceAIPanel] Send error:', err);
      setErrorMessage('Failed to process message. Please try again.');
    }
  };

  // Toggle speech recognition
  const handleToggleListening = () => {
    // If speaking, stop speech first
    if (speechSynthesisService.getIsSpeaking()) {
      speechSynthesisService.stop();
    }

    if (isListening) {
      speechRecognitionService.stopListening();
      setIsListening(false);
      if (liveTranscript.trim()) {
        handleSend(liveTranscript);
      }
      return;
    }

    setErrorMessage(null);
    setLiveTranscript('');

    const started = speechRecognitionService.startListening(recognitionLanguage, {
      onStart: () => {
        setIsListening(true);
        speechRecognitionService.getMicrophonePermissionStatus().then(setMicPermission);
      },
      onResult: (text, isFinal) => {
        setLiveTranscript(text);
        setInput(text);
        if (isFinal && text.trim().length > 1) {
          setIsListening(false);
          handleSend(text);
        }
      },
      onError: (err, errCode) => {
        setIsListening(false);
        if (errCode === 'not-allowed' || errCode === 'permission-denied') {
          setMicPermission('denied');
          setErrorMessage('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (errCode === 'no-speech') {
          setErrorMessage('No speech detected. Please speak clearly into your microphone.');
        } else if (errCode === 'network') {
          setErrorMessage('Speech recognition network error. You can type your question below.');
        } else if (errCode !== 'aborted') {
          setErrorMessage(err);
        }
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setIsListening(false);
      setErrorMessage('Speech recognition is not supported in this browser. Please use text typing.');
    }
  };

  // Speak a specific message aloud
  const handleSpeakMessage = (msgId: string, text: string, langCode: SupportedLanguageCode) => {
    if (!text.trim()) return;

    setErrorMessage(null);
    setActiveSpeakingMsgId(msgId);

    const voiceCheck = speechSynthesisService.checkVoiceAvailability(langCode);
    if (!voiceCheck.hasMatchingVoice && !langCode.startsWith('en')) {
      const langName = LANGUAGE_METADATA[langCode]?.name || langCode;
      setErrorMessage(`Speech output for ${langName} (${langCode}) is unavailable on this device. You can still read the text response.`);
    }

    speechSynthesisService.speak(text, langCode, {
      onStart: () => {
        setSpeechStatus('SPEAKING');
        setActiveSpeakingMsgId(msgId);
      },
      onEnd: () => {
        setSpeechStatus('IDLE');
        setActiveSpeakingMsgId(null);
      },
      onPause: () => {
        setSpeechStatus('PAUSED');
      },
      onResume: () => {
        setSpeechStatus('SPEAKING');
      },
      onError: (err) => {
        setSpeechStatus('ERROR');
        setActiveSpeakingMsgId(null);
        setErrorMessage(err);
      },
    });
  };

  // Pause speech
  const handlePause = () => {
    speechSynthesisService.pause();
    setSpeechStatus('PAUSED');
  };

  // Resume speech
  const handleResume = () => {
    speechSynthesisService.resume();
    setSpeechStatus('SPEAKING');
  };

  // Stop speech
  const handleStop = () => {
    speechSynthesisService.stop();
    setSpeechStatus('STOPPED');
    setActiveSpeakingMsgId(null);
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-sm overflow-hidden flex flex-col h-[600px] max-h-[85vh]">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl shadow-xs">
            🗣️
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <span>Medora Voice AI</span>
              <span className="text-[10px] bg-teal-500/30 text-teal-100 border border-teal-400/30 px-2 py-0.5 rounded-full font-bold">
                Multilingual Speech
              </span>
            </div>
            <p className="text-[11px] text-teal-100/90 hidden sm:block">
              Two-way conversational speech for guidance, navigation, and rural accessibility
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors border border-white/10 cursor-pointer min-h-[36px]"
            title="Check Speech & Microphone Availability"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voice Status</span>
          </button>

          <button
            onClick={() => setVoiceNavOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer min-h-[36px]"
            title="Open Voice Navigator"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voice Nav</span>
          </button>
        </div>
      </div>

      {/* Voice Availability Diagnostic Panel */}
      {showDiagnostics && (
        <div className="bg-slate-900 text-white p-3 text-xs border-b border-slate-700 space-y-2 animate-in fade-in duration-150 shrink-0">
          <div className="flex items-center justify-between font-bold text-slate-300 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-400" />
              Device Voice Capabilities Diagnostics
            </span>
            <button onClick={() => setShowDiagnostics(false)} className="text-slate-400 hover:text-white p-1">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-800 p-2 rounded-xl space-y-1">
              <div className="text-slate-400 font-semibold">Speech Recognition (Input):</div>
              <div className="flex items-center gap-1.5 font-bold">
                {speechRecognitionService.isSupported() ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Supported in this browser
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Speech recognition unavailable (Type input enabled)
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">
                Mic Permission: <span className="font-bold text-white capitalize">{micPermission}</span>
              </div>
            </div>

            <div className="bg-slate-800 p-2 rounded-xl space-y-1">
              <div className="text-slate-400 font-semibold">Speech Synthesis (Voice Output):</div>
              <div className="flex items-center gap-1.5 font-bold">
                {voiceStatus.hasMatchingVoice ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {voiceStatus.voiceName}
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> No native voice installed for {responseLanguage}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">
                {voiceStatus.statusMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Language Selector Bar (Separated input & response languages) */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Recognition Language */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
            <Mic className="w-3.5 h-3.5 text-teal-700" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Input:</span>
            <select
              value={recognitionLanguage}
              onChange={(e) => setRecognitionLanguage(e.target.value as SupportedLanguageCode)}
              className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              {SUPPORTED_VOICE_LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Response Language */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
            <Volume2 className="w-3.5 h-3.5 text-indigo-700" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">Voice:</span>
            <select
              value={responseLanguage}
              onChange={(e) => setResponseLanguage(e.target.value as SupportedLanguageCode)}
              className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              {SUPPORTED_VOICE_LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto-Speak Toggle */}
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoSpeakResponse}
            onChange={(e) => setAutoSpeakResponse(e.target.checked)}
            className="w-3.5 h-3.5 text-teal-600 rounded focus:ring-teal-500"
          />
          <span>Auto-speak response</span>
        </label>
      </div>

      {/* Safety Notice Badge */}
      <div className="bg-teal-50/70 border-b border-teal-100 px-3 py-1.5 text-[11px] text-teal-900 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span>Non-diagnostic conversation system. Medical symptom analysis is handled by Medora Medical AI.</span>
        </span>
      </div>

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="bg-amber-50 border-b border-amber-200 p-2.5 text-xs text-amber-900 flex items-start justify-between gap-2 shrink-0 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-amber-700 hover:text-amber-900 font-bold text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Playback Controller Bar (When speaking or paused) */}
      {(speechStatus === 'SPEAKING' || speechStatus === 'PAUSED') && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-2 flex items-center justify-between text-xs text-emerald-950 shrink-0 shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            {speechStatus === 'SPEAKING' ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-700 animate-bounce" />
                <span>Speaking response aloud...</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 text-amber-600" />
                <span>Audio paused</span>
              </>
            )}
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-black uppercase">
              {speechStatus}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {speechStatus === 'SPEAKING' ? (
              <button
                onClick={handlePause}
                className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer min-h-[32px]"
                title="Pause Speech"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer min-h-[32px]"
                title="Resume Speech"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={handleStop}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer min-h-[32px]"
              title="Stop Speech Immediately"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/50">
        {messages.map((m) => {
          const isThisMsgSpeaking = activeSpeakingMsgId === m.id && speechStatus === 'SPEAKING';
          const isThisMsgPaused = activeSpeakingMsgId === m.id && speechStatus === 'PAUSED';

          return (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-3xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-teal-700 text-white rounded-br-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold">
                  <span className={m.sender === 'user' ? 'text-teal-200 font-bold' : 'text-teal-800 font-bold'}>
                    {m.sender === 'user' ? 'You' : 'Medora Voice AI'}
                  </span>
                  <span>{m.time}</span>
                </div>

                <p className="whitespace-pre-wrap text-xs sm:text-sm font-medium">{m.text}</p>

                {/* AI Response Controls: Speak Response, Pause, Resume, Stop */}
                {m.sender === 'voice_ai' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      {isThisMsgSpeaking ? (
                        <>
                          <button
                            type="button"
                            onClick={handlePause}
                            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer min-h-[36px]"
                          >
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleStop}
                            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer min-h-[36px]"
                          >
                            <Square className="w-3.5 h-3.5 fill-current text-red-600" />
                            <span>Stop</span>
                          </button>
                        </>
                      ) : isThisMsgPaused ? (
                        <>
                          <button
                            type="button"
                            onClick={handleResume}
                            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer min-h-[36px]"
                          >
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Resume</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleStop}
                            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer min-h-[36px]"
                          >
                            <Square className="w-3.5 h-3.5 fill-current text-red-600" />
                            <span>Stop</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSpeakMessage(m.id, m.text, m.responseLang || responseLanguage)}
                          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors cursor-pointer min-h-[36px]"
                          title="Read this response aloud"
                        >
                          <Volume2 className="w-4 h-4 text-teal-700" />
                          <span>🔊 Speak Response</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400">
                      {m.responseLang || responseLanguage}
                    </span>
                  </div>
                )}

                {/* Handoff to Medical AI */}
                {m.isTransfer && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        if (onSwitchToMedicalAI) {
                          onSwitchToMedicalAI();
                        }
                        const qParam = m.userQuery ? `&query=${encodeURIComponent(m.userQuery)}` : '';
                        navigate(`/ai?tab=medical${qParam}`);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer min-h-[44px]"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Open Medora Medical AI →</span>
                    </button>
                  </div>
                )}

                {/* Quick Navigation Button */}
                {m.navRoute && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => navigate(m.navRoute!)}
                      className="w-full bg-teal-700 hover:bg-teal-800 text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer min-h-[44px]"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Open {m.navRoute.replace('/', '').replace(/-/g, ' ') || 'Page'} →</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Listening Waveform & Transcript Preview */}
        {isListening && (
          <div className="flex justify-end">
            <div className="bg-red-50 border-2 border-red-300 rounded-3xl rounded-br-xs px-4 py-3 max-w-[85%] shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-red-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span>Listening in {recognitionLanguage}...</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 italic">
                {liveTranscript ? `"${liveTranscript}"` : 'Speak clearly into your microphone...'}
              </p>
              {/* Animated audio bar visualizer */}
              <div className="flex items-center gap-1 pt-1">
                {[6, 12, 20, 28, 16, 8, 22, 14, 6].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-red-500 rounded-full animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Conversational Chips */}
      <div className="px-3 py-1.5 bg-white border-t border-slate-100 overflow-x-auto scrollbar-hide flex gap-1.5 shrink-0">
        {[
          'Hello Medora',
          'How do I upload a report?',
          'Where are my medicines?',
          'Call doctor',
          'What is Medora?',
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-[11px] font-semibold text-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[32px] cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Primary Input & Microphone Controls */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Main Large Touch Microphone Speak Button */}
          <button
            type="button"
            onClick={handleToggleListening}
            className={`px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm cursor-pointer min-h-[48px] shrink-0 active:scale-95 ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-400/30'
                : 'bg-teal-700 hover:bg-teal-800 text-white'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak to Medora'}
            aria-label={isListening ? 'Stop Listening' : 'Speak to Medora'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span>{isListening ? 'Stop' : 'Speak'}</span>
          </button>

          {/* Fallback Text Input Field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your speech...'
                : `Type message in ${recognitionLanguage} or ask anything...`
            }
            className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-500/20 min-h-[48px]"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() && !liveTranscript.trim()}
            className="bg-teal-800 hover:bg-teal-900 disabled:opacity-40 text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xs cursor-pointer min-h-[48px] min-w-[48px] shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, RotateCcw, AlertTriangle, Globe, Send, PhoneCall, Sparkles, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { speechRecognitionService } from '../services/voice/speechRecognitionService';
import { speechSynthesisService } from '../services/voice/speechSynthesisService';
import { conversationEngine, ProcessedConversationTurn } from '../services/voice/conversationEngine';
import { conversationMemory, ConversationMessage } from '../services/voice/conversationMemory';
import { SupportedLanguageCode, LANGUAGE_METADATA } from '../data/languages';
import { Link } from 'react-router-dom';

export default function SpeakToMedoraCard() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [turns, setTurns] = useState<ProcessedConversationTurn[]>([]);
  const [lastTurn, setLastTurn] = useState<ProcessedConversationTurn | null>(null);
  const [activeLang, setActiveLang] = useState<SupportedLanguageCode>('en-IN');
  const [confidenceLevel, setConfidenceLevel] = useState<'high' | 'medium' | 'uncertain'>('high');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser?.id) {
      conversationMemory.loadPatientContext(currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [turns, isProcessing]);

  const handleStartListening = () => {
    setStatusNotice(null);
    setTranscript('');

    const success = speechRecognitionService.startListening(activeLang, {
      onStart: () => setIsListening(true),
      onResult: (text: string, isFinal: boolean) => {
        setTranscript(text);
        if (isFinal && text.trim().length > 1) {
          handleProcessUtterance(text);
        }
      },
      onError: (err: string) => {
        setIsListening(false);
        setStatusNotice(err);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (!success) {
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    speechRecognitionService.stopListening();
    setIsListening(false);
    if (transcript.trim()) {
      handleProcessUtterance(transcript);
    }
  };

  const handleProcessUtterance = async (userText: string, forcedLang?: SupportedLanguageCode) => {
    if (!userText.trim() || isProcessing) return;

    setIsProcessing(true);
    setStatusNotice(null);

    try {
      const turnResult = await conversationEngine.processUserInput(userText, forcedLang);
      setLastTurn(turnResult);
      setActiveLang(turnResult.detectedLanguage);
      setConfidenceLevel(turnResult.confidenceLevel);
      setTurns((prev) => [...prev, turnResult]);
      setTranscript('');
      setTextInput('');

      // Check if detection is uncertain
      if (turnResult.confidenceLevel === 'uncertain' && turns.length === 0) {
        setShowLanguagePicker(true);
      }

      // Speak in SAME detected language
      speechSynthesisService.speakResponse(
        turnResult.responseText,
        turnResult.detectedLanguage,
        turnResult.detectedLanguage,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        (err) => {
          setIsSpeaking(false);
          setStatusNotice(err);
        }
      );
    } catch (e: any) {
      setStatusNotice('Error processing speech: ' + e?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualLanguageSelect = (lang: SupportedLanguageCode) => {
    setActiveLang(lang);
    setShowLanguagePicker(false);
    conversationMemory.updateLanguage(lang, 1.0, true);
    setStatusNotice(`Language set to ${LANGUAGE_METADATA[lang].nativeName} (${LANGUAGE_METADATA[lang].name})`);
  };

  const handleReplayAudio = (turn: ProcessedConversationTurn) => {
    speechSynthesisService.speakResponse(
      turn.responseText,
      turn.detectedLanguage,
      turn.detectedLanguage,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      (err) => {
        setIsSpeaking(false);
        setStatusNotice(err);
      }
    );
  };

  const handleReset = () => {
    speechSynthesisService.stop();
    speechRecognitionService.stopListening();
    conversationEngine.resetConversation('en-IN', currentUser?.id);
    setTurns([]);
    setLastTurn(null);
    setTranscript('');
    setStatusNotice(null);
    setIsListening(false);
    setIsSpeaking(false);
  };

  const langMeta = LANGUAGE_METADATA[activeLang] || LANGUAGE_METADATA['en-IN'];

  return (
    <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white rounded-3xl p-5 shadow-xl border border-teal-700/50 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-600/80 border border-teal-400/40 flex items-center justify-center text-xl shadow-inner">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg tracking-tight">Speak to Medora</h2>
              <span className="bg-teal-500/30 text-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-400/30 uppercase tracking-wider">
                Natural Voice
              </span>
            </div>
            <p className="text-xs text-teal-200/80">Tell Medora what is wrong in your own language.</p>
          </div>
        </div>

        {/* Language badge & selector */}
        <button
          onClick={() => setShowLanguagePicker(!showLanguagePicker)}
          className="flex items-center gap-1.5 bg-teal-950/60 hover:bg-teal-900 border border-teal-500/40 rounded-xl px-2.5 py-1 text-xs font-semibold text-teal-100 transition-colors"
          title="Change language manually"
        >
          <Globe size={13} className="text-teal-400" />
          <span>{langMeta.nativeName}</span>
          <span className="text-[10px] text-teal-300 opacity-75">({confidenceLevel})</span>
        </button>
      </div>

      {/* Language Selection Modal / Dropdown */}
      {showLanguagePicker && (
        <div className="mb-4 bg-teal-950/90 border border-teal-500/40 rounded-2xl p-3 backdrop-blur-md relative z-20">
          <div className="text-xs font-bold text-teal-200 mb-2 flex items-center justify-between">
            <span>Select your preferred language:</span>
            <span className="text-[10px] text-teal-400 font-normal">Auto-detection remains active</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {(Object.keys(LANGUAGE_METADATA) as SupportedLanguageCode[]).map((code) => {
              const item = LANGUAGE_METADATA[code];
              const isSelected = activeLang === code;
              return (
                <button
                  key={code}
                  onClick={() => handleManualLanguageSelect(code)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-teal-500 text-white border-teal-300 shadow-md scale-102'
                      : 'bg-teal-900/60 text-teal-200 border-teal-700/50 hover:bg-teal-800'
                  }`}
                >
                  <span className="text-base mb-0.5">{item.flag}</span>
                  <span>{item.nativeName}</span>
                  <span className="text-[9px] opacity-75 font-normal">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversation Thread Container */}
      {turns.length > 0 && (
        <div
          ref={chatScrollRef}
          className="max-h-56 overflow-y-auto mb-4 space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-teal-700/60"
        >
          {turns.map((t, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              {/* User turn */}
              <div className="flex justify-end">
                <div className="bg-teal-700/80 text-teal-50 border border-teal-500/30 rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-[85%] shadow-sm">
                  <div className="text-[10px] text-teal-300 font-semibold mb-0.5 flex items-center gap-1">
                    <span>You</span> · <span>{LANGUAGE_METADATA[t.detectedLanguage]?.nativeName || t.detectedLanguage}</span>
                  </div>
                  <p className="text-sm font-medium">{t.userText}</p>
                </div>
              </div>

              {/* Medora turn */}
              <div className="flex justify-start">
                <div
                  className={`border rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[90%] shadow-md ${
                    t.isEmergency
                      ? 'bg-red-950/90 text-red-100 border-red-500/60'
                      : 'bg-teal-950/90 text-teal-50 border-teal-600/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-80">
                    <span className="flex items-center gap-1 text-teal-300">
                      <Sparkles size={11} /> {t.agentName}
                    </span>
                    {t.isEmergency && (
                      <span className="bg-red-600 text-white px-1.5 py-0.2 rounded font-black text-[9px]">EMERGENCY</span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line font-normal">{t.responseText}</p>

                  <div className="mt-2 pt-1.5 border-t border-teal-800/40 flex items-center justify-between">
                    <button
                      onClick={() => handleReplayAudio(t)}
                      className="flex items-center gap-1 text-[11px] font-bold text-teal-300 hover:text-teal-100 transition-colors"
                    >
                      <Volume2 size={12} /> {t.detectedLanguage.slice(0, 2).toUpperCase()} Voice
                    </button>
                    {t.followUpQuestion && (
                      <span className="text-[10px] text-teal-400 italic">Respond naturally above</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-teal-950/80 border border-teal-700/50 rounded-2xl px-3.5 py-2 text-xs text-teal-300 flex items-center gap-2">
                <span className="animate-spin text-sm">🔄</span>
                <span>Understanding your speech & detecting language...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Speak & Action Area */}
      <div className="bg-teal-950/70 border border-teal-700/40 rounded-2xl p-3.5 mb-3 flex flex-col items-center text-center">
        {/* Live speech preview */}
        {isListening ? (
          <div className="w-full mb-3 py-2 px-3 bg-teal-900/60 rounded-xl border border-teal-500/40 animate-pulse">
            <div className="text-[11px] font-bold text-teal-300 flex items-center justify-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span>Listening in {langMeta.nativeName} ({langMeta.name})...</span>
            </div>
            <p className="text-sm text-teal-100 font-medium italic">
              {transcript ? `"${transcript}"` : 'Please speak your symptoms now...'}
            </p>
          </div>
        ) : lastTurn ? (
          <div className="w-full mb-2.5 flex items-center justify-between text-xs text-teal-300 bg-teal-900/40 px-3 py-1.5 rounded-xl">
            <span className="flex items-center gap-1">
              <CheckCircle size={12} className="text-teal-400" /> Detected: <strong>{langMeta.nativeName}</strong>
            </span>
            <span>Intent: <strong>{lastTurn.intent.replace('_', ' ')}</strong></span>
          </div>
        ) : (
          <p className="text-xs text-teal-200/90 mb-3">
            Speak naturally in <strong>தமிழ்</strong>, <strong>తెలుగు</strong>, <strong>മലയാളം</strong>,{' '}
            <strong>ಕನ್ನಡ</strong> or <strong>English</strong>. No menu buttons required.
          </p>
        )}

        {/* Primary Microphone Action Button */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg active:scale-95 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-500/40 ring-4 ring-red-400/30'
                  : 'bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-teal-950 font-black shadow-teal-500/30'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={18} />
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <Mic size={18} />
                  <span>TAP TO SPEAK</span>
                </>
              )}
            </button>

            {turns.length > 0 && (
              <button
                onClick={handleReset}
                className="p-3 bg-teal-900/80 hover:bg-teal-800 text-teal-200 border border-teal-600/40 rounded-2xl transition-colors"
                title="Reset conversation"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
          
          {isSpeaking && (
            <button
              onClick={() => speechSynthesisService.stop()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 w-full max-w-[200px] rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg active:scale-95 bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/30"
            >
              <span className="text-lg leading-none">⏹</span>
              <span>STOP SPEAKING</span>
            </button>
          )}
        </div>
      </div>

      {/* Text Fallback Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleProcessUtterance(textInput)}
          placeholder="Or type in your language (e.g. எனக்கு காய்ச்சல், నాకు జ్వరం)..."
          className="flex-1 bg-teal-950/80 border border-teal-700/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-teal-400/60 focus:outline-none focus:border-teal-400 transition-colors"
        />
        <button
          onClick={() => handleProcessUtterance(textInput)}
          disabled={!textInput.trim() || isProcessing}
          className="bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-teal-950 font-bold p-2.5 rounded-xl transition-all shadow"
        >
          <Send size={14} />
        </button>
      </div>

      {/* Notice & Status banner */}
      {statusNotice && (
        <div className="mt-2.5 bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
          <span className="flex-1">{statusNotice}</span>
        </div>
      )}

      {/* Future Real Toll-Free Telephone Gateway Note */}
      <div className="mt-3 pt-2.5 border-t border-teal-800/40 flex items-center justify-between text-[11px] text-teal-300/80">
        <span className="flex items-center gap-1">
          <span>🔒 Works 100% locally offline</span>
        </span>
        <Link
          to="/ivr"
          className="flex items-center gap-1 text-teal-300 font-bold hover:text-white underline decoration-teal-400/50"
        >
          <PhoneCall size={11} />
          <span>Telephone Mode Simulation</span>
        </Link>
      </div>
    </div>
  );
}

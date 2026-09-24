import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, RotateCcw, AlertTriangle, Globe, Send, PhoneCall, Sparkles, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { speechRecognitionService } from '../services/voice/speechRecognitionService';
import { speechSynthesisService } from '../services/voice/speechSynthesisService';
import { conversationEngine, ProcessedConversationTurn } from '../services/voice/conversationEngine';
import { conversationMemory } from '../services/voice/conversationMemory';
import { SupportedLanguageCode, LANGUAGE_METADATA } from '../data/languages';
import { Link } from 'react-router-dom';

export default function SpeakToMedoraCard() {
  const { t } = useTranslation();
  const { currentUser, language } = useAppStore();

  const bcpMap: Record<string, SupportedLanguageCode> = {
    ta: 'ta-IN',
    te: 'te-IN',
    hi: 'hi-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    en: 'en-IN'
  };

  const currentStoreLang: SupportedLanguageCode = bcpMap[language] || 'en-IN';

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [turns, setTurns] = useState<ProcessedConversationTurn[]>([]);
  const [lastTurn, setLastTurn] = useState<ProcessedConversationTurn | null>(null);
  const [activeLang, setActiveLang] = useState<SupportedLanguageCode>(currentStoreLang);
  const [confidenceLevel, setConfidenceLevel] = useState<'high' | 'medium' | 'uncertain'>('medium');
  const [hasDetected, setHasDetected] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Synchronize activeLang whenever application language changes
  useEffect(() => {
    setActiveLang(currentStoreLang);
    setHasDetected(false);
    conversationMemory.updateLanguage(currentStoreLang, 0.90, false);
  }, [language, currentStoreLang]);

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
      onError: (err: string, errCode?: string) => {
        setIsListening(false);
        // Do not display aborted error as persistent failure
        if (errCode !== 'aborted') {
          setStatusNotice(err);
        }
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
      const targetLang = forcedLang || activeLang;
      const turnResult = await conversationEngine.processUserInput(userText, forcedLang, targetLang);

      setLastTurn(turnResult);
      setActiveLang(turnResult.detectedLanguage);
      setConfidenceLevel(turnResult.confidenceLevel);
      setHasDetected(true);
      setTurns((prev) => [...prev, turnResult]);
      setTranscript('');
      setTextInput('');

      // If detection is uncertain on first turn, show picker
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
      setStatusNotice(e?.message || 'Error processing response');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualLanguageSelect = (lang: SupportedLanguageCode) => {
    setActiveLang(lang);
    setShowLanguagePicker(false);
    setHasDetected(true);
    setConfidenceLevel('high');
    conversationMemory.updateLanguage(lang, 1.0, true);
    setStatusNotice(`${t('dashboard.speakCardDetected')} ${LANGUAGE_METADATA[lang].nativeName} (${LANGUAGE_METADATA[lang].name})`);
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
    conversationEngine.resetConversation(currentStoreLang, currentUser?.id);
    setTurns([]);
    setLastTurn(null);
    setTranscript('');
    setStatusNotice(null);
    setIsListening(false);
    setIsSpeaking(false);
    setHasDetected(false);
    setActiveLang(currentStoreLang);
  };

  const langMeta = LANGUAGE_METADATA[activeLang] || LANGUAGE_METADATA['en-IN'];

  return (
    <div className="bg-[#F0FDFA] border-2 border-[#14B8A6]/30 text-[#0F172A] rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden w-full max-w-full min-w-0 break-words">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#14B8A6]/40 flex items-center justify-center text-xl shadow-xs text-[#14B8A6] flex-shrink-0">
            🎙️
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-base text-[#0F766E] tracking-tight">{t('dashboard.speakCardTitle')}</h2>
              <span className="bg-[#14B8A6]/15 text-[#0F766E] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#14B8A6]/30 uppercase tracking-wider">
                {t('dashboard.speakCardNaturalVoice')}
              </span>
            </div>
            <p className="text-xs text-[#475569] truncate sm:whitespace-normal">{t('dashboard.speakCardSubtitle')}</p>
          </div>
        </div>

        {/* Language status badge & selector */}
        <button
          onClick={() => setShowLanguagePicker(!showLanguagePicker)}
          className="self-start sm:self-auto flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#0F766E] shadow-xs transition-colors min-h-9"
          title={t('dashboard.speakCardChangeLang')}
        >
          <Globe size={13} className="text-[#14B8A6] flex-shrink-0" />
          <span>{langMeta.nativeName}</span>
          <span className="text-[10px] text-[#64748B] font-medium">
            {hasDetected
              ? `(${confidenceLevel === 'high' ? t('dashboard.conf_high', 'HIGH') : confidenceLevel === 'medium' ? t('dashboard.conf_medium', 'MEDIUM') : t('dashboard.conf_low', 'LOW')})`
              : `(${t('dashboard.conf_statusSelected', 'Selected')})`}
          </span>
        </button>
      </div>

      {/* Language Selection Dropdown */}
      {showLanguagePicker && (
        <div className="mb-4 bg-white border border-[#E2E8F0] rounded-2xl p-3 shadow-md relative z-20">
          <div className="text-xs font-bold text-[#0F172A] mb-2 flex items-center justify-between">
            <span>{t('dashboard.speakCardSelectLang')}</span>
            <span className="text-[10px] text-[#64748B] font-normal">{t('dashboard.speakCardAutoActive')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
            {(Object.keys(LANGUAGE_METADATA) as SupportedLanguageCode[]).map((code) => {
              const item = LANGUAGE_METADATA[code];
              const isSelected = activeLang === code;
              return (
                <button
                  key={code}
                  onClick={() => handleManualLanguageSelect(code)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all min-h-11 ${
                    isSelected
                      ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-sm'
                      : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-slate-50'
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
          className="max-h-60 overflow-y-auto mb-4 space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-teal-300"
        >
          {turns.map((tTurn, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              {/* User turn */}
              <div className="flex justify-end">
                <div className="bg-[#EFF6FF] text-[#0F172A] border border-[#2563EB]/30 rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-[85%] shadow-xs">
                  <div className="text-[10px] text-[#2563EB] font-bold mb-0.5 flex items-center gap-1">
                    <span>{t('dashboard.speakCardYou')}</span> · <span>{LANGUAGE_METADATA[tTurn.detectedLanguage]?.nativeName || tTurn.detectedLanguage}</span>
                  </div>
                  <p className="text-sm font-medium">{tTurn.userText}</p>
                </div>
              </div>

              {/* Medora turn */}
              <div className="flex justify-start">
                <div
                  className={`border rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[92%] shadow-xs ${
                    tTurn.isEmergency
                      ? 'bg-[#FEF2F2] text-[#0F172A] border-[#DC2626]/40'
                      : 'bg-white text-[#0F172A] border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-90">
                    <span className="flex items-center gap-1 text-[#7C3AED]">
                      <Sparkles size={11} /> {tTurn.agentName}
                    </span>
                    {tTurn.isEmergency && (
                      <span className="bg-[#DC2626] text-white px-1.5 py-0.2 rounded font-black text-[9px]">
                        {t('dashboard.speakCardEmergency')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line font-normal text-[#0F172A]">{tTurn.responseText}</p>

                  <div className="mt-2 pt-1.5 border-t border-[#E2E8F0] flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => handleReplayAudio(tTurn)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#0F766E] hover:text-[#14B8A6] transition-colors min-h-8"
                    >
                      <Volume2 size={13} /> {LANGUAGE_METADATA[tTurn.detectedLanguage]?.nativeName || tTurn.detectedLanguage.slice(0, 2).toUpperCase()} {t('dashboard.speakCardVoice')}
                    </button>
                    {tTurn.followUpQuestion && (
                      <span className="text-[10px] text-[#64748B] italic">{t('dashboard.speakCardRespondNaturally')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#E2E8F0] rounded-2xl px-3.5 py-2 text-xs text-[#0F766E] flex items-center gap-2 shadow-xs">
                <span className="animate-spin text-sm">🔄</span>
                <span>{t('dashboard.speakCardUnderstanding')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Speak & Action Area */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 mb-3 flex flex-col items-center text-center shadow-xs">
        {/* Live speech preview */}
        {isListening ? (
          <div className="w-full mb-3 py-2.5 px-3 bg-[#FEF2F2] rounded-xl border border-[#DC2626]/30">
            <div className="text-[11px] font-bold text-[#DC2626] flex items-center justify-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-ping" />
              <span>{t('dashboard.speakCardListeningIn', { lang: `${langMeta.nativeName} (${langMeta.name})` })}</span>
            </div>
            <p className="text-sm text-[#0F172A] font-medium italic">
              {transcript ? `"${transcript}"` : t('dashboard.speakCardPromptSymptoms')}
            </p>
            {/* Subtle Voice Wave Visualization */}
            <div className="flex items-center justify-center gap-1 mt-2">
              {[4, 8, 14, 20, 14, 8, 4].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#14B8A6] rounded-full animate-pulse"
                  style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          </div>
        ) : isSpeaking ? (
          <div className="w-full mb-3 py-2 px-3 bg-[#F0FDFA] rounded-xl border border-[#14B8A6]/30">
            <div className="text-[11px] font-bold text-[#0F766E] flex items-center justify-center gap-1.5">
              <span>{t('dashboard.speakCardSpeakingIn', { lang: langMeta.nativeName })}</span>
            </div>
            <div className="flex items-center justify-center gap-1 mt-1.5">
              {[6, 12, 18, 12, 6].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#0F766E] rounded-full animate-pulse"
                  style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        ) : lastTurn && hasDetected ? (
          <div className="w-full mb-2.5 flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-[#0F766E] bg-[#F0FDFA] px-3 py-1.5 rounded-xl border border-[#14B8A6]/20">
            <span className="flex items-center gap-1">
              <CheckCircle size={13} className="text-[#16A34A]" />
              <span>{t('dashboard.speakCardDetected')}</span>
              <strong>{langMeta.nativeName}</strong>
              <span className="text-[10px] text-[#64748B]">({confidenceLevel.toUpperCase()})</span>
            </span>
            <span>
              {t('dashboard.speakCardIntent')} <strong>{lastTurn.intent.replace('_', ' ')}</strong>
            </span>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-xs text-[#475569]">
              {t('dashboard.speakCardLanguagesHint')}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-1 text-[11px] font-semibold text-[#0F766E]">
              <span>{t('dashboard.speakCardReady')} ({langMeta.nativeName})</span>
            </div>
          </div>
        )}

        {/* Primary Action Buttons (Min touch target 48px) */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-sm active:scale-95 min-h-12 min-w-44 ${
                isListening
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-red-500/30 ring-4 ring-red-200'
                  : 'bg-[#14B8A6] hover:bg-[#0F766E] text-white shadow-teal-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={18} />
                  <span>{t('dashboard.speakCardStopListening')}</span>
                </>
              ) : (
                <>
                  <Mic size={18} />
                  <span>{t('dashboard.speakCardTapToSpeak')}</span>
                </>
              )}
            </button>

            {turns.length > 0 && (
              <button
                onClick={handleReset}
                className="p-3.5 bg-white hover:bg-slate-50 text-[#64748B] border border-[#E2E8F0] rounded-2xl transition-colors shadow-xs min-h-12 min-w-12 flex items-center justify-center"
                title={t('dashboard.speakCardReset')}
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>

          {isSpeaking && (
            <button
              onClick={() => speechSynthesisService.stop()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 w-full max-w-[200px] rounded-2xl font-black text-xs tracking-wide transition-all shadow-sm active:scale-95 bg-[#DC2626] hover:bg-[#B91C1C] text-white ring-2 ring-red-200 min-h-11"
            >
              <span className="text-base leading-none">⏹</span>
              <span>{t('dashboard.speakCardStopSpeaking')}</span>
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
          placeholder={t('dashboard.speakCardTypePlaceholder')}
          className="flex-1 bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#14B8A6] shadow-xs transition-colors min-h-11"
        />
        <button
          onClick={() => handleProcessUtterance(textInput)}
          disabled={!textInput.trim() || isProcessing}
          className="bg-[#0F766E] hover:bg-[#14B8A6] disabled:opacity-40 text-white font-bold p-3 rounded-xl transition-all shadow-xs min-h-11 min-w-11 flex items-center justify-center"
          title={t('common.submit', 'Send')}
        >
          <Send size={15} />
        </button>
      </div>

      {/* Notice & Status banner */}
      {statusNotice && (
        <div className="mt-2.5 bg-[#FFFBEB] border border-[#D97706]/40 text-[#D97706] text-xs px-3 py-2 rounded-xl flex items-center gap-2">
          <AlertTriangle size={14} className="text-[#D97706] flex-shrink-0" />
          <span className="flex-1 leading-snug">{statusNotice}</span>
        </div>
      )}

      {/* Truthful Offline & Telephone Note */}
      <div className="mt-3 pt-2.5 border-t border-[#14B8A6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#475569]">
        <span className="flex items-center gap-1 leading-normal">
          <span>🔒 {t('dashboard.speakCardWorksOffline')}</span>
        </span>
        <Link
          to="/ivr"
          className="flex items-center gap-1 text-[#0F766E] font-bold hover:underline flex-shrink-0 min-h-7"
        >
          <PhoneCall size={12} />
          <span>{t('dashboard.speakCardTelephoneMode')}</span>
        </Link>
      </div>
    </div>
  );
}

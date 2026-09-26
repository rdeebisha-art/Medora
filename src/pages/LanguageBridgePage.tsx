import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/db';
import { LANGUAGE_METADATA, SupportedLanguageCode } from '../data/languages';
import { speechRecognitionService } from '../services/voice/speechRecognitionService';
import { speechSynthesisService } from '../services/voice/speechSynthesisService';
import { detectSpokenLanguage, translateHealthcareText, translateHealthcareTextAsync } from '../services/languageBridge/translator';
import {
  clearSessionMessages,
  createBridgeSession,
  endBridgeSession,
  loadSessionMessages,
  saveBridgeMessage,
  saveTranslationCorrection,
} from '../services/languageBridge/sessionService';
import { languageDisplayName, nativeLanguageName } from '../services/languageBridge/langMap';
import { LanguageBridgeMessage } from '../db/db';
import { BridgeTranslationResult } from '../data/languageBridge/types';
import { Mic, Keyboard, Volume2, Square, Pause, Play, Send, Languages } from 'lucide-react';

const BRIDGE_LANGS: SupportedLanguageCode[] = ['ta-IN', 'te-IN', 'ml-IN', 'kn-IN', 'hi-IN', 'en-IN'];

type ViewMode = 'patient' | 'doctor';
type SpeakTarget = 'patient' | 'doctor' | null;

export default function LanguageBridgePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, language: uiLanguage } = useAppStore();
  const [step, setStep] = useState<'common' | 'setup' | 'active'>('common');
  const [patientLanguage, setPatientLanguage] = useState<SupportedLanguageCode>('ta-IN');
  const [doctorLanguage, setDoctorLanguage] = useState<SupportedLanguageCode>('en-IN');
  const [patientDetectedLanguage, setPatientDetectedLanguage] = useState<SupportedLanguageCode | null>(null);
  const [doctorDetectedLanguage, setDoctorDetectedLanguage] = useState<SupportedLanguageCode | null>(null);
  const [autoDetect, setAutoDetect] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<LanguageBridgeMessage[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(currentUser?.role === 'doctor' ? 'doctor' : 'patient');
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState<SpeakTarget>(null);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);
  const [langChangePrompt, setLangChangePrompt] = useState<string | null>(null);
  const [pendingLangChange, setPendingLangChange] = useState<{ speaker: ViewMode; language: SupportedLanguageCode } | null>(null);
  const [correctingId, setCorrectingId] = useState<number | null>(null);
  const [correctionText, setCorrectionText] = useState('');
  const [smsPreview, setSmsPreview] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [voiceConversation, setVoiceConversation] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const sameLanguage = patientLanguage === doctorLanguage;
  const speechSupported = speechRecognitionService.isSupported();

  useEffect(() => {
    if (currentUser?.language) {
      const map: Record<string, SupportedLanguageCode> = {
        ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN', kn: 'kn-IN', en: 'en-IN', hi: 'hi-IN',
      };
      setPatientLanguage(map[currentUser.language] || 'ta-IN');
    }
  }, [currentUser]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const startSession = async (common: boolean) => {
    const id = await createBridgeSession({
      patientId: currentUser?.role === 'patient' ? currentUser.id : undefined,
      doctorId: currentUser?.role === 'doctor' ? currentUser.id : 1,
      patientLanguage,
      doctorLanguage,
      autoDetect,
      commonLanguage: common,
    });
    setSessionId(id);
    setStep('active');
    if (common) setNotice(t('languageBridge.commonDetected'));
  };

  const persistAndShow = async (speaker: 'patient' | 'doctor', result: BridgeTranslationResult) => {
    if (!sessionId) return;
    await saveBridgeMessage(sessionId, speaker, result);
    const next = await loadSessionMessages(sessionId);
    setMessages(next);

    if (result.isAppointment && speaker === 'patient') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const date = tomorrow.toISOString().split('T')[0];
      await db.appointments.add({
        patientId: currentUser?.role === 'patient' ? currentUser.id : 1,
        doctorId: currentUser?.role === 'doctor' ? currentUser.id : 1,
        date,
        reason: result.translatedText,
        status: 'scheduled',
        notes: JSON.stringify({
          appointmentId: `lb-${sessionId}-${Date.now()}`,
          patientId: currentUser?.id,
          doctorId: 1,
          patientLanguage,
          doctorLanguage,
          date,
          time: '10:00',
          status: 'scheduled',
        }),
      });
      setNotice(t('languageBridge.appointmentStored'));
    }
  };

  const handleUtterance = async (speaker: ViewMode, text: string) => {
    const expected = speaker === 'patient' ? patientLanguage : doctorLanguage;
    const detected = detectSpokenLanguage(text, autoDetect ? undefined : expected);
    if (speaker === 'patient') setPatientDetectedLanguage(detected.language);
    else setDoctorDetectedLanguage(detected.language);

    if (autoDetect && detected.mismatch) {
      setPendingLangChange({ speaker, language: detected.language });
      setLangChangePrompt(
        t('languageBridge.languageChanged', {
          language: languageDisplayName(detected.language),
        })
      );
    }

    const sourceLang = autoDetect && !detected.mismatch ? detected.language : expected;
    const targetLang = speaker === 'patient' ? doctorLanguage : patientLanguage;
    const result = await translateHealthcareTextAsync(text, sourceLang, targetLang);
    await persistAndShow(speaker, result);

    if (voiceConversation) {
      const listenLang = speaker === 'patient' ? doctorLanguage : patientLanguage;
      speakTranslation(result, listenLang);
    }
  };

  const speakTranslation = (result: BridgeTranslationResult, lang: SupportedLanguageCode) => {
    if (result.translationStatus === 'Unsupported') {
      setTtsNotice(t('languageBridge.unsupportedHint'));
      return;
    }
    setTtsNotice(null);
    const ok = speechSynthesisService.speakResponse(
      result.translatedText,
      lang,
      lang,
      () => {
        setSpeaking(true);
        setPaused(false);
      },
      () => setSpeaking(false),
      (reason) => {
        setSpeaking(false);
        setTtsNotice(reason);
      }
    );
    if (!ok && !ttsNotice) setTtsNotice(t('languageBridge.ttsUnavailable'));
  };

  const startListening = (who: ViewMode) => {
    const lang = who === 'patient' ? patientLanguage : doctorLanguage;
    speechRecognitionService.startListening(lang, {
      onStart: () => setListening(who),
      onResult: (text, isFinal) => {
        setDraft(text);
        if (isFinal && text.trim().length > 1) {
          speechRecognitionService.stopListening();
          setListening(null);
          void handleUtterance(who, text);
          setDraft('');
        }
      },
      onError: (err) => {
        setListening(null);
        setNotice(err);
      },
      onEnd: () => setListening(null),
    });
  };

  const submitTyped = async () => {
    if (!draft.trim()) return;
    await handleUtterance(viewMode, draft.trim());
    setDraft('');
  };

  const endConversation = async () => {
    if (!sessionId) return;
    speechSynthesisService.stop();
    await endBridgeSession(sessionId);
    const patientMsgs = messages.filter((m) => m.speaker === 'patient');
    const doctorMsgs = messages.filter((m) => m.speaker === 'doctor');
    await db.doctorSummaries.add({
      patientId: currentUser?.role === 'patient' ? currentUser.id : 1,
      doctorId: currentUser?.role === 'doctor' ? currentUser.id : 1,
      complaint: patientMsgs[0]?.translatedText || patientMsgs[0]?.originalText || 'Language Bridge consultation',
      symptoms: patientMsgs.map((m) => m.translatedText),
      duration: '',
      history: '',
      medicines: '',
      allergies: '',
      vitals: '',
      observations: `Language bridge used. UI language: ${uiLanguage}. Patient ${languageDisplayName(patientLanguage)} ↔ Doctor ${languageDisplayName(doctorLanguage)}.`,
      warningSigns: messages.filter((m) => m.isEmergency).map((m) => m.translatedText),
      nextStep: doctorMsgs.at(-1)?.originalText || '',
      createdAt: new Date().toISOString(),
      patientLanguage,
      doctorLanguage,
      languageBridgeUsed: !sameLanguage,
      originalPatientStatements: patientMsgs.map((m) => m.originalText).join('\n'),
      translatedPatientStatements: patientMsgs.map((m) => m.translatedText).join('\n'),
      doctorResponseOriginal: doctorMsgs.map((m) => m.originalText).join('\n'),
      doctorResponseTranslated: doctorMsgs.map((m) => m.translatedText).join('\n'),
      followUp: '',
      appointmentNotes: messages.some((m) => /appointment|10 AM|நாளை/i.test(m.originalText + m.translatedText))
        ? 'Appointment discussed during Language Bridge session'
        : '',
    });
    navigate('/doctor-summary');
  };

  const sendSms = async () => {
    const lastPatient = [...messages].reverse().find((m) => m.speaker === 'patient');
    if (!lastPatient) return;
    const body = `MEDORA LANGUAGE BRIDGE\nPatient (${languageDisplayName(lastPatient.originalLanguage)}):\n${lastPatient.originalText}\n\nDoctor (${languageDisplayName(lastPatient.translatedLanguage)}):\n${lastPatient.translatedText}\n\n[Offline local preview — not a live SMS network]`;
    setSmsPreview(body);
    await db.smsOutbox.add({
      toPhone: 'Doctor',
      message: body,
      type: 'language_bridge',
      language: lastPatient.translatedLanguage.slice(0, 2),
      status: 'PENDING_OFFLINE',
      createdAt: new Date().toISOString(),
    });
    setNotice(t('languageBridge.smsQueued'));
  };

  const saveCorrection = async (msg: LanguageBridgeMessage) => {
    if (!sessionId || !correctionText.trim()) return;
    await saveTranslationCorrection({
      sessionId,
      original: msg.originalText,
      machineTranslation: msg.machineTranslation || msg.translatedText,
      correctedTranslation: correctionText.trim(),
      languagePair: `${msg.originalLanguage}->${msg.translatedLanguage}`,
      timestamp: new Date().toISOString(),
    });
    setCorrectingId(null);
    setCorrectionText('');
    setMessages(await loadSessionMessages(sessionId));
    setNotice(t('languageBridge.correctionSaved'));
  };

  const langSelect = (value: SupportedLanguageCode, setter: (v: SupportedLanguageCode) => void) => (
    <select
      value={value}
      onChange={(e) => setter(e.target.value as SupportedLanguageCode)}
      className="w-full min-h-12 rounded-xl border border-[#E2E8F0] bg-white px-3 text-base font-semibold text-[#0F172A]"
    >
      {BRIDGE_LANGS.map((code) => (
        <option key={code} value={code}>
          {languageDisplayName(code)} ({nativeLanguageName(code)})
        </option>
      ))}
    </select>
  );

  const lastFor = (speaker: ViewMode) => [...messages].reverse().find((m) => m.speaker === speaker);

  return (
    <Layout>
      <div className="px-4 py-4 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#0F766E]">🌐 {t('languageBridge.title')}</h1>
          <DemoDataBadge />
        </div>
        <p className="text-xs text-[#64748B]">{t('languageBridge.limitation')}</p>

        {step === 'common' && (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-4">
            <p className="text-lg font-bold text-[#0F172A]">{t('languageBridge.commonQuestion')}</p>
            <button
              onClick={() => {
                setDoctorLanguage(patientLanguage);
                void startSession(true);
              }}
              className="w-full min-h-14 rounded-2xl bg-white border-2 border-[#0F766E] text-[#0F766E] font-bold text-base"
            >
              ✓ {t('languageBridge.yesCommon')}
            </button>
            <button
              onClick={() => setStep('setup')}
              className="w-full min-h-14 rounded-2xl bg-[#0F766E] text-white font-bold text-base"
            >
              🌐 {t('languageBridge.noBridge')}
            </button>
          </div>
        )}

        {step === 'setup' && (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-4">
            <label className="block text-sm font-bold text-[#0F172A]">
              {t('languageBridge.patientLanguage')}
              <div className="mt-2">{langSelect(patientLanguage, setPatientLanguage)}</div>
            </label>
            <label className="block text-sm font-bold text-[#0F172A]">
              {t('languageBridge.doctorLanguage')}
              <div className="mt-2">{langSelect(doctorLanguage, setDoctorLanguage)}</div>
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-[#475569]">
              <input type="checkbox" checked={autoDetect} onChange={(e) => setAutoDetect(e.target.checked)} className="w-5 h-5" />
              {t('languageBridge.detectAuto')}
            </label>
            <button
              onClick={() => void startSession(patientLanguage === doctorLanguage)}
              className="w-full min-h-14 rounded-2xl bg-[#0F766E] text-white font-bold"
            >
              {t('languageBridge.start')}
            </button>
          </div>
        )}

        {step === 'active' && (
          <>
            <div className="bg-gradient-to-br from-[#F0FDFA] to-[#EFF6FF] border border-[#E2E8F0] rounded-3xl p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-[#0F766E]">🌐 {t('languageBridge.cardTitle')}</div>
                  <div className="mt-2 text-sm text-[#0F172A]">
                    <span className="font-bold">{t('languageBridge.patient')}:</span> {languageDisplayName(patientLanguage)} ({nativeLanguageName(patientLanguage)})
                  </div>
                  <div className="text-sm text-[#0F172A]">
                    <span className="font-bold">{t('languageBridge.doctor')}:</span> {languageDisplayName(doctorLanguage)} ({nativeLanguageName(doctorLanguage)})
                  </div>
                </div>
                <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${sameLanguage ? 'bg-green-100 text-green-800' : 'bg-teal-100 text-teal-800'}`}>
                  {sameLanguage ? `✓ ${t('languageBridge.off')}` : `🟢 ${t('languageBridge.active')}`}
                </div>
              </div>
              <p className="text-[11px] text-[#64748B] mt-2">{t('languageBridge.uiVsConversation', { ui: uiLanguage.toUpperCase() })}</p>
            </div>

            {langChangePrompt && pendingLangChange && (
              <div className="bg-[#FFFBEB] border border-amber-200 rounded-2xl p-4 space-y-2">
                <p className="text-sm font-semibold text-amber-900">{langChangePrompt}</p>
                <div className="flex gap-2">
                  <button
                    className="flex-1 min-h-12 bg-[#0F766E] text-white rounded-xl font-bold"
                    onClick={() => {
                      if (pendingLangChange.speaker === 'patient') setPatientLanguage(pendingLangChange.language);
                      else setDoctorLanguage(pendingLangChange.language);
                      setLangChangePrompt(null);
                      setPendingLangChange(null);
                    }}
                  >
                    {t('common.yes')}
                  </button>
                  <button
                    className="flex-1 min-h-12 bg-white border border-[#E2E8F0] rounded-xl font-bold"
                    onClick={() => {
                      setLangChangePrompt(null);
                      setPendingLangChange(null);
                    }}
                  >
                    {t('common.no')}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('patient')}
                className={`flex-1 min-h-12 rounded-xl font-bold ${viewMode === 'patient' ? 'bg-[#0F766E] text-white' : 'bg-white border border-[#E2E8F0] text-[#0F766E]'}`}
              >
                {t('languageBridge.patientView')}
              </button>
              <button
                onClick={() => setViewMode('doctor')}
                className={`flex-1 min-h-12 rounded-xl font-bold ${viewMode === 'doctor' ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E2E8F0] text-[#2563EB]'}`}
              >
                {t('languageBridge.doctorView')}
              </button>
            </div>

            {viewMode === 'patient' ? (
              <PatientPanel
                patientLanguage={patientLanguage}
                doctorLanguage={doctorLanguage}
                last={lastFor('patient')}
                lastDoctor={lastFor('doctor')}
              />
            ) : (
              <DoctorPanel
                patientLanguage={patientLanguage}
                doctorLanguage={doctorLanguage}
                lastPatient={lastFor('patient')}
                lastDoctor={lastFor('doctor')}
              />
            )}

            <div ref={chatRef} className="bg-white border border-[#E2E8F0] rounded-3xl p-4 max-h-72 overflow-y-auto space-y-3">
              {messages.length === 0 && <p className="text-sm text-[#64748B] text-center py-6">{t('languageBridge.empty')}</p>}
              {messages.map((msg) => (
                <MessageCard
                  key={msg.id}
                  msg={msg}
                  correcting={correctingId === msg.id}
                  correctionText={correctionText}
                  setCorrectionText={setCorrectionText}
                  onStartCorrect={() => {
                    setCorrectingId(msg.id || null);
                    setCorrectionText(msg.translatedText);
                  }}
                  onSaveCorrect={() => void saveCorrection(msg)}
                  onSpeak={() =>
                    speakTranslation(
                      {
                        originalLanguage: msg.originalLanguage as SupportedLanguageCode,
                        originalText: msg.originalText,
                        translatedLanguage: msg.translatedLanguage as SupportedLanguageCode,
                        translatedText: msg.translatedText,
                        translationConfidence: msg.translationConfidence,
                        translationStatus: msg.translationStatus as BridgeTranslationResult['translationStatus'],
                        engine: 'local-phrase',
                        preservedTokens: [],
                        isEmergency: !!msg.isEmergency,
                        isCritical: !!msg.isCritical,
                        isAppointment: false,
                        needsConfirmation: !!msg.needsConfirmation,
                      },
                      msg.translatedLanguage as SupportedLanguageCode
                    )
                  }
                />
              ))}
            </div>

            {ttsNotice && <div className="text-sm bg-[#FFFBEB] border border-amber-200 text-amber-900 rounded-xl p-3">{ttsNotice}</div>}
            {notice && <div className="text-sm bg-[#F0FDF4] border border-green-200 text-green-800 rounded-xl p-3">{notice}</div>}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => startListening(viewMode)}
                disabled={!speechSupported}
                className="min-h-14 rounded-2xl bg-[#14B8A6] text-white font-bold flex items-center justify-center gap-2"
              >
                <Mic size={20} /> {t('languageBridge.speak')}
              </button>
              <button
                onClick={() => setVoiceConversation((v) => !v)}
                className={`min-h-14 rounded-2xl font-bold ${voiceConversation ? 'bg-[#0F766E] text-white' : 'bg-white border border-[#0F766E] text-[#0F766E]'}`}
              >
                🎤 {t('languageBridge.voiceConversation')}
              </button>
            </div>
            {!speechSupported && <p className="text-xs text-[#D97706]">{t('languageBridge.typeFallback')}</p>}
            {listening && <p className="text-sm font-bold text-red-600">🔴 {t('languageBridge.listening')}</p>}

            <div className="flex gap-2">
              <Keyboard className="mt-3 text-[#64748B]" size={20} />
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('languageBridge.typePlaceholder')}
                className="flex-1 min-h-16 rounded-xl border border-[#E2E8F0] p-3 text-base"
              />
              <button onClick={() => void submitTyped()} className="min-w-14 rounded-xl bg-[#0F766E] text-white flex items-center justify-center">
                <Send size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => speechSynthesisService.pause()}
                className="min-h-12 rounded-xl bg-white border border-[#E2E8F0] font-bold"
              >
                <Pause className="inline mr-1" size={16} /> {t('languageBridge.pause')}
              </button>
              <button
                onClick={() => {
                  speechSynthesisService.resume();
                  setPaused(false);
                }}
                className="min-h-12 rounded-xl bg-white border border-[#E2E8F0] font-bold"
              >
                <Play className="inline mr-1" size={16} /> {t('languageBridge.resume')}
              </button>
              <button
                onClick={() => {
                  speechSynthesisService.stop();
                  setSpeaking(false);
                }}
                className="min-h-12 rounded-xl bg-[#FEF2F2] border border-red-200 text-[#B91C1C] font-bold"
              >
                <Square className="inline mr-1" size={16} /> {t('languageBridge.stop')}
              </button>
            </div>
            {speaking && <p className="text-sm font-bold text-[#14B8A6]">🔊 {t('languageBridge.speaking')}</p>}
            {paused && <p className="text-sm">{t('languageBridge.paused')}</p>}

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => void sendSms()} className="min-h-12 rounded-xl bg-[#2563EB] text-white font-bold">
                {t('languageBridge.sendSms')}
              </button>
              <button
                onClick={async () => {
                  if (sessionId) await clearSessionMessages(sessionId);
                  setMessages([]);
                }}
                className="min-h-12 rounded-xl bg-white border border-[#E2E8F0] font-bold"
              >
                {t('languageBridge.clear')}
              </button>
            </div>
            {smsPreview && (
              <div className="bg-[#EFF6FF] border border-blue-200 rounded-2xl p-4 text-sm whitespace-pre-wrap">
                <div className="font-bold mb-1">{t('languageBridge.smsPreview')}</div>
                {smsPreview}
              </div>
            )}
            <button onClick={() => void endConversation()} className="w-full min-h-14 rounded-2xl bg-[#0F172A] text-white font-bold">
              {t('languageBridge.end')}
            </button>
            <p className="text-[11px] text-[#64748B]">
              {t('languageBridge.lockState', {
                patient: languageDisplayName(patientLanguage),
                doctor: languageDisplayName(doctorLanguage),
                detectedP: languageDisplayName(patientDetectedLanguage || patientLanguage),
                detectedD: languageDisplayName(doctorDetectedLanguage || doctorLanguage),
              })}
            </p>
            <Link to="/ivr" className="block text-center text-sm font-bold text-[#0F766E]">
              {t('languageBridge.ivrNote')}
            </Link>
          </>
        )}
      </div>
    </Layout>
  );
}

function PatientPanel({
  patientLanguage,
  doctorLanguage,
  last,
  lastDoctor,
}: {
  patientLanguage: SupportedLanguageCode;
  doctorLanguage: SupportedLanguageCode;
  last?: LanguageBridgeMessage;
  lastDoctor?: LanguageBridgeMessage;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 space-y-2">
      <div className="text-xs font-bold text-[#0F766E]">🌐 {t('languageBridge.title')}</div>
      <p className="text-sm">{t('languageBridge.youSpeak')}: {LANGUAGE_METADATA[patientLanguage].name}</p>
      <p className="text-sm">{t('languageBridge.doctorSpeaks')}: {LANGUAGE_METADATA[doctorLanguage].name}</p>
      {last && (
        <>
          <div className="text-xs font-bold text-[#64748B]">{t('languageBridge.yourMessage')}</div>
          <p className="text-lg leading-relaxed">{last.originalText}</p>
          <div className="text-xs font-bold text-[#2563EB]">{t('languageBridge.translationForDoctor')}</div>
          <p className="text-base bg-[#EFF6FF] rounded-xl p-3">{last.translatedText}</p>
        </>
      )}
      {lastDoctor && (
        <div className="bg-[#F0FDFA] rounded-xl p-3">
          <div className="text-xs font-bold">{t('languageBridge.doctorReply')}</div>
          <p className="text-lg">{lastDoctor.translatedText}</p>
        </div>
      )}
    </div>
  );
}

function DoctorPanel({
  patientLanguage,
  doctorLanguage,
  lastPatient,
  lastDoctor,
}: {
  patientLanguage: SupportedLanguageCode;
  doctorLanguage: SupportedLanguageCode;
  lastPatient?: LanguageBridgeMessage;
  lastDoctor?: LanguageBridgeMessage;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 space-y-2">
      <div className="text-xs font-bold text-[#2563EB]">🌐 {t('languageBridge.title')}</div>
      <p className="text-sm">{t('languageBridge.patientLanguage')}: {LANGUAGE_METADATA[patientLanguage].name}</p>
      <p className="text-sm">{t('languageBridge.yourLanguage')}: {LANGUAGE_METADATA[doctorLanguage].name}</p>
      {lastPatient && (
        <>
          <div className="text-xs font-bold">{t('languageBridge.patientSaid')}</div>
          <p className="text-lg bg-[#EFF6FF] rounded-xl p-3">{lastPatient.translatedText}</p>
          <div className="text-xs font-bold text-[#64748B]">{t('languageBridge.original')}</div>
          <p className="text-base">{lastPatient.originalText}</p>
          {lastPatient.needsConfirmation && (
            <p className="text-sm text-[#B91C1C] font-semibold">⚠ {t('languageBridge.verify')}</p>
          )}
        </>
      )}
      {lastDoctor && (
        <div className="bg-[#F0FDFA] rounded-xl p-3">
          <div className="text-xs font-bold">{t('languageBridge.yourReply')}</div>
          <p>{lastDoctor.originalText}</p>
          <div className="text-xs mt-2">{t('languageBridge.patientHears')}</div>
          <p className="text-lg">{lastDoctor.translatedText}</p>
        </div>
      )}
    </div>
  );
}

function MessageCard({
  msg,
  correcting,
  correctionText,
  setCorrectionText,
  onStartCorrect,
  onSaveCorrect,
  onSpeak,
}: {
  msg: LanguageBridgeMessage;
  correcting: boolean;
  correctionText: string;
  setCorrectionText: (v: string) => void;
  onStartCorrect: () => void;
  onSaveCorrect: () => void;
  onSpeak: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={`rounded-2xl p-3 border ${msg.speaker === 'patient' ? 'bg-[#F0FDFA] border-teal-100' : 'bg-[#EFF6FF] border-blue-100'}`}>
      <div className="flex justify-between text-[11px] font-bold text-[#64748B]">
        <span>{msg.speaker === 'patient' ? t('languageBridge.patient') : t('languageBridge.doctor')}</span>
        <span>{msg.timestamp.slice(11, 16)}</span>
      </div>
      <p className="text-sm mt-1"><span className="font-semibold">{t('languageBridge.original')}:</span> {msg.originalText}</p>
      <p className="text-sm mt-1"><span className="font-semibold">{t('languageBridge.translated')}:</span> {msg.translatedText}</p>
      <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
        <span className="px-2 py-0.5 rounded-full bg-white border">{msg.originalLanguage} → {msg.translatedLanguage}</span>
        <span className="px-2 py-0.5 rounded-full bg-white border">{msg.translationStatus}</span>
        <span className="px-2 py-0.5 rounded-full bg-white border">{msg.translationConfidence}</span>
        {msg.isEmergency && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">Emergency</span>}
      </div>
      {msg.translationStatus === 'Unsupported' && (
        <p className="text-xs text-amber-800 mt-2">{t('languageBridge.unsupportedHint')}</p>
      )}
      <div className="flex gap-2 mt-2">
        <button onClick={onSpeak} className="text-xs font-bold text-[#0F766E] flex items-center gap-1">
          <Volume2 size={14} /> {t('languageBridge.hear')}
        </button>
        <button onClick={onStartCorrect} className="text-xs font-bold text-[#475569]">✏ {t('languageBridge.correct')}</button>
      </div>
      {correcting && (
        <div className="mt-2 space-y-2">
          <textarea value={correctionText} onChange={(e) => setCorrectionText(e.target.value)} className="w-full border rounded-xl p-2 text-sm" />
          <button onClick={onSaveCorrect} className="min-h-10 px-3 bg-[#0F766E] text-white rounded-xl text-xs font-bold">{t('common.save')}</button>
        </div>
      )}
    </div>
  );
}

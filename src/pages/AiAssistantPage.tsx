import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/db';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { conversationEngine, ProcessedConversationTurn } from '../services/voice/conversationEngine';
import { speechRecognitionService } from '../services/voice/speechRecognitionService';
import { speechSynthesisService } from '../services/voice/speechSynthesisService';
import { SupportedLanguageCode, LANGUAGE_METADATA } from '../data/languages';
import {
  Mic, MicOff, Volume2, Send, Sparkles, AlertTriangle, Globe,
  RotateCcw, FileText, PhoneCall, CheckCircle, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AiAssistantPage() {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    text: string;
    agentName?: string;
    isEmergency?: boolean;
    language?: SupportedLanguageCode;
  }>>([
    {
      role: 'assistant',
      text: 'Hello! I am Medora, your rural healthcare companion. Speak to me naturally in Tamil, Telugu, Malayalam, Kannada, or English. Tell me what is wrong.',
      agentName: 'Medora Triage Assistant',
      language: 'en-IN'
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [detectedLang, setDetectedLang] = useState<SupportedLanguageCode>('en-IN');
  const [confidenceLevel, setConfidenceLevel] = useState<'high' | 'medium' | 'uncertain'>('high');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [summarySuccess, setSummarySuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isProcessing) return;

    setInput('');
    setIsProcessing(true);
    setStatusNotice(null);

    // Append user message immediately
    setMessages((prev) => [...prev, { role: 'user', text, language: detectedLang }]);

    try {
      const turnResult: ProcessedConversationTurn = await conversationEngine.processUserInput(text);

      setDetectedLang(turnResult.detectedLanguage);
      setConfidenceLevel(turnResult.confidenceLevel);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: turnResult.responseText,
          agentName: turnResult.agentName,
          isEmergency: turnResult.isEmergency,
          language: turnResult.detectedLanguage
        }
      ]);

      // Speak response in SAME language
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
      setStatusNotice('Error processing query: ' + e?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartListening = () => {
    setStatusNotice(null);
    const ok = speechRecognitionService.startListening(detectedLang, {
      onStart: () => setIsListening(true),
      onResult: (transcriptText, isFinal) => {
        setInput(transcriptText);
        if (isFinal && transcriptText.trim()) {
          handleSendMessage(transcriptText);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setStatusNotice(err);
      },
      onEnd: () => setIsListening(false)
    });
    if (!ok) setIsListening(false);
  };

  const handleStopListening = () => {
    speechRecognitionService.stopListening();
    setIsListening(false);
    if (input.trim()) {
      handleSendMessage(input);
    }
  };

  const handleReplayVoice = (text: string, lang?: SupportedLanguageCode) => {
    const target = lang || detectedLang;
    speechSynthesisService.speakResponse(
      text,
      target,
      target,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      (err) => {
        setIsSpeaking(false);
        setStatusNotice(err);
      }
    );
  };

  const generateDoctorSummary = async () => {
    if (!currentUser?.id) return;
    const userComplaints = messages.filter((m) => m.role === 'user').map((m) => m.text).join('; ');
    const aiNotes = messages.filter((m) => m.role === 'assistant').map((m) => m.text).join('\n\n');

    await db.doctorSummaries.add({
      patientId: currentUser.id,
      doctorId: 1,
      complaint: userComplaints.slice(0, 250) || 'General health consultation',
      symptoms: [userComplaints || 'Symptoms discussed in session'],
      duration: 'As reported during voice conversation',
      history: 'Recorded in Medora AI Session',
      medicines: 'As stored in active records',
      allergies: 'None reported in session',
      vitals: 'Check recent vitals in tests tab',
      observations: aiNotes.slice(0, 500),
      warningSigns: ['Generated during multilingual triage session'],
      nextStep: 'Present summary to treating physician at PHC / Hospital',
      createdAt: new Date().toISOString()
    });

    setSummarySuccess(true);
    setTimeout(() => setSummarySuccess(false), 4000);
  };

  const QUICK_QUERIES = [
    { label: 'Fever (English)', text: 'I have had a fever and body pain for two days' },
    { label: 'காய்ச்சல் (Tamil)', text: 'எனக்கு இரண்டு நாட்களாக காய்ச்சல் இருக்கிறது' },
    { label: 'జ్వరం (Telugu)', text: 'నాకు రెండు రోజులుగా జ్వరం ఉంది' },
    { label: 'പനി (Malayalam)', text: 'എനിക്ക് രണ്ട് ദിവസമായി പനി ഉണ്ട്' },
    { label: 'ಜ್ವರ (Kannada)', text: 'ನನಗೆ ಎರಡು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ' },
    { label: 'Pregnant dizziness', text: 'I am pregnant and feeling dizzy since morning' },
    { label: 'Emergency: Chest pain', text: 'Severe chest pain and difficulty breathing' }
  ];

  const currentLangMeta = LANGUAGE_METADATA[detectedLang] || LANGUAGE_METADATA['en-IN'];

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-130px)] max-w-2xl mx-auto px-3 py-2">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-950 text-white px-4 py-3 rounded-2xl shadow-md mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600/80 flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>Ask Medora AI Assistant</span>
                <span className="text-[10px] bg-teal-500/30 text-teal-200 px-2 py-0.2 rounded-full border border-teal-400/30">
                  Multilingual Voice
                </span>
              </div>
              <p className="text-[10px] text-teal-200/80">
                Auto-detects Tamil, Telugu, Malayalam, Kannada & English
              </p>
            </div>
          </div>

          {/* Detected Language Indicator */}
          <div className="bg-teal-900/80 border border-teal-500/40 rounded-xl px-2.5 py-1 text-right">
            <div className="text-[9px] text-teal-300 uppercase font-bold">Detected</div>
            <div className="text-xs font-black text-white flex items-center gap-1">
              <span>{currentLangMeta.flag}</span>
              <span>{currentLangMeta.nativeName}</span>
            </div>
          </div>
        </div>

        {/* Status or warning alert */}
        {statusNotice && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-xl mb-2 flex items-center gap-2">
            <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" />
            <span className="flex-1">{statusNotice}</span>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-inner mb-2">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  m.role === 'user'
                    ? 'bg-teal-700 text-white rounded-br-xs font-medium'
                    : m.isEmergency
                    ? 'bg-red-50 border border-red-300 text-red-950 rounded-bl-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-bl-xs'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="flex items-center justify-between font-bold text-[10px] mb-1 opacity-80">
                    <span className="text-teal-700 flex items-center gap-1">
                      <Sparkles size={11} /> {m.agentName || 'Medora AI'}
                    </span>
                    {m.isEmergency && (
                      <span className="bg-red-600 text-white px-1.5 rounded font-black text-[9px]">EMERGENCY</span>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>

                {m.role === 'assistant' && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
                    <button
                      onClick={() => handleReplayVoice(m.text, m.language)}
                      className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
                    >
                      <Volume2 size={12} /> {m.language?.slice(0, 2).toUpperCase()} Audio
                    </button>
                    <span className="text-slate-400">Deterministic local response</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl px-4 py-2 text-xs text-teal-800 flex items-center gap-2">
                <span className="animate-spin">🔄</span>
                <span>Medora is processing your request in {currentLangMeta.nativeName}...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="overflow-x-auto pb-1 mb-2 scrollbar-hide">
          <div className="flex gap-1.5 whitespace-nowrap">
            {QUICK_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q.text)}
                className="bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Summary Action Bar */}
        {messages.length > 2 && (
          <div className="mb-2">
            <button
              onClick={generateDoctorSummary}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                summarySuccess ? 'bg-emerald-600 text-white' : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200'
              }`}
            >
              <FileText size={13} />
              <span>{summarySuccess ? '✅ Doctor Summary Saved to IndexedDB!' : 'Generate Doctor Handoff Summary'}</span>
            </button>
          </div>
        )}

        {/* Stop Speaking Button */}
        {isSpeaking && (
          <div className="mb-2 flex justify-center">
            <button
              onClick={() => speechSynthesisService.stop()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 w-full max-w-[200px] rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg active:scale-95 bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/30"
            >
              <span className="text-lg leading-none">⏹</span>
              <span>STOP SPEAKING</span>
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 flex items-center gap-2 shadow-sm">
          <button
            onClick={isListening ? handleStopListening : handleStartListening}
            className={`p-2.5 rounded-xl transition-all shadow-sm ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isListening ? 'Listening...' : 'Type in Tamil, Telugu, Malayalam, Kannada or English...'}
            className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isProcessing}
            className="bg-teal-700 hover:bg-teal-800 disabled:opacity-30 text-white p-2.5 rounded-xl font-bold transition-all"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </Layout>
  );
}

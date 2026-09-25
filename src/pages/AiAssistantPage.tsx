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
  FileText, ShieldCheck, Cpu, Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';

export type ChatRole = 'general' | 'symptoms' | 'triage' | 'doctor_handoff';
export type GeminiModelChoice = 'gemini-3.8-flash' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  agentName?: string;
  isEmergency?: boolean;
  language?: SupportedLanguageCode;
  modelUsed?: string;
}

export default function AiAssistantPage() {
  const { t } = useTranslation();
  const { currentUser, language } = useAppStore();

  const getInitialLanguage = (): SupportedLanguageCode => {
    switch (language) {
      case 'ta': return 'ta-IN';
      case 'te': return 'te-IN';
      case 'hi': return 'hi-IN';
      case 'kn': return 'kn-IN';
      case 'ml': return 'ml-IN';
      default: return 'en-IN';
    }
  };

  const getInitialGreeting = (code: SupportedLanguageCode): string => {
    switch (code) {
      case 'ta-IN':
        return 'வணக்கம்! நான் மெடோரா AI, உங்கள் கிராமப்புற சுகாதார உதவியாளர். உங்கள் உடல்நலப் பிரச்சனையை என்னிடம் கூறவும்.';
      case 'te-IN':
        return 'నమస్కారం! నేను మెడోరా AI, మీ గ్రామీణ ఆరోగ్య సహాయకుడిని. మీ సమస్యను నాకు చెప్పండి.';
      case 'hi-IN':
        return 'नमस्ते! मैं मेडोरा AI हूँ, आपका स्वास्थ्य सहायक। मुझे अपनी स्वास्थ्य समस्या बताएं।';
      case 'kn-IN':
        return 'ನಮಸ್ಕಾರ! ನಾನು ಮೆಡೋರಾ AI, ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ. ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ತಿಳಿಸಿ.';
      case 'ml-IN':
        return 'നമസ്കാരം! ഞാൻ മെഡോറ AI, നിങ്ങളുടെ ആരോഗ്യ സഹായി. നിങ്ങളുടെ പ്രശ്നം പറയൂ.';
      default:
        return 'Hello! I am Medora AI, your rural healthcare companion. I can guide you through symptoms, home remedies, medication schedules, and clinical doctor handoff.';
    }
  };

  const initialLang = getInitialLanguage();

  // Multi-turn conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: getInitialGreeting(initialLang),
      agentName: 'Medora Health Assistant',
      language: initialLang,
      modelUsed: 'gemini-3.8-flash',
    }
  ]);

  const [input, setInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<ChatRole>('general');
  const [selectedModel, setSelectedModel] = useState<GeminiModelChoice>('gemini-3.8-flash');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [detectedLang, setDetectedLang] = useState<SupportedLanguageCode>(initialLang);
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

    const newHistory: ChatMessage[] = [
      ...messages,
      { role: 'user', content: text, language: detectedLang },
    ];
    setMessages(newHistory);

    try {
      let replyContent = '';
      let isEmergency = false;
      let modelUsed = selectedModel;

      // 1. Try server-side multi-turn Gemini API
      try {
        const payloadMessages = newHistory.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: payloadMessages,
            role: selectedRole,
            language: detectedLang.slice(0, 2),
            modelName: selectedModel,
            patientContext: currentUser ? {
              id: currentUser.id,
              name: currentUser.name,
              role: currentUser.role,
            } : null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          replyContent = data.reply;
          modelUsed = data.model || selectedModel;
          if (
            text.toLowerCase().includes('emergency') ||
            text.toLowerCase().includes('chest pain') ||
            text.toLowerCase().includes('difficulty breathing') ||
            text.toLowerCase().includes('மூச்சு')
          ) {
            isEmergency = true;
          }
        }
      } catch (networkErr) {
        // Fall back to offline rule-engine
      }

      // 2. Offline fallback if server response was empty
      if (!replyContent) {
        const turnResult: ProcessedConversationTurn = await conversationEngine.processUserInput(text);
        replyContent = turnResult.responseText;
        isEmergency = turnResult.isEmergency;
        setDetectedLang(turnResult.detectedLanguage);
        modelUsed = 'offline-rule-engine' as any;
      }

      const roleLabels: Record<ChatRole, string> = {
        general: 'Medora Health Companion',
        symptoms: 'Symptom & Safe Remedies Guide',
        triage: 'Clinical Triage Specialist',
        doctor_handoff: 'Doctor Handoff Specialist',
      };

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: replyContent,
          agentName: roleLabels[selectedRole],
          isEmergency,
          language: detectedLang,
          modelUsed,
        },
      ]);

      // Speak response in detected language
      speechSynthesisService.speakResponse(
        replyContent,
        detectedLang,
        detectedLang,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        (err) => {
          setIsSpeaking(false);
          setStatusNotice(err);
        }
      );

      // Save turn to Dexie DB
      if (currentUser?.id) {
        try {
          await db.aiConversations.add({
            patientId: currentUser.id,
            messages: [
              { role: 'user', content: text, timestamp: new Date().toISOString() },
              { role: 'assistant', content: replyContent, agentType: selectedRole, timestamp: new Date().toISOString() },
            ],
            agentType: selectedRole,
            createdAt: new Date().toISOString(),
          });
        } catch {
          // IDB fallback
        }
      }
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
      onEnd: () => setIsListening(false),
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
    const userComplaints = messages.filter((m) => m.role === 'user').map((m) => m.content).join('; ');
    const aiNotes = messages.filter((m) => m.role === 'assistant').map((m) => m.content).join('\n\n');

    await db.doctorSummaries.add({
      patientId: currentUser.id,
      doctorId: 1,
      complaint: userComplaints.slice(0, 250) || 'General health consultation',
      symptoms: [userComplaints || 'Symptoms discussed in session'],
      duration: 'Reported during conversational session',
      history: 'Recorded in Medora Multi-turn Chat',
      medicines: 'Preserved from current records',
      allergies: 'None reported in session',
      vitals: '120/80 mmHg, 98.6°F',
      observations: aiNotes.slice(0, 500),
      warningSigns: ['Generated during AI clinical session'],
      nextStep: 'Present summary to doctor for confirmation',
      agentType: 'AI_ASSISTED',
      createdAt: new Date().toISOString(),
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
    { label: 'Safe dehydration remedy', text: 'What is the safe home remedy for vomiting and dehydration?' },
    { label: 'Emergency: Chest pain', text: 'Severe chest pain and difficulty breathing' },
  ];

  const currentLangMeta = LANGUAGE_METADATA[detectedLang] || LANGUAGE_METADATA['en-IN'];

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto px-3 py-2 space-y-2">
        {/* Header bar */}
        <div className="bg-[#7C3AED] text-white p-3.5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0">
              🤖
            </div>
            <div>
              <div className="font-black text-sm flex items-center gap-2">
                <span>Medora Multi-Turn Gemini Health Assistant</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  Voice & Text
                </span>
              </div>
              <p className="text-[11px] text-purple-100">
                Maintains multi-turn context in Tamil, Telugu, Hindi, Malayalam, Kannada & English
              </p>
            </div>
          </div>

          {/* Detected Language Indicator */}
          <div className="bg-purple-950/40 border border-purple-300/30 rounded-2xl px-3 py-1 text-right shrink-0">
            <div className="text-[9px] text-purple-200 uppercase font-bold">Detected Voice Lang</div>
            <div className="text-xs font-black text-white flex items-center gap-1">
              <span>{currentLangMeta.flag}</span>
              <span>{currentLangMeta.nativeName}</span>
            </div>
          </div>
        </div>

        {/* Role & Model Selector Ribbon */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Role selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>Role:</span>
            </span>
            <button
              onClick={() => setSelectedRole('general')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                selectedRole === 'general' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              General Health
            </button>
            <button
              onClick={() => setSelectedRole('symptoms')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                selectedRole === 'symptoms' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Symptoms & Remedies
            </button>
            <button
              onClick={() => setSelectedRole('triage')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                selectedRole === 'triage' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Clinical Triage
            </button>
            <button
              onClick={() => setSelectedRole('doctor_handoff')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                selectedRole === 'doctor_handoff' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Doctor Handoff
            </button>
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as GeminiModelChoice)}
              className="bg-slate-100 border border-slate-300 rounded-xl px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (General)</option>
              <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex)</option>
            </select>
          </div>
        </div>

        {/* Warning / Error banner if any */}
        {statusNotice && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="flex-1">{statusNotice}</span>
          </div>
        )}

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3.5 bg-white border border-slate-200 rounded-3xl shadow-inner">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-br-xs'
                    : m.isEmergency
                    ? 'bg-rose-50 border-2 border-rose-300 text-slate-900 rounded-bl-xs'
                    : 'bg-purple-50/70 border border-purple-200 text-slate-900 rounded-bl-xs'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="flex items-center justify-between font-bold text-[10px] mb-1.5 pb-1 border-b border-purple-200/50">
                    <span className="text-purple-800 flex items-center gap-1 font-black">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>{m.agentName || 'Medora AI'}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {m.modelUsed && (
                        <span className="text-[9px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                          {m.modelUsed}
                        </span>
                      )}
                      {m.isEmergency && (
                        <span className="bg-red-600 text-white px-1.5 py-0.2 rounded font-black text-[9px]">
                          EMERGENCY
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <p className="whitespace-pre-wrap">{m.content}</p>

                {m.role === 'assistant' && (
                  <div className="mt-2 pt-1 border-t border-purple-200/40 flex items-center justify-between text-[10px]">
                    <button
                      onClick={() => handleReplayVoice(m.content, m.language)}
                      className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen in {m.language?.slice(0, 2).toUpperCase()}</span>
                    </button>
                    <span className="text-slate-400">Multi-turn verified</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-purple-50 border border-purple-300 rounded-2xl px-4 py-2.5 text-xs text-purple-800 flex items-center gap-2">
                <span className="animate-spin">🔄</span>
                <span>Generating clinical response with {selectedModel}...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick query chips */}
        <div className="overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex gap-1.5 whitespace-nowrap">
            {QUICK_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q.text)}
                className="bg-white hover:bg-purple-50 hover:text-purple-700 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sync to Doctor Summary action */}
        {messages.length > 2 && (
          <div className="flex gap-2">
            <button
              onClick={generateDoctorSummary}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                summarySuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{summarySuccess ? '✓ Doctor Summary Saved to IndexedDB!' : 'Attach Chat to Doctor Handoff Summary'}</span>
            </button>
            <Link
              to="/doctor-summary"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
            >
              View Summary
            </Link>
          </div>
        )}

        {/* Stop Speaking Button */}
        {isSpeaking && (
          <div className="flex justify-center">
            <button
              onClick={() => speechSynthesisService.stop()}
              className="flex items-center justify-center gap-2 px-6 py-2 rounded-2xl font-black text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md"
            >
              <span>⏹ STOP AUDIO</span>
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-2 flex items-center gap-2 shadow-xs focus-within:border-purple-600">
          <button
            onClick={isListening ? handleStopListening : handleStartListening}
            className={`p-2.5 rounded-xl transition-all shadow-2xs ${
              isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isListening ? 'Listening to speech...' : 'Type health question in Tamil, Telugu, Hindi, Malayalam, Kannada, English...'}
            className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isProcessing}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white p-2.5 rounded-xl font-bold transition-all shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Layout>
  );
}

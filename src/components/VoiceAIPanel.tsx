import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { voiceAIService, VoiceAIResponse } from '../services/voiceAI';
import { speechRecognitionService } from '../services/voice/speechRecognitionService';
import { speechSynthesisService } from '../services/voice/speechSynthesisService';
import { SupportedLanguageCode } from '../data/languages';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Stethoscope,
  Info,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface VoiceMessageItem {
  id: string;
  sender: 'user' | 'voice_ai';
  text: string;
  time: string;
  isTransfer?: boolean;
}

export const VoiceAIPanel: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, language, setVoiceNavOpen } = useAppStore();

  const getLanguageCode = (): SupportedLanguageCode => {
    switch (language) {
      case 'ta': return 'ta-IN';
      case 'te': return 'te-IN';
      case 'hi': return 'hi-IN';
      case 'kn': return 'kn-IN';
      case 'ml': return 'ml-IN';
      default: return 'en-IN';
    }
  };

  const currentLangCode = getLanguageCode();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<VoiceMessageItem[]>([
    {
      id: 'init',
      sender: 'voice_ai',
      text: "Hello! I am Medora Voice AI. I can chat with you, help you navigate pages, and explain how to use Medora. (For medical diagnosis or symptoms, I will connect you with Medora Medical AI.)",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend) return;

    setInput('');
    const userMsg: VoiceMessageItem = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Send strictly to Voice AI (NEVER to Medical AI)
    const response: VoiceAIResponse = await voiceAIService.processVoiceRequest({
      text: textToSend,
      language: currentLangCode,
      userName: currentUser?.name,
    });

    const aiMsg: VoiceMessageItem = {
      id: String(Date.now() + 1),
      sender: 'voice_ai',
      text: response.responseText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTransfer: response.isMedicalTransferRecommended,
    };

    setMessages((prev) => [...prev, aiMsg]);

    // Speak response
    speechSynthesisService.speakResponse(
      response.responseText,
      currentLangCode,
      currentLangCode,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleToggleListening = () => {
    if (isListening) {
      speechRecognitionService.stopListening();
      setIsListening(false);
      if (input.trim()) handleSend(input);
    } else {
      speechRecognitionService.startListening(currentLangCode, {
        onStart: () => setIsListening(true),
        onResult: (text, isFinal) => {
          setInput(text);
          if (isFinal && text.trim()) {
            handleSend(text);
          }
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false),
      });
    }
  };

  const handleStopSpeaking = () => {
    speechSynthesisService.stop();
    setIsSpeaking(false);
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg shadow-2xs">
            🗣️
          </div>
          <div>
            <div className="font-extrabold text-sm flex items-center gap-2">
              <span>Medora Voice AI</span>
              <span className="text-[10px] bg-teal-500/40 text-teal-100 px-2 py-0.5 rounded-full font-bold">
                Normal Speaking &amp; App Help
              </span>
            </div>
            <p className="text-[11px] text-teal-100">
              Conversations, greetings, accessibility and offline page navigation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setVoiceNavOpen(true)}
            className="bg-white/15 hover:bg-white/25 text-white text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors"
            title="Open Voice Navigator"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voice Nav</span>
          </button>
        </div>
      </div>

      {/* Safety Notice Badge */}
      <div className="bg-teal-50/70 border-b border-teal-100 px-3 py-1.5 text-[11px] text-teal-900 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Non-diagnostic conversation system. Medical analysis is strictly handled by Medora Medical AI.</span>
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                m.sender === 'user'
                  ? 'bg-teal-700 text-white rounded-br-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold">
                <span className={m.sender === 'user' ? 'text-teal-200' : 'text-teal-700'}>
                  {m.sender === 'user' ? 'You' : 'Medora Voice AI'}
                </span>
                <span>{m.time}</span>
              </div>
              <p className="whitespace-pre-wrap">{m.text}</p>

              {m.isTransfer && (
                <div className="mt-2.5 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      navigate('/ai');
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Open Medora Medical AI →</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Quick Conversational Chips */}
      <div className="px-3 py-1.5 bg-white border-t border-slate-100 overflow-x-auto scrollbar-hide flex gap-1.5 shrink-0">
        {[
          'Hello Medora',
          'How are you?',
          'How do I upload a report?',
          'What is Medora?',
          'Thank you',
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-[11px] font-semibold text-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Speaking Active Indicator */}
      {isSpeaking && (
        <div className="bg-rose-50 px-3 py-1.5 border-t border-rose-200 flex items-center justify-between text-xs text-rose-800">
          <span className="flex items-center gap-1.5 font-bold">
            <Volume2 className="w-4 h-4 animate-bounce text-rose-600" />
            Speaking response...
          </span>
          <button
            onClick={handleStopSpeaking}
            className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded-lg font-bold"
          >
            Stop
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
        <button
          onClick={handleToggleListening}
          className={`p-2.5 rounded-xl font-bold text-white transition-all shadow-2xs ${
            isListening
              ? 'bg-rose-600 animate-pulse'
              : 'bg-teal-700 hover:bg-teal-800'
          }`}
          title={isListening ? 'Stop listening' : 'Start speaking'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? 'Listening...' : 'Speak or type conversational greeting / help question...'}
          className="flex-1 bg-slate-100 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white p-2.5 rounded-xl font-bold transition-all shadow-2xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

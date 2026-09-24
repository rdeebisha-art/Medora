import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { MockTelephonyAdapter, validatePhoneNumber } from '../services/voice/telephonyAdapter';
import { SupportedLanguageCode, LANGUAGE_METADATA } from '../data/languages';
import { speechRecognitionService } from '../services/voice/speechRecognitionService';
import { speechSynthesisService } from '../services/voice/speechSynthesisService';
import { Phone, PhoneOff, Mic, Volume2, Shield, Radio, Sparkles, StopCircle } from 'lucide-react';

export default function IvrPage() {
  const { t } = useTranslation();
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [telephonyLogs, setTelephonyLogs] = useState<Array<{ sender: 'user' | 'medora' | 'system'; text: string; lang?: SupportedLanguageCode }>>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [activeLang, setActiveLang] = useState<SupportedLanguageCode>('en-IN');
  const [tollFreeNumber, setTollFreeNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [telephonyAdapter] = useState(() => new MockTelephonyAdapter());

  const handleStartCall = async () => {
    setPhoneError('');
    const validation = validatePhoneNumber(tollFreeNumber);
    if (!validation.isValid) {
      setPhoneError(validation.message);
      return;
    }

    setTelephonyLogs([
      { sender: 'system', text: `Dialing ${validation.formattedNumber}...` },
      { sender: 'system', text: 'Connecting to Medora Voice Telephony Gateway (Simulation)...' }
    ]);

    await telephonyAdapter.connect(validation.formattedNumber);
    setCallStatus('connected');

    const greeting = 'Welcome to Medora Health Helpline. Please speak naturally in your language. Tell me what is wrong.';
    setTelephonyLogs((prev) => [
      ...prev,
      { sender: 'system', text: 'Call Connected (8000Hz Telephony Stream)' },
      { sender: 'medora', text: greeting, lang: 'en-IN' }
    ]);

    // Speak initial greeting
    speechSynthesisService.speakResponse(
      greeting,
      'en-IN',
      'en-IN',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleEndCall = async () => {
    speechSynthesisService.stop();
    speechRecognitionService.stopListening();
    await telephonyAdapter.disconnect();
    setCallStatus('idle');
    setIsListening(false);
    setIsSpeaking(false);
    setTelephonyLogs((prev) => [...prev, { sender: 'system', text: 'Call Ended.' }]);
  };

  const handleSendSpokenUtterance = async (spokenText: string) => {
    if (!spokenText.trim() || callStatus !== 'connected') return;

    setCurrentInput('');
    setTelephonyLogs((prev) => [...prev, { sender: 'user', text: spokenText }]);

    try {
      const result = await telephonyAdapter.processSpokenUtterance(spokenText);
      setActiveLang(result.language);

      setTelephonyLogs((prev) => [
        ...prev,
        { sender: 'medora', text: result.responseText, lang: result.language }
      ]);

      // Speak response in SAME language
      speechSynthesisService.speakResponse(
        result.responseText,
        result.language,
        result.language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    } catch (e: any) {
      setTelephonyLogs((prev) => [...prev, { sender: 'system', text: 'Error: ' + e?.message }]);
    }
  };

  const handleStartMic = () => {
    const ok = speechRecognitionService.startListening(activeLang, {
      onStart: () => setIsListening(true),
      onResult: (text, isFinal) => {
        setCurrentInput(text);
        if (isFinal && text.trim()) {
          handleSendSpokenUtterance(text);
        }
      },
      onError: (err) => {
        setIsListening(false);
      },
      onEnd: () => setIsListening(false)
    });
    if (!ok) setIsListening(false);
  };

  const handleStopMic = () => {
    speechRecognitionService.stopListening();
    setIsListening(false);
    if (currentInput.trim()) {
      handleSendSpokenUtterance(currentInput);
    }
  };

  const SAMPLE_QUERIES = [
    { label: 'Tamil: காய்ச்சல்', text: 'எனக்கு இரண்டு நாட்களாக காய்ச்சல் இருக்கிறது' },
    { label: 'Telugu: జ్వరం', text: 'నాకు నా బిడ్డకు జ్వరం ఉంది' },
    { label: 'Malayalam: പനി', text: 'എനിക്ക് രണ്ട് ദിവസമായി പനി ഉണ്ട്' },
    { label: 'Kannada: ಜ್ವರ', text: 'ನನಗೆ ಎರಡು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ' },
    { label: 'English: Fever', text: 'My mother has been feeling dizzy since morning' }
  ];

  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Telephone Voice Simulation</h1>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300 uppercase">
                Architecture Demo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrating natural multilingual conversation over a future Toll-Free audio stream
            </p>
          </div>
          <DemoDataBadge />
        </div>

        {/* Technical Architecture Clarification Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md text-xs space-y-2 border border-slate-800">
          <div className="flex items-center gap-2 text-teal-400 font-bold">
            <Radio size={16} />
            <span>Shared Healthcare Conversation Engine Architecture</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Medora is architected so the exact same natural-language conversation engine powers both the <strong>browser microphone</strong> and a future <strong>1800-XXX-XXXX Toll-Free telephone line</strong>.
          </p>
          <div className="pt-1 text-[11px] text-amber-300 font-medium">
            ⚠️ <strong>Notice:</strong> This is a simulation using local speech synthesis and Web Speech APIs. No actual telecom cellular calls are placed.
          </div>
        </div>

        {/* Telephony Simulator Phone Interface */}
        <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-2xl border border-slate-800 max-w-md mx-auto">
          {/* Top phone indicator */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${callStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="font-bold text-slate-300">
                {callStatus === 'connected' ? 'TOLL-FREE CALL ACTIVE (1800-MEDORA)' : 'LINE IDLE'}
              </span>
            </div>
            <span className="text-[10px] text-teal-400 font-mono">CODEC: G.711 / LOCAL</span>
          </div>

          {/* Transcript Screen */}
          <div className="bg-black rounded-2xl p-3.5 h-56 overflow-y-auto space-y-2 font-mono text-xs border border-slate-800/80 mb-4 scrollbar-thin">
            {telephonyLogs.map((log, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl text-xs ${
                  log.sender === 'user'
                    ? 'bg-teal-950/80 text-teal-200 border border-teal-800/60 ml-4'
                    : log.sender === 'medora'
                    ? 'bg-slate-900 text-slate-100 border border-slate-700/60 mr-4'
                    : 'text-slate-500 text-[10px] italic text-center'
                }`}
              >
                {log.sender === 'user' && <div className="text-[9px] text-teal-400 font-bold mb-0.5">Caller:</div>}
                {log.sender === 'medora' && (
                  <div className="text-[9px] text-teal-300 font-bold mb-0.5">
                    Medora ({LANGUAGE_METADATA[log.lang || 'en-IN']?.nativeName}):
                  </div>
                )}
                <p className="whitespace-pre-wrap">{log.text}</p>
              </div>
            ))}

            {callStatus === 'idle' && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-8">
                <Phone size={28} className="mb-2 opacity-40 text-teal-400" />
                <p className="text-xs font-bold text-slate-400">Medora Rural Helpline Simulator</p>
                <p className="text-[10px] text-slate-600 mt-1">Tap "Start Call" to simulate dialing toll-free</p>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="space-y-3">
            {callStatus !== 'connected' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">ENTER PHONE OR TOLL-FREE NUMBER</label>
                  <input
                    type="text"
                    value={tollFreeNumber}
                    onChange={(e) => setTollFreeNumber(e.target.value)}
                    placeholder="e.g. 1800-123-4567 or +91 9876543210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                  {phoneError && <p className="text-red-400 text-xs mt-1.5">{phoneError}</p>}
                </div>
                <button
                  onClick={handleStartCall}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 active:scale-95 transition-all"
                >
                  <Phone size={18} />
                  <span>START SIMULATED CALL</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {isSpeaking && (
                  <button
                    onClick={() => speechSynthesisService.stop()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <StopCircle size={16} />
                    <span>STOP SPEAKING</span>
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={isListening ? handleStopMic : handleStartMic}
                    className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-teal-600 hover:bg-teal-500 text-white shadow-md'
                    }`}
                  >
                    <Mic size={16} />
                    <span>{isListening ? 'Listening...' : 'Speak to Call'}</span>
                  </button>

                  <button
                    onClick={handleEndCall}
                    className="bg-red-700 hover:bg-red-600 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PhoneOff size={16} />
                    <span>End Call</span>
                  </button>
                </div>

                {/* Sample Prompt Buttons for Testing Telephony in All 5 Languages */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold mb-1.5 text-center">
                    Tap to speak a sample phrase:
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {SAMPLE_QUERIES.map((sq, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendSpokenUtterance(sq.text)}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 truncate"
                      >
                        🗣️ {sq.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { SupportedLanguageCode, LANGUAGE_METADATA } from '../data/languages';
import { speechRecognitionService } from '../services/voice/speechRecognitionService';
import { speechSynthesisService } from '../services/voice/speechSynthesisService';
import { activeTelephonyProvider } from '../services/telephony/telephonyProvider';
import { Phone, PhoneOff, Mic, StopCircle, Radio, PhoneCall, Building2, User, Ambulance, ShieldAlert } from 'lucide-react';

export default function IvrPage() {
  const { t } = useTranslation();
  const [selectedMode, setSelectedMode] = useState<'MODE_A' | 'MODE_B'>('MODE_A');

  // Mode B: Toll-Free AI Simulation State
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [telephonyLogs, setTelephonyLogs] = useState<Array<{ sender: 'user' | 'medora' | 'system'; text: string; lang?: SupportedLanguageCode }>>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [activeLang, setActiveLang] = useState<SupportedLanguageCode>('en-IN');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  // Mode A: Saved Contacts for real device dialing
  const SAVED_CONTACTS = [
    {
      name: 'Rampur PHC Emergency Duty Desk',
      role: 'Healthcare Center',
      phone: '+918232241108',
      displayPhone: '+91 82322 41108',
      icon: Building2,
      color: 'text-teal-400 bg-teal-950/60 border-teal-800'
    },
    {
      name: 'Dr. Arjun Mehta (Primary Care)',
      role: 'Village Doctor',
      phone: '+919800001111',
      displayPhone: '+91 98000 01111',
      icon: User,
      color: 'text-blue-400 bg-blue-950/60 border-blue-800'
    },
    {
      name: 'Sister Lakshmi Devi (ASHA #4402)',
      role: 'Community Health Worker',
      phone: '+919448100223',
      displayPhone: '+91 94481 00223',
      icon: User,
      color: 'text-purple-400 bg-purple-950/60 border-purple-800'
    },
    {
      name: 'Rural 108 Emergency Ambulance',
      role: 'Govt Emergency Service',
      phone: '108',
      displayPhone: '108',
      icon: Ambulance,
      color: 'text-red-400 bg-red-950/60 border-red-800'
    },
    {
      name: 'Janani Shishu (Maternal) Transport',
      role: 'Maternal 102 Helpline',
      phone: '102',
      displayPhone: '102',
      icon: ShieldAlert,
      color: 'text-amber-400 bg-amber-950/60 border-amber-800'
    }
  ];

  const handleStartCall = async () => {
    const session = await activeTelephonyProvider.startCall('1800-MEDORA-DEMO');
    setActiveCallId(session.callId);
    setCallStatus('connected');

    const greeting = 'Welcome to Medora Health Helpline demo. Speak naturally in Tamil, Telugu, Hindi, Malayalam, Kannada or English.';
    setTelephonyLogs([
      { sender: 'system', text: 'AI Telephone Service – Demo initialized' },
      { sender: 'system', text: session.providerNotice },
      { sender: 'medora', text: greeting, lang: 'en-IN' }
    ]);

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
    if (activeCallId) {
      await activeTelephonyProvider.endCall(activeCallId);
    }
    setCallStatus('idle');
    setIsListening(false);
    setIsSpeaking(false);
    setTelephonyLogs((prev) => [...prev, { sender: 'system', text: 'Call simulation ended.' }]);
  };

  const handleSendSpokenUtterance = async (spokenText: string) => {
    if (!spokenText.trim() || callStatus !== 'connected' || !activeCallId) return;

    setCurrentInput('');
    setTelephonyLogs((prev) => [...prev, { sender: 'user', text: spokenText }]);

    try {
      const result = await activeTelephonyProvider.receiveSpeech(activeCallId, spokenText);
      setActiveLang(result.language);

      setTelephonyLogs((prev) => [
        ...prev,
        { sender: 'medora', text: result.responseText, lang: result.language }
      ]);

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
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false)
    });
    if (!ok) setIsListening(false);
  };

  const SAMPLE_QUERIES = [
    { label: 'Tamil: காய்ச்சல்', text: 'எனக்கு இரண்டு நாட்களாக காய்ச்சல் இருக்கிறது' },
    { label: 'Telugu: జ్వరం', text: 'నాకు నా బిడ్డకు జ్వరం ఉంది' },
    { label: 'Hindi: बुखार', text: 'मुझे दो दिन से बुखार और सिरदर्द है' },
    { label: 'Malayalam: പനി', text: 'എനിക്ക് രണ്ട് ദിവസമായി പനി ഉണ്ട്' },
    { label: 'Kannada: ಜ್ವರ', text: 'ನನಗೆ ಎರಡು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ' },
    { label: 'English: Fever', text: 'I have had a high fever since yesterday' }
  ];

  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-100">Telephony & Calling Services</h1>
              <span className="text-[10px] bg-teal-900/60 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-700 uppercase">
                Offline Capable
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Call saved village health numbers or experience the AI toll-free voice assistant
            </p>
          </div>
          <DemoDataBadge />
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setSelectedMode('MODE_A')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              selectedMode === 'MODE_A'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall size={14} />
            <span>MODE A: Call Saved Numbers (tel:)</span>
          </button>
          <button
            onClick={() => setSelectedMode('MODE_B')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              selectedMode === 'MODE_B'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio size={14} />
            <span>MODE B: AI Toll-Free (Demo)</span>
          </button>
        </div>

        {/* MODE A: CALL REAL SAVED NUMBERS */}
        {selectedMode === 'MODE_A' && (
          <div className="space-y-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-teal-400 mb-1">Direct Cellular Dialer Integration:</p>
              Tapping any contact below opens your device's native phone dialer with the verified phone number. Standard web <code className="text-teal-300">tel:</code> URI protocols are used.
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {SAVED_CONTACTS.map((contact, idx) => {
                const IconComponent = contact.icon;
                return (
                  <div
                    key={idx}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${contact.color}`}>
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100">{contact.name}</div>
                        <div className="text-[11px] text-slate-400">{contact.role} • {contact.displayPhone}</div>
                      </div>
                    </div>

                    <a
                      href={`tel:${contact.phone}`}
                      className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <PhoneCall size={13} />
                      <span>Call Now</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE B: AI TELEPHONE SERVICE - DEMO */}
        {selectedMode === 'MODE_B' && (
          <div className="space-y-4">
            {/* Notice Banner */}
            <div className="bg-[#0B2424] border border-[#14B8A6]/40 text-[#CBD5E1] rounded-2xl p-3.5 text-xs space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-teal-300 font-bold">
                <Radio size={15} />
                <span>AI Telephone Service – Demo</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Real toll-free calling requires a connected telecom/voice provider. This simulation demonstrates how our local offline natural language clinical guidance operates over voice telephony.
              </p>
            </div>

            {/* Simulated Phone Terminal */}
            <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-2xl border border-slate-800 max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${callStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="font-bold text-slate-300">
                    {callStatus === 'connected' ? 'DEMO CALL SIMULATION ACTIVE' : 'LINE IDLE (OFFLINE DEMO)'}
                  </span>
                </div>
                <span className="text-[10px] text-teal-400 font-mono">1800-MEDORA</span>
              </div>

              {/* Terminal Logs */}
              <div className="bg-black rounded-2xl p-3.5 h-52 overflow-y-auto space-y-2 font-mono text-xs border border-slate-800 mb-4 scrollbar-thin">
                {telephonyLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-xl text-xs ${
                      log.sender === 'user'
                        ? 'bg-teal-950/80 text-teal-200 border border-teal-800 ml-4'
                        : log.sender === 'medora'
                        ? 'bg-slate-900 text-slate-100 border border-slate-700 mr-4'
                        : 'text-slate-400 text-[10px] italic text-center'
                    }`}
                  >
                    {log.sender === 'user' && <div className="text-[9px] text-teal-400 font-bold mb-0.5">Caller:</div>}
                    {log.sender === 'medora' && (
                      <div className="text-[9px] text-teal-300 font-bold mb-0.5">
                        Medora ({LANGUAGE_METADATA[log.lang || 'en-IN']?.nativeName || 'Voice'}):
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{log.text}</p>
                  </div>
                ))}

                {callStatus === 'idle' && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-6">
                    <Phone size={28} className="mb-2 opacity-40 text-teal-400" />
                    <p className="text-xs font-bold text-slate-400">AI Telephone Service – Demo</p>
                    <p className="text-[10px] text-slate-500 mt-1">Tap below to test local speech interaction</p>
                  </div>
                )}
              </div>

              {/* Call Controls */}
              {callStatus !== 'connected' ? (
                <button
                  onClick={handleStartCall}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 active:scale-95 transition-all"
                >
                  <Phone size={16} />
                  <span>START DEMO CALL (1800-MEDORA)</span>
                </button>
              ) : (
                <div className="space-y-2">
                  {isSpeaking && (
                    <button
                      onClick={() => speechSynthesisService.stop()}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <StopCircle size={15} />
                      <span>Stop Speaking</span>
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={isListening ? () => speechRecognitionService.stopListening() : handleStartMic}
                      className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-teal-600 hover:bg-teal-500 text-white shadow-md'
                      }`}
                    >
                      <Mic size={15} />
                      <span>{isListening ? 'Listening...' : 'Speak Question'}</span>
                    </button>

                    <button
                      onClick={handleEndCall}
                      className="bg-red-700 hover:bg-red-600 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <PhoneOff size={15} />
                      <span>End</span>
                    </button>
                  </div>

                  {/* Sample Query Buttons */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold mb-1 text-center">
                      Quick phrases (all 6 languages):
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      {SAMPLE_QUERIES.map((sq, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendSpokenUtterance(sq.text)}
                          className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left truncate"
                        >
                          {sq.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

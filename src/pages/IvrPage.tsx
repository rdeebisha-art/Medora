import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { SupportedLanguageCode, LANGUAGE_METADATA } from '../data/languages';
import { speechRecognitionService } from '../services/voice/speechRecognitionService';
import { speechSynthesisService } from '../services/voice/speechSynthesisService';
import { activeTelephonyProvider } from '../services/telephony/telephonyProvider';
import { initiatePhoneCall } from '../services/telephony/phoneCallHelper';
import { 
  Phone, PhoneOff, Mic, StopCircle, Radio, PhoneCall, Building2, 
  User, Ambulance, ShieldAlert, AlertTriangle, ArrowRight, Server, Cpu, Volume2 
} from 'lucide-react';

export default function IvrPage() {
  const { t } = useTranslation();
  const [selectedMode, setSelectedMode] = useState<'MODE_A' | 'MODE_B' | 'MODE_C'>('MODE_B');

  // Mode B: Toll-Free AI Simulation State
  const [callStatus, setCallStatus] = useState<'idle' | 'connected' | 'ended'>('idle');
  const [telephonyLogs, setTelephonyLogs] = useState<Array<{ sender: 'user' | 'medora' | 'system'; text: string; lang?: SupportedLanguageCode }>>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [activeLang, setActiveLang] = useState<SupportedLanguageCode>('en-IN');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [phoneNotice, setPhoneNotice] = useState<string | null>(null);

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
      name: 'Dr. Arun Kumar (General Physician)',
      role: 'Village Primary Doctor',
      phone: '+919800001001',
      displayPhone: '+91 98000 01001',
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
      name: 'Janani Shishu (Maternal 102) Transport',
      role: 'Maternal 102 Helpline',
      phone: '102',
      displayPhone: '102',
      icon: ShieldAlert,
      color: 'text-amber-400 bg-amber-950/60 border-amber-800'
    }
  ];

  const handleDialContact = (phone: string, name: string) => {
    const res = initiatePhoneCall(phone, name);
    setPhoneNotice(res.message);
    setTimeout(() => setPhoneNotice(null), 5000);
  };

  const handleStartCall = async () => {
    const session = await activeTelephonyProvider.startCall('SIMULATION-1800-MEDORA');
    setActiveCallId(session.callId);
    setCallStatus('connected');

    const greeting = 'Welcome to Medora Telephone Simulation. Speak or type your symptoms naturally in Tamil, Telugu, Hindi, Malayalam, Kannada or English.';
    setTelephonyLogs([
      { sender: 'system', text: 'DEMO / SIMULATION: This is a local browser simulation and is not a real telephone call.' },
      { sender: 'system', text: 'SIMULATION CONNECTED: Offline clinical language engine initialized.' },
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
    setTelephonyLogs((prev) => [...prev, { sender: 'system', text: 'Simulation ended.' }]);
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
      setTelephonyLogs((prev) => [...prev, { sender: 'system', text: 'Simulation Notice: ' + e?.message }]);
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
              <h1 className="text-xl font-black text-slate-100">Telephony & Voice Simulation</h1>
              <span className="text-[10px] bg-teal-900/60 text-teal-300 font-bold px-2 py-0.5 rounded-full border border-teal-700 uppercase">
                Offline Capable
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Call saved village health numbers via device dialer or run local voice simulation
            </p>
          </div>
          <DemoDataBadge />
        </div>

        {/* Notice Banner */}
        {phoneNotice && (
          <div className="bg-[#EFF6FF] border border-[#2563EB]/40 text-[#1E40AF] px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-md">
            <span>{phoneNotice}</span>
            <button onClick={() => setPhoneNotice(null)} className="font-bold ml-2">✕</button>
          </div>
        )}

        {/* Mode Selector Tabs (3 Modes) */}
        <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 gap-1 text-xs">
          <button
            onClick={() => setSelectedMode('MODE_B')}
            className={`flex-1 py-2 px-2 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedMode === 'MODE_B'
                ? 'bg-[#0F766E] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio size={14} />
            <span className="truncate">Simulation</span>
          </button>
          <button
            onClick={() => setSelectedMode('MODE_A')}
            className={`flex-1 py-2 px-2 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedMode === 'MODE_A'
                ? 'bg-[#0F766E] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PhoneCall size={14} />
            <span className="truncate">Call (tel:)</span>
          </button>
          <button
            onClick={() => setSelectedMode('MODE_C')}
            className={`flex-1 py-2 px-2 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedMode === 'MODE_C'
                ? 'bg-[#0F766E] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server size={14} />
            <span className="truncate">Future Toll-Free</span>
          </button>
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* MODE B: MEDORA TELEPHONE SIMULATION                          */}
        {/* ──────────────────────────────────────────────────────────── */}
        {selectedMode === 'MODE_B' && (
          <div className="space-y-4">
            {/* Prominent Mandatory Disclaimer */}
            <div className="bg-[#FFFBEB] border-2 border-[#D97706]/40 text-[#92400E] rounded-2xl p-4 text-xs space-y-1 shadow-md">
              <div className="flex items-center gap-2 font-black text-sm text-[#B45309]">
                <AlertTriangle size={16} />
                <span>DEMO / SIMULATION NOTICE</span>
              </div>
              <p className="font-semibold leading-relaxed">
                This is a local browser simulation and is not a real telephone call. A web browser cannot create a genuine toll-free telephone service on its own.
              </p>
              <p className="text-[11px] text-[#A16207]">
                Natural conversation pipeline: Speak/Type → Language Detection → Health Intent → Red-Flag Emergency Check → Local Medical Knowledge → Medical Safety Rules → Response in SAME Language → Browser TTS.
              </p>
            </div>

            {/* Simulated Phone Terminal */}
            <div className="bg-slate-950/95 text-white rounded-3xl p-5 shadow-2xl border border-slate-800 max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${callStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="font-extrabold text-slate-200">
                    {callStatus === 'connected' ? 'MEDORA TELEPHONE SIMULATION' : 'SIMULATION IDLE'}
                  </span>
                </div>
                <span className="text-[10px] text-teal-400 font-mono font-bold">
                  {callStatus === 'connected' ? 'SIMULATION CONNECTED' : 'READY'}
                </span>
              </div>

              {/* Language Indicator */}
              <div className="flex items-center justify-between px-2 py-1 mb-2 bg-slate-900 rounded-lg text-[11px] text-slate-400">
                <span>Active Language:</span>
                <span className="font-bold text-teal-300">
                  {LANGUAGE_METADATA[activeLang]?.nativeName || 'English'} ({activeLang})
                </span>
              </div>

              {/* Terminal Logs */}
              <div className="bg-black/90 rounded-2xl p-3.5 h-56 overflow-y-auto space-y-2 font-mono text-xs border border-slate-800 mb-4 scrollbar-thin">
                {telephonyLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl text-xs ${
                      log.sender === 'user'
                        ? 'bg-teal-950/90 text-teal-200 border border-teal-800 ml-4'
                        : log.sender === 'medora'
                        ? 'bg-slate-900 text-slate-100 border border-slate-700 mr-4'
                        : 'text-amber-300/80 text-[10px] italic text-center bg-slate-950/50 py-1'
                    }`}
                  >
                    {log.sender === 'user' && <div className="text-[9px] text-teal-400 font-bold mb-0.5">Caller (Spoken/Typed):</div>}
                    {log.sender === 'medora' && (
                      <div className="text-[9px] text-teal-300 font-bold mb-0.5">
                        Medora Response ({LANGUAGE_METADATA[log.lang || 'en-IN']?.nativeName || 'Voice'}):
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{log.text}</p>
                  </div>
                ))}

                {callStatus === 'idle' && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-6">
                    <Phone size={32} className="mb-2 opacity-40 text-teal-400" />
                    <p className="text-xs font-bold text-slate-300">Medora Telephone Simulation</p>
                    <p className="text-[10px] text-slate-400 mt-1">Tap below to test offline voice & text conversation</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              {callStatus !== 'connected' ? (
                <button
                  onClick={handleStartCall}
                  className="w-full bg-[#0F766E] hover:bg-teal-700 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-950/40 active:scale-95 transition-all"
                >
                  <Phone size={16} />
                  <span>START TELEPHONE SIMULATION</span>
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Speak / Stop buttons */}
                  {isSpeaking && (
                    <button
                      onClick={() => speechSynthesisService.stop()}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <StopCircle size={15} />
                      <span>Stop Voice Speaking</span>
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={isListening ? () => speechRecognitionService.stopListening() : handleStartMic}
                      className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-[#0F766E] hover:bg-teal-700 text-white shadow-md'
                      }`}
                    >
                      <Mic size={15} />
                      <span>{isListening ? 'Listening...' : 'Speak Question'}</span>
                    </button>

                    <button
                      onClick={handleEndCall}
                      className="bg-red-800 hover:bg-red-700 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <PhoneOff size={15} />
                      <span>End</span>
                    </button>
                  </div>

                  {/* Typed Input for testing when mic is unavailable */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && currentInput.trim()) {
                          handleSendSpokenUtterance(currentInput);
                        }
                      }}
                      placeholder="Or type symptom naturally in any of the 6 languages..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      onClick={() => {
                        if (currentInput.trim()) handleSendSpokenUtterance(currentInput);
                      }}
                      className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-2 rounded-xl text-xs font-bold"
                    >
                      Send
                    </button>
                  </div>

                  {/* Sample Query Buttons in All 6 Languages */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold mb-1.5 text-center">
                      Quick test in supported languages (Same-Language Response):
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

        {/* ──────────────────────────────────────────────────────────── */}
        {/* MODE A: CALL REAL SAVED NUMBERS (tel: URL protocol)          */}
        {/* ──────────────────────────────────────────────────────────── */}
        {selectedMode === 'MODE_A' && (
          <div className="space-y-3">
            <div className="bg-white/90 backdrop-blur-xs border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed shadow-sm">
              <p className="font-bold text-[#0F766E] mb-1">Direct Cellular Phone Calling (tel: URI):</p>
              Tapping CALL attempts to open your device's native telephone dialer app. On desktop devices without telephony capability, a copy notice is displayed. No false "Call Connected" status is shown.
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {SAVED_CONTACTS.map((contact, idx) => {
                const IconComponent = contact.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white/90 backdrop-blur-xs border border-slate-200 hover:border-teal-300 rounded-2xl p-3.5 flex items-center justify-between transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${contact.color}`}>
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#0F172A]">{contact.name}</div>
                        <div className="text-[11px] text-[#475569]">{contact.role} • {contact.displayPhone}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDialContact(contact.phone, contact.name)}
                      className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <PhoneCall size={13} />
                      <span>Call (tel:)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* MODE C: FUTURE REAL TOLL-FREE TELEPHONE INTEGRATION          */}
        {/* ──────────────────────────────────────────────────────────── */}
        {selectedMode === 'MODE_C' && (
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-xs border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#2563EB]/20 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                  📡
                </span>
                <div>
                  <h3 className="text-base font-black text-[#0F172A]">Future Real Toll-Free Integration</h3>
                  <p className="text-[11px] text-[#64748B]">Architectural Blueprint for Telco Integration</p>
                </div>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed">
                A web browser application cannot directly terminate PSTN phone calls. To connect real caller mobile phones to Medora, the following telecom integration pipeline is documented:
              </p>

              {/* Architecture Diagram Steps */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 text-xs font-mono">
                {[
                  { step: '1', title: 'Real Phone (PSTN/GSM)', desc: 'Rural user dials 1800-XXX-XXXX from simple basic keypad phone' },
                  { step: '2', title: 'Telecom Carrier (BSNL / Airtel / Jio)', desc: 'Routes call to national toll-free trunk line' },
                  { step: '3', title: 'Voice / SIP Gateway', desc: 'Converts analog/VoIP voice stream into real-time audio packets' },
                  { step: '4', title: 'Secure Medora Backend', desc: 'Authenticates caller number against village patient records' },
                  { step: '5', title: 'Medora Multilingual Engine', desc: 'Detects Tamil / Telugu / Malayalam / Kannada / Hindi / English' },
                  { step: '6', title: 'Medical Intent & Emergency Check', desc: 'Identifies symptoms, checks red flags, filters routine vs critical' },
                  { step: '7', title: 'Medical Safety Engine', desc: 'Enforces evidence guidelines, source-tracking, no dosage fabrication' },
                  { step: '8', title: 'Text-to-Speech (TTS) Voice', desc: 'Generates natural speech stream in caller’s own language' },
                  { step: '9', title: 'Caller Receives Guidance', desc: 'Patient hears clear healthcare instructions on their mobile telephone' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 py-1 border-b border-slate-800 last:border-none">
                    <span className="w-5 h-5 rounded-full bg-teal-800 text-teal-200 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <span className="font-bold text-teal-300 block">{item.title}</span>
                      <span className="text-[11px] text-slate-400">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] rounded-2xl text-[11px] leading-relaxed">
                ✓ <strong>Code Reusability:</strong> The existing Medora local multilingual engine, medical intent classifier, and medical safety engine are completely decoupled and ready to serve as the backend intelligence for a future telephony adapter.
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

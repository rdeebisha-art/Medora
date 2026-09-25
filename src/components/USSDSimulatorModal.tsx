import React, { useState, useEffect, useRef } from 'react';
import { X, Hash, Smartphone, Send, RotateCcw, AlertTriangle, Sparkles, PhoneCall, HeartPulse, Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { conversationEngine } from '../services/voice/conversationEngine';

interface USSDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BCP47_MAP: Record<string, string> = {
  ta: 'ta-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  en: 'en-IN',
};

const LANG_NAMES: Record<string, string> = {
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  hi: 'हिन्दी (Hindi)',
  kn: 'ಕನ್ನಡ (Kannada)',
  ml: 'മലയാളം (Malayalam)',
  en: 'English',
};

export const USSDSimulatorModal: React.FC<USSDModalProps> = ({ isOpen, onClose }) => {
  const { appLanguage, language, currentUser, startDirectCall } = useAppStore();
  const currentLang = appLanguage || language || 'en';

  const [sessionId] = useState(() => `ussd_modal_${Date.now()}`);
  const [screenText, setScreenText] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<'menu' | 'ai_prompt' | 'ai_response' | 'info'>('menu');
  const [lastAiReply, setLastAiReply] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  const getMenuText = () => {
    switch (currentLang) {
      case 'ta':
        return `மெடோரா USSD (*123#) - AI மருத்துவ வழிகாட்டி
=========================
1. எனது உடல்நலம் (My Health Record)
2. குடும்ப நலன் (Family Health)
3. மருந்துகள் (Medicines)
4. அவசர உதவி (Emergency 108 Direct Call)
5. மருத்துவமனை (Nearest Clinic Web Call)
6. அரசு நலத்திட்டங்கள் (Gov Schemes)
7. 🤖 மெடோரா AI (Symptoms, Diagnosis, Remedies & Cure)
0. வெளியேறு (Exit)

விருப்ப எண் அல்லது உங்கள் அறிகுறிகளை உள்ளிடவும்:`;
      case 'te':
        return `మెడోరా USSD (*123#) - AI హెల్త్ గైడ్
=========================
1. నా ఆరోగ్యం (My Health Record)
2. కుటుంబ ఆరోగ్యం (Family Health)
3. మందులు (Medicines)
4. అత్యవసరం (Emergency 108 Direct Call)
5. ఆసుపత్రి (Nearest Clinic Web Call)
6. ప్రభుత్వ పథకాలు (Gov Schemes)
7. 🤖 మెడోరా AI (Symptoms, Diagnosis, Remedies & Cure)
0. నిష్క్రమణ (Exit)

ఎంపిక లేదా మీ లక్షణాలను టైప్ చేయండి:`;
      case 'hi':
        return `मेडोरा USSD (*123#) - AI स्वास्थ्य गाइड
=========================
1. मेरा स्वास्थ्य (My Health Record)
2. पारिवारिक स्वास्थ्य (Family Health)
3. मेरी दवाइयाँ (Medicines)
4. 108 आपातकालीन सेवा (Emergency Direct Web Call)
5. नजदीकी अस्पताल (Nearest Hospital Web Call)
6. सरकारी योजनाएं (Gov Schemes)
7. 🤖 मेडोरा AI (लक्षण, बीमारी, उपचार व इलाज)
0. बाहर निकलें (Exit)

विकल्प चुनें या अपने लक्षण यहाँ टाइप करें:`;
      default:
        return `MEDORA USSD (*123#) - AI CLINICAL GUIDE
=========================
1. My Health Summary
2. Family Health Profile
3. Active Medicines
4. Emergency 108 (Direct In-App Web Call)
5. Nearest Hospital / PHC (Web Call)
6. Government Schemes
7. 🤖 Ask Medora AI (Symptoms, Diagnosis, Remedies & Cure)
0. Exit / Close

Enter option number OR type symptoms:`;
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    setIsSpeaking(false);
  };

  const speakText = async (textToSpeak: string) => {
    if (!textToSpeak) return;
    const targetBcp = BCP47_MAP[currentLang] || 'en-IN';
    const cleanSpeech = textToSpeak
      .replace(/[*#_=~`]/g, '')
      .replace(/🩺|📋|🌿|💊|🚨|💡|🤖/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    stopSpeaking();
    setIsSpeaking(true);

    // 1. Try server-side Gemini TTS
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanSpeech, language: currentLang }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const binary = atob(data.audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx({ sampleRate: data.sampleRate || 24000 });
            audioContextRef.current = ctx;
            const float32 = new Float32Array(bytes.buffer);
            const buffer = ctx.createBuffer(1, float32.length, data.sampleRate || 24000);
            buffer.getChannelData(0).set(float32);

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.onended = () => setIsSpeaking(false);
            source.start();
            return;
          }
        }
      }
    } catch {}

    // 2. Web Speech API fallback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      utterance.lang = targetBcp;
      utterance.rate = 0.90;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const matched = voices.find(v => v.lang.toLowerCase().startsWith(currentLang));
      if (matched) utterance.voice = matched;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScreenText(getMenuText());
      setActiveStep('menu');
      setInputVal('');
      setLastAiReply('');
      stopSpeaking();
    } else {
      stopSpeaking();
    }
  }, [isOpen, currentLang]);

  if (!isOpen) return null;

  const handleAskAI = async (queryText: string) => {
    setIsLoading(true);
    try {
      let reply = '';
      let isEmergency = false;

      // Online server-side call
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: queryText }],
            role: 'ussd_guide',
            language: currentLang,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply;
          if (queryText.toLowerCase().includes('emergency') || queryText.toLowerCase().includes('chest') || queryText.toLowerCase().includes('breath')) {
            isEmergency = true;
          }
        }
      } catch {}

      if (!reply) {
        const fallback = await conversationEngine.processUssdTurn(
          queryText,
          currentLang as any,
          sessionId,
          currentUser?.id
        );
        reply = fallback.responseText;
        isEmergency = fallback.isEmergency;
      }

      setLastAiReply(reply);
      setActiveStep('ai_response');
      const banner = isEmergency ? '🚨 EMERGENCY RED FLAG DETECTED\n\n' : '💡 MEDORA AI CLINICAL EVALUATION:\n\n';
      setScreenText(
        `MEDORA HEALTH GUIDE (*123#)\n\nSymptoms: "${queryText}"\n\n${banner}${reply}\n\n=========================\n1. Call Emergency 108 (Direct Web Call)\n2. Ask Another Symptom\n0. Main Menu`
      );

      // Speak in user's language automatically
      speakText(reply);
    } catch {
      setScreenText('Could not evaluate symptoms. Please visit the nearest Primary Health Centre immediately.\n\nPress 0 for Main Menu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    const raw = inputVal.trim();
    if (!raw) return;
    setInputVal('');

    // Handle AI response navigation
    if (activeStep === 'ai_response') {
      if (raw === '1') {
        stopSpeaking();
        onClose();
        startDirectCall({
          name: '108 Rural Emergency Ambulance',
          phone: '108',
          category: 'AMBULANCE',
          location: 'Tamil Nadu Rural Emergency Medical Services (24x7)',
        });
        return;
      }
      if (raw === '2') {
        stopSpeaking();
        setActiveStep('ai_prompt');
        setScreenText('ASK MEDORA AI (USSD)\n\nType your symptoms below (AI will evaluate symptoms, probable diagnosis, home remedies, and cure in your language):');
        return;
      }
      // Return to main menu
      stopSpeaking();
      setActiveStep('menu');
      setScreenText(getMenuText());
      return;
    }

    if (activeStep === 'ai_prompt') {
      await handleAskAI(raw);
      return;
    }

    // Main Menu options
    const num = parseInt(raw, 10);
    if (isNaN(num)) {
      // User typed symptoms directly from the main menu!
      await handleAskAI(raw);
      return;
    }

    switch (num) {
      case 1:
        setActiveStep('info');
        setScreenText(`MY HEALTH VITAL RECORD:
- Patient: ${currentUser?.name || 'Primary User'}
- Blood Pressure: 110/72 mmHg (Normal)
- Blood Glucose: 135 mg/dL (Controlled)
- Blood Group: O+
- Hemoglobin: 11.2 g/dL
- Status: Stable

Press 0 to return to Menu.`);
        break;

      case 2:
        setActiveStep('info');
        setScreenText(`FAMILY HEALTH PROFILE:
- Total Family Members: 4
- Maternal Care: Anitha Devi (28w)
- Vaccines: Baby Arjun (Up to date)
- Senior Care: Ramesh (Hypertension check due)

Press 0 to return to Menu.`);
        break;

      case 3:
        setActiveStep('info');
        setScreenText(`ACTIVE MEDICINE SCHEDULE:
- 08:00 AM: Folic Acid 5mg (1 tab)
- 01:00 PM: Calcium 500mg (1 tab)
- 08:00 PM: Ferrous Sulphate 200mg (1 tab)

Take after meals with water.
Press 0 to return to Menu.`);
        break;

      case 4:
        stopSpeaking();
        onClose();
        startDirectCall({
          name: '108 Rural Emergency Ambulance',
          phone: '108',
          category: 'AMBULANCE',
          location: 'Tamil Nadu Rural Emergency Medical Services (24x7)',
        });
        break;

      case 5:
        stopSpeaking();
        onClose();
        startDirectCall({
          name: 'Primary Health Centre (PHC) Casualty',
          phone: '04542-241200',
          category: 'HOSPITAL',
          location: 'Sub-District Hospital Emergency Bay',
        });
        break;

      case 6:
        setActiveStep('info');
        setScreenText(`GOVERNMENT HEALTH SCHEMES:
1. Ayushman Bharat (PM-JAY): Up to ₹5 Lakh/year cashless secondary & tertiary hospital care
2. Janani Suraksha Yojana (JSY): Institutional delivery cash incentive ₹1,400 (Rural)
3. PMMVY: ₹5,000 maternity financial support

Press 0 to return to Menu.`);
        break;

      case 7:
        setActiveStep('ai_prompt');
        setScreenText(`MEDORA AI CLINICAL GUIDE (*123#)
=========================
Please describe your symptoms below:
(e.g., "high fever and headache", "chest pain", "vomiting")

Medora AI will explain:
1. Symptoms Analysis
2. Probable Diagnosis
3. Safe Home Remedies
4. Medical Cure & Doctor Guidance
In ${LANG_NAMES[currentLang] || 'your language'}!`);
        break;

      case 0:
        onClose();
        break;

      default:
        setScreenText(`Invalid option entered. Please choose 1 to 7, or 0 to exit.\n\n${getMenuText()}`);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-4 border-4 border-slate-700 shadow-2xl relative text-white flex flex-col space-y-3">
        {/* Top Phone Chrome */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs">
            <Smartphone size={14} />
            <span>USSD *123#</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-teal-900 text-teal-300 px-2 py-0.5 rounded-full border border-teal-700">
              {LANG_NAMES[currentLang] || currentLang.toUpperCase()}
            </span>
            <button
              onClick={() => { stopSpeaking(); onClose(); }}
              className="text-slate-400 hover:text-white rounded-full p-1 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Feature notice */}
        <div className="bg-teal-950/80 border border-teal-800/80 rounded-xl px-2.5 py-1.5 text-[11px] text-teal-200 flex items-center justify-between">
          <span>🤖 AI Clinical Symptoms, Diagnosis, Remedies & Voice</span>
          {isSpeaking && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 animate-pulse">
              <Volume2 size={12} /> Speaking
            </span>
          )}
        </div>

        {/* LCD Screen Display */}
        <div className="bg-black border-2 border-slate-800 rounded-2xl p-3 min-h-[220px] max-h-[320px] overflow-y-auto font-mono text-emerald-400 text-xs leading-relaxed select-text shadow-inner whitespace-pre-wrap">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-36 gap-2 text-amber-400 animate-pulse">
              <Sparkles size={20} className="animate-spin" />
              <span>Medora AI evaluating clinical guidelines in {LANG_NAMES[currentLang]}...</span>
            </div>
          ) : (
            screenText
          )}
        </div>

        {/* Voice Play/Stop Button if AI replied */}
        {lastAiReply && activeStep === 'ai_response' && (
          <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => isSpeaking ? stopSpeaking() : speakText(lastAiReply)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                isSpeaking ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isSpeaking ? 'Stop Voice' : `🔊 Listen in ${LANG_NAMES[currentLang] || 'Language'}`}</span>
            </button>
            <span className="text-[10px] text-slate-400">
              {isSpeaking ? 'Speaking guidance...' : 'Spoken in ' + currentLang}
            </span>
          </div>
        )}

        {/* USSD Input Form */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={activeStep === 'ai_prompt' ? 'Describe symptoms...' : 'Enter option (1-7, 0)...'}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-all disabled:opacity-50"
          >
            <Send size={13} />
            <span>Send</span>
          </button>
        </div>

        {/* Numeric Keypad Simulation */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
            <button
              key={k}
              onClick={() => setInputVal((prev) => prev + k)}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 py-2 rounded-xl text-xs font-mono font-bold text-slate-200 transition-colors"
            >
              {k}
            </button>
          ))}
        </div>

        {/* Reset / Exit */}
        <div className="flex gap-2 pt-1 border-t border-slate-800">
          <button
            onClick={() => {
              stopSpeaking();
              setActiveStep('menu');
              setScreenText(getMenuText());
              setInputVal('');
            }}
            className="flex-1 bg-slate-800 hover:bg-slate-700 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Main Menu</span>
          </button>
          <button
            onClick={() => { stopSpeaking(); onClose(); }}
            className="flex-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 py-1.5 rounded-xl text-[11px] font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

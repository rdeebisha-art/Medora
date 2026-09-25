import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { useAppStore } from '../store/useAppStore';
import { conversationEngine } from '../services/voice/conversationEngine';
import { Volume2, VolumeX, Sparkles, PhoneCall, Stethoscope, RefreshCw, Send } from 'lucide-react';

interface UssdMenuOption {
  num: number;
  label: string;
  action?: string;
  info?: string;
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

export default function UssdPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appLanguage, language, currentUser, startDirectCall } = useAppStore();
  const currentLang = appLanguage || language || 'en';

  const [mode, setMode] = useState<'menu' | 'ai_input' | 'ai_response' | 'info'>('menu');
  const [input, setInput] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiEmergency, setAiEmergency] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`ussd_${Date.now()}`);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);

  // Multilingual Menu Definitions based on appLanguage
  const getMainMenu = (): UssdMenuOption[] => {
    switch (currentLang) {
      case 'ta':
        return [
          { num: 1, label: '1. எனது உடல்நலம் (My Health)', info: 'எனது உடல்நலம்:\n- இரத்த அழுத்தம்: 110/72 mmHg\n- இரத்த சர்க்கரை: 142 mg/dL\n- நிலை: ரத்த சோகை (கண்காணிப்பில்)' },
          { num: 2, label: '2. குடும்ப நலன் (Family Health)', info: 'குடும்ப நலன்:\n- குடும்ப உறுப்பினர்கள்: 4\n- தாய்மை பராமரிப்பு: அனிதா (28 வாரம்)' },
          { num: 3, label: '3. மருந்துகள் (Medicines)', info: 'மருந்துகள்:\n- ஃபோலிக் அமிலம் 5mg (காலை)\n- இரும்புச் சத்து மாத்திரை 200mg (இரவு)' },
          { num: 4, label: '4. மருத்துவர் நேரடி அழைப்பு (Doctor Web Call)', action: 'call_doctor' },
          { num: 5, label: '5. மருத்துவமனை (Hospital Web Call)', action: 'call_hospital' },
          { num: 6, label: '6. 108 அவசர உதவி (Emergency 108 Direct Call)', action: 'call_108' },
          { num: 7, label: '7. அரசு திட்டங்கள் (Schemes)', info: 'அரசு திட்டங்கள்:\n- ஆயுஷ்மான் பாரத் (PM-JAY)\n- ஜனனி சுரக்ஷா திட்டம் (JSY)' },
          { num: 8, label: '8. 🤖 மெடோரா AI மருத்துவ வழிகாட்டி (AI Symptoms, Diagnosis, Remedies & Cure)', action: 'ai' },
          { num: 0, label: '0. முதன்மை பட்டியல் (Main Menu)', action: 'reset' },
        ];
      case 'te':
        return [
          { num: 1, label: '1. నా ఆరోగ్యం (My Health)', info: 'నా ఆరోగ్యం:\n- రక్తపోటు: 110/72 mmHg\n- బ్లడ్ షుగర్: 142 mg/dL' },
          { num: 2, label: '2. కుటుంబ ఆరోగ్యం (Family Health)', info: 'కుటుంబ ఆరోగ్యం:\n- కుటుంబ సభ్యులు: 4' },
          { num: 3, label: '3. మందులు (Medicines)', info: 'మందులు:\n- ఫోలిక్ యాసిడ్ 5mg (ఉదయం)\n- ఐరన్ మాత్ర 200mg (రాత్రి)' },
          { num: 4, label: '4. డాక్టర్ కాల్ (Doctor Direct Web Call)', action: 'call_doctor' },
          { num: 5, label: '5. ఆసుపత్రి కాల్ (Hospital Web Call)', action: 'call_hospital' },
          { num: 6, label: '6. 108 అత్యవసరం (Emergency 108 Direct Call)', action: 'call_108' },
          { num: 7, label: '7. ప్రభుత్వ పథకాలు (Schemes)', info: 'ప్రభుత్వ పథకాలు:\n- ఆయుష్మాన్ భారత్\n- జననీ సురక్ష యోజన' },
          { num: 8, label: '8. 🤖 మెడోరా AI సలహా (AI Symptoms, Diagnosis, Remedies & Cure)', action: 'ai' },
          { num: 0, label: '0. ప్రధాన మెనూ (Main Menu)', action: 'reset' },
        ];
      case 'hi':
        return [
          { num: 1, label: '1. मेरा स्वास्थ्य (My Health)', info: 'मेरा स्वास्थ्य:\n- रक्तचाप: 110/72 mmHg\n- रक्त शर्करा: 142 mg/dL' },
          { num: 2, label: '2. पारिवारिक स्वास्थ्य (Family Health)', info: 'परिवार स्वास्थ्य:\n- कुल सदस्य: 4' },
          { num: 3, label: '3. दवाइयाँ (Medicines)', info: 'दवाइयाँ:\n- फोलिक एसिड 5mg (सुबह)\n- आयरन 200mg (रात)' },
          { num: 4, label: '4. डॉक्टर से डायरेक्ट बात (Doctor Web Call)', action: 'call_doctor' },
          { num: 5, label: '5. अस्पताल सहायता (Hospital Web Call)', action: 'call_hospital' },
          { num: 6, label: '6. 108 आपातकालीन कॉल (Emergency 108 Direct Call)', action: 'call_108' },
          { num: 7, label: '7. सरकारी योजनाएं (Schemes)', info: 'सरकारी योजनाएं:\n- आयुष्मान भारत (PM-JAY)\n- जननी सुरक्षा योजना' },
          { num: 8, label: '8. 🤖 मेडोरा AI डॉक्टर (AI Symptoms, Diagnosis, Remedies & Cure)', action: 'ai' },
          { num: 0, label: '0. मुख्य मेनू (Main Menu)', action: 'reset' },
        ];
      default:
        return [
          { num: 1, label: '1. My Health Record', info: 'MY HEALTH:\n- Blood Pressure: 110/72 mmHg\n- Blood Sugar: 142 mg/dL\n- Status: Stable (Routine Care)' },
          { num: 2, label: '2. Family Health Profile', info: 'FAMILY HEALTH:\n- Total Members: 4\n- Maternal: Anitha Devi (28w)' },
          { num: 3, label: '3. Active Medicines', info: 'MEDICINES:\n- Folic Acid 5mg (Morning)\n- Ferrous Sulphate 200mg (Night)' },
          { num: 4, label: '4. Call Primary Doctor (In-App Web Line)', action: 'call_doctor' },
          { num: 5, label: '5. Call PHC Hospital (In-App Web Line)', action: 'call_hospital' },
          { num: 6, label: '6. Emergency 108 Ambulance (Direct Web Call)', action: 'call_108' },
          { num: 7, label: '7. Government Schemes (PM-JAY / JSY)', info: 'SCHEMES:\n- Ayushman Bharat (PM-JAY)\n- Janani Suraksha Yojana (JSY)' },
          { num: 8, label: '8. 🤖 Medora AI Health Guide (Symptoms, Diagnosis, Remedies & Cure)', action: 'ai' },
          { num: 0, label: '0. Main Menu', action: 'reset' },
        ];
    }
  };

  const getHeaderTitle = (): string => {
    switch (currentLang) {
      case 'ta': return 'மெடோரா USSD (*123#) - AI மருத்துவ வழிகாட்டி:';
      case 'te': return 'మెడోరా USSD (*123#) - AI హెల్త్ గైడ్:';
      case 'hi': return 'मेडोरा USSD (*123#) - AI स्वास्थ्य गाइड:';
      default: return 'MEDORA USSD (*123#) - AI CLINICAL GUIDE:';
    }
  };

  const getAskAiPrompt = (): string => {
    switch (currentLang) {
      case 'ta': return 'மெடோரா AI மருத்துவ வழிகாட்டி (*123#)\n\nஉங்கள் அறிகுறிகளை உள்ளிடவும் (அறிகுறிகள், சாத்தியமான நோயறிதல், வீட்டு வைத்தியம் மற்றும் சிகிச்சை முறைகளை AI விளக்கும்):\n(உதா: "எனக்கு இரண்டு நாட்களாக கடுமையான காய்ச்சல் மற்றும் வயிற்று வலி இருக்கிறது")';
      case 'te': return 'మెడోరా AI హెల్త్ గైడ్ (*123#)\n\nమీ లక్షణాలను టైప్ చేయండి (లక్షణాలు, రోగ నిర్ధారణ, ఇంటి నివారణలు మరియు చికిత్సను AI వివరిస్తుంది):\n(ఉదా: "నాకు రెండు రోజులుగా జ్వరం మరియు కడుపు నొప్పి ఉంది")';
      case 'hi': return 'मेडोरा AI स्वास्थ्य गाइड (*123#)\n\nअपने लक्षण लिखें (AI लक्षण, संभावित बीमारी, घरेलू उपचार और इलाज बताएगा):\n(उदा: "मुझे दो दिन से तेज बुखार और पेट में दर्द है")';
      default: return 'MEDORA AI CLINICAL GUIDE (*123#)\n\nDescribe your symptoms (Medora AI will explain symptoms, probable diagnosis, home remedies, and medical cure in your language):\n(e.g., "I have high fever, chills, and stomach pain for 2 days")';
    }
  };

  const resetToMenu = () => {
    stopSpeaking();
    const menu = getMainMenu();
    setMode('menu');
    setDisplayText(getHeaderTitle() + '\n\n' + menu.map(m => m.label).join('\n'));
    setInput('');
  };

  useEffect(() => {
    resetToMenu();
  }, [currentLang]);

  // Clean text for speech synthesis (strips symbols and markdown)
  const cleanForSpeech = (rawText: string): string => {
    return rawText
      .replace(/[*#_=~`]/g, '')
      .replace(/🩺|📋|🌿|💊|🚨|💡|🤖/g, '')
      .replace(/\n+/g, '. ')
      .trim();
  };

  // Speak AI response in the user's chosen language
  const speakText = async (textToSpeak: string) => {
    if (!textToSpeak) return;
    const targetBcp = BCP47_MAP[currentLang] || 'en-IN';
    const cleanSpeech = cleanForSpeech(textToSpeak);

    // Stop previous utterance
    stopSpeaking();
    setIsSpeaking(true);
    setActiveSpeechText(textToSpeak);

    // 1. Try server-side Gemini TTS first
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanSpeech, language: currentLang }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          // Play PCM audio or Blob URL
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
            source.onended = () => {
              setIsSpeaking(false);
            };
            source.start();
            return;
          }
        }
      }
    } catch {
      // Fall through to browser SpeechSynthesis
    }

    // 2. Browser SpeechSynthesis fallback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      utterance.lang = targetBcp;
      utterance.rate = 0.90; // Natural pace for healthcare guidance
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const matched = voices.find(v => v.lang.toLowerCase().startsWith(currentLang));
      if (matched) utterance.voice = matched;

      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
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

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');

    if (mode === 'ai_input' || isNaN(parseInt(trimmed))) {
      // Evaluate Symptoms, Diagnosis, Remedies, and Cure with AI
      setLoading(true);
      setMode('ai_response');
      try {
        let responseText = '';
        let isEmergency = false;

        // Try server-side Gemini USSD clinical reasoning first
        try {
          const chatRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: trimmed }],
              role: 'ussd_guide',
              language: currentLang,
            }),
          });
          if (chatRes.ok) {
            const chatData = await chatRes.json();
            responseText = chatData.reply;
            if (trimmed.toLowerCase().includes('emergency') || trimmed.toLowerCase().includes('chest') || trimmed.toLowerCase().includes('breath') || trimmed.toLowerCase().includes('மூச்சு')) {
              isEmergency = true;
            }
          }
        } catch {
          // Offline fallback
        }

        if (!responseText) {
          const result = await conversationEngine.processUssdTurn(
            trimmed,
            currentLang as any,
            sessionId,
            currentUser?.id
          );
          responseText = result.responseText;
          isEmergency = result.isEmergency;
        }

        setAiResponse(responseText);
        setAiEmergency(isEmergency);

        const banner = isEmergency
          ? '🚨 EMERGENCY DETECTED (CALL 108 IMMEDIATELY)\n\n'
          : '💡 MEDORA AI CLINICAL EVALUATION:\n\n';

        setDisplayText(
          `MEDORA AI USSD (*123#)\n\nQuery: "${trimmed}"\n\n${banner}${responseText}\n\n=========================\n1. Call 108 Emergency (Direct Web Call)\n2. Call Primary Doctor (Direct Web Call)\n3. Ask Another Symptom / Disease\n0. Main Menu`
        );

        // Automatically speak the response in the user's language!
        speakText(responseText);
      } catch {
        setDisplayText('Medora could not evaluate these symptoms. If emergency, please call 108 immediately.\n\nPress 0 for Main Menu.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'ai_response') {
      const opt = parseInt(trimmed);
      if (opt === 1) {
        startDirectCall({
          name: '108 Rural Emergency Ambulance',
          phone: '108',
          category: 'AMBULANCE',
          location: '24x7 Rural Trauma Response',
        });
        return;
      }
      if (opt === 2) {
        startDirectCall({
          name: 'Dr. Arjun Mehta (Primary Doctor)',
          phone: '+919800001111',
          category: 'DOCTOR',
          location: 'Rampur Primary Health Centre',
        });
        return;
      }
      if (opt === 3) {
        setMode('ai_input');
        setDisplayText(getAskAiPrompt());
        return;
      }
      resetToMenu();
      return;
    }

    if (mode === 'info') {
      resetToMenu();
      return;
    }

    // Main Menu navigation
    const num = parseInt(trimmed);
    if (num === 0) {
      resetToMenu();
      return;
    }

    const menu = getMainMenu();
    const selected = menu.find(m => m.num === num);

    if (!selected) {
      setDisplayText('Invalid option. Enter 1 to 8, or 0 for Menu.\n\nPress 0 for Main Menu.');
      return;
    }

    if (selected.action === 'ai') {
      setMode('ai_input');
      setDisplayText(getAskAiPrompt());
      return;
    }

    if (selected.action === 'call_108') {
      startDirectCall({
        name: '108 Rural Emergency Ambulance',
        phone: '108',
        category: 'AMBULANCE',
        location: 'Tamil Nadu Rural Emergency Ambulance Hotline',
      });
      return;
    }

    if (selected.action === 'call_doctor') {
      startDirectCall({
        name: 'Dr. Arjun Mehta (General Physician)',
        phone: '+919800001111',
        category: 'DOCTOR',
        location: 'Rampur Primary Health Centre',
      });
      return;
    }

    if (selected.action === 'call_hospital') {
      startDirectCall({
        name: 'Government PHC Hospital Triage Desk',
        phone: '04542-241200',
        category: 'HOSPITAL',
        location: 'Sub-District Hospital Emergency Bay',
      });
      return;
    }

    if (selected.info) {
      setMode('info');
      setDisplayText(`${selected.info}\n\n=========================\nPress 0 for Main Menu.`);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>🔢 USSD Healthcare AI (*123#)</span>
            </h1>
            <p className="text-xs text-slate-500">
              Interactive clinical guidance · Symptoms, Diagnosis, Remedies, Cure & Voice
            </p>
          </div>
          <div className="text-xs font-bold px-3 py-1 bg-teal-100 text-teal-800 rounded-full border border-teal-200">
            Language: {LANG_NAMES[currentLang] || currentLang.toUpperCase()}
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="bg-teal-50 border-2 border-teal-600/30 rounded-2xl p-3.5 text-xs text-teal-950 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-extrabold flex items-center gap-1.5 text-teal-900 text-sm">
              <Sparkles size={16} className="text-teal-700" />
              Medora AI Clinical Knowledge in {LANG_NAMES[currentLang] || 'your language'}:
            </span>
            {isSpeaking && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
                <Volume2 size={12} />
                Speaking Aloud
              </span>
            )}
          </div>
          <p className="text-[11px] text-teal-900 leading-relaxed">
            The AI analyzes <strong>Symptoms</strong>, identifies <strong>Probable Diagnosis</strong>, provides safe <strong>Home Remedies</strong>, and outlines <strong>Cure & Doctor Guidelines</strong> — and speaks it out loud in {LANG_NAMES[currentLang] || 'your language'}!
          </p>
        </div>

        {/* Basic Phone Simulation Frame */}
        <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-md border-4 border-slate-700">
          {/* Top Speaker Bar */}
          <div className="bg-slate-900 py-2.5 flex items-center justify-between px-5 border-b border-slate-800">
            <div className="w-16 h-1.5 bg-slate-700 rounded-full mx-auto" />
            <div className="text-[10px] text-teal-400 font-mono font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              *123# ACTIVE
            </div>
          </div>

          {/* LCD Screen with Green/Amber Telephony Display */}
          <div className="bg-black p-4 min-h-[280px] font-mono text-green-400 text-xs sm:text-sm select-text overflow-y-auto max-h-[380px] border-b-2 border-slate-800">
            <div className="text-[10px] text-green-500/80 border-b border-green-900/60 pb-1.5 mb-2 flex items-center justify-between">
              <span>MEDORA CLINICAL USSD v2.4</span>
              <span className="text-[10px] font-bold text-amber-300">VOICE ACTIVE</span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-amber-300 space-y-2">
                <RefreshCw size={24} className="animate-spin mx-auto text-amber-400" />
                <p className="font-bold">Medora AI is diagnosing symptoms & preparing remedies in {LANG_NAMES[currentLang]}...</p>
              </div>
            ) : (
              <div className="whitespace-pre-line leading-relaxed font-sans sm:font-mono">
                {displayText}
              </div>
            )}
          </div>

          {/* Audio Speech Controls Bar */}
          {aiResponse && (
            <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(aiResponse)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm ${
                    isSpeaking
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isSpeaking ? 'Stop Voice' : `🔊 Listen in ${LANG_NAMES[currentLang] || 'Language'}`}</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {isSpeaking ? 'Playing spoken guidance...' : 'Tap to hear voice'}
              </span>
            </div>
          )}

          {/* Input Box Row */}
          <div className="bg-slate-900 p-3 flex gap-2 items-center border-t border-slate-800">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={mode === 'ai_input' ? 'Describe symptoms...' : 'Enter option (1-8, 0)...'}
              className="flex-1 bg-slate-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 border border-slate-700"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all disabled:opacity-50 flex items-center gap-1"
            >
              <span>SEND</span>
              <Send size={13} />
            </button>
          </div>

          {/* Numeric Telephone Keypad */}
          <div className="p-3 bg-slate-950 grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(k => (
              <button
                key={k}
                onClick={() => setInput(prev => prev + k)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-base sm:text-lg py-2 rounded-xl transition-all shadow-xs font-mono"
              >
                {k}
              </button>
            ))}
          </div>

          {/* Action Keys */}
          <div className="px-3 pb-3 grid grid-cols-2 gap-2 bg-slate-950">
            <button
              onClick={resetToMenu}
              className="bg-rose-800 hover:bg-rose-700 active:scale-95 text-white py-2 rounded-xl text-xs font-bold transition-all"
            >
              MENU / CANCEL (0)
            </button>
            <button
              onClick={() => setInput(prev => prev.slice(0, -1))}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white py-2 rounded-xl text-xs font-bold transition-all"
            >
              ⌫ DELETE
            </button>
          </div>
        </div>

        {/* Quick Symptoms Library: Instant One-Tap Clinical Evaluation */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope size={15} className="text-teal-700" />
              <span>Tap to Test Symptoms & Hear AI Diagnosis in {LANG_NAMES[currentLang]}:</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              {
                en: 'High Fever & Severe Shivering',
                ta: 'கடும் காய்ச்சல் மற்றும் குளிர் நடுக்கம்',
                te: 'తీవ్రమైన జ్వరం మరియు వణుకు',
                hi: 'तेज बुखार और कंपकंपी',
              },
              {
                en: 'Persistent Cough & Chest Pain',
                ta: 'தொடர் இருமல் மற்றும் நெஞ்சு வலி',
                te: 'ఎడతెగని దగ్గు మరియు ఛాతీ నొప్పి',
                hi: 'लगातार खांसी और सीने में दर्द',
              },
              {
                en: 'Child Vomiting & Dehydration',
                ta: 'குழந்தைக்கு வாந்தி மற்றும் நீரிழப்பு',
                te: 'పిల్లలకు వాంతులు మరియు డీహైడ్రేషన్',
                hi: 'बच्चे को उल्टी और दस्त',
              },
              {
                en: 'Maternal Abdominal Cramps (28w)',
                ta: 'கர்ப்பிணி வயிற்று வலி மற்றும் மயக்கம்',
                te: 'గర్భిణీ కడుపు నొప్పి మరియు అలసట',
                hi: 'गर्भावस्था में पेट दर्द और ऐंठन',
              },
            ].map((s, idx) => {
              const query = (s as any)[currentLang] || s.en;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(query);
                    setMode('ai_input');
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-2xl text-left transition-all group flex items-start gap-2 active:scale-95"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">🩺</span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-teal-900 truncate">{query}</div>
                    <div className="text-[10px] text-slate-500">Tap to diagnose & hear cure</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

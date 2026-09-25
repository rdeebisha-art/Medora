import React, { useState, useEffect } from 'react';
import { X, Hash, Smartphone, Send, RotateCcw, AlertTriangle, Sparkles, PhoneCall, HeartPulse } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { conversationEngine } from '../services/voice/conversationEngine';

interface USSDModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const USSDSimulatorModal: React.FC<USSDModalProps> = ({ isOpen, onClose }) => {
  const { appLanguage, currentUser } = useAppStore();
  const [sessionId] = useState(() => `ussd_modal_${Date.now()}`);
  const [screenText, setScreenText] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<'menu' | 'ai_prompt' | 'ai_response' | 'info'>('menu');

  const getMenuText = () => {
    switch (appLanguage) {
      case 'ta':
        return `மெடோரா USSD (*123#)
=========================
1. எனது உடல்நலம் (My Health)
2. குடும்ப நலன் (Family Health)
3. மருந்துகள் (Medicines)
4. அவசர உதவி (Emergency 108)
5. மருத்துவமனை (Nearest Clinic)
6. அரசு நலத்திட்டங்கள் (Gov Schemes)
7. மெடோரா AI வழிகாட்டி (AI Remedies)
0. வெளியேறு (Exit)

விருப்ப எண் அல்லது உங்கள் அறிகுறிகளை உள்ளிடவும்:`;
      case 'te':
        return `మెడోరా USSD (*123#)
=========================
1. నా ఆరోగ్యం (My Health)
2. కుటుంబ ఆరోగ్యం (Family Health)
3. మందులు (Medicines)
4. అత్యవసరం (Emergency 108)
5. ఆసుపత్రి (Nearest Clinic)
6. ప్రభుత్వ పథకాలు (Gov Schemes)
7. మెడోరా AI సలహా (AI Remedies)
0. నిష్క్రమణ (Exit)

ఎంపిక లేదా మీ లక్షణాలను టైప్ చేయండి:`;
      case 'hi':
        return `मेडोरा USSD (*123#)
=========================
1. मेरा स्वास्थ्य (My Health)
2. पारिवारिक स्वास्थ्य (Family Health)
3. मेरी दवाइयाँ (Medicines)
4. आपातकालीन सेवा (Emergency 108)
5. नजदीकी अस्पताल (Nearest Hospital)
6. सरकारी योजनाएं (Gov Schemes)
7. मेडोरा AI उपचार गाइड (AI Remedies)
0. बाहर निकलें (Exit)

विकल्प चुनें या अपने लक्षण यहाँ टाइप करें:`;
      default:
        return `MEDORA USSD (*123#)
=========================
1. My Health Summary
2. Family Health
3. Active Medicines
4. Emergency (Dial 108)
5. Nearest Hospital / PHC
6. Government Schemes
7. Ask Medora AI (Remedies & First Aid)
0. Exit / Close

Enter option number OR type symptoms:`;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScreenText(getMenuText());
      setActiveStep('menu');
      setInputVal('');
      setHistory([]);
    }
  }, [isOpen, appLanguage]);

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
            language: appLanguage,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply;
        }
      } catch {
        // Fall back to offline conversation engine
      }

      if (!reply) {
        const fallback = await conversationEngine.processUssdTurn(
          queryText,
          appLanguage,
          sessionId,
          currentUser?.id
        );
        reply = fallback.responseText;
        isEmergency = fallback.isEmergency;
      }

      setActiveStep('ai_response');
      const banner = isEmergency ? '🚨 EMERGENCY RED FLAG DETECTED\n\n' : '💡 MEDORA AI REMEDIES & FIRST AID:\n\n';
      setScreenText(
        `MEDORA HEALTH GUIDE\n\nSymptom: "${queryText}"\n\n${banner}${reply}\n\n=========================\n1. Call Emergency 108\n2. Ask Another Symptom\n0. Main Menu`
      );
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
        window.location.href = 'tel:108';
        return;
      }
      if (raw === '2') {
        setActiveStep('ai_prompt');
        setScreenText('ASK MEDORA AI (USSD)\n\nType your symptom or question below (e.g. fever, vomiting, stomach pain):');
        return;
      }
      // Return to main menu
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

Press 0 for Main Menu.`);
        break;
      case 2:
        setActiveStep('info');
        setScreenText(`FAMILY HEALTH STATUS:
- Total Registered Members: 4
- Infant Vaccination: BCG, Polio up to date
- Maternal: 2nd Trimester routine visit scheduled
- Elderly: Blood Pressure monitoring active

Press 0 for Main Menu.`);
        break;
      case 3:
        setActiveStep('info');
        setScreenText(`ACTIVE MEDICATIONS:
1. Ferrous Sulphate (Iron) 200mg - 1 tab at night after meal
2. Folic Acid 5mg - 1 tab in morning
3. Paracetamol 500mg - As needed for fever

Press 0 for Main Menu.`);
        break;
      case 4:
        window.location.href = 'tel:108';
        break;
      case 5:
        setActiveStep('info');
        setScreenText(`NEAREST HEALTH CENTRES:
1. Alandur Primary Health Centre (1.8 km) - Ph: 044-22341234
2. Chromepet Government Hospital (4.5 km) - Ph: 044-22415678
3. Apollo Rural Clinic (6.2 km) - 24/7 Ambulance

Press 0 for Main Menu.`);
        break;
      case 6:
        setActiveStep('info');
        setScreenText(`GOVERNMENT HEALTH SCHEMES:
- Ayushman Bharat (PM-JAY): Up to ₹5 Lakh cashless hospital care
- Janani Suraksha Yojana (JSY): Institutional delivery assistance
- Chief Minister Comprehensive Health Insurance Scheme (CMCHIS)

Press 0 for Main Menu.`);
        break;
      case 7:
        setActiveStep('ai_prompt');
        setScreenText('ASK MEDORA AI (USSD)\n\nType your symptom or question below (e.g. "child has fever and diarrhea", "headache for 2 days"):');
        break;
      case 0:
        onClose();
        break;
      default:
        setActiveStep('menu');
        setScreenText(getMenuText());
        break;
    }
  };

  const quickSymptoms = [
    'Fever and chills for 2 days',
    'Baby has acute diarrhea and vomiting',
    'Dry cough with mild chest tightness',
    'Severe throbbing headache with high BP',
    'Acidity and stomach burn remedies',
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-teal-500/40 rounded-3xl max-w-md w-full p-5 shadow-2xl relative text-white flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center border border-teal-500/30">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100">USSD Telecom Gateway</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  *123# ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Offline & Low-Bandwidth AI Health Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Phone Terminal Screen */}
        <div className="bg-[#0c1a16] border-2 border-emerald-500/50 rounded-2xl p-4 shadow-inner relative overflow-hidden font-mono text-emerald-400 min-h-[220px] max-h-[300px] overflow-y-auto">
          <div className="flex items-center justify-between text-[10px] text-emerald-600 border-b border-emerald-900/60 pb-1.5 mb-2">
            <span>NETWORK: BSNL / AIRTEL 2G</span>
            <span>CELL ID: IN-TN-412</span>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-emerald-300">
              <Sparkles className="w-6 h-6 animate-spin text-teal-400" />
              <p className="text-xs font-bold animate-pulse">Medora AI analyzing symptoms & remedies...</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-xs font-mono leading-relaxed select-text">
              {screenText}
            </pre>
          )}
        </div>

        {/* Quick Symptom Chips */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1">
            <HeartPulse className="w-3 h-3 text-teal-400" />
            <span>Quick Symptom Remedies (Tap to Test AI Guidance):</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickSymptoms.map((sym, idx) => (
              <button
                key={idx}
                onClick={() => handleAskAI(sym)}
                className="text-[11px] bg-slate-900 hover:bg-teal-950/80 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-teal-300 px-2.5 py-1 rounded-lg transition-all text-left"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Keypad Form */}
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type option number or describe symptom..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-teal-400 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputVal.trim()}
              className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-teal-900/40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              onClick={() => {
                setActiveStep('menu');
                setScreenText(getMenuText());
                setInputVal('');
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Main Menu (0)
            </button>

            <a
              href="tel:*123%23"
              className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-bold text-[11px]"
            >
              <Smartphone className="w-3 h-3" />
              Dial *123# on Phone
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

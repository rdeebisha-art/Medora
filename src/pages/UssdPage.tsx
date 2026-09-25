import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { useAppStore } from '../store/useAppStore';
import { conversationEngine } from '../services/voice/conversationEngine';

interface UssdMenuOption {
  num: number;
  label: string;
  action?: string;
  info?: string;
}

export default function UssdPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { appLanguage, currentUser } = useAppStore();

  const [mode, setMode] = useState<'menu' | 'ai_input' | 'ai_response' | 'info'>('menu');
  const [input, setInput] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiEmergency, setAiEmergency] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(`ussd_${Date.now()}`);

  // Multilingual Menu Definitions based on appLanguage
  const getMainMenu = (): UssdMenuOption[] => {
    switch (appLanguage) {
      case 'ta':
        return [
          { num: 1, label: '1. எனது உடல்நலம் (My Health)', info: 'எனது உடல்நலம்:\n- இரத்த அழுத்தம்: 110/72 mmHg\n- இரத்த சர்க்கரை: 142 mg/dL\n- நிலை: ரத்த சோகை (கண்காணிப்பில்)' },
          { num: 2, label: '2. குடும்ப நலன் (Family Health)', info: 'குடும்ப நலன்:\n- குடும்ப உறுப்பினர்கள்: 4\n- தடுப்பூசி நிலுவை: குழந்தை அர்ஜுன் (BCG 완료)\n- தாய்மை பராமரிப்பு: அனிதா (28 வாரம்)' },
          { num: 3, label: '3. மருந்துகள் (Medicines)', info: 'மருந்துகள்:\n- ஃபோலிக் அமிலம் 5mg (காலை)\n- இரும்புச் சத்து மாத்திரை 200mg (இரவு)' },
          { num: 4, label: '4. மருத்துவர் (Doctor)', action: 'nav_doctor' },
          { num: 5, label: '5. மருத்துவமனை (Hospital)', action: 'nav_hospital' },
          { num: 6, label: '6. அவசர உதவி (Emergency)', action: 'nav_emergency' },
          { num: 7, label: '7. அரசு திட்டங்கள் (Schemes)', info: 'அரசு திட்டங்கள்:\n- ஆயுஷ்மான் பாரத் (PM-JAY)\n- ஜனனி சுரக்ஷா திட்டம் (JSY)\n- பிரதம மந்திரி மாத்ரு வந்தனா' },
          { num: 8, label: '8. மெடோரா AI கேளுங்கள் (Ask Medora AI)', action: 'ai' },
          { num: 9, label: '9. வெளியேறு (Exit)', action: 'exit' },
        ];
      case 'te':
        return [
          { num: 1, label: '1. నా ఆరోగ్యం (My Health)', info: 'నా ఆరోగ్యం:\n- రక్తపోటు: 110/72 mmHg\n- బ్లడ్ షుగర్: 142 mg/dL\n- రక్తహీనత పర్యవేక్షణలో ఉంది' },
          { num: 2, label: '2. కుటుంబ ఆరోగ్యం (Family Health)', info: 'కుటుంబ ఆరోగ్యం:\n- కుటుంబ సభ్యులు: 4\n- వ్యాక్సినేషన్: అర్జున్ (శిశువు)' },
          { num: 3, label: '3. మందులు (Medicines)', info: 'మందులు:\n- ఫోలిక్ యాసిడ్ 5mg (ఉదయం)\n- ఐరన్ మాత్ర 200mg (రాత్రి)' },
          { num: 4, label: '4. డాక్టర్ (Doctor)', action: 'nav_doctor' },
          { num: 5, label: '5. ఆసుపత్రి (Hospital)', action: 'nav_hospital' },
          { num: 6, label: '6. అత్యవసరం (Emergency)', action: 'nav_emergency' },
          { num: 7, label: '7. ప్రభుత్వ పథకాలు (Schemes)', info: 'ప్రభుత్వ పథకాలు:\n- ఆయుష్మాన్ భారత్\n- జననీ సురక్ష యోజన' },
          { num: 8, label: '8. మెడోరా AI అడగండి (Ask Medora AI)', action: 'ai' },
          { num: 9, label: '9. నిష్క్రమణ (Exit)', action: 'exit' },
        ];
      case 'ml':
        return [
          { num: 1, label: '1. എന്റെ ആരോഗ്യം (My Health)', info: 'എന്റെ ആരോഗ്യം:\n- രക്തസമ്മർദ്ദം: 110/72 mmHg\n- രക്തത്തിലെ പഞ്ചസാര: 142 mg/dL' },
          { num: 2, label: '2. കുടുംബ ആരോഗ്യം (Family Health)', info: 'കുടുംബ ആരോഗ്യം:\n- അംഗങ്ങൾ: 4\n- വാക്സിനേഷൻ രേഖപ്പെടുത്തിയിട്ടുണ്ട്' },
          { num: 3, label: '3. മരുന്നുകൾ (Medicines)', info: 'മരുന്നുകൾ:\n- ഫോളിക് ആസിഡ് 5mg (രാവിലെ)\n- അയൺ ഗുളിക 200mg (രാത്രി)' },
          { num: 4, label: '4. ഡോക്ടർ (Doctor)', action: 'nav_doctor' },
          { num: 5, label: '5. ആശുപത്രി (Hospital)', action: 'nav_hospital' },
          { num: 6, label: '6. അടിയന്തിരം (Emergency)', action: 'nav_emergency' },
          { num: 7, label: '7. ആരോഗ്യ പദ്ധതികൾ (Schemes)', info: 'പദ്ധതികൾ:\n- ആയുഷ്മാൻ ഭാരത്\n- ജനനി സുരക്ഷാ യോജന' },
          { num: 8, label: '8. മെഡോറ AI ചോദിക്കൂ (Ask Medora AI)', action: 'ai' },
          { num: 9, label: '9. പുറത്തുകടക്കുക (Exit)', action: 'exit' },
        ];
      case 'kn':
        return [
          { num: 1, label: '1. ನನ್ನ ಆರೋಗ್ಯ (My Health)', info: 'ನನ್ನ ಆರೋಗ್ಯ:\n- ರಕ್ತದೊತ್ತಡ: 110/72 mmHg\n- ರಕ್ತದ ಸಕ್ಕರೆ: 142 mg/dL' },
          { num: 2, label: '2. ಕುಟುಂಬ ಆರೋಗ್ಯ (Family Health)', info: 'ಕುಟುಂಬ ಆರೋಗ್ಯ:\n- ಸದಸ್ಯರು: 4\n- ಲಸಿಕೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ' },
          { num: 3, label: '3. ಔಷಧಿಗಳು (Medicines)', info: 'ಔಷಧಿಗಳು:\n- ಫೋಲಿಕ್ ಆಮ್ಲ 5mg (ಬೆಳಿಗ್ಗೆ)\n- ಐರನ್ ಮಾತ್ರೆ 200mg (ರಾತ್ರಿ)' },
          { num: 4, label: '4. ವೈದ್ಯರು (Doctor)', action: 'nav_doctor' },
          { num: 5, label: '5. ಆಸ್ಪತ್ರೆ (Hospital)', action: 'nav_hospital' },
          { num: 6, label: '6. ತುರ್ತುಸ್ಥಿತಿ (Emergency)', action: 'nav_emergency' },
          { num: 7, label: '7. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು (Schemes)', info: 'ಯೋಜನೆಗಳು:\n- ಆಯುಷ್ಮಾನ್ ಭಾರತ್\n- ಜನನಿ ಸುರಕ್ಷಾ ಯೋಜನೆ' },
          { num: 8, label: '8. ಮೆಡೋರಾ AI ಕೇಳಿ (Ask Medora AI)', action: 'ai' },
          { num: 9, label: '9. ನಿರ್ಗಮಿಸಿ (Exit)', action: 'exit' },
        ];
      case 'hi':
        return [
          { num: 1, label: '1. मेरा स्वास्थ्य (My Health)', info: 'मेरा स्वास्थ्य:\n- रक्तचाप: 110/72 mmHg\n- रक्त शर्करा: 142 mg/dL' },
          { num: 2, label: '2. पारिवारिक स्वास्थ्य (Family Health)', info: 'परिवार स्वास्थ्य:\n- कुल सदस्य: 4\n- टीकाकरण: जारी है' },
          { num: 3, label: '3. दवाइयाँ (Medicines)', info: 'दवाइयाँ:\n- फोलिक एसिड 5mg (सुबह)\n- आयरन टैबलेट 200mg (रात)' },
          { num: 4, label: '4. डॉक्टर (Doctor)', action: 'nav_doctor' },
          { num: 5, label: '5. अस्पताल (Hospital)', action: 'nav_hospital' },
          { num: 6, label: '6. आपातकालीन (Emergency)', action: 'nav_emergency' },
          { num: 7, label: '7. सरकारी योजनाएं (Schemes)', info: 'सरकारी योजनाएं:\n- आयुष्मान भारत (PM-JAY)\n- जननी सुरक्षा योजना' },
          { num: 8, label: '8. मेडोरा AI से पूछें (Ask Medora AI)', action: 'ai' },
          { num: 9, label: '9. बाहर निकलें (Exit)', action: 'exit' },
        ];
      default:
        return [
          { num: 1, label: '1. My Health', info: 'MY HEALTH:\n- Blood Pressure: 110/72 mmHg\n- Blood Sugar: 142 mg/dL\n- Condition: Anemia (Monitoring)' },
          { num: 2, label: '2. Family Health', info: 'FAMILY HEALTH:\n- Total Members: 4\n- Vaccines: Baby Arjun (Up to date)\n- Maternal: Anitha (28w)' },
          { num: 3, label: '3. Medicines', info: 'MEDICINES:\n- Folic Acid 5mg (Morning)\n- Ferrous Sulphate 200mg (Night)' },
          { num: 4, label: '4. Doctor', action: 'nav_doctor' },
          { num: 5, label: '5. Hospital', action: 'nav_hospital' },
          { num: 6, label: '6. Emergency', action: 'nav_emergency' },
          { num: 7, label: '7. Government Schemes', info: 'SCHEMES:\n- Ayushman Bharat (PM-JAY)\n- Janani Suraksha Yojana (JSY)\n- PMMVY Maternity Support' },
          { num: 8, label: '8. Ask Medora AI', action: 'ai' },
          { num: 9, label: '9. Exit', action: 'exit' },
        ];
    }
  };

  const getHeaderTitle = (): string => {
    switch (appLanguage) {
      case 'ta': return 'மெடோரா USSD (*123#)\nமுதன்மை பட்டியல்:';
      case 'te': return 'మెడోరా USSD (*123#)\nప్రధాన మెనూ:';
      case 'ml': return 'മെഡോറ USSD (*123#)\nപ്രധാന മെനു:';
      case 'kn': return 'ಮೆಡೋರಾ USSD (*123#)\nಮುಖ್ಯ ಮೆನು:';
      case 'hi': return 'मेडोरा USSD (*123#)\nमुख्य मेनू:';
      default: return 'MEDORA USSD (*123#)\nMain Menu:';
    }
  };

  const getAskAiPrompt = (): string => {
    switch (appLanguage) {
      case 'ta': return 'மெடோரா AI (MEDORA AI)\nஉங்கள் உடல்நலக் கேள்வியை உள்ளிடவும்:\n(உதா: "எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது")';
      case 'te': return 'మెడోరా AI (MEDORA AI)\nమీ ఆరోగ్య ప్రశ్నను టైప్ చేయండి:\n(ఉదా: "నాకు మూడు రోజులుగా జ్వరం ఉంది")';
      case 'ml': return 'മെഡോറ AI (MEDORA AI)\nനിങ്ങളുടെ ആരോഗ്യ ചോദ്യം നൽകുക:\n(ഉദാ: "എനിക്ക് പനിയുണ്ട്")';
      case 'kn': return 'ಮೆಡೋರಾ AI (MEDORA AI)\nನಿಮ್ಮ ಆರೋಗ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ:\n(ಉದಾ: "ನನಗೆ ಮೂರು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ")';
      case 'hi': return 'मेडोरा AI (MEDORA AI)\nअपना स्वास्थ्य प्रश्न लिखें:\n(उदा: "मुझे तीन दिन से बुखार है")';
      default: return 'ASK MEDORA AI\nType your health question:\n(e.g., "I have fever for three days")';
    }
  };

  // Reset to menu on language switch or startup
  useEffect(() => {
    const menu = getMainMenu();
    setMode('menu');
    setDisplayText(getHeaderTitle() + '\n\n' + menu.map(m => m.label).join('\n'));
    setInput('');
  }, [appLanguage]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');

    if (mode === 'ai_input') {
      setLoading(true);
      try {
        let responseText = '';
        let isEmergency = false;

        // Try online server-side Gemini USSD chat first
        try {
          const chatRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: trimmed }],
              role: 'ussd_guide',
              language: appLanguage,
            }),
          });
          if (chatRes.ok) {
            const chatData = await chatRes.json();
            responseText = chatData.reply;
            if (trimmed.toLowerCase().includes('emergency') || trimmed.toLowerCase().includes('breath') || trimmed.toLowerCase().includes('chest pain') || trimmed.toLowerCase().includes('மூச்சு')) {
              isEmergency = true;
            }
          }
        } catch {
          // Offline fallback
        }

        if (!responseText) {
          const result = await conversationEngine.processUssdTurn(
            trimmed,
            appLanguage,
            sessionId,
            currentUser?.id
          );
          responseText = result.responseText;
          isEmergency = result.isEmergency;
        }

        setAiResponse(responseText);
        setAiEmergency(isEmergency);
        setMode('ai_response');

        const emergencyBanner = isEmergency ? '🚨 EMERGENCY / RED FLAG DETECTED\n\n' : '💡 MEDORA AI GUIDANCE & REMEDIES:\n\n';
        setDisplayText(
          `MEDORA USSD AI\n\n${emergencyBanner}You asked:\n"${trimmed}"\n\nResponse:\n${responseText}\n\n━━━━━━━━━━━━━━━━━━━━\n1. Find Doctor\n2. Nearest Hospital\n3. Emergency (108)\n4. Ask Another Question\n0. Main Menu`
        );
      } catch (err: any) {
        setDisplayText('Medora could not safely evaluate this question. Please rephrase or contact a healthcare professional.\n\nPress 0 for Main Menu.');
      } finally {
        setLoading(false);
      }
      return;
    }


    if (mode === 'ai_response') {
      const opt = parseInt(trimmed);
      if (opt === 1) { navigate('/doctor-portal'); return; }
      if (opt === 2) { navigate('/hospitals'); return; }
      if (opt === 3) { navigate('/emergency'); return; }
      if (opt === 4) {
        setMode('ai_input');
        setDisplayText(getAskAiPrompt());
        return;
      }
      // 5 or 0 or anything else returns to main menu
      resetToMenu();
      return;
    }

    if (mode === 'info') {
      resetToMenu();
      return;
    }

    // Default: 'menu' mode
    const num = parseInt(trimmed);
    if (isNaN(num)) {
      // User entered text/symptoms directly from main screen! Seamlessly invoke AI Assistant!
      setLoading(true);
      setMode('ai_response');
      try {
        let responseText = '';
        let isEmergency = false;

        // Try online server-side Gemini USSD chat first
        try {
          const chatRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: trimmed }],
              role: 'ussd_guide',
              language: appLanguage,
            }),
          });
          if (chatRes.ok) {
            const chatData = await chatRes.json();
            responseText = chatData.reply;
            if (trimmed.toLowerCase().includes('emergency') || trimmed.toLowerCase().includes('breath') || trimmed.toLowerCase().includes('chest pain') || trimmed.toLowerCase().includes('மூச்சு')) {
              isEmergency = true;
            }
          }
        } catch {
          // Offline fallback
        }

        if (!responseText) {
          const result = await conversationEngine.processUssdTurn(
            trimmed,
            appLanguage,
            sessionId,
            currentUser?.id
          );
          responseText = result.responseText;
          isEmergency = result.isEmergency;
        }

        setAiResponse(responseText);
        setAiEmergency(isEmergency);

        const banner = isEmergency ? '🚨 EMERGENCY RED FLAG DETECTED\n\n' : '💡 MEDORA AI GUIDANCE & REMEDIES:\n\n';
        setDisplayText(
          `MEDORA USSD AI\n\nQuery: "${trimmed}"\n\n${banner}${responseText}\n\n━━━━━━━━━━━━━━━━━━━━\n1. Find Doctor\n2. Nearest Hospital\n3. Emergency (108)\n4. Ask Another Question\n0. Main Menu`
        );
      } catch {
        setDisplayText('Medora could not safely evaluate this query. Please consult a clinician.\n\nPress 0 for Main Menu.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (num === 0 || num === 9) {
      resetToMenu();
      return;
    }


    const menu = getMainMenu();
    const selected = menu.find(m => m.num === num);

    if (!selected) {
      setDisplayText('Invalid option. Enter 1 to 9.\n\nPress 0 for Main Menu.');
      return;
    }

    if (selected.action === 'ai') {
      setMode('ai_input');
      setDisplayText(getAskAiPrompt());
      return;
    }

    if (selected.action === 'nav_doctor') {
      navigate('/doctor-portal');
      return;
    }
    if (selected.action === 'nav_hospital') {
      navigate('/hospitals');
      return;
    }
    if (selected.action === 'nav_emergency') {
      navigate('/emergency');
      return;
    }

    if (selected.info) {
      setMode('info');
      setDisplayText(`${selected.info}\n\n━━━━━━━━━━━━━━━━━━━━\nPress 0 for Main Menu.`);
    }
  };

  const resetToMenu = () => {
    const menu = getMainMenu();
    setMode('menu');
    setDisplayText(getHeaderTitle() + '\n\n' + menu.map(m => m.label).join('\n'));
    setInput('');
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-800">🔢 {t('ussd.title', 'USSD Simulation')}</h1>
            <p className="text-xs text-slate-500">Offline Basic-Phone Healthcare & AI Assistant</p>
          </div>
          <DemoDataBadge />
        </div>

        {/* Feature Banner */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 text-xs text-teal-900 flex items-start gap-2.5">
          <span className="text-lg">🤖</span>
          <div>
            <span className="font-bold">Offline USSD Medora AI:</span> Select option <strong>8</strong> to ask clinical questions, check medicine schedules, or verify appointments without internet.
          </div>
        </div>

        {/* Phone Simulation Frame */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-sm border-4 border-slate-700">
          {/* Top Phone Speaker Bar */}
          <div className="bg-slate-950 py-2 flex items-center justify-center">
            <div className="w-16 h-1.5 bg-slate-700 rounded-full" />
          </div>

          {/* LCD Screen */}
          <div className="bg-black p-4 min-h-[260px] font-mono text-green-400 text-xs sm:text-sm border-y-4 border-slate-800 select-text overflow-y-auto max-h-[360px]">
            <div className="text-[10px] text-green-500/70 border-b border-green-900/50 pb-1 mb-2 flex items-center justify-between">
              <span>*123# MEDORA AI</span>
              <span className="text-[9px] uppercase font-bold text-amber-400">Offline Mode</span>
            </div>
            {loading ? (
              <div className="py-12 text-center text-amber-300 animate-pulse">
                Medora AI is evaluating local clinical guidelines...
              </div>
            ) : (
              <div className="whitespace-pre-line leading-relaxed font-sans sm:font-mono">
                {displayText}
              </div>
            )}
          </div>

          {/* Input Row */}
          <div className="bg-slate-800 p-3 flex gap-2 items-center border-t border-slate-700">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={mode === 'ai_input' ? 'Ask health question...' : 'Enter option (1-9)...'}
              className="flex-1 bg-slate-950 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500 border border-slate-700"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors active:scale-95 disabled:opacity-50"
            >
              SEND
            </button>
          </div>

          {/* Keypad */}
          <div className="p-3 bg-slate-900 grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(k => (
              <button
                key={k}
                onClick={() => setInput(prev => prev + k)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-base sm:text-lg py-2.5 rounded-xl active:scale-95 transition-all shadow-xs"
              >
                {k}
              </button>
            ))}
          </div>

          {/* Bottom Action Keys */}
          <div className="px-3 pb-4 grid grid-cols-2 gap-2 bg-slate-900">
            <button
              onClick={resetToMenu}
              className="bg-rose-700 hover:bg-rose-600 text-white py-2 rounded-xl text-xs font-bold active:scale-95 transition-colors"
            >
              MENU / BACK (0)
            </button>
            <button
              onClick={() => setInput(prev => prev.slice(0, -1))}
              className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-xs font-bold active:scale-95 transition-colors"
            >
              ⌫ CLEAR
            </button>
          </div>
        </div>

        {/* Quick Test Prompt Shortcuts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">
            💡 Quick Test Questions (Tap to Ask):
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { label: 'Fever 3 days (EN)', text: 'I have fever for three days' },
              { label: 'காய்ச்சல் (TA)', text: 'எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது' },
              { label: 'Cannot Breathe (EN)', text: 'I cannot breathe' },
              { label: 'மூச்சுத்திணறல் (TA)', text: 'எனக்கு மூச்சு விட முடியவில்லை' },
              { label: 'Child Vomiting (EN)', text: 'My child is vomiting' },
              { label: 'Next Appointment?', text: 'What is my next appointment?' },
              { label: 'Medicine Schedule?', text: 'When should I take my medicine?' },
            ].map(prompt => (
              <button
                key={prompt.label}
                onClick={() => {
                  setMode('ai_input');
                  setInput(prompt.text);
                  setDisplayText(getAskAiPrompt());
                }}
                className="bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 font-medium transition-colors"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

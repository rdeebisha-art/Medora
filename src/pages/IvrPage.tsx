import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

type MenuNode = { label: string; children?: MenuNode[]; content?: string; };

const IVR_TREE: MenuNode = {
  label: 'Welcome to Medora Health Helpline. Press 1 for Hindi, 2 for Tamil, 3 for Telugu, 4 for Kannada, 5 for Malayalam, 6 for English.',
  children: [
    { label: '1. Health Advice', content: 'For health advice: Drink 8 glasses of water daily. Wash hands before eating. Seek doctor if fever lasts more than 3 days.' },
    { label: '2. Medicine Information', content: 'For medicine queries, consult your ASHA worker or visit the nearest health center. Do not self-medicate.' },
    { label: '3. Doctor Assistance', content: 'Doctor Dr. Arjun Mehta is available Mon-Sat, 9am-5pm at Kodaikanal Government Hospital.' },
    { label: '4. Nearest Hospital', content: 'Nearest hospital: Kodaikanal Government Hospital, 5km. Phone: 04542-241234. Open 24/7 for emergencies.' },
    { label: '5. Emergency Help', content: 'For emergencies, call 108 (free ambulance). Or go to Emergency section in Medora app.' },
    { label: '6. Government Schemes', content: 'Available schemes: Ayushman Bharat (free treatment up to ₹5L), JSY (maternity benefit), UIP (free vaccines). Ask ASHA for forms.' },
    { label: '7. Vaccination', content: 'UIP Vaccines are free. BCG, OPV, DPT, Measles, Rubella are given at PHC. Check Medora app for schedule.' },
    { label: '8. Repeat Menu', content: null },
    { label: '9. Exit', content: 'Thank you for calling Medora Health Helpline. Stay healthy!' },
  ],
};

export default function IvrPage() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<string[]>([IVR_TREE.label]);
  const [currentMenu, setCurrentMenu] = useState<MenuNode>(IVR_TREE);
  const [speaking, setSpeaking] = useState(false);

  const handleSelect = (option: MenuNode) => {
    if (option.content) {
      setHistory(prev => [...prev, `> ${option.label}`, option.content!]);
    } else {
      setHistory(prev => [...prev, `> ${option.label}`]);
      setCurrentMenu(option);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-IN';
      utt.rate = 0.8;
      utt.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utt);
      setSpeaking(true);
    }
  };

  const handleBack = () => {
    setCurrentMenu(IVR_TREE);
    setHistory([IVR_TREE.label]);
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">☎️ {t('ivr.title')}</h1>
          <DemoDataBadge />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700">
          ☎️ {t('ivr.demoNote')}
        </div>

        {/* Phone interface */}
        <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
          {/* Screen */}
          <div className="bg-gray-800 p-4 min-h-40 font-mono text-green-400 text-sm">
            <div className="text-xs text-gray-500 mb-2">MEDORA IVR SIMULATOR</div>
            {history.slice(-6).map((line, i) => (
              <div key={i} className={`mb-1 ${line.startsWith('>') ? 'text-yellow-400' : 'text-green-400'}`}>{line}</div>
            ))}
            <div className="animate-pulse text-green-600 mt-1">█</div>
          </div>

          {/* Speak button */}
          <div className="p-2 bg-gray-800 border-t border-gray-700">
            <button
              onClick={() => speakText(history[history.length - 1])}
              disabled={speaking}
              className={`w-full text-sm py-2 rounded-xl font-medium ${speaking ? 'bg-red-600 text-white' : 'bg-green-700 text-white hover:bg-green-600'}`}
            >
              {speaking ? '🔊 Speaking...' : '🔊 Speak Response'}
            </button>
          </div>

          {/* Menu Options */}
          <div className="p-4 space-y-2">
            {currentMenu.children?.map((child, i) => (
              <button
                key={i}
                onClick={() => handleSelect(child)}
                className="w-full flex items-center gap-3 bg-gray-700 hover:bg-gray-600 text-white text-sm py-3 px-4 rounded-xl transition-all active:scale-95"
              >
                <span className="bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">{i + 1}</span>
                <span>{child.label.replace(/^\d+\.\s/, '')}</span>
              </button>
            ))}

            {/* Back button */}
            <button onClick={handleBack} className="w-full bg-red-900 hover:bg-red-800 text-white text-sm py-3 rounded-xl font-medium mt-2">
              {t('ivr.back')} ← Main Menu
            </button>
          </div>

          {/* Keypad */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-2">
              {['1','2','3','4','5','6','7','8','9','*','0','#'].map(k => (
                <button
                  key={k}
                  onClick={() => {
                    const idx = parseInt(k) - 1;
                    if (currentMenu.children && idx >= 0 && idx < currentMenu.children.length) {
                      handleSelect(currentMenu.children[idx]);
                    }
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold py-3 rounded-xl transition-all active:scale-95"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

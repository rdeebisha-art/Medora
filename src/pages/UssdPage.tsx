import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';

type Screen = { title: string; items: { label: string; screen?: Screen; info?: string }[] };

const USSD_TREE: Screen = {
  title: 'MEDORA HEALTH\nMain Menu:',
  items: [
    {
      label: '1. My Health',
      screen: {
        title: 'MY HEALTH:',
        items: [
          { label: '1. Conditions', info: 'Anemia, Pregnancy (28w)' },
          { label: '2. Blood Pressure', info: 'Last reading: 110/75 mmHg (Normal)' },
          { label: '3. Blood Sugar', info: 'Last reading: 142 mg/dL (High - see doctor)' },
          { label: '4. Medicines Due Today', info: 'Folic Acid - 8:00 AM\nFerrous Sulphate - 8:00 PM' },
          { label: '0. Back', info: null },
        ]
      }
    },
    { label: '2. Family', info: 'Family Members: 3\nHealth Alerts: Anitha - checkup due\nBaby Arjun - vaccination due' },
    {
      label: '3. Medicines',
      screen: {
        title: 'MEDICINES:',
        items: [
          { label: '1. Today\'s Medicines', info: 'Folic Acid 400mcg - 8AM\nFerrous Sulphate 60mg - 8PM' },
          { label: '2. Missed Doses', info: 'None missed today' },
          { label: '0. Back', info: null },
        ]
      }
    },
    { label: '4. Nearest Hospital', info: 'Kodaikanal Govt Hospital\n5 km away\nPhone: 04542-241234\nOpen: 24/7' },
    { label: '5. Emergency', info: 'EMERGENCY CONTACTS:\nAmbulance: 108 (FREE)\nPolice: 100\nFire: 101\nWoman Helpline: 1091' },
    { label: '6. Schemes', info: 'Eligible Schemes:\n- Ayushman Bharat\n- JSY (Maternity)\n- PMMVY\nVisit ASHA worker with Aadhaar' },
    { label: '7. Health Advice', info: 'Today\'s Tip:\nDrink 8-10 glasses of water.\nEat iron-rich foods: spinach, dal.\nRest for at least 8 hours.' },
    { label: '0. Exit', info: 'Thank you for using MEDORA.\nStay healthy!' },
  ]
};

export default function UssdPage() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<Screen>(USSD_TREE);
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [displayText, setDisplayText] = useState(USSD_TREE.title + '\n\n' + USSD_TREE.items.map(i => i.label).join('\n'));

  const handleInput = () => {
    const num = parseInt(input.trim());
    setOutput(prev => [...prev, '> ' + input]);
    setInput('');

    if (num === 0) {
      setScreen(USSD_TREE);
      const text = USSD_TREE.title + '\n\n' + USSD_TREE.items.map(i => i.label).join('\n');
      setDisplayText(text);
      setOutput([]);
      return;
    }

    const item = screen.items[num - 1];
    if (!item) { setDisplayText('Invalid option. Press 0 to go back.'); return; }

    if (item.info !== undefined && item.info !== null) {
      setDisplayText(item.info || 'No data available.\n\nPress 0 to go back.');
    } else if (item.screen) {
      setScreen(item.screen);
      const text = item.screen.title + '\n\n' + item.screen.items.map(i => i.label).join('\n');
      setDisplayText(text);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">🔢 {t('ussd.title')}</h1>
          <DemoDataBadge />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700">
          🔢 {t('ussd.demoNote')}
        </div>

        {/* Feature phone simulator */}
        <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-xs">
          {/* Screen */}
          <div className="bg-black p-4 min-h-52 font-mono text-green-400 text-sm border-b-4 border-gray-700">
            <div className="text-xs text-gray-600 mb-2">*141*9999# MEDORA</div>
            <div className="whitespace-pre-line">{displayText}</div>
          </div>

          {/* Input row */}
          <div className="flex bg-gray-800 px-3 py-2 gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInput()}
              placeholder={t('ussd.enterOption')}
              className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none"
            />
            <button onClick={handleInput} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-500">
              OK
            </button>
          </div>

          {/* Keypad */}
          <div className="px-4 py-3 grid grid-cols-3 gap-2">
            {['1','2','3','4','5','6','7','8','9','*','0','#'].map(k => (
              <button
                key={k}
                onClick={() => setInput(prev => prev + k)}
                className="bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold py-3 rounded-xl active:scale-95 transition-all"
              >
                {k}
              </button>
            ))}
          </div>

          {/* Function keys */}
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            <button onClick={() => { setScreen(USSD_TREE); setDisplayText(USSD_TREE.title + '\n\n' + USSD_TREE.items.map(i => i.label).join('\n')); setOutput([]); }}
              className="bg-red-700 text-white py-2 rounded-xl text-sm font-medium">
              {t('ussd.back')}
            </button>
            <button onClick={() => setInput(prev => prev.slice(0, -1))}
              className="bg-gray-600 text-white py-2 rounded-xl text-sm font-medium">
              ⌫ Del
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4">{t('ussd.demoNote')}</p>
      </div>
    </Layout>
  );
}

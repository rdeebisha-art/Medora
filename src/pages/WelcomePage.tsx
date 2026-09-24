import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
];

export default function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setLanguage, toggleSimpleMode, isSimpleMode } = useAppStore();
  const [selectedLang, setSelectedLang] = useState('en');
  const [step, setStep] = useState<'language' | 'mode'>('language');

  const handleLangSelect = (code: string) => {
    setSelectedLang(code);
    setLanguage(code);
  };

  const handleContinue = () => {
    if (step === 'language') { setStep('mode'); return; }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-600 to-sky-800 flex flex-col">
      {/* Logo area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-4 text-white text-center">
        <div className="text-6xl mb-4">🏥</div>
        <h1 className="text-4xl font-black tracking-wider">MEDORA</h1>
        <p className="text-xl font-medium opacity-90 mt-1">{t('app.tagline')}</p>
        <p className="text-sm opacity-75 mt-2 max-w-xs">{t('app.subtitle')}</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-t-3xl px-6 pt-6 pb-8 shadow-2xl">
        {step === 'language' ? (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('common.selectLanguage')}</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLangSelect(lang.code)}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${selectedLang === lang.code ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-gray-200 hover:border-sky-300'}`}
                >
                  <span className="text-2xl mb-1">{lang.flag}</span>
                  <span className="font-bold text-gray-800">{lang.native}</span>
                  <span className="text-xs text-gray-500">{lang.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-2 text-center">Choose Mode</h2>
            <p className="text-sm text-gray-500 text-center mb-4">Select how you want to use Medora</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => { if (isSimpleMode) toggleSimpleMode(); }}
                className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${!isSimpleMode ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-gray-200'}`}
              >
                <span className="text-3xl mb-2">📱</span>
                <span className="font-bold text-gray-800">{t('common.normalMode')}</span>
                <span className="text-xs text-gray-500 text-center mt-1">All features, standard interface</span>
              </button>
              <button
                onClick={() => { if (!isSimpleMode) toggleSimpleMode(); }}
                className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${isSimpleMode ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-gray-200'}`}
              >
                <span className="text-3xl mb-2">🔤</span>
                <span className="font-bold text-gray-800">{t('common.simpleMode')}</span>
                <span className="text-xs text-gray-500 text-center mt-1">Large text, voice-first, easy navigation</span>
              </button>
            </div>
          </>
        )}

        <button
          onClick={handleContinue}
          className="w-full bg-sky-600 text-white font-bold py-4 rounded-2xl text-lg hover:bg-sky-700 active:scale-98 transition-all shadow-lg"
        >
          {t('common.continue')} →
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Healthcare support, wherever you are. • Demo version — all data is fictional.
        </p>
      </div>
    </div>
  );
}

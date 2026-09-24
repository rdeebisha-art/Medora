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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Logo area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#F0FDFA] border border-[#0F766E]/20 text-4xl flex items-center justify-center shadow-xs mb-4">
          🏥
        </div>
        <h1 className="text-4xl font-black tracking-wider text-[#0F766E]">MEDORA</h1>
        <p className="text-base font-bold text-[#0F172A] mt-2">{t('app.tagline')}</p>
        <p className="text-xs text-[#64748B] mt-1 max-w-xs">{t('app.subtitle')}</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-t-3xl border-t border-[#E2E8F0] px-6 pt-6 pb-8 shadow-xl max-w-lg mx-auto w-full">
        {step === 'language' ? (
          <>
            <h2 className="text-base font-black text-[#0F172A] mb-3 text-center">{t('common.selectLanguage')}</h2>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLangSelect(lang.code)}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${selectedLang === lang.code ? 'border-[#0F766E] bg-[#F0FDFA] text-[#0F766E] shadow-2xs' : 'border-[#E2E8F0] bg-white hover:bg-slate-50'}`}
                >
                  <span className="text-2xl mb-0.5">{lang.flag}</span>
                  <span className="font-extrabold text-xs text-[#0F172A]">{lang.native}</span>
                  <span className="text-[11px] text-[#64748B]">{lang.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-base font-black text-[#0F172A] mb-1 text-center">Choose Mode</h2>
            <p className="text-xs text-[#64748B] text-center mb-4">Select how you want to use Medora</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => { if (isSimpleMode) toggleSimpleMode(); }}
                className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${!isSimpleMode ? 'border-[#0F766E] bg-[#F0FDFA] shadow-2xs' : 'border-[#E2E8F0] bg-white'}`}
              >
                <span className="text-3xl mb-1">📱</span>
                <span className="font-extrabold text-xs text-[#0F172A]">{t('common.normalMode')}</span>
                <span className="text-[11px] text-[#64748B] text-center mt-1">All features, standard interface</span>
              </button>
              <button
                onClick={() => { if (!isSimpleMode) toggleSimpleMode(); }}
                className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${isSimpleMode ? 'border-[#0F766E] bg-[#F0FDFA] shadow-2xs' : 'border-[#E2E8F0] bg-white'}`}
              >
                <span className="text-3xl mb-1">🔤</span>
                <span className="font-extrabold text-xs text-[#0F172A]">{t('common.simpleMode')}</span>
                <span className="text-[11px] text-[#64748B] text-center mt-1">Large text, voice-first, easy navigation</span>
              </button>
            </div>
          </>
        )}

        <button
          onClick={handleContinue}
          className="w-full bg-[#0F766E] hover:bg-teal-800 text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all shadow-xs"
        >
          {t('common.continue')} →
        </button>

        <p className="text-[11px] text-[#94A3B8] text-center mt-4">
          Healthcare support, wherever you are. • Demo version — all data is fictional.
        </p>
      </div>
    </div>
  );
}

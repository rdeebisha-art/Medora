import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { Check } from 'lucide-react';

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
    if (step === 'language') {
      setStep('mode');
      return;
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-between py-6 px-4">
      {/* Brand & Tagline Header */}
      <div className="flex-1 flex flex-col items-center justify-center pt-6 pb-4 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/95 border border-[#0F766E]/25 text-3xl sm:text-4xl flex items-center justify-center shadow-md mb-3 text-[#0F766E]">
          🩺
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-[#0F172A] drop-shadow-xs">
          MEDORA
        </h1>
        <p className="text-base sm:text-lg font-extrabold text-[#0F766E] mt-1 bg-white/85 backdrop-blur-md px-4 py-1 rounded-full shadow-2xs border border-[#0F766E]/20">
          Rural Health Companion
        </p>
        <p className="text-xs sm:text-sm text-[#334155] mt-2 font-semibold bg-white/70 backdrop-blur-xs px-3 py-0.5 rounded-full">
          Healthcare support, wherever you are.
        </p>
      </div>

      {/* Main Glass Content Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#0F766E]/20 px-5 sm:px-7 pt-6 pb-7 shadow-2xl max-w-lg mx-auto w-full mb-4">
        {step === 'language' ? (
          <>
            <div className="text-center mb-4">
              <h2 className="text-lg font-black text-[#0F172A]">
                {t('common.selectLanguage', 'Select Language')}
              </h2>
              <p className="text-xs text-[#475569] mt-0.5">
                Choose your preferred regional healthcare language
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLangSelect(lang.code)}
                    className={`relative flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[#0F766E] bg-[#F0FDFA] shadow-xs'
                        : 'border-[#E2E8F0] bg-white hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">
                        {lang.native}
                      </div>
                      <div className="text-[11px] font-semibold text-[#64748B] mt-0.5">
                        {lang.label}
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-xs flex-shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-slate-300 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <h2 className="text-lg font-black text-[#0F172A]">Choose Experience Mode</h2>
              <p className="text-xs text-[#475569] mt-0.5">Select how you prefer to navigate Medora</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => {
                  if (isSimpleMode) toggleSimpleMode();
                }}
                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                  !isSimpleMode
                    ? 'border-[#0F766E] bg-[#F0FDFA] shadow-xs'
                    : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl mb-1.5">📱</span>
                <span className="font-extrabold text-sm text-[#0F172A]">{t('common.normalMode', 'Standard Mode')}</span>
                <span className="text-[11px] text-[#64748B] text-center mt-1 font-medium">All clinical tools & dashboards</span>
              </button>
              <button
                onClick={() => {
                  if (!isSimpleMode) toggleSimpleMode();
                }}
                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                  isSimpleMode
                    ? 'border-[#0F766E] bg-[#F0FDFA] shadow-xs'
                    : 'border-[#E2E8F0] bg-white hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl mb-1.5">🔤</span>
                <span className="font-extrabold text-sm text-[#0F172A]">{t('common.simpleMode', 'Simple Mode')}</span>
                <span className="text-[11px] text-[#64748B] text-center mt-1 font-medium">Large text & voice-guided navigation</span>
              </button>
            </div>
          </>
        )}

        <button
          onClick={handleContinue}
          className="w-full bg-[#0F766E] hover:bg-teal-800 active:scale-[0.99] text-white font-black py-3.5 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          <span>{t('common.continue', 'Continue')}</span>
          <span>→</span>
        </button>

        <p className="text-[11px] text-[#64748B] text-center mt-4 font-medium">
          Healthcare support, wherever you are. • Offline-first rural healthcare platform
        </p>
      </div>
    </div>
  );
}

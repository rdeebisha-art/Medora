import React, { useState } from 'react';
import { Heart, Globe, Sparkles, CheckCircle2, ShieldCheck, Stethoscope, ArrowRight } from 'lucide-react';
import { LanguageCode } from '../types';

interface FirstTimeOnboardingProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onComplete: () => void;
}

export const FirstTimeOnboarding: React.FC<FirstTimeOnboardingProps> = ({
  currentLang,
  onLanguageChange,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const languages: { code: LanguageCode; label: string; subLabel: string }[] = [
    { code: 'en', label: 'English', subLabel: 'English' },
    { code: 'hi', label: 'हिंदी', subLabel: 'Hindi' },
    { code: 'te', label: 'తెలుగు', subLabel: 'Telugu' },
    { code: 'ml', label: 'മലയാളം', subLabel: 'Malayalam' },
    { code: 'ta', label: 'தமிழ்', subLabel: 'Tamil' },
    { code: 'kn', label: 'ಕನ್ನಡ', subLabel: 'Kannada' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden">
        {/* Background Decorative Accent */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="font-extrabold text-slate-900 text-sm">MEDORA Rural Health</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">Step {step} of 3</span>
        </div>

        {/* STEP 1: WELCOME INTRODUCTION */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">
                <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>Welcome to MEDORA ❤️</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Your Rural Health Companion
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Medora helps you keep health records safe, understand lab reports in simple words, and connect with doctors anytime.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider block">Medora helps you:</span>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Keep your health information organized safely</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Remember daily medicines and upcoming test dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Track lab tests, vaccinations, and appointments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Understand medical reports in simple language</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Share selected health details directly with a doctor</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <span>START</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: LANGUAGE SELECTION */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-teal-700 text-xs font-extrabold uppercase tracking-wider">
                <Globe className="w-4 h-4 text-teal-600" />
                <span>🌐 Choose Your Language</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Select preferred language</h2>
              <p className="text-xs text-slate-500">
                The entire Medora application will switch to your chosen language.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {languages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold text-slate-900 text-sm">{lang.label}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{lang.subLabel}</div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <span>Continue with {languages.find((l) => l.code === currentLang)?.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: READY TO EXPLORE */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2 text-center py-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">You are ready!</h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                You can now view your health summary, check medical reports, ask Medora AI, or use button-phone assisted access anytime.
              </p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-950 font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Healthcare Continuity Guarantee</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Medora keeps your health information accessible across smartphones, basic feature phones, and low-connectivity 2G networks.
              </p>
            </div>

            <button
              onClick={onComplete}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <span>Explore Medora Platform</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import Layout from '../components/Layout';
import DemoDataBadge from '../components/DemoDataBadge';
import { Settings, Globe, Volume2, Shield, Eye, Wifi, Database, Check, RefreshCw } from 'lucide-react';
import { seedDatabase } from '../db/db';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' }
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    language,
    setLanguage,
    isSimpleMode,
    toggleSimpleMode,
    is2GMode,
    toggle2GMode,
  } = useAppStore();

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleResetSeed = async () => {
    await seedDatabase();
    setConfirmReset(false);
    setResetDone(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FDFA] border border-[#0F766E]/20 text-[#0F766E] flex items-center justify-center font-bold shadow-2xs">
              <Settings size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#0F172A]">Application Settings</h1>
              <p className="text-xs text-[#64748B]">Configure language, voice, accessibility & offline mode</p>
            </div>
          </div>
          <DemoDataBadge />
        </div>

        {/* 1. Interface Language */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#0F172A] font-extrabold text-sm">
            <Globe size={18} className="text-[#0F766E]" />
            <span>Application Interface Language</span>
          </div>
          <p className="text-xs text-[#64748B]">
            Select your preferred display language for UI labels and menus. (Voice automatically detects spoken language).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                  language === l.code
                    ? 'bg-[#F0FDFA] border-[#0F766E] text-[#0F766E] shadow-2xs'
                    : 'bg-slate-50 border-[#E2E8F0] text-[#475569] hover:bg-slate-100'
                }`}
              >
                <span>{l.native}</span>
                {language === l.code && <Check size={14} className="text-[#0F766E]" />}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Accessibility & Modes */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#0F172A] font-extrabold text-sm">
            <Eye size={18} className="text-[#0F766E]" />
            <span>Accessibility & Visual Modes</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#E2E8F0]">
            <div>
              <div className="text-xs font-extrabold text-[#0F172A]">Simple Mode (Large Touch Targets)</div>
              <p className="text-[11px] text-[#64748B]">Optimized for low-literacy users with prominent voice & visual cards</p>
            </div>
            <button
              onClick={toggleSimpleMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${isSimpleMode ? 'bg-[#0F766E]' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-xs transition-transform ${
                  isSimpleMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs font-extrabold text-[#0F172A]">2G / Ultra Low-Bandwidth Mode</div>
              <p className="text-[11px] text-[#64748B]">Disables heavy assets and minimizes background storage operations</p>
            </div>
            <button
              onClick={toggle2GMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${is2GMode ? 'bg-[#EA580C]' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-xs transition-transform ${
                  is2GMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Voice & Audio Output Settings */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#0F172A] font-extrabold text-sm">
            <Volume2 size={18} className="text-[#14B8A6]" />
            <span>Voice & Audio Settings</span>
          </div>
          <div className="bg-[#F0FDFA] border border-[#14B8A6]/20 rounded-xl p-3 text-xs text-[#0F766E] space-y-1">
            <p className="font-extrabold">✨ Same-Language Voice Guarantee Active</p>
            <p className="opacity-90 leading-relaxed">
              When speaking in Tamil, Telugu, Malayalam, Kannada, Hindi, or English, responses are strictly spoken in the detected language.
            </p>
          </div>
        </div>

        {/* 4. Local Data & Privacy */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#0F172A] font-extrabold text-sm">
            <Database size={18} className="text-[#0F766E]" />
            <span>Data Storage & Privacy</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            All medical records, health measurements, and conversation history are stored entirely on this device inside IndexedDB. No external AI APIs or cloud servers receive your health data.
          </p>

          {resetDone && (
            <div className="bg-[#F0FDF4] border border-[#16A34A]/30 text-[#16A34A] text-xs font-bold p-3 rounded-xl">
              ✅ Local database re-seeded successfully. Refreshing...
            </div>
          )}

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-[#475569] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} /> Reset Local Demo Data
            </button>
          ) : (
            <div className="bg-[#FFFBEB] border border-[#D97706]/30 p-3 rounded-xl space-y-2">
              <p className="text-xs text-[#D97706] font-bold">Reset local demo records to original seed state?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-1.5 bg-white border border-[#E2E8F0] text-xs font-bold text-[#475569] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetSeed}
                  className="flex-1 py-1.5 bg-[#DC2626] text-white text-xs font-bold rounded-lg shadow-2xs hover:bg-red-700"
                >
                  Yes, Reset Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

import React from 'react';
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
    isOffline
  } = useAppStore();

  const handleResetSeed = async () => {
    if (window.confirm('Reset local demo records to original seed state?')) {
      await seedDatabase();
      alert('Local database re-seeded successfully.');
      window.location.reload();
    }
  };

  return (
    <Layout>
      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Settings size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Application Settings</h1>
              <p className="text-xs text-slate-500">Configure language, voice, accessibility & offline mode</p>
            </div>
          </div>
          <DemoDataBadge />
        </div>

        {/* 1. Interface Language */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Globe size={18} className="text-teal-600" />
            <span>Application Interface Language</span>
          </div>
          <p className="text-xs text-slate-500">
            Select your preferred display language for UI labels and menus. (Voice automatically detects spoken language).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all ${
                  language === l.code
                    ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{l.native}</span>
                {language === l.code && <Check size={14} className="text-teal-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Accessibility & Modes */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Eye size={18} className="text-teal-600" />
            <span>Accessibility & Visual Modes</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <div className="text-sm font-bold text-slate-800">Simple Mode (Large Touch Targets)</div>
              <p className="text-xs text-slate-500">Optimized for low-literacy users with prominent voice & visual cards</p>
            </div>
            <button
              onClick={toggleSimpleMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${isSimpleMode ? 'bg-teal-600' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isSimpleMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-bold text-slate-800">2G / Ultra Low-Bandwidth Mode</div>
              <p className="text-xs text-slate-500">Disables heavy assets and minimizes background storage operations</p>
            </div>
            <button
              onClick={toggle2GMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${is2GMode ? 'bg-amber-500' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  is2GMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Voice & Audio Output Settings */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Volume2 size={18} className="text-teal-600" />
            <span>Voice & Audio Settings</span>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3 text-xs text-teal-800 space-y-1">
            <p className="font-bold">✨ Same-Language Voice Guarantee Active</p>
            <p className="opacity-90">
              When speaking in Tamil, Telugu, Malayalam, Kannada, or English, responses are strictly spoken in the detected language.
            </p>
          </div>
        </div>

        {/* 4. Local Data & Privacy */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Database size={18} className="text-teal-600" />
            <span>Data Storage & Privacy</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All medical records, health measurements, and conversation history are stored entirely on this device inside IndexedDB. No external AI APIs or cloud servers receive your health data.
          </p>

          <button
            onClick={handleResetSeed}
            className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} /> Reset Local Demo Data
          </button>
        </div>
      </div>
    </Layout>
  );
}

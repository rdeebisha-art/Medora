import React from 'react';
import { PhoneCall, Volume2, Globe, Heart, ShieldAlert, Sparkles, UserCheck, Pill, KeyRound, Shield, LogOut } from 'lucide-react';
import { LanguageCode, FamilyMember, UserRole } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { voiceService } from '../services/voiceService';

interface HeaderProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  simpleMode: boolean;
  onToggleSimpleMode: () => void;
  lowDataMode: boolean;
  onToggleLowDataMode: () => void;
  offlineDemoMode: boolean;
  onToggleOfflineDemoMode: () => void;
  onOpenEmergency: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  onSelectFamilyMember: (id: string) => void;
  activeRole?: UserRole;
  onOpenRoleSwitcher?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  simpleMode,
  onToggleSimpleMode,
  lowDataMode,
  onToggleLowDataMode,
  offlineDemoMode,
  onToggleOfflineDemoMode,
  onOpenEmergency,
  activeTab,
  onSelectTab,
  familyMembers,
  selectedFamilyId,
  onSelectFamilyMember,
  activeRole = 'patient',
  onOpenRoleSwitcher,
  onLogout,
}) => {
  const [speaking, setSpeaking] = React.useState(false);
  const t = TRANSLATIONS[currentLang];
  const activeMember = familyMembers.find(m => m.id === selectedFamilyId) || familyMembers[0];

  const handleVoiceListen = () => {
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }

    const narrationText = `${t.appName} - ${t.tagline}. ${t.searchPlaceholder}. ${activeMember.name} - ${activeMember.primaryCategory}.`;
    voiceService.speak(
      narrationText,
      currentLang,
      () => setSpeaking(true),
      () => setSpeaking(false)
    );
  };

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'te', label: 'Telugu' },
    { code: 'ml', label: 'Malayalam' },
    { code: 'ta', label: 'Tamil' },
    { code: 'kn', label: 'Kannada' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Universal Emergency Bar */}
      <div className="bg-red-600 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm font-medium">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 animate-pulse text-amber-300" />
          <span>Rural Medical Emergency? Dial <strong>108</strong> (Ambulance) or <strong>112</strong> (National) immediately.</span>
        </div>
        <div className="flex items-center gap-3">
          {onOpenRoleSwitcher && (
            <button
              onClick={onOpenRoleSwitcher}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black px-3 py-1 rounded-full text-xs shadow-sm flex items-center gap-1.5 transition-all border border-amber-500"
              title="Switch user role (Patient, Family, Doctor, Admin)"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-900" />
              <span>ROLE: <span className="uppercase">{activeRole}</span></span>
            </button>
          )}
          <button
            onClick={onOpenEmergency}
            className="bg-white text-red-700 hover:bg-red-50 font-bold px-3 py-1 rounded-full text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>{t.emergencyHelp}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div 
              onClick={() => onSelectTab('journey')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    MEDORA
                  </h1>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                    RURAL HEALTH
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {t.tagline}
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={handleVoiceListen}
                title="Listen to page"
                className={`p-2 rounded-lg border text-xs flex items-center gap-1 ${
                  speaking ? 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Volume2 className="w-4 h-4 text-emerald-700" />
              </button>
              <button
                onClick={onToggleSimpleMode}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${
                  simpleMode 
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {t.simpleMode}
              </button>
              <button
                onClick={onToggleOfflineDemoMode}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${
                  offlineDemoMode ? 'bg-amber-600 text-white border-amber-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="Offline demo mode"
              >
                {offlineDemoMode ? 'Offline' : 'Demo'}
              </button>
            </div>
          </div>

          {/* Center Navigation Links (Standard Mode) */}
          {!simpleMode && (
            <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto w-full md:w-auto py-1 scrollbar-none">
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🏠 Dashboard
              </button>

              <button
                onClick={() => onSelectTab('children')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'children'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                👶 Children
              </button>

              <button
                onClick={() => onSelectTab('maternity')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'maternity'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🤰 Maternity
              </button>

              <button
                onClick={() => onSelectTab('elderly')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'elderly'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                👵 Elderly
              </button>

              <button
                onClick={() => onSelectTab('diseases')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'diseases'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🛡️ Diseases
              </button>

              <button
                onClick={() => onSelectTab('camera')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'camera'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                📷 AI Camera
              </button>

              <button
                onClick={() => onSelectTab('medicine')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'medicine'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Pill className="w-3.5 h-3.5 inline-block mr-1" /> Medicine Check
              </button>

              <button
                onClick={() => onSelectTab('reports')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'reports'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🔬 X-Ray & Reports
              </button>

              <button
                onClick={() => onSelectTab('ai')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-1 shadow-sm ${
                  activeTab === 'ai'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md ring-2 ring-cyan-300'
                    : 'bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 hover:text-cyan-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                <span>🤖 Ask AI</span>
              </button>

              <button
                onClick={() => onSelectTab('a2a')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'a2a'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🔄 A2A Protocol
              </button>

              <button
                onClick={() => onSelectTab('handoff')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'handoff'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                📋 Doctor Summary
              </button>

              <button
                onClick={() => onSelectTab('portal')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'portal'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🏥 Hospital Portal
              </button>

              <button
                onClick={() => onSelectTab('schemes')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'schemes'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🏛️ Govt Schemes
              </button>

              <button
                onClick={() => onSelectTab('emergency')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'emergency'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                🗺️ Emergency & Maps
              </button>

              {activeRole === 'admin' && (
                <button
                  onClick={() => onSelectTab('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-colors whitespace-nowrap flex items-center gap-1 shadow-sm ${
                    activeTab === 'admin'
                      ? 'bg-emerald-800 text-white ring-2 ring-emerald-400'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>🏛️ Village Admin</span>
                </button>
              )}
            </nav>
          )}

          {/* Right Controls: Family Member, Language, Voice & Simple Mode */}
          <div className="flex items-center gap-2 self-end md:self-center">
            {onOpenRoleSwitcher && (
              <button
                onClick={onOpenRoleSwitcher}
                className="hidden xl:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 transition-colors"
                title="Switch Persona / Role"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span className="uppercase text-[11px]">{activeRole} Persona</span>
              </button>
            )}
            {/* Active Family Member Selector */}
            <div className="hidden lg:flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <span className="text-xs font-medium text-slate-500 px-2 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Patient:
              </span>
              <select
                value={selectedFamilyId}
                onChange={(e) => onSelectFamilyMember(e.target.value)}
                className="bg-white text-xs font-semibold text-slate-800 rounded px-2 py-1 border-0 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {familyMembers.map((fam) => (
                  <option key={fam.id} value={fam.id}>
                    {fam.name} ({fam.primaryCategory})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Dropdown */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                aria-label="Language selection"
                className="bg-transparent text-xs font-bold text-slate-700 border-none focus:outline-none cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Readout Button */}
            <button
              onClick={handleVoiceListen}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                speaking
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
              title="Read instructions aloud"
            >
              <Volume2 className="w-4 h-4" />
              <span>{speaking ? t.speaking : t.listen}</span>
            </button>

            <button
              onClick={onToggleLowDataMode}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                lowDataMode ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Reduce network usage and use local AI fallback"
            >
              <span>{lowDataMode ? 'Low Data On' : 'Low Data'}</span>
            </button>

            <button
              onClick={onToggleOfflineDemoMode}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                offlineDemoMode ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Show the low-bandwidth local demo experience"
            >
              <span>{offlineDemoMode ? 'Offline Demo On' : 'Offline Demo'}</span>
            </button>

            {/* Simple Mode Toggle */}
            <button
              onClick={onToggleSimpleMode}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                simpleMode
                  ? 'bg-amber-600 text-white border-amber-700 shadow'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.simpleMode}</span>
              <span className={`w-2 h-2 rounded-full ${simpleMode ? 'bg-white' : 'bg-slate-300'}`} />
            </button>

            {/* Sign Out / Switch Account Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 transition-colors shadow-sm"
                title="Sign out and return to Login Screen"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

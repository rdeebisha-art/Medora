import React, { useState, useRef, useEffect } from 'react';
import {
  PhoneCall,
  Volume2,
  Globe,
  Heart,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Pill,
  KeyRound,
  Shield,
  LogOut,
  ChevronDown,
  Stethoscope,
  Users,
  Home,
  Menu,
  MessageSquare,
} from 'lucide-react';
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
  isMoreMenuOpen?: boolean;
  setIsMoreMenuOpen?: (open: boolean) => void;
  onOpenUSSD?: () => void;
  onOpenVoiceIVR?: () => void;
  onOpenVoiceMessage?: () => void;
  onOpenBluetooth?: () => void;
  onOpenHelp?: () => void;
  onOpenDoctorChat?: () => void;
  onOpenCommunicationCenter?: () => void;
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
  isMoreMenuOpen: externalMoreOpen,
  setIsMoreMenuOpen: externalSetMoreOpen,
  onOpenUSSD,
  onOpenVoiceIVR,
  onOpenVoiceMessage,
  onOpenBluetooth,
  onOpenHelp,
  onOpenDoctorChat,
  onOpenCommunicationCenter,
}) => {
  const [internalMoreOpen, setInternalMoreOpen] = useState(false);
  const isMoreOpen = externalMoreOpen !== undefined ? externalMoreOpen : internalMoreOpen;
  const setMoreOpen = externalSetMoreOpen || setInternalMoreOpen;

  const [speaking, setSpeaking] = useState(false);
  const t = TRANSLATIONS[currentLang];
  const activeMember = familyMembers.find((m) => m.id === selectedFamilyId) || familyMembers[0];
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [setMoreOpen]);

  const handleVoiceListen = () => {
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }

    const narrationText = `${t.appName} - ${t.tagline}. Selected patient: ${activeMember.name}.`;
    voiceService.speak(
      narrationText,
      currentLang,
      () => setSpeaking(true),
      () => setSpeaking(false)
    );
  };

  const languages: { code: LanguageCode; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'à¤¹à¤¿à¤¨à¥à¤¦à¥€' },
    { code: 'te', label: 'Telugu', nativeLabel: 'à°¤à±†à°²à±à°—à±' },
    { code: 'ta', label: 'Tamil', nativeLabel: 'à®¤à®®à®¿à®´à¯' },
    { code: 'ml', label: 'Malayalam', nativeLabel: 'à´®à´²à´¯à´¾à´³à´‚' },
    { code: 'kn', label: 'Kannada', nativeLabel: 'à²•à²¨à³à²¨à²¡' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Universal Emergency Bar */}
      <div className="bg-red-600 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm font-medium">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 animate-pulse text-amber-300 shrink-0" />
          <span>Rural Medical Emergency? Dial <strong className="font-black">108</strong> (Ambulance) or <strong className="font-black">112</strong> (National) immediately.</span>
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
            className="bg-white text-red-700 hover:bg-red-50 font-black px-3.5 py-1 rounded-full text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>{t.emergencyHelp}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-200 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    MEDORA
                  </h1>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-extrabold px-2 py-0.5 rounded-full border border-teal-300 uppercase">
                    Rural Health
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold hidden sm:block">
                  {t.tagline}
                </p>
              </div>
            </div>

            {/* Selected Patient Pill in Top Bar */}
            <div className="hidden xl:flex items-center bg-teal-50 border border-teal-200 rounded-2xl px-3 py-1 text-xs">
              <span className="text-teal-700 font-bold mr-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Active:
              </span>
              <select
                value={selectedFamilyId}
                onChange={(e) => onSelectFamilyMember(e.target.value)}
                className="bg-transparent font-black text-teal-900 cursor-pointer focus:outline-none"
              >
                {familyMembers.map((fam) => (
                  <option key={fam.id} value={fam.id}>
                    {fam.name} ({fam.primaryCategory})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STREAMLINED PRIMARY NAVIGATION (6 Core Tabs on Desktop) */}
          {!simpleMode && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                onClick={() => onSelectTab('reports')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'reports'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>My Health</span>
              </button>

              <button
                onClick={() => onSelectTab('family')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'family' || activeTab === 'family-select'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Family</span>
              </button>

              <button
                onClick={() => onSelectTab('medicine')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'medicine'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Medicines</span>
              </button>

              <button
                onClick={() => onSelectTab('ai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'ai'
                    ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-300'
                    : 'bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                <span>Ask Medora</span>
              </button>

              <button
                onClick={() => onSelectTab('doctors')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'doctors'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor</span>
              </button>

              {onOpenCommunicationCenter && (
                <button
                  onClick={onOpenCommunicationCenter}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200/80 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                  <span>ðŸ“¬ Messages & Share</span>
                </button>
              )}

              {/* CLEAN "MORE â–¾" DROPDOWN MENU */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setMoreOpen(!isMoreOpen)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                    isMoreOpen || activeTab === 'admin'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <Menu className="w-3.5 h-3.5" />
                  <span>More</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isMoreOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Account &amp; Settings
                    </div>
                    <button
                      onClick={() => setMoreOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      âš™ï¸ Settings
                    </button>
                    <button
                      onClick={() => setMoreOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      ðŸ‘¤ My Account
                    </button>
                    <div className="border-t border-slate-100 my-1 pt-1">
                      <div className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Information
                      </div>
                      <button
                        onClick={() => setMoreOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        ðŸ”’ Privacy Policy
                      </button>
                      <button
                        onClick={() => setMoreOpen(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        â„¹ï¸ About Medora
                      </button>
                      {onOpenHelp && (
                        <button
                          onClick={() => { onOpenHelp(); setMoreOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 flex items-center gap-2"
                        >
                          â“ Help &amp; FAQ
                        </button>
                      )}
                    </div>
                    {activeRole === 'admin' && (
                      <div className="border-t border-slate-100 my-1 pt-1">
                        <button
                          onClick={() => { onSelectTab('admin'); setMoreOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2"
                        >
                          <Shield className="w-3.5 h-3.5 text-emerald-700" />
                          ðŸ›ï¸ Village Admin Panel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Right Controls: Native Language Selector, Voice & Simple Mode */}
          <div className="flex items-center gap-2">
            {/* Native Language Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-2xl px-2.5 py-1 text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                aria-label="Language selection"
                className="bg-transparent text-slate-800 font-extrabold cursor-pointer focus:outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeLabel} ({lang.label})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice Listen Button */}
            <button
              onClick={handleVoiceListen}
              className={`hidden lg:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-2xl border transition-all ${
                speaking
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
              }`}
              title="Read page summary aloud"
            >
              <Volume2 className="w-4 h-4" />
              <span>{speaking ? t.speaking : t.listen}</span>
            </button>

            {/* Simple Mode Toggle */}
            <button
              onClick={onToggleSimpleMode}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-2xl border transition-all ${
                simpleMode
                  ? 'bg-amber-500 text-white border-amber-600 shadow'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.simpleMode}</span>
            </button>

            {/* Sign Out Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-2xl border border-slate-300 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 transition-colors shadow-sm"
                title="Sign out"
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

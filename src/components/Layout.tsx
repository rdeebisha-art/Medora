import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import {
  Home, Heart, Users, Mic, MoreHorizontal, X, Wifi, WifiOff,
  Globe, LogOut, User, Settings, HelpCircle, BookOpen, LogIn, ChevronDown, PhoneCall
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import EmergencyOverlay from './EmergencyOverlay';
import ConnectivityStatusIndicator from './ConnectivityStatusIndicator';
import { ActiveCallModal } from './ActiveCallModal';
import { MedoraSearchBar } from './MedoraSearchBar';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English', native: 'English' },
  { code: 'ta', label: 'த', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'తె', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'മ', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'kn', label: 'ಕ', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'हि', name: 'Hindi', native: 'हिन्दी' }
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isOffline,
    is2GMode,
    isSimpleMode,
    currentUser,
    language,
    setLanguage,
    toggle2GMode,
    toggleSimpleMode,
    logout,
    activeDirectCall,
    endDirectCall,
    setVoiceNavOpen,
  } = useAppStore();

  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMoreDrawerOpen(false);
  };

  // Mobile Bottom Navigation items (Strictly 5 items)
  const navItems = [
    { path: '/dashboard', icon: <Home size={20} />, label: t('nav.home') },
    { path: '/health', icon: <Heart size={20} />, label: t('nav.myHealth') },
    { path: '/family', icon: <Users size={20} />, label: t('nav.family') },
    { path: '/ai', icon: <Mic size={20} />, label: t('ai.speak') },
    {
      path: '#more',
      icon: <MoreHorizontal size={20} />,
      label: t('nav.more'),
      action: () => setMoreDrawerOpen(true)
    }
  ];

  const showBack = location.pathname !== '/dashboard';

  return (
    <div className={`min-h-screen flex flex-col bg-transparent text-[#0F172A] overflow-x-hidden ${is2GMode ? 'text-base' : ''} ${isSimpleMode ? 'text-lg' : ''}`}>
      <ConnectivityStatusIndicator />

      <header className="bg-[#0F766E] text-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Tagline */}
          <Link to="/dashboard" className="flex items-center gap-2 group min-w-0 flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-teal-950 font-black text-lg sm:text-xl flex items-center justify-center shadow-sm flex-shrink-0">
              +
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-black tracking-tight leading-none group-hover:text-teal-200 transition-colors truncate">
                MEDORA
              </div>
              <div className="text-[10px] text-teal-200/90 font-medium mt-0.5 tracking-wide hidden md:block truncate">
                {t('app.tagline')}
              </div>
            </div>
          </Link>

          {/* Central Universal Search Bar (Desktop & Tablet) */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block relative">
            <MedoraSearchBar variant="header" />
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Connectivity Pill */}
            <div
              className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
                isOffline ? 'bg-white/15 text-white border border-white/30' : 'bg-white/20 text-white border border-white/30'
              }`}
              title={isOffline ? t('common.offline') : t('common.online')}
            >
              {isOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
              <span className="hidden sm:inline">{isOffline ? `🔴 ${t('common.offline')}` : `🟢 ${t('common.online')}`}</span>
            </div>

            {/* 2G Toggle */}
            <button
              onClick={toggle2GMode}
              className={`text-[10px] px-2 py-1 rounded-xl border font-bold transition-all min-h-[32px] sm:min-h-[36px] ${
                is2GMode ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm' : 'bg-teal-900/60 border-teal-600/50 text-teal-200 hover:bg-teal-700'
              }`}
              title="Toggle Ultra Low-Bandwidth Mode"
            >
              2G {is2GMode ? 'ON' : 'OFF'}
            </button>

            {/* Voice Navigation Button */}
            <button
              type="button"
              onClick={() => setVoiceNavOpen(true)}
              className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[32px] sm:min-h-[36px]"
              title="Voice Navigation (Multilingual & Offline)"
              aria-label="Voice Navigation"
            >
              <Mic size={14} className="animate-pulse text-emerald-200" />
              <span className="hidden sm:inline">Voice Nav</span>
            </button>

            {/* Language Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 bg-teal-900/80 hover:bg-teal-700 border border-teal-600/50 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold text-teal-100 transition-colors min-h-[32px] sm:min-h-[36px]"
              >
                <Globe size={13} className="text-teal-300" />
                <span>{LANGUAGES.find((l) => l.code === language)?.label || 'EN'}</span>
                <ChevronDown size={11} className="opacity-70" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white text-slate-800 rounded-2xl shadow-2xl z-50 min-w-[150px] overflow-hidden border border-slate-200">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {t('common.interfaceLanguage')}
                  </div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-teal-50 flex items-center justify-between transition-colors min-h-10 ${
                        language === l.code ? 'bg-teal-50 font-bold text-teal-800' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{l.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Profile Avatar / More Toggle */}
            <button
              onClick={() => setMoreDrawerOpen(true)}
              className="w-8 h-8 rounded-full bg-teal-700 hover:bg-teal-600 border border-teal-500/50 flex items-center justify-center text-xs font-bold text-teal-100 transition-colors min-h-[32px] min-w-[32px]"
              title="More Menu"
            >
              {currentUser?.name ? currentUser.name[0].toUpperCase() : <User size={15} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row (Mobile only - always visible on smaller screens) */}
        <div className="sm:hidden mt-2 pt-1 border-t border-teal-600/30">
          <MedoraSearchBar variant="mobile" />
        </div>
      </header>

      {/* Backdrop overlay for language dropdown */}
      {langDropdownOpen && <div className="fixed inset-0 z-30" onClick={() => setLangDropdownOpen(false)} />}

      {/* STRICTLY MINIMAL "MORE" MENU DRAWER */}
      {moreDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMoreDrawerOpen(false)} />

          {/* Drawer Body */}
          <div className="relative bg-white w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-10">
            {/* Drawer Header */}
            <div className="bg-gradient-to-br from-teal-800 to-teal-900 text-white p-5 flex items-center justify-between border-b border-teal-700">
              <div>
                <div className="font-extrabold text-base tracking-tight">{t('common.accountOptions')}</div>
                {currentUser ? (
                  <div className="text-xs text-teal-200 mt-0.5">
                    {currentUser.name} ({currentUser.role})
                  </div>
                ) : (
                  <div className="text-xs text-teal-300 opacity-80">{t('common.guestSession')}</div>
                )}
              </div>
              <button
                onClick={() => setMoreDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Simple Mode Toggle in More Menu */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">{t('common.simpleMode')}</span>
                <span className="text-[10px] text-slate-500">{t('common.simpleModeDesc')}</span>
              </div>
              <button
                onClick={toggleSimpleMode}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isSimpleMode ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isSimpleMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* STRICTLY MINIMAL LIST: ONLY Profile, Settings, FAQ, Help, Login, Sign Out */}
            <nav className="flex-1 py-3 px-3 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setMoreDrawerOpen(false);
                  setVoiceNavOpen(true);
                }}
                className="w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
              >
                <Mic size={16} className="text-emerald-700 animate-pulse" />
                <span>🎤 Voice Navigation</span>
              </button>

              <Link
                to="/call-history"
                onClick={() => setMoreDrawerOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  location.pathname === '/call-history'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <PhoneCall size={16} className="text-teal-600" />
                <span>Call History</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setMoreDrawerOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  location.pathname === '/profile'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <User size={16} className="text-teal-600" />
                <span>1. {t('common.profile')}</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setMoreDrawerOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  location.pathname === '/settings'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Settings size={16} className="text-teal-600" />
                <span>2. {t('nav.settings')}</span>
              </Link>

              <Link
                to="/faq"
                onClick={() => setMoreDrawerOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  location.pathname === '/faq'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <HelpCircle size={16} className="text-teal-600" />
                <span>3. FAQ</span>
              </Link>

              <Link
                to="/help"
                onClick={() => setMoreDrawerOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  location.pathname === '/help'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen size={16} className="text-teal-600" />
                <span>4. {t('nav.help', 'Help')}</span>
              </Link>

              {!currentUser ? (
                <Link
                  to="/login"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <LogIn size={16} className="text-teal-600" />
                  <span>5. {t('auth.login')}</span>
                </Link>
              ) : null}
            </nav>

            {/* Footer / Sign Out */}
            {currentUser && (
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors"
                >
                  <LogOut size={14} />
                  <span>6. {t('common.signOut')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROMINENT, HIGH-VISIBILITY BACK BUTTON AT TOP OF EVERY PAGE */}
      <div className="px-3 sm:px-4 md:px-6 pt-3 pb-1 max-w-7xl mx-auto w-full flex items-center justify-between no-print">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1 && location.pathname !== '/dashboard') {
              navigate(-1);
            } else {
              navigate('/dashboard');
            }
          }}
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white text-teal-950 border-2 border-teal-700 shadow-md hover:bg-teal-50 hover:border-teal-800 hover:shadow-lg active:scale-95 transition-all font-black text-xs sm:text-sm min-h-[44px] group"
          aria-label="Back"
          title="Back to Previous Page"
        >
          <span className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-sm group-hover:-translate-x-0.5 transition-transform shadow-xs">
            ←
          </span>
          <span className="tracking-wider uppercase font-black">BACK</span>
        </button>

        <div className="text-[11px] font-bold text-teal-900 bg-teal-50/90 border border-teal-300 px-3 py-1.5 rounded-full capitalize shadow-xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span>{location.pathname.replace('/', '').replace(/-/g, ' ') || 'Dashboard'}</span>
        </div>
      </div>

      <main className={`flex-1 pb-28 sm:pb-32 w-full max-w-7xl mx-auto min-w-0 break-words ${isSimpleMode ? 'text-lg' : ''}`}>
        {children}
      </main>

      {/* Global In-Browser Direct Voice Call Modal */}
      {activeDirectCall && (
        <ActiveCallModal callInfo={activeDirectCall} onClose={endDirectCall} />
      )}

      <button
        onClick={() => setEmergencyOpen(true)}
        className="fixed bottom-[72px] sm:bottom-[76px] right-3 sm:right-4 md:right-6 z-40 min-h-12 sm:min-h-14 px-3.5 sm:px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all border-2 border-[#FEF2F2]"
        title={t('nav.emergency')}
      >
        <span className="text-lg sm:text-xl">🚨</span>
        <span className="text-xs font-black pr-0.5">{t('nav.emergency')}</span>
      </button>

      {emergencyOpen && <EmergencyOverlay onClose={() => setEmergencyOpen(false)} />}

      {/* In-Browser Direct Web Call Modal (No external phone dialer redirect) */}
      {activeDirectCall && (
        <ActiveCallModal callInfo={activeDirectCall} onClose={endDirectCall} />
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] z-40 shadow-lg py-1 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-around px-1">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path && !item.action;
            return (
              <button
                key={i}
                onClick={() => {
                  if (item.action) item.action();
                  else navigate(item.path);
                }}
                className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] sm:text-[11px] gap-0.5 min-h-[48px] min-w-0 transition-colors ${
                  isActive ? 'text-[#0F766E] font-bold' : 'text-[#475569]'
                }`}
              >
                <div className={isActive ? 'p-1 rounded-xl bg-[#F0FDFA]' : 'p-1'}>{item.icon}</div>
                <span className="truncate max-w-full px-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

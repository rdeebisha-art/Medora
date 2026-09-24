import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import {
  Home, Heart, Users, Mic, MoreHorizontal, X, Bell, Wifi, WifiOff,
  Globe, LogOut, User, Settings, HelpCircle, BookOpen, LogIn, ChevronDown
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import EmergencyOverlay from './EmergencyOverlay';

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
    logout
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
    <div className={`min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] ${is2GMode ? 'text-base' : ''} ${isSimpleMode ? 'text-lg' : ''}`}>
      {isOffline && (
        <div className="bg-[#D97706] text-white text-center py-1.5 px-4 text-xs font-bold sticky top-0 z-50 flex items-center justify-center gap-1.5 shadow-sm">
          <WifiOff size={13} />
          <span>🔴 {t('common.offline')} · All local health records & offline voice are available</span>
        </div>
      )}

      <header className="bg-[#0F766E] text-white px-4 py-3 shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo & Tagline */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-teal-950 font-black text-xl flex items-center justify-center shadow-sm">
              +
            </div>
            <div>
              <div className="text-lg font-black tracking-tight leading-none group-hover:text-teal-200 transition-colors">
                MEDORA
              </div>
              <div className="text-[10px] text-teal-200/90 font-medium mt-0.5 tracking-wide">
                Rural Health Companion
              </div>
            </div>
          </Link>

          {/* Header Controls */}
          <div className="flex items-center gap-2">
            {/* Connectivity Pill */}
            <div
              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isOffline ? 'bg-white/15 text-white border border-white/30' : 'bg-white/20 text-white border border-white/30'
              }`}
              title={isOffline ? t('common.offline') : t('common.online')}
            >
              {isOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
              <span>{isOffline ? `🔴 ${t('common.offline')}` : `🟢 ${t('common.online')}`}</span>
            </div>

            {/* 2G Toggle */}
            <button
              onClick={toggle2GMode}
              className={`text-[10px] px-2 py-1 rounded-xl border font-bold transition-all ${
                is2GMode ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm' : 'bg-teal-900/60 border-teal-600/50 text-teal-200 hover:bg-teal-700'
              }`}
              title="Toggle Ultra Low-Bandwidth Mode"
            >
              2G {is2GMode ? 'ON' : 'OFF'}
            </button>

            {/* Language Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 bg-teal-900/80 hover:bg-teal-700 border border-teal-600/50 px-2.5 py-1 rounded-xl text-xs font-bold text-teal-100 transition-colors"
              >
                <Globe size={13} className="text-teal-300" />
                <span>{LANGUAGES.find((l) => l.code === language)?.label || 'EN'}</span>
                <ChevronDown size={11} className="opacity-70" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white text-slate-800 rounded-2xl shadow-2xl z-50 min-w-[150px] overflow-hidden border border-slate-200">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Interface Language
                  </div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-teal-50 flex items-center justify-between transition-colors ${
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
              className="w-8 h-8 rounded-full bg-teal-700 hover:bg-teal-600 border border-teal-500/50 flex items-center justify-center text-xs font-bold text-teal-100 transition-colors"
              title="More Menu"
            >
              {currentUser?.name ? currentUser.name[0].toUpperCase() : <User size={15} />}
            </button>
          </div>
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
                <div className="font-extrabold text-base tracking-tight">Account & Options</div>
                {currentUser ? (
                  <div className="text-xs text-teal-200 mt-0.5">
                    {currentUser.name} ({currentUser.role})
                  </div>
                ) : (
                  <div className="text-xs text-teal-300 opacity-80">Guest Session</div>
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
                <span className="text-xs font-bold text-slate-800 block">Simple Mode</span>
                <span className="text-[10px] text-slate-500">Large touch targets & voice-first UI</span>
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
                <span>1. Profile</span>
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
                <span>2. Settings</span>
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
                <span>4. Help</span>
              </Link>

              {!currentUser ? (
                <Link
                  to="/login"
                  onClick={() => setMoreDrawerOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <LogIn size={16} className="text-teal-600" />
                  <span>5. Login</span>
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
                  <span>6. Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showBack && (
        <div className="px-4 pt-3 max-w-4xl mx-auto w-full">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 min-h-11 text-[#0F766E] font-bold text-sm"
          >
            ← {t('common.back')}
          </button>
        </div>
      )}

      <main className={`flex-1 pb-24 ${isSimpleMode ? 'text-lg' : ''}`}>{children}</main>

      <button
        onClick={() => setEmergencyOpen(true)}
        className="fixed bottom-[76px] right-3 z-40 min-h-14 px-3.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all border-2 border-[#FEF2F2]"
        title={t('nav.emergency')}
      >
        <span className="text-xl">🚨</span>
        <span className="text-xs font-black pr-1">{t('nav.emergency')}</span>
      </button>

      {emergencyOpen && <EmergencyOverlay onClose={() => setEmergencyOpen(false)} />}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex items-center justify-around z-40 shadow-lg py-1.5 no-print">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path && !item.action;
          return (
            <button
              key={i}
              onClick={() => {
                if (item.action) item.action();
                else navigate(item.path);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] gap-0.5 min-h-12 transition-colors ${
                isActive ? 'text-[#0F766E] font-bold' : 'text-[#475569]'
              }`}
            >
              <div className={isActive ? 'p-1 rounded-xl bg-[#F0FDFA]' : 'p-1'}>{item.icon}</div>
              <span className="truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

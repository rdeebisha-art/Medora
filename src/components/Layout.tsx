import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import {
  Home, Heart, Bot, AlertTriangle, Menu, X, Bell, Wifi, WifiOff,
  Globe, LogOut, Zap, User, ChevronDown
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हि', name: 'हिन्दी' },
  { code: 'ta', label: 'த', name: 'தமிழ்' },
  { code: 'te', label: 'తె', name: 'తెలుగు' },
  { code: 'kn', label: 'ಕ', name: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മ', name: 'മലയാളം' },
];

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOffline, is2GMode, isSimpleMode, currentUser, language, setLanguage, toggle2GMode, toggleSimpleMode, logout } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };

  const navItems = [
    { path: '/dashboard', icon: <Home size={20} />, label: t('nav.home') },
    { path: '/health', icon: <Heart size={20} />, label: t('nav.myHealth') },
    { path: '/ai', icon: <Bot size={20} />, label: 'AI' },
    { path: '/emergency', icon: <AlertTriangle size={20} />, label: t('nav.emergency') },
    { path: '/dashboard', icon: <Menu size={20} />, label: t('nav.more'), action: () => setMenuOpen(true) },
  ];

  const drawerLinks = [
    { path: '/health', label: '🩺 ' + t('nav.myHealth') },
    { path: '/family', label: '👪 ' + t('nav.family') },
    { path: '/medicines', label: '💊 ' + t('nav.medicines') },
    { path: '/records', label: '📋 ' + t('nav.records') },
    { path: '/health-tests', label: '🧪 Health Tests' },
    { path: '/vaccination', label: '💉 ' + t('nav.schemes').replace('Schemes','') + 'Vaccination' },
    { path: '/maternity', label: '🤰 Maternity Care' },
    { path: '/newborn', label: '🍼 Newborn Care' },
    { path: '/childcare', label: '👶 Child Care' },
    { path: '/elderly', label: '👴 Elderly Care' },
    { path: '/ai', label: '🤖 Ask Medora AI' },
    { path: '/hospitals', label: '🏥 ' + t('nav.hospitals') },
    { path: '/emergency', label: '🚨 ' + t('nav.emergency') },
    { path: '/transport', label: '🚑 Transport' },
    { path: '/schemes', label: '🏛️ ' + t('nav.schemes') },
    { path: '/education', label: '📚 ' + t('nav.education') },
    { path: '/sms', label: '📱 SMS Center' },
    { path: '/ivr', label: '☎️ Voice Helpline' },
    { path: '/ussd', label: '🔢 Basic Phone' },
    { path: '/village', label: '🏘️ ' + t('nav.village') },
    { path: '/doctor-summary', label: '📄 Doctor Summary' },
    { path: '/report-scanner', label: '📷 Report Scanner' },
    { path: '/xray-viewer', label: '🩻 X-Ray Viewer' },
    { path: '/sync', label: '🔄 ' + t('nav.sync') },
    { path: '/notifications', label: '🔔 ' + t('nav.notifications') },
    ...(currentUser?.role === 'doctor' ? [{ path: '/doctor-portal', label: '👨‍⚕️ Doctor Portal' }] : []),
    ...(currentUser?.role === 'admin' ? [{ path: '/admin-portal', label: '🔑 Admin Portal' }] : []),
  ];

  return (
    <div className={`min-h-screen flex flex-col ${is2GMode ? 'text-base' : ''}`}>
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-red-600 text-white text-center py-1.5 px-4 text-sm font-medium sticky top-0 z-50 flex items-center justify-center gap-2">
          <WifiOff size={14} />
          {t('offline.message')}
        </div>
      )}

      {/* Header */}
      <header className="bg-sky-600 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-wide">
          <span className="text-2xl">🏥</span>
          <div>
            <div className="text-xl font-black leading-none">MEDORA</div>
            <div className="text-xs font-normal opacity-80">{t('app.tagline')}</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Connectivity */}
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`}>
            {isOffline ? <WifiOff size={12} /> : <Wifi size={12} />}
          </span>

          {/* 2G Toggle */}
          <button
            onClick={toggle2GMode}
            className={`text-xs px-2 py-1 rounded-full border border-white/30 font-medium ${is2GMode ? 'bg-yellow-500 text-black' : 'bg-white/20'}`}
            title="Toggle 2G Mode"
          >
            2G {is2GMode ? t('common.on') : t('common.off')}
          </button>

          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-sm font-bold"
            >
              <Globe size={14} />
              {LANGUAGES.find(l => l.code === language)?.label || 'EN'}
              <ChevronDown size={12} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white text-gray-800 rounded-xl shadow-xl z-50 min-w-[140px] overflow-hidden">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-sky-50 flex items-center justify-between ${language === l.code ? 'bg-sky-100 font-bold text-sky-700' : ''}`}
                  >
                    <span>{l.label}</span>
                    <span className="text-xs text-gray-500">{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* Menu button */}
          <button onClick={() => setMenuOpen(true)} className="bg-white/20 p-1.5 rounded-full">
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Slide-out drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative bg-white w-72 max-w-full h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="bg-sky-600 text-white px-4 py-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-lg">MEDORA</div>
                {currentUser && <div className="text-sm opacity-80">{currentUser.name} ({currentUser.role})</div>}
              </div>
              <button onClick={() => setMenuOpen(false)} className="bg-white/20 p-1.5 rounded-full">
                <X size={18} />
              </button>
            </div>

            {/* Simple Mode toggle */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{t('common.simpleMode')}</span>
              <button
                onClick={toggleSimpleMode}
                className={`relative w-12 h-6 rounded-full transition-colors ${isSimpleMode ? 'bg-sky-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isSimpleMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <nav className="flex-1 py-2">
              {drawerLinks.map(link => (
                <Link
                  key={link.path + link.label}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-sky-50 transition-colors ${location.pathname === link.path ? 'bg-sky-50 text-sky-700 font-semibold border-r-4 border-sky-500' : 'text-gray-700'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-t p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-red-600 font-medium py-2 hover:bg-red-50 rounded-lg px-2"
              >
                <LogOut size={18} />
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close lang dropdown */}
      {langOpen && <div className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />}

      {/* Main content */}
      <main className={`flex-1 pb-20 ${isSimpleMode ? 'text-lg' : ''}`}>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around z-40 shadow-lg no-print">
        {navItems.map((item, i) => (
          <button
            key={i}
            onClick={() => { if (item.action) item.action(); else navigate(item.path); }}
            className={`flex flex-col items-center justify-center flex-1 py-2 text-xs gap-0.5 transition-colors ${location.pathname === item.path && !item.action ? 'text-sky-600 font-bold' : 'text-gray-500 hover:text-sky-500'}`}
          >
            {item.icon}
            <span className="truncate max-w-full px-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

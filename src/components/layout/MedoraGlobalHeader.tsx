import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { useWasteStore } from '../../store/useWasteStore';
import {
  Activity,
  Heart,
  Building2,
  Stethoscope,
  Trash2,
  Cpu,
  PhoneCall,
  BarChart3,
  Wifi,
  WifiOff,
  Radio,
  Globe,
  Mic,
  Sparkles,
  ChevronDown,
  User,
  Shield,
  Layers,
  ChevronRight,
  Menu,
  X,
  PlayCircle
} from 'lucide-react';

export const MedoraGlobalHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    currentUser,
    currentRole,
    login,
    isOffline,
    setOffline,
    is2GMode,
    toggle2GMode,
    pendingSyncCount,
    triggerBackgroundSync,
    setVoiceNavOpen
  } = useAppStore();

  const { resetWasteData } = useWasteStore();

  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Available languages
  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' }
  ];

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code);
    useAppStore.getState().setLanguage(code);
    setIsLangOpen(false);
  };

  // Demo roles
  const roles = [
    { id: 1, name: 'Meena Kumar', role: 'patient' as const, label: 'Patient (Maternal)', village: 'Kodaikanal Rural' },
    { id: 1, name: 'Dr. Kavitha S.', role: 'doctor' as const, label: 'Doctor (PHC MO)', village: 'Govt Hospital' },
    { id: 2, name: 'Anitha R. (ANM)', role: 'family' as const, label: 'Healthcare Worker', village: 'Sub-Center' },
    { id: 1, name: 'Admin Murugan', role: 'admin' as const, label: 'Hospital / Waste Admin', village: 'Central Ops' }
  ];

  const handleRoleSelect = (roleUser: typeof roles[0]) => {
    login({
      id: roleUser.id,
      name: roleUser.name,
      role: roleUser.role,
      village: roleUser.village
    });
    setIsRoleOpen(false);
    if (roleUser.role === 'doctor') {
      navigate('/doctor-portal');
    } else if (roleUser.role === 'admin') {
      navigate('/admin-portal');
    } else {
      navigate('/dashboard');
    }
  };

  // Fast Demo Scenarios
  const demoScenarios = [
    {
      title: '🤰 Maternal Health (Week 28)',
      desc: 'Rural pregnant mother, fetal milestones & BP anomaly alerts',
      path: '/maternity'
    },
    {
      title: '👶 Child Care & Vaccination',
      desc: 'Growth chart, pediatric symptom screening & vaccine overdue',
      path: '/childcare'
    },
    {
      title: '👴 Elderly & Chronic Care',
      desc: 'Hypertension & Diabetes tracking with interactive charts',
      path: '/elderly'
    },
    {
      title: '📄 AI Report Analyzer & Scanner',
      desc: 'Upload lab report / X-ray -> AI findings -> Save to record',
      path: '/report-scanner'
    },
    {
      title: '👨‍⚕️ Doctor Dashboard & AI Summary',
      desc: 'Consolidated clinical summary + 1-click prescription sync',
      path: '/doctor-summary'
    },
    {
      title: '♻️ Smart Biomedical Waste Center',
      desc: 'IoT Smart Bins, AI waste classifier, robot fleet & passport',
      path: '/biomedical-waste'
    },
    {
      title: '🤖 A2A Intelligence Orchestrator',
      desc: 'Healthcare & Waste multi-agent live communication network',
      path: '/a2a-simulation'
    },
    {
      title: '🚨 Emergency SOS Workflow',
      desc: '5-step GPS lock, SMS alert, 108 ambulance & PHC dispatch',
      path: '/emergency'
    },
    {
      title: '🚀 Full 22-Step Ecosystem Simulation',
      desc: 'Automated judge walkthrough connecting all 22 steps',
      path: '/demo-scenario'
    }
  ];

  const handleScenarioSelect = (path: string) => {
    setIsScenarioOpen(false);
    navigate(path);
  };

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const p = location.pathname;
    const crumbs = [{ label: 'Medora', path: '/dashboard' }];

    if (p === '/dashboard' || p === '/') return crumbs;
    if (p.startsWith('/health') || p === '/family' || p === '/medicines' || p === '/records') {
      crumbs.push({ label: 'Patient Portal', path: '/health' });
    } else if (p.startsWith('/maternity')) {
      crumbs.push({ label: 'Patient Portal', path: '/health' });
      crumbs.push({ label: 'Maternal Health', path: '/maternity' });
    } else if (p.startsWith('/childcare') || p.startsWith('/vaccination')) {
      crumbs.push({ label: 'Patient Portal', path: '/health' });
      crumbs.push({ label: 'Child Care', path: '/childcare' });
    } else if (p.startsWith('/elderly')) {
      crumbs.push({ label: 'Patient Portal', path: '/health' });
      crumbs.push({ label: 'Elderly & Chronic Care', path: '/elderly' });
    } else if (p.startsWith('/schemes')) {
      crumbs.push({ label: 'Patient Portal', path: '/health' });
      crumbs.push({ label: 'Government Schemes', path: '/schemes' });
    } else if (p.startsWith('/report-scanner') || p.startsWith('/health-tests')) {
      crumbs.push({ label: 'Medical Reports', path: '/report-scanner' });
    } else if (p.startsWith('/doctor-portal') || p.startsWith('/doctor-summary')) {
      crumbs.push({ label: 'Hospital Portal', path: '/doctor-portal' });
      crumbs.push({ label: 'Doctor Dashboard', path: '/doctor-summary' });
    } else if (p.startsWith('/admin-portal')) {
      crumbs.push({ label: 'Hospital Operations', path: '/admin-portal' });
    } else if (p.startsWith('/biomedical-waste') || p.startsWith('/smart-bin') || p.startsWith('/passport') || p.startsWith('/collection')) {
      crumbs.push({ label: 'Hospital Portal', path: '/admin-portal' });
      crumbs.push({ label: 'Biomedical Waste Command Center', path: '/biomedical-waste' });
    } else if (p.startsWith('/a2a-simulation')) {
      crumbs.push({ label: 'A2A Intelligence Center', path: '/a2a-simulation' });
    } else if (p.startsWith('/emergency')) {
      crumbs.push({ label: 'Emergency Center', path: '/emergency' });
    } else if (p.startsWith('/sync')) {
      crumbs.push({ label: 'Sync & 2G Engine', path: '/sync' });
    } else {
      crumbs.push({ label: p.replace('/', '').replace('-', ' ').toUpperCase(), path: p });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: Layers },
    { label: 'Patient Portal', path: '/health', icon: Heart },
    { label: 'Hospital Portal', path: '/admin-portal', icon: Building2 },
    { label: 'Doctor Summary', path: '/doctor-summary', icon: Stethoscope },
    { label: 'Biomedical Waste', path: '/biomedical-waste', icon: Trash2, badge: 'Smart' },
    { label: 'A2A Agents', path: '/a2a-simulation', icon: Cpu, badge: 'AI' },
    { label: 'Emergency SOS', path: '/emergency', icon: PhoneCall, alert: true },
    { label: '22-Step Demo', path: '/demo-scenario', icon: PlayCircle, highlight: true }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/80 text-white shadow-xl">
      {/* Top Banner: SIH 2026 Prototype Notice & Connectivity Toggles */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 px-4 py-1.5 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded text-[11px] border border-teal-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-400" />
            Smart India Hackathon 2026 Prototype
          </span>
          <span className="hidden md:inline text-slate-400">
            Rural Health Continuity & Smart Biomedical Waste Ecosystem
          </span>
        </div>

        {/* Connectivity Mode Controls */}
        <div className="flex items-center gap-2">
          {/* Online / 2G / Offline Toggle */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => {
                setOffline(false);
                if (is2GMode) toggle2GMode();
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                !isOffline && !is2GMode
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full online connectivity with real-time sync"
            >
              <Wifi className="w-3 h-3" />
              Online
            </button>
            <button
              onClick={() => {
                setOffline(false);
                if (!is2GMode) toggle2GMode();
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                !isOffline && is2GMode
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="2G Minimal Bandwidth mode (compresses payload, defers heavy images)"
            >
              <Radio className="w-3 h-3" />
              2G Mode
            </button>
            <button
              onClick={() => setOffline(true)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                isOffline
                  ? 'bg-rose-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Offline-first mode (stores all actions locally in IndexedDB)"
            >
              <WifiOff className="w-3 h-3" />
              Offline
            </button>
          </div>

          {/* Sync Queue Badge & Trigger */}
          <Link
            to="/sync"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded text-[11px] border border-slate-700 transition-colors"
            title="View Offline Priority Sync Queue"
          >
            <Activity className="w-3 h-3 text-teal-400" />
            <span>Sync Queue:</span>
            <span className="bg-teal-500/30 text-teal-300 font-bold px-1.5 rounded-full text-[10px]">
              {pendingSyncCount || 0}
            </span>
          </Link>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Tagline */}
          <Link to="/dashboard" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-transparent">
                  MEDORA
                </span>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-teal-500/30 uppercase tracking-wider">
                  Rural + Waste AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none hidden sm:block">
                Rural Health Continuity & Smart Hospital Operations
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    item.highlight
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30 hover:brightness-110'
                      : item.alert
                      ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/80 border border-rose-700/50'
                      : isActive
                      ? 'bg-slate-800 text-teal-400 border border-teal-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.highlight ? 'text-white animate-spin' : isActive ? 'text-teal-400' : 'text-slate-400'}`} style={item.highlight ? { animationDuration: '8s' } : undefined} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-teal-400/20 text-teal-300 text-[9px] px-1 py-0.2 rounded font-bold uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Judge Demo Fast Scenarios Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsScenarioOpen(!isScenarioOpen);
                  setIsLangOpen(false);
                  setIsRoleOpen(false);
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Judge Scenarios</span>
                <ChevronDown className="w-3 h-3 text-amber-400" />
              </button>

              {isScenarioOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Select Demo Scenario
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Quickly switch between realistic SIH test cases
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-1">
                    {demoScenarios.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleScenarioSelect(s.path)}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors group"
                      >
                        <p className="font-semibold text-slate-200 group-hover:text-teal-300">
                          {s.title}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {s.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Voice Assistant Launcher */}
            <button
              onClick={() => setVoiceNavOpen(true)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-teal-600/20 text-slate-300 hover:text-teal-300 border border-slate-700 transition-colors"
              title="Voice Assistant (Multilingual Speech to Text)"
            >
              <Mic className="w-4 h-4 text-teal-400" />
            </button>

            {/* Multilingual Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsLangOpen(!isLangOpen);
                  setIsScenarioOpen(false);
                  setIsRoleOpen(false);
                }}
                className="flex items-center gap-1 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium"
                title="Change Language"
              >
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="hidden md:inline uppercase font-bold text-[11px]">
                  {i18n.language || 'en'}
                </span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1.5 z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                    Select Language
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                        (i18n.language || 'en') === lang.code
                          ? 'bg-teal-600/30 text-teal-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-slate-400">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsRoleOpen(!isRoleOpen);
                  setIsLangOpen(false);
                  setIsScenarioOpen(false);
                }}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
              >
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden md:inline max-w-[90px] truncate">
                  {currentUser?.name?.split(' ')[0] || 'Meena'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isRoleOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                    <p className="font-bold text-slate-200">Switch Demo Persona</p>
                    <p className="text-[10px] text-slate-400">Test role-based access</p>
                  </div>
                  <div className="space-y-1">
                    {roles.map((r, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRoleSelect(r)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex flex-col transition-colors ${
                          currentUser?.role === r.role && currentUser?.name === r.name
                            ? 'bg-teal-600/30 text-teal-300 font-bold border border-teal-500/40'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-semibold">{r.name}</span>
                        <span className="text-[10px] text-slate-400">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation Bar */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.path + idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-teal-300 font-semibold">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="hover:text-slate-200 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Fast Return to Dashboard Button */}
        {location.pathname !== '/dashboard' && location.pathname !== '/' && (
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-semibold shrink-0 ml-3"
          >
            ← Back to Dashboard
          </Link>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 text-sm animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium"
                >
                  <Icon className="w-4 h-4 text-teal-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

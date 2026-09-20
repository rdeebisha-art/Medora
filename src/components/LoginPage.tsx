import React, { useState } from 'react';
import { useMedora } from '../context/MedoraContext';
import { UserRole, LanguageCode } from '../types';
import {
  Heart,
  User,
  Users,
  Stethoscope,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Globe,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface LoginPageProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenEmergency: () => void;
}

// Canonical Demo Accounts & Credentials
export const DEMO_CREDENTIALS: Record<
  UserRole,
  {
    role: UserRole;
    title: string;
    personaName: string;
    acceptedUsernames: string[];
    defaultUsername: string;
    password: string;
    targetPatientId: string;
    targetFamilyId: string;
    badgeText: string;
    icon: React.ReactNode;
    colorClasses: string;
    scopeSummary: string;
  }
> = {
  patient: {
    role: 'patient',
    title: 'Villager / Patient',
    personaName: 'Ramesh Kumar (68y, Senior)',
    acceptedUsernames: ['p-1001', 'p1001', 'ramesh', 'abha-9812-4412-8871', '9448100223'],
    defaultUsername: 'P-1001',
    password: 'patient123',
    targetPatientId: 'P-1001',
    targetFamilyId: 'FAM-01',
    badgeText: 'Individual File (P-1001)',
    icon: <User className="w-5 h-5 text-amber-600" />,
    colorClasses: 'border-amber-300 bg-amber-50/70 text-amber-900',
    scopeSummary: 'Isolated view of personal longitudinal records, vitals, daily medicine reminders, and appointment continuity.',
  },
  family: {
    role: 'family',
    title: 'Family / Household Head',
    personaName: 'Kumar Household Head',
    acceptedUsernames: ['fam-01', 'fam01', 'kumar', 'rc-ka-991204', '9448100223'],
    defaultUsername: 'FAM-01',
    password: 'family123',
    targetPatientId: 'P-1001',
    targetFamilyId: 'FAM-01',
    badgeText: 'Household (FAM-01, 4 Members)',
    icon: <Users className="w-5 h-5 text-teal-600" />,
    colorClasses: 'border-teal-300 bg-teal-50/70 text-teal-900',
    scopeSummary: 'Household care navigation. View and toggle between Ramesh, Sunita (maternal), Aarav (child), and Priya (diabetic).',
  },
  doctor: {
    role: 'doctor',
    title: 'Doctor / Clinician',
    personaName: 'Dr. Rajeshwar Patil (MD Geriatrics)',
    acceptedUsernames: ['doc-patil', 'doc-4', 'rajeshwar', 'doctor', 'patil'],
    defaultUsername: 'DOC-PATIL',
    password: 'doctor123',
    targetPatientId: 'P-1001',
    targetFamilyId: 'FAM-01',
    badgeText: 'District Civil Hospital Medical Staff',
    icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
    colorClasses: 'border-blue-300 bg-blue-50/70 text-blue-900',
    scopeSummary: 'Clinician workspace. Cross-village patient search by ID, add clinical notes, review lab/X-ray tests, and generate doctor handoffs.',
  },
  admin: {
    role: 'admin',
    title: 'Village Admin / ASHA',
    personaName: 'Sister Lakshmi Devi (ASHA #4402)',
    acceptedUsernames: ['asha-4402', 'asha4402', 'admin', 'lakshmi', 'anm'],
    defaultUsername: 'ASHA-4402',
    password: 'admin123',
    targetPatientId: 'P-1001',
    targetFamilyId: 'FAM-01',
    badgeText: 'Gram Panchayat Health Registry Desk',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    colorClasses: 'border-emerald-300 bg-emerald-50/70 text-emerald-900',
    scopeSummary: 'Full village population management. Live demographic recalculations, register new villagers (auto P-XXXX), and care gap oversight.',
  },
};

export const LoginPage: React.FC<LoginPageProps> = ({
  currentLang,
  onLanguageChange,
  onOpenEmergency,
}) => {
  const { login } = useMedora();

  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [usernameInput, setUsernameInput] = useState<string>(DEMO_CREDENTIALS.patient.defaultUsername);
  const [passwordInput, setPasswordInput] = useState<string>(DEMO_CREDENTIALS.patient.password);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
  ];

  const handleRoleTabClick = (role: UserRole) => {
    setSelectedRole(role);
    setUsernameInput(DEMO_CREDENTIALS[role].defaultUsername);
    setPasswordInput(DEMO_CREDENTIALS[role].password);
    setErrorMessage(null);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cred = DEMO_CREDENTIALS[selectedRole];
    const cleanUser = usernameInput.trim().toLowerCase();

    // Check if username matches accepted list for selected role
    const isValidUser = cred.acceptedUsernames.some(u => u.toLowerCase() === cleanUser);
    const isValidPass = passwordInput.trim() === cred.password;

    if (!isValidUser) {
      setErrorMessage(`Unrecognized ID for ${cred.title}. Hint: Use "${cred.defaultUsername}"`);
      return;
    }

    if (!isValidPass) {
      setErrorMessage(`Incorrect password for ${cred.title}. Hint: Use "${cred.password}"`);
      return;
    }

    login(cred.role, cred.targetPatientId, cred.targetFamilyId);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const cred = DEMO_CREDENTIALS[role];
    login(cred.role, cred.targetPatientId, cred.targetFamilyId);
  };

  const activeCred = DEMO_CREDENTIALS[selectedRole];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Universal Emergency & Language Bar */}
      <header className="bg-slate-950/80 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-slate-300 hidden sm:inline">
            Rural Emergency? Dial <strong>108</strong> (Ambulance) or <strong>112</strong>.
          </span>
          <span className="text-slate-300 sm:hidden">
            Emergency: <strong>108</strong> / <strong>112</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-bold text-slate-200 border-none focus:outline-none cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenEmergency}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-sm transition-colors"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Emergency (108)</span>
          </button>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row items-center justify-center gap-8 z-10">
        {/* Left Side: Brand Narrative & Quick Reference Card */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <Heart className="w-4 h-4 fill-emerald-400" />
              <span>Rural Health Continuity & Universal Registry</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              MEDORA
              <span className="block text-xl sm:text-2xl font-semibold text-emerald-400 mt-1">
                Rural Healthcare Companion
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              A comprehensive rural health platform connecting villagers, families, visiting doctors, and ASHA health workers with strict ID-based zero-leakage records.
            </p>
          </div>

          {/* Quick Demo Credentials Cheat Sheet Card */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Demo Credentials Reference (Click to Auto-Fill)
              </span>
              <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                TEST ACCOUNTS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Patient */}
              <div
                onClick={() => handleRoleTabClick('patient')}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === 'patient'
                    ? 'border-amber-400 bg-amber-500/10 shadow-sm'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-amber-300 text-xs">
                  <span>👤 Patient Persona</span>
                  <span className="font-mono text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded">P-1001</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">ID: <code className="text-white font-mono">P-1001</code></div>
                <div className="text-[11px] text-slate-300">Pass: <code className="text-amber-200 font-mono">patient123</code></div>
              </div>

              {/* Family */}
              <div
                onClick={() => handleRoleTabClick('family')}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === 'family'
                    ? 'border-teal-400 bg-teal-500/10 shadow-sm'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-teal-300 text-xs">
                  <span>👨‍👩‍👧‍👦 Family Persona</span>
                  <span className="font-mono text-[10px] bg-teal-500/20 px-1.5 py-0.2 rounded">FAM-01</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">ID: <code className="text-white font-mono">FAM-01</code></div>
                <div className="text-[11px] text-slate-300">Pass: <code className="text-teal-200 font-mono">family123</code></div>
              </div>

              {/* Doctor */}
              <div
                onClick={() => handleRoleTabClick('doctor')}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === 'doctor'
                    ? 'border-blue-400 bg-blue-500/10 shadow-sm'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-blue-300 text-xs">
                  <span>🩺 Doctor Persona</span>
                  <span className="font-mono text-[10px] bg-blue-500/20 px-1.5 py-0.2 rounded">Civil Hosp</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">ID: <code className="text-white font-mono">DOC-PATIL</code></div>
                <div className="text-[11px] text-slate-300">Pass: <code className="text-blue-200 font-mono">doctor123</code></div>
              </div>

              {/* Admin */}
              <div
                onClick={() => handleRoleTabClick('admin')}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === 'admin'
                    ? 'border-emerald-400 bg-emerald-500/10 shadow-sm'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-emerald-300 text-xs">
                  <span>🛡️ Village Admin</span>
                  <span className="font-mono text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded">ASHA</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">ID: <code className="text-white font-mono">ASHA-4402</code></div>
                <div className="text-[11px] text-slate-300">Pass: <code className="text-emerald-200 font-mono">admin123</code></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Login Card */}
        <div className="w-full lg:w-1/2 max-w-md bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          {/* Header */}
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-black text-slate-900">Sign In to Medora</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your persona or type your login credentials below.
            </p>
          </div>

          {/* 4 Role Switcher Tabs */}
          <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['patient', 'family', 'doctor', 'admin'] as UserRole[]).map((r) => {
              const isActive = selectedRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleTabClick(r)}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="block text-sm">
                    {r === 'patient' && '👤'}
                    {r === 'family' && '👨‍👩‍👧‍👦'}
                    {r === 'doctor' && '🩺'}
                    {r === 'admin' && '🛡️'}
                  </span>
                  <span className="block text-[10px] mt-0.5 capitalize">{r}</span>
                </button>
              );
            })}
          </div>

          {/* Active Persona Info Pill */}
          <div className={`p-3 rounded-2xl border text-xs space-y-1 ${activeCred.colorClasses}`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                {activeCred.icon}
                <span>{activeCred.personaName}</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                {activeCred.badgeText}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">{activeCred.scopeSummary}</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Manual Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                User ID / Health ID / Ration Card
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder={`e.g. ${activeCred.defaultUsername}`}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password / Security PIN
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full p-2.5 pr-10 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <span>Sign In as {activeCred.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Instant Demo Login Button */}
          <div className="pt-2 border-t border-slate-100 text-center space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              — Quick Evaluator Demo Access —
            </span>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(selectedRole)}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-emerald-700/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>⚡ 1-Click Demo Login as {activeCred.title}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="bg-slate-950/90 border-t border-slate-800 px-4 py-3 text-center text-[11px] text-slate-500 z-10">
        <p>
          MEDORA v2.5 ENTERPRISE • Designed for rural healthcare continuity, ABHA integration, and zero data leakage. All records are simulation demonstrations.
        </p>
      </footer>
    </div>
  );
};

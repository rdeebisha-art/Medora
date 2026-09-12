import React, { useRef } from 'react';
import { CareTiersHeader } from './CareTiersHeader';
import { MedicineReminder } from './MedicineReminder';
import { DiseaseGuide } from './DiseaseGuide';
import { HospitalTransitGuide } from './HospitalTransitGuide';
import { DoctorHandoffChart } from './DoctorHandoffChart';
import { A2AWorkflow } from './A2AWorkflow';
import { SmartReferralTracker } from './SmartReferralTracker';
import { DoctorHandoffSummary } from './DoctorHandoffSummary';
import { HospitalDirectory } from './HospitalDirectory';
import { DoctorDirectory } from './DoctorDirectory';
import { HospitalContactCenter } from './HospitalContactCenter';
import { FamilyHealthSelector } from './FamilyHealthSelector';
import { PersonalizedHealthAnalyzer } from './PersonalizedHealthAnalyzer';
import { PERSONALIZED_PROFILES } from '../data/personalizedProfiles';

import { Doctor, Hospital, Referral, ReferralStatus, Specialization, LanguageCode, FamilyMember, HealthSummaryReport } from '../types';
import { LayoutDashboard, Stethoscope, Building2, Pill, Activity, ShieldCheck, Navigation, ArrowRight, FileText, Bot, Heart, Sparkles, UserCheck, Baby, Footprints, Camera, UploadCloud, PhoneCall, Award } from 'lucide-react';

interface DashboardPageProps {
  doctors: Doctor[];
  hospitals: Hospital[];
  referrals: Referral[];
  activeReferralId: string;
  onSelectActiveReferral: (id: string) => void;
  onUpdateReferralStatus: (id: string, newStatus: ReferralStatus) => void;
  onCreateReferral: (newReferral: Omit<Referral, 'id' | 'createdAt' | 'lastUpdated'>) => void;
  healthSummary: HealthSummaryReport;
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  onSelectFamilyMember: (id: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectHospital: (hospital: Hospital) => void;
  onOpenDirections: (hospital: Hospital) => void;
  onConnectDoctorToReferral: (doctor: Doctor) => void;
  onSelectHospitalForReferral: (hospital: Hospital) => void;
  onOpenEmergency: () => void;
  onShowToast?: (msg: string) => void;
  onNavigateToAI?: () => void;
  onNavigateToChildren?: () => void;
  onNavigateToMaternity?: () => void;
  onNavigateToElderly?: () => void;
  onNavigateToDiseases?: () => void;
  onNavigateToCameraScanner?: () => void;
  onNavigateToReportScanner?: () => void;
  onNavigateToHospitalPortal?: () => void;
  onNavigateToGovtSchemes?: () => void;
  onNavigateToEmergencyMap?: () => void;
  onNavigateToA2A?: () => void;
  onNavigateToDoctorSummary?: () => void;
  onOpenAddReportModal?: () => void;
  currentLang: LanguageCode;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  doctors,
  hospitals,
  referrals,
  activeReferralId,
  onSelectActiveReferral,
  onUpdateReferralStatus,
  onCreateReferral,
  healthSummary,
  familyMembers,
  selectedFamilyId,
  onSelectFamilyMember,
  onSelectDoctor,
  onSelectHospital,
  onOpenDirections,
  onConnectDoctorToReferral,
  onSelectHospitalForReferral,
  onOpenEmergency,
  onShowToast,
  onNavigateToAI,
  onNavigateToChildren,
  onNavigateToMaternity,
  onNavigateToElderly,
  onNavigateToDiseases,
  onNavigateToCameraScanner,
  onNavigateToReportScanner,
  onNavigateToHospitalPortal,
  onNavigateToGovtSchemes,
  onNavigateToEmergencyMap,
  onNavigateToA2A,
  onNavigateToDoctorSummary,
  onOpenAddReportModal,
  currentLang,
}) => {
  // Section Scroll Anchors
  const careTiersRef = useRef<HTMLDivElement>(null);
  const transitRef = useRef<HTMLDivElement>(null);
  const medsRef = useRef<HTMLDivElement>(null);
  const graphsRef = useRef<HTMLDivElement>(null);
  const diseaseRef = useRef<HTMLDivElement>(null);
  const a2aRef = useRef<HTMLDivElement>(null);
  const referralsRef = useRef<HTMLDivElement>(null);
  const handoffRef = useRef<HTMLDivElement>(null);
  const hospitalsRef = useRef<HTMLDivElement>(null);
  const doctorsRef = useRef<HTMLDivElement>(null);

  const activePersonalProfile = PERSONALIZED_PROFILES[selectedFamilyId] || PERSONALIZED_PROFILES['fam-1'];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFilterByCategory = (category: Specialization) => {
    scrollToSection(doctorsRef);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Dashboard Master Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-emerald-500/10 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>All-in-One Rural Healthcare Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Village Healthcare Command Center
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Everything villagers need in one place: Individual health assessment, patient goals & checkup timing, medicine reminders, consultation alerts, vulnerable care tiers, condition graphs, hospital transit, and specialist directories.
          </p>

          {/* Quick-Jump Section Navigation Strip */}
          <div className="pt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold mr-1">Jump to:</span>
            <button
              onClick={() => scrollToSection(careTiersRef)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-emerald-300 transition-colors"
            >
              👵 Senior / Maternal / Child
            </button>
            <button
              onClick={() => scrollToSection(transitRef)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-rose-300 transition-colors"
            >
              🚑 Hospital Transit
            </button>
            <button
              onClick={() => scrollToSection(medsRef)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-amber-300 transition-colors"
            >
              💊 Medicine Reminder
            </button>
            <button
              onClick={() => scrollToSection(graphsRef)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-sky-300 transition-colors"
            >
              📈 Health Graphs
            </button>
            <button
              onClick={() => scrollToSection(diseaseRef)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-emerald-300 transition-colors"
            >
              🛡️ Disease Guide
            </button>
            <button
              onClick={() => scrollToSection(a2aRef)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-purple-300 transition-colors"
            >
              🔄 A2A Protocol
            </button>
            <button
              onClick={() => scrollToSection(referralsRef)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-teal-300 transition-colors"
            >
              ➡️ Referrals
            </button>
            <button
              onClick={() => scrollToSection(handoffRef)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-blue-300 transition-colors"
            >
              📋 Doctor Handoff
            </button>
            <button
              onClick={() => scrollToSection(doctorsRef)}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-black transition-colors"
            >
              👨‍⚕️ Doctors Info (Last Page)
            </button>
            {onNavigateToAI && (
              <button
                onClick={onNavigateToAI}
                className="px-2.5 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg font-black transition-colors flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                🤖 Ask Medora AI
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CORE RURAL CARE & AI DIAGNOSTIC HUBS (Dedicated Sections for Villagers) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mb-1">
              Primary Rural Portals
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Village Specialized Health & AI Diagnostic Hubs
            </h2>
          </div>
          {onOpenAddReportModal && (
            <button
              onClick={onOpenAddReportModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <UploadCloud className="w-4 h-4" />
              <span>+ Add New Report for Patient</span>
            </button>
          )}
        </div>

        {/* 4 Dedicated Population Hubs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Children Hub Card */}
          <div
            onClick={onNavigateToChildren}
            className="p-5 rounded-3xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 hover:border-sky-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                👶 Children Care Hub
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Medical history, repeated fevers tracker, safe paracetamol doses by weight, recurrent infections, and UIP immunization calendar.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-sky-700 pt-1">
              <span>Open Children Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Maternity & Newborn Hub Card */}
          <div
            onClick={onNavigateToMaternity}
            className="p-5 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 hover:border-rose-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-rose-700 transition-colors">
                🤰 Maternity & Newborn Hub
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Interactive 40-week trimester scale, 24-week nutrition customizer, hemoglobin (Hb &ge; 11) maintenance, ANC tests, and newborn care.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-rose-700 pt-1">
              <span>Open Maternity Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Elderly Hub Card */}
          <div
            onClick={onNavigateToElderly}
            className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                👵 Elderly Care Hub
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Exact BP numbers, blood sugar levels analysis, unified AI report summary, high fall risk prevention, and diet to avoid/eat.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-amber-800 pt-1">
              <span>Open Elderly Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Diseases Guide Card */}
          <div
            onClick={onNavigateToDiseases}
            className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                🛡️ Rural Diseases Guide
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                High BP, Diabetes, Anemia, Dengue, Malaria, Scabies, TB: early warning signs, home control methods, and safe medicines.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-emerald-800 pt-1">
              <span>Browse All Diseases</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 6 Advanced AI & Hospital Features Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* AI Camera Disease Scanner */}
          <div
            onClick={onNavigateToCameraScanner}
            className="p-5 bg-gradient-to-r from-cyan-950 to-slate-900 text-white rounded-3xl border border-cyan-800/40 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                Camera Vision AI
              </span>
            </div>
            <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
              📷 AI Camera Disease Scanner
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use the phone camera for a preliminary risk assessment of skin rashes, eye redness, and wounds. Professional evaluation is recommended.
            </p>
          </div>

          {/* Medical Report & X-Ray Analyser */}
          <div
            onClick={onNavigateToReportScanner}
            className="p-5 bg-gradient-to-r from-indigo-950 to-slate-900 text-white rounded-3xl border border-indigo-800/40 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 text-slate-950 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                X-Ray & Lab AI
              </span>
            </div>
            <h4 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors">
              🔬 Medical Report & X-Ray Analyser
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scan chest X-rays, CBC blood sheets, and ultrasounds: translates jargon into village words and updates doctor summary to stop expensive repeat scans.
            </p>
          </div>

          {/* Hospital Village Portal */}
          <div
            onClick={onNavigateToHospitalPortal}
            className="p-5 bg-gradient-to-r from-blue-950 to-slate-900 text-white rounded-3xl border border-blue-800/40 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-500 text-slate-950 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-400/20 text-blue-300 border border-blue-400/30">
                Hospital Sync
              </span>
            </div>
            <h4 className="text-base font-black text-white group-hover:text-blue-300 transition-colors">
              🏥 Hospital Portal & Village Registry
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Prototype village profiles and risk signals for authorized professional review. Live hospital integration is not currently claimed.
            </p>
          </div>

          {/* A2A Specialists Workflow */}
          <div
            onClick={onNavigateToA2A}
            className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-purple-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                5 Specialists Deliberation
              </span>
            </div>
            <h4 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition-colors">
              🔄 A2A Multi-Specialist Deliberation
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Specialist AI agents deliberate across domains like a hospital case conference to eliminate drug interactions and finalize simple village reports.
            </p>
          </div>

          {/* Government Health Funding Schemes */}
          <div
            onClick={onNavigateToGovtSchemes}
            className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                ₹5L Free PM-JAY
              </span>
            </div>
            <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
              🏛️ Government Healthcare Schemes
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ayushman Bharat ₹5 Lakh cashless hospital card, Janani Suraksha cash aid, free child defect surgeries, and senior assistive devices.
            </p>
          </div>

          {/* Nearby Hospital Maps & 108 Ambulance */}
          <div
            onClick={onNavigateToEmergencyMap}
            className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-rose-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <Navigation className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                108 Speed-Dial
              </span>
            </div>
            <h4 className="text-base font-black text-slate-900 group-hover:text-rose-700 transition-colors">
              🗺️ Emergency Hotlines & Hospital Maps
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              One-click dial to 108 Ambulance & 112 Police; turn-by-turn road maps, bus route 14 timings, and auto stand numbers for village transit.
            </p>
          </div>
        </div>
      </div>

      {/* 1. SECTION: Care Tiers at Starting (Elderly, Maternity, Child Care) */}
      <div ref={careTiersRef} className="scroll-mt-24 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
          <Heart className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            1. Priority Rural Care Tiers (Starting Section)
          </h2>
        </div>
        <CareTiersHeader
          onSelectCategory={handleFilterByCategory}
          onOpenEmergency={onOpenEmergency}
          currentLang={currentLang}
        />
      </div>

      {/* Family Health Member Quick Switcher */}
      <div className="space-y-3">
        <FamilyHealthSelector
          familyMembers={familyMembers}
          selectedFamilyId={selectedFamilyId}
          onSelectFamilyMember={onSelectFamilyMember}
          onFilterByMemberCategory={(cat) => handleFilterByCategory(cat)}
          onFindHospitalForMember={() => scrollToSection(hospitalsRef)}
          currentLang={currentLang}
        />
      </div>

      {/* 2. SECTION: PERSONALIZED PATIENT HEALTH DETERMINATION, WANTS, CHECKUP & REMINDERS */}
      <div className="space-y-3">
        <PersonalizedHealthAnalyzer
          profile={activePersonalProfile}
          currentLang={currentLang}
          onNavigateToDoctors={() => scrollToSection(doctorsRef)}
          onNavigateToTransit={() => scrollToSection(transitRef)}
          onShowToast={(msg) => {
            if (onShowToast) onShowToast(msg);
          }}
        />
      </div>

      {/* Interactive AI Assistant Guidance Banner */}
      {onNavigateToAI && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-cyan-800/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-3 py-0.5 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Medora AI Health Assistant</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white">
              Have questions about {activePersonalProfile.name}’s medicines, checkup schedule, or symptoms?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ask our multilingual voice AI assistant in Hindi, Telugu, Tamil, Malayalam, Kannada, or English. Instant, non-diagnostic triage and care guidance tailored to your health records.
            </p>
          </div>
          <button
            onClick={onNavigateToAI}
            className="z-10 inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg hover:shadow-cyan-400/30 shrink-0"
          >
            <span>🤖 Talk to AI Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. SECTION: How Can Villagers Go to Hospital Easily & Speed Dial */}
      <div ref={transitRef} className="scroll-mt-24 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
          <Navigation className="w-5 h-5 text-rose-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            2. Hospital Travel, Routes & Immediate Contact
          </h2>
        </div>
        <HospitalTransitGuide
          hospitals={hospitals}
          onOpenDirections={onOpenDirections}
          onOpenEmergency={onOpenEmergency}
          currentLang={currentLang}
        />
      </div>

      {/* 3. SECTION: Daily Medication Reminder */}
      <div ref={medsRef} className="scroll-mt-24 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
          <Pill className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            3. Daily Medication Schedule & Adherence Reminder
          </h2>
        </div>
        <MedicineReminder currentLang={currentLang} />
      </div>

      {/* 4. SECTION: Graphs for the Medicinal Condition */}
      <div ref={graphsRef} className="scroll-mt-24 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
          <Activity className="w-5 h-5 text-sky-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            4. Medicinal Condition & Vital Sign Graphs
          </h2>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <DoctorHandoffChart
            vitalTrends={healthSummary.healthAnalytics.vitalTrends}
            adherenceHistory={healthSummary.healthAnalytics.adherenceHistory}
          />
        </div>
      </div>

      {/* 5. SECTION: Rural Disease Guide & Preventive Measures */}
      <div ref={diseaseRef} className="scroll-mt-24 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            5. Disease Handbook, Warning Signs & Village Prevention
          </h2>
        </div>
        <DiseaseGuide
          onFindSpecialist={handleFilterByCategory}
          currentLang={currentLang}
        />
      </div>

      {/* 6. SECTION: A2A (Agent-to-Agent) Multi-Agent Workflow */}
      <div ref={a2aRef} className="scroll-mt-24 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
          <Bot className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            6. A2A (Agent-to-Agent) Decentralized Continuity Protocol
          </h2>
        </div>
        <A2AWorkflow
          onNavigateToReferral={() => scrollToSection(referralsRef)}
          onNavigateToDoctorHandoff={() => scrollToSection(handoffRef)}
          currentLang={currentLang}
        />
      </div>

      {/* 7. SECTION: Smart Referrals & Follow-Up Tracker */}
      <div ref={referralsRef} className="scroll-mt-24 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
          <ArrowRight className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            7. Smart Referral & Follow-Up Tracking System
          </h2>
        </div>
        <SmartReferralTracker
          referrals={referrals}
          activeReferralId={activeReferralId}
          onSelectActiveReferral={onSelectActiveReferral}
          onUpdateReferralStatus={onUpdateReferralStatus}
          onCreateReferral={onCreateReferral}
          onBrowseDoctorsForSpecialty={(spec) => {
            scrollToSection(doctorsRef);
          }}
          onBrowseHospitals={() => scrollToSection(hospitalsRef)}
          onOpenDoctorHandoff={() => scrollToSection(handoffRef)}
          doctors={doctors}
          hospitals={hospitals}
          familyMembers={familyMembers}
          currentLang={currentLang}
        />
      </div>

      {/* 8. SECTION: Doctor Handoff ("SHARE WITH DOCTOR") */}
      <div ref={handoffRef} className="scroll-mt-24 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            8. Doctor-Ready Clinical Health Summary (Share with Doctor)
          </h2>
        </div>
        <DoctorHandoffSummary
          summary={healthSummary}
          currentLang={currentLang}
        />
      </div>

      {/* 9. SECTION: Hospitals & Healthcare Facilities Directory */}
      <div ref={hospitalsRef} className="scroll-mt-24 space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            9. Healthcare Facilities & Referral Hospitals
          </h2>
        </div>
        <HospitalDirectory
          hospitals={hospitals}
          onSelectHospital={onSelectHospital}
          onViewDoctorsAtHospital={(hospId) => {
            scrollToSection(doctorsRef);
          }}
          onOpenDirections={onOpenDirections}
          onPlanReferralWithHospital={onSelectHospitalForReferral}
          currentLang={currentLang}
          selectedReferralHospitalId={referrals[0]?.selectedHospitalId}
        />

        <div className="pt-4">
          <HospitalContactCenter
            onCallHospitalQuick={() => {
              window.location.href = 'tel:+918029876540';
            }}
            onContactDoctorQuick={() => {
              scrollToSection(doctorsRef);
            }}
            onEmergencySupport={onOpenEmergency}
            onViewReferral={() => scrollToSection(referralsRef)}
            onViewHealthSummary={() => scrollToSection(handoffRef)}
            hospitals={hospitals}
            currentLang={currentLang}
          />
        </div>
      </div>

      {/* 10. SECTION: DOCTOR INFO AT LAST SECTION (As requested: "add the doctor info at last page") */}
      <div ref={doctorsRef} className="scroll-mt-24 space-y-3 pt-6 border-t-4 border-emerald-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-emerald-600" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                FINAL SECTION • MEDICAL SPECIALISTS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                10. Doctors & Medical Specialists Directory (Doctor Info at Last)
              </h2>
            </div>
          </div>
          <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full border border-amber-300">
            DEMO DATA VERIFIED
          </span>
        </div>

        <DoctorDirectory
          doctors={doctors}
          onSelectDoctor={onSelectDoctor}
          onRequestConsultation={onSelectDoctor}
          onConnectToReferral={onConnectDoctorToReferral}
          onViewHospitalById={(hospId) => {
            const h = hospitals.find(x => x.id === hospId);
            if (h) onSelectHospital(h);
          }}
          currentLang={currentLang}
          selectedReferralDoctorId={referrals[0]?.selectedDoctorId}
        />
      </div>
    </div>
  );
};

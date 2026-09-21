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
import { EmergencySoundDetector } from './EmergencySoundDetector';
import { DoctorStatusBanner } from './DoctorStatusBanner';
import { useMedora } from '../context/MedoraContext';
import { PERSONALIZED_PROFILES } from '../data/personalizedProfiles';

import { Doctor, Hospital, Referral, ReferralStatus, Specialization, LanguageCode, FamilyMember, HealthSummaryReport } from '../types';
import {
  Stethoscope,
  Building2,
  Pill,
  Activity,
  ShieldCheck,
  ArrowRight,
  FileText,
  Heart,
  Sparkles,
  UserCheck,
  Baby,
  Footprints,
  Camera,
  UploadCloud,
  PhoneCall,
  Mic,
  SendHorizonal,
  AlertTriangle,
  Users,
  CalendarCheck,
  Award,
} from 'lucide-react';

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
  onOpenWhatShouldIDo?: () => void;
  isSimpleMode?: boolean;
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
  onOpenWhatShouldIDo,
  isSimpleMode,
  currentLang,
}) => {
  const { primaryDoctorStatus, setPrimaryDoctorStatus, selectedPatient } = useMedora();
  const [askAiInput, setAskAiInput] = React.useState('');

  const careTiersRef = useRef<HTMLDivElement>(null);
  const transitRef = useRef<HTMLDivElement>(null);
  const medsRef = useRef<HTMLDivElement>(null);
  const doctorsRef = useRef<HTMLDivElement>(null);

  const activePersonalProfile = PERSONALIZED_PROFILES[selectedFamilyId] || PERSONALIZED_PROFILES['fam-1'];
  const patientVitals = selectedPatient?.vitals?.[0];

  const sys = patientVitals?.bloodPressureSys || 120;
  const dia = patientVitals?.bloodPressureDia || 80;
  const sugar = patientVitals?.bloodSugarFasting || 95;

  const bpStatus = sys >= 140 || dia >= 90 ? '🟡 Monitor' : sys < 90 ? '🟡 Low' : '🟢 Stable';
  const sugarStatus = sugar > 140 ? '🟡 High' : sugar < 70 ? '🟡 Low' : '🟢 Stable';
  const medsStatus = selectedPatient?.medicines?.some((m) => m.status === 'Missed Dosage') ? '🔴 Missed Dose' : '🟢 Up to date';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. SMART DASHBOARD HEADER: Good Morning + Active Items */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <span>👋 Good morning, {selectedPatient?.name?.split(' ')[0] || 'Villager'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Your Health Today
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl leading-relaxed">
              OPEN ➔ UNDERSTAND ➔ CHOOSE ➔ COMPLETE. Essential health notifications for {selectedPatient?.name || 'Patient'}.
            </p>

            {/* Smart Dashboard Active Notifications Widget */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold">
              <div className="bg-amber-500/20 text-amber-200 border border-amber-400/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <span>🟠 Pending Health Test: HbA1c screening recommended</span>
              </div>
              <div className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <span>💊 Medicine Reminder: 2 medicines due today</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {onOpenWhatShouldIDo && (
              <button
                onClick={onOpenWhatShouldIDo}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>❓ WHAT SHOULD I DO?</span>
              </button>
            )}

            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${selectedPatient?.avatarBg || 'bg-emerald-100 text-emerald-800'} flex items-center justify-center text-lg font-black shadow-md border-2 border-white`}>
                {selectedPatient?.name ? selectedPatient.name.charAt(0) : 'P'}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black text-teal-200 block">Active File</span>
                <h3 className="font-extrabold text-sm text-white">{selectedPatient?.name || 'Ramesh Kumar'}</h3>
                <span className="text-[10px] text-teal-100 font-mono block">{selectedPatient?.patientId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY BEGINNER ACTIONS GRID (6 PRIMARY TILES) */}
      <div className="space-y-3">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <span>Primary Actions</span>
          {isSimpleMode && <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded">SIMPLE MODE ACTIVE</span>}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Tile 1: My Health */}
          <button
            onClick={() => {
              medsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-rose-100 text-rose-700 w-fit group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">{isSimpleMode ? 'Your Health Records' : '❤️ My Health'}</h4>
              <p className="text-[11px] text-slate-500 font-medium">Vitals & Summary</p>
            </div>
          </button>

          {/* Tile 2: My Family */}
          <button
            onClick={() => {
              const currentIndex = familyMembers.findIndex((m) => m.id === selectedFamilyId);
              const nextIndex = (currentIndex + 1) % familyMembers.length;
              onSelectFamilyMember(familyMembers[nextIndex].id);
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-teal-100 text-teal-700 w-fit group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">{isSimpleMode ? 'Household Members' : '👨‍👩‍👧 My Family'}</h4>
              <p className="text-[11px] text-slate-500 font-medium">{familyMembers.length} Members</p>
            </div>
          </button>

          {/* Tile 3: My Reports */}
          <button
            onClick={() => {
              if (onNavigateToA2A) onNavigateToA2A();
              else if (onNavigateToReportScanner) onNavigateToReportScanner();
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 w-fit group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">{isSimpleMode ? 'Medical Tests' : '📄 My Reports'}</h4>
              <p className="text-[11px] text-slate-500 font-medium">Scan & Analyze</p>
            </div>
          </button>

          {/* Tile 4: My Medicines */}
          <button
            onClick={() => {
              medsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 w-fit group-hover:scale-110 transition-transform">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">{isSimpleMode ? 'Daily Medicines' : '💊 My Medicines'}</h4>
              <p className="text-[11px] text-slate-500 font-medium">Schedule & Dose</p>
            </div>
          </button>

          {/* Tile 5: My Appointments */}
          <button
            onClick={() => {
              doctorsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 w-fit group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">{isSimpleMode ? 'Doctor Visits' : '📅 Appointments'}</h4>
              <p className="text-[11px] text-slate-500 font-medium">PHC & Doctors</p>
            </div>
          </button>

          {/* Tile 6: Emergency Help */}
          <button
            onClick={onOpenEmergency}
            className="bg-rose-600 text-white p-4 rounded-3xl border border-rose-500 shadow-md hover:shadow-lg transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-white/20 text-white w-fit group-hover:scale-110 transition-transform">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-black text-white text-sm">🚨 Emergency</h4>
              <p className="text-[11px] text-rose-100 font-medium">Dial 108 Free</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. 🚨 EMERGENCY HELP CARD & SOUND DETECTOR */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Large High-Contrast Emergency Help Tile */}
        <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 border-2 border-red-400">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur text-white">
                <PhoneCall className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-200 block">Emergency Dispatch</span>
                <h2 className="text-xl font-black">Need Urgent Medical Help?</h2>
              </div>
            </div>
            <span className="bg-white text-red-700 text-xs font-black px-2.5 py-1 rounded-full">
              24x7 FREE
            </span>
          </div>

          <p className="text-xs text-red-100 leading-relaxed">
            One-touch ambulance dispatch (108), maternal helpline (102), and hospital transit guidance. Large touch button suitable for elderly & rural users.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onOpenEmergency}
              className="flex-1 bg-white hover:bg-red-50 text-red-700 font-black text-sm py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <PhoneCall className="w-5 h-5 text-red-600" />
              <span>GET EMERGENCY HELP (108)</span>
            </button>
          </div>
        </div>

        {/* Acoustic Sound Detector */}
        <EmergencySoundDetector
          onTriggerEmergencyModal={onOpenEmergency}
          patientName={selectedPatient?.name || 'Villager'}
        />
      </div>

      {/* 3. 💬 ASK MEDORA AI HERO CARD */}
      <div className="bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5 border border-cyan-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-3 py-1 rounded-full text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>💬 ASK MEDORA — MASTER AI & A2A AGENTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Tell me what is troubling you.
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100">
              Trained on rural clinical guidelines. Silently consults 13 specialist agents for {selectedPatient?.name}.
            </p>
          </div>

          {onNavigateToAI && (
            <button
              onClick={onNavigateToAI}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95 self-start md:self-center"
            >
              <span>OPEN AI CHAT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Input & Quick Prompts */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-2">
            <input
              type="text"
              value={askAiInput}
              onChange={(e) => setAskAiInput(e.target.value)}
              placeholder={`Ask Medora about ${selectedPatient?.name}'s medicines, fever, BP, or symptoms...`}
              className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-cyan-200 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onNavigateToAI) onNavigateToAI();
              }}
            />
            <button
              onClick={onNavigateToAI}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
            >
              <SendHorizonal className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </div>

          {/* Quick Example Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-cyan-200 font-bold text-[11px]">Quick prompts:</span>
            {[
              'My child has fever',
              'My BP is high',
              'I have a headache',
              'I need help with my medicine',
              'Newborn care advice',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setAskAiInput(prompt);
                  if (onNavigateToAI) onNavigateToAI();
                }}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 text-[11px] font-bold px-3 py-1 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ❤️ HEALTH OVERVIEW & CIRCULAR HEALTH SCORE GAUGE */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Health Overview (2 Columns) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              <span>❤️ Health Overview</span>
            </h3>
            <span className="text-xs font-bold text-slate-500 font-mono">
              P-ID: {selectedPatient?.patientId}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Blood Pressure */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Blood Pressure</span>
              <div className="font-mono text-sm font-extrabold text-slate-900">{sys}/{dia} mmHg</div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {bpStatus}
              </span>
            </div>

            {/* Blood Sugar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Blood Sugar</span>
              <div className="font-mono text-sm font-extrabold text-slate-900">{sugar} mg/dL</div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {sugarStatus}
              </span>
            </div>

            {/* Medicines */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Medicines</span>
              <div className="font-mono text-sm font-extrabold text-slate-900">{selectedPatient?.medicines?.length || 0} active</div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {medsStatus}
              </span>
            </div>

            {/* Appointments */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Appointments</span>
              <div className="font-mono text-sm font-extrabold text-slate-900">1 Scheduled</div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                🔵 Upcoming
              </span>
            </div>
          </div>
        </div>

        {/* Medora Health Score (Circular Widget) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between items-center text-center space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm tracking-wide">
            📊 Medora Health Score
          </h3>

          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray="82, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900">82</span>
              <span className="text-[10px] text-emerald-700 font-bold">Good Progress</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
            Based on medicine adherence (85%), recent vitals stability, and completed ANC/checkups.
          </p>
        </div>
      </div>

      {/* 5. ⚠️ CARE GAP ALERTS */}
      {selectedPatient?.hasCareGap && (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>⚠️ Care Gap Alert — Action Recommended</span>
            </div>
            <span className="bg-amber-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
              NEEDS ATTENTION
            </span>
          </div>

          <div className="text-xs text-amber-950 space-y-1">
            <p className="font-bold text-sm">
              {selectedPatient.careGaps?.[0]?.title || 'Blood pressure screening follow-up due'}
            </p>
            <p className="text-amber-900 leading-relaxed">
              {selectedPatient.careGaps?.[0]?.description || 'Last home screening showed elevated pressure. Schedule physician review.'}
            </p>
          </div>
        </div>
      )}

      {/* 6. 💊 TODAY'S MEDICINES & DOCTOR STATUS BANNER */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MedicineReminder currentLang={currentLang} />
        <DoctorStatusBanner
          status={primaryDoctorStatus}
          onStatusChange={setPrimaryDoctorStatus}
          onSelectDoctor={(docId) => {
            const found = doctors.find((d) => d.id === docId);
            if (found) onSelectDoctor(found);
          }}
        />
      </div>

      {/* 7. 👨‍👩‍👧 FAMILY HEALTH SELECTOR */}
      <FamilyHealthSelector
        familyMembers={familyMembers}
        selectedFamilyId={selectedFamilyId}
        onSelectFamilyMember={onSelectFamilyMember}
        currentLang={currentLang}
      />

      {/* 8. 🧒 🤰 👵 🛡️ POPULATION CARE TIERS GRID */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900">
          Specialized Population Care Hubs
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Children Hub */}
          <div
            onClick={onNavigateToChildren}
            className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 hover:border-purple-400 shadow-sm transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                🧒 Children Care Hub
              </h4>
              <p className="text-xs text-slate-600 mt-1">Growth charts, vaccine schedule, and paracetamol weight-dose calculator.</p>
            </div>
          </div>

          {/* Maternity & Postpartum Hub */}
          <div
            onClick={onNavigateToMaternity}
            className="p-5 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 hover:border-rose-400 shadow-sm transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 group-hover:text-rose-700 transition-colors">
                🤰 Maternity & Postpartum Hub
              </h4>
              <p className="text-xs text-slate-600 mt-1">Trimester timeline, ANC tests, lactation support, and newborn care.</p>
            </div>
          </div>

          {/* Elderly Hub */}
          <div
            onClick={onNavigateToElderly}
            className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-400 shadow-sm transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                👵 Elderly Care Hub
              </h4>
              <p className="text-xs text-slate-600 mt-1">BP tracking, fall risk assessment, polypharmacy alerts, and large-text UI.</p>
            </div>
          </div>

          {/* Rural Diseases Guide */}
          <div
            onClick={onNavigateToDiseases}
            className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 hover:border-emerald-400 shadow-sm transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                🛡️ Rural Disease Guide
              </h4>
              <p className="text-xs text-slate-600 mt-1">Typhoid, Chikungunya, Dengue, TB, Diabetes, and Hypertension early signs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

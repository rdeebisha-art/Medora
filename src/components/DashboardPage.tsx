import React, { useRef, useState } from 'react';
import { MedicineReminder } from './MedicineReminder';
import { DoctorStatusBanner } from './DoctorStatusBanner';
import { FamilyHealthSelector } from './FamilyHealthSelector';
import { EmergencySoundDetector } from './EmergencySoundDetector';
import { useMedora } from '../context/MedoraContext';
import { translateString } from '../i18n/pageTranslator';
import { Doctor, Hospital, Referral, ReferralStatus, LanguageCode, FamilyMember, HealthSummaryReport } from '../types';
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
  PhoneCall,
  SendHorizonal,
  AlertTriangle,
  Users,
  CalendarCheck,
  Clock,
  Send,
  Video,
  MapPin,
  CheckCircle2,
  MessageSquare,
  Mic,
  Smartphone,
  Radio,
  Landmark,
  Bot,
  HelpCircle,
  Share2,
  Compass,
  BookOpen,
  Check,
  Copy,
  Car,
  Bike,
  Bus,
  Bed,
  Phone
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
  onOpenCommunicationCenterForPatient?: (patientId: string) => void;
  onOpenUSSD?: () => void;
  onOpenVoiceIVR?: () => void;
  onOpenHelp?: () => void;
  onOpenDoctorChat?: () => void;
  onOpenCommunicationCenter?: () => void;
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
  onOpenCommunicationCenterForPatient,
  onOpenUSSD,
  onOpenVoiceIVR,
  onOpenHelp,
  onOpenDoctorChat,
  onOpenCommunicationCenter,
  isSimpleMode,
  currentLang,
}) => {
  const { primaryDoctorStatus, setPrimaryDoctorStatus, selectedPatient } = useMedora();
  const [askAiInput, setAskAiInput] = useState('');
  const [locationCaptured, setLocationCaptured] = useState<string | null>(null);
  const [aiTriageResponse, setAiTriageResponse] = useState<any | null>(null);

  const medsRef = useRef<HTMLDivElement>(null);
  const doctorsRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  const patientVitals = selectedPatient?.vitals?.[0];
  const sys = patientVitals?.bloodPressureSys || 120;
  const dia = patientVitals?.bloodPressureDia || 80;
  const sugar = patientVitals?.bloodSugarFasting || 95;

  const bpStatus = sys >= 140 || dia >= 90 ? '🟡 Monitor' : sys < 90 ? '🟡 Low' : '🟢 Stable';
  const sugarStatus = sugar > 140 ? '🟡 High' : sugar < 70 ? '🟡 Low' : '🟢 Stable';
  const medsStatus = selectedPatient?.medicines?.some((m) => m.status === 'Missed Dosage') ? '🔴 Missed Dose' : '🟢 Up to date';

  const handleShareLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `Lat: ${pos.coords.latitude.toFixed(4)}°, Lon: ${pos.coords.longitude.toFixed(4)}° (Rampur Ward 4)`;
          setLocationCaptured(coords);
          if (onShowToast) onShowToast(`GPS Captured: ${coords}`);
        },
        () => {
          const fallback = 'Rampur Village Sub-Center, Ward 4 (GPS: 26.8467° N, 80.9462° E)';
          setLocationCaptured(fallback);
          if (onShowToast) onShowToast('Captured Village Sub-Center Location');
        }
      );
    } else {
      const fallback = 'Rampur Village Sub-Center, Ward 4 (GPS: 26.8467° N, 80.9462° E)';
      setLocationCaptured(fallback);
    }
  };

  const handleRunAiTriage = (inputQuery: string) => {
    const q = inputQuery.toLowerCase().trim();
    if (!q) return;

    let response = {
      association: 'Common Fever / Viral Assessment',
      why: `Reported symptoms (${inputQuery}) match general viral response or seasonal infection patterns in rural settings.`,
      do: 'Drink plenty of boiled water or ORS. Rest adequately and monitor body temperature every 4 hours. Take Paracetamol 500mg if fever exceeds 100.5°F as prescribed.',
      dont: 'Do NOT self-medicate with unprescribed antibiotics or steroids. Avoid heavy exertion or unboiled river water.',
      warning: 'Fever >103°F, severe headache, stiff neck, persistent vomiting, blood in stool, or extreme breathlessness.',
      whenSeek: 'Visit Rampur Primary Health Centre (PHC) immediately if symptoms persist beyond 48 hours or warning signs appear.',
      urgency: 'NEEDS MEDICAL REVIEW',
      urgencyClass: 'bg-amber-100 text-amber-900 border-amber-300'
    };

    if (q.includes('headache') || q.includes('migraine')) {
      response.association = 'Tension Headache vs Migraine Assessment';
      response.why = 'Head pain accompanied by light sensitivity or neck discomfort.';
      response.do = 'Rest in a quiet, dark room. Apply cold compress to forehead and maintain hydration.';
    } else if (q.includes('sugar') || q.includes('diabetes')) {
      response.association = 'Blood Glucose Variation';
      response.why = 'Trembling/sweating points to low sugar, while excessive thirst/urination points to high sugar.';
      response.do = 'If shaking or sweating, take 1 tablespoon sugar in water immediately. If high, review prescribed Metformin dose.';
      response.urgency = 'URGENT';
      response.urgencyClass = 'bg-orange-100 text-orange-900 border-orange-300';
    } else if (q.includes('snake') || q.includes('bite')) {
      response.association = 'Snake Bite / Venom Emergency';
      response.why = 'Fang puncture marks, local swelling, or spreading numbness.';
      response.do = 'Keep person COMPLETELY STILL and CALM. Keep limb below heart level. Reach hospital with Anti-Snake Venom (ASV) immediately.';
      response.dont = 'DO NOT cut, suck wound, or apply tourniquet/herbs.';
      response.warning = 'Difficulty breathing, eyelid drooping, vomiting.';
      response.urgency = 'EMERGENCY';
      response.urgencyClass = 'bg-red-600 text-white font-black animate-pulse';
    }

    setAiTriageResponse(response);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. YOUR HEALTH TODAY (PATIENT PROFILE & HEALTH SUMMARY BANNER) */}
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
              Complete longitudinal rural healthcare dashboard for {selectedPatient?.name || 'Patient'} ({selectedPatient?.patientId || 'P-1001'}).
            </p>

            {/* Active Health Alerts */}
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
                <span className="text-[10px] uppercase font-black text-teal-200 block">Active Record</span>
                <h3 className="font-extrabold text-sm text-white">{selectedPatient?.name || 'Ramesh Kumar'}</h3>
                <span className="text-[10px] text-teal-100 font-mono block">ID: {selectedPatient?.patientId} • Family: {selectedPatient?.familyId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMMUNICATE WITH MEDORA (SMS, USSD, VOICE, VOICE MESSAGE, BLUETOOTH) */}
      <div className="bg-white rounded-3xl p-6 border-2 border-teal-200 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <span>COMMUNICATE WITH MEDORA</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Multi-channel offline-first communication for button phones, smartphones, and low-connectivity.
            </p>
          </div>
          <span className="bg-teal-100 text-teal-900 text-xs font-black px-3 py-1 rounded-full border border-teal-300 self-start sm:self-center">
            REAL COMMUNICATION READY
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* SMS */}
          <button
            onClick={() => {
              if (onOpenCommunicationCenter) onOpenCommunicationCenter();
              else if (onOpenCommunicationCenterForPatient) onOpenCommunicationCenterForPatient(selectedPatient?.patientId || 'P-1001');
            }}
            className="p-4 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-left transition-all group flex flex-col justify-between space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">💬 SMS</h4>
              <p className="text-[11px] text-slate-500 font-medium">Send summary to phone</p>
            </div>
          </button>

          {/* USSD */}
          <button
            onClick={() => {
              if (onOpenUSSD) onOpenUSSD();
              else if (onOpenCommunicationCenter) onOpenCommunicationCenter();
            }}
            className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-all group flex flex-col justify-between space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">🔢 USSD (*123#)</h4>
              <p className="text-[11px] text-slate-500 font-medium">Basic phone menu</p>
            </div>
          </button>

          {/* VOICE CALL */}
          <button
            onClick={() => {
              if (onOpenVoiceIVR) onOpenVoiceIVR();
              else if (onOpenCommunicationCenter) onOpenCommunicationCenter();
            }}
            className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-all group flex flex-col justify-between space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">📞 VOICE CALL</h4>
              <p className="text-[11px] text-slate-500 font-medium">IVR helpline consultation</p>
            </div>
          </button>

          {/* VOICE MESSAGE */}
          <button
            onClick={() => {
              if (onOpenVoiceIVR) onOpenVoiceIVR();
              else if (onOpenCommunicationCenter) onOpenCommunicationCenter();
            }}
            className="p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-left transition-all group flex flex-col justify-between space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">🎙️ VOICE MESSAGE</h4>
              <p className="text-[11px] text-slate-500 font-medium">Record audio note</p>
            </div>
          </button>

          {/* BLUETOOTH */}
          <button
            onClick={() => {
              if (onOpenCommunicationCenter) onOpenCommunicationCenter();
            }}
            className="p-4 rounded-2xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-left transition-all group flex flex-col justify-between space-y-2 col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">📶 BLUETOOTH</h4>
              <p className="text-[11px] text-slate-500 font-medium">Device-to-device sync</p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. SPECIALIZED POPULATION CARE HUBS */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-teal-600 fill-teal-100" />
          <span>SPECIALIZED POPULATION CARE HUBS</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Children Care Hub */}
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

          {/* Elderly Care Hub */}
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

      {/* 4. PRIMARY DOCTOR AVAILABILITY & SUBSTITUTES (10 DOCTORS ROSTER) */}
      <div ref={doctorsRef} className="space-y-4">
        <DoctorStatusBanner
          status={primaryDoctorStatus}
          onStatusChange={setPrimaryDoctorStatus}
          onSelectDoctor={(docId) => {
            const found = doctors.find((d) => d.id === docId);
            if (found) onSelectDoctor(found);
          }}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-cyan-600" />
              <span>Primary Doctor Roster & Substitutes ({doctors.length})</span>
            </h3>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
              DEMO ROSTER
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {doctor.role || 'Primary Physician'}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      AVAILABLE TODAY
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <img
                      src={doctor.photoUrl}
                      alt={doctor.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shadow-sm shrink-0 bg-slate-100"
                    />
                    <div>
                      <h4 className="font-black text-slate-900 text-base leading-tight">
                        {doctor.name}
                      </h4>
                      <p className="text-xs font-bold text-teal-700 mt-0.5">
                        {doctor.specialization}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {doctor.education} • {doctor.experienceYears} yrs exp
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <p className="font-medium text-slate-700 line-clamp-1">
                      🏥 {doctor.hospitalName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      🗣️ Languages: <strong>{doctor.languages.join(', ')}</strong>
                    </p>
                    <p className="text-[11px] font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-100 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{doctor.availableDaysTime || doctor.opdTimings}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectDoctor(doctor)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl border border-slate-200 flex items-center justify-center gap-1 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                      <span>View Profile</span>
                    </button>

                    <button
                      onClick={() => onSelectDoctor(doctor)}
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-sm flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Consultation</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenCommunicationCenterForPatient) {
                        onOpenCommunicationCenterForPatient(selectedPatient?.patientId || 'P-1001');
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Health Summary</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. MEDORA AI INTERACTIVE FRONT-PAGE SECTION */}
      <div ref={aiRef} className="bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5 border border-cyan-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-3 py-1 rounded-full text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>💬 MEDORA AI — SYMPTOM TRIAGE & DECISION SUPPORT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Describe your symptoms for instant guidance.
            </h2>
            <p className="text-xs sm:text-sm text-cyan-100">
              Assesses symptom patterns against rural clinical standards for {selectedPatient?.name || 'Patient'}.
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

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-2">
            <input
              type="text"
              value={askAiInput}
              onChange={(e) => setAskAiInput(e.target.value)}
              placeholder="Example: I have fever, headache and body pain for 2 days..."
              className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-cyan-200 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunAiTriage(askAiInput);
              }}
            />
            <button
              onClick={() => handleRunAiTriage(askAiInput)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
            >
              <SendHorizonal className="w-4 h-4" />
              <span>Analyze</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-cyan-200 font-bold text-[11px]">Quick prompts:</span>
            {[
              'I have fever, headache and body pain for 2 days',
              'My child has high fever & loose motion',
              'What do I do for a snake bite?',
              'Shaking and cold sweats with low sugar',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setAskAiInput(prompt);
                  handleRunAiTriage(prompt);
                }}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 text-[11px] font-bold px-3 py-1 rounded-full transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Triage Output Result Card */}
          {aiTriageResponse && (
            <div className="mt-4 p-5 rounded-2xl bg-white text-slate-900 border-2 border-cyan-400 shadow-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    💡 {aiTriageResponse.association}
                  </h4>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${aiTriageResponse.urgencyClass}`}>
                  {aiTriageResponse.urgency}
                </span>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-slate-700">
                <p><strong>🤔 Why Symptoms Match:</strong> {aiTriageResponse.why}</p>
                <p><strong className="text-emerald-700">✅ What To Do:</strong> {aiTriageResponse.do}</p>
                {aiTriageResponse.dont && <p><strong className="text-rose-700">❌ What NOT To Do:</strong> {aiTriageResponse.dont}</p>}
                <p><strong className="text-amber-800">⚠️ Warning Signs:</strong> {aiTriageResponse.warning}</p>
                <p><strong className="text-teal-800">🏥 When To Seek Care:</strong> {aiTriageResponse.whenSeek}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>⚠️ AI Educational Decision Support — Always consult a doctor.</span>
                {onNavigateToAI && (
                  <button
                    onClick={onNavigateToAI}
                    className="text-cyan-700 font-extrabold hover:underline flex items-center gap-1"
                  >
                    <span>Full AI Chat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. HEALTHCARE SERVICES (10 SERVICES GRID) */}
      <div className="space-y-3">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-teal-600 fill-teal-100" />
          <span>HEALTHCARE SERVICES</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* My Health */}
          <button
            onClick={() => {
              if (onNavigateToReportScanner) onNavigateToReportScanner();
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-rose-100 text-rose-700 w-fit group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">❤️ My Health</h4>
              <p className="text-[11px] text-slate-500 font-medium">Vitals & Record</p>
            </div>
          </button>

          {/* Family Health */}
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
              <h4 className="font-extrabold text-slate-900 text-sm">👨‍👩‍👧‍👦 Family Health</h4>
              <p className="text-[11px] text-slate-500 font-medium">{familyMembers.length} Members</p>
            </div>
          </button>

          {/* Medicines & Reminders */}
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
              <h4 className="font-extrabold text-slate-900 text-sm">💊 Medicines</h4>
              <p className="text-[11px] text-slate-500 font-medium">Reminders & Doses</p>
            </div>
          </button>

          {/* Medical Reports */}
          <button
            onClick={() => {
              if (onNavigateToReportScanner) onNavigateToReportScanner();
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 w-fit group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">📜 Medical Reports</h4>
              <p className="text-[11px] text-slate-500 font-medium">Scan & Analyze</p>
            </div>
          </button>

          {/* Vaccinations */}
          <button
            onClick={() => {
              if (onNavigateToChildren) onNavigateToChildren();
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700 w-fit group-hover:scale-110 transition-transform">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">💉 Vaccinations</h4>
              <p className="text-[11px] text-slate-500 font-medium">Schedule & History</p>
            </div>
          </button>

          {/* Health Tests */}
          <button
            onClick={() => {
              if (onNavigateToReportScanner) onNavigateToReportScanner();
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 w-fit group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">🔬 Health Tests</h4>
              <p className="text-[11px] text-slate-500 font-medium">Lab & Screening</p>
            </div>
          </button>

          {/* Government Schemes */}
          <button
            onClick={() => {
              if (onNavigateToGovtSchemes) onNavigateToGovtSchemes();
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 w-fit group-hover:scale-110 transition-transform">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">🏛️ Govt Schemes</h4>
              <p className="text-[11px] text-slate-500 font-medium">ABHA & PMJAY</p>
            </div>
          </button>

          {/* Doctor Consultation */}
          <button
            onClick={() => {
              doctorsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-700 w-fit group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">👨‍⚕️ Doctor Roster</h4>
              <p className="text-[11px] text-slate-500 font-medium">10 Specialists</p>
            </div>
          </button>

          {/* Health Education */}
          <button
            onClick={() => {
              if (onNavigateToDiseases) onNavigateToDiseases();
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 w-fit group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">📚 Health Guide</h4>
              <p className="text-[11px] text-slate-500 font-medium">Disease Prevention</p>
            </div>
          </button>

          {/* Nearby Healthcare */}
          <button
            onClick={() => {
              if (onNavigateToHospitalPortal) onNavigateToHospitalPortal();
            }}
            className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left space-y-2 group"
          >
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 w-fit group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">🏥 Nearby Hospitals</h4>
              <p className="text-[11px] text-slate-500 font-medium">Civil & PHCs</p>
            </div>
          </button>
        </div>
      </div>

      {/* 7. TOOLS & PORTALS (MOVED FROM MORE TO FRONT PAGE) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-600" />
            <span>TOOLS & PORTALS</span>
          </h3>
          <span className="text-xs bg-teal-100 text-teal-800 font-bold px-3 py-1 rounded-full border border-teal-300">
            DIRECTLY ACCESSIBLE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 1. AI Camera Scanner */}
          <button
            onClick={() => {
              if (onNavigateToCameraScanner) onNavigateToCameraScanner();
            }}
            className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-2xl bg-cyan-100 text-cyan-700 shrink-0 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-cyan-700 transition-colors">
                📷 AI Camera Scanner
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Scan skin rashes, tongue, or medicines for immediate AI triage.</p>
            </div>
          </button>

          {/* 2. Government Schemes */}
          <button
            onClick={() => {
              if (onNavigateToGovtSchemes) onNavigateToGovtSchemes();
            }}
            className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 shrink-0 group-hover:scale-110 transition-transform">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                🏛️ Government Schemes
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">PMJAY, Ayushman Bharat, ABHA Health ID, and maternal benefits.</p>
            </div>
          </button>

          {/* 3. A2A Agent Protocol */}
          <button
            onClick={() => {
              if (onNavigateToA2A) onNavigateToA2A();
            }}
            className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 shrink-0 group-hover:scale-110 transition-transform">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                🔄 A2A Agent Protocol
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Agent-to-agent clinical simulation with 13 specialist agents.</p>
            </div>
          </button>

          {/* 4. Hospital Village Portal */}
          <button
            onClick={() => {
              if (onNavigateToHospitalPortal) onNavigateToHospitalPortal();
            }}
            className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 shrink-0 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                🏥 Hospital Village Portal
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">District hospital bed status, ICU availability, and specialist schedules.</p>
            </div>
          </button>

          {/* 5. USSD Simulator */}
          <button
            onClick={() => {
              if (onOpenUSSD) onOpenUSSD();
            }}
            className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-amber-800 transition-colors">
                🔢 USSD Simulator (*123#)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Simulate basic feature-phone menu commands for offline care.</p>
            </div>
          </button>

          {/* 6. Toll-Free Voice IVR Call */}
          <button
            onClick={() => {
              if (onOpenVoiceIVR) onOpenVoiceIVR();
            }}
            className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-2xl bg-rose-100 text-rose-700 shrink-0 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
                📞 Toll-Free Voice IVR Call
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Interactive voice response helpline for low-literacy users.</p>
            </div>
          </button>

          {/* 7. Two-Way Doctor Chat */}
          <button
            onClick={() => {
              if (onOpenDoctorChat) onOpenDoctorChat();
            }}
            className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700 shrink-0 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                💬 Two-Way Doctor Chat
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Direct encrypted messaging with assigned primary clinician.</p>
            </div>
          </button>

          {/* 8. Communication Center & Share */}
          <button
            onClick={() => {
              if (onOpenCommunicationCenter) onOpenCommunicationCenter();
            }}
            className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-2xl bg-teal-100 text-teal-700 shrink-0 group-hover:scale-110 transition-transform">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                📬 Communication Center & Share
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Manual phone sharing, encrypted records export, and delivery status.</p>
            </div>
          </button>

          {/* 9. Medora Help & FAQ */}
          <button
            onClick={() => {
              if (onOpenHelp) onOpenHelp();
            }}
            className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3 group"
          >
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-700 shrink-0 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm group-hover:text-slate-800 transition-colors">
                ❓ Medora Help & FAQ
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Usage guides, offline instructions, and platform documentation.</p>
            </div>
          </button>
        </div>
      </div>

      {/* 8. 🚨 EMERGENCY HELP & TRANSPORT DISPATCH */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 border-2 border-red-400">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur text-white">
                <PhoneCall className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-200 block">Emergency Response Desk</span>
                <h2 className="text-xl font-black">Need Emergency Dispatch?</h2>
              </div>
            </div>
            <span className="bg-white text-red-700 text-xs font-black px-2.5 py-1 rounded-full">
              24x7 TOLL-FREE
            </span>
          </div>

          <p className="text-xs text-red-100 leading-relaxed">
            Direct access to 108 Ambulance, 112 National Emergency, 102 Janani Shishu Transit, and local village transport options.
          </p>

          {/* Transport Modes Buttons */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-red-100 block">Select Transport Mode:</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-bold text-slate-900">
              <button onClick={onOpenEmergency} className="p-2 rounded-xl bg-white hover:bg-red-50 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95">
                <PhoneCall className="w-4 h-4 text-red-600" />
                <span className="text-[10px]">Ambulance</span>
              </button>
              <button onClick={onOpenEmergency} className="p-2 rounded-xl bg-white hover:bg-red-50 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95">
                <Car className="w-4 h-4 text-blue-600" />
                <span className="text-[10px]">Car</span>
              </button>
              <button onClick={onOpenEmergency} className="p-2 rounded-xl bg-white hover:bg-red-50 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95">
                <Bike className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px]">Two-Wheeler</span>
              </button>
              <button onClick={onOpenEmergency} className="p-2 rounded-xl bg-white hover:bg-red-50 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95">
                <Bike className="w-4 h-4 text-purple-600" />
                <span className="text-[10px]">Bicycle</span>
              </button>
              <button onClick={onOpenEmergency} className="p-2 rounded-xl bg-white hover:bg-red-50 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95">
                <Bus className="w-4 h-4 text-amber-600" />
                <span className="text-[10px]">Bus</span>
              </button>
              <button onClick={onOpenEmergency} className="p-2 rounded-xl bg-white hover:bg-red-50 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95">
                <Bed className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px]">Stretcher</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={onOpenEmergency}
              className="flex-1 bg-white hover:bg-red-50 text-red-700 font-black text-sm py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <PhoneCall className="w-5 h-5 text-red-600" />
              <span>DIAL 108 AMBULANCE</span>
            </button>

            <button
              onClick={handleShareLocation}
              className="bg-red-900/60 hover:bg-red-900 border border-red-400/50 text-white font-black text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-300" />
              <span>Share Location</span>
            </button>
          </div>

          {locationCaptured && (
            <div className="bg-white/15 backdrop-blur p-2.5 rounded-xl border border-white/20 text-xs font-mono text-amber-200 flex items-center justify-between">
              <span>📍 {locationCaptured}</span>
              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(locationCaptured);
                    if (onShowToast) onShowToast('GPS Location copied!');
                  }
                }}
                className="bg-white/20 hover:bg-white/30 p-1 rounded text-white"
                title="Copy coordinates"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <EmergencySoundDetector
          onTriggerEmergencyModal={onOpenEmergency}
          patientName={selectedPatient?.name || 'Villager'}
        />
      </div>

      {/* 9. ❤️ HEALTH OVERVIEW & HEALTH SCORE */}
      <div className="grid gap-6 lg:grid-cols-3" ref={medsRef}>
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
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Blood Pressure</span>
              <div className="font-mono text-sm font-extrabold text-slate-900">{sys}/{dia} mmHg</div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {bpStatus}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Blood Sugar</span>
              <div className="font-mono text-sm font-extrabold text-slate-900">{sugar} mg/dL</div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {sugarStatus}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Medicines</span>
              <div className="font-mono text-sm font-extrabold text-slate-900">{selectedPatient?.medicines?.length || 0} active</div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {medsStatus}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold block">Appointments</span>
              <div className="font-mono text-sm font-extrabold text-slate-900">1 Scheduled</div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                🔵 Upcoming
              </span>
            </div>
          </div>
        </div>

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
            Based on medicine adherence (85%), vitals stability, and completed checkups.
          </p>
        </div>
      </div>

      {/* 10. 💊 TODAY'S MEDICINES REMINDER */}
      <MedicineReminder currentLang={currentLang} />

      {/* 11. 👨‍👩‍👧 FAMILY HEALTH SELECTOR */}
      <FamilyHealthSelector
        familyMembers={familyMembers}
        selectedFamilyId={selectedFamilyId}
        onSelectFamilyMember={onSelectFamilyMember}
        currentLang={currentLang}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Stethoscope, Building2, FileText, Calendar, Bell, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';
import { CareGap, LanguageCode } from '../types';

interface HealthJourneyWorkflowProps {
  careGaps: CareGap[];
  onTriggerReferralFromGap: (gap: CareGap) => void;
  onNavigateToFindDoctor: () => void;
  onNavigateToFindHospital: () => void;
  onOpenDoctorHandoff: () => void;
  currentLang: LanguageCode;
}

export const HealthJourneyWorkflow: React.FC<HealthJourneyWorkflowProps> = ({
  careGaps,
  onTriggerReferralFromGap,
  onNavigateToFindDoctor,
  onNavigateToFindHospital,
  onOpenDoctorHandoff,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(6); // Default on Care Gap Detection

  const journeySteps = [
    {
      step: 1,
      title: 'Limited Awareness',
      tag: 'Awareness',
      desc: 'Rural patient is uncertain if symptoms or mild high blood pressure require clinic evaluation.',
      actionLabel: 'Health Education',
      icon: Heart,
    },
    {
      step: 2,
      title: 'Health Education',
      tag: 'Education',
      desc: 'Medora provides audio & multilingual guidance on blood pressure, dietary salt, and signs of stroke.',
      actionLabel: 'Learn More',
      icon: ShieldCheck,
    },
    {
      step: 3,
      title: 'Preventive Care',
      tag: 'Prevention',
      desc: 'Scheduled annual screenings, immunizations, and community wellness camps recorded in ABHA file.',
      actionLabel: 'Check Tasks',
      icon: Calendar,
    },
    {
      step: 4,
      title: 'Health Monitoring',
      tag: 'Monitoring',
      desc: 'Home BP measurements logged: 158/96 mmHg detected on Sep 09 with morning occipital headache.',
      actionLabel: 'View Vitals',
      icon: Heart,
    },
    {
      step: 5,
      title: 'Medication Adherence',
      tag: 'Adherence',
      desc: 'Evening Telmisartan doses missed 3 times in 10 days; overall monthly adherence dropped to 82%.',
      actionLabel: 'Adherence Log',
      icon: Bell,
    },
    {
      step: 6,
      title: 'Care Gap Detection',
      tag: 'Care Gap',
      desc: 'AI risk assessment flags BP elevation, missed antihypertensive doses, and overdue microalbuminuria screening for professional review.',
      actionLabel: 'View Gaps',
      icon: AlertTriangle,
    },
    {
      step: 7,
      title: 'Evaluation Recommended',
      tag: 'Triage',
      desc: 'Medora flags recommendation for clinical assessment by a Geriatrician or General Physician.',
      actionLabel: 'Start Referral',
      icon: Sparkles,
    },
    {
      step: 8,
      title: 'Smart Referral',
      tag: 'Referral',
      desc: 'Digital referral initiated with reason, urgency score (Urgent), and patient longitudinal history.',
      actionLabel: 'Open Referral',
      icon: ArrowRight,
    },
    {
      step: 9,
      title: 'Find Doctor & Hospital',
      tag: 'Directory',
      desc: 'Patient searches local directory: Dr. Rajeshwar Patil at District Civil Hospital (14.5 km away).',
      actionLabel: 'Browse Directory',
      icon: Stethoscope,
    },
    {
      step: 10,
      title: 'Select Facility & Route',
      tag: 'Facility',
      desc: 'District Civil Hospital linked to referral. Rural bus route 14 directions reviewed.',
      actionLabel: 'View Route',
      icon: Building2,
    },
    {
      step: 11,
      title: 'Doctor-Ready Handoff',
      tag: 'Handoff',
      desc: 'Patient generates standardized Health Summary with BP charts, meds, and doctor discussion points.',
      actionLabel: 'View Handoff',
      icon: FileText,
    },
    {
      step: 12,
      title: 'Consultation & Follow-Up',
      tag: 'Continuity',
      desc: 'Doctor titrates medication, orders lab test, and sets automated Medora follow-up reminder for Sep 26.',
      actionLabel: 'Follow-Up Complete',
      icon: CheckCircle2,
    },
  ];

  const currentStep = journeySteps[activeStepIndex];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                End-to-End Continuity Lifecycle
              </span>
              <span className="text-xs text-slate-400 font-bold">12 Interconnected Milestones</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Medora Health Journey & Care Gap Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Witness how Medora transforms passive rural healthcare into a connected journey: from early symptom awareness to professional doctor consultation and community follow-up.
            </p>
          </div>
        </div>

        {/* Horizontal Milestone Stepper */}
        <div className="overflow-x-auto py-4 scrollbar-none">
          <div className="flex items-center min-w-[900px] justify-between relative px-2">
            <div className="absolute left-4 right-4 top-5 h-1 bg-slate-200 z-0" />

            {journeySteps.map((item, idx) => {
              const isPassed = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              const StepIcon = item.icon;

              return (
                <button
                  key={item.step}
                  onClick={() => setActiveStepIndex(idx)}
                  className="relative z-10 flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 shadow-lg scale-110'
                        : isPassed
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-white text-slate-400 border-2 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] mt-2 font-black text-center max-w-[70px] leading-tight ${
                      isCurrent ? 'text-emerald-800' : isPassed ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Milestone Interactive Panel */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700 pb-4 mb-5">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Stage {currentStep.step} of 12 • {currentStep.tag}
            </span>
            <h3 className="text-2xl font-black text-white mt-0.5">
              {currentStep.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold"
            >
              ← Previous
            </button>
            <button
              disabled={activeStepIndex === journeySteps.length - 1}
              onClick={() => setActiveStepIndex(prev => Math.min(journeySteps.length - 1, prev + 1))}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-sm"
            >
              Next Milestone →
            </button>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mb-6">
          {currentStep.desc}
        </p>

        {/* Contextual Action Buttons depending on step */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateToFindDoctor}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Search Doctors in Directory</span>
          </button>

          <button
            onClick={onNavigateToFindHospital}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all"
          >
            <Building2 className="w-4 h-4" />
            <span>Find Empanelled Hospitals</span>
          </button>

          <button
            onClick={onOpenDoctorHandoff}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-slate-600 transition-all"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>Generate Doctor Handoff</span>
          </button>
        </div>
      </div>

      {/* Active Care Gaps List (Bridge between AI Monitoring and Referral) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Active Care Gaps Detected by Medora
            </h3>
          </div>
          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
            {careGaps.length} Gaps Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {careGaps.map((gap) => (
            <div
              key={gap.id}
              className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/30 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-extrabold text-slate-800">{gap.patientName}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                    {gap.severity} Priority
                  </span>
                </div>
                <h4 className="font-black text-slate-900 text-sm leading-tight">
                  {gap.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {gap.description}
                </p>
              </div>

              <div className="pt-3 border-t border-amber-200 space-y-2">
                <div className="text-[11px] text-amber-900 font-semibold">
                  Recommended: Consult a <strong>{gap.specialtyNeeded}</strong>
                </div>
                <button
                  onClick={() => onTriggerReferralFromGap(gap)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Connect to Referral & Facility</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

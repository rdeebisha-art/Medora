import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/db';
import {
  Stethoscope,
  X,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Phone,
  Building2,
  UserCheck,
  HeartPulse,
  Thermometer,
  RotateCcw,
  Save,
  Info
} from 'lucide-react';

export type TriageUrgency = 'EMERGENCY_RED' | 'DOCTOR_AMBER' | 'HEALTH_WORKER_GREEN' | 'HOME_CARE_BLUE';

interface TriageAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssessmentCompleted?: (result: TriageResultData) => void;
}

export interface TriageResultData {
  urgency: TriageUrgency;
  title: string;
  summary: string;
  recommendedProvider: string;
  providerRole: 'emergency' | 'doctor' | 'asha_worker' | 'home_care';
  actionSteps: string[];
  homeCareGuidance: string[];
  redFlagsToWatch: string[];
  symptomsSelected: string[];
  category: string;
  patientTarget: string;
  duration: string;
  timestamp: string;
}

export const TriageAssessmentModal: React.FC<TriageAssessmentModalProps> = ({
  isOpen,
  onClose,
  onAssessmentCompleted,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, language } = useAppStore();

  const [step, setStep] = useState<number>(1);
  const [patientTarget, setPatientTarget] = useState<'self' | 'child' | 'pregnant' | 'elderly'>('self');
  const [ageGroup, setAgeGroup] = useState<string>('adult');
  const [selectedRedFlags, setSelectedRedFlags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('1_to_3_days');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [fluidRetention, setFluidRetention] = useState<'normal' | 'difficult' | 'cannot_keep_down'>('normal');
  const [feverStatus, setFeverStatus] = useState<string>('none');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const redFlagOptions = [
    { id: 'rf_breathing', label: 'Severe difficulty breathing or gasping for air', severe: true },
    { id: 'rf_chest', label: 'Crushing chest pain or heavy pressure radiating to arm/jaw', severe: true },
    { id: 'rf_neuro', label: 'Sudden face drooping, speech slurring, or arm weakness (Stroke signs)', severe: true },
    { id: 'rf_conscious', label: 'Fainting, seizure, or sudden confusion / loss of consciousness', severe: true },
    { id: 'rf_bleed', label: 'Heavy coughing of blood or uncontrollable bleeding', severe: true },
    { id: 'rf_dehydration', label: 'Inability to drink or retain fluids for over 12 hours (Sunken eyes, no urine)', severe: true },
    ...(patientTarget === 'pregnant'
      ? [
          { id: 'rf_preg_bleed', label: 'Vaginal bleeding or sudden fluid leaking during pregnancy', severe: true },
          { id: 'rf_preg_headache', label: 'Severe unrelenting headache with blurred vision or upper belly pain', severe: true },
        ]
      : []),
    ...(patientTarget === 'child'
      ? [
          { id: 'rf_child_lethargy', label: 'Baby is floppy, unresponsive, or refusing all breastfeeds', severe: true },
          { id: 'rf_child_chest_indraw', label: 'Chest sinking inward during breathing (severe indrawing)', severe: true },
        ]
      : []),
  ];

  const symptomCategories = [
    { id: 'general', label: '🤒 General & Fever', icon: '🌡️' },
    { id: 'respiratory', label: '🫁 Cough & Breathing', icon: '💨' },
    { id: 'digestive', label: '🤢 Stomach & Diarrhea', icon: '🥣' },
    { id: 'head_pain', label: '🤕 Head, Body & Joints', icon: '⚡' },
    { id: 'skin_bites', label: '🩹 Skin, Rashes & Bites', icon: '🦟' },
    { id: 'urinary', label: '💧 Urinary & Infection', icon: '🚻' },
  ];

  const symptomListByCategory: Record<string, Array<{ id: string; label: string; level: 'mild' | 'moderate' | 'urgent' }>> = {
    general: [
      { id: 'fever_mild', label: 'Mild to moderate fever (99°F - 101°F)', level: 'mild' },
      { id: 'fever_high', label: 'High fever (>102°F) with shivering/chills', level: 'urgent' },
      { id: 'extreme_fatigue', label: 'Extreme body exhaustion and muscle weakness', level: 'moderate' },
      { id: 'loss_appetite', label: 'Total loss of appetite or bitter taste in mouth', level: 'mild' },
      { id: 'weight_loss', label: 'Unexplained weight loss over recent weeks', level: 'moderate' },
    ],
    respiratory: [
      { id: 'dry_cough', label: 'Dry irritating cough (<3 days)', level: 'mild' },
      { id: 'productive_cough', label: 'Persistent cough with thick yellow or green phlegm', level: 'moderate' },
      { id: 'chronic_cough', label: 'Cough lasting for more than 2 weeks (TB screening needed)', level: 'urgent' },
      { id: 'mild_wheeze', label: 'Mild whistling or wheezing sound in chest during cold night', level: 'moderate' },
      { id: 'sore_throat', label: 'Painful raw throat when swallowing food or water', level: 'mild' },
      { id: 'nasal_congestion', label: 'Runny or blocked nose with clear discharge', level: 'mild' },
    ],
    digestive: [
      { id: 'watery_diarrhea', label: 'Watery loose stools (3 to 5 times today)', level: 'moderate' },
      { id: 'severe_diarrhea', label: 'Frequent watery diarrhea (>6 times) with thirst and dry tongue', level: 'urgent' },
      { id: 'nausea_vomit', label: 'Nausea with vomiting 1-2 times after meals', level: 'moderate' },
      { id: 'cramping_pain', label: 'Cramping stomach pain or intestinal bloating', level: 'mild' },
      { id: 'acid_reflux', label: 'Burning sensation in upper chest/stomach (acidity)', level: 'mild' },
    ],
    head_pain: [
      { id: 'tension_headache', label: 'Dull band-like ache across forehead or temples', level: 'mild' },
      { id: 'severe_headache', label: 'Pounding throbbing headache with sensitivity to light', level: 'moderate' },
      { id: 'joint_stiffness', label: 'Morning knee, hip, or ankle pain and stiffness', level: 'mild' },
      { id: 'dizziness_standing', label: 'Feeling faint or lightheaded when standing up quickly', level: 'moderate' },
      { id: 'neck_back_pain', label: 'Stiff aching neck or lower back pain after farming work', level: 'mild' },
    ],
    skin_bites: [
      { id: 'insect_bite', label: 'Local red bump from mosquito, bee, or insect sting without swelling', level: 'mild' },
      { id: 'spreading_rash', label: 'Itchy spreading rash across chest, arms, or back with fever', level: 'urgent' },
      { id: 'boil_abscess', label: 'Painful swollen red skin boil with pus formation', level: 'moderate' },
      { id: 'skin_fungal', label: 'Circular itchy scaly patches in groin, armpits, or feet', level: 'mild' },
    ],
    urinary: [
      { id: 'burning_urine', label: 'Sharp burning pain or stinging while passing urine', level: 'moderate' },
      { id: 'frequent_urine', label: 'Frequent urgent need to urinate in small drops', level: 'moderate' },
      { id: 'dark_urine', label: 'Dark tea-colored or cloudy urine with foul odor', level: 'moderate' },
      { id: 'back_flank_pain', label: 'Sharp one-sided lower back / flank pain (suspected kidney stone/infection)', level: 'urgent' },
    ],
  };

  const toggleRedFlag = (id: string) => {
    setSelectedRedFlags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Evaluate Triage Level
  const calculateTriageResult = (): TriageResultData => {
    const hasRedFlags = selectedRedFlags.length > 0;
    const isPregnant = patientTarget === 'pregnant';
    const isChild = patientTarget === 'child';
    const isElderly = patientTarget === 'elderly';

    // Count urgent symptoms
    const urgentSelected = selectedSymptoms.filter((id) => {
      for (const cat of Object.values(symptomListByCategory)) {
        const found = cat.find((s) => s.id === id);
        if (found && found.level === 'urgent') return true;
      }
      return false;
    });

    const isFluidCrisis = fluidRetention === 'cannot_keep_down';

    // 1. Critical Emergency (RED)
    if (hasRedFlags || (isFluidCrisis && (isChild || isElderly))) {
      return {
        urgency: 'EMERGENCY_RED',
        title: '🚨 Urgent Medical Dispatch Advised',
        summary:
          'Critical red-flag symptoms detected that indicate immediate danger. Do not wait for routine clinic hours. Seek urgent medical attention immediately.',
        recommendedProvider: 'Kodaikanal Government Hospital Emergency Casualty or Call 108 Ambulance',
        providerRole: 'emergency',
        actionSteps: [
          'Immediately call 108 Ambulance or arrange transport to the nearest 24/7 Government Hospital Casualty.',
          'Keep patient calm, in a safe resting position with clear open airway.',
          'Do not give solid foods. If conscious and able to swallow safely, give small sips of clean water.',
          'Bring all current medicines and healthcare cards with the patient.',
        ],
        homeCareGuidance: [
          'Immediate transport required — do not delay with home remedies.',
          'If fever is extreme, place cool damp cloths on forehead while vehicle is on the way.',
        ],
        redFlagsToWatch: selectedRedFlags,
        symptomsSelected: [...selectedRedFlags, ...selectedSymptoms],
        category: selectedCategory,
        patientTarget,
        duration,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Doctor Visit Needed (AMBER)
    if (
      urgentSelected.length > 0 ||
      severity === 'severe' ||
      duration === 'more_than_week' ||
      (isPregnant && selectedSymptoms.length > 0) ||
      fluidRetention === 'difficult'
    ) {
      return {
        urgency: 'DOCTOR_AMBER',
        title: '🩺 Prompt Medical Evaluation Needed (Within 24 Hours)',
        summary:
          'Your symptom pattern indicates a clinical issue that should be evaluated directly by a Medical Doctor at the Primary Health Centre (PHC) or Community Health Centre (CHC).',
        recommendedProvider:
          'Dr. Arjun Mehta (General Physician, Kodaikanal PHC) or Dr. Kavitha Rao (Maternal & Child Health Specialist)',
        providerRole: 'doctor',
        actionSteps: [
          'Visit Kodaikanal PHC or CHC Palani outpatient department (OPD) today or tomorrow morning.',
          'Request an evaluation from the Medical Officer or Duty Doctor.',
          'If symptoms worsen before clinic opens, proceed directly to Hospital Emergency.',
          'Carry your health ID card and any current medicines you take regularly.',
        ],
        homeCareGuidance: [
          'Stay well hydrated with boiled water, tender coconut water, or fresh lemon water.',
          'Take light, easy-to-digest meals (rice porridge, cooked vegetables, idli).',
          'Rest in a comfortable, well-ventilated room.',
          'Do not take unprescribed antibiotics or heavy painkillers without a doctor prescription.',
        ],
        redFlagsToWatch: [
          'Sudden breathlessness or chest tightness',
          'High fever failing to respond to sponging',
          'Inability to drink any liquids',
        ],
        symptomsSelected: selectedSymptoms,
        category: selectedCategory,
        patientTarget,
        duration,
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Local Healthcare Worker Visit (GREEN)
    if (selectedSymptoms.length > 0 || severity === 'moderate') {
      return {
        urgency: 'HEALTH_WORKER_GREEN',
        title: '👩‍⚕️ Consult Village Health Worker / ASHA Worker',
        summary:
          'These symptoms can be initially assessed by your village ASHA worker, Village Health Nurse (VHN), or Community Health Officer (CHO) at the local Health Sub-centre / Anganwadi.',
        recommendedProvider:
          'Sister Sunita Devi (ASHA Worker, Village Health Post) or Sister Mary (Staff Nurse, Village Health Sub-centre)',
        providerRole: 'asha_worker',
        actionSteps: [
          'Contact your village ASHA worker or visit the local Health Sub-centre / Anganwadi.',
          'The health worker will check vitals (blood pressure, temperature, pulse, blood sugar) and provide ORS, iron, or paracetamol if indicated.',
          'If the health worker finds warning signs, they will initiate an organized referral to the PHC doctor.',
          'Follow up within 48 hours to confirm symptom improvement.',
        ],
        homeCareGuidance: [
          'Drink Oral Rehydration Solution (ORS) or homemade salt-sugar water for diarrhea/weakness.',
          'Wash hands thoroughly with soap before eating and after using the toilet.',
          'Ensure adequate sleep and drink clean boiled drinking water.',
          'Avoid heavy physical farm work in direct sunlight until strength returns.',
        ],
        redFlagsToWatch: [
          'Fever rising above 102°F',
          'Persistent vomiting lasting over 24 hours',
          'Blood in phlegm, stool, or urine',
        ],
        symptomsSelected: selectedSymptoms,
        category: selectedCategory,
        patientTarget,
        duration,
        timestamp: new Date().toISOString(),
      };
    }

    // 4. Home Care & Supportive Monitoring (BLUE)
    return {
      urgency: 'HOME_CARE_BLUE',
      title: '🌿 Home Care & Supportive Monitoring',
      summary:
        'Mild, self-limiting symptoms reported. You can safely manage these with proper hydration, rest, and supportive home care, while monitoring for any changes.',
      recommendedProvider: 'Home self-care with Village ASHA Worker check-in if not improved in 3 days',
      providerRole: 'home_care',
      actionSteps: [
        'Practice supportive rest and adequate hydration for the next 48 to 72 hours.',
        'Keep track of your symptoms daily in your Medora Health Diary.',
        'If symptoms do not improve after 3 days, visit your local ASHA worker or PHC.',
      ],
      homeCareGuidance: [
        'Drink plenty of warm boiled water, herbal ginger-tulsi tea, or tender coconut water.',
        'Eat fresh warm home-cooked meals; avoid oily or street-side raw foods.',
        'Ensure 8 hours of restful sleep in a well-ventilated room.',
      ],
      redFlagsToWatch: ['Any sudden spike in fever', 'Difficulty breathing or sudden severe pain'],
      symptomsSelected: [],
      category: selectedCategory,
      patientTarget,
      duration,
      timestamp: new Date().toISOString(),
    };
  };

  const triageResult = calculateTriageResult();

  const handleSaveToRecords = async () => {
    try {
      const pid = currentUser?.id || 1;
      const docName = currentUser?.name || 'Patient';
      const todayStr = new Date().toISOString().split('T')[0];

      await db.medicalRecords.add({
        patientId: pid,
        type: 'symptom',
        date: todayStr,
        title: `Triage Assessment: ${triageResult.title.replace(/[🚨🩺👩‍⚕️🌿]/g, '').trim()}`,
        data: {
          urgency: triageResult.urgency,
          target: triageResult.patientTarget,
          category: triageResult.category,
          duration: triageResult.duration,
          recommendedProvider: triageResult.recommendedProvider,
          symptoms: triageResult.symptomsSelected,
          actionSteps: triageResult.actionSteps,
          homeCare: triageResult.homeCareGuidance,
        },
        notes: `Triage guidance: ${triageResult.summary}. Recommended: ${triageResult.recommendedProvider}.`,
      });

      await db.notifications.add({
        userId: pid,
        userRole: 'patient',
        message: `📋 Triage Assessment saved: ${triageResult.title}. Recommendation: ${triageResult.recommendedProvider}.`,
        type: triageResult.urgency === 'EMERGENCY_RED' ? 'emergency' : 'general',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      setIsSaved(true);
      if (onAssessmentCompleted) {
        onAssessmentCompleted(triageResult);
      }
    } catch (e) {
      console.error('[TriageTool] Failed to save record:', e);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedRedFlags([]);
    setSelectedSymptoms([]);
    setSeverity('moderate');
    setFluidRetention('normal');
    setIsSaved(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-xl">
              🩺
            </div>
            <div>
              <h2 className="font-black text-base tracking-tight flex items-center gap-2">
                <span>Clinical Triage Assessment Tool</span>
                <span className="text-[10px] bg-teal-400 text-teal-950 font-black px-2 py-0.5 rounded-full uppercase">
                  Step {step} of 4
                </span>
              </h2>
              <p className="text-xs text-teal-200/90">
                Guided symptom checklist &amp; rural healthcare worker recommendation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 shrink-0">
          <div
            className={`h-full transition-all duration-300 ${
              triageResult.urgency === 'EMERGENCY_RED' ? 'bg-red-500' : 'bg-teal-600'
            }`}
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: PATIENT PROFILE & SEVERITY CONTEXT */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  1. Who is experiencing these symptoms?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'self', label: 'Myself (Adult)', icon: '👤', desc: 'Age 18-59' },
                    { id: 'child', label: 'Infant / Child', icon: '👶', desc: 'Age 0-12 years' },
                    { id: 'pregnant', label: 'Pregnant Mother', icon: '🤰', desc: 'Antenatal care' },
                    { id: 'elderly', label: 'Senior / Elderly', icon: '👵', desc: 'Age 60+ years' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPatientTarget(p.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        patientTarget === p.id
                          ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-500/20 text-teal-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{p.icon}</div>
                      <div className="text-xs font-black">{p.label}</div>
                      <div className="text-[10px] text-slate-500">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CRITICAL RED FLAG QUICK CHECK */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-900 font-black text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Immediate Life-Threatening Red Flags</span>
                </div>
                <p className="text-[11px] text-red-800 leading-relaxed">
                  Do you or the patient have any of the following critical emergency signs right now?
                </p>

                <div className="space-y-1.5 pt-1">
                  {redFlagOptions.map((rf) => {
                    const isChecked = selectedRedFlags.includes(rf.id);
                    return (
                      <label
                        key={rf.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-red-600 text-white font-bold border-red-700 shadow-xs'
                            : 'bg-white text-slate-800 border-red-100 hover:bg-red-100/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRedFlag(rf.id)}
                          className="mt-0.5 rounded text-red-600 focus:ring-red-500 h-4 w-4 shrink-0"
                        />
                        <span className="leading-snug">{rf.label}</span>
                      </label>
                    );
                  })}
                </div>

                {selectedRedFlags.length > 0 && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-950 font-bold flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚨</span>
                      <span>Critical red flag detected! Emergency evaluation recommended.</span>
                    </div>
                    <button
                      onClick={() => setStep(4)}
                      className="bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-black hover:bg-red-800 transition-colors shrink-0"
                    >
                      View Dispatch Advice &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* DURATION */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  2. How long have the symptoms been present?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'today', label: 'Started today (<24h)', icon: '⚡' },
                    { id: '1_to_3_days', label: '1 to 3 days', icon: '🗓️' },
                    { id: '4_to_7_days', label: '4 to 7 days', icon: '📅' },
                    { id: 'more_than_week', label: 'Over 1 week', icon: '⏳' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDuration(d.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        duration === d.id
                          ? 'bg-teal-50 border-teal-600 text-teal-900 font-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-sm mr-1">{d.icon}</span>
                      <span className="text-xs">{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SYMPTOM CATEGORY SELECTION & CHECKLIST */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Select Symptom Category:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {symptomCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-teal-700 text-white font-bold border-teal-800 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-xs truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptom Checklist for Active Category */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Check all symptoms that apply ({symptomListByCategory[selectedCategory]?.length || 0} items)
                  </span>
                  <span className="text-[11px] text-teal-700 font-bold">
                    {selectedSymptoms.length} selected
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {(symptomListByCategory[selectedCategory] || []).map((sym) => {
                    const isChecked = selectedSymptoms.includes(sym.id);
                    return (
                      <label
                        key={sym.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100/70'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSymptom(sym.id)}
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="leading-snug">{sym.label}</span>
                          {sym.level === 'urgent' && (
                            <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-black border border-amber-200">
                              Requires Evaluation
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Fluid retention check */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  Can the patient drink and keep fluids down?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'normal', label: 'Yes, drinking fine', icon: '💧' },
                    { id: 'difficult', label: 'Difficult / Nauseous', icon: '⚠️' },
                    { id: 'cannot_keep_down', label: 'No, vomiting everything', icon: '🚨' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFluidRetention(f.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all text-xs cursor-pointer ${
                        fluidRetention === f.id
                          ? f.id === 'cannot_keep_down'
                            ? 'bg-red-50 border-red-600 text-red-900 font-bold'
                            : 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block text-sm mb-0.5">{f.icon}</span>
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SEVERITY & VITALS CONTEXT */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Overall Discomfort &amp; Pain Level:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mild', label: 'Mild (1 - 3)', desc: 'Noticeable but able to do daily tasks', color: 'border-blue-400 bg-blue-50 text-blue-950' },
                    { id: 'moderate', label: 'Moderate (4 - 6)', desc: 'Interferes with work, farm, or sleep', color: 'border-amber-400 bg-amber-50 text-amber-950' },
                    { id: 'severe', label: 'Severe (7 - 10)', desc: 'Bedridden, unable to move or sleep', color: 'border-rose-400 bg-rose-50 text-rose-950' },
                  ].map((sev) => (
                    <button
                      key={sev.id}
                      type="button"
                      onClick={() => setSeverity(sev.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        severity === sev.id
                          ? `${sev.color} ring-2 ring-slate-400 font-black shadow-xs`
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-black mb-1">{sev.label}</div>
                      <div className="text-[10px] opacity-80 leading-normal">{sev.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary of what has been selected so far */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  Review Inputs Before Triage Recommendation:
                </span>
                <div className="text-xs text-slate-700 space-y-1">
                  <div>• <strong>Patient Target:</strong> {patientTarget.toUpperCase()}</div>
                  <div>• <strong>Duration:</strong> {duration.replace(/_/g, ' ')}</div>
                  <div>• <strong>Red Flags Selected:</strong> {selectedRedFlags.length > 0 ? selectedRedFlags.length : 'None'}</div>
                  <div>• <strong>Symptoms Checked:</strong> {selectedSymptoms.length > 0 ? `${selectedSymptoms.length} symptoms` : 'None specified'}</div>
                  <div>• <strong>Fluid Retention:</strong> {fluidRetention.replace(/_/g, ' ')}</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TRIAGE RESULT & RECOMMENDATIONS */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Main Urgency Banner */}
              <div
                className={`p-4 rounded-3xl border shadow-sm ${
                  triageResult.urgency === 'EMERGENCY_RED'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : triageResult.urgency === 'DOCTOR_AMBER'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : triageResult.urgency === 'HEALTH_WORKER_GREEN'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-blue-50 border-blue-300 text-blue-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${
                      triageResult.urgency === 'EMERGENCY_RED'
                        ? 'bg-red-600 text-white'
                        : triageResult.urgency === 'DOCTOR_AMBER'
                        ? 'bg-amber-500 text-white'
                        : triageResult.urgency === 'HEALTH_WORKER_GREEN'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {triageResult.urgency === 'EMERGENCY_RED'
                      ? '🚨'
                      : triageResult.urgency === 'DOCTOR_AMBER'
                      ? '🩺'
                      : triageResult.urgency === 'HEALTH_WORKER_GREEN'
                      ? '👩‍⚕️'
                      : '🌿'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1 ${
                        triageResult.urgency === 'EMERGENCY_RED'
                          ? 'bg-red-200 text-red-900'
                          : triageResult.urgency === 'DOCTOR_AMBER'
                          ? 'bg-amber-200 text-amber-900'
                          : triageResult.urgency === 'HEALTH_WORKER_GREEN'
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-blue-200 text-blue-900'
                      }`}
                    >
                      {triageResult.urgency.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-base font-black tracking-tight">{triageResult.title}</h3>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">{triageResult.summary}</p>
                  </div>
                </div>
              </div>

              {/* Primary Recommended Provider Box */}
              <div className="bg-white border-2 border-teal-600/40 rounded-3xl p-4 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black text-teal-900 uppercase tracking-wide">
                  <UserCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Recommended Rural Healthcare Contact:</span>
                </div>
                <div className="bg-teal-50/60 p-3 rounded-2xl border border-teal-200 text-xs font-bold text-teal-950 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span>{triageResult.recommendedProvider}</span>
                  </div>
                  {triageResult.providerRole === 'emergency' && (
                    <a
                      href="tel:108"
                      className="bg-red-600 hover:bg-red-700 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone size={13} />
                      <span>Call 108</span>
                    </a>
                  )}
                  {triageResult.providerRole === 'doctor' && (
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/doctor-portal');
                      }}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Stethoscope size={13} />
                      <span>View Doctor Profile</span>
                    </button>
                  )}
                  {triageResult.providerRole === 'asha_worker' && (
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/hospitals');
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Building2 size={13} />
                      <span>Sub-centre Directory</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Steps */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-teal-600" />
                  <span>What You Should Do Next:</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-800">
                  {triageResult.actionSteps.map((stepItem, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-teal-700 shrink-0">{i + 1}.</span>
                      <span className="leading-snug">{stepItem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Home Care Guidance */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Info size={15} className="text-blue-600" />
                  <span>Supportive Rural Home Care While Waiting:</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  {triageResult.homeCareGuidance.map((care, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{care}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons: Save & Quick Links */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToRecords}
                  disabled={isSaved}
                  className={`w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    isSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  <Save size={16} />
                  <span>{isSaved ? '✅ Saved to Health Records' : 'Save Triage Assessment to Records'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto py-3 px-4 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw size={15} />
                  <span>Start New Assessment</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Navigation Controls */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-teal-700 hover:bg-teal-800 flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-800 bg-slate-200 hover:bg-slate-300 cursor-pointer transition-colors"
              >
                Close Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TriageAssessmentModal;

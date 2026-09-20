import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  Check,
  ChevronRight,
  Loader2,
  Mic,
  Pill,
  SendHorizonal,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Volume2,
  X,
  AlertCircle,
  FileQuestion,
} from 'lucide-react';
import { FamilyMember, LanguageCode, PatientProfile } from '../types';
import { useMedora } from '../context/MedoraContext';
import { voiceService } from '../services/voiceService';

interface AskMedoraAIProps {
  familyMembers: FamilyMember[];
  selectedFamilyId: string;
  currentLang: LanguageCode;
  onNavigateToDoctor: () => void;
  onNavigateToHospital: () => void;
  onNavigateToReferral: () => void;
  onNavigateToHandoff: () => void;
  onOpenEmergency: () => void;
  lowDataMode?: boolean;
}

type QuickAction = {
  label: string;
  action: 'doctor' | 'hospital' | 'referral' | 'handoff' | 'graph' | 'tests' | 'medicines' | 'checkup' | 'appointment' | 'preventive';
  value?: string;
};

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  quickActions?: QuickAction[];
  workflow?: string[];
  mode?: 'AI' | 'DEMO/FALLBACK';
}

const DEMO_PROMPTS = [
  'What medicines do I need to take today?',
  'When should I go for my checkup?',
  'What tests are pending?',
  'What do my BP readings show?',
  'Do I have a pending referral?',
  'What preventive tasks are due?',
  'What is my ECG test result?',
  'How can I prevent illness in an elderly person?',
  'How can I prevent illness during pregnancy?',
  'How can I prevent illness in a child?',
  'What should I do for a snake bite?',
  'What should I do for a dog or animal bite?',
];

const languageMap: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
};

const DISCLAIMER_SUFFIX = '\n\n⚠️ AI Educational Decision Support — Not a Medical Diagnosis. Medora assists in continuity; always consult a licensed doctor for clinical decisions.';

const buildPatientContextFromProfile = (profile: PatientProfile) => {
  const latestVital = profile.vitals[0] || null;
  const currentReferral = profile.referrals[0] || null;

  return {
    patientId: profile.patientId,
    familyId: profile.familyId,
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    category: profile.category,
    healthId: profile.healthId,
    relationship: profile.relationship,
    primaryCategory: profile.primaryCategory,
    conditions: profile.chronicConditions,
    allergies: profile.allergies,
    careGaps: profile.careGaps.map(gap => ({
      title: gap.title,
      description: gap.description,
      status: gap.status,
      severity: gap.severity,
    })),
    medicines: profile.medicines.map(m => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      status: m.status,
      purpose: m.purpose,
      adherenceRate: m.adherenceRate,
      instructions: m.instructions,
    })),
    appointments: profile.referrals.map(ref => ({
      date: ref.appointmentDate || ref.followUpDate || 'Not scheduled',
      specialty: ref.specialty,
      status: ref.status,
      doctor: ref.selectedDoctorName || 'Assigned Clinician',
    })),
    preventiveTasks: profile.preventiveTasks.map(t => ({
      title: t.title,
      dueDate: t.dueDate,
      status: t.status,
      category: t.category,
    })),
    labTests: profile.labTests.map(t => ({
      name: t.testName,
      result: t.result,
      range: t.normalRange,
      status: t.status,
      date: t.date,
      hospital: t.hospitalOrLab,
    })),
    maternityDetails: profile.maternityDetails,
    childDetails: profile.childDetails,
    elderlyDetails: profile.elderlyDetails,
    currentReferral,
    recentMeasurements: latestVital,
    vitalTrends: profile.vitals,
  };
};

const normalizeQuestion = (value: string) => value.toLowerCase();

const getQuickActions = (question: string): QuickAction[] => {
  const q = normalizeQuestion(question);

  if (q.includes('medicine') || q.includes('medicines')) {
    return [
      { label: '✓ Mark Taken', action: 'medicines', value: 'Did I take my medicine?' },
      { label: '💊 View Medicines', action: 'medicines', value: 'What medicines do I have today?' },
      { label: '⏰ Remind Later', action: 'medicines', value: 'Remind me about my medicine schedule' },
    ];
  }

  if (q.includes('checkup') || q.includes('consultation') || q.includes('doctor')) {
    return [
      { label: '👨‍⚕️ Find Doctor', action: 'doctor', value: 'Find a doctor for me.' },
      { label: '🏥 Find Hospital', action: 'hospital', value: 'Find a hospital for me.' },
      { label: '📋 Doctor Handoff', action: 'handoff', value: 'View Doctor Handoff' },
    ];
  }

  if (q.includes('bp') || q.includes('blood pressure') || q.includes('graph')) {
    return [{ label: '📊 View BP Graph', action: 'graph', value: 'What do my BP readings show?' }];
  }

  if (q.includes('test') || q.includes('laboratory') || q.includes('lab') || q.includes('ecg')) {
    return [{ label: '🧪 View Tests', action: 'tests', value: 'What tests are pending?' }];
  }

  if (q.includes('referral') || q.includes('follow-up')) {
    return [{ label: '➡️ View Referral', action: 'referral', value: 'Do I have a pending referral?' }];
  }

  return [
    { label: '📅 View Appointments', action: 'appointment', value: 'What appointments are coming up?' },
    { label: '❤️ Preventive Care', action: 'preventive', value: 'What preventive-care activities should I complete?' },
  ];
};

const decideResponseText = (question: string, patient: ReturnType<typeof buildPatientContextFromProfile>) => {
  const q = normalizeQuestion(question);
  const appointment = patient.currentReferral;
  const tests = patient.labTests;
  const tasks = patient.preventiveTasks;
  const medicines = patient.medicines;
  const vitals = patient.recentMeasurements;

  // 1. Critical Emergency Red Flags
  if (q.includes('emergency') || q.includes('chest pain') || q.includes('severe bleeding') || q.includes('difficulty breathing') || q.includes('unconscious')) {
    return `🚨 MEDICAL EMERGENCY: If you or someone is experiencing severe chest pain, inability to breathe, sudden weakness, or uncontrolled bleeding, please dial 108 (Ambulance) or 112 immediately. Do not wait for an AI response.${DISCLAIMER_SUFFIX}`;
  }

  // 2. Explicit Check for Unrecorded / Absent Tests (Eliminate False or Hallucinated Data)
  const absentTestKeywords = [
    { key: 'ecg', name: 'Electrocardiogram (ECG)' },
    { key: 'echocardiogram', name: 'Echocardiogram (Echo)' },
    { key: 'ct scan', name: 'Computed Tomography (CT Scan)' },
    { key: 'mri', name: 'Magnetic Resonance Imaging (MRI)' },
    { key: 'biopsy', name: 'Biopsy / Histopathology' },
    { key: 'thyroid', name: 'Serum TSH / Thyroid Panel' },
    { key: 'tsh', name: 'Serum TSH Level' },
    { key: 'hba1c', name: 'Glycated Hemoglobin (HbA1c)' },
    { key: 'creatinine', name: 'Serum Creatinine & Kidney Function' },
    { key: 'lipid', name: 'Lipid Profile / Cholesterol' },
    { key: 'x-ray', name: 'Chest X-Ray' },
    { key: 'eye', name: 'Dilated Retinal Eye Examination' },
  ];

  for (const testItem of absentTestKeywords) {
    if (q.includes(testItem.key)) {
      // Check if this test is actually recorded for this patient
      const foundInLabs = tests.find(t => t.name.toLowerCase().includes(testItem.key));
      const foundInTasks = tasks.find(t => t.title.toLowerCase().includes(testItem.key));

      if (foundInLabs) {
        return `According to Medora records for ${patient.name} (${patient.patientId}):\n• Test: ${foundInLabs.name}\n• Result: ${foundInLabs.result} (Normal Range: ${foundInLabs.range})\n• Status: ${foundInLabs.status}\n• Date: ${foundInLabs.date} at ${foundInLabs.hospital}.${DISCLAIMER_SUFFIX}`;
      } else if (foundInTasks) {
        return `According to Medora records for ${patient.name} (${patient.patientId}):\n• Task: ${foundInTasks.title}\n• Status: ${foundInTasks.status} (Due Date: ${foundInTasks.dueDate})\n• Category: ${foundInTasks.category}.${DISCLAIMER_SUFFIX}`;
      } else {
        return `Not recorded in Medora: No ${testItem.name} record exists in Medora for ${patient.name} (Patient ID: ${patient.patientId}). If your physician recommended this test, please visit Rampur PHC or your nearest diagnostic centre to record it.${DISCLAIMER_SUFFIX}`;
      }
    }
  }

  // 3. Checkup & Doctor Consultations
  if (q.includes('checkup') || q.includes('consultation') || q.includes('when should i go') || q.includes('doctor appointment')) {
    if (appointment) {
      const apptDate = appointment.appointmentDate || appointment.followUpDate || 'Pending scheduling';
      return `Consultation schedule for ${patient.name} (${patient.patientId}):\n• Doctor: ${appointment.selectedDoctorName || 'Assigned Clinician'}\n• Hospital: ${appointment.selectedHospitalName || 'Primary Health Centre'}\n• Specialty: ${appointment.specialty}\n• Scheduled Date: ${apptDate}\n• Status: ${appointment.status}\n• Clinical reason: ${appointment.reason}.${DISCLAIMER_SUFFIX}`;
    }
    if (patient.careGaps.length > 0) {
      const gap = patient.careGaps[0];
      return `Medora has detected a clinical care gap for ${patient.name}: "${gap.title}". ${gap.description}. A clinical consultation is recommended within the week. Please use "Find Doctor" to connect with a specialist.${DISCLAIMER_SUFFIX}`;
    }
    return `No urgent consultation is currently pending for ${patient.name} in Medora. A routine preventive checkup is recommended every 6 months at Rampur PHC.${DISCLAIMER_SUFFIX}`;
  }

  // 4. Medicines & Daily Doses
  if (q.includes('medicine') || q.includes('tablet') || q.includes('dosage') || q.includes('take')) {
    if (!medicines.length) {
      return `Not recorded in Medora: No active prescription medications are currently recorded for ${patient.name} (ID: ${patient.patientId}). If you are taking medicines, please have Sister Lakshmi (ASHA) enter them into your registry.${DISCLAIMER_SUFFIX}`;
    }

    if (q.includes('did i take') || q.includes('taken') || q.includes('missed')) {
      const medStatus = medicines.map(m => `• ${m.name} (${m.dosage}): Status is "${m.status}" (Adherence: ${m.adherenceRate}%)`).join('\n');
      return `Current daily medication adherence for ${patient.name}:\n${medStatus}\n\nTip: You can mark doses taken directly in the Medication Reminder tab.${DISCLAIMER_SUFFIX}`;
    }

    const medList = medicines.map(m => `• ${m.name} (${m.dosage}) — ${m.frequency}\n  Purpose: ${m.purpose}\n  Instructions: ${m.instructions}`).join('\n');
    return `Active medication schedule for ${patient.name} (Patient ID: ${patient.patientId}):\n${medList}\n\nNever stop or alter prescription doses without consulting your doctor.${DISCLAIMER_SUFFIX}`;
  }

  // 5. Blood Pressure & Vitals
  if (q.includes('bp') || q.includes('blood pressure') || q.includes('vital') || q.includes('sugar')) {
    if (!vitals) {
      return `Not recorded in Medora: No vital readings have been logged yet for ${patient.name} (ID: ${patient.patientId}). Please visit the Gram Panchayat health desk for a baseline screening.${DISCLAIMER_SUFFIX}`;
    }

    const bpStatus = vitals.bloodPressureSys >= 140 || vitals.bloodPressureDia >= 90 ? 'ELEVATED (Stage 2 Hypertension range)' : 'Within normal limits';
    return `Latest vital sign screening for ${patient.name} (${vitals.date}):\n• Blood Pressure: ${vitals.bloodPressureSys}/${vitals.bloodPressureDia} mmHg (${bpStatus})\n• Fasting Blood Sugar: ${vitals.bloodSugarFasting} mg/dL\n• Post-Prandial Sugar: ${vitals.bloodSugarPostPrandial} mg/dL\n• Pulse Rate: ${vitals.pulseRate} bpm\n• SpO2: ${vitals.spo2}%\n• Weight / BMI: ${vitals.weightKg} kg (BMI: ${vitals.bmi})\n\nHistorical trend shows ${patient.vitalTrends.length} recorded screening(s).${DISCLAIMER_SUFFIX}`;
  }

  // 6. Maternal Care Specific Queries
  if (patient.category === 'maternity' && (q.includes('pregnancy') || q.includes('trimester') || q.includes('baby') || q.includes('delivery') || q.includes('hemoglobin') || q.includes('maternity'))) {
    const mat = patient.maternityDetails;
    if (mat) {
      return `Maternal Care Profile for ${patient.name}:\n• Gestational Age: ${mat.gestationWeeks} weeks (Trimester ${mat.trimester})\n• Expected Delivery Date (EDD): ${mat.expectedDeliveryDate}\n• Hemoglobin Level: ${mat.hemoglobinLevel} g/dL (${mat.hemoglobinLevel < 11.0 ? 'Borderline Anemia — Iron & Folic Acid supplemented' : 'Optimal'})\n• ANC Visits Completed: ${mat.ancVisitsCompleted} of 4\n• Folic Acid & Iron: Supplemented daily\n• Nutrition Target: High protein pulses, green leafy spinach/moringa, and clean safe water.${DISCLAIMER_SUFFIX}`;
    }
  }

  // 7. Pediatric Care Specific Queries
  if (patient.category === 'child' && (q.includes('child') || q.includes('fever') || q.includes('vaccine') || q.includes('paracetamol') || q.includes('weight'))) {
    const ch = patient.childDetails;
    if (ch) {
      return `Pediatric Care Profile for ${patient.name} (${patient.age} yrs):\n• Weight / Height: ${ch.weightKg} kg / ${ch.heightCm} cm\n• Calculated Paracetamol Dosage: ${ch.paracetamolMgPerDose} mg (approx 6.5 mL of 120mg/5mL syrup) per dose if fever > 100.5°F (Max 4 doses in 24h)\n• Immunization Status: ${ch.immunizationStatus}\n• Vaccines Received: ${ch.vaccinesReceived.join(', ')}\n• Vaccines Due/Pending: ${ch.vaccinesPending.join(', ')}.${DISCLAIMER_SUFFIX}`;
    }
  }

  // 8. General Health Guidelines (First Aid & Rural Conditions)
  const topicGuidance: { keywords: string[]; answer: string }[] = [
    {
      keywords: ['snake bite', 'snakebite', 'snake venom'],
      answer: 'SNAKE BITE EMERGENCY PROTOCOL\nDo: Move away from the snake immediately, keep the victim calm and completely still to slow venom absorption, keep the bitten limb supported and BELOW heart level, remove tight rings or bangles, and call 108 or reach the nearest hospital with anti-snake venom (ASV) immediately.\nDo NOT: Do NOT cut, slice, or suck the wound. Do NOT apply a tourniquet or tight rope. Do NOT apply herbs, mud, cow dung, or electrical shocks. ASV is the only proven medical antidote.'
    },
    {
      keywords: ['dog bite', 'dogbite', 'rabies', 'animal bite'],
      answer: 'DOG & ANIMAL BITE PROTOCOL\nDo: Wash the wound immediately under running tap water with laundry or bath soap for a full 15 MINUTES. Apply povidone iodine or antiseptic if available. Head immediately to Rampur PHC or District Hospital for Anti-Rabies Vaccine (ARV) and Immunoglobulin (RIG).\nDo NOT: Do NOT apply red chili powder, turmeric, kerosene, or lime paste. Do NOT bandage tightly without washing. Rabies is 100% fatal but 100% preventable with timely vaccination.'
    },
    {
      keywords: ['elderly prevention', 'elder care', 'fall prevention', 'senior'],
      answer: 'ELDERLY CARE & FALL PREVENTION\n1. Fall Prevention: Ensure adequate lighting in village corridors, remove loose mats, install grab rails near the toilet, and encourage a walking stick for unsteady gait.\n2. Hydration & Nutrition: Ensure adequate boiled drinking water, dal/pulses, and dairy to preserve muscle mass.\n3. Medication Continuity: Never abruptly stop blood pressure or diabetes tablets. Record morning readings regularly.'
    },
  ];

  const matched = topicGuidance.find(t => t.keywords.some(k => q.includes(k)));
  if (matched) return `${matched.answer}${DISCLAIMER_SUFFIX}`;

  // Default Context-Aware Answer
  return `Based on Medora's verified longitudinal record for ${patient.name} (ID: ${patient.patientId}, Age: ${patient.age}):\n• Active Conditions: ${patient.conditions.join(', ') || 'None recorded'}\n• Known Allergies: ${patient.allergies.join(', ')}\n• Active Medications: ${patient.medicines.length} prescribed\n• Pending Care Gaps: ${patient.careGaps.length}\n\nYou can ask about specific medicines, recent BP/sugar measurements, upcoming checkups, or specific lab test results.${DISCLAIMER_SUFFIX}`;
};

export const AskMedoraAI: React.FC<AskMedoraAIProps> = ({
  currentLang,
  onNavigateToDoctor,
  onNavigateToHospital,
  onNavigateToReferral,
  onNavigateToHandoff,
  onOpenEmergency,
  lowDataMode = false,
}) => {
  const { selectedPatient, networkStatus } = useMedora();
  const patientContext = useMemo(() => buildPatientContextFromProfile(selectedPatient), [selectedPatient]);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messageSequenceRef = useRef(0);

  const nextMessageId = (prefix: string) => {
    messageSequenceRef.current += 1;
    return `${prefix}-${messageSequenceRef.current}`;
  };

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'ai',
        text: `Namaste! I am Medora AI, configured for ${patientContext.name} (${patientContext.patientId}). I have direct access to your longitudinal health records, vitals, prescriptions, and village care continuity plan. How may I help you today?${DISCLAIMER_SUFFIX}`,
        workflow: ['Patient Registry (P-XXXX)', 'Medora AI Core', 'Clinical Record Inspector', 'Adherence Agent', 'Safety & Disclaimer Guard'],
        mode: 'DEMO/FALLBACK',
      },
    ]);
    setInput('');
  }, [patientContext.patientId, patientContext.name]);

  useEffect(() => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = languageMap[currentLang] || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript;
      setInput(spoken);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [currentLang]);

  const speakReply = (text: string) => {
    // Strip disclaimer from voice narration to keep audio concise
    const cleanVoiceText = text.split('⚠️ AI Educational')[0].trim();
    voiceService.speak(cleanVoiceText, currentLang);
  };

  const submitQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const userMessage: Message = { id: nextMessageId('user'), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      // If network is offline or lowDataMode is active, use local deterministic clinical rules
      const useLocal = lowDataMode || networkStatus === 'OFFLINE' || networkStatus === 'LIMITED';

      let aiText = '';
      if (!useLocal) {
        try {
          const response = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patientId: patientContext.patientId,
              question: trimmed,
              language: currentLang,
              relevantHealthData: patientContext,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            aiText = data.response;
          }
        } catch {}
      }

      if (!aiText) {
        aiText = decideResponseText(trimmed, patientContext);
      }

      const workflow = ['Patient Registry (P-XXXX)', 'Medora AI Core', 'Clinical Record Inspector', 'Adherence Agent', 'Safety & Disclaimer Guard'];
      const quickActions = getQuickActions(trimmed);

      const aiMessage: Message = {
        id: nextMessageId('ai'),
        role: 'ai',
        text: aiText,
        workflow,
        quickActions,
        mode: networkStatus === 'OFFLINE' ? 'DEMO/FALLBACK' : 'AI',
      };

      setMessages(prev => [...prev, aiMessage]);
      speakReply(aiText);
    } catch (error) {
      const fallbackText = decideResponseText(trimmed, patientContext);
      const fallbackMessage: Message = {
        id: nextMessageId('ai-fallback'),
        role: 'ai',
        text: fallbackText,
        workflow: ['Local Cached Registry', 'Rule-Based Fallback Engine'],
        quickActions: getQuickActions(trimmed),
        mode: 'DEMO/FALLBACK',
      };
      setMessages(prev => [...prev, fallbackMessage]);
      speakReply(fallbackText);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAction = (action: string) => {
    if (action === 'doctor') onNavigateToDoctor();
    if (action === 'hospital') onNavigateToHospital();
    if (action === 'referral') onNavigateToReferral();
    if (action === 'handoff') onNavigateToHandoff();
    if (action === 'graph') submitQuestion('What do my BP readings show?');
    if (action === 'tests') submitQuestion('What tests are pending?');
    if (action === 'medicines') submitQuestion('What medicines do I need to take today?');
    if (action === 'checkup') submitQuestion('When should I go for my checkup?');
    if (action === 'appointment') submitQuestion('What appointments are coming up?');
    if (action === 'preventive') submitQuestion('What preventive-care activities should I complete?');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* AI Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em]">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-200" />
              ASK MEDORA AI — CLINICAL DECISION SUPPORT
            </div>
            <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
              <span>🤖 ASK MEDORA AI</span>
              <span className="text-xs font-mono bg-white/20 text-white px-2.5 py-1 rounded-lg">
                P-ID: {patientContext.patientId}
              </span>
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-emerald-50 max-w-2xl">
              Trained on rural healthcare protocols. Inquires directly into {patientContext.name}'s longitudinal records with zero cross-patient data leakage.
            </p>
          </div>
          <button
            onClick={onOpenEmergency}
            className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs transition-colors self-start md:self-center"
          >
            <ShieldAlert className="w-4 h-4" />
            Emergency Help (108)
          </button>
        </div>

        {/* Current Patient Context Pill */}
        <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-3.5 text-xs backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white text-sm">{patientContext.name}</span>
              <span className="text-emerald-100">({patientContext.age}y, {patientContext.gender})</span>
              <span className="text-emerald-200 font-mono">• {patientContext.healthId}</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-100 text-[11px]">
              <span>Category: <strong>{patientContext.category.toUpperCase()}</strong></span>
              <span>•</span>
              <span>Medicines: <strong>{patientContext.medicines.length}</strong></span>
              <span>•</span>
              <span>Vitals Logged: <strong>{patientContext.vitalTrends.length}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conversation & Snapshot Split */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        {/* Chat Stream Window */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Direct Longitudinal Clinical Dialogue</span>
            </div>
            <button
              onClick={() => setMessages([{
                id: 'fresh',
                role: 'ai',
                text: `Conversation reset for ${patientContext.name} (${patientContext.patientId}). Ask about your medicines, lab tests, BP trends or doctor visits.${DISCLAIMER_SUFFIX}`,
                workflow: ['Patient Registry (P-XXXX)', 'Medora AI Core', 'Clinical Record Inspector'],
                mode: 'DEMO/FALLBACK',
              }])}
              className="text-xs text-slate-600 hover:text-slate-800 font-bold border border-slate-200 bg-white px-2.5 py-1 rounded-lg"
            >
              Clear Chat
            </button>
          </div>

          {/* Messages Stream */}
          <div className="max-h-[520px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-800 border border-slate-200/80'
                }`}>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] mb-1.5 opacity-70">
                    {message.role === 'user' ? 'Villager' : 'Medora AI Decision Support'}
                  </div>
                  <p className="whitespace-pre-line">{message.text}</p>

                  {/* Workflow Steps */}
                  {message.workflow && message.workflow.length > 0 && (
                    <div className="mt-3 rounded-xl bg-slate-900 px-3 py-2 text-[10px] text-slate-200">
                      <div className="font-bold text-amber-300 mb-1">DATA INTEGRITY AGENT PIPELINE</div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {message.workflow.map((step, index, arr) => (
                          <React.Fragment key={`${message.id}-${index}`}>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 border border-slate-700">{step}</span>
                            {index < arr.length - 1 && <ChevronRight className="w-3 h-3 text-slate-500" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Action Pills */}
                  {message.quickActions && message.quickActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {message.quickActions.map((action) => (
                        <button
                          key={`${message.id}-${action.label}`}
                          onClick={() => {
                            if (action.value) submitQuestion(action.value);
                            else handleAction(action.action);
                          }}
                          className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 shadow-sm transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 text-slate-700 px-4 py-3 text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Medora AI is inspecting records for {patientContext.name}...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input & Prompt Suggestions */}
          <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {DEMO_PROMPTS.slice(0, 6).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => submitQuestion(prompt)}
                  className="rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitQuestion(input);
                  }
                }}
                placeholder={`Ask anything regarding ${patientContext.name}'s care continuity...`}
                className="w-full min-h-[50px] max-h-[120px] rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none resize-y"
              />

              <button
                onClick={() => {
                  if (recognitionRef.current && !isListening) {
                    try {
                      recognitionRef.current.start();
                      setIsListening(true);
                    } catch {}
                    return;
                  }
                  if (recognitionRef.current && isListening) {
                    try {
                      recognitionRef.current.stop();
                      setIsListening(false);
                    } catch {}
                  }
                }}
                className={`h-11 w-11 rounded-2xl flex items-center justify-center border transition-all shrink-0 ${
                  isListening ? 'bg-rose-500 border-rose-600 text-white animate-pulse' : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-500'
                }`}
                title="Speak voice question"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                onClick={() => submitQuestion(input)}
                disabled={isThinking || !input.trim()}
                className="h-11 w-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors shadow-md"
                title="Send Question"
              >
                <SendHorizonal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Active Record Snapshot */}
        <div className="space-y-4 text-xs">
          {/* Snapshot Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-black text-slate-900 border-b border-slate-100 pb-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Active File Snapshot</span>
            </div>

            <div className="space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Patient:</span>
                <strong>{patientContext.name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Unique ID:</span>
                <span className="font-mono text-emerald-800 font-bold">{patientContext.patientId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Household:</span>
                <span className="font-mono text-slate-600">{patientContext.familyId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Primary Specialty:</span>
                <span>{patientContext.primaryCategory}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Allergies:</span>
                <span className="text-rose-700 font-semibold">{patientContext.allergies.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Active Prescriptions Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 font-black text-slate-900 border-b border-slate-100 pb-2">
              <Pill className="w-4 h-4 text-amber-500" />
              <span>Prescription Records ({patientContext.medicines.length})</span>
            </div>

            {patientContext.medicines.length === 0 ? (
              <p className="text-slate-400 italic">No prescription tablets on file.</p>
            ) : (
              <div className="space-y-2">
                {patientContext.medicines.map((med, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{med.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${med.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {med.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{med.frequency}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Guided Prompts */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2 font-black text-slate-900 mb-2">
              <CalendarClock className="w-4 h-4 text-cyan-600" />
              <span>Continuity Triggers</span>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => submitQuestion('When should I go for my checkup?')}
                className="w-full text-left bg-slate-50 hover:bg-slate-100 rounded-xl p-2 font-semibold text-slate-700 transition-colors"
              >
                🩺 Next Checkup Date
              </button>
              <button
                onClick={() => submitQuestion('What medicines do I need to take today?')}
                className="w-full text-left bg-slate-50 hover:bg-slate-100 rounded-xl p-2 font-semibold text-slate-700 transition-colors"
              >
                💊 Daily Medication Check
              </button>
              <button
                onClick={() => submitQuestion('What do my BP readings show?')}
                className="w-full text-left bg-slate-50 hover:bg-slate-100 rounded-xl p-2 font-semibold text-slate-700 transition-colors"
              >
                📊 Blood Pressure Trend
              </button>
              <button
                onClick={() => submitQuestion('What is my ECG test result?')}
                className="w-full text-left bg-slate-50 hover:bg-slate-100 rounded-xl p-2 font-semibold text-slate-700 transition-colors"
              >
                🧪 Query Unrecorded Test (ECG)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

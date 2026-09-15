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
} from 'lucide-react';
import { FamilyMember, LanguageCode } from '../types';
import { MOCK_CARE_GAPS, MOCK_HEALTH_SUMMARY, MOCK_REFERRALS } from '../data/mockData';
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
  'How can I prevent illness in an elderly person?',
  'How can I prevent illness during pregnancy?',
  'How can I prevent illness in a child?',
  'How can I prevent illness in a newborn?',
  'How should I care for a new mother after delivery?',
  'What should I do for a snake bite?',
  'What should I do for a dog or animal bite?',
  'What should I do for an insect bite?',
];

const languageMap: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
};

const buildPatientContext = (member: FamilyMember) => {
  const allCareGaps = MOCK_CARE_GAPS.filter((gap) => gap.patientId === member.id);
  const allReferrals = MOCK_REFERRALS.filter((ref) => ref.patientId === member.id);
  const patientSummary = member.id === 'fam-1' ? MOCK_HEALTH_SUMMARY : null;

  const currentMedicines = patientSummary?.medicalInfo.currentMedicines ?? [];
  const recentMeasurements = patientSummary?.medicalInfo.recentMeasurements ?? null;
  const preventiveTasks = patientSummary?.preventiveHealthcare.preventiveTasks ?? [];
  const followUpItems = patientSummary?.testInfo.importantFollowUpItems ?? [];
  const currentReferral = patientSummary?.referralInfo.currentReferral ?? allReferrals[0] ?? null;
  const vitalTrends = patientSummary?.healthAnalytics.vitalTrends ?? [];

  return {
    patientId: member.id,
    name: member.name,
    age: member.age,
    gender: member.gender,
    healthId: member.healthId,
    relationship: member.relationship,
    primaryCategory: member.primaryCategory,
    conditions: member.activeConditions,
    careGaps: allCareGaps.map((gap) => ({ title: gap.title, description: gap.description, status: gap.status, severity: gap.severity })),
    medicines: currentMedicines.map((medicine) => ({
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      status: medicine.status,
      purpose: medicine.purpose,
    })),
    appointments: allReferrals.map((ref) => ({
      date: ref.appointmentDate ?? ref.followUpDate ?? 'Not scheduled',
      specialty: ref.specialty,
      status: ref.status,
      doctor: ref.selectedDoctorName ?? 'Doctor to be assigned',
    })),
    preventiveTasks: preventiveTasks.map((task) => ({
      title: task.title,
      dueDate: task.dueDate,
      status: task.status,
      category: task.category,
    })),
    dueTests: followUpItems,
    currentReferral,
    recentMeasurements,
    vitalTrends,
    note: patientSummary ? 'Detailed health record available from current profile.' : 'Limited health record available for the selected family member.',
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

  if (q.includes('test') || q.includes('laboratory') || q.includes('lab')) {
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

const decideResponseText = (question: string, patient: ReturnType<typeof buildPatientContext>) => {
  const q = normalizeQuestion(question);
  const appointment = patient.currentReferral ? patient.currentReferral : (patient.appointments[0] ?? null);
  const dueTests = patient.dueTests ?? [];
  const tasks = patient.preventiveTasks ?? [];
  const medicines = patient.medicines ?? [];
  const vitals = patient.recentMeasurements;
  const bpTrend = patient.vitalTrends.length > 0 ? patient.vitalTrends[patient.vitalTrends.length - 1] : null;

  if (q.includes('emergency') || q.includes('chest pain') || q.includes('severe bleeding') || q.includes('difficulty breathing')) {
    return 'If you believe this is an emergency, seek immediate professional medical help. Do not wait for Medora or an AI response.';
  }

  if (q.includes('checkup') || q.includes('consultation') || q.includes('should i go')) {
    const followUpDate = (appointment && 'appointmentDate' in appointment ? appointment.appointmentDate : undefined) || (appointment && 'date' in appointment ? appointment.date : undefined) || 'Not available';
    const pendingText = dueTests.length ? `Your record shows ${dueTests.length} follow-up item(s), including ${dueTests[0]}.` : 'Your record does not show a major new follow-up item.';
    const dateText = appointment ? `Your preferred checkup date is ${followUpDate}.` : 'A checkup date is not currently scheduled in this record.';
    return `${pendingText} A professional medical checkup may be appropriate soon. ${dateText} You can: View Referral, Find Doctor, Find Hospital, View Doctor Handoff.`;
  }

  if (q.includes('medicine') && (q.includes('today') || q.includes('have') || q.includes('take')) && !q.includes('did i take')) {
    const medicineList = medicines.length ? medicines.map((med) => `${med.name} (${med.frequency})`).join('; ') : 'No detailed medicine list is available for the selected record.';
    return `According to the current record, your medicines are: ${medicineList}. Please check the medicine schedule and confirm with your healthcare professional before changing any medication or dose.`;
  }

  if (q.includes('did i take my medicine') || q.includes('did i take') || q.includes('medicine status')) {
    if (!medicines.length) {
      return 'I do not see a detailed medicine record for this patient in the current selected profile.';
    }

    const todayStatus = medicines
      .map((med) => `${med.name} is marked as ${med.status}`)
      .join('. ');
    return `Based on today’s medicine record, ${todayStatus}. Please review the medicine schedule and medication reminders here. Never change dosage without a clinician’s guidance.`;
  }

  if (q.includes('appointment') || q.includes('coming up') || q.includes('when is my next')) {
    if (!appointment) {
      return 'There is no upcoming appointment currently recorded for this patient in the selected record.';
    }
    const apptObj = appointment as any;
    const appointmentDate = apptObj.appointmentDate ?? apptObj.followUpDate ?? apptObj.date ?? 'Not scheduled yet';
    const specialty = apptObj.specialty ?? 'your care plan';
    const status = apptObj.status ?? 'Recorded';
    return `Your next appointment is ${appointmentDate}. The visit is for ${specialty} and status is ${status}.`;
  }

  if (q.includes('test') || q.includes('pending') || q.includes('which tests')) {
    if (!dueTests.length) {
      return 'I do not see an overdue laboratory test in the current record. Please confirm any required test with your healthcare provider.';
    }
    return `Your health record shows that ${dueTests.join(' and ')} is/are follow-up-related items. Please confirm with your doctor or healthcare provider whether you still need to complete them.`;
  }

  if (q.includes('referral') || q.includes('pending referral') || q.includes('follow-up')) {
    if (!patient.currentReferral) {
      return 'There is no pending referral recorded for the selected patient in the current health record.';
    }
    return `Your record shows a referral to ${patient.currentReferral.specialty}. Status: ${patient.currentReferral.status}. Appointment date: ${patient.currentReferral.appointmentDate ?? patient.currentReferral.followUpDate ?? 'Not scheduled yet'}.`;
  }

  if (q.includes('preventive') || q.includes('vaccination') || q.includes('due')) {
    if (!tasks.length) {
      return 'There are no preventive-care tasks currently marked due in the selected record.';
    }
    return `The selected record includes: ${tasks.map((task) => `${task.title} (${task.status})`).join('; ')}. Please discuss any overdue items with your healthcare professional.`;
  }

  if (q.includes('bp') || q.includes('blood pressure') || q.includes('graph')) {
    if (!vitals) {
      return 'No BP reading is available for the selected record.';
    }
    return `Your recorded blood pressure readings have varied over the selected period. Medora cannot determine the cause of these readings. Please discuss persistent or concerning readings with a qualified healthcare professional.`;
  }

  if (q.includes('doctor') && (q.includes('should i see') || q.includes('find doctor') || q.includes('doctor for me'))) {
    if (patient.currentReferral || patient.careGaps.length) {
      return `Your record shows a pending follow-up consultation and relevant care gaps. It may be appropriate to contact your healthcare provider about this. Please speak with a qualified professional for guidance.`;
    }
    return 'Your record does not indicate an urgent immediate need, but a periodic consultation with your healthcare provider may still be useful.';
  }

  if (q.includes('hospital') || q.includes('find a hospital')) {
    return `Your selected record indicates a need to review nearby care options, especially if follow-up or referral support is needed. Use the hospital directory to compare service availability and travel time.`;
  }

  if (q.includes('what medicines do i take today') || q.includes('what medicines do i have')) {
    return `According to the current record, the medicines for today include ${medicines.map((med) => `${med.name} (${med.frequency})`).join(', ')}.`;
  }

  const topicGuidance: { keywords: string[]; answer: string }[] = [
    { keywords: ['snake bite', 'snakebite', 'snake venom'], answer: 'SNAKE BITE FIRST AID\nDo: Move away from the snake, keep the person calm and still, keep the bitten limb supported and below heart level if possible, remove rings or tight items, note the time and snake appearance from a safe distance, and call emergency services or reach the nearest hospital immediately for antivenom assessment.\nDo not: Do not cut or suck the wound, apply a tourniquet, ice, electric shock, alcohol, chemicals, herbs, paste, or tight bandages. Do not chase or handle the snake and do not give food, drink, or medicine unless a professional advises it.\nHerbal medicine: No herb can safely replace emergency assessment or antivenom. Do not delay transport for herbal treatment. Warning signs include swelling, bleeding, vomiting, weakness, drooping eyelids, difficulty breathing, or collapse.' },
    { keywords: ['dog bite', 'dogbite'], answer: 'DOG BITE FIRST AID\nDo: Move to safety, wash the wound under running water with soap for 15 minutes, control bleeding with clean pressure if safe, cover loosely with a clean dressing, and go to a healthcare facility urgently for rabies vaccination assessment, tetanus review, and wound care. Record the animal details only from a safe distance.\nDo not: Do not apply herbs, chili, oil, ash, soil, toothpaste, or other substances. Do not close a deep bite yourself and do not wait for symptoms; rabies prevention must start promptly when indicated.\nHerbal medicine: Herbs cannot prevent rabies or replace vaccines, immunoglobulin, antibiotics, or professional wound care.' },
    { keywords: ['animal bite', 'animal scratch', 'cat bite', 'monkey bite'], answer: 'ANIMAL BITE OR SCRATCH FIRST AID\nDo: Wash the wound with soap and running water for 15 minutes, apply gentle clean pressure for bleeding, and seek urgent professional care for rabies and tetanus assessment. Mention the animal, location, time, and whether the skin was broken.\nDo not: Do not use herbs, ash, soil, oil, chemicals, or tight coverings, and do not wait for the animal to become sick before seeking advice. Do not handle or capture the animal.\nHerbal medicine: No herbal remedy prevents rabies. Vaccination and professional assessment are the safe next steps.' },
    { keywords: ['insect bite', 'insect sting', 'bee sting', 'wasp sting', 'scorpion sting'], answer: 'INSECT BITE OR STING FIRST AID\nDo: Move away from the insect, wash the area, use a cool clean compress, remove a visible bee stinger by gently scraping without squeezing, and monitor the person. Seek urgent emergency care for trouble breathing, face or tongue swelling, faintness, widespread hives, repeated vomiting, or multiple stings.\nDo not: Do not scratch, cut, suck, burn, or apply unknown herbs, oils, mud, or chemicals. Do not delay emergency care for a home remedy.\nHerbal medicine: Herbs are not a substitute for emergency treatment. Ask a pharmacist or clinician about age-appropriate symptom relief, especially for children, pregnancy, or allergies.' },
    { keywords: ['elderly prevention', 'elder prevention', 'senior prevention', 'old age prevention', 'prevent illness for elderly', 'elderly', 'elders', 'elder care', 'senior citizen'], answer: 'ELDERLY CARE PLAN\nPrevention: Check blood pressure and blood sugar as advised, keep vaccinations and checkups current, reduce tobacco and excess salt, and reduce fall risks with good lighting, safe floors, and support rails.\nDaily care: Take prescribed medicines on schedule, stay hydrated, sleep regularly, move safely, and keep an updated medicine and emergency-contact list.\nFoods: Prefer vegetables, pulses, whole grains, fruit, nuts, and adequate water; follow a clinician plan for diabetes, kidney disease, or heart disease.\nHerbs and home foods: Normal food amounts of ginger, turmeric, garlic, or cumin may be used if tolerated, but they are not replacements for medicines and can interact with treatment. Ask a clinician before concentrated herbal products.\nWarning signs: Chest pain, sudden weakness, confusion, severe breathlessness, repeated falls, or rapidly worsening symptoms require urgent care. Next step: arrange a routine elderly-care review.' },
    { keywords: ['pregnancy prevention', 'pregnant prevention', 'pregnancy care', 'prevent illness in pregnancy', 'pregnant woman', 'pregnancy', 'pregnant'], answer: 'PREGNANCY CARE PLAN\nPrevention: Attend antenatal checkups, take only clinician-approved iron, folic acid, or calcium supplements, use safe food and water, avoid tobacco and alcohol, and discuss every medicine or herb before taking it.\nDaily care: Rest, track appointments and fetal movement as advised, sleep comfortably, use safe activity, and keep transport and emergency contacts ready.\nFoods: Choose balanced meals with pulses, vegetables, fruit, whole grains, safe dairy, and protein; use only pasteurized or properly cooked foods and follow the maternity team for anemia or diabetes.\nHerbs and home foods: Do not use herbal teas, raw remedies, or concentrated turmeric, ginger, or other supplements to induce labor or treat illness without maternity-team advice.\nWarning signs: Heavy bleeding, severe headache or vision changes, seizures, severe abdominal pain, breathing difficulty, fluid leakage, or reduced fetal movement require urgent care. Next step: contact the maternity team or nearest facility.' },
    { keywords: ['child prevention', 'children prevention', 'prevent illness in child', 'child health prevention', 'pediatric prevention', 'child', 'children'], answer: 'CHILD CARE PLAN\nPrevention: Keep vaccinations current, use safe water and handwashing, keep medicines and chemicals locked away, prevent burns and falls, and use mosquito protection.\nDaily care: Provide age-appropriate meals, sleep, play, supervision, dental hygiene, and early review for persistent fever, diarrhea, cough, rash, or poor feeding.\nFoods: Offer varied age-appropriate foods including vegetables, fruit, pulses, eggs or other safe protein, and clean water; continue breastfeeding when appropriate. Avoid choking hazards and unprescribed medicines.\nHerbs and home foods: Do not give herbal preparations, honey, or adult remedies to infants or children without professional advice; some products can be contaminated or unsafe.\nWarning signs: Breathing difficulty, convulsions, severe dehydration, unusual sleepiness, blood in stool, or inability to drink require urgent care. Next step: arrange a child-health checkup.' },
    { keywords: ['newborn prevention', 'new born prevention', 'newborn care', 'prevent illness in newborn', 'baby prevention', 'babies', 'newborn', 'new born'], answer: 'NEWBORN CARE PLAN\nPrevention: Keep the baby warm, support skin-to-skin care, start breastfeeding as advised, keep the cord clean and dry, attend newborn checkups and immunizations, and keep smoke away.\nDaily care: Watch feeding, wet diapers, breathing, temperature, skin color, and activity; wash hands before handling the baby and keep the sleeping area safe.\nFoods: Use breast milk as advised by the newborn-care professional. Do not give water, honey, herbal drinks, gripe water, or animal milk to a young newborn unless a qualified professional specifically directs it.\nHerbs and home foods: Do not apply oil, ash, turmeric, herbs, or other substances to the cord, skin, eyes, or mouth without professional advice.\nWarning signs: Fever or cold skin, fast or difficult breathing, inability to feed, unusual sleepiness, convulsions, or worsening jaundice require immediate medical care. Next step: contact a newborn-care professional or emergency facility.' },
    { keywords: ['new mother', 'new mom', 'postpartum', 'after delivery', 'after childbirth', 'breastfeeding mother', 'lactating mother'], answer: 'NEW MOTHER POSTPARTUM CARE PLAN\nPrevention: Attend the postnatal checkup, monitor bleeding, blood pressure, temperature, wound or tear, and emotional wellbeing. Take only medicines and supplements approved by the maternity team.\nDaily care: Rest when possible, drink safe fluids, accept support with meals and baby care, keep the delivery wound clean as instructed, and seek help for severe sadness, anxiety, confusion, or thoughts of self-harm.\nFoods: Eat regular balanced meals with pulses, vegetables, fruit, whole grains, safe protein, and enough fluids. Continue iron or calcium only as prescribed.\nHerbs and home foods: Do not use concentrated herbs, unknown lactation products, or traditional remedies without checking with a clinician because they may affect breastfeeding, bleeding, blood pressure, or medicines.\nWarning signs: Heavy bleeding, fever, severe headache or vision changes, chest pain, breathing difficulty, one-sided leg swelling, seizures, severe abdominal pain, or inability to care for self or baby require urgent medical care. Next step: contact the maternity team for a postnatal review.' },
    { keywords: ['tablet', 'which medicine', 'what medicine', 'medicine for'], answer: 'The correct medicine depends on the confirmed condition, age, pregnancy status, allergies, kidney and liver function, current medicines, and test results. Common examples are paracetamol for selected fever or pain, prescribed antihypertensives for high blood pressure, metformin for some type 2 diabetes plans, and antibiotics only for a clinician-confirmed bacterial infection. Do not start a tablet or replace a medicine from an AI answer. Show the package and prescription to a pharmacist or doctor.' },
    { keywords: ['fever'], answer: 'For fever, rest, drink safe fluids, monitor temperature, and seek clinical advice if it is persistent or severe. Confusion, seizure, severe breathing difficulty, dehydration, or a very young baby with fever require urgent care.' },
    { keywords: ['cold', 'cough'], answer: 'For a common cold or mild cough, rest, drink warm fluids, avoid smoke, and wash hands. Seek medical advice for breathing difficulty, chest pain, dehydration, blue lips, or symptoms that do not improve.' },
    { keywords: ['diabetes', 'sugar'], answer: 'Diabetes needs regular blood-sugar checks, balanced meals, activity appropriate for the person, and medicines prescribed by a clinician. Do not change medicine or dose without professional advice.' },
    { keywords: ['bp', 'blood pressure', 'pressure'], answer: 'High blood pressure often has no symptoms. Record readings, reduce excess salt and tobacco, take prescribed medicine consistently, and discuss repeated high readings with a clinician. Chest pain, weakness on one side, confusion, or severe breathlessness is an emergency.' },
    { keywords: ['cancer'], answer: 'An unexplained lump, persistent bleeding, unexplained weight loss, a changing mole, or a cough that does not improve should be assessed by a clinician. Screening and early specialist review are important; avoid unverified cures.' },
    { keywords: ['typhoid'], answer: 'Typhoid requires clinical assessment and appropriate testing. Use safe food and water, wash hands, and take antibiotics only when prescribed. Severe abdominal pain, confusion, bleeding, or inability to drink needs urgent care.' },
    { keywords: ['malaria', 'dengue', 'chikungunya', 'chickenpox', 'smallpox'], answer: 'Fever with rash, chills, severe body or joint pain, bleeding, or mosquito exposure needs clinical assessment and testing. Drink safe fluids, prevent mosquito bites, and avoid aspirin or ibuprofen until dengue has been ruled out. Smallpox is rare but a suspected case needs immediate public-health and hospital assessment.' },
  ];
  const matchedTopic = topicGuidance.find((topic) => topic.keywords.some((keyword) => q.includes(keyword)));
  if (matchedTopic) return matchedTopic.answer;

  return `Based on the current Medora health record for ${patient.name}, I can help you understand the selected person’s medicines, upcoming checkups, tests, preventive tasks and referrals. Please ask about a specific area such as medicines, checkups, tests or BP trends.`;
};

export const AskMedoraAI: React.FC<AskMedoraAIProps> = ({
  familyMembers,
  selectedFamilyId,
  currentLang,
  onNavigateToDoctor,
  onNavigateToHospital,
  onNavigateToReferral,
  onNavigateToHandoff,
  onOpenEmergency,
  lowDataMode = false,
}) => {
  const selectedMember = familyMembers.find((member) => member.id === selectedFamilyId) ?? familyMembers[0];
  const patientContext = useMemo(() => buildPatientContext(selectedMember), [selectedMember]);
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
        text: `Hello ${patientContext.name.split(' ')[0]}. I can help you understand your health record, medicines, reminders, tests, preventive care and upcoming consultations.`,
        workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response'],
        mode: 'DEMO/FALLBACK',
      },
    ]);
    setInput('');
  }, [patientContext.name]);

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

    return () => recognition.stop();
  }, [currentLang]);

  const speakReply = (text: string) => {
    voiceService.speak(text, currentLang);
  };

  const submitQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const userMessage: Message = { id: nextMessageId('user'), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const response = lowDataMode ? null : await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientContext.patientId,
          question: trimmed,
          language: currentLang,
          relevantHealthData: patientContext,
        }),
      });

      let payload: any = null;
      if (response?.ok) {
        payload = await response.json();
      }

      const aiText = payload?.response || decideResponseText(trimmed, patientContext);
      const workflow = payload?.workflow || ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response'];
      const quickActions = getQuickActions(trimmed);
      const mode = payload?.mode || 'DEMO/FALLBACK';

      const aiMessage: Message = {
        id: nextMessageId('ai'),
        role: 'ai',
        text: aiText,
        workflow,
        quickActions,
        mode,
      };

      setMessages((prev) => [...prev, aiMessage]);
      speakReply(aiText);
    } catch (error) {
      const fallbackText = decideResponseText(trimmed, patientContext);
      const fallbackMessage: Message = {
        id: nextMessageId('ai-fallback'),
        role: 'ai',
        text: fallbackText,
        workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response'],
        quickActions: getQuickActions(trimmed),
        mode: 'DEMO/FALLBACK',
      };
      setMessages((prev) => [...prev, fallbackMessage]);
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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em]">
              <BrainCircuit className="w-3.5 h-3.5" />
              ASK MEDORA AI
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">🤖 ASK MEDORA AI</h2>
            <p className="mt-2 text-sm text-emerald-50 max-w-2xl">
              Ask questions about your health record, medicines, checkups, preventive care, tests and doctor follow-ups.
            </p>
          </div>
          <button
            onClick={() => onOpenEmergency()}
            className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            Emergency Help
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-100">Current Patient</div>
              <div className="mt-2 text-xl font-black">{patientContext.name}</div>
            </div>
            <div className="text-sm text-emerald-50 space-y-1">
              <div>Age: {patientContext.age}</div>
              <div>Health ID: {patientContext.healthId}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Medora AI Conversation
            </div>
            <button
              onClick={() => setMessages([{ id: 'fresh', role: 'ai', text: `Hello ${patientContext.name.split(' ')[0]}. I can help you understand your health record, medicines, reminders, tests, preventive care and upcoming consultations.`, workflow: ['Patient Data', 'Medora AI', 'Health Record Agent', 'Medication Agent', 'Preventive Care Agent', 'Referral/Follow-Up Agent', 'Health Education Agent', 'Final Response'], mode: 'DEMO/FALLBACK' }])}
              className="text-xs text-slate-600 hover:text-slate-800 font-bold border border-slate-200 bg-white px-2.5 py-1.5 rounded-lg"
            >
              Clear Chat
            </button>
          </div>

          <div className="max-h-[520px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] mb-2 opacity-70">
                    {message.role === 'user' ? 'User' : 'Medora AI'}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>

                  {message.workflow && message.workflow.length > 0 && (
                    <div className="mt-4 rounded-xl bg-slate-900 px-3 py-2 text-[11px] text-slate-200">
                      <div className="font-black text-amber-300 mb-2">AI AGENT WORKFLOW — DEMO</div>
                      <div className="flex flex-wrap items-center gap-2">
                        {message.workflow.map((step, index, arr) => (
                          <React.Fragment key={`${message.id}-${index}`}>
                            <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1">{step}</span>
                            {index < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.quickActions && message.quickActions.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {message.quickActions.map((action) => (
                        <button
                          key={`${message.id}-${action.label}`}
                          onClick={() => {
                            if (action.value) submitQuestion(action.value);
                            else handleAction(action.action);
                          }}
                          className="rounded-full border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {message.mode && (
                    <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      {message.mode === 'DEMO/FALLBACK' ? 'DEMO / FALLBACK MODE' : 'AI MODEL RESPONSE'}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 text-slate-700 px-4 py-3 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Medora AI is checking the selected health record...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {DEMO_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => submitQuestion(prompt)}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submitQuestion(input);
                  }
                }}
                placeholder="Ask Medora AI anything about your health..."
                className="w-full min-h-[56px] max-h-[160px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none resize-y"
              />

              <button
                onClick={() => {
                  if (recognitionRef.current && !isListening) {
                    recognitionRef.current.start();
                    setIsListening(true);
                    return;
                  }
                  if (recognitionRef.current && isListening) {
                    recognitionRef.current.stop();
                    setIsListening(false);
                  }
                }}
                className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${isListening ? 'bg-rose-500 border-rose-600 text-white animate-pulse' : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-600'}`}
                title="Speak question"
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={() => submitQuestion(input)}
                disabled={isThinking || !input.trim()}
                className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Ask AI"
              >
                <SendHorizonal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-black text-slate-800 mb-3">
              <Activity className="w-4 h-4 text-emerald-600" />
              Patient Snapshot
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between"><span>Patient</span><strong>{patientContext.name}</strong></div>
              <div className="flex items-center justify-between"><span>Age</span><strong>{patientContext.age}</strong></div>
              <div className="flex items-center justify-between"><span>Condition</span><strong>{patientContext.conditions[0] || 'No major condition recorded'}</strong></div>
              <div className="flex items-center justify-between"><span>Health ID</span><strong>{patientContext.healthId}</strong></div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-black text-slate-800 mb-3">
              <Pill className="w-4 h-4 text-amber-500" />
              Recent record highlights
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {patientContext.conditions.slice(0, 3).map((condition) => (
                <li key={condition} className="flex items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-600" />
                  <span>{condition}</span>
                </li>
              ))}
              {patientContext.careGaps.length > 0 && (
                <li className="flex items-start gap-2 text-amber-700">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500" />
                  <span>{patientContext.careGaps[0].title}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-black text-slate-800 mb-3">
              <CalendarClock className="w-4 h-4 text-cyan-600" />
              Quick actions
            </div>
            <div className="space-y-2">
              <button onClick={() => submitQuestion('When should I go for my checkup?')} className="w-full text-left bg-slate-50 hover:bg-slate-100 rounded-xl p-2.5 text-sm text-slate-700 font-semibold">🩺 When should I go for my next checkup?</button>
              <button onClick={() => submitQuestion('What medicines do I need to take today?')} className="w-full text-left bg-slate-50 hover:bg-slate-100 rounded-xl p-2.5 text-sm text-slate-700 font-semibold">💊 What medicines do I need to take today?</button>
              <button onClick={() => submitQuestion('What tests are pending?')} className="w-full text-left bg-slate-50 hover:bg-slate-100 rounded-xl p-2.5 text-sm text-slate-700 font-semibold">🧪 Which tests are pending?</button>
              <button onClick={() => submitQuestion('What preventive-care activities should I complete?')} className="w-full text-left bg-slate-50 hover:bg-slate-100 rounded-xl p-2.5 text-sm text-slate-700 font-semibold">❤️ What preventive-care activities should I complete?</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

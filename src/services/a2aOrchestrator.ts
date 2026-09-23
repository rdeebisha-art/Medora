import {
  A2ARequest,
  A2AAgentResponse,
  A2AOrchestratorResult,
  A2AAuditEntry,
  AgentName,
  SeverityLevel,
  LanguageCode,
  UserRole,
  NetworkStatus,
} from '../types';
import { isEmergencyQuery } from '../data/medical/emergencyGuidance';
import { FIRST_AID_CARDS, getFirstAidByKeyword } from '../data/medical/firstAid';
import { MEDICAL_DISEASES } from '../data/medical/diseases';
import { MEDICAL_MEDICINES } from '../data/medical/medicines';
import { NUTRITION_GUIDANCE, getNutritionGuidance } from '../data/medical/nutrition';

// ============================================================
// 13 SPECIALIST AGENT IMPLEMENTATIONS
// ============================================================

// Agent 1: Emergency Triage AI
export const runEmergencyTriageAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const q = query.toLowerCase();
  const firstAidCard = getFirstAidByKeyword(q);

  const isSnakeBite = q.includes('snake') || q.includes('venom') || q.includes('snakebite');
  const isChestPain = q.includes('chest pain') || q.includes('heart attack');
  const isUnconscious = q.includes('unconscious') || q.includes('unresponsive') || q.includes('not waking');
  const isSeizure = q.includes('seizure') || q.includes('convuls') || q.includes('fit');

  let topicTitle = 'Emergency Situation';
  let doSteps: string[] = ['Call 108 immediately', 'Keep person calm and still', 'Do not give food or water'];
  let doNotSteps: string[] = [];

  if (firstAidCard) {
    doSteps = firstAidCard.doSteps;
    doNotSteps = firstAidCard.doNotSteps;
    topicTitle = firstAidCard.title;
  }

  const callNumber = isSnakeBite || isChestPain || isUnconscious || isSeizure ? '108' : '108';

  return {
    agent: 'EmergencyTriageAI',
    patientId,
    topic: 'emergency',
    severity: 'CRITICAL',
    summary: `🚨 EMERGENCY DETECTED: ${topicTitle}. Call ${callNumber} IMMEDIATELY. This requires immediate professional medical attention.`,
    whatThisMayMean: [
      `This appears to be a potential ${topicTitle} situation.`,
      'This is a medical emergency that requires immediate professional attention.',
      'Do not wait for symptoms to improve before calling for help.',
    ],
    whatIKnowAboutYou: [
      `Patient ID: ${patientId}`,
      patientContext.allergies?.length ? `Known allergies: ${patientContext.allergies.join(', ')}` : 'No recorded allergies',
      patientContext.bloodGroup ? `Blood group: ${patientContext.bloodGroup}` : 'Blood group not recorded',
      patientContext.chronicConditions?.length ? `Conditions: ${patientContext.chronicConditions.join(', ')}` : 'No recorded conditions',
    ],
    warningSigns: [
      '🚨 This IS the warning sign — act immediately',
      'Any emergency situation that causes loss of consciousness, breathing difficulty, or severe pain requires 108',
    ],
    whatYouCanDoNow: doSteps,
    whenToContactDoctor: [
      '🚨 DO NOT wait for a doctor — call 108 NOW for emergencies',
      `Emergency number: ${callNumber}`,
      'National Emergency: 112',
      'Maternal Emergency Transport: 102',
    ],
    generalInformation: doNotSteps.map(s => `❌ ${s}`),
    questionsForPatient: ['When did this start?', 'Is the person conscious and breathing?', 'What happened immediately before?'],
    clinicianReviewRecommended: true,
    sources: ['AIIMS Emergency Protocols', 'MoHFW Emergency Response Guidelines'],
    missingData: [],
  };
};

// Agent 2: General Health AI
export const runGeneralHealthAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const q = query.toLowerCase();

  const isFever = q.includes('fever') || q.includes('temperature') || q.includes('hot');
  const isBodyPain = q.includes('body pain') || q.includes('body ache') || q.includes('muscle');
  const isBackPain = q.includes('back pain') || q.includes('back ache') || q.includes('lumbar');
  const isLegPain = q.includes('leg pain') || q.includes('leg cramp') || q.includes('calf');
  const isStomach = q.includes('stomach') || q.includes('abdomen') || q.includes('belly');
  const isDehydration = q.includes('dehydrat') || q.includes('thirsty') || q.includes('ors') || q.includes('diarrhea') || q.includes('loose motion');

  let topic = 'general';
  let diseaseId = 'gen-fever';

  if (isFever) { topic = 'fever'; diseaseId = 'gen-fever'; }
  else if (isBodyPain) { topic = 'body-pain'; diseaseId = 'gen-body-pain'; }
  else if (isBackPain) { topic = 'back-pain'; diseaseId = 'gen-back-pain'; }
  else if (isLegPain) { topic = 'leg-pain'; diseaseId = 'gen-leg-pain'; }
  else if (isStomach) { topic = 'stomach'; diseaseId = 'gen-stomach-pain'; }
  else if (isDehydration) { topic = 'dehydration'; diseaseId = 'gen-dehydration'; }

  const disease = MEDICAL_DISEASES.find(d => d.id === diseaseId);
  const age = patientContext.age || 0;
  const conditions = patientContext.chronicConditions || [];
  const medicines = patientContext.medicines || [];

  const whatIKnow: string[] = [
    `Patient: ${patientContext.name} (${patientId}), Age: ${age}`,
    conditions.length ? `Conditions: ${conditions.join(', ')}` : 'No chronic conditions recorded',
    medicines.length ? `Current medicines: ${medicines.map((m: any) => m.name).join(', ')}` : 'No medicines on record',
  ];

  const symptomSummary = disease?.simpleExplanation || `General health concern: ${topic}`;
  const warningSigns = disease?.warningSigns || ['High fever above 103°F', 'Difficulty breathing', 'Loss of consciousness'];
  const prevention = disease?.prevention || ['Stay hydrated', 'Rest adequately', 'Eat nutritious food'];

  let whatToDoNow: string[] = [];
  if (isFever) {
    whatToDoNow = [
      'Take Paracetamol (500mg for adults, 10-15mg/kg for children) with water',
      'Rest in a cool, shaded place',
      'Drink clean boiled water or ORS frequently',
      'Apply cool damp cloth to forehead',
    ];
  } else if (isDehydration) {
    whatToDoNow = [
      'Start ORS (Oral Rehydration Salts) immediately — dissolve 1 sachet in 1 litre boiled water',
      'Give small sips every few minutes — do not force rapid drinking',
      'Continue soft food — do NOT starve (khichdi, curd rice, banana)',
    ];
  } else {
    whatToDoNow = [
      'Rest from heavy activity',
      'Apply warm compress to painful area if applicable',
      'Stay well hydrated',
    ];
  }

  return {
    agent: 'GeneralHealthAI',
    patientId,
    topic,
    severity: warningSigns.some(w => w.includes('103') || w.includes('emergency')) ? 'REVIEW' : 'STABLE',
    summary: symptomSummary,
    whatThisMayMean: disease ? [disease.simpleExplanation, disease.distinguishingFeatures] : [symptomSummary],
    whatIKnowAboutYou: whatIKnow,
    warningSigns,
    whatYouCanDoNow: whatToDoNow,
    whenToContactDoctor: [disease?.whenToSeekCare || 'Consult your PHC doctor if symptoms persist beyond 48 hours.'],
    generalInformation: prevention,
    questionsForPatient: disease?.missingInfoToClarify || ['How long have you had this symptom?', 'Any fever?', 'Any other symptoms?'],
    clinicianReviewRecommended: isFever && age > 60,
    sources: [disease?.source || 'NHM Rural Health Protocol'],
    missingData: [],
  };
};

// Agent 3: Child Care AI
export const runChildCareAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const q = query.toLowerCase();
  const age = patientContext.age || 0;
  const childDetails = patientContext.childDetails;

  const isFever = q.includes('fever') || q.includes('temperature') || q.includes('hot');
  const isVaccine = q.includes('vaccine') || q.includes('vaccination') || q.includes('immuniz');
  const isGrowth = q.includes('weight') || q.includes('height') || q.includes('growth');

  const immunizationInfo = MEDICAL_DISEASES.find(d => d.id === 'ch-immunization');

  const whatIKnow: string[] = [
    `Child: ${patientContext.name} (${patientId}), Age: ${age} year${age !== 1 ? 's' : ''}`,
    childDetails ? `Weight: ${childDetails.weightKg}kg, Height: ${childDetails.heightCm}cm` : 'Growth data not recorded',
    childDetails ? `Immunization: ${childDetails.immunizationStatus}` : 'Immunization status not recorded',
    childDetails?.vaccinesPending?.length ? `Pending vaccines: ${childDetails.vaccinesPending.join(', ')}` : 'No pending vaccines on record',
  ];

  let warningSigns = [
    'Fever above 104°F (40°C)',
    'Unable to drink or breastfeed',
    'Breathing very fast or with difficulty',
    'Limp, unresponsive, or cannot be woken',
    'Convulsions or fits',
    'Sunken eyes and no urination for 6+ hours (dehydration)',
  ];

  let whatToDoNow: string[] = [];
  let summary = `Child health guidance for ${patientContext.name} (Age: ${age})`;

  if (isFever && childDetails) {
    const syrupMl = childDetails.paracetamolMgPerDose > 0 ? (childDetails.paracetamolMgPerDose / 24).toFixed(1) : 'calculate with ASHA';
    summary = `Fever management for ${patientContext.name} (${childDetails.weightKg}kg child)`;
    whatToDoNow = [
      `Paracetamol dose: ${childDetails.paracetamolMgPerDose}mg = approx ${syrupMl} mL of 120mg/5mL syrup`,
      'Give every 6 hours as needed when fever >100.5°F — maximum 4 doses in 24 hours',
      'Plenty of fluids: breast milk, clean water, ORS if loose stools',
      'Cool the child: remove extra clothing, cool damp cloth on forehead',
    ];
  } else if (isVaccine && childDetails) {
    summary = `Vaccination status for ${patientContext.name}`;
    whatToDoNow = [
      `Pending vaccines: ${childDetails.vaccinesPending.join(', ')}`,
      'Visit Rampur PHC or monthly VHND (Village Health Nutrition Day) organized by Sister Lakshmi (ASHA)',
      'Bring Mother-Child Protection (MCP) card to every visit',
    ];
  } else {
    whatToDoNow = [
      'Monitor temperature every 4-6 hours if fever is present',
      'Ensure adequate hydration',
      'Visit PHC if concerned — never hesitate for child health concerns',
    ];
  }

  return {
    agent: 'ChildCareAI',
    patientId,
    topic: isFever ? 'child-fever' : isVaccine ? 'child-vaccination' : 'child-health',
    severity: isFever ? 'REVIEW' : 'STABLE',
    summary,
    whatThisMayMean: ['Child health symptoms need careful attention — children can deteriorate faster than adults.', immunizationInfo?.simpleExplanation || ''],
    whatIKnowAboutYou: whatIKnow,
    warningSigns,
    whatYouCanDoNow: whatToDoNow,
    whenToContactDoctor: ['Visit PHC immediately if any warning sign is present', 'Routine child health checkup recommended every 3 months at Rampur PHC'],
    generalInformation: immunizationInfo?.prevention || ['Follow National Immunization Schedule'],
    questionsForPatient: ['How long has the child had fever?', 'Is the child drinking fluids?', 'Any difficulty breathing?'],
    clinicianReviewRecommended: true,
    sources: ['IMNCI Guidelines — MoHFW', 'Universal Immunization Programme (UIP)'],
    missingData: childDetails ? [] : ['Child growth details not recorded'],
  };
};

// Agent 4: Newborn Care AI
export const runNewbornCareAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const q = query.toLowerCase();
  const childDetails = patientContext.childDetails;

  const isFeeding = q.includes('feed') || q.includes('breastfeed') || q.includes('suck') || q.includes('latch') || q.includes('milk');
  const isJaundice = q.includes('yellow') || q.includes('jaundice');
  const isCord = q.includes('cord') || q.includes('umbilical') || q.includes('navel');

  const whatIKnow: string[] = [
    `Newborn: ${patientContext.name} (${patientId})`,
    childDetails ? `Birth weight: ${childDetails.weightKg}kg, Length: ${childDetails.heightCm}cm` : 'Birth weight not recorded',
    childDetails ? `Birth vaccines: ${childDetails.vaccinesReceived?.join(', ') || 'Not recorded'}` : 'Vaccine record not available',
  ];

  let whatToDoNow: string[] = [];
  let summary = `Newborn care guidance for ${patientContext.name} (0–28 days)`;

  if (isFeeding) {
    summary = 'Newborn breastfeeding guidance';
    whatToDoNow = [
      '🤱 Breastfeed 8–12 times per 24 hours — on demand, both breasts',
      'Ensure deep latch: baby\'s mouth covers areola, not just nipple',
      'Do NOT give water, formula, or anything else — breast milk is complete nutrition',
      'Colostrum (yellow first milk) MUST be given — protects against infection',
      'Good feeding signs: 6+ wet nappies/day, steady weight gain',
    ];
  } else if (isJaundice) {
    summary = 'Newborn jaundice (yellow skin)';
    whatToDoNow = [
      'Mild jaundice after 48 hours of birth: NORMAL — increase breastfeeding frequency',
      'Morning sunlight exposure (filtered) helps — NOT direct strong sun',
      '⚠️ Jaundice appearing in FIRST 24 hours of life: EMERGENCY — go to hospital immediately',
      '⚠️ Jaundice in palms and soles: Visit PHC/hospital today',
    ];
  } else if (isCord) {
    summary = 'Umbilical cord care';
    whatToDoNow = [
      'Keep cord stump CLEAN and DRY — do NOT apply oil, cow dung, ash, or turmeric',
      'Fold nappy below cord stump to allow air circulation',
      '⚠️ Visit PHC if cord is red, swollen, has pus, or smells bad',
    ];
  } else {
    whatToDoNow = [
      'Exclusive breastfeeding — 8-12 times per 24 hours',
      'Keep baby warm with skin-to-skin (Kangaroo Mother Care)',
      'Keep cord stump dry and clean',
      'Watch for warning signs',
    ];
  }

  const warningSigns = [
    '🚨 Unable to feed or suck',
    '🚨 Fast breathing (>60 breaths/minute) or chest indrawing',
    '🚨 Body feels cold to touch or high fever',
    '🚨 Jaundice in first 24 hours or palms/soles yellow',
    '🚨 Redness, swelling, or pus at umbilical cord stump',
  ];

  return {
    agent: 'NewbornCareAI',
    patientId,
    topic: isFeeding ? 'newborn-feeding' : isJaundice ? 'newborn-jaundice' : 'newborn-care',
    severity: 'REVIEW',
    summary,
    whatThisMayMean: ['Newborns (0-28 days) are highly vulnerable. Any concerning sign must be evaluated by a healthcare professional urgently.'],
    whatIKnowAboutYou: whatIKnow,
    warningSigns,
    whatYouCanDoNow: whatToDoNow,
    whenToContactDoctor: ['⚠️ ANY warning sign in a newborn = visit PHC or hospital IMMEDIATELY — do not wait', 'Contact Sister Kavitha (ANM) for home visit support'],
    generalInformation: ['Skin-to-skin contact immediately after birth', 'Colostrum feeding within 1 hour', 'Zero-day vaccines'],
    questionsForPatient: ['Age of baby in days?', 'Is baby able to latch and suck?', 'How many wet nappies in last 24 hours?'],
    clinicianReviewRecommended: true,
    sources: ['IMNCI — MoHFW / UNICEF', 'WHO Postnatal Care Recommendations'],
    missingData: childDetails ? [] : ['Newborn growth data not recorded'],
  };
};

// Agent 5: Pregnancy AI
export const runPregnancyAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const mat = patientContext.maternityDetails;
  const trimester = mat?.trimester || 2;
  const gestationWeeks = mat?.gestationWeeks || 14;
  const hemoglobin = mat?.hemoglobinLevel || 10.2;

  const whatIKnow: string[] = [
    `Patient: ${patientContext.name} (${patientId})`,
    gestationWeeks > 0 ? `Pregnancy: ${gestationWeeks} weeks (Trimester ${trimester})` : 'Gestational age not recorded',
    mat?.expectedDeliveryDate ? `Expected Delivery Date: ${mat.expectedDeliveryDate}` : 'EDD not recorded',
    hemoglobin > 0 ? `Hemoglobin: ${hemoglobin} g/dL ${hemoglobin < 11.0 ? '(⚠️ Borderline anemia — ensure daily IFA)' : '(✅ Adequate)'}` : 'Hemoglobin not recorded',
    `ANC Visits completed: ${mat?.ancVisitsCompleted || 1} of 4 minimum`,
  ];

  return {
    agent: 'PregnancyAI',
    patientId,
    topic: `pregnancy-trimester-${trimester}`,
    severity: hemoglobin < 11 ? 'REVIEW' : 'STABLE',
    summary: `Pregnancy guidance for ${patientContext.name} at ${gestationWeeks} weeks (Trimester ${trimester})`,
    whatThisMayMean: ['Antenatal care is essential for healthy pregnancy outcomes.'],
    whatIKnowAboutYou: whatIKnow,
    warningSigns: [
      '🚨 Vaginal bleeding at any stage',
      '🚨 Severe persistent headache with blurred vision',
      '🚨 Sudden face/hand swelling',
      '🚨 Reduced/absent fetal movements after 24 weeks',
      '🚨 High fever or leaking amniotic fluid',
    ],
    whatYouCanDoNow: [
      'Take Iron & Folic Acid (IFA) tablet daily with lemon water',
      'Take Calcium Carbonate 500mg daily 2 hours apart from IFA',
      'Attend scheduled ANC checkups at Rampur PHC',
      'Ensure nutritious diet with spinach, moringa, ragi, and jaggery',
    ],
    whenToContactDoctor: [
      'Call 102 (Janani Express) IMMEDIATELY if any danger sign appears',
      'Call 108 (Ambulance) for obstetric emergencies',
    ],
    generalInformation: ['Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) guidance applies'],
    questionsForPatient: ['Any spotting or bleeding?', 'Are you feeling fetal movements?', 'Have you taken your IFA tablet today?'],
    clinicianReviewRecommended: true,
    sources: ['PMSMA — MoHFW', 'WHO ANC Recommendations'],
    missingData: [],
  };
};

// Agent 6: New Mother AI
export const runNewMotherAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const q = query.toLowerCase();
  const mat = patientContext.maternityDetails;
  const daysSinceDelivery = mat?.postpartumDaysSinceDelivery || 18;

  const isBreastfeeding = q.includes('breastfeed') || q.includes('milk') || q.includes('latch');

  return {
    agent: 'NewMotherAI',
    patientId,
    topic: isBreastfeeding ? 'breastfeeding' : 'postpartum-care',
    severity: 'REVIEW',
    summary: `Postpartum care guidance for ${patientContext.name} (${daysSinceDelivery} days post-delivery)`,
    whatThisMayMean: ['The 6 weeks after delivery (puerperium) is a critical recovery period.'],
    whatIKnowAboutYou: [
      `New Mother: ${patientContext.name} (${patientId})`,
      `${daysSinceDelivery} days since delivery`,
      mat?.hemoglobinLevel ? `Postpartum Hb: ${mat.hemoglobinLevel} g/dL` : '',
    ].filter(Boolean),
    warningSigns: [
      '🚨 Heavy vaginal bleeding soaking >2 pads in 1 hour',
      '🚨 High fever >100.4°F with foul-smelling discharge',
      '🚨 Severe calf pain or redness (DVT risk)',
      '🚨 Severe persistent headache with high BP',
      '🚨 Extreme sadness or detachment from baby',
    ],
    whatYouCanDoNow: [
      'Breastfeed on demand — 8–12 times in 24 hours, both breasts',
      'Drink at least 3 litres of water/fluids daily to support milk production',
      'Galactagogue foods: Fenugreek (methi) dal, drumstick leaves, garlic',
      'Rest as much as possible — accept help from family for household work',
      'Continue IFA and Calcium tablets for 6 months after delivery',
    ],
    whenToContactDoctor: [
      'Call 102 or 108 for any heavy bleeding or fever',
      '6-week postpartum checkup at Rampur PHC is mandatory',
    ],
    generalInformation: ['Postnatal home visits provided by Sister Lakshmi (ASHA)'],
    questionsForPatient: ['How many days since delivery?', 'How is breastfeeding going?', 'Any fever or unusual vaginal discharge?'],
    clinicianReviewRecommended: true,
    sources: ['Dakshata Postpartum Quality Guidelines', 'WHO Postnatal Care Recommendations'],
    missingData: [],
  };
};

// Agent 7: Elderly AI
export const runElderlyAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const q = query.toLowerCase();
  const elderlyDetails = patientContext.elderlyDetails;
  const isFall = q.includes('fall') || q.includes('fell') || q.includes('slipped') || q.includes('balance');
  const isDizziness = q.includes('dizz') || q.includes('giddy') || q.includes('spinning') || q.includes('lightheaded');

  return {
    agent: 'ElderlyAI',
    patientId,
    topic: isFall ? 'elderly-fall' : isDizziness ? 'elderly-dizziness' : 'elderly-care',
    severity: isDizziness ? 'REVIEW' : 'STABLE',
    summary: `Elderly care guidance for ${patientContext.name} (Age: ${patientContext.age})`,
    whatThisMayMean: ['Elderly health requires careful monitoring of fall risk, blood pressure, and medication adherence.'],
    whatIKnowAboutYou: [
      `Elderly patient: ${patientContext.name} (${patientId}), Age: ${patientContext.age}`,
      patientContext.chronicConditions?.length ? `Conditions: ${patientContext.chronicConditions.join(', ')}` : '',
      elderlyDetails ? `Fall Risk: ${elderlyDetails.fallRiskScore}` : 'Fall risk not assessed',
    ].filter(Boolean),
    warningSigns: [
      '🚨 Sudden weakness or numbness on one side of body (stroke — call 108)',
      '🚨 Dizziness with fainting or loss of consciousness',
      '🚨 Any fall resulting in inability to bear weight on leg/hip',
    ],
    whatYouCanDoNow: [
      'Ensure good lighting in all rooms, especially path to toilet at night',
      'Remove loose rugs and cords from walkways',
      'Rise slowly from bed or chair — sit on edge for 30 seconds before standing',
      'Stay hydrated — drink 1.5–2L water daily',
      'Take BP and chronic medicines regularly without skipping',
    ],
    whenToContactDoctor: [
      'Any fall resulting in hip/leg pain: hospital evaluation immediately',
      'Dizziness with limb weakness or speech change: CALL 108',
      'Dr. Rajeshwar Patil / Dr. Sunita Rao (Geriatrics) at District Hospital',
    ],
    generalInformation: ['National Programme for Health Care of the Elderly (NPHCE) guidelines'],
    questionsForPatient: ['Any falls in the last 6 months?', 'Is dizziness worse after standing up?'],
    clinicianReviewRecommended: true,
    sources: ['NPHCE', 'WHO ICOPE Guidelines'],
    missingData: [],
  };
};

// Agent 8: Diabetes AI
export const runDiabetesAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const q = query.toLowerCase();
  const vitals = patientContext.vitals?.[0];

  const isLowSugar = q.includes('low sugar') || q.includes('hypoglycemia') || q.includes('shaking') || (q.includes('low') && q.includes('sugar'));
  const isHighSugar = q.includes('high sugar') || q.includes('hyperglycemia') || (q.includes('high') && q.includes('sugar'));

  const fastingSugar = vitals?.bloodSugarFasting;
  const ppSugar = vitals?.bloodSugarPostPrandial;

  let whatToDoNow: string[] = [];
  let severity: SeverityLevel = 'REVIEW';
  let summary = `Diabetes management for ${patientContext.name}`;

  if (isLowSugar) {
    severity = 'URGENT';
    summary = 'Low blood sugar (Hypoglycemia) response';
    whatToDoNow = [
      '1. Give 1 tablespoon of sugar or honey dissolved in water IMMEDIATELY',
      '2. Alternatively: 2–3 glucose biscuits or 1 small glass fruit juice',
      '3. Wait 15 minutes, then re-check symptoms',
      '4. If symptoms improve: follow with a full meal (rice, roti)',
      '⚠️ If person is UNCONSCIOUS: Do NOT give anything by mouth — CALL 108 immediately',
    ];
  } else if (isHighSugar) {
    severity = fastingSugar && fastingSugar > 300 ? 'URGENT' : 'REVIEW';
    summary = 'High blood sugar (Hyperglycemia) guidance';
    whatToDoNow = [
      'Take prescribed diabetes medicines as scheduled — do NOT skip doses',
      'Drink adequate water (2–3 litres/day)',
      'Avoid sugary foods, fruit juice, white rice in large quantities',
      'Walk 20–30 minutes after meals if physically able',
    ];
  } else {
    whatToDoNow = [
      `Current fasting sugar: ${fastingSugar ? `${fastingSugar} mg/dL` : 'Not recorded'}`,
      `Current post-meal sugar: ${ppSugar ? `${ppSugar} mg/dL` : 'Not recorded'}`,
      'Take diabetes medicines consistently at fixed times daily',
      'Choose low GI foods: ragi, jowar, dal, bitter gourd, green leafy vegetables',
    ];
  }

  return {
    agent: 'DiabetesAI',
    patientId,
    topic: isLowSugar ? 'hypoglycemia' : isHighSugar ? 'hyperglycemia' : 'diabetes-management',
    severity,
    summary,
    whatThisMayMean: ['Diabetes requires consistent monitoring, medication, and lifestyle management.'],
    whatIKnowAboutYou: [
      `Patient: ${patientContext.name} (${patientId})`,
      fastingSugar ? `Fasting Blood Sugar: ${fastingSugar} mg/dL` : 'Fasting sugar not recorded',
      ppSugar ? `Post-Prandial Sugar: ${ppSugar} mg/dL` : 'PP sugar not recorded',
    ],
    warningSigns: [
      'Blood sugar <70 mg/dL with shaking, sweating, confusion (hypoglycemia)',
      'Blood sugar >300 mg/dL with vomiting (diabetic emergency)',
      'Non-healing wound on foot',
    ],
    whatYouCanDoNow: whatToDoNow,
    whenToContactDoctor: ['Blood sugar consistently >200 mg/dL fasting: consult Diabetologist Dr. Kavitha Reddy at Mandya CHC'],
    generalInformation: ['ICMR Diabetes Management Guidelines'],
    questionsForPatient: ['Last blood sugar reading?', 'Did you take your medicine today?'],
    clinicianReviewRecommended: true,
    sources: ['ICMR Diabetes Guidelines'],
    missingData: [],
  };
};

// Agent 9: Blood Pressure AI
export const runBloodPressureAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const vitals = patientContext.vitals?.[0];
  const sys = vitals?.bloodPressureSys || 0;
  const dia = vitals?.bloodPressureDia || 0;

  let bpCategory = 'unknown';
  let severity: SeverityLevel = 'STABLE';
  let bpInterpretation = 'No BP recorded';

  if (sys > 0) {
    if (sys >= 180 || dia >= 120) { bpCategory = 'hypertensive-crisis'; severity = 'CRITICAL'; bpInterpretation = `${sys}/${dia} mmHg — HYPERTENSIVE CRISIS. Seek emergency care NOW.`; }
    else if (sys >= 140 || dia >= 90) { bpCategory = 'stage1-hypertension'; severity = 'REVIEW'; bpInterpretation = `${sys}/${dia} mmHg — Elevated / Stage 1 Hypertension.`; }
    else if (sys < 90 || dia < 60) { bpCategory = 'hypotension'; severity = 'REVIEW'; bpInterpretation = `${sys}/${dia} mmHg — Low Blood Pressure. Rise slowly. Hydrate.`; }
    else { bpCategory = 'normal'; severity = 'STABLE'; bpInterpretation = `${sys}/${dia} mmHg — Normal range. Continue current care.`; }
  }

  return {
    agent: 'BloodPressureAI',
    patientId,
    topic: 'bp-monitoring',
    severity,
    summary: bpInterpretation,
    whatThisMayMean: ['Blood pressure control is essential for preventing heart attack, stroke, and kidney disease.'],
    whatIKnowAboutYou: [
      `Patient: ${patientContext.name} (${patientId})`,
      vitals ? `Latest BP: ${sys}/${dia} mmHg (${vitals.date})` : 'BP not recorded in Medora',
    ],
    warningSigns: [
      'BP >180/120 mmHg (hypertensive crisis — call 108)',
      'Sudden severe headache with vision changes',
      'Chest pain or difficulty breathing',
    ],
    whatYouCanDoNow: [
      'Take prescribed blood pressure medicines consistently without missing doses',
      'Reduce salt intake in daily cooking (avoid pickles, papads, extra salt)',
      'Walk 30 minutes daily if physically able',
      'Monthly BP monitoring with ASHA Sister Lakshmi',
    ],
    whenToContactDoctor: ['BP >160/100 consistently: consult doctor at Rampur PHC'],
    generalInformation: ['Indian Hypertension Control Initiative (IHCI) guidelines'],
    questionsForPatient: ['When did you last take your BP medicine?', 'Have you had any headache or dizziness?'],
    clinicianReviewRecommended: severity !== 'STABLE',
    sources: ['IHCI', 'JNC 8 Guidelines'],
    missingData: vitals ? [] : ['No recent BP recorded'],
  };
};

// Agent 10: Neurology AI
export const runNeurologyAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const q = query.toLowerCase();
  const isMigraine = q.includes('migraine') || q.includes('one side') || q.includes('throbbing') || q.includes('aura');
  const isStrokeRisk = q.includes('weakness') || q.includes('face drooping') || q.includes('slurred') || q.includes('arm weak');

  let severity: SeverityLevel = 'STABLE';
  if (isStrokeRisk) severity = 'CRITICAL';
  else if (isMigraine) severity = 'REVIEW';

  return {
    agent: 'NeurologyAI',
    patientId,
    topic: isStrokeRisk ? 'stroke-warning' : isMigraine ? 'migraine' : 'headache',
    severity,
    summary: isStrokeRisk ? 'Possible Stroke Warning Signs' : isMigraine ? 'Migraine vs Tension Headache differentiation' : 'Headache guidance',
    whatThisMayMean: [
      isMigraine ? 'Migraine differs from tension headache: ONE-SIDED, THROBBING, worsens with movement, sensitivity to light/sound.' : 'Headache is a symptom with multiple potential causes.',
    ],
    whatIKnowAboutYou: [`Patient: ${patientContext.name} (${patientId}), Age: ${patientContext.age || 0}`],
    warningSigns: [
      '🚨 Sudden worst headache of life (\'thunderclap\') — call 108',
      '🚨 Headache with face drooping, arm weakness, speech difficulty (stroke)',
      '🚨 Headache with fever and stiff neck (meningitis)',
    ],
    whatYouCanDoNow: isStrokeRisk ? [
      '🚨 Use FAST: Face drooping, Arm weakness, Speech slurred, Time to call 108 NOW',
      'Do not give food or water',
      'Call 108 IMMEDIATELY',
    ] : [
      'Rest in quiet, dark room',
      'Paracetamol 500mg with 2 glasses of water',
      'Ensure adequate hydration',
    ],
    whenToContactDoctor: ['Headaches >3 times per week: consult PHC doctor'],
    generalInformation: ['Indian Academy of Neurology Guidelines'],
    questionsForPatient: ['Is the headache on one side or both?', 'Does light or sound make it worse?'],
    clinicianReviewRecommended: isMigraine || isStrokeRisk,
    sources: ['Indian Academy of Neurology'],
    missingData: [],
  };
};

// Agent 11: Infectious Disease AI
export const runInfectiousDiseaseAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const q = query.toLowerCase();
  const isTyphoid = q.includes('typhoid') || (q.includes('step ladder') && q.includes('fever'));
  const isChikungunya = q.includes('chikungunya') || (q.includes('joint') && q.includes('fever'));
  const isTB = q.includes('tuberculosis') || q.includes(' tb ') || q.includes('cough blood');

  let summary = 'Infectious disease information';
  let severity: SeverityLevel = 'REVIEW';

  if (isTyphoid) {
    summary = 'Typhoid vs General Fever — Key Differences';
  } else if (isChikungunya) {
    summary = 'Chikungunya — Features and Management';
  } else if (isTB) {
    summary = 'Tuberculosis (TB) — Symptoms and Free Treatment';
    severity = 'URGENT';
  }

  return {
    agent: 'InfectiousDiseaseAI',
    patientId,
    topic: 'infectious-disease',
    severity,
    summary,
    whatThisMayMean: [
      isTyphoid ? 'Typhoid: Step-ladder fever pattern, severe abdominal discomfort, contaminated water source. Requires Widal test at PHC.' :
      isChikungunya ? 'Chikungunya: Fever + SEVERE JOINT PAIN lasting weeks, mosquito-borne. Rest, hydration, paracetamol.' :
      isTB ? 'TB: Chronic low-grade evening fever >2 weeks, persistent cough, weight loss. Free sputum test & treatment at PHC.' :
      'Infectious diseases require lab confirmation — Medora provides educational guidance only.',
    ],
    whatIKnowAboutYou: [`Patient: ${patientContext.name} (${patientId})`],
    warningSigns: [
      '🚨 High fever >103°F lasting >3 days',
      '🚨 Bleeding from gums or skin (dengue warning)',
      '🚨 Cough with blood (TB warning)',
    ],
    whatYouCanDoNow: [
      'Drink only boiled or filtered water',
      'Use mosquito nets and eliminate water stagnation',
      'Visit Rampur PHC for lab testing (Widal / Sputum test)',
      'Do NOT take antibiotics without prescription',
    ],
    whenToContactDoctor: ['Visit PHC if fever lasts >48 hours'],
    generalInformation: ['National Vector Borne Disease Control Programme (NVBDCP)'],
    questionsForPatient: ['How many days of fever?', 'Any joint pain?', 'Boiled or unfiltered water?'],
    clinicianReviewRecommended: true,
    sources: ['NVBDCP', 'RNTCP India'],
    missingData: [],
  };
};

// Agent 12: Nutrition AI
export const runNutritionAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const category = patientContext.category || 'adult';
  const guide = getNutritionGuidance(category) || getNutritionGuidance('general');

  return {
    agent: 'NutritionAI',
    patientId,
    topic: `nutrition-${category}`,
    severity: 'INFO',
    summary: `Nutrition guidance for ${patientContext.name} (${category})`,
    whatThisMayMean: [guide?.title || 'Nutritional guidance for current health status'],
    whatIKnowAboutYou: [`Patient: ${patientContext.name} (${patientId}), Category: ${category}`],
    warningSigns: guide?.warningSigns || [],
    whatYouCanDoNow: [
      ...(guide?.keyFoods?.map(f => `✅ Include: ${f}`) || []),
      ...(guide?.foodsToAvoid?.slice(0, 3).map(f => `❌ Avoid: ${f}`) || []),
    ],
    whenToContactDoctor: ['Consult ASHA Sister Lakshmi or PHC doctor for nutritional support'],
    generalInformation: guide?.localFoodSuggestions || [],
    questionsForPatient: ['What is your typical daily diet?'],
    clinicianReviewRecommended: false,
    sources: [guide?.source || 'National Institute of Nutrition (NIN)'],
    missingData: [],
  };
};

// Agent 13: Medication AI
export const runMedicationAgent = (query: string, patientContext: Record<string, any>, patientId: string): A2AAgentResponse => {
  const q = query.toLowerCase();
  const allergies = patientContext.allergies || [];

  const foundMedicine = MEDICAL_MEDICINES.find(med =>
    med.genericName.toLowerCase().split(' ').some(part => q.includes(part.toLowerCase())) ||
    med.commonBrandNames.some(brand => q.includes(brand.toLowerCase()))
  );

  if (!foundMedicine) {
    return {
      agent: 'MedicationAI',
      patientId,
      topic: 'medication-unknown',
      severity: 'INFO',
      summary: 'Medicine query — Medora Medicine Guide',
      whatThisMayMean: ['Consult doctor or PHC pharmacist for medicine instructions.'],
      whatIKnowAboutYou: [`Patient: ${patientContext.name} (${patientId})`, `Allergies: ${allergies.join(', ') || 'None'}`],
      warningSigns: ['Never take unprescribed medicines without consulting a healthcare provider.'],
      whatYouCanDoNow: ['Bring medicine packet to PHC visit', 'Take medicines with clean water at scheduled times'],
      whenToContactDoctor: ['Consult prescribing doctor or PHC pharmacist'],
      generalInformation: ['Medora Medicine Knowledge Base'],
      questionsForPatient: ['Who prescribed this medicine?'],
      clinicianReviewRecommended: true,
      sources: ['National Formulary of India'],
      missingData: [],
    };
  }

  const hasAllergyMatch = foundMedicine.allergyWarnings.some(aw =>
    allergies.some((a: string) => a !== 'None' && aw.toLowerCase().includes(a.toLowerCase().split(' ')[0]))
  );

  return {
    agent: 'MedicationAI',
    patientId,
    topic: `medicine-${foundMedicine.medicineId}`,
    severity: hasAllergyMatch ? 'URGENT' : 'INFO',
    summary: `${foundMedicine.genericName} — Medora Medicine Guide`,
    whatThisMayMean: [`Drug Class: ${foundMedicine.drugClass}`, `Indications: ${foundMedicine.indications.join(', ')}`],
    whatIKnowAboutYou: [
      `Patient: ${patientContext.name} (${patientId})`,
      `Allergies: ${allergies.join(', ') || 'None recorded'}`,
      hasAllergyMatch ? `⚠️ ALLERGY ALERT: Potential conflict with recorded allergies` : '',
    ].filter(Boolean),
    warningSigns: foundMedicine.majorWarnings,
    whatYouCanDoNow: [
      foundMedicine.requiresPrescription ? '🔒 Prescription required — take as advised by doctor' : '✅ Available OTC — follow label instructions',
      `Storage: ${foundMedicine.storageInformation}`,
    ],
    whenToContactDoctor: ['Never stop or change prescription medicines without doctor advice'],
    generalInformation: [`Common side effects: ${foundMedicine.commonSideEffects.join(', ')}`],
    questionsForPatient: ['Did your doctor prescribe this?'],
    clinicianReviewRecommended: hasAllergyMatch,
    sources: [foundMedicine.source],
    missingData: [],
  };
};

// ============================================================
// A2A ROUTER & SYNTHESIZER
// ============================================================

const detectTopics = (query: string, patientContext: Record<string, any>): AgentName[] => {
  const q = query.toLowerCase();
  const category = patientContext.category || 'adult';
  const age = patientContext.age || 0;
  const mat = patientContext.maternityDetails;
  const conditions: string[] = patientContext.chronicConditions || [];
  const agents: AgentName[] = [];

  const isPostpartum = mat?.isPostpartum === true;
  const isPregnant = category === 'maternity' && !isPostpartum;
  const isNewborn = category === 'child' && age < 1;
  const isChild = category === 'child' && age >= 1;
  const isElderly = category === 'elderly';

  // Category routing
  if (isNewborn || q.includes('newborn') || q.includes('0 day') || q.includes('just born')) agents.push('NewbornCareAI');
  else if (isPostpartum || q.includes('postpartum') || q.includes('after delivery') || q.includes('new mother')) agents.push('NewMotherAI');
  else if (isPregnant || q.includes('pregnant') || q.includes('pregnancy') || q.includes('trimester')) agents.push('PregnancyAI');
  else if (isChild || (q.includes('child') && age > 0)) agents.push('ChildCareAI');
  else if (isElderly) agents.push('ElderlyAI');

  // Topic routing
  if (q.includes('bp') || q.includes('blood pressure') || q.includes('hypertension') || q.includes('systolic') || q.includes('diastolic')) {
    if (!agents.includes('BloodPressureAI')) agents.push('BloodPressureAI');
  }
  if (q.includes('sugar') || q.includes('glucose') || q.includes('diabetes') || q.includes('diabetic') || q.includes('insulin') || q.includes('metformin')) {
    if (!agents.includes('DiabetesAI')) agents.push('DiabetesAI');
  }
  if (q.includes('headache') || q.includes('migraine') || q.includes('dizz') || q.includes('vertigo') || q.includes('aura') || q.includes('throbbing')) {
    if (!agents.includes('NeurologyAI')) agents.push('NeurologyAI');
  }
  if (q.includes('typhoid') || q.includes('chikungunya') || q.includes('tuberculosis') || q.includes(' tb ') || q.includes('dengue') || q.includes('chickenpox')) {
    if (!agents.includes('InfectiousDiseaseAI')) agents.push('InfectiousDiseaseAI');
  }
  if (q.includes('medicine') || q.includes('tablet') || q.includes('paracetamol') || q.includes('amlodipine') || q.includes('dose') || q.includes('side effect')) {
    if (!agents.includes('MedicationAI')) agents.push('MedicationAI');
  }
  if (q.includes('food') || q.includes('diet') || q.includes('eat') || q.includes('nutrition') || q.includes('vitamin')) {
    if (!agents.includes('NutritionAI')) agents.push('NutritionAI');
  }
  if (q.includes('fever') || q.includes('body pain') || q.includes('back pain') || q.includes('leg pain') || q.includes('stomach') || q.includes('dehydrat') || q.includes('ors')) {
    if (!agents.includes('GeneralHealthAI') && !agents.includes('ChildCareAI') && !agents.includes('NewbornCareAI')) {
      agents.push('GeneralHealthAI');
    }
  }

  if (isElderly) {
    if (conditions.some(c => c.toLowerCase().includes('hypertension') || c.toLowerCase().includes('bp')) && !agents.includes('BloodPressureAI')) agents.push('BloodPressureAI');
    if (conditions.some(c => c.toLowerCase().includes('diabetes') || c.toLowerCase().includes('sugar')) && !agents.includes('DiabetesAI')) agents.push('DiabetesAI');
  }

  if (agents.length === 0) agents.push('GeneralHealthAI');
  return agents;
};

const mergeSeverity = (severities: SeverityLevel[]): SeverityLevel => {
  if (severities.includes('CRITICAL')) return 'CRITICAL';
  if (severities.includes('URGENT')) return 'URGENT';
  if (severities.includes('REVIEW')) return 'REVIEW';
  if (severities.includes('STABLE')) return 'STABLE';
  return 'INFO';
};

const synthesizeResponses = (
  responses: A2AAgentResponse[],
  query: string,
  patientContext: Record<string, any>,
  isEmergency: boolean
): A2AOrchestratorResult['structuredSections'] & { synthesizedText: string } => {
  const allWhatMean = [...new Set(responses.flatMap(r => r.whatThisMayMean))];
  const allWhatIKnow = responses[0]?.whatIKnowAboutYou || [];
  const allWarnings = [...new Set(responses.flatMap(r => r.warningSigns))];
  const allToDo = [...new Set(responses.flatMap(r => r.whatYouCanDoNow))];
  const allWhenDoctor = [...new Set(responses.flatMap(r => r.whenToContactDoctor))];
  const allMissing = [...new Set(responses.flatMap(r => r.missingData))];

  const agentNames = responses.map(r => r.agent).join(' + ');
  const synthesizedText = [
    isEmergency ? '🚨 EMERGENCY DETECTED — Immediate action required' : '',
    `🤖 Medora A2A Agents Invoked: ${agentNames}`,
    '',
    allWhatMean.length ? `📋 Clinical Overview:\n${allWhatMean.map(m => `• ${m}`).join('\n')}` : '',
    '',
    allWarnings.length ? `⚠️ Warning Signs to Watch:\n${allWarnings.map(w => `• ${w}`).join('\n')}` : '',
    '',
    allToDo.length ? `✅ Recommended Actions:\n${allToDo.map(t => `• ${t}`).join('\n')}` : '',
    '',
    allWhenDoctor.length ? `👨‍⚕️ Clinician Consultation:\n${allWhenDoctor.map(d => `• ${d}`).join('\n')}` : '',
    '',
    allMissing.length ? `📝 Records Check:\n${allMissing.map(m => `• ${m}`).join('\n')}` : '',
    '',
    '⚠️ AI Educational Decision Support — Not a Medical Diagnosis. Always consult a licensed clinician.',
  ].filter(s => s !== '').join('\n');

  return {
    whatThisMayMean: allWhatMean,
    whatIKnowAboutYou: allWhatIKnow,
    warningSigns: allWarnings,
    whatYouCanDoNow: allToDo,
    whenToContactDoctor: allWhenDoctor,
    missingData: allMissing,
    synthesizedText,
  };
};

const auditLog: A2AAuditEntry[] = [];
export const getA2AAuditLog = (): A2AAuditEntry[] => auditLog;

let requestCounter = 0;

export const processA2ARequest = (
  query: string,
  patientContext: Record<string, any>,
  options: {
    patientId: string;
    familyId: string;
    userId: string;
    userRole: UserRole;
    language: LanguageCode;
    networkStatus: NetworkStatus;
  }
): A2AOrchestratorResult => {
  requestCounter++;
  const requestId = `REQ-${Date.now()}-${requestCounter}`;
  const timestamp = new Date().toISOString();

  // 1. EMERGENCY
  const { isEmergency } = isEmergencyQuery(query);
  if (isEmergency) {
    const emergencyResp = runEmergencyTriageAgent(query, patientContext, options.patientId);
    const sections = synthesizeResponses([emergencyResp], query, patientContext, true);

    auditLog.push({
      requestId,
      timestamp,
      patientId: options.patientId,
      familyId: options.familyId,
      agents: ['EmergencyTriageAI'],
      topic: 'emergency',
      severity: 'CRITICAL',
      status: 'completed',
      escalationRequired: true,
    });

    return {
      requestId,
      patientId: options.patientId,
      query,
      agentsInvoked: ['EmergencyTriageAI'],
      severity: 'CRITICAL',
      isEmergency: true,
      synthesizedResponse: sections.synthesizedText,
      structuredSections: sections,
      clinicianReviewRecommended: true,
      timestamp,
    };
  }

  // 2. ROUTE & EXECUTE
  const selectedAgents = detectTopics(query, patientContext);
  const responses: A2AAgentResponse[] = [];

  for (const agentName of selectedAgents) {
    let resp: A2AAgentResponse | null = null;
    switch (agentName) {
      case 'GeneralHealthAI': resp = runGeneralHealthAgent(query, patientContext, options.patientId); break;
      case 'ChildCareAI': resp = runChildCareAgent(query, patientContext, options.patientId); break;
      case 'NewbornCareAI': resp = runNewbornCareAgent(query, patientContext, options.patientId); break;
      case 'PregnancyAI': resp = runPregnancyAgent(query, patientContext, options.patientId); break;
      case 'NewMotherAI': resp = runNewMotherAgent(query, patientContext, options.patientId); break;
      case 'ElderlyAI': resp = runElderlyAgent(query, patientContext, options.patientId); break;
      case 'DiabetesAI': resp = runDiabetesAgent(query, patientContext, options.patientId); break;
      case 'BloodPressureAI': resp = runBloodPressureAgent(query, patientContext, options.patientId); break;
      case 'NeurologyAI': resp = runNeurologyAgent(query, patientContext, options.patientId); break;
      case 'InfectiousDiseaseAI': resp = runInfectiousDiseaseAgent(query, patientContext, options.patientId); break;
      case 'NutritionAI': resp = runNutritionAgent(query, patientContext, options.patientId); break;
      case 'MedicationAI': resp = runMedicationAgent(query, patientContext, options.patientId); break;
    }
    if (resp) responses.push(resp);
  }

  if (responses.length === 0) {
    responses.push(runGeneralHealthAgent(query, patientContext, options.patientId));
  }

  // 3. SYNTHESIZE & AUDIT
  const sections = synthesizeResponses(responses, query, patientContext, false);
  const overallSeverity = mergeSeverity(responses.map(r => r.severity));

  auditLog.push({
    requestId,
    timestamp,
    patientId: options.patientId,
    familyId: options.familyId,
    agents: selectedAgents,
    topic: selectedAgents.join(','),
    severity: overallSeverity,
    status: 'completed',
    escalationRequired: overallSeverity === 'CRITICAL' || overallSeverity === 'URGENT',
  });

  return {
    requestId,
    patientId: options.patientId,
    query,
    agentsInvoked: selectedAgents,
    severity: overallSeverity,
    isEmergency: false,
    synthesizedResponse: sections.synthesizedText,
    structuredSections: sections,
    clinicianReviewRecommended: responses.some(r => r.clinicianReviewRecommended),
    timestamp,
  };
};

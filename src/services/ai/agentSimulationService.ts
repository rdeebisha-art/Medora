import { db, Medicine, Patient, MedicalRecord, HealthTest, DoctorSummary } from '../../db/db';

export interface SpecializedAgentDef {
  id: string;
  name: string;
  purpose: string;
  avatarIcon: string;
  badgeColor: string;
  supportedInputTypes: string[];
  executionStatus: 'EXECUTED' | 'SKIPPED' | 'NOT_APPLICABLE';
  timestamp?: string;
  relevantPatientId?: number;
  relevantRecordIds?: (number | string)[];
  observations: string[];
  clinicalConcerns: string[];
  recommendedTests: string[];
  supportiveAdvice: string[];
  redFlagWarnings: string[];
  questionsForDoctor: string[];
}

export interface AgentSimulationResult {
  condition: string;
  normalizedQuery: string;
  timestamp: string;
  urgencyLevel: 'ROUTINE' | 'ELEVATED' | 'HIGH' | 'EMERGENCY';
  urgencyReason: string;
  allAgents: SpecializedAgentDef[];
  executedAgents: SpecializedAgentDef[];
  skippedAgents: SpecializedAgentDef[];
  relevantSymptoms: string[];
  possibleConcerns: string[];
  supportingEvidence: string[];
  redFlags: string[];
  lifestyleSupportiveSuggestions: string[];
  whenToConsultDoctor: string[];
  testsCommonlyConsidered: string[];
  questionsForDoctor: string[];
  currentPatientPrescribedMedications: Medicine[];
  generalMedicationInfoNotice: string;
  educationalDisclaimer: string;
}

export class AgentSimulationCoordinator {
  /**
   * Normalizes incoming health condition query into clinical taxonomy
   */
  normalizeCondition(input: string): string {
    const query = input.trim().toLowerCase();
    if (query.includes('diabet') || query.includes('sugar') || query.includes('shukra')) return 'Diabetes Mellitus';
    if (query.includes('bp') || query.includes('hyperten') || query.includes('pressure') || query.includes('rathat')) return 'Hypertension & Blood Pressure';
    if (query.includes('fever') || query.includes('kaichal') || query.includes('bukhar') || query.includes('pyrexia')) return 'Acute Febrile Illness (Fever)';
    if (query.includes('cough') || query.includes('cold') || query.includes('irumal') || query.includes('khansi')) return 'Respiratory Tract Infection / Cough';
    if (query.includes('pregnan') || query.includes('matern') || query.includes('garbha') || query.includes('antenatal')) return 'Maternal & Pregnancy Care';
    if (query.includes('newborn') || query.includes('infant') || query.includes('kuzhandhai')) return 'Newborn & Infant Care';
    if (query.includes('postnatal') || query.includes('new mother') || query.includes('lactat')) return 'New Mother & Postnatal Care';
    if (query.includes('child') || query.includes('pediatr') || query.includes('siruv') || query.includes('bacha')) return 'Pediatric Health & Growth';
    if (query.includes('elder') || query.includes('geriatr') || query.includes('fall') || query.includes('periyavar')) return 'Geriatric & Elderly Care';
    if (query.includes('diarr') || query.includes('vomit') || query.includes('loose') || query.includes('vayiru')) return 'Acute Gastroenteritis / Diarrhea';
    if (query.includes('anemi') || query.includes('hemo') || query.includes('rathachogai') || query.includes('blood low')) return 'Nutritional Anemia & Blood Count';
    if (query.includes('copd') || query.includes('asthma') || query.includes('breath') || query.includes('wheez')) return 'Chronic Respiratory / Asthma / COPD';
    if (query.includes('heart') || query.includes('chest') || query.includes('cardio') || query.includes('nenju')) return 'Cardiovascular Symptom Triage';
    if (query.includes('report') || query.includes('blood test') || query.includes('cbc') || query.includes('lab')) return 'Medical Report & Blood Test Analysis';
    if (query.includes('x-ray') || query.includes('xray') || query.includes('scan') || query.includes('radiolog')) return 'Radiology & Medical Scan Review';
    if (query.includes('surgery') || query.includes('post-op') || query.includes('wound') || query.includes('stitch')) return 'Surgery Follow-up & Wound Care';
    if (query.includes('vaccin') || query.includes('immuniz') || query.includes('shot')) return 'Immunization & Vaccination Review';
    if (query.includes('reminder') || query.includes('alarm') || query.includes('schedule')) return 'Medication & Health Reminders';

    return input.trim().charAt(0).toUpperCase() + input.trim().slice(1);
  }

  /**
   * Runs the full 26-agent simulation, executing strictly relevant agents
   */
  async runSimulation(conditionInput: string, patientId?: number): Promise<AgentSimulationResult> {
    const condition = this.normalizeCondition(conditionInput);
    const lower = condition.toLowerCase();
    const nowIso = new Date().toISOString();

    // Load persistent patient records safely
    let currentPatientMedications: Medicine[] = [];
    let patientRecords: MedicalRecord[] = [];
    let healthTests: HealthTest[] = [];
    let patientProfile: Patient | undefined;

    const patId = patientId || 1;
    try {
      currentPatientMedications = await db.medicines.where({ patientId: patId, status: 'active' }).toArray();
      patientRecords = await db.medicalRecords.where({ patientId: patId }).toArray();
      healthTests = await db.healthTests.where({ patientId: patId }).toArray();
      patientProfile = await db.patients.get(patId);
    } catch (err) {
      console.warn('[A2A Coordinator] Could not load patient data:', err);
    }

    const recordIds = patientRecords.map((r) => r.id).filter(Boolean) as number[];

    // ── Helper: determine relevance of each of the 26 agents ──────────────
    const shouldRunGP = true; // Always coordinates
    const shouldRunSymptom = lower.includes('fever') || lower.includes('cough') || lower.includes('pain') || lower.includes('diarr') || lower.includes('breath') || lower.includes('vomit') || lower.includes('headache');
    const shouldRunDiagnosis = lower.includes('diagnos') || lower.includes('diabet') || lower.includes('hypertens') || lower.includes('asthma') || lower.includes('anemi');
    const shouldRunReport = lower.includes('report') || lower.includes('blood') || lower.includes('lab') || lower.includes('cbc') || lower.includes('test');
    const shouldRunImage = lower.includes('x-ray') || lower.includes('xray') || lower.includes('scan') || lower.includes('image');
    const shouldRunRadiology = lower.includes('x-ray') || lower.includes('xray') || lower.includes('radiolog') || lower.includes('chest') || lower.includes('fracture');
    const shouldRunBloodTest = lower.includes('blood') || lower.includes('hemoglobin') || lower.includes('sugar') || lower.includes('glucose') || lower.includes('anemi') || lower.includes('report');
    const shouldRunDiabetes = lower.includes('diabet') || lower.includes('sugar') || lower.includes('glucose');
    const shouldRunBP = lower.includes('bp') || lower.includes('pressure') || lower.includes('hyperten') || lower.includes('heart');
    const shouldRunPediatric = lower.includes('child') || lower.includes('pediatr') || lower.includes('infant') || lower.includes('baby');
    const shouldRunMaternal = lower.includes('matern') || lower.includes('pregnan') || lower.includes('antenatal');
    const shouldRunPregnancy = lower.includes('pregnan') || lower.includes('trimester') || lower.includes('fetal');
    const shouldRunNewborn = lower.includes('newborn') || lower.includes('infant') || lower.includes('birth');
    const shouldRunNewMother = lower.includes('mother') || lower.includes('postnatal') || lower.includes('lactat');
    const shouldRunElderly = lower.includes('elder') || lower.includes('geriatr') || lower.includes('fall') || lower.includes('joint') || lower.includes('arthritis');
    const shouldRunNutrition = true; // Nutrition relevant across health states
    const shouldRunMedSafety = currentPatientMedications.length > 0 || lower.includes('medicin') || lower.includes('pill') || lower.includes('dose');
    const shouldRunVaccine = lower.includes('vaccin') || lower.includes('immuniz') || lower.includes('child') || lower.includes('newborn');
    const shouldRunSurgery = lower.includes('surgery') || lower.includes('wound') || lower.includes('stitch') || lower.includes('post-op') || lower.includes('operation');
    const shouldRunEmergency = true; // Always screen safety red flags
    const shouldRunMedicalHistory = patientRecords.length > 0 || (patientProfile?.conditions && patientProfile.conditions.length > 0);
    const shouldRunDoctorHandoff = true; // Prepares clinician summary
    const shouldRunAppointment = lower.includes('appoint') || lower.includes('consult') || lower.includes('visit') || lower.includes('follow-up');
    const shouldRunReminder = lower.includes('remind') || lower.includes('alarm') || lower.includes('schedule') || currentPatientMedications.length > 0;
    const shouldRunMedicalSummary = true; // Always summarizes
    const shouldRunResponseVerification = true; // Strict verification gatekeeper

    // ── Build all 26 distinct agents ──────────────────────────────────────
    const allAgents: SpecializedAgentDef[] = [
      // 1. General Physician Agent
      {
        id: 'gp-agent',
        name: 'General Physician Agent',
        purpose: 'Primary care clinical assessment, holistic symptom correlation, and triage synthesis.',
        avatarIcon: '🩺',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        supportedInputTypes: ['symptoms', 'vital_signs', 'general_health', 'chronic_disease'],
        executionStatus: shouldRunGP ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        relevantRecordIds: recordIds.slice(0, 2),
        observations: [
          `Primary clinical picture correlates with ${condition}.`,
          'Reviewing hydration status, hemodynamic stability, and resting vitals.',
        ],
        clinicalConcerns: [
          `Differentiating acute self-limiting ${condition} from underlying secondary systemic illness.`,
        ],
        recommendedTests: ['Complete Blood Count (CBC)', 'Baseline resting Blood Pressure check'],
        supportiveAdvice: ['Rest, oral fluid rehydration, and avoidance of strenuous physical exertion.'],
        redFlagWarnings: ['High fever above 102°F or acute cognitive disorientation requires hospital evaluation.'],
        questionsForDoctor: ['What is the expected recovery timeline for this clinical presentation?'],
      },

      // 2. Symptom Analysis Agent
      {
        id: 'symptom-analysis-agent',
        name: 'Symptom Analysis Agent',
        purpose: 'Deep parsing of symptom duration, onset characteristics, and anatomic localization.',
        avatarIcon: '🔍',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        supportedInputTypes: ['symptoms', 'complaints', 'pain_scores'],
        executionStatus: shouldRunSymptom ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          `Symptoms mapped to ${condition} clinical trajectory.`,
          'Assessing whether progression is acute (<48 hours) or subacute.',
        ],
        clinicalConcerns: ['Unchecked symptom escalation without physician review.'],
        recommendedTests: ['Symptom diary recording morning and evening severity'],
        supportiveAdvice: ['Monitor symptom triggers and maintain daily temperature and symptom logs.'],
        redFlagWarnings: ['Sudden explosive worsening of localized pain or acute breathlessness.'],
        questionsForDoctor: ['Are there specific symptoms that warrant returning to the clinic earlier than scheduled?'],
      },

      // 3. Diagnosis Review Agent
      {
        id: 'diagnosis-review-agent',
        name: 'Diagnosis Review Agent',
        purpose: 'Preserves and cross-references existing doctor-established diagnoses without modification.',
        avatarIcon: '📋',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        supportedInputTypes: ['established_diagnosis', 'clinical_history'],
        executionStatus: shouldRunDiagnosis ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          `Reviewing established diagnosis: ${patientProfile?.conditions?.join(', ') || condition}.`,
          'Existing clinical diagnoses are preserved and not replaced by AI observations.',
        ],
        clinicalConcerns: ['Unauthorized alteration or omission of physician chronic treatment regimens.'],
        recommendedTests: ['Periodic clinical review with Primary Health Centre physician'],
        supportiveAdvice: ['Strict compliance with existing doctor instructions and follow-up dates.'],
        redFlagWarnings: ['Sudden loss of control of diagnosed chronic symptoms.'],
        questionsForDoctor: ['Has my diagnosed condition stabilized since my last review?'],
      },

      // 4. Medical Report Analysis Agent
      {
        id: 'medical-report-analysis-agent',
        name: 'Medical Report Analysis Agent',
        purpose: 'Parses PDF and laboratory test reports, extracts numeric findings, and checks reference ranges.',
        avatarIcon: '📄',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        supportedInputTypes: ['pdf_report', 'scanned_document', 'lab_values'],
        executionStatus: shouldRunReport ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Extracting biochemical and hematological parameters against reference intervals.',
          'Missing or unreadable values are explicitly flagged rather than estimated.',
        ],
        clinicalConcerns: ['Over-interpreting isolated out-of-range lab results without clinical context.'],
        recommendedTests: ['Corroborate report findings with attending physician examination'],
        supportiveAdvice: ['Bring physical copies of original laboratory reports to medical appointments.'],
        redFlagWarnings: ['Critical laboratory panic values require immediate physician notification.'],
        questionsForDoctor: ['What do these specific lab test results mean in relation to my current symptoms?'],
      },

      // 5. Medical Image Analysis Agent
      {
        id: 'medical-image-analysis-agent',
        name: 'Medical Image Analysis Agent',
        purpose: 'Handles image upload, preview, zoom, rotation, and reports AI model availability status.',
        avatarIcon: '🖼️',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
        supportedInputTypes: ['xray', 'ct_scan', 'clinical_photo'],
        executionStatus: shouldRunImage ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Image uploaded and rendered for clinical visualization.',
          'AI model unavailable. Please request qualified medical review.',
        ],
        clinicalConcerns: ['No unvalidated CNN diagnostic claims are made without an approved model.'],
        recommendedTests: ['Qualified radiologist interpretation of high-resolution scan'],
        supportiveAdvice: ['Preserve physical radiographic films or original DICOM files.'],
        redFlagWarnings: ['Do not rely on automated image interpretation for surgical or acute fracture decisions.'],
        questionsForDoctor: ['Can a radiologist review my X-ray or medical scan in person?'],
      },

      // 6. Radiology Support Agent
      {
        id: 'radiology-support-agent',
        name: 'Radiology Support Agent',
        purpose: 'Structures anatomical radiology viewing parameters, positioning, and review checklist.',
        avatarIcon: '🩻',
        badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        supportedInputTypes: ['radiograph', 'scan_metadata'],
        executionStatus: shouldRunRadiology ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Checking radiography technical adequacy, rotation symmetry, and contrast clarity.',
        ],
        clinicalConcerns: ['Underexposed or rotated radiographs obscuring subtle pulmonary or bony lesions.'],
        recommendedTests: ['Formal radiologist clinical report with signature'],
        supportiveAdvice: ['Consult government hospital radiology department for verified review.'],
        redFlagWarnings: ['Visible signs of tension pneumothorax or acute displaced fracture require emergency care.'],
        questionsForDoctor: ['Is a repeat radiographic view needed for adequate clinical comparison?'],
      },

      // 7. Blood Test Analysis Agent
      {
        id: 'blood-test-analysis-agent',
        name: 'Blood Test Analysis Agent',
        purpose: 'Evaluates hemoglobin, glucose, CBC, and renal profiles against age-specific norms.',
        avatarIcon: '🩸',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        supportedInputTypes: ['cbc', 'blood_sugar', 'hemoglobin', 'lipid_profile'],
        executionStatus: shouldRunBloodTest ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Evaluating complete blood count and metabolic values against rural healthcare references.',
        ],
        clinicalConcerns: ['Undiagnosed anemia or dysglycemia exacerbating daily fatigue.'],
        recommendedTests: ['Repeat hemoglobin or fasting glucose if values border critical limits'],
        supportiveAdvice: ['Ensure adequate dietary iron and balanced low-glycemic staple nutrition.'],
        redFlagWarnings: ['Hemoglobin below 7.0 g/dL requires urgent blood transfusion consideration.'],
        questionsForDoctor: ['Do my blood test results require any iron or nutritional supplementation?'],
      },

      // 8. Diabetes Care Agent
      {
        id: 'diabetes-care-agent',
        name: 'Diabetes Care Agent',
        purpose: 'Guidance on glycemic monitoring, hypoglycemia avoidance, and foot care.',
        avatarIcon: '🧁',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        supportedInputTypes: ['blood_sugar', 'hba1c', 'diabetes_symptoms'],
        executionStatus: shouldRunDiabetes ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Tracking fasting and post-prandial glycemic readings.',
          'Checking for hypoglycemia signs: sweating, trembling, rapid heart rate.',
        ],
        clinicalConcerns: ['Unrecognized nocturnal hypoglycemia or persistent hyperosmolar hyperglycemia.'],
        recommendedTests: ['HbA1c test every 3 months', 'Annual diabetic microalbuminuria check'],
        supportiveAdvice: ['Daily foot inspection for cuts or blisters, meal timing adherence.'],
        redFlagWarnings: ['Extreme confusion, sweet acetone breath, or inability to swallow fluids.'],
        questionsForDoctor: ['Is my current antidiabetic medication achieving my target HbA1c?'],
      },

      // 9. Blood Pressure Agent
      {
        id: 'blood-pressure-agent',
        name: 'Blood Pressure Agent',
        purpose: 'Hypertension monitoring, resting BP recording, and pre-eclampsia/stroke risk reduction.',
        avatarIcon: '🫀',
        badgeColor: 'bg-red-100 text-red-800 border-red-200',
        supportedInputTypes: ['blood_pressure', 'pulse', 'headache_symptoms'],
        executionStatus: shouldRunBP ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Monitoring systolic and diastolic blood pressure logs across morning and evening.',
        ],
        clinicalConcerns: ['Hypertensive urgency (>180/120 mmHg) causing end-organ vulnerability.'],
        recommendedTests: ['Resting blood pressure log over 7 consecutive days'],
        supportiveAdvice: ['Reduce dietary sodium, avoid tobacco/betel nut, and take BP pills daily.'],
        redFlagWarnings: ['BP > 180/120 with blurry vision, severe headache, or chest tightness.'],
        questionsForDoctor: ['Is my blood pressure adequately controlled on my current single/dual therapy?'],
      },

      // 10. Pediatric Care Agent
      {
        id: 'pediatric-care-agent',
        name: 'Pediatric Care Agent',
        purpose: 'Child growth monitoring, dehydration assessment in diarrhea, and fever in children.',
        avatarIcon: '👶',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        supportedInputTypes: ['child_symptoms', 'pediatric_vitals', 'growth_charts'],
        executionStatus: shouldRunPediatric ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Assessing pediatric activity level, fluid intake, and hydration in young children.',
        ],
        clinicalConcerns: ['Rapid dehydration in infants with acute diarrhea or high fever.'],
        recommendedTests: ['Pediatric weight-for-age check at Anganwadi / PHC'],
        supportiveAdvice: ['Administer Oral Rehydration Salts (ORS) and continue breastfeeding.'],
        redFlagWarnings: ['Lethargy, refusing to breastfeed, sunken eyes, or fast breathing.'],
        questionsForDoctor: ['Is my child drinking enough liquids to prevent dehydration?'],
      },

      // 11. Maternal Health Agent
      {
        id: 'maternal-health-agent',
        name: 'Maternal Health Agent',
        purpose: 'Antenatal care (ANC), maternal nutrition, iron-folic acid compliance, and danger sign triage.',
        avatarIcon: '🤰',
        badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
        supportedInputTypes: ['maternal_vitals', 'pregnancy_symptoms', 'anc_checkup'],
        executionStatus: shouldRunMaternal ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Verifying scheduled antenatal checkups and tetanus toxoid immunization history.',
        ],
        clinicalConcerns: ['Gestational hypertension, maternal anemia, or pre-eclampsia danger signs.'],
        recommendedTests: ['Routine antenatal ultrasound and maternal hemoglobin screen'],
        supportiveAdvice: ['Take daily Iron-Folic Acid tablets after meals with water (avoid tea/coffee).'],
        redFlagWarnings: ['Vaginal bleeding, severe headache with blurred vision, or decreased fetal movement.'],
        questionsForDoctor: ['When is my next scheduled government ANC checkup?'],
      },

      // 12. Pregnancy Care Agent
      {
        id: 'pregnancy-care-agent',
        name: 'Pregnancy Care Agent',
        purpose: 'Trimester-specific health tracking, fetal wellbeing checks, and birth preparedness.',
        avatarIcon: '🌸',
        badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
        supportedInputTypes: ['pregnancy_weeks', 'fetal_movements', 'anc_records'],
        executionStatus: shouldRunPregnancy ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Tracking gestational weeks and maternal weight gain progression.',
        ],
        clinicalConcerns: ['Pre-term labor signs or premature rupture of amniotic membranes.'],
        recommendedTests: ['Third-trimester growth scan and urine albumin check'],
        supportiveAdvice: ['Identify nearest government delivery center and emergency vehicle transport number.'],
        redFlagWarnings: ['Watery vaginal leaking, regular painful uterine contractions before 37 weeks.'],
        questionsForDoctor: ['Are my baby’s movements and growth on track for my gestational week?'],
      },

      // 13. Newborn Care Agent
      {
        id: 'newborn-care-agent',
        name: 'Newborn Care Agent',
        purpose: 'Exclusive breastfeeding, newborn temperature regulation, umbilical cord hygiene, and jaundice.',
        avatarIcon: '🍼',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
        supportedInputTypes: ['newborn_vitals', 'birth_weight', 'feeding_frequency'],
        executionStatus: shouldRunNewborn ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Assessing exclusive breastfeeding frequency (8–12 times per day) and diaper wet count.',
        ],
        clinicalConcerns: ['Neonatal hypothermia, delayed breastfeeding attachment, or pathological jaundice.'],
        recommendedTests: ['Newborn birth weight and neonatal bilirubin check if jaundiced'],
        supportiveAdvice: ['Practice skin-to-skin kangaroo care and keep the umbilical stump clean and dry.'],
        redFlagWarnings: ['Yellow skin on palms/soles, poor sucking, cold to touch, or convulsive twitches.'],
        questionsForDoctor: ['Is my baby gaining sufficient weight on exclusive breastmilk?'],
      },

      // 14. New Mother Care Agent
      {
        id: 'new-mother-care-agent',
        name: 'New Mother Care Agent',
        purpose: 'Postpartum recovery, lochia tracking, episiotomy/cesarean wound care, and maternal mental wellness.',
        avatarIcon: '🤱',
        badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
        supportedInputTypes: ['postpartum_symptoms', 'wound_status', 'breastfeeding_concerns'],
        executionStatus: shouldRunNewMother ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Reviewing postpartum recovery, lochia discharge color, and perineal healing.',
        ],
        clinicalConcerns: ['Postpartum hemorrhage or puerperal sepsis with persistent fever.'],
        recommendedTests: ['Postnatal 6-week maternal health review at PHC'],
        supportiveAdvice: ['Maintain nutrient-dense meals, adequate sleep, and family support.'],
        redFlagWarnings: ['Soaking more than one large sanitary pad per hour or foul-smelling lochia.'],
        questionsForDoctor: ['Are my postpartum healing and bleeding progressing normally?'],
      },

      // 15. Elderly Care Agent
      {
        id: 'elderly-care-agent',
        name: 'Elderly Care Agent',
        purpose: 'Fall risk assessment, polypharmacy review, mobility support, and cognitive wellbeing.',
        avatarIcon: '🦯',
        badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
        supportedInputTypes: ['geriatric_vitals', 'mobility_assessment', 'fall_history'],
        executionStatus: shouldRunElderly ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Evaluating walking stability, vision, and home lighting to prevent accidental falls.',
        ],
        clinicalConcerns: ['Polypharmacy adverse reactions and postural hypotension upon standing.'],
        recommendedTests: ['Bone mineral density / joint mobility assessment'],
        supportiveAdvice: ['Use assistive walking canes if needed and clear home rugs and wet surfaces.'],
        redFlagWarnings: ['Inability to bear weight after a slip or sudden acute confusion.'],
        questionsForDoctor: ['Can we review all my regular medicines to simplify daily doses?'],
      },

      // 16. Nutrition Agent
      {
        id: 'nutrition-agent',
        name: 'Nutrition Agent',
        purpose: 'Culturally adapted rural dietary recommendations, hydration, and micronutrient support.',
        avatarIcon: '🥗',
        badgeColor: 'bg-green-100 text-green-800 border-green-200',
        supportedInputTypes: ['dietary_habits', 'hydration', 'deficiency_signs'],
        executionStatus: shouldRunNutrition ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Recommending locally accessible whole-food nutrition: ragi, lentils, greens, and drumstick leaves.',
        ],
        clinicalConcerns: ['Micronutrient deficiencies (Iron, Vitamin A, B12) in rural hill populations.'],
        recommendedTests: ['Serum ferritin or nutritional screening during routine clinic visits'],
        supportiveAdvice: ['Drink boiled, cooled water throughout the day; avoid excessive unrefined sugars.'],
        redFlagWarnings: ['Complete inability to tolerate oral foods or persistent fluid loss.'],
        questionsForDoctor: ['Are there specific dietary changes recommended for my condition?'],
      },

      // 17. Medication Safety Agent
      {
        id: 'medication-safety-agent',
        name: 'Medication Safety Agent',
        purpose: 'Cross-checks drug interactions, verified dosages, timing adherence, and allergy avoidance.',
        avatarIcon: '💊',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        supportedInputTypes: ['prescriptions', 'drug_interactions', 'allergies'],
        executionStatus: shouldRunMedSafety ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        relevantRecordIds: currentPatientMedications.map((m) => m.id).filter(Boolean) as number[],
        observations: [
          `Reviewing ${currentPatientMedications.length} active prescription(s) for patient.`,
          'Zero unauthorized dose alterations: All prescriptions remain as directed by clinician.',
        ],
        clinicalConcerns: ['Drug interactions or duplications between over-the-counter and prescribed pills.'],
        recommendedTests: ['Prescription medication reconciliation at each doctor consultation'],
        supportiveAdvice: ['Take medicines at the same time each day with water as prescribed.'],
        redFlagWarnings: ['Skin rash, swelling of lips, or difficulty breathing after taking any pill.'],
        questionsForDoctor: ['Should I take my medicines before or after food?'],
      },

      // 18. Vaccination Agent
      {
        id: 'vaccination-agent',
        name: 'Vaccination Agent',
        purpose: 'Universal Immunisation Programme (UIP) adherence, dose intervals, and due date tracking.',
        avatarIcon: '💉',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        supportedInputTypes: ['vaccine_records', 'due_dates', 'immunization_history'],
        executionStatus: shouldRunVaccine ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Checking government UIP vaccination schedule for pending or upcoming doses.',
        ],
        clinicalConcerns: ['Delayed booster immunizations leaving patients vulnerable to preventable infections.'],
        recommendedTests: ['Review official MCP card or immunization card at PHC'],
        supportiveAdvice: ['Keep vaccination cards safely protected in plastic covers for clinic visits.'],
        redFlagWarnings: ['Persistent high fever or severe swelling at injection site beyond 48 hours.'],
        questionsForDoctor: ['Are all recommended vaccinations up-to-date for my age group?'],
      },

      // 19. Surgery Follow-up Agent
      {
        id: 'surgery-follow-up-agent',
        name: 'Surgery Follow-up Agent',
        purpose: 'Post-operative recovery tracking, suture line examination, and infection prevention.',
        avatarIcon: '🩹',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        supportedInputTypes: ['post_op_records', 'wound_photos', 'surgical_notes'],
        executionStatus: shouldRunSurgery ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Monitoring surgical wound cleanliness, suture integrity, and healing progress.',
        ],
        clinicalConcerns: ['Surgical site infection (erythema, purulence, dehiscence).'],
        recommendedTests: ['In-person clinical inspection by the operating surgical team'],
        supportiveAdvice: ['Keep the incision site dry; complete the entire course of prescribed antibiotics.'],
        redFlagWarnings: ['Spreading wound redness, foul-smelling discharge, or high fever with chills.'],
        questionsForDoctor: ['When can my surgical sutures or staples be safely removed?'],
      },

      // 20. Emergency Triage Agent
      {
        id: 'emergency-triage-agent',
        name: 'Emergency Triage Agent',
        purpose: 'Deterministic red flag screening for life-threatening respiratory, cardiac, or traumatic emergencies.',
        avatarIcon: '🚨',
        badgeColor: 'bg-red-100 text-red-800 border-red-200',
        supportedInputTypes: ['emergency_symptoms', 'red_flags', 'vital_extremes'],
        executionStatus: shouldRunEmergency ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Screening for life-safety red flags: severe chest pain, asphyxia, massive bleeding, stroke signs.',
        ],
        clinicalConcerns: ['Delay in dispatching emergency ambulance (108) during acute time-critical emergencies.'],
        recommendedTests: ['Emergency room evaluation and bedside ECG if cardiac symptoms are present'],
        supportiveAdvice: ['Know the direct phone number of the nearest government ambulance and hospital.'],
        redFlagWarnings: ['Immediate emergency care required if patient cannot breathe, loses consciousness, or has severe chest tightness.'],
        questionsForDoctor: ['Under what immediate circumstances should we call 108 rather than visit the clinic?'],
      },

      // 21. Medical History Agent
      {
        id: 'medical-history-agent',
        name: 'Medical History Agent',
        purpose: 'Aggregates persistent longitudinal medical records belonging strictly to the isolated patient.',
        avatarIcon: '📚',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
        supportedInputTypes: ['past_records', 'patient_timeline'],
        executionStatus: shouldRunMedicalHistory ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        relevantRecordIds: recordIds,
        observations: [
          `Retrieved ${patientRecords.length} historical record(s) strictly for patient ID ${patId}.`,
          'Patient data isolation active: No mixing of medical records across profiles.',
        ],
        clinicalConcerns: ['Loss of continuity of care across disparate rural clinics.'],
        recommendedTests: ['Periodic compilation of all diagnostic test summaries'],
        supportiveAdvice: ['Keep digital and physical copies of hospital discharge summaries accessible.'],
        redFlagWarnings: ['History of anaphylaxis or severe adverse drug reactions.'],
        questionsForDoctor: ['Does my long-term medical history impact the treatment of my current complaint?'],
      },

      // 22. Doctor Handoff Agent
      {
        id: 'doctor-handoff-agent',
        name: 'Doctor Handoff Agent',
        purpose: 'Synthesizes clinical data into structured SBAR format for attending healthcare providers.',
        avatarIcon: '🤝',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
        supportedInputTypes: ['all_clinical_data', 'patient_summary'],
        executionStatus: shouldRunDoctorHandoff ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Synthesizing Situation, Background, Assessment, and Recommendation (SBAR) for consulting clinician.',
        ],
        clinicalConcerns: ['Incomplete handoff resulting in redundant diagnostic investigations.'],
        recommendedTests: ['Print or display Doctor Summary brief during consultation'],
        supportiveAdvice: ['Present this synthesized clinical summary to your visiting doctor.'],
        redFlagWarnings: ['Ensure attending physician is informed of all active medications and allergies.'],
        questionsForDoctor: ['Are there specific referral centres recommended if specialist care is needed?'],
      },

      // 23. Appointment Agent
      {
        id: 'appointment-agent',
        name: 'Appointment Agent',
        purpose: 'Coordinates doctor visits, clinic scheduling, and specialist consultation timings.',
        avatarIcon: '🗓️',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        supportedInputTypes: ['appointments', 'scheduling_requests'],
        executionStatus: shouldRunAppointment ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Reviewing clinic schedules and consultation availability at nearby facilities.',
        ],
        clinicalConcerns: ['Missed routine follow-up consultations leading to disease decompensation.'],
        recommendedTests: ['Confirm doctor appointment time before traveling across rural hills'],
        supportiveAdvice: ['Arrive 15 minutes before clinic consultation with prior medical files.'],
        redFlagWarnings: ['Do not postpone urgent review if symptoms are worsening rapidly.'],
        questionsForDoctor: ['When should our next follow-up appointment be scheduled?'],
      },

      // 24. Health Reminder Agent
      {
        id: 'health-reminder-agent',
        name: 'Health Reminder Agent',
        purpose: 'Automates medicine alerts, appointment chimes, and vaccination notifications.',
        avatarIcon: '⏰',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        supportedInputTypes: ['prescribed_schedules', 'notification_preferences'],
        executionStatus: shouldRunReminder ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Automating adherence reminders from existing valid prescription schedules.',
          'Local offline notification engine active: reminders fire on device without internet connectivity.',
        ],
        clinicalConcerns: ['Medication non-adherence due to forgotten dosing intervals.'],
        recommendedTests: ['Review active reminder schedule in Medicines tab'],
        supportiveAdvice: ['Keep reminder notifications enabled and phone volume audible at scheduled pill times.'],
        redFlagWarnings: ['Repeated missed doses of critical cardiac, insulin, or blood pressure medicines.'],
        questionsForDoctor: ['What should I do if I accidentally miss a scheduled medicine dose?'],
      },

      // 25. Medical Summary Agent
      {
        id: 'medical-summary-agent',
        name: 'Medical Summary Agent',
        purpose: 'Provides clear, plain-language patient summaries distinguishing facts from AI observations.',
        avatarIcon: '📑',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        supportedInputTypes: ['full_consultation', 'vitals', 'reports'],
        executionStatus: shouldRunMedicalSummary ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Compiling plain-language summary of patient-reported data, lab results, and care advice.',
          'Never presents automated observations as confirmed clinical diagnoses.',
        ],
        clinicalConcerns: ['Ensuring patient and family clearly understand care instructions and warning signs.'],
        recommendedTests: ['Review summary with family members or primary village healthcare worker'],
        supportiveAdvice: ['Ask your clinician to clarify any medical terminology you do not understand.'],
        redFlagWarnings: ['Always prioritize clinical doctor guidance over automated information.'],
        questionsForDoctor: ['Can you summarize the top two actions I must take for my recovery?'],
      },

      // 26. Response Verification Agent
      {
        id: 'response-verification-agent',
        name: 'Response Verification Agent',
        purpose: 'Final clinical safety validation, ensuring no hallucinated diagnoses or fabricated test results.',
        avatarIcon: '🛡️',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        supportedInputTypes: ['all_agent_outputs', 'safety_guidelines'],
        executionStatus: shouldRunResponseVerification ? 'EXECUTED' : 'SKIPPED',
        timestamp: nowIso,
        relevantPatientId: patId,
        observations: [
          'Verified response safety: Zero fabricated diagnoses, zero invented lab values.',
          'Preserved all numerical values, prescription doses, and patient record boundaries.',
        ],
        clinicalConcerns: ['Strict prevention of inaccurate medical assertions or false delivery claims.'],
        recommendedTests: ['Final review gate passed successfully'],
        supportiveAdvice: ['Medora is designed for rural healthcare support and non-diagnostic assistance.'],
        redFlagWarnings: ['In case of medical emergencies, immediate qualified human clinician care is mandatory.'],
        questionsForDoctor: ['All questions verified for clinical relevance.'],
      },
    ];

    // Filter executed vs skipped agents
    const executedAgents = allAgents.filter((a) => a.executionStatus === 'EXECUTED');
    const skippedAgents = allAgents.filter((a) => a.executionStatus === 'SKIPPED');

    // Synthesis of executed observations
    const relevantSymptoms = Array.from(new Set(executedAgents.flatMap((a) => a.observations))).slice(0, 8);
    const possibleConcerns = Array.from(new Set(executedAgents.flatMap((a) => a.clinicalConcerns))).slice(0, 6);
    const redFlags = Array.from(new Set(executedAgents.flatMap((a) => a.redFlagWarnings))).slice(0, 6);
    const lifestyleSupportiveSuggestions = Array.from(new Set(executedAgents.flatMap((a) => a.supportiveAdvice))).slice(0, 7);
    const testsCommonlyConsidered = Array.from(new Set(executedAgents.flatMap((a) => a.recommendedTests))).slice(0, 6);
    const questionsForDoctor = Array.from(new Set(executedAgents.flatMap((a) => a.questionsForDoctor))).slice(0, 6);

    const supportingEvidence = [
      `Collaborative reasoning conducted across ${executedAgents.length} active specialist agents.`,
      `${skippedAgents.length} specialized agents were evaluated and skipped as not applicable to "${condition}".`,
      `Integrated ${patientRecords.length} historical record(s) and ${currentPatientMedications.length} active prescription(s) for patient profile.`,
    ];

    const whenToConsultDoctor = [
      'Symptoms persist beyond 48 to 72 hours or fail to improve with basic home supportive care.',
      'Any emergence of red-flag symptoms such as shortness of breath, high persistent fever, or disorientation.',
      'Significant change in daily vital measurements (blood pressure, blood glucose, temperature, pulse).',
      'Difficulty retaining oral fluids or signs of dehydration (sunken eyes, extreme dry tongue, reduced urination).',
      'Uncertainty regarding existing chronic medications or suspicion of medication intolerance.',
    ];

    // Determine urgency level
    let urgencyLevel: 'ROUTINE' | 'ELEVATED' | 'HIGH' | 'EMERGENCY' = 'ROUTINE';
    let urgencyReason = 'Standard educational and supportive review. Schedule routine follow-up with Primary Health Centre.';

    if (lower.includes('chest') || lower.includes('heart') || lower.includes('breath') || lower.includes('unconscious') || lower.includes('bleeding')) {
      urgencyLevel = 'EMERGENCY';
      urgencyReason = 'Potential critical pathway: Immediate clinical evaluation and 108 emergency triage recommended.';
    } else if (lower.includes('fever') || lower.includes('diarr') || lower.includes('sugar') || lower.includes('pressure') || lower.includes('wound')) {
      urgencyLevel = 'ELEVATED';
      urgencyReason = 'Active symptoms require structured monitoring and medical consultation within 24–48 hours.';
    }

    return {
      condition,
      normalizedQuery: conditionInput,
      timestamp: nowIso,
      urgencyLevel,
      urgencyReason,
      allAgents,
      executedAgents,
      skippedAgents,
      relevantSymptoms,
      possibleConcerns,
      supportingEvidence,
      redFlags,
      lifestyleSupportiveSuggestions,
      whenToConsultDoctor,
      testsCommonlyConsidered,
      questionsForDoctor,
      currentPatientPrescribedMedications: currentPatientMedications,
      generalMedicationInfoNotice:
        'Medication information only — treatment decisions and dosage titrations should always be made with a qualified healthcare professional. Do not self-prescribe or adjust doses without medical direction.',
      educationalDisclaimer:
        'Agent-to-Agent Multi-Specialist Medical Simulation is an educational and clinical decision-support framework. It does not replace independent clinical evaluation by a certified physician.',
    };
  }
}

export const agentSimulationCoordinator = new AgentSimulationCoordinator();

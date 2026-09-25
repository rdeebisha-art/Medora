import { db, Medicine } from '../../db/db';

export interface AgentObservation {
  agentName: string;
  agentRole: string;
  avatarIcon: string;
  badgeColor: string;
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
  consultedAgents: AgentObservation[];
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
    if (query.includes('bp') || query.includes('hyperten') || query.includes('pressure') || query.includes('rathat')) return 'Hypertension';
    if (query.includes('fever') || query.includes('kaichal') || query.includes('bukhar') || query.includes('pyrexia')) return 'Acute Febrile Illness (Fever)';
    if (query.includes('cough') || query.includes('cold') || query.includes('irumal') || query.includes('khansi')) return 'Respiratory Tract Infection / Cough';
    if (query.includes('pregnan') || query.includes('matern') || query.includes('garbha') || query.includes('antenatal')) return 'Maternal & Antenatal Health';
    if (query.includes('baby') || query.includes('newborn') || query.includes('infant') || query.includes('kuzhandhai')) return 'Newborn & Infant Care';
    if (query.includes('child') || query.includes('pediatr') || query.includes('siruv') || query.includes('bacha')) return 'Pediatric Health & Growth';
    if (query.includes('elder') || query.includes('geriatr') || query.includes('fall') || query.includes('periyavar')) return 'Geriatric Care & Mobility';
    if (query.includes('diarr') || query.includes('vomit') || query.includes('loose') || query.includes('vayiru')) return 'Acute Gastroenteritis / Diarrhea';
    if (query.includes('anemi') || query.includes('hemo') || query.includes('rathachogai') || query.includes('blood low')) return 'Nutritional Anemia';
    if (query.includes('copd') || query.includes('asthma') || query.includes('breath') || query.includes('wheez')) return 'Chronic Respiratory / Asthma / COPD';
    if (query.includes('heart') || query.includes('chest') || query.includes('cardio') || query.includes('nenju')) return 'Cardiovascular Symptom Triage';

    // Fallback: title case normalized
    return input.trim().charAt(0).toUpperCase() + input.trim().slice(1);
  }

  /**
   * Runs the multi-agent clinical simulation
   */
  async runSimulation(conditionInput: string, patientId?: number): Promise<AgentSimulationResult> {
    const condition = this.normalizeCondition(conditionInput);
    const lower = condition.toLowerCase();

    // 1. Fetch current patient medications safely from local database if available
    let currentPatientMedications: Medicine[] = [];
    if (patientId) {
      try {
        currentPatientMedications = await db.medicines
          .where({ patientId, status: 'active' })
          .toArray();
      } catch (err) {
        console.warn('[A2A Coordinator] Could not load patient medicines:', err);
      }
    }

    // 2. Instantiate and run individual simulated specialist agents
    const consultedAgents: AgentObservation[] = [];

    // Agent 1: General Physician Agent (always active coordinator)
    consultedAgents.push(this.runGeneralPhysicianAgent(condition));

    // Agent 2: Emergency Triage Agent (always checks red-flag escalation criteria)
    consultedAgents.push(this.runEmergencyTriageAgent(condition));

    // Agent 3: Diabetes Agent (if metabolic/diabetes context)
    if (lower.includes('diabet') || lower.includes('sugar') || lower.includes('metabol') || lower.includes('hypertens')) {
      consultedAgents.push(this.runDiabetesAgent(condition));
    }

    // Agent 4: Nutrition Agent (always contributes diet/electrolyte context)
    consultedAgents.push(this.runNutritionAgent(condition));

    // Agent 5: Pediatric Agent (if child context or fever/diarrhea in youth)
    if (lower.includes('child') || lower.includes('pediatr') || lower.includes('diarr') || lower.includes('fever')) {
      consultedAgents.push(this.runPediatricAgent(condition));
    }

    // Agent 6: Maternal Care Agent (if pregnancy/antenatal context)
    if (lower.includes('pregnan') || lower.includes('matern') || lower.includes('antenatal') || lower.includes('anemi')) {
      consultedAgents.push(this.runMaternalCareAgent(condition));
    }

    // Agent 7: Newborn Care Agent (if infant/newborn context)
    if (lower.includes('newborn') || lower.includes('infant') || lower.includes('baby') || lower.includes('birth')) {
      consultedAgents.push(this.runNewbornCareAgent(condition));
    }

    // Agent 8: Elderly Care Agent (if geriatric/BP/COPD/arthritis context)
    if (lower.includes('elder') || lower.includes('geriatr') || lower.includes('fall') || lower.includes('hypertens') || lower.includes('copd')) {
      consultedAgents.push(this.runElderlyCareAgent(condition));
    }

    // Agent 9: Medication Safety Agent (always active cross-checker)
    consultedAgents.push(this.runMedicationSafetyAgent(condition, currentPatientMedications));

    // 3. Coordinator Synthesis & Deduplication
    const relevantSymptoms = Array.from(new Set(consultedAgents.flatMap(a => a.observations))).slice(0, 8);
    const possibleConcerns = Array.from(new Set(consultedAgents.flatMap(a => a.clinicalConcerns))).slice(0, 6);
    const supportingEvidence = this.generateSupportingEvidence(condition);
    const redFlags = Array.from(new Set(consultedAgents.flatMap(a => a.redFlagWarnings))).slice(0, 6);
    const lifestyleSupportiveSuggestions = Array.from(new Set(consultedAgents.flatMap(a => a.supportiveAdvice))).slice(0, 7);
    const testsCommonlyConsidered = Array.from(new Set(consultedAgents.flatMap(a => a.recommendedTests))).slice(0, 6);
    const questionsForDoctor = Array.from(new Set(consultedAgents.flatMap(a => a.questionsForDoctor))).slice(0, 6);

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

    if (lower.includes('chest') || lower.includes('heart') || lower.includes('breath') || lower.includes('unconscious')) {
      urgencyLevel = 'EMERGENCY';
      urgencyReason = 'Potential critical pathway: Immediate clinical evaluation and 108 emergency triage recommended.';
    } else if (lower.includes('fever') || lower.includes('diarr') || lower.includes('sugar') || lower.includes('pressure')) {
      urgencyLevel = 'ELEVATED';
      urgencyReason = 'Active symptoms require structured monitoring and medical consultation within 24–48 hours.';
    }

    return {
      condition,
      normalizedQuery: conditionInput,
      timestamp: new Date().toISOString(),
      urgencyLevel,
      urgencyReason,
      consultedAgents,
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

  // ── Specialist Agent 1: General Physician ──────────────────────────
  private runGeneralPhysicianAgent(condition: string): AgentObservation {
    return {
      agentName: 'General Physician Agent',
      agentRole: 'Primary Care Assessment & Clinical Synthesis',
      avatarIcon: '🩺',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      observations: [
        `Clinical presentation aligns with ${condition} spectrum in primary care settings.`,
        'Correlate symptom duration with recent environmental exposure, seasonal hill climate, and nutrition.',
        'Review systemic vitals including resting blood pressure, heart rate, and body temperature.',
      ],
      clinicalConcerns: [
        `Distinguishing uncomplicated ${condition} from underlying secondary systemic complications.`,
        'Assessing hydration balance, functional mobility, and daily activity tolerance.',
      ],
      recommendedTests: [
        'Complete Blood Count (CBC) with differential',
        'Routine Urinalysis',
        'Baseline resting Blood Pressure and Pulse Rate check',
      ],
      supportiveAdvice: [
        'Ensure restful sleep and adequate fluid intake (boiled water, light broth, or rice kanji).',
        'Keep a daily record of morning and evening symptoms for the consulting physician.',
      ],
      redFlagWarnings: [
        'High temperature above 102°F unresponsive to paracetamol sponge baths.',
        'Severe intractable headache, neck stiffness, or progressive lethargy.',
      ],
      questionsForDoctor: [
        `What is the most likely primary cause of my ${condition}?`,
        'Are there any diagnostic tests recommended before our next follow-up?',
        'Under what specific symptoms should I seek immediate hospital emergency care?',
      ],
    };
  }

  // ── Specialist Agent 2: Emergency Triage ────────────────────────────
  private runEmergencyTriageAgent(condition: string): AgentObservation {
    return {
      agentName: 'Emergency Triage Agent',
      agentRole: 'Acuity Stratification & Red Flag Safety Screen',
      avatarIcon: '🚨',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      observations: [
        'Evaluating vital organ compromise (Airway, Breathing, Circulation, Disability).',
        'Ruling out acute respiratory distress, severe sepsis, or acute hemodynamic collapse.',
      ],
      clinicalConcerns: [
        'Delayed care during rural transit if severe warning signs emerge.',
        'Potential rapid clinical deterioration in vulnerable groups (infants, pregnant women, elderly).',
      ],
      recommendedTests: [
        'Continuous pulse oximetry (SpO2)',
        'Immediate Point-of-Care Capillary Blood Glucose (RBS)',
        '12-Lead Electrocardiogram (ECG) if chest pain or palpitations present',
      ],
      supportiveAdvice: [
        'Identify the nearest 24/7 emergency hospital (e.g. Kodaikanal Govt Hospital or CHC Palani).',
        'Keep emergency telephone numbers (108 Ambulance, ASHA worker) easily accessible.',
      ],
      redFlagWarnings: [
        'Sudden severe breathlessness, stridor, or chest heaviness radiating to left arm/jaw.',
        'Loss of consciousness, syncope, persistent confusion, or seizures.',
        'Bluish discoloration of lips, nails, or tongue (cyanosis) with SpO2 < 93%.',
      ],
      questionsForDoctor: [
        'Is my current condition safe to monitor at home, or does it require emergency casualty observation?',
        'What immediate first-aid steps should my family take if symptoms suddenly worsen?',
      ],
    };
  }

  // ── Specialist Agent 3: Diabetes Agent ──────────────────────────────
  private runDiabetesAgent(condition: string): AgentObservation {
    return {
      agentName: 'Diabetes & Metabolic Agent',
      agentRole: 'Glycemic Control & Endocrine Evaluation',
      avatarIcon: '🩸',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      observations: [
        'Glycemic variability directly impacts immune competence, wound healing, and infection recovery.',
        'Evaluate fasting blood glucose (< 100 mg/dL target) and post-prandial glucose (< 140 mg/dL target).',
      ],
      clinicalConcerns: [
        'Hypoglycemia risk (< 70 mg/dL) causing shakiness, sweating, confusion, and fall trauma.',
        'Hyperglycemic hyperosmolar state or ketoacidosis during acute illness or infection.',
      ],
      recommendedTests: [
        'Glycated Hemoglobin (HbA1c) 3-month average',
        'Fasting and 2-Hour Post-Prandial Blood Sugar (FBS / PPBS)',
        'Urine Microalbumin / Creatinine Ratio (Renal screening)',
      ],
      supportiveAdvice: [
        'Maintain consistent meal timings; do not skip meals when taking oral hypoglycemics.',
        'Perform daily inspection of feet, interdigital spaces, and nail beds for minor cuts or blisters.',
        'Stay adequately hydrated with water; avoid sugary bottled drinks or fruit concentrates.',
      ],
      redFlagWarnings: [
        'Blood glucose reading exceeding 300 mg/dL accompanied by nausea, vomiting, or fruity breath odor.',
        'Severe trembling, cold sweats, or dizziness not resolving with glucose/sugar intake.',
        'Non-healing ulcer or dark discoloration on toes or feet.',
      ],
      questionsForDoctor: [
        'Does my acute illness require temporary adjustment of my diabetes medication?',
        'How often should I check my blood glucose at home during periods of illness?',
      ],
    };
  }

  // ── Specialist Agent 4: Nutrition Agent ──────────────────────────────
  private runNutritionAgent(condition: string): AgentObservation {
    return {
      agentName: 'Nutrition & Dietetics Agent',
      agentRole: 'Micronutrient Balance & Regional Diet Guidance',
      avatarIcon: '🥗',
      badgeColor: 'bg-green-100 text-green-800 border-green-200',
      observations: [
        'Nutritional status dictates immune response velocity, tissue recovery, and vascular resilience.',
        'Promote culturally accessible, affordable South Indian foods (millets, lentils, greens, curd).',
      ],
      clinicalConcerns: [
        'Micronutrient deficiencies: iron deficiency anemia, Vitamin D insufficiency, and protein deficit.',
        'Excessive dietary refined sodium or unrefined sugar consumption in rural household cooking.',
      ],
      recommendedTests: [
        'Serum Ferritin & Total Iron Binding Capacity (TIBC)',
        'Serum 25-Hydroxy Vitamin D3 level',
        'Serum Albumin and Total Protein',
      ],
      supportiveAdvice: [
        'Incorporate iron-rich local greens (moringa / drumstick leaves, spinach) with lemon for Vitamin C absorption.',
        'Include wholesome protein sources: boiled egg, roasted chana (sattu), dal, sambar, and fresh curd.',
        'Replace refined white polished rice with ragi (finger millet), kambu, or brown unpolished grains.',
      ],
      redFlagWarnings: [
        'Inability to tolerate oral fluids or food for greater than 24 consecutive hours.',
        'Severe muscle wasting, extreme pallor of conjunctiva and palms, or bilateral ankle swelling.',
      ],
      questionsForDoctor: [
        'Are there specific foods I should strictly avoid with my current condition or medications?',
        'Would a daily multivitamin or iron/calcium supplement benefit my recovery?',
      ],
    };
  }

  // ── Specialist Agent 5: Pediatric Agent ──────────────────────────────
  private runPediatricAgent(condition: string): AgentObservation {
    return {
      agentName: 'Pediatric Specialist Agent',
      agentRole: 'Childhood Growth & Pediatric Triage',
      avatarIcon: '👶',
      badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      observations: [
        'Pediatric physiology has higher metabolic turnover and faster fluid depletion than adults.',
        'Always calculate all medication dosages strictly per kilogram of body weight.',
      ],
      clinicalConcerns: [
        'Dehydration risk from pediatric diarrhea or vomiting.',
        'Febrile seizures in young children with rapid high temperature spikes.',
      ],
      recommendedTests: [
        'Weight-for-Age and Height-for-Age growth chart percentile plotting',
        'Microscopic stool examination in persistent diarrhea',
        'Rapid Dengue or Malaria test if high fever in endemic rural pockets',
      ],
      supportiveAdvice: [
        'Continue active breastfeeding or frequent oral rehydration solution (ORS) sips.',
        'Dress child in light, breathable cotton clothing during fever; avoid tight thermal blankets.',
        'Monitor daily wet diaper count (minimum 6 wet diapers in 24 hours indicates safe hydration).',
      ],
      redFlagWarnings: [
        'Subcostal or intercostal chest indrawing (ribs pulling inward during breathing).',
        'Child is unusually drowsy, cannot be easily awakened, or refuses all feeds.',
        'Persistent vomiting where child cannot keep even a single teaspoon of water down.',
      ],
      questionsForDoctor: [
        'What is the exact milliliter dose of paracetamol syrup based on my child\'s current weight?',
        'Are all of my child\'s UIP immunizations up to date for their age?',
      ],
    };
  }

  // ── Specialist Agent 6: Maternal Care Agent ──────────────────────────
  private runMaternalCareAgent(condition: string): AgentObservation {
    return {
      agentName: 'Maternal Care Agent',
      agentRole: 'Obstetric Safety & Gestational Health',
      avatarIcon: '🤰',
      badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
      observations: [
        'Assess gestational age, trimester-specific physiological changes, and fetal wellbeing.',
        'Screen for maternal anemia (target Hb > 11.0 g/dL) and preeclampsia risk.',
      ],
      clinicalConcerns: [
        'Hypertensive disorders of pregnancy (Gestational Hypertension / Preeclampsia).',
        'Fetal growth restriction and maternal nutritional depletion.',
      ],
      recommendedTests: [
        'Antenatal Obstetric Ultrasound for fetal biometry and amniotic fluid volume',
        'Urine dipstick for proteinuria',
        'Complete Blood Count for maternal hemoglobin and platelet count',
      ],
      supportiveAdvice: [
        'Consume daily IFA (Iron-Folic Acid) tablets after food; avoid taking with tea or coffee.',
        'Rest on left lateral side to optimize uteroplacental blood circulation.',
        'Maintain routine antenatal checkups on the 9th of every month under PMSMA.',
      ],
      redFlagWarnings: [
        'Persistent severe headache, flashing lights/spots before eyes, or severe epigastric pain.',
        'Any vaginal bleeding, fluid leaking, or sudden reduction in fetal kick movements.',
        'Sudden severe swelling of face, fingers, or sudden massive weight gain.',
      ],
      questionsForDoctor: [
        'Is my blood pressure in a safe range for my gestational week?',
        'Are all my current medications safe for the developing baby?',
      ],
    };
  }

  // ── Specialist Agent 7: Newborn Care Agent ──────────────────────────
  private runNewbornCareAgent(condition: string): AgentObservation {
    return {
      agentName: 'Newborn Care Agent',
      agentRole: 'Neonatal Health & Early Life Milestones',
      avatarIcon: '🍼',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      observations: [
        'Focus on exclusive breastfeeding, thermal protection (Kangaroo Mother Care), and cord cleanliness.',
        'Evaluate newborn suckling reflex, skin color, and neonatal jaundice progression.',
      ],
      clinicalConcerns: [
        'Neonatal sepsis or hypothermia in cold hill climate.',
        'Severe neonatal hyperbilirubinemia (jaundice extending to palms and soles).',
      ],
      recommendedTests: [
        'Serum Total and Direct Bilirubin (if jaundice noticeable beyond day 3)',
        'Newborn Thyroid Screening (TSH)',
        'Clinical weight check to assess birth weight regain milestone (by day 10–14)',
      ],
      supportiveAdvice: [
        'Practice exclusive breastfeeding on demand (every 2 to 3 hours, at least 8–12 times per day).',
        'Keep umbilical cord stump dry and clean without applying powders, ash, or oils.',
        'Ensure warm swaddling with cap and socks in high-altitude cool climates.',
      ],
      redFlagWarnings: [
        'Poor feeding: infant stops suckling or is unable to latch.',
        'Body temperature feels very hot (> 100°F) or abnormally cold (< 96.8°F) to touch.',
        'Fast breathing (> 60 breaths per minute) with audible grunting or chest retractions.',
      ],
      questionsForDoctor: [
        'Is my baby gaining weight at the normal expected daily rate?',
        'When should the next routine vaccination dose be scheduled at the PHC?',
      ],
    };
  }

  // ── Specialist Agent 8: Elderly Care Agent ──────────────────────────
  private runElderlyCareAgent(condition: string): AgentObservation {
    return {
      agentName: 'Elderly Care Agent',
      agentRole: 'Geriatric Comprehensive Health & Fall Prevention',
      avatarIcon: '👴',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      observations: [
        'Consider age-related physiological declines, polypharmacy risks, and frailty.',
        'Assess home safety: non-slip flooring, lighting at night, and grab bars near latrines.',
      ],
      clinicalConcerns: [
        'Orthostatic hypotension and fall accidents leading to femoral neck fractures.',
        'Cognitive fluctuations, medication non-adherence, and drug-drug interactions.',
      ],
      recommendedTests: [
        'Serum Creatinine & Estimated GFR (eGFR) for renal dose clearance',
        'Serum Electrolytes (Sodium, Potassium, Calcium)',
        'Bipedal standing balance and Get-Up-and-Go functional mobility test',
      ],
      supportiveAdvice: [
        'Use assistive walking aids (cane or walker) on uneven village paths and inclines.',
        'Organize daily pills into a simple color-coded pill organizer box.',
        'Rise slowly from bed to a seated position for 1 full minute before standing.',
      ],
      redFlagWarnings: [
        'Acute confusion, delirium, or sudden speech slurring.',
        'Fall incident accompanied by inability to bear weight on hip or severe localized pain.',
        'Rapid decrease in urine output or progressive shortness of breath while lying flat.',
      ],
      questionsForDoctor: [
        'Can any of my daily medications be safely simplified or de-prescribed?',
        'Are my blood pressure medicines causing morning dizziness or fall risk?',
      ],
    };
  }

  // ── Specialist Agent 9: Medication Safety Agent ──────────────────────
  private runMedicationSafetyAgent(condition: string, currentPatientMeds: Medicine[]): AgentObservation {
    const medNames = currentPatientMeds.map(m => m.name).join(', ') || 'No active patient medications recorded in local database.';

    return {
      agentName: 'Medication Safety Agent',
      agentRole: 'Pharmacovigilance & Drug Interaction Screening',
      avatarIcon: '💊',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      observations: [
        `Cross-referencing condition against patient active medications: ${medNames}.`,
        'Verifying that no automated drug prescriptions or dose modifications are issued.',
        'Ensuring adherence to doctor-prescribed meal relations (before/after food).',
      ],
      clinicalConcerns: [
        'Polypharmacy risk and potential interactions between NSAIDs, antihypertensives, and antidiabetics.',
        'Accidental dose doubling or omission during acute sickness.',
      ],
      recommendedTests: [
        'Medication reconciliation review with Primary Health Centre pharmacist',
        'Liver Function Test (LFT) and Renal Function Test (RFT) if taking chronic medications',
      ],
      supportiveAdvice: [
        'Never stop or change prescribed chronic medications without explicit doctor confirmation.',
        'Keep all medicines in their original labeled strips away from heat and moisture.',
        'If a scheduled dose is missed, take it when remembered unless close to the next dose.',
      ],
      redFlagWarnings: [
        'Developing rash, facial swelling, or wheezing after starting any new medication.',
        'Dark black tarry stools or vomiting blood while taking pain relievers or blood thinners.',
      ],
      questionsForDoctor: [
        'Do any of my current medications interact with common over-the-counter fever or cough remedies?',
        'What should I do if I accidentally take a dose twice or forget a dose?',
      ],
    };
  }

  private generateSupportingEvidence(condition: string): string[] {
    return [
      `Primary clinical presentation features consistent with standard diagnostic criteria for ${condition}.`,
      'Epidemiological prevalence in rural hill community demographics.',
      'Symptom trajectory matches primary healthcare clinical guideline patterns.',
      'Documented response patterns to supportive hydration, rest, and guideline-directed therapy.',
    ];
  }
}

export const agentSimulationCoordinator = new AgentSimulationCoordinator();

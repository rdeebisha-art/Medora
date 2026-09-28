export type PillColor =
  | 'White'
  | 'Off-White'
  | 'Yellow'
  | 'Light Yellow'
  | 'Orange'
  | 'Pink'
  | 'Red'
  | 'Blue'
  | 'Light Blue'
  | 'Green'
  | 'Brown'
  | 'Purple'
  | 'Two-tone Red/Yellow'
  | 'Two-tone Blue/White'
  | 'Two-tone Purple/Yellow';

export type PillShape =
  | 'Round'
  | 'Oval'
  | 'Capsule'
  | 'Oblong'
  | 'Hexagonal'
  | 'Diamond'
  | 'Square'
  | 'Chewable Round';

export interface LocalPillRecord {
  id: string;
  brandName: string;
  genericName: string;
  imprint: string; // embossed imprint code, e.g. "DOLO 650"
  imprintSecondary?: string;
  strength: string;
  color: PillColor;
  colorHex: string;
  colorHexSecondary?: string;
  shape: PillShape;
  scoreLine: 'Unscored' | 'Single Score' | 'Cross Score';
  sizeMm: number; // approximate diameter or length in mm
  drugClass: string;
  formulation: string;

  // Primary User Requirements:
  dosageInstructions: {
    standardAdultDose: string;
    frequency: string;
    mealRelation: string;
    maxDailyLimit: string;
    missedDoseGuidance: string;
    specialPopulations: string;
    duration: string;
  };

  sideEffects: {
    common: string[];
    moderate: string[];
    seriousAdverseReactions: string[];
    whenToSeekUrgentCare: string;
  };

  // Additional Clinical Safety:
  indications: string[];
  contraindications: string[];
  majorWarnings: string[];
  storageAdvice: string;
  prescriptionRequired: boolean;
  samplePhotoUrl?: string;
}

export const LOCAL_PILL_DATABASE: LocalPillRecord[] = [
  {
    id: 'pill-dolo-650',
    brandName: 'Dolo 650',
    genericName: 'Paracetamol (Acetaminophen)',
    imprint: 'DOLO 650',
    strength: '650 mg',
    color: 'White',
    colorHex: '#FFFFFF',
    shape: 'Round',
    scoreLine: 'Single Score',
    sizeMm: 12.8,
    drugClass: 'Analgesic & Antipyretic (Pain and Fever Reducer)',
    formulation: 'Oral Uncoated Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (650 mg) orally with water every 6 to 8 hours as needed.',
      frequency: 'Every 6-8 hours (maximum 4 times per day).',
      mealRelation: 'Take after food or with warm water to prevent gastric discomfort.',
      maxDailyLimit: 'Do not exceed 4,000 mg (maximum 6 tablets of 650mg) in 24 hours to avoid liver toxicity.',
      missedDoseGuidance: 'Take as soon as remembered if fever persists. Never take two tablets together to make up for a missed dose.',
      specialPopulations: 'Safe in pregnancy at therapeutic doses. In severe liver or renal disease, consultation is required.',
      duration: 'Do not exceed 3 consecutive days for fever or 5 days for pain without doctor review.',
    },
    sideEffects: {
      common: ['Mild nausea', 'Rare stomach upset', 'Sweating as fever breaks'],
      moderate: ['Mild skin itching', 'Headache'],
      seriousAdverseReactions: [
        'Skin rash, peeling, or blisters (Stevens-Johnson syndrome)',
        'Yellowing of skin or eyes (jaundice / acute liver strain)',
        'Dark amber urine or pale clay-colored stool',
        'Swelling of face, lips, or throat',
      ],
      whenToSeekUrgentCare: 'Seek emergency medical help if facial swelling, difficulty breathing, or severe yellowing of eyes occurs.',
    },
    indications: ['Fever', 'Headache', 'Muscle aches', 'Post-vaccination soreness', 'Dental pain'],
    contraindications: ['Severe active hepatic impairment (liver failure)', 'Known hypersensitivity to paracetamol'],
    majorWarnings: ['Do not consume alcohol while taking paracetamol.', 'Check combination cough syrups to prevent accidental overdose.'],
    storageAdvice: 'Store below 30°C in a dry place protected from direct heat and moisture.',
    prescriptionRequired: false,
  },
  {
    id: 'pill-calpol-500',
    brandName: 'Calpol 500',
    genericName: 'Paracetamol (Acetaminophen)',
    imprint: '500',
    imprintSecondary: 'GSK',
    strength: '500 mg',
    color: 'White',
    colorHex: '#FFFFFF',
    shape: 'Round',
    scoreLine: 'Single Score',
    sizeMm: 11.5,
    drugClass: 'Analgesic & Antipyretic',
    formulation: 'Oral Tablet',
    dosageInstructions: {
      standardAdultDose: '1 to 2 tablets (500mg to 1000mg) every 4 to 6 hours as needed.',
      frequency: '3 to 4 times daily.',
      mealRelation: 'Can be taken with or without food. Best with a glass of water.',
      maxDailyLimit: 'Maximum 4,000 mg (8 tablets of 500mg) in 24 hours.',
      missedDoseGuidance: 'Take when remembered if needed for pain or fever; maintain at least 4 hours between doses.',
      specialPopulations: 'Children aged 6-12 years: 250mg-500mg per dose; for younger infants use weight-based pediatric syrup.',
      duration: 'Consult doctor if fever persists beyond 3 days.',
    },
    sideEffects: {
      common: ['Nausea', 'Mild stomach ache'],
      moderate: ['Transient skin flushing'],
      seriousAdverseReactions: [
        'Anaphylaxis / wheezing',
        'Liver enzyme elevation',
        'Severe cutaneous reactions',
      ],
      whenToSeekUrgentCare: 'Stop medicine and seek clinic review if unexplained rash or breathing tightness develops.',
    },
    indications: ['Mild to moderate fever', 'Viral flu body ache', 'Toothache'],
    contraindications: ['Chronic severe alcoholism', 'Known paracetamol allergy'],
    majorWarnings: ['Keep at least 4 to 6 hours gap between any two doses.'],
    storageAdvice: 'Store in cool dry place away from children.',
    prescriptionRequired: false,
  },
  {
    id: 'pill-metformin-500',
    brandName: 'Glycomet 500 / Metformin',
    genericName: 'Metformin Hydrochloride',
    imprint: 'MET 500',
    strength: '500 mg',
    color: 'White',
    colorHex: '#FFFFFF',
    shape: 'Oval',
    scoreLine: 'Single Score',
    sizeMm: 14.2,
    drugClass: 'Biguanide Antidiabetic',
    formulation: 'Extended Release (ER) Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (500 mg) orally once or twice daily with meals.',
      frequency: 'Once or twice daily with the largest meals (breakfast/dinner).',
      mealRelation: 'Strictly take with or immediately after food to avoid stomach cramps and nausea.',
      maxDailyLimit: 'Maximum 2,000 mg to 2,550 mg daily as prescribed by doctor.',
      missedDoseGuidance: 'Take with next meal. Do not take an extra dose to make up for a missed tablet.',
      specialPopulations: 'Contraindicated in severe renal impairment (eGFR < 30 mL/min). Regular kidney tests required.',
      duration: 'Long-term maintenance therapy for Type 2 Diabetes Mellitus.',
    },
    sideEffects: {
      common: ['Nausea', 'Loose stools / diarrhea', 'Metallic taste in mouth', 'Stomach bloating or gas'],
      moderate: ['Reduced appetite', 'Vitamin B12 deficiency with prolonged use'],
      seriousAdverseReactions: [
        'Lactic Acidosis (rare, serious medical emergency with deep rapid breathing, severe fatigue, unusual muscle pain)',
        'Severe hypoglycemia if combined with sulfonylureas or alcohol',
      ],
      whenToSeekUrgentCare: 'Seek urgent hospital care if experiencing rapid shallow breathing, extreme weakness, or persistent severe vomiting.',
    },
    indications: ['Type 2 Diabetes Mellitus glycemic control', 'Insulin resistance management'],
    contraindications: ['Severe renal failure', 'Acute metabolic acidosis / diabetic ketoacidosis', 'Severe dehydration'],
    majorWarnings: ['Temporarily stop 48 hours prior to surgical procedures or IV iodinated contrast scans with doctor advice.'],
    storageAdvice: 'Store below 25°C away from excessive heat and direct sunlight.',
    prescriptionRequired: true,
  },
  {
    id: 'pill-metformin-1000',
    brandName: 'Glycomet 1000 SR',
    genericName: 'Metformin Hydrochloride Extended Release',
    imprint: 'GLY 1000',
    strength: '1,000 mg',
    color: 'White',
    colorHex: '#FFFFFF',
    shape: 'Oblong',
    scoreLine: 'Single Score',
    sizeMm: 18.0,
    drugClass: 'Biguanide Antidiabetic',
    formulation: 'Sustained Release Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (1000 mg) once daily with dinner.',
      frequency: 'Once daily with evening meal.',
      mealRelation: 'Take whole with water during dinner; do not crush or chew.',
      maxDailyLimit: '2,000 mg per day.',
      missedDoseGuidance: 'Take next day with dinner if forgotten. Never take two 1000mg tablets at once.',
      specialPopulations: 'Dose adjustment needed in elderly patients and moderate kidney impairment.',
      duration: 'Chronic daily medication.',
    },
    sideEffects: {
      common: ['Abdominal discomfort', 'Mild diarrhea during first 2 weeks', 'Flatulence'],
      moderate: ['Taste disturbance'],
      seriousAdverseReactions: ['Lactic acidosis', 'Profound dehydration'],
      whenToSeekUrgentCare: 'Contact doctor if persistent diarrhea causes weakness or dizziness.',
    },
    indications: ['Type 2 Diabetes Mellitus'],
    contraindications: ['Chronic kidney disease Stage 4/5', 'Active liver failure'],
    majorWarnings: ['Swallow whole; do not break extended release matrix.'],
    storageAdvice: 'Store in airtight blister pack below 30°C.',
    prescriptionRequired: true,
  },
  {
    id: 'pill-amlo-5',
    brandName: 'Amlong 5 / Stamlo 5',
    genericName: 'Amlodipine Besylate',
    imprint: 'AMLO 5',
    strength: '5 mg',
    color: 'Light Yellow',
    colorHex: '#FEF08A',
    shape: 'Hexagonal',
    scoreLine: 'Unscored',
    sizeMm: 8.5,
    drugClass: 'Dihydropyridine Calcium Channel Blocker',
    formulation: 'Oral Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (5 mg) orally once daily in morning or evening.',
      frequency: 'Once daily at approximately the same time every day.',
      mealRelation: 'Can be taken with or without food. Swallow with a glass of water.',
      maxDailyLimit: 'Maximum 10 mg once daily under clinical supervision.',
      missedDoseGuidance: 'Take as soon as remembered on the same day. If >12 hours late, skip and take normal dose next morning.',
      specialPopulations: 'Start at lower dose (2.5 mg) in frail elderly patients or severe hepatic impairment.',
      duration: 'Long-term maintenance for hypertension control.',
    },
    sideEffects: {
      common: ['Swelling of ankles and feet (peripheral edema)', 'Flushing of face', 'Dizziness when standing up', 'Fatigue'],
      moderate: ['Palpitations / pounding heartbeat', 'Abdominal pain', 'Muscle cramps'],
      seriousAdverseReactions: [
        'Severe hypotension (fainting, systolic BP < 90 mmHg)',
        'Worsening angina or chest pain on starting therapy (rare)',
        'Severe allergic angioedema',
      ],
      whenToSeekUrgentCare: 'Seek immediate care if severe chest pain, syncope (fainting), or difficulty breathing occurs.',
    },
    indications: ['Essential Hypertension (High Blood Pressure)', 'Chronic stable angina pectoris'],
    contraindications: ['Severe hypotension', 'Cardiogenic shock', 'Severe aortic stenosis'],
    majorWarnings: ['Do not stop suddenly without doctor advice, as rebound blood pressure rise can occur.'],
    storageAdvice: 'Keep protected from moisture and light below 25°C.',
    prescriptionRequired: true,
  },
  {
    id: 'pill-amlo-10',
    brandName: 'Amlong 10',
    genericName: 'Amlodipine Besylate',
    imprint: 'AMLO 10',
    strength: '10 mg',
    color: 'Light Yellow',
    colorHex: '#FDE047',
    shape: 'Round',
    scoreLine: 'Single Score',
    sizeMm: 9.2,
    drugClass: 'Calcium Channel Blocker',
    formulation: 'Oral Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (10 mg) once daily.',
      frequency: 'Once daily.',
      mealRelation: 'With or without food.',
      maxDailyLimit: '10 mg in 24 hours.',
      missedDoseGuidance: 'Take when remembered; do not double up.',
      specialPopulations: 'Elderly patients should be monitored closely for pedal edema.',
      duration: 'Lifelong antihypertensive therapy.',
    },
    sideEffects: {
      common: ['Bilateral ankle swelling', 'Mild headache', 'Warm feeling in face'],
      moderate: ['Postural dizziness'],
      seriousAdverseReactions: ['Marked low blood pressure', 'Arrhythmia'],
      whenToSeekUrgentCare: 'Seek clinic visit if ankle swelling makes walking difficult or if BP drops below 90/60 mmHg.',
    },
    indications: ['Refractory or Stage 2 Hypertension'],
    contraindications: ['Cardiogenic shock', 'Severe hypotension'],
    majorWarnings: ['Avoid grapefruit juice as it may elevate amlodipine blood concentrations.'],
    storageAdvice: 'Store below 30°C.',
    prescriptionRequired: true,
  },
  {
    id: 'pill-brufen-400',
    brandName: 'Brufen 400',
    genericName: 'Ibuprofen',
    imprint: 'BRUFEN 400',
    strength: '400 mg',
    color: 'Orange',
    colorHex: '#FB923C',
    shape: 'Round',
    scoreLine: 'Unscored',
    sizeMm: 12.0,
    drugClass: 'Non-steroidal Anti-inflammatory Drug (NSAID)',
    formulation: 'Film-Coated Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (400 mg) orally every 8 hours after meals.',
      frequency: '2 to 3 times daily (maximum 1,200 mg OTC or 2,400 mg prescription).',
      mealRelation: 'ALWAYS take with a meal or a glass of milk to prevent gastric irritation and ulceration.',
      maxDailyLimit: 'Maximum 1,200 mg per day for self-medication (3 tablets of 400mg).',
      missedDoseGuidance: 'Take with food when remembered. Do not double dose.',
      specialPopulations: 'STRICTLY contraindicated in the third trimester of pregnancy (premature ductus arteriosus closure). Avoid in renal failure.',
      duration: 'Shortest effective duration possible (typically 3 to 7 days).',
    },
    sideEffects: {
      common: ['Stomach pain or indigestion', 'Heartburn', 'Nausea', 'Mild dizziness'],
      moderate: ['Fluid retention / mild leg swelling', 'Elevated blood pressure'],
      seriousAdverseReactions: [
        'Gastrointestinal bleeding (black tarry stools, vomiting coffee-ground blood)',
        'Acute kidney impairment / reduced urination',
        'Increased risk of heart attack or stroke with long-term high dose',
        'Severe allergic bronchospasm (especially in aspirin-sensitive asthma)',
      ],
      whenToSeekUrgentCare: 'Seek EMERGENCY care immediately if black bloody stool, severe stomach stabbing pain, or sudden shortness of breath occurs.',
    },
    indications: ['Joint pain / Arthritis flare', 'Backache', 'Dental pain', 'Musculoskeletal inflammation'],
    contraindications: ['Active peptic ulcer disease', 'History of GI bleeding', 'Severe heart failure', 'Third trimester pregnancy', 'Suspected Dengue fever'],
    majorWarnings: ['DO NOT take if you have stomach ulcers. Avoid in suspected Dengue to avoid severe bleeding.'],
    storageAdvice: 'Store in dry place below 25°C.',
    prescriptionRequired: false,
  },
  {
    id: 'pill-combiflam',
    brandName: 'Combiflam',
    genericName: 'Ibuprofen (400mg) + Paracetamol (325mg)',
    imprint: 'COMBIFLAM',
    strength: '400mg / 325mg',
    color: 'White',
    colorHex: '#FFFFFF',
    shape: 'Oval',
    scoreLine: 'Single Score',
    sizeMm: 16.5,
    drugClass: 'NSAID + Analgesic Combination',
    formulation: 'Oral Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet orally twice or three times daily after food.',
      frequency: 'Every 8 hours as needed.',
      mealRelation: 'Strictly take after food with plenty of water.',
      maxDailyLimit: 'Maximum 3 tablets in 24 hours.',
      missedDoseGuidance: 'Take with food if needed; do not double dose.',
      specialPopulations: 'Avoid in pregnancy and in elderly patients with kidney or stomach ulcer history.',
      duration: '3 to 5 days maximum for acute pain flare.',
    },
    sideEffects: {
      common: ['Heartburn', 'Acidity', 'Nausea', 'Epigastric fullness'],
      moderate: ['Headache', 'Drowsiness'],
      seriousAdverseReactions: [
        'Gastric mucosal ulceration / bleeding',
        'Acute renal strain',
        'Liver toxicity if combined with other paracetamol',
      ],
      whenToSeekUrgentCare: 'Stop immediately if stomach burning becomes severe or dark vomit/stool is observed.',
    },
    indications: ['Acute muscle spasm', 'Post-dental extraction pain', 'Sprains and strains', 'Severe headache'],
    contraindications: ['Gastric ulcer', 'Active bleeding disorders', 'Aspirin-induced asthma'],
    majorWarnings: ['Do not combine with any other paracetamol or ibuprofen medicines.'],
    storageAdvice: 'Store below 30°C.',
    prescriptionRequired: false,
  },
  {
    id: 'pill-amoxicillin-500',
    brandName: 'Mox 500 / Novamox',
    genericName: 'Amoxicillin Trihydrate',
    imprint: 'MOX 500',
    strength: '500 mg',
    color: 'Two-tone Red/Yellow',
    colorHex: '#DC2626',
    colorHexSecondary: '#FACC15',
    shape: 'Capsule',
    scoreLine: 'Unscored',
    sizeMm: 19.5,
    drugClass: 'Penicillin Antibacterial',
    formulation: 'Hard Gelatin Capsule',
    dosageInstructions: {
      standardAdultDose: '1 capsule (500 mg) orally every 8 hours (3 times daily).',
      frequency: 'Every 8 hours at regular intervals.',
      mealRelation: 'Can be taken before, during, or after meals with a full glass of water.',
      maxDailyLimit: 'Maximum 1,500 mg to 3,000 mg daily as prescribed by doctor.',
      missedDoseGuidance: 'Take as soon as remembered. If close to next dose, skip and resume schedule. Never take double capsules.',
      specialPopulations: 'Dose must be reduced in moderate-to-severe renal failure. Safe in pregnancy when prescribed by doctor.',
      duration: 'Complete the FULL 5 to 7 days prescribed course even if feeling completely well earlier to prevent antibiotic resistance.',
    },
    sideEffects: {
      common: ['Diarrhea / soft stools', 'Mild nausea', 'Vomiting', 'Stomach cramp'],
      moderate: ['Oral or vaginal yeast infection (thrush)'],
      seriousAdverseReactions: [
        'Severe allergic anaphylaxis (hives, difficulty breathing, facial swelling)',
        'Clostridioides difficile severe watery diarrhea with colitis',
        'Severe skin peeling or bullous eruptions',
      ],
      whenToSeekUrgentCare: 'Seek EMERGENCY care immediately if hives, wheezing, throat swelling, or severe persistent watery diarrhea develops.',
    },
    indications: ['Bacterial respiratory tract infections', 'Acute otitis media (ear infection)', 'Dental abscess', 'Bacterial sinus infection'],
    contraindications: ['True penicillin or beta-lactam allergy', 'Infectious mononucleosis (high rash risk)'],
    majorWarnings: ['DO NOT stop early when symptoms improve. Complete the entire course. Does NOT treat viral flu.'],
    storageAdvice: 'Store below 25°C in dry blister pack.',
    prescriptionRequired: true,
  },
  {
    id: 'pill-augmentin-625',
    brandName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
    imprint: 'AUG 625',
    strength: '625 mg',
    color: 'White',
    colorHex: '#FFFFFF',
    shape: 'Oblong',
    scoreLine: 'Single Score',
    sizeMm: 21.0,
    drugClass: 'Penicillinase-resistant Beta-lactam Antibacterial',
    formulation: 'Film-Coated Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (625 mg) orally twice daily (every 12 hours) with meals.',
      frequency: 'Twice daily at equal 12-hour intervals.',
      mealRelation: 'MUST be taken at the start of a meal to enhance absorption and reduce gastrointestinal side effects.',
      maxDailyLimit: 'Maximum 2 tablets (1,250 mg total) per day unless specialized high-dose regimen.',
      missedDoseGuidance: 'Take with food when remembered. Maintain regular spacing.',
      specialPopulations: 'Adjust dose in renal impairment. Check previous history of penicillin-associated jaundice.',
      duration: 'Complete exact prescribed duration (typically 5 to 10 days).',
    },
    sideEffects: {
      common: ['Diarrhea (frequent)', 'Nausea', 'Abdominal bloating'],
      moderate: ['Candidiasis (fungal overgrowth in mouth/groin)'],
      seriousAdverseReactions: [
        'Cholestatic jaundice / acute hepatitis (yellowing of skin/eyes)',
        'Severe pseudomembranous colitis',
        'Anaphylactic shock',
      ],
      whenToSeekUrgentCare: 'Seek urgent hospital care if watery diarrhea with fever occurs or jaundice appears.',
    },
    indications: ['Resistant bacterial sinusitis', 'Community acquired pneumonia', 'Urinary tract infection', 'Skin and soft tissue abscesses'],
    contraindications: ['Known penicillin hypersensitivity', 'Previous history of amoxicillin-clavulanate jaundice'],
    majorWarnings: ['Must complete the course. Clavulanate commonly causes loose stools; stay hydrated with ORS.'],
    storageAdvice: 'Store in a cool dry place below 25°C protected from light.',
    prescriptionRequired: true,
  },
  {
    id: 'pill-azithromycin-500',
    brandName: 'Azee 500 / Azithral',
    genericName: 'Azithromycin Dihydrate',
    imprint: 'AZ 500',
    strength: '500 mg',
    color: 'Light Blue',
    colorHex: '#7DD3FC',
    shape: 'Oblong',
    scoreLine: 'Single Score',
    sizeMm: 17.5,
    drugClass: 'Macrolide Antibiotic',
    formulation: 'Film-Coated Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (500 mg) orally once daily for 3 to 5 consecutive days.',
      frequency: 'Once daily at the exact same hour each day.',
      mealRelation: 'Take 1 hour before meals or 2 hours after meals with a full glass of water (or with food if stomach upset occurs).',
      maxDailyLimit: '500 mg per day.',
      missedDoseGuidance: 'Take as soon as remembered on the day. Do not take two 500mg tablets in one day.',
      specialPopulations: 'Caution in patients with prolonged cardiac QT interval or severe hepatic impairment.',
      duration: 'Standard short course: strictly 3 days (or 5 days for specific atypical chest infections).',
    },
    sideEffects: {
      common: ['Mild diarrhea', 'Nausea', 'Stomach cramp', 'Vomiting'],
      moderate: ['Transient headache', 'Dizziness', 'Altered taste'],
      seriousAdverseReactions: [
        'Cardiac arrhythmia / QT prolongation',
        'Severe hepatic dysfunction with jaundice',
        'Angioedema or severe allergic skin reactions',
      ],
      whenToSeekUrgentCare: 'Seek urgent medical attention if fluttering palpitations, sudden fainting, or severe persistent diarrhea occurs.',
    },
    indications: ['Atypical bacterial chest infection', 'Throat infection / pharyngitis', 'Skin infection', 'Chlamydial urethritis'],
    contraindications: ['History of macrolide allergy', 'Severe cholestatic jaundice history'],
    majorWarnings: ['Do not use for common viral cold or simple sore throat without bacterial indication.'],
    storageAdvice: 'Store below 30°C in blister packaging.',
    prescriptionRequired: true,
  },
  {
    id: 'pill-cetirizine-10',
    brandName: 'Cetzine 10 / Alerid',
    genericName: 'Cetirizine Hydrochloride',
    imprint: 'CET 10',
    strength: '10 mg',
    color: 'White',
    colorHex: '#FFFFFF',
    shape: 'Oblong',
    scoreLine: 'Single Score',
    sizeMm: 9.8,
    drugClass: 'Second-Generation Antihistamine',
    formulation: 'Film-Coated Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (10 mg) orally once daily at bedtime.',
      frequency: 'Once daily (preferably at night).',
      mealRelation: 'Can be taken with or without food. Swallow with water.',
      maxDailyLimit: 'Maximum 10 mg per 24 hours.',
      missedDoseGuidance: 'Take when remembered; if close to bedtime, take normal single dose. Do not double.',
      specialPopulations: 'Reduce to 5 mg daily in renal impairment and elderly patients.',
      duration: 'As needed for acute allergic bouts or 1 to 2 weeks for seasonal pollen allergies.',
    },
    sideEffects: {
      common: ['Drowsiness / sleepiness', 'Dry mouth', 'Fatigue', 'Mild headache'],
      moderate: ['Dizziness', 'Stomach discomfort'],
      seriousAdverseReactions: [
        'Severe sedation if combined with alcohol or sedatives',
        'Urinary retention in elderly men with prostate enlargement',
        'Rare hypersensitivity rash',
      ],
      whenToSeekUrgentCare: 'Seek doctor advice if unable to pass urine or if throat swelling develops.',
    },
    indications: ['Allergic rhinitis (sneezing, runny nose)', 'Urticaria (allergic itchy skin hives)', 'Insect bite allergy', 'Allergic conjunctivitis'],
    contraindications: ['End-stage renal disease (CrCl < 10 mL/min)', 'Severe allergy to hydroxyzine/cetirizine'],
    majorWarnings: ['May cause drowsiness: DO NOT drive a tractor, motorcycle, or operate heavy machinery after taking.'],
    storageAdvice: 'Store below 25°C in dry place away from children.',
    prescriptionRequired: false,
  },
  {
    id: 'pill-pantoprazole-40',
    brandName: 'Pan 40 / Pantocid',
    genericName: 'Pantoprazole Sodium Gastro-resistant',
    imprint: 'PAN 40',
    strength: '40 mg',
    color: 'Light Yellow',
    colorHex: '#FEF9C3',
    shape: 'Oval',
    scoreLine: 'Unscored',
    sizeMm: 10.5,
    drugClass: 'Proton Pump Inhibitor (PPI)',
    formulation: 'Enteric-Coated Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (40 mg) orally once daily in the morning.',
      frequency: 'Once daily.',
      mealRelation: 'Strictly take 30 to 60 minutes BEFORE morning breakfast with a glass of water. Swallow whole.',
      maxDailyLimit: 'Maximum 40 mg daily (or 80 mg for severe Zollinger-Ellison under specialist care).',
      missedDoseGuidance: 'Take before lunch or dinner if forgotten in the morning. Do not chew or crush.',
      specialPopulations: 'Safe in elderly. In severe liver cirrhosis, maximum 20 mg/day or alternate day use.',
      duration: 'Typically 2 to 4 weeks for gastritis/acid reflux. Avoid indefinite continuous use without review.',
    },
    sideEffects: {
      common: ['Mild headache', 'Diarrhea or constipation', 'Nausea', 'Abdominal fullness'],
      moderate: ['Flatulence', 'Dry mouth'],
      seriousAdverseReactions: [
        'C. difficile-associated colitis',
        'Bone fracture risk (hip, wrist, spine) with long-term high-dose use',
        'Low magnesium levels (hypomagnesemia) causing muscle cramps',
        'Vitamin B12 deficiency on long-term therapy',
      ],
      whenToSeekUrgentCare: 'Seek clinical evaluation if severe watery diarrhea, muscle spasms, or vomiting blood occurs.',
    },
    indications: ['Gastroesophageal Reflux Disease (GERD / Acidity)', 'Peptic ulcer healing and protection', 'NSAID-induced gastritis prevention'],
    contraindications: ['Hypersensitivity to substituted benzimidazoles'],
    majorWarnings: ['Do not crush, chew, or split the tablet; the enteric coating protects it from stomach acid.'],
    storageAdvice: 'Store below 25°C in original moisture-proof strip.',
    prescriptionRequired: true,
  },
  {
    id: 'pill-omeprazole-20',
    brandName: 'Omez 20',
    genericName: 'Omeprazole Gastro-resistant',
    imprint: 'OMEZ 20',
    strength: '20 mg',
    color: 'Two-tone Purple/Yellow',
    colorHex: '#A855F7',
    colorHexSecondary: '#FACC15',
    shape: 'Capsule',
    scoreLine: 'Unscored',
    sizeMm: 15.0,
    drugClass: 'Proton Pump Inhibitor (PPI)',
    formulation: 'Delayed Release Pellets in Capsule',
    dosageInstructions: {
      standardAdultDose: '1 capsule (20 mg) orally once daily 30 minutes before breakfast.',
      frequency: 'Once daily before morning food.',
      mealRelation: 'Take on an empty stomach with plain water. Swallow whole.',
      maxDailyLimit: '40 mg daily as directed.',
      missedDoseGuidance: 'Take before next meal. Do not take double capsules.',
      specialPopulations: 'No adjustment needed in renal failure; monitor in hepatic disease.',
      duration: '2 to 4 weeks for acid peptic disease.',
    },
    sideEffects: {
      common: ['Stomach ache', 'Mild diarrhea', 'Headache'],
      moderate: ['Bloating', 'Nausea'],
      seriousAdverseReactions: ['Severe colitis', 'Acute interstitial nephritis (rare kidney inflammation)'],
      whenToSeekUrgentCare: 'Consult clinician if fever and unexplained rash or reduced urine output occur.',
    },
    indications: ['Heartburn', 'Acid reflux', 'Gastric ulcer healing'],
    contraindications: ['Co-administration with nelfinavir or rilpivirine'],
    majorWarnings: ['Swallow capsule whole; do not chew the tiny enteric pellets inside.'],
    storageAdvice: 'Store below 25°C protected from moisture.',
    prescriptionRequired: false,
  },
  {
    id: 'pill-atorvastatin-10',
    brandName: 'Atorva 10 / Lipitor',
    genericName: 'Atorvastatin Calcium',
    imprint: 'AT 10',
    strength: '10 mg',
    color: 'White',
    colorHex: '#FFFFFF',
    shape: 'Round',
    scoreLine: 'Unscored',
    sizeMm: 7.2,
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    formulation: 'Film-Coated Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (10 mg) orally once daily at night.',
      frequency: 'Once daily (preferably in the evening).',
      mealRelation: 'Can be taken with or without food.',
      maxDailyLimit: 'Maximum 80 mg daily under cardiology supervision.',
      missedDoseGuidance: 'Take if remembered within 12 hours. If >12 hours late, skip and resume regular evening dose.',
      specialPopulations: 'STRICTLY contraindicated in active liver disease and during pregnancy/breastfeeding.',
      duration: 'Long-term cardiovascular prevention therapy.',
    },
    sideEffects: {
      common: ['Mild muscle ache or stiffness', 'Constipation or gas', 'Joint discomfort'],
      moderate: ['Mild liver enzyme rise'],
      seriousAdverseReactions: [
        'Rhabdomyolysis (severe muscle breakdown with dark cola-colored urine and severe muscle weakness)',
        'Acute drug-induced liver injury',
      ],
      whenToSeekUrgentCare: 'Seek urgent hospital care if experiencing unexplained severe muscle pain, tenderness, or brown/tea-colored urine.',
    },
    indications: ['High blood cholesterol (Hypercholesterolemia)', 'Heart attack and stroke prevention in coronary heart disease'],
    contraindications: ['Active liver failure', 'Pregnancy and lactation', 'Unexplained persistent liver enzyme elevation'],
    majorWarnings: ['Report any unexplained muscle pain or tea-colored urine immediately to doctor.'],
    storageAdvice: 'Store below 25°C away from humidity.',
    prescriptionRequired: true,
  },
  {
    id: 'pill-losartan-50',
    brandName: 'Losar 50 / Repace',
    genericName: 'Losartan Potassium',
    imprint: 'LOS 50',
    strength: '50 mg',
    color: 'White',
    colorHex: '#FFFFFF',
    shape: 'Oval',
    scoreLine: 'Single Score',
    sizeMm: 11.0,
    drugClass: 'Angiotensin II Receptor Blocker (ARB)',
    formulation: 'Film-Coated Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (50 mg) orally once daily in the morning.',
      frequency: 'Once daily.',
      mealRelation: 'With or without food.',
      maxDailyLimit: 'Maximum 100 mg daily.',
      missedDoseGuidance: 'Take when remembered on the same day; do not double.',
      specialPopulations: 'CONTRAINDICATED in pregnancy (causes fetal renal toxicity). Monitor potassium levels.',
      duration: 'Chronic daily blood pressure medication.',
    },
    sideEffects: {
      common: ['Dizziness', 'Nasal congestion', 'Fatigue'],
      moderate: ['Elevated blood potassium (hyperkalemia)'],
      seriousAdverseReactions: ['Angioedema (swelling of face/tongue)', 'Acute renal decline in bilateral renal artery stenosis'],
      whenToSeekUrgentCare: 'Seek emergency care for facial swelling or sudden severe dizziness.',
    },
    indications: ['Hypertension', 'Diabetic nephropathy kidney protection', 'Heart failure management'],
    contraindications: ['Pregnancy (all trimesters)', 'Concurrent use with aliskiren in diabetes'],
    majorWarnings: ['Avoid potassium supplements or salt substitutes containing potassium without clinician advice.'],
    storageAdvice: 'Store below 30°C.',
    prescriptionRequired: true,
  },
  {
    id: 'pill-cipro-500',
    brandName: 'Ciplox 500 / Cipro',
    genericName: 'Ciprofloxacin Hydrochloride',
    imprint: 'CIPLOX 500',
    strength: '500 mg',
    color: 'White',
    colorHex: '#FFFFFF',
    shape: 'Oblong',
    scoreLine: 'Single Score',
    sizeMm: 18.2,
    drugClass: 'Fluoroquinolone Antibacterial',
    formulation: 'Film-Coated Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet (500 mg) orally twice daily (every 12 hours) with water.',
      frequency: 'Every 12 hours.',
      mealRelation: 'Take 2 hours before or after dairy products (milk, yogurt), calcium, or iron supplements.',
      maxDailyLimit: 'Maximum 1,500 mg daily.',
      missedDoseGuidance: 'Take if >6 hours until next dose; otherwise skip. Maintain full hydration.',
      specialPopulations: 'Generally avoided in children and during pregnancy due to cartilage risk.',
      duration: 'Strictly 5 to 7 days as prescribed. Drink plenty of water.',
    },
    sideEffects: {
      common: ['Nausea', 'Diarrhea', 'Headache', 'Dizziness'],
      moderate: ['Skin photosensitivity / sun sunburn risk', 'Restlessness'],
      seriousAdverseReactions: [
        'Tendonitis and tendon rupture (especially Achilles tendon pain)',
        'Peripheral neuropathy (tingling, burning in hands/feet)',
        'Central nervous system stimulation or seizures',
      ],
      whenToSeekUrgentCare: 'Stop medicine and seek urgent clinic visit if Achilles heel pain or tendon swelling occurs.',
    },
    indications: ['Bacterial gastroenteritis / infectious diarrhea', 'Urinary tract infection', 'Typhoid fever', 'Bone and joint infection'],
    contraindications: ['History of tendon rupture with quinolones', 'Myasthenia gravis'],
    majorWarnings: ['Avoid sun exposure. Avoid milk or antacids within 2 hours of dose.'],
    storageAdvice: 'Store below 25°C in moisture-proof pack.',
    prescriptionRequired: true,
  },
  {
    id: 'pill-ifa-iron',
    brandName: 'IFA Red Tablet (Iron & Folic Acid)',
    genericName: 'Ferrous Sulfate (100mg elemental iron) + Folic Acid (500mcg)',
    imprint: 'IFA',
    strength: '100mg Fe + 0.5mg Folic Acid',
    color: 'Red',
    colorHex: '#B91C1C',
    shape: 'Round',
    scoreLine: 'Unscored',
    sizeMm: 8.8,
    drugClass: 'Hematinic / Mineral Vitamin Supplement',
    formulation: 'Sugar-Coated Tablet',
    dosageInstructions: {
      standardAdultDose: '1 tablet orally once daily during pregnancy (from 14th week onwards) or for clinical anemia.',
      frequency: 'Once daily.',
      mealRelation: 'Take with lemon water or after meals to aid absorption. DO NOT take with tea or milk (tea blocks iron absorption).',
      maxDailyLimit: '1 to 2 tablets daily as advised by health worker or doctor.',
      missedDoseGuidance: 'Take next day. Harmless blackening of stool is normal.',
      specialPopulations: 'Essential national health supplement for pregnant women, adolescent girls, and anemic patients.',
      duration: 'Minimum 100 to 180 days during pregnancy and postpartum.',
    },
    sideEffects: {
      common: ['Dark / black colored stools (completely normal & harmless)', 'Constipation', 'Mild nausea', 'Metallic taste'],
      moderate: ['Stomach cramping', 'Darkening of teeth if chewed'],
      seriousAdverseReactions: ['Acute iron overdose if accidentally consumed by toddlers (keep strictly locked away)'],
      whenToSeekUrgentCare: 'Seek urgent clinic care if toddler accidentally swallows multiple iron tablets.',
    },
    indications: ['Prevention and treatment of nutritional iron deficiency anemia', 'Pregnancy ANC iron supplementation'],
    contraindications: ['Hemochromatosis (iron overload)', 'Thalassemia major', 'Active peptic ulcer'],
    majorWarnings: ['Black stools are EXPECTED and harmless. Never take with tea/coffee. Keep away from small children.'],
    storageAdvice: 'Store in airtight container away from moisture and small children.',
    prescriptionRequired: false,
  },
  {
    id: 'pill-albendazole-400',
    brandName: 'Zentel 400',
    genericName: 'Albendazole',
    imprint: 'ALB 400',
    strength: '400 mg',
    color: 'Pink',
    colorHex: '#F472B6',
    shape: 'Chewable Round',
    scoreLine: 'Single Score',
    sizeMm: 13.0,
    drugClass: 'Anthelmintic (Deworming Medicine)',
    formulation: 'Chewable Tablet',
    dosageInstructions: {
      standardAdultDose: '1 chewable tablet (400 mg) as a single dose for routine deworming.',
      frequency: 'Single one-time dose, repeated after 6 months or as per national deworming day.',
      mealRelation: 'Chew thoroughly and take with a fatty meal or milk to enhance intestinal anti-parasitic activity.',
      maxDailyLimit: 'Single 400 mg dose for intestinal worms (or course for neurocysticercosis under specialist).',
      missedDoseGuidance: 'Take single dose with evening meal.',
      specialPopulations: 'CONTRAINDICATED in first trimester of pregnancy. For children 1-2 years: 200mg (half tablet).',
      duration: 'Single dose for roundworm/hookworm/pinworm.',
    },
    sideEffects: {
      common: ['Mild stomach discomfort', 'Transient nausea', 'Temporary headache'],
      moderate: ['Mild diarrhea as worms are expelled'],
      seriousAdverseReactions: ['Rare elevation in liver enzymes with prolonged multi-week courses'],
      whenToSeekUrgentCare: 'Seek clinic advice if severe allergic rash or persistent vomiting occurs.',
    },
    indications: ['Hookworm, roundworm, pinworm, and whipworm intestinal parasite infections', 'National Deworming Day'],
    contraindications: ['Pregnancy first trimester', 'Hypersensitivity to benzimidazoles'],
    majorWarnings: ['Chew completely before swallowing. All household members should ideally be dewormed together.'],
    storageAdvice: 'Store below 30°C.',
    prescriptionRequired: false,
  },
];

/**
 * Visual matching algorithm that scores matches based on:
 * - Color matching (exact or primary/secondary)
 * - Shape matching
 * - Imprint matching (fuzzy substring matching)
 * - Confidence score percentage
 */
export interface PillMatchResult {
  pill: LocalPillRecord;
  confidence: number; // 0 - 100
  matchedFeatures: string[];
  mismatchedFeatures: string[];
}

export function searchPillDatabase(query: {
  imprint?: string;
  color?: string;
  shape?: string;
  name?: string;
}): PillMatchResult[] {
  const results: PillMatchResult[] = [];

  const cleanImprint = (query.imprint || '').trim().toUpperCase();
  const cleanColor = (query.color || '').trim().toLowerCase();
  const cleanShape = (query.shape || '').trim().toLowerCase();
  const cleanName = (query.name || '').trim().toLowerCase();

  for (const pill of LOCAL_PILL_DATABASE) {
    let score = 0;
    const maxScore = 100;
    const matched: string[] = [];
    const mismatched: string[] = [];

    // 1. Imprint match (high weight: 50 points)
    if (cleanImprint) {
      const pillImprint = pill.imprint.toUpperCase();
      const pillImprintSec = (pill.imprintSecondary || '').toUpperCase();
      if (pillImprint === cleanImprint || pillImprintSec === cleanImprint) {
        score += 50;
        matched.push(`Exact Imprint Match ("${pill.imprint}")`);
      } else if (pillImprint.includes(cleanImprint) || cleanImprint.includes(pillImprint)) {
        score += 38;
        matched.push(`Partial Imprint Match ("${pill.imprint}")`);
      } else {
        mismatched.push('Imprint differs');
      }
    } else {
      score += 20; // neutral if no imprint specified
    }

    // 2. Color match (25 points)
    if (cleanColor && cleanColor !== 'any') {
      const pillColor = pill.color.toLowerCase();
      if (pillColor.includes(cleanColor) || cleanColor.includes(pillColor)) {
        score += 25;
        matched.push(`Color Match (${pill.color})`);
      } else {
        mismatched.push(`Color is ${pill.color}`);
      }
    } else {
      score += 15;
    }

    // 3. Shape match (25 points)
    if (cleanShape && cleanShape !== 'any') {
      const pillShape = pill.shape.toLowerCase();
      if (pillShape.includes(cleanShape) || cleanShape.includes(pillShape)) {
        score += 25;
        matched.push(`Shape Match (${pill.shape})`);
      } else {
        mismatched.push(`Shape is ${pill.shape}`);
      }
    } else {
      score += 15;
    }

    // 4. Name match bonus
    if (cleanName) {
      const brand = pill.brandName.toLowerCase();
      const generic = pill.genericName.toLowerCase();
      if (brand.includes(cleanName) || generic.includes(cleanName)) {
        score = Math.min(100, score + 40);
        matched.push(`Name matched "${pill.brandName}"`);
      }
    }

    const confidence = Math.min(99.4, Math.max(15.0, score));

    // If any filter was applied, only return relevant hits
    if (!cleanImprint && !cleanColor && !cleanShape && !cleanName) {
      results.push({
        pill,
        confidence: 90,
        matchedFeatures: ['Catalog entry'],
        mismatchedFeatures: [],
      });
    } else if (matched.length > 0) {
      results.push({
        pill,
        confidence: Number(confidence.toFixed(1)),
        matchedFeatures: matched,
        mismatchedFeatures: mismatched,
      });
    }
  }

  // Sort descending by confidence
  results.sort((a, b) => b.confidence - a.confidence);
  return results;
}

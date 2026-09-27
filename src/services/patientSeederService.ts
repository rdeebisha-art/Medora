import { db, Patient, Medicine, Appointment } from '../db/db';
import { logAuditEvent } from './auditLoggerService';

export interface DemoPatientMedicine {
  name: string;
  dose: string;
  frequency: string;
  times: string[];
  doctor: string;
  instructions: string;
  status: 'active' | 'completed' | 'paused';
}

export interface DemoPatientAppointment {
  doctorName: string;
  date: string;
  time: string;
  department: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface DemoPatientData {
  patientCode: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  pin: string;
  role: 'patient';
  village: string;
  language: string;
  familyId: number;
  familyRelationship: string;
  bloodGroup: string;
  allergies: string[];
  conditions: string[];
  weight: number;
  emergencyContact: string;
  dateOfBirth: string;
  isPregnant?: boolean;
  pregnancyWeeks?: number;
  isElderly?: boolean;
  isNewborn?: boolean;
  isChild?: boolean;
  isNewMother?: boolean;
  prescribedMedicines: DemoPatientMedicine[];
  appointments: DemoPatientAppointment[];
}

/**
 * 20 Unique, Fictional Demo Patient Records
 * Realistic Indian rural healthcare profiles representing maternity, geriatric,
 * pediatric, chronic conditions, and general wellness.
 */
export const FICTIONAL_20_DEMO_PATIENTS: DemoPatientData[] = [
  // 1. Geriatric Hypertension & Joint Health
  {
    patientCode: 'P-1001',
    name: 'Ramesh Kumar',
    age: 68,
    gender: 'male',
    phone: '9876543210',
    pin: '1234',
    role: 'patient',
    village: 'Kodaikanal',
    language: 'ta',
    familyId: 1,
    familyRelationship: 'Grandfather / Head of Family',
    bloodGroup: 'B+',
    allergies: ['Penicillin'],
    conditions: ['Hypertension (Stage 2)', 'Bilateral Knee Osteoarthritis'],
    weight: 66.0,
    emergencyContact: '9876500001',
    dateOfBirth: '1958-04-12',
    isElderly: true,
    prescribedMedicines: [
      {
        name: 'Amlodipine 5mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['08:00 AM'],
        doctor: 'Dr. Suresh Balakrishnan',
        instructions: 'Take in the morning with warm water after food',
        status: 'active',
      },
      {
        name: 'Telmisartan 40mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['07:00 PM'],
        doctor: 'Dr. Suresh Balakrishnan',
        instructions: 'Take before dinner regularly',
        status: 'active',
      },
      {
        name: 'Calcium + Vit D3 500mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['01:30 PM'],
        doctor: 'Dr. Meenakshi Sundaram',
        instructions: 'Take post lunch for bone density support',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Suresh Balakrishnan (Cardiology)',
        date: '2026-10-15',
        time: '10:00 AM',
        department: 'Cardiology / Medicine',
        notes: 'Monthly blood pressure and electrolyte evaluation',
        status: 'scheduled',
      },
    ],
  },

  // 2. Maternal Antenatal Third Trimester
  {
    patientCode: 'P-1002',
    name: 'Sunita Devi',
    age: 26,
    gender: 'female',
    phone: '9876543211',
    pin: '1234',
    role: 'patient',
    village: 'Kodaikanal',
    language: 'hi',
    familyId: 2,
    familyRelationship: 'Mother / Daughter-in-law',
    bloodGroup: 'O+',
    allergies: [],
    conditions: ['Intrauterine Pregnancy (28 Weeks)', 'Mild Nutritional Anemia'],
    weight: 58.5,
    emergencyContact: '9876500002',
    dateOfBirth: '2000-08-15',
    isPregnant: true,
    pregnancyWeeks: 28,
    prescribedMedicines: [
      {
        name: 'Ferrous Sulphate 200mg',
        dose: '1 tablet',
        frequency: 'Twice daily',
        times: ['08:30 AM', '08:00 PM'],
        doctor: 'Dr. Kavitha Rao',
        instructions: 'Take with lemon water; avoid tea or milk for 1 hour',
        status: 'active',
      },
      {
        name: 'Folic Acid 5mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['09:00 AM'],
        doctor: 'Dr. Kavitha Rao',
        instructions: 'Take every morning without skipping',
        status: 'active',
      },
      {
        name: 'Calcium Carbonate 500mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['01:00 PM'],
        doctor: 'Dr. Kavitha Rao',
        instructions: 'Take after afternoon lunch',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Kavitha Rao (OBG)',
        date: '2026-10-08',
        time: '11:00 AM',
        department: 'Maternal Care PHC',
        notes: '32-week growth ultrasound and maternal hemoglobin test',
        status: 'scheduled',
      },
    ],
  },

  // 3. Healthy Newborn Well-Baby
  {
    patientCode: 'P-1003',
    name: 'Baby Arjun',
    age: 0,
    gender: 'male',
    phone: '9876543212',
    pin: '1234',
    role: 'patient',
    village: 'Kodaikanal',
    language: 'ta',
    familyId: 2,
    familyRelationship: 'Infant Son of Sunita Devi',
    bloodGroup: 'O+',
    allergies: [],
    conditions: ['Healthy Neonatal Growth', 'Exclusively Breastfed'],
    weight: 3.2,
    emergencyContact: '9876543211',
    dateOfBirth: '2026-09-12',
    isNewborn: true,
    prescribedMedicines: [
      {
        name: 'Vitamin D3 Drops',
        dose: '400 IU (0.5 mL)',
        frequency: 'Once daily',
        times: ['10:00 AM'],
        doctor: 'Dr. Kavitha Rao',
        instructions: 'Administer directly into mouth using calibrated dropper',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Kavitha Rao (Pediatrics)',
        date: '2026-10-24',
        time: '09:30 AM',
        department: 'Immunization Post',
        notes: '6-week vaccination: Pentavalent-1, OPV-1, Rotavirus-1',
        status: 'scheduled',
      },
    ],
  },

  // 4. Pediatric Respiratory & Allergy
  {
    patientCode: 'P-1004',
    name: 'Meena Sharma',
    age: 8,
    gender: 'female',
    phone: '9876543213',
    pin: '1234',
    role: 'patient',
    village: 'Vilpatti',
    language: 'hi',
    familyId: 3,
    familyRelationship: 'Daughter / School Child',
    bloodGroup: 'B+',
    allergies: ['Peanuts', 'Cold Mist'],
    conditions: ['Mild Intermittent Childhood Asthma'],
    weight: 24.5,
    emergencyContact: '9876500003',
    dateOfBirth: '2018-03-20',
    isChild: true,
    prescribedMedicines: [
      {
        name: 'Salbutamol Inhaler 100mcg',
        dose: '2 puffs',
        frequency: 'As needed (SOS)',
        times: ['As needed'],
        doctor: 'Dr. Rajeshwari Patel',
        instructions: 'Use with pediatric spacer during wheezing or vigorous play',
        status: 'active',
      },
      {
        name: 'Cetirizine 5mg Syrup',
        dose: '5 mL',
        frequency: 'Once daily at bedtime (SOS)',
        times: ['08:30 PM'],
        doctor: 'Dr. Arjun Mehta',
        instructions: 'For allergic sneezing or night cough',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Rajeshwari Patel (Pulmonology)',
        date: '2026-11-02',
        time: '02:00 PM',
        department: 'Pediatric Clinic',
        notes: 'Seasonal winter peak flow and inhaler technique review',
        status: 'scheduled',
      },
    ],
  },

  // 5. Maternal Gestational Care
  {
    patientCode: 'P-1005',
    name: 'Anitha Kumar',
    age: 32,
    gender: 'female',
    phone: '9876543214',
    pin: '1234',
    role: 'patient',
    village: 'Kodaikanal',
    language: 'ta',
    familyId: 1,
    familyRelationship: 'Mother / Daughter-in-law',
    bloodGroup: 'B+',
    allergies: ['Penicillin'],
    conditions: ['Gestational Diabetes Mellitus (Diet Controlled)', 'Anemia'],
    weight: 62.0,
    emergencyContact: '9876543210',
    dateOfBirth: '1994-06-18',
    isPregnant: true,
    pregnancyWeeks: 22,
    prescribedMedicines: [
      {
        name: 'Iron & Folic Acid Tablet',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['09:00 AM'],
        doctor: 'Dr. Ananya Iyer',
        instructions: 'Take after breakfast with fresh lime juice',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Ananya Iyer (OBGYN)',
        date: '2026-10-12',
        time: '10:30 AM',
        department: 'Maternal Wing',
        notes: 'Fasting and 2-hr post-prandial blood glucose profile test',
        status: 'scheduled',
      },
    ],
  },

  // 6. Adult Chronic Metabolic (Diabetes & Hypertension)
  {
    patientCode: 'P-1006',
    name: 'Suresh Guptha',
    age: 45,
    gender: 'male',
    phone: '9876543215',
    pin: '1234',
    role: 'patient',
    village: 'Poombarai',
    language: 'ml',
    familyId: 4,
    familyRelationship: 'Father / Family Head',
    bloodGroup: 'AB+',
    allergies: ['Sulfa drugs'],
    conditions: ['Type 2 Diabetes Mellitus', 'Primary Hypertension'],
    weight: 74.0,
    emergencyContact: '9876500004',
    dateOfBirth: '1981-11-05',
    prescribedMedicines: [
      {
        name: 'Metformin 500mg',
        dose: '1 tablet',
        frequency: 'Twice daily',
        times: ['08:00 AM', '08:00 PM'],
        doctor: 'Dr. Arjun Mehta',
        instructions: 'Take immediately after food; never skip major meals',
        status: 'active',
      },
      {
        name: 'Glimepiride 1mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['07:45 AM'],
        doctor: 'Dr. Priya Nair',
        instructions: 'Take 15 minutes before morning breakfast',
        status: 'active',
      },
      {
        name: 'Telmisartan 40mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['08:00 AM'],
        doctor: 'Dr. Arjun Mehta',
        instructions: 'Morning blood pressure tablet',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Priya Nair (Endocrinology)',
        date: '2026-10-18',
        time: '11:30 AM',
        department: 'Diabetes Clinic',
        notes: 'Quarterly HbA1c screening and diabetic foot examination',
        status: 'scheduled',
      },
    ],
  },

  // 7. Senior Chronic Respiratory Care (COPD)
  {
    patientCode: 'P-1007',
    name: 'Gopi Krishnan',
    age: 72,
    gender: 'male',
    phone: '9876543216',
    pin: '1234',
    role: 'patient',
    village: 'Shenbaganur',
    language: 'ta',
    familyId: 5,
    familyRelationship: 'Grandfather / Retired Worker',
    bloodGroup: 'O-',
    allergies: [],
    conditions: ['COPD Grade 2', 'Chronic Bronchitis'],
    weight: 61.2,
    emergencyContact: '9876500005',
    dateOfBirth: '1954-02-28',
    isElderly: true,
    prescribedMedicines: [
      {
        name: 'Budesonide 200mcg + Formoterol 6mcg DPI',
        dose: '2 inhalations',
        frequency: 'Twice daily',
        times: ['07:30 AM', '07:30 PM'],
        doctor: 'Dr. Rajeshwari Patel',
        instructions: 'Rinse mouth thoroughly with water after inhalation',
        status: 'active',
      },
      {
        name: 'Theophylline 300mg (Sustained Release)',
        dose: '1 tablet',
        frequency: 'Once daily at bedtime',
        times: ['09:00 PM'],
        doctor: 'Dr. Rajeshwari Patel',
        instructions: 'Take after dinner for nocturnal bronchospasm prevention',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Rajeshwari Patel (Pulmonology)',
        date: '2026-10-22',
        time: '10:00 AM',
        department: 'Respiratory Care Unit',
        notes: 'Spirometry check and annual influenza vaccination',
        status: 'scheduled',
      },
    ],
  },

  // 8. Postpartum Maternal Recovery
  {
    patientCode: 'P-1008',
    name: 'Lakshmi Devi',
    age: 25,
    gender: 'female',
    phone: '9876543217',
    pin: '1234',
    role: 'patient',
    village: 'Vilpatti',
    language: 'te',
    familyId: 6,
    familyRelationship: 'New Mother / Spouse',
    bloodGroup: 'A+',
    allergies: [],
    conditions: ['Postpartum Recovery (6 Weeks)', 'Normal Lactation'],
    weight: 52.0,
    emergencyContact: '9876500006',
    dateOfBirth: '2001-05-14',
    isNewMother: true,
    prescribedMedicines: [
      {
        name: 'Postnatal Multivitamin & Zinc',
        dose: '1 capsule',
        frequency: 'Once daily',
        times: ['10:00 AM'],
        doctor: 'Dr. Kavitha Rao',
        instructions: 'Supports lactation nutritional reserve',
        status: 'active',
      },
      {
        name: 'Ferrous Ascorbate 100mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['08:00 PM'],
        doctor: 'Dr. Kavitha Rao',
        instructions: 'Continue for 90 days postpartum',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Kavitha Rao (OBG)',
        date: '2026-10-28',
        time: '11:15 AM',
        department: 'Postnatal Clinic',
        notes: '6-week maternal postpartum wellness and family planning counseling',
        status: 'scheduled',
      },
    ],
  },

  // 9. Early Trimester Pregnancy
  {
    patientCode: 'P-1009',
    name: 'Priya Mehta',
    age: 29,
    gender: 'female',
    phone: '9876543218',
    pin: '1234',
    role: 'patient',
    village: 'Mannavanur',
    language: 'hi',
    familyId: 7,
    familyRelationship: 'Spouse / Expectant Mother',
    bloodGroup: 'A-',
    allergies: [],
    conditions: ['Intrauterine Pregnancy (14 Weeks)', 'Mild Hyperemesis Gravidarum'],
    weight: 55.0,
    emergencyContact: '9876500007',
    dateOfBirth: '1997-09-18',
    isPregnant: true,
    pregnancyWeeks: 14,
    prescribedMedicines: [
      {
        name: 'Doxylamine 10mg + Pyridoxine 10mg',
        dose: '1 tablet',
        frequency: 'Twice daily',
        times: ['08:00 AM', '09:00 PM'],
        doctor: 'Dr. Ananya Iyer',
        instructions: 'For pregnancy nausea and vomiting',
        status: 'active',
      },
      {
        name: 'Folic Acid 5mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['08:30 AM'],
        doctor: 'Dr. Ananya Iyer',
        instructions: 'Daily neural tube defect prevention',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Ananya Iyer (OBGYN)',
        date: '2026-11-05',
        time: '10:00 AM',
        department: 'Maternal OPD',
        notes: 'Second trimester anomaly ultrasound scan scheduling',
        status: 'scheduled',
      },
    ],
  },

  // 10. Adult Dyslipidemia & Prediabetes
  {
    patientCode: 'P-1010',
    name: 'Harish Joshi',
    age: 51,
    gender: 'male',
    phone: '9876543219',
    pin: '1234',
    role: 'patient',
    village: 'Kodaikanal',
    language: 'hi',
    familyId: 8,
    familyRelationship: 'Father / Household Earner',
    bloodGroup: 'AB+',
    allergies: ['Dust'],
    conditions: ['Impaired Fasting Glucose (Prediabetes)', 'Hyperlipidemia'],
    weight: 78.4,
    emergencyContact: '9876500008',
    dateOfBirth: '1975-04-16',
    prescribedMedicines: [
      {
        name: 'Atorvastatin 10mg',
        dose: '1 tablet',
        frequency: 'Once daily at bedtime',
        times: ['09:30 PM'],
        doctor: 'Dr. Suresh Balakrishnan',
        instructions: 'Lowers LDL cholesterol; take regularly at night',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Suresh Balakrishnan (Cardiology)',
        date: '2026-11-12',
        time: '03:00 PM',
        department: 'Lipid Clinic',
        notes: 'Repeat fasting lipid panel and dietary compliance review',
        status: 'scheduled',
      },
    ],
  },

  // 11. Senior Osteoporosis & Hypertension
  {
    patientCode: 'P-1011',
    name: 'Sarita Patel',
    age: 63,
    gender: 'female',
    phone: '9876543220',
    pin: '1234',
    role: 'patient',
    village: 'Poombarai',
    language: 'hi',
    familyId: 9,
    familyRelationship: 'Grandmother',
    bloodGroup: 'O+',
    allergies: [],
    conditions: ['Postmenopausal Osteoporosis', 'Essential Hypertension'],
    weight: 57.0,
    emergencyContact: '9876500009',
    dateOfBirth: '1963-08-20',
    isElderly: true,
    prescribedMedicines: [
      {
        name: 'Telmisartan 40mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['08:00 AM'],
        doctor: 'Dr. Arjun Mehta',
        instructions: 'Morning blood pressure medicine',
        status: 'active',
      },
      {
        name: 'Alendronate 70mg',
        dose: '1 tablet',
        frequency: 'Once weekly (Sunday)',
        times: ['07:00 AM'],
        doctor: 'Dr. Meenakshi Sundaram',
        instructions: 'Take first thing in morning with full glass of plain water; remain upright 30 mins',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Meenakshi Sundaram (Orthopedics)',
        date: '2026-10-30',
        time: '11:00 AM',
        department: 'Geriatric Ortho Clinic',
        notes: 'Bone mineral density (DEXA) review and fall prevention check',
        status: 'scheduled',
      },
    ],
  },

  // 12. Adult Neurological / Migraine
  {
    patientCode: 'P-1012',
    name: 'Deepa Guptha',
    age: 41,
    gender: 'female',
    phone: '9876543221',
    pin: '1234',
    role: 'patient',
    village: 'Poombarai',
    language: 'ml',
    familyId: 4,
    familyRelationship: 'Mother / Spouse',
    bloodGroup: 'A+',
    allergies: ['Ciprofloxacin'],
    conditions: ['Chronic Migraine with Aura', 'Cervical Muscle Spasm'],
    weight: 59.2,
    emergencyContact: '9876543215',
    dateOfBirth: '1985-05-15',
    prescribedMedicines: [
      {
        name: 'Propranolol 20mg',
        dose: '1 tablet',
        frequency: 'Twice daily',
        times: ['08:00 AM', '08:00 PM'],
        doctor: 'Dr. Arjun Mehta',
        instructions: 'Migraine prophylaxis; maintain regular sleep schedule',
        status: 'active',
      },
      {
        name: 'Paracetamol 650mg',
        dose: '1 tablet',
        frequency: 'SOS (As needed)',
        times: ['As needed'],
        doctor: 'Dr. Arjun Mehta',
        instructions: 'Take at onset of throbbing headache with glass of water',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Arjun Mehta (Physician)',
        date: '2026-11-15',
        time: '02:30 PM',
        department: 'General OPD',
        notes: 'Headache diary review and stress management follow-up',
        status: 'scheduled',
      },
    ],
  },

  // 13. Senior Urological & Cardiovascular Health
  {
    patientCode: 'P-1013',
    name: 'Basavanna Gowda',
    age: 70,
    gender: 'male',
    phone: '9876543222',
    pin: '1234',
    role: 'patient',
    village: 'Mannavanur',
    language: 'kn',
    familyId: 10,
    familyRelationship: 'Elder Patriarch',
    bloodGroup: 'O+',
    allergies: [],
    conditions: ['Benign Prostatic Hyperplasia (BPH)', 'Hypertension'],
    weight: 69.0,
    emergencyContact: '9876500010',
    dateOfBirth: '1956-03-10',
    isElderly: true,
    prescribedMedicines: [
      {
        name: 'Tamsulosin 0.4mg',
        dose: '1 capsule',
        frequency: 'Once daily at bedtime',
        times: ['09:30 PM'],
        doctor: 'Dr. Karthik Raman',
        instructions: 'Take 30 minutes after dinner for urinary flow ease',
        status: 'active',
      },
      {
        name: 'Amlodipine 5mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['08:00 AM'],
        doctor: 'Dr. Suresh Balakrishnan',
        instructions: 'Blood pressure control',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Karthik Raman (Surgery / Urology)',
        date: '2026-10-25',
        time: '10:30 AM',
        department: 'Surgical OPD',
        notes: 'Uroflowmetry and serum PSA titer monitoring',
        status: 'scheduled',
      },
    ],
  },

  // 14. Senior Thyroid & Joint Health
  {
    patientCode: 'P-1014',
    name: 'Ningamma Gowda',
    age: 65,
    gender: 'female',
    phone: '9876543223',
    pin: '1234',
    role: 'patient',
    village: 'Mannavanur',
    language: 'kn',
    familyId: 10,
    familyRelationship: 'Matriarch / Spouse',
    bloodGroup: 'A+',
    allergies: ['Aspirin'],
    conditions: ['Primary Hypothyroidism', 'Bilateral Knee Osteoarthritis'],
    weight: 64.5,
    emergencyContact: '9876543222',
    dateOfBirth: '1961-07-22',
    isElderly: true,
    prescribedMedicines: [
      {
        name: 'Levothyroxine 50mcg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['06:30 AM'],
        doctor: 'Dr. Priya Nair',
        instructions: 'Take on an empty stomach with plain water at least 45 mins before tea/food',
        status: 'active',
      },
      {
        name: 'Glucosamine + Chondroitin 500mg',
        dose: '1 tablet',
        frequency: 'Twice daily',
        times: ['08:00 AM', '08:00 PM'],
        doctor: 'Dr. Meenakshi Sundaram',
        instructions: 'Joint cartilage support',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Priya Nair (Endocrinology)',
        date: '2026-11-10',
        time: '11:00 AM',
        department: 'Thyroid Clinic',
        notes: 'Serum TSH titration test review',
        status: 'scheduled',
      },
    ],
  },

  // 15. Adult Hematological Health (Nutritional Anemia)
  {
    patientCode: 'P-1015',
    name: 'Sunita Das',
    age: 34,
    gender: 'female',
    phone: '9876543224',
    pin: '1234',
    role: 'patient',
    village: 'Shenbaganur',
    language: 'hi',
    familyId: 5,
    familyRelationship: 'Mother / Homemaker',
    bloodGroup: 'B+',
    allergies: [],
    conditions: ['Microcytic Hypochromic Anemia (Hb: 9.8 g/dL)', 'Chronic Fatigue'],
    weight: 50.2,
    emergencyContact: '9876500011',
    dateOfBirth: '1992-09-02',
    prescribedMedicines: [
      {
        name: 'Ferrous Ascorbate 100mg + Folic Acid',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['08:30 PM'],
        doctor: 'Dr. Arjun Mehta',
        instructions: 'Take after dinner; include green leafy vegetables in diet',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Arjun Mehta (Internal Medicine)',
        date: '2026-10-19',
        time: '01:30 PM',
        department: 'Hematology Screening',
        notes: 'Repeat complete hemogram and serum ferritin level',
        status: 'scheduled',
      },
    ],
  },

  // 16. Pediatric Allergic Rhinitis
  {
    patientCode: 'P-1016',
    name: 'Amit Das',
    age: 10,
    gender: 'male',
    phone: '9876543225',
    pin: '1234',
    role: 'patient',
    village: 'Shenbaganur',
    language: 'hi',
    familyId: 5,
    familyRelationship: 'Elder Son / School Student',
    bloodGroup: 'B+',
    allergies: ['Dust Mites'],
    conditions: ['Allergic Rhinitis', 'Frequent Morning Sneezing'],
    weight: 28.0,
    emergencyContact: '9876543224',
    dateOfBirth: '2016-06-18',
    isChild: true,
    prescribedMedicines: [
      {
        name: 'Levocetirizine 2.5mg Tablet',
        dose: '1 tablet',
        frequency: 'Once daily at night',
        times: ['08:30 PM'],
        doctor: 'Dr. Deepa Shenoy',
        instructions: 'Seasonal allergy protection; wash bedding frequently',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Deepa Shenoy (ENT / Ophthalmology)',
        date: '2026-11-08',
        time: '09:00 AM',
        department: 'School Health Outreach',
        notes: 'Annual pediatric vision screening and nasal allergy check',
        status: 'scheduled',
      },
    ],
  },

  // 17. Pediatric Growth & Deworming
  {
    patientCode: 'P-1017',
    name: 'Rahul Das',
    age: 6,
    gender: 'male',
    phone: '9876543226',
    pin: '1234',
    role: 'patient',
    village: 'Shenbaganur',
    language: 'hi',
    familyId: 5,
    familyRelationship: 'Younger Son / Primary Student',
    bloodGroup: 'O+',
    allergies: [],
    conditions: ['Healthy Child Growth', 'Routine Village Immunization Complete'],
    weight: 19.0,
    emergencyContact: '9876543224',
    dateOfBirth: '2020-11-25',
    isChild: true,
    prescribedMedicines: [
      {
        name: 'Albendazole 400mg Chewable Tablet',
        dose: '1 tablet',
        frequency: 'Single prophylactic dose (Bi-annual)',
        times: ['08:00 PM'],
        doctor: 'Dr. Kavitha Rao',
        instructions: 'National deworming tablet; chew completely after food',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Kavitha Rao (Pediatrics)',
        date: '2026-11-20',
        time: '10:00 AM',
        department: 'Anganwadi Health Camp',
        notes: 'Height and weight growth chart percentile tracking',
        status: 'scheduled',
      },
    ],
  },

  // 18. Adult Women Health & Tension Headache
  {
    patientCode: 'P-1018',
    name: 'Geeta Joshi',
    age: 46,
    gender: 'female',
    phone: '9876543227',
    pin: '1234',
    role: 'patient',
    village: 'Kodaikanal',
    language: 'hi',
    familyId: 8,
    familyRelationship: 'Mother / Spouse',
    bloodGroup: 'A+',
    allergies: ['Codeine'],
    conditions: ['Tension Headaches', 'Perimenopausal Vasomotor Symptoms'],
    weight: 63.0,
    emergencyContact: '9876543219',
    dateOfBirth: '1980-10-30',
    prescribedMedicines: [
      {
        name: 'Calcium Citrate + Vitamin D3',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['01:00 PM'],
        doctor: 'Dr. Ananya Iyer',
        instructions: 'Take after lunch for bone health',
        status: 'active',
      },
      {
        name: 'Naproxen 250mg',
        dose: '1 tablet',
        frequency: 'SOS (As needed for acute tension)',
        times: ['As needed'],
        doctor: 'Dr. Arjun Mehta',
        instructions: 'Take with food or antacid',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Ananya Iyer (Women Wellness)',
        date: '2026-11-18',
        time: '11:30 AM',
        department: 'Women Health Clinic',
        notes: 'Routine cervical Pap smear and breast wellness examination',
        status: 'scheduled',
      },
    ],
  },

  // 19. Gastrointestinal / Acid Peptic Disorder
  {
    patientCode: 'P-1019',
    name: 'Kavita Deshmukh',
    age: 38,
    gender: 'female',
    phone: '9876543228',
    pin: '1234',
    role: 'patient',
    village: 'Vilpatti',
    language: 'ta',
    familyId: 6,
    familyRelationship: 'Household Member',
    bloodGroup: 'B-',
    allergies: [],
    conditions: ['Gastroesophageal Reflux Disease (GERD)', 'Mild Gastritis'],
    weight: 56.4,
    emergencyContact: '9876500012',
    dateOfBirth: '1988-01-22',
    prescribedMedicines: [
      {
        name: 'Pantoprazole 40mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['07:30 AM'],
        doctor: 'Dr. Arjun Mehta',
        instructions: 'Take 30 minutes before breakfast with water',
        status: 'active',
      },
      {
        name: 'Aluminium Hydroxide Gel Suspension',
        dose: '10 mL',
        frequency: 'SOS post meals',
        times: ['As needed'],
        doctor: 'Dr. Arjun Mehta',
        instructions: 'Shake well before use for immediate heartburn relief',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Arjun Mehta (Physician)',
        date: '2026-11-25',
        time: '03:15 PM',
        department: 'GI OPD',
        notes: 'Follow-up for acid reflux symptom resolution and dietary counselling',
        status: 'scheduled',
      },
    ],
  },

  // 20. Adult Cardiovascular Post-Intervention Care
  {
    patientCode: 'P-1020',
    name: 'Rajiv Nambiar',
    age: 54,
    gender: 'male',
    phone: '9876543229',
    pin: '1234',
    role: 'patient',
    village: 'Kodaikanal',
    language: 'ml',
    familyId: 4,
    familyRelationship: 'Brother / Agriculturalist',
    bloodGroup: 'AB-',
    allergies: ['Shellfish'],
    conditions: ['Coronary Artery Disease (CAD)', 'Prior Stent Placement', 'Dyslipidemia'],
    weight: 76.2,
    emergencyContact: '9876500013',
    dateOfBirth: '1972-07-09',
    prescribedMedicines: [
      {
        name: 'Aspirin 75mg (Enteric Coated)',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['09:00 AM'],
        doctor: 'Dr. Suresh Balakrishnan',
        instructions: 'Antiplatelet; take strictly after breakfast',
        status: 'active',
      },
      {
        name: 'Clopidogrel 75mg',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['09:00 AM'],
        doctor: 'Dr. Suresh Balakrishnan',
        instructions: 'Dual antiplatelet therapy for stent patency',
        status: 'active',
      },
      {
        name: 'Rosuvastatin 20mg',
        dose: '1 tablet',
        frequency: 'Once daily at bedtime',
        times: ['09:30 PM'],
        doctor: 'Dr. Suresh Balakrishnan',
        instructions: 'Plaque stabilization and lipid control',
        status: 'active',
      },
      {
        name: 'Metoprolol Succinate 25mg ER',
        dose: '1 tablet',
        frequency: 'Once daily',
        times: ['08:00 AM'],
        doctor: 'Dr. Suresh Balakrishnan',
        instructions: 'Resting pulse rate control (target 60-70 bpm)',
        status: 'active',
      },
    ],
    appointments: [
      {
        doctorName: 'Dr. Suresh Balakrishnan (Cardiology)',
        date: '2026-10-14',
        time: '10:30 AM',
        department: 'Cardiology Clinic',
        notes: 'Resting ECG, Echocardiogram follow-up, and blood pressure titration',
        status: 'scheduled',
      },
    ],
  },
];

export interface SeedingResult {
  success: boolean;
  totalRecordsInDb: number;
  newlySeededCount: number;
  alreadyExistingCount: number;
  fictionalPatientsList: DemoPatientData[];
  timestamp: string;
}

/**
 * Idempotently populates the Medora database with exactly 20 unique fictional demo patient records.
 * If a patient already exists (matched by patientCode or phone), it is preserved and not duplicated.
 */
export async function seedDemoPatients(forceReset = false): Promise<SeedingResult> {
  let newlySeededCount = 0;
  let alreadyExistingCount = 0;

  try {
    for (const demo of FICTIONAL_20_DEMO_PATIENTS) {
      // 1. Check if patient already exists by unique patientCode or phone
      const existingByCode = await db.patients.where({ patientCode: demo.patientCode }).first();
      const existingByPhone = await db.patients.where({ phone: demo.phone }).first();

      let patientId: number;

      if (existingByCode) {
        alreadyExistingCount++;
        patientId = existingByCode.id!;
        // Ensure patientCode is populated if previously missing
        if (!existingByCode.patientCode) {
          await db.patients.update(patientId, { patientCode: demo.patientCode });
        }
      } else if (existingByPhone) {
        alreadyExistingCount++;
        patientId = existingByPhone.id!;
        if (!existingByPhone.patientCode) {
          await db.patients.update(patientId, { patientCode: demo.patientCode });
        }
      } else {
        // Insert new unique fictional patient record
        const newPatient: Omit<Patient, 'id'> = {
          patientCode: demo.patientCode,
          name: demo.name,
          age: demo.age,
          gender: demo.gender,
          phone: demo.phone,
          pin: demo.pin,
          role: 'patient',
          village: demo.village,
          language: demo.language,
          familyId: demo.familyId,
          bloodGroup: demo.bloodGroup,
          allergies: demo.allergies,
          conditions: demo.conditions,
          emergencyContact: demo.emergencyContact,
          dateOfBirth: demo.dateOfBirth,
          weight: demo.weight,
          isPregnant: demo.isPregnant,
          pregnancyWeeks: demo.pregnancyWeeks,
          isElderly: demo.isElderly,
          isNewborn: demo.isNewborn,
          isChild: demo.isChild,
          isNewMother: demo.isNewMother,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const insertedId = await db.patients.add(newPatient as any);
        patientId = insertedId as number;
        newlySeededCount++;

        // Add Prescribed Medicines
        for (const med of demo.prescribedMedicines) {
          const medRecord: Omit<Medicine, 'id'> = {
            patientId,
            name: med.name,
            dose: med.dose,
            frequency: med.frequency,
            times: med.times,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
            doctor: med.doctor,
            instructions: med.instructions,
            status: med.status,
            missedCount: 0,
          };
          await db.medicines.add(medRecord as any);
        }

        // Add Scheduled Appointments
        for (const appt of demo.appointments) {
          const apptRecord: Omit<Appointment, 'id'> = {
            patientId,
            doctorId: 1, // Dr. Arjun Mehta default
            date: appt.date,
            reason: appt.department,
            status: appt.status,
            notes: `${appt.doctorName} (${appt.time}): ${appt.notes}`,
          };
          await db.appointments.add(apptRecord as any);
        }

        // Add Initial Vitals Test
        await db.healthTests.add({
          patientId,
          type: 'weight',
          value: String(demo.weight),
          unit: 'kg',
          date: new Date().toISOString().split('T')[0],
          notes: 'Baseline clinic intake weight',
        });
      }
    }

    const totalRecordsInDb = await db.patients.count();

    // Log the seeding event in the audit trail if newly seeded
    if (newlySeededCount > 0) {
      await logAuditEvent({
        action: `PATIENT_DATABASE_SEEDED: +${newlySeededCount} Fictional Patients`,
        details: `Idempotent patient seeding added ${newlySeededCount} unique demo records. Total patient count in database: ${totalRecordsInDb}. Zero duplicates confirmed.`,
        entityType: 'patient',
        userId: 'SYSTEM-SEEDER',
        userName: 'Medora Idempotent Seeder',
        userRole: 'admin',
        changedFields: {
          newlySeededCount,
          totalRecordsInDb,
          patientsSeeded: FICTIONAL_20_DEMO_PATIENTS.map((p) => p.patientCode),
        },
      });
    }

    return {
      success: true,
      totalRecordsInDb,
      newlySeededCount,
      alreadyExistingCount,
      fictionalPatientsList: FICTIONAL_20_DEMO_PATIENTS,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[PatientSeeder] Error during idempotent patient seeding:', err);
    const count = await db.patients.count().catch(() => 0);
    return {
      success: false,
      totalRecordsInDb: count,
      newlySeededCount,
      alreadyExistingCount,
      fictionalPatientsList: FICTIONAL_20_DEMO_PATIENTS,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Returns current count of patient records in the database.
 */
export async function getDatabasePatientCount(): Promise<number> {
  try {
    return await db.patients.count();
  } catch {
    return 0;
  }
}

/**
 * Explicit alias matching requested naming convention
 */
export const seedDemoPatientsIdempotent = seedDemoPatients;

export default seedDemoPatients;

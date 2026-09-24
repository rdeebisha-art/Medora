export interface FictionalFamilyMember {
  patientId: string;
  familyId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  relationship: string;
  preferredLanguage: 'ta' | 'te' | 'hi' | 'kn' | 'ml' | 'en';
  bloodGroup: string;
  allergies: string[];
  medicalHistory: string[];
  currentConditions: string[];
  currentMedicines: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    status: 'Active' | 'Missed Dosage' | 'Needs Refill';
    missedCount: number;
    instructions: string;
  }>;
  vaccinations: Array<{
    id: string;
    name: string;
    status: 'Given' | 'Due' | 'Overdue';
    dueDate: string;
    givenDate?: string;
  }>;
  recentVitals: {
    bloodPressureSys?: number;
    bloodPressureDia?: number;
    bloodSugarFasting?: number;
    bloodSugarPostPrandial?: number;
    weightKg: number;
    temperatureC?: number;
    spo2?: number;
    pulseRate?: number;
    recordedAt: string;
  };
  category: 'adult' | 'elderly' | 'child' | 'teenager' | 'pregnant' | 'new_mother' | 'newborn';
  pregnancyWeeks?: number;
  newbornDays?: number;
  medicalReports: Array<{
    id: string;
    title: string;
    date: string;
    summary: string;
  }>;
  doctorConsultations: Array<{
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    notes: string;
  }>;
  appointments: Array<{
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    status: 'scheduled' | 'completed' | 'missed';
    reason: string;
  }>;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  recentActivity: string;
  hasCareGap: boolean;
  careGapDetails?: {
    type: 'missed_medicine' | 'vaccination_overdue' | 'maternal_checkup' | 'elderly_followup' | 'ncd_screening';
    title: string;
    description: string;
  };
}

export interface FictionalFamily {
  familyId: string;
  familyName: string;
  village: string;
  houseNumber: string;
  primaryContact: string;
  phoneNumber: string;
  preferredLanguage: 'ta' | 'te' | 'hi' | 'kn' | 'ml' | 'en';
  numberOfMembers: number;
  emergencyContact: string;
  familyHealthScore: number;
  activeConditions: string[];
  activeMedicines: number;
  vaccinationStatus: 'Up to Date' | 'Action Needed' | 'Overdue';
  upcomingAppointments: number;
  missedMedicines: number;
  careGaps: number;
  lastHealthUpdate: string;
  members: FictionalFamilyMember[];
}

export const INITIAL_FICTIONAL_FAMILIES: FictionalFamily[] = [
  {
    familyId: 'FAM-01',
    familyName: 'Kumar Household',
    village: 'Rampur Gram Panchayat',
    houseNumber: 'Door #24, Near Panchayat Well',
    primaryContact: 'Ramesh Kumar',
    phoneNumber: '+919448100223',
    preferredLanguage: 'ta',
    numberOfMembers: 5,
    emergencyContact: '+919448100224',
    familyHealthScore: 78,
    activeConditions: ['Type 2 Diabetes', 'Gestational Anemia', 'Child Wheezing'],
    activeMedicines: 4,
    vaccinationStatus: 'Action Needed',
    upcomingAppointments: 2,
    missedMedicines: 1,
    careGaps: 2,
    lastHealthUpdate: '2026-09-22',
    members: [
      {
        patientId: 'P-1001',
        familyId: 'FAM-01',
        name: 'Ramesh Kumar',
        age: 42,
        gender: 'Male',
        dateOfBirth: '1984-05-12',
        relationship: 'Head of Family',
        preferredLanguage: 'ta',
        bloodGroup: 'O+',
        allergies: ['Dust'],
        medicalHistory: ['Mild Hypertension'],
        currentConditions: ['Hypertension'],
        currentMedicines: [
          { id: 'M-101', name: 'Amlodipine 5mg', dosage: '5mg once daily', frequency: 'Morning', status: 'Active', missedCount: 0, instructions: 'Take after breakfast' }
        ],
        vaccinations: [{ id: 'V-101', name: 'Tetanus Toxoid (TT)', status: 'Given', dueDate: '2025-06-10', givenDate: '2025-06-10' }],
        recentVitals: { bloodPressureSys: 132, bloodPressureDia: 84, weightKg: 68, pulseRate: 74, spo2: 98, recordedAt: '2026-09-20' },
        category: 'adult',
        medicalReports: [{ id: 'R-101', title: 'Routine BP Checkup at PHC', date: '2026-09-20', summary: 'Stable BP under current low-dose amlodipine.' }],
        doctorConsultations: [{ id: 'C-101', doctorName: 'Dr. Arun Kumar', specialty: 'General Physician', date: '2026-09-10', notes: 'Advised low salt diet and regular walking.' }],
        appointments: [{ id: 'A-101', doctorName: 'Dr. Arun Kumar', specialty: 'General Physician', date: '2026-10-15', status: 'scheduled', reason: 'Routine 3-month BP review' }],
        emergencyContact: { name: 'Anitha Kumar', relationship: 'Wife', phone: '+919448100223' },
        recentActivity: 'BP recorded at Rampur PHC on Sep 20',
        hasCareGap: false
      },
      {
        patientId: 'P-1002',
        familyId: 'FAM-01',
        name: 'Anitha Kumar',
        age: 32,
        gender: 'Female',
        dateOfBirth: '1994-03-18',
        relationship: 'Wife / Pregnant Mother',
        preferredLanguage: 'ta',
        bloodGroup: 'B+',
        allergies: ['Penicillin'],
        medicalHistory: ['Mild Iron Deficiency'],
        currentConditions: ['Pregnancy (28 Weeks)', 'Gestational Anemia'],
        currentMedicines: [
          { id: 'M-102', name: 'Iron & Folic Acid (IFA)', dosage: '100mg elemental iron', frequency: 'Daily night', status: 'Active', missedCount: 0, instructions: 'Take after dinner with water, do not take with tea' },
          { id: 'M-103', name: 'Calcium Carbonate', dosage: '500mg', frequency: 'Afternoon', status: 'Active', missedCount: 0, instructions: 'Take 2 hours apart from IFA tablet' }
        ],
        vaccinations: [
          { id: 'V-102', name: 'Td1 (Tetanus-diphtheria in pregnancy)', status: 'Given', dueDate: '2026-04-12', givenDate: '2026-04-12' },
          { id: 'V-103', name: 'Td2 / Td Booster', status: 'Given', dueDate: '2026-05-15', givenDate: '2026-05-15' }
        ],
        recentVitals: { bloodPressureSys: 116, bloodPressureDia: 74, weightKg: 58, pulseRate: 78, temperatureC: 36.8, recordedAt: '2026-09-22' },
        category: 'pregnant',
        pregnancyWeeks: 28,
        medicalReports: [{ id: 'R-102', title: 'ANC 2nd Trimester Hemoglobin', date: '2026-09-15', summary: 'Hb 10.2 g/dL (Mild Anemia), fetal heart sound normal at 142 bpm.' }],
        doctorConsultations: [{ id: 'C-102', doctorName: 'Dr. Kavya Menon', specialty: 'Gynecologist / Obstetrician', date: '2026-09-15', notes: 'Emphasized leafy greens and daily IFA. Schedule 32-week ultrasound.' }],
        appointments: [{ id: 'A-102', doctorName: 'Dr. Kavya Menon', specialty: 'Gynecologist / Obstetrician', date: '2026-10-05', status: 'scheduled', reason: 'ANC 3rd Trimester Checkup' }],
        emergencyContact: { name: 'Ramesh Kumar', relationship: 'Husband', phone: '+919448100223' },
        recentActivity: 'Attended PMSMA clinic on Sep 15; Hb tested 10.2 g/dL',
        hasCareGap: true,
        careGapDetails: {
          type: 'maternal_checkup',
          title: '3rd Trimester Ultrasound & Hb Retest Due',
          description: 'Upcoming ANC checkup scheduled on Oct 5. Monitor kicks count daily.'
        }
      },
      {
        patientId: 'P-1003',
        familyId: 'FAM-01',
        name: 'Meenakshi Ammal',
        age: 69,
        gender: 'Female',
        dateOfBirth: '1957-08-22',
        relationship: 'Mother (Elderly)',
        preferredLanguage: 'ta',
        bloodGroup: 'O+',
        allergies: ['Sulfonamides'],
        medicalHistory: ['Knee Osteoarthritis', 'Type 2 Diabetes for 8 yrs'],
        currentConditions: ['Type 2 Diabetes', 'Bilateral Knee Arthritis'],
        currentMedicines: [
          { id: 'M-104', name: 'Metformin 500mg', dosage: '500mg twice daily', frequency: 'With meals', status: 'Missed Dosage', missedCount: 2, instructions: 'Take strictly with breakfast and dinner' }
        ],
        vaccinations: [{ id: 'V-104', name: 'Pneumococcal Conjugate (Elderly)', status: 'Due', dueDate: '2026-08-10' }],
        recentVitals: { bloodPressureSys: 138, bloodPressureDia: 86, bloodSugarFasting: 154, bloodSugarPostPrandial: 218, weightKg: 62, recordedAt: '2026-09-18' },
        category: 'elderly',
        medicalReports: [{ id: 'R-103', title: 'Fasting Blood Glucose Test', date: '2026-09-18', summary: 'Fasting 154 mg/dL. Two missed Metformin doses noted this week.' }],
        doctorConsultations: [{ id: 'C-103', doctorName: 'Dr. Suresh Gowda', specialty: 'Diabetologist', date: '2026-08-25', notes: 'Reinforced daily morning adherence and diabetic foot care.' }],
        appointments: [{ id: 'A-103', doctorName: 'Dr. Suresh Gowda', specialty: 'Diabetologist', date: '2026-09-28', status: 'scheduled', reason: 'Fasting sugar follow-up' }],
        emergencyContact: { name: 'Ramesh Kumar', relationship: 'Son', phone: '+919448100223' },
        recentActivity: 'Missed 2 evening Metformin doses due to forgetfulness',
        hasCareGap: true,
        careGapDetails: {
          type: 'missed_medicine',
          title: 'Missed Metformin Doses',
          description: 'Elderly member missed 2 doses this week. Fasting blood sugar elevated to 154 mg/dL.'
        }
      },
      {
        patientId: 'P-1004',
        familyId: 'FAM-01',
        name: 'Karthik Kumar',
        age: 6,
        gender: 'Male',
        dateOfBirth: '2020-04-10',
        relationship: 'Son (Child)',
        preferredLanguage: 'ta',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Recurrent cold and seasonal wheeze'],
        currentConditions: ['Seasonal Wheezing / Reactive Airway'],
        currentMedicines: [
          { id: 'M-105', name: 'Salbutamol Inhaler with Spacer', dosage: '100mcg as needed', frequency: 'PRN', status: 'Active', missedCount: 0, instructions: 'Use with spacer only if breathing difficulty occurs' }
        ],
        vaccinations: [
          { id: 'V-105', name: 'DPT Booster 2 (at 5-6 yrs)', status: 'Overdue', dueDate: '2025-10-10' }
        ],
        recentVitals: { weightKg: 19.5, pulseRate: 88, spo2: 99, temperatureC: 37.0, recordedAt: '2026-09-10' },
        category: 'child',
        medicalReports: [{ id: 'R-104', title: 'Pediatric Growth & Chest Check', date: '2026-09-10', summary: 'Clear chest sounds. DPT Booster 2 overdue from age 5.' }],
        doctorConsultations: [{ id: 'C-104', doctorName: 'Dr. Meera Nair', specialty: 'Pediatrician', date: '2026-09-10', notes: 'Counselled parents on DPT booster importance at village Anganwadi.' }],
        appointments: [{ id: 'A-104', doctorName: 'Dr. Meera Nair', specialty: 'Pediatrician', date: '2026-10-02', status: 'scheduled', reason: 'DPT Booster catch-up vaccination' }],
        emergencyContact: { name: 'Ramesh Kumar', relationship: 'Father', phone: '+919448100223' },
        recentActivity: 'DPT Booster vaccine overdue from village Anganwadi list',
        hasCareGap: true,
        careGapDetails: {
          type: 'vaccination_overdue',
          title: 'DPT Booster 2 Overdue',
          description: 'Child aged 6 has missed 5-year DPT booster shot. Scheduled at PHC on Oct 2.'
        }
      },
      {
        patientId: 'P-1005',
        familyId: 'FAM-01',
        name: 'Divya Kumar',
        age: 14,
        gender: 'Female',
        dateOfBirth: '2012-09-05',
        relationship: 'Daughter (Teenager)',
        preferredLanguage: 'ta',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal growth milestones'],
        currentConditions: ['Adolescent Anemia Screening'],
        currentMedicines: [
          { id: 'M-106', name: 'Weekly Iron Folic Acid (WIFS)', dosage: 'Blue tablet 1 weekly', frequency: 'Every Monday', status: 'Active', missedCount: 0, instructions: 'Provided through rural school WIFS programme' }
        ],
        vaccinations: [{ id: 'V-106', name: 'Td at 10 years', status: 'Given', dueDate: '2022-09-10', givenDate: '2022-09-15' }],
        recentVitals: { bloodPressureSys: 110, bloodPressureDia: 70, weightKg: 42, pulseRate: 76, recordedAt: '2026-08-30' },
        category: 'teenager',
        medicalReports: [{ id: 'R-105', title: 'School Health Screening', date: '2026-08-30', summary: 'Hb 11.8 g/dL. Eyes and dental health normal.' }],
        doctorConsultations: [{ id: 'C-105', doctorName: 'Dr. Geetha Swamy', specialty: 'Nutritionist', date: '2026-08-30', notes: 'Encouraged dietary iron through jaggery and green leaves.' }],
        appointments: [],
        emergencyContact: { name: 'Ramesh Kumar', relationship: 'Father', phone: '+919448100223' },
        recentActivity: 'Completed school health screening successfully',
        hasCareGap: false
      }
    ]
  },
  {
    familyId: 'FAM-02',
    familyName: 'Gowda Household',
    village: 'Rampur Gram Panchayat',
    houseNumber: 'Door #89, Farm Quarters, Sector 2',
    primaryContact: 'Basavanna Gowda',
    phoneNumber: '+919448211334',
    preferredLanguage: 'kn',
    numberOfMembers: 6,
    emergencyContact: '+919448211335',
    familyHealthScore: 82,
    activeConditions: ['Hypertension', 'Postnatal Recovery', 'Newborn Monitoring'],
    activeMedicines: 3,
    vaccinationStatus: 'Up to Date',
    upcomingAppointments: 1,
    missedMedicines: 0,
    careGaps: 1,
    lastHealthUpdate: '2026-09-23',
    members: [
      {
        patientId: 'P-1006',
        familyId: 'FAM-02',
        name: 'Basavanna Gowda',
        age: 71,
        gender: 'Male',
        dateOfBirth: '1955-02-14',
        relationship: 'Head of Family (Elderly)',
        preferredLanguage: 'kn',
        bloodGroup: 'A+',
        allergies: [],
        medicalHistory: ['Chronic Hypertension for 12 years'],
        currentConditions: ['Hypertension', 'Mild Hearing Loss'],
        currentMedicines: [
          { id: 'M-201', name: 'Telmisartan 40mg', dosage: '40mg once daily', frequency: 'Morning', status: 'Active', missedCount: 0, instructions: 'Take with glass of water after breakfast' }
        ],
        vaccinations: [{ id: 'V-201', name: 'COVID-19 Precautionary Dose', status: 'Given', dueDate: '2024-03-10', givenDate: '2024-03-10' }],
        recentVitals: { bloodPressureSys: 136, bloodPressureDia: 82, weightKg: 64, pulseRate: 68, recordedAt: '2026-09-21' },
        category: 'elderly',
        medicalReports: [{ id: 'R-201', title: 'Monthly Senior BP Record', date: '2026-09-21', summary: 'BP well-controlled on Telmisartan. No dizziness reported.' }],
        doctorConsultations: [{ id: 'C-201', doctorName: 'Dr. Anandhi Raman', specialty: 'Geriatric Care', date: '2026-08-15', notes: 'Continue current dose. Avoid heavy agricultural lifting in hot sun.' }],
        appointments: [{ id: 'A-201', doctorName: 'Dr. Anandhi Raman', specialty: 'Geriatric Care', date: '2026-10-18', status: 'scheduled', reason: 'Routine 2-month elderly review' }],
        emergencyContact: { name: 'Manjunath Gowda', relationship: 'Son', phone: '+919448211334' },
        recentActivity: 'BP checked by ASHA worker Sister Lakshmi; stable at 136/82',
        hasCareGap: false
      },
      {
        patientId: 'P-1007',
        familyId: 'FAM-02',
        name: 'Parvathi Gowda',
        age: 66,
        gender: 'Female',
        dateOfBirth: '1960-07-19',
        relationship: 'Wife (Elderly)',
        preferredLanguage: 'kn',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Cataract surgery in right eye'],
        currentConditions: ['Mild Osteoporosis'],
        currentMedicines: [
          { id: 'M-202', name: 'Calcium + Vitamin D3', dosage: '500mg/250IU daily', frequency: 'Night', status: 'Active', missedCount: 0, instructions: 'Take with warm milk' }
        ],
        vaccinations: [{ id: 'V-202', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2025-01-10', givenDate: '2025-01-10' }],
        recentVitals: { bloodPressureSys: 124, bloodPressureDia: 78, weightKg: 55, pulseRate: 72, recordedAt: '2026-09-21' },
        category: 'elderly',
        medicalReports: [{ id: 'R-202', title: 'Post-op Eye Review', date: '2026-07-10', summary: 'Vision restored 6/9 right eye.' }],
        doctorConsultations: [{ id: 'C-202', doctorName: 'Dr. Anandhi Raman', specialty: 'Geriatric Care', date: '2026-08-15', notes: 'Encouraged 20 mins morning sunlight.' }],
        appointments: [],
        emergencyContact: { name: 'Manjunath Gowda', relationship: 'Son', phone: '+919448211334' },
        recentActivity: 'Regular morning walks in farm compound',
        hasCareGap: false
      },
      {
        patientId: 'P-1008',
        familyId: 'FAM-02',
        name: 'Manjunath Gowda',
        age: 38,
        gender: 'Male',
        dateOfBirth: '1988-11-20',
        relationship: 'Son (Adult / Farmer)',
        preferredLanguage: 'kn',
        bloodGroup: 'A+',
        allergies: [],
        medicalHistory: ['Occasional lower back ache from harvesting'],
        currentConditions: ['Mechanical Back Pain'],
        currentMedicines: [],
        vaccinations: [{ id: 'V-203', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2024-11-05', givenDate: '2024-11-05' }],
        recentVitals: { bloodPressureSys: 120, bloodPressureDia: 78, weightKg: 70, pulseRate: 70, recordedAt: '2026-09-12' },
        category: 'adult',
        medicalReports: [],
        doctorConsultations: [{ id: 'C-203', doctorName: 'Dr. Arun Kumar', specialty: 'General Physician', date: '2026-08-10', notes: 'Taught core back strengthening exercises.' }],
        appointments: [],
        emergencyContact: { name: 'Basavanna Gowda', relationship: 'Father', phone: '+919448211334' },
        recentActivity: 'Harvesting ragi; doing back stretching daily',
        hasCareGap: false
      },
      {
        patientId: 'P-1009',
        familyId: 'FAM-02',
        name: 'Lakshmi Gowda',
        age: 29,
        gender: 'Female',
        dateOfBirth: '1997-04-03',
        relationship: 'Daughter-in-law (New Mother)',
        preferredLanguage: 'kn',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Normal institutional delivery 24 days ago'],
        currentConditions: ['Postpartum Recovery (Day 24)'],
        currentMedicines: [
          { id: 'M-203', name: 'Postnatal IFA & Calcium', dosage: '1 tablet daily', frequency: 'Night', status: 'Active', missedCount: 0, instructions: 'Continue for minimum 6 months while breastfeeding' }
        ],
        vaccinations: [{ id: 'V-204', name: 'Td Booster (Given in pregnancy)', status: 'Given', dueDate: '2026-06-15', givenDate: '2026-06-15' }],
        recentVitals: { bloodPressureSys: 114, bloodPressureDia: 72, weightKg: 52, pulseRate: 74, temperatureC: 36.6, recordedAt: '2026-09-23' },
        category: 'new_mother',
        medicalReports: [{ id: 'R-203', title: 'HBNC Day 21 Postnatal Visit', date: '2026-09-21', summary: 'Mother healing well. Exclusive breastfeeding established without nipple pain.' }],
        doctorConsultations: [{ id: 'C-204', doctorName: 'Dr. Kavya Menon', specialty: 'Gynecologist / Obstetrician', date: '2026-09-02', notes: 'Discharged healthy after safe delivery at CHC Shivajinagar.' }],
        appointments: [{ id: 'A-202', doctorName: 'Dr. Kavya Menon', specialty: 'Gynecologist / Obstetrician', date: '2026-10-12', status: 'scheduled', reason: '6-week postpartum maternal checkup' }],
        emergencyContact: { name: 'Manjunath Gowda', relationship: 'Husband', phone: '+919448211334' },
        recentActivity: 'Completed Day 21 Home-Based Postnatal Care visit with ANM',
        hasCareGap: false
      },
      {
        patientId: 'P-1010',
        familyId: 'FAM-02',
        name: 'Baby Aarav Gowda',
        age: 0,
        gender: 'Male',
        dateOfBirth: '2026-08-31',
        relationship: 'Grandson (Newborn - 24 Days)',
        preferredLanguage: 'kn',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Born 2.9 kg at full term at CHC'],
        currentConditions: ['Newborn Health Supervision'],
        currentMedicines: [],
        vaccinations: [
          { id: 'V-205', name: 'BCG (at birth)', status: 'Given', dueDate: '2026-08-31', givenDate: '2026-08-31' },
          { id: 'V-206', name: 'OPV 0 dose (at birth)', status: 'Given', dueDate: '2026-08-31', givenDate: '2026-08-31' },
          { id: 'V-207', name: 'Hepatitis B birth dose', status: 'Given', dueDate: '2026-08-31', givenDate: '2026-08-31' },
          { id: 'V-208', name: 'Pentavalent 1 + OPV 1 + Rota 1 (6 Weeks)', status: 'Due', dueDate: '2026-10-12' }
        ],
        recentVitals: { weightKg: 3.4, pulseRate: 132, temperatureC: 36.8, recordedAt: '2026-09-23' },
        category: 'newborn',
        newbornDays: 24,
        medicalReports: [{ id: 'R-204', title: 'Day 21 HBNC Newborn Assessment', date: '2026-09-21', summary: 'Weight gained to 3.4 kg. Cord fell off cleanly. No jaundice or danger signs.' }],
        doctorConsultations: [{ id: 'C-205', doctorName: 'Dr. Rajesh Sharma', specialty: 'Pediatric Care', date: '2026-09-01', notes: 'Birth check normal. Advised exclusive breastfeeding for 6 months.' }],
        appointments: [{ id: 'A-203', doctorName: 'Dr. Meera Nair', specialty: 'Pediatrician', date: '2026-10-12', status: 'scheduled', reason: '6-Week Vaccination & Growth Check' }],
        emergencyContact: { name: 'Manjunath Gowda', relationship: 'Father', phone: '+919448211334' },
        recentActivity: 'Exclusive breastfeeding going strong; gained 500g since birth',
        hasCareGap: true,
        careGapDetails: {
          type: 'maternal_checkup',
          title: 'Upcoming 6-Week Primary Immunization (Oct 12)',
          description: 'Pentavalent-1, OPV-1, Rotavirus-1, fIPV-1, PCV-1 due at PHC Rampur.'
        }
      },
      {
        patientId: 'P-1011',
        familyId: 'FAM-02',
        name: 'Varun Gowda',
        age: 8,
        gender: 'Male',
        dateOfBirth: '2018-05-14',
        relationship: 'Grandson (Child)',
        preferredLanguage: 'kn',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Healthy child milestones'],
        currentConditions: ['Dental Hygiene Follow-up'],
        currentMedicines: [],
        vaccinations: [
          { id: 'V-209', name: 'DPT Booster 2 (at 5 yrs)', status: 'Given', dueDate: '2023-05-15', givenDate: '2023-05-18' }
        ],
        recentVitals: { weightKg: 24, pulseRate: 82, recordedAt: '2026-08-10' },
        category: 'child',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Manjunath Gowda', relationship: 'Father', phone: '+919448211334' },
        recentActivity: 'Attending primary school; active in rural sports',
        hasCareGap: false
      }
    ]
  },
  {
    familyId: 'FAM-03',
    familyName: 'Naik Household',
    village: 'Rampur Gram Panchayat',
    houseNumber: 'House #41, Temple Road',
    primaryContact: 'Suresh Naik',
    phoneNumber: '+919448322445',
    preferredLanguage: 'te',
    numberOfMembers: 4,
    emergencyContact: '+919448322446',
    familyHealthScore: 74,
    activeConditions: ['Asthma (Adult)', 'Gastritis'],
    activeMedicines: 3,
    vaccinationStatus: 'Up to Date',
    upcomingAppointments: 1,
    missedMedicines: 1,
    careGaps: 1,
    lastHealthUpdate: '2026-09-20',
    members: [
      {
        patientId: 'P-1012',
        familyId: 'FAM-03',
        name: 'Suresh Naik',
        age: 46,
        gender: 'Male',
        dateOfBirth: '1980-01-25',
        relationship: 'Head of Family',
        preferredLanguage: 'te',
        bloodGroup: 'AB+',
        allergies: ['Dust', 'Smoke'],
        medicalHistory: ['Chronic Bronchial Asthma for 7 years'],
        currentConditions: ['Bronchial Asthma'],
        currentMedicines: [
          { id: 'M-301', name: 'Budesonide + Formoterol Inhaler', dosage: '200/6 mcg 2 puffs twice daily', frequency: 'Morning & Night', status: 'Missed Dosage', missedCount: 3, instructions: 'Rinse mouth with water after each use' }
        ],
        vaccinations: [{ id: 'V-301', name: 'Influenza Vaccine', status: 'Given', dueDate: '2025-11-10', givenDate: '2025-11-12' }],
        recentVitals: { bloodPressureSys: 128, bloodPressureDia: 80, pulseRate: 84, spo2: 96, weightKg: 66, recordedAt: '2026-09-19' },
        category: 'adult',
        medicalReports: [{ id: 'R-301', title: 'Peak Flow Monitoring', date: '2026-09-19', summary: 'Peak flow 380 L/min. Missed 3 doses of preventer inhaler this week.' }],
        doctorConsultations: [{ id: 'C-301', doctorName: 'Dr. Fatima Begum', specialty: 'General Physician', date: '2026-08-20', notes: 'Do not stop preventer inhaler when feeling well.' }],
        appointments: [{ id: 'A-301', doctorName: 'Dr. Fatima Begum', specialty: 'General Physician', date: '2026-10-08', status: 'scheduled', reason: 'Asthma control test' }],
        emergencyContact: { name: 'Pooja Naik', relationship: 'Wife', phone: '+919448322445' },
        recentActivity: 'Reported morning coughing; preventer inhaler missed',
        hasCareGap: true,
        careGapDetails: {
          type: 'missed_medicine',
          title: 'Missed Asthma Controller Inhaler',
          description: 'Patient stopped budesonide inhaler after symptoms subsided. Advised regular use.'
        }
      },
      {
        patientId: 'P-1013',
        familyId: 'FAM-03',
        name: 'Pooja Naik',
        age: 39,
        gender: 'Female',
        dateOfBirth: '1987-06-14',
        relationship: 'Wife',
        preferredLanguage: 'te',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Dyspepsia'],
        currentConditions: ['Acid Peptic Disease / Gastritis'],
        currentMedicines: [
          { id: 'M-302', name: 'Pantoprazole 40mg', dosage: '40mg once daily', frequency: 'Before breakfast', status: 'Active', missedCount: 0, instructions: 'Take 30 mins before morning meal' }
        ],
        vaccinations: [{ id: 'V-302', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2024-08-14', givenDate: '2024-08-14' }],
        recentVitals: { bloodPressureSys: 118, bloodPressureDia: 76, weightKg: 58, pulseRate: 72, recordedAt: '2026-09-15' },
        category: 'adult',
        medicalReports: [],
        doctorConsultations: [{ id: 'C-302', doctorName: 'Dr. Arun Kumar', specialty: 'General Physician', date: '2026-09-05', notes: 'Avoid excessive spicy pickles and late night meals.' }],
        appointments: [],
        emergencyContact: { name: 'Suresh Naik', relationship: 'Husband', phone: '+919448322445' },
        recentActivity: 'Gastritis improving with dietary timing adjustments',
        hasCareGap: false
      },
      {
        patientId: 'P-1014',
        familyId: 'FAM-03',
        name: 'Tarun Naik',
        age: 16,
        gender: 'Male',
        dateOfBirth: '2010-03-22',
        relationship: 'Son (Teenager)',
        preferredLanguage: 'te',
        bloodGroup: 'AB+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [
          { id: 'V-303', name: 'Td at 16 years', status: 'Given', dueDate: '2026-03-22', givenDate: '2026-03-28' }
        ],
        recentVitals: { bloodPressureSys: 112, bloodPressureDia: 72, weightKg: 54, pulseRate: 70, recordedAt: '2026-08-20' },
        category: 'teenager',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Suresh Naik', relationship: 'Father', phone: '+919448322445' },
        recentActivity: 'Completed age 16 Td vaccination booster',
        hasCareGap: false
      },
      {
        patientId: 'P-1015',
        familyId: 'FAM-03',
        name: 'Sneha Naik',
        age: 11,
        gender: 'Female',
        dateOfBirth: '2015-10-18',
        relationship: 'Daughter (Child)',
        preferredLanguage: 'te',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [
          { id: 'M-303', name: 'Albendazole 400mg', dosage: '400mg single chewable dose', frequency: 'Bi-annual National Deworming', status: 'Active', missedCount: 0, instructions: 'Chewed during National Deworming Day' }
        ],
        vaccinations: [
          { id: 'V-304', name: 'Td at 10 years', status: 'Given', dueDate: '2025-10-18', givenDate: '2025-11-02' }
        ],
        recentVitals: { weightKg: 32, pulseRate: 78, recordedAt: '2026-08-15' },
        category: 'child',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Suresh Naik', relationship: 'Father', phone: '+919448322445' },
        recentActivity: 'Deworming completed under Anganwadi drive',
        hasCareGap: false
      }
    ]
  },
  {
    familyId: 'FAM-04',
    familyName: 'Patel Household',
    village: 'Kodaikanal Rural Hills',
    houseNumber: 'Plot 12, Valley View Hamlet',
    primaryContact: 'Devendra Patel',
    phoneNumber: '+919876543211',
    preferredLanguage: 'hi',
    numberOfMembers: 5,
    emergencyContact: '+919876500002',
    familyHealthScore: 68,
    activeConditions: ['Type 2 Diabetes', 'Severe Hypertension', 'Childhood Malnutrition Risk'],
    activeMedicines: 5,
    vaccinationStatus: 'Action Needed',
    upcomingAppointments: 2,
    missedMedicines: 2,
    careGaps: 3,
    lastHealthUpdate: '2026-09-22',
    members: [
      {
        patientId: 'P-1016',
        familyId: 'FAM-04',
        name: 'Ramesh Patel',
        age: 67,
        gender: 'Male',
        dateOfBirth: '1959-06-15',
        relationship: 'Grandfather (Elderly)',
        preferredLanguage: 'hi',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Type 2 Diabetes 15 yrs', 'Hypertension 10 yrs'],
        currentConditions: ['Type 2 Diabetes', 'Hypertension'],
        currentMedicines: [
          { id: 'M-401', name: 'Glimepiride 1mg', dosage: '1mg once daily', frequency: 'Before breakfast', status: 'Active', missedCount: 0, instructions: 'Eat breakfast immediately after tablet' },
          { id: 'M-402', name: 'Metformin 850mg', dosage: '850mg twice daily', frequency: 'With meals', status: 'Missed Dosage', missedCount: 2, instructions: 'Take with food' },
          { id: 'M-403', name: 'Enalapril 5mg', dosage: '5mg once daily', frequency: 'Morning', status: 'Active', missedCount: 0, instructions: 'Monitor BP weekly' }
        ],
        vaccinations: [{ id: 'V-401', name: 'COVID-19 Booster', status: 'Given', dueDate: '2024-05-10', givenDate: '2024-05-10' }],
        recentVitals: { bloodPressureSys: 146, bloodPressureDia: 92, bloodSugarFasting: 172, bloodSugarPostPrandial: 240, weightKg: 71, pulseRate: 78, recordedAt: '2026-09-21' },
        category: 'elderly',
        medicalReports: [{ id: 'R-401', title: 'Blood Pressure & Sugar Log', date: '2026-09-21', summary: 'BP 146/92 mmHg, Fasting sugar 172 mg/dL. 2 missed Metformin doses recorded.' }],
        doctorConsultations: [{ id: 'C-401', doctorName: 'Dr. Suresh Gowda', specialty: 'Diabetologist', date: '2026-08-18', notes: 'Blood sugar elevated. Advised diabetic foot examination and medication regularity.' }],
        appointments: [{ id: 'A-401', doctorName: 'Dr. Suresh Gowda', specialty: 'Diabetologist', date: '2026-09-29', status: 'scheduled', reason: 'High blood sugar and BP review' }],
        emergencyContact: { name: 'Devendra Patel', relationship: 'Son', phone: '+919876543211' },
        recentActivity: 'BP elevated at 146/92; foot sensation intact',
        hasCareGap: true,
        careGapDetails: {
          type: 'elderly_followup',
          title: 'Uncontrolled Hypertension & Missed Metformin',
          description: 'Systolic BP >140 and missed doses. Scheduled consultation on Sep 29.'
        }
      },
      {
        patientId: 'P-1017',
        familyId: 'FAM-04',
        name: 'Devendra Patel',
        age: 39,
        gender: 'Male',
        dateOfBirth: '1987-04-10',
        relationship: 'Head of Family',
        preferredLanguage: 'hi',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [{ id: 'V-402', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2025-02-14', givenDate: '2025-02-14' }],
        recentVitals: { bloodPressureSys: 122, bloodPressureDia: 78, weightKg: 72, pulseRate: 72, recordedAt: '2026-08-15' },
        category: 'adult',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Sunita Patel', relationship: 'Wife', phone: '+919876543211' },
        recentActivity: 'Primary caregiver managing family medicine refills',
        hasCareGap: false
      },
      {
        patientId: 'P-1018',
        familyId: 'FAM-04',
        name: 'Sunita Patel',
        age: 34,
        gender: 'Female',
        dateOfBirth: '1992-08-20',
        relationship: 'Wife / Homemaker',
        preferredLanguage: 'hi',
        bloodGroup: 'A+',
        allergies: [],
        medicalHistory: ['Mild Anemia during pregnancies'],
        currentConditions: ['Iron Deficiency Anemia'],
        currentMedicines: [
          { id: 'M-404', name: 'Ferrous Ascorbate + Folic Acid', dosage: '100mg once daily', frequency: 'Night', status: 'Active', missedCount: 0, instructions: 'Take with lemon water' }
        ],
        vaccinations: [{ id: 'V-403', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2024-03-10', givenDate: '2024-03-10' }],
        recentVitals: { bloodPressureSys: 110, bloodPressureDia: 70, weightKg: 50, pulseRate: 80, recordedAt: '2026-09-10' },
        category: 'adult',
        medicalReports: [{ id: 'R-402', title: 'Hemoglobin Profile', date: '2026-09-10', summary: 'Hb 10.4 g/dL. On oral iron therapy.' }],
        doctorConsultations: [{ id: 'C-402', doctorName: 'Dr. Geetha Swamy', specialty: 'Nutritionist', date: '2026-09-10', notes: 'Prescribed iron-rich pulse and leafy vegetable inclusion.' }],
        appointments: [],
        emergencyContact: { name: 'Devendra Patel', relationship: 'Husband', phone: '+919876543211' },
        recentActivity: 'Hb 10.4 g/dL; taking iron supplement daily',
        hasCareGap: false
      },
      {
        patientId: 'P-1019',
        familyId: 'FAM-04',
        name: 'Aakash Patel',
        age: 7,
        gender: 'Male',
        dateOfBirth: '2019-01-12',
        relationship: 'Son (Child)',
        preferredLanguage: 'hi',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Underweight for age'],
        currentConditions: ['Mild Malnutrition (Underweight)'],
        currentMedicines: [
          { id: 'M-405', name: 'Multivitamin & Zinc Syrup', dosage: '5ml once daily', frequency: 'Morning', status: 'Active', missedCount: 0, instructions: 'Take after breakfast' }
        ],
        vaccinations: [
          { id: 'V-404', name: 'DPT Booster 2 (at 5-6 yrs)', status: 'Overdue', dueDate: '2024-07-15' },
          { id: 'V-405', name: 'Vitamin A 9th Dose', status: 'Overdue', dueDate: '2024-07-15' }
        ],
        recentVitals: { weightKg: 17.2, pulseRate: 88, recordedAt: '2026-09-18' },
        category: 'child',
        medicalReports: [{ id: 'R-403', title: 'Anganwadi Growth Card', date: '2026-09-18', summary: 'Weight 17.2 kg (-2 SD on WHO growth chart). DPT Booster 2 overdue.' }],
        doctorConsultations: [{ id: 'C-403', doctorName: 'Dr. Meera Nair', specialty: 'Pediatrician', date: '2026-09-02', notes: 'Advised egg/sprouted pulses supplement and catch-up immunization.' }],
        appointments: [{ id: 'A-402', doctorName: 'Dr. Meera Nair', specialty: 'Pediatrician', date: '2026-10-04', status: 'scheduled', reason: 'Growth falter & overdue vaccine catch-up' }],
        emergencyContact: { name: 'Devendra Patel', relationship: 'Father', phone: '+919876543211' },
        recentActivity: 'Anganwadi worker flagged overdue vaccine and low weight',
        hasCareGap: true,
        careGapDetails: {
          type: 'vaccination_overdue',
          title: 'Overdue Childhood Vaccines',
          description: 'Child is overdue for DPT Booster 2 and Vitamin A bi-annual supplement.'
        }
      },
      {
        patientId: 'P-1020',
        familyId: 'FAM-04',
        name: 'Diya Patel',
        age: 3,
        gender: 'Female',
        dateOfBirth: '2023-05-18',
        relationship: 'Daughter (Toddler)',
        preferredLanguage: 'hi',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal milestone development'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [
          { id: 'V-406', name: 'MR 2nd Dose + DPT Booster 1 (16-24 months)', status: 'Given', dueDate: '2024-11-20', givenDate: '2024-12-05' }
        ],
        recentVitals: { weightKg: 13.5, pulseRate: 94, recordedAt: '2026-08-20' },
        category: 'child',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Devendra Patel', relationship: 'Father', phone: '+919876543211' },
        recentActivity: 'Fully vaccinated up to age 2',
        hasCareGap: false
      }
    ]
  },
  {
    familyId: 'FAM-05',
    familyName: 'Menon Household',
    village: 'Wayanad Foothills Hamlet',
    houseNumber: 'House #7, Stream Lane',
    primaryContact: 'Krishnan Menon',
    phoneNumber: '+919447012345',
    preferredLanguage: 'ml',
    numberOfMembers: 5,
    emergencyContact: '+919447012346',
    familyHealthScore: 84,
    activeConditions: ['COPD / Biomass Smoke Exposure', 'Osteoarthritis'],
    activeMedicines: 3,
    vaccinationStatus: 'Up to Date',
    upcomingAppointments: 1,
    missedMedicines: 0,
    careGaps: 1,
    lastHealthUpdate: '2026-09-21',
    members: [
      {
        patientId: 'P-1021',
        familyId: 'FAM-05',
        name: 'Bhavani Amma',
        age: 73,
        gender: 'Female',
        dateOfBirth: '1953-09-12',
        relationship: 'Mother (Elderly)',
        preferredLanguage: 'ml',
        bloodGroup: 'A+',
        allergies: [],
        medicalHistory: ['Chronic bronchitis from wood-stove cooking for 40 years'],
        currentConditions: ['COPD (Mild to Moderate)', 'Knee Pain'],
        currentMedicines: [
          { id: 'M-501', name: 'Ipratropium Inhaler', dosage: '20mcg 2 puffs thrice daily', frequency: 'TDS', status: 'Active', missedCount: 0, instructions: 'Use regularly with spacer' }
        ],
        vaccinations: [{ id: 'V-501', name: 'Pneumococcal Vaccine', status: 'Given', dueDate: '2024-02-10', givenDate: '2024-02-10' }],
        recentVitals: { bloodPressureSys: 130, bloodPressureDia: 80, pulseRate: 76, spo2: 95, weightKg: 52, recordedAt: '2026-09-20' },
        category: 'elderly',
        medicalReports: [{ id: 'R-501', title: 'Spirometry & Pulse Oximetry', date: '2026-09-20', summary: 'SpO2 95% on room air. Chest wheeze reduced on inhaler.' }],
        doctorConsultations: [{ id: 'C-501', doctorName: 'Dr. Fatima Begum', specialty: 'General Physician', date: '2026-09-05', notes: 'Instructed family to keep cooking area ventilated.' }],
        appointments: [{ id: 'A-501', doctorName: 'Dr. Fatima Begum', specialty: 'General Physician', date: '2026-10-20', status: 'scheduled', reason: 'COPD breathing assessment' }],
        emergencyContact: { name: 'Krishnan Menon', relationship: 'Son', phone: '+919447012345' },
        recentActivity: 'Using smokeless Chulha; SpO2 stable at 95%',
        hasCareGap: false
      },
      {
        patientId: 'P-1022',
        familyId: 'FAM-05',
        name: 'Krishnan Menon',
        age: 44,
        gender: 'Male',
        dateOfBirth: '1982-01-30',
        relationship: 'Head of Family',
        preferredLanguage: 'ml',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [{ id: 'V-502', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2025-06-12', givenDate: '2025-06-12' }],
        recentVitals: { bloodPressureSys: 118, bloodPressureDia: 74, weightKg: 68, pulseRate: 70, recordedAt: '2026-09-01' },
        category: 'adult',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Radha Menon', relationship: 'Wife', phone: '+919447012345' },
        recentActivity: 'Active tea estate worker; annual plantation medical checkup clear',
        hasCareGap: false
      },
      {
        patientId: 'P-1023',
        familyId: 'FAM-05',
        name: 'Radha Menon',
        age: 38,
        gender: 'Female',
        dateOfBirth: '1988-03-15',
        relationship: 'Wife',
        preferredLanguage: 'ml',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Mild iron deficiency'],
        currentConditions: ['Anemia'],
        currentMedicines: [
          { id: 'M-502', name: 'Iron Folic Acid Tablet', dosage: '100mg iron daily', frequency: 'Night', status: 'Active', missedCount: 0, instructions: 'Take post dinner' }
        ],
        vaccinations: [{ id: 'V-503', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2024-04-10', givenDate: '2024-04-10' }],
        recentVitals: { bloodPressureSys: 112, bloodPressureDia: 70, weightKg: 56, pulseRate: 74, recordedAt: '2026-09-12' },
        category: 'adult',
        medicalReports: [{ id: 'R-502', title: 'Hemoglobin Count', date: '2026-09-12', summary: 'Hb 10.8 g/dL.' }],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Krishnan Menon', relationship: 'Husband', phone: '+919447012345' },
        recentActivity: 'Taking IFA tablets regularly',
        hasCareGap: false
      },
      {
        patientId: 'P-1024',
        familyId: 'FAM-05',
        name: 'Rahul Menon',
        age: 15,
        gender: 'Male',
        dateOfBirth: '2011-07-22',
        relationship: 'Son (Teenager)',
        preferredLanguage: 'ml',
        bloodGroup: 'A+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [
          { id: 'V-504', name: 'Td at 16 years', status: 'Due', dueDate: '2026-10-15' }
        ],
        recentVitals: { bloodPressureSys: 114, bloodPressureDia: 72, weightKg: 50, pulseRate: 72, recordedAt: '2026-08-15' },
        category: 'teenager',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Krishnan Menon', relationship: 'Father', phone: '+919447012345' },
        recentActivity: 'School sports player; Td vaccine due in October',
        hasCareGap: true,
        careGapDetails: {
          type: 'vaccination_overdue',
          title: 'Upcoming Td Booster at 16 Years',
          description: 'Scheduled for school immunization drive in October 2026.'
        }
      },
      {
        patientId: 'P-1025',
        familyId: 'FAM-05',
        name: 'Ananya Menon',
        age: 9,
        gender: 'Female',
        dateOfBirth: '2017-02-10',
        relationship: 'Daughter (Child)',
        preferredLanguage: 'ml',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal development'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [{ id: 'V-505', name: 'DPT Booster 2 (at 5 yrs)', status: 'Given', dueDate: '2022-02-15', givenDate: '2022-02-18' }],
        recentVitals: { weightKg: 27, pulseRate: 80, recordedAt: '2026-08-10' },
        category: 'child',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Krishnan Menon', relationship: 'Father', phone: '+919447012345' },
        recentActivity: 'All primary vaccines completed',
        hasCareGap: false
      }
    ]
  },
  {
    familyId: 'FAM-06',
    familyName: 'Reddy Household',
    village: 'Anantapur Border Cluster',
    houseNumber: 'Door #55, Old Canal Road',
    primaryContact: 'Venkat Reddy',
    phoneNumber: '+919449876543',
    preferredLanguage: 'te',
    numberOfMembers: 5,
    emergencyContact: '+919449876544',
    familyHealthScore: 72,
    activeConditions: ['Chronic Kidney Disease Stage 2', 'Hypertension', 'Elderly Fall Risk'],
    activeMedicines: 4,
    vaccinationStatus: 'Up to Date',
    upcomingAppointments: 1,
    missedMedicines: 1,
    careGaps: 2,
    lastHealthUpdate: '2026-09-22',
    members: [
      {
        patientId: 'P-1026',
        familyId: 'FAM-06',
        name: 'Subbamma Reddy',
        age: 76,
        gender: 'Female',
        dateOfBirth: '1950-12-05',
        relationship: 'Grandmother (Elderly)',
        preferredLanguage: 'te',
        bloodGroup: 'B+',
        allergies: ['NSAIDs (causes kidney stress)'],
        medicalHistory: ['Hypertension for 20 years', 'Mild CKD'],
        currentConditions: ['Hypertension', 'Chronic Kidney Disease Stage 2', 'High Fall Risk'],
        currentMedicines: [
          { id: 'M-601', name: 'Amlodipine 5mg', dosage: '5mg daily', frequency: 'Morning', status: 'Active', missedCount: 0, instructions: 'Avoid painkiller tablets' },
          { id: 'M-602', name: 'Calcium Acetate 667mg', dosage: '667mg with meals', frequency: 'Twice daily', status: 'Missed Dosage', missedCount: 2, instructions: 'Phosphate binder, take with meals' }
        ],
        vaccinations: [{ id: 'V-601', name: 'COVID Precautionary Dose', status: 'Given', dueDate: '2024-01-10', givenDate: '2024-01-10' }],
        recentVitals: { bloodPressureSys: 138, bloodPressureDia: 82, weightKg: 48, pulseRate: 68, recordedAt: '2026-09-20' },
        category: 'elderly',
        medicalReports: [{ id: 'R-601', title: 'Serum Creatinine & Electrolytes', date: '2026-09-18', summary: 'Creatinine 1.5 mg/dL (eGFR 48 mL/min). Stable stage 2 CKD.' }],
        doctorConsultations: [{ id: 'C-601', doctorName: 'Dr. Anandhi Raman', specialty: 'Geriatric Care', date: '2026-08-28', notes: 'Keep bathroom well-lit to prevent falls. Strictly avoid counter NSAIDs.' }],
        appointments: [{ id: 'A-601', doctorName: 'Dr. Anandhi Raman', specialty: 'Geriatric Care', date: '2026-10-10', status: 'scheduled', reason: 'Renal function and fall risk review' }],
        emergencyContact: { name: 'Venkat Reddy', relationship: 'Son', phone: '+919449876543' },
        recentActivity: 'Creatinine tested at CHC; advised adequate filtered water',
        hasCareGap: true,
        careGapDetails: {
          type: 'elderly_followup',
          title: 'Elderly Fall Risk & Nephrology Review',
          description: 'High fall score with moderate CKD. Requires grab bars and medication adherence.'
        }
      },
      {
        patientId: 'P-1027',
        familyId: 'FAM-06',
        name: 'Venkat Reddy',
        age: 48,
        gender: 'Male',
        dateOfBirth: '1978-04-18',
        relationship: 'Head of Family',
        preferredLanguage: 'te',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: ['Pre-diabetes Screening'],
        currentMedicines: [],
        vaccinations: [{ id: 'V-602', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2025-04-12', givenDate: '2025-04-12' }],
        recentVitals: { bloodPressureSys: 126, bloodPressureDia: 82, bloodSugarFasting: 108, weightKg: 74, pulseRate: 74, recordedAt: '2026-09-15' },
        category: 'adult',
        medicalReports: [{ id: 'R-602', title: 'Fasting Sugar Screen', date: '2026-09-15', summary: 'Fasting 108 mg/dL (Impaired fasting glucose). Advised diet modifications.' }],
        doctorConsultations: [{ id: 'C-602', doctorName: 'Dr. Suresh Gowda', specialty: 'Diabetologist', date: '2026-09-15', notes: 'Cut down polished white rice; switch to brown rice or ragi.' }],
        appointments: [],
        emergencyContact: { name: 'Saraswathi Reddy', relationship: 'Wife', phone: '+919449876543' },
        recentActivity: 'Adopting millets and brisk walking to prevent diabetes onset',
        hasCareGap: false
      },
      {
        patientId: 'P-1028',
        familyId: 'FAM-06',
        name: 'Saraswathi Reddy',
        age: 42,
        gender: 'Female',
        dateOfBirth: '1984-08-11',
        relationship: 'Wife',
        preferredLanguage: 'te',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: ['Mild Hypothyroidism'],
        currentMedicines: [
          { id: 'M-603', name: 'Levothyroxine 25mcg', dosage: '25mcg once daily', frequency: 'Empty stomach morning', status: 'Active', missedCount: 0, instructions: 'Take 45 mins before tea or food' }
        ],
        vaccinations: [{ id: 'V-603', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2024-05-18', givenDate: '2024-05-18' }],
        recentVitals: { bloodPressureSys: 118, bloodPressureDia: 76, weightKg: 61, pulseRate: 70, recordedAt: '2026-09-10' },
        category: 'adult',
        medicalReports: [{ id: 'R-603', title: 'TSH Test Report', date: '2026-09-10', summary: 'TSH 3.2 mIU/L (Euthyroid on 25mcg dose).' }],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Venkat Reddy', relationship: 'Husband', phone: '+919449876543' },
        recentActivity: 'TSH normalized on low-dose thyroxine',
        hasCareGap: false
      },
      {
        patientId: 'P-1029',
        familyId: 'FAM-06',
        name: 'Harika Reddy',
        age: 18,
        gender: 'Female',
        dateOfBirth: '2008-02-14',
        relationship: 'Daughter (Young Adult / Student)',
        preferredLanguage: 'te',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [{ id: 'V-604', name: 'Td at 16 years', status: 'Given', dueDate: '2024-02-14', givenDate: '2024-02-20' }],
        recentVitals: { bloodPressureSys: 110, bloodPressureDia: 70, weightKg: 49, pulseRate: 76, recordedAt: '2026-08-20' },
        category: 'adult',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Venkat Reddy', relationship: 'Father', phone: '+919449876543' },
        recentActivity: 'Attending college; all vaccines current',
        hasCareGap: false
      },
      {
        patientId: 'P-1030',
        familyId: 'FAM-06',
        name: 'Praneeth Reddy',
        age: 12,
        gender: 'Male',
        dateOfBirth: '2014-06-25',
        relationship: 'Son (Child)',
        preferredLanguage: 'te',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [{ id: 'V-605', name: 'Td at 10 years', status: 'Given', dueDate: '2024-06-25', givenDate: '2024-07-02' }],
        recentVitals: { weightKg: 36, pulseRate: 78, recordedAt: '2026-08-10' },
        category: 'child',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Venkat Reddy', relationship: 'Father', phone: '+919449876543' },
        recentActivity: 'Completed school sports fitness check',
        hasCareGap: false
      }
    ]
  },
  {
    familyId: 'FAM-07',
    familyName: 'Bhat Household',
    village: 'Coastal Malnad Cluster',
    houseNumber: 'Door #12, Coconut Grove Lane',
    primaryContact: 'Ganapathi Bhat',
    phoneNumber: '+919448765432',
    preferredLanguage: 'kn',
    numberOfMembers: 4,
    emergencyContact: '+919448765433',
    familyHealthScore: 86,
    activeConditions: ['Mild Hypertension'],
    activeMedicines: 2,
    vaccinationStatus: 'Up to Date',
    upcomingAppointments: 1,
    missedMedicines: 0,
    careGaps: 0,
    lastHealthUpdate: '2026-09-22',
    members: [
      {
        patientId: 'P-1031',
        familyId: 'FAM-07',
        name: 'Ganapathi Bhat',
        age: 54,
        gender: 'Male',
        dateOfBirth: '1972-03-12',
        relationship: 'Head of Family',
        preferredLanguage: 'kn',
        bloodGroup: 'A+',
        allergies: [],
        medicalHistory: ['Hypertension 4 years'],
        currentConditions: ['Hypertension'],
        currentMedicines: [
          { id: 'M-701', name: 'Amlodipine 5mg', dosage: '5mg once daily', frequency: 'Morning', status: 'Active', missedCount: 0, instructions: 'Post breakfast' }
        ],
        vaccinations: [{ id: 'V-701', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2025-01-20', givenDate: '2025-01-20' }],
        recentVitals: { bloodPressureSys: 128, bloodPressureDia: 80, weightKg: 69, pulseRate: 72, recordedAt: '2026-09-20' },
        category: 'adult',
        medicalReports: [{ id: 'R-701', title: 'Annual NCD Health Card', date: '2026-09-20', summary: 'BP well managed. ECG normal.' }],
        doctorConsultations: [{ id: 'C-701', doctorName: 'Dr. Harish Patil', specialty: 'Cardiologist', date: '2026-08-10', notes: 'Cardiovascular risk low. Maintain active lifestyle.' }],
        appointments: [{ id: 'A-701', doctorName: 'Dr. Harish Patil', specialty: 'Cardiologist', date: '2026-11-15', status: 'scheduled', reason: 'Routine 3-month heart check' }],
        emergencyContact: { name: 'Sharada Bhat', relationship: 'Wife', phone: '+919448765432' },
        recentActivity: 'BP 128/80; regular betel nut garden walking',
        hasCareGap: false
      },
      {
        patientId: 'P-1032',
        familyId: 'FAM-07',
        name: 'Sharada Bhat',
        age: 49,
        gender: 'Female',
        dateOfBirth: '1977-09-18',
        relationship: 'Wife',
        preferredLanguage: 'kn',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [
          { id: 'M-702', name: 'Calcium Carbonate', dosage: '500mg daily', frequency: 'Night', status: 'Active', missedCount: 0, instructions: 'Take with water' }
        ],
        vaccinations: [{ id: 'V-702', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2024-09-18', givenDate: '2024-09-18' }],
        recentVitals: { bloodPressureSys: 116, bloodPressureDia: 74, weightKg: 58, pulseRate: 70, recordedAt: '2026-09-15' },
        category: 'adult',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Ganapathi Bhat', relationship: 'Husband', phone: '+919448765432' },
        recentActivity: 'Annual health screening completed at PHC',
        hasCareGap: false
      },
      {
        patientId: 'P-1033',
        familyId: 'FAM-07',
        name: 'Prashanth Bhat',
        age: 22,
        gender: 'Male',
        dateOfBirth: '2004-05-14',
        relationship: 'Son (Adult / Agronomist)',
        preferredLanguage: 'kn',
        bloodGroup: 'A+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [{ id: 'V-703', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2025-06-10', givenDate: '2025-06-10' }],
        recentVitals: { bloodPressureSys: 118, bloodPressureDia: 76, weightKg: 65, pulseRate: 68, recordedAt: '2026-08-20' },
        category: 'adult',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Ganapathi Bhat', relationship: 'Father', phone: '+919448765432' },
        recentActivity: 'Healthy young adult; active agricultural work',
        hasCareGap: false
      },
      {
        patientId: 'P-1034',
        familyId: 'FAM-07',
        name: 'Shwetha Bhat',
        age: 17,
        gender: 'Female',
        dateOfBirth: '2009-11-28',
        relationship: 'Daughter (Teenager)',
        preferredLanguage: 'kn',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [{ id: 'V-704', name: 'Td at 16 years', status: 'Given', dueDate: '2025-11-28', givenDate: '2025-12-04' }],
        recentVitals: { bloodPressureSys: 110, bloodPressureDia: 68, weightKg: 47, pulseRate: 72, recordedAt: '2026-08-15' },
        category: 'teenager',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Ganapathi Bhat', relationship: 'Father', phone: '+919448765432' },
        recentActivity: 'All adolescent health vaccines completed',
        hasCareGap: false
      }
    ]
  },
  {
    familyId: 'FAM-08',
    familyName: 'Mandal Household',
    village: 'North Bihar Rural Pargana',
    houseNumber: 'House #9, River Embankment Road',
    primaryContact: 'Subhash Mandal',
    phoneNumber: '+919835012345',
    preferredLanguage: 'hi',
    numberOfMembers: 5,
    emergencyContact: '+919835012346',
    familyHealthScore: 70,
    activeConditions: ['Post-Kala-azar Surveillance', 'Pediatric Diarrhea Vulnerability'],
    activeMedicines: 2,
    vaccinationStatus: 'Action Needed',
    upcomingAppointments: 1,
    missedMedicines: 1,
    careGaps: 2,
    lastHealthUpdate: '2026-09-20',
    members: [
      {
        patientId: 'P-1035',
        familyId: 'FAM-08',
        name: 'Subhash Mandal',
        age: 41,
        gender: 'Male',
        dateOfBirth: '1985-07-10',
        relationship: 'Head of Family',
        preferredLanguage: 'hi',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Past treated Visceral Leishmaniasis (Kala-azar) 4 years ago'],
        currentConditions: ['Post-Kala-azar Surveillance'],
        currentMedicines: [],
        vaccinations: [{ id: 'V-801', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2025-03-12', givenDate: '2025-03-12' }],
        recentVitals: { bloodPressureSys: 122, bloodPressureDia: 78, weightKg: 60, pulseRate: 74, recordedAt: '2026-09-10' },
        category: 'adult',
        medicalReports: [{ id: 'R-801', title: 'Post-Kala Azar Dermal Surveillance', date: '2026-09-10', summary: 'No dermal lesions. Spleen not palpable. Cured completely.' }],
        doctorConsultations: [{ id: 'C-801', doctorName: 'Dr. Arun Kumar', specialty: 'General Physician', date: '2026-09-10', notes: 'Surveillance clear. Advised bed net use.' }],
        appointments: [],
        emergencyContact: { name: 'Geeta Mandal', relationship: 'Wife', phone: '+919835012345' },
        recentActivity: 'Using long-lasting insecticidal mosquito nets',
        hasCareGap: false
      },
      {
        patientId: 'P-1036',
        familyId: 'FAM-08',
        name: 'Geeta Mandal',
        age: 36,
        gender: 'Female',
        dateOfBirth: '1990-02-18',
        relationship: 'Wife',
        preferredLanguage: 'hi',
        bloodGroup: 'A+',
        allergies: [],
        medicalHistory: ['Anemia in third pregnancy'],
        currentConditions: ['Iron Deficiency Anemia'],
        currentMedicines: [
          { id: 'M-801', name: 'Iron Folic Acid (IFA)', dosage: '100mg iron daily', frequency: 'Night', status: 'Missed Dosage', missedCount: 2, instructions: 'Take with lemon water after food' }
        ],
        vaccinations: [{ id: 'V-802', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2024-02-18', givenDate: '2024-02-18' }],
        recentVitals: { bloodPressureSys: 110, bloodPressureDia: 72, weightKg: 49, pulseRate: 78, recordedAt: '2026-09-12' },
        category: 'adult',
        medicalReports: [{ id: 'R-802', title: 'Hemoglobin Check', date: '2026-09-12', summary: 'Hb 9.8 g/dL (Moderate Anemia). Needs consistent iron.' }],
        doctorConsultations: [{ id: 'C-802', doctorName: 'Dr. Geetha Swamy', specialty: 'Nutritionist', date: '2026-09-12', notes: 'Counselled on jaggery, chana and green leafy vegetables.' }],
        appointments: [{ id: 'A-801', doctorName: 'Dr. Geetha Swamy', specialty: 'Nutritionist', date: '2026-10-14', status: 'scheduled', reason: 'Hb recheck after 4 weeks of iron' }],
        emergencyContact: { name: 'Subhash Mandal', relationship: 'Husband', phone: '+919835012345' },
        recentActivity: 'Missed 2 IFA doses; reminded by ASHA worker',
        hasCareGap: true,
        careGapDetails: {
          type: 'missed_medicine',
          title: 'Missed Iron Folic Acid Supplement',
          description: 'Hb is 9.8 g/dL. Daily IFA adherence is critical for anemia recovery.'
        }
      },
      {
        patientId: 'P-1037',
        familyId: 'FAM-08',
        name: 'Gopal Mandal',
        age: 72,
        gender: 'Male',
        dateOfBirth: '1954-04-14',
        relationship: 'Father (Elderly)',
        preferredLanguage: 'hi',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Chronic joint pain'],
        currentConditions: ['Bilateral Knee Osteoarthritis'],
        currentMedicines: [
          { id: 'M-802', name: 'Paracetamol 650mg SOS', dosage: '650mg as needed for severe joint pain', frequency: 'PRN', status: 'Active', missedCount: 0, instructions: 'Do not exceed 3 tablets in 24 hours' }
        ],
        vaccinations: [{ id: 'V-803', name: 'COVID Precautionary Dose', status: 'Given', dueDate: '2024-04-10', givenDate: '2024-04-10' }],
        recentVitals: { bloodPressureSys: 132, bloodPressureDia: 80, weightKg: 54, pulseRate: 70, recordedAt: '2026-09-10' },
        category: 'elderly',
        medicalReports: [],
        doctorConsultations: [{ id: 'C-803', doctorName: 'Dr. Anandhi Raman', specialty: 'Geriatric Care', date: '2026-08-12', notes: 'Advised walking stick for balance and warm compresses on knees.' }],
        appointments: [],
        emergencyContact: { name: 'Subhash Mandal', relationship: 'Son', phone: '+919835012345' },
        recentActivity: 'Using walking stick for village strolls',
        hasCareGap: false
      },
      {
        patientId: 'P-1038',
        familyId: 'FAM-08',
        name: 'Chandan Mandal',
        age: 8,
        gender: 'Male',
        dateOfBirth: '2018-08-20',
        relationship: 'Son (Child)',
        preferredLanguage: 'hi',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal development'],
        currentConditions: ['Seasonal Diarrhea Surveillance'],
        currentMedicines: [],
        vaccinations: [
          { id: 'V-804', name: 'DPT Booster 2 (at 5 yrs)', status: 'Overdue', dueDate: '2023-08-25' }
        ],
        recentVitals: { weightKg: 22, pulseRate: 84, recordedAt: '2026-09-15' },
        category: 'child',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Subhash Mandal', relationship: 'Father', phone: '+919835012345' },
        recentActivity: 'Needs DPT booster 2 catch-up at primary school camp',
        hasCareGap: true,
        careGapDetails: {
          type: 'vaccination_overdue',
          title: 'DPT Booster 2 Catch-up Needed',
          description: 'Child missed 5-year DPT booster dose. Needs catch-up at village immunization session.'
        }
      },
      {
        patientId: 'P-1039',
        familyId: 'FAM-08',
        name: 'Rani Mandal',
        age: 4,
        gender: 'Female',
        dateOfBirth: '2022-03-10',
        relationship: 'Daughter (Child)',
        preferredLanguage: 'hi',
        bloodGroup: 'A+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [{ id: 'V-805', name: 'MR 2nd Dose + DPT Booster 1', status: 'Given', dueDate: '2023-09-15', givenDate: '2023-09-20' }],
        recentVitals: { weightKg: 14.8, pulseRate: 90, recordedAt: '2026-08-10' },
        category: 'child',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Subhash Mandal', relationship: 'Father', phone: '+919835012345' },
        recentActivity: 'All age-appropriate vaccines up to date',
        hasCareGap: false
      }
    ]
  },
  {
    familyId: 'FAM-09',
    familyName: 'Selvam Household',
    village: 'Theni Foothill Settlement',
    houseNumber: 'Door #30, Canal Bank Hamlet',
    primaryContact: 'Muthu Selvam',
    phoneNumber: '+919842112233',
    preferredLanguage: 'ta',
    numberOfMembers: 5,
    emergencyContact: '+919842112234',
    familyHealthScore: 79,
    activeConditions: ['Type 2 Diabetes', 'Pediatric Asthma'],
    activeMedicines: 3,
    vaccinationStatus: 'Up to Date',
    upcomingAppointments: 1,
    missedMedicines: 0,
    careGaps: 1,
    lastHealthUpdate: '2026-09-23',
    members: [
      {
        patientId: 'P-1040',
        familyId: 'FAM-09',
        name: 'Muthu Selvam',
        age: 49,
        gender: 'Male',
        dateOfBirth: '1977-05-16',
        relationship: 'Head of Family',
        preferredLanguage: 'ta',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Type 2 Diabetes for 5 years'],
        currentConditions: ['Type 2 Diabetes'],
        currentMedicines: [
          { id: 'M-901', name: 'Metformin 500mg', dosage: '500mg twice daily', frequency: 'With meals', status: 'Active', missedCount: 0, instructions: 'Take with breakfast and dinner' }
        ],
        vaccinations: [{ id: 'V-901', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2025-04-10', givenDate: '2025-04-10' }],
        recentVitals: { bloodPressureSys: 126, bloodPressureDia: 80, bloodSugarFasting: 132, weightKg: 68, pulseRate: 72, recordedAt: '2026-09-21' },
        category: 'adult',
        medicalReports: [{ id: 'R-901', title: 'Fasting Sugar Log', date: '2026-09-21', summary: 'Fasting sugar 132 mg/dL. Good compliance with morning and evening metformin.' }],
        doctorConsultations: [{ id: 'C-901', doctorName: 'Dr. Suresh Gowda', specialty: 'Diabetologist', date: '2026-08-20', notes: 'Maintain 30 mins daily walking. Check feet for cracks or ulcers.' }],
        appointments: [{ id: 'A-901', doctorName: 'Dr. Suresh Gowda', specialty: 'Diabetologist', date: '2026-10-22', status: 'scheduled', reason: 'HbA1c 3-month review' }],
        emergencyContact: { name: 'Kasthuri Selvam', relationship: 'Wife', phone: '+919842112233' },
        recentActivity: 'Sugar stable at 132; walking daily in the mornings',
        hasCareGap: false
      },
      {
        patientId: 'P-1041',
        familyId: 'FAM-09',
        name: 'Kasthuri Selvam',
        age: 43,
        gender: 'Female',
        dateOfBirth: '1983-08-24',
        relationship: 'Wife',
        preferredLanguage: 'ta',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [{ id: 'V-902', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2024-08-10', givenDate: '2024-08-10' }],
        recentVitals: { bloodPressureSys: 116, bloodPressureDia: 74, weightKg: 59, pulseRate: 70, recordedAt: '2026-09-15' },
        category: 'adult',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Muthu Selvam', relationship: 'Husband', phone: '+919448112233' },
        recentActivity: 'Family caregiver coordinating member appointments',
        hasCareGap: false
      },
      {
        patientId: 'P-1042',
        familyId: 'FAM-09',
        name: 'Maragatham Ammal',
        age: 70,
        gender: 'Female',
        dateOfBirth: '1956-02-11',
        relationship: 'Mother (Elderly)',
        preferredLanguage: 'ta',
        bloodGroup: 'B+',
        allergies: [],
        medicalHistory: ['Hypertension'],
        currentConditions: ['Hypertension'],
        currentMedicines: [
          { id: 'M-902', name: 'Amlodipine 5mg', dosage: '5mg once daily', frequency: 'Morning', status: 'Active', missedCount: 0, instructions: 'Take every morning with water' }
        ],
        vaccinations: [{ id: 'V-903', name: 'COVID Precautionary Dose', status: 'Given', dueDate: '2024-03-15', givenDate: '2024-03-15' }],
        recentVitals: { bloodPressureSys: 132, bloodPressureDia: 82, weightKg: 53, pulseRate: 70, recordedAt: '2026-09-20' },
        category: 'elderly',
        medicalReports: [{ id: 'R-902', title: 'Monthly Senior BP Check', date: '2026-09-20', summary: 'BP 132/82 mmHg. Normal heart sounds.' }],
        doctorConsultations: [{ id: 'C-902', doctorName: 'Dr. Arun Kumar', specialty: 'General Physician', date: '2026-08-15', notes: 'Maintain current medicine and low salt diet.' }],
        appointments: [],
        emergencyContact: { name: 'Muthu Selvam', relationship: 'Son', phone: '+919842112233' },
        recentActivity: 'BP checked at home by village ASHA worker',
        hasCareGap: false
      },
      {
        patientId: 'P-1043',
        familyId: 'FAM-09',
        name: 'Saravanan Selvam',
        age: 10,
        gender: 'Male',
        dateOfBirth: '2016-04-15',
        relationship: 'Son (Child)',
        preferredLanguage: 'ta',
        bloodGroup: 'A+',
        allergies: ['Pollen'],
        medicalHistory: ['Mild seasonal allergic cough'],
        currentConditions: ['Allergic Cough'],
        currentMedicines: [
          { id: 'M-903', name: 'Cetirizine 5mg', dosage: '5mg as needed', frequency: 'Night PRN', status: 'Active', missedCount: 0, instructions: 'Take only when allergic symptoms or runny nose appears' }
        ],
        vaccinations: [
          { id: 'V-904', name: 'Td at 10 years', status: 'Due', dueDate: '2026-09-30' }
        ],
        recentVitals: { weightKg: 30, pulseRate: 82, recordedAt: '2026-09-10' },
        category: 'child',
        medicalReports: [],
        doctorConsultations: [{ id: 'C-903', doctorName: 'Dr. Meera Nair', specialty: 'Pediatrician', date: '2026-08-10', notes: 'Clear chest sounds. Schedule 10-year Td vaccine.' }],
        appointments: [],
        emergencyContact: { name: 'Muthu Selvam', relationship: 'Father', phone: '+919842112233' },
        recentActivity: '10-year Td vaccine scheduled for village school camp',
        hasCareGap: true,
        careGapDetails: {
          type: 'vaccination_overdue',
          title: 'Td Vaccine at 10 Years Due',
          description: 'Child turned 10; Td vaccine is due this month at the local school session.'
        }
      },
      {
        patientId: 'P-1044',
        familyId: 'FAM-09',
        name: 'Kavitha Selvam',
        age: 16,
        gender: 'Female',
        dateOfBirth: '2010-09-02',
        relationship: 'Daughter (Teenager)',
        preferredLanguage: 'ta',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [{ id: 'V-905', name: 'Td at 16 years', status: 'Given', dueDate: '2026-09-02', givenDate: '2026-09-08' }],
        recentVitals: { bloodPressureSys: 112, bloodPressureDia: 70, weightKg: 46, pulseRate: 74, recordedAt: '2026-09-08' },
        category: 'teenager',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Muthu Selvam', relationship: 'Father', phone: '+919842112233' },
        recentActivity: 'Received Td 16-year booster vaccine on Sep 8',
        hasCareGap: false
      }
    ]
  },
  {
    familyId: 'FAM-10',
    familyName: 'Chacko Household',
    village: 'Idukki Highland Plantation',
    houseNumber: 'Bungalow 4, Tea Estate Division 3',
    primaryContact: 'Thomas Chacko',
    phoneNumber: '+919446554433',
    preferredLanguage: 'ml',
    numberOfMembers: 4,
    emergencyContact: '+919446554434',
    familyHealthScore: 88,
    activeConditions: ['Stable Hypertension'],
    activeMedicines: 2,
    vaccinationStatus: 'Up to Date',
    upcomingAppointments: 1,
    missedMedicines: 0,
    careGaps: 0,
    lastHealthUpdate: '2026-09-22',
    members: [
      {
        patientId: 'P-1045',
        familyId: 'FAM-10',
        name: 'Thomas Chacko',
        age: 52,
        gender: 'Male',
        dateOfBirth: '1974-06-18',
        relationship: 'Head of Family',
        preferredLanguage: 'ml',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Hypertension 6 years'],
        currentConditions: ['Hypertension'],
        currentMedicines: [
          { id: 'M-1001', name: 'Telmisartan 40mg', dosage: '40mg once daily', frequency: 'Morning', status: 'Active', missedCount: 0, instructions: 'Post breakfast' }
        ],
        vaccinations: [{ id: 'V-1001', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2025-05-10', givenDate: '2025-05-10' }],
        recentVitals: { bloodPressureSys: 124, bloodPressureDia: 78, weightKg: 73, pulseRate: 68, recordedAt: '2026-09-20' },
        category: 'adult',
        medicalReports: [{ id: 'R-1001', title: 'Cardiology Review', date: '2026-09-20', summary: 'BP 124/78 mmHg. Excellent compliance.' }],
        doctorConsultations: [{ id: 'C-1001', doctorName: 'Dr. Harish Patil', specialty: 'Cardiologist', date: '2026-08-15', notes: 'Maintain low salt intake and regular hiking.' }],
        appointments: [{ id: 'A-1001', doctorName: 'Dr. Harish Patil', specialty: 'Cardiologist', date: '2026-11-20', status: 'scheduled', reason: 'Routine 3-month review' }],
        emergencyContact: { name: 'Mary Chacko', relationship: 'Wife', phone: '+919446554433' },
        recentActivity: 'BP 124/78; estate superintendent work active',
        hasCareGap: false
      },
      {
        patientId: 'P-1046',
        familyId: 'FAM-10',
        name: 'Mary Chacko',
        age: 48,
        gender: 'Female',
        dateOfBirth: '1978-10-04',
        relationship: 'Wife',
        preferredLanguage: 'ml',
        bloodGroup: 'A+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [
          { id: 'M-1002', name: 'Vitamin D3 & Calcium', dosage: '1 tablet daily', frequency: 'Night', status: 'Active', missedCount: 0, instructions: 'Take with water' }
        ],
        vaccinations: [{ id: 'V-1002', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2024-10-04', givenDate: '2024-10-04' }],
        recentVitals: { bloodPressureSys: 114, bloodPressureDia: 72, weightKg: 57, pulseRate: 72, recordedAt: '2026-09-18' },
        category: 'adult',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Thomas Chacko', relationship: 'Husband', phone: '+919446554433' },
        recentActivity: 'Active community nutrition volunteer',
        hasCareGap: false
      },
      {
        patientId: 'P-1047',
        familyId: 'FAM-10',
        name: 'George Chacko',
        age: 21,
        gender: 'Male',
        dateOfBirth: '2005-01-14',
        relationship: 'Son (Adult / Student)',
        preferredLanguage: 'ml',
        bloodGroup: 'O+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [{ id: 'V-1003', name: 'Tetanus Toxoid', status: 'Given', dueDate: '2025-08-10', givenDate: '2025-08-10' }],
        recentVitals: { bloodPressureSys: 116, bloodPressureDia: 74, weightKg: 68, pulseRate: 66, recordedAt: '2026-08-20' },
        category: 'adult',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Thomas Chacko', relationship: 'Father', phone: '+919446554433' },
        recentActivity: 'College sports football team member; healthy',
        hasCareGap: false
      },
      {
        patientId: 'P-1048',
        familyId: 'FAM-10',
        name: 'Riya Chacko',
        age: 15,
        gender: 'Female',
        dateOfBirth: '2011-03-29',
        relationship: 'Daughter (Teenager)',
        preferredLanguage: 'ml',
        bloodGroup: 'A+',
        allergies: [],
        medicalHistory: ['Normal'],
        currentConditions: [],
        currentMedicines: [],
        vaccinations: [
          { id: 'V-1004', name: 'Td at 16 years', status: 'Due', dueDate: '2027-03-29' }
        ],
        recentVitals: { bloodPressureSys: 110, bloodPressureDia: 68, weightKg: 46, pulseRate: 74, recordedAt: '2026-08-15' },
        category: 'teenager',
        medicalReports: [],
        doctorConsultations: [],
        appointments: [],
        emergencyContact: { name: 'Thomas Chacko', relationship: 'Father', phone: '+919446554433' },
        recentActivity: 'All school health vaccinations current',
        hasCareGap: false
      }
    ]
  }
];

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Village,
  VillageFamily,
  PatientProfile,
  UserRole,
  AuthSession,
  NetworkStatus,
  PendingSyncItem,
  VitalMeasurement,
  Medication,
  Referral,
  ReferralStatus,
  CareGap,
  FamilyMember,
  ClinicalNote,
  Specialization,
  LabTest,
  PreventiveAction,
  DoctorAvailabilityStatus,
  AuditLogItem,
} from '../types';
import { MOCK_REFERRALS } from '../data/mockData';

// Structured LocalStorage Keys
const STORAGE_KEYS = {
  VILLAGE: 'medora_village_v2',
  FAMILIES: 'medora_families_v2',
  PATIENTS: 'medora_patients_v2',
  AUTH: 'medora_auth_v2',
  SYNC: 'medora_pending_sync_v2',
  NETWORK: 'medora_network_status_v2',
  ADMIN_PASSWORD: 'medora_admin_password_v2',
  AUDIT_LOGS: 'medora_audit_logs_v2',
  DOCTOR_STATUS: 'medora_doctor_status_v2',
};

export const DEFAULT_ADMIN_PASSWORD = 'MedoraAdmin@2026';

// Initial Seed Data: Village
const INITIAL_VILLAGE: Village = {
  villageId: 'VIL-01',
  name: 'Rampur Gram Panchayat',
  subDistrict: 'Mandya Taluk',
  district: 'Mandya District',
  state: 'Karnataka',
  population: 9,
  phcName: 'Rampur Primary Health Centre (PHC)',
  ashaWorker: 'Sister Lakshmi Devi (ASHA #4402)',
  anmWorker: 'Sister Kavitha Kumari (ANM #1109)',
  emergencyContacts: [
    { service: 'Rural Ambulance Dispatch', number: '108' },
    { service: 'National Emergency Helpline', number: '112' },
    { service: 'Janani Shishu (Maternal) Transport', number: '102' },
    { service: 'Rampur PHC Emergency Duty Desk', number: '+91 82322 41108' },
  ],
};

// Initial Seed Data: Families
const INITIAL_FAMILIES: VillageFamily[] = [
  {
    familyId: 'FAM-01',
    villageId: 'VIL-01',
    familyName: 'Kumar Household',
    headOfFamily: 'Ramesh Kumar',
    rationCardNumber: 'RC-KA-991204',
    rationCardType: 'BPL (Antyodaya)',
    address: 'House #24, Near Gram Panchayat Office, Rampur Village',
    primaryPhone: '+91 94481 00223',
    memberIds: ['P-1001', 'P-1002', 'P-1003', 'P-1004'],
    createdAt: '2026-01-10',
  },
  {
    familyId: 'FAM-02',
    villageId: 'VIL-01',
    familyName: 'Gowda Household',
    headOfFamily: 'Basavanna Gowda',
    rationCardNumber: 'RC-KA-772189',
    rationCardType: 'BPL (Priority)',
    address: 'Farm Quarters, Sector 2, Rampur Village',
    primaryPhone: '+91 94482 11334',
    memberIds: ['P-1005', 'P-1006', 'P-1007', 'P-1011'],
    createdAt: '2026-02-15',
  },
  {
    familyId: 'FAM-03',
    villageId: 'VIL-01',
    familyName: 'Naik Household',
    headOfFamily: 'Suresh Naik',
    rationCardNumber: 'RC-KA-883312',
    rationCardType: 'APL',
    address: 'Temple Street, North Rampur Block',
    primaryPhone: '+91 94483 22445',
    memberIds: ['P-1008', 'P-1009', 'P-1010'],
    createdAt: '2026-03-01',
  },
];

// Initial Seed Data: Patients (Strictly Keyed by patientId, familyId, villageId)
const INITIAL_PATIENTS: PatientProfile[] = [
  // Family 1: Kumar Household
  {
    patientId: 'P-1001',
    familyId: 'FAM-01',
    villageId: 'VIL-01',
    name: 'Ramesh Kumar',
    age: 68,
    gender: 'Male',
    category: 'elderly',
    relationship: 'Grandfather / Senior',
    healthId: 'ABHA-9812-4412-8871',
    bloodGroup: 'B Positive (B+)',
    allergies: ['Penicillin (Moderate rash)', 'Dust/Pollen'],
    chronicConditions: ['Hypertension (Stage 2)', 'Bilateral Knee Osteoarthritis', 'Age-Related Presbyopia'],
    primaryCategory: 'Geriatric Care',
    avatarBg: 'bg-amber-100 text-amber-800',
    hasCareGap: true,
    vitals: [
      { date: '2026-09-09', bloodPressureSys: 158, bloodPressureDia: 96, bloodSugarFasting: 118, bloodSugarPostPrandial: 148, pulseRate: 76, weightKg: 66, bmi: 23.4, spo2: 98 },
      { date: '2026-09-02', bloodPressureSys: 152, bloodPressureDia: 94, bloodSugarFasting: 116, bloodSugarPostPrandial: 146, pulseRate: 78, weightKg: 66.2, bmi: 23.4, spo2: 98 },
      { date: '2026-08-26', bloodPressureSys: 144, bloodPressureDia: 89, bloodSugarFasting: 112, bloodSugarPostPrandial: 142, pulseRate: 73, weightKg: 66.5, bmi: 23.5, spo2: 97 },
      { date: '2026-08-18', bloodPressureSys: 146, bloodPressureDia: 90, bloodSugarFasting: 114, bloodSugarPostPrandial: 144, pulseRate: 74, weightKg: 66.8, bmi: 23.6, spo2: 98 },
      { date: '2026-08-10', bloodPressureSys: 142, bloodPressureDia: 88, bloodSugarFasting: 110, bloodSugarPostPrandial: 140, pulseRate: 72, weightKg: 67, bmi: 23.7, spo2: 98 },
    ],
    medicines: [
      { id: 'med-1', name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily (Morning 08:00 AM)', purpose: 'Blood Pressure regulation', adherenceRate: 85, status: 'Active', instructions: 'Take with warm water after morning meal' },
      { id: 'med-2', name: 'Telmisartan 40mg', dosage: '1 tablet', frequency: 'Once daily (Evening 07:00 PM)', purpose: 'Vascular protection & BP control', adherenceRate: 72, status: 'Missed Dosage', instructions: 'Take consistently at 7:00 PM before dinner' },
      { id: 'med-3', name: 'Calcium + Vitamin D3 500mg', dosage: '1 tablet', frequency: 'Once daily (Afternoon)', purpose: 'Bone strength for osteoarthritis', adherenceRate: 90, status: 'Active', instructions: 'Post lunch' },
    ],
    labTests: [
      { id: 'test-1', testName: 'Serum Creatinine & eGFR', date: '2026-08-15', result: '1.1 mg/dL (eGFR: 74 mL/min)', normalRange: '0.7 - 1.2 mg/dL', status: 'Normal', trend: 'Stable', hospitalOrLab: 'District Civil Hospital Lab' },
      { id: 'test-2', testName: 'Lipid Profile (Total Cholesterol)', date: '2026-08-15', result: '215 mg/dL', normalRange: '< 200 mg/dL', status: 'Borderline High', trend: 'Stable', hospitalOrLab: 'District Civil Hospital Lab' },
      { id: 'test-3', testName: 'Serum Potassium (K+)', date: '2026-08-15', result: '4.4 mEq/L', normalRange: '3.5 - 5.1 mEq/L', status: 'Normal', trend: 'Stable', hospitalOrLab: 'District Civil Hospital Lab' },
      { id: 'test-4', testName: 'Complete Blood Count (Hb)', date: '2026-07-20', result: '13.8 g/dL', normalRange: '13.0 - 17.0 g/dL', status: 'Normal', trend: 'Stable', hospitalOrLab: 'Rampur PHC Lab' },
    ],
    preventiveTasks: [
      { id: 'prev-1', title: 'Annual Influenza Vaccine', category: 'Vaccination', dueDate: '2026-10-15', status: 'Upcoming', importance: 'Routine' },
      { id: 'prev-2', title: 'Diabetic & Renal Microalbuminuria Screening', category: 'Screening', dueDate: '2026-08-30', status: 'Overdue', importance: 'High' },
      { id: 'prev-3', title: 'Geriatric Fall Risk Assessment', category: 'Follow-up', dueDate: '2026-09-12', status: 'Upcoming', importance: 'High' },
    ],
    careGaps: [
      {
        id: 'gap-1',
        patientId: 'P-1001',
        patientName: 'Ramesh Kumar',
        title: 'Hypertension Follow-Up & Blood Pressure Spike',
        description: 'Patient recorded 158/96 mmHg on last home screening. Last physician review was over 90 days ago. Risk of hypertensive emergency if unaddressed.',
        detectedDate: '2026-09-08',
        recommendedAction: 'Schedule clinical evaluation with a Geriatric Care specialist or General Physician for anti-hypertensive dosage titration.',
        specialtyNeeded: 'Geriatric Care',
        status: 'Open',
        severity: 'High',
      },
    ],
    referrals: [
      {
        id: 'ref-101',
        patientId: 'P-1001',
        patientName: 'Ramesh Kumar',
        patientAge: 68,
        patientGender: 'Male',
        reason: 'Severe morning blood pressure spikes (158/96 mmHg) and joint stiffness requiring medication review and physical evaluation.',
        specialty: 'Geriatric Care',
        priority: 'Urgent',
        selectedDoctorId: 'doc-4',
        selectedDoctorName: 'Dr. Rajeshwar Patil',
        selectedHospitalId: 'hosp-1',
        selectedHospitalName: 'District Civil Hospital & Medical College',
        contactInfo: '+91 98765 43213',
        appointmentDate: '2026-09-12',
        appointmentTime: '10:30 AM',
        followUpDate: '2026-09-26',
        status: 'Appointment Scheduled',
        notes: 'Patient advised to bring past 30-day BP log. Transport arranged via rural bus route 14.',
        careGapId: 'gap-1',
        createdAt: '2026-09-08',
        lastUpdated: '2026-09-09',
      },
    ],
    clinicalNotes: [
      { id: 'cn-1', date: '2026-09-09', author: 'Dr. Rajeshwar Patil', role: 'doctor', note: 'Patient presented with morning occipital headaches. Systolic BP 158 mmHg. Suspected missing evening Telmisartan. Emphasized adherence.' },
    ],
    elderlyDetails: {
      fallRiskScore: 'Moderate',
      systolicAverage: 154,
      diastolicAverage: 92,
      mobilityAssistanceNeeded: true,
      polypharmacyAlert: false,
    },
  },

  // Family 1: Sunita Devi (Maternity)
  {
    patientId: 'P-1002',
    familyId: 'FAM-01',
    villageId: 'VIL-01',
    name: 'Sunita Devi',
    age: 31,
    gender: 'Female',
    category: 'maternity',
    relationship: 'Mother / Pregnant Woman',
    healthId: 'ABHA-9812-4412-8872',
    bloodGroup: 'O Positive (O+)',
    allergies: ['Sulfa drugs'],
    chronicConditions: ['Mild Gestational Anemia (Hb 10.2 g/dL)'],
    primaryCategory: 'Gynecologist / Obstetrician',
    avatarBg: 'bg-rose-100 text-rose-800',
    hasCareGap: false,
    vitals: [
      { date: '2026-09-08', bloodPressureSys: 114, bloodPressureDia: 74, bloodSugarFasting: 88, bloodSugarPostPrandial: 118, pulseRate: 82, weightKg: 58, bmi: 22.8, spo2: 99 },
      { date: '2026-08-25', bloodPressureSys: 112, bloodPressureDia: 72, bloodSugarFasting: 86, bloodSugarPostPrandial: 115, pulseRate: 80, weightKg: 56.5, bmi: 22.2, spo2: 99 },
    ],
    medicines: [
      { id: 'med-s1', name: 'Iron & Folic Acid (IFA) 100mg', dosage: '1 tablet', frequency: 'Once daily (Night)', purpose: 'Prevent gestational anemia & neural tube defects', adherenceRate: 95, status: 'Active', instructions: 'Take with lemon water, do not take with tea or milk' },
      { id: 'med-s2', name: 'Calcium Carbonate 500mg', dosage: '1 tablet', frequency: 'Once daily (Post Lunch)', purpose: 'Fetal skeletal bone ossification', adherenceRate: 90, status: 'Active', instructions: 'Take 2 hours apart from IFA' },
    ],
    labTests: [
      { id: 'test-s1', testName: 'Hemoglobin (Hb) Gestational Level', date: '2026-09-01', result: '10.2 g/dL', normalRange: '>= 11.0 g/dL', status: 'Borderline High', trend: 'Stable', hospitalOrLab: 'Taluk Maternal Care Centre Lab' },
      { id: 'test-s2', testName: '2nd Trimester Ultrasound (Anomaly Scan)', date: '2026-08-28', result: 'Single live intrauterine fetus, cephalic, adequate liquor, normal anatomy', normalRange: 'Normal', status: 'Normal', trend: 'Stable', hospitalOrLab: 'Taluk Maternal Care Centre' },
    ],
    preventiveTasks: [
      { id: 'prev-s1', title: 'Tetanus Toxoid (TT-2 Booster)', category: 'Vaccination', dueDate: '2026-09-25', status: 'Upcoming', importance: 'High' },
      { id: 'prev-s2', title: '3rd Antenatal Checkup (ANC-3)', category: 'Follow-up', dueDate: '2026-10-05', status: 'Upcoming', importance: 'High' },
    ],
    careGaps: [],
    referrals: [
      {
        id: 'ref-103',
        patientId: 'P-1002',
        patientName: 'Sunita Devi',
        patientAge: 31,
        patientGender: 'Female',
        reason: 'Routine 24-week antenatal ultrasound screening and fetal growth checkup.',
        specialty: 'Gynecologist / Obstetrician',
        priority: 'Routine',
        selectedDoctorId: 'doc-3',
        selectedDoctorName: 'Dr. Meera Nambiar',
        selectedHospitalId: 'hosp-6',
        selectedHospitalName: 'Taluk Maternal Care Centre',
        contactInfo: '+91 98765 43212',
        appointmentDate: '2026-09-05',
        appointmentTime: '09:45 AM',
        followUpDate: '2026-10-05',
        status: 'Consultation Completed',
        notes: 'Ultrasound normal. Hemoglobin borderline at 10.2 g/dL. Iron & Folic Acid supplemented.',
        createdAt: '2026-08-30',
        lastUpdated: '2026-09-05',
      },
    ],
    clinicalNotes: [
      { id: 'cn-s1', date: '2026-09-05', author: 'Dr. Meera Nambiar', role: 'doctor', note: '24-week gestation confirmed. Uterine fundal height corresponds to gestational age. Blood pressure optimal. Advised green leafy vegetables and IFA compliance.' },
    ],
    maternityDetails: {
      gestationWeeks: 24,
      expectedDeliveryDate: '2026-12-28',
      trimester: 2,
      hemoglobinLevel: 10.2,
      riskFactor: 'Standard',
      ancVisitsCompleted: 2,
      folicAcidSupplemented: true,
    },
  },

  // Family 1: Aarav Kumar (Child)
  {
    patientId: 'P-1003',
    familyId: 'FAM-01',
    villageId: 'VIL-01',
    name: 'Aarav Kumar',
    age: 4,
    gender: 'Male',
    category: 'child',
    relationship: 'Son / Child',
    healthId: 'ABHA-9812-4412-8873',
    bloodGroup: 'B Positive (B+)',
    allergies: ['None known'],
    chronicConditions: ['Recurrent Tonsillitis & Seasonal Viral Fevers'],
    primaryCategory: 'Pediatrician',
    avatarBg: 'bg-sky-100 text-sky-800',
    hasCareGap: true,
    vitals: [
      { date: '2026-09-07', bloodPressureSys: 96, bloodPressureDia: 60, bloodSugarFasting: 82, bloodSugarPostPrandial: 105, pulseRate: 98, weightKg: 16.5, bmi: 15.2, spo2: 99 },
    ],
    medicines: [
      { id: 'med-k1', name: 'Paracetamol Syrup 120mg/5mL', dosage: '6.5 mL (15mg/kg)', frequency: 'Every 6 hours as needed for fever > 100.5°F', purpose: 'Pediatric antipyretic & pain relief', adherenceRate: 100, status: 'Active', instructions: 'Always measure with dosing syringe; never exceed 4 doses in 24 hours' },
    ],
    labTests: [
      { id: 'test-k1', testName: 'Throat Swab / Rapid Antigen', date: '2026-08-20', result: 'Viral pharyngitis (Negative for Strep A)', normalRange: 'Negative', status: 'Normal', trend: 'Stable', hospitalOrLab: 'Navjeevan Children Hospital Lab' },
    ],
    preventiveTasks: [
      { id: 'prev-k1', title: 'DPT Booster 2 Vaccine', category: 'Vaccination', dueDate: '2026-08-15', status: 'Overdue', importance: 'High' },
      { id: 'prev-k2', title: 'Oral Polio Vaccine (OPV Booster)', category: 'Vaccination', dueDate: '2026-09-20', status: 'Upcoming', importance: 'Routine' },
    ],
    careGaps: [
      {
        id: 'gap-3',
        patientId: 'P-1003',
        patientName: 'Aarav Kumar',
        title: 'Overdue DPT Booster 2 Vaccination',
        description: 'Child is 4 years and 2 months old; National Immunization Schedule DPT Booster 2 was due 45 days ago.',
        detectedDate: '2026-09-01',
        recommendedAction: 'Connect with a Pediatrician or Primary Health Centre for catch-up booster administration.',
        specialtyNeeded: 'Pediatrician',
        status: 'Open',
        severity: 'Moderate',
      },
    ],
    referrals: [],
    clinicalNotes: [
      { id: 'cn-k1', date: '2026-08-20', author: 'Dr. Suresh Kumar', role: 'doctor', note: 'Child presented with mild viral URI. Tonsils mildly inflamed without exudate. Weight 16.5 kg. Calculated safe paracetamol dose at 250mg (6.5 mL). Advised warm fluids and hydration.' },
    ],
    childDetails: {
      weightKg: 16.5,
      heightCm: 104,
      repeatedFeversCount: 3,
      paracetamolMgPerDose: 250,
      immunizationStatus: 'DPT Booster 2 Overdue',
      vaccinesReceived: ['BCG', 'OPV-1,2,3', 'Pentavalent-1,2,3', 'Rotavirus', 'MR-1', 'DPT Booster 1'],
      vaccinesPending: ['DPT Booster 2 (Overdue)', 'Typhoid Conjugate'],
    },
  },

  // Family 1: Priya Sharma (Diabetic Adult)
  {
    patientId: 'P-1004',
    familyId: 'FAM-01',
    villageId: 'VIL-01',
    name: 'Priya Sharma',
    age: 46,
    gender: 'Female',
    category: 'adult',
    relationship: 'Aunt / Adult Member',
    healthId: 'ABHA-5521-3312-4490',
    bloodGroup: 'A Positive (A+)',
    allergies: ['NSAIDs (Aspirin triggers gastritis)'],
    chronicConditions: ['Type 2 Diabetes Mellitus (Uncontrolled)', 'Intermittent Blurred Vision'],
    primaryCategory: 'Diabetologist',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    hasCareGap: true,
    vitals: [
      { date: '2026-09-08', bloodPressureSys: 132, bloodPressureDia: 84, bloodSugarFasting: 192, bloodSugarPostPrandial: 265, pulseRate: 80, weightKg: 64, bmi: 25.1, spo2: 98 },
      { date: '2026-08-28', bloodPressureSys: 130, bloodPressureDia: 82, bloodSugarFasting: 184, bloodSugarPostPrandial: 250, pulseRate: 78, weightKg: 64.5, bmi: 25.3, spo2: 98 },
    ],
    medicines: [
      { id: 'med-p1', name: 'Metformin 500mg', dosage: '1 tablet twice daily', frequency: 'Twice daily (Post breakfast & dinner)', purpose: 'Blood glucose reduction', adherenceRate: 68, status: 'Missed Dosage', instructions: 'Take with or immediately after meals' },
      { id: 'med-p2', name: 'Glimepiride 1mg', dosage: '1 tablet morning', frequency: 'Once daily (Before breakfast)', purpose: 'Insulin secretagogue', adherenceRate: 75, status: 'Active', instructions: 'Take 15 mins before breakfast' },
    ],
    labTests: [
      { id: 'test-p1', testName: 'Glycated Hemoglobin (HbA1c)', date: '2026-08-10', result: '8.9%', normalRange: '< 6.5%', status: 'Critical', trend: 'Worsening', hospitalOrLab: 'Mandya CHC Lab' },
      { id: 'test-p2', testName: 'Urine Routine & Microscopic', date: '2026-08-10', result: 'Trace Proteinuria, Sugar +++', normalRange: 'Nil', status: 'Borderline High', trend: 'Worsening', hospitalOrLab: 'Mandya CHC Lab' },
    ],
    preventiveTasks: [
      { id: 'prev-p1', title: 'Dilated Diabetic Eye Retinal Exam', category: 'Screening', dueDate: '2026-09-15', status: 'Upcoming', importance: 'High' },
      { id: 'prev-p2', title: 'Diabetic Foot Neuropathy Monofilament Screen', category: 'Screening', dueDate: '2026-09-20', status: 'Upcoming', importance: 'High' },
    ],
    careGaps: [
      {
        id: 'gap-2',
        patientId: 'P-1004',
        patientName: 'Priya Sharma',
        title: 'Fasting Blood Sugar Spikes & Missed Metformin',
        description: 'Fasting glucose reached 192 mg/dL with 3 missed doses recorded this week. Patient reports visual blurring.',
        detectedDate: '2026-09-07',
        recommendedAction: 'Immediate consultation with a Diabetologist to avoid diabetic ketoacidosis or microvascular complication.',
        specialtyNeeded: 'Diabetologist',
        status: 'Open',
        severity: 'High',
      },
    ],
    referrals: [
      {
        id: 'ref-102',
        patientId: 'P-1004',
        patientName: 'Priya Sharma',
        patientAge: 46,
        patientGender: 'Female',
        reason: 'Fasting blood sugar elevated to 192 mg/dL accompanied by blurred vision and medication adherence challenges.',
        specialty: 'Diabetologist',
        priority: 'Urgent',
        selectedDoctorId: 'doc-5',
        selectedDoctorName: 'Dr. Kavitha Reddy',
        selectedHospitalId: 'hosp-4',
        selectedHospitalName: 'Mandya Community Health Centre (CHC)',
        contactInfo: '+91 98765 43214',
        appointmentDate: '2026-09-11',
        appointmentTime: '11:00 AM',
        followUpDate: '2026-09-25',
        status: 'Facility Selected',
        notes: 'HbA1c test requested upon arrival at CHC lab.',
        careGapId: 'gap-2',
        createdAt: '2026-09-07',
        lastUpdated: '2026-09-08',
      },
    ],
    clinicalNotes: [
      { id: 'cn-p1', date: '2026-09-07', author: 'Sister Lakshmi (ASHA)', role: 'asha', note: 'Home visit conducted. Patient had missed Metformin 3 times this week due to stomach discomfort. Advised taking with dinner instead of on empty stomach.' },
    ],
  },

  // Family 2: Gowda Household
  {
    patientId: 'P-1005',
    familyId: 'FAM-02',
    villageId: 'VIL-01',
    name: 'Basavanna Gowda',
    age: 72,
    gender: 'Male',
    category: 'elderly',
    relationship: 'Head of Family / Senior',
    healthId: 'ABHA-7712-4412-1005',
    bloodGroup: 'AB Positive (AB+)',
    allergies: ['None'],
    chronicConditions: ['Chronic Obstructive Pulmonary Disease (COPD)', 'Lumbar Spondylosis'],
    primaryCategory: 'Geriatric Care',
    avatarBg: 'bg-purple-100 text-purple-800',
    hasCareGap: false,
    vitals: [
      { date: '2026-09-05', bloodPressureSys: 138, bloodPressureDia: 86, bloodSugarFasting: 104, bloodSugarPostPrandial: 135, pulseRate: 72, weightKg: 61, bmi: 22.4, spo2: 95 },
    ],
    medicines: [
      { id: 'med-g1', name: 'Salbutamol Inhaler 100mcg', dosage: '2 puffs as needed for breathlessness', frequency: 'PRN', purpose: 'Bronchodilator for COPD', adherenceRate: 92, status: 'Active', instructions: 'Use with spacer device and rinse mouth after use' },
    ],
    labTests: [
      { id: 'test-g1', testName: 'Spirometry (FEV1/FVC)', date: '2026-06-12', result: '62% predicted (Moderate obstruction)', normalRange: '> 70%', status: 'Borderline High', trend: 'Stable', hospitalOrLab: 'District Civil Hospital' },
    ],
    preventiveTasks: [
      { id: 'prev-g1', title: 'Pneumococcal Polysaccharide Vaccine (PPSV23)', category: 'Vaccination', dueDate: '2026-11-01', status: 'Upcoming', importance: 'High' },
    ],
    careGaps: [],
    referrals: [],
    clinicalNotes: [
      { id: 'cn-g1', date: '2026-06-12', author: 'Dr. Rajeshwar Patil', role: 'doctor', note: 'COPD stable. SpO2 95% on room air. Advised to avoid indoor biomass chulha smoke exposure.' },
    ],
    elderlyDetails: {
      fallRiskScore: 'Moderate',
      systolicAverage: 138,
      diastolicAverage: 86,
      mobilityAssistanceNeeded: true,
      polypharmacyAlert: false,
    },
  },
  {
    patientId: 'P-1006',
    familyId: 'FAM-02',
    villageId: 'VIL-01',
    name: 'Meenakshi Gowda',
    age: 48,
    gender: 'Female',
    category: 'adult',
    relationship: 'Daughter-in-Law',
    healthId: 'ABHA-7712-4412-1006',
    bloodGroup: 'O Positive (O+)',
    allergies: ['None'],
    chronicConditions: ['Hypothyroidism'],
    primaryCategory: 'General Physician',
    avatarBg: 'bg-teal-100 text-teal-800',
    hasCareGap: false,
    vitals: [
      { date: '2026-09-02', bloodPressureSys: 122, bloodPressureDia: 78, bloodSugarFasting: 92, bloodSugarPostPrandial: 120, pulseRate: 70, weightKg: 68, bmi: 26.2, spo2: 99 },
    ],
    medicines: [
      { id: 'med-m1', name: 'Levothyroxine 50mcg', dosage: '1 tablet empty stomach', frequency: 'Daily 06:30 AM', purpose: 'Thyroid hormone replacement', adherenceRate: 96, status: 'Active', instructions: 'Take 45 mins before morning tea/breakfast' },
    ],
    labTests: [
      { id: 'test-m1', testName: 'Serum TSH Level', date: '2026-07-15', result: '3.2 uIU/mL', normalRange: '0.4 - 4.5 uIU/mL', status: 'Normal', trend: 'Stable', hospitalOrLab: 'Rampur PHC Lab' },
    ],
    preventiveTasks: [
      { id: 'prev-m1', title: 'Annual TSH Re-Evaluation', category: 'Screening', dueDate: '2027-01-15', status: 'Upcoming', importance: 'Routine' },
    ],
    careGaps: [],
    referrals: [],
    clinicalNotes: [],
  },
  {
    patientId: 'P-1007',
    familyId: 'FAM-02',
    villageId: 'VIL-01',
    name: 'Rohan Gowda',
    age: 1,
    gender: 'Male',
    category: 'child',
    relationship: 'Infant / Grandson',
    healthId: 'ABHA-7712-4412-1007',
    bloodGroup: 'B Positive (B+)',
    allergies: ['None'],
    chronicConditions: ['Healthy Infant - Normal Growth'],
    primaryCategory: 'Pediatric Care',
    avatarBg: 'bg-sky-100 text-sky-800',
    hasCareGap: false,
    vitals: [
      { date: '2026-09-01', bloodPressureSys: 88, bloodPressureDia: 55, bloodSugarFasting: 78, bloodSugarPostPrandial: 98, pulseRate: 115, weightKg: 8.4, bmi: 16.1, spo2: 100 },
    ],
    medicines: [
      { id: 'med-r1', name: 'Vitamin D3 Drops (400 IU)', dosage: '1 mL daily', frequency: 'Once daily morning', purpose: 'Rickets prevention', adherenceRate: 98, status: 'Active', instructions: 'Administer directly via dropper' },
    ],
    labTests: [],
    preventiveTasks: [
      { id: 'prev-r1', title: 'Measles-Rubella (MR 1st Dose) + Vitamin A', category: 'Vaccination', dueDate: '2026-10-01', status: 'Upcoming', importance: 'High' },
    ],
    careGaps: [],
    referrals: [],
    clinicalNotes: [],
    childDetails: {
      weightKg: 8.4,
      heightCm: 71,
      repeatedFeversCount: 0,
      paracetamolMgPerDose: 120,
      immunizationStatus: 'Up to date (9-month MR pending)',
      vaccinesReceived: ['BCG', 'Hep B-0', 'OPV 1,2,3', 'Pentavalent 1,2,3', 'Rotavirus 1,2,3', 'fIPV 1,2', 'PCV 1,2'],
      vaccinesPending: ['MR-1 (At 9 months)', 'Vitamin A 1st dose'],
    },
  },

  // Family 3: Naik Household
  {
    patientId: 'P-1008',
    familyId: 'FAM-03',
    villageId: 'VIL-01',
    name: 'Suresh Naik',
    age: 52,
    gender: 'Male',
    category: 'adult',
    relationship: 'Head of Family',
    healthId: 'ABHA-6612-4412-1008',
    bloodGroup: 'O Positive (O+)',
    allergies: ['None'],
    chronicConditions: ['Pre-Hypertension'],
    primaryCategory: 'General Physician',
    avatarBg: 'bg-blue-100 text-blue-800',
    hasCareGap: false,
    vitals: [
      { date: '2026-08-30', bloodPressureSys: 134, bloodPressureDia: 84, bloodSugarFasting: 98, bloodSugarPostPrandial: 128, pulseRate: 74, weightKg: 70, bmi: 24.5, spo2: 98 },
    ],
    medicines: [],
    labTests: [],
    preventiveTasks: [
      { id: 'prev-n1', title: 'Annual Non-Communicable Disease (NCD) Screening', category: 'Screening', dueDate: '2026-11-20', status: 'Upcoming', importance: 'Routine' },
    ],
    careGaps: [],
    referrals: [],
    clinicalNotes: [],
  },
  {
    patientId: 'P-1009',
    familyId: 'FAM-03',
    villageId: 'VIL-01',
    name: 'Rekha Naik',
    age: 26,
    gender: 'Female',
    category: 'maternity',
    relationship: 'Wife / Expectant Mother',
    healthId: 'ABHA-6612-4412-1009',
    bloodGroup: 'A Positive (A+)',
    allergies: ['None'],
    chronicConditions: ['First Pregnancy (Primigravida 14 Weeks)'],
    primaryCategory: 'Maternal Care',
    avatarBg: 'bg-pink-100 text-pink-800',
    hasCareGap: false,
    vitals: [
      { date: '2026-09-04', bloodPressureSys: 110, bloodPressureDia: 70, bloodSugarFasting: 84, bloodSugarPostPrandial: 112, pulseRate: 78, weightKg: 52, bmi: 21.4, spo2: 99 },
    ],
    medicines: [
      { id: 'med-rek1', name: 'Folic Acid 5mg', dosage: '1 tablet daily', frequency: 'Daily morning', purpose: 'Neural tube protection', adherenceRate: 98, status: 'Active', instructions: 'Take with breakfast' },
    ],
    labTests: [
      { id: 'test-rek1', testName: '1st Trimester Blood Routine & Blood Group', date: '2026-08-14', result: 'Hb: 12.1 g/dL, Rh Positive, HIV/HBsAg Negative', normalRange: 'Normal', status: 'Normal', trend: 'Stable', hospitalOrLab: 'Rampur PHC Lab' },
    ],
    preventiveTasks: [
      { id: 'prev-rek1', title: '2nd Antenatal Checkup (ANC-2)', category: 'Follow-up', dueDate: '2026-10-10', status: 'Upcoming', importance: 'High' },
    ],
    careGaps: [],
    referrals: [],
    clinicalNotes: [
      { id: 'cn-rek1', date: '2026-08-14', author: 'Sister Kavitha (ANM)', role: 'anm', note: 'Mother and Child Protection (MCP) card issued. First ANC checkup completed at PHC. Pregnancy progressing normally.' },
    ],
    maternityDetails: {
      gestationWeeks: 14,
      expectedDeliveryDate: '2027-03-08',
      trimester: 2,
      hemoglobinLevel: 12.1,
      riskFactor: 'Standard',
      ancVisitsCompleted: 1,
      folicAcidSupplemented: true,
    },
  },

  // Family 3: Naik Household — Newborn (P-1010)
  {
    patientId: 'P-1010',
    familyId: 'FAM-03',
    villageId: 'VIL-01',
    name: 'Baby Riya Naik',
    age: 0,
    gender: 'Female',
    category: 'child',
    relationship: 'Newborn / Daughter',
    healthId: 'ABHA-6612-4412-1010',
    bloodGroup: 'A Positive (A+)',
    allergies: ['None'],
    chronicConditions: ['Healthy Newborn — 12 Days Old'],
    primaryCategory: 'Pediatric Care',
    avatarBg: 'bg-pink-50 text-pink-700',
    hasCareGap: false,
    vitals: [
      { date: '2026-09-18', bloodPressureSys: 72, bloodPressureDia: 44, bloodSugarFasting: 68, bloodSugarPostPrandial: 85, pulseRate: 138, weightKg: 3.1, bmi: 12.4, spo2: 99 },
    ],
    medicines: [
      { id: 'med-riya1', name: 'Vitamin K1 (Phytomenadione) 1mg', dosage: 'Single IM injection at birth', frequency: 'Birth dose — completed', purpose: 'Newborn haemorrhagic disease prevention', adherenceRate: 100, status: 'Active', instructions: 'Given at birth — DEMO record only' },
    ],
    labTests: [],
    preventiveTasks: [
      { id: 'prev-riya1', title: 'BCG + OPV-0 + Hep B-0 (Birth vaccines)', category: 'Vaccination', dueDate: '2026-09-06', status: 'Completed', importance: 'High' },
      { id: 'prev-riya2', title: 'Newborn Hearing Screen (NBHS)', category: 'Screening', dueDate: '2026-09-20', status: 'Upcoming', importance: 'Routine' },
    ],
    careGaps: [],
    referrals: [],
    clinicalNotes: [
      { id: 'cn-riya1', date: '2026-09-06', author: 'Sister Kavitha (ANM)', role: 'anm', note: 'Normal institutional delivery. Birth weight 3.1 kg. APGAR score 9/10. Exclusive breastfeeding initiated within 1 hour of birth. BCG, OPV-0, Hep B-0 given. Umbilical cord clean and dry.' },
    ],
    childDetails: {
      weightKg: 3.1,
      heightCm: 50,
      repeatedFeversCount: 0,
      paracetamolMgPerDose: 0,
      immunizationStatus: 'Birth vaccines complete — 6-week vaccines pending',
      vaccinesReceived: ['BCG', 'OPV-0', 'Hep B-0', 'Vitamin K1'],
      vaccinesPending: ['OPV-1 (6 weeks)', 'Pentavalent-1 (6 weeks)', 'Rotavirus-1 (6 weeks)', 'fIPV-1 (6 weeks)', 'PCV-1 (6 weeks)'],
    },
  },

  // Family 2: Gowda Household — Postpartum New Mother (P-1011)
  {
    patientId: 'P-1011',
    familyId: 'FAM-02',
    villageId: 'VIL-01',
    name: 'Kavitha Gowda',
    age: 25,
    gender: 'Female',
    category: 'maternity',
    relationship: 'Daughter-in-Law / New Mother',
    healthId: 'ABHA-7712-4412-1011',
    bloodGroup: 'B Positive (B+)',
    allergies: ['None'],
    chronicConditions: ['Postpartum Recovery — 18 Days Post-Delivery'],
    primaryCategory: 'Maternal Care',
    avatarBg: 'bg-rose-50 text-rose-700',
    hasCareGap: false,
    vitals: [
      { date: '2026-09-18', bloodPressureSys: 118, bloodPressureDia: 76, bloodSugarFasting: 90, bloodSugarPostPrandial: 118, pulseRate: 80, weightKg: 55, bmi: 21.9, spo2: 99 },
    ],
    medicines: [
      { id: 'med-kav1', name: 'Iron & Folic Acid (IFA) 100mg', dosage: '1 tablet daily', frequency: 'Once daily night', purpose: 'Postpartum anaemia prevention', adherenceRate: 90, status: 'Active', instructions: 'Take with lemon water, not with milk or tea' },
      { id: 'med-kav2', name: 'Calcium Carbonate 500mg', dosage: '1 tablet daily', frequency: 'Post lunch', purpose: 'Lactation calcium support', adherenceRate: 88, status: 'Active', instructions: 'Take 2 hours apart from IFA' },
    ],
    labTests: [
      { id: 'test-kav1', testName: 'Postpartum Haemoglobin Check', date: '2026-09-10', result: '11.4 g/dL', normalRange: '>= 11.0 g/dL', status: 'Normal', trend: 'Improving', hospitalOrLab: 'Rampur PHC Lab' },
    ],
    preventiveTasks: [
      { id: 'prev-kav1', title: 'Postpartum Check-up (PNC-2 at 6 weeks)', category: 'Follow-up', dueDate: '2026-10-18', status: 'Upcoming', importance: 'High' },
      { id: 'prev-kav2', title: 'Family Planning Counselling Session', category: 'Follow-up', dueDate: '2026-10-05', status: 'Upcoming', importance: 'Routine' },
    ],
    careGaps: [],
    referrals: [],
    clinicalNotes: [
      { id: 'cn-kav1', date: '2026-09-06', author: 'Sister Lakshmi (ASHA)', role: 'asha', note: 'Normal vaginal delivery at District Hospital. Mother and baby discharged on day 2. Breastfeeding established. Advised IFA and calcium supplementation for 6 months. Postnatal home visit done on day 7.' },
    ],
    maternityDetails: {
      gestationWeeks: 0,
      expectedDeliveryDate: '2026-09-01',
      trimester: 3,
      hemoglobinLevel: 11.4,
      riskFactor: 'Standard',
      ancVisitsCompleted: 4,
      folicAcidSupplemented: true,
      isPostpartum: true,
      postpartumDaysSinceDelivery: 18,
      deliveryDate: '2026-09-01',
    },
  },
];

export interface MedoraContextType {
  village: Village;
  families: VillageFamily[];
  patients: PatientProfile[];
  
  authSession: AuthSession;
  activeRole: UserRole;
  switchRole: (role: UserRole, targetPatientId?: string, targetFamilyId?: string) => void;
  
  selectedPatientId: string;
  selectedPatient: PatientProfile;
  currentFamily: VillageFamily | undefined;
  selectPatient: (patientId: string) => void;
  
  accessibleFamilyMembers: FamilyMember[];
  
  addPatient: (data: {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    category: 'child' | 'maternity' | 'adult' | 'elderly';
    relationship: string;
    familyId: string;
    bloodGroup?: string;
    chronicConditions?: string[];
    allergies?: string[];
    initialBpSys?: number;
    initialBpDia?: number;
    initialSugar?: number;
    notes?: string;
  }) => PatientProfile;
  removePatient: (patientId: string) => void;
  addFamily: (data: {
    familyName: string;
    headOfFamily: string;
    rationCardNumber: string;
    rationCardType: 'BPL (Antyodaya)' | 'BPL (Priority)' | 'APL';
    address: string;
    primaryPhone: string;
  }) => VillageFamily;
  removeFamily: (familyId: string) => void;

  addVitalReading: (patientId: string, vital: VitalMeasurement) => void;
  updateMedicationStatus: (patientId: string, medId: string, taken: boolean) => void;
  addMedication: (patientId: string, med: Omit<Medication, 'id'>) => void;
  addClinicalNote: (patientId: string, note: string, author?: string, role?: 'doctor' | 'admin' | 'asha') => void;
  
  // Admin & Population Extensions
  adminPassword: string;
  changeAdminPassword: (currentPass: string, newPass: string) => { success: boolean; message: string };
  auditLogs: AuditLogItem[];
  addAuditLog: (action: string, options?: { user?: string; role?: UserRole; affectedPatientId?: string; affectedFamilyId?: string; previousValue?: string; newValue?: string; details?: string }) => void;
  archivePatient: (patientId: string, reason?: string) => boolean;
  restorePatient: (patientId: string) => boolean;
  permanentDeletePatient: (patientId: string) => boolean;
  editPatient: (patientId: string, data: Partial<{
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    relationship: string;
    familyId: string;
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
    contactPhone: string;
    emergencyContact: string;
    address: string;
  }>) => boolean;
  editFamily: (familyId: string, data: Partial<{
    familyName: string;
    headOfFamily: string;
    rationCardNumber: string;
    rationCardType: 'BPL (Antyodaya)' | 'BPL (Priority)' | 'APL';
    address: string;
    primaryPhone: string;
  }>) => boolean;

  // Doctor Availability
  primaryDoctorStatus: DoctorAvailabilityStatus;
  setPrimaryDoctorStatus: (status: DoctorAvailabilityStatus) => void;

  referrals: Referral[];
  activeReferralId: string;
  setActiveReferralId: (id: string) => void;
  createReferral: (newRef: Omit<Referral, 'id' | 'createdAt' | 'lastUpdated'>) => Referral;
  updateReferralStatus: (id: string, status: ReferralStatus) => void;

  networkStatus: NetworkStatus;
  setNetworkStatus: (status: NetworkStatus) => void;
  pendingSyncQueue: PendingSyncItem[];
  syncPendingQueue: () => Promise<{ syncedCount: number; message: string }>;
  clearSyncQueue: () => void;
  
  isAuthenticated: boolean;
  login: (role: UserRole, targetPatientId?: string, targetFamilyId?: string) => void;
  logout: () => void;
  
  resetDemoData: () => void;
}

const MedoraContext = createContext<MedoraContextType | undefined>(undefined);

export const MedoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [village, setVillage] = useState<Village>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VILLAGE);
      return saved ? JSON.parse(saved) : INITIAL_VILLAGE;
    } catch {
      return INITIAL_VILLAGE;
    }
  });

  const [families, setFamilies] = useState<VillageFamily[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAMILIES);
      return saved ? JSON.parse(saved) : INITIAL_FAMILIES;
    } catch {
      return INITIAL_FAMILIES;
    }
  });

  const [patients, setPatients] = useState<PatientProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  });

  const [authSession, setAuthSession] = useState<AuthSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      return saved ? JSON.parse(saved) : {
        role: 'patient',
        activePatientId: 'P-1001',
        activeFamilyId: 'FAM-01',
        doctorName: 'Dr. Rajeshwar Patil',
        adminName: 'Sister Lakshmi Devi (ASHA)',
      };
    } catch {
      return {
        role: 'patient',
        activePatientId: 'P-1001',
        activeFamilyId: 'FAM-01',
      };
    }
  });

  const [networkStatus, setNetworkStatusState] = useState<NetworkStatus>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NETWORK);
      return (saved as NetworkStatus) || 'ONLINE';
    } catch {
      return 'ONLINE';
    }
  });

  const [pendingSyncQueue, setPendingSyncQueue] = useState<PendingSyncItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYNC);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    return authSession.activePatientId || 'P-1001';
  });

  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);
  const [activeReferralId, setActiveReferralId] = useState<string>(MOCK_REFERRALS[0]?.id || 'ref-101');

  // Admin Credentials & Access State
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
      return saved || DEFAULT_ADMIN_PASSWORD;
    } catch {
      return DEFAULT_ADMIN_PASSWORD;
    }
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved ? JSON.parse(saved) : [
        {
          id: 'audit-init',
          action: 'REGISTRY INITIALIZED',
          user: 'Sister Lakshmi Devi (ASHA)',
          role: 'admin',
          timestamp: '2026-09-20 09:00:00',
          details: 'Central Gram Panchayat Health Registry initialized with 9 active villagers across 3 households.',
        }
      ];
    } catch {
      return [];
    }
  });

  // Doctor Availability Status
  const [primaryDoctorStatus, setPrimaryDoctorStatusState] = useState<DoctorAvailabilityStatus>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCTOR_STATUS);
      return (saved as DoctorAvailabilityStatus) || 'AVAILABLE';
    } catch {
      return 'AVAILABLE';
    }
  });

  const setPrimaryDoctorStatus = (status: DoctorAvailabilityStatus) => {
    setPrimaryDoctorStatusState(status);
    try {
      localStorage.setItem(STORAGE_KEYS.DOCTOR_STATUS, status);
    } catch {}
  };

  // Authentication State (Login page control)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('medora_is_auth_v2');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const login = (role: UserRole, targetPatientId?: string, targetFamilyId?: string) => {
    switchRole(role, targetPatientId, targetFamilyId);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('medora_is_auth_v2', 'true');
    } catch {}
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('medora_is_auth_v2', 'false');
    } catch {}
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VILLAGE, JSON.stringify(village));
    } catch {}
  }, [village]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(families));
    } catch {}
  }, [families]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    } catch {}
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authSession));
    } catch {}
  }, [authSession]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC, JSON.stringify(pendingSyncQueue));
    } catch {}
  }, [pendingSyncQueue]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NETWORK, networkStatus);
    } catch {}
  }, [networkStatus]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  // Dynamic Population Calculation (Strictly Active non-archived villagers)
  useEffect(() => {
    const activeCount = patients.filter(p => !p.isArchived).length;
    setVillage(prev => {
      if (prev.population !== activeCount) {
        return { ...prev, population: activeCount };
      }
      return prev;
    });
  }, [patients]);

  const selectedPatient = useMemo(() => {
    const activePatients = patients.filter(p => !p.isArchived);
    const found = patients.find(p => p.patientId === selectedPatientId);
    return found || activePatients[0] || patients[0] || INITIAL_PATIENTS[0];
  }, [patients, selectedPatientId]);

  const currentFamily = useMemo(() => {
    return families.find(f => f.familyId === selectedPatient?.familyId);
  }, [families, selectedPatient]);

  const accessibleFamilyMembers: FamilyMember[] = useMemo(() => {
    let filteredPatients = patients.filter(p => !p.isArchived);

    if (authSession.role === 'patient') {
      filteredPatients = patients.filter(p => p.patientId === authSession.activePatientId);
    } else if (authSession.role === 'family') {
      filteredPatients = patients.filter(p => !p.isArchived && p.familyId === authSession.activeFamilyId);
    }

    return filteredPatients.map(p => ({
      id: p.patientId,
      name: p.name,
      relationship: p.relationship,
      age: p.age,
      gender: p.gender,
      healthId: p.healthId,
      primaryCategory: p.primaryCategory,
      activeConditions: p.chronicConditions,
      avatarBg: p.avatarBg,
      hasCareGap: p.hasCareGap,
    }));
  }, [patients, authSession.role, authSession.activePatientId, authSession.activeFamilyId]);

  const queueSyncAction = (item: Omit<PendingSyncItem, 'id' | 'timestamp' | 'status'>) => {
    const newItem: PendingSyncItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    setPendingSyncQueue(prev => [newItem, ...prev]);
  };

  const switchRole = (role: UserRole, targetPatientId?: string, targetFamilyId?: string) => {
    let newPatientId = targetPatientId || selectedPatientId;
    let newFamilyId = targetFamilyId || authSession.activeFamilyId;

    if (role === 'patient') {
      newPatientId = targetPatientId || 'P-1001';
      const pat = patients.find(p => p.patientId === newPatientId);
      newFamilyId = pat?.familyId || 'FAM-01';
    } else if (role === 'family') {
      newFamilyId = targetFamilyId || 'FAM-01';
      const fam = families.find(f => f.familyId === newFamilyId);
      if (fam && !fam.memberIds.includes(newPatientId)) {
        newPatientId = fam.memberIds[0] || 'P-1001';
      }
    }

    setAuthSession({
      role,
      activePatientId: newPatientId,
      activeFamilyId: newFamilyId,
      doctorId: 'doc-4',
      doctorName: 'Dr. Rajeshwar Patil',
      adminName: 'Sister Lakshmi Devi (ASHA)',
    });
    setSelectedPatientId(newPatientId);
  };

  const selectPatient = (patientId: string) => {
    const pat = patients.find(p => p.patientId === patientId);
    if (!pat) return;

    if (authSession.role === 'patient' && patientId !== authSession.activePatientId) {
      return;
    }
    if (authSession.role === 'family') {
      const fam = families.find(f => f.familyId === authSession.activeFamilyId);
      if (fam && !fam.memberIds.includes(patientId)) {
        return;
      }
    }

    setSelectedPatientId(patientId);
  };

  const addPatient = (data: {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    category: 'child' | 'maternity' | 'adult' | 'elderly';
    relationship: string;
    familyId: string;
    bloodGroup?: string;
    chronicConditions?: string[];
    allergies?: string[];
    initialBpSys?: number;
    initialBpDia?: number;
    initialSugar?: number;
    notes?: string;
  }): PatientProfile => {
    const maxNum = patients.reduce((max, p) => {
      const num = parseInt(p.patientId.replace('P-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 1000);
    const newPatientId = `P-${maxNum + 1}`;

    const defaultSpecialties: Record<string, Specialization> = {
      child: 'Pediatric Care',
      maternity: 'Maternal Care',
      elderly: 'Geriatric Care',
      adult: 'General Physician',
    };

    const initialVitals: VitalMeasurement[] = [];
    if (data.initialBpSys && data.initialBpDia) {
      initialVitals.push({
        date: new Date().toISOString().split('T')[0],
        bloodPressureSys: data.initialBpSys,
        bloodPressureDia: data.initialBpDia,
        bloodSugarFasting: data.initialSugar || 100,
        bloodSugarPostPrandial: (data.initialSugar || 100) + 30,
        pulseRate: 76,
        weightKg: data.category === 'child' ? 14 : 62,
        bmi: 22.5,
        spo2: 98,
      });
    }

    const newProfile: PatientProfile = {
      patientId: newPatientId,
      familyId: data.familyId,
      villageId: village.villageId,
      name: data.name,
      age: data.age,
      gender: data.gender,
      category: data.category,
      relationship: data.relationship,
      healthId: `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${newPatientId.replace('P-', '')}`,
      bloodGroup: data.bloodGroup || 'B Positive (B+)',
      allergies: data.allergies || ['None reported'],
      chronicConditions: data.chronicConditions || ['None recorded'],
      primaryCategory: defaultSpecialties[data.category] || 'General Physician',
      avatarBg: data.category === 'maternity' ? 'bg-rose-100 text-rose-800' :
                data.category === 'child' ? 'bg-sky-100 text-sky-800' :
                data.category === 'elderly' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
      hasCareGap: false,
      vitals: initialVitals,
      medicines: [],
      labTests: [],
      preventiveTasks: [
        {
          id: `prev-${Date.now()}`,
          title: 'Initial Rural Health Registry Assessment',
          category: 'Screening',
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          status: 'Upcoming',
          importance: 'Routine',
        },
      ],
      careGaps: [],
      referrals: [],
      clinicalNotes: data.notes ? [
        {
          id: `cn-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: authSession.adminName || 'Sister Lakshmi (ASHA)',
          role: 'asha',
          note: data.notes,
        },
      ] : [],
      maternityDetails: data.category === 'maternity' ? {
        gestationWeeks: 12,
        expectedDeliveryDate: new Date(Date.now() + 196 * 86400000).toISOString().split('T')[0],
        trimester: 1,
        hemoglobinLevel: 11.5,
        riskFactor: 'Standard',
        ancVisitsCompleted: 1,
        folicAcidSupplemented: true,
      } : undefined,
      childDetails: data.category === 'child' ? {
        weightKg: 14,
        heightCm: 96,
        repeatedFeversCount: 0,
        paracetamolMgPerDose: 200,
        immunizationStatus: 'Registered for Routine Immunization',
        vaccinesReceived: ['BCG', 'OPV-1'],
        vaccinesPending: ['Pentavalent-1'],
      } : undefined,
      elderlyDetails: data.category === 'elderly' ? {
        fallRiskScore: 'Low',
        systolicAverage: data.initialBpSys || 135,
        diastolicAverage: data.initialBpDia || 85,
        mobilityAssistanceNeeded: false,
        polypharmacyAlert: false,
      } : undefined,
    };

    setPatients(prev => [newProfile, ...prev]);

    setFamilies(prev => prev.map(f => {
      if (f.familyId === data.familyId && !f.memberIds.includes(newPatientId)) {
        return { ...f, memberIds: [...f.memberIds, newPatientId] };
      }
      return f;
    }));

    if (networkStatus !== 'ONLINE') {
      queueSyncAction({
        actionType: 'ADD_PATIENT',
        entityType: 'patient',
        entityId: newPatientId,
        payload: newProfile,
      });
    }

    addAuditLog(`ADMIN added patient ${newPatientId}`, {
      affectedPatientId: newPatientId,
      affectedFamilyId: data.familyId,
      details: `Registered new villager: ${data.name} (${data.age}y, ${data.gender}). Category: ${data.category}.`,
    });

    return newProfile;
  };

  const addAuditLog = (action: string, options?: {
    user?: string;
    role?: UserRole;
    affectedPatientId?: string;
    affectedFamilyId?: string;
    previousValue?: string;
    newValue?: string;
    details?: string;
  }) => {
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      user: options?.user || (authSession.role === 'admin' ? authSession.adminName || 'Sister Lakshmi (ASHA)' : authSession.role),
      role: options?.role || authSession.role,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      affectedPatientId: options?.affectedPatientId,
      affectedFamilyId: options?.affectedFamilyId,
      previousValue: options?.previousValue,
      newValue: options?.newValue,
      details: options?.details,
    };

    setAuditLogs(prev => [newLog, ...prev]);
  };

  const changeAdminPassword = (currentPass: string, newPass: string): { success: boolean; message: string } => {
    if (authSession.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrator can change password.' };
    }
    if (currentPass !== adminPassword) {
      return { success: false, message: 'Current password does not match.' };
    }
    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    setAdminPassword(newPass);
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPass);
    } catch {}

    addAuditLog('ADMIN changed password', {
      user: authSession.adminName || 'Admin',
      details: 'Administrator prototype login password updated successfully.',
    });

    return { success: true, message: 'Admin password successfully updated.' };
  };

  const archivePatient = (patientId: string, reason?: string): boolean => {
    if (authSession.role !== 'admin') return false;
    const pat = patients.find(p => p.patientId === patientId);
    if (!pat) return false;

    const today = new Date().toISOString().split('T')[0];
    const defaultReason = reason || 'Demographic record archived by Gram Panchayat Desk';

    setPatients(prev => prev.map(p => {
      if (p.patientId === patientId) {
        return {
          ...p,
          isArchived: true,
          archivedAt: today,
          archiveReason: defaultReason,
        };
      }
      return p;
    }));

    if (networkStatus !== 'ONLINE') {
      queueSyncAction({
        actionType: 'ARCHIVE_PATIENT',
        entityType: 'patient',
        entityId: patientId,
        payload: { patientId, reason: defaultReason },
      });
    }

    addAuditLog(`ADMIN archived patient ${patientId}`, {
      affectedPatientId: patientId,
      affectedFamilyId: pat.familyId,
      details: `Patient ${pat.name} archived. Reason: ${defaultReason}`,
    });

    return true;
  };

  const restorePatient = (patientId: string): boolean => {
    if (authSession.role !== 'admin') return false;
    const pat = patients.find(p => p.patientId === patientId);
    if (!pat) return false;

    setPatients(prev => prev.map(p => {
      if (p.patientId === patientId) {
        return {
          ...p,
          isArchived: false,
          archivedAt: undefined,
          archiveReason: undefined,
        };
      }
      return p;
    }));

    if (networkStatus !== 'ONLINE') {
      queueSyncAction({
        actionType: 'RESTORE_PATIENT',
        entityType: 'patient',
        entityId: patientId,
        payload: { patientId },
      });
    }

    addAuditLog(`ADMIN restored patient ${patientId}`, {
      affectedPatientId: patientId,
      affectedFamilyId: pat.familyId,
      details: `Patient ${pat.name} restored to active village registry.`,
    });

    return true;
  };

  const permanentDeletePatient = (patientId: string): boolean => {
    if (authSession.role !== 'admin') return false;
    const pat = patients.find(p => p.patientId === patientId);
    removePatient(patientId);

    addAuditLog(`ADMIN permanently deleted patient ${patientId}`, {
      affectedPatientId: patientId,
      affectedFamilyId: pat?.familyId,
      details: `Permanently removed ${pat?.name || patientId} from registry after explicit confirmation.`,
    });

    return true;
  };

  const editPatient = (patientId: string, data: Partial<{
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    relationship: string;
    familyId: string;
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
    contactPhone: string;
    emergencyContact: string;
    address: string;
  }>): boolean => {
    if (authSession.role !== 'admin') return false;

    let previousProfile: PatientProfile | undefined;
    setPatients(prev => prev.map(p => {
      if (p.patientId === patientId) {
        previousProfile = p;
        const newFamId = data.familyId || p.familyId;
        return {
          ...p,
          ...data,
          familyId: newFamId,
        };
      }
      return p;
    }));

    // Reassign family membership if familyId changed
    if (data.familyId && previousProfile && previousProfile.familyId !== data.familyId) {
      setFamilies(prev => prev.map(f => {
        if (f.familyId === previousProfile?.familyId) {
          return { ...f, memberIds: f.memberIds.filter(id => id !== patientId) };
        }
        if (f.familyId === data.familyId && !f.memberIds.includes(patientId)) {
          return { ...f, memberIds: [...f.memberIds, patientId] };
        }
        return f;
      }));
    }

    if (networkStatus !== 'ONLINE') {
      queueSyncAction({
        actionType: 'EDIT_PATIENT',
        entityType: 'patient',
        entityId: patientId,
        payload: data,
      });
    }

    addAuditLog(`ADMIN updated patient ${patientId}`, {
      affectedPatientId: patientId,
      affectedFamilyId: data.familyId || previousProfile?.familyId,
      details: `Updated demographic records for ${data.name || previousProfile?.name || patientId}.`,
    });

    return true;
  };

  const editFamily = (familyId: string, data: Partial<{
    familyName: string;
    headOfFamily: string;
    rationCardNumber: string;
    rationCardType: 'BPL (Antyodaya)' | 'BPL (Priority)' | 'APL';
    address: string;
    primaryPhone: string;
  }>): boolean => {
    if (authSession.role !== 'admin') return false;

    setFamilies(prev => prev.map(f => {
      if (f.familyId === familyId) {
        return { ...f, ...data };
      }
      return f;
    }));

    addAuditLog(`ADMIN updated family ${familyId}`, {
      affectedFamilyId: familyId,
      details: `Updated household information for ${data.familyName || familyId}.`,
    });

    return true;
  };

  const removePatient = (patientId: string) => {
    setPatients(prev => prev.filter(p => p.patientId !== patientId));
    setFamilies(prev => prev.map(f => ({
      ...f,
      memberIds: f.memberIds.filter(id => id !== patientId),
    })));

    if (selectedPatientId === patientId) {
      const remaining = patients.filter(p => p.patientId !== patientId);
      if (remaining[0]) setSelectedPatientId(remaining[0].patientId);
    }

    if (networkStatus !== 'ONLINE') {
      queueSyncAction({
        actionType: 'REMOVE_PATIENT',
        entityType: 'patient',
        entityId: patientId,
        payload: { patientId },
      });
    }
  };

  const addFamily = (data: {
    familyName: string;
    headOfFamily: string;
    rationCardNumber: string;
    rationCardType: 'BPL (Antyodaya)' | 'BPL (Priority)' | 'APL';
    address: string;
    primaryPhone: string;
  }): VillageFamily => {
    const maxNum = families.reduce((max, f) => {
      const num = parseInt(f.familyId.replace('FAM-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newFamilyId = `FAM-${String(maxNum + 1).padStart(2, '0')}`;

    const newFamily: VillageFamily = {
      familyId: newFamilyId,
      villageId: village.villageId,
      familyName: data.familyName,
      headOfFamily: data.headOfFamily,
      rationCardNumber: data.rationCardNumber,
      rationCardType: data.rationCardType,
      address: data.address,
      primaryPhone: data.primaryPhone,
      memberIds: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setFamilies(prev => [...prev, newFamily]);

    if (networkStatus !== 'ONLINE') {
      queueSyncAction({
        actionType: 'ADD_FAMILY',
        entityType: 'family',
        entityId: newFamilyId,
        payload: newFamily,
      });
    }

    addAuditLog(`ADMIN added family ${newFamilyId}`, {
      affectedFamilyId: newFamilyId,
      details: `Registered new household: ${data.familyName}. Head: ${data.headOfFamily}.`,
    });

    return newFamily;
  };

  const removeFamily = (familyId: string) => {
    const familyToRemove = families.find(f => f.familyId === familyId);
    if (!familyToRemove) return;

    setPatients(prev => prev.filter(p => !familyToRemove.memberIds.includes(p.patientId)));
    setFamilies(prev => prev.filter(f => f.familyId !== familyId));

    addAuditLog(`ADMIN removed family ${familyId}`, {
      affectedFamilyId: familyId,
      details: `Removed household ${familyToRemove.familyName} and ${familyToRemove.memberIds.length} associated member record(s).`,
    });
  };

  const addVitalReading = (patientId: string, vital: VitalMeasurement) => {
    setPatients(prev => prev.map(p => {
      if (p.patientId === patientId) {
        return {
          ...p,
          vitals: [vital, ...p.vitals],
        };
      }
      return p;
    }));

    if (networkStatus !== 'ONLINE') {
      queueSyncAction({
        actionType: 'ADD_VITAL',
        entityType: 'vital',
        entityId: patientId,
        payload: vital,
      });
    }
  };

  const updateMedicationStatus = (patientId: string, medId: string, taken: boolean) => {
    setPatients(prev => prev.map(p => {
      if (p.patientId === patientId) {
        return {
          ...p,
          medicines: p.medicines.map(m => {
            if (m.id === medId) {
              return {
                ...m,
                status: taken ? 'Active' : 'Missed Dosage',
                adherenceRate: taken ? Math.min(100, m.adherenceRate + 2) : Math.max(20, m.adherenceRate - 5),
              };
            }
            return m;
          }),
        };
      }
      return p;
    }));

    if (networkStatus !== 'ONLINE') {
      queueSyncAction({
        actionType: 'UPDATE_MEDICINE',
        entityType: 'patient',
        entityId: `${patientId}_${medId}`,
        payload: { taken },
      });
    }
  };

  const addMedication = (patientId: string, med: Omit<Medication, 'id'>) => {
    const id = `med-${Date.now().toString().slice(-4)}`;
    const fullMed: Medication = { ...med, id };

    setPatients(prev => prev.map(p => {
      if (p.patientId === patientId) {
        return {
          ...p,
          medicines: [...p.medicines, fullMed],
        };
      }
      return p;
    }));

    if (networkStatus !== 'ONLINE') {
      queueSyncAction({
        actionType: 'ADD_MEDICINE',
        entityType: 'patient',
        entityId: patientId,
        payload: fullMed,
      });
    }
  };

  const addClinicalNote = (patientId: string, noteText: string, author?: string, role?: 'doctor' | 'admin' | 'asha') => {
    const note: ClinicalNote = {
      id: `cn-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author: author || (authSession.role === 'doctor' ? authSession.doctorName || 'Dr. Patil' : authSession.adminName || 'ASHA Worker'),
      role: role || (authSession.role === 'doctor' ? 'doctor' : 'asha'),
      note: noteText,
    };

    setPatients(prev => prev.map(p => {
      if (p.patientId === patientId) {
        return {
          ...p,
          clinicalNotes: [note, ...p.clinicalNotes],
        };
      }
      return p;
    }));

    if (networkStatus !== 'ONLINE') {
      queueSyncAction({
        actionType: 'ADD_CLINICAL_NOTE',
        entityType: 'patient',
        entityId: patientId,
        payload: note,
      });
    }
  };

  const createReferral = (newRef: Omit<Referral, 'id' | 'createdAt' | 'lastUpdated'>): Referral => {
    const id = `ref-${Date.now().toString().slice(-4)}`;
    const created: Referral = {
      ...newRef,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setReferrals(prev => [created, ...prev]);
    setActiveReferralId(id);

    setPatients(prev => prev.map(p => {
      if (p.patientId === newRef.patientId) {
        return {
          ...p,
          referrals: [created, ...p.referrals],
        };
      }
      return p;
    }));

    if (networkStatus !== 'ONLINE') {
      queueSyncAction({
        actionType: 'CREATE_REFERRAL',
        entityType: 'referral',
        entityId: id,
        payload: created,
      });
    }

    return created;
  };

  const updateReferralStatus = (id: string, status: ReferralStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status, lastUpdated: today } : r));

    setPatients(prev => prev.map(p => ({
      ...p,
      referrals: p.referrals.map(r => r.id === id ? { ...r, status, lastUpdated: today } : r),
    })));
  };

  const setNetworkStatus = (status: NetworkStatus) => {
    setNetworkStatusState(status);
  };

  const syncPendingQueue = async (): Promise<{ syncedCount: number; message: string }> => {
    const count = pendingSyncQueue.length;
    if (count === 0) {
      return { syncedCount: 0, message: 'Local storage is already in sync with rural health registry.' };
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    setPendingSyncQueue([]);
    return {
      syncedCount: count,
      message: `Successfully synchronized ${count} offline clinical transaction(s) with Central Gram Panchayat Health Registry without conflicts.`,
    };
  };

  const clearSyncQueue = () => {
    setPendingSyncQueue([]);
  };

  const resetDemoData = () => {
    setVillage(INITIAL_VILLAGE);
    setFamilies(INITIAL_FAMILIES);
    setPatients(INITIAL_PATIENTS);
    setReferrals(MOCK_REFERRALS);
    setPendingSyncQueue([]);
    setNetworkStatusState('ONLINE');
    setAuthSession({
      role: 'patient',
      activePatientId: 'P-1001',
      activeFamilyId: 'FAM-01',
      doctorName: 'Dr. Rajeshwar Patil',
      adminName: 'Sister Lakshmi Devi (ASHA)',
    });
    setSelectedPatientId('P-1001');

    try {
      localStorage.removeItem(STORAGE_KEYS.VILLAGE);
      localStorage.removeItem(STORAGE_KEYS.FAMILIES);
      localStorage.removeItem(STORAGE_KEYS.PATIENTS);
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      localStorage.removeItem(STORAGE_KEYS.SYNC);
      localStorage.removeItem(STORAGE_KEYS.NETWORK);
    } catch {}
  };

  return (
    <MedoraContext.Provider
      value={{
        village,
        families,
        patients,
        authSession,
        activeRole: authSession.role,
        switchRole,
        selectedPatientId,
        selectedPatient,
        currentFamily,
        selectPatient,
        accessibleFamilyMembers,
        addPatient,
        removePatient,
        addFamily,
        removeFamily,
        addVitalReading,
        updateMedicationStatus,
        addMedication,
        addClinicalNote,
        
        // Admin & Demographic Registry Extensions
        adminPassword,
        changeAdminPassword,
        auditLogs,
        addAuditLog,
        archivePatient,
        restorePatient,
        permanentDeletePatient,
        editPatient,
        editFamily,

        // Doctor Availability Status
        primaryDoctorStatus,
        setPrimaryDoctorStatus,

        referrals,
        activeReferralId,
        setActiveReferralId,
        createReferral,
        updateReferralStatus,
        networkStatus,
        setNetworkStatus,
        pendingSyncQueue,
        syncPendingQueue,
        clearSyncQueue,
        isAuthenticated,
        login,
        logout,
        resetDemoData,
      }}
    >
      {children}
    </MedoraContext.Provider>
  );
};

export const useMedora = (): MedoraContextType => {
  const context = useContext(MedoraContext);
  if (!context) {
    throw new Error('useMedora must be used within a MedoraProvider');
  }
  return context;
};

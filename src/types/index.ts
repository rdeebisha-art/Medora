export type Specialization = 
  | 'General Physician'
  | 'Pediatrician'
  | 'Gynecologist / Obstetrician'
  | 'Geriatric Care'
  | 'Diabetologist'
  | 'Cardiologist'
  | 'Nutritionist'
  | 'Mental Wellness Professional'
  | 'Maternal Care'
  | 'Pediatric Care';

export type HospitalType = 
  | 'Government Hospital'
  | 'General Hospital'
  | 'Primary Health Centre'
  | 'Community Health Centre'
  | 'Specialty Hospital'
  | 'Maternal Care'
  | 'Child Care'
  | 'Emergency Care';

export type ConsultationType = 'In-person' | 'Teleconsultation' | 'Both';

export type LanguageCode = 'en' | 'hi' | 'te' | 'ml' | 'ta' | 'kn';

export interface Doctor {
  id: string;
  name: string;
  photoUrl: string;
  specialization: Specialization;
  hospitalId: string;
  hospitalName: string;
  experienceYears: number;
  languages: string[];
  consultationType: ConsultationType;
  availabilityStatus: 'Available Today' | 'Next Available: Tomorrow' | 'On Duty (Emergency)' | 'Visiting Days: Mon/Wed/Fri';
  location: string;
  contactPhone: string;
  isDemo: boolean;
  about: string;
  services: string[];
  opdTimings: string;
  consultationFee: string;
  education: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: HospitalType;
  address: string;
  distanceKm: number;
  travelTime: string;
  phone: string;
  emergencyPhone: string;
  verifiedEmergency: boolean;
  website: string;
  isOfficialWebsiteVerified: boolean;
  departments: string[];
  consultationAvailable: boolean;
  status: 'Open 24/7' | 'OPD Active' | 'Emergency Only';
  referralSuitability: string;
  mapCoordinates: { lat: number; lng: number };
  landmark: string;
  isDemo: boolean;
  bedCapacity: number;
  ambulanceAvailable: boolean;
  ayushmanBharatEmpanelled: boolean;
}

export type ReferralStatus = 
  | 'Pending'
  | 'Referred'
  | 'Facility Selected'
  | 'Appointment Scheduled'
  | 'Consultation Completed'
  | 'Follow-Up Required'
  | 'Follow-Up Completed';

export type ReferralPriority = 'Routine' | 'Urgent' | 'Immediate';

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  reason: string;
  specialty: Specialization;
  priority: ReferralPriority;
  selectedDoctorId?: string;
  selectedDoctorName?: string;
  selectedHospitalId?: string;
  selectedHospitalName?: string;
  contactInfo: string;
  appointmentDate?: string;
  appointmentTime?: string;
  followUpDate?: string;
  status: ReferralStatus;
  notes?: string;
  careGapId?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface VitalMeasurement {
  date: string;
  bloodPressureSys: number;
  bloodPressureDia: number;
  bloodSugarFasting: number;
  bloodSugarPostPrandial: number;
  pulseRate: number;
  weightKg: number;
  bmi: number;
  spo2: number;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
  adherenceRate: number; // percentage
  status: 'Active' | 'Missed Dosage' | 'Needs Refill';
  instructions: string;
}

export interface LabTest {
  id: string;
  testName: string;
  date: string;
  result: string;
  normalRange: string;
  status: 'Normal' | 'Borderline High' | 'Critical';
  trend: 'Improving' | 'Stable' | 'Worsening';
  hospitalOrLab: string;
}

export interface PreventiveAction {
  id: string;
  title: string;
  category: 'Vaccination' | 'Screening' | 'Lifestyle' | 'Follow-up';
  dueDate: string;
  status: 'Completed' | 'Upcoming' | 'Overdue';
  importance: 'High' | 'Routine';
}

export interface HealthSummaryReport {
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    healthId: string;
    village: string;
    district: string;
    bloodGroup: string;
    allergies: string[];
    contactPhone: string;
    emergencyContact: string;
  };
  medicalInfo: {
    medicalHistory: string[];
    existingConditions: string[];
    currentMedicines: Medication[];
    overallAdherence: number;
    recentSymptoms: string[];
    recentMeasurements: VitalMeasurement;
  };
  testInfo: {
    recentTests: LabTest[];
    historicalTrendsSummary: string;
    importantFollowUpItems: string[];
  };
  preventiveHealthcare: {
    vaccinationStatus: string;
    preventiveTasks: PreventiveAction[];
    missedOverdueActions: string[];
  };
  referralInfo: {
    currentReferral?: Referral;
    previousReferrals: { date: string; specialty: string; hospital: string; outcome: string }[];
    referralStatus: string;
    followUpRequirements: string;
  };
  healthAnalytics: {
    vitalTrends: VitalMeasurement[];
    adherenceHistory: { month: string; rate: number }[];
    healthManagementScore: number; // 0 - 100
  };
  aiSummary: {
    keyObservations: string[];
    careGaps: string[];
    medicationAdherenceIssues: string[];
    preventiveCareGaps: string[];
    suggestedDoctorQuestions: string[];
    disclaimer: string;
  };
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  healthId: string;
  primaryCategory: Specialization;
  activeConditions: string[];
  avatarBg: string;
  hasCareGap: boolean;
}

export interface CareGap {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  description: string;
  detectedDate: string;
  recommendedAction: string;
  specialtyNeeded: Specialization;
  status: 'Open' | 'Referral Created' | 'Resolved';
  severity: 'Moderate' | 'High' | 'Immediate';
}

export interface Village {
  villageId: string;
  name: string;
  subDistrict: string;
  district: string;
  state: string;
  population: number;
  phcName: string;
  ashaWorker: string;
  anmWorker: string;
  emergencyContacts: { service: string; number: string }[];
}

export interface VillageFamily {
  familyId: string;
  villageId: string;
  familyName: string;
  headOfFamily: string;
  rationCardNumber: string;
  rationCardType: 'BPL (Antyodaya)' | 'BPL (Priority)' | 'APL';
  address: string;
  primaryPhone: string;
  memberIds: string[];
  createdAt: string;
}

export type PatientCategory = 'child' | 'maternity' | 'adult' | 'elderly';

export interface ClinicalNote {
  id: string;
  date: string;
  author: string;
  role: 'doctor' | 'admin' | 'asha' | 'anm';
  note: string;
}

export interface PatientProfile {
  patientId: string;
  familyId: string;
  villageId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  category: PatientCategory;
  relationship: string;
  healthId: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  primaryCategory: Specialization;
  avatarBg: string;
  hasCareGap: boolean;
  
  // Longitudinal Records
  vitals: VitalMeasurement[];
  medicines: Medication[];
  labTests: LabTest[];
  preventiveTasks: PreventiveAction[];
  careGaps: CareGap[];
  referrals: Referral[];
  clinicalNotes: ClinicalNote[];

  // Category Specifics
  maternityDetails?: {
    gestationWeeks: number;
    expectedDeliveryDate: string;
    trimester: 1 | 2 | 3;
    hemoglobinLevel: number;
    riskFactor: 'Standard' | 'High Risk';
    ancVisitsCompleted: number;
    folicAcidSupplemented: boolean;
  };
  childDetails?: {
    weightKg: number;
    heightCm: number;
    repeatedFeversCount: number;
    paracetamolMgPerDose: number;
    immunizationStatus: string;
    vaccinesReceived: string[];
    vaccinesPending: string[];
  };
  elderlyDetails?: {
    fallRiskScore: 'Low' | 'Moderate' | 'High';
    systolicAverage: number;
    diastolicAverage: number;
    mobilityAssistanceNeeded: boolean;
    polypharmacyAlert: boolean;
  };
}

export type UserRole = 'patient' | 'family' | 'doctor' | 'admin';

export interface AuthSession {
  role: UserRole;
  activePatientId: string;
  activeFamilyId: string;
  doctorId?: string;
  doctorName?: string;
  adminName?: string;
}

export type NetworkStatus = 'ONLINE' | 'LIMITED' | 'OFFLINE';

export interface PendingSyncItem {
  id: string;
  timestamp: string;
  actionType: 'ADD_VITAL' | 'UPDATE_MEDICINE' | 'ADD_MEDICINE' | 'CREATE_REFERRAL' | 'ADD_PATIENT' | 'REMOVE_PATIENT' | 'ADD_FAMILY' | 'ADD_CLINICAL_NOTE';
  entityType: 'patient' | 'family' | 'referral' | 'vital';
  entityId: string;
  payload: any;
  status: 'pending' | 'synced' | 'conflict';
}


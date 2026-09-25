import Dexie, { Table } from 'dexie';

export interface Patient {
  id?: number;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  pin: string;
  role: 'patient';
  village: string;
  language: string;
  familyId?: number;
  bloodGroup?: string;
  allergies?: string[];
  conditions?: string[];
  emergencyContact?: string;
  isPregnant?: boolean;
  pregnancyWeeks?: number;
  isElderly?: boolean;
  isNewborn?: boolean;
  isChild?: boolean;
  isNewMother?: boolean;
  motherPatientId?: number;
  dateOfBirth?: string;
  createdAt?: string;
}

export interface Family {
  id?: number;
  familyName: string;
  pin: string;
  village: string;
  memberIds: number[];
}

export interface Doctor {
  id?: number;
  doctorId?: string;
  name: string;
  specialty: string;
  phone: string;
  pin: string;
  role: 'doctor';
  village: string;
  availability: string;
  qualifications: string;
  experience?: string;
  languages?: string[];
  location?: string;
  consultationType?: string;
}

export interface Admin {
  id?: number;
  name: string;
  phone: string;
  pin: string;
  role: 'admin';
}

export interface Medicine {
  id?: number;
  patientId: number;
  name: string;
  dose: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate: string;
  doctor: string;
  instructions: string;
  status: 'active' | 'completed' | 'paused';
  lastTaken?: string;
  missedCount?: number;
}

export interface MedicalRecord {
  id?: number;
  patientId: number;
  type: 'vitals' | 'report' | 'vaccination' | 'consultation' | 'prescription';
  date: string;
  data: Record<string, unknown>;
  doctorId?: number;
  notes?: string;
  fileData?: string;
}

export interface HealthTest {
  id?: number;
  patientId: number;
  type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'bmi' | 'temperature' | 'pulse' | 'spo2';
  value: string;
  unit: string;
  date: string;
  notes?: string;
}

export interface Vaccination {
  id?: number;
  patientId: number;
  vaccineName: string;
  dueDate: string;
  givenDate?: string;
  status: 'due' | 'given' | 'overdue' | 'scheduled';
  batchNo?: string;
  givenBy?: string;
}

export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  date: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Notification {
  id?: number;
  userId: number;
  userRole: string;
  message: string;
  messageHi?: string;
  messageTa?: string;
  type: 'medicine' | 'vaccination' | 'appointment' | 'emergency' | 'newborn' | 'pregnancy' | 'followup' | 'report' | 'general';
  isRead: boolean;
  createdAt: string;
}

export interface DoctorSummary {
  id?: number;
  patientId: number;
  doctorId?: number;
  complaint: string;
  symptoms: string[];
  duration: string;
  history: string;
  medicines: string;
  allergies: string;
  vitals: string;
  observations: string;
  warningSigns: string[];
  nextStep: string;
  createdAt: string;
  doctorNotes?: string;
  agentType?: string;
  patientLanguage?: string;
  doctorLanguage?: string;
  languageBridgeUsed?: boolean;
  originalPatientStatements?: string;
  translatedPatientStatements?: string;
  doctorResponseOriginal?: string;
  doctorResponseTranslated?: string;
  followUp?: string;
  appointmentNotes?: string;
}

export type BridgeTranslationConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface LanguageBridgeSession {
  id?: number;
  patientId?: number;
  doctorId?: number;
  patientLanguage: string;
  doctorLanguage: string;
  autoDetect: boolean;
  status: 'setup' | 'active' | 'ended';
  commonLanguage: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageBridgeMessage {
  id?: number;
  sessionId: number;
  speaker: 'patient' | 'doctor' | 'medora';
  originalLanguage: string;
  originalText: string;
  translatedLanguage: string;
  translatedText: string;
  translationConfidence: BridgeTranslationConfidence;
  translationStatus: string;
  timestamp: string;
  isEmergency?: boolean;
  isCritical?: boolean;
  needsConfirmation?: boolean;
  machineTranslation?: string;
  correctedTranslation?: string;
}

export interface LanguageBridgeCorrection {
  id?: number;
  sessionId: number;
  original: string;
  machineTranslation: string;
  correctedTranslation: string;
  languagePair: string;
  timestamp: string;
}

export interface SmsOutbox {
  id?: number;
  toPhone: string;
  message: string;
  type: string;
  language: string;
  status: 'pending' | 'PENDING_OFFLINE' | 'PENDING_USER_SEND' | 'sent' | 'failed';
  createdAt: string;
}

export interface SyncLog {
  id?: number;
  action: string;
  data: string;
  status: 'pending' | 'synced' | 'failed';
  createdAt: string;
}

export interface AiConversation {
  id?: number;
  patientId?: number;
  messages: Array<{ role: 'user' | 'assistant'; content: string; agentType?: string; timestamp: string }>;
  agentType?: string;
  createdAt: string;
}

export interface Hospital {
  id?: number;
  name: string;
  type: 'government_hospital' | 'chc' | 'phc' | 'private' | 'aiims';
  distance: number;
  address: string;
  phone: string;
  services: string[];
  openHours: string;
  hasEmergency: boolean;
  village: string;
  routeInstructions?: string;
}

export interface Transport {
  id?: number;
  type: 'ambulance' | 'auto' | 'bus' | 'community_vehicle';
  name: string;
  phone: string;
  from: string;
  to: string;
  estimatedMinutes: number;
  available: boolean;
  notes?: string;
}

export interface Scheme {
  id?: number;
  name: string;
  shortName: string;
  description: string;
  eligibility: string;
  benefits: string;
  documents: string[];
  source: string;
  howToApply: string;
}

export interface EducationContent {
  id?: number;
  title: string;
  titleHi?: string;
  titleTa?: string;
  content: string;
  contentHi?: string;
  contentTa?: string;
  category: string;
  tags: string[];
}

export interface FamilyAlertOutbox {
  id?: number;
  alertId: string;
  familyId: number | string;
  patientId: number | string;
  recipientId?: number | string;
  recipientName: string;
  recipientPhone: string;
  message: string;
  language: string;
  timestamp: string;
  status: 'PENDING' | 'READY_TO_SEND' | 'SENT_DEMO' | 'FAILED' | 'PENDING_OFFLINE';
}

export interface EmergencyIncident {
  id?: number;
  incidentId: string;
  patientId?: number | string;
  timestamp: string;
  detectedLanguage: string;
  emergencyType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  locationIfAvailable?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  transcript?: string;
  emergencyContact?: string;
  source: 'MANUAL_BUTTON' | 'LOCAL_SOUND_DETECTION' | 'AI_TRIAGE' | 'USSD';
  status: 'LOCAL_ONLY' | 'PENDING_CONNECTION' | 'SENT' | 'FAILED';
  dispatchStatus: 'NOT_SENT' | 'LOCAL_ONLY' | 'PENDING_CONNECTION' | 'SENT' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
}

export interface CallHistoryRecord {
  id?: number;
  phoneNumber: string;
  contactName?: string;
  contactType: 'PERSON' | 'DOCTOR' | 'FAMILY' | 'HOSPITAL' | 'EMERGENCY';
  action: 'CALL_INITIATED';
  timestamp: string;
}

export interface UssdSessionRecord {
  id?: number;
  ussdSessionId: string;
  patientId?: number | string;
  language: string;
  previousSymptom?: string;
  duration?: string;
  lastIntent?: string;
  lastResponse?: string;
  lastUpdated: string;
}

export interface UssdMessageRecord {
  id?: number;
  sessionId: string;
  role: 'user' | 'assistant';
  text: string;
  intent?: string;
  isEmergency?: boolean;
  timestamp: string;
}

export interface UploadedDocument {
  id?: number;
  documentId: string;
  patientId: number | string;
  consultationId?: number | string;
  documentType: 'xray' | 'report' | 'prescription' | 'scan' | 'dicom' | 'other';
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  source: 'PATIENT_UPLOAD' | 'CLINIC_SCAN' | 'LAB_IMPORT' | 'DOCTOR_ENTRY';
  storageReference?: string;
  fileData?: string;
  extractedText?: string;
  extractionConfidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRELIABLE';
  analysisStatus: 'PENDING' | 'AI_ASSISTED' | 'DOCTOR_CONFIRMED' | 'UNRELIABLE' | 'REJECTED';
  structuredData?: Record<string, any>;
  doctorNotes?: string;
  doctorConfirmedDiagnosis?: string;
}

export class MedoraDB extends Dexie {
  patients!: Table<Patient, number>;
  families!: Table<Family, number>;
  doctors!: Table<Doctor, number>;
  admins!: Table<Admin, number>;
  medicines!: Table<Medicine, number>;
  medicalRecords!: Table<MedicalRecord, number>;
  healthTests!: Table<HealthTest, number>;
  vaccinations!: Table<Vaccination, number>;
  appointments!: Table<Appointment, number>;
  notifications!: Table<Notification, number>;
  doctorSummaries!: Table<DoctorSummary, number>;
  smsOutbox!: Table<SmsOutbox, number>;
  syncLog!: Table<SyncLog, number>;
  aiConversations!: Table<AiConversation, number>;
  hospitals!: Table<Hospital, number>;
  transport!: Table<Transport, number>;
  schemes!: Table<Scheme, number>;
  education!: Table<EducationContent, number>;
  languageBridgeSessions!: Table<LanguageBridgeSession, number>;
  languageBridgeMessages!: Table<LanguageBridgeMessage, number>;
  languageBridgeCorrections!: Table<LanguageBridgeCorrection, number>;
  familyAlertOutbox!: Table<FamilyAlertOutbox, number>;
  emergencyIncidents!: Table<EmergencyIncident, number>;
  callHistory!: Table<CallHistoryRecord, number>;
  ussdSessions!: Table<UssdSessionRecord, number>;
  ussdMessages!: Table<UssdMessageRecord, number>;
  uploadedDocuments!: Table<UploadedDocument, number>;

  constructor() {
    super('MedoraDB');
    this.version(1).stores({
      patients: '++id, phone, role, familyId, isPregnant, isElderly, isNewborn, isChild',
      families: '++id, familyName, village',
      doctors: '++id, phone, role, specialty',
      admins: '++id, phone, role',
      medicines: '++id, patientId, status',
      medicalRecords: '++id, patientId, type, date',
      healthTests: '++id, patientId, type, date',
      vaccinations: '++id, patientId, status',
      appointments: '++id, patientId, doctorId, status',
      notifications: '++id, userId, userRole, isRead, type',
      doctorSummaries: '++id, patientId, doctorId',
      smsOutbox: '++id, status',
      syncLog: '++id, status',
      aiConversations: '++id, patientId',
      hospitals: '++id, type, village',
      transport: '++id, type',
      schemes: '++id, shortName',
      education: '++id, category',
    });
    this.version(2).stores({
      languageBridgeSessions: '++id, patientId, doctorId, status, createdAt',
      languageBridgeMessages: '++id, sessionId, timestamp, speaker',
      languageBridgeCorrections: '++id, sessionId, languagePair, timestamp',
    });
    this.version(3).stores({
      familyAlertOutbox: '++id, alertId, familyId, patientId, recipientPhone, status, timestamp',
      emergencyIncidents: '++id, incidentId, patientId, emergencyType, severity, status, timestamp',
      callHistory: '++id, phoneNumber, contactType, action, timestamp',
      ussdSessions: '++id, ussdSessionId, patientId, language, lastUpdated',
      ussdMessages: '++id, sessionId, timestamp, role',
    });
    this.version(4).stores({
      uploadedDocuments: '++id, documentId, patientId, consultationId, documentType, analysisStatus, uploadedAt',
    });
  }
}

export const db = new MedoraDB();

// ─── Seed Data ────────────────────────────────────────────────────────────────

export const SEED_DOCTORS: Omit<Doctor, 'id'>[] = [
  {
    doctorId: 'DOC-01',
    name: 'Dr. Arjun Mehta',
    specialty: 'General Physician',
    phone: '9800001111',
    pin: 'doc123',
    role: 'doctor',
    village: 'Kodaikanal',
    availability: 'Mon–Fri 9:00 AM – 5:00 PM',
    qualifications: 'MBBS, MD (General Medicine)',
    experience: '14 years',
    languages: ['English', 'Tamil', 'Hindi'],
    location: 'Kodaikanal Government Hospital',
    consultationType: 'Both (In-person & Teleconsultation)',
  },
  {
    doctorId: 'DOC-02',
    name: 'Dr. Kavitha Rao',
    specialty: 'Pediatrics & Gynecology',
    phone: '9800002222',
    pin: 'doc123',
    role: 'doctor',
    village: 'Kodaikanal',
    availability: 'Mon–Sat 10:00 AM – 4:00 PM',
    qualifications: 'MBBS, MS (OBG), DCH',
    experience: '11 years',
    languages: ['English', 'Tamil', 'Telugu'],
    location: 'Kodaikanal Government Hospital',
    consultationType: 'Both (In-person & Teleconsultation)',
  },
  {
    doctorId: 'DOC-03',
    name: 'Dr. Suresh Balakrishnan',
    specialty: 'Cardiology & Internal Medicine',
    phone: '9800003333',
    pin: 'doc123',
    role: 'doctor',
    village: 'Kodaikanal',
    availability: 'Tue, Thu, Sat 9:00 AM – 2:00 PM',
    qualifications: 'MBBS, MD, DM (Cardiology)',
    experience: '18 years',
    languages: ['English', 'Tamil', 'Malayalam'],
    location: 'CHC Palani & Kodaikanal PHC',
    consultationType: 'Both (In-person & Teleconsultation)',
  },
  {
    doctorId: 'DOC-04',
    name: 'Dr. Ananya Iyer',
    specialty: 'Obstetrics & Maternal Care',
    phone: '9800004444',
    pin: 'doc123',
    role: 'doctor',
    village: 'Kodaikanal',
    availability: 'Mon–Fri 8:30 AM – 3:30 PM',
    qualifications: 'MBBS, DGO, DNB (OBGYN)',
    experience: '9 years',
    languages: ['English', 'Tamil', 'Hindi', 'Kannada'],
    location: 'Maternal & Child Health Wing, Kodaikanal',
    consultationType: 'Both (In-person & Teleconsultation)',
  },
  {
    doctorId: 'DOC-05',
    name: 'Dr. Meenakshi Sundaram',
    specialty: 'Orthopedics & Geriatric Care',
    phone: '9800005555',
    pin: 'doc123',
    role: 'doctor',
    village: 'Kodaikanal',
    availability: 'Mon, Wed, Fri 10:00 AM – 4:00 PM',
    qualifications: 'MBBS, MS (Ortho), Fellowship in Geriatrics',
    experience: '16 years',
    languages: ['English', 'Tamil', 'Kannada'],
    location: 'Kodaikanal Govt Hospital',
    consultationType: 'In-person',
  },
  {
    doctorId: 'DOC-06',
    name: 'Dr. Priya Nair',
    specialty: 'Endocrinology & Diabetology',
    phone: '9800006666',
    pin: 'doc123',
    role: 'doctor',
    village: 'Kodaikanal',
    availability: 'Mon, Thu 11:00 AM – 5:00 PM',
    qualifications: 'MBBS, MD, Fellowship in Diabetes Care',
    experience: '12 years',
    languages: ['English', 'Malayalam', 'Tamil'],
    location: 'Palani CHC & Mobile Rural Clinic',
    consultationType: 'Both (In-person & Teleconsultation)',
  },
  {
    doctorId: 'DOC-07',
    name: 'Dr. Rajeshwari Patel',
    specialty: 'Pulmonology & Respiratory Care',
    phone: '9800007777',
    pin: 'doc123',
    role: 'doctor',
    village: 'Kodaikanal',
    availability: 'Tue, Fri 9:00 AM – 3:00 PM',
    qualifications: 'MBBS, DTCD, MD (Pulmonary Medicine)',
    experience: '15 years',
    languages: ['English', 'Hindi', 'Gujarati', 'Tamil'],
    location: 'Kodaikanal High Altitude Health Centre',
    consultationType: 'Both (In-person & Teleconsultation)',
  },
  {
    doctorId: 'DOC-08',
    name: 'Dr. Karthik Raman',
    specialty: 'General Surgery & Emergency Trauma',
    phone: '9800008888',
    pin: 'doc123',
    role: 'doctor',
    village: 'Kodaikanal',
    availability: '24/7 On-Call Emergency & OPD Wed/Sat',
    qualifications: 'MBBS, MS (General Surgery), ATLS',
    experience: '13 years',
    languages: ['English', 'Tamil', 'Telugu'],
    location: 'Kodaikanal Govt Hospital Casualty',
    consultationType: 'In-person',
  },
  {
    doctorId: 'DOC-09',
    name: 'Dr. Deepa Shenoy',
    specialty: 'Ophthalmology & Vision Health',
    phone: '9800009999',
    pin: 'doc123',
    role: 'doctor',
    village: 'Kodaikanal',
    availability: 'Mon, Wed 10:00 AM – 3:00 PM',
    qualifications: 'MBBS, MS (Ophthalmology)',
    experience: '10 years',
    languages: ['English', 'Kannada', 'Tamil', 'Hindi'],
    location: 'Mobile Eye Clinic & Kodaikanal PHC',
    consultationType: 'In-person',
  },
  {
    doctorId: 'DOC-10',
    name: 'Dr. Murugan Swaminathan',
    specialty: 'Dermatology & Infectious Diseases',
    phone: '9800001010',
    pin: 'doc123',
    role: 'doctor',
    village: 'Kodaikanal',
    availability: 'Thu, Sat 10:00 AM – 4:00 PM',
    qualifications: 'MBBS, MD (DVL)',
    experience: '11 years',
    languages: ['English', 'Tamil'],
    location: 'Kodaikanal Govt Hospital',
    consultationType: 'Both (In-person & Teleconsultation)',
  },
];

export async function seedDatabase() {
  // Ensure all 10 doctors are in database
  const docCount = await db.doctors.count();
  if (docCount < 10) {
    for (const d of SEED_DOCTORS) {
      const exists = await db.doctors.where({ phone: d.phone }).first();
      if (!exists) {
        await db.doctors.add(d);
      }
    }
  }

  const existingPatients = await db.patients.count();
  if (existingPatients > 0) return; // Already seeded

  // Patients
  const p1 = await db.patients.add({
    name: 'Anitha Kumar', age: 32, gender: 'female', phone: '9876543210', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'ta', familyId: 2,
    bloodGroup: 'B+', allergies: ['Penicillin'], conditions: ['Anemia'],
    isPregnant: true, pregnancyWeeks: 28, emergencyContact: '9876500001',
    dateOfBirth: '1992-04-10', createdAt: new Date().toISOString(),
  });
  const p2 = await db.patients.add({
    name: 'Ramesh Patel', age: 67, gender: 'male', phone: '9876543211', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'hi', familyId: 5,
    bloodGroup: 'O+', allergies: [], conditions: ['Type 2 Diabetes', 'Hypertension'],
    isElderly: true, emergencyContact: '9876500002',
    dateOfBirth: '1957-06-15', createdAt: new Date().toISOString(),
  });
  const p3 = await db.patients.add({
    name: 'Lakshmi Devi', age: 25, gender: 'female', phone: '9876543212', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'te', familyId: 4,
    bloodGroup: 'A+', allergies: [], conditions: [],
    isNewMother: true, emergencyContact: '9876500003',
    dateOfBirth: '1999-02-20', createdAt: new Date().toISOString(),
  });
  const p4 = await db.patients.add({
    name: 'Suresh Nair', age: 45, gender: 'male', phone: '9876543213', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'ml', familyId: 3,
    bloodGroup: 'AB+', allergies: ['Sulfa drugs'], conditions: ['Hypertension'],
    emergencyContact: '9876500004',
    dateOfBirth: '1979-11-05', createdAt: new Date().toISOString(),
  });
  const p5 = await db.patients.add({
    name: 'Meena Sharma', age: 8, gender: 'female', phone: '9876543214', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'hi', familyId: 1,
    bloodGroup: 'B+', allergies: [], conditions: [],
    isChild: true, emergencyContact: '9876500005',
    dateOfBirth: '2016-07-12', createdAt: new Date().toISOString(),
  });
  const p6 = await db.patients.add({
    name: 'Baby Arjun', age: 0, gender: 'male', phone: '9876543215', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'ta', familyId: 4,
    bloodGroup: '', allergies: [], conditions: [],
    isNewborn: true, motherPatientId: Number(p3),
    dateOfBirth: new Date(Date.now() - 15 * 24 * 3600000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  });
  const p7 = await db.patients.add({
    name: 'Gopi Krishnan', age: 72, gender: 'male', phone: '9876543216', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'ta', familyId: 6,
    bloodGroup: 'O-', allergies: [], conditions: ['COPD', 'Hypertension'],
    isElderly: true, emergencyContact: '9876500006',
    dateOfBirth: '1952-03-22', createdAt: new Date().toISOString(),
  });
  const p8 = await db.patients.add({
    name: 'Priya Mehta', age: 29, gender: 'female', phone: '9876543217', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'hi', familyId: 7,
    bloodGroup: 'A-', allergies: [], conditions: ['Maternal Health (T1)'],
    isPregnant: true, pregnancyWeeks: 12,
    emergencyContact: '9876500007',
    dateOfBirth: '1995-09-18', createdAt: new Date().toISOString(),
  });
  const p9 = await db.patients.add({
    name: 'Ramesh Kumar', age: 36, gender: 'male', phone: '9876543218', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'ta', familyId: 2,
    bloodGroup: 'B+', allergies: [], conditions: [],
    emergencyContact: '9876543210',
    dateOfBirth: '1988-01-14', createdAt: new Date().toISOString(),
  });
  const p10 = await db.patients.add({
    name: 'Sunil Sharma', age: 38, gender: 'male', phone: '9876543219', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'hi', familyId: 1,
    bloodGroup: 'O+', allergies: [], conditions: [],
    emergencyContact: '9876543214',
    dateOfBirth: '1986-04-10', createdAt: new Date().toISOString(),
  });
  const p11 = await db.patients.add({
    name: 'Sarita Patel', age: 62, gender: 'female', phone: '9876543220', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'hi', familyId: 5,
    bloodGroup: 'O+', allergies: [], conditions: ['Hypertension'],
    isElderly: true, emergencyContact: '9876543211',
    dateOfBirth: '1962-08-20', createdAt: new Date().toISOString(),
  });
  const p12 = await db.patients.add({
    name: 'Deepa Nair', age: 40, gender: 'female', phone: '9876543221', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'ml', familyId: 3,
    bloodGroup: 'A+', allergies: [], conditions: [],
    emergencyContact: '9876543213',
    dateOfBirth: '1984-05-15', createdAt: new Date().toISOString(),
  });
  const p13 = await db.patients.add({
    name: 'Kamala Krishnan', age: 68, gender: 'female', phone: '9876543222', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'ta', familyId: 6,
    bloodGroup: 'B+', allergies: [], conditions: ['Arthritis'],
    isElderly: true, emergencyContact: '9876543216',
    dateOfBirth: '1956-02-12', createdAt: new Date().toISOString(),
  });
  const p14 = await db.patients.add({
    name: 'Vikram Mehta', age: 32, gender: 'male', phone: '9876543223', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'hi', familyId: 7,
    bloodGroup: 'AB+', allergies: [], conditions: [],
    emergencyContact: '9876543217',
    dateOfBirth: '1992-12-05', createdAt: new Date().toISOString(),
  });
  const p15 = await db.patients.add({
    name: 'Basavanna Gowda', age: 70, gender: 'male', phone: '9876543224', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'kn', familyId: 8,
    bloodGroup: 'O+', allergies: [], conditions: ['Hypertension', 'Fall Risk'],
    isElderly: true, emergencyContact: '9876500008',
    dateOfBirth: '1954-03-10', createdAt: new Date().toISOString(),
  });
  const p16 = await db.patients.add({
    name: 'Ningamma Gowda', age: 65, gender: 'female', phone: '9876543225', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'kn', familyId: 8,
    bloodGroup: 'A+', allergies: [], conditions: ['Osteoarthritis'],
    isElderly: true, emergencyContact: '9876543224',
    dateOfBirth: '1959-07-22', createdAt: new Date().toISOString(),
  });
  const p17 = await db.patients.add({
    name: 'Sunita Das', age: 34, gender: 'female', phone: '9876543226', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'hi', familyId: 9,
    bloodGroup: 'B+', allergies: [], conditions: [],
    emergencyContact: '9876500009',
    dateOfBirth: '1990-09-02', createdAt: new Date().toISOString(),
  });
  const p18 = await db.patients.add({
    name: 'Amit Das', age: 10, gender: 'male', phone: '9876543227', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'hi', familyId: 9,
    bloodGroup: 'B+', allergies: [], conditions: [],
    isChild: true, emergencyContact: '9876543226',
    dateOfBirth: '2014-06-18', createdAt: new Date().toISOString(),
  });
  const p19 = await db.patients.add({
    name: 'Rahul Das', age: 6, gender: 'male', phone: '9876543228', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'hi', familyId: 9,
    bloodGroup: 'O+', allergies: [], conditions: [],
    isChild: true, emergencyContact: '9876543226',
    dateOfBirth: '2018-11-25', createdAt: new Date().toISOString(),
  });
  const p20 = await db.patients.add({
    name: 'Harish Joshi', age: 50, gender: 'male', phone: '9876543229', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'hi', familyId: 10,
    bloodGroup: 'AB+', allergies: [], conditions: ['Prediabetes'],
    emergencyContact: '9876500010',
    dateOfBirth: '1974-04-16', createdAt: new Date().toISOString(),
  });
  const p21 = await db.patients.add({
    name: 'Geeta Joshi', age: 46, gender: 'female', phone: '9876543230', pin: '1234',
    role: 'patient', village: 'Kodaikanal', language: 'hi', familyId: 10,
    bloodGroup: 'A+', allergies: [], conditions: ['Migraine'],
    emergencyContact: '9876543229',
    dateOfBirth: '1978-10-30', createdAt: new Date().toISOString(),
  });

  // 10 Families with complete connected demo data
  await db.families.bulkAdd([
    { familyName: 'Sharma Family (Family 01)', pin: '1234', village: 'Kodaikanal', memberIds: [Number(p5), Number(p10)] },
    { familyName: 'Kumar Family (Family 02)', pin: '1234', village: 'Kodaikanal', memberIds: [Number(p1), Number(p9)] },
    { familyName: 'Nair Family (Family 03)', pin: '1234', village: 'Kodaikanal', memberIds: [Number(p4), Number(p12)] },
    { familyName: 'Devi Family (Family 04)', pin: '1234', village: 'Kodaikanal', memberIds: [Number(p3), Number(p6)] },
    { familyName: 'Patel Family (Family 05)', pin: '1234', village: 'Kodaikanal', memberIds: [Number(p2), Number(p11)] },
    { familyName: 'Krishnan Family (Family 06)', pin: '1234', village: 'Kodaikanal', memberIds: [Number(p7), Number(p13)] },
    { familyName: 'Mehta Family (Family 07)', pin: '1234', village: 'Kodaikanal', memberIds: [Number(p8), Number(p14)] },
    { familyName: 'Gowda Family (Family 08)', pin: '1234', village: 'Kodaikanal', memberIds: [Number(p15), Number(p16)] },
    { familyName: 'Das Family (Family 09)', pin: '1234', village: 'Kodaikanal', memberIds: [Number(p17), Number(p18), Number(p19)] },
    { familyName: 'Joshi Family (Family 10)', pin: '1234', village: 'Kodaikanal', memberIds: [Number(p20), Number(p21)] },
  ]);

  // Doctors
  const d1 = await db.doctors.add({
    name: 'Dr. Arjun Mehta', specialty: 'General Physician', phone: '9800001111',
    pin: 'doc123', role: 'doctor', village: 'Kodaikanal',
    availability: 'Mon–Fri 9am–5pm', qualifications: 'MBBS, MD (General Medicine)',
  });
  await db.doctors.add({
    name: 'Dr. Kavitha Rao', specialty: 'Pediatrics & Gynecology', phone: '9800002222',
    pin: 'doc123', role: 'doctor', village: 'Kodaikanal',
    availability: 'Mon–Sat 10am–4pm', qualifications: 'MBBS, MS (OBG), DCH',
  });

  // Admin
  await db.admins.add({ name: 'Admin User', phone: '9900000001', pin: 'admin123', role: 'admin' });

  // Medicines for Anitha Kumar
  await db.medicines.bulkAdd([
    {
      patientId: Number(p1), name: 'Folic Acid 5mg', dose: '1 tablet', frequency: 'Once daily',
      times: ['08:00'], startDate: '2024-01-01', endDate: '2024-12-31',
      doctor: 'Dr. Kavitha Rao', instructions: 'Take with water after breakfast', status: 'active',
    },
    {
      patientId: Number(p1), name: 'Ferrous Sulphate 200mg', dose: '1 tablet', frequency: 'Twice daily',
      times: ['08:00', '20:00'], startDate: '2024-01-01', endDate: '2024-12-31',
      doctor: 'Dr. Kavitha Rao', instructions: 'Take after meals, avoid with tea/coffee', status: 'active',
    },
    // Medicines for Ramesh Patel
    {
      patientId: Number(p2), name: 'Metformin 500mg', dose: '1 tablet', frequency: 'Twice daily',
      times: ['07:30', '19:30'], startDate: '2023-06-01', endDate: '2025-06-01',
      doctor: 'Dr. Arjun Mehta', instructions: 'Take with food', status: 'active',
    },
    {
      patientId: Number(p2), name: 'Amlodipine 5mg', dose: '1 tablet', frequency: 'Once daily',
      times: ['08:00'], startDate: '2023-06-01', endDate: '2025-06-01',
      doctor: 'Dr. Arjun Mehta', instructions: 'Take in the morning', status: 'active',
    },
    {
      patientId: Number(p2), name: 'Aspirin 75mg', dose: '1 tablet', frequency: 'Once daily',
      times: ['09:00'], startDate: '2023-06-01', endDate: '2025-06-01',
      doctor: 'Dr. Arjun Mehta', instructions: 'Take after breakfast', status: 'active',
    },
  ]);

  // Health Tests for Ramesh Patel (blood sugar for last 7 days)
  const today = new Date();
  const sugarReadings = [162, 178, 145, 170, 155, 168, 180];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    await db.healthTests.add({
      patientId: Number(p2), type: 'blood_sugar', value: String(sugarReadings[i]),
      unit: 'mg/dL', date: d.toISOString().split('T')[0],
      notes: i === 6 ? 'Fasting value' : '',
    });
  }
  // BP readings for Ramesh
  const bpReadings = ['142/88', '138/85', '145/90', '140/86', '135/82', '148/92', '143/87'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    await db.healthTests.add({
      patientId: Number(p2), type: 'blood_pressure', value: bpReadings[i],
      unit: 'mmHg', date: d.toISOString().split('T')[0], notes: '',
    });
  }
  // Weight for Anitha Kumar
  await db.healthTests.add({ patientId: Number(p1), type: 'weight', value: '58', unit: 'kg', date: new Date().toISOString().split('T')[0], notes: '28 weeks pregnant' });
  await db.healthTests.add({ patientId: Number(p1), type: 'blood_pressure', value: '110/72', unit: 'mmHg', date: new Date().toISOString().split('T')[0], notes: '' });

  // Vaccinations
  await db.vaccinations.bulkAdd([
    { patientId: Number(p1), vaccineName: 'Td (Tetanus)', dueDate: '2024-03-01', givenDate: '2024-03-05', status: 'given', givenBy: 'Dr. Kavitha Rao' },
    { patientId: Number(p1), vaccineName: 'TT Booster', dueDate: '2024-08-01', status: 'due' },
    { patientId: Number(p5), vaccineName: 'MMR Booster', dueDate: '2024-10-01', status: 'due' },
    { patientId: Number(p5), vaccineName: 'DPT Booster', dueDate: '2024-01-15', givenDate: '2024-01-20', status: 'given', givenBy: 'ANM Radha' },
    { patientId: Number(p6), vaccineName: 'BCG', dueDate: new Date().toISOString().split('T')[0], givenDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], status: 'given', givenBy: 'Dr. Kavitha Rao' },
    { patientId: Number(p6), vaccineName: 'OPV-0', dueDate: new Date().toISOString().split('T')[0], givenDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], status: 'given', givenBy: 'Dr. Kavitha Rao' },
    { patientId: Number(p6), vaccineName: 'Hepatitis B (Birth dose)', dueDate: new Date().toISOString().split('T')[0], status: 'due' },
    { patientId: Number(p2), vaccineName: 'Influenza (Annual)', dueDate: '2024-11-01', status: 'due' },
  ]);

  // Appointments
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  await db.appointments.bulkAdd([
    { patientId: Number(p1), doctorId: Number(d1), date: nextWeek, reason: 'Antenatal checkup – 28 weeks', status: 'scheduled', notes: 'Bring previous reports' },
    { patientId: Number(p2), doctorId: Number(d1), date: nextMonth, reason: 'Diabetes & BP review', status: 'scheduled', notes: 'Bring blood sugar diary' },
    { patientId: Number(p6), doctorId: Number(d1), date: nextWeek, reason: 'Newborn follow-up – 2 weeks', status: 'scheduled', notes: '' },
  ]);

  // Medical Records (8 Detailed Demo Reports)
  await db.medicalRecords.bulkAdd([
    {
      patientId: Number(p2), type: 'report', date: '2024-09-01',
      data: { 
        reportName: 'Complete Blood Count (CBC)', 
        lab: 'Kodaikanal Diagnostics',
        status: 'ABNORMAL',
        parameters: [
          { name: 'Hemoglobin', result: '11.2', unit: 'g/dL', ref: '13.0-17.0', status: 'LOW' },
          { name: 'WBC Count', result: '8500', unit: 'cells/mcL', ref: '4000-11000', status: 'NORMAL' },
          { name: 'Platelets', result: '150,000', unit: 'cells/mcL', ref: '150,000-450,000', status: 'NORMAL' }
        ]
      },
      notes: 'DEMO REPORT — FICTIONAL DATA — NOT FOR CLINICAL USE. Mild anemia observed.',
    },
    {
      patientId: Number(p2), type: 'report', date: '2024-08-15',
      data: { 
        reportName: 'Fasting Blood Sugar (FBS)', 
        lab: 'CHC Palani',
        status: 'ABNORMAL',
        parameters: [
          { name: 'Fasting Glucose', result: '162', unit: 'mg/dL', ref: '70-100', status: 'HIGH' },
          { name: 'HbA1c', result: '7.8', unit: '%', ref: '<5.7', status: 'HIGH' }
        ]
      },
      notes: 'DEMO REPORT — FICTIONAL DATA — NOT FOR CLINICAL USE. Poor glycemic control.',
    },
    {
      patientId: Number(p2), type: 'report', date: '2024-07-10',
      data: { 
        reportName: 'Lipid Profile', 
        lab: 'Kodaikanal Diagnostics',
        status: 'ABNORMAL',
        parameters: [
          { name: 'Total Cholesterol', result: '240', unit: 'mg/dL', ref: '<200', status: 'HIGH' },
          { name: 'LDL (Bad)', result: '160', unit: 'mg/dL', ref: '<100', status: 'HIGH' },
          { name: 'HDL (Good)', result: '35', unit: 'mg/dL', ref: '>40', status: 'LOW' },
          { name: 'Triglycerides', result: '190', unit: 'mg/dL', ref: '<150', status: 'HIGH' }
        ]
      },
      notes: 'DEMO REPORT — FICTIONAL DATA — NOT FOR CLINICAL USE. High risk of cardiovascular event.',
    },
    {
      patientId: Number(p1), type: 'report', date: '2024-08-20',
      data: { 
        reportName: 'Thyroid Profile (TFT)', 
        lab: 'AIIMS Madurai',
        status: 'NORMAL',
        parameters: [
          { name: 'TSH', result: '2.5', unit: 'mIU/L', ref: '0.4-4.0', status: 'NORMAL' },
          { name: 'Free T3', result: '3.1', unit: 'pg/mL', ref: '2.3-4.2', status: 'NORMAL' },
          { name: 'Free T4', result: '1.2', unit: 'ng/dL', ref: '0.8-1.8', status: 'NORMAL' }
        ]
      },
      notes: 'DEMO REPORT — FICTIONAL DATA — NOT FOR CLINICAL USE. Normal thyroid function during pregnancy.',
    },
    {
      patientId: Number(p1), type: 'report', date: '2024-09-05',
      data: { 
        reportName: 'Maternal Ultrasound (T2)', 
        lab: 'Kodaikanal Hospital',
        status: 'NORMAL',
        parameters: [
          { name: 'Fetal Heart Rate', result: '140', unit: 'bpm', ref: '120-160', status: 'NORMAL' },
          { name: 'Amniotic Fluid', result: '12', unit: 'cm', ref: '8-18', status: 'NORMAL' },
          { name: 'Gestational Age', result: '28', unit: 'weeks', ref: '-', status: 'NORMAL' }
        ]
      },
      notes: 'DEMO REPORT — FICTIONAL DATA — NOT FOR CLINICAL USE. Healthy single intrauterine pregnancy.',
    },
    {
      patientId: Number(p4), type: 'report', date: '2024-08-01',
      data: { 
        reportName: 'Liver Function Test (LFT)', 
        lab: 'CHC Palani',
        status: 'NORMAL',
        parameters: [
          { name: 'ALT (SGPT)', result: '35', unit: 'U/L', ref: '7-56', status: 'NORMAL' },
          { name: 'AST (SGOT)', result: '30', unit: 'U/L', ref: '10-40', status: 'NORMAL' },
          { name: 'Total Bilirubin', result: '0.8', unit: 'mg/dL', ref: '0.1-1.2', status: 'NORMAL' }
        ]
      },
      notes: 'DEMO REPORT — FICTIONAL DATA — NOT FOR CLINICAL USE. No signs of liver damage.',
    },
    {
      patientId: Number(p7), type: 'report', date: '2024-06-15',
      data: { 
        reportName: 'Kidney Function Test (KFT)', 
        lab: 'Kodaikanal Diagnostics',
        status: 'ABNORMAL',
        parameters: [
          { name: 'Serum Creatinine', result: '1.4', unit: 'mg/dL', ref: '0.7-1.3', status: 'HIGH' },
          { name: 'Blood Urea Nitrogen', result: '25', unit: 'mg/dL', ref: '7-20', status: 'HIGH' },
          { name: 'eGFR', result: '55', unit: 'mL/min/1.73m2', ref: '>90', status: 'LOW' }
        ]
      },
      notes: 'DEMO REPORT — FICTIONAL DATA — NOT FOR CLINICAL USE. Stage 3 CKD suspected. Refer to nephrologist.',
    },
    {
      patientId: Number(p7), type: 'report', date: '2024-07-20',
      data: { 
        reportName: 'Chest X-Ray (PA View)', 
        lab: 'Kodaikanal Govt Hospital',
        status: 'ABNORMAL',
        parameters: [
          { name: 'Lung Fields', result: 'Hyperinflated', unit: '-', ref: 'Clear', status: 'ABNORMAL' },
          { name: 'Heart Size', result: 'Normal', unit: '-', ref: 'Normal', status: 'NORMAL' }
        ]
      },
      notes: 'DEMO REPORT — FICTIONAL DATA — NOT FOR CLINICAL USE. Findings consistent with COPD.',
    }
  ]);

  // Hospitals
  await db.hospitals.bulkAdd([
    {
      name: 'Kodaikanal Government Hospital', type: 'government_hospital', distance: 5,
      address: 'Hospital Road, Kodaikanal – 624101', phone: '04542-241200',
      services: ['Emergency', 'OPD', 'Maternity', 'Pediatrics', 'Laboratory', 'X-Ray', 'Pharmacy'],
      openHours: '24/7 (Emergency), OPD: 9am–4pm', hasEmergency: true, village: 'Kodaikanal',
      routeInstructions: 'From Kodaikanal town, take the main road towards Hospital Road. Turn right at the water tank, the hospital is 200m ahead on your left.',
    },
    {
      name: 'Community Health Centre (CHC) Palani', type: 'chc', distance: 25,
      address: 'Palani Main Road, Palani – 624601', phone: '04545-242100',
      services: ['OPD', 'Maternity', 'Laboratory', 'Pharmacy', 'Vaccination'],
      openHours: '8am–8pm daily', hasEmergency: false, village: 'Palani',
      routeInstructions: 'From Kodaikanal take bus towards Palani (Route 47). CHC is near Palani bus stand, 5 min walk.',
    },
    {
      name: 'AIIMS Madurai', type: 'aiims', distance: 120,
      address: 'Madurai – 625020', phone: '0452-2555555',
      services: ['Emergency', 'ICU', 'Surgery', 'Cardiology', 'Oncology', 'All specialties'],
      openHours: '24/7', hasEmergency: true, village: 'Madurai',
      routeInstructions: 'Take state highway NH-44 from Kodaikanal to Madurai. Approx 2.5 hrs by vehicle. Bus available from main bus stand.',
    },
  ]);

  // Transport
  await db.transport.bulkAdd([
    { type: 'ambulance', name: '108 Emergency Ambulance (Demo)', phone: '108', from: 'Kodaikanal', to: 'Kodaikanal Govt Hospital', estimatedMinutes: 20, available: true, notes: 'Demo – Real 108 available with network' },
    { type: 'auto', name: 'Auto Rickshaw – Murugan Autos', phone: '9876501234', from: 'Kodaikanal Village', to: 'Kodaikanal Hospital', estimatedMinutes: 15, available: true },
    { type: 'bus', name: 'TNSTC Bus Route 47', phone: '', from: 'Kodaikanal Bus Stand', to: 'Palani CHC', estimatedMinutes: 90, available: true, notes: 'Buses at 7am, 10am, 1pm, 4pm' },
    { type: 'community_vehicle', name: 'Panchayat Van (Demo)', phone: '9876509999', from: 'Kodaikanal Village', to: 'Any hospital', estimatedMinutes: 30, available: true, notes: 'Available on request, contact village office' },
  ]);

  // Schemes
  await db.schemes.bulkAdd([
    {
      name: 'Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
      shortName: 'Ayushman Bharat',
      description: 'World\'s largest health insurance scheme providing coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
      eligibility: 'Families identified as per SECC 2011 data, D1–D5 deprivation categories, occupational categories, automatically identified families.',
      benefits: 'Health cover of ₹5 lakh per family per year. Covers hospitalization, surgery, daycare, ICU, follow-up care. Cashless and paperless treatment at empanelled hospitals.',
      documents: ['Aadhar Card', 'PM-JAY Golden Card / Ayushman Card', 'Ration Card (if applicable)', 'Income Certificate (for some states)'],
      source: 'Ministry of Health & Family Welfare, Government of India',
      howToApply: 'Visit nearest Ayushman Bharat empanelled hospital or Common Service Centre (CSC). Check eligibility on pmjay.gov.in or call 14555.',
    },
    {
      name: 'Janani Suraksha Yojana (JSY)',
      shortName: 'JSY',
      description: 'A safe motherhood intervention under the National Health Mission promoting institutional deliveries among pregnant women from low-income households.',
      eligibility: 'All pregnant women from below poverty line (BPL) families, SC/ST women. All women in Low Performing States (LPS).',
      benefits: 'Cash assistance of ₹1400 (rural) / ₹1000 (urban) for institutional delivery. ASHA incentive for facilitating delivery. Free antenatal checkups.',
      documents: ['JSY Card', 'BPL Certificate / Ration Card', 'Aadhar Card', 'Bank Account Details'],
      source: 'National Health Mission (NHM), MoHFW',
      howToApply: 'Register at nearest Primary Health Centre (PHC) or Sub-Centre. Contact ASHA worker or ANM in your village.',
    },
    {
      name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
      shortName: 'PMMVY',
      description: 'Maternity benefit programme providing financial support to pregnant women and lactating mothers for the first living child.',
      eligibility: 'All pregnant women and lactating mothers for first living child, excluding those receiving similar benefits under any government scheme.',
      benefits: '₹5000 in three instalments: ₹1000 at early registration, ₹2000 after ANC checkup, ₹2000 after child birth registration and immunization.',
      documents: ['Mother-Child Protection Card (MCP)', 'Aadhar Card', 'Bank Account', 'Delivery Certificate (for 3rd installment)'],
      source: 'Ministry of Women and Child Development / MoHFW',
      howToApply: 'Apply at nearest Anganwadi Centre (AWC) or Health facility. Fill PMMVY form 1-A. Contact ASHA/ANM/AWW.',
    },
    {
      name: 'Universal Immunization Programme (UIP)',
      shortName: 'UIP',
      description: 'India\'s largest public health programme providing free vaccines to children and pregnant women across the country.',
      eligibility: 'All children (0–15 years) and pregnant women in India.',
      benefits: 'Free vaccines: BCG, OPV, DPT, Hepatitis B, Hib, IPV, Measles-Rubella, JE (selected districts), Td, Rotavirus (selected states). Free immunization sessions at health centres.',
      documents: ['No documents required. Mother-Child card for tracking.'],
      source: 'National Immunization Programme, MoHFW',
      howToApply: 'Visit nearest PHC, Sub-Centre, or Anganwadi on immunization days (usually Tuesday). Contact ASHA worker.',
    },
    {
      name: 'Ayushman Arogya Mandir (AAM)',
      shortName: 'Arogya Mandir',
      description: 'Upgraded Sub Health Centres and Primary Health Centres providing comprehensive primary health care including wellness services.',
      eligibility: 'All citizens, primarily for primary healthcare in rural and remote areas.',
      benefits: 'Free OPD services, essential medicines, basic diagnostics, maternal and child health services, non-communicable disease screening, wellness activities.',
      documents: ['Aadhar Card or any Photo ID (for registration)'],
      source: 'National Health Mission (NHM), MoHFW',
      howToApply: 'Visit nearest Ayushman Arogya Mandir (previously HWC/PHC). No pre-registration needed for most services.',
    },
  ]);

  // Notifications
  await db.notifications.bulkAdd([
    { userId: Number(p1), userRole: 'patient', message: 'Your TT Booster vaccination is due next week', type: 'vaccination', isRead: false, createdAt: new Date().toISOString() },
    { userId: Number(p1), userRole: 'patient', message: 'Antenatal checkup scheduled for next week with Dr. Arjun Mehta', type: 'appointment', isRead: false, createdAt: new Date().toISOString() },
    { userId: Number(p2), userRole: 'patient', message: 'Metformin 500mg is due at 7:30 PM today', type: 'medicine', isRead: false, createdAt: new Date().toISOString() },
    { userId: Number(p2), userRole: 'patient', message: 'Influenza vaccine is due in November', type: 'vaccination', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { userId: Number(p6), userRole: 'patient', message: 'Baby Arjun – Hepatitis B birth dose is due', type: 'vaccination', isRead: false, createdAt: new Date().toISOString() },
  ]);

  // Education content
  await db.education.bulkAdd([
    {
      title: 'Handwashing – Your First Defence', category: 'hygiene', tags: ['hands', 'wash', 'hygiene', 'prevention'],
      titleHi: 'हाथ धोना – आपकी पहली सुरक्षा', titleTa: 'கைகளை கழுவுவது – உங்கள் முதல் பாதுகாப்பு',
      content: 'Wash hands with soap for 20 seconds: before eating, after toilet, before cooking, after touching animals, after coughing/sneezing. Use clean water. Teach children this habit. It prevents diarrhoea, cholera, flu and many diseases.',
      contentHi: 'साबुन से 20 सेकंड हाथ धोएं: खाने से पहले, शौचालय के बाद, खाना बनाने से पहले, जानवरों को छूने के बाद, खांसने/छींकने के बाद।',
      contentTa: 'சாப்பிடுவதற்கு முன்பு, கழிப்பறைக்கு பிறகு, சமைப்பதற்கு முன்பு கைகளை 20 வினாடிகள் சோப்பு போட்டு கழுவுங்கள்.',
    },
    {
      title: 'Nutrition During Pregnancy', category: 'pregnancy', tags: ['pregnancy', 'nutrition', 'food', 'diet'],
      titleHi: 'गर्भावस्था में पोषण', titleTa: 'கர்ப்ப காலத்தில் ஊட்டச்சத்து',
      content: 'Eat iron-rich foods: green leafy vegetables, dal, eggs, meat. Take folic acid and iron tablets daily. Drink 8–10 glasses of clean water. Eat 3 meals + 2 healthy snacks per day. Avoid raw/uncooked meat, papaya, pineapple. Rest adequately. Attend all antenatal checkups.',
      contentHi: 'हरी सब्जियां, दाल, अंडे खाएं। हर दिन फोलिक एसिड और आयरन की गोलियां लें। 8-10 गिलास पानी पिएं।',
      contentTa: 'பச்சை காய்கறிகள், பயறு, முட்டை சாப்பிடுங்கள். தினமும் ஃபோலிக் அமிலம் மற்றும் இரும்பு மாத்திரைகள் எடுங்கள்.',
    },
    {
      title: 'Fever in Children – When to See a Doctor', category: 'child', tags: ['fever', 'child', 'temperature', 'emergency'],
      titleHi: 'बच्चों में बुखार – डॉक्टर कब दिखाएं', titleTa: 'குழந்தைகளுக்கு காய்ச்சல் – எப்போது மருத்துவரை காண வேண்டும்',
      content: 'Normal temperature: 98.6°F (37°C). Fever: above 100.4°F (38°C). See doctor immediately if: fever above 104°F, child below 3 months has any fever, fever with rash or stiff neck, seizures, difficulty breathing, won\'t eat/drink, very sleepy/hard to wake. Give paracetamol only as advised by doctor. Cool the child with wet cloth.',
      contentHi: 'यदि बच्चे का तापमान 104°F से ऊपर हो, या 3 महीने से छोटे बच्चे को बुखार हो, या बुखार के साथ दाने हों, तो तुरंत डॉक्टर को दिखाएं।',
      contentTa: 'காய்ச்சல் 104°F மேல் இருந்தால், 3 மாதத்திற்கு குறைந்த குழந்தைக்கு காய்ச்சல் இருந்தால் உடனே மருத்துவரை பாருங்கள்.',
    },
    {
      title: 'Managing Diabetes at Home', category: 'diabetes', tags: ['diabetes', 'sugar', 'blood', 'management'],
      titleHi: 'घर पर मधुमेह का प्रबंधन', titleTa: 'வீட்டில் நீரிழிவு நோயை நிர்வகிப்பது',
      content: 'Check blood sugar regularly as advised. Take medicines at the same time daily. Eat at regular times, avoid skipping meals. Reduce sugar, white rice, sweets. Walk 30 min daily if able. Check feet daily for cuts/sores. Drink plenty of water. Avoid smoking and alcohol. Attend regular checkups.',
      contentHi: 'नियमित रूप से शुगर चेक करें। दवाइयां समय पर लें। मीठा, चावल कम खाएं। रोज 30 मिनट चलें।',
      contentTa: 'தினமும் சர்க்கரை அளவை சரிபாருங்கள். மருந்துகளை சரியான நேரத்தில் எடுங்கள். இனிப்பு, வெள்ளை அரிசி குறைத்துக்கொள்ளுங்கள்.',
    },
    {
      title: 'Oral Rehydration Solution (ORS) for Diarrhoea', category: 'firstaid', tags: ['diarrhoea', 'dehydration', 'ors', 'first aid'],
      titleHi: 'दस्त के लिए ORS घोल', titleTa: 'வயிற்றுப்போக்குக்கு ORS கரைசல்',
      content: 'ORS replaces fluids lost in diarrhoea. Mix 1 ORS packet in 1 litre of clean boiled water. Give small sips frequently. Home ORS: 6 teaspoons sugar + 1/2 teaspoon salt in 1 litre water. Signs of dehydration: dry mouth, no urine, sunken eyes, very thirsty. See doctor if: blood in stool, vomiting continuously, very weak, infant below 6 months.',
      contentHi: 'एक ORS पैकेट को एक लीटर साफ पानी में मिलाएं। थोड़ा-थोड़ा पिलाते रहें। घर पर ORS: 6 चम्मच चीनी + आधा चम्मच नमक प्रति लीटर पानी।',
      contentTa: 'ஒரு ORS பாக்கெட்டை ஒரு லிட்டர் சுத்தமான நீரில் கலக்கவும். சிறிது சிறிதாக கொடுங்கள். வீட்டில் ORS: 6 தேக்கரண்டி சர்க்கரை + அரை தேக்கரண்டி உப்பு ஒரு லிட்டர் நீரில்.',
    },
    {
      title: 'Newborn Care – First 28 Days', category: 'newborn', tags: ['newborn', 'baby', 'care', 'breastfeed'],
      titleHi: 'नवजात शिशु देखभाल – पहले 28 दिन', titleTa: 'புதிதாக பிறந்த குழந்தை பராமரிப்பு – முதல் 28 நாட்கள்',
      content: 'Breastfeed within 1 hour of birth. Breastfeed exclusively for 6 months (no water, no formula). Feed 8–12 times a day. Keep baby warm, skin-to-skin contact with mother. Danger signs: not feeding, high fever, yellow skin (jaundice), difficulty breathing, umbilicus red/swollen/smelling. Immediate vaccination: BCG, OPV-0, Hep B.',
      contentHi: 'जन्म के 1 घंटे में स्तनपान शुरू करें। 6 महीने तक केवल स्तनपान। खतरे के संकेत: खाना न खाना, तेज बुखार, पीली त्वचा, सांस लेने में तकलीफ।',
      contentTa: 'பிறந்த 1 மணி நேரத்தில் தாய்ப்பால் தொடங்குங்கள். 6 மாதம் வரை தாய்ப்பால் மட்டுமே. ஆபத்து அறிகுறிகள்: உணவு உண்ணாமை, அதிக காய்ச்சல், மஞ்சள் நிற சருமம்.',
    },
    {
      title: 'Elderly Care – Preventing Falls', category: 'elderly', tags: ['elderly', 'fall', 'prevention', 'safety'],
      titleHi: 'बुजुर्ग देखभाल – गिरने से बचाव', titleTa: 'முதியோர் பராமரிப்பு – விழுவதை தடுப்பு',
      content: 'Falls are the leading cause of injury in elderly. Prevent falls: keep floors dry and clear, use non-slip mats, install grab bars near toilet, ensure good lighting, use walking stick if needed, regular eye checkups, review medicines (some cause dizziness). Exercise gently: walking, stretching. If fallen: do not move if head/neck injury suspected, call for help, check for confusion, check breathing.',
      contentHi: 'बुजुर्गों के लिए गिरना सबसे बड़ा खतरा है। फर्श सूखा रखें, रात में रोशनी रखें, लाठी का उपयोग करें।',
      contentTa: 'தரைத்தளம் வழவழப்பின்றி இருக்கட்டும். இரவில் விளக்கு வைத்திருங்கள். தடி பயன்படுத்துங்கள். கண் பரிசோதனை தொடர்ந்து செய்யுங்கள்.',
    },
    {
      title: 'Mental Wellness in Rural Areas', category: 'mental', tags: ['mental', 'stress', 'depression', 'wellness'],
      titleHi: 'ग्रामीण क्षेत्रों में मानसिक स्वास्थ्य', titleTa: 'கிராமப்புற மனநல ஆரோக்கியம்',
      content: 'Mental health is as important as physical health. Signs of depression: persistent sadness, loss of interest, sleep problems, fatigue, feeling worthless. It is not weakness. Talk to someone you trust. Medora AI can listen. Connect with family, friends, community. Physical activity helps. Sleep regularly. Limit alcohol. Seek professional help if symptoms persist. National Mental Health Helpline: 1800-599-0019 (toll free).',
      contentHi: 'मानसिक स्वास्थ्य उतना ही जरूरी है जितना शारीरिक। उदासी, नींद न आना, थकान महसूस हो तो किसी से बात करें। राष्ट्रीय हेल्पलाइन: 1800-599-0019',
      contentTa: 'மனநல ஆரோக்கியம் உடல் ஆரோக்கியம் போலவே முக்கியமானது. தொடர் சோர்வு, தூக்கமின்மை, ஆர்வமின்மை இருந்தால் யாரிடமாவது பேசுங்கள்.',
    },
  ]);

  // Doctor Summary (demo)
  await db.doctorSummaries.add({
    patientId: Number(p2),
    doctorId: Number(d1),
    complaint: 'Fatigue, increased thirst, frequent urination',
    symptoms: ['Fatigue', 'Polydipsia', 'Polyuria', 'Blurred vision'],
    duration: '2 weeks',
    history: 'Known case of Type 2 Diabetes (6 years) and Hypertension (4 years)',
    medicines: 'Metformin 500mg BD, Amlodipine 5mg OD, Aspirin 75mg OD',
    allergies: 'None known',
    vitals: 'BP: 138/85 mmHg, Blood Sugar (F): 162 mg/dL, Weight: 74 kg',
    observations: 'Blood sugar mildly elevated. BP slightly above target. HbA1c 7.8% – suggests suboptimal control.',
    warningSigns: ['Chest pain', 'Difficulty breathing', 'Sudden weakness', 'Loss of consciousness'],
    nextStep: 'Review HbA1c in 3 months. Consider Metformin dose adjustment. Dietary counselling. Ophthalmology referral.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    doctorNotes: 'Patient counselled on diet and exercise. Follow-up in 1 month.',
    agentType: 'diabetes',
  });

  console.log('[Medora] Database seeded successfully');
}

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
  status: 'PENDING' | 'READY_TO_SEND' | 'SENT_DEMO' | 'FAILED' | 'PENDING_OFFLINE' | 'SENT' | 'DELIVERED';
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
  action: 'CALL_INITIATED' | 'CALL_COMPLETED';
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

export interface CallSessionRecord {
  id?: number;
  callId: string;
  callerId: string;
  callerName: string;
  callerRole: 'patient' | 'doctor' | 'admin';
  receiverId: string;
  receiverName: string;
  receiverRole: 'patient' | 'doctor' | 'admin';
  status: 'CALLING' | 'RINGING' | 'ACCEPTED' | 'REJECTED' | 'CONNECTING' | 'CONNECTED' | 'ENDED' | 'FAILED' | 'MISSED';
  createdAt: string;
  acceptedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  emergency: boolean;
  emergencyType?: string;
  consultationId?: string;
  doctorNotes?: string;
}

export interface InAppMessageRecord {
  id?: number;
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor' | 'admin';
  receiverId: string;
  receiverName: string;
  originalLanguage: string;
  originalText: string;
  translatedText?: string;
  timestamp: string;
  status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'PENDING_OFFLINE';
  isEmergency?: boolean;
}

export interface OfflineOutboxItem {
  id?: number;
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor' | 'admin';
  receiverId: string;
  receiverName: string;
  originalLanguage: string;
  originalText: string;
  translatedText?: string;
  timestamp: string;
  status: 'PENDING_OFFLINE' | 'SENDING' | 'SENT' | 'FAILED';
  retryCount: number;
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
  callSessions!: Table<CallSessionRecord, number>;
  inAppMessages!: Table<InAppMessageRecord, number>;
  offlineOutboxMessages!: Table<OfflineOutboxItem, number>;

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
    this.version(5).stores({
      callSessions: '++id, callId, callerId, receiverId, status, createdAt, emergency',
      inAppMessages: '++id, messageId, conversationId, senderId, receiverId, status, timestamp',
      offlineOutboxMessages: '++id, messageId, receiverId, status, timestamp',
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
    name: 'Suresh Guptha', age: 45, gender: 'male', phone: '9876543213', pin: '1234',
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
    name: 'Deepa Guptha', age: 40, gender: 'female', phone: '9876543221', pin: '1234',
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
    { familyName: 'Guptha Family (Family 03)', pin: '1234', village: 'Kodaikanal', memberIds: [Number(p4), Number(p12)] },
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

  // Health Tests for Ramesh Patel (blood sugar and BP for last 30 days)
  const today = new Date();
  const baseSugars = [158, 162, 170, 165, 178, 155, 145, 150, 168, 172, 160, 158, 166, 175, 180, 162, 159, 164, 170, 168, 155, 152, 163, 171, 165, 158, 160, 167, 174, 162];
  const baseBps = [
    [140, 86], [142, 88], [138, 85], [145, 90], [140, 86], [135, 82], [148, 92], [143, 87],
    [139, 85], [141, 86], [137, 84], [144, 89], [142, 88], [136, 83], [146, 91], [140, 86],
    [138, 85], [143, 87], [145, 89], [139, 84], [136, 82], [141, 86], [144, 88], [140, 85],
    [137, 83], [142, 87], [146, 90], [139, 85], [138, 84], [140, 86]
  ];
  const basePulses = [72, 74, 76, 75, 78, 73, 71, 72, 75, 77, 74, 73, 76, 78, 80, 75, 74, 76, 77, 75, 72, 70, 74, 76, 75, 73, 74, 76, 77, 72];

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split('T')[0];

    // Sugar
    await db.healthTests.add({
      patientId: Number(p2),
      type: 'blood_sugar',
      value: String(baseSugars[i]),
      unit: 'mg/dL',
      date: dateStr,
      notes: i === 29 ? 'Fasting value' : '',
    });

    // BP
    const [sys, dia] = baseBps[i];
    await db.healthTests.add({
      patientId: Number(p2),
      type: 'blood_pressure',
      value: `${sys}/${dia}`,
      unit: 'mmHg',
      date: dateStr,
      notes: '',
    });

    // Pulse
    await db.healthTests.add({
      patientId: Number(p2),
      type: 'pulse',
      value: String(basePulses[i]),
      unit: 'bpm',
      date: dateStr,
      notes: '',
    });
  }

  // 30 days of BP and Weight for Anitha Kumar (patient 1)
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split('T')[0];
    const bpSys = 108 + (i % 6);
    const bpDia = 70 + (i % 5);
    const pulse = 76 + (i % 8);

    await db.healthTests.add({
      patientId: Number(p1),
      type: 'blood_pressure',
      value: `${bpSys}/${bpDia}`,
      unit: 'mmHg',
      date: dateStr,
      notes: '',
    });

    await db.healthTests.add({
      patientId: Number(p1),
      type: 'pulse',
      value: String(pulse),
      unit: 'bpm',
      date: dateStr,
      notes: '',
    });
  }
  // Weight, Temperature, and SpO2 for Anitha Kumar
  await db.healthTests.add({ patientId: Number(p1), type: 'weight', value: '58', unit: 'kg', date: new Date().toISOString().split('T')[0], notes: '28 weeks pregnant' });
  await db.healthTests.add({ patientId: Number(p1), type: 'blood_pressure', value: '110/72', unit: 'mmHg', date: new Date().toISOString().split('T')[0], notes: 'Normal resting BP' });
  await db.healthTests.add({ patientId: Number(p1), type: 'temperature', value: '98.4', unit: '°F', date: new Date().toISOString().split('T')[0], notes: 'Normal oral temperature' });
  await db.healthTests.add({ patientId: Number(p1), type: 'spo2', value: '99', unit: '%', date: new Date().toISOString().split('T')[0], notes: 'Room air saturation' });
  await db.healthTests.add({ patientId: Number(p1), type: 'blood_sugar', value: '95', unit: 'mg/dL', date: new Date().toISOString().split('T')[0], notes: 'Fasting glucose normal' });

  // Additional 5 Health Tests for Ramesh Patel (Blood Sugar, Blood Pressure, Weight, Temperature, Pulse, SpO2)
  await db.healthTests.add({ patientId: Number(p2), type: 'temperature', value: '98.6', unit: '°F', date: new Date().toISOString().split('T')[0], notes: 'Afebrile' });
  await db.healthTests.add({ patientId: Number(p2), type: 'spo2', value: '97', unit: '%', date: new Date().toISOString().split('T')[0], notes: 'Stable baseline' });
  await db.healthTests.add({ patientId: Number(p2), type: 'weight', value: '74', unit: 'kg', date: new Date().toISOString().split('T')[0], notes: 'Stable BMI 25.6' });
  await db.healthTests.add({ patientId: Number(p7), type: 'temperature', value: '98.2', unit: '°F', date: new Date().toISOString().split('T')[0], notes: 'Normal baseline' });
  await db.healthTests.add({ patientId: Number(p7), type: 'spo2', value: '94', unit: '%', date: new Date().toISOString().split('T')[0], notes: 'Room air (COPD baseline)' });

  // Vaccinations (8 Original + 3 More New Requested Datas = 11)
  await db.vaccinations.bulkAdd([
    { patientId: Number(p1), vaccineName: 'Td (Tetanus)', dueDate: '2024-03-01', givenDate: '2024-03-05', status: 'given', givenBy: 'Dr. Kavitha Rao' },
    { patientId: Number(p1), vaccineName: 'TT Booster', dueDate: '2024-08-01', status: 'due' },
    { patientId: Number(p5), vaccineName: 'MMR Booster', dueDate: '2024-10-01', status: 'due' },
    { patientId: Number(p5), vaccineName: 'DPT Booster', dueDate: '2024-01-15', givenDate: '2024-01-20', status: 'given', givenBy: 'ANM Radha' },
    { patientId: Number(p6), vaccineName: 'BCG', dueDate: new Date().toISOString().split('T')[0], givenDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], status: 'given', givenBy: 'Dr. Kavitha Rao' },
    { patientId: Number(p6), vaccineName: 'OPV-0', dueDate: new Date().toISOString().split('T')[0], givenDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], status: 'given', givenBy: 'Dr. Kavitha Rao' },
    { patientId: Number(p6), vaccineName: 'Hepatitis B (Birth dose)', dueDate: new Date().toISOString().split('T')[0], status: 'given', givenDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], givenBy: 'Dr. Kavitha Rao' },
    { patientId: Number(p2), vaccineName: 'Influenza (Annual)', dueDate: '2024-11-01', status: 'due' },
    // 3 More Requested Vaccination Datas:
    { patientId: Number(p6), vaccineName: 'Pentavalent-1 (DPT+HepB+Hib)', dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], status: 'due' },
    { patientId: Number(p6), vaccineName: 'Rotavirus Vaccine Dose 1', dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], status: 'due' },
    { patientId: Number(p15), vaccineName: 'Pneumococcal (PCV) Booster', dueDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0], status: 'due' },
  ]);

  // Appointments
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  await db.appointments.bulkAdd([
    { patientId: Number(p1), doctorId: Number(d1), date: nextWeek, reason: 'Antenatal checkup – 28 weeks', status: 'scheduled', notes: 'Bring previous reports' },
    { patientId: Number(p2), doctorId: Number(d1), date: nextMonth, reason: 'Diabetes & BP review', status: 'scheduled', notes: 'Bring blood sugar diary' },
    { patientId: Number(p6), doctorId: Number(d1), date: nextWeek, reason: 'Newborn follow-up – 2 weeks', status: 'scheduled', notes: '' },
  ]);

  // Medical Records (Reports, Consultations, Vitals & Prescriptions)
  await db.medicalRecords.bulkAdd([
    // 1. Diagnostic Reports
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
    },

    // 2. Doctor Consultations
    {
      patientId: Number(p1), type: 'consultation', date: '2024-09-08',
      data: {
        reportName: 'Antenatal Clinical Evaluation (28 Weeks)',
        doctorName: 'Dr. Kavitha Rao, MBBS, MS (OBG)',
        specialty: 'Obstetrics & Maternal Health',
        facility: 'Kodaikanal Government Hospital',
        assessment: 'Third trimester singleton pregnancy with mild nutritional anemia. Fetal movements normal. Fundal height 28 cm.',
        clinicalAdvice: 'Continue Iron and Folic Acid tablets daily with water. Maintain high protein diet with ragi, pulses, and milk. Review at 32 weeks for growth ultrasound.'
      },
      notes: 'Third-trimester clinical checkup completed. Danger signs discussed: blurred vision, heavy vaginal bleeding, abdominal pain.',
    },
    {
      patientId: Number(p2), type: 'consultation', date: '2024-08-28',
      data: {
        reportName: 'Metabolic & Cardiovascular Review',
        doctorName: 'Dr. Arjun Mehta, MBBS, MD (General Medicine)',
        specialty: 'Internal Medicine',
        facility: 'Kodaikanal Government Hospital',
        assessment: 'Type 2 Diabetes Mellitus with sub-optimal glycemic control (HbA1c 7.8%) and Grade 1 Hypertension (138/85 mmHg).',
        clinicalAdvice: 'Continue Metformin 500mg BD after meals. Maintain daily 30-min brisk walk. Inspect feet daily for micro-abrasions. Recheck fasting blood glucose in 4 weeks.'
      },
      notes: 'Chronic disease management consultation. Patient counselled on rural diet glycemic index and salt restriction.',
    },
    {
      patientId: Number(p4), type: 'consultation', date: '2024-08-10',
      data: {
        reportName: 'Primary Hypertension & Cardiovascular Assessment',
        doctorName: 'Dr. Suresh Balakrishnan, MBBS, MD, DM (Cardiology)',
        specialty: 'Cardiology',
        facility: 'CHC Palani & Mobile Clinic',
        assessment: 'Stage 1 Essential Hypertension. Resting BP 142/90 mmHg. Heart sounds normal (S1, S2 audible, no murmurs).',
        clinicalAdvice: 'Prescribed Telmisartan 40mg once daily in morning. Restrict dietary sodium. Routine ECG scheduled.'
      },
      notes: 'Consultation conducted at rural tele-clinic. Follow up in 3 months with home blood pressure logs.',
    },
    {
      patientId: Number(p7), type: 'consultation', date: '2024-07-25',
      data: {
        reportName: 'Pulmonary & Chronic Airway Follow-up',
        doctorName: 'Dr. Rajeshwari Patel, MBBS, MD (Pulmonology)',
        specialty: 'Pulmonary Medicine',
        facility: 'Kodaikanal High Altitude Health Centre',
        assessment: 'Chronic Obstructive Pulmonary Disease (COPD) Grade 2. Exertional breathlessness without acute exacerbation. SpO2 94%.',
        clinicalAdvice: 'Use Budesonide/Formoterol dry powder inhaler 2 puffs twice daily with water mouth rinse. Avoid firewood smoke.'
      },
      notes: 'Pulmonary function consultation. Demonstrated correct inhaler technique to patient and family caregiver.',
    },

    // 3. Vitals Records
    {
      patientId: Number(p1), type: 'vitals', date: '2024-09-12',
      data: {
        reportName: 'Comprehensive Maternal Vitals Panel',
        bloodPressure: '110/72 mmHg',
        pulseRate: '78 bpm',
        temperature: '98.4 °F',
        spo2: '99 %',
        weight: '58 kg',
        fetalHeartRate: '142 bpm',
        respiratoryRate: '18 /min',
        recordedBy: 'Sister Mary (Staff Nurse, Kodaikanal PHC)'
      },
      notes: 'Stable maternal hemodynamics. Normal gestational blood pressure and pulse rate.',
    },
    {
      patientId: Number(p2), type: 'vitals', date: '2024-09-10',
      data: {
        reportName: 'Chronic Metabolic Vitals Sheet',
        bloodPressure: '138/85 mmHg',
        pulseRate: '74 bpm',
        fastingBloodSugar: '158 mg/dL',
        postPrandialSugar: '190 mg/dL',
        temperature: '98.6 °F',
        spo2: '97 %',
        weight: '74 kg',
        recordedBy: 'ASHA Worker Sunita Devi'
      },
      notes: 'Home vitals visit checkup. Blood pressure controlled on Amlodipine; fasting blood glucose mildly high.',
    },
    {
      patientId: Number(p4), type: 'vitals', date: '2024-08-25',
      data: {
        reportName: 'Routine Adult Vitals Log',
        bloodPressure: '130/84 mmHg',
        pulseRate: '76 bpm',
        temperature: '98.6 °F',
        spo2: '98 %',
        weight: '68 kg',
        recordedBy: 'Guptha Family Health Diary'
      },
      notes: 'Guptha family monthly health check. Blood pressure improving with medication compliance.',
    },
    {
      patientId: Number(p7), type: 'vitals', date: '2024-07-28',
      data: {
        reportName: 'Geriatric Respiratory Vitals Log',
        bloodPressure: '140/86 mmHg',
        pulseRate: '82 bpm',
        temperature: '98.2 °F',
        spo2: '94 %',
        respiratoryRate: '20 /min',
        weight: '62 kg',
        recordedBy: 'Community Health Nurse'
      },
      notes: 'Geriatric vitals check. SpO2 94% acceptable for COPD baseline; advised to use inhaler on time.',
    },

    // 4. Prescriptions
    {
      patientId: Number(p1), type: 'prescription', date: '2024-09-08',
      data: {
        reportName: 'Antenatal Medication Prescription Slip',
        doctorName: 'Dr. Kavitha Rao, MBBS, MS (OBG)',
        regNumber: 'TN-MC-44912',
        diagnosis: 'Intrauterine Pregnancy (28 Weeks), Mild Nutritional Anemia',
        medicationsList: [
          { name: 'Tab. Folic Acid 5mg', dose: '1 tablet', timing: 'Once daily (08:00 AM)', duration: 'Till delivery', instructions: 'Take with glass of water after breakfast' },
          { name: 'Tab. Ferrous Sulphate 200mg', dose: '1 tablet', timing: 'Twice daily (08:00 AM, 08:00 PM)', duration: 'Till delivery', instructions: 'Do not take with milk, tea or coffee' },
          { name: 'Tab. Calcium Carbonate 500mg', dose: '1 tablet', timing: 'Once daily (01:00 PM)', duration: 'Till delivery', instructions: 'Take with afternoon meal' }
        ]
      },
      notes: 'Maternal prescription valid for 30 days. Medicines dispensed free of cost at Kodaikanal PHC pharmacy.',
    },
    {
      patientId: Number(p2), type: 'prescription', date: '2024-08-28',
      data: {
        reportName: 'Diabetic & Cardiac Prescription Slip',
        doctorName: 'Dr. Arjun Mehta, MBBS, MD (General Medicine)',
        regNumber: 'TN-MC-32115',
        diagnosis: 'Type 2 Diabetes Mellitus, Essential Hypertension',
        medicationsList: [
          { name: 'Tab. Metformin 500mg', dose: '1 tablet', timing: 'Twice daily (07:30 AM, 07:30 PM)', duration: '90 days', instructions: 'Take with or immediately after food' },
          { name: 'Tab. Amlodipine 5mg', dose: '1 tablet', timing: 'Once daily (08:00 AM)', duration: '90 days', instructions: 'Take in morning regularly' },
          { name: 'Tab. Aspirin 75mg (Enteric Coated)', dose: '1 tablet', timing: 'Once daily (09:00 AM)', duration: '90 days', instructions: 'Take after breakfast' }
        ]
      },
      notes: 'Chronic prescription renewal. Next clinical titration review due in 90 days with fresh HbA1c report.',
    },
    {
      patientId: Number(p4), type: 'prescription', date: '2024-08-10',
      data: {
        reportName: 'Cardiovascular Antihypertensive Prescription',
        doctorName: 'Dr. Suresh Balakrishnan, MBBS, MD, DM',
        regNumber: 'TN-MC-18754',
        diagnosis: 'Essential Hypertension Grade 1',
        medicationsList: [
          { name: 'Tab. Telmisartan 40mg', dose: '1 tablet', timing: 'Once daily (08:00 AM)', duration: '60 days', instructions: 'Take morning before food with water' }
        ]
      },
      notes: 'Prescription for Suresh Guptha. Reduce table salt consumption and maintain daily walking.',
    },
    {
      patientId: Number(p7), type: 'prescription', date: '2024-07-25',
      data: {
        reportName: 'Chronic Respiratory Inhalation Prescription',
        doctorName: 'Dr. Rajeshwari Patel, MBBS, MD (Pulmonology)',
        regNumber: 'TN-MC-51092',
        diagnosis: 'Chronic Obstructive Pulmonary Disease (COPD)',
        medicationsList: [
          { name: 'Budesonide 200mcg + Formoterol 6mcg DPI', dose: '2 puffs', timing: 'Twice daily (08:00 AM, 08:00 PM)', duration: '60 days', instructions: 'Inhale using dry powder inhaler; rinse mouth with water after use' },
          { name: 'Tab. Levocetirizine 5mg', dose: '1 tablet', timing: 'At night (SOS)', duration: 'As needed', instructions: 'Take for night-time coughing or allergic rhinitis' }
        ]
      },
      notes: 'Prescription for Gopi Krishnan. Always carry emergency bronchodilator when stepping outdoors.',
    }
  ]);

  // Hospitals (3 Original + 5 New Requested Healthcare Datas = 8 Facilities)
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
    // 5 More Requested Healthcare Datas:
    {
      name: 'Kodaikanal Primary Health Centre (PHC) Vilpatti', type: 'phc', distance: 8,
      address: 'Vilpatti Main Village Road, Kodaikanal – 624103', phone: '04542-242330',
      services: ['General OPD', 'Maternal Antenatal Clinic', 'Immunization', 'Essential Drug Dispensing', 'Basic Lab Tests'],
      openHours: '9:00 AM – 4:00 PM (Mon-Sat)', hasEmergency: false, village: 'Vilpatti',
      routeInstructions: 'Take Vilpatti village road 8 km north of Kodaikanal bus stand. Mini bus available every 45 mins.',
    },
    {
      name: 'High Altitude Community Health Sub-centre Poombarai', type: 'phc', distance: 18,
      address: 'Terrace Valley Road, Poombarai – 624103', phone: '04542-244110',
      services: ['First Aid', 'ASHA Base Station', 'Child Vaccination', 'Maternal Blood Pressure Checks', 'ORS Distribution'],
      openHours: '8:30 AM – 3:30 PM', hasEmergency: false, village: 'Poombarai',
      routeInstructions: 'West hill route towards Poombarai garlic terrace farms. Located adjacent to Village Panchayat Office.',
    },
    {
      name: 'Christian Fellowship Hospital (CFH) Oddanchatram', type: 'private', distance: 48,
      address: 'CFH Campus, Oddanchatram – 624619', phone: '04553-240222',
      services: ['24/7 Trauma Emergency', 'Emergency Surgery', 'Neonatal ICU', 'Cardiology OPD', 'Dialysis', 'Blood Bank'],
      openHours: '24/7 Emergency & Inpatient Care', hasEmergency: true, village: 'Oddanchatram',
      routeInstructions: 'Descend via Ghat Road towards Palani-Dindigul highway. Direct ambulance and taxi connectivity.',
    },
    {
      name: 'Dindigul District Headquarter Government Hospital', type: 'government_hospital', distance: 92,
      address: 'Collectorate Road, Dindigul – 624004', phone: '0451-2423400',
      services: ['Tertiary Emergency', 'Surgical Specialties', 'CT & MRI Scan', 'Comprehensive Burn Care', 'Govt PM-JAY Cashless'],
      openHours: '24/7 Emergency, OPD: 8:00 AM – 2:00 PM', hasEmergency: true, village: 'Dindigul',
      routeInstructions: 'Main District Headquarters Hospital on Dindigul Central Road. Accessible via express hill buses.',
    },
    {
      name: 'Kodaikanal Mobile Rural Tele-Health Medical Unit (MMU)', type: 'chc', distance: 2,
      address: 'Rotational Hill Village Stops, Kodaikanal Block', phone: '9800008800',
      services: ['Mobile Teleconsultation', 'Point-of-Care Vitals', 'Blood Glucose & Hb Screening', 'Free Chronic Medication Dispensing'],
      openHours: 'Mon-Fri 10:00 AM – 3:00 PM (Weekly village rotation)', hasEmergency: false, village: 'Kodaikanal Rural Blocks',
      routeInstructions: 'Visits village community hall every Wednesday and Friday. Contact Village Health Nurse (VHN) for stop timing.',
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
    {
      name: 'Rashtriya Bal Swasthya Karyakram (RBSK)',
      shortName: 'RBSK Child Health',
      description: 'Systemic child health screening and early intervention services for 4 Ds: Defects at birth, Diseases, Deficiencies, and Development delays including disability.',
      eligibility: 'All children from birth to 18 years enrolled in Anganwadi centres and Government/Aided schools.',
      benefits: 'Free screening by dedicated Mobile Health Teams. Free medical, surgical, and therapeutic management at District Early Intervention Centres (DEIC).',
      documents: ['Birth Certificate or Anganwadi/School ID', 'Aadhar Card of Parent'],
      source: 'National Health Mission (NHM), MoHFW',
      howToApply: 'Screenings conducted at Anganwadi and schools twice a year. Parents can also request referral from village ANM or ASHA.',
    },
    {
      name: 'Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)',
      shortName: 'PMSMA Fixed-Day ANC',
      description: 'Assures comprehensive, quality antenatal care to all pregnant women on the 9th of every month across all public health facilities.',
      eligibility: 'All pregnant women in their 2nd and 3rd trimesters.',
      benefits: 'Free consultation with OBGYN specialists or medical officers. Free ultrasound, Hb, blood sugar, and urine tests. Identification and colored tagging of high-risk pregnancies (HRP).',
      documents: ['Mother and Child Protection (MCP) Card', 'Aadhar Card'],
      source: 'MoHFW, Government of India',
      howToApply: 'Visit nearest PHC, CHC, or District Hospital on the 9th day of any month.',
    },
    {
      name: 'Nikshay Poshan Yojana (NPY)',
      shortName: 'Nikshay Poshan',
      description: 'Centrally sponsored nutritional support scheme for all notified tuberculosis (TB) patients.',
      eligibility: 'All registered TB patients on treatment in public or private sectors under Ni-kshay platform.',
      benefits: 'Direct Benefit Transfer (DBT) of ₹500 per month directly into bank account for the full duration of anti-TB treatment.',
      documents: ['Ni-kshay Registration ID', 'Aadhar Card', 'Bank Passbook / Account details'],
      source: 'Central TB Division, National Tuberculosis Elimination Programme (NTEP)',
      howToApply: 'Automatically enrolled by Senior Treatment Supervisor (STS) or DOTS provider upon TB notification.',
    },
    {
      name: 'National Leprosy Eradication Programme (NLEP)',
      shortName: 'Leprosy Free India',
      description: 'Comprehensive public health program providing free Multi-Drug Therapy (MDT) and reconstructive surgery for leprosy.',
      eligibility: 'Any person with hypopigmented skin patches with loss of sensation, numbness, or nerve thickening.',
      benefits: '100% free MDT blister packs, free ulcer dressing kits, micro-cellular rubber (MCR) protective footwear, and financial incentive of ₹8,000 for reconstructive surgery.',
      documents: ['Patient ID / OPD Card'],
      source: 'Directorate General of Health Services (DGHS), MoHFW',
      howToApply: 'Visit nearest PHC or Government Hospital dermatology/leprosy clinic.',
    },
    {
      name: 'National Vector Borne Disease Control Programme (NVBDCP)',
      shortName: 'Vector Borne Disease Care',
      description: 'Prevention and free clinical management of Malaria, Dengue, Chikungunya, Japanese Encephalitis, and Kala-azar.',
      eligibility: 'All rural citizens presenting with acute fever, chills, or hemorrhagic symptoms.',
      benefits: 'Free rapid diagnostic testing (RDT), free microscopic blood smears, free Artemisinin-based combination therapy (ACT), and free distribution of Long Lasting Insecticidal Nets (LLINs).',
      documents: ['No identity documents mandatory for emergency diagnosis and treatment'],
      source: 'National Center for Vector Borne Diseases Control (NCVBDC)',
      howToApply: 'Contact village ASHA worker or visit nearest PHC immediately upon onset of fever.',
    },
    {
      name: 'National Programme for Health Care of the Elderly (NPHCE)',
      shortName: 'Elderly Healthcare NPHCE',
      description: 'Dedicated healthcare delivery system designed specifically for the medical needs of senior citizens (60+ years).',
      eligibility: 'All senior citizens aged 60 years and above.',
      benefits: 'Dedicated weekly geriatric clinics at PHCs, bi-weekly geriatric OPD at CHCs, 10-bed geriatric wards at District Hospitals, free assistive mobility aids (walking sticks, hearing aids).',
      documents: ['Senior Citizen Age Proof (Aadhar, Voter Card, or Birth Certificate)'],
      source: 'Ministry of Health & Family Welfare, Government of India',
      howToApply: 'Walk into the Geriatric Registration Counter at any Sub-District or District Government Hospital.',
    },
    {
      name: 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)',
      shortName: 'Janaushadhi Generic Medicine',
      description: 'Campaign to make quality generic medicines, surgical items, and nutraceuticals available at affordable prices (50% to 90% cheaper than branded equivalents).',
      eligibility: 'Open to all citizens without income or caste restrictions.',
      benefits: 'Access to over 1,800 essential medicines and 280 surgical consumables manufactured to strict WHO-GMP standards at a fraction of market retail costs.',
      documents: ['Doctor Prescription (for prescription-only drugs)'],
      source: 'Pharmaceuticals & Medical Devices Bureau of India (PMBI)',
      howToApply: 'Visit any of the 10,000+ Jan Aushadhi Kendras located near government hospitals and bus stands.',
    },
    {
      name: 'Chief Minister Comprehensive Health Insurance Scheme (CMCHIS)',
      shortName: 'State Health Cover (CMCHIS)',
      description: 'State government health insurance providing comprehensive cashless hospitalization to low-income families.',
      eligibility: 'Families with annual income less than ₹1,20,000 enrolled in state ration cards.',
      benefits: 'Cashless hospital treatment up to ₹5 Lakhs per family per year across 1,027 empanelled government and private medical centres.',
      documents: ['Smart Ration Card', 'Income Certificate', 'Aadhar Card of Family Head'],
      source: 'State Department of Health and Family Welfare',
      howToApply: 'Enroll at District Collectorate or Taluk Revenue Office CMCHIS Kiosk.',
    },
    {
      name: 'Tele-MANAS (National Tele Mental Health Programme)',
      shortName: 'Tele-MANAS Mental Health',
      description: '24x7 toll-free digital tele-mental health service delivering compassionate, confidential psychosocial counseling and psychiatric triage.',
      eligibility: 'Any individual or family member experiencing stress, anxiety, depression, insomnia, or grief.',
      benefits: 'Instant free counseling in regional mother tongues via toll-free number 14416 / 1800-891-4416. Seamless referral to District Mental Health Programme (DMHP) specialists.',
      documents: ['None required — 100% anonymous and free telephone helpline'],
      source: 'NIMHANS & Ministry of Health and Family Welfare',
      howToApply: 'Dial 14416 from any mobile or landline phone anytime 24 hours a day.',
    },
    {
      name: 'National Oral Health Programme (NOHP)',
      shortName: 'Oral Health Care',
      description: 'Initiative to improve oral and dental hygiene, prevent oral cancers, and provide dental care at secondary public facilities.',
      eligibility: 'All citizens, school children, and tobacco users.',
      benefits: 'Free dental checkup, cavity fillings, tooth extractions, scaling, and oral pre-cancer screening by dental surgeons at CHC and District hospitals.',
      documents: ['General OPD registration ticket'],
      source: 'National Oral Health Division, MoHFW',
      howToApply: 'Visit Dental OPD at the nearest Community Health Centre or District Hospital.',
    },
    {
      name: 'Mission Indradhanush (Intensified Mission Indradhanush - IMI)',
      shortName: 'Mission Indradhanush',
      description: 'Special nationwide catch-up drive to ensure 100% full immunization coverage for children and pregnant women missed during routine drives.',
      eligibility: 'Partially vaccinated or unvaccinated children up to 5 years and pregnant women.',
      benefits: 'Intensive door-to-door tracking by ASHA workers to administer missed life-saving vaccines (BCG, Polio, Pentavalent, Rotavirus, MR) free of cost.',
      documents: ['Mother-Child Protection Card (if available)'],
      source: 'Immunization Division, MoHFW',
      howToApply: 'Participate in village immunization camps or alert your local ASHA worker.',
    },
  ]);

  // Notifications (24 Detailed Datas on Recent Health Activity)
  await db.notifications.bulkAdd([
    { userId: Number(p1), userRole: 'patient', message: 'Blood pressure reading recorded at home: 110/72 mmHg (Normal resting range)', type: 'general', isRead: false, createdAt: new Date(Date.now() - 1 * 3600000).toISOString() },
    { userId: Number(p1), userRole: 'patient', message: 'Maternal ultrasound anomaly scan completed with normal cardiac activity (140 bpm)', type: 'report', isRead: false, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
    { userId: Number(p1), userRole: 'patient', message: 'Folic acid 5mg and Ferrous Sulphate morning doses confirmed taken on schedule', type: 'medicine', isRead: true, createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
    { userId: Number(p1), userRole: 'patient', message: 'Your TT Booster vaccination is due next week at Kodaikanal PHC', type: 'vaccination', isRead: false, createdAt: new Date(Date.now() - 12 * 3600000).toISOString() },
    { userId: Number(p2), userRole: 'patient', message: 'Fasting blood glucose logged: 158 mg/dL — lifestyle dietary guidance prompted', type: 'general', isRead: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { userId: Number(p2), userRole: 'patient', message: 'Morning 30-minute brisk walk completed around village farm compound', type: 'general', isRead: true, createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
    { userId: Number(p2), userRole: 'patient', message: 'Metformin 500mg taken after dinner on schedule', type: 'medicine', isRead: true, createdAt: new Date(Date.now() - 14 * 3600000).toISOString() },
    { userId: Number(p2), userRole: 'patient', message: 'Annual Influenza booster vaccine is due for senior health protection', type: 'vaccination', isRead: false, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
    { userId: Number(p4), userRole: 'patient', message: 'Cardiovascular risk screening consultation completed with Dr. Suresh Balakrishnan for Suresh Guptha', type: 'appointment', isRead: false, createdAt: new Date(Date.now() - 8 * 3600000).toISOString() },
    { userId: Number(p4), userRole: 'patient', message: 'Guptha family monthly health check: blood pressure stable at 130/84 mmHg', type: 'general', isRead: true, createdAt: new Date(Date.now() - 16 * 3600000).toISOString() },
    { userId: Number(p6), userRole: 'patient', message: 'Baby Arjun 2-week neonatal growth check: gained 200g with strong feeding reflexes', type: 'newborn', isRead: false, createdAt: new Date(Date.now() - 10 * 3600000).toISOString() },
    { userId: Number(p6), userRole: 'patient', message: 'Pentavalent-1 and Rotavirus-1 vaccination session scheduled for Baby Arjun', type: 'vaccination', isRead: false, createdAt: new Date(Date.now() - 18 * 3600000).toISOString() },
    { userId: Number(p7), userRole: 'patient', message: 'SpO2 pulse oximetry recorded: 94% on room air (Stable chronic COPD baseline)', type: 'general', isRead: true, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    { userId: Number(p7), userRole: 'patient', message: 'Budesonide/Formoterol dry powder inhaler technique verified with ASHA healthcare worker', type: 'medicine', isRead: false, createdAt: new Date(Date.now() - 20 * 3600000).toISOString() },
    // 10 Additional Requested Datas on Recent Health Activity:
    { userId: Number(p1), userRole: 'patient', message: 'Maternal dietary nutrition logged: added Ragi porridge & Drumstick leaves for iron boost', type: 'general', isRead: false, createdAt: new Date(Date.now() - 7 * 3600000).toISOString() },
    { userId: Number(p1), userRole: 'patient', message: 'Weekly weight check logged: 58.5 kg (steady healthy gestational weight gain)', type: 'general', isRead: true, createdAt: new Date(Date.now() - 15 * 3600000).toISOString() },
    { userId: Number(p2), userRole: 'patient', message: 'Post-prandial 2-hour blood sugar checked: 142 mg/dL (Within post-meal target)', type: 'general', isRead: true, createdAt: new Date(Date.now() - 9 * 3600000).toISOString() },
    { userId: Number(p2), userRole: 'patient', message: 'Evening diabetic foot inspection completed: skin intact, no redness or ulcers detected', type: 'general', isRead: false, createdAt: new Date(Date.now() - 22 * 3600000).toISOString() },
    { userId: Number(p3), userRole: 'patient', message: 'Kavitha Devi antenatal checkup scheduled at Vilpatti Sub-centre for next Tuesday', type: 'appointment', isRead: false, createdAt: new Date(Date.now() - 11 * 3600000).toISOString() },
    { userId: Number(p4), userRole: 'patient', message: 'Suresh Guptha morning walk: 4,200 steps tracked around village farm perimeter', type: 'general', isRead: true, createdAt: new Date(Date.now() - 13 * 3600000).toISOString() },
    { userId: Number(p5), userRole: 'patient', message: 'Meena Guptha child growth screening: height 108cm, weight 18.2kg (normal WHO percentiles)', type: 'general', isRead: false, createdAt: new Date(Date.now() - 17 * 3600000).toISOString() },
    { userId: Number(p6), userRole: 'patient', message: 'Baby Arjun exclusive breastfeeding logged: 9 feeds in past 24 hours with healthy diaper count', type: 'newborn', isRead: true, createdAt: new Date(Date.now() - 21 * 3600000).toISOString() },
    { userId: Number(p7), userRole: 'patient', message: 'Gopi Krishnan peak flow rate recorded: 320 L/min (In personal green safety zone)', type: 'general', isRead: false, createdAt: new Date(Date.now() - 25 * 3600000).toISOString() },
    { userId: Number(p7), userRole: 'patient', message: 'Warm steam inhalation completed for morning airway clearance', type: 'general', isRead: true, createdAt: new Date(Date.now() - 28 * 3600000).toISOString() },
  ]);

  // Education content (including 5 Specific Datas on Diabetes Care)
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
    // 5 Comprehensive Datas on Diabetes Care:
    {
      title: 'Managing Diabetes at Home & Daily Routine', category: 'diabetes', tags: ['diabetes', 'sugar', 'blood', 'management'],
      titleHi: 'घर पर मधुमेह का प्रबंधन', titleTa: 'வீட்டில் நீரிழிவு நோயை நிர்வகிப்பது',
      content: 'Check blood sugar regularly as advised. Take medicines at the same time daily. Eat at regular times, avoid skipping meals. Reduce sugar, white rice, sweets. Walk 30 min daily if able. Check feet daily for cuts/sores. Drink plenty of water. Avoid smoking and alcohol. Attend regular checkups.',
      contentHi: 'नियमित रूप से शुगर चेक करें। दवाइयां समय पर लें। मीठा, चावल कम खाएं। रोज 30 मिनट चलें।',
      contentTa: 'தினமும் சர்க்கரை அளவை சரிபாருங்கள். மருந்துகளை சரியான நேரத்தில் எடுங்கள். இனிப்பு, வெள்ளை அரிசி குறைத்துக்கொள்ளுங்கள்.',
    },
    {
      title: 'Hypoglycemia Emergency: Recognizing & Treating Low Blood Sugar (<70 mg/dL)', category: 'diabetes', tags: ['diabetes', 'hypoglycemia', 'low sugar', 'emergency', 'rule of 15'],
      titleHi: 'हाइपोग्लाइसीमिया: कम ब्लड शुगर के लक्षण व त्वरित उपचार', titleTa: 'குறைந்த ரத்த சர்க்கரை அவசர சிகிச்சை (ஹைபோகிளைசீமியா)',
      content: 'Symptoms of low blood sugar: sudden shaking, severe sweating, dizziness, rapid pounding heartbeat, intense hunger, confusion, blurred vision. Apply the "Rule of 15": Immediately consume 15 grams of fast-acting sugar (3 teaspoons of sugar dissolved in water, 1/2 cup fruit juice, or 3 hard candies). Rest for 15 minutes and re-test. If still <70 mg/dL, take another 15g. Never take insulin when feeling shaky. Always carry glucose or jaggery in pocket when working in fields.',
      contentHi: 'अचानक कंपकंपी, पसीना, चक्कर आए तो तुरंत 3 चम्मच चीनी पानी में घोलकर पिएं। 15 मिनट आराम करें। खेत जाते समय हमेशा गुड़ या चीनी साथ रखें।',
      contentTa: 'நடுக்கம், அதிக வியர்வை, தலைச்சுற்றல் வந்தால் உடனடியாக 3 ஸ்பூன் சர்க்கரையை நீரில் கலந்து குடியுங்கள். 15 நிமிடம் ஓய்வெடுத்து மீண்டும் பரிசோதியுங்கள்.',
    },
    {
      title: 'Diabetic Foot Care & Daily Inspection Guide for Agricultural Workers', category: 'diabetes', tags: ['diabetes', 'foot care', 'neuropathy', 'prevention', 'ulcer'],
      titleHi: 'मधुमेह में पैरों की देखभाल एवं रोज जांच', titleTa: 'நீரிழிவு நோயாளிக்கான தினசரி கால் பராமரிப்பு மற்றும் பாதுகாப்பு',
      content: 'Diabetes impairs blood circulation and damages foot nerves (diabetic neuropathy), preventing you from feeling cuts or thorn pricks. Daily rules: 1. Wash feet daily with lukewarm water and mild soap; dry thoroughly between toes. 2. Inspect feet every evening using a mirror or family member for cuts, red spots, blisters, or embedded thorns. 3. Never walk barefoot in farming fields, mud, or unpaved rural paths; wear fitted protective shoes. 4. Never use razor blades to scrape calluses. 5. Show any non-healing sore to the PHC doctor within 48 hours to prevent severe ulceration.',
      contentHi: 'खेतों में कभी नंगे पैर न चलें। रोज शाम को पैरों को धोकर तालुओं की जांच करें। किसी भी घाव को नजरअंदाज न करें, तुरंत डॉक्टर को दिखाएं।',
      contentTa: 'விவசாய நிலங்களில் எப்போதும் வெறும் காலில் நடக்காதீர்கள். தினமும் மாலையில் கால்களை சோப்பு போட்டு கழுவி முட்கள், காயங்கள் உள்ளதா என சோதியுங்கள்.',
    },
    {
      title: 'Dietary Glycemic Index, Millets & Portion Control in Rural Diets', category: 'diabetes', tags: ['diabetes', 'diet', 'millets', 'nutrition', 'glycemic index'],
      titleHi: 'मधुमेह के लिए देसी खानपान, मिलेट्स और आहार नियंत्रण', titleTa: 'நீரிழிவுக்கான பாரம்பரிய சிறுதானிய உணவு மற்றும் உணவுமுறை',
      content: 'Refined white polished rice causes sudden blood sugar spikes. Replace with traditional high-fiber millets: Finger millet (Ragi), Foxtail millet (Thinai), Little millet (Samai), or Kodo millet (Varagu). Use the "Plate Method": 1/2 of plate filled with green vegetables (drumstick leaves, gourds, cabbage), 1/4 of plate filled with protein (boiled dal, chickpeas/sundal, boiled egg), and 1/4 of plate with cooked millets or whole wheat roti. Eliminate sweetened milk tea, avoid refined biscuits, and drink 2.5 litres of filtered water daily.',
      contentHi: 'सफेद चावल की जगह रागी, ज्वार, बाजरा और हरी पत्तेदार सब्जियां खाएं। आधी थाली सब्जी, एक चौथाई दाल और एक चौथाई मिलेट्स रखें। मीठी चाय बंद करें।',
      contentTa: 'வெள்ளை அரிசிக்கு பதிலாக ராகி, தினை, சாமை மற்றும் கீரைகள் சாப்பிடுங்கள். தட்டில் பாதி அளவு காய்கறிகள், கால் பங்கு பருப்பு, கால் பங்கு சிறுதானியம் இருக்க வேண்டும்.',
    },
    {
      title: 'Oral Hypoglycemic Tablets vs Insulin: Safe Timing & Rural Storage', category: 'diabetes', tags: ['diabetes', 'metformin', 'insulin', 'medication timing', 'storage'],
      titleHi: 'डायबिटीज की दवाइयां व इंसुलिन: सही समय और रखने का तरीका', titleTa: 'சர்க்கரை மாத்திரைகள் மற்றும் இன்சுலின்: சரியான நேரம் மற்றும் சேமிப்பு',
      content: 'Medication Rules: 1. Metformin: Always take with or immediately after major meals to prevent stomach irritation. 2. Sulfonylureas (Glimepiride/Glibenclamide): Take 15 minutes before breakfast; never skip food after taking it to avoid low sugar. 3. Rural Insulin Storage: Unopened vials should be stored in a cool domestic clay pot filled with moist river sand if refrigerator is unavailable. Keep out of direct sunlight. Never freeze insulin. 4. Rotate injection sites across abdomen and thighs. Never stop diabetes medications abruptly without doctor consultation.',
      contentHi: 'मेटफॉर्मिन खाना खाने के तुरंत बाद लें। फ्रिज न होने पर इंसुलिन की शीशी को गीली बालू वाली मटकी में रखें। दवा कभी अचानक बंद न करें।',
      contentTa: 'மெட்ஃபோர்மின் மாத்திரையை உணவு உண்ட உடனேயே எடுக்கவும். குளிர்சாதன பெட்டி இல்லாதவர்கள் இன்சுலினை ஈர மணல் நிரப்பிய மண் பானையில் வைக்கலாம்.',
    },
    {
      title: 'Monitoring HbA1c, Kidney Function & Annual Preventive Screenings', category: 'diabetes', tags: ['diabetes', 'hba1c', 'kidney', 'eye check', 'screening'],
      titleHi: 'HbA1c जांच, गुर्दे की सुरक्षा एवं वार्षिक स्वास्थ्य परीक्षण', titleTa: 'HbA1c ரத்த பரிசோதனை, சிறுநீரக பாதுகாப்பு மற்றும் கண் பரிசோதனை',
      content: 'Routine clinical monitoring schedule for all diabetic patients: 1. Home Blood Sugar: Fasting (target 80–130 mg/dL) and 2-hour post-meal (target <180 mg/dL). 2. HbA1c Test: Once every 3 to 6 months to measure 90-day average glucose (target typically <7.0%). 3. Kidney Health: Annual urine test for microalbuminuria and serum creatinine/eGFR to catch diabetic kidney disease early. 4. Eye Checkup: Annual dilated retinal eye exam at district hospital or mobile eye camp to prevent blindness from diabetic retinopathy. 5. Blood Pressure: Check at every PHC visit (target <130/80 mmHg).',
      contentHi: 'हर 3 महीने में HbA1c जांच कराएं (लक्ष्य 7% से कम)। साल में एक बार आंखों के पर्दे की जांच और पेशाब की माइक्रोएल्बुमिन जांच अवश्य करवाएं।',
      contentTa: '3 மாதங்களுக்கு ஒருமுறை HbA1c பரிசோதனை செய்யுங்கள். வருடம் ஒருமுறை கண் விழித்திரை மற்றும் சிறுநீரக பரிசோதனை கட்டாயம் செய்ய வேண்டும்.',
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

  // Doctor Summaries (4 Total: 1 Original + 3 More New Requested Summaries)
  await db.doctorSummaries.bulkAdd([
    {
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
    },
    // Summary 2: Maternal Antenatal Third-Trimester Review
    {
      patientId: Number(p1),
      doctorId: Number(d1),
      complaint: 'Routine 28-week maternal antenatal evaluation, mild lower limb fatigue',
      symptoms: ['Mild lower limb fatigue', 'Occasional morning nausea', 'Good fetal movement'],
      duration: '1 week',
      history: 'Primi gravida, 28 weeks gestation. Mild nutritional anemia on oral iron therapy.',
      medicines: 'Folic acid 5mg OD, Ferrous sulphate 200mg BD, Calcium carbonate 500mg OD',
      allergies: 'Penicillin',
      vitals: 'BP: 110/72 mmHg, Weight: 58 kg, Pulse: 78 bpm, Fetal Heart Rate: 140 bpm, SpO2: 99%',
      observations: 'Fundal height corresponds to 28 weeks. No pedal edema or proteinuria. Fetal heart rate regular at 140 bpm.',
      warningSigns: ['Sudden visual blurring', 'Severe headache', 'Vaginal bleeding', 'Decreased fetal movements <10/2hr'],
      nextStep: 'Follow-up visit at 32 weeks for growth ultrasound and repeat hemoglobin level.',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      doctorNotes: 'Advised balanced rural diet with ragi porridge, drumstick leaves, milk, and adequate rest.',
      agentType: 'maternity',
    },
    // Summary 3: Pediatric & Neonatal Well-Baby Check
    {
      patientId: Number(p6),
      doctorId: Number(d1),
      complaint: '2-week neonatal well-baby check, umbilical stump inspection',
      symptoms: ['None reported. Vigorous suckling, normal sleep-wake cycles, active crying'],
      duration: '15 days since birth',
      history: 'Full term normal vaginal delivery at Kodaikanal Govt Hospital, birth weight 2.9 kg.',
      medicines: 'Vitamin D3 drops 400 IU once daily',
      allergies: 'None',
      vitals: 'Weight: 3.1 kg (+200g gain), Temp: 98.4°F, Pulse: 130 bpm, SpO2: 99%',
      observations: 'Umbilical cord clean and dry. No jaundice or conjunctival pallor. Alert and active Moro reflex.',
      warningSigns: ['Poor suckling or refusal to feed', 'Lethargy/unusual sleepiness', 'Fever or cold extremities', 'Yellow palms/soles'],
      nextStep: 'Scheduled for 6-week immunization (Pentavalent-1, OPV-1, Rotavirus-1) at village health post.',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      doctorNotes: 'Mother counselled on exclusive breastfeeding, burping techniques, and keeping baby warm.',
      agentType: 'newborn',
    },
    // Summary 4: Geriatric Respiratory Assessment
    {
      patientId: Number(p7),
      doctorId: Number(d1),
      complaint: 'Chronic morning cough with mucoid sputum, exertional breathlessness on slope walking',
      symptoms: ['Chronic productive cough', 'Exertional dyspnea', 'Morning chest tightness'],
      duration: '3 months, worse during rainy cold mornings',
      history: 'Former tea estate laborer with 35 years exposure to wood stove smoke. COPD Stage 2.',
      medicines: 'Budesonide+Formoterol DPI 200/6 mcg BD, Tab Theophylline 300mg OD',
      allergies: 'None known',
      vitals: 'BP: 140/86 mmHg, SpO2: 94% on room air, Pulse: 80 bpm, Temp: 98.2°F, RR: 20/min',
      observations: 'Bilateral expiratory wheezing on chest auscultation. No cyanosis, no pedal edema.',
      warningSigns: ['Resting breathlessness', 'Bluish discoloration of lips', 'SpO2 falling below 90%', 'High fever'],
      nextStep: 'Continue dual inhaler with spacer. Annual influenza vaccination. Spirometry review at district hospital.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      doctorNotes: 'Demonstrated correct mouth rinsing after steroid inhaler use. Advised keeping indoor living area well ventilated.',
      agentType: 'respiratory',
    },
  ]);

  console.log('[Medora] Database seeded successfully with 186+ records across all clinical tables');
}

/**
 * Migration helper to ensure Nair is replaced by Guptha in any existing browser storage,
 * and ensures all 186+ records exist.
 */
export async function ensureSeedData() {
  try {
    // 1. Migrate Nair -> Guptha
    await db.families.where({ familyName: 'Nair Family (Family 03)' }).modify({ familyName: 'Guptha Family (Family 03)' });
    await db.patients.where({ name: 'Suresh Nair' }).modify({ name: 'Suresh Guptha' });
    await db.patients.where({ name: 'Deepa Nair' }).modify({ name: 'Deepa Guptha' });

    // 2. If doctors or records count is low, run seedDatabase
    const patientCount = await db.patients.count();
    const docSummaryCount = await db.doctorSummaries.count();
    const medRecordCount = await db.medicalRecords.count();
    const hospCount = await db.hospitals.count();
    
    if (patientCount === 0 || docSummaryCount < 4 || medRecordCount < 16 || hospCount < 8) {
      await seedDatabase();
    }
  } catch (err) {
    console.warn('[Medora] ensureSeedData notice:', err);
  }
}

/**
 * Force resets and reseeds with the guaranteed 186+ records.
 */
export async function resetAndReseedDatabase() {
  try {
    await db.patients.clear();
    await db.families.clear();
    await db.doctors.clear();
    await db.admins.clear();
    await db.medicines.clear();
    await db.medicalRecords.clear();
    await db.healthTests.clear();
    await db.vaccinations.clear();
    await db.appointments.clear();
    await db.notifications.clear();
    await db.doctorSummaries.clear();
    await db.hospitals.clear();
    await db.transport.clear();
    await db.schemes.clear();
    await db.education.clear();
    await seedDatabase();
    return true;
  } catch (err) {
    console.error('Reset and reseed failed:', err);
    return false;
  }
}

/**
 * Core Machine Learning & Clinical AI Engine Interfaces for Medora
 * Modular Clinical Architecture
 */

export type ClinicalUrgencyLevel = 'CRITICAL_EMERGENCY' | 'URGENT_EVALUATION' | 'ROUTINE_CARE' | 'ELECTIVE';

export type MedicalConfidenceLevel = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'CALIBRATED_VERY_HIGH';

export interface UncertaintyAssessment {
  rawScore: number | null;
  calibratedConfidence: number; // 0.0 - 1.0, strictly calibrated
  confidenceInterval: [number, number]; // [lower bound, upper bound] e.g. 95% Bayesian credible interval
  epistemicUncertainty: number; // Model parameter / data sparsity uncertainty (0.0 - 1.0)
  aleatoricUncertainty: number; // Inherent data noise / ambiguity (0.0 - 1.0)
  evidenceSufficiency: number; // 0.0 - 1.0 scale of clinical completeness
  methodology: 'BAYESIAN_APPROXIMATION' | 'MONTE_CARLO_DROPOUT' | 'ENSEMBLE_VARIANCE' | 'DETERMINISTIC_HEURISTIC';
  disclaimer: string;
}

export interface SymptomAnalysisInput {
  patientInput: string;
  patientId?: number | string;
  age?: number;
  gender?: string;
  duration?: string;
  reportedVitals?: {
    temperature?: string;
    bloodPressure?: string;
    bloodSugar?: string;
    spo2?: string;
    pulse?: string;
    weight?: string;
  };
  knownConditions?: string[];
  currentMedications?: string[];
  allergies?: string[];
}

export interface SymptomEntity {
  name: string;
  rawMention: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'UNKNOWN';
  duration?: string;
  location?: string;
}

export interface SymptomAnalysisResult {
  engine: 'MedoraSymptomAnalysisEngine';
  symptoms: SymptomEntity[];
  chiefComplaint: string;
  extractedDuration: string | null;
  extractedVitals: Record<string, string>;
  possibleConsiderations: Array<{
    condition: string;
    supportingClues: string[];
    missingInfo: string[];
    provisionalConfidence: number;
  }>;
  redFlags: string[];
  requiresEmergencyCare: boolean;
  requiresPhysicianReview: true;
  uncertainty: UncertaintyAssessment;
  timestamp: string;
}

export interface LabParameterObservation {
  parameterName: string;
  rawValue: string;
  numericValue: number | null;
  unit: string;
  referenceRange: {
    min?: number;
    max?: number;
    text: string;
  };
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL' | 'UNCERTAIN';
  clinicalContext: string;
}

export interface ReportAnalysisInput {
  reportText: string;
  reportType?: 'LABORATORY' | 'BIOCHEMISTRY' | 'HEMATOLOGY' | 'RADIOLOGY_TEXT' | 'DISCHARGE_SUMMARY' | 'GENERAL';
  patientId?: number | string;
  referenceRangesProvided?: boolean;
}

export interface ReportAnalysisResult {
  engine: 'MedoraMedicalReportAnalysisEngine';
  reportType: string;
  extractedParameters: LabParameterObservation[];
  criticalAlerts: string[];
  abnormalCount: number;
  normalCount: number;
  summaryFindings: string;
  uncertainty: UncertaintyAssessment;
  requiresPhysicianReview: true;
  timestamp: string;
}

export interface ImageAnalysisInput {
  imageUri?: string;
  imageBase64?: string;
  imageType?: 'X_RAY' | 'CT' | 'MRI' | 'ULTRASOUND' | 'DERMATOLOGY' | 'OTHER';
  bodyPart?: string;
  clinicalIndication?: string;
}

export interface ImageAnalysisResult {
  engine: 'MedoraMedicalImageAnalysisEngine';
  status: 'UNAVAILABLE' | 'NOT_CERTIFIED' | 'FAILED';
  modelAvailable: false;
  reason: string;
  guidance: string;
  provisionalObservations: [];
  confidence: null;
  timestamp: string;
}

export interface EmergencyTriageInput {
  patientStatement: string;
  vitalSigns?: {
    spo2?: number;
    systolicBp?: number;
    diastolicBp?: number;
    pulse?: number;
    temperatureF?: number;
  };
  isChild?: boolean;
  isPregnant?: boolean;
}

export interface EmergencyTriageResult {
  engine: 'MedoraEmergencyTriageEngine';
  urgencyLevel: ClinicalUrgencyLevel;
  isEmergency: boolean;
  activeRedFlags: string[];
  recommendedAction: string;
  dispatchAdvice: string;
  timestamp: string;
}

export interface DoctorSummaryInput {
  patientId: number | string;
  patientName: string;
  age?: number;
  gender?: string;
  symptomResults?: SymptomAnalysisResult;
  reportResults?: ReportAnalysisResult;
  triageResults?: EmergencyTriageResult;
  consultationNotes?: string;
}

export interface DoctorSummaryResult {
  engine: 'MedoraDoctorSummaryEngine';
  patientHeader: {
    id: number | string;
    name: string;
    age?: number;
    gender?: string;
  };
  provisionalAiSection: {
    disclaimer: string;
    observations: string[];
    potentialDifferentials: string[];
    uncertaintyNotice: string;
    isVerifiedByDoctor: false;
  };
  objectiveClinicalData: {
    vitals: Record<string, string>;
    labValues: Array<{ name: string; value: string; status: string }>;
  };
  physicianClinicalRecordSection: {
    isVerifiedByDoctor: boolean;
    attendingPhysician: string | null;
    verifiedDiagnosis: string | null;
    clinicalOrders: string[];
    prescriptions: string[];
    physicianNotes: string | null;
    verificationTimestamp: string | null;
  };
  generatedAt: string;
}

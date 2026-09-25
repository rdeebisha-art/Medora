/**
 * Core Type Definitions for Medora AI Services
 * 
 * Strict separation between:
 * 1. Medora Voice AI (Non-medical conversation, navigation, assistance)
 * 2. Medora Medical AI (Offline-first clinical reasoning, emergency detection, differentials)
 */

export type AIRouteType = 'VOICE' | 'NAVIGATION' | 'MEDICAL' | 'EMERGENCY';

export type AIRouterTarget =
  | 'VOICE_AI'
  | 'LOCAL_NAVIGATION'
  | 'MEDICAL_AI'
  | 'EMERGENCY_TRIAGE';

export interface AIRouterDecision {
  targetSystem: AIRouterTarget;
  requestType: AIRouteType;
  reason: string;
  isEmergency: boolean;
  requiresDoctorReview: boolean;
  destinationRoute?: string;
}

export interface PossibleCondition {
  condition: string;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  missingInformation: string[];
  reasoning: string;
}

export type MedicalConfidenceStatus =
  | 'NOT_CLINICALLY_VALIDATED'
  | 'INSUFFICIENT_INFORMATION'
  | 'AI_ASSESSMENT_REQUIRES_CLINICAL_VERIFICATION';

export type MedicalExecutionMode = 'OFFLINE' | 'ONLINE_FALLBACK' | 'ONLINE';

export type MedicalResponseSource = 'LOCAL_MEDICAL_ENGINE' | 'GEMINI_ONLINE';

export interface StructuredMedicalResponse {
  mode: MedicalExecutionMode;
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: string;
  measurements: string[];
  medicalHistory: string[];
  medications: string[];
  allergies: string[];
  possibleConditions: PossibleCondition[];
  redFlags: string[];
  emergencyDetected: boolean;
  recommendedNextStep: string;
  requiresUrgentCare: boolean;
  requiresDoctorReview: boolean;
  confidenceStatus: MedicalConfidenceStatus;
  source: MedicalResponseSource;
  
  // Backwards compatibility / rich UI fields
  confidence?: number | null;
  summaryText?: string;
  isOfflineFallback?: boolean;
  diagnosticAssessment?: {
    mostLikelyCondition: string;
    differentialDiagnoses: Array<{
      condition: string;
      supportingEvidence: string[];
      contradictingEvidence: string[];
      confidence: number | null;
    }>;
  };
  clinicalAssessment?: {
    chiefComplaint: string;
    symptoms: string[];
    duration: string;
    severity: string;
    measurements: string[];
    medicalHistory: string[];
    medications: string[];
    allergies: string[];
  };
}

export interface MedicalAnalysisRequest {
  patientInput: string;
  patientId?: number | string;
  age?: number;
  gender?: string;
  duration?: string;
  temperature?: string;
  bloodPressure?: string;
  bloodSugar?: string;
  spo2?: string;
  weight?: string;
  medicalHistory?: string[];
  medications?: string[];
  allergies?: string[];
  pregnancyStatus?: string;
  doctorNotes?: string;
  language?: string;
  forceOffline?: boolean;
}

export interface VoiceServiceRequest {
  text: string;
  language?: string;
  userName?: string;
}

export interface VoiceServiceResponse {
  source: 'VOICE_AI';
  responseText: string;
  language: string;
  isMedicalQuery: boolean;
  medicalHandoff?: StructuredMedicalResponse;
  destinationRoute?: string;
  suggestedAction: 'NONE' | 'NAVIGATE' | 'TRANSFER_TO_MEDICAL_AI';
}

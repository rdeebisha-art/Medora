export type AIRequestType =
  | 'VOICE'
  | 'MEDICAL'
  | 'NAVIGATION'
  | 'EMERGENCY'
  | 'CALLING'
  | 'MESSAGING'
  | 'APP_HELP'
  | 'RECORD_INPUT';

export type AIResponseSource =
  | 'VOICE_AI'
  | 'MEDICAL_AI'
  | 'LOCAL_NAVIGATION'
  | 'EMERGENCY_TRIAGE';

export type MedicalAIRequestType =
  | 'SYMPTOM_ANALYSIS'
  | 'DIAGNOSIS_REVIEW'
  | 'MEDICAL_REPORT_ANALYSIS'
  | 'MEDICAL_IMAGE_ANALYSIS'
  | 'MEDICAL_RECORD_SUMMARY'
  | 'MEDICATION_REVIEW'
  | 'VACCINATION_REVIEW'
  | 'SURGERY_FOLLOW_UP'
  | 'EMERGENCY_TRIAGE'
  | 'DOCTOR_CONSULTATION'
  | 'DOCTOR_SUMMARY'
  | 'HEALTH_REMINDER'
  | 'GENERAL_HEALTH_QUESTION';

export interface AIRouterDecision {
  targetSystem: AIResponseSource;
  requestType: AIRequestType;
  medicalRequestType?: MedicalAIRequestType;
  reason: string;
  isEmergency: boolean;
  requiresDoctorReview: boolean;
  destinationRoute?: string;
}

export interface MedicalStructuredOutput {
  requestType: MedicalAIRequestType;
  patientId: number | string;
  relevantSourceRecordIds: (number | string)[];
  originalUserInput: string;
  extractedInformation: Record<string, any>;
  analysisResult: string;
  missingInformation: string[];
  warningSigns: string[];
  confidenceOrUncertainty: string;
  recommendedNextStep: string;
  timestamp: string;
  executedAgentIds: string[];
}

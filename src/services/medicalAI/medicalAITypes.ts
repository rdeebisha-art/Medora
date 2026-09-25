/**
 * Structured Types for Medora Medical AI.
 * Main medical intelligence system powered by Gemini + Clinical Rule Engine.
 */

export interface ClinicalAssessmentData {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: string;
  measurements: string[];
  medicalHistory: string[];
  medications: string[];
  allergies: string[];
}

export interface DifferentialDiagnosisItem {
  condition: string;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  confidence: number | null;
}

export interface DiagnosticAssessmentData {
  mostLikelyCondition: string;
  differentialDiagnoses: DifferentialDiagnosisItem[];
}

export type MedicalConfidenceStatus =
  | 'INSUFFICIENT_EVIDENCE'
  | 'AI_ASSESSMENT_REQUIRES_CLINICAL_VERIFICATION'
  | 'NOT_CLINICALLY_VALIDATED'
  | 'CLINICALLY_VERIFIED';

export interface MedicalAIResponse {
  source: 'MEDICAL_AI';
  mode?: 'OFFLINE' | 'ONLINE_FALLBACK' | 'ONLINE';
  clinicalAssessment: ClinicalAssessmentData;
  diagnosticAssessment: DiagnosticAssessmentData;
  possibleConditions?: Array<{
    condition: string;
    supportingEvidence: string[];
    contradictingEvidence: string[];
    missingInformation: string[];
    reasoning: string;
  }>;
  redFlags: string[];
  missingInformation: string[];
  recommendedNextStep: string;
  requiresUrgentCare: boolean;
  requiresDoctorReview: boolean;
  confidence: number | null;
  confidenceStatus: MedicalConfidenceStatus;
  summaryText: string;
  isOfflineFallback?: boolean;
}

export interface MedicalReportAnalysisItem {
  testName: string;
  result: string;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'ABNORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  clinicalSignificance: string;
}

export interface MedicalReportAnalysisResponse {
  source: 'MEDICAL_AI';
  reportType: string;
  observations: MedicalReportAnalysisItem[];
  abnormalFindings: string[];
  possibleClinicalSignificance: string;
  differentialConsiderations: string[];
  missingInformation: string[];
  urgency: 'ROUTINE' | 'ELEVATED' | 'EMERGENCY';
  questionsForDoctor: string[];
  requiresDoctorReview: true;
  confidence: number | null;
  confidenceStatus: MedicalConfidenceStatus;
}

export interface MedicalImageAnalysisResponse {
  source: 'MEDICAL_AI';
  label: 'AI-assisted medical image observation';
  imageQuality: 'SUFFICIENT' | 'INSUFFICIENT';
  observations: string[];
  possibleClinicalConsiderations: string[];
  missingInformation: string[];
  requiresDoctorReview: true;
  summaryText: string;
  confidence: number | null;
  confidenceStatus: MedicalConfidenceStatus;
}

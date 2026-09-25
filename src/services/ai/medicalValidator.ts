/**
 * Schema Validation Utility for Offline Medical Reasoning Engine
 * 
 * Verifies that the offline engine's output strictly adheres to the required
 * Medora Medical Response JSON structure before that output is returned to the UI.
 * 
 * Safe fallback is returned if validation fails, preventing malformed medical data
 * from rendering in OfflineDiagnosticInterface or any other UI component.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidatedPossibleCondition {
  id?: string;
  name?: string;
  condition: string;
  supportingEvidence: string[];
  contradictingEvidence?: string[];
  missingInformation?: string[];
  redFlags?: string[];
  requiresDoctorReview?: boolean;
  reasoning?: string;
}

export interface ValidatedMedicalResponse {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: string;
  measurements: Record<string, unknown> | string[];
  medicalHistory: string[];
  medications: string[];
  allergies: string[];
  observations: string[];
  possibleConditions: ValidatedPossibleCondition[];
  supportingEvidence: string[];
  missingInformation: string[];
  redFlags: string[];
  recommendedNextStep: string;
  requiresUrgentCare: boolean;
  requiresDoctorReview: boolean;
  confidenceStatus: string;

  // Preserved system metadata fields for Medora system routing
  mode?: string;
  source?: string;
  emergencyDetected?: boolean;
  summaryText?: string;
  isOfflineFallback?: boolean;
  diagnosticAssessment?: any;
  clinicalAssessment?: any;
  confidence?: number | null;
}

export {
  validateMedicalResponse,
  createSafeMedicalFallback,
} from './medicalService';

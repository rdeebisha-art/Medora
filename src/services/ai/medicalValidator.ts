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

/**
 * Validates any medical response object against Medora schema rules.
 * Does NOT throw unhandled exceptions.
 * Uses unknown rather than any.
 */
export function validateMedicalResponse(response: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (response === null || typeof response !== 'object' || Array.isArray(response)) {
    return {
      valid: false,
      errors: ['Response must be a non-null object.'],
    };
  }

  const res = response as Record<string, unknown>;

  // 1. chiefComplaint: string
  if (typeof res.chiefComplaint !== 'string') {
    errors.push('chiefComplaint must be a string');
  }

  // 2. symptoms: array
  if (!Array.isArray(res.symptoms)) {
    errors.push('symptoms must be an array');
  }

  // 3. duration: string
  if (typeof res.duration !== 'string') {
    errors.push('duration must be a string');
  }

  // 4. severity: string
  if (typeof res.severity !== 'string') {
    errors.push('severity must be a string');
  }

  // 5. measurements: object (in JS, objects and arrays are both typeof 'object', but null is not; check non-null object)
  if (res.measurements === null || typeof res.measurements !== 'object') {
    errors.push('measurements must be an object');
  }

  // 6. medicalHistory: array
  if (!Array.isArray(res.medicalHistory)) {
    errors.push('medicalHistory must be an array');
  }

  // 7. medications: array
  if (!Array.isArray(res.medications)) {
    errors.push('medications must be an array');
  }

  // 8. allergies: array
  if (!Array.isArray(res.allergies)) {
    errors.push('allergies must be an array');
  }

  // 9. observations: array
  if (!Array.isArray(res.observations)) {
    errors.push('observations must be an array');
  }

  // 10. possibleConditions: array
  if (!Array.isArray(res.possibleConditions)) {
    errors.push('possibleConditions must be an array');
  } else {
    // Validate each condition in possibleConditions
    res.possibleConditions.forEach((item, idx) => {
      if (item === null || typeof item !== 'object' || Array.isArray(item)) {
        errors.push(`possibleConditions[${idx}] must be an object`);
      } else {
        const cond = item as Record<string, unknown>;
        // Name or condition string must be present
        if (typeof cond.condition !== 'string' && typeof cond.name !== 'string') {
          errors.push(`possibleConditions[${idx}] must have a 'condition' or 'name' string`);
        }
        // supportingEvidence must be an array
        if (!Array.isArray(cond.supportingEvidence)) {
          errors.push(`possibleConditions[${idx}].supportingEvidence must be an array`);
        }
        // If redFlags exists on condition, must be an array
        if (cond.redFlags !== undefined && !Array.isArray(cond.redFlags)) {
          errors.push(`possibleConditions[${idx}].redFlags must be an array`);
        }
        // If requiresDoctorReview exists on condition, must be boolean
        if (cond.requiresDoctorReview !== undefined && typeof cond.requiresDoctorReview !== 'boolean') {
          errors.push(`possibleConditions[${idx}].requiresDoctorReview must be a boolean`);
        }
      }
    });
  }

  // 11. supportingEvidence: array
  if (!Array.isArray(res.supportingEvidence)) {
    errors.push('supportingEvidence must be an array');
  }

  // 12. missingInformation: array
  if (!Array.isArray(res.missingInformation)) {
    errors.push('missingInformation must be an array');
  }

  // 13. redFlags: array
  if (!Array.isArray(res.redFlags)) {
    errors.push('redFlags must be an array');
  }

  // 14. recommendedNextStep: string
  if (typeof res.recommendedNextStep !== 'string') {
    errors.push('recommendedNextStep must be a string');
  }

  // 15. requiresUrgentCare: boolean
  if (typeof res.requiresUrgentCare !== 'boolean') {
    errors.push('requiresUrgentCare must be a boolean');
  }

  // 16. requiresDoctorReview: boolean
  if (typeof res.requiresDoctorReview !== 'boolean') {
    errors.push('requiresDoctorReview must be a boolean');
  }

  // 17. confidenceStatus: string
  if (typeof res.confidenceStatus !== 'string') {
    errors.push('confidenceStatus must be a string');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates the deterministic safe fallback response when validation fails.
 * Never invents a diagnosis or medical information.
 */
export function createSafeMedicalFallback(
  originalEmergencyDetected: boolean = false,
  originalRedFlags: string[] = []
): ValidatedMedicalResponse {
  return {
    mode: 'OFFLINE',
    source: 'LOCAL_MEDICAL_ENGINE',
    chiefComplaint: originalEmergencyDetected ? 'EMERGENCY MEDICAL ATTENTION REQUIRED' : '',
    symptoms: [],
    duration: '',
    severity: originalEmergencyDetected ? 'Severe / Emergency' : '',
    measurements: {},
    medicalHistory: [],
    medications: [],
    allergies: [],
    observations: [],
    possibleConditions: [],
    supportingEvidence: [],
    missingInformation: [],
    redFlags: originalEmergencyDetected && originalRedFlags.length > 0 ? originalRedFlags : [],
    recommendedNextStep: originalEmergencyDetected
      ? 'IMMEDIATE EMERGENCY: Dial 108 or proceed to the nearest emergency department immediately.'
      : 'The medical assessment could not be generated reliably. Please review the original information and consult a qualified healthcare professional.',
    requiresUrgentCare: originalEmergencyDetected,
    requiresDoctorReview: true,
    confidenceStatus: 'UNAVAILABLE',
    emergencyDetected: originalEmergencyDetected,
    summaryText: originalEmergencyDetected
      ? 'EMERGENCY ALERT: Immediate medical evaluation is critical. Please call 108 immediately.'
      : 'The medical assessment could not be generated reliably. Please consult a qualified doctor.',
    isOfflineFallback: true,
  };
}

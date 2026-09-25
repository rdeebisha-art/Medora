export interface MedicalSchemaValidationResult {
  isValid: boolean;
  errors: string[];
}

export const REQUIRED_MEDICAL_RESPONSE_KEYS = [
  'mode',
  'chiefComplaint',
  'symptoms',
  'duration',
  'severity',
  'measurements',
  'possibleConditions',
  'redFlags',
  'emergencyDetected',
  'recommendedNextStep',
  'requiresUrgentCare',
  'requiresDoctorReview',
  'confidenceStatus',
  'source',
] as const;

/**
 * Validates whether an arbitrary input or AI output conforms strictly
 * to the Medora StructuredMedicalResponse schema.
 */
export function validateMedicalSchema(data: any): MedicalSchemaValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Response must be a non-null JSON object.'],
    };
  }

  // Required top-level keys
  for (const key of REQUIRED_MEDICAL_RESPONSE_KEYS) {
    if (data[key] === undefined || data[key] === null) {
      errors.push(`Missing required field: '${key}'.`);
    }
  }

  // Mode validation
  if (data.mode && !['OFFLINE', 'ONLINE_FALLBACK', 'ONLINE'].includes(data.mode)) {
    errors.push(`Invalid execution mode: '${data.mode}'. Must be OFFLINE, ONLINE_FALLBACK, or ONLINE.`);
  }

  // Arrays validation
  if (data.symptoms !== undefined && !Array.isArray(data.symptoms)) {
    errors.push(`Field 'symptoms' must be an array.`);
  }

  if (data.measurements !== undefined && !Array.isArray(data.measurements)) {
    errors.push(`Field 'measurements' must be an array.`);
  }

  if (data.redFlags !== undefined && !Array.isArray(data.redFlags)) {
    errors.push(`Field 'redFlags' must be an array.`);
  }

  // Possible conditions structure validation
  if (data.possibleConditions !== undefined) {
    if (!Array.isArray(data.possibleConditions)) {
      errors.push(`Field 'possibleConditions' must be an array.`);
    } else {
      data.possibleConditions.forEach((item: any, idx: number) => {
        if (!item || typeof item !== 'object') {
          errors.push(`Condition at index ${idx} must be an object.`);
        } else {
          if (!item.condition || typeof item.condition !== 'string') {
            errors.push(`Condition at index ${idx} missing 'condition' string.`);
          }
          if (!Array.isArray(item.supportingEvidence)) {
            errors.push(`Condition at index ${idx} missing 'supportingEvidence' array.`);
          }
          if (!Array.isArray(item.contradictingEvidence)) {
            errors.push(`Condition at index ${idx} missing 'contradictingEvidence' array.`);
          }
        }
      });
    }
  }

  // Boolean flags validation
  if (data.emergencyDetected !== undefined && typeof data.emergencyDetected !== 'boolean') {
    errors.push(`Field 'emergencyDetected' must be a boolean.`);
  }

  if (data.requiresUrgentCare !== undefined && typeof data.requiresUrgentCare !== 'boolean') {
    errors.push(`Field 'requiresUrgentCare' must be a boolean.`);
  }

  if (data.requiresDoctorReview !== undefined && typeof data.requiresDoctorReview !== 'boolean') {
    errors.push(`Field 'requiresDoctorReview' must be a boolean.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

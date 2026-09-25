import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  medicalService,
  validateMedicalResponse,
  createSafeMedicalFallback,
} from './medicalService';

describe('MedicalService & validateMedicalResponse Test Suite', () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    }
  });

  // Base valid sample response adhering strictly to the required Medora response structure
  const validSampleResponse = {
    chiefComplaint: 'Acute Fever and Productive Cough',
    symptoms: ['Fever', 'Cough'],
    duration: '3 days',
    severity: 'Moderate',
    measurements: {
      temperature: '102°F',
      bloodPressure: '120/80',
      bloodSugar: '180 mg/dL',
      spo2: '94%',
      weight: '55 kg',
      pulse: '62',
    },
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    medications: ['Paracetamol', 'Amoxicillin', 'Metformin', 'Insulin'],
    allergies: ['Penicillin'],
    observations: ['Pharyngeal erythema observed', 'Chest auscultation clear'],
    possibleConditions: [
      {
        id: 'COND_ILI',
        name: 'Influenza-like Illness',
        condition: 'Influenza-like Illness',
        supportingEvidence: ['High temperature 102°F', 'Acute onset cough'],
        redFlags: [],
        requiresDoctorReview: true,
      },
    ],
    supportingEvidence: ['High temperature 102°F', 'Acute onset cough'],
    missingInformation: ['Complete Blood Count (CBC)'],
    redFlags: [],
    recommendedNextStep: 'Consult a qualified primary care physician at the nearest PHC.',
    requiresUrgentCare: false,
    requiresDoctorReview: true,
    confidenceStatus: 'NOT_CLINICALLY_VALIDATED',
  };

  // =========================================================================
  // SECTION 1: validateMedicalResponse Core Functionality
  // =========================================================================
  describe('validateMedicalResponse - Core Schema & Return Value', () => {
    it('returns { valid: true, errors: [] } for a compliant medical response', () => {
      const result = validateMedicalResponse(validSampleResponse);
      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns { valid: false, errors: [...] } without throwing for non-compliant input', () => {
      const invalid = { ...validSampleResponse, chiefComplaint: 12345 };
      expect(() => {
        const result = validateMedicalResponse(invalid);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it('safely handles null input without throwing an unhandled exception', () => {
      expect(() => {
        const result = validateMedicalResponse(null);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Response must be a non-null object.');
      }).not.toThrow();
    });

    it('safely handles undefined input without throwing', () => {
      expect(() => {
        const result = validateMedicalResponse(undefined);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Response must be a non-null object.');
      }).not.toThrow();
    });

    it('safely handles primitive numbers, strings, and booleans without throwing', () => {
      expect(validateMedicalResponse(42).valid).toBe(false);
      expect(validateMedicalResponse('Patient has fever').valid).toBe(false);
      expect(validateMedicalResponse(true).valid).toBe(false);
      expect(validateMedicalResponse(Symbol('test')).valid).toBe(false);
    });

    it('safely handles top-level arrays without throwing', () => {
      const result = validateMedicalResponse(['item1', 'item2']);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Response must be a non-null object.');
    });
  });

  // =========================================================================
  // SECTION 2: Required Fields & Data Types Validation
  // =========================================================================
  describe('Field Type Validation & Error Messaging', () => {
    it('validates chiefComplaint: rejects missing or non-string values', () => {
      const missing = { ...validSampleResponse, chiefComplaint: undefined };
      const nonString = { ...validSampleResponse, chiefComplaint: 102 };

      expect(validateMedicalResponse(missing).valid).toBe(false);
      expect(validateMedicalResponse(missing).errors).toContain('chiefComplaint must be a string');
      expect(validateMedicalResponse(nonString).valid).toBe(false);
      expect(validateMedicalResponse(nonString).errors).toContain('chiefComplaint must be a string');
    });

    it('validates symptoms: rejects missing or non-array values', () => {
      const missing = { ...validSampleResponse, symptoms: undefined };
      const nonArray = { ...validSampleResponse, symptoms: 'Fever, Cough' };

      expect(validateMedicalResponse(missing).valid).toBe(false);
      expect(validateMedicalResponse(missing).errors).toContain('symptoms must be an array');
      expect(validateMedicalResponse(nonArray).valid).toBe(false);
      expect(validateMedicalResponse(nonArray).errors).toContain('symptoms must be an array');
    });

    it('validates duration: rejects missing or non-string values', () => {
      const missing = { ...validSampleResponse, duration: undefined };
      const nonString = { ...validSampleResponse, duration: 3 };

      expect(validateMedicalResponse(missing).valid).toBe(false);
      expect(validateMedicalResponse(missing).errors).toContain('duration must be a string');
      expect(validateMedicalResponse(nonString).valid).toBe(false);
      expect(validateMedicalResponse(nonString).errors).toContain('duration must be a string');
    });

    it('validates severity: rejects missing or non-string values', () => {
      const missing = { ...validSampleResponse, severity: undefined };
      const nonString = { ...validSampleResponse, severity: ['Severe'] };

      expect(validateMedicalResponse(missing).valid).toBe(false);
      expect(validateMedicalResponse(missing).errors).toContain('severity must be a string');
      expect(validateMedicalResponse(nonString).valid).toBe(false);
      expect(validateMedicalResponse(nonString).errors).toContain('severity must be a string');
    });

    it('validates measurements: requires an object and rejects null or non-object types', () => {
      const nullMeasurements = { ...validSampleResponse, measurements: null };
      const stringMeasurements = { ...validSampleResponse, measurements: '120/80 mmHg' };
      const numberMeasurements = { ...validSampleResponse, measurements: 98.6 };

      expect(validateMedicalResponse(nullMeasurements).valid).toBe(false);
      expect(validateMedicalResponse(nullMeasurements).errors).toContain('measurements must be an object');
      expect(validateMedicalResponse(stringMeasurements).valid).toBe(false);
      expect(validateMedicalResponse(stringMeasurements).errors).toContain('measurements must be an object');
      expect(validateMedicalResponse(numberMeasurements).valid).toBe(false);
      expect(validateMedicalResponse(numberMeasurements).errors).toContain('measurements must be an object');

      // Accepts valid object map
      const validMap = { ...validSampleResponse, measurements: { temp: '102°F', bp: '120/80' } };
      expect(validateMedicalResponse(validMap).valid).toBe(true);

      // Accepts empty object
      const emptyMap = { ...validSampleResponse, measurements: {} };
      expect(validateMedicalResponse(emptyMap).valid).toBe(true);
    });

    it('validates medicalHistory: rejects non-array values', () => {
      const invalid = { ...validSampleResponse, medicalHistory: 'Hypertension' };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('medicalHistory must be an array');
    });

    it('validates medications: rejects non-array values', () => {
      const invalid = { ...validSampleResponse, medications: 'Paracetamol 650mg' };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('medications must be an array');
    });

    it('validates allergies: rejects non-array values', () => {
      const invalid = { ...validSampleResponse, allergies: { penicillin: true } };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('allergies must be an array');
    });

    it('validates observations: rejects non-array values', () => {
      const invalid = { ...validSampleResponse, observations: 'Patient is pale' };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('observations must be an array');
    });

    it('validates possibleConditions: rejects non-array values', () => {
      const invalid = { ...validSampleResponse, possibleConditions: 'Viral Fever' };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('possibleConditions must be an array');
    });

    it('validates supportingEvidence: rejects non-array values', () => {
      const invalid = { ...validSampleResponse, supportingEvidence: 'Fever 102F' };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('supportingEvidence must be an array');
    });

    it('validates missingInformation: rejects non-array values', () => {
      const invalid = { ...validSampleResponse, missingInformation: 'Need blood test' };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('missingInformation must be an array');
    });

    it('validates redFlags: rejects non-array values', () => {
      const invalid = { ...validSampleResponse, redFlags: 'Difficulty breathing' };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('redFlags must be an array');
    });

    it('validates recommendedNextStep: rejects non-string values', () => {
      const invalid = { ...validSampleResponse, recommendedNextStep: 999 };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('recommendedNextStep must be a string');
    });

    it('validates requiresUrgentCare: rejects non-boolean values (e.g. string or number)', () => {
      const withString = { ...validSampleResponse, requiresUrgentCare: 'false' };
      const withNumber = { ...validSampleResponse, requiresUrgentCare: 0 };

      const resString = validateMedicalResponse(withString);
      expect(resString.valid).toBe(false);
      expect(resString.errors).toContain('requiresUrgentCare must be a boolean');

      const resNumber = validateMedicalResponse(withNumber);
      expect(resNumber.valid).toBe(false);
      expect(resNumber.errors).toContain('requiresUrgentCare must be a boolean');
    });

    it('validates requiresDoctorReview: rejects non-boolean values', () => {
      const withNumber = { ...validSampleResponse, requiresDoctorReview: 1 };
      const res = validateMedicalResponse(withNumber);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('requiresDoctorReview must be a boolean');
    });

    it('validates confidenceStatus: rejects non-string values', () => {
      const withNumber = { ...validSampleResponse, confidenceStatus: 95 };
      const res = validateMedicalResponse(withNumber);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('confidenceStatus must be a string');
    });

    it('accumulates all errors when multiple fields are invalid', () => {
      const multiInvalid = {
        ...validSampleResponse,
        chiefComplaint: 123,
        symptoms: 'Not an array',
        requiresUrgentCare: 'no',
        requiresDoctorReview: null,
      };
      const res = validateMedicalResponse(multiInvalid);
      expect(res.valid).toBe(false);
      expect(res.errors.length).toBeGreaterThanOrEqual(4);
      expect(res.errors).toContain('chiefComplaint must be a string');
      expect(res.errors).toContain('symptoms must be an array');
      expect(res.errors).toContain('requiresUrgentCare must be a boolean');
      expect(res.errors).toContain('requiresDoctorReview must be a boolean');
    });
  });

  // =========================================================================
  // SECTION 3: possibleConditions Deep Structure Validation
  // =========================================================================
  describe('possibleConditions Deep Structural Validation', () => {
    it('accepts condition objects with id, name, condition, supportingEvidence, redFlags, requiresDoctorReview', () => {
      const compliantConditions = {
        ...validSampleResponse,
        possibleConditions: [
          {
            id: 'cond-001',
            name: 'Acute Viral Bronchitis',
            condition: 'Acute Viral Bronchitis',
            supportingEvidence: ['Cough for 3 days', 'Low-grade fever'],
            redFlags: [],
            requiresDoctorReview: true,
          },
        ],
      };
      const res = validateMedicalResponse(compliantConditions);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('accepts condition object with name or condition string without fake numerical percentages', () => {
      const conditionWithName = {
        ...validSampleResponse,
        possibleConditions: [
          {
            id: 'cond-002',
            name: 'Gastroenteritis',
            supportingEvidence: ['Stomach ache', 'Nausea'],
          },
        ],
      };
      const res = validateMedicalResponse(conditionWithName);
      expect(res.valid).toBe(true);
    });

    it('rejects condition item if it is null or a primitive', () => {
      const withNullCondition = {
        ...validSampleResponse,
        possibleConditions: [null],
      };
      const resNull = validateMedicalResponse(withNullCondition);
      expect(resNull.valid).toBe(false);
      expect(resNull.errors).toContain('possibleConditions[0] must be an object');

      const withPrimitiveCondition = {
        ...validSampleResponse,
        possibleConditions: ['Viral Infection'],
      };
      const resPrim = validateMedicalResponse(withPrimitiveCondition);
      expect(resPrim.valid).toBe(false);
      expect(resPrim.errors).toContain('possibleConditions[0] must be an object');
    });

    it('rejects condition item missing both condition and name strings', () => {
      const missingNameAndCondition = {
        ...validSampleResponse,
        possibleConditions: [
          {
            id: 'cond-missing-name',
            supportingEvidence: ['Some evidence'],
          },
        ],
      };
      const res = validateMedicalResponse(missingNameAndCondition);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain("possibleConditions[0] must have a 'condition' or 'name' string");
    });

    it('rejects condition item with non-array supportingEvidence', () => {
      const nonArrayEvidence = {
        ...validSampleResponse,
        possibleConditions: [
          {
            condition: 'Malaria',
            supportingEvidence: 'High fever and chills', // should be an array
          },
        ],
      };
      const res = validateMedicalResponse(nonArrayEvidence);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('possibleConditions[0].supportingEvidence must be an array');
    });

    it('rejects condition item with non-array redFlags property when present', () => {
      const invalidRedFlags = {
        ...validSampleResponse,
        possibleConditions: [
          {
            name: 'Severe Pneumonia',
            supportingEvidence: ['Chest pain', 'Hypoxia'],
            redFlags: 'Oxygen saturation below 90%', // should be an array
          },
        ],
      };
      const res = validateMedicalResponse(invalidRedFlags);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('possibleConditions[0].redFlags must be an array');
    });

    it('rejects condition item with non-boolean requiresDoctorReview property when present', () => {
      const invalidDoctorReview = {
        ...validSampleResponse,
        possibleConditions: [
          {
            name: 'Dengue Fever',
            supportingEvidence: ['High fever'],
            requiresDoctorReview: 'mandatory', // should be boolean
          },
        ],
      };
      const res = validateMedicalResponse(invalidDoctorReview);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('possibleConditions[0].requiresDoctorReview must be a boolean');
    });

    it('reports exact index for each malformed condition item in a list', () => {
      const multipleConditions = {
        ...validSampleResponse,
        possibleConditions: [
          { name: 'Condition 1', supportingEvidence: [] }, // valid
          null, // index 1 invalid
          { condition: 'Condition 3', supportingEvidence: 'not an array' }, // index 2 invalid
        ],
      };
      const res = validateMedicalResponse(multipleConditions);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('possibleConditions[1] must be an object');
      expect(res.errors).toContain('possibleConditions[2].supportingEvidence must be an array');
    });
  });

  // =========================================================================
  // SECTION 4: Required vs Empty Safe Values (No Invented Data)
  // =========================================================================
  describe('Required Fields vs Safe Empty Values (No Assumptions)', () => {
    it('accepts safe empty arrays without inventing information', () => {
      const safeEmptyResponse = {
        chiefComplaint: 'General Health Assessment',
        symptoms: [],
        duration: '',
        severity: '',
        measurements: {},
        medicalHistory: [],
        medications: [],
        allergies: [],
        observations: [],
        possibleConditions: [],
        supportingEvidence: [],
        missingInformation: [],
        redFlags: [],
        recommendedNextStep: 'Consult a primary care physician for routine evaluation.',
        requiresUrgentCare: false,
        requiresDoctorReview: true,
        confidenceStatus: 'NOT_CLINICALLY_VALIDATED',
      };

      const res = validateMedicalResponse(safeEmptyResponse);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
      expect(safeEmptyResponse.symptoms).toEqual([]);
      expect(safeEmptyResponse.medicalHistory).toEqual([]);
      expect(safeEmptyResponse.medications).toEqual([]);
      expect(safeEmptyResponse.allergies).toEqual([]);
      expect(safeEmptyResponse.missingInformation).toEqual([]);
      expect(safeEmptyResponse.redFlags).toEqual([]);
    });

    it('accepts explicit confidenceStatus values like UNAVAILABLE or INSUFFICIENT_INFORMATION', () => {
      const resUnavailable = validateMedicalResponse({
        ...validSampleResponse,
        confidenceStatus: 'UNAVAILABLE',
      });
      expect(resUnavailable.valid).toBe(true);

      const resInsufficient = validateMedicalResponse({
        ...validSampleResponse,
        confidenceStatus: 'INSUFFICIENT_INFORMATION',
      });
      expect(resInsufficient.valid).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 5: Medical Values Preservation (Never Altered by Validator)
  // =========================================================================
  describe('Medical Values & Drug Names Preservation', () => {
    it('validates without modifying temperatures, pressures, lab values, and dates', () => {
      const inputData = {
        ...validSampleResponse,
        chiefComplaint: 'Fever 102°F, BP 120/80 on 23 September 2026 at 8:30 AM',
        measurements: {
          temp: '102°F',
          bp: '120/80',
          glucose: '180 mg/dL',
          spo2: '94%',
          weight: '55 kg',
          pulse: '62',
        },
        duration: '3 days',
        medications: ['Paracetamol', 'Amoxicillin', 'Metformin', 'Insulin'],
      };

      // Clone original values for strict equality check
      const originalTemp = inputData.measurements.temp;
      const originalBp = inputData.measurements.bp;
      const originalGlucose = inputData.measurements.glucose;
      const originalSpo2 = inputData.measurements.spo2;
      const originalWeight = inputData.measurements.weight;
      const originalPulse = inputData.measurements.pulse;
      const originalMeds = [...inputData.medications];

      const res = validateMedicalResponse(inputData);
      expect(res.valid).toBe(true);

      // Verify no mutation occurred
      expect(inputData.measurements.temp).toBe(originalTemp);
      expect(inputData.measurements.temp).toBe('102°F');
      expect(inputData.measurements.bp).toBe(originalBp);
      expect(inputData.measurements.bp).toBe('120/80');
      expect(inputData.measurements.glucose).toBe(originalGlucose);
      expect(inputData.measurements.glucose).toBe('180 mg/dL');
      expect(inputData.measurements.spo2).toBe(originalSpo2);
      expect(inputData.measurements.spo2).toBe('94%');
      expect(inputData.measurements.weight).toBe(originalWeight);
      expect(inputData.measurements.weight).toBe('55 kg');
      expect(inputData.measurements.pulse).toBe(originalPulse);
      expect(inputData.measurements.pulse).toBe('62');
      expect(inputData.duration).toBe('3 days');
      expect(inputData.medications).toEqual(originalMeds);
      expect(inputData.medications).toEqual(['Paracetamol', 'Amoxicillin', 'Metformin', 'Insulin']);
    });
  });

  // =========================================================================
  // SECTION 6: Safe Structured Fallback Mechanism
  // =========================================================================
  describe('Safe Structured Fallback Mechanism', () => {
    it('creates a safe non-hallucinated fallback via createSafeMedicalFallback', () => {
      const fallback = createSafeMedicalFallback(false);

      expect(fallback.chiefComplaint).toBe('');
      expect(fallback.symptoms).toEqual([]);
      expect(fallback.duration).toBe('');
      expect(fallback.severity).toBe('');
      expect(fallback.measurements).toEqual({});
      expect(fallback.medicalHistory).toEqual([]);
      expect(fallback.medications).toEqual([]);
      expect(fallback.allergies).toEqual([]);
      expect(fallback.observations).toEqual([]);
      expect(fallback.possibleConditions).toEqual([]);
      expect(fallback.supportingEvidence).toEqual([]);
      expect(fallback.missingInformation).toEqual([]);
      expect(fallback.redFlags).toEqual([]);
      expect(fallback.requiresUrgentCare).toBe(false);
      expect(fallback.requiresDoctorReview).toBe(true);
      expect(fallback.confidenceStatus).toBe('UNAVAILABLE');
      expect(fallback.recommendedNextStep).toContain('could not be generated reliably');
      expect(fallback.recommendedNextStep).toContain('consult a qualified healthcare professional');

      // The fallback itself must also strictly pass validateMedicalResponse
      const validation = validateMedicalResponse(fallback);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('falls back to safe response when medicalService.validateOutput receives corrupted data', () => {
      const corruptData: any = {
        chiefComplaint: 12345, // invalid type
        symptoms: 'fever', // invalid type
        duration: null,
        severity: 99,
        measurements: null,
        possibleConditions: 'None',
      };

      const result = medicalService.validateOutput(corruptData);
      expect(result).toBeDefined();
      expect(result.requiresDoctorReview).toBe(true);
      expect(result.confidenceStatus).toBe('UNAVAILABLE');
      expect(result.recommendedNextStep).toContain('could not be generated reliably');
      expect(result.possibleConditions).toEqual([]);
      expect(result.symptoms).toEqual([]);

      // Ensure output passes validateMedicalResponse
      const validation = validateMedicalResponse(result);
      expect(validation.valid).toBe(true);
    });
  });

  // =========================================================================
  // SECTION 7: Emergency Safety Pathways & Multilingual Red Flags
  // =========================================================================
  describe('Emergency Condition Pathways & Safety Prioritization', () => {
    it('evaluates emergency rules before differential reasoning and produces valid response', async () => {
      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'Severe crushing chest pain radiating to left arm and jaw with profuse sweating',
        language: 'en',
        forceOffline: true,
      });

      // Must be flagged as emergency
      expect(res.emergencyDetected).toBe(true);
      expect(res.requiresUrgentCare).toBe(true);
      expect(res.redFlags.length).toBeGreaterThan(0);
      expect(res.recommendedNextStep).toContain('108');

      // Emergency response MUST successfully pass validateMedicalResponse
      const validation = validateMedicalResponse(res);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('preserves emergency triage pathway for Tamil critical input: எனக்கு மூச்சு விட முடியவில்லை', async () => {
      const tamilEmergencyRes = await medicalService.analyzeMedicalRequest({
        patientInput: 'எனக்கு மூச்சு விட முடியவில்லை.',
        language: 'ta',
        forceOffline: true,
      });

      expect(tamilEmergencyRes.emergencyDetected).toBe(true);
      expect(tamilEmergencyRes.requiresUrgentCare).toBe(true);
      expect(tamilEmergencyRes.redFlags.length).toBeGreaterThan(0);
      expect(tamilEmergencyRes.recommendedNextStep).toContain('108');

      // Response must strictly satisfy schema validation
      const validation = validateMedicalResponse(tamilEmergencyRes);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('preserves emergency triage pathway for Hindi critical input: सांस नहीं आ रही और सीने में तेज दर्द', async () => {
      const hindiEmergencyRes = await medicalService.analyzeMedicalRequest({
        patientInput: 'मरीज को सांस नहीं आ रही है और सीने में तेज दर्द है',
        language: 'hi',
        forceOffline: true,
      });

      expect(hindiEmergencyRes.emergencyDetected).toBe(true);
      expect(hindiEmergencyRes.requiresUrgentCare).toBe(true);
      expect(hindiEmergencyRes.redFlags.length).toBeGreaterThan(0);

      const validation = validateMedicalResponse(hindiEmergencyRes);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('creates an emergency-safe fallback when corrupted data contains emergency indicators', () => {
      const emergencyFallback = createSafeMedicalFallback(true, [
        'Acute chest pain or respiratory failure',
      ]);

      expect(emergencyFallback.requiresUrgentCare).toBe(true);
      expect(emergencyFallback.emergencyDetected).toBe(true);
      expect(emergencyFallback.redFlags).toContain('Acute chest pain or respiratory failure');
      expect(emergencyFallback.recommendedNextStep).toContain('108');

      // Must validate cleanly
      const validation = validateMedicalResponse(emergencyFallback);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  // =========================================================================
  // SECTION 8: 100% Offline Capability (navigator.onLine === false)
  // =========================================================================
  describe('Offline Execution Guarantee', () => {
    it('executes validateMedicalResponse without network connectivity', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { onLine: false },
        writable: true,
        configurable: true,
      });

      expect(navigator.onLine).toBe(false);

      const res = validateMedicalResponse(validSampleResponse);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('full offline reasoning and validation works with navigator.onLine === false', async () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { onLine: false },
        writable: true,
        configurable: true,
      });

      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'Fever of 101°F with headache for 2 days',
        language: 'en',
        forceOffline: true,
      });

      expect(res.mode).toBe('OFFLINE');
      expect(res.source).toBe('LOCAL_MEDICAL_ENGINE');
      expect(res.symptoms).toContain('Fever');

      const validation = validateMedicalResponse(res);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  // =========================================================================
  // SECTION 9: Multilingual Symptom Normalization & Offline Reasoning Engine
  // =========================================================================
  describe('Multilingual Symptom Normalization Across Supported Indian Languages', () => {
    it('normalizes English symptoms into canonical tokens', async () => {
      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'I have had a high temperature and feverish chills for 2 days with severe cough',
        language: 'en',
        forceOffline: true,
      });
      expect(res.symptoms).toContain('Fever');
      expect(res.symptoms).toContain('Cough');
      expect(res.duration).toBe('2 days');
      expect(validateMedicalResponse(res).valid).toBe(true);
    });

    it('normalizes Tamil symptoms (காய்ச்சல், இருமல், வயிற்று வலி)', async () => {
      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'எனக்கு காய்ச்சல் மற்றும் இருமல் 2 நாட்களாக உள்ளது',
        language: 'ta',
        forceOffline: true,
      });
      expect(res.symptoms).toContain('Fever');
      expect(res.symptoms).toContain('Cough');
      expect(validateMedicalResponse(res).valid).toBe(true);
    });

    it('normalizes Hindi symptoms (बुखार, खांसी, उल्टी)', async () => {
      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'मुझे 3 दिन से तेज बुखार और खांसी है',
        language: 'hi',
        forceOffline: true,
      });
      expect(res.symptoms).toContain('Fever');
      expect(res.symptoms).toContain('Cough');
      expect(validateMedicalResponse(res).valid).toBe(true);
    });

    it('normalizes Telugu symptoms (జ్వరం, దగ్గు)', async () => {
      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'నాకు 2 రోజుల నుండి జ్వరం మరియు దగ్గు ఉంది',
        language: 'te',
        forceOffline: true,
      });
      expect(res.symptoms).toContain('Fever');
      expect(res.symptoms).toContain('Cough');
      expect(validateMedicalResponse(res).valid).toBe(true);
    });

    it('normalizes Malayalam symptoms (പനി, ചുമ)', async () => {
      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'എനിക്ക് പനിയും ചുമയും ഉണ്ട്',
        language: 'ml',
        forceOffline: true,
      });
      expect(res.symptoms).toContain('Fever');
      expect(res.symptoms).toContain('Cough');
      expect(validateMedicalResponse(res).valid).toBe(true);
    });

    it('normalizes Kannada symptoms (ಜ್ವರ, ಕೆಮ್ಮು)', async () => {
      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'ನನಗೆ ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮು ಇದೆ',
        language: 'kn',
        forceOffline: true,
      });
      expect(res.symptoms).toContain('Fever');
      expect(res.symptoms).toContain('Cough');
      expect(validateMedicalResponse(res).valid).toBe(true);
    });
  });
});

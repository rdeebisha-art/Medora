import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { medicalService, validateMedicalResponse } from './medicalService';

describe('MedicalService - Offline Reasoning Pipeline (medicalService.test.ts)', () => {
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

  // =========================================================================
  // 1. Multilingual Symptom Normalization (EN, TA, HI, TE, ML, KN)
  // =========================================================================
  describe('Multilingual Symptom Normalization', () => {
    it('normalizes English symptom descriptions into canonical tokens', async () => {
      const feverRes = await medicalService.analyzeMedicalRequest({
        patientInput: 'I have had a high temperature and feverish chills for 2 days',
        language: 'en',
        forceOffline: true,
      });
      expect(feverRes.symptoms).toContain('Fever');
      expect(feverRes.duration).toBe('2 days');

      const coughRes = await medicalService.analyzeMedicalRequest({
        patientInput: 'I have severe coughing with sputum',
        language: 'en',
        forceOffline: true,
      });
      expect(coughRes.symptoms).toContain('Cough');

      const stomachRes = await medicalService.analyzeMedicalRequest({
        patientInput: 'I have bad stomach pain and belly ache',
        language: 'en',
        forceOffline: true,
      });
      expect(stomachRes.symptoms.some(s => s.toLowerCase().includes('stomach'))).toBe(true);
    });

    it('normalizes Tamil symptom descriptions (காய்ச்சல், இருமல், வயிற்று வலி)', async () => {
      const resFever = await medicalService.analyzeMedicalRequest({
        patientInput: 'எனக்கு காய்ச்சல் மற்றும் உடல் சூடு இருக்கிறது',
        language: 'ta',
        forceOffline: true,
      });
      expect(resFever.symptoms).toContain('Fever');

      const resCough = await medicalService.analyzeMedicalRequest({
        patientInput: 'எனக்கு இருமல் மற்றும் சளி இருக்கிறது',
        language: 'ta',
        forceOffline: true,
      });
      expect(resCough.symptoms).toContain('Cough');

      const resStomach = await medicalService.analyzeMedicalRequest({
        patientInput: 'எனக்கு வயிற்று வலி மற்றும் குமட்டல் உள்ளது',
        language: 'ta',
        forceOffline: true,
      });
      expect(resStomach.symptoms.some(s => s.toLowerCase().includes('stomach'))).toBe(true);
    });

    it('normalizes Hindi symptom descriptions (बुखार, खांसी, पेट दर्द)', async () => {
      const resFever = await medicalService.analyzeMedicalRequest({
        patientInput: 'मुझे तेज बुखार और बदन गरम लग रहा है',
        language: 'hi',
        forceOffline: true,
      });
      expect(resFever.symptoms).toContain('Fever');

      const resCough = await medicalService.analyzeMedicalRequest({
        patientInput: 'मुझे सूखी खांसी और कफ आ रहा है',
        language: 'hi',
        forceOffline: true,
      });
      expect(resCough.symptoms).toContain('Cough');

      const resStomach = await medicalService.analyzeMedicalRequest({
        patientInput: 'मेरे पेट में दर्द और मरोड़ हो रहा है',
        language: 'hi',
        forceOffline: true,
      });
      expect(resStomach.symptoms.some(s => s.toLowerCase().includes('stomach'))).toBe(true);
    });

    it('normalizes Telugu symptom descriptions (జ్వరం, దగ్గు, కడుపు నొప్పి)', async () => {
      const resFever = await medicalService.analyzeMedicalRequest({
        patientInput: 'నాకు జ్వరం వచ్చింది ఒళ్లు వేడిగా ఉంది',
        language: 'te',
        forceOffline: true,
      });
      expect(resFever.symptoms).toContain('Fever');

      const resCough = await medicalService.analyzeMedicalRequest({
        patientInput: 'నాకు తీవ్రమైన దగ్గు వస్తోంది',
        language: 'te',
        forceOffline: true,
      });
      expect(resCough.symptoms).toContain('Cough');

      const resStomach = await medicalService.analyzeMedicalRequest({
        patientInput: 'నాకు కడుపు నొప్పి పిసికినట్టుంది',
        language: 'te',
        forceOffline: true,
      });
      expect(resStomach.symptoms.some(s => s.toLowerCase().includes('stomach'))).toBe(true);
    });

    it('normalizes Malayalam symptom descriptions (പനി, ചുമ, വയറുവേദന)', async () => {
      const resFever = await medicalService.analyzeMedicalRequest({
        patientInput: 'എനിക്ക് പനിയാണ് ശരീരം നല്ല ചൂട്',
        language: 'ml',
        forceOffline: true,
      });
      expect(resFever.symptoms).toContain('Fever');

      const resCough = await medicalService.analyzeMedicalRequest({
        patientInput: 'എനിക്ക് കടുത്ത ചുമയും ജലദോഷവും ഉണ്ട്',
        language: 'ml',
        forceOffline: true,
      });
      expect(resCough.symptoms).toContain('Cough');

      const resStomach = await medicalService.analyzeMedicalRequest({
        patientInput: 'എനിക്ക് വയറുവേദനയും ഛർദ്ദിയും ഉണ്ട്',
        language: 'ml',
        forceOffline: true,
      });
      expect(resStomach.symptoms.some(s => s.toLowerCase().includes('stomach'))).toBe(true);
    });

    it('normalizes Kannada symptom descriptions (ಜ್ವರ, ಕೆಮ್ಮು, ಹೊಟ್ಟೆ ನೋವು)', async () => {
      const resFever = await medicalService.analyzeMedicalRequest({
        patientInput: 'ನನಗೆ ಜ್ವರ ಬಂದಿದೆ ಮೈ ಬಿಸಿಯಾಗಿದೆ',
        language: 'kn',
        forceOffline: true,
      });
      expect(resFever.symptoms).toContain('Fever');

      const resCough = await medicalService.analyzeMedicalRequest({
        patientInput: 'ನನಗೆ ಕೆಮ್ಮು ಮತ್ತು ನೆಗಡಿ ಇದೆ',
        language: 'kn',
        forceOffline: true,
      });
      expect(resCough.symptoms).toContain('Cough');

      const resStomach = await medicalService.analyzeMedicalRequest({
        patientInput: 'ನನಗೆ ಹೊಟ್ಟೆ ನೋವು ಮತ್ತು ವಾಂತಿ ಇದೆ',
        language: 'kn',
        forceOffline: true,
      });
      expect(resStomach.symptoms.some(s => s.toLowerCase().includes('stomach'))).toBe(true);
    });
  });

  // =========================================================================
  // 2. Emergency Rule Triggering & Prioritization
  // =========================================================================
  describe('Emergency Rule Triggering and Prioritization', () => {
    it('prioritizes breathing difficulty emergency across languages', async () => {
      // English
      const enRes = await medicalService.analyzeMedicalRequest({
        patientInput: 'I cannot breathe and I am gasping for air',
        language: 'en',
        forceOffline: true,
      });
      expect(enRes.emergencyDetected).toBe(true);
      expect(enRes.requiresUrgentCare).toBe(true);
      expect(enRes.severity).toContain('Severe');
      expect(enRes.recommendedNextStep).toContain('108');

      // Tamil
      const taRes = await medicalService.analyzeMedicalRequest({
        patientInput: 'எனக்கு மூச்சு விட முடியவில்லை கடுமையான மூச்சுத்திணறல்',
        language: 'ta',
        forceOffline: true,
      });
      expect(taRes.emergencyDetected).toBe(true);
      expect(taRes.requiresUrgentCare).toBe(true);

      // Hindi
      const hiRes = await medicalService.analyzeMedicalRequest({
        patientInput: 'सांस नहीं आ रही दम घुट रहा है',
        language: 'hi',
        forceOffline: true,
      });
      expect(hiRes.emergencyDetected).toBe(true);
      expect(hiRes.requiresUrgentCare).toBe(true);
    });

    it('prioritizes acute cardiac / chest pain emergencies', async () => {
      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'Crushing chest pain radiating to left arm with cold sweat',
        language: 'en',
        forceOffline: true,
      });
      expect(res.emergencyDetected).toBe(true);
      expect(res.requiresUrgentCare).toBe(true);
      expect(res.redFlags.length).toBeGreaterThan(0);
      expect(res.recommendedNextStep).toMatch(/108|ambulance|hospital/i);
    });

    it('prioritizes unconsciousness and altered sensorium', async () => {
      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'Patient is unconscious and unresponsive',
        language: 'en',
        forceOffline: true,
      });
      expect(res.emergencyDetected).toBe(true);
      expect(res.requiresUrgentCare).toBe(true);
      expect(res.redFlags.some(rf => rf.toLowerCase().includes('unresponsive') || rf.toLowerCase().includes('consciousness') || rf.toLowerCase().includes('unconscious'))).toBe(true);
    });

    it('prioritizes emergency when both emergency red flags and non-urgent symptoms coexist', async () => {
      const mixedRes = await medicalService.analyzeMedicalRequest({
        patientInput: 'I have had mild cough for 3 days and now sudden crushing chest pain and cannot breathe',
        language: 'en',
        forceOffline: true,
      });
      expect(mixedRes.emergencyDetected).toBe(true);
      expect(mixedRes.requiresUrgentCare).toBe(true);
      expect(mixedRes.symptoms).toContain('Cough');
      expect(mixedRes.redFlags.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 3. Structured JSON Response Schema Compliance
  // =========================================================================
  describe('Structured JSON Response Schema Compliance', () => {
    it('returns strictly conformant structured response adhering to Medora schema', async () => {
      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'Fever 102°F and cough for 3 days, blood pressure 120/80',
        language: 'en',
        forceOffline: true,
      });

      // Verify required top-level attributes
      expect(res).toHaveProperty('mode');
      expect(res).toHaveProperty('chiefComplaint');
      expect(res).toHaveProperty('symptoms');
      expect(res).toHaveProperty('duration');
      expect(res).toHaveProperty('severity');
      expect(res).toHaveProperty('measurements');
      expect(res).toHaveProperty('allergies');
      expect(res).toHaveProperty('observations');
      expect(res).toHaveProperty('possibleConditions');
      expect(res).toHaveProperty('supportingEvidence');
      expect(res).toHaveProperty('missingInformation');
      expect(res).toHaveProperty('redFlags');
      expect(res).toHaveProperty('emergencyDetected');
      expect(res).toHaveProperty('recommendedNextStep');
      expect(res).toHaveProperty('requiresUrgentCare');
      expect(res).toHaveProperty('requiresDoctorReview');
      expect(res).toHaveProperty('confidenceStatus');
      expect(res).toHaveProperty('source');

      // Value preservation checks
      expect(res.measurements).toContain('Temperature: 102°F');
      expect(res.measurements).toContain('Blood Pressure: 120/80');
      expect(res.duration).toBe('3 days');

      // Clinical safety boundary checks
      expect(res.mode).toBe('OFFLINE');
      expect(res.source).toBe('LOCAL_MEDICAL_ENGINE');
      expect(res.confidenceStatus).toBe('NOT_CLINICALLY_VALIDATED');
      expect(res.requiresDoctorReview).toBe(true);

      // Differential condition schema checks
      expect(res.possibleConditions.length).toBeGreaterThan(0);
      const firstCond = res.possibleConditions[0];
      expect(firstCond).toHaveProperty('condition');
      expect(firstCond).toHaveProperty('supportingEvidence');
      expect(firstCond).toHaveProperty('contradictingEvidence');
      expect(firstCond).toHaveProperty('missingInformation');
      expect(firstCond).toHaveProperty('reasoning');
      expect(Array.isArray(firstCond.supportingEvidence)).toBe(true);
      expect(Array.isArray(firstCond.contradictingEvidence)).toBe(true);
      expect(Array.isArray(firstCond.missingInformation)).toBe(true);
      expect(typeof firstCond.reasoning).toBe('string');
    });

    it('safely handles unknown or non-medical queries with INSUFFICIENT_INFORMATION status', async () => {
      const res = await medicalService.analyzeMedicalRequest({
        patientInput: 'Hello there, how are you doing today?',
        language: 'en',
        forceOffline: true,
      });
      expect(res.confidenceStatus).toBe('INSUFFICIENT_INFORMATION');
      expect(res.emergencyDetected).toBe(false);
      expect(res.requiresDoctorReview).toBe(true);
      expect(res.recommendedNextStep).toContain("don't have enough information");
    });

    it('validates schema strictly using validateSchema utility', async () => {
      const validRes = await medicalService.analyzeMedicalRequest({
        patientInput: 'High fever for 2 days with headache',
        language: 'en',
        forceOffline: true,
      });

      const validation = medicalService.validateSchema(validRes);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Incomplete schema check
      const brokenRes = { ...validRes, mode: undefined, possibleConditions: 'invalid' };
      const failedValidation = medicalService.validateSchema(brokenRes);
      expect(failedValidation.isValid).toBe(false);
      expect(failedValidation.errors.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 4. validateMedicalResponse Schema Validator Tests (Task Section 13)
  // =========================================================================
  describe('validateMedicalResponse Schema Validator Tests', () => {
    const validSampleResponse = {
      chiefComplaint: 'Acute Fever and Persistent Cough',
      symptoms: ['Fever', 'Cough'],
      duration: '3 days',
      severity: 'Moderate',
      measurements: { temperature: '102°F', bloodPressure: '120/80' },
      medicalHistory: ['Hypertension'],
      medications: ['Paracetamol'],
      allergies: ['Penicillin'],
      observations: ['Mild pharyngeal erythema'],
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
      missingInformation: ['CBC platelet count'],
      redFlags: [],
      recommendedNextStep: 'Consult a primary care physician at the nearest PHC.',
      requiresUrgentCare: false,
      requiresDoctorReview: true,
      confidenceStatus: 'NOT_CLINICALLY_VALIDATED',
    };

    it('✓ completely valid response passes validation with 0 errors', () => {
      const res = validateMedicalResponse(validSampleResponse);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('✓ missing chiefComplaint fails validation', () => {
      const invalid = { ...validSampleResponse, chiefComplaint: undefined };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('chiefComplaint must be a string');
    });

    it('✓ symptoms is not an array fails validation', () => {
      const invalid = { ...validSampleResponse, symptoms: 'fever, cough' };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('symptoms must be an array');
    });

    it('✓ possibleConditions is not an array fails validation', () => {
      const invalid = { ...validSampleResponse, possibleConditions: 'Viral URI' };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('possibleConditions must be an array');
    });

    it('✓ requiresUrgentCare is not boolean fails validation', () => {
      const invalid = { ...validSampleResponse, requiresUrgentCare: 'false' };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('requiresUrgentCare must be a boolean');
    });

    it('✓ requiresDoctorReview is not boolean fails validation', () => {
      const invalid = { ...validSampleResponse, requiresDoctorReview: 1 };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('requiresDoctorReview must be a boolean');
    });

    it('✓ redFlags is not an array fails validation', () => {
      const invalid = { ...validSampleResponse, redFlags: 'none' };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('redFlags must be an array');
    });

    it('✓ recommendedNextStep is not a string fails validation', () => {
      const invalid = { ...validSampleResponse, recommendedNextStep: 12345 };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors).toContain('recommendedNextStep must be a string');
    });

    it('✓ malformed possibleCondition object fails validation', () => {
      const invalid = {
        ...validSampleResponse,
        possibleConditions: [
          'not-an-object',
          { condition: 123, supportingEvidence: 'not-an-array' },
        ],
      };
      const res = validateMedicalResponse(invalid);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('possibleConditions'))).toBe(true);
    });

    it('✓ empty arrays are accepted without inventing information', () => {
      const minimalValid = {
        chiefComplaint: 'Routine check',
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
        recommendedNextStep: 'Routine evaluation advised.',
        requiresUrgentCare: false,
        requiresDoctorReview: true,
        confidenceStatus: 'NOT_CLINICALLY_VALIDATED',
      };
      const res = validateMedicalResponse(minimalValid);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('✓ unavailable confidence status is accepted', () => {
      const unavailableStatusRes = {
        ...validSampleResponse,
        confidenceStatus: 'UNAVAILABLE',
      };
      const res = validateMedicalResponse(unavailableStatusRes);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('✓ emergency response still validates and preserves urgent flags', async () => {
      const emergencyResult = await medicalService.analyzeMedicalRequest({
        patientInput: 'Patient has crushing chest pain radiating to left arm and cannot breathe',
        language: 'en',
        forceOffline: true,
      });

      const res = validateMedicalResponse(emergencyResult);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
      expect(emergencyResult.emergencyDetected).toBe(true);
      expect(emergencyResult.requiresUrgentCare).toBe(true);
      expect(emergencyResult.redFlags.length).toBeGreaterThan(0);
    });

    it('✓ validator works without network access (offline navigator)', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { onLine: false },
        writable: true,
        configurable: true,
      });

      const res = validateMedicalResponse(validSampleResponse);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    // =========================================================================
    // Edge Cases: Malformed Payloads & Primitive Inputs
    // =========================================================================
    describe('Primitive and Malformed Root Payloads', () => {
      it('rejects null input gracefully without throwing', () => {
        const res = validateMedicalResponse(null);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('Response must be a non-null object.');
      });

      it('rejects undefined input gracefully without throwing', () => {
        const res = validateMedicalResponse(undefined);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('Response must be a non-null object.');
      });

      it('rejects primitive string input without throwing', () => {
        const res = validateMedicalResponse('Patient has fever');
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('Response must be a non-null object.');
      });

      it('rejects primitive number input without throwing', () => {
        const res = validateMedicalResponse(102);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('Response must be a non-null object.');
      });

      it('rejects primitive boolean input without throwing', () => {
        const res = validateMedicalResponse(true);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('Response must be a non-null object.');
      });

      it('rejects an array passed as root response without throwing', () => {
        const res = validateMedicalResponse([validSampleResponse]);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('Response must be a non-null object.');
      });

      it('rejects an empty object and lists all missing required schema fields', () => {
        const res = validateMedicalResponse({});
        expect(res.valid).toBe(false);
        expect(res.errors.length).toBeGreaterThanOrEqual(16);
        expect(res.errors).toContain('chiefComplaint must be a string');
        expect(res.errors).toContain('symptoms must be an array');
        expect(res.errors).toContain('duration must be a string');
        expect(res.errors).toContain('severity must be a string');
        expect(res.errors).toContain('measurements must be an object');
        expect(res.errors).toContain('medicalHistory must be an array');
        expect(res.errors).toContain('medications must be an array');
        expect(res.errors).toContain('allergies must be an array');
        expect(res.errors).toContain('observations must be an array');
        expect(res.errors).toContain('possibleConditions must be an array');
        expect(res.errors).toContain('supportingEvidence must be an array');
        expect(res.errors).toContain('missingInformation must be an array');
        expect(res.errors).toContain('redFlags must be an array');
        expect(res.errors).toContain('recommendedNextStep must be a string');
        expect(res.errors).toContain('requiresUrgentCare must be a boolean');
        expect(res.errors).toContain('requiresDoctorReview must be a boolean');
        expect(res.errors).toContain('confidenceStatus must be a string');
      });
    });

    // =========================================================================
    // Edge Cases: Type Mismatches for Individual Fields
    // =========================================================================
    describe('Type Mismatches for Individual Fields', () => {
      it('rejects duration if not a string (e.g. number 3 instead of "3 days")', () => {
        const invalid = { ...validSampleResponse, duration: 3 };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('duration must be a string');
      });

      it('rejects severity if not a string (e.g. boolean true)', () => {
        const invalid = { ...validSampleResponse, severity: true };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('severity must be a string');
      });

      it('rejects measurements if null', () => {
        const invalid = { ...validSampleResponse, measurements: null };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('measurements must be an object');
      });

      it('rejects measurements if a primitive string (e.g. "120/80")', () => {
        const invalid = { ...validSampleResponse, measurements: '120/80 BP' };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('measurements must be an object');
      });

      it('accepts measurements if array of string vitals or object map', () => {
        const withArrayMeasurements = {
          ...validSampleResponse,
          measurements: ['102°F', '120/80 mmHg'],
        };
        const res1 = validateMedicalResponse(withArrayMeasurements);
        expect(res1.valid).toBe(true);

        const withObjectMeasurements = {
          ...validSampleResponse,
          measurements: { temp: '102°F', bp: '120/80' },
        };
        const res2 = validateMedicalResponse(withObjectMeasurements);
        expect(res2.valid).toBe(true);
      });

      it('rejects medicalHistory if not an array (e.g. object)', () => {
        const invalid = { ...validSampleResponse, medicalHistory: { history: 'None' } };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('medicalHistory must be an array');
      });

      it('rejects medications if not an array (e.g. string)', () => {
        const invalid = { ...validSampleResponse, medications: 'Paracetamol 650mg' };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('medications must be an array');
      });

      it('rejects allergies if not an array (e.g. number)', () => {
        const invalid = { ...validSampleResponse, allergies: 0 };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('allergies must be an array');
      });

      it('rejects observations if not an array', () => {
        const invalid = { ...validSampleResponse, observations: 'Patient looks pale' };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('observations must be an array');
      });

      it('rejects supportingEvidence if not an array', () => {
        const invalid = { ...validSampleResponse, supportingEvidence: 'Fever for 3 days' };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('supportingEvidence must be an array');
      });

      it('rejects missingInformation if not an array', () => {
        const invalid = { ...validSampleResponse, missingInformation: null };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('missingInformation must be an array');
      });

      it('rejects confidenceStatus if not a string (e.g. number 95)', () => {
        const invalid = { ...validSampleResponse, confidenceStatus: 95 };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('confidenceStatus must be a string');
      });
    });

    // =========================================================================
    // Edge Cases: possibleConditions Array and Item Validation
    // =========================================================================
    describe('possibleConditions Deep Structural Validation', () => {
      it('accepts possibleConditions using condition or name property', () => {
        const withNameOnly = {
          ...validSampleResponse,
          possibleConditions: [
            {
              id: 'cond-1',
              name: 'Viral Bronchitis',
              supportingEvidence: ['Cough', 'Low fever'],
            },
          ],
        };
        const res = validateMedicalResponse(withNameOnly);
        expect(res.valid).toBe(true);
      });

      it('rejects condition item missing both condition and name strings', () => {
        const invalid = {
          ...validSampleResponse,
          possibleConditions: [
            {
              id: 'cond-1',
              supportingEvidence: ['Evidence 1'],
            },
          ],
        };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain("possibleConditions[0] must have a 'condition' or 'name' string");
      });

      it('rejects condition item with non-array supportingEvidence', () => {
        const invalid = {
          ...validSampleResponse,
          possibleConditions: [
            {
              condition: 'Malaria',
              supportingEvidence: 'High fever with chills',
            },
          ],
        };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('possibleConditions[0].supportingEvidence must be an array');
      });

      it('rejects condition item with non-array redFlags property', () => {
        const invalid = {
          ...validSampleResponse,
          possibleConditions: [
            {
              condition: 'Pneumonia',
              supportingEvidence: ['Chest pain'],
              redFlags: 'Stridor detected',
            },
          ],
        };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('possibleConditions[0].redFlags must be an array');
      });

      it('rejects condition item with non-boolean requiresDoctorReview property', () => {
        const invalid = {
          ...validSampleResponse,
          possibleConditions: [
            {
              condition: 'Dengue Fever',
              supportingEvidence: ['High fever'],
              requiresDoctorReview: 'mandatory',
            },
          ],
        };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('possibleConditions[0].requiresDoctorReview must be a boolean');
      });

      it('reports multiple error indices when several condition items are malformed', () => {
        const invalid = {
          ...validSampleResponse,
          possibleConditions: [
            null,
            { supportingEvidence: [] }, // missing condition/name
            { condition: 'Asthma', supportingEvidence: 'Wheezing' }, // non-array supportingEvidence
          ],
        };
        const res = validateMedicalResponse(invalid);
        expect(res.valid).toBe(false);
        expect(res.errors).toContain('possibleConditions[0] must be an object');
        expect(res.errors).toContain("possibleConditions[1] must have a 'condition' or 'name' string");
        expect(res.errors).toContain('possibleConditions[2].supportingEvidence must be an array');
      });
    });

    // =========================================================================
    // Edge Cases: Medical Values Preservation & Safety Fallback
    // =========================================================================
    describe('Medical Values Preservation & Safe Fallback', () => {
      it('preserves medical numbers without alteration during validation', () => {
        const payloadWithExactNumbers = {
          ...validSampleResponse,
          chiefComplaint: 'Fever 102°F and BP 120/80',
          measurements: {
            temperature: '102°F',
            bloodPressure: '120/80',
            bloodSugar: '180 mg/dL',
            spo2: '94%',
            weight: '55 kg',
            pulse: '62 bpm',
          },
          duration: '3 days',
          medications: ['Paracetamol', 'Amoxicillin', 'Metformin', 'Insulin'],
        };

        const res = validateMedicalResponse(payloadWithExactNumbers);
        expect(res.valid).toBe(true);

        // Confirm original values in payload were not mutated in place
        expect(payloadWithExactNumbers.measurements.temperature).toBe('102°F');
        expect(payloadWithExactNumbers.measurements.bloodPressure).toBe('120/80');
        expect(payloadWithExactNumbers.measurements.bloodSugar).toBe('180 mg/dL');
        expect(payloadWithExactNumbers.measurements.spo2).toBe('94%');
        expect(payloadWithExactNumbers.measurements.weight).toBe('55 kg');
        expect(payloadWithExactNumbers.medications).toEqual(['Paracetamol', 'Amoxicillin', 'Metformin', 'Insulin']);
      });

      it('safely falls back via medicalService.validateOutput if input is corrupted', () => {
        const corruptPayload: any = {
          chiefComplaint: 12345, // invalid type
          symptoms: 'Not an array', // invalid type
          duration: null, // invalid type
          severity: 99, // invalid type
          measurements: null,
          possibleConditions: 'None',
        };

        const validatedOutput = medicalService.validateOutput(corruptPayload);
        // validateOutput detects schema violation and returns safe fallback
        expect(validatedOutput).toBeDefined();
        expect(validatedOutput.requiresDoctorReview).toBe(true);
        expect(validatedOutput.confidenceStatus).toBe('UNAVAILABLE');
        expect(validatedOutput.recommendedNextStep).toContain('could not be generated reliably');
        expect(Array.isArray(validatedOutput.possibleConditions)).toBe(true);
        expect(validatedOutput.possibleConditions).toHaveLength(0);
      });
    });
  });
});

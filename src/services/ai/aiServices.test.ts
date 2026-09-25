import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { medicalService } from './medicalService';
import { voiceService } from './voiceService';
import { aiRouter } from './aiRouter';

describe('Medora Offline-First AI Services & Router Tests', () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    // Reset mocks
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restore navigator
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    }
  });

  // ==========================================
  // MULTILINGUAL FEVER NORMALIZATION TESTS
  // ==========================================
  describe('Multilingual Offline Fever Normalization', () => {
    it('normalizes English fever: "I have fever"', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'I have fever',
        language: 'en',
        forceOffline: true,
      });
      expect(result.symptoms).toContain('Fever');
      expect(result.mode).toBe('OFFLINE');
      expect(result.source).toBe('LOCAL_MEDICAL_ENGINE');
      expect(result.possibleConditions.length).toBeGreaterThan(0);
    });

    it('normalizes Tamil fever: "எனக்கு காய்ச்சல் இருக்கிறது"', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'எனக்கு காய்ச்சல் இருக்கிறது',
        language: 'ta',
        forceOffline: true,
      });
      expect(result.symptoms).toContain('Fever');
      expect(result.mode).toBe('OFFLINE');
      expect(result.source).toBe('LOCAL_MEDICAL_ENGINE');
    });

    it('normalizes Hindi fever: "मुझे बुखार है"', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'मुझे बुखार है',
        language: 'hi',
        forceOffline: true,
      });
      expect(result.symptoms).toContain('Fever');
      expect(result.mode).toBe('OFFLINE');
      expect(result.source).toBe('LOCAL_MEDICAL_ENGINE');
    });

    it('normalizes Telugu fever: "నాకు జ్వరం వచ్చింది"', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'నాకు జ్వరం వచ్చింది',
        language: 'te',
        forceOffline: true,
      });
      expect(result.symptoms).toContain('Fever');
      expect(result.mode).toBe('OFFLINE');
      expect(result.source).toBe('LOCAL_MEDICAL_ENGINE');
    });

    it('normalizes Malayalam fever: "എനിക്ക് പനിയാണ്"', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'എനിക്ക് പനിയാണ്',
        language: 'ml',
        forceOffline: true,
      });
      expect(result.symptoms).toContain('Fever');
      expect(result.mode).toBe('OFFLINE');
      expect(result.source).toBe('LOCAL_MEDICAL_ENGINE');
    });

    it('normalizes Kannada fever: "ನನಗೆ ಜ್ವರ ಬಂದಿದೆ"', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'ನನಗೆ ಜ್ವರ ಬಂದಿದೆ',
        language: 'kn',
        forceOffline: true,
      });
      expect(result.symptoms).toContain('Fever');
      expect(result.mode).toBe('OFFLINE');
      expect(result.source).toBe('LOCAL_MEDICAL_ENGINE');
    });
  });

  // ==========================================
  // DETERMINISTIC EMERGENCY RULES TESTS
  // ==========================================
  describe('Deterministic Emergency Rules (No Gemini / Offline)', () => {
    it('detects emergency in Tamil: "எனக்கு மூச்சு விட முடியவில்லை."', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'எனக்கு மூச்சு விட முடியவில்லை.',
        language: 'ta',
        forceOffline: true,
      });
      expect(result.emergencyDetected).toBe(true);
      expect(result.requiresUrgentCare).toBe(true);
      expect(result.redFlags.length).toBeGreaterThan(0);
      expect(result.recommendedNextStep).toContain('108');
    });

    it('detects emergency in English: "I cannot breathe"', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'I cannot breathe',
        language: 'en',
        forceOffline: true,
      });
      expect(result.emergencyDetected).toBe(true);
      expect(result.requiresUrgentCare).toBe(true);
    });

    it('detects acute severe chest pain emergency', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'Severe crushing chest pain radiating to left arm',
        language: 'en',
        forceOffline: true,
      });
      expect(result.emergencyDetected).toBe(true);
      expect(result.requiresUrgentCare).toBe(true);
    });
  });

  // ==========================================
  // MEDICAL NUMBERS & VALUE PRESERVATION TESTS
  // ==========================================
  describe('Medical Value Preservation', () => {
    it('preserves exact temperature: 102°F', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'I have fever with temperature 102°F for 2 days',
        forceOffline: true,
      });
      const hasTemp = result.measurements.some((m) => m.includes('102°F'));
      expect(hasTemp).toBe(true);
    });

    it('preserves exact blood pressure: 120/80', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'My blood pressure reading today was 120/80 mmHg',
        forceOffline: true,
      });
      const hasBP = result.measurements.some((m) => m.includes('120/80'));
      expect(hasBP).toBe(true);
    });

    it('preserves exact duration: "3 days"', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'I have had a high fever for 3 days and cough',
        forceOffline: true,
      });
      expect(result.duration).toBe('3 days');
    });

    it('preserves exact duration in Tamil: "3 நாட்களாக"', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'எனக்கு 3 நாட்களாக காய்ச்சல் இருக்கிறது',
        forceOffline: true,
      });
      expect(result.duration).toBe('3 days');
    });
  });

  // ==========================================
  // OFFLINE PIPELINE & GEMINI FALLBACK TESTS
  // ==========================================
  describe('Offline Execution & Graceful Fallback', () => {
    it('executes completely offline when navigator.onLine = false', async () => {
      // Mock navigator.onLine = false
      Object.defineProperty(globalThis, 'navigator', {
        value: { onLine: false },
        writable: true,
        configurable: true,
      });

      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'I have fever and cough for 3 days',
        duration: '3 days',
      });

      expect(result.mode).toBe('OFFLINE');
      expect(result.source).toBe('LOCAL_MEDICAL_ENGINE');
      expect(result.confidenceStatus).toBe('NOT_CLINICALLY_VALIDATED');
      expect(result.requiresDoctorReview).toBe(true);
      expect(result.possibleConditions.length).toBeGreaterThan(0);
      expect(result.possibleConditions[0].condition).toBeDefined();
      expect(result.possibleConditions[0].supportingEvidence.length).toBeGreaterThan(0);
      expect(result.possibleConditions[0].reasoning).toBeDefined();
    });

    it('falls back to local medical engine when Gemini is online but API fails', async () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { onLine: true },
        writable: true,
        configurable: true,
      });

      // Mock fetch failure
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network disconnected or API unavailable'));

      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'I have fever and cough for 3 days',
      });

      expect(result.source).toBe('LOCAL_MEDICAL_ENGINE');
      expect(result.mode).toBe('ONLINE_FALLBACK');
      expect(result.possibleConditions.length).toBeGreaterThan(0);
      expect(result.confidenceStatus).toBe('NOT_CLINICALLY_VALIDATED');
    });

    it('safely handles unknown medical input with INSUFFICIENT_INFORMATION', async () => {
      const result = await medicalService.analyzeMedicalRequest({
        patientInput: 'blabla xyz123 non medical phrase without any clinical cues',
        forceOffline: true,
      });

      expect(result.confidenceStatus).toBe('INSUFFICIENT_INFORMATION');
      expect(result.recommendedNextStep).toContain("I don't have enough information to assess this safely");
      expect(result.requiresDoctorReview).toBe(true);
    });
  });

  // ==========================================
  // CENTRAL ROUTER ROUTING TESTS
  // ==========================================
  describe('Central AIRouter 4-Way Routing', () => {
    it('routes casual greeting "Hello Medora" to VOICE', () => {
      const decision = aiRouter.route('Hello Medora');
      expect(decision.requestType).toBe('VOICE');
      expect(decision.targetSystem).toBe('VOICE_AI');
      expect(decision.isEmergency).toBe(false);
    });

    it('routes navigation command "Open medicines" to NAVIGATION', () => {
      const decision = aiRouter.route('Open medicines');
      expect(decision.requestType).toBe('NAVIGATION');
      expect(decision.targetSystem).toBe('LOCAL_NAVIGATION');
      expect(decision.destinationRoute).toBe('/medicines');
    });

    it('routes symptom query "I have fever" to MEDICAL', () => {
      const decision = aiRouter.route('I have fever');
      expect(decision.requestType).toBe('MEDICAL');
      expect(decision.targetSystem).toBe('MEDICAL_AI');
      expect(decision.requiresDoctorReview).toBe(true);
    });

    it('routes life-critical symptom "I cannot breathe" to EMERGENCY with highest priority', () => {
      const decision = aiRouter.route('I cannot breathe');
      expect(decision.requestType).toBe('EMERGENCY');
      expect(decision.targetSystem).toBe('EMERGENCY_TRIAGE');
      expect(decision.isEmergency).toBe(true);
      expect(decision.destinationRoute).toBe('/emergency');
    });
  });

  // ==========================================
  // VOICE AI BOUNDARY & TRANSFER TESTS
  // ==========================================
  describe('Voice AI Isolation & Medical Transfer', () => {
    it('handles casual conversation without medical claims', async () => {
      const response = await voiceService.processVoiceRequest({
        text: 'Hello Medora',
        language: 'en',
      });
      expect(response.source).toBe('VOICE_AI');
      expect(response.isMedicalQuery).toBe(false);
      expect(response.responseText).toContain('Medora Voice AI');
    });

    it('refuses to diagnose and transfers medical symptom "I have chest pain" to Medical AI', async () => {
      const response = await voiceService.processVoiceRequest({
        text: 'I have chest pain',
        language: 'en',
      });
      expect(response.source).toBe('VOICE_AI');
      expect(response.isMedicalQuery).toBe(true);
      expect(response.suggestedAction).toBe('TRANSFER_TO_MEDICAL_AI');
      expect(response.medicalHandoff).toBeDefined();
      expect(response.medicalHandoff?.chiefComplaint).toBeDefined();
    });
  });
});

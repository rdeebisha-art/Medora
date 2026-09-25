import { describe, it, expect } from 'vitest';
import { aiRouter } from './aiRouter';
import { voiceAIService } from '../voiceAI/voiceAIService';
import { medicalAIService } from '../medicalAI/medicalAIService';

describe('Dual AI Architecture Isolation & Routing Tests', () => {
  // TEST 1: "Hello Medora" -> VOICE_AI
  it('TEST 1: routes "Hello Medora" to VOICE_AI', () => {
    const decision = aiRouter.route('Hello Medora');
    expect(decision.targetSystem).toBe('VOICE_AI');
    expect(decision.requestType).toBe('VOICE');
    expect(decision.isEmergency).toBe(false);
  });

  // TEST 2: "How are you?" -> VOICE_AI
  it('TEST 2: routes "How are you?" to VOICE_AI', () => {
    const decision = aiRouter.route('How are you?');
    expect(decision.targetSystem).toBe('VOICE_AI');
    expect(decision.requestType).toBe('VOICE');
  });

  // TEST 3: "Open medicines" -> LOCAL_NAVIGATION
  it('TEST 3: routes "Open medicines" to LOCAL_NAVIGATION', () => {
    const decision = aiRouter.route('Open medicines');
    expect(decision.targetSystem).toBe('LOCAL_NAVIGATION');
    expect(decision.requestType).toBe('NAVIGATION');
    expect(decision.destinationRoute).toBe('/medicines');
  });

  // TEST 4: "I have fever for three days" -> MEDICAL_AI
  it('TEST 4: routes "I have fever for three days" to MEDICAL_AI', () => {
    const decision = aiRouter.route('I have fever for three days');
    expect(decision.targetSystem).toBe('MEDICAL_AI');
    expect(decision.requestType).toBe('MEDICAL');
    expect(decision.requiresDoctorReview).toBe(true);
  });

  // TEST 5: "Explain my blood report" -> MEDICAL_AI
  it('TEST 5: routes "Explain my blood report" to MEDICAL_AI', () => {
    const decision = aiRouter.route('Explain my blood report');
    expect(decision.targetSystem).toBe('MEDICAL_AI');
    expect(decision.requestType).toBe('MEDICAL');
  });

  // TEST 6: "Analyze this X-ray" -> MEDICAL_AI
  it('TEST 6: routes "Analyze this X-ray" to MEDICAL_AI', () => {
    const decision = aiRouter.route('Analyze this X-ray');
    expect(decision.targetSystem).toBe('MEDICAL_AI');
    expect(decision.requestType).toBe('MEDICAL');
  });

  // TEST 7: "I cannot breathe" -> EMERGENCY_TRIAGE
  it('TEST 7: routes "I cannot breathe" to EMERGENCY_TRIAGE', () => {
    const decision = aiRouter.route('I cannot breathe');
    expect(decision.targetSystem).toBe('EMERGENCY_TRIAGE');
    expect(decision.isEmergency).toBe(true);
    expect(decision.requestType).toBe('EMERGENCY');
  });

  // TEST 8: "Thank you" -> VOICE_AI
  it('TEST 8: routes "Thank you" to VOICE_AI', () => {
    const decision = aiRouter.route('Thank you');
    expect(decision.targetSystem).toBe('VOICE_AI');
    expect(decision.requestType).toBe('VOICE');
  });

  // TEST 9: "What disease do I have?" -> VOICE_AI transfers to MEDICAL_AI
  it('TEST 9: VOICE_AI recognizes medical question and refuses to diagnose, transferring to Medical AI', async () => {
    const voiceRes = await voiceAIService.processVoiceRequest({
      text: 'What disease do I have?',
      language: 'en-IN',
    });
    expect(voiceRes.source).toBe('VOICE_AI');
    expect(voiceRes.isMedicalTransferRecommended).toBe(true);
    expect(voiceRes.suggestedAction).toBe('TRANSFER_TO_MEDICAL_AI');
    expect(voiceRes.responseText).toContain('medical assessment is handled by Medora Medical AI');
  });

  // TEST 10: "My medicine is not helping" -> MEDICAL_AI
  it('TEST 10: routes "My medicine is not helping" to MEDICAL_AI', () => {
    const decision = aiRouter.route('My medicine is not helping');
    expect(decision.targetSystem).toBe('MEDICAL_AI');
    expect(decision.requestType).toBe('MEDICAL');
  });

  // Clinical reasoning verification for fever, duration and 102°F
  it('Medical AI performs structured clinical reasoning with exact number preservation and uncertainty', async () => {
    const res = await medicalAIService.analyzeMedicalRequest({
      patientInput: 'I have fever for 3 days, cough, sore throat and temperature 102°F.',
      duration: '3 days',
      temperature: '102°F',
      language: 'en',
    });

    expect(res.source).toBe('MEDICAL_AI');
    expect(res.clinicalAssessment.duration).toBe('3 days');
    expect(res.clinicalAssessment.symptoms).toContain('Fever');
    expect(res.clinicalAssessment.symptoms).toContain('Cough');
    expect(res.diagnosticAssessment.mostLikelyCondition).toBeDefined();
    expect(res.diagnosticAssessment.differentialDiagnoses.length).toBeGreaterThan(0);
    expect(res.requiresDoctorReview).toBe(true);
    // Never fabricate 95/99% confidence
    expect(res.confidence).toBeNull();
    expect(res.confidenceStatus).toBe('AI_ASSESSMENT_REQUIRES_CLINICAL_VERIFICATION');
  });
});

import { describe, it, expect } from 'vitest';
import { translateHealthcareText, detectSpokenLanguage } from './translator';
import {
  protectMedicalValues,
  restoreMedicalValues,
  validatePreservedMedicalValues,
} from '../medicalSafety/medicalValueProtection';

describe('Language Bridge Service End-to-End Translation & Preservation Pipeline', () => {
  describe('1. End-to-End Translation Pipeline for all 6 Supported Languages', () => {
    it('translates Tamil -> English for symptom statement', () => {
      const res = translateHealthcareText('எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.', 'ta-IN', 'en-IN');
      expect(res.translatedText.toLowerCase()).toContain('fever');
      expect(res.translatedText.toLowerCase()).toContain('three days');
      expect(res.translatedText).not.toBe(res.originalText);
      expect(res.translationStatus).toBe('TRANSLATED');
    });

    it('translates English -> Tamil for symptom statement', () => {
      const res = translateHealthcareText('I have had a fever for three days.', 'en-IN', 'ta-IN');
      expect(res.translatedText).toContain('காய்ச்சல்');
      expect(res.translatedText).not.toBe(res.originalText);
      expect(res.translationStatus).toBe('TRANSLATED');
    });

    it('translates Telugu -> English for symptom statement', () => {
      const res = translateHealthcareText('నాకు మూడు రోజులుగా జ్వరం ఉంది.', 'te-IN', 'en-IN');
      expect(res.translatedText.toLowerCase()).toContain('fever');
      expect(res.translatedText.toLowerCase()).toContain('three days');
      expect(res.translatedText).not.toBe(res.originalText);
    });

    it('translates English -> Telugu for symptom statement', () => {
      const res = translateHealthcareText('I have a cough.', 'en-IN', 'te-IN');
      expect(res.translatedText).toContain('దగ్గు');
      expect(res.translatedText).not.toBe(res.originalText);
    });

    it('translates Hindi -> English for symptom statement', () => {
      const res = translateHealthcareText('मुझे तीन दिनों से बुखार है।', 'hi-IN', 'en-IN');
      expect(res.translatedText.toLowerCase()).toContain('fever');
      expect(res.translatedText.toLowerCase()).toContain('three days');
      expect(res.translatedText).not.toBe(res.originalText);
    });

    it('translates English -> Hindi for symptom statement', () => {
      const res = translateHealthcareText('I have a headache.', 'en-IN', 'hi-IN');
      expect(res.translatedText).toContain('सिरदर्द');
      expect(res.translatedText).not.toBe(res.originalText);
    });

    it('translates Malayalam -> English for symptom statement', () => {
      const res = translateHealthcareText('എനിക്ക് മൂന്ന് ദിവസമായി പനി ഉണ്ട്.', 'ml-IN', 'en-IN');
      expect(res.translatedText.toLowerCase()).toContain('fever');
      expect(res.translatedText.toLowerCase()).toContain('three days');
      expect(res.translatedText).not.toBe(res.originalText);
    });

    it('translates English -> Malayalam for symptom statement', () => {
      const res = translateHealthcareText('I have stomach pain.', 'en-IN', 'ml-IN');
      expect(res.translatedText).toContain('വയറുവേദന');
      expect(res.translatedText).not.toBe(res.originalText);
    });

    it('translates Kannada -> English for symptom statement', () => {
      const res = translateHealthcareText('ನನಗೆ ಮೂರು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ.', 'kn-IN', 'en-IN');
      expect(res.translatedText.toLowerCase()).toContain('fever');
      expect(res.translatedText.toLowerCase()).toContain('three days');
      expect(res.translatedText).not.toBe(res.originalText);
    });

    it('translates English -> Kannada for symptom statement', () => {
      const res = translateHealthcareText('I have a cold.', 'en-IN', 'kn-IN');
      expect(res.translatedText).toContain('ಶೀತ');
      expect(res.translatedText).not.toBe(res.originalText);
    });

    it('translates cross-lingual Tamil -> Telugu directly', () => {
      const res = translateHealthcareText('எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.', 'ta-IN', 'te-IN');
      expect(res.translatedText).toContain('జ్వరం');
      expect(res.translatedText).not.toBe(res.originalText);
    });

    it('translates cross-lingual Hindi -> Malayalam directly', () => {
      const res = translateHealthcareText('मुझे तीन दिनों से बुखार है।', 'hi-IN', 'ml-IN');
      expect(res.translatedText).toContain('പനി');
      expect(res.translatedText).not.toBe(res.originalText);
    });
  });

  describe('2. Medical Term & Exact Clinical Value Preservation', () => {
    it('preserves Temperature 102°F during translation without corruption', () => {
      const input = 'Patient has a high temperature 102°F for 3 days.';
      const res = translateHealthcareText('I have had a 102 degree fever for three days.', 'en-IN', 'ta-IN');
      expect(res.translatedText).toContain('102');
      const prot = protectMedicalValues(input);
      const restored = restoreMedicalValues(prot.protectedText, prot.values);
      expect(restored).toContain('102°F');
      expect(validatePreservedMedicalValues(input, restored).isValid).toBe(true);
    });

    it('preserves Blood Pressure 120/80 mmHg exactly', () => {
      const input = 'Recorded blood pressure 120/80 mmHg today.';
      const prot = protectMedicalValues(input);
      const restored = restoreMedicalValues(prot.protectedText, prot.values);
      expect(restored).toContain('120/80');
      expect(validatePreservedMedicalValues(input, restored).isValid).toBe(true);
    });

    it('preserves Blood Glucose 180 mg/dL exactly', () => {
      const input = 'Fasting blood sugar 180 mg/dL.';
      const prot = protectMedicalValues(input);
      const restored = restoreMedicalValues(prot.protectedText, prot.values);
      expect(restored).toContain('180 mg/dL');
      expect(validatePreservedMedicalValues(input, restored).isValid).toBe(true);
    });

    it('preserves Oxygen Saturation SpO2 94% exactly', () => {
      const input = 'Pulse oximetry SpO2 94% on room air.';
      const prot = protectMedicalValues(input);
      const restored = restoreMedicalValues(prot.protectedText, prot.values);
      expect(restored).toContain('94%');
      expect(validatePreservedMedicalValues(input, restored).isValid).toBe(true);
    });

    it('preserves Body Weight 55 kg exactly', () => {
      const input = 'Patient weighs 55 kg.';
      const prot = protectMedicalValues(input);
      const restored = restoreMedicalValues(prot.protectedText, prot.values);
      expect(restored).toContain('55 kg');
      expect(validatePreservedMedicalValues(input, restored).isValid).toBe(true);
    });

    it('preserves Age 62 and Duration 3 days exactly', () => {
      const input = 'Patient is 62 years old with symptoms for 3 days.';
      const prot = protectMedicalValues(input);
      const restored = restoreMedicalValues(prot.protectedText, prot.values);
      expect(restored).toContain('62');
      expect(restored).toContain('3 days');
      expect(validatePreservedMedicalValues(input, restored).isValid).toBe(true);
    });

    it('preserves Time 8:30 AM and Date 23 September 2026', () => {
      const input = 'Appointment scheduled for 8:30 AM on 23 September 2026.';
      const prot = protectMedicalValues(input);
      const restored = restoreMedicalValues(prot.protectedText, prot.values);
      expect(restored).toContain('8:30 AM');
      expect(restored).toContain('23 September 2026');
      expect(validatePreservedMedicalValues(input, restored).isValid).toBe(true);
    });

    it('preserves pharmaceutical medicine names (Paracetamol, Amoxicillin, Metformin, Insulin, Aspirin)', () => {
      const input = 'Take Paracetamol 500 mg, Amoxicillin 250 mg, Metformin 500 mg, Insulin 10 units, and Aspirin 75 mg.';
      const prot = protectMedicalValues(input);
      const restored = restoreMedicalValues(prot.protectedText, prot.values);
      expect(restored).toContain('Paracetamol');
      expect(restored).toContain('Amoxicillin');
      expect(restored).toContain('Metformin');
      expect(restored).toContain('Insulin');
      expect(restored).toContain('Aspirin');
      expect(validatePreservedMedicalValues(input, restored).isValid).toBe(true);
    });
  });

  describe('3. Spoken Script Detection & Safety Invariants', () => {
    it('detects spoken scripts accurately for Tamil, Hindi, Telugu, Malayalam, Kannada', () => {
      expect(detectSpokenLanguage('எனக்கு காய்ச்சல் இருக்கிறது.', 'ta-IN').language).toBe('ta-IN');
      expect(detectSpokenLanguage('मुझे सिरदर्द है।', 'hi-IN').language).toBe('hi-IN');
      expect(detectSpokenLanguage('నాకు జ్వరం ఉంది.', 'te-IN').language).toBe('te-IN');
      expect(detectSpokenLanguage('എനിക്ക് പനി ഉണ്ട്.', 'ml-IN').language).toBe('ml-IN');
      expect(detectSpokenLanguage('ನನಗೆ ಜ್ವರ ಇದೆ.', 'kn-IN').language).toBe('kn-IN');
    });

    it('never echoes unknown words as translated for out-of-vocabulary terms', () => {
      const res = translateHealthcareText('Unmapped quantum anomaly', 'en-IN', 'ta-IN');
      expect(res.translationConfidence).toBe('LOW');
      expect(res.translationStatus).toBe('UNSUPPORTED');
      expect(res.translatedText).toBe('');
      expect(res.needsConfirmation).toBe(true);
    });
  });
});

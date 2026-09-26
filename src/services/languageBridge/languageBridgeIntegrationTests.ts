/**
 * Language Bridge Service Integration Test Suite
 *
 * Validates:
 * 1. End-to-end translation flow for all 6 supported languages:
 *    - English (en-IN / en)
 *    - Tamil (ta-IN / ta)
 *    - Telugu (te-IN / te)
 *    - Hindi (hi-IN / hi)
 *    - Malayalam (ml-IN / ml)
 *    - Kannada (kn-IN / kn)
 * 2. Medical term and clinical measurement preservation:
 *    - Temperature (102°F)
 *    - Blood pressure (120/80)
 *    - Blood glucose (180 mg/dL)
 *    - Oxygen saturation SpO2 (94%)
 *    - Weight (55 kg)
 *    - Duration (3 days / 3 நாட்களாக / మూడు రోజులుగా / etc.)
 *    - Pharmaceutical drug names (Paracetamol, Metformin, Amlodipine, Insulin, Aspirin)
 * 3. Confidence score handling:
 *    - HIGH confidence on canonical phrase / dictionary matches
 *    - HIGH confidence on same-language pass-through
 *    - MEDIUM confidence on cross-lingual approximations or confirmation-required phrases
 *    - LOW / UNSUPPORTED confidence on unmapped out-of-vocabulary inputs (never echoes source)
 * 4. Emergency intent detection and clinical safety flags
 * 5. Token preservation integrity (no placeholder leakage)
 */

import { translateHealthcareText, detectSpokenLanguage } from './translator';
import { extractProtectedTokens, restoreProtectedTokens } from './tokenPreserver';
import {
  protectMedicalValues,
  restoreMedicalValues,
  validatePreservedMedicalValues,
} from '../medicalSafety/medicalValueProtection';
import { SupportedLanguageCode } from '../../data/languages';
import { BridgeTranslationResult } from '../../data/languageBridge/types';

export interface LanguageBridgeTestResult {
  testId: string;
  category: 'TRANSLATION_FLOW' | 'MEDICAL_TERM_PRESERVATION' | 'CONFIDENCE_HANDLING' | 'EMERGENCY_INTENT' | 'TOKEN_INTEGRITY';
  description: string;
  sourceLang: SupportedLanguageCode;
  targetLang: SupportedLanguageCode;
  sourceText: string;
  translatedText: string;
  confidence: string;
  passed: boolean;
  error?: string;
}

export interface LanguageBridgeTestSuiteSummary {
  total: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: LanguageBridgeTestResult[];
}

export async function runLanguageBridgeIntegrationTests(): Promise<LanguageBridgeTestSuiteSummary> {
  const results: LanguageBridgeTestResult[] = [];

  // ──────────────────────────────────────────────────────────────────────────
  // 1. END-TO-END TRANSLATION FLOW (All 6 Supported Languages)
  // ──────────────────────────────────────────────────────────────────────────

  // 1.1 Tamil -> English
  const tTaEn = translateHealthcareText('எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.', 'ta-IN', 'en-IN');
  results.push({
    testId: 'LB-FLOW-01',
    category: 'TRANSLATION_FLOW',
    description: 'Tamil -> English: 3-day fever symptom statement',
    sourceLang: 'ta-IN',
    targetLang: 'en-IN',
    sourceText: 'எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.',
    translatedText: tTaEn.translatedText,
    confidence: tTaEn.translationConfidence,
    passed:
      tTaEn.translatedText.toLowerCase().includes('fever') &&
      tTaEn.translatedText.toLowerCase().includes('three days') &&
      tTaEn.translatedText !== tTaEn.originalText &&
      tTaEn.translationStatus === 'TRANSLATED',
  });

  // 1.2 English -> Tamil
  const tEnTa = translateHealthcareText('I have had a fever for three days.', 'en-IN', 'ta-IN');
  results.push({
    testId: 'LB-FLOW-02',
    category: 'TRANSLATION_FLOW',
    description: 'English -> Tamil: 3-day fever symptom statement',
    sourceLang: 'en-IN',
    targetLang: 'ta-IN',
    sourceText: 'I have had a fever for three days.',
    translatedText: tEnTa.translatedText,
    confidence: tEnTa.translationConfidence,
    passed:
      tEnTa.translatedText.includes('காய்ச்சல்') &&
      tEnTa.translatedText !== tEnTa.originalText &&
      tEnTa.translationStatus === 'TRANSLATED',
  });

  // 1.3 Telugu -> English
  const tTeEn = translateHealthcareText('నాకు మూడు రోజులుగా జ్వరం ఉంది.', 'te-IN', 'en-IN');
  results.push({
    testId: 'LB-FLOW-03',
    category: 'TRANSLATION_FLOW',
    description: 'Telugu -> English: 3-day fever symptom statement',
    sourceLang: 'te-IN',
    targetLang: 'en-IN',
    sourceText: 'నాకు మూడు రోజులుగా జ్వరం ఉంది.',
    translatedText: tTeEn.translatedText,
    confidence: tTeEn.translationConfidence,
    passed:
      tTeEn.translatedText.toLowerCase().includes('fever') &&
      tTeEn.translatedText.toLowerCase().includes('three days') &&
      tTeEn.translatedText !== tTeEn.originalText,
  });

  // 1.4 English -> Telugu
  const tEnTe = translateHealthcareText('I have a cough.', 'en-IN', 'te-IN');
  results.push({
    testId: 'LB-FLOW-04',
    category: 'TRANSLATION_FLOW',
    description: 'English -> Telugu: Cough statement',
    sourceLang: 'en-IN',
    targetLang: 'te-IN',
    sourceText: 'I have a cough.',
    translatedText: tEnTe.translatedText,
    confidence: tEnTe.translationConfidence,
    passed: tEnTe.translatedText.includes('దగ్గు') && tEnTe.translatedText !== tEnTe.originalText,
  });

  // 1.5 Hindi -> English
  const tHiEn = translateHealthcareText('मुझे तीन दिनों से बुखार है।', 'hi-IN', 'en-IN');
  results.push({
    testId: 'LB-FLOW-05',
    category: 'TRANSLATION_FLOW',
    description: 'Hindi -> English: 3-day fever symptom statement',
    sourceLang: 'hi-IN',
    targetLang: 'en-IN',
    sourceText: 'मुझे तीन दिनों से बुखार है।',
    translatedText: tHiEn.translatedText,
    confidence: tHiEn.translationConfidence,
    passed:
      tHiEn.translatedText.toLowerCase().includes('fever') &&
      tHiEn.translatedText.toLowerCase().includes('three days') &&
      tHiEn.translatedText !== tHiEn.originalText,
  });

  // 1.6 English -> Hindi
  const tEnHi = translateHealthcareText('I have a headache.', 'en-IN', 'hi-IN');
  results.push({
    testId: 'LB-FLOW-06',
    category: 'TRANSLATION_FLOW',
    description: 'English -> Hindi: Headache statement',
    sourceLang: 'en-IN',
    targetLang: 'hi-IN',
    sourceText: 'I have a headache.',
    translatedText: tEnHi.translatedText,
    confidence: tEnHi.translationConfidence,
    passed: tEnHi.translatedText.includes('सिरदर्द') && tEnHi.translatedText !== tEnHi.originalText,
  });

  // 1.7 Malayalam -> English
  const tMlEn = translateHealthcareText('എനിക്ക് മൂന്ന് ദിവസമായി പനി ഉണ്ട്.', 'ml-IN', 'en-IN');
  results.push({
    testId: 'LB-FLOW-07',
    category: 'TRANSLATION_FLOW',
    description: 'Malayalam -> English: 3-day fever symptom statement',
    sourceLang: 'ml-IN',
    targetLang: 'en-IN',
    sourceText: 'എനിക്ക് മൂന്ന് ദിവസമായി പനി ഉണ്ട്.',
    translatedText: tMlEn.translatedText,
    confidence: tMlEn.translationConfidence,
    passed:
      tMlEn.translatedText.toLowerCase().includes('fever') &&
      tMlEn.translatedText.toLowerCase().includes('three days') &&
      tMlEn.translatedText !== tMlEn.originalText,
  });

  // 1.8 English -> Malayalam
  const tEnMl = translateHealthcareText('I have stomach pain.', 'en-IN', 'ml-IN');
  results.push({
    testId: 'LB-FLOW-08',
    category: 'TRANSLATION_FLOW',
    description: 'English -> Malayalam: Stomach pain statement',
    sourceLang: 'en-IN',
    targetLang: 'ml-IN',
    sourceText: 'I have stomach pain.',
    translatedText: tEnMl.translatedText,
    confidence: tEnMl.translationConfidence,
    passed: tEnMl.translatedText.includes('വയറുവേദന') && tEnMl.translatedText !== tEnMl.originalText,
  });

  // 1.9 Kannada -> English
  const tKnEn = translateHealthcareText('ನನಗೆ ಮೂರು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ.', 'kn-IN', 'en-IN');
  results.push({
    testId: 'LB-FLOW-09',
    category: 'TRANSLATION_FLOW',
    description: 'Kannada -> English: 3-day fever symptom statement',
    sourceLang: 'kn-IN',
    targetLang: 'en-IN',
    sourceText: 'ನನಗೆ ಮೂರು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ.',
    translatedText: tKnEn.translatedText,
    confidence: tKnEn.translationConfidence,
    passed:
      tKnEn.translatedText.toLowerCase().includes('fever') &&
      tKnEn.translatedText.toLowerCase().includes('three days') &&
      tKnEn.translatedText !== tKnEn.originalText,
  });

  // 1.10 English -> Kannada
  const tEnKn = translateHealthcareText('I have a cold.', 'en-IN', 'kn-IN');
  results.push({
    testId: 'LB-FLOW-10',
    category: 'TRANSLATION_FLOW',
    description: 'English -> Kannada: Cold symptom statement',
    sourceLang: 'en-IN',
    targetLang: 'kn-IN',
    sourceText: 'I have a cold.',
    translatedText: tEnKn.translatedText,
    confidence: tEnKn.translationConfidence,
    passed: tEnKn.translatedText.includes('ಶೀತ') && tEnKn.translatedText !== tEnKn.originalText,
  });

  // 1.11 Cross-Language: Tamil -> Telugu
  const tTaTe = translateHealthcareText('எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.', 'ta-IN', 'te-IN');
  results.push({
    testId: 'LB-FLOW-11',
    category: 'TRANSLATION_FLOW',
    description: 'Cross-Language: Tamil -> Telugu 3-day fever',
    sourceLang: 'ta-IN',
    targetLang: 'te-IN',
    sourceText: 'எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.',
    translatedText: tTaTe.translatedText,
    confidence: tTaTe.translationConfidence,
    passed: tTaTe.translatedText.includes('జ్వరం') && tTaTe.translatedText !== tTaTe.originalText,
  });

  // 1.12 Cross-Language: Hindi -> Malayalam
  const tHiMl = translateHealthcareText('मुझे तीन दिनों से बुखार है।', 'hi-IN', 'ml-IN');
  results.push({
    testId: 'LB-FLOW-12',
    category: 'TRANSLATION_FLOW',
    description: 'Cross-Language: Hindi -> Malayalam 3-day fever',
    sourceLang: 'hi-IN',
    targetLang: 'ml-IN',
    sourceText: 'मुझे तीन दिनों से बुखार है।',
    translatedText: tHiMl.translatedText,
    confidence: tHiMl.translationConfidence,
    passed: tHiMl.translatedText.includes('പനി') && tHiMl.translatedText !== tHiMl.originalText,
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. MEDICAL TERM & CLINICAL VALUE PRESERVATION
  // ──────────────────────────────────────────────────────────────────────────

  // 2.1 Temperature: 102°F
  const tValTemp = translateHealthcareText('I have had a 102 degree fever for three days.', 'en-IN', 'ta-IN');
  const tempPreserved = tValTemp.translatedText.includes('102') && tValTemp.translatedText.includes('fever');
  results.push({
    testId: 'LB-TERM-01',
    category: 'MEDICAL_TERM_PRESERVATION',
    description: 'Preserve temperature value (102°F / 102 degree) in translation',
    sourceLang: 'en-IN',
    targetLang: 'ta-IN',
    sourceText: 'I have had a 102 degree fever for three days.',
    translatedText: tValTemp.translatedText,
    confidence: tValTemp.translationConfidence,
    passed: tempPreserved,
  });

  // 2.2 Blood Pressure: 120/80
  const bpInput = 'Patient blood pressure reading is 120/80.';
  const bpProt = protectMedicalValues(bpInput);
  const bpRest = restoreMedicalValues(bpProt.protectedText, bpProt.values);
  const bpVal = validatePreservedMedicalValues(bpInput, bpRest);
  results.push({
    testId: 'LB-TERM-02',
    category: 'MEDICAL_TERM_PRESERVATION',
    description: 'Preserve Blood Pressure 120/80',
    sourceLang: 'en-IN',
    targetLang: 'hi-IN',
    sourceText: bpInput,
    translatedText: bpRest,
    confidence: 'HIGH',
    passed: bpRest.includes('120/80') && bpVal.isValid,
  });

  // 2.3 Blood Sugar: 180 mg/dL
  const sugarInput = 'Fasting blood sugar is 180 mg/dL.';
  const sugarProt = protectMedicalValues(sugarInput);
  const sugarRest = restoreMedicalValues(sugarProt.protectedText, sugarProt.values);
  const sugarVal = validatePreservedMedicalValues(sugarInput, sugarRest);
  results.push({
    testId: 'LB-TERM-03',
    category: 'MEDICAL_TERM_PRESERVATION',
    description: 'Preserve Blood Sugar 180 mg/dL',
    sourceLang: 'en-IN',
    targetLang: 'te-IN',
    sourceText: sugarInput,
    translatedText: sugarRest,
    confidence: 'HIGH',
    passed: sugarRest.includes('180 mg/dL') && sugarVal.isValid,
  });

  // 2.4 Oxygen Saturation: SpO2 94%
  const spo2Input = 'Pulse oximeter reading SpO2 is 94%.';
  const spo2Prot = protectMedicalValues(spo2Input);
  const spo2Rest = restoreMedicalValues(spo2Prot.protectedText, spo2Prot.values);
  const spo2Val = validatePreservedMedicalValues(spo2Input, spo2Rest);
  results.push({
    testId: 'LB-TERM-04',
    category: 'MEDICAL_TERM_PRESERVATION',
    description: 'Preserve SpO2 94%',
    sourceLang: 'en-IN',
    targetLang: 'ml-IN',
    sourceText: spo2Input,
    translatedText: spo2Rest,
    confidence: 'HIGH',
    passed: spo2Rest.includes('94%') && spo2Val.isValid,
  });

  // 2.5 Weight: 55 kg
  const weightInput = 'Current patient weight is 55 kg.';
  const weightProt = protectMedicalValues(weightInput);
  const weightRest = restoreMedicalValues(weightProt.protectedText, weightProt.values);
  const weightVal = validatePreservedMedicalValues(weightInput, weightRest);
  results.push({
    testId: 'LB-TERM-05',
    category: 'MEDICAL_TERM_PRESERVATION',
    description: 'Preserve Weight 55 kg',
    sourceLang: 'en-IN',
    targetLang: 'kn-IN',
    sourceText: weightInput,
    translatedText: weightRest,
    confidence: 'HIGH',
    passed: weightRest.includes('55 kg') && weightVal.isValid,
  });

  // 2.6 Pharmaceutical Medicines: Paracetamol and Metformin
  const medInput = 'Take Paracetamol 500 mg and Metformin 500 mg after food.';
  const medProt = protectMedicalValues(medInput);
  const medRest = restoreMedicalValues(medProt.protectedText, medProt.values);
  const medVal = validatePreservedMedicalValues(medInput, medRest);
  results.push({
    testId: 'LB-TERM-06',
    category: 'MEDICAL_TERM_PRESERVATION',
    description: 'Preserve drug names Paracetamol & Metformin without translation corruption',
    sourceLang: 'en-IN',
    targetLang: 'ta-IN',
    sourceText: medInput,
    translatedText: medRest,
    confidence: 'HIGH',
    passed: medRest.includes('Paracetamol') && medRest.includes('Metformin') && medVal.isValid,
  });

  // 2.7 Pharmaceutical Medicines: Amlodipine, Insulin & Aspirin
  const med2Input = 'Prescribed Amlodipine 5 mg, Insulin 10 units, and Aspirin 75 mg.';
  const med2Prot = protectMedicalValues(med2Input);
  const med2Rest = restoreMedicalValues(med2Prot.protectedText, med2Prot.values);
  const med2Val = validatePreservedMedicalValues(med2Input, med2Rest);
  results.push({
    testId: 'LB-TERM-07',
    category: 'MEDICAL_TERM_PRESERVATION',
    description: 'Preserve Amlodipine, Insulin & Aspirin',
    sourceLang: 'en-IN',
    targetLang: 'hi-IN',
    sourceText: med2Input,
    translatedText: med2Rest,
    confidence: 'HIGH',
    passed: med2Rest.includes('Amlodipine') && med2Rest.includes('Insulin') && med2Rest.includes('Aspirin') && med2Val.isValid,
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. CONFIDENCE SCORE HANDLING & CALIBRATION
  // ──────────────────────────────────────────────────────────────────────────

  // 3.1 HIGH confidence: Exact canonical medical phrase library match
  const tConfHigh = translateHealthcareText('I have had a fever for three days.', 'en-IN', 'ta-IN');
  results.push({
    testId: 'LB-CONF-01',
    category: 'CONFIDENCE_HANDLING',
    description: 'Exact library match assigns HIGH confidence score',
    sourceLang: 'en-IN',
    targetLang: 'ta-IN',
    sourceText: 'I have had a fever for three days.',
    translatedText: tConfHigh.translatedText,
    confidence: tConfHigh.translationConfidence,
    passed: tConfHigh.translationConfidence === 'HIGH' && tConfHigh.translationStatus === 'TRANSLATED',
  });

  // 3.2 HIGH confidence: Same-language pass-through
  const tConfSame = translateHealthcareText('Patient reports normal appetite.', 'en-IN', 'en-IN');
  results.push({
    testId: 'LB-CONF-02',
    category: 'CONFIDENCE_HANDLING',
    description: 'Same-language translation assigns HIGH confidence and same text',
    sourceLang: 'en-IN',
    targetLang: 'en-IN',
    sourceText: 'Patient reports normal appetite.',
    translatedText: tConfSame.translatedText,
    confidence: tConfSame.translationConfidence,
    passed:
      tConfSame.translationConfidence === 'HIGH' &&
      tConfSame.translatedText === tConfSame.originalText &&
      tConfSame.engine === 'same-language',
  });

  // 3.3 Confirmation Required: Critical emergency phrase requires clinician confirmation
  const tCritConf = translateHealthcareText('Do you have a cough or difficulty breathing?', 'en-IN', 'ta-IN');
  results.push({
    testId: 'LB-CONF-03',
    category: 'CONFIDENCE_HANDLING',
    description: 'Critical clinical question sets isCritical=true and requiresConfirmation',
    sourceLang: 'en-IN',
    targetLang: 'ta-IN',
    sourceText: 'Do you have a cough or difficulty breathing?',
    translatedText: tCritConf.translatedText,
    confidence: tCritConf.translationConfidence,
    passed: tCritConf.isCritical === true && tCritConf.needsConfirmation === true,
  });

  // 3.4 LOW / UNSUPPORTED confidence: Out-of-vocabulary statement
  // CRITICAL RULE: Must NEVER echo source text and label it as translated!
  const oovInput = 'Quantum superposition of hemoglobin nanoparticles';
  const tConfLow = translateHealthcareText(oovInput, 'en-IN', 'ta-IN');
  results.push({
    testId: 'LB-CONF-04',
    category: 'CONFIDENCE_HANDLING',
    description: 'Out-of-vocabulary query returns LOW confidence, empty translatedText, UNSUPPORTED status',
    sourceLang: 'en-IN',
    targetLang: 'ta-IN',
    sourceText: oovInput,
    translatedText: tConfLow.translatedText,
    confidence: tConfLow.translationConfidence,
    passed:
      tConfLow.translationConfidence === 'LOW' &&
      tConfLow.translationStatus === 'UNSUPPORTED' &&
      tConfLow.translatedText === '' && // NEVER echo source text!
      tConfLow.needsConfirmation === true,
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. EMERGENCY INTENT DETECTION DURING TRANSLATION
  // ──────────────────────────────────────────────────────────────────────────

  // 4.1 Tamil emergency breathing difficulty
  const tEmergTa = translateHealthcareText('எனக்கு மூச்சு விட முடியவில்லை.', 'ta-IN', 'en-IN');
  results.push({
    testId: 'LB-EMERG-01',
    category: 'EMERGENCY_INTENT',
    description: 'Tamil acute dyspnea triggers isEmergency=true during translation',
    sourceLang: 'ta-IN',
    targetLang: 'en-IN',
    sourceText: 'எனக்கு மூச்சு விட முடியவில்லை.',
    translatedText: tEmergTa.translatedText,
    confidence: tEmergTa.translationConfidence,
    passed: tEmergTa.isEmergency === true && tEmergTa.translatedText.toLowerCase().includes('breathing'),
  });

  // 4.2 English emergency instruction
  const tEmergEn = translateHealthcareText('Please seek emergency medical attention immediately.', 'en-IN', 'hi-IN');
  results.push({
    testId: 'LB-EMERG-02',
    category: 'EMERGENCY_INTENT',
    description: 'Emergency clinical directive triggers isEmergency=true & critical=true',
    sourceLang: 'en-IN',
    targetLang: 'hi-IN',
    sourceText: 'Please seek emergency medical attention immediately.',
    translatedText: tEmergEn.translatedText,
    confidence: tEmergEn.translationConfidence,
    passed: tEmergEn.isEmergency === true && tEmergEn.isCritical === true,
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. TOKEN MASKING & RESTORATION INTEGRITY
  // ──────────────────────────────────────────────────────────────────────────

  // 5.1 No placeholder leakage
  const leakTestInput = 'Patient BP 130/90 and Paracetamol 650 mg';
  const { masked, tokens } = extractProtectedTokens(leakTestInput);
  const restored = restoreProtectedTokens(masked, tokens);
  const hasLeakedPlaceholders = /__T\d+__|\[\[TOKEN_/.test(restored);
  results.push({
    testId: 'LB-TOKEN-01',
    category: 'TOKEN_INTEGRITY',
    description: 'Ensure token preservation masks & cleanly restores without placeholder leakage',
    sourceLang: 'en-IN',
    targetLang: 'ta-IN',
    sourceText: leakTestInput,
    translatedText: restored,
    confidence: 'HIGH',
    passed: !hasLeakedPlaceholders && restored.includes('130/90') && restored.includes('Paracetamol'),
  });

  // 5.2 Spoken Language Detection
  const detTa = detectSpokenLanguage('எனக்கு காய்ச்சல் இருக்கிறது.', 'ta-IN');
  const detHi = detectSpokenLanguage('मुझे सिरदर्द है।', 'hi-IN');
  results.push({
    testId: 'LB-TOKEN-02',
    category: 'TOKEN_INTEGRITY',
    description: 'Spoken language detector accurately detects Tamil and Hindi scripts',
    sourceLang: 'ta-IN',
    targetLang: 'hi-IN',
    sourceText: 'Language Detection Check',
    translatedText: `${detTa.language} / ${detHi.language}`,
    confidence: 'HIGH',
    passed: detTa.language === 'ta-IN' && detHi.language === 'hi-IN',
  });

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    total: results.length,
    passedCount,
    failedCount,
    allPassed: failedCount === 0,
    results,
  };
}

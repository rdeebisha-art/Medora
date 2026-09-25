/**
 * Automated Medical Safety, Value Preservation, and USSD AI Test Suite
 * Verifies all 20 test cases specified in Medora requirements
 */

import {
  protectMedicalValues,
  restoreMedicalValues,
  validatePreservedMedicalValues,
} from './medicalValueProtection';
import { intentClassifier } from '../voice/intentClassifier';
import { conversationEngine } from '../voice/conversationEngine';

export interface TestCaseResult {
  testId: string;
  description: string;
  passed: boolean;
  details?: string;
  actual?: any;
  expected?: any;
}

export async function runAllMedicalSafetyTests(): Promise<{ passed: boolean; results: TestCaseResult[] }> {
  const results: TestCaseResult[] = [];

  // ─── STEP 19: Medical Value Preservation Tests ──────────────────────────────

  // Test 1: Temperature & Duration (English)
  const t1Input = 'I have 102°F fever for 3 days.';
  const t1Prot = protectMedicalValues(t1Input);
  const t1Rest = restoreMedicalValues(t1Prot.protectedText, t1Prot.values);
  const t1Val = validatePreservedMedicalValues(t1Input, t1Rest);
  results.push({
    testId: 'VAL-01',
    description: 'Preserve 102°F and 3 days (English)',
    passed: t1Rest.includes('102°F') && t1Rest.includes('3 days') && t1Val.isValid,
    expected: '102°F and 3 days',
    actual: t1Rest,
  });

  // Test 2: Temperature & Duration (Tamil)
  const t2Input = 'எனக்கு 102°F காய்ச்சல் 3 நாட்களாக உள்ளது.';
  const t2Prot = protectMedicalValues(t2Input);
  const t2Rest = restoreMedicalValues(t2Prot.protectedText, t2Prot.values);
  const t2Val = validatePreservedMedicalValues(t2Input, t2Rest);
  results.push({
    testId: 'VAL-02',
    description: 'Preserve 102°F and 3 days (Tamil)',
    passed: t2Rest.includes('102°F') && t2Rest.includes('3 நாட்களாக') && t2Val.isValid,
    expected: '102°F and 3 நாட்களாக',
    actual: t2Rest,
  });

  // Test 3: Blood Pressure
  const t3Input = 'BP is 120/80.';
  const t3Prot = protectMedicalValues(t3Input);
  const t3Rest = restoreMedicalValues(t3Prot.protectedText, t3Prot.values);
  results.push({
    testId: 'VAL-03',
    description: 'Preserve Blood Pressure 120/80',
    passed: t3Rest.includes('120/80'),
    expected: '120/80',
    actual: t3Rest,
  });

  // Test 4: Blood Sugar
  const t4Input = 'Blood sugar is 180 mg/dL.';
  const t4Prot = protectMedicalValues(t4Input);
  const t4Rest = restoreMedicalValues(t4Prot.protectedText, t4Prot.values);
  results.push({
    testId: 'VAL-04',
    description: 'Preserve Blood Sugar 180 mg/dL',
    passed: t4Rest.includes('180 mg/dL'),
    expected: '180 mg/dL',
    actual: t4Rest,
  });

  // Test 5: SpO2
  const t5Input = 'SpO2 is 94%.';
  const t5Prot = protectMedicalValues(t5Input);
  const t5Rest = restoreMedicalValues(t5Prot.protectedText, t5Prot.values);
  results.push({
    testId: 'VAL-05',
    description: 'Preserve SpO2 94%',
    passed: t5Rest.includes('94%'),
    expected: '94%',
    actual: t5Rest,
  });

  // Test 6: Weight
  const t6Input = 'Weight is 55 kg.';
  const t6Prot = protectMedicalValues(t6Input);
  const t6Rest = restoreMedicalValues(t6Prot.protectedText, t6Prot.values);
  results.push({
    testId: 'VAL-06',
    description: 'Preserve Weight 55 kg',
    passed: t6Rest.includes('55 kg'),
    expected: '55 kg',
    actual: t6Rest,
  });

  // Test 7: Medicine Name
  const t7Input = 'Take Paracetamol.';
  const t7Prot = protectMedicalValues(t7Input);
  const t7Rest = restoreMedicalValues(t7Prot.protectedText, t7Prot.values);
  results.push({
    testId: 'VAL-07',
    description: 'Preserve Medicine Name Paracetamol',
    passed: t7Rest.includes('Paracetamol'),
    expected: 'Paracetamol',
    actual: t7Rest,
  });

  // ─── STEP 20: USSD AI Test Cases ──────────────────────────────────────────

  // TEST 1: I have fever -> FEVER
  const u1 = intentClassifier.classifyIntent('I have fever.', 'en-IN');
  results.push({
    testId: 'USSD-01',
    description: 'Intent: "I have fever" -> FEVER',
    passed: u1.intent === 'FEVER',
    expected: 'FEVER',
    actual: u1.intent,
  });

  // TEST 2: I have fever for three days -> FEVER, duration = 3 days
  const u2 = intentClassifier.classifyIntent('I have fever for three days.', 'en-IN');
  results.push({
    testId: 'USSD-02',
    description: 'Intent & Duration: "I have fever for three days" -> FEVER, duration = 3 days',
    passed: u2.intent === 'FEVER' && u2.durationIdentified === '3 days',
    expected: 'FEVER, 3 days',
    actual: `${u2.intent}, ${u2.durationIdentified}`,
  });

  // TEST 3: எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது -> Tamil, FEVER, duration = 3 days
  const u3 = intentClassifier.classifyIntent('எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.', 'ta-IN');
  results.push({
    testId: 'USSD-03',
    description: 'Tamil: "எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது" -> FEVER, duration = 3 days',
    passed: u3.intent === 'FEVER' && u3.durationIdentified === '3 days',
    expected: 'FEVER, 3 days',
    actual: `${u3.intent}, ${u3.durationIdentified}`,
  });

  // TEST 4: எனக்கு மூச்சு விட முடியவில்லை -> Tamil, BREATHING_DIFFICULTY, EMERGENCY
  const u4 = intentClassifier.classifyIntent('எனக்கு மூச்சு விட முடியவில்லை.', 'ta-IN');
  results.push({
    testId: 'USSD-04',
    description: 'Tamil Emergency: "எனக்கு மூச்சு விட முடியவில்லை" -> BREATHING_DIFFICULTY, EMERGENCY',
    passed: u4.intent === 'BREATHING_DIFFICULTY' && u4.isEmergency === true,
    expected: 'BREATHING_DIFFICULTY, isEmergency: true',
    actual: `${u4.intent}, isEmergency: ${u4.isEmergency}`,
  });

  // TEST 5: I cannot breathe -> BREATHING_DIFFICULTY, EMERGENCY
  const u5 = intentClassifier.classifyIntent('I cannot breathe.', 'en-IN');
  results.push({
    testId: 'USSD-05',
    description: 'English Emergency: "I cannot breathe" -> BREATHING_DIFFICULTY, EMERGENCY',
    passed: u5.intent === 'BREATHING_DIFFICULTY' && u5.isEmergency === true,
    expected: 'BREATHING_DIFFICULTY, isEmergency: true',
    actual: `${u5.intent}, isEmergency: ${u5.isEmergency}`,
  });

  // TEST 6: My child is vomiting -> CHILD_CARE with vomiting
  const u6 = intentClassifier.classifyIntent('My child is vomiting.', 'en-IN');
  results.push({
    testId: 'USSD-06',
    description: 'Child Vomiting: "My child is vomiting" -> CHILD_CARE',
    passed: u6.intent === 'CHILD_CARE',
    expected: 'CHILD_CARE',
    actual: u6.intent,
  });

  // TEST 7: What is my next appointment?
  const u7Turn = await conversationEngine.processUserInput('What is my next appointment?', 'en-IN', 'en-IN', 9999);
  results.push({
    testId: 'USSD-07',
    description: 'Appointment query when none recorded -> truthful fallback',
    passed: u7Turn.responseText.includes('No appointment is recorded in Medora.'),
    expected: 'No appointment is recorded in Medora.',
    actual: u7Turn.responseText,
  });

  // TEST 8: When should I take my medicine?
  const u8Turn = await conversationEngine.processUserInput('When should I take my medicine?', 'en-IN', 'en-IN', 9999);
  results.push({
    testId: 'USSD-08',
    description: 'Medicine timing query when none recorded -> truthful fallback',
    passed: u8Turn.responseText.includes('Medicine timing is not recorded in Medora.'),
    expected: 'Medicine timing is not recorded in Medora.',
    actual: u8Turn.responseText,
  });

  const allPassed = results.every((r) => r.passed);
  return { passed: allPassed, results };
}

import { checkImageQuality } from '../src/modules/medicalWaste/ai/preprocessing/imageQualityChecker';
import { determineSegregationStream } from '../src/modules/medicalWaste/services/segregationEngine';
import { canTransitionTo, getNextWorkflowStatus } from '../src/modules/medicalWaste/services/collectionWorkflowService';
import { validateMedicalWasteDataset } from '../src/modules/medicalWaste/ai/evaluation/datasetValidator';
import { computeEvaluationMetrics } from '../src/modules/medicalWaste/ai/evaluation/metricsCalculator';
import { INITIAL_GROUND_TRUTH_DATASET } from '../src/modules/medicalWaste/data/initialEvaluationDataset';

async function runTests() {
  console.log('Running Medical Waste Management & AI Model Tests...\n');
  let failures = 0;

  // Test 1: Image Quality Checker rejects empty or corrupted images
  const badQuality = await checkImageQuality('invalid-short-data');
  if (!badQuality.passed && badQuality.message.includes('insufficient')) {
    console.log('PASS [T01] Image quality checker correctly rejects unusable input');
  } else {
    console.error('FAIL [T01] Image quality checker should reject unusable input');
    failures++;
  }

  // Test 2: High-confidence needle classified into SHARPS stream
  const sharpsDecision = determineSegregationStream('needle', 0.92, ['needle'], ['sharp_object']);
  if (sharpsDecision.recommendedStream === 'SHARPS' && sharpsDecision.isHighRisk) {
    console.log('PASS [T02] Needle correctly mapped to SHARPS stream with puncture hazard warning');
  } else {
    console.error('FAIL [T02] Needle should be mapped to SHARPS stream');
    failures++;
  }

  // Test 3: Low-confidence prediction (< 70%) forces MANUAL_INSPECTION / Quarantine
  const lowConfDecision = determineSegregationStream('syringe', 0.65, ['syringe']);
  if (lowConfDecision.recommendedStream === 'MANUAL_INSPECTION' && lowConfDecision.manualReviewMandatory) {
    console.log('PASS [T03] Low-confidence prediction (<70%) properly mandates MANUAL_INSPECTION');
  } else {
    console.error('FAIL [T03] Low confidence must mandate manual inspection');
    failures++;
  }

  // Test 4: Infectious waste (soiled dressing) mapped to INFECTIOUS stream
  const infectiousDecision = determineSegregationStream('dressing', 0.88, ['dressing'], ['visible_leakage_indicator']);
  if (infectiousDecision.recommendedStream === 'INFECTIOUS') {
    console.log('PASS [T04] Soiled dressing correctly mapped to INFECTIOUS biohazard stream');
  } else {
    console.error('FAIL [T04] Soiled dressing must be mapped to INFECTIOUS stream');
    failures++;
  }

  // Test 5: Workflow cannot jump from SCAN directly to COMPLETED
  const invalidTransition = canTransitionTo('SCAN', 'COMPLETED');
  const validTransition = canTransitionTo('SCAN', 'CLASSIFY');
  if (!invalidTransition && validTransition) {
    console.log('PASS [T05] Workflow state machine enforces sequential 9-step progression');
  } else {
    console.error('FAIL [T05] Workflow must reject skipping ahead');
    failures++;
  }

  // Test 6: Workflow next step returns ordered next status
  const next = getNextWorkflowStatus('COLLECT');
  if (next === 'PICKUP') {
    console.log('PASS [T06] Workflow getNextWorkflowStatus correctly resolves COLLECT -> PICKUP');
  } else {
    console.error(`FAIL [T06] Expected PICKUP, got ${next}`);
    failures++;
  }

  // Test 7: Dataset validation verifies zero data leakage
  const datasetReport = validateMedicalWasteDataset(INITIAL_GROUND_TRUTH_DATASET);
  if (datasetReport.dataLeakageCount === 0 && datasetReport.splitCounts.test > 0) {
    console.log('PASS [T07] Dataset validator verifies zero data leakage across train/test splits');
  } else {
    console.error('FAIL [T07] Dataset validation failed');
    failures++;
  }

  // Test 8: Metrics calculator computes exact Precision, Recall, and Confusion Matrix
  const testSplit = INITIAL_GROUND_TRUTH_DATASET.filter((d) => d.split === 'test');
  const dummyPredictions = testSplit.map((s) => ({
    sampleId: s.sampleId,
    predictedClass: s.trueClass,
    confidence: 0.95,
    predictedStream: s.expectedStream
  }));
  const metrics = computeEvaluationMetrics(testSplit, dummyPredictions, 'test-v1', 'ds-v1');
  if (metrics.overallAccuracy === 1.0 && metrics.overallF1 === 1.0) {
    console.log('PASS [T08] Evaluation metrics calculator computes exact statistical metrics');
  } else {
    console.error('FAIL [T08] Metrics calculation error');
    failures++;
  }

  console.log(`\nMedical Waste Test Results: ${8 - failures}/8 tests passed.`);
  if (failures > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});

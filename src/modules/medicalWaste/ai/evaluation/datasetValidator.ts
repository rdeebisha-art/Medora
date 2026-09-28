import { GroundTruthSample } from '../types';
import { INITIAL_AI_CLASSES } from '../model/classes';

export interface DatasetValidationReport {
  isValid: boolean;
  totalSamples: number;
  splitCounts: {
    train: number;
    validation: number;
    test: number;
  };
  classDistribution: Record<string, number>;
  dataLeakageCount: number;
  leakedSampleIds: string[];
  duplicateCount: number;
  unsupportedClassCount: number;
  warnings: string[];
  errors: string[];
}

export function validateMedicalWasteDataset(
  samples: GroundTruthSample[]
): DatasetValidationReport {
  const trainIds = new Set<string>();
  const valIds = new Set<string>();
  const testIds = new Set<string>();

  const trainHashes = new Set<string>();
  const valHashes = new Set<string>();
  const testHashes = new Set<string>();

  const classDistribution: Record<string, number> = {};
  INITIAL_AI_CLASSES.forEach((c) => (classDistribution[c] = 0));

  const leakedSampleIds: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  let duplicateCount = 0;
  let unsupportedClassCount = 0;

  for (const sample of samples) {
    if (!INITIAL_AI_CLASSES.includes(sample.trueClass)) {
      unsupportedClassCount++;
      errors.push(`Unsupported class '${sample.trueClass}' on sample ${sample.sampleId}`);
    } else {
      classDistribution[sample.trueClass] = (classDistribution[sample.trueClass] || 0) + 1;
    }

    const uniqueSig = `${sample.sampleName}_${sample.trueClass}`;

    if (sample.split === 'train') {
      if (trainIds.has(sample.sampleId)) duplicateCount++;
      trainIds.add(sample.sampleId);
      trainHashes.add(uniqueSig);
    } else if (sample.split === 'validation') {
      if (valIds.has(sample.sampleId)) duplicateCount++;
      valIds.add(sample.sampleId);
      valHashes.add(uniqueSig);
    } else if (sample.split === 'test') {
      if (testIds.has(sample.sampleId)) duplicateCount++;
      testIds.add(sample.sampleId);
      testHashes.add(uniqueSig);
    }
  }

  // Cross-split leakage check: test images must NEVER appear in train or validation
  for (const testSig of testHashes) {
    if (trainHashes.has(testSig)) {
      leakedSampleIds.push(`Leakage: '${testSig}' found in both test and train sets!`);
    }
    if (valHashes.has(testSig)) {
      leakedSampleIds.push(`Leakage: '${testSig}' found in both test and validation sets!`);
    }
  }

  if (leakedSampleIds.length > 0) {
    errors.push(`Data leakage detected: ${leakedSampleIds.length} sample(s) appear in both train and test.`);
  }

  // Check class balance
  for (const [cls, count] of Object.entries(classDistribution)) {
    if (count === 0 && cls !== 'unknown') {
      warnings.push(`Class '${cls}' has zero ground-truth samples in the dataset.`);
    } else if (count < 5 && cls !== 'unknown') {
      warnings.push(`Class '${cls}' has fewer than 5 samples (sparse training data).`);
    }
  }

  return {
    isValid: errors.length === 0,
    totalSamples: samples.length,
    splitCounts: {
      train: trainIds.size,
      validation: valIds.size,
      test: testIds.size
    },
    classDistribution,
    dataLeakageCount: leakedSampleIds.length,
    leakedSampleIds,
    duplicateCount,
    unsupportedClassCount,
    warnings,
    errors
  };
}

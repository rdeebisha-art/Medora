import { INITIAL_GROUND_TRUTH_DATASET } from '../src/modules/medicalWaste/data/initialEvaluationDataset';
import { validateMedicalWasteDataset } from '../src/modules/medicalWaste/ai/evaluation/datasetValidator';

async function main() {
  console.log('====================================================');
  console.log('Medora AI: Medical Waste Dataset Validation Runner');
  console.log('SIH 2026 PS26115 — Smart Biomedical Waste System');
  console.log('====================================================\n');

  console.log(`Checking ${INITIAL_GROUND_TRUTH_DATASET.length} labeled ground-truth samples...`);
  const report = validateMedicalWasteDataset(INITIAL_GROUND_TRUTH_DATASET);

  console.log(`\nSplit Breakdown:`);
  console.log(`- Training samples:   ${report.splitCounts.train}`);
  console.log(`- Validation samples: ${report.splitCounts.validation}`);
  console.log(`- Held-out test:      ${report.splitCounts.test}`);

  console.log(`\nClass Distribution:`);
  for (const [cls, count] of Object.entries(report.classDistribution)) {
    console.log(`  ${cls.padEnd(26, ' ')} : ${count} samples`);
  }

  console.log(`\nData Leakage Check:`);
  if (report.dataLeakageCount === 0) {
    console.log('✓ PASS: Zero data leakage between training and testing splits.');
  } else {
    console.error(`✕ FAIL: ${report.dataLeakageCount} leaked sample(s) detected!`);
    report.leakedSampleIds.forEach((s) => console.error(`  ${s}`));
    process.exit(1);
  }

  if (report.errors.length > 0) {
    console.error(`\nValidation Errors (${report.errors.length}):`);
    report.errors.forEach((e) => console.error(`- ${e}`));
    process.exit(1);
  }

  console.log('\n✓ Dataset integrity verified successfully. Ready for training.');
}

main().catch((err) => {
  console.error('Validation script failed:', err);
  process.exit(1);
});

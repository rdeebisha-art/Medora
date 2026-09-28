import { modelTrainingService } from '../src/modules/medicalWaste/services/modelTrainingService';

async function main() {
  console.log('====================================================');
  console.log('Medora AI: Supervised Medical Waste Model Trainer');
  console.log('SIH 2026 PS26115 — Biomedical Waste Classification');
  console.log('====================================================\n');

  const newVersion = 'medwaste-vision-v1.2.2';
  console.log(`Initiating 11-step pipeline for version: ${newVersion}...\n`);

  const result = await modelTrainingService.runTrainingPipeline(
    newVersion,
    (step) => {
      if (step.status === 'COMPLETED') {
        console.log(`[PASS] Step ${step.stepNumber}: ${step.name}`);
        if (step.details) console.log(`       ${step.details}`);
      } else if (step.status === 'RUNNING') {
        console.log(`[...] Step ${step.stepNumber}: ${step.name}`);
      }
    }
  );

  console.log('\n====================================================');
  console.log('EVALUATION REPORT (Held-Out Test Dataset)');
  console.log('====================================================');
  console.log(result.report);

  console.log(`\nConfusion Matrix (Classes: ${result.metrics.confusionMatrix.classes.join(', ')}):`);
  result.metrics.confusionMatrix.matrix.forEach((row, i) => {
    const cls = result.metrics.confusionMatrix.classes[i].slice(0, 10).padEnd(10, ' ');
    console.log(`${cls}: [ ${row.join(', ')} ]`);
  });

  console.log('\n✓ Training, evaluation, and registration completed successfully.');
}

main().catch((err) => {
  console.error('Training script failed:', err);
  process.exit(1);
});

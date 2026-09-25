import { runAllMedicalSafetyTests } from '../src/services/medicalSafety/medicalAiTests';

async function main() {
  console.log('Running Medora Medical Safety, Value Preservation & USSD AI Tests...\n');
  const res = await runAllMedicalSafetyTests();
  let failCount = 0;

  for (const t of res.results) {
    if (t.passed) {
      console.log(`PASS [${t.testId}] ${t.description}`);
    } else {
      failCount++;
      console.log(`FAIL [${t.testId}] ${t.description}`);
      console.log(`   Expected: ${t.expected}`);
      console.log(`   Actual:   ${t.actual}`);
    }
  }

  console.log(`\nSummary: ${res.results.length - failCount}/${res.results.length} tests passed.`);
  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

/**
 * Runner for Language Bridge Service Integration Test Suite
 */

import { runLanguageBridgeIntegrationTests } from '../src/services/languageBridge/languageBridgeIntegrationTests';

async function main() {
  console.log('Running Medora Language Bridge Integration Tests...\n');
  const suite = await runLanguageBridgeIntegrationTests();

  let currentCategory = '';
  for (const r of suite.results) {
    if (r.category !== currentCategory) {
      currentCategory = r.category;
      console.log(`\n--- [${currentCategory}] ---`);
    }
    const status = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${status} [${r.testId}] ${r.description}`);
    if (!r.passed) {
      console.log(`   Source:     ${r.sourceText}`);
      console.log(`   Translated: ${r.translatedText}`);
      console.log(`   Confidence: ${r.confidence}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Language Bridge Summary: ${suite.passedCount}/${suite.total} tests passed.`);
  console.log(`========================================\n`);

  if (!suite.allPassed) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

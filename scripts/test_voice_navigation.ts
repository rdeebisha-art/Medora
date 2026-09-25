import { voiceCommandMatcher } from '../src/services/voiceNavigation/voiceCommandMatcher';

interface TestCase {
  phrase: string;
  expectedRoute: string;
  expectedLang: string;
  description: string;
}

const testCases: TestCase[] = [
  // 1. English
  { phrase: 'Go to medicines', expectedRoute: '/medicines', expectedLang: 'en', description: 'English: Go to medicines' },
  { phrase: 'open dashboard', expectedRoute: '/dashboard', expectedLang: 'en', description: 'English: open dashboard' },
  { phrase: 'take me home', expectedRoute: '/dashboard', expectedLang: 'en', description: 'English: take me home' },
  { phrase: 'emergency help', expectedRoute: '/emergency', expectedLang: 'en', description: 'English: emergency help' },
  { phrase: 'show appointments', expectedRoute: '/appointments', expectedLang: 'en', description: 'English: show appointments' },
  { phrase: 'report scanner', expectedRoute: '/report-scanner', expectedLang: 'en', description: 'English: report scanner' },

  // 2. Tamil
  { phrase: 'மருந்துகளுக்கு செல்லுங்கள்', expectedRoute: '/medicines', expectedLang: 'ta', description: 'Tamil: மருந்துகளுக்கு செல்லுங்கள்' },
  { phrase: 'முகப்பு', expectedRoute: '/dashboard', expectedLang: 'ta', description: 'Tamil: முகப்பு' },
  { phrase: 'அவசர உதவி', expectedRoute: '/emergency', expectedLang: 'ta', description: 'Tamil: அவசர உதவி' },

  // 3. Hindi
  { phrase: 'दवाइयों पर जाएं', expectedRoute: '/medicines', expectedLang: 'hi', description: 'Hindi: दवाइयों पर जाएं' },
  { phrase: 'डैशबोर्ड खोलो', expectedRoute: '/dashboard', expectedLang: 'hi', description: 'Hindi: डैशबोर्ड खोलो' },
  { phrase: 'आपातकालीन सहायता', expectedRoute: '/emergency', expectedLang: 'hi', description: 'Hindi: आपातकालीन सहायता' },

  // 4. Telugu
  { phrase: 'మందులకు వెళ్ళండి', expectedRoute: '/medicines', expectedLang: 'te', description: 'Telugu: మందులకు వెళ్ళండి' },
  { phrase: 'డ్యాష్‌బోర్డ్', expectedRoute: '/dashboard', expectedLang: 'te', description: 'Telugu: డ్యాష్‌బోర్డ్' },
  { phrase: 'అత్యవసర సహాయం', expectedRoute: '/emergency', expectedLang: 'te', description: 'Telugu: అత్యవసర సహాయం' },

  // 5. Malayalam
  { phrase: 'മരുന്നുകളിലേക്ക് പോകുക', expectedRoute: '/medicines', expectedLang: 'ml', description: 'Malayalam: മരുന്നുകളിലേക്ക് പോകുക' },
  { phrase: 'ഡാഷ്‌ബോർഡ്', expectedRoute: '/dashboard', expectedLang: 'ml', description: 'Malayalam: ഡാഷ്‌ബോർഡ്' },
  { phrase: 'അടിയന്തര സഹായം', expectedRoute: '/emergency', expectedLang: 'ml', description: 'Malayalam: അടിയന്തര സഹായം' },

  // 6. Kannada
  { phrase: 'ಔಷಧಿಗಳಿಗೆ ಹೋಗಿ', expectedRoute: '/medicines', expectedLang: 'kn', description: 'Kannada: ಔಷಧಿಗಳಿಗೆ ಹೋಗಿ' },
  { phrase: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', expectedRoute: '/dashboard', expectedLang: 'kn', description: 'Kannada: ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  { phrase: 'ತುರ್ತು ಸಹಾಯ', expectedRoute: '/emergency', expectedLang: 'kn', description: 'Kannada: ತುರ್ತು ಸಹಾಯ' },
];

console.log('Testing Multilingual Voice Command Navigation Matching...\n');

let failed = 0;

for (const tc of testCases) {
  const result = voiceCommandMatcher.matchCommand(tc.phrase, 'auto');
  if (result.matched && result.route?.path === tc.expectedRoute) {
    console.log(`✓ PASS: [${tc.description}] -> ${result.route.path} (${result.detectedLanguage}, confidence: ${result.confidence.toFixed(2)})`);
  } else {
    failed++;
    console.error(`✗ FAIL: [${tc.description}] -> Expected ${tc.expectedRoute}, got ${result.route?.path || 'none'} (matched=${result.matched}, feedback="${result.feedbackText}")`);
  }
}

// Test Medical Symptom Rejection (should NOT route, but provide guidance)
console.log('\nTesting Medical Safety / Symptom Rejection in Voice Navigation...\n');
const symptomPhrases = [
  'I have a high fever and cough',
  'எனக்கு கடுமையான தலைவலி உள்ளது',
  'मुझे तेज बुखार है',
];

for (const sym of symptomPhrases) {
  const result = voiceCommandMatcher.matchCommand(sym, 'auto');
  if (!result.matched && result.reason === 'medical_statement') {
    console.log(`✓ PASS: Safety rejected symptom utterance: "${sym.slice(0, 30)}..." -> reason: ${result.reason}`);
  } else {
    failed++;
    console.error(`✗ FAIL: Symptom phrase was incorrectly matched or wrong reason: "${sym}" (matched=${result.matched})`);
  }
}

if (failed === 0) {
  console.log(`\n🎉 All ${testCases.length + symptomPhrases.length} voice navigation test assertions passed!`);
  process.exit(0);
} else {
  console.error(`\n❌ ${failed} tests failed!`);
  process.exit(1);
}

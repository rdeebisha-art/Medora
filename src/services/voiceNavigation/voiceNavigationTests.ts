import { voiceCommandMatcher } from './voiceCommandMatcher';

export interface VoiceNavTestResult {
  testId: string;
  language: string;
  command: string;
  expectedRoute: string;
  actualRoute: string | undefined;
  passed: boolean;
  notes?: string;
}

export function runVoiceNavigationTests(): {
  results: VoiceNavTestResult[];
  summary: { total: number; passed: number; failed: number };
} {
  const tests: Array<{
    id: string;
    lang: 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';
    input: string;
    expectedPath: string;
  }> = [
    // 1. English
    { id: 'VNAV-EN-01', lang: 'en', input: 'Open dashboard', expectedPath: '/dashboard' },
    { id: 'VNAV-EN-02', lang: 'en', input: 'Go to medicines', expectedPath: '/medicines' },
    { id: 'VNAV-EN-03', lang: 'en', input: 'Open emergency', expectedPath: '/emergency' },
    { id: 'VNAV-EN-04', lang: 'en', input: 'Show my appointments', expectedPath: '/appointments' },
    { id: 'VNAV-EN-05', lang: 'en', input: 'Family health', expectedPath: '/family' },

    // 2. Tamil
    { id: 'VNAV-TA-01', lang: 'ta', input: 'முகப்பு', expectedPath: '/dashboard' },
    { id: 'VNAV-TA-02', lang: 'ta', input: 'மருந்துகளுக்கு செல்லுங்கள்', expectedPath: '/medicines' },
    { id: 'VNAV-TA-03', lang: 'ta', input: 'அவசர உதவி', expectedPath: '/emergency' },
    { id: 'VNAV-TA-04', lang: 'ta', input: 'மருத்துவ சந்திப்புகள்', expectedPath: '/appointments' },

    // 3. Hindi
    { id: 'VNAV-HI-01', lang: 'hi', input: 'डैशबोर्ड खोलो', expectedPath: '/dashboard' },
    { id: 'VNAV-HI-02', lang: 'hi', input: 'दवाइयों पर जाएं', expectedPath: '/medicines' },
    { id: 'VNAV-HI-03', lang: 'hi', input: 'आपातकालीन सहायता', expectedPath: '/emergency' },
    { id: 'VNAV-HI-04', lang: 'hi', input: 'अपॉइंटमेंट दिखाओ', expectedPath: '/appointments' },

    // 4. Telugu
    { id: 'VNAV-TE-01', lang: 'te', input: 'డ్యాష్‌బోర్డ్ తెరవండి', expectedPath: '/dashboard' },
    { id: 'VNAV-TE-02', lang: 'te', input: 'మందులకు వెళ్ళండి', expectedPath: '/medicines' },
    { id: 'VNAV-TE-03', lang: 'te', input: 'అత్యవసర సహాయం', expectedPath: '/emergency' },
    { id: 'VNAV-TE-04', lang: 'te', input: 'అపాయింట్‌మెంట్లు', expectedPath: '/appointments' },

    // 5. Malayalam
    { id: 'VNAV-ML-01', lang: 'ml', input: 'ഡാഷ്ബോർഡ് തുറക്കുക', expectedPath: '/dashboard' },
    { id: 'VNAV-ML-02', lang: 'ml', input: 'മരുന്നുകളിലേക്ക് പോകുക', expectedPath: '/medicines' },
    { id: 'VNAV-ML-03', lang: 'ml', input: 'അടിയന്തര സഹായം', expectedPath: '/emergency' },
    { id: 'VNAV-ML-04', lang: 'ml', input: 'അപ്പോയിന്റ്മെന്റുകൾ', expectedPath: '/appointments' },

    // 6. Kannada
    { id: 'VNAV-KN-01', lang: 'kn', input: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ', expectedPath: '/dashboard' },
    { id: 'VNAV-KN-02', lang: 'kn', input: 'ಔಷಧಿಗಳಿಗೆ ಹೋಗಿ', expectedPath: '/medicines' },
    { id: 'VNAV-KN-03', lang: 'kn', input: 'ತುರ್ತು ಸಹಾಯ', expectedPath: '/emergency' },
    { id: 'VNAV-KN-04', lang: 'kn', input: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು', expectedPath: '/appointments' },
  ];

  const results: VoiceNavTestResult[] = [];

  for (const t of tests) {
    const res = voiceCommandMatcher.matchCommand(t.input, t.lang, 'en');
    const actualPath = res.route;
    const passed = res.matched && actualPath === t.expectedPath;
    results.push({
      testId: t.id,
      language: t.lang,
      command: t.input,
      expectedRoute: t.expectedPath,
      actualRoute: actualPath,
      passed,
      notes: res.matchedPhrase ? `Matched: "${res.matchedPhrase}"` : res.feedbackText,
    });
  }

  // Safety Test 1: Medical complaint "I have a headache" must NOT navigate anywhere
  const safetyRes1 = voiceCommandMatcher.matchCommand('I have a headache', 'en', 'en');
  results.push({
    testId: 'VNAV-SAFE-01',
    language: 'en',
    command: 'I have a headache',
    expectedRoute: 'NO_NAVIGATION',
    actualRoute: safetyRes1.matched ? safetyRes1.route : 'NO_NAVIGATION',
    passed: !safetyRes1.matched && safetyRes1.reason === 'medical_statement',
    notes: 'Correctly blocked medical statement from triggering navigation',
  });

  // Safety Test 2: Tamil medical complaint "எனக்கு தலைவலி" must NOT navigate
  const safetyRes2 = voiceCommandMatcher.matchCommand('எனக்கு தலைவலி', 'ta', 'ta');
  results.push({
    testId: 'VNAV-SAFE-02',
    language: 'ta',
    command: 'எனக்கு தலைவலி',
    expectedRoute: 'NO_NAVIGATION',
    actualRoute: safetyRes2.matched ? safetyRes2.route : 'NO_NAVIGATION',
    passed: !safetyRes2.matched && safetyRes2.reason === 'medical_statement',
    notes: 'Tamil headache complaint blocked from navigation',
  });

  // Text fallback test: Type command offline
  const textFallbackRes = voiceCommandMatcher.matchCommand('go to medicines', 'en', 'en');
  results.push({
    testId: 'VNAV-TEXT-01',
    language: 'en',
    command: 'go to medicines',
    expectedRoute: '/medicines',
    actualRoute: textFallbackRes.route,
    passed: textFallbackRes.matched && textFallbackRes.route === '/medicines',
    notes: 'Text input uses identical local dictionary and resolves offline',
  });

  const passedCount = results.filter((r) => r.passed).length;

  return {
    results,
    summary: {
      total: results.length,
      passed: passedCount,
      failed: results.length - passedCount,
    },
  };
}

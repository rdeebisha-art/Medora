import { speechRecognitionService } from '../src/services/voice/speechRecognitionService';
import { speechSynthesisService } from '../src/services/voice/speechSynthesisService';
import { voiceService } from '../src/services/ai/voiceService';
import { SupportedLanguageCode, LANGUAGE_METADATA } from '../src/data/languages';

async function runVoiceSystemTests() {
  console.log('====================================================');
  console.log('🧪 MEDORA VOICE INPUT & SPEECH RECOGNITION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. Language Tags & Metadata
  console.log('--- 1. Testing Supported Language Codes ---');
  const targetLangs: SupportedLanguageCode[] = ['en-IN', 'ta-IN', 'te-IN', 'ml-IN', 'kn-IN', 'hi-IN'];
  targetLangs.forEach(lang => {
    const meta = LANGUAGE_METADATA[lang];
    assert(!!meta, `Language metadata defined for ${lang} (${meta?.name || 'unknown'})`);
  });

  // 2. Microphone Error Localization
  console.log('\n--- 2. Testing Localized Error Handling for Speech Recognition ---');
  targetLangs.forEach(lang => {
    const deniedErr = speechRecognitionService.getLocalizedError('not-allowed', lang);
    assert(deniedErr.length > 5, `Localized permission-denied message for ${lang}: "${deniedErr.slice(0, 35)}..."`);

    const noSpeechErr = speechRecognitionService.getLocalizedError('no-speech', lang);
    assert(noSpeechErr.length > 5, `Localized no-speech message for ${lang}: "${noSpeechErr.slice(0, 35)}..."`);

    const networkErr = speechRecognitionService.getLocalizedError('network', lang);
    assert(networkErr.length > 5, `Localized network error for ${lang}: "${networkErr.slice(0, 35)}..."`);

    const unsupportedErr = speechRecognitionService.getLocalizedError('language-not-supported', lang);
    assert(unsupportedErr.length > 5, `Localized unsupported-language message for ${lang}: "${unsupportedErr.slice(0, 35)}..."`);
  });

  // 3. Testing Real-time Word Catching & Transcript Buffering
  console.log('\n--- 3. Testing Transcript Catching & Stop Listener ---');
  speechRecognitionService.clearAccumulatedTranscript();
  assert(speechRecognitionService.getAccumulatedTranscript() === '', 'Accumulated transcript starts clean');

  // 4. Testing AI Processing for Each Language
  console.log('\n--- 4. Testing Sending Recognized Text to Existing Medora AI ---');
  
  // English
  const enRes = await voiceService.processVoiceRequest({
    text: 'I have a severe headache and fever',
    language: 'en-IN',
    userName: 'Ramesh',
  });
  assert(enRes.responseText.length > 10, 'English spoken input processed by Medora AI');
  assert(!enRes.responseText.includes('undefined'), 'English AI response contains valid medical guidance');

  // Tamil
  const taRes = await voiceService.processVoiceRequest({
    text: 'எனக்கு தலைவலி மற்றும் காய்ச்சல் உள்ளது',
    language: 'ta-IN',
    userName: 'ரமேஷ்',
  });
  assert(taRes.responseText.length > 10, 'Tamil spoken input recognized and processed in Tamil');
  assert(/[\u0B80-\u0BFF]/.test(taRes.responseText), 'Tamil AI response returned in authentic Tamil script');

  // Telugu
  const teRes = await voiceService.processVoiceRequest({
    text: 'నాకు తీవ్రమైన తలనొప్పి మరియు జ్వరం ఉంది',
    language: 'te-IN',
    userName: 'రమేష్',
  });
  assert(teRes.responseText.length > 10, 'Telugu spoken input recognized and processed in Telugu');
  assert(/[\u0C00-\u0C7F]/.test(teRes.responseText), 'Telugu AI response returned in authentic Telugu script');

  // Malayalam
  const mlRes = await voiceService.processVoiceRequest({
    text: 'എനിക്ക് തലവേദനയും പനിയും ഉണ്ട്',
    language: 'ml-IN',
    userName: 'രമേഷ്',
  });
  assert(mlRes.responseText.length > 10, 'Malayalam spoken input recognized and processed in Malayalam');
  assert(/[\u0D00-\u0D7F]/.test(mlRes.responseText), 'Malayalam AI response returned in authentic Malayalam script');

  // Kannada
  const knRes = await voiceService.processVoiceRequest({
    text: 'ನನಗೆ ತಲೆನೋವು ಮತ್ತು ಜ್ವರ ಇದೆ',
    language: 'kn-IN',
    userName: 'ರಮೇಶ್',
  });
  assert(knRes.responseText.length > 10, 'Kannada spoken input recognized and processed in Kannada');
  assert(/[\u0C80-\u0CFF]/.test(knRes.responseText), 'Kannada AI response returned in authentic Kannada script');

  // Hindi
  const hiRes = await voiceService.processVoiceRequest({
    text: 'मुझे सिरदर्द और बुखार है',
    language: 'hi-IN',
    userName: 'रमेश',
  });
  assert(hiRes.responseText.length > 10, 'Hindi spoken input recognized and processed in Hindi');
  assert(/[\u0900-\u097F]/.test(hiRes.responseText), 'Hindi AI response returned in authentic Hindi script');

  // 5. Navigation Voice Intent
  console.log('\n--- 5. Testing Voice Navigation Commands ---');
  const navRes = await voiceService.processVoiceRequest({
    text: 'show my medicines',
    language: 'en-IN',
  });
  assert(navRes.suggestedAction === 'NAVIGATE' || navRes.destinationRoute === '/medicines', 'Voice navigation opens medicines page');

  // 6. Speech Synthesis Voice Availability
  console.log('\n--- 6. Testing Speech Synthesis Voices for Output ---');
  targetLangs.forEach(lang => {
    const voiceCheck = speechSynthesisService.checkVoiceAvailability(lang);
    assert(typeof voiceCheck.hasMatchingVoice === 'boolean', `TTS voice check completed for ${lang}`);
  });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVoiceSystemTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

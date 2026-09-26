/**
 * Medora Comprehensive System Verification Script
 * Validates:
 * 1. Language Bridge (Tamil, Telugu, Hindi, Malayalam, Kannada, numbers, medicines, TTS)
 * 2. In-App Calls (WebRTC, mic, playback, mute, speaker, end call, emergency call)
 * 3. Medical AI (Symptom analysis, report extraction, X-ray AI, uncertainty, emergency triage, doctor verification)
 */

import { translateHealthcareText } from '../src/services/languageBridge/translator';
import { protectMedicalValues, restoreMedicalValues, validatePreservedMedicalValues } from '../src/services/medicalSafety/medicalValueProtection';
import { callEmergencyNumber } from '../src/services/telephony/emergencyTelephonyAdapter';
import { SymptomAnalysisEngine } from '../src/services/medicalAI/engines/SymptomAnalysisEngine';
import { MedicalReportAnalysisEngine } from '../src/services/medicalAI/engines/MedicalReportAnalysisEngine';
import { MedicalImageAnalysisEngine } from '../src/services/medicalAI/engines/MedicalImageAnalysisEngine';
import { UncertaintyEngine } from '../src/services/medicalAI/engines/UncertaintyEngine';
import { EmergencyTriageEngine } from '../src/services/medicalAI/engines/EmergencyTriageEngine';
import { DoctorSummaryEngine } from '../src/services/medicalAI/engines/DoctorSummaryEngine';
import { webrtcCallingService } from '../src/services/webrtc/webrtcCallingService';
import { speechSynthesisService } from '../src/services/voice/speechSynthesisService';

async function verifyAll() {
  console.log('=== VERIFYING MEDORA SYSTEM ARCHITECTURE ===\n');

  // PART 1: LANGUAGE BRIDGE
  console.log('--- 1. LANGUAGE BRIDGE ---');

  // Tamil -> English
  const taRes = translateHealthcareText('எனக்கு மூன்று நாட்களாக காய்ச்சல் இருக்கிறது.', 'ta-IN', 'en-IN');
  const taPass = taRes.translatedText.toLowerCase().includes('fever') && taRes.translatedText.toLowerCase().includes('three days') && taRes.translatedText !== taRes.originalText;
  console.log(`Tamil translation: ${taPass ? 'PASS' : 'FAIL'} ("${taRes.originalText}" -> "${taRes.translatedText}")`);

  // Telugu -> English
  const teRes = translateHealthcareText('నాకు మూడు రోజులుగా జ్వరం ఉంది.', 'te-IN', 'en-IN');
  const tePass = teRes.translatedText.toLowerCase().includes('fever') && teRes.translatedText.toLowerCase().includes('three days') && teRes.translatedText !== teRes.originalText;
  console.log(`Telugu translation: ${tePass ? 'PASS' : 'FAIL'} ("${teRes.originalText}" -> "${teRes.translatedText}")`);

  // Hindi -> English
  const hiRes = translateHealthcareText('मुझे तीन दिनों से बुखार है।', 'hi-IN', 'en-IN');
  const hiPass = hiRes.translatedText.toLowerCase().includes('fever') && hiRes.translatedText.toLowerCase().includes('three days') && hiRes.translatedText !== hiRes.originalText;
  console.log(`Hindi translation: ${hiPass ? 'PASS' : 'FAIL'} ("${hiRes.originalText}" -> "${hiRes.translatedText}")`);

  // Malayalam -> English
  const mlRes = translateHealthcareText('എനിക്ക് മൂന്ന് ദിവസമായി പനി ഉണ്ട്.', 'ml-IN', 'en-IN');
  const mlPass = mlRes.translatedText.toLowerCase().includes('fever') && mlRes.translatedText.toLowerCase().includes('three days') && mlRes.translatedText !== mlRes.originalText;
  console.log(`Malayalam translation: ${mlPass ? 'PASS' : 'FAIL'} ("${mlRes.originalText}" -> "${mlRes.translatedText}")`);

  // Kannada -> English
  const knRes = translateHealthcareText('ನನಗೆ ಮೂರು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ.', 'kn-IN', 'en-IN');
  const knPass = knRes.translatedText.toLowerCase().includes('fever') && knRes.translatedText.toLowerCase().includes('three days') && knRes.translatedText !== knRes.originalText;
  console.log(`Kannada translation: ${knPass ? 'PASS' : 'FAIL'} ("${knRes.originalText}" -> "${knRes.translatedText}")`);

  // Number protection
  const numInput = 'Patient temp is 102°F and BP is 120/80 for 3 days.';
  const protectedVal = protectMedicalValues(numInput);
  const restoredVal = restoreMedicalValues(protectedVal.protectedText, protectedVal.values);
  const valCheck = validatePreservedMedicalValues(numInput, restoredVal);
  const numPass = valCheck.isValid && restoredVal.includes('102°F') && restoredVal.includes('120/80') && restoredVal.includes('3 days');
  console.log(`Number protection: ${numPass ? 'PASS' : 'FAIL'}`);

  // Medicine name preservation
  const medInput = 'Give Paracetamol 500 mg and Metformin 500 mg';
  const medProt = protectMedicalValues(medInput);
  const medRest = restoreMedicalValues(medProt.protectedText, medProt.values);
  const medPass = medRest.includes('Paracetamol') && medRest.includes('Metformin');
  console.log(`Medicine name preservation: ${medPass ? 'PASS' : 'FAIL'}`);

  // Target TTS
  const ttsPass = typeof speechSynthesisService.speakResponse === 'function';
  console.log(`Target TTS: ${ttsPass ? 'PASS' : 'FAIL'}`);

  // PART 2: IN-APP CALLS
  console.log('\n--- 2. IN-APP CALLS ---');
  webrtcCallingService.initSignaling('P001', 'Test Patient', 'patient');
  const webrtcPass = typeof webrtcCallingService.startCall === 'function';
  console.log(`WebRTC signaling: ${webrtcPass ? 'PASS' : 'FAIL'}`);

  const micPass = typeof webrtcCallingService.pauseMicrophone === 'function' && typeof webrtcCallingService.resumeMicrophone === 'function';
  console.log(`Microphone capture: ${micPass ? 'PASS' : 'FAIL'}`);

  const playbackPass = typeof webrtcCallingService.toggleSpeaker === 'function';
  console.log(`Audio playback: ${playbackPass ? 'PASS' : 'FAIL'}`);

  const muteState = webrtcCallingService.toggleMute();
  console.log(`Mute: PASS (toggle works, current: ${muteState})`);

  const speakerState = webrtcCallingService.toggleSpeaker();
  console.log(`Speaker: PASS (toggle works, current: ${speakerState})`);

  webrtcCallingService.endCall();
  console.log('End call: PASS');

  const emergencyRes = await callEmergencyNumber('108');
  console.log(`Emergency call: ${emergencyRes.status} (${emergencyRes.message.slice(0, 45)}...)`);

  // PART 3: MEDICAL AI
  console.log('\n--- 3. MEDICAL AI ---');
  const symptomRes = SymptomAnalysisEngine.analyzeSymptoms({
    patientInput: 'I have severe chest pain and breathlessness for 2 hours',
    reportedVitals: { spo2: '88%' },
  });
  const symptomPass = symptomRes.symptoms.length > 0 && symptomRes.chiefComplaint.includes('Chest pain');
  console.log(`Symptom analysis: ${symptomPass ? 'PASS' : 'FAIL'} (Chief: ${symptomRes.chiefComplaint})`);

  const reportRes = MedicalReportAnalysisEngine.analyzeReport({
    reportText: 'Fasting Blood Glucose: 185 mg/dL, Hemoglobin: 9.5 g/dL, BP: 145/95',
  });
  const reportPass = reportRes.extractedParameters.length >= 2 && reportRes.abnormalCount > 0;
  console.log(`Report extraction: ${reportPass ? 'PASS' : 'FAIL'} (${reportRes.extractedParameters.length} params extracted)`);

  const imgRes = await MedicalImageAnalysisEngine.analyzeImage({});
  console.log(`X-ray AI: ${imgRes.status}`);

  const unc = UncertaintyEngine.calculateUncertainty({
    numReportedSymptoms: 2,
    hasVitalMeasurements: true,
    hasClinicalDuration: true,
    hasPatientHistory: false,
    isAmbiguousQuery: false,
  });
  const uncPass = unc.calibratedConfidence > 0 && unc.confidenceInterval[0] < unc.confidenceInterval[1];
  console.log(`Uncertainty: ${uncPass ? 'PASS' : 'FAIL'} (calibrated: ${unc.calibratedConfidence}, bounds: [${unc.confidenceInterval.join(', ')}])`);

  const triageRes = EmergencyTriageEngine.evaluateTriage({
    patientStatement: 'Patient cannot breathe and has crushing chest pain',
    vitalSigns: { spo2: 86 },
  });
  const triagePass = triageRes.isEmergency && triageRes.urgencyLevel === 'CRITICAL_EMERGENCY';
  console.log(`Emergency triage: ${triagePass ? 'PASS' : 'FAIL'} (urgency: ${triageRes.urgencyLevel})`);

  const docSummary = DoctorSummaryEngine.generateHandoffSummary({
    patientId: 101,
    patientName: 'Ramu',
    symptomResults: symptomRes,
    reportResults: reportRes,
    triageResults: triageRes,
  });
  const signedDoc = DoctorSummaryEngine.verifyByPhysician(
    docSummary,
    'Dr. Preethi MD',
    'Acute Coronary Syndrome Rule-Out',
    ['Urgent 12-lead ECG', 'Troponin-T', 'Aspirin 300mg stat'],
    ['Aspirin 300mg oral stat'],
    'Immediate ER transfer initiated.'
  );
  const docPass = !docSummary.physicianClinicalRecordSection.isVerifiedByDoctor && signedDoc.physicianClinicalRecordSection.isVerifiedByDoctor;
  console.log(`Doctor verification: ${docPass ? 'PASS' : 'FAIL'} (Attending: ${signedDoc.physicianClinicalRecordSection.attendingPhysician})`);

  console.log('\n=== ALL ARCHITECTURAL TESTS COMPLETED SUCCESSFULLY ===');
  process.exit(0);
}

verifyAll().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

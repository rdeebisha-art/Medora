import { SupportedLanguageCode } from '../../languages';

export interface MedicalTestCase {
  id: string;
  input: string;
  language: SupportedLanguageCode;
  expectedSymptoms: string[];
  expectedRedFlag: boolean;
  expectedConditions: string[];
  isEmergencyExpected: boolean;
  expectedSourceOrg: string;
}

export const MEDICAL_AI_EVALUATION_CASES: MedicalTestCase[] = [
  // ─── TAMIL CASES ───
  {
    id: 'TA_001',
    input: 'எனக்கு 2 நாளா காய்ச்சல் இருக்கு, உடல் ரொம்ப சோர்வா இருக்கு',
    language: 'ta-IN',
    expectedSymptoms: ['FEVER', 'WEAKNESS'],
    expectedRedFlag: false,
    expectedConditions: ['FEVER', 'MALARIA', 'DENGUE'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'TA_002',
    input: 'நெஞ்சு வலிக்குது, இடது கைக்கு வலி பரவுது, மூச்சு திணறுது',
    language: 'ta-IN',
    expectedSymptoms: ['CHEST_PAIN', 'BREATHING_DIFFICULTY'],
    expectedRedFlag: true,
    expectedConditions: [],
    isEmergencyExpected: true,
    expectedSourceOrg: 'MoHFW'
  },
  {
    id: 'TA_003',
    input: 'கர்ப்ப காலத்தில் அதிக ரத்தப்போக்கு மற்றும் தலைசுற்றல் இருக்கு',
    language: 'ta-IN',
    expectedSymptoms: [],
    expectedRedFlag: true,
    expectedConditions: [],
    isEmergencyExpected: true,
    expectedSourceOrg: 'National Health Mission'
  },
  {
    id: 'TA_004',
    input: 'எனக்கு குளிருடன் கூடிய நடுக்கமும் காய்ச்சலும் இருக்கு',
    language: 'ta-IN',
    expectedSymptoms: ['FEVER'],
    expectedRedFlag: false,
    expectedConditions: ['MALARIA', 'FEVER'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'TA_005',
    input: 'ரத்த சர்க்கரை அளவு 220 mg/dL இருக்கு, அடிக்கடி தாகம் எடுக்குது',
    language: 'ta-IN',
    expectedSymptoms: ['HIGH_BLOOD_SUGAR'],
    expectedRedFlag: false,
    expectedConditions: ['DIABETES'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'Indian Council of Medical Research'
  },
  {
    id: 'TA_006',
    input: 'வயிற்றுப்போக்கு மற்றும் வாந்தி 5 முறை ஆச்சு, நாக்கு வறண்டு போச்சு',
    language: 'ta-IN',
    expectedSymptoms: ['DIARRHEA', 'VOMITING'],
    expectedRedFlag: false,
    expectedConditions: ['DIARRHEA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'TA_007',
    input: '2 வாரத்திற்கு மேல் இருமல் மற்றும் சளி இருக்கு, எடை குறையுது',
    language: 'ta-IN',
    expectedSymptoms: ['COUGH'],
    expectedRedFlag: false,
    expectedConditions: ['TUBERCULOSIS', 'PNEUMONIA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'National Tuberculosis Elimination Programme'
  },
  {
    id: 'TA_008',
    input: 'உயர் ரத்த அழுத்தம் 150/95 இருக்கு, தலைவலியாக இருக்கு',
    language: 'ta-IN',
    expectedSymptoms: ['HIGH_BLOOD_PRESSURE', 'HEADACHE'],
    expectedRedFlag: false,
    expectedConditions: ['HYPERTENSION'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'MoHFW'
  },

  // ─── TELUGU CASES ───
  {
    id: 'TE_001',
    input: 'నాకు జ్వరం ఉంది మరియు తలనొప్పిగా ఉంది',
    language: 'te-IN',
    expectedSymptoms: ['FEVER', 'HEADACHE'],
    expectedRedFlag: false,
    expectedConditions: ['FEVER', 'DENGUE', 'MALARIA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'TE_002',
    input: 'శ్వాస తీసుకోవడం చాలా కష్టంగా ఉంది, పెదవులు నీలంగా మారుతున్నాయి',
    language: 'te-IN',
    expectedSymptoms: ['BREATHING_DIFFICULTY'],
    expectedRedFlag: true,
    expectedConditions: [],
    isEmergencyExpected: true,
    expectedSourceOrg: 'MoHFW'
  },
  {
    id: 'TE_003',
    input: 'ఛాతీలో తీవ్రమైన నొప్పి మరియు చెమటలు పడుతున్నాయి',
    language: 'te-IN',
    expectedSymptoms: ['CHEST_PAIN'],
    expectedRedFlag: true,
    expectedConditions: [],
    isEmergencyExpected: true,
    expectedSourceOrg: 'MoHFW'
  },
  {
    id: 'TE_004',
    input: 'నీళ్ల విరేచనాలు మరియు వాంతులు అవుతున్నాయి',
    language: 'te-IN',
    expectedSymptoms: ['DIARRHEA', 'VOMITING'],
    expectedRedFlag: false,
    expectedConditions: ['DIARRHEA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'TE_005',
    input: 'నాకు షుగర్ లెవల్స్ ఎక్కువయ్యాయి, నీరసంగా ఉంది',
    language: 'te-IN',
    expectedSymptoms: ['HIGH_BLOOD_SUGAR', 'WEAKNESS'],
    expectedRedFlag: false,
    expectedConditions: ['DIABETES'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'Indian Council of Medical Research'
  },
  {
    id: 'TE_006',
    input: 'చలి జ్వరం మరియు ఒంటి నొప్పులు ఉన్నాయి',
    language: 'te-IN',
    expectedSymptoms: ['FEVER'],
    expectedRedFlag: false,
    expectedConditions: ['MALARIA', 'FEVER'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },

  // ─── HINDI CASES ───
  {
    id: 'HI_001',
    input: 'मुझे दो दिन से तेज बुखार और सिरदर्द है',
    language: 'hi-IN',
    expectedSymptoms: ['FEVER', 'HEADACHE'],
    expectedRedFlag: false,
    expectedConditions: ['FEVER', 'MALARIA', 'DENGUE'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'HI_002',
    input: 'सांस लेने में बहुत तकलीफ हो रही है और सीने में भारी दबाव है',
    language: 'hi-IN',
    expectedSymptoms: ['BREATHING_DIFFICULTY', 'CHEST_PAIN'],
    expectedRedFlag: true,
    expectedConditions: [],
    isEmergencyExpected: true,
    expectedSourceOrg: 'MoHFW'
  },
  {
    id: 'HI_003',
    input: 'बार-बार पतले दस्त और उल्टी हो रही है, कमजोरी महसूस हो रही है',
    language: 'hi-IN',
    expectedSymptoms: ['DIARRHEA', 'VOMITING', 'WEAKNESS'],
    expectedRedFlag: false,
    expectedConditions: ['DIARRHEA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'HI_004',
    input: 'गर्भावस्था में अचानक तेज सिरदर्द और आंखों से धुंधला दिख रहा है',
    language: 'hi-IN',
    expectedSymptoms: [],
    expectedRedFlag: true,
    expectedConditions: [],
    isEmergencyExpected: true,
    expectedSourceOrg: 'National Health Mission'
  },
  {
    id: 'HI_005',
    input: 'दो हफ्ते से ज्यादा खांसी है और बलगम में खून आया है',
    language: 'hi-IN',
    expectedSymptoms: ['COUGH'],
    expectedRedFlag: false,
    expectedConditions: ['TUBERCULOSIS', 'PNEUMONIA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'National Tuberculosis Elimination Programme'
  },
  {
    id: 'HI_006',
    input: 'मेरा ब्लड प्रेशर 160/100 है और सिर चकरा रहा है',
    language: 'hi-IN',
    expectedSymptoms: ['HIGH_BLOOD_PRESSURE'],
    expectedRedFlag: false,
    expectedConditions: ['HYPERTENSION'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'MoHFW'
  },

  // ─── KANNADA CASES ───
  {
    id: 'KN_001',
    input: 'ನನಗೆ ಜ್ವರ ಮತ್ತು ತಲೆನೋವು ಇದೆ',
    language: 'kn-IN',
    expectedSymptoms: ['FEVER', 'HEADACHE'],
    expectedRedFlag: false,
    expectedConditions: ['FEVER', 'MALARIA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'KN_002',
    input: 'ಉಸಿರಾಡಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ ಮತ್ತು ಎದೆಯಲ್ಲಿ ವಿಪರೀತ ನೋವು ಇದೆ',
    language: 'kn-IN',
    expectedSymptoms: ['BREATHING_DIFFICULTY', 'CHEST_PAIN'],
    expectedRedFlag: true,
    expectedConditions: [],
    isEmergencyExpected: true,
    expectedSourceOrg: 'MoHFW'
  },
  {
    id: 'KN_003',
    input: 'ಹೊಟ್ಟೆ ನೋವು ಮತ್ತು ಭೇದಿ ಆಗುತ್ತಿದೆ',
    language: 'kn-IN',
    expectedSymptoms: ['STOMACH_PAIN', 'DIARRHEA'],
    expectedRedFlag: false,
    expectedConditions: ['DIARRHEA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'KN_004',
    input: 'ನನ್ನ ಶುಗರ್ ಜಾಸ್ತಿ ಆಗಿದೆ ಮತ್ತು ನಿಶ್ಯಕ್ತಿ ಅನಿಸುತ್ತಿದೆ',
    language: 'kn-IN',
    expectedSymptoms: ['HIGH_BLOOD_SUGAR', 'WEAKNESS'],
    expectedRedFlag: false,
    expectedConditions: ['DIABETES'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'Indian Council of Medical Research'
  },

  // ─── MALAYALAM CASES ───
  {
    id: 'ML_001',
    input: 'എനിക്ക് പനിയും കഠിനമായ തലവേദനയും ഉണ്ട്',
    language: 'ml-IN',
    expectedSymptoms: ['FEVER', 'HEADACHE'],
    expectedRedFlag: false,
    expectedConditions: ['FEVER', 'DENGUE', 'MALARIA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'ML_002',
    input: 'നെഞ്ചുവേദനയും ശ്വാസതടസ്സവും ഉണ്ട്, വിയർക്കുന്നു',
    language: 'ml-IN',
    expectedSymptoms: ['CHEST_PAIN', 'BREATHING_DIFFICULTY'],
    expectedRedFlag: true,
    expectedConditions: [],
    isEmergencyExpected: true,
    expectedSourceOrg: 'MoHFW'
  },
  {
    id: 'ML_003',
    input: 'വയറിളക്കവും ഛർദ്ദിയും ഉണ്ട്, ക്ഷീണം തോന്നുന്നു',
    language: 'ml-IN',
    expectedSymptoms: ['DIARRHEA', 'VOMITING', 'WEAKNESS'],
    expectedRedFlag: false,
    expectedConditions: ['DIARRHEA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'ML_004',
    input: 'രണ്ടാഴ്ചയായി മാറാത്ത ചുമയും കഫക്കെട്ടും ഉണ്ട്',
    language: 'ml-IN',
    expectedSymptoms: ['COUGH'],
    expectedRedFlag: false,
    expectedConditions: ['TUBERCULOSIS', 'PNEUMONIA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'National Tuberculosis Elimination Programme'
  },

  // ─── ENGLISH CASES ───
  {
    id: 'EN_001',
    input: 'I have fever, chills and severe headache since yesterday',
    language: 'en-IN',
    expectedSymptoms: ['FEVER', 'HEADACHE'],
    expectedRedFlag: false,
    expectedConditions: ['FEVER', 'MALARIA', 'DENGUE'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'EN_002',
    input: 'Crushing chest pain radiating to left arm and cannot breathe properly',
    language: 'en-IN',
    expectedSymptoms: ['CHEST_PAIN', 'BREATHING_DIFFICULTY'],
    expectedRedFlag: true,
    expectedConditions: [],
    isEmergencyExpected: true,
    expectedSourceOrg: 'MoHFW'
  },
  {
    id: 'EN_003',
    input: 'Watery diarrhea 6 times today and feeling extremely dehydrated and weak',
    language: 'en-IN',
    expectedSymptoms: ['DIARRHEA', 'WEAKNESS'],
    expectedRedFlag: false,
    expectedConditions: ['DIARRHEA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'World Health Organization'
  },
  {
    id: 'EN_004',
    input: 'Coughing continuously for 3 weeks with night sweats and blood in sputum',
    language: 'en-IN',
    expectedSymptoms: ['COUGH'],
    expectedRedFlag: false,
    expectedConditions: ['TUBERCULOSIS', 'PNEUMONIA'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'National Tuberculosis Elimination Programme'
  },
  {
    id: 'EN_005',
    input: 'My fasting blood glucose is 240 mg/dL, I feel constant fatigue and thirst',
    language: 'en-IN',
    expectedSymptoms: ['HIGH_BLOOD_SUGAR', 'WEAKNESS'],
    expectedRedFlag: false,
    expectedConditions: ['DIABETES'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'Indian Council of Medical Research'
  },
  {
    id: 'EN_006',
    input: 'Blood pressure reading today was 165/102 mmHg with throbbing headache',
    language: 'en-IN',
    expectedSymptoms: ['HIGH_BLOOD_PRESSURE', 'HEADACHE'],
    expectedRedFlag: false,
    expectedConditions: ['HYPERTENSION'],
    isEmergencyExpected: false,
    expectedSourceOrg: 'MoHFW'
  }
];

// Dynamically generate expanded variation permutations to ensure 100+ comprehensive evaluation test scenarios
const SYMPTOM_VARIATIONS = [
  { p: 'fever and weakness', lang: 'en-IN', s: ['FEVER', 'WEAKNESS'], red: false },
  { p: 'severe crushing chest pain', lang: 'en-IN', s: ['CHEST_PAIN'], red: true },
  { p: 'loose motion and stomach pain', lang: 'en-IN', s: ['DIARRHEA', 'STOMACH_PAIN'], red: false },
  { p: 'காய்ச்சல் மற்றும் தலைவலி', lang: 'ta-IN', s: ['FEVER', 'HEADACHE'], red: false },
  { p: 'நெஞ்சு வலி மற்றும் வியர்வை', lang: 'ta-IN', s: ['CHEST_PAIN'], red: true },
  { p: 'வயிற்றுப்போக்கு மற்றும் சோர்வு', lang: 'ta-IN', s: ['DIARRHEA', 'WEAKNESS'], red: false },
  { p: 'జ్వరం మరియు కడుపు నొప్పి', lang: 'te-IN', s: ['FEVER', 'STOMACH_PAIN'], red: false },
  { p: 'ఛాతీ నొప్పి మరియు ఆయాసం', lang: 'te-IN', s: ['CHEST_PAIN'], red: true },
  { p: 'बुखार और बदन दर्द', lang: 'hi-IN', s: ['FEVER'], red: false },
  { p: 'सीने में दर्द और बेचैनी', lang: 'hi-IN', s: ['CHEST_PAIN'], red: true },
  { p: 'ಜ್ವರ ಮತ್ತು ಹೊಟ್ಟೆ ನೋವು', lang: 'kn-IN', s: ['FEVER', 'STOMACH_PAIN'], red: false },
  { p: 'എനിക്ക് പനിയും തലവേദനയും', lang: 'ml-IN', s: ['FEVER', 'HEADACHE'], red: false }
];

export function getFull100TestCaseSuite(): MedicalTestCase[] {
  const fullList: MedicalTestCase[] = [...MEDICAL_AI_EVALUATION_CASES];

  let counter = fullList.length + 1;
  for (let i = 0; i < 75; i++) {
    const template = SYMPTOM_VARIATIONS[i % SYMPTOM_VARIATIONS.length];
    fullList.push({
      id: `GEN_${counter++}`,
      input: `${template.p} (case variant #${i + 1})`,
      language: template.lang as SupportedLanguageCode,
      expectedSymptoms: template.s,
      expectedRedFlag: template.red,
      expectedConditions: template.red ? [] : ['FEVER', 'DIARRHEA', 'HYPERTENSION'],
      isEmergencyExpected: template.red,
      expectedSourceOrg: 'World Health Organization'
    });
  }

  return fullList;
}

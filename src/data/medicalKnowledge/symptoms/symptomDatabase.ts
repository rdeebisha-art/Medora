import { SymptomDefinition } from '../types';

export const MULTILINGUAL_SYMPTOMS: Record<string, SymptomDefinition> = {
  FEVER: {
    conceptId: 'FEVER',
    name: {
      en: 'Fever / High Temperature',
      hi: 'बुखार / तापमान',
      ta: 'காய்ச்சல் / உடல் சூடு',
      te: 'జ్వరం / ఒళ్లు వేడి',
      ml: 'പനി / ശരീര താപനില',
      kn: 'ಜ್ವರ / ಮೈ ಬಿಸಿ'
    },
    multilingualAliases: {
      en: ['fever', 'high temp', 'temperature', 'feverish', 'feeling hot', 'shivering with heat'],
      hi: ['बुखार', 'तापमान', 'तप रहा है', 'गरम है', 'ताप', 'बदन गरम'],
      ta: ['காய்ச்சல்', 'ஜுரம்', 'உடல் சூடு', 'சுரம்', 'காய்ச்சலாக இருக்கு'],
      te: ['జ్వరం', 'ఒళ్లు వేడిగా ఉంది', 'జ్వరంగా ఉంది', 'తాపం'],
      ml: ['പനി', 'ശരീരം ചൂട്', 'പനിയുണ്ട്', 'ചൂടാണ്'],
      kn: ['ಜ್ವರ', 'ಮೈ ಬಿಸಿ', 'ಜ್ವರ ಬಂದಿದೆ', 'ತಾಪ']
    },
    isRedFlag: false,
    associatedConditionIds: ['FEVER', 'MALARIA', 'DENGUE', 'PNEUMONIA', 'TUBERCULOSIS']
  },

  CHEST_PAIN: {
    conceptId: 'CHEST_PAIN',
    name: {
      en: 'Chest Pain / Heaviness',
      hi: 'सीने में दर्द / भारीपन',
      ta: 'நெஞ்சு வலி / நெஞ்சு பாரம்',
      te: 'ఛాతీ నొప్పి / బరువు',
      ml: 'നെഞ്ചുവേദന / ഭാരം',
      kn: 'ಎದೆ ನೋವು / ಎದೆಯಲ್ಲಿ ಭಾರ'
    },
    multilingualAliases: {
      en: ['chest pain', 'chest heaviness', 'pain in heart', 'left arm pain', 'chest tight', 'crushing chest'],
      hi: ['सीने में दर्द', 'छाती में दर्द', 'सीने में भारीपन', 'दिल में दर्द', 'बाएं हाथ में दर्द'],
      ta: ['நெஞ்சு வலி', 'நெஞ்சு பாரம்', 'மார்பு வலி', 'இடது கை வலி', 'நெஞ்சை அடைப்பது'],
      te: ['ఛాతీ నొప్పి', 'రొమ్ము నొప్పి', 'ఛాతీలో బరువు', 'గుండె నొప్పి'],
      ml: ['നെഞ്ചുവേദന', 'നെഞ്ചിൽ ഭാരം', 'ഹൃദയത്തിൽ വേദന', 'നെഞ്ചു വേദന'],
      kn: ['ಎದೆ ನೋವು', 'ಎದೆಯಲ್ಲಿ ಭಾರ', 'ಎದೆ ಹಿಂಡಿದಂತಾಗುವುದು']
    },
    isRedFlag: true,
    associatedConditionIds: ['HYPERTENSION']
  },

  BREATHING_DIFFICULTY: {
    conceptId: 'BREATHING_DIFFICULTY',
    name: {
      en: 'Breathing Difficulty / Shortness of Breath',
      hi: 'सांस लेने में तकलीफ / सांस फूलना',
      ta: 'மூச்சுத் திணறல் / மூச்சு வாங்குதல்',
      te: 'శ్వాస తీసుకోవడంలో ఇబ్బంది / ఆయాసం',
      ml: 'ശ്വാസതടസ്സം / കിതപ്പ്',
      kn: 'ಉಸಿರಾಟದ ತೊಂದರೆ / ಉಬ್ಬಸ'
    },
    multilingualAliases: {
      en: ['shortness of breath', 'cannot breathe', 'difficulty breathing', 'gasping', 'breathless', 'wheezing'],
      hi: ['सांस फूलना', 'सांस लेने में दिक्कत', 'सांस नहीं आ रही', 'दम घुटना', 'घबराहट'],
      ta: ['மூச்சுத் திணறல்', 'மூச்சு வாங்க முடியல', 'மூச்சு வாங்குது', 'இரைப்பு', 'ஆயாசம்'],
      te: ['శ్వాస ఆడట్లేదు', 'ఆయాసం', 'శ్వాస తీసుకోవడం కష్టం', 'దమ్ము'],
      ml: ['ശ്വാസതടസ്സം', 'ശ്വാസമെടുക്കാൻ പറ്റുന്നില്ല', 'കിതപ്പ്', 'ശ്വാസം മുട്ടൽ'],
      kn: ['ಉಸಿರಾಡಲು ಕಷ್ಟ', 'ಉಸಿರು ಕಟ್ಟಿದಂತಾಗುವುದು', 'ಉಬ್ಬಸ', 'ಆಯಾಸ']
    },
    isRedFlag: true,
    associatedConditionIds: ['PNEUMONIA', 'TUBERCULOSIS', 'HYPERTENSION']
  },

  COUGH: {
    conceptId: 'COUGH',
    name: {
      en: 'Cough',
      hi: 'खांसी',
      ta: 'இருமல்',
      te: 'దగ్గు',
      ml: 'ചുമ',
      kn: 'ಕೆಮ್ಮು'
    },
    multilingualAliases: {
      en: ['cough', 'coughing', 'dry cough', 'wet cough', 'sputum', 'phlegm'],
      hi: ['खांसी', 'खोकला', 'बलगम', 'खांस रहा हूँ', 'सूखी खांसी'],
      ta: ['இருமல்', 'சளி இருமல்', 'வறட்டு இருமல்', 'இருமுது'],
      te: ['దగ్గు', 'పొడి దగ్గు', 'కఫం దగ్గు', 'దగ్గుతోంది'],
      ml: ['ചുമ', 'വരണ്ട ചുമ', 'കഫം ചുമ', 'ചുമയ്ക്കുന്നു'],
      kn: ['ಕೆಮ್ಮು', 'ಒಣ ಕೆಮ್ಮು', 'ಕಫದ ಕೆಮ್ಮು', 'ಕೆಮ್ಮುತ್ತಿದ್ದೇನೆ']
    },
    isRedFlag: false,
    associatedConditionIds: ['PNEUMONIA', 'TUBERCULOSIS', 'FEVER']
  },

  STOMACH_PAIN: {
    conceptId: 'STOMACH_PAIN',
    name: {
      en: 'Stomach Pain / Abdominal Cramps',
      hi: 'पेट दर्द',
      ta: 'வயிற்று வலி',
      te: 'కడుపు నొప్పి',
      ml: 'വയറുവേദന',
      kn: 'ಹೊಟ್ಟೆ ನೋವು'
    },
    multilingualAliases: {
      en: ['stomach pain', 'belly ache', 'abdominal pain', 'tummy ache', 'cramps in stomach'],
      hi: ['पेट दर्द', 'पेट में दर्द', 'पेट मरोड़ना', 'पेट खराब'],
      ta: ['வயிற்று வலி', 'வயிறு வலிக்குது', 'வயிற்றுக் கடுப்பு', 'வயிற்றுப் பிடிப்பு'],
      te: ['కడుపు నొప్పి', 'కడుపులో నొప్పి', 'కడుపు పిసికినట్టుంది'],
      ml: ['വയറുവേദന', 'വയറു വേദന', 'വയറു കൊളുത്തുന്നത്'],
      kn: ['ಹೊಟ್ಟೆ ನೋವು', 'ಹೊಟ್ಟೆಯಲ್ಲಿ ನೋವು', 'ಹೊಟ್ಟೆ ಚುಚ್ಚುವುದು']
    },
    isRedFlag: false,
    associatedConditionIds: ['DIARRHEA']
  },

  DIARRHEA: {
    conceptId: 'DIARRHEA',
    name: {
      en: 'Diarrhea / Loose Motions',
      hi: 'दस्त / पतले शौच',
      ta: 'வயிற்றுப்போக்கு / பேதி',
      te: 'విరేచనాలు / మోషన్స్',
      ml: 'വയറിളക്കം',
      kn: 'ಅತಿಸಾರ / ಭೇದಿ'
    },
    multilingualAliases: {
      en: ['diarrhea', 'loose motion', 'watery stool', 'loose stools', 'upset stomach'],
      hi: ['दस्त', 'पतला दस्त', 'लूज मोशन', 'झाड़ा'],
      ta: ['வயிற்றுப்போக்கு', 'பேதி', 'தண்ணீராக போகுது', 'லூஸ் மோஷன்'],
      te: ['విరేచనాలు', 'మోషన్స్', 'నీళ్ల విరేచనాలు'],
      ml: ['വയറിളക്കം', 'ലൂസ് മോഷൻ', 'വെള്ളം പോലെ പോകുന്നു'],
      kn: ['ಅತಿಸಾರ', 'ಭೇದಿ', 'ನೀರು ಮಲ']
    },
    isRedFlag: false,
    associatedConditionIds: ['DIARRHEA']
  },

  VOMITING: {
    conceptId: 'VOMITING',
    name: {
      en: 'Vomiting / Nausea',
      hi: 'उल्टी / मिचली',
      ta: 'வாந்தி / குமட்டல்',
      te: 'వాంతులు / వికారం',
      ml: 'ഛർദ്ദി / മനംപിരട്ടൽ',
      kn: 'ವಾಂತಿ / ವಾಕರಿಕೆ'
    },
    multilingualAliases: {
      en: ['vomiting', 'nausea', 'throwing up', 'puking', 'feeling sick'],
      hi: ['उल्टी', 'उल्टी जैसा', 'मिचली', 'जी घबराना'],
      ta: ['வாந்தி', 'குமட்டல்', 'வாந்தி எடுப்பது'],
      te: ['వాంతులు', 'వికారం', 'వాంతి వస్తోంది'],
      ml: ['ഛർദ്ദി', 'മനംപിരട്ടൽ', 'ഛർദ്ദിക്കുന്നു'],
      kn: ['ವಾಂತಿ', 'ವಾಕರಿಕೆ', 'ತಲೆ ತಿರುಗಿ ವಾಂತಿ']
    },
    isRedFlag: false,
    associatedConditionIds: ['DIARRHEA', 'DENGUE', 'MALARIA']
  },

  HEADACHE: {
    conceptId: 'HEADACHE',
    name: {
      en: 'Headache',
      hi: 'सिरदर्द',
      ta: 'தலைவலி',
      te: 'తలనొప్పి',
      ml: 'തലവേദന',
      kn: 'ತಲೆನೋವು'
    },
    multilingualAliases: {
      en: ['headache', 'head pain', 'throbbing head', 'pain in forehead'],
      hi: ['सिरदर्द', 'सिर में दर्द', 'माथा दुखना'],
      ta: ['தலைவலி', 'தலை பாரம்', 'தலை வலிக்குது'],
      te: ['తలనొప్పి', 'తల నొప్పిగా ఉంది', 'తల బరువు'],
      ml: ['തലവേദന', 'തല വേദനിക്കുന്നു', 'തലയിൽ ഭാരം'],
      kn: ['ತಲೆನೋವು', 'ತಲೆ ಭಾರ', 'ತಲೆ ನೋಯುತ್ತಿದೆ']
    },
    isRedFlag: false,
    associatedConditionIds: ['FEVER', 'HYPERTENSION', 'DENGUE', 'MALARIA']
  },

  HIGH_BLOOD_PRESSURE: {
    conceptId: 'HIGH_BLOOD_PRESSURE',
    name: {
      en: 'High Blood Pressure Check',
      hi: 'उच्च रक्तचाप / बीपी',
      ta: 'ரத்த அழுத்தம் / பிபி',
      te: 'రక్తపోటు / బీపీ',
      ml: 'രക്തസമ്മർദ്ദം / ബിപി',
      kn: 'ರಕ್ತದೊತ್ತಡ / ಬಿಪಿ'
    },
    multilingualAliases: {
      en: ['high bp', 'blood pressure', 'hypertension', 'bp reading', 'my bp'],
      hi: ['हाई बीपी', 'ब्लड प्रेशर', 'रक्तचाप', 'बीपी ज्यादा'],
      ta: ['உயர் ரத்த அழுத்தம்', 'ஹை பிபி', 'ரத்தக் கொதிப்பு', 'பிபி'],
      te: ['అధిక రక్తపోటు', 'హై బీపీ', 'బీపీ ఎక్కువ'],
      ml: ['ഉയർന്ന ബിപി', 'രക്തസമ്മർദ്ദം', 'ഹൈപ്പർടെൻഷൻ'],
      kn: ['ಅಧಿಕ ರಕ್ತದೊತ್ತಡ', 'ಹೈ ಬಿಪಿ', 'ಬಿಪಿ ಹೆಚ್ಚು']
    },
    isRedFlag: false,
    associatedConditionIds: ['HYPERTENSION']
  },

  HIGH_BLOOD_SUGAR: {
    conceptId: 'HIGH_BLOOD_SUGAR',
    name: {
      en: 'High Blood Sugar / Diabetes Check',
      hi: 'ब्लड शुगर / मधुमेह',
      ta: 'ரத்த சர்க்கரை / நீரிழிவு',
      te: 'బ్లడ్ షుగర్ / మధుమేహం',
      ml: 'ബ്ലഡ് ഷുഗർ / പ്രമേഹം',
      kn: 'ರಕ್ತದಲ್ಲಿ ಸಕ್ಕರೆ / ಮಧುಮೇಹ'
    },
    multilingualAliases: {
      en: ['high sugar', 'blood glucose', 'diabetes', 'sugar test', 'my sugar'],
      hi: ['ब्लड शुगर', 'शुगर बढ़ गई', 'मधुमेह', 'डायबिटीज'],
      ta: ['ரத்த சர்க்கரை', 'சர்க்கரை நோய்', 'சுகர் அதிகம்'],
      te: ['బ్లడ్ షుగర్', 'షుగర్ ఎక్కువైంది', 'మధుమేహం'],
      ml: ['ബ്ലഡ് ഷുഗർ', 'പ്രമേഹം', 'ഷുഗർ കൂടി'],
      kn: ['ರಕ್ತದಲ್ಲಿ ಸಕ್ಕರೆ', 'ಸಕ್ಕರೆ ಕಾಯಿಲೆ', 'ಶುಗರ್ ಜಾಸ್ತಿ']
    },
    isRedFlag: false,
    associatedConditionIds: ['DIABETES']
  }
};

/**
 * Extracts structured symptom concepts from any of the 6 languages.
 */
export function extractSymptomsFromText(text: string): string[] {
  const lower = (text || '').toLowerCase();
  const matched = new Set<string>();

  for (const [conceptId, def] of Object.entries(MULTILINGUAL_SYMPTOMS)) {
    // Check all language aliases
    for (const aliases of Object.values(def.multilingualAliases)) {
      for (const alias of aliases) {
        if (lower.includes(alias.toLowerCase())) {
          matched.add(conceptId);
          break;
        }
      }
    }
  }

  return Array.from(matched);
}

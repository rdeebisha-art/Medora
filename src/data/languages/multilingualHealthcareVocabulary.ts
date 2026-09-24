import { SupportedLanguageCode } from './index';

export type HealthcareCategory =
  | 'FEVER'
  | 'COUGH'
  | 'COLD'
  | 'HEADACHE'
  | 'STOMACH_PAIN'
  | 'CHEST_PAIN'
  | 'BREATHING_DIFFICULTY'
  | 'VOMITING'
  | 'DIARRHEA'
  | 'DIZZINESS'
  | 'WEAKNESS'
  | 'BODY_PAIN'
  | 'SORE_THROAT'
  | 'EAR_PAIN'
  | 'TOOTH_PAIN'
  | 'BACK_PAIN'
  | 'RASH'
  | 'ITCHING'
  | 'SWELLING'
  | 'BLEEDING'
  | 'INJURY'
  | 'BURN'
  | 'HIGH_BLOOD_SUGAR'
  | 'LOW_BLOOD_SUGAR'
  | 'BLOOD_PRESSURE'
  | 'PREGNANCY'
  | 'NEWBORN'
  | 'CHILD_HEALTH'
  | 'ELDERLY_HEALTH'
  | 'MEDICINE'
  | 'VACCINATION'
  | 'DOCTOR'
  | 'HOSPITAL'
  | 'EMERGENCY'
  | 'NUTRITION';

export interface CategoryVocabulary {
  terms: string[];
  transliterations?: string[];
  isRedFlag?: boolean;
}

export type MultilingualVocabularyMap = Record<
  HealthcareCategory,
  Record<SupportedLanguageCode, CategoryVocabulary>
>;

export const MULTILINGUAL_HEALTHCARE_VOCABULARY: MultilingualVocabularyMap = {
  FEVER: {
    'ta-IN': {
      terms: ['காய்ச்சல்', 'சுரம்', 'உடம்பு சூடு', 'காய்ச்சலா', 'ஜுரம்', 'வெப்பநிலை', 'குளிர் காய்ச்சல்'],
      transliterations: ['kaichal', 'kaachal', 'juram', 'suram', 'udambu soodu', 'udambu fever']
    },
    'te-IN': {
      terms: ['జ్వరం', 'ఒళ్ళు వెచ్చగా ఉంది', 'జ్వరంగా ఉంది', 'తీవ్ర జ్వరం', 'చలి జ్వరం', 'వేడిగా ఉంది'],
      transliterations: ['jwaram', 'juram', 'jvaram', 'ontlo vechaga', 'chali jwaram']
    },
    'ml-IN': {
      terms: ['പനി', 'ശരീരം ചൂട്', 'വിറയൽ പനി', 'കടുത്ത പനി', 'പനിയുണ്ട്', 'പനിയാണ്'],
      transliterations: ['pani', 'shareeram choodu', 'virayal pani', 'kadutha pani']
    },
    'kn-IN': {
      terms: ['ಜ್ವರ', 'ಮೈ ಬಿಸಿ', 'ತೀವ್ರ ಜ್ವರ', 'ಚಳಿ ಜ್ವರ', 'ಜ್ವರ ಬಂದಿದೆ', 'ಜ್ವರ ಇದೆ'],
      transliterations: ['jwara', 'jvara', 'mai bisi', 'chali jwara', 'jwara bandide']
    },
    'hi-IN': {
      terms: ['बुखार', 'ताप', 'तेज़ बुखार', 'हरारत', 'बदन गर्म', 'कंपकंपी बुखार', 'बुखार है'],
      transliterations: ['bukhar', 'tez bukhar', 'badan garm', 'taap', 'hararat']
    },
    'en-IN': {
      terms: ['fever', 'high temperature', 'febrile', 'chills', 'running a temperature', 'pyrexia', 'feverish'],
      transliterations: ['fever', 'feverish', 'temperature']
    }
  },

  COUGH: {
    'ta-IN': {
      terms: ['இருமல்', 'சளி இருமல்', 'இருமுவது', 'வறட்டு இருமல்', 'தொடர் இருமல்'],
      transliterations: ['irumal', 'varattu irumal', 'sali irumal']
    },
    'te-IN': {
      terms: ['దగ్గు', 'పొడి దగ్గు', 'తెమడ దగ్గు', 'తీవ్రమైన దగ్గు', 'దగ్గు వస్తుంది'],
      transliterations: ['daggu', 'podi daggu', 'daggutunna']
    },
    'ml-IN': {
      terms: ['ചുമ', 'വരണ്ട ചുമ', 'കഫക്കെട്ട് ചുമ', 'തുടർച്ചയായ ചുമ'],
      transliterations: ['chuma', 'varanda chuma', 'chumayund']
    },
    'kn-IN': {
      terms: ['ಕೆಮ್ಮು', 'ಒಣ ಕೆಮ್ಮು', 'ಕಫದ ಕೆಮ್ಮು', 'ನಿರಂತರ ಕೆಮ್ಮು'],
      transliterations: ['kemmu', 'ona kemmu', 'kaphada kemmu']
    },
    'hi-IN': {
      terms: ['खांसी', 'सुखी खांसी', 'बलगम वाली खांसी', 'लगातार खांसी', 'खांसना'],
      transliterations: ['khansi', 'sukhi khansi', 'balgam wali khansi']
    },
    'en-IN': {
      terms: ['cough', 'coughing', 'dry cough', 'wet cough', 'phlegm cough', 'hacking cough'],
      transliterations: ['cough', 'coughing']
    }
  },

  COLD: {
    'ta-IN': {
      terms: ['சளி', 'மூக்கொழுகுதல்', 'தும்மல்', 'ஜலதோஷம்', 'மூக்கடைப்பு'],
      transliterations: ['sali', 'jaladhosham', 'mookkozuhuthal', 'thummal']
    },
    'te-IN': {
      terms: ['జలుబు', 'ముక్కు కారడం', 'తుమ్ములు', 'ముక్కు దిబ్బడ'],
      transliterations: ['jalubu', 'mukku karadam', 'tummulu', 'jalbu']
    },
    'ml-IN': {
      terms: ['ജലദോഷം', 'മൂക്കൊലിപ്പ്', 'തുമ്മൽ', 'കഫക്കെട്ട്', 'മൂക്കടപ്പ്'],
      transliterations: ['jaladhosham', 'mookkolipp', 'thummal', 'kaphakkett']
    },
    'kn-IN': {
      terms: ['ಶೀತ', 'ನೆಗಡಿ', 'ಮೂಗು ಸೋರುವುದು', 'ಸೀನು', 'ಮೂಗು ಕಟ್ಟುವುದು'],
      transliterations: ['sheetha', 'negadi', 'moogu sooruvudu', 'seenu']
    },
    'hi-IN': {
      terms: ['जुकाम', 'सर्दी', 'नाक बहना', 'छींक', 'नाक बंद होना'],
      transliterations: ['jukaam', 'sardi', 'naak behna', 'cheenk']
    },
    'en-IN': {
      terms: ['cold', 'runny nose', 'sneezing', 'blocked nose', 'nasal congestion', 'flu'],
      transliterations: ['cold', 'runny nose', 'sneezing']
    }
  },

  HEADACHE: {
    'ta-IN': {
      terms: ['தலைவலி', 'தலை பாரம்', 'தலை சுற்றல்', 'ஒற்றைத் தலைவலி', 'பயங்கர தலைவலி'],
      transliterations: ['thalavali', 'thala vali', 'thala baaram', 'migraine']
    },
    'te-IN': {
      terms: ['తలనొప్పి', 'తీవ్రమైన తలనొప్పి', 'తల బరువు', 'తల పోటు', 'తలనొప్పిగా ఉంది'],
      transliterations: ['thalanoppi', 'thala noppi', 'thala baruvu']
    },
    'ml-IN': {
      terms: ['തലവേദന', 'തലക്കനം', 'കൊടും തലവേദന', 'തലയ്ക്ക് അസുഖം'],
      transliterations: ['thalavedhana', 'thala vedhana', 'thalakkanam']
    },
    'kn-IN': {
      terms: ['ತಲೆನೋವು', 'ತಲೆ ಭಾರ', 'ತೀವ್ರ ತಲೆನೋವು', 'ತಲೆ ಸಿಡಿಯುತ್ತಿದೆ'],
      transliterations: ['thalenovu', 'thale novu', 'thale bhara']
    },
    'hi-IN': {
      terms: ['सिरदर्द', 'सिर में दर्द', 'माथा दर्द', 'आधा सीसी सिरदर्द', 'सिर फटना'],
      transliterations: ['sar dard', 'sardard', 'sir me dard', 'sar ghoomna']
    },
    'en-IN': {
      terms: ['headache', 'head pain', 'migraine', 'throbbing head', 'severe headache'],
      transliterations: ['headache', 'head pain', 'migraine']
    }
  },

  STOMACH_PAIN: {
    'ta-IN': {
      terms: ['வயிற்று வலி', 'வயிறு வலிக்குது', 'வயிற்றில் பிடிப்பு', 'வயிற்று எரிச்சல்', 'வயிறு உப்புசம்'],
      transliterations: ['vayiru vali', 'vayiuru vali', 'vayiru erichal']
    },
    'te-IN': {
      terms: ['కడుపునొప్పి', 'కడుపులో మంట', 'కడుపు ఉబ్బరం', 'తీవ్ర కడుపు నొప్పి'],
      transliterations: ['kadupunoppi', 'kadupu noppi', 'kadupulo manta']
    },
    'ml-IN': {
      terms: ['വയറുവേദന', 'വയറിളക്കം', 'വയറ്റിൽ എരിച്ചിൽ', 'വയർ വീർക്കൽ'],
      transliterations: ['vayaruvedhana', 'vayaru vedhana', 'vayattil vedhana']
    },
    'kn-IN': {
      terms: ['ಹೊಟ್ಟೆನೋವು', 'ಹೊಟ್ಟೆಯಲ್ಲಿ ಉರಿ', 'ಹೊಟ್ಟೆ ಉಬ್ಬರ', 'ಹೊಟ್ಟೆ ನೋವು'],
      transliterations: ['hottenovu', 'hotte novu', 'hotteyalli uri']
    },
    'hi-IN': {
      terms: ['पेट दर्द', 'पेट में मरोड़', 'पेट फूलना', 'पेट में जलन', 'पेट खराब'],
      transliterations: ['pet dard', 'petdard', 'pet me jalan', 'marod']
    },
    'en-IN': {
      terms: ['stomach pain', 'abdominal pain', 'belly ache', 'cramps', 'gastric pain', 'tummy ache'],
      transliterations: ['stomach pain', 'belly pain', 'abdominal pain']
    }
  },

  CHEST_PAIN: {
    'ta-IN': {
      terms: ['நெஞ்சு வலி', 'மார்பு வலி', 'நெஞ்சில் பாரம்', 'மாரடைப்பு', 'நெஞ்சு பிசைவது போல'],
      transliterations: ['nenju vali', 'maarbu vali', 'maaradaipu'],
      isRedFlag: true
    },
    'te-IN': {
      terms: ['ఛాతీ నొప్పి', 'గుండె నొప్పి', 'ఛాతీలో బిగుతు', 'గుండెపోటు', 'ఛాతీ బరువు'],
      transliterations: ['chaathi noppi', 'gunde noppi', 'gundepotu'],
      isRedFlag: true
    },
    'ml-IN': {
      terms: ['നെഞ്ചുവേദന', 'ഹൃദയവേദന', 'നെഞ്ചിൽ ഭാരം', 'ഹൃദയാഘാതം', 'നെഞ്ചിൽ ഇറുകൽ'],
      transliterations: ['nenjuvedhana', 'nenjil bharam', 'hrudayagatham'],
      isRedFlag: true
    },
    'kn-IN': {
      terms: ['ಎದೆ ನೋವು', 'ಹೃದಯ ನೋವು', 'ಎದೆಯಲ್ಲಿ ಬಿಗಿತ', 'ಹೃದಯಾಘಾತ', 'ಎದೆ ಭಾರ'],
      transliterations: ['ede novu', 'hrudaya novu', 'hrudayaghatha'],
      isRedFlag: true
    },
    'hi-IN': {
      terms: ['सीने में दर्द', 'छाती में दर्द', 'दिल का दौरा', 'सीने में भारीपन', 'हार्ट अटैक'],
      transliterations: ['seene me dard', 'chhati me dard', 'heart attack', 'dil ka daura'],
      isRedFlag: true
    },
    'en-IN': {
      terms: ['chest pain', 'chest tightness', 'heart attack', 'cardiac pain', 'angina', 'crushing chest pain'],
      transliterations: ['chest pain', 'heart attack', 'cardiac arrest'],
      isRedFlag: true
    }
  },

  BREATHING_DIFFICULTY: {
    'ta-IN': {
      terms: ['மூச்சுத்திணறல்', 'சுவாசிக்க முடியவில்லை', 'மூச்சு வாங்குகிறது', 'இளைப்பு', 'மூச்சடைப்பு'],
      transliterations: ['moochuthinaral', 'moochu vida kashtam', 'swasikka mudiyavillai'],
      isRedFlag: true
    },
    'te-IN': {
      terms: ['శ్వాస ఆడకపోవడం', 'ఊపిరి ఆడట్లేదు', 'శ్వాస తీసుకోవడంలో ఇబ్బంది', 'ఆయాసం', 'దమ్ము'],
      transliterations: ['shwasa aadakapovadam', 'oopiri aadatledu', 'aayasam'],
      isRedFlag: true
    },
    'ml-IN': {
      terms: ['ശ്വാസംമുട്ടൽ', 'ശ്വാസമെടുക്കാൻ ബുദ്ധിമുട്ട്', 'ശ്വാസമില്ലായ്മ', 'ശ്വാസം കിട്ടുന്നില്ല'],
      transliterations: ['shwasamuttal', 'shwasamedukkan budhimutt'],
      isRedFlag: true
    },
    'kn-IN': {
      terms: ['ಉಸಿರಾಟದ ತೊಂದರೆ', 'ಉಸಿರಾಡಲು ಕಷ್ಟ', 'ದಮ್ಮು', 'ಉಸಿರು ಕಟ್ಟುತ್ತಿದೆ', 'ಆಯಾಸ'],
      transliterations: ['usiraatada thondare', 'usiraadalu kashta', 'dammu'],
      isRedFlag: true
    },
    'hi-IN': {
      terms: ['सांस लेने में तकलीफ', 'सांस फूलना', 'दम घुटना', 'सांस नहीं आ रही', 'हांफना'],
      transliterations: ['saans lene me takleef', 'saans phoolna', 'dam ghutna'],
      isRedFlag: true
    },
    'en-IN': {
      terms: ['difficulty breathing', 'shortness of breath', 'breathless', 'cannot breathe', 'gasping', 'choking', 'dyspnea'],
      transliterations: ['difficulty breathing', 'shortness of breath', 'breathless'],
      isRedFlag: true
    }
  },

  VOMITING: {
    'ta-IN': {
      terms: ['வாந்தி', 'குமட்டல்', 'வாந்தி வருகிறது', 'எடுப்பது'],
      transliterations: ['vaanthi', 'kumattal', 'vaanthi varuthu']
    },
    'te-IN': {
      terms: ['వాంతులు', 'వికారం', 'వాంతి వస్తుంది', 'వాంతులు అవుతున్నాయి'],
      transliterations: ['vaanthulu', 'vikaaram', 'vaanti']
    },
    'ml-IN': {
      terms: ['ഛർദ്ദി', 'ഓക്കാനം', 'ഛർദ്ദിക്കുന്നു', 'ഛർദ്ദിക്കാൻ തോന്നുന്നു'],
      transliterations: ['chardhi', 'chardi', 'okkanam']
    },
    'kn-IN': {
      terms: ['ವಾಂತಿ', 'ವಾಕರಿಕೆ', 'ವಾಂತಿಯಾಗುತ್ತಿದೆ', 'ವಾಂತಿ ಬರುವುದು'],
      transliterations: ['vaanthi', 'vaakarike', 'vaanti']
    },
    'hi-IN': {
      terms: ['उल्टी', 'जी मिचलाना', 'उल्टियां हो रही हैं', 'कै'],
      transliterations: ['ulti', 'ultiyan', 'jee michlana']
    },
    'en-IN': {
      terms: ['vomiting', 'nausea', 'throwing up', 'puking', 'feeling sick', 'emesis'],
      transliterations: ['vomiting', 'nausea', 'throwing up']
    }
  },

  DIARRHEA: {
    'ta-IN': {
      terms: ['வயிற்றுப்போக்கு', 'பேதி', 'வயிற்றோட்டம்', 'நீர் மலம்'],
      transliterations: ['vayitruppokku', 'pedhi', 'loose motion']
    },
    'te-IN': {
      terms: ['విరేచనాలు', 'నీళ్ల విరేచనాలు', 'బేదులు', 'మోషన్స్'],
      transliterations: ['virechanaalu', 'neella virechanaalu', 'motions']
    },
    'ml-IN': {
      terms: ['വയറിളക്കം', 'വയറൊഴിച്ചിൽ', 'നീർമലം', 'വയറിന് അസുഖം'],
      transliterations: ['vayarilakkam', 'vayarozhichil']
    },
    'kn-IN': {
      terms: ['ಭೇದಿ', 'ನೀರು ಭೇದಿ', 'ಹೊಟ್ಟೆ ತೊಳೆಸುವಿಕೆ', 'ಮೋಷನ್ಸ್'],
      transliterations: ['bhedi', 'neeru bhedi', 'motions']
    },
    'hi-IN': {
      terms: ['दस्त', 'पेट खराब', 'पतले दस्त', 'लूज मोशन'],
      transliterations: ['dast', 'patle dast', 'loose motion', 'jhada']
    },
    'en-IN': {
      terms: ['diarrhea', 'loose motions', 'watery stools', 'runny stomach', 'bowel upset'],
      transliterations: ['diarrhea', 'loose motions']
    }
  },

  DIZZINESS: {
    'ta-IN': {
      terms: ['மயக்கம்', 'தலைசுற்றல்', 'கண் இருட்டுதல்', 'சுயநினைவு இழப்பது'],
      transliterations: ['mayakkam', 'thala sutral', 'kan iruttuthal']
    },
    'te-IN': {
      terms: ['తలతిరగడం', 'కళ్ళు తిరగడం', 'మూర్ఛ', 'స్పృహ తప్పుతుంది'],
      transliterations: ['talathiragadam', 'kallu thiragadam']
    },
    'ml-IN': {
      terms: ['തലകറക്കം', 'കണ്ണിൽ ഇരുട്ട് കയറൽ', 'ബോധക്കേട്', 'തളർച്ച'],
      transliterations: ['thalakarakkam', 'kannil iruttu']
    },
    'kn-IN': {
      terms: ['ತಲೆತಿರುಗುವಿಕೆ', 'ಕಣ್ಣು ಕತ್ತಲಾಗುವುದು', 'ತಲೆ ಸುತ್ತುವುದು', 'ಮೂರ್ಛೆ'],
      transliterations: ['thalethiruguvike', 'kannu katthalu']
    },
    'hi-IN': {
      terms: ['चक्कर आना', 'सिर घूमना', 'आंखों के आगे अंधेरा', 'बेहोशी जैसा लगना'],
      transliterations: ['chakkar aana', 'sir ghoomna', 'andhera chhana']
    },
    'en-IN': {
      terms: ['dizziness', 'giddiness', 'lightheaded', 'vertigo', 'faintness', 'spinning sensation'],
      transliterations: ['dizziness', 'lightheaded', 'vertigo']
    }
  },

  WEAKNESS: {
    'ta-IN': {
      terms: ['உடல் சோர்வு', 'பலவீனம்', 'அசதி', 'தெம்பு இல்லை'],
      transliterations: ['asathi', 'balaveenam', 'udal sorvu']
    },
    'te-IN': {
      terms: ['నీరసం', 'బలహీనత', 'అలసట', 'ఓపిక లేదు'],
      transliterations: ['neerasam', 'balheenata', 'alasata']
    },
    'ml-IN': {
      terms: ['ക്ഷീണം', 'തളർച്ച', 'ശക്തിയില്ലായ്മ', 'അവശത'],
      transliterations: ['ksheenam', 'thalarcha', 'avashatha']
    },
    'kn-IN': {
      terms: ['ಸುಸ್ತು', 'ದಣಿವು', 'ಬಲಹೀನತೆ', 'ತ್ರಾಣವಿಲ್ಲ'],
      transliterations: ['susthu', 'danivu', 'balheenathe']
    },
    'hi-IN': {
      terms: ['कमजोरी', 'थकान', 'अशक्तता', 'हिम्मत न होना'],
      transliterations: ['kamzori', 'thakan', 'ashaktata']
    },
    'en-IN': {
      terms: ['weakness', 'fatigue', 'tiredness', 'exhaustion', 'lethargy', 'no energy'],
      transliterations: ['weakness', 'fatigue', 'tiredness']
    }
  },

  BODY_PAIN: {
    'ta-IN': {
      terms: ['உடம்பு வலி', 'கை கால் வலி', 'மூட்டு வலி', 'தசை வலி'],
      transliterations: ['udambu vali', 'kai kaal vali', 'moottu vali']
    },
    'te-IN': {
      terms: ['ఒళ్లు నొప్పులు', 'కీళ్ల నొప్పులు', 'కాళ్ల నొప్పులు', 'చేతుల నొప్పులు'],
      transliterations: ['ontlo noppulu', 'keella noppulu', 'kaalla noppulu']
    },
    'ml-IN': {
      terms: ['ശരീരവേദന', 'സന്ധിവേദന', 'കൈകാൽ വേദന', 'പേശി വേദന'],
      transliterations: ['shareeravedhana', 'sandhivedhana', 'kaikaal vedhana']
    },
    'kn-IN': {
      terms: ['ಮೈಕೈ ನೋವು', 'ಕೀಲು ನೋವು', 'ಕಾಲು ನೋವು', 'ಮಾಂಸಖಂಡದ ನೋವು'],
      transliterations: ['maikai novu', 'keelu novu', 'kaalu novu']
    },
    'hi-IN': {
      terms: ['बदन दर्द', 'जोड़ों का दर्द', 'हाथ पैर दर्द', 'मांसपेशियों में दर्द'],
      transliterations: ['badan dard', 'jodon ka dard', 'haath pair dard']
    },
    'en-IN': {
      terms: ['body pain', 'body ache', 'joint pain', 'muscle pain', 'myalgia', 'generalized pain'],
      transliterations: ['body pain', 'joint pain', 'body ache']
    }
  },

  SORE_THROAT: {
    'ta-IN': {
      terms: ['தொண்டை வலி', 'தொண்டை கரகரப்பு', 'விழுங்க கஷ்டம்'],
      transliterations: ['thondui vali', 'thondai karakarappu']
    },
    'te-IN': {
      terms: ['గొంతు నొప్పి', 'గొంతులో గరగర', 'మింగలేకపోవడం'],
      transliterations: ['gontu noppi', 'gontulo noppi']
    },
    'ml-IN': {
      terms: ['തൊണ്ടവേദന', 'തൊണ്ടയിൽ കരകരപ്പ്', 'വിഴുങ്ങാൻ ബുദ്ധിമുട്ട്'],
      transliterations: ['thondavedhana', 'thondavedana']
    },
    'kn-IN': {
      terms: ['ಗಂಟಲು ನೋವು', 'ಗಂಟಲಲ್ಲಿ ಕಿರಿಕಿರಿ', 'ನುಂಗಲು ಕಷ್ಟ'],
      transliterations: ['gantalu novu', 'gantalu nopp']
    },
    'hi-IN': {
      terms: ['गले में दर्द', 'गले में खराश', 'निगलने में दर्द'],
      transliterations: ['gale me dard', 'gale me kharash']
    },
    'en-IN': {
      terms: ['sore throat', 'throat pain', 'difficulty swallowing', 'pharyngitis', 'scratchy throat'],
      transliterations: ['sore throat', 'throat pain']
    }
  },

  EAR_PAIN: {
    'ta-IN': {
      terms: ['காது வலி', 'காதில் சீழ்', 'காது அடைப்பு'],
      transliterations: ['kaadhu vali', 'kaadu vali']
    },
    'te-IN': {
      terms: ['చెవి నొప్పి', 'చెవిలో చీము', 'చెవి దిబ్బడ'],
      transliterations: ['chevi noppi', 'chevi lo noppi']
    },
    'ml-IN': {
      terms: ['ചെവിവേദന', 'ചെവിയിൽ നിന്ന് ചലം', 'ചെവിയടപ്പ്'],
      transliterations: ['chevivedhana', 'chevi vedhana']
    },
    'kn-IN': {
      terms: ['ಕಿವಿ ನೋವು', 'ಕಿವಿಯಲ್ಲಿ ಕೀವು', 'ಕಿವಿ ಕಟ್ಟುವುದು'],
      transliterations: ['kivi novu', 'kivi noppu']
    },
    'hi-IN': {
      terms: ['कान में दर्द', 'कान बहना', 'कान बंद होना'],
      transliterations: ['kaan me dard', 'kaan dard']
    },
    'en-IN': {
      terms: ['ear pain', 'earache', 'ear discharge', 'ear infection', 'otitis'],
      transliterations: ['ear pain', 'earache']
    }
  },

  TOOTH_PAIN: {
    'ta-IN': {
      terms: ['பல் வலி', 'ஈறு வீக்கம்', 'ஈறில் ரத்தம்'],
      transliterations: ['pal vali', 'eeru veekkam']
    },
    'te-IN': {
      terms: ['పంటి నొప్పి', 'చిగుళ్ల వాపు', 'పళ్ళు గుంజుతున్నాయి'],
      transliterations: ['panti noppi', 'pallu noppi']
    },
    'ml-IN': {
      terms: ['പല്ലുവേദന', 'മോണവീക്കം', 'പല്ലിളക്കം'],
      transliterations: ['palluvedhana', 'pallu vedhana']
    },
    'kn-IN': {
      terms: ['ಹಲ್ಲು ನೋವು', 'ವಸಡು ಊತ', 'ಹಲ್ಲಿನಲ್ಲಿ ಕೀವು'],
      transliterations: ['hallu novu', 'vasadu ootha']
    },
    'hi-IN': {
      terms: ['दांत में दर्द', 'मसूड़ों में सूजन', 'दांत में कीड़ा'],
      transliterations: ['daant me dard', 'dant dard', 'masude']
    },
    'en-IN': {
      terms: ['tooth pain', 'toothache', 'dental pain', 'gum swelling', 'sensitive tooth'],
      transliterations: ['tooth pain', 'toothache']
    }
  },

  BACK_PAIN: {
    'ta-IN': {
      terms: ['முதுகு வலி', 'இடுப்பு வலி', 'முதுகுத்தண்டு வலி'],
      transliterations: ['mudhugu vali', 'iduppu vali']
    },
    'te-IN': {
      terms: ['వెన్నునొప్పి', 'నడుము నొప్పి', 'వీపు నొప్పి'],
      transliterations: ['vennunappi', 'nadumu noppi']
    },
    'ml-IN': {
      terms: ['പുറംവേദന', 'ഇടുപ്പുവേദന', 'നടുവേദന'],
      transliterations: ['puramvedhana', 'naduvedhana']
    },
    'kn-IN': {
      terms: ['ಬೆನ್ನು ನೋವು', 'ಸೊಂಟ ನೋವು', 'ನಡು ನೋವು'],
      transliterations: ['bennu novu', 'sonta novu']
    },
    'hi-IN': {
      terms: ['पीठ दर्द', 'कमर दर्द', 'रीढ़ की हड्डी में दर्द'],
      transliterations: ['peeth dard', 'kamar dard']
    },
    'en-IN': {
      terms: ['back pain', 'backache', 'lower back pain', 'lumbar pain', 'spinal pain'],
      transliterations: ['back pain', 'lower back pain']
    }
  },

  RASH: {
    'ta-IN': {
      terms: ['தடிப்பு', 'தோல் தடிப்பு', 'சிவப்பு புள்ளிகள்', 'கொப்புளம்'],
      transliterations: ['thadippu', 'tholu thadippu']
    },
    'te-IN': {
      terms: ['దద్దుర్లు', 'ఎర్రటి మచ్చలు', 'చర్మంపై దద్దుర్లు', 'పొక్కులు'],
      transliterations: ['daddurlu', 'errati macchalu']
    },
    'ml-IN': {
      terms: ['ചൊറിച്ചിലും തടിപ്പും', 'തടിപ്പ്', 'ചുവന്ന പാടുകൾ', 'കുരുക്കൾ'],
      transliterations: ['thadipp', 'chuvanna paadukal']
    },
    'kn-IN': {
      terms: ['ದದ್ದು', 'ಕೆಂಪು ಕಲೆಗಳು', 'ಚರ್ಮದ ದದ್ದು', 'ಗುಳ್ಳೆಗಳು'],
      transliterations: ['daddu', 'kempu kalegalu']
    },
    'hi-IN': {
      terms: ['चकत्ते', 'दाने', 'लाल निशान', 'फफोले', 'पित्ती'],
      transliterations: ['chakatte', 'daane', 'laal daane']
    },
    'en-IN': {
      terms: ['rash', 'skin rash', 'hives', 'eruptions', 'red spots', 'urticaria'],
      transliterations: ['rash', 'skin rash', 'hives']
    }
  },

  ITCHING: {
    'ta-IN': {
      terms: ['அரிப்பு', 'உடம்பு அரிப்பு', 'தோல் அரிப்பு'],
      transliterations: ['arippu', 'udal arippu']
    },
    'te-IN': {
      terms: ['దురద', 'ఒంటి దురద', 'చర్మం దురద'],
      transliterations: ['durada', 'onti durada']
    },
    'ml-IN': {
      terms: ['ചൊറിച്ചിൽ', 'ശരീരം ചൊറിയുന്നു'],
      transliterations: ['chorichil', 'choriyunnu']
    },
    'kn-IN': {
      terms: ['ತುರಿಕೆ', 'ಮೈ ತುರಿಕೆ', 'ಚರ್ಮದ ತುರಿಕೆ'],
      transliterations: ['turike', 'mai turike']
    },
    'hi-IN': {
      terms: ['खुजली', 'बदन में खुजली', 'खारिश'],
      transliterations: ['khujli', 'kharish']
    },
    'en-IN': {
      terms: ['itching', 'itchy skin', 'pruritus', 'scratching'],
      transliterations: ['itching', 'itchy']
    }
  },

  SWELLING: {
    'ta-IN': {
      terms: ['வீக்கம்', 'கால் வீக்கம்', 'முகம் வீக்கம்', 'உடல் வீக்கம்'],
      transliterations: ['veekkam', 'kaal veekkam']
    },
    'te-IN': {
      terms: ['వాపు', 'కాళ్ల వాపు', 'ముఖం వాపు', 'కండరాల వాపు'],
      transliterations: ['vaapu', 'kaalla vaapu']
    },
    'ml-IN': {
      terms: ['വീക്കം', 'കാൽ വീക്കം', 'മുഖം വീർക്കൽ'],
      transliterations: ['veekkam', 'kaal veekkam']
    },
    'kn-IN': {
      terms: ['ಊತ', 'ಕಾಲು ಊತ', 'ಮುಖ ಊದಿಕೊಂಡಿದೆ'],
      transliterations: ['ootha', 'kaalu ootha']
    },
    'hi-IN': {
      terms: ['सूजन', 'पैर में सूजन', 'मुंह पर सूजन'],
      transliterations: ['soojan', 'sujan', 'pair me sujan']
    },
    'en-IN': {
      terms: ['swelling', 'edema', 'swollen leg', 'inflammation', 'puffiness'],
      transliterations: ['swelling', 'swollen']
    }
  },

  BLEEDING: {
    'ta-IN': {
      terms: ['ரத்தப்போக்கு', 'இரத்தம் வருகிறது', 'ரத்தம் கொட்டுது', 'மூக்கில் ரத்தம்'],
      transliterations: ['rathappokku', 'iratham', 'bleeding'],
      isRedFlag: true
    },
    'te-IN': {
      terms: ['రక్తస్రావం', 'రక్తం కారుతుంది', 'తీవ్ర రక్తస్రావం'],
      transliterations: ['raktasravam', 'raktam karutundi'],
      isRedFlag: true
    },
    'ml-IN': {
      terms: ['രക്തസ്രാവം', 'ചോര വരുന്നു', 'കടുത്ത രക്തസ്രാവം'],
      transliterations: ['rakthasravam', 'chora varunnu'],
      isRedFlag: true
    },
    'kn-IN': {
      terms: ['ರಕ್ತಸ್ರಾವ', 'ರಕ್ತ ಸುರಿಯುತ್ತಿದೆ', 'ಅತಿಯಾದ ರಕ್ತಸ್ರಾವ'],
      transliterations: ['rakthasrava', 'raktha suriyuttide'],
      isRedFlag: true
    },
    'hi-IN': {
      terms: ['खून बहना', 'रक्तस्राव', 'खून निकलना', 'भारी रक्तस्राव'],
      transliterations: ['khoon behna', 'raktsraav', 'khoon nikalna'],
      isRedFlag: true
    },
    'en-IN': {
      terms: ['bleeding', 'heavy bleeding', 'hemorrhage', 'blood loss', 'severe bleeding'],
      transliterations: ['bleeding', 'blood loss'],
      isRedFlag: true
    }
  },

  INJURY: {
    'ta-IN': {
      terms: ['காயம்', 'அடிபட்டது', 'விபத்து', 'எலும்பு முறிவு', 'வெட்டு காயம்'],
      transliterations: ['kaayam', 'adi pattadhu', 'vibathu']
    },
    'te-IN': {
      terms: ['గాయం', 'దెబ్బ తగిలింది', 'ప్రమాదం', 'ఎముక విరిగింది'],
      transliterations: ['gaayam', 'debba tagilindi']
    },
    'ml-IN': {
      terms: ['മുറിവ്', 'അപകടം', 'അടിപറ്റി', 'എല്ല് പൊട്ടൽ'],
      transliterations: ['murivu', 'apakatam', 'ell pottal']
    },
    'kn-IN': {
      terms: ['ಗಾಯ', 'ಪೆಟ್ಟು ಬಿದ್ದಿದೆ', 'ಅಪಘಾತ', 'ಮೂಳೆ ಮುರಿತ'],
      transliterations: ['gaaya', 'pettu biddide']
    },
    'hi-IN': {
      terms: ['चोट', 'घाव', 'दुर्घटना', 'हड्डी टूटना', 'मोच'],
      transliterations: ['chot', 'ghaav', 'durghatna']
    },
    'en-IN': {
      terms: ['injury', 'wound', 'accident', 'fracture', 'trauma', 'sprain', 'cut'],
      transliterations: ['injury', 'wound', 'accident']
    }
  },

  BURN: {
    'ta-IN': {
      terms: ['தீக்காயம்', 'சுட்டுக் கொண்டது', 'தீப்புண்'],
      transliterations: ['theekkayam', 'suttukondathu']
    },
    'te-IN': {
      terms: ['కాలిన గాయం', 'నిప్పు కాలింది', 'కాలిన పుండు'],
      transliterations: ['kaalina gaayam', 'nippu kaalindi']
    },
    'ml-IN': {
      terms: ['പൊള്ളൽ', 'തീപ്പൊള്ളൽ', 'തീക്കായം'],
      transliterations: ['pollal', 'theepollal']
    },
    'kn-IN': {
      terms: ['ಸುಟ್ಟ ಗಾಯ', 'ಬೆಂಕಿ ಸುಟ್ಟಿದೆ'],
      transliterations: ['sutta gaaya', 'benki suttide']
    },
    'hi-IN': {
      terms: ['जलना', 'जला हुआ घाव', 'आग से जलना'],
      transliterations: ['jalna', 'jala hua']
    },
    'en-IN': {
      terms: ['burn', 'scald', 'thermal burn', 'blister from burn'],
      transliterations: ['burn', 'scald']
    }
  },

  HIGH_BLOOD_SUGAR: {
    'ta-IN': {
      terms: ['சர்க்கரை அதிகம்', 'ஹை சுகர்', 'சுகர் ஏறிடுச்சு', 'அடிக்கடி சிறுநீர்', 'அதிக தாகம்'],
      transliterations: ['sugar athigam', 'high sugar', 'adhiga thaagam']
    },
    'te-IN': {
      terms: ['షుగర్ పెరిగింది', 'రక్తంలో చక్కెర ఎక్కువ', 'హై షుగర్', 'అతి దప్పిక'],
      transliterations: ['sugar perigindi', 'high sugar']
    },
    'ml-IN': {
      terms: ['പഞ്ചസാര കൂടി', 'ഷുഗർ കൂടി', 'കൂടിയ ഷുഗർ', 'അമിത ദാഹം'],
      transliterations: ['sugar koodi', 'panchasara koodi']
    },
    'kn-IN': {
      terms: ['ಸಕ್ಕರೆ ಜಾಸ್ತಿ', 'ಶುಗರ್ ಹೆಚ್ಚಾಗಿದೆ', 'ಹೆಚ್ಚು ಬಾಯಾರಿಕೆ'],
      transliterations: ['sugar jasthi', 'sakre hechagide']
    },
    'hi-IN': {
      terms: ['शुगर बढ़ गई', 'हाई ब्लड शुगर', 'ज्यादा प्यास लगना', 'बार-बार पेशाब'],
      transliterations: ['sugar badh gayi', 'high sugar']
    },
    'en-IN': {
      terms: ['high blood sugar', 'hyperglycemia', 'sugar spiked', 'frequent urination', 'excessive thirst'],
      transliterations: ['high sugar', 'high blood sugar', 'hyperglycemia']
    }
  },

  LOW_BLOOD_SUGAR: {
    'ta-IN': {
      terms: ['சர்க்கரை குறைவு', 'லோ சுகர்', 'சுகர் குறைஞ்சிடுச்சு', 'உடல் நடுக்கம்', 'குளிர் வியர்வை'],
      transliterations: ['low sugar', 'sugar kuraivu', 'nadukkam'],
      isRedFlag: true
    },
    'te-IN': {
      terms: ['షుగర్ పడిపోయింది', 'లో షుగర్', 'చెమటలు పట్టడం', 'వణుకు'],
      transliterations: ['low sugar', 'sugar padipoyindi', 'vanuku'],
      isRedFlag: true
    },
    'ml-IN': {
      terms: ['ഷുഗർ കുറഞ്ഞു', 'ലോ ഷുഗർ', 'വിറയൽ', 'തണുത്ത വിയർപ്പ്'],
      transliterations: ['low sugar', 'sugar kuranju', 'virayal'],
      isRedFlag: true
    },
    'kn-IN': {
      terms: ['ಶುಗರ್ ಕಡಿಮೆಯಾಗಿದೆ', 'ಲೋ ಶುಗರ್', 'ಮೈ ನಡುಗುವುದು', 'ತಣ್ಣನೆಯ ಬೆವರು'],
      transliterations: ['low sugar', 'sugar kadime', 'nadukavaguvudu'],
      isRedFlag: true
    },
    'hi-IN': {
      terms: ['शुगर कम होना', 'लो ब्लड शुगर', 'कंपकंपी', 'ठंडा पसीना आना', 'हाइपोग्लाइसीमिया'],
      transliterations: ['low sugar', 'sugar kam hona', 'thanda paseena'],
      isRedFlag: true
    },
    'en-IN': {
      terms: ['low blood sugar', 'hypoglycemia', 'sugar dropped', 'shaky and sweating', 'cold sweats'],
      transliterations: ['low sugar', 'hypoglycemia', 'sugar drop'],
      isRedFlag: true
    }
  },

  BLOOD_PRESSURE: {
    'ta-IN': {
      terms: ['ரத்த அழுத்தம்', 'பிபி', 'இரத்தக் கொதிப்பு', 'ஹை பிபி', 'லோ பிபி'],
      transliterations: ['rathathazhutham', 'bp', 'blood pressure', 'high bp', 'low bp']
    },
    'te-IN': {
      terms: ['రక్తపోటు', 'బీపీ', 'హై బీపీ', 'లో బీపీ', 'రక్తపోటు పెరిగింది'],
      transliterations: ['raktapotu', 'bp', 'high bp', 'low bp']
    },
    'ml-IN': {
      terms: ['രക്തസമ്മർദ്ദം', 'പ്രഷർ', 'ബിപി', 'ഹൈ ബിപി', 'ലോ ബിപി'],
      transliterations: ['rakthasamardham', 'bp', 'pressure', 'high bp']
    },
    'kn-IN': {
      terms: ['ರಕ್ತದೊತ್ತಡ', 'ಬಿಪಿ', 'ಹೈ ಬಿಪಿ', 'ಲೋ ಬಿಪಿ', 'ರಕ್ತದ ಒತ್ತಡ'],
      transliterations: ['rakthadottada', 'bp', 'high bp', 'low bp']
    },
    'hi-IN': {
      terms: ['रक्तचाप', 'बीपी', 'ब्लड प्रेशर', 'हाई बीपी', 'लो बीपी'],
      transliterations: ['raktachaap', 'bp', 'blood pressure', 'high bp']
    },
    'en-IN': {
      terms: ['blood pressure', 'bp', 'hypertension', 'high bp', 'low bp', 'hypotension'],
      transliterations: ['bp', 'blood pressure', 'hypertension']
    }
  },

  PREGNANCY: {
    'ta-IN': {
      terms: ['கர்ப்பம்', 'கர்ப்பிணி', 'வயிற்றில் குழந்தை', 'பிரசவம்', 'கருவுற்ற தாய்', 'வளைகாப்பு'],
      transliterations: ['garbham', 'karppini', 'pregnant', 'pregnancy']
    },
    'te-IN': {
      terms: ['గర్భం', 'గర్భిణీ', 'కడుపుతో ఉంది', 'ప్రసవం', 'నెలలు నిండాయి'],
      transliterations: ['garbham', 'garbhini', 'kadupulo pillodu']
    },
    'ml-IN': {
      terms: ['ഗർഭം', 'ഗർഭിണി', 'വയറ്റിൽ കുഞ്ഞ്', 'പ്രസവം', 'ഗർഭാവസ്ഥ'],
      transliterations: ['garbham', 'garbhini', 'prasavam']
    },
    'kn-IN': {
      terms: ['ಗರ್ಭಧಾರಣೆ', 'ಗರ್ಭಿಣಿ', 'ಬಸುರಿ', 'ಪ್ರಸವ', 'ಹೊಟ್ಟೆಯಲ್ಲಿ ಮಗು'],
      transliterations: ['garbhadharane', 'garbhini', 'basuri']
    },
    'hi-IN': {
      terms: ['गर्भावस्था', 'गर्भवती', 'गर्भ', 'प्रसव', 'बच्चा पेट में', 'डिलीवरी'],
      transliterations: ['garbhavastha', 'garbhvati', 'prasav', 'delivery']
    },
    'en-IN': {
      terms: ['pregnancy', 'pregnant', 'maternity', 'antenatal', 'trimester', 'fetal movement', 'delivery'],
      transliterations: ['pregnancy', 'pregnant', 'maternity']
    }
  },

  NEWBORN: {
    'ta-IN': {
      terms: ['பிறந்த குழந்தை', 'பச்சிளம் குழந்தை', 'பாலூட்டுதல்', 'தொப்புள் கொடி', 'மஞ்சள் காமாலை'],
      transliterations: ['pirandha kuzhandhai', 'pachilam kuzhandhai', 'newborn']
    },
    'te-IN': {
      terms: ['పుట్టిన బిడ్డ', 'పసిగుడ్డు', 'తల్లి పాలు', 'బొడ్డు పేగు', 'పసిపిల్లలు'],
      transliterations: ['puttina bidda', 'pasiguddu', 'newborn']
    },
    'ml-IN': {
      terms: ['നവജാത ശിശു', 'പൈതൽ', 'മുലപ്പാൽ', 'പൊക്കിൾക്കൊടി', 'മഞ്ഞപ്പിത്തം'],
      transliterations: ['navajaatha shishu', 'paithal', 'newborn']
    },
    'kn-IN': {
      terms: ['ಹುಟ್ಟಿದ ಮಗು', 'ಹಸುಗೂಸು', 'ತಾಯಿ ಹಾಲು', 'ಹೊಕ್ಕುಳು ಬಳ್ಳಿ', 'ನವಜಾತ ಶಿಶು'],
      transliterations: ['huttida magu', 'hasugoosu', 'newborn']
    },
    'hi-IN': {
      terms: ['नवजात शिशु', 'छोटा बच्चा', 'मां का दूध', 'नाल', 'पीलिया'],
      transliterations: ['navjaat shishu', 'chhota bachha', 'newborn']
    },
    'en-IN': {
      terms: ['newborn', 'infant', 'breastfeeding', 'umbilical cord', 'neonatal', 'jaundice'],
      transliterations: ['newborn', 'infant', 'baby']
    }
  },

  CHILD_HEALTH: {
    'ta-IN': {
      terms: ['குழந்தை நலம்', 'குழந்தைக்கு', 'சிறுவன்', 'சிறுமி', 'வளர்ச்சி'],
      transliterations: ['kuzhandhai', 'paappa', 'child health']
    },
    'te-IN': {
      terms: ['పిల్లల ఆరోగ్యం', 'బిడ్డ', 'పిల్లవాడు', 'పిల్లల పెరుగుదల'],
      transliterations: ['pillalu', 'pillala arogyam', 'child']
    },
    'ml-IN': {
      terms: ['കുട്ടികളുടെ ആരോഗ്യം', 'കുട്ടി', 'കുഞ്ഞിന്', 'വളർച്ച'],
      transliterations: ['kuttikal', 'kunjin', 'child']
    },
    'kn-IN': {
      terms: ['ಮಕ್ಕಳ ಆರೋಗ್ಯ', 'ಮಗು', 'ಚಿಕ್ಕ ಮಗು', 'ಮಕ್ಕಳ ಬೆಳವಣಿಗೆ'],
      transliterations: ['makkala aarogya', 'magu', 'child']
    },
    'hi-IN': {
      terms: ['बाल स्वास्थ्य', 'बच्चे की सेहत', 'बच्चा', 'शिशು विकास'],
      transliterations: ['baal swasthya', 'bacha', 'child health']
    },
    'en-IN': {
      terms: ['child health', 'pediatric', 'toddler', 'child growth', 'children'],
      transliterations: ['child', 'pediatric', 'kids']
    }
  },

  ELDERLY_HEALTH: {
    'ta-IN': {
      terms: ['முதியோர் நலம்', 'தாத்தா', 'பாட்டி', 'வயதானவர்', 'வயோதிகம்'],
      transliterations: ['muthiyor', 'thaatha', 'paatti', 'elderly']
    },
    'te-IN': {
      terms: ['వృద్ధుల ఆరోగ్యం', 'తాతయ్య', 'నానమ్మ', 'అమ్మమ్మ', 'వృద్ధులు'],
      transliterations: ['vruddhulu', 'tathayya', 'nanamma', 'elderly']
    },
    'ml-IN': {
      terms: ['മുതിർന്നവരുടെ ആരോഗ്യം', 'മുത്തശ്ശൻ', 'മുത്തശ്ശി', 'വൃദ്ധർ'],
      transliterations: ['muthirnnavar', 'muthashan', 'muthashi', 'elderly']
    },
    'kn-IN': {
      terms: ['ಹಿರಿಯರ ಆರೋಗ್ಯ', 'ಅಜ್ಜ', 'ಅಜ್ಜಿ', 'ವೃದ್ಧರು', 'ವಯಸ್ಸಾದವರು'],
      transliterations: ['hiriyaru', 'ajja', 'ajji', 'vruddhuru']
    },
    'hi-IN': {
      terms: ['बुजुर्गों की देखभाल', 'दादा', 'दादी', 'नाना', 'नानी', 'वृद्ध'],
      transliterations: ['bujurg', 'dada', 'dadi', 'elderly']
    },
    'en-IN': {
      terms: ['elderly care', 'geriatric', 'senior citizen', 'grandparents', 'aging'],
      transliterations: ['elderly', 'senior citizen', 'geriatric']
    }
  },

  MEDICINE: {
    'ta-IN': {
      terms: ['மருந்து', 'மாத்திரை', 'டேப்லெட்', 'மருந்துகள்', 'டானிக்', 'மருந்து சீட்டு'],
      transliterations: ['marunthu', 'mathirai', 'marundhu', 'tablet', 'tonic']
    },
    'te-IN': {
      terms: ['మందులు', 'మాత్రలు', 'టానిక్', 'ప్రిస్క్రిప్షన్', 'మందు వేసుకోవాలి'],
      transliterations: ['mandulu', 'mathralu', 'mandhu', 'tablet']
    },
    'ml-IN': {
      terms: ['മരുന്ന്', 'ഗുളിക', 'ടോണിക്ക്', 'മരുന്നുകൾ', 'കുറിപ്പടി'],
      transliterations: ['marunnu', 'gulika', 'marunnukal', 'tablet']
    },
    'kn-IN': {
      terms: ['ಔಷಧಿ', 'ಮಾತ್ರೆ', 'ಗುಳಿಗೆ', 'ಔಷಧಗಳು', 'ಟಾನಿಕ್'],
      transliterations: ['aushadhi', 'mathre', 'gulige', 'tablet']
    },
    'hi-IN': {
      terms: ['दवा', 'दवाई', 'गोली', 'दवाइयां', 'सिरप', 'खुराक'],
      transliterations: ['dawa', 'davai', 'goli', 'tablet', 'dawaiyan']
    },
    'en-IN': {
      terms: ['medicine', 'medication', 'tablet', 'pill', 'dose', 'prescription', 'drugs'],
      transliterations: ['medicine', 'medication', 'tablet']
    }
  },

  VACCINATION: {
    'ta-IN': {
      terms: ['தடுப்பூசி', 'போலியோ சொட்டு மருந்து', 'டிடி', 'பிசிஜி', 'தடுப்பூசி அட்டவணை'],
      transliterations: ['thaduppoosi', 'vaccine', 'polio']
    },
    'te-IN': {
      terms: ['టీకా', 'పోలియో చుక్కలు', 'టీకాలు', 'వ్యాక్సిన్', 'టీకా వేయించాలి'],
      transliterations: ['teeka', 'vaccine', 'polio chukkalu']
    },
    'ml-IN': {
      terms: ['വാക്സിൻ', 'കുത്തിവയ്പ്പ്', 'തുള്ളിമരുന്ന്', 'പ്രതിരോധ കുത്തിവയ്പ്പ്'],
      transliterations: ['vaccine', 'kuthivaipp', 'prathirodha']
    },
    'kn-IN': {
      terms: ['ಲಸಿಕೆ', 'ಪೋಲಿಯೋ ಹನಿಗಳು', 'ಚುಚ್ಚುಮದ್ದು', 'ಲಸಿಕೆಗಳು'],
      transliterations: ['lasike', 'vaccine', 'polio hanigalu']
    },
    'hi-IN': {
      terms: ['टीका', 'टीकाकरण', 'पोलियो की खुराक', 'वैक्सीन', 'सुई'],
      transliterations: ['teeka', 'teekakaran', 'vaccine', 'polio drop']
    },
    'en-IN': {
      terms: ['vaccination', 'vaccine', 'immunization', 'booster', 'polio drops', 'jab'],
      transliterations: ['vaccine', 'vaccination', 'immunization']
    }
  },

  DOCTOR: {
    'ta-IN': {
      terms: ['டாக்டர்', 'மருத்துவர்', 'வைத்தியர்', 'டாக்டரிடம் போகணும்'],
      transliterations: ['doctor', 'maruthuvar', 'vaithiyar']
    },
    'te-IN': {
      terms: ['డాక్టర్', 'వైద్యుడు', 'డాక్టర్ గారి దగ్గరకు'],
      transliterations: ['doctor', 'vaidhyudu']
    },
    'ml-IN': {
      terms: ['ഡോക്ടർ', 'വൈദ്യൻ', 'ചികിത്സകൻ'],
      transliterations: ['doctor', 'vaidyan']
    },
    'kn-IN': {
      terms: ['ಡಾಕ್ಟರ್', 'ವೈದ್ಯರು', 'ವೈದ್ಯರ ಹತ್ತಿರ'],
      transliterations: ['doctor', 'vaidyaru']
    },
    'hi-IN': {
      terms: ['डॉक्टर', 'चिकित्सक', 'वैद्य', 'डॉक्टर को दिखाना'],
      transliterations: ['doctor', 'chikitsak', 'vaidya']
    },
    'en-IN': {
      terms: ['doctor', 'physician', 'clinician', 'specialist', 'medical officer'],
      transliterations: ['doctor', 'physician']
    }
  },

  HOSPITAL: {
    'ta-IN': {
      terms: ['மருத்துவமனை', 'ஆஸ்பத்திரி', 'சுகாதார நிலையம்', 'பிஎச்சி', 'சிஎச்சி'],
      transliterations: ['maruthuvamanai', 'aaspathiri', 'hospital', 'phc']
    },
    'te-IN': {
      terms: ['ఆసుపత్రి', 'ఆస్పత్రి', 'పీహెచ్‌సీ', 'వైద్యశాల'],
      transliterations: ['aasupatri', 'hospital', 'phc']
    },
    'ml-IN': {
      terms: ['ആശുപത്രി', 'ഹോസ്പിറ്റൽ', 'ആരോഗ്യ കേന്ദ്രം'],
      transliterations: ['aashupathri', 'hospital', 'phc']
    },
    'kn-IN': {
      terms: ['ಆಸ್ಪತ್ರೆ', 'ದವಾಖಾನೆ', 'ಆರೋಗ್ಯ ಕೇಂದ್ರ'],
      transliterations: ['aaspathre', 'hospital', 'phc']
    },
    'hi-IN': {
      terms: ['अस्पताल', 'दवाखाना', 'प्राथमिक स्वास्थ्य केंद्र', 'पीएचसी'],
      transliterations: ['aspataal', 'hospital', 'phc']
    },
    'en-IN': {
      terms: ['hospital', 'clinic', 'phc', 'health centre', 'infirmary'],
      transliterations: ['hospital', 'clinic', 'phc']
    }
  },

  EMERGENCY: {
    'ta-IN': {
      terms: ['அவசரம்', 'ஆபத்து', 'உடனே', 'சீரியஸ்', 'ஆம்புலன்ஸ்', '108', 'மயங்கி விழுந்தார்'],
      transliterations: ['avasaram', 'aabathu', 'ambulance', '108'],
      isRedFlag: true
    },
    'te-IN': {
      terms: ['అత్యవసరం', 'ప్రమాదం', 'వెంటనే', 'ఆంబులెన్స్', '108', 'స్పృహ తప్పింది'],
      transliterations: ['atyavasaram', 'pramaadam', 'ambulance', '108'],
      isRedFlag: true
    },
    'ml-IN': {
      terms: ['അടിയന്തിരം', 'അപകടം', 'ഉടൻ', 'ആംബുലൻസ്', '108', 'അബോധാവസ്ഥ'],
      transliterations: ['adiyanthiram', 'apakatam', 'ambulance', '108'],
      isRedFlag: true
    },
    'kn-IN': {
      terms: ['ತುರ್ತು', 'ಅಪಾಯ', 'ಕೂಡಲೇ', 'ಆಂಬ್ಯುಲೆನ್ಸ್', '108', 'ಪ್ರಜ್ಞೆ ತಪ್ಪಿದೆ'],
      transliterations: ['thurtu', 'apaaya', 'ambulance', '108'],
      isRedFlag: true
    },
    'hi-IN': {
      terms: ['आपातकालीन', 'खतरा', 'तुरंत', 'एम्बुलेंस', '108', 'बेहोश हो गया'],
      transliterations: ['aapaatkaal', 'khatra', 'ambulance', '108'],
      isRedFlag: true
    },
    'en-IN': {
      terms: ['emergency', 'urgent', 'danger', 'immediate help', 'ambulance', '108', 'unconscious'],
      transliterations: ['emergency', 'urgent', 'ambulance', '108'],
      isRedFlag: true
    }
  },

  NUTRITION: {
    'ta-IN': {
      terms: ['ஊட்டச்சத்து', 'உணவு', 'சாப்பாடு', 'சத்துணவு', 'கீரைகள்', 'பருப்பு', 'பழங்கள்'],
      transliterations: ['oottacchathu', 'unavu', 'saappadu']
    },
    'te-IN': {
      terms: ['పోషకాహారం', 'ఆహారం', 'తిండి', 'కూరగాయలు', 'పప్పు', 'పండ్లు'],
      transliterations: ['poshakaahaaram', 'aahaaram', 'thindi']
    },
    'ml-IN': {
      terms: ['പോഷകാഹാരം', 'ഭക്ഷണം', 'ആഹാരം', 'പച്ചക്കറികൾ', 'പഴങ്ങൾ'],
      transliterations: ['poshakahaaram', 'bhakshanam', 'aahaaram']
    },
    'kn-IN': {
      terms: ['ಪೌಷ್ಟಿಕಾಂಶ', 'ಆಹಾರ', 'ಊಟ', 'ತರಕಾರಿಗಳು', 'ಹಣ್ಣುಗಳು'],
      transliterations: ['paushtikaamsha', 'aahaara', 'oota']
    },
    'hi-IN': {
      terms: ['पोषण', 'आहार', 'भोजन', 'खाना', 'हरी सब्जियां', 'फल', 'दालें'],
      transliterations: ['poshan', 'aahar', 'bhojan', 'khana']
    },
    'en-IN': {
      terms: ['nutrition', 'wholesome diet', 'healthy food', 'vegetables', 'pulses', 'balanced meal'],
      transliterations: ['nutrition', 'diet', 'healthy food']
    }
  }
};

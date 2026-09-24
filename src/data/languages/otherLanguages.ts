import { LanguageDictionary } from './tamilHealthcare';

export const malayalamDictionary: LanguageDictionary = {
  code: 'ml-IN',
  name: 'Malayalam',
  nativeName: 'മലയാളം',
  commonWords: [
    'എനിക്ക്', 'ഉണ്ട്', 'ഉള്ളത്', 'എന്റെ', 'അമ്മയ്ക്ക്', 'അച്ഛന്', 'കുട്ടിക്ക്',
    'വളരെ', 'ദിവസമായി', 'മരുന്ന്', 'കഴിച്ചു', 'ഇല്ല', 'വേണം', 'എന്താണ്',
    'ചെയ്യേണ്ടത്', 'പറയൂ', 'ശരീരത്തിൽ', 'വേദന', 'ഡോക്ടർ'
  ],
  healthcareTerms: {
    fever: ['പനി', 'ചൂട്', 'ശരീര ചൂട്', 'fever', 'പനിയാണ്'],
    cough: ['ചുമ', 'വരണ്ട ചുമ', 'cough'],
    cold: ['ജലദോഷം', 'മൂക്കൊലിപ്പ്', 'തുമ്മൽ', 'cold'],
    pain: ['വേദന', 'നടുവേദന', 'അസ്വസ്ഥത', 'pain'],
    stomach: ['വയറുവേദന', 'വയർ', 'വയറിളക്കം', 'stomach'],
    headache: ['തലവേദന', 'തല പെരുപ്പ്', 'തലകറക്കം', 'headache'],
    vomiting: ['ഛർദ്ദി', 'ഓക്കാനം', 'vomiting'],
    diarrhea: ['വയറിളക്കം', 'വയറൊഴിച്ചിൽ', 'diarrhea', 'loose motion'],
    dizziness: ['തലകറക്കം', 'ക്ഷീണം', 'കണ്ണിൽ ഇരുട്ട്', 'dizziness', 'dizzy'],
    breathing: ['ശ്വാസംമുട്ടൽ', 'ശ്വാസം എടുക്കാൻ ബുദ്ധിമുട്ട്', 'ശ്വാസമില്ലായ്മ', 'breathing', 'breathlessness'],
    chestPain: ['നെഞ്ചുവേദന', 'നെഞ്ചിൽ ഭാരം', 'chest pain'],
    bloodPressure: ['രക്തസമ്മർദ്ദം', 'ബിപി', 'പ്രഷർ', 'bp', 'blood pressure'],
    bloodSugar: ['പ്രമേഹം', 'ഷുഗർ', 'പഞ്ചസാര', 'sugar', 'diabetes'],
    medicine: ['മരുന്ന്', 'ഗുളിക', 'ടാബ്‌ലെറ്റ്', 'medicine', 'tablet'],
    doctor: ['ഡോക്ടർ', 'വൈദ്യൻ', 'doctor'],
    hospital: ['ആശുപത്രി', 'ഹോസ്പിറ്റൽ', 'ആരോഗ്യ കേന്ദ്രം', 'hospital'],
    pregnancy: ['ഗർഭം', 'ഗർഭിണി', 'മാസം', 'പ്രസവം', 'pregnant', 'pregnancy'],
    child: ['കുട്ടി', 'കുഞ്ഞ്', 'മകൻ', 'മകൾ', 'child', 'kid'],
    newborn: ['നവജാത ശിശു', 'പൈതൽ', 'മുലപ്പാൽ', 'newborn', 'infant'],
    elderly: ['പ്രായമായവർ', 'മുത്തശ്ശൻ', 'മുത്തശ്ശി', 'അപ്പൂപ്പൻ', 'elderly', 'senior'],
    emergency: ['അടിയന്തരം', 'അപകടം', 'ഉടൻ', 'emergency'],
    ambulance: ['ആംബുലൻസ്', '108', 'ambulance'],
    bleeding: ['രക്തസ്രാവം', 'ചോര വരുന്നു', 'രക്തം', 'bleeding', 'blood'],
    unconscious: ['ബോധം മറഞ്ഞു', 'ബോധക്ഷയം', 'மயங்கி', 'unconscious', 'fainted']
  },
  explicitSwitchPhrases: [
    'മലയാളത്തിൽ പറയൂ', 'മലയാളം സംസാരിക്കൂ', 'മലയാളത്തിൽ പറ', 'മലയാളം', 'speak in malayalam', 'malayalam'
  ],
  familyTerms: {
    mother: ['അമ്മ', 'മാതാവ്', 'അമ്മയ്ക്ക്', 'mother'],
    father: ['അച്ഛൻ', 'പിതാവ്', 'അച്ഛന്', 'father'],
    child: ['കുട്ടി', 'മകൻ', 'മകൾ', 'കുഞ്ഞ്', 'child'],
    baby: ['കുഞ്ഞ്', 'വാവ', 'baby'],
    husband: ['ഭർത്താവ്', 'husband'],
    wife: ['ഭാര്യ', 'wife'],
    grandparent: ['മുത്തശ്ശൻ', 'മുത്തശ്ശി', 'അപ്പൂപ്പൻ', 'അമ്മൂമ്മ', 'grandpa', 'grandma']
  }
};

export const kannadaDictionary: LanguageDictionary = {
  code: 'kn-IN',
  name: 'Kannada',
  nativeName: 'ಕನ್ನಡ',
  commonWords: [
    'ನನಗೆ', 'ಇದೆ', 'ಇರುವುದು', 'ನಮ್ಮ', 'ಅಮ್ಮನಿಗೆ', 'ಅಪ್ಪನಿಗೆ', 'ಮಗುವಿಗೆ',
    'ತುಂಬಾ', 'ದಿನಗಳಿಂದ', 'ದಿನದಿಂದ', 'ಔಷಧಿ', 'ತಗೊಂಡೆ', 'ಇಲ್ಲ', 'ಬೇಕು',
    'ಏನು', 'ಮಾಡಬೇಕು', 'ಹೇಳಿ', 'ದೇಹದಲ್ಲಿ', 'ನೋವು', 'ಡಾಕ್ಟರ್'
  ],
  healthcareTerms: {
    fever: ['ಜ್ವರ', 'ಬಿಸಿ', 'ದೇಹ ಬಿಸಿ', 'fever', 'ಜ್ವರ ಬಂದಿದೆ'],
    cough: ['ಕೆಮ್ಮು', 'ಒಣ ಕೆಮ್ಮು', 'cough'],
    cold: ['ಶೀತ', 'ನೆಗಡಿ', 'ಸೀನು', 'cold'],
    pain: ['ನೋವು', 'ಬೇನೆ', 'ಹಿಡಿತ', 'pain'],
    stomach: ['ಹೊಟ್ಟೆ ನೋವು', 'ಹೊಟ್ಟೆ', 'ಭೇದಿ', 'stomach'],
    headache: ['ತಲೆನೋವು', 'ತಲೆ ಭಾರ', 'ತಲೆತಿರುಗುವಿಕೆ', 'headache'],
    vomiting: ['ವಾಂತಿ', 'ವಾಕರಿಕೆ', 'vomiting'],
    diarrhea: ['ಭೇದಿ', 'ಹೊಟ್ಟೆ ಕೆಡುವುದು', 'diarrhea', 'loose motions'],
    dizziness: ['ತಲೆತಿರುಗುವುದು', 'ಮಂಕು', 'ದಣಿವು', 'dizziness', 'dizzy'],
    breathing: ['ಉಸಿರಾಟದ ತೊಂದರೆ', 'ಉಸಿರಾಡಲು ಕಷ್ಟ', 'ದಮ್ಮು', 'breathing', 'breathlessness'],
    chestPain: ['ಎದೆ ನೋವು', 'ಎದೆಯಲ್ಲಿ ನೋವು', 'chest pain'],
    bloodPressure: ['ರಕ್ತದೊತ್ತಡ', 'ಬಿಪಿ', 'ಪ್ರೆಷರ್', 'bp', 'blood pressure'],
    bloodSugar: ['ಸಕ್ಕರೆ ಕಾಯಿಲೆ', 'ಶುಗರ್', 'ಮಧುಮೇಹ', 'sugar', 'diabetes'],
    medicine: ['ಔಷಧ', 'ಮಾತ್ರೆ', 'ಗುಳಿಗೆ', 'medicine', 'tablet'],
    doctor: ['ವೈದ್ಯರು', 'ಡಾಕ್ಟರ್', 'ಡಾಕ್ಟರೇ', 'doctor'],
    hospital: ['ಆಸ್ಪತ್ರೆ', 'ದವಾಖಾನೆ', 'ಆರೋಗ್ಯ ಕೇಂದ್ರ', 'hospital'],
    pregnancy: ['ಗರ್ಭಿಣಿ', 'ಗರ್ಭ', 'ತಿಂಗಳು', 'ಹೆರಿಗೆ', 'pregnant', 'pregnancy'],
    child: ['ಮಗು', 'ಮಕ್ಕಳು', 'ಹುಡುಗ', 'ಹುಡುಗಿ', 'child', 'kid'],
    newborn: ['ಹುಟ್ಟಿದ ಮಗು', 'ಹಸುಗೂಸು', 'ತಾಯಿ ಹಾಲು', 'newborn', 'infant'],
    elderly: ['ಹಿರಿಯರು', 'ತಾತ', 'ಅಜ್ಜಿ', 'ವೃದ್ಧರು', 'elderly', 'senior'],
    emergency: ['ತುರ್ತು', 'ಅಪಾಯ', 'ಕೂಡಲೇ', 'emergency'],
    ambulance: ['ಆಂಬ್ಯುಲೆನ್ಸ್', '108', 'ambulance'],
    bleeding: ['ರಕ್ತಸ್ರಾವ', 'ರಕ್ತ ಸುರಿಯುತ್ತಿದೆ', 'ರಕ್ತ', 'bleeding', 'blood'],
    unconscious: ['ಪ್ರಜ್ಞೆ ತಪ್ಪಿದೆ', 'ಪ್ರಜ್ಞಾಹೀನ', 'ಬಿದ್ದು ಹೋದರು', 'unconscious', 'fainted']
  },
  explicitSwitchPhrases: [
    'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ', 'ಕನ್ನಡದಲ್ಲಿ ಹೇಳಿ', 'ಕನ್ನಡ ಮಾತನಾಡಿ', 'ಕನ್ನಡ', 'speak in kannada', 'kannada'
  ],
  familyTerms: {
    mother: ['ಅಮ್ಮ', 'ತಾಯಿ', 'ಅಮ್ಮನಿಗೆ', 'mother'],
    father: ['ಅಪ್ಪ', 'ತಂದೆ', 'ಅಪ್ಪನಿಗೆ', 'father'],
    child: ['ಮಗು', 'ಮಗ', 'ಮಗಳು', 'ಮಕ್ಕಳು', 'child'],
    baby: ['ಕೂಸು', 'ಪಾಪ', 'baby'],
    husband: ['ಗಂಡ', 'ಯಜಮಾನರು', 'husband'],
    wife: ['ಹೆಂಡತಿ', 'ಮನೆ ಮಡದಿ', 'wife'],
    grandparent: ['ತಾತ', 'ಅಜ್ಜಿ', 'grandpa', 'grandma']
  }
};

export const englishDictionary: LanguageDictionary = {
  code: 'en-IN',
  name: 'English',
  nativeName: 'English',
  commonWords: [
    'i', 'have', 'my', 'mother', 'father', 'child', 'baby', 'for', 'days',
    'since', 'medicine', 'took', 'not', 'want', 'what', 'should', 'do',
    'tell', 'me', 'body', 'pain', 'doctor', 'feeling'
  ],
  healthcareTerms: {
    fever: ['fever', 'temperature', 'high temp', 'warm', 'febrile'],
    cough: ['cough', 'coughing', 'dry cough', 'wet cough', 'phlegm'],
    cold: ['cold', 'runny nose', 'sneezing', 'congestion', 'flu'],
    pain: ['pain', 'ache', 'hurts', 'sore', 'discomfort'],
    stomach: ['stomach ache', 'belly pain', 'cramps', 'abdomen', 'gastric'],
    headache: ['headache', 'head pain', 'migraine', 'heavy head'],
    vomiting: ['vomiting', 'throwing up', 'nausea', 'nauseous', 'puking'],
    diarrhea: ['diarrhea', 'loose motions', 'watery stool', 'dysentery'],
    dizziness: ['dizziness', 'dizzy', 'faint', 'lightheaded', 'spinning'],
    breathing: ['difficulty breathing', 'breathless', 'shortness of breath', 'gasping', 'wheezing'],
    chestPain: ['chest pain', 'tightness in chest', 'heart pain', 'pressure in chest'],
    bloodPressure: ['blood pressure', 'bp', 'hypertension', 'high bp', 'low bp'],
    bloodSugar: ['blood sugar', 'glucose', 'diabetes', 'high sugar', 'diabetic'],
    medicine: ['medicine', 'tablet', 'pill', 'dose', 'medication', 'syrup'],
    doctor: ['doctor', 'physician', 'dr', 'specialist'],
    hospital: ['hospital', 'clinic', 'phc', 'health center'],
    pregnancy: ['pregnant', 'pregnancy', 'baby kicks', 'trimester', 'delivery', 'labour'],
    child: ['child', 'kid', 'son', 'daughter', 'boy', 'girl'],
    newborn: ['newborn', 'infant', 'breastfeeding', 'baby crying', 'umbilical'],
    elderly: ['elderly', 'old', 'senior', 'grandfather', 'grandmother', 'aging'],
    emergency: ['emergency', 'urgent', 'danger', 'immediate', 'serious'],
    ambulance: ['ambulance', '108', 'emergency van'],
    bleeding: ['bleeding', 'blood', 'hemorrhage', 'cut'],
    unconscious: ['unconscious', 'passed out', 'fainted', 'unresponsive', 'collapsed']
  },
  explicitSwitchPhrases: [
    'speak in english', 'talk in english', 'switch to english', 'english please', 'english'
  ],
  familyTerms: {
    mother: ['mother', 'mom', 'mum', 'amma'],
    father: ['father', 'dad', 'papa', 'appa'],
    child: ['child', 'kid', 'son', 'daughter'],
    baby: ['baby', 'infant', 'toddler'],
    husband: ['husband', 'spouse'],
    wife: ['wife', 'spouse'],
    grandparent: ['grandfather', 'grandmother', 'grandpa', 'grandma']
  }
};

export const hindiDictionary: LanguageDictionary = {
  code: 'hi-IN',
  name: 'Hindi',
  nativeName: 'हिन्दी',
  commonWords: [
    'मुझे', 'है', 'हैं', 'था', 'मेरी', 'मेरा', 'मां', 'पिताजी', 'बच्चा',
    'बहुत', 'दिनों', 'से', 'दवा', 'ली', 'नहीं', 'चाहिए', 'क्या', 'करना',
    'बताएं', 'दर्द', 'शरीर', 'डॉक्टर', 'अस्पताल', 'बुखार'
  ],
  healthcareTerms: {
    fever: ['बुखार', 'तापमान', 'गर्म', 'fever', 'ताप'],
    cough: ['खांसी', 'बलगम', 'सूखी खांसी', 'cough'],
    cold: ['जुकाम', 'सर्दी', 'छींक', 'नाक बहना', 'cold'],
    pain: ['दर्द', 'पीड़ा', 'कष्ट', 'pain'],
    stomach: ['पेट दर्द', 'पेट', 'मरोड़', 'गैस', 'stomach ache'],
    headache: ['सिरदर्द', 'सिर में दर्द', 'माथा दर्द', 'headache'],
    vomiting: ['उल्टी', 'जी मिचलाना', 'मतली', 'vomiting'],
    diarrhea: ['दस्त', 'पेट खराब', 'पतले दस्त', 'diarrhea', 'loose motion'],
    dizziness: ['चक्कर', 'कमजोरी', 'बेहोशी', 'dizziness'],
    breathing: ['सांस लेने में तकलीफ', 'सांस फूलना', 'दम घुटना', 'breathing problem'],
    chestPain: ['सीने में दर्द', 'छाती में दर्द', 'हार्ट', 'chest pain'],
    bloodPressure: ['ब्लड प्रेशर', 'बीपी', 'रक्तचाप', 'bp'],
    bloodSugar: ['शुगर', 'डायबिटीज', 'मधुमेह', 'sugar'],
    medicine: ['दवा', 'दवाई', 'गोली', 'कैप्सूल', 'medicine', 'tablet'],
    doctor: ['डॉक्टर', 'वैद्य', 'चिकित्सक', 'doctor'],
    hospital: ['अस्पताल', 'हॉस्पिटल', 'स्वास्थ्य केंद्र', 'hospital'],
    pregnancy: ['गर्भावस्था', 'गर्भवती', 'प्रसव', 'pregnant', 'pregnancy'],
    child: ['बच्चा', 'बच्ची', 'बेटा', 'बेटी', 'बालक', 'child'],
    newborn: ['नवजात', 'शिशु', 'छोटा बच्चा', 'newborn'],
    elderly: ['बुजुर्ग', 'वृद्ध', 'दादा', 'दादी', 'नाना', 'नानी', 'elderly'],
    emergency: ['आपातकाल', 'इमरजेंसी', 'खतरा', 'तुरंत', 'emergency'],
    ambulance: ['एम्बुलेंस', '108', 'ambulance'],
    bleeding: ['खून बहना', 'रक्तस्राव', 'चोट', 'bleeding'],
    unconscious: ['बेहोश', 'मूर्छित', 'अचेत', 'unconscious']
  },
  explicitSwitchPhrases: [
    'हिंदी में बोलो', 'हिंदी में बात करो', 'हिंदी', 'speak in hindi', 'switch to hindi', 'hindi'
  ],
  familyTerms: {
    mother: ['मां', 'माताजी', 'अम्मी', 'mother'],
    father: ['पिताजी', 'पापा', 'बाबूजी', 'father'],
    child: ['बच्चा', 'बेटा', 'बेटी', 'child'],
    baby: ['शिशु', 'छोटा बच्चा', 'baby'],
    husband: ['पति', 'husband'],
    wife: ['पत्नी', 'wife'],
    grandparent: ['दादाजी', 'दादीजी', 'नानाजी', 'नानीजी', 'grandpa', 'grandma']
  }
};


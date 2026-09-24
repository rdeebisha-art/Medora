export interface LanguageDictionary {
  code: 'ta-IN' | 'te-IN' | 'ml-IN' | 'kn-IN' | 'en-IN' | 'hi-IN';
  name: string;
  nativeName: string;
  commonWords: string[];
  healthcareTerms: {
    fever: string[];
    cough: string[];
    cold: string[];
    pain: string[];
    stomach: string[];
    headache: string[];
    vomiting: string[];
    diarrhea: string[];
    dizziness: string[];
    breathing: string[];
    chestPain: string[];
    bloodPressure: string[];
    bloodSugar: string[];
    medicine: string[];
    doctor: string[];
    hospital: string[];
    pregnancy: string[];
    child: string[];
    newborn: string[];
    elderly: string[];
    emergency: string[];
    ambulance: string[];
    bleeding: string[];
    unconscious: string[];
  };
  explicitSwitchPhrases: string[];
  familyTerms: {
    mother: string[];
    father: string[];
    child: string[];
    baby: string[];
    husband: string[];
    wife: string[];
    grandparent: string[];
  };
}

export const tamilDictionary: LanguageDictionary = {
  code: 'ta-IN',
  name: 'Tamil',
  nativeName: 'தமிழ்',
  commonWords: [
    'எனக்கு', 'இருக்கிறது', 'இருக்கு', 'உள்ளது', 'என்', 'அம்மாவுக்கு', 'அப்பாவுக்கு',
    'குழந்தைக்கு', 'ரொம்ப', 'நாளாக', 'நாட்களாக', 'மருந்து', 'சாப்பிட்டேன்', 'இல்லை',
    'வேண்டும்', 'என்ன', 'செய்வது', 'சொல்லுங்கள்', 'உடம்பு', 'வலி', 'பார்க்க', 'டாக்டர்'
  ],
  healthcareTerms: {
    fever: ['காய்ச்சல்', 'சுரம்', 'உடம்பு சூடு', 'fever', 'காய்ச்சலா'],
    cough: ['இருமல்', 'சளி இருமல்', 'இருமுவது', 'cough'],
    cold: ['சளி', 'மூக்கொழுகுதல்', 'தும்மல்', 'ஜலதோஷம்', 'cold'],
    pain: ['வலி', 'வலிக்குது', 'வேதனை', 'உளைச்சல்', 'pain'],
    stomach: ['வயிறு', 'வயிற்று வலி', 'வயிற்றுப்போக்கு', 'stomach'],
    headache: ['தலைவலி', 'தலை பாரம்', 'தலை சுற்றல்', 'headache'],
    vomiting: ['வாந்தி', 'குமட்டல்', 'வாந்தி வருது', 'vomiting'],
    diarrhea: ['வயிற்றுப்போக்கு', 'பேதி', 'வயிற்றோட்டம்', 'diarrhea', 'loose motion'],
    dizziness: ['மயக்கம்', 'தலைசுற்றல்', 'கண் இருட்டுவது', 'dizziness', 'dizzy'],
    breathing: ['மூச்சு விட கஷ்டம்', 'மூச்சுத்திணறல்', 'மூச்சு வாங்குகிறது', 'இளைப்பு', 'breathing', 'breathless'],
    chestPain: ['நெஞ்சு வலி', 'நெஞ்சு பாரம்', 'மார்பு வலி', 'chest pain'],
    bloodPressure: ['ரத்த அழுத்தம்', 'பிபி', 'இரத்தக் கொதிப்பு', 'bp', 'blood pressure'],
    bloodSugar: ['சர்க்கரை', 'சுகர்', 'நீரிழிவு', 'sugar', 'diabetes'],
    medicine: ['மருந்து', 'மாத்திரை', 'டேப்லெட்', 'மருந்துகள்', 'medicine', 'tablet'],
    doctor: ['டாக்டர்', 'மருத்துவர்', 'வைத்தியர்', 'doctor'],
    hospital: ['மருத்துவமனை', 'ஆஸ்பத்திரி', 'சுகாதார நிலையம்', 'hospital'],
    pregnancy: ['கர்ப்பம்', 'கர்ப்பிணி', 'வயிற்றில் குழந்தை', 'மாதம்', 'பிரசவம்', 'pregnant', 'pregnancy'],
    child: ['குழந்தை', 'பையன்', 'பொண்ணு', 'பாப்பா', 'child', 'kid'],
    newborn: ['பிறந்த குழந்தை', 'பச்சிளம் குழந்தை', 'பாலூட்டுதல்', 'newborn', 'infant'],
    elderly: ['முதியவர்', 'தாத்தா', 'பாட்டி', 'வயதானவர்', 'elderly', 'senior'],
    emergency: ['அவசரம்', 'ஆபத்து', 'உடனே', 'சீரியஸ்', 'emergency'],
    ambulance: ['ஆம்புலன்ஸ்', '108', 'அவசர ஊர்தி', 'ambulance'],
    bleeding: ['ரத்தப்போக்கு', 'இரத்தம் வருகிறது', 'ரத்தம் கொட்டுது', 'bleeding', 'blood'],
    unconscious: ['மயங்கி விழுந்தார்', 'நினைவில்லை', 'சுயநினைவு இல்லை', 'unconscious', 'fainted']
  },
  explicitSwitchPhrases: [
    'தமிழில் பேசுங்கள்', 'தமிழ் பேசு', 'தமிழில் சொல்லு', 'தமிழ்', 'speak in tamil', 'tamil'
  ],
  familyTerms: {
    mother: ['அம்மா', 'தாய்', 'அம்மாவுக்கு', 'mother'],
    father: ['அப்பா', 'தந்தை', 'அப்பாவுக்கு', 'father'],
    child: ['குழந்தை', 'மகன்', 'மகள்', 'பாப்பா', 'child'],
    baby: ['பாப்பா', 'குழந்தை', 'baby'],
    husband: ['கணவர்', 'வீட்டுக்காரர்', 'husband'],
    wife: ['மனைவி', 'சம்சாரம்', 'wife'],
    grandparent: ['தாத்தா', 'பாட்டி', 'grandpa', 'grandma']
  }
};

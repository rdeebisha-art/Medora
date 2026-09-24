import { LanguageDictionary } from './tamilHealthcare';

export const teluguDictionary: LanguageDictionary = {
  code: 'te-IN',
  name: 'Telugu',
  nativeName: 'తెలుగు',
  commonWords: [
    'నాకు', 'ఉంది', 'ఉన్నది', 'మా', 'అమ్మకి', 'నాన్నకి', 'బాబుకి', 'పాపకి',
    'చాలా', 'రోజుల నుండి', 'రోజులుగా', 'మందులు', 'వేసుకున్నాను', 'లేదు',
    'కావాలి', 'ఏమి', 'చేయాలి', 'చెప్పండి', 'ఒంట్లో', 'నొప్పి', 'డాక్టర్'
  ],
  healthcareTerms: {
    fever: ['జ్వరం', 'ఒళ్ళు వెచ్చగా', 'వేడి', 'fever', 'జ్వరంగా'],
    cough: ['దగ్గు', 'పొడి దగ్గు', 'cough'],
    cold: ['జలుబు', 'ముక్కు కారడం', 'తుమ్ములు', 'cold'],
    pain: ['నొప్పి', 'పోటు', 'నొప్పులు', 'pain'],
    stomach: ['కడుపు', 'కడుపు నొప్పి', 'విరేచనాలు', 'stomach'],
    headache: ['తలనొప్పి', 'తల బరువు', 'తల తిరుగుడు', 'headache'],
    vomiting: ['వాంతులు', 'వికారం', 'వాంతి', 'vomiting'],
    diarrhea: ['విరేచనాలు', 'మోషన్స్', 'కడుపు కదలిక', 'diarrhea', 'loose motions'],
    dizziness: ['కళ్ళు తిరగడం', 'తలతిరుగుడు', 'నీరసం', 'dizziness', 'dizzy'],
    breathing: ['శ్వాస తీసుకోవడం కష్టం', 'ఆయాసం', 'ఊపిరాడట్లేదు', 'breathing', 'breathlessness'],
    chestPain: ['గుండె నొప్పి', 'ఛాతీ నొప్పి', 'రొమ్ము నొప్పి', 'chest pain'],
    bloodPressure: ['రక్తపోటు', 'బీపీ', 'బిపి', 'bp', 'blood pressure'],
    bloodSugar: ['షుగర్', 'మధుమేహం', 'చక్కెర', 'sugar', 'diabetes'],
    medicine: ['మందులు', 'మాత్రలు', 'టాబ్లెట్', 'ట్యాబ్లెట్', 'medicine', 'tablet'],
    doctor: ['డాక్టర్', 'వైద్యుడు', 'డాక్టరు', 'doctor'],
    hospital: ['ఆసుపత్రి', 'హాస్పిటల్', 'దవాఖానా', 'hospital'],
    pregnancy: ['గర్భం', 'గర్భిణి', 'కడుపుతో', 'నెలలు', 'ప్రసవం', 'pregnant', 'pregnancy'],
    child: ['పిల్లలు', 'బాబు', 'పాప', 'పిల్లాడు', 'child', 'kid'],
    newborn: ['పుట్టిన బిడ్డ', 'పసిపిల్ల', 'తల్లి పాలు', 'newborn', 'infant'],
    elderly: ['వృద్ధులు', 'తాతయ్య', 'నానమ్మ', 'అమ్మమ్మ', 'పెద్దవారు', 'elderly', 'senior'],
    emergency: ['అత్యవసరం', 'ప్రమాదం', 'వెంటనే', 'emergency'],
    ambulance: ['అంబులెన్స్', '108', 'వాహనం', 'ambulance'],
    bleeding: ['రక్తస్రావం', 'రక్తం కారుతోంది', 'రక్తం', 'bleeding', 'blood'],
    unconscious: ['స్పృహ తప్పడం', 'కళ్ళు తిరిగి పడిపోవడం', 'తెలివి లేదు', 'unconscious', 'fainted']
  },
  explicitSwitchPhrases: [
    'తెలుగులో మాట్లాడండి', 'తెలుగు మాట్లాడు', 'తెలుగులో చెప్పు', 'తెలుగు', 'speak in telugu', 'telugu'
  ],
  familyTerms: {
    mother: ['అమ్మ', 'తల్లి', 'అమ్మకి', 'mother'],
    father: ['నాన్న', 'తండ్రి', 'నాన్నకి', 'father'],
    child: ['బాబు', 'పాప', 'పిల్లలు', 'కొడుకు', 'కూతురు', 'child'],
    baby: ['చిన్నారి', 'బిడ్డ', 'పాప', 'baby'],
    husband: ['భర్త', 'ఆయన', 'husband'],
    wife: ['భార్య', 'ఆమె', 'wife'],
    grandparent: ['తాతయ్య', 'నానమ్మ', 'అమ్మమ్మ', 'grandpa', 'grandma']
  }
};

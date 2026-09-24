import { MedicineGuideline } from '../types';
import { MEDICAL_SOURCES } from '../sources/sourceRegistry';

export const MEDICINE_SAFETY_DISCLAIMER = {
  en: 'Medication-specific advice requires a healthcare professional. Never stop, increase, decrease, or replace prescribed medicine on your own.',
  hi: 'दवा से संबंधित विशिष्ट सलाह के लिए स्वास्थ्य पेशेवर (डॉक्टर) से परामर्श अनिवार्य है। अपनी मर्जी से निर्धारित दवा कभी बंद न करें और न ही खुराक बदलें।',
  ta: 'மருந்து தொடர்பான குறிப்பிட்ட ஆலோசனைகளுக்கு தகுதியான மருத்துவரை அணுக வேண்டும். மருத்துவர் பரிந்துரைத்த மருந்தை சுயமாக நிறுத்தவோ, அளவை மாற்றவோ கூடாது.',
  te: 'మందులకు సంబంధించిన నిర్దిష్ట సలహాల కోసం వైద్యుడిని సంప్రదించాలి. సూచించిన మందులను మీ స్వంతంగా ఆపడం లేదా మోతాదు మార్చడం చేయవద్దు.',
  ml: 'മരുന്നുകളെക്കുറിച്ചുള്ള കൃത്യമായ വിവരങ്ങൾക്ക് ആരോഗ്യ പ്രവർത്തകരെ സമീപിക്കുക. നിർദ്ദേശിച്ച മരുന്നുകൾ സ്വയം നിർത്തുകയോ അളവ് മാറ്റുകയോ ചെയ്യരുത്.',
  kn: 'ಔಷಧಿ ಸಂಬಂಧಿತ ನಿರ್ದಿಷ್ಟ ಸಲಹೆಗೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸುವುದು ಕಡ್ಡಾಯ. ವೈದ್ಯರು ಸೂಚಿಸಿದ ಔಷಧಿಯನ್ನು ನಿಮ್ಮಿಷ್ಟದಂತೆ ನಿಲ್ಲಿಸಬೇಡಿ ಅಥವಾ ಪ್ರಮಾಣ ಬದಲಾಯಿಸಬೇಡಿ.'
};

export const VERIFIED_MEDICINE_GUIDELINES: Record<string, MedicineGuideline> = {
  PARACETAMOL: {
    id: 'PARACETAMOL',
    genericName: 'Paracetamol (Acetaminophen)',
    category: 'Antipyretic & Mild Analgesic',
    generalIndications: {
      en: 'Symptomatic relief of mild to moderate fever and body ache.',
      hi: 'हल्के से मध्यम बुखार और बदन दर्द में राहत के लिए।',
      ta: 'மிதமான காய்ச்சல் மற்றும் உடல் வலியை தணிக்க.',
      te: 'సాధారణ జ్వరం మరియు ఒంటి నొప్పుల ఉపశమనం కోసం.',
      ml: 'പനിയും ശരീരവേദനയും കുറയ്ക്കാൻ.',
      kn: 'ಜ್ವರ ಮತ್ತು ಮೈಕೈ ನೋವಿನ ಶಮನಕ್ಕಾಗಿ.'
    },
    prescribingWarning: {
      en: 'Do not exceed maximum daily dose (4000mg in adults; pediatric dosing requires weight-based doctor calculation: 10-15mg/kg). Do not combine multiple cold medications containing paracetamol.',
      hi: 'वयस्क 24 घंटे में 4000mg से अधिक न लें। बच्चों में वजन के अनुसार डॉक्टर से खुराक पूछें।',
      ta: 'பெரியவர்கள் ஒரு நாளில் 4000mgக்கு மேல் எடுக்கக் கூடாது. குழந்தைகளுக்கு எடையின்படி மருத்துவர் பரிந்துரை தேவை.',
      te: 'రోజులో 4000mg మించకూడదు. పిల్లలకు బరువు ఆధారంగా డాక్టర్ నిర్ణయించాలి.',
      ml: 'മുതിർന്നവർ പ്രതിദിനം 4000 മില്ലിഗ്രാമിൽ കൂടുതൽ കഴിക്കരുത്.',
      kn: 'ದಿನಕ್ಕೆ 4000mg ಗಿಂತ ಹೆಚ್ಚು ಸೇವಿಸಬೇಡಿ. ಮಕ್ಕಳಿಗೆ ತೂಕದ ಆಧಾರದ ಮೇಲೆ ವೈದ್ಯರು ನಿರ್ಧರಿಸಬೇಕು.'
    },
    commonContraindications: [
      {
        en: 'Severe active liver disease or known hypersensitivity to paracetamol.',
        hi: 'गंभीर लिवर रोग या पैरासिटामोल से एलर्जी।',
        ta: 'தீவிர கல்லீரல் பாதிப்பு உள்ளவர்கள்.',
        te: 'తీవ్రమైన కాలేయ వ్యాధులు ఉన్నవారు.',
        ml: 'ഗുരുതരമായ കരൾ രോഗമുള്ളവർ.',
        kn: 'ತೀವ್ರ ಯಕೃತ್ತಿನ ಕಾಯಿಲೆ ಇರುವವರು.'
      }
    ],
    monitoringGuidance: [
      {
        en: 'If fever persists beyond 3 days despite paracetamol, consult PHC doctor for malaria/dengue/bacterial diagnostic evaluation.',
        hi: '3 दिन बाद भी बुखार रहने पर मलेरिया या डेंगू की जांच कराएं।',
        ta: '3 நாட்களுக்கு மேல் காய்ச்சல் நீடித்தால் மலேரியா அல்லது டெங்கு பரிசோதனை அவசியம்.',
        te: '3 రోజులు దాటినా జ్వరం తగ్గకపోతే రక్త పరీక్షలు చేయించాలి.',
        ml: '3 ദിവസത്തിൽ കൂടുതൽ പനി നീണ്ടുനിന്നാൽ ഡോക്ടറെ കാണുക.',
        kn: '3 ದಿನಗಳ ನಂತರವೂ ಜ್ವರ ಮುಂದುವರಿದರೆ ರಕ್ತ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ.'
      }
    ],
    safetyRules: {
      neverStopPrescribed: false,
      neverDoubleDose: true,
      requirePrescription: false,
      requireDiagnosticConfirmation: false
    },
    sources: [MEDICAL_SOURCES.WHO_ESSENTIAL_MEDS]
  },
  ORS_ZINC: {
    id: 'ORS_ZINC',
    genericName: 'Oral Rehydration Salts (WHO Formula) + Zinc Sulfate',
    category: 'Electrolyte Replacement & Diarrhea Management',
    generalIndications: {
      en: 'Prevention and treatment of dehydration from acute diarrhea. Zinc reduces diarrhea duration and prevents recurrence for 2-3 months.',
      hi: 'दस्त में पानी की कमी रोकने और इलाज के लिए। जिंक दस्त की अवधि कम करता है।',
      ta: 'வயிற்றுப்போக்கால் ஏற்படும் நீர் இழப்பை தடுக்கவும், மீண்டும் வராமல் காக்கவும்.',
      te: 'విరేచనాల వల్ల శరీరంలో నీరు తగ్గకుండా కాపాడటానికి.',
      ml: 'വയറിളക്കം മൂലമുണ്ടാകുന്ന നിർജ്ജലീകരണം തടയാൻ.',
      kn: 'ಅತಿಸಾರದಿಂದ ದೇಹದಲ್ಲಿ ನೀರಿನ ಕೊರತೆ ತಡೆಯಲು ಮತ್ತು ಗುಣಪಡಿಸಲು.'
    },
    prescribingWarning: {
      en: 'Mix 1 complete packet of ORS in exactly 1 litre of clean boiled and cooled drinking water. Zinc tablets: 20mg daily for 14 days (10mg in infants <6 months).',
      hi: '1 पैकेट ओआरएस को पूरे 1 लीटर साफ पानी में ही घोलें। जिंक की गोली 14 दिनों तक रोजाना दें।',
      ta: '1 பாக்கெட் ஓஆர்எஸ் பொடியை சரியாக 1 லிட்டர் தண்ணீரில் கரைக்கவும். ஜிங்க் மாத்திரையை 14 நாட்கள் கொடுக்கவும்.',
      te: '1 ప్యాకెట్ ఓఆర్ఎస్ ను సరిగ్గా 1 లీటరు నీటిలో కలపాలి. జింక్ మాత్రలను 14 రోజులు ఇవ్వాలి.',
      ml: '1 പാക്കറ്റ് ഒആർഎസ് കൃത്യം 1 ലിറ്റർ വെള്ളത്തിൽ കലക്കുക. 14 ദിവസം സിങ്ക് നൽകുക.',
      kn: '1 ಪ್ಯಾಕೆಟ್ ಓಆರ್‌ಎಸ್ ಪುಡಿಯನ್ನು ನಿಖರವಾಗಿ 1 ಲೀಟರ್ ನೀರಿನಲ್ಲಿ ಕರಗಿಸಿ. ಜಿಂಕ್ ಮಾತ್ರೆ 14 ದಿನ ನೀಡಿ.'
    },
    commonContraindications: [
      {
        en: 'Intractable vomiting preventing any fluid retention, or acute paralytic ileus.',
        hi: 'लगातार उल्टी जिसमें एक बूंद पानी भी पेट में न रुके।',
        ta: 'ஒரு துளி நீரும் நிற்காமல் தொடர்ந்து வாந்தியாகும் நிலை.',
        te: 'నీరు కూడా తాగలేని విధంగా తీవ్ర వాంతులు.',
        ml: 'വെള്ളം പോലും കുടിക്കാൻ പറ്റാത്ത അവസ്ഥ.',
        kn: 'ನೀರೂ ಸಹ ನಿಲ್ಲದಂತೆ ತೀವ್ರ ವಾಂತಿಯಾಗುವುದು.'
      }
    ],
    monitoringGuidance: [
      {
        en: 'Monitor frequency of urination and alertness. Seek hospital care if child becomes lethargic or blood appears in stool.',
        hi: 'पेशाब की मात्रा और बच्चे की सतर्कता देखें। शौच में खून आने पर तुरंत अस्पताल जाएं।',
        ta: 'சிறுநீர் வெளியேற்றம் மற்றும் குழந்தையின் சுறுசுறுப்பை கவனிக்கவும்.',
        te: 'మూత్ర విసర్జన మరియు చురుకుదనం గమనించండి.',
        ml: 'മൂത്രത്തിന്റെ അളവ് നിരീക്ഷിക്കുക.',
        kn: 'ಮೂತ್ರದ ಪ್ರಮಾಣ ಮತ್ತು ಮಗುವಿನ ಚಟುವಟಿಕೆ ಗಮನಿಸಿ.'
      }
    ],
    safetyRules: {
      neverStopPrescribed: false,
      neverDoubleDose: false,
      requirePrescription: false,
      requireDiagnosticConfirmation: false
    },
    sources: [MEDICAL_SOURCES.WHO_DIARRHOEA_ORS]
  }
};

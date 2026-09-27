import { SupportedLanguageCode } from '../../data/languages';
import { toBridgeLang, BridgeLang } from './langMap';
import { extractProtectedTokens, restoreProtectedTokens } from './tokenPreserver';
import {
  protectMedicalValues,
  restoreMedicalValues,
  validatePreservedMedicalValues,
} from '../medicalSafety/medicalValueProtection';

export interface GeneralTranslationResult {
  sourceText: string;
  sourceLang: SupportedLanguageCode;
  targetLang: SupportedLanguageCode;
  translatedText: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  engine: 'rule-compositional' | 'phrase-library' | 'online-gemini' | 'dictionary';
  preservedNumbers: string[];
  isVerified: boolean;
  notes?: string;
}

// Multilingual Semantic Lexicon for Compositional Sentence Translation
interface SemanticItem {
  en: string[];
  ta: string[];
  te: string[];
  hi: string[];
  ml: string[];
  kn: string[];
  primary: Record<BridgeLang, string>;
}

const PRONOUN_MAP: SemanticItem[] = [
  {
    en: ['i have had', 'i have', 'i am having', 'i got', 'i feel', 'i am suffering from'],
    ta: ['எனக்கு', 'நான்'],
    te: ['నాకు', 'నేను'],
    hi: ['मुझे', 'मैं'],
    ml: ['എനിക്ക്', 'ഞാൻ'],
    kn: ['ನನಗೆ', 'ನಾನು'],
    primary: { en: 'I have', ta: 'எனக்கு', te: 'నాకు', hi: 'मुझे', ml: 'എനിക്ക്', kn: 'ನನಗೆ' },
  },
  {
    en: ['my child has', 'my baby has', 'child has'],
    ta: ['என் குழந்தைக்கு', 'என் பிள்ளைக்கு'],
    te: ['నా బిడ్డకు', 'నా పాపకు'],
    hi: ['मेरे बच्चे को', 'मेरे शिशु को'],
    ml: ['എന്റെ കുട്ടിക്ക്', 'കുഞ്ഞിന്'],
    kn: ['ನನ್ನ ಮಗುವಿಗೆ'],
    primary: { en: 'My child has', ta: 'என் குழந்தைக்கு', te: 'నా బిడ్డకు', hi: 'मेरे बच्चे को', ml: 'എന്റെ കുട്ടിക്ക്', kn: 'ನನ್ನ ಮಗುವಿಗೆ' },
  },
  {
    en: ['my mother has'],
    ta: ['என் தாய்க்கு', 'என் அம்மாவுக்கு'],
    te: ['మా అమ్మకు'],
    hi: ['मेरी माँ को'],
    ml: ['എന്റെ അമ്മയ്ക്ക്'],
    kn: ['ನನ್ನ ತಾಯಿಗೆ'],
    primary: { en: 'My mother has', ta: 'என் அம்மாவுக்கு', te: 'మా అమ్మకు', hi: 'मेरी माँ को', ml: 'എന്റെ അമ്മയ്ക്ക്', kn: 'ನನ್ನ ತಾಯಿಗೆ' },
  },
  {
    en: ['my father has'],
    ta: ['என் தந்தைக்கு', 'என் அப்பாவுக்கு'],
    te: ['మా నాన్నకు'],
    hi: ['मेरे पिता को'],
    ml: ['എന്റെ അച്ഛന്'],
    kn: ['ನನ್ನ ತಂದೆಗೆ'],
    primary: { en: 'My father has', ta: 'என் அப்பாவுக்கு', te: 'మా నాన్నకు', hi: 'मेरे पिता को', ml: 'എന്റെ അച്ഛന്', kn: 'ನನ್ನ ತಂದೆಗೆ' },
  },
];

const TIME_EXPRESSIONS: SemanticItem[] = [
  {
    en: ['since yesterday', 'from yesterday', 'starting yesterday'],
    ta: ['நேற்று முதல்', 'நேற்றிலிருந்து'],
    te: ['నిన్నటి నుండి', 'నిన్నటినుంచి'],
    hi: ['कल से', 'बीते कल से'],
    ml: ['ഇന്നലെ മുതൽ'],
    kn: ['ನಿನ್ನೆಯಿಂದ'],
    primary: { en: 'since yesterday', ta: 'நேற்று முதல்', te: 'నిన్నటి నుండి', hi: 'कल से', ml: 'ഇന്നലെ മുതൽ', kn: 'ನಿನ್ನೆಯಿಂದ' },
  },
  {
    en: ['yesterday'],
    ta: ['நேற்று'],
    te: ['నిన్న'],
    hi: ['कल'],
    ml: ['ഇന്നലെ'],
    kn: ['ನಿನ್ನೆ'],
    primary: { en: 'yesterday', ta: 'நேற்று', te: 'నిన్న', hi: 'कल', ml: 'ഇന്നലെ', kn: 'ನಿನ್ನೆ' },
  },
  {
    en: ['since morning', 'from morning'],
    ta: ['காலையிலிருந்து', 'காலை முதல்'],
    te: ['ఉదయం నుండి', 'ఉదయంనుంచి'],
    hi: ['सुबह से'],
    ml: ['രാവിലെ മുതൽ'],
    kn: ['ಬೆಳಿಗ್ಗೆಯಿಂದ'],
    primary: { en: 'since morning', ta: 'காலையிலிருந்து', te: 'ఉదయం నుండి', hi: 'सुबह से', ml: 'രാവിലെ മുതൽ', kn: 'ಬೆಳಿಗ್ಗೆಯಿಂದ' },
  },
  {
    en: ['since last night', 'from last night'],
    ta: ['நேற்று இரவு முதல்', 'இரவிலிருந்து'],
    te: ['నిన్న రాత్రి నుండి'],
    hi: ['कल रात से'],
    ml: ['ഇന്നലെ രാത്രി മുതൽ'],
    kn: ['ನಿನ್ನೆ ರಾತ್ರಿಯಿಂದ'],
    primary: { en: 'since last night', ta: 'நேற்று இரவு முதல்', te: 'నిన్న రాత్రి నుండి', hi: 'कल रात से', ml: 'ഇന്നലെ രാത്രി മുതൽ', kn: 'ನಿನ್ನೆ ರಾತ್ರಿಯಿಂದ' },
  },
  {
    en: ['today'],
    ta: ['இன்று'],
    te: ['ఈరోజు'],
    hi: ['आज'],
    ml: ['ഇന്ന്'],
    kn: ['ಇಂದು'],
    primary: { en: 'today', ta: 'இன்று', te: 'ఈరోజు', hi: 'आज', ml: 'ഇന്ന്', kn: 'ಇಂದು' },
  },
  {
    en: ['tomorrow'],
    ta: ['நாளை'],
    te: ['రేపు'],
    hi: ['कल (आने वाला)'],
    ml: ['നാളെ'],
    kn: ['ನಾಳೆ'],
    primary: { en: 'tomorrow', ta: 'நாளை', te: 'రేపు', hi: 'कल', ml: 'നാളെ', kn: 'ನಾಳೆ' },
  },
];

const SYMPTOM_LEXICON: SemanticItem[] = [
  {
    en: ['headache', 'head ache', 'pain in head'],
    ta: ['தலைவலி'],
    te: ['తలనొప్పి'],
    hi: ['सिरदर्द', 'सिर में दर्द'],
    ml: ['തലവേദന'],
    kn: ['ತಲೆನೋವು'],
    primary: { en: 'headache', ta: 'தலைவலி', te: 'తలనొప్పి', hi: 'सिरदर्द', ml: 'തലവേദന', kn: 'ತಲೆನೋವು' },
  },
  {
    en: ['fever', 'high fever', 'temperature'],
    ta: ['காய்ச்சல்'],
    te: ['జ్వరం'],
    hi: ['बुखार'],
    ml: ['പനി'],
    kn: ['ಜ್ವರ'],
    primary: { en: 'fever', ta: 'காய்ச்சல்', te: 'జ్వరం', hi: 'बुखार', ml: 'പനി', kn: 'ಜ್ವರ' },
  },
  {
    en: ['cough', 'dry cough', 'coughing'],
    ta: ['இருமல்'],
    te: ['దగ్గు'],
    hi: ['खांसी'],
    ml: ['ചുമ'],
    kn: ['ಕೆಮ್ಮು'],
    primary: { en: 'cough', ta: 'இருமல்', te: 'దగ్గు', hi: 'खांसी', ml: 'ചുമ', kn: 'ಕೆಮ್ಮು' },
  },
  {
    en: ['cold', 'runny nose'],
    ta: ['சளி'],
    te: ['జలుబు'],
    hi: ['जुकाम', 'सर्दी'],
    ml: ['ജലദോഷം'],
    kn: ['ಶೀತ'],
    primary: { en: 'cold', ta: 'சளி', te: 'జలుబు', hi: 'जुकाम', ml: 'ജലദോഷം', kn: 'ಶೀತ' },
  },
  {
    en: ['stomach pain', 'stomach ache', 'abdominal pain', 'belly pain'],
    ta: ['வயிற்று வலி', 'வயிறு வலி'],
    te: ['కడుపు నొప్పి'],
    hi: ['पेट दर्द', 'पेट में दर्द'],
    ml: ['വയറുവേദന'],
    kn: ['ಹೊಟ್ಟೆ ನೋವು'],
    primary: { en: 'stomach pain', ta: 'வயிற்று வலி', te: 'కడుపు నొప్పి', hi: 'पेट दर्द', ml: 'വയറുവേദന', kn: 'ಹೊಟ್ಟೆ ನೋವು' },
  },
  {
    en: ['chest pain', 'pain in chest'],
    ta: ['நெஞ்சு வலி'],
    te: ['ఛాతీ నొప్పి'],
    hi: ['सीने में दर्द'],
    ml: ['നെഞ്ചുവേദന'],
    kn: ['ಎದೆ ನೋವು'],
    primary: { en: 'chest pain', ta: 'நெஞ்சு வலி', te: 'ఛాతీ నొప్పి', hi: 'सीने में दर्द', ml: 'നെഞ്ചുവേദന', kn: 'ಎದೆ ನೋವು' },
  },
  {
    en: ['breathing difficulty', 'difficulty breathing', 'shortness of breath', 'breathlessness'],
    ta: ['மூச்சுத்திணறல்', 'மூச்சு விட சிரமம்'],
    te: ['శ్వాస తీసుకోవడంలో ఇబ్బంది', 'ఆయాసం'],
    hi: ['सांस लेने में कठिनाई', 'सांस फूलना'],
    ml: ['ശ്വാസതടസ്സം'],
    kn: ['ಉಸಿರಾಟದ ತೊಂದರೆ'],
    primary: { en: 'difficulty breathing', ta: 'மூச்சுத்திணறல்', te: 'శ్వాస తీసుకోవడంలో ఇబ్బంది', hi: 'सांस लेने में कठिनाई', ml: 'ശ്വാസതടസ്സം', kn: 'ಉಸಿರಾಟದ ತೊಂದರೆ' },
  },
  {
    en: ['vomiting', 'throwing up', 'vomit'],
    ta: ['வாந்தி'],
    te: ['వాంతులు'],
    hi: ['उल्टी'],
    ml: ['ഛർദ്ദി'],
    kn: ['ವಾಂತಿ'],
    primary: { en: 'vomiting', ta: 'வாந்தி', te: 'వాంతులు', hi: 'उल्टी', ml: 'ഛർദ്ദി', kn: 'ವಾಂತಿ' },
  },
  {
    en: ['diarrhea', 'loose motion', 'loose stools'],
    ta: ['வயிற்றுப்போக்கு'],
    te: ['విరేచనాలు'],
    hi: ['दस्त'],
    ml: ['വയറിളക്കം'],
    kn: ['ಭೇದಿ'],
    primary: { en: 'diarrhea', ta: 'வயிற்றுப்போக்கு', te: 'విరేచనాలు', hi: 'दस्त', ml: 'വയറിളക്കം', kn: 'ಭೇದಿ' },
  },
  {
    en: ['dizziness', 'dizzy', 'giddiness', 'fainting'],
    ta: ['தலைச்சுற்றல்', 'மயக்கம்'],
    te: ['కళ్ళు తిరగడం', 'తలతిరగడం'],
    hi: ['चक्कर आना', 'बेहोशी'],
    ml: ['തലകറക്കം'],
    kn: ['ತಲೆತಿರುಗುವಿಕೆ'],
    primary: { en: 'dizziness', ta: 'தலைச்சுற்றல்', te: 'కళ్ళు తిరగడం', hi: 'चक्कर आना', ml: 'തലകറക്കം', kn: 'ತಲೆತಿರುಗುವಿಕೆ' },
  },
  {
    en: ['body pain', 'body ache'],
    ta: ['உடல் வலி'],
    te: ['ఒంటి నొప్పులు', 'శరీర నొప్పి'],
    hi: ['बदन दर्द', 'शरीर में दर्द'],
    ml: ['ശരീരവേദന'],
    kn: ['ಮೈಕೈ ನೋವು'],
    primary: { en: 'body pain', ta: 'உடல் வலி', te: 'ఒంటి నొప్పులు', hi: 'बदन दर्द', ml: 'ശരീരവേദന', kn: 'ಮೈಕೈ ನೋವು' },
  },
  {
    en: ['throat pain', 'sore throat', 'throat infection'],
    ta: ['தொண்டை வலி'],
    te: ['గొంతు నొప్పి'],
    hi: ['गले में दर्द'],
    ml: ['തൊണ്ടവേദന'],
    kn: ['ಗಂಟಲು ನೋವು'],
    primary: { en: 'throat pain', ta: 'தொண்டை வலி', te: 'గొంతు నొప్పి', hi: 'गले में दर्द', ml: 'തൊണ്ടവേദന', kn: 'ಗಂಟಲು ನೋವು' },
  },
  {
    en: ['severe', 'heavy', 'acute', 'very high'],
    ta: ['கடுமையான', 'அதிகமான'],
    te: ['తీవ్రమైన', 'చాలా ఎక్కువ'],
    hi: ['गंभीर', 'तेज', 'बहुत अधिक'],
    ml: ['കഠിനമായ'],
    kn: ['ತೀವ್ರವಾದ'],
    primary: { en: 'severe', ta: 'கடுமையான', te: 'తీవ్రమైన', hi: 'गंभीर', ml: 'കഠിനമായ', kn: 'ತೀವ್ರವಾದ' },
  },
];

const COMMON_CONVERSATIONAL: SemanticItem[] = [
  {
    en: ['hello doctor', 'good morning doctor', 'hello', 'hi', 'greetings', 'vanakkam'],
    ta: ['வணக்கம்', 'டாக்டர் வணக்கம்', 'வணக்கம் டாக்டர்'],
    te: ['నమస్కారం', 'డాక్టర్ నమస్కారం'],
    hi: ['नमस्ते', 'डॉक्टर नमस्ते', 'नमस्कार'],
    ml: ['നമസ്കാരം', 'ഡോക്ടർ നമസ്കാരം'],
    kn: ['ನಮಸ್ಕಾರ', 'ಡಾಕ್ಟರ್ ನಮಸ್ಕಾರ'],
    primary: { en: 'Hello Doctor', ta: 'வணக்கம் டாக்டர்', te: 'నమస్కారం డాక్టర్', hi: 'नमस्ते डॉक्टर', ml: 'നമസ്കാരം ഡോക്ടർ', kn: 'ನಮಸ್ಕಾರ ಡಾಕ್ಟರ್' },
  },
  {
    en: ['how are you', 'how do you do', 'how are you feeling'],
    ta: ['எப்படி இருக்கிறீர்கள்', 'உடம்பு எப்படி இருக்கிறது'],
    te: ['ఎలా ఉన్నారు', 'మీ ఆరోగ్యం ఎలా ఉంది'],
    hi: ['आप कैसे हैं', 'आपकी तबीयत कैसी है'],
    ml: ['എങ്ങനെയുണ്ട്', 'ഇപ്പോൾ സുഖമാണോ'],
    kn: ['ಹೇಗಿದ್ದೀರಿ', 'ಆರೋಗ್ಯ ಹೇಗಿದೆ'],
    primary: { en: 'How are you feeling?', ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்?', te: 'మీరు ఎలా ఉన్నారు?', hi: 'आप कैसे हैं?', ml: 'സുഖമാണോ?', kn: 'ನೀವು ಹೇಗಿದ್ದೀರಿ?' },
  },
  {
    en: ['thank you doctor', 'thank you', 'thanks'],
    ta: ['நன்றி டாக்டர்', 'நன்றி', 'மிக்க நன்றி'],
    te: ['ధన్యవాదాలు డాక్టర్', 'ధన్యవాదాలు'],
    hi: ['धन्यवाद डॉक्टर', 'धन्यवाद', 'शुक्रिया'],
    ml: ['നന്ദി ഡോക്ടർ', 'നന്ദി'],
    kn: ['ಧನ್ಯವಾದಗಳು ಡಾಕ್ಟರ್', 'ಧನ್ಯವಾದಗಳು'],
    primary: { en: 'Thank you Doctor', ta: 'நன்றி டாக்டர்', te: 'ధన్యవాదాలు డాక్టర్', hi: 'धन्यवाद डॉक्टर', ml: 'നന്ദി ഡോക്ടർ', kn: 'ಧನ್ಯವಾದಗಳು ಡಾಕ್ಟರ್' },
  },
  {
    en: ['yes doctor', 'yes', 'correct', 'true'],
    ta: ['ஆம் டாக்டர்', 'ஆம்', 'சரி'],
    te: ['అవును డాక్టర్', 'అవును', 'సరే'],
    hi: ['हाँ डॉक्टर', 'हाँ', 'जी हाँ'],
    ml: ['അതെ ഡോക്ടർ', 'അതെ', 'ശരി'],
    kn: ['ಹೌದು ಡಾಕ್ಟರ್', 'ಹೌದು', 'ಸರಿ'],
    primary: { en: 'Yes Doctor', ta: 'ஆம் டாக்டர்', te: 'అవును డాక్టర్', hi: 'हाँ डॉक्टर', ml: 'അതെ ഡോക്ടർ', kn: 'ಹೌದು ಡಾಕ್ಟರ್' },
  },
  {
    en: ['no doctor', 'no', 'not having'],
    ta: ['இல்லை டாக்டர்', 'இல்லை'],
    te: ['లేదు డాక్టర్', 'లేదు'],
    hi: ['नहीं डॉक्टर', 'नहीं', 'जी नहीं'],
    ml: ['ഇല്ല ഡോക്ടർ', 'ഇല്ല'],
    kn: ['ಇಲ್ಲ ಡಾಕ್ಟರ್', 'ಇಲ್ಲ'],
    primary: { en: 'No Doctor', ta: 'இல்லை டாக்டர்', te: 'లేదు డాక్టర్', hi: 'नहीं डॉक्टर', ml: 'ഇല്ല ഡോക്ടർ', kn: 'ಇಲ್ಲ ಡಾಕ್ಟರ್' },
  },
  // DOCTOR DIRECTIVES & INSTRUCTIONS
  {
    en: [
      'take this medicine after food',
      'take this tablet after food',
      'take medicine after food',
      'take after meals',
      'take after food',
      'after food',
      'after meals'
    ],
    ta: ['உணவுக்குப் பிறகு மருந்தைச் சாப்பிடவும்', 'சாப்பிட்ட பிறகு மாத்திரை சாப்பிடவும்', 'சாப்பாட்டுக்கு பின் சாப்பிடவும்'],
    te: ['భోజనం తర్వాత మందు వేసుకోండి', 'తిన్న తర్వాత మాత్ర తీసుకోండి', 'భోజనం తర్వాత'],
    hi: ['दवा खाना खाने के बाद लें', 'गोली भोजन के बाद लें', 'खाने के बाद दवा लें'],
    ml: ['ഭക്ഷണത്തിന് ശേഷം മരുന്ന് കഴിക്കുക', 'ഭക്ഷണത്തിന് ശേഷം ഗുളിക കഴിക്കുക'],
    kn: ['ಊಟದ ನಂತರ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳಿ', 'ಊಟದ ನಂತರ ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ'],
    primary: {
      en: 'Please take this medication after food.',
      ta: 'இந்த மருந்தை உணவு உண்ட பின் சாப்பிடவும்.',
      te: 'ఈ మందును భోజనం తర్వాత తీసుకోండి.',
      hi: 'यह दवा खाना खाने के बाद लें।',
      ml: 'ഈ മരുന്ന് ഭക്ഷണത്തിന് ശേഷം കഴിക്കുക.',
      kn: 'ಈ ಔಷಧಿಯನ್ನು ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ.',
    },
  },
  {
    en: [
      'take this medicine before food',
      'take this tablet before food',
      'take before meals',
      'take before food',
      'before food',
      'before meals'
    ],
    ta: ['உணவுக்கு முன் மருந்தைச் சாப்பிடவும்', 'சாப்பிடுவதற்கு முன் மாத்திரை சாப்பிடவும்'],
    te: ['భోజనానికి ముందు మందు వేసుకోండి', 'తినుటకు ముందు మాత్ర తీసుకోండి'],
    hi: ['दवा खाना खाने से पहले लें', 'गोली भोजन से पहले लें', 'खाली पेट दवा लें'],
    ml: ['ഭക്ഷണത്തിന് മുൻപ് മരുന്ന് കഴിക്കുക'],
    kn: ['ಊಟಕ್ಕೆ ಮುಂಚೆ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳಿ'],
    primary: {
      en: 'Please take this medication before food.',
      ta: 'இந்த மருந்தை உணவு உண்பதற்கு முன் சாப்பிடவும்.',
      te: 'ఈ మందును భోజనానికి ముందు తీసుకోండి.',
      hi: 'यह दवा खाना खाने से पहले लें।',
      ml: 'ഈ മരുന്ന് ഭക്ഷണത്തിന് മുൻപ് കഴിക്കുക.',
      kn: 'ಈ ಔಷಧಿಯನ್ನು ಊಟಕ್ಕೆ ಮುಂಚೆ ತೆಗೆದುಕೊಳ್ಳಿ.',
    },
  },
  {
    en: [
      'take twice daily',
      'take twice a day',
      'two times a day',
      'twice daily',
      'twice a day'
    ],
    ta: ['நாளைக்கு இரண்டு முறை சாப்பிடவும்', 'ஒரு நாளைக்கு இருமுறை'],
    te: ['రోజుకు రెండుసార్లు వేసుకోండి', 'రోజుకి రెండు సార్లు'],
    hi: ['दिन में दो बार लें', 'रोजाना दो बार लें'],
    ml: ['ദിവസത്തിൽ രണ്ട് തവണ കഴിക്കുക'],
    kn: ['ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳಿ'],
    primary: {
      en: 'Take twice daily (morning and night).',
      ta: 'நாளைக்கு இரண்டு முறை சாப்பிடவும் (காலை மற்றும் இரவு).',
      te: 'రోజుకు రెండుసార్లు తీసుకోండి (ఉదయం మరియు రాత్రి).',
      hi: 'दिन में दो बार लें (सुबह और रात)।',
      ml: 'ദിവസത്തിൽ രണ്ട് തവണ കഴിക്കുക (രാവിലെയും രാത്രിയും).',
      kn: 'ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳಿ (ಬೆಳಿಗ್ಗೆ ಮತ್ತು ರಾತ್ರಿ).',
    },
  },
  {
    en: [
      'take once daily',
      'take once a day',
      'one time a day',
      'once daily',
      'once a day'
    ],
    ta: ['நாளைக்கு ஒரு முறை சாப்பிடவும்', 'தினமும் ஒருமுறை'],
    te: ['రోజుకు ఒకసారి వేసుకోండి'],
    hi: ['दिन में एक बार लें', 'रोजाना एक बार लें'],
    ml: ['ദിവസത്തിൽ ഒരു തവണ കഴിക്കുക'],
    kn: ['ದಿನಕ್ಕೆ ಒಂದು ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳಿ'],
    primary: {
      en: 'Take once daily.',
      ta: 'நாளைக்கு ஒரு முறை சாப்பிடவும்.',
      te: 'రోజుకు ఒకసారి తీసుకోండి.',
      hi: 'दिन में एक बार लें।',
      ml: 'ദിവസത്തിൽ ഒരു തവണ കഴിക്കുക.',
      kn: 'ದಿನಕ್ಕೆ ಒಂದು ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳಿ.',
    },
  },
  {
    en: [
      'take 1 tablet in the morning and 1 tablet at night',
      '1 tablet morning and night',
      'one tablet morning one tablet night'
    ],
    ta: ['காலையில் 1 மாத்திரை மற்றும் இரவில் 1 மாத்திரை சாப்பிடவும்'],
    te: ['ఉదయం 1 మాత్ర మరియు రాత్రి 1 మాత్ర వేసుకోండి'],
    hi: ['सुबह 1 गोली और रात में 1 गोली लें'],
    ml: ['രാവിലെ 1 ഗുളികയും രാത്രിയിൽ 1 ഗുളികയും കഴിക്കുക'],
    kn: ['ಬೆಳಿಗ್ಗೆ 1 ಮಾತ್ರೆ ಮತ್ತು ರಾತ್ರಿ 1 ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ'],
    primary: {
      en: 'Take 1 tablet in the morning and 1 tablet at night.',
      ta: 'காலையில் 1 மாத்திரை மற்றும் இரவில் 1 மாத்திரை சாப்பிடவும்.',
      te: 'ఉదయం 1 మాత్ర మరియు రాత్రి 1 మాత్ర తీసుకోండి.',
      hi: 'सुबह 1 गोली और रात में 1 गोली लें।',
      ml: 'രാവിലെ 1 ഗുളികയും രാത്രിയിൽ 1 ഗുളികയും കഴിക്കുക.',
      kn: 'ಬೆಳಿಗ್ಗೆ 1 ಮಾತ್ರೆ ಮತ್ತು ರಾತ್ರಿ 1 ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ.',
    },
  },
  {
    en: [
      'drink plenty of boiled water and rest',
      'drink boiled water and take rest',
      'drink water and rest',
      'drink plenty of water'
    ],
    ta: ['நன்றாக கொதித்த தண்ணீர் குடித்து ஓய்வெடுக்கவும்', 'நிறைய தண்ணீர் குடிக்கவும்'],
    te: ['కాచి చల్లార్చిన నీరు పుష్కలంగా తాగి విశ్రాంతి తీసుకోండి'],
    hi: ['खूब उबला हुआ पानी पिएं और आराम करें'],
    ml: ['ധാരാളം തിളപ്പിച്ചാറിയ വെള്ളം കുടിക്കുകയും വിശ്രമിക്കുകയും ചെയ്യുക'],
    kn: ['ಸಾಕಷ್ಟು ಕುದಿಸಿದ ನೀರನ್ನು ಕುಡಿದು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ'],
    primary: {
      en: 'Drink plenty of clean boiled water and take adequate rest.',
      ta: 'நன்கு காய்ச்சிய தண்ணீர் நிறைய குடித்து ஓய்வெடுக்கவும்.',
      te: 'బాగా కాచిన నీరు పుష్కలంగా తాగి విశ్రాంతి తీసుకోండి.',
      hi: 'खूब उबला हुआ पानी पिएं और पर्याप्त आराम करें।',
      ml: 'ധാരാളം തിളപ്പിച്ച വെള്ളം കുടിക്കുകയും വിശ്രമിക്കുകയും ചെയ്യുക.',
      kn: 'ಸಾಕಷ್ಟು ಕುದಿಸಿದ ನೀರನ್ನು ಕುಡಿದು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.',
    },
  },
  {
    en: [
      'take medicine with water',
      'take tablet with water',
      'take with warm water'
    ],
    ta: ['மருந்தை தண்ணீருடன் சாப்பிடவும்', 'வெதுவெதுப்பான தண்ணீருடன் மாத்திரை சாப்பிடவும்'],
    te: ['మందును నీళ్లతో తీసుకోండి', 'గోరువెచ్చని నీళ్లతో మాత్ర వేసుకోండి'],
    hi: ['दवा पानी के साथ लें', 'गुनगुने पानी के साथ गोली लें'],
    ml: ['മരുന്ന് വെള്ളത്തോടൊപ്പം കഴിക്കുക'],
    kn: ['ಔಷಧಿಯನ್ನು ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ'],
    primary: {
      en: 'Take medicine with warm water.',
      ta: 'மருந்தை வெதுவெதுப்பான தண்ணீருடன் சாப்பிடவும்.',
      te: 'మందును గోరువెచ్చని నీళ్లతో తీసుకోండి.',
      hi: 'दवा गुनगुने पानी के साथ लें।',
      ml: 'മരുന്ന് ചെറുചൂടുവെള്ളത്തോടൊപ്പം കഴിക്കുക.',
      kn: 'ಔಷಧಿಯನ್ನು ಬೆಚ್ಚಗಿನ ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ.',
    },
  },
  {
    en: [
      'visit hospital immediately',
      'go to hospital immediately',
      'visit clinic immediately',
      'visit phc immediately'
    ],
    ta: ['உடனடியாக மருத்துவமனைக்கு செல்லவும்', 'ஆரம்ப சுகாதார நிலையத்திற்கு செல்லவும்'],
    te: ['వెంటనే ఆసుపత్రికి వెళ్ళండి', 'వెంటనే పీహెచ్‌సీకి వెళ్ళండి'],
    hi: ['तुरंत अस्पताल जाएं', 'तुरंत स्वास्थ्य केंद्र जाएं'],
    ml: ['ഉടൻ ആശുപത്രിയിൽ പോകുക'],
    kn: ['ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ'],
    primary: {
      en: 'Please visit the nearest hospital or Primary Health Centre immediately.',
      ta: 'தயவுசெய்து உடனடியாக அருகிலுள்ள மருத்துவமனைக்கு செல்லவும்.',
      te: 'దయచేసి వెంటనే సమీప ఆసుపత్రికి వెళ్ళండి.',
      hi: 'कृपया तुरंत नजदीकी अस्पताल या प्राथमिक स्वास्थ्य केंद्र जाएं।',
      ml: 'ദയവായി ഉടൻ തന്നെ അടുത്തുള്ള ആശുപത്രിയിൽ പോകുക.',
      kn: 'ದಯವಿಟ್ಟು ತಕ್ಷಣ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.',
    },
  },
  // DOCTOR QUESTIONS
  {
    en: [
      'how many days do you have fever',
      'how many days fever',
      'how many days have you had fever',
      'since when fever'
    ],
    ta: ['எத்தனை நாட்களாக காய்ச்சல் இருக்கிறது', 'எப்போது இருந்து காய்ச்சல்'],
    te: ['ఎన్ని రోజులుగా జ్వరం ఉంది', 'ఎప్పటి నుండి జ్వరం'],
    hi: ['कितने दिनों से बुखार है', 'कब से बुखार आ रहा है'],
    ml: ['എത്ര ദിവസമായി പനിയുണ്ട്'],
    kn: ['ಎಷ್ಟು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ'],
    primary: {
      en: 'How many days have you had this fever?',
      ta: 'எத்தனை நாட்களாக உங்களுக்கு காய்ச்சல் இருக்கிறது?',
      te: 'మీకు ఎన్ని రోజులుగా జ్వరం ఉంది?',
      hi: 'आपको कितने दिनों से बुखार है?',
      ml: 'എത്ര ദിവസമായി നിങ്ങൾക്ക് പനിയുണ്ട്?',
      kn: 'ನಿಮಗೆ ಎಷ್ಟು ದಿನಗಳಿಂದ ಜ್ವರ ಇದೆ?',
    },
  },
  {
    en: [
      'do you have chest pain or breathing difficulty',
      'do you have chest pain',
      'any chest pain or difficulty breathing'
    ],
    ta: ['நெஞ்சு வலி அல்லது மூச்சுத்திணறல் இருக்கிறதா'],
    te: ['ఛాతీ నొప్పి లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉందా'],
    hi: ['क्या सीने में दर्द या सांस लेने में तकलीफ है'],
    ml: ['നെഞ്ചുവേദനയോ ശ്വാസതടസ്സമോ ഉണ്ടോ'],
    kn: ['ಎದೆ ನೋವು ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆಯೇ'],
    primary: {
      en: 'Do you have any chest pain or difficulty breathing?',
      ta: 'உங்களுக்கு நெஞ்சு வலி அல்லது மூச்சுத்திணறல் இருக்கிறதா?',
      te: 'మీకు ఛాతీ నొప్పి లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉందా?',
      hi: 'क्या आपको सीने में दर्द या सांस लेने में कोई कठिनाई है?',
      ml: 'നിങ്ങൾക്ക് നെഞ്ചുവേദനയോ ശ്വാസതടസ്സമോ ഉണ്ടോ?',
      kn: 'ನಿಮಗೆ ಎದೆ ನೋವು ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆಯೇ?',
    },
  },
  {
    en: [
      'do you have any allergy to medicines',
      'any medicine allergy',
      'are you allergic to any medicines'
    ],
    ta: ['மருந்துகளால் ஏதேனும் ஒவ்வாமை அலர்ஜி உள்ளதா'],
    te: ['మందుల వల్ల ఏదైనా అలెర్జీ ఉందా'],
    hi: ['क्या किसी दवा से कोई एलर्जी है'],
    ml: ['മരുന്നുകളോട് എന്തെങ്കിലും അലർജി ഉണ്ടോ'],
    kn: ['ಯಾವುದಾದರೂ ಔಷಧಿಯಿಂದ ಅಲರ್ಜಿ ಇದೆಯೇ'],
    primary: {
      en: 'Do you have any known allergy to medicines?',
      ta: 'உங்களுக்கு மருந்துகளால் ஏதேனும் ஒவ்வாமை (அலர்ஜி) உள்ளதா?',
      te: 'మీకు మందుల వల్ల ఏదైనా అలెర్జీ ఉందా?',
      hi: 'क्या आपको किसी दवा से कोई एलर्जी है?',
      ml: 'നിങ്ങൾക്ക് മരുന്നുകളോട് എന്തെങ്കിലും അലർജി ഉണ്ടോ?',
      kn: 'ನಿಮಗೆ ಯಾವುದೇ ಔಷಧಿಯಿಂದ ಅಲರ್ಜಿ ಇದೆಯೇ?',
    },
  },
  {
    en: [
      'are you taking any other medicines',
      'any other medicines you take',
      'current medications'
    ],
    ta: ['வேறு ஏதேனும் மருந்துகள் சாப்பிடுகிறீர்களா'],
    te: ['వేరే ఏవైనా మందులు వాడుతున్నారా'],
    hi: ['क्या आप कोई अन्य दवाइयां ले रहे हैं'],
    ml: ['മറ്റ് വല്ല മരുന്നുകളും കഴിക്കുന്നുണ്ടോ'],
    kn: ['ಬೇರೆ ಯಾವುದೇ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದೀರಾ'],
    primary: {
      en: 'Are you currently taking any other medications?',
      ta: 'நீங்கள் தற்போது வேறு ஏதேனும் மருந்துகள் சாப்பிடுகிறீர்களா?',
      te: 'మీరు ప్రస్తుతం ఇతర మందులు ఏమైనా వాడుతున్నారా?',
      hi: 'क्या आप वर्तमान में कोई अन्य दवाएं ले रहे हैं?',
      ml: 'നിങ്ങൾ ഇപ്പോൾ മറ്റ് മരുന്നുകൾ വല്ലതും കഴിക്കുന്നുണ്ടോ?',
      kn: 'ನೀವು ಪ್ರಸ್ತುತ ಬೇರೆ ಯಾವುದೇ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದೀರಾ?',
    },
  },
];

function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/[“”"']/g, '')
    .replace(/[?.!,;।]+$/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Compositional sentence translator for arbitrary user text across En, Ta, Te, Hi, Ml, Kn.
 */
export function translateArbitraryTextOffline(
  text: string,
  sourceLangCode: SupportedLanguageCode,
  targetLangCode: SupportedLanguageCode
): GeneralTranslationResult {
  const source = toBridgeLang(sourceLangCode);
  const target = toBridgeLang(targetLangCode);
  const raw = text.trim();

  // 1. Same Language Check
  if (source === target) {
    return {
      sourceText: raw,
      sourceLang: sourceLangCode,
      targetLang: targetLangCode,
      translatedText: raw,
      confidence: 'HIGH',
      engine: 'rule-compositional',
      preservedNumbers: [],
      isVerified: true,
    };
  }

  const { values: medValues } = protectMedicalValues(raw);
  const preservedNums = medValues.map((v) => v.original);
  const norm = normalizeText(raw);

  // 2. Direct Conversational Phrases check
  for (const conv of COMMON_CONVERSATIONAL) {
    const sourceCandidates = [...conv[source], conv.primary[source]];
    if (sourceCandidates.some((c) => norm === normalizeText(c))) {
      let targetText = conv.primary[target] || conv.primary.en;
      targetText = restoreMedicalValues(targetText, medValues);
      return {
        sourceText: raw,
        sourceLang: sourceLangCode,
        targetLang: targetLangCode,
        translatedText: targetText,
        confidence: 'HIGH',
        engine: 'phrase-library',
        preservedNumbers: preservedNums,
        isVerified: true,
      };
    }
  }

  // 3. Compositional Pattern Analysis (Pronoun + Time/Duration + Symptom + Verb)
  // Check for duration numbers: e.g. "3 days", "3 நாட்களாக", "3 రోజులుగా", "3 दिनों से"
  const durationNumberMatch = raw.match(/(\d+)\s*(?:days?|weeks?|months?|hours?|நாட்கள்|நாட்களாக|நாட்களாய்|రోజులు|రోజులుగా|दिन|दिनों\s*से|ദിവസം|ദിവസമായി|ದಿನ|ದಿನಗಳಿಂದ)/i);
  const durationNumber = durationNumberMatch ? durationNumberMatch[1] : null;

  // Match Pronoun/Subject
  let matchedSubject: SemanticItem | null = null;
  for (const item of PRONOUN_MAP) {
    if (item[source].some((s) => norm.includes(normalizeText(s)))) {
      matchedSubject = item;
      break;
    }
  }
  const subjectStr = matchedSubject ? matchedSubject.primary[target] : PRONOUN_MAP[0].primary[target];

  // Match Time Expression
  let matchedTime: SemanticItem | null = null;
  for (const time of TIME_EXPRESSIONS) {
    if (time[source].some((s) => norm.includes(normalizeText(s)))) {
      matchedTime = time;
      break;
    }
  }

  // Match Symptoms
  const matchedSymptoms: SemanticItem[] = [];
  for (const sym of SYMPTOM_LEXICON) {
    if (sym[source].some((s) => norm.includes(normalizeText(s)))) {
      matchedSymptoms.push(sym);
    }
  }

  if (matchedSymptoms.length > 0) {
    const symptomStr = matchedSymptoms.map((s) => s.primary[target]).join(', ');

    let timeStr = '';
    if (durationNumber) {
      switch (target) {
        case 'ta': timeStr = `${durationNumber} நாட்களாக`; break;
        case 'te': timeStr = `${durationNumber} రోజులుగా`; break;
        case 'hi': timeStr = `${durationNumber} दिनों से`; break;
        case 'ml': timeStr = `${durationNumber} ദിവസമായി`; break;
        case 'kn': timeStr = `${durationNumber} ದಿನಗಳಿಂದ`; break;
        case 'en':
        default: timeStr = `for ${durationNumber} days`; break;
      }
    } else if (matchedTime) {
      timeStr = matchedTime.primary[target];
    }

    let composed = '';
    const isSingleSymptom = matchedSymptoms.length === 1 && !norm.includes(' மற்றும் ') && !norm.includes(' and ') && !norm.includes(' और ');
    switch (target) {
      case 'ta':
        composed = timeStr
          ? `${subjectStr} ${timeStr} ${symptomStr} இருக்கிறது.`
          : `${subjectStr} ${symptomStr} இருக்கிறது.`;
        break;
      case 'te':
        composed = timeStr
          ? `${subjectStr} ${timeStr} ${symptomStr} ఉంది.`
          : `${subjectStr} ${symptomStr} ఉంది.`;
        break;
      case 'hi':
        composed = timeStr
          ? `${subjectStr} ${timeStr} ${symptomStr} है।`
          : `${subjectStr} ${symptomStr} है।`;
        break;
      case 'ml':
        composed = timeStr
          ? `${subjectStr} ${timeStr} ${symptomStr} ഉണ്ട്.`
          : `${subjectStr} ${symptomStr} ഉണ്ട്.`;
        break;
      case 'kn':
        composed = timeStr
          ? `${subjectStr} ${timeStr} ${symptomStr} ಇದೆ.`
          : `${subjectStr} ${symptomStr} ಇದೆ.`;
        break;
      case 'en':
      default:
        if (norm === symptomStr.toLowerCase() || (norm.length <= 15 && !matchedTime && !durationNumber && isSingleSymptom)) {
          composed = symptomStr.charAt(0).toUpperCase() + symptomStr.slice(1);
        } else if (durationNumber) {
          const article = isSingleSymptom && (symptomStr === 'fever' || symptomStr === 'cough' || symptomStr === 'headache' || symptomStr === 'cold') ? 'a ' : '';
          composed = `${subjectStr} had ${article}${symptomStr} ${timeStr}.`;
        } else if (matchedTime) {
          composed = `${subjectStr} had ${symptomStr} ${timeStr}.`;
        } else {
          const article = isSingleSymptom && (symptomStr === 'fever' || symptomStr === 'cough' || symptomStr === 'headache' || symptomStr === 'cold') ? 'a ' : '';
          composed = `${subjectStr} ${article}${symptomStr}.`;
        }
        break;
    }

    composed = restoreMedicalValues(composed, medValues);
    const valCheck = validatePreservedMedicalValues(raw, composed);

    return {
      sourceText: raw,
      sourceLang: sourceLangCode,
      targetLang: targetLangCode,
      translatedText: composed,
      confidence: valCheck.isValid ? 'HIGH' : 'MEDIUM',
      engine: 'rule-compositional',
      preservedNumbers: preservedNums,
      isVerified: valCheck.isValid,
    };
  }

  // 4. Fallback for uncomposed arbitrary text
  return {
    sourceText: raw,
    sourceLang: sourceLangCode,
    targetLang: targetLangCode,
    translatedText: '',
    confidence: 'LOW',
    engine: 'dictionary',
    preservedNumbers: preservedNums,
    isVerified: false,
    notes: 'Complex sentence requires neural server model or clinician review.',
  };
}

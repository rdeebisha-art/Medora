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
    en: ['hello', 'hi', 'greetings'],
    ta: ['வணக்கம்'],
    te: ['నమస్కారం'],
    hi: ['नमस्ते', 'नमस्कार'],
    ml: ['നമസ്കാരം'],
    kn: ['ನಮಸ್ಕಾರ'],
    primary: { en: 'Hello', ta: 'வணக்கம்', te: 'నమస్కారం', hi: 'नमस्ते', ml: 'നമസ്കാരം', kn: 'ನಮಸ್ಕಾರ' },
  },
  {
    en: ['how are you', 'how do you do'],
    ta: ['எப்படி இருக்கிறீர்கள்'],
    te: ['ఎలా ఉన్నారు'],
    hi: ['आप कैसे हैं'],
    ml: ['എങ്ങനെയുണ്ട്'],
    kn: ['ಹೇಗಿದ್ದೀರಿ'],
    primary: { en: 'How are you?', ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்?', te: 'మీరు ఎలా ఉన్నారు?', hi: 'आप कैसे हैं?', ml: 'സുഖമാണോ?', kn: 'ನೀವು ಹೇಗಿದ್ದೀರಿ?' },
  },
  {
    en: ['thank you', 'thanks'],
    ta: ['நன்றி', 'மிக்க நன்றி'],
    te: ['ధన్యవాదాలు'],
    hi: ['धन्यवाद', 'शुक्रिया'],
    ml: ['നന്ദി'],
    kn: ['ಧನ್ಯವಾದಗಳು'],
    primary: { en: 'Thank you', ta: 'நன்றி', te: 'ధన్యవాదాలు', hi: 'धन्यवाद', ml: 'നന്ദി', kn: 'ಧನ್ಯವಾದಗಳು' },
  },
  {
    en: ['take medicine with water', 'take tablet with water'],
    ta: ['மருந்தை தண்ணீருடன் சாப்பிடுங்கள்'],
    te: ['మందును నీళ్లతో తీసుకోండి'],
    hi: ['दवा पानी के साथ लें'],
    ml: ['മരുന്ന് വെള്ളത്തോടൊപ്പം കഴിക്കുക'],
    kn: ['ಔಷಧಿಯನ್ನು ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ'],
    primary: { en: 'Take medicine with water.', ta: 'மருந்தை தண்ணீருடன் சாப்பிடுங்கள்.', te: 'మందును నీళ్లతో తీసుకోండి.', hi: 'दवा पानी के साथ लें।', ml: 'മരുന്ന് വെള്ളത്തോടൊപ്പം കഴിക്കുക.', kn: 'ಔಷಧಿಯನ್ನು ನೀರಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ.' },
  },
  {
    en: ['consult a doctor', 'see a doctor', 'visit hospital'],
    ta: ['மருத்துவரை அணுகவும்', 'மருத்துவமனைக்கு செல்லுங்கள்'],
    te: ['వైద్యుడిని సంప్రదించండి', 'ఆసుపత్రికి వెళ్ళండి'],
    hi: ['डॉक्टर से परामर्श लें', 'अस्पताल जाएं'],
    ml: ['ഡോക്ടറെ കാണുക', 'ആശുപത്രിയിൽ പോകുക'],
    kn: ['ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ', 'ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ'],
    primary: { en: 'Please consult a doctor.', ta: 'தயவுசெய்து மருத்துவரை அணுகவும்.', te: 'దయచేసి వైద్యుడిని సంప్రదించండి.', hi: 'कृपया डॉक्टर से परामर्श लें।', ml: 'ദയവായി ഡോക്ടറെ കാണുക.', kn: 'ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.' },
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
        composed = timeStr
          ? `${subjectStr} had a ${symptomStr} ${timeStr}.`
          : `${subjectStr} a ${symptomStr}.`;
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

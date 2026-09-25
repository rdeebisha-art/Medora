import {
  MedicalAnalysisRequest,
  StructuredMedicalResponse,
  PossibleCondition,
  MedicalConfidenceStatus,
  MedicalExecutionMode,
} from './types';
import { protectMedicalValues, restoreMedicalValues } from '../medicalSafety/medicalValueProtection';
import { validateMedicalSchema, MedicalSchemaValidationResult } from './medicalSchemaValidation';
import {
  EMERGENCY_RULES,
  CONDITION_MAPPINGS,
  MULTILINGUAL_SYMPTOMS,
  INSUFFICIENT_INFO_MESSAGES,
  SAFETY_DISCLAIMER,
  dictionaryData,
  conditionsData,
} from '../../data/medical';

/**
 * Multilingual Normalized Symptom Dictionary across 6 supported languages:
 * English (en), Tamil (ta), Hindi (hi), Telugu (te), Malayalam (ml), Kannada (kn)
 */
export interface NormalizedSymptomDef {
  conceptId: string;
  canonicalName: string;
  aliases: Record<string, string[]>;
  isEmergencyFlag?: boolean;
}

export const NORMALIZED_SYMPTOMS: Record<string, NormalizedSymptomDef> = {
  FEVER: {
    conceptId: 'FEVER',
    canonicalName: 'Fever',
    aliases: {
      en: ['fever', 'high temperature', 'temperature', 'feverish', 'feeling hot', 'pyrexia', 'chills', 'shivering'],
      ta: ['காய்ச்சல்', 'ஜுரம்', 'உடல் சூடு', 'சுரம்', 'காய்ச்சலாக இருக்கு', 'உடம்பு சுடுது'],
      hi: ['बुखार', 'तापमान', 'तप रहा है', 'गरम है', 'ताप', 'बदन गरम', 'ज्वर'],
      te: ['జ్వరం', 'ఒళ్లు వేడిగా ఉంది', 'జ్వరంగా ఉంది', 'తాపం', 'వేడి'],
      ml: ['പനി', 'ശരീരം ചൂട്', 'പനിയുണ്ട്', 'ചൂടാണ്', 'വിറയൽ'],
      kn: ['ಜ್ವರ', 'ಮೈ ಬಿಸಿ', 'ಜ್ವರ ಬಂದಿದೆ', 'ತಾಪ', 'ಚಳಿ ಜ್ವರ']
    }
  },
  COUGH: {
    conceptId: 'COUGH',
    canonicalName: 'Cough',
    aliases: {
      en: ['cough', 'coughing', 'dry cough', 'wet cough', 'sputum', 'phlegm'],
      ta: ['இருமல்', 'சளி இருமல்', 'வறட்டு இருமல்', 'இருமுது'],
      hi: ['खांसी', 'खोकला', 'बलगम', 'खांस रहा हूँ', 'सूखी खांसी'],
      te: ['దగ్గు', 'పొడి దగ్గు', 'కఫం దగ్గు', 'దగ్గుతోంది'],
      ml: ['ചുമ', 'വരണ്ട ചുമ', 'കഫം ചുമ', 'ചുമയ്ക്കുന്നു'],
      kn: ['ಕೆಮ್ಮು', 'ಒಣ ಕೆಮ್ಮು', 'ಕಫದ ಕೆಮ್ಮು', 'ಕೆಮ್ಮುತ್ತಿದ್ದೇನೆ']
    }
  },
  COLD: {
    conceptId: 'COLD',
    canonicalName: 'Cold / Rhinitis',
    aliases: {
      en: ['cold', 'runny nose', 'sneezing', 'congestion', 'blocked nose', 'sinus'],
      ta: ['சளி', 'மூக்கு ஒழுகுதல்', 'தும்மல்', 'மூக்கடைப்பு'],
      hi: ['जुकाम', 'सर्दी', 'नाक बहना', 'छींक', 'नाक बंद'],
      te: ['జలుబు', 'ముక్కు కారడం', 'తుమ్ములు', 'ముక్కు దిబ్బడ'],
      ml: ['ജലദോഷം', 'മൂക്കൊലിപ്പ്', 'തുമ്മൽ', 'മൂക്കടപ്പ്'],
      kn: ['ನೆಗಡಿ', 'ಮೂಗು ಸೋರುವುದು', 'ಸೀನು', 'ಮೂಗು ಕಟ್ಟುವಿಕೆ']
    }
  },
  HEADACHE: {
    conceptId: 'HEADACHE',
    canonicalName: 'Headache',
    aliases: {
      en: ['headache', 'head pain', 'throbbing head', 'pain in head', 'migraine'],
      ta: ['தலைவலி', 'தலை பாரம்', 'தலை வலிக்குது'],
      hi: ['सिरदर्द', 'सिर में दर्द', 'माथा दुखना'],
      te: ['తలనొప్పి', 'తల నొప్పిగా ఉంది', 'తల బరువు'],
      ml: ['തലവേദന', 'തല വേദനിക്കുന്നു', 'തലയിൽ ഭാരം'],
      kn: ['ತಲೆನೋವು', 'ತಲೆ ಭಾರ', 'ತಲೆ ನೋಯುತ್ತಿದೆ']
    }
  },
  CHEST_PAIN: {
    conceptId: 'CHEST_PAIN',
    canonicalName: 'Chest Pain',
    aliases: {
      en: ['chest pain', 'chest heaviness', 'pain in heart', 'left arm pain', 'chest tight', 'crushing chest', 'heart pain'],
      ta: ['நெஞ்சு வலி', 'நெஞ்சு பாரம்', 'மார்பு வலி', 'இடது கை வலி', 'நெஞ்சை அடைப்பது'],
      hi: ['सीने में दर्द', 'छाती में दर्द', 'सीने में भारीपन', 'दिल में दर्द', 'बाएं हाथ में दर्द'],
      te: ['ఛాతీ నొప్పి', 'రొమ్ము నొప్పి', 'ఛాతీలో బరువు', 'గుండె నొప్పి'],
      ml: ['നെഞ്ചുവേദന', 'നെഞ്ചിൽ ഭാരം', 'ഹൃദയത്തിൽ വേദന', 'നെഞ്ചു വേദന'],
      kn: ['ಎದೆ ನೋವು', 'ಎದೆಯಲ್ಲಿ ಭಾರ', 'ಎದೆ ಹಿಂಡಿದಂತಾಗುವುದು']
    },
    isEmergencyFlag: true
  },
  BREATHING_DIFFICULTY: {
    conceptId: 'BREATHING_DIFFICULTY',
    canonicalName: 'Difficulty Breathing',
    aliases: {
      en: ['difficulty breathing', 'cannot breathe', "can't breathe", 'shortness of breath', 'breathless', 'gasping', 'choking', 'wheezing'],
      ta: ['மூச்சு விட முடியவில்லை', 'மூச்சுத் திணறல்', 'மூச்சு வாங்க முடியல', 'மூச்சு வாங்குது', 'இரைப்பு', 'ஆயாசம்'],
      hi: ['सांस नहीं आ रही', 'सांस फूलना', 'सांस लेने में दिक्कत', 'दम घुटना', 'घबराहट'],
      te: ['శ్వాస ఆడట్లేదు', 'శ్వాస తీసుకోవడంలో ఇబ్బంది', 'ఆయాసం', 'శ్వాస తీసుకోవడం కష్టం', 'దమ్ము'],
      ml: ['ശ്വാസമെടുക്കാൻ പറ്റുന്നില്ല', 'ശ്വാസതടസ്സം', 'കിതപ്പ്', 'ശ്വാസം മുട്ടൽ'],
      kn: ['ಉಸಿರಾಡಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ', 'ಉಸಿರಾಟದ ತೊಂದರೆ', 'ಉಸಿರಾಡಲು ಕಷ್ಟ', 'ಉಸಿರು ಕಟ್ಟಿದಂತಾಗುವುದು', 'ಉಬ್ಬಸ']
    },
    isEmergencyFlag: true
  },
  STOMACH_PAIN: {
    conceptId: 'STOMACH_PAIN',
    canonicalName: 'Stomach Pain',
    aliases: {
      en: ['stomach pain', 'belly ache', 'abdominal pain', 'tummy ache', 'cramps in stomach', 'cramps'],
      ta: ['வயிற்று வலி', 'வயிறு வலிக்குது', 'வயிற்றுக் கடுப்பு', 'வயிற்றுப் பிடிப்பு'],
      hi: ['पेट दर्द', 'पेट में दर्द', 'पेट मरोड़ना', 'पेट खराब'],
      te: ['కడుపు నొప్పి', 'కడుపులో నొప్పి', 'కడుపు పిసికినట్టుంది'],
      ml: ['വയറുവേദന', 'വയറു വേദന', 'വയറു കൊളുത്തുന്നത്'],
      kn: ['ಹೊಟ್ಟೆ ನೋವು', 'ಹೊಟ್ಟೆಯಲ್ಲಿ ನೋವು', 'ಹೊಟ್ಟೆ ಚುಚ್ಚುವುದು']
    }
  },
  VOMITING: {
    conceptId: 'VOMITING',
    canonicalName: 'Vomiting / Nausea',
    aliases: {
      en: ['vomiting', 'nausea', 'throwing up', 'puking', 'feeling sick', 'vomit'],
      ta: ['வாந்தி', 'குமட்டல்', 'வாந்தி எடுப்பது'],
      hi: ['उल्टी', 'उल्टी जैसा', 'मिचली', 'जी घबराना'],
      te: ['వాంతులు', 'వికారం', 'వాంతి వస్తోంది', 'వాంతి'],
      ml: ['ഛർദ്ദി', 'മനംപിരട്ടൽ', 'ഛർദ്ദിക്കുന്നു'],
      kn: ['ವಾಂತಿ', 'ವಾಕರಿಕೆ', 'ತಲೆ ತಿರುಗಿ ವಾಂತಿ']
    }
  },
  DIARRHEA: {
    conceptId: 'DIARRHEA',
    canonicalName: 'Diarrhea / Loose Stools',
    aliases: {
      en: ['diarrhea', 'loose motion', 'watery stool', 'loose stools', 'upset stomach'],
      ta: ['வயிற்றுப்போக்கு', 'பேதி', 'தண்ணீராக போகுது', 'லூஸ் மோஷன்'],
      hi: ['दस्त', 'पतला दस्त', 'लूज मोशन', 'झाड़ा'],
      te: ['విరేచనాలు', 'మోషన్స్', 'నీళ్ల విరేచనాలు'],
      ml: ['വയറിളക്കം', 'ലൂസ് മോഷൻ', 'വെള്ളം പോലെ പോകുന്നു'],
      kn: ['ಅತಿಸಾರ', 'ಭೇದಿ', 'ನೀರು ಮಲ']
    }
  },
  DIZZINESS: {
    conceptId: 'DIZZINESS',
    canonicalName: 'Dizziness / Vertigo',
    aliases: {
      en: ['dizziness', 'dizzy', 'lightheaded', 'spinning head', 'vertigo', 'feeling faint'],
      ta: ['தலைச்சுற்றல்', 'மயக்கம்', 'சுற்றல்', 'கண் இருட்டுவது'],
      hi: ['चक्कर', 'चक्कर आना', 'सिर घूमना'],
      te: ['కళ్లు తిరగడం', 'కళ్లు తిరుగుతున్నాయి', 'తలతిరుగుడు'],
      ml: ['തലകറക്കം', 'തല കറങ്ങുന്നു'],
      kn: ['ತಲೆತಿರುಗುವಿಕೆ', 'ತಲೆ ಸುತ್ತುವುದು']
    }
  },
  BLEEDING: {
    conceptId: 'BLEEDING',
    canonicalName: 'Bleeding / Hemorrhage',
    aliases: {
      en: ['bleeding', 'blood loss', 'hemorrhage', 'blood discharge', 'coughing blood', 'vomiting blood'],
      ta: ['இரத்தப்போக்கு', 'ரத்தம் வருகிறது', 'ரத்தக் கசிவு', 'அதிக இரத்தப்போக்கு'],
      hi: ['खून बहना', 'रक्तस्राव', 'खून की उल्टी', 'रक्त बहना'],
      te: ['రక్తస్రావం', 'రక్తం కారడం', 'రక్తం పడుతోంది'],
      ml: ['രക്തസ്രാവം', 'ചോര വരുന്നു'],
      kn: ['ರಕ್ತಸ್ರಾವ', 'ರಕ್ತ ಸೋರುವುದು']
    },
    isEmergencyFlag: true
  },
  FATIGUE: {
    conceptId: 'FATIGUE',
    canonicalName: 'Fatigue / Weakness',
    aliases: {
      en: ['fatigue', 'tiredness', 'exhaustion', 'weakness', 'feeling weak', 'lethargy'],
      ta: ['அசதி', 'சோர்வு', 'உடல் சோர்வு', 'பலவீனம்'],
      hi: ['थकान', 'कमजोरी', 'थकावट', 'सुस्ती'],
      te: ['అలసట', 'నీరసం', 'బలహీనత'],
      ml: ['ക്ഷീണം', 'തളർച്ച', 'ശക്തിക്കുറവ്'],
      kn: ['ಆಯಾಸ', 'ಸುಸ್ತು', 'ನಿಶ್ಯಕ್ತಿ', 'ದಣಿವು']
    }
  },
  BODY_PAIN: {
    conceptId: 'BODY_PAIN',
    canonicalName: 'Body Pain / Myalgia',
    aliases: {
      en: ['body pain', 'body ache', 'muscle pain', 'joint pain', 'myalgia'],
      ta: ['உடல் வலி', 'உடம்பு வலி', 'கை கால் வலி', 'மூட்டு வலி'],
      hi: ['बदन दर्द', 'हाथ पैर में दर्द', 'मांसपेशियों में दर्द', 'जोड़ों का दर्द'],
      te: ['ఒళ్లు నొప్పులు', 'శరీర నొప్పి', 'కీళ్ల నొప్పులు'],
      ml: ['ശരീരവേദന', 'മേലുവേദന', 'സന്ധിവേദന'],
      kn: ['ಮೈ ನೋವು', 'ಕೈ ಕಾಲು ನೋವು', 'ಕೀಲು ನೋವು']
    }
  },
  SORE_THROAT: {
    conceptId: 'SORE_THROAT',
    canonicalName: 'Sore Throat / Pharyngitis',
    aliases: {
      en: ['sore throat', 'throat pain', 'throat irritation', 'difficulty swallowing', 'painful swallowing'],
      ta: ['தொண்டை வலி', 'தொண்டை கரகரப்பு', 'விழுங்க முடியவில்லை'],
      hi: ['गले में दर्द', 'गला खराब', 'गले में खराश', 'निगलने में दर्द'],
      te: ['గొంతు నొప్పి', 'గొంతు మంట', 'మింగలేకపోవడం'],
      ml: ['തൊണ്ടവേദന', 'തൊണ്ടയിൽ കരകരപ്പ്'],
      kn: ['ಗಂಟಲು ನೋವು', 'ನುಂಗಲು ಕಷ್ಟ']
    }
  },
  HIGH_BLOOD_PRESSURE: {
    conceptId: 'HIGH_BLOOD_PRESSURE',
    canonicalName: 'High Blood Pressure Check',
    aliases: {
      en: ['high bp', 'blood pressure', 'hypertension', 'bp reading', 'my bp'],
      ta: ['உயர் ரத்த அழுத்தம்', 'ஹை பிபி', 'ரத்தக் கொதிப்பு', 'பிபி'],
      hi: ['हाई बीपी', 'ब्लड प्रेशर', 'रक्तचाप', 'बीपी ज्यादा'],
      te: ['అధిక రక్తపోటు', 'హై బీపీ', 'బీపీ ఎక్కువ'],
      ml: ['ഉയർന്ന ബിപി', 'രക്തസമ്മർദ്ദം', 'ഹൈപ്പർടെൻഷൻ'],
      kn: ['ಅಧಿಕ ರಕ್ತದೊತ್ತಡ', 'ಹೈ ಬಿಪಿ', 'ಬಿಪಿ ಹೆಚ್ಚು']
    }
  },
  HIGH_BLOOD_SUGAR: {
    conceptId: 'HIGH_BLOOD_SUGAR',
    canonicalName: 'High Blood Sugar Check',
    aliases: {
      en: ['high sugar', 'blood glucose', 'diabetes', 'sugar test', 'my sugar'],
      ta: ['ரத்த சர்க்கரை', 'சர்க்கரை நோய்', 'சுகர் அதிகம்'],
      hi: ['ब्लड शुगर', 'शुगर बढ़ गई', 'मधुमेह', 'डायबिटीज'],
      te: ['బ్లడ్ షుగర్', 'షుగర్ ఎక్కువైంది', 'మధుమేహం'],
      ml: ['ബ്ലഡ് ഷുഗർ', 'പ്രമേഹം', 'ഷുഗർ കൂടി'],
      kn: ['ರಕ್ತದಲ್ಲಿ ಸಕ್ಕರೆ', 'ಸಕ್ಕರೆ ಕಾಯಿಲೆ', 'ಶುಗರ್ ಜಾಸ್ತಿ']
    }
  }
};

export class MedicalService {
  /**
   * Deterministic local emergency evaluator.
   * Runs before ANY normal medical reasoning. Works 100% offline.
   */
  public evaluateEmergencyRules(input: string): {
    isEmergency: boolean;
    redFlags: string[];
    concept?: string;
  } {
    const raw = (input || '').trim();
    const lower = raw.toLowerCase();
    const redFlags: string[] = [];
    let concept: string | undefined;

    // 1. Difficulty breathing / Respiratory failure
    if (
      /\b(cannot breathe|can't breathe|choking|gasping|severe shortness of breath|breathless|blue lips|unable to breathe)\b/i.test(
        lower
      ) ||
      /(மூச்சு விட முடியவில்லை|மூச்சுத்திணறல்)/.test(raw) ||
      /(सांस नहीं आ रही|सांस लेने में बहुत दिक्कत)/.test(raw) ||
      /(శ్వాస ఆడట్లేదు)/.test(raw) ||
      /(ശ്വാസമെടുക്കാൻ പറ്റുന്നില്ല)/.test(raw) ||
      /(ಉಸಿರಾಡಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ|ಉಸಿರು ಕಟ್ಟಿದಂತಾಗುವುದು)/.test(raw)
    ) {
      redFlags.push('Severe breathing difficulty / acute respiratory failure. Immediate airway support required.');
      concept = 'BREATHING_DIFFICULTY';
    }

    // 2. Severe chest pain / Acute coronary syndrome
    if (
      /\b(severe chest pain|crushing chest pain|chest pressure|heart attack|radiating chest pain)\b/i.test(
        lower
      ) ||
      /(கடுமையான நெஞ்சு வலி|நெஞ்சை அடைப்பது)/.test(raw) ||
      /(सीने में तेज दर्द|दिल का दौरा)/.test(raw) ||
      /(తీవ్రమైన ఛాతీ నొప్పి)/.test(raw) ||
      /(കഠിനമായ നെഞ്ചുവേദന)/.test(raw) ||
      /(ತೀವ್ರ ಎದೆ ನೋವು)/.test(raw)
    ) {
      redFlags.push('Severe chest pain / acute coronary event warning. Immediate ECG and emergency evaluation needed.');
      concept = 'CHEST_PAIN';
    }

    // 3. Unconsciousness / Loss of consciousness / Seizure
    if (
      /\b(unconscious|passed out|fainted|loss of consciousness|seizure|convulsions|fits|blackout|unresponsive)\b/i.test(
        lower
      ) ||
      /(மயக்கம்|வலிப்பு|நினைவிழப்பு)/.test(raw) ||
      /(बेहोश|दौरा|मूर्छा)/.test(raw) ||
      /(స్పృహ తప్పడం|మూర్ఛ)/.test(raw) ||
      /(ബോധക്ഷയം|അപസ്മാരം)/.test(raw) ||
      /(ಪ್ರಜ್ಞೆ ತಪ್ಪುವುದು|ಮೂರ್ಛೆ)/.test(raw)
    ) {
      redFlags.push('Loss of consciousness, unresponsive state, or active seizure. Risk of hypoxia or airway compromise.');
      concept = 'UNCONSCIOUSNESS';
    }

    // 4. Severe bleeding / Hemorrhage
    if (
      /\b(severe bleeding|uncontrolled bleeding|coughing blood|vomiting blood|massive hemorrhage)\b/i.test(
        lower
      ) ||
      /(அதிக இரத்தப்போக்கு|ரத்த வாந்தி)/.test(raw) ||
      /(खून की उल्टी|अत्यधिक रक्तस्राव)/.test(raw) ||
      /(తీవ్ర రక్తస్రావం)/.test(raw)
    ) {
      redFlags.push('Acute severe or uncontrolled bleeding. Immediate hemostasis and IV volume resuscitation required.');
      concept = 'BLEEDING';
    }

    // 5. Stroke-like symptoms / Neurological deficit
    if (
      /\b(stroke|face drooping|arm weakness|slurred speech|sudden paralysis|facial asymmetry)\b/i.test(
        lower
      ) ||
      /(பக்கவாதம்|வாய் கோணுதல்|பேச்சு குழறுதல்)/.test(raw) ||
      /(लकवा|मुंह टेढ़ा होना)/.test(raw) ||
      /(పక్షవాతం)/.test(raw)
    ) {
      redFlags.push('Acute stroke signs (FAST criteria). Time-critical neurological intervention window.');
      concept = 'STROKE_SIGNS';
    }

    // 6. Severe allergic reaction / Anaphylaxis
    if (
      /\b(anaphylaxis|swollen throat|swollen tongue|severe allergic reaction|stridor)\b/i.test(
        lower
      ) ||
      /(மூச்சுக்குழாய் வீக்கம்|ஒவ்வாமை அதிர்ச்சி)/.test(raw) ||
      /(गंभीर एलर्जी|गले में सूजन)/.test(raw)
    ) {
      redFlags.push('Anaphylaxis / severe systemic allergic reaction. Intramuscular epinephrine may be indicated.');
      concept = 'ALLERGIC_REACTION';
    }

    // 7. Check JSON-based emergency rules from local medical database
    for (const rule of EMERGENCY_RULES) {
      for (const langKeywords of Object.values(rule.keywords)) {
        for (const kw of langKeywords) {
          if (lower.includes(kw.toLowerCase()) || raw.includes(kw)) {
            if (!concept) concept = rule.concept;
            for (const rf of rule.redFlags) {
              if (!redFlags.includes(rf)) redFlags.push(rf);
            }
            break;
          }
        }
      }
    }

    return {
      isEmergency: redFlags.length > 0,
      redFlags,
      concept,
    };
  }

  /**
   * Extracts and normalizes clinical symptoms from text across all 6 languages.
   */
  public extractNormalizedSymptoms(text: string): {
    concepts: string[];
    canonicalNames: string[];
  } {
    const raw = (text || '').trim();
    const lower = raw.toLowerCase();
    const matchedConcepts = new Set<string>();
    const canonicalNames: string[] = [];

    for (const [conceptId, def] of Object.entries(NORMALIZED_SYMPTOMS)) {
      let matched = false;
      for (const aliases of Object.values(def.aliases)) {
        for (const alias of aliases) {
          if (lower.includes(alias.toLowerCase()) || raw.includes(alias)) {
            matchedConcepts.add(conceptId);
            canonicalNames.push(def.canonicalName);
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    }

    // Check JSON-based multilingual symptom dictionary from local medical database
    for (const [conceptId, def] of Object.entries(MULTILINGUAL_SYMPTOMS)) {
      if (matchedConcepts.has(conceptId)) continue;
      let matched = false;
      for (const aliases of Object.values(def.aliases)) {
        for (const alias of aliases) {
          if (lower.includes(alias.toLowerCase()) || raw.includes(alias)) {
            matchedConcepts.add(conceptId);
            canonicalNames.push(def.canonical);
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    }

    // Check newly added dictionary.json symptoms schema
    if (dictionaryData && Array.isArray((dictionaryData as any).symptoms)) {
      for (const item of (dictionaryData as any).symptoms) {
        if (matchedConcepts.has(item.token)) continue;
        let matched = false;
        if (item.colloquial) {
          for (const phrases of Object.values(item.colloquial as Record<string, string[]>)) {
            for (const phrase of phrases) {
              if (lower.includes(phrase.toLowerCase()) || raw.includes(phrase)) {
                matchedConcepts.add(item.token);
                canonicalNames.push(item.canonical || item.token);
                matched = true;
                break;
              }
            }
            if (matched) break;
          }
        }
      }
    }

    return {
      concepts: Array.from(matchedConcepts),
      canonicalNames,
    };
  }

  /**
   * Main Medical AI Reasoning Pipeline.
   * Guaranteed offline-first:
   * INPUT
   *  ↓
   * Emergency Rules Check
   *  ↓
   * Symptom Extraction
   *  ↓
   * Symptom Normalization
   *  ↓
   * Medical Number Extraction
   *  ↓
   * Medical History Extraction
   *  ↓
   * Medication Extraction
   *  ↓
   * Allergy Extraction
   *  ↓
   * Duration Extraction
   *  ↓
   * Severity Extraction
   *  ↓
   * Local Medical Knowledge Matching
   *  ↓
   * Differential Assessment
   *  ↓
   * Red Flag Detection
   *  ↓
   * Recommended Next Step
   *  ↓
   * Structured Medical Response
   */
  public async analyzeMedicalRequest(
    request: MedicalAnalysisRequest
  ): Promise<StructuredMedicalResponse> {
    const input = request.patientInput || '';

    // Step 1: Medical value protection (extracts & preserves numbers, units, meds)
    const { protectedText, values } = protectMedicalValues(input);

    // Step 2: Emergency Rules Check (Deterministic, offline, highest priority)
    const emergencyCheck = this.evaluateEmergencyRules(input);

    // Step 3 & 4: Symptom Extraction & Normalization
    const { concepts: symptomConcepts, canonicalNames: symptomNames } =
      this.extractNormalizedSymptoms(input);

    // Step 5: Medical Number Extraction & Value Preservation
    const measurements: string[] = [];

    // Temperature: preserve exact values e.g. 102°F, 38.5°C
    let temperature = request.temperature;
    const tempMatch = input.match(/(\d{2,3}(?:\.\d+)?\s*°?\s*[FCfc]\b)/);
    if (tempMatch) {
      temperature = tempMatch[1].trim();
      measurements.push(`Temperature: ${temperature}`);
    } else if (request.temperature) {
      measurements.push(`Temperature: ${request.temperature}`);
    }

    // Blood Pressure: preserve exact values e.g. 120/80, 160/100
    let bloodPressure = request.bloodPressure;
    const bpMatch = input.match(/(\b\d{2,3}\s*\/\s*\d{2,3}(?:\s*mmHg)?\b)/i);
    if (bpMatch) {
      bloodPressure = bpMatch[1].trim();
      measurements.push(`Blood Pressure: ${bloodPressure}`);
    } else if (request.bloodPressure) {
      measurements.push(`Blood Pressure: ${request.bloodPressure}`);
    }

    // Blood Sugar: preserve e.g. 180 mg/dL
    let bloodSugar = request.bloodSugar;
    const bsMatch = input.match(/(\b\d{2,3}(?:\.\d+)?\s*mg\s*\/\s*d[Ll]\b)/i);
    if (bsMatch) {
      bloodSugar = bsMatch[1].trim();
      measurements.push(`Blood Sugar: ${bloodSugar}`);
    } else if (request.bloodSugar) {
      measurements.push(`Blood Sugar: ${request.bloodSugar}`);
    }

    // SpO2: preserve e.g. 94%
    let spo2 = request.spo2;
    const spo2Match = input.match(/(\b\d{2,3}\s*%\b)/);
    if (spo2Match) {
      spo2 = spo2Match[1].trim();
      measurements.push(`SpO2: ${spo2}`);
    } else if (request.spo2) {
      measurements.push(`SpO2: ${request.spo2}`);
    }

    // Weight: preserve e.g. 55 kg
    let weight = request.weight;
    const weightMatch = input.match(/(\b\d{1,3}(?:\.\d+)?\s*kg\b)/i);
    if (weightMatch) {
      weight = weightMatch[1].trim();
      measurements.push(`Weight: ${weight}`);
    } else if (request.weight) {
      measurements.push(`Weight: ${request.weight}`);
    }

    // Step 6: Medical History Extraction
    const medicalHistory: string[] = [...(request.medicalHistory || [])];
    if (/\b(hypertension|high blood pressure|bp)\b/i.test(input) && !medicalHistory.includes('Hypertension')) {
      medicalHistory.push('Hypertension');
    }
    if (/\b(diabetes|sugar|high blood sugar)\b/i.test(input) && !medicalHistory.includes('Diabetes Mellitus')) {
      medicalHistory.push('Diabetes Mellitus');
    }
    if (/\b(asthma|wheezing)\b/i.test(input) && !medicalHistory.includes('Asthma / Reactive Airway')) {
      medicalHistory.push('Asthma / Reactive Airway');
    }

    // Step 7: Medication Extraction
    const medications: string[] = [...(request.medications || [])];
    const foundMeds = values.filter((v) => v.type === 'medicine').map((v) => v.original);
    for (const med of foundMeds) {
      if (!medications.includes(med)) medications.push(med);
    }

    // Step 8: Allergy Extraction
    const allergies: string[] = [...(request.allergies || [])];
    const allergyMatch = input.match(/allergic to ([a-z0-9\s]+)/i);
    if (allergyMatch) {
      allergies.push(allergyMatch[1].trim());
    }

    // Step 9: Duration Extraction
    let duration = request.duration || 'Not recorded';
    const durMatch = input.match(
      /(?:^|\s|[.,!?])(\d+\s*(?:days?|weeks?|months?|hours?|நாட்கள்|நாட்களாக|दिन|రోజులు|ദിവസം|ದಿನ))/i
    );
    if (durMatch) {
      // Normalize units while preserving exact number
      const numMatch = durMatch[1].match(/\d+/);
      const num = numMatch ? numMatch[0] : '';
      if (/(days?|நாட்கள்|நாட்களாக|दिन|రోజులు|ദിവസം|ದಿನ)/i.test(durMatch[1])) {
        duration = `${num} days`;
      } else if (/(weeks?)/i.test(durMatch[1])) {
        duration = `${num} weeks`;
      } else if (/(hours?)/i.test(durMatch[1])) {
        duration = `${num} hours`;
      } else {
        duration = durMatch[1].trim();
      }
    }

    // Step 10: Severity Extraction
    let severity = 'Mild';
    if (emergencyCheck.isEmergency) {
      severity = 'Severe / Emergency';
    } else if (symptomConcepts.length > 2 || (temperature && parseFloat(temperature) >= 102)) {
      severity = 'Moderate to High';
    } else if (symptomConcepts.length > 0) {
      severity = 'Mild to Moderate';
    }

    // Step 11: Unknown Medical Input Guard
    // If no symptoms, no emergency, and no measurements recognized
    const isUnknown =
      !emergencyCheck.isEmergency &&
      symptomConcepts.length === 0 &&
      measurements.length === 0 &&
      !/\b(report|xray|x-ray|scan|medicine|tablet|bp|sugar)\b/i.test(input);

    if (isUnknown) {
      const unknownResponse: StructuredMedicalResponse = {
        mode: 'OFFLINE',
        chiefComplaint: 'Unspecified medical inquiry',
        symptoms: [],
        duration: 'Not recorded',
        severity: 'Unknown',
        measurements: [],
        medicalHistory: medicalHistory,
        medications: medications,
        allergies: allergies,
        observations: [],
        possibleConditions: [],
        supportingEvidence: [],
        missingInformation: [],
        redFlags: [],
        emergencyDetected: false,
        recommendedNextStep:
          "I don't have enough information to assess this safely. Please describe specific symptoms (e.g. fever, cough, chest pain, duration) or consult a healthcare professional.",
        requiresUrgentCare: false,
        requiresDoctorReview: true,
        confidenceStatus: 'INSUFFICIENT_INFORMATION',
        source: 'LOCAL_MEDICAL_ENGINE',
        summaryText: "I don't have enough information to assess this safely. Please provide your symptoms or consult a doctor.",
      };
      return this.validateOutput(unknownResponse);
    }

    // Step 12: Online Gemini Call (Optional, only if online, not forced offline, and configured)
    const isOnline =
      typeof navigator !== 'undefined' &&
      navigator.onLine === true &&
      !request.forceOffline;

    if (isOnline) {
      try {
        const geminiRes = await this.tryOnlineGeminiAnalysis(
          request,
          duration,
          temperature,
          measurements,
          symptomNames,
          emergencyCheck
        );
        if (geminiRes) {
          return this.validateOutput(geminiRes);
        }
      } catch (err) {
        console.warn(
          '[MedicalService] Online Gemini failed, seamlessly falling back to offline Local Medical Engine:',
          err
        );
      }
    }

    // Step 13: Local Medical Knowledge Matching & Differential Assessment
    const localResult = this.generateLocalReasoningAssessment({
      input,
      symptomConcepts,
      symptomNames,
      duration,
      temperature,
      bloodPressure,
      bloodSugar,
      spo2,
      measurements,
      medicalHistory,
      medications,
      allergies,
      severity,
      emergencyCheck,
      isFallback: isOnline,
    });

    return this.validateOutput(localResult);
  }

  /**
   * Deterministic local medical reasoning engine.
   * Produces structured differential diagnosis without any network dependencies.
   */
  private generateLocalReasoningAssessment(params: {
    input: string;
    symptomConcepts: string[];
    symptomNames: string[];
    duration: string;
    temperature?: string;
    bloodPressure?: string;
    bloodSugar?: string;
    spo2?: string;
    measurements: string[];
    medicalHistory: string[];
    medications: string[];
    allergies: string[];
    severity: string;
    emergencyCheck: { isEmergency: boolean; redFlags: string[] };
    isFallback: boolean;
  }): StructuredMedicalResponse {
    const {
      symptomConcepts,
      symptomNames,
      duration,
      temperature,
      bloodPressure,
      measurements,
      medicalHistory,
      medications,
      allergies,
      emergencyCheck,
      isFallback,
    } = params;

    const possibleConditions: PossibleCondition[] = [];
    const missingInformation: string[] = [];

    // Probing missing clinical information
    if (duration === 'Not recorded') missingInformation.push('Exact symptom duration (hours or days)');
    if (!temperature && symptomConcepts.includes('FEVER')) missingInformation.push('Body temperature thermometer reading (°F/°C)');
    if (!bloodPressure && (symptomConcepts.includes('CHEST_PAIN') || symptomConcepts.includes('HEADACHE'))) {
      missingInformation.push('Resting blood pressure measurement (mmHg)');
    }
    if (medicalHistory.length === 0) missingInformation.push('Past medical history or pre-existing chronic conditions');
    if (medications.length === 0) missingInformation.push('Current daily prescription medications');

    // Rule 1: Emergency Breathing / Chest Pain
    if (emergencyCheck.isEmergency) {
      if (symptomConcepts.includes('BREATHING_DIFFICULTY')) {
        possibleConditions.push({
          condition: 'Acute Respiratory Distress / Severe Bronchospasm',
          supportingEvidence: [
            'Reported acute breathing difficulty or inability to breathe',
            duration !== 'Not recorded' ? `Reported duration: ${duration}` : 'Acute presentation',
            ...(params.spo2 ? [`Recorded SpO2: ${params.spo2}`] : []),
          ],
          contradictingEvidence: ['Detailed pulmonary auscultation required to exclude pneumothorax or foreign body'],
          missingInformation: ['Oxygen saturation reading (SpO2)', 'History of asthma or COPD'],
          reasoning: 'Severe respiratory compromise is a critical medical emergency requiring immediate in-person clinical stabilization.',
        });
      }

      if (symptomConcepts.includes('CHEST_PAIN')) {
        possibleConditions.push({
          condition: 'Acute Coronary Syndrome / Myocardial Ischemia',
          supportingEvidence: [
            'Severe or crushing chest discomfort reported',
            ...(bloodPressure ? [`Blood pressure: ${bloodPressure}`] : []),
          ],
          contradictingEvidence: ['Absence of 12-lead ECG and cardiac enzymes in remote setting'],
          missingInformation: ['12-lead ECG', 'Serum Troponin-I', 'Cardiovascular risk factors'],
          reasoning: 'Acute chest pain requires urgent clinical exclusion of acute coronary syndrome.',
        });
      }
    }

    // Rule 2: Fever + Cough / Cold / Sore throat -> Respiratory Infection
    if (
      symptomConcepts.includes('FEVER') &&
      (symptomConcepts.includes('COUGH') || symptomConcepts.includes('COLD') || symptomConcepts.includes('SORE_THROAT'))
    ) {
      possibleConditions.push({
        condition: 'Acute Upper Respiratory Tract Infection (URTI)',
        supportingEvidence: [
          'Co-occurrence of fever and acute respiratory symptoms',
          duration !== 'Not recorded' ? `Symptom duration of ${duration}` : 'Acute symptom onset',
          temperature ? `Documented temperature of ${temperature}` : 'Presence of fever',
        ],
        contradictingEvidence: ['Absence of focal chest signs or persistent high-grade fever with purulent sputum on initial history'],
        missingInformation: ['Sputum color and consistency', 'Associated breathing difficulty on exertion'],
        reasoning: 'Classic constellation of fever paired with cough and upper airway irritation indicates acute viral respiratory tract involvement.',
      });

      possibleConditions.push({
        condition: 'Influenza-like Illness (ILI)',
        supportingEvidence: [
          'Acute onset of febrile respiratory syndrome',
          symptomConcepts.includes('BODY_PAIN') || symptomConcepts.includes('HEADACHE') ? 'Associated systemic myalgia / headache' : 'Constitutional febrile symptoms',
        ],
        contradictingEvidence: ['Rapid antigen or viral PCR confirmation pending'],
        missingInformation: ['Seasonal epidemic exposure or contact with sick individuals'],
        reasoning: 'Acute viral febrile illness characterized by fever, cough, and constitutional discomfort.',
      });
    }

    // Rule 3: Fever alone or with headache/body pain
    if (symptomConcepts.includes('FEVER') && possibleConditions.length === 0) {
      possibleConditions.push({
        condition: 'Acute Febrile Illness (Undifferentiated)',
        supportingEvidence: [
          'Presence of fever',
          temperature ? `Recorded temperature: ${temperature}` : 'Fever reported by patient',
          duration !== 'Not recorded' ? `Duration: ${duration}` : 'Acute onset',
        ],
        contradictingEvidence: ['No localized organ-specific signs identified in patient description'],
        missingInformation: ['Complete blood count (CBC)', 'Malaria rapid test / Dengue serology if in endemic zone'],
        reasoning: 'Acute febrile episode without localized signs warrants watchful observation, hydration, and medical review if persisting beyond 48-72 hours.',
      });

      possibleConditions.push({
        condition: 'Viral Syndrome',
        supportingEvidence: [
          'Systemic fever presentation',
          symptomConcepts.includes('BODY_PAIN') ? 'Accompanying generalized body ache' : 'Systemic febrile presentation',
        ],
        contradictingEvidence: ['Requires exclusion of bacterial focus by physical examination'],
        missingInformation: ['Presence of rash, joint swelling, or urinary symptoms'],
        reasoning: 'Common viral etiologies frequently present with acute fever and systemic malaise.',
      });
    }

    // Rule 4: Stomach pain + Vomiting or Diarrhea
    if (
      symptomConcepts.includes('STOMACH_PAIN') ||
      symptomConcepts.includes('VOMITING') ||
      symptomConcepts.includes('DIARRHEA')
    ) {
      possibleConditions.push({
        condition: 'Acute Gastroenteritis / Enteritis',
        supportingEvidence: [
          symptomConcepts.includes('VOMITING') ? 'Reported vomiting / nausea' : 'Gastrointestinal symptoms',
          symptomConcepts.includes('DIARRHEA') ? 'Reported watery or loose stools' : 'Abdominal cramps',
          duration !== 'Not recorded' ? `Duration: ${duration}` : 'Acute onset',
        ],
        contradictingEvidence: ['Absence of peritoneal signs or high-grade fever in reported description'],
        missingInformation: ['Hydration status (thirst, skin turgor, urine output)', 'Recent food or water contamination exposure'],
        reasoning: 'Gastrointestinal inflammation characterized by nausea, vomiting, abdominal cramping, and fluid loss.',
      });
    }

    // Rule 5: Headache alone
    if (symptomConcepts.includes('HEADACHE') && possibleConditions.length === 0) {
      possibleConditions.push({
        condition: 'Tension-type Headache / Cephalea',
        supportingEvidence: [
          'Reported head discomfort or headache',
          duration !== 'Not recorded' ? `Duration: ${duration}` : 'Recent onset',
        ],
        contradictingEvidence: ['Absence of focal neurological deficits, visual aura, or neck rigidity on initial screening'],
        missingInformation: ['Blood pressure check', 'Screen time / sleep deprivation history', 'Neck stiffness or photophobia'],
        reasoning: 'Most frequent cause of non-specific cephalic pain, requiring exclusion of secondary causes by a clinician.',
      });
    }

    // Rule 6: High Blood Pressure
    if (symptomConcepts.includes('HIGH_BLOOD_PRESSURE') || (bloodPressure && parseInt(bloodPressure) >= 140)) {
      possibleConditions.push({
        condition: 'Hypertension Evaluation / Elevated Blood Pressure',
        supportingEvidence: [
          bloodPressure ? `Recorded blood pressure reading: ${bloodPressure}` : 'Reported elevated blood pressure concern',
          medicalHistory.includes('Hypertension') ? 'Known history of hypertension' : 'New high reading screening',
        ],
        contradictingEvidence: ['Single reading requires repeat calibrated protocol measurement under resting conditions'],
        missingInformation: ['Serial resting BP measurements on multiple days', 'Cardiovascular risk profile'],
        reasoning: 'Elevated systolic or diastolic blood pressure requires systematic clinical verification and lifestyle/medication review.',
      });
    }

    // Check JSON-based condition mappings from local medical database
    for (const mapping of CONDITION_MAPPINGS) {
      const hasPrimary = mapping.primarySymptoms.some((s) => symptomConcepts.includes(s));
      const alreadyIncluded = possibleConditions.some((pc) => pc.condition.toLowerCase().includes(mapping.name.toLowerCase()));
      if (hasPrimary && !alreadyIncluded) {
        const matchedPrimary = mapping.primarySymptoms.filter((s) => symptomConcepts.includes(s));
        const matchedSecondary = mapping.secondarySymptoms.filter((s) => symptomConcepts.includes(s));
        const matchedContra = mapping.contradictingSymptoms.filter((s) => symptomConcepts.includes(s));

        possibleConditions.push({
          condition: mapping.name,
          supportingEvidence: [
            ...matchedPrimary.map((s) => `Primary symptom present: ${s}`),
            ...matchedSecondary.map((s) => `Associated secondary symptom present: ${s}`),
            duration !== 'Not recorded' ? `Reported duration: ${duration}` : `Typical course: ${mapping.typicalDuration}`,
          ],
          contradictingEvidence:
            matchedContra.length > 0
              ? matchedContra.map((s) => `Unusual symptom in this presentation: ${s}`)
              : ['Clinical differentiation requires in-person medical examination and lab confirmation'],
          missingInformation: mapping.missingInformation,
          reasoning: mapping.reasoning,
        });
      }
    }

    // Check JSON-based condition mappings from conditions.json
    if (conditionsData && Array.isArray((conditionsData as any).conditions)) {
      for (const cond of (conditionsData as any).conditions) {
        const hasPrimary = Array.isArray(cond.primarySymptoms) && cond.primarySymptoms.some((s: string) => symptomConcepts.includes(s));
        const alreadyIncluded = possibleConditions.some((pc) => pc.condition.toLowerCase().includes(cond.name.toLowerCase()));
        if (hasPrimary && !alreadyIncluded) {
          const matchedPrimary = (cond.primarySymptoms as string[]).filter((s) => symptomConcepts.includes(s));
          const matchedSecondary = Array.isArray(cond.secondarySymptoms)
            ? (cond.secondarySymptoms as string[]).filter((s) => symptomConcepts.includes(s))
            : [];
          const matchedContra = Array.isArray(cond.contradictingEvidence)
            ? cond.contradictingEvidence
            : ['Clinical differentiation requires in-person physical evaluation'];

          possibleConditions.push({
            condition: cond.name,
            supportingEvidence: [
              ...matchedPrimary.map((s) => `Primary symptom confirmed: ${s}`),
              ...matchedSecondary.map((s) => `Secondary symptom confirmed: ${s}`),
              ...(Array.isArray(cond.supportingEvidence) ? cond.supportingEvidence.slice(0, 2) : []),
              duration !== 'Not recorded' ? `Reported duration: ${duration}` : 'Acute presentation',
            ],
            contradictingEvidence: matchedContra,
            missingInformation: Array.isArray(cond.missingInformation) ? cond.missingInformation : [],
            reasoning: cond.reasoning || 'Pattern-matched differential diagnosis from local medical database.',
          });
        }
      }
    }

    // Fallback condition if symptoms exist but didn't trigger specific branch
    if (possibleConditions.length === 0 && symptomNames.length > 0) {
      possibleConditions.push({
        condition: `Evaluation of ${symptomNames.join(', ')}`,
        supportingEvidence: [
          `Reported symptom presence: ${symptomNames.join(', ')}`,
          duration !== 'Not recorded' ? `Duration: ${duration}` : 'Current presentation',
        ],
        contradictingEvidence: ['Complete physical examination required to determine definitive etiology'],
        missingInformation: missingInformation,
        reasoning: 'Clinical presentation requires comprehensive in-person medical evaluation to establish precise diagnostic classification.',
      });
    }

    // Recommended Next Step
    let recommendedNextStep: string;
    if (emergencyCheck.isEmergency) {
      recommendedNextStep =
        'IMMEDIATE EMERGENCY: Dial 108 or proceed to the nearest emergency department / hospital immediately. Do not delay.';
    } else if (symptomConcepts.includes('FEVER') && duration !== 'Not recorded' && parseInt(duration) >= 3) {
      recommendedNextStep =
        'Schedule an in-person clinical review at your nearest Primary Health Centre (PHC) or clinic for laboratory testing and physical examination.';
    } else {
      recommendedNextStep =
        'Present this structured summary to a licensed doctor or community health officer for clinical review and confirmation.';
    }

    const chiefComplaint =
      symptomNames.length > 0
        ? symptomNames.join(', ')
        : (emergencyCheck.redFlags[0] || 'Medical symptom evaluation');

    const mostLikely =
      possibleConditions.length > 0 ? possibleConditions[0].condition : chiefComplaint;

    const summaryText = emergencyCheck.isEmergency
      ? `EMERGENCY ALERT: Immediate red flag detected (${emergencyCheck.redFlags[0]}). Please call 108 or reach the nearest emergency hospital immediately.`
      : `Offline medical assessment completed for: ${chiefComplaint}. Most likely possibility: ${mostLikely}. Duration: ${duration}. Doctor review required.`;

    const mode: MedicalExecutionMode = isFallback ? 'ONLINE_FALLBACK' : 'OFFLINE';

    // Supporting evidence summarized across most likely differentials
    const topSupportingEvidence: string[] =
      possibleConditions.length > 0 && possibleConditions[0].supportingEvidence
        ? possibleConditions[0].supportingEvidence
        : [];

    return {
      mode,
      chiefComplaint,
      symptoms: symptomNames,
      duration,
      severity: params.severity,
      measurements,
      medicalHistory,
      medications,
      allergies,
      observations: [],
      possibleConditions,
      supportingEvidence: topSupportingEvidence,
      missingInformation,
      redFlags: emergencyCheck.redFlags,
      emergencyDetected: emergencyCheck.isEmergency,
      recommendedNextStep,
      requiresUrgentCare: emergencyCheck.isEmergency,
      requiresDoctorReview: true,
      confidenceStatus: 'NOT_CLINICALLY_VALIDATED',
      source: 'LOCAL_MEDICAL_ENGINE',
      summaryText,
      isOfflineFallback: isFallback,
      diagnosticAssessment: {
        mostLikelyCondition: mostLikely,
        differentialDiagnoses: possibleConditions.map((pc) => ({
          condition: pc.condition,
          supportingEvidence: pc.supportingEvidence,
          contradictingEvidence: pc.contradictingEvidence,
          confidence: null,
        })),
      },
      clinicalAssessment: {
        chiefComplaint,
        symptoms: symptomNames,
        duration,
        severity: params.severity,
        measurements,
        medicalHistory,
        medications,
        allergies,
      },
    };
  }

  /**
   * Online Gemini Medical reasoning integration.
   * Only called when online and configured.
   */
  private async tryOnlineGeminiAnalysis(
    request: MedicalAnalysisRequest,
    duration: string,
    temperature: string | undefined,
    measurements: string[],
    symptomNames: string[],
    emergencyCheck: { isEmergency: boolean; redFlags: string[] }
  ): Promise<StructuredMedicalResponse | null> {
    const prompt = `Please perform structured clinical reasoning according to Medora medical guidelines:\n` +
      `Patient Complaint: ${request.patientInput}\n` +
      `Recorded Symptoms: ${symptomNames.join(', ') || 'Not specified'}\n` +
      `Duration: ${duration}\n` +
      `Temperature: ${temperature || 'Not recorded'}\n` +
      `Measurements: ${measurements.join(', ') || 'None'}\n` +
      `Medical History: ${(request.medicalHistory || []).join(', ') || 'None'}\n` +
      `Current Medications: ${(request.medications || []).join(', ') || 'None'}\n` +
      `Known Allergies: ${(request.allergies || []).join(', ') || 'None'}.`;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        role: 'symptoms',
        language: request.language || 'en',
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const reply = data.reply || '';

    // Attempt to parse structured response if returned
    let parsed: any = null;
    try {
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {}

    if (parsed && (parsed.diagnosticAssessment || parsed.possibleConditions)) {
      const conditions: PossibleCondition[] =
        parsed.possibleConditions ||
        (parsed.diagnosticAssessment?.differentialDiagnoses || []).map((d: any) => ({
          condition: d.condition || 'Clinical possibility',
          supportingEvidence: d.supportingEvidence || [],
          contradictingEvidence: d.contradictingEvidence || [],
          missingInformation: d.missingInformation || [],
          reasoning: d.reasoning || '',
        }));

      const chiefComplaint =
        parsed.clinicalAssessment?.chiefComplaint ||
        parsed.chiefComplaint ||
        symptomNames[0] ||
        'Reported symptoms';

      return {
        mode: 'ONLINE',
        chiefComplaint,
        symptoms: parsed.clinicalAssessment?.symptoms || symptomNames,
        duration: parsed.clinicalAssessment?.duration || duration,
        severity: parsed.clinicalAssessment?.severity || (emergencyCheck.isEmergency ? 'Severe / Emergency' : 'Moderate'),
        measurements: parsed.clinicalAssessment?.measurements || measurements,
        medicalHistory: request.medicalHistory || [],
        medications: request.medications || [],
        allergies: request.allergies || [],
        possibleConditions: conditions,
        redFlags: [...emergencyCheck.redFlags, ...(parsed.redFlags || [])],
        emergencyDetected: Boolean(emergencyCheck.isEmergency || parsed.emergencyDetected || parsed.requiresUrgentCare),
        recommendedNextStep:
          parsed.recommendedNextStep ||
          (emergencyCheck.isEmergency
            ? 'IMMEDIATE EMERGENCY: Dial 108 or proceed to nearest hospital immediately.'
            : 'Present this structured summary to a licensed doctor for clinical confirmation.'),
        requiresUrgentCare: Boolean(emergencyCheck.isEmergency || parsed.requiresUrgentCare),
        requiresDoctorReview: true,
        confidenceStatus: 'AI_ASSESSMENT_REQUIRES_CLINICAL_VERIFICATION',
        source: 'GEMINI_ONLINE',
        summaryText: reply,
      };
    }

    return null;
  }

  /**
   * Performs schema validation on the structured medical response,
   * returning validation errors if the output does not strictly adhere to Medora JSON schema.
   */
  public validateSchema(response: any): MedicalSchemaValidationResult {
    return validateMedicalSchema(response);
  }

  /**
   * Validates that the structured response conforms exactly to the required Medora schema.
   * Runs validateMedicalResponse() and returns a safe fallback if invalid,
   * while never overriding an emergency detection flag.
   */
  public validateOutput(response: StructuredMedicalResponse): StructuredMedicalResponse {
    // 1. First run schema validation directly on raw response
    const directValidation = validateMedicalResponse(response);

    if (!directValidation.valid) {
      console.warn('[MedicalService] Direct schema validation failed:', directValidation.errors);
      const isEmergency = Boolean(
        response &&
          typeof response === 'object' &&
          ((response as any).emergencyDetected || (response as any).requiresUrgentCare)
      );
      const redFlags =
        response && typeof response === 'object' && Array.isArray((response as any).redFlags)
          ? (response as any).redFlags
          : [];
      const fallback = createSafeMedicalFallback(isEmergency, redFlags);
      return fallback as unknown as StructuredMedicalResponse;
    }

    // 2. Build sanitized candidate response
    const candidate: StructuredMedicalResponse = {
      mode: response.mode || 'OFFLINE',
      chiefComplaint: String(response.chiefComplaint ?? ''),
      symptoms: Array.isArray(response.symptoms) ? response.symptoms : [],
      duration: String(response.duration ?? ''),
      severity: String(response.severity ?? ''),
      measurements: response.measurements !== null && typeof response.measurements === 'object'
        ? response.measurements
        : [],
      medicalHistory: Array.isArray(response.medicalHistory) ? response.medicalHistory : [],
      medications: Array.isArray(response.medications) ? response.medications : [],
      allergies: Array.isArray(response.allergies) ? response.allergies : [],
      observations: Array.isArray(response.observations) ? response.observations : [],
      possibleConditions: Array.isArray(response.possibleConditions)
        ? response.possibleConditions.map((pc) => ({
            id: pc.id,
            name: pc.name || pc.condition,
            condition: String(pc.condition || pc.name || ''),
            supportingEvidence: Array.isArray(pc.supportingEvidence) ? pc.supportingEvidence : [],
            contradictingEvidence: Array.isArray(pc.contradictingEvidence) ? pc.contradictingEvidence : [],
            missingInformation: Array.isArray(pc.missingInformation) ? pc.missingInformation : [],
            redFlags: Array.isArray(pc.redFlags) ? pc.redFlags : [],
            requiresDoctorReview: pc.requiresDoctorReview ?? true,
            reasoning: String(pc.reasoning || ''),
          }))
        : [],
      supportingEvidence: Array.isArray(response.supportingEvidence)
        ? response.supportingEvidence
        : (response.possibleConditions?.[0]?.supportingEvidence || []),
      missingInformation: Array.isArray(response.missingInformation) ? response.missingInformation : [],
      redFlags: Array.isArray(response.redFlags) ? response.redFlags : [],
      emergencyDetected: Boolean(response.emergencyDetected),
      recommendedNextStep: String(response.recommendedNextStep ?? ''),
      requiresUrgentCare: Boolean(response.requiresUrgentCare),
      requiresDoctorReview: true, // Always true for clinical safety
      confidenceStatus: response.confidenceStatus || 'NOT_CLINICALLY_VALIDATED',
      source: response.source || 'LOCAL_MEDICAL_ENGINE',
      summaryText: response.summaryText,
      isOfflineFallback: response.isOfflineFallback,
      diagnosticAssessment: response.diagnosticAssessment,
      clinicalAssessment: response.clinicalAssessment,
    };

    return candidate;
  }
}

/**
 * Validates that any response produced by the offline medical reasoning engine
 * strictly adheres to the required Medora Medical Response JSON structure
 * BEFORE that output is returned to the UI.
 * 
 * Works 100% offline using only local TypeScript logic.
 * Never throws unhandled exceptions.
 * Uses unknown rather than any.
 */
export function validateMedicalResponse(response: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (response === null || typeof response !== 'object' || Array.isArray(response)) {
    return {
      valid: false,
      errors: ['Response must be a non-null object.'],
    };
  }

  const res = response as Record<string, unknown>;

  // 1. chiefComplaint: string
  if (typeof res.chiefComplaint !== 'string') {
    errors.push('chiefComplaint must be a string');
  }

  // 2. symptoms: array
  if (!Array.isArray(res.symptoms)) {
    errors.push('symptoms must be an array');
  }

  // 3. duration: string
  if (typeof res.duration !== 'string') {
    errors.push('duration must be a string');
  }

  // 4. severity: string
  if (typeof res.severity !== 'string') {
    errors.push('severity must be a string');
  }

  // 5. measurements: object (must be an object and not null)
  if (res.measurements === null || typeof res.measurements !== 'object') {
    errors.push('measurements must be an object');
  }

  // 6. medicalHistory: array
  if (!Array.isArray(res.medicalHistory)) {
    errors.push('medicalHistory must be an array');
  }

  // 7. medications: array
  if (!Array.isArray(res.medications)) {
    errors.push('medications must be an array');
  }

  // 8. allergies: array
  if (!Array.isArray(res.allergies)) {
    errors.push('allergies must be an array');
  }

  // 9. observations: array
  if (!Array.isArray(res.observations)) {
    errors.push('observations must be an array');
  }

  // 10. possibleConditions: array
  if (!Array.isArray(res.possibleConditions)) {
    errors.push('possibleConditions must be an array');
  } else {
    // Validate each condition in possibleConditions
    res.possibleConditions.forEach((item, idx) => {
      if (item === null || typeof item !== 'object' || Array.isArray(item)) {
        errors.push(`possibleConditions[${idx}] must be an object`);
      } else {
        const cond = item as Record<string, unknown>;
        // Name or condition string must be present
        if (typeof cond.condition !== 'string' && typeof cond.name !== 'string') {
          errors.push(`possibleConditions[${idx}] must have a 'condition' or 'name' string`);
        }
        // supportingEvidence must be an array
        if (!Array.isArray(cond.supportingEvidence)) {
          errors.push(`possibleConditions[${idx}].supportingEvidence must be an array`);
        }
        // If redFlags exists on condition, must be an array
        if (cond.redFlags !== undefined && !Array.isArray(cond.redFlags)) {
          errors.push(`possibleConditions[${idx}].redFlags must be an array`);
        }
        // If requiresDoctorReview exists on condition, must be boolean
        if (cond.requiresDoctorReview !== undefined && typeof cond.requiresDoctorReview !== 'boolean') {
          errors.push(`possibleConditions[${idx}].requiresDoctorReview must be a boolean`);
        }
      }
    });
  }

  // 11. supportingEvidence: array
  if (!Array.isArray(res.supportingEvidence)) {
    errors.push('supportingEvidence must be an array');
  }

  // 12. missingInformation: array
  if (!Array.isArray(res.missingInformation)) {
    errors.push('missingInformation must be an array');
  }

  // 13. redFlags: array
  if (!Array.isArray(res.redFlags)) {
    errors.push('redFlags must be an array');
  }

  // 14. recommendedNextStep: string
  if (typeof res.recommendedNextStep !== 'string') {
    errors.push('recommendedNextStep must be a string');
  }

  // 15. requiresUrgentCare: boolean
  if (typeof res.requiresUrgentCare !== 'boolean') {
    errors.push('requiresUrgentCare must be a boolean');
  }

  // 16. requiresDoctorReview: boolean
  if (typeof res.requiresDoctorReview !== 'boolean') {
    errors.push('requiresDoctorReview must be a boolean');
  }

  // 17. confidenceStatus: string
  if (typeof res.confidenceStatus !== 'string') {
    errors.push('confidenceStatus must be a string');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates the deterministic safe fallback response when validation fails.
 * Never invents a diagnosis or medical information.
 */
export function createSafeMedicalFallback(
  originalEmergencyDetected: boolean = false,
  originalRedFlags: string[] = []
): StructuredMedicalResponse {
  return {
    mode: 'OFFLINE',
    source: 'LOCAL_MEDICAL_ENGINE',
    chiefComplaint: originalEmergencyDetected ? 'EMERGENCY MEDICAL ATTENTION REQUIRED' : '',
    symptoms: [],
    duration: '',
    severity: originalEmergencyDetected ? 'Severe / Emergency' : '',
    measurements: {},
    medicalHistory: [],
    medications: [],
    allergies: [],
    observations: [],
    possibleConditions: [],
    supportingEvidence: [],
    missingInformation: [],
    redFlags: originalEmergencyDetected && originalRedFlags.length > 0 ? originalRedFlags : [],
    recommendedNextStep: originalEmergencyDetected
      ? 'IMMEDIATE EMERGENCY: Dial 108 or proceed to the nearest emergency department immediately.'
      : 'The medical assessment could not be generated reliably. Please review the original information and consult a qualified healthcare professional.',
    requiresUrgentCare: originalEmergencyDetected,
    requiresDoctorReview: true,
    confidenceStatus: 'UNAVAILABLE',
    emergencyDetected: originalEmergencyDetected,
    summaryText: originalEmergencyDetected
      ? 'EMERGENCY ALERT: Immediate medical evaluation is critical. Please call 108 immediately.'
      : 'The medical assessment could not be generated reliably. Please consult a qualified doctor.',
    isOfflineFallback: true,
  };
}

export const medicalService = new MedicalService();
export {
  validateMedicalSchema,
  type MedicalSchemaValidationResult,
};

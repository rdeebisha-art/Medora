import { ALL_DICTIONARIES, SupportedLanguageCode } from '../../data/languages';
import { HealthcareIntent } from '../../data/healthKnowledge/knowledgeBase';

export interface IntentClassificationResult {
  intent: HealthcareIntent;
  confidence: number;
  isEmergency: boolean;
  matchedKeywords: string[];
  durationIdentified?: string;
  severityIdentified?: string;
}

export class IntentClassifier {
  private static EMERGENCY_INTENTS: HealthcareIntent[] = ['EMERGENCY_TRIAGE', 'CHEST_PAIN', 'BREATHING_DIFFICULTY'];

  // Universal deterministic red-flag keywords across all languages
  private static UNIVERSAL_RED_FLAGS = {
    CHEST_PAIN: [
      'chest pain', 'chest tightness', 'heart attack', 'cardiac', 'left arm pain',
      'सीने में दर्द', 'छाती में दर्द', 'हार्ट अटैक', 'दिल का दौरा',
      'நெஞ்சு வலி', 'மாரடைப்பு', 'நெஞ்சில் பாரம்',
      'ఛాతీ నొప్పి', 'గుండెపోటు', 'ఛాతీలో బిగుతు',
      'നെഞ്ചുവേദന', 'ഹൃദയാഘാതം', 'നെഞ്ചിൽ ഭാരം',
      'ಎದೆ ನೋವು', 'ಹೃದಯಾಘಾತ', 'ಎದೆಯಲ್ಲಿ ನೋವು'
    ],
    BREATHING_DIFFICULTY: [
      'difficulty breathing', 'cannot breathe', 'breathless', 'gasping', 'choking', 'asthma attack',
      'सांस लेने में तकलीफ', 'सांस फूलना', 'दम घुटना', 'सांस नहीं आ रही',
      'மூச்சுத்திணறல்', 'சுவாசிக்க முடியவில்லை', 'மூச்சு வாங்குகிறது',
      'శ్వాస ఆడకపోవడం', 'ఊపిరి ఆడట్లేదు', 'శ్వాస తీసుకోవడంలో ఇబ్బంది',
      'ശ്വാസംമുട്ടൽ', 'ശ്വാസമെടുക്കാൻ ബുദ്ധിമുട്ട്', 'ശ്വാസമില്ലായ്മ',
      'ಉಸಿರಾಟದ ತೊಂದರೆ', 'ಉಸಿರಾಡಲು ಕಷ್ಟ', 'ದಮ್ಮು'
    ],
    EMERGENCY_TRIAGE: [
      'unconscious', 'fainted', 'passed out', 'seizure', 'fits', 'convulsions', 'heavy bleeding', 'severe bleeding', 'snake bite', 'poison',
      'बेहोश', 'मूर्छित', 'अचेत', 'दौरा', 'खून बहना', 'रक्तस्राव', 'सांप का काटना', 'सर्पदंश', 'जहर',
      'மயக்கம்', 'சுயநினைவின்றி', 'வலிப்பு', 'ரத்தப்போக்கு', 'பாம்பு கடி', 'விஷம்',
      'స్పృహతప్పడం', 'మూర్ఛ', 'తీవ్ర రక్తస్రావం', 'పాము కాటు', 'విషం',
      'ബോധക്ഷയം', 'അബോധാവസ്ഥ', 'ഫിറ്റ്സ്', 'രക്തസ്രാവം', 'പാമ്പ് കടി', 'വിഷം',
      'ಪ್ರಜ್ಞೆ ತಪ್ಪಿದೆ', 'ಮೂರ್ಛೆ', 'ಫಿಟ್ಸ್', 'ರಕ್ತಸ್ರಾವ', 'ಹಾವು ಕಡಿತ', 'ವಿಷ'
    ]
  };

  public classifyIntent(text: string, language: SupportedLanguageCode): IntentClassificationResult {
    const cleanText = (text || '').toLowerCase().trim();
    if (!cleanText) {
      return {
        intent: 'GENERAL_HEALTH',
        confidence: 0.5,
        isEmergency: false,
        matchedKeywords: []
      };
    }

    // 1. DETERMINISTIC SAFETY RULES: Universal emergency red-flag override
    // Chest pain check
    for (const phrase of IntentClassifier.UNIVERSAL_RED_FLAGS.CHEST_PAIN) {
      if (cleanText.includes(phrase.toLowerCase())) {
        return {
          intent: 'CHEST_PAIN',
          confidence: 0.99,
          isEmergency: true,
          matchedKeywords: [phrase],
          severityIdentified: 'CRITICAL'
        };
      }
    }

    // Breathing difficulty check
    for (const phrase of IntentClassifier.UNIVERSAL_RED_FLAGS.BREATHING_DIFFICULTY) {
      if (cleanText.includes(phrase.toLowerCase())) {
        return {
          intent: 'BREATHING_DIFFICULTY',
          confidence: 0.99,
          isEmergency: true,
          matchedKeywords: [phrase],
          severityIdentified: 'CRITICAL'
        };
      }
    }

    // General Emergency / Triage check
    for (const phrase of IntentClassifier.UNIVERSAL_RED_FLAGS.EMERGENCY_TRIAGE) {
      if (cleanText.includes(phrase.toLowerCase())) {
        return {
          intent: 'EMERGENCY_TRIAGE',
          confidence: 0.99,
          isEmergency: true,
          matchedKeywords: [phrase],
          severityIdentified: 'CRITICAL'
        };
      }
    }

    const dict = ALL_DICTIONARIES[language] || ALL_DICTIONARIES['en-IN'];
    const englishDict = ALL_DICTIONARIES['en-IN'];

    // Collect matches across intent categories
    const intentMatches: Record<HealthcareIntent, string[]> = {
      EMERGENCY_TRIAGE: [],
      CHEST_PAIN: [],
      BREATHING_DIFFICULTY: [],
      FEVER: [],
      COUGH_COLD: [],
      STOMACH_PAIN: [],
      HEADACHE_DIZZINESS: [],
      MEDICINE_INQUIRY: [],
      PREGNANCY_CARE: [],
      NEWBORN_CARE: [],
      CHILD_CARE: [],
      ELDERLY_CARE: [],
      DIABETES_CARE: [],
      NUTRITION_CARE: [],
      VACCINATION_INQUIRY: [],
      GENERAL_HEALTH: []
    };

    // Helper to check match against dictionaries
    const checkTerms = (termsList: string[], intent: HealthcareIntent) => {
      termsList.forEach((term) => {
        const tLower = term.toLowerCase();
        if (cleanText.includes(tLower)) {
          intentMatches[intent].push(term);
        }
      });
    };

    // Specialized Care & Symptom checks
    checkTerms([...dict.healthcareTerms.fever, ...englishDict.healthcareTerms.fever], 'FEVER');
    checkTerms([...dict.healthcareTerms.cough, ...dict.healthcareTerms.cold, ...englishDict.healthcareTerms.cough, ...englishDict.healthcareTerms.cold], 'COUGH_COLD');
    checkTerms([...dict.healthcareTerms.stomach, ...dict.healthcareTerms.diarrhea, ...dict.healthcareTerms.vomiting, ...englishDict.healthcareTerms.stomach, ...englishDict.healthcareTerms.diarrhea, ...englishDict.healthcareTerms.vomiting], 'STOMACH_PAIN');
    checkTerms([...dict.healthcareTerms.headache, ...dict.healthcareTerms.dizziness, ...englishDict.healthcareTerms.headache, ...englishDict.healthcareTerms.dizziness], 'HEADACHE_DIZZINESS');
    checkTerms([...dict.healthcareTerms.pregnancy, ...englishDict.healthcareTerms.pregnancy], 'PREGNANCY_CARE');
    checkTerms([...dict.healthcareTerms.newborn, ...englishDict.healthcareTerms.newborn], 'NEWBORN_CARE');
    checkTerms([...dict.healthcareTerms.child, ...englishDict.healthcareTerms.child], 'CHILD_CARE');
    checkTerms([...dict.healthcareTerms.elderly, ...englishDict.healthcareTerms.elderly], 'ELDERLY_CARE');
    checkTerms([...dict.healthcareTerms.bloodSugar, ...englishDict.healthcareTerms.bloodSugar], 'DIABETES_CARE');
    checkTerms([...dict.healthcareTerms.medicine, ...dict.healthcareTerms.bloodPressure, ...englishDict.healthcareTerms.medicine, ...englishDict.healthcareTerms.bloodPressure], 'MEDICINE_INQUIRY');

    // Multilingual Nutrition keywords
    const nutritionKeywords = [
      'food', 'diet', 'eat', 'nutrition',
      'खाना', 'आहार', 'भोजन', 'पोषण', 'फल', 'सब्जी',
      'உணவு', 'சாப்பாடு',
      'ఆహారం', 'తినడం',
      'ഭക്ഷണം', 'കഴിക്കുക',
      'ಆಹಾರ', 'ಊಟ'
    ];
    nutritionKeywords.forEach((k) => {
      if (cleanText.includes(k.toLowerCase())) intentMatches.NUTRITION_CARE.push(k);
    });

    // Multilingual Vaccination keywords
    const vaccineKeywords = [
      'vaccine', 'vaccination', 'drops', 'polio', 'bcg',
      'टीका', 'टीकाकरण', 'खुराक', 'पोलियो ड्रॉप',
      'தடுப்பூசி',
      'టీకా',
      'വാക്സിൻ', 'കുത്തിവയ്പ്പ്',
      'ಲಸಿಕೆ'
    ];
    vaccineKeywords.forEach((k) => {
      if (cleanText.includes(k.toLowerCase())) intentMatches.VACCINATION_INQUIRY.push(k);
    });

    // Check Duration in all supported languages
    let duration: string | undefined;
    const durationRegexes = [
      /(\d+)\s*(days?|weeks?|months?|நாட்கள்|రోజులు|ദിവസം|ದಿನ|दिन|हफ़्ते|महीने)/i,
      /(two|three|four|five|six|seven|2|3|4|5|6|7|दो|तीन|चार|पांच)\s*(days?|weeks?|दिन|हफ्ते)/i,
      /(since morning|since yesterday|காலையிலிருந்து|ఉదయం నుండి|രാവിലെ മുതൽ|ಬೆಳಿಗ್ಗೆಯಿಂದ|सुबह से|कल से|रात से)/i
    ];
    for (const r of durationRegexes) {
      const match = cleanText.match(r);
      if (match) {
        duration = match[0];
        break;
      }
    }

    // Check Severity
    let severity: string | undefined;
    const severityKeywords = [
      'severe', 'very severe', 'unbearable', 'critical', 'high', 'extreme',
      'बहुत तेज', 'असहनीय', 'गंभीर', 'तीव्र',
      'கடுமையான', 'தாங்க முடியாத', 'அதிகமான',
      'తీవ్రమైన', 'భరించలేని', 'ఎక్కువ',
      'കഠിനമായ', 'തീവ്രമായ', 'സഹിക്കാൻ പറ്റാത്ത',
      'ತೀವ್ರವಾದ', 'ಅಸಹನೀಯ', 'ವಿಪರೀತ'
    ];
    for (const s of severityKeywords) {
      if (cleanText.includes(s.toLowerCase())) {
        severity = s;
        break;
      }
    }

    // Prioritize Emergency Intents if matched in dictionary check
    for (const emergencyIntent of IntentClassifier.EMERGENCY_INTENTS) {
      if (intentMatches[emergencyIntent].length > 0) {
        return {
          intent: emergencyIntent,
          confidence: 0.95,
          isEmergency: true,
          matchedKeywords: intentMatches[emergencyIntent],
          durationIdentified: duration,
          severityIdentified: severity || 'URGENT'
        };
      }
    }

    // Find highest non-emergency match
    let bestIntent: HealthcareIntent = 'GENERAL_HEALTH';
    let highestCount = 0;
    let matchedKeywords: string[] = [];

    (Object.entries(intentMatches) as [HealthcareIntent, string[]][]).forEach(([intent, matches]) => {
      if (matches.length > highestCount) {
        highestCount = matches.length;
        bestIntent = intent;
        matchedKeywords = matches;
      }
    });

    return {
      intent: bestIntent,
      confidence: highestCount > 0 ? Math.min(0.95, 0.70 + highestCount * 0.1) : 0.60,
      isEmergency: IntentClassifier.EMERGENCY_INTENTS.includes(bestIntent),
      matchedKeywords,
      durationIdentified: duration,
      severityIdentified: severity
    };
  }
}

export const intentClassifier = new IntentClassifier();

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

    // Helper to check match against both native language dictionary and English loanwords
    const checkTerms = (termsList: string[], intent: HealthcareIntent) => {
      termsList.forEach((term) => {
        const tLower = term.toLowerCase();
        if (cleanText.includes(tLower)) {
          intentMatches[intent].push(term);
        }
      });
    };

    // 1. Critical Emergency & Red Flag check first
    checkTerms([...dict.healthcareTerms.emergency, ...dict.healthcareTerms.unconscious, ...dict.healthcareTerms.bleeding, ...englishDict.healthcareTerms.emergency, ...englishDict.healthcareTerms.unconscious, ...englishDict.healthcareTerms.bleeding], 'EMERGENCY_TRIAGE');
    checkTerms([...dict.healthcareTerms.chestPain, ...englishDict.healthcareTerms.chestPain], 'CHEST_PAIN');
    checkTerms([...dict.healthcareTerms.breathing, ...englishDict.healthcareTerms.breathing], 'BREATHING_DIFFICULTY');

    // 2. Specialized Care & Symptom checks
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

    // Additional checks for vaccination and nutrition
    const nutritionKeywords = ['food', 'diet', 'eat', 'nutrition', 'உணவு', 'சாப்பாடு', 'ఆహారం', 'ഭക്ഷണം', 'ಆಹಾರ', 'കഴിക്കുക', 'తినడం'];
    nutritionKeywords.forEach((k) => {
      if (cleanText.includes(k.toLowerCase())) intentMatches.NUTRITION_CARE.push(k);
    });

    const vaccineKeywords = ['vaccine', 'vaccination', 'drops', 'polio', 'bcg', 'தடுப்பூசி', 'టీకా', 'വാക്സിൻ', 'കുത്തിവയ്പ്പ്', 'ಲಸಿಕೆ'];
    vaccineKeywords.forEach((k) => {
      if (cleanText.includes(k.toLowerCase())) intentMatches.VACCINATION_INQUIRY.push(k);
    });

    // Check Duration
    let duration: string | undefined;
    const durationRegexes = [
      /(\d+)\s*(days?|நாட்கள்|రోజులు|ദിവസം|ದಿನ)/i,
      /(two|three|four|five|six|seven|2|3|4|5|6|7)\s*(days?|weeks?)/i,
      /(since morning|காலையிலிருந்து|ఉదయం నుండి|രാവിലെ മുതൽ|ಬೆಳಿಗ್ಗೆಯಿಂದ)/i
    ];
    for (const r of durationRegexes) {
      const match = cleanText.match(r);
      if (match) {
        duration = match[0];
        break;
      }
    }

    // Prioritize Emergency Intents
    for (const emergencyIntent of IntentClassifier.EMERGENCY_INTENTS) {
      if (intentMatches[emergencyIntent].length > 0) {
        return {
          intent: emergencyIntent,
          confidence: 0.95,
          isEmergency: true,
          matchedKeywords: intentMatches[emergencyIntent],
          durationIdentified: duration
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
      durationIdentified: duration
    };
  }
}

export const intentClassifier = new IntentClassifier();

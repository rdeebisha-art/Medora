import { AIRouterDecision } from './types';
import { voiceCommandMatcher } from '../voiceNavigation/voiceCommandMatcher';

export class AIRouter {
  /**
   * Central Medora AI Router
   * Strictly routes requests to one of four paths:
   * 1. EMERGENCY (Highest Priority)
   * 2. MEDICAL
   * 3. NAVIGATION
   * 4. VOICE
   * 
   * Examples:
   * "I cannot breathe" -> EMERGENCY
   * "I have fever" -> MEDICAL
   * "Open medicines" -> NAVIGATION
   * "Hello Medora" -> VOICE
   */
  public route(inputText: string, language: string = 'en'): AIRouterDecision {
    const raw = (inputText || '').trim();
    const lower = raw.toLowerCase();

    // 1. EMERGENCY (Highest Priority - Immediate life-safety triage)
    const isEmergency =
      /\b(cannot breathe|can't breathe|choking|gasping|severe chest pain|crushing chest pain|unconscious|fainted|loss of consciousness|seizure|severe bleeding|stroke|anaphylaxis|unable to breathe)\b/i.test(
        lower
      ) ||
      /(மூச்சு விட முடியவில்லை|கடுமையான நெஞ்சு வலி|அதிக இரத்தப்போக்கு|மயக்கம்|வலிப்பு)/.test(raw) ||
      /(सांस नहीं आ रही|सीने में तेज दर्द|खून की उल्टी|बेहोश|दौरा)/.test(raw) ||
      /(శ్వాస ఆడట్లేదు|తీవ్రమైన ఛాతీ నొప్పి|స్పృహ తప్పడం)/.test(raw) ||
      /(ശ്വാസമെടുക്കാൻ പറ്റുന്നില്ല|കഠിനമായ നെഞ്ചുവേദന|ബോധക്ഷയം)/.test(raw) ||
      /(ಉಸಿರಾಡಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ|ತೀವ್ರ ಎದೆ ನೋವು|ಪ್ರಜ್ಞೆ ತಪ್ಪುವುದು)/.test(raw);

    if (isEmergency) {
      return {
        targetSystem: 'EMERGENCY_TRIAGE',
        requestType: 'EMERGENCY',
        reason: 'Immediate life-safety red flag detected. Emergency triage priority.',
        isEmergency: true,
        requiresDoctorReview: true,
        destinationRoute: '/emergency',
      };
    }

    // 2. MEDICAL (Clinical symptoms, lab reports, X-rays, medication concerns)
    // Check medical symptoms BEFORE navigation so queries like "My medicine is not helping" or "Explain blood report" route to Medical AI
    const isMedical =
      /\b(fever|cough|headache|pain|ache|vomit|vomiting|nausea|diarrhea|rash|sore throat|breathless|bp|blood pressure|blood sugar|sugar|glucose|hemoglobin|creatinine|disease|diagnosis|prescribe|not helping|medicine is not helping|tablet|dose|pregnancy|pregnant|baby|newborn|elderly symptom|temperature)\b/i.test(
        lower
      ) ||
      /\b(?:explain|analyze|interpret|review|check)\s+(?:my|this|the)?\s*(?:blood|lab|medical|test)?\s*(?:report|x-ray|xray|scan)\b/i.test(
        lower
      ) ||
      /(காய்ச்சல்|இருமல்|தலைவலி|வலி|வாந்தி|இரத்த அழுத்தம்|சர்க்கரை|நோய்)/.test(raw) ||
      /(बुखार|खांसी|सिरदर्द|दर्द|उल्टी|रक्तचाप|शुगर|बीमारी)/.test(raw) ||
      /(జ్వరం|దగ్గు|తలనొప్పి|నొప్పి|మందు)/.test(raw) ||
      /(പനി|ചുമ|തലവേദന|വേദന|മരുന്ന്)/.test(raw) ||
      /(ಜ್ವರ|ಕೆಮ್ಮು|ತಲೆನೋವು|ನೋವು|ಔಷಧಿ)/.test(raw);

    if (isMedical) {
      return {
        targetSystem: 'MEDICAL_AI',
        requestType: 'MEDICAL',
        reason: 'Clinical symptom, laboratory report, or medical query detected.',
        isEmergency: false,
        requiresDoctorReview: true,
        destinationRoute: '/ai',
      };
    }

    // 3. GREETINGS & CASUAL CONVERSATION -> VOICE
    const isConversational =
      /^(hi|hello|hey|namaste|vanakkam|namaskaram|greetings|good\s*(morning|afternoon|evening))\b/i.test(lower) ||
      /^how are you/i.test(lower) ||
      /^thank/i.test(lower) ||
      /^who are you/i.test(lower) ||
      /^what is medora/i.test(lower) ||
      /^tell me a joke/i.test(lower) ||
      /^how do i (?:use|upload|scan)/i.test(lower);

    if (isConversational) {
      return {
        targetSystem: 'VOICE_AI',
        requestType: 'VOICE',
        reason: 'General voice conversation, greeting, or application help.',
        isEmergency: false,
        requiresDoctorReview: false,
      };
    }

    // 4. NAVIGATION (Navigation commands like "Open medicines", "Go to dashboard", "Open family health")
    const navMatch = voiceCommandMatcher.matchCommand(raw, 'auto');
    if (navMatch.matched && navMatch.intent && navMatch.confidence >= 0.8) {
      return {
        targetSystem: 'LOCAL_NAVIGATION',
        requestType: 'NAVIGATION',
        reason: `Matched local voice navigation intent: ${navMatch.intent}`,
        isEmergency: false,
        requiresDoctorReview: false,
        destinationRoute: navMatch.route,
      };
    }

    if (/^(open|go to|show)\s+(medicines|dashboard|family|appointments|settings|records|vitals|profile|home|emergency)\b/i.test(lower)) {
      return {
        targetSystem: 'LOCAL_NAVIGATION',
        requestType: 'NAVIGATION',
        reason: 'Explicit voice navigation request.',
        isEmergency: false,
        requiresDoctorReview: false,
        destinationRoute: '/medicines',
      };
    }

    // 4. VOICE (Greetings, casual conversation, app guidance)
    return {
      targetSystem: 'VOICE_AI',
      requestType: 'VOICE',
      reason: 'General voice conversation, greeting, or application help.',
      isEmergency: false,
      requiresDoctorReview: false,
    };
  }
}

export const aiRouter = new AIRouter();

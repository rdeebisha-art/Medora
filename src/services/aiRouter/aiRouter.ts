import { AIRequestType, AIResponseSource, AIRouterDecision } from './aiRouterTypes';
import { voiceCommandMatcher } from '../voiceNavigation/voiceCommandMatcher';

export class AIRouter {
  /**
   * Evaluates any user input text and strictly determines whether to route to:
   * 1. EMERGENCY_TRIAGE (immediate life-safety red flags)
   * 2. MEDICAL_REQUESTS (symptoms, fever, cough, blood pressure, lab reports, X-rays, clinical queries)
   * 3. NORMAL CONVERSATION & APP HELP (greetings, "hello", "how are you", "thank you", "what is medora") -> VOICE_AI
   * 4. LOCAL_NAVIGATION (voice commands e.g. "open medicines", "go to dashboard")
   */
  public route(inputText: string, language: string = 'en'): AIRouterDecision {
    const raw = (inputText || '').trim();
    const lower = raw.toLowerCase();

    // 1. EMERGENCY TRIAGE FIRST (Deterministic Priority)
    const isEmergency =
      /\b(cannot breathe|can't breathe|choking|gasping|severe chest pain|unconscious|fainted|loss of consciousness|seizure|severe bleeding|stroke|anaphylaxis)\b/i.test(
        lower
      ) ||
      /(மூச்சு விட முடியவில்லை|கடுமையான நெஞ்சு வலி|அதிக இரத்தப்போக்கு|மயக்கம்|வலிப்பு)/.test(raw) ||
      /(सांस नहीं आ रही|सीने में तेज दर्द|खून की उल्टी|बेहोश|दौरा)/.test(raw);

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

    // 2. NORMAL CONVERSATION & GREETINGS -> VOICE AI (Before generic keyword matchers)
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
        reason: 'General conversation, greeting, or application help.',
        isEmergency: false,
        requiresDoctorReview: false,
      };
    }

    // 3. MEDICAL REQUESTS (Clinical intelligence, symptoms, labs, X-ray)
    // Check medical requests before pure navigation keywords so "Explain my blood report", "Analyze this X-ray", "My medicine is not helping" route to Medical AI!
    const isMedical =
      /\b(fever|cough|headache|pain|ache|vomit|nausea|diarrhea|rash|sore throat|breathless|bp|blood pressure|blood sugar|sugar|glucose|hemoglobin|creatinine|disease|diagnosis|prescribe|not helping|medicine is not helping|tablet|dose|pregnancy|pregnant|baby|newborn|elderly symptom)\b/i.test(
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

    // 4. LOCAL NAVIGATION COMMANDS (e.g. "open medicines", "go to dashboard", "show home")
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

    // Default to Voice AI
    return {
      targetSystem: 'VOICE_AI',
      requestType: 'VOICE',
      reason: 'General voice conversation or platform assistance.',
      isEmergency: false,
      requiresDoctorReview: false,
    };
  }
}

export const aiRouter = new AIRouter();

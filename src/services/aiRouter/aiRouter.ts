import { AIRequestType, AIResponseSource, AIRouterDecision } from './aiRouterTypes';
import { voiceCommandMatcher } from '../voiceNavigation/voiceCommandMatcher';

export class AIRouter {
  /**
   * Evaluates any user input text and strictly determines whether to route to:
   * 1. EMERGENCY_TRIAGE (immediate life-safety red flags like "cannot breathe", "chest pain", "unconscious")
   * 2. APP_HELP (how do I upload a report, help questions, application instructions -> VOICE_AI with specific destination route)
   * 3. CALLING ("Call doctor", "call ambulance", etc.)
   * 4. MESSAGING ("Send this to doctor", "sms doctor", etc.)
   * 5. RECORD_INPUT ("Add a blood pressure reading", "Add medicine", etc.)
   * 6. NORMAL CONVERSATION & GREETINGS ("hello", "how are you", "thank you", "what is medora") -> VOICE_AI
   * 7. MEDICAL_REQUESTS (symptoms, fever, cough, lab reports, X-rays, clinical queries) -> MEDICAL_AI
   * 8. LOCAL_NAVIGATION (voice commands e.g. "open medicines", "show my medical records", "go to dashboard")
   */
  public route(inputText: string, language: string = 'en'): AIRouterDecision {
    const raw = (inputText || '').trim();
    const lower = raw.toLowerCase();

    // 1. EMERGENCY TRIAGE FIRST (Deterministic Priority)
    const isEmergency =
      /\b(cannot breathe|can't breathe|choking|gasping|severe chest pain|chest pain|crushing chest pain|unconscious|fainted|loss of consciousness|seizure|severe bleeding|stroke|anaphylaxis)\b/i.test(
        lower
      ) ||
      /(மூச்சு விட முடியவில்லை|கடுமையான நெஞ்சு வலி|நெஞ்சு வலி|அதிக இரத்தப்போக்கு|மயக்கம்|வலிப்பு)/.test(raw) ||
      /(सांस नहीं आ रही|सीने में तेज दर्द|सीने में दर्द|खून की उल्टी|बेहोश|दौरा)/.test(raw) ||
      /(శ్వాస ఆడట్లేదు|తీవ్రమైన ఛాతీ నొప్పి|ఛాతీ నొప్పి|స్పృహ తప్పడం)/.test(raw) ||
      /(ശ്വാസമെടുക്കാൻ പറ്റുന്നില്ല|കഠിനമായ നെഞ്ചുവേദന|നെഞ്ചുവേദന|ബോധക്ഷയം)/.test(raw) ||
      /(ಉಸಿರಾಡಲು ಕಷ್ಟವಾಗುತ್ತಿದೆ|ತೀವ್ರ ಎದೆ ನೋವು|ಎದೆ ನೋವು|ಪ್ರಜ್ಞೆ ತಪ್ಪುವುದು)/.test(raw);

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

    // 2. APP HELP / INSTRUCTIONS (Filters out app-help from generic chat or medical)
    // E.g., "How do I upload a report?", "How to scan", "How do I use Medora"
    const isAppHelp =
      /^(?:how\s+(?:do\s+i|to)\s+(?:upload|scan|attach)|how\s+do\s+i\s+use|help\b)/i.test(lower) ||
      /\bhow\s+(?:do\s+i|to)\s+upload\s+(?:a\s+)?report\b/i.test(lower) ||
      /அறிக்கையை எவ்வாறு பதிவேற்றுவது|रिपोर्ट कैसे अपलोड करें/.test(raw);

    if (isAppHelp) {
      let destRoute = '/report-scanner';
      if (/medicine/i.test(lower)) destRoute = '/medicines';
      else if (/record/i.test(lower)) destRoute = '/records';
      else if (/emergency/i.test(lower)) destRoute = '/emergency';

      return {
        targetSystem: 'VOICE_AI',
        requestType: 'APP_HELP',
        reason: 'Application help or instructions query.',
        isEmergency: false,
        requiresDoctorReview: false,
        destinationRoute: destRoute,
      };
    }

    // 3. CALLING WORKFLOW ("Call doctor", "call ambulance", "phone doctor")
    if (
      /\b(?:call|phone|dial|ring)\s+(?:the\s+)?(?:doctor|dr|ambulance|hospital|clinic)\b/i.test(lower) ||
      /மருத்துவரை அழைக்கவும்|डॉक्टर को कॉल/.test(raw)
    ) {
      return {
        targetSystem: 'LOCAL_NAVIGATION',
        requestType: 'CALLING',
        reason: 'Doctor or healthcare calling request.',
        isEmergency: false,
        requiresDoctorReview: false,
        destinationRoute: '/appointments',
      };
    }

    // 4. SMS / MESSAGE WORKFLOW ("Send this to doctor", "message doctor")
    if (
      /\b(?:send\s+(?:this\s+)?to\s+(?:the\s+)?doctor|message\s+doctor|text\s+doctor|send\s+sms|sms\s+doctor)\b/i.test(lower) ||
      /மருத்துவருக்கு அனுப்பு|डॉक्टर को भेजें/.test(raw)
    ) {
      return {
        targetSystem: 'LOCAL_NAVIGATION',
        requestType: 'MESSAGING',
        reason: 'Doctor messaging or SMS request.',
        isEmergency: false,
        requiresDoctorReview: false,
        destinationRoute: '/sms',
      };
    }

    // 5. RECORD INPUT & CREATION (e.g. "Add a blood pressure reading", "Add medicine")
    if (
      /\b(?:add|record|enter|log)\s+(?:a\s+)?(?:blood\s+pressure|bp)(?:\s+reading)?\b/i.test(lower) ||
      /\b(?:add|enter)\s+(?:a\s+)?(?:vital|vitals)\b/i.test(lower)
    ) {
      return {
        targetSystem: 'LOCAL_NAVIGATION',
        requestType: 'RECORD_INPUT',
        reason: 'Health test or vital reading record input.',
        isEmergency: false,
        requiresDoctorReview: false,
        destinationRoute: '/health-tests?add=true',
      };
    }

    if (/\b(?:add|new|enter)\s+(?:a\s+)?medicine\b/i.test(lower)) {
      return {
        targetSystem: 'LOCAL_NAVIGATION',
        requestType: 'RECORD_INPUT',
        reason: 'Medication entry request.',
        isEmergency: false,
        requiresDoctorReview: false,
        destinationRoute: '/medicines?add=true',
      };
    }

    // 6. NORMAL CONVERSATION & GREETINGS -> VOICE AI (Before generic keyword matchers)
    const isConversational =
      /^(hi|hello|hey|namaste|vanakkam|namaskaram|greetings|good\s*(morning|afternoon|evening))\b/i.test(lower) ||
      /^how are you/i.test(lower) ||
      /^thank/i.test(lower) ||
      /^who are you/i.test(lower) ||
      /^what is medora/i.test(lower) ||
      /^tell me a joke/i.test(lower);

    if (isConversational) {
      return {
        targetSystem: 'VOICE_AI',
        requestType: 'VOICE',
        reason: 'General conversation, greeting, or application greeting.',
        isEmergency: false,
        requiresDoctorReview: false,
      };
    }

    // 7. MEDICAL REQUESTS (Clinical intelligence, symptoms, labs, X-ray)
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

    // 8. LOCAL NAVIGATION COMMANDS (e.g. "open medicines", "show my medical records", "go to dashboard")
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

    // Fallback navigation keyword check
    if (
      /\b(?:show|open|view|display)\s+(?:my\s+)?medical\s+records\b/i.test(lower) ||
      lower === 'medical records' ||
      lower === 'open records'
    ) {
      return {
        targetSystem: 'LOCAL_NAVIGATION',
        requestType: 'NAVIGATION',
        reason: 'Direct match for medical records navigation.',
        isEmergency: false,
        requiresDoctorReview: false,
        destinationRoute: '/records',
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

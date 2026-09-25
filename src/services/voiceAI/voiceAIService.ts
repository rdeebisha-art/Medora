import { VoiceAIRequest, VoiceAIResponse } from './voiceAITypes';
import { VOICE_AI_LOCAL_RESPONSES } from './voiceAIPrompt';

export class VoiceAIService {
  /**
   * Processes conversational user speech or text.
   * STRICT SAFETY GUARANTEE:
   * - Never returns a medical diagnosis.
   * - If a medical intent/question is detected, provides explicit transfer guidance to Medora Medical AI.
   * - Works 100% offline using deterministic conversational rules.
   */
  public async processVoiceRequest(request: VoiceAIRequest): Promise<VoiceAIResponse> {
    const raw = (request.text || '').trim();
    const lower = raw.toLowerCase();
    const lang = (request.language || 'en').slice(0, 2) as 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';
    const langKey = ['en', 'ta', 'hi', 'te', 'ml', 'kn'].includes(lang) ? lang : 'en';

    // 1. Medical Query Detection in Voice AI
    const isMedicalQuery =
      /(\bdisease\b|\bdiagnosis\b|\bsymptom\b|\bfever\b|\bcough\b|\bchest pain\b|\bheadache\b|\bpain\b|\bvomit\b|\bbleeding\b|\bmedicine\b|\btablet\b|\bdrug\b|\bdosage\b|\bblood pressure\b|\bblood sugar\b|\bx-ray\b|\bxray\b|\breport\b|\bwhat disease\b|\bwhat do i have\b|\bprescribe\b)/i.test(
        lower
      ) ||
      /(காய்ச்சல்|தலைவலி|மருந்து|நோய்|அறிக்கை|எக்ஸ்ரே)/.test(raw) ||
      /(बुखार|सिरदर्द|दवाई|बीमारी|रोग|रिपोर्ट|एक्सरे)/.test(raw) ||
      /(జ్వరం|తలనొప్పి|మందు|వ్యాధి|నివేదిక)/.test(raw) ||
      /(പനി|തലവേദന|മരുന്ന്|രോഗം|റിപ്പോർട്ട്)/.test(raw) ||
      /(ಜ್ವರ|ತಲೆನೋವು|ಔಷಧಿ|ರೋಗ|ವರದಿ)/.test(raw);

    if (isMedicalQuery) {
      return {
        source: 'VOICE_AI',
        responseText: VOICE_AI_LOCAL_RESPONSES.medicalTransferNotice[langKey] || VOICE_AI_LOCAL_RESPONSES.medicalTransferNotice.en,
        language: langKey,
        isMedicalTransferRecommended: true,
        medicalTransferQuery: raw,
        suggestedAction: 'TRANSFER_TO_MEDICAL_AI',
        destinationRoute: '/ai',
      };
    }

    // 2. Greetings
    if (/^(hi|hello|hey|namaste|vanakkam|namaskaram|good\s*(morning|afternoon|evening))\b/i.test(lower)) {
      return {
        source: 'VOICE_AI',
        responseText: VOICE_AI_LOCAL_RESPONSES.greeting[langKey] || VOICE_AI_LOCAL_RESPONSES.greeting.en,
        language: langKey,
        isMedicalTransferRecommended: false,
        suggestedAction: 'NONE',
      };
    }

    // 3. How are you
    if (/how are you|how do you do/i.test(lower) || /எப்படி இருக்கிறீர்கள்|कैसे हैं|ఎలా ఉన్నారు|എങ്ങനെയുണ്ട്|ಹೇಗಿದ್ದೀರಿ/.test(raw)) {
      return {
        source: 'VOICE_AI',
        responseText: VOICE_AI_LOCAL_RESPONSES.howAreYou[langKey] || VOICE_AI_LOCAL_RESPONSES.howAreYou.en,
        language: langKey,
        isMedicalTransferRecommended: false,
        suggestedAction: 'NONE',
      };
    }

    // 4. Thank you
    if (/thank|thanks|dhanyawad|nandri/i.test(lower) || /நன்றி|धन्यवाद|ధన్యవాదాలు|നന്ദി|ಧನ್ಯವಾದಗಳು/.test(raw)) {
      return {
        source: 'VOICE_AI',
        responseText: VOICE_AI_LOCAL_RESPONSES.thankYou[langKey] || VOICE_AI_LOCAL_RESPONSES.thankYou.en,
        language: langKey,
        isMedicalTransferRecommended: false,
        suggestedAction: 'NONE',
      };
    }

    // 5. What is Medora
    if (/what is medora|tell me about medora|who are you/i.test(lower) || /மெடோரா என்றால் என்ன|मेडोरा क्या है|మెడోరా అంటే ఏమిటి/.test(raw)) {
      return {
        source: 'VOICE_AI',
        responseText: VOICE_AI_LOCAL_RESPONSES.whatIsMedora[langKey] || VOICE_AI_LOCAL_RESPONSES.whatIsMedora.en,
        language: langKey,
        isMedicalTransferRecommended: false,
        suggestedAction: 'NONE',
      };
    }

    // 6. How do I upload a report / application help
    if (/how do i upload|how to upload|how do i scan|how to use medora/i.test(lower)) {
      return {
        source: 'VOICE_AI',
        responseText: VOICE_AI_LOCAL_RESPONSES.howToUploadReport[langKey] || VOICE_AI_LOCAL_RESPONSES.howToUploadReport.en,
        language: langKey,
        isMedicalTransferRecommended: false,
        suggestedAction: 'NAVIGATE',
        destinationRoute: '/report-scanner',
      };
    }

    // Default polite conversational response
    const defaultResponse: Record<string, string> = {
      en: "I am Medora Voice AI. I can help with application navigation, greetings, and normal conversation. For health and symptoms, ask Medora Medical AI.",
      ta: "நான் மெடோரா வாய்ஸ் AI. முகப்பு மற்றும் பக்கங்களை திறக்க உதவ முடியும். மருத்துவ கேள்விகளுக்கு மெடிக்கல் AI-யிடம் கேட்கவும்.",
      hi: "मैं मेडोरा वॉइस AI हूँ। मैं ऐप नेविगेशन और बातचीत में मदद कर सकता हूँ। स्वास्थ्य संबंधी जांच के लिए मेडिकल AI का उपयोग करें।",
      te: "నేను మెడోరా వాయిస్ AI. నేను యాప్ నావిగేషన్ మరియు సంభాషణలలో సహాయపడగలను. ఆరోగ్య విశ్లేషణ కోసం మెడికల్ AIని అడగండి.",
      ml: "ഞാൻ മെഡോറ വോയ്‌സ് AI ആണ്. ആപ്പ് നാവിഗേഷനും സംഭാഷണങ്ങൾക്കും സഹായിക്കാം. ആരോഗ്യ കാര്യങ്ങൾക്ക് മെഡിക്കൽ AI ഉപയോഗിക്കുക.",
      kn: "ನಾನು ಮೆಡೋರಾ ವಾಯ್ಸ್ AI. ಅಪ್ಲಿಕೇಶನ್ ನ್ಯಾವಿಗೇಷನ್ ಮತ್ತು ಸಾಮಾನ್ಯ ಮಾತುಕತೆಗೆ ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಆರೋಗ್ಯಕ್ಕಾಗಿ ಮೆಡಿಕಲ್ AI ಬಳಸಿ.",
    };

    return {
      source: 'VOICE_AI',
      responseText: defaultResponse[langKey] || defaultResponse.en,
      language: langKey,
      isMedicalTransferRecommended: false,
      suggestedAction: 'NONE',
    };
  }
}

export const voiceAIService = new VoiceAIService();

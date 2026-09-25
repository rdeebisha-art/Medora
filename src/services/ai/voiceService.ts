import { VoiceServiceRequest, VoiceServiceResponse } from './types';
import { medicalService } from './medicalService';
import { voiceCommandMatcher } from '../voiceNavigation/voiceCommandMatcher';

export class VoiceService {
  /**
   * Processes conversational user speech or text.
   * STRICT SAFETY BOUNDARY:
   * 1. Handles ONLY non-medical conversations, greetings, casual speaking, app help, and navigation.
   * 2. NEVER diagnoses or interprets symptoms as a condition.
   * 3. NEVER analyzes medical reports, lab values, or X-rays.
   * 4. NEVER prescribes or modifies medication dosages.
   * 5. If a medical query or symptom is received, strictly routes it to medicalService.analyzeMedicalRequest().
   */
  public async processVoiceRequest(request: VoiceServiceRequest): Promise<VoiceServiceResponse> {
    const raw = (request.text || '').trim();
    const lower = raw.toLowerCase();
    const lang = (request.language || 'en').slice(0, 2) as 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';
    const langKey = ['en', 'ta', 'hi', 'te', 'ml', 'kn'].includes(lang) ? lang : 'en';

    // 1. Detect if this is a medical inquiry or symptom statement
    const isMedicalQuery =
      /\b(fever|cough|headache|pain|chest pain|stomach pain|vomit|vomiting|diarrhea|dizzy|dizziness|bleeding|breath|breathing|cold|sore throat|blood pressure|bp|blood sugar|sugar|glucose|report|x-ray|xray|scan|medicine|tablet|dose|disease|diagnosis|prescribe|symptom|doctor)\b/i.test(
        lower
      ) ||
      /\b(what could cause|what disease do i have|can i take|how much dose|analyze my report|is my bp high)\b/i.test(
        lower
      ) ||
      /(காய்ச்சல்|இருமல்|தலைவலி|நெஞ்சு வலி|வயிற்று வலி|வாந்தி|மூச்சு|ரத்தம்|மருந்து|அறிக்கை|நோய்)/.test(raw) ||
      /(बुखार|खांसी|सिरदर्द|सीने में दर्द|पेट दर्द|उल्टी|सांस|रक्त|दवा|रिपोर्ट|बीमारी)/.test(raw) ||
      /(జ్వరం|దగ్గు|తలనొప్పి|ఛాతీ నొప్పి|కడుపు నొప్పి|వాంతులు|శ్వాస|రక్తం|మందు|నివేదిక)/.test(raw) ||
      /(പനി|ചുമ|തലവേദന|നെഞ്ചുവേദന|വയറുവേദന|ഛർദ്ദി|ശ്വാസം|രക്തം|മരുന്ന്|റിപ്പോർട്ട്)/.test(raw) ||
      /(ಜ್ವರ|ಕೆಮ್ಮು|ತಲೆನೋವು|ಎದೆ ನೋವು|ಹೊಟ್ಟೆ ನೋವು|ವಾಂತಿ|ಉಸಿರಾಟ|ರಕ್ತ|ಔಷಧಿ|ವರದಿ)/.test(raw);

    // If medical, strictly route to MedicalService
    if (isMedicalQuery) {
      const medicalHandoff = await medicalService.analyzeMedicalRequest({
        patientInput: raw,
        language: langKey,
      });

      const transferMessages: Record<string, string> = {
        en: 'I noticed you mentioned medical symptoms or health questions. I have routed your query to Medora Medical AI for structured clinical assessment.',
        ta: 'நீங்கள் மருத்துவ அறிகுறிகள் அல்லது உடல்நலக் கேள்விகளைக் குறிப்பிட்டுள்ளீர்கள். மருத்துவ பகுப்பாய்விற்காக இதை மெடோரா மெடிக்கல் AI-க்கு மாற்றியுள்ளேன்.',
        hi: 'आपने स्वास्थ्य संबंधी लक्षणों या चिकित्सा प्रश्न का उल्लेख किया है। मैंने आपके अनुरोध को मेडोरा मेडिकल एआई को स्थानांतरित कर दिया है।',
        te: 'మీరు వైద్య లక్షణాలు లేదా ఆరోగ్య ప్రశ్నలను ప్రస్తావించారు. నేను మీ అభ్యర్థనను మెడోరా మెడికల్ AI కి పంపించాను.',
        ml: 'നിങ്ങൾ ആരോഗ്യ ലക്ഷണങ്ങളെക്കുറിച്ചാണ് ചോദിക്കുന്നത്. ശരിയായ പരിശോധനയ്ക്കായി ഇത് മെഡോറ മെഡിക്കൽ AI-ലേക്ക് കൈമാറിയിരിക്കുന്നു.',
        kn: 'ನೀವು ವೈದ್ಯಕೀಯ ಲಕ್ಷಣಗಳ ಕುರಿತು ತಿಳಿಸಿದ್ದೀರಿ. ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಇದನ್ನು ಮೆಡೋರಾ ಮೆಡಿಕಲ್ AI ಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: transferMessages[langKey] || transferMessages.en,
        language: langKey,
        isMedicalQuery: true,
        medicalHandoff,
        suggestedAction: 'TRANSFER_TO_MEDICAL_AI',
        destinationRoute: '/ai',
      };
    }

    // 2. Greetings & Casual Conversation (Handled before navigation keywords so "Hello Medora" is a greeting)
    if (/^(hi|hello|hey|namaste|vanakkam|namaskaram|good\s*(morning|afternoon|evening))\b/i.test(lower)) {
      const greetings: Record<string, string> = {
        en: 'Hello! I am Medora Voice AI. How can I help you navigate or use the application today?',
        ta: 'வணக்கம்! நான் மெடோரா வாய்ஸ் AI. பயன்பாட்டைப் பயன்படுத்த இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
        hi: 'नमस्ते! मैं मेडोरा वॉयस एआई हूँ। मैं आज ऐप का उपयोग करने में आपकी क्या सहायता कर सकता हूँ?',
        te: 'నమస్కారం! నేను మెడోరా వాయిస్ AI. మీకు ఎలా సహాయపడగలను?',
        ml: 'നമസ്കാരം! ഞാൻ മെഡോറ വോയ്സ് AI ആണ്. ഞാൻ എങ്ങനെ സഹായിക്കണം?',
        kn: 'ನಮಸ್ಕಾರ! ನಾನು ಮೆಡೋರಾ ವಾಯ್ಸ್ AI. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
      };

      return {
        source: 'VOICE_AI',
        responseText: greetings[langKey] || greetings.en,
        language: langKey,
        isMedicalQuery: false,
        suggestedAction: 'NONE',
      };
    }

    // 3. How are you?
    if (/how are you|how do you do/i.test(lower) || /எப்படி இருக்கிறீர்கள்|कैसे हैं|ఎలా ఉన్నారు|എങ്ങനെയുണ്ട്|ಹೇಗಿದ್ದೀರಿ/.test(raw)) {
      const howAreYou: Record<string, string> = {
        en: 'I am doing well, thank you for asking! I am ready to help you navigate Medora or answer questions about how to use the app.',
        ta: 'நான் நலமாக இருக்கிறேன், கேட்டதற்கு நன்றி! மெடோரா பயன்பாட்டை இயக்க நான் தயாராக இருக்கிறேன்.',
        hi: 'मैं ठीक हूँ, पूछने के लिए धन्यवाद! मैं मेडोरा को संचालित करने में आपकी सहायता के लिए तैयार हूँ।',
        te: 'నేను బాగున్నాను, అడిగినందుకు ధన్యవాదాలు! నేను మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.',
        ml: 'എനിക്ക് സുഖമാണ്, ചോദിച്ചതിന് നന്ദി! മെഡോറ ഉപയോഗിക്കാൻ സഹായിക്കാൻ ഞാൻ തയ്യാറാണ്.',
        kn: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಕೇಳಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು! ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: howAreYou[langKey] || howAreYou.en,
        language: langKey,
        isMedicalQuery: false,
        suggestedAction: 'NONE',
      };
    }

    // 4. Thank you
    if (/thank|thanks|dhanyawad|nandri/i.test(lower) || /நன்றி|धन्यवाद|ధన్యవాదాలు|നന്ദി|ಧನ್ಯವಾದಗಳು/.test(raw)) {
      const thankYou: Record<string, string> = {
        en: 'You are very welcome! Let me know if you need anything else.',
        ta: 'மிக்க மகிழ்ச்சி! மேலும் உதவி தேவைப்பட்டால் கேட்கவும்.',
        hi: 'आपका बहुत स्वागत है! किसी भी अन्य सहायता के लिए मुझे बताएं।',
        te: 'మీకు స్వాగతం! మరేదైనా అవసరమైతే చెప్పండి.',
        ml: 'സ്വാഗതം! മറ്റെന്തെങ്കിലും ആവശ്യമുണ്ടെങ്കിൽ അറിയിക്കുക.',
        kn: 'ನಿಮಗೆ ಸ್ವಾಗತ! ಬೇರೆ ಸಹಾಯ ಬೇಕಾದರೆ ತಿಳಿಸಿ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: thankYou[langKey] || thankYou.en,
        language: langKey,
        isMedicalQuery: false,
        suggestedAction: 'NONE',
      };
    }

    // 5. Navigation Commands (Deterministic offline pattern matching)
    // Check navigation matching e.g. "Open medicines", "Open dashboard", "Open family health", "Open appointments", "Go to settings"
    const navMatch = voiceCommandMatcher.matchCommand(raw, 'auto');
    if (navMatch.matched && navMatch.route) {
      const navMessages: Record<string, string> = {
        en: `Opening ${navMatch.route.replace('/', '') || 'page'} for you now.`,
        ta: `${navMatch.route.replace('/', '')} பக்கத்தைத் திறக்கிறேன்.`,
        hi: `${navMatch.route.replace('/', '')} पृष्ठ खोल रहा हूँ।`,
        te: `${navMatch.route.replace('/', '')} పేజీని తెరుస్తున్నాను.`,
        ml: `${navMatch.route.replace('/', '')} പേജ് തുറക്കുന്നു.`,
        kn: `${navMatch.route.replace('/', '')} ಪುಟವನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.`,
      };

      return {
        source: 'VOICE_AI',
        responseText: navMessages[langKey] || navMessages.en,
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: navMatch.route,
        suggestedAction: 'NAVIGATE',
      };
    }

    // Direct phrases for specific settings/appointments/family if not caught by dictionary
    if (/open (family|family health)|go to (family|family health)/i.test(lower)) {
      return {
        source: 'VOICE_AI',
        responseText: 'Opening Family Health dashboard.',
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: '/family',
        suggestedAction: 'NAVIGATE',
      };
    }

    if (/open appointments|go to appointments/i.test(lower)) {
      return {
        source: 'VOICE_AI',
        responseText: 'Opening appointments schedule.',
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: '/appointments',
        suggestedAction: 'NAVIGATE',
      };
    }

    if (/go to settings|open settings/i.test(lower)) {
      return {
        source: 'VOICE_AI',
        responseText: 'Opening application settings.',
        language: langKey,
        isMedicalQuery: false,
        destinationRoute: '/settings',
        suggestedAction: 'NAVIGATE',
      };
    }

    // 6. Application Help / Guidance
    if (/how do i upload|how to upload|how do i scan|how to use medora|what is medora/i.test(lower)) {
      const helpMsg: Record<string, string> = {
        en: 'To upload a report, go to the Medical Records or Scanner tab. You can take a photo or choose an existing image. For medical questions, ask Medora Medical AI.',
        ta: 'மருத்துவ அறிக்கையை பதிவேற்ற, மெடிக்கல் ரெக்கார்ட்ஸ் அல்லது ஸ்கேனர் பக்கத்திற்குச் செல்லவும்.',
        hi: 'रिपोर्ट अपलोड करने के लिए मेडिकल रिकॉर्ड्स या स्कैनर पर जाएं। आप फोटो ले सकते हैं।',
        te: 'రిపోర్టును అప్‌లోడ్ చేయడానికి మెడికల్ రికార్డ్స్ లేదా స్కానర్‌కి వెళ్లండి.',
        ml: 'മെഡിക്കൽ റിപ്പോർട്ട് അപ്‌ലോഡ് ചെയ്യാൻ റെക്കോർഡ്സ് അല്ലെങ്കിൽ സ്കാനർ ടാബിലേക്ക് പോകുക.',
        kn: 'ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಮೆಡಿಕಲ್ ರೆಕಾರ್ಡ್ಸ್ ಅಥವಾ ಸ್ಕ್ಯಾನರ್‌ಗೆ ಹೋಗಿ.',
      };

      return {
        source: 'VOICE_AI',
        responseText: helpMsg[langKey] || helpMsg.en,
        language: langKey,
        isMedicalQuery: false,
        suggestedAction: 'NAVIGATE',
        destinationRoute: '/report-scanner',
      };
    }

    // Default polite conversational voice response
    const defaultResponses: Record<string, string> = {
      en: 'I am Medora Voice AI. I can assist with navigation, greetings, and app help. If you have medical symptoms or health inquiries, please ask Medora Medical AI.',
      ta: 'நான் மெடோரா வாய்ஸ் AI. பக்கங்களை திறக்கவும், பொதுவான உரையாடல்களுக்கும் உதவ முடியும். மருத்துவ கேள்விகளுக்கு மெடிக்கல் AI-யிடம் கேட்கவும்.',
      hi: 'मैं मेडोरा वॉयस एआई हूँ। मैं नेविगेशन और ऐप सहायता में मदद कर सकता हूँ। चिकित्सा लक्षणों के लिए कृपया मेडिकल एआई से पूछें।',
      te: 'నేను మెడోరా వాయిస్ AI. నావిగేషన్ మరియు సాధారణ సహాయం చేయగలను. ఆరోగ్య లక్షణాల కోసం దయచేసి మెడికల్ AI ని అడగండి.',
      ml: 'ഞാൻ മെഡോറ വോയ്സ് AI ആണ്. ആപ്പ് ഉപയോഗിക്കാൻ സഹായിക്കാം. ലക്ഷണങ്ങൾക്ക് മെഡിക്കൽ AI ഉപയോഗിക്കുക.',
      kn: 'ನಾನು ಮೆಡೋರಾ ವಾಯ್ಸ್ AI. ನ್ಯಾವಿಗೇಷನ್ ಮತ್ತು ಆ್ಯಪ್ ಸಹಾಯಕ್ಕೆ ನಾನು ಸಿದ್ಧ. ವೈದ್ಯಕೀಯ ಲಕ್ಷಣಗಳಿಗೆ ಮೆಡಿಕಲ್ AI ಬಳಸಿ.',
    };

    return {
      source: 'VOICE_AI',
      responseText: defaultResponses[langKey] || defaultResponses.en,
      language: langKey,
      isMedicalQuery: false,
      suggestedAction: 'NONE',
    };
  }
}

export const voiceService = new VoiceService();

import {
  VoiceNavigationIntent,
  VoiceNavigationLanguage,
  VoiceNavLangCode,
  VoiceCommand,
} from './voiceNavigationTypes';

export type SupportedVoiceNavLang = VoiceNavLangCode;

export interface RoutePhrases {
  routeId: string;
  intent: VoiceNavigationIntent;
  phrases: string[];
  keywords?: string[];
}

/**
 * Multilingual Voice Command Dictionary covering English, Tamil, Hindi, Telugu, Malayalam, and Kannada.
 * Stored locally in the application bundle — 100% offline-ready, no cloud dependencies.
 */
export const VOICE_COMMAND_DICTIONARY: Record<VoiceNavLangCode, RoutePhrases[]> = {
  // ─── 1. ENGLISH (en-IN) ──────────────────────────────────────────────────────────
  en: [
    {
      routeId: 'dashboard',
      intent: 'DASHBOARD',
      phrases: [
        'open dashboard', 'go to dashboard', 'show dashboard', 'open home', 'go home',
        'dashboard', 'home', 'main page', 'home page', 'start page', 'take me home',
        'medora home', 'show home', 'navigate to dashboard', 'back to dashboard'
      ],
      keywords: ['dashboard', 'home', 'main'],
    },
    {
      routeId: 'health',
      intent: 'MY_HEALTH',
      phrases: [
        'open my health', 'go to my health', 'show my health', 'my health', 'health overview',
        'health summary', 'open health', 'go to health', 'my vitals', 'health status',
        'show health', 'patient health', 'health blueprint', 'my health blueprint'
      ],
      keywords: ['health', 'vitals', 'overview'],
    },
    {
      routeId: 'family',
      intent: 'FAMILY_HEALTH',
      phrases: [
        'open family', 'go to family', 'show family', 'family', 'family health',
        'family members', 'family page', 'open family members', 'show family members',
        'go to family health', 'my family', 'household health', 'family profile'
      ],
      keywords: ['family', 'members', 'household'],
    },
    {
      routeId: 'medicines',
      intent: 'MEDICINES',
      phrases: [
        'go to medicines', 'open medicines', 'show medicines', 'open medication',
        'show my medicines', 'medicine reminders', 'open my medicines',
        'medicines', 'my medicines', 'medicine reminder',
        'pills', 'daily medicines', 'show pills', 'take medicines', 'prescriptions',
        'medicine schedule', 'open reminder', 'show medicine schedule', 'medication schedule'
      ],
      keywords: ['medicine', 'medicines', 'pill', 'pills', 'reminder', 'prescription', 'medication'],
    },
    {
      routeId: 'records',
      intent: 'MEDICAL_RECORDS',
      phrases: [
        'open records', 'go to records', 'show records', 'medical records',
        'health records', 'past records', 'patient records', 'open medical records',
        'go to medical records', 'clinical history', 'my records', 'past prescriptions'
      ],
      keywords: ['records', 'history', 'documents'],
    },
    {
      routeId: 'report_scanner',
      intent: 'REPORT_SCANNER',
      phrases: [
        'open reports', 'go to reports', 'show reports', 'medical reports',
        'report scanner', 'scan report', 'upload report', 'scan medical report',
        'lab reports', 'blood test report', 'open report scanner', 'go to report scanner',
        'health reports', 'document scanner', 'scan document'
      ],
      keywords: ['report', 'reports', 'scanner', 'scan'],
    },
    {
      routeId: 'xray_viewer',
      intent: 'XRAY',
      phrases: [
        'open xray', 'go to xray', 'open x-ray', 'go to x-ray', 'show xray',
        'x-ray viewer', 'xray viewer', 'medical scans', 'chest scan', 'xray images',
        'medical images', 'open scans', 'scan viewer', 'camera scan', 'xray report'
      ],
      keywords: ['xray', 'x-ray', 'scan'],
    },
    {
      routeId: 'health_tests',
      intent: 'HEALTH_TESTS',
      phrases: [
        'open health tests', 'go to health tests', 'show health tests', 'health tests',
        'lab tests', 'blood pressure test', 'blood sugar test', 'tests', 'my tests',
        'vitals check', 'diagnostic tests', 'pending tests', 'view tests'
      ],
      keywords: ['tests', 'vitals', 'diagnostic', 'blood pressure'],
    },
    {
      routeId: 'vaccinations',
      intent: 'VACCINATIONS',
      phrases: [
        'open vaccinations', 'go to vaccinations', 'show vaccinations', 'vaccination',
        'vaccines', 'vaccine schedule', 'immunization', 'polio drops', 'due vaccines',
        'vaccine tracker', 'child vaccination', 'my vaccines', 'open immunization'
      ],
      keywords: ['vaccine', 'vaccines', 'vaccination', 'immunization'],
    },
    {
      routeId: 'ai_assistant',
      intent: 'AI_ASSISTANT',
      phrases: [
        'open ai', 'go to ai', 'show ai', 'ai assistant', 'medora ai',
        'ai health assistant', 'talk to ai', 'chat with ai', 'ask medora',
        'speak to ai', 'open chatbot', 'health assistant', 'symptom ai'
      ],
      keywords: ['ai', 'assistant', 'chatbot', 'ask medora'],
    },
    {
      routeId: 'doctor_portal',
      intent: 'DOCTOR_CONSULTATION',
      phrases: [
        'open doctor', 'go to doctor', 'show doctor', 'doctor consultation',
        'doctor portal', 'consult doctor', 'talk to doctor', 'call doctor',
        'find doctor', 'connect to doctor', 'clinician portal', 'rural doctor'
      ],
      keywords: ['doctor', 'consult', 'consultation'],
    },
    {
      routeId: 'doctor_summary',
      intent: 'DOCTOR_SUMMARY',
      phrases: [
        'open doctor summary', 'go to doctor summary', 'show doctor summary',
        'doctor summary', 'clinical summary', 'consultation summary', 'doctor handoff',
        'handoff summary', 'medical summary', 'patient summary'
      ],
      keywords: ['summary', 'handoff', 'clinical summary'],
    },
    {
      routeId: 'appointments',
      intent: 'APPOINTMENTS',
      phrases: [
        'open appointments', 'go to appointments', 'show appointments',
        'show my appointments', 'appointments', 'book appointment', 'doctor appointments',
        'schedule visit', 'clinic visit', 'upcoming appointments', 'next consultation'
      ],
      keywords: ['appointment', 'appointments', 'visit', 'booking'],
    },
    {
      routeId: 'emergency',
      intent: 'EMERGENCY',
      phrases: [
        'open emergency', 'go to emergency', 'show emergency', 'open emergency help', 'emergency',
        'emergency help', 'help me', 'call ambulance', 'sos', 'medical emergency',
        'urgent help', 'emergency hotline', 'hospital emergency', 'accident'
      ],
      keywords: ['emergency', 'sos', 'ambulance', 'urgent'],
    },
    {
      routeId: 'hospitals',
      intent: 'NEARBY_HOSPITALS',
      phrases: [
        'open hospitals', 'go to hospitals', 'show hospitals', 'nearby hospitals',
        'find hospitals', 'nearest hospital', 'primary health center', 'phc',
        'community health center', 'hospital directory', 'government hospital'
      ],
      keywords: ['hospital', 'hospitals', 'clinic', 'phc'],
    },
    {
      routeId: 'schemes',
      intent: 'GOVERNMENT_SCHEMES',
      phrases: [
        'open schemes', 'go to schemes', 'show schemes', 'government schemes',
        'health schemes', 'ayushman bharat', 'insurance scheme', 'pmjay',
        'free medical scheme', 'welfare schemes', 'government insurance'
      ],
      keywords: ['scheme', 'schemes', 'ayushman', 'pmjay', 'insurance'],
    },
    {
      routeId: 'education',
      intent: 'HEALTH_EDUCATION',
      phrases: [
        'open health education', 'go to education', 'show education', 'health education',
        'health guides', 'medical advice', 'disease guide', 'hygiene tips',
        'health tutorials', 'preventive care', 'first aid guide'
      ],
      keywords: ['education', 'guide', 'tutorial', 'learning'],
    },
    {
      routeId: 'maternity',
      intent: 'PREGNANCY',
      phrases: [
        'open maternity', 'go to maternity', 'show maternity', 'maternity care',
        'pregnancy', 'pregnancy care', 'pregnant woman', 'antenatal care',
        'mother care', 'maternal health', 'trimester guide', 'new mother care'
      ],
      keywords: ['maternity', 'pregnancy', 'pregnant', 'mother'],
    },
    {
      routeId: 'newborn',
      intent: 'NEWBORN_CARE',
      phrases: [
        'open newborn', 'go to newborn', 'show newborn', 'newborn care',
        'baby care', 'infant care', 'new baby', 'baby feeding', 'infant health'
      ],
      keywords: ['newborn', 'infant', 'baby'],
    },
    {
      routeId: 'childcare',
      intent: 'CHILD_CARE',
      phrases: [
        'open child care', 'go to child care', 'show child care', 'child care',
        'children health', 'pediatric care', 'kids health', 'child growth'
      ],
      keywords: ['child', 'children', 'kids', 'pediatric'],
    },
    {
      routeId: 'elderly',
      intent: 'ELDERLY_CARE',
      phrases: [
        'open elderly', 'go to elderly', 'show elderly', 'elderly care',
        'senior citizen', 'grandparents health', 'geriatric care', 'old age care'
      ],
      keywords: ['elderly', 'senior', 'geriatric', 'grandparents'],
    },
    {
      routeId: 'sms',
      intent: 'SMS_COMMUNICATION',
      phrases: [
        'open sms', 'go to sms', 'show sms', 'sms communication', 'send sms',
        'offline messaging', 'text messages', 'sms alerts'
      ],
      keywords: ['sms', 'message', 'messaging', 'text'],
    },
    {
      routeId: 'ussd',
      intent: 'USSD',
      phrases: [
        'open ussd', 'go to ussd', 'show ussd', 'ussd code', 'basic phone',
        'star 123 hash', 'feature phone mode', 'offline phone'
      ],
      keywords: ['ussd', 'feature phone', 'star 123 hash'],
    },
    {
      routeId: 'settings',
      intent: 'SETTINGS',
      phrases: [
        'open settings', 'go to settings', 'show settings', 'settings',
        'app settings', 'preferences', 'configure', 'change settings'
      ],
      keywords: ['settings', 'preferences', 'options'],
    },
    {
      routeId: 'language',
      intent: 'LANGUAGE',
      phrases: [
        'open language', 'go to language', 'show language', 'change language',
        'language settings', 'language bridge', 'switch language', 'select language'
      ],
      keywords: ['language', 'bridge', 'translate'],
    },
  ],

  // ─── 2. TAMIL (ta-IN) ────────────────────────────────────────────────────────────
  ta: [
    {
      routeId: 'dashboard',
      intent: 'DASHBOARD',
      phrases: [
        'டாஷ்போர்டை திற', 'டாஷ்போர்டுக்கு செல்', 'முகப்பை திற', 'முகப்புக்கு செல்',
        'டாஷ்போர்டு', 'முகப்பு', 'முகப்பு பக்கம்', 'முதல் பக்கம்',
        'மெடோரா முகப்பு', 'முகப்பிற்கு போ'
      ],
      keywords: ['முகப்பு', 'டாஷ்போர்டு'],
    },
    {
      routeId: 'health',
      intent: 'MY_HEALTH',
      phrases: [
        'என் உடல்நலத்தை காட்டு', 'என் உடல்நலம்', 'உடல்நல விவரம்', 'என் நலம்',
        'உடல்நலம்', 'என் ஆரோக்கியம்', 'உடல்நிலை காட்டு', 'என் மருத்துவ நலம்'
      ],
      keywords: ['உடல்நலம்', 'ஆரோக்கியம்'],
    },
    {
      routeId: 'family',
      intent: 'FAMILY_HEALTH',
      phrases: [
        'குடும்ப நலம்', 'குடும்ப ஆரோக்கியம்', 'குடும்ப உறுப்பினர்கள்',
        'என் குடும்பம்', 'குடும்ப பக்கம்', 'குடும்ப நலம் திற'
      ],
      keywords: ['குடும்பம்', 'குடும்ப நலம்'],
    },
    {
      routeId: 'medicines',
      intent: 'MEDICINES',
      phrases: [
        'மருந்துகளுக்கு செல்', 'மருந்துகளை திற', 'மருந்துகளை காட்டு',
        'என் மருந்துகளை காட்டு', 'மருந்து நினைவூட்டல்கள்',
        'மருந்துகளுக்கு செல்லுங்கள்', 'மருந்துகள்', 'என் மருந்துகள்',
        'மருந்து நினைவூட்டல்', 'மருந்து பட்டியல்', 'மாத்திரைகள்',
        'தினசரி மருந்துகள்'
      ],
      keywords: ['மருந்து', 'மருந்துகள்', 'மாத்திரை'],
    },
    {
      routeId: 'records',
      intent: 'MEDICAL_RECORDS',
      phrases: [
        'மருத்துவ பதிவுகள்', 'பழைய பதிவுகள்', 'மருத்துவ ஆவணங்கள்',
        'என் மருத்துவ பதிவுகள்', 'பதிவுகள் பக்கம்', 'மருத்துவ வரலாறு'
      ],
      keywords: ['பதிவுகள்', 'ஆவணங்கள்'],
    },
    {
      routeId: 'report_scanner',
      intent: 'REPORT_SCANNER',
      phrases: [
        'அறிக்கை ஸ்கேனர்', 'மருத்துவ அறிக்கை', 'ஸ்கேன் செய்', 'அறிக்கையை ஸ்கேன் செய்',
        'இரத்த பரிசோதனை அறிக்கை', 'ஆய்வக அறிக்கை', 'அறிக்கை பதிவேற்று'
      ],
      keywords: ['அறிக்கை', 'ஸ்கேனர்'],
    },
    {
      routeId: 'xray_viewer',
      intent: 'XRAY',
      phrases: [
        'எக்ஸ்-ரே', 'எக்ஸ்ரே', 'ஸ்கேன் படம்', 'எக்ஸ்ரே பார்',
        'எக்ஸ்-ரே படங்கள்', 'மார்பு எக்ஸ்ரே'
      ],
      keywords: ['எக்ஸ்ரே', 'எக்ஸ்-ரே', 'ஸ்கேன்'],
    },
    {
      routeId: 'health_tests',
      intent: 'HEALTH_TESTS',
      phrases: [
        'ஆரோக்கிய பரிசோதனைகள்', 'பரிசோதனைகள்', 'இரத்த அழுத்த பரிசோதனை',
        'சர்க்கரை அளவு', 'மருத்துவ சோதனைகள்', 'சோதனை முடிவுகள்'
      ],
      keywords: ['பரிசோதனை', 'சோதனை'],
    },
    {
      routeId: 'vaccinations',
      intent: 'VACCINATIONS',
      phrases: [
        'தடுப்பூசி', 'தடுப்பூசி அட்டவணை', 'குழந்தை தடுப்பூசி',
        'போலியோ சொட்டு மருந்து', 'தடுப்பூசிகள்', 'தடுப்பூசி நிலவரம்'
      ],
      keywords: ['தடுப்பூசி', 'தடுப்பூசிகள்'],
    },
    {
      routeId: 'ai_assistant',
      intent: 'AI_ASSISTANT',
      phrases: [
        'மெடோரா AI', 'AI உதவியாளர்', 'AI உடன் பேசு',
        'செயற்கை நுண்ணறிவு', 'மருத்துவ உதவியாளர்'
      ],
      keywords: ['AI', 'உதவியாளர்'],
    },
    {
      routeId: 'doctor_portal',
      intent: 'DOCTOR_CONSULTATION',
      phrases: [
        'மருத்துவர் ஆலோசனை', 'மருத்துவரை பார்', 'மருத்துவரிடம் பேசு',
        'மருத்துவர் போர்ட்டல்', 'டாக்டரிடம் பேசு'
      ],
      keywords: ['மருத்துவர்', 'டாக்டர்'],
    },
    {
      routeId: 'doctor_summary',
      intent: 'DOCTOR_SUMMARY',
      phrases: [
        'மருத்துவ சுருக்கம்', 'மருத்துவர் சுருக்கம்', 'மருத்துவ குறிப்பு'
      ],
      keywords: ['சுருக்கம்', 'குறிப்பு'],
    },
    {
      routeId: 'appointments',
      intent: 'APPOINTMENTS',
      phrases: [
        'மருத்துவ சந்திப்புகள்', 'சந்திப்புகள்', 'முன்பதிவு',
        'மருத்துவர் சந்திப்பு', 'சந்திப்பு பதிவு செய்'
      ],
      keywords: ['சந்திப்பு', 'முன்பதிவு'],
    },
    {
      routeId: 'emergency',
      intent: 'EMERGENCY',
      phrases: [
        'அவசரநிலையை திற', 'அவசர உதவிக்கு செல்', 'அவசர உதவி',
        'அவசரநிலையை காட்டு', 'ஆம்புலன்ஸ்', 'அவசர சிகிச்சை',
        'அவசர அழைப்பு', 'உடனடி உதவி'
      ],
      keywords: ['அவசரம்', 'ஆம்புலன்ஸ்'],
    },
    {
      routeId: 'hospitals',
      intent: 'NEARBY_HOSPITALS',
      phrases: [
        'அருகிலுள்ள மருத்துவமனைகள்', 'மருத்துவமனை', 'அரசு மருத்துவமனை',
        'ஆரம்ப சுகாதார நிலையம்', 'கிளினிக்'
      ],
      keywords: ['மருத்துவமனை', 'சுகாதார நிலையம்'],
    },
    {
      routeId: 'schemes',
      intent: 'GOVERNMENT_SCHEMES',
      phrases: [
        'அரசு நலத்திட்டங்கள்', 'காப்பீட்டு திட்டம்', 'ஆயுஷ்மான் பாரத்',
        'முதலமைச்சர் காப்பீடு', 'இலவச சிகிச்சை'
      ],
      keywords: ['திட்டம்', 'காப்பீடு', 'ஆயுஷ்மான்'],
    },
    {
      routeId: 'education',
      intent: 'HEALTH_EDUCATION',
      phrases: [
        'சுகாதார வழிகாட்டல்', 'ஆரோக்கிய கல்வி', 'சுகாதார குறிப்புகள்'
      ],
      keywords: ['கல்வி', 'வழிகாட்டல்'],
    },
    {
      routeId: 'maternity',
      intent: 'PREGNANCY',
      phrases: [
        'தாய்மை நலம்', 'கர்ப்பகால பராமரிப்பு', 'கர்ப்பிணி பெண்', 'தாய் சேய் நலம்'
      ],
      keywords: ['தாய்மை', 'கர்ப்பம்', 'கர்ப்பிணி'],
    },
    {
      routeId: 'newborn',
      intent: 'NEWBORN_CARE',
      phrases: [
        'பச்சிளம் குழந்தை நலம்', 'குழந்தை பராமரிப்பு', 'குழந்தை உணவு'
      ],
      keywords: ['பச்சிளம்', 'குழந்தை'],
    },
    {
      routeId: 'childcare',
      intent: 'CHILD_CARE',
      phrases: [
        'குழந்தை நலம்', 'சிறுவர் ஆரோக்கியம்', 'குழந்தை வளர்ச்சி'
      ],
      keywords: ['குழந்தை'],
    },
    {
      routeId: 'elderly',
      intent: 'ELDERLY_CARE',
      phrases: [
        'முதியோர் பராமரிப்பு', 'முதியோர் நலம்', 'தாத்தா பாட்டி ஆரோக்கியம்'
      ],
      keywords: ['முதியோர்'],
    },
    {
      routeId: 'sms',
      intent: 'SMS_COMMUNICATION',
      phrases: [
        'குறுஞ்செய்தி தொடர்பு', 'எஸ்எம்எஸ்', 'செய்தி அனுப்பு'
      ],
      keywords: ['எஸ்எம்எஸ்', 'குறுஞ்செய்தி'],
    },
    {
      routeId: 'ussd',
      intent: 'USSD',
      phrases: [
        'USSD சாதாரண போன்', 'சாதாரண போன் மோட்'
      ],
      keywords: ['USSD', 'சாதாரண போன்'],
    },
    {
      routeId: 'settings',
      intent: 'SETTINGS',
      phrases: [
        'அமைப்புகள்', 'செயலி அமைப்புகள்', 'அமைப்பை மாற்று'
      ],
      keywords: ['அமைப்புகள்'],
    },
    {
      routeId: 'language',
      intent: 'LANGUAGE',
      phrases: [
        'மொழி பாலம்', 'மொழியை மாற்று', 'மொழி தேர்வு'
      ],
      keywords: ['மொழி'],
    },
  ],

  // ─── 3. HINDI (hi-IN) ────────────────────────────────────────────────────────────
  hi: [
    {
      routeId: 'dashboard',
      intent: 'DASHBOARD',
      phrases: [
        'डैशबोर्ड खोलो', 'डैशबोर्ड पर जाएं', 'होम खोलो', 'डैशबोर्ड खोलें',
        'डैशबोर्ड', 'होम पेज', 'मुख्य पृष्ठ', 'होम पर जाएं', 'मेडोरा होम'
      ],
      keywords: ['डैशबोर्ड', 'होम'],
    },
    {
      routeId: 'health',
      intent: 'MY_HEALTH',
      phrases: [
        'मेरा स्वास्थ्य दिखाएं', 'मेरा स्वास्थ्य', 'स्वास्थ्य विवरण',
        'मेरी सेहत', 'स्वास्थ्य स्थिति', 'वाइटल्स'
      ],
      keywords: ['स्वास्थ्य', 'सेहत'],
    },
    {
      routeId: 'family',
      intent: 'FAMILY_HEALTH',
      phrases: [
        'परिवार स्वास्थ्य', 'परिवार का स्वास्थ्य', 'परिवार के सदस्य',
        'मेरा परिवार'
      ],
      keywords: ['परिवार', 'सदस्य'],
    },
    {
      routeId: 'medicines',
      intent: 'MEDICINES',
      phrases: [
        'दवाइयों पर जाएं', 'दवाइयां खोलो', 'मेरी दवाइयां दिखाओ', 'दवा रिमाइंडर खोलो',
        'दवाइयां', 'मेरी दवाइयां', 'दवा रिमाइंडर',
        'दवाइयों की सूची', 'गोलियां', 'दवाएं दिखाएं', 'दवाई का समय'
      ],
      keywords: ['दवाई', 'दवाइयां', 'गोली', 'रिमाइंडर'],
    },
    {
      routeId: 'records',
      intent: 'MEDICAL_RECORDS',
      phrases: [
        'मेडिकल रिकॉर्ड', 'स्वास्थ्य रिकॉर्ड', 'पुरानी पर्चियां',
        'दस्तावेज़', 'इलाज का इतिहास'
      ],
      keywords: ['रिकॉर्ड', 'दस्तावेज़'],
    },
    {
      routeId: 'report_scanner',
      intent: 'REPORT_SCANNER',
      phrases: [
        'रिपोर्ट स्कैनर', 'मेडिकल रिपोर्ट', 'रिपोर्ट स्कैन करें',
        'खून की जांच रिपोर्ट', 'जांच रिपोर्ट'
      ],
      keywords: ['रिपोर्ट', 'स्कैनर', 'जांच'],
    },
    {
      routeId: 'xray_viewer',
      intent: 'XRAY',
      phrases: [
        'एक्स-रे', 'एक्सरे', 'स्कैन इमेज', 'छाती का एक्स-रे'
      ],
      keywords: ['एक्स-रे', 'एक्सरे', 'स्कैन'],
    },
    {
      routeId: 'health_tests',
      intent: 'HEALTH_TESTS',
      phrases: [
        'स्वास्थ्य परीक्षण', 'लैब टेस्ट', 'रक्तचाप जांच', 'शुगर टेस्ट', 'परीक्षण'
      ],
      keywords: ['परीक्षण', 'टेस्ट', 'जांच'],
    },
    {
      routeId: 'vaccinations',
      intent: 'VACCINATIONS',
      phrases: [
        'टीकाकरण', 'टीका', 'टीके की तारीख', 'पोलियो ड्राप', 'बच्चों का टीका'
      ],
      keywords: ['टीका', 'टीकाकरण'],
    },
    {
      routeId: 'ai_assistant',
      intent: 'AI_ASSISTANT',
      phrases: [
        'मेडोरा AI', 'AI सहायक', 'AI से बात करें', 'हेल्थ सहायक'
      ],
      keywords: ['AI', 'सहायक'],
    },
    {
      routeId: 'doctor_portal',
      intent: 'DOCTOR_CONSULTATION',
      phrases: [
        'डॉक्टर परामर्श', 'डॉक्टर से बात करें', 'डॉक्टर को दिखाएं', 'चिकित्सक'
      ],
      keywords: ['डॉक्टर', 'परामर्श'],
    },
    {
      routeId: 'doctor_summary',
      intent: 'DOCTOR_SUMMARY',
      phrases: [
        'डॉक्टर सारांश', 'परामर्श सारांश', 'चिकित्सा सारांश'
      ],
      keywords: ['सारांश'],
    },
    {
      routeId: 'appointments',
      intent: 'APPOINTMENTS',
      phrases: [
        'अपॉइंटमेंट', 'अपॉइंटमेंट दिखाओ', 'डॉक्टर से मिलना', 'मुलाकात का समय'
      ],
      keywords: ['अपॉइंटमेंट', 'मुलाकात'],
    },
    {
      routeId: 'emergency',
      intent: 'EMERGENCY',
      phrases: [
        'आपातकाल खोलो', 'आपातकाल पर जाएं', 'आपातकालीन सहायता खोलो',
        'आपातकाल', 'आपातकालीन सहायता', 'एंबुलेंस बुलाओ', 'इमरजेंसी', 'मदद चाहिए'
      ],
      keywords: ['आपातकाल', 'एंबुलेंस', 'इमरजेंसी'],
    },
    {
      routeId: 'hospitals',
      intent: 'NEARBY_HOSPITALS',
      phrases: [
        'नजदीकी अस्पताल', 'अस्पताल', 'सरकारी अस्पताल', 'प्राथमिक स्वास्थ्य केंद्र'
      ],
      keywords: ['अस्पताल', 'स्वास्थ्य केंद्र'],
    },
    {
      routeId: 'schemes',
      intent: 'GOVERNMENT_SCHEMES',
      phrases: [
        'सरकारी स्वास्थ्य योजनाएं', 'आयुष्मान भारत', 'स्वास्थ्य बीमा योजना'
      ],
      keywords: ['योजना', 'आयुष्मान', 'बीमा'],
    },
    {
      routeId: 'education',
      intent: 'HEALTH_EDUCATION',
      phrases: [
        'स्वास्थ्य शिक्षा', 'रोग मार्गदर्शिका', 'स्वास्थ्य सुझाव'
      ],
      keywords: ['शिक्षा', 'सुझाव'],
    },
    {
      routeId: 'maternity',
      intent: 'PREGNANCY',
      phrases: [
        'मातृत्व देखभाल', 'गर्भावस्था', 'गर्भवती महिला', 'प्रसव पूर्व देखभाल'
      ],
      keywords: ['मातृत्व', 'गर्भावस्था'],
    },
    {
      routeId: 'newborn',
      intent: 'NEWBORN_CARE',
      phrases: [
        'नवजात शिशु देखभाल', 'शिशु स्वास्थ्य', 'शिशु आहार'
      ],
      keywords: ['नवजात', 'शिशु'],
    },
    {
      routeId: 'childcare',
      intent: 'CHILD_CARE',
      phrases: [
        'बाल देखभाल', 'बच्चों का स्वास्थ्य'
      ],
      keywords: ['बाल', 'बच्चे'],
    },
    {
      routeId: 'elderly',
      intent: 'ELDERLY_CARE',
      phrases: [
        'बुजुर्गों की देखभाल', 'वृद्ध देखभाल', 'वरिष्ठ नागरिक'
      ],
      keywords: ['बुजुर्ग', 'वृद्ध'],
    },
    {
      routeId: 'sms',
      intent: 'SMS_COMMUNICATION',
      phrases: [
        'एसएमएस संचार', 'मैसेज भेजें'
      ],
      keywords: ['एसएमएस', 'मैसेज'],
    },
    {
      routeId: 'ussd',
      intent: 'USSD',
      phrases: [
        'यूएसएसडी साधारण फोन', 'कीपैड फोन मोड'
      ],
      keywords: ['यूएसएसडी', 'साधारण फोन'],
    },
    {
      routeId: 'settings',
      intent: 'SETTINGS',
      phrases: [
        'सेटिंग्स', 'ऐप सेटिंग्स'
      ],
      keywords: ['सेटिंग्स'],
    },
    {
      routeId: 'language',
      intent: 'LANGUAGE',
      phrases: [
        'भाषा सेतु', 'भाषा बदलें', 'भाषा'
      ],
      keywords: ['भाषा'],
    },
  ],

  // ─── 4. TELUGU (te-IN) ───────────────────────────────────────────────────────────
  te: [
    {
      routeId: 'dashboard',
      intent: 'DASHBOARD',
      phrases: [
        'డాష్బోర్డ్ తెరవండి', 'డాష్‌బోర్డ్ తెరవండి', 'డాష్బోర్డ్కు వెళ్ళండి', 'డాష్‌బోర్డ్‌కు వెళ్లండి',
        'డాష్‌బోర్డ్‌కు వెళ్ళండి', 'హోమ్ తెరవండి', 'డ్యాష్‌బోర్డ్', 'హోమ్ పేజీ', 'ప్రధాన పేజీ'
      ],
      keywords: ['డ్యాష్‌బోర్డ్', 'డాష్‌బోర్డ్', 'డాష్బోర్డ్', 'హోమ్'],
    },
    {
      routeId: 'health',
      intent: 'MY_HEALTH',
      phrases: [
        'నా ఆరోగ్యాన్ని చూపించు', 'నా ఆరోగ్యం', 'ఆరోగ్య వివరాలు', 'వైద్య సమాచారం'
      ],
      keywords: ['ఆరోగ్యం'],
    },
    {
      routeId: 'family',
      intent: 'FAMILY_HEALTH',
      phrases: [
        'కుటుంబ ఆరోగ్యం', 'కుటుంబ సభ్యులు', 'మా కుటుంబం'
      ],
      keywords: ['కుటుంబం'],
    },
    {
      routeId: 'medicines',
      intent: 'MEDICINES',
      phrases: [
        'మందులకు వెళ్ళండి', 'మందులను తెరవండి', 'నా మందులను చూపించండి', 'మందుల రిమైండర్లు',
        'మందులకు వెళ్ళు', 'మందులు', 'నా మందులు', 'మందుల రిమైండర్',
        'మాత్రలు', 'రోజువారీ మందులు'
      ],
      keywords: ['మందులు', 'మాత్రలు'],
    },
    {
      routeId: 'records',
      intent: 'MEDICAL_RECORDS',
      phrases: [
        'వైద్య రికార్డులు', 'ఆరోగ్య రికార్డులు', 'పాత రికార్డులు'
      ],
      keywords: ['రికార్డులు'],
    },
    {
      routeId: 'report_scanner',
      intent: 'REPORT_SCANNER',
      phrases: [
        'రిపోర్ట్ స్కానర్', 'వైద్య నివేదిక', 'నివేదిక స్కాన్ చేయండి'
      ],
      keywords: ['రిపోర్ట్', 'స్కానర్'],
    },
    {
      routeId: 'xray_viewer',
      intent: 'XRAY',
      phrases: [
        'ఎక్స్-రే', 'ఎక్స్‌రే', 'స్కాన్ చిత్రాలు'
      ],
      keywords: ['ఎక్స్-రే', 'స్కాన్'],
    },
    {
      routeId: 'health_tests',
      intent: 'HEALTH_TESTS',
      phrases: [
        'ఆరోగ్య పరీక్షలు', 'రక్త పరీక్షలు', 'పరీక్షలు'
      ],
      keywords: ['పరీక్షలు'],
    },
    {
      routeId: 'vaccinations',
      intent: 'VACCINATIONS',
      phrases: [
        'టీకాలు', 'టీకా షెడ్యూల్', 'పోలియో చుక్కలు'
      ],
      keywords: ['టీకాలు'],
    },
    {
      routeId: 'ai_assistant',
      intent: 'AI_ASSISTANT',
      phrases: [
        'మెడోరా AI', 'AI అసిస్టెంట్', 'AI తో మాట్లాడండి'
      ],
      keywords: ['AI'],
    },
    {
      routeId: 'doctor_portal',
      intent: 'DOCTOR_CONSULTATION',
      phrases: [
        'వైద్యుని సంప్రదింపు', 'డాక్టర్‌తో మాట్లాడండి', 'డాక్టర్ సంప్రదింపు'
      ],
      keywords: ['డాక్టర్', 'వైద్యుడు'],
    },
    {
      routeId: 'doctor_summary',
      intent: 'DOCTOR_SUMMARY',
      phrases: [
        'డాక్టర్ సారాంశం', 'వైద్య సారాంశం'
      ],
      keywords: ['సారాంశం'],
    },
    {
      routeId: 'appointments',
      intent: 'APPOINTMENTS',
      phrases: [
        'అపాయింట్‌మెంట్లు', 'డాక్టర్ అపాయింట్‌మెంట్'
      ],
      keywords: ['అపాయింట్‌మెంట్'],
    },
    {
      routeId: 'emergency',
      intent: 'EMERGENCY',
      phrases: [
        'అత్యవసర పరిస్థితిని తెరవండి', 'అత్యవసర సహాయానికి వెళ్ళండి', 'అత్యవసర సహాయం',
        'అత్యవసర పరిస్థితిని చూపించండి', 'అంబులెన్స్', 'అత్యవసరం'
      ],
      keywords: ['అత్యవసరం', 'అత్యవసర', 'అంబులెన్స్'],
    },
    {
      routeId: 'hospitals',
      intent: 'NEARBY_HOSPITALS',
      phrases: [
        'సమీప ఆసుపత్రులు', 'ఆసుపత్రి', 'ప్రభుత్వ ఆసుపత్రి'
      ],
      keywords: ['ఆసుపత్రి'],
    },
    {
      routeId: 'schemes',
      intent: 'GOVERNMENT_SCHEMES',
      phrases: [
        'ప్రభుత్వ పథకాలు', 'ఆయుష్మాన్ భారత్', 'ఆరోగ్య బీమా'
      ],
      keywords: ['పథకాలు', 'ఆయుష్మాన్'],
    },
    {
      routeId: 'education',
      intent: 'HEALTH_EDUCATION',
      phrases: [
        'ఆరోగ్య విద్య', 'ఆరోగ్య సూచనలు'
      ],
      keywords: ['విద్య'],
    },
    {
      routeId: 'maternity',
      intent: 'PREGNANCY',
      phrases: [
        'గర్భధారణ సంరక్షణ', 'తల్లి సంరక్షణ'
      ],
      keywords: ['గర్భధారణ'],
    },
    {
      routeId: 'newborn',
      intent: 'NEWBORN_CARE',
      phrases: [
        'నవజాత శిశు సంరక్షణ', 'శిశు సంరక్షణ'
      ],
      keywords: ['నవజాత'],
    },
    {
      routeId: 'childcare',
      intent: 'CHILD_CARE',
      phrases: [
        'పిల్లల సంరక్షణ'
      ],
      keywords: ['పిల్లల'],
    },
    {
      routeId: 'elderly',
      intent: 'ELDERLY_CARE',
      phrases: [
        'వృద్ధుల సంరక్షణ'
      ],
      keywords: ['వృద్ధుల'],
    },
    {
      routeId: 'sms',
      intent: 'SMS_COMMUNICATION',
      phrases: [
        'ఎస్ఎంఎస్ కమ్యూనికేషన్'
      ],
      keywords: ['ఎస్ఎంఎస్'],
    },
    {
      routeId: 'ussd',
      intent: 'USSD',
      phrases: [
        'యూఎస్‌ఎస్‌డీ బేసిక్ ఫోన్'
      ],
      keywords: ['యూఎస్‌ఎస్‌డీ'],
    },
    {
      routeId: 'settings',
      intent: 'SETTINGS',
      phrases: [
        'సెట్టింగ్‌లు'
      ],
      keywords: ['సెట్టింగ్‌లు'],
    },
    {
      routeId: 'language',
      intent: 'LANGUAGE',
      phrases: [
        'భాషా వారధి', 'భాషను మార్చండి'
      ],
      keywords: ['భాష'],
    },
  ],

  // ─── 5. MALAYALAM (ml-IN) ────────────────────────────────────────────────────────
  ml: [
    {
      routeId: 'dashboard',
      intent: 'DASHBOARD',
      phrases: [
        'ഡാഷ്ബോർഡ് തുറക്കുക', 'ഡാഷ്ബോർഡിലേക്ക് പോകുക',
        'ഡാഷ്‌ബോർഡ് തുറക്കുക', 'ഡാഷ്‌ബോർഡിലേക്ക് പോകുക',
        'ഹോം തുറക്കുക', 'ഡാഷ്‌ബോർഡ്', 'ഡാഷ്ബോർഡ്', 'പ്രധാന പേജ്', 'ഹോം പേജ്'
      ],
      keywords: ['ഡാഷ്‌ബോർഡ്', 'ഡാഷ്ബോർഡ്', 'ഹോം'],
    },
    {
      routeId: 'health',
      intent: 'MY_HEALTH',
      phrases: [
        'എന്റെ ആരോഗ്യം കാണിക്കുക', 'എന്റെ ആരോഗ്യം', 'ആരോഗ്യ വിവരങ്ങൾ'
      ],
      keywords: ['ആരോഗ്യം'],
    },
    {
      routeId: 'family',
      intent: 'FAMILY_HEALTH',
      phrases: [
        'കുടുംബാരോഗ്യം', 'കുടുംബാംഗങ്ങൾ'
      ],
      keywords: ['കുടുംബം'],
    },
    {
      routeId: 'medicines',
      intent: 'MEDICINES',
      phrases: [
        'മരുന്നുകളിലേക്ക് പോകുക', 'മരുന്നുകൾ തുറക്കുക', 'എന്റെ മരുന്നുകൾ കാണിക്കുക',
        'മരുന്ന് റിമൈൻഡറുകൾ', 'മരുന്നുകൾ', 'എന്റെ മരുന്നുകൾ',
        'മരുന്ന് ഓർമ്മപ്പെടുത്തൽ', 'ഗുളികകൾ', 'ദിവസേനയുള്ള മരുന്നുകൾ'
      ],
      keywords: ['മരുന്നുകൾ', 'ഗുളിക', 'റിമൈൻഡർ'],
    },
    {
      routeId: 'records',
      intent: 'MEDICAL_RECORDS',
      phrases: [
        'മെഡിക്കൽ റെക്കോർഡുകൾ', 'ആരോഗ്യ രേഖകൾ'
      ],
      keywords: ['റെക്കോർഡുകൾ'],
    },
    {
      routeId: 'report_scanner',
      intent: 'REPORT_SCANNER',
      phrases: [
        'റിപ്പോർട്ട് സ്കാനർ', 'മെഡിക്കൽ റിപ്പോർട്ട് സ്കാൻ ചെയ്യുക'
      ],
      keywords: ['റിപ്പോർട്ട്', 'സ്കാനർ'],
    },
    {
      routeId: 'xray_viewer',
      intent: 'XRAY',
      phrases: [
        'എക്സ്-റേ', 'എക്സ്റേ സ്കാനുകൾ'
      ],
      keywords: ['എക്സ്-റേ'],
    },
    {
      routeId: 'health_tests',
      intent: 'HEALTH_TESTS',
      phrases: [
        'ആരോഗ്യ പരിശോധനകൾ', 'ലാബ് ടെസ്റ്റുകൾ'
      ],
      keywords: ['പരിശോധനകൾ'],
    },
    {
      routeId: 'vaccinations',
      intent: 'VACCINATIONS',
      phrases: [
        'കുത്തിവയ്പ്പുകൾ', 'വാക്സിനേഷൻ'
      ],
      keywords: ['കുത്തിവയ്പ്പുകൾ', 'വാക്സിൻ'],
    },
    {
      routeId: 'ai_assistant',
      intent: 'AI_ASSISTANT',
      phrases: [
        'മെഡോറ AI', 'AI സഹായി'
      ],
      keywords: ['AI'],
    },
    {
      routeId: 'doctor_portal',
      intent: 'DOCTOR_CONSULTATION',
      phrases: [
        'ഡോക്ടർ കൺസൾട്ടേഷൻ', 'ഡോക്ടറോട് സംസാരിക്കുക'
      ],
      keywords: ['ഡോക്ടർ'],
    },
    {
      routeId: 'doctor_summary',
      intent: 'DOCTOR_SUMMARY',
      phrases: [
        'ഡോക്ടർ സംഗ്രഹം'
      ],
      keywords: ['സംഗ്രഹം'],
    },
    {
      routeId: 'appointments',
      intent: 'APPOINTMENTS',
      phrases: [
        'അപ്പോയിന്റ്മെന്റുകൾ', 'ഡോക്ടർ അപ്പോയിന്റ്മെന്റ്'
      ],
      keywords: ['അപ്പോയിന്റ്മെന്റ്'],
    },
    {
      routeId: 'emergency',
      intent: 'EMERGENCY',
      phrases: [
        'അടിയന്തരാവസ്ഥ തുറക്കുക', 'അടിയന്തര സഹായത്തിലേക്ക് പോകുക', 'അടിയന്തര സഹായം',
        'അടിയന്തരാവസ്ഥ കാണിക്കുക', 'ആംബുലൻസ്', 'അടിയന്തരാവസ്ഥ'
      ],
      keywords: ['അടിയന്തര', 'ആംബുലൻസ്'],
    },
    {
      routeId: 'hospitals',
      intent: 'NEARBY_HOSPITALS',
      phrases: [
        'സമീപത്തെ ആശുപത്രികൾ', 'ആശുപത്രി'
      ],
      keywords: ['ആശുപത്രി'],
    },
    {
      routeId: 'schemes',
      intent: 'GOVERNMENT_SCHEMES',
      phrases: [
        'സർക്കാർ പദ്ധതികൾ', 'ആയുഷ്മാൻ ഭാരത്'
      ],
      keywords: ['പദ്ധതികൾ'],
    },
    {
      routeId: 'education',
      intent: 'HEALTH_EDUCATION',
      phrases: [
        'ആരോഗ്യ വിദ്യാഭ്യാസം'
      ],
      keywords: ['വിദ്യാഭ്യാസം'],
    },
    {
      routeId: 'maternity',
      intent: 'PREGNANCY',
      phrases: [
        'ഗർഭകാല പരിചരണം'
      ],
      keywords: ['ഗർഭകാല'],
    },
    {
      routeId: 'newborn',
      intent: 'NEWBORN_CARE',
      phrases: [
        'നവജാതശിശു പരിചരണം'
      ],
      keywords: ['നവജാതശിശു'],
    },
    {
      routeId: 'childcare',
      intent: 'CHILD_CARE',
      phrases: [
        'കുട്ടികളുടെ പരിചരണം'
      ],
      keywords: ['കുട്ടികൾ'],
    },
    {
      routeId: 'elderly',
      intent: 'ELDERLY_CARE',
      phrases: [
        'മുതിർന്നവരുടെ പരിചരണം'
      ],
      keywords: ['മുതിർന്നവർ'],
    },
    {
      routeId: 'sms',
      intent: 'SMS_COMMUNICATION',
      phrases: [
        'എസ്എംഎസ് ആശയവിനിമയം'
      ],
      keywords: ['എസ്എംഎസ്'],
    },
    {
      routeId: 'ussd',
      intent: 'USSD',
      phrases: [
        'യുഎസ്എസ്ഡി ബേസിക് ഫോൺ'
      ],
      keywords: ['യുഎസ്എസ്ഡി'],
    },
    {
      routeId: 'settings',
      intent: 'SETTINGS',
      phrases: [
        'ക്രമീകരണങ്ങൾ'
      ],
      keywords: ['ക്രമീകരണങ്ങൾ'],
    },
    {
      routeId: 'language',
      intent: 'LANGUAGE',
      phrases: [
        'ഭാഷാ പാലം', 'ഭാഷ മാറ്റുക'
      ],
      keywords: ['ഭാഷ'],
    },
  ],

  // ─── 6. KANNADA (kn-IN) ──────────────────────────────────────────────────────────
  kn: [
    {
      routeId: 'dashboard',
      intent: 'DASHBOARD',
      phrases: [
        'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ', 'ಹೋಮ್ ತೆರೆಯಿರಿ', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'ಮುಖಪುಟ', 'ಮುಖ್ಯ ಪುಟ'
      ],
      keywords: ['ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'ಮುಖಪುಟ', 'ಹೋಮ್'],
    },
    {
      routeId: 'health',
      intent: 'MY_HEALTH',
      phrases: [
        'ನನ್ನ ಆರೋಗ್ಯವನ್ನು ತೋರಿಸಿ', 'ನನ್ನ ಆರೋಗ್ಯ', 'ಆರೋಗ್ಯ ವಿವರ'
      ],
      keywords: ['ಆರೋಗ್ಯ'],
    },
    {
      routeId: 'family',
      intent: 'FAMILY_HEALTH',
      phrases: [
        'ಕುಟುಂಬ ಆರೋಗ್ಯ', 'ಕುಟುಂಬದ ಸದಸ್ಯರು'
      ],
      keywords: ['ಕುಟುಂಬ'],
    },
    {
      routeId: 'medicines',
      intent: 'MEDICINES',
      phrases: [
        'ಔಷಧಿಗಳಿಗೆ ಹೋಗಿ', 'ಔಷಧಿಗಳನ್ನು ತೆರೆಯಿರಿ', 'ನನ್ನ ಔಷಧಿಗಳನ್ನು ತೋರಿಸಿ', 'ಔಷಧಿ ಜ್ಞಾಪನೆಗಳು',
        'ಔಷಧಿಗಳು', 'ನನ್ನ ಔಷಧಿಗಳು', 'ಔಷಧಿ ಜ್ಞಾಪನೆ',
        'ಮಾತ್ರೆಗಳು', 'ದೈನಂದಿನ ಔಷಧಿಗಳು'
      ],
      keywords: ['ಔಷಧಿಗಳು', 'ಮಾತ್ರೆಗಳು'],
    },
    {
      routeId: 'records',
      intent: 'MEDICAL_RECORDS',
      phrases: [
        'ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು', 'ಆರೋಗ್ಯ ದಾಖಲೆಗಳು'
      ],
      keywords: ['ದಾಖಲೆಗಳು'],
    },
    {
      routeId: 'report_scanner',
      intent: 'REPORT_SCANNER',
      phrases: [
        'ವರದಿ ಸ್ಕ್ಯಾನರ್', 'ವೈದ್ಯಕೀಯ ವರದಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ'
      ],
      keywords: ['ವರದಿ', 'ಸ್ಕ್ಯಾನರ್'],
    },
    {
      routeId: 'xray_viewer',
      intent: 'XRAY',
      phrases: [
        'ಎಕ್ಸ್-ರೇ', 'ಎಕ್ಸ್‌ರೇ ಸ್ಕ್ಯಾನ್‌ಗಳು'
      ],
      keywords: ['ಎಕ್ಸ್-ರೇ'],
    },
    {
      routeId: 'health_tests',
      intent: 'HEALTH_TESTS',
      phrases: [
        'ಆರೋಗ್ಯ ಪರೀಕ್ಷೆಗಳು', 'ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆಗಳು'
      ],
      keywords: ['ಪರೀಕ್ಷೆಗಳು'],
    },
    {
      routeId: 'vaccinations',
      intent: 'VACCINATIONS',
      phrases: [
        'ಲಸಿಕೆಗಳು', 'ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ', 'ಪೋಲಿಯೊ ಹನಿಗಳು'
      ],
      keywords: ['ಲಸಿಕೆಗಳು'],
    },
    {
      routeId: 'ai_assistant',
      intent: 'AI_ASSISTANT',
      phrases: [
        'ಮೆಡೋರಾ AI', 'AI ಸಹಾಯಕ'
      ],
      keywords: ['AI'],
    },
    {
      routeId: 'doctor_portal',
      intent: 'DOCTOR_CONSULTATION',
      phrases: [
        'ವೈದ್ಯರ ಸಮಾಲೋಚನೆ', 'ವೈದ್ಯರೊಂದಿಗೆ ಮಾತನಾಡಿ'
      ],
      keywords: ['ವೈದ್ಯರು'],
    },
    {
      routeId: 'doctor_summary',
      intent: 'DOCTOR_SUMMARY',
      phrases: [
        'ವೈದ್ಯರ ಸಾರಾಂಶ'
      ],
      keywords: ['ಸಾರಾಂಶ'],
    },
    {
      routeId: 'appointments',
      intent: 'APPOINTMENTS',
      phrases: [
        'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು', 'ವೈದ್ಯರ ಭೇಟಿ'
      ],
      keywords: ['ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್'],
    },
    {
      routeId: 'emergency',
      intent: 'EMERGENCY',
      phrases: [
        'ತುರ್ತು ಪರಿಸ್ಥಿತಿ ತೆರೆಯಿರಿ', 'ತುರ್ತು ಸಹಾಯಕ್ಕೆ ಹೋಗಿ', 'ತುರ್ತು ಸಹಾಯ',
        'ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ತೋರಿಸಿ', 'ಆಂಬ್ಯುಲೆನ್ಸ್', 'ತುರ್ತು ಚಿಕಿತ್ಸೆ'
      ],
      keywords: ['ತುರ್ತು', 'ಆಂಬ್ಯುಲೆನ್ಸ್'],
    },
    {
      routeId: 'hospitals',
      intent: 'NEARBY_HOSPITALS',
      phrases: [
        'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳು', 'ಆಸ್ಪತ್ರೆ'
      ],
      keywords: ['ಆಸ್ಪತ್ರೆ'],
    },
    {
      routeId: 'schemes',
      intent: 'GOVERNMENT_SCHEMES',
      phrases: [
        'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್'
      ],
      keywords: ['ಯೋಜನೆಗಳು'],
    },
    {
      routeId: 'education',
      intent: 'HEALTH_EDUCATION',
      phrases: [
        'ಆರೋಗ್ಯ ಶಿಕ್ಷಣ'
      ],
      keywords: ['ಶಿಕ್ಷಣ'],
    },
    {
      routeId: 'maternity',
      intent: 'PREGNANCY',
      phrases: [
        'ತಾಯ್ತನದ ಆರೈಕೆ'
      ],
      keywords: ['ತಾಯ್ತನ'],
    },
    {
      routeId: 'newborn',
      intent: 'NEWBORN_CARE',
      phrases: [
        'ನವಜಾತ ಶಿಶು ಆರೈಕೆ'
      ],
      keywords: ['ನವಜಾತ'],
    },
    {
      routeId: 'childcare',
      intent: 'CHILD_CARE',
      phrases: [
        'ಮಕ್ಕಳ ಆರೈಕೆ'
      ],
      keywords: ['ಮಕ್ಕಳ'],
    },
    {
      routeId: 'elderly',
      intent: 'ELDERLY_CARE',
      phrases: [
        'ಹಿರಿಯರ ಆರೈಕೆ'
      ],
      keywords: ['ಹಿರಿಯರು'],
    },
    {
      routeId: 'sms',
      intent: 'SMS_COMMUNICATION',
      phrases: [
        'ಎಸ್ಎಂಎಸ್ ಸಂವಹನ'
      ],
      keywords: ['ಎಸ್ಎಂಎಸ್'],
    },
    {
      routeId: 'ussd',
      intent: 'USSD',
      phrases: [
        'ಯುಎಸ್‌ಎಸ್‌ಡಿ ಬೇಸಿಕ್ ಫೋನ್'
      ],
      keywords: ['ಯುಎಸ್‌ಎಸ್‌ಡಿ'],
    },
    {
      routeId: 'settings',
      intent: 'SETTINGS',
      phrases: [
        'ಸೆಟ್ಟಿಂಗ್‌ಗಳು'
      ],
      keywords: ['ಸೆಟ್ಟಿಂಗ್‌ಗಳು'],
    },
    {
      routeId: 'language',
      intent: 'LANGUAGE',
      phrases: [
        'ಭಾಷಾ ಸೇತು', 'ಭಾಷೆ ಬದಲಿಸಿ'
      ],
      keywords: ['ಭಾಷೆ'],
    },
  ],
};

/**
 * Normalized flat array of VoiceCommand items conforming to the VoiceCommand interface.
 */
export const VOICE_COMMANDS: VoiceCommand[] = Object.entries(VOICE_COMMAND_DICTIONARY).flatMap(
  ([langCode, routePhrasesList]) => {
    const language: VoiceNavigationLanguage =
      langCode === 'ta' ? 'ta-IN'
      : langCode === 'hi' ? 'hi-IN'
      : langCode === 'te' ? 'te-IN'
      : langCode === 'ml' ? 'ml-IN'
      : langCode === 'kn' ? 'kn-IN'
      : 'en-IN';

    return routePhrasesList.map((rp) => ({
      intent: rp.intent,
      language,
      phrases: rp.phrases,
      keywords: rp.keywords,
    }));
  }
);

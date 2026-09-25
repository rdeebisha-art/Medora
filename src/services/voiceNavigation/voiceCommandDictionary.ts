export interface RoutePhrases {
  routeId: string;
  phrases: string[];
}

export type SupportedVoiceNavLang = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';

export const VOICE_COMMAND_DICTIONARY: Record<SupportedVoiceNavLang, RoutePhrases[]> = {
  // ─── 1. ENGLISH (en-IN) ──────────────────────────────────────────────────────────
  en: [
    {
      routeId: 'dashboard',
      phrases: [
        'open dashboard', 'go to dashboard', 'show dashboard', 'dashboard', 'home',
        'main page', 'home page', 'open home', 'go to home', 'start page', 'take me home',
        'medora home', 'show home', 'navigate to dashboard', 'back to dashboard'
      ],
    },
    {
      routeId: 'health',
      phrases: [
        'open my health', 'go to my health', 'show my health', 'my health', 'health overview',
        'health summary', 'open health', 'go to health', 'my vitals', 'health status',
        'show health', 'patient health', 'health blueprint', 'my health blueprint'
      ],
    },
    {
      routeId: 'family',
      phrases: [
        'open family', 'go to family', 'show family', 'family', 'family health',
        'family members', 'family page', 'open family members', 'show family members',
        'go to family health', 'my family', 'household health', 'family profile'
      ],
    },
    {
      routeId: 'medicines',
      phrases: [
        'open medicines', 'go to medicines', 'show medicines', 'open my medicines',
        'medicines', 'my medicines', 'medicine reminder', 'medicine reminders',
        'pills', 'daily medicines', 'show pills', 'take medicines', 'prescriptions',
        'medicine schedule', 'open reminder', 'show medicine schedule', 'medication schedule'
      ],
    },
    {
      routeId: 'records',
      phrases: [
        'open records', 'go to records', 'show records', 'medical records',
        'health records', 'past records', 'patient records', 'open medical records',
        'go to medical records', 'clinical history', 'my records', 'past prescriptions'
      ],
    },
    {
      routeId: 'report_scanner',
      phrases: [
        'open reports', 'go to reports', 'show reports', 'medical reports',
        'report scanner', 'scan report', 'upload report', 'scan medical report',
        'lab reports', 'blood test report', 'open report scanner', 'go to report scanner',
        'health reports', 'document scanner', 'scan document'
      ],
    },
    {
      routeId: 'xray_viewer',
      phrases: [
        'open xray', 'go to xray', 'open x-ray', 'go to x-ray', 'show xray',
        'x-ray viewer', 'xray viewer', 'medical scans', 'chest scan', 'xray images',
        'medical images', 'open scans', 'scan viewer', 'camera scan', 'xray report'
      ],
    },
    {
      routeId: 'health_tests',
      phrases: [
        'open health tests', 'go to health tests', 'show health tests', 'health tests',
        'lab tests', 'blood pressure test', 'blood sugar test', 'tests', 'my tests',
        'vitals check', 'diagnostic tests', 'pending tests', 'view tests'
      ],
    },
    {
      routeId: 'vaccinations',
      phrases: [
        'open vaccinations', 'go to vaccinations', 'show vaccinations', 'vaccination',
        'vaccines', 'vaccine schedule', 'immunization', 'polio drops', 'due vaccines',
        'vaccine tracker', 'child vaccination', 'my vaccines', 'open immunization'
      ],
    },
    {
      routeId: 'ai_assistant',
      phrases: [
        'open ai', 'go to ai', 'show ai', 'ai assistant', 'medora ai',
        'ai health assistant', 'talk to ai', 'chat with ai', 'ask medora',
        'speak to ai', 'open chatbot', 'health assistant', 'symptom ai'
      ],
    },
    {
      routeId: 'doctor_portal',
      phrases: [
        'open doctor', 'go to doctor', 'show doctor', 'doctor consultation',
        'doctor portal', 'consult doctor', 'talk to doctor', 'call doctor',
        'find doctor', 'connect to doctor', 'clinician portal', 'rural doctor'
      ],
    },
    {
      routeId: 'doctor_summary',
      phrases: [
        'open doctor summary', 'go to doctor summary', 'show doctor summary',
        'doctor summary', 'clinical summary', 'consultation summary', 'doctor handoff',
        'handoff summary', 'medical summary', 'patient summary'
      ],
    },
    {
      routeId: 'appointments',
      phrases: [
        'open appointments', 'go to appointments', 'show appointments',
        'show my appointments', 'appointments', 'book appointment', 'doctor appointments',
        'schedule visit', 'clinic visit', 'upcoming appointments', 'next consultation'
      ],
    },
    {
      routeId: 'call_history',
      phrases: [
        'open call history', 'go to call history', 'show call history', 'call history',
        'call logs', 'recent calls', 'voice calls', 'call records', 'doctor calls',
        'my calls', 'webrtc calls', 'phone history'
      ],
    },
    {
      routeId: 'emergency',
      phrases: [
        'open emergency', 'go to emergency', 'show emergency', 'emergency',
        'emergency help', 'urgent care', 'ambulance help', 'sos', 'emergency mode',
        'immediate help', 'critical help', 'emergency page', 'need emergency'
      ],
    },
    {
      routeId: 'hospitals',
      phrases: [
        'open hospitals', 'go to hospitals', 'show hospitals', 'nearby hospitals',
        'hospitals', 'find hospital', 'nearest clinic', 'health center', 'phc',
        'chc', 'government hospital', 'district hospital', 'clinic directory'
      ],
    },
    {
      routeId: 'transport',
      phrases: [
        'open transport', 'go to transport', 'show transport', 'ambulance transport',
        'ambulance', 'emergency transport', 'call ambulance', 'find vehicle',
        'hospital transit', 'auto ambulance', 'transit guide'
      ],
    },
    {
      routeId: 'schemes',
      phrases: [
        'open schemes', 'go to schemes', 'show schemes', 'government schemes',
        'schemes', 'ayushman bharat', 'health insurance', 'govt schemes',
        'free treatment', 'scheme eligibility', 'pmjay'
      ],
    },
    {
      routeId: 'education',
      phrases: [
        'open education', 'go to education', 'show education', 'health education',
        'education', 'health tips', 'health guides', 'first aid guide',
        'wellness tips', 'nutrition guide', 'prevention tips'
      ],
    },
    {
      routeId: 'maternity',
      phrases: [
        'open maternity', 'go to maternity', 'maternity care', 'pregnancy',
        'pregnancy care', 'pregnant mother', 'maternal health', 'antenatal care',
        'expecting mother', 'show maternity'
      ],
    },
    {
      routeId: 'newborn',
      phrases: [
        'open newborn', 'go to newborn', 'newborn care', 'baby care',
        'infant care', 'new born', 'postnatal care', 'baby health', 'show newborn'
      ],
    },
    {
      routeId: 'elderly',
      phrases: [
        'open elderly', 'go to elderly', 'elderly care', 'senior citizen',
        'elder care', 'grandparents health', 'geriatric care', 'show elderly'
      ],
    },
    {
      routeId: 'sms',
      phrases: [
        'open sms', 'go to sms', 'show sms', 'sms communication', 'send sms',
        'messages', 'text message', 'offline sms', 'sms outbox'
      ],
    },
    {
      routeId: 'ussd',
      phrases: [
        'open ussd', 'go to ussd', 'show ussd', 'ussd', 'basic phone',
        'button phone', 'feature phone', 'dial 123', 'star 123 hash'
      ],
    },
    {
      routeId: 'village',
      phrases: [
        'open village', 'go to village', 'show village', 'village dashboard',
        'community health', 'village data', 'asha dashboard', 'panchayat health'
      ],
    },
    {
      routeId: 'settings',
      phrases: [
        'open settings', 'go to settings', 'show settings', 'settings',
        'preferences', 'app settings', 'configuration', 'change settings'
      ],
    },
    {
      routeId: 'profile',
      phrases: [
        'open profile', 'go to profile', 'show profile', 'profile', 'my profile',
        'user account', 'account settings', 'personal details'
      ],
    },
    {
      routeId: 'help',
      phrases: [
        'open help', 'go to help', 'show help', 'help', 'support', 'user guide',
        'how to use', 'help and support', 'need help'
      ],
    },
    {
      routeId: 'faq',
      phrases: [
        'open faq', 'go to faq', 'show faq', 'faq', 'frequently asked questions',
        'questions and answers', 'common questions'
      ],
    },
  ],

  // ─── 2. TAMIL (ta-IN) ──────────────────────────────────────────────────────────
  ta: [
    {
      routeId: 'dashboard',
      phrases: [
        'முகப்பு', 'முகப்புக்கு செல்லவும்', 'முகப்பு பக்கம்', 'டாஷ்போர்டு',
        'டாஷ்போர்டைத் திறக்கவும்', 'டாஷ்போர்டுக்கு செல்லுங்கள்', 'முகப்புப் பக்கம் திறக்க',
        'வீட்டுப் பக்கம்', 'ஆரம்ப பக்கம்', 'மெடோரா முகப்பு'
      ],
    },
    {
      routeId: 'medicines',
      phrases: [
        'மருந்துகளுக்கு செல்லுங்கள்', 'மருந்துகளைத் திறக்கவும்', 'மருந்துகள்',
        'மருந்து பட்டியல்', 'மருந்து நினைவூட்டல்', 'மருந்து அட்டவணை',
        'மருந்து மாத்திரை', 'மாத்திரைகள்', 'என் மருந்துகள்', 'மருந்துகளைக் காட்டு',
        'மருந்துகள் பக்கம்', 'மருந்து நேரம்'
      ],
    },
    {
      routeId: 'emergency',
      phrases: [
        'அவசரம்', 'அவசர உதவி', 'அவசர சிகிச்சைக்கு செல்லவும்', 'அவசர பிரிவு',
        'அவசர பக்கம்', 'ஆம்புலன்ஸ் உதவி', 'அவசர அழைப்பு', 'உடனடி உதவி',
        'அவசர சிகிச்சை', 'அவசர உதவிக்கு செல்லுங்கள்'
      ],
    },
    {
      routeId: 'family',
      phrases: [
        'குடும்பம்', 'குடும்ப நலம்', 'குடும்ப உறுப்பினர்கள்', 'குடும்பப் பக்கம்',
        'குடும்ப பக்கத்திற்கு செல்லுங்கள்', 'குடும்ப நலம் திறக்க', 'குடும்ப உறுப்பினர்கள் பார்க்க'
      ],
    },
    {
      routeId: 'health',
      phrases: [
        'என் உடல்நலம்', 'என் ஆரோக்கியம்', 'உடல்நல பக்கம்', 'ஆரோக்கிய சுருக்கம்',
        'உடல்நலம் பார்க்க', 'என் சுகாதார விவரம்'
      ],
    },
    {
      routeId: 'doctor_portal',
      phrases: [
        'மருத்துவர்', 'மருத்துவரை அணுகவும்', 'மருத்துவர் போர்டல்', 'மருத்துவ ஆலோசனை',
        'டாக்டரை பார்க்க', 'டாக்டர் போர்டல்', 'மருத்துவரிடம் பேச'
      ],
    },
    {
      routeId: 'doctor_summary',
      phrases: [
        'மருத்துவ சுருக்கம்', 'டாக்டர் சம்மரி', 'மருத்துவ அறிக்கை சுருக்கம்',
        'டாக்டர் சுருக்கம் திறக்க'
      ],
    },
    {
      routeId: 'appointments',
      phrases: [
        'சந்திப்புகள்', 'மருத்துவ சந்திப்புகள்', 'அப்பாயிண்ட்மெண்ட்', 'அப்பாயிண்ட்மெண்ட் பக்கம்',
        'முன்பதிவு', 'சந்திப்பு முன்பதிவு', 'சந்திப்புகளைக் காட்டு'
      ],
    },
    {
      routeId: 'records',
      phrases: [
        'மருத்துவ பதிவுகள்', 'சுகாதார பதிவுகள்', 'பதிவுகள்', 'பழைய பதிவுகள்',
        'மருத்துவ ஆவணங்கள்', 'பதிவுகள் திறக்க'
      ],
    },
    {
      routeId: 'report_scanner',
      phrases: [
        'மருத்துவ அறிக்கைகள்', 'அறிக்கையை ஸ்கேன் செய்', 'ரிப்போர்ட் ஸ்கேனர்',
        'அறிக்கைகள்', 'பரிசோதனை அறிக்கை', 'ஸ்கேன் பக்கம்', 'லேப் ரிப்போர்ட்'
      ],
    },
    {
      routeId: 'xray_viewer',
      phrases: [
        'எக்ஸ்-ரே', 'எக்ஸ்ரே பார்க்க', 'ஸ்கேன் படங்கள்', 'எக்ஸ்ரே படம்',
        'எக்ஸ்-ரே திறக்க'
      ],
    },
    {
      routeId: 'health_tests',
      phrases: [
        'ஆரோக்கிய பரிசோதனை', 'ரத்தப் பரிசோதனை', 'பரிசோதனைகள்', 'பரிசோதனை பார்க்க',
        'சுகாதார சோதனைகள்', 'ரத்த அழுத்தம் சோதனை'
      ],
    },
    {
      routeId: 'vaccinations',
      phrases: [
        'தடுப்பூசி', 'தடுப்பூசிகள்', 'தடுப்பூசி அட்டவணை', 'தடுப்பூசி விவரம்',
        'போலியோ சொட்டு மருந்து'
      ],
    },
    {
      routeId: 'ai_assistant',
      phrases: [
        'செயற்கை நுண்ணறிவு', 'மெடோரா ஏஐ', 'ஏஐ உதவியாளர்', 'ஏஐ பேசுங்கள்',
        'மெடோராவுடன் பேசுங்கள்', 'ஏஐ உதவி'
      ],
    },
    {
      routeId: 'hospitals',
      phrases: [
        'மருத்துவமனைகள்', 'அருகிலுள்ள மருத்துவமனை', 'ஆஸ்பத்திரி',
        'அரசு மருத்துவமனை', 'ஆரம்ப சுகாதார நிலையம்'
      ],
    },
    {
      routeId: 'transport',
      phrases: [
        'ஆம்புலன்ஸ்', 'போக்குவரத்து', 'ஆம்புலன்ஸ் அழைக்க', 'அவசர வாகனம்'
      ],
    },
    {
      routeId: 'schemes',
      phrases: [
        'அரசு திட்டங்கள்', 'சுகாதார திட்டங்கள்', 'திட்டங்கள்', 'ஆயுஷ்மான் பாரத்',
        'அரசு மருத்துவ காப்பீடு'
      ],
    },
    {
      routeId: 'education',
      phrases: [
        'சுகாதார கல்வி', 'ஆரோக்கிய வழிகாட்டி', 'சுகாதார குறிப்புகள்',
        'முதல் உதவி வழிகாட்டி'
      ],
    },
    {
      routeId: 'call_history',
      phrases: [
        'அழைப்பு வரலாறு', 'கால் ஹிஸ்டரி', 'அழைப்புகள்', 'அழைப்பு விவரம்'
      ],
    },
    {
      routeId: 'settings',
      phrases: [
        'அமைப்புகள்', 'செட்டிங்ஸ்', 'அமைப்புகள் பக்கம்'
      ],
    },
    {
      routeId: 'help',
      phrases: [
        'உதவி', 'வழிகாட்டல்', 'உதவி பக்கம்'
      ],
    },
    {
      routeId: 'faq',
      phrases: [
        'அடிக்கடி கேட்கப்படும் கேள்விகள்', 'கேள்வி பதில்', 'கேள்விகள்'
      ],
    },
  ],

  // ─── 3. HINDI (hi-IN) ──────────────────────────────────────────────────────────
  hi: [
    {
      routeId: 'dashboard',
      phrases: [
        'डैशबोर्ड पर जाएं', 'डैशबोर्ड खोलो', 'डैशबोर्ड', 'मुख्य पृष्ठ', 'होम',
        'होम पेज खोलो', 'शुरुआती पृष्ठ', 'मेडोरा होम'
      ],
    },
    {
      routeId: 'medicines',
      phrases: [
        'दवाइयों पर जाएं', 'दवाएं खोलो', 'मेरी दवाइयां दिखाओ', 'दवाइयां',
        'दवा अनुसूची', 'दवा रिमाइंडर', 'दवाइयों की सूची', 'दवाई', 'गोलियां',
        'दवा का समय'
      ],
    },
    {
      routeId: 'emergency',
      phrases: [
        'आपातकाल', 'आपातकालीन सहायता', 'इमरजेंसी पर जाएं', 'इमरजेंसी',
        'इमरजेंसी सहायता', 'तुरंत मदद', 'एम्बुलेंस बुलाओ', 'इमरजेंसी पेज'
      ],
    },
    {
      routeId: 'family',
      phrases: [
        'परिवार', 'परिवार का स्वास्थ्य', 'परिवार पर जाएं', 'परिवार के सदस्य',
        'परिवार खोलो', 'परिवार स्वास्थ्य'
      ],
    },
    {
      routeId: 'health',
      phrases: [
        'मेरा स्वास्थ्य', 'मेरी सेहत', 'स्वास्थ्य पृष्ठ', 'स्वास्थ्य विवरण',
        'स्वास्थ्य सारांश', 'स्वास्थ्य'
      ],
    },
    {
      routeId: 'doctor_portal',
      phrases: [
        'डॉक्टर', 'डॉक्टर से परामर्श', 'डॉक्टर पोर्टल', 'चिकित्सक',
        'डॉक्टर से बात करो', 'डॉक्टर खोलो'
      ],
    },
    {
      routeId: 'doctor_summary',
      phrases: [
        'डॉक्टर सारांश', 'क्लिनिकल सारांश', 'परामर्श सारांश', 'डॉक्टर समरी'
      ],
    },
    {
      routeId: 'appointments',
      phrases: [
        'अपॉइंटमेंट', 'मेरी मुलाकातें', 'अपॉइंटमेंट दिखाओ', 'डॉक्टर अपॉइंटमेंट',
        'अपॉइंटमेंट बुक करो', 'अपॉइंटमेंट पेज'
      ],
    },
    {
      routeId: 'records',
      phrases: [
        'मेडिकल रिकॉर्ड', 'स्वास्थ्य रिकॉर्ड', 'पुराने पर्चे', 'रिकॉर्ड खोलो',
        'मेडिकल इतिहास'
      ],
    },
    {
      routeId: 'report_scanner',
      phrases: [
        'रिपोर्ट', 'मेडिकल रिपोर्ट', 'रिपोर्ट स्कैनर', 'रिपोर्ट खोलो',
        'रिपोर्ट स्कैन करो', 'जांच रिपोर्ट'
      ],
    },
    {
      routeId: 'xray_viewer',
      phrases: [
        'एक्स-रे', 'एक्सरे', 'स्कैन चित्र', 'एक्स-रे दिखाओ', 'छाती का एक्स-रे'
      ],
    },
    {
      routeId: 'health_tests',
      phrases: [
        'जांच', 'लैब टेस्ट', 'स्वास्थ्य परीक्षण', 'रक्त परीक्षण', 'जांच खोलो'
      ],
    },
    {
      routeId: 'vaccinations',
      phrases: [
        'टीकाकरण', 'टीके', 'टीकाकरण सूची', 'टीकाकरण अनुसूची', 'पोलियो'
      ],
    },
    {
      routeId: 'ai_assistant',
      phrases: [
        'एआई सहायक', 'मेडोरा एआई', 'एआई से बात करो', 'एआई स्वास्थ्य सहायक',
        'चैटबॉट'
      ],
    },
    {
      routeId: 'hospitals',
      phrases: [
        'अस्पताल', 'नजदीकी अस्पताल', 'हॉस्पिटल दिखाओ', 'प्राथमिक स्वास्थ्य केंद्र',
        'अस्पताल खोलो'
      ],
    },
    {
      routeId: 'transport',
      phrases: [
        'एम्बुलेंस', 'परिवहन', 'एम्बुलेंस बुलाओ', 'अस्पताल वाहन'
      ],
    },
    {
      routeId: 'schemes',
      phrases: [
        'सरकारी योजनाएं', 'योजनाएं', 'स्वास्थ्य योजनाएं', 'आयुष्मान भारत',
        'सरकारी योजना'
      ],
    },
    {
      routeId: 'education',
      phrases: [
        'स्वास्थ्य शिक्षा', 'स्वास्थ्य सुझाव', 'जानकारी', 'प्राथमिक उपचार'
      ],
    },
    {
      routeId: 'call_history',
      phrases: [
        'कॉल विवरण', 'कॉल हिस्ट्री', 'कॉल इतिहास', 'कॉल रिकॉर्ड'
      ],
    },
    {
      routeId: 'settings',
      phrases: [
        'सेटिंग्स', 'सेटिंग', 'सेटिंग खोलो'
      ],
    },
    {
      routeId: 'help',
      phrases: [
        'मदद', 'सहायता', 'मार्गदर्शन'
      ],
    },
    {
      routeId: 'faq',
      phrases: [
        'अक्सर पूछे जाने वाले सवाल', 'सवाल जवाब'
      ],
    },
  ],

  // ─── 4. TELUGU (te-IN) ──────────────────────────────────────────────────────────
  te: [
    {
      routeId: 'dashboard',
      phrases: [
        'డ్యాష్‌బోర్డ్‌కు వెళ్లండి', 'డ్యాష్‌బోర్డ్', 'హోమ్ పేజీ', 'ప్రధాన పేజీ',
        'హోమ్', 'డ్యాష్‌బోర్డ్ తెరువు'
      ],
    },
    {
      routeId: 'medicines',
      phrases: [
        'మందులకు వెళ్ళండి', 'మందులు చూపించు', 'నా మందులు', 'మందులు తెరువు',
        'మందుల సమయాలు', 'మందులు', 'మందుల రిమైండర్', 'మందుల పట్టిక'
      ],
    },
    {
      routeId: 'emergency',
      phrases: [
        'అత్యవసరం', 'అత్యవసర విభాగం', 'ఎమర్జెన్సీ', 'అత్యవసర సహాయం',
        'అత్యవసర పేజీ', 'ఆంబులెన్స్ పిలువు'
      ],
    },
    {
      routeId: 'family',
      phrases: [
        'కుటుంబం', 'కుటుంబ ఆరోగ్యం', 'కుటుంబ సభ్యులు', 'కుటుంబ పేజీ'
      ],
    },
    {
      routeId: 'health',
      phrases: [
        'నా ఆరోగ్యం', 'ఆరోగ్య సారాంశం', 'ఆరోగ్య పేజీ'
      ],
    },
    {
      routeId: 'doctor_portal',
      phrases: [
        'వైద్యుడు', 'డాక్టర్ సంప్రదింపు', 'డాక్టర్ పోర్టల్', 'డాక్టర్‌తో మాట్లాడు',
        'డాక్టర్'
      ],
    },
    {
      routeId: 'appointments',
      phrases: [
        'అపాయింట్‌మెంట్లు', 'నా అపాయింట్‌మెంట్లు', 'అపాయింట్‌మెంట్', 'అపాయింట్‌మెంట్ పేజీ'
      ],
    },
    {
      routeId: 'records',
      phrases: [
        'వైద్య రికార్డులు', 'ఆరోగ్య రికార్డులు', 'పాత రికార్డులు'
      ],
    },
    {
      routeId: 'report_scanner',
      phrases: [
        'వైద్య నివేదికలు', 'రిపోర్ట్ స్కానర్', 'రిపోర్టులు', 'నివేదికను స్కాన్ చేయి'
      ],
    },
    {
      routeId: 'xray_viewer',
      phrases: [
        'ఎక్స్-రే', 'ఎక్స్రే', 'స్కాన్ చిత్రాలు', 'ఎక్స్-రే చూపు'
      ],
    },
    {
      routeId: 'health_tests',
      phrases: [
        'ఆరోగ్య పరీక్షలు', 'ల్యాబ్ టెస్ట్‌లు', 'రక్త పరీక్షలు'
      ],
    },
    {
      routeId: 'vaccinations',
      phrases: [
        'టీకాలు', 'టీకా వివరాలు', 'వ్యాక్సినేషన్', 'పోలియో చుక్కలు'
      ],
    },
    {
      routeId: 'ai_assistant',
      phrases: [
        'ఏఐ అసిస్టెంట్', 'మెడోరా ఏఐ', 'ఏఐ సహాయకుడు', 'ఏఐతో మాట్లాడు'
      ],
    },
    {
      routeId: 'hospitals',
      phrases: [
        'ఆసుపత్రులు', 'సమీప ఆసుపత్రులు', 'ఆసుపత్రి'
      ],
    },
    {
      routeId: 'schemes',
      phrases: [
        'ప్రభుత్వ పథకాలు', 'పథకాలు', 'ఆరోగ్య పథకాలు'
      ],
    },
    {
      routeId: 'call_history',
      phrases: [
        'కాల్ చరిత్ర', 'కాల్స్', 'ఫోన్ కాల్ వివరాలు'
      ],
    },
    {
      routeId: 'settings',
      phrases: [
        'సెట్టింగ్‌లు', 'సెట్టింగ్స్'
      ],
    },
    {
      routeId: 'help',
      phrases: [
        'సహాయం', 'మార్గదర్శకత్వం'
      ],
    },
  ],

  // ─── 5. MALAYALAM (ml-IN) ──────────────────────────────────────────────────────────
  ml: [
    {
      routeId: 'dashboard',
      phrases: [
        'ഡാഷ്‌ബോർഡിലേക്ക് പോകുക', 'ഡാഷ്‌ബോർഡ്', 'ഹോം', 'പ്രധാന പേജ്',
        'ഹോം പേജ്'
      ],
    },
    {
      routeId: 'medicines',
      phrases: [
        'മരുന്നുകളിലേക്ക് പോകുക', 'മരുന്നുകൾ കാണിക്കുക', 'എന്റെ മരുന്നുകൾ',
        'മരുന്നുകൾ', 'മരുന്ന് ഓർമ്മപ്പെടുത്തൽ', 'മരുന്നുകളുടെ സമയം'
      ],
    },
    {
      routeId: 'emergency',
      phrases: [
        'അടിയന്തരാവസ്ഥ', 'എമർജൻസി', 'അടിയന്തര സഹായം', 'അടിയന്തര പേജ്',
        'ആംബുലൻസ്'
      ],
    },
    {
      routeId: 'family',
      phrases: [
        'കുടുംബം', 'കുടുംബാരോഗ്യം', 'കുടുംബാംഗങ്ങൾ'
      ],
    },
    {
      routeId: 'health',
      phrases: [
        'എന്റെ ആരോഗ്യം', 'ആരോഗ്യ വിവരങ്ങൾ'
      ],
    },
    {
      routeId: 'doctor_portal',
      phrases: [
        'ഡോക്ടർ', 'ഡോക്ടർ കൺസൾട്ടേഷൻ', 'ഡോക്ടർ പോർട്ടൽ', 'ഡോക്ടറോട് സംസാരിക്കുക'
      ],
    },
    {
      routeId: 'appointments',
      phrases: [
        'അപ്പോയിന്റ്മെന്റുകൾ', 'അപ്പോയിന്റ്മെന്റ് കാണിക്കുക', 'ഡോക്ടർ അപ്പോയിന്റ്മെന്റ്'
      ],
    },
    {
      routeId: 'records',
      phrases: [
        'മെഡിക്കൽ റെക്കോർഡുകൾ', 'ആരോഗ്യ രേഖകൾ'
      ],
    },
    {
      routeId: 'report_scanner',
      phrases: [
        'റിപ്പോർട്ടുകൾ', 'മെഡിക്കൽ റിപ്പോർട്ടുകൾ', 'റിപ്പോർട്ട് സ്കാനർ'
      ],
    },
    {
      routeId: 'xray_viewer',
      phrases: [
        'എക്സ്-റേ', 'സ്കാൻ', 'എക്സ്റേ ചിത്രങ്ങൾ'
      ],
    },
    {
      routeId: 'health_tests',
      phrases: [
        'ആരോഗ്യ പരിശോധനകൾ', 'ടെസ്റ്റുകൾ', 'ലാബ് പരിശോധനകൾ'
      ],
    },
    {
      routeId: 'vaccinations',
      phrases: [
        'വാക്സിനേഷൻ', 'കുത്തിവയ്പ്പുകൾ', 'പ്രതിരോധ കുത്തിവയ്പ്പ്'
      ],
    },
    {
      routeId: 'ai_assistant',
      phrases: [
        'എഐ അസിസ്റ്റന്റ്', 'മെഡോറ എഐ', 'എഐയോട് ചോദിക്കുക'
      ],
    },
    {
      routeId: 'hospitals',
      phrases: [
        'ആശുപത്രികൾ', 'സമീപത്തെ ആശുപത്രി'
      ],
    },
    {
      routeId: 'schemes',
      phrases: [
        'സർക്കാർ പദ്ധതികൾ', 'പദ്ധതികൾ'
      ],
    },
    {
      routeId: 'call_history',
      phrases: [
        'കോൾ ഹിസ്റ്ററി', 'കോളുകൾ'
      ],
    },
    {
      routeId: 'settings',
      phrases: [
        'ക്രമീകരണങ്ങൾ', 'സെറ്റിംഗ്സ്'
      ],
    },
    {
      routeId: 'help',
      phrases: [
        'സഹായം'
      ],
    },
  ],

  // ─── 6. KANNADA (kn-IN) ──────────────────────────────────────────────────────────
  kn: [
    {
      routeId: 'dashboard',
      phrases: [
        'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'ಮುಖಪುಟ', 'ಹೋಮ್',
        'ಪ್ರಮುಖ ಪುಟ'
      ],
    },
    {
      routeId: 'medicines',
      phrases: [
        'ಔಷಧಿಗಳಿಗೆ ಹೋಗಿ', 'ಔಷಧಿಗಳನ್ನು ತೆರೆಯಿರಿ', 'ನನ್ನ ಔಷಧಿಗಳು', 'ಔಷಧಿಗಳು',
        'ಔಷಧಿ ಜ್ಞಾಪನೆ', 'ಔಷಧಿ ವೇಳಾಪಟ್ಟಿ'
      ],
    },
    {
      routeId: 'emergency',
      phrases: [
        'ತುರ್ತು ಪರಿಸ್ಥಿತಿ', 'ತುರ್ತು ಸಹಾಯ', 'ಎಮರ್ಜೆನ್ಸಿ', 'ತುರ್ತು ಪುಟ',
        'ಆಂಬ್ಯುಲೆನ್ಸ್'
      ],
    },
    {
      routeId: 'family',
      phrases: [
        'ಕುಟುಂಬ', 'ಕುಟುಂಬ ಆರೋಗ್ಯ', 'ಕುಟುಂಬ ಸದಸ್ಯರು'
      ],
    },
    {
      routeId: 'health',
      phrases: [
        'ನನ್ನ ಆರೋಗ್ಯ', 'ಆರೋಗ್ಯ ವಿವರ'
      ],
    },
    {
      routeId: 'doctor_portal',
      phrases: [
        'ವೈದ್ಯರು', 'ವೈದ್ಯರ ಸಮಾಲೋಚನೆ', 'ಡಾಕ್ಟರ್ ಪೋರ್ಟಲ್', 'ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ'
      ],
    },
    {
      routeId: 'appointments',
      phrases: [
        'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು', 'ನನ್ನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್', 'ವೈದ್ಯರ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್'
      ],
    },
    {
      routeId: 'records',
      phrases: [
        'ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು', 'ಆರೋಗ್ಯ ದಾಖಲೆಗಳು'
      ],
    },
    {
      routeId: 'report_scanner',
      phrases: [
        'ವರದಿಗಳು', 'ವೈದ್ಯಕೀಯ ವರದಿಗಳು', 'ವರದಿ ಸ್ಕ್ಯಾನರ್', 'ವರದಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ'
      ],
    },
    {
      routeId: 'xray_viewer',
      phrases: [
        'ಎಕ್ಸ್-ರೇ', 'ಸ್ಕ್ಯಾನ್ ಚಿತ್ರಗಳು', 'ಎಕ್ಸ್-ರೇ ನೋಡಿ'
      ],
    },
    {
      routeId: 'health_tests',
      phrases: [
        'ಆರೋಗ್ಯ ಪರೀಕ್ಷೆಗಳು', 'ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆಗಳು', 'ಪರೀಕ್ಷೆಗಳು'
      ],
    },
    {
      routeId: 'vaccinations',
      phrases: [
        'ಲಸಿಕೆಗಳು', 'ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ', 'ಲಸಿಕೆ'
      ],
    },
    {
      routeId: 'ai_assistant',
      phrases: [
        'ಎಐ ಸಹಾಯಕ', 'ಮೆಡೋರಾ ಎಐ', 'ಎಐ ಜತೆ ಮಾತನಾಡಿ'
      ],
    },
    {
      routeId: 'hospitals',
      phrases: [
        'ಆಸ್ಪತ್ರೆಗಳು', 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ'
      ],
    },
    {
      routeId: 'schemes',
      phrases: [
        'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', 'ಯೋಜನೆಗಳು'
      ],
    },
    {
      routeId: 'call_history',
      phrases: [
        'ಕರೆ ಇತಿಹಾಸ', 'ಕರೆಗಳು'
      ],
    },
    {
      routeId: 'settings',
      phrases: [
        'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', 'ಸೆಟ್ಟಿಂಗ್ಸ್'
      ],
    },
    {
      routeId: 'help',
      phrases: [
        'ಸಹಾಯ'
      ],
    },
  ],
};

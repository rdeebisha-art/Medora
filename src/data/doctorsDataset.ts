import { Specialization, LanguageCode } from '../types';

export interface LocalizedString {
  en: string;
  ta: string;
  te: string;
  ml: string;
  kn: string;
  hi: string;
}

export interface LocalizedStringArray {
  en: string[];
  ta: string[];
  te: string[];
  ml: string[];
  kn: string[];
  hi: string[];
}

export interface FictionalDoctorProfile {
  id: string;
  doctorId: string;
  name: string;
  nameI18n: LocalizedString;
  specialty: Specialization;
  specialtyI18n: LocalizedString;
  departmentI18n: LocalizedString;
  ruralCareFocus: string;
  ruralCareFocusI18n: LocalizedString;
  experienceYears: number;
  experienceI18n: LocalizedString;
  languages: string[];
  languagesI18n: LocalizedString;
  consultationType: 'In-person' | 'Teleconsultation' | 'Both';
  consultationTypeI18n: LocalizedString;
  availabilityStatus: 'Available Today' | 'Next Available: Tomorrow' | 'On Duty (Emergency)' | 'Visiting Days: Mon/Wed/Fri';
  availabilityStatusI18n: LocalizedString;
  isDemo: boolean;
  demoFee: string;
  demoFeeI18n: LocalizedString;
  contactPhone?: string;
  shortBio: string;
  shortBioI18n: LocalizedString;
  areasOfCare: string[];
  areasOfCareI18n: LocalizedStringArray;
  hospitalAffiliation: string;
  hospitalAffiliationI18n: LocalizedString;
  opdTimings: string;
  opdTimingsI18n: LocalizedString;
  education: string;
  educationI18n: LocalizedString;
  locationI18n: LocalizedString;
}

export const LANGUAGE_DISPLAY_NAMES: Record<string, Record<LanguageCode, string>> = {
  English: {
    en: 'English',
    ta: 'ஆங்கிலம்',
    te: 'ఇంగ్లీష్',
    ml: 'ഇംഗ്ലീഷ്',
    kn: 'ಇಂಗ್ಲಿಷ್',
    hi: 'अंग्रेज़ी'
  },
  Tamil: {
    en: 'Tamil',
    ta: 'தமிழ்',
    te: 'తమిళం',
    ml: 'തമിഴ്',
    kn: 'ತಮಿಳು',
    hi: 'तमिल'
  },
  Telugu: {
    en: 'Telugu',
    ta: 'தெலுங்கு',
    te: 'తెలుగు',
    ml: 'തെലുങ്ക്',
    kn: 'ತೆಲುಗು',
    hi: 'तेलुगु'
  },
  Malayalam: {
    en: 'Malayalam',
    ta: 'மலையாளம்',
    te: 'మలయాళం',
    ml: 'മലയാളം',
    kn: 'ಮಲಯಾಳಂ',
    hi: 'मलयालम'
  },
  Kannada: {
    en: 'Kannada',
    ta: 'கன்னடம்',
    te: 'కన్నడ',
    ml: 'കന്നഡ',
    kn: 'ಕನ್ನಡ',
    hi: 'कन्नड़'
  },
  Hindi: {
    en: 'Hindi',
    ta: 'இந்தி',
    te: 'హిందీ',
    ml: 'ഹിന്ദി',
    kn: 'ಹಿಂದಿ',
    hi: 'हिन्दी'
  }
};

export const SPECIALTY_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  'General Physician': {
    en: 'General Physician',
    ta: 'பொது மருத்துவர்',
    te: 'సాధారణ వైద్యుడు',
    ml: 'ജനറൽ ഫിസിഷ്യൻ',
    kn: 'ಸಾಮಾನ್ಯ ವೈದ್ಯರು',
    hi: 'सामान्य चिकित्सक'
  },
  'Pediatrician': {
    en: 'Pediatrician',
    ta: 'குழந்தைகள் நல மருத்துவர்',
    te: 'పిల్లల వైద్యుడు',
    ml: 'ശിശുരോഗ വിദഗ്ദ്ധൻ',
    kn: 'ಮಕ್ಕಳ ತಜ್ಞರು',
    hi: 'बाल रोग विशेषज्ञ'
  },
  'Pediatric Care': {
    en: 'Pediatric Care',
    ta: 'குழந்தை தீவிர நல பராமரிப்பு',
    te: 'శిశు సంరక్షణ నిపుణుడు',
    ml: 'നവജാത ശിശു പരിചരണം',
    kn: 'ಮಕ್ಕಳ ಆರೈಕೆ ತಜ್ಞರು',
    hi: 'बाल स्वास्थ्य एवं नवजात देखभाल'
  },
  'Gynecologist / Obstetrician': {
    en: 'Gynecologist / Obstetrician',
    ta: 'மகப்பேறு மற்றும் மகளிர் நல மருத்துவர்',
    te: 'ప్రసూతి మరియు స్త్రీ జననేంద్రియ నిపుణురాలు',
    ml: 'പ്രസവ-സ്ത്രീരോഗ വിദഗ്ദ്ധ',
    kn: 'ಪ್ರಸೂತಿ ಮತ್ತು ಸ್ತ್ರೀರೋಗ ತಜ್ಞರು',
    hi: 'प्रसूति एवं स्त्री रोग विशेषज्ञ'
  },
  'Maternal Care': {
    en: 'Maternal Care',
    ta: 'தாய்மை மற்றும் மகப்பேறு பராமரிப்பு',
    te: 'మాతృత్వ సంరక్షణ',
    ml: 'മാതൃ പരിചരണം',
    kn: 'ತಾಯ್ತನದ ಆರೈಕೆ',
    hi: 'मातृ देखभाल विशेषज्ञ'
  },
  'Geriatric Care': {
    en: 'Geriatric Care',
    ta: 'முதியோர் நல சிறப்பு மருத்துவர்',
    te: 'వృద్ధాప్య సంరక్షణ నిపుణురాలు',
    ml: 'വയോജന ചികിത്സാ വിദഗ്ദ്ധ',
    kn: 'ಹಿರಿಯ ನಾಗರಿಕರ ಆರೈಕೆ ತಜ್ಞರು',
    hi: 'वृद्धजन चिकित्सा विशेषज्ञ'
  },
  'Diabetologist': {
    en: 'Diabetologist',
    ta: 'சர்க்கரை நோய் சிறப்பு மருத்துவர்',
    te: 'మధుమేహ నిపుణుడు',
    ml: 'പ്രമേഹ രോഗ വിദഗ്ദ്ധൻ',
    kn: 'ಮಧುಮೇಹ ತಜ್ಞರು',
    hi: 'मधुमेह रोग विशेषज्ञ'
  },
  'Cardiologist': {
    en: 'Cardiologist',
    ta: 'இதய நோய் சிறப்பு மருத்துவர்',
    te: 'గుండె వైద్యుడు',
    ml: 'ഹൃദ്രോഗ വിദഗ്ദ്ധൻ',
    kn: 'ಹೃದ್ರೋಗ ತಜ್ಞರು',
    hi: 'हृदय रोग विशेषज्ञ'
  },
  'Nutritionist': {
    en: 'Nutritionist',
    ta: 'ஊட்டச்சத்து சிறப்பு ஆலோசகர்',
    te: 'పోషకాహార నిపుణురాలు',
    ml: 'പോഷകാഹാര വിദഗ്ദ്ധ',
    kn: 'ಪೌಷ್ಟಿಕಾಂಶ ತಜ್ಞರು',
    hi: 'पोषण विशेषज्ञ'
  },
  'Mental Wellness Professional': {
    en: 'Mental Wellness Professional',
    ta: 'மன நல சிறப்பு ஆலோசகர்',
    te: 'మానసిక ఆరోగ్య నిపుణుడు',
    ml: 'മാനസികാരോഗ്യ വിദഗ്ദ്ധൻ',
    kn: 'ಮಾನಸಿಕ ಕ್ಷೇಮ ತಜ್ಞರು',
    hi: 'मानसिक स्वास्थ्य विशेषज्ञ'
  }
};

export const STATUS_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  'Available Today': {
    en: 'Available Today',
    ta: 'இன்று கிடைக்கும்',
    te: 'ఈరోజు అందుబాటులో ఉన్నారు',
    ml: 'ഇന്ന് ലഭ്യമാണ്',
    kn: 'ಇಂದು ಲಭ್ಯವಿದ್ದಾರೆ',
    hi: 'आज उपलब्ध हैं'
  },
  'Next Available: Tomorrow': {
    en: 'Next Available: Tomorrow',
    ta: 'அடுத்த சந்திப்பு: நாளை',
    te: 'తదుపరి అందుబాటు: రేపు',
    ml: 'അടുത്തത് ലഭ്യമാകുന്നത്: നാളെ',
    kn: 'ಮುಂದಿನ ಲಭ್ಯತೆ: ನಾಳೆ',
    hi: 'अगली उपलब्धता: कल'
  },
  'On Duty (Emergency)': {
    en: 'On Duty (Emergency)',
    ta: 'அவசர சிகிச்சைப் பணியில்',
    te: 'అత్యవసర విధుల్లో ఉన్నారు',
    ml: 'അടിയന്തര ഡ്യൂട്ടിയിൽ',
    kn: 'ತುರ್ತು ಕರ್ತವ್ಯದಲ್ಲಿದ್ದಾರೆ',
    hi: 'आपातकालीन ड्यूटी पर'
  },
  'Visiting Days: Mon/Wed/Fri': {
    en: 'Visiting Days: Mon/Wed/Fri',
    ta: 'வருகை நாட்கள்: திங்கள்/புதன்/வெள்ளி',
    te: 'సందర్శన రోజులు: సోమ/బుధ/శుక్ర',
    ml: 'സന്ദർശന ദിവസങ്ങൾ: തിങ്കൾ/ബുധൻ/വെള്ളി',
    kn: 'ಸಂದರ್ಶನ ದಿನಗಳು: ಸೋಮ/ಬುಧ/ಶುಕ್ರ',
    hi: 'परामर्श दिवस: सोम/बुध/शुक्र'
  },
  'Available': {
    en: 'Available',
    ta: 'கிடைக்கும்',
    te: 'అందుబాటులో ఉంది',
    ml: 'ലഭ്യമാണ്',
    kn: 'ಲಭ್ಯವಿದೆ',
    hi: 'उपलब्ध'
  },
  'Unavailable': {
    en: 'Unavailable',
    ta: 'கிடைக்கவில்லை',
    te: 'అందుబాటులో లేదు',
    ml: 'ലഭ്യമല്ല',
    kn: 'ಲಭ್ಯವಿಲ್ಲ',
    hi: 'अनुपलब्ध'
  },
  'Demo': {
    en: 'Demo',
    ta: 'மாதிரி',
    te: 'డెమో',
    ml: 'ഡെമോ',
    kn: 'ಡೆಮೊ',
    hi: 'डेमो'
  },
  'Demo Consultation': {
    en: 'Demo Consultation',
    ta: 'மாதிரி மருத்துவ ஆலோசனை',
    te: 'డెమో వైద్య సంప్రదింపు',
    ml: 'ഡെമോ കൺസൾട്ടേഷൻ',
    kn: 'ಡೆಮೊ ಸಮಾಲೋಚನೆ',
    hi: 'डेमो परामर्श'
  },
  'Offline': {
    en: 'Offline',
    ta: 'ஆஃப்லைன்',
    te: 'ఆఫ్‌లైన్',
    ml: 'ഓഫ്‌ലൈൻ',
    kn: 'ಆಫ್‌ಲೈನ್',
    hi: 'ऑफ़लाइन'
  },
  'Not Available': {
    en: 'Not Available',
    ta: 'தற்போது கிடைக்கவில்லை',
    te: 'ప్రస్తుతం అందుబాటులో లేదు',
    ml: 'ഇപ്പോൾ ലഭ്യമല്ല',
    kn: 'ಪ್ರಸ್ತುತ ಲಭ್ಯವಿಲ್ಲ',
    hi: 'उपलब्ध नहीं है'
  }
};

export const CONSULTATION_TYPE_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  'Both': {
    en: 'Both (In-person & Teleconsultation)',
    ta: 'இரண்டும் (நேரில் & தொலைத்தொடர்பு)',
    te: 'రెండూ (ప్రత్యక్ష & టెలికన్సల్టేషన్)',
    ml: 'രണ്ടും (നേരിട്ടും ഫോൺ വഴിയും)',
    kn: 'ಎರಡೂ (ನೇರ & ಟೆಲಿಸಮಾಲೋಚನೆ)',
    hi: 'दोनों (प्रत्यक्ष एवं टेली-परामर्श)'
  },
  'In-person': {
    en: 'In-person',
    ta: 'நேரடி ஆலோசனை',
    te: 'ప్రత్యక్ష సంప్రదింపు',
    ml: 'നേരിട്ടുള്ള പരിശോധന',
    kn: 'ನೇರ ಸಮಾಲೋಚನೆ',
    hi: 'प्रत्यक्ष परामर्श'
  },
  'Teleconsultation': {
    en: 'Teleconsultation',
    ta: 'தொலைத்தொடர்பு மருத்துவ ஆலோசனை',
    te: 'టెలికన్సల్టేషన్',
    ml: 'ടെലികൺസൾട്ടേഷൻ',
    kn: 'ಟೆಲಿಸಮಾಲೋಚನೆ',
    hi: 'टेली-परामर्श'
  }
};

export const DEMO_HEALTHCARE_TEAM: FictionalDoctorProfile[] = [
  {
    id: 'DOC-001',
    doctorId: 'DOC-001',
    name: 'Dr. Arun Kumar',
    nameI18n: {
      en: 'Dr. Arun Kumar',
      ta: 'டாக்டர் அருண் குமார்',
      te: 'డాక్టర్ అరుణ్ కుమార్',
      ml: 'ഡോ. അരുൺ കുമാർ',
      kn: 'ಡಾ. ಅರುಣ್ ಕುಮಾರ್',
      hi: 'डॉ. अरुण कुमार'
    },
    specialty: 'General Physician',
    specialtyI18n: {
      en: 'General Physician',
      ta: 'பொது மருத்துவர்',
      te: 'సాధారణ వైద్యుడు',
      ml: 'ജനറൽ ഫിസിഷ്യൻ',
      kn: 'ಸಾಮಾನ್ಯ ವೈದ್ಯರು',
      hi: 'सामान्य चिकित्सक'
    },
    departmentI18n: {
      en: 'General Medicine & Primary Care',
      ta: 'பொது மருத்துவம் மற்றும் ஆரம்ப சுகாதாரம்',
      te: 'జనరల్ మెడిసిన్ & ప్రాథమిక సంరక్షణ',
      ml: 'ജനറൽ മെഡിസിനും പ്രാഥമികാരോഗ്യവും',
      kn: 'ಸಾಮಾನ್ಯ ವೈದ್ಯಕೀಯ ಮತ್ತು ಪ್ರಾಥಮಿಕ ಆರೈಕೆ',
      hi: 'सामान्य चिकित्सा एवं प्राथमिक देखभाल'
    },
    ruralCareFocus: 'Primary Healthcare, Fever Triage & Infectious Illness Management',
    ruralCareFocusI18n: {
      en: 'Primary Healthcare, Fever Triage & Infectious Illness Management',
      ta: 'ஆரம்ப சுகாதாரம், காய்ச்சல் வகைப்படுத்தல் மற்றும் தொற்றுநோய் மேலாண்மை',
      te: 'ప్రాథమిక ఆరోగ్యం, జ్వరం నిర్ధారణ & అంటువ్యాధుల చికిత్స',
      ml: 'പ്രാഥമികാരോഗ്യം, പനി നിർണ്ണയം, പകർച്ചവ്യാധി നിയന്ത്രണം',
      kn: 'ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ, ಜ್ವರ ಪರೀಕ್ಷೆ ಮತ್ತು ಸಾಂಕ್ರಾಮಿಕ ರೋಗ ನಿರ್ವಹಣೆ',
      hi: 'प्राथमिक स्वास्थ्य देखभाल, बुखार वर्गीकरण एवं संक्रामक रोग प्रबंधन'
    },
    experienceYears: 14,
    experienceI18n: {
      en: '14 Years Clinical Practice',
      ta: '14 ஆண்டுகள் மருத்துவ அனுபவம்',
      te: '14 సంవత్సరాల క్లినికల్ అనుభవం',
      ml: '14 വർഷത്തെ ക്ലിനിക്കൽ പരിചയം',
      kn: '14 ವರ್ಷಗಳ ವೈದ್ಯಕೀಯ ಅನುಭವ',
      hi: '14 वर्षों का चिकित्सीय अनुभव'
    },
    languages: ['Tamil', 'English', 'Hindi'],
    languagesI18n: {
      en: 'Tamil, English, Hindi',
      ta: 'தமிழ், ஆங்கிலம், இந்தி',
      te: 'తమిళం, ఇంగ్లీష్, హిందీ',
      ml: 'തമിഴ്, ഇംഗ്ലീഷ്, ഹിന്ദി',
      kn: 'ತಮಿಳು, ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ',
      hi: 'तमिल, अंग्रेज़ी, हिन्दी'
    },
    consultationType: 'Both',
    consultationTypeI18n: {
      en: 'Both (In-person & Teleconsultation)',
      ta: 'இரண்டும் (நேரில் & தொலைத்தொடர்பு)',
      te: 'రెండూ (ప్రత్యక్ష & టెలికన్సల్టేషన్)',
      ml: 'രണ്ടും (നേരിട്ടും ഫോൺ വഴിയും)',
      kn: 'ಎರಡೂ (ನೇರ & ಟೆಲಿಸಮಾಲೋಚನೆ)',
      hi: 'दोनों (प्रत्यक्ष एवं टेली-परामर्श)'
    },
    availabilityStatus: 'Available Today',
    availabilityStatusI18n: {
      en: 'Available Today',
      ta: 'இன்று கிடைக்கும்',
      te: 'ఈరోజు అందుబాటులో ఉన్నారు',
      ml: 'ഇന്ന് ലഭ്യമാണ്',
      kn: 'ಇಂದು ಲಭ್ಯವಿದ್ದಾರೆ',
      hi: 'आज उपलब्ध हैं'
    },
    isDemo: true,
    demoFee: 'Free (Ayushman / PHC)',
    demoFeeI18n: {
      en: 'Free (Ayushman / PHC)',
      ta: 'இலவசம் (ஆயுஷ்மான் / ஆரம்ப சுகாதார நிலையம்)',
      te: 'ఉచితం (ఆయుష్మాన్ / ప్రాథమిక కేంద్రం)',
      ml: 'സൗജന്യം (ആയുഷ്മാൻ / പി.എച്ച്.സി)',
      kn: 'ಉಚಿತ (ಆಯುಷ್ಮಾನ್ / ಪಿಎಚ್‌ಸಿ)',
      hi: 'निःशुल्क (आयुष्मान / प्राथमिक स्वास्थ्य केंद्र)'
    },
    contactPhone: '+919800001001',
    shortBio: 'Fictional rural primary physician serving Rampur block. Dedicated to early infection control, seasonal fevers, and comprehensive family health monitoring.',
    shortBioI18n: {
      en: 'Fictional rural primary physician serving Rampur block. Dedicated to early infection control, seasonal fevers, and comprehensive family health monitoring.',
      ta: 'ராம்பூர் வட்டாரத்திற்கான முதன்மை மருத்துவர். ஆரம்பகால தொற்று கட்டுப்பாடு, பருவகால காய்ச்சல் மற்றும் குடும்ப சுகாதார கண்காணிப்பில் அர்ப்பணிப்புடன் பணியாற்றுகிறார்.',
      te: 'రాంపూర్ ప్రాంతానికి సేవలందించే గ్రామీణ ప్రాథమిక వైద్యుడు. ప్రారంభ సంక్రమణ నియంత్రణ, కాలానుగుణ జ్వరాలు మరియు కుటుంబ ఆరోగ్య పర్యవేక్షణలో నిపుణుడు.',
      ml: 'രാംപൂർ മേഖലയിലെ ഗ്രാമീണ പ്രാഥമിക ചികിത്സകൻ. അണുബാധ നിയന്ത്രണം, സീസണൽ പനി, കുടുംബാരോഗ്യ നിരീക്ഷണം എന്നിവയിൽ പരിചയസമ്പന്നൻ.',
      kn: 'ರಾಂಪುರ ತಾಲೂಕಿನ ಪ್ರಾಥಮಿಕ ವೈದ್ಯರು. ಆರಂಭಿಕ ಸೋಂಕು ನಿಯಂತ್ರಣ, ಕಾಲೋಚಿತ ಜ್ವರ ಮತ್ತು ಕುಟುಂಬ ಆರೋಗ್ಯ ಮೇಲ್ವಿಚಾರಣೆಯಲ್ಲಿ ಪರಿಣತಿ ಹೊಂದಿದ್ದಾರೆ.',
      hi: 'रामपुर ब्लॉक के समर्पित ग्रामीण प्राथमिक चिकित्सक। शुरुआती संक्रमण नियंत्रण, मौसमी बुखार और समग्र पारिवारिक स्वास्थ्य निगरानी में अनुभवी।'
    },
    areasOfCare: ['Acute Fevers & Infection', 'Hypertension Screening', 'Adult Vaccinations', 'General Triage'],
    areasOfCareI18n: {
      en: ['Acute Fevers & Infection', 'Hypertension Screening', 'Adult Vaccinations', 'General Triage'],
      ta: ['தீவிர காய்ச்சல் மற்றும் தொற்று', 'இரத்த அழுத்த பரிசோதனை', 'பெரியவர்களுக்கான தடுப்பூசி', 'பொது முதலுதவி வகைப்படுத்தல்'],
      te: ['తీవ్ర జ్వరం & ఇన్ఫెక్షన్', 'రక్తపోటు పరీక్ష', 'పెద్దల టీకాలు', 'సాధారణ ప్రథమ చికిత్స'],
      ml: ['തീവ്ര പനിയും അണുബാധയും', 'രക്തസമ്മർദ്ദ പരിശോധന', 'മുതിർന്നവർക്കുള്ള വാക്സിനേഷൻ', 'ജനറൽ ട്രയാജ്'],
      kn: ['ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಸೋಂಕು', 'ರಕ್ತದೊತ್ತಡ ತಪಾಸಣೆ', 'ವಯಸ್ಕರ ಲಸಿಕೆಗಳು', 'ಸಾಮಾನ್ಯ ತಪಾಸಣೆ'],
      hi: ['तीव्र बुखार एवं संक्रमण', 'रक्तचाप जांच', 'वयस्क टीकाकरण', 'सामान्य प्राथमिक जांच']
    },
    hospitalAffiliation: 'Rampur Primary Health Centre (PHC)',
    hospitalAffiliationI18n: {
      en: 'Rampur Primary Health Centre (PHC)',
      ta: 'ராம்பூர் ஆரம்ப சுகாதார நிலையம் (PHC)',
      te: 'రాంపూర్ ప్రాథమిక ఆరోగ్య కేంద్రం (PHC)',
      ml: 'രാംപൂർ പ്രാഥമിക ആരോഗ്യ കേന്ദ്രം (PHC)',
      kn: 'ರಾಂಪುರ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC)',
      hi: 'रामपुर प्राथमिक स्वास्थ्य केंद्र (PHC)'
    },
    opdTimings: 'Mon - Sat: 9:00 AM - 2:00 PM',
    opdTimingsI18n: {
      en: 'Mon - Sat: 9:00 AM - 2:00 PM',
      ta: 'திங்கள் - சனி: காலை 9:00 - மதியம் 2:00',
      te: 'సోమ - శని: ఉదయం 9:00 - మధ్యాహ్నం 2:00',
      ml: 'തിങ്കൾ - ശനി: രാവിലെ 9:00 - ഉച്ചയ്ക്ക് 2:00',
      kn: 'ಸೋಮ - ಶನಿ: ಬೆಳಗ್ಗೆ 9:00 - ಮಧ್ಯಾಹ್ನ 2:00',
      hi: 'सोम - शनि: सुबह 9:00 - दोपहर 2:00'
    },
    education: 'MBBS, MD (General Medicine) - Fictional Medical College',
    educationI18n: {
      en: 'MBBS, MD (General Medicine)',
      ta: 'MBBS, MD (பொது மருத்துவம்)',
      te: 'MBBS, MD (జనరల్ మెడిసిన్)',
      ml: 'MBBS, MD (ജനറൽ മെഡിസിൻ)',
      kn: 'MBBS, MD (ಜನರಲ್ ಮೆಡಿಸಿನ್)',
      hi: 'एमबीबीएस, एमडी (जनरल मेडिसिन)'
    },
    locationI18n: {
      en: 'Rampur Village, Block A',
      ta: 'ராம்பூர் கிராமம், பிளாக் ஏ',
      te: 'రాంపూర్ గ్రామం, బ్లాక్ ఏ',
      ml: 'രാംപൂർ ഗ്രാമം, ബ്ലോക്ക് എ',
      kn: 'ರಾಂಪುರ ಗ್ರಾಮ, ಬ್ಲಾಕ್ ಎ',
      hi: 'रामपुर गांव, ब्लॉक ए'
    }
  },
  {
    id: 'DOC-002',
    doctorId: 'DOC-002',
    name: 'Dr. Meera Nair',
    nameI18n: {
      en: 'Dr. Meera Nair',
      ta: 'டாக்டர் மீரா நாயர்',
      te: 'డాక్టర్ మీరా నాయర్',
      ml: 'ഡോ. മീര നായർ',
      kn: 'ಡಾ. ಮೀರಾ ನಾಯರ್',
      hi: 'डॉ. मीरा नायर'
    },
    specialty: 'Pediatrician',
    specialtyI18n: {
      en: 'Pediatrician',
      ta: 'குழந்தைகள் நல மருத்துவர்',
      te: 'పిల్లల వైద్యుడు',
      ml: 'ശിശുരോഗ വിദഗ്ദ്ധൻ',
      kn: 'ಮಕ್ಕಳ ತಜ್ಞರು',
      hi: 'बाल रोग विशेषज्ञ'
    },
    departmentI18n: {
      en: 'Department of Pediatrics & Child Health',
      ta: 'குழந்தைகள் நலம் மற்றும் குழந்தைகள் பிரிவு',
      te: 'పీడియాట్రిక్స్ & పిల్లల ఆరోగ్య విభాగం',
      ml: 'പീഡിയാട്രിക്സ് ആന്റ് ചൈൽഡ് ഹെൽത്ത് വിഭാഗം',
      kn: 'ಮಕ್ಕಳ ಆರೋಗ್ಯ ವಿಭಾಗ',
      hi: 'बाल रोग एवं बाल स्वास्थ्य विभाग'
    },
    ruralCareFocus: 'Child Growth Monitoring, Acute Respiratory Infections & Nutrition',
    ruralCareFocusI18n: {
      en: 'Child Growth Monitoring, Acute Respiratory Infections & Nutrition',
      ta: 'குழந்தைகள் வளர்ச்சி கண்காணிப்பு, சுவாச தொற்று நோய்கள் மற்றும் ஊட்டச்சத்து',
      te: 'పిల్లల ఎదుగుదల పర్యవేక్షణ, శ్వాసకోశ ఇన్ఫెక్షన్లు & పోషకాహారం',
      ml: 'കുട്ടികളുടെ വളർച്ചാ നിരീക്ഷണം, ശ്വാസകോശ അണുബാധ, പോഷകാഹാരം',
      kn: 'ಮಕ್ಕಳ ಬೆಳವಣಿಗೆಯ ಮೇಲ್ವಿಚಾರಣೆ, ತೀವ್ರ ಉಸಿರಾಟದ ಸೋಂಕು ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶ',
      hi: 'बाल विकास निगरानी, तीव्र श्वसन संक्रमण एवं पोषण'
    },
    experienceYears: 11,
    experienceI18n: {
      en: '11 Years Clinical Practice',
      ta: '11 ஆண்டுகள் மருத்துவ அனுபவம்',
      te: '11 సంవత్సరాల క్లినికల్ అనుభవం',
      ml: '11 വർഷത്തെ ക്ലിനിക്കൽ പരിചയം',
      kn: '11 ವರ್ಷಗಳ ವೈದ್ಯಕೀಯ ಅನುಭವ',
      hi: '11 वर्षों का चिकित्सीय अनुभव'
    },
    languages: ['Malayalam', 'Tamil', 'English'],
    languagesI18n: {
      en: 'Malayalam, Tamil, English',
      ta: 'மலையாளம், தமிழ், ஆங்கிலம்',
      te: 'మలయాళం, తమిళం, ఇంగ్లీష్',
      ml: 'മലയാളം, തമിഴ്, ഇംഗ്ലീഷ്',
      kn: 'ಮಲಯಾಳಂ, ತಮಿಳು, ಇಂಗ್ಲಿಷ್',
      hi: 'मलयालम, तमिल, अंग्रेज़ी'
    },
    consultationType: 'Both',
    consultationTypeI18n: {
      en: 'Both (In-person & Teleconsultation)',
      ta: 'இரண்டும் (நேரில் & தொலைத்தொடர்பு)',
      te: 'రెండూ (ప్రత్యక్ష & టెలికన్సల్టేషన్)',
      ml: 'രണ്ടും (നേരിട്ടും ഫോൺ വഴിയും)',
      kn: 'ಎರಡೂ (ನೇರ & ಟೆಲಿಸಮಾಲೋಚನೆ)',
      hi: 'दोनों (प्रत्यक्ष एवं टेली-परामर्श)'
    },
    availabilityStatus: 'Available Today',
    availabilityStatusI18n: {
      en: 'Available Today',
      ta: 'இன்று கிடைக்கும்',
      te: 'ఈరోజు అందుబాటులో ఉన్నారు',
      ml: 'இന്ന് ലഭ്യമാണ്',
      kn: 'ಇಂದು ಲಭ್ಯವಿದ್ದಾರೆ',
      hi: 'आज उपलब्ध हैं'
    },
    isDemo: true,
    demoFee: 'Free (National Child Health RBSK)',
    demoFeeI18n: {
      en: 'Free (National Child Health RBSK)',
      ta: 'இலவசம் (தேசிய குழந்தை நலம் RBSK திட்டம்)',
      te: 'ఉచితం (జాతీయ బాలల ఆరోగ్యం RBSK పథకం)',
      ml: 'സൗജന്യം (ആർ.ബി.എസ്.കെ ശിശു ആരോഗ്യ പദ്ധതി)',
      kn: 'ಉಚಿತ (ಆರ್‌ಬಿಎಸ್‌ಕೆ ರಾಷ್ಟ್ರೀಯ ಮಕ್ಕಳ ಆರೋಗ್ಯ ಯೋಜನೆ)',
      hi: 'निःशुल्क (राष्ट्रीय बाल स्वास्थ्य कार्यक्रम - आरबीएसके)'
    },
    contactPhone: '+919800001002',
    shortBio: 'Fictional pediatrician dedicated to rural child survival, immunization schedules, childhood asthma, and pediatric malnutrition rehabilitation.',
    shortBioI18n: {
      en: 'Fictional pediatrician dedicated to rural child survival, immunization schedules, childhood asthma, and pediatric malnutrition rehabilitation.',
      ta: 'கிராமப்புற குழந்தைகள் உயிர்வாழ்வு, தடுப்பூசி அட்டவணை, குழந்தை ஆஸ்துமா மற்றும் ஊட்டச்சத்து குறைபாடு மறுவாழ்வில் அர்ப்பணிப்புடன் செயல்படும் குழந்தைகள் நல மருத்துவர்.',
      te: 'గ్రామీణ పిల్లల ఆరోగ్యం, రోగనిరోధక టీకాలు, బాల్య ఆస్తమా మరియు పోషకాహార లోపం నివారణకు అంకితమైన శిశువైద్యురాలు.',
      ml: 'ഗ്രാമീണ കുട്ടികളുടെ ആരോഗ്യം, പ്രതിരോധ കുത്തിവയ്പ്പുകൾ, കുട്ടികളിലെ ആസ്ത്മ, പോഷകാഹാര പുനരധിവാസം എന്നിവയിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുന്ന ശിശുരോഗ വിദഗ്ദ്ധ.',
      kn: 'ಗ್ರಾಮೀಣ ಮಕ್ಕಳ ಆರೋಗ್ಯ, ಲಸಿಕಾ ವೇಳಾಪಟ್ಟಿ, ಮಕ್ಕಳ ಅಸ್ತಮಾ ಮತ್ತು ಅಪೌಷ್ಟಿಕತೆ ಪುನರ್ವಸತಿಗೆ ಬದ್ಧರಾಗಿರುವ ಮಕ್ಕಳ ತಜ್ಞರು.',
      hi: 'ग्रामीण बाल स्वास्थ्य, टीकाकरण कार्यक्रम, बाल अस्थमा और कुपोषण निवारण में समर्पित बाल रोग विशेषज्ञ।'
    },
    areasOfCare: ['Child Immunization', 'Pediatric Pneumonia & Cough', 'Diarrhea & ORS Management', 'Growth Falters'],
    areasOfCareI18n: {
      en: ['Child Immunization', 'Pediatric Pneumonia & Cough', 'Diarrhea & ORS Management', 'Growth Falters'],
      ta: ['குழந்தை தடுப்பூசி', 'குழந்தை நிமோனியா மற்றும் இருமல்', 'வயிற்றுப்போக்கு மற்றும் ORS மேலாண்மை', 'வளர்ச்சி குறைபாடு'],
      te: ['పిల్లల టీకాలు', 'పిల్లల న్యుమోనియా & దగ్గు', 'విరేచనాలు & ORS నిర్వహణ', 'ఎదుగుదల లోపాలు'],
      ml: ['കുട്ടികളുടെ വാക്സിനേഷൻ', 'ന്യുമോണിയയും ചുമയും', 'വയറിളക്കവും ഒ.ആർ.എസ് ചികിത്സയും', 'വളർച്ചാ നിരീക്ഷണം'],
      kn: ['ಮಕ್ಕಳ ಲಸಿಕೆಗಳು', 'ನ್ಯುಮೋನಿಯಾ ಮತ್ತು ಕೆಮ್ಮು', 'ಅತಿಸಾರ ಮತ್ತು ಒಆರ್‌ಎಸ್ ನಿರ್ವಹಣೆ', 'ಬೆಳವಣಿಗೆಯ ತಪಾಸಣೆ'],
      hi: ['बाल टीकाकरण', 'बाल निमोनिया एवं खांसी', 'दस्त एवं ओआरएस प्रबंधन', 'शारीरिक विकास निगरानी']
    },
    hospitalAffiliation: 'Mandya District Sub-Hospital',
    hospitalAffiliationI18n: {
      en: 'Mandya District Sub-Hospital',
      ta: 'மண்டியா மாவட்ட துணை மருத்துவமனை',
      te: 'మండ్య జిల్లా ఉప ఆసుపత్రి',
      ml: 'മാണ്ഡ്യ ജില്ലാ സബ് ആശുപത്രി',
      kn: 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಉಪ ಆಸ್ಪತ್ರೆ',
      hi: 'मांड्या जिला उप-अस्पताल'
    },
    opdTimings: 'Mon - Fri: 10:00 AM - 4:00 PM',
    opdTimingsI18n: {
      en: 'Mon - Fri: 10:00 AM - 4:00 PM',
      ta: 'திங்கள் - வெள்ளி: காலை 10:00 - மாலை 4:00',
      te: 'సోమ - శుక్ర: ఉదయం 10:00 - సాయంత్రం 4:00',
      ml: 'തിങ്കൾ - വെള്ളി: രാവിലെ 10:00 - വൈകുന്നേരം 4:00',
      kn: 'ಸೋಮ - ಶುಕ್ರ: ಬೆಳಗ್ಗೆ 10:00 - ಸಂಜೆ 4:00',
      hi: 'सोम - शुक्र: सुबह 10:00 - शाम 4:00'
    },
    education: 'MBBS, DCH (Pediatrics) - Fictional Rural Institute',
    educationI18n: {
      en: 'MBBS, DCH (Pediatrics)',
      ta: 'MBBS, DCH (குழந்தைகள் மருத்துவம்)',
      te: 'MBBS, DCH (పీడియాట్రిక్స్)',
      ml: 'MBBS, DCH (പീഡിയാട്രിക്സ്)',
      kn: 'MBBS, DCH (ಪೀಡಿಯಾಟ್ರಿಕ್ಸ್)',
      hi: 'एमबीबीएस, डीसीएच (बाल रोग)'
    },
    locationI18n: {
      en: 'Mandya District Centre',
      ta: 'மண்டியா மாவட்ட மையம்',
      te: 'మండ్య జిల్లా కేంద్రం',
      ml: 'മാണ്ഡ്യ ജില്ലാ കേന്ദ്രം',
      kn: 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಕೇಂದ್ರ',
      hi: 'मांड्या जिला केंद्र'
    }
  },
  {
    id: 'DOC-003',
    doctorId: 'DOC-003',
    name: 'Dr. Kavya Menon',
    nameI18n: {
      en: 'Dr. Kavya Menon',
      ta: 'டாக்டர் காவ்யா மேனன்',
      te: 'డాక్టర్ కావ్యా మీనన్',
      ml: 'ഡോ. കാവ്യ മേനോൻ',
      kn: 'ಡಾ. ಕಾವ್ಯಾ ಮೆನನ್',
      hi: 'डॉ. काव्या मेनन'
    },
    specialty: 'Gynecologist / Obstetrician',
    specialtyI18n: {
      en: 'Gynecologist / Obstetrician',
      ta: 'மகப்பேறு மற்றும் மகளிர் நல மருத்துவர்',
      te: 'ప్రసూతి మరియు స్త్రీ జననేంద్రియ నిపుణురాలు',
      ml: 'പ്രസവ-സ്ത്രീരോഗ വിദഗ്ദ്ധ',
      kn: 'ಪ್ರಸೂತಿ ಮತ್ತು ಸ್ತ್ರೀರೋಗ ತಜ್ಞರು',
      hi: 'प्रसूति एवं स्त्री रोग विशेषज्ञ'
    },
    departmentI18n: {
      en: 'Obstetrics, Gynecology & Maternal Welfare',
      ta: 'மகப்பேறியல், மகளிர் நலம் மற்றும் தாய்மை நலப்பிரிவு',
      te: 'ప్రసూతి, స్త్రీ జననేంద్రియ & మాతృ సంక్షేమ విభాగం',
      ml: 'ഒബ്സ്റ്റട്രിക്സ്, ഗൈനക്കോളജി & മാതൃക്ഷേമ വിഭാഗം',
      kn: 'ಪ್ರಸೂತಿ ಮತ್ತು ಸ್ತ್ರೀರೋಗ ವಿಭಾಗ',
      hi: 'प्रसूति, स्त्री रोग एवं मातृ कल्याण विभाग'
    },
    ruralCareFocus: 'Antenatal Care (ANC), High-Risk Pregnancy & Safe Delivery Planning',
    ruralCareFocusI18n: {
      en: 'Antenatal Care (ANC), High-Risk Pregnancy & Safe Delivery Planning',
      ta: 'கர்ப்பகால பராமரிப்பு (ANC), அதிக ஆபத்துள்ள கர்ப்பம் மற்றும் பாதுகாப்பான பிரசவ திட்டம்',
      te: 'ప్రసవ పూర్వ సంరక్షణ (ANC), అధిక ప్రమాదకర గర్భధారణ & సురక్షిత ప్రసవం',
      ml: 'ഗർഭകാല പരിചരണം (ANC), അതീവ ശ്രദ്ധ വേണ്ട പ്രസവങ്ങൾ, സുരക്ഷിത പ്രസവാസൂത്രണം',
      kn: 'ಪ್ರಸವಪೂರ್ವ ಆರೈಕೆ (ANC), ಅಧಿಕ ಅಪಾಯದ ಗರ್ಭಧಾರಣೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಹೆರಿಗೆ ಯೋಜನೆ',
      hi: 'प्रसवपूर्व देखभाल (एएनसी), उच्च जोखिम वाली गर्भावस्था एवं सुरक्षित प्रसव योजना'
    },
    experienceYears: 16,
    experienceI18n: {
      en: '16 Years Clinical Practice',
      ta: '16 ஆண்டுகள் மருத்துவ அனுபவம்',
      te: '16 సంవత్సరాల క్లినికల్ అనుభవం',
      ml: '16 വർഷത്തെ ക്ലിനിക്കൽ പരിചയം',
      kn: '16 ವರ್ಷಗಳ ವೈದ್ಯಕೀಯ ಅನುಭವ',
      hi: '16 वर्षों का चिकित्सीय अनुभव'
    },
    languages: ['Malayalam', 'Kannada', 'English'],
    languagesI18n: {
      en: 'Malayalam, Kannada, English',
      ta: 'மலையாளம், கன்னடம், ஆங்கிலம்',
      te: 'మలయాళం, కన్నడ, ఇంగ్లీష్',
      ml: 'മലയാളം, കന്നഡ, ഇംഗ്ലീഷ്',
      kn: 'ಮಲಯಾಳಂ, ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್',
      hi: 'मलयालम, कन्नड़, अंग्रेज़ी'
    },
    consultationType: 'Both',
    consultationTypeI18n: {
      en: 'Both (In-person & Teleconsultation)',
      ta: 'இரண்டும் (நேரில் & தொலைத்தொடர்பு)',
      te: 'రెండూ (ప్రత్యక్ష & టెలికన్సల్టేషన్)',
      ml: 'രണ്ടും (നേരിട്ടും ഫോൺ വഴിയും)',
      kn: 'ಎರಡೂ (ನೇರ & ಟೆಲಿಸಮಾಲೋಚನೆ)',
      hi: 'दोनों (प्रत्यक्ष एवं टेली-परामर्श)'
    },
    availabilityStatus: 'Available Today',
    availabilityStatusI18n: {
      en: 'Available Today',
      ta: 'இன்று கிடைக்கும்',
      te: 'ఈరోజు అందుబాటులో ఉన్నారు',
      ml: 'இന്ന് ലഭ്യമാണ്',
      kn: 'ಇಂದು ಲಭ್ಯವಿದ್ದಾರೆ',
      hi: 'आज उपलब्ध हैं'
    },
    isDemo: true,
    demoFee: 'Free (PMSMA Govt Scheme)',
    demoFeeI18n: {
      en: 'Free (PMSMA Govt Scheme)',
      ta: 'இலவசம் (பிரதான் மந்திரி சுரக்ஷித் மாத்ரித்வ அபியான் - PMSMA)',
      te: 'ఉచితం (పీఎంఎస్ఎంఏ ప్రభుత్వ పథకం)',
      ml: 'സൗജന്യം (പി.എം.എസ്.എം.എ സർക്കാർ പദ്ധതി)',
      kn: 'ಉಚಿತ (ಪಿಎಂಎಸ್‌ಎಂಎ ಸರ್ಕಾರಿ ಯೋಜನೆ)',
      hi: 'निःशुल्क (प्रधानमंत्री सुरक्षित मातृत्व अभियान - पीएमएसएमए)'
    },
    contactPhone: '+919800001003',
    shortBio: 'Fictional senior obstetrician passionate about reducing maternal mortality, treating gestational anemia, and preparing institutional birth plans.',
    shortBioI18n: {
      en: 'Fictional senior obstetrician passionate about reducing maternal mortality, treating gestational anemia, and preparing institutional birth plans.',
      ta: 'தாய்மார்கள் இறப்பை குறைப்பதிலும், கர்ப்பகால இரத்த சோகைக்கு சிகிச்சையளிப்பதிலும், அரசு மருத்துவமனை பிரசவத்தை உறுதி செய்வதிலும் அனுபவமிக்க மூத்த மகப்பேறு மருத்துவர்.',
      te: 'ప్రసూతి మరణాలను తగ్గించడం, గర్భధారణ రక్తహీనత నివారణ మరియు సురక్షిత కాన్పు ప్రణాళికలో అంకితభావం గల సీనియర్ వైద్యురాలు.',
      ml: 'മാതൃമരണ നിരക്ക് കുറയ്ക്കുന്നതിലും ഗർഭകാല അനീമിയ തടയുന്നതിലും സുരക്ഷിത ആശുപത്രി പ്രസവം ഉറപ്പാക്കുന്നതിലും വിദഗ്ദ്ധയായ സീനിയർ ഗൈനക്കോളജിസ്റ്റ്.',
      kn: 'ತಾಯಂದಿರ ಮರಣ ಪ್ರಮಾಣ ತಗ್ಗಿಸುವುದು, ಗರ್ಭಾವಸ್ಥೆಯ ರಕ್ತಹೀನತೆ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಹೆರಿಗೆ ಯೋಜನೆ ರೂಪಿಸುವಲ್ಲಿ ಹಿರಿಯ ತಜ್ಞರು.',
      hi: 'मातृ मृत्यु दर में कमी लाने, गर्भावधि एनीमिया का उपचार करने और संस्थागत सुरक्षित प्रसव सुनिश्चित करने में समर्पित वरिष्ठ स्त्री रोग विशेषज्ञ।'
    },
    areasOfCare: ['Trimester Checkups', 'Pre-Eclampsia Screening', 'Maternal Anemia', 'Postpartum Follow-up'],
    areasOfCareI18n: {
      en: ['Trimester Checkups', 'Pre-Eclampsia Screening', 'Maternal Anemia', 'Postpartum Follow-up'],
      ta: ['மும்மாத கர்ப்ப பரிசோதனை', 'ப்ரீ-எக்லாம்ப்சியா இரத்த அழுத்த ஆய்வு', 'கர்ப்பகால இரத்த சோகை', 'பிரசவத்திற்குப் பிந்தைய பராமரிப்பு'],
      te: ['త్రైమాసిక తనిఖీలు', 'ప్రీ-ఎక్లాంప్సియా స్క్రీనింగ్', 'గర్భిణీలలో రక్తహీనత', 'ప్రసవానంతర సంరక్షణ'],
      ml: ['ത്രൈമാസ പരിശോധനകൾ', 'പ്രീ-എക്ലാംസിയ പരിശോധന', 'ഗർഭകാല അനീമിയ', 'പ്രസവാനന്തര പരിചരണം'],
      kn: ['ತ್ರೈಮಾಸಿಕ ತಪಾಸಣೆ', 'ಪ್ರಿ-ಎಕ್ಲಾಂಪ್ಸಿಯಾ ಸ್ಕ್ರೀನಿಂಗ್', 'ತಾಯಂದಿರ ರಕ್ತಹೀನತೆ', 'ಹೆರಿಗೆಯ ನಂತರದ ಆರೈಕೆ'],
      hi: ['त्रैमासिक जांच', 'प्री-एक्लेमप्सिया स्क्रीनिंग', 'गर्भावस्था एनीमिया', 'प्रसवोत्तर देखभाल']
    },
    hospitalAffiliation: 'Shivajinagar Community Health Centre (CHC)',
    hospitalAffiliationI18n: {
      en: 'Shivajinagar Community Health Centre (CHC)',
      ta: 'சிவாஜிநகர் சமூக சுகாதார மையம் (CHC)',
      te: 'శివాజీనగర్ కమ్యూనిటీ హెల్త్ సెంటర్ (CHC)',
      ml: 'ശിവാജിനഗർ കമ്മ്യൂണിറ്റി ഹെൽത്ത് സെന്റർ (CHC)',
      kn: 'ಶಿವಾಜಿನಗರ ಸಮುದಾಯ ಆರೋಗ್ಯ ಕೇಂದ್ರ (CHC)',
      hi: 'शिवाजीनगर सामुदायिक स्वास्थ्य केंद्र (CHC)'
    },
    opdTimings: 'Tue, Thu, Sat: 9:30 AM - 3:30 PM',
    opdTimingsI18n: {
      en: 'Tue, Thu, Sat: 9:30 AM - 3:30 PM',
      ta: 'செவ்வாய், வியாழன், சனி: காலை 9:30 - மாலை 3:30',
      te: 'మంగళ, గురు, శని: ఉదయం 9:30 - మధ్యాహ్నం 3:30',
      ml: 'ചൊവ്വ, വ്യാഴം, ശനി: രാവിലെ 9:30 - ഉച്ചതിരിഞ്ഞ് 3:30',
      kn: 'ಮಂಗಳ, ಗುರು, ಶನಿ: ಬೆಳಗ್ಗೆ 9:30 - ಮಧ್ಯಾಹ್ನ 3:30',
      hi: 'मंगल, गुरु, शनि: सुबह 9:30 - दोपहर 3:30'
    },
    education: 'MBBS, MS (Obstetrics & Gynecology) - Fictional University',
    educationI18n: {
      en: 'MBBS, MS (Obstetrics & Gynecology)',
      ta: 'MBBS, MS (மகப்பேறு மற்றும் மகளிர் நலம்)',
      te: 'MBBS, MS (గైనకాలజీ & ప్రసూతి)',
      ml: 'MBBS, MS (ഗൈനക്കോളജി & ഒബ്സ്റ്റട്രിക്സ്)',
      kn: 'MBBS, MS (ಪ್ರಸೂತಿ ಮತ್ತು ಸ್ತ್ರೀರೋಗ)',
      hi: 'एमबीबीएस, एमएस (प्रसूति एवं स्त्री रोग)'
    },
    locationI18n: {
      en: 'Shivajinagar Block, Ward 4',
      ta: 'சிவாஜிநகர் பிளாக், வார்டு 4',
      te: 'శివాజీనగర్ బ్లాక్, వార్డు 4',
      ml: 'ശിവാജിനഗർ ബ്ലോക്ക്, വാർഡ് 4',
      kn: 'ಶಿವಾಜಿನಗರ ಬ್ಲಾಕ್, ವಾರ್ಡ್ 4',
      hi: 'शिवाजीनगर ब्लॉक, वार्ड 4'
    }
  },
  {
    id: 'DOC-004',
    doctorId: 'DOC-004',
    name: 'Dr. Rajesh Sharma',
    nameI18n: {
      en: 'Dr. Rajesh Sharma',
      ta: 'டாக்டர் ராஜேஷ் சர்மா',
      te: 'డాక్టర్ రాజేష్ శర్మ',
      ml: 'ഡോ. രാജേഷ് ശർമ്മ',
      kn: 'ಡಾ. ರಾಜೇಶ್ ಶರ್ಮಾ',
      hi: 'डॉ. राजेश शर्मा'
    },
    specialty: 'Pediatric Care',
    specialtyI18n: {
      en: 'Neonatal Care',
      ta: 'பிறந்த குழந்தை தீவிர சிகிச்சை நிபுணர்',
      te: 'నవజాత శిశు సంరక్షణ నిపుణుడు',
      ml: 'നവജാത ശിശു പരിചരണ വിദഗ്ദ്ധൻ',
      kn: 'ನವಜಾತ ಶಿಶು ಆರೈಕೆ ತಜ್ಞರು',
      hi: 'नवजात शिशु देखभाल विशेषज्ञ'
    },
    departmentI18n: {
      en: 'Special Newborn Care Unit (SNCU)',
      ta: 'சிறப்பு பிறந்த குழந்தை தீவிர சிகிச்சை பிரிவு (SNCU)',
      te: 'ప్రత్యేక నవజాత శిశు సంరక్షణ విభాగం (SNCU)',
      ml: 'സ്പെഷ്യൽ ന്യൂബോൺ കെയർ യൂണിറ്റ് (SNCU)',
      kn: 'ವಿಶೇಷ ನವಜಾತ ಶಿಶು ಆರೈಕೆ ಘಟಕ (SNCU)',
      hi: 'विशेष नवजात शिशु देखभाल इकाई (एसएनसीयू)'
    },
    ruralCareFocus: 'Neonatal Sepsis Detection, Kangaroo Mother Care & Low Birth Weight',
    ruralCareFocusI18n: {
      en: 'Neonatal Sepsis Detection, Kangaroo Mother Care & Low Birth Weight',
      ta: 'பிறந்த குழந்தை தொற்று கண்டறிதல், கங்காரு தாய் பராமரிப்பு மற்றும் குறைந்த எடை பிறப்பு',
      te: 'నవజాత శిశు ఇన్ఫెక్షన్ల గుర్తింపు, కంగారూ మదర్ కేర్ & తక్కువ బరువు శిశువుల సంరక్షణ',
      ml: 'നവജാത ശിശു അണുബാധ നിർണ്ണയം, കംഗാരു മദർ കെയർ, കുറഞ്ഞ ഭാരമുള്ള കുഞ്ഞുങ്ങളുടെ പരിചരണം',
      kn: 'ನವಜಾತ ಶಿಶುಗಳ ಸೋಂಕು ಪತ್ತೆ, ಕಾಂಗರೂ ಮದರ್ ಕೇರ್ ಮತ್ತು ಕಡಿಮೆ ತೂಕದ ಮಕ್ಕಳ ಆರೈಕೆ',
      hi: 'नवजात शिशु संक्रमण पहचान, कंगारू मदर केयर एवं कम वजन शिशु देखभाल'
    },
    experienceYears: 9,
    experienceI18n: {
      en: '9 Years Clinical Practice',
      ta: '9 ஆண்டுகள் மருத்துவ அனுபவம்',
      te: '9 సంవత్సరాల క్లినికల్ అనుభవం',
      ml: '9 വർഷത്തെ ക്ലിനിക്കൽ പരിചയം',
      kn: '9 ವರ್ಷಗಳ ವೈದ್ಯಕೀಯ ಅನುಭವ',
      hi: '9 वर्षों का चिकित्सीय अनुभव'
    },
    languages: ['Hindi', 'English'],
    languagesI18n: {
      en: 'Hindi, English',
      ta: 'இந்தி, ஆங்கிலம்',
      te: 'హిందీ, ఇంగ్లీష్',
      ml: 'ഹിന്ദി, ഇംഗ്ലീഷ്',
      kn: 'ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್',
      hi: 'हिन्दी, अंग्रेज़ी'
    },
    consultationType: 'Teleconsultation',
    consultationTypeI18n: {
      en: 'Teleconsultation',
      ta: 'தொலைத்தொடர்பு மருத்துவ ஆலோசனை',
      te: 'టెలికన్సల్టేషన్ (ఫోన్/వీడియో)',
      ml: 'ടെലികൺസൾട്ടേഷൻ',
      kn: 'ಟೆಲಿಸಮಾಲೋಚನೆ',
      hi: 'टेली-परामर्श'
    },
    availabilityStatus: 'Next Available: Tomorrow',
    availabilityStatusI18n: {
      en: 'Next Available: Tomorrow',
      ta: 'அடுத்த சந்திப்பு: நாளை',
      te: 'తదుపరి అందుబాటు: రేపు',
      ml: 'അടുത്തത് ലഭ്യമാകുന്നത്: നാളെ',
      kn: 'ಮುಂದಿನ ಲಭ್ಯತೆ: ನಾಳೆ',
      hi: 'अगली उपलब्धता: कल'
    },
    isDemo: true,
    demoFee: 'Free (Govt HBNC Programme)',
    demoFeeI18n: {
      en: 'Free (Govt HBNC Programme)',
      ta: 'இலவசம் (அரசு இல்லம் சார்ந்த பிறந்த குழந்தை பராமரிப்பு HBNC)',
      te: 'ఉచితం (ప్రభుత్వ గృహ ఆధారిత నవజాత శిశు సంరక్షణ HBNC)',
      ml: 'സൗജന്യം (സർക്കാർ എച്ച്.ബി.എൻ.സി പദ്ധതി)',
      kn: 'ಉಚಿತ (ಸರ್ಕಾರಿ ಎಚ್‌ಬಿಎನ್‌ಸಿ ಯೋಜನೆ)',
      hi: 'निःशुल्क (सरकारी गृह आधारित नवजात शिशु देखभाल - एचबीएनसी)'
    },
    contactPhone: '+919800001004',
    shortBio: 'Fictional neonatal specialist supporting village ASHA workers in identifying newborn danger signs, hypothermia prevention, and neonatal jaundice.',
    shortBioI18n: {
      en: 'Fictional neonatal specialist supporting village ASHA workers in identifying newborn danger signs, hypothermia prevention, and neonatal jaundice.',
      ta: 'கிராமப்புற ஆஷா பணியாளர்களுக்கு வழிகாட்டி, பிறந்த குழந்தைகளுக்கான ஆபத்து அறிகுறிகள், உடல் குளிர்ச்சி தடுப்பு மற்றும் பச்சிளங்குழந்தை மஞ்சள் காமாலை சிகிச்சையில் உதவும் சிறப்பு மருத்துவர்.',
      te: 'గ్రామ ఆశా కార్యకర్తలకు మార్గదర్శనం చేస్తూ, నవజాత శిశువుల ప్రమాద సంకేతాలను గుర్తించడం, శరీర ఉష్ణోగ్రత కాపాడటం మరియు పచ్చకామెర్ల నివారణలో నిపుణుడు.',
      ml: 'ഗ്രാമങ്ങളിലെ ആശാ പ്രവർത്തകരെ സഹായിച്ച് നവജാത ശിശുക്കളുടെ അപായ ലക്ഷണങ്ങൾ കണ്ടെത്താനും മഞ്ഞപ്പിത്തം പ്രതിരോധിക്കാനും നേതൃത്വം നൽകുന്ന ശിശു വിദഗ്ദ്ധൻ.',
      kn: 'ಗ್ರಾಮೀಣ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರಿಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ, ನವಜಾತ ಶಿಶುಗಳ ಅಪಾಯದ ಲಕ್ಷಣಗಳು ಮತ್ತು ಕಾಮಾಲೆ ತಡೆಗಟ್ಟುವಲ್ಲಿ ಶ್ರಮಿಸುವ ತಜ್ಞರು.',
      hi: 'ग्रामीण आशा कार्यकर्ताओं का मार्गदर्शन करते हुए नवजात शिशु के खतरे के संकेतों की पहचान, हाइपोथर्मिया रोकथाम और पीलिया उपचार में विशेषज्ञ।'
    },
    areasOfCare: ['Newborn Danger Signs', 'Low Birth Weight Care', 'Umbilical Sepsis', 'Neonatal Jaundice'],
    areasOfCareI18n: {
      en: ['Newborn Danger Signs', 'Low Birth Weight Care', 'Umbilical Sepsis', 'Neonatal Jaundice'],
      ta: ['பிறந்த குழந்தை ஆபத்து அறிகுறிகள்', 'குறைந்த எடை குழந்தை பராமரிப்பு', 'தொப்புள் கொடி தொற்று', 'பச்சிளங்குழந்தை மஞ்சள் காமாலை'],
      te: ['నవజాత శిశు ప్రమాద సంకేతాలు', 'తక్కువ బరువు శిశు సంరక్షణ', 'బొడ్డు ఇన్ఫెక్షన్', 'నవజాత శిశు కామెర్లు'],
      ml: ['നവജാത ശിശു അപായ ലക്ഷണങ്ങൾ', 'കുറഞ്ഞ ഭാരമുള്ള കുഞ്ഞുങ്ങളുടെ പരിചരണം', 'പൊക്കിൾക്കൊടി അണുബാധ', 'നവജാത മഞ്ഞപ്പിത്തം'],
      kn: ['ನವಜಾತ ಶಿಶು ಅಪಾಯ ಲಕ್ಷಣಗಳು', 'ಕಡಿಮೆ ತೂಕದ ಮಕ್ಕಳ ಆರೈಕೆ', 'ಹೊಕ್ಕುಳು ಬಳ್ಳಿ ಸೋಂಕು', 'ಶಿಶು ಕಾಮಾಲೆ'],
      hi: ['नवजात शिशु खतरे के संकेत', 'कम वजन शिशु देखभाल', 'नाल संक्रमण', 'नवजात शिशु पीलिया']
    },
    hospitalAffiliation: 'Special Newborn Care Unit (SNCU) Mandya',
    hospitalAffiliationI18n: {
      en: 'Special Newborn Care Unit (SNCU) Mandya',
      ta: 'மண்டியா சிறப்பு பிறந்த குழந்தை பராமரிப்பு பிரிவு (SNCU)',
      te: 'మండ్య ప్రత్యేక నవజాత శిశు సంరక్షణ విభాగం (SNCU)',
      ml: 'മാണ്ഡ്യ സ്പെഷ്യൽ ന്യൂബോൺ കെയർ യൂണിറ്റ് (SNCU)',
      kn: 'ಮಂಡ್ಯ ವಿಶೇಷ ನವಜಾತ ಶಿಶು ಆರೈಕೆ ಘಟಕ (SNCU)',
      hi: 'विशेष नवजात शिशु देखभाल इकाई (एसएनसीयू) मांड्या'
    },
    opdTimings: 'Mon - Sat: 8:00 AM - 1:00 PM',
    opdTimingsI18n: {
      en: 'Mon - Sat: 8:00 AM - 1:00 PM',
      ta: 'திங்கள் - சனி: காலை 8:00 - மதியம் 1:00',
      te: 'సోమ - శని: ఉదయం 8:00 - మధ్యాహ్నం 1:00',
      ml: 'തിങ്കൾ - ശനി: രാവിലെ 8:00 - ഉച്ചയ്ക്ക് 1:00',
      kn: 'ಸೋಮ - ಶನಿ: ಬೆಳಗ್ಗೆ 8:00 - ಮಧ್ಯಾಹ್ನ 1:00',
      hi: 'सोम - शनि: सुबह 8:00 - दोपहर 1:00'
    },
    education: 'MBBS, MD (Pediatrics), Fellowship in Neonatology - Fictional',
    educationI18n: {
      en: 'MBBS, MD (Pediatrics), Fellowship in Neonatology',
      ta: 'MBBS, MD (குழந்தைகள் நலம்), பிறந்த குழந்தை சிகிச்சை சிறப்பு பயிற்சி',
      te: 'MBBS, MD (పీడియాట్రిక్స్), నియోనాటాలజీ ఫెలోషిప్',
      ml: 'MBBS, MD (പീഡിയാട്രിക്സ്), നിയോനറ്റോളജി ഫെലോഷിപ്പ്',
      kn: 'MBBS, MD (ಪೀಡಿಯಾಟ್ರಿಕ್ಸ್), ನಿಯೋನೇಟಾಲಜಿ ಫೆಲೋಶಿಪ್',
      hi: 'एमबीबीएस, एमडी (बाल रोग), नियोनेटोलॉजी फेलोशिप'
    },
    locationI18n: {
      en: 'Mandya SNCU Hospital Complex',
      ta: 'மண்டியா SNCU மருத்துவ வளாகம்',
      te: 'మండ్య SNCU ఆసుపత్రి కాంప్లెక్స్',
      ml: 'മാണ്ഡ്യ എസ്.എൻ.സി.യു ആശുപത്രി സമുച്ചയം',
      kn: 'ಮಂಡ್ಯ ಎಸ್‌ಎನ್‌ಸಿಯು ಆಸ್ಪತ್ರೆ ಸಂಕೀರ್ಣ',
      hi: 'मांड्या एसएनसीयू अस्पताल परिसर'
    }
  },
  {
    id: 'DOC-005',
    doctorId: 'DOC-005',
    name: 'Dr. Anandhi Raman',
    nameI18n: {
      en: 'Dr. Anandhi Raman',
      ta: 'டாக்டர் ஆனந்தி ராமன்',
      te: 'డాక్టర్ ఆనంది రామన్',
      ml: 'ഡോ. ആനന്ദി രാമൻ',
      kn: 'ಡಾ. ಆನಂದಿ ರಾಮನ್',
      hi: 'डॉ. आनंदी रामन'
    },
    specialty: 'Geriatric Care',
    specialtyI18n: {
      en: 'Geriatric Care',
      ta: 'முதியோர் நல சிறப்பு மருத்துவர்',
      te: 'వృద్ధాప్య సంరక్షణ నిపుణురాలు',
      ml: 'വയോജന ചികിത്സാ വിദഗ്ദ്ധ',
      kn: 'ಹಿರಿಯ ನಾಗರಿಕರ ಆರೈಕೆ ತಜ್ಞರು',
      hi: 'वृद्धजन चिकित्सा विशेषज्ञ'
    },
    departmentI18n: {
      en: 'Geriatric Medicine & Elder Wellness',
      ta: 'முதியோர் மருத்துவம் மற்றும் மூத்தோர் நலம்',
      te: 'వృద్ధాప్య వైద్యం & సంక్షేమ విభాగం',
      ml: 'ജെറിയാട്രിക് മെഡിസിൻ & വയോജന ക്ഷേമം',
      kn: 'ಹಿರಿಯರ ಆರೋಗ್ಯ ವಿಭಾಗ',
      hi: 'वृद्धजन चिकित्सा एवं आरोग्य विभाग'
    },
    ruralCareFocus: 'Elderly Mobility, Polypharmacy Reviews & Fall Prevention',
    ruralCareFocusI18n: {
      en: 'Elderly Mobility, Polypharmacy Reviews & Fall Prevention',
      ta: 'முதியோர் நடமாட்ட ஆரோக்கியம், அதிக மருந்து பயன்பாட்டு ஆய்வு மற்றும் கீழே விழுதல் தடுப்பு',
      te: 'వృద్ధుల కదలికల ఆరోగ్యం, అధిక మందుల వాడకం సమీక్ష & పడిపోవడం నివారణ',
      ml: 'മുതിർന്നവരുടെ ചലനശേഷി, അമിത മരുന്ന് ഉപയോഗ പരിശോധന, വീഴ്ച തടയൽ',
      kn: 'ಹಿರಿಯರ ಚಲನಶೀಲತೆ, ಔಷಧಿ ಪರಿಶೀಲನೆ ಮತ್ತು ಬೀಳುವಿಕೆ ತಡೆಗಟ್ಟುವಿಕೆ',
      hi: 'वृद्धजन गतिशीलता, अत्यधिक दवा समीक्षा एवं गिरकर चोट लगने की रोकथाम'
    },
    experienceYears: 20,
    experienceI18n: {
      en: '20 Years Clinical Practice',
      ta: '20 ஆண்டுகள் மருத்துவ அனுபவம்',
      te: '20 సంవత్సరాల క్లినికల్ అనుభవం',
      ml: '20 വർഷത്തെ ക്ലിനിക്കൽ പരിചയം',
      kn: '20 ವರ್ಷಗಳ ವೈದ್ಯಕೀಯ ಅನುಭವ',
      hi: '20 वर्षों का चिकित्सीय अनुभव'
    },
    languages: ['Tamil', 'Kannada', 'English'],
    languagesI18n: {
      en: 'Tamil, Kannada, English',
      ta: 'தமிழ், கன்னடம், ஆங்கிலம்',
      te: 'తమిళం, కన్నడ, ఇంగ్లీష్',
      ml: 'തമിഴ്, കന്നഡ, ഇംഗ്ലീഷ്',
      kn: 'ತಮಿಳು, ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್',
      hi: 'तमिल, कन्नड़, अंग्रेज़ी'
    },
    consultationType: 'Both',
    consultationTypeI18n: {
      en: 'Both (In-person & Teleconsultation)',
      ta: 'இரண்டும் (நேரில் & தொலைத்தொடர்பு)',
      te: 'రెండూ (ప్రత్యక్ష & టెలికన్సల్టేషన్)',
      ml: 'രണ്ടും (നേരിട്ടും ഫോൺ വഴിയും)',
      kn: 'ಎರಡೂ (ನೇರ & ಟೆಲಿಸಮಾಲೋಚನೆ)',
      hi: 'दोनों (प्रत्यक्ष एवं टेली-परामर्श)'
    },
    availabilityStatus: 'Visiting Days: Mon/Wed/Fri',
    availabilityStatusI18n: {
      en: 'Visiting Days: Mon/Wed/Fri',
      ta: 'வருகை நாட்கள்: திங்கள்/புதன்/வெள்ளி',
      te: 'సందర్శన రోజులు: సోమ/బుధ/శుక్ర',
      ml: 'സന്ദർശന ദിവസങ്ങൾ: തിങ്കൾ/ബുധൻ/വെള്ളി',
      kn: 'ಸಂದರ್ಶನ ದಿನಗಳು: ಸೋಮ/ಬುಧ/ಶುಕ್ರ',
      hi: 'परामर्श दिवस: सोम/बुध/शुक्र'
    },
    isDemo: true,
    demoFee: 'Free (Senior Citizen Clinic)',
    demoFeeI18n: {
      en: 'Free (Senior Citizen Clinic)',
      ta: 'இலவசம் (மூத்த குடிமக்கள் சிறப்பு மருத்துவ சேவை)',
      te: 'ఉచితం (సీనియర్ సిటిజన్ ఉచిత క్లినిక్)',
      ml: 'സൗജന്യം (വയോജന സൗജന്യ ക്ലിനിക്)',
      kn: 'ಉಚಿತ (ಹಿರಿಯ ನಾಗರಿಕರ ಚಿಕಿತ್ಸಾಲಯ)',
      hi: 'निःशुल्क (वरिष्ठ नागरिक स्वास्थ्य क्लिनिक)'
    },
    contactPhone: '+919800001005',
    shortBio: 'Fictional geriatrician experienced in multi-morbidity in rural elders, joint pain, osteoporosis, memory care, and simplifying daily medication regimens.',
    shortBioI18n: {
      en: 'Fictional geriatrician experienced in multi-morbidity in rural elders, joint pain, osteoporosis, memory care, and simplifying daily medication regimens.',
      ta: 'கிராமப்புற முதியோர்களுக்கான மூட்டு வலி, எலும்பு தேய்மானம், ஞாபக மறதி மற்றும் தினசரி மாத்திரைகளை எளிமைப்படுத்துவதில் 20 ஆண்டுகால அனுபவம் கொண்ட சிறப்பு மருத்துவர்.',
      te: 'గ్రామీణ వృద్ధులలో కీళ్ల నొప్పులు, ఎముకల బలహీనత, జ్ఞాపకశక్తి సమస్యలు మరియు రోజువారీ మందుల భారాన్ని తగ్గించడంలో 20 ఏళ్ల విశేష అనుభవం గల వైద్యురాలు.',
      ml: 'ഗ്രാമീണ വയോജനങ്ങളിലെ സന്ധിവാതം, അസ്ഥിക്ഷയം, ഓർമ്മക്കുറവ് എന്നിവ ചികിത്സിക്കുന്നതിലും ദിവസേനയുള്ള മരുന്നുകൾ ക്രമീകരിക്കുന്നതിലും 20 വർഷത്തെ പരിചയസമ്പന്നയായ ഡോക്ടർ.',
      kn: 'ಗ್ರಾಮೀಣ ಹಿರಿಯರಲ್ಲಿ ಕೀಲು ನೋವು, ಮೂಳೆ ಸವೆತ, ಮರೆಗುಳಿತನ ಮತ್ತು ದೈನಂದಿನ ಔಷಧಿ ಸರಳೀಕರಣದಲ್ಲಿ 20 ವರ್ಷಗಳ ಅಪಾರ ಅನುಭವ ಹೊಂದಿರುವ ತಜ್ಞರು.',
      hi: 'ग्रामीण बुजुर्गों में जोड़ों के दर्द, ऑस्टियोपोरोसिस, स्मृति लोप और दैनिक दवाओं को सरल बनाने में 20 वर्षों के अनुभव से युक्त विशेषज्ञ।'
    },
    areasOfCare: ['Fall Risk Assessment', 'Joint Arthritis & Pain', 'Medication Safety', 'Dementia Screening'],
    areasOfCareI18n: {
      en: ['Fall Risk Assessment', 'Joint Arthritis & Pain', 'Medication Safety', 'Dementia Screening'],
      ta: ['கீழே விழும் ஆபத்து ஆய்வு', 'மூட்டுவலி மற்றும் எலும்பு அழற்சி', 'மருந்து பாதுகாப்பு வழிகாட்டல்', 'ஞாபக மறதி பரிசோதனை'],
      te: ['పడిపోయే ప్రమాద అంచనా', 'కీళ్ల నొప్పులు & ఆర్థరైటిస్', 'మందుల భద్రత', 'మతిమరుపు స్క్రీనింగ్'],
      ml: ['വീഴ്ചാ സാധ്യത വിലയിരുത്തൽ', 'സന്ധിവാതവും വേദനയും', 'മരുന്ന് സുരക്ഷ', 'ഡിമെൻഷ്യ സ്ക്രീനിംഗ്'],
      kn: ['ಬೀಳುವ ಅಪಾಯದ ಮೌಲ್ಯಮಾಪನ', 'ಕೀಲು ನೋವು ಮತ್ತು ಸಂಧಿವಾತ', 'ಔಷಧ ಸುರಕ್ಷತೆ', 'ಬುದ್ಧಿಮಾಂದ್ಯತೆ ತಪಾಸಣೆ'],
      hi: ['गिरने के जोखिम का मूल्यांकन', 'जोड़ों का दर्द एवं गठिया', 'दवा सुरक्षा समीक्षा', 'स्मृति लोप जांच']
    },
    hospitalAffiliation: 'Rampur PHC Mobile Elderly Outreach',
    hospitalAffiliationI18n: {
      en: 'Rampur PHC Mobile Elderly Outreach',
      ta: 'ராம்பூர் நடமாடும் முதியோர் மருத்துவ பிரிவு (PHC)',
      te: 'రాంపూర్ మొబైల్ వృద్ధుల ఆరోగ్య కేంద్రం (PHC)',
      ml: 'രാംപൂർ മൊബൈൽ വയോജന ക്ലിനിക്ക് (PHC)',
      kn: 'ರಾಂಪುರ ಮೊಬೈಲ್ ಹಿರಿಯರ ಆರೋಗ್ಯ ಘಟಕ (PHC)',
      hi: 'रामपुर मोबाइल वृद्धजन स्वास्थ्य सेवा (PHC)'
    },
    opdTimings: 'Mon, Wed, Fri: 10:00 AM - 2:00 PM',
    opdTimingsI18n: {
      en: 'Mon, Wed, Fri: 10:00 AM - 2:00 PM',
      ta: 'திங்கள், புதன், வெள்ளி: காலை 10:00 - மதியம் 2:00',
      te: 'సోమ, బుధ, శుక్ర: ఉదయం 10:00 - మధ్యాహ్నం 2:00',
      ml: 'തിങ്കൾ, ബുധൻ, വെള്ളി: രാവിലെ 10:00 - ഉച്ചയ്ക്ക് 2:00',
      kn: 'ಸೋಮ, ಬುಧ, ಶುಕ್ರ: ಬೆಳಗ್ಗೆ 10:00 - ಮಧ್ಯಾಹ್ನ 2:00',
      hi: 'सोम, बुध, शुक्र: सुबह 10:00 - दोपहर 2:00'
    },
    education: 'MBBS, MD (Geriatric Medicine) - Fictional College of Physicians',
    educationI18n: {
      en: 'MBBS, MD (Geriatric Medicine)',
      ta: 'MBBS, MD (முதியோர் நலம் மற்றும் மருத்துவம்)',
      te: 'MBBS, MD (జెరియాట్రిక్ మెడిసిన్)',
      ml: 'MBBS, MD (ജെറിയാട്രിക് മെഡിസിൻ)',
      kn: 'MBBS, MD (ಜೆರಿಯಾಟ್ರಿಕ್ ಮೆಡಿಸಿನ್)',
      hi: 'एमबीबीएस, एमडी (वृद्धजन चिकित्सा)'
    },
    locationI18n: {
      en: 'Rampur Mobile Outreach Base',
      ta: 'ராம்பூர் நடமாடும் மருத்துவ தளம்',
      te: 'రాంపూర్ మొబైల్ ఔట్‌రీచ్ బేస్',
      ml: 'രാംപൂർ മൊബൈൽ ഔട്ട്റീച്ച് കേന്ദ്രം',
      kn: 'ರಾಂಪುರ ಮೊಬೈಲ್ ಆರೋಗ್ಯ ಕೇಂದ್ರ',
      hi: 'रामपुर मोबाइल स्वास्थ्य सेवा केंद्र'
    }
  },
  {
    id: 'DOC-006',
    doctorId: 'DOC-006',
    name: 'Dr. Suresh Gowda',
    nameI18n: {
      en: 'Dr. Suresh Gowda',
      ta: 'டாக்டர் சுரேஷ் கவுடா',
      te: 'డాక్టర్ సురేష్ గౌడ',
      ml: 'ഡോ. സുരേഷ് ഗൗഡ',
      kn: 'ಡಾ. ಸುರೇಶ್ ಗೌಡ',
      hi: 'डॉ. सुरेश गौड़ा'
    },
    specialty: 'Diabetologist',
    specialtyI18n: {
      en: 'Diabetologist',
      ta: 'சர்க்கரை நோய் சிறப்பு மருத்துவர்',
      te: 'మధుమేహ నిపుణుడు',
      ml: 'പ്രമേഹ രോഗ വിദഗ്ദ്ധൻ',
      kn: 'ಮಧುಮೇಹ ತಜ್ಞರು',
      hi: 'मधुमेह रोग विशेषज्ञ'
    },
    departmentI18n: {
      en: 'Non-Communicable Diseases (NCD) & Diabetes Centre',
      ta: 'தொற்றா நோய்கள் மற்றும் நீரிழிவு மருத்துவ மையம்',
      te: 'నాన్-కమ్యూనికబుల్ డిసీజెస్ & మధుమేహ కేంద్రం',
      ml: 'എൻ.സി.ഡി ആന്റ് ഡയബറ്റിസ് സെന്റർ',
      kn: 'ಸಾಂಕ್ರಾಮಿಕವಲ್ಲದ ರೋಗಗಳು ಮತ್ತು ಮಧುಮೇಹ ವಿಭಾಗ',
      hi: 'गैर-संचारी रोग (एनसीडी) एवं मधुमेह केंद्र'
    },
    ruralCareFocus: 'Rural Diabetes Control, Diabetic Foot Prevention & Diet Guidance',
    ruralCareFocusI18n: {
      en: 'Rural Diabetes Control, Diabetic Foot Prevention & Diet Guidance',
      ta: 'கிராமப்புற சர்க்கரை நோய் கட்டுப்பாடு, பாத புண்கள் தடுப்பு மற்றும் உணவு வழிகாட்டல்',
      te: 'గ్రామీణ మధుమేహ నియంత్రణ, డయాబెటిక్ ఫుట్ నివారణ & ఆహార సలహాలు',
      ml: 'ഗ്രാമീണ പ്രമേഹ നിയന്ത്രണം, ഡയബറ്റിക് ഫൂട്ട് പ്രതിരോധം, ഭക്ഷണ ക്രമം',
      kn: 'ಗ್ರಾಮೀಣ ಮಧುಮೇಹ ನಿಯಂತ್ರಣ, ಮಧುಮೇಹಿ ಪಾದದ ಗಾಯಗಳ ತಡೆ ಮತ್ತು ಆಹಾರ ಮಾರ್ಗದರ್ಶನ',
      hi: 'ग्रामीण मधुमेह नियंत्रण, डायबिटिक फुट रोकथाम एवं आहार मार्गदर्शन'
    },
    experienceYears: 13,
    experienceI18n: {
      en: '13 Years Clinical Practice',
      ta: '13 ஆண்டுகள் மருத்துவ அனுபவம்',
      te: '13 సంవత్సరాల క్లినికల్ అనుభవం',
      ml: '13 വർഷത്തെ ക്ലിനിക്കൽ പരിചയം',
      kn: '13 ವರ್ಷಗಳ ವೈದ್ಯಕೀಯ ಅನುಭವ',
      hi: '13 वर्षों का चिकित्सीय अनुभव'
    },
    languages: ['Kannada', 'Telugu', 'English'],
    languagesI18n: {
      en: 'Kannada, Telugu, English',
      ta: 'கன்னடம், தெலுங்கு, ஆங்கிலம்',
      te: 'కన్నడ, తెలుగు, ఇంగ్లీష్',
      ml: 'കന്നഡ, തെലുങ്ക്, ഇംഗ്ലീഷ്',
      kn: 'ಕನ್ನಡ, ತೆಲುಗು, ಇಂಗ್ಲಿಷ್',
      hi: 'कन्नड़, तेलुगु, अंग्रेज़ी'
    },
    consultationType: 'Both',
    consultationTypeI18n: {
      en: 'Both (In-person & Teleconsultation)',
      ta: 'இரண்டும் (நேரில் & தொலைத்தொடர்பு)',
      te: 'రెండూ (ప్రత్యక్ష & టెలికன்సల్టేషన్)',
      ml: 'രണ്ടും (നേരിട്ടും ഫോൺ വഴിയും)',
      kn: 'ಎರಡೂ (ನೇರ & ಟೆಲಿಸಮಾಲೋಚನೆ)',
      hi: 'दोनों (प्रत्यक्ष एवं टेली-परामर्श)'
    },
    availabilityStatus: 'Available Today',
    availabilityStatusI18n: {
      en: 'Available Today',
      ta: 'இன்று கிடைக்கும்',
      te: 'ఈరోజు అందుబాటులో ఉన్నారు',
      ml: 'இന്ന് ലഭ്യമാണ്',
      kn: 'ಇಂದು ಲಭ್ಯವಿದ್ದಾರೆ',
      hi: 'आज उपलब्ध हैं'
    },
    isDemo: true,
    demoFee: 'Free (NCD Clinic Ayushman)',
    demoFeeI18n: {
      en: 'Free (NCD Clinic Ayushman)',
      ta: 'இலவசம் (தொற்றா நோய் ஆயுஷ்மான் கிளினிக்)',
      te: 'ఉచితం (ఎన్‌సీడీ ఆయుష్మాన్ క్లినిక్)',
      ml: 'സൗജന്യം (ആയുഷ്മാൻ എൻ.സി.ഡി ക്ലിനിക്)',
      kn: 'ಉಚಿತ (ಎನ್‌ಸಿಡಿ ಆಯುಷ್ಮಾನ್ ಕ್ಲಿನಿಕ್)',
      hi: 'निःशुल्क (एनसीडी क्लिनिक आयुष्मान)'
    },
    contactPhone: '+919800001006',
    shortBio: 'Fictional metabolic specialist managing Type 2 diabetes among agricultural workers, preventing hypoglycemia, and monitoring HbA1c in rural centres.',
    shortBioI18n: {
      en: 'Fictional metabolic specialist managing Type 2 diabetes among agricultural workers, preventing hypoglycemia, and monitoring HbA1c in rural centres.',
      ta: 'விவசாய தொழிலாளர்களிடையே டைப் 2 நீரிழிவு மேலாண்மை, திடீர் சர்க்கரை குறைவு தடுப்பு மற்றும் தொடர் HbA1c பரிசோதனை வழிகாட்டும் சிறப்பு மருத்துவர்.',
      te: 'రైతులలో టైప్ 2 మధుమేహ నియంత్రణ, తక్కువ చక్కెర నివారణ మరియు గ్రామీణ కేంద్రాలలో HbA1c పర్యవేక్షణలో నిపుణుడు.',
      ml: 'കർഷകരിലെ ടൈപ്പ് 2 പ്രമേഹം നിയന്ത്രിക്കാനും രക്തത്തിലെ പഞ്ചസാര പെട്ടെന്ന് കുറയുന്നത് തടയാനും എച്ച്.ബി.എ.1സി പരിശോധനകൾക്കും നേതൃത്വം നൽകുന്ന ഡോക്ടർ.',
      kn: 'ಕೃಷಿ ಕಾರ್ಮಿಕರಲ್ಲಿ ಟೈಪ್ 2 ಮಧುಮೇಹ ನಿರ್ವಹಣೆ, ಹೈಪೊಗ್ಲಿಸಿಮಿಯಾ ತಡೆ ಮತ್ತು ಗ್ರಾಮೀಣ ಮಟ್ಟದಲ್ಲಿ ಎಚ್‌ಬಿಎ1ಸಿ ತಪಾಸಣೆಯಲ್ಲಿ ನುರಿತ ತಜ್ಞರು.',
      hi: 'कृषि श्रमिकों में टाइप 2 मधुमेह नियंत्रण, हाइपोग्लाइसीमिया की रोकथाम और ग्रामीण केंद्रों में एचबीए1सी की निरंतर निगरानी में विशेषज्ञ।'
    },
    areasOfCare: ['Blood Sugar Control', 'Diabetic Neuropathy', 'Insulin & Metformin Support', 'Kidney Screening'],
    areasOfCareI18n: {
      en: ['Blood Sugar Control', 'Diabetic Neuropathy', 'Insulin & Metformin Support', 'Kidney Screening'],
      ta: ['இரத்த சர்க்கரை கட்டுப்பாடு', 'நீரிழிவு நரம்பு பாதிப்பு', 'இன்சுலின் மற்றும் மருந்து ஆதரவு', 'சிறுநீரக பாதுகாப்பு ஆய்வு'],
      te: ['రక్తంలో చక్కెర నియంత్రణ', 'డయాబెటిక్ న్యూరోపతి', 'ఇన్సులిన్ & మెట్‌ఫార్మిన్ మద్దతు', 'కిడ్నీ స్క్రీనింగ్'],
      ml: ['രക്തത്തിലെ പഞ്ചസാര നിയന്ത്രണം', 'ഡയബറ്റിക് ന്യൂറോപ്പതി', 'ഇൻസുലിൻ പിന്തുണ', 'വൃക്ക പരിശോധന'],
      kn: ['ರಕ್ತದ ಸಕ್ಕರೆ ನಿಯಂತ್ರಣ', 'ಮಧುಮೇಹ ನರರೋಗ', 'ಇನ್ಸುಲಿನ್ ಬೆಂಬಲ', 'ಮೂತ್ರಪಿಂಡ ತಪಾಸಣೆ'],
      hi: ['रक्त शर्करा नियंत्रण', 'डायबिटिक न्यूरोपैथी', 'इंसुलिन एवं दवा परामर्श', 'गुर्दा जांच']
    },
    hospitalAffiliation: 'Mandya District Non-Communicable Disease (NCD) Centre',
    hospitalAffiliationI18n: {
      en: 'Mandya District NCD Centre',
      ta: 'மண்டியா மாவட்ட தொற்றா நோய் (NCD) மையம்',
      te: 'మండ్య జిల్లా ఎన్‌సీడీ కేంద్రం',
      ml: 'മാണ്ഡ്യ ജില്ലാ എൻ.സി.ഡി സെന്റർ',
      kn: 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಎನ್‌ಸಿಡಿ ಕೇಂದ್ರ',
      hi: 'मांड्या जिला गैर-संचारी रोग (एनसीडी) केंद्र'
    },
    opdTimings: 'Mon - Sat: 9:00 AM - 3:00 PM',
    opdTimingsI18n: {
      en: 'Mon - Sat: 9:00 AM - 3:00 PM',
      ta: 'திங்கள் - சனி: காலை 9:00 - மதியம் 3:00',
      te: 'సోమ - శని: ఉదయం 9:00 - మధ్యాహ్నం 3:00',
      ml: 'തിങ്കൾ - ശനി: രാവിലെ 9:00 - ഉച്ചയ്ക്ക് 3:00',
      kn: 'ಸೋಮ - ಶನಿ: ಬೆಳಗ್ಗೆ 9:00 - ಮಧ್ಯಾಹ್ನ 3:00',
      hi: 'सोम - शनि: सुबह 9:00 - दोपहर 3:00'
    },
    education: 'MBBS, PG Diploma in Diabetology (DFM) - Fictional',
    educationI18n: {
      en: 'MBBS, PG Diploma in Diabetology',
      ta: 'MBBS, முதுகலை சர்க்கரை நோய் மருத்துவ பட்டயம்',
      te: 'MBBS, పీజీ డిప్లొమా ఇన్ డయాబెటాలజీ',
      ml: 'MBBS, പി.ജി ഡിപ്ലോമ ഇൻ ഡയബറ്റോളജി',
      kn: 'MBBS, ಡಯಾಬಿಟಾಲಜಿ ಪಿಜಿ ಡಿಪ್ಲೋಮಾ',
      hi: 'एमबीबीएस, पीजी डिप्लोमा इन डायबेटोलॉजी'
    },
    locationI18n: {
      en: 'Mandya District Hospital NCD Wing',
      ta: 'மண்டியா மாவட்ட மருத்துவமனை NCD பிரிவு',
      te: 'మండ్య జిల్లా ఆసుపత్రి ఎన్‌సీడీ విభాగం',
      ml: 'മാണ്ഡ്യ ജില്ലാ ആശുപത്രി എൻ.സി.ഡി വിഭാഗം',
      kn: 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆ ಎನ್‌ಸಿಡಿ ವಿಭಾಗ',
      hi: 'मांड्या जिला अस्पताल एनसीडी विंग'
    }
  },
  {
    id: 'DOC-007',
    doctorId: 'DOC-007',
    name: 'Dr. Harish Patil',
    nameI18n: {
      en: 'Dr. Harish Patil',
      ta: 'டாக்டர் ஹரீஷ் பாட்டீல்',
      te: 'డాక్టర్ హరీష్ పాటిల్',
      ml: 'ഡോ. ഹരീഷ് പാട്ടീൽ',
      kn: 'ಡಾ. ಹರೀಶ್ ಪಾಟೀಲ್',
      hi: 'डॉ. हरीश पाटिल'
    },
    specialty: 'Cardiologist',
    specialtyI18n: {
      en: 'Cardiologist',
      ta: 'இதய நோய் சிறப்பு மருத்துவர்',
      te: 'గుండె వైద్యుడు',
      ml: 'ഹൃദ്രോഗ വിദഗ്ദ്ധൻ',
      kn: 'ಹೃದ್ರೋಗ ತಜ್ಞರು',
      hi: 'हृदय रोग विशेषज्ञ'
    },
    departmentI18n: {
      en: 'Cardiology & Emergency Cardiac Care',
      ta: 'இதயவியல் மற்றும் அவசர இதய சிகிச்சை பிரிவு',
      te: 'కార్డియాలజీ & అత్యవసర కార్డియాక్ కేర్',
      ml: 'കാർഡിയോളജി & എമർജൻസി കാർഡിയാക് കെയർ',
      kn: 'ಹೃದ್ರೋಗ ಮತ್ತು ತುರ್ತು ಹೃದಯ ಆರೈಕೆ ವಿಭಾಗ',
      hi: 'हृदय रोग एवं आपातकालीन कार्डियक केयर विभाग'
    },
    ruralCareFocus: 'Rural Hypertension Control, Angina Recognition & Cardiac Emergency Triage',
    ruralCareFocusI18n: {
      en: 'Rural Hypertension Control, Angina Recognition & Cardiac Emergency Triage',
      ta: 'கிராமப்புற உயர் இரத்த அழுத்த கட்டுப்பாடு, நெஞ்சுவலி கண்டறிதல் மற்றும் அவசர இதய முதலுதவி',
      te: 'గ్రామీణ రక్తపోటు నియంత్రణ, ఛాతీ నొప్పి గుర్తింపు & అత్యవసర కార్డియాక్ కేర్',
      ml: 'ഗ്രാമീണ രക്തസമ്മർദ്ദ നിയന്ത്രണം, ഹൃദയ വേദന തിരിച്ചറിയൽ, അടിയന്തര ഹൃദ്രോഗ ട്രയാജ്',
      kn: 'ಗ್ರಾಮೀಣ ಅಧಿಕ ರಕ್ತದೊತ್ತಡ ನಿಯಂತ್ರಣ, ಎದೆನೋವು ಗುರುತಿಸುವಿಕೆ ಮತ್ತು ತುರ್ತು ಹೃದಯ ಚಿಕಿತ್ಸೆ',
      hi: 'ग्रामीण उच्च रक्तचाप नियंत्रण, एंजाइना पहचान एवं आपातकालीन हृदय रोग ट्राइएज'
    },
    experienceYears: 18,
    experienceI18n: {
      en: '18 Years Clinical Practice',
      ta: '18 ஆண்டுகள் மருத்துவ அனுபவம்',
      te: '18 సంవత్సరాల క్లినికల్ అనుభవం',
      ml: '18 വർഷത്തെ ക്ലിനിക്കൽ പരിചയം',
      kn: '18 ವರ್ಷಗಳ ವೈದ್ಯಕೀಯ ಅನುಭವ',
      hi: '18 वर्षों का चिकित्सीय अनुभव'
    },
    languages: ['Kannada', 'Hindi', 'English'],
    languagesI18n: {
      en: 'Kannada, Hindi, English',
      ta: 'கன்னடம், இந்தி, ஆங்கிலம்',
      te: 'కన్నడ, హిందీ, ఇంగ్లీష్',
      ml: 'കന്നഡ, ഹിന്ദി, ഇംഗ്ലീഷ്',
      kn: 'ಕನ್ನಡ, ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್',
      hi: 'कन्नड़, हिन्दी, अंग्रेज़ी'
    },
    consultationType: 'Both',
    consultationTypeI18n: {
      en: 'Both (In-person & Teleconsultation)',
      ta: 'இரண்டும் (நேரில் & தொலைத்தொடர்பு)',
      te: 'రెండూ (ప్రత్యక్ష & టెలికన్సల్టేషన్)',
      ml: 'രണ്ടും (നേരിട്ടും ഫോൺ വഴിയും)',
      kn: 'ಎರಡೂ (ನೇರ & ಟೆಲಿಸಮಾಲೋಚನೆ)',
      hi: 'दोनों (प्रत्यक्ष एवं टेली-परामर्श)'
    },
    availabilityStatus: 'On Duty (Emergency)',
    availabilityStatusI18n: {
      en: 'On Duty (Emergency)',
      ta: 'அவசர சிகிச்சைப் பணியில்',
      te: 'అత్యవసర విధుల్లో ఉన్నారు',
      ml: 'അടിയന്തര ഡ്യൂട്ടിയിൽ',
      kn: 'ತುರ್ತು ಕರ್ತವ್ಯದಲ್ಲಿದ್ದಾರೆ',
      hi: 'आपातकालीन ड्यूटी पर'
    },
    isDemo: true,
    demoFee: 'Free (Emergency Assessment)',
    demoFeeI18n: {
      en: 'Free (Emergency Assessment)',
      ta: 'இலவசம் (அவசர இதய பரிசோதனை)',
      te: 'ఉచితం (అత్యవసర కార్డియాక్ పరీక్ష)',
      ml: 'സൗജന്യം (അടിയന്തര ഹൃദ്രോഗ പരിശോധന)',
      kn: 'ಉಚಿತ (ತುರ್ತು ತಪಾಸಣೆ)',
      hi: 'निःशुल्क (आपातकालीन जांच)'
    },
    contactPhone: '+919800001007',
    shortBio: 'Fictional cardiologist heading emergency cardiac triage, rural ECG tele-reading, stroke risk factor control, and secondary heart failure prevention.',
    shortBioI18n: {
      en: 'Fictional cardiologist heading emergency cardiac triage, rural ECG tele-reading, stroke risk factor control, and secondary heart failure prevention.',
      ta: 'அவசர இதய சிகிச்சை, தொலைதூர ஈசிஜி பரிசோதனை, பக்கவாத தடுப்பு மற்றும் இதய செயலிழப்பு தடுப்பில் 18 ஆண்டுகால அனுபவம் கொண்ட மூத்த இதய மருத்துவர்.',
      te: 'అత్యవసర గుండె చికిత్స, గ్రామీణ ఈసీజీ టెలి-రీడింగ్, పక్షవాతం నివారణ మరియు గుండె వైఫల్యం నివారణలో 18 ఏళ్ల అనుభవజ్ఞుడైన కార్డియాలజిస్ట్.',
      ml: 'അടിയന്തര കാർഡിയാക് ട്രയാജ്, ഗ്രാമീണ ഇ.സി.ജി ടെലി-റീഡിംഗ്, സ്ട്രോക്ക് പ്രതിരോധം, ഹൃദയസ്തംഭന നിവാരണം എന്നിവയിൽ വിദഗ്ദ്ധനായ കാർഡിയോളജിസ്റ്റ്.',
      kn: 'ತುರ್ತು ಹೃದಯ ಚಿಕಿತ್ಸೆ, ದೂರಸಂಪರ್ಕ ಇಸಿಜಿ ವಿಶ್ಲೇಷಣೆ, ಪಾರ್ಶ್ವವಾಯು ತಡೆ ಮತ್ತು ಹೃದಯ ವೈಫಲ್ಯ ನಿವಾರಣೆಯಲ್ಲಿ 18 ವರ್ಷಗಳ ಅನುಭವ ಹೊಂದಿರುವ ತಜ್ಞರು.',
      hi: 'आपातकालीन हृदय रोग ट्राइएज, ग्रामीण ईसीजी टेली-रीडिंग, स्ट्रोक जोखिम नियंत्रण और हार्ट फेलियर रोकथाम में 18 वर्षों के अनुभवी हृदय रोग विशेषज्ञ।'
    },
    areasOfCare: ['Acute Chest Pain Triage', 'Blood Pressure Management', 'Arrhythmia Recognition', 'Heart Failure Care'],
    areasOfCareI18n: {
      en: ['Acute Chest Pain Triage', 'Blood Pressure Management', 'Arrhythmia Recognition', 'Heart Failure Care'],
      ta: ['தீவிர நெஞ்சுவலி பரிசோதனை', 'இரத்த அழுத்த மேலாண்மை', 'இதய துடிப்பு ஒழுங்கின்மை ஆய்வு', 'இதய செயலிழப்பு பாதுகாப்பு'],
      te: ['తీవ్ర ఛాతీ నొప్పి పరీక్ష', 'రక్తపోటు నిర్వహణ', 'గుండె లయ తప్పడం', 'హార్ట్ ఫెయిల్యూర్ కేర్'],
      ml: ['നെഞ്ചുവേദന അടിയന്തര പരിശോധന', 'രക്തസമ്മർദ്ദ നിയന്ത്രണം', 'അരിത്മിയ തിരിച്ചറിയൽ', 'ഹാർട്ട് ഫെയിലിയർ കെയർ'],
      kn: ['ತೀವ್ರ ಎದೆನೋವು ತಪಾಸಣೆ', 'ರಕ್ತದೊತ್ತಡ ನಿರ್ವಹಣೆ', 'ಅಸಹಜ ಹೃದಯ ಬಡಿತ', 'ಹೃದಯ ವೈಫಲ್ಯ ಆರೈಕೆ'],
      hi: ['सीने में तेज दर्द की जांच', 'रक्तचाप प्रबंधन', 'अनियमित धड़कन पहचान', 'हार्ट फेलियर देखभाल']
    },
    hospitalAffiliation: 'District Civil Hospital Emergency Ward',
    hospitalAffiliationI18n: {
      en: 'District Civil Hospital Emergency Ward',
      ta: 'மாவட்ட அரசு தலைமை மருத்துவமனை அவசர பிரிவு',
      te: 'జిల్లా పౌర ఆసుపత్రి అత్యవసర విభాగం',
      ml: 'ജില്ലാ സിവിൽ ആശുപത്രി എമർജൻസി വാർഡ്',
      kn: 'ಜಿಲ್ಲಾ ಸಿವಿಲ್ ಆಸ್ಪತ್ರೆ ತುರ್ತು ವಿಭಾಗ',
      hi: 'जिला नागरिक अस्पताल आपातकालीन वार्ड'
    },
    opdTimings: 'Emergency 24/7 on rotation',
    opdTimingsI18n: {
      en: 'Emergency 24/7 on rotation',
      ta: 'அவசர பிரிவு 24/7 சுழற்சி முறை',
      te: 'ఎమర్జెన్సీ 24/7 రొటేషన్',
      ml: '24/7 അടിയന്തര സേവനം',
      kn: 'ತುರ್ತು ಸೇವೆ ದಿನದ 24 ಗಂಟೆ',
      hi: 'आपातकालीन सेवा 24/7 उपलब्ध'
    },
    education: 'MBBS, MD, DM (Cardiology) - Fictional Medical University',
    educationI18n: {
      en: 'MBBS, MD, DM (Cardiology)',
      ta: 'MBBS, MD, DM (இதயவியல்)',
      te: 'MBBS, MD, DM (కార్డియాలజీ)',
      ml: 'MBBS, MD, DM (കാർഡിയോളജി)',
      kn: 'MBBS, MD, DM (ಕಾರ್ಡಿಯಾಲಜಿ)',
      hi: 'एमबीबीएस, एमडी, डीएम (कार्डियोलॉजी)'
    },
    locationI18n: {
      en: 'District Civil Hospital Trauma Ward',
      ta: 'மாவட்ட அரசு தலைமை மருத்துவமனை தீவிர சிகிச்சை பிரிவு',
      te: 'జిల్లా పౌర ఆసుపత్రి అత్యవసర విభాగం',
      ml: 'ജില്ലാ സിവിൽ ആശുപത്രി ട്രോമ വാർഡ്',
      kn: 'ಜಿಲ್ಲಾ ಸಿವಿಲ್ ಆಸ್ಪತ್ರೆ ಟ್ರಾಮಾ ವಾರ್ಡ್',
      hi: 'जिला नागरिक अस्पताल ट्रॉमा वार्ड'
    }
  },
  {
    id: 'DOC-008',
    doctorId: 'DOC-008',
    name: 'Dr. Fatima Begum',
    nameI18n: {
      en: 'Dr. Fatima Begum',
      ta: 'டாக்டர் பாத்திமா பேகம்',
      te: 'డాక్టర్ ఫాతిమా బేగం',
      ml: 'ഡോ. ഫാത്തിമ ബീഗം',
      kn: 'ಡಾ. ಫಾತಿಮಾ ಬೇಗಂ',
      hi: 'डॉ. फातिमा बेगम'
    },
    specialty: 'General Physician',
    specialtyI18n: {
      en: 'Respiratory Medicine',
      ta: 'நுரையீரல் மற்றும் சுவாச நல மருத்துவர்',
      te: 'శ్వాసకోశ వ్యాధుల నిపుణురాలు',
      ml: 'ശ്വാസകോശ രോഗ വിദഗ്ദ്ധ',
      kn: 'ಶ್ವಾಸಕೋಶ ತಜ್ಞರು',
      hi: 'श्वसन रोग विशेषज्ञ'
    },
    departmentI18n: {
      en: 'Pulmonology, Chest Diseases & TB Control',
      ta: 'நுரையீரல், மார்பக நோய் மற்றும் காசநோய் தடுப்பு பிரிவு',
      te: 'పల్మోనాలజీ, ఛాతీ వ్యాధులు & టీబీ నియంత్రణ విభాగం',
      ml: 'പൾമണോളജി, നെഞ്ചുരോഗം & ക്ഷയരോഗ നിയന്ത്രണ വിഭാഗം',
      kn: 'ಶ್ವಾಸಕೋಶ ಮತ್ತು ಕ್ಷಯರೋಗ ನಿಯಂತ್ರಣ ವಿಭಾಗ',
      hi: 'पल्मोनोलॉजी, वक्ष रोग एवं क्षयरोग नियंत्रण विभाग'
    },
    ruralCareFocus: 'Tuberculosis (NTEP), Chronic Asthma, COPD & Occupational Dust Exposure',
    ruralCareFocusI18n: {
      en: 'Tuberculosis (NTEP), Chronic Asthma, COPD & Occupational Dust Exposure',
      ta: 'காசநோய் (NTEP), நாள்பட்ட ஆஸ்துமா, மூச்சுத்திணறல் மற்றும் விவசாய தூசி பாதிப்பு',
      te: 'క్షయవ్యాధి (NTEP), దీర్ఘకాలిక ఆస్తమా, COPD & దుమ్ము వల్ల వచ్చే ఊపిరితిత్తుల సమస్యలు',
      ml: 'ക്ഷയരോഗം (NTEP), ആസ്ത്മ, സി.ഒ.പി.ഡി, തൊഴിൽപരമായ ശ്വാസകോശ രോഗങ്ങൾ',
      kn: 'ಕ್ಷಯರೋಗ (NTEP), ದೀರ್ಘಕಾಲದ ಅಸ್ತಮಾ, ಸಿಒಪಿಡಿ ಮತ್ತು ಧೂಳಿನಿಂದಾಗುವ ಶ್ವಾಸಕೋಶದ ತೊಂದರೆಗಳು',
      hi: 'क्षयरोग (एनटीईपी), क्रोनिक अस्थमा, सीओपीडी एवं कृषि धूल जनित फेफड़ों के रोग'
    },
    experienceYears: 12,
    experienceI18n: {
      en: '12 Years Clinical Practice',
      ta: '12 ஆண்டுகள் மருத்துவ அனுபவம்',
      te: '12 సంవత్సరాల క్లినికల్ అనుభవం',
      ml: '12 വർഷത്തെ ക്ലിനിക്കൽ പരിചയം',
      kn: '12 ವರ್ಷಗಳ ವೈದ್ಯಕೀಯ ಅನುಭವ',
      hi: '12 वर्षों का चिकित्सीय अनुभव'
    },
    languages: ['Telugu', 'Hindi', 'English'],
    languagesI18n: {
      en: 'Telugu, Hindi, English',
      ta: 'தெலுங்கு, இந்தி, ஆங்கிலம்',
      te: 'తెలుగు, హిందీ, ఇంగ్లీష్',
      ml: 'തെലുങ്ക്, ഹിന്ദി, ഇംഗ്ലീഷ്',
      kn: 'ತೆಲುಗು, ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್',
      hi: 'तेलुगु, हिन्दी, अंग्रेज़ी'
    },
    consultationType: 'Both',
    consultationTypeI18n: {
      en: 'Both (In-person & Teleconsultation)',
      ta: 'இரண்டும் (நேரில் & தொலைத்தொடர்பு)',
      te: 'రెండூ (ప్రత్యక్ష & టెలికన్సల్టేషన్)',
      ml: 'രണ്ടും (നേരിട്ടും ഫോൺ വഴിയും)',
      kn: 'ಎರಡೂ (ನೇರ & ಟೆಲಿಸಮಾಲೋಚನೆ)',
      hi: 'दोनों (प्रत्यक्ष एवं टेली-परामर्श)'
    },
    availabilityStatus: 'Available Today',
    availabilityStatusI18n: {
      en: 'Available Today',
      ta: 'இன்று கிடைக்கும்',
      te: 'ఈరోజు అందుబాటులో ఉన్నారు',
      ml: 'இന്ന് ലഭ്യമാണ്',
      kn: 'ಇಂದು ಲಭ್ಯವಿದ್ದಾರೆ',
      hi: 'आज उपलब्ध हैं'
    },
    isDemo: true,
    demoFee: 'Free (National TB Elimination)',
    demoFeeI18n: {
      en: 'Free (National TB Elimination)',
      ta: 'இலவசம் (தேசிய காசநோய் ஒழிப்பு திட்டம்)',
      te: 'ఉచితం (జాతీయ క్షయ నివారణ కార్యక్రమం)',
      ml: 'സൗജന്യം (ദേശീയ ക്ഷയരോഗ നിവാരണ പദ്ധതി)',
      kn: 'ಉಚಿತ (ರಾಷ್ಟ್ರೀಯ ಕ್ಷಯರೋಗ ನಿರ್ಮೂಲನೆ ಯೋಜನೆ)',
      hi: 'निःशुल्क (राष्ट्रीय क्षयरोग उन्मूलन कार्यक्रम)'
    },
    contactPhone: '+919800001008',
    shortBio: 'Fictional respiratory physician specializing in chronic cough evaluation, sputum testing under NTEP, seasonal bronchitis, and biomass smoke lung disease.',
    shortBioI18n: {
      en: 'Fictional respiratory physician specializing in chronic cough evaluation, sputum testing under NTEP, seasonal bronchitis, and biomass smoke lung disease.',
      ta: 'நாள்பட்ட இருமல் ஆய்வு, சளி பரிசோதனை (NTEP), பருவகால மூச்சுக்குழாய் அழற்சி மற்றும் அடுப்பு புகை நுரையீரல் பாதிப்பு சிகிச்சையில் தேர்ந்த சிறப்பு மருத்துவர்.',
      te: 'దీర్ఘకాలిక దగ్గు పరీక్ష, కఫం పరీక్ష (NTEP), కాలానుగుణ బ్రోన్కైటిస్ మరియు పొగ వల్ల వచ్చే ఊపిరితిత్తుల సమస్యల నివారణలో నైపుణ్యం గల వైద్యురాలు.',
      ml: 'ദീർഘകാല ചുമ, കഫ പരിശോധന (NTEP), സീസണൽ ബ്രോങ്കൈറ്റിസ്, അടുപ്പിലെ പുക മൂലമുള്ള ശ്വാസകോശ രോഗങ്ങൾ എന്നിവ ചികിത്സിക്കുന്നതിൽ വിദഗ്ദ്ധ.',
      kn: 'ದೀರ್ಘಕಾಲದ ಕೆಮ್ಮು, ಕಫ ಪರೀಕ್ಷೆ (NTEP), ಬ್ರಾಂಕೈಟಿಸ್ ಮತ್ತು ಒಲೆ ಹೊಗೆಯಿಂದಾಗುವ ಶ್ವಾಸಕೋಶದ ತೊಂದರೆ ನಿವಾರಣೆಯಲ್ಲಿ ಪರಿಣಿತರು.',
      hi: 'क्रोनिक खांसी मूल्यांकन, कफ जांच (एनटीईपी), मौसमी ब्रोंकाइटिस और चूल्हे के धुएं से फेफड़ों की बीमारी के उपचार में विशेषज्ञ।'
    },
    areasOfCare: ['Chronic Cough >2 Weeks', 'Tuberculosis DOTS Care', 'Asthma Inhaler Training', 'Pneumonia Triage'],
    areasOfCareI18n: {
      en: ['Chronic Cough >2 Weeks', 'Tuberculosis DOTS Care', 'Asthma Inhaler Training', 'Pneumonia Triage'],
      ta: ['2 வாரங்களுக்கு மேற்பட்ட இருமல்', 'காசநோய் டாட்ஸ் (DOTS) சிகிச்சை', 'ஆஸ்துமா இன்ஹேலர் பயிற்சி', 'நிமோனியா வகைப்படுத்தல்'],
      te: ['2 వారాలకు మించిన దగ్గు', 'క్షయ డాట్స్ (DOTS) కేర్', 'ఆస్తమా ఇన్హేలర్ శిక్షణ', 'న్యుమోనియా స్క్రీనింగ్'],
      ml: ['2 ആഴ്ചയിലധികം നീളുന്ന ചുമ', 'ക്ഷയരോഗ ഡോട്ട്സ് (DOTS) ചികിത്സ', 'ആസ്ത്മ ഇൻഹേലർ പരിശീലനം', 'ന്യുമോണിയ ട്രയാജ്'],
      kn: ['2 ವಾರಗಳಿಗಿಂತ ಹೆಚ್ಚಿನ ಕೆಮ್ಮು', 'ಕ್ಷಯರೋಗ ಡಾಟ್ಸ್ (DOTS) ಆರೈಕೆ', 'ಅಸ್ತಮಾ ಇನ್‌ಹೇಲರ್ ತರಬೇತಿ', 'ನ್ಯುಮೋನಿಯಾ ಪರೀಕ್ಷೆ'],
      hi: ['2 सप्ताह से अधिक की खांसी', 'क्षयरोग डॉट्स (DOTS) उपचार', 'अस्थमा इनहेलर प्रशिक्षण', 'निमोनिया जांच']
    },
    hospitalAffiliation: 'Rampur Chest & TB Unit',
    hospitalAffiliationI18n: {
      en: 'Rampur Chest & TB Unit',
      ta: 'ராம்பூர் மார்பக மற்றும் காசநோய் பிரிவு',
      te: 'రాంపూర్ శ్వాసకోశ & టీబీ కేంద్రం',
      ml: 'രാംപൂർ നെഞ്ചുരോഗ-ക്ഷയരോഗ യൂണിറ്റ്',
      kn: 'ರಾಂಪುರ ಎದೆ ಮತ್ತು ಕ್ಷಯರೋಗ ಘಟಕ',
      hi: 'रामपुर वक्ष एवं क्षयरोग इकाई'
    },
    opdTimings: 'Mon - Fri: 9:00 AM - 1:00 PM',
    opdTimingsI18n: {
      en: 'Mon - Fri: 9:00 AM - 1:00 PM',
      ta: 'திங்கள் - வெள்ளி: காலை 9:00 - மதியம் 1:00',
      te: 'సోమ - శుక్ర: ఉదయం 9:00 - మధ్యాహ్నం 1:00',
      ml: 'തിങ്കൾ - വെള്ളി: രാവിലെ 9:00 - ഉച്ചയ്ക്ക് 1:00',
      kn: 'ಸೋಮ - ಶುಕ್ರ: ಬೆಳಗ್ಗೆ 9:00 - ಮಧ್ಯಾಹ್ನ 1:00',
      hi: 'सोम - शुक्र: सुबह 9:00 - दोपहर 1:00'
    },
    education: 'MBBS, DTCD (Pulmonology) - Fictional Medical Board',
    educationI18n: {
      en: 'MBBS, DTCD (Pulmonology)',
      ta: 'MBBS, DTCD (நுரையீரல் மற்றும் சுவாச நோயியல்)',
      te: 'MBBS, DTCD (పల్మోనాలజీ)',
      ml: 'MBBS, DTCD (പൾമണോളജി)',
      kn: 'MBBS, DTCD (ಪಲ್ಮನಾಲಜಿ)',
      hi: 'एमबीबीएस, डीटीसीडी (पल्मोनोलॉजी)'
    },
    locationI18n: {
      en: 'Rampur Chest Clinic Wing',
      ta: 'ராம்பூர் மார்பக மருத்துவ பிரிவு',
      te: 'రాంపూర్ ఛాతీ క్లినిక్ విభాగం',
      ml: 'രാംപൂർ ചെസ്റ്റ് ക്ലിനിക്ക് വിഭാഗം',
      kn: 'ರಾಂಪುರ ಎದೆರೋಗ ಚಿಕಿತ್ಸಾ ವಿಭಾಗ',
      hi: 'रामपुर चेस्ट क्लिनिक विंग'
    }
  },
  {
    id: 'DOC-009',
    doctorId: 'DOC-009',
    name: 'Dr. Geetha Swamy',
    nameI18n: {
      en: 'Dr. Geetha Swamy',
      ta: 'டாக்டர் கீதா சுவாமி',
      te: 'డాక్టర్ గీతా స్వామి',
      ml: 'ഡോ. ഗീതാ സ്വാമി',
      kn: 'ಡಾ. ಗೀತಾ ಸ್ವಾಮಿ',
      hi: 'डॉ. गीता स्वामी'
    },
    specialty: 'Nutritionist',
    specialtyI18n: {
      en: 'Nutritionist',
      ta: 'ஊட்டச்சத்து சிறப்பு ஆலோசகர்',
      te: 'పోషకాహార నిపుణురాలు',
      ml: 'പോഷകാഹാര വിദഗ്ദ്ധ',
      kn: 'ಪೌಷ್ಟಿಕಾಂಶ ತಜ್ಞರು',
      hi: 'पोषण विशेषज्ञ'
    },
    departmentI18n: {
      en: 'Clinical Nutrition, Dietetics & Poshan Abhiyaan',
      ta: 'ஊட்டச்சத்து மற்றும் போஷான் அபியான் பிரிவு',
      te: 'క్లినికల్ న్యూట్రిషన్ & పోషణ్ అభియాన్ విభాగం',
      ml: 'ക്ലിനിക്കൽ ന്യൂട്രീഷൻ & പോഷൻ അഭിയാൻ',
      kn: 'ಪೌಷ್ಟಿಕಾಂಶ ಮತ್ತು ಪೋಷಣ್ ಅಭಿಯಾನ ವಿಭಾಗ',
      hi: 'नैदानिक पोषण, आहारिकी एवं पोषण अभियान'
    },
    ruralCareFocus: 'Maternal Anemia, Poshan Abhiyaan & Locally Available Nutritious Crops',
    ruralCareFocusI18n: {
      en: 'Maternal Anemia, Poshan Abhiyaan & Locally Available Nutritious Crops',
      ta: 'கர்ப்பிணிகள் இரத்த சோகை, போஷான் அபியான் மற்றும் பாரம்பரிய சிறுதானிய சத்துணவு',
      te: 'గర్భిణీలలో రక్తహీనత, పోషణ్ అభియాన్ & స్థానిక పోషకాహారాలు',
      ml: 'മാതൃ അനീമിയ, പോഷൻ അഭിയാൻ, നാടൻ പോഷകാഹാരങ്ങൾ',
      kn: 'ತಾಯಂದಿರ ರಕ್ತಹೀನತೆ, ಪೋಷಣ್ ಅಭಿಯಾನ ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳ ಪೌಷ್ಟಿಕಾಂಶ',
      hi: 'मातृ एनीमिया निवारण, पोषण अभियान एवं स्थानीय पौष्टिक फसलें व आहार'
    },
    experienceYears: 8,
    experienceI18n: {
      en: '8 Years Clinical Practice',
      ta: '8 ஆண்டுகள் மருத்துவ அனுபவம்',
      te: '8 సంవత్సరాల క్లినికల్ అనుభవం',
      ml: '8 വർഷത്തെ ക്ലിനിക്കൽ പരിചയം',
      kn: '8 ವರ್ಷಗಳ ವೈದ್ಯಕೀಯ ಅನುಭವ',
      hi: '8 वर्षों का चिकित्सीय अनुभव'
    },
    languages: ['Tamil', 'Telugu', 'Kannada', 'English'],
    languagesI18n: {
      en: 'Tamil, Telugu, Kannada, English',
      ta: 'தமிழ், தெலுங்கு, கன்னடம், ஆங்கிலம்',
      te: 'తమిళం, తెలుగు, కన్నడ, ఇంగ్లీష్',
      ml: 'തമിഴ്, തെലുങ്ക്, കന്നഡ, ഇംഗ്ലീഷ്',
      kn: 'ತಮಿಳು, ತೆಲುಗು, ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್',
      hi: 'तमिल, तेलुगु, कन्नड़, अंग्रेज़ी'
    },
    consultationType: 'Teleconsultation',
    consultationTypeI18n: {
      en: 'Teleconsultation',
      ta: 'தொலைத்தொடர்பு மருத்துவ ஆலோசனை',
      te: 'టెలికన్సల్టేషన్ (ఫోన్/వీడియో)',
      ml: 'ടെലികൺസൾട്ടേഷൻ',
      kn: 'ಟೆಲಿಸಮಾಲೋಚನೆ',
      hi: 'टेली-परामर्श'
    },
    availabilityStatus: 'Available Today',
    availabilityStatusI18n: {
      en: 'Available Today',
      ta: 'இன்று கிடைக்கும்',
      te: 'ఈరోజు అందుబాటులో ఉన్నారు',
      ml: 'இന്ന് ലഭ്യമാണ്',
      kn: 'ಇಂದು ಲಭ್ಯವಿದ್ದಾರೆ',
      hi: 'आज उपलब्ध हैं'
    },
    isDemo: true,
    demoFee: 'Free (Poshan Abhiyaan)',
    demoFeeI18n: {
      en: 'Free (Poshan Abhiyaan)',
      ta: 'இலவசம் (தேசிய போஷான் ஊட்டச்சத்து திட்டம்)',
      te: 'ఉచితం (జాతీయ పోషణ్ అభియాన్ పథకం)',
      ml: 'സൗജന്യം (പോഷൻ അഭിയാൻ പദ്ധതി)',
      kn: 'ಉಚಿತ (ಪೋಷಣ್ ಅಭಿಯಾನ ಯೋಜನೆ)',
      hi: 'निःशुल्क (राष्ट्रीय पोषण अभियान)'
    },
    contactPhone: '+919800001009',
    shortBio: 'Fictional public health nutritionist promoting indigenous millets, drumstick leaves, iron-rich foods, adolescent health, and infant complementary feeding.',
    shortBioI18n: {
      en: 'Fictional public health nutritionist promoting indigenous millets, drumstick leaves, iron-rich foods, adolescent health, and infant complementary feeding.',
      ta: 'பாரம்பரிய சிறுதானியங்கள், முருங்கைக்கீரை, இரும்புச்சத்து உணவுகள், வளரிளம் பெண்கள் சுகாதாரம் மற்றும் 6 மாதத்திற்குப் பிந்தைய குழந்தை இணை உணவு குறித்த விழிப்புணர்வு தரும் ஊட்டச்சத்து நிபுணர்.',
      te: 'చిరుధాన్యాలు, మునగాకు, ఐరన్ సమృద్ధి ఆహారాలు, కౌమార బాలికల ఆరోగ్యం మరియు శిశువులకు అదనపు ఆహారం అందించడంలో నిపుణురాలు.',
      ml: 'നാടൻ ചെറുധാന്യങ്ങൾ, മുരിങ്ങയില, ഇരുമ്പ് അടങ്ങിയ ഭക്ഷണങ്ങൾ, കൗമാരക്കാരുടെ ആരോഗ്യം, 6 മാസം മുതലുള്ള കുഞ്ഞുങ്ങളുടെ ആഹാരക്രമം എന്നിവയിൽ മാർഗ്ഗനിർദ്ദേശം നൽകുന്ന വിദഗ്ദ്ധ.',
      kn: 'ಸಿರಿಧಾನ್ಯಗಳು, ನುಗ್ಗೆಸೊಪ್ಪು, ಕಬ್ಬಿಣಾಂಶಯುಕ್ತ ಆಹಾರ, ಹದಿಹರೆಯದವರ ಆರೋಗ್ಯ ಮತ್ತು 6 ತಿಂಗಳ ಮೇಲ್ಪಟ್ಟ ಮಕ್ಕಳಿಗೆ ಪೂರಕ ಆಹಾರ ಮಾರ್ಗದರ್ಶನ ನೀಡುವ ತಜ್ಞರು.',
      hi: 'पारंपरिक मोटे अनाज (मिलेट्स), सहजन पत्ते, लौह युक्त खाद्य पदार्थ, किशोरी स्वास्थ्य और शिशु पूरक आहार पर मार्गदर्शन करने वाली पोषण विशेषज्ञ।'
    },
    areasOfCare: ['Iron Deficiency Anemia', 'Pregnancy Nutrition', 'Complementary Weaning (6m+)', 'Elderly Dietary Balance'],
    areasOfCareI18n: {
      en: ['Iron Deficiency Anemia', 'Pregnancy Nutrition', 'Complementary Weaning (6m+)', 'Elderly Dietary Balance'],
      ta: ['இரும்புச்சத்து குறைபாடு இரத்த சோகை', 'கர்ப்பகால சத்துணவு திட்டம்', '6 மாத குழந்தை இணை உணவு', 'முதியோர் சரிவிகித உணவு'],
      te: ['ఐరన్ లోపం రక్తహీనత', 'గర్భధారణ పోషకాహారం', '6 నెలల పైబడిన పిల్లల ఆహారం', 'వృద్ధుల సమతుల్య ఆహారం'],
      ml: ['അനീമിയ നിയന്ത്രണം', 'ഗർഭകാല പോഷകാഹാരം', 'കുഞ്ഞുങ്ങൾക്കുള്ള അനുബന്ധ ഭക്ഷണം', 'മുതിർന്നവരുടെ സമീകൃതാഹാരം'],
      kn: ['ಕಬ್ಬಿಣಾಂಶ ಕೊರತೆಯ ರಕ್ತಹೀನತೆ', 'ಗರ್ಭಾವಸ್ಥೆಯ ಪೋಷಕಾಂಶಗಳು', 'ಮಕ್ಕಳ ಪೂರಕ ಆಹಾರ', 'ಹಿರಿಯರ ಸಮತೋಲನ ಆಹಾರ'],
      hi: ['आयरन की कमी से एनीमिया', 'गर्भावस्था पोषण योजना', '6 माह बाद शिशु पूरक आहार', 'वरिष्ठ नागरिक संतुलित आहार']
    },
    hospitalAffiliation: 'Community Poshan Health Desk',
    hospitalAffiliationI18n: {
      en: 'Community Poshan Health Desk',
      ta: 'சமூக போஷான் ஊட்டச்சத்து சேவை மையம்',
      te: 'కమ్యూనిటీ పోషణ్ హెల్త్ డెస్క్',
      ml: 'കമ്മ്യൂണിറ്റി പോഷൻ ഹെൽത്ത് ഡെസ്ക്',
      kn: 'ಸಮುದಾಯ ಪೋಷಣ್ ಆರೋಗ್ಯ ಕೇಂದ್ರ',
      hi: 'सामुदायिक पोषण स्वास्थ्य डेस्क'
    },
    opdTimings: 'Mon - Sat: 11:00 AM - 5:00 PM',
    opdTimingsI18n: {
      en: 'Mon - Sat: 11:00 AM - 5:00 PM',
      ta: 'திங்கள் - சனி: காலை 11:00 - மாலை 5:00',
      te: 'సోమ - శని: ఉదయం 11:00 - సాయంత్రం 5:00',
      ml: 'തിങ്കൾ - ശനി: രാവിലെ 11:00 - വൈകുന്നേരം 5:00',
      kn: 'ಸೋಮ - ಶನಿ: ಬೆಳಗ್ಗೆ 11:00 - ಸಂಜೆ 5:00',
      hi: 'सोम - शनि: सुबह 11:00 - शाम 5:00'
    },
    education: 'BSc, MSc (Clinical Nutrition & Dietetics) - Fictional',
    educationI18n: {
      en: 'BSc, MSc (Clinical Nutrition & Dietetics)',
      ta: 'BSc, MSc (மருத்துவ ஊட்டச்சத்து மற்றும் உணவுமுறை)',
      te: 'BSc, MSc (క్లినికల్ న్యూట్రిషన్ & డైటెటిక్స్)',
      ml: 'BSc, MSc (ക്ലിനിക്കൽ ന്യൂട്രീഷൻ & ഡയറ്റെറ്റിക്സ്)',
      kn: 'BSc, MSc (ಕ್ಲಿನಿಕಲ್ ನ್ಯೂಟ್ರಿಷನ್ & ಡಯೆಟಿಕ್ಸ್)',
      hi: 'बीएससी, एमएससी (क्लिनिकल न्यूट्रिशन एवं डाइटेटिक्स)'
    },
    locationI18n: {
      en: 'Community Poshan Centre',
      ta: 'சமூக போஷான் சத்துணவு மையம்',
      te: 'కమ్యూనిటీ పోషణ్ కేంద్రం',
      ml: 'കമ്മ്യൂണിറ്റി പോഷൻ കേന്ദ്രം',
      kn: 'ಸಮುದಾಯ ಪೋಷಣ್ ಕೇಂದ್ರ',
      hi: 'सामुदायिक पोषण केंद्र'
    }
  },
  {
    id: 'DOC-010',
    doctorId: 'DOC-010',
    name: 'Dr. Vikram Reddy',
    nameI18n: {
      en: 'Dr. Vikram Reddy',
      ta: 'டாக்டர் விக்ரம் ரெட்டி',
      te: 'డాక్టర్ విక్రమ్ రెడ్డి',
      ml: 'ഡോ. വിക്രം റെഡ്ഡി',
      kn: 'ಡಾ. ವಿಕ್ರಮ್ ರೆಡ್ಡಿ',
      hi: 'डॉ. विक्रम रेड्डी'
    },
    specialty: 'General Physician',
    specialtyI18n: {
      en: 'Emergency Care',
      ta: 'அவசர சிகிச்சை பிரிவு மருத்துவர்',
      te: 'అత్యవసర చికిత్స నిపుణుడు',
      ml: 'അടിയന്തര ചികിത്സാ വിദഗ്ദ്ധൻ',
      kn: 'ತುರ್ತು ಚಿಕಿತ್ಸಾ ತಜ್ಞರು',
      hi: 'आपातकालीन चिकित्सा विशेषज्ञ'
    },
    departmentI18n: {
      en: 'Trauma, Casualty & Emergency Resuscitation',
      ta: 'விபத்து, அவசர சிகிச்சை மற்றும் மறுஉயிர்ப்பூட்டல் பிரிவு',
      te: 'ట్రామా, క్యాజువాలిటీ & అత్యవసర చికిత్స విభాగం',
      ml: 'ട്രോമ, കാഷ്വാലിറ്റി & അടിയന്തര പുനരുജ്ജീവന വിഭാഗം',
      kn: 'ಟ್ರಾಮಾ, ಕ್ಯಾಶುಯಲ್ಟಿ ಮತ್ತು ತುರ್ತು ಚಿಕಿತ್ಸಾ ವಿಭಾಗ',
      hi: 'ट्रॉमा, कैजुअल्टी एवं आपातकालीन पुनर्जीवन विभाग'
    },
    ruralCareFocus: 'Snakebite Protocol, Major Trauma Stabilization & 108 Pre-Hospital Triage',
    ruralCareFocusI18n: {
      en: 'Snakebite Protocol, Major Trauma Stabilization & 108 Pre-Hospital Triage',
      ta: 'பாம்புக்கடி சிகிச்சை நெறிமுறை, விபத்து முதலுதவி நிலைப்படுத்துதல் மற்றும் 108 ஆம்புலன்ஸ் ஒருங்கிணைப்பு',
      te: 'పాముకాటు చికిత్సా విధానం, తీవ్ర గాయాల స్థిరీకరణ & 108 అత్యవసర సమన్వయం',
      ml: 'പാമ്പുകടി ചികിത്സാ പ്രോട്ടോക്കോൾ, അടിയന്തര ട്രോമ പരിചരണം, 108 ആംബുലൻസ് ഏകോപനം',
      kn: 'ಹಾವಿನ ಕಡಿತ ಚಿಕಿತ್ಸಾ ಪ್ರೋಟೋಕಾಲ್, ತೀವ್ರ ಗಾಯಗಳ ತುರ್ತು ಆರೈಕೆ ಮತ್ತು 108 ಸಮನ್ವಯ',
      hi: 'सर्पदंश प्रोटोकॉल, गंभीर आघात स्थिरीकरण एवं 108 प्री-हॉस्पिटल ट्राइएज'
    },
    experienceYears: 15,
    experienceI18n: {
      en: '15 Years Clinical Practice',
      ta: '15 ஆண்டுகள் மருத்துவ அனுபவம்',
      te: '15 సంవత్సరాల క్లినికಲ್ అనుభవం',
      ml: '15 വർഷത്തെ ക്ലിനിക്കൽ പരിചയം',
      kn: '15 ವರ್ಷಗಳ ವೈದ್ಯಕೀಯ ಅನುಭವ',
      hi: '15 वर्षों का चिकित्सीय अनुभव'
    },
    languages: ['Telugu', 'Kannada', 'English', 'Hindi'],
    languagesI18n: {
      en: 'Telugu, Kannada, English, Hindi',
      ta: 'தெலுங்கு, கன்னடம், ஆங்கிலம், இந்தி',
      te: 'తెలుగు, కన్నడ, ఇంగ్లీష్, హిందీ',
      ml: 'തെലുങ്ക്, കന്നഡ, ഇംഗ്ലീഷ്, ഹിന്ദി',
      kn: 'ತೆಲುಗು, ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ',
      hi: 'तेलुगु, कन्नड़, अंग्रेज़ी, हिन्दी'
    },
    consultationType: 'In-person',
    consultationTypeI18n: {
      en: 'In-person',
      ta: 'நேரடி ஆலோசனை',
      te: 'ప్రత్యక్ష సంప్రదింపు',
      ml: 'നേരിട്ടുള്ള പരിശോധന',
      kn: 'ನೇರ ಸಮಾಲೋಚನೆ',
      hi: 'प्रत्यक्ष परामर्श'
    },
    availabilityStatus: 'On Duty (Emergency)',
    availabilityStatusI18n: {
      en: 'On Duty (Emergency)',
      ta: 'அவசர சிகிச்சைப் பணியில்',
      te: 'అత్యవసర విధుల్లో ఉన్నారు',
      ml: 'അടിയന്തര ഡ്യൂട്ടിയിൽ',
      kn: 'ತುರ್ತು ಕರ್ತವ್ಯದಲ್ಲಿದ್ದಾರೆ',
      hi: 'आपातकालीन ड्यूटी पर'
    },
    isDemo: true,
    demoFee: 'Free (Govt Emergency Casualty)',
    demoFeeI18n: {
      en: 'Free (Govt Emergency Casualty)',
      ta: 'இலவசம் (அரசு அவசர சிகிச்சை பிரிவு)',
      te: 'ఉచితం (ప్రభుత్వ అత్యవసర క్యాజువాలిటీ)',
      ml: 'സൗജന്യം (സർക്കാർ അടിയന്തര വിഭാഗം)',
      kn: 'ಉಚಿತ (ಸರ್ಕಾರಿ ತುರ್ತು ಚಿಕಿತ್ಸಾ ಘಟಕ)',
      hi: 'निःशुल्क (सरकारी आपातकालीन कैजुअल्टी)'
    },
    contactPhone: '+919800001010',
    shortBio: 'Fictional casualty medical officer with extensive experience in rural envenomation (ASV protocols), road trauma, burns stabilization, and rapid resuscitation.',
    shortBioI18n: {
      en: 'Fictional casualty medical officer with extensive experience in rural envenomation (ASV protocols), road trauma, burns stabilization, and rapid resuscitation.',
      ta: 'பாம்பு விஷமுறிவு சிகிச்சை (ASV), சாலை விபத்து முதலுதவி, தீக்காயம் நிலைப்படுத்துதல் மற்றும் உடனடி தீவிர சிகிச்சையில் 15 ஆண்டு அனுபவமிக்க அவசர சிகிச்சை தலைமை மருத்துவர்.',
      te: 'పాముకాటు యాంటీవీనమ్ (ASV) చికిత్స, రోడ్డు ప్రమాదాల అత్యవసర సంరక్షణ, కాలిన గాయాల చికిత్సలో 15 ఏళ్ల అపార అనుభవం గల క్యాజువాలిటీ మెడికల్ ఆఫీసర్.',
      ml: 'പാമ്പുകടി പ്രതിവിഷ ചികിത്സ (ASV), റോഡപകടങ്ങളിലെ അടിയന്തര പരിചരണം, പൊള്ളൽ ചികിത്സ എന്നിവയിൽ 15 വർഷത്തെ പരിചയമുള്ള എമർജൻസി മെഡിക്കൽ ഓഫീസർ.',
      kn: 'ಹಾವಿನ ಕಡಿತದ ಎಎಸ್‌ವಿ ಚಿಕಿತ್ಸೆ, ರಸ್ತೆ ಅಪಘಾತ ತುರ್ತು ನಿಗಾ, ಸುಟ್ಟ ಗಾಯಗಳ ಆರೈಕೆಯಲ್ಲಿ 15 ವರ್ಷಗಳ ಪರಿಣತಿ ಹೊಂದಿರುವ ತುರ್ತು ಚಿಕಿತ್ಸಾ ವೈದ್ಯಾಧಿಕಾರಿ.',
      hi: 'सर्पदंश एंटीवेनम (एएसवी प्रोटोकॉल), सड़क दुर्घटना आघात, जलने की स्थिति में स्थिरता और त्वरित पुनर्जीवन में 15 वर्षों के अनुभवी आपातकालीन चिकित्सा अधिकारी।'
    },
    areasOfCare: ['Snakebite Envenomation', 'Agricultural Trauma & Burns', 'Acute Poisoning Triage', 'Resuscitation Protocols'],
    areasOfCareI18n: {
      en: ['Snakebite Envenomation', 'Agricultural Trauma & Burns', 'Acute Poisoning Triage', 'Resuscitation Protocols'],
      ta: ['பாம்புக்கடி மற்றும் விஷமுறிவு', 'விவசாய விபத்து காயங்கள் & தீக்காயங்கள்', 'நச்சு முறிவு அவசர சிகிச்சை', 'மறுஉயிர்ப்பூட்டல் நெறிமுறைகள்'],
      te: ['పాముకాటు విష చికిత్స', 'వ్యవసాయ ప్రమాదాలు & కాలిన గాయాలు', 'విషప్రయోగ అత్యవసర చికిత్స', 'పునరుజ్జీవన చికిత్స'],
      ml: ['പാമ്പുകടി വിഷ ചികിത്സ', 'കാർഷിക അപകടങ്ങളും പൊള്ളലും', 'വിഷബാധ അടിയന്തര പരിചരണം', 'പുനരുജ്ജീവന പ്രോട്ടോക്കോൾ'],
      kn: ['ಹಾವಿನ ಕಡಿತದ ಚಿಕಿತ್ಸೆ', 'ಕೃಷಿ ಅಪಘಾತ ಗಾಯಗಳು ಮತ್ತು ಸುಟ್ಟಗಾಯಗಳು', 'ವಿಷ ಸೇವನೆ ತುರ್ತು ಆರೈಕೆ', 'ಪುನರುಜ್ಜೀವನ ಚಿಕಿತ್ಸೆ'],
      hi: ['सर्पदंश विष उपचार', 'कृषि दुर्घटना चोटें एवं जलन', 'तीव्र विषबाधा प्राथमिक उपचार', 'पुनर्जीवन प्रोटोकॉल']
    },
    hospitalAffiliation: 'Mandya Trauma & Emergency Casualty',
    hospitalAffiliationI18n: {
      en: 'Mandya Trauma & Emergency Casualty',
      ta: 'மண்டியா அவசர மற்றும் அதிர்ச்சி சிகிச்சை பிரிவு',
      te: 'మండ్య ట్రామా & ఎమర్జెన్సీ క్యాజువాలిటీ',
      ml: 'മാണ്ഡ്യ ട്രോമ & എമർജൻസി കാഷ്വാലിറ്റി',
      kn: 'ಮಂಡ್ಯ ಟ್ರಾಮಾ ಮತ್ತು ತುರ್ತು ವಿಭಾಗ',
      hi: 'मांड्या ट्रॉमा एवं आपातकालीन कैजुअल्टी'
    },
    opdTimings: 'Casualty Department (Emergency 24x7)',
    opdTimingsI18n: {
      en: 'Casualty Department (Emergency 24x7)',
      ta: 'அவசர சிகிச்சை பிரிவு (24x7 தொடர்ந்து செயல்படுகிறது)',
      te: 'క్యాజువాలిటీ విభాగం (ఎమర్జెన్సీ 24x7)',
      ml: 'കാഷ്വാലിറ്റി വിഭാഗം (24x7 അടിയന്തര സേവനം)',
      kn: 'ತುರ್ತು ಚಿಕಿತ್ಸಾ ವಿಭಾಗ (ದಿನದ 24 ಗಂಟೆ)',
      hi: 'कैजुअल्टी विभाग (आपातकालीन 24x7)'
    },
    education: 'MBBS, MEM (Emergency Medicine) - Fictional Emergency Academy',
    educationI18n: {
      en: 'MBBS, MEM (Emergency Medicine)',
      ta: 'MBBS, MEM (அவசர கால மருத்துவம்)',
      te: 'MBBS, MEM (ఎమర్జెన్సీ మెడిసిన్)',
      ml: 'MBBS, MEM (എമർജൻസി മെഡിസിൻ)',
      kn: 'MBBS, MEM (ಎಮರ್ಜೆನ್ಸಿ ಮೆಡಿಸಿನ್)',
      hi: 'एमबीबीएस, एमईएम (आपातकालीन चिकित्सा)'
    },
    locationI18n: {
      en: 'Mandya 24/7 Trauma Unit',
      ta: 'மண்டியா 24/7 அவசர சிகிச்சை தளம்',
      te: 'మండ్య 24/7 ట్రామా కేంద్రం',
      ml: 'മാണ്ഡ്യ 24/7 ട്രോമ യൂണിറ്റ്',
      kn: 'ಮಂಡ್ಯ 24/7 ಟ್ರಾಮಾ ಘಟಕ',
      hi: 'मांड्या 24/7 ट्रॉमा यूनिट'
    }
  }
];

export interface LocalizedDoctorView {
  id: string;
  doctorId: string;
  name: string;
  specialty: string;
  department: string;
  ruralCareFocus: string;
  experienceYears: number;
  experienceText: string;
  languages: string[];
  languagesSpokenText: string;
  consultationType: string;
  availabilityStatus: string;
  isDemo: boolean;
  demoFee: string;
  contactPhone?: string;
  shortBio: string;
  areasOfCare: string[];
  hospitalAffiliation: string;
  opdTimings: string;
  education: string;
  location: string;
}

export function getLocalizedDoctor(doctor: FictionalDoctorProfile, lang: LanguageCode): LocalizedDoctorView {
  const validLangs: LanguageCode[] = ['en', 'ta', 'te', 'ml', 'kn', 'hi'];
  const safeLang = validLangs.includes(lang) ? lang : 'en';

  const localizedLangNames = doctor.languages
    .map(l => LANGUAGE_DISPLAY_NAMES[l]?.[safeLang] || l)
    .join(', ');

  return {
    id: doctor.id,
    doctorId: doctor.doctorId,
    name: doctor.nameI18n[safeLang] || doctor.name,
    specialty: doctor.specialtyI18n[safeLang] || doctor.specialty,
    department: doctor.departmentI18n[safeLang] || doctor.specialty,
    ruralCareFocus: doctor.ruralCareFocusI18n[safeLang] || doctor.ruralCareFocus,
    experienceYears: doctor.experienceYears,
    experienceText: doctor.experienceI18n[safeLang] || `${doctor.experienceYears} Years`,
    languages: doctor.languages,
    languagesSpokenText: localizedLangNames,
    consultationType: doctor.consultationTypeI18n[safeLang] || doctor.consultationType,
    availabilityStatus: doctor.availabilityStatusI18n[safeLang] || doctor.availabilityStatus,
    isDemo: doctor.isDemo,
    demoFee: doctor.demoFeeI18n[safeLang] || doctor.demoFee,
    contactPhone: doctor.contactPhone,
    shortBio: doctor.shortBioI18n[safeLang] || doctor.shortBio,
    areasOfCare: doctor.areasOfCareI18n[safeLang] || doctor.areasOfCare,
    hospitalAffiliation: doctor.hospitalAffiliationI18n[safeLang] || doctor.hospitalAffiliation,
    opdTimings: doctor.opdTimingsI18n[safeLang] || doctor.opdTimings,
    education: doctor.educationI18n[safeLang] || doctor.education,
    location: doctor.locationI18n[safeLang] || doctor.hospitalAffiliation
  };
}

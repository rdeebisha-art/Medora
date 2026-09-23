import { LanguageCode } from '../types';

// WeakMap tracking original English text for every Text node in the DOM
const originalTextMap = new WeakMap<Text, string>();
// WeakMap tracking original attribute values (placeholder, title, aria-label)
const originalAttrMap = new WeakMap<Element, Record<string, string>>();

let observer: MutationObserver | null = null;
let activeLanguage: LanguageCode = 'en';
let isTranslating = false;
let translateDebounceTimeout: number | null = null;

// Comprehensive Universal Dictionary for Medora Rural Healthcare Platform
// Supports: hi (Hindi), te (Telugu), ml (Malayalam), ta (Tamil), kn (Kannada)
const DICTIONARY: Record<LanguageCode, Record<string, string>> = {
  en: {},
  hi: {
    // Navigation & Global Header
    'MEDORA': 'मेडोरा',
    'RURAL HEALTH': 'ग्रामीण स्वास्थ्य',
    'Rural Health Continuity Platform': 'ग्रामीण स्वास्थ्य निरंतरता मंच',
    'Rural Medical Emergency? Dial 108 (Ambulance) or 112 (National) immediately.': 'ग्रामीण चिकित्सा आपातकाल? तुरंत 108 (एम्बुलेंस) या 112 (राष्ट्रीय आपातकाल) डायल करें।',
    'ROLE: PATIENT': 'भूमिका: मरीज',
    'ROLE: FAMILY': 'भूमिका: परिवार',
    'ROLE: DOCTOR': 'भूमिका: डॉक्टर',
    'ROLE: ADMIN': 'भूमिका: ग्राम प्रशासन',
    'ROLE': 'भूमिका',
    'Persona': 'व्यक्तिगत पहचान',
    'Patient:': 'मरीज:',
    'Household:': 'परिवार:',
    '🚨 EMERGENCY HELP': '🚨 आपातकालीन सहायता',
    'EMERGENCY HELP': 'आपातकालीन सहायता',
    'Emergency Help': 'आपातकालीन सहायता',
    'Sign Out': 'लॉग आउट',
    'Sign In': 'लॉग इन करें',
    'Log In': 'लॉग इन',
    'Low Data': 'कम डेटा',
    'Low Data On': 'कम डेटा सक्रिय',
    'Offline Demo': 'ऑफलाइन डेमो',
    'Offline Demo On': 'ऑफलाइन चालू',
    'Simple Mode': 'सरल मोड',
    'Listen': 'सुनें',
    'Playing audio...': 'ऑडियो चल रहा है...',
    'DEMO DATA': 'डेमो डेटा',
    'Demo Data': 'डेमो डेटा',
    'Online (Direct)': 'ऑनलाइन (सीधा)',
    'Limited (2G/Edge)': 'सीमित (2जी/एज)',
    'Offline (Store & Forward)': 'ऑफलाइन (संग्रह और आगे भेजें)',
    'Rural Connectivity Simulator:': 'ग्रामीण कनेक्टिविटी सिम्युलेटर:',
    'More ▾': 'अधिक ▾',
    'More': 'अधिक',

    // Tabs & Sections
    'Dashboard': 'डैशबोर्ड',
    '🏠 Dashboard': '🏠 डैशबोर्ड',
    'Children': 'बाल स्वास्थ्य',
    '👶 Children': '👶 बाल स्वास्थ्य',
    'Maternity': 'मातृ स्वास्थ्य',
    '🤰 Maternity': '🤰 मातृ स्वास्थ्य',
    'Elderly': 'वृद्ध देखभाल',
    '👵 Elderly': '👵 वृद्ध देखभाल',
    'Diseases': 'रोग मार्गदर्शिका',
    '🛡️ Diseases': '🛡️ रोग मार्गदर्शिका',
    'AI Camera': 'AI कैमरा',
    '📷 AI Camera': '📷 AI कैमरा',
    'Medicine Check': 'दवा जांच',
    '💊 Medicine Check': '💊 दवा जांच',
    'X-Ray & Reports': 'एक्सरे और रिपोर्ट',
    '🔬 X-Ray & Reports': '🔬 एक्सरे और रिपोर्ट',
    'Ask AI': 'AI से पूछें',
    '🤖 Ask AI': '🤖 AI से पूछें',
    'Ask Medora AI': 'मेडोरा AI से पूछें',
    'A2A Protocol': 'A2A प्रोटोकॉल',
    '🔄 A2A Protocol': '🔄 A2A प्रोटोकॉल',
    'Doctor Summary': 'डॉक्टर सारांश',
    '📋 Doctor Summary': '📋 डॉक्टर सारांश',
    'Hospital Portal': 'अस्पताल पोर्टल',
    '🏥 Hospital Portal': '🏥 अस्पताल पोर्टल',
    'Govt Schemes': 'सरकारी योजनाएं',
    '🏛️ Govt Schemes': '🏛️ सरकारी योजनाएं',
    'Emergency & Maps': 'आपातकालीन और मानचित्र',
    '🗺️ Emergency & Maps': '🗺️ आपातकालीन और मानचित्र',
    'Village Admin': 'ग्राम प्रशासन',
    '🏛️ Village Admin': '🏛️ ग्राम प्रशासन',
    'Family': 'परिवार',
    '👨‍👩‍👧‍👦 Family': '👨‍👩‍👧‍👦 परिवार',
    'Medicines': 'दवाएं',
    '💊 Medicines': '💊 दवाएं',
    'Medical Reports': 'मेडिकल रिपोर्ट',
    '📜 Medical Reports': '📜 मेडिकल रिपोर्ट',

    // Dashboard & Care Hubs
    'YOUR HEALTH TODAY': 'आज आपका स्वास्थ्य',
    'SPECIALIZED POPULATION CARE HUBS': 'विशेष जनसंख्या स्वास्थ्य देखभाल केंद्र',
    'PRIMARY DOCTOR AVAILABILITY & SUBSTITUTES': 'प्राथमिक डॉक्टर उपलब्धता और विकल्प',
    'DOCTOR / PRIMARY DOCTOR AVAILABILITY SECTION': 'डॉक्टर / प्राथमिक डॉक्टर उपलब्धता',
    'Children Care Hub': 'बाल स्वास्थ्य केंद्र',
    'Maternity & Postpartum Hub': 'मातृ एवं प्रसवोत्तर केंद्र',
    'Elderly Care Hub': 'वृद्ध देखभाल केंद्र',
    'Rural Disease Guide': 'ग्रामीण रोग मार्गदर्शिका',
    'HEALTH SCORE': 'स्वास्थ्य स्कोर',
    'Priority Rural Care Tiers': 'प्राथमिक ग्रामीण स्वास्थ्य श्रेणियां',
    'Essential Care for Vulnerable Family Members': 'संवेदनशील पारिवारिक सदस्यों के लिए आवश्यक देखभाल',
    'Dedicated health support for seniors, expecting mothers, and infants with 1-click clinical access.': 'वरिष्ठ नागरिकों, गर्भवती माताओं और शिशुओं के लिए 1-क्लिक चिकित्सा सहायता।',
    'Elderly Care': 'वृद्ध देखभाल',
    '👵 Elderly Care': '👵 वृद्ध देखभाल',
    'Ages 60+': 'आयु 60+ वर्ष',
    'Maternal Care': 'मातृ देखभाल',
    '🤰 Maternal Care': '🤰 मातृ देखभाल',
    'Trimester 1 - 3': 'तिमाही 1 - 3',
    'Child Care': 'शिशु देखभाल',
    '👶 Child Care': '👶 शिशु देखभाल',
    'Ages 0 - 5': 'आयु 0 - 5 वर्ष',
    'Find Senior Doctor': 'वरिष्ठ डॉक्टर खोजें',
    'Trimester Guide': 'तिमाही मार्गदर्शिका',
    'Child Care & Vaccines': 'शिशु देखभाल और टीके',

    // Doctor Roster & Cards
    'Primary Physician': 'प्राथमिक चिकित्सक',
    'Backup Duty Physician': 'बैकअप ड्यूटी चिकित्सक',
    'Specialist': 'विशेषज्ञ',
    'Live Roster Status': 'लाइव रोस्टर स्थिति',
    'Available Today': 'आज उपलब्ध',
    'Available': 'उपलब्ध',
    'Off Duty': 'ड्यूटी पर नहीं',
    'Referral Only': 'केवल रेफरल',
    'DEMO DOCTOR': 'डेमो डॉक्टर',
    'View Profile': 'प्रोफाइल देखें',
    'Request Consultation': 'परामर्श का अनुरोध करें',
    'Send Health Summary': 'स्वास्थ्य सारांश भेजें',
    'Qualifications': 'योग्यताएं',
    'Experience': 'अनुभव',
    'Available Days & Time': 'उपलब्ध दिन और समय',
    'Languages Spoken': 'बोली जाने वाली भाषाएं',

    // Family Page & Roster
    'Family Health & Household Roster': 'पारिवारिक स्वास्थ्य एवं सदस्य तालिका',
    'Kumar Family': 'कुमार परिवार',
    'Family ID': 'परिवार आईडी',
    'Primary Contact': 'मुख्य संपर्क',
    'Total Family Members': 'कुल परिवार सदस्य',
    'High-Risk Members': 'उच्च-जोखिम वाले सदस्य',
    'Pending Checkups': 'लंबित जांच',
    'View Health': 'स्वास्थ्य देखें',
    'Share Details': 'विवरण साझा करें',
    'Share Report': 'रिपोर्ट साझा करें',
    'Grandfather / Senior': 'दादाजी / वरिष्ठ नागरिक',
    'Mother / Pregnant (Trimester 2)': 'माता / गर्भवती (तिमाही 2)',
    'Son / Child (Pediatric)': 'पुत्र / शिशु (बाल स्वास्थ्य)',
    'Daughter / Diabetic Care': 'पुत्री / मधुमेह देखभाल',
    'Father / Primary Earner': 'पिता / मुख्य अर्जक',
    'Household Roster': 'परिवार सूची',
    'Family Overview': 'पारिवारिक अवलोकन',
    'Recent Family Activity': 'हाल की पारिवारिक गतिविधि',

    // Communication Center & SMS & Share
    'Medora Communication Center': 'मेडोरा संचार केंद्र',
    'Messages & Share': 'संदेश और साझा करें',
    '📬 Messages & Share': '📬 संदेश और साझा करें',
    'Communication Center & Share': 'संचार केंद्र और साझा करें',
    'Open Communication Center': 'संचार केंद्र खोलें',
    'Send SMS': 'एसएमएस भेजें',
    'Enter phone number': 'फोन नंबर दर्ज करें',
    'Message': 'संदेश',
    'Recipient': 'प्राप्तकर्ता',
    'Review': 'समीक्षा करें',
    'Confirm & Send': 'पुष्टि करें और भेजें',
    'SMS service not configured': 'एसएमएस सेवा कॉन्फ़िगर नहीं है',
    'USSD': 'यूएसएसडी (USSD)',
    'Enter/choose option': 'विकल्प चुनें',
    'Voice Call': 'वॉयस कॉल',
    'Voice Message': 'वॉयस संदेश',
    'Record': 'रिकॉर्ड करें',
    'Stop': 'रोकें',
    'Preview': 'पूर्वावलोकन',
    'Send': 'भेजें',
    'Bluetooth': 'ब्लूटूथ',
    'Connect Device': 'डिवाइस कनेक्ट करें',
    'Bluetooth not supported': 'ब्लूटूथ समर्थित नहीं है',
    'Inbox': 'इनबॉक्स',
    'Outbox': 'आउटबॉक्स',
    'Compose': 'नया संदेश',
    'Confirm Health Data Sharing': 'स्वास्थ्य डेटा साझाकरण की पुष्टि करें',
    'Share Patient Medical Details': 'मरीज के मेडिकल विवरण साझा करें',
    'Consent Confirmation': 'सहमति की पुष्टि',
    'Patient consent obtained for SMS delivery': 'एसएमएस वितरण के लिए मरीज की सहमति प्राप्त की गई',
    'Masked Phone:': 'मास्क किया गया फोन:',
    'Privacy Note': 'गोपनीयता नोट',
    'Data will be transmitted securely over encrypted channels': 'डेटा एन्क्रिप्टेड चैनलों पर सुरक्षित रूप से प्रेषित किया जाएगा',
    'OFFLINE QUEUED': 'ऑफलाइन कतारबद्ध',
    'DELIVERED': 'वितरित',
    'FAILED': 'विफल',
    'DEMO QUEUED': 'डेमो कतारबद्ध',
    'DEMO SENT': 'डेमो भेजा गया',
    'DEMO DELIVERED': 'डेमो वितरित',

    // Emergency & Transport
    'EMERGENCY TRANSPORT': 'आपातकालीन परिवहन',
    'AMBULANCE': 'एम्बुलेंस',
    'CAR': 'कार / वाहन',
    'TWO-WHEELER': 'दुपहिया वाहन',
    'BICYCLE': 'साइकिल',
    'BUS': 'बस',
    'STRETCHER': 'स्ट्रेचर',
    'LOCATION SHARING': 'स्थान साझाकरण',
    'GPS Coordinates': 'जीपीएस निर्देशांक',
    'Call Ambulance': 'एम्बुलेंस बुलाएं',
    'Dial 108': '108 डायल करें',
    'Dial 112': '112 डायल करें',
    'Dial 102': '102 डायल करें',

    // AI & Symptom Triage & Guidance
    'WHAT TO DO': 'क्या करें',
    'WHAT NOT TO DO': 'क्या न करें',
    'WARNING SIGNS': 'चेतावनी के संकेत',
    'WHEN TO SEEK MEDICAL CARE': 'चिकित्सा देखभाल कब लें',
    'URGENCY': 'अत्यावश्यकता',
    'ROUTINE': 'सामान्य',
    'NEEDS MEDICAL REVIEW': 'चिकित्सकीय समीक्षा आवश्यक',
    'URGENT': 'त्वरित',
    'EMERGENCY': 'आपातकालीन',
    'Symptoms': 'लक्षण',
    'Medical History': 'चिकित्सा इतिहास',
    'AI Summary': 'AI सारांश',
    'Symptoms Analyzer': 'लक्षण विश्लेषक',
    'AI Triage Assistant': 'AI ट्रियाज सहायक',
    'Symptom Analysis': 'लक्षण विश्लेषण',
    'General Guidance': 'सामान्य मार्गदर्शन',
    'Prevention': 'निवारण',
    'Emergency Instructions': 'आपातकालीन निर्देश',

    // Medical Vitals & Terms
    'Blood Pressure': 'रक्तचाप (BP)',
    'Heart Rate': 'हृदय गति',
    'Blood Sugar': 'रक्त शर्करा (शुगर)',
    'Hemoglobin': 'हीमोग्लोबिन',
    'Temperature': 'तापमान',
    'Oxygen Saturation': 'ऑक्सीजन स्तर (SpO2)',
    'SpO2': 'SpO2',
    'Weight': 'वजन',
    'BMI': 'बीएमआई',
    'Normal': 'सामान्य',
    'High Risk': 'उच्च जोखिम',
    'Moderate Risk': 'मध्यम जोखिम',
    'Safe': 'सुरक्षित',
    'Stable': 'स्थिर',
    'Critical': 'गंभीर',
    'Pending': 'लंबित',
    'Referred': 'रेफर किया गया',
    'Scheduled': 'तय किया गया',
    'Completed': 'पूर्ण हुआ',
    'Morning': 'सुबह',
    'Afternoon': 'दोपहर',
    'Evening': 'शाम',
    'Night': 'रात',
    'Before food': 'भोजन से पहले',
    'After food': 'भोजन के बाद',
    'Taken': 'ली गई',
    'Missed': 'छूट गई',
    'Mark Taken': 'दवा ली दर्ज करें',
    'Today': 'आज',
    'Yesterday': 'कल',
    'Tomorrow': 'कल (आगामी)',

    // Common Actions
    'Save': 'सहेजें',
    'Delete': 'हटाएं',
    'Edit': 'संपादित करें',
    'Cancel': 'रद्द करें',
    'Confirm': 'पुष्टि करें',
    'Search': 'खोजें',
    'Filter': 'फिल्टर',
    'Sort': 'क्रमानुसार रखें',
    'Close': 'बंद करें',
    'Back': 'पीछे',
    'Next': 'आगे',
    'Submit': 'जमा करें',
    'Clear Filters': 'फिल्टर साफ करें',
    'View All': 'सभी देखें',
    'Print Report': 'रिपोर्ट प्रिंट करें',
    'Share Summary': 'सारांश साझा करें',
    'SHARE WITH DOCTOR': 'डॉक्टर के साथ साझा करें'
  },
  te: {
    // Navigation & Global Header
    'MEDORA': 'మెడోరా',
    'RURAL HEALTH': 'గ్రామీణ ఆరోగ్యం',
    'Rural Health Continuity Platform': 'గ్రామీణ ఆరోగ్య కొనసాగింపు వేదిక',
    'Rural Medical Emergency? Dial 108 (Ambulance) or 112 (National) immediately.': 'గ్రామీణ వైద్య అత్యవసరమా? వెంటనే 108 (అంబులెన్స్) లేదా 112 (జాతీయ అత్యవసర) కాల్ చేయండి.',
    'ROLE: PATIENT': 'పాత్ర: రోగి',
    'ROLE: FAMILY': 'పాత్ర: కుటుంబం',
    'ROLE: DOCTOR': 'పాత్ర: డాక్టర్',
    'ROLE: ADMIN': 'పాత్ర: గ్రామ అడ్మిన్',
    'ROLE': 'పాత్ర',
    'Persona': 'వ్యక్తిగత ప్రొఫైల్',
    'Patient:': 'రోగి:',
    'Household:': 'కుటుంబం:',
    '🚨 EMERGENCY HELP': '🚨 అత్యవసర సహాయం',
    'EMERGENCY HELP': 'అత్యవసర సహాయం',
    'Emergency Help': 'అత్యవసర సహాయం',
    'Sign Out': 'లాగ్ అవుట్',
    'Sign In': 'లాగిన్ చేయండి',
    'Log In': 'లాగిన్',
    'Low Data': 'తక్కువ డేటా',
    'Low Data On': 'తక్కువ డేటా ఆన్',
    'Offline Demo': 'ఆఫ్‌లైన్ డెమో',
    'Offline Demo On': 'ఆఫ్‌లైన్ ఆన్',
    'Simple Mode': 'సరళమైన మోడ్',
    'Listen': 'వినండి',
    'Playing audio...': 'ఆడియో ప్లే అవుతోంది...',
    'DEMO DATA': 'డెమో డేటా',
    'Demo Data': 'డెమో డేటా',
    'Online (Direct)': 'ఆన్‌లైన్ (డైరెక్ట్)',
    'Limited (2G/Edge)': 'పరిమితం (2G/Edge)',
    'Offline (Store & Forward)': 'ఆఫ్‌లైన్ (స్టోర్ & ఫార్వర్డ్)',
    'Rural Connectivity Simulator:': 'గ్రామీణ కనెక్టివిటీ సిమ్యులేటర్:',
    'More ▾': 'మరిన్ని ▾',
    'More': 'మరిన్ని',

    // Tabs & Sections
    'Dashboard': 'డ్యాష్‌బోర్డ్',
    '🏠 Dashboard': '🏠 డ్యాష్‌బోర్డ్',
    'Children': 'పిల్లల సంరక్షణ',
    '👶 Children': '👶 పిల్లల సంరక్షణ',
    'Maternity': 'గర్భిణీ సంరక్షణ',
    '🤰 Maternity': '🤰 గర్భిణీ సంరక్షణ',
    'Elderly': 'వృద్ధుల సంరక్షణ',
    '👵 Elderly': '👵 వృద్ధుల సంరక్షణ',
    'Diseases': 'వ్యాధుల సమాచారం',
    '🛡️ Diseases': '🛡️ వ్యాధుల సమాచారం',
    'AI Camera': 'AI కెమెరా',
    '📷 AI Camera': '📷 AI కెమెరా',
    'Medicine Check': 'మందుల తనిఖీ',
    '💊 Medicine Check': '💊 మందుల తనిఖీ',
    'X-Ray & Reports': 'ఎక్స్-రే & రిపోర్టులు',
    '🔬 X-Ray & Reports': '🔬 ఎక్స్-రే & రిపోర్టులు',
    'Ask AI': 'AI ని అడగండి',
    '🤖 Ask AI': '🤖 AI ని అడగండి',
    'Ask Medora AI': 'మెడోరా AI ని అడగండి',
    'A2A Protocol': 'A2A ప్రోటోకాల్',
    '🔄 A2A Protocol': '🔄 A2A ప్రోటోకాల్',
    'Doctor Summary': 'డాక్టర్ సారాంశం',
    '📋 Doctor Summary': '📋 డాక్టర్ సారాంశం',
    'Hospital Portal': 'ఆసుపత్రి పోర్టల్',
    '🏥 Hospital Portal': '🏥 ఆసుపత్రి పోర్టల్',
    'Govt Schemes': 'ప్రభుత్వ పథకాలు',
    '🏛️ Govt Schemes': '🏛️ ప్రభుత్వ పథకాలు',
    'Emergency & Maps': 'అత్యవసర & మ్యాపులు',
    '🗺️ Emergency & Maps': '🗺️ అత్యవసర & మ్యాపులు',
    'Village Admin': 'గ్రామ పరిపాలన',
    '🏛️ Village Admin': '🏛️ గ్రామ పరిపాలన',
    'Family': 'కుటుంబం',
    '👨‍👩‍👧‍👦 Family': '👨‍👩‍👧‍👦 కుటుంబం',
    'Medicines': 'మందులు',
    '💊 Medicines': '💊 మందులు',
    'Medical Reports': 'మెడికల్ నివేదికలు',
    '📜 Medical Reports': '📜 మెడికల్ నివేదికలు',

    // Dashboard & Care Hubs
    'YOUR HEALTH TODAY': 'ఈరోజు మీ ఆరోగ్యం',
    'SPECIALIZED POPULATION CARE HUBS': 'ప్రత్యేక ఆరోగ్య సంరక్షణ విభాగాలు',
    'PRIMARY DOCTOR AVAILABILITY & SUBSTITUTES': 'ప్రాథమిక డాక్టర్ లభ్యత & ప్రత్యామ్నాయాలు',
    'DOCTOR / PRIMARY DOCTOR AVAILABILITY SECTION': 'డాక్టర్ / ప్రాథమిక డాక్టర్ లభ్యత విభాగం',
    'Children Care Hub': 'పిల్లల సంరక్షణ విభాగం',
    'Maternity & Postpartum Hub': 'గర్భిణీ & ప్రసవానంతర విభాగం',
    'Elderly Care Hub': 'వృద్ధుల సంరక్షణ విభాగం',
    'Rural Disease Guide': 'గ్రామీణ వ్యాధుల మార్గదర్శి',
    'HEALTH SCORE': 'ఆరోగ్య స్కోరు',
    'Priority Rural Care Tiers': 'ప్రాధాన్యత గ్రామీణ ఆరోగ్య విభాగాలు',
    'Essential Care for Vulnerable Family Members': 'కుటుంబ సభ్యుల కోసం అత్యవసర సంరక్షణ',
    'Dedicated health support for seniors, expecting mothers, and infants with 1-click clinical access.': 'వృద్ధులు, కాబోయే తల్లులు మరియు శిశువుల కోసం 1-క్లిక్ వైద్య సేవలు.',
    'Elderly Care': 'వృద్ధుల సంరక్షణ',
    '👵 Elderly Care': '👵 వృద్ధుల సంరక్షణ',
    'Ages 60+': 'వయస్సు 60+ సం.',
    'Maternal Care': 'గర్భిణీ సంరక్షణ',
    '🤰 Maternal Care': '🤰 గర్భిణీ సంరక్షణ',
    'Trimester 1 - 3': 'త్రైమాసికం 1 - 3',
    'Child Care': 'పిల్లల సంరక్షణ',
    '👶 Child Care': '👶 పిల్లల సంరక్షణ',
    'Ages 0 - 5': 'వయస్సు 0 - 5 సం.',
    'Find Senior Doctor': 'సీనియర్ డాక్టర్‌ను కనుగొనండి',
    'Trimester Guide': 'త్రైమాసిక గైడ్',
    'Child Care & Vaccines': 'పిల్లల సంరక్షణ & టీకాలు',

    // Doctor Roster & Cards
    'Primary Physician': 'ప్రాథమిక వైద్యుడు',
    'Backup Duty Physician': 'బ్యాకప్ విధి వైద్యుడు',
    'Specialist': 'స్పెషలిస్ట్',
    'Live Roster Status': 'లైవ్ రోస్టర్ స్థితి',
    'Available Today': 'ఈరోజు అందుబాటులో ఉన్నారు',
    'Available': 'అందుబాటులో ఉన్నారు',
    'Off Duty': 'విధిలో లేరు',
    'Referral Only': 'రెఫరల్ మాత్రమే',
    'DEMO DOCTOR': 'డెమో డాక్టర్',
    'View Profile': 'ప్రొఫైల్ చూడండి',
    'Request Consultation': 'సమాలోచన అభ్యర్థించండి',
    'Send Health Summary': 'ఆరోగ్య సారాంశం పంపండి',
    'Qualifications': 'అర్హతలు',
    'Experience': 'అనుభవం',
    'Available Days & Time': 'అందుబాటులో ఉన్న రోజులు & సమయం',
    'Languages Spoken': 'మాట్లాడే భాషలు',

    // Family Page & Roster
    'Family Health & Household Roster': 'కుటుంబ ఆరోగ్యం & సభ్యుల జాబితా',
    'Kumar Family': 'కుమార్ కుటుంబం',
    'Family ID': 'కుటుంబ ఐడి',
    'Primary Contact': 'ముఖ్య సంప్రదింపు',
    'Total Family Members': 'మొత్తం కుటుంబ సభ్యులు',
    'High-Risk Members': 'అధిక ప్రమాదకర సభ్యులు',
    'Pending Checkups': 'పెండింగ్ తనిఖీలు',
    'View Health': 'ఆరోగ్యం చూడండి',
    'Share Details': 'వివరాలు షేర్ చేయండి',
    'Share Report': 'రిపోర్ట్ షేర్ చేయండి',
    'Grandfather / Senior': 'తాతగారు / సీనియర్',
    'Mother / Pregnant (Trimester 2)': 'తల్లి / గర్భిణీ (త్రైమాసికం 2)',
    'Son / Child (Pediatric)': 'కుమారుడు / చిన్నారి (పిల్లల విభాగం)',
    'Daughter / Diabetic Care': 'కుమార్తె / షుగర్ సంరక్షణ',
    'Father / Primary Earner': 'తండ్రి / ముఖ్య సంపాదనపరుడు',
    'Household Roster': 'కుటుంబ జాబితా',
    'Family Overview': 'కుటుంబ సారాంశం',
    'Recent Family Activity': 'ఇటీవలి కుటుంబ కార్యకలాపాలు',

    // Communication Center & SMS & Share
    'Medora Communication Center': 'మెడోరా సంప్రదింపు కేంద్రం',
    'Messages & Share': 'సందేశాలు & షేర్',
    '📬 Messages & Share': '📬 సందేశాలు & షేర్',
    'Communication Center & Share': 'సంప్రదింపు కేంద్రం & షేర్',
    'Open Communication Center': 'సంప్రదింపు కేంద్రం తెరువు',
    'Send SMS': 'SMS పంపండి',
    'Enter phone number': 'ఫోన్ నంబర్ నమోదు చేయండి',
    'Message': 'సందేశం',
    'Recipient': 'స్వీకరించేవారు',
    'Review': 'సమీక్షించండి',
    'Confirm & Send': 'ధృవీకరించి పంపండి',
    'USSD': 'USSD',
    'Voice Call': 'వాయిస్ కాల్',
    'Voice Message': 'వాయిస్ సందేశం',
    'Record': 'రికార్డు చేయి',
    'Stop': 'ఆపు',
    'Preview': 'ముందుజూపు',
    'Send': 'పంపు',
    'Bluetooth': 'బ్లూటూత్',
    'Connect Device': 'పరికరాన్ని అనుసంధానించు',
    'Bluetooth not supported': 'బ్లూటూత్ మద్దతు లేదు',
    'Inbox': 'ఇన్‌బాక్స్',
    'Outbox': 'అవుట్‌బాక్స్',
    'Compose': 'కొత్త సందేశం',
    'Confirm Health Data Sharing': 'ఆరోగ్య సమాచారం పంచుకోవడాన్ని ధృవీకరించండి',
    'Share Patient Medical Details': 'రోగి వైద్య వివరాలను పంచుకోండి',
    'Consent Confirmation': 'సమ్మతి ధృవీకరణ',
    'Patient consent obtained for SMS delivery': 'SMS ద్వారా నివేదికలు పొందటానికి రోగి సమ్మతి తీసుకోబడింది',
    'Masked Phone:': 'మరుగుపరిచిన ఫోన్:',
    'Privacy Note': 'గోప్యతా గమనిక',
    'Data will be transmitted securely over encrypted channels': 'సమాచారం ఎన్‌క్రిప్ట్ చేయబడిన మార్గాల ద్వారా సురక్షితంగా పంపబడుతుంది',
    'OFFLINE QUEUED': 'ఆఫ్‌లైన్ క్యూలో ఉంది',
    'DELIVERED': 'చేరింది',
    'FAILED': 'విఫలమైంది',
    'DEMO QUEUED': 'డెమో క్యూలో ఉంది',
    'DEMO SENT': 'డెమో పంపబడింది',
    'DEMO DELIVERED': 'డెమో చేరింది',

    // Emergency & Transport
    'EMERGENCY TRANSPORT': 'అత్యవసర రవాణా',
    'AMBULANCE': 'అంబులెన్స్',
    'CAR': 'కారు',
    'TWO-WHEELER': 'ద్విచక్ర వాహనం',
    'BICYCLE': 'సైకిల్',
    'BUS': 'బస్సు',
    'STRETCHER': 'స్ట్రెచర్',
    'LOCATION SHARING': 'స్థాన లభ్యత పంచుకోవడం',
    'GPS Coordinates': 'GPS కోఆర్డినేట్లు',
    'Call Ambulance': 'అంబులెన్స్‌ను పిలవండి',
    'Dial 108': '108కి కాల్ చేయండి',
    'Dial 112': '112కి కాల్ చేయండి',
    'Dial 102': '102కి కాల్ చేయండి',

    // AI & Symptom Triage & Guidance
    'WHAT TO DO': 'ఏమి చేయాలి',
    'WHAT NOT TO DO': 'ఏమి చేయకూడదు',
    'WARNING SIGNS': 'హెచ్చరిక సంకేతాలు',
    'WHEN TO SEEK MEDICAL CARE': 'వైద్య సహాయం ఎప్పుడు పొందాలి',
    'URGENCY': 'అత్యవసరత',
    'ROUTINE': 'సాధారణం',
    'NEEDS MEDICAL REVIEW': 'వైద్య పరిశీలన అవసరం',
    'URGENT': 'త్వరితం',
    'EMERGENCY': 'అత్యవసరం',
    'Symptoms': 'లక్షణాలు',
    'Medical History': 'వైద్య చరిత్ర',
    'AI Summary': 'AI సారాంశం',
    'Symptoms Analyzer': 'లక్షణాల విశ్లేషణ',
    'AI Triage Assistant': 'AI వైద్య ప్రాధాన్య సహాయకుడు',
    'Symptom Analysis': 'లక్షణ విశ్లేషణ',
    'General Guidance': 'సాధారణ మార్గదర్శకత్వం',
    'Prevention': 'నివారణ',
    'Emergency Instructions': 'అత్యవసర సూచనలు',

    // Medical Vitals & Terms
    'Blood Pressure': 'రక్తపోటు (BP)',
    'Heart Rate': 'గుండె స్పందన రేటు',
    'Blood Sugar': 'రక్తంలో చక్కెర (షుగర్)',
    'Hemoglobin': 'హిమోగ్లోబిన్',
    'Temperature': 'ఉష్ణోగ్రత',
    'Oxygen Saturation': 'ఆక్సిజన్ స్థాయి (SpO2)',
    'SpO2': 'SpO2',
    'Weight': 'బరువు',
    'BMI': 'బీఎమ్‌ఐ (BMI)',
    'Normal': 'సాధారణం',
    'High Risk': 'అధిక ప్రమాదం',
    'Moderate Risk': 'మధ్యస్థ ప్రమాదం',
    'Safe': 'సురక్షితం',
    'Stable': 'స్థిరంగా ఉంది',
    'Critical': 'తీవ్రమైనది',
    'Pending': 'పెండింగ్',
    'Referred': 'రెఫర్ చేయబడింది',
    'Scheduled': 'నిర్ణయించబడింది',
    'Completed': 'పూర్తయింది',
    'Morning': 'ఉదయం',
    'Afternoon': 'మధ్యాహ్నం',
    'Evening': 'సాయంత్రం',
    'Night': 'రాత్రి',
    'Before food': 'భోజనానికి ముందు',
    'After food': 'భోజనం తర్వాత',
    'Taken': 'తీసుకున్నారు',
    'Missed': 'తీసుకోలేదు',
    'Mark Taken': 'తీసుకున్నట్లు గుర్తించు',
    'Today': 'ఈరోజు',
    'Yesterday': 'నిన్న',
    'Tomorrow': 'రేపు',

    // Common Actions
    'Save': 'భద్రపరుచు',
    'Delete': 'తొలగించు',
    'Edit': 'సవరించు',
    'Cancel': 'రద్దు చేయి',
    'Confirm': 'ధృవీకరించు',
    'Search': 'శోధించు',
    'Filter': 'ఫిల్టర్',
    'Sort': 'క్రమబద్ధీకరించు',
    'Close': 'మూసివేయి',
    'Back': 'వెనుకకు',
    'Next': 'తరువాత',
    'Submit': 'సమర్పించు',
    'Clear Filters': 'ఫిల్టర్లు క్లియర్ చేయండి',
    'View All': 'అన్నీ చూడండి',
    'Print Report': 'రిపోర్ట్ ప్రింట్ చేయండి',
    'Share Summary': 'సారాంశం షేర్ చేయండి',
    'SHARE WITH DOCTOR': 'డాక్టర్‌తో పంచుకోండి'
  },
  ml: {
    // Navigation & Global Header
    'MEDORA': 'മെഡോറ',
    'RURAL HEALTH': 'ഗ്രാമീണ ആരോഗ്യം',
    'Rural Health Continuity Platform': 'ഗ്രാമീണ ആരോഗ്യ സംരക്ഷണ പ്ലാറ്റ്‌ഫോം',
    'Rural Medical Emergency? Dial 108 (Ambulance) or 112 (National) immediately.': 'ഗ്രാമീണ മെഡിക്കൽ അടിയന്തരാവസ്ഥയോ? ഉടൻ 108 (ആംബുലൻസ്) അല്ലെങ്കിൽ 112 (ദേശീയ അടിയന്തരാവസ്ഥ) വിളിക്കുക.',
    'ROLE: PATIENT': 'റോൾ: രോഗി',
    'ROLE: FAMILY': 'റോൾ: കുടുംബം',
    'ROLE: DOCTOR': 'റോൾ: ഡോക്ടർ',
    'ROLE: ADMIN': 'റോൾ: അഡ്മിൻ',
    'ROLE': 'റോൾ',
    'Persona': 'പ്രൊഫൈൽ',
    'Patient:': 'രോഗി:',
    'Household:': 'കുടുംബം:',
    '🚨 EMERGENCY HELP': '🚨 അടിയന്തര സഹായം',
    'EMERGENCY HELP': 'അടിയന്തര സഹായം',
    'Emergency Help': 'അടിയന്തര സഹായം',
    'Sign Out': 'ലോഗ് ഔട്ട്',
    'Sign In': 'ലോഗിൻ ചെയ്യുക',
    'Log In': 'ലോഗിൻ',
    'Low Data': 'കുറഞ്ഞ ഡാറ്റ',
    'Low Data On': 'കുറഞ്ഞ ഡാറ്റ ഓൺ',
    'Offline Demo': 'ഓഫ്‌ലൈൻ ഡെമോ',
    'Offline Demo On': 'ഓഫ്‌ലൈൻ ഓൺ',
    'Simple Mode': 'ലളിതമായ മോഡ്',
    'Listen': 'കേൾക്കുക',
    'Playing audio...': 'ശബ്ദം പ്ലേ ചെയ്യുന്നു...',
    'DEMO DATA': 'ഡെമോ ഡാറ്റ',
    'Demo Data': 'ഡെമോ ഡാറ്റ',
    'Online (Direct)': 'ഓൺലൈൻ (ഡയറക്റ്റ്)',
    'Limited (2G/Edge)': 'പരിമിതം (2G/Edge)',
    'Offline (Store & Forward)': 'ഓഫ്‌ലൈൻ (സ്റ്റോർ & ഫോർവേഡ്)',
    'Rural Connectivity Simulator:': 'കണക്റ്റിവിറ്റി സിമുലേറ്റർ:',
    'More ▾': 'കൂടുതൽ ▾',
    'More': 'കൂടുതൽ',

    // Tabs & Sections
    'Dashboard': 'ഡാഷ്‌ബോർഡ്',
    '🏠 Dashboard': '🏠 ഡാഷ്‌ബോർഡ്',
    'Children': 'കുട്ടികളുടെ സംരക്ഷണം',
    '👶 Children': '👶 കുട്ടികളുടെ സംരക്ഷണം',
    'Maternity': 'മാതൃ സംരക്ഷണം',
    '🤰 Maternity': '🤰 മാതൃ സംരക്ഷണം',
    'Elderly': 'വയോജന സംരക്ഷണം',
    '👵 Elderly': '👵 വയോജന സംരക്ഷണം',
    'Diseases': 'രോഗ വിവരങ്ങൾ',
    '🛡️ Diseases': '🛡️ രോഗ വിവരങ്ങൾ',
    'AI Camera': 'AI ക്യാമറ',
    '📷 AI Camera': '📷 AI ക്യാമറ',
    'Medicine Check': 'മരുന്ന് പരിശോധന',
    '💊 Medicine Check': '💊 മരുന്ന് പരിശോധന',
    'X-Ray & Reports': 'എക്സ്-റേ & റിപ്പോർട്ടുകൾ',
    '🔬 X-Ray & Reports': '🔬 എക്സ്-റേ & റിപ്പോർട്ടുകൾ',
    'Ask AI': 'AI ചോദിക്കുക',
    '🤖 Ask AI': '🤖 AI ചോദിക്കുക',
    'Ask Medora AI': 'മെഡോറ AI ചോദിക്കുക',
    'A2A Protocol': 'A2A പ്രോട്ടോക്കോൾ',
    '🔄 A2A Protocol': '🔄 A2A പ്രോട്ടോക്കോൾ',
    'Doctor Summary': 'ഡോക്ടർ സംഗ്രഹം',
    '📋 Doctor Summary': '📋 ഡോക്ടർ സംഗ്രഹം',
    'Hospital Portal': 'ആശുപത്രി പോർട്ടൽ',
    '🏥 Hospital Portal': '🏥 ആശുപത്രി പോർട്ടൽ',
    'Govt Schemes': 'സർക്കാർ പദ്ധതികൾ',
    '🏛️ Govt Schemes': '🏛️ സർക്കാർ പദ്ധതികൾ',
    'Emergency & Maps': 'അടിയന്തരാവസ്ഥ & മാപ്പുകൾ',
    '🗺️ Emergency & Maps': '🗺️ അടിയന്തരാവസ്ഥ & മാപ്പുകൾ',
    'Village Admin': 'വില്ലേജ് അഡ്മിൻ',
    '🏛️ Village Admin': '🏛️ വില്ലേജ് അഡ്മിൻ',
    'Family': 'കുടുംബം',
    '👨‍👩‍👧‍👦 Family': '👨‍👩‍👧‍👦 കുടുംബം',
    'Medicines': 'മരുന്നുകൾ',
    '💊 Medicines': '💊 മരുന്നുകൾ',
    'Medical Reports': 'മെഡിക്കൽ റിപ്പോർട്ടുകൾ',
    '📜 Medical Reports': '📜 മെഡിക്കൽ റിപ്പോർട്ടുകൾ',

    // Dashboard & Care Hubs
    'YOUR HEALTH TODAY': 'ഇന്ന് നിങ്ങളുടെ ആരോഗ്യം',
    'SPECIALIZED POPULATION CARE HUBS': 'പ്രത്യേക ആരോഗ്യ പരിചരണ കേന്ദ്രങ്ങൾ',
    'PRIMARY DOCTOR AVAILABILITY & SUBSTITUTES': 'പ്രാഥമിക ഡോക്ടർ ലഭ്യതയും പകരക്കാരും',
    'DOCTOR / PRIMARY DOCTOR AVAILABILITY SECTION': 'ഡോക്ടർ / പ്രാഥമിക ഡോക്ടർ ഡ്യൂട്ടി ഭാഗം',
    'Children Care Hub': 'കുട്ടികളുടെ ആരോഗ്യ കേന്ദ്രം',
    'Maternity & Postpartum Hub': 'മാതൃ-പ്രസവാനന്തര ആരോഗ്യ കേന്ദ്രം',
    'Elderly Care Hub': 'വയോജന പരിചരണ കേന്ദ്രം',
    'Rural Disease Guide': 'ഗ്രാമീണ രോഗ വിവര ഗൈഡ്',
    'HEALTH SCORE': 'ആരോഗ്യ സ്കോർ',
    'Priority Rural Care Tiers': 'മുൻഗണനാ ഗ്രാമീണ ആരോഗ്യ വിഭാഗങ്ങൾ',
    'Essential Care for Vulnerable Family Members': 'കുടുംബാംഗങ്ങൾക്കുള്ള അത്യന്താപേക്ഷിതമായ പരിചരണം',
    'Dedicated health support for seniors, expecting mothers, and infants with 1-click clinical access.': 'മുതിർന്നവർക്കും ഗർഭിണികൾക്കും കുട്ടികൾക്കുമുള്ള 1-ക്ലിക്ക് ക്ലിനിക്കൽ പ്രവേശനം.',
    'Elderly Care': 'വയോജന പരിചരണം',
    '👵 Elderly Care': '👵 വയോജന പരിചരണം',
    'Ages 60+': 'പ്രായം 60+',
    'Maternal Care': 'മാതൃ പരിചരണം',
    '🤰 Maternal Care': '🤰 മാതൃ പരിചരണം',
    'Trimester 1 - 3': 'ത്രിമാസം 1 - 3',
    'Child Care': 'ശിശു പരിചരണം',
    '👶 Child Care': '👶 ശിശു പരിചരണം',
    'Ages 0 - 5': 'പ്രായം 0 - 5',
    'Find Senior Doctor': 'മുതിർന്ന ഡോക്ടറെ കണ്ടെത്തുക',
    'Trimester Guide': 'ത്രിമാസ ഗൈഡ്',
    'Child Care & Vaccines': 'ശിശു പരിചരണവും വാക്സിനുകളും',

    // Doctor Roster & Cards
    'Primary Physician': 'പ്രാഥമിക ഡോക്ടർ',
    'Backup Duty Physician': 'ബാക്കപ്പ് ഡ്യൂട്ടി ഡോക്ടർ',
    'Specialist': 'സ്പെഷ്യലിസ്റ്റ്',
    'Live Roster Status': 'ലൈവ് ഡ്യൂട്ടി നില',
    'Available Today': 'ഇന്ന് ലഭ്യമാണ്',
    'Available': 'ലഭ്യമാണ്',
    'Off Duty': 'ഡ്യൂട്ടിയിലില്ല',
    'Referral Only': 'റഫറൽ മാത്രം',
    'DEMO DOCTOR': 'ഡെമോ ഡോക്ടർ',
    'View Profile': 'പ്രൊഫൈൽ കാണുക',
    'Request Consultation': 'കൺസൾട്ടേഷൻ അഭ്യർത്ഥിക്കുക',
    'Send Health Summary': 'ആരോഗ്യ സംഗ്രഹം അയക്കുക',
    'Qualifications': 'യോഗ്യതകൾ',
    'Experience': 'പരിചയം',
    'Available Days & Time': 'ലഭ്യമായ ദിവസങ്ങളും സമയവും',
    'Languages Spoken': 'സംസാരിക്കുന്ന ഭാഷകൾ',

    // Family Page & Roster
    'Family Health & Household Roster': 'കുടുംബ ആരോഗ്യവും അംഗങ്ങളുടെ വിവരങ്ങളും',
    'Kumar Family': 'കുമാർ കുടുംബം',
    'Family ID': 'കുടുംബ ഐഡി',
    'Primary Contact': 'പ്രധാന ബന്ധപ്പെടേണ്ട നമ്പർ',
    'Total Family Members': 'ആകെ കുടുംബാംഗങ്ങൾ',
    'High-Risk Members': 'ഉയർന്ന അപകടസാധ്യതയുള്ളവർ',
    'Pending Checkups': 'തീർപ്പുകൽപ്പിക്കാത്ത പരിശോധനകൾ',
    'View Health': 'ആരോഗ്യം കാണുക',
    'Share Details': 'വിവരങ്ങൾ പങ്കിടുക',
    'Share Report': 'റിപ്പോർട്ട് പങ്കിടുക',
    'Grandfather / Senior': 'മുത്തശ്ശൻ / മുതിർന്ന പൗരൻ',
    'Mother / Pregnant (Trimester 2)': 'അമ്മ / ഗർഭിണി (രണ്ടാം ത്രിമാസം)',
    'Son / Child (Pediatric)': 'മകൻ / കുട്ടി (ശിശു പരിചരണം)',
    'Daughter / Diabetic Care': 'മകൾ / പ്രമേഹ പരിചരണം',
    'Father / Primary Earner': 'അച്ഛൻ / കുടുംബനാഥൻ',
    'Household Roster': 'കുടുംബാംഗ പട്ടിക',
    'Family Overview': 'കുടുംബ അവലോകനം',
    'Recent Family Activity': 'അടുത്തിടെയുള്ള കുടുംബ വിവരങ്ങൾ',

    // Communication Center & SMS & Share
    'Medora Communication Center': 'മെഡോറ ആശയവിനിമയ കേന്ദ്രം',
    'Messages & Share': 'സന്ദേശങ്ങളും പങ്കിടലും',
    '📬 Messages & Share': '📬 സന്ദേശങ്ങളും പങ്കിടലും',
    'Communication Center & Share': 'ആശയവിനിമയ കേന്ദ്രവും പങ്കിടലും',
    'Open Communication Center': 'ആശയവിനിമയ കേന്ദ്രം തുറക്കുക',
    'Send SMS': 'SMS അയക്കുക',
    'Enter phone number': 'ഫോൺ നമ്പർ നൽകുക',
    'Message': 'സന്ദേശം',
    'Recipient': 'സ്വീകർത്താവ്',
    'Review': 'പരിശോധിക്കുക',
    'Confirm & Send': 'സ്ഥിരീകരിച്ച് അയക്കുക',
    'USSD': 'USSD',
    'Voice Call': 'വോയിസ് കോൾ',
    'Voice Message': 'വോയിസ് സന്ദേശം',
    'Record': 'റെക്കോർഡ് ചെയ്യുക',
    'Stop': 'നിർത്തുക',
    'Preview': 'മുൻകാഴ്ച',
    'Send': 'അയക്കുക',
    'Bluetooth': 'ബ്ലൂടൂത്ത്',
    'Connect Device': 'ഉപകരണം ബന്ധിപ്പിക്കുക',
    'Bluetooth not supported': 'ബ്ലൂടൂത്ത് പിന്തുണയ്ക്കുന്നില്ല',
    'Inbox': 'ഇൻബോക്സ്',
    'Outbox': 'ഔട്ട്ബോക്സ്',
    'Compose': 'പുതിയ സന്ദേശം',
    'Confirm Health Data Sharing': 'ആരോഗ്യ വിവരങ്ങൾ പങ്കിടുന്നത് സ്ഥിരീകരിക്കുക',
    'Share Patient Medical Details': 'രോഗിയുടെ മെഡിക്കൽ വിവരങ്ങൾ പങ്കിടുക',
    'Consent Confirmation': 'സമ്മതപത്ര സ്ഥിരീകരണം',
    'Patient consent obtained for SMS delivery': 'SMS വഴി വിവരങ്ങൾ അയക്കുന്നതിന് രോഗിയുടെ സമ്മതം ലഭ്യമാക്കിയിട്ടുണ്ട്',
    'Masked Phone:': 'മറച്ച ഫോൺ നമ്പർ:',
    'Privacy Note': 'രഹസ്യസ്വഭാവ കുറിപ്പ്',
    'Data will be transmitted securely over encrypted channels': 'വിവരങ്ങൾ സുരക്ഷിതമായി അയക്കപ്പെടും',
    'OFFLINE QUEUED': 'ഓഫ്‌ലൈൻ ക്യൂവിൽ',
    'DELIVERED': 'എത്തിച്ചു',
    'FAILED': 'പരാജയപ്പെട്ടു',
    'DEMO QUEUED': 'ഡെമോ ക്യൂവിൽ',
    'DEMO SENT': 'ഡെമോ അയച്ചു',
    'DEMO DELIVERED': 'ഡെമോ എത്തിച്ചു',

    // Emergency & Transport
    'EMERGENCY TRANSPORT': 'അടിയന്തര ഗതാഗതം',
    'AMBULANCE': 'ആംബുലൻസ്',
    'CAR': 'കാർ',
    'TWO-WHEELER': 'ഇരുചക്ര വാഹനം',
    'BICYCLE': 'സൈക്കിൾ',
    'BUS': 'ബസ്',
    'STRETCHER': 'സ്ട്രെച്ചർ',
    'LOCATION SHARING': 'ലൊക്കേഷൻ പങ്കിടൽ',
    'GPS Coordinates': 'ജിപിഎസ് വിവരങ്ങൾ',
    'Call Ambulance': 'ആംബുലൻസ് വിളിക്കുക',
    'Dial 108': '108 ലേക്ക് വിളിക്കുക',
    'Dial 112': '112 ലേക്ക് വിളിക്കുക',
    'Dial 102': '102 ലേക്ക് വിളിക്കുക',

    // AI & Symptom Triage & Guidance
    'WHAT TO DO': 'ചെയ്യേണ്ട കാര്യങ്ങൾ',
    'WHAT NOT TO DO': 'ചെയ്യരുതാത്ത കാര്യങ്ങൾ',
    'WARNING SIGNS': 'മുന്നറിയിപ്പ് ലക്ഷണങ്ങൾ',
    'WHEN TO SEEK MEDICAL CARE': 'എപ്പോൾ ചികിത്സ തേടണം',
    'URGENCY': 'അടിയന്തിരത',
    'ROUTINE': 'സാധാരണ',
    'NEEDS MEDICAL REVIEW': 'വൈദ്യപരിശോധന ആവശ്യമാണ്',
    'URGENT': 'അടിയന്തിരം',
    'EMERGENCY': 'അടിയന്തരാവസ്ഥ',
    'Symptoms': 'ലക്ഷണങ്ങൾ',
    'Medical History': 'ചികിത്സാ ചരിത്രം',
    'AI Summary': 'AI സംഗ്രഹം',
    'Symptoms Analyzer': 'ലക്ഷണ വിശകലനം',
    'AI Triage Assistant': 'AI സഹായ സംവിധാനം',
    'Symptom Analysis': 'ലക്ഷണ വിശകലനം',
    'General Guidance': 'പൊതുവായ മാർഗ്ഗനിർദ്ദേശം',
    'Prevention': 'പ്രതിരോധം',
    'Emergency Instructions': 'അടിയന്തര നിർദ്ദേശങ്ങൾ',

    // Medical Vitals & Terms
    'Blood Pressure': 'രക്തസമ്മർദ്ദം (BP)',
    'Heart Rate': 'ഹൃദയമിടിപ്പ് നിരക്ക്',
    'Blood Sugar': 'രക്തത്തിലെ പഞ്ചസാര',
    'Hemoglobin': 'ഹീമോഗ്ലോബിൻ',
    'Temperature': 'താപനില',
    'Oxygen Saturation': 'ഓക്സിജൻ അളവ് (SpO2)',
    'SpO2': 'SpO2',
    'Weight': 'ഭാരം',
    'BMI': 'ബിഎംഐ (BMI)',
    'Normal': 'സാധാരണം',
    'High Risk': 'ഉയർന്ന അപകടസാധ്യത',
    'Moderate Risk': 'ഇടത്തരം അപകടസാധ്യത',
    'Safe': 'സുരക്ഷിതം',
    'Stable': 'സ്ഥിരതയുള്ളത്',
    'Critical': 'ഗുരുതരം',
    'Pending': 'തീർപ്പുകൽപ്പിക്കാത്തത്',
    'Referred': 'റഫർ ചെയ്തു',
    'Scheduled': 'ഷെഡ്യൂൾ ചെയ്തു',
    'Completed': 'പൂർത്തിയായി',
    'Morning': 'രാവിലെ',
    'Afternoon': 'ഉച്ചയ്ക്ക്',
    'Evening': 'വൈകുന്നേരം',
    'Night': 'രാത്രി',
    'Before food': 'ഭക്ഷണത്തിന് മുൻപ്',
    'After food': 'ഭക്ഷണത്തിന് ശേഷം',
    'Taken': 'കഴിച്ചു',
    'Missed': 'കഴിച്ചില്ല',
    'Mark Taken': 'കഴിച്ചതായി രേഖപ്പെടുത്തുക',
    'Today': 'ഇന്ന്',
    'Yesterday': 'ഇന്നലെ',
    'Tomorrow': 'നാളെ',

    // Common Actions
    'Save': 'സൂക്ഷിക്കുക',
    'Delete': 'ഒഴിവാക്കുക',
    'Edit': 'തിരുത്തുക',
    'Cancel': 'റദ്ദാക്കുക',
    'Confirm': 'സ്ഥിരീകരിക്കുക',
    'Search': 'തിരയുക',
    'Filter': 'ഫിൽട്ടർ',
    'Sort': 'ക്രമീകരിക്കുക',
    'Close': 'അടയ്ക്കുക',
    'Back': 'പിന്നോട്ട്',
    'Next': 'അടുത്തത്',
    'Submit': 'സമർപ്പിക്കുക',
    'Clear Filters': 'ഫിൽട്ടറുകൾ മാറ്റുക',
    'View All': 'എല്ലാം കാണുക',
    'Print Report': 'റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യുക',
    'Share Summary': 'സംഗ്രഹം ഷെയർ ചെയ്യുക',
    'SHARE WITH DOCTOR': 'ഡോക്ടറുമായി പങ്കിടുക'
  },
  ta: {
    // Navigation & Global Header
    'MEDORA': 'மெடோரா',
    'RURAL HEALTH': 'கிராமப்புற சுகாதாரம்',
    'Rural Health Continuity Platform': 'கிராமப்புற சுகாதார தொடர்ச்சி தளம்',
    'Rural Medical Emergency? Dial 108 (Ambulance) or 112 (National) immediately.': 'கிராமப்புற அவசர மருத்துவ உதவியா? உடனடியாக 108 (ஆம்புலன்ஸ்) அல்லது 112 (தேசிய உதவி) அழைக்கவும்.',
    'ROLE: PATIENT': 'பங்கு: நோயாளி',
    'ROLE: FAMILY': 'பங்கு: குடும்பம்',
    'ROLE: DOCTOR': 'பங்கு: மருத்துவர்',
    'ROLE: ADMIN': 'பங்கு: நிர்வாகி',
    'ROLE': 'பங்கு',
    'Persona': 'சுயவிவரம்',
    'Patient:': 'நோயாளி:',
    'Household:': 'குடும்பம்:',
    '🚨 EMERGENCY HELP': '🚨 அவசர உதவி',
    'EMERGENCY HELP': 'அவசர உதவி',
    'Emergency Help': 'அவசர உதவி',
    'Sign Out': 'வெளியேறு',
    'Sign In': 'உள்நுழைக',
    'Log In': 'உள்நுழைவு',
    'Low Data': 'குறைந்த தரவு',
    'Low Data On': 'குறைந்த தரவு ஆன்',
    'Offline Demo': 'ஆஃப்லைன் டெமோ',
    'Offline Demo On': 'ஆஃப்லைன் ஆன்',
    'Simple Mode': 'எளிய பயன்முறை',
    'Listen': 'கேட்கவும்',
    'Playing audio...': 'ஆடியோ ஒலிக்கிறது...',
    'DEMO DATA': 'மாதிரி தரவு',
    'Demo Data': 'மாதிரி தரவு',
    'Online (Direct)': 'ஆன்லைன் (நேரடி)',
    'Limited (2G/Edge)': 'வரையறுக்கப்பட்ட (2G/Edge)',
    'Offline (Store & Forward)': 'ஆஃப்லைன் (சேமி & அனுப்பு)',
    'Rural Connectivity Simulator:': 'கிராமப்புற இணைப்பு சிமுலேட்டர்:',
    'More ▾': 'மேலும் ▾',
    'More': 'மேலும்',

    // Tabs & Sections
    'Dashboard': 'டாஷ்போர்டு',
    '🏠 Dashboard': '🏠 டாஷ்போர்டு',
    'Children': 'குழந்தைகள் நலம்',
    '👶 Children': '👶 குழந்தைகள் நலம்',
    'Maternity': 'தாய்மை நலம்',
    '🤰 Maternity': '🤰 தாய்மை நலம்',
    'Elderly': 'முதியோர் நலம்',
    '👵 Elderly': '👵 முதியோர் நலம்',
    'Diseases': 'நோய் வழிகாட்டி',
    '🛡️ Diseases': '🛡️ நோய் வழிகாட்டி',
    'AI Camera': 'AI கேமரா',
    '📷 AI Camera': '📷 AI கேமரா',
    'Medicine Check': 'மருந்து சரிபார்ப்பு',
    '💊 Medicine Check': '💊 மருந்து சரிபார்ப்பு',
    'X-Ray & Reports': 'எக்ஸ்-ரே & அறிக்கைகள்',
    '🔬 X-Ray & Reports': '🔬 எக்ஸ்-ரே & அறிக்கைகள்',
    'Ask AI': 'AI-யிடம் கேட்க',
    '🤖 Ask AI': '🤖 AI-யிடம் கேட்க',
    'Ask Medora AI': 'மெடோரா AI-யிடம் கேட்க',
    'A2A Protocol': 'A2A நெறிமுறை',
    '🔄 A2A Protocol': '🔄 A2A நெறிமுறை',
    'Doctor Summary': 'மருத்துவர் அறிக்கை',
    '📋 Doctor Summary': '📋 மருத்துவர் அறிக்கை',
    'Hospital Portal': 'மருத்துவமனை தளம்',
    '🏥 Hospital Portal': '🏥 மருத்துவமனை தளம்',
    'Govt Schemes': 'அரசு திட்டங்கள்',
    '🏛️ Govt Schemes': '🏛️ அரசு திட்டங்கள்',
    'Emergency & Maps': 'அவசர உதவி & வரைபடம்',
    '🗺️ Emergency & Maps': '🗺️ அவசர உதவி & வரைபடம்',
    'Village Admin': 'கிராம நிர்வாகம்',
    '🏛️ Village Admin': '🏛️ கிராம நிர்வாகம்',
    'Family': 'குடும்பம்',
    '👨‍👩‍👧‍👦 Family': '👨‍👩‍👧‍👦 குடும்பம்',
    'Medicines': 'மருந்துகள்',
    '💊 Medicines': '💊 மருந்துகள்',
    'Medical Reports': 'மருத்துவ அறிக்கைகள்',
    '📜 Medical Reports': '📜 மருத்துவ அறிக்கைகள்',

    // Dashboard & Care Hubs
    'YOUR HEALTH TODAY': 'இன்று உங்கள் நலம்',
    'SPECIALIZED POPULATION CARE HUBS': 'சிறப்பு மக்களுக்கான சுகாதார மையங்கள்',
    'PRIMARY DOCTOR AVAILABILITY & SUBSTITUTES': 'முதன்மை மருத்துவர் கிடைக்கும் நிலை & மாற்று மருத்துவர்கள்',
    'DOCTOR / PRIMARY DOCTOR AVAILABILITY SECTION': 'மருத்துவர் / முதன்மை மருத்துவர் கிடைக்கும் பகுதி',
    'Children Care Hub': 'குழந்தைகள் பராமரிப்பு மையம்',
    'Maternity & Postpartum Hub': 'தாய்மை & பிரசவத்திற்கு பிந்தைய மையம்',
    'Elderly Care Hub': 'முதியோர் பராமரிப்பு மையம்',
    'Rural Disease Guide': 'கிராமப்புற நோய் வழிகாட்டி',
    'HEALTH SCORE': 'சுகாதார மதிப்பெண்',
    'Priority Rural Care Tiers': 'முன்னுரிமை கிராமப்புற பராமரிப்பு அடுக்குகள்',
    'Essential Care for Vulnerable Family Members': 'பாதிக்கப்படக்கூடிய குடும்ப உறுப்பினர்களுக்கான அத்தியாவசிய பராமரிப்பு',
    'Dedicated health support for seniors, expecting mothers, and infants with 1-click clinical access.': 'முதியவர்கள், கர்ப்பிணித் தாய்மார்கள் மற்றும் குழந்தைகளுக்கு 1-கிளிக் மருத்துவ அணுகல்.',
    'Elderly Care': 'முதியோர் பராமரிப்பு',
    '👵 Elderly Care': '👵 முதியோர் பராமரிப்பு',
    'Ages 60+': 'வயது 60+',
    'Maternal Care': 'தாய்மை பராமரிப்பு',
    '🤰 Maternal Care': '🤰 தாய்மை பராமரிப்பு',
    'Trimester 1 - 3': 'மும்மாதம் 1 - 3',
    'Child Care': 'குழந்தை பராமரிப்பு',
    '👶 Child Care': '👶 குழந்தை பராமரிப்பு',
    'Ages 0 - 5': 'வயது 0 - 5',
    'Find Senior Doctor': 'முதியோர் மருத்துவரைத் தேடுங்கள்',
    'Trimester Guide': 'மும்மாத வழிகாட்டி',
    'Child Care & Vaccines': 'குழந்தை பராமரிப்பு & தடுப்பூசிகள்',

    // Doctor Roster & Cards
    'Primary Physician': 'முதன்மை மருத்துவர்',
    'Backup Duty Physician': 'மாற்றுப் பணி மருத்துவர்',
    'Specialist': 'சிறப்பு மருத்துவர்',
    'Live Roster Status': 'நேரடி பணி நிலை',
    'Available Today': 'இன்று கிடைக்கும்',
    'Available': 'கிடைக்கும்',
    'Off Duty': 'பணியில் இல்லை',
    'Referral Only': 'பரிந்துரை மட்டுமே',
    'DEMO DOCTOR': 'மாதிரி மருத்துவர்',
    'View Profile': 'சுயவிவரத்தைக் காண்க',
    'Request Consultation': 'ஆலோசனை கோரிக்கை',
    'Send Health Summary': 'சுகாதார அறிக்கையை அனுப்பு',
    'Qualifications': 'தகுதிகள்',
    'Experience': 'அனுபவம்',
    'Available Days & Time': 'கிடைக்கும் நாட்கள் & நேரம்',
    'Languages Spoken': 'பேசும் மொழிகள்',

    // Family Page & Roster
    'Family Health & Household Roster': 'குடும்ப சுகாதாரம் & உறுப்பினர் பட்டியல்',
    'Kumar Family': 'குமார் குடும்பம்',
    'Family ID': 'குடும்ப ஐடி',
    'Primary Contact': 'முதன்மை தொடர்பு',
    'Total Family Members': 'மொத்த குடும்ப உறுப்பினர்கள்',
    'High-Risk Members': 'அதிக ஆபத்துள்ள உறுப்பினர்கள்',
    'Pending Checkups': 'நிலுவையில் உள்ள பரிசோதனைகள்',
    'View Health': 'சுகாதாரத்தைக் காண்க',
    'Share Details': 'விவரங்களைப் பகிரவும்',
    'Share Report': 'அறிக்கையைப் பகிரவும்',
    'Grandfather / Senior': 'தாத்தா / முதியவர்',
    'Mother / Pregnant (Trimester 2)': 'தாய் / கர்ப்பிணி (மும்மாதம் 2)',
    'Son / Child (Pediatric)': 'மகன் / குழந்தை (குழந்தை நலம்)',
    'Daughter / Diabetic Care': 'மகள் / நீரிழிவு பராமரிப்பு',
    'Father / Primary Earner': 'தந்தை / குடும்பத் தலைவர்',
    'Household Roster': 'குடும்ப உறுப்பினர் பட்டியல்',
    'Family Overview': 'குடும்ப சுருக்கம்',
    'Recent Family Activity': 'சமீபத்திய குடும்ப நிகழ்வுகள்',

    // Communication Center & SMS & Share
    'Medora Communication Center': 'மெடோரா தகவல் தொடர்பு மையம்',
    'Messages & Share': 'செய்திகள் & பகிர்வு',
    '📬 Messages & Share': '📬 செய்திகள் & பகிர்வு',
    'Communication Center & Share': 'தகவல் தொடர்பு மையம் & பகிர்வு',
    'Open Communication Center': 'தகவல் தொடர்பு மையத்தைத் திறக்கவும்',
    'Send SMS': 'எஸ்எம்எஸ் அனுப்புக',
    'Enter phone number': 'தொலைபேசி எண்ணை உள்ளிடவும்',
    'Message': 'செய்தி',
    'Recipient': 'பெறுநர்',
    'Review': 'மதிப்பாய்வு',
    'Confirm & Send': 'உறுதிசெய்து அனுப்புக',
    'USSD': 'USSD சேவை',
    'Voice Call': 'குரல் அழைப்பு',
    'Voice Message': 'குரல் செய்தி',
    'Record': 'பதிவு செய்க',
    'Stop': 'நிறுத்து',
    'Preview': 'முன்னோட்டம்',
    'Send': 'அனுப்பு',
    'Bluetooth': 'ப்ளூடூத்',
    'Connect Device': 'சாதனத்தை இணைக்கவும்',
    'Bluetooth not supported': 'ப்ளூடூத் ஆதரவு இல்லை',
    'Inbox': 'இன்பாக்ஸ்',
    'Outbox': 'அவுட்பாக்ஸ்',
    'Compose': 'புதிய செய்தி',
    'Confirm Health Data Sharing': 'சுகாதாரத் தரவுப் பகிர்வை உறுதிப்படுத்தவும்',
    'Share Patient Medical Details': 'நோயாளியின் மருத்துவ விவரங்களைப் பகிரவும்',
    'Consent Confirmation': 'சம்மத உறுதிப்படுத்தல்',
    'Patient consent obtained for SMS delivery': 'எஸ்எம்எஸ் மூலம் தகவல்களைப் பெற நோயாளி சம்மதம் தெரிவித்துள்ளார்',
    'Masked Phone:': 'மறைக்கப்பட்ட போன் எண்:',
    'Privacy Note': 'தனியுரிமைக் குறிப்பு',
    'Data will be transmitted securely over encrypted channels': 'தரவு பாதுகாப்பாக பரிமாறப்படும்',
    'OFFLINE QUEUED': 'ஆஃப்லைனில் வரிசையில் உள்ளது',
    'DELIVERED': 'சேர்க்கப்பட்டது',
    'FAILED': 'தோல்வியடைந்தது',
    'DEMO QUEUED': 'மாதிரி வரிசையில் உள்ளது',
    'DEMO SENT': 'மாதிரி அனுப்பப்பட்டது',
    'DEMO DELIVERED': 'மாதிரி சேர்க்கப்பட்டது',

    // Emergency & Transport
    'EMERGENCY TRANSPORT': 'அவசர போக்குவரத்து',
    'AMBULANCE': 'ஆம்புலன்ஸ்',
    'CAR': 'கார்',
    'TWO-WHEELER': 'இருசக்கர வாகனம்',
    'BICYCLE': 'சைக்கிள்',
    'BUS': 'பேருந்து',
    'STRETCHER': 'ஸ்டிரெச்சர்',
    'LOCATION SHARING': 'இருப்பிடப் பகிர்வு',
    'GPS Coordinates': 'ஜிபிஎஸ் ஆயத்தொலைவுகள்',
    'Call Ambulance': 'ஆம்புலன்ஸை அழைக்கவும்',
    'Dial 108': '108 ஐ அழைக்கவும்',
    'Dial 112': '112 ஐ அழைக்கவும்',
    'Dial 102': '102 ஐ அழைக்கவும்',

    // AI & Symptom Triage & Guidance
    'WHAT TO DO': 'என்ன செய்ய வேண்டும்',
    'WHAT NOT TO DO': 'என்ன செய்யக்கூடாது',
    'WARNING SIGNS': 'எச்சரிக்கை அறிகுறிகள்',
    'WHEN TO SEEK MEDICAL CARE': 'எப்போது மருத்துவ உதவி பெற வேண்டும்',
    'URGENCY': 'அவசரம்',
    'ROUTINE': 'வழக்கமானது',
    'NEEDS MEDICAL REVIEW': 'மருத்துவ ஆய்வு தேவை',
    'URGENT': 'அவசரமானது',
    'EMERGENCY': 'அவசர நிலை',
    'Symptoms': 'அறிகுறிகள்',
    'Medical History': 'மருத்துவ வரலாறு',
    'AI Summary': 'AI சுருக்கம்',
    'Symptoms Analyzer': 'அறிகுறி பகுப்பாய்வு',
    'AI Triage Assistant': 'AI அவசர வகைப்பாடு உதவியாளர்',
    'Symptom Analysis': 'அறிகுறி பகுப்பாய்வு',
    'General Guidance': 'பொதுவான வழிகாட்டுதல்',
    'Prevention': 'தடுப்பு முறைகள்',
    'Emergency Instructions': 'அவசர வழிகாட்டுதல்கள்',

    // Medical Vitals & Terms
    'Blood Pressure': 'இரத்த அழுத்தம் (BP)',
    'Heart Rate': 'இதய துடிப்பு விகிதம்',
    'Blood Sugar': 'இரத்த சர்க்கரை அளவு',
    'Hemoglobin': 'ஹீமோகுளோபின்',
    'Temperature': 'உடல் வெப்பநிலை',
    'Oxygen Saturation': 'ஆக்சிஜன் செறிவு (SpO2)',
    'SpO2': 'SpO2',
    'Weight': 'எடை',
    'BMI': 'பிஎம்ஐ (BMI)',
    'Normal': 'இயல்பானது',
    'High Risk': 'அதிக ஆபத்து',
    'Moderate Risk': 'மிதமான ஆபத்து',
    'Safe': 'பாதுகாப்பானது',
    'Stable': 'நிலையானது',
    'Critical': 'ஆபத்தானது',
    'Pending': 'நிலுவையில் உள்ளது',
    'Referred': 'பரிந்துரைக்கப்பட்டது',
    'Scheduled': 'திட்டமிடப்பட்டது',
    'Completed': 'முடிந்தது',
    'Morning': 'காலை',
    'Afternoon': 'மதியம்',
    'Evening': 'மாலை',
    'Night': 'இரவு',
    'Before food': 'உணவுக்கு முன்',
    'After food': 'உணவுக்கு பின்',
    'Taken': 'சாப்பிடப்பட்டது',
    'Missed': 'தவறவிடப்பட்டது',
    'Mark Taken': 'எடுத்துக்கொண்டதாக குறிக்கவும்',
    'Today': 'இன்று',
    'Yesterday': 'நேற்று',
    'Tomorrow': 'நாளை',

    // Common Actions
    'Save': 'சேமிக்க',
    'Delete': 'நீக்கு',
    'Edit': 'திருத்து',
    'Cancel': 'ரத்து செய்',
    'Confirm': 'உறுதி செய்',
    'Search': 'தேடுக',
    'Filter': 'வடிகட்டு',
    'Sort': 'வரிசைப்படுத்து',
    'Close': 'மூடு',
    'Back': 'பின்னால்',
    'Next': 'அடுத்து',
    'Submit': 'சமர்ப்பி',
    'Clear Filters': 'வடிகட்டிகளை அழிக்கவும்',
    'View All': 'அனைத்தையும் காண்க',
    'Print Report': 'அறிக்கையை அச்சிடுக',
    'Share Summary': 'சுருக்கத்தைப் பகிரவும்',
    'SHARE WITH DOCTOR': 'மருத்துவருடன் பகிரவும்'
  },
  kn: {
    // Navigation & Global Header
    'MEDORA': 'ಮೆಡೋರಾ',
    'RURAL HEALTH': 'ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ',
    'Rural Health Continuity Platform': 'ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ನಿರಂತರತೆ ವೇದಿಕೆ',
    'Rural Medical Emergency? Dial 108 (Ambulance) or 112 (National) immediately.': 'ಗ್ರಾಮೀಣ ವೈದ್ಯಕೀಯ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯೇ? ತಕ್ಷಣ 108 (ಅಂಬ್ಯುಲೆನ್ಸ್) ಅಥವಾ 112 (ರಾಷ್ಟ್ರೀಯ ತುರ್ತು) ಕರೆ ಮಾಡಿ.',
    'ROLE: PATIENT': 'ಪಾತ್ರ: ರೋಗಿ',
    'ROLE: FAMILY': 'ಪಾತ್ರ: ಕುಟುಂಬ',
    'ROLE: DOCTOR': 'ಪಾತ್ರ: ವೈದ್ಯರು',
    'ROLE: ADMIN': 'ಪಾತ್ರ: ಗ್ರಾಮ ಆಡಳಿತ',
    'ROLE': 'ಪಾತ್ರ',
    'Persona': 'ವ್ಯಕ್ತಿತ್ವ',
    'Patient:': 'ರೋಗಿ:',
    'Household:': 'ಕುಟುಂಬ:',
    '🚨 EMERGENCY HELP': '🚨 ತುರ್ತು ಸಹಾಯ',
    'EMERGENCY HELP': 'ತುರ್ತು ಸಹಾಯ',
    'Emergency Help': 'ತುರ್ತು ಸಹಾಯ',
    'Sign Out': 'ಲಾಗ್ ಔಟ್',
    'Sign In': 'ಸೈನ್ ಇನ್',
    'Log In': 'ಲಾಗಿನ್',
    'Low Data': 'ಕಡಿಮೆ ಡೇಟಾ',
    'Low Data On': 'ಕಡಿಮೆ ಡೇಟಾ ಆನ್',
    'Offline Demo': 'ಆಫ್‌ಲೈನ್ ಡೆಮೊ',
    'Offline Demo On': 'ಆಫ್‌ಲೈನ್ ಆನ್',
    'Simple Mode': 'ಸರಳ ಮೋಡ್',
    'Listen': 'ಕೇಳಿ',
    'Playing audio...': 'ಆಡಿಯೊ ಚಾಲನೆಯಲ್ಲಿದೆ...',
    'DEMO DATA': 'ಡೆಮೊ ಡೇಟಾ',
    'Demo Data': 'ಡೆಮೊ ಡೇಟಾ',
    'Online (Direct)': 'ಆನ್‌ಲೈನ್ (ನೇರ)',
    'Limited (2G/Edge)': 'ಸೀಮಿತ (2G/Edge)',
    'Offline (Store & Forward)': 'ಆಫ್‌ಲೈನ್ (ಸಂಗ್ರಹಿಸಿ & ಕಳುಹಿಸಿ)',
    'Rural Connectivity Simulator:': 'ಗ್ರಾಮೀಣ ಕನೆಕ್ಟಿವಿಟಿ ಸಿಮ್ಯುಲೇಟರ್:',
    'More ▾': 'ಇನ್ನಷ್ಟು ▾',
    'More': 'ಇನ್ನಷ್ಟು',

    // Tabs & Sections
    'Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    '🏠 Dashboard': '🏠 ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'Children': 'ಮಕ್ಕಳ ಆರೈಕೆ',
    '👶 Children': '👶 ಮಕ್ಕಳ ಆರೈಕೆ',
    'Maternity': 'ಮಾತೃ ಆರೈಕೆ',
    '🤰 Maternity': '🤰 ಮಾತೃ ಆರೈಕೆ',
    'Elderly': 'ಹಿರಿಯರ ಆರೈಕೆ',
    '👵 Elderly': '👵 ಹಿರಿಯರ ಆರೈಕೆ',
    'Diseases': 'ರೋಗಗಳ ಮಾರ್ಗದರ್ಶಿ',
    '🛡️ Diseases': '🛡️ ರೋಗಗಳ ಮಾರ್ಗದರ್ಶಿ',
    'AI Camera': 'AI ಕ್ಯಾಮೆರಾ',
    '📷 AI Camera': '📷 AI ಕ್ಯಾಮೆರಾ',
    'Medicine Check': 'ಔಷಧಿ ಪರಿಶೀಲನೆ',
    '💊 Medicine Check': '💊 ಔಷಧಿ ಪರಿಶೀಲನೆ',
    'X-Ray & Reports': 'ಎಕ್ಸ್-ರೇ & ವರದಿಗಳು',
    '🔬 X-Ray & Reports': '🔬 ಎಕ್ಸ್-ರೇ & ವರದಿಗಳು',
    'Ask AI': 'AI ಕೇಳಿ',
    '🤖 Ask AI': '🤖 AI ಕೇಳಿ',
    'Ask Medora AI': 'ಮೆಡೋರಾ AI ಕೇಳಿ',
    'A2A Protocol': 'A2A ಪ್ರೋಟೋಕಾಲ್',
    '🔄 A2A Protocol': '🔄 A2A ಪ್ರೋಟೋಕಾಲ್',
    'Doctor Summary': 'ವೈದ್ಯರ ಸಾರಾಂಶ',
    '📋 Doctor Summary': '📋 ವೈದ್ಯರ ಸಾರಾಂಶ',
    'Hospital Portal': 'ಆಸ್ಪತ್ರೆ ಪೋರ್ಟಲ್',
    '🏥 Hospital Portal': '🏥 ಆಸ್ಪತ್ರೆ ಪೋರ್ಟಲ್',
    'Govt Schemes': 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    '🏛️ Govt Schemes': '🏛️ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    'Emergency & Maps': 'ತುರ್ತು & ನಕ್ಷೆಗಳು',
    '🗺️ Emergency & Maps': '🗺️ ತುರ್ತು & ನಕ್ಷೆಗಳು',
    'Village Admin': 'ಗ್ರಾಮ ಆಡಳಿತ',
    '🏛️ Village Admin': '🏛️ ಗ್ರಾಮ ಆಡಳಿತ',
    'Family': 'ಕುಟುಂಬ',
    '👨‍👩‍👧‍👦 Family': '👨‍👩‍👧‍👦 ಕುಟುಂಬ',
    'Medicines': 'ಔಷಧಿಗಳು',
    '💊 Medicines': '💊 ಔಷಧಿಗಳು',
    'Medical Reports': 'ವೈದ್ಯಕೀಯ ವರದಿಗಳು',
    '📜 Medical Reports': '📜 ವೈದ್ಯಕೀಯ ವರದಿಗಳು',

    // Dashboard & Care Hubs
    'YOUR HEALTH TODAY': 'ಇಂದು ನಿಮ್ಮ ಆರೋಗ್ಯ',
    'SPECIALIZED POPULATION CARE HUBS': 'ವಿಶೇಷ ಸಮುದಾಯ ಆರೋಗ್ಯ ಆರೈಕೆ ಕೇಂದ್ರಗಳು',
    'PRIMARY DOCTOR AVAILABILITY & SUBSTITUTES': 'ಪ್ರಾಥಮಿಕ ವೈದ್ಯರ ಲಭ್ಯತೆ ಮತ್ತು ಪರ್ಯಾಯ ವೈದ್ಯರು',
    'DOCTOR / PRIMARY DOCTOR AVAILABILITY SECTION': 'ವೈದ್ಯರು / ಪ್ರಾಥಮಿಕ ವೈದ್ಯರ ಕರ್ತವ್ಯ ವಿಭಾಗ',
    'Children Care Hub': 'ಮಕ್ಕಳ ಆರೈಕೆ ಕೇಂದ್ರ',
    'Maternity & Postpartum Hub': 'ಮಾತೃ ಮತ್ತು ಹೆರಿಗೆ ನಂತರದ ಕೇಂದ್ರ',
    'Elderly Care Hub': 'ಹಿರಿಯ ನಾಗರಿಕರ ಆರೈಕೆ ಕೇಂದ್ರ',
    'Rural Disease Guide': 'ಗ್ರಾಮೀಣ ರೋಗಗಳ ಮಾರ್ಗದರ್ಶಿ',
    'HEALTH SCORE': 'ಆರೋಗ್ಯ ಅಂಕ (ಸ್ಕೋರ್)',
    'Priority Rural Care Tiers': 'ಆದ್ಯತೆಯ ಗ್ರಾಮೀಣ ಆರೈಕೆ ವಿಭಾಗಗಳು',
    'Essential Care for Vulnerable Family Members': 'ಕುಟುಂಬ ಸದಸ್ಯರಿಗೆ ಅಗತ್ಯ ಆರೈಕೆ',
    'Dedicated health support for seniors, expecting mothers, and infants with 1-click clinical access.': 'ಹಿರಿಯರು, ಗರ್ಭಿಣಿಯರು ಮತ್ತು ಶಿಶುಗಳಿಗೆ 1-ಕ್ಲಿಕ್ ವೈದ್ಯಕೀಯ ಪ್ರವೇಶ.',
    'Elderly Care': 'ಹಿರಿಯರ ಆರೈಕೆ',
    '👵 Elderly Care': '👵 ಹಿರಿಯರ ಆರೈಕೆ',
    'Ages 60+': 'ವಯಸ್ಸು 60+',
    'Maternal Care': 'ಮಾತೃ ಆರೈಕೆ',
    '🤰 Maternal Care': '🤰 ಮಾತೃ ಆರೈಕೆ',
    'Trimester 1 - 3': 'ತ್ರೈಮಾಸಿಕ 1 - 3',
    'Child Care': 'ಮಕ್ಕಳ ಆರೈಕೆ',
    '👶 Child Care': '👶 ಮಕ್ಕಳ ಆರೈಕೆ',
    'Ages 0 - 5': 'ವಯಸ್ಸು 0 - 5',
    'Find Senior Doctor': 'ಹಿರಿಯ ವೈದ್ಯರನ್ನು ಹುಡುಕಿ',
    'Trimester Guide': 'ತ್ರೈಮಾಸಿಕ ಮಾರ್ಗದರ್ಶಿ',
    'Child Care & Vaccines': 'ಮಕ್ಕಳ ಆರೈಕೆ & ಲಸಿಕೆಗಳು',

    // Doctor Roster & Cards
    'Primary Physician': 'ಪ್ರಾಥಮಿಕ ವೈದ್ಯರು',
    'Backup Duty Physician': 'ಬ್ಯಾಕಪ್ ಕರ್ತವ್ಯ ವೈದ್ಯರು',
    'Specialist': 'ತಜ್ಞ ವೈದ್ಯರು',
    'Live Roster Status': 'ನೇರ ಕರ್ತವ್ಯ ಸ್ಥಿತಿ',
    'Available Today': 'ಇಂದು ಲಭ್ಯವಿದೆ',
    'Available': 'ಲಭ್ಯವಿದೆ',
    'Off Duty': 'ಕರ್ತವ್ಯದಲ್ಲಿಲ್ಲ',
    'Referral Only': 'ರೆಫರಲ್ ಮಾತ್ರ',
    'DEMO DOCTOR': 'ಡೆಮೊ ವೈದ್ಯರು',
    'View Profile': 'ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಿಸಿ',
    'Request Consultation': 'ಸಮಾಲೋಚನೆಗೆ ವಿನಂತಿಸಿ',
    'Send Health Summary': 'ಆರೋಗ್ಯ ಸಾರಾಂಶ ಕಳುಹಿಸಿ',
    'Qualifications': 'ಅರ್ಹತೆಗಳು',
    'Experience': 'ಅನುಭವ',
    'Available Days & Time': 'ಲಭ್ಯವಿರುವ ದಿನಗಳು ಮತ್ತು ಸಮಯ',
    'Languages Spoken': 'ಮಾತನಾಡುವ ಭಾಷೆಗಳು',

    // Family Page & Roster
    'Family Health & Household Roster': 'ಕುಟುಂಬದ ಆರೋಗ್ಯ ಮತ್ತು ಸದಸ್ಯರ ಪಟ್ಟಿ',
    'Kumar Family': 'ಕುಮಾರ್ ಕುಟುಂಬ',
    'Family ID': 'ಕುಟುಂಬ ಐಡಿ',
    'Primary Contact': 'ಪ್ರಾಥಮಿಕ ಸಂಪರ್ಕ',
    'Total Family Members': 'ಒಟ್ಟು ಕುಟುಂಬದ ಸದಸ್ಯರು',
    'High-Risk Members': 'ಹೆಚ್ಚಿನ ಅಪಾಯದಲ್ಲಿರುವ ಸದಸ್ಯರು',
    'Pending Checkups': 'ಬಾಕಿ ಇರುವ ತಪಾಸಣೆಗಳು',
    'View Health': 'ಆರೋಗ್ಯ ವೀಕ್ಷಿಸಿ',
    'Share Details': 'ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ',
    'Share Report': 'ವರದಿ ಹಂಚಿಕೊಳ್ಳಿ',
    'Grandfather / Senior': 'ತಾತ / ಹಿರಿಯ ನಾಗರಿಕ',
    'Mother / Pregnant (Trimester 2)': 'ತಾಯಿ / ಗರ್ಭಿಣಿ (ತ್ರೈಮಾಸಿಕ 2)',
    'Son / Child (Pediatric)': 'ಮಗ / ಮಗು (ಮಕ್ಕಳ ವಿಭಾಗ)',
    'Daughter / Diabetic Care': 'ಮಗಳು / ಮಧುಮೇಹ ಆರೈಕೆ',
    'Father / Primary Earner': 'ತಂದೆ / ಮುಖ್ಯ ಸಂಪಾದಕ',
    'Household Roster': 'ಕುಟುಂಬದ ಸದಸ್ಯರ ಪಟ್ಟಿ',
    'Family Overview': 'ಕುಟುಂಬದ ಸಾರಾಂಶ',
    'Recent Family Activity': 'ಇತ್ತೀಚಿನ ಕುಟುಂಬದ ಚಟುವಟಿಕೆಗಳು',

    // Communication Center & SMS & Share
    'Medora Communication Center': 'ಮೆಡೋರಾ ಸಂಪರ್ಕ ಕೇಂದ್ರ',
    'Messages & Share': 'ಸಂದೇಶಗಳು ಮತ್ತು ಹಂಚಿಕೆ',
    '📬 Messages & Share': '📬 ಸಂದೇಶಗಳು ಮತ್ತು ಹಂಚಿಕೆ',
    'Communication Center & Share': 'ಸಂಪರ್ಕ ಕೇಂದ್ರ ಮತ್ತು ಹಂಚಿಕೆ',
    'Open Communication Center': 'ಸಂಪರ್ಕ ಕೇಂದ್ರ ತೆರೆಯಿರಿ',
    'Send SMS': 'SMS ಕಳುಹಿಸಿ',
    'Enter phone number': 'ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
    'Message': 'ಸಂದೇಶ',
    'Recipient': 'ಪಡೆಯುವವರು',
    'Review': 'ಪರಿಶೀಲಿಸಿ',
    'Confirm & Send': 'ಖಚಿತಪಡಿಸಿ ಕಳುಹಿಸಿ',
    'USSD': 'USSD',
    'Voice Call': 'ವಾಯ್ಸ್ ಕರೆ',
    'Voice Message': 'ವಾಯ್ಸ್ ಸಂದೇಶ',
    'Record': 'ರೆಕಾರ್ಡ್ ಮಾಡಿ',
    'Stop': 'ನಿಲ್ಲಿಸಿ',
    'Preview': 'ಪೂರ್ವವೀಕ್ಷಣೆ',
    'Send': 'ಕಳುಹಿಸಿ',
    'Bluetooth': 'ಬ್ಲೂಟೂತ್',
    'Connect Device': 'ಸಾಧನವನ್ನು ಸಂಪರ್ಕಿಸಿ',
    'Bluetooth not supported': 'ಬ್ಲೂಟೂತ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ',
    'Inbox': 'ಇನ್‌ಬಾಕ್ಸ್',
    'Outbox': 'ಔಟ್‌ಬಾಕ್ಸ್',
    'Compose': 'ಹೊಸ ಸಂದೇಶ',
    'Confirm Health Data Sharing': 'ಆರೋಗ್ಯ ಮಾಹಿತಿ ಹಂಚಿಕೆಯನ್ನು ಖಚಿತಪಡಿಸಿ',
    'Share Patient Medical Details': 'ರೋಗಿಯ ವೈದ್ಯಕೀಯ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ',
    'Consent Confirmation': 'ಸಮ್ಮತಿ ಖಚಿತಪಡಿಸುವಿಕೆ',
    'Patient consent obtained for SMS delivery': 'SMS ಮೂಲಕ ವರದಿಗಳನ್ನು ಕಳುಹಿಸಲು ರೋಗಿಯ ಸಮ್ಮತಿ ಪಡೆಯಲಾಗಿದೆ',
    'Masked Phone:': 'ಮರೆಮಾಚಿದ ಫೋನ್:',
    'Privacy Note': 'ಗೌಪ್ಯತೆ ಸೂಚನೆ',
    'Data will be transmitted securely over encrypted channels': 'ಮಾಹಿತಿಯನ್ನು ಸುಲಭವಾಗಿ ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿ ರವಾನಿಸಲಾಗುತ್ತದೆ',
    'OFFLINE QUEUED': 'ಆಫ್‌ಲೈನ್ ಸಾಲಿನಲ್ಲಿದೆ',
    'DELIVERED': 'ತಲುಪಿಸಲಾಗಿದೆ',
    'FAILED': 'ವಿಫಲವಾಗಿದೆ',
    'DEMO QUEUED': 'ಡೆಮೊ ಸಾಲಿನಲ್ಲಿದೆ',
    'DEMO SENT': 'ಡೆಮೊ ಕಳುಹಿಸಲಾಗಿದೆ',
    'DEMO DELIVERED': 'ಡೆಮೊ ತಲುಪಿಸಲಾಗಿದೆ',

    // Emergency & Transport
    'EMERGENCY TRANSPORT': 'ತುರ್ತು ಸಾರಿಗೆ',
    'AMBULANCE': 'ಅಂಬ್ಯುಲೆನ್ಸ್',
    'CAR': 'ಕಾರು',
    'TWO-WHEELER': 'ದ್ವಿಚಕ್ರ ವಾಹನ',
    'BICYCLE': 'ಸೈಕಲ್',
    'BUS': 'ಬಸ್',
    'STRETCHER': 'ಸ್ಟ್ರೆಚರ್',
    'LOCATION SHARING': 'ಸ್ಥಳ ಹಂಚಿಕೆ',
    'GPS Coordinates': 'GPS ವಿವರಗಳು',
    'Call Ambulance': 'ಅಂಬ್ಯುಲೆನ್ಸ್ ಕರೆ ಮಾಡಿ',
    'Dial 108': '108 ಗೆ ಕರೆ ಮಾಡಿ',
    'Dial 112': '112 ಗೆ ಕರೆ ಮಾಡಿ',
    'Dial 102': '102 ಗೆ ಕರೆ ಮಾಡಿ',

    // AI & Symptom Triage & Guidance
    'WHAT TO DO': 'ಏನು ಮಾಡಬೇಕು',
    'WHAT NOT TO DO': 'ಏನು ಮಾಡಬಾರದು',
    'WARNING SIGNS': 'ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳು',
    'WHEN TO SEEK MEDICAL CARE': 'ವೈದ್ಯಕೀಯ ನೆರವು ಯಾವಾಗ ಪಡೆಯಬೇಕು',
    'URGENCY': 'ತುರ್ತು',
    'ROUTINE': 'ಸಾಮಾನ್ಯ',
    'NEEDS MEDICAL REVIEW': 'ವೈದ್ಯಕೀಯ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ',
    'URGENT': 'ತುರ್ತು',
    'EMERGENCY': 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ',
    'Symptoms': 'ಲಕ್ಷಣಗಳು',
    'Medical History': 'ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ',
    'AI Summary': 'AI ಸಾರಾಂಶ',
    'Symptoms Analyzer': 'ಲಕ್ಷಣಗಳ ವಿಶ್ಲೇಷಣೆ',
    'AI Triage Assistant': 'AI ಸಹಾಯ ಕೇಂದ್ರ',
    'Symptom Analysis': 'ಲಕ್ಷಣ ವಿಶ್ಲೇಷಣೆ',
    'General Guidance': 'ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನ',
    'Prevention': 'ತಡೆಗಟ್ಟುವಿಕೆ',
    'Emergency Instructions': 'ತುರ್ತು ಸೂಚನೆಗಳು',

    // Medical Vitals & Terms
    'Blood Pressure': 'ರಕ್ತದೊತ್ತಡ (BP)',
    'Heart Rate': 'ಹೃದಯ ಬಡಿತದ ದರ',
    'Blood Sugar': 'ರಕ್ತದ ಸಕ್ಕರೆ ಪ್ರಮಾಣ',
    'Hemoglobin': 'ಹಿಮೋಗ್ಲೋಬಿನ್',
    'Temperature': 'ತಾಪಮಾನ',
    'Oxygen Saturation': 'ಆಮ್ಲಜನಕದ ಮಟ್ಟ (SpO2)',
    'SpO2': 'SpO2',
    'Weight': 'ತೂಕ',
    'BMI': 'ಬಿಎಂಐ (BMI)',
    'Normal': 'ಸಾಮಾನ್ಯ',
    'High Risk': 'ಹೆಚ್ಚಿನ ಅಪಾಯ',
    'Moderate Risk': 'ಮಧ್ಯಮ ಅಪಾಯ',
    'Safe': 'ಸುರಕ್ಷಿತ',
    'Stable': 'ಸ್ಥಿರವಾಗಿದೆ',
    'Critical': 'ಗಂಭೀರ',
    'Pending': 'ಬಾಕಿ ಉಳಿದಿದೆ',
    'Referred': 'ರೆಫರ್ ಮಾಡಲಾಗಿದೆ',
    'Scheduled': 'ನಿಗದಿಯಾಗಿದೆ',
    'Completed': 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    'Morning': 'ಬೆಳಿಗ್ಗೆ',
    'Afternoon': 'ಮಧ್ಯಾಹ್ನ',
    'Evening': 'ಸಂಜೆ',
    'Night': 'ರಾತ್ರಿ',
    'Before food': 'ಊಟಕ್ಕೆ ಮುಂಚೆ',
    'After food': 'ಊಟದ ನಂತರ',
    'Taken': 'ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ',
    'Missed': 'ತಪ್ಪಿಹೋಗಿದೆ',
    'Mark Taken': 'ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ',
    'Today': 'ಇಂದು',
    'Yesterday': 'ನಿನ್ನೆ',
    'Tomorrow': 'ನಾಳೆ',

    // Common Actions
    'Save': 'ಉಳಿಸಿ',
    'Delete': 'ಅಳಿಸಿ',
    'Edit': 'ಸಂಪಾದಿಸಿ',
    'Cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'Confirm': 'ಖಚಿತಪಡಿಸಿ',
    'Search': 'ಹುಡುಕಿ',
    'Filter': 'ಫಿಲ್ಟರ್',
    'Sort': 'ವಿಂಗಡಿಸಿ',
    'Close': 'ಮುಚ್ಚಿ',
    'Back': 'ಹಿಂದಕ್ಕೆ',
    'Next': 'ಮುಂದೆ',
    'Submit': 'ಸಲ್ಲಿಸಿ',
    'Clear Filters': 'ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ',
    'View All': 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ',
    'Print Report': 'ವರದಿಯನ್ನು ಮುದ್ರಿಸಿ',
    'Share Summary': 'ಸಾರಾಂಶ ಹಂಚಿಕೊಳ್ಳಿ',
    'SHARE WITH DOCTOR': 'ವೈದ್ಯರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ'
  }
};

// Sorted list of dictionary keys per language (longest first) for substring translation
const sortedPhrasesCache: Partial<Record<LanguageCode, [string, string][]>> = {};

const getSortedPhrases = (lang: LanguageCode): [string, string][] => {
  if (sortedPhrasesCache[lang]) return sortedPhrasesCache[lang]!;
  const dict = DICTIONARY[lang] || {};
  const entries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);
  sortedPhrasesCache[lang] = entries;
  return entries;
};

// Case-insensitive lookup map
const lowerCaseDictCache: Partial<Record<LanguageCode, Map<string, string>>> = {};

const getLowerCaseDict = (lang: LanguageCode): Map<string, string> => {
  if (lowerCaseDictCache[lang]) return lowerCaseDictCache[lang]!;
  const dict = DICTIONARY[lang] || {};
  const map = new Map<string, string>();
  for (const [key, value] of Object.entries(dict)) {
    map.set(key.toLowerCase(), value);
  }
  lowerCaseDictCache[lang] = map;
  return map;
};

// Translate an individual English string to target language
export const translateString = (text: string, lang: LanguageCode): string => {
  if (lang === 'en' || !text) return text;
  const trimmed = text.trim();
  if (!trimmed || trimmed.length <= 1) return text;

  const dict = DICTIONARY[lang];
  if (!dict) return text;

  // 1. Exact match
  if (dict[trimmed]) {
    return text.replace(trimmed, dict[trimmed]);
  }

  // 2. Case-insensitive match
  const lowerMap = getLowerCaseDict(lang);
  const lowerMatch = lowerMap.get(trimmed.toLowerCase());
  if (lowerMatch) {
    return text.replace(trimmed, lowerMatch);
  }

  // 3. Multi-phrase replacement for composite text
  let modified = text;
  const phrases = getSortedPhrases(lang);
  for (const [source, replacement] of phrases) {
    if (source.length < 3) continue; // skip tiny single chars
    if (modified.includes(source)) {
      modified = modified.split(source).join(replacement);
    }
  }

  return modified;
};

// Walk text nodes of root
const getTextNodes = (root: HTMLElement): Text[] => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      const value = node.textContent?.trim() ?? '';
      return value.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes: Text[] = [];
  let node: Node | null = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }
  return nodes;
};

// Restore all DOM nodes to English
const restoreEnglish = (root: HTMLElement) => {
  const nodes = getTextNodes(root);
  nodes.forEach((node) => {
    const original = originalTextMap.get(node);
    if (original !== undefined && node.textContent !== original) {
      node.textContent = original;
    }
  });

  // Also restore attributes
  const inputs = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>('input, textarea, button, [title], [placeholder]');
  inputs.forEach((el) => {
    const saved = originalAttrMap.get(el);
    if (saved) {
      if (saved.placeholder !== undefined) el.setAttribute('placeholder', saved.placeholder);
      if (saved.title !== undefined) el.setAttribute('title', saved.title);
      if (saved['aria-label'] !== undefined) el.setAttribute('aria-label', saved['aria-label']);
    }
  });
};

// Translate DOM nodes and attributes
const performDomTranslation = (root: HTMLElement, language: LanguageCode) => {
  isTranslating = true;
  try {
    const nodes = getTextNodes(root);
    nodes.forEach((node) => {
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, node.textContent ?? '');
      }

      const original = originalTextMap.get(node) ?? '';
      if (!original.trim()) return;

      const translated = translateString(original, language);
      if (translated !== node.textContent) {
        node.textContent = translated;
      }
    });

    // Translate attributes like placeholder, title, aria-label
    const elements = root.querySelectorAll<HTMLElement>('input, button, textarea, select, [title], [placeholder], [aria-label]');
    elements.forEach((el) => {
      if (!originalAttrMap.has(el)) {
        originalAttrMap.set(el, {
          placeholder: el.getAttribute('placeholder') || '',
          title: el.getAttribute('title') || '',
          'aria-label': el.getAttribute('aria-label') || '',
        });
      }

      const origAttrs = originalAttrMap.get(el)!;
      if (origAttrs.placeholder) {
        const transPlaceholder = translateString(origAttrs.placeholder, language);
        if (el.getAttribute('placeholder') !== transPlaceholder) {
          el.setAttribute('placeholder', transPlaceholder);
        }
      }
      if (origAttrs.title) {
        const transTitle = translateString(origAttrs.title, language);
        if (el.getAttribute('title') !== transTitle) {
          el.setAttribute('title', transTitle);
        }
      }
      if (origAttrs['aria-label']) {
        const transAria = translateString(origAttrs['aria-label'], language);
        if (el.getAttribute('aria-label') !== transAria) {
          el.setAttribute('aria-label', transAria);
        }
      }
    });
  } finally {
    setTimeout(() => {
      isTranslating = false;
    }, 40);
  }
};

// Completeness report for development
export const checkTranslationCompleteness = () => {
  if (typeof window === 'undefined') return;
  const languages: LanguageCode[] = ['hi', 'te', 'ml', 'ta', 'kn'];
  const baseKeys = Object.keys(DICTIONARY.hi || {});
  
  languages.forEach((lang) => {
    const dict = DICTIONARY[lang] || {};
    const missing = baseKeys.filter((k) => !dict[k]);
    if (missing.length > 0) {
      console.warn(`[i18n Check] Missing ${missing.length} keys for '${lang}':`, missing.slice(0, 5));
    }
  });
};

// Main export called on language change and app initialization
export const translatePage = async (language: LanguageCode, _lowDataMode?: boolean) => {
  activeLanguage = language;
  const root = document.getElementById('root');
  if (!root) return;

  if (language === 'en') {
    observer?.disconnect();
    restoreEnglish(root);
    return;
  }

  // 1. Perform instant, 100% reliable client-side translation
  performDomTranslation(root, language);

  // 2. Set up reactive observer so newly added cards/modals/tabs/dynamic text are translated immediately
  if (!observer) {
    observer = new MutationObserver(() => {
      if (isTranslating || activeLanguage === 'en') return;
      if (translateDebounceTimeout !== null) {
        window.clearTimeout(translateDebounceTimeout);
      }
      translateDebounceTimeout = window.setTimeout(() => {
        const currentRoot = document.getElementById('root');
        if (currentRoot && activeLanguage !== 'en') {
          performDomTranslation(currentRoot, activeLanguage);
        }
      }, 30);
    });
  }

  observer.disconnect();
  observer.observe(root, { childList: true, subtree: true, characterData: true });
};

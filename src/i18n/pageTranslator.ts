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

    // Tabs
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

    // Care Tiers
    'Priority Rural Care Tiers': 'प्राथमिक ग्रामीण स्वास्थ्य श्रेणियां',
    'Essential Care for Vulnerable Family Members': 'संवेदनशील पारिवारिक सदस्यों के लिए आवश्यक देखभाल',
    'Dedicated health support for seniors, expecting mothers, and infants with 1-click clinical access.': 'वरिष्ठ नागरिकों, गर्भवती माताओं और शिशुओं के लिए 1-क्लिक चिकित्सा सहायता।',
    'Elderly Care': 'वृद्ध देखभाल',
    '👵 Elderly Care ( )': '👵 वृद्ध देखभाल',
    '👵 Elderly Care': '👵 वृद्ध देखभाल',
    'Ages 60+': 'आयु 60+ वर्ष',
    'Hypertension monitoring, osteoarthritis pain relief, fall risk prevention, and polypharmacy reviews.': 'उच्च रक्तचाप की निगरानी, जोड़ों के दर्द से राहत, गिरने के जोखिम से बचाव और दवाओं की समीक्षा।',
    'Daily BP logging (Morning & Evening)': 'दैनिक बीपी लॉगिंग (सुबह और शाम)',
    'Joint mobility & warm compress routine': 'जोड़ों की गतिशीलता और गर्म सिकाई दिनचर्या',
    'Geriatric OPD at District Civil Hospital': 'जिला नागरिक अस्पताल में जेरियाट्रिक ओपीडी',
    'Find Senior Doctor': 'वरिष्ठ डॉक्टर खोजें',
    'Maternal Care': 'मातृ देखभाल',
    '🤰 Maternal Care': '🤰 मातृ देखभाल',
    'Trimester 1 - 3': 'तिमाही 1 - 3',
    'Prenatal vitamins, hemoglobin tracking, fetal movements, and institutional delivery prep.': 'प्रसवपूर्व विटामिन, हीमोग्लोबिन ट्रैकिंग, भ्रूण की हलचल और सुरक्षित प्रसव की तैयारी।',
    'Iron & Folic Acid adherence (180+ days)': 'आयरन और फोलिक एसिड सेवन (180+ दिन)',
    'High blood pressure & preeclampsia checks': 'उच्च रक्तचाप और प्रीक्लेम्पसिया की जांच',
    'Free PHC ambulance transit registration': 'मुफ्त पीएचसी एम्बुलेंस पंजीकरण',
    'Trimester Guide': 'तिमाही मार्गदर्शिका',
    'Child Care': 'शिशु देखभाल',
    '👶 Child Care': '👶 शिशु देखभाल',
    'Ages 0 - 5': 'आयु 0 - 5 वर्ष',
    'Immunization schedules, fever monitoring, growth milestones, and pediatric nutrition guidance.': 'टीकाकरण कार्यक्रम, बुखार की निगरानी, विकास के चरण और पोषण मार्गदर्शन।',
    'Timely Pentavalent, Rotavirus & Measles': 'समय पर पेंटावेलेंट, रोटावायरस और खसरा टीका',
    'Fever & diarrhea hydration therapy (ORS)': 'बुखार और दस्त में ओआरएस जल चिकित्सा',
    'Growth curve & mid-upper arm monitoring': 'विकास वक्र और बांह के माप की निगरानी',
    'Child Care & Vaccines': 'शिशु देखभाल और टीके',

    // Login Page
    'MEDORA – Rural Health Companion': 'मेडोरा – ग्रामीण स्वास्थ्य साथी',
    'Secure Rural Healthcare Continuity & ABHA Health Records Access': 'सुरक्षित ग्रामीण स्वास्थ्य निरंतरता और आभा (ABHA) स्वास्थ्य रिकॉर्ड',
    'Select Role / Persona for 1-Click Instant Login': '1-क्लिक त्वरित लॉगिन के लिए भूमिका चुनें',
    'Villager / Patient': 'ग्रामीण / मरीज',
    'Family / Household Head': 'परिवार / गृह प्रमुख',
    'Doctor / Clinician': 'डॉक्टर / चिकित्सक',
    'Village Admin / ASHA': 'ग्राम प्रशासन / आशा कार्यकर्ता',
    'Individual File (P-1001)': 'व्यक्तिगत फाइल (P-1001)',
    'Household (FAM-01, 4 Members)': 'परिवार (FAM-01, 4 सदस्य)',
    'District Civil Hospital Medical Staff': 'जिला अस्पताल चिकित्सा स्टाफ',
    'Gram Panchayat Health Registry Desk': 'ग्राम पंचायत स्वास्थ्य रजिस्ट्री डेस्क',
    'Quick-Fill & Sign In': 'त्वरित भरें और लॉगिन करें',
    'Demo Login Credentials': 'डेमो लॉगिन क्रेडेंशियल्स',
    'Username / ID / Ration Card': 'उपयोगकर्ता नाम / आईडी / राशन कार्ड',
    'Password': 'पासवर्ड',
    'Sign In to Medora': 'मेडोरा में प्रवेश करें',
    'Signing In...': 'लॉगिन हो रहा है...',
    'Secure Offline-First Session • ABHA / NDHM Sandbox Compliant': 'सुरक्षित ऑफलाइन सत्र • ABHA / NDHM सैंडबॉक्स अनुरूप',
    'Isolated view of personal longitudinal records, vitals, daily medicine reminders, and appointment continuity.': 'व्यक्तिगत स्वास्थ्य रिकॉर्ड, वाइटल्स, दैनिक दवा अनुस्मारक और परामर्श निरंतरता।',
    'Household care navigation. View and toggle between Ramesh, Sunita (maternal), Aarav (child), and Priya (diabetic).': 'पारिवारिक देखभाल। रमेश, सुनीता (मातृ), आरव (शिशु), और प्रिया के बीच टॉगल करें।',
    'Clinician workspace. Cross-village patient search by ID, add clinical notes, review lab/X-ray tests, and generate doctor handoffs.': 'डॉक्टर कार्यक्षेत्र। मरीज खोजें, नैदानिक नोट्स जोड़ें, लैब/एक्सरे जांचें और रेफरल सारांश बनाएं।',
    'Gram Panchayat Health Registry Desk. Longitudinal demographic census, maternal and geriatric registries, and village health monitoring.': 'ग्राम पंचायत स्वास्थ्य रजिस्ट्री। जनसंख्या स्वास्थ्य जनगणना, मातृ व वृद्ध रजिस्ट्री और निगरानी।',

    // Dashboard Banner & Headings
    'All-in-One Rural Healthcare Dashboard': 'ऑल-इन-वन ग्रामीण स्वास्थ्य डैशबोर्ड',
    'Complete Rural Care Continuity Command Center': 'संपूर्ण ग्रामीण स्वास्थ्य निरंतरता कमांड सेंटर',
    'Direct access to specialized care, daily medications, village transit routes, referral status, and AI support.': 'विशिष्ट देखभाल, दैनिक दवाएं, अस्पताल मार्ग, रेफरल स्थिति और AI सहायता की सीधी सुविधा।',
    'Quick Navigation Shortcuts': 'त्वरित नेविगेशन शॉर्टकट',
    'Family Health Journey': 'परिवार स्वास्थ्य यात्रा',
    'Daily Medication Adherence': 'दैनिक दवा अनुपालन',
    'Health Trends & Vitals': 'स्वास्थ्य रुझान और वाइटल्स',
    'Common Village Disease Guides': 'सामान्य ग्रामीण रोग मार्गदर्शिका',
    'Hospital Transit & Ambulance': 'अस्पताल परिवहन और एम्बुलेंस',
    'Doctor Handoff & Continuity': 'डॉक्टर हैंडऑफ और निरंतरता',
    'Smart Referral Network': 'स्मार्ट रेफरल नेटवर्क',
    'Doctor Directory': 'डॉक्टर निर्देशिका',
    'Hospital Directory': 'अस्पताल निर्देशिका',
    'Hospital Contact Center': 'अस्पताल संपर्क केंद्र',

    // Role Switcher Modal
    'Switch Healthcare Persona & Access Level': 'स्वास्थ्य सेवा भूमिका और एक्सेस स्तर बदलें',
    'Choose a persona to experience role-based healthcare continuity across the village': 'ग्रामीण स्वास्थ्य निरंतरता का अनुभव करने के लिए एक भूमिका चुनें',
    'Switch to Persona': 'इस भूमिका में बदलें',
    'Current Active Role': 'वर्तमान सक्रिय भूमिका',
    'Active Persona': 'सक्रिय पहचान',
    'Close': 'बंद करें',
    'Cancel': 'रद्द करें',
    'Save': 'सहेजें',

    // Medical Vitals & Health Terms
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

    // Actions & Buttons
    'Search doctors, hospitals or specialties...': 'डॉक्टर, अस्पताल या विशेषज्ञता खोजें...',
    'Search Villager by Name, ID, Ration Card, or ABHA': 'नाम, आईडी, राशन कार्ड या आभा से खोजें',
    'Call Doctor': 'डॉक्टर को कॉल करें',
    'View Profile': 'प्रोफाइल देखें',
    'Request Consultation': 'परामर्श का अनुरोध करें',
    'Add to Referral': 'रेफरल में जोड़ें',
    'Call Hospital': 'अस्पताल को कॉल करें',
    'Official Website': 'आधिकारिक वेबसाइट',
    'Get Directions': 'दिशा-निर्देश देखें',
    'View Doctors': 'डॉक्टर देखें',
    'Plan Referral': 'रेफरल की योजना बनाएं',
    'Print Report': 'रिपोर्ट प्रिंट करें',
    'Export Demo Report': 'डेमो रिपोर्ट निर्यात करें',
    'Share Summary': 'सारांश साझा करें',
    'SHARE WITH DOCTOR': 'डॉक्टर के साथ साझा करें',
    'Doctor-Ready Health Summary': 'डॉक्टर के लिए स्वास्थ्य सारांश',
    'Years Experience': 'वर्षों का अनुभव',
    'Travel Time': 'यात्रा समय',
    'Distance': 'दूरी',
    'Languages': 'भाषाएं',
    'Available Today': 'आज उपलब्ध',
    'Clear Filters': 'फिल्टर साफ करें',
    'View All': 'सभी देखें',
    'All Specialties': 'सभी विशेषज्ञताएं',
    'All Hospital Types': 'सभी अस्पताल प्रकार',
    'All Languages': 'सभी भाषाएं',
  },
  te: {
    // Navigation & Global Header
    'MEDORA': 'మెడోరా (Medora)',
    'RURAL HEALTH': 'గ్రామీణ ఆరోగ్యం',
    'Rural Health Continuity Platform': 'గ్రామీణ ఆరోగ్య కొనసాగింపు వేదిక',
    'Rural Medical Emergency? Dial 108 (Ambulance) or 112 (National) immediately.': 'గ్రామీణ వైద్య అత్యవసరమా? వెంటనే 108 (అంబులెన్స్) లేదా 112 (జాతీయ అత్యవసర) కాల్ చేయండి.',
    'ROLE: PATIENT': 'పాత్ర: రోగి (PATIENT)',
    'ROLE: FAMILY': 'పాత్ర: కుటుంబం (FAMILY)',
    'ROLE: DOCTOR': 'పాత్ర: డాక్టర్ (DOCTOR)',
    'ROLE: ADMIN': 'పాత్ర: గ్రామ అడ్మిన్ (ADMIN)',
    'ROLE': 'పాత్ర (ROLE)',
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
    'Listen': 'వినండి (Listen)',
    'Playing audio...': 'ఆడియో ప్లే అవుతోంది...',
    'DEMO DATA': 'డెమో డేటా',
    'Demo Data': 'డెమో డేటా',
    'Online (Direct)': 'ఆన్‌లైన్ (డైరెక్ట్)',
    'Limited (2G/Edge)': 'పరిమితం (2G/Edge)',
    'Offline (Store & Forward)': 'ఆఫ్‌లైన్ (స్టోర్ & ఫార్వర్డ్)',
    'Rural Connectivity Simulator:': 'గ్రామీణ కనెక్టివిటీ సిమ్యులేటర్:',

    // Tabs
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

    // Care Tiers
    'Priority Rural Care Tiers': 'ప్రాధాన్యత గ్రామీణ ఆరోగ్య విభాగాలు',
    'Essential Care for Vulnerable Family Members': 'కుటుంబ సభ్యుల కోసం అత్యవసర సంరక్షణ',
    'Dedicated health support for seniors, expecting mothers, and infants with 1-click clinical access.': 'వృద్ధులు, కాబోయే తల్లులు మరియు శిశువుల కోసం 1-క్లిక్ వైద్య సేవలు.',
    'Elderly Care': 'వృద్ధుల సంరక్షణ',
    '👵 Elderly Care ( )': '👵 వృద్ధుల సంరక్షణ',
    '👵 Elderly Care': '👵 వృద్ధుల సంరక్షణ',
    'Ages 60+': 'వయస్సు 60+ సం.',
    'Hypertension monitoring, osteoarthritis pain relief, fall risk prevention, and polypharmacy reviews.': 'రక్తపోటు పర్యవేక్షణ, కీళ్ల నొప్పుల ఉపశమనం, పడిపోయే ప్రమాదాల నివారణ మరియు మందుల సమీక్ష.',
    'Daily BP logging (Morning & Evening)': 'రోజువారీ రక్తపోటు నమోదు (ఉదయం & సాయంత్రం)',
    'Joint mobility & warm compress routine': 'కీళ్ల కదలికలు మరియు వేడి కాపడం దినచర్య',
    'Geriatric OPD at District Civil Hospital': 'జిల్లా ప్రభుత్వ ఆసుపత్రిలో వృద్ధుల ఓపీడీ',
    'Find Senior Doctor': 'సీనియర్ డాక్టర్‌ను కనుగొనండి',
    'Maternal Care': 'గర్భిణీ సంరక్షణ',
    '🤰 Maternal Care': '🤰 గర్భిణీ సంరక్షణ',
    'Trimester 1 - 3': 'త్రైమాసికం 1 - 3',
    'Prenatal vitamins, hemoglobin tracking, fetal movements, and institutional delivery prep.': 'ప్రసవపూర్వ విటమిన్లు, హిమోగ్లోబిన్ ట్రాకింగ్, పిండం కదలికలు మరియు ఆసుపత్రి ప్రసవ సన్నాహాలు.',
    'Iron & Folic Acid adherence (180+ days)': 'ఐరన్ & ఫోలిక్ యాసిడ్ తీసుకోవడం (180+ రోజులు)',
    'High blood pressure & preeclampsia checks': 'అధిక రక్తపోటు మరియు ప్రీక్లాంప్సియా పరీక్షలు',
    'Free PHC ambulance transit registration': 'ఉచిత PHC అంబులెన్స్ ప్రయాణ నమోదు',
    'Trimester Guide': 'త్రైమాసిక గైడ్',
    'Child Care': 'పిల్లల సంరక్షణ',
    '👶 Child Care': '👶 పిల్లల సంరక్షణ',
    'Ages 0 - 5': 'వయస్సు 0 - 5 సం.',
    'Immunization schedules, fever monitoring, growth milestones, and pediatric nutrition guidance.': 'టీకాల షెడ్యూల్, జ్వరం పర్యవేక్షణ, పెరుగుదల మైలురాళ్లు మరియు పోషకాహార మార్గదర్శకత్వం.',
    'Timely Pentavalent, Rotavirus & Measles': 'సకాలంలో పెంటావాలెంట్, రోటావైరస్ & తట్టు టీకాలు',
    'Fever & diarrhea hydration therapy (ORS)': 'జ్వరం మరియు విరేచనాలకు ఓఆర్ఎస్ ద్రవ చికిత్స',
    'Growth curve & mid-upper arm monitoring': 'ఎదుగుదల చార్ట్ మరియు చేతి కొలత పర్యవేక్షణ',
    'Child Care & Vaccines': 'పిల్లల సంరక్షణ & టీకాలు',

    // Login Page
    'MEDORA – Rural Health Companion': 'మెడోరా – గ్రామీణ ఆరోగ్య సహచరి',
    'Secure Rural Healthcare Continuity & ABHA Health Records Access': 'సురక్షిత గ్రామీణ ఆరోగ్య కొనసాగింపు & ABHA రికార్డులు',
    'Select Role / Persona for 1-Click Instant Login': '1-క్లిక్ లాగిన్ కోసం పాత్రను ఎంచుకోండి',
    'Villager / Patient': 'గ్రామీణుడు / రోగి',
    'Family / Household Head': 'కుటుంబ పెద్ద',
    'Doctor / Clinician': 'డాక్టర్ / క్లినీషియన్',
    'Village Admin / ASHA': 'గ్రామ అడ్మిన్ / ఆశా కార్యకర్త',
    'Individual File (P-1001)': 'వ్యక్తిగత రికార్డు (P-1001)',
    'Household (FAM-01, 4 Members)': 'కుటుంబం (FAM-01, 4 సభ్యులు)',
    'District Civil Hospital Medical Staff': 'జిల్లా సివిల్ ఆసుపత్రి వైద్య సిబ్బంది',
    'Gram Panchayat Health Registry Desk': 'గ్రామ పంచాయతీ ఆరోగ్య రిజిస్ట్రీ డెస్క్',
    'Quick-Fill & Sign In': 'త్వరిత పూరణ & లాగిన్',
    'Demo Login Credentials': 'డెమో లాగిన్ వివరాలు',
    'Username / ID / Ration Card': 'యూజర్‌నేమ్ / ఐడి / రేషన్ కార్డు',
    'Password': 'పాస్‌వర్డ్',
    'Sign In to Medora': 'మెడోరాలోకి ప్రవేశించండి',
    'Signing In...': 'లాగిన్ అవుతోంది...',
    'Secure Offline-First Session • ABHA / NDHM Sandbox Compliant': 'సురక్షిత ఆఫ్‌లైన్ సెషన్ • ABHA / NDHM ప్రమాణాలు',
    'Isolated view of personal longitudinal records, vitals, daily medicine reminders, and appointment continuity.': 'వ్యక్తిగత ఆరోగ్య రికార్డులు, వైటల్స్, రోజువారీ మందుల రిమైండర్లు మరియు సంప్రదింపుల వివరాలు.',
    'Household care navigation. View and toggle between Ramesh, Sunita (maternal), Aarav (child), and Priya (diabetic).': 'కుటుంబ సంరక్షణ. రమేష్, సునీత (గర్భిణీ), ఆరవ్ (పిల్లవాడు), ప్రియల మధ్య మారండి.',
    'Clinician workspace. Cross-village patient search by ID, add clinical notes, review lab/X-ray tests, and generate doctor handoffs.': 'డాక్టర్ పని స్థలం. రోగుల శోధన, క్లినికల్ నోట్స్, ల్యాబ్/ఎక్స్-రే రివ్యూ మరియు రెఫరల్స్.',
    'Gram Panchayat Health Registry Desk. Longitudinal demographic census, maternal and geriatric registries, and village health monitoring.': 'గ్రామ పంచాయతీ ఆరోగ్య రిజిస్ట్రీ. గ్రామీణ జనాభా గణన, గర్భిణీ & వృద్ధుల పర్యవేక్షణ.',

    // Dashboard Banner & Headings
    'All-in-One Rural Healthcare Dashboard': 'ఆల్-ఇన్-వన్ గ్రామీణ ఆరోగ్య డ్యాష్‌బోర్డ్',
    'Complete Rural Care Continuity Command Center': 'పూర్తి గ్రామీణ ఆరోగ్య సంరక్షణ కమాండ్ సెంటర్',
    'Direct access to specialized care, daily medications, village transit routes, referral status, and AI support.': 'ప్రత్యేక చికిత్స, రోజువారీ మందులు, ఆసుపత్రి మార్గాలు, రెఫరల్ స్టేటస్ మరియు AI మద్దతు.',
    'Quick Navigation Shortcuts': 'త్వరిత నావిగేషన్ షార్ట్‌కట్‌లు',
    'Family Health Journey': 'కుటుంబ ఆరోగ్య ప్రయాణం',
    'Daily Medication Adherence': 'రోజువారీ మందుల వినియోగం',
    'Health Trends & Vitals': 'ఆరోగ్య సూచికలు & వైటల్స్',
    'Common Village Disease Guides': 'సాధారణ గ్రామీణ వ్యాధుల మార్గదర్శి',
    'Hospital Transit & Ambulance': 'ఆసుపత్రి రవాణా & అంబులెన్స్',
    'Doctor Handoff & Continuity': 'డాక్టర్ హ్యాండ్‌ఆఫ్ & కొనసాగింపు',
    'Smart Referral Network': 'స్మార్ట్ రెఫరల్ నెట్‌వర్క్',
    'Doctor Directory': 'వైద్యుల డైరెక్టరీ',
    'Hospital Directory': 'ఆసుపత్రుల డైరెక్టరీ',
    'Hospital Contact Center': 'ఆసుపత్రి సంప్రదింపు కేంద్రం',

    // Role Switcher Modal
    'Switch Healthcare Persona & Access Level': 'ఆరోగ్య సంరక్షణ పాత్ర & యాక్సెస్ స్థాయిని మార్చండి',
    'Choose a persona to experience role-based healthcare continuity across the village': 'గ్రామంలో పాత్ర-ఆధారిత ఆరోగ్య కొనసాగింపును అనుభవించడానికి ఎంచుకోండి',
    'Switch to Persona': 'ఈ పాత్రకు మారండి',
    'Current Active Role': 'ప్రస్తుత క్రియాశీల పాత్ర',
    'Active Persona': 'క్రియాశీల వ్యక్తి ప్రొఫైల్',
    'Close': 'మూసివేయి',
    'Cancel': 'రద్దు చేయి',
    'Save': 'భద్రపరుచు',

    // Medical Vitals & Health Terms
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

    // Actions & Buttons
    'Search doctors, hospitals or specialties...': 'వైద్యులు, ఆసుపత్రులు లేదా స్పెషాలిటీలను శోధించండి...',
    'Search Villager by Name, ID, Ration Card, or ABHA': 'పేరు, ఐడి, రేషన్ కార్డు లేదా ABHA ద్వారా శోధించండి',
    'Call Doctor': 'వైద్యుడికి కాల్ చేయండి',
    'View Profile': 'ప్రొఫైల్ చూడండి',
    'Request Consultation': 'కన్సల్టేషన్ అభ్యర్థించండి',
    'Add to Referral': 'రెఫరల్‌కు జోడించండి',
    'Call Hospital': 'ఆసుపత్రికి కాల్ చేయండి',
    'Official Website': 'అధికారిక వెబ్‌సైట్',
    'Get Directions': 'రూట్ మార్గం చూడండి',
    'View Doctors': 'వైద్యులను చూడండి',
    'Plan Referral': 'రెఫరల్ ప్లాన్ చేయండి',
    'Print Report': 'రిపోర్ట్ ప్రింట్ చేయండి',
    'Export Demo Report': 'డెమో రిపోర్ట్ ఎగుమతి',
    'Share Summary': 'సారాంశం షేర్ చేయండి',
    'SHARE WITH DOCTOR': 'డాక్టర్‌తో పంచుకోండి',
    'Doctor-Ready Health Summary': 'డాక్టర్-రెడీ ఆరోగ్య నివేదిక',
    'Years Experience': 'సంవత్సరాల అనుభవం',
    'Travel Time': 'ప్రయాణ సమయం',
    'Distance': 'దూరం',
    'Languages': 'భాషలు',
    'Available Today': 'ఈరోజు అందుబాటులో ఉన్నారు',
    'Clear Filters': 'ఫిల్టర్లు క్లియర్ చేయండి',
    'View All': 'అన్నీ చూడండి',
    'All Specialties': 'అన్ని స్పెషాలిటీలు',
    'All Hospital Types': 'అన్ని ఆసుపత్రి రకాలు',
    'All Languages': 'అన్ని భాషలు',
  },
  ml: {
    // Navigation & Global Header
    'MEDORA': 'മെഡോറ (Medora)',
    'RURAL HEALTH': 'ഗ്രാമീണ ആരോഗ്യം',
    'Rural Health Continuity Platform': 'ഗ്രാമീണ ആരോഗ്യ സംരക്ഷണ പ്ലാറ്റ്‌ഫോം',
    'Rural Medical Emergency? Dial 108 (Ambulance) or 112 (National) immediately.': 'ഗ്രാമീണ മെഡിക്കൽ അടിയന്തരാവസ്ഥയോ? ഉടൻ 108 (ആംബുലൻസ്) അല്ലെങ്കിൽ 112 (ദേശീയ അടിയന്തരാവസ്ഥ) വിളിക്കുക.',
    'ROLE: PATIENT': 'റോൾ: രോഗി (PATIENT)',
    'ROLE: FAMILY': 'റോൾ: കുടുംബം (FAMILY)',
    'ROLE: DOCTOR': 'റോൾ: ഡോക്ടർ (DOCTOR)',
    'ROLE: ADMIN': 'റോൾ: അഡ്മിൻ (ADMIN)',
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
    'Listen': 'കേൾക്കുക (Listen)',
    'Playing audio...': 'ശബ്ദം പ്ലേ ചെയ്യുന്നു...',
    'DEMO DATA': 'ഡെമോ ഡാറ്റ',
    'Demo Data': 'ഡെമോ ഡാറ്റ',
    'Online (Direct)': 'ഓൺലൈൻ (ഡയറക്റ്റ്)',
    'Limited (2G/Edge)': 'പരിമിതം (2G/Edge)',
    'Offline (Store & Forward)': 'ഓഫ്‌ലൈൻ (സ്റ്റോർ & ഫോർവേഡ്)',
    'Rural Connectivity Simulator:': 'കണക്റ്റിവിറ്റി സിമുലേറ്റർ:',

    // Tabs
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

    // Care Tiers
    'Priority Rural Care Tiers': 'മുൻഗണനാ ഗ്രാമീണ ആരോഗ്യ വിഭാഗങ്ങൾ',
    'Essential Care for Vulnerable Family Members': 'കുടുംബാംഗങ്ങൾക്കുള്ള അത്യന്താപേക്ഷിതമായ പരിചരണം',
    'Dedicated health support for seniors, expecting mothers, and infants with 1-click clinical access.': 'മുതിർന്നവർക്കും ഗർഭിണികൾക്കും കുട്ടികൾക്കുമുള്ള 1-ക്ലിക്ക് ക്ലിനിക്കൽ പ്രവേശനം.',
    'Elderly Care': 'വയോജന പരിചരണം',
    '👵 Elderly Care ( )': '👵 വയോജന പരിചരണം',
    '👵 Elderly Care': '👵 വയോജന പരിചരണം',
    'Ages 60+': 'പ്രായം 60+',
    'Hypertension monitoring, osteoarthritis pain relief, fall risk prevention, and polypharmacy reviews.': 'രക്തസമ്മർദ്ദം, സന്ധി വേദന, വീഴ്ച തടയൽ, മരുന്നുകളുടെ അവലോകനം എന്നിവ.',
    'Daily BP logging (Morning & Evening)': 'ദിവസേനയുള്ള ബിപി പരിശോധന (രാവിലെയും വൈകുന്നേരവും)',
    'Joint mobility & warm compress routine': 'സന്ധി ചലനങ്ങൾ, ചൂടുവെള്ള പ്രയോഗം',
    'Geriatric OPD at District Civil Hospital': 'ജില്ലാ ആശുപത്രിയിലെ വയോജന ഒപിഡി',
    'Find Senior Doctor': 'മുതിർന്ന ഡോക്ടറെ കണ്ടെത്തുക',
    'Maternal Care': 'മാതൃ പരിചരണം',
    '🤰 Maternal Care': '🤰 മാതൃ പരിചരണം',
    'Trimester 1 - 3': 'ത്രിമാസം 1 - 3',
    'Prenatal vitamins, hemoglobin tracking, fetal movements, and institutional delivery prep.': 'പ്രസവപൂർവ്വ വിറ്റാമിനുകൾ, ഹീമോഗ്ലോബിൻ, ഭ്രൂണ ചലനങ്ങൾ, സുരക്ഷിത പ്രസവ തയാറെടുപ്പുകൾ.',
    'Iron & Folic Acid adherence (180+ days)': 'അയൺ & ഫോളിക് ആസിഡ് കഴിക്കൽ (180+ ദിവസം)',
    'High blood pressure & preeclampsia checks': 'ഉയർന്ന രക്തസമ്മർദ്ദം പരിശോധന',
    'Free PHC ambulance transit registration': 'സൗജന്യ പിഎച്ച്സി ആംബുലൻസ് രജിസ്ട്രേഷൻ',
    'Trimester Guide': 'ത്രിമാസ ഗൈഡ്',
    'Child Care': 'ശിശു പരിചരണം',
    '👶 Child Care': '👶 ശിശു പരിചരണം',
    'Ages 0 - 5': 'പ്രായം 0 - 5',
    'Immunization schedules, fever monitoring, growth milestones, and pediatric nutrition guidance.': 'വാക്സിനേഷൻ ഷെഡ്യൂൾ, പനി നിരീക്ഷണം, വളർച്ചാ ഘട്ടങ്ങൾ, പോഷകാഹാരം.',
    'Timely Pentavalent, Rotavirus & Measles': 'പെന്റാവാലന്റ്, റോട്ടാവൈറസ് & മീസിൽസ് വാക്സിൻ',
    'Fever & diarrhea hydration therapy (ORS)': 'പനിക്കും വയറിളക്കത്തിനും ഒആർഎസ് തെറാപ്പി',
    'Growth curve & mid-upper arm monitoring': 'വളർച്ചാ ചാർട്ടും ഭുജ ചുറ്റളവ് നിരീക്ഷണവും',
    'Child Care & Vaccines': 'ശിശു പരിചരണവും വാക്സിനുകളും',

    // Login Page
    'MEDORA – Rural Health Companion': 'മെഡോറ – ഗ്രാമീണ ആരോഗ്യ സഹായി',
    'Secure Rural Healthcare Continuity & ABHA Health Records Access': 'സുരക്ഷിത ഗ്രാമീണ ആരോഗ്യ തുടർച്ചയും ABHA രേഖകളും',
    'Select Role / Persona for 1-Click Instant Login': '1-ക്ലിക്ക് ലോഗിൻ ചെയ്യുന്നതിനായി റോൾ തിരഞ്ഞെടുക്കുക',
    'Villager / Patient': 'ഗ്രാമീണൻ / രോഗി',
    'Family / Household Head': 'കുടുംബനാഥൻ',
    'Doctor / Clinician': 'ഡോക്ടർ / ക്ലിനീഷ്യൻ',
    'Village Admin / ASHA': 'വില്ലേജ് അഡ്മിൻ / ആശാ വർക്കർ',
    'Individual File (P-1001)': 'വ്യക്തിഗത ഫയൽ (P-1001)',
    'Household (FAM-01, 4 Members)': 'കുടുംബം (FAM-01, 4 അംഗങ്ങൾ)',
    'District Civil Hospital Medical Staff': 'ജില്ലാ ആശുപത്രി മെഡിക്കൽ സ്റ്റാഫ്',
    'Gram Panchayat Health Registry Desk': 'ഗ്രാമപഞ്ചായത്ത് ആരോഗ്യ രജിസ്ട്രി ഡെസ്ക്',
    'Quick-Fill & Sign In': 'വേഗത്തിൽ പൂരിപ്പിച്ച് ലോഗിൻ ചെയ്യുക',
    'Demo Login Credentials': 'ഡെമോ ലോഗിൻ വിവരങ്ങൾ',
    'Username / ID / Ration Card': 'ഉപയോക്തൃനാമം / ഐഡി / റേഷൻ കാർഡ്',
    'Password': 'പാസ്‌വേഡ്',
    'Sign In to Medora': 'മെഡോറയിൽ പ്രവേശിക്കുക',
    'Signing In...': 'ലോഗിൻ ചെയ്യുന്നു...',
    'Secure Offline-First Session • ABHA / NDHM Sandbox Compliant': 'സുരക്ഷിത ഓഫ്‌ലൈൻ സെഷൻ • ABHA / NDHM അനുയോജ്യം',

    // Medical Vitals
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

    // Buttons
    'Search doctors, hospitals or specialties...': 'ഡോക്ടർമാർ, ആശുപത്രികൾ, സ്പെഷ്യാലിറ്റികൾ തിരയുക...',
    'Call Doctor': 'ഡോക്ടറെ വിളിക്കുക',
    'View Profile': 'പ്രൊഫൈൽ കാണുക',
    'Request Consultation': 'കൺസൾട്ടേഷൻ അഭ്യർത്ഥിക്കുക',
    'Add to Referral': 'റഫറലിൽ ചേർക്കുക',
    'Call Hospital': 'ആശുപത്രിയിലേക്ക് വിളിക്കുക',
    'Official Website': 'ഔദ്യോഗിക വെബ്സൈറ്റ്',
    'Get Directions': 'വഴി കണ്ടെത്തുക',
    'View Doctors': 'ഡോക്ടർമാരെ കാണുക',
    'Plan Referral': 'റഫറൽ ആസൂത്രണം ചെയ്യുക',
    'Print Report': 'റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യുക',
    'Export Demo Report': 'ഡെമോ റിപ്പോർട്ട് എക്സ്പോർട്ട് ചെയ്യുക',
    'Share Summary': 'സംഗ്രഹം ഷെയർ ചെയ്യുക',
    'SHARE WITH DOCTOR': 'ഡോക്ടറുമായി പങ്കിടുക',
    'Doctor-Ready Health Summary': 'ഡോക്ടർ-റെഡി സംഗ്രഹം',
    'Years Experience': 'വർഷത്തെ പരിചയം',
    'Travel Time': 'യാത്രാ സമയം',
    'Distance': 'ദൂരം',
    'Languages': 'ഭാഷകൾ',
    'Available Today': 'ഇന്ന് ലഭ്യമാണ്',
    'Clear Filters': 'ഫിൽട്ടറുകൾ മാറ്റുക',
    'View All': 'എല്ലാം കാണുക',
  },
  ta: {
    // Navigation & Global Header
    'MEDORA': 'மெடோரா (Medora)',
    'RURAL HEALTH': 'கிராமப்புற சுகாதாரம்',
    'Rural Health Continuity Platform': 'கிராமப்புற சுகாதார தொடர்ச்சி தளம்',
    'Rural Medical Emergency? Dial 108 (Ambulance) or 112 (National) immediately.': 'கிராமப்புற அவசர மருத்துவ உதவியா? உடனடியாக 108 (ஆம்புலன்ஸ்) அல்லது 112 (தேசிய உதவி) அழைக்கவும்.',
    'ROLE: PATIENT': 'பங்கு: நோயாளி (PATIENT)',
    'ROLE: FAMILY': 'பங்கு: குடும்பம் (FAMILY)',
    'ROLE: DOCTOR': 'பங்கு: மருத்துவர் (DOCTOR)',
    'ROLE: ADMIN': 'பங்கு: நிர்வாகி (ADMIN)',
    'ROLE': 'பங்கு (ROLE)',
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
    'Listen': 'கேட்கவும் (Listen)',
    'Playing audio...': 'ஆடியோ ஒலிக்கிறது...',
    'DEMO DATA': 'மாதிரி தரவு',
    'Demo Data': 'மாதிரி தரவு',
    'Online (Direct)': 'ஆன்லைன் (நேரடி)',
    'Limited (2G/Edge)': 'வரையறுக்கப்பட்ட (2G/Edge)',
    'Offline (Store & Forward)': 'ஆஃப்லைன் (சேமி & அனுப்பு)',
    'Rural Connectivity Simulator:': 'கிராமப்புற இணைப்பு சிமுலேட்டர்:',

    // Tabs
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

    // Care Tiers
    'Priority Rural Care Tiers': 'முன்னுரிமை கிராமப்புற பராமரிப்பு அடுக்குகள்',
    'Essential Care for Vulnerable Family Members': 'பாதிக்கப்படக்கூடிய குடும்ப உறுப்பினர்களுக்கான அத்தியாவசிய பராமரிப்பு',
    'Dedicated health support for seniors, expecting mothers, and infants with 1-click clinical access.': 'முதியவர்கள், கர்ப்பிணித் தாய்மார்கள் மற்றும் குழந்தைகளுக்கு 1-கிளிக் மருத்துவ அணுகல்.',
    'Elderly Care': 'முதியோர் பராமரிப்பு',
    '👵 Elderly Care ( )': '👵 முதியோர் பராமரிப்பு',
    '👵 Elderly Care': '👵 முதியோர் பராமரிப்பு',
    'Ages 60+': 'வயது 60+',
    'Hypertension monitoring, osteoarthritis pain relief, fall risk prevention, and polypharmacy reviews.': 'உயர் இரத்த அழுத்த கண்காணிப்பு, மூட்டு வலி நிவாரணம், வீழ்ச்சி தடுப்பு மற்றும் மருந்துகள் ஆய்வு.',
    'Daily BP logging (Morning & Evening)': 'தினசரி இரத்த அழுத்த பதிவு (காலை & மாலை)',
    'Joint mobility & warm compress routine': 'மூட்டு இயக்கம் & சூடான ஒத்தடம்',
    'Geriatric OPD at District Civil Hospital': 'மாவட்ட அரசு மருத்துவமனையில் முதியோர் பிரிவு',
    'Find Senior Doctor': 'முதியோர் மருத்துவரைத் தேடுங்கள்',
    'Maternal Care': 'தாய்மை பராமரிப்பு',
    '🤰 Maternal Care': '🤰 தாய்மை பராமரிப்பு',
    'Trimester 1 - 3': 'மும்மாதம் 1 - 3',
    'Prenatal vitamins, hemoglobin tracking, fetal movements, and institutional delivery prep.': 'மகப்பேறுக்கு முந்தைய வைட்டமின்கள், ஹீமோகுளோபின், கருவின் அசைவுகள், பிரசவ தயாரிப்பு.',
    'Iron & Folic Acid adherence (180+ days)': 'இரும்பு மற்றும் ஃபோலிக் அமிலம் (180+ நாட்கள்)',
    'High blood pressure & preeclampsia checks': 'உயர் இரத்த அழுத்தம் & பிரீக்ளாம்ப்சியா சோதனை',
    'Free PHC ambulance transit registration': 'இலவச ஆரம்ப சுகாதார நிலைய ஆம்புலன்ஸ் பதிவு',
    'Trimester Guide': 'மும்மாத வழிகாட்டி',
    'Child Care': 'குழந்தை பராமரிப்பு',
    '👶 Child Care': '👶 குழந்தை பராமரிப்பு',
    'Ages 0 - 5': 'வயது 0 - 5',
    'Immunization schedules, fever monitoring, growth milestones, and pediatric nutrition guidance.': 'தடுப்பூசி அட்டவணை, காய்ச்சல் கண்காணிப்பு, வளர்ச்சி மைல்கற்கள் மற்றும் ஊட்டச்சத்து.',
    'Timely Pentavalent, Rotavirus & Measles': 'பெண்டாவலன்ட், ரோட்டாவைரஸ் & தட்டம்மை தடுப்பூசிகள்',
    'Fever & diarrhea hydration therapy (ORS)': 'காய்ச்சல் மற்றும் வயிற்றுப்போக்குக்கு ஓஆர்எஸ் திரவம்',
    'Growth curve & mid-upper arm monitoring': 'வளர்ச்சி வளைவு & புஜ சுற்றளவு கண்காணிப்பு',
    'Child Care & Vaccines': 'குழந்தை பராமரிப்பு & தடுப்பூசிகள்',

    // Login Page
    'MEDORA – Rural Health Companion': 'மெடோரா – கிராமப்புற சுகாதார துணைவன்',
    'Secure Rural Healthcare Continuity & ABHA Health Records Access': 'பாதுகாப்பான கிராமப்புற சுகாதார தொடர்ச்சி & ABHA மருத்துவ ஆவணங்கள்',
    'Select Role / Persona for 1-Click Instant Login': '1-கிளிக் உடனடி உள்நுழைவுக்கு பாத்திரத்தைத் தேர்ந்தெடுக்கவும்',
    'Villager / Patient': 'கிராமவாசி / நோயாளி',
    'Family / Household Head': 'குடும்பத் தலைவர்',
    'Doctor / Clinician': 'மருத்துவர் / மருத்துவர் ஆலோசகர்',
    'Village Admin / ASHA': 'கிராம நிர்வாகி / ஆஷா பணியாளர்',
    'Individual File (P-1001)': 'தனிநபர் ஆவணம் (P-1001)',
    'Household (FAM-01, 4 Members)': 'குடும்பம் (FAM-01, 4 உறுப்பினர்கள்)',
    'District Civil Hospital Medical Staff': 'மாவட்ட தலைமை மருத்துவமனை ஊழியர்',
    'Gram Panchayat Health Registry Desk': 'கிராம பஞ்சாயத்து சுகாதார பதிவேடு மையம்',
    'Quick-Fill & Sign In': 'விரைவு நிரப்பி உள்நுழைக',
    'Demo Login Credentials': 'டெமோ உள்நுழைவு விவரங்கள்',
    'Username / ID / Ration Card': 'பயனர்பெயர் / ஐடி / ரேஷன் கார்டு',
    'Password': 'கடவுச்சொல்',
    'Sign In to Medora': 'மெடோராவில் நுழைக',
    'Signing In...': 'உள்நுழைகிறது...',
    'Secure Offline-First Session • ABHA / NDHM Sandbox Compliant': 'பாதுகாப்பான ஆஃப்லைன் அமர்வு • ABHA / NDHM இணக்கமானது',

    // Medical Vitals
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

    // Buttons
    'Search doctors, hospitals or specialties...': 'மருத்துவர்கள், மருத்துவமனைகள் அல்லது சிகிச்சையைத் தேடுங்கள்...',
    'Call Doctor': 'மருத்துவரை அழைக்கவும்',
    'View Profile': 'சுயவிவரத்தைக் காண்க',
    'Request Consultation': 'ஆலோசனை கோரிக்கை',
    'Add to Referral': 'பரிந்துரையில் சேர்க்கவும்',
    'Call Hospital': 'மருத்துவமனையை அழைக்கவும்',
    'Official Website': 'அதிகாரப்பூர்வ தளம்',
    'Get Directions': 'வழித்தடத்தைக் காண்க',
    'View Doctors': 'மருத்துவர்களைக் காண்க',
    'Plan Referral': 'பரிந்துரையைத் திட்டமிடுங்கள்',
    'Print Report': 'அறிக்கையை அச்சிடுக',
    'Export Demo Report': 'மாதிரி அறிக்கையை ஏற்றுமதி செய்க',
    'Share Summary': 'சுருக்கத்தைப் பகிரவும்',
    'SHARE WITH DOCTOR': 'மருத்துவருடன் பகிரவும்',
    'Doctor-Ready Health Summary': 'மருத்துவர் தயார் அறிக்கை',
    'Years Experience': 'ஆண்டுகள் அனுபவம்',
    'Travel Time': 'பயண நேரம்',
    'Distance': 'தூரம்',
    'Languages': 'மொழிகள்',
    'Available Today': 'இன்று கிடைக்கும்',
    'Clear Filters': 'வடிகட்டிகளை அழிக்கவும்',
    'View All': 'அனைத்தையும் காண்க',
  },
  kn: {
    // Navigation & Global Header
    'MEDORA': 'ಮೆಡೋರಾ (Medora)',
    'RURAL HEALTH': 'ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ',
    'Rural Health Continuity Platform': 'ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ನಿರಂತರತೆ ವೇದಿಕೆ',
    'Rural Medical Emergency? Dial 108 (Ambulance) or 112 (National) immediately.': 'ಗ್ರಾಮೀಣ ವೈದ್ಯಕೀಯ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯೇ? ತಕ್ಷಣ 108 (ಅಂಬ್ಯುಲೆನ್ಸ್) ಅಥವಾ 112 (ರಾಷ್ಟ್ರೀಯ ತುರ್ತು) ಕರೆ ಮಾಡಿ.',
    'ROLE: PATIENT': 'ಪಾತ್ರ: ರೋಗಿ (PATIENT)',
    'ROLE: FAMILY': 'ಪಾತ್ರ: ಕುಟುಂಬ (FAMILY)',
    'ROLE: DOCTOR': 'ಪಾತ್ರ: ವೈದ್ಯರು (DOCTOR)',
    'ROLE: ADMIN': 'ಪಾತ್ರ: ಗ್ರಾಮ ಆಡಳಿತ (ADMIN)',
    'ROLE': 'ಪಾತ್ರ (ROLE)',
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
    'Listen': 'ಕೇಳಿ (Listen)',
    'Playing audio...': 'ಆಡಿಯೊ ಚಾಲನೆಯಲ್ಲಿದೆ...',
    'DEMO DATA': 'ಡೆಮೊ ಡೇಟಾ',
    'Demo Data': 'ಡೆಮೊ ಡೇಟಾ',
    'Online (Direct)': 'ಆನ್‌ಲೈನ್ (ನೇರ)',
    'Limited (2G/Edge)': 'ಸೀಮಿತ (2G/Edge)',
    'Offline (Store & Forward)': 'ಆಫ್‌ಲೈನ್ (ಸಂಗ್ರಹಿಸಿ & ಕಳುಹಿಸಿ)',
    'Rural Connectivity Simulator:': 'ಗ್ರಾಮೀಣ ಕನೆಕ್ಟಿವಿಟಿ ಸಿಮ್ಯುಲೇಟರ್:',

    // Tabs
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

    // Care Tiers
    'Priority Rural Care Tiers': 'ಆದ್ಯತೆಯ ಗ್ರಾಮೀಣ ಆರೈಕೆ ವಿಭಾಗಗಳು',
    'Essential Care for Vulnerable Family Members': 'ಕುಟುಂಬ ಸದಸ್ಯರಿಗೆ ಅಗತ್ಯ ಆರೈಕೆ',
    'Dedicated health support for seniors, expecting mothers, and infants with 1-click clinical access.': 'ಹಿರಿಯರು, ಗರ್ಭಿಣಿಯರು ಮತ್ತು ಶಿಶುಗಳಿಗೆ 1-ಕ್ಲಿಕ್ ವೈದ್ಯಕೀಯ ಪ್ರವೇಶ.',
    'Elderly Care': 'ಹಿರಿಯರ ಆರೈಕೆ',
    '👵 Elderly Care ( )': '👵 ಹಿರಿಯರ ಆರೈಕೆ',
    '👵 Elderly Care': '👵 ಹಿರಿಯರ ಆರೈಕೆ',
    'Ages 60+': 'ವಯಸ್ಸು 60+',
    'Hypertension monitoring, osteoarthritis pain relief, fall risk prevention, and polypharmacy reviews.': 'ರಕ್ತದೊತ್ತಡ ಮೇಲ್ವಿಚಾರಣೆ, ಕೀಲು ನೋವು ನಿವಾರಣೆ, ಬೀಳುವ ಅಪಾಯ ತಡೆಗಟ್ಟುವಿಕೆ ಮತ್ತು ಔಷಧಿ ಪರಿಶೀಲನೆ.',
    'Daily BP logging (Morning & Evening)': 'ದೈನಂದಿನ ಬಿಪಿ ದಾಖಲಾತಿ (ಬೆಳಿಗ್ಗೆ & ಸಂಜೆ)',
    'Joint mobility & warm compress routine': 'ಕೀಲುಗಳ ಚಲನೆ ಮತ್ತು ಬಿಸಿ ಶಾಖ ನೀಡುವಿಕೆ',
    'Geriatric OPD at District Civil Hospital': 'ಜಿಲ್ಲಾ ನಾಗರಿಕ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಹಿರಿಯ ನಾಗರಿಕರ ಒಪಿಡಿ',
    'Find Senior Doctor': 'ಹಿರಿಯ ವೈದ್ಯರನ್ನು ಹುಡುಕಿ',
    'Maternal Care': 'ಮಾತೃ ಆರೈಕೆ',
    '🤰 Maternal Care': '🤰 ಮಾತೃ ಆರೈಕೆ',
    'Trimester 1 - 3': 'ತ್ರೈಮಾಸಿಕ 1 - 3',
    'Prenatal vitamins, hemoglobin tracking, fetal movements, and institutional delivery prep.': 'ಪ್ರಸವಪೂರ್ವ ಜೀವಸತ್ವಗಳು, ಹಿಮೋಗ್ಲೋಬಿನ್, ಭ್ರೂಣದ ಚಲನೆಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ಹೆರಿಗೆ ಸಿದ್ಧತೆ.',
    'Iron & Folic Acid adherence (180+ days)': 'ಕಬ್ಬಿಣ ಮತ್ತು ಫೋಲಿಕ್ ಆಮ್ಲ ಬಳಕೆ (180+ ದಿನಗಳು)',
    'High blood pressure & preeclampsia checks': 'ಅಧಿಕ ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಪ್ರಿಕ್ಲಾಂಪ್ಸಿಯಾ ತಪಾಸಣೆ',
    'Free PHC ambulance transit registration': 'ಉಚಿತ ಪಿಹೆಚ್‌ಸಿ ಅಂಬ್ಯುಲೆನ್ಸ್ ನೋಂದಣಿ',
    'Trimester Guide': 'ತ್ರೈಮಾಸಿಕ ಮಾರ್ಗದರ್ಶಿ',
    'Child Care': 'ಮಕ್ಕಳ ಆರೈಕೆ',
    '👶 Child Care': '👶 ಮಕ್ಕಳ ಆರೈಕೆ',
    'Ages 0 - 5': 'ವಯಸ್ಸು 0 - 5',
    'Immunization schedules, fever monitoring, growth milestones, and pediatric nutrition guidance.': 'ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ, ಜ್ವರದ ಮೇಲ್ವಿಚಾರಣೆ, ಬೆಳವಣಿಗೆಯ ಮೈಲಿಗಲ್ಲುಗಳು ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶ ಮಾರ್ಗದರ್ಶನ.',
    'Timely Pentavalent, Rotavirus & Measles': 'ಸಕಾಲಿಕ ಪೆಂಟಾವಲೆಂಟ್, ರೋಟಾವೈರಸ್ & ದಡಾರ ಲಸಿಕೆ',
    'Fever & diarrhea hydration therapy (ORS)': 'ಜ್ವರ ಮತ್ತು ಅತಿಸಾರಕ್ಕೆ ಓಆರ್‌ಎಸ್ ಹೈಡ್ರೇಶನ್ ಚಿಕಿತ್ಸೆ',
    'Growth curve & mid-upper arm monitoring': 'ಬೆಳವಣಿಗೆಯ ರೇಖೆ ಮತ್ತು ತೋಳಿನ ಸುತ್ತಳತೆ ಮೇಲ್ವಿಚಾರಣೆ',
    'Child Care & Vaccines': 'ಮಕ್ಕಳ ಆರೈಕೆ & ಲಸಿಕೆಗಳು',

    // Login Page
    'MEDORA – Rural Health Companion': 'ಮೆಡೋರಾ – ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಸಂಗಾತಿ',
    'Secure Rural Healthcare Continuity & ABHA Health Records Access': 'ಸುರಕ್ಷಿತ ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ನಿರಂತರತೆ ಮತ್ತು ABHA ಆರೋಗ್ಯ ದಾಖಲೆಗಳು',
    'Select Role / Persona for 1-Click Instant Login': '1-ಕ್ಲಿಕ್ ತತ್‌ಕ್ಷಣ ಲಾಗಿನ್‌ಗಾಗಿ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'Villager / Patient': 'ಗ್ರಾಮಸ್ಥ / ರೋಗಿ',
    'Family / Household Head': 'ಕುಟುಂಬದ ಮುಖ್ಯಸ್ಥ',
    'Doctor / Clinician': 'ವೈದ್ಯರು / ಚಿಕಿತ್ಸಕರು',
    'Village Admin / ASHA': 'ಗ್ರಾಮ ಆಡಳಿತ / ಆಶಾ ಕಾರ್ಯಕರ್ತೆ',
    'Individual File (P-1001)': 'ವೈಯಕ್ತಿಕ ಫೈಲ್ (P-1001)',
    'Household (FAM-01, 4 Members)': 'ಕುಟುಂಬ (FAM-01, 4 ಸದಸ್ಯರು)',
    'District Civil Hospital Medical Staff': 'ಜಿಲ್ಲಾ ಸಿವಿಲ್ ಆಸ್ಪತ್ರೆ ವೈದ್ಯಕೀಯ ಸಿಬ್ಬಂದಿ',
    'Gram Panchayat Health Registry Desk': 'ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆರೋಗ್ಯ ನೋಂದಣಿ ಕೇಂದ್ರ',
    'Quick-Fill & Sign In': 'ತ್ವರಿತ ಭರ್ತಿ ಮತ್ತು ಲಾಗಿನ್',
    'Demo Login Credentials': 'ಡೆಮೊ ಲಾಗಿನ್ ವಿವರಗಳು',
    'Username / ID / Ration Card': 'ಬಳಕೆದಾರ ಹೆಸರು / ಐಡಿ / ಪಡಿತರ ಚೀಟಿ',
    'Password': 'ಪಾಸ್‌ವರ್ಡ್',
    'Sign In to Medora': 'ಮೆಡೋರಾಗೆ ಲಾಗಿನ್ ಮಾಡಿ',
    'Signing In...': 'ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...',
    'Secure Offline-First Session • ABHA / NDHM Sandbox Compliant': 'ಸುರಕ್ಷಿತ ಆಫ್‌ಲೈನ್ ಸೆಷನ್ • ABHA / NDHM ಮಾನದಂಡಗಳು',

    // Medical Vitals
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

    // Buttons
    'Search doctors, hospitals or specialties...': 'ವೈದ್ಯರು, ಆಸ್ಪತ್ರೆಗಳು ಅಥವಾ ವಿಭಾಗಗಳನ್ನು ಹುಡುಕಿ...',
    'Call Doctor': 'ವೈದ್ಯರಿಗೆ ಕರೆ ಮಾಡಿ',
    'View Profile': 'ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಿಸಿ',
    'Request Consultation': 'ಸಮಾಲೋಚನೆಗೆ ವಿನಂತಿಸಿ',
    'AddToReferral': 'ರೆಫರಲ್‌ಗೆ ಸೇರಿಸಿ',
    'addToReferral': 'ರೆಫರಲ್‌ಗೆ ಸೇರಿಸಿ',
    'Call Hospital': 'ಆಸ್ಪತ್ರೆಗೆ ಕರೆ ಮಾಡಿ',
    'Official Website': 'ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್',
    'Get Directions': 'ದಾರಿ ತೋರಿಸಿ (ರೂಟ್)',
    'View Doctors': 'ವೈದ್ಯರನ್ನು ವೀಕ್ಷಿಸಿ',
    'Plan Referral': 'ರೆಫರಲ್ ಯೋಜಿಸಿ',
    'Print Report': 'ವರದಿಯನ್ನು ಮುದ್ರಿಸಿ',
    'Export Demo Report': 'ಡೆಮೊ ವರದಿ ರಫ್ತು ಮಾಡಿ',
    'Share Summary': 'ಸಾರಾಂಶ ಹಂಚಿಕೊಳ್ಳಿ',
    'SHARE WITH DOCTOR': 'ವೈದ್ಯರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ',
    'Doctor-Ready Health Summary': 'ವೈದ್ಯರ ಸಾರಾಂಶ ವರದಿ',
    'Years Experience': 'ವರ್ಷಗಳ ಅನುಭವ',
    'Travel Time': 'ಪ್ರಯಾಣದ ಸಮಯ',
    'Distance': 'ದೂರ',
    'Languages': 'ಭಾಷೆಗಳು',
    'Available Today': 'ಇಂದು ಲಭ್ಯವಿದೆ',
    'Clear Filters': 'ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ',
    'View All': 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ',
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

    // Translate attributes like placeholder and title
    const elements = root.querySelectorAll<HTMLElement>('input, button, [title], [placeholder]');
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
    });
  } finally {
    // Release translation lock after short microtask
    setTimeout(() => {
      isTranslating = false;
    }, 40);
  }
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

  // 2. Set up reactive observer so newly added cards/modals/tabs are translated immediately
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
      }, 80);
    });
  }

  observer.disconnect();
  observer.observe(root, { childList: true, subtree: true, characterData: false });
};

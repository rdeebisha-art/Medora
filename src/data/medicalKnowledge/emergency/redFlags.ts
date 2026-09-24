import { EmergencyRedFlag } from '../types';
import { MEDICAL_SOURCES } from '../version/knowledgeBaseVersion';

export const EMERGENCY_RED_FLAGS: EmergencyRedFlag[] = [
  {
    id: 'RED_FLAG_BREATHING',
    concept: 'BREATHING_DIFFICULTY',
    symptoms: {
      en: 'Severe breathlessness, inability to speak full sentences, blue lips/fingers, or gasping',
      hi: 'गंभीर सांस फूलना, पूरा वाक्य न बोल पाना, होंठ या उंगलियां नीली पड़ना',
      ta: 'கடுமையான மூச்சுத் திணறல், முழு வாக்கியம் பேச இயலாமை, உதடுகள் நீலமாதல்',
      te: 'తీవ్రమైన శ్వాస ఆడకపోవడం, మాట్లాడలేకపోవడం, పెదవులు నీలంగా మారడం',
      ml: 'കഠിനമായ ശ്വാസതടസ്സം, സംസാരിക്കാൻ ബുദ്ധിമുട്ട്, ചുണ്ടുകൾ നീലനിറമാകുന്നത്',
      kn: 'ತೀವ್ರ ಉಸಿರಾಟದ ತೊಂದರೆ, ಪೂರ್ಣ ವಾಕ್ಯ ಮಾತನಾಡಲಾಗದಿರುವುದು, ತುಟಿಗಳು ನೀಲಿಗಟ್ಟುವುದು'
    },
    severity: 'CRITICAL_EMERGENCY',
    immediateActions: [
      {
        en: 'Sit upright, keep airways clear, call 108 or arrange immediate transport to emergency facility',
        hi: 'सीधे बैठें, वायुमार्ग खुला रखें, तुरंत 108 पर कॉल करें या अस्पताल ले जाएं',
        ta: 'நேராக அமரவும், உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும் அல்லது அவசர மருத்துவமனைக்கு செல்லவும்',
        te: 'నిటారుగా కూర్చోండి, వెంటనే 108 కి కాల్ చేయండి లేదా ఆసుపత్రికి తరలించండి',
        ml: 'നേരെ ഇരിക്കുക, ഉടനടി 108 ആംബുലൻസ് വിളിക്കുക അല്ലെങ്കിൽ ആശുപത്രിയിലെത്തുക',
        kn: 'ನೇರವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಿ, ತಕ್ಷಣ 108 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ತುರ್ತು ಚಿಕಿತ್ಸೆಗೆ ಕರೆದೊಯ್ಯಿರಿ'
      }
    ],
    warningNote: {
      en: 'Do not wait. Breathing failure can worsen rapidly within minutes.',
      hi: 'प्रतीक्षा न करें। सांस की गंभीर समस्या मिनटों में बढ़ सकती है।',
      ta: 'தாமதிக்க வேண்டாம். மூச்சுத் திணறல் சில நிமிடங்களில் தீவிரமடையலாம்.',
      te: 'ఆలస్యం చేయవద్దు. శ్వాస సమస్య నిమిషాల్లో తీవ్రం కావచ్చు.',
      ml: 'വൈകരുത്. ശ്വാസതടസ്സം മിനിറ്റുകൾക്കുള്ളിൽ വഷളായേക്കാം.',
      kn: 'ವಿಳಂಬ ಮಾಡಬೇಡಿ. ಉಸಿರಾಟದ ತೊಂದರೆ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ತೀವ್ರವಾಗಬಹುದು.'
    },
    recommendedFacility: 'district_hospital_icu',
    source: MEDICAL_SOURCES.MOHFW_NPCDCS_HYPERTENSION
  },
  {
    id: 'RED_FLAG_CHEST_PAIN',
    concept: 'CHEST_PAIN',
    symptoms: {
      en: 'Crushing or radiating chest pain to left arm/jaw, sweating, dizziness or sudden collapse',
      hi: 'सीने में भारी दबाव या दर्द जो बाएं हाथ/जबड़े तक फैले, पसीना और चक्कर आना',
      ta: 'நெஞ்சில் கடுமையான அழுத்தம் அல்லது வலி, இடது கை/தாடைக்கு பரவுதல், வியர்வை, மயக்கம்',
      te: 'ఛాతీలో తీవ్రమైన నొప్పి లేదా ఒత్తిడి, ఎడమ చెయ్యి/దవడకు పాకడం, చెమటలు మరియు కళ్లు తిరగడం',
      ml: 'നെഞ്ചിൽ കഠിനമായ വേദന, ഇടതുകൈയിലേക്കോ താടിയിലേക്കോ വ്യാപിക്കുന്നത്, വിയർപ്പ്, തലകറക്കം',
      kn: 'ಎದೆಯಲ್ಲಿ ಅತಿಯಾದ ನೋವು, ಎಡಗೈ/ದವಡೆಗೆ ಹರಡುವುದು, ಅತಿಯಾದ ಬೆವರು ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ'
    },
    severity: 'CRITICAL_EMERGENCY',
    immediateActions: [
      {
        en: 'Keep patient calm, resting, avoid physical exertion, call 108 emergency ambulance immediately',
        hi: 'मरीज को शांत रखें, लेटने या झुकने दें, तुरंत 108 एम्बुलेंस बुलाएं',
        ta: 'நோயாளியை ஓய்வெடுக்க வைக்கவும், உடலுழைப்பை தவிர்க்கவும், உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும்',
        te: 'రోగిని విశ్రాంతిగా ఉంచండి, వెంటనే 108 అంబులెన్స్ పిలవండి',
        ml: 'രോഗിയെ ശാന്തമായി വിശ്രമിക്കാൻ അനുവദിക്കുക, ഉടൻ 108 ആംബുലൻസ് വിളിക്കുക',
        kn: 'ರೋಗಿಯನ್ನು ಶಾಂತವಾಗಿ ವಿಶ್ರಾಂತಿಯಲ್ಲಿರಿಸಿ, ತಕ್ಷಣ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ'
      }
    ],
    warningNote: {
      en: 'Possible acute coronary syndrome (heart attack). Requires immediate ECG and ICU assessment.',
      hi: 'दिल के दौरे (हार्ट अटैक) की संभावना। तुरंत ईसीजी और आपातकालीन देखभाल आवश्यक है।',
      ta: 'மாரடைப்புக்கான சாத்தியக்கூறு. உடனடியாக ஈசிஜி மற்றும் அவசர சிகிச்சை பிரிவு தேவை.',
      te: 'గుండెపోటు వచ్చే అవకాశం ఉంది. తక్షణ ఈసీజీ మరియు అత్యవసర చికిత్స అవసరం.',
      ml: 'ഹൃദയാഘാത സാധ്യത. ഉടനടി ഇസിജി പരിശോധനയും അടിയന്തര പരിചരണവും ആവശ്യമാണ്.',
      kn: 'ಹೃದಯಾಘಾತದ ಸಂಭವನೀಯತೆ. ತಕ್ಷಣವೇ ಇಸಿಜಿ ಮತ್ತು ತುರ್ತು ನಿಗಾ ಘಟಕದ ಆರೈಕೆ ಅಗತ್ಯವಿದೆ.'
    },
    recommendedFacility: 'district_hospital_icu',
    source: MEDICAL_SOURCES.MOHFW_NPCDCS_HYPERTENSION
  },
  {
    id: 'RED_FLAG_PREGNANCY_DANGER',
    concept: 'PREGNANCY_CONCERN',
    symptoms: {
      en: 'Vaginal bleeding, severe headache with blurry vision, seizures, high fever, or watery discharge in pregnancy',
      hi: 'गर्भावस्था में योनि से रक्तस्राव, धुंधली दृष्टि के साथ सिरदर्द, दौरे या तेज बुखार',
      ta: 'கர்ப்ப காலத்தில் உதிரப்போக்கு, தீவிர தலைவலியுடன் பார்வை மங்குதல், வலிப்பு, அல்லது காய்ச்சல்',
      te: 'గర్భధారణలో రక్తస్రావం, తీవ్రమైన తలనొప్పితో చూపు మందగించడం, మూర్ఛలు లేదా అధిక జ్వరం',
      ml: 'ഗർഭകാലത്തെ രക്തസ്രാവം, കാഴ്ച മങ്ങുന്ന തലവേദന, അപസ്മാരം, അല്ലെങ്കിൽ ഉയർന്ന പനി',
      kn: 'ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ರಕ್ತಸ್ರಾವ, ದೃಷ್ಟಿ ಮಸುಕಾಗುವ ತಲೆನೋವು, ಫಿಟ್ಸ್ ಅಥವಾ ಅತಿಯಾದ ಜ್ವರ'
    },
    severity: 'CRITICAL_EMERGENCY',
    immediateActions: [
      {
        en: 'Call 108/102 Janani Shishu ambulance immediately, transfer to First Referral Unit (FRU) / CHC',
        hi: 'तुरंत 108/102 जननी एक्सप्रेस बुलाएं और निकटतम प्रसूति केंद्र/अस्पताल ले जाएं',
        ta: 'உடனடியாக 108/102 அவசர ஊர்தியை அழைத்து அரசு மகப்பேறு மருத்துவமனைக்கு அழைத்துச் செல்லவும்',
        te: 'వెంటనే 108/102 కు కాల్ చేసి సమీప ప్రసూతి కేంద్రానికి తీసుకెళ్లండి',
        ml: 'ഉടൻ 108/102 വിളിക്കുക, അടുത്തുള്ള പ്രസവ ചികിത്സാ കേന്ദ്രത്തിലേക്ക് മാറ്റുക',
        kn: 'ತಕ್ಷಣ 108/102 ಗೆ ಕರೆ ಮಾಡಿ ತಾಯಿ-ಮಗು ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ'
      }
    ],
    warningNote: {
      en: 'High risk for mother and baby (pre-eclampsia / eclampsia or placental emergency).',
      hi: 'माता और शिशु दोनों के लिए अत्यधिक जोखिम (एक्लेम्पसिया या अन्य जटिलता)।',
      ta: 'தாய் மற்றும் சேய் இருவருக்கும் ஆபத்தான நிலை (எக்லாம்ப்சியா அல்லது பிற சிக்கல்).',
      te: 'తల్లీ బిడ్డలిద్దరికీ ప్రమాదకరమైన పరిస్థితి.',
      ml: 'അമ്മയ്ക്കും കുഞ്ഞിനും അതീവ ഗുരുതരമായേക്കാവുന്ന അവസ്ഥ.',
      kn: 'ತಾಯಿ ಮತ್ತು ಮಗು ಇಬ್ಬರಿಗೂ ಅಪಾಯಕಾರಿ ಸ್ಥಿತಿ.'
    },
    recommendedFacility: 'maternity_emergency',
    source: MEDICAL_SOURCES.MOHFW_MATERNAL_CARE
  },
  {
    id: 'RED_FLAG_NEWBORN_DANGER',
    concept: 'NEWBORN_CONCERN',
    symptoms: {
      en: 'Newborn unable to feed, fast breathing (>60/min), chest in-drawing, hypothermia or high fever, yellow palms/soles',
      hi: 'नवजात का दूध न पीना, तेज सांस (>60/मिनट), पसलियां धंसना, शरीर ठंडा या बहुत गर्म होना',
      ta: 'பச்சிளம் குழந்தை பால் குடிக்க இயலாமை, வேகமான மூச்சு (>60/நிமிடம்), நெஞ்சு உள்வாங்குதல், உடல் குளிர்ந்துபோதல்',
      te: 'నవజాత శిశువు పాలు తాగలేకపోవడం, వేగంగా శ్వాసించడం, పక్కటెముకలు లోపలికి లాగడం, ఒళ్లు చల్లబడటం',
      ml: 'നവജാതശിശു പാൽ കുടിക്കാതിരിക്കുക, വേഗത്തിലുള്ള ശ്വാസമെടുക്കൽ, നെഞ്ച് താഴ്ന്നുപോവുക, ശരീരം തണുക്കുക',
      kn: 'ನವಜಾತ ಶಿಶು ಹಾಲು ಕುಡಿಯದಿರುವುದು, ವೇಗವಾದ ಉಸಿರಾಟ, ಎದೆ ಒಳಗೆ ಎಳೆಯುವುದು, ದೇಹ ತಣ್ಣಗಾಗುವುದು'
    },
    severity: 'CRITICAL_EMERGENCY',
    immediateActions: [
      {
        en: 'Keep baby warm through skin-to-skin contact, do not give water or animal milk, rush to SNCU/hospital',
        hi: 'बच्चे को मां के सीने से लगाकर गर्म रखें, कोई पानी या दवा न दें, तुरंत अस्पताल ले जाएं',
        ta: 'குழந்தையை கதகதப்பாக வைத்திருக்கவும், தண்ணீர் அல்லது தேன் எதுவும் தரவேண்டாம், உடனடியாக மருத்துவமனைக்கு செல்லவும்',
        te: 'శిశువును వెచ్చగా ఉంచండి, ఎటువంటి ఇతర పదార్థాలు ఇవ్వకండి, వెంటనే SNCU/ఆసుపత్రికి తరలించండి',
        ml: 'കുഞ്ഞിനെ ചൂടോടെ സൂക്ഷിക്കുക, ഉടൻ ആശുപത്രിയിലെ നവജാത പരിചരണ വിഭാഗത്തിലെത്തിക്കുക',
        kn: 'ಮಗುವನ್ನು ಬೆಚ್ಚಗಿರಿಸಿ, ಯಾವುದೇ ಮನೆಮದ್ದು ನೀಡದೆ ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಕೊಂಡೊಯ್ಯಿರಿ'
      }
    ],
    warningNote: {
      en: 'Possible severe neonatal sepsis or respiratory distress. Requires Newborn Care Unit.',
      hi: 'नवजात शिशु में गंभीर संक्रमण या सांस की समस्या। तत्काल विशेष नवजात देखभाल आवश्यक।',
      ta: 'பச்சிளம் குழந்தைக்கு தீவிர தொற்று அல்லது மூச்சுப் பிரச்சனை சாத்தியம்.',
      te: 'నవజాత శిశువుకు తీవ్ర ఇన్ఫెక్షన్ ఉండే ప్రమాదం.',
      ml: 'നവജാതശിശുക്കളിലെ അതീവ ഗുരുതരമായ അണുബാധയുടെ ലക്ഷണം.',
      kn: 'ನವಜಾತ ಶಿಶುವಿನಲ್ಲಿ ಗಂಭೀರ ಸೋಂಕು ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ.'
    },
    recommendedFacility: 'district_hospital_icu',
    source: MEDICAL_SOURCES.WHO_IMCI_PEDIATRIC
  },
  {
    id: 'RED_FLAG_SEIZURE_UNCONSCIOUS',
    concept: 'EMERGENCY',
    symptoms: {
      en: 'Convulsions/fits, sudden loss of consciousness, unresponsiveness, or severe neck stiffness with high fever',
      hi: 'दौरे पड़ना (मिर्गी जैसे झटके), अचानक बेहोश होना, गर्दन में अकड़न के साथ तेज बुखार',
      ta: 'வலிப்பு, திடீர் சுயநினைவின்மை, அழைத்தால் பதிலளிக்காத நிலை, கழுத்து விரைப்புடன் தீவிர காய்ச்சல்',
      te: 'మూర్ఛలు, స్పృహ తప్పిపోవడం, మెడ బిగుసుకుపోవడంతో అధిక జ్వరం',
      ml: 'അപസ്മാര ലക്ഷണങ്ങൾ, ബോധക്ഷയം, കഴുത്ത് അനക്കാൻ പറ്റാത്ത വിധമുള്ള കഠിനമായ പനി',
      kn: 'ಫಿಟ್ಸ್ ಬರುವುದು, ಪ್ರಜ್ಞೆ ತಪ್ಪುವುದು, ಕತ್ತು ಬಿಗಿತದೊಂದಿಗೆ ತೀವ್ರ ಜ್ವರ'
    },
    severity: 'CRITICAL_EMERGENCY',
    immediateActions: [
      {
        en: 'Turn patient to side (recovery position), do not put anything in mouth, keep clear of sharp objects, call 108',
        hi: 'मरीज को करवट दिलाकर लिटाएं, मुंह में कुछ न डालें, तुरंत 108 पर कॉल करें',
        ta: 'நோயாளியை ஒருபுறமாக சாய்த்து படுக்க வைக்கவும், வாயில் எதுவும் வைக்க வேண்டாம், 108 ஆம்புலன்ஸை அழைக்கவும்',
        te: 'రోగిని పక్కకు తిప్పి పడుకోబెట్టండి, నోట్లో ఏమీ పెట్టవద్దు, వెంటనే 108 కి కాల్ చేయండి',
        ml: 'രോഗിയെ ഒരു വശത്തേക്ക് ചരിച്ചു കിടത്തുക, വായിൽ ഒന്നും വെയ്ക്കരുത്, 108 വിളിക്കുക',
        kn: 'ರೋಗಿಯನ್ನು ಒಂದು ಮಗ್ಗುಲಿಗೆ ಮಲಗಿಸಿ, ಬಾಯಿಯಲ್ಲಿ ಏನನ್ನೂ ಹಾಕಬೇಡಿ, 108 ಗೆ ಕರೆ ಮಾಡಿ'
      }
    ],
    warningNote: {
      en: 'Suspected meningitis, cerebral malaria, or neurological crisis. Life-threatening emergency.',
      hi: 'मस्तिष्क ज्वर या गंभीर तंत्रिका तंत्र आपातकाल की संभावना।',
      ta: 'மூளைக்காய்ச்சல் அல்லது தீவிர நரம்பியல் அவசர நிலை சாத்தியம்.',
      te: 'మెదడువాపు లేదా నాడీ సంబంధిత అత్యవసర పరిస్థితి.',
      ml: 'മെനിഞ്ചൈറ്റിസ് അല്ലെങ്കിൽ അതീവ ഗുരുതര മസ്തിഷ്ക പ്രശ്നത്തിന്റെ ലക്ഷണം.',
      kn: 'ಮೆದುಳು ಜ್ವರ ಅಥವಾ ತುರ್ತು ನರರೋಗ ಸಮಸ್ಯೆ ಸಂಭವನೀಯತೆ.'
    },
    recommendedFacility: 'district_hospital_icu',
    source: MEDICAL_SOURCES.WHO_IMCI_PEDIATRIC
  }
];

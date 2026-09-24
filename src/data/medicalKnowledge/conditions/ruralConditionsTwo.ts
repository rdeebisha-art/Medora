import { MedicalCondition } from '../types';
import { MEDICAL_SOURCES } from '../sources/sourceRegistry';

export const RURAL_CONDITIONS_TWO: Record<string, MedicalCondition> = {
  ACUTE_VOMITING: {
    id: 'ACUTE_VOMITING',
    names: {
      en: 'Vomiting (Acute Emesis)',
      hi: 'उल्टी (वमन)',
      ta: 'வாந்தி',
      te: 'వాంతులు',
      ml: 'ഛർദ്ദി',
      kn: 'ವಾಂತಿ'
    },
    category: 'gastrointestinal',
    description: {
      en: 'Forceful expulsion of stomach contents via the mouth caused by gastroenteritis, food poisoning, or systemic infections.',
      hi: 'पेट की सामग्री का मुंह के रास्ते बाहर निकलना, जो सामान्यतः गैस्ट्रोएंटेराइटिस, विषाक्त भोजन या संक्रमण के कारण होता है।',
      ta: 'வயிற்றில் உள்ள பொருட்கள் வாய் வழியாக வெளியேறுதல், பொதுவாக உணவு நச்சு அல்லது குடல் தொற்றால் ஏற்படும்.',
      te: 'కడుపులోని పదార్థాలు నోటి ద్వారా బయటకు రావడం, సాధారణంగా ఫుడ్ పాయిజనింగ్ వల్ల జరుగుతుంది.',
      ml: 'വയറ്റിലെ ഭക്ഷണപദാർത്ഥങ്ങൾ വായിലൂടെ പുറന്തള്ളപ്പെടുന്ന അവസ്ഥ.',
      kn: 'ಹೊಟ್ಟೆಯಲ್ಲಿನ ಆಹಾರ ಬಾಯಿಯ ಮೂಲಕ ಹೊರಬರುವುದು, ಸಾಮಾನ್ಯವಾಗಿ ಕಲುಷಿತ ಆಹಾರದಿಂದ ಉಂಟಾಗುತ್ತದೆ.'
    },
    commonSymptoms: ['VOMITING', 'NAUSEA'],
    associatedSymptoms: ['STOMACH_PAIN', 'WEAKNESS', 'DEHYDRATION'],
    warningSigns: [
      {
        en: 'Vomiting blood (coffee-ground emesis), green bile vomiting, accompanied by severe stiff neck or head injury',
        hi: 'उल्टी में खून आना, हरे पित्त की उल्टी, गर्दन में अकड़न या सिर की चोट के बाद उल्टी',
        ta: 'வாந்தியில் ரத்தம் அல்லது பச்சை நிற பித்தம் வருதல், தலைக்காயத்திற்கு பின் வாந்தி',
        te: 'వాంతిలో రక్తం లేదా ఆకుపచ్చని ద్రవం పడటం, తలకు దెబ్బ తగిలిన తర్వాత వాంతులు',
        ml: 'ഛർദ്ദിയിൽ രക്തം കാണുക, തലയ്ക്ക് പരിക്കേറ്റ ശേഷമുള്ള ഛർദ്ദി',
        kn: 'ವಾಂತಿಯಲ್ಲಿ ರಕ್ತ ಅಥವಾ ಹಸಿರು ಪಿತ್ತರಸ, ತಲೆಪೆಟ್ಟು ಬಿದ್ದ ನಂತರ ವಾಂತಿ'
      }
    ],
    riskFactors: [
      {
        en: 'Unrefrigerated leftover food, contaminated water, pregnancy morning sickness, motion sickness',
        hi: 'बासी या खुला भोजन खाना, दूषित पानी, गर्भावस्था की सुबह की कमजोरी',
        ta: 'பழைய கெட்டுப்போன உணவு, பாதுகாப்பற்ற குடிநீர், கர்ப்பகால சோர்வு',
        te: 'పాడైపోయిన ఆహారం, కలుషిత నీరు, గర్భధారణ సమయం',
        ml: 'പഴകിയ ഭക്ഷണം, അശുദ്ധ ജലം, ഗർഭകാലം',
        kn: 'ಹಳಸಿದ ಆಹಾರ, ಕಲುಷಿತ ನೀರು, ಗರ್ಭಾವಸ್ಥೆ'
      }
    ],
    recommendedAssessment: [
      {
        en: 'Assess hydration, examine abdomen for tenderness/rigidity, check pulse and blood pressure',
        hi: 'शरीर में पानी की स्थिति जांचें, पेट दबाकर दर्द देखें, रक्तचाप और नब्ज मापें',
        ta: 'நீர்ச்சத்து அளவை சரிபார்க்கவும், வயிற்றில் வலி உள்ளதா என தொட்டு பார்க்கவும்',
        te: 'డీహైడ్రేషన్ మరియు కడుపు నొప్పి పరీక్షించండి',
        ml: 'നിർജ്ജലീകരണവും വയറുവേദനയും പരിശോധിക്കുക',
        kn: 'ನಿರ್ಜಲೀಕರಣ ಮತ್ತು ಹೊಟ್ಟೆ ನೋವು ಪರಿಶೀಲಿಸಿ'
      }
    ],
    tests: ['ROUTINE_BLOOD_COUNT'],
    supportiveCare: [
      {
        en: 'Rest the stomach for 30 minutes after vomiting. Then begin small sips (1-2 spoonfuls every 5-10 mins) of chilled ORS, coconut water, or rice starch.',
        hi: 'उल्टी के बाद 30 मिनट पेट को आराम दें। फिर हर 5-10 मिनट में 1-2 चम्मच ओआरएस या नारियल पानी घूंट-घूंट दें।',
        ta: 'வாந்தி எடுத்த உடனே அதிக நீர் குடிக்காமல் 30 நிமிடம் ஓய்வளிக்கவும். பின் சிறிது சிறிதாக ஓஆர்எஸ் அல்லது இளநீர் தரவும்.',
        te: 'వాంతి అయిన వెంటనే కాకుండా అరగంట తర్వాత స్పూన్ల కొద్దీ ఓఆర్ఎస్ ఇవ్వండి.',
        ml: 'ഛർദ്ദിച്ച ഉടൻ ധാരാളം വെള്ളം കൊടുക്കരുത്. അരമണിക്കൂറിന് ശേഷം കുറേശ്ശെ ഒആർഎസ് നൽകുക.',
        kn: 'ವಾಂತಿಯಾದ ತಕ್ಷಣ ಹೆಚ್ಚು ನೀರು ಕೊಡಬೇಡಿ. 30 ನಿಮಿಷದ ನಂತರ ಚಮಚದಿಂದ ಸ್ವಲ್ಪ ಸ್ವಲ್ಪವೇ ಓಆರ್‌ಎಸ್ ನೀಡಿ.'
      }
    ],
    treatmentInformation: [
      {
        en: 'Antiemetics (e.g. Ondansetron) should only be taken on medical advice, especially in pregnant women or young children.',
        hi: 'उल्टी की दवा (जैसे ओन्डैनसेट्रॉन) केवल डॉक्टर के पर्चे पर ही लें, विशेषकर गर्भावस्था या बच्चों में।',
        ta: 'வாந்தி மாத்திரைகளை மருத்துவர் ஆலோசனையின்றி சுயமாக உட்கொள்ளக் கூடாது.',
        te: 'డాక్టర్ సలహా లేకుండా వాంతి మందులు వాడవద్దు.',
        ml: 'ഡോക്ടറുടെ നിർദ്ദേശമില്ലാതെ ഛർദ്ദിക്കുള്ള മരുന്നുകൾ കഴിക്കരുത്.',
        kn: 'ವೈದ್ಯರ ಸಲಹೆಯಿಲ್ಲದೆ ವಾಂತಿ ನಿಲ್ಲಿಸುವ ಮಾತ್ರೆಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.'
      }
    ],
    prevention: [
      {
        en: 'Eat freshly prepared warm food, boil drinking water, wash hands before food preparation',
        hi: 'ताजा पका हुआ भोजन करें, उबला पानी पिएं, खाना बनाने से पहले हाथ धोएं',
        ta: 'சூடான புதிய உணவு உட்கொள்ளுதல், காய்ச்சிய குடிநீர்',
        te: 'తాజా ఆహారం, కాచి చల్లార్చిన నీరు తాగడం',
        ml: 'ചൂടുള്ള പുതിയ ഭക്ഷണം കഴിക്കുക, തിളപ്പിച്ചാറിയ വെള്ളം കുടിക്കുക',
        kn: 'ತಾಜಾ ಬಿಸಿ ಆಹಾರ ಸೇವಿಸಿ, ಕುದಿಸಿ ಆರಿಸಿದ ನೀರು ಕುಡಿಯಿರಿ'
      }
    ],
    whenToSeekMedicalCare: [
      {
        en: 'Vomiting lasting >24 hours in adults or >12 hours in children, inability to keep any fluids down',
        hi: 'वयस्कों में 24 घंटे और बच्चों में 12 घंटे से अधिक उल्टी, पानी भी न रुक पाना',
        ta: 'பெரியவர்களில் 24 மணி நேரத்திற்கு மேலும் குழந்தைகளில் 12 மணி நேரத்திற்கு மேலும் நீடித்தல்',
        te: '24 గంటలకు మించి నిరంతరం వాంతులు కావడం',
        ml: '24 മണിക്കൂറിലധികം നീളുന്ന ഛർദ്ദി',
        kn: '24 ಗಂಟೆಗಳಿಗಿಂತ ಹೆಚ್ಚು ಕಾಲ ನಿರಂತರ ವಾಂತಿಯಾಗುವುದು'
      }
    ],
    emergencyCriteria: [
      {
        en: 'Vomiting blood, severe sudden headache, acute rigid painful abdomen (peritonitis), fainting',
        hi: 'उल्टी में खून, अचानक तेज सिरदर्द, पेट में छूने पर भी असहनीय दर्द, बेहोशी',
        ta: 'ரத்த வாந்தி, திடீர் கடுமையான தலைவலி, கடுமையான வயிற்று வலி',
        te: 'రక్తం వాంతి కావడం, తీవ్రమైన తలనొప్పి, కడుపు బిగుసుకుపోవడం',
        ml: 'രക്തം ഛർദ്ദിക്കുക, കടുത്ത തലവേദന, അസഹ്യമായ വയറുവേദന',
        kn: 'ರಕ್ತ ವಾಂತಿ, ತೀವ್ರ ತಲೆನೋವು, ಹೊಟ್ಟೆ ಕಲ್ಲಿನಂತೆ ಬಿಗಿಯಾಗುವುದು'
      }
    ],
    contraindications: [
      {
        en: 'Do NOT give large volumes of fluids at once (triggers immediate vomit reflex). Give small spoonfuls.',
        hi: 'एक साथ ज्यादा पानी न पिलाएं, इससे तुरंत दोबारा उल्टी हो जाती है।',
        ta: 'ஒரே நேரத்தில் அதிக தண்ணீர் குடிக்க தரக்கூடாது.',
        te: 'ఒకేసారి ఎక్కువ నీళ్లు తాగించకూడదు.',
        ml: 'ഒറ്റയടിക്ക് കൂടുതൽ വെള്ളം കുടിക്കാൻ നൽകരുത്.',
        kn: 'ಒಂದೇ ಬಾರಿಗೆ ಹೆಚ್ಚು ನೀರು ಕುಡಿಯಲು ನೀಡಬೇಡಿ.'
      }
    ],
    sourceReferences: [MEDICAL_SOURCES.WHO_DIARRHOEA_ORS],
    lastReviewed: '2026-02-12',
    evidenceLevel: 'LEVEL_A',
    reviewStatus: 'approved'
  },
  HEADACHE: {
    id: 'HEADACHE',
    names: {
      en: 'Tension & General Headache',
      hi: 'सिरदर्द (सामान्य व तनाव जनित)',
      ta: 'தலைவலி',
      te: 'తలనొప్పి',
      ml: 'തലവേദന',
      kn: 'ತಲೆನೋವು'
    },
    category: 'general',
    description: {
      en: 'Common pain in any region of the head, often dull, aching band-like pressure across forehead, frequently triggered by stress, dehydration, lack of sleep, or eye strain.',
      hi: 'सिर में खिंचाव या दबाव जैसा दर्द, जो प्रायः मानसिक तनाव, पानी की कमी, नींद पूरी न होना या आंखों की थकान से होता है।',
      ta: 'நெற்றியைச் சுற்றி ஒரு பட்டை போன்ற அழுத்தம் அல்லது வலி, பொதுவாக தூக்கமின்மை, மன அழுத்தம் அல்லது நீர்ச்சத்து குறைவால் வரும்.',
      te: 'తల చుట్టూ ఒత్తిడి లేదా నొప్పి, నిద్రలేమి, ఒత్తిడి లేదా నీటి కొరత వల్ల వస్తుంది.',
      ml: 'മാനസിക സമ്മർദ്ദം, ഉറക്കക്കുറവ്, നിർജ്ജലീകരണം എന്നിവ കാരണം ഉണ്ടാകുന്ന സാധാരണ തലവേദന.',
      kn: 'ಒತ್ತಡ, ನಿದ್ರಾಹೀನತೆ ಅಥವಾ ನೀರಿನ ಕೊರತೆಯಿಂದ ಹಣೆಯ ಸುತ್ತ ಉಂಟಾಗುವ ತಲೆನೋವು.'
    },
    commonSymptoms: ['HEADACHE', 'FOREHEAD_PRESSURE'],
    associatedSymptoms: ['NECK_STIFFNESS_MILD', 'FATIGUE', 'EYE_STRAIN'],
    warningSigns: [
      {
        en: 'Sudden "thunderclap" worst headache of life, headache with fever and stiff neck, weakness on one side of body, blurry vision',
        hi: 'बिजली गिरने जैसा अचानक सबसे तेज सिरदर्द, बुखार और गर्दन में अकड़न, शरीर के एक हिस्से में कमजोरी, दृष्टि धुंधली होना',
        ta: 'திடீரென மின்னல் போல் தாக்கும் அதீத தலைவலி, காய்ச்சலுடன் கழுத்து விரைப்பு, ஒரு பக்க உடல் பலவீனம்',
        te: 'హఠాత్తుగా తీవ్రమైన తలనొప్పి రావడం, జ్వరంతో పాటు మెడ బిగుతు, ఒకవైపు బలహీనత',
        ml: 'പെട്ടെന്നുണ്ടാകുന്ന അതികഠിനമായ തലവേദന, പനിയോടൊപ്പം കഴുത്ത് അനക്കാൻ പറ്റാത്ത അവസ്ഥ',
        kn: 'ಮಿಂಚಿನಂತೆ ಹಠಾತ್ ಅತಿಯಾದ ತಲೆನೋವು, ಜ್ವರ ಮತ್ತು ಕತ್ತು ಬಿಗಿತ, ಮುಖದ ಒಂದು ಬದಿ ವಕ್ರವಾಗುವುದು'
      }
    ],
    riskFactors: [
      {
        en: 'Working long hours in hot sun without water, untreated vision refractive errors, high blood pressure, emotional stress',
        hi: 'धूप में बिना पानी काम करना, कमजोर नजर का चश्मा न लगाना, उच्च रक्तचाप, अत्यधिक चिंता',
        ta: 'வெயிலில் நீர் அருந்தாமல் வேலை செய்தல், கண் பார்வை குறைபாடு, ரத்த அழுத்தம்',
        te: 'ఎండలో నీళ్లు తాగకుండా పనిచేయడం, కంటి సమస్యలు, అధిక రక్తపోటు',
        ml: 'കഠിന വെയിൽ, കാഴ്ചക്കുറവ്, രക്തസമ്മർദ്ദം',
        kn: 'ಬಿಸಿಲಿನಲ್ಲಿ ಕೆಲಸ, ದೃಷ್ಟಿದೋಷ, ಅಧಿಕ ರಕ್ತದೊತ್ತಡ'
      }
    ],
    recommendedAssessment: [
      {
        en: 'Check blood pressure, test neck flexion (rule out meningitis), inspect hydration, check visual acuity at PHC',
        hi: 'रक्तचाप मापें, गर्दन आगे झुकाकर देखें (मेनिन्जाइटिस जांच), पानी की स्थिति देखें',
        ta: 'ரத்த அழுத்தம் அளவிடவும், கழுத்தை முன்னோக்கி வளைத்து பார்க்கவும்',
        te: 'రక్తపోటు మరియు మెడ కదలికలు పరీక్షించండి',
        ml: 'രക്തസമ്മർദ്ദം പരിശോധിക്കുക, കഴുത്ത് കുനിക്കാൻ സാധിക്കുന്നുണ്ടോ എന്ന് നോക്കുക',
        kn: 'ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಕತ್ತಿನ ಚಲನೆ ಪರೀಕ್ಷಿಸಿ'
      }
    ],
    tests: ['BLOOD_PRESSURE_CHECK'],
    supportiveCare: [
      {
        en: 'Rest in a quiet cool room, drink 2-3 glasses of water, apply cold or warm compress to forehead, gentle neck massage, paracetamol 500mg if needed.',
        hi: 'शांत हवादार कमरे में विश्राम करें, 2-3 गिलास पानी पिएं, माथे पर ठंडी पट्टी रखें, आवश्यकता होने पर पैरासिटामोल लें।',
        ta: 'அமைதியான இருண்ட அறையில் ஓய்வெடுக்கவும், தண்ணீர் குடிக்கவும், நெற்றியில் ஈரத்துணி வைக்கவும்.',
        te: 'ప్రశాంతమైన గదిలో విశ్రాంతి, మంచినీళ్లు తాగడం, తలపై చల్లటి గుడ్డ ఉంచడం.',
        ml: 'ശാന്തമായ മുറിയിൽ വിശ്രമിക്കുക, ധാരാളം വെള്ളം കുടിക്കുക.',
        kn: 'ಶಾಂತವಾದ ಸ್ಥಳದಲ್ಲಿ ವಿಶ್ರಮಿಸಿ, ನೀರು ಕುಡಿಯಿರಿ, ಹಣೆಗೆ ತಣ್ಣನೆಯ ಪಟ್ಟಿ ಇಡಿ.'
      }
    ],
    treatmentInformation: [
      {
        en: 'Frequent recurring headaches require blood pressure check and eye examination to rule out glaucoma, refractive error, or hypertension.',
        hi: 'बार-बार सिरदर्द होने पर बीपी और आंखों की जांच अवश्य कराएं।',
        ta: 'அடிக்கடி தலைவலி வந்தால் ரத்த அழுத்தம் மற்றும் கண் பரிசோதனை அவசியம்.',
        te: 'తరచూ తలనొప్పి వస్తుంటే బీపీ మరియు కంటి పరీక్షలు చేయించుకోవాలి.',
        ml: 'ഇടയ്ക്കിടെ തലവേദന വരുന്നുണ്ടെങ്കിൽ ബിപിയും കാഴ്ചയും പരിശോധിക്കണം.',
        kn: 'ಪದೇ ಪದೇ ತಲೆನೋವು ಬಂದರೆ ಬಿಪಿ ಮತ್ತು ಕಣ್ಣಿನ ತಪಾಸಣೆ ಮಾಡಿಸಿ.'
      }
    ],
    prevention: [
      {
        en: 'Stay well hydrated during agricultural work, maintain regular sleep hours, wear cap in sun',
        hi: 'पर्याप्त पानी पिएं, नियमित समय पर सोएं, धूप में सिर पर गमछा या टोपी पहनें',
        ta: 'போதிய நீர் அருந்துதல், சீரான தூக்கம், வெயிலில் தலைப்பாகை அணிதல்',
        te: 'తగినంత నీరు తాగడం, సరైన నిద్ర, ఎండలో టోపీ పెట్టుకోవడం',
        ml: 'നല്ല ഉറക്കം, ആവശ്യത്തിന് വെള്ളം കുടിക്കുക, വെയിലത്ത് തൊപ്പി വെക്കുക',
        kn: 'ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ, ಸರಿಯಾದ ನಿದ್ರೆ ಮಾಡಿ, ಬಿಸಿಲಿನಲ್ಲಿ ಟೋಪಿ ಧರಿಸಿ'
      }
    ],
    whenToSeekMedicalCare: [
      {
        en: 'Headache awakening from sleep, worsening over weeks, associated with nausea or blurred vision',
        hi: 'नींद से जगा देने वाला सिरदर्द, हफ्तों तक बढ़ता सिरदर्द, उल्टी या धुंधली दृष्टि',
        ta: 'தூக்கத்திலிருந்து எழுப்பும் தலைவலி, வாரக்கணக்கில் அதிகரித்தல், பார்வை மங்குதல்',
        te: 'నిద్రలోంచి లేపే తలనొప్పి, వారాల తరబడి కొనసాగడం',
        ml: 'ഉറക്കത്തിൽ നിന്ന് എഴുന്നേൽക്കാൻ പ്രേരിപ്പിക്കുന്ന തലവേദന',
        kn: 'ನಿದ್ರೆಯಿಂದ ಎಚ್ಚರಗೊಳಿಸುವ ತಲೆನೋವು, ವಾರಗಳ ಕಾಲ ಮುಂದುವರಿಯುವುದು'
      }
    ],
    emergencyCriteria: [
      {
        en: 'Sudden explosive headache, high fever with stiff neck, slurred speech or facial droop (stroke alert)',
        hi: 'अचानक भयंकर सिरदर्द, तेज बुखार के साथ गर्दन अकड़ना, बोलने में लड़खड़ाहट (स्ट्रोक का खतरा)',
        ta: 'திடீர் வெடிக்கும் தலைவலி, கழுத்து விரைப்புடன் காய்ச்சல், பேச்சு குளறுதல் (பக்கவாத எச்சரிக்கை)',
        te: 'హఠాత్తుగా తీవ్ర తలనొప్పి, మెడ బిగుతుతో జ్వరం, మాట ముద్దరావడం',
        ml: 'പെട്ടെന്നുണ്ടാകുന്ന അതികഠിന തലവേദന, കഴുത്തു വേദനയോടൊപ്പം പനി, സംസാരത്തിൽ കുഴച്ചിൽ',
        kn: 'ಹಠಾತ್ ತೀವ್ರ ತಲೆನೋವು, ಕತ್ತು ಬಿಗಿತದೊಂದಿಗೆ ಜ್ವರ, ತೊದಲುವ ಮಾತು (ಪಾರ್ಶ್ವವಾಯು ಎಚ್ಚರಿಕೆ)'
      }
    ],
    contraindications: [
      {
        en: 'Do not take heavy NSAIDs daily for headaches without doctor advice (causes medication overuse rebound headaches).',
        hi: 'बिना डॉक्टर पूछे रोज-रोज पेनकिलर न खाएं (इससे सिरदर्द और बढ़ जाता है)।',
        ta: 'மருத்துவர் இன்றி தினமும் வலி நிவாரணி மாத்திரைகள் உட்கொள்ளாதீர்கள்.',
        te: 'రోజూ పెయిన్ కిల్లర్స్ వాడవద్దు.',
        ml: 'സ്ഥിരമായി വേദനസംഹാരികൾ കഴിക്കരുത്.',
        kn: 'ದಿನನಿತ್ಯ ನೋವು ನಿವಾರಕ ಮಾತ್ರೆಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.'
      }
    ],
    sourceReferences: [MEDICAL_SOURCES.MOHFW_STG_HYPERTENSION],
    lastReviewed: '2026-01-15',
    evidenceLevel: 'LEVEL_B',
    reviewStatus: 'approved'
  },
  MIGRAINE: {
    id: 'MIGRAINE',
    names: {
      en: 'Migraine Headache',
      hi: 'माइग्रेन (आधासीसी का सिरदर्द)',
      ta: 'ஒற்றைத் தலைவலி (மைக்ரேன்)',
      te: 'పార్శ్వపు తలనొప్పి (మైగ్రేన్)',
      ml: 'മൈഗ്രെയ്ൻ (ഒറ്റത്തലവേദന)',
      kn: 'ಮೈಗ್ರೇನ್ (ಒಂದೇ ಬದಿಯ ತಲೆನೋವು)'
    },
    category: 'general',
    description: {
      en: 'Recurrent throbbing or pulsating headache, typically on one side of head, frequently accompanied by sensitivity to light and sound, and nausea.',
      hi: 'सिर के एक हिस्से में तेज टीस मारने जैसा दर्द, जो प्रायः तेज रोशनी व आवाज से बढ़ता है और साथ में जी मिचलाता है।',
      ta: 'தலையின் ஒரு பகுதியில் துடிக்கும் தீவிர வலி, வெளிச்சம் மற்றும் சத்தம் கேட்கும்போது வலி கூடுதல், குமட்டல்.',
      te: 'తల యొక్క ఒకవైపు గుచ్చుతున్నట్లు వచ్చే తీవ్రమైన నొప్పి, వెలుతురు మరియు శబ్దం పడకపోవడం.',
      ml: 'തലയുടെ ഒരു വശത്ത് മാത്രമുണ്ടാകുന്ന തുടിപ്പോടുകൂടിയ കഠിനമായ വേദന, പ്രകാശവും ശബ്ദവും അസ്വസ്ഥതയുണ്ടാക്കുക.',
      kn: 'ತಲೆಯ ಒಂದು ಬದಿಯಲ್ಲಿ ಬಡಿತದಂತೆ ಬರುವ ತೀವ್ರ ನೋವು, ಬೆಳಕು ಮತ್ತು ಶಬ್ದವನ್ನು ಸಹಿಸಲಾಗದಿರುವುದು.'
    },
    commonSymptoms: ['ONE_SIDED_THROBBING_PAIN', 'LIGHT_SENSITIVITY', 'SOUND_SENSITIVITY'],
    associatedSymptoms: ['NAUSEA', 'VISUAL_AURA', 'VOMITING'],
    warningSigns: [
      {
        en: 'Headache accompanied by numbness in arm/face, speech difficulty, onset over age 50',
        hi: 'हाथ या चेहरे का सुन्न होना, बोलने में लड़खड़ाहट, 50 वर्ष की उम्र के बाद पहली बार ऐसा दर्द होना',
        ta: 'கை அல்லது முகம் மரத்துப்போதல், பேச்சு குளறுதல், 50 வயதுக்கு மேல் முதல்முறை வருதல்',
        te: 'చేయి లేదా ముఖం తిమ్మిరి రావడం, మాట తడబడటం, 50 ఏళ్లు దాటాక మొదటిసారి రావడం',
        ml: 'കൈകാലുകൾക്ക് തരിപ്പ്, സംസാരിക്കാൻ ബുദ്ധിമുട്ട്',
        kn: 'ಕೈ ಅಥವಾ ಮುಖ ಮರಗಟ್ಟುವುದು, ತೊದಲುವ ಮಾತು, 50 ವರ್ಷದ ನಂತರ ಮೊದಲ ಬಾರಿ ಬರುವುದು'
      }
    ],
    riskFactors: [
      {
        en: 'Skipping meals, bright midday sunlight, hormonal changes during menstruation, lack of sleep, loud sounds',
        hi: 'समय पर भोजन न करना, तेज धूप, मासिक धर्म के दौरान हॉर्मोनल बदलाव, नींद की कमी',
        ta: 'உணவை தவிர்த்தல், கடும் வெயில், மாதவிடாய் கால மாற்றங்கள், தூக்கமின்மை',
        te: 'సమయానికి తినకపోవడం, ఎండ, నిద్రలేమి',
        ml: 'ഭക്ഷണം ഒഴിവാക്കുക, കഠിന വെയിൽ, ഉറക്കക്കുറവ്',
        kn: 'ಊಟ ತಪ್ಪಿಸುವುದು, ಕಡು ಬಿಸಿಲು, ನಿದ್ರಾಹೀನತೆ'
      }
    ],
    recommendedAssessment: [
      {
        en: 'Assess aura symptoms, frequency of attacks, blood pressure, neurological cranial nerve exam at PHC',
        hi: 'लक्षणों की आवृत्ति पूछें, रक्तचाप और नसों की जांच कराएं',
        ta: 'தலைவலியின் தீவிரத்தை பரிசோதிக்கவும்',
        te: 'రక్తపోటు మరియు లక్షణాల తీవ్రత పరిశీలించండి',
        ml: 'ലക്ഷണങ്ങളുടെ തീവ്രതയും ഇടവേളകളും പരിശോധിക്കുക',
        kn: 'ರೋಗಲಕ್ಷಣಗಳ ತೀವ್ರತೆ ಮತ್ತು ಆವರ್ತನ ತಿಳಿಯಿರಿ'
      }
    ],
    tests: [],
    supportiveCare: [
      {
        en: 'Lie down in a dark quiet room, apply cold pack to forehead or back of neck, stay well hydrated, take early analgesic at onset.',
        hi: 'अंधेरे शांत कमरे में लेटें, माथे पर ठंडी पट्टी लगाएं, भरपूर पानी पिएं।',
        ta: 'இருட்டான அமைதியான அறையில் படுக்கவும், நெற்றியில் குளிர்ந்த ஒத்தடம் கொடுக்கவும்.',
        te: 'చీకటిగా ఉన్న ప్రశాంతమైన గదిలో విశ్రాంతి తీసుకోవడం, చల్లటి పట్టీ వేయడం.',
        ml: 'ഇരുട്ടുള്ള ശാന്തമായ മുറിയിൽ വിശ്രമിക്കുക, നെറ്റിയിൽ തണുത്ത വെള്ളത്തിൽ മുക്കിയ തുണി വെയ്ക്കുക.',
        kn: 'ಕತ್ತಲೆಯಾದ ಪ್ರಶಾಂತ ಕೋಣೆಯಲ್ಲಿ ವಿಶ್ರಮಿಸಿ, ಹಣೆಗೆ ತಣ್ಣನೆಯ ಪಟ್ಟಿ ಇಡಿ.'
      }
    ],
    treatmentInformation: [
      {
        en: 'Frequent attacks (>3-4 per month) benefit from prophylactic medications prescribed by a doctor at CHC/District Hospital.',
        hi: 'महीने में 3-4 बार से ज्यादा दौरे आने पर अस्पताल में रोकथाम की दवा लें।',
        ta: 'மாதத்திற்கு 3 முறைக்கு மேல் வந்தால் தடுப்பு மாத்திரைகள் எடுக்க மருத்துவரை அணுகவும்.',
        te: 'నెలకు 3 కంటే ఎక్కువసార్లు వస్తుంటే వైద్యులను సంప్రదించాలి.',
        ml: 'ഇടയ്ക്കിടെ വരുന്നെങ്കിൽ പ്രതിരോധ മരുന്നുകൾക്കായി ഡോക്ടറെ കാണുക.',
        kn: 'ತಿಂಗಳಿಗೆ 3 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಬಾರಿ ಬಂದರೆ ತಜ್ಞ ವೈದ್ಯರಿಂದ ತಡೆಗಟ್ಟುವ ಔಷಧ ಪಡೆಯಿರಿ.'
      }
    ],
    prevention: [
      {
        en: 'Do not skip breakfast or meals, wear dark sunglasses or broad-brim hat in rural sun, keep regular sleep schedule',
        hi: 'समय पर नाश्ता-खाना खाएं, धूप में टोपी या चश्मा लगाएं, नियमित समय पर सोएं',
        ta: 'நேரத்திற்கு சாப்பிடுதல், வெயிலில் குடை அல்லது தொப்பி அணிதல்',
        te: 'సమయానికి ఆహారం తీసుకోవడం, ఎండలో టోపీ పెట్టుకోవడం',
        ml: 'സമയത്തിന് ഭക്ഷണം കഴിക്കുക, വെയിലത്ത് കുടയോ തൊപ്പിയോ ഉപയോഗിക്കുക',
        kn: 'ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಊಟ ಮಾಡಿ, ಬಿಸಿಲಿನಲ್ಲಿ ಛತ್ರಿ ಅಥವಾ ಟೋಪಿ ಬಳಸಿ'
      }
    ],
    whenToSeekMedicalCare: [
      {
        en: 'Attacks increasing in frequency or severity, pain not relieved by basic paracetamol',
        hi: 'दौरे बार-बार आना या दर्द अधिक गंभीर होना',
        ta: 'வலி மருந்திற்கு கட்டுப்படாமல் அதிகரித்தல்',
        te: 'నొప్పి తగ్గకపోవడం లేదా తరచూ రావడం',
        ml: 'വേദന മരുന്നുകൾക്ക് വഴങ്ങാതിരിക്കുക',
        kn: 'ನೋವು ಶಮನವಾಗದಿರುವುದು ಅಥವಾ ಹೆಚ್ಚಾಗುವುದು'
      }
    ],
    emergencyCriteria: [
      {
        en: 'Headache with sudden weakness in arm/leg, speech difficulty, fever with neck stiffness',
        hi: 'हाथ-पैर में कमजोरी, आवाज लड़खड़ाहट, गर्दन अकड़ना',
        ta: 'கை கால் செயலிழப்பு, பேச்சு குளறுதல், கழுத்து விரைப்பு',
        te: 'చేయి లేదా కాలు పడిపోవడం, మాట ముద్దరావడం',
        ml: 'കൈകാലുകൾക്ക് ബലക്കുറവ്, സംസാരത്തിൽ തടസ്സം',
        kn: 'ಕೈಕಾಲು ಬಲಹೀನತೆ, ತೊದಲುವ ಮಾತು, ಕತ್ತು ಬಿಗಿತ'
      }
    ],
    contraindications: [
      {
        en: 'Avoid overuse of ergotamine or triptans without cardiac clearance in patients with heart disease or hypertension.',
        hi: 'हृदय रोगी या बीपी के मरीज डॉक्टर की सलाह के बिना माइग्रेन की विशेष दवाएं न लें।',
        ta: 'இதய நோயாளிகள் சிறப்பு மைக்ரேன் மாத்திரைகளை சுயமாக எடுக்கக் கூடாது.',
        te: 'గుండె జబ్బులు ఉన్నవారు ప్రత్యేక మైగ్రేన్ మందులను జాగ్రత్తగా వాడాలి.',
        ml: 'ഹൃദ്രോഗികൾ പ്രത്യേക മരുന്നുകൾ ഡോക്ടറുടെ അനുമതിയില്ലാതെ കഴിക്കരുത്.',
        kn: 'ಹೃದ್ರೋಗಿಗಳು ವೈದ್ಯರ ಸಲಹೆಯಿಲ್ಲದೆ ಮೈಗ್ರೇನ್ ಔಷಧ ಸೇವಿಸಬಾರದು.'
      }
    ],
    sourceReferences: [MEDICAL_SOURCES.WHO_ESSENTIAL_MEDS],
    lastReviewed: '2026-01-22',
    evidenceLevel: 'LEVEL_A',
    reviewStatus: 'approved'
  },
  GASTRITIS_ACID_PEPTIC: {
    id: 'GASTRITIS_ACID_PEPTIC',
    names: {
      en: 'Gastritis & Acid Peptic Disease',
      hi: 'गैस, एसिडिटी और पेट में जलन',
      ta: 'அசிடிட்டி, நெஞ்செரிச்சல் மற்றும் வாய்வு',
      te: 'ఎసిడిటీ, గ్యాస్ మరియు కడుపులో మంట',
      ml: 'അസിഡിറ്റി, ഗ്യാസ്, നെഞ്ചെരിച്ചിൽ',
      kn: 'ಅಸಿಡಿಟಿ, ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಮತ್ತು ಹೊಟ್ಟೆ ಉರಿ'
    },
    category: 'gastrointestinal',
    description: {
      en: 'Inflammation of the stomach lining causing burning upper abdominal pain, bloating, belching, and acid reflux into chest (heartburn).',
      hi: 'पेट की भीतरी परत में सूजन जिससे ऊपरी पेट में जलन, खट्टी डकारें, भारीपन और सीने में जलन होती है।',
      ta: 'மேல் வயிற்றில் எரியும் வலி, புளித்த ஏப்பம், நெஞ்செரிச்சல் மற்றும் வாய்வு பிடிப்பு.',
      te: 'కడుపు పైభాగంలో మంట, పుల్లటి తేన్పులు మరియు గుండెల్లో మంట.',
      ml: 'വയറിന്റെ മുകൾഭാഗത്ത് എരിച്ചിൽ, പുളിച്ചുതികട്ടൽ, നെഞ്ചെരിച്ചിൽ.',
      kn: 'ಹೊಟ್ಟೆಯ ಮೇಲ್ಭಾಗದಲ್ಲಿ ಉರಿ, ಹುಳಿ ತೇಗು, ಎದೆ ಉರಿ ಮತ್ತು ಗ್ಯಾಸ್.'
    },
    commonSymptoms: ['BURNING_STOMACH_PAIN', 'HEARTBURN', 'BLOATING'],
    associatedSymptoms: ['ACID_BELCHING', 'NAUSEA', 'LOSS_OF_APPETITE'],
    warningSigns: [
      {
        en: 'Black tarry stools (melena), vomiting blood, unexplained weight loss, persistent pain radiating to back',
        hi: 'काला टार जैसा शौच आना, उल्टी में खून आना, वजन घटना, दर्द का पीठ तक फैलना',
        ta: 'கருப்பு நிறத்தில் மலம் போதல், ரத்த வாந்தி, பசியின்மை, எடை குறைதல்',
        te: 'నల్లటి మలం రావడం, రక్తం వాంతి కావడం, బరువు తగ్గడం',
        ml: 'കറുത്ത നിറത്തിൽ മലം പോവുക, രക്തം ഛർദ്ദിക്കുക, ശരീരഭാരം കുറയുക',
        kn: 'ಕಪ್ಪು ಬಣ್ಣದ ಮಲ ವಿಸರ್ಜನೆ, ರಕ್ತ ವಾಂತಿ, ತೂಕ ಇಳಿಕೆ, ಬೆನ್ನಿಗೆ ಹರಡುವ ನೋವು'
      }
    ],
    riskFactors: [
      {
        en: 'Frequent use of painkiller tablets (Brufen, Diclofenac), irregular eating timings, heavy tea/coffee, chewing tobacco or alcohol',
        hi: 'दर्द निवारक गोलियों का अत्यधिक सेवन, असमय भोजन, अधिक चाय/कॉफी, तंबाकू या शराब का सेवन',
        ta: 'அடிக்கடி வலி மாத்திரைகள் உட்கொள்ளுதல், நேரம் தவறி உண்ணுதல், அதிக டீ/காபி, புகையிலை',
        te: 'పెయిన్ కిల్లర్ మందులు ఎక్కువగా వాడటం, సరైన సమయానికి తినకపోవడం, టీ/కాఫీ అధికంగా తాగడం',
        ml: 'വേദനസംഹാരികളുടെ അമിതോപയോഗം, ക്രമം തെറ്റിയ ഭക്ഷണം, ചായ/കാപ്പി, പുകയില',
        kn: 'ನೋವು ನಿವಾರಕ ಮಾತ್ರೆಗಳ ಅತಿಯಾದ ಬಳಕೆ, ಅಸಮಯ ಊಟ, ಹೆಚ್ಚು ಚಹಾ/ಕಾಫಿ, ತಂಬಾಕು'
      }
    ],
    recommendedAssessment: [
      {
        en: 'Check history of NSAID painkiller intake, palpate epigastrium, check hemoglobin for silent ulcer bleed',
        hi: 'पेनकिलर गोलियों का इतिहास पूछें, ऊपरी पेट दबाकर देखें, हीमोग्लोबिन जांचें',
        ta: 'வலி மாத்திரைகள் உட்கொண்ட விவரம் கேட்கவும், ரத்த சோகை உள்ளதா என பார்க்கவும்',
        te: 'పెయిన్ కిల్లర్స్ వాడిన వివరాలు, రక్తహీనత పరీక్షించండి',
        ml: 'വേദനസംഹാരികൾ ഉപയോഗിച്ചിട്ടുണ്ടോ എന്ന് ചോദിക്കുക, രക്തപരിശോധന നടത്തുക',
        kn: 'ನೋವು ನಿವಾರಕ ಮಾತ್ರೆಗಳ ವಿವರ, ಹಿಮೋಗ್ಲೋಬಿನ್ ತಪಾಸಣೆ ಮಾಡಿ'
      }
    ],
    tests: ['HEMOGLOBIN_COUNT'],
    supportiveCare: [
      {
        en: 'Eat small frequent meals at regular times, drink cold milk or buttermilk, avoid spicy/fried foods and late night dinners, elevate head of bed slightly.',
        hi: 'नियमित समय पर हल्का भोजन करें, ठंडी छाछ या दूध पिएं, अधिक मिर्च-मसाले से बचें, सोने से 2 घंटे पहले भोजन करें।',
        ta: 'நேரத்திற்கு எளிதில் செரிக்கும் உணவு, மோர் அருந்துதல், காரமான உணவுகளை தவிர்த்தல்.',
        te: 'సమయానికి కొద్ది కొద్దిగా తినడం, మజ్జిగ తాగడం, కారమైన ఆహారం తగ్గించడం.',
        ml: 'സമയത്തിന് ഭക്ഷണം കഴിക്കുക, സംഭാരം കുടിക്കുക, എരിവും എണ്ണയും കുറയ്ക്കുക.',
        kn: 'ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಊಟ, ಮಜ್ಜಿಗೆ ಕುಡಿಯಿರಿ, ಅತಿಯಾದ ಖಾರ-ಎಣ್ಣೆ ಪದಾರ್ಥ ತ್ಯಜಿಸಿ.'
      }
    ],
    treatmentInformation: [
      {
        en: 'Short-term Antacid syrup or Pantoprazole 40mg taken 30 minutes before morning meal. Stop offending NSAID painkillers immediately.',
        hi: 'सुबह खाली पेट पैंटोप्राजोल (40mg) 30 मिनट पहले लें। पेनकिलर दवाओं का सेवन तुरंत बंद करें।',
        ta: 'காலை உணவுக்கு 30 நிமிடம் முன் அசிடிட்டி மாத்திரை எடுக்கவும். வலி மாத்திரைகளை உடனடியாக நிறுத்தவும்.',
        te: 'ఉదయం పరగడుపున పాంటోప్రజోల్ తీసుకోవడం. పెయిన్ కిల్లర్స్ వెంటనే ఆపేయాలి.',
        ml: 'രാവിലെ ഭക്ഷണത്തിന് മുൻപ് ആസിഡ് കുറയ്ക്കാനുള്ള മരുന്ന് കഴിക്കുക. വേദനസംഹാരികൾ നിർത്തുക.',
        kn: 'ಬೆಳಿಗ್ಗೆ ಉಪಾಹಾರಕ್ಕೆ 30 ನಿಮಿಷ ಮುಂಚೆ ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಮಾತ್ರೆ ಸೇವಿಸಿ. ನೋವು ನಿವಾರಕ ಮಾತ್ರೆ ನಿಲ್ಲಿಸಿ.'
      }
    ],
    prevention: [
      {
        en: 'Never take painkillers on empty stomach, avoid tobacco chewing, do not lie down immediately after dinner',
        hi: 'खाली पेट दर्द निवारक गोलियां कभी न खाएं, तंबाकू छोड़ें, खाने के तुरंत बाद न लेटें',
        ta: 'வெறும் வயிற்றில் வலி மாத்திரைகள் எடுக்காதீர்கள், சாப்பிட்ட உடனே படுக்க வேண்டாம்',
        te: 'పరగడుపున పెయిన్ కిల్లర్స్ వేసుకోకూడదు, తిన్న వెంటనే పడుకోకూడదు',
        ml: 'വെറുംവയറ്റിൽ വേദനസംഹാരികൾ കഴിക്കരുത്, പുകയില ഒഴിവാക്കുക',
        kn: 'ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ನೋವು ಮಾತ್ರೆ ತಿನ್ನಬೇಡಿ, ಊಟವಾದ ತಕ್ಷಣ ಮಲಗಬೇಡಿ'
      }
    ],
    whenToSeekMedicalCare: [
      {
        en: 'Pain persisting >2 weeks despite antacids, difficulty swallowing, early fullness',
        hi: '2 सप्ताह बाद भी पेट दर्द ठीक न होना, निगलने में तकलीफ',
        ta: '2 வாரங்களுக்கு மேல் நீடிக்கும் வலி, விழுங்குவதில் சிரமம்',
        te: '2 వారాలు దాటినా నొప్పి తగ్గకపోవడం',
        ml: '2 ആഴ്ച കഴിഞ്ഞിട്ടും കുറയാത്ത വയറുവേദന',
        kn: '2 ವಾರಗಳ ನಂತರವೂ ನೋವು ಉಪಶಮನವಾಗದಿರುವುದು'
      }
    ],
    emergencyCriteria: [
      {
        en: 'Vomiting frank blood or dark coffee-brown fluid, passing black tarry stools (bleeding ulcer), sudden severe "knife-like" abdominal rigidity (perforation)',
        hi: 'खून की उल्टी, काला तारकोल जैसा शौच, पेट में चाकू जैसा तेज असहनीय दर्द व पेट पत्थर जैसा कड़ा होना (अल्सर फटना)',
        ta: 'ரத்த வாந்தி, கருப்பு மலம், தாங்கமுடியாத வயிற்று வலி மற்றும் வயிறு பாறை போல் இறுகுதல்',
        te: 'రక్తం వాంతి, నల్లటి మలం, కడుపు రాయిలా బిగుసుకుపోయి విపరీతమైన నొప్పి (అల్సర్ పగలడం)',
        ml: 'രക്തം ഛർദ്ദിക്കുക, കറുത്ത മലം, അസഹ്യമായ കഠിന വയറുവേദന',
        kn: 'ರಕ್ತ ವಾಂತಿ, ಕಪ್ಪು ಮಲ, ಹೊಟ್ಟೆ ಕಲ್ಲಿನಂತಾಗಿ ಚೂರಿ ಇರಿದಂತಹ ವಿಪರೀತ ನೋವು'
      }
    ],
    contraindications: [
      {
        en: 'Do NOT take Diclofenac, Ibuprofen, or Aspirin for stomach burning (will aggravate ulceration and risk stomach perforation).',
        hi: 'पेट दर्द या जलन में डिक्लोफेनाक, ब्रूफेन या एस्पिरिन कभी न लें (अल्सर फटने का खतरा)।',
        ta: 'வயிற்று எரிச்சலுக்கு புரூஃபென், டைக்ளோஃபெனாக் போன்ற வலி மாத்திரைகளை எடுக்காதீர்கள்.',
        te: 'కడుపు మంటకు పెయిన్ కిల్లర్స్ వేసుకోకూడదు.',
        ml: 'വയറെരിച്ചിലിന് ഐബുപ്രൊഫൻ, ഡൈക്ലോഫെനാക് തുടങ്ങിയ വേദനസംഹാരികൾ കഴിക്കരുത്.',
        kn: 'ಹೊಟ್ಟೆ ನೋವಿಗೆ ಡೈಕ್ಲೋಫೆನಾಕ್ ಅಥವಾ ಐಬುಪ್ರೊಫೇನ್ ಮಾತ್ರೆ ನುಂಗಬೇಡಿ.'
      }
    ],
    sourceReferences: [MEDICAL_SOURCES.WHO_ESSENTIAL_MEDS],
    lastReviewed: '2026-02-05',
    evidenceLevel: 'LEVEL_A',
    reviewStatus: 'approved'
  },
  URINARY_TRACT_INFECTION: {
    id: 'URINARY_TRACT_INFECTION',
    names: {
      en: 'Urinary Tract Infection (UTI)',
      hi: 'मूत्र मार्ग में संक्रमण (यूटीआई)',
      ta: 'சிறுநீர்ப் பாதை தொற்று (யூடிஐ)',
      te: 'యూరినరీ ఇన్ఫెక్షన్ (యూటీఐ)',
      ml: 'മൂത്രാശയ അണുബാധ (യുടിഐ)',
      kn: 'ಮೂತ್ರನಾಳದ ಸೋಂಕು (ಯುಟಿಐ)'
    },
    category: 'infectious',
    description: {
      en: 'Infection in the urinary system (bladder or kidneys) causing painful burning urination, frequent urge to urinate, and lower pelvic pain.',
      hi: 'मूत्र मार्ग या मूत्राशय में बैक्टीरिया का संक्रमण, जिससे पेशाब में जलन, बार-बार पेशाब की इच्छा और पेडू में दर्द होता है।',
      ta: 'சிறுநீர் கழிக்கும்போது எரிச்சல் வலி, அடிக்கடி சிறுநீர் கழிக்கும் உணர்வு மற்றும் அடிவயிற்று வலி.',
      te: 'మూత్ర విసర్జన సమయంలో మంట, తరచూ మూత్రానికి వెళ్లాల్సి రావడం, పొత్తికడుపు నొప్పి.',
      ml: 'മൂത്രമൊഴിക്കുമ്പോൾ എരിച്ചിൽ, അടിക്കടി മൂത്രമൊഴിക്കാൻ തോന്നുക, അടിവയറ്റിൽ വേദന.',
      kn: 'ಮೂತ್ರ ವಿಸರ್ಜನೆಯಲ್ಲಿ ಉರಿ, ಪದೇ ಪದೇ ಮೂತ್ರಕ್ಕೆ ಹೋಗುವುದು, ಹೊಟ್ಟೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ನೋವು.'
    },
    commonSymptoms: ['BURNING_URINATION', 'FREQUENT_URINATION', 'LOWER_PELVIC_PAIN'],
    associatedSymptoms: ['CLOUDY_URINE', 'STRONG_SMELLING_URINE', 'FEVER_MILD'],
    warningSigns: [
      {
        en: 'High fever with severe shaking chills, flank/back kidney pain, nausea/vomiting, UTI during pregnancy',
        hi: 'तेज बुखार के साथ कंपकंपी, पीठ के निचले हिस्से (गुर्दे) में तेज दर्द, उल्टी, गर्भावस्था में पेशाब में जलन',
        ta: 'நடுக்கத்துடன் கூடிய அதிக காய்ச்சல், முதுகு அல்லது இடுப்பு வலி, வாந்தி, கர்ப்ப காலத்தில் யூடிஐ',
        te: 'చలితో కూడిన అధిక జ్వరం, నడుము/మూత్రపిండాల నొప్పి, గర్భధారణలో ఇన్ఫెక్షన్',
        ml: 'വിറയലോടുകൂടിയ ഉയർന്ന പനി, പുറംവേദന, ഗർഭകാലത്തെ അണുബാധ',
        kn: 'ನಡುಕದೊಂದಿಗೆ ತೀವ್ರ ಜ್ವರ, ಬೆನ್ನು/ಮೂತ್ರಪಿಂಡ ನೋವು, ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ಮೂತ್ರದ ಸೋಂಕು'
      }
    ],
    riskFactors: [
      {
        en: 'Inadequate daily drinking water, holding urine for long hours during farm labor, pregnancy, poor sanitation, diabetes',
        hi: 'खेतों में काम के समय कम पानी पीना, लंबे समय तक पेशाब रोकना, गर्भावस्था, स्वच्छता की कमी, शुगर',
        ta: 'குறைவாக நீர் அருந்துதல், சிறுநீரை அடக்கி வைத்தல், கர்ப்பம், நீரிழிவு நோய்',
        te: 'తక్కువ నీరు తాగడం, మూత్రాన్ని ఆపుకోవడం, గర్భధారణ, మధుమేహం',
        ml: 'വെള്ളം കുറച്ചു കുടിക്കുക, മൂത്രം പിടിച്ച് നിർത്തുക, പ്രമേഹം',
        kn: 'ಕಡಿಮೆ ನೀರು ಕುಡಿಯುವುದು, ಮೂತ್ರ ತಡೆಹಿಡಿಯುವುದು, ಗರ್ಭಾವಸ್ಥೆ, ಸಕ್ಕರೆ ಕಾಯಿಲೆ'
      }
    ],
    recommendedAssessment: [
      {
        en: 'Test urine routine and microscopy (for pus cells >5/HPF), check temperature, palpate suprapubic and costovertebral angle',
        hi: 'पेशाब की जांच (मवाद कोशिकाएं), तापमान और पीठ के दर्द की जांच',
        ta: 'சிறுநீர் பரிசோதனை (சீழ் அணுக்கள்), வெப்பநிலை சரிபார்த்தல்',
        te: 'యూరిన్ రొటీన్ పరీక్ష, జ్వరం పరీక్షించండి',
        ml: 'മൂത്രപരിശോധന നടത്തുക, പനി പരിശോധിക്കുക',
        kn: 'ಮೂತ್ರ ಪರೀಕ್ಷೆ, ತಾಪಮಾನ ಪರಿಶೀಲಿಸಿ'
      }
    ],
    tests: ['URINE_ROUTINE_MICROSCOPY'],
    supportiveCare: [
      {
        en: 'Drink 3-4 litres of boiled clean water daily to flush bacteria, drink barley water or tender coconut water, do not hold urine.',
        hi: 'दिन में 3-4 लीटर साफ उबला पानी पिएं ताकि बैक्टीरिया बाहर निकल सकें। नारियल पानी या जौ का पानी पिएं।',
        ta: 'தினமும் 3-4 லிட்டர் தண்ணீர் குடிக்கவும். பார்லி கஞ்சி அல்லது இளநீர் அருந்தவும், சிறுநீரை அடக்க வேண்டாம்.',
        te: 'రోజూ 3-4 లీటర్ల నీరు తాగడం, కొబ్బరి నీళ్లు, మూత్రం ఆపుకోకపోవడం.',
        ml: 'ധാരാളം വെള്ളം കുടിക്കുക, കരിക്കിൻ വെള്ളം കഴിക്കുക, മൂത്രം പിടിച്ചു വെക്കരുത്.',
        kn: 'ದಿನಕ್ಕೆ 3-4 ಲೀಟರ್ ನೀರು ಕುಡಿಯಿರಿ, ಎಳನೀರು ಅಥವಾ ಬಾರ್ಲಿ ನೀರು ಸೇವಿಸಿ, ಮೂತ್ರ ತಡೆಯಬೇಡಿ.'
      }
    ],
    treatmentInformation: [
      {
        en: 'Requires a doctor-prescribed course of antibiotics (e.g., Nitrofurantoin or Cotrimoxazole) based on urine test. Complete full 5-7 day course.',
        hi: 'डॉक्टर की सलाह से 5-7 दिन का एंटीबायोटिक कोर्स पूरा करें। बीच में दवा न छोड़ें।',
        ta: 'மருத்துவர் பரிந்துரைத்த ஆன்டிபயாடிக் மாத்திரைகளை 5-7 நாட்கள் முழுமையாக உட்கொள்ளவும்.',
        te: 'డాక్టర్ సూచించిన కోర్సును పూర్తిగా వాడాలి.',
        ml: 'ഡോക്ടർ നിർദ്ദേശിച്ച ആന്റിബയോട്ടിക് കോഴ്സ് പൂർത്തിയാക്കുക.',
        kn: 'ವೈದ್ಯರು ಸೂಚಿಸಿದ ಆ್ಯಂಟಿಬಯೋಟಿಕ್ ಕೋರ್ಸ್ ಪೂರ್ಣಗೊಳಿಸಿ.'
      }
    ],
    prevention: [
      {
        en: 'Drink abundant water throughout the day, maintain toilet hygiene (wipe front to back), urinate promptly after intercourse',
        hi: 'दिनभर खूब पानी पिएं, शौच के बाद आगे से पीछे की ओर सफाई रखें, पेशाब न रोकें',
        ta: 'நிறைய தண்ணீர் குடிக்கவும், கழிவறை சுகாதாரம் பேணவும்',
        te: 'తగినంత నీరు తాగడం, పరిశుభ్రత పాటించడం',
        ml: 'നല്ലതുപോലെ വെള്ളം കുടിക്കുക, ശുചിത്വം പാലിക്കുക',
        kn: 'ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ, ನೈರ್ಮಲ್ಯ ಕಾಪಾಡಿಕೊಳ್ಳಿ'
      }
    ],
    whenToSeekMedicalCare: [
      {
        en: 'Urinary symptoms in pregnancy (high risk of preterm labor), symptoms lasting >3 days, blood in urine',
        hi: 'गर्भावस्था में पेशाब में जलन (समय पूर्व प्रसव का खतरा), पेशाब में खून',
        ta: 'கர்ப்ப காலத்தில் சிறுநீர் எரிச்சல், சிறுநீரில் ரத்தம்',
        te: 'గర్భధారణ సమయంలో యూటీఐ, మూత్రంలో రక్తం పడటం',
        ml: 'ഗർഭകാലത്തെ മൂത്രത്തിലെ അണുബാധ, മൂത്രത്തിൽ രക്തം',
        kn: 'ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ಯುಟಿಐ, ಮೂತ್ರದಲ್ಲಿ ರಕ್ತ ಬರುವುದು'
      }
    ],
    emergencyCriteria: [
      {
        en: 'High fever with severe kidney pain (pyelonephritis), confusion, low blood pressure (urosepsis)',
        hi: 'तेज बुखार, पीठ में असहनीय दर्द, बेहोशी जैसी स्थिति (गुर्दे का गंभीर संक्रमण)',
        ta: 'நடுக்கத்துடன் கூடிய காய்ச்சல், சிறுநீரகத்தில் தீவிர வலி, மயக்கம் (யூரோசெப்சிஸ்)',
        te: 'తీవ్ర జ్వరం మరియు మూత్రపిండాల నొప్పి (పైలోనెఫ్రైటిస్)',
        ml: 'കടുത്ത പനി, വൃക്ക വേദന, രക്തസമ്മർദ്ദം കുറയുക',
        kn: 'ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಮೂತ್ರಪಿಂಡದ ಅತಿಯಾದ ನೋವು, ಕಡಿಮೆ ಬಿಪಿ'
      }
    ],
    contraindications: [
      {
        en: 'Never ignore burning urination during pregnancy. Asymptomatic bacteriuria requires mandatory screening and treatment under PMSMA.',
        hi: 'गर्भावस्था में पेशाब में जलन को कभी नजरअंदाज न करें। तुरंत एएनएम या डॉक्टर को दिखाएं।',
        ta: 'கர்ப்ப காலத்தில் சிறுநீர் எரிச்சலை அலட்சியப்படுத்தக் கூடாது.',
        te: 'గర్భధారణలో మూత్ర సమస్యలను నిర్లಕ್ಷ్యం చేయకూడదు.',
        ml: 'ഗർഭകാലത്ത് മൂത്രത്തിലെ അണുബാധ നിസ്സാരമായി കാണരുത്.',
        kn: 'ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ಮೂತ್ರದ ಉರಿಯನ್ನು ನಿರ್ಲಕ್ಷಿಸಬೇಡಿ.'
      }
    ],
    sourceReferences: [MEDICAL_SOURCES.MOHFW_MATERNAL_CARE],
    lastReviewed: '2026-02-10',
    evidenceLevel: 'LEVEL_A',
    reviewStatus: 'approved'
  },
  ANEMIA_IRON_DEFICIENCY: {
    id: 'ANEMIA_IRON_DEFICIENCY',
    names: {
      en: 'Anaemia (Iron Deficiency)',
      hi: 'एनीमिया (रक्तहीनता / खून की कमी)',
      ta: 'ரத்த சோகை (அனீமியா)',
      te: 'రక్తహీనత (ఎనీమియా)',
      ml: 'വിളർച്ച (അനീമിയ)',
      kn: 'ರಕ್ತಹೀನತೆ (ಅನಿಮಿಯಾ)'
    },
    category: 'chronic',
    description: {
      en: 'A condition where blood lacks sufficient healthy red blood cells or hemoglobin (Hb <12 g/dL in women, <11 g/dL in pregnancy, <13 g/dL in men), leading to fatigue and poor oxygen delivery.',
      hi: 'खून में हीमोग्लोबिन की कमी, जिससे शरीर के अंगों तक पर्याप्त ऑक्सीजन नहीं पहुंचती और अत्यधिक थकान होती है।',
      ta: 'ரத்தத்தில் ஹீமோகுளோபின் அளவு குறைந்து உடல் சோர்வு மற்றும் மூச்சுத்திணறல் ஏற்படும் நிலை.',
      te: 'రక్తంలో హిమోగ్లోబిన్ శాతం తగ్గడం వల్ల తీవ్రమైన నీరసం మరియు అలసట రావడం.',
      ml: 'രക്തത്തിൽ ഹീമോഗ്ലോബിന്റെ അളവ് കുറയുന്ന അവസ്ഥ, കടുത്ത ക്ഷീണം അനുഭവപ്പെടുന്നു.',
      kn: 'ರಕ್ತದಲ್ಲಿ ಹಿಮೋಗ್ಲೋಬಿನ್ ಕೊರತೆಯಿಂದ ವಿಪರೀತ ನಿಶ್ಯಕ್ತಿ ಮತ್ತು ಆಯಾಸ ಉಂಟಾಗುವ ಸ್ಥಿತಿ.'
    },
    commonSymptoms: ['EXTREME_FATIGUE', 'PALE_SKIN_PALMS', 'BREATHLESSNESS_ON_EXERTION'],
    associatedSymptoms: ['DIZZINESS', 'BRITTLE_NAILS', 'HEADACHE', 'COLD_HANDS_FEET'],
    warningSigns: [
      {
        en: 'Severe breathlessness at rest, chest pain, swelling of feet/ankles, hemoglobin below 7 g/dL (Severe Anaemia)',
        hi: 'बैठे-बैठे सांस फूलना, सीने में दर्द, पैरों में सूजन, हीमोग्लोबिन 7 g/dL से कम होना (गंभीर एनीमिया)',
        ta: 'ஓய்வாக இருக்கும்போதும் மூச்சுத்திணறல், கால்களில் வீக்கம், ஹீமோகுளோபின் 7 g/dLக்கு கீழ் குறைதல்',
        te: 'విశ్రాంతిలోనూ శ్వాస ఆడకపోవడం, కాళ్ల వాపు, హిమోగ్లోబిన్ 7 కంటే తగ్గడం',
        ml: 'വിശ്രമിക്കുമ്പോഴും ശ്വാസതടസ്സം, കാലുകളിൽ നീര്, ഹീമോഗ്ലോബിൻ 7 ൽ താഴെയാവുക',
        kn: 'ವಿಶ್ರಾಂತಿಯಲ್ಲೂ ಉಸಿರಾಟದ ತೊಂದರೆ, ಕಾಲುಗಳಲ್ಲಿ ಊತ, ಹಿಮೋಗ್ಲೋಬಿನ್ 7 ಕ್ಕಿಂತ ಕಡಿಮೆ'
      }
    ],
    riskFactors: [
      {
        en: 'Frequent pregnancies, heavy menstrual bleeding, hookworm intestinal infection, poor intake of green leafy vegetables and jaggery',
        hi: 'कम अंतराल में बार-बार प्रसव, भारी मासिक स्राव, पेट में कीड़े (हुकवर्म), हरी पत्तेदार सब्जियों की कमी',
        ta: 'அடிக்கடி பிரசவம், அதிக மாதவிடாய் ரத்தப்போக்கு, குடல் புழுக்கள், இரும்புச்சத்து பற்றாக்குறை',
        te: 'తరచూ కాన్పులు, అధిక ఋతుస్రావం, నులిపురుగులు, పోషకాహార లోపం',
        ml: 'കൂടിയ ഇടവേളകളില്ലാത്ത പ്രസവം, വിരബാധ, ഇലക്കറികളുടെ കുറവ്',
        kn: 'ಅಂತರವಿಲ್ಲದ ಹೆರಿಗೆ, ಅತಿಯಾದ ಮುಟ್ಟು, ಜಂತುಹುಳು ಬಾಧೆ, ಸೊಪ್ಪಿನ ಕೊರತೆ'
      }
    ],
    recommendedAssessment: [
      {
        en: 'Hemoglobin test (digital hemoglobinometer / Sahli method at Sub-Centre/PHC), inspect conjunctiva, tongue, and nail beds for pallor',
        hi: 'हीमोग्लोबिन जांच कराएं, आंख की निचली पलक, जीभ और नाखूनों का पीलापन देखें',
        ta: 'ஹீமோகுளோபின் அளவிடவும், கண்கள் மற்றும் நாக்கின் வெளிறிய நிறத்தை சோதிக்கவும்',
        te: 'హిమోగ్లోబిన్ పరీక్ష, కళ్లు ಮತ್ತು ನಾಲಿಕೆ ಪರಿಶೀಲಿಸಿ',
        ml: 'ഹീമോഗ്ലോബിൻ അളവ് പരിശോധിക്കുക, കണ്ണിന്റെ താഴത്തെ പോള പരിശോധിക്കുക',
        kn: 'ಹಿಮೋಗ್ಲೋಬಿನ್ ಪರೀಕ್ಷೆ, ಕಣ್ಣು ಮತ್ತು ನಾಲಿಗೆಯ ಬಿಳಿಚಿಕೊಳ್ಳುವಿಕೆ ಪರೀಕ್ಷಿಸಿ'
      }
    ],
    tests: ['HEMOGLOBIN_ESTIMATION', 'PERIPHERAL_BLOOD_SMEAR'],
    supportiveCare: [
      {
        en: 'Eat locally available iron-rich foods: drumstick leaves (moringa), palak, jaggery, sprouted Bengal gram (chana), ragi, guava, amla. Bi-annual deworming with Albendazole.',
        hi: 'आयरन युक्त आहार लें: सहजन (मुनगा) की पत्तियां, पालक, गुड़, चना, रागी, आंवला। हर 6 महीने में पेट के कीड़े की गोली (एल्बेंडाजोल) खाएं।',
        ta: 'முருங்கைக்கீரை, பசலைக்கீரை, வெல்லம், முளைகட்டிய பயறு, கேழ்வரகு, நெல்லிக்காய். 6 மாதத்திற்கு ஒருமுறை பூச்சி மாத்திரை உட்கொள்ளவும்.',
        te: 'మునగాకు, పాలకూర, బెల్లం, మొలకెత్తిన గింజలు, రాగులు, ఉసిరి. నులిపురుగుల నివారణ మాత్రలు.',
        ml: 'മുരിങ്ങയില, ചീര, ശർക്കര, ചെറുപയർ, റാഗി, നെല്ലിക്ക. വിരഗുളിക കഴിക്കുക.',
        kn: 'ನುಗ್ಗೆಸೊಪ್ಪು, ಪಾಲಕ್, ಬೆಲ್ಲ, ಮೊಳಕೆ ಕಾಳು, ರಾಗಿ, ನೆಲ್ಲಿಕಾಯಿ ಸೇವಿಸಿ. ಜಂತುಹುಳು ನಿವಾರಣಾ ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ.'
      }
    ],
    treatmentInformation: [
      {
        en: 'Iron and Folic Acid (IFA) tablets as per Anemia Mukt Bharat (100mg elemental iron + 500mcg folic acid daily for 100 days). Do not take with tea or milk.',
        hi: 'एनीमिया मुक्त भारत के तहत आईएफए की लाल गोली रोजाना रात को पानी या नींबू पानी से लें। चाय या दूध के साथ न लें।',
        ta: 'அனீமியா முக்த் பாரத் திட்டத்தின் கீழ் இலவச இரும்புச்சத்து மாத்திரையை தினசரி இரவு எலுமிச்சை சாறுடன் எடுத்துக்கொள்ளவும்.',
        te: 'రోజువారీ ఐరన్ ఫోలిక్ యాసిడ్ మాత్రలు వాడాలి. టీ లేదా పాలతో తీసుకోకూడದು.',
        ml: 'ഐഎഫ്എ ഗുളികകൾ ദിവസവും രാത്രി കഴിക്കുക. ചായയോടൊപ്പമോ പാലോടൊപ്പമോ കഴിക്കരുത്.',
        kn: 'ಅನಿಮಿಯಾ ಮುಕ್ತ ಭಾರತ ಅಡಿಯಲ್ಲಿ ಐಎಫ್‌ಎ ಮಾತ್ರೆಗಳನ್ನು ನಿತ್ಯ ಸೇವಿಸಿ. ಚಹಾ ಅಥವಾ ಹಾಲಿನೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.'
      }
    ],
    prevention: [
      {
        en: 'Wear slippers to prevent hookworm penetration, cook in iron pans, consume vitamin C (citrus/amla) with meals to boost iron absorption',
        hi: 'खेतों में जूते/चप्पल पहनें ताकि हुकवर्म न लगे, लोहे की कड़ाही में खाना बनाएं, आंवला खाएं',
        ta: 'செருப்பு அணிந்து செல்லுதல், இரும்பு வாணலியில் சமைத்தல், நெல்லிக்காய் உண்ணுதல்',
        te: 'చెప్పులు ధరించడం, ఇనుప పాత్రల్లో వంట చేయడం, విటమిన్ ಸಿ తీసుకోవడం',
        ml: 'ചെരുപ്പ് ഉപയോഗിക്കുക, ഇരുമ്പ് പാത്രങ്ങളിൽ പാകം ചെയ്യുക, വിറ്റാമിൻ സി കഴിക്കുക',
        kn: 'ಚಪ್ಪಲಿ ಧರಿಸಿ, ಕಬ್ಬಿಣದ ಬಾಣಲೆಯಲ್ಲಿ ಅಡುಗೆ ಮಾಡಿ, ಸಿಟ್ರಸ್ ಹಣ್ಣುಗಳನ್ನು ಸೇವಿಸಿ'
      }
    ],
    whenToSeekMedicalCare: [
      {
        en: 'Hemoglobin not rising after 1 month of oral iron, severe paleness in pregnant woman',
        hi: '1 माह दवा के बाद भी हीमोग्लोबिन न बढ़ना, गर्भवती महिला में अत्यधिक पीलापन',
        ta: '1 மாதம் மருந்து எடுத்தும் ஹீமோகுளோபின் கூடாமை, கர்ப்பிணிக்கு வெளிறிய நிலை',
        te: 'నెల రోజుల పాటు మందులు వాడినా రక్తం పెరగకపోవడం',
        ml: 'ഒരു മാസത്തെ ഗുളികയ്ക്ക് ശേഷവും വിളർച്ച കുറയാതിരിക്കുക',
        kn: 'ಒಂದು ತಿಂಗಳ ಔಷಧಿಯ ನಂತರವೂ ರಕ್ತ ಹೆಚ್ಚಾಗದಿರುವುದು'
      }
    ],
    emergencyCriteria: [
      {
        en: 'Hb <7 g/dL in 3rd trimester pregnancy, heart failure signs (severe breathlessness, ankle edema, gallop pulse)',
        hi: 'गर्भावस्था में हीमोग्लोबिन 7 से कम होना, अत्यधिक सांस फूलना और पैरों में भारी सूजन',
        ta: 'கர்ப்ப காலத்தில் ஹீமோகுளோபின் 7 g/dLக்கு கீழ் குறைதல், கடுமையான மூச்சுத்திணறல்',
        te: 'గర్భధారణలో హిమోగ్లోబిన్ 7 కంటే తగ్గడం, గుండె సమస్యలు',
        ml: 'ഗർഭാവസ്ഥയിൽ ഹീമോഗ്ലോബിൻ 7ൽ താഴെയാവുക, ശ്വാസംമുട്ടൽ',
        kn: 'ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ಹಿಮೋಗ್ಲೋಬಿನ್ 7 ಕ್ಕಿಂತ ಕಡಿಮೆ ಇರುವುದು, ತೀವ್ರ ಉಸಿರಾಟದ ತೊಂದರೆ'
      }
    ],
    contraindications: [
      {
        en: 'Do not take iron supplements simultaneously with antacids, calcium tablets, tea, or coffee (chelates and blocks iron absorption). Space by at least 2 hours.',
        hi: 'आयरन की गोली को कभी चाय, कॉफी, दूध या कैल्शियम की गोली के साथ न लें (कम से कम 2 घंटे का अंतर रखें)।',
        ta: 'இரும்பு மாத்திரையை டீ, காபி அல்லது கால்சியம் மாத்திரையுடன் சேர்த்து எடுக்கக்கூடாது (குறைந்தது 2 மணி நேர இடைவெளி தேவை).',
        te: 'ఐరన్ మాత్రలను టీ, కాఫీ లేదా క్యాల్షియం తో కలిపి తీసుకోకూడదు.',
        ml: 'ഇരുമ്പ് ഗുളികകൾ ചായ, കാപ്പി, കാൽസ്യം എന്നിവയോടൊപ്പം കഴിക്കരുത്.',
        kn: 'ಕಬ್ಬಿಣದ ಮಾತ್ರೆಯನ್ನು ಚಹಾ, ಕಾಫಿ ಅಥವಾ ಕ್ಯಾಲ್ಸಿಯಂ ಮಾತ್ರೆಯೊಂದಿಗೆ ಒಟ್ಟಿಗೆ ಸೇವಿಸಬೇಡಿ.'
      }
    ],
    sourceReferences: [MEDICAL_SOURCES.MOHFW_MATERNAL_CARE],
    lastReviewed: '2026-02-08',
    evidenceLevel: 'LEVEL_A',
    reviewStatus: 'approved'
  },
  BURNS_SUPERFICIAL: {
    id: 'BURNS_SUPERFICIAL',
    names: {
      en: 'Burns & Scalds',
      hi: 'जलना और झुलसना (बर्न्स)',
      ta: 'தீக்காயம் மற்றும் சுடுநீர் காயம்',
      te: 'కాలిన గాయాలు',
      ml: 'പൊള്ളൽ',
      kn: 'ಸುಟ್ಟ ಗಾಯಗಳು'
    },
    category: 'emergency',
    description: {
      en: 'Thermal, electrical, or chemical tissue injury to skin layers. Immediate first aid drastically reduces blistering, deep tissue death, and infection.',
      hi: 'आग, गर्म पानी या रासायनिक पदार्थों से त्वचा का जलना। तत्काल प्राथमिक उपचार घाव को गहरा होने से रोकता है।',
      ta: 'நெருப்பு, சுடுநீர் அல்லது வேதிப்பொருட்களால் தோலில் ஏற்படும் காயம். உடனடி முதலுதவி அவசியமானது.',
      te: 'నిప్పు, వేడినీళ్లు లేదా రసాయనాల వల్ల చర్మం కాలడం.',
      ml: 'തീ, തിളച്ച വെള്ളം എന്നിവ തട്ടി ചർമ്മത്തിനുണ്ടാകുന്ന ക്ഷതം.',
      kn: 'ಬೆಂಕಿ, ಬಿಸಿನೀರು ಅಥವಾ ರಾಸಾಯನಿಕಗಳಿಂದ ಚರ್ಮ ಸುಡುವುದು.'
    },
    commonSymptoms: ['BURNING_PAIN', 'REDNESS', 'BLISTERING'],
    associatedSymptoms: ['PEELING_SKIN', 'SWELLING', 'SHOCK_IN_SEVERE'],
    warningSigns: [
      {
        en: 'Burns larger than person’s palm, burns on face, hands, feet, groin, or major joint; circumferential burns',
        hi: 'हथेली के आकार से बड़ा जला हुआ भाग, चेहरे, हाथ, पैर, कमर या जोड़ों पर जलना',
        ta: 'உள்ளங்கையை விட பெரிய தீக்காயம், முகம், கை, கால்களில் ஏற்படும் காயம்',
        te: 'అరచేయి కంటే పెద్దగా కాలిన గాయం, ముఖం, చేతులు, కాళ్లపై కాలడం',
        ml: 'കൈപ്പത്തിയേക്കാൾ വലിയ പൊള്ളൽ, മുഖം, കൈകാലുകൾ എന്നിവിടങ്ങളിലെ പൊള്ളൽ',
        kn: 'ಅಂಗೈಗಿಂತ ದೊಡ್ಡ ಸುಟ್ಟ ಗಾಯ, ಮುಖ, ಕೈಕಾಲುಗಳ ಮೇಲಿನ ಗಾಯ'
      }
    ],
    riskFactors: [
      {
        en: 'Open floor cooking fires, loose synthetic clothing near stoves, fireworks, boiling water kept within reach of crawling infants',
        hi: 'जमीन पर खुला चूल्हा, सिंथेटिक कपड़े पहनकर खाना पकाना, फर्श पर उबलता पानी रखना',
        ta: 'தரை அடுப்பு, எளிதில் தீப்பற்றும் ஆடைகள், குழந்தைகள் எட்டும் தூரத்தில் சுடுநீர் வைத்தல்',
        te: 'నేల పొయ్యి, పిల్లలకు అందుబాటులో వేడినీళ్లు ఉంచడం',
        ml: 'തുറന്ന അടുപ്പുകൾ, സിന്തറ്റിക് വസ്ത്രങ്ങൾ, കുട്ടികൾക്ക് എത്തുന്ന വിധം തിളച്ചവെള്ളം വെയ്ക്കുക',
        kn: 'ತೆರೆದ ಒಲೆ, ಸಿಂಥೆಟಿಕ್ ಬಟ್ಟೆ ಧರಿಸಿ ಅಡುಗೆ ಮಾಡುವುದು, ಬಿಸಿನೀರನ್ನು ಕೆಳಗೆ ಇಡುವುದು'
      }
    ],
    recommendedAssessment: [
      {
        en: 'Estimate total body surface area (Rule of Nines), assess depth (1st degree red, 2nd degree blister, 3rd degree charred white/black), inspect airway if smoke inhaled',
        hi: 'जले हुए क्षेत्रफल (प्रतिशत) का आकलन करें, फफोलों और त्वचा की गहराई देखें, धुआं सूंघने पर सांस की नली जांचें',
        ta: 'தீக்காயத்தின் அளவையும் தீவிரத்தையும் மதிப்பிடுதல்',
        te: 'కాలిన వైశాల్యం మరియు తీవ్రతను అంచనా వేయడం',
        ml: 'പൊള്ളലിന്റെ വ്യാപ്തിയും ആഴവും കണക്കാക്കുക',
        kn: 'ಸುಟ್ಟ ಗಾಯದ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಆಳವನ್ನು ಅಂದಾಜಿಸಿ'
      }
    ],
    tests: [],
    supportiveCare: [
      {
        en: 'IMMEDIATELY cool under gentle running cold tap water for 15-20 minutes. Do NOT use ice. Cover loosely with clean, lint-free plastic wrap or clean dry cloth. Keep patient warm.',
        hi: 'तुरंत 15-20 मिनट तक बहते ठंडे नल के पानी से धोएं। बर्फ बिल्कुल न लगाएं। साफ पॉलीथीन या साफ सूखे कपड़े से ढीला ढकें।',
        ta: 'உடனடியாக 15-20 நிமிடங்கள் குளிர்ந்த ஓடும் குழாய் நீரில் காட்டவும். பனிக்கட்டி வைக்கக் கூடாது. சுத்தமான துணியால் லேசாக மூடவும்.',
        te: 'వెంటనే 15-20 నిమిషాలు చల్లటి కుళాయి నీటి కింద ఉంచండి. మంచుగడ్డ పెట్టకూడదు.',
        ml: 'ഉടൻ തന്നെ 15-20 മിനിറ്റ് തണുത്ത പൈപ്പ് വെള്ളം ഒഴിക്കുക. ഐസ് വെയ്ക്കരുത്.',
        kn: 'ತಕ್ಷಣ 15-20 ನಿಮಿಷಗಳ ಕಾಲ ಹರಿಯುವ ತಣ್ಣೀರಿನ ಅಡಿಯಲ್ಲಿ ಗಾಯವನ್ನು ಹಿಡಿಯಿರಿ. ಐಸ್ ಇಡಬೇಡಿ. ಸ್ವಚ್ಛ ಬಟ್ಟೆಯಿಂದ ಮುಚ್ಚಿ.'
      }
    ],
    treatmentInformation: [
      {
        en: 'For minor superficial burns, Silver Sulfadiazine cream and oral paracetamol for pain. Severe burns require hospital admission for fluid resuscitation (Parkland formula).',
        hi: 'मामूली जलने पर सिल्वर सल्फाडायजीन मरहम लगाएं। गंभीर जलने पर तुरंत अस्पताल में भर्ती कराएं।',
        ta: 'லேசான காயத்திற்கு சில்வர் சல்ஃபாடயாசின் களிம்பு. தீவிர தீக்காயத்திற்கு உடனடி மருத்துவமனை அனுமதி தேவை.',
        te: 'చిన్న గాయాలకు సిల్వర్ సల్ఫాడయాజిన్ క్రీమ్ పూయవచ్చు.',
        ml: 'ചെറിയ പൊള്ളലുകൾക്ക് സിൽവർ ക്രീം പുരട്ടാം. ഗുരുതരമെങ്കിൽ ആശുപത്രിയിലെത്തിക്കുക.',
        kn: 'ಚಿಕ್ಕ ಗಾಯಗಳಿಗೆ ಸಿಲ್ವರ್ ಕ್ರೀಮ್ ಹಚ್ಚಿ. ಗಂಭೀರವಾಗಿದ್ದರೆ ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಸೇರಿಸಿ.'
      }
    ],
    prevention: [
      {
        en: 'Keep kerosene lamps away from curtains, keep hot water pots elevated, avoid synthetic sarees near kitchen fire',
        hi: 'मिट्टी के तेल का दीया दूर रखें, गर्म पानी बर्तनों को ऊंचाई पर रखें, किचन में सूती कपड़े पहनें',
        ta: 'அடுப்படியில் பருத்தி ஆடை அணிதல், சுடுநீர் பாத்திரங்களை எட்டாத இடத்தில் வைத்தல்',
        te: 'వంటగదిలో కాటన్ బట్టలు ధరించడం, వేడినీళ్లు దూరంగా ఉంచడం',
        ml: 'അടുക്കളയിൽ കോട്ടൺ വസ്ത്രങ്ങൾ ധരിക്കുക, ചൂടുവെള്ളം ഉയരത്തിൽ വെയ്ക്കുക',
        kn: 'ಅಡುಗೆ ಮಾಡುವಾಗ ಕಾಟನ್ ಬಟ್ಟೆ ಧರಿಸಿ, ಬಿಸಿನೀರಿನ ಪಾತ್ರೆಗಳನ್ನು ಎತ್ತರದಲ್ಲಿಡಿ'
      }
    ],
    whenToSeekMedicalCare: [
      {
        en: 'Any burn developing pus, foul smell, increasing redness after 48 hours, or blistering on joint',
        hi: 'घाव में मवाद पड़ना, बदबू आना, सूजन बढ़ना',
        ta: 'காயத்தில் சீழ் பிடித்தல், துர்நாற்றம் வீசுதல்',
        te: 'గాయంలో చీము పట్టడం, దుర్వాసన రావడం',
        ml: 'പഴുപ്പ്, ദുർഗന്ധം ഉണ്ടാവുക',
        kn: 'ಗಾಯದಲ್ಲಿ ಕೀವು ಬರುವುದು, ದುರ್ವಾಸನೆ'
      }
    ],
    emergencyCriteria: [
      {
        en: 'Burns covering >10% of body surface area, burns involving the face, neck, or respiratory airway (soot around nostrils), electrical high-voltage shock burns',
        hi: 'शरीर का 10% से अधिक हिस्सा जलना, चेहरे या गर्दन पर जलना, सांस की नली का जलना (नाक में कालिख), बिजली का झटका लगना',
        ta: 'உடலில் 10%க்கு மேல் தீக்காயம், முகம் மற்றும் மூச்சுப் பாதையில் காயம், மின்சாரம் தாக்கிய காயம்',
        te: 'శరీరంలో 10% కంటే ఎక్కువ కాలడం, ముఖంపై కాలడం, కరెంట్ షాక్ గాయాలు',
        ml: 'ശരീരത്തിന്റെ 10% ത്തിൽ കൂടുതൽ പൊള്ളുക, മുഖത്തും കഴുത്തിലും പൊള്ളൽ',
        kn: 'ದೇಹದ 10% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಭಾಗ ಸುಡುವುದು, ಮುಖ ಮತ್ತು ಕುತ್ತಿಗೆ ಸುಡುವುದು, ವಿದ್ಯುತ್ ಆಘಾತ'
      }
    ],
    contraindications: [
      {
        en: 'NEVER apply toothpaste, turmeric, cow dung, mud, butter, or engine oil to burns. NEVER burst blisters (breaks protective infection barrier).',
        hi: 'जले हुए स्थान पर टूथपेस्ट, हल्दी, गोबर, मक्खन या तेल कभी न लगाएं। फफोलों को कभी न फोड़ें।',
        ta: 'தீக்காயத்தில் டூத்பேஸ்ட், மஞ்சள், சாணம், எண்ணெய் எதையும் தடவக் கூடாது. கொப்புளங்களை உடைக்கக் கூடாது.',
        te: 'కాలిన చోట టూత్‌పేస్ట్, పసుపు, పేడ, నూనె రాయకూడదు. బొబ్బలను పగలగొట్టకూడదు.',
        ml: 'പൊള്ളലിൽ പേസ്റ്റ്, ചാണകം, മഞ്ഞൾ, എണ്ണ എന്നിവ പുരട്ടരുത്. കുമിളകൾ പൊട്ടിക്കരുത്.',
        kn: 'ಸುಟ್ಟ ಗಾಯದ ಮೇಲೆ ಟೂತ್‌ಪೇಸ್ಟ್, ಹಸುವಿನ ಸಗಣಿ, ಅರಿಶಿನ, ಎಣ್ಣೆ ಹಚ್ಚಬೇಡಿ. ಗುಳ್ಳೆಗಳನ್ನು ಒಡೆಯಬೇಡಿ.'
      }
    ],
    sourceReferences: [MEDICAL_SOURCES.MOHFW_STG_TRAUMA],
    lastReviewed: '2026-01-20',
    evidenceLevel: 'LEVEL_A',
    reviewStatus: 'approved'
  }
};

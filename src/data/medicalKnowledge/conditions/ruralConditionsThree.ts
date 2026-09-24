import { MedicalCondition } from '../types';
import { MEDICAL_SOURCES } from '../sources/sourceRegistry';

export const RURAL_CONDITIONS_THREE: Record<string, MedicalCondition> = {
  SNAKE_BITE: {
    id: 'SNAKE_BITE',
    names: {
      en: 'Snakebite Envenoming',
      hi: 'सांप का काटना (सर्पदंश)',
      ta: 'பாம்புக் கடி நச்சு',
      te: 'పాము కాటు',
      ml: 'പാമ്പ് കടി',
      kn: 'ಹಾವಿನ ಕಡಿತ (ಸರ್ಪದಂಶ)'
    },
    category: 'emergency',
    description: {
      en: 'Life-threatening medical emergency caused by venom injection from venomous snakes (Russell’s Viper, Saw-scaled Viper, Cobra, Krait - the Big Four).',
      hi: 'जहरीले सांपों (वाइपर, कोबरा, करैत) के डसने से होने वाली जानलेवा आपातकालीन स्थिति। तुरंत अस्पताल में एंटी-वेनम की जरूरत होती है।',
      ta: 'நச்சுப் பாம்புகள் (கண்ணாடி விரியன், சுருட்டை விரியன், நல்ல பாம்பு, கட்டு விரியன்) கடிப்பதால் ஏற்படும் உயிராபத்தான அவசர நிலை.',
      te: 'విషపూరిత పాముల కాటు వల్ల కలిగే ప్రాణాంతక పరిస్థితి. తక్షణ యాంటీ-స్నేక్ వెనమ్ అవసరం.',
      ml: 'വിഷപ്പാമ്പുകളുടെ കടിയേൽക്കുന്നത് വഴിയുണ്ടാകുന്ന അതീവ ഗുരുതരമായ അവസ്ഥ. ഉടനടി ആന്റിവെനം വേണം.',
      kn: 'ವಿಷಪೂರಿತ ಹಾವುಗಳ ಕಡಿತದಿಂದ ಉಂಟಾಗುವ ಮಾರಣಾಂತಿಕ ತುರ್ತು ಸ್ಥಿತಿ. ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಎಎಸ್ವಿ ಅಗತ್ಯ.'
    },
    commonSymptoms: ['FANG_PUNCTURE_MARKS', 'RAPID_LOCAL_SWELLING', 'BURNING_PAIN'],
    associatedSymptoms: ['BLEEDING_FROM_GUMS', 'DROOPING_EYELIDS', 'DIFFICULTY_BREATHING', 'NAUSEA'],
    warningSigns: [
      {
        en: 'Bleeding from bite site, gums, or urine (viper); drooping eyelids, slurred speech, breathlessness (cobra/krait); dark brown urine',
        hi: 'घाव या मसूड़ों से खून आना, पेशाब में खून (वाइपर); पलकों का गिरना, बोलने व सांस में रुकावट (करैत/कोबरा); गहरे भूरे रंग का पेशाब',
        ta: 'கடிபட்ட இடம் அல்லது ஈறுகளில் ரத்தம் வடிதல், கண் இமைகள் சோர்ந்து விழுதல், பேச மற்றும் சுவாசிக்க சிரமம்',
        te: 'గాయం లేదా చిగుళ్ల నుంచి రక్తం కారడం, కనురెప్పలు వాలిపోవడం, శ్వాస ఆడకపోవడం',
        ml: 'കടിയേറ്റ ഭാഗത്തുനിന്നോ മോണയിൽ നിന്നോ രക്തം വരിക, കൺപോളകൾ അടഞ്ഞുപോവുക, ശ്വാസതടസ്സം',
        kn: 'ಗಾಯದಿಂದ ಅಥವಾ ಒಸಡುಗಳಿಂದ ರಕ್ತಸ್ರಾವ, ಕಣ್ಣುರೆಪ್ಪೆ ತೂಕವಾಗುವುದು, ಉಸಿರಾಟದ ತೊಂದರೆ'
      }
    ],
    riskFactors: [
      {
        en: 'Walking barefoot in grass or crop fields at night without torch, sleeping on floor, reaching into firewood or dark crevices',
        hi: 'खेतों में बिना जूते व बिना टॉर्च चलना, जमीन पर सोना, लकड़ी के ढेर में हाथ डालना',
        ta: 'இரவில் டார்ச் மற்றும் காலணி இன்றி வயலில் நடத்தல், தரையில் படுத்தல், விறகு குவியலில் கை வைத்தல்',
        te: 'రాత్రిపూట టార్చ్ లేకుండా చెప్పులు లేకుండా నడవడం, నేలపై పడుకోవడం',
        ml: 'രാത്രിയിൽ വെളിച്ചമില്ലാതെ നടക്കുക, നിലത്ത് കിടന്നുറങ്ങുക',
        kn: 'ರಾತ್ರಿ ಬೆಳಕಿಲ್ಲದೆ ಬರಿಗಾಲಿನಲ್ಲಿ ಹೊಲದಲ್ಲಿ ನಡೆಯುವುದು, ನೆಲದ ಮೇಲೆ ಮಲಗುವುದು'
      }
    ],
    recommendedAssessment: [
      {
        en: 'Perform 20-minute Whole Blood Clotting Test (20WBCT) in glass tube at PHC, assess ptosis, neurological cranial reflexes, check respiratory effort',
        hi: 'अस्पताल में 20 मिनट का खून जमने का टेस्ट (20WBCT) करें, पलकों का गिरना और सांस की गति जांचें',
        ta: '20 நிமிட ரத்தம் உறைதல் பரிசோதனை (20WBCT) மேற்கொள்ளுதல், சுவாசத்தை கவனித்தல்',
        te: '20WBCT రక్త పరీక్ష చేయడం, శ్వాసను నిరంతరం పర్యవేక్షించడం',
        ml: '20 മിനിറ്റ് രക്തം കട്ടപിടിക്കുന്ന പരിശോധന (20WBCT) നടത്തുക',
        kn: '20 ನಿಮಿಷದ ರಕ್ತ ಹೆಪ್ಪುಗಟ್ಟುವಿಕೆ ಪರೀಕ್ಷೆ (20WBCT) ನಡೆಸಿ'
      }
    ],
    tests: ['WHOLE_BLOOD_CLOTTING_TEST_20WBCT', 'PROTHROMBIN_TIME'],
    supportiveCare: [
      {
        en: 'Reassure patient (fear and panic raise heart rate and venom spread). Immobilize bitten limb with a splint or sling BELOW heart level. Remove tight bangles/rings. Transport immediately to hospital with Anti-Snake Venom (ASV).',
        hi: 'मरीज को शांत रखें (घबराहट से जहर तेजी से फैलता है)। कटे हुए अंग को लकड़ी की खपच्ची से दिल के स्तर से नीचे स्थिर रखें। तुरंत अस्पताल ले जाएं।',
        ta: 'நோயாளியை பதற்றமடையாமல் தேற்றவும். கடித்த கையை அல்லது காலை அசையாமல் இதயத்திற்கு கீழே வைக்கவும். உடனே மருத்துவமனைக்கு கொண்டு செல்லவும்.',
        te: 'రోగిని భయపడకుండా ధైర్యం చెప్పండి. అవయవాన్ని కదలకుండా గుండె కంటే కింద ఉంచండి. వెంటనే ఆసుపత్రికి తరలించండి.',
        ml: 'രോഗിയെ ശാന്തനാക്കുക. കടിയേറ്റ ഭാഗം ഹൃദയത്തിന് താഴെയായി അനക്കാതെ വെയ്ക്കുക. ഉടനടി ആശുപത്രിയിലെത്തിക്കുക.',
        kn: 'ರೋಗಿಯನ್ನು ಸಮಾಧಾನಪಡಿಸಿ. ಕಚ್ಚಿದ ಭಾಗವನ್ನು ಹೃದಯಕ್ಕಿಂತ ಕೆಳಗೆ ಇರಿಸಿ ಅಲ್ಲಾಡಿಸಬೇಡಿ. ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಸಾಗಿಸಿ.'
      }
    ],
    treatmentInformation: [
      {
        en: 'Only Polyvalent Anti-Snake Venom (ASV) neutralizes venom. ASV is provided free in Government PHCs and District Hospitals. Administered strictly under doctor supervision with resuscitation kit ready.',
        hi: 'केवल पॉलीवैलेंट एंटी-स्नेक वेनम (ASV) ही जहर का एकमात्र इलाज है। यह सरकारी अस्पतालों में मुफ्त उपलब्ध है।',
        ta: 'அரசு மருத்துவமனைகளில் இலவசமாக கிடைக்கும் பாலிவேலண்ட் ஏஎஸ்வி (ASV) விஷமுறிவு மருந்து மட்டுமே உயிரைக் காக்கும்.',
        te: 'కేవలం ప్రభుత్వ ఆసుపత్రుల్లో ఉచితంగా లభించే యాంటీ-స్నేక్ వెనమ్ (ASV) మాత్రమే విషాన్ని విరుగుడు చేస్తుంది.',
        ml: 'സർക്കാർ ആശുപത്രികളിൽ സൗജന്യമായി ലഭിക്കുന്ന പോളിവാലന്റ് ആന്റിവെനം (ASV) മാത്രമാണ് ഇതിനുള്ള മരുന്ന്.',
        kn: 'ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಉಚಿತವಾಗಿ ದೊರೆಯುವ ಎಎಸ್ವಿ (ASV) ಮಾತ್ರವೇ ವಿಷವನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸುತ್ತದೆ.'
      }
    ],
    prevention: [
      {
        en: 'Always carry a torch/flashlight at night in fields, wear knee-high gumboots in tall grass, sleep on elevated cots with mosquito nets tucked under mattress, keep home surroundings free of rubble and rats',
        hi: 'रात में हमेशा टॉर्च साथ रखें, खेतों में रबर के ऊंचे जूते पहनें, खाट पर मच्छरदानी लगाकर सोएं, घर के पास चूहे व ईंट-पत्थर न जमने दें',
        ta: 'இரவில் எப்போதும் டார்ச் விளக்குடன் செல்லவும், ரப்பர் காலணி அணியவும், கட்டிலில் கொசுவலை கட்டி படுக்கவும்',
        te: 'రాత్రిపూట టార్చ్ లైట్ ఉపయోగించడం, పొడవాటి బూట్లు ధరించడం, మంచంపై పడుకోవడం',
        ml: 'രാത്രിയിൽ ടോർച്ച് കരുതുക, ബൂട്ടുകൾ ധരിക്കുക, കട്ടിലിൽ കൊതുകുവല ഉപയോഗിക്കുക',
        kn: 'ರಾತ್ರಿ ಟಾರ್ಚ್ ಕಡ್ಡಾಯವಾಗಿ ಬಳಸಿ, ಗಮ್ ಬೂಟುಗಳನ್ನು ಧರಿಸಿ, ಮಂಚದ ಮೇಲೆ ಮಲಗಿ'
      }
    ],
    whenToSeekMedicalCare: [
      {
        en: 'ANY suspected or confirmed snake bite requires immediate emergency hospital evaluation. Never wait for symptoms to develop.',
        hi: 'सांप काटने का कोई भी संदेह होने पर बिना 1 मिनट गंवाए तुरंत अस्पताल पहुंचे। लक्षणों का इंतजार न करें।',
        ta: 'பாம்பு கடித்ததாக சந்தேகம் இருந்தாலே உடனடியாக மருத்துவமனைக்கு செல்ல வேண்டும். அறிகுறிகளுக்காக காத்திருக்கக் கூடாது.',
        te: 'పాము కాటు అనుమానం ఉన్నా వెంటనే ఆసుపత్రికి వెళ్లాలి. ఆలస్యం చేయవద్దు.',
        ml: 'പാമ്പ് കടിച്ചതായി സംശയമുണ്ടെങ്കിൽ പോലും ഉടൻ ആശുപത്രിയിലെത്തുക.',
        kn: 'ಹಾವು ಕಚ್ಚಿದ ಯಾವುದೇ ಸಂಶಯವಿದ್ದರೂ ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಧಾವಿಸಿ.'
      }
    ],
    emergencyCriteria: [
      {
        en: 'Local swelling spreading past wrist or ankle within 2 hours, spontaneous systemic bleeding, ptosis (heavy eyelids), breathing difficulty, shock',
        hi: 'काटे हुए अंग की सूजन 2 घंटे में तेजी से ऊपर फैलना, मसूड़ों से खून, पलकें न खुल पाना, सांस रुकना',
        ta: 'வீக்கம் விரைவாக பரவுதல், ரத்தக்கசிவு, கண் இமைகள் மூடுதல், மூச்சுத் திணறல்',
        te: 'వాపు వేగంగా పైకి పాకడం, రక్తస్రావం, కనురెప్పలు వాలిపోవడం, శ్వాసలో తీవ్ర ఇబ్బంది',
        ml: 'നീർക്കെട്ട് വേഗത്തിൽ വ്യാപിക്കുക, രക്തസ്രാവം, കൺപോളകൾ അടഞ്ഞുപോവുക',
        kn: 'ಊತ ವೇಗವಾಗಿ ಮೇಲೇರುವುದು, ಒಸಡುಗಳಿಂದ ರಕ್ತ, ಉಸಿರಾಟದ ವೈಫಲ್ಯ'
      }
    ],
    contraindications: [
      {
        en: 'NEVER cut the wound with razor, NEVER suck venom with mouth, NEVER tie tight rope tourniquets (causes limb gangrene), NEVER give alcohol or herbal paste, NEVER delay for snake charmer/faith healer.',
        hi: 'घाव पर ब्लेड या चीरा कभी न लगाएं, मुंह से जहर न चूसें, रस्सी या तार कसकर न बांधें (अंग गलने का खतरा), तांत्रिक या झाड़-फूंक में समय बर्बाद न करें।',
        ta: 'பிளேடால் கீறக் கூடாது, வாயால் உறிஞ்சக் கூடாது, கயிறு இறுக்கி கட்டக் கூடாது (கை கால் அழுகிவிடும்), மந்திரிப்பதில் நேரத்தை வீணடிக்காதீர்கள்.',
        te: 'బ్లేడుతో కోయకూడదు, నోటితో విషం పీల్చకూడదు, గట్టిగా తాడు కట్టకూడదు (అవయవం కుళ్ళిపోతుంది), నాటు వైద్యంలో సమయం వృధా చేయకూడదు.',
        ml: 'മുറിവുണ്ടാക്കരുത്, വായകൊണ്ട് രക്തം വലിച്ചെടുക്കരുത്, കയർ കൊണ്ട് മുറുക്കിക്കെട്ടരുത്, വ്യാജചികിത്സകർക്ക് പിന്നാലെ പോവരുത്.',
        kn: 'ಬ್ಲೇಡ್‌ನಿಂದ ಕೊಯ್ಯಬೇಡಿ, ಬಾಯಿಂದ ಹೀswitchಬೇಡಿ, ಹಗ್ಗದಿಂದ ಬಿಗಿಯಾಗಿ ಕಟ್ಟಬೇಡಿ, ನಾಟಿ ವೈದ್ಯರ ಬಳಿ ಸಮಯ ವ್ಯರ್ಥ ಮಾಡಬೇಡಿ.'
      }
    ],
    sourceReferences: [MEDICAL_SOURCES.MOHFW_STG_SNAKEBITE],
    lastReviewed: '2026-02-10',
    evidenceLevel: 'LEVEL_A',
    reviewStatus: 'approved'
  },
  HEAT_ILLNESS: {
    id: 'HEAT_ILLNESS',
    names: {
      en: 'Heat Exhaustion & Heatstroke',
      hi: 'लू लगना और अत्यधिक गर्मी से बेहोशी',
      ta: 'வெப்பத் தாக்கம் மற்றும் சூடு பிடித்தல்',
      te: 'వడదెబ్బ (హీట్ స్ట్రోక్)',
      ml: 'സൂര്യാഘാതം (ഹീറ്റ് സ്ട്രോക്ക്)',
      kn: 'ಬಿಸಿಲು ಹೊಡೆತ (ಲೂ ತಗುಲುವುದು)'
    },
    category: 'emergency',
    description: {
      en: 'Spectrum from heat cramps to life-threatening heatstroke (core temperature >40°C / 104°F) with central nervous system dysfunction caused by prolonged physical exertion in high rural summer heat.',
      hi: 'गर्मियों में तेज धूप में काम करने से शरीर का तापमान 104°F से अधिक पहुंच जाना और दिमाग पर असर होना (लू लगना)।',
      ta: 'கடும் வெயிலில் உழைப்பதால் உடல் வெப்பநிலை 104°Fக்கு மேல் உயர்ந்து சுயநினைவு இழக்கும் நிலை.',
      te: 'తీవ్రమైన ఎండలో పనిచేయడం వల్ల శరీర ఉష్ణోగ్రత 104°F దాటి ప్రాణాపాయం కలగడం.',
      ml: 'കഠിനമായ വെയിൽ കാരണം ശരീര താപനില 104°F ന് മുകളിലായി അബോധാവസ്ഥയിലാകുന്ന അവസ്ഥ.',
      kn: 'ಕಡು ಬಿಸಿಲಿನಲ್ಲಿ ದುಡಿಯುವುದರಿಂದ ದೇಹದ ಉಷ್ಣತೆ 104°F ಮೀರಿ ಪ್ರಜ್ಞೆ ತಪ್ಪುವ ಸ್ಥಿತಿ.'
    },
    commonSymptoms: ['HIGH_BODY_TEMPERATURE', 'EXTREME_WEAKNESS', 'DIZZINESS_CONFUSION'],
    associatedSymptoms: ['HOT_DRY_SKIN', 'PULSING_HEADACHE', 'NAUSEA', 'FAINTING'],
    warningSigns: [
      {
        en: 'Body temperature >104°F, cessation of sweating (hot dry skin), delirium, seizures, loss of consciousness (Heatstroke)',
        hi: 'तापमान 104°F से अधिक, पसीना आना बंद होना (त्वचा सूखी व गर्म), बहकी-बहकी बातें करना, दौरे, बेहोशी (हीटस्ट्रोक)',
        ta: 'உடல் வெப்பநிலை 104°Fக்கு மேல் செல்லுதல், வியர்வை நின்ற உலர்ந்த தோல், வலிப்பு, சுயநினைவிழப்பு',
        te: 'ఉష్ణోగ్రత 104°F దాటడం, చెమటలు పట్టకపోవడం, పిచ్చిగా మాట్లాడటం, మూర్ఛలు',
        ml: 'താപനില 104°F ന് മുകളിലാവുക, വിയർപ്പ് നിലയ്ക്കുക, അപസ്മാരം, ബോധക്ഷയം',
        kn: 'ತಾಪಮಾನ 104°F ಮೀರಿದರೆ, ಬೆವರು ನಿಲ್ಲುವುದು, ಅಸಂಬದ್ಧ ಮಾತು, ಪ್ರಜ್ಞಾಹೀನತೆ'
      }
    ],
    riskFactors: [
      {
        en: 'Agricultural farm labor during peak hours (11 AM - 4 PM) in April-June heatwaves, elderly workers, lack of hydration, dehydration',
        hi: 'अप्रैल-जून की तेज धूप में दोपहर 11 से 4 बजे के बीच खेत में काम, पानी की कमी, बुजुर्ग मजदूर',
        ta: 'பகல் 11 முதல் 4 மணி வரை கடும் வெயிலில் வேலை செய்தல், தண்ணீர் அருந்தாமை',
        te: 'మధ్యాహ్నం 11 నుండి 4 గంటల మధ్య ఎండలో పనిచేయడం',
        ml: 'ഉച്ചസമയത്തെ കഠിനമായ വെയിൽ, വെള്ളം കുടിക്കാതിരിക്കുക',
        kn: 'ಮಧ್ಯಾಹ್ನ 11 ರಿಂದ 4 ಗಂಟೆಯ ಬಿಸಿಲಿನಲ್ಲಿ ಕೆಲಸ, ನೀರಿನ ಕೊರತೆ'
      }
    ],
    recommendedAssessment: [
      {
        en: 'Measure core body temperature immediately, assess mental status and alertness, check pulse and blood pressure',
        hi: 'तुरंत तापमान नापें, मानसिक स्थिति और नब्ज जांचें',
        ta: 'உடனடியாக வெப்பநிலை அளவிடவும், விழிப்புணர்வு நிலையை சோதிக்கவும்',
        te: 'ఉష్ಣోగ్రత మరియు నాడి వేగం తనిఖీ చేయండి',
        ml: 'ശരീര താപനിലയും ബോധനിലയും പരിശോധിക്കുക',
        kn: 'ತಕ್ಷಣ ತಾಪಮಾನ ಮತ್ತು ಪ್ರಜ್ಞೆಯ ಮಟ್ಟ ಪರಿಶೀಲಿಸಿ'
      }
    ],
    tests: [],
    supportiveCare: [
      {
        en: 'RAPID COOLING IS ESSENTIAL: Move to cool shade immediately. Remove excess clothing. Spray or sponge whole body with cool/tap water and fan vigorously. Place wet cold packs in armpits, groin, and neck.',
        hi: 'तुरंत ठंडी छाया में ले जाएं। कपड़े ढीले करें। पूरे शरीर पर सामान्य पानी छिड़कें और तेजी से पंखा झलें। बगल, गर्दन और जांघों पर ठंडे पानी की पट्टी रखें।',
        ta: 'உடனடியாக நிழலான இடத்திற்கு மாற்றவும். ஆடைகளை தளர்த்தவும். உடல் முழுவதும் குளிர்ந்த நீரால் துடைத்து விசிறி விடவும். அக்குள், கழுத்தில் ஈரத்துணி வைக்கவும்.',
        te: 'వెంటనే నీడలోకి తరలించండి. బట్టలు వదులు చేయండి. ఒళ్లంతా చల్లటి నీటితో తడిపి ఫ్యాన్ గాలి తగిలించండి.',
        ml: 'തണലിലേക്ക് മാറ്റുക. വസ്ത്രങ്ങൾ അയക്കുക. ശരീരം മുഴുവൻ നനഞ്ഞ തുണികൊണ്ട് തുടയ്ക്കുക. ഫാൻ ഉപയോഗിക്കുക.',
        kn: 'ತಕ್ಷಣ ನೆರಳಿಗೆ ಸರಿಸಿ. ಬಟ್ಟೆಗಳನ್ನು ಸಡಿಲಗೊಳಿಸಿ. ಮೈಮೇಲೆ ತಣ್ಣೀರು ಚಿಮುಕಿಸಿ ಬೀಸಣಿಗೆಯಿಂದ ಬೀಸಿ. ಕಂಕುಳು, ಕತ್ತಿನ ಮೇಲೆ ತಣ್ಣನೆಯ ಪಟ್ಟಿ ಇಡಿ.'
      }
    ],
    treatmentInformation: [
      {
        en: 'If conscious and oriented: offer frequent sips of ORS or cool salted buttermilk. If altered mental state or temperature >104°F, call 108 emergency transport while active cooling continues.',
        hi: 'यदि होश में है तो ओआरएस या नमकीन छाछ दें। यदि अचेत है तो तुरंत 108 बुलाएं और अस्पताल ले जाएं।',
        ta: 'விழித்திருந்தால் ஓஆர்எஸ் அல்லது உப்பு மோர் தரவும். சுயநினைவு மங்கினால் உடனே 108 அழைக்கவும்.',
        te: 'స్పృహ ఉంటే ఓఆర్ఎస్ ఇవ్వండి. స్పృహ లేకపోతే వెంటనే 108 అంబులెన్స్ పిలవండి.',
        ml: 'ബോധമുണ്ടെങ്കിൽ ഒആർഎസ് നൽകുക. ബോധമില്ലെങ്കിൽ ഉടൻ ആശുപത്രിയിലെത്തിക്കുക.',
        kn: 'ಪ್ರಜ್ಞೆ ಇದ್ದರೆ ಓಆರ್‌ಎಸ್ ನೀಡಿ. ಅರೆಪ್ರಜ್ಞಾವಸ್ಥೆ ಇದ್ದರೆ ತಕ್ಷಣ 108 ಗೆ ಕರೆ ಮಾಡಿ.'
      }
    ],
    prevention: [
      {
        en: 'Avoid strenuous field work between 11 AM and 3:30 PM during heatwaves. Drink 4-5 litres of water with lemon/salt daily. Wear wide straw hats and light white cotton clothing.',
        hi: 'दोपहर 11 से 3:30 के बीच धूप में भारी काम से बचें। रोजाना 4-5 लीटर पानी या नींबू-नमक पिएं। सिर पर सफेद गमछा या टोपी रखें।',
        ta: 'பகல் 11 முதல் 3.30 மணி வரை வெயிலை தவிர்க்கவும். தினமும் 4-5 லிட்டர் தண்ணீர் அருந்தவும். தலைப்பாகை அணியவும்.',
        te: 'తీవ్ర ఎండ సమయంలో పనులు నివారించడం, రోజుకు 4-5 లీటర్ల నీరు తాగడం.',
        ml: 'ഉച്ചവെയിലിൽ ജോലി ഒഴിവാക്കുക, ധാരാളം വെള്ളം കുടിക്കുക, തൊപ്പി ധരിക്കുക.',
        kn: 'ಮಧ್ಯಾಹ್ನದ ಕಡು ಬಿಸಿಲಿನಲ್ಲಿ ಕೆಲಸ ತಪ್ಪಿಸಿ, ದಿನಕ್ಕೆ 4-5 ಲೀಟರ್ ನೀರು ಕುಡಿಯಿರಿ, ಬಿಳಿ ಬಟ್ಟೆ ಮತ್ತು ಟೋಪಿ ಧರಿಸಿ.'
      }
    ],
    whenToSeekMedicalCare: [
      {
        en: 'Heavy sweating with muscle cramps, extreme thirst, headache not resolving after 1 hour of cooling in shade',
        hi: 'मांसपेशियों में तेज ऐंठन, छाया में आराम के बाद भी सिरदर्द ठीक न होना',
        ta: 'தசைப் பிடிப்பு, நிழலில் ஓய்வெடுத்தும் சரியாகாத நிலை',
        te: 'కండరాల నొప్పులు, విశ్రాంతి తీసుకున్నా తగ్గకపోవడం',
        ml: 'കഠിനമായ പേശിവലിവ്, തലവേദന കുറയാതിരിക്കുക',
        kn: 'ಸ್ನಾಯು ಸೆಳೆತ, ನೆರಳಿನಲ್ಲಿ ವಿಶ್ರಮಿಸಿದರೂ ನೋವು ಕಡಿಮೆಯಾಗದಿರುವುದು'
      }
    ],
    emergencyCriteria: [
      {
        en: 'Core temperature >104°F (40°C), hot dry skin without sweating, confusion, seizures, or unconsciousness (Heatstroke - Medical Emergency)',
        hi: 'शरीर का तापमान 104°F से ऊपर, पसीना न आना, दौरे पड़ना, बेहोशी (हीटस्ट्रोक)',
        ta: 'உடல் உஷ்ணம் 104°Fக்கு மேல், வியர்க்காத தோல், வலிப்பு, மயக்கம்',
        te: 'ఉష్ణోగ్రత 104°F దాటడం, చెమటలు ఆగిపోవడం, మూర్ఛలు, స్పృహ కోల్పోవడం',
        ml: 'ശരീര താപനില 104°F ന് മുകളിലാവുക, വിയർക്കാതിരിക്കുക, അപസ്മാരം, അബോധാവസ്ഥ',
        kn: 'ತಾಪಮಾನ 104°F ಗಿಂತ ಹೆಚ್ಚು, ಬೆವರದಿರುವುದು, ಫಿಟ್ಸ್, ಪ್ರಜ್ಞಾಹೀನತೆ'
      }
    ],
    contraindications: [
      {
        en: 'Do NOT give paracetamol or aspirin to treat heatstroke (the high temperature is environmental, not hypothalamic; antipyretics damage liver and kidneys without cooling). COOL WITH WATER EXTERNALLY.',
        hi: 'लू लगने में पैरासिटामोल या एस्पिरिन काम नहीं करती और गुर्दों को नुकसान पहुंचा सकती है। पानी और पंखे से बाहरी ठंडक ही एकमात्र उपाय है।',
        ta: 'வெப்பத் தாக்கத்திற்கு பாராசிட்டமால் மாத்திரை தரக்கூடாது. வெளிப்புறமாக குளிர்ந்த நீர் தெளிப்பதே வழி.',
        te: 'వడదెబ్బకు పారాసిటమాల్ పనిచేయదు, నీటితో చల్లబరచడమే ముఖ్యం.',
        ml: 'സൂര്യാഘാതത്തിന് പാരസെറ്റമോൾ ഗുളിക നൽകരുത്. ശരീരം വെള്ളം കൊണ്ട് തണുപ്പിക്കുക.',
        kn: 'ಲೂ ಹೊಡೆತಕ್ಕೆ ಪ್ಯಾರಾಸಿಟಮಾಲ್ ನೀಡಬೇಡಿ. ಮೈಮೇಲೆ ತಣ್ಣೀರು ಹಾಕಿ ತಂಪಾಗಿಸುವುದೇ ಮುಖ್ಯ.'
      }
    ],
    sourceReferences: [MEDICAL_SOURCES.MOHFW_STG_TRAUMA],
    lastReviewed: '2026-02-14',
    evidenceLevel: 'LEVEL_A',
    reviewStatus: 'approved'
  }
};

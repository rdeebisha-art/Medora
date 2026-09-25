import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { db, Patient, Family, FamilyAlertOutbox, EmergencyIncident } from '../db/db';
import { callPhoneNumber } from '../services/calling/phoneNumberUtils';
import {
  Phone, Users, Stethoscope, Building2, HeartPulse, FileText,
  AlertTriangle, CheckCircle, ShieldAlert, ArrowLeft, X, Eye
} from 'lucide-react';

const FIRST_AID_LOCALIZED: Record<string, Array<{ id: string; title: string; steps: string[] }>> = {
  en: [
    {
      id: 'fever', title: '🌡️ High Fever', steps: [
        'Give Paracetamol as advised (not Aspirin for children)',
        'Apply cool, wet cloth on forehead',
        'Drink plenty of fluids — safe water, ORS, coconut water',
        'Do not wrap in heavy blankets',
        'Seek emergency help if fever >104°F (40°C) or lasts >3 days',
      ]
    },
    {
      id: 'bleeding', title: '🩸 Severe Bleeding', steps: [
        'Press firmly on wound with clean cloth',
        'Do not remove the cloth — add more if soaked',
        'Keep the injured part raised above heart level if possible',
        'Do not apply a tourniquet unless trained',
        'Call emergency 108 immediately',
      ]
    },
    {
      id: 'choking', title: '😮‍💨 Choking / Breathing Distress', steps: [
        'Ask: "Are you choking?" — if they can speak, encourage coughing',
        'If silent: stand behind them, arms around waist',
        'Give 5 firm back blows between shoulder blades',
        'Give 5 abdominal thrusts (Heimlich)',
        'Call emergency immediately if airway remains blocked',
      ]
    },
    {
      id: 'snakebite', title: '🐍 Snake Bite', steps: [
        'Keep patient calm and completely still — immobilize the bitten limb',
        'Remove rings, watches or tight items near the bite',
        'Do NOT cut or suck the wound, apply ice, chemicals or herbs',
        'Keep bitten limb BELOW heart level',
        'Transport to hospital immediately for antivenom assessment',
      ]
    },
    {
      id: 'burn', title: '🔥 Burns', steps: [
        'Cool immediately under running cold water for 10–20 minutes',
        'Do NOT use ice, butter, oil, or toothpaste',
        'Remove jewelry but NOT clothing stuck to the burn',
        'Cover with clean cling film or clean cloth loosely',
        'Seek urgent medical help for large burns or facial/hand burns',
      ]
    },
    {
      id: 'heartattack', title: '❤️ Chest Pain / Suspected Cardiac Event', steps: [
        'Help them sit comfortably on the floor with knees bent and back supported',
        'Loosen tight clothing around neck and waist',
        'If prescribed, take prescribed emergency medication',
        'Call emergency (108) immediately — do not drive yourself',
        'Prepare for CPR if person becomes unresponsive',
      ]
    },
  ],
  ta: [
    {
      id: 'fever', title: '🌡️ கடுமையான காய்ச்சல்', steps: [
        'பரிந்துரைக்கப்பட்ட பாராசிட்டமால் (Paracetamol) மாத்திரை கொடுக்கவும் (குழந்தைகளுக்கு ஆஸ்பிரின் வேண்டாம்)',
        'நெற்றியில் குளிர்ந்த, ஈரமான துணியை வைக்கவும்',
        'போதுமான நீர் மற்றும் ORS கரைசல், இளநீர் பருக வைக்கவும்',
        'அதிக போர்வைகளால் மூட வேண்டாம்',
        'காய்ச்சல் 104°F (40°C) க்கு மேல் அல்லது 3 நாட்களுக்கு மேல் நீடித்தால் உடனடியாக 108 அழைக்கவும்',
      ]
    },
    {
      id: 'bleeding', title: '🩸 தீவிர இரத்தப்போக்கு', steps: [
        'சுத்தமான துணியால் காயத்தின் மீது உறுதியாக அழுத்தவும்',
        'துணியை அகற்ற வேண்டாம் — நனைந்தால் மேல் மேலும் துணி வைக்கவும்',
        'முடிந்தால் காயமடைந்த பகுதியை இதய மட்டத்திற்கு மேல் உயர்த்தவும்',
        'பயிற்சி பெறாமல் இறுக்கிக் கட்ட வேண்டாம்',
        'உடனடியாக அவசர எண் 108 அழைக்கவும்',
      ]
    },
    {
      id: 'choking', title: '😮‍💨 மூச்சுத்திணறல் / தொண்டை அடைப்பு', steps: [
        'பேச முடிந்தால் இருமச் சொல்லவும்',
        'பேச முடியாவிட்டால்: பின்னால் நின்று தோள்பட்டை நடுவில் 5 முறை தட்டவும்',
        'வயிற்றின் மேல் பகுதியை உள்நோக்கி 5 முறை அழுத்தவும் (Heimlich)',
        'தொடர்ந்தால் உடனடியாக அவசர உதவியை அழைக்கவும்',
      ]
    },
    {
      id: 'snakebite', title: '🐍 பாம்புக்கடி', steps: [
        'நோயாளியை அமைதியாக அசையாமல் படுக்க வைக்கவும் — கடித்த உறுப்பை அசைக்க வேண்டாம்',
        'கடித்த இடத்திலுள்ள மோதிரம், காப்பு, கடிகாரம் போன்றவற்றை உடனே கழற்றவும்',
        'காயத்தை வெட்டவோ, உறிஞ்சவோ, பச்சிலை அல்லது பனி வைக்கவோ கூடாது',
        'கடித்த உறுப்பை இதய நிலைக்கு கீழே வைத்திருக்கவும்',
        'உடனடியாக விஷ முறிவு சிகிச்சைக்காக அரசு மருத்துவமனைக்கு அழைத்துச் செல்லவும்',
      ]
    },
    {
      id: 'burn', title: '🔥 தீக்காயங்கள்', steps: [
        'உடனடியாக ஓடும் குளிர்ந்த நீரில் 10-20 நிமிடங்கள் குளிர்விக்கவும்',
        'பனிக்கட்டி, எண்ணெய், வெண்ணெய் அல்லது பற்பசை பூச வேண்டாம்',
        'ஒட்டியுள்ள ஆடைகளை இழுத்து அகற்ற வேண்டாம்',
        'சுத்தமான மெல்லிய துணியால் தளர்வாக மூடவும்',
        'பெரிய காயங்களுக்கு உடனடியாக மருத்துவ உதவியை நாடவும்',
      ]
    },
    {
      id: 'heartattack', title: '❤️ நெஞ்சு வலி / மாரடைப்பு சந்தேகம்', steps: [
        'முதுகு ஆதரவுடன் முழங்கால்களை மடக்கி தரையில் வசதியாக அமர வைக்கவும்',
        'கழுத்து மற்றும் இடுப்புப் பகுதியைச் சுற்றியுள்ள இறுக்கமான ஆடைகளைத் தளர்த்தவும்',
        'மருத்துவர் பரிந்துரைத்த அவசர மருந்து இருந்தால் உட்கொள்ளவும்',
        'உடனடியாக 108 அவசர ஊர்தியை அழைக்கவும் — நீங்களாக வாகனம் ஓட்ட வேண்டாம்',
        'நோயாளி நினைவிழந்தால் உடனடியாக CPR செய்வதற்கு தயாராக இருக்கவும்',
      ]
    },
  ],
  te: [
    {
      id: 'fever', title: '🌡️ తీవ్ర జ్వరం', steps: [
        'వైద్యుల సలహా మేరకు పారాసిటమాల్ ఇవ్వండి (పిల్లలకు ఆస్పిరిన్ వద్దు)',
        'నుదుటిపై చల్లటి తడి గుడ్డను ఉంచండి',
        'తగినంత సురక్షితమైన నీరు, ORS ద్రవాలు తాగించండి',
        'మందపాటి దుప్పట్లు కప్పవద్దు',
        'జ్వరం 104°F (40°C) కంటే ఎక్కువ ఉంటే లేదా 3 రోజులకు మించి ఉంటే వెంటనే 108 కి కాల్ చేయండి',
      ]
    },
    {
      id: 'bleeding', title: '🩸 తీవ్ర రక్తస్రావం', steps: [
        'గాయంపై శుభ్రమైన గుడ్డతో గట్టిగా నొక్కండి',
        'గుడ్డను తీయకండి — రక్తంతో తడిస్తే దానిపైనే మరిన్ని గుడ్డలు ఉంచండి',
        'వీలైతే గాయపడిన భాగాన్ని గుండె స్థాయి కంటే ఎత్తులో ఉంచండి',
        'వెంటనే అత్యవసర సహాయం 108 కి కాల్ చేయండి',
      ]
    },
    {
      id: 'choking', title: '😮‍💨 ఊపిరాడకపోవడం / శ్వాస తీసుకోవడంలో ఇబ్బంది', steps: [
        'మాట్లాడగలిగితే దగ్గమని చెప్పండి',
        'శబ్దం రాకపోతే: వెనుక నిలబడి భుజాల మధ్య 5 సార్లు గట్టిగా కొట్టండి',
        'పొత్తికడుపుపై 5 సార్లు నొక్కండి (హీమ్లిచ్ పద్ధతి)',
        'వెంటనే అత్యవసర సహాయం 108 కి కాల్ చేయండి',
      ]
    },
    {
      id: 'snakebite', title: '🐍 పాముకాటు', steps: [
        'రోగిని ప్రశాంతంగా ఉంచండి — కాటు వేసిన భాగాన్ని కదల్చకండి',
        'ఉంగరాలు, గడియారాలు లేదా బిగుతు వస్తువులను తొలగించండి',
        'గాయాన్ని కోయవద్దు, రక్తాన్ని పీల్చవద్దు, మంచు లేదా రసాయనాలు రాయవద్దు',
        'కాటు వేసిన అవయవాన్ని గుండె స్థాయి కంటే దిగువన ఉంచండి',
        'వెంటనే యాంటీ-వెనమ్ చికిత్స కోసం ఆసుపత్రికి తరలించండి',
      ]
    },
    {
      id: 'burn', title: '🔥 కాలిన గాయాలు', steps: [
        'వెంటనే 10-20 నిమిషాలు చల్లటి నీటిలో ఉంచండి',
        'మంచు, వెన్న, నూనె లేదా టూత్‌పేస్ట్ వాడవద్దు',
        'గాయానికి అతుక్కున్న దుస్తులను లాగవద్దు',
        'శుభ್ರమైన పలుచని గుడ్డతో వదులుగా కప్పండి',
        'తీవ్ర కాలిన గాయాలకు వెంటనే వైద్య సహాయం పొందండి',
      ]
    },
    {
      id: 'heartattack', title: '❤️ ఛాతీ నొప్పి / గుండెపోటు అనుమానం', steps: [
        'మోకాళ్ళు వంచి, వీపుకు ఆసరా ఇచ్చి రోగిని కూర్చోబెట్టండి',
        'మెడ, నడుము చుట్టೂ ఉన్న బిగుతు దుస్తులను వదులు చేయండి',
        'వైద్యులు సూచించిన అత్యవసర మందు ఉంటే ఇవ్వండి',
        'వెంటనే 108 కి కాల్ చేయండి — స్వయంగా వాహనం నడపవద్దు',
        'రోగి స్పృహ కోల్పోతే CPR ఇవ్వడానికి సిద్ధంగా ఉండండి',
      ]
    },
  ],
  hi: [
    {
      id: 'fever', title: '🌡️ तेज बुखार', steps: [
        'सलाह के अनुसार पैरासिटामोल (Paracetamol) दें (बच्चों को एस्पिरिन न दें)',
        'माथे पर ठंडे, गीले कपड़े की पट्टी रखें',
        'भरपूर तरल पदार्थ दें — सुरक्षित पानी, ORS घोल, नारियल पानी',
        'मोटे कंबलों में न लपेटें',
        'यदि बुखार 104°F (40°C) से अधिक हो या 3 दिन से ज्यादा रहे तो तुरंत 108 पर कॉल करें',
      ]
    },
    {
      id: 'bleeding', title: '🩸 गंभीर रक्तस्राव', steps: [
        'साफ कपड़े से घाव पर मजबूती से दबाएं',
        'कपड़ा न हटाएं — यदि भीग जाए तो ऊपर से और कपड़ा रखें',
        'यदि संभव हो तो घायल हिस्से को दिल के स्तर से ऊपर रखें',
        'बिना प्रशिक्षण के कसकर पट्टी न बांधें',
        'तुरंत आपातकालीन 108 पर कॉल करें',
      ]
    },
    {
      id: 'choking', title: '😮‍💨 सांस रुकना / दम घुटना', steps: [
        'यदि वे बोल सकते हैं, तो उन्हें खांसने के लिए कहें',
        'यदि आवाज न आए: पीछे खड़े होकर पीठ के बीच 5 बार थपथपाएं',
        'पेट के ऊपरी हिस्से पर 5 बार अंदर की ओर दबाव डालें (हेमलिच तकनीक)',
        'सांस न आने पर तुरंत आपातकालीन सहायता बुलाएं',
      ]
    },
    {
      id: 'snakebite', title: '🐍 सांप का काटना', steps: [
        'रोगी को शांत और स्थिर रखें — काटे हुए अंग को बिल्कुल न हिलाएं',
        'काटे हुए स्थान के पास से अंगूठी, घड़ी या तंग चीजें तुरंत हटा दें',
        'घाव को काटें या चूसें नहीं, बर्फ या जड़ी-बूटी न लगाएं',
        'काटे हुए अंग को दिल के स्तर से नीचे रखें',
        'एंटी-वेनम उपचार के लिए तुरंत अस्पताल ले जाएं',
      ]
    },
    {
      id: 'burn', title: '🔥 जलना', steps: [
        'तुरंत 10-20 मिनट के लिए बहते ठंडे पानी के नीचे रखें',
        'बर्फ, मक्खन, तेल या टूथपेस्ट का उपयोग न करें',
        'जले हुए स्थान पर चिपके कपड़े को जबरदस्ती न खींचें',
        'साफ कपड़े से ढीला ढकें',
        'गंभीर रूप से जलने पर तुरंत नजदीकी अस्पताल जाएं',
      ]
    },
    {
      id: 'heartattack', title: '❤️ सीने में दर्द / दिल का दौरा', steps: [
        'घुटने मोड़कर और पीठ को सहारा देकर फर्श पर आराम से बैठाएं',
        'गर्दन और कमर के तंग कपड़ों को ढीला करें',
        'यदि डॉक्टर द्वारा निर्धारित आपातकालीन दवा हो, तो लें',
        'तुरंत 108 पर कॉल करें — खुद गाड़ी न चलाएं',
        'यदि व्यक्ति बेहोश हो जाए तो CPR के लिए तैयार रहें',
      ]
    },
  ],
  ml: [
    {
      id: 'fever', title: '🌡️ കഠിനമായ പനി', steps: [
        'ഡോക്ടറുടെ നിർദ്ദേശപ്രകാരം പാരസെറ്റമോൾ നൽകുക (കുട്ടികൾക്ക് ആസ്പിരിൻ നൽകരുത്)',
        'നെറ്റിയിൽ തണുത്ത നനഞ്ഞ തുണിയിടുക',
        'ധാരാളം ശുദ്ധജലം, ORS, കരിക്കിൻ വെള്ളം എന്നിവ നൽകുക',
        'കട്ടികൂടിയ പുതപ്പുകൾ ഉപയോഗിച്ച് മൂടരുത്',
        'പനി 104°F (40°C) ന് മുകളിലായാലോ 3 ദിവസത്തിൽ കൂടുതൽ നീണ്ടുനിന്നാലോ 108 ൽ വിളിക്കുക',
      ]
    },
    {
      id: 'bleeding', title: '🩸 കഠിനമായ രക്തസ്രാവം', steps: [
        'വൃത്തിയുള്ള തുണികൊണ്ട് മുറിവിൽ അമർത്തിപ്പിടിക്കുക',
        'തുണി മാറ്റരുത് — ചോര നനഞ്ഞാൽ അതിന് മുകളിൽ വീണ്ടും തുണി വെയ്ക്കുക',
        'കഴിയുമെങ്കിൽ മുറിവേറ്റ ഭാഗം ഹൃദയനിരപ്പിനേക്കാൾ ഉയർത്തി വെയ്ക്കുക',
        'ഉടൻ തന്നെ 108 എന്ന അടിയന്തര നമ്പറിൽ ബന്ധപ്പെടുക',
      ]
    },
    {
      id: 'choking', title: '😮‍💨 ശ്വാസതടസ്സം / തൊണ്ടയിൽ കുടുങ്ങൽ', steps: [
        'സംസാരിക്കാൻ കഴിയുമെങ്കിൽ ചുമയ്ക്കാൻ പ്രോത്സാഹിപ്പിക്കുക',
        'ശബ്ദം പുറത്തുവരുന്നില്ലെങ്കിൽ: പുറകിൽ നിന്ന് തോളുകൾക്കിടയിൽ 5 തവണ തട്ടുക',
        'വയറ്റിൽ മുകളിലേക്ക് അമർത്തുക (ഹീംലിച്ച് രീതി)',
        'ഉടൻ തന്നെ അടിയന്തര സഹായം തേടുക',
      ]
    },
    {
      id: 'snakebite', title: '🐍 പാമ്പുകടി', steps: [
        'രോഗിയെ ശാന്തനാക്കി കിടത്തുക — കടിയേറ്റ ഭാഗം അനക്കാതെ സൂക്ഷിക്കുക',
        'മോതിരങ്ങൾ, വളകൾ എന്നിവ ഉടനടി അഴിച്ചുമാറ്റുക',
        'മുറിവുണ്ടാക്കുകയോ രക്തം വലിച്ചെടുക്കുകയോ ഐസ് വെയ്ക്കുകയോ ചെയ്യരുത്',
        'കടിയേറ്റ ഭാഗം ഹൃദയനിരപ്പിൽ താഴെയായി വെക്കുക',
        'ആന്റിവെനം ചികിത്സയ്ക്കായി ഉടൻ തന്നെ ആശുപത്രിയിലെത്തിക്കുക',
      ]
    },
    {
      id: 'burn', title: '🔥 പൊള്ളൽ', steps: [
        'ഉടൻ തന്നെ 10-20 മിനിറ്റ് തണുത്ത വെള്ളം ഒഴിക്കുക',
        'ഐസ്, എണ്ണ, വെണ്ണ, ടൂത്ത്പേസ്റ്റ് എന്നിവ ഉപയോഗിക്കരുത്',
        'പൊള്ളലേറ്റ ഭാഗത്ത് ഒട്ടിപ്പിടിച്ച തുണികൾ വലിച്ചെടുക്കരുത്',
        'വൃത്തിയുള്ള തുണി ഉപയോഗിച്ച് അയവായി മൂടുക',
        'ഉടൻ തന്നെ വിദഗ്ദ്ധ ചികിത്സ തേടുക',
      ]
    },
    {
      id: 'heartattack', title: '❤️ നെഞ്ചുവേദന / ഹൃദയാഘാത സാധ്യത', steps: [
        'മുട്ടുമടക്കി മുതുകിന് താങ്ങുകൊടുത്ത് തറയിൽ ശാന്തമായി ഇരുത്തുക',
        'ഇറുക്കമുള്ള വസ്ത്രങ്ങൾ അയച്ചു കൊടുക്കുക',
        'ഡോക്ടർ നിർദ്ദേശിച്ച അടിയന്തര മരുന്നുകൾ ഉണ്ടെങ്കിൽ നൽകുക',
        'ഉടൻ തന്നെ 108 ൽ വിളിക്കുക — സ്വന്തമായി വാഹനം ഓടിക്കരുത്',
        'ബോധക്ഷയം ഉണ്ടായാൽ CPR നൽകാൻ തയ്യാറാകുക',
      ]
    },
  ],
  kn: [
    {
      id: 'fever', title: '🌡️ ತೀವ್ರ ಜ್ವರ', steps: [
        'ವೈದ್ಯರ ಸಲಹೆಯಂತೆ ಪ್ಯಾರಸಿಟಮಾಲ್ ನೀಡಿ (ಮಕ್ಕಳಿಗೆ ಆಸ್ಪಿರಿನ್ ಬೇಡ)',
        'ಹಣೆ ಮೇಲೆ ತಣ್ಣನೆಯ ತೇವ ಬಟ್ಟೆಯ ಪಟ್ಟಿ ಇರಿಸಿ',
        'ಧಾರಾಳವಾಗಿ ನೀರು, ORS ದ್ರಾವಣ ನೀಡಿ',
        'ದಪ್ಪ ಕಂಬಳಿಗಳಿಂದ ಮುಚ್ಚಬೇಡಿ',
        'ಜ್ವರ 104°F (40°C) ಗಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ಅಥವಾ 3 ದಿನಕ್ಕಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ತಕ್ಷಣ 108 ಕರೆ ಮಾಡಿ',
      ]
    },
    {
      id: 'bleeding', title: '🩸 ತೀವ್ರ ರಕ್ತಸ್ರಾವ', steps: [
        'ಸ್ವಚ್ಛ ಬಟ್ಟೆಯಿಂದ ಗಾಯದ ಮೇಲೆ ಬಲವಾಗಿ ಒತ್ತಿ ಹಿಡಿಯಿರಿ',
        'ಬಟ್ಟೆಯನ್ನು ತೆಗೆಯಬೇಡಿ — ನೆನೆದರೆ ಅದರ ಮೇಲೆಯೇ ಮತ್ತಷ್ಟು ಬಟ್ಟೆ ಇರಿಸಿ',
        'ಸಾಧ್ಯವಾದರೆ ಗಾಯಗೊಂಡ ಭಾಗವನ್ನು ಹೃದಯದ ಮಟ್ಟಕ್ಕಿಂತ ಮೇಲೆ ಇರಿಸಿ',
        'ತಕ್ಷಣವೇ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆ ಮಾಡಿ',
      ]
    },
    {
      id: 'choking', title: '😮‍💨 ಉಸಿರುಗಟ್ಟುವಿಕೆ', steps: [
        'ಮಾತನಾಡಲು ಸಾಧ್ಯವಾದರೆ ಕೆಮ್ಮಲು ಹೇಳಿ',
        'ಧ್ವನಿ ಬರದಿದ್ದರೆ: ಬೆನ್ನಿನ ಮಧ್ಯೆ 5 ಬಾರಿ ದೃಢವಾಗಿ ತಟ್ಟಿ',
        'ಹೊಟ್ಟೆಯ ಮೇಲ್ಭಾಗದಲ್ಲಿ ಒಳಮುಖವಾಗಿ 5 ಬಾರಿ ಒತ್ತಿ (ಹೀಮ್ಲಿಚ್ ವಿಧಾನ)',
        'ತಕ್ಷಣ ತುರ್ತು ಸಹಾಯ ಪಡೆಯಿರಿ',
      ]
    },
    {
      id: 'snakebite', title: '🐍 ಹಾವು ಕಡಿತ', steps: [
        'ರೋಗಿಯನ್ನು ಶಾಂತವಾಗಿರಿಸಿ — ಕಚ್ಚಿದ ಭಾಗವನ್ನು ಅಲುಗಾಡಿಸಬೇಡಿ',
        'ಉಂಗುರ, ವಾಚ್ ಅಥವಾ ಬಿಗಿಯಾದ ವಸ್ತುಗಳನ್ನು ತೆಗೆಯಿರಿ',
        'ಗಾಯವನ್ನು ಕತ್ತರಿಸುವುದು, ಹೀರುವುದು, ಐಸ್ ಹಚ್ಚುವುದು ಮಾಡಬೇಡಿ',
        'ಕಚ್ಚಿದ ಅಂಗವನ್ನು ಹೃದಯದ ಮಟ್ಟಕ್ಕಿಂತ ಕೆಳಗೆ ಇರಿಸಿ',
        'ವಿಷನಿರೋಧಕ ಚಿಕಿತ್ಸೆಗಾಗಿ ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಕೊಂಡೊಯ್ಯಿರಿ',
      ]
    },
    {
      id: 'burn', title: '🔥 ಸುಟ್ಟ ಗಾಯಗಳು', steps: [
        'ತಕ್ಷಣ 10-20 ನಿಮಿಷಗಳ ಕಾಲ ಹರಿಯುವ ತಣ್ಣೀರಿನಲ್ಲಿ ತೊಳೆಯಿರಿ',
        'ಐಸ್, ಬೆಣ್ಣೆ, ಎಣ್ಣೆ ಅಥವಾ ಟೂತ್‌ಪೇಸ್ಟ್ ಹಚ್ಚಬೇಡಿ',
        'ಅಂಟಿಕೊಂಡ ಬಟ್ಟೆಯನ್ನು ಬಲವಂತವಾಗಿ ತೆಗೆಯಬೇಡಿ',
        'ಸ್ವಚ್ಛವಾದ ತೆಳು ಬಟ್ಟೆಯಿಂದ ಸಡಿಲವಾಗಿ ಮುಚ್ಚಿ',
        'ತಕ್ಷಣ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ',
      ]
    },
    {
      id: 'heartattack', title: '❤️ ಎದೆನೋವು / ಹೃದಯಾಘಾತದ ಶಂಕೆ', steps: [
        'ಮಂಡಿ ಮಡಚಿ ಬೆನ್ನಿಗೆ ಆಸರೆ ನೀಡಿ ನೆಲದ ಮೇಲೆ ಆರಾಮವಾಗಿ ಕೂರಿಸಿ',
        'ಕುತ್ತಿಗೆ ಮತ್ತು ಸೊಂಟದ ಬಿಗಿಯಾದ ಬಟ್ಟೆಯನ್ನು ಸಡಿಲಗೊಳಿಸಿ',
        'ವೈದ್ಯರು ಸೂಚಿಸಿದ ತುರ್ತು ಔಷಧವಿದ್ದರೆ ನೀಡಿ',
        'ತಕ್ಷಣವೇ 108 ಗೆ ಕರೆ ಮಾಡಿ — ನೀವೇ ವಾಹನ ಚಲಾಯಿಸಬೇಡಿ',
        'ರೋಗಿ ಪ್ರಜ್ಞೆ ತಪ್ಪಿದರೆ CPR ನೀಡಲು ಸಿದ್ಧರಾಗಿ',
      ]
    },
  ],
};

export default function EmergencyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, appLanguage } = useAppStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [patientFamily, setPatientFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<Patient[]>([]);
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [alertOutbox, setAlertOutbox] = useState<FamilyAlertOutbox[]>([]);
  const [showOutboxModal, setShowOutboxModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isAlerting, setIsAlerting] = useState(false);

  // Load patient, family, and existing alerts from IndexedDB
  useEffect(() => {
    const load = async () => {
      let pId = currentUser?.id || 1;
      let patient = await db.patients.get(pId);
      if (!patient) {
        const allPatients = await db.patients.toArray();
        patient = allPatients[0];
      }
      setCurrentPatient(patient || null);

      if (patient?.familyId) {
        const fam = await db.families.get(patient.familyId);
        setPatientFamily(fam || null);
        if (fam?.memberIds?.length) {
          const mems = await db.patients.bulkGet(fam.memberIds);
          setFamilyMembers((mems.filter(Boolean) as Patient[]).filter(m => m.id !== patient.id));
        }
      }

      // Load existing alerts
      const alerts = await db.familyAlertOutbox.reverse().toArray();
      setAlertOutbox(alerts);
    };
    load();
  }, [currentUser]);

  // Create Emergency Incident locally
  const createEmergencyIncident = async (type = 'GENERAL_EMERGENCY', severity: EmergencyIncident['severity'] = 'HIGH') => {
    const incident: EmergencyIncident = {
      incidentId: `INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientId: currentPatient?.id || 1,
      timestamp: new Date().toISOString(),
      detectedLanguage: appLanguage,
      emergencyType: type,
      severity,
      locationIfAvailable: 'Kodaikanal Rural Sector, Tamil Nadu',
      source: 'MANUAL_BUTTON',
      status: 'LOCAL_ONLY',
      dispatchStatus: 'LOCAL_ONLY',
      createdAt: new Date().toISOString(),
    };

    try {
      const id = await db.emergencyIncidents.add(incident);
      setActiveIncident({ ...incident, id });
      setStatusMessage('Emergency incident created locally in Medora. External dispatch requires cellular connection.');
    } catch (e) {
      console.error('Failed to log emergency incident:', e);
    }
  };

  // Trigger Family Alert for each authorized family member
  const handleFamilyAlert = async () => {
    if (!currentPatient) return;
    setIsAlerting(true);

    try {
      await createEmergencyIncident('FAMILY_EMERGENCY_ALERT', 'HIGH');

      const recipients = familyMembers.length > 0
        ? familyMembers
        : [
            { id: 99, name: 'Family Contact (Mother)', phone: currentPatient.emergencyContact || '9876500001' },
            { id: 98, name: 'Family Contact (Father)', phone: '9876500002' },
          ];

      const newAlerts: FamilyAlertOutbox[] = [];
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      for (const rec of recipients) {
        const alertRecord: FamilyAlertOutbox = {
          alertId: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          familyId: currentPatient.familyId || 1,
          patientId: currentPatient.id || 1,
          recipientId: rec.id,
          recipientName: rec.name,
          recipientPhone: rec.phone,
          message: `🚨 EMERGENCY ALERT from MEDORA: ${currentPatient.name} may need urgent assistance at ${timestamp}. Location: Kodaikanal.`,
          language: appLanguage,
          timestamp: new Date().toISOString(),
          status: 'PENDING_OFFLINE',
        };

        const id = await db.familyAlertOutbox.add(alertRecord);
        newAlerts.push({ ...alertRecord, id });
      }

      setAlertOutbox(prev => [...newAlerts, ...prev]);
      setStatusMessage(`Family alert prepared in offline outbox for ${recipients.length} family member(s).`);
      setShowOutboxModal(true);
    } catch (e) {
      console.error('Failed to create family alerts:', e);
    } finally {
      setIsAlerting(false);
    }
  };

  const handleCallEmergencyContact = () => {
    const contactPhone = currentPatient?.emergencyContact || '108';
    callPhoneNumber(contactPhone);
  };

  const handleCallHospital = () => {
    callPhoneNumber('04542-241200'); // Kodaikanal Government Hospital
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      {/* Sticky High-Contrast Emergency Header */}
      <div className="bg-[#DC2626] px-4 py-3.5 sticky top-0 z-30 shadow-lg border-b border-red-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={24} className="text-white animate-pulse" />
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                🚨 {t('emergency.title', 'EMERGENCY MODE')}
              </h1>
              <p className="text-[11px] text-red-100 font-medium">
                Patient: {currentPatient?.name || 'Registered Patient'} · Offline Safe
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-black/30 hover:bg-black/50 text-white text-xs px-3 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Home</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-4 max-w-4xl mx-auto space-y-4">
        {/* Truthful Dispatch Notice */}
        <div className="bg-amber-950/80 border border-amber-600/60 rounded-2xl p-3.5 text-xs text-amber-200">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <AlertTriangle size={15} />
            <span>Offline Prototype Notice:</span>
          </div>
          <p className="mt-1 leading-relaxed">
            Emergency incidents and family alerts are recorded in your on-device local storage. External dispatch requires cellular calling or telephony network capabilities.
          </p>
        </div>

        {statusMessage && (
          <div className="bg-emerald-950/90 border border-emerald-600 rounded-2xl p-3 text-xs text-emerald-200 flex items-center justify-between">
            <span>✓ {statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* STEP 2: Large Emergency Primary Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Call Emergency Contact */}
          <button
            onClick={handleCallEmergencyContact}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white p-4 sm:p-5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 text-left border border-red-500 min-h-[80px]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              📞
            </div>
            <div>
              <div className="text-base font-black">Call Emergency Contact</div>
              <div className="text-xs text-red-100 font-mono mt-0.5">
                {currentPatient?.emergencyContact || '108 (National Ambulance)'}
              </div>
            </div>
          </button>

          {/* 2. Call Hospital */}
          <button
            onClick={handleCallHospital}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-4 sm:p-5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 text-left border border-blue-500 min-h-[80px]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              🏥
            </div>
            <div>
              <div className="text-base font-black">Call Nearest Hospital</div>
              <div className="text-xs text-blue-100 mt-0.5">
                Kodaikanal Govt Hospital (04542-241200)
              </div>
            </div>
          </button>

          {/* 3. Family Alert */}
          <button
            onClick={handleFamilyAlert}
            disabled={isAlerting}
            className="flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white p-4 sm:p-5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 text-left border border-orange-500 min-h-[80px]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              👪
            </div>
            <div>
              <div className="text-base font-black">Send Family Alert</div>
              <div className="text-xs text-orange-100 mt-0.5">
                Prepares alert for all authorized family contacts
              </div>
            </div>
          </button>

          {/* 4. Doctor Alert / Consultation */}
          <Link
            to="/ai"
            className="flex items-center gap-3 bg-purple-700 hover:bg-purple-800 text-white p-4 sm:p-5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 text-left border border-purple-600 min-h-[80px]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              👨‍⚕️
            </div>
            <div>
              <div className="text-base font-black">Doctor Alert & AI Triage</div>
              <div className="text-xs text-purple-200 mt-0.5">
                Clinical guidance with Dr. Arjun Mehta
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Workflow Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setShowOutboxModal(true)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl text-center text-xs font-bold text-slate-200 flex flex-col items-center justify-center gap-1"
          >
            <Eye size={16} className="text-teal-400" />
            <span>View Family Alerts ({alertOutbox.length})</span>
          </button>

          <Link
            to="/hospitals"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl text-center text-xs font-bold text-slate-200 flex flex-col items-center justify-center gap-1"
          >
            <Building2 size={16} className="text-blue-400" />
            <span>Hospital Directory</span>
          </Link>

          <Link
            to="/doctor-summary"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl text-center text-xs font-bold text-slate-200 flex flex-col items-center justify-center gap-1"
          >
            <FileText size={16} className="text-emerald-400" />
            <span>Emergency Handoff</span>
          </Link>

          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-3 rounded-xl text-center text-xs font-bold text-rose-400 flex flex-col items-center justify-center gap-1"
          >
            <X size={16} className="text-rose-400" />
            <span>Cancel Emergency</span>
          </button>
        </div>

        {/* First Aid Instructions */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse size={18} className="text-red-400" />
            <h2 className="font-extrabold text-sm text-white">
              Instant First Aid Protocols
            </h2>
          </div>

          <div className="space-y-2">
            {(FIRST_AID_LOCALIZED[appLanguage] || FIRST_AID_LOCALIZED['en']).map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-200 text-left hover:bg-slate-800/50"
                >
                  <span>{item.title}</span>
                  <span className="text-slate-400">{expandedId === item.id ? '▲' : '▼'}</span>
                </button>
                {expandedId === item.id && (
                  <div className="px-4 pb-3.5 pt-1 space-y-1.5 text-xs text-slate-300 border-t border-slate-800">
                    {item.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-red-400 flex-shrink-0">{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Family Alert Outbox Modal */}
      {showOutboxModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-orange-400" />
                <h3 className="font-extrabold text-base text-white">Family Alert Outbox (Offline)</h3>
              </div>
              <button onClick={() => setShowOutboxModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="py-2 text-[11px] text-slate-400">
              SMS DEMO / OFFLINE OUTBOX · Recorded locally in IndexedDB
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 my-2">
              {alertOutbox.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No family alerts in outbox yet. Tap "Send Family Alert" to prepare alerts.
                </div>
              ) : (
                alertOutbox.map((alert) => (
                  <div key={alert.id || alert.alertId} className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>To: {alert.recipientName} ({alert.recipientPhone})</span>
                      <span className="text-[10px] bg-amber-900/60 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded-full font-mono">
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed bg-slate-900/70 p-2 rounded-lg font-mono">
                      {alert.message}
                    </p>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowOutboxModal(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Close Outbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

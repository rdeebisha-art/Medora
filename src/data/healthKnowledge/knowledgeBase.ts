import { SupportedLanguageCode } from '../languages';

export type HealthcareIntent =
  | 'FEVER'
  | 'COUGH_COLD'
  | 'BREATHING_DIFFICULTY'
  | 'CHEST_PAIN'
  | 'STOMACH_PAIN'
  | 'HEADACHE_DIZZINESS'
  | 'MEDICINE_INQUIRY'
  | 'PREGNANCY_CARE'
  | 'NEWBORN_CARE'
  | 'CHILD_CARE'
  | 'ELDERLY_CARE'
  | 'DIABETES_CARE'
  | 'NUTRITION_CARE'
  | 'VACCINATION_INQUIRY'
  | 'EMERGENCY_TRIAGE'
  | 'GENERAL_HEALTH';

export interface LocalizedHealthResponse {
  intent: HealthcareIntent;
  agentName: string;
  isEmergency: boolean;
  templates: Record<SupportedLanguageCode, {
    primaryText: string;
    followUpQuestion: string;
    safetyGuidance: string;
  }>;
}

export const HEALTH_KNOWLEDGE_BASE: Record<HealthcareIntent, LocalizedHealthResponse> = {
  FEVER: {
    intent: 'FEVER',
    agentName: 'General Physician Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'உங்களுக்கு காய்ச்சல் இருப்பது புரிகிறது. நிறைய தண்ணீர் மற்றும் ஓ.ஆர்.எஸ் (ORS) திரவம் குடிக்கவும். ஓய்வெடுங்கள்.',
        followUpQuestion: 'காய்ச்சல் எத்தனை நாட்களாக இருக்கிறது? உடல் வெப்பநிலை எவ்வளவு?',
        safetyGuidance: 'காய்ச்சல் 3 நாட்களுக்கு மேல் நீடித்தாலோ அல்லது 102°F-க்கு மேல் சென்றாலோ உடனடியாக அருகில் உள்ள அரசு ஆரம்ப சுகாதார நிலையத்திற்கு செல்லவும்.'
      },
      'te-IN': {
        primaryText: 'మీకు జ్వరం ఉన్నట్లు అర్థమైంది. పుష్కలంగా నీరు, ఓ.ఆర్.ఎస్ (ORS) ద్రవాలు తాగండి మరియు విశ్రాంతి తీసుకోండి.',
        followUpQuestion: 'జ్వరం ఎన్ని రోజులుగా ఉంది? ఉష్ణోగ్రత ఎంత నమోదు అయ్యింది?',
        safetyGuidance: 'జ్వరం 3 రోజులకు మించి ఉన్నా లేదా 102°F దాటినా వెంటనే సమీప ప్రాథమిక ఆరోగ్య కేంద్రానికి వెళ్లండి.'
      },
      'ml-IN': {
        primaryText: 'നിങ്ങൾക്ക് പനി ഉള്ളതായി മനസ്സിലാക്കുന്നു. ധാരാളം വെള്ളവും ഒ.ആർ.എസ് (ORS) ലായനിയും കുടിക്കുക. വിശ്രമിക്കുക.',
        followUpQuestion: 'പനി എത്ര ദിവസമായി ഉണ്ട്? ശരീര താപനില എത്രയാണ്?',
        safetyGuidance: 'പനി 3 ദിവസത്തിൽ കൂടുതൽ നീണ്ടുനിൽക്കുകയോ 102°F-ൽ കൂടുകയോ ചെയ്താൽ ഉടൻ അടുത്തുള്ള പ്രാഥമിക ആരോഗ്യ കേന്ദ്രത്തിൽ പോകുക.'
      },
      'kn-IN': {
        primaryText: 'ನಿಮಗೆ ಜ್ವರ ಇರುವುದು ತಿಳಿಯಿತು. ಸಾಕಷ್ಟು ನೀರು ಮತ್ತು ಓ.ಆರ್.ಎಸ್ (ORS) ದ್ರವ ಸೇವಿಸಿ. ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.',
        followUpQuestion: 'ಜ್ವರ ಎಷ್ಟು ದಿನಗಳಿಂದ ಇದೆ? ದೇಹದ ಉಷ್ಣತೆ ಎಷ್ಟಿದೆ?',
        safetyGuidance: 'ಜ್ವರ 3 ದಿನಕ್ಕಿಂತ ಹೆಚ್ಚು ಇದ್ದರೆ ಅಥವಾ 102°F ಗಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ತಕ್ಷಣವೇ ಹತ್ತಿರದ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.'
      },
      'en-IN': {
        primaryText: 'I understand you have a fever. Please stay hydrated with plenty of water and ORS, and get adequate rest.',
        followUpQuestion: 'How many days have you had this fever, and what is your temperature reading?',
        safetyGuidance: 'If the fever persists for more than 3 days or exceeds 102°F, please visit your nearest Primary Health Centre immediately.'
      }
    }
  },

  BREATHING_DIFFICULTY: {
    intent: 'BREATHING_DIFFICULTY',
    agentName: 'Emergency Triage Agent',
    isEmergency: true,
    templates: {
      'ta-IN': {
        primaryText: '⚠️ மூச்சுத்திணறல் உடனடியாக கவனிக்கப்பட வேண்டிய அவசர நிலை. பயப்படாமல் நேராக அமர்ந்து ஆழமாக சுவாசிக்க முயற்சிக்கவும்.',
        followUpQuestion: 'நெஞ்சு வலி அல்லது உதடுகள் நீல நிறமாதல் உள்ளதா?',
        safetyGuidance: 'உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும் அல்லது அருகில் உள்ள அரசு மருத்துவமனைக்கு தாமதிக்காமல் செல்லவும்.'
      },
      'te-IN': {
        primaryText: '⚠️ శ్వాస తీసుకోవడంలో ఇబ్బంది అత్యవసర పరిస్థితి. నిటారుగా కూర్చుని నెమ్మదిగా గాలి పీల్చుకోండి.',
        followUpQuestion: 'ఛాతీ నొప్పి లేదా పెదవులు నీలంగా మారడం వంటివి ఉన్నాయా?',
        safetyGuidance: 'వెంటనే 108 అంబులెన్స్‌కు కాల్ చేయండి లేదా సమీప ప్రభుత్వ ఆసుపత్రికి వెళ్లండి.'
      },
      'ml-IN': {
        primaryText: '⚠️ ശ്വാസംമുട്ടൽ അടിയന്തര വൈദ്യസഹായം ആവശ്യമുള്ള അവസ്ഥയാണ്. നേരെ ഇരുന്നു ശ്വാസമെടുക്കാൻ ശ്രമിക്കുക.',
        followUpQuestion: 'നെഞ്ചുവേദനയോ ചുണ്ടുകൾ നീലനിറമാകുന്നതോ ഉണ്ടോ?',
        safetyGuidance: 'ഉടൻ തന്നെ 108 ആംബുലൻസ് വിളിക്കുകയോ അടുത്തുള്ള ആശുപത്രിയിൽ എത്തുകയോ ചെയ്യുക.'
      },
      'kn-IN': {
        primaryText: '⚠️ ಉಸಿರಾಟದ ತೊಂದರೆ ತುರ್ತು ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿರುವ ಲಕ್ಷಣವಾಗಿದೆ. ನೇರವಾಗಿ ಕುಳಿತು ಶಾಂತವಾಗಿ ಉಸಿರಾಡಿ.',
        followUpQuestion: 'ಎದೆ ನೋವು ಅಥವಾ ತುಟಿಗಳು ನೀಲಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿವೆಯೇ?',
        safetyGuidance: 'ತಕ್ಷಣವೇ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆ ಮಾಡಿ ಅಥವಾ ಹತ್ತಿರದ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗೆ ತೆರಳಿ.'
      },
      'en-IN': {
        primaryText: '⚠️ Difficulty breathing is an urgent medical symptom. Please sit upright in a comfortable position.',
        followUpQuestion: 'Do you also have chest pain or bluish discolouration around lips?',
        safetyGuidance: 'Please call 108 Ambulance immediately or proceed to the nearest emergency healthcare facility.'
      }
    }
  },

  CHEST_PAIN: {
    intent: 'CHEST_PAIN',
    agentName: 'Emergency Triage Agent',
    isEmergency: true,
    templates: {
      'ta-IN': {
        primaryText: '🚨 நெஞ்சு வலி அவசர கவனம் தேவைப்படும் அறிகுறி. எவ்வித கடின வேலையும் செய்யாமல் ஓய்வாக அமரவும்.',
        followUpQuestion: 'இந்த வலி இடது கை, தாடை அல்லது முதுகிற்கு பரவுகிறதா?',
        safetyGuidance: 'உடனடியாக 108 அவசர ஊர்தியை அழையுங்கள். மருத்துவமனைக்கு நீங்களாக வாகனம் ஓட்ட வேண்டாம்.'
      },
      'te-IN': {
        primaryText: '🚨 ఛాతీ నొప్పి తక్షణ వైద్య సహాయం అవసరమయ్యే అత్యవసర లక్షణం. కదలకుండా విశ్రాంతిగా కూర్చోండి.',
        followUpQuestion: 'ఈ నొప్పి ఎడమ చేయి, దవడ లేదా వీపు వైపు వెళ్తోందా?',
        safetyGuidance: 'వెంటనే 108 అంబులెన్స్ కాల్ చేయండి. స్వయంగా డ్రైవ్ చేయవద్దు.'
      },
      'ml-IN': {
        primaryText: '🚨 നെഞ്ചുവേദന അതീവ ജാഗ്രത ആവശ്യമുള്ള അടിയന്തര ലക്ഷണമാണ്. ശാന്തമായി ഇരിക്കുക.',
        followUpQuestion: 'വേദന ഇടതുകൈയിലേക്കോ താടിയിലേക്കോ പടരുന്നുണ്ടോ?',
        safetyGuidance: 'ഉടൻ 108 ആംബുലൻസ് വിളിക്കുക. സ്വയം വാഹനം ഓടിക്കരുത്.'
      },
      'kn-IN': {
        primaryText: '🚨 ಎದೆ ನೋವು ತಕ್ಷಣದ ತುರ್ತು ಚಿಕಿತ್ಸೆ ಬಯಸುವ ಗಂಭೀರ ಲಕ್ಷಣವಾಗಿದೆ. ಶಾಂತರಾಗಿ ಕುಳಿತುಕೊಳ್ಳಿ.',
        followUpQuestion: 'ನೋವು ಎಡಗೈ ಅಥವಾ ದವಡೆಗೆ ಹರಡುತ್ತಿದೆಯೇ?',
        safetyGuidance: 'ತಕ್ಷಣ 108 ಕರೆ ಮಾಡಿ ಆಂಬ್ಯುಲೆನ್ಸ್ ತರಿಸಿ. ತಾವೇ ವಾಹನ ಚಲಾಯಿಸಬೇಡಿ.'
      },
      'en-IN': {
        primaryText: '🚨 Chest pain is a critical medical emergency. Please remain calm, sit upright and avoid physical exertion.',
        followUpQuestion: 'Does the pain radiate to your left arm, jaw, neck, or back?',
        safetyGuidance: 'Call 108 for an emergency ambulance immediately. Do not drive yourself.'
      }
    }
  },

  COUGH_COLD: {
    intent: 'COUGH_COLD',
    agentName: 'General Physician Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'சளி மற்றும் இருமலுக்கு வெதுவெதுப்பான நீர் அருந்தவும். துளசி, இஞ்சி தேநீர் மற்றும் நீராவி பிடித்தல் நன்மை தரும்.',
        followUpQuestion: 'இருமல் வறண்ட இருமலா அல்லது சளியுடன் வருகிறதா?',
        safetyGuidance: 'இருமல் ஒரு வாரத்திற்கு மேல் இருந்தாலோ அல்லது ரத்தம் வந்தாலோ சளி பரிசோதனை செய்து கொள்ள வேண்டும்.'
      },
      'te-IN': {
        primaryText: 'దగ్గు, జలుబుకు గోరువెచ్చని నీరు తాగండి. తులసి, అల్లం టీ మరియు ఆవిరి పట్టడం ఉపశమనం ఇస్తుంది.',
        followUpQuestion: 'పొడి దగ్గా లేదా కఫంతో కూడిన దగ్గా?',
        safetyGuidance: 'దగ్గు వారం రోజులకు మించి కొనసాగితే వెంటనే వైద్యుడిని సంప్రదించండి.'
      },
      'ml-IN': {
        primaryText: 'ചുമയ്ക്കും ജലദോഷത്തിനും ചെറുചൂടുവെള്ളം കുടിക്കുക. ഇഞ്ചി ചായയും ആവി പിടിക്കലും ആശ്വാസം നൽകും.',
        followUpQuestion: 'വരണ്ട ചുമയാണോ കഫക്കെട്ടോടെയാണോ വരുന്നത്?',
        safetyGuidance: 'ചുമ ഒരാഴ്ചയിൽ കൂടുതൽ നീണ്ടുനിന്നാൽ ഡോക്ടറെ കണ്ട് കഫപരിശോധന നടത്തുക.'
      },
      'kn-IN': {
        primaryText: 'ಕೆಮ್ಮು ಮತ್ತು ಶೀತಕ್ಕೆ ಬೆಚ್ಚಗಿನ ನೀರು ಕುಡಿಯಿರಿ. ಶುಂಠಿ ಚಹಾ ಮತ್ತು ಹಬೆ ತೆಗೆದುಕೊಳ್ಳುವುದು ಉಪಯುಕ್ತ.',
        followUpQuestion: 'ಒಣ ಕೆಮ್ಮೇ ಅಥವಾ ಕಫದೊಂದಿಗೆ ಬರುತ್ತಿದೆಯೇ?',
        safetyGuidance: 'ಕೆಮ್ಮು ಒಂದು ವಾರಕ್ಕಿಂತ ಹೆಚ್ಚು ಮುಂದುವರಿದರೆ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.'
      },
      'en-IN': {
        primaryText: 'For cough and cold, drink warm fluids, take steam inhalation and drink ginger tea with honey.',
        followUpQuestion: 'Is it a dry cough or accompanied by phlegm/mucus?',
        safetyGuidance: 'If the cough lasts longer than a week or is accompanied by chest tightness, consult a physician.'
      }
    }
  },

  STOMACH_PAIN: {
    intent: 'STOMACH_PAIN',
    agentName: 'General Physician Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'வயிற்று வலிக்கு காரமான உணவுகளை தவிர்த்து, மோர் அல்லது கஞ்சி போன்ற எளிதில் செரிக்கும் உணவுகளை உண்ணுங்கள்.',
        followUpQuestion: 'வயிற்றுப்போக்கு அல்லது வாந்தி உள்ளதா?',
        safetyGuidance: 'கடுமையான பொறுக்க முடியாத வலி அல்லது மலத்தில் ரத்தம் இருந்தால் தாமதிக்காமல் மருத்துவமனைக்கு செல்லவும்.'
      },
      'te-IN': {
        primaryText: 'కడుపు నొప్పి ఉన్నప్పుడు కారమైన ఆహారం మానేసి, మజ్జిగ లేదా గంజి వంటి తేలికపాటి ఆహారం తీసుకోండి.',
        followUpQuestion: 'వాంతులు లేదా విరేచనాలు కూడా ఉన్నాయా?',
        safetyGuidance: 'తీవ్రమైన భరించలేని నొప్పి లేదా మలంలో రక్తం కనిపిస్తే వెంటనే ఆసుపత్రికి వెళ్ళండి.'
      },
      'ml-IN': {
        primaryText: 'വയറുവേദനയ്ക്ക് എരിവുള്ള ഭക്ഷണം ഒഴിവാക്കി കഞ്ഞിയോ മോരോ പോലുള്ള ലളിതമായ ഭക്ഷണം കഴിക്കുക.',
        followUpQuestion: 'വയറിളക്കമോ ഛർദ്ദിയോ കൂടെയുണ്ടോ?',
        safetyGuidance: 'കഠിനമായ വേദനയോ മലത്തിൽ രക്തമോ കണ്ടാൽ ഉടനടി ആശുപത്രിയിൽ എത്തിക്കുക.'
      },
      'kn-IN': {
        primaryText: 'ಹೊಟ್ಟೆ ನೋವಿದ್ದಾಗ ಖಾರದ ಆಹಾರ ತ್ಯಜಿಸಿ, ಗಂಜಿ ಅಥವಾ ಮಜ್ಜಿಗೆಯಂತಹ ಲಘು ಆಹಾರ ಸೇವಿಸಿ.',
        followUpQuestion: 'ವಾಂತಿ ಅಥವಾ ಭೇದಿ ಕೂಡ ಆಗುತ್ತಿದೆಯೇ?',
        safetyGuidance: 'ತೀವ್ರವಾದ ಅತಿಯಾದ ನೋವು ಕಂಡುಬಂದರೆ ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.'
      },
      'en-IN': {
        primaryText: 'For stomach pain, avoid spicy or oily food. Drink buttermilk, rice gruel or ORS for hydration.',
        followUpQuestion: 'Do you also have loose stools or vomiting?',
        safetyGuidance: 'If the pain is severe and unremitting or accompanied by blood in stool, visit a hospital promptly.'
      }
    }
  },

  HEADACHE_DIZZINESS: {
    intent: 'HEADACHE_DIZZINESS',
    agentName: 'General Physician Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'தலைவலி மற்றும் தலைசுற்றலுக்கு அமைதியான இருண்ட அறையில் ஓய்வெடுக்கவும். ரத்த அழுத்தத்தை (BP) சரிபார்க்கவும்.',
        followUpQuestion: 'கண் பார்வை மங்குதல் அல்லது உடலின் ஒரு பக்கம் பலவீனம் உள்ளதா?',
        safetyGuidance: 'திடீரென தீவிர தலைவலி அல்லது ஒருபக்க பலவீனம் ஏற்பட்டால் உடனடியாக மருத்துவரை அணுகவும்.'
      },
      'te-IN': {
        primaryText: 'తలనొప్పి, కళ్ళు తిరగడానికి ప్రశాంతమైన గదిలో విశ్రాంతి తీసుకోండి. బీపీ పరీక్షించుకోండి.',
        followUpQuestion: 'కంటి చూపు మసకబారడం లేదా శరీరంలో ఒకవైపు బలహీనత ఉందా?',
        safetyGuidance: 'అకస్మాత్తుగా తీవ్రమైన తలనొప్పి వస్తే వెంటనే అత్యవసర చికిత్స పొందండి.'
      },
      'ml-IN': {
        primaryText: 'തലവേദനയ്ക്കും തലകറക്കത്തിനും ശാന്തമായ മുറിയിൽ വിശ്രമിക്കുക. രക്തസമ്മർദ്ദം (BP) പരിശോധിക്കുക.',
        followUpQuestion: 'കാഴ്ച മങ്ങലോ ശരീരത്തിന്റെ ഒരു വശത്ത് തളർച്ചയോ ഉണ്ടോ?',
        safetyGuidance: 'പെട്ടെന്ന് കഠിനമായ തലവേദനയോ സംസാരത്തിൽ ബുദ്ധിമുട്ടോ വന്നാൽ ഉടൻ ഡോക്ടറെ കാണുക.'
      },
      'kn-IN': {
        primaryText: 'ತಲೆನೋವು ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆಗೆ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಮತ್ತು ರಕ್ತದೊತ್ತಡ (BP) ಪರೀಕ್ಷಿಸಿಕೊಳ್ಳಿ.',
        followUpQuestion: 'ದೃಷ್ಟಿ ಮಂದವಾಗುವುದು ಅಥವಾ ದೇಹದ ಒಂದು ಬದಿಯಲ್ಲಿ ದೌರ್ಬಲ್ಯವಿದೆಯೇ?',
        safetyGuidance: 'ಹಠಾತ್ ತೀವ್ರ ತಲೆನೋವು ಕಾಣಿಸಿಕೊಂಡರೆ ತುರ್ತಾಗಿ ಆಸ್ಪತ್ರೆಗೆ ತೆರಳಿ.'
      },
      'en-IN': {
        primaryText: 'For headache and dizziness, rest in a quiet space and check your blood pressure reading.',
        followUpQuestion: 'Do you experience blurred vision or weakness on one side of your body?',
        safetyGuidance: 'Sudden severe "thunderclap" headache or facial drooping warrants immediate emergency care.'
      }
    }
  },

  MEDICINE_INQUIRY: {
    intent: 'MEDICINE_INQUIRY',
    agentName: 'General Physician Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'மருந்துகளை உங்கள் மருத்துவர் அல்லது ஆஷா பணியாளர் கூறிய அளவில் சரியான நேரத்தில் தவறாமல் உட்கொள்ளவும்.',
        followUpQuestion: 'நீங்கள் கேட்கும் குறிப்பிட்ட மாத்திரையின் பெயர் என்ன?',
        safetyGuidance: 'மருத்துவர் பரிந்துரைக்காத மருந்துகளை சொந்தமாக மாற்றி உட்கொள்ளக் கூடாது.'
      },
      'te-IN': {
        primaryText: 'మీ వైద్యులు లేదా ఆశా కార్యకర్త సూచించిన మోతాదులోనే మందులను సకాలంలో వేసుకోవాలి.',
        followUpQuestion: 'మీరు ఏ నిర్దిష్ట మందు గురించి తెలుసుకోవాలనుకుంటున్నారు?',
        safetyGuidance: 'డాక్టర్ సలహా లేకుండా మందుల మోతాదును మార్చవద్దు.'
      },
      'ml-IN': {
        primaryText: 'ഡോക്ടറോ ആശാ വർക്കറോ നിർദ്ദേശിച്ച കൃത്യമായ അളവിൽ മരുന്നുകൾ സമയത്തിന് കഴിക്കുക.',
        followUpQuestion: 'ഏത് മരുന്നിനെക്കുറിച്ചാണ് അറിയേണ്ടത്?',
        safetyGuidance: 'ഡോക്ടറുടെ നിർദ്ദേശമില്ലാതെ മരുന്നുകളുടെ അളവ് മാറ്റുകയോ നിർത്തുകയോ ചെയ്യരുത്.'
      },
      'kn-IN': {
        primaryText: 'ವೈದ್ಯರು ಅಥವಾ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರು ಸೂಚಿಸಿದ ಪ್ರಮಾಣದಲ್ಲಿ ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ಔಷಧಿ ಸೇವಿಸಿ.',
        followUpQuestion: 'ನೀವು ಯಾವ ನಿರ್ದಿಷ್ಟ ಔಷಧಿಯ ಬಗ್ಗೆ ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?',
        safetyGuidance: 'ವೈದ್ಯರ ಸಲಹೆಯಿಲ್ಲದೆ ಔಷಧಿಯ ಡೋಸ್ ಬದಲಾಯಿಸಬೇಡಿ.'
      },
      'en-IN': {
        primaryText: 'Please take your prescribed medicines on schedule as directed by your doctor or ASHA worker.',
        followUpQuestion: 'Which specific medicine from your records would you like details about?',
        safetyGuidance: 'Never alter your medicine dosage or discontinue prescribed treatment without medical consultation.'
      }
    }
  },

  PREGNANCY_CARE: {
    intent: 'PREGNANCY_CARE',
    agentName: 'Maternal Care Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'கர்ப்ப காலத்தில் போலிக் ஆசிட், இரும்புச்சத்து மாத்திரைகளை தவறாமல் உட்கொள்ளுங்கள். சத்தான உணவு மற்றும் போதுமான தூக்கம் அவசியம்.',
        followUpQuestion: 'கர்ப்பம் எத்தனையாவது வாரம் அல்லது மாதம் நடக்கிறது?',
        safetyGuidance: 'அதிக ரத்தப்போக்கு, கடுமையான தலைவலி, அல்லது குழந்தையின் அசைவு குறைவது தெரிந்தால் உடனடியாக மருத்துவமனைக்கு செல்லவும்.'
      },
      'te-IN': {
        primaryText: 'గర్భధారణ సమయంలో ఫోలిక్ యాసిడ్, ఐరన్ మాత్రలు క్రమం తప్పకుండా వాడండి. పోషకాహారం మరియు తగిన విశ్రాంతి తీసుకోండి.',
        followUpQuestion: 'ప్రస్తుతం ఎన్నో వారం లేదా నెల గడుస్తోంది?',
        safetyGuidance: 'అధిక రక్తస్రావం, తీవ్రమైన తలనొప్పి లేదా కడుపులో బిడ్డ కదలికలు తగ్గితే వెంటనే ఆసుపత్రికి వెళ్ళండి.'
      },
      'ml-IN': {
        primaryText: 'ഗർഭകാലത്ത് ഫോളിക് ആസിഡ്, അയൺ ഗുളികകൾ കൃത്യമായി കഴിക്കുക. പോഷകാഹാരവും മതിയായ വിശ്രമവും ഉറപ്പാക്കുക.',
        followUpQuestion: 'ഇപ്പോൾ ഗർഭത്തിന്റെ എത്രാമത്തെ ആഴ്ചയാണ് നടക്കുന്നത്?',
        safetyGuidance: 'രക്തസ്രാവം, കഠിനമായ തലവേദന, കുഞ്ഞിന്റെ അനക്കം കുറയൽ എന്നിവ ഉണ്ടായാൽ ഉടൻ ഡോക്ടറെ കാണുക.'
      },
      'kn-IN': {
        primaryText: 'ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ಫೋಲಿಕ್ ಆಸಿಡ್ ಮತ್ತು ಕಬ್ಬಿಣದ ಅಂಶದ ಮಾತ್ರೆಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಸೇವಿಸಿ. ಪೌಷ್ಟಿಕ ಆಹಾರ ತೆಗೆದುಕೊಳ್ಳಿ.',
        followUpQuestion: 'ಈಗ ಎಷ್ಟನೇ ವಾರ ಅಥವಾ ತಿಂಗಳು ನಡೆಯುತ್ತಿದೆ?',
        safetyGuidance: 'ಅತಿಯಾದ ರಕ್ತಸ್ರಾವ, ತೀವ್ರ ತಲೆನೋವು ಅಥವಾ ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾದರೆ ತಕ್ಷಣವೇ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.'
      },
      'en-IN': {
        primaryText: 'During pregnancy, take your daily Folic Acid and Iron supplements, eat nutritious meals and stay hydrated.',
        followUpQuestion: 'Which week of pregnancy are you currently in?',
        safetyGuidance: 'Watch for danger signs: heavy bleeding, severe headache, sudden swelling or decreased fetal movement.'
      }
    }
  },

  NEWBORN_CARE: {
    intent: 'NEWBORN_CARE',
    agentName: 'Newborn Care Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'பிறந்த குழந்தைக்கு முதல் 6 மாதங்களுக்கு தாய்ப்பால் மட்டுமே போதுமானது. குழந்தையை கதகதப்பாக வைத்திருக்கவும்.',
        followUpQuestion: 'குழந்தை சரியாக பால் குடிக்கிறதா? தொப்புள் கொடி காய்ந்து வருகிறதா?',
        safetyGuidance: 'குழந்தை பால் குடிக்காவிட்டாலோ, 100°F-க்கு மேல் காய்ச்சல் இருந்தாலோ அல்லது உடல் மஞ்சள் நிறமானாலோ மருத்துவரிடம் காட்டவும்.'
      },
      'te-IN': {
        primaryText: 'నవజాత శిశువుకు మొదటి 6 నెలలు తల్లిపాలు మాత్రమే ఇవ్వాలి. బిడ్డను వెచ్చగా ఉంచండి.',
        followUpQuestion: 'బిడ్డ పాలు సరిగ్గా తాగుతున్నాడా? బొడ్డు పరిశుభ్రంగా ఉందా?',
        safetyGuidance: 'బిడ్డ పాలు తాగకపోయినా, జ్వరం వచ్చినా లేదా శరీరం పసుపు రంగులోకి మారినా వెంటనే డాక్టర్ వద్దకు తీసుకెళ్లండి.'
      },
      'ml-IN': {
        primaryText: 'നവജാത ശിശുവിന് ആദ്യ 6 മാസം മുലപ്പാൽ മാത്രം നൽകുക. കുഞ്ഞിനെ ചൂടോടെ സൂക്ഷിക്കുക.',
        followUpQuestion: 'കുഞ്ഞ് പാൽ കുടിക്കുന്നുണ്ടോ? പൊക്കിൾക്കൊടി ഉണങ്ങുന്നുണ്ടോ?',
        safetyGuidance: 'കുഞ്ഞ് പാൽ കുടിക്കാതിരിക്കുകയോ, പനി വരികയോ, മഞ്ഞപ്പിത്ത ലക്ഷണം കാണുകയോ ചെയ്താൽ ഉടൻ ആശുപത്രിയിലെത്തിക്കുക.'
      },
      'kn-IN': {
        primaryText: 'ನವಜಾತ ಶಿಶುವಿಗೆ ಮೊದಲ 6 ತಿಂಗಳು ತಾಯಿ ಹಾಲು ಮಾತ್ರ ನೀಡಿ. ಮಗುವನ್ನು ಬೆಚ್ಚಗೆ ಇರಿಸಿ.',
        followUpQuestion: 'ಮಗು ಸರಿಯಾಗಿ ಹಾಲು ಕುಡಿಯುತ್ತಿದೆಯೇ?',
        safetyGuidance: 'ಮಗು ಹಾಲು ಕುಡಿಯದಿದ್ದರೆ, ಜ್ವರ ಅಥವಾ ಮೈ ಹಳದಿಯಾದರೆ ತಕ್ಷಣವೇ ವೈದ್ಯರಿಗೆ ತೋರಿಸಿ.'
      },
      'en-IN': {
        primaryText: 'Exclusive breastfeeding is recommended for the first 6 months. Keep the newborn warm and skin-to-skin.',
        followUpQuestion: 'Is the baby latching and feeding well every 2-3 hours?',
        safetyGuidance: 'Seek urgent care if the baby refuses to feed, has fever >100.4°F, jaundice, or rapid breathing.'
      }
    }
  },

  CHILD_CARE: {
    intent: 'CHILD_CARE',
    agentName: 'Pediatric Care Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'குழந்தைகளுக்கு சத்தான சரிவிகித உணவு, தூய்மையான குடிநீர் மற்றும் சரியான தடுப்பூசிகள் அவசியம்.',
        followUpQuestion: 'குழந்தையின் வயது என்ன? என்ன பிரச்சனை உள்ளது?',
        safetyGuidance: 'குழந்தைக்கு தொடர்ந்து வாந்தி, நீர்ச்சத்து குறைவு அல்லது அதிக காய்ச்சல் இருந்தால் மருத்துவரை அணுகவும்.'
      },
      'te-IN': {
        primaryText: 'పిల్లలకు పౌష్టికాహారం, పరిశుభ్రమైన నీరు మరియు సకాలంలో టీకాలు అందించడం ముఖ్యం.',
        followUpQuestion: 'పిల్లల వయస్సు ఎంత? ఎలాంటి సమస్య ఉంది?',
        safetyGuidance: 'తీవ్రమైన వాంతులు లేదా నీరసం కనిపిస్తే వెంటనే వైద్య సహాయం పొందండి.'
      },
      'ml-IN': {
        primaryText: 'കുട്ടികൾക്ക് സമീകൃതാഹാരം, ശുദ്ധജലം, കൃത്യസമയത്തുള്ള വാക്സിനേഷൻ എന്നിവ നൽകുക.',
        followUpQuestion: 'കുട്ടിയുടെ പ്രായം എത്രയാണ്? എന്താണ് അസ്വസ്ഥത?',
        safetyGuidance: 'തുടർച്ചയായ ഛർദ്ദിയോ നിർജ്ജലീകരണമോ ഉണ്ടെങ്കിൽ ഉടൻ ഡോക്ടറെ കാണിക്കുക.'
      },
      'kn-IN': {
        primaryText: 'ಮಕ್ಕಳಿಗೆ ಪೌಷ್ಟಿಕ ಆಹಾರ, ಶುದ್ಧ ಕುಡಿಯುವ ನೀರು ಮತ್ತು ನಿಗದಿತ ಲಸಿಕೆಗಳನ್ನು ನೀಡುವುದು ಅತ್ಯಗತ್ಯ.',
        followUpQuestion: 'ಮಗುವಿನ ವಯಸ್ಸು ಎಷ್ಟು? ಏನು ತೊಂದರೆಯಾಗಿದೆ?',
        safetyGuidance: 'ನಿರಂತರ ವಾಂತಿ ಅಥವಾ ತೀವ್ರ ಜ್ವರವಿದ್ದರೆ ಕೂಡಲೇ ವೈದ್ಯರ ಬಳಿಗೆ ಕರೆದೊಯ್ಯಿರಿ.'
      },
      'en-IN': {
        primaryText: 'Ensure your child receives balanced nutrition, clean water and all scheduled UIP immunizations.',
        followUpQuestion: 'How old is the child and what specific symptoms are they exhibiting?',
        safetyGuidance: 'Consult a pediatrician if the child shows signs of dehydration, prolonged fever, or lethargy.'
      }
    }
  },

  ELDERLY_CARE: {
    intent: 'ELDERLY_CARE',
    agentName: 'Elderly Care Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'முதியவர்கள் தங்கள் ரத்த அழுத்தம் மற்றும் சர்க்கரை அளவை தவறாமல் கண்காணிக்க வேண்டும். வீட்டில் வழுக்கி விழுவதை தவிர்க்க கைப்பிடிகள் பயன்படுத்தவும்.',
        followUpQuestion: 'அவர்களின் வயது என்ன? வழக்கமான மருந்துகளை எடுத்துக்கொண்டார்களா?',
        safetyGuidance: 'திடீர் நினைவிழப்பு, பக்கவாதம் போன்ற அறிகுறிகள் தெரிந்தால் உடனே அவசர சிகிச்சை பிரிவிற்கு செல்லவும்.'
      },
      'te-IN': {
        primaryText: 'వృద్ధులు తమ బీపీ, షుగర్ స్థాయిలను క్రమం తప్పకుండా పరీక్షించుకోవాలి. ఇంట్లో జారిపడకుండా జాగ్రత్తలు తీసుకోండి.',
        followUpQuestion: 'వారి వయస్సు ఎంత? రోజూ వేసుకునే మందులు వేశారా?',
        safetyGuidance: 'అకస్మాత్తుగా బలహీనత లేదా మాట తడబాటు వస్తే వెంటనే ఆసుపత్రికి చేర్చండి.'
      },
      'ml-IN': {
        primaryText: 'മുതിർന്നവർ രക്തസമ്മർദ്ദവും ഷുഗറും കൃത്യമായി പരിശോധിക്കുകയും വീഴ്ചകൾ ഒഴിവാക്കാൻ ശ്രദ്ധിക്കുകയും വേണം.',
        followUpQuestion: 'അവരുടെ പ്രായം എത്രയാണ്? പതിവ് മരുന്നുകൾ കഴിച്ചിട്ടുണ്ടോ?',
        safetyGuidance: 'പെട്ടെന്ന് സംസാരത്തിൽ കുഴച്ചിലോ തളർച്ചയോ കണ്ടാൽ ഉടനടി അത്യാഹിത വിഭാഗത്തിൽ എത്തിക്കുക.'
      },
      'kn-IN': {
        primaryText: 'ಹಿರಿಯರು ಬಿಪಿ ಮತ್ತು ಸಕ್ಕರೆ ಪ್ರಮಾಣವನ್ನು ನಿಯಮಿತವಾಗಿ ಪರೀಕ್ಷಿಸಬೇಕು ಮತ್ತು ಬೀಳದಂತೆ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಬೇಕು.',
        followUpQuestion: 'ಅವರ ವಯಸ್ಸು ಎಷ್ಟು? ದಿನನಿತ್ಯದ ಮಾತ್ರೆಗಳನ್ನು ತೆಗೆದುಕೊಂಡಿದ್ದಾರಾ?',
        safetyGuidance: 'ಹಠಾತ್ ನಿಶ್ಯಕ್ತಿ ಅಥವಾ ಪ್ರಜ್ಞಾಹೀನತೆ ಕಂಡುಬಂದರೆ ತಕ್ಷಣವೇ ಆಸ್ಪತ್ರೆಗೆ ಕೊಂಡೊಯ್ಯಿರಿ.'
      },
      'en-IN': {
        primaryText: 'Elderly individuals should monitor blood pressure and sugar levels regularly and ensure fall-prevention measures at home.',
        followUpQuestion: 'What is their age and have they taken their routine prescribed medications today?',
        safetyGuidance: 'Seek emergency care for sudden weakness, confusion, or loss of mobility.'
      }
    }
  },

  DIABETES_CARE: {
    intent: 'DIABETES_CARE',
    agentName: 'Diabetes Care Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'சர்க்கரை நோய்க்கு குறைந்த மாவுச்சத்து உணவு, தினசரி நடைப்பயிற்சி மற்றும் குறித்த நேரத்தில் மருந்துகள் அவசியம்.',
        followUpQuestion: 'கடைசியாக பரிசோதித்த சர்க்கரை அளவு (Blood Sugar) எவ்வளவு?',
        safetyGuidance: 'ரத்த சர்க்கரை 70-க்கு கீழ் குறைந்தாலோ அல்லது 300-க்கு மேல் சென்றாலோ உடனடியாக மருத்துவரை அணுகவும்.'
      },
      'te-IN': {
        primaryText: 'మధుమేహం ఉన్నవారు తక్కువ కార్బోహైడ్రేట్లు గల ఆహారం తీసుకోవాలి, రోజూ నడవాలి మరియు సమయానికి మందులు వేసుకోవాలి.',
        followUpQuestion: 'చివరిసారి పరీక్షించిన షుగర్ రీడింగ్ ఎంత?',
        safetyGuidance: 'షుగర్ లెవెల్ 70 కంటే తగ్గినా లేదా 300 దాటినా వెంటనే వైద్యుడిని సంప్రదించండి.'
      },
      'ml-IN': {
        primaryText: 'പ്രമേഹമുള്ളവർ കൃത്യമായ ഭക്ഷണക്രമം പാലിക്കുകയും ദിവസവും നടക്കുകയും മരുന്നുകൾ കൃത്യമായി കഴിക്കുകയും വേണം.',
        followUpQuestion: 'അവസാനം പരിശോധിച്ച ഷുഗർ ലെവൽ എത്രയായിരുന്നു?',
        safetyGuidance: 'ഷുഗർ 70-ൽ താഴുകയോ 300-ൽ കൂടുകയോ ചെയ്താൽ ഉടൻ ഡോക്ടറുടെ സഹായം തേടുക.'
      },
      'kn-IN': {
        primaryText: 'ಮಧುಮೇಹಿಗಳು ಸಕ್ಕರೆ ರಹಿತ ಸಮತೋಲಿತ ಆಹಾರ ಸೇವಿಸಬೇಕು ಮತ್ತು ಪ್ರತಿದಿನ ವಾಕಿಂಗ್ ಮಾಡಬೇಕು.',
        followUpQuestion: 'ಕೊನೆಯ ಬಾರಿ ಪರೀಕ್ಷಿಸಿದ ಸಕ್ಕರೆ ಅಂಶ (Blood Sugar) ಎಷ್ಟಿತ್ತು?',
        safetyGuidance: 'ಶುಗರ್ 70 ಕ್ಕಿಂತ ಕಡಿಮೆಯಾದರೆ ಅಥವಾ 300 ಕ್ಕಿಂತ ಹೆಚ್ಚಾದರೆ ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.'
      },
      'en-IN': {
        primaryText: 'For diabetes management, maintain a low-glycemic diet, engage in 30 minutes of walking daily, and adhere to medication.',
        followUpQuestion: 'What was your most recent fasting or post-meal blood sugar reading?',
        safetyGuidance: 'Beware of hypoglycemia (sugar < 70 mg/dL with sweating/tremors) or severe hyperglycemia (>300 mg/dL).'
      }
    }
  },

  NUTRITION_CARE: {
    intent: 'NUTRITION_CARE',
    agentName: 'Nutrition Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'ஆரோக்கியமான உடலுக்கு கீரை வகைகள், பருப்பு, முட்டை, காய்கறிகள் மற்றும் போதுமான நீர் அருந்துவது அவசியம்.',
        followUpQuestion: 'யாருக்கான ஊட்டச்சத்து ஆலோசனை தேவைப்படுகிறது (குழந்தை / கர்ப்பிணி / பெரியவர்)?',
        safetyGuidance: 'ரத்த சோகை (அனீமியா) இருந்தால் முருங்கைக்கீரை, பேரீச்சம்பழம் மற்றும் இரும்புச்சத்து உணவுகளை சேர்க்கவும்.'
      },
      'te-IN': {
        primaryText: 'మంచి ఆరోగ్యం కోసం ఆకుకూరలు, పప్పులు, గుడ్లు, తాజా కూరగాయలు మరియు తగినంత నీరు తీసుకోండి.',
        followUpQuestion: 'ఎవరికి పోషకాహార సలహా కావాలి (పిల్లలు / గర్భిణులు / పెద్దవారు)?',
        safetyGuidance: 'రక్తహీనత ఉంటే మునగాకు, ఖర్జూరం, బెల్లం వంటి ఐరన్ ఎక్కువగా ఉండే ఆహారం తినండి.'
      },
      'ml-IN': {
        primaryText: 'ആരോഗ്യത്തിന് ഇലക്കറികൾ, പയറുവർഗ്ഗങ്ങൾ, മുട്ട, പച്ചക്കറികൾ എന്നിവ ഭക്ഷണത്തിൽ ഉൾപ്പെടുത്തുക.',
        followUpQuestion: 'ആർക്കുള്ള പോഷകാഹാര നിർദ്ദേശമാണ് ആവശ്യം?',
        safetyGuidance: 'വിളർച്ച തടയാൻ മുരിങ്ങയില, ഈന്തപ്പഴം, ശർക്കര എന്നിവ കഴിക്കുക.'
      },
      'kn-IN': {
        primaryText: 'ಉತ್ತಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ ಸೊಪ್ಪು, ಕಾಳುಗಳು, ಮೊಟ್ಟೆ ಮತ್ತು ಹಸಿರು ತರಕಾರಿಗಳನ್ನು ಆಹಾರದಲ್ಲಿ ಬಳಸಿ.',
        followUpQuestion: 'ಯಾರ ಪೌಷ್ಟಿಕಾಂಶದ ಮಾಹಿತಿ ಬೇಕು (ಮಗು / ಗರ್ಭಿಣಿ / ವೃದ್ಧರು)?',
        safetyGuidance: 'ರಕ್ತಹೀನತೆ ಇದ್ದರೆ ನುಗ್ಗೆಸೊಪ್ಪು, ಖರ್ಜೂರ ಮತ್ತು ಬೆಲ್ಲದಂತಹ ಕಬ್ಬಿಣಾಂಶದ ಆಹಾರ ಸೇವಿಸಿ.'
      },
      'en-IN': {
        primaryText: 'A balanced rural diet includes green leafy vegetables, lentils, eggs, local millets and adequate clean water.',
        followUpQuestion: 'Who requires this nutritional guidance (child, pregnant mother, or adult)?',
        safetyGuidance: 'To combat anemia, consume iron-rich foods like moringa leaves, jaggery, dates and pulses.'
      }
    }
  },

  VACCINATION_INQUIRY: {
    intent: 'VACCINATION_INQUIRY',
    agentName: 'Pediatric Care Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'அரசு யு.ஐ.பி (UIP) அட்டவணைப்படி அனைத்து தடுப்பூசிகளும் அரசு ஆரம்ப சுகாதார நிலையங்களில் இலவசமாக போடப்படுகின்றன.',
        followUpQuestion: 'குழந்தையின் வயது என்ன? இதுவரை என்னென்ன தடுப்பூசிகள் போடப்பட்டுள்ளன?',
        safetyGuidance: 'பிறந்த குழந்தைக்கு பிசிஜி, போலியோ (OPV), ஹெபடைடிஸ் பி ஆகிய தடுப்பூசிகள் பிறப்பின்போதே வழங்கப்பட வேண்டும்.'
      },
      'te-IN': {
        primaryText: 'ప్రభుత్వ యూఐపీ (UIP) షెడ్యూల్ ప్రకారం అన్ని టీకాలు ప్రభుత్వ ప్రాథమిక ఆరోగ్య కేంద్రాల్లో ఉచితంగా లభిస్తాయి.',
        followUpQuestion: 'పిల్లల వయస్సు ఎంత? ఇప్పటివరకు ఏ టీకాలు వేశారు?',
        safetyGuidance: 'పుట్టిన వెంటనే బిసిజి, పోలియో చుక్కలు, హెపటైటిస్ బి టీకాలు వేయించాలి.'
      },
      'ml-IN': {
        primaryText: 'സർക്കാർ യുഐപി (UIP) പദ്ധതി പ്രകാരം എല്ലാ പ്രതിരോധ കുത്തിവയ്പ്പുകളും പി.എച്ച്.സികളിൽ തികച്ചും സൗജന്യമാണ്.',
        followUpQuestion: 'കുട്ടിയുടെ പ്രായം എത്രയാണ്? ഏതൊക്കെ വാക്സിനുകൾ എടുത്തു?',
        safetyGuidance: 'ജനനസമയത്ത് തന്നെ ബി.സി.ജി, പോളിയോ തുള്ളിമരുന്ന്, ഹെപ്പറ്റൈറ്റിസ് ബി എന്നിവ നൽകണം.'
      },
      'kn-IN': {
        primaryText: 'ಸರ್ಕಾರದ ಯುಐಪಿ (UIP) ವೇಳಾಪಟ್ಟಿಯಂತೆ ಎಲ್ಲಾ ಲಸಿಕೆಗಳು ಸರ್ಕಾರಿ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳಲ್ಲಿ ಉಚಿತವಾಗಿ ಸಿಗುತ್ತವೆ.',
        followUpQuestion: 'ಮಗುವಿನ ವಯಸ್ಸು ಎಷ್ಟು? ಇದುವರೆಗೆ ಯಾವ ಲಸಿಕೆಗಳನ್ನು ಹಾಕಿಸಲಾಗಿದೆ?',
        safetyGuidance: 'ಜನನದ ಸಮಯದಲ್ಲಿ ಬಿಸಿಜಿ, ಪೋಲಿಯೋ ಹನಿಗಳು ಮತ್ತು ಹೆಪಟೈಟಿಸ್ ಬಿ ಲಸಿಕೆ ಹಾಕಿಸಬೇಕು.'
      },
      'en-IN': {
        primaryText: 'All essential vaccines under the Universal Immunization Programme (UIP) are provided free of cost at Govt PHCs.',
        followUpQuestion: 'What is the child\'s age and which vaccines have been administered so far?',
        safetyGuidance: 'Birth doses of BCG, OPV-0, and Hepatitis B must be given immediately after birth.'
      }
    }
  },

  EMERGENCY_TRIAGE: {
    intent: 'EMERGENCY_TRIAGE',
    agentName: 'Emergency Triage Agent',
    isEmergency: true,
    templates: {
      'ta-IN': {
        primaryText: '🚨 இது அவசர மருத்துவ சூழலாக தெரிகிறது. உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும் அல்லது அருகில் உள்ள அரசு மருத்துவமனைக்கு செல்லவும்.',
        followUpQuestion: 'பாதிக்கப்பட்டவர் சுயநினைவுடன் உள்ளாரா? மூச்சு விடுகிறாரா?',
        safetyGuidance: 'பாதிக்கப்பட்ட நபருக்கு உணவு அல்லது நீர் கொடுக்க வேண்டாம். அமைதியாக படுக்க வைக்கவும்.'
      },
      'te-IN': {
        primaryText: '🚨 ఇది అత్యవసర వైద్య పరిస్థితిగా కనిపిస్తోంది. వెంటనే 108 అంబులెన్స్‌ను పిలవండి లేదా ఆసుపత్రికి వెళ్ళండి.',
        followUpQuestion: 'బాధితుడు స్పృహలో ఉన్నాడా? ఊపిరి ఆడుతోందా?',
        safetyGuidance: 'స్పృహ లేని వ్యక్తికి ఆహారం లేదా నీరు ఇవ్వవద్దు. నిశ్చలంగా పడుకోబెట్టండి.'
      },
      'ml-IN': {
        primaryText: '🚨 ഇത് അടിയന്തര വൈദ്യസഹായം ആവശ്യമുള്ള സാഹചര്യമാണ്. ഉടൻ 108 ആംബുലൻസ് വിളിക്കുക.',
        followUpQuestion: 'വ്യക്തിക്ക് ബോധമുണ്ടോ? ശ്വാസമെടുക്കുന്നുണ്ടോ?',
        safetyGuidance: 'ബോധമില്ലാത്തയാൾക്ക് വെള്ളമോ ഭക്ഷണമോ നൽകരുത്. ആളെ ശാന്തമായി കിടത്തുക.'
      },
      'kn-IN': {
        primaryText: '🚨 ಇದು ತಕ್ಷಣದ ತುರ್ತು ಚಿಕಿತ್ಸೆ ಅಗತ್ಯವಿರುವ ಪರಿಸ್ಥಿತಿಯಾಗಿದೆ. ತಕ್ಷಣ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.',
        followUpQuestion: 'ರೋಗಿಗೆ ಪ್ರಜ್ಞೆ ಇದೆಯೇ? ಉಸಿರಾಡುತ್ತಿದ್ದಾರೆಯೇ?',
        safetyGuidance: 'ಪ್ರಜ್ಞೆ ಇಲ್ಲದವರಿಗೆ ನೀರು ಅಥವಾ ಆಹಾರ ನೀಡಬೇಡಿ. ಅವರನ್ನು ಮಲಗಿಸಿ ವಿಶ್ರಾಂತಿ ಕೊಡಿ.'
      },
      'en-IN': {
        primaryText: '🚨 This appears to be a medical emergency. Please call 108 Ambulance immediately or rush to the nearest hospital.',
        followUpQuestion: 'Is the person conscious, responsive and breathing normally?',
        safetyGuidance: 'Do not administer oral fluids to an unconscious person. Keep the airway clear and stay calm.'
      }
    }
  },

  GENERAL_HEALTH: {
    intent: 'GENERAL_HEALTH',
    agentName: 'General Physician Agent',
    isEmergency: false,
    templates: {
      'ta-IN': {
        primaryText: 'வணக்கம், உங்கள் உடல்நலக் குறிப்பை கவனித்தேன். போதுமான ஓய்வு, சுத்தமான நீர் மற்றும் சத்தான உணவு எடுத்துக் கொள்ளுங்கள்.',
        followUpQuestion: 'உங்களுக்கு என்ன விதமான உடல்நலக் கோளாறு அல்லது அறிகுறிகள் உள்ளது என்பதை விரிவாகக் கூறுங்கள்?',
        safetyGuidance: 'தொடக்க நிலை அறிகுறிகள் நீடித்தால் உங்கள் கிராமத்து ஆஷா பணியாளர் அல்லது மருத்துவரிடம் பரிசோதித்துக் கொள்ளுங்கள்.'
      },
      'te-IN': {
        primaryText: 'నమస్కారం, మీ ఆరోగ్య విషయాన్ని అర్థం చేసుకున్నాను. తగిన విశ్రాంతి, స్వచ్ఛమైన నీరు మరియు పోషకాహారం తీసుకోండి.',
        followUpQuestion: 'మీకు ఎలాంటి ఆరోగ్య సమస్య లేదా లక్షణాలు ఉన్నాయో వివరంగా చెప్పండి?',
        safetyGuidance: 'సమస్య తగ్గకపోతే మీ గ్రామ ఆశా కార్యకర్తను లేదా వైద్యుడిని సంప్రదించండి.'
      },
      'ml-IN': {
        primaryText: 'നമസ്കാരം, നിങ്ങളുടെ ആരോഗ്യ വിവരം ശ്രദ്ധിച്ചു. ആവശ്യത്തിന് വിശ്രമവും ശുദ്ധജലവും പോഷകാഹാരവും കഴിക്കുക.',
        followUpQuestion: 'നിങ്ങൾക്ക് എന്ത് രോഗലക്ഷണമാണ് ഉള്ളതെന്ന് വിശദമായി പറയാമോ?',
        safetyGuidance: 'ലക്ഷണങ്ങൾ നീണ്ടുനിൽക്കുകയാണെങ്കിൽ ആശാ വർക്കറെയോ ഡോക്ടറെയോ കണ്ട് ഉപദേശം തേടുക.'
      },
      'kn-IN': {
        primaryText: 'ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಆರೋಗ್ಯದ ಮಾಹಿತಿಯನ್ನು ಗಮನಿಸಿದ್ದೇನೆ. ಉತ್ತಮ ವಿಶ್ರಾಂತಿ, ಶುದ್ಧ ನೀರು ಮತ್ತು ಪೌಷ್ಟಿಕ ಆಹಾರ ಸೇವಿಸಿ.',
        followUpQuestion: 'ನಿಮಗೆ ಯಾವ ರೀತಿಯ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಅಥವಾ ಲಕ್ಷಣಗಳಿವೆ ಎಂದು ವಿವರವಾಗಿ ತಿಳಿಸಿ?',
        safetyGuidance: 'ತೊಂದರೆ ಮುಂದುವರಿದರೆ ನಿಮ್ಮ ಗ್ರಾಮದ ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ಅಥವಾ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.'
      },
      'en-IN': {
        primaryText: 'Hello, I have noted your health query. Please ensure adequate rest, hydration and wholesome nutrition.',
        followUpQuestion: 'Could you describe your specific symptoms or health concern in a bit more detail?',
        safetyGuidance: 'If mild symptoms persist for more than a couple of days, please consult your local ASHA worker or PHC doctor.'
      }
    }
  }
};

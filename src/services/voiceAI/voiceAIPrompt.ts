/**
 * Medora Voice AI Prompts & Templates
 * Strict isolation: Voice AI NEVER diagnoses or medically evaluates.
 */

export const VOICE_AI_SYSTEM_INSTRUCTION = `You are Medora Voice AI, a friendly and polite voice assistant for the Medora rural healthcare platform.
Your ONLY role is:
1. Normal conversation, polite greetings, casual interaction.
2. Explaining how to use the Medora application and accessibility assistance.
3. Helping the user navigate (e.g. telling them where medicines, appointments, or reports are located).
4. Providing general platform help.

SAFETY RULES:
- You are NOT a doctor and NOT the Medical AI.
- You must NEVER diagnose, evaluate symptoms, recommend medicines, adjust dosage, or analyze medical reports or X-rays.
- If the user asks a medical or clinical question (e.g., "What disease do I have?", "I have fever", "Analyze my report"), politely reply:
  "I can help you communicate with Medora, but medical assessment is handled by Medora Medical AI. Would you like to open the medical assistant?"
- Keep all responses friendly, brief (1-3 sentences), natural, and conversational.
`;

export const VOICE_AI_LOCAL_RESPONSES: Record<string, { en: string; ta: string; hi: string; te: string; ml: string; kn: string }> = {
  greeting: {
    en: "Hello! How can I help you with Medora today?",
    ta: "வணக்கம்! இன்று மெடோராவில் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    hi: "नमस्ते! आज मैं मेडोरा में आपकी क्या मदद कर सकता हूँ?",
    te: "నమస్కారం! ఈరోజు మెడోరాలో నేను మీకు ఎలా సహాయపడగలను?",
    ml: "നമസ്കാരം! ഇന്ന് മെഡോറയിൽ ഞാൻ എങ്ങനെ സഹായിക്കാം?",
    kn: "ನಮಸ್ಕಾರ! ಇಂದು ಮೆಡೋರಾದಲ್ಲಿ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
  },
  howAreYou: {
    en: "I'm doing well, thank you! How can I help you today?",
    ta: "நான் நன்றாக இருக்கிறேன், நன்றி! இன்று உங்களுக்கு என்ன உதவி வேண்டும்?",
    hi: "मैं ठीक हूँ, धन्यवाद! आज मैं आपकी क्या सहायता करूँ?",
    te: "నేను బాగున్నాను, ధన్యవాదాలు! ఈరోజు మీకు ఏ విధంగా సహాయపడాలి?",
    ml: "ഞാൻ സുഖമായിരിക്കുന്നു, നന്ദി! ഇന്ന് എന്താണ് സഹായം വേണ്ടത്?",
    kn: "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದಗಳು! ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
  },
  thankYou: {
    en: "You're very welcome! Feel free to ask if you need anything else.",
    ta: "மிக்க மகிழ்ச்சி! மேலும் உதவி தேவைப்பட்டால் தயங்காமல் கேளுங்கள்.",
    hi: "आपका स्वागत है! यदि आपको और सहायता चाहिए तो अवश्य बताएं।",
    te: "స్వాగతం! మీకు ఇంకా ఏదైనా సహాయం కావాలంటే అడగండి.",
    ml: "സ്വാഗതം! കൂടുതൽ സഹായം ആവശ്യമുണ്ടെങ്കിൽ ചോദിക്കൂ.",
    kn: "ಸ್ವಾಗತ! ಇನ್ನೇನಾದರೂ ಸಹಾಯ ಬೇಕಿದ್ದರೆ ಕೇಳಿ.",
  },
  whatIsMedora: {
    en: "Medora is your rural health companion, designed to work offline and connect you with doctors, medicines, and healthcare.",
    ta: "மெடோரா என்பது ஆஃப்லைனிலும் செயல்பட்டு மருத்துவர்கள், மருந்துகள் மற்றும் சுகாதார சேவைகளை இணைக்கும் உங்கள் கிராமப்புற சுகாதார துணை.",
    hi: "मेडोरा आपका ग्रामीण स्वास्थ्य साथी है, जो बिना इंटरनेट भी काम करता है और आपको डॉक्टरों, दवाइयों और स्वास्थ्य सेवाओं से जोड़ता है।",
    te: "మెడోరా మీ గ్రామీణ ఆరోగ్య సహచరుడు, ఇది ఇంటర్నెట్ లేకపోయినా పనిచేస్తుంది మరియు వైద్యులు, మందులతో మిమ్మల్ని కలుపుతుంది.",
    ml: "മെഡോറ നിങ്ങളുടെ ഗ്രാമീണ ആരോഗ്യ സഹായിയാണ്, ഇത് ഓഫ്‌ലൈനിലും പ്രവർത്തിക്കുകയും ഡോക്ടർമാരുമായി ബന്ധിപ്പിക്കുകയും ചെയ്യുന്നു.",
    kn: "ಮೆಡೋರಾ ನಿಮ್ಮ ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಒಡನಾಡಿ, ಇದು ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ ಮತ್ತು ವೈದ್ಯರು ಹಾಗೂ ಔಷಧಿಗಳೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ.",
  },
  howToUploadReport: {
    en: "You can open Medical Reports and tap 'Upload Report' or use Report Scanner to scan your paper documents.",
    ta: "மருத்துவ அறிக்கைகள் பக்கத்தை திறந்து 'அறிக்கை பதிவேற்று' என்பதை அழுத்தவும் அல்லது ரிப்போர்ட் ஸ்கேனரை பயன்படுத்தவும்.",
    hi: "आप मेडिकल रिकॉर्ड खोलकर 'रिपोर्ट अपलोड करें' चुन सकते हैं या रिपोर्ट स्कैनर से पर्ची स्कैन कर सकते हैं।",
    te: "మీరు వైద్య రికార్డులను తెరిచి 'నివేదిక అప్‌లోడ్ చేయి' ఎంచుకోవచ్చు లేదా రిపోర్ట్ స్కానర్ ఉపయోగించవచ్చు.",
    ml: "നിങ്ങൾക്ക് മെഡിക്കൽ റെക്കോർഡുകൾ തുറന്ന് 'റിപ്പോർട്ട് അപ്‌ലോഡ് ചെയ്യുക' തിരഞ്ഞെടുക്കാം അല്ലെങ്കിൽ റിപ്പോർട്ട് സ്കാനർ ഉപയോഗിക്കാം.",
    kn: "ನೀವು ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ತೆರೆದು 'ವರದಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' ಆಯ್ಕೆ ಮಾಡಬಹುದು ಅಥವಾ ವರದಿ ಸ್ಕ್ಯಾನರ್ ಬಳಸಬಹುದು.",
  },
  medicalTransferNotice: {
    en: "I can help you communicate with Medora, but medical assessment is handled by Medora Medical AI. Would you like to open the medical assistant?",
    ta: "நான் மெடோராவை பயன்படுத்த உதவ முடியும், ஆனால் மருத்துவ ஆய்வு மெடோரா மெடிக்கல் AI-ஆல் கையாளப்படுகிறது. மருத்துவ உதவியாளரை திறக்கவா?",
    hi: "मैं मेडोरा के उपयोग में मदद कर सकता हूँ, लेकिन स्वास्थ्य और चिकित्सीय विश्लेषण मेडोरा मेडिकल AI करता है। क्या आप मेडिकल सहायक खोलना चाहते हैं?",
    te: "నేను మెడోరాను ఉపయోగించడంలో సహాయపడతాను, కానీ వైద్య అంచనాను మెడోరా మెడికల్ AI నిర్వహిస్తుంది. మీరు మెడికల్ అసిస్టెంట్‌ని తెరవాలనుకుంటున్నారా?",
    ml: "മെഡോറ ഉപയോഗിക്കാൻ സഹായിക്കാം, എന്നാൽ വൈദ്യശാസ്ത്രപരമായ പരിശോധന മെഡോറ മെഡിക്കൽ AI ആണ് ചെയ്യുന്നത്. മെഡിക്കൽ സഹായി തുറക്കണോ?",
    kn: "ಮೆಡೋರಾ ಬಳಸಲು ನಾನು ನೆರವಾಗಬಲ್ಲೆ, ಆದರೆ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನವನ್ನು ಮೆಡೋರಾ ಮೆಡಿಕಲ್ AI ನಿರ್ವಹಿಸುತ್ತದೆ. ವೈದ್ಯಕೀಯ ಸಹಾಯಕವನ್ನು ತೆರೆಯಬೇಕೆ?",
  }
};

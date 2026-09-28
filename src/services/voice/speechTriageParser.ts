/**
 * Web Speech Symptom Triage Parser for Medora
 * Parses natural language spoken symptom transcripts in English and Indian languages
 * into structured clinical triage inputs.
 */

export interface ParsedVoiceTriage {
  rawTranscript: string;
  detectedSymptoms: string[];
  detectedDuration?: string;
  detectedSeverity?: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  isEmergency: boolean;
  emergencyReason?: string;
  chiefComplaintSummary: string;
}

interface SymptomRule {
  symptom: string;
  patterns: RegExp[];
  isRedFlag?: boolean;
}

const SYMPTOM_RULES: SymptomRule[] = [
  {
    symptom: 'Chest pain',
    patterns: [
      /\b(chest pain|chest tightness|chest pressure|crushing chest|heavy chest|angina|heart pain)\b/i,
      /நெஞ்சு\s*வலி|மாரடைப்பு/,
      /सीने\s*में\s*दर्द|छाती\s*में\s*दर्द|हृदय\s*दर्द/,
      /ఛాతీ\s*నొప్పి/,
      /നെഞ്ചുവേദന/,
      /ಎದೆ\s*ನೋವು/,
    ],
    isRedFlag: true,
  },
  {
    symptom: 'Breathing difficulty',
    patterns: [
      /\b(breath|breathing difficulty|shortness of breath|cannot breathe|can't breathe|hard to breathe|gasping|wheezing|asthma|dyspnea)\b/i,
      /மூச்சுத்\s*திணறல்|மூச்சு\s*விட\s*முடியவில்லை/,
      /सांस\s*लेने\s*में\s*तकलीफ|सांस\s*फूलना|दम\s*घुटना/,
      /శ్వాస\s*తీసుకోవడంలో\s*ఇబ్బంది/,
      /ശ്വാസതടസ്സം/,
      /ಉಸಿರಾಟದ\s*ತೊಂದರೆ/,
    ],
    isRedFlag: true,
  },
  {
    symptom: 'Fever',
    patterns: [
      /\b(fever|high fever|temperature|chills|shivering|pyrexia|burning up|febrile)\b/i,
      /காய்ச்சல்|குளிர்\s*காய்ச்சல்/,
      /बुखार|ताप|ठंड\s*लगना/,
      /జ్వరం|చలి\s*జ్వరం/,
      /പനി/,
      /ಜ್ವರ/,
    ],
  },
  {
    symptom: 'Cough',
    patterns: [
      /\b(cough|coughing|phlegm|sputum|dry cough|wet cough|throat mucus)\b/i,
      /இருமல்|சளி/,
      /खांसी|कफ|बलगम/,
      /దగ్గు/,
      /ചുമ/,
      /ಕೆಮ್ಮು/,
    ],
  },
  {
    symptom: 'Headache',
    patterns: [
      /\b(headache|migraine|head pain|throbbing head|head ache)\b/i,
      /தலைவலி|ஒற்றைத்\s*தலைவலி/,
      /सिरदर्द|सिर\s*में\s*दर्द/,
      /తలనొప్పి/,
      /തലവേദന/,
      /ತಲೆನೋವು/,
    ],
  },
  {
    symptom: 'Stomach pain',
    patterns: [
      /\b(stomach pain|abdominal pain|belly ache|tummy pain|cramps|stomach ache|gastric pain)\b/i,
      /வயிறு\s*வலி|வயிற்று\s*வலி/,
      /पेट\s*दर्द|पेट\s*में\s*दर्द/,
      /కడుపు\s*నొప్పి/,
      /വയറുവേദന/,
      /ಹೊಟ್ಟೆ\s*ನೋವು/,
    ],
  },
  {
    symptom: 'Vomiting',
    patterns: [
      /\b(vomit|vomiting|throwing up|nausea|nauseous|puke|puking)\b/i,
      /வாந்தி|குமட்டல்/,
      /उल्टी|जी\s*मिचलाना|कै/,
      /వాంతులు/,
      /ഛർദ്ദി/,
      /ವಾಂತಿ/,
    ],
  },
  {
    symptom: 'Diarrhea',
    patterns: [
      /\b(diarrhea|loose motion|loose stools|dysentery|watery stool)\b/i,
      /வயிற்றுப்போக்கு/,
      /दस्त|पेचिश|पतले\s*दस्त/,
      /విరేచనాలు/,
      /വയറിളക്കം/,
      /ಭೇದಿ/,
    ],
  },
  {
    symptom: 'Dizziness',
    patterns: [
      /\b(dizzy|dizziness|lightheaded|vertigo|faint|fainting|giddy|passed out)\b/i,
      /மயக்கம்|தலைசுற்றல்/,
      /चक्कर|बेहोशी/,
      /కళ్ళు\s*తిరగడం/,
      /തലകറക്കം/,
      /ತಲೆಸುತ್ತು/,
    ],
  },
  {
    symptom: 'Bleeding',
    patterns: [
      /\b(bleeding|blood|hemorrhage|blood in stool|blood in vomit|coughing blood)\b/i,
      /ரத்தக்கசிவு|இரத்தம்/,
      /खून\s*बहना|रक्तस्राव|खून/,
      /రక్తస్రావం/,
      /രക്തസ്രാവം/,
      /ರಕ್ತಸ್ರಾವ/,
    ],
    isRedFlag: true,
  },
  {
    symptom: 'Allergy',
    patterns: [
      /\b(allergy|allergic|rash|itching|hives|swelling|skin itching)\b/i,
      /ஒவ்வாமை|அரிப்பு|தடிப்பு/,
      /एलर्जी|खुजली|चकत्ते/,
      /అలర్జీ|దురద/,
      /അലർജി|ചൊറിച്ചിൽ/,
      /ಅಲರ್ಜಿ|ತುರಿಕೆ/,
    ],
  },
  {
    symptom: 'Fatigue',
    patterns: [
      /\b(tired|fatigue|weakness|exhaustion|lethargic|low energy)\b/i,
      /சோர்வு|பலவீனம்/,
      /थकान|कमजोरी/,
      /బలహీనత|అలసట/,
      /ക്ഷീണം/,
      /ಆಯಾಸ/,
    ],
  },
  {
    symptom: 'Body ache',
    patterns: [
      /\b(body ache|body pain|joint pain|muscle pain|back pain|all over pain)\b/i,
      /உடல்\s*வலி|மூட்டு\s*வலி/,
      /अंग\s*दर्द|बदन\s*दर्द|जोड़ों\s*का\s*दर्द/,
      /ఒళ్ళు\s*నొప్పులు|కీళ్ల\s*నొప్పులు/,
      /ശരീരം\s*വേദന/,
      /ಮೈಕೈ\s*ನೋವು/,
    ],
  },
  {
    symptom: 'Sore throat',
    patterns: [
      /\b(sore throat|throat pain|throat irritation|difficulty swallowing)\b/i,
      /தொண்டை\s*வலி|தொண்டை\s*எரிச்சல்/,
      /गले\s*में\s*दर्द|गले\s*में\s*खराश/,
      /గొంతు\s*నొప్పి/,
      /തൊണ്ടവേദന/,
      /ಗಂಟಲು\s*ನೋವು/,
    ],
  },
  {
    symptom: 'High BP',
    patterns: [
      /\b(high bp|hypertension|blood pressure high|bp high)\b/i,
      /இரத்த\s*அழுத்தம்/,
      /उच्च\s*रक्तचाप|बीपी\s*ज्यादा/,
      /రక్తపోటు/,
      /രക്തസമ്മർദ്ദം/,
      /ರಕ್ತದೊತ್ತಡ/,
    ],
  },
  {
    symptom: 'High Blood Sugar',
    patterns: [
      /\b(high sugar|blood sugar|diabetes|hyperglycemia)\b/i,
      /சர்க்கரை\s*நோய்|சுகர்/,
      /मधुमेह|शुगर/,
      /షుగర్/,
      /പ്രമേഹം/,
      /ಸಕ್ಕರೆ\s*ಕಾಯಿಲೆ/,
    ],
  },
];

/**
 * Extracts duration from spoken transcript
 */
function extractDuration(text: string): string | undefined {
  const durationPatterns = [
    /(\d+)\s*(days?|दिन|நாட்கள்|రోజులు|ദിവസം|ದಿನಗಳು)/i,
    /(\d+)\s*(weeks?|सप्ताह|हफ्ते|வாரங்கள்|వారాలు|ആഴ്ച|ವಾರಗಳು)/i,
    /(\d+)\s*(hours?|घंटे|மணிகள்|గంటలు|മണിക്കൂർ|ಗಂಟೆಗಳು)/i,
    /(\d+)\s*(months?|महीने|மாதங்கள்)/i,
    /\b(since yesterday|कल से|நேற்றிலிருந்து|నిన్నటి నుండి|ഇന്നലെ മുതൽ)\b/i,
    /\b(since morning|आज सुबह से|இன்று காலை முதல்)\b/i,
    /\b(today|आज|இன்று|ఈరోజు)\b/i,
    /\b(one week|1 week|एक सप्ताह|ஒரு வாரம்)\b/i,
    /\b(few days|कुछ दिन|சில நாட்கள்)\b/i,
  ];

  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[0].toLowerCase().includes('yesterday') || match[0].includes('कल से') || match[0].includes('நேற்று')) {
        return 'Since yesterday';
      }
      if (match[0].toLowerCase().includes('morning') || match[0].includes('सुबह')) {
        return 'Since morning';
      }
      if (match[1] && match[2]) {
        return `${match[1]} ${match[2]}`.trim();
      }
      return match[0].trim();
    }
  }

  return undefined;
}

/**
 * Extracts severity from spoken transcript
 */
function extractSeverity(text: string): 'Mild' | 'Moderate' | 'Severe' | 'Critical' {
  const criticalPatterns = [
    /\b(unbearable|emergency|collapsed|cannot breathe|crushing|life threatening|fatal)\b/i,
    /உயிருக்கு\s*ஆபத்து|தாங்க\s*முடியாத/,
    /असहनीय|आपातकालीन/,
  ];
  for (const cp of criticalPatterns) {
    if (cp.test(text)) return 'Critical';
  }

  const severePatterns = [
    /\b(severe|very high|extreme|terrible|heavy|intense|uncontrollable|excruciating)\b/i,
    /கடுமையான|மிகவும்\s*அதிகமான/,
    /तेज|बहुत\s*ज्यादा|गंभीर/,
    /తీవ్రమైన/,
    /ഗുരുതരമായ/,
  ];
  for (const sp of severePatterns) {
    if (sp.test(text)) return 'Severe';
  }

  const mildPatterns = [
    /\b(mild|slight|little bit|minor|small|not much)\b/i,
    /லேசான|சிறிதளவு/,
    /हल्का|थोड़ा/,
    /తేలికపాటి/,
  ];
  for (const mp of mildPatterns) {
    if (mp.test(text)) return 'Mild';
  }

  return 'Moderate';
}

/**
 * Main parser: takes spoken transcript and returns structured triage data
 */
export function parseSpokenSymptoms(transcript: string): ParsedVoiceTriage {
  const cleanText = transcript.trim();
  const detectedSymptoms: string[] = [];
  let isEmergency = false;
  let emergencyReason: string | undefined;

  for (const rule of SYMPTOM_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(cleanText)) {
        if (!detectedSymptoms.includes(rule.symptom)) {
          detectedSymptoms.push(rule.symptom);
          if (rule.isRedFlag) {
            isEmergency = true;
            emergencyReason = emergencyReason
              ? `${emergencyReason}, ${rule.symptom}`
              : `Emergency Red Flag Symptom Detected: ${rule.symptom}`;
          }
        }
        break;
      }
    }
  }

  // Check additional explicit emergency red flags
  const redFlagTerms = [
    /\b(unconscious|fainted|loss of consciousness|seizure|fits|stroke|slurred speech|facial droop)\b/i,
    /\b(coughing blood|vomiting blood|heavy bleeding)\b/i,
    /மயக்கம்|வலிப்பு|பக்கவாதம்/,
    /बेहोश|दौरा|लकवा/,
  ];
  for (const rft of redFlagTerms) {
    if (rft.test(cleanText)) {
      isEmergency = true;
      if (!emergencyReason) {
        emergencyReason = 'Critical clinical warning signs detected in spoken symptoms.';
      }
      break;
    }
  }

  const detectedDuration = extractDuration(cleanText);
  const detectedSeverity = extractSeverity(cleanText);

  // Build a concise clinical chief complaint
  let chiefComplaintSummary = cleanText;
  if (!chiefComplaintSummary && detectedSymptoms.length > 0) {
    chiefComplaintSummary = `Patient reports ${detectedSymptoms.join(', ')}${
      detectedDuration ? ` for ${detectedDuration}` : ''
    }.`;
  }

  return {
    rawTranscript: cleanText,
    detectedSymptoms,
    detectedDuration,
    detectedSeverity,
    isEmergency,
    emergencyReason,
    chiefComplaintSummary,
  };
}

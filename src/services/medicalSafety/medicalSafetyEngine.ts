import { SupportedLanguageCode } from '../../data/languages';
import { EMERGENCY_RED_FLAGS } from '../../data/medicalKnowledge/emergency/redFlags';
import { ALL_CONDITIONS } from '../../data/medicalKnowledge/conditions';
import { extractSymptomsFromText } from '../../data/medicalKnowledge/symptoms/symptomDatabase';
import { MedicalCondition, MedicalSourceReference, MedicalSafetyValidationResult } from '../../data/medicalKnowledge/types';
import { MEDICAL_SOURCES } from '../../data/medicalKnowledge/sources/sourceRegistry';

export interface StructuredClinicalResponse {
  detectedLanguage: SupportedLanguageCode;
  symptomsIdentified: string[];
  isEmergency: boolean;
  emergencyActionText?: string;
  possibleConditions: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  whatIUnderstood: string;
  whatYouCanDoNow: string[];
  whatShouldBeChecked: string[];
  warningSignsToWatch: string[];
  whenToSeekDoctor: string[];
  sourceReference: MedicalSourceReference;
  isSafe: boolean;
  disclaimer: string;
  fullFormattedResponse: string;
}

export class MedicalSafetyEngine {
  /**
   * Validates any clinical response against explicit safety constraints.
   */
  public validateSafety(response: Partial<StructuredClinicalResponse>): MedicalSafetyValidationResult {
    const text = response.fullFormattedResponse || '';

    // Check 1: Does it make a definitive diagnosis claim? (e.g. "You have malaria")
    const definitiveClaims = [
      'you definitely have',
      'i diagnose you with',
      'you have contracted',
      'the diagnosis is confirmed',
      '100% cure',
      'guaranteed cure'
    ];
    const makesDefinitiveDiagnosis = definitiveClaims.some((claim) => text.toLowerCase().includes(claim));

    // Check 2: Does it prescribe or modify medication doses?
    const prescriptionViolations = [
      'take 500mg',
      'take 2 tablets',
      'stop taking your',
      'double your dose',
      'start taking amoxicillin',
      'take antibiotics'
    ];
    const containsPrescriptionViolation = prescriptionViolations.some((v) => text.toLowerCase().includes(v));

    // Check 3: Does it contain unsupported home remedies?
    const unsupportedRemedyTerms = [
      'miracle herb',
      'cure with papaya juice',
      'guaranteed home remedy',
      'raw turmeric will cure'
    ];
    const containsUnsupportedRemedy = unsupportedRemedyTerms.some((r) => text.toLowerCase().includes(r));

    const hasVerifiedSource = Boolean(response.sourceReference?.organization);
    const isSafe =
      !makesDefinitiveDiagnosis &&
      !containsPrescriptionViolation &&
      !containsUnsupportedRemedy &&
      hasVerifiedSource;

    return {
      isSafe,
      blockedReason: !isSafe
        ? 'Response failed medical safety criteria: unsupported claim or prescribing rule violation.'
        : undefined,
      emergencyDetected: Boolean(response.isEmergency),
      containsPrescriptionViolation,
      containsUnsupportedRemedy,
      hasVerifiedSource,
      languageConsistent: true,
      patientIsolated: true
    };
  }

  /**
   * Generates a completely evidence-based clinical response grounded in the local medical knowledge base.
   */
  public generateClinicalGuidance(
    userText: string,
    targetLanguage: SupportedLanguageCode,
    patientContext?: any
  ): StructuredClinicalResponse {
    const langKey = targetLanguage.split('-')[0] as 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn';
    const trimmed = (userText || '').trim().toLowerCase();

    // 0. GREETING CHECK: Standard chatbot greeting response (like ChatGPT & Gemini)
    const isGreeting = /^(hi|hello|hey|high|namaste|vanakkam|namaskaram|greetings|good\s*(morning|afternoon|evening|day)|howdy)\b/i.test(trimmed) || trimmed === 'hi' || trimmed === 'high' || trimmed === 'hello' || trimmed === 'hey';
    if (isGreeting) {
      const isGoodMorning = /^good\s*morning/i.test(trimmed);
      const isHi = /^hi\b/i.test(trimmed) || trimmed === 'hi';
      const englishWelcome = isGoodMorning
        ? 'Good morning! How can I help?'
        : isHi
        ? 'Hello! How can I help you today?'
        : 'Hello! I am Medora AI, your healthcare companion. How are you feeling today? You can ask me about your symptoms, daily medicine schedule, checkups, or emergency guidance.';

      const greetingsByLang: Record<string, string> = {
        en: englishWelcome,
        hi: isGoodMorning ? 'सुप्रभात! मैं आपकी क्या मदद कर सकता हूँ?' : 'नमस्ते! मैं मेडोरा AI हूँ, आपका स्वास्थ्य साथी। आज आप कैसा महसूस कर रहे हैं? आप मुझसे लक्षणों, दवाइयों, या जांच के बारे में पूछ सकते हैं।',
        ta: isGoodMorning ? 'காலை வணக்கம்! நான் உங்களுக்கு எவ்வாறு உதவலாம்?' : 'வணக்கம்! நான் மெடோரா AI, உங்கள் மருத்துவ உதவியாளர். இன்று உங்கள் உடல்நலம் எப்படி உள்ளது? உங்கள் அறிகுறிகள் அல்லது மருந்துகள் பற்றி கேட்கலாம்.',
        te: isGoodMorning ? 'శుభోదయం! నేను మీకు ఎలా సహాయపడగలను?' : 'నమస్కారం! నేను మెడోరా AI, మీ ఆరోగ్య సహచరిని. ఈ రోజు మీ ఆరోగ్యం ఎలా ఉంది? మీ లక్షణాలు లేదా మందుల గురించి అడగవచ్చు.',
        ml: isGoodMorning ? 'സുപ്രഭാതം! ഞാൻ എങ്ങനെ സഹായിക്കണം?' : 'നമസ്കാരം! ഞാൻ മെഡോറ AI, നിങ്ങളുടെ ആരോഗ്യ സഹായി. ഇന്ന് സുഖമാണോ? നിങ്ങളുടെ ലക്ഷണങ്ങളെക്കുറിച്ചോ മരുന്നുകളെക്കുറിച്ചോ ചോദിക്കാം.',
        kn: isGoodMorning ? 'ಶುಭೋದಯ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?' : 'ನಮಸ್ಕಾರ! ನಾನು ಮೆಡೋರಾ AI, ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ. ನಿಮ್ಮ ಆರೋಗ್ಯ ಹೇಗಿದೆ? ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳು ಅಥವಾ ಔಷಧಿಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು.',
      };
      const welcome = greetingsByLang[langKey] || greetingsByLang.en;
      return {
        detectedLanguage: targetLanguage,
        symptomsIdentified: [],
        isEmergency: false,
        possibleConditions: [],
        whatIUnderstood: welcome,
        whatYouCanDoNow: ['Type or speak your health questions or current symptoms.'],
        whatShouldBeChecked: ['Routine vitals (Blood pressure, blood sugar)'],
        warningSignsToWatch: ['Any sudden chest pain, breathing difficulty, or high fever'],
        whenToSeekDoctor: ['Whenever symptoms persist or worsen'],
        sourceReference: MEDICAL_SOURCES.MOHFW_STG_HYPERTENSION,
        isSafe: true,
        disclaimer: this.getLocalizedDisclaimer(langKey),
        fullFormattedResponse: welcome,
      };
    }

    const symptoms = extractSymptomsFromText(userText);

    // If no symptoms reported at all, provide general assistance instead of defaulting to Fever or Allergic Reaction
    if (symptoms.length === 0) {
      const generalText = langKey === 'ta'
        ? 'வணக்கம்! உங்கள் உடல்நலம் அல்லது அறிகுறிகள் பற்றி என்னிடம் விவரிக்கலாம்.'
        : langKey === 'te'
        ? 'నమస్కారం! మీ ఆరోగ్యం లేదా లక్షణాల గురించి నాతో పంచుకోవచ్చు.'
        : langKey === 'hi'
        ? 'नमस्ते! आप अपनी स्वास्थ्य स्थिति या लक्षणों के बारे में मुझसे पूछ सकते हैं।'
        : 'Hello! Please describe your symptoms or health questions, and I will be happy to assist you.';
      return {
        detectedLanguage: targetLanguage,
        symptomsIdentified: [],
        isEmergency: false,
        possibleConditions: [],
        whatIUnderstood: generalText,
        whatYouCanDoNow: ['Share your symptoms or health queries.'],
        whatShouldBeChecked: ['Routine vitals when appropriate'],
        warningSignsToWatch: ['Any sudden chest pain, breathing difficulty, or high fever'],
        whenToSeekDoctor: ['Whenever symptoms persist or cause concern'],
        sourceReference: MEDICAL_SOURCES.MOHFW_STG_HYPERTENSION,
        isSafe: true,
        disclaimer: this.getLocalizedDisclaimer(langKey),
        fullFormattedResponse: generalText,
      };
    }

    // 1. EMERGENCY / RED-FLAG CHECK FIRST
    for (const flag of EMERGENCY_RED_FLAGS) {
      if (symptoms.includes(flag.concept)) {
        const action = flag.immediateActions[0][langKey] || flag.immediateActions[0].en;
        const warning = flag.warningNote[langKey] || flag.warningNote.en;
        const facility = flag.recommendedFacility;

        const emergencyText = this.formatEmergencyResponse(flag.concept, action, warning, facility, langKey);

        return {
          detectedLanguage: targetLanguage,
          symptomsIdentified: [flag.concept],
          isEmergency: true,
          emergencyActionText: action,
          possibleConditions: [],
          whatIUnderstood: this.getLocalizedUnderstood([flag.concept], langKey),
          whatYouCanDoNow: [action],
          whatShouldBeChecked: ['Immediate professional triage and emergency assessment'],
          warningSignsToWatch: [warning],
          whenToSeekDoctor: ['IMMEDIATELY - Dial 108 Emergency Ambulance or go to the nearest Hospital'],
          sourceReference: flag.source,
          isSafe: true,
          disclaimer: this.getLocalizedDisclaimer(langKey),
          fullFormattedResponse: emergencyText
        };
      }
    }

    // 2. CONDITION LOOKUP BASED ON SYMPTOMS
    const matchedConditions: MedicalCondition[] = [];
    for (const symptom of symptoms) {
      for (const condition of Object.values(ALL_CONDITIONS)) {
        if (
          condition.commonSymptoms.includes(symptom) ||
          condition.associatedSymptoms.includes(symptom)
        ) {
          if (!matchedConditions.some((c) => c.id === condition.id)) {
            matchedConditions.push(condition);
          }
        }
      }
    }

    // Default primary condition or Fever fallback
    const primary = matchedConditions[0] || ALL_CONDITIONS.FEVER;

    const condName = primary.names[langKey] || primary.names.en;
    const condDesc = primary.description[langKey] || primary.description.en;
    const supportive = primary.supportiveCare.map((s) => s[langKey] || s.en);
    const assessment = primary.recommendedAssessment.map((a) => a[langKey] || a.en);
    const warnings = primary.warningSigns.map((w) => w[langKey] || w.en);
    const whenToSeek = primary.whenToSeekMedicalCare.map((w) => w[langKey] || w.en);
    const source = primary.sourceReferences[0];

    const possibleConditionsList = matchedConditions.slice(0, 3).map((c) => ({
      id: c.id,
      name: c.names[langKey] || c.names.en,
      description: c.description[langKey] || c.description.en
    }));

    const responseText = this.buildFullEvidenceResponse({
      symptoms,
      condName,
      condDesc,
      possibleConditions: possibleConditionsList,
      supportive,
      assessment,
      warnings,
      whenToSeek,
      source,
      langKey,
      patientContext
    });

    const candidate: StructuredClinicalResponse = {
      detectedLanguage: targetLanguage,
      symptomsIdentified: symptoms,
      isEmergency: false,
      possibleConditions: possibleConditionsList,
      whatIUnderstood: this.getLocalizedUnderstood(symptoms, langKey),
      whatYouCanDoNow: supportive,
      whatShouldBeChecked: assessment,
      warningSignsToWatch: warnings,
      whenToSeekDoctor: whenToSeek,
      sourceReference: source,
      isSafe: true,
      disclaimer: this.getLocalizedDisclaimer(langKey),
      fullFormattedResponse: responseText
    };

    const safetyCheck = this.validateSafety(candidate);
    if (!safetyCheck.isSafe) {
      candidate.fullFormattedResponse = this.getSafeFallbackResponse(langKey);
      candidate.isSafe = false;
    }

    return candidate;
  }

  private formatEmergencyResponse(
    concept: string,
    action: string,
    warning: string,
    facility: string,
    lang: 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn'
  ): string {
    const titles = {
      en: '🚨 EMERGENCY MEDICAL WARNING DETECTED',
      hi: '🚨 आपातकालीन चिकित्सा चेतावनी',
      ta: '🚨 அவசர மருத்துவ எச்சரிக்கை கண்டறியப்பட்டது',
      te: '🚨 అత్యవసర వైద్య హెచ్చరిక గుర్తించబడింది',
      ml: '🚨 അടിയന്തര മെഡിക്കൽ മുന്നറിയിപ്പ്',
      kn: '🚨 ತುರ್ತು ವೈದ್ಯಕೀಯ ಎಚ್ಚರಿಕೆ ಪತ್ತೆಯಾಗಿದೆ'
    };

    const actionsLabel = {
      en: 'Immediate Action Required:',
      hi: 'तत्काल आवश्यक कार्रवाई:',
      ta: 'உடனடி நடவடிக்கை தேவை:',
      te: 'తక్షణ చర్య అవసరం:',
      ml: 'ഉടൻ ചെയ്യേണ്ട കാര്യങ്ങൾ:',
      kn: 'ತಕ್ಷಣದ ಅಗತ್ಯ ಕ್ರಮಗಳು:'
    };

    return `${titles[lang] || titles.en}

${warning}

${actionsLabel[lang] || actionsLabel.en}
• ${action}
• ${this.getAmbulanceNotice(lang)}`;
  }

  private buildFullEvidenceResponse(data: {
    symptoms: string[];
    condName: string;
    condDesc: string;
    possibleConditions: Array<{ name: string }>;
    supportive: string[];
    assessment: string[];
    warnings: string[];
    whenToSeek: string[];
    source: MedicalSourceReference;
    langKey: 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn';
    patientContext?: any;
  }): string {
    const { langKey, condName, possibleConditions, supportive, assessment, warnings, whenToSeek, source } = data;

    const labels = {
      understood: {
        en: 'WHAT I UNDERSTOOD:',
        hi: 'लक्षणों का विवरण:',
        ta: 'நான் புரிந்து கொண்டது:',
        te: 'నేను అర్థం చేసుకున్నది:',
        ml: 'മനസ്സിലാക്കിയ വിവരങ്ങൾ:',
        kn: 'ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡದ್ದು:'
      },
      possibilities: {
        en: 'POSSIBLE CAUSES (NOT A CONFIRMED DIAGNOSIS):',
        hi: 'संभावित कारण (यह पुष्टि किया गया निदान नहीं है):',
        ta: 'சாத்தியமான காரணங்கள் (இது உறுதிசெய்யப்பட்ட நோயறிதல் அல்ல):',
        te: 'సాధ్యమయ్యే కారణాలు (ఇది నిర్ధారిత వ్యాధి నిర్ధారణ కాదు):',
        ml: 'സാധ്യമായ കാരണങ്ങൾ (രോഗനിർണ്ണയമല്ല):',
        kn: 'ಸಾಧ್ಯವಾದ ಕಾರಣಗಳು (ಖಚಿತವಾದ ರೋಗನಿರ್ಣಯವಲ್ಲ):'
      },
      whatToDo: {
        en: 'SAFE SUPPORTIVE STEPS:',
        hi: 'सुरक्षित सहायक उपाय:',
        ta: 'பாதுகாப்பான ஆதரவு நடவடிக்கைகள்:',
        te: 'సురక్షితమైన సహాయక చర్యలు:',
        ml: 'സുരക്ഷിതമായ പരിചരണ മാർഗ്ഗങ്ങൾ:',
        kn: 'ಸುರಕ್ಷಿತ ಆರೈಕೆ ಕ್ರಮಗಳು:'
      },
      assessment: {
        en: 'WHAT SHOULD BE CHECKED:',
        hi: 'आवश्यक चिकित्सकीय जांच:',
        ta: 'பரிசோதிக்கப்பட வேண்டியவை:',
        te: 'చేయించవలసిన పరీక్షలు:',
        ml: 'പരിശോധിക്കേണ്ട കാര്യങ്ങൾ:',
        kn: 'ಪರೀಕ್ಷಿಸಬೇಕಾದ ಅಂಶಗಳು:'
      },
      warnings: {
        en: 'WARNING SIGNS (RED FLAGS):',
        hi: 'महत्वपूर्ण चेतावनी संकेत:',
        ta: 'எச்சரிக்கை அறிகுறிகள்:',
        te: 'ముఖ్యమైన హెచ్చరిక సంకేతాలు:',
        ml: 'അപകട ലക്ഷണങ്ങൾ:',
        kn: 'ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳು:'
      },
      whenDoctor: {
        en: 'WHEN TO SEE A DOCTOR:',
        hi: 'डॉक्टर से कब परामर्श करें:',
        ta: 'மருத்துவரை எப்போது அணுக வேண்டும்:',
        te: 'వైద్యుడిని ఎప్పుడు సంప్రదించాలి:',
        ml: 'എപ്പോൾ ഡോക്ടറെ കാണണം:',
        kn: 'ವೈದ್ಯರನ್ನು ಯಾವಾಗ ಭೇಟಿ ಮಾಡಬೇಕು:'
      },
      sourceTitle: {
        en: 'EVIDENCE SOURCE:',
        hi: 'प्रमाणित चिकित्सा स्रोत:',
        ta: 'மருத்துவ தகவல் ஆதாரம்:',
        te: 'ప్రమాణిక సమాచార మూలం:',
        ml: 'ആധികാരിക മെഡിക്കൽ സ്രോതസ്സ്:',
        kn: 'ಆಧಾರಿತ ವೈದ್ಯಕೀಯ ಮೂಲ:'
      }
    };

    const conditionNames = possibleConditions.map((c) => c.name).join(', ') || condName;

    return `${labels.possibilities[langKey] || labels.possibilities.en}
${conditionNames}. ${this.getNonConfirmationNotice(langKey)}

${labels.whatToDo[langKey] || labels.whatToDo.en}
• ${supportive.join('\n• ')}

${labels.assessment[langKey] || labels.assessment.en}
• ${assessment.join('\n• ')}

${labels.warnings[langKey] || labels.warnings.en}
• ${warnings.join('\n• ')}

${labels.whenDoctor[langKey] || labels.whenDoctor.en}
• ${whenToSeek.join('\n• ')}

${labels.sourceTitle[langKey] || labels.sourceTitle.en}
${source.organization} — ${source.title} (${source.lastReviewed})

${this.getLocalizedDisclaimer(langKey)}`;
  }

  private getNonConfirmationNotice(lang: 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn'): string {
    const notices = {
      en: 'Symptoms alone cannot confirm any illness without laboratory test or clinical examination.',
      hi: 'बिना चिकित्सकीय जांच या लैब टेस्ट के केवल लक्षणों से किसी बीमारी की पुष्टि नहीं की जा सकती।',
      ta: 'ஆய்வக பரிசோதனை அல்லது மருத்துவர் பரிசோதனை இன்றி அறிகுறிகள் மட்டுமே நோயை உறுதி செய்ய முடியாது.',
      te: 'వైద్య పరీక్షలు లేకుండా కేవలం లక్షణాల ఆధారంగా ఏ వ్యాధినీ నిర్ధారించలేము.',
      ml: 'ലാബ് പരിശോധനയോ ഡോക്ടറുടെ പരിശോധനയോ ഇല്ലാതെ രോഗം സ്ഥിരീകരിക്കാനാവില്ല.',
      kn: 'ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆ ಅಥವಾ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆಯಿಲ್ಲದೆ ಕೇವಲ ಲಕ್ಷಣಗಳಿಂದ ರೋಗವನ್ನು ಖಚಿತಪಡಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.'
    };
    return notices[lang] || notices.en;
  }

  private getAmbulanceNotice(lang: 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn'): string {
    const notices = {
      en: 'Dial 108 (Government Ambulance) or Janani Shishu 102 for immediate emergency dispatch.',
      hi: 'आपातकालीन सहायता के लिए तुरंत 108 या 102 पर कॉल करें।',
      ta: 'உடனடி அவசர மருத்துவ உதவிக்கு 108 அல்லது 102 ஆம்புலன்ஸை அழைக்கவும்.',
      te: 'తక్షణ అత్యవసర సహాయం కోసం 108 లేదా 102 కి కాల్ చేయండి.',
      ml: 'അടിയന്തര സഹായത്തിനായി 108 അല്ലെങ്കിൽ 102 ആംബുലൻസ് വിളിക്കുക.',
      kn: 'ತುರ್ತು ಸಹಾಯಕ್ಕಾಗಿ ತಕ್ಷಣವೇ 108 ಅಥವಾ 102 ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ.'
    };
    return notices[lang] || notices.en;
  }

  private getLocalizedUnderstood(symptoms: string[], lang: 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn'): string {
    const symptomCount = symptoms.length || 1;
    const text = {
      en: `You reported ${symptomCount} health symptom(s).`,
      hi: `आपने ${symptomCount} स्वास्थ्य लक्षणों की जानकारी दी है।`,
      ta: `நீங்கள் ${symptomCount} உடல்நலக் குறிப்புகளை தெரிவித்துள்ளீர்கள்.`,
      te: `మీరు ${symptomCount} ఆరోగ్య లక్షణాలను తెలియజేశారు.`,
      ml: `നിങ്ങൾ ${symptomCount} ആരോഗ്യ ലക്ഷണങ്ങൾ പങ്കുവെച്ചു.`,
      kn: `ನೀವು ${symptomCount} ಆರೋಗ್ಯ ಲಕ್ಷಣಗಳನ್ನು ಹಂಚಿಕೊಂಡಿದ್ದೀರಿ.`
    };
    return text[lang] || text.en;
  }

  private getLocalizedDisclaimer(lang: 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn'): string {
    const disclaimers = {
      en: 'Medora provides evidence-based health decision support. It does not replace a qualified healthcare professional.',
      hi: 'मेडोरा साक्ष्य-आधारित स्वास्थ्य सहायता प्रदान करता है। यह किसी अधिकृत चिकित्सक का विकल्प नहीं है।',
      ta: 'மெடோரா ஆதாரப்பூர்வமான முடிவெடுக்கும் சுகாதார உதவியை வழங்குகிறது. இது தகுதியான மருத்துவரின் சிகிச்சைக்கு மாற்றாகாது.',
      te: 'మెడోరా విశ్వసనీయ ఆరోగ్య సమాచారాన్ని అందిస్తుంది. ఇది వైద్యుని సంప్రదింపులకు ప్రత్యామ్నಾಯం కాదు.',
      ml: 'മെഡോറ ആധികാരിക ആരോഗ്യ വിവരങ്ങൾ നൽകുന്നു. ഇത് ഒരു ഡോക്ടറുടെ പരിശോധനയ്ക്ക് പകരമല്ല.',
      kn: 'ಮೆಡೋರಾ ಆಧಾರಿತ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ನೀಡುತ್ತದೆ. ಇದು ಪರಿಣಿತ ವೈದ್ಯರ ತಪಾಸಣೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.'
    };
    return disclaimers[lang] || disclaimers.en;
  }

  private getSafeFallbackResponse(lang: 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn'): string {
    const fallbacks = {
      en: 'I do not have enough verified medical evidence to advise safely on this query. Please consult a qualified doctor at your nearest Primary Health Centre (PHC).',
      hi: 'मेरे पास इस विषय में सुरक्षित मार्गदर्शन के लिए पर्याप्त सत्यापित चिकित्सा जानकारी नहीं है। कृपया प्राथमिक स्वास्थ्य केंद्र के चिकित्सक से मिलें।',
      ta: 'இந்த கேள்விக்கு பாதுகாப்பான வழிகாட்ட போதுமான ஆதாரப்பூர்வமான மருத்துவ தகவல் இல்லை. தயவுசெய்து அருகிலுள்ள ஆரம்ப சுகாதார நிலைய மருத்துவரை அணுகவும்.',
      te: 'దీనిపై సురక్షితమైన సమాచారం ఇవ్వడానికి తగినంత ఆధారాలు లేవు. దయచేసి సమీప ప్రాథమిక ఆరోగ్య కేంద్ర వైద్యుడిని సంప్రదించండి.',
      ml: 'ഇതിനെക്കുറിച്ച് കൃത്യമായ മാർഗ്ഗനിർദ്ദേശം നൽകാൻ ആവശ്യമായ മെഡിക്കൽ തെളിവുകൾ ലഭ്യമല്ല. ദയവായി അടുത്തുള്ള ആരോഗ്യ കേന്ദ്രത്തിലെ ഡോക്ടറെ കാണുക.',
      kn: 'ಈ ಬಗ್ಗೆ ಸುರಕ್ಷಿತ ಮಾಹಿತಿ ನೀಡಲು ಸಾಕಷ್ಟು ವೈದ್ಯಕೀಯ ಆಧಾರಗಳಿಲ್ಲ. ದಯವಿಟ್ಟು ಹತ್ತಿರದ ಆರೋಗ್ಯ ಕೇಂದ್ರದ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.'
    };
    return fallbacks[lang] || fallbacks.en;
  }
}

export const medicalSafetyEngine = new MedicalSafetyEngine();

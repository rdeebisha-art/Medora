import { SupportedLanguageCode, LANGUAGE_METADATA } from '../../data/languages';
import { HEALTH_KNOWLEDGE_BASE, HealthcareIntent } from '../../data/healthKnowledge/knowledgeBase';
import { languageDetectionService, LanguageDetectionResult } from './languageDetectionService';
import { intentClassifier, IntentClassificationResult } from './intentClassifier';
import { conversationMemory, ConversationState } from './conversationMemory';
import { medicalSafetyEngine } from '../medicalSafety/medicalSafetyEngine';
import {
  protectMedicalValues,
  restoreMedicalValues,
  validatePreservedMedicalValues,
} from '../medicalSafety/medicalValueProtection';
import { db, UssdSessionRecord } from '../../db/db';

export interface ProcessedConversationTurn {
  userText: string;
  detectedLanguage: SupportedLanguageCode;
  languageConfidence: number;
  confidenceLevel: 'high' | 'medium' | 'uncertain';
  intent: HealthcareIntent;
  agentName: string;
  isEmergency: boolean;
  responseText: string;
  followUpQuestion?: string;
  safetyGuidance?: string;
  durationIdentified?: string;
}

export interface UssdTurnResult {
  session: UssdSessionRecord;
  responseText: string;
  isEmergency: boolean;
  intent: string;
  language: string;
  options: Array<{ num: number; label: string; action: string }>;
}

export class ConversationEngine {
  /**
   * Main entry point for processing any user utterance (from microphone, text, or USSD).
   */
  public async processUserInput(
    rawText: string,
    overrideLanguage?: SupportedLanguageCode,
    preferredLanguage?: SupportedLanguageCode,
    activePatientId?: number
  ): Promise<ProcessedConversationTurn> {
    const text = (rawText || '').trim();
    const state = conversationMemory.getState();
    const effectivePreferred = preferredLanguage || (state.detectedLanguage as SupportedLanguageCode) || 'en-IN';

    // 0. Protect critical medical values (temperature, BP, SpO2, units, medicine names)
    const { protectedText, values: protectedValues } = protectMedicalValues(text);

    // 1. Automatic Language Detection
    let detection: LanguageDetectionResult;
    if (overrideLanguage) {
      detection = {
        language: overrideLanguage,
        confidence: 1.0,
        confidenceLevel: 'high',
        method: 'explicit',
        detectedScripts: {},
        matchedKeywords: [],
      };
      conversationMemory.updateLanguage(overrideLanguage, 1.0, true);
    } else {
      detection = languageDetectionService.detectLanguage(
        text,
        undefined,
        effectivePreferred
      );
      conversationMemory.updateLanguage(detection.language, detection.confidence);
    }

    const currentLang = detection.language;
    const langKey = currentLang.split('-')[0] as 'en' | 'ta' | 'te' | 'ml' | 'kn' | 'hi';

    // 2. Intent Classification
    const classification: IntentClassificationResult = intentClassifier.classifyIntent(text, currentLang);

    // 3. Emergency / Red-Flag Priority Check
    let isEmergency = classification.isEmergency;

    // 4. Patient Context Resolution (from actual IndexedDB storage)
    const patientId = activePatientId || state.patientId || 1;
    let customContextResponse: string | null = null;
    const lowerText = text.toLowerCase();

    // Context follow-up check: If user typed just a duration ("3 days") and previous symptom exists
    const isJustDuration = /^\d+\s*(days?|weeks?|months?|hours?|நாட்கள்|நாட்களாக|రోజులు|दिन|ദിവസം|ದಿನ)\b/i.test(lowerText) ||
      /^(three|two|four|five|six|seven|3|2|4|5)\s*(days?|weeks?|दिन|நாட்கள்)/i.test(lowerText);

    if (isJustDuration && state.symptoms.length > 0) {
      const prevSymptom = state.symptoms[state.symptoms.length - 1];
      const durationStr = classification.durationIdentified || text;
      customContextResponse = this.formatContextMessage(
        `Understood, you have had ${prevSymptom} for ${durationStr}. Fever or symptoms persisting for this duration should be evaluated by a healthcare professional. Seek urgent care if warning signs appear.`,
        `புரிந்தது, உங்களுக்கு ${prevSymptom} ${durationStr} உள்ளது. இந்த காலத்திற்கு நீடிக்கும் அறிகுறிகள் மருத்துவ நிபுணரால் பரிசோதிக்கப்பட வேண்டும். எச்சரிக்கை அறிகுறிகள் தோன்றினால் உடனடியாக மருத்துவமனை செல்லவும்.`,
        `అర్థమైంది, మీకు ${prevSymptom} ${durationStr} ఉంది. ఈ వ్యవధి పాటు ఉండే లక్షణాలను ఆరోగ్య నిపుణుల ద్వారా పరీక్షించాలి. ప్రమాద సంకేతాలు కనిపిస్తే వెంటనే వైద్య సహాయం తీసుకోండి.`,
        `മനസ്സിലായി, നിങ്ങൾക്ക് ${prevSymptom} ${durationStr} ആയി ഉണ്ട്. ഈ കാലയളവിലേക്ക് നീണ്ടുനിൽക്കുന്ന ലക്ഷണങ്ങൾ ഒരു ഡോക്ടറെ കൊണ്ട് പരിശോധിപ്പിക്കേണ്ടതാണ്.`,
        `ತಿಳಿಯಿತು, ನಿಮಗೆ ${prevSymptom} ${durationStr} ಇದೆ. ಈ ಅವಧಿಯವರೆಗೆ ಇರುವ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವೈದ್ಯರಿಂದ ಪರೀಕ್ಷಿಸಬೇಕು.`,
        `समझ गया, आपको ${prevSymptom} ${durationStr} से है। इस अवधि तक बने रहने वाले लक्षणों की जांच किसी योग्य स्वास्थ्य पेशेवर से कराई जानी चाहिए।`,
        currentLang
      );
    }

    // Appointment query: Check actual IndexedDB appointments
    if (
      lowerText.includes('appointment') ||
      lowerText.includes('next visit') ||
      lowerText.includes('checkup date') ||
      lowerText.includes('அப்பாயிண்ட்மெண்ட்') ||
      lowerText.includes('சந்திப்பு') ||
      lowerText.includes('అపాయింట్మెంట్') ||
      lowerText.includes('అపాయింట్‌మెంట్') ||
      lowerText.includes('അപ്പോയിന്റ്മെന്റ്') ||
      lowerText.includes('ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್') ||
      lowerText.includes('अपॉइंटमेंट') ||
      lowerText.includes('मुलाकात')
    ) {
      try {
        const appts = await db.appointments.where({ patientId }).toArray();
        const activeAppt = appts.find((a) => a.status === 'scheduled');
        if (activeAppt) {
          customContextResponse = this.formatContextMessage(
            `Your next appointment is scheduled on ${activeAppt.date} for "${activeAppt.reason}".`,
            `உங்கள் அடுத்த மருத்துவ சந்திப்பு ${activeAppt.date} அன்று "${activeAppt.reason}" காரணத்திற்காக திட்டமிடப்பட்டுள்ளது.`,
            `మీ తదుపరి అపాయింట్‌మెంట్ ${activeAppt.date}న "${activeAppt.reason}" కొరకు నిర్ణయించబడింది.`,
            `നിങ്ങളുടെ അടുത്ത അപ്പോയിന്റ്മെന്റ് ${activeAppt.date}-ൽ "${activeAppt.reason}"-നായി നിശ്ചയിച്ചിട്ടുണ്ട്.`,
            `ನಿಮ್ಮ ಮುಂದಿನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ${activeAppt.date} ರಂದು "${activeAppt.reason}" ಗಾಗಿ ನಿಗದಿಯಾಗಿದೆ.`,
            `आपकी अगली मुलाकात ${activeAppt.date} को "${activeAppt.reason}" के लिए निर्धारित है।`,
            currentLang
          );
        } else {
          customContextResponse = this.formatContextMessage(
            'No appointment is recorded in Medora.',
            'மெடோராவில் எந்த சந்திப்பும் பதிவு செய்யப்படவில்லை.',
            'మెడోరాలో ఎటువంటి అపాయింట్‌మెంట్ నమోదు కాలేదు.',
            'മെഡോറയിൽ അപ്പോയിന്റ്മെന്റുകളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.',
            'ಮೆಡೋರಾದಲ್ಲಿ ಯಾವುದೇ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದಾಖಲಾಗಿಲ್ಲ.',
            'मेडोरा में कोई अपॉइंटमेंट दर्ज नहीं है।',
            currentLang
          );
        }
      } catch {
        customContextResponse = this.formatContextMessage(
          'No appointment is recorded in Medora.',
          'மெடோராவில் எந்த சந்திப்பும் பதிவு செய்யப்படவில்லை.',
          'మెడోరాలో ఎటువంటి అపాయింట్‌మెంట్ నమోదు కాలేదు.',
          'മെഡോറയിൽ അപ്പോയിന്റ്മെന്റുകളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.',
          'ಮೆಡೋರಾದಲ್ಲಿ ಯಾವುದೇ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದಾಖಲಾಗಿಲ್ಲ.',
          'मेडोरा में कोई अपॉइंटमेंट दर्ज नहीं है।',
          currentLang
        );
      }
    }

    // Medicine timing / schedule query: Check actual IndexedDB medicines
    if (
      lowerText.includes('when should i take my medicine') ||
      lowerText.includes('medicine timing') ||
      lowerText.includes('medicine reminder') ||
      lowerText.includes('take my medicine') ||
      lowerText.includes('மருந்து நேரம்') ||
      lowerText.includes('மருந்து எப்போது') ||
      lowerText.includes('మందుల సమయం') ||
      lowerText.includes('మందులు ఎప్పుడు వేసుకోవాలి') ||
      lowerText.includes('മരുന്ന് എപ്പോൾ കഴിക്കണം') ||
      lowerText.includes('ಔಷಧ ಯಾವಾಗ ತೆಗೆದುಕೊಳ್ಳಬೇಕು') ||
      lowerText.includes('दवा कब लेनी है') ||
      lowerText.includes('दवा का समय')
    ) {
      try {
        const meds = await db.medicines.where({ patientId, status: 'active' }).toArray();
        if (meds && meds.length > 0) {
          const medScheduleList = meds.map((m) => `${m.name}: ${m.times.join(', ')} (${m.instructions || m.frequency})`).join('; ');
          customContextResponse = this.formatContextMessage(
            `Your recorded medicine schedule: ${medScheduleList}. Always consult your doctor before modifying dose.`,
            `உங்கள் பதிவு செய்யப்பட்ட மருந்து அட்டவணை: ${medScheduleList}. மருந்து அளவை மாற்றும் முன் மருத்துவரை அணுகவும்.`,
            `మీ నమోదైన మందుల సమయాలు: ${medScheduleList}. మోతాదు మార్చే ముందు ఎల్లప్పుడూ వైద్యుడిని సంప్రదించండి.`,
            `നിങ്ങളുടെ രേഖപ്പെടുത്തിയ മരുന്ന് ഷെഡ്യൂൾ: ${medScheduleList}. ഡോസ് മാറ്റുന്നതിന് മുൻപ് ഡോക്ടറോട് ചോദിക്കുക.`,
            `ನಿಮ್ಮ ದಾಖಲಾದ ಔಷಧ ವೇಳಾಪಟ್ಟಿ: ${medScheduleList}. ಡೋಸ್ ಬದಲಾಯಿಸುವ ಮುನ್ನ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.`,
            `आपकी दर्ज दवा अनुसूची: ${medScheduleList}। खुराक बदलने से पहले हमेशा डॉक्टर से सलाह लें।`,
            currentLang
          );
        } else {
          customContextResponse = this.formatContextMessage(
            'Medicine timing is not recorded in Medora.',
            'மெடோராவில் மருந்து நேரம் பதிவு செய்யப்படவில்லை.',
            'మెడోరాలో మందుల సమయం నమోదు కాలేదు.',
            'മെഡോറയിൽ മരുന്നിന്റെ സമയം രേഖപ്പെടുത്തിയിട്ടില്ല.',
            'ಮೆಡೋರಾದಲ್ಲಿ ಔಷಧದ ಸಮಯ ದಾಖಲಾಗಿಲ್ಲ.',
            'मेडोरा में दवा का समय दर्ज नहीं है।',
            currentLang
          );
        }
      } catch {
        customContextResponse = this.formatContextMessage(
          'Medicine timing is not recorded in Medora.',
          'மெடோராவில் மருந்து நேரம் பதிவு செய்யப்படவில்லை.',
          'మెడోరాలో మందుల సమయం నమోదు కాలేదు.',
          'മെഡോറയിൽ മരുന്നിന്റെ സമയം രേഖപ്പെടുത്തിയിട്ടില്ല.',
          'ಮೆಡೋರಾದಲ್ಲಿ ಔಷಧದ ಸಮಯ ದಾಖಲಾಗಿಲ್ಲ.',
          'मेडोरा में दवा का समय दर्ज नहीं है।',
          currentLang
        );
      }
    }

    // Blood pressure context
    if (
      lowerText.includes('last bp') ||
      lowerText.includes('my bp') ||
      lowerText.includes('ரத்த அழுத்தம்') ||
      lowerText.includes('బీపీ') ||
      lowerText.includes('രക്തസമ്മർദ്ദം') ||
      lowerText.includes('ರಕ್ತದೊತ್ತಡ') ||
      lowerText.includes('रक्तचाप') ||
      lowerText.includes('ब्लड प्रेशर')
    ) {
      try {
        const tests = await db.healthTests.where({ patientId, type: 'blood_pressure' }).toArray();
        if (tests.length > 0) {
          const lastBp = tests[tests.length - 1];
          customContextResponse = this.formatContextMessage(
            `Your last recorded Blood Pressure was ${lastBp.value} ${lastBp.unit} on ${lastBp.date}.`,
            `உங்கள் கடைசியாக பதிவு செய்யப்பட்ட ரத்த அழுத்தம் ${lastBp.value} ${lastBp.unit} (${lastBp.date}).`,
            `మీ చివరిగా నమోదైన రక్తపోటు ${lastBp.value} ${lastBp.unit} (${lastBp.date}).`,
            `നിങ്ങളുടെ അവസാന രക്തസമ്മർദ്ദം ${lastBp.value} ${lastBp.unit} (${lastBp.date}) ആയിരുന്നു.`,
            `ನಿಮ್ಮ ಕೊನೆಯ ರಕ್ತದೊತ್ತಡ ${lastBp.value} ${lastBp.unit} (${lastBp.date}) ಇತ್ತು.`,
            `आपका अंतिम दर्ज रक्तचाप ${lastBp.value} ${lastBp.unit} (${lastBp.date}) था।`,
            currentLang
          );
        }
      } catch {}
    }

    // 5. Evidence-based clinical guidance
    const clinicalGuidance = medicalSafetyEngine.generateClinicalGuidance(
      text,
      currentLang,
      state.patientContext
    );

    const templateObj = HEALTH_KNOWLEDGE_BASE[classification.intent] || HEALTH_KNOWLEDGE_BASE['GENERAL_HEALTH'];
    const localized = templateObj.templates[currentLang] || templateObj.templates['en-IN'];

    let rawResponse = customContextResponse || clinicalGuidance.fullFormattedResponse;
    if (classification.isEmergency && !customContextResponse) {
      rawResponse = clinicalGuidance.fullFormattedResponse;
      isEmergency = true;
    }

    // 6. Restore protected values and validate integrity
    const restoredResponse = restoreMedicalValues(rawResponse, protectedValues);
    const validation = validatePreservedMedicalValues(text, restoredResponse);
    const finalResponseText = validation.isValid ? restoredResponse : validation.safeOutput;

    // 7. Track conversation state
    conversationMemory.addMessage({
      role: 'user',
      content: text,
      language: currentLang,
    });

    if (classification.matchedKeywords.length > 0) {
      state.symptoms = Array.from(new Set([...state.symptoms, ...classification.matchedKeywords]));
    }

    conversationMemory.addMessage({
      role: 'assistant',
      content: finalResponseText,
      language: currentLang,
      intent: classification.intent,
      agentName: templateObj.agentName,
      isEmergency,
    });

    return {
      userText: text,
      detectedLanguage: currentLang,
      languageConfidence: detection.confidence,
      confidenceLevel: detection.confidenceLevel,
      intent: classification.intent,
      agentName: templateObj.agentName,
      isEmergency,
      responseText: finalResponseText,
      followUpQuestion: localized.followUpQuestion,
      safetyGuidance: localized.safetyGuidance,
      durationIdentified: classification.durationIdentified,
    };
  }

  /**
   * Process a USSD Natural Language Query using the same medical AI / rule engine.
   * Produces a concise, basic-phone friendly response and options.
   */
  public async processUssdTurn(
    queryText: string,
    appLanguage: string,
    existingSessionId?: string,
    patientId?: number
  ): Promise<UssdTurnResult> {
    const bcpMap: Record<string, SupportedLanguageCode> = {
      ta: 'ta-IN',
      te: 'te-IN',
      ml: 'ml-IN',
      kn: 'kn-IN',
      hi: 'hi-IN',
      en: 'en-IN',
    };

    const targetLang = bcpMap[appLanguage] || 'en-IN';
    const turnResult = await this.processUserInput(queryText, targetLang, targetLang, patientId);

    // Create or retrieve session in IndexedDB
    const sessionId = existingSessionId || `ussd_${Date.now()}`;
    const sessionRecord: UssdSessionRecord = {
      ussdSessionId: sessionId,
      patientId: patientId || 1,
      language: appLanguage,
      previousSymptom: turnResult.intent,
      duration: turnResult.durationIdentified,
      lastIntent: turnResult.intent,
      lastResponse: turnResult.responseText,
      lastUpdated: new Date().toISOString(),
    };

    try {
      await db.ussdSessions.put(sessionRecord);
      await db.ussdMessages.add({
        sessionId,
        role: 'user',
        text: queryText,
        intent: turnResult.intent,
        isEmergency: turnResult.isEmergency,
        timestamp: new Date().toISOString(),
      });
      await db.ussdMessages.add({
        sessionId,
        role: 'assistant',
        text: turnResult.responseText,
        intent: turnResult.intent,
        isEmergency: turnResult.isEmergency,
        timestamp: new Date().toISOString(),
      });
    } catch {}

    // Build short USSD-friendly summary text (max 2-3 lines for basic phones)
    let shortUssdText = turnResult.responseText;
    // Strip long academic disclaimers for USSD view, keeping core medical safety
    if (shortUssdText.length > 200) {
      const sentences = shortUssdText.split(/[.!?।]\s+/);
      shortUssdText = sentences.slice(0, 2).join('. ') + '.';
    }

    const options = [
      { num: 1, label: this.getOptionLabel(1, appLanguage), action: 'doctor' },
      { num: 2, label: this.getOptionLabel(2, appLanguage), action: 'hospital' },
      { num: 3, label: this.getOptionLabel(3, appLanguage), action: 'emergency' },
      { num: 4, label: this.getOptionLabel(4, appLanguage), action: 'ask_again' },
      { num: 5, label: this.getOptionLabel(5, appLanguage), action: 'main_menu' },
    ];

    return {
      session: sessionRecord,
      responseText: shortUssdText,
      isEmergency: turnResult.isEmergency,
      intent: turnResult.intent,
      language: appLanguage,
      options,
    };
  }

  private getOptionLabel(opt: number, lang: string): string {
    const labels: Record<number, Record<string, string>> = {
      1: { en: '1. My Doctor', ta: '1. மருத்துவர்', te: '1. నా డాక్టర్', ml: '1. ഡോക്ടർ', kn: '1. ವೈದ್ಯರು', hi: '1. मेरे डॉक्टर' },
      2: { en: '2. Hospital', ta: '2. மருத்துவமனை', te: '2. ఆసుపత్రి', ml: '2. ആശുപത്രി', kn: '2. ಆಸ್ಪತ್ರೆ', hi: '2. अस्पताल' },
      3: { en: '3. Emergency', ta: '3. அவசர உதவி', te: '3. అత్యవసరం', ml: '3. അടിയന്തിരം', kn: '3. ತುರ್ತುಸ್ಥಿತಿ', hi: '3. आपातकालीन' },
      4: { en: '4. Ask Again', ta: '4. மீண்டும் கேட்க', te: '4. మళ్లీ అడగండి', ml: '4. വീണ്ടും ചോദിക്കുക', kn: '4. ಮತ್ತೆ ಕೇಳಿ', hi: '4. दोबारा पूछें' },
      5: { en: '5. Main Menu', ta: '5. முதன்மை பட்டியல்', te: '5. ప్రధాన మెనూ', ml: '5. പ്രധാന മെനു', kn: '5. ಮುಖ್ಯ ಮೆನು', hi: '5. मुख्य मेनू' },
    };
    return labels[opt]?.[lang] || labels[opt]?.['en'] || `Option ${opt}`;
  }

  private formatContextMessage(
    en: string,
    ta: string,
    te: string,
    ml: string,
    kn: string,
    hi: string,
    lang: SupportedLanguageCode
  ): string {
    switch (lang) {
      case 'ta-IN':
        return ta;
      case 'te-IN':
        return te;
      case 'ml-IN':
        return ml;
      case 'kn-IN':
        return kn;
      case 'hi-IN':
        return hi;
      case 'en-IN':
      default:
        return en;
    }
  }

  public getConversationState(): ConversationState {
    return conversationMemory.getState();
  }

  public resetConversation(preferredLanguage?: SupportedLanguageCode, patientId?: number) {
    conversationMemory.reset(preferredLanguage, patientId);
  }
}

export const conversationEngine = new ConversationEngine();

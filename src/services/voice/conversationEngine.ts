import { SupportedLanguageCode, LANGUAGE_METADATA } from '../../data/languages';
import { HEALTH_KNOWLEDGE_BASE, HealthcareIntent } from '../../data/healthKnowledge/knowledgeBase';
import { languageDetectionService, LanguageDetectionResult } from './languageDetectionService';
import { intentClassifier, IntentClassificationResult } from './intentClassifier';
import { conversationMemory, ConversationState } from './conversationMemory';
import { db } from '../../db/db';

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
}

export class ConversationEngine {
  /**
   * Main entry point for processing any user utterance (from microphone or telephony).
   */
  public async processUserInput(
    rawText: string,
    overrideLanguage?: SupportedLanguageCode
  ): Promise<ProcessedConversationTurn> {
    const text = (rawText || '').trim();
    const state = conversationMemory.getState();

    // 1. Automatic Language Detection
    let detection: LanguageDetectionResult;
    if (overrideLanguage) {
      detection = {
        language: overrideLanguage,
        confidence: 1.0,
        confidenceLevel: 'high',
        method: 'explicit',
        detectedScripts: {},
        matchedKeywords: []
      };
      conversationMemory.updateLanguage(overrideLanguage, 1.0, true);
    } else {
      detection = languageDetectionService.detectLanguage(
        text,
        state.languageLocked ? state.detectedLanguage : undefined
      );
      conversationMemory.updateLanguage(detection.language, detection.confidence);
    }

    const currentLang = detection.language;

    // 2. Intent Classification
    const classification: IntentClassificationResult = intentClassifier.classifyIntent(text, currentLang);

    // 3. Check for specific Patient Context queries (e.g. "What is my BP?", "My medicines", etc.)
    let customContextResponse: string | null = null;
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes('last bp') ||
      lowerText.includes('my bp') ||
      lowerText.includes('ரத்த அழுத்தம்') ||
      lowerText.includes('బీపీ') ||
      lowerText.includes('രക്തസമ്മർദ്ദം') ||
      lowerText.includes('ರಕ್ತದೊತ್ತಡ')
    ) {
      if (state.patientContext?.recentVitals) {
        const bp = state.patientContext.recentVitals.find((v) => v.type === 'blood_pressure');
        if (bp) {
          customContextResponse = this.formatContextMessage(
            `Your last recorded Blood Pressure was ${bp.value} ${bp.unit} on ${bp.date.slice(0, 10)}.`,
            `உங்கள் கடைசியாக பதிவு செய்யப்பட்ட ரத்த அழுத்தம் ${bp.value} ${bp.unit} (${bp.date.slice(0, 10)}).`,
            `మీ చివరిగా నమోదైన రక్తపోటు ${bp.value} ${bp.unit} (${bp.date.slice(0, 10)}).`,
            `നിങ്ങളുടെ അവസാന രക്തസമ്മർദ്ദം ${bp.value} ${bp.unit} (${bp.date.slice(0, 10)}) ആയിരുന്നു.`,
            `ನಿಮ್ಮ ಕೊನೆಯ ರಕ್ತದೊತ್ತಡ ${bp.value} ${bp.unit} (${bp.date.slice(0, 10)}) ಇತ್ತು.`,
            currentLang
          );
        }
      }
    }

    if (
      lowerText.includes('my medicine') ||
      lowerText.includes('active medicines') ||
      lowerText.includes('என் மாத்திரை') ||
      lowerText.includes('నా మందులు') ||
      lowerText.includes('എന്റെ മരുന്ന്') ||
      lowerText.includes('ನನ್ನ ಔಷಧಿ')
    ) {
      if (state.patientContext?.activeMedicines && state.patientContext.activeMedicines.length > 0) {
        const medNames = state.patientContext.activeMedicines.map((m) => `${m.name} (${m.dose})`).join(', ');
        customContextResponse = this.formatContextMessage(
          `Your active prescribed medicines are: ${medNames}. Please take them as scheduled.`,
          `உங்கள் தற்போதைய மருந்துகள்: ${medNames}. நேரத்திற்கு உட்கொள்ளுங்கள்.`,
          `మీ ప్రస్తుత మందులు: ${medNames}. సమయానికి వేసుకోండి.`,
          `നിങ്ങളുടെ നിലവിലെ മരുന്നുകൾ: ${medNames}. സമയത്തിന് കഴിക്കുക.`,
          `ನಿಮ್ಮ ಸಕ್ರಿಯ ಔಷಧಗಳು: ${medNames}. ಸಮಯಕ್ಕೆ ಸೇವಿಸಿ.`,
          currentLang
        );
      }
    }

    // 4. Retrieve Knowledge Base Template
    const templateObj = HEALTH_KNOWLEDGE_BASE[classification.intent] || HEALTH_KNOWLEDGE_BASE['GENERAL_HEALTH'];
    const localized = templateObj.templates[currentLang] || templateObj.templates['en-IN'];

    let finalResponseText = customContextResponse || `${localized.primaryText} ${localized.followUpQuestion}`;
    if (classification.isEmergency) {
      finalResponseText = `${localized.primaryText}\n\n${localized.safetyGuidance}`;
    }

    // 5. Update Conversation State in Memory
    conversationMemory.addMessage({
      role: 'user',
      content: text,
      language: currentLang
    });

    conversationMemory.addMessage({
      role: 'assistant',
      content: finalResponseText,
      language: currentLang,
      intent: classification.intent,
      agentName: templateObj.agentName,
      isEmergency: classification.isEmergency
    });

    // 6. Save turn to IndexedDB
    if (state.patientId) {
      db.aiConversations
        .add({
          patientId: state.patientId,
          messages: [
            { role: 'user', content: text, timestamp: new Date().toISOString() },
            {
              role: 'assistant',
              content: finalResponseText,
              agentType: templateObj.agentName,
              timestamp: new Date().toISOString()
            }
          ],
          agentType: templateObj.agentName,
          createdAt: new Date().toISOString()
        })
        .catch(() => {});
    }

    return {
      userText: text,
      detectedLanguage: currentLang,
      languageConfidence: detection.confidence,
      confidenceLevel: detection.confidenceLevel,
      intent: classification.intent,
      agentName: templateObj.agentName,
      isEmergency: classification.isEmergency,
      responseText: finalResponseText,
      followUpQuestion: localized.followUpQuestion,
      safetyGuidance: localized.safetyGuidance
    };
  }

  private formatContextMessage(
    en: string,
    ta: string,
    te: string,
    ml: string,
    kn: string,
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

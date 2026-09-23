import { SupportedLanguageCode } from '../../data/languages';
import { HealthcareIntent } from '../../data/healthKnowledge/knowledgeBase';
import { db, Patient, Medicine, HealthTest } from '../../db/db';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language: SupportedLanguageCode;
  intent?: HealthcareIntent;
  agentName?: string;
  isEmergency?: boolean;
  timestamp: string;
}

export interface ConversationState {
  sessionId: string;
  detectedLanguage: SupportedLanguageCode;
  languageConfidence: number;
  languageLocked: boolean;
  previousLanguage?: SupportedLanguageCode;
  transcript: string;
  currentIntent: HealthcareIntent | null;
  activeAgent: string;
  patientId?: number;
  familyId?: number;
  symptoms: string[];
  duration?: string;
  severity?: string;
  emergencyDetected: boolean;
  previousMessages: ConversationMessage[];
  patientContext?: {
    patient?: Patient;
    activeMedicines?: Medicine[];
    recentVitals?: HealthTest[];
  };
}

export class ConversationMemory {
  private currentState: ConversationState;

  constructor() {
    this.currentState = this.createInitialState();
  }

  public createInitialState(preferredLanguage: SupportedLanguageCode = 'en-IN', patientId?: number): ConversationState {
    return {
      sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      detectedLanguage: preferredLanguage,
      languageConfidence: 0.5,
      languageLocked: false,
      transcript: '',
      currentIntent: null,
      activeAgent: 'General Physician Agent',
      patientId,
      symptoms: [],
      emergencyDetected: false,
      previousMessages: []
    };
  }

  public getState(): ConversationState {
    return this.currentState;
  }

  public updateLanguage(language: SupportedLanguageCode, confidence: number, isExplicit = false) {
    if (this.currentState.detectedLanguage !== language) {
      this.currentState.previousLanguage = this.currentState.detectedLanguage;
    }
    this.currentState.detectedLanguage = language;
    this.currentState.languageConfidence = confidence;
    if (confidence >= 0.85 || isExplicit) {
      this.currentState.languageLocked = true;
    }
  }

  public unlockLanguage() {
    this.currentState.languageLocked = false;
  }

  public addMessage(message: Omit<ConversationMessage, 'id' | 'timestamp'>): ConversationMessage {
    const fullMsg: ConversationMessage = {
      ...message,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString()
    };
    this.currentState.previousMessages.push(fullMsg);
    return fullMsg;
  }

  public async loadPatientContext(patientId?: number) {
    if (!patientId) return;
    this.currentState.patientId = patientId;
    try {
      const patient = await db.patients.get(patientId);
      const activeMedicines = await db.medicines.where({ patientId, status: 'active' }).toArray();
      const recentVitals = await db.healthTests.where('patientId').equals(patientId).reverse().limit(5).toArray();

      this.currentState.patientContext = {
        patient,
        activeMedicines,
        recentVitals
      };
      if (patient?.familyId) {
        this.currentState.familyId = patient.familyId;
      }
    } catch (e) {
      console.warn('Could not load patient context from IndexedDB:', e);
    }
  }

  public reset(preferredLanguage: SupportedLanguageCode = 'en-IN', patientId?: number) {
    this.currentState = this.createInitialState(preferredLanguage, patientId);
  }
}

export const conversationMemory = new ConversationMemory();

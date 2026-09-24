import {
  db,
  LanguageBridgeCorrection,
  LanguageBridgeMessage,
  LanguageBridgeSession,
} from '../../db/db';
import { SupportedLanguageCode } from '../../data/languages';
import { BridgeTranslationResult } from '../../data/languageBridge/types';

export async function createBridgeSession(params: {
  patientId?: number;
  doctorId?: number;
  patientLanguage: SupportedLanguageCode;
  doctorLanguage: SupportedLanguageCode;
  autoDetect: boolean;
  commonLanguage: boolean;
}): Promise<number> {
  const now = new Date().toISOString();
  return db.languageBridgeSessions.add({
    ...params,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });
}

export async function endBridgeSession(sessionId: number): Promise<void> {
  await db.languageBridgeSessions.update(sessionId, {
    status: 'ended',
    updatedAt: new Date().toISOString(),
  });
}

export async function saveBridgeMessage(
  sessionId: number,
  speaker: LanguageBridgeMessage['speaker'],
  result: BridgeTranslationResult
): Promise<number> {
  return db.languageBridgeMessages.add({
    sessionId,
    speaker,
    originalLanguage: result.originalLanguage,
    originalText: result.originalText,
    translatedLanguage: result.translatedLanguage,
    translatedText: result.translatedText,
    translationConfidence: result.translationConfidence,
    translationStatus: result.translationStatus,
    timestamp: new Date().toISOString(),
    isEmergency: result.isEmergency,
    isCritical: result.isCritical,
    needsConfirmation: result.needsConfirmation,
    machineTranslation: result.translatedText,
  });
}

export async function loadSessionMessages(sessionId: number): Promise<LanguageBridgeMessage[]> {
  return db.languageBridgeMessages.where({ sessionId }).sortBy('timestamp');
}

export async function clearSessionMessages(sessionId: number): Promise<void> {
  await db.languageBridgeMessages.where({ sessionId }).delete();
}

export async function saveTranslationCorrection(params: LanguageBridgeCorrection): Promise<number> {
  const id = await db.languageBridgeCorrections.add(params);
  if (params.sessionId && params.correctedTranslation) {
    const messages = await db.languageBridgeMessages.where({ sessionId: params.sessionId }).toArray();
    const last = [...messages].reverse().find((m) => m.originalText === params.original);
    if (last?.id) {
      await db.languageBridgeMessages.update(last.id, {
        correctedTranslation: params.correctedTranslation,
        translatedText: params.correctedTranslation,
        translationStatus: 'Corrected',
      });
    }
  }
  return id;
}

export async function getLatestActiveSession(
  patientId?: number
): Promise<LanguageBridgeSession | undefined> {
  const all = await db.languageBridgeSessions.where('status').equals('active').toArray();
  if (patientId) {
    return all.filter((s) => s.patientId === patientId).sort((a, b) => (b.id || 0) - (a.id || 0))[0];
  }
  return all.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
}

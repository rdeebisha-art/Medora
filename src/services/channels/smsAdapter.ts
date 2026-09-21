import { OutgoingSMSMessage, SharedResponseObject } from './channelTypes';

const smsLog: OutgoingSMSMessage[] = [];

export const sendSMS = (recipientPhone: string, content: string): OutgoingSMSMessage => {
  const smsMessage: OutgoingSMSMessage = {
    id: `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipientPhone,
    content,
    status: 'DELIVERED',
    timestamp: new Date().toISOString(),
    isDemo: true,
  };

  smsLog.push(smsMessage);
  return smsMessage;
};

export const formatSMSResponse = (shared: SharedResponseObject): string => {
  const urgencyLabel = shared.urgency === 'CRITICAL' ? '🚨 CRITICAL' : shared.urgency === 'URGENT' ? '⚠️ URGENT' : 'ℹ️ MEDORA';
  const guidance = shared.generalGuidance.slice(0, 2).join('; ');

  return `[${urgencyLabel}] Medora Health Summary for Patient ${shared.patientId}: ${shared.summary}. Guidance: ${guidance || 'Rest and stay hydrated.'} Clinician review advised. (DEMO SMS GATEWAY)`;
};

export const getSMSLog = (): OutgoingSMSMessage[] => smsLog;

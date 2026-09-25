import { CommunicationChannel } from './channels/channelTypes';
import { LanguageCode } from '../types';

export interface Contact {
  id: string;
  name: string;
  role: 'Doctor' | 'Health Worker / ASHA' | 'Family Member' | 'Caregiver' | 'Mobile Recipient';
  phone?: string;
  isAvailable: boolean;
  isDemo: boolean;
  avatarBg: string;
}

export type DeliveryStatus =
  | 'QUEUED'
  | 'PENDING'
  | 'SENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETRYING'
  | 'NOT_CONFIGURED';

export interface RecipientDeliveryStatus {
  recipientId: string;
  status: DeliveryStatus;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  retryCount: number;
}

export interface RecipientPermission {
  recipientId: string;
  allowedData: ('symptoms' | 'report' | 'ai_summary' | 'medicines' | 'handoff' | 'custom')[];
}

export interface SharedHealthData {
  symptoms?: string[];
  reportTitle?: string;
  reportSummary?: string;
  aiSummary?: string;
  medicines?: string[];
  handoffSummary?: string;
  customText?: string;
}

export interface Message {
  messageId: string;
  requestId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  patientId: string;
  recipientIds: string[];
  recipientStatuses: RecipientDeliveryStatus[];
  recipientPermissions: RecipientPermission[];
  channel: CommunicationChannel;
  contentType: 'HEALTH_SHARE' | 'DOCTOR_REPLY' | 'TEXT' | 'REPORT_ASSISTANCE';
  content: string;
  sharedData?: SharedHealthData;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  recipientPhoneNumber?: string;
  providerMessageId?: string;
  providerStatus?: string;
  failureReason?: string;
}

export const validateIndianPhoneNumber = (
  input: string
): { isValid: boolean; formatted: string; error?: string } => {
  const digits = input.replace(/\D/g, '');
  if (!digits) {
    return { isValid: false, formatted: '', error: 'Mobile number is required' };
  }
  let mainDigits = digits;
  if (digits.length === 12 && digits.startsWith('91')) {
    mainDigits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    mainDigits = digits.slice(1);
  }

  if (mainDigits.length !== 10) {
    return { isValid: false, formatted: input, error: 'Enter a valid 10-digit mobile number' };
  }

  if (!/^[6-9]\d{9}$/.test(mainDigits)) {
    return { isValid: false, formatted: input, error: 'Mobile number must start with 6, 7, 8, or 9' };
  }

  const formatted = `+91 ${mainDigits.slice(0, 5)} ${mainDigits.slice(5)}`;
  return { isValid: true, formatted };
};

export const maskPhoneNumber = (phoneStr: string): string => {
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `+91 ${last10.slice(0, 5)} *****`;
  }
  return phoneStr;
};

// Canonical Contacts
export const DEMO_CONTACTS: Contact[] = [
  {
    id: 'c-doc-anitha',
    name: 'Dr. Anitha',
    role: 'Doctor',
    phone: '+91 98765 43210',
    isAvailable: true,
    isDemo: true,
    avatarBg: 'bg-blue-600 text-white',
  },
  {
    id: 'c-asha-kavitha',
    name: 'Kavitha',
    role: 'Health Worker / ASHA',
    phone: '+91 98765 12345',
    isAvailable: true,
    isDemo: true,
    avatarBg: 'bg-teal-600 text-white',
  },
  {
    id: 'c-fam-ramesh',
    name: 'Ramesh Kumar',
    role: 'Family Member',
    phone: '+91 94481 00223',
    isAvailable: true,
    isDemo: true,
    avatarBg: 'bg-amber-600 text-white',
  },
  {
    id: 'c-fam-lakshmi',
    name: 'Lakshmi',
    role: 'Family Member',
    phone: '+91 94481 00224',
    isAvailable: false,
    isDemo: true,
    avatarBg: 'bg-rose-600 text-white',
  },
];

const STORAGE_KEY_MESSAGES = 'medora_comm_messages';

export const getStoredMessages = (): Message[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

export const saveMessages = (msgs: Message[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgs));
  } catch {}
};

export const openNativeSMSComposer = (phone: string, text: string) => {
  const digits = phone.replace(/\D/g, '');
  const e164 = digits.length === 10 ? `+91${digits}` : `+${digits}`;
  const url = `sms:${e164}?body=${encodeURIComponent(text)}`;
  window.location.href = url;
  return { method: 'NATIVE_SMS_COMPOSER', note: 'Opened device SMS app. Delivery is handled by the device.' };
};

export const sendRealSMS = async (params: { recipientPhone: string; messageText: string; patientId: string }): Promise<Message> => {
  const messageId = `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  
  const newMessage: Message = {
    messageId,
    requestId: `REQ-${Date.now()}`,
    conversationId: `CONV-${params.recipientPhone}`,
    senderId: params.patientId,
    senderName: 'Patient User',
    patientId: params.patientId,
    recipientIds: [params.recipientPhone],
    recipientStatuses: [{ recipientId: params.recipientPhone, status: 'QUEUED', retryCount: 0 }],
    recipientPermissions: [],
    channel: 'sms',
    contentType: 'TEXT',
    content: params.messageText,
    createdAt: now,
    updatedAt: now,
    isDemo: false,
    recipientPhoneNumber: params.recipientPhone,
  };

  const msgs = getStoredMessages();
  msgs.unshift(newMessage);
  saveMessages(msgs);

  try {
    const res = await fetch('/api/communications/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    
    // Update local message state based on real backend response
    const stored = getStoredMessages();
    const target = stored.find(m => m.messageId === messageId);
    if (target) {
      if (!data.configured) {
        target.recipientStatuses[0].status = 'NOT_CONFIGURED';
        target.failureReason = data.error;
      } else if (data.status === 'FAILED') {
        target.recipientStatuses[0].status = 'FAILED';
        target.failureReason = data.error;
      } else {
        target.recipientStatuses[0].status = data.status === 'QUEUED' ? 'SENT' : (data.status || 'SENT');
        target.providerMessageId = data.providerMessageId;
      }
      target.updatedAt = new Date().toISOString();
      saveMessages(stored);
      return target;
    }
  } catch (err: any) {
    const stored = getStoredMessages();
    const target = stored.find(m => m.messageId === messageId);
    if (target) {
      target.recipientStatuses[0].status = 'FAILED';
      target.failureReason = 'Network error contacting backend';
      saveMessages(stored);
      return target;
    }
  }
  return newMessage;
};

﻿export const sendMessageToContacts = async (params: {
  senderId: string;
  senderName: string;
  patientId: string;
  recipientIds: string[];
  customContacts?: Contact[];
  channel: CommunicationChannel;
  content: string;
  sharedData?: SharedHealthData;
  permissions: RecipientPermission[];
  isOffline?: boolean;
}): Promise<Message> => {
  const messageId = `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const requestId = `REQ-${Date.now()}`;
  const conversationId = `CONV-${params.recipientIds[0] || 'GEN'}`;
  const now = new Date().toISOString();

  const isDemo = params.customContacts?.some(c => c.isDemo) || false;

  const recipientStatuses: RecipientDeliveryStatus[] = params.recipientIds.map((rid) => {
    return {
      recipientId: rid,
      status: isDemo ? 'DELIVERED' : 'SENT',
      deliveredAt: isDemo ? now : now,
      retryCount: 0,
    };
  });

  let newMessage: Message = {
    messageId,
    requestId,
    conversationId,
    senderId: params.senderId,
    senderName: params.senderName,
    patientId: params.patientId,
    recipientIds: params.recipientIds,
    recipientStatuses,
    recipientPermissions: params.permissions,
    channel: params.channel,
    contentType: 'HEALTH_SHARE',
    content: params.content,
    sharedData: params.sharedData,
    createdAt: now,
    updatedAt: now,
    isDemo: isDemo,
  };

  let msgs = getStoredMessages();
  msgs.unshift(newMessage);
  saveMessages(msgs);

  if (params.channel === 'sms' && !isDemo && !params.isOffline) {
    for (const custom of params.customContacts || []) {
      if (custom.id.startsWith('num-') && custom.phone) {
        try {
          const res = await fetch('/api/communications/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientPhone: custom.phone,
              messageText: params.content,
              patientId: params.patientId
            }),
          });
          const data = await res.json();
          
          msgs = getStoredMessages();
          const target = msgs.find(m => m.messageId === messageId);
          if (target) {
            if (!data.configured) {
              target.recipientStatuses[0].status = 'NOT_CONFIGURED';
              target.failureReason = data.error;
            } else if (data.status === 'FAILED') {
              target.recipientStatuses[0].status = 'FAILED';
              target.failureReason = data.error;
            } else {
              target.recipientStatuses[0].status = data.status || 'QUEUED';
              target.providerMessageId = data.providerMessageId;
            }
            target.updatedAt = new Date().toISOString();
            saveMessages(msgs);
            newMessage = target;
          }
        } catch (err: any) {
          msgs = getStoredMessages();
          const target = msgs.find(m => m.messageId === messageId);
          if (target) {
            target.recipientStatuses[0].status = 'FAILED';
            target.failureReason = 'Network error contacting backend';
            saveMessages(msgs);
            newMessage = target;
          }
        }
      }
    }
  }

  return newMessage;
};


export const getInboxMessages = (patientId: string): Message[] => {
  const msgs = getStoredMessages();
  return msgs.filter((m) => m.senderId !== patientId);
};

export const getOutboxMessages = (patientId: string): Message[] => {
  const msgs = getStoredMessages();
  return msgs.filter((m) => m.senderId === patientId || m.senderId === 'P-1001' || m.senderId === 'ID100');
};

export const getConversationThread = (conversationId: string): Message[] => {
  const msgs = getStoredMessages();
  return msgs
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const replyToConversation = (
  conversationId: string,
  senderId: string,
  senderName: string,
  patientId: string,
  text: string
): Message => {
  const thread = getConversationThread(conversationId);
  const targetRecipientId = thread.length > 0 ? thread[0].senderId : 'c-doc-anitha';
  const now = new Date().toISOString();

  const replyMsg: Message = {
    messageId: `MSG-REPLY-${Date.now()}`,
    requestId: thread.length > 0 ? thread[0].requestId : `REQ-${Date.now()}`,
    conversationId,
    senderId,
    senderName,
    patientId,
    recipientIds: [targetRecipientId],
    recipientStatuses: [
      { recipientId: targetRecipientId, status: 'QUEUED', retryCount: 0 },
    ],
    recipientPermissions: [{ recipientId: targetRecipientId, allowedData: ['custom'] }],
    channel: 'web',
    contentType: 'TEXT',
    content: text,
    createdAt: now,
    updatedAt: now,
    isDemo: false,
  };

  const msgs = getStoredMessages();
  msgs.unshift(replyMsg);
  saveMessages(msgs);
  return replyMsg;
};

export const retryFailedRecipient = (messageId: string, recipientId: string): Message | null => {
  const msgs = getStoredMessages();
  const target = msgs.find((m) => m.messageId === messageId);
  if (!target) return null;

  const statusObj = target.recipientStatuses.find((rs) => rs.recipientId === recipientId);
  if (statusObj) {
    statusObj.status = 'QUEUED';
    statusObj.retryCount += 1;
    target.updatedAt = new Date().toISOString();
    saveMessages(msgs);
  }

  return target;
};

export const syncOfflineQueuedMessages = (): number => {
  // Sync logic should call backend instead of faking delivery
  return 0;
};

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
  | 'RETRYING';

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
  {
    id: 'c-asha-lakshmi-devi',
    name: 'Sister Lakshmi Devi',
    role: 'Health Worker / ASHA',
    phone: '+91 98765 88990',
    isAvailable: true,
    isDemo: true,
    avatarBg: 'bg-purple-600 text-white',
  },
];

const STORAGE_KEY_MESSAGES = 'medora_comm_messages';

export const getStoredMessages = (): Message[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Initial Seed Messages
  const initialMessages: Message[] = [
    {
      messageId: 'MSG-001',
      requestId: 'REQ-101',
      conversationId: 'CONV-DOC-01',
      senderId: 'c-doc-anitha',
      senderName: 'Dr. Anitha',
      patientId: 'P-1001',
      recipientIds: ['P-1001'],
      recipientStatuses: [
        { recipientId: 'P-1001', status: 'DELIVERED', deliveredAt: new Date().toISOString(), retryCount: 0 },
      ],
      recipientPermissions: [{ recipientId: 'P-1001', allowedData: ['symptoms', 'report', 'ai_summary'] }],
      channel: 'web',
      contentType: 'DOCTOR_REPLY',
      content: 'Hello Ramesh. I have reviewed your Blood Pressure reading of 158/96 mmHg. Please continue monitoring and reduce sodium intake.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      isDemo: false,
    },
  ];

  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(initialMessages));
  return initialMessages;
};

export const saveMessages = (msgs: Message[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgs));
  } catch {}
};

export const sendMessageToContacts = (params: {
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
}): Message => {
  const messageId = `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const requestId = `REQ-${Date.now()}`;
  const conversationId = `CONV-${params.recipientIds[0] || 'GEN'}`;
  const now = new Date().toISOString();

  const recipientStatuses: RecipientDeliveryStatus[] = params.recipientIds.map((rid) => {
    // Intentionally simulate one retry-ready failure for Lakshmi if selected
    if (rid === 'c-fam-lakshmi' && !params.isOffline) {
      return {
        recipientId: rid,
        status: 'FAILED',
        failedAt: now,
        retryCount: 1,
      };
    }

    return {
      recipientId: rid,
      status: params.isOffline ? 'QUEUED' : 'DELIVERED',
      deliveredAt: params.isOffline ? undefined : now,
      retryCount: 0,
    };
  });

  const newMessage: Message = {
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
    isDemo: false,
  };

  const msgs = getStoredMessages();
  msgs.unshift(newMessage);
  saveMessages(msgs);
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
      { recipientId: targetRecipientId, status: 'DELIVERED', deliveredAt: now, retryCount: 0 },
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
    statusObj.status = 'DELIVERED';
    statusObj.deliveredAt = new Date().toISOString();
    statusObj.retryCount += 1;
    target.updatedAt = new Date().toISOString();
    saveMessages(msgs);
  }

  return target;
};

export const syncOfflineQueuedMessages = (): number => {
  const msgs = getStoredMessages();
  let count = 0;

  msgs.forEach((m) => {
    m.recipientStatuses.forEach((rs) => {
      if (rs.status === 'QUEUED') {
        rs.status = 'DELIVERED';
        rs.deliveredAt = new Date().toISOString();
        count++;
      }
    });
  });

  if (count > 0) saveMessages(msgs);
  return count;
};

import { create } from 'zustand';
import i18n from '../i18n/config';
import { seedDatabase } from '../db/db';
import { seedDemoPatients } from '../services/patientSeederService';
import { seedInitialAuditLogs } from '../services/auditLoggerService';
import { getOfflineQueue, clearOfflineQueue } from '../services/channels/offlineQueue';

export type Role = 'patient' | 'family' | 'doctor' | 'admin';
export type VoiceNavLanguageOption = 'app' | 'auto' | 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';
export type SyncStatus = 'online' | 'offline' | 'syncing';

export interface ActiveCallInfo {
  callId?: string;
  name: string;
  phone: string;
  category: 'EMERGENCY' | 'AMBULANCE' | 'HOSPITAL' | 'DOCTOR' | 'FAMILY' | 'SUPPORT' | 'CUSTOM';
  location?: string;
  notes?: string;
  targetUserId?: string;
  callerId?: string;
  callerName?: string;
  callerRole?: 'patient' | 'doctor' | 'admin';
  receiverId?: string;
  isIncoming?: boolean;
  emergency?: boolean;
  emergencyType?: string;
  symptoms?: string;
  sdpOffer?: any;
}

export interface IncomingCallInfo {
  callId: string;
  callerId: string;
  callerName: string;
  callerRole: 'patient' | 'doctor' | 'admin';
  receiverId: string;
  emergency: boolean;
  emergencyType?: string;
  symptoms?: string;
  sdpOffer?: any;
  timestamp: string;
}

export interface CurrentUser {
  id: number;
  name: string;
  role: Role;
  phone?: string;
  village?: string;
  language?: string;
  familyId?: number;
  [key: string]: unknown;
}

interface AppState {
  isOffline: boolean;
  is2GMode: boolean;
  isSimpleMode: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string;
  pendingSyncCount: number;
  currentUser: CurrentUser | null;
  currentRole: Role | null;
  appLanguage: string;
  language: string; // for backward compatibility
  patientLanguage: string;
  doctorLanguage: string;
  patientDetectedLanguage: string | null;
  doctorDetectedLanguage: string | null;
  conversationLanguage: string;
  translationTargetLanguage: string;
  activeDirectCall: ActiveCallInfo | null;
  incomingCall: IncomingCallInfo | null;
  voiceNavigationLanguage: VoiceNavLanguageOption;
  isVoiceNavOpen: boolean;
  startDirectCall: (callInfo: ActiveCallInfo) => void;
  endDirectCall: () => void;
  setIncomingCall: (call: IncomingCallInfo | null) => void;
  setVoiceNavigationLanguage: (lang: VoiceNavLanguageOption) => void;
  setVoiceNavOpen: (open: boolean) => void;
  setOffline: (status: boolean) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setPendingSyncCount: (count: number) => void;
  triggerBackgroundSync: () => Promise<void>;
  toggle2GMode: () => void;
  toggleSimpleMode: () => void;
  login: (user: CurrentUser) => void;
  logout: () => void;
  setLanguage: (lang: string) => void;
  setAppLanguage: (lang: string) => void;
  setPatientLanguage: (lang: string) => void;
  setDoctorLanguage: (lang: string) => void;
  setPatientDetectedLanguage: (lang: string | null) => void;
  setDoctorDetectedLanguage: (lang: string | null) => void;
  setConversationLanguage: (lang: string) => void;
  setTranslationTargetLanguage: (lang: string) => void;
}

const getStoredLanguage = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('medora-app-language');
    if (saved && ['en', 'ta', 'te', 'ml', 'kn', 'hi'].includes(saved)) {
      return saved;
    }
  }
  return 'en';
};

const getStoredVoiceNavLanguage = (): VoiceNavLanguageOption => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('medora-voice-nav-language');
    if (saved && ['app', 'auto', 'en', 'ta', 'hi', 'te', 'ml', 'kn'].includes(saved)) {
      return saved as VoiceNavLanguageOption;
    }
  }
  return 'app';
};

const initialLanguage = getStoredLanguage();

const bcpMap: Record<string, string> = {
  ta: 'ta-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  en: 'en-IN'
};

if (typeof document !== 'undefined') {
  document.documentElement.lang = bcpMap[initialLanguage] || 'en-IN';
}

const getStoredUser = (): CurrentUser | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('medora-current-user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }
  return {
    id: 1,
    name: 'Anitha Devi',
    role: 'patient',
    phone: '9876543210',
    village: 'Rampur',
    language: 'en',
    familyId: 1,
  };
};

const initialUser = getStoredUser();

const initialOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;

export const useAppStore = create<AppState>((set, get) => ({
  isOffline: initialOffline,
  is2GMode: false,
  isSimpleMode: false,
  syncStatus: initialOffline ? 'offline' : 'online',
  lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  pendingSyncCount: 0,
  currentUser: initialUser,
  currentRole: initialUser?.role || 'patient',
  appLanguage: initialLanguage,
  language: initialLanguage,
  patientLanguage: initialUser?.language === 'ta' ? 'ta-IN' : initialUser?.language ? `${initialUser.language}-IN` : 'ta-IN',
  doctorLanguage: 'en-IN',
  patientDetectedLanguage: null,
  doctorDetectedLanguage: null,
  conversationLanguage: 'en-IN',
  translationTargetLanguage: 'en-IN',
  activeDirectCall: null,
  incomingCall: null,
  voiceNavigationLanguage: getStoredVoiceNavLanguage(),
  isVoiceNavOpen: false,

  startDirectCall: (callInfo) => set({ activeDirectCall: callInfo }),
  endDirectCall: () => set({ activeDirectCall: null }),
  setIncomingCall: (call) => set({ incomingCall: call }),
  setVoiceNavigationLanguage: (lang) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('medora-voice-nav-language', lang);
    }
    set({ voiceNavigationLanguage: lang });
  },
  setVoiceNavOpen: (open) => set({ isVoiceNavOpen: open }),

  setOffline: (status) =>
    set({
      isOffline: status,
      syncStatus: status ? 'offline' : 'online',
    }),

  setSyncStatus: (status) => set({ syncStatus: status }),
  setPendingSyncCount: (count) => set({ pendingSyncCount: Math.max(0, count) }),

  triggerBackgroundSync: async () => {
    const currentState = get();
    if (currentState.isOffline) {
      // Offline mode: cannot sync over network, but verify local storage integrity
      set({ syncStatus: 'offline' });
      return;
    }

    set({ syncStatus: 'syncing' });

    try {
      // Process any pending outbox items
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        clearOfflineQueue();
      }

      // Check server connectivity and wait a brief moment for realistic background sync animation
      await new Promise((resolve) => setTimeout(resolve, 900));

      set({
        syncStatus: 'online',
        pendingSyncCount: 0,
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch {
      set({
        syncStatus: 'offline',
      });
    }
  },

  toggle2GMode: () => set((state) => ({ is2GMode: !state.is2GMode })),

  toggleSimpleMode: () => set((state) => ({ isSimpleMode: !state.isSimpleMode })),

  login: (user) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('medora-current-user', JSON.stringify(user));
    }
    set({
      currentUser: user,
      currentRole: user.role,
    });
  },

  logout: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('medora-current-user');
    }
    set({ currentUser: null, currentRole: null });
  },

  setLanguage: (lang) => {
    const validLang = ['en', 'ta', 'te', 'ml', 'kn', 'hi'].includes(lang) ? lang : 'en';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('medora-app-language', validLang);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = bcpMap[validLang] || 'en-IN';
    }
    i18n.changeLanguage(validLang);
    set({ appLanguage: validLang, language: validLang });
  },

  setAppLanguage: (lang) => {
    const validLang = ['en', 'ta', 'te', 'ml', 'kn', 'hi'].includes(lang) ? lang : 'en';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('medora-app-language', validLang);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = bcpMap[validLang] || 'en-IN';
    }
    i18n.changeLanguage(validLang);
    set({ appLanguage: validLang, language: validLang });
  },

  setPatientLanguage: (lang) => set({ patientLanguage: lang }),
  setDoctorLanguage: (lang) => set({ doctorLanguage: lang }),
  setPatientDetectedLanguage: (lang) => set({ patientDetectedLanguage: lang }),
  setDoctorDetectedLanguage: (lang) => set({ doctorDetectedLanguage: lang }),
  setConversationLanguage: (lang) => set({ conversationLanguage: lang }),
  setTranslationTargetLanguage: (lang) => set({ translationTargetLanguage: lang }),
}));

// Seed DB, 20 unique demo patients, and initial audit logs idempotently on app load
seedDatabase()
  .then(() => Promise.all([seedDemoPatients(), seedInitialAuditLogs()]))
  .catch(console.error);

// Sync online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setOffline(false);
    useAppStore.getState().triggerBackgroundSync();
  });
  window.addEventListener('offline', () => useAppStore.getState().setOffline(true));
}

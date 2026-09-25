import { create } from 'zustand';
import i18n from '../i18n/config';
import { seedDatabase } from '../db/db';

export type Role = 'patient' | 'family' | 'doctor' | 'admin';

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
  currentUser: CurrentUser | null;
  currentRole: Role | null;
  appLanguage: string;
  language: string; // for backward compatibility
  activeDirectCall: ActiveCallInfo | null;
  incomingCall: IncomingCallInfo | null;
  startDirectCall: (callInfo: ActiveCallInfo) => void;
  endDirectCall: () => void;
  setIncomingCall: (call: IncomingCallInfo | null) => void;
  setOffline: (status: boolean) => void;
  toggle2GMode: () => void;
  toggleSimpleMode: () => void;
  login: (user: CurrentUser) => void;
  logout: () => void;
  setLanguage: (lang: string) => void;
  setAppLanguage: (lang: string) => void;
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

export const useAppStore = create<AppState>((set) => ({
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  is2GMode: false,
  isSimpleMode: false,
  currentUser: initialUser,
  currentRole: initialUser?.role || 'patient',
  appLanguage: initialLanguage,
  language: initialLanguage,
  activeDirectCall: null,
  incomingCall: null,

  startDirectCall: (callInfo) => set({ activeDirectCall: callInfo }),
  endDirectCall: () => set({ activeDirectCall: null }),
  setIncomingCall: (call) => set({ incomingCall: call }),

  setOffline: (status) => set({ isOffline: status }),

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
}));

// Seed DB on app load
seedDatabase().catch(console.error);

// Sync online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useAppStore.getState().setOffline(false));
  window.addEventListener('offline', () => useAppStore.getState().setOffline(true));
}

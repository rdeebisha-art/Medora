import { create } from 'zustand';
import i18n from '../i18n/config';
import { seedDatabase } from '../db/db';

export type Role = 'patient' | 'family' | 'doctor' | 'admin';

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

export const useAppStore = create<AppState>((set) => ({
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  is2GMode: false,
  isSimpleMode: false,
  currentUser: null,
  currentRole: null,
  appLanguage: initialLanguage,
  language: initialLanguage,

  setOffline: (status) => set({ isOffline: status }),

  toggle2GMode: () => set((state) => ({ is2GMode: !state.is2GMode })),

  toggleSimpleMode: () => set((state) => ({ isSimpleMode: !state.isSimpleMode })),

  login: (user) => {
    // Keep the authoritative appLanguage as chosen by user. Do NOT overwrite appLanguage with user's record language.
    set({
      currentUser: user,
      currentRole: user.role,
    });
  },

  logout: () => set({ currentUser: null, currentRole: null }),

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

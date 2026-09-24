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
  language: string;
  setOffline: (status: boolean) => void;
  toggle2GMode: () => void;
  toggleSimpleMode: () => void;
  login: (user: CurrentUser) => void;
  logout: () => void;
  setLanguage: (lang: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOffline: !navigator.onLine,
  is2GMode: false,
  isSimpleMode: false,
  currentUser: null,
  currentRole: null,
  language: 'en',

  setOffline: (status) => set({ isOffline: status }),

  toggle2GMode: () => set((state) => ({ is2GMode: !state.is2GMode })),

  toggleSimpleMode: () => set((state) => ({ isSimpleMode: !state.isSimpleMode })),

  login: (user) => set({
    currentUser: user,
    currentRole: user.role,
    language: (user.language as string) || 'en',
  }),

  logout: () => set({ currentUser: null, currentRole: null }),

  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
  },
}));

// Seed DB on app load
seedDatabase().catch(console.error);

// Sync online/offline status
window.addEventListener('online', () => useAppStore.getState().setOffline(false));
window.addEventListener('offline', () => useAppStore.getState().setOffline(true));

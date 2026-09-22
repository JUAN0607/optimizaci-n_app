import { create } from 'zustand';

import type { AppSettings } from '@/types/entities';

interface AppState {
  themeMode: AppSettings['themeMode'];
  onboardingCompleted: boolean;
  hydrated: boolean;
  dataVersion: number;
  setThemeMode: (mode: AppSettings['themeMode']) => void;
  setOnboardingCompleted: (value: boolean) => void;
  setHydrated: (value: boolean) => void;
  bumpDataVersion: () => void;
}

// Holds only small, cross-screen UI state. SQLite remains the source of truth for
// everything else — screens re-read from repositories when `dataVersion` changes.
export const useAppStore = create<AppState>((set) => ({
  themeMode: 'SYSTEM',
  onboardingCompleted: false,
  hydrated: false,
  dataVersion: 0,
  setThemeMode: (themeMode) => set({ themeMode }),
  setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
  setHydrated: (hydrated) => set({ hydrated }),
  bumpDataVersion: () => set((state) => ({ dataVersion: state.dataVersion + 1 })),
}));

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppMode = 'beginner' | 'intermediate' | 'advanced';
export type NightMode = 'standard' | 'global'; // global = Qiyam al-Layl
export type MadhabType = 'shafi' | 'hanafi';
export type ThemeType = 'light' | 'premium';

interface AppState {
  // Hydration flag — false until AsyncStorage has been read
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  // Onboarding
  onboardingComplete: boolean;
  appMode: AppMode;
  nightMode: NightMode;

  // Location
  latitude: number | null;
  longitude: number | null;
  locationGranted: boolean;
  notificationsGranted: boolean;

  // Prayer calculation method (adhan library)
  calculationMethod: string;
  madhab: MadhabType;

  // UI state
  isGoldenMomentActive: boolean;
  goldenMomentType: 'morning' | 'evening';
  theme: ThemeType;

  // Actions
  completeOnboarding: (mode: AppMode) => void;
  setAppMode: (mode: AppMode) => void;
  setNightMode: (mode: NightMode) => void;
  setLocation: (lat: number, lon: number) => void;
  setPermissions: (location: boolean, notifications: boolean) => void;
  setCalculationMethod: (method: string) => void;
  setMadhab: (madhab: MadhabType) => void;
  setGoldenMomentActive: (active: boolean, type?: 'morning' | 'evening') => void;
  setTheme: (theme: ThemeType) => void;
  resetOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      onboardingComplete: false,
      appMode: 'beginner',
      nightMode: 'standard',
      latitude: null,
      longitude: null,
      locationGranted: false,
      notificationsGranted: false,
      calculationMethod: 'MuslimWorldLeague',
      madhab: 'shafi',
      isGoldenMomentActive: false,
      goldenMomentType: 'morning',
      theme: 'premium',

      completeOnboarding: mode =>
        set({ onboardingComplete: true, appMode: mode }),

      setAppMode: mode => set({ appMode: mode }),
      setNightMode: mode => set({ nightMode: mode }),

      setLocation: (lat, lon) =>
        set({ latitude: lat, longitude: lon, locationGranted: true }),

      setPermissions: (location, notifications) =>
        set({ locationGranted: location, notificationsGranted: notifications }),

      setCalculationMethod: method => set({ calculationMethod: method }),
      setMadhab: madhab => set({ madhab }),

      setGoldenMomentActive: (active, type) =>
        set(s => ({ isGoldenMomentActive: active, goldenMomentType: type ?? s.goldenMomentType })),
      setTheme: theme => set({ theme }),
      resetOnboarding: () => set({ onboardingComplete: false }),
    }),
    {
      name: 'aqal-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Called as soon as AsyncStorage has been read and state restored
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

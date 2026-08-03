import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import type { PrayerName, KnowledgeCategory, ActivityType, SocialCategory, TarwihCategory } from '../constants/pillars';
export type { PrayerName };
import { computeBarakaScore, type BarakaScoreBreakdown } from '../engine/barakaScoring';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PrayerStatus = 'pending' | 'onTime' | 'late' | 'missed';

export interface DayRecord {
  date: string; // 'yyyy-MM-dd'

  spiritual: {
    prayers: Record<PrayerName, PrayerStatus>;
    rawatibFajr: boolean;
    goldenMomentCompleted: boolean;
    goldenMomentStartedAt: string | null; // ISO timestamp
    duhaDone: boolean;
    witrDone: boolean;
    adhkarMorningDone: boolean;
    adhkarEveningDone: boolean;
  };

  knowledge: {
    sessionDurationSeconds: number;
    category: KnowledgeCategory | null;
    noteText: string;
    sessionStartedAt: string | null;
    sessionCompletedAt: string | null;
  };

  physical: {
    activityType: ActivityType | null;
    activityDurationSeconds: number;
    activityCompletedAt: string | null;
    qaylulahDurationSeconds: number;
    qaylulahBeforeAfternoon: boolean;
    qaylulahCompletedAt: string | null;
  };

  social: {
    category: SocialCategory | null;
    interactionDurationSeconds: number;
    isDigital: boolean;
    noteText: string;
    completedAt: string | null;
  };

  sleep: {
    tarwihCategory: TarwihCategory | null;
    tarwihCompleted: boolean;
    tarwihDurationSeconds: number;
    bedtimeHour: number | null;
    nightSasActivated: boolean;
    qiyamDone: boolean;
  };
}

function createEmptyDay(date: string): DayRecord {
  return {
    date,
    spiritual: {
      prayers: { fajr: 'pending', dhuhr: 'pending', asr: 'pending', maghrib: 'pending', isha: 'pending' },
      rawatibFajr: false,
      goldenMomentCompleted: false,
      goldenMomentStartedAt: null,
      duhaDone: false,
      witrDone: false,
      adhkarMorningDone: false,
      adhkarEveningDone: false,
    },
    knowledge: {
      sessionDurationSeconds: 0,
      category: null,
      noteText: '',
      sessionStartedAt: null,
      sessionCompletedAt: null,
    },
    physical: {
      activityType: null,
      activityDurationSeconds: 0,
      activityCompletedAt: null,
      qaylulahDurationSeconds: 0,
      qaylulahBeforeAfternoon: false,
      qaylulahCompletedAt: null,
    },
    social: {
      category: null,
      interactionDurationSeconds: 0,
      isDigital: false,
      noteText: '',
      completedAt: null,
    },
    sleep: {
      tarwihCategory: null,
      tarwihCompleted: false,
      tarwihDurationSeconds: 0,
      bedtimeHour: null,
      nightSasActivated: false,
      qiyamDone: false,
    },
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface DayState {
  today: DayRecord;
  history: Record<string, DayRecord>; // keyed by date string
  currentScore: BarakaScoreBreakdown | null;
  streak: number;

  // Spiritual actions
  validatePrayer: (prayer: PrayerName, status: PrayerStatus) => void;
  setRawatibFajr: (done: boolean) => void;
  startGoldenMoment: () => void;
  completeGoldenMoment: () => void;
  setDuha: (done: boolean) => void;
  setWitr: (done: boolean) => void;
  setAdhkarMorning: (done: boolean) => void;
  setAdhkarEvening: (done: boolean) => void;

  // Knowledge actions
  startKnowledgeSession: (category: KnowledgeCategory) => void;
  completeKnowledgeSession: (durationSeconds: number, note: string) => void;

  // Physical actions
  completeActivity: (type: ActivityType, durationSeconds: number) => void;
  completeQaylulah: (durationSeconds: number, dhuhrTime?: Date) => void;

  // Social actions
  completeSocialInteraction: (
    category: SocialCategory,
    durationSeconds: number,
    note: string,
  ) => void;

  // Sleep actions
  completeTarwih: (category: TarwihCategory, durationSeconds: number) => void;
  setBedtime: () => void;
  setNightSas: (active: boolean) => void;
  setQiyam: (done: boolean) => void;

  // Day lifecycle
  refreshDay: () => void;
  recomputeScore: () => void;
}

export const useDayStore = create<DayState>()(
  persist(
    (set, get) => ({
      today: createEmptyDay(format(new Date(), 'yyyy-MM-dd')),
      history: {},
      currentScore: null,
      streak: 0,

      // ── Spiritual ───────────────────────────────────────────────────────

      validatePrayer: (prayer, status) => {
        set(s => ({
          today: {
            ...s.today,
            spiritual: {
              ...s.today.spiritual,
              prayers: { ...s.today.spiritual.prayers, [prayer]: status },
            },
          },
        }));
        get().recomputeScore();
      },

      setRawatibFajr: done => {
        set(s => ({ today: { ...s.today, spiritual: { ...s.today.spiritual, rawatibFajr: done } } }));
        get().recomputeScore();
      },

      startGoldenMoment: () => {
        set(s => ({
          today: {
            ...s.today,
            spiritual: { ...s.today.spiritual, goldenMomentStartedAt: new Date().toISOString() },
          },
        }));
      },

      completeGoldenMoment: () => {
        set(s => ({
          today: {
            ...s.today,
            spiritual: { ...s.today.spiritual, goldenMomentCompleted: true, adhkarMorningDone: true },
          },
        }));
        get().recomputeScore();
      },

      setDuha: done => {
        set(s => ({ today: { ...s.today, spiritual: { ...s.today.spiritual, duhaDone: done } } }));
        get().recomputeScore();
      },

      setWitr: done => {
        set(s => ({ today: { ...s.today, spiritual: { ...s.today.spiritual, witrDone: done } } }));
        get().recomputeScore();
      },

      setAdhkarMorning: done => {
        set(s => ({ today: { ...s.today, spiritual: { ...s.today.spiritual, adhkarMorningDone: done } } }));
        get().recomputeScore();
      },

      setAdhkarEvening: done => {
        set(s => ({ today: { ...s.today, spiritual: { ...s.today.spiritual, adhkarEveningDone: done } } }));
        get().recomputeScore();
      },

      // ── Knowledge ───────────────────────────────────────────────────────

      startKnowledgeSession: category => {
        set(s => ({
          today: {
            ...s.today,
            knowledge: { ...s.today.knowledge, category, sessionStartedAt: new Date().toISOString() },
          },
        }));
      },

      completeKnowledgeSession: (durationSeconds, note) => {
        set(s => ({
          today: {
            ...s.today,
            knowledge: {
              ...s.today.knowledge,
              sessionDurationSeconds: durationSeconds,
              noteText: note,
              sessionCompletedAt: new Date().toISOString(),
            },
          },
        }));
        get().recomputeScore();
      },

      // ── Physical ────────────────────────────────────────────────────────

      completeActivity: (type, durationSeconds) => {
        set(s => ({
          today: {
            ...s.today,
            physical: {
              ...s.today.physical,
              activityType: type,
              activityDurationSeconds: durationSeconds,
              activityCompletedAt: new Date().toISOString(),
            },
          },
        }));
        get().recomputeScore();
      },

      completeQaylulah: (durationSeconds, dhuhrTime) => {
        const now = new Date();
        const isBeforeAfternoon = dhuhrTime
          ? now.getTime() <= dhuhrTime.getTime() + 60 * 60 * 1000 // within 1h post-dhuhr or before
          : now.getHours() < 14;
        set(s => ({
          today: {
            ...s.today,
            physical: {
              ...s.today.physical,
              qaylulahDurationSeconds: durationSeconds,
              qaylulahBeforeAfternoon: isBeforeAfternoon,
              qaylulahCompletedAt: now.toISOString(),
            },
          },
        }));
        get().recomputeScore();
      },

      // ── Social ──────────────────────────────────────────────────────────

      completeSocialInteraction: (category, durationSeconds, note) => {
        set(s => ({
          today: {
            ...s.today,
            social: {
              category,
              interactionDurationSeconds: durationSeconds,
              isDigital: false, // Always false — digital cannot be validated
              noteText: note,
              completedAt: new Date().toISOString(),
            },
          },
        }));
        get().recomputeScore();
      },

      // ── Sleep ───────────────────────────────────────────────────────────

      completeTarwih: (category, durationSeconds) => {
        set(s => ({
          today: {
            ...s.today,
            sleep: {
              ...s.today.sleep,
              tarwihCategory: category,
              tarwihCompleted: true,
              tarwihDurationSeconds: durationSeconds,
            },
          },
        }));
        get().recomputeScore();
      },

      setBedtime: () => {
        const hour = new Date().getHours();
        set(s => ({
          today: { ...s.today, sleep: { ...s.today.sleep, bedtimeHour: hour } },
        }));
        get().recomputeScore();
      },

      setNightSas: active => {
        set(s => ({
          today: { ...s.today, sleep: { ...s.today.sleep, nightSasActivated: active } },
        }));
      },

      setQiyam: done => {
        set(s => ({ today: { ...s.today, sleep: { ...s.today.sleep, qiyamDone: done } } }));
        get().recomputeScore();
      },

      // ── Lifecycle ───────────────────────────────────────────────────────

      refreshDay: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const { today: current, history } = get();

        if (current.date !== today) {
          // Archive the previous day
          set(s => ({
            history: { ...s.history, [s.today.date]: s.today },
            today: createEmptyDay(today),
            currentScore: null,
          }));
        }
      },

      recomputeScore: () => {
        const { today, streak } = get();
        const score = computeBarakaScore(today, streak);
        set({ currentScore: score });
      },
    }),
    {
      name: 'aqal-day-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

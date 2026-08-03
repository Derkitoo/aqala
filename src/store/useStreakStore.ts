import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { processEndOfDay, type StreakState, todayString, currentWeekNumber } from '../engine/streakManager';
import { getMaqam, getNextMaqam, progressToNextMaqam, type Maqam } from '../engine/maqamSystem';

interface StreakStoreState extends StreakState {
  sevenDayAverage: number;
  calendarDots: Record<string, 'complete' | 'partial' | 'missed'>; // dates → status

  // Current Maqam derived values
  currentMaqam: Maqam;
  nextMaqam: Maqam | null;
  progressToNext: number; // 0–100

  // Actions
  recordDayScore: (finalScore: number) => void;
  markCalendarDay: (date: string, status: 'complete' | 'partial' | 'missed') => void;
  updateAverage: (scores: number[]) => void;
  recomputeMaqam: () => void;
}

const defaultStreak: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastValidatedDate: null,
  graceUsedThisWeek: false,
  weekNumber: currentWeekNumber(),
};

const defaultMaqam = getMaqam(0, 0);

export const useStreakStore = create<StreakStoreState>()(
  persist(
    (set, get) => ({
      ...defaultStreak,
      sevenDayAverage: 0,
      calendarDots: {},
      currentMaqam: defaultMaqam,
      nextMaqam: getNextMaqam(defaultMaqam),
      progressToNext: 0,

      recordDayScore: finalScore => {
        const state = get();
        const streakState: StreakState = {
          currentStreak: state.currentStreak,
          longestStreak: state.longestStreak,
          lastValidatedDate: state.lastValidatedDate,
          graceUsedThisWeek: state.graceUsedThisWeek,
          weekNumber: state.weekNumber,
        };

        const updated = processEndOfDay(streakState, finalScore);
        const dotStatus = finalScore >= 90 ? 'complete' : finalScore >= 40 ? 'partial' : 'missed';

        set({
          ...updated,
          calendarDots: { ...state.calendarDots, [todayString()]: dotStatus },
        });

        get().recomputeMaqam();
      },

      markCalendarDay: (date, status) => {
        set(s => ({ calendarDots: { ...s.calendarDots, [date]: status } }));
      },

      updateAverage: scores => {
        if (scores.length === 0) return;
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        set({ sevenDayAverage: avg });
        get().recomputeMaqam();
      },

      recomputeMaqam: () => {
        const { sevenDayAverage, currentStreak } = get();
        const maqam = getMaqam(sevenDayAverage, currentStreak);
        const next   = getNextMaqam(maqam);
        const prog   = progressToNextMaqam(sevenDayAverage, currentStreak, maqam, next);
        set({ currentMaqam: maqam, nextMaqam: next, progressToNext: prog });
      },
    }),
    {
      name: 'aqal-streak-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

import { format, differenceInCalendarDays, parseISO } from 'date-fns';

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastValidatedDate: string | null; // ISO date 'yyyy-MM-dd'
  graceUsedThisWeek: boolean;
  weekNumber: number; // ISO week number for grace reset
}

const STRICT_MIN_SCORE = 40; // minimum score to count as a "valid" day for streak

export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function currentWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
}

/**
 * Called at end-of-day with the day's final Baraka score.
 * Returns the updated StreakState.
 */
export function processEndOfDay(
  state: StreakState,
  finalScore: number,
): StreakState {
  const today = todayString();
  const week  = currentWeekNumber();

  // Reset grace used flag on new week
  const graceUsedThisWeek = week === state.weekNumber ? state.graceUsedThisWeek : false;

  const daysSinceLast = state.lastValidatedDate
    ? differenceInCalendarDays(parseISO(today), parseISO(state.lastValidatedDate))
    : null;

  const dayPassed = finalScore >= STRICT_MIN_SCORE;

  if (dayPassed) {
    // If today was already processed today (daysSinceLast === 0), preserve current streak
    const newStreak =
      daysSinceLast === 0 ? Math.max(state.currentStreak, 1) :
      daysSinceLast === 1 ? state.currentStreak + 1 :
      1; // broke + restarted

    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, state.longestStreak),
      lastValidatedDate: today,
      graceUsedThisWeek,
      weekNumber: week,
    };
  }

  // Day not passed yet (< STRICT_MIN_SCORE)
  if (daysSinceLast === 0) {
    // Same day: preserve state if score drops or hasn't reached threshold yet
    return { ...state, graceUsedThisWeek, weekNumber: week };
  }

  // Check if grace is available (1 per week) when yesterday was last validated
  if (daysSinceLast === 1 && !graceUsedThisWeek) {
    return {
      ...state,
      lastValidatedDate: today,
      graceUsedThisWeek: true,
      weekNumber: week,
    };
  }

  // Streak broken
  return {
    currentStreak: 0,
    longestStreak: state.longestStreak,
    lastValidatedDate: today,
    graceUsedThisWeek,
    weekNumber: week,
  };
}

export function isStreakMilestone(streak: number): number | null {
  const milestones = [7, 21, 40, 100];
  return milestones.includes(streak) ? streak : null;
}

export function getStreakLabel(streak: number): string {
  if (streak === 0) return 'Commence aujourd\'hui';
  if (streak < 7)   return `${streak} jour${streak > 1 ? 's' : ''} de suite`;
  if (streak < 21)  return `${streak} jours — Al-Mujahid 🔥`;
  if (streak < 40)  return `${streak} jours — Al-Muntazim 🛡️`;
  return `${streak} jours — Sahibul Baraka ✨`;
}

import { useMemo } from 'react';
import { useDayStore } from '../store/useDayStore';
import { useStreakStore } from '../store/useStreakStore';
import { computeBarakaScore, isDayComplete, isStrictMinimumMet } from '../engine/barakaScoring';

export function useBarakaScore() {
  const { today } = useDayStore();
  const { currentStreak } = useStreakStore();

  const breakdown = useMemo(
    () => computeBarakaScore(today, currentStreak),
    [today, currentStreak],
  );

  return {
    breakdown,
    score: breakdown.finalScore,
    isComplete: isDayComplete(breakdown),
    isStrictMinimum: isStrictMinimumMet(breakdown),
    streak: currentStreak,
    multiplier: breakdown.multiplier,
  };
}

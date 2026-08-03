import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  getPrayerSchedule,
  getNextPrayer,
  getPrayerWindowStatus,
  formatPrayerTime,
  type DailyPrayerSchedule,
  type PrayerWindowStatus,
} from '../services/prayerTimes';
import type { PrayerName } from '../constants/pillars';
import { PRAYERS } from '../constants/pillars';

interface UsePrayerTimesResult {
  schedule: DailyPrayerSchedule | null;
  nextPrayer: { prayer: PrayerName; time: Date; minutesUntil: number } | null;
  windowStatuses: Record<PrayerName, PrayerWindowStatus> | null;
  formattedTimes: Record<PrayerName, string> | null;
  refresh: () => void;
  isLoading: boolean;
}

export function usePrayerTimes(): UsePrayerTimesResult {
  const { latitude, longitude, calculationMethod, locationGranted } = useAppStore();
  const [schedule, setSchedule] = useState<DailyPrayerSchedule | null>(null);
  const [nextPrayer, setNextPrayer] = useState<UsePrayerTimesResult['nextPrayer']>(null);
  const [windowStatuses, setWindowStatuses] = useState<UsePrayerTimesResult['windowStatuses']>(null);
  const [formattedTimes, setFormattedTimes] = useState<UsePrayerTimesResult['formattedTimes']>(null);
  const [isLoading, setIsLoading] = useState(true);

  const compute = useCallback(() => {
    if (!locationGranted || latitude === null || longitude === null) {
      setIsLoading(false);
      return;
    }

    const sched = getPrayerSchedule(latitude, longitude, new Date(), calculationMethod);
    const now = new Date();

    const statuses = {} as Record<PrayerName, PrayerWindowStatus>;
    const times    = {} as Record<PrayerName, string>;

    for (const { id } of PRAYERS) {
      statuses[id] = getPrayerWindowStatus(id, sched, now);
      times[id]    = formatPrayerTime(sched[id] as Date);
    }

    setSchedule(sched);
    setNextPrayer(getNextPrayer(sched, now));
    setWindowStatuses(statuses);
    setFormattedTimes(times);
    setIsLoading(false);
  }, [latitude, longitude, calculationMethod, locationGranted]);

  useEffect(() => {
    compute();
    // Refresh every minute to keep countdown accurate
    const interval = setInterval(compute, 60_000);
    return () => clearInterval(interval);
  }, [compute]);

  return { schedule, nextPrayer, windowStatuses, formattedTimes, refresh: compute, isLoading };
}

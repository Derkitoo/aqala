import { Coordinates, CalculationMethod, PrayerTimes, Prayer, Madhab } from 'adhan';
import { format, addMinutes } from 'date-fns';
import type { PrayerName } from '../constants/pillars';
import { PRAYER_WINDOW_MINUTES } from '../constants/pillars';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyPrayerSchedule {
  fajr:    Date;
  sunrise: Date;
  dhuhr:   Date;
  asr:     Date;
  maghrib: Date;
  isha:    Date;
  duhaStart: Date;  // 20 min after sunrise
  duhaEnd:   Date;  // 20 min before dhuhr
  qaylulahWindow: Date; // post-dhuhr + 15 min
}

export interface PrayerWindowStatus {
  prayer: PrayerName;
  startTime: Date;
  endTime: Date;
  isOpen: boolean;
  minutesUntilClose: number;
  minutesSinceOpen: number;
}

// ─── Calculation methods map ──────────────────────────────────────────────────

const METHOD_MAP: Record<string, () => any> = {
  MuslimWorldLeague:     () => CalculationMethod.MuslimWorldLeague(),
  NorthAmerica:          () => CalculationMethod.NorthAmerica(),
  Egyptian:              () => CalculationMethod.Egyptian(),
  Karachi:               () => CalculationMethod.Karachi(),
  UmmAlQura:             () => CalculationMethod.UmmAlQura(),
  Dubai:                 () => CalculationMethod.Dubai(),
  MoonsightingCommittee: () => CalculationMethod.MoonsightingCommittee(),
  Kuwait:                () => CalculationMethod.Kuwait(),
  Qatar:                 () => CalculationMethod.Qatar(),
  Singapore:             () => CalculationMethod.Singapore(),
  Turkey:                () => CalculationMethod.Turkey(),
  Tehran:                () => CalculationMethod.Tehran(),
};

// ─── Core function ────────────────────────────────────────────────────────────

export function getPrayerSchedule(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  methodName: string = 'MuslimWorldLeague',
  madhabName: 'shafi' | 'hanafi' = 'shafi',
): DailyPrayerSchedule {
  const coordinates = new Coordinates(latitude, longitude);
  const getParams = METHOD_MAP[methodName] ?? METHOD_MAP.MuslimWorldLeague;
  const params = getParams();
  params.madhab = madhabName === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  const times = new PrayerTimes(coordinates, date, params);

  return {
    fajr:    times.fajr,
    sunrise: times.sunrise,
    dhuhr:   times.dhuhr,
    asr:     times.asr,
    maghrib: times.maghrib,
    isha:    times.isha,
    duhaStart: addMinutes(times.sunrise, 20),
    duhaEnd:   addMinutes(times.dhuhr, -20),
    qaylulahWindow: addMinutes(times.dhuhr, 15),
  };
}

// ─── Prayer window status ─────────────────────────────────────────────────────

export function getPrayerWindowStatus(
  prayer: PrayerName,
  schedule: DailyPrayerSchedule,
  now: Date = new Date(),
): PrayerWindowStatus {
  const prayerTimes: Record<PrayerName, Date> = {
    fajr:    schedule.fajr,
    dhuhr:   schedule.dhuhr,
    asr:     schedule.asr,
    maghrib: schedule.maghrib,
    isha:    schedule.isha,
  };

  const startTime = prayerTimes[prayer];
  const windowMinutes = PRAYER_WINDOW_MINUTES[prayer];
  const endTime = addMinutes(startTime, windowMinutes);

  const nowMs = now.getTime();
  const isOpen = nowMs >= startTime.getTime() && nowMs <= endTime.getTime();
  const minutesUntilClose = Math.max(0, Math.floor((endTime.getTime() - nowMs) / 60000));
  const minutesSinceOpen  = Math.max(0, Math.floor((nowMs - startTime.getTime()) / 60000));

  return { prayer, startTime, endTime, isOpen, minutesUntilClose, minutesSinceOpen };
}

// ─── Validation helpers ───────────────────────────────────────────────────────

export function getPrayerStatus(
  prayer: PrayerName,
  schedule: DailyPrayerSchedule,
  validatedAt: Date,
): 'onTime' | 'late' | 'missed' {
  const { isOpen } = getPrayerWindowStatus(prayer, schedule, validatedAt);
  if (isOpen) return 'onTime';

  // If validatedAt is after the prayer time but outside window — late
  const prayerTime = schedule[prayer === 'dhuhr' ? 'dhuhr' : prayer] as Date;
  if (validatedAt > prayerTime) return 'late';

  return 'missed';
}

// ─── Next prayer ──────────────────────────────────────────────────────────────

export function getNextPrayer(
  schedule: DailyPrayerSchedule,
  now: Date = new Date(),
): { prayer: PrayerName; time: Date; minutesUntil: number } | null {
  const ordered: { prayer: PrayerName; time: Date }[] = [
    { prayer: 'fajr',    time: schedule.fajr },
    { prayer: 'dhuhr',   time: schedule.dhuhr },
    { prayer: 'asr',     time: schedule.asr },
    { prayer: 'maghrib', time: schedule.maghrib },
    { prayer: 'isha',    time: schedule.isha },
  ];

  for (const entry of ordered) {
    if (entry.time > now) {
      const minutesUntil = Math.floor((entry.time.getTime() - now.getTime()) / 60000);
      return { ...entry, minutesUntil };
    }
  }

  return null; // All prayers passed today
}

// ─── Format helpers ───────────────────────────────────────────────────────────

export function formatPrayerTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

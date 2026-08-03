import { format, isToday, isYesterday, differenceInMinutes, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatCountdownMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatDurationFr(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ''}`;
  if (m > 0) return `${m} min`;
  return `${totalSeconds} sec`;
}

export function formatDateFr(date: Date): string {
  if (isToday(date))     return 'Aujourd\'hui';
  if (isYesterday(date)) return 'Hier';
  return format(date, 'EEEE d MMMM', { locale: fr });
}

export function formatTimeFr(date: Date): string {
  return format(date, 'HH:mm');
}

export function minutesBetween(a: Date, b: Date): number {
  return Math.abs(differenceInMinutes(a, b));
}

export function isInWindow(now: Date, from: Date, toMinutes: number): boolean {
  const end = new Date(from.getTime() + toMinutes * 60_000);
  return now >= from && now <= end;
}

export function nextOccurrence(hour: number, minute: number = 0): Date {
  const now  = new Date();
  const candidate = new Date(now);
  candidate.setHours(hour, minute, 0, 0);
  if (candidate <= now) {
    return addDays(candidate, 1);
  }
  return candidate;
}

export function getCurrentHour(): number {
  return new Date().getHours();
}

export function isNightTime(): boolean {
  const h = getCurrentHour();
  return h >= 22 || h < 4;
}

export function isMorning(): boolean {
  const h = getCurrentHour();
  return h >= 4 && h < 12;
}

export function isAfternoon(): boolean {
  const h = getCurrentHour();
  return h >= 12 && h < 18;
}

export function isEvening(): boolean {
  const h = getCurrentHour();
  return h >= 18 && h < 22;
}

export function getGreeting(): string {
  if (getCurrentHour() < 12) return 'Bonjour';
  if (getCurrentHour() < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export function todayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

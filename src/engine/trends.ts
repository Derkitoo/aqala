import { format } from 'date-fns';
import type { DayRecord, PrayerName } from '../store/useDayStore';
import {
  PILLARS, SOCIAL_CATEGORIES, ACTIVITY_TYPES, PRAYERS,
  type PillarId, type SocialCategory, type ActivityType,
} from '../constants/pillars';
import {
  scoreSpiritualPillar,
  scoreKnowledgePillar,
  scorePhysicalPillar,
  scoreSocialPillar,
  scoreSleepPillar,
} from './barakaScoring';

const WEEKDAY_LABELS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export interface PillarTrend {
  id: PillarId;
  nameFr: string;
  color: string;
  avgPct: number; // 0–100, average of (sub-score / max) across the sampled days
}

export interface WeekdayTrend {
  label: string;
  avgPct: number;
}

export interface TrendsSummary {
  sampleSize: number;
  pillars: PillarTrend[];
  weakestPillar: PillarTrend | null;
  bestWeekday: WeekdayTrend | null;
  worstWeekday: WeekdayTrend | null;
}

const EMPTY_SUMMARY: TrendsSummary = {
  sampleSize: 0,
  pillars: [],
  weakestPillar: null,
  bestWeekday: null,
  worstWeekday: null,
};

/**
 * Aggregates already-collected DayRecord history into pillar and weekday
 * trends, using unweighted sub-scores (no streak multiplier) so days are
 * comparable regardless of when they happened.
 */
export function computeTrends(
  today: DayRecord,
  history: Record<string, DayRecord>,
  windowDays = 14,
): TrendsSummary {
  const pillarIds = Object.keys(PILLARS) as PillarId[];
  const pillarSums: Record<PillarId, number> = { spiritual: 0, knowledge: 0, physical: 0, social: 0, sleep: 0 };
  const weekdaySums: Record<number, { total: number; count: number }> = {};
  let n = 0;

  for (let i = 0; i < windowDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = format(date, 'yyyy-MM-dd');
    const record = key === today.date ? today : history[key];
    if (!record) continue;

    n += 1;
    const pcts: Record<PillarId, number> = {
      spiritual: scoreSpiritualPillar(record.spiritual) / PILLARS.spiritual.maxPoints,
      knowledge: scoreKnowledgePillar(record.knowledge) / PILLARS.knowledge.maxPoints,
      physical: scorePhysicalPillar(record.physical) / PILLARS.physical.maxPoints,
      social: scoreSocialPillar(record.social) / PILLARS.social.maxPoints,
      sleep: scoreSleepPillar(record.sleep) / PILLARS.sleep.maxPoints,
    };
    for (const id of pillarIds) pillarSums[id] += pcts[id];

    const overallPct = pillarIds.reduce((sum, id) => sum + pcts[id], 0) / pillarIds.length;
    const weekday = date.getDay();
    if (!weekdaySums[weekday]) weekdaySums[weekday] = { total: 0, count: 0 };
    weekdaySums[weekday].total += overallPct;
    weekdaySums[weekday].count += 1;
  }

  if (n === 0) return EMPTY_SUMMARY;

  const pillars: PillarTrend[] = pillarIds.map(id => ({
    id,
    nameFr: PILLARS[id].nameFr,
    color: PILLARS[id].color,
    avgPct: Math.round((pillarSums[id] / n) * 100),
  }));

  const weakestPillar = pillars.reduce((a, b) => (b.avgPct < a.avgPct ? b : a));

  const weekdayAverages: WeekdayTrend[] = Object.entries(weekdaySums)
    .filter(([, v]) => v.count >= 2) // need at least 2 samples of that weekday to mean something
    .map(([weekday, v]) => ({
      label: WEEKDAY_LABELS_FR[Number(weekday)],
      avgPct: Math.round((v.total / v.count) * 100),
    }));

  let bestWeekday: WeekdayTrend | null = null;
  let worstWeekday: WeekdayTrend | null = null;
  if (weekdayAverages.length >= 3) {
    bestWeekday = weekdayAverages.reduce((a, b) => (b.avgPct > a.avgPct ? b : a));
    worstWeekday = weekdayAverages.reduce((a, b) => (b.avgPct < a.avgPct ? b : a));
    if (bestWeekday.label === worstWeekday.label) worstWeekday = null;
  }

  return { sampleSize: n, pillars, weakestPillar, bestWeekday, worstWeekday };
}

// ─── Social balance ───────────────────────────────────────────────────────────

export interface SocialBalanceEntry {
  category: SocialCategory;
  label: string;
  count: number;
}

export interface SocialBalance {
  windowDays: number;
  entries: SocialBalanceEntry[];
  neglectedCategory: SocialBalanceEntry | null; // 0 interactions in the window, while others have some
}

/**
 * Counts completed social interactions per category over a sliding window,
 * to surface which relationship area (family / service / community) has
 * been neglected — not just whether "social" as a whole was done.
 */
export function computeSocialBalance(
  today: DayRecord,
  history: Record<string, DayRecord>,
  windowDays = 7,
): SocialBalance {
  const counts: Record<SocialCategory, number> = { family: 0, service: 0, community: 0 };

  for (let i = 0; i < windowDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = format(date, 'yyyy-MM-dd');
    const record = key === today.date ? today : history[key];
    if (!record) continue;

    const { category, completedAt } = record.social;
    if (category && completedAt) counts[category] += 1;
  }

  const categoryIds = Object.keys(SOCIAL_CATEGORIES) as SocialCategory[];
  const entries: SocialBalanceEntry[] = categoryIds.map(category => ({
    category,
    label: SOCIAL_CATEGORIES[category].label,
    count: counts[category],
  }));

  const totalInteractions = entries.reduce((sum, e) => sum + e.count, 0);
  const neglectedCategory =
    totalInteractions > 0 ? entries.find(e => e.count === 0) ?? null : null;

  return { windowDays, entries, neglectedCategory };
}

// ─── Physical balance ─────────────────────────────────────────────────────────

export interface ActivityBalanceEntry {
  type: ActivityType;
  label: string;
  count: number;
}

export interface PhysicalBalance {
  windowDays: number;
  sampleSize: number;
  activityEntries: ActivityBalanceEntry[];
  qaylulahCompletedDays: number;
}

/**
 * Counts completed activities per type and Qaylulah completions over a
 * sliding window, to surface variety (or lack of it) in physical effort.
 */
export function computePhysicalBalance(
  today: DayRecord,
  history: Record<string, DayRecord>,
  windowDays = 7,
): PhysicalBalance {
  const counts: Record<ActivityType, number> = { walk: 0, sport: 0, stretching: 0 };
  let qaylulahCompletedDays = 0;
  let sampleSize = 0;

  for (let i = 0; i < windowDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = format(date, 'yyyy-MM-dd');
    const record = key === today.date ? today : history[key];
    if (!record) continue;

    sampleSize += 1;
    const { activityType, activityCompletedAt, qaylulahCompletedAt } = record.physical;
    if (activityType && activityCompletedAt) counts[activityType] += 1;
    if (qaylulahCompletedAt) qaylulahCompletedDays += 1;
  }

  const typeIds = Object.keys(ACTIVITY_TYPES) as ActivityType[];
  const activityEntries: ActivityBalanceEntry[] = typeIds.map(type => ({
    type,
    label: ACTIVITY_TYPES[type].label,
    count: counts[type],
  }));

  return { windowDays, sampleSize, activityEntries, qaylulahCompletedDays };
}

// ─── Sleep balance ────────────────────────────────────────────────────────────

export interface SleepBalance {
  windowDays: number;
  sampleSize: number;
  tarwihCompletedDays: number;
  bedtimeBefore23Days: number;
}

/**
 * Counts Tarwih completions and on-time bedtimes over a sliding window, to
 * surface consistency rather than just "did it today".
 */
export function computeSleepBalance(
  today: DayRecord,
  history: Record<string, DayRecord>,
  windowDays = 7,
): SleepBalance {
  let sampleSize = 0;
  let tarwihCompletedDays = 0;
  let bedtimeBefore23Days = 0;

  for (let i = 0; i < windowDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = format(date, 'yyyy-MM-dd');
    const record = key === today.date ? today : history[key];
    if (!record) continue;

    sampleSize += 1;
    if (record.sleep.tarwihCompleted) tarwihCompletedDays += 1;
    if (record.sleep.bedtimeHour !== null && record.sleep.bedtimeHour < 23) bedtimeBefore23Days += 1;
  }

  return { windowDays, sampleSize, tarwihCompletedDays, bedtimeBefore23Days };
}

// ─── Spiritual balance ────────────────────────────────────────────────────────

export interface SpiritualBalance {
  windowDays: number;
  sampleSize: number;
  prayersOnTimePct: number; // % of all prayer slots marked on-time across the window
  goldenMomentDays: number;
  adhkarEveningDays: number;
  mostMissedPrayer: { id: PrayerName; nameFr: string; count: number } | null;
}

/**
 * Tracks prayer punctuality and adhkar consistency over a sliding window —
 * a single day's status doesn't show whether Fajr keeps slipping, only the
 * week does.
 */
export function computeSpiritualBalance(
  today: DayRecord,
  history: Record<string, DayRecord>,
  windowDays = 7,
): SpiritualBalance {
  let sampleSize = 0;
  let onTimeCount = 0;
  let goldenMomentDays = 0;
  let adhkarEveningDays = 0;
  const missedOrLateCounts: Record<PrayerName, number> = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

  for (let i = 0; i < windowDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = format(date, 'yyyy-MM-dd');
    const record = key === today.date ? today : history[key];
    if (!record) continue;

    sampleSize += 1;
    const { prayers, goldenMomentCompleted, adhkarEveningDone } = record.spiritual;
    for (const p of PRAYERS) {
      const status = prayers[p.id];
      if (status === 'onTime') onTimeCount += 1;
      if (status === 'late' || status === 'missed') missedOrLateCounts[p.id] += 1;
    }
    if (goldenMomentCompleted) goldenMomentDays += 1;
    if (adhkarEveningDone) adhkarEveningDays += 1;
  }

  const prayersOnTimePct = sampleSize > 0 ? Math.round((onTimeCount / (sampleSize * PRAYERS.length)) * 100) : 0;

  let mostMissedPrayer: SpiritualBalance['mostMissedPrayer'] = null;
  for (const p of PRAYERS) {
    const count = missedOrLateCounts[p.id];
    if (count > 0 && (!mostMissedPrayer || count > mostMissedPrayer.count)) {
      mostMissedPrayer = { id: p.id, nameFr: p.nameFr, count };
    }
  }

  return { windowDays, sampleSize, prayersOnTimePct, goldenMomentDays, adhkarEveningDays, mostMissedPrayer };
}

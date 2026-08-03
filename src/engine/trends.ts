import { format } from 'date-fns';
import type { DayRecord } from '../store/useDayStore';
import { PILLARS, type PillarId } from '../constants/pillars';
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

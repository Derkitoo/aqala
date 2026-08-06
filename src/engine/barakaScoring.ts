import type { DayRecord } from '../store/useDayStore';
import { PILLARS } from '../constants/pillars';

// ─── Streak multiplier ────────────────────────────────────────────────────────

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 1.50;
  if (streak >= 15) return 1.35;
  if (streak >= 8)  return 1.20;
  if (streak >= 4)  return 1.10;
  return 1.00;
}

// ─── Spiritual sub-score (max 35) ────────────────────────────────────────────

export function scoreSpiritualPillar(r: DayRecord['spiritual']): number {
  let pts = 0;

  // Fajr (12 pts base)
  if (r.prayers.fajr === 'onTime')    pts += 12;
  else if (r.prayers.fajr === 'late') pts += 6;

  // Rawatib Fajr before adhan (+4)
  if (r.rawatibFajr) pts += 4;

  // Golden Moment fully completed (+6)
  if (r.goldenMomentCompleted) pts += 6;

  // Rawatib Dhuhr (4 rak'ât avant + 2 après) (+3)
  if (r.rawatibDhuhr) pts += 3;

  // Dhuhr, Asr, Maghrib (2 pts each)
  for (const p of ['dhuhr', 'asr', 'maghrib'] as const) {
    if (r.prayers[p] === 'onTime')    pts += 2;
    else if (r.prayers[p] === 'late') pts += 1;
  }

  // Rawatib Maghrib (2 rak'ât après) (+2)
  if (r.rawatibMaghrib) pts += 2;

  // Isha + Witr (4 pts)
  if (r.prayers.isha === 'onTime')    pts += 2;
  else if (r.prayers.isha === 'late') pts += 1;
  if (r.witrDone) pts += 2;

  // Rawatib Isha (2 rak'ât après) (+2)
  if (r.rawatibIsha) pts += 2;

  // Duha (bonus 3 pts)
  if (r.duhaDone) pts += 3;

  return Math.min(pts, PILLARS.spiritual.maxPoints);
}

// ─── Knowledge sub-score (max 25) ────────────────────────────────────────────

export function scoreKnowledgePillar(r: DayRecord['knowledge']): number {
  let pts = 0;

  if (r.sessionDurationSeconds >= 15 * 60) {
    pts += 10; // Base focus achieved

    if (r.noteText && r.noteText.trim().length > 0) {
      pts += 10; // Note written
    }

    if (r.category === 'revelation') {
      pts += 3; // Revelation bonus
    }

    if (r.sessionDurationSeconds >= 30 * 60) {
      pts += 2; // Extended session bonus
    }
  } else if (r.sessionDurationSeconds > 0) {
    // Partial credit: proportional up to 5 pts
    pts = Math.floor((r.sessionDurationSeconds / (15 * 60)) * 5);
  }

  return Math.min(pts, PILLARS.knowledge.maxPoints);
}

// ─── Physical sub-score (max 15) ─────────────────────────────────────────────

export function scorePhysicalPillar(r: DayRecord['physical']): number {
  let pts = 0;

  if (r.activityDurationSeconds >= 20 * 60) {
    pts += 10;
  } else if (r.activityDurationSeconds > 0) {
    pts += Math.floor((r.activityDurationSeconds / (20 * 60)) * 6);
  }

  // Qaylulah (max 30 min, before 14h = bonus)
  if (r.qaylulahDurationSeconds >= 20 * 60) {
    pts += r.qaylulahBeforeAfternoon ? 7 : 5;
  } else if (r.qaylulahDurationSeconds > 0) {
    pts += 2;
  }

  return Math.min(pts, PILLARS.physical.maxPoints);
}

// ─── Social sub-score (max 15) ───────────────────────────────────────────────

export function scoreSocialPillar(r: DayRecord['social']): number {
  let pts = 0;

  // Must be in-person — the flag isDigital prevents validation
  if (!r.isDigital && r.interactionDurationSeconds >= 20 * 60) {
    // Service (mihnat ahlihi) is the highest value action
    pts = r.category === 'service' ? 15 : 12;

    // Extended engagement bonus
    if (r.interactionDurationSeconds >= 45 * 60) {
      pts = Math.min(pts + 3, PILLARS.social.maxPoints);
    }
  } else if (!r.isDigital && r.interactionDurationSeconds > 0) {
    pts = 5; // Partial — started but didn't reach minimum
  }

  return Math.min(pts, PILLARS.social.maxPoints);
}

// ─── Sleep sub-score (max 10) ────────────────────────────────────────────────

export function scoreSleepPillar(r: DayRecord['sleep']): number {
  let pts = 0;

  // Bed before 23:00
  if (r.bedtimeHour !== null && r.bedtimeHour < 23) {
    pts += 5;
  } else if (r.bedtimeHour !== null && r.bedtimeHour <= 23) {
    pts += 3;
  }

  // Tarwih completed
  if (r.tarwihCompleted) {
    pts += 5;
  }

  return Math.min(pts, PILLARS.sleep.maxPoints);
}

// ─── Master score ─────────────────────────────────────────────────────────────

export interface BarakaScoreBreakdown {
  spiritual: number;
  knowledge: number;
  physical: number;
  social: number;
  sleep: number;
  rawTotal: number;
  streak: number;
  multiplier: number;
  finalScore: number; // 0–100
  percentage: number; // 0–100
}

export function computeBarakaScore(
  day: DayRecord,
  streak: number,
): BarakaScoreBreakdown {
  const spiritual = scoreSpiritualPillar(day.spiritual);
  const knowledge = scoreKnowledgePillar(day.knowledge);
  const physical  = scorePhysicalPillar(day.physical);
  const social    = scoreSocialPillar(day.social);
  const sleep     = scoreSleepPillar(day.sleep);

  const rawTotal = spiritual + knowledge + physical + social + sleep;
  const multiplier = getStreakMultiplier(streak);
  const finalScore = Math.min(Math.round(rawTotal * multiplier), 100);
  const percentage = finalScore;

  return { spiritual, knowledge, physical, social, sleep, rawTotal, streak, multiplier, finalScore, percentage };
}

// ─── Day completeness check (for "Baraka Complète") ──────────────────────────

export function isDayComplete(breakdown: BarakaScoreBreakdown): boolean {
  return breakdown.finalScore >= 90;
}

// ─── Strict minimum check (5 pillars at ≥ 50% each) ─────────────────────────

export function isStrictMinimumMet(breakdown: BarakaScoreBreakdown): boolean {
  return (
    breakdown.spiritual >= Math.floor(PILLARS.spiritual.maxPoints * 0.5) &&
    breakdown.knowledge >= Math.floor(PILLARS.knowledge.maxPoints * 0.5) &&
    breakdown.physical  >= Math.floor(PILLARS.physical.maxPoints  * 0.5) &&
    breakdown.social    >= Math.floor(PILLARS.social.maxPoints    * 0.5) &&
    breakdown.sleep     >= Math.floor(PILLARS.sleep.maxPoints     * 0.5)
  );
}

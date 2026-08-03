export type MaqamId = 1 | 2 | 3 | 4 | 5;

export interface Maqam {
  id: MaqamId;
  nameAr: string;
  nameFr: string;
  description: string;
  icon: string;
  minAvgScore: number; // minimum 7-day rolling average
  minStreak: number;
  unlockedContent: string[];
  color: string;
}

export const MAQAMAT: Maqam[] = [
  {
    id: 1,
    nameAr: 'المبتدئ',
    nameFr: 'Al-Mubtadi\'',
    description: 'Le Débutant — Chaque pas compte.',
    icon: '🌱',
    minAvgScore: 0,
    minStreak: 0,
    unlockedContent: ['Présentation des 5 piliers', 'Guide du Mode Débutant'],
    color: '#78909C',
  },
  {
    id: 2,
    nameAr: 'المجاهد',
    nameFr: 'Al-Mujahid',
    description: 'Celui qui s\'efforce — La lutte est l\'honneur.',
    icon: '⚔️',
    minAvgScore: 40,
    minStreak: 0,
    unlockedContent: ['Les 5 habitudes des Sahaba au lever'],
    color: '#5C6BC0',
  },
  {
    id: 3,
    nameAr: 'المنتظم',
    nameFr: 'Al-Muntazim',
    description: 'Le Régulier — La constance est une noblesse.',
    icon: '🛡️',
    minAvgScore: 55,
    minStreak: 7,
    unlockedContent: ['Le programme de la semaine d\'Ibn al-Qayyim', 'Mode Intermédiaire débloqué'],
    color: '#2E7D32',
  },
  {
    id: 4,
    nameAr: 'المحسن',
    nameFr: 'Al-Muhsin',
    description: 'L\'Excellence — Tu fais le bien même quand personne ne regarde.',
    icon: '🌟',
    minAvgScore: 70,
    minStreak: 21,
    unlockedContent: [
      'La gestion du temps des grands Ulémas',
      'Mode Avancé (Qiyam al-Layl) débloqué',
      'Rapport des 40 jours disponible',
    ],
    color: '#F57F17',
  },
  {
    id: 5,
    nameAr: 'صاحب البركة',
    nameFr: 'Sahibul Baraka',
    description: 'Le Béni — Celui dont le temps est multiplié.',
    icon: '✨',
    minAvgScore: 85,
    minStreak: 40,
    unlockedContent: [
      'Rapport Arba\'in (40 jours) exportable PDF',
      'Accès au Mode Nuit Globale complet',
      'Collection "Vies des grands Awliyâ"',
    ],
    color: '#F5C842',
  },
];

export function getMaqam(avgScore: number, streak: number): Maqam {
  // Traverse from highest to lowest to find the first matching rank
  for (let i = MAQAMAT.length - 1; i >= 0; i--) {
    const m = MAQAMAT[i];
    if (avgScore >= m.minAvgScore && streak >= m.minStreak) {
      return m;
    }
  }
  return MAQAMAT[0];
}

export function getNextMaqam(current: Maqam): Maqam | null {
  const nextId = (current.id + 1) as MaqamId;
  return MAQAMAT.find(m => m.id === nextId) ?? null;
}

export function progressToNextMaqam(
  avgScore: number,
  streak: number,
  current: Maqam,
  next: Maqam | null,
): number {
  if (!next) return 100;

  const scoreProgress  = Math.min(avgScore  / next.minAvgScore,  1);
  const streakProgress = next.minStreak > 0
    ? Math.min(streak / next.minStreak, 1)
    : 1;

  return Math.round(((scoreProgress + streakProgress) / 2) * 100);
}

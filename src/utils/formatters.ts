export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function pct(value: number, total: number): number {
  if (total === 0) return 0;
  return clamp(Math.round((value / total) * 100), 0, 100);
}

export function pluralFr(n: number, singular: string, plural: string): string {
  return n > 1 ? plural : singular;
}

export function ordinalFr(n: number): string {
  if (n === 1) return '1er';
  return `${n}ème`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

// Formats a 0–100 score as a readable label
export function scoreLabel(score: number): string {
  if (score >= 90) return 'Baraka Complète ✨';
  if (score >= 75) return 'Excellente journée 🌟';
  if (score >= 55) return 'Bonne journée ✓';
  if (score >= 40) return 'Minimum accompli';
  if (score > 0)   return 'En cours…';
  return 'Journée non commencée';
}

export function scoreColor(score: number): string {
  if (score >= 90) return '#F5C842'; // gold
  if (score >= 70) return '#4A90D9'; // spiritual blue
  if (score >= 50) return '#2D6A4F'; // knowledge green
  if (score >= 40) return '#E07B39'; // physical orange
  return '#4A607A';                  // muted
}

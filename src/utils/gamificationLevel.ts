export const LEVEL_POINTS = 30;

const LEVEL_COLORS = [
  '#10b981',
  '#0d9488',
  '#0284c7',
  '#4f46e5',
  '#7c3aed',
  '#d97706',
] as const;

export function getLevelColor(level: number): string {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return LEVEL_COLORS[Math.min(safeLevel - 1, LEVEL_COLORS.length - 1)];
}

export function getLevelProgress(points: number, level: number): number {
  const safePoints = Number.isFinite(points) ? Math.max(0, points) : 0;
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  const levelStart = (safeLevel - 1) * LEVEL_POINTS;
  return Math.max(0, Math.min(100, Math.round(((safePoints - levelStart) / LEVEL_POINTS) * 100)));
}

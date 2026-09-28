/**
 * Monthly spending-limit alert rules.
 *
 * The alert used to fire on EVERY expense once the month was over the limit,
 * which users found nagging ("I know I've spent a lot this month"). Now it
 * fires only when the month's total crosses a new step: first when it goes
 * over the limit, then each further LIMIT_ALERT_STEP_RATIO of the limit (5%,
 * i.e. every 100 on a 2000 limit). The user can also mute it for the rest of
 * the current month (stored per device — a convenience, not synced data).
 */
export const LIMIT_ALERT_STEP_RATIO = 0.05;
const MUTE_STORAGE_KEY = 'spendingLimitAlertMutedMonth';

export const getLimitAlertStep = (limit: number): number => limit * LIMIT_ALERT_STEP_RATIO;

/** -1 while within the limit, then 0, 1, 2… for each step over it. */
const overLimitStep = (total: number, limit: number): number =>
  total <= limit ? -1 : Math.floor((total - limit) / getLimitAlertStep(limit));

/** True when going from `previousTotal` to `newTotal` crosses the limit or a new step above it. */
export function shouldAlertSpendingLimit(previousTotal: number, newTotal: number, limit: number): boolean {
  if (!(limit > 0) || !(newTotal > limit)) return false;
  return overLimitStep(newTotal, limit) > overLimitStep(previousTotal, limit);
}

/** "YYYY-MM" from a Date, in local time (never toISOString — UTC-midnight bug). */
export const monthKeyOf = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

/** True when a "YYYY-MM-DD" transaction date falls in the current (local) month. */
export const isInCurrentMonth = (isoDate: string | null | undefined, now: Date = new Date()): boolean =>
  typeof isoDate === 'string' && isoDate.slice(0, 7) === monthKeyOf(now);

export function isLimitAlertMuted(now: Date = new Date()): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === monthKeyOf(now);
  } catch {
    return false;
  }
}

export function muteLimitAlertForMonth(now: Date = new Date()): void {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, monthKeyOf(now));
  } catch {
    // Storage unavailable (private mode): the alert simply keeps its step rule.
  }
}

/**
 * Local, pure heuristics for spotting likely duplicate entries and likely
 * inter-account transfers — used by the CSV import review step (and usable
 * anywhere else transactions get checked against history) to catch the two
 * most common bulk-entry mistakes: re-importing overlapping export files,
 * and a transfer between the user's own accounts showing up as both a real
 * expense and a real income (inflating both totals).
 *
 * Everything here is a local comparison over data already in memory — no
 * network calls, nothing sent anywhere.
 */

export interface DuplicateCheckItem {
  /** "YYYY-MM-DD" */
  date: string | null;
  amount: number;
  notes?: string | null;
}

export interface DuplicateMatch<T> {
  item: T;
  matchedAgainst: T;
  daysApart: number;
  /** True when both sides have the same (non-empty) note — stronger signal, not required to match. */
  sameNote: boolean;
}

export interface TransferCandidate<T> {
  outflow: T;
  income: T;
  daysApart: number;
}

export interface MatchOptions {
  /** How many calendar days apart two entries can be and still count as a match. */
  maxDaysApart?: number;
  /** Amount tolerance, to absorb rounding. */
  amountEpsilon?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(`${a}T00:00:00Z`).getTime() - new Date(`${b}T00:00:00Z`).getTime()) / DAY_MS;
}

function normalizeNote(note: string | null | undefined): string {
  return (note || '').trim().toLowerCase();
}

function isMatch(a: DuplicateCheckItem, b: DuplicateCheckItem, { maxDaysApart = 1, amountEpsilon = 0.01 }: MatchOptions): number | null {
  if (a.date == null || b.date == null) return null;
  if (Math.abs(a.amount - b.amount) > amountEpsilon) return null;
  const daysApart = daysBetween(a.date, b.date);
  return daysApart <= maxDaysApart ? daysApart : null;
}

/**
 * Flags items in `candidates` (e.g. rows about to be imported) that look like
 * they already exist in `existing` (e.g. the user's transaction history) —
 * same amount and a date within `maxDaysApart` days. Each candidate is
 * matched against at most one existing entry (the first found).
 */
export function findLikelyDuplicates<T extends DuplicateCheckItem>(
  candidates: T[], existing: T[], options: MatchOptions = {},
): DuplicateMatch<T>[] {
  const matches: DuplicateMatch<T>[] = [];
  for (const candidate of candidates) {
    for (const other of existing) {
      const daysApart = isMatch(candidate, other, options);
      if (daysApart == null) continue;
      matches.push({ item: candidate, matchedAgainst: other, daysApart, sameNote: normalizeNote(candidate.notes) === normalizeNote(other.notes) && normalizeNote(candidate.notes) !== '' });
      break;
    }
  }
  return matches;
}

/**
 * Flags items that duplicate an EARLIER item within the same list (e.g. the
 * same file uploaded twice in one import session, or two overlapping export
 * files merged together) — every duplicate after the first occurrence is
 * reported once, matched against that first occurrence.
 */
export function findDuplicatesWithinBatch<T extends DuplicateCheckItem>(
  items: T[], options: MatchOptions = {},
): DuplicateMatch<T>[] {
  const matches: DuplicateMatch<T>[] = [];
  const flaggedAsDuplicate = new Set<number>();
  for (let i = 0; i < items.length; i++) {
    if (flaggedAsDuplicate.has(i)) continue;
    for (let j = i + 1; j < items.length; j++) {
      if (flaggedAsDuplicate.has(j)) continue;
      const daysApart = isMatch(items[i], items[j], options);
      if (daysApart == null) continue;
      matches.push({ item: items[j], matchedAgainst: items[i], daysApart, sameNote: normalizeNote(items[i].notes) === normalizeNote(items[j].notes) && normalizeNote(items[i].notes) !== '' });
      flaggedAsDuplicate.add(j);
    }
  }
  return matches;
}

/**
 * Finds outflow/income pairs that look like a transfer between the user's
 * own accounts (matching amount, close dates) rather than genuine
 * spending/income — recording both sides as real would inflate totals.
 * Default window is wider than duplicate detection (2 days): a transfer's
 * debit and credit legs often post a day apart.
 */
export function findLikelyTransfers<T extends DuplicateCheckItem>(
  outflows: T[], incomes: T[], options: MatchOptions = {},
): TransferCandidate<T>[] {
  const { maxDaysApart = 2, amountEpsilon = 0.01 } = options;
  const matches: TransferCandidate<T>[] = [];
  for (const outflow of outflows) {
    for (const income of incomes) {
      const daysApart = isMatch(outflow, income, { maxDaysApart, amountEpsilon });
      if (daysApart == null) continue;
      matches.push({ outflow, income, daysApart });
    }
  }
  return matches;
}

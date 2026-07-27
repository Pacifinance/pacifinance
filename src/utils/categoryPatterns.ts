/**
 * Local, adaptive, per-user category-suggestion engine.
 *
 * Learns "note text -> category" associations purely from the user's own
 * transactions (past history + corrections made during CSV import review).
 * Everything lives in localStorage — nothing here is ever sent to the
 * server, matching the project's privacy/anonymity stance (docs/PRIVACY_ANONYMITY.md).
 *
 * This complements (doesn't replace) the static utils/categoryMatcher.ts
 * dictionary: that one is a fixed global alias list; this one is a frequency
 * table that grows and adapts to how *this* user actually categorizes things,
 * including categorizations they've already made in the past.
 */
import { STORAGE_KEYS } from '../constants/storageKeys';

const STORAGE_KEY = STORAGE_KEYS.CATEGORY_PATTERNS;
const SEEDED_FLAG_KEY = STORAGE_KEYS.CATEGORY_PATTERNS_SEEDED;
const MIN_TOKEN_LENGTH = 3;
/** A suggestion needs at least this much accumulated weight to be surfaced — avoids acting on a single, possibly-coincidental past match. */
const MIN_SUGGESTION_WEIGHT = 2;

// Common short connector words that carry no categorization signal, IT + EN.
const STOPWORDS = new Set([
  'the', 'and', 'for', 'con', 'del', 'della', 'dello', 'dei', 'delle', 'degli',
  'per', 'una', 'uno', 'nel', 'nella', 'presso', 'via', 'srl', 'spa', 'sas',
]);

type FrequencyTable = Record<string, Record<number, number>>;
interface PatternStore {
  v: 1;
  expense: FrequencyTable;
  income: FrequencyTable;
}

const emptyStore = (): PatternStore => ({ v: 1, expense: {}, income: {} });

function readStore(): PatternStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    if (parsed?.v !== 1 || !parsed.expense || !parsed.income) return emptyStore();
    return parsed;
  } catch {
    return emptyStore();
  }
}

function writeStore(store: PatternStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore (private mode / storage full) — suggestions just won't persist
  }
}

/**
 * Splits free text into the significant tokens used as pattern keys: lowercased,
 * digits/punctuation stripped, short/connector words dropped.
 */
export function tokenizeNote(note: string | null | undefined): string[] {
  if (!note) return [];
  return note
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents (e.g. caff\u00e8 -> caffe)
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(token));
}

/** Records that `note` was categorized as `categoryIndex` — feeds future suggestions. */
export function learnFromTransaction(note: string | null | undefined, categoryIndex: number, isOutflow: boolean): void {
  const tokens = tokenizeNote(note);
  if (tokens.length === 0) return;
  const store = readStore();
  const table = isOutflow ? store.expense : store.income;
  for (const token of tokens) {
    table[token] = table[token] || {};
    table[token][categoryIndex] = (table[token][categoryIndex] || 0) + 1;
  }
  writeStore(store);
}

export interface CategorySuggestion {
  categoryIndex: number;
  /** Accumulated weight behind this suggestion — higher means more past agreement. */
  weight: number;
}

/** Suggests a category for `note` based on previously learned associations, or null if no confident match exists. */
export function suggestCategory(note: string | null | undefined, isOutflow: boolean): CategorySuggestion | null {
  const tokens = tokenizeNote(note);
  if (tokens.length === 0) return null;
  const store = readStore();
  const table = isOutflow ? store.expense : store.income;

  const scores: Record<number, number> = {};
  for (const token of tokens) {
    const bucket = table[token];
    if (!bucket) continue;
    for (const [categoryIndexStr, count] of Object.entries(bucket)) {
      const categoryIndex = Number(categoryIndexStr);
      scores[categoryIndex] = (scores[categoryIndex] || 0) + count;
    }
  }

  let best: CategorySuggestion | null = null;
  for (const [categoryIndexStr, weight] of Object.entries(scores)) {
    if (!best || weight > best.weight) best = { categoryIndex: Number(categoryIndexStr), weight };
  }
  return best && best.weight >= MIN_SUGGESTION_WEIGHT ? best : null;
}

/** Minimal shape of a past transaction needed to seed/search patterns — matches TransactionDto's relevant fields. */
export interface PatternHistoryEntry {
  notes?: string | null;
  amount: number;
  isExpense: boolean;
  categoryTag?: { index: number } | null;
}

/**
 * Seeds the pattern store from the user's own already-categorized history
 * (both manual entries and past imports) so suggestions are useful from the
 * very first CSV import, not just after the user corrects rows in-session.
 * Idempotent per browser (runs once — see SEEDED_FLAG_KEY) so re-opening the
 * wizard doesn't keep re-inflating counts from the same historical data.
 */
export function seedPatternsFromHistoryOnce(monthlyOutflows: PatternHistoryEntry[][], monthlyIncomes: PatternHistoryEntry[][]): void {
  try {
    if (localStorage.getItem(SEEDED_FLAG_KEY) === '1') return;
  } catch {
    return;
  }
  const seedFlow = (months: PatternHistoryEntry[][], isOutflow: boolean) => {
    for (const month of months) {
      if (!Array.isArray(month)) continue;
      for (const entry of month) {
        const categoryIndex = entry.categoryTag?.index;
        // A default/uncategorized ("Other", 9999) entry teaches nothing useful
        if (categoryIndex == null || categoryIndex === 9999) continue;
        learnFromTransaction(entry.notes, categoryIndex, isOutflow);
      }
    }
  };
  seedFlow(monthlyOutflows, true);
  seedFlow(monthlyIncomes, false);
  try {
    localStorage.setItem(SEEDED_FLAG_KEY, '1');
  } catch {
    // ignore
  }
}

export interface PastMatch {
  entry: PatternHistoryEntry;
  currentCategoryIndex: number | null;
}

/**
 * Finds past transactions whose note shares a significant token with `note`
 * but are filed under a different category than `newCategoryIndex` — surfaced
 * so the user can be offered a retroactive re-categorization (applying it is
 * left to the caller: this is a pure lookup, no mutation).
 */
export function findPastMatchesWithDifferentCategory(
  history: PatternHistoryEntry[],
  note: string | null | undefined,
  newCategoryIndex: number,
): PastMatch[] {
  const tokens = new Set(tokenizeNote(note));
  if (tokens.size === 0) return [];
  const matches: PastMatch[] = [];
  for (const entry of history) {
    const entryTokens = tokenizeNote(entry.notes);
    const sharesToken = entryTokens.some((t) => tokens.has(t));
    if (!sharesToken) continue;
    const currentCategoryIndex = entry.categoryTag?.index ?? null;
    if (currentCategoryIndex === newCategoryIndex) continue;
    matches.push({ entry, currentCategoryIndex });
  }
  return matches;
}

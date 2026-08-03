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
 * including categorizations they've already made in the past — custom
 * sub-categories included, not just the official parent categories.
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

// Each token maps to a composite category key -> count. A composite key is
// either "off:<officialIndex>" or "cus:<customCategoryId>" — the same
// off:/cus: convention CategoryPicker.tsx already uses for its own composite
// select value, so a custom sub-category is a first-class thing this engine
// can learn and suggest, not just its official parent.
type FrequencyTable = Record<string, Record<string, number>>;
interface PatternStore {
  v: 2;
  expense: FrequencyTable;
  income: FrequencyTable;
}

const emptyStore = (): PatternStore => ({ v: 2, expense: {}, income: {} });

function readStore(): PatternStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    // v1 stores keyed by plain numeric category index (no custom-category
    // concept) — rather than migrate a fundamentally different key shape,
    // start fresh; seedPatternsFromHistoryOnce rebuilds it from scratch.
    if (parsed?.v !== 2 || !parsed.expense || !parsed.income) return emptyStore();
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

/** Builds the composite key a token's frequency count is stored/looked up under. */
function compositeKey(categoryIndex: number | null | undefined, userCategoryId: number | null | undefined): string | null {
  if (userCategoryId != null) return `cus:${userCategoryId}`;
  if (categoryIndex != null) return `off:${categoryIndex}`;
  return null;
}

/**
 * Splits free text into the significant tokens used as pattern keys: lowercased,
 * digits/punctuation stripped, short/connector words dropped.
 */
export function tokenizeNote(note: string | null | undefined): string[] {
  if (!note) return [];
  return note
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents (e.g. caffè -> caffe)
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(token));
}

/**
 * Records that `note` was categorized as `categoryIndex` (and, when set, the
 * specific custom sub-category `userCategoryId`) — feeds future suggestions.
 * When a custom category is given, it alone is learned (its parent is
 * resolved back at suggestion time via the live custom-categories list, not
 * cached here, so a later parent change or deletion can't leave a stale
 * suggestion behind).
 */
export function learnFromTransaction(
  note: string | null | undefined,
  categoryIndex: number,
  isOutflow: boolean,
  userCategoryId: number | null = null,
): void {
  const tokens = tokenizeNote(note);
  if (tokens.length === 0) return;
  const key = compositeKey(categoryIndex, userCategoryId);
  if (!key) return;
  const store = readStore();
  const table = isOutflow ? store.expense : store.income;
  for (const token of tokens) {
    table[token] = table[token] || {};
    table[token][key] = (table[token][key] || 0) + 1;
  }
  writeStore(store);
}

export interface CategorySuggestion {
  categoryIndex: number;
  /** Set when the suggestion is specifically a custom sub-category (categoryIndex is then its parent). */
  userCategoryId: number | null;
  /** Accumulated weight behind this suggestion — higher means more past agreement. */
  weight: number;
}

/**
 * Suggests a category for `note` based on previously learned associations,
 * or null if no confident match exists. `customCategories` (the user's live
 * catalog, e.g. from getCustomCategories(userData)) is only needed to resolve
 * a winning "cus:" key back to its current parent index — if a suggested
 * custom category was since deleted, it's skipped in favor of the
 * next-strongest match rather than surfacing a dangling reference.
 */
export function suggestCategory(
  note: string | null | undefined,
  isOutflow: boolean,
  customCategories: Array<{ id: number; parentIndex: number }> = [],
): CategorySuggestion | null {
  const tokens = tokenizeNote(note);
  if (tokens.length === 0) return null;
  const store = readStore();
  const table = isOutflow ? store.expense : store.income;

  const scores: Record<string, number> = {};
  for (const token of tokens) {
    const bucket = table[token];
    if (!bucket) continue;
    for (const [key, count] of Object.entries(bucket)) {
      scores[key] = (scores[key] || 0) + count;
    }
  }

  const ranked = Object.entries(scores).sort(([, a], [, b]) => b - a);
  for (const [key, weight] of ranked) {
    if (weight < MIN_SUGGESTION_WEIGHT) break; // ranked descending — nothing further can qualify
    if (key.startsWith('cus:')) {
      const userCategoryId = Number(key.slice(4));
      const custom = customCategories.find((c) => c.id === userCategoryId);
      if (!custom) continue; // deleted/unknown — try the next-best key instead
      return { categoryIndex: custom.parentIndex, userCategoryId, weight };
    }
    if (key.startsWith('off:')) {
      return { categoryIndex: Number(key.slice(4)), userCategoryId: null, weight };
    }
  }
  return null;
}

/** Minimal shape of a past transaction needed to seed/search patterns — matches TransactionDto's relevant fields. */
export interface PatternHistoryEntry {
  notes?: string | null;
  amount: number;
  isExpense: boolean;
  categoryTag?: { index: number } | null;
  userCategory?: { id: number } | null;
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
        const categoryIndex = entry.categoryTag?.index ?? null;
        const userCategoryId = entry.userCategory?.id ?? null;
        // A default/uncategorized ("Other", 9999) entry with no custom
        // category either teaches nothing useful.
        if (userCategoryId == null && (categoryIndex == null || categoryIndex === 9999)) continue;
        learnFromTransaction(entry.notes, categoryIndex ?? 9999, isOutflow, userCategoryId);
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
  currentUserCategoryId: number | null;
}

/**
 * Finds past transactions whose note shares a significant token with `note`
 * but are filed under a different category (official or custom) than the one
 * just chosen — surfaced so the user can be offered a retroactive
 * re-categorization (applying it is left to the caller: this is a pure
 * lookup, no mutation).
 */
export function findPastMatchesWithDifferentCategory(
  history: PatternHistoryEntry[],
  note: string | null | undefined,
  newCategoryIndex: number,
  newUserCategoryId: number | null = null,
): PastMatch[] {
  const tokens = new Set(tokenizeNote(note));
  if (tokens.size === 0) return [];
  const newKey = compositeKey(newCategoryIndex, newUserCategoryId);
  const matches: PastMatch[] = [];
  for (const entry of history) {
    const entryTokens = tokenizeNote(entry.notes);
    const sharesToken = entryTokens.some((t) => tokens.has(t));
    if (!sharesToken) continue;
    const currentCategoryIndex = entry.categoryTag?.index ?? null;
    const currentUserCategoryId = entry.userCategory?.id ?? null;
    const currentKey = compositeKey(currentCategoryIndex, currentUserCategoryId);
    if (currentKey === newKey) continue;
    matches.push({ entry, currentCategoryIndex, currentUserCategoryId });
  }
  return matches;
}

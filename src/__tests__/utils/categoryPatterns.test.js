import { describe, it, expect, beforeEach } from 'vitest';
import {
  tokenizeNote, learnFromTransaction, suggestCategory, seedPatternsFromHistoryOnce, findPastMatchesWithDifferentCategory,
} from '../../utils/categoryPatterns';

// The global test setup (src/__tests__/setup.js) mocks localStorage as bare
// vi.fn() spies with no backing store. This module's whole point is
// read-after-write persistence across multiple calls, so give it a real
// in-memory implementation for this file only.
const installInMemoryLocalStorage = () => {
  const store = new Map();
  localStorage.getItem.mockImplementation((key) => (store.has(key) ? store.get(key) : null));
  localStorage.setItem.mockImplementation((key, value) => { store.set(key, String(value)); });
  localStorage.removeItem.mockImplementation((key) => { store.delete(key); });
  localStorage.clear.mockImplementation(() => { store.clear(); });
};

describe('tokenizeNote', () => {
  it('lowercases, strips accents/digits/punctuation, and drops short/connector words', () => {
    expect(tokenizeNote('Pagamento Esselunga 24,90 EUR')).toEqual(['pagamento', 'esselunga', 'eur']);
    expect(tokenizeNote('Caffè al Bar Centrale')).toEqual(['caffe', 'bar', 'centrale']);
  });
  it('returns an empty array for empty/missing notes', () => {
    expect(tokenizeNote('')).toEqual([]);
    expect(tokenizeNote(null)).toEqual([]);
    expect(tokenizeNote(undefined)).toEqual([]);
  });
});

describe('learnFromTransaction / suggestCategory', () => {
  beforeEach(() => {
    installInMemoryLocalStorage();
  });

  it('suggests nothing before any learning has happened', () => {
    expect(suggestCategory('Esselunga supermercato', true)).toBeNull();
  });

  it('suggests nothing after a single occurrence of a single-token note (avoids acting on coincidence)', () => {
    learnFromTransaction('Esselunga', 4, true);
    expect(suggestCategory('Esselunga', true)).toBeNull();
  });

  it('suggests the learned category once the same note pattern recurs', () => {
    learnFromTransaction('Esselunga supermercato', 4, true);
    learnFromTransaction('Esselunga supermercato', 4, true);
    // Only the "esselunga" token overlaps with the new note ("pagamento" was never seen)
    const suggestion = suggestCategory('Pagamento Esselunga', true);
    expect(suggestion).toEqual({ categoryIndex: 4, userCategoryId: null, weight: 2 });
  });

  it('keeps expense and income patterns in separate namespaces', () => {
    learnFromTransaction('Bonifico stipendio', 0, false);
    learnFromTransaction('Bonifico stipendio', 0, false);
    expect(suggestCategory('Bonifico stipendio', false)).toEqual({ categoryIndex: 0, userCategoryId: null, weight: 4 });
    expect(suggestCategory('Bonifico stipendio', true)).toBeNull();
  });

  it('learns and suggests a specific custom sub-category, resolving its parent from the live catalog', () => {
    // User has "Cibo lavoro" (work food, parentIndex 4) as a custom sub-category, id 42
    learnFromTransaction('Esselunga pausa pranzo ufficio', 4, true, 42);
    learnFromTransaction('Esselunga pausa pranzo ufficio', 4, true, 42);
    const customCategories = [{ id: 42, parentIndex: 4 }];
    const suggestion = suggestCategory('Esselunga pausa pranzo', true, customCategories);
    expect(suggestion).toEqual({ categoryIndex: 4, userCategoryId: 42, weight: 6 });
  });

  it('falls back to the next-best match when the suggested custom category no longer exists', () => {
    learnFromTransaction('Farmacia acquisto', 9, true, 99); // custom category 99, since deleted
    learnFromTransaction('Farmacia acquisto', 9, true, 99);
    learnFromTransaction('Farmacia acquisto', 9, true); // plain official category, still qualifies alone
    // customCategories no longer contains id 99 — the cus: match (weight 4) must be skipped in
    // favor of the next-best qualifying key, the plain official category (weight 2)
    expect(suggestCategory('Farmacia acquisto', true, [])).toEqual({ categoryIndex: 9, userCategoryId: null, weight: 2 });
  });

  it('prefers a custom sub-category suggestion over its own official parent when both were learned separately', () => {
    learnFromTransaction('Spesa casa settimanale', 4, true); // official Food, no custom category
    learnFromTransaction('Spesa casa settimanale', 4, true, 7); // custom "Spesa casa", id 7, weight higher
    learnFromTransaction('Spesa casa settimanale', 4, true, 7);
    const suggestion = suggestCategory('Spesa casa', true, [{ id: 7, parentIndex: 4 }]);
    expect(suggestion).toEqual({ categoryIndex: 4, userCategoryId: 7, weight: 4 });
  });

  it('picks the category with the most accumulated weight when tokens disagree', () => {
    learnFromTransaction('Amazon reso', 3, true);
    learnFromTransaction('Amazon reso', 3, true);
    learnFromTransaction('Amazon prime video', 1, true);
    learnFromTransaction('Amazon prime video', 1, true);
    learnFromTransaction('Amazon prime video', 1, true);
    // "amazon" now has weight 3 (shopping) + 3 (digital service) — "prime"/"video" only for digital service
    const suggestion = suggestCategory('Addebito Amazon', true);
    expect(suggestion.categoryIndex).toBe(1);
  });
});

describe('seedPatternsFromHistoryOnce', () => {
  beforeEach(() => {
    installInMemoryLocalStorage();
  });

  it('learns from historical entries and makes them available as suggestions', () => {
    const monthlyOutflows = [[
      { notes: 'Esselunga spesa settimanale', amount: 42, isExpense: true, categoryTag: { index: 4 } },
      { notes: 'Esselunga spesa mensile', amount: 80, isExpense: true, categoryTag: { index: 4 } },
    ]];
    seedPatternsFromHistoryOnce(monthlyOutflows, []);
    expect(suggestCategory('Esselunga', true)?.categoryIndex).toBe(4);
  });

  it('ignores uncategorized ("Other", 9999) entries — they carry no signal', () => {
    const monthlyOutflows = [[
      { notes: 'Qualcosa di raro', amount: 10, isExpense: true, categoryTag: { index: 9999 } },
    ]];
    seedPatternsFromHistoryOnce(monthlyOutflows, []);
    expect(suggestCategory('Qualcosa di raro', true)).toBeNull();
  });

  it('only seeds once per browser, even if called again with different data', () => {
    seedPatternsFromHistoryOnce([[{ notes: 'Esselunga uno', amount: 1, isExpense: true, categoryTag: { index: 4 } }]], []);
    seedPatternsFromHistoryOnce([[{ notes: 'Farmacia due', amount: 1, isExpense: true, categoryTag: { index: 9 } }]], []);
    expect(suggestCategory('Farmacia', true)).toBeNull(); // second call was a no-op
  });

  it('seeds custom sub-categories from history, not just official parents', () => {
    const monthlyOutflows = [[
      { notes: 'Esselunga pausa pranzo', amount: 12, isExpense: true, categoryTag: { index: 4 }, userCategory: { id: 42 } },
      { notes: 'Esselunga pausa pranzo', amount: 11, isExpense: true, categoryTag: { index: 4 }, userCategory: { id: 42 } },
    ]];
    seedPatternsFromHistoryOnce(monthlyOutflows, []);
    const suggestion = suggestCategory('Esselunga pausa', true, [{ id: 42, parentIndex: 4 }]);
    expect(suggestion).toEqual({ categoryIndex: 4, userCategoryId: 42, weight: 4 });
  });
});

describe('findPastMatchesWithDifferentCategory', () => {
  const history = [
    { notes: 'Netflix abbonamento mensile', amount: 15, isExpense: true, categoryTag: { index: 6 } },
    { notes: 'Netflix abbonamento mensile', amount: 15, isExpense: true, categoryTag: { index: 6 } },
    { notes: 'Spotify premium', amount: 10, isExpense: true, categoryTag: { index: 1 } },
  ];

  it('finds past entries sharing a token but filed under a different category', () => {
    const matches = findPastMatchesWithDifferentCategory(history, 'Netflix', 1);
    expect(matches).toHaveLength(2);
    expect(matches[0].currentCategoryIndex).toBe(6);
  });

  it('excludes entries already under the target category', () => {
    const matches = findPastMatchesWithDifferentCategory(history, 'Netflix', 6);
    expect(matches).toHaveLength(0);
  });

  it('returns nothing when the note has no significant tokens', () => {
    expect(findPastMatchesWithDifferentCategory(history, '', 1)).toEqual([]);
  });

  it('treats a different custom sub-category under the SAME official parent as a real difference', () => {
    const withCustom = [
      { notes: 'Esselunga pausa pranzo', amount: 12, isExpense: true, categoryTag: { index: 4 }, userCategory: { id: 42 } },
    ];
    // Same official parent (4), but no custom category this time — should still count as a match
    const matches = findPastMatchesWithDifferentCategory(withCustom, 'Esselunga pausa', 4, null);
    expect(matches).toHaveLength(1);
    expect(matches[0].currentUserCategoryId).toBe(42);
  });

  it('excludes an entry filed under the exact same custom sub-category', () => {
    const withCustom = [
      { notes: 'Esselunga pausa pranzo', amount: 12, isExpense: true, categoryTag: { index: 4 }, userCategory: { id: 42 } },
    ];
    const matches = findPastMatchesWithDifferentCategory(withCustom, 'Esselunga pausa', 4, 42);
    expect(matches).toHaveLength(0);
  });
});

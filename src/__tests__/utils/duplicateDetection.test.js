import { describe, it, expect } from 'vitest';
import { findLikelyDuplicates, findDuplicatesWithinBatch, findLikelyTransfers } from '../../utils/duplicateDetection';

describe('findLikelyDuplicates', () => {
  it('flags a candidate matching an existing entry on same date and amount', () => {
    const candidates = [{ date: '2024-03-15', amount: 42, notes: 'Esselunga' }];
    const existing = [{ date: '2024-03-15', amount: 42, notes: 'Esselunga' }];
    const matches = findLikelyDuplicates(candidates, existing);
    expect(matches).toHaveLength(1);
    expect(matches[0].sameNote).toBe(true);
  });

  it('flags within the tolerance window (maxDaysApart) even if dates differ slightly', () => {
    const candidates = [{ date: '2024-03-16', amount: 42 }];
    const existing = [{ date: '2024-03-15', amount: 42 }];
    expect(findLikelyDuplicates(candidates, existing, { maxDaysApart: 1 })).toHaveLength(1);
    expect(findLikelyDuplicates(candidates, existing, { maxDaysApart: 0 })).toHaveLength(0);
  });

  it('does not flag different amounts, even on the same date', () => {
    const candidates = [{ date: '2024-03-15', amount: 42 }];
    const existing = [{ date: '2024-03-15', amount: 43 }];
    expect(findLikelyDuplicates(candidates, existing)).toHaveLength(0);
  });

  it('tolerates tiny rounding differences in amount', () => {
    const candidates = [{ date: '2024-03-15', amount: 42.001 }];
    const existing = [{ date: '2024-03-15', amount: 42 }];
    expect(findLikelyDuplicates(candidates, existing)).toHaveLength(1);
  });

  it('ignores items with no date (nothing to compare)', () => {
    const candidates = [{ date: null, amount: 42 }];
    const existing = [{ date: '2024-03-15', amount: 42 }];
    expect(findLikelyDuplicates(candidates, existing)).toHaveLength(0);
  });

  it('reports sameNote as false when notes differ or are empty', () => {
    const candidates = [{ date: '2024-03-15', amount: 42, notes: 'Esselunga' }];
    const existing = [{ date: '2024-03-15', amount: 42, notes: 'Conad' }];
    expect(findLikelyDuplicates(candidates, existing)[0].sameNote).toBe(false);
    const noNotes = findLikelyDuplicates([{ date: '2024-03-15', amount: 42 }], [{ date: '2024-03-15', amount: 42 }]);
    expect(noNotes[0].sameNote).toBe(false);
  });

  it('recognizes a card settlement a few days later from merchant text', () => {
    const candidate = { date: '2026-07-04', amount: 99, notes: 'APPLE.COM/IT' };
    const existing = { date: '2026-07-01', amount: 99, notes: 'Apple developer program' };
    expect(findLikelyDuplicates([candidate], [existing])).toHaveLength(1);
  });

  it('uses the same specific category as a fallback when manual and bank notes differ', () => {
    const candidate = { date: '2026-07-12', amount: 5, notes: 'LABORATORIO DI FIORI', userCategoryId: 42 };
    const existing = { date: '2026-07-10', amount: 5, notes: 'Rosa', userCategoryId: 42 };
    expect(findLikelyDuplicates([candidate], [existing])).toHaveLength(1);
  });

  it('does not widen the date window for unrelated generic transactions', () => {
    const candidate = { date: '2026-07-12', amount: 5, notes: 'Bar' };
    const existing = { date: '2026-07-10', amount: 5, notes: 'Market' };
    expect(findLikelyDuplicates([candidate], [existing])).toHaveLength(0);
  });
});

describe('findDuplicatesWithinBatch', () => {
  it('flags a later item as a duplicate of an earlier identical one', () => {
    const items = [
      { date: '2024-03-15', amount: 42 },
      { date: '2024-03-15', amount: 42 },
      { date: '2024-04-01', amount: 10 },
    ];
    const matches = findDuplicatesWithinBatch(items);
    expect(matches).toHaveLength(1);
    expect(matches[0].item).toBe(items[1]);
    expect(matches[0].matchedAgainst).toBe(items[0]);
  });

  it('does not flag a triple-matching group more than once each', () => {
    const items = [
      { date: '2024-03-15', amount: 42 },
      { date: '2024-03-15', amount: 42 },
      { date: '2024-03-15', amount: 42 },
    ];
    // items[1] and items[2] both match items[0] — each flagged once, against the first occurrence
    const matches = findDuplicatesWithinBatch(items);
    expect(matches).toHaveLength(2);
    expect(matches.every((m) => m.matchedAgainst === items[0])).toBe(true);
  });

  it('returns nothing for a batch with no repeats', () => {
    const items = [{ date: '2024-03-15', amount: 42 }, { date: '2024-03-16', amount: 10 }];
    expect(findDuplicatesWithinBatch(items)).toHaveLength(0);
  });
});

describe('findLikelyTransfers', () => {
  it('pairs an outflow and income with matching amount within the date window', () => {
    const outflows = [{ date: '2024-03-15', amount: 200 }];
    const incomes = [{ date: '2024-03-16', amount: 200 }];
    const matches = findLikelyTransfers(outflows, incomes);
    expect(matches).toHaveLength(1);
    expect(matches[0].daysApart).toBe(1);
  });

  it('uses a wider default window than duplicate detection (transfer legs can post days apart)', () => {
    const outflows = [{ date: '2024-03-15', amount: 200 }];
    const incomes = [{ date: '2024-03-17', amount: 200 }];
    expect(findLikelyTransfers(outflows, incomes)).toHaveLength(1); // 2 days apart, within default window
  });

  it('does not pair unrelated amounts', () => {
    const outflows = [{ date: '2024-03-15', amount: 200 }];
    const incomes = [{ date: '2024-03-15', amount: 50 }];
    expect(findLikelyTransfers(outflows, incomes)).toHaveLength(0);
  });

  it('can match the same outflow against multiple candidate incomes', () => {
    const outflows = [{ date: '2024-03-15', amount: 200 }];
    const incomes = [{ date: '2024-03-15', amount: 200 }, { date: '2024-03-16', amount: 200 }];
    expect(findLikelyTransfers(outflows, incomes)).toHaveLength(2);
  });
});

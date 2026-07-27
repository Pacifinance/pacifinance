import { describe, it, expect } from 'vitest';
import { findExistingBankCategory, distinctCategoryFlows } from '../../utils/dataImport/bankCategoryTagging';

describe('findExistingBankCategory', () => {
  const categories = [
    { id: 1, parentIndex: 4, parentType: 0, label: 'Revolut' },
    { id: 2, parentIndex: 4, parentType: 0, label: 'Fineco' },
    { id: 3, parentIndex: 12, parentType: 0, label: 'Revolut' },
    { id: 4, parentIndex: 0, parentType: 1, label: 'Revolut' },
  ];

  it('finds a category matching parent, flow and label (case-insensitively)', () => {
    expect(findExistingBankCategory(categories, 4, true, 'revolut')?.id).toBe(1);
    expect(findExistingBankCategory(categories, 4, true, 'REVOLUT')?.id).toBe(1);
  });

  it('does not conflate different parent categories', () => {
    expect(findExistingBankCategory(categories, 12, true, 'Revolut')?.id).toBe(3);
  });

  it('does not conflate expense and income sub-categories under the same label', () => {
    expect(findExistingBankCategory(categories, 0, false, 'Revolut')?.id).toBe(4);
    expect(findExistingBankCategory(categories, 4, false, 'Revolut')).toBeUndefined();
  });

  it('returns undefined when nothing matches', () => {
    expect(findExistingBankCategory(categories, 9, true, 'N26')).toBeUndefined();
  });

  it('treats a missing parentType as matching any flow (legacy rows)', () => {
    const legacy = [{ id: 5, parentIndex: 4, label: 'Revolut' }];
    expect(findExistingBankCategory(legacy, 4, true, 'Revolut')?.id).toBe(5);
    expect(findExistingBankCategory(legacy, 4, false, 'Revolut')?.id).toBe(5);
  });
});

describe('distinctCategoryFlows', () => {
  it('deduplicates by (parentIndex, isOutflow) pair, preserving first-seen order', () => {
    const transactions = [
      { categoryIndex: 4, isOutflow: true },
      { categoryIndex: 4, isOutflow: true },
      { categoryIndex: 4, isOutflow: false },
      { categoryIndex: 12, isOutflow: true },
    ];
    expect(distinctCategoryFlows(transactions)).toEqual([
      { parentIndex: 4, isExpense: true },
      { parentIndex: 4, isExpense: false },
      { parentIndex: 12, isExpense: true },
    ]);
  });

  it('returns an empty array for an empty batch', () => {
    expect(distinctCategoryFlows([])).toEqual([]);
  });
});

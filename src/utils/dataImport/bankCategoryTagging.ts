/**
 * Helpers for the optional "tag these transactions with a sub-category named
 * after the detected bank" step of the CSV import wizard (e.g. every
 * transaction from a Revolut export gets a "Revolut" sub-category, so the
 * user can later tell which account a "Food / Revolut" expense came from).
 *
 * A custom category always belongs to exactly one parent (official) category,
 * so importing transactions across several categories needs one bank-labeled
 * custom category per distinct parent actually used — never one global
 * "Revolut" category, which the schema doesn't support (see
 * server/src/db/models/categories.ts: user_categories.parent_tag_id is single-valued).
 */

export interface CustomCategoryLike {
  id: number;
  parentIndex: number;
  parentType?: number;
  label: string;
}

/** Case-insensitive match on an existing custom category for this exact (parent, flow) pair. */
export function findExistingBankCategory(
  customCategories: CustomCategoryLike[],
  parentIndex: number,
  isExpense: boolean,
  bankLabel: string,
): CustomCategoryLike | undefined {
  const expectedParentType = isExpense ? 0 : 1;
  const normalizedLabel = bankLabel.trim().toLowerCase();
  return customCategories.find((c) =>
    c.parentIndex === parentIndex
    && (c.parentType === undefined || c.parentType === expectedParentType)
    && c.label.trim().toLowerCase() === normalizedLabel);
}

/** Every distinct (parentIndex, isExpense) pair present in a batch of transactions — the set of bank-categories that need resolving. */
export function distinctCategoryFlows(
  transactions: Array<{ categoryIndex: number; isOutflow: boolean }>,
): Array<{ parentIndex: number; isExpense: boolean }> {
  const seen = new Set<string>();
  const result: Array<{ parentIndex: number; isExpense: boolean }> = [];
  for (const tx of transactions) {
    const key = `${tx.categoryIndex}:${tx.isOutflow}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ parentIndex: tx.categoryIndex, isExpense: tx.isOutflow });
  }
  return result;
}

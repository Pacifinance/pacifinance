/**
 * Expense Category Codes
 * 
 * Maps category index numbers (from API) to their label and translation keys.
 * This is the SINGLE SOURCE OF TRUTH for expense category index-to-label mapping.
 * 
 * These indices are used in:
 * - /stats/averages API response (expensesByCategory)
 * - /tags/get API response (expense tags)
 * - OutflowSection component
 * - Comparison page (spending by category comparisons)
 */

export const EXPENSE_CATEGORY_CODES = [
  { index: 1, label: 'digital service', translationKey: 'Digital service' },
  { index: 2, label: 'gift', translationKey: 'Gift' },
  { index: 3, label: 'shopping', translationKey: 'Shopping' },
  { index: 4, label: 'food', translationKey: 'Food' },
  { index: 5, label: 'house', translationKey: 'House' },
  { index: 6, label: 'free time', translationKey: 'Free time' },
  { index: 7, label: 'travelling', translationKey: 'Travelling' },
  { index: 8, label: 'investment', translationKey: 'Investment' },
  { index: 9, label: 'health', translationKey: 'Health' },
  { index: 10, label: 'tax', translationKey: 'Tax' },
  { index: 11, label: 'vehicle', translationKey: 'Vehicle' },
  { index: 12, label: 'transports', translationKey: 'Transports' },
  { index: 13, label: 'pets', translationKey: 'Pets' },
  { index: 14, label: 'personal project', translationKey: 'Personal project' },
  { index: 15, label: 'education', translationKey: 'Education' },
  { index: 9999, label: 'other', translationKey: 'Other' }
];

/**
 * Get category label (English) by index
 * @param {number|string} index - The category index from API
 * @returns {string} The category label (e.g., 'Food', 'Shopping')
 */
export const getCategoryLabelByIndex = (index) => {
  const numIndex = parseInt(index, 10);
  const category = EXPENSE_CATEGORY_CODES.find(c => c.index === numIndex);
  return category ? category.translationKey : 'Other';
};

/**
 * Get category index by label
 * @param {string} label - The category label (case-insensitive)
 * @returns {number|null} The category index, or null if not found
 */
export const getCategoryIndexByLabel = (label) => {
  if (!label) return null;
  const category = EXPENSE_CATEGORY_CODES.find(
    c => c.label.toLowerCase() === label.toLowerCase() || 
         c.translationKey.toLowerCase() === label.toLowerCase()
  );
  return category ? category.index : null;
};

/**
 * Get translated category name by index
 * @param {number|string} index - The category index from API
 * @param {string} language - Language code ('it', 'en')
 * @param {Array} outflowsTags - Tags array from API with translations
 * @returns {string} Translated category name
 */
export const getTranslatedCategoryByIndex = (index, language, outflowsTags) => {
  const numIndex = parseInt(index, 10);
  
  // Try to find in outflowsTags (from API) for accurate translations
  if (outflowsTags && Array.isArray(outflowsTags)) {
    const tag = outflowsTags.find(t => t.index === numIndex);
    if (tag?.translations?.[language]) {
      return tag.translations[language];
    }
  }
  
  // Fallback to static label
  return getCategoryLabelByIndex(numIndex);
};

/**
 * Build a map from index to label for all expense categories
 * @returns {Object} Map of { index: translationKey }
 */
export const getCategoryIndexMap = () => {
  const map = {};
  EXPENSE_CATEGORY_CODES.forEach(c => {
    map[c.index] = c.translationKey;
  });
  return map;
};

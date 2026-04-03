/**
 * Shared helper functions for multi-insert components.
 * Used by MultiOutflowInsert, MultiIncomeInsert, and MultiBalanceInsert.
 */

/**
 * Sanitize amount input: allow only digits and one decimal dot.
 * Replaces commas with dots, strips non-numeric chars, keeps only first dot.
 * @param {string} value - Raw input value
 * @returns {string} Cleaned numeric string
 */
export const handleAmountInput = (value) => {
  let cleaned = value
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '');
  const dotIdx = cleaned.indexOf('.');
  if (dotIdx !== -1) {
    cleaned = cleaned.substring(0, dotIdx + 1) + cleaned.substring(dotIdx + 1).replace(/\./g, '');
  }
  if (cleaned.startsWith('.')) cleaned = '0' + cleaned;
  return cleaned;
};

/**
 * Format an amount on blur using Italian locale (comma as decimal separator).
 * @param {string} value - The input value to format
 * @returns {string} Formatted string or the original value if not a number
 */
export const formatAmountBlur = (value) => {
  const cleanedValue = value
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '')
    .replace(/^0+(\d)/, '$1');
  const num = Number(cleanedValue);
  if (!isNaN(num) && cleanedValue !== '') {
    return num.toLocaleString('it-IT', { minimumFractionDigits: 2 });
  }
  return value;
};

/**
 * Group rows by their balance source, summing amounts per source.
 * Used by both outflow and income multi-insert handlers.
 * @param {Array} rows - Array of row objects with balanceSource and amount fields
 * @returns {Object} Map of { balanceSourceName: totalAmount }
 */
export const groupAmountsByBalanceSource = (rows) => {
  const result = {};
  for (const row of rows) {
    if (row.balanceSource && row.balanceSource !== '') {
      const val = parseFloat(String(row.amount).replace(',', '.'));
      if (!isNaN(val) && val > 0) {
        result[row.balanceSource] = (result[row.balanceSource] || 0) + val;
      }
    }
  }
  return result;
};

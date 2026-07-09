/**
 * Shared helper functions for multi-insert components.
 * Used by MultiOutflowInsert, MultiIncomeInsert, and MultiBalanceInsert.
 */

import { addCurrency } from '../../utils/money';

/**
 * Parse an Italian-formatted amount string (e.g. "1.234,56") into a number.
 * Handles both raw input ("10.5") and locale-formatted strings ("1.234,56").
 * @param {string|number} value - The amount to parse
 * @returns {number} Parsed number, or 0 if invalid
 */
export const parseFormattedAmount = (value) => {
  if (typeof value === 'number') return value;
  const str = String(value).trim();
  if (!str) return 0;
  // IT-formatted string (comma as decimal separator, e.g. "1.234,56" or "1,23")
  if (str.includes(',')) {
    const cleaned = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  // Raw numeric string with dot as decimal separator (e.g. "1234.56" or "1234")
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

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
      const val = parseFormattedAmount(row.amount);
      if (val > 0) {
        result[row.balanceSource] = addCurrency(result[row.balanceSource] || 0, val);
      }
    }
  }
  return result;
};

/**
 * Data Import Utilities
 * 
 * Handles parsing CSV/Excel files and preparing data for import.
 * All parsing happens client-side — no file upload to server.
 * 
 * Strategy B: Column Mapping — user maps their columns to PaciFinance fields.
 */

import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { EXPENSE_CATEGORY_CODES, getCategoryIndexByLabel } from '../data/expenseCategoryCodes';

// ═══════════════════════════════════════════
// File Parsing
// ═══════════════════════════════════════════

/**
 * Parse a CSV file and return headers + rows
 * @param {File} file - The CSV file to parse
 * @returns {Promise<{headers: string[], rows: string[][]}>}
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length < 2) {
          reject(new Error('FILE_TOO_SHORT'));
          return;
        }
        const allRows = results.data.map(row => row.map(cell => String(cell).trim()));
        // Pad all rows to same length
        const maxCols = Math.max(...allRows.map(r => r.length));
        allRows.forEach(row => { while (row.length < maxCols) row.push(''); });
        const headers = allRows[0];
        const rows = allRows.slice(1);
        resolve({ headers, rows, allRows });
      },
      error: (err) => reject(err),
    });
  });
};

/**
 * Parse an Excel file and return headers + rows
 * @param {File} file - The Excel file to parse
 * @returns {Promise<{headers: string[], rows: string[][], sheetNames: string[]}>}
 */
export const parseExcel = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheetNames = workbook.worksheets.map(ws => ws.name);
  const worksheet = workbook.worksheets[0]; // default: first sheet

  if (!worksheet || worksheet.rowCount < 2) {
    throw new Error('FILE_TOO_SHORT');
  }

  const allRows = [];
  let maxCols = 0;

  worksheet.eachRow((row) => {
    const rawValues = row.values || [];
    const strValues = [];
    // row.values is 1-indexed, iterate from index 1
    for (let i = 1; i < rawValues.length; i++) {
      const v = rawValues[i];
      if (v instanceof Date) {
        strValues.push(formatDateForPreview(v));
      } else if (v && typeof v === 'object' && v.result !== undefined) {
        strValues.push(String(v.result));
      } else if (v != null) {
        strValues.push(String(v).trim());
      } else {
        strValues.push('');
      }
    }
    if (strValues.length > maxCols) maxCols = strValues.length;
    allRows.push(strValues);
  });

  // Pad all rows to same length to avoid undefined access
  allRows.forEach(row => {
    while (row.length < maxCols) row.push('');
  });

  if (allRows.length < 2) {
    throw new Error('FILE_TOO_SHORT');
  }

  const headers = allRows[0];
  const rows = allRows.slice(1);

  return { headers, rows, sheetNames, allRows };
};

/**
 * Auto-detect file type and parse
 * @param {File} file
 * @returns {Promise<{headers: string[], rows: string[][]}>}
 */
export const parseFile = async (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  if (['csv', 'tsv', 'txt'].includes(ext)) {
    return parseCSV(file);
  }
  if (['xlsx', 'xls'].includes(ext)) {
    return parseExcel(file);
  }
  throw new Error('UNSUPPORTED_FORMAT');
};

// ═══════════════════════════════════════════
// Date Parsing
// ═══════════════════════════════════════════

const DATE_FORMATS = [
  { label: 'DD/MM/YYYY', regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, parse: (m) => new Date(m[3], m[2] - 1, m[1]) },
  { label: 'MM/DD/YYYY', regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, parse: (m) => new Date(m[3], m[1] - 1, m[2]) },
  { label: 'YYYY-MM-DD', regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, parse: (m) => new Date(m[1], m[2] - 1, m[3]) },
  { label: 'DD-MM-YYYY', regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, parse: (m) => new Date(m[3], m[2] - 1, m[1]) },
  { label: 'DD.MM.YYYY', regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, parse: (m) => new Date(m[3], m[2] - 1, m[1]) },
  { label: 'DD/MM/YY', regex: /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, parse: (m) => new Date(2000 + parseInt(m[3]), m[2] - 1, m[1]) },
  { label: 'YYYY/MM/DD', regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, parse: (m) => new Date(m[1], m[2] - 1, m[3]) },
];

export { DATE_FORMATS };

/**
 * Try to auto-detect date format from sample values
 * @param {string[]} samples - Array of date strings
 * @returns {string|null} The detected format label or null
 */
export const detectDateFormat = (samples) => {
  const validSamples = samples.filter(s => s && s.trim());
  if (validSamples.length === 0) return null;

  for (const fmt of DATE_FORMATS) {
    const matchCount = validSamples.filter(s => fmt.regex.test(s.trim())).length;
    if (matchCount >= validSamples.length * 0.8) {
      return fmt.label;
    }
  }
  return null;
};

/**
 * Parse a date string with a specific format
 * @param {string} dateStr
 * @param {string} formatLabel - One of DATE_FORMATS labels
 * @returns {Date|null}
 */
export const parseDate = (dateStr, formatLabel) => {
  if (!dateStr) return null;
  const fmt = DATE_FORMATS.find(f => f.label === formatLabel);
  if (!fmt) return null;
  const match = dateStr.trim().match(fmt.regex);
  if (!match) return null;
  const d = fmt.parse(match);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Format a Date for display in preview
 */
const formatDateForPreview = (d) => {
  if (!(d instanceof Date)) return String(d);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Format a Date for the API (YYYY-MM-DD)
 */
export const formatDateForAPI = (d) => {
  if (!(d instanceof Date) || isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

// ═══════════════════════════════════════════
// Amount Parsing
// ═══════════════════════════════════════════

/**
 * Parse an amount string to a number
 * Handles: 1.234,56 (EU) / 1,234.56 (US) / -120.50 / +2800
 * @param {string} amountStr
 * @returns {number|null}
 */
export const parseAmount = (amountStr) => {
  if (amountStr === null || amountStr === undefined) return null;
  // If already a number (e.g. from Excel), return directly
  if (typeof amountStr === 'number') {
    return isNaN(amountStr) ? null : (amountStr === 0 ? null : amountStr);
  }
  let s = String(amountStr).trim();
  if (s === '' || s === 'undefined' || s === 'null') return null;
  // Remove currency symbols
  s = s.replace(/[€$£¥₹]/g, '').trim();
  // Remove spaces/non-breaking spaces
  s = s.replace(/[\s\u00A0]/g, '');
  // Replace en-dash/em-dash with hyphen-minus
  s = s.replace(/[\u2013\u2014\u2212]/g, '-');
  // Handle parenthesized negatives: (27.95) → -27.95
  if (/^\([\d.,]+\)$/.test(s)) {
    s = '-' + s.replace(/[()]/g, '');
  }

  // Detect EU format: 1.234,56 → comma is decimal separator
  if (/^-?\d{1,3}(\.\d{3})*,\d{1,2}$/.test(s) || /^-?\d+,\d{1,2}$/.test(s)) {
    s = s.replace(/\./g, '').replace(',', '.');
  }
  // Detect US format: 1,234.56 → period is decimal separator
  else if (/^-?\d{1,3}(,\d{3})*\.\d{1,2}$/.test(s)) {
    s = s.replace(/,/g, '');
  }
  // Simple comma as decimal: 120,50
  else if (/^-?\d+,\d+$/.test(s)) {
    s = s.replace(',', '.');
  }

  const num = parseFloat(s);
  return isNaN(num) ? null : num;
};

// ═══════════════════════════════════════════
// Category Matching
// ═══════════════════════════════════════════

/**
 * All outflow category names (English) for fuzzy matching
 */
const OUTFLOW_CATEGORIES = EXPENSE_CATEGORY_CODES.map(c => ({
  index: c.index,
  label: c.translationKey,
}));

/**
 * Aliases for fuzzy matching user categories → PaciFinance categories
 */
const CATEGORY_ALIASES = {
  // Italian aliases
  'alimentari': 4, 'cibo': 4, 'spesa': 4, 'supermercato': 4, 'ristorante': 4, 'pranzo': 4, 'cena': 4, 'bar': 4,
  'casa': 5, 'affitto': 5, 'mutuo': 5, 'condominio': 5, 'bollette': 5, 'utenze': 5,
  'salute': 9, 'farmacia': 9, 'medico': 9, 'dentista': 9, 'palestra': 9,
  'istruzione': 15, 'scuola': 15, 'università': 15, 'corso': 15, 'libri': 15,
  'viaggio': 7, 'vacanza': 7, 'hotel': 7, 'volo': 7,
  'shopping': 3, 'abbigliamento': 3, 'vestiti': 3, 'scarpe': 3, 'amazon': 3,
  'divertimento': 6, 'svago': 6, 'cinema': 6, 'netflix': 6, 'spotify': 6,
  'trasporto': 12, 'treno': 12, 'bus': 12, 'metro': 12, 'benzina': 11, 'auto': 11, 'macchina': 11, 'assicurazione auto': 11,
  'regalo': 2, 'regali': 2,
  'tasse': 10, 'tassa': 10, 'irpef': 10, 'iva': 10,
  'investimento': 8, 'investimenti': 8, 'azioni': 8, 'etf': 8, 'crypto': 8, 'bitcoin': 8,
  'animali': 13, 'veterinario': 13, 'cane': 13, 'gatto': 13,
  'progetto': 14, 'hobby': 14,
  'servizio digitale': 1, 'abbonamento': 1, 'app': 1, 'cloud': 1,
  // English aliases
  'food': 4, 'grocery': 4, 'groceries': 4, 'restaurant': 4, 'dining': 4, 'lunch': 4, 'dinner': 4,
  'house': 5, 'rent': 5, 'mortgage': 5, 'utilities': 5, 'bills': 5,
  'health': 9, 'pharmacy': 9, 'doctor': 9, 'gym': 9, 'fitness': 9,
  'education': 15, 'school': 15, 'university': 15, 'course': 15, 'books': 15,
  'travel': 7, 'travelling': 7, 'vacation': 7, 'flight': 7, 'hotel': 7,
  'clothes': 3, 'clothing': 3, 'shoes': 3,
  'entertainment': 6, 'fun': 6, 'leisure': 6, 'free time': 6,
  'transport': 12, 'transports': 12, 'train': 12, 'bus': 12, 'gas': 11, 'car': 11, 'vehicle': 11, 'fuel': 11,
  'gift': 2, 'gifts': 2,
  'tax': 10, 'taxes': 10,
  'investment': 8, 'investing': 8, 'stocks': 8,
  'pets': 13, 'pet': 13, 'vet': 13,
  'project': 14, 'personal project': 14,
  'digital service': 1, 'subscription': 1, 'software': 1,
  'other': 9999, 'altro': 9999, 'miscellaneous': 9999, 'misc': 9999, 'varie': 9999,
  // Income aliases
  'stipendio': 'income_0', 'salary': 'income_0', 'wage': 'income_0', 'pay': 'income_0',
  'freelance': 'income_1', 'reddito freelance': 'income_1', 'freelance income': 'income_1', 'consulenza': 'income_1',
  'entrata extra': 'income_2', 'extra income': 'income_2', 'bonus': 'income_2', 'rimborso': 'income_2',
  'pensione': 'income_4', 'retirement': 'income_4',
};

/**
 * Fuzzy match a user's category string to a PaciFinance category index
 * @param {string} userCategory
 * @returns {{ index: number, label: string, isIncome: boolean } | null}
 */
export const matchCategory = (userCategory) => {
  if (!userCategory) return null;
  const normalized = userCategory.toLowerCase().trim();

  // 1. Exact match in aliases
  if (CATEGORY_ALIASES[normalized] !== undefined) {
    const val = CATEGORY_ALIASES[normalized];
    if (typeof val === 'string' && val.startsWith('income_')) {
      return { index: parseInt(val.split('_')[1]), label: userCategory, isIncome: true };
    }
    const cat = OUTFLOW_CATEGORIES.find(c => c.index === val);
    return cat ? { index: cat.index, label: cat.label, isIncome: false } : null;
  }

  // 2. Try direct label match
  const directIndex = getCategoryIndexByLabel(normalized);
  if (directIndex !== null) {
    const cat = OUTFLOW_CATEGORIES.find(c => c.index === directIndex);
    return cat ? { index: cat.index, label: cat.label, isIncome: false } : null;
  }

  // 3. Partial match (category name contained in user input)
  for (const [alias, idx] of Object.entries(CATEGORY_ALIASES)) {
    if (normalized.includes(alias) || alias.includes(normalized)) {
      if (typeof idx === 'string' && idx.startsWith('income_')) {
        return { index: parseInt(idx.split('_')[1]), label: userCategory, isIncome: true };
      }
      const cat = OUTFLOW_CATEGORIES.find(c => c.index === idx);
      if (cat) return { index: cat.index, label: cat.label, isIncome: false };
    }
  }

  return null; // Unmatched → user must manually map
};

// ═══════════════════════════════════════════
// Auto-Detection Helpers
// ═══════════════════════════════════════════

/**
 * Try to auto-detect which column holds dates, amounts, categories
 * @param {string[]} headers
 * @param {string[][]} rows - First N rows for sampling
 * @returns {{ dateCol: number|null, amountCol: number|null, categoryCol: number|null, notesCol: number|null }}
 */
export const autoDetectColumns = (headers, rows) => {
  const sampleRows = rows.slice(0, 10);
  const result = { dateCol: null, amountCol: null, categoryCol: null, notesCol: null };

  headers.forEach((header, colIdx) => {
    const h = header.toLowerCase();
    const samples = sampleRows.map(r => r[colIdx]).filter(Boolean);

    // Date detection
    if (result.dateCol === null) {
      if (/data|date|fecha|datum/i.test(h)) {
        result.dateCol = colIdx;
      } else if (samples.length > 0 && detectDateFormat(samples)) {
        result.dateCol = colIdx;
      }
    }

    // Amount detection
    if (result.amountCol === null) {
      if (/importo|amount|valore|value|cifra|suma|betrag|prezzo|costo/i.test(h)) {
        result.amountCol = colIdx;
      } else if (samples.length > 0 && samples.filter(s => parseAmount(s) !== null).length >= samples.length * 0.7) {
        // Most values are parseable as numbers → likely amount
        if (result.dateCol !== colIdx) {
          result.amountCol = colIdx;
        }
      }
    }

    // Category detection
    if (result.categoryCol === null) {
      if (/categ|tipo|type|category|descrizione|description/i.test(h)) {
        result.categoryCol = colIdx;
      }
    }

    // Notes detection
    if (result.notesCol === null) {
      if (/note|notes|nota|memo|commento|comment|descrizione/i.test(h)) {
        result.notesCol = colIdx;
      }
    }
  });

  return result;
};

// ═══════════════════════════════════════════
// Data Preparation for API
// ═══════════════════════════════════════════

/**
 * @typedef {Object} ColumnMapping
 * @property {number} dateCol - Column index for date
 * @property {number} amountCol - Column index for amount (single mode)
 * @property {boolean} [dualAmountMode] - Whether using separate income/outflow columns
 * @property {number} [incomeCol] - Column index for income amounts (dual mode)
 * @property {number} [outflowCol] - Column index for outflow amounts (dual mode)
 * @property {number|null} categoryCol - Column index for category (optional)
 * @property {number|null} notesCol - Column index for notes (optional)
 * @property {string} dateFormat - Date format label
 * @property {'auto'|'outflow'|'income'} transactionType - How to determine type
 * @property {number} defaultCategoryIndex - Fallback category index
 */

/**
 * @typedef {Object} ParsedTransaction
 * @property {string} date - YYYY-MM-DD format
 * @property {number} amount - Positive number
 * @property {boolean} isOutflow - true = expense, false = income
 * @property {number} categoryIndex - PaciFinance category index
 * @property {string} categoryLabel - Display label
 * @property {string} notes - Notes/description
 * @property {number} rowIndex - Original row index for error tracking
 * @property {string|null} error - Error message if row is invalid
 */

/**
 * Process all rows with the given column mapping
 * @param {string[][]} rows
 * @param {ColumnMapping} mapping
 * @returns {{ valid: ParsedTransaction[], errors: ParsedTransaction[] }}
 */
export const processRows = (rows, mapping) => {
  const valid = [];
  const errors = [];

  if (mapping.dualAmountMode) {
    // Dual column mode: separate income/outflow columns
    rows.forEach((row, idx) => {
      const result = processRowDual(row, mapping, idx);
      result.forEach(r => {
        if (r.error) {
          errors.push(r);
        } else {
          valid.push(r);
        }
      });
    });
  } else {
    rows.forEach((row, idx) => {
      const result = processRow(row, mapping, idx);
      if (result.error) {
        errors.push(result);
      } else {
        valid.push(result);
      }
    });
  }

  return { valid, errors };
};

/**
 * Process a single row
 */
const processRow = (row, mapping, rowIndex) => {
  const { dateCol, amountCol, categoryCol, notesCol, dateFormat, transactionType, defaultCategoryIndex } = mapping;

  // Parse date
  const dateStr = row[dateCol];
  const parsedDate = parseDate(dateStr, dateFormat);
  if (!parsedDate) {
    return { rowIndex, error: `INVALID_DATE: "${dateStr}"`, date: dateStr, amount: 0, isOutflow: true, categoryIndex: 9999, categoryLabel: 'Other', notes: '' };
  }
  const date = formatDateForAPI(parsedDate);

  // Parse amount
  const amountStr = row[amountCol];
  const parsedAmount = parseAmount(amountStr);
  if (parsedAmount === null) {
    return { rowIndex, error: `INVALID_AMOUNT: "${amountStr}"`, date, amount: 0, isOutflow: true, categoryIndex: 9999, categoryLabel: 'Other', notes: '' };
  }
  if (parsedAmount === 0) {
    return { rowIndex, error: `INVALID_AMOUNT: zero`, date, amount: 0, isOutflow: true, categoryIndex: 9999, categoryLabel: 'Other', notes: '' };
  }

  // Determine transaction type
  let isOutflow;
  if (transactionType === 'outflow') {
    isOutflow = true;
  } else if (transactionType === 'income') {
    isOutflow = false;
  } else {
    // Auto: negative = outflow, positive = income
    isOutflow = parsedAmount < 0;
  }

  const amount = Math.abs(parsedAmount);

  // Match category
  let categoryIndex = defaultCategoryIndex;
  let categoryLabel = 'Other';
  if (categoryCol !== null && row[categoryCol]) {
    const matched = matchCategory(row[categoryCol]);
    if (matched) {
      categoryIndex = matched.index;
      categoryLabel = matched.label;
      // Override isOutflow if category is clearly income
      if (matched.isIncome) isOutflow = false;
    } else {
      categoryLabel = row[categoryCol];
    }
  }

  // Notes
  const notes = notesCol !== null ? (row[notesCol] || '') : '';

  return { rowIndex, error: null, date, amount, isOutflow, categoryIndex, categoryLabel, notes };
};

/**
 * Process a single row in dual-column mode (separate income/outflow columns).
 * Returns an array of 0-2 transactions per row.
 */
const processRowDual = (row, mapping, rowIndex) => {
  const { dateCol, incomeCol, outflowCol, categoryCol, notesCol, dateFormat, defaultCategoryIndex } = mapping;

  // Parse date
  const dateStr = row[dateCol];
  const parsedDate = parseDate(dateStr, dateFormat);
  if (!parsedDate) {
    return [{ rowIndex, error: `INVALID_DATE: "${dateStr}"`, date: dateStr, amount: 0, isOutflow: true, categoryIndex: 9999, categoryLabel: 'Other', notes: '' }];
  }
  const date = formatDateForAPI(parsedDate);

  // Match category (shared for both)
  let categoryIndex = defaultCategoryIndex;
  let categoryLabel = 'Other';
  if (categoryCol !== null && row[categoryCol]) {
    const matched = matchCategory(row[categoryCol]);
    if (matched) {
      categoryIndex = matched.index;
      categoryLabel = matched.label;
    } else {
      categoryLabel = row[categoryCol];
    }
  }

  const notes = notesCol !== null ? (row[notesCol] || '') : '';
  const results = [];

  // Outflow amount
  if (outflowCol >= 0) {
    const outStr = row[outflowCol];
    const outAmt = parseAmount(outStr);
    if (outAmt !== null && outAmt !== 0) {
      results.push({ rowIndex, error: null, date, amount: Math.abs(outAmt), isOutflow: true, categoryIndex, categoryLabel, notes });
    }
  }

  // Income amount
  if (incomeCol >= 0) {
    const incStr = row[incomeCol];
    const incAmt = parseAmount(incStr);
    if (incAmt !== null && incAmt !== 0) {
      results.push({ rowIndex: rowIndex, error: null, date, amount: Math.abs(incAmt), isOutflow: false, categoryIndex, categoryLabel, notes });
    }
  }

  // If neither column had a valid amount, it's a skip (empty row in both cols)
  if (results.length === 0) {
    // Only flag as error if the row has something in the date — not a fully empty row
    const outStr = outflowCol >= 0 ? row[outflowCol] : '';
    const incStr = incomeCol >= 0 ? row[incomeCol] : '';
    if ((outStr && outStr.trim()) || (incStr && incStr.trim())) {
      return [{ rowIndex, error: `INVALID_AMOUNT: "${outStr || incStr}"`, date, amount: 0, isOutflow: true, categoryIndex: 9999, categoryLabel: 'Other', notes: '' }];
    }
    // Both empty — silently skip
    return [];
  }

  return results;
};

/**
 * Convert a parsed transaction to the API format for /expenses/add
 * @param {ParsedTransaction} tx
 * @returns {{ expense: Object }}
 */
export const toAPIFormat = (tx, paymentType) => ({
  expense: {
    date: tx.date,
    amount: tx.amount,
    is_expense: tx.isOutflow,
    payment_type: tx.isOutflow ? (paymentType ?? 1) : 0,
    category_tag: tx.categoryIndex,
    notes: tx.notes,
  },
});

// ═══════════════════════════════════════════
// Saved Mappings (localStorage)
// ═══════════════════════════════════════════

const MAPPINGS_KEY = 'pacifinance-import-mappings';

/**
 * Save a column mapping for reuse
 * @param {string} name - User-provided name (e.g. "Banca Intesa export")
 * @param {ColumnMapping} mapping
 */
export const saveMapping = (name, mapping) => {
  try {
    const existing = JSON.parse(localStorage.getItem(MAPPINGS_KEY) || '[]');
    const updated = existing.filter(m => m.name !== name);
    updated.push({ name, mapping, savedAt: new Date().toISOString() });
    localStorage.setItem(MAPPINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save mapping:', e);
  }
};

/**
 * Load all saved mappings
 * @returns {Array<{name: string, mapping: ColumnMapping, savedAt: string}>}
 */
export const loadSavedMappings = () => {
  try {
    return JSON.parse(localStorage.getItem(MAPPINGS_KEY) || '[]');
  } catch {
    return [];
  }
};

/**
 * Delete a saved mapping
 * @param {string} name
 */
export const deleteSavedMapping = (name) => {
  try {
    const existing = JSON.parse(localStorage.getItem(MAPPINGS_KEY) || '[]');
    const updated = existing.filter(m => m.name !== name);
    localStorage.setItem(MAPPINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete mapping:', e);
  }
};

// ═══════════════════════════════════════════
// Summary Helpers
// ═══════════════════════════════════════════

/**
 * Summarize parsed data for the review step
 * @param {ParsedTransaction[]} transactions
 * @returns {Object}
 */
export const summarizeImport = (transactions) => {
  const outflows = transactions.filter(t => t.isOutflow);
  const incomes = transactions.filter(t => !t.isOutflow);

  const outflowTotal = outflows.reduce((sum, t) => sum + t.amount, 0);
  const incomeTotal = incomes.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryCounts = {};
  transactions.forEach(t => {
    const key = t.categoryLabel || 'Other';
    if (!categoryCounts[key]) categoryCounts[key] = { count: 0, total: 0 };
    categoryCounts[key].count++;
    categoryCounts[key].total += t.amount;
  });

  // Date range
  const dates = transactions.map(t => t.date).filter(Boolean).sort();

  return {
    totalTransactions: transactions.length,
    outflowCount: outflows.length,
    incomeCount: incomes.length,
    outflowTotal,
    incomeTotal,
    categoryCounts,
    dateRange: { from: dates[0] || null, to: dates[dates.length - 1] || null },
  };
};

// Accepted file extensions
export const ACCEPTED_EXTENSIONS = '.csv,.tsv,.txt,.xlsx,.xls';

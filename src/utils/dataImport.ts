/**
 * Data Import Utilities
 * 
 * Handles parsing CSV/Excel files and preparing data for import.
 * All parsing happens client-side — no file upload to server.
 * 
 * Strategy B: Column Mapping — user maps their columns to Pacifinance fields.
 */

import Papa from 'papaparse';
import { matchCategory, matchCategoryByMCC } from './categoryMatcher';

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
  // exceljs is ~1.4MB: loaded on demand so it never lands in the page chunks.
  const { default: ExcelJS } = await import('exceljs');
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
 * Some exports (e.g. Trade Republic's "datetime" column) carry a full ISO
 * timestamp like "2026-07-16T14:40:18.467Z" in a column that otherwise reads
 * as a plain date. Strip the time component so the existing YYYY-MM-DD
 * format still matches, instead of requiring a dedicated format entry.
 * @param {string} s
 * @returns {string}
 */
const stripTimeComponent = (s) => {
  const isoMatch = s.match(/^(\d{4}-\d{1,2}-\d{1,2})(?:T|\s+\d{1,2}:\d{2})/);
  return isoMatch ? isoMatch[1] : s;
};

/**
 * Extracts the time-of-day from a full ISO timestamp, converted to the
 * browser's local timezone (e.g. Trade Republic's "datetime" column) —
 * distinguishing a lunchtime work-related purchase from an evening one at
 * a glance is exactly the kind of thing day-only dates can't show. Returns
 * null for a bare date with no time component (nothing to extract), not
 * midnight — a plain "2026-07-16" must never be shown as "00:00".
 * @param {string} raw
 * @returns {string|null} "HH:MM" in local time, or null
 */
const extractLocalTime = (raw) => {
  if (!raw) return null;
  const localTimestamp = String(raw).match(/^\d{4}-\d{1,2}-\d{1,2}\s+(\d{1,2}):(\d{2})/);
  if (localTimestamp) return `${localTimestamp[1].padStart(2, '0')}:${localTimestamp[2]}`;
  if (!/T\d{2}:\d{2}/.test(raw)) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export { extractLocalTime };

/**
 * Try to auto-detect date format from sample values
 * @param {string[]} samples - Array of date strings
 * @returns {string|null} The detected format label or null
 */
export const detectDateFormat = (samples) => {
  const validSamples = samples.filter(s => s && s.trim()).map(s => stripTimeComponent(s.trim()));
  if (validSamples.length === 0) return null;

  for (const fmt of DATE_FORMATS) {
    const matchCount = validSamples.filter(s => fmt.regex.test(s)).length;
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
  const match = stripTimeComponent(dateStr.trim()).match(fmt.regex);
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

// matchCategory now lives in utils/categoryMatcher.ts (no papaparse/exceljs
// dependency) so that eagerly-rendered consumers (e.g. the dashboard
// quick-add smart-paste field) can use it without pulling this whole
// module's heavy parsers into their bundle. Re-exported here for
// backward compatibility with existing importers of this module.
export { matchCategory };

// ═══════════════════════════════════════════
// Auto-Detection Helpers
// ═══════════════════════════════════════════

// A file can have both a full "datetime" column and a plain "date" column
// (e.g. Trade Republic's export) — an exact-name match must win over a
// looser substring match like "datetime", which also contains "date".
const EXACT_DATE_NAMES = ['date', 'data', 'fecha', 'datum'];

/**
 * Try to auto-detect which column holds dates, amounts, categories
 * @param {string[]} headers
 * @param {string[][]} rows - First N rows for sampling
 * @returns {{ dateCol: number|null, amountCol: number|null, categoryCol: number|null, notesCol: number|null, mccCol: number|null, timeCol: number|null }}
 */
export const autoDetectColumns = (headers, rows) => {
  const sampleRows = rows.slice(0, 10);
  const result = { dateCol: null, amountCol: null, categoryCol: null, notesCol: null, mccCol: null, timeCol: null };

  // Pass 1: exact header-name match for the date column takes priority over
  // any substring match found in the pass below.
  const amountCandidates = [];

  headers.forEach((header, colIdx) => {
    if (result.dateCol === null && EXACT_DATE_NAMES.includes(header.trim().toLowerCase())) {
      result.dateCol = colIdx;
    }
  });

  headers.forEach((header, colIdx) => {
    const h = header.toLowerCase();
    const samples = sampleRows.map(r => r[colIdx]).filter(Boolean);

    // Date detection (fallback: substring match, then content sniffing)
    if (result.dateCol === null) {
      if (/data|date|fecha|datum/i.test(h)) {
        result.dateCol = colIdx;
      } else if (samples.length > 0 && detectDateFormat(samples)) {
        result.dateCol = colIdx;
      }
    }

    // Collect amount candidates and score them after every column has been
    // inspected. This prevents an early numeric ID/reference column from
    // winning merely because it appears before the actual transaction value.
    if (colIdx !== result.dateCol && samples.length > 0) {
      const parsed = samples.map(parseAmount).filter(value => value !== null);
      const numericRate = parsed.length / samples.length;
      if (numericRate >= 0.7) {
        const headerHint = /importo|amount|valore|value|cifra|suma|betrag|prezzo|costo|saldo|balance/i.test(h);
        const idPenalty = /(^|\b)(id|reference|riferimento|codice|code|numero|number|nr)(\b|$)/i.test(h);
        const hasSignedOrDecimal = samples.some(value => /[-+(),.]|\d,\d/.test(String(value)));
        amountCandidates.push({
          colIdx,
          score: numericRate * 4 + (headerHint ? 8 : 0) + (hasSignedOrDecimal ? 2 : 0) - (idPenalty ? 8 : 0),
        });
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

    // Time-of-day detection — a distinct timestamp column carrying the time
    // that the (day-only) date column doesn't, e.g. Trade Republic's own
    // "datetime" column once "date" itself has been chosen for dateCol.
    if (result.timeCol === null && colIdx !== result.dateCol) {
      if (/datetime|orario|^ora$|^time$/i.test(h) && samples.some(s => /T\d{2}:\d{2}/.test(s))) {
        result.timeCol = colIdx;
      }
    }

    // Merchant Category Code detection (see matchCategoryByMCC) — a bonus
    // signal, not required, so no fallback beyond the header-name match.
    if (result.mccCol === null) {
      if (/mcc/i.test(h)) {
        result.mccCol = colIdx;
      }
    }
  });

  amountCandidates.sort((a, b) => b.score - a.score);
  result.amountCol = amountCandidates[0]?.colIdx ?? null;

  return result;
};

// Header-name hints for a file that splits amounts into two columns instead
// of one signed column (common in bank-statement-style exports: "Entrate"/
// "Uscite", "Dare"/"Avere", "Credit"/"Debit"...).
const INCOME_COL_HINTS = /entrat[ae]|accredit|credit|deposit|income|avere/i;
const OUTFLOW_COL_HINTS = /uscit[ae]|addebit|debit|withdrawal|expense|\bdare\b/i;

/**
 * Try to auto-detect a pair of separate income/outflow amount columns.
 * Returns null unless BOTH a plausible income and a plausible outflow
 * column are found (a single hint alone is too weak a signal — the caller
 * should fall back to single-amount-column detection in that case).
 * @param {string[]} headers
 * @param {string[][]} rows
 * @returns {{ incomeCol: number, outflowCol: number } | null}
 */
export const detectDualAmountColumns = (headers, rows) => {
  const sampleRows = rows.slice(0, 10);
  let incomeCol = null;
  let outflowCol = null;

  headers.forEach((header, colIdx) => {
    const h = header.toLowerCase();
    const samples = sampleRows.map(r => r[colIdx]).filter(Boolean);
    const numericRate = samples.length > 0
      ? samples.filter(s => parseAmount(s) !== null).length / samples.length
      : 0;
    if (numericRate < 0.5) return;

    if (incomeCol === null && INCOME_COL_HINTS.test(h)) incomeCol = colIdx;
    if (outflowCol === null && OUTFLOW_COL_HINTS.test(h)) outflowCol = colIdx;
  });

  return incomeCol !== null && outflowCol !== null ? { incomeCol, outflowCol } : null;
};

/**
 * Locate the most likely header row in exports that contain titles, account
 * metadata or blank lines before the transaction table. Unknown column names
 * are supported by inspecting the values below each candidate row.
 * @param {string[][]} allRows
 */
export const detectTableStructure = (allRows) => {
  const fallback = {
    headerRowIndex: 0,
    dateCol: null,
    amountCol: null,
    categoryCol: null,
    notesCol: null,
    mccCol: null,
    timeCol: null,
    dualAmountColumns: null,
    dateFormat: null,
  };
  if (!Array.isArray(allRows) || allRows.length < 2) return fallback;

  let best = null;
  const candidateCount = Math.min(30, allRows.length - 1);
  for (let headerRowIndex = 0; headerRowIndex < candidateCount; headerRowIndex += 1) {
    const headers = allRows[headerRowIndex] || [];
    if (headers.filter(value => String(value || '').trim()).length < 2) continue;

    const rows = allRows.slice(headerRowIndex + 1, headerRowIndex + 21);
    const detected = autoDetectColumns(headers, rows);
    const dualAmountColumns = detectDualAmountColumns(headers, rows);
    const dateSamples = detected.dateCol === null ? [] : rows.map(row => row[detected.dateCol]);
    const dateFormat = detectDateFormat(dateSamples);
    if (detected.dateCol === null || !dateFormat || (detected.amountCol === null && !dualAmountColumns)) continue;

    const usableRows = rows.filter((row) => {
      if (!parseDate(row[detected.dateCol], dateFormat)) return false;
      if (dualAmountColumns) {
        return parseAmount(row[dualAmountColumns.incomeCol]) !== null
          || parseAmount(row[dualAmountColumns.outflowCol]) !== null;
      }
      return parseAmount(row[detected.amountCol]) !== null;
    }).length;
    if (usableRows === 0) continue;

    const headerHints = headers.filter(value => /date|data|amount|importo|debit|credit|entrata|uscita|description|descrizione/i.test(String(value))).length;
    const score = usableRows * 3 + headerHints * 2 + (dualAmountColumns ? 2 : 0);
    if (!best || score > best.score) {
      best = { ...detected, headerRowIndex, dualAmountColumns, dateFormat, score };
    }
  }

  if (!best) return fallback;
  const { score: _score, ...structure } = best;
  return structure;
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
 * @property {number|null} [mccCol] - Column index for Merchant Category Code (optional)
 * @property {number|null} [timeCol] - Column index for a separate time-of-day timestamp (optional)
 * @property {string} dateFormat - Date format label
 * @property {'auto'|'outflow'|'income'} transactionType - How to determine type
 * @property {number} defaultCategoryIndex - Fallback category index
 */

/**
 * @typedef {Object} ParsedTransaction
 * @property {string} date - YYYY-MM-DD format
 * @property {string|null} [time] - "HH:MM" local time, when the source carried a timestamp
 * @property {number} amount - Positive number
 * @property {boolean} isOutflow - true = expense, false = income
 * @property {number} categoryIndex - Pacifinance category index
 * @property {string} categoryLabel - Display label
 * @property {string} notes - Notes/description
 * @property {number} rowIndex - Original row index for error tracking
 * @property {string|null} error - Error message if row is invalid
 * @property {boolean} [isLikelyTransfer] - True when the source category/type column
 *   value denotes a transfer to/from another account (see isTransferType)
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
 * Recognizes known bank-transaction-type enum values (or the Italian word
 * "bonifico") that denote a transfer to/from another account rather than a
 * card purchase or an interest/fee line — e.g. Trade Republic's
 * TRANSFER_INSTANT_INBOUND/OUTBOUND, TRANSFER_DIRECT_DEBIT_INBOUND. Used to
 * flag likely inter-account transfers directly, without needing an exact
 * matching row (same amount/date) elsewhere in the same file.
 * @param {string} rawValue
 * @returns {boolean}
 */
const isTransferType = (rawValue) => {
  if (!rawValue) return false;
  const v = rawValue.trim().toLowerCase();
  return /^transfer_/.test(v) || v === 'transfer' || v.includes('bonifico');
};

export { isTransferType };

/**
 * Process a single row
 */
const processRow = (row, mapping, rowIndex) => {
  const { dateCol, amountCol, categoryCol, notesCol, mccCol, timeCol, dateFormat, transactionType, defaultCategoryIndex } = mapping;

  // Parse date
  const dateStr = row[dateCol];
  const parsedDate = parseDate(dateStr, dateFormat);
  if (!parsedDate) {
    return { rowIndex, error: `INVALID_DATE: "${dateStr}"`, date: dateStr, amount: 0, isOutflow: true, categoryIndex: 9999, categoryLabel: 'Other', notes: '' };
  }
  const date = formatDateForAPI(parsedDate);
  const time = timeCol !== null && timeCol !== undefined ? extractLocalTime(row[timeCol]) : null;

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
  let isLikelyTransfer = false;
  if (categoryCol !== null && row[categoryCol]) {
    const rawCategory = row[categoryCol];
    if (isTransferType(rawCategory)) isLikelyTransfer = true;
    const matched = matchCategory(rawCategory);
    if (matched) {
      categoryIndex = matched.index;
      categoryLabel = matched.label;
      // Override isOutflow if category is clearly income
      if (matched.isIncome) isOutflow = false;
    } else {
      categoryLabel = rawCategory;
    }
  }

  // Merchant Category Code fallback (card outflows only) — a bank-agnostic
  // signal that works even with no prior categorized history to learn from.
  // Only applied when the category column above didn't already resolve to
  // something more specific.
  if (isOutflow && categoryIndex === defaultCategoryIndex && mccCol !== null && mccCol !== undefined && row[mccCol]) {
    const mccMatch = matchCategoryByMCC(row[mccCol]);
    if (mccMatch) {
      categoryIndex = mccMatch.index;
      categoryLabel = mccMatch.label;
    }
  }

  // Notes
  const notes = notesCol !== null ? (row[notesCol] || '') : '';

  return { rowIndex, error: null, date, time, amount, isOutflow, categoryIndex, categoryLabel, notes, isLikelyTransfer };
};

/**
 * Process a single row in dual-column mode (separate income/outflow columns).
 * Returns an array of 0-2 transactions per row.
 */
const processRowDual = (row, mapping, rowIndex) => {
  const { dateCol, incomeCol, outflowCol, categoryCol, notesCol, mccCol, timeCol, dateFormat, defaultCategoryIndex } = mapping;

  // Parse date
  const dateStr = row[dateCol];
  const parsedDate = parseDate(dateStr, dateFormat);
  if (!parsedDate) {
    return [{ rowIndex, error: `INVALID_DATE: "${dateStr}"`, date: dateStr, amount: 0, isOutflow: true, categoryIndex: 9999, categoryLabel: 'Other', notes: '' }];
  }
  const date = formatDateForAPI(parsedDate);
  const time = timeCol !== null && timeCol !== undefined ? extractLocalTime(row[timeCol]) : null;

  // Match category (shared for both)
  let categoryIndex = defaultCategoryIndex;
  let categoryLabel = 'Other';
  let isLikelyTransfer = false;
  if (categoryCol !== null && row[categoryCol]) {
    const rawCategory = row[categoryCol];
    if (isTransferType(rawCategory)) isLikelyTransfer = true;
    const matched = matchCategory(rawCategory);
    if (matched) {
      categoryIndex = matched.index;
      categoryLabel = matched.label;
    } else {
      categoryLabel = rawCategory;
    }
  }

  const notes = notesCol !== null ? (row[notesCol] || '') : '';
  const results = [];

  // Outflow amount
  if (outflowCol >= 0) {
    const outStr = row[outflowCol];
    const outAmt = parseAmount(outStr);
    if (outAmt !== null && outAmt !== 0) {
      let outCategoryIndex = categoryIndex;
      let outCategoryLabel = categoryLabel;
      if (outCategoryIndex === defaultCategoryIndex && mccCol !== null && mccCol !== undefined && row[mccCol]) {
        const mccMatch = matchCategoryByMCC(row[mccCol]);
        if (mccMatch) { outCategoryIndex = mccMatch.index; outCategoryLabel = mccMatch.label; }
      }
      results.push({ rowIndex, error: null, date, time, amount: Math.abs(outAmt), isOutflow: true, categoryIndex: outCategoryIndex, categoryLabel: outCategoryLabel, notes, isLikelyTransfer });
    }
  }

  // Income amount
  if (incomeCol >= 0) {
    const incStr = row[incomeCol];
    const incAmt = parseAmount(incStr);
    if (incAmt !== null && incAmt !== 0) {
      results.push({ rowIndex: rowIndex, error: null, date, time, amount: Math.abs(incAmt), isOutflow: false, categoryIndex, categoryLabel, notes, isLikelyTransfer });
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
    user_category_id: tx.userCategoryId ?? null,
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

/** Localized weekday for an ISO date-only string, without UTC/local-midnight drift. */
export const formatImportWeekday = (date, locale) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return '';
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat(locale || 'en', { weekday: 'long', timeZone: 'UTC' }).format(parsed);
};

// Accepted file extensions
export const ACCEPTED_EXTENSIONS = '.csv,.tsv,.txt,.xlsx,.xls';

// ═══════════════════════════════════════════
// Undo / Rollback Last Import
// ═══════════════════════════════════════════

const LAST_IMPORT_KEY = 'pacifinance-last-import';

/**
 * Save the list of successfully imported transactions for potential undo.
 * Stores date + amount + is_expense for each — the same fields the delete API needs.
 * @param {Array<{date: string, amount: number, is_expense: boolean}>} transactions
 */
export const saveLastImport = (transactions) => {
  try {
    const data = {
      transactions,
      importedAt: new Date().toISOString(),
      count: transactions.length,
    };
    localStorage.setItem(LAST_IMPORT_KEY, JSON.stringify(data));
  } catch { /* ignore quota errors */ }
};

/**
 * Load the last import data (for undo).
 * @returns {{ transactions: Array, importedAt: string, count: number } | null}
 */
export const loadLastImport = () => {
  try {
    const raw = localStorage.getItem(LAST_IMPORT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.transactions || !Array.isArray(data.transactions)) return null;
    return data;
  } catch {
    return null;
  }
};

/**
 * Clear the saved last import (after successful undo or when no longer relevant).
 */
export const clearLastImport = () => {
  try {
    localStorage.removeItem(LAST_IMPORT_KEY);
  } catch { /* ignore */ }
};

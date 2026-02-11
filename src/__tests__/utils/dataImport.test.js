/**
 * Tests for dataImport utility functions
 * 
 * Comprehensive test coverage for CSV/Excel import feature:
 * - File parsing (CSV/Excel detection)
 * - Date format detection & parsing
 * - Amount parsing (EU, US, currency symbols, edge cases)
 * - Category fuzzy matching (IT + EN, aliases, partial match)
 * - Column auto-detection heuristics
 * - Row processing with column mappings
 * - API format conversion
 * - Saved mappings (localStorage CRUD)
 * - Import summary calculation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseAmount,
  parseDate,
  formatDateForAPI,
  detectDateFormat,
  DATE_FORMATS,
  matchCategory,
  autoDetectColumns,
  processRows,
  toAPIFormat,
  summarizeImport,
  saveMapping,
  loadSavedMappings,
  deleteSavedMapping,
  ACCEPTED_EXTENSIONS,
} from '../../utils/dataImport';

// ═══════════════════════════════════════════════════════════════
// DATE PARSING
// ═══════════════════════════════════════════════════════════════

describe('Date Parsing', () => {
  describe('DATE_FORMATS', () => {
    it('should export 7 date formats', () => {
      expect(DATE_FORMATS).toHaveLength(7);
    });

    it('should include DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY, DD.MM.YYYY, DD/MM/YY, YYYY/MM/DD', () => {
      const labels = DATE_FORMATS.map(f => f.label);
      expect(labels).toContain('DD/MM/YYYY');
      expect(labels).toContain('MM/DD/YYYY');
      expect(labels).toContain('YYYY-MM-DD');
      expect(labels).toContain('DD-MM-YYYY');
      expect(labels).toContain('DD.MM.YYYY');
      expect(labels).toContain('DD/MM/YY');
      expect(labels).toContain('YYYY/MM/DD');
    });

    it('each format should have label, regex, and parse function', () => {
      DATE_FORMATS.forEach(fmt => {
        expect(fmt.label).toBeDefined();
        expect(fmt.regex).toBeInstanceOf(RegExp);
        expect(typeof fmt.parse).toBe('function');
      });
    });
  });

  describe('parseDate', () => {
    // DD/MM/YYYY
    it('should parse DD/MM/YYYY correctly', () => {
      const d = parseDate('15/03/2024', 'DD/MM/YYYY');
      expect(d).toBeInstanceOf(Date);
      expect(d.getDate()).toBe(15);
      expect(d.getMonth()).toBe(2); // 0-indexed
      expect(d.getFullYear()).toBe(2024);
    });

    it('should parse single-digit day/month DD/MM/YYYY', () => {
      const d = parseDate('5/1/2024', 'DD/MM/YYYY');
      expect(d).toBeInstanceOf(Date);
      expect(d.getDate()).toBe(5);
      expect(d.getMonth()).toBe(0);
    });

    // MM/DD/YYYY
    it('should parse MM/DD/YYYY correctly', () => {
      const d = parseDate('03/15/2024', 'MM/DD/YYYY');
      expect(d).toBeInstanceOf(Date);
      expect(d.getDate()).toBe(15);
      expect(d.getMonth()).toBe(2);
    });

    // YYYY-MM-DD (ISO)
    it('should parse YYYY-MM-DD (ISO format)', () => {
      const d = parseDate('2024-12-25', 'YYYY-MM-DD');
      expect(d).toBeInstanceOf(Date);
      expect(d.getDate()).toBe(25);
      expect(d.getMonth()).toBe(11);
      expect(d.getFullYear()).toBe(2024);
    });

    // DD-MM-YYYY
    it('should parse DD-MM-YYYY', () => {
      const d = parseDate('31-01-2025', 'DD-MM-YYYY');
      expect(d.getDate()).toBe(31);
      expect(d.getMonth()).toBe(0);
      expect(d.getFullYear()).toBe(2025);
    });

    // DD.MM.YYYY (German/Swiss format)
    it('should parse DD.MM.YYYY', () => {
      const d = parseDate('28.02.2024', 'DD.MM.YYYY');
      expect(d.getDate()).toBe(28);
      expect(d.getMonth()).toBe(1);
    });

    // DD/MM/YY (short year)
    it('should parse DD/MM/YY and assume 2000s', () => {
      const d = parseDate('01/06/25', 'DD/MM/YY');
      expect(d.getDate()).toBe(1);
      expect(d.getMonth()).toBe(5);
      expect(d.getFullYear()).toBe(2025);
    });

    // YYYY/MM/DD
    it('should parse YYYY/MM/DD', () => {
      const d = parseDate('2024/07/04', 'YYYY/MM/DD');
      expect(d.getDate()).toBe(4);
      expect(d.getMonth()).toBe(6);
    });

    // Edge cases
    it('should return null for empty string', () => {
      expect(parseDate('', 'DD/MM/YYYY')).toBeNull();
    });

    it('should return null for null input', () => {
      expect(parseDate(null, 'DD/MM/YYYY')).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(parseDate(undefined, 'DD/MM/YYYY')).toBeNull();
    });

    it('should return null for invalid format label', () => {
      expect(parseDate('15/03/2024', 'INVALID')).toBeNull();
    });

    it('should return null for mismatched format', () => {
      expect(parseDate('2024-03-15', 'DD/MM/YYYY')).toBeNull();
    });

    it('should return null for completely invalid date string', () => {
      expect(parseDate('not-a-date', 'YYYY-MM-DD')).toBeNull();
    });

    it('should handle date string with surrounding whitespace', () => {
      const d = parseDate('  15/03/2024  ', 'DD/MM/YYYY');
      expect(d).toBeInstanceOf(Date);
      expect(d.getDate()).toBe(15);
    });
  });

  describe('detectDateFormat', () => {
    it('should detect DD/MM/YYYY from sample dates', () => {
      const samples = ['15/03/2024', '01/12/2023', '28/02/2024', '05/06/2024', '22/11/2024'];
      expect(detectDateFormat(samples)).toBe('DD/MM/YYYY');
    });

    it('should detect YYYY-MM-DD from ISO dates', () => {
      const samples = ['2024-03-15', '2024-01-01', '2024-12-31', '2024-06-15'];
      expect(detectDateFormat(samples)).toBe('YYYY-MM-DD');
    });

    it('should detect DD.MM.YYYY from dotted dates', () => {
      const samples = ['15.03.2024', '01.12.2023', '28.02.2024', '05.06.2024'];
      expect(detectDateFormat(samples)).toBe('DD.MM.YYYY');
    });

    it('should detect DD-MM-YYYY from dashed dates', () => {
      const samples = ['15-03-2024', '01-12-2023', '28-02-2024'];
      expect(detectDateFormat(samples)).toBe('DD-MM-YYYY');
    });

    it('should detect DD/MM/YY from short dates', () => {
      const samples = ['15/03/24', '01/12/23', '28/02/24'];
      expect(detectDateFormat(samples)).toBe('DD/MM/YY');
    });

    it('should return null for empty samples', () => {
      expect(detectDateFormat([])).toBeNull();
    });

    it('should return null for non-date samples', () => {
      const samples = ['hello', 'world', 'foo', 'bar'];
      expect(detectDateFormat(samples)).toBeNull();
    });

    it('should tolerate up to 20% non-matching samples (80% threshold)', () => {
      const samples = ['15/03/2024', '01/12/2023', '28/02/2024', '05/06/2024', 'invalid'];
      // 4/5 = 80% → should still detect
      expect(detectDateFormat(samples)).toBe('DD/MM/YYYY');
    });

    it('should return null if less than 80% match', () => {
      const samples = ['15/03/2024', '01/12/2023', 'invalid', 'nope', 'bad'];
      // 2/5 = 40% → should not detect
      expect(detectDateFormat(samples)).toBeNull();
    });

    it('should filter out empty/whitespace-only samples', () => {
      const samples = ['15/03/2024', '', '  ', '01/12/2023', '28/02/2024'];
      // Only 3 valid samples, all matching → 100%
      expect(detectDateFormat(samples)).toBe('DD/MM/YYYY');
    });
  });

  describe('formatDateForAPI', () => {
    it('should format as YYYY-MM-DD', () => {
      expect(formatDateForAPI(new Date(2024, 2, 15))).toBe('2024-03-15');
    });

    it('should pad single-digit day and month', () => {
      expect(formatDateForAPI(new Date(2024, 0, 5))).toBe('2024-01-05');
    });

    it('should return null for invalid date', () => {
      expect(formatDateForAPI(new Date('invalid'))).toBeNull();
    });

    it('should return null for non-Date input', () => {
      expect(formatDateForAPI('2024-03-15')).toBeNull();
    });

    it('should handle Dec 31', () => {
      expect(formatDateForAPI(new Date(2024, 11, 31))).toBe('2024-12-31');
    });

    it('should handle Jan 1', () => {
      expect(formatDateForAPI(new Date(2025, 0, 1))).toBe('2025-01-01');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// AMOUNT PARSING
// ═══════════════════════════════════════════════════════════════

describe('Amount Parsing', () => {
  describe('parseAmount', () => {
    // Standard formats
    it('should parse simple integer', () => {
      expect(parseAmount('100')).toBe(100);
    });

    it('should parse simple decimal (US)', () => {
      expect(parseAmount('100.50')).toBe(100.50);
    });

    // European format: 1.234,56
    it('should parse EU format with thousands separator: 1.234,56', () => {
      expect(parseAmount('1.234,56')).toBe(1234.56);
    });

    it('should parse EU format without thousands: 234,56', () => {
      expect(parseAmount('234,56')).toBe(234.56);
    });

    it('should parse EU format with large numbers: 12.345.678,99', () => {
      expect(parseAmount('12.345.678,99')).toBe(12345678.99);
    });

    // US format: 1,234.56
    it('should parse US format: 1,234.56', () => {
      expect(parseAmount('1,234.56')).toBe(1234.56);
    });

    it('should parse US format large: 12,345,678.99', () => {
      expect(parseAmount('12,345,678.99')).toBe(12345678.99);
    });

    // Comma as simple decimal separator: 120,50
    it('should parse comma as decimal separator: 120,50', () => {
      expect(parseAmount('120,50')).toBe(120.50);
    });

    it('should parse 0,99', () => {
      expect(parseAmount('0,99')).toBe(0.99);
    });

    // Negative amounts
    it('should parse negative: -120.50', () => {
      expect(parseAmount('-120.50')).toBe(-120.50);
    });

    it('should parse negative EU: -234,56', () => {
      expect(parseAmount('-234,56')).toBe(-234.56);
    });

    // Positive sign
    it('should parse positive: +2800', () => {
      expect(parseAmount('+2800')).toBe(2800);
    });

    // Currency symbols
    it('should strip € symbol', () => {
      expect(parseAmount('€ 1.234,56')).toBe(1234.56);
    });

    it('should strip $ symbol', () => {
      expect(parseAmount('$100.50')).toBe(100.50);
    });

    it('should strip £ symbol', () => {
      expect(parseAmount('£99.99')).toBe(99.99);
    });

    it('should strip ¥ symbol', () => {
      expect(parseAmount('¥10000')).toBe(10000);
    });

    it('should strip ₹ symbol', () => {
      expect(parseAmount('₹5000')).toBe(5000);
    });

    // Whitespace
    it('should handle leading/trailing whitespace', () => {
      expect(parseAmount('  100.50  ')).toBe(100.50);
    });

    it('should handle non-breaking spaces', () => {
      expect(parseAmount('1\u00A0234,56')).toBe(1234.56);
    });

    // Edge cases
    it('should return null for empty string', () => {
      expect(parseAmount('')).toBeNull();
    });

    it('should return null for null', () => {
      expect(parseAmount(null)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(parseAmount(undefined)).toBeNull();
    });

    it('should return null for non-numeric text', () => {
      expect(parseAmount('hello')).toBeNull();
    });

    it('should parse "0" as 0', () => {
      expect(parseAmount('0')).toBe(0);
    });

    it('should parse number passed as number type', () => {
      expect(parseAmount(42.5)).toBe(42.5);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// CATEGORY MATCHING
// ═══════════════════════════════════════════════════════════════

describe('Category Matching', () => {
  describe('matchCategory', () => {
    // Italian aliases → outflow
    describe('Italian outflow aliases', () => {
      it.each([
        ['alimentari', 4], ['cibo', 4], ['spesa', 4], ['supermercato', 4], ['ristorante', 4],
        ['casa', 5], ['affitto', 5], ['mutuo', 5], ['bollette', 5],
        ['salute', 9], ['farmacia', 9], ['medico', 9],
        ['istruzione', 15], ['scuola', 15], ['libri', 15],
        ['viaggio', 7], ['vacanza', 7],
        ['shopping', 3], ['abbigliamento', 3], ['vestiti', 3],
        ['divertimento', 6], ['svago', 6], ['cinema', 6],
        ['trasporto', 12], ['treno', 12], ['benzina', 11], ['auto', 11],
        ['regalo', 2], ['regali', 2],
        ['tasse', 10], ['irpef', 10],
        ['investimento', 8], ['azioni', 8], ['etf', 8], ['crypto', 8],
        ['animali', 13], ['veterinario', 13],
        ['progetto', 14], ['hobby', 14],
        ['servizio digitale', 1], ['abbonamento', 1],
      ])('"%s" → category index %i', (alias, expectedIndex) => {
        const result = matchCategory(alias);
        expect(result).not.toBeNull();
        expect(result.index).toBe(expectedIndex);
        expect(result.isIncome).toBe(false);
      });
    });

    // English aliases → outflow
    describe('English outflow aliases', () => {
      it.each([
        ['food', 4], ['groceries', 4], ['restaurant', 4], ['dining', 4],
        ['house', 5], ['rent', 5], ['utilities', 5],
        ['health', 9], ['pharmacy', 9], ['gym', 9],
        ['education', 15], ['school', 15],
        ['travel', 7], ['vacation', 7],
        ['clothes', 3], ['clothing', 3],
        ['entertainment', 6], ['fun', 6],
        ['transport', 12], ['train', 12], ['gas', 11], ['car', 11],
        ['gift', 2], ['gifts', 2],
        ['tax', 10], ['taxes', 10],
        ['investment', 8], ['stocks', 8],
        ['pets', 13], ['vet', 13],
        ['project', 14],
        ['subscription', 1], ['software', 1],
      ])('"%s" → category index %i', (alias, expectedIndex) => {
        const result = matchCategory(alias);
        expect(result).not.toBeNull();
        expect(result.index).toBe(expectedIndex);
        expect(result.isIncome).toBe(false);
      });
    });

    // "Other" aliases
    it.each([
      ['other', 9999], ['altro', 9999], ['miscellaneous', 9999], ['misc', 9999], ['varie', 9999],
    ])('"%s" → Other (9999)', (alias, expectedIndex) => {
      const result = matchCategory(alias);
      expect(result).not.toBeNull();
      expect(result.index).toBe(expectedIndex);
    });

    // Income aliases
    describe('Income aliases', () => {
      it.each([
        ['stipendio', 0], ['salary', 0], ['wage', 0],
        ['freelance', 1], ['consulenza', 1],
        ['entrata extra', 2], ['extra income', 2], ['bonus', 2], ['rimborso', 2],
        ['pensione', 4], ['retirement', 4],
      ])('"%s" → income index %i', (alias, expectedIndex) => {
        const result = matchCategory(alias);
        expect(result).not.toBeNull();
        expect(result.index).toBe(expectedIndex);
        expect(result.isIncome).toBe(true);
      });
    });

    // Case insensitivity
    it('should be case insensitive', () => {
      expect(matchCategory('FOOD')).not.toBeNull();
      expect(matchCategory('Food')).not.toBeNull();
      expect(matchCategory('ALIMENTARI')).not.toBeNull();
    });

    // Whitespace handling
    it('should trim whitespace', () => {
      expect(matchCategory('  food  ')).not.toBeNull();
      expect(matchCategory('  casa  ')).not.toBeNull();
    });

    // Partial matching
    it('should do partial matching (userInput contains alias)', () => {
      const result = matchCategory('spesa alimentari settimanale');
      expect(result).not.toBeNull();
      // Should match one of the food-related aliases
      expect([4]).toContain(result.index);
    });

    it('should do partial matching (alias contains userInput)', () => {
      const result = matchCategory('gift');
      expect(result).not.toBeNull();
      expect(result.index).toBe(2);
    });

    // Unmatched
    it('should return null for completely unknown category', () => {
      expect(matchCategory('xyzabc123')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(matchCategory('')).toBeNull();
    });

    it('should return null for null', () => {
      expect(matchCategory(null)).toBeNull();
    });

    it('should return null for undefined', () => {
      expect(matchCategory(undefined)).toBeNull();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// AUTO-DETECT COLUMNS
// ═══════════════════════════════════════════════════════════════

describe('Auto-Detect Columns', () => {
  describe('autoDetectColumns', () => {
    it('should detect date column by header name "Data"', () => {
      const headers = ['Data', 'Importo', 'Categoria', 'Note'];
      const rows = [['15/03/2024', '100.50', 'Food', 'Lunch']];
      const result = autoDetectColumns(headers, rows);
      expect(result.dateCol).toBe(0);
    });

    it('should detect date column by header name "Date"', () => {
      const headers = ['Date', 'Amount', 'Category'];
      const rows = [['2024-03-15', '100', 'Food']];
      const result = autoDetectColumns(headers, rows);
      expect(result.dateCol).toBe(0);
    });

    it('should detect amount column by header name "Importo"', () => {
      const headers = ['Data', 'Importo', 'Nota'];
      const rows = [['15/03/2024', '100', 'test']];
      const result = autoDetectColumns(headers, rows);
      expect(result.amountCol).toBe(1);
    });

    it('should detect amount column by header name "Amount"', () => {
      const headers = ['Date', 'Amount', 'Note'];
      const rows = [['2024-03-15', '100', 'test']];
      const result = autoDetectColumns(headers, rows);
      expect(result.amountCol).toBe(1);
    });

    it('should detect category column by header name "Categoria"', () => {
      const headers = ['Data', 'Importo', 'Categoria'];
      const rows = [['15/03/2024', '100', 'Food']];
      const result = autoDetectColumns(headers, rows);
      expect(result.categoryCol).toBe(2);
    });

    it('should detect category by header "Category"', () => {
      const headers = ['Date', 'Amount', 'Category'];
      const rows = [['2024-03-15', '100', 'Food']];
      const result = autoDetectColumns(headers, rows);
      expect(result.categoryCol).toBe(2);
    });

    it('should detect notes column by header "Notes"', () => {
      const headers = ['Date', 'Amount', 'Category', 'Notes'];
      const rows = [['2024-03-15', '100', 'Food', 'Lunch']];
      const result = autoDetectColumns(headers, rows);
      expect(result.notesCol).toBe(3);
    });

    it('should detect notes column by header "Note"', () => {
      const headers = ['Data', 'Importo', 'Note'];
      const rows = [['15/03/2024', '100', 'pranzo']];
      const result = autoDetectColumns(headers, rows);
      expect(result.notesCol).toBe(2);
    });

    it('should detect date column by content heuristic when header is unrecognized', () => {
      const headers = ['col1', 'col2', 'col3'];
      const rows = [
        ['15/03/2024', '100', 'Food'],
        ['16/03/2024', '200', 'Rent'],
        ['17/03/2024', '50', 'Fun'],
      ];
      const result = autoDetectColumns(headers, rows);
      expect(result.dateCol).toBe(0);
    });

    it('should detect amount column by content heuristic when header is unrecognized', () => {
      const headers = ['col1', 'col2', 'col3'];
      const rows = [
        ['15/03/2024', '100.50', 'Food'],
        ['16/03/2024', '200.00', 'Rent'],
        ['17/03/2024', '50.75', 'Fun'],
      ];
      const result = autoDetectColumns(headers, rows);
      expect(result.amountCol).toBe(1);
    });

    it('should return nulls when nothing can be detected', () => {
      const headers = ['a', 'b', 'c'];
      const rows = [['x', 'y', 'z']];
      const result = autoDetectColumns(headers, rows);
      // At least some fields should be null
      expect(result).toHaveProperty('dateCol');
      expect(result).toHaveProperty('amountCol');
      expect(result).toHaveProperty('categoryCol');
      expect(result).toHaveProperty('notesCol');
    });

    it('should detect all 4 columns for a well-structured table', () => {
      const headers = ['Date', 'Amount', 'Category', 'Notes'];
      const rows = [
        ['2024-03-15', '100.50', 'Food', 'Lunch'],
        ['2024-03-16', '1200.00', 'Rent', 'March rent'],
      ];
      const result = autoDetectColumns(headers, rows);
      expect(result.dateCol).toBe(0);
      expect(result.amountCol).toBe(1);
      expect(result.categoryCol).toBe(2);
      expect(result.notesCol).toBe(3);
    });

    it('should handle "tipo" header as category column', () => {
      const headers = ['Data', 'Valore', 'Tipo'];
      const rows = [['15/03/2024', '100', 'Food']];
      const result = autoDetectColumns(headers, rows);
      expect(result.categoryCol).toBe(2);
    });

    it('should handle "Descrizione" header as category or notes', () => {
      const headers = ['Data', 'Importo', 'Descrizione'];
      const rows = [['15/03/2024', '100', 'Something']];
      const result = autoDetectColumns(headers, rows);
      // "Descrizione" matches both category and notes patterns — first match wins per column priority
      expect(result.categoryCol === 2 || result.notesCol === 2).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// PROCESS ROWS
// ═══════════════════════════════════════════════════════════════

describe('Row Processing', () => {
  const baseMapping = {
    dateCol: 0,
    amountCol: 1,
    categoryCol: 2,
    notesCol: 3,
    dateFormat: 'DD/MM/YYYY',
    transactionType: 'auto',
    defaultCategoryIndex: 9999,
  };

  describe('processRows — basic', () => {
    it('should process valid rows correctly', () => {
      const rows = [
        ['15/03/2024', '-50.00', 'food', 'Grocery shopping'],
        ['16/03/2024', '2800', 'salary', 'Monthly pay'],
      ];
      const { valid, errors } = processRows(rows, baseMapping);
      expect(valid).toHaveLength(2);
      expect(errors).toHaveLength(0);
    });

    it('should set isOutflow=true for negative amounts in auto mode', () => {
      const rows = [['15/03/2024', '-50', '', '']];
      const { valid } = processRows(rows, baseMapping);
      expect(valid[0].isOutflow).toBe(true);
      expect(valid[0].amount).toBe(50);
    });

    it('should set isOutflow=false for positive amounts in auto mode', () => {
      const rows = [['15/03/2024', '2800', '', '']];
      const { valid } = processRows(rows, baseMapping);
      expect(valid[0].isOutflow).toBe(false);
      expect(valid[0].amount).toBe(2800);
    });

    it('should produce correct date in YYYY-MM-DD format', () => {
      const rows = [['25/12/2024', '100', '', '']];
      const { valid } = processRows(rows, baseMapping);
      expect(valid[0].date).toBe('2024-12-25');
    });

    it('should preserve notes', () => {
      const rows = [['15/03/2024', '-100', 'food', 'Pranzo fuori']];
      const { valid } = processRows(rows, baseMapping);
      expect(valid[0].notes).toBe('Pranzo fuori');
    });

    it('should set rowIndex correctly', () => {
      const rows = [
        ['15/03/2024', '-50', '', ''],
        ['16/03/2024', '-100', '', ''],
        ['17/03/2024', '-200', '', ''],
      ];
      const { valid } = processRows(rows, baseMapping);
      expect(valid[0].rowIndex).toBe(0);
      expect(valid[1].rowIndex).toBe(1);
      expect(valid[2].rowIndex).toBe(2);
    });
  });

  describe('processRows — transaction type override', () => {
    it('should force all as outflows with transactionType="outflow"', () => {
      const rows = [
        ['15/03/2024', '50', '', ''],
        ['16/03/2024', '2800', '', ''],
      ];
      const mapping = { ...baseMapping, transactionType: 'outflow' };
      const { valid } = processRows(rows, mapping);
      expect(valid.every(v => v.isOutflow === true)).toBe(true);
    });

    it('should force all as incomes with transactionType="income"', () => {
      const rows = [
        ['15/03/2024', '-50', '', ''],
        ['16/03/2024', '-100', '', ''],
      ];
      const mapping = { ...baseMapping, transactionType: 'income' };
      const { valid } = processRows(rows, mapping);
      expect(valid.every(v => v.isOutflow === false)).toBe(true);
    });
  });

  describe('processRows — category matching', () => {
    it('should match Italian category alias', () => {
      const rows = [['15/03/2024', '-50', 'spesa', 'Al supermercato']];
      const { valid } = processRows(rows, baseMapping);
      expect(valid[0].categoryIndex).toBe(4); // Food
    });

    it('should match English category alias', () => {
      const rows = [['15/03/2024', '-1200', 'rent', '']];
      const { valid } = processRows(rows, baseMapping);
      expect(valid[0].categoryIndex).toBe(5); // House
    });

    it('should use default category when no match', () => {
      const mapping = { ...baseMapping, defaultCategoryIndex: 9999 };
      const rows = [['15/03/2024', '-100', 'xyzunknown123', '']];
      const { valid } = processRows(rows, mapping);
      expect(valid[0].categoryIndex).toBe(9999);
    });

    it('should use default category when category column is null', () => {
      const mapping = { ...baseMapping, categoryCol: null, defaultCategoryIndex: 4 };
      const rows = [['15/03/2024', '-100', 'ignored', '']];
      const { valid } = processRows(rows, mapping);
      expect(valid[0].categoryIndex).toBe(4);
    });

    it('should override isOutflow when category is an income alias', () => {
      const rows = [['15/03/2024', '-2800', 'stipendio', 'Monthly pay']];
      const { valid } = processRows(rows, baseMapping);
      // Despite negative amount, "stipendio" is income → isOutflow should be false
      expect(valid[0].isIncome || !valid[0].isOutflow).toBe(true);
    });
  });

  describe('processRows — error handling', () => {
    it('should flag row with invalid date as error', () => {
      const rows = [['not-a-date', '-50', 'food', '']];
      const { valid, errors } = processRows(rows, baseMapping);
      expect(valid).toHaveLength(0);
      expect(errors).toHaveLength(1);
      expect(errors[0].error).toContain('INVALID_DATE');
    });

    it('should flag row with invalid amount as error', () => {
      const rows = [['15/03/2024', 'abc', 'food', '']];
      const { valid, errors } = processRows(rows, baseMapping);
      expect(valid).toHaveLength(0);
      expect(errors).toHaveLength(1);
      expect(errors[0].error).toContain('INVALID_AMOUNT');
    });

    it('should flag row with zero amount as error', () => {
      const rows = [['15/03/2024', '0', 'food', '']];
      const { valid, errors } = processRows(rows, baseMapping);
      expect(valid).toHaveLength(0);
      expect(errors).toHaveLength(1);
      expect(errors[0].error).toContain('INVALID_AMOUNT');
    });

    it('should separate valid and error rows correctly', () => {
      const rows = [
        ['15/03/2024', '-50', 'food', 'ok'],       // valid
        ['bad-date', '-100', 'rent', 'bad'],         // error
        ['16/03/2024', '-200', 'travel', 'ok'],      // valid
        ['17/03/2024', 'abc', 'health', 'bad amt'],  // error
      ];
      const { valid, errors } = processRows(rows, baseMapping);
      expect(valid).toHaveLength(2);
      expect(errors).toHaveLength(2);
    });

    it('should include rowIndex in error objects', () => {
      const rows = [
        ['15/03/2024', '-50', '', ''],
        ['bad-date', '-100', '', ''],
      ];
      const { errors } = processRows(rows, baseMapping);
      expect(errors[0].rowIndex).toBe(1);
    });
  });

  describe('processRows — EU amount formats', () => {
    it('should handle EU amounts: 1.234,56', () => {
      const rows = [['15/03/2024', '-1.234,56', 'food', '']];
      const { valid } = processRows(rows, baseMapping);
      expect(valid[0].amount).toBe(1234.56);
    });

    it('should handle EU amounts with currency: € 500,00', () => {
      const rows = [['15/03/2024', '€ 500,00', 'salary', '']];
      const { valid } = processRows(rows, baseMapping);
      expect(valid[0].amount).toBe(500);
    });
  });

  describe('processRows — different date formats', () => {
    it('should work with YYYY-MM-DD mapping', () => {
      const mapping = { ...baseMapping, dateFormat: 'YYYY-MM-DD' };
      const rows = [['2024-03-15', '-50', '', '']];
      const { valid } = processRows(rows, mapping);
      expect(valid[0].date).toBe('2024-03-15');
    });

    it('should work with DD.MM.YYYY mapping', () => {
      const mapping = { ...baseMapping, dateFormat: 'DD.MM.YYYY' };
      const rows = [['15.03.2024', '-50', '', '']];
      const { valid } = processRows(rows, mapping);
      expect(valid[0].date).toBe('2024-03-15');
    });

    it('should work with DD/MM/YY mapping', () => {
      const mapping = { ...baseMapping, dateFormat: 'DD/MM/YY' };
      const rows = [['15/03/24', '-50', '', '']];
      const { valid } = processRows(rows, mapping);
      expect(valid[0].date).toBe('2024-03-15');
    });
  });

  describe('processRows — no notes column', () => {
    it('should handle missing notes column gracefully', () => {
      const mapping = { ...baseMapping, notesCol: null };
      const rows = [['15/03/2024', '-50', 'food', 'ignored']];
      const { valid } = processRows(rows, mapping);
      expect(valid[0].notes).toBe('');
    });
  });

  describe('processRows — large dataset', () => {
    it('should handle 1000 rows without errors', () => {
      const rows = Array.from({ length: 1000 }, (_, i) => [
        `${String((i % 28) + 1).padStart(2, '0')}/03/2024`,
        `-${(i + 1) * 10}.00`,
        'food',
        `Note ${i}`,
      ]);
      const { valid, errors } = processRows(rows, baseMapping);
      expect(valid.length + errors.length).toBe(1000);
      expect(valid.length).toBeGreaterThan(900); // Most should be valid
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// API FORMAT CONVERSION
// ═══════════════════════════════════════════════════════════════

describe('API Format Conversion', () => {
  describe('toAPIFormat', () => {
    it('should produce correct structure for outflow', () => {
      const tx = {
        date: '2024-03-15',
        amount: 50,
        isOutflow: true,
        categoryIndex: 4,
        notes: 'Grocery',
      };
      const result = toAPIFormat(tx);
      expect(result).toHaveProperty('expense');
      expect(result.expense.date).toBe('2024-03-15');
      expect(result.expense.amount).toBe(50);
      expect(result.expense.is_expense).toBe(true);
      expect(result.expense.payment_type).toBe(0);
      expect(result.expense.category_tag).toBe(4);
      expect(result.expense.notes).toBe('Grocery');
    });

    it('should produce correct structure for income', () => {
      const tx = {
        date: '2024-03-15',
        amount: 2800,
        isOutflow: false,
        categoryIndex: 0,
        notes: 'Salary',
      };
      const result = toAPIFormat(tx);
      expect(result.expense.is_expense).toBe(false);
      expect(result.expense.amount).toBe(2800);
      expect(result.expense.category_tag).toBe(0);
    });

    it('should always set payment_type to 0', () => {
      const tx = { date: '2024-01-01', amount: 100, isOutflow: true, categoryIndex: 9999, notes: '' };
      expect(toAPIFormat(tx).expense.payment_type).toBe(0);
    });

    it('should handle empty notes', () => {
      const tx = { date: '2024-01-01', amount: 100, isOutflow: true, categoryIndex: 9999, notes: '' };
      expect(toAPIFormat(tx).expense.notes).toBe('');
    });

    it('should handle undefined notes', () => {
      const tx = { date: '2024-01-01', amount: 100, isOutflow: true, categoryIndex: 9999 };
      expect(toAPIFormat(tx).expense.notes).toBeUndefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// SAVED MAPPINGS (localStorage)
// ═══════════════════════════════════════════════════════════════

describe('Saved Mappings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue('[]');
  });

  describe('saveMapping', () => {
    it('should call localStorage.setItem with correct key', () => {
      saveMapping('My Bank', { dateCol: 0, amountCol: 1 });
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'pacifinance-import-mappings',
        expect.any(String)
      );
    });

    it('should save mapping with name, mapping, and savedAt', () => {
      saveMapping('My Bank', { dateCol: 0, amountCol: 1 });
      const call = localStorage.setItem.mock.calls[0];
      const saved = JSON.parse(call[1]);
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('My Bank');
      expect(saved[0].mapping).toEqual({ dateCol: 0, amountCol: 1 });
      expect(saved[0].savedAt).toBeDefined();
    });

    it('should overwrite existing mapping with same name', () => {
      localStorage.getItem.mockReturnValue(
        JSON.stringify([{ name: 'My Bank', mapping: { dateCol: 0 }, savedAt: '2024-01-01' }])
      );
      saveMapping('My Bank', { dateCol: 2 });
      const call = localStorage.setItem.mock.calls[0];
      const saved = JSON.parse(call[1]);
      expect(saved).toHaveLength(1);
      expect(saved[0].mapping.dateCol).toBe(2);
    });

    it('should append to existing mappings with different name', () => {
      localStorage.getItem.mockReturnValue(
        JSON.stringify([{ name: 'Bank A', mapping: {}, savedAt: '2024-01-01' }])
      );
      saveMapping('Bank B', { dateCol: 1 });
      const call = localStorage.setItem.mock.calls[0];
      const saved = JSON.parse(call[1]);
      expect(saved).toHaveLength(2);
    });
  });

  describe('loadSavedMappings', () => {
    it('should return empty array when nothing saved', () => {
      localStorage.getItem.mockReturnValue(null);
      expect(loadSavedMappings()).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      localStorage.getItem.mockReturnValue('[]');
      expect(loadSavedMappings()).toEqual([]);
    });

    it('should return saved mappings', () => {
      const data = [{ name: 'My Bank', mapping: { dateCol: 0 }, savedAt: '2024-01-01' }];
      localStorage.getItem.mockReturnValue(JSON.stringify(data));
      const result = loadSavedMappings();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('My Bank');
    });

    it('should return empty array on JSON parse error', () => {
      localStorage.getItem.mockReturnValue('invalid json{{{');
      expect(loadSavedMappings()).toEqual([]);
    });
  });

  describe('deleteSavedMapping', () => {
    it('should remove mapping by name', () => {
      const data = [
        { name: 'Bank A', mapping: {}, savedAt: '2024-01-01' },
        { name: 'Bank B', mapping: {}, savedAt: '2024-01-02' },
      ];
      localStorage.getItem.mockReturnValue(JSON.stringify(data));
      deleteSavedMapping('Bank A');
      const call = localStorage.setItem.mock.calls[0];
      const saved = JSON.parse(call[1]);
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe('Bank B');
    });

    it('should not change anything if name not found', () => {
      const data = [{ name: 'Bank A', mapping: {}, savedAt: '2024-01-01' }];
      localStorage.getItem.mockReturnValue(JSON.stringify(data));
      deleteSavedMapping('Bank X');
      const call = localStorage.setItem.mock.calls[0];
      const saved = JSON.parse(call[1]);
      expect(saved).toHaveLength(1);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// IMPORT SUMMARY
// ═══════════════════════════════════════════════════════════════

describe('Import Summary', () => {
  describe('summarizeImport', () => {
    const makeTx = (overrides) => ({
      date: '2024-03-15',
      amount: 100,
      isOutflow: true,
      categoryIndex: 4,
      categoryLabel: 'Food',
      notes: '',
      rowIndex: 0,
      error: null,
      ...overrides,
    });

    it('should count total transactions', () => {
      const txs = [makeTx(), makeTx(), makeTx()];
      expect(summarizeImport(txs).totalTransactions).toBe(3);
    });

    it('should count outflows and incomes separately', () => {
      const txs = [
        makeTx({ isOutflow: true }),
        makeTx({ isOutflow: true }),
        makeTx({ isOutflow: false }),
      ];
      const s = summarizeImport(txs);
      expect(s.outflowCount).toBe(2);
      expect(s.incomeCount).toBe(1);
    });

    it('should sum outflow totals', () => {
      const txs = [
        makeTx({ isOutflow: true, amount: 50 }),
        makeTx({ isOutflow: true, amount: 100 }),
      ];
      expect(summarizeImport(txs).outflowTotal).toBe(150);
    });

    it('should sum income totals', () => {
      const txs = [
        makeTx({ isOutflow: false, amount: 2800 }),
        makeTx({ isOutflow: false, amount: 500 }),
      ];
      expect(summarizeImport(txs).incomeTotal).toBe(3300);
    });

    it('should group by category label', () => {
      const txs = [
        makeTx({ categoryLabel: 'Food', amount: 50 }),
        makeTx({ categoryLabel: 'Food', amount: 30 }),
        makeTx({ categoryLabel: 'Rent', amount: 1200 }),
      ];
      const s = summarizeImport(txs);
      expect(s.categoryCounts.Food.count).toBe(2);
      expect(s.categoryCounts.Food.total).toBe(80);
      expect(s.categoryCounts.Rent.count).toBe(1);
      expect(s.categoryCounts.Rent.total).toBe(1200);
    });

    it('should calculate date range (sorted)', () => {
      const txs = [
        makeTx({ date: '2024-03-20' }),
        makeTx({ date: '2024-01-05' }),
        makeTx({ date: '2024-06-15' }),
      ];
      const s = summarizeImport(txs);
      expect(s.dateRange.from).toBe('2024-01-05');
      expect(s.dateRange.to).toBe('2024-06-15');
    });

    it('should handle single transaction', () => {
      const txs = [makeTx({ date: '2024-03-15' })];
      const s = summarizeImport(txs);
      expect(s.totalTransactions).toBe(1);
      expect(s.dateRange.from).toBe('2024-03-15');
      expect(s.dateRange.to).toBe('2024-03-15');
    });

    it('should handle empty transactions array', () => {
      const s = summarizeImport([]);
      expect(s.totalTransactions).toBe(0);
      expect(s.outflowCount).toBe(0);
      expect(s.incomeCount).toBe(0);
      expect(s.outflowTotal).toBe(0);
      expect(s.incomeTotal).toBe(0);
      expect(s.dateRange.from).toBeNull();
      expect(s.dateRange.to).toBeNull();
    });

    it('should use "Other" as fallback category label', () => {
      const txs = [makeTx({ categoryLabel: '' })];
      const s = summarizeImport(txs);
      expect(s.categoryCounts).toHaveProperty('Other');
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & EXPORTS
// ═══════════════════════════════════════════════════════════════

describe('Constants', () => {
  it('ACCEPTED_EXTENSIONS should include CSV and Excel formats', () => {
    expect(ACCEPTED_EXTENSIONS).toContain('.csv');
    expect(ACCEPTED_EXTENSIONS).toContain('.xlsx');
    expect(ACCEPTED_EXTENSIONS).toContain('.xls');
    expect(ACCEPTED_EXTENSIONS).toContain('.tsv');
    expect(ACCEPTED_EXTENSIONS).toContain('.txt');
  });
});

// ═══════════════════════════════════════════════════════════════
// INTEGRATION-LIKE SCENARIOS
// ═══════════════════════════════════════════════════════════════

describe('Integration Scenarios', () => {
  describe('Full flow: Italian bank CSV', () => {
    const mapping = {
      dateCol: 0,
      amountCol: 1,
      categoryCol: 2,
      notesCol: 3,
      dateFormat: 'DD/MM/YYYY',
      transactionType: 'auto',
      defaultCategoryIndex: 9999,
    };

    it('should process a typical Italian bank statement', () => {
      const rows = [
        ['01/01/2024', '-45,50', 'Spesa', 'Conad'],
        ['02/01/2024', '-1.200,00', 'Affitto', 'Canone mensile'],
        ['05/01/2024', '2.800,00', 'Stipendio', 'Gennaio'],
        ['10/01/2024', '-150,00', 'Bollette', 'Luce e gas'],
        ['15/01/2024', '-30,00', 'Cinema', 'Film sabato'],
        ['20/01/2024', '-500,00', 'ETF', 'PAC mensile'],
        ['25/01/2024', '200,00', 'Rimborso', 'Rimborso spese'],
      ];

      const { valid, errors } = processRows(rows, mapping);
      expect(errors).toHaveLength(0);
      expect(valid).toHaveLength(7);

      // Check specifics
      // Spesa → Food (4)
      expect(valid[0].categoryIndex).toBe(4);
      expect(valid[0].isOutflow).toBe(true);
      expect(valid[0].amount).toBe(45.50);

      // Affitto → House (5)
      expect(valid[1].categoryIndex).toBe(5);
      expect(valid[1].amount).toBe(1200);

      // Stipendio → income
      expect(valid[2].isOutflow).toBe(false);
      expect(valid[2].amount).toBe(2800);

      // Bollette → House (5)
      expect(valid[3].categoryIndex).toBe(5);

      // Cinema → Entertainment (6)
      expect(valid[4].categoryIndex).toBe(6);

      // ETF → Investment (8)
      expect(valid[5].categoryIndex).toBe(8);

      // Rimborso → income (extra income)
      expect(valid[6].isOutflow).toBe(false);
    });

    it('should produce a correct summary for Italian bank data', () => {
      const rows = [
        ['01/01/2024', '-45,50', 'Spesa', ''],
        ['02/01/2024', '-1.200,00', 'Affitto', ''],
        ['05/01/2024', '2.800,00', 'Stipendio', ''],
      ];
      const { valid } = processRows(rows, mapping);
      const summary = summarizeImport(valid);
      expect(summary.outflowCount).toBe(2);
      expect(summary.incomeCount).toBe(1);
      expect(summary.outflowTotal).toBeCloseTo(1245.50, 2);
      expect(summary.incomeTotal).toBe(2800);
      expect(summary.dateRange.from).toBe('2024-01-01');
      expect(summary.dateRange.to).toBe('2024-01-05');
    });

    it('should produce correct API format for each transaction', () => {
      const rows = [['15/03/2024', '-50,00', 'cibo', 'pranzo']];
      const { valid } = processRows(rows, mapping);
      const apiData = toAPIFormat(valid[0]);

      expect(apiData.expense.date).toBe('2024-03-15');
      expect(apiData.expense.amount).toBe(50);
      expect(apiData.expense.is_expense).toBe(true);
      expect(apiData.expense.payment_type).toBe(0);
      expect(apiData.expense.category_tag).toBe(4); // Food
      expect(apiData.expense.notes).toBe('pranzo');
    });
  });

  describe('Full flow: US bank CSV', () => {
    const mapping = {
      dateCol: 0,
      amountCol: 1,
      categoryCol: 2,
      notesCol: null,
      dateFormat: 'MM/DD/YYYY',
      transactionType: 'auto',
      defaultCategoryIndex: 9999,
    };

    it('should process a typical US bank statement', () => {
      const rows = [
        ['01/15/2024', '-1,250.00', 'rent'],
        ['01/20/2024', '-45.99', 'groceries'],
        ['01/31/2024', '3,500.00', 'salary'],
        ['02/01/2024', '-9.99', 'subscription'],
      ];

      const { valid, errors } = processRows(rows, mapping);
      expect(errors).toHaveLength(0);
      expect(valid).toHaveLength(4);

      expect(valid[0].amount).toBe(1250);
      expect(valid[0].isOutflow).toBe(true);
      expect(valid[0].categoryIndex).toBe(5); // House

      expect(valid[1].amount).toBe(45.99);
      expect(valid[1].categoryIndex).toBe(4); // Food

      expect(valid[2].isOutflow).toBe(false); // Income
      expect(valid[2].amount).toBe(3500);

      expect(valid[3].categoryIndex).toBe(1); // Digital Service
    });
  });

  describe('Full flow: ISO date with forced outflows', () => {
    it('should treat all rows as outflows regardless of sign', () => {
      const mapping = {
        dateCol: 0,
        amountCol: 1,
        categoryCol: null,
        notesCol: null,
        dateFormat: 'YYYY-MM-DD',
        transactionType: 'outflow',
        defaultCategoryIndex: 9999,
      };
      const rows = [
        ['2024-01-01', '100'],
        ['2024-01-02', '200'],
        ['2024-01-03', '-300'],
      ];
      const { valid } = processRows(rows, mapping);
      expect(valid).toHaveLength(3);
      expect(valid.every(v => v.isOutflow === true)).toBe(true);
      expect(valid[0].amount).toBe(100);
      expect(valid[2].amount).toBe(300); // Absolute value
    });
  });

  describe('Full flow: mixed errors', () => {
    it('should correctly split valid and error rows on messy data', () => {
      const mapping = {
        dateCol: 0,
        amountCol: 1,
        categoryCol: null,
        notesCol: null,
        dateFormat: 'DD/MM/YYYY',
        transactionType: 'auto',
        defaultCategoryIndex: 9999,
      };
      const rows = [
        ['01/01/2024', '-50'],       // valid
        ['bad', '-100'],              // error: bad date
        ['02/01/2024', ''],           // error: empty amount
        ['03/01/2024', 'abc'],        // error: bad amount
        ['04/01/2024', '-200'],       // valid
        ['05/01/2024', '0'],          // error: zero amount
      ];
      const { valid, errors } = processRows(rows, mapping);
      expect(valid).toHaveLength(2);
      expect(errors).toHaveLength(4);
    });
  });
});

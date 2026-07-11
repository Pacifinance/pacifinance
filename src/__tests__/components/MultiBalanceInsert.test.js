/**
 * Tests for MultiBalanceInsert helper functions
 * Tests createEmptyBalanceRow, handleAssetInput, formatAssetBlur, findDuplicateMonthRows
 */

import { describe, it, expect } from 'vitest';
import {
  createEmptyBalanceRow,
  handleAssetInput,
  formatAssetBlur,
  findDuplicateMonthRows,
  ASSET_KEYS,
  LIQUIDITY_KEYS,
  INVESTMENT_KEYS,
} from '../../components/MultiBalanceInsert';

describe('MultiBalanceInsert helpers', () => {

  describe('ASSET_KEYS constants', () => {
    it('should have 11 asset keys total', () => {
      expect(ASSET_KEYS).toHaveLength(11);
    });

    it('should have 4 liquidity keys', () => {
      expect(LIQUIDITY_KEYS).toHaveLength(4);
      expect(LIQUIDITY_KEYS).toEqual(['bank', 'cash', 'digitalServices', 'emergencyFund']);
    });

    it('should have 7 investment keys', () => {
      expect(INVESTMENT_KEYS).toHaveLength(7);
      expect(INVESTMENT_KEYS).toEqual(['stocks', 'etf', 'bitcoin', 'crypto', 'bonds', 'funds', 'commodities']);
    });

    it('should combine liquidity + investment = all keys', () => {
      expect([...LIQUIDITY_KEYS, ...INVESTMENT_KEYS]).toEqual(ASSET_KEYS);
    });
  });

  describe('createEmptyBalanceRow', () => {
    it('should create a row with default empty asset values', () => {
      const row = createEmptyBalanceRow();
      expect(row.id).toBeDefined();
      expect(row.month).toBe(new Date().getMonth() + 1);
      expect(row.year).toBe(new Date().getFullYear());
      for (const key of ASSET_KEYS) {
        expect(row[key]).toBe('');
      }
    });

    it('should apply month/year defaults', () => {
      const row = createEmptyBalanceRow({ month: 3, year: 2024 });
      expect(row.month).toBe(3);
      expect(row.year).toBe(2024);
    });

    it('should apply asset defaults', () => {
      const row = createEmptyBalanceRow({ bank: '1000', stocks: '5000' });
      expect(row.bank).toBe('1000');
      expect(row.stocks).toBe('5000');
      expect(row.cash).toBe('');
    });

    it('should generate unique ids', () => {
      const row1 = createEmptyBalanceRow();
      const row2 = createEmptyBalanceRow();
      expect(row1.id).not.toBe(row2.id);
    });

    it('should NOT have categoryKey/typoKey fields', () => {
      const row = createEmptyBalanceRow();
      expect(row.categoryKey).toBeUndefined();
      expect(row.typoKey).toBeUndefined();
    });
  });

  describe('handleAssetInput', () => {
    it('should pass through normal numbers', () => {
      expect(handleAssetInput('1000')).toBe('1000');
    });

    it('should replace comma with dot', () => {
      expect(handleAssetInput('50,25')).toBe('50.25');
    });

    it('should strip non-numeric characters', () => {
      expect(handleAssetInput('abc1000xyz')).toBe('1000');
    });

    it('should keep only the first dot', () => {
      expect(handleAssetInput('10.5.3')).toBe('10.53');
    });

    it('should prepend 0 when starting with dot', () => {
      expect(handleAssetInput('.5')).toBe('0.5');
    });

    it('should handle empty string', () => {
      expect(handleAssetInput('')).toBe('');
    });
  });

  describe('formatAssetBlur', () => {
    it('should format a simple number with 2 decimals', () => {
      expect(formatAssetBlur('100')).toBe('100,00');
    });

    it('should format a decimal number', () => {
      expect(formatAssetBlur('50.5')).toBe('50,50');
    });

    it('should strip leading zeros', () => {
      expect(formatAssetBlur('007')).toBe('7,00');
    });

    it('should return empty string as-is', () => {
      expect(formatAssetBlur('')).toBe('');
    });

    it('should return non-numeric string as-is', () => {
      expect(formatAssetBlur('abc')).toBe('abc');
    });
  });

  describe('findDuplicateMonthRows', () => {
    it('should return empty set for empty rows', () => {
      const result = findDuplicateMonthRows([]);
      expect(result.size).toBe(0);
    });

    it('should return empty set for single row', () => {
      const result = findDuplicateMonthRows([
        { id: 1, month: 6, year: 2025 },
      ]);
      expect(result.size).toBe(0);
    });

    it('should return empty set for rows with different months', () => {
      const result = findDuplicateMonthRows([
        { id: 1, month: 6, year: 2025 },
        { id: 2, month: 7, year: 2025 },
        { id: 3, month: 5, year: 2025 },
      ]);
      expect(result.size).toBe(0);
    });

    it('should detect two rows with same month/year', () => {
      const result = findDuplicateMonthRows([
        { id: 1, month: 6, year: 2025 },
        { id: 2, month: 6, year: 2025 },
      ]);
      expect(result.size).toBe(2);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
    });

    it('should detect three rows with same month/year', () => {
      const result = findDuplicateMonthRows([
        { id: 1, month: 6, year: 2025 },
        { id: 2, month: 6, year: 2025 },
        { id: 3, month: 6, year: 2025 },
      ]);
      expect(result.size).toBe(3);
    });

    it('should only flag duplicates, not unique rows', () => {
      const result = findDuplicateMonthRows([
        { id: 1, month: 6, year: 2025 },
        { id: 2, month: 7, year: 2025 },
        { id: 3, month: 6, year: 2025 },
      ]);
      expect(result.size).toBe(2);
      expect(result.has(1)).toBe(true);
      expect(result.has(3)).toBe(true);
      expect(result.has(2)).toBe(false);
    });

    it('should distinguish same month in different years', () => {
      const result = findDuplicateMonthRows([
        { id: 1, month: 6, year: 2025 },
        { id: 2, month: 6, year: 2024 },
      ]);
      expect(result.size).toBe(0);
    });

    it('should detect multiple duplicate groups', () => {
      const result = findDuplicateMonthRows([
        { id: 1, month: 6, year: 2025 },
        { id: 2, month: 7, year: 2025 },
        { id: 3, month: 6, year: 2025 },
        { id: 4, month: 7, year: 2025 },
        { id: 5, month: 8, year: 2025 },
      ]);
      expect(result.size).toBe(4);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
      expect(result.has(4)).toBe(true);
      expect(result.has(5)).toBe(false);
    });
  });
});

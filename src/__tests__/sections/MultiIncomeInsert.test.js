/**
 * Tests for MultiIncomeInsert helper functions
 * Tests createEmptyIncomeRow, handleAmountInput, formatAmountBlur, groupAmountsByBalanceSource
 */

import { describe, it, expect } from 'vitest';
import {
  createEmptyIncomeRow,
  handleAmountInput,
  formatAmountBlur,
  groupAmountsByBalanceSource,
} from '../../sections/MultiIncomeInsert';

describe('MultiIncomeInsert helpers', () => {

  describe('createEmptyIncomeRow', () => {
    it('should create a row with default empty values', () => {
      const row = createEmptyIncomeRow();
      expect(row.categoryKey).toBe('');
      expect(row.categoryValue).toBe('');
      expect(row.amount).toBe('');
      expect(row.note).toBe('');
      expect(row.balanceSource).toBe('');
      expect(row.id).toBeDefined();
      expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should NOT have typoKey or typoValue (incomes have no payment type)', () => {
      const row = createEmptyIncomeRow();
      expect(row.typoKey).toBeUndefined();
      expect(row.typoValue).toBeUndefined();
    });

    it('should apply provided defaults', () => {
      const row = createEmptyIncomeRow({
        categoryKey: '3',
        categoryValue: 'Salary',
        amount: '1500,00',
        date: '2025-06-15',
        note: 'monthly',
        balanceSource: 'Banca',
      });
      expect(row.categoryKey).toBe('3');
      expect(row.categoryValue).toBe('Salary');
      expect(row.amount).toBe('1500,00');
      expect(row.date).toBe('2025-06-15');
      expect(row.note).toBe('monthly');
      expect(row.balanceSource).toBe('Banca');
    });

    it('should generate unique ids', () => {
      const row1 = createEmptyIncomeRow();
      const row2 = createEmptyIncomeRow();
      expect(row1.id).not.toBe(row2.id);
    });

    it('should allow partial defaults', () => {
      const row = createEmptyIncomeRow({ balanceSource: 'Cash' });
      expect(row.balanceSource).toBe('Cash');
      expect(row.categoryKey).toBe('');
      expect(row.amount).toBe('');
    });
  });

  describe('handleAmountInput', () => {
    it('should pass through normal numbers', () => {
      expect(handleAmountInput('100')).toBe('100');
    });

    it('should replace comma with dot', () => {
      expect(handleAmountInput('50,25')).toBe('50.25');
    });

    it('should strip non-numeric characters', () => {
      expect(handleAmountInput('abc50.25xyz')).toBe('50.25');
    });

    it('should keep only the first dot', () => {
      expect(handleAmountInput('10.5.3')).toBe('10.53');
    });

    it('should prepend 0 when starting with dot', () => {
      expect(handleAmountInput('.5')).toBe('0.5');
    });

    it('should handle empty string', () => {
      expect(handleAmountInput('')).toBe('');
    });
  });

  describe('formatAmountBlur', () => {
    it('should format a simple number with 2 decimals', () => {
      expect(formatAmountBlur('100')).toBe('100,00');
    });

    it('should format a decimal number', () => {
      expect(formatAmountBlur('50.5')).toBe('50,50');
    });

    it('should strip leading zeros', () => {
      expect(formatAmountBlur('007')).toBe('7,00');
    });

    it('should return empty string as-is', () => {
      expect(formatAmountBlur('')).toBe('');
    });

    it('should return non-numeric string as-is', () => {
      expect(formatAmountBlur('abc')).toBe('abc');
    });
  });

  describe('groupAmountsByBalanceSource', () => {
    it('should return empty object for empty rows', () => {
      expect(groupAmountsByBalanceSource([])).toEqual({});
    });

    it('should return empty object when no rows have balance source', () => {
      const rows = [
        { amount: '1000', balanceSource: '' },
        { amount: '500', balanceSource: '' },
      ];
      expect(groupAmountsByBalanceSource(rows)).toEqual({});
    });

    it('should group income amounts by single source', () => {
      const rows = [
        { amount: '1000', balanceSource: 'Banca' },
        { amount: '500', balanceSource: 'Banca' },
      ];
      const result = groupAmountsByBalanceSource(rows);
      expect(result).toEqual({ 'Banca': 1500 });
    });

    it('should group income amounts by multiple sources', () => {
      const rows = [
        { amount: '1000', balanceSource: 'Banca' },
        { amount: '500', balanceSource: 'Contanti' },
        { amount: '2000', balanceSource: 'Banca' },
      ];
      const result = groupAmountsByBalanceSource(rows);
      expect(result).toEqual({ 'Banca': 3000, 'Contanti': 500 });
    });

    it('should skip rows with no balance source', () => {
      const rows = [
        { amount: '1000', balanceSource: 'Banca' },
        { amount: '500', balanceSource: '' },
      ];
      const result = groupAmountsByBalanceSource(rows);
      expect(result).toEqual({ 'Banca': 1000 });
    });

    it('should skip rows with invalid amounts', () => {
      const rows = [
        { amount: '1000', balanceSource: 'Banca' },
        { amount: 'abc', balanceSource: 'Banca' },
        { amount: '0', balanceSource: 'Banca' },
      ];
      const result = groupAmountsByBalanceSource(rows);
      expect(result).toEqual({ 'Banca': 1000 });
    });
  });
});

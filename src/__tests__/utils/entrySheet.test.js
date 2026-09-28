import { describe, it, expect } from 'vitest';
import {
  isEntryType, isSheetEntryType, legacySectionToEntryType, parseEntryMonth,
} from '../../utils/entrySheet';

describe('entrySheet utils', () => {
  it('recognizes sheet forms and panel entries', () => {
    expect(isSheetEntryType('outflow')).toBe(true);
    expect(isSheetEntryType('balance')).toBe(true);
    expect(isSheetEntryType('recurring')).toBe(false);
    expect(isEntryType('recurring')).toBe(true);
    expect(isEntryType('investmentImport')).toBe(true);
    expect(isEntryType('nope')).toBe(false);
    expect(isEntryType(null)).toBe(false);
  });

  it('maps legacy /insert-values?section= values onto entry types', () => {
    expect(legacySectionToEntryType('balance')).toBe('balance');
    expect(legacySectionToEntryType('income')).toBe('income');
    expect(legacySectionToEntryType('outflow')).toBe('outflow');
    expect(legacySectionToEntryType('import')).toBe('import');
    expect(legacySectionToEntryType('other')).toBeNull();
    expect(legacySectionToEntryType(null)).toBeNull();
  });

  it('parses the M-YYYY month param, rejecting invalid values', () => {
    expect(parseEntryMonth('8-2026')).toEqual({ month: 8, year: 2026 });
    expect(parseEntryMonth('12-2025')).toEqual({ month: 12, year: 2025 });
    expect(parseEntryMonth('13-2025')).toBeNull();
    expect(parseEntryMonth('2025-08')).toBeNull();
    expect(parseEntryMonth(null)).toBeNull();
  });
});

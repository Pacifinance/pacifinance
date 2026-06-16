/**
 * Unit tests for pure balance-delta helpers (no React, no network).
 */
import { describe, it, expect } from 'vitest';
import {
  isPastMonthDate,
  isSameMonth,
  computeEditDeltas,
  editNeedsBalanceUpdate,
  AMOUNT_EPSILON,
  getBalanceUserDateForMonth,
} from '../../utils/balanceDeltaLogic';

/* ────────────────────────────────────────────────────────────────── */
/* isPastMonthDate                                                    */
/* ────────────────────────────────────────────────────────────────── */
describe('isPastMonthDate', () => {
  const now = new Date('2026-04-24T12:00:00Z');

  it('returns false for empty / null / undefined input', () => {
    expect(isPastMonthDate('', now)).toBe(false);
    expect(isPastMonthDate(null, now)).toBe(false);
    expect(isPastMonthDate(undefined, now)).toBe(false);
  });

  it('returns false for an invalid date string', () => {
    expect(isPastMonthDate('not-a-date', now)).toBe(false);
  });

  it('returns false for a date in the current month', () => {
    expect(isPastMonthDate('2026-04-01', now)).toBe(false);
    expect(isPastMonthDate('2026-04-30', now)).toBe(false);
  });

  it('returns true for any earlier month in the same year', () => {
    expect(isPastMonthDate('2026-03-31', now)).toBe(true);
    expect(isPastMonthDate('2026-01-15', now)).toBe(true);
  });

  it('returns true for any date in a previous year', () => {
    expect(isPastMonthDate('2025-12-31', now)).toBe(true);
    expect(isPastMonthDate('2020-06-15', now)).toBe(true);
  });

  it('returns false for future months / years', () => {
    expect(isPastMonthDate('2026-05-01', now)).toBe(false);
    expect(isPastMonthDate('2027-01-01', now)).toBe(false);
  });
});

/* ────────────────────────────────────────────────────────────────── */
/* isSameMonth                                                        */
/* ────────────────────────────────────────────────────────────────── */
describe('isSameMonth', () => {
  it('is true for two dates in the same month and year', () => {
    expect(isSameMonth('2026-03-01', '2026-03-31')).toBe(true);
  });

  it('is false when only the year differs', () => {
    expect(isSameMonth('2025-03-15', '2026-03-15')).toBe(false);
  });

  it('is false when only the month differs', () => {
    expect(isSameMonth('2026-03-31', '2026-04-01')).toBe(false);
  });

  it('is false for missing or invalid inputs', () => {
    expect(isSameMonth('', '2026-03-15')).toBe(false);
    expect(isSameMonth('2026-03-15', null)).toBe(false);
    expect(isSameMonth('garbage', '2026-03-15')).toBe(false);
  });
});

/* ────────────────────────────────────────────────────────────────── */
/* getBalanceUserDateForMonth                                         */
/* ────────────────────────────────────────────────────────────────── */
describe('getBalanceUserDateForMonth', () => {
  it('past month → UTC 23:59:59.998 of last day', () => {
    const fakeNow = new Date('2026-04-25T11:30:00Z');
    const iso = getBalanceUserDateForMonth({ month: 3, year: 2026 }, fakeNow);
    expect(iso).toBe('2026-03-31T23:59:59.998Z');
  });

  it('past month with 30 days → last day is 30', () => {
    const fakeNow = new Date('2026-12-15T08:00:00Z');
    const iso = getBalanceUserDateForMonth({ month: 11, year: 2026 }, fakeNow);
    expect(iso).toBe('2026-11-30T23:59:59.998Z');
  });

  it('past month February non-leap → 28th', () => {
    const fakeNow = new Date('2026-04-25T11:30:00Z');
    const iso = getBalanceUserDateForMonth({ month: 2, year: 2026 }, fakeNow);
    expect(iso).toBe('2026-02-28T23:59:59.998Z');
  });

  it('past month February leap → 29th', () => {
    const fakeNow = new Date('2024-04-25T11:30:00Z');
    const iso = getBalanceUserDateForMonth({ month: 2, year: 2024 }, fakeNow);
    expect(iso).toBe('2024-02-29T23:59:59.998Z');
  });

  it('previous year December → correct year', () => {
    const fakeNow = new Date('2026-01-15T00:00:00Z');
    const iso = getBalanceUserDateForMonth({ month: 12, year: 2025 }, fakeNow);
    expect(iso).toBe('2025-12-31T23:59:59.998Z');
  });

  it('current month → live now timestamp', () => {
    const fakeNow = new Date('2026-04-25T11:30:00Z');
    const iso = getBalanceUserDateForMonth({ month: 4, year: 2026 }, fakeNow);
    expect(iso).toBe('2026-04-25T11:30:00.000Z');
  });
});

/* ────────────────────────────────────────────────────────────────── */
/* computeEditDeltas                                                  */
/* ────────────────────────────────────────────────────────────────── */
describe('computeEditDeltas', () => {
  describe('outflow — same month', () => {
    it('amount increased → net negative delta (wallet pays the extra)', () => {
      // was -10 (outflow), now -12 → net change = -2 on that month
      const d = computeEditDeltas({
        isOutflow: true,
        oldDate: '2026-03-10',
        oldAmount: 10,
        newDate: '2026-03-15',
        newAmount: 12,
      });
      expect(d).toEqual([{ month: '2026-03-15', value: -2 }]);
    });

    it('amount decreased → net positive delta (wallet gets refund)', () => {
      // was -20, now -5 → +15
      const d = computeEditDeltas({
        isOutflow: true,
        oldDate: '2026-03-10',
        oldAmount: 20,
        newDate: '2026-03-20',
        newAmount: 5,
      });
      expect(d).toEqual([{ month: '2026-03-20', value: 15 }]);
    });

    it('same amount → empty array (no balance work needed)', () => {
      const d = computeEditDeltas({
        isOutflow: true,
        oldDate: '2026-03-10',
        oldAmount: 10,
        newDate: '2026-03-15',
        newAmount: 10,
      });
      expect(d).toEqual([]);
    });
  });

  describe('outflow — different months', () => {
    it('splits into two deltas with correct signs', () => {
      // old March: refund +10. New April: charge -12.
      const d = computeEditDeltas({
        isOutflow: true,
        oldDate: '2026-03-10',
        oldAmount: 10,
        newDate: '2026-04-05',
        newAmount: 12,
      });
      expect(d).toEqual([
        { month: '2026-03-10', value: +10 },
        { month: '2026-04-05', value: -12 },
      ]);
    });

    it('same amount, month moved → still produces two opposing deltas', () => {
      const d = computeEditDeltas({
        isOutflow: true,
        oldDate: '2026-03-10',
        oldAmount: 15,
        newDate: '2026-04-10',
        newAmount: 15,
      });
      expect(d).toEqual([
        { month: '2026-03-10', value: +15 },
        { month: '2026-04-10', value: -15 },
      ]);
    });
  });

  describe('income — same month', () => {
    it('amount increased → net positive delta (wallet gains the extra)', () => {
      // was +100, now +120 → +20
      const d = computeEditDeltas({
        isOutflow: false,
        oldDate: '2026-03-01',
        oldAmount: 100,
        newDate: '2026-03-15',
        newAmount: 120,
      });
      expect(d).toEqual([{ month: '2026-03-15', value: 20 }]);
    });

    it('amount decreased → net negative delta', () => {
      const d = computeEditDeltas({
        isOutflow: false,
        oldDate: '2026-03-01',
        oldAmount: 100,
        newDate: '2026-03-15',
        newAmount: 60,
      });
      expect(d).toEqual([{ month: '2026-03-15', value: -40 }]);
    });
  });

  describe('income — different months', () => {
    it('splits into two deltas with correct signs', () => {
      // old March: remove -100. New April: add +120.
      const d = computeEditDeltas({
        isOutflow: false,
        oldDate: '2026-03-01',
        oldAmount: 100,
        newDate: '2026-04-01',
        newAmount: 120,
      });
      expect(d).toEqual([
        { month: '2026-03-01', value: -100 },
        { month: '2026-04-01', value: +120 },
      ]);
    });
  });

  describe('edge cases', () => {
    it('treats sub-epsilon net changes in same month as "no delta"', () => {
      const d = computeEditDeltas({
        isOutflow: true,
        oldDate: '2026-03-10',
        oldAmount: 10,
        newDate: '2026-03-15',
        newAmount: 10 + AMOUNT_EPSILON / 2,
      });
      expect(d).toEqual([]);
    });

    it('coerces non-numeric amounts to 0', () => {
      const d = computeEditDeltas({
        isOutflow: true,
        oldDate: '2026-03-10',
        oldAmount: 'foo',
        newDate: '2026-03-15',
        newAmount: 'bar',
      });
      expect(d).toEqual([]);
    });

    it('handles a zero-amount old transaction (insert-like)', () => {
      const d = computeEditDeltas({
        isOutflow: true,
        oldDate: '2026-03-10',
        oldAmount: 0,
        newDate: '2026-03-15',
        newAmount: 10,
      });
      expect(d).toEqual([{ month: '2026-03-15', value: -10 }]);
    });
  });
});

/* ────────────────────────────────────────────────────────────────── */
/* editNeedsBalanceUpdate                                             */
/* ────────────────────────────────────────────────────────────────── */
describe('editNeedsBalanceUpdate', () => {
  it('returns false when nothing financial changed (same date + amount)', () => {
    expect(
      editNeedsBalanceUpdate({
        oldDate: '2026-03-10',
        oldAmount: 10,
        newDate: '2026-03-10',
        newAmount: 10,
      }),
    ).toBe(false);
  });

  it('returns true when the amount changed', () => {
    expect(
      editNeedsBalanceUpdate({
        oldDate: '2026-03-10',
        oldAmount: 10,
        newDate: '2026-03-10',
        newAmount: 12,
      }),
    ).toBe(true);
  });

  it('returns true when the month changed', () => {
    expect(
      editNeedsBalanceUpdate({
        oldDate: '2026-03-10',
        oldAmount: 10,
        newDate: '2026-04-10',
        newAmount: 10,
      }),
    ).toBe(true);
  });

  it('returns false when the day changed within the same month', () => {
    expect(
      editNeedsBalanceUpdate({
        oldDate: '2026-03-01',
        oldAmount: 10,
        newDate: '2026-03-31',
        newAmount: 10,
      }),
    ).toBe(false);
  });

  it('returns false for sub-epsilon amount differences', () => {
    expect(
      editNeedsBalanceUpdate({
        oldDate: '2026-03-10',
        oldAmount: 10,
        newDate: '2026-03-10',
        newAmount: 10 + AMOUNT_EPSILON / 2,
      }),
    ).toBe(false);
  });
});

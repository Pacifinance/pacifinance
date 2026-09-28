import { describe, it, expect, beforeEach } from 'vitest';
import {
  shouldAlertSpendingLimit, isInCurrentMonth, isLimitAlertMuted, muteLimitAlertForMonth, monthKeyOf,
} from '../../utils/spendingLimitAlert';

describe('shouldAlertSpendingLimit', () => {
  const limit = 2000; // step = 5% = 100

  it('stays quiet while within the limit (including exactly at it)', () => {
    expect(shouldAlertSpendingLimit(1500, 1900, limit)).toBe(false);
    expect(shouldAlertSpendingLimit(1900, 2000, limit)).toBe(false);
  });

  it('fires when the total first goes over the limit', () => {
    expect(shouldAlertSpendingLimit(1990, 2010, limit)).toBe(true);
  });

  it('does not fire again for small expenses within the same step', () => {
    expect(shouldAlertSpendingLimit(2010, 2030, limit)).toBe(false);
    expect(shouldAlertSpendingLimit(2030, 2099, limit)).toBe(false);
  });

  it('fires again each time a new 5% step above the limit is crossed', () => {
    expect(shouldAlertSpendingLimit(2099, 2101, limit)).toBe(true);
    expect(shouldAlertSpendingLimit(2150, 2210, limit)).toBe(true);
    expect(shouldAlertSpendingLimit(2210, 2290, limit)).toBe(false);
  });

  it('ignores a missing or zero limit', () => {
    expect(shouldAlertSpendingLimit(0, 5000, 0)).toBe(false);
    expect(shouldAlertSpendingLimit(0, 5000, NaN)).toBe(false);
  });
});

describe('isInCurrentMonth', () => {
  const now = new Date(2026, 8, 28); // 28 Sep 2026, local
  it('only counts dates in the current local month', () => {
    expect(isInCurrentMonth('2026-09-01', now)).toBe(true);
    expect(isInCurrentMonth('2026-08-31', now)).toBe(false);
    expect(isInCurrentMonth(null, now)).toBe(false);
  });
});

describe('monthly mute', () => {
  // The global test setup mocks localStorage with no-op fns — give it a real store here.
  beforeEach(() => {
    const store = {};
    localStorage.getItem.mockImplementation((key) => (key in store ? store[key] : null));
    localStorage.setItem.mockImplementation((key, value) => { store[key] = String(value); });
  });

  it('mutes only the month it was set in', () => {
    const september = new Date(2026, 8, 10);
    const october = new Date(2026, 9, 1);
    expect(isLimitAlertMuted(september)).toBe(false);
    muteLimitAlertForMonth(september);
    expect(isLimitAlertMuted(september)).toBe(true);
    expect(isLimitAlertMuted(october)).toBe(false);
    expect(monthKeyOf(september)).toBe('2026-09');
  });
});

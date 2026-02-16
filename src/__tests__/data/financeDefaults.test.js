/**
 * Tests for financeDefaults — validates exported constants.
 *
 * Ensures that all constants are exported, have the expected types,
 * and maintain sensible values.
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MONTHLY_SPENDING_LIMIT,
  DEFAULT_SAVINGS_GOAL_PERCENTAGE,
  DEFAULT_EMERGENCY_FUND_TARGET,
  MESSAGE_AUTO_DISMISS_MS,
  SIGNUP_TIMEOUT_MS,
  SCROLL_COOLDOWN_MS,
  PRELOAD_DELAY_MS,
  PROFILE_SUCCESS_DISPLAY_MS,
} from '../../data/financeDefaults';

describe('financeDefaults', () => {
  it('exports all financial constants', () => {
    expect(DEFAULT_MONTHLY_SPENDING_LIMIT).toBeDefined();
    expect(DEFAULT_SAVINGS_GOAL_PERCENTAGE).toBeDefined();
    expect(DEFAULT_EMERGENCY_FUND_TARGET).toBeDefined();
  });

  it('exports all timing constants', () => {
    expect(MESSAGE_AUTO_DISMISS_MS).toBeDefined();
    expect(SIGNUP_TIMEOUT_MS).toBeDefined();
    expect(SCROLL_COOLDOWN_MS).toBeDefined();
    expect(PRELOAD_DELAY_MS).toBeDefined();
    expect(PROFILE_SUCCESS_DISPLAY_MS).toBeDefined();
  });

  it('all constants are positive numbers', () => {
    const all = [
      DEFAULT_MONTHLY_SPENDING_LIMIT,
      DEFAULT_SAVINGS_GOAL_PERCENTAGE,
      DEFAULT_EMERGENCY_FUND_TARGET,
      MESSAGE_AUTO_DISMISS_MS,
      SIGNUP_TIMEOUT_MS,
      SCROLL_COOLDOWN_MS,
      PRELOAD_DELAY_MS,
      PROFILE_SUCCESS_DISPLAY_MS,
    ];
    all.forEach(value => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
    });
  });

  it('savings goal percentage is between 1 and 100', () => {
    expect(DEFAULT_SAVINGS_GOAL_PERCENTAGE).toBeGreaterThanOrEqual(1);
    expect(DEFAULT_SAVINGS_GOAL_PERCENTAGE).toBeLessThanOrEqual(100);
  });

  it('timing constants are in milliseconds (>= 1000ms)', () => {
    expect(MESSAGE_AUTO_DISMISS_MS).toBeGreaterThanOrEqual(1000);
    expect(SIGNUP_TIMEOUT_MS).toBeGreaterThanOrEqual(1000);
    expect(SCROLL_COOLDOWN_MS).toBeGreaterThanOrEqual(1000);
    expect(PRELOAD_DELAY_MS).toBeGreaterThanOrEqual(1000);
    expect(PROFILE_SUCCESS_DISPLAY_MS).toBeGreaterThanOrEqual(1000);
  });
});

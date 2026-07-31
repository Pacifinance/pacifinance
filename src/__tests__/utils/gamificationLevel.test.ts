import { describe, expect, it } from 'vitest';
import { getLevelColor, getLevelProgress } from '../../utils/gamificationLevel';

describe('gamificationLevel', () => {
  it('uses the first color for invalid and boundary levels', () => {
    expect(getLevelColor(Number.NaN)).toBe('#10b981');
    expect(getLevelColor(0)).toBe('#10b981');
    expect(getLevelColor(1)).toBe('#10b981');
  });

  it('uses a stable final tier for high levels', () => {
    expect(getLevelColor(6)).toBe('#d97706');
    expect(getLevelColor(20)).toBe('#d97706');
  });

  it('calculates progress inside the current level', () => {
    expect(getLevelProgress(0, 1)).toBe(0);
    expect(getLevelProgress(15, 1)).toBe(50);
    expect(getLevelProgress(40, 2)).toBe(33);
  });

  it('clamps invalid and out-of-range progress', () => {
    expect(getLevelProgress(Number.NaN, 1)).toBe(0);
    expect(getLevelProgress(10, 2)).toBe(0);
    expect(getLevelProgress(999, 2)).toBe(100);
  });
});

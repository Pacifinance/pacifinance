import { describe, expect, it } from 'vitest';
import { compactNumber } from '../../utils/customGraphsInfo';

describe('compactNumber', () => {
  it('returns an empty label for missing or invalid values', () => {
    expect(compactNumber(null)).toBe('');
    expect(compactNumber(Number.NaN)).toBe('');
  });

  it('limits ordinary chart values to two decimal places', () => {
    expect(compactNumber(Number('821.9799999999982'))).toBe('821.98');
    expect(compactNumber(Number('-11.529999999999975'))).toBe('-11.53');
  });

  it('keeps the existing compact notation for thousands and millions', () => {
    expect(compactNumber(3_800)).toBe('3.8K');
    expect(compactNumber(2_000_000)).toBe('2M');
  });
});

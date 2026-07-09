import { describe, expect, it } from 'vitest';
import { roundCurrency, toCents, fromCents, addCurrency } from '../../utils/money';

describe('money utils', () => {
  it('rounds currency down to two decimals, never crediting an extra cent', () => {
    expect(roundCurrency(12.349)).toBe(12.34);
    expect(roundCurrency(12.341)).toBe(12.34);
    expect(roundCurrency(Number.NaN)).toBe(0);
  });

  it('converts to/from integer cents without float noise', () => {
    expect(toCents(12.34)).toBe(1234);
    expect(toCents(0.1)).toBe(10);
    expect(fromCents(1234)).toBe(12.34);
  });

  it('sums many decimal amounts without accumulating IEEE-754 drift', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(addCurrency(0.1, 0.2)).toBe(0.3);

    const amounts = Array(20).fill(0.05);
    expect(addCurrency(...amounts)).toBe(1);
  });

  it('matches a real balance sum (bank+cash+stocks+...) with no drift', () => {
    const values = [1234.56, 78.9, 0.03, 500, 12.01];
    expect(addCurrency(...values)).toBe(1825.5);
  });

  it('supports negative amounts', () => {
    expect(addCurrency(10.5, -3.2)).toBe(7.3);
  });
});

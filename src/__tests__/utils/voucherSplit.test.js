import { describe, it, expect } from 'vitest';
import { computeVoucherSplit } from '../../utils/voucherSplit';

describe('computeVoucherSplit', () => {
  it('splits a purchase that is not a multiple of the denomination', () => {
    expect(computeVoucherSplit(11.5, 8, 96)).toEqual({ voucherAmount: 8, remainderAmount: 3.5 });
  });

  it('needs no split when the amount is an exact multiple', () => {
    expect(computeVoucherSplit(16, 8, 96)).toEqual({ voucherAmount: 16, remainderAmount: 0 });
  });

  it('caps the voucher portion at the available balance', () => {
    // Only 1 voucher (8) available, purchase needs 2 (16) worth
    expect(computeVoucherSplit(17, 8, 8)).toEqual({ voucherAmount: 8, remainderAmount: 9 });
  });

  it('puts the whole amount in the remainder when the balance is empty', () => {
    expect(computeVoucherSplit(12, 8, 0)).toEqual({ voucherAmount: 0, remainderAmount: 12 });
  });

  it('puts the whole amount in the remainder when the amount is below one unit', () => {
    expect(computeVoucherSplit(5, 8, 96)).toEqual({ voucherAmount: 0, remainderAmount: 5 });
  });

  it('handles floating-point-prone denominations without off-by-one unit counts', () => {
    expect(computeVoucherSplit(11.5, 5.75, 100)).toEqual({ voucherAmount: 11.5, remainderAmount: 0 });
  });

  it('treats a non-positive or invalid unit value as nothing affordable', () => {
    expect(computeVoucherSplit(20, 0, 100)).toEqual({ voucherAmount: 0, remainderAmount: 20 });
    expect(computeVoucherSplit(20, NaN, 100)).toEqual({ voucherAmount: 0, remainderAmount: 20 });
    expect(computeVoucherSplit(20, -8, 100)).toEqual({ voucherAmount: 0, remainderAmount: 20 });
  });

  it('treats a non-positive amount as nothing to split', () => {
    expect(computeVoucherSplit(0, 8, 96)).toEqual({ voucherAmount: 0, remainderAmount: 0 });
    expect(computeVoucherSplit(-5, 8, 96)).toEqual({ voucherAmount: 0, remainderAmount: 0 });
  });
});

import { describe, it, expect } from 'vitest';
import { matchCategory, matchCategoryByMCC } from '../../utils/categoryMatcher';

describe('matchCategoryByMCC', () => {
  it('matches a known grocery MCC to the Food category', () => {
    const result = matchCategoryByMCC('5411');
    expect(result).toEqual({ index: 4, label: 'Food' });
  });

  it('matches a restaurant/bar MCC to the Food category', () => {
    expect(matchCategoryByMCC('5812')?.index).toBe(4);
    expect(matchCategoryByMCC('5813')?.index).toBe(4);
  });

  it('matches a rideshare/taxi MCC to Transports', () => {
    expect(matchCategoryByMCC('4121')?.index).toBe(12);
  });

  it('matches a computer-services MCC to Digital service', () => {
    expect(matchCategoryByMCC('7372')?.index).toBe(1);
  });

  it('pads a 3-digit code to 4 digits before lookup', () => {
    expect(matchCategoryByMCC('742')?.index).toBe(13); // veterinary → Pets
  });

  it('returns null for an unrecognized code', () => {
    expect(matchCategoryByMCC('9999')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(matchCategoryByMCC('')).toBeNull();
    expect(matchCategoryByMCC(null)).toBeNull();
  });
});

describe('matchCategory (regression guard for MCC addition)', () => {
  it('still resolves ordinary free-text category aliases', () => {
    expect(matchCategory('groceries')?.index).toBe(4);
    expect(matchCategory('unknown-category-xyz')).toBeNull();
  });

  it('does not mistake a bank transaction-type enum for a "car" expense (word-boundary regression)', () => {
    // "CARD_TRANSACTION" contains "car" as a raw substring, but is not a
    // vehicle expense — a plain .includes() check used to mis-tag every
    // card purchase in Trade Republic imports as "Vehicle".
    expect(matchCategory('CARD_TRANSACTION')).toBeNull();
    expect(matchCategory('CARD_TRANSACTION_INTERNATIONAL')).toBeNull();
  });

  it('still matches "car" as a whole word', () => {
    expect(matchCategory('car')?.index).toBe(11);
    expect(matchCategory('new car')?.index).toBe(11);
  });

  it('does not mistake "PAYPAL" for the salary alias "pay"', () => {
    expect(matchCategory('PAYPAL')).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { formatInstrumentDetails } from '../../utils/instrumentDisplay';

describe('formatInstrumentDetails', () => {
  it('joins exchange, currency and ISIN with a separator', () => {
    expect(formatInstrumentDetails({ exchange: 'US', currency: 'USD', isin: 'US0378331005' }))
      .toBe('US · USD · US0378331005');
  });

  it('skips missing parts so listings differing only by exchange stay distinguishable', () => {
    expect(formatInstrumentDetails({ exchange: 'BA', currency: null, isin: null })).toBe('BA');
    expect(formatInstrumentDetails({ exchange: null, currency: null, isin: 'US0378331005' })).toBe('US0378331005');
    expect(formatInstrumentDetails({ exchange: 'MI', currency: 'EUR', isin: null })).toBe('MI · EUR');
  });

  it('returns an empty string when there is nothing to show', () => {
    expect(formatInstrumentDetails({ exchange: null, currency: null, isin: null })).toBe('');
    expect(formatInstrumentDetails(null)).toBe('');
    expect(formatInstrumentDetails(undefined)).toBe('');
  });
});

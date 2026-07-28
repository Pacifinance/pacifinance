import { describe, it, expect } from 'vitest';
import { formatInstrumentDetails } from '../../utils/instrumentDisplay';

describe('formatInstrumentDetails', () => {
  it('joins the readable exchange name, currency and ISIN with a separator', () => {
    expect(formatInstrumentDetails({ exchange: 'US', currency: 'USD', isin: 'US0378331005' }))
      .toBe('NYSE / Nasdaq · USD · US0378331005');
  });

  it('falls back to the raw exchange code when it has no known readable name', () => {
    expect(formatInstrumentDetails({ exchange: 'ZZ', currency: null, isin: null })).toBe('ZZ');
  });

  it('skips missing parts so listings differing only by exchange stay distinguishable', () => {
    expect(formatInstrumentDetails({ exchange: null, currency: null, isin: 'US0378331005' })).toBe('US0378331005');
    expect(formatInstrumentDetails({ exchange: 'IM', currency: 'EUR', isin: null })).toBe('Euronext Milan · EUR');
  });

  it('returns an empty string when there is nothing to show', () => {
    expect(formatInstrumentDetails({ exchange: null, currency: null, isin: null })).toBe('');
    expect(formatInstrumentDetails(null)).toBe('');
    expect(formatInstrumentDetails(undefined)).toBe('');
  });
});

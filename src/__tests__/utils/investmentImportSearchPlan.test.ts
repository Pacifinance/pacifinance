import { describe, expect, it } from 'vitest';
import { getImportInstrumentSearchPlan } from '../../utils/investmentImport/searchPlan';

describe('getImportInstrumentSearchPlan', () => {
  it.each(['ledger', 'binance', 'cryptocom'] as const)(
    'searches only the crypto catalog for %s exports',
    (platform) => {
      expect(getImportInstrumentSearchPlan(platform)).toEqual([
        { source: 'coingecko', kind: 'crypto' },
      ]);
    },
  );

  it('keeps cross-market fallback for generic bank or broker exports', () => {
    expect(getImportInstrumentSearchPlan('generic')).toEqual([
      { source: 'figi' },
      { source: 'coingecko', kind: 'crypto' },
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import { getAssetKeyForInstrument } from '../../constants/investmentSchema';

describe('getAssetKeyForInstrument', () => {
  it('keeps non-Bitcoin crypto in the crypto bucket', () => {
    expect(getAssetKeyForInstrument({ kind: 'crypto', symbol: 'ETH' })).toBe('crypto');
  });

  it('puts Bitcoin in its dedicated presentation bucket', () => {
    expect(getAssetKeyForInstrument({ kind: 'crypto', symbol: 'btc' })).toBe('bitcoin');
  });

  it('maps traditional instruments by kind', () => {
    expect(getAssetKeyForInstrument({ kind: 'stock', symbol: 'BTC' })).toBe('stocks');
  });
});

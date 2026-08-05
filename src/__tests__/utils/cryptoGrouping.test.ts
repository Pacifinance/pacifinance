import { describe, expect, it } from 'vitest';
import { groupBitcoinWithCrypto } from '../../utils/cryptoGrouping';

const entries = [
  { id: 1, assetKey: 'bitcoin' as const },
  { id: 2, assetKey: 'crypto' as const },
  { id: 3, assetKey: 'stocks' as const },
];

describe('groupBitcoinWithCrypto', () => {
  it('keeps the default separated representation', () => {
    expect(groupBitcoinWithCrypto(entries, false)).toEqual(entries);
  });

  it('maps only Bitcoin into crypto for combined analyses', () => {
    expect(groupBitcoinWithCrypto(entries, true)).toEqual([
      { id: 1, assetKey: 'crypto' },
      { id: 2, assetKey: 'crypto' },
      { id: 3, assetKey: 'stocks' },
    ]);
  });

  it('does not mutate source data', () => {
    groupBitcoinWithCrypto(entries, true);
    expect(entries[0].assetKey).toBe('bitcoin');
  });
});

import type { InvestmentAssetKey } from '../types/api';

export const groupBitcoinWithCrypto = <T extends { assetKey: InvestmentAssetKey }>(
  entries: readonly T[],
  combined: boolean,
): T[] => combined
  ? entries.map((entry) => entry.assetKey === 'bitcoin' ? { ...entry, assetKey: 'crypto' } : entry)
  : [...entries];

/**
 * Investment instrument schema — maps the balance-level `AssetKey`s that support
 * provider-verified instrument search (OpenFIGI for stocks/ETFs/bonds/funds,
 * CoinGecko for crypto, an internal curated catalog for commodities) onto the
 * backend's `InvestmentKind`/`InvestmentSearchSource`.
 *
 * `commodities` (gold, silver, oil, ...) uses the 'internal' search source: OpenFIGI/
 * CoinGecko don't cover physical commodities well enough to verify live, so instead
 * it searches a fixed, curated catalog seeded once (see
 * supabase/migrations/seed-commodity-instruments.sql) rather than an external API.
 *
 * @module constants/investmentSchema
 */
import type { InvestmentAssetKey, InvestmentKind, InvestmentSearchSource } from '../types/api';

/** Asset keys that can be linked to a provider-verified instrument. */
export const VERIFIABLE_ASSET_KEYS: readonly InvestmentAssetKey[] = [
  'stocks',
  'etf',
  'bitcoin',
  'crypto',
  'bonds',
  'funds',
  'commodities',
] as const;

export const ASSET_KEY_TO_KIND: Readonly<Record<InvestmentAssetKey, InvestmentKind | null>> = {
  stocks: 'stock',
  etf: 'etf',
  bitcoin: 'crypto',
  crypto: 'crypto',
  bonds: 'bond',
  funds: 'fund',
  commodities: 'commodity',
};

/** Inverse of ASSET_KEY_TO_KIND for imports: an instrument's kind decides which balance card the holding lands on. */
export const KIND_TO_ASSET_KEY: Readonly<Record<InvestmentKind, InvestmentAssetKey | null>> = {
  stock: 'stocks',
  etf: 'etf',
  crypto: 'crypto',
  bond: 'bonds',
  fund: 'funds',
  commodity: 'commodities',
  other: null,
};

export const KIND_TO_SEARCH_SOURCE: Readonly<Record<InvestmentKind, InvestmentSearchSource | null>> = {
  stock: 'figi',
  etf: 'figi',
  bond: 'figi',
  fund: 'figi',
  crypto: 'coingecko',
  commodity: 'internal',
  other: null,
};

/** Safe for any string, not just `InvestmentAssetKey` — liquidity keys (bank, cash, ...) correctly return false. */
export function isVerifiableAssetKey(assetKey: string): boolean {
  return Boolean(ASSET_KEY_TO_KIND[assetKey as InvestmentAssetKey]);
}

/**
 * Asset keys with one obvious canonical instrument, used to pre-fill the
 * instrument search when a user adds their first holding for that key (still
 * changeable — e.g. for a separate wallet or another chain's version).
 * Deliberately not populated for every VERIFIABLE_ASSET_KEYS entry: `crypto`,
 * `stocks`, `etf`, `bonds`, `funds` are broad categories with no single
 * canonical instrument, unlike `bitcoin`.
 */
export const DEFAULT_INSTRUMENT_HINTS: Partial<Record<InvestmentAssetKey, { query: string; symbol: string }>> = {
  bitcoin: { query: 'BTC', symbol: 'BTC' },
};

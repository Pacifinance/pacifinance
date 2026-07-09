/**
 * Investment instrument schema — maps the balance-level `AssetKey`s that support
 * provider-verified instrument search (OpenFIGI for stocks/ETFs/bonds/funds,
 * CoinGecko for crypto) onto the backend's `InvestmentKind`/`InvestmentSearchSource`.
 *
 * `gold` is intentionally absent: neither OpenFIGI nor CoinGecko cover physical
 * gold/commodities well enough to verify, so it stays a manual-only asset.
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
] as const;

export const ASSET_KEY_TO_KIND: Readonly<Record<InvestmentAssetKey, InvestmentKind | null>> = {
  stocks: 'stock',
  etf: 'etf',
  bitcoin: 'crypto',
  crypto: 'crypto',
  bonds: 'bond',
  funds: 'fund',
  gold: null,
};

export const KIND_TO_SEARCH_SOURCE: Readonly<Record<InvestmentKind, InvestmentSearchSource | null>> = {
  stock: 'figi',
  etf: 'figi',
  bond: 'figi',
  fund: 'figi',
  crypto: 'coingecko',
  commodity: null,
  other: null,
};

/** Safe for any string, not just `InvestmentAssetKey` — liquidity keys (bank, cash, ...) correctly return false. */
export function isVerifiableAssetKey(assetKey: string): boolean {
  return Boolean(ASSET_KEY_TO_KIND[assetKey as InvestmentAssetKey]);
}

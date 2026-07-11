/**
 * Balance schema — single source of truth for the 11 balance "assets" and
 * the mapping between the two key formats used at the network edge:
 *
 *  • camelCase  (e.g. `digitalServices`, `emergencyFund`) — keys as they come
 *    back from GET /balances/get (they mirror the Mongoose schema)
 *  • snake_case (e.g. `digital_services`, `emergency_fund`) — keys required
 *    by POST /balances/add
 *
 * Reading an asset off a GET response with a snake_case key silently returns
 * `undefined` → `0`, which **wipes** that asset in the DB on the next POST.
 * To prevent that class of bug every balance payload MUST be built via
 * `buildAddBalancePayload(...)` and every snapshot read MUST go through
 * `readAssetFromSnapshot(...)` / `snapshotToEurMap(...)`.
 *
 * @module constants/balanceSchema
 */

import type {
  AssetKey,
  AssetDbKey,
  BalanceAddPayload,
  BalanceAddRequest,
  BalanceSnapshotDto,
} from '../types/api';

/** Canonical, ordered list of asset keys (camelCase, matches the Mongo schema). */
export const ASSET_KEYS: readonly AssetKey[] = [
  'bank',
  'cash',
  'digitalServices',
  'emergencyFund',
  'stocks',
  'etf',
  'bitcoin',
  'crypto',
  'bonds',
  'funds',
  'commodities',
] as const;

/** "Wallet-like" assets (immediately spendable). */
export const LIQUIDITY_KEYS: readonly AssetKey[] = [
  'bank',
  'cash',
  'digitalServices',
  'emergencyFund',
] as const;

/** Investment assets (tracked for net-worth but not for day-to-day spending). */
export const INVESTMENT_KEYS: readonly AssetKey[] = [
  'stocks',
  'etf',
  'bitcoin',
  'crypto',
  'bonds',
  'funds',
  'commodities',
] as const;

/**
 * Canonical camelCase → snake_case mapping.
 * Use this when WRITING a payload to `/balances/add`.
 */
export const ASSET_TO_DB_KEY: Readonly<Record<AssetKey, AssetDbKey>> = {
  bank: 'bank',
  cash: 'cash',
  digitalServices: 'digital_services',
  emergencyFund: 'emergency_fund',
  stocks: 'stocks',
  etf: 'etf',
  bitcoin: 'bitcoin',
  crypto: 'crypto',
  bonds: 'bonds',
  funds: 'funds',
  commodities: 'commodities',
};

/**
 * Canonical snake_case → camelCase mapping.
 * Derived automatically from `ASSET_TO_DB_KEY` so the two cannot drift.
 */
export const DB_KEY_TO_ASSET: Readonly<Record<AssetDbKey, AssetKey>> =
  Object.freeze(
    Object.fromEntries(
      (Object.entries(ASSET_TO_DB_KEY) as [AssetKey, AssetDbKey][]).map(
        ([asset, dbKey]) => [dbKey, asset],
      ),
    ) as Record<AssetDbKey, AssetKey>,
  );

/* ───────────────────────── Read helpers ─────────────────────────── */

/**
 * Read an asset value off a balance snapshot as returned by
 * GET /balances/get (camelCase keys). Returns 0 when missing or non-numeric.
 *
 * NEVER index the snapshot with a snake_case key directly: that's the bug
 * this module is designed to prevent.
 */
export function readAssetFromSnapshot(
  snapshot: Partial<BalanceSnapshotDto> | null | undefined,
  assetKey: AssetKey,
): number {
  if (!snapshot) return 0;
  const raw = (snapshot as Record<string, unknown>)[assetKey];
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Turn a GET-shape snapshot into a flat `{ [AssetKey]: number }` map in EUR.
 * All missing or invalid fields are coerced to 0.
 */
export function snapshotToEurMap(
  snapshot: Partial<BalanceSnapshotDto> | null | undefined,
): Record<AssetKey, number> {
  const out = {} as Record<AssetKey, number>;
  for (const key of ASSET_KEYS) {
    out[key] = readAssetFromSnapshot(snapshot, key);
  }
  return out;
}

/* ───────────────────────── Write helpers ─────────────────────────── */

/**
 * Build a well-formed POST /balances/add payload from a camelCase EUR map.
 *
 * @param date    ISO date (YYYY-MM-DD). Determines the month bucket in the DB.
 * @param values  Full `{ [AssetKey]: number }` map — any missing key defaults to 0.
 * @returns       The request body ready to hand to `financeService.addBalance`.
 */
export function buildAddBalancePayload(
  date: string,
  values: Partial<Record<AssetKey, number>>,
): BalanceAddRequest {
  const balance = { date } as BalanceAddPayload;
  for (const assetKey of ASSET_KEYS) {
    const dbKey = ASSET_TO_DB_KEY[assetKey];
    const raw = values[assetKey];
    const n = Number(raw);
    balance[dbKey] = Number.isFinite(n) ? n : 0;
  }
  return { balance };
}

/**
 * Apply a per-asset EUR delta on top of a snapshot and produce a ready-to-POST
 * payload. This is the high-level helper used by past-month transaction flows
 * (add/edit/delete) to avoid the "accidentally zero an asset I did not touch"
 * trap: every unchanged asset is carried over from the snapshot.
 *
 * @param date     ISO date of the POST (anchors the month bucket).
 * @param snapshot Current snapshot for that month (camelCase; from GET).
 * @param deltas   `{ [AssetKey]: deltaEUR }`. Any asset NOT in the map is
 *                 carried over unchanged from the snapshot.
 */
export function buildSnapshotWithDeltas(
  date: string,
  snapshot: Partial<BalanceSnapshotDto> | null | undefined,
  deltas: Partial<Record<AssetKey, number>>,
): BalanceAddRequest {
  const base = snapshotToEurMap(snapshot);
  for (const [assetKey, delta] of Object.entries(deltas) as [AssetKey, number][]) {
    if (delta == null || !Number.isFinite(Number(delta))) continue;
    base[assetKey] = (base[assetKey] || 0) + Number(delta);
  }
  return buildAddBalancePayload(date, base);
}

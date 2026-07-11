/**
 * Tests for the centralized balance schema helpers. These lock in the
 * camelCase ↔ snake_case contract and prevent regressions of the
 * "past-month write silently zeroes digitalServices/emergencyFund" bug.
 */
import { describe, it, expect } from 'vitest';
import {
  ASSET_KEYS,
  ASSET_TO_DB_KEY,
  DB_KEY_TO_ASSET,
  LIQUIDITY_KEYS,
  INVESTMENT_KEYS,
  readAssetFromSnapshot,
  snapshotToEurMap,
  buildAddBalancePayload,
  buildSnapshotWithDeltas,
} from '../../constants/balanceSchema';

describe('ASSET_KEYS & mappings', () => {
  it('has exactly 11 canonical assets', () => {
    expect(ASSET_KEYS).toHaveLength(11);
  });

  it('every asset key has a snake_case db counterpart and back', () => {
    for (const k of ASSET_KEYS) {
      const db = ASSET_TO_DB_KEY[k];
      expect(db).toBeDefined();
      expect(DB_KEY_TO_ASSET[db]).toBe(k);
    }
  });

  it('LIQUIDITY and INVESTMENT partition ASSET_KEYS without overlap', () => {
    const union = [...LIQUIDITY_KEYS, ...INVESTMENT_KEYS];
    expect(new Set(union).size).toBe(union.length);
    expect(new Set(union)).toEqual(new Set(ASSET_KEYS));
  });

  it('critical asset-to-db entries use the expected snake_case names', () => {
    expect(ASSET_TO_DB_KEY.digitalServices).toBe('digital_services');
    expect(ASSET_TO_DB_KEY.emergencyFund).toBe('emergency_fund');
  });
});

describe('readAssetFromSnapshot', () => {
  it('reads camelCase keys from a GET-shape snapshot', () => {
    const snap = { bank: 100, digitalServices: 42, emergencyFund: 7 };
    expect(readAssetFromSnapshot(snap, 'bank')).toBe(100);
    expect(readAssetFromSnapshot(snap, 'digitalServices')).toBe(42);
    expect(readAssetFromSnapshot(snap, 'emergencyFund')).toBe(7);
  });

  it('returns 0 for missing, null or non-numeric entries', () => {
    expect(readAssetFromSnapshot({}, 'bank')).toBe(0);
    expect(readAssetFromSnapshot(null, 'bank')).toBe(0);
    expect(readAssetFromSnapshot(undefined, 'bank')).toBe(0);
    expect(readAssetFromSnapshot({ bank: 'oops' }, 'bank')).toBe(0);
  });
});

describe('snapshotToEurMap', () => {
  it('always returns all 11 keys, zero-filling missing ones', () => {
    const map = snapshotToEurMap({ bank: 10 });
    expect(Object.keys(map).sort()).toEqual([...ASSET_KEYS].sort());
    expect(map.bank).toBe(10);
    expect(map.digitalServices).toBe(0);
    expect(map.emergencyFund).toBe(0);
  });
});

describe('buildAddBalancePayload', () => {
  it('emits the snake_case POST /balances/add shape with the correct date', () => {
    const req = buildAddBalancePayload('2026-02-28', {
      bank: 100, digitalServices: 42, emergencyFund: 7,
    });
    expect(req).toEqual({
      balance: {
        date: '2026-02-28',
        bank: 100,
        cash: 0,
        digital_services: 42,
        emergency_fund: 7,
        stocks: 0,
        etf: 0,
        bitcoin: 0,
        crypto: 0,
        bonds: 0,
        funds: 0,
        commodities: 0,
      },
    });
  });

  it('zero-fills every asset that is missing from the values map', () => {
    const { balance } = buildAddBalancePayload('2026-01-31', {});
    for (const dbKey of Object.values(ASSET_TO_DB_KEY)) {
      expect(balance[dbKey]).toBe(0);
    }
  });
});

describe('buildSnapshotWithDeltas', () => {
  /**
   * This is the exact scenario that caused the production bug:
   * past-month POST silently zeroing digitalServices/emergencyFund because
   * the reader used snake_case keys against a camelCase snapshot.
   */
  it('carries over every untouched asset from the camelCase snapshot', () => {
    const snapshot = {
      bank: 7703.87,
      cash: 7,
      digitalServices: 420,
      emergencyFund: 150,
      stocks: 5190.68,
      etf: 6203.04,
      bitcoin: 6542.88,
      crypto: 1955.82,
      bonds: 0,
      funds: 0,
      commodities: 0,
    };
    const { balance } = buildSnapshotWithDeltas('2026-02-28', snapshot, {
      bank: -1, // single outflow row of 1€ from the bank
    });
    expect(balance.date).toBe('2026-02-28');
    expect(balance.bank).toBe(7702.87);
    // The assets that MUST NOT be zeroed:
    expect(balance.digital_services).toBe(420);
    expect(balance.emergency_fund).toBe(150);
    expect(balance.stocks).toBe(5190.68);
    expect(balance.bitcoin).toBe(6542.88);
  });

  it('applies positive and negative deltas on multiple assets at once', () => {
    const snapshot = { bank: 100, cash: 50, stocks: 200 };
    const { balance } = buildSnapshotWithDeltas('2025-12-31', snapshot, {
      bank: -25,
      cash: +10,
    });
    expect(balance.bank).toBe(75);
    expect(balance.cash).toBe(60);
    expect(balance.stocks).toBe(200); // untouched
  });

  it('treats a null snapshot as an all-zero snapshot', () => {
    const { balance } = buildSnapshotWithDeltas('2026-02-28', null, {
      bank: 42,
    });
    expect(balance.bank).toBe(42);
    expect(balance.digital_services).toBe(0);
  });

  it('ignores non-finite deltas', () => {
    const snapshot = { bank: 100 };
    const { balance } = buildSnapshotWithDeltas('2025-01-31', snapshot, {
      bank: Number.NaN,
    });
    expect(balance.bank).toBe(100);
  });
});

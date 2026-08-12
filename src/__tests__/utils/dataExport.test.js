import { describe, expect, it } from 'vitest';
import { prepareUserDataForExport } from '../../utils/dataExport';

// Minimal shape matching server/src/routes/private/user.ts POST /alldata,
// built from server/src/libs/userDataDomains.ts - see that file for the
// full domain list this is a (deliberately partial) sample of.
function apiPayload(overrides = {}) {
  return {
    profile: {
      userId: '123456',
      creationDate: '2025-01-01T00:00:00.000Z',
      country: { label: 'Italy', index: 3, type: 3 },
      job: { label: 'Engineer', index: 1, type: 4 },
      jobType: null,
      jobCountry: null,
      workTime: null,
      remoteType: null,
    },
    balances: [{ date: '2026-01-01', userDate: '2026-01-01', bank: 1000, cash: 50 }],
    transactions: [{ date: '2026-01-05', amount: 42, direction: 'outflow', purpose: 'expense', notes: '', paymentType: null, categoryTag: null }],
    categories: [],
    investmentHoldings: [],
    investmentHoldingHistory: [],
    investmentTransactions: [],
    investmentDividends: [],
    investmentSettings: null,
    manualInstruments: [],
    communityPriceSubmissions: [],
    liquidityAccounts: [],
    liquidityAccountHistory: [],
    goals: [],
    recurringTransactions: [],
    sharedExpenseReceivables: [],
    sharedExpenseReimbursements: [],
    notificationPreferences: null,
    pushSubscriptions: [],
    roadmapVotes: [],
    benchmarkSnapshots: [],
    ...overrides,
  };
}

describe('prepareUserDataForExport - API payload (server/src/routes/private/user.ts POST /alldata)', () => {
  it('reads the profile domain (not the old "user" key) and unwraps tag-label objects', () => {
    const result = prepareUserDataForExport(apiPayload());

    expect(result.userInfo.userId).toBe('123456');
    expect(result.userInfo.country).toBe('Italy');
    expect(result.userInfo.job).toBe('Engineer');
    expect(result.userInfo.jobType).toBe('N/A');
  });

  it('builds extraDomains only for domains that actually have data', () => {
    const result = prepareUserDataForExport(apiPayload({
      goals: [{ id: 1, type: 'savings' }],
      recurringTransactions: [{ id: 1, label: 'Rent' }],
      investmentSettings: { monthlyTarget: 200, monthlyTargetPercent: null },
    }));

    const keys = result.extraDomains.map((domain) => domain.key);
    expect(keys).toContain('goals');
    expect(keys).toContain('recurringTransactions');
    // A single-object domain (one row per user, not a list) is wrapped as a 1-row array.
    expect(keys).toContain('investmentSettings');
    const settings = result.extraDomains.find((domain) => domain.key === 'investmentSettings');
    expect(settings.rows).toEqual([{ monthlyTarget: 200, monthlyTargetPercent: null }]);

    // Domains left empty/null in the fixture must not produce empty sections.
    expect(keys).not.toContain('categories');
    expect(keys).not.toContain('notificationPreferences');
  });

  it('gives every extraDomains entry a human-readable title', () => {
    const result = prepareUserDataForExport(apiPayload({
      goals: [{ id: 1 }],
    }));
    const goalsDomain = result.extraDomains.find((domain) => domain.key === 'goals');
    expect(goalsDomain.title).toBe('Goals');
  });

  it('produces no extraDomains when every extra domain is empty', () => {
    const result = prepareUserDataForExport(apiPayload());
    expect(result.extraDomains).toEqual([]);
  });
});

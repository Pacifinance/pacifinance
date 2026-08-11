/**
 * useDemoServices — wraps useServices() for demo-mode safety.
 *
 * In normal mode, returns real services unchanged.
 * In demo mode, wraps write methods to return simulated success
 * responses without making any API calls, and wraps per-feature read
 * methods (goals, investment holdings, recurring transactions, liquidity
 * sub-accounts, shared expenses) to return realistic seed data instead of
 * hitting a backend. These are features a real account fetches separately
 * on demand, unlike the bulk `userData` snapshot UserContext loads once at
 * startup — that one's demo counterpart is `generateDemoData()` in
 * `src/data/demoData.ts`, not here.
 *
 * Usage: replace `useServices()` with `useDemoServices()` in components
 * that perform write operations (InsertValues, ProfilePage, etc.) or read
 * one of the per-feature services listed above.
 *
 * @module hooks/useDemoServices
 */

import { useMemo } from 'react';
import { useServices } from '../contexts/ServiceContext';
import { useAuth } from './useAuth';
import type {
  CommunityPriceDto, CommunityPricesMineResponse, CommunityPricesPendingResponse,
  InvestmentInstrumentDto, InvestmentHoldingDto, InvestmentHoldingHistoryDto, InvestmentHoldingSaveRequest,
  InvestmentSettingsDto, InvestmentDividendDto, InvestmentDividendSummaryResponse,
  InvestmentTransactionDto, InvestmentTransactionsGetResponse,
  LiquidityAccountDto, LiquidityAccountHistoryDto, RecurringTransactionDto,
  GoalDto, SharedExpenseReceivableDto,
} from '../types/api';

// A recent date a few days in the past, so "last updated"/"last paid"
// fields never look stale no matter when the demo is opened.
const daysAgoISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};
const daysAgoDate = (days: number) => daysAgoISO(days).slice(0, 10);

const FAKE_SUCCESS = { status: 200, data: { success: true } };

/** Sample goals so the feature is visible in demo mode (no real backend session to fetch from). */
const DEMO_GOALS: GoalDto[] = [
  { id: -1, name: 'Fondo Emergenza', goalType: 'savings', targetValue: 15000, targetPercentOfNetWorth: null, currentValue: 5000, linkedAssetKey: 'emergencyFund', deadline: '2026-12-31', updatedAt: new Date().toISOString() },
  { id: -2, name: 'Vacanze Estate 2026', goalType: 'savings', targetValue: 4000, targetPercentOfNetWorth: null, currentValue: 2200, linkedAssetKey: null, deadline: '2026-06-30', updatedAt: new Date().toISOString() },
  { id: -3, name: 'Nuovo MacBook Pro', goalType: 'purchase', targetValue: 3500, targetPercentOfNetWorth: null, currentValue: 1800, linkedAssetKey: null, deadline: '2026-04-15', updatedAt: new Date().toISOString() },
];

/** Small static catalog so the instrument search works offline in demo mode (no backend session exists). */
const DEMO_INSTRUMENTS: InvestmentInstrumentDto[] = [
  { id: -1, kind: 'stock', symbol: 'AAPL', exchange: 'NASDAQ', name: 'Apple Inc', currency: 'USD', country: 'US', sector: null, industry: null, figi: 'BBG000B9XRY4', isin: null, coingeckoId: null, provider: 'openfigi', verified: true, active: true, metadata: {} },
  { id: -2, kind: 'etf', symbol: 'SWDA', exchange: 'LSE', name: 'iShares Core MSCI World UCITS ETF', currency: 'USD', country: null, sector: null, industry: null, figi: 'BBG00B3TQBJ6', isin: 'IE00B4L5Y983', coingeckoId: null, provider: 'openfigi', verified: true, active: true, metadata: {} },
  { id: -3, kind: 'crypto', symbol: 'BTC', exchange: null, name: 'Bitcoin', currency: null, country: null, sector: null, industry: null, figi: null, isin: null, coingeckoId: 'bitcoin', provider: 'coingecko', verified: true, active: true, metadata: {} },
  { id: -4, kind: 'crypto', symbol: 'ETH', exchange: null, name: 'Ethereum', currency: null, country: null, sector: null, industry: null, figi: null, isin: null, coingeckoId: 'ethereum', provider: 'coingecko', verified: true, active: true, metadata: {} },
];

/** One holding per DEMO_INSTRUMENTS entry, so investment charts, portfolio
 * insights and balance reconciliation all have something real to show. */
const DEMO_HOLDINGS: InvestmentHoldingDto[] = [
  { id: -201, assetKey: 'stocks', positionType: 'single', quantity: 15, averagePrice: 155.30, currentValue: 2850, investedAmount: 2329.50, currency: 'USD', notes: '', updatedAt: daysAgoISO(2), importSource: null, instrument: DEMO_INSTRUMENTS[0] },
  { id: -202, assetKey: 'etf', positionType: 'pac', quantity: 120, averagePrice: 85.40, currentValue: 11500, investedAmount: 10248, currency: 'USD', notes: 'PAC mensile', updatedAt: daysAgoISO(2), importSource: null, instrument: DEMO_INSTRUMENTS[1] },
  { id: -203, assetKey: 'bitcoin', positionType: 'single', quantity: 0.15, averagePrice: 38000, currentValue: 9800, investedAmount: 5700, currency: null, notes: '', updatedAt: daysAgoISO(5), importSource: null, instrument: DEMO_INSTRUMENTS[2] },
  { id: -204, assetKey: 'crypto', positionType: 'single', quantity: 2.5, averagePrice: 2400, currentValue: 6200, investedAmount: 6000, currency: null, notes: '', updatedAt: daysAgoISO(5), importSource: null, instrument: DEMO_INSTRUMENTS[3] },
];

const DEMO_INVESTMENT_SETTINGS: InvestmentSettingsDto = { monthlyTarget: 300, monthlyTargetPercent: null };

/** A couple of buy trades per holding, so transaction history and
 * cost-basis reconciliation have something to reconcile against. */
const DEMO_TRANSACTIONS_SUMMARY = [
  { instrumentId: -1, isin: null, symbol: 'AAPL', name: 'Apple Inc', side: 'buy' as const, quantity: 10, price: 148.20, currency: 'USD', total: 1482, totalCurrency: 'USD', tradeDate: daysAgoDate(210), externalId: null, source: 'manual' },
  { instrumentId: -1, isin: null, symbol: 'AAPL', name: 'Apple Inc', side: 'buy' as const, quantity: 5, price: 169.50, currency: 'USD', total: 847.50, totalCurrency: 'USD', tradeDate: daysAgoDate(60), externalId: null, source: 'manual' },
  { instrumentId: -2, isin: 'IE00B4L5Y983', symbol: 'SWDA', name: 'iShares Core MSCI World UCITS ETF', side: 'buy' as const, quantity: 120, price: 85.40, currency: 'USD', total: 10248, totalCurrency: 'USD', tradeDate: daysAgoDate(300), externalId: null, source: 'trading212' },
  { instrumentId: -3, isin: null, symbol: 'BTC', name: 'Bitcoin', side: 'buy' as const, quantity: 0.15, price: 38000, currency: 'EUR', total: 5700, totalCurrency: 'EUR', tradeDate: daysAgoDate(150), externalId: null, source: 'manual' },
];

/** AAPL and the world ETF both pay real dividends - lets the dividend tracker show something. */
const DEMO_DIVIDENDS_SUMMARY = [
  { instrumentId: -1, symbol: 'AAPL', name: 'Apple Inc', totalAmount: 21.60, paymentCount: 4, lastPaidDate: daysAgoDate(45) },
  { instrumentId: -2, symbol: 'SWDA', name: 'iShares Core MSCI World UCITS ETF', totalAmount: 68.40, paymentCount: 2, lastPaidDate: daysAgoDate(80) },
];

/** Sub-accounts under bank/cash/emergency-fund, so the nested source picker
 * (Phase 2's sub-account dropdown) has real entries to show instead of just
 * the flat account-type totals. */
const DEMO_LIQUIDITY_ACCOUNTS: LiquidityAccountDto[] = [
  { id: -301, assetKey: 'bank', label: 'Conto Corrente Principale', currentValue: 8200, currency: 'EUR', notes: '', updatedAt: daysAgoISO(1) },
  { id: -302, assetKey: 'bank', label: 'Revolut', currentValue: 1450, currency: 'EUR', notes: 'Spese quotidiane', updatedAt: daysAgoISO(1) },
  { id: -303, assetKey: 'cash', label: 'Contanti', currentValue: 180, currency: 'EUR', notes: '', updatedAt: daysAgoISO(3) },
  { id: -304, assetKey: 'emergencyFund', label: 'Fondo Emergenza', currentValue: 5000, currency: 'EUR', notes: '5 mesi di spese', updatedAt: daysAgoISO(10) },
];

/** Salary + rent + a couple of subscriptions - covers both directions
 * (income/outflow) and both the fixed-category and custom-category paths. */
const DEMO_RECURRING: RecurringTransactionDto[] = [
  { id: -401, direction: 'income', purpose: 'income', amount: 2850, notes: 'Stipendio mensile', paymentType: null, categoryTag: { label: 'salary', index: 0, type: 1 }, userCategory: null, dayOfMonth: 27, active: true, nextRunDate: daysAgoDate(-12) },
  { id: -402, direction: 'outflow', purpose: 'expense', amount: 750, notes: 'Affitto', paymentType: { label: 'periodic payment', index: 4, type: 0 }, categoryTag: { label: 'house', index: 5, type: 0 }, userCategory: null, dayOfMonth: 1, active: true, nextRunDate: daysAgoDate(-16) },
  { id: -403, direction: 'outflow', purpose: 'expense', amount: 15.99, notes: 'Netflix', paymentType: { label: 'subscription', index: 2, type: 0 }, categoryTag: { label: 'digital service', index: 1, type: 0 }, userCategory: null, dayOfMonth: 5, active: true, nextRunDate: daysAgoDate(-20) },
  { id: -404, direction: 'outflow', purpose: 'expense', amount: 42, notes: 'Abbonamento palestra', paymentType: { label: 'subscription', index: 2, type: 0 }, categoryTag: null, userCategory: { id: -501, label: 'Palestra' }, dayOfMonth: 3, active: true, nextRunDate: daysAgoDate(-18) },
];

/** One pending shared-expense receivable ("I paid for the group") so the
 * feature shows a real balance instead of an empty state. */
const DEMO_SHARED_EXPENSES: SharedExpenseReceivableDto[] = [
  { id: -601, date: daysAgoDate(6), notes: 'Cena di compleanno - gruppo di 4', totalAmount: 160, ownShare: 40, receivableAmount: 120, settledAmount: 0, status: 'pending', expenseId: null },
];

export const useDemoServices = () => {
  const services = useServices();
  const { isDemoMode } = useAuth();

  return useMemo(() => {
    if (!isDemoMode) return services;

    // In demo mode, wrap write methods to simulate success
    return {
      ...services,
      financeService: {
        ...services.financeService,
        addBalance: async () => FAKE_SUCCESS,
        addTransaction: async () => FAKE_SUCCESS,
        updateTransaction: async () => FAKE_SUCCESS,
        addTransactionsBatch: async (data) => ({inserted: data?.transactions?.length ?? 0}),
        deleteTransaction: async () => FAKE_SUCCESS,
      },
      userService: {
        ...services.userService,
        updateProfile: async () => FAKE_SUCCESS,
        saveGoals: async () => ({ saved: true }),
        // No account to persist "seen" badges against — pretend it worked so
        // the achievement toast logic doesn't retry/log an error every time.
        setSeenBadges: async (badgeIds: string[]) => ({ seenBadges: badgeIds }),
        // Demo logout: no API call needed, just return success
        // The actual cleanup happens in UserContext via handleSetIsAuthenticated(false)
        logout: async () => FAKE_SUCCESS,
        // Block sensitive operations in demo mode
        deleteAccount: async () => { throw new Error('Not available in demo mode'); },
        changeUserId: async () => { throw new Error('Not available in demo mode'); },
        changePassword: async () => { throw new Error('Not available in demo mode'); },
        generateRecoveryCode: async () => { throw new Error('Not available in demo mode'); },
        getRecoveryCodeStatus: async () => ({ configured: false, generated_at: null }),
      },
      investmentService: {
        ...services.investmentService,
        searchInstruments: async ({ query, kind }: { query: string; kind?: string }) => {
          const q = query.trim().toLowerCase();
          if (q.length < 2) return [];
          const queryWords = q.split(/\s+/).filter(Boolean);
          return DEMO_INSTRUMENTS.filter((instrument) => {
            if (kind && instrument.kind !== kind) return false;
            const name = instrument.name.toLowerCase();
            const symbol = instrument.symbol.toLowerCase();
            const isin = instrument.isin?.toLowerCase() ?? '';
            return symbol.includes(q) || isin === q || queryWords.every((word) => name.includes(word));
          });
        },
        searchInstrumentsByIsins: async (isins: string[]) => {
          const result: Record<string, InvestmentInstrumentDto | null> = {};
          for (const raw of isins) {
            const isin = raw.trim().toUpperCase();
            result[isin] = DEMO_INSTRUMENTS.find((i) => i.isin?.toUpperCase() === isin) ?? null;
          }
          return result;
        },
        createManualInstrument: async (data: { kind: string; symbol: string; name: string; currency?: string | null }) => ({
          id: -Date.now(),
          kind: data.kind,
          symbol: data.symbol,
          exchange: null,
          name: data.name,
          currency: data.currency ?? null,
          country: null,
          sector: null,
          industry: null,
          figi: null,
          isin: null,
          coingeckoId: null,
          provider: 'manual',
          verified: false,
          active: true,
          metadata: {},
        }),
        getHoldings: async (): Promise<InvestmentHoldingDto[]> => DEMO_HOLDINGS,
        // Prices don't actually move in demo mode - echo the same holdings
        // back instead of clearing the portfolio the user is looking at.
        refreshPrices: async (): Promise<InvestmentHoldingDto[]> => DEMO_HOLDINGS,
        // No historical price provider call happens in demo mode.
        backfillHistoricalPrices: async () => [],
        // DEMO_HOLDINGS already covers every DEMO_INSTRUMENTS entry, so this
        // never actually needs to merge against an existing row from the UI's
        // own add-holding flow - same as the real backend's first save.
        saveHolding: async (data: InvestmentHoldingSaveRequest): Promise<InvestmentHoldingDto> => ({
          id: data.id ?? -Date.now(),
          assetKey: data.asset_key,
          positionType: data.position_type ?? 'single',
          quantity: data.quantity ?? null,
          averagePrice: data.average_price ?? null,
          currentValue: data.current_value ?? null,
          investedAmount: data.invested_amount ?? null,
          currency: data.currency ?? 'EUR',
          notes: data.notes ?? '',
          updatedAt: new Date().toISOString(),
          importSource: data.import_source ?? null,
          instrument: DEMO_INSTRUMENTS.find((i) => i.id === data.instrument_id) ?? null,
        }),
        deleteHolding: async () => FAKE_SUCCESS,
        getHoldingHistory: async () => [],
        // Demo mode's getHoldings() always returns [] (no session-backed live holdings
        // to backfill), so this is never actually reachable from the UI - it only
        // needs to satisfy the interface.
        saveHoldingHistory: async (data): Promise<InvestmentHoldingHistoryDto> => ({
          id: -Date.now(),
          holdingId: data.holding_id,
          instrumentId: 0,
          assetKey: 'stocks',
          symbol: '',
          name: '',
          quantity: null,
          averagePrice: null,
          currentValue: data.current_value,
          investedAmount: data.invested_amount,
          currency: 'EUR',
          userDate: data.user_date,
          recordedAt: new Date().toISOString(),
        }),
        // Same reasoning as saveHoldingHistory above - unreachable from the UI in demo mode.
        saveHoldingHistoryBatch: async (data) => ({ savedCount: data.entries.length, errors: [] }),
        getSettings: async (): Promise<InvestmentSettingsDto> => DEMO_INVESTMENT_SETTINGS,
        saveSettings: async (data): Promise<InvestmentSettingsDto> => ({ monthlyTarget: data.monthly_target, monthlyTargetPercent: data.monthly_target_percent ?? null }),
        // No session-backed dividend ledger in demo mode - echoes the save back
        // (like saveHolding/saveHoldingHistory above) without persisting it.
        saveDividend: async (data): Promise<InvestmentDividendDto> => ({
          id: -Date.now(),
          instrumentId: data.instrument_id,
          holdingId: data.holding_id ?? null,
          amount: data.amount,
          currency: data.currency ?? null,
          grossAmount: data.gross_amount ?? null,
          paidDate: data.paid_date,
          externalId: data.external_id ?? null,
          source: data.source,
          recordedAt: new Date().toISOString(),
        }),
        // No session-backed dividend ledger in demo mode - same reasoning as saveDividend above.
        saveDividendsBatch: async (data) => ({ savedCount: data.entries.length, errors: [] }),
        getDividendsSummary: async (): Promise<InvestmentDividendSummaryResponse> => DEMO_DIVIDENDS_SUMMARY,
        // No session-backed transaction ledger in demo mode - echoes the save back
        // (like saveDividend above) without persisting it.
        saveTransaction: async (data): Promise<InvestmentTransactionDto> => ({
          id: -Date.now(),
          instrumentId: data.instrument_id,
          holdingId: data.holding_id ?? null,
          side: data.side,
          quantity: data.quantity,
          price: data.price ?? null,
          currency: data.currency ?? null,
          total: data.total ?? null,
          totalCurrency: data.total_currency ?? null,
          tradeDate: data.trade_date,
          externalId: data.external_id ?? null,
          source: data.source,
          recordedAt: new Date().toISOString(),
        }),
        // No session-backed transaction ledger in demo mode - same reasoning as saveTransaction above.
        saveTransactionsBatch: async (data) => ({ savedCount: data.entries.length, errors: [] }),
        getTransactions: async (): Promise<InvestmentTransactionsGetResponse> => DEMO_TRANSACTIONS_SUMMARY,
        // No session-backed community-price queue in demo mode - simulate an
        // immediate pending submission without persisting or requiring review.
        submitCommunityPrice: async (data): Promise<CommunityPriceDto> => ({
          id: -Date.now(),
          instrumentId: data.instrument_id,
          monthKey: data.month_key,
          priceEur: data.raw_price,
          rawPrice: data.raw_price,
          rawCurrency: data.raw_currency,
          status: 'pending',
          submittedBy: 'demo-user',
          submittedAt: new Date().toISOString(),
          verifiedBy: null,
          verifiedAt: null,
          rejectionNote: null,
        }),
        getMyCommunityPriceSubmissions: async (): Promise<CommunityPricesMineResponse> => [],
        getPendingCommunityPrices: async (): Promise<CommunityPricesPendingResponse> => [],
        verifyCommunityPrice: async () => { throw new Error('Not available in demo mode'); },
      },
      liquidityAccountService: {
        ...services.liquidityAccountService,
        getAccounts: async (): Promise<LiquidityAccountDto[]> => DEMO_LIQUIDITY_ACCOUNTS,
        saveAccount: async (data: {
          id?: number; asset_key: LiquidityAccountDto['assetKey']; label: string;
          current_value: number; currency?: string; notes?: string;
        }): Promise<LiquidityAccountDto> => ({
          id: data.id ?? -Date.now(),
          assetKey: data.asset_key,
          label: data.label,
          currentValue: data.current_value,
          currency: data.currency ?? 'EUR',
          notes: data.notes ?? '',
          updatedAt: new Date().toISOString(),
        }),
        deleteAccount: async () => FAKE_SUCCESS,
        getAccountHistory: async () => [],
        saveAccountHistory: async (data): Promise<LiquidityAccountHistoryDto> => ({
          id: -Date.now(),
          accountId: data.account_id,
          assetKey: 'bank',
          label: '',
          currentValue: data.current_value,
          currency: 'EUR',
          userDate: data.user_date,
          recordedAt: new Date().toISOString(),
        }),
      },
      recurringTransactionService: {
        ...services.recurringTransactionService,
        getRecurring: async (): Promise<RecurringTransactionDto[]> => DEMO_RECURRING,
        saveRecurring: async (data): Promise<RecurringTransactionDto> => ({
          id: data.id ?? -Date.now(),
          direction: data.direction,
          purpose: data.purpose ?? (data.direction === 'outflow' ? 'expense' : 'income'),
          amount: data.amount,
          notes: data.notes ?? '',
          paymentType: null,
          categoryTag: null,
          userCategory: null,
          dayOfMonth: data.day_of_month,
          active: true,
          nextRunDate: new Date().toISOString().slice(0, 10),
        }),
        setRecurringActive: async (data): Promise<RecurringTransactionDto> => ({
          id: data.id,
          direction: 'outflow',
          purpose: 'expense',
          amount: 0,
          notes: '',
          paymentType: null,
          categoryTag: null,
          userCategory: null,
          dayOfMonth: 1,
          active: data.active,
          nextRunDate: new Date().toISOString().slice(0, 10),
        }),
        deleteRecurring: async () => FAKE_SUCCESS,
      },
      goalService: {
        ...services.goalService,
        getGoals: async (): Promise<GoalDto[]> => DEMO_GOALS,
        saveGoal: async (data: {
          id?: number; name: string; goal_type: GoalDto['goalType'];
          target_value: number; current_value?: number; linked_asset_key?: GoalDto['linkedAssetKey'];
          deadline?: string | null;
        }): Promise<GoalDto> => ({
          id: data.id ?? -Date.now(),
          name: data.name,
          goalType: data.goal_type,
          targetValue: data.target_value,
          targetPercentOfNetWorth: data.target_percent_of_net_worth ?? null,
          currentValue: data.current_value ?? 0,
          linkedAssetKey: data.linked_asset_key ?? null,
          deadline: data.deadline ?? null,
          updatedAt: new Date().toISOString(),
        }),
        deleteGoal: async () => FAKE_SUCCESS,
      },
      sharedExpenseService: {
        ...services.sharedExpenseService,
        getReceivables: async (): Promise<SharedExpenseReceivableDto[]> => DEMO_SHARED_EXPENSES,
        addReceivable: async (data: {
          date: string; notes?: string; total_amount: number; own_share: number;
        }): Promise<SharedExpenseReceivableDto> => ({
          id: -Date.now(),
          date: data.date,
          notes: data.notes ?? '',
          totalAmount: data.total_amount,
          ownShare: data.own_share,
          receivableAmount: data.total_amount - data.own_share,
          settledAmount: 0,
          status: 'pending',
        }),
        // Settling doesn't look the settled receivable back up against
        // DEMO_SHARED_EXPENSES - it just echoes back a settled shell, same
        // pattern as saveHoldingHistory above.
        settleReceivable: async (data): Promise<SharedExpenseReceivableDto> => ({
          id: data.id,
          date: new Date().toISOString().slice(0, 10),
          notes: '',
          totalAmount: 0,
          ownShare: 0,
          receivableAmount: 0,
          settledAmount: data.amount,
          status: 'settled',
        }),
        deleteReceivable: async () => FAKE_SUCCESS,
        linkExistingExpense: async (data): Promise<SharedExpenseReceivableDto> => ({
          id: -Date.now(), date: new Date().toLocaleDateString('sv'), notes: '',
          totalAmount: data.own_share * 2, ownShare: data.own_share,
          receivableAmount: data.own_share, settledAmount: 0, status: 'pending', expenseId: data.expense_id,
        }),
        linkExistingReimbursement: async (): Promise<SharedExpenseReceivableDto[]> => [],
      },
    };
  }, [isDemoMode, services]);
};

export default useDemoServices;

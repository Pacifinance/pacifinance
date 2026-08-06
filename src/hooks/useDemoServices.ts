/**
 * useDemoServices — wraps useServices() for demo-mode safety.
 *
 * In normal mode, returns real services unchanged.
 * In demo mode, wraps write methods to return simulated success
 * responses without making any API calls.
 *
 * Usage: replace `useServices()` with `useDemoServices()` in components
 * that perform write operations (InsertValues, ProfilePage, etc.).
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
        getHoldings: async (): Promise<InvestmentHoldingDto[]> => [],
        // Demo mode's getHoldings() always returns [] - nothing to refresh.
        refreshPrices: async (): Promise<InvestmentHoldingDto[]> => [],
        // Demo mode's getHoldings() always returns [] - nothing to backfill.
        backfillHistoricalPrices: async () => [],
        // Demo mode's getHoldings() always returns [], so a holding for this
        // instrument can never already exist here - the merge/replace conflict
        // path is unreachable in demo, same as with the real backend's first save.
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
        // No session-backed setting to persist in demo mode - echoes the save
        // back (like saveHolding above) without actually remembering it.
        getSettings: async (): Promise<InvestmentSettingsDto> => ({ monthlyTarget: null, monthlyTargetPercent: null }),
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
        // Demo mode's getHoldings() always returns [] - nothing to summarize.
        getDividendsSummary: async (): Promise<InvestmentDividendSummaryResponse> => [],
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
        // Demo mode has no persisted transaction history to reconcile against.
        getTransactions: async (): Promise<InvestmentTransactionsGetResponse> => [],
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
        getAccounts: async (): Promise<LiquidityAccountDto[]> => [],
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
        // Demo mode's getAccounts() always returns [] - see saveHoldingHistory above.
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
        getRecurring: async (): Promise<RecurringTransactionDto[]> => [],
        saveRecurring: async (data): Promise<RecurringTransactionDto> => ({
          id: data.id ?? -Date.now(),
          direction: data.direction,
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
        getReceivables: async (): Promise<SharedExpenseReceivableDto[]> => [],
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
        // Demo mode's getReceivables() always returns [] - see saveHoldingHistory above.
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

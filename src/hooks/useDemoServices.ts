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
import type { InvestmentInstrumentDto, InvestmentHoldingDto, LiquidityAccountDto } from '../types/api';

const FAKE_SUCCESS = { status: 200, data: { success: true } };

/** Small static catalog so the instrument search works offline in demo mode (no backend session exists). */
const DEMO_INSTRUMENTS: InvestmentInstrumentDto[] = [
  { id: -1, kind: 'stock', symbol: 'AAPL', exchange: 'NASDAQ', name: 'Apple Inc', currency: 'USD', country: 'US', sector: null, industry: null, figi: 'BBG000B9XRY4', isin: null, coingeckoId: null, provider: 'openfigi', verified: true, active: true, metadata: {} },
  { id: -2, kind: 'etf', symbol: 'SWDA', exchange: 'LSE', name: 'iShares Core MSCI World UCITS ETF', currency: 'USD', country: null, sector: null, industry: null, figi: 'BBG00B3TQBJ6', isin: null, coingeckoId: null, provider: 'openfigi', verified: true, active: true, metadata: {} },
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
        addExpenseOrIncome: async () => FAKE_SUCCESS,
        deleteExpenseOrIncome: async () => FAKE_SUCCESS,
      },
      userService: {
        ...services.userService,
        updateProfile: async () => FAKE_SUCCESS,
        saveGoals: async () => ({ saved: true }),
        // Demo logout: no API call needed, just return success
        // The actual cleanup happens in UserContext via handleSetIsAuthenticated(false)
        logout: async () => FAKE_SUCCESS,
        // Block sensitive operations in demo mode
        deleteAccount: async () => { throw new Error('Not available in demo mode'); },
        changeUserId: async () => { throw new Error('Not available in demo mode'); },
        changePassword: async () => { throw new Error('Not available in demo mode'); },
      },
      investmentService: {
        ...services.investmentService,
        searchInstruments: async ({ query, kind }: { query: string; kind?: string }) => {
          const q = query.trim().toLowerCase();
          if (q.length < 2) return [];
          return DEMO_INSTRUMENTS.filter((instrument) =>
            (!kind || instrument.kind === kind) &&
            (instrument.symbol.toLowerCase().includes(q) || instrument.name.toLowerCase().includes(q))
          );
        },
        getHoldings: async (): Promise<InvestmentHoldingDto[]> => [],
        saveHolding: async (data: {
          id?: number; instrument_id: number; asset_key: InvestmentHoldingDto['assetKey'];
          position_type?: InvestmentHoldingDto['positionType']; quantity?: number | null;
          average_price?: number | null; current_value?: number | null; invested_amount?: number | null;
          currency?: string; notes?: string;
        }): Promise<InvestmentHoldingDto> => ({
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
          instrument: DEMO_INSTRUMENTS.find((i) => i.id === data.instrument_id) ?? null,
        }),
        deleteHolding: async () => FAKE_SUCCESS,
        getHoldingHistory: async () => [],
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
      },
    };
  }, [isDemoMode, services]);
};

export default useDemoServices;

/**
 * Integration: Auth Flow Critical Paths
 *
 * These tests verify end-to-end critical flows that, if broken,
 * result in white pages, infinite loading, or lost sessions:
 *
 *  1. Login → data load → dashboard visible
 *  2. Fresh registration → redirect to sign-in → login → data loads
 *  3. 401 during active session → user deauthenticated → redirect to landing
 *  4. Error recovery → retry → data loads
 *  5. Page navigation while loading → no crash
 *  6. Multiple rapid login/logout toggles → stable state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useContext } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { UserContext, UserProvider } from '../../contexts/UserContext';
import { ServiceContext } from '../../contexts/ServiceContext';

// ── Minimal mock data ────────────────────────────────────────────────

const MOCK_TAGS = {
  expense: [], income: [], payment: [], country: [], job: [],
  jobType: [], workTime: [], remoteType: [], livingSituation: [],
  housingType: [], children: [], yearsOfExperience: [], age: [],
  currency: [{ index: 0, translations: { en: 'EUR' }, code: 'EUR' }],
};

const MOCK_USER = { userId: 'u-001', type: 0, nickname: 'Test', goals: null };

const createMockServices = (overrides = {}) => {
  const interceptors = [];
  return {
    apiClient: {
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn((ok, err) => { interceptors.push({ ok, err }); return interceptors.length - 1; }),
          eject: vi.fn(),
        },
      },
      _interceptors: interceptors,
    },
    userService: {
      checkSession: vi.fn().mockResolvedValue(null), // default: not logged in
      getTags: vi.fn().mockResolvedValue(MOCK_TAGS),
      getUserInfo: vi.fn().mockResolvedValue(MOCK_USER),
      login: vi.fn(), register: vi.fn(), updateProfile: vi.fn(),
      deleteAccount: vi.fn(), logout: vi.fn(),
      ...overrides.userService,
    },
    financeService: {
      getBalances: vi.fn().mockResolvedValue([]),
      getExpensesAndIncomes: vi.fn().mockResolvedValue([]),
      getCustomCategories: vi.fn().mockResolvedValue([]),
      getMonthlyTotals: vi.fn().mockResolvedValue([]),
      addBalance: vi.fn(), addExpenseOrIncome: vi.fn(), deleteExpenseOrIncome: vi.fn(),
      addCustomCategory: vi.fn(), deleteCustomCategory: vi.fn(),
      ...overrides.financeService,
    },
    rankingService: {
      getAllRankings: vi.fn().mockResolvedValue({
        balance: 0, incomes: 0, outflows: 0,
        balanceSimilar: 0, incomesSimilar: 0, outflowsSimilar: 0,
      }),
      ...overrides.rankingService,
    },
    statsService: {
      getAverages: vi.fn().mockResolvedValue({ avgIncome: 0, avgExpense: 0, avgBalance: 0 }),
      ...overrides.statsService,
    },
  };
};

// Consumer that shows state and lets us manipulate auth
const StateViewer = () => {
  const ctx = useContext(UserContext);
  if (!ctx) return <div data-testid="no-ctx" />;
  return (
    <div>
      <span data-testid="auth">{String(ctx.isAuthenticated)}</span>
      <span data-testid="data">{ctx.userData ? 'loaded' : 'null'}</span>
      <span data-testid="updated">{String(ctx.isUpdated)}</span>
      <span data-testid="err">{ctx.error ? 'error' : 'ok'}</span>
      <button data-testid="login" onClick={() => ctx.handleSetIsAuthenticated(true)} />
      <button data-testid="logout" onClick={() => ctx.handleSetIsAuthenticated(false)} />
      <button data-testid="retry" onClick={ctx.retryFetch} />
    </div>
  );
};

const renderWith = (services) =>
  render(
    <ServiceContext.Provider value={services}>
      <UserProvider><StateViewer /></UserProvider>
    </ServiceContext.Provider>
  );

describe('Integration — Auth Flow Critical Paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  // ── 1. Session valid → auto data load ────────────────────────────

  it('auto-loads data when session cookie is valid', async () => {
    const svc = createMockServices({
      userService: { checkSession: vi.fn().mockResolvedValue({ userId: 'u-001', type: 0 }) },
    });
    renderWith(svc);

    await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('loaded'));
    expect(svc.financeService.getBalances).toHaveBeenCalled();
  });

  // ── 2. Session invalid → unauthenticated, no data ───────────────

  it('stays unauthenticated when no valid session', async () => {
    const svc = createMockServices();
    renderWith(svc);

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false'));
    expect(screen.getByTestId('data')).toHaveTextContent('null');
    expect(svc.financeService.getBalances).not.toHaveBeenCalled();
  });

  // ── 3. Manual login after session check → data loads ─────────────

  it('loads data after manual login trigger', async () => {
    const svc = createMockServices(); // session check returns null
    renderWith(svc);

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false'));

    // Simulate login
    act(() => screen.getByTestId('login').click());

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('true');
      expect(screen.getByTestId('data')).toHaveTextContent('loaded');
    });
  });

  // ── 4. Login → Logout → Re-login → Data loads again ─────────────

  it('re-fetches data after logout+re-login cycle', async () => {
    const svc = createMockServices();
    renderWith(svc);

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false'));

    // Login
    act(() => screen.getByTestId('login').click());
    await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('loaded'));

    // Logout
    act(() => screen.getByTestId('logout').click());
    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('null');
      expect(screen.getByTestId('updated')).toHaveTextContent('false');
    });

    // Clear call tracking
    svc.userService.getTags.mockClear();

    // Re-login  
    act(() => screen.getByTestId('login').click());
    await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('loaded'));

    // Verify fresh API calls
    expect(svc.userService.getTags).toHaveBeenCalledTimes(1);
  });

  // ── 5. API error → retry → success ──────────────────────────────

  it('recovers from API error via retry', async () => {
    let tagCallCount = 0;
    const svc = createMockServices({
      userService: {
        checkSession: vi.fn().mockResolvedValue({ userId: 'u-001', type: 0 }),
        getTags: vi.fn().mockImplementation(() => {
          tagCallCount++;
          if (tagCallCount === 1) return Promise.reject(new Error('fail'));
          return Promise.resolve(MOCK_TAGS);
        }),
      },
    });

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWith(svc);

    // First load fails
    await waitFor(() => expect(screen.getByTestId('err')).toHaveTextContent('error'));

    // Retry
    act(() => screen.getByTestId('retry').click());

    await waitFor(() => {
      expect(screen.getByTestId('err')).toHaveTextContent('ok');
      expect(screen.getByTestId('data')).toHaveTextContent('loaded');
    });
    spy.mockRestore();
  });

  // ── 6. Multiple rapid toggles → stable final state ───────────────

  it('handles rapid login/logout toggles without crashing', async () => {
    const svc = createMockServices();
    renderWith(svc);

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false'));

    // Rapid toggles
    act(() => {
      screen.getByTestId('login').click();
      screen.getByTestId('logout').click();
      screen.getByTestId('login').click();
      screen.getByTestId('logout').click();
      screen.getByTestId('login').click();
    });

    // Final state should stabilize to authenticated with data
    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('true');
      expect(screen.getByTestId('data')).toHaveTextContent('loaded');
    }, { timeout: 5000 });
  });

  // ── 7. isUpdated stays false after logout (prevents white page) ──

  it('isUpdated is false after logout (ensures re-login fetches data)', async () => {
    const svc = createMockServices({
      userService: { checkSession: vi.fn().mockResolvedValue({ userId: 'u-001', type: 0 }) },
    });
    renderWith(svc);

    // Wait for load
    await waitFor(() => {
      expect(screen.getByTestId('updated')).toHaveTextContent('true');
    });

    // Logout
    act(() => screen.getByTestId('logout').click());

    await waitFor(() => {
      expect(screen.getByTestId('updated')).toHaveTextContent('false');
    });
  });

  // ── 8. 401 during session → deauthentication ────────────────────

  it('401 interceptor deauthenticates user mid-session', async () => {
    const svc = createMockServices({
      userService: { checkSession: vi.fn().mockResolvedValue({ userId: 'u-001', type: 0 }) },
    });
    renderWith(svc);

    await waitFor(() => expect(screen.getByTestId('data')).toHaveTextContent('loaded'));

    // Trigger 401 via interceptor
    const interceptor = svc.apiClient._interceptors[0];
    await act(async () => {
      try {
        await interceptor.err({ response: { status: 401 } });
      } catch { /* expected */ }
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('false');
      expect(screen.getByTestId('data')).toHaveTextContent('null');
    });
  });

  // ── 9. Empty user data (new registration) → no crash ─────────────

  it('handles new user with completely empty data', async () => {
    const svc = createMockServices({
      userService: {
        checkSession: vi.fn().mockResolvedValue({ userId: 'new-user', type: 0 }),
        getUserInfo: vi.fn().mockResolvedValue({ userId: 'new-user', type: 0, goals: null }),
      },
      financeService: {
        getBalances: vi.fn().mockResolvedValue([]),
        getExpensesAndIncomes: vi.fn().mockResolvedValue([]),
      },
      rankingService: {
        getAllRankings: vi.fn().mockResolvedValue({
          balance: 0, incomes: 0, outflows: 0,
          balanceSimilar: 0, incomesSimilar: 0, outflowsSimilar: 0,
        }),
      },
    });

    renderWith(svc);

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('loaded');
    });
  });
});

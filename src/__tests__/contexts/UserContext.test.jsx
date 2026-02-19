/**
 * UserContext — Critical State Tests
 *
 * These tests verify critical state transitions that, if broken,
 * cause the app to show a white page / hang indefinitely:
 *
 *  - Session check on mount (loading → authenticated or not)
 *  - Data fetch after successful authentication
 *  - Logout resets all state (isUpdated, error, userData)
 *  - Re-login after logout triggers a fresh data fetch
 *  - 401 interceptor deauthenticates the user
 *  - API error during fetch sets error state (not infinite loading)
 *  - retryFetch resets error + isUpdated to re-trigger fetch
 *  - New user (empty data) doesn't crash transformers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useContext } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { UserContext, UserProvider } from '../../contexts/UserContext';
import { ServiceContext } from '../../contexts/ServiceContext';

// ── Minimal mock data matching real API shapes ────────────────────────

const MOCK_TAGS = {
  expense: [{ index: 0, translations: { en: 'Food' } }],
  income: [{ index: 0, translations: { en: 'Salary' } }],
  payment: [{ index: 0, translations: { en: 'Single' } }],
  country: [],
  job: [],
  jobType: [],
  workTime: [],
  remoteType: [],
  livingSituation: [],
  housingType: [],
  children: [],
  yearsOfExperience: [],
  age: [],
  currency: [{ index: 0, translations: { en: 'EUR' }, code: 'EUR' }],
};

const MOCK_USER_INFO = {
  userId: 'test-user-123',
  type: 0,
  nickname: 'TestUser',
  goals: null,
};

const MOCK_BALANCES = [
  {
    date: '2025-01-01',
    balance: { bank: 1000, cash: 200, stocks: 500, crypto: 0, realEstate: 0, commodities: 0, bonds: 0, funds: 0, etf: 0, pension: 0, insurance: 0, other: 0 },
  },
];

const MOCK_EXPENSES = [];

const MOCK_RANKINGS = {
  balance: 5,
  incomes: 10,
  outflows: 8,
  balanceSimilar: 3,
  incomesSimilar: 7,
  outflowsSimilar: 4,
};

const MOCK_AVERAGES = {
  avgIncome: 2000,
  avgExpense: 1500,
  avgBalance: 5000,
};

// ── Service factory ──────────────────────────────────────────────────

const createMockServices = (overrides = {}) => {
  const interceptors = [];
  const apiClient = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn((onFulfilled, onRejected) => {
          interceptors.push({ onFulfilled, onRejected });
          return interceptors.length - 1;
        }),
        eject: vi.fn(),
      },
    },
    _interceptors: interceptors,
  };

  return {
    apiClient,
    userService: {
      checkSession: vi.fn().mockResolvedValue({ userId: 'test-user-123', type: 0 }),
      getTags: vi.fn().mockResolvedValue(MOCK_TAGS),
      getUserInfo: vi.fn().mockResolvedValue(MOCK_USER_INFO),
      login: vi.fn(),
      register: vi.fn(),
      updateProfile: vi.fn(),
      deleteAccount: vi.fn(),
      logout: vi.fn(),
      ...overrides.userService,
    },
    financeService: {
      getBalances: vi.fn().mockResolvedValue(MOCK_BALANCES),
      getExpensesAndIncomes: vi.fn().mockResolvedValue(MOCK_EXPENSES),
      addBalance: vi.fn(),
      addExpenseOrIncome: vi.fn(),
      deleteExpenseOrIncome: vi.fn(),
      ...overrides.financeService,
    },
    rankingService: {
      getAllRankings: vi.fn().mockResolvedValue(MOCK_RANKINGS),
      ...overrides.rankingService,
    },
    statsService: {
      getAverages: vi.fn().mockResolvedValue(MOCK_AVERAGES),
      ...overrides.statsService,
    },
  };
};

// ── Test consumer component ──────────────────────────────────────────

const TestConsumer = () => {
  const ctx = useContext(UserContext);
  if (!ctx) return <div data-testid="no-context">No context</div>;

  return (
    <div>
      <span data-testid="is-authenticated">{String(ctx.isAuthenticated)}</span>
      <span data-testid="is-loading">{String(ctx.isLoading)}</span>
      <span data-testid="is-updated">{String(ctx.isUpdated)}</span>
      <span data-testid="has-user-data">{ctx.userData ? 'yes' : 'no'}</span>
      <span data-testid="has-error">{ctx.error ? 'yes' : 'no'}</span>
      <span data-testid="user-id">{ctx.userData?.userId || ''}</span>
      <button data-testid="btn-login" onClick={() => ctx.handleSetIsAuthenticated(true)}>Login</button>
      <button data-testid="btn-logout" onClick={() => ctx.handleSetIsAuthenticated(false)}>Logout</button>
      <button data-testid="btn-update" onClick={() => ctx.handleSetIsUpdated(false)}>Refresh</button>
      <button data-testid="btn-retry" onClick={() => ctx.retryFetch()}>Retry</button>
    </div>
  );
};

const renderWithServices = (services) =>
  render(
    <ServiceContext.Provider value={services}>
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    </ServiceContext.Provider>
  );

// ═════════════════════════════════════════════════════════════════════

describe('UserContext — Critical State Transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  // ── Session check ────────────────────────────────────────────────

  it('should set isAuthenticated = true when session is valid', async () => {
    const services = createMockServices();
    renderWithServices(services);

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });
    expect(services.userService.checkSession).toHaveBeenCalledTimes(1);
  });

  it('should set isAuthenticated = false when session is invalid', async () => {
    const services = createMockServices({
      userService: { checkSession: vi.fn().mockResolvedValue(null) },
    });
    renderWithServices(services);

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });
  });

  it('should set isAuthenticated = false when session check throws', async () => {
    const services = createMockServices({
      userService: { checkSession: vi.fn().mockRejectedValue(new Error('Network error')) },
    });
    renderWithServices(services);

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });
  });

  // ── Data fetch after authentication ──────────────────────────────

  it('should fetch and set userData after authentication', async () => {
    const services = createMockServices();
    renderWithServices(services);

    await waitFor(() => {
      expect(screen.getByTestId('has-user-data')).toHaveTextContent('yes');
    });

    expect(services.userService.getTags).toHaveBeenCalled();
    expect(services.userService.getUserInfo).toHaveBeenCalled();
    expect(services.financeService.getBalances).toHaveBeenCalled();
    expect(services.financeService.getExpensesAndIncomes).toHaveBeenCalled();
    expect(services.rankingService.getAllRankings).toHaveBeenCalled();
    expect(services.statsService.getAverages).toHaveBeenCalled();
  });

  it('should set error when data fetch fails', async () => {
    const services = createMockServices({
      userService: {
        checkSession: vi.fn().mockResolvedValue({ userId: 'u1', type: 0 }),
        getTags: vi.fn().mockRejectedValue(new Error('API down')),
      },
    });

    // Suppress expected console.error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithServices(services);

    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('yes');
    });
    // userData should remain null on error
    expect(screen.getByTestId('has-user-data')).toHaveTextContent('no');
    spy.mockRestore();
  });

  // ── Logout resets all state ──────────────────────────────────────

  it('should clear userData and reset isUpdated on logout', async () => {
    const services = createMockServices();
    renderWithServices(services);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('has-user-data')).toHaveTextContent('yes');
    });

    // Logout
    act(() => {
      screen.getByTestId('btn-logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('has-user-data')).toHaveTextContent('no');
      expect(screen.getByTestId('is-updated')).toHaveTextContent('false');
    });
  });

  // ── Re-login after logout triggers fresh fetch ───────────────────

  it('should re-fetch data when re-authenticated after logout', async () => {
    const services = createMockServices();
    renderWithServices(services);

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId('has-user-data')).toHaveTextContent('yes');
    });

    // Logout
    act(() => {
      screen.getByTestId('btn-logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('has-user-data')).toHaveTextContent('no');
    });

    // Clear call counts to verify re-login triggers new calls
    services.userService.getTags.mockClear();
    services.financeService.getBalances.mockClear();

    // Re-login
    act(() => {
      screen.getByTestId('btn-login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('has-user-data')).toHaveTextContent('yes');
    });

    // Verify fresh API calls were made
    expect(services.userService.getTags).toHaveBeenCalled();
    expect(services.financeService.getBalances).toHaveBeenCalled();
  });

  // ── retryFetch resets error and triggers re-fetch ────────────────

  it('should re-fetch data when retryFetch is called after error', async () => {
    let callCount = 0;
    const services = createMockServices({
      userService: {
        checkSession: vi.fn().mockResolvedValue({ userId: 'u1', type: 0 }),
        getTags: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) throw new Error('First call fails');
          return Promise.resolve(MOCK_TAGS);
        }),
      },
    });

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithServices(services);

    // First fetch should fail
    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('yes');
    });

    // Click retry
    act(() => {
      screen.getByTestId('btn-retry').click();
    });

    // Should recover
    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('no');
      expect(screen.getByTestId('has-user-data')).toHaveTextContent('yes');
    });
    spy.mockRestore();
  });

  // ── New user with empty data ─────────────────────────────────────

  it('should handle new user with empty balances and expenses', async () => {
    const services = createMockServices({
      financeService: {
        getBalances: vi.fn().mockResolvedValue([]),
        getExpensesAndIncomes: vi.fn().mockResolvedValue([]),
      },
    });

    renderWithServices(services);

    await waitFor(() => {
      expect(screen.getByTestId('has-user-data')).toHaveTextContent('yes');
    });

    // Should not crash with empty arrays
    expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-123');
  });

  // ── 401 interceptor ──────────────────────────────────────────────

  it('should deauthenticate on 401 response via interceptor', async () => {
    const services = createMockServices();
    renderWithServices(services);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('has-user-data')).toHaveTextContent('yes');
    });

    // Simulate a 401 via the registered interceptor
    const interceptor = services.apiClient._interceptors[0];
    expect(interceptor).toBeDefined();

    await act(async () => {
      try {
        await interceptor.onRejected({ response: { status: 401 } });
      } catch {
        // interceptor re-throws
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('has-user-data')).toHaveTextContent('no');
    });
  });

  // ── handleSetIsUpdated(false) triggers re-fetch ──────────────────

  it('should re-fetch data when handleSetIsUpdated(false) is called', async () => {
    const services = createMockServices();
    renderWithServices(services);

    await waitFor(() => {
      expect(screen.getByTestId('has-user-data')).toHaveTextContent('yes');
      expect(screen.getByTestId('is-updated')).toHaveTextContent('true');
    });

    services.userService.getTags.mockClear();

    // Trigger refresh
    act(() => {
      screen.getByTestId('btn-update').click();
    });

    await waitFor(() => {
      expect(services.userService.getTags).toHaveBeenCalled();
    });
  });

  // ── handleSetIsAuthenticated(false) also resets error ────────────

  it('should reset error state on deauthentication', async () => {
    const services = createMockServices({
      userService: {
        checkSession: vi.fn().mockResolvedValue({ userId: 'u1', type: 0 }),
        getTags: vi.fn().mockRejectedValue(new Error('fail')),
      },
    });

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithServices(services);

    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('yes');
    });

    // Logout — should clear error
    act(() => {
      screen.getByTestId('btn-logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('has-error')).toHaveTextContent('no');
    });
    spy.mockRestore();
  });

  // ── Context value shape ──────────────────────────────────────────

  it('should expose all expected context values', async () => {
    const services = createMockServices({
      userService: { checkSession: vi.fn().mockResolvedValue(null) },
    });

    let contextValue;
    const Spy = () => {
      contextValue = useContext(UserContext);
      return null;
    };

    render(
      <ServiceContext.Provider value={services}>
        <UserProvider>
          <Spy />
        </UserProvider>
      </ServiceContext.Provider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
    });

    expect(contextValue).toHaveProperty('userData');
    expect(contextValue).toHaveProperty('isAuthenticated');
    expect(contextValue).toHaveProperty('isUpdated');
    expect(contextValue).toHaveProperty('handleSetIsAuthenticated');
    expect(contextValue).toHaveProperty('handleSetIsUpdated');
    expect(contextValue).toHaveProperty('isLoading');
    expect(contextValue).toHaveProperty('error');
    expect(contextValue).toHaveProperty('retryFetch');
    expect(typeof contextValue.handleSetIsAuthenticated).toBe('function');
    expect(typeof contextValue.handleSetIsUpdated).toBe('function');
    expect(typeof contextValue.retryFetch).toBe('function');
  });
});

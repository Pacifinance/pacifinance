/**
 * DashboardPage — Loading, Error and Timeout State Tests
 *
 * Validates that the dashboard loading screen:
 *  - Shows a spinner when userData is null and no error
 *  - Shows retry button after 15s timeout
 *  - Shows retry button when there's an API error
 *  - Uses proper background color (not transparent) to prevent white-on-white
 *  - Renders the main dashboard when userData is present
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock all context dependencies
const mockAuth = {
  isAuthenticated: true,
  userData: null,
  handleSetIsUpdated: vi.fn(),
  handleSetIsAuthenticated: vi.fn(),
  error: null,
  retryFetch: vi.fn(),
  isLoading: false,
};

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('../../contexts/PrivacyContext', () => ({
  PrivacyContext: React.createContext({ isHidden: false }),
}));

vi.mock('../../contexts/ThemeContext', () => ({
  ThemeContext: React.createContext({
    theme: { mode: 'dark', backgroundColor: '#222831', textColor: '#e0e0e0' },
  }),
}));

vi.mock('../../contexts/LanguageContext', () => ({
  LanguageContext: React.createContext({
    language: 'en',
    translations: {
      dashboard: {
        loading: 'Loading dashboard data...',
        loadingError: 'Error loading data.',
        loadingTimeout: 'Loading is taking longer than expected...',
        retry: 'Retry',
      },
    },
  }),
}));

vi.mock('../../contexts/MediaQueryContext', () => ({
  MediaQueryContext: React.createContext({ isMobile: false }),
}));

vi.mock('../../hooks/useLocalizedNavigate', () => ({
  useLocalizedNavigate: () => vi.fn(),
}));

vi.mock('../../hooks/useScrollNavigation', () => ({
  useScrollNavigation: () => ({
    isNavigating: false,
    showTriggerZone: false,
    triggerDirection: null,
    triggerProgress: 0,
    pageHasScrollableContent: false,
    currentPageIndex: 0,
    totalPages: 4,
    nextPage: vi.fn(),
    prevPage: vi.fn(),
    cancelTrigger: vi.fn(),
    navigateManually: vi.fn(),
    isAutoScrolling: false,
  }),
}));

vi.mock('../../components/ScrollNavigationIndicator', () => ({
  default: () => null,
}));

vi.mock('../../components/SEOHead', () => ({
  default: () => null,
}));

vi.mock('../../sections/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../../sections/Dashboard', () => ({
  default: () => <div data-testid="dashboard-content">Dashboard</div>,
}));

vi.mock('../../utils/chartsLegends', () => ({
  CustomTick: () => null,
}));

// Import AFTER mocks
import DashboardPage from '../../pages/DashboardPage';

describe('DashboardPage — Loading States', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockAuth.userData = null;
    mockAuth.error = null;
    mockAuth.retryFetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

  it('should show loading spinner when userData is null', () => {
    renderPage();
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
  });

  it('should NOT show dashboard content when userData is null', () => {
    renderPage();
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
  });

  it('loading screen should have explicit background color (not transparent)', () => {
    const { container } = renderPage();
    const loadingDiv = container.firstChild;
    expect(loadingDiv.style.backgroundColor).toBeTruthy();
    expect(loadingDiv.style.backgroundColor).not.toBe('');
    expect(loadingDiv.style.backgroundColor).not.toBe('transparent');
  });

  it('loading text should have visible color (not white on light bg)', () => {
    const { container } = renderPage();
    const loadingDiv = container.firstChild;
    // In dark mode (our mock), both bgColor and textColor should be set
    expect(loadingDiv.style.color).toBeTruthy();
    expect(loadingDiv.style.color).not.toBe('');
  });

  it('should show retry button after 15s timeout', () => {
    renderPage();

    // Initially: loading spinner, no retry
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();

    // Advance time by 15 seconds
    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(screen.getByText('Loading is taking longer than expected...')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should show error state when error is present', () => {
    mockAuth.error = new Error('API Error');
    renderPage();

    expect(screen.getByText('Error loading data.')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('retry button should call retryFetch', () => {
    mockAuth.error = new Error('API Error');
    renderPage();

    const retryBtn = screen.getByText('Retry');
    retryBtn.click();

    expect(mockAuth.retryFetch).toHaveBeenCalled();
  });

  it('retry button should call window.location.reload if retryFetch is missing', () => {
    mockAuth.error = new Error('API Error');
    mockAuth.retryFetch = null;

    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    renderPage();

    const retryBtn = screen.getByText('Retry');
    retryBtn.click();

    expect(reloadMock).toHaveBeenCalled();
  });

  it('should show dashboard when userData is available', () => {
    mockAuth.userData = { userId: 'test', balances: [] };
    renderPage();

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
  });
});

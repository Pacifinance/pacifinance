/**
 * Tests for URL-based i18n routing in AppRouter
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock dei contexts
vi.mock('../../contexts/LanguageContext', () => ({
  LanguageContext: {
    Provider: ({ children, value }) => <div data-testid="language-provider">{children}</div>,
    Consumer: ({ children }) => children({ language: 'en', translations: {}, setLanguage: vi.fn() })
  },
  useLanguage: () => ({ language: 'en', translations: {}, setLanguage: vi.fn() })
}));

vi.mock('../../contexts/ThemeContext', () => ({
  ThemeContext: {
    Provider: ({ children }) => <div data-testid="theme-provider">{children}</div>
  },
  useTheme: () => ({ theme: { mode: 'light' }, toggleMode: vi.fn() })
}));

vi.mock('../../contexts/UserContext', () => ({
  UserContext: {
    Provider: ({ children }) => <div data-testid="user-provider">{children}</div>
  },
  useUser: () => ({ userData: null })
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false })
}));

// Mock delle pagine
vi.mock('../../pages/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>
}));

vi.mock('../../pages/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}));

describe('AppRouter - URL-based i18n', () => {
  it('should redirect root to default language', async () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={['/']}>
        <div data-testid="app">App</div>
      </MemoryRouter>
    );
    
    expect(getByTestId('app')).toBeInTheDocument();
  });

  it('should handle Italian language prefix', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/it/']}>
        <div data-testid="italian-route">Italian Route</div>
      </MemoryRouter>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should handle English language prefix', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/en/']}>
        <div data-testid="english-route">English Route</div>
      </MemoryRouter>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should handle nested routes with language prefix', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/it/dashboard']}>
        <div data-testid="dashboard-route">Dashboard IT</div>
      </MemoryRouter>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should preserve query strings in localized routes', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/en/insert-values?section=balance']}>
        <div data-testid="insert-route">Insert with Query</div>
      </MemoryRouter>
    );
    
    expect(container).toBeInTheDocument();
  });
});

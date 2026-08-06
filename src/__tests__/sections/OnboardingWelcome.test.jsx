/**
 * Tests for OnboardingWelcome Component
 * Validates the onboarding flow for new users with no data
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import { CurrencyContext } from '../../contexts/CurrencyContext';

// Mock MUI icons to avoid EMFILE issues on Windows
vi.mock('@mui/icons-material', () => ({
  AccountBalance: (props) => <span data-testid="icon-bank" {...props} />,
  TrendingUp: (props) => <span data-testid="icon-invest" {...props} />,
  Receipt: (props) => <span data-testid="icon-expense" {...props} />,
  Person: (props) => <span data-testid="icon-profile" {...props} />,
  CheckCircle: (props) => <span data-testid="icon-check" {...props} />,
  ArrowForward: (props) => <span data-testid="icon-arrow" {...props} />,
  NotificationsActiveOutlined: (props) => <span data-testid="icon-reminder" {...props} />,
}));

// Mock useLocalizedNavigate
const mockNavigate = vi.fn();
vi.mock('../../hooks/useLocalizedNavigate', () => ({
  useLocalizedNavigate: () => mockNavigate,
}));

// Import component after mocks
import OnboardingWelcome from '../../sections/OnboardingWelcome';

const mockTranslations = {
  onboarding: {
    welcomeTitle: 'Welcome to Pacifinance!',
    welcomeSubtitle: 'Complete these 4 steps to unlock your full financial dashboard.',
    stepsCompleted: 'completed',
    step1Title: 'Complete Profile',
    step1Desc: 'Set nationality, job, and age.',
    step1Action: 'Go to Profile',
    step2Title: 'Add Your Balance',
    step2Desc: 'Enter your current assets.',
    step2Action: 'Insert Balance',
    step3Title: 'Track Outflows',
    step3Desc: 'Add your monthly outflows.',
    step3Action: 'Add Outflows',
    step4Title: 'Record Income',
    step4Desc: 'Log your income sources.',
    step4Action: 'Add Income',
    done: '✓ Done',
    quickTip: 'Tip: Start with your balance!',
    dismiss: 'Dismiss guide',
  },
};

const mockCurrencyContext = {
  currencySymbol: '€',
  formatAmount: (v) => `€${v}`,
  formatNumber: (v) => `${v}`,
  fromEUR: (v) => v,
  toEUR: (v) => v,
  currency: 'EUR',
};

const darkTheme = {
  mode: 'dark',
  backgroundColor: '#222831',
  textColor: '#e0e0e0',
  secondaryColor: '#079164',
};

const lightTheme = {
  mode: 'light',
  backgroundColor: '#f5f5f5',
  textColor: '#333333',
  secondaryColor: '#079164',
};

// New user with no data at all
const emptyUserData = {
  userId: 'new-user-001',
  userType: 'regular',
  username: '',
  profileCompletionPercentage: 0,
  profile: {
    nationality: { key: -1, value: '' },
    job: { key: -1, value: '' },
    age: { key: -1, value: '' },
  },
  balances: [{ date: '2026-02-01', balance: { totalValue: 0, bank: 0, cash: 0 } }],
  outflows: { allOutflows: [], outflowsArray: [] },
  incomes: { allIncomes: [], incomesArray: [] },
  tags: {},
  rankings: {},
  goals: [],
  limits: {},
  assets: [],
};

// User with profile completed
const profileCompleteUser = {
  ...emptyUserData,
  profileCompletionPercentage: 50,
  profile: {
    nationality: { key: 107, value: 'Italia' },
    job: { key: 1, value: 'IT' },
    age: { key: 3, value: '30-35' },
    completionPercentage: 50,
  },
};

// User with balance data (bank != totalValue so it's detected as real data)
const userWithBalance = {
  ...emptyUserData,
  balances: [{ date: '2026-02-01', balance: { totalValue: 5000, bank: 3000, cash: 2000 } }],
};

// User with outflows
const userWithOutflows = {
  ...emptyUserData,
  outflows: {
    allOutflows: [[{ amount: 100, isExpense: true }]],
    outflowsArray: [100],
  },
};

// User with incomes
const userWithIncomes = {
  ...emptyUserData,
  incomes: {
    allIncomes: [[{ amount: 2000, isExpense: false }]],
    incomesArray: [2000],
  },
};

// User with all data (should auto-dismiss)
const completeUser = {
  ...emptyUserData,
  profileCompletionPercentage: 85,
  profile: {
    nationality: { key: 107, value: 'Italia' },
    job: { key: 1, value: 'IT' },
    age: { key: 3, value: '30-35' },
    completionPercentage: 85,
  },
  balances: [{ date: '2026-02-01', balance: { totalValue: 10000, bank: 8000, cash: 2000 } }],
  outflows: {
    allOutflows: [[{ amount: 500, isExpense: true }]],
    outflowsArray: [500],
  },
  incomes: {
    allIncomes: [[{ amount: 3000, isExpense: false }]],
    incomesArray: [3000],
  },
};

const renderOnboarding = ({ userData = emptyUserData, theme = darkTheme, language = 'en' } = {}) => {
  return render(
    <MemoryRouter>
      <LanguageContext.Provider
        value={{
          language,
          translations: mockTranslations,
          setLanguage: vi.fn(),
          toggleLanguage: vi.fn(),
        }}
      >
        <CurrencyContext.Provider value={mockCurrencyContext}>
          <OnboardingWelcome userData={userData} theme={theme} />
        </CurrencyContext.Provider>
      </LanguageContext.Provider>
    </MemoryRouter>
  );
};

describe('OnboardingWelcome', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Rendering', () => {
    it('should render welcome title and subtitle', () => {
      renderOnboarding();
      expect(screen.getByText('Welcome to Pacifinance!')).toBeInTheDocument();
      expect(screen.getByText(/Complete these 4 steps/)).toBeInTheDocument();
    });

    it('should render all 4 step cards', () => {
      renderOnboarding();
      expect(screen.getByText('Complete Profile')).toBeInTheDocument();
      expect(screen.getByText('Add Your Balance')).toBeInTheDocument();
      expect(screen.getByText('Track Outflows')).toBeInTheDocument();
      expect(screen.getByText('Record Income')).toBeInTheDocument();
    });

    it('should render step descriptions', () => {
      renderOnboarding();
      expect(screen.getByText('Set nationality, job, and age.')).toBeInTheDocument();
      expect(screen.getByText('Enter your current assets.')).toBeInTheDocument();
      expect(screen.getByText('Add your monthly outflows.')).toBeInTheDocument();
      expect(screen.getByText('Log your income sources.')).toBeInTheDocument();
    });

    it('should render progress counter showing 0/4', () => {
      renderOnboarding();
      expect(screen.getByText(/0\/4/)).toBeInTheDocument();
      expect(screen.getByText(/completed/)).toBeInTheDocument();
    });

    it('should render the quick tip', () => {
      renderOnboarding();
      expect(screen.getByText(/Tip: Start with your balance!/)).toBeInTheDocument();
    });

    it('should render the dismiss button', () => {
      renderOnboarding();
      expect(screen.getByText('Dismiss guide')).toBeInTheDocument();
    });

    it('should render in light theme', () => {
      renderOnboarding({ theme: lightTheme });
      expect(screen.getByText('Welcome to Pacifinance!')).toBeInTheDocument();
    });
  });

  describe('Step Completion Detection', () => {
    it('should show 0/4 for a completely empty user', () => {
      renderOnboarding({ userData: emptyUserData });
      expect(screen.getByText(/0\/4/)).toBeInTheDocument();
    });

    it('should show 1/4 when profile is completed (>30%)', () => {
      renderOnboarding({ userData: profileCompleteUser });
      expect(screen.getByText(/1\/4/)).toBeInTheDocument();
    });

    it('should show 1/4 when balance data exists', () => {
      renderOnboarding({ userData: userWithBalance });
      expect(screen.getByText(/1\/4/)).toBeInTheDocument();
    });

    it('should show 1/4 when outflows exist', () => {
      renderOnboarding({ userData: userWithOutflows });
      expect(screen.getByText(/1\/4/)).toBeInTheDocument();
    });

    it('should show 1/4 when incomes exist', () => {
      renderOnboarding({ userData: userWithIncomes });
      expect(screen.getByText(/1\/4/)).toBeInTheDocument();
    });

    it('should mark completed steps with ✓ Done', () => {
      renderOnboarding({ userData: profileCompleteUser });
      expect(screen.getByText('✓ Done')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to /profile when step 1 is clicked', () => {
      renderOnboarding();
      fireEvent.click(screen.getByText('Complete Profile'));
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('should navigate to /insert-values?section=balance when step 2 is clicked', () => {
      renderOnboarding();
      fireEvent.click(screen.getByText('Add Your Balance'));
      expect(mockNavigate).toHaveBeenCalledWith('/insert-values?section=balance');
    });

    it('should navigate to /insert-values?section=outflow when step 3 is clicked', () => {
      renderOnboarding();
      fireEvent.click(screen.getByText('Track Outflows'));
      expect(mockNavigate).toHaveBeenCalledWith('/insert-values?section=outflow');
    });

    it('should navigate to /insert-values?section=income when step 4 is clicked', () => {
      renderOnboarding();
      fireEvent.click(screen.getByText('Record Income'));
      expect(mockNavigate).toHaveBeenCalledWith('/insert-values?section=income');
    });

    it('should not navigate when clicking a completed step', () => {
      renderOnboarding({ userData: profileCompleteUser });
      // Step 1 (Profile) is complete — clicking it should NOT navigate
      const doneText = screen.getByText('✓ Done');
      const stepCard = doneText.closest('[data-umami-event]');
      if (stepCard) fireEvent.click(stepCard);
      expect(mockNavigate).not.toHaveBeenCalledWith('/profile');
    });

    it('should render the bonus reminders step and navigate to /settings when clicked', () => {
      renderOnboarding();
      expect(screen.getByText('Turn on reminders')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Turn on reminders'));
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });
  });

  describe('Dismiss Behavior', () => {
    it('should dismiss when dismiss button is clicked', () => {
      renderOnboarding();
      expect(screen.getByText('Welcome to Pacifinance!')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Dismiss guide'));

      expect(screen.queryByText('Welcome to Pacifinance!')).not.toBeInTheDocument();
    });

    it('should persist dismiss state in localStorage', () => {
      renderOnboarding();
      fireEvent.click(screen.getByText('Dismiss guide'));
      expect(localStorage.setItem).toHaveBeenCalledWith('onboarding_dismissed', 'true');
    });

    it('should not render if previously dismissed (localStorage)', async () => {
      localStorage.getItem.mockReturnValueOnce('true');
      renderOnboarding();
      await waitFor(() => {
        expect(screen.queryByText('Welcome to Pacifinance!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Auto-dismiss on Completion', () => {
    it('should not render when all 4 steps are completed', () => {
      renderOnboarding({ userData: completeUser });
      expect(screen.queryByText('Welcome to Pacifinance!')).not.toBeInTheDocument();
    });

    it('should save dismissed state to localStorage when all steps complete', () => {
      renderOnboarding({ userData: completeUser });
      expect(localStorage.setItem).toHaveBeenCalledWith('onboarding_dismissed', 'true');
    });
  });

  describe('Fallback Translations', () => {
    it('should render with fallback text when translations are missing', () => {
      render(
        <MemoryRouter>
          <LanguageContext.Provider
            value={{
              language: 'en',
              translations: {},
              setLanguage: vi.fn(),
              toggleLanguage: vi.fn(),
            }}
          >
            <CurrencyContext.Provider value={mockCurrencyContext}>
              <OnboardingWelcome userData={emptyUserData} theme={darkTheme} />
            </CurrencyContext.Provider>
          </LanguageContext.Provider>
        </MemoryRouter>
      );
      // Fallback texts should be rendered
      expect(screen.getByText('See all your money in one place')).toBeInTheDocument();
      expect(screen.getByText('Complete Profile')).toBeInTheDocument();
      expect(screen.getByText('Add Your Balance')).toBeInTheDocument();
    });
  });

  describe('Umami Analytics', () => {
    it('should have umami tracking attributes on step cards', () => {
      renderOnboarding();
      const stepCards = document.querySelectorAll('[data-umami-event]');
      expect(stepCards.length).toBeGreaterThanOrEqual(4);
      expect(stepCards[0].getAttribute('data-umami-event')).toBe('onboarding-step-1');
      expect(stepCards[1].getAttribute('data-umami-event')).toBe('onboarding-step-2');
      expect(stepCards[2].getAttribute('data-umami-event')).toBe('onboarding-step-3');
      expect(stepCards[3].getAttribute('data-umami-event')).toBe('onboarding-step-4');
    });

    it('should have umami tracking on dismiss button', () => {
      renderOnboarding();
      const dismissBtn = screen.getByText('Dismiss guide');
      expect(dismissBtn.getAttribute('data-umami-event')).toBe('onboarding-dismiss');
    });
  });
});

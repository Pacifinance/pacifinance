/**
 * Tests for MockAuthContext
 * Mock authentication and user data for development/testing
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockUserData, MockAuthProvider, useMockAuth } from '../../contexts/MockAuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';

// Test component that uses the context
const TestConsumer = () => {
  const { userData, isAuthenticated, isLoading } = useMockAuth();
  
  return (
    <div>
      <span data-testid="is-authenticated">{isAuthenticated ? 'true' : 'false'}</span>
      <span data-testid="is-loading">{isLoading ? 'loading' : 'loaded'}</span>
      <span data-testid="user-id">{userData?.userId || 'no-user'}</span>
      <span data-testid="user-type">{userData?.userType || 'no-type'}</span>
    </div>
  );
};

describe('MockAuthContext', () => {
  describe('mockUserData structure', () => {
    it('should have userId', () => {
      expect(mockUserData.userId).toBeDefined();
      expect(typeof mockUserData.userId).toBe('string');
    });

    it('should have userType', () => {
      expect(mockUserData.userType).toBeDefined();
      expect(['regular', 'premium', 'test', 'demo']).toContain(mockUserData.userType);
    });

    it('should have username', () => {
      expect(mockUserData.username).toBeDefined();
      expect(typeof mockUserData.username).toBe('string');
    });

    it('should have profile object', () => {
      expect(mockUserData.profile).toBeDefined();
      expect(mockUserData.profile.nationality).toBeDefined();
      expect(mockUserData.profile.job).toBeDefined();
    });

    it('should have balances array', () => {
      expect(mockUserData.balances).toBeDefined();
      expect(Array.isArray(mockUserData.balances)).toBe(true);
      expect(mockUserData.balances.length).toBeGreaterThan(0);
    });

    it('should have current month balance at index 0', () => {
      const currentBalance = mockUserData.balances[0];
      expect(currentBalance).toBeDefined();
      expect(currentBalance.date).toBeDefined();
      expect(currentBalance.balance).toBeDefined();
    });

    it('should have balance properties', () => {
      const balance = mockUserData.balances[0].balance;
      expect(balance.bank).toBeDefined();
      expect(balance.cash).toBeDefined();
      expect(balance.totalValue).toBeDefined();
    });

    it('should have expenses object', () => {
      expect(mockUserData.expenses).toBeDefined();
      expect(mockUserData.expenses.allOutflows).toBeDefined();
      expect(mockUserData.expenses.outflowsArray).toBeDefined();
    });

    it('should have incomes object', () => {
      expect(mockUserData.incomes).toBeDefined();
      expect(mockUserData.incomes.allIncomes).toBeDefined();
      expect(mockUserData.incomes.incomesArray).toBeDefined();
    });

    it('should have rankings object', () => {
      expect(mockUserData.rankings).toBeDefined();
      expect(mockUserData.rankings.balance).toBeDefined();
      expect(mockUserData.rankings.incomes).toBeDefined();
      expect(mockUserData.rankings.expenses).toBeDefined();
    });

    it('should have dates object', () => {
      expect(mockUserData.dates).toBeDefined();
      expect(mockUserData.dates.current).toBeDefined();
      expect(mockUserData.dates.preMonth).toBeDefined();
    });

    it('should have limits object', () => {
      expect(mockUserData.limits).toBeDefined();
      expect(mockUserData.limits.monthlySpendingLimit).toBeDefined();
    });

    it('should have goals array', () => {
      expect(mockUserData.goals).toBeDefined();
      expect(Array.isArray(mockUserData.goals)).toBe(true);
    });

    it('should have assets array', () => {
      expect(mockUserData.assets).toBeDefined();
      expect(Array.isArray(mockUserData.assets)).toBe(true);
    });

    it('should have 13 months of balance data', () => {
      // Current month + 12 previous months
      expect(mockUserData.balances.length).toBeGreaterThanOrEqual(13);
    });

    it('should have 12 months of chart data', () => {
      expect(mockUserData.last12MonthsData).toBeDefined();
      expect(mockUserData.last12MonthsData.length).toBe(12);
    });
  });

  describe('MockAuthProvider', () => {
    it('should provide isAuthenticated as true', () => {
      render(
        <LanguageProvider>
          <MockAuthProvider>
            <TestConsumer />
          </MockAuthProvider>
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    it('should provide isLoading as false', () => {
      render(
        <LanguageProvider>
          <MockAuthProvider>
            <TestConsumer />
          </MockAuthProvider>
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('is-loading')).toHaveTextContent('loaded');
    });

    it('should provide userData with userId', () => {
      render(
        <LanguageProvider>
          <MockAuthProvider>
            <TestConsumer />
          </MockAuthProvider>
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('user-id')).not.toHaveTextContent('no-user');
    });

    it('should provide userData with userType', () => {
      render(
        <LanguageProvider>
          <MockAuthProvider>
            <TestConsumer />
          </MockAuthProvider>
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('user-type')).not.toHaveTextContent('no-type');
    });
  });

  describe('useMockAuth hook', () => {
    it('should throw error when used outside MockAuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = console.error;
      console.error = () => {};
      
      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useMockAuth must be used within a MockAuthProvider');
      
      console.error = consoleError;
    });
  });

  describe('mockUserData data integrity', () => {
    it('outflowsArray should have 13 elements', () => {
      expect(mockUserData.expenses.outflowsArray.length).toBe(13);
      expect(mockUserData.outflowsArray.length).toBe(13);
    });

    it('incomesArray should have 13 elements', () => {
      expect(mockUserData.incomes.incomesArray.length).toBe(13);
      expect(mockUserData.incomesArray.length).toBe(13);
    });

    it('rankings should be between 0 and 100', () => {
      expect(mockUserData.rankings.balance).toBeGreaterThanOrEqual(0);
      expect(mockUserData.rankings.balance).toBeLessThanOrEqual(100);
      expect(mockUserData.rankings.incomes).toBeGreaterThanOrEqual(0);
      expect(mockUserData.rankings.incomes).toBeLessThanOrEqual(100);
    });

    it('balance values should be non-negative', () => {
      const balance = mockUserData.balances[0].balance;
      expect(balance.bank).toBeGreaterThanOrEqual(0);
      expect(balance.cash).toBeGreaterThanOrEqual(0);
      expect(balance.totalValue).toBeGreaterThanOrEqual(0);
    });

    it('goals should have required properties', () => {
      mockUserData.goals.forEach(goal => {
        expect(goal.id).toBeDefined();
        expect(goal.name).toBeDefined();
        expect(goal.target).toBeDefined();
        expect(goal.current).toBeDefined();
      });
    });

    it('assets should have required properties', () => {
      mockUserData.assets.forEach(asset => {
        expect(asset.typology).toBeDefined();
        expect(asset.value).toBeDefined();
      });
    });
  });
});

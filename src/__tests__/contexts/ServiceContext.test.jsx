/**
 * Tests for ServiceContext — the DI container.
 *
 * Validates:
 *  - ServiceProvider creates all services by default
 *  - useServices hook throws when used outside a provider
 *  - Override services are respected (for testing)
 *  - createServices factory produces complete service objects
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ServiceProvider, useServices, createServices, ServiceContext } from '../../contexts/ServiceContext';

// Test consumer that displays service availability
const ServiceConsumer = () => {
  const services = useServices();

  return (
    <div>
      <span data-testid="has-api-client">{services.apiClient ? 'yes' : 'no'}</span>
      <span data-testid="has-user-service">{services.userService ? 'yes' : 'no'}</span>
      <span data-testid="has-finance-service">{services.financeService ? 'yes' : 'no'}</span>
      <span data-testid="has-ranking-service">{services.rankingService ? 'yes' : 'no'}</span>
      <span data-testid="has-stats-service">{services.statsService ? 'yes' : 'no'}</span>
      <span data-testid="user-service-type">{typeof services.userService.checkSession}</span>
      <span data-testid="finance-service-type">{typeof services.financeService.getBalances}</span>
      <span data-testid="ranking-service-type">{typeof services.rankingService.getAllRankings}</span>
      <span data-testid="stats-service-type">{typeof services.statsService.getAverages}</span>
    </div>
  );
};

describe('ServiceContext', () => {
  describe('ServiceProvider', () => {
    it('should provide all services to children', () => {
      render(
        <ServiceProvider>
          <ServiceConsumer />
        </ServiceProvider>
      );

      expect(screen.getByTestId('has-api-client')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-user-service')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-finance-service')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-ranking-service')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-stats-service')).toHaveTextContent('yes');
    });

    it('should expose service methods of correct types', () => {
      render(
        <ServiceProvider>
          <ServiceConsumer />
        </ServiceProvider>
      );

      expect(screen.getByTestId('user-service-type')).toHaveTextContent('function');
      expect(screen.getByTestId('finance-service-type')).toHaveTextContent('function');
      expect(screen.getByTestId('ranking-service-type')).toHaveTextContent('function');
      expect(screen.getByTestId('stats-service-type')).toHaveTextContent('function');
    });

    it('should accept override services for testing', () => {
      const mockServices = {
        apiClient: { post: vi.fn() },
        userService: { checkSession: vi.fn() },
        financeService: { getBalances: vi.fn() },
        rankingService: { getAllRankings: vi.fn() },
        statsService: { getAverages: vi.fn() },
      };

      render(
        <ServiceProvider services={mockServices}>
          <ServiceConsumer />
        </ServiceProvider>
      );

      expect(screen.getByTestId('has-api-client')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-user-service')).toHaveTextContent('yes');
    });
  });

  describe('useServices', () => {
    it('should throw when used outside ServiceProvider', () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<ServiceConsumer />);
      }).toThrow('useServices must be used within a <ServiceProvider>');

      spy.mockRestore();
    });
  });

  describe('createServices', () => {
    it('should create all service objects', () => {
      const services = createServices();

      expect(services.apiClient).toBeDefined();
      expect(services.userService).toBeDefined();
      expect(services.financeService).toBeDefined();
      expect(services.rankingService).toBeDefined();
      expect(services.statsService).toBeDefined();
    });

    it('should accept a custom apiClient', () => {
      const customClient = { post: vi.fn(), get: vi.fn() };
      const services = createServices(customClient);

      expect(services.apiClient).toBe(customClient);
    });

    it('all services should have expected methods', () => {
      const services = createServices();

      // userService
      expect(typeof services.userService.checkSession).toBe('function');
      expect(typeof services.userService.getTags).toBe('function');
      expect(typeof services.userService.getUserInfo).toBe('function');
      expect(typeof services.userService.updateProfile).toBe('function');
      expect(typeof services.userService.login).toBe('function');
      expect(typeof services.userService.register).toBe('function');
      expect(typeof services.userService.logout).toBe('function');
      expect(typeof services.userService.deleteAccount).toBe('function');
      expect(typeof services.userService.changeUserId).toBe('function');
      expect(typeof services.userService.changePassword).toBe('function');
      expect(typeof services.userService.resetUsername).toBe('function');
      expect(typeof services.userService.saveGoals).toBe('function');

      // financeService
      expect(typeof services.financeService.getBalances).toBe('function');
      expect(typeof services.financeService.addBalance).toBe('function');
      expect(typeof services.financeService.getTransactions).toBe('function');
      expect(typeof services.financeService.addTransaction).toBe('function');
      expect(typeof services.financeService.deleteTransaction).toBe('function');

      // rankingService
      expect(typeof services.rankingService.getAllRankings).toBe('function');

      // statsService
      expect(typeof services.statsService.getAverages).toBe('function');
    });
  });

  describe('DI contract coverage', () => {
    it('mock services should work identically to real ones via Provider', async () => {
      const mockCheckSession = vi.fn().mockResolvedValue({ userId: 'test-123' });
      const mockGetBalances = vi.fn().mockResolvedValue([{ date: '2026-01' }]);

      const mockServices = {
        apiClient: {},
        userService: { checkSession: mockCheckSession },
        financeService: { getBalances: mockGetBalances },
        rankingService: { getAllRankings: vi.fn() },
        statsService: { getAverages: vi.fn() },
      };

      // A component that uses services
      const UsageComponent = () => {
        const { userService, financeService } = useServices();
        const [data, setData] = React.useState(null);

        React.useEffect(() => {
          (async () => {
            const user = await userService.checkSession();
            const balances = await financeService.getBalances();
            setData({ userId: user.userId, balanceCount: balances.length });
          })();
        }, [userService, financeService]);

        return data ? (
          <div>
            <span data-testid="userId">{data.userId}</span>
            <span data-testid="balanceCount">{data.balanceCount}</span>
          </div>
        ) : null;
      };

      render(
        <ServiceProvider services={mockServices}>
          <UsageComponent />
        </ServiceProvider>
      );

      // Wait for async effects
      await vi.waitFor(() => {
        expect(screen.getByTestId('userId')).toHaveTextContent('test-123');
      });

      expect(screen.getByTestId('balanceCount')).toHaveTextContent('1');
      expect(mockCheckSession).toHaveBeenCalledTimes(1);
      expect(mockGetBalances).toHaveBeenCalledTimes(1);
    });
  });
});

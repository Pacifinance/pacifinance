/**
 * ServiceContext — Dependency Injection container for PaciFinance services.
 *
 * This context provides all service instances to the React component tree.
 * Services are created with a shared API client, making it trivial to:
 *   - mock the entire API layer in tests
 *   - swap implementations (e.g. offline-first, different backends)
 *   - ensure consistent HTTP configuration (credentials, interceptors)
 *
 * ## Usage
 *
 * ```jsx
 * // In a component:
 * import { useServices } from '../contexts/ServiceContext';
 * const { userService, financeService } = useServices();
 * await userService.checkSession();
 * ```
 *
 * ## Testing
 *
 * ```jsx
 * const mockServices = {
 *   userService:    { checkSession: vi.fn().mockResolvedValue({ userId: '1' }) },
 *   financeService: { getBalances: vi.fn().mockResolvedValue([])             },
 * };
 *
 * render(
 *   <ServiceContext.Provider value={mockServices}>
 *     <MyComponent />
 *   </ServiceContext.Provider>
 * );
 * ```
 *
 * @module contexts/ServiceContext
 */

import React, { createContext, useContext, useMemo } from 'react';
import { createApiClient } from '../services/apiClient';
import { createUserService } from '../services/userService';
import { createFinanceService } from '../services/financeService';
import { createRankingService } from '../services/rankingService';
import { createStatsService } from '../services/statsService';

const ServiceContext = createContext(null);

/**
 * Hook to access all injected services.
 *
 * @returns {{ apiClient: import('axios').AxiosInstance, userService: Object, financeService: Object, rankingService: Object, statsService: Object }}
 */
export const useServices = () => {
  const ctx = useContext(ServiceContext);
  if (!ctx) {
    throw new Error(
      'useServices must be used within a <ServiceProvider>. ' +
      'Wrap your app (or test) with <ServiceProvider> or provide a mock value via <ServiceContext.Provider>.'
    );
  }
  return ctx;
};

/**
 * Create the default set of services.
 * Exported so tests can call it with a custom apiClient.
 *
 * @param {import('axios').AxiosInstance} [client] - Optional custom client
 * @returns {Object} All service instances
 */
export const createServices = (client) => {
  const apiClient = client || createApiClient();
  return {
    apiClient,
    userService: createUserService(apiClient),
    financeService: createFinanceService(apiClient),
    rankingService: createRankingService(apiClient),
    statsService: createStatsService(apiClient),
  };
};

/**
 * ServiceProvider — injects real (or test) service instances into the tree.
 *
 * @param {Object} props
 * @param {Object} [props.services] - Override services (for testing)
 * @param {React.ReactNode} props.children
 */
export const ServiceProvider = ({ services: overrideServices, children }) => {
  const value = useMemo(
    () => overrideServices || createServices(),
    [overrideServices]
  );

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};

export { ServiceContext };
export default ServiceContext;

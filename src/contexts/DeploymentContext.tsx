import React, { createContext, useContext, useEffect, useState } from 'react';
import { useServices } from './ServiceContext';

interface DeploymentContextValue {
  /** true until proven otherwise - see the fetch effect below for why. */
  selfHosted: boolean;
}

const DeploymentContext = createContext<DeploymentContextValue | undefined>(undefined);

export const useDeployment = (): DeploymentContextValue => {
  const ctx = useContext(DeploymentContext);
  if (!ctx) {
    throw new Error('useDeployment must be used within a <DeploymentProvider>.');
  }
  return ctx;
};

/** Same check DevModeProvider.tsx uses - duplicated rather than shared because
 * DeploymentProvider sits outside DevModeProvider in the tree (see
 * .github/instructions/contexts.instructions.md) and must independently avoid
 * ever calling the real backend in mock/demo mode. */
const isDevMockMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  const hasDevParam = urlParams.get('dev') === 'true';
  const hasLocalStorageFlag = window.localStorage.getItem('pacifinance-dev-mode') === 'true';
  return import.meta.env.DEV && (hasDevParam || hasLocalStorageFlag);
};

interface DeploymentProviderProps {
  children: React.ReactNode;
}

export const DeploymentProvider = ({ children }: DeploymentProviderProps) => {
  const { deploymentService } = useServices();
  // Fails safe to self-hosted (the more conservative/honest state, matching
  // the backend's own default in server/src/libs/deploymentMode.ts) while
  // loading, on fetch failure, and in mock/demo mode where no request is
  // made at all.
  const [selfHosted, setSelfHosted] = useState(true);

  useEffect(() => {
    if (isDevMockMode()) return;

    let cancelled = false;
    deploymentService
      .getConfig()
      .then((config) => {
        if (!cancelled) setSelfHosted(config.selfHosted);
      })
      .catch(() => {
        // Network error, backend unreachable, etc. - keep the safe default.
      });

    return () => {
      cancelled = true;
    };
  }, [deploymentService]);

  return (
    <DeploymentContext.Provider value={{ selfHosted }}>
      {children}
    </DeploymentContext.Provider>
  );
};

export { DeploymentContext };
export default DeploymentContext;

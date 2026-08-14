import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DeploymentProvider, useDeployment } from '../../contexts/DeploymentContext';
import { ServiceContext } from '../../contexts/ServiceContext';

const TestConsumer = () => {
  const { selfHosted } = useDeployment();
  return <span data-testid="self-hosted">{String(selfHosted)}</span>;
};

const renderWithServices = (deploymentService) => render(
  <ServiceContext.Provider value={{ deploymentService }}>
    <DeploymentProvider>
      <TestConsumer />
    </DeploymentProvider>
  </ServiceContext.Provider>
);

describe('DeploymentContext', () => {
  beforeEach(() => {
    window.localStorage.getItem.mockReturnValue(null);
  });

  it('defaults to self-hosted before the fetch resolves', () => {
    const deploymentService = { getConfig: vi.fn(() => new Promise(() => {})) };
    renderWithServices(deploymentService);

    expect(screen.getByTestId('self-hosted')).toHaveTextContent('true');
  });

  it('switches to hosted once the config fetch resolves', async () => {
    const deploymentService = { getConfig: vi.fn().mockResolvedValue({ selfHosted: false }) };
    renderWithServices(deploymentService);

    await waitFor(() => {
      expect(screen.getByTestId('self-hosted')).toHaveTextContent('false');
    });
  });

  it('stays self-hosted (fail-safe) when the config fetch rejects', async () => {
    const deploymentService = { getConfig: vi.fn().mockRejectedValue(new Error('network error')) };
    renderWithServices(deploymentService);

    await waitFor(() => {
      expect(deploymentService.getConfig).toHaveBeenCalled();
    });
    expect(screen.getByTestId('self-hosted')).toHaveTextContent('true');
  });

  it('never calls the backend in mock/dev mode', () => {
    window.localStorage.getItem.mockReturnValue('true');
    const deploymentService = { getConfig: vi.fn().mockResolvedValue({ selfHosted: false }) };
    renderWithServices(deploymentService);

    expect(deploymentService.getConfig).not.toHaveBeenCalled();
    expect(screen.getByTestId('self-hosted')).toHaveTextContent('true');
  });
});

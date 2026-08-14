import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDeploymentService } from '../../services/deploymentService';

const createMockClient = () => ({
  get: vi.fn(),
});

describe('deploymentService', () => {
  let mockClient;
  let service;

  beforeEach(() => {
    mockClient = createMockClient();
    service = createDeploymentService(mockClient);
  });

  it('reads deployment config', async () => {
    mockClient.get.mockResolvedValue({ data: { selfHosted: true } });

    const result = await service.getConfig();

    expect(mockClient.get).toHaveBeenCalledWith('/api/config');
    expect(result).toEqual({ selfHosted: true });
  });
});

/**
 * Deployment Service — reads the static app config the frontend needs
 * before knowing anything about the user, currently just whether this
 * instance is self-hosted or the official pacifinance.com deployment.
 *
 * @module services/deploymentService
 */
import type { AxiosInstance } from 'axios';

export interface DeploymentConfig {
  selfHosted: boolean;
}

export interface DeploymentService {
  getConfig(): Promise<DeploymentConfig>;
}

export const createDeploymentService = (apiClient: AxiosInstance): DeploymentService => ({
  async getConfig() {
    const res = await apiClient.get<DeploymentConfig>('/api/config');
    return res.data;
  },
});

export default createDeploymentService;

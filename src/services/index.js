/**
 * Services barrel export.
 *
 * Import from 'services/' instead of individual files:
 *   import { createUserService, createApiClient } from '../services';
 *
 * @module services
 */
export { default as apiClient, createApiClient } from './apiClient';
export { createUserService } from './userService';
export { createFinanceService } from './financeService';
export { createRankingService } from './rankingService';
export { createStatsService } from './statsService';

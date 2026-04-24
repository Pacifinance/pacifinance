/**
 * Services barrel export.
 *
 * Import from 'services/' instead of individual files:
 *   import { createUserService, createApiClient } from '../services';
 *
 * @module services
 */
export { default as apiClient, createApiClient } from './apiClient';
export type { CreateApiClientOptions } from './apiClient';

export { createUserService } from './userService';
export type { UserService } from './userService';

export { createFinanceService } from './financeService';
export type { FinanceService } from './financeService';

export { createRankingService } from './rankingService';
export type { RankingService, RankingSnapshot } from './rankingService';

export { createStatsService } from './statsService';
export type { StatsService, AveragesSnapshot } from './statsService';

export { createPricesService } from './pricesService';
export type { PricesService } from './pricesService';

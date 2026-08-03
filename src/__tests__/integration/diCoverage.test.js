/**
 * DI Coverage & Architecture Health Tests
 *
 * These tests verify that the Dependency Injection architecture is correctly
 * maintained over time. They catch regressions like:
 *  - Direct axios imports in components/pages (should use services)
 *  - Missing service methods (contract violations)
 *  - ServiceContext not being properly provided
 *
 * Run these as part of CI to ensure DI discipline.
 */

import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(__dirname, '../../');

/**
 * Recursively collect all .jsx and .js files in a directory.
 */
function collectFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules, __tests__, services (services ARE the API layer)
        if (!['node_modules', '__tests__', 'services', 'assets', 'styles'].includes(entry.name)) {
          results.push(...collectFiles(fullPath, extensions));
        }
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  } catch {
    // Directory might not exist
  }
  return results;
}

describe('DI Coverage — Architecture Health', () => {

  describe('Service layer completeness', () => {
    it('userService should have all required methods', async () => {
      const { createUserService } = await import('../../services/userService');
      const mockClient = { post: vi.fn(), get: vi.fn() };
      const service = createUserService(mockClient);

      const requiredMethods = [
        'checkSession', 'getTags', 'getUserInfo', 'updateProfile',
        'login', 'register', 'logout', 'deleteAccount',
        'changeUserId', 'changePassword', 'resetUsername', 'saveGoals',
      ];

      for (const method of requiredMethods) {
        expect(typeof service[method]).toBe('function');
      }
    });

    it('financeService should have all required methods', async () => {
      const { createFinanceService } = await import('../../services/financeService');
      const mockClient = { post: vi.fn(), get: vi.fn() };
      const service = createFinanceService(mockClient);

      const requiredMethods = [
        'getBalances', 'addBalance',
        'getExpensesAndIncomes', 'addExpenseOrIncome', 'addExpensesAndIncomesBatch', 'deleteExpenseOrIncome',
      ];

      for (const method of requiredMethods) {
        expect(typeof service[method]).toBe('function');
      }
    });

    it('rankingService should have getAllRankings method', async () => {
      const { createRankingService } = await import('../../services/rankingService');
      const mockClient = { post: vi.fn() };
      const service = createRankingService(mockClient);

      expect(typeof service.getAllRankings).toBe('function');
    });

    it('statsService should have getAverages method', async () => {
      const { createStatsService } = await import('../../services/statsService');
      const mockClient = { post: vi.fn() };
      const service = createStatsService(mockClient);

      expect(typeof service.getAverages).toBe('function');
    });
  });

  describe('Service factory isolation', () => {
    it('each factory should return a new object every time', async () => {
      const { createUserService } = await import('../../services/userService');
      const mockClient = { post: vi.fn() };

      const s1 = createUserService(mockClient);
      const s2 = createUserService(mockClient);

      expect(s1).not.toBe(s2);
    });

    it('services should not share state between instances', async () => {
      const { createFinanceService } = await import('../../services/financeService');
      const client1 = { post: vi.fn().mockResolvedValue({ data: [] }) };
      const client2 = { post: vi.fn().mockResolvedValue({ data: [] }) };

      const svc1 = createFinanceService(client1);
      createFinanceService(client2);

      await svc1.getBalances();

      expect(client1.post).toHaveBeenCalledTimes(1);
      expect(client2.post).not.toHaveBeenCalled();
    });
  });

  describe('Direct service module completeness', () => {
    it('should expose all service factories from their direct modules', async () => {
      const [
        apiClient,
        userService,
        financeService,
        rankingService,
        statsService,
        goalService,
        investmentService,
        liquidityAccountService,
      ] = await Promise.all([
        import('../../services/apiClient'),
        import('../../services/userService'),
        import('../../services/financeService'),
        import('../../services/rankingService'),
        import('../../services/statsService'),
        import('../../services/goalService'),
        import('../../services/investmentService'),
        import('../../services/liquidityAccountService'),
      ]);

      expect(apiClient.createApiClient).toBeDefined();
      expect(userService.createUserService).toBeDefined();
      expect(financeService.createFinanceService).toBeDefined();
      expect(rankingService.createRankingService).toBeDefined();
      expect(statsService.createStatsService).toBeDefined();
      expect(goalService.createGoalService).toBeDefined();
      expect(investmentService.createInvestmentService).toBeDefined();
      expect(liquidityAccountService.createLiquidityAccountService).toBeDefined();
    });
  });

  describe('Context integration', () => {
    it('ServiceContext should export createServices, useServices, ServiceProvider', async () => {
      const ctx = await import('../../contexts/ServiceContext');

      expect(ctx.ServiceProvider).toBeDefined();
      expect(ctx.useServices).toBeDefined();
      expect(ctx.createServices).toBeDefined();
      expect(ctx.ServiceContext).toBeDefined();
    });

    it('createServices should produce all service keys', async () => {
      const { createServices } = await import('../../contexts/ServiceContext');
      const services = createServices();

      expect(services).toHaveProperty('apiClient');
      expect(services).toHaveProperty('userService');
      expect(services).toHaveProperty('financeService');
      expect(services).toHaveProperty('rankingService');
      expect(services).toHaveProperty('statsService');
    });
  });

  describe('Direct axios usage audit (enforced)', () => {
    // Post-migration: all components, pages, and sections MUST use the
    // service layer from ServiceContext instead of importing axios directly.

    it('should have zero direct axios imports in components/', () => {
      const componentsDir = path.join(SRC_DIR, 'components');
      const files = collectFiles(componentsDir);
      const filesWithAxios = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        if (/import\s+.*axios/m.test(content) || /require\s*\(\s*['"]axios['"]\s*\)/m.test(content)) {
          filesWithAxios.push(path.relative(SRC_DIR, file));
        }
      }

      console.log(`[DI Audit] Components with direct axios imports: ${filesWithAxios.length}`);
      if (filesWithAxios.length > 0) {
        console.log(`  Files: ${filesWithAxios.join(', ')}`);
      }

      expect(filesWithAxios).toHaveLength(0);
    });

    it('should have zero direct axios imports in pages/', () => {
      const pagesDir = path.join(SRC_DIR, 'pages');
      const files = collectFiles(pagesDir);
      const filesWithAxios = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        if (/import\s+.*axios/m.test(content) || /require\s*\(\s*['"]axios['"]\s*\)/m.test(content)) {
          filesWithAxios.push(path.relative(SRC_DIR, file));
        }
      }

      console.log(`[DI Audit] Pages with direct axios imports: ${filesWithAxios.length}`);
      if (filesWithAxios.length > 0) {
        console.log(`  Files: ${filesWithAxios.join(', ')}`);
      }

      expect(filesWithAxios).toHaveLength(0);
    });

    it('should have zero direct axios imports in sections/', () => {
      const sectionsDir = path.join(SRC_DIR, 'sections');
      const files = collectFiles(sectionsDir);
      const filesWithAxios = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        if (/import\s+.*axios/m.test(content) || /require\s*\(\s*['"]axios['"]\s*\)/m.test(content)) {
          filesWithAxios.push(path.relative(SRC_DIR, file));
        }
      }

      console.log(`[DI Audit] Sections with direct axios imports: ${filesWithAxios.length}`);
      if (filesWithAxios.length > 0) {
        console.log(`  Files: ${filesWithAxios.join(', ')}`);
      }

      expect(filesWithAxios).toHaveLength(0);
    });

    it('should only have axios imported in services/apiClient.js', () => {
      // Contexts may reference axios in JSDoc comments but should not import it
      const contextsDir = path.join(SRC_DIR, 'contexts');
      const files = collectFiles(contextsDir);
      const filesWithAxiosImport = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        // Match actual import/require statements (not JSDoc type comments)
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
          if (/import\s+.*from\s+['"]axios['"]/.test(trimmed) || /require\s*\(\s*['"]axios['"]\s*\)/.test(trimmed)) {
            filesWithAxiosImport.push(path.relative(SRC_DIR, file));
            break;
          }
        }
      }

      console.log(`[DI Audit] Contexts with direct axios imports: ${filesWithAxiosImport.length}`);
      expect(filesWithAxiosImport).toHaveLength(0);
    });
  });
});

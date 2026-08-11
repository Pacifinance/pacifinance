import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.mjs';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Test environment
      environment: 'jsdom',
      
      // Global test setup
      globals: true,
      setupFiles: ['./src/__tests__/setup.js'],
      
      // Include patterns
      include: [
        'src/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
        'src/**/*.{test,spec}.{js,jsx,ts,tsx}'
      ],
      
      // Exclude patterns
      exclude: [
        'node_modules',
        'dist',
        'build',
        'server',
        '.git'
      ],
      
      // Coverage configuration
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        reportsDirectory: './coverage',
        include: [
          'src/utils/**/*.{js,jsx,ts,tsx}',
          'src/contexts/**/*.{js,jsx,ts,tsx}',
          'src/components/**/*.{js,jsx,ts,tsx}',
          'src/hooks/**/*.{js,jsx,ts,tsx}',
          'src/services/**/*.{js,jsx,ts,tsx}'
        ],
        exclude: [
          'node_modules',
          'src/__tests__',
          'src/**/*.test.{js,jsx,ts,tsx}',
          'src/**/*.spec.{js,jsx,ts,tsx}',
          'src/**/*.d.ts',
          'src/data/**',
          'src/assets/**',
          'src/styles/**'
        ],
        // Baseline = actual coverage measured right after fixing the `include`
        // globs below (they only matched .js/.jsx and silently excluded this
        // now-all-TypeScript codebase, so the old 60/60/50/60 numbers were
        // never really being checked). This floor blocks regressions below
        // today's real level; raise it as gaps close, don't lower it.
        thresholds: {
          lines: 55,
          functions: 47,
          branches: 48,
          statements: 55
        }
      },
      
      // Reporter configuration
      reporters: ['default', 'html'],
      
      // Watch mode options
      watch: false,
      
      // Clear mocks between each test
      clearMocks: true,
      restoreMocks: true,
      
      // Timeout for tests
      testTimeout: 10000,
      
      // Pool configuration
      pool: 'forks',
      
      // CSS handling
      css: {
        modules: {
          classNameStrategy: 'non-scoped'
        }
      }
    }
  })
);

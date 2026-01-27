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
          'src/utils/**/*.{js,jsx}',
          'src/contexts/**/*.{js,jsx}',
          'src/components/**/*.{js,jsx}',
          'src/hooks/**/*.{js,jsx}'
        ],
        exclude: [
          'node_modules',
          'src/__tests__',
          'src/**/*.test.{js,jsx}',
          'src/**/*.spec.{js,jsx}',
          'src/data/**',
          'src/assets/**',
          'src/styles/**'
        ],
        thresholds: {
          lines: 60,
          functions: 60,
          branches: 50,
          statements: 60
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

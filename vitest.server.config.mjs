import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./server/__tests__/setup.ts'],
    include: ['server/__tests__/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'build', 'dist', '.git'],
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10000,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage/server',
      include: ['server/src/**/*.{ts,tsx}'],
      exclude: ['server/src/types/**']
    }
  }
});

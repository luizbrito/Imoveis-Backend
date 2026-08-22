import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load test environment variables globally for all Playwright processes
dotenv.config({
  path: resolve(__dirname, '.env.test'),
  override: true,
  quiet: true,
});

export default defineConfig({
  testDir: './src/',
  testMatch: '**/__e2e__/**/*.spec.ts',
  fullyParallel: false, // Run tests serially to avoid DB conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid DB conflicts
  reporter: 'list',
  globalSetup: './src/test/testE2eGlobalSetup.ts',
  globalTeardown: './src/test/testE2eGlobalTeardown.ts',
  timeout: 30000, // 30 second timeout per test
  expect: {
    timeout: 10000, // 10 second timeout for assertions
  },

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    actionTimeout: 10000, // 10 second timeout for actions
    navigationTimeout: 10000, // 10 second timeout for navigation
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    // Start backend server with test environment
    {
      command: 'pnpm start:test',
      port: 3011,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      timeout: 120000,
    },
    // Start frontend server with test environment
    {
      command: 'pnpm --filter frontend start:test',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      timeout: 120000,
    },
  ],
});

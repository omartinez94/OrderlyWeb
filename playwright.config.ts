import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the base component library showcase.
 *
 * The dev server is started by Playwright (via `webServer`); the
 * showcase route is mounted in development behind `?showcase=1`
 * (see `src/App.tsx`). Each test visits that URL and runs axe-core
 * per primitive section.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

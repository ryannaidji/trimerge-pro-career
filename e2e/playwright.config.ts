// Browser smoke tests against the running stack (docker compose up -d).
// Locally they use the installed Google Chrome (no browser download); in CI set
// PW_CHANNEL="" to use Playwright's bundled Chromium.
// Author: Ryan Naidji
import { defineConfig, devices } from '@playwright/test';

const channel = process.env.PW_CHANNEL ?? 'chrome';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.WEB_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...(channel ? { channel } : {}) } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...(channel ? { channel } : {}) } },
    // Cross-browser run for regression testing (#36): ALL_BROWSERS=1 npx playwright test
    // (first: npx playwright install firefox webkit). WebKit is the engine behind Safari.
    ...(process.env.ALL_BROWSERS
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'safari-desktop', use: { ...devices['Desktop Safari'] } },
          { name: 'safari-iphone', use: { ...devices['iPhone 14'] } },
        ]
      : []),
  ],
});

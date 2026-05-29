// @ts-check
import { defineConfig } from '@playwright/test';

const FILE_BASE = 'file:///C:/DEVKiTZ/01_PROJECTS';
const SERVER_BASE = 'http://localhost:8080';

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: '../test-reports' }],
    ['json', { outputFile: '../test-reports/results.json' }],
    ['list']
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      // DEFAULT: file:// Tests — laufen IMMER ohne Server
      name: 'offline',
      use: {
        baseURL: FILE_BASE,
        channel: 'chromium',
      },
      testMatch: [
        '**/kontrollzentrum-smoke.spec.js',
        '**/dashboard-smoke.spec.js',
      ],
    },
    {
      // SERVER: localhost:8080 Tests — nur mit --project=server
      name: 'server',
      use: {
        baseURL: SERVER_BASE,
        channel: 'chromium',
      },
      testMatch: [
        '**/full-system.spec.js',
        '**/agentic-audit.spec.js',
      ],
    },
  ],
});

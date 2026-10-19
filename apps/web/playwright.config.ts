import { defineConfig, devices } from '@playwright/test';

const webPort = Number(process.env.WEB_PORT ?? 3000);
const apiPort = Number(process.env.PORT ?? 3001);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${webPort}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter @reactiv/api dev',
      cwd: '../..',
      url: `http://localhost:${apiPort}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: String(apiPort),
        DATABASE_URL:
          process.env.DATABASE_URL ?? 'postgres://reactiv:reactiv@127.0.0.1:55432/reactiv',
        API_KEY: process.env.API_KEY ?? 'change-me-to-a-long-random-secret',
        LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
        NODE_ENV: 'development',
        DEFAULT_CONFIG_ID: process.env.DEFAULT_CONFIG_ID ?? 'default',
      },
    },
    {
      command: 'pnpm --filter @reactiv/web dev',
      cwd: '../..',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        CONFIG_SERVICE_URL: process.env.CONFIG_SERVICE_URL ?? `http://localhost:${apiPort}`,
        CONFIG_SERVICE_API_KEY:
          process.env.CONFIG_SERVICE_API_KEY ?? 'change-me-to-a-long-random-secret',
        DEFAULT_CONFIG_ID: process.env.DEFAULT_CONFIG_ID ?? 'default',
      },
    },
  ],
});

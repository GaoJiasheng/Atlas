import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke e2e against the built site: `pnpm build && pnpm e2e`.
 * `pnpm preview` serves dist/ (it does not build), so build first.
 */
const PORT = 4329;

export default defineConfig({
  testDir: './tests-e2e',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        // Headless GPUs are absent: software WebGL (SwiftShader) keeps MapLibre and three.js working.
        launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
      },
    },
  ],
  webServer: {
    command: `pnpm preview --host 127.0.0.1 --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/en/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

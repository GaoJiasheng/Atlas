import { createHash } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke e2e against the built site: `pnpm build && pnpm e2e`.
 * `pnpm preview` serves dist/ (it does not build), so build first.
 *
 * Each checkout tests its own build: the port comes from this checkout's path
 * (4400–5399), so git worktrees running `pnpm e2e` side by side never share a
 * server. `ATLAS_E2E_PORT` sets the port; a server already on it is reused only
 * with `ATLAS_E2E_REUSE=1` (a `pnpm preview --port <port>` you started in this
 * checkout yourself) — otherwise a busy port is an error, not someone else's build.
 */
const ROOT = realpathSync(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.env.ATLAS_E2E_PORT) || 4400 + (createHash('sha1').update(ROOT).digest().readUInt32BE(0) % 1000);
const REUSE = process.env.ATLAS_E2E_REUSE === '1' && !process.env.CI;

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
    cwd: ROOT,
    reuseExistingServer: REUSE,
    timeout: 60_000,
  },
});

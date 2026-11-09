import { expect, test, type Page } from '@playwright/test';

/** Follow --timeout / test.setTimeout under load, without retrying a test. */
export const signalTimeout = () => Math.max(30_000, test.info().timeout / 2);

export function poll<T>(read: () => T | Promise<T>, options: { message?: string; intervals?: number[] } = {}) {
  return expect.poll(read, { timeout: signalTimeout(), ...options });
}

export async function sceneReady(page: Page) {
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: signalTimeout() });
  // Waiting for the Promise to exist does not wait for its result.
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}

/** Browser frames also cover a demand-rendered scene that is correctly idle. */
export async function browserFrames(page: Page, count = 3) {
  await page.evaluate(async n => {
    for (let i = 0; i < n; i++) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }, count);
}

/** Install before navigation; loading still runs in real time until paused. */
export async function installSceneClock(page: Page) {
  await page.clock.install();
}

export async function pauseSceneClock(page: Page) {
  // This jumps virtual time; the margin tolerates slow protocol delivery.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 60_000));
  await sceneFrame(page);
  await sceneFrame(page);
}

/**
 * Advance controlled time until StatsProbe confirms a real app frame.
 * Requires an active animation or an update that invalidated the demand loop;
 * advancing time alone must not turn a correctly idle scene into a success.
 */
export async function sceneFrame(page: Page) {
  const before = await page.evaluate(() => window.__atlas!.stats().lastFrame);
  expect(before).toBeGreaterThan(0);
  await poll(async () => {
    await page.clock.runFor(16);
    return page.evaluate(() => window.__atlas!.stats().lastFrame);
  }, { message: 'SpaceScene must publish another rendered frame', intervals: [0] }).not.toBe(before);
}

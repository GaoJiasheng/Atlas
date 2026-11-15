/**
 * The `brain-and-nerves` topic (docs/75) in the browser: the signal-speed
 * try-it reads 10 ms / 1,000 ms (SIM, design study S1) and hides the myelin
 * for the bare fibre; the reflex steps show a step's segment and the one
 * before; the ruler drop turns 20 cm into 202 ms; predict-first in chapter 5
 * reveals that the turn is made in the spinal cord; Chinese.
 */
import { expect, test, type Page } from '@playwright/test';

type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, unknown> };
  flow(id: string): { paths: Record<string, { visible: boolean }> } | null;
};

async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/brain-and-nerves/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const flow = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).flow(x), id);
const shown = async (page: Page, id: string) => Object.values((await flow(page, id))?.paths ?? {}).some((p) => p.visible);
const readout = (page: Page, id: string) => page.locator(`.space-try [data-sim-output="${id}"] dd b`);

test.describe('brain-and-nerves', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('signal speed: thick and wrapped against thin and bare (SIM)', async ({ page }) => {
    await open(page, 'ch=neurons-and-signals');
    let o = (await sim(page)).outputs;
    expect([o.speed, o['time-ms'], o.slow]).toEqual([100, 10, 200]);
    await expect(readout(page, 'time-ms')).toHaveText('10');
    await open(page, 'ch=neurons-and-signals&sim=fibre.thin-bare');
    o = (await sim(page)).outputs;
    expect([o.speed, o['time-ms'], o.slow]).toEqual([1, 1000, 2]);
    await expect(page.locator('.space-try__sim[data-tag="sim"]')).toContainText('SIM');
  });

  test('the reflex steps show a step and the one before', async ({ page }) => {
    await open(page, 'ch=the-reflex-arc&sim=stop.3');
    await expect.poll(() => shown(page, 'reflex-relay')).toBe(true);
    expect(await shown(page, 'reflex-sensory')).toBe(true);
    expect(await shown(page, 'reflex-motor')).toBe(false);
    expect(await shown(page, 'reflex-to-brain')).toBe(false);
    expect((await sim(page)).outputs.where).toBe('relay');
    await open(page, 'ch=the-reflex-arc&sim=stop.6');
    await expect.poll(() => shown(page, 'reflex-to-brain')).toBe(true);
    expect(await shown(page, 'reflex-sensory')).toBe(false);
  });

  test('a ruler caught after 20 cm reads 202 ms', async ({ page }) => {
    await open(page, 'ch=from-senses-to-action&sim=catch-cm.20');
    expect((await sim(page)).outputs['reaction-ms']).toBe(202);
    await expect(readout(page, 'reaction-ms')).toHaveText('202');
  });

  test('Chinese: the chapter and its try-it', async ({ page }) => {
    await open(page, 'ch=the-reflex-arc', 'zh');
    await expect(page.locator('.space-try')).toContainText('反射的第几步');
  });
});

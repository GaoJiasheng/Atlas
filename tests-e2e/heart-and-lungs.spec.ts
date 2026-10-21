/**
 * The `heart-and-lungs` topic (docs/40) in the browser: a deep link to the
 * air breathed out draws the balls and the TYPICAL readings with their
 * sources; `[` goes back to the air breathed in (0.04 %, no carbon dioxide
 * ball); running paces the heartbeat, the breathing and the blood; holding
 * a breath stops the breathing and the tidal air; the round shows a step's
 * segment and the one before; predict-first in chapter 4 reveals that the
 * blood goes back to the heart; Chinese; on a phone the try-it card works in
 * the drawer with 44 px targets.
 */
import { expect, test, type Page } from '@playwright/test';

type Animation = { hz: number; phase: number; on: number } | null;
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, unknown>; sources?: Record<string, string[]> };
  animation(id: string): Animation;
  copies(id: string): number | null;
  flow(id: string): { paths: Record<string, { visible: boolean }>; pace?: number } | null;
};

async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/heart-and-lungs/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const animation = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).animation(x), id);
const copies = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).copies(x), id);
const flow = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).flow(x), id);
const shown = async (page: Page, id: string) => Object.values((await flow(page, id))?.paths ?? {}).some((p) => p.visible);
const readout = (page: Page, id: string) => page.locator(`.space-try [data-sim-output="${id}"] dd b`);
const BREATHING = ['breathe', 'breathe-left', 'diaphragm-breathe', 'ribs-breathe'];

test.describe('heart-and-lungs', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a deep link to the air breathed out: balls, readings and their sources', async ({ page }) => {
    await open(page, 'ch=what-changes-in-the-air&sim=sample.out');
    const o = (await sim(page)).outputs;
    expect([o.n2, o.o2, o.co2, o.h2o]).toEqual([78, 16, 4, 6]);
    await expect.poll(() => copies(page, 'o2-balls')).toBe(16);
    expect(await copies(page, 'n2-balls')).toBe(78);
    expect(await copies(page, 'co2-balls')).toBe(4);
    expect(await copies(page, 'h2o-balls')).toBe(6);
    await expect(readout(page, 'co2')).toHaveText('4');
    const typical = page.locator('.space-try__sim[data-tag="typical"]');
    await expect(typical).toContainText('TYPICAL');
    await expect(typical.locator('.atlas-src')).toHaveText(['S5', 'S6', 'S8']);
    await expect(page.locator('.space-try__sim[data-tag="sim"]')).toHaveCount(0);
    await typical.locator('.atlas-src').first().click();
    await expect(page.locator('.atlas-source-pop__text')).toContainText('Save My Exams');
  });

  test('[ goes back to the air breathed in: 0.04 % and no carbon dioxide ball', async ({ page }) => {
    await open(page, 'ch=what-changes-in-the-air&sim=sample.out');
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('[');
    await expect.poll(async () => (await sim(page)).values.sample).toBe('in');
    await expect(readout(page, 'co2')).toHaveText('0.04');
    await expect(readout(page, 'o2')).toHaveText('21');
    await expect.poll(() => copies(page, 'o2-balls')).toBe(21);
    expect(await copies(page, 'co2-balls')).toBe(0);
    await expect(page.locator('.space-try__sim[data-tag="typical"] .atlas-src')).toHaveText(['S3', 'S4']);
  });

  test('running paces the heartbeat, the breathing and the blood (SIM)', async ({ page }) => {
    await open(page, 'ch=three-systems&sim=activity.run');
    await expect.poll(async () => (await animation(page, 'heartbeat'))?.hz).toBeCloseTo(165 / 60, 3);
    for (const id of BREATHING) expect((await animation(page, id))!.hz).toBeCloseTo(40 / 60, 3);
    expect((await flow(page, 'to-body'))?.pace).toBeCloseTo(1.83, 6);
    expect((await flow(page, 'air-right'))?.pace).toBeCloseTo(2, 6);
    await expect(readout(page, 'beats')).toHaveText('165');
    await expect(readout(page, 'breaths')).toHaveText('40');
    await expect(page.locator('.space-try__sim[data-tag="sim"]')).toContainText('SIM');
    await expect(page.locator('.space-try [data-sim-output="muscles"]')).toHaveAttribute('data-state', 'most');
  });

  test('holding a breath in stops the breathing; the heart still beats', async ({ page }) => {
    await open(page, 'ch=nose-windpipe-lungs');
    await page.locator('.space-try [data-sim-control="phase"] [data-sim-value="in"]').click();
    await expect.poll(async () => (await animation(page, 'breathe'))?.on).toBe(0);
    expect((await sim(page)).outputs.airflow).toBe('in');
    await expect(page.locator('.space-try [data-sim-output="chest"]')).toHaveAttribute('data-state', 'bigger');
    expect((await animation(page, 'heartbeat'))!.on).toBe(1);
  });

  test('the round: step 3 shows the blood back from the lungs, not yet to the body', async ({ page }) => {
    await open(page, 'ch=the-blood-route&sim=stop.3');
    await expect.poll(() => shown(page, 'from-lungs')).toBe(true);
    expect(await shown(page, 'exchange-lungs')).toBe(true);
    expect(await shown(page, 'to-body')).toBe(false);
    expect(await shown(page, 'from-body')).toBe(false);
    await expect(page.locator('.space-try [data-sim-output="where"]')).toHaveAttribute('data-state', 'lungs-to-heart');
  });

  test('predict first: after the lungs the blood goes back to the heart', async ({ page }) => {
    await open(page, 'ch=the-blood-route');
    await page.locator('.space-try').getByRole('button', { name: 'Straight to the body' }).click();
    await expect.poll(async () => (await sim(page)).values.stop).toBe(3);
    await expect(page.locator('.space-try')).toContainText('Lungs back to the heart');
  });

  test('Chinese: the TYPICAL chip and the readings', async ({ page }) => {
    await open(page, 'ch=what-changes-in-the-air', 'zh');
    await expect(page.locator('.space-try__sim[data-tag="typical"]')).toContainText('典型值');
    await expect(page.locator('.space-try [data-sim-output="o2"] dt')).toContainText('氧气');
    await expect(readout(page, 'co2')).toHaveText('0.04');
    await expect(page.locator('h1, .atlas-title').first()).toContainText('心与肺');
  });

  test('on a phone the card works in the drawer with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=three-systems');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    const option = page.locator('.space-try [data-sim-control="activity"] [data-sim-value="run"]');
    await option.scrollIntoViewIfNeeded();
    const box = (await option.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    await option.click();
    await expect.poll(async () => (await sim(page)).values.activity).toBe('run');
    await expect(readout(page, 'beats')).toHaveText('165');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

/** Browser acceptance is run by the main session: CI=1 ATLAS_E2E_PORT=5443 pnpm e2e. */
import { expect, test, type Page } from '@playwright/test';
interface Reading {
  values: Record<string, string | number>;
  outputs: Record<string, string | number>;
  table: { vary: number | string; values: Record<string, number | string> }[];
  curve: null | { x: string; domain: number[]; series: { id: string; points: { x: number; y: number }[] }[]; cursor: { x: number; values: Record<string, number> } };
}
interface Engine { sim(): Reading; setSim(values: Record<string, string | number>): boolean }
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, v: Record<string, string | number>) => page.evaluate((values) => (window.__atlas!.engine as unknown as Engine).setSim(values), v);
const card = (page: Page) => page.locator('.space-try');
async function open(page: Page, chapter: string, params = '', locale = 'en') {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`/${locale}/topics/heat/?ch=${chapter}${params}`);
  await expect.poll(() => page.evaluate(() => Boolean(window.__atlas?.engine)), { timeout: 60_000 }).toBe(true);
  await expect(card(page)).toBeVisible({ timeout: 60_000 });
}
test('heat: heating curve, cursor, record and PLATE agree at the authored instant', async ({ page }) => {
  await open(page, 'heating-curves', '&b=2&sim=elapsed-s.120');
  const s = await sim(page);
  expect(s.outputs['heated-c']).toBeCloseTo(39.285714286, 6);
  expect(s.outputs['heated-j']).toBeCloseTo(12000, 6);
  const series = s.curve!.series[0]!;
  expect(series.points).toHaveLength(101);
  expect(series.points[40]).toEqual({ x: 120, y: s.outputs['heated-c'] });
  expect(s.curve!.cursor.values['heated-c']).toBe(s.outputs['heated-c']);
  await expect(page.locator('.space-plate')).toContainText('39.3');
  await card(page).locator('[data-sim-record]').click();
  expect((await sim(page)).table[0]!.values['heated-c']).toBe(s.outputs['heated-c']);
  await set(page, { 'elapsed-s': 180 });
  await card(page).locator('[data-sim-reveal]').click();
  await card(page).locator('[data-sim-record]').click();
  expect((await sim(page)).table).toHaveLength(2);
  await set(page, { 'heater-w': 50 });
  await expect.poll(async () => (await sim(page)).table.length).toBe(0);
  expect((await sim(page)).values['elapsed-s']).toBe(180);
  await expect(card(page)).toContainText('Conditions changed; start a new record.');
});
test('heat: prediction concealment, cold bath reversal, explicit time and view modes', async ({ page }) => {
  await open(page, 'heat-along-spoons');
  await expect(card(page).locator('[data-model-curve]')).toHaveCount(0);
  await card(page).locator('[data-predict]').first().click();
  await expect(card(page).locator('[data-model-curve]')).toBeVisible();
  await set(page, { 'bath-c': 5, 'elapsed-s': 60 });
  const s = await sim(page);
  expect(s.outputs['metal-c']).toBeCloseTo(12.357588823, 6);
  expect(s.outputs['plastic-c']).toBeCloseTo(23.096748361, 6);
  expect(s.outputs['tip-comparison']).toBe('second-warmer');
  await expect(card(page).locator('[data-model-curve]')).toHaveCount(0);
  await page.waitForTimeout(500);
  for (const key of ['r', 'r', 'e', 'e', 'Space', 'Space']) await page.keyboard.press(key);
  expect((await sim(page)).values['elapsed-s']).toBe(60);
  expect((await sim(page)).outputs['metal-c']).toBe(s.outputs['metal-c']);
  expect(await set(page, { 'elapsed-s': 61 })).toBe(false);
});
for (const locale of ['en', 'zh']) test(`heat: insulation and expansion (${locale})`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'slowing-heat-transfer', '&b=4&sim=cool-start-c.5~cover.wrapped~elapsed-s.120', locale);
  let s = await sim(page);
  expect(s.outputs['cool-c']).toBeCloseTo(6.378744406, 6);
  expect(s.outputs['cool-direction']).toBe('warming');
  expect(s.curve!.x).toBe('elapsed-s');
  await card(page).locator('.space-curve__values summary').click();
  await expect(card(page).locator('.space-curve__values tbody tr')).toHaveCount(6);
  await open(page, 'expansion-and-contraction', '&sim=rod-c.85', locale);
  s = await sim(page);
  expect(s.outputs['rod-delta-mm']).toBeCloseTo(0.072, 9);
  expect(s.outputs['rod-length-mm']).toBeCloseTo(100.072, 9);
  await expect(card(page).locator('[data-model-curve]')).toHaveCount(0);
});

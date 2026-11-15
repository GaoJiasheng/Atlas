/** refrigerator (docs/74, draft): the chapter 02 try-it card, its hidden defrost control and the open-door bindings. */
import { expect, test, type Page } from '@playwright/test';
interface Reading { values: Record<string, string | number>; outputs: Record<string, string | number> }
interface Engine { sim(): Reading; setSim(values: Record<string, string | number>): boolean }
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, v: Record<string, string | number>) => page.evaluate((values) => (window.__atlas!.engine as unknown as Engine).setSim(values), v);
const card = (page: Page) => page.locator('.space-try');

async function open(page: Page, chapter: string, params = '', locale = 'en') {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(`/${locale}/topics/refrigerator/?ch=${chapter}${params}`);
  await expect.poll(() => page.evaluate(() => Boolean(window.__atlas?.engine)), { timeout: 60_000 }).toBe(true);
}

for (const locale of ['en', 'zh']) test(`refrigerator: try-it card offers door, contents and time only (${locale})`, async ({ page }) => {
  await open(page, 'keeping-heat-out', '', locale);
  await expect(card(page)).toBeVisible({ timeout: 60_000 });
  const ids = await card(page).locator('[data-sim-control]').evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('data-sim-control')))]);
  expect(ids.sort()).toEqual(['contents', 'elapsed-s', 'setup']);
  expect((await sim(page)).values['heater-w']).toBe(0);
});

test('refrigerator: ten minutes with the door open, full and empty', async ({ page }) => {
  await open(page, 'keeping-heat-out');
  await expect(card(page)).toBeVisible({ timeout: 60_000 });
  expect(await set(page, { setup: 'open', contents: 'full', 'elapsed-s': 600 })).toBe(true);
  expect((await sim(page)).outputs['fridge-c'] as number).toBeCloseTo(9.08, 1);
  expect(await set(page, { contents: 'empty' })).toBe(true);
  expect((await sim(page)).outputs['fridge-c'] as number).toBeCloseTo(22.25, 1);
  expect(await set(page, { 'elapsed-s': 601 })).toBe(false);
});

test('refrigerator: the defrost beat sets the hidden heater control', async ({ page }) => {
  await open(page, 'frost-and-defrost', '&b=3');
  await expect.poll(() => page.evaluate(() => (window.__atlas?.engine as unknown as Partial<Engine> | undefined)?.sim?.().values['heater-w'] ?? null), { timeout: 60_000 }).toBe(250);
  await expect(card(page)).toHaveCount(0);
});

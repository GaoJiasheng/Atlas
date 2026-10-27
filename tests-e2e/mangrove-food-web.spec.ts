/** Run after build: CI=1 ATLAS_E2E_PORT=5441 pnpm e2e tests-e2e/mangrove-food-web.spec.ts */
import { expect, test, type Page } from '@playwright/test';
type Engine = {
  sim(): { values: Record<string, string | number | boolean>; outputs: Record<string, number | string> };
  setSim(v: Record<string, string | number | boolean>): boolean;
  anchor(id: string): { shown: boolean; onScreen: boolean } | null;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, v: Record<string, string | number | boolean>) => page.evaluate((values) => (window.__atlas!.engine as unknown as Engine).setSim(values), v);
const shown = (page: Page, id: string) => page.evaluate((part) => (window.__atlas!.engine as unknown as Engine).anchor(part)?.shown ?? false, id);
const card = (page: Page) => page.locator('.space-food-web:visible').first();
async function open(page: Page, query = '', locale = 'en') {
  await page.goto(`/${locale}/topics/mangrove-food-web/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

test('background has a directed web, 6 nodes and selected-link boundary', async ({ page }) => {
  await open(page, 'ch=before-you-start');
  await expect(card(page).locator('[data-food-node]')).toHaveCount(6);
  await expect(card(page).locator('[data-food-edge]')).toHaveCount(6);
  await expect(card(page)).toContainText('Missing pathways do not predict extinction');
  expect((await sim(page)).outputs['active-links']).toBe(6);
  await expect(page.locator('.atlas-title__note')).toContainText(/no population forecast/i);
});

test('remove fiddlers leaves one food; picking a node changes selection only', async ({ page }) => {
  await open(page, 'ch=removing-a-species&sim=remove.n-fiddlers~inspect.n-mudskipper~tide.low');
  expect((await sim(page)).outputs.foods).toBe(1);
  await expect(card(page).locator('[data-food-node="n-fiddlers"]')).toHaveAttribute('data-present', 'false');
  const node = card(page).locator('[data-food-node="n-heron"]');
  await node.click();
  await expect(node).toHaveAttribute('data-selected', 'true');
  expect((await sim(page)).values.remove).toBe('n-fiddlers');
  await expect(card(page).locator('[data-food-node="n-mudskipper"]')).toHaveAttribute('data-inspect', 'true');
});

test('indirect loss keeps unsupported crabs visible, leaves remain after supply removal', async ({ page }) => {
  await open(page, 'ch=removing-a-species&sim=remove.n-algae~inspect.n-fiddlers~tide.low');
  expect((await sim(page)).outputs['food-status']).toBe('no-shown-food');
  await expect.poll(() => shown(page, 'fiddler-crabs'), { timeout: 20_000 }).toBe(true);
  await set(page, { remove: 'n-mangrove' });
  await expect.poll(() => shown(page, 'fallen-leaves'), { timeout: 20_000 }).toBe(true);
  expect((await sim(page)).outputs['supported-count']).toBe(5);
});

test('high and low tides change pose, with removed crab never reappearing', async ({ page }) => {
  await open(page, 'ch=changing-tides');
  await set(page, { tide: 'high' });
  expect((await sim(page)).outputs['water-rise']).toBe(.14);
  expect((await sim(page)).outputs['crab-rise']).toBe(.16);
  expect((await sim(page)).outputs['active-links']).toBe(6);
  await expect.poll(() => shown(page, 'fiddler-crabs'), { timeout: 20_000 }).toBe(false);
  await set(page, { tide: 'low' });
  await expect.poll(() => shown(page, 'fiddler-crabs'), { timeout: 20_000 }).toBe(true);
  await set(page, { remove: 'n-fiddlers', tide: 'high' });
  await set(page, { tide: 'low' });
  await expect.poll(() => shown(page, 'fiddler-crabs'), { timeout: 20_000 }).toBe(false);
});

test('prediction and record compare two shown foods with one', async ({ page }) => {
  await open(page, 'ch=removing-a-species');
  const trial = page.locator('.space-try');
  await trial.locator('[data-predict="less"]').click();
  expect((await sim(page)).outputs.foods).toBe(1);
  await expect(trial.locator('.space-try__reveal')).toBeVisible();
  await set(page, { remove: 'none' });
  await trial.locator('[data-sim-record]').click();
  await set(page, { remove: 'n-fiddlers' });
  await trial.locator('[data-sim-record]').click();
  await expect(trial.locator('.space-try__table tbody tr')).toHaveCount(2);
});

for (const locale of ['en', 'zh']) test(`phone ${locale}: background card and keyboard selection remain usable`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'ch=before-you-start', locale);
  // The phone's reader is a bottom sheet that starts folded; the card lives inside it.
  if (!(await card(page).isVisible())) await page.getByRole('button', { name: locale === 'en' ? 'Read' : '阅读', exact: true }).click();
  await expect(card(page)).toBeVisible();
  const node = card(page).locator('[data-food-node="n-heron"]');
  await node.scrollIntoViewIfNeeded();
  const box = await node.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await node.focus(); await page.keyboard.press('Enter');
  await expect(node).toHaveAttribute('data-selected', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

/** Main-session browser gate only, after build:
 * CI=1 ATLAS_E2E_PORT=5454 pnpm e2e tests-e2e/coral-reef.spec.ts
 */
import { expect, test, type Page } from '@playwright/test';

type Values = Record<string, string | number | boolean>;
type Engine = {
  sim(): { values: Values; outputs: Record<string, number | string> };
  setSim(values: Values): boolean;
  anchor(id: string): { shown: boolean; onScreen: boolean } | null;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, values: Values) => page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const shown = (page: Page, id: string) => page.evaluate((part) => (window.__atlas!.engine as unknown as Engine).anchor(part)?.shown ?? false, id);
const card = (page: Page) => page.locator('.space-food-web:visible').first();
const trial = (page: Page) => page.locator('.space-try:visible').first();
async function open(page: Page, query = 'ch=sunlight-and-food', locale = 'en', theme = 'paper') {
  await page.goto(`/${locale}/topics/coral-reef/?theme=${theme}&${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
async function chapter(page: Page, id: string) {
  await page.evaluate((ch) => window.__atlas!.goToChapter(ch, { instant: true }), id);
  await expect.poll(async () => (await page.evaluate(() => window.__atlas!.state())).chapter).toBe(id);
}
test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

for (const locale of ['en', 'zh']) for (const theme of ['paper', 'cinema']) {
  test(`${locale}/${theme}: directed six-node web, 39 authored beats and partner-transfer evidence`, async ({ page }) => {
    await open(page, 'ch=sunlight-and-food', locale, theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect(await page.evaluate(() => window.__atlas!.chapters())).toHaveLength(8);
    expect(await page.evaluate(() => window.__atlas!.beats())).toHaveLength(39);
    await expect(card(page)).toContainText(locale === 'en' ? 'Food → consumer' : '食物 → 消费者');
    await expect(card(page).locator('[data-food-node]')).toHaveCount(6);
    await expect(card(page).locator('[data-food-edge][data-active="true"]')).toHaveCount(4);
    for (const edge of await card(page).locator('[data-food-edge]').all()) await expect(edge).toHaveAttribute('marker-end', /url\(#/);
    expect((await sim(page)).outputs).toMatchObject({ 'active-links': 4, foods: 2, 'food-status': 'unchanged' });
    await card(page).locator('summary').click();
    const partner = card(page).locator('[data-food-relation="e-symbionts-coral"]');
    await expect(partner).toContainText(locale === 'en' ? 'Algal partners → Coral animal' : '共生藻 → 珊瑚动物');
    await expect(partner).toContainText(locale === 'en' ? /not.*(swallow|eat|ingest)|without.*(swallow|eat|ingest)/i : /不.*(吞|吃)/);
    await expect(partner).toContainText(locale === 'en' ? 'General' : '一般资料');
    await partner.locator('.atlas-src').first().click();
    await expect(page.locator('.atlas-source-pop')).toBeVisible();
  });
}

test('node selection is distinct from inspect and removal, including keyboard selection', async ({ page }) => {
  await open(page, 'ch=changing-one-node&sim=remove.n-symbionts~inspect.n-coral');
  expect((await sim(page)).outputs.foods).toBe(1);
  const fish = card(page).locator('[data-food-node="n-parrotfish"]');
  await fish.click();
  await expect(fish).toHaveAttribute('data-selected', 'true');
  await expect(card(page).locator('[data-food-node="n-coral"]')).toHaveAttribute('data-inspect', 'true');
  expect((await sim(page)).values).toMatchObject({ remove: 'n-symbionts', inspect: 'n-coral' });
  const plankton = card(page).locator('[data-food-node="n-zooplankton"]');
  await plankton.focus(); await page.keyboard.press('Enter');
  await expect(plankton).toHaveAttribute('data-selected', 'true');
  await fish.focus(); await page.keyboard.press('Space');
  await expect(fish).toHaveAttribute('data-selected', 'true');
  expect((await sim(page)).values).toMatchObject({ remove: 'n-symbionts', inspect: 'n-coral' });
});

test('prediction removes a partner: two shown inputs become one, and record captures both cases', async ({ page }) => {
  await open(page, 'ch=changing-one-node');
  expect((await sim(page)).outputs.foods).toBe(2);
  await trial(page).locator('[data-predict="less"]').click();
  expect((await sim(page)).outputs.foods).toBe(1);
  await expect(trial(page).locator('.space-try__reveal')).toBeVisible();
  await expect(card(page).locator('[data-food-node="n-symbionts"]')).toHaveAttribute('data-present', 'false');
  await expect(card(page).locator('[data-food-edge="e-zoo-coral"]')).toHaveAttribute('data-active', 'true');
  await set(page, { remove: 'none' });
  await trial(page).locator('[data-sim-record]').click();
  await set(page, { remove: 'n-symbionts' });
  await trial(page).locator('[data-sim-record]').click();
  await expect(trial(page).locator('.space-try__record .space-try__table tbody tr')).toHaveCount(2);
});

test('indirect loss removes both plankton edges but leaves unsupported animals and the partner path', async ({ page }) => {
  await open(page, 'ch=changing-one-node&sim=remove.n-phytoplankton~inspect.n-zooplankton');
  expect((await sim(page)).outputs).toMatchObject({ foods: 0, 'food-status': 'no-shown-food', 'supported-count': 4, 'active-links': 2 });
  const zoo = card(page).locator('[data-food-node="n-zooplankton"]');
  await expect(zoo).toHaveAttribute('data-present', 'true');
  await expect(zoo).toHaveAttribute('data-supported', 'false');
  await expect.poll(() => shown(page, 'web-zooplankton')).toBe(true);
  for (const id of ['e-phyto-zoo', 'e-zoo-coral']) await expect(card(page).locator(`[data-food-edge="${id}"]`)).toHaveAttribute('data-active', 'false');
  await set(page, { inspect: 'n-coral' });
  expect((await sim(page)).outputs).toMatchObject({ foods: 1, 'food-status': 'fewer-foods' });
  await expect(card(page).locator('[data-food-edge="e-symbionts-coral"]')).toHaveAttribute('data-active', 'true');
  await set(page, { remove: 'n-turf-algae', inspect: 'n-parrotfish' });
  expect((await sim(page)).outputs['food-status']).toBe('no-shown-food');
  await expect.poll(() => shown(page, 'web-parrotfish')).toBe(true);
});

test('chapter transitions reset all five controls without carrying removal or tissue loss', async ({ page }) => {
  await open(page, 'ch=changing-one-node');
  await set(page, { remove: 'n-coral', inspect: 'n-parrotfish', 'depth-m': 7, 'water-case': 'less-turbid', 'evidence-state': 'dead-skeleton' });
  await chapter(page, 'reef-zones');
  await expect.poll(async () => (await sim(page)).values).toMatchObject({ remove: 'none', inspect: 'n-coral', 'depth-m': 3, 'water-case': 'more-turbid', 'evidence-state': 'partnered' });
  await chapter(page, 'changing-one-node');
  expect((await sim(page)).outputs).toMatchObject({ foods: 2, 'active-links': 4 });
});

test('named cameras reach actual web and polyp specimens from the reef chapter', async ({ page }) => {
  await open(page, 'ch=reef-zones');
  for (const [preset, part] of [['web', 'web-coral'], ['polyp', 'polyp-tissue'], ['reef', 'reef-crest']] as const) {
    await page.evaluate((id) => window.__atlas!.setPreset(id, { instant: true }), preset);
    await expect.poll(() => page.evaluate((id) => {
      const anchor = (window.__atlas!.engine as unknown as Engine).anchor(id);
      return anchor?.shown === true && anchor.onScreen === true;
    }, part)).toBe(true);
  }
});

test('light comparison fixes the water case, changes only illustrative light, and rejects depth zero', async ({ page }) => {
  await open(page, 'ch=reef-zones');
  expect((await sim(page)).outputs['light-index']).toBeCloseTo(22.313016014842983, 8);
  await trial(page).locator('[data-sim-control="depth-m"] button').last().click();
  expect((await sim(page)).values['depth-m']).toBe(7);
  expect((await sim(page)).outputs['light-index']).toBeCloseTo(3.0197383422318502, 8);
  await trial(page).locator('[data-sim-value="less-turbid"]').click();
  expect((await sim(page)).outputs['light-index']).toBeCloseTo(49.65853037914095, 8);
  await expect(trial(page).locator('[data-sim-output="light-index"]')).toHaveAttribute('data-tag', 'sim');
  expect((await sim(page)).outputs).toMatchObject({ foods: 2, 'active-links': 4, 'tissue-shown': 1 });
  expect(await set(page, { 'depth-m': 0 })).toBe(false);
  expect((await sim(page)).values['depth-m']).toBe(7);
});

test('bleached living tissue and a bare dead skeleton stay distinct and do not auto-recover', async ({ page }) => {
  await open(page, 'ch=bleaching-and-pressures');
  await trial(page).locator('[data-sim-value="bleached-alive"]').click();
  expect((await sim(page)).outputs).toMatchObject({ 'tissue-shown': 1, 'partners-shown': 0, 'tissue-evidence': 'bleached-alive' });
  await expect.poll(() => shown(page, 'polyp-tissue')).toBe(true);
  await expect.poll(() => shown(page, 'polyp-symbionts')).toBe(false);
  await trial(page).locator('[data-sim-value="dead-skeleton"]').click();
  for (const id of ['polyp-tissue', 'polyp-mouth', 'polyp-tentacles']) await expect.poll(() => shown(page, id)).toBe(false);
  await expect.poll(() => shown(page, 'polyp-skeleton')).toBe(true);
  expect((await sim(page)).outputs).toMatchObject({ 'tissue-shown': 0, 'partners-shown': 0 });
  await trial(page).locator('[data-sim-value="bleached-alive"]').click();
  await set(page, { 'depth-m': 1, 'water-case': 'less-turbid' });
  expect((await sim(page)).outputs).toMatchObject({ 'tissue-shown': 1, 'partners-shown': 0, 'tissue-evidence': 'bleached-alive', foods: 2 });
});

test('URL re-entry and browser back preserve the chosen comparison independently', async ({ page }) => {
  const a = 'ch=changing-one-node&sim=remove.n-phytoplankton~inspect.n-coral~depth-m.7~water-case.less-turbid~evidence-state.bleached-alive';
  await open(page, a);
  const original = await sim(page);
  await page.reload();
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  expect(await sim(page)).toEqual(original);
  await open(page, 'ch=bleaching-and-pressures&sim=evidence-state.dead-skeleton');
  await page.goBack();
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(async () => (await sim(page)).values).toEqual(original.values);
});

test('warm model comparisons work offline and make no external runtime requests', async ({ page, context }) => {
  const external: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      if (!['127.0.0.1', 'localhost'].includes(url.hostname)) external.push(request.url());
    }
  });
  await open(page, 'ch=changing-one-node');
  await context.setOffline(true);
  try {
    expect(await set(page, { remove: 'n-symbionts', 'depth-m': 7, 'evidence-state': 'bleached-alive' })).toBe(true);
    expect((await sim(page)).outputs).toMatchObject({ foods: 1, 'tissue-shown': 1, 'partners-shown': 0 });
    expect((await sim(page)).outputs['light-index']).toBeCloseTo(3.0197383422318502, 8);
    await expect(card(page).locator('[data-food-edge][data-active="true"]')).toHaveCount(3);
    expect(external).toEqual([]);
  } finally {
    await context.setOffline(false);
  }
});

for (const locale of ['en', 'zh']) test(`phone ${locale}: 44px web targets, keyboard, reduced motion and no horizontal overflow`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'ch=sunlight-and-food', locale, 'cinema');
  if (!(await card(page).isVisible())) await page.getByRole('button', { name: locale === 'en' ? 'Read' : '阅读', exact: true }).click();
  await expect(card(page)).toBeVisible();
  for (const node of await card(page).locator('[data-food-node]').all()) {
    await node.scrollIntoViewIfNeeded();
    const box = (await node.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
  }
  const fish = card(page).locator('[data-food-node="n-parrotfish"]');
  await fish.focus(); await page.keyboard.press('Enter');
  await expect(fish).toHaveAttribute('data-selected', 'true');
  expect((await sim(page)).values.inspect).toBe('n-coral');
  expect((await sim(page)).outputs['active-links']).toBe(4);
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

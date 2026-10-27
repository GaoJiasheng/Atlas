import { expect, test, type Page } from '@playwright/test';
import type { AtlasState } from '../src/engines/core/test-api';
import type { TimeSceneExt } from '../src/engines/time-scene';

/** Draft topic: direct routes only. Run with CI=1 ATLAS_E2E_PORT=5407 pnpm e2e. */
type Reader = { indexIds: string[]; selectedId: string | null; detailCount: number };
type Engine = { selectEvent(id: string): boolean; reader(): Reader };
type DatedStats = { datedLayers?: Record<string, { visible: number; total: number; filterUpdates: number }> };

async function open(page: Page, query = '', locale = 'en') {
  await page.goto(`/${locale}/topics/industrial-revolution/?${query}`);
  expect(await page.evaluate(async () => {
    for (let i = 0; i < 200 && !window.__atlas; i++) await new Promise((r) => setTimeout(r, 50));
    return window.__atlas?.ready;
  })).toBe(true);
  await expect(page.locator('.ts-geo')).toHaveAttribute('data-status', 'ready');
}

async function select(page: Page, id: string) {
  const selected = await page.evaluate((target) => (window.__atlas!.engine as unknown as Engine).selectEvent(target), id);
  if (selected) await expect.poll(async () => (await reader(page)).selectedId).toBe(id);
  return selected;
}

const reader = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).reader());
const timeState = (page: Page) => page.evaluate(() => window.__atlas!.state() as AtlasState & TimeSceneExt);
async function selectionState(page: Page) {
  const { chapter, t, camera, layers, highlight } = await timeState(page);
  return { chapter, t, camera, layers, highlight };
}

test('eight chapters and 37 beats remain a draft with no invented participants or routes', async ({ page }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => { if (/^https?:/.test(r.url()) && new URL(r.url()).hostname !== '127.0.0.1') external.push(r.url()); });
  await open(page);
  const chapters = await page.evaluate(() => window.__atlas!.chapters());
  expect(chapters).toHaveLength(8);
  expect(await page.evaluate(() => window.__atlas!.beats().length)).toBe(37);
  await expect(page.locator('#atlas-card')).toHaveCount(0);
  const beats = await page.evaluate(() => window.__atlas!.beats());
  for (let n = 0; n < beats.length; n++) {
    await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), n);
    const state = await timeState(page);
    expect(state.layers).not.toContain('control');
    expect(state.layers).not.toContain('borders');
    expect(state.layers).not.toContain('movements');
    await expect.poll(async () => (await timeState(page)).presentation?.chapter).toBe(beats[n]!.chapter);
  }
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('index places keep time; documentary events use precise dates and one top detail', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await open(page, 'ch=ir-work-cotton-coercion&t=1833');
  await page.locator('[data-time-target="loc-new-orleans"]').click();
  await expect.poll(async () => (await reader(page)).selectedId).toBe('loc-new-orleans');
  let state = await timeState(page);
  expect(state.chapter).toBe('ir-work-cotton-coercion');
  expect(String(state.t)).toMatch(/^1833/);
  expect(state.layers).toContain('sites');
  expect(state.highlight).toEqual(['loc-new-orleans']);
  expect(state.presentation).toBeNull();
  expect(await reader(page)).toMatchObject({ selectedId: 'loc-new-orleans', detailCount: 1 });
  expect(await select(page, 'ev-us-census-enslavement')).toBe(true);
  state = await timeState(page);
  expect(state.t).toBe('1860');
  expect(state.layers).toContain('battles');
  expect(state.chapter).toBe('ir-work-cotton-coercion');
  await expect(page.locator('.ts-event')).toHaveCount(1);
  await page.locator('.ts-event details summary').click();
  await expect(page.locator('.ts-event')).toContainText('3,953,760');
  await expect(page.locator('.ts-event')).toContainText('nationally');
  const before = await selectionState(page);
  const beforeReader = await reader(page);
  expect(await select(page, 'unknown')).toBe(false);
  expect(await selectionState(page)).toEqual(before);
  expect(await reader(page)).toEqual(beforeReader);
  await page.evaluate(() => window.__atlas!.goToChapter('ir-seas-signals', { instant: true }));
  expect(await select(page, 'ev-cable-completion')).toBe(true);
  expect((await timeState(page)).t).toBe('1870-12-31');
  expect(await reader(page)).toMatchObject({ selectedId: 'ev-cable-completion', detailCount: 1 });
});

test('all chapter index targets are selectable; presentation rejects selection without side effects', async ({ page }) => {
  await open(page);
  const chapters = await page.evaluate(() => window.__atlas!.chapters());
  const seen = new Set<string>();
  for (const chapter of chapters) {
    await page.evaluate((id) => window.__atlas!.goToChapter(id, { instant: true }), chapter);
    const ids = (await reader(page)).indexIds;
    for (const id of ids) {
      if (seen.has(id)) continue;
      expect(await select(page, id)).toBe(true);
      expect(await reader(page)).toMatchObject({ selectedId: id, detailCount: 1 });
      seen.add(id);
    }
  }
  expect(seen.size).toBe(58); // Includes §3.4's optional Kuala Lumpur reference in the Malaya chapter.
  await page.evaluate(() => window.__atlas!.setMode('presentation', true, { instant: true }));
  const before = await selectionState(page);
  expect(await select(page, 'loc-manchester')).toBe(false);
  expect(await selectionState(page)).toEqual(before);
});

test('closing a site restores the selected second axis beat, including its original highlight', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await open(page, 'ch=ir-thread-coal-power');
  await page.locator('[data-beat="ir-thread-coal-power.1"]').click();
  await expect.poll(async () => (await timeState(page)).t).toBe('1769');
  expect((await timeState(page)).highlight).toEqual(['loc-glasgow']);
  expect(await select(page, 'loc-dudley')).toBe(true);
  expect((await timeState(page)).t).toBe('1769');
  await page.locator('.ts-event__header button').click();
  await expect.poll(async () => (await reader(page)).selectedId).toBeNull();
  expect((await timeState(page)).highlight).toEqual(['loc-glasgow']);
  expect((await timeState(page)).presentation).toBeNull();
});

test('railway dates match the source sample and switching off removes every visible line', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await open(page, 'ch=ir-connected-world-debates&t=1914&layers=base,rail-rshapes,sites');
  const rails = () => page.evaluate(() => (window.__atlas!.stats() as unknown as DatedStats).datedLayers?.['rail-rshapes']);
  await expect.poll(async () => (await rails())?.total).toBe(8906); // same-year connected runs of the 18,804 RShapes lids
  await expect.poll(async () => (await rails())?.visible).toBe(8906);
  const toggle = page.locator('[data-layer="rail-rshapes"]');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(async () => (await rails())?.visible).toBe(0);
  await open(page, 'ch=ir-railways-networks&t=1834&layers=base,rail-rshapes,sites');
  await expect.poll(async () => (await rails())?.visible).toBe(11); // 35 lids
});

for (const locale of ['en', 'zh']) for (const theme of ['paper', 'cinema'] as const) {
  test(`${locale}/${theme}: phone index opens one visible top detail`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => sessionStorage.setItem('atlas:reader', 'collapsed'));
    await open(page, 'ch=ir-seas-signals', locale);
    await page.evaluate((t) => window.__atlas!.setTheme(t), theme);
    expect(await select(page, 'ev-cable-completion')).toBe(true);
    await expect(page.locator('.ts-event')).toHaveCount(1);
    await expect(page.locator('.ts-event')).toBeVisible();
    expect(await reader(page)).toMatchObject({ detailCount: 1, selectedId: 'ev-cable-completion' });
    await expect(page.locator('.ts-event')).toContainText(locale === 'zh' ? '马德拉斯—新加坡电缆完成' : 'Madras–Singapore cable completed');
    const detail = await page.locator('.ts-event').boundingBox();
    expect(detail!.y).toBeGreaterThanOrEqual(0);
    expect(detail!.y).toBeLessThan(844);
    expect(await page.evaluate(() => sessionStorage.getItem('atlas:reader'))).toBe('collapsed');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  });
}

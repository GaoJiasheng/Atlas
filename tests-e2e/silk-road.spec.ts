import { expect, test, type Page } from '@playwright/test';

/**
 * silk-road (docs/73, draft): the Old World plate with its own rivers, chapters
 * in date order (the two sea chapters interleaved by first beat), BCE and CE on
 * one axis, dashed dated route layers (E-SR1), schematic journeys (E-SR2), and
 * the Chinese text.
 */
type LayerStats = { total: number; visible: number };

async function open(page: Page, query: string, locale = 'en') {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`/${locale}/topics/silk-road/?${query}`);
  expect(await page.evaluate(async () => {
    for (let i = 0; i < 200 && !window.__atlas; i++) await new Promise((resolve) => setTimeout(resolve, 50));
    return window.__atlas?.ready;
  })).toBe(true);
  await expect(page.locator('.ts-geo')).toHaveAttribute('data-status', 'ready', { timeout: 30_000 });
}

async function beat(page: Page, chapter: string, index: number) {
  const beats = await page.evaluate(() => window.__atlas!.beats());
  const i = beats.findIndex((b) => b.chapter === chapter && b.index === index);
  expect(i).toBeGreaterThanOrEqual(0);
  await page.evaluate((n) => window.__atlas!.goToBeat(n, { instant: true }), i);
}

const layers = (page: Page) => page.evaluate(() => (window.__atlas!.stats() as unknown as { datedLayers: Record<string, LayerStats> }).datedLayers);

test('plate files only, chapters in date order, BCE and CE on one axis', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await open(page, '');
  await expect.poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((e) => e.name.includes('/geo/ancient-world-plate.json')))).toBe(true);
  const geo = await page.evaluate(() => performance.getEntriesByType('resource').map((e) => /\/geo\/([^/?]+\.json)/.exec(e.name)?.[1]).filter((n): n is string => Boolean(n)));
  expect(await page.evaluate(() => window.__atlas!.chapters())).toEqual([
    'background', 'zhang-qian', 'monsoon-seas', 'four-empires', 'faiths-on-the-road', 'sogdians-and-tang',
    'baghdad-and-paper', 'ports-and-emporia', 'mongol-conquests', 'mongol-roads', 'plague-on-the-roads',
  ]);
  // 4 background beats + 10 chapters × 5.
  expect((await page.evaluate(() => window.__atlas!.beats())).length).toBe(54);
  expect(geo).toEqual(expect.arrayContaining(['ancient-world-plate.json', 'silk-road-rivers.json']));
  for (const world of ['land-50m.json', 'land-10m-sea.json', 'borders-50m.json']) expect(geo).not.toContain(world);
  const labels = await page.locator('.ts-seg__date').allTextContents();
  expect(labels).toEqual(expect.arrayContaining(['138 BCE', '148 CE', '1338']));
  expect(labels.filter((l) => /^-?\d{4}(-\d\d)?$/.test(l) && !/^1\d{3}$/.test(l))).toEqual([]);
  expect(errors).toEqual([]);
});

test('route layers appear in their own years and are dashed in the key', async ({ page }) => {
  await open(page, 'ch=zhang-qian');
  await expect.poll(async () => (await layers(page))?.['routes-han']?.total).toBe(4);
  await beat(page, 'zhang-qian', 4); // 60 BCE: the Han roads, before Isidore's stations
  await expect.poll(async () => (await layers(page))['routes-han']?.visible).toBe(3);
  await expect(page.locator('.atlas-legend__item', { hasText: 'Han and Parthian roads' }).locator('line[stroke-dasharray]')).toBeAttached();
  await beat(page, 'mongol-roads', 4); // about 1340: Pegolotti's road
  await expect.poll(async () => (await layers(page))['routes-mongol']?.visible).toBe(1);
  await expect(page.locator('.ts-co[data-id="site-tana"]')).toBeVisible();
});

test('the sea chapters show the computed sea routes and the Srivijaya sphere', async ({ page }) => {
  await open(page, 'ch=ports-and-emporia');
  await expect.poll(async () => (await layers(page))?.['sea-tang']?.visible).toBe(1);
  await beat(page, 'ports-and-emporia', 1); // 1025
  await expect.poll(async () => (await layers(page))['srivijaya-sphere']?.visible).toBe(1);
  await expect(page.locator('.ts-co[data-id="evt-chola-raid-1025"]')).toBeVisible();
});

test('Chinese text: names and the reading note', async ({ page }) => {
  await open(page, 'ch=zhang-qian', 'zh');
  const reader = page.locator('[data-hud-panel="reader"]');
  await expect(reader).toContainText('凿空');
  await page.evaluate(() => window.__atlas!.goToChapter('mongol-roads', { instant: true }));
  await expect(reader).toContainText('术赤兀鲁思');
  await page.evaluate(() => window.__atlas!.goToChapter('background', { instant: true }));
  await expect(reader).toContainText('空白的地方并不是没有人');
});

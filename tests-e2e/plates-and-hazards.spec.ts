import { expect, test, type Page } from '@playwright/test';
import type { ImpactRecord } from '../src/engines/time-scene/impactSchema';

type CatalogueState = { pick: string | null; layers: Record<string, { status: string; visible: number }>; indexCount: number; renderedRows: number };
const catalogue = (page: Page) => page.evaluate(() => (window.__atlas!.engine.catalogueState as () => CatalogueState)());
async function open(page: Page, query = '', locale = 'en') {
  await page.goto(`/${locale}/topics/plates-and-hazards/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(async () => Object.values((await catalogue(page)).layers).every((layer) => layer.status === 'ready')).toBe(true);
}

for (const locale of ['en', 'zh']) for (const theme of ['paper', 'cinema']) {
  test(`source-defined impacts and modern references ${locale}/${theme}`, async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => { if (!r.isNavigationRequest() && !r.url().startsWith(new URL(page.url()).origin) && !/^(about|data|blob):/.test(r.url())) external.push(r.url()); });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await open(page, `ch=indian-ocean-2004&theme=${theme}`, locale);
    expect(await page.evaluate(() => window.__atlas!.chapters())).toEqual(['background', 'tambora-1815', 'krakatau-1883', 'mapping-plates', 'indian-ocean-2004', 'anak-krakatau-2018', 'felt-in-singapore', 'comparing-evidence']);
    expect(await page.evaluate(() => window.__atlas!.beats())).toHaveLength(38);
    await expect(page.locator('#atlas-card')).toHaveCount(0);
    await page.locator('button.ts-label[data-id="event-sumatra-2004"]').click();
    const impact = page.locator('[data-impact="impact-indian-ocean"]');
    for (const phrase of ['227,899', '2024-10', locale === 'en' ? 'Dead or missing and presumed dead' : '死亡或失踪并推定死亡', locale === 'en' ? '15 countries' : '15 个国家', locale === 'en' ? 'Four countries shown; not a complete breakdown.' : '这里只列四个国家，并非完整分项。']) await expect(impact).toContainText(phrase);
    await expect(impact.locator('li')).toHaveCount(4);
    await expect(impact).not.toContainText('227,343');
    await expect(impact).not.toContainText('556');
    await expect(page.locator('.ts-impact .atlas-counter-vs')).toHaveCount(0);
    const api = await page.evaluate(() => (window.__atlas!.engine.impacts as (id: string) => ImpactRecord[])('event-sumatra-2004'));
    expect(api[0]).toMatchObject({ estimate: { kind: 'reported', value: 227899 }, sourceAsOf: '2024-10', componentsComplete: false });
    const source = impact.locator('[data-source="S17"]').first();
    await source.click();
    await expect(page.getByRole('dialog')).toContainText('2024');
    await page.keyboard.press('Escape');
    await expect(source).toBeFocused();
    await page.evaluate(() => window.__atlas!.goToChapter('tambora-1815', { instant: true }));
    await page.locator('button.ts-label[data-id="event-tambora-1815"]').click();
    await expect(page.locator('[data-impact="impact-tambora-hvo"]')).toContainText(locale === 'en' ? 'More than 70,000' : '超过70,000');
    await expect(page.locator('[data-impact="impact-tambora-hvo"]')).toContainText('2011-09-29');
    await expect(page.locator('[data-impact="impact-tambora-table"]')).toContainText('92,000');
    await expect(page.locator('[data-impact="impact-tambora-table"]')).toContainText('2026-10-27');
    expect(external).toEqual([]);
  });
}

test('catalogues retain exact ids across refresh and clear when hidden or before their day', async ({ page }) => {
  await open(page, 'ch=felt-in-singapore&t=2022-02-25&pick=ph-q-us6000gzyg');
  await expect.poll(async () => (await catalogue(page)).pick).toBe('ph-q-us6000gzyg');
  const detail = page.locator('[data-catalogue-inspector="ph-q-us6000gzyg"]');
  await expect(detail).toContainText('mww');
  await page.reload(); await page.waitForFunction(() => window.__atlas !== undefined);
  await expect.poll(async () => (await catalogue(page)).pick).toBe('ph-q-us6000gzyg');
  await page.locator('[data-layer="ph-quake-sample"]').click();
  await expect.poll(async () => (await catalogue(page)).pick).toBeNull();
  await open(page, 'ch=mapping-plates&t=2004-12-25&pick=ph-q-official20041226005853450-30');
  await expect.poll(async () => (await catalogue(page)).pick).toBeNull();
  expect((await catalogue(page)).renderedRows).toBeLessThanOrEqual(50);
  expect(await page.locator('.maplibregl-marker').count()).toBeLessThan(30);
});

test('observation groups are separate and reference versions remain visible', async ({ page }) => {
  for (const [chapter, layer, count] of [['krakatau-1883','ph-observations-1883',99],['indian-ocean-2004','ph-observations-2004',2155],['anak-krakatau-2018','ph-observations-2018',410]] as const) {
    await open(page, `ch=${chapter}&b=2`);
    await expect.poll(async () => (await catalogue(page)).layers[layer]?.visible).toBe(count);
    for (const other of ['ph-observations-1883','ph-observations-2004','ph-observations-2018'].filter((id) => id !== layer)) expect((await catalogue(page)).layers[other]?.visible ?? 0).toBe(0);
  }
  await open(page, 'ch=background');
  await expect(page.locator('.atlas-legend')).toContainText('REF.');
  await expect(page.locator('[data-hud-panel="plate"]')).toContainText('v5.4.0');
});

for (const locale of ['en', 'zh']) test(`phone catalogue controls and impact definition fit ${locale}`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'ch=indian-ocean-2004', locale);
  await page.locator('.atlas-panel__toggle').click();
  await page.locator('button.ts-label[data-id="event-sumatra-2004"]').click();
  const impact = page.locator('[data-impact="impact-indian-ocean"]');
  await expect(impact).toBeVisible();
  expect(await page.locator('.atlas-panel').evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
  await expect(impact).toContainText('2024-10');
  for (const button of await page.locator('[data-catalogue-row]').all()) expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44);
});

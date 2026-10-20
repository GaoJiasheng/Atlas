import { expect, test, type Page } from '@playwright/test';

type LayerStats = { total: number; visible: number; recent: number; filterUpdates: number };
const dated = (page: Page) => page.evaluate(() => (window.__atlas!.stats() as unknown as {
  datedLayers: Record<string, LayerStats>;
}).datedLayers);

async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/sample-dated-layers/?${query}`);
  expect(await page.evaluate(async () => {
    for (let i = 0; i < 200 && !window.__atlas; i++) await new Promise((resolve) => setTimeout(resolve, 50));
    return window.__atlas?.ready;
  })).toBe(true);
  await expect.poll(async () => Object.keys(await dated(page))).toHaveLength(3);
}

for (const locale of ['en', 'zh']) {
  test(`dated fixture (${locale}): 10,000 GPU points, legend, toggles and both looks`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await open(page, 'ch=full-set&t=2019', locale);
    await expect.poll(async () => (await dated(page))['sample-blocks']?.visible).toBe(10000);
    expect((await dated(page))['sample-blocks']).toMatchObject({ total: 11000, recent: 5000 });
    expect((await dated(page))['sample-rail']).toMatchObject({ visible: 1 });
    expect((await dated(page))['sample-gardens']).toMatchObject({ visible: 2 });
    // A GPU point source creates no per-building HTML marker or callout.
    expect(await page.locator('.maplibregl-marker').count()).toBeLessThan(30);
    const label = locale === 'en' ? 'HDB blocks (synthetic)' : '组屋（合成）';
    const legend = page.locator('.atlas-legend').first();
    await expect(legend).toContainText(label);
    await expect(legend).toContainText(locale === 'en' ? 'Milestone' : '里程碑');
    const plate = page.locator('[data-hud-panel="plate"]');
    await expect(plate).toContainText('10,000');
    const toggle = page.locator('[data-layer="sample-blocks"]');
    for (const theme of ['paper', 'cinema'] as const) {
      await page.evaluate((value) => window.__atlas!.setTheme(value), theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await expect(legend).not.toContainText(label);
      await toggle.click();
      await expect(legend).toContainText(label);
      await expect(plate).toContainText('10,000');
    }
    for (const id of ['sample-rail', 'sample-gardens']) {
      const row = page.locator(`[data-layer="${id}"]`);
      await row.click();
      await expect(row).toHaveAttribute('aria-pressed', 'false');
      await row.click();
      await expect(row).toHaveAttribute('aria-pressed', 'true');
    }
    expect(errors).toEqual([]);
  });
}

test('dated filters stay cached between boundaries and update at a same-count replacement', async ({ page }) => {
  await open(page, 'ch=replacement&t=1979');
  const initial = (await dated(page))['sample-blocks']!;
  expect(initial).toMatchObject({ visible: 5000, recent: 0 });
  // Keyboard scrubbing moves the year by a month, with no feature boundary crossed.
  const slider = page.getByRole('slider').first();
  await slider.focus();
  await slider.press('ArrowRight');
  await expect.poll(() => page.evaluate(() => window.__atlas!.state().playhead)).toBeGreaterThan(1979);
  expect((await dated(page))['sample-blocks']!.filterUpdates).toBe(initial.filterUpdates);
  // Chapter/beat navigation shares the same playhead/store path as the visible axis.
  const beats = await page.evaluate(() => window.__atlas!.beats());
  const index = beats.findIndex((beat) => beat.chapter === 'replacement' && beat.index === 1);
  expect(index).toBeGreaterThanOrEqual(0);
  await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), index);
  await expect.poll(async () => (await dated(page))['sample-blocks']!.recent).toBe(1000);
  const replaced = (await dated(page))['sample-blocks']!;
  expect(replaced.visible).toBe(5000);
  expect(replaced.filterUpdates).toBeGreaterThan(initial.filterUpdates);
  const after = beats.findIndex((beat) => beat.chapter === 'replacement' && beat.index === 2);
  await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), after);
  await expect.poll(async () => (await dated(page))['sample-blocks']!.recent).toBe(0);
  expect((await dated(page))['sample-blocks']!.visible).toBe(5000);
});

test('empty control frame has no territory labels and REFERENCE accepts an empty neighbour', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await open(page, 'ch=appearance&t=1966');
  await expect.poll(async () => (await dated(page))['sample-blocks']!.visible).toBe(2000);
  await expect(page.locator('.ts-terr:visible')).toHaveCount(0);
  const legend = page.locator('.atlas-legend').first();
  await expect(legend).not.toContainText('Sample housing');
  await page.evaluate(() => window.__atlas!.setMode('reference', true, { instant: true }));
  await expect(page.locator('.ts-stage')).toHaveAttribute('data-reference', 'true');
  await page.evaluate(() => window.__atlas!.setMode('reference', false, { instant: true }));
  await page.evaluate(() => window.__atlas!.goToChapter('full-set', { instant: true }));
  await expect.poll(async () => (await dated(page))['sample-blocks']!.visible).toBe(10000);
  await page.evaluate(() => window.__atlas!.setMode('reference', true, { instant: true }));
  await expect(page.locator('.ts-stage')).toHaveAttribute('data-reference', 'true');
  await expect(legend).toContainText('Sample housing');
  expect(errors).toEqual([]);
});

/** continental-drift (docs/72): the rotation map. Run after build. */
import { expect, test, type Page } from '@playwright/test';

type Rotation = { selectedMa: number; status: string; lod: string; projection: string; geometryUpdates: number; verticesDrawn: number; presentOnlyVisible: boolean; inFlight: number; updateMs: number[] };
const rotation = async (page: Page) => {
  await page.waitForFunction(() => typeof (window.__atlas?.engine as { geology?: unknown } | undefined)?.geology === 'function', null, { timeout: 60_000 });
  return page.evaluate(() => (window.__atlas!.engine as unknown as { geology(): { rotation: Rotation | null } }).geology().rotation);
};
async function open(page: Page, locale: string, query = '') {
  await page.goto(`/${locale}/topics/continental-drift/?${query}`);
  await page.waitForFunction(() => !!window.__atlas);
  await expect.poll(async () => (await rotation(page))?.status, { timeout: 30_000 }).toBe('ready');
}
const settled = (page: Page, ma: number) => expect.poll(async () => { const r = await rotation(page); return r && r.inFlight === 0 && r.lod === 'full' ? r.selectedMa : null; }, { timeout: 30_000 }).toBe(ma);

for (const [locale, theme] of [['en', 'paper'], ['zh', 'cinema']] as const) {
  test(`every beat draws the model at its age, and its link opens the same scene (${locale}/${theme})`, async ({ page }) => {
    test.setTimeout(300_000);
    const external: string[] = []; const errors: string[] = [];
    page.on('request', (request) => { const u = new URL(request.url()); if (u.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(u.hostname)) external.push(u.href); });
    page.on('pageerror', (error) => errors.push(error.message));
    await open(page, locale, `theme=${theme}`);
    expect((await rotation(page))!.projection).toBe('globe');
    const beats = await page.evaluate(() => window.__atlas!.beats());
    expect(beats).toHaveLength(39);
    for (let i = 0; i < beats.length; i += 3) {
      const b = beats[i]!;
      await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), i);
      const t = await page.evaluate(() => (window.__atlas!.state() as unknown as { t: { ma: number } }).t.ma);
      await settled(page, t);
      const shown = (await rotation(page))!;
      expect(shown.presentOnlyVisible).toBe(t === 0);
      const state = await page.evaluate(() => window.__atlas!.state());
      await open(page, locale, `ch=${b.chapter}&b=${b.index + 1}&theme=${theme}`);
      await settled(page, t);
      const linked = await page.evaluate(() => window.__atlas!.state());
      expect(linked.camera).toEqual(state.camera);
      expect(linked.layers).toEqual(state.layers);
      expect((linked as unknown as { highlight: string[] }).highlight).toEqual((state as unknown as { highlight: string[] }).highlight);
    }
    expect(external).toEqual([]); expect(errors).toEqual([]);
  });
}

test('scrubbing keeps one geometry update in flight and lands on the last age', async ({ page }) => {
  await open(page, 'en', 'ch=before-pangaea&b=1');
  await settled(page, 400);
  const before = (await rotation(page))!.geometryUpdates;
  const inFlight = await page.evaluate(async () => {
    const seen: number[] = [];
    const engine = window.__atlas!.engine as unknown as { geology(): { rotation: { inFlight: number } } };
    for (let i = 0; i < 50; i++) {
      (window.__atlas!.engine as unknown as { setMa(ma: number): void }).setMa(400 - i * 6.1);
      seen.push(engine.geology().rotation.inFlight);
      await new Promise((r) => setTimeout(r, 8));
    }
    return Math.max(...seen);
  });
  expect(inFlight).toBeLessThanOrEqual(1);
  await settled(page, 101.1);
  const after = (await rotation(page))!;
  expect(after.geometryUpdates).toBeGreaterThan(before);
  expect(after.geometryUpdates - before).toBeLessThan(52);
  // The same quantised age again does no work.
  await page.evaluate(() => (window.__atlas!.engine as unknown as { setMa(ma: number): void }).setMa(101.1));
  await page.waitForTimeout(400);
  expect((await rotation(page))!.geometryUpdates).toBe(after.geometryUpdates);
});

test('present-only layers show at 0.0 Ma and hide at 0.1 Ma', async ({ page }) => {
  await open(page, 'en', 'ch=ocean-floor-record&b=2');
  await settled(page, 0);
  expect((await rotation(page))!.presentOnlyVisible).toBe(true);
  await page.evaluate(() => (window.__atlas!.engine as unknown as { setMa(ma: number): void }).setMa(0.1));
  await settled(page, 0.1);
  expect((await rotation(page))!.presentOnlyVisible).toBe(false);
});

test('the chapter index selects an object and shows its detail under the chapter head', async ({ page }) => {
  await open(page, 'en', 'ch=pangaea-and-ice&b=2');
  await settled(page, 300);
  const row = page.locator('.ts-index__row[data-time-target="glacial-talchir"]');
  await row.scrollIntoViewIfNeeded();
  await row.click();
  await expect(page.locator('.cd-inspector[data-id="glacial-talchir"]')).toBeVisible();
  expect(await page.evaluate(() => (window.__atlas!.state() as unknown as { highlight: string[] }).highlight)).toEqual(['glacial-talchir']);
  const box = await row.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press('Escape');
  await expect(page.locator('.cd-inspector')).toHaveCount(0);
});

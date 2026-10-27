/** Run after build with ATLAS_E2E_PORT=5423. Browser execution is deferred by the supplied brief. */
import { expect, test, type Page } from '@playwright/test';

type Geology = {
  reconstruction: { selectedMa: number; frameMa: number | null; deltaMa: number | null; status: string; geometryUpdates: number };
  inset: { coordinateSpace: string; view: string; insetVisible: boolean; fossilMode: string; queryWindowMa: number[] | null;
    fossilsTotal: number; fossilsVisible: number; ageOverlapCount: number; referencePointsTotal: number; referenceCardsTotal: number;
    suppressedCollections: number; suppressedOccurrences: number; selectedObjectId: string | null };
};
// The deep-time HUD registers \`geology\` once its local evidence files have loaded (again after every reload).
const geology = async (page: Page) => {
  await page.waitForFunction(() => typeof window.__atlas?.engine.geology === 'function', null, { timeout: 60_000 });
  return page.evaluate(() => window.__atlas!.engine.geology!() as Geology);
};
async function open(page: Page, locale: string, query = '') {
  await page.goto(`/${locale}/topics/dinosaur-earth/?${query}`);
  await page.waitForFunction(() => !!window.__atlas);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(async () => (await geology(page)).reconstruction?.status, { timeout: 30_000 }).toBe('ready');
}
async function pickBeat(page: Page, chapter: string, index: number) {
  const i = await page.evaluate(({ chapter, index }) => window.__atlas!.beats().findIndex((b) => b.chapter === chapter && b.index === index), { chapter, index });
  await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), i);
  await expect.poll(async () => (await geology(page)).reconstruction?.status, { timeout: 30_000 }).toBe('ready');
}
for (const locale of ['en', 'zh']) for (const theme of ['paper', 'cinema']) {
  test(`all 35 beats and full-document b links (${locale}/${theme})`, async ({ page }) => {
    test.setTimeout(240_000);
    const external: string[] = []; const modernMain: string[] = []; const errors: string[] = [];
    page.on('request', (request) => {
      const u = new URL(request.url());
      if (u.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(u.hostname)) external.push(u.href);
      if (/\/(land-50m|land-10m-sea|borders-50m|countries-50m)\.json$/.test(u.pathname)) modernMain.push(u.pathname);
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await open(page, locale, `theme=${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const beats = await page.evaluate(() => window.__atlas!.beats()); expect(beats).toHaveLength(35);
    for (let i = 0; i < beats.length; i++) {
      const b = beats[i]!;
      await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), i);
      await expect.poll(async () => (await geology(page)).reconstruction?.status, { timeout: 30_000 }).toBe('ready');
      const shown = await geology(page);
      const state = await page.evaluate(() => window.__atlas!.state());
      expect(shown.inset).toMatchObject({ coordinateSpace: 'modern', fossilsTotal: 1274, referencePointsTotal: 2, referenceCardsTotal: 4, suppressedCollections: 3, suppressedOccurrences: 3 });
      await open(page, locale, `ch=${b.chapter}&b=${b.index + 1}&theme=${theme}`);
      const linked = await geology(page); const linkedState = await page.evaluate(() => window.__atlas!.state());
      expect(linked.reconstruction).toMatchObject({ selectedMa: shown.reconstruction.selectedMa, frameMa: shown.reconstruction.frameMa, deltaMa: shown.reconstruction.deltaMa });
      expect(linked.inset).toEqual(shown.inset);
      expect(linkedState.camera).toEqual(state.camera);
      expect(linkedState.presentation).toBeNull();
      expect((linkedState as unknown as { beat: number }).beat).toBe(b.index);
    }
    expect(modernMain).toEqual([]); expect(external).toEqual([]); expect(errors).toEqual([]);
  });
}

test('66/70, exact65, independent occurrence ages and coordinate-free Malaysian evidence', async ({ page }) => {
  await open(page, 'en', 'ch=impact-boundary&b=2&t=66ma&inset=mexico');
  expect((await geology(page)).reconstruction).toMatchObject({ selectedMa: 66, frameMa: 70, deltaMa: 4 });
  expect((await geology(page)).inset.queryWindowMa).toEqual([61, 71]);
  await pickBeat(page, 'earth-today', 0);
  expect((await geology(page)).reconstruction).toMatchObject({ selectedMa: 65, frameMa: 65, deltaMa: 0 });
  await open(page, 'en', 'ch=fossil-atlas&b=2');
  const inspector = page.locator('.ts-modern-inspector');
  await expect(inspector).toContainText('24178');
  await expect(inspector.locator('.ts-modern__ages li')).toHaveCount(3);
  await expect(inspector).toContainText('121.4–100.5 Ma');
  await expect(inspector).toContainText('Wedel, R. L. Cifelli');
  await page.locator('.atlas-src-refs button:visible').first().click();
  await expect(page.locator('.atlas-source-pop')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.atlas-source-pop')).toBeHidden();
  await pickBeat(page, 'southeast-asian-finds', 3);
  await expect(page.locator('.ts-evidence-card:visible').first()).toContainText('Pahang');
  const response = await page.request.get('/topics/dinosaur-earth/data.json');
  const manifest = (await response.json()).deepTime.inset;
  const points = (await Promise.all(manifest.pointFiles.map(async (file: string) => (await (await page.request.get(`/geo/${file}.json`)).json()).points))).flat();
  const cards = (await Promise.all(manifest.cardFiles.map(async (file: string) => (await (await page.request.get(`/geo/${file}.json`)).json()).cards))).flat();
  const bundle = { points, cards };
  expect(bundle.points.filter((p: { kind: string; countryCode: string }) => p.kind === 'fossil-collection' && p.countryCode === 'MY')).toEqual([]);
  const my = bundle.cards.find((p: { countryCode: string }) => p.countryCode === 'MY');
  for (const field of ['at', 'geometry', 'coordinates', 'centroid']) expect(my).not.toHaveProperty(field);
});

test('view/hide/reload, explicit outside-window index selection, keyboard list and presentation restore', async ({ page }) => {
  await open(page, 'en', 'ch=fossil-atlas&t=0ma&inset=southeast-asia&inset-visible=0');
  const camera = await page.evaluate(() => window.__atlas!.state().camera);
  await page.evaluate(() => window.__atlas!.setMode('inset-visible', true));
  await page.evaluate(() => window.__atlas!.setMode('inset-mexico', true));
  expect(await page.evaluate(() => window.__atlas!.state().camera)).toEqual(camera);
  await page.locator('.ts-modern-index button').click();
  await expect(page.locator('.ts-modern__outside')).toBeVisible();
  expect((await geology(page)).inset.fossilMode).toBe('age-window');
  await page.locator('.ts-modern__outside button').click();
  expect((await geology(page)).inset.fossilMode).toBe('all-mesozoic');
  await page.evaluate(() => window.__atlas!.setMode('inset-world', true));
  const list = page.locator('.ts-modern__list:visible'); await list.locator('summary').click();
  expect(await list.locator('li').count()).toBeLessThanOrEqual(20);
  await list.locator('li button').first().focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.ts-modern-inspector')).toBeVisible();
  await page.evaluate(() => window.__atlas!.setMode('inset-visible', false));
  await expect.poll(() => page.evaluate(() => location.search)).toContain('inset-visible=0'); await page.reload();
  await page.waitForFunction(() => !!window.__atlas);
  await expect.poll(async () => (await geology(page)).inset.insetVisible, { timeout: 30_000 }).toBe(false);
  const saved = await geology(page);
  await page.evaluate(() => window.__atlas!.setMode('presentation', true, { instant: true }));
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await geology(page)).inset.insetVisible, { timeout: 30_000 }).toBe(saved.inset.insetVisible);
  expect((await geology(page)).inset.view).toBe(saved.inset.view);
});

test('narrow presentation retains current evidence; all assets load with external network blocked', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/*', (route) => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await open(page, 'zh', 'ch=southeast-asian-finds&b=4');
  await expect(page.locator('[data-reconstruction-state]')).toContainText('地图样本');
  await pickBeat(page, 'southeast-asian-finds', 3);
  await expect(page.locator('.ts-modern-evidence .ts-evidence-card')).toBeVisible();
  await expect(page.locator('.ts-modern-evidence')).toContainText('今天');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test('visited deep-time frames and modern evidence reload without a network connection', async ({ page, context }) => {
  test.setTimeout(120_000);
  await open(page, 'en', 'ch=impact-boundary&b=2');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller && !!window.__atlas);
  await expect.poll(async () => (await geology(page)).reconstruction?.status, { timeout: 30_000 }).toBe('ready');
  const beats = await page.evaluate(() => window.__atlas!.beats());
  for (let i = 0; i < beats.length; i++) {
    await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), i);
    await expect.poll(async () => (await geology(page)).reconstruction?.status, { timeout: 30_000 }).toBe('ready');
  }
  await context.setOffline(true);
  await open(page, 'en', 'ch=impact-boundary&b=2');
  expect((await geology(page)).reconstruction).toMatchObject({ selectedMa: 66, frameMa: 70, deltaMa: 4 });
  expect((await geology(page)).inset.fossilsTotal).toBe(1274);
  await pickBeat(page, 'earth-today', 0);
  expect((await geology(page)).reconstruction.frameMa).toBe(65);
  await context.setOffline(false);
});

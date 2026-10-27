/** Synthetic TEST/DESIGN fixture: no scientific coastlines, dates or fossil discoveries are asserted. */
import { expect, test, type Page } from '@playwright/test';

type Geology = {
  reconstruction: { selectedMa: number; frameId: string | null; frameMa: number | null; deltaMa: number | null;
    status: string; geometryUpdates: number };
  inset: { view: string; insetVisible: boolean; fossilMode: string; fossilsTotal: number; fossilsVisible: number;
    ageOverlapCount: number; referencePointsTotal: number; referenceCardsTotal: number;
    suppressedCollections: number; suppressedOccurrences: number; selectedObjectId: string | null };
};
const geology = (page: Page) => page.evaluate(() => window.__atlas!.engine.geology!() as Geology);
async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/sample-deep-time/?${query}`);
  await page.waitForFunction(() => Boolean(window.__atlas));
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  // The deep-time HUD mounts after its local evidence files; the frame is ready once its tiles are drawn (slow under software GL).
  await page.waitForFunction(() => typeof window.__atlas?.engine.geology === 'function', null, { timeout: 60_000 });
  await expect.poll(async () => (await geology(page)).reconstruction?.status, { timeout: 30_000 }).toBe('ready');
}
async function beat(page: Page, chapter: string, localIndex: number) {
  const globalIndex = await page.evaluate(({ chapter, localIndex }) => window.__atlas!.beats().findIndex((b) => b.chapter === chapter && b.index === localIndex), { chapter, localIndex });
  expect(globalIndex).toBeGreaterThanOrEqual(0);
  await page.evaluate((index) => window.__atlas!.goToBeat(index, { instant: true }), globalIndex);
}

for (const locale of ['en', 'zh']) {
  test(`deep-time fixture (${locale}): beat links, exact samples and source isolation in both themes`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(new URL(request.url()).pathname));
    await open(page, 'ch=impact-samples&b=2&t=66ma&inset=mexico', locale);
    expect((await geology(page)).reconstruction).toMatchObject({ selectedMa: 66, frameMa: 70, deltaMa: 4 });
    expect((await geology(page)).inset).toMatchObject({ view: 'mexico', fossilsTotal: 4, referencePointsTotal: 2, referenceCardsTotal: 4,
      suppressedCollections: 2, suppressedOccurrences: 3, selectedObjectId: 'sample-de-reference-impact' });
    expect((await page.evaluate(() => window.__atlas!.state())) as { beat?: number }).toMatchObject({ beat: 1 });
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__atlas));
    await expect.poll(async () => (await geology(page)).reconstruction?.status, { timeout: 30_000 }).toBe('ready');
    expect((await geology(page)).reconstruction).toMatchObject({ selectedMa: 66, frameMa: 70, deltaMa: 4 });
    for (const theme of ['paper', 'cinema'] as const) {
      const before = (await geology(page)).reconstruction.geometryUpdates;
      await page.evaluate((theme) => window.__atlas!.setTheme(theme), theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      expect((await geology(page)).reconstruction.geometryUpdates).toBe(before);
      await beat(page, 'impact-samples', 2);
      await expect.poll(async () => (await geology(page)).reconstruction.frameMa, { timeout: 30_000 }).toBe(65);
      const frame65 = (await geology(page)).reconstruction.geometryUpdates;
      await beat(page, 'impact-samples', 3);
      expect((await geology(page)).reconstruction).toMatchObject({ selectedMa: 32.5, frameMa: 65, deltaMa: 32.5, geometryUpdates: frame65 });
      await beat(page, 'impact-samples', 1);
      await expect.poll(async () => (await geology(page)).reconstruction.frameMa, { timeout: 30_000 }).toBe(70);
    }
    expect(requests.filter((path) => /\/(land-50m|land-10m-sea|countries-50m|borders-50m)\.json$/.test(path))).toEqual([]);
  });
}

test('independent occurrence windows, layer visibility and inset restoration', async ({ page }) => {
  await open(page, 'ch=fossil-windows&b=1');
  expect((await geology(page)).inset).toMatchObject({ fossilsTotal: 4, fossilsVisible: 2, ageOverlapCount: 2 });
  for (const [localIndex, count] of [[1, 2], [2, 0], [3, 1], [4, 1]]) {
    await beat(page, 'fossil-windows', localIndex!);
    await expect.poll(async () => (await geology(page)).inset.fossilsVisible, { timeout: 30_000 }).toBe(count);
  }
  await page.evaluate(() => window.__atlas!.setMode('presentation', false, { instant: true }));
  await page.evaluate(() => window.__atlas!.setMode('inset-mexico', true));
  const camera = await page.evaluate(() => window.__atlas!.state().camera);
  await page.evaluate(() => window.__atlas!.setMode('inset-southeast-asia', true));
  expect(await page.evaluate(() => window.__atlas!.state().camera)).toEqual(camera);
  await page.evaluate(() => window.__atlas!.setMode('inset-visible', false));
  expect((await geology(page)).inset).toMatchObject({ insetVisible: false, view: 'southeast-asia', fossilsTotal: 4 });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__atlas));
  await expect.poll(async () => (await geology(page)).reconstruction?.status, { timeout: 30_000 }).toBe('ready');
  expect((await geology(page)).inset).toMatchObject({ insetVisible: false, view: 'southeast-asia' });
  await page.evaluate(() => window.__atlas!.setMode('inset-visible', true));
  await page.evaluate(() => window.__atlas!.setMode('fossil-all', true));
  expect((await geology(page)).inset).toMatchObject({ fossilsVisible: 4, fossilMode: 'all-mesozoic' });
  await page.locator('[data-layer="fossils-modern"]').click();
  expect((await geology(page)).inset).toMatchObject({ fossilsVisible: 0, fossilsTotal: 4, referencePointsTotal: 2, referenceCardsTotal: 4 });
});

test('missing younger sample stays blank and late older work cannot overwrite it', async ({ page }) => {
  await page.route('**/geo/sample-de-land-65.json', (route) => route.fulfill({ status: 404, body: 'TEST missing sample' }));
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/geo/sample-de-land-70.json', async (route) => {
    await held;
    await route.continue().catch(() => {}); // A correctly aborted request may already be gone.
  });
  await open(page, 'ch=fossil-windows&t=100ma');
  await beat(page, 'impact-samples', 1);
  await expect.poll(async () => (await geology(page)).reconstruction.status, { timeout: 30_000 }).toBe('loading');
  expect((await geology(page)).reconstruction.frameMa).toBeNull();
  await beat(page, 'impact-samples', 2);
  await expect.poll(async () => (await geology(page)).reconstruction.status, { timeout: 30_000 }).toBe('unavailable');
  release();
  expect((await geology(page)).reconstruction).toMatchObject({ selectedMa: 65, frameId: null, frameMa: null, deltaMa: null, status: 'unavailable' });
});

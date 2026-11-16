/**
 * sample-plate-rotation (docs/72 §4.6): the rotation map engine on synthetic TEST plates, independent of
 * the continental-drift content. Run after build. No scientific claim.
 */
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { createRotationModel, type RotationFile } from '../src/engines/time-scene/lib/plateRotation';

type Rotation = { selectedMa: number; status: string; lod: string; projection: string; geometryUpdates: number; featuresDrawn: number; verticesDrawn: number; inFlight: number };
type Engine = { geology(): { rotation: Rotation | null }; setMa(ma: number): void; rotationAt(id: string, ma?: number): [number, number] | null };
const model = createRotationModel(JSON.parse(readFileSync('public/geo/spr-rotations.json', 'utf8')) as RotationFile);

const rotation = async (page: Page) => {
  await page.waitForFunction(() => typeof (window.__atlas?.engine as { geology?: unknown } | undefined)?.geology === 'function', null, { timeout: 60_000 });
  return page.evaluate(() => (window.__atlas!.engine as unknown as Engine).geology().rotation);
};
const at = (page: Page, id: string) => page.evaluate((id) => (window.__atlas!.engine as unknown as Engine).rotationAt(id), id);
async function open(page: Page, locale: string, query = '') {
  await page.goto(`/${locale}/topics/sample-plate-rotation/?${query}`);
  await page.waitForFunction(() => !!window.__atlas);
  await expect.poll(async () => (await rotation(page))?.status, { timeout: 30_000 }).toBe('ready');
}
const settled = (page: Page, ma: number) => expect.poll(async () => { const r = await rotation(page); return r && r.inFlight === 0 && r.lod === 'full' ? r.selectedMa : null; }, { timeout: 30_000 }).toBe(ma);
const near = (a: [number, number] | null, b: [number, number] | null) => {
  expect(a).not.toBeNull(); expect(b).not.toBeNull();
  expect(Math.abs(a![0] - b![0])).toBeLessThan(1e-9); expect(Math.abs(a![1] - b![1])).toBeLessThan(1e-9);
};

for (const [locale, theme] of [['en', 'paper'], ['zh', 'cinema']] as const) {
  test(`beats, deep links and positions match the model (${locale}/${theme})`, async ({ page }) => {
    const external: string[] = []; const errors: string[] = [];
    page.on('request', (r) => { const u = new URL(r.url()); if (u.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(u.hostname)) external.push(u.href); });
    page.on('pageerror', (e) => errors.push(e.message));
    await open(page, locale, `theme=${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect((await rotation(page))!.projection).toBe('globe');
    await expect(page.locator('[data-rotation="model"] dd')).toContainText('TEST MODEL');
    const beats = await page.evaluate(() => window.__atlas!.beats());
    expect(beats).toHaveLength(6);
    for (let i = 0; i < beats.length; i++) {
      const b = beats[i]!;
      await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), i);
      const t = await page.evaluate(() => (window.__atlas!.state() as unknown as { t: { ma: number } }).t.ma);
      await settled(page, t);
      near(await at(page, 'spr-site'), model.rotatePoint(3, t, [100, 5]));
      const state = await page.evaluate(() => window.__atlas!.state());
      await open(page, locale, `ch=${b.chapter}&b=${b.index + 1}&theme=${theme}`);
      await settled(page, t);
      const linked = await page.evaluate(() => window.__atlas!.state());
      expect(linked.camera).toEqual(state.camera);
      expect(linked.layers).toEqual(state.layers);
      expect((linked as unknown as { highlight: string[] }).highlight).toEqual((state as unknown as { highlight: string[] }).highlight);
      await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), i);
    }
    expect(external).toEqual([]); expect(errors).toEqual([]);
  });
}

test('the fixed-plate switch, valid times and labels follow the model', async ({ page }) => {
  await open(page, 'en', 'ch=fixed-plate-switch&b=1');
  const setMa = (ma: number) => page.evaluate((ma) => (window.__atlas!.engine as unknown as Engine).setMa(ma), ma);
  // TEST: plate 3 follows plate 1 below 100 Ma and plate 2 from 100 Ma (the first sequence to reach it wins).
  for (const ma of [100.1, 100, 99.9]) {
    await setMa(ma); await settled(page, ma);
    near(await at(page, 'spr-site'), model.rotatePoint(3, ma, [100, 5]));
  }
  await setMa(100); await settled(page, 100);
  expect((await at(page, 'spr-site'))![0]).toBeCloseTo(80, 9);
  await setMa(99.9); await settled(page, 99.9);
  expect((await at(page, 'spr-site'))![0]).toBeGreaterThan(110);
  // The antimeridian ring and record pbdb-col-2 exist from 150 Ma only.
  await page.goto('/en/topics/sample-plate-rotation/?ch=turning-plates&b=2');
  await expect.poll(async () => (await rotation(page))?.status, { timeout: 30_000 }).toBe('ready');
  await settled(page, 160);
  const at160 = (await rotation(page))!;
  expect(await at(page, 'pbdb-col-2')).toBeNull();
  near(await at(page, 'spr-group'), model.rotatePoint(1, 160, [-30, -70]));
  await setMa(150); await settled(page, 150);
  // One more ring (land) and one more record (fossils) than at 160 Ma.
  expect((await rotation(page))!.featuresDrawn).toBe(at160.featuresDrawn + 2);
  near(await at(page, 'pbdb-col-2'), model.rotatePoint(2, 150, [175, 20]));
  // The early label shows only from 200 to 120 Ma.
  await expect(page.locator('.cd-name[data-id="spr-name-early"]')).toHaveCSS('opacity', '1');
  await setMa(119.9); await settled(page, 119.9);
  await expect(page.locator('.cd-name[data-id="spr-name-early"]')).toHaveCSS('opacity', '0');
});

test('dragging the playhead scrubs with the coarse level and settles on the fine one', async ({ page }) => {
  await open(page, 'en', 'ch=turning-plates&b=1');
  await settled(page, 200);
  const before = (await rotation(page))!;
  const box = (await page.locator('.ts-rule__grab').boundingBox())!;
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  const lods: string[] = [];
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(cx + i * 25, cy, { steps: 2 });
    lods.push((await rotation(page))!.lod);
  }
  await page.mouse.up();
  expect(lods).toContain('scrub');
  const dropped = (await rotation(page))!.selectedMa;
  expect(dropped).toBeLessThan(200);
  await settled(page, dropped);
  const after = (await rotation(page))!;
  expect(after.geometryUpdates).toBeGreaterThan(before.geometryUpdates);
  near(await at(page, 'spr-site'), model.rotatePoint(3, dropped, [100, 5]));
  // The chapter index selects an object and shows its detail under the chapter head.
  const row = page.locator('.ts-index__row[data-time-target="spr-glacial"]');
  await row.scrollIntoViewIfNeeded();
  await row.click();
  await expect(page.locator('.cd-inspector[data-id="spr-glacial"]')).toBeVisible();
  expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

/** Browser acceptance for docs/61; run after build with ATLAS_E2E_PORT=5449. */
import { expect, test, type Page } from '@playwright/test';

type Values = Record<string, number | string | boolean>;
type Anchor = { shown: boolean; onScreen: boolean; x: number; y: number };
type Engine = {
  sim(): { values: Values; outputs: Record<string, number | string>; sources?: Record<string, string[]> };
  setSim(values: Values): boolean;
  anchor(id: string): Anchor | null;
  copies(id: string): number | null;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const anchor = (page: Page, id: string) => page.evaluate((id) => (window.__atlas!.engine as unknown as Engine).anchor(id), id);
const set = (page: Page, values: Values) => page.evaluate((values) => (window.__atlas!.engine as unknown as Engine).setSim(values), values);
const readout = (page: Page, id: string) => page.locator(`.space-try [data-sim-output="${id}"]`);
async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/saturn-v/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const chapter = (page: Page, id: string) => page.evaluate((id) => window.__atlas!.goToChapter(id, { instant: true }), id);
const blur = (page: Page) => page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

test.describe('saturn-v', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

  test('cold-link beat 2, reload, chapter-axis navigation and presentation reconstruct the same ideal-model defaults', async ({ page }) => {
    await open(page, 'ch=ideal-model&b=2');
    const linked = await sim(page);
    expect(linked.values).toMatchObject({ payload: 200, propellant: 600, 'carry-inert': false, phase: 3 });
    expect(linked.outputs['ideal-dv']).toBeCloseTo(3295.836866004329, 8);
    await expect(readout(page, 'ideal-dv')).toContainText('3295.84');
    const camera = await page.evaluate(() => window.__atlas!.state().camera);
    const labels = await page.locator('.space-leaders').getAttribute('data-want');
    await page.reload();
    await page.waitForFunction(() => window.__atlas !== undefined);
    expect((await sim(page)).values).toEqual(linked.values);
    expect((await sim(page)).outputs).toEqual(linked.outputs);
    await chapter(page, 'orientation');
    await page.locator('.atlas-axis__tick[data-beat="ideal-model.1"]').click();
    await expect.poll(async () => (await sim(page)).values).toEqual(linked.values);
    expect(await page.evaluate(() => window.__atlas!.state().camera)).toEqual(camera);
    expect(await page.locator('.space-leaders').getAttribute('data-want')).toEqual(labels);
    await blur(page);
    await page.keyboard.press('p');
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().presentation)).not.toBeNull();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => (await sim(page)).values).toEqual(linked.values);
    await page.keyboard.press('p');
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().presentation)).toBeNull();
    expect((await sim(page)).values).toEqual(linked.values);
  });

  test('real controls change mass ratio, stage selection preserves the ideal calculation, and an edited value survives reload', async ({ page }) => {
    await open(page, 'ch=ideal-model&b=2');
    await page.locator('.space-try [data-sim-control="payload"] [data-sim-value="300"]').click();
    await expect.poll(async () => (await sim(page)).values.payload).toBe(300);
    const expected = 3000 * Math.log(1000 / 400);
    expect((await sim(page)).outputs['ideal-dv']).toBeCloseTo(expected, 8);
    await expect(page).toHaveURL(/sim=.*payload\.300/);
    for (const [stage, engines] of [['first', 5], ['second', 5], ['third', 1]] as const) {
      expect(await set(page, { 'stage-choice': stage })).toBe(true);
      expect((await sim(page)).outputs['engine-count']).toBe(engines);
      expect((await sim(page)).outputs['ideal-dv']).toBeCloseTo(expected, 8);
    }
    await page.reload();
    await page.waitForFunction(() => window.__atlas !== undefined);
    expect((await sim(page)).values.payload).toBe(300);
    expect((await sim(page)).outputs['ideal-dv']).toBeCloseTo(expected, 8);
  });

  test('all eleven main engines, three couches and four landing legs are real repeated model parts', async ({ page }) => {
    await open(page, 'ch=orientation');
    // copies() is a count-binding diagnostic, not the geometry's repeat count. Check the
    // deployed static payload that the renderer consumes, then its registered anchors.
    const payload = await (await page.request.get('/topics/saturn-v/data.json')).json();
    const parts = payload.parts.parts as { id: string; repeat?: { count: number } }[];
    const ids = ['f1-centre', 'f1-outer', 'j2-centre', 'j2-outer', 'sivb-engine', 'cm-couches', 'lm-legs', 'lm-ladder'];
    const counts = ids.map((id) => parts.find((p) => p.id === id)!.repeat?.count ?? 1);
    expect(counts).toEqual([1, 4, 1, 4, 1, 3, 4, 1]);
    for (const id of ids) expect(await anchor(page, id), id).not.toBeNull();
  });

  test('every beat and chapter index points to visible geometry; returning hides the probe, tower and service module', async ({ page }) => {
    test.setTimeout(240_000);
    await open(page, 'ch=orientation');
    const chapters = await page.evaluate(() => window.__atlas!.chapters());
    expect(chapters).toHaveLength(7);
    for (const id of chapters) {
      await chapter(page, id);
      await expect(page.locator('[data-sim-control="phase"]')).toHaveCount(0);
      const ticks = page.locator(`.atlas-axis__tick[data-beat^="${id}."]`);
      await expect(ticks).toHaveCount(5);
      const ids = await page.locator('.space-index__row[data-part]').evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.part!));
      const checked = new Set<string>();
      for (let beat = 0; beat < 5; beat++) {
        await ticks.nth(beat).click();
        const wanted = (await page.locator('.space-leaders').getAttribute('data-want') ?? '').split(/[\s,]+/).filter(Boolean);
        for (const part of wanted) await expect.poll(async () => (await anchor(page, part))?.shown, { message: `${id}/${beat + 1}: ${part}` }).toBe(true);
        // The chapter's "view configuration" beat must be chosen before selecting a hidden part.
        for (const part of ids) {
          if (checked.has(part) || !(await anchor(page, part))?.shown) continue;
          const row = page.locator(`.space-index__row[data-part="${part}"]`);
          await row.click();
          await expect(row).toHaveAttribute('aria-pressed', 'true');
          await expect(page.locator('.space-inspector__summary')).toBeVisible();
          await expect.poll(async () => (await anchor(page, part))?.shown, { message: `${id} index: ${part}` }).toBe(true);
          checked.add(part);
        }
      }
      expect([...checked].sort(), `${id}: every indexed part needs a visible configuration`).toEqual([...ids].sort());
    }
    await open(page, 'ch=home-in-the-cone&b=4');
    for (const id of ['cm-probe', 'les-tower', 'sm-shell', 'lm-ascent', 'sic-shell']) await expect.poll(async () => (await anchor(page, id))?.shown, { message: `${id} must be absent on return` }).toBe(false);
    expect((await sim(page)).values.phase).toBe(12);
    await expect.poll(async () => (await anchor(page, 'cm-heatshield'))?.shown).toBe(true);
  });

  test('native view-configuration links preserve locale and restore the named return configuration before index selection', async ({ page }) => {
    for (const locale of ['en', 'zh']) {
      await open(page, 'ch=ideal-model&b=2', locale);
      const more = page.locator('details.atlas-more').filter({ has: page.locator('a[href="?ch=ideal-model&b=5"]') });
      await more.locator('summary').click();
      await more.locator('a[href="?ch=ideal-model&b=5"]').click();
      await page.waitForFunction(() => window.__atlas !== undefined && window.__atlas.ready);
      await expect(page).toHaveURL(new RegExp(`/${locale}/topics/saturn-v/\\?ch=ideal-model&b=5`));
      expect((await sim(page)).outputs['configuration-name']).toBe('return');
      const row = page.locator('.space-index__row[data-part="cm-shell"]');
      await row.click();
      await expect(row).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(async () => (await anchor(page, 'cm-shell'))?.shown).toBe(true);
    }
  });

  for (const locale of ['en', 'zh']) for (const theme of ['paper', 'cinema'] as const) {
    test(`${locale}/${theme} on a 390px phone: drawer, 44px controls, finite readouts and zero external requests`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const external: string[] = [], errors: string[] = [];
      page.on('request', (r) => { if (/^https?:/.test(r.url()) && !/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(r.url())) external.push(r.url()); });
      page.on('pageerror', (e) => errors.push(e.message));
      await open(page, `ch=ideal-model&b=2&theme=${theme}`, locale);
      await page.getByRole('button', { name: locale === 'en' ? 'Read' : '阅读', exact: true }).click();
      await expect(readout(page, 'ideal-dv')).toContainText('3295.84');
      for (const id of ['payload', 'propellant', 'carry-inert']) {
        const control = page.locator(`.space-try [data-sim-control="${id}"] button`).first();
        await control.scrollIntoViewIfNeeded();
        const box = (await control.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(390);
      }
      await page.locator('.space-try [data-sim-control="payload"] [data-sim-value="100"]').click();
      expect((await sim(page)).outputs['ideal-dv']).toBeCloseTo(3000 * Math.log(800 / 200), 8);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
      expect(errors).toEqual([]);
      expect(external).toEqual([]);
    });
  }
});

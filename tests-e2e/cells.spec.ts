/** Browser gate for the main session: CI=1 ATLAS_E2E_PORT=5451 pnpm e2e cells.spec.ts.
 * Deliberately not run by the restricted build session. */
import { expect, test, type Page } from '@playwright/test';

type Values = Record<string, string | number | boolean>;
type Field = {
  specimen: string; totalPower: number; fieldDiameterUm: number;
  targetUV: [number, number]; targetLocation: string; focusStatus: string; viewStatus: string;
  visibleFeatureIds: string[]; bufferSize: [number, number];
};
type Engine = {
  sim(): { values: Values; outputs: Record<string, string | number> };
  setSim(values: Values): boolean;
  microscopeField(): Field | null;
  anchor(id: string): { shown: boolean; onScreen: boolean } | null;
};
const engine = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const field = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).microscopeField());
const set = (page: Page, values: Values) => page.evaluate(v => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/cells/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}

test.describe('cells', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

  for (const locale of ['en', 'zh']) for (const theme of ['paper', 'cinema']) {
    test(`${locale}/${theme}: eight chapters, forty isolated beats, no external content requests`, async ({ page }) => {
      const errors: string[] = [], external: string[] = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('request', r => { if (/^https?:/.test(r.url()) && new URL(r.url()).hostname !== '127.0.0.1') external.push(r.url()); });
      await open(page, 'ch=before-you-start&b=1', locale);
      await page.evaluate(t => window.__atlas!.setTheme(t as 'paper' | 'cinema'), theme);
      await expect(page.locator('.atlas-axis__tick')).toHaveCount(40);
      expect(await page.evaluate(() => window.__atlas!.chapters())).toHaveLength(8);
      for (const ch of ['animal-cell-parts', 'plant-cell-parts', 'microscope-safely', 'cells-and-systems']) {
        await page.evaluate(ch => window.__atlas!.goToChapter(ch, { instant: true }), ch);
        await expect.poll(async () => (await engine(page)).values['field-on']).toBe(false);
        const ids = await page.locator('.space-index [data-part]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-part')!));
        expect(ids.length).toBeGreaterThan(0);
        for (const id of ids) {
          await page.locator(`.space-index [data-part="${id}"]`).click({ force: true });
          await expect.poll(() => page.evaluate(() => (window.__atlas!.state() as unknown as { part: string | null }).part)).toBe(id);
        }
      }
      expect(errors).toEqual([]); expect(external).toEqual([]);
    });
  }

  test('low power, centre, high power and fine focus use the actual field outputs', async ({ page }) => {
    await open(page, 'ch=microscope-try-it&b=1');
    expect(await field(page)).toMatchObject({ totalPower: 40, fieldDiameterUm: 4500, specimen: 'onion-bulb' });
    expect(await set(page, { 'slide-x': -200 })).toBe(true);
    await expect.poll(async () => (await field(page))?.targetUV[0]).toBe(0);
    expect(await set(page, { objective: 40 })).toBe(true);
    await expect.poll(async () => (await field(page))?.fieldDiameterUm).toBe(450);
    expect((await field(page))?.totalPower).toBe(400);
    expect(await set(page, { 'focus-z': 1 })).toBe(true);
    expect((await field(page))?.focusStatus).toBe('soft');
    expect(await set(page, { 'focus-z': 2 })).toBe(true);
    expect((await field(page))?.focusStatus).toBe('blurred');
    expect(await set(page, { 'focus-z': 0 })).toBe(true);
    expect((await field(page))?.focusStatus).toBe('sharp');
  });

  test('both object axes invert, off-field target and darkness preserve the arithmetic', async ({ page }) => {
    await open(page, 'ch=microscope-try-it&b=3');
    await set(page, { objective: 40, 'slide-x': -100, 'slide-y': 100 });
    let f = (await field(page))!;
    expect(f.targetUV[0]).toBeCloseTo(-100 / 225, 9); expect(f.targetUV[1]).toBeCloseTo(-100 / 225, 9);
    await set(page, { 'slide-x': 100 });
    expect((await field(page))?.targetLocation).toBe('outside');
    await set(page, { illumination: 0 }); f = (await field(page))!;
    expect(f.viewStatus).toBe('dark'); expect(f.totalPower).toBe(400); expect(f.fieldDiameterUm).toBe(450);
  });

  test('field structures distinguish onion, pondweed and prepared cheek specimens', async ({ page }) => {
    await open(page, 'ch=compare-cells&b=2');
    const onion = (await field(page))!;
    expect(onion.visibleFeatureIds.some(id => id.includes('onion-nucleus'))).toBe(true);
    expect(onion.visibleFeatureIds.some(id => /chloroplast/.test(id))).toBe(false);
    await page.locator('[data-beat="compare-cells.2"]').click();
    await expect.poll(async () => (await field(page))?.specimen).toBe('pondweed-leaf');
    expect((await field(page))!.visibleFeatureIds.some(id => /chloroplast/.test(id))).toBe(true);
    await page.locator('[data-beat="compare-cells.3"]').click();
    await expect.poll(async () => (await field(page))?.specimen).toBe('prepared-cheek');
    expect((await field(page))!.visibleFeatureIds.some(id => /wall|chloroplast/.test(id))).toBe(false);
    for (const dimension of (await field(page))!.bufferSize) expect(dimension).toBeLessThanOrEqual(512);
  });

  test('nonsequential beats restore complete state; invalid values cannot corrupt it', async ({ page }) => {
    await open(page, 'ch=microscope-try-it&b=4');
    expect((await field(page))?.focusStatus).toBe('soft');
    await page.locator('[data-beat="microscope-try-it.0"]').click();
    await expect.poll(async () => (await field(page))?.totalPower).toBe(40);
    expect((await engine(page)).values).toMatchObject({ objective: 4, 'slide-x': 0, 'focus-z': 0, 'field-on': true });
    expect(await set(page, { objective: 20 })).toBe(false);
    expect((await field(page))?.totalPower).toBe(40);
    const url = new URL(page.url()); url.searchParams.set('sim', 'objective.20');
    await page.goto(url.toString());
    await page.waitForFunction(() => window.__atlas !== undefined);
    expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
    expect((await engine(page)).values.objective).toBe(4);
  });

  test('shared scene URL preserves observation values in the other language and theme', async ({ page }) => {
    await open(page, 'ch=microscope-try-it&b=3');
    await set(page, { specimen: 'pondweed-leaf', objective: 40, 'focus-z': 3, 'slide-x': -100, 'slide-y': 100 });
    const before = await field(page);
    await expect(page).toHaveURL(/sim=/);
    const url = new URL(page.url()); url.pathname = url.pathname.replace('/en/', '/zh/');
    await page.goto(url.toString()); await page.waitForFunction(() => window.__atlas !== undefined);
    expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
    await page.evaluate(() => window.__atlas!.setTheme('cinema'));
    const after = await field(page);
    for (const key of ['specimen', 'totalPower', 'fieldDiameterUm', 'targetUV', 'focusStatus'] as const) expect(after![key]).toEqual(before![key]);
  });

  test('phone drawer exposes a single accessible field and working controls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=microscope-try-it&b=3');
    await expect(page.locator('.space-try')).toHaveCount(1);
    const canvas = page.locator('.space-try canvas[role="img"]');
    await expect(canvas).toHaveCount(1); await expect(canvas).toHaveAttribute('aria-label', /.+/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const button = page.locator('.space-try [data-sim-control="objective"] button').first();
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox(); expect(box!.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: 'tests-e2e/__screenshots__/cells-phone-390.png' });
  });

  for (const locale of ['en', 'zh']) test(`${locale}: links return to plant, living things and organ-system topics`, async ({ page }) => {
    await open(page, 'ch=cells-and-systems', locale);
    for (const slug of ['plant', 'living-things', 'digestive-system', 'heart-and-lungs']) await expect(page.locator(`.atlas-reader a[href*="/${locale}/topics/${slug}/"]`).first()).toHaveAttribute('href', new RegExp(`/${locale}/topics/${slug}/`));
  });
});

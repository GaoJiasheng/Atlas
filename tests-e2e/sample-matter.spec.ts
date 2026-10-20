/** Seven pure matter models drive the visible primitive bench and its six try-it cards. */
import { expect, test, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

type Fill = { volume: number; level: number; shown: boolean };
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, number | string>; timeline: Record<string, unknown> };
  fill(id: string): Fill | null;
  fillBenchmark(id: string): number | null;
  flow(id: string): { paths: Record<string, { visible: boolean }> } | null;
  anchor(id: string): { x: number; y: number; shown: boolean } | null;
  setSim(values: Record<string, number | string | boolean>): boolean;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const fill = (page: Page, id: string) => page.evaluate((part) => (window.__atlas!.engine as unknown as Engine).fill(part), id);
const flow = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).flow('escaping-air'));
const set = (page: Page, values: Record<string, number | string | boolean>) => page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const card = (page: Page) => page.locator('.space-try');
async function open(page: Page, query: string, lang = 'en') {
  await page.goto(`/${lang}/topics/sample-matter/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(() => fill(page, 'cyl-a-water')).not.toBeNull();
}

test.describe('sample-matter (matter model and volume fill)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('background has its reading note, BG axis segment and no card', async ({ page }) => {
    await open(page, 'ch=before-you-start');
    await expect(page.locator('.atlas-note')).toContainText('draft checks engine behaviour');
    await expect(page.locator('.atlas-axis')).toContainText('BG');
    await expect(card(page)).toHaveCount(0);
    expect((await sim(page)).timeline).toEqual({});
  });

  test('deep links restore weighing and displacement, with visible levels in the same units', async ({ page }) => {
    await open(page, 'ch=weigh&sim=weigh-object.sponge');
    expect((await sim(page)).outputs.mass).toBeCloseTo(11.5, 1);
    await expect(card(page).locator('[data-sim-output="mass"]')).toContainText('11.5');
    await expect(page.locator('.space-plate__simstate')).toContainText('SIM');
    await open(page, 'ch=displacing&sim=drop-object.stone');
    expect((await sim(page)).outputs.reading).toBe(125);
    const water = (await fill(page, 'cyl-b-water'))!;
    expect(water.shown).toBe(true);
    expect(water.volume).toBeCloseTo(125e-6, 9);
    expect(water.level).toBeCloseTo(125e-6 / (Math.PI * .0185 ** 2), 6);
  });

  for (const [container, liquid, height] of [
    ['cylinder', 'cyl-a-water', 18.6], ['glass', 'glass-water', 7.1],
    ['flask', 'flask-water', 5.0], ['bowl', 'bowl-water', 3.0],
  ] as const) {
    test(`deep-linked ${container}: the drawn fill agrees with the model reading`, async ({ page }) => {
      await open(page, `ch=pouring&sim=container.${container}`);
      const s = await sim(page);
      expect(Number(s.outputs.level)).toBeCloseTo(height, 1);
      expect(s.outputs.poured).toBe(200);
      const liquidFill = (await fill(page, liquid))!;
      expect(liquidFill.volume).toBeCloseTo(200e-6, 9);
      expect(liquidFill.level * 100).toBeCloseTo(Number(s.outputs.level), 1);
      expect(liquidFill.shown).toBe(true);
      for (const other of ['cyl-a-water', 'glass-water', 'flask-water', 'bowl-water'].filter((p) => p !== liquid)) {
        expect((await fill(page, other))!.shown).toBe(false);
      }
    });
  }

  test('a live pour eases both volumes together and conserves all 200 ml mid-pour', async ({ page }) => {
    await open(page, 'ch=pouring');
    await card(page).locator('[data-sim-control="container"] [data-sim-value="flask"]').click();
    await expect.poll(async () => {
      const f = await fill(page, 'flask-water');
      return f !== null && f.volume > 1e-6 && f.volume < 199e-6;
    }, { intervals: [16, 16, 32] }).toBe(true);
    const pair = await page.evaluate(() => {
      const e = window.__atlas!.engine as unknown as Engine;
      return [e.fill('cyl-a-water')!, e.fill('flask-water')!];
    });
    expect(pair[0]!.volume + pair[1]!.volume).toBeCloseTo(200e-6, 8);
    expect(pair.every((f) => f.shown)).toBe(true);
    await expect.poll(async () => (await fill(page, 'flask-water'))!.volume).toBeCloseTo(200e-6, 9);
    await expect.poll(async () => (await fill(page, 'cyl-a-water'))!.shown).toBe(false);
  });

  test('one hundred live flask rebuilds stay inside the five millisecond CPU budget', async ({ page }, testInfo) => {
    await open(page, 'ch=pouring&sim=container.flask');
    const elapsed = await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).fillBenchmark('flask-water'));
    const benchmarkPath = testInfo.outputPath('fill-benchmark.json');
    await writeFile(benchmarkPath, JSON.stringify({ part: 'flask-water', frames: 100, elapsedMs: elapsed }));
    await testInfo.attach('fill-benchmark', { path: benchmarkPath, contentType: 'application/json' });
    expect(elapsed).not.toBeNull();
    expect(elapsed!).toBeLessThan(5);
    expect((await fill(page, 'flask-water'))!.volume).toBeCloseTo(200e-6, 9);
  });

  test('the cup cavity raises basin water, the tissue becomes wet, and bubble paths remain independent', async ({ page }) => {
    await open(page, 'ch=air&sim=cup-place.pushed~cup-hole.0~water-added.20');
    const closed = await sim(page);
    expect(Number(closed.outputs['basin-level'])).toBeCloseTo(14.9, 1);
    expect(Number(closed.outputs['basin-rise'])).toBeCloseTo(8.9, 1);
    expect(closed.outputs.tissue).toBe('dry');
    expect((await fill(page, 'basin-water'))!.shown).toBe(false);
    expect((await fill(page, 'basin-water-cup'))!.shown).toBe(true);
    expect((await fill(page, 'cup-water'))!.level).toBeCloseTo(.001, 3);
    await expect.poll(async () => (await flow(page))?.paths['sand-gaps']?.visible).toBe(true);
    await expect.poll(async () => (await flow(page))?.paths['cup-hole']?.visible).toBe(false);
    expect(await set(page, { 'cup-hole': true })).toBe(true);
    await expect.poll(async () => (await flow(page))?.paths['cup-hole']?.visible).toBe(true);
    expect((await flow(page))!.paths['sand-gaps']!.visible).toBe(true);
    await expect.poll(async () => (await fill(page, 'cup-water'))!.volume).toBeCloseTo(Math.PI * .035 ** 2 * .09, 8);
    expect((await sim(page)).outputs.tissue).toBe('wet');
    expect(Number((await sim(page)).outputs['basin-rise'])).toBeCloseTo(1.3, 1);
    // The two visible pieces partition the original basin water without duplication.
    const water = await page.evaluate(() => {
      const e = window.__atlas!.engine as unknown as Engine;
      return e.fill('basin-water-cup')!.volume + e.fill('cup-water')!.volume;
    });
    expect(water).toBeCloseTo(Math.PI * .12 ** 2 * .14, 8);
    await set(page, { 'water-added': 40 });
    await expect.poll(async () => (await flow(page))?.paths['sand-gaps']?.visible).toBe(false);
    expect((await flow(page))!.paths['cup-hole']!.visible).toBe(true);
  });

  test('equal loads lower only the air plunger and removing them settles it back', async ({ page }) => {
    await open(page, 'ch=squeezing');
    const anchors = () => page.evaluate(() => {
      const e = window.__atlas!.engine as unknown as Engine;
      return [e.anchor('plunger-air'), e.anchor('plunger-water'), e.anchor('plunger-sand')];
    });
    await expect.poll(async () => (await anchors())[0]?.shown).toBe(true);
    const before = await anchors();
    const relative = (a: typeof before, index: number) => a[index]!.y - a[2]!.y;
    await set(page, { load: 4 });
    const values = (await sim(page)).outputs;
    expect(Number(values['v-air'])).toBeCloseTo(9.0, 1);
    expect(Number(values['v-water'])).toBeCloseTo(20.0, 1);
    expect(values['v-sand']).toBe(20);
    await expect.poll(async () => relative(await anchors(), 0) - relative(before, 0)).toBeGreaterThan(10);
    // Compare against the fixed sand plunger, so camera settling cancels out.
    await expect.poll(async () => Math.abs(relative(await anchors(), 1) - relative(before, 1))).toBeLessThan(1);
    await set(page, { load: 0 });
    await expect.poll(async () => Math.abs(relative(await anchors(), 0) - relative(before, 0)), { timeout: 10_000 }).toBeLessThan(1);
  });

  test('sand fills pores before its liquid rises; the box jug empties by the same amount', async ({ page }) => {
    await open(page, 'ch=pores&sim=water-added.20');
    expect((await sim(page)).outputs['sand-reading']).toBe(100);
    expect((await sim(page)).outputs['air-gaps']).toBe(15);
    expect((await fill(page, 'water-over-sand'))!.shown).toBe(false);
    expect((await fill(page, 'jug-water'))!.volume).toBeCloseTo(80e-6, 9);
    expect((await fill(page, 'jug-water'))!.level).toBeCloseTo(-.04 + 80e-6 / (.05 * .05), 6);
    await set(page, { 'water-added': 100 });
    expect((await sim(page)).outputs['sand-reading']).toBe(165);
    expect((await sim(page)).outputs['air-gaps']).toBe(0);
    await expect.poll(async () => (await fill(page, 'water-over-sand'))!.volume).toBeCloseTo(65e-6, 9);
    expect((await fill(page, 'water-over-sand'))!.level).toBeCloseTo(165e-6 / (Math.PI * .0185 ** 2), 6);
    await expect.poll(async () => (await fill(page, 'jug-water'))!.shown).toBe(false);
  });

  test('records use choice bars and step lines, including three syringe series', async ({ page }) => {
    await open(page, 'ch=weigh');
    for (const object of ['stone', 'sponge']) {
      await set(page, { 'weigh-object': object });
      await card(page).locator('[data-sim-record]').click();
    }
    await expect(card(page).locator('.space-chart[data-kind="bar"] svg')).toHaveAttribute('role', 'img');
    await open(page, 'ch=squeezing');
    for (const load of [0, 2, 4]) {
      await set(page, { load });
      await card(page).locator('[data-sim-record]').click();
    }
    await expect(card(page).locator('.space-chart[data-kind="line"] svg[role="img"]')).toHaveAttribute('aria-label', /Air volume.*Water volume.*Sand volume/);
  });

  test('prediction reveals the pores state without grading it', async ({ page }) => {
    await open(page, 'ch=pores');
    await card(page).locator('[data-predict="less"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('Observed: Less');
    expect((await sim(page)).outputs['sand-reading']).toBe(165);
  });

  test('Chinese cinema and reduced motion preserve the final levels and translated readings', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'ch=pouring&theme=cinema&sim=container.bowl', 'zh');
    await expect(card(page)).toContainText('液面高度');
    await expect(card(page).locator('[data-sim-output="poured"]')).toContainText('200');
    expect((await fill(page, 'bowl-water'))!.level).toBeCloseTo(.03, 3);
    await set(page, { container: 'glass' });
    await expect.poll(async () => (await fill(page, 'glass-water'))!.volume).toBeCloseTo(200e-6, 9);
  });

  test('phone card and chart fit the drawer with 44 px controls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=pores');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    for (const water of [0, 40, 100]) {
      await set(page, { 'water-added': water });
      await page.evaluate(() => document.querySelector<HTMLButtonElement>('.space-try [data-sim-record]')!.click());
    }
    for (const selector of ['[data-sim-record]', '[data-predict="less"]', '[data-sim-control="water-added"] button']) {
      const target = card(page).locator(selector).first();
      await target.scrollIntoViewIfNeeded();
      expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    const chart = card(page).locator('.space-chart svg');
    await chart.scrollIntoViewIfNeeded();
    const box = (await chart.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

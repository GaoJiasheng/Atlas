/** Browser gates are authored for the main session, ATLAS_E2E_PORT=5452. */
import { expect, test, type Page } from '@playwright/test';

type Values = Record<string, number | string | boolean>;
type Readings = Record<string, number | string | null>;
type Echo = { elapsedVisual: number; u: number; pathPosition: number; atReturn: boolean; playing: boolean; hiddenReason: string | null; physicalEchoMs: number | null; slowFactor: number };
type Senses = {
  profile: string; eye?: unknown;
  wave: { positions: number[]; rests: number[]; phaseCycles: number; visualHz: number; playing: boolean; hiddenReason: string | null };
  sourceMarkers: Record<string, { phaseCycles: number; visualHz: number; on: number }>;
  soundLab: { echo: Echo };
};
type Engine = {
  sim(): { values: Values; outputs: Readings; table: { vary: unknown; values: Readings }[] };
  senses(): Senses;
  setSim(values: Values): boolean;
  apply(patch: object): boolean;
  sensesSeek(cycles: number): boolean;
  sensesEchoSeek(progress: number): boolean;
};
const senses = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).senses());
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, values: Values) => page.evaluate(v => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const apply = (page: Page, patch: object) => page.evaluate(p => (window.__atlas!.engine as unknown as Engine).apply(p), patch);
const waveSeek = (page: Page, cycles: number) => page.evaluate(c => (window.__atlas!.engine as unknown as Engine).sensesSeek(c), cycles);
const echoSeek = (page: Page, progress: number) => page.evaluate(u => (window.__atlas!.engine as unknown as Engine).sensesEchoSeek(u), progress);
const card = (page: Page) => page.locator('.space-try');
async function open(page: Page, query: string, locale = 'en', theme = 'paper') {
  await page.goto(`/${locale}/topics/sample-sound/?theme=${theme}&${query}`);
  await page.waitForFunction(() => window.__atlas?.ready, null, { timeout: 60_000 });
  await expect.poll(async () => (await senses(page)).profile).toBe('sound-only');
}

for (const locale of ['en', 'zh']) for (const theme of ['paper', 'cinema']) {
  test(`${locale}/${theme}: media keep nullable values and records without fabricated zeroes`, async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await open(page, 'ch=medium-test', locale, theme);
    expect((await senses(page)).eye).toBeUndefined();
    for (const [medium, speed, oneWay] of [['air', 340, 100], ['water', 1500, 68 / 3], ['solid-example', 5000, 6.8]] as const) {
      await set(page, { medium });
      const q = (await sim(page)).outputs;
      expect(q['speed-mps']).toBe(speed); expect(q['one-way-ms']).toBeCloseTo(oneWay, 9);
      expect(q['propagation-state']).toBe('transmitted');
      await card(page).locator('[data-sim-record]').click();
    }
    await set(page, { medium: 'vacuum' });
    expect((await sim(page)).outputs).toMatchObject({ 'speed-mps': null, 'one-way-ms': null, 'echo-ms': null, 'propagation-state': 'no-medium', 'source-drive': 'amplitude-one' });
    await expect(card(page).locator('[data-sim-output="one-way-ms"]')).toContainText(locale === 'en' ? 'No transmission' : '无传播');
    await expect(card(page).locator('[data-sim-output="one-way-ms"]')).not.toContainText('ms');
    await card(page).locator('[data-sim-record]').click();
    const rows = (await sim(page)).table;
    expect(rows).toHaveLength(4); expect(rows[3]!.values['one-way-ms']).toBeNull();
    expect(rows[3]!.values['propagation-state']).toBe('no-medium');
    expect(await card(page).locator('svg').evaluateAll(nodes => nodes.every(n => !/NaN|Infinity/.test(n.outerHTML)))).toBe(true);
    await set(page, { medium: 'air', 'sound-active': false });
    expect((await sim(page)).outputs).toMatchObject({ 'speed-mps': 340, 'one-way-ms': null, 'echo-ms': null, 'propagation-state': 'source-off', 'source-drive': 'off' });
  });
}

test('wave and source-drive share phase; controls snap and inactive source returns to rest', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'ch=amplitude-test');
  await set(page, { 'frequency-hz': 500, amplitude: 2 });
  await waveSeek(page, .25);
  await expect.poll(async () => (await senses(page)).wave.phaseCycles).toBe(.25);
  const before = await senses(page);
  expect(before.wave.positions[0]).toBeCloseTo(-.07, 9);
  expect(before.sourceMarkers['source-two']!.phaseCycles).toBe(before.wave.phaseCycles);
  expect(before.sourceMarkers['source-two']!.visualHz).toBe(2);
  expect(before.sourceMarkers['source-two']!.on).toBe(1);
  await set(page, { 'frequency-hz': 250 });
  await expect.poll(async () => (await senses(page)).wave.phaseCycles).toBe(0);
  expect((await sim(page)).outputs['displacement-max']).toBe(.07);
  await set(page, { 'sound-active': false });
  await expect.poll(async () => (await senses(page)).wave.positions[5]).toBe(.25);
  expect((await senses(page)).sourceMarkers['source-two']!.on).toBe(0);
  expect((await sim(page)).outputs['source-drive']).toBe('off');
  expect(await waveSeek(page, -1)).toBe(false); expect(await waveSeek(page, 1.1)).toBe(false);
});

test('author snapshots restore on URL and next beat starts from chapter baseline', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'ch=frequency-test&b=2');
  await expect.poll(async () => (await senses(page)).wave.phaseCycles).toBe(.25);
  const phase = (await senses(page)).wave.phaseCycles;
  await page.reload(); await page.waitForFunction(() => window.__atlas?.ready);
  await expect.poll(async () => (await senses(page)).wave.phaseCycles).toBe(phase);
  await page.keyboard.press('.');
  await expect.poll(async () => (await senses(page)).wave.phaseCycles).toBe(0);
  await open(page, 'ch=echo-distance-test&b=2');
  await expect.poll(async () => (await senses(page)).soundLab.echo.u).toBe(.5);
  expect((await senses(page)).soundLab.echo.pathPosition).toBeCloseTo(1.4, 9);
  await open(page, 'ch=echo-distance-test&b=3');
  await expect.poll(async () => (await senses(page)).soundLab.echo.atReturn).toBe(true);
  await page.keyboard.press('.');
  await expect.poll(async () => (await senses(page)).soundLab.echo.u).toBe(0);
});

test('single echo travels out and back, holds and hides under incompatible states', async ({ page }) => {
  await open(page, 'ch=echo-distance-test');
  for (const [u, offset] of [[0, 0], [.25, .7], [.5, 1.4], [.75, .7], [1, 0]]) {
    expect(await echoSeek(page, u!)).toBe(true);
    await expect.poll(async () => (await senses(page)).soundLab.echo.u).toBe(u);
    const echo = (await senses(page)).soundLab.echo;
    expect(echo.pathPosition).toBeCloseTo(offset!, 9);
    expect(echo.physicalEchoMs).toBe(200); expect(echo.slowFactor).toBe(10);
    expect(echo.elapsedVisual).toBeCloseTo(u! * 2, 9);
  }
  expect((await senses(page)).soundLab.echo.atReturn).toBe(true);
  expect((await senses(page)).soundLab.echo.playing).toBe(false);
  await set(page, { 'distance-m': 68 }); await echoSeek(page, .5);
  expect((await senses(page)).soundLab.echo.pathPosition).toBeCloseTo(2.2, 9);
  expect((await senses(page)).soundLab.echo.elapsedVisual).toBe(2);
  await apply(page, { run: true });
  await expect.poll(async () => (await senses(page)).wave.playing).toBe(false);
  await apply(page, { view: 'exploded', explode: 1 });
  await expect.poll(async () => (await senses(page)).soundLab.echo.hiddenReason).toBe('exploded');
  const frozen = (await senses(page)).soundLab.echo.u;
  await page.waitForTimeout(150); expect((await senses(page)).soundLab.echo.u).toBe(frozen);
  await apply(page, { run: false, view: 'assembled', explode: 0 });
  await set(page, { medium: 'vacuum' });
  await expect.poll(async () => (await senses(page)).soundLab.echo.hiddenReason).toBe('no-medium');
  expect((await sim(page)).outputs['echo-ms']).toBeNull();
  expect(await echoSeek(page, -.1)).toBe(false); expect(await echoSeek(page, 1.1)).toBe(false);
});

test('reduced motion preserves author echo frame and phone targets remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'ch=echo-distance-test&b=2', 'zh', 'cinema');
  await apply(page, { run: true });
  const first = (await senses(page)).soundLab.echo;
  expect(first.u).toBe(.5); expect(first.playing).toBe(false);
  await page.waitForTimeout(150); expect((await senses(page)).soundLab.echo.u).toBe(first.u);
  await page.getByRole('button', { name: '阅读', exact: true }).click();
  const next = card(page).locator('[data-sim-control="distance-m"] button').last();
  await next.scrollIntoViewIfNeeded(); const box = (await next.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

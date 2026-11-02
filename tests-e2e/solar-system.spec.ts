/** Production astronomy: all forty links, rendered scalar bindings and local catalogue use. */
import { readFileSync, readdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

type Value = number | string | boolean;
type Vector = Record<string, number>;
type Row = { hip: string; dist: number | null; east: number; north: number; up: number; position: number[]; shown: boolean };
type Engine = {
  sim(): { values: Record<string, Value>; outputs: Record<string, Value | Vector> };
  solarSystem(): { outputs: Record<string, Value | Vector>; sky: { status: string; utc: string; depth: boolean; rows: Row[] } };
  scale(id: string): { target: number; actual: number[] } | null;
  shift(id: string): { target: number[]; shown: boolean } | null;
  setSim(values: Record<string, Value>): boolean;
};
type AuthoredBeat = { sim: { set: Record<string, Value> }; labels: string[]; caption: { en: string; zh: string } };
type AuthoredChapter = { id: string; state: { index: { parts: string[] }; beats: AuthoredBeat[] } };
const chapterDir = 'src/content/topics/solar-system/chapters';
const authored: AuthoredChapter[] = readdirSync(chapterDir).filter((p) => p.endsWith('.mdx')).sort().map((name) => JSON.parse(readFileSync(`${chapterDir}/${name}`, 'utf8').split('---')[1]!));
const engine = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solarSystem());
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
async function open(page: Page, chapter: string, beat = 1, locale = 'en', theme: 'paper' | 'cinema' = 'paper') {
  await page.goto(`/${locale}/topics/solar-system/?ch=${chapter}&b=${beat}`);
  await page.waitForFunction(() => !!(window.__atlas?.engine as unknown as Engine)?.solarSystem?.());
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await page.evaluate((theme) => window.__atlas!.setTheme(theme), theme);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}
async function set(page: Page, values: Record<string, Value>) {
  expect(await page.evaluate((values) => (window.__atlas!.engine as unknown as Engine).setSim(values), values)).toBe(true);
  await expect.poll(async () => (await sim(page)).values).toMatchObject(values);
}
async function skyReady(page: Page) {
  await expect.poll(async () => (await engine(page)).sky.status, { timeout: 30_000 }).toBe('ready');
}
async function scaleMatches(page: Page, id: string, radius: number) {
  await expect.poll(() => page.evaluate(({ id, radius }) => {
    const scale = (window.__atlas!.engine as unknown as Engine).scale(id);
    return !!scale && scale.actual.every((v) => Math.abs(v - radius) < 1e-9);
  }, { id, radius }), { timeout: 20_000 }).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

for (const locale of ['en', 'zh'] as const) for (const theme of ['paper', 'cinema'] as const) {
  test(`forty authored deep links reproduce instant states (${locale}, ${theme})`, async ({ page }) => {
    test.setTimeout(600_000);
    await open(page, 'reading-a-model', 1, locale, theme);
    const beats = await page.evaluate(() => window.__atlas!.beats());
    expect(beats).toHaveLength(40);
    expect(await page.evaluate(() => window.__atlas!.chapters())).toHaveLength(8);
    for (const [globalIndex, info] of beats.entries()) {
      await page.evaluate((index) => window.__atlas!.goToBeat(index, { instant: true }), globalIndex);
      const expected = await sim(page);
      await open(page, info.chapter, info.index + 1, locale, theme);
      const actual = await sim(page);
      expect(actual.values).toEqual(expected.values);
      expect(actual.outputs).toEqual(expected.outputs);
      const source = authored.find((c) => c.id === info.chapter)!.state.beats[info.index]!;
      expect(actual.values).toEqual(source.sim.set);
      expect(await page.evaluate(() => window.__atlas!.state().paused)).toBe(true);
      expect(await page.evaluate(() => window.__atlas!.state().presentation)).toBeNull();
      if (source.sim.set.lab === 'sky') await skyReady(page);
      // Caption content is the reading panel beat row, including outside presentation mode.
      await expect(page.locator('.atlas-reader')).toContainText(source.caption[locale]);
    }
  });
}

test('shared size and distance scales reach actual rendered matrices', async ({ page }) => {
  await open(page, 'eight-worlds', 4);
  let model = await engine(page);
  expect(model.outputs['scale-state']).toBe('size-row');
  for (const id of ['mercury', 'earth', 'jupiter', 'neptune']) await scaleMatches(page, id, model.outputs[`radius-${id}`] as number);
  expect(model.outputs['radius-jupiter']).toBe(1);
  const physics = model.outputs['planet-frame'];
  await open(page, 'eight-worlds', 5);
  model = await engine(page);
  expect(model.outputs['scale-state']).toBe('distance-ruler');
  expect(model.outputs['planet-frame']).toEqual(physics);
  for (const id of ['mercury', 'earth', 'jupiter', 'neptune']) await scaleMatches(page, id, model.outputs[`radius-${id}`] as number);
  await expect.poll(() => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).shift('neptune')?.target[0])).toBe(300.6992);
  await open(page, 'eight-worlds', 6);
  const turns = (await engine(page)).outputs['planet-frame'] as Vector;
  expect(turns['mercury.turns']).toBeCloseTo(4.152018690727338, 12);
  expect(turns['earth.turns']).toBeCloseTo(.9999826003027548, 12);
  expect(turns['neptune.turns']).toBeCloseTo(.006068280780808115, 12);
});

test('received twinkle samples, anti-solar comet and light-distance targets match their captions', async ({ page }) => {
  test.setTimeout(180_000); // eight page loads
  for (const [beat, flux] of [[1, 1], [2, 1.1], [3, 1.01], [4, 1.3], [5, .99]]) {
    await open(page, 'through-the-air', beat);
    expect((await engine(page)).outputs['twinkle-flux']).toBeCloseTo(flux!, 12);
  }
  await open(page, 'smaller-companions', 4);
  const comet = await engine(page);
  expect(comet.outputs['comet-angle']).toBeCloseTo(180, 10);
  expect((comet.outputs['comet-positions'] as Vector)['comet-nucleus:x']).toBeCloseTo(-4.8, 12);
  await open(page, 'beyond-the-planets', 2);
  expect((await engine(page)).outputs['light-time-seconds']).toBeCloseTo(499.004783836, 8);
  await open(page, 'beyond-the-planets', 3);
  expect((await engine(page)).outputs['light-distance-km']).toBe(4.24 * (299792.458 * 31557600));
});

test('catalogue stays a separate same-origin sidecar and loaded sky comparisons work offline', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', (request) => requested.push(request.url()));
  const response = page.waitForResponse((r) => r.url().endsWith('/catalogues/solar-system/stars-hyg-v41-cc-by-sa.json'));
  await open(page, 'singapore-star-patterns', 2);
  const sidecar = await (await response).json();
  expect(sidecar.meta.licence).toBe('CC BY-SA 4.0');
  expect(sidecar.meta.credit).toMatch(/David Nash.*Astronexus/);
  expect(sidecar.stars).toHaveLength(28);
  expect(sidecar).not.toHaveProperty('patterns');
  expect(sidecar.stars.every((row: Record<string, unknown>) => !('en' in row) && !('zh' in row) && !('caption' in row))).toBe(true);
  await skyReady(page);
  const initial = (await engine(page)).sky;
  const betelgeuse = initial.rows.find((row) => row.hip === '27989')!;
  expect(initial.utc).toBe('2026-01-15T12:00:00.000Z');
  expect(betelgeuse.up).toBeCloseTo(.6388663948950563, 10);
  await page.context().setOffline(true);
  try {
    await set(page, { 'pattern-links': false });
    expect((await engine(page)).sky.rows).toEqual(initial.rows);
    await set(page, { 'sky-hour': 22 });
    await expect.poll(async () => (await engine(page)).sky.utc).toBe('2026-01-15T14:00:00.000Z');
    expect((await engine(page)).sky.rows.find((r) => r.hip === '27989')!.position).not.toEqual(betelgeuse.position);
  } finally {
    await page.context().setOffline(false);
  }
  expect(requested.filter((url) => new URL(url).origin !== new URL(page.url()).origin)).toEqual([]);
});

for (const locale of ['en', 'zh'] as const) {
  test(`phone 390: index selection, sources, figures and prior-topic links (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'eight-worlds', 4, locale);
    await page.getByRole('button', { name: locale === 'zh' ? '阅读' : 'Read', exact: true }).click();
    await page.locator('.space-index__row[data-part="jupiter"]').click();
    expect(await page.evaluate(() => (window.__atlas!.state() as unknown as { part: string }).part)).toBe('jupiter');
    await expect(page.locator('.atlas-reader .space-inspector')).toHaveAttribute('aria-label', locale === 'zh' ? '木星' : 'Jupiter');
    await expect(page.locator('.atlas-reader [data-source="S5"]').first()).toBeAttached();
    await expect(page.locator('.atlas-reader a[href$="/topics/inside-the-earth/?ch=layers-of-earth"]').first()).toBeAttached();
    await open(page, 'smaller-companions', 4, locale);
    await page.getByRole('button', { name: locale === 'zh' ? '阅读' : 'Read', exact: true }).click();
    const comet = page.locator('.atlas-reader img[src$="/illustrations/figures/solar-system-comet-tails.webp"]');
    await expect(comet).toBeAttached();
    await expect(comet).toHaveAttribute('alt', /.+/);
    await expect(page.locator('.atlas-reader a[href$="/topics/sun-earth-moon/?ch=one-moon-many-views"]').first()).toBeAttached();
    await open(page, 'beyond-the-planets', 5, locale);
    await page.getByRole('button', { name: locale === 'zh' ? '阅读' : 'Read', exact: true }).click();
    await expect(page.locator('.atlas-reader img[src$="/illustrations/figures/solar-system-milky-way.webp"]')).toBeAttached();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => window.__atlas!.state().paused)).toBe(true);
  });
}

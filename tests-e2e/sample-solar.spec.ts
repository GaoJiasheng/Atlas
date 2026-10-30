/** Draft astronomy fixture: authored teaching states, scalar bindings and independent catalogue. */
import { expect, test, type Page } from '@playwright/test';

type Value = number | string | boolean;
type Vector = Record<string, number>;
type Row = { id: string; hip: string; dist: number | null; mag: number; east: number; north: number; up: number; position: number[]; shown: boolean };
type Solar = { outputs: Record<string, Value | Vector>; scales: Record<string, { target: number; actual: number[] }>; sky: { status: string; utc: string; latitude: number; depth: boolean; rows: Row[] } };
type Engine = {
  sim(): { values: Record<string, Value>; outputs: Record<string, Value | Vector> };
  solarSystem(): Solar;
  setSim(values: Record<string, Value>): boolean;
  scale(id: string): { target: number; actual: number[] } | null;
  shift(id: string): { offset: number[]; target: number[]; shown: boolean } | null;
};
const AU = 149597870.7;
const Y = 31557600;
const C = 299792.458;
const bodyIds = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const solar = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solarSystem());
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
async function open(page: Page, query = '', locale = 'en') {
  await page.goto(`/${locale}/topics/sample-solar/${query ? `?${query}` : ''}`);
  await page.waitForFunction(() => !!(window.__atlas?.engine as unknown as Engine)?.solarSystem?.());
}
async function set(page: Page, values: Record<string, Value>) {
  expect(await page.evaluate((values) => (window.__atlas!.engine as unknown as Engine).setSim(values), values)).toBe(true);
  await expect.poll(async () => (await sim(page)).values).toMatchObject(values);
}
async function readySky(page: Page) {
  await expect.poll(async () => (await solar(page)).sky.status, { timeout: 30_000 }).toBe('ready');
}
async function scales(page: Page) {
  const result = await solar(page);
  for (const id of bodyIds) {
    const radius = result.outputs[`radius-${id}`] as number;
    await expect.poll(async () => page.evaluate(({ id, radius }) => {
      const scale = (window.__atlas!.engine as unknown as Engine).scale(id);
      return !!scale && scale.actual.every((v) => Math.abs(v - radius) < 1e-9);
    }, { id, radius })).toBe(true);
  }
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
});

test('nine-body physical frame, selected readings and actual scale/shift bindings', async ({ page }) => {
  await open(page, 'ch=orbit-steps&b=3');
  const before = await solar(page);
  const physical = before.outputs['planet-frame'] as Vector;
  expect(Object.keys(physical)).toHaveLength(45);
  expect(physical['earth.turns']).toBeCloseTo(.9999826003027548, 12);
  expect(physical['mercury.turns']).toBeCloseTo(4.152018690727338, 12);
  expect(physical['neptune.turns']).toBeCloseTo(.006068280780808115, 12);
  expect(before.outputs['completed-turns']).toBeCloseTo(4.152018690727338, 12);
  expect(before.outputs['planet-diameter-km']).toBe(4878.8);
  await scales(page);
  for (const id of bodyIds) {
    const positions = before.outputs['display-positions'] as Vector;
    await expect.poll(async () => page.evaluate((id) => (window.__atlas!.engine as unknown as Engine).shift(id)?.target, id))
      .toEqual(['x', 'y', 'z'].map((axis) => Math.round(positions[`${id}:${axis}`]! * 1e4) / 1e4));
  }
  await set(page, { 'scale-mode': 'true-scale' });
  expect((await solar(page)).outputs['planet-frame']).toEqual(physical);
  expect((await solar(page)).outputs['radius-earth']).toBeCloseTo(6371.0084 * 10 / AU, 12);
  expect((await solar(page)).outputs['scale-state']).toBe('true-scale');
  await scales(page);
  expect(await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).setSim({ 'elapsed-years': 1.5 }))).toBe(false);
});

test('size row and distance ruler retain physical inputs while changing their disclosed display', async ({ page }) => {
  await open(page, 'ch=size-row&b=2');
  const a = await solar(page);
  expect(a.outputs['scale-state']).toBe('size-row');
  expect(a.outputs['radius-jupiter']).toBe(1);
  expect(a.outputs['planet-diameter-km']).toBe(139822);
  await scales(page);
  await set(page, { lab: 'distances' });
  const b = await solar(page);
  expect(b.outputs['planet-frame']).toEqual(a.outputs['planet-frame']);
  expect(b.outputs['scale-state']).toBe('distance-ruler');
  expect((b.outputs['display-positions'] as Vector)['neptune:x']).toBeCloseTo(300.6992276, 9);
  expect(b.outputs['radius-jupiter']).toBeCloseTo(69911 * 10 / AU, 12);
  await scales(page);
});

test('qualitative twinkle samples reproduce point/disc/no-air cases', async ({ page }) => {
  await open(page, 'ch=twinkle-samples&b=2');
  expect((await solar(page)).outputs['twinkle-flux']).toBeCloseTo(1.1, 12);
  expect((await solar(page)).outputs['twinkle-state']).toBe('point-fluctuation');
  await set(page, { 'source-kind': 'disc' });
  expect((await solar(page)).outputs['twinkle-flux']).toBeCloseTo(1.01, 12);
  expect((await solar(page)).outputs['twinkle-state']).toBe('disc-averaged');
  await set(page, { 'altitude-mode': 'low' });
  expect((await solar(page)).outputs['twinkle-flux']).toBeCloseTo(1.03, 12);
  await set(page, { atmosphere: false });
  expect((await solar(page)).outputs['twinkle-flux']).toBe(1);
  expect((await solar(page)).outputs['twinkle-state']).toBe('steady');
});

test('comet tails face the anti-solar direction and light targets use physical lengths', async ({ page }) => {
  await open(page, 'ch=comet-steps&b=1');
  for (const [step, x, angle] of [[0, 1.2, 0], [180, -4.8, 180]]) {
    await set(page, { 'comet-step': step! });
    const result = await solar(page);
    expect((result.outputs['comet-positions'] as Vector)['comet-nucleus:x']).toBeCloseTo(x!, 12);
    expect(result.outputs['comet-angle']).toBeCloseTo(angle!, 10);
    await expect.poll(async () => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).shift('comet-nucleus')?.target[0])).toBe(x);
  }
  await set(page, { lab: 'galaxy', 'distance-target': 'sun-earth' });
  expect((await solar(page)).outputs['light-time-seconds']).toBeCloseTo(499.004783836, 8);
  for (const [target, distance] of [['neptune', 30.06992276 * AU], ['proxima', 4.24 * (C * Y)], ['milky-way', 100000 * (C * Y)]] as const) {
    await set(page, { 'distance-target': target });
    expect((await solar(page)).outputs['light-distance-km']).toBeCloseTo(distance, 3);
    expect((await solar(page)).outputs['light-time-seconds']).toBeCloseTo(distance / C, 3);
  }
});

for (const locale of ['en', 'zh']) {
  test(`catalogue sky (${locale}): same-origin loading, UTC+8 dates, links, depth and themes`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await open(page, 'ch=catalogue-sky&b=1', locale);
    await readySky(page);
    const sky = (await solar(page)).sky;
    expect(sky.rows).toHaveLength(28);
    expect(sky.utc).toBe('2026-01-15T12:00:00.000Z');
    expect(sky.latitude).toBe(1.3342);
    expect(sky.rows.every((r) => r.shown === (r.mag <= 3 && r.up > 0))).toBe(true);
    await set(page, { 'pattern-links': false });
    expect((await solar(page)).sky.rows).toEqual(sky.rows);
    await set(page, { 'sky-hour': 22 });
    await expect.poll(async () => (await solar(page)).sky.utc).toBe('2026-01-15T14:00:00.000Z');
    expect((await solar(page)).sky.rows[0]!.position).not.toEqual(sky.rows[0]!.position);
    await set(page, { 'sky-hour': 0, 'sky-date': '2026-04-15', 'sky-target': 'crux' });
    await expect.poll(async () => (await solar(page)).sky.utc).toBe('2026-04-14T16:00:00.000Z');
    await set(page, { depth: true });
    await expect.poll(async () => (await solar(page)).sky.depth).toBe(true);
    for (const row of (await solar(page)).sky.rows.filter((r) => r.shown)) {
      expect(row.dist).not.toBeNull();
      expect(Math.hypot(...row.position)).toBeCloseTo(row.dist! * .02, 8);
    }
    for (const theme of ['paper', 'cinema'] as const) {
      await page.evaluate((theme) => window.__atlas!.setTheme(theme), theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      expect((await solar(page)).sky.rows).toHaveLength(28);
    }
    expect(requests.filter((url) => new URL(url).origin !== new URL(page.url()).origin)).toEqual([]);
  });
}

test('catalogue failure stays explicit and retry recovers', async ({ page }) => {
  let fail = true;
  await page.route('**/catalogues/solar-system/stars-hyg-v41-cc-by-sa.json', (route) => fail ? route.fulfill({ status: 503, body: 'Fixture loading failure' }) : route.continue());
  await open(page, 'ch=catalogue-sky');
  await expect.poll(async () => (await solar(page)).sky.status).toBe('error');
  const retry = page.getByRole('button', { name: 'Retry star catalogue / 重试星表', exact: true });
  await expect(retry).toBeVisible();
  fail = false;
  await retry.click();
  await readySky(page);
});

test('chapter and beat deep links reproduce instant states; all steps stay paused', async ({ page }) => {
  test.setTimeout(180_000);
  await open(page);
  const all = await page.evaluate(() => window.__atlas!.beats());
  expect(all).toHaveLength(31);
  for (const beat of all.filter((b) => b.index === 0 || (b.chapter === 'orbit-steps' && b.index === 4) || (b.chapter === 'catalogue-sky' && b.index === 5))) {
    await page.evaluate((index) => window.__atlas!.goToBeat(index, { instant: true }), all.indexOf(beat));
    const expected = await sim(page);
    await open(page, `ch=${beat.chapter}&b=${beat.index + 1}`);
    expect((await sim(page)).values).toEqual(expected.values);
    expect((await sim(page)).outputs).toEqual(expected.outputs);
    expect((await page.evaluate(() => window.__atlas!.state())) as { paused: boolean }).toMatchObject({ paused: true });
  }
});

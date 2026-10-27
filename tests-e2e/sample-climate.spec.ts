/** Monthly TimeScene contract: real NOAA samples plus explicitly artificial edge cases. */
import { expect, test, type Page } from '@playwright/test';
import type { ClimateSample } from '../src/engines/time-scene/lib/climate';

type ClimateSnapshot = {
  month: number;
  renderedMonth: number;
  authoredMonth: number;
  exploring: boolean;
  selected: null | { kind: 'site'; id: string } | { kind: 'cell'; at: number[] };
  loads: Record<string, number>;
  geometryBuilds: Record<string, number>;
  layers: Record<string, { status: 'loading' | 'ready' | 'error' }>;
  commits: number;
  wind: { nativeValid: number; drawnVectors: number };
  rain: { nativeValid: number; cells: number };
};
type Engine = {
  setClimatologyMonth(n: number): boolean;
  sampleClimate(lon: number, lat: number): ClimateSample;
  climatology(): ClimateSnapshot;
  goToClimatologyBeat(chapter: string, index: number): boolean;
  toggleMonthlyLayer(id: string, on: boolean): boolean;
  inspectClimateCell(lon: number, lat: number): boolean;
  selectClimatologySite(id: string): boolean;
  retryClimateLayer(id: string): void;
};
const climate = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).climatology());
const setMonth = (page: Page, n: number) => page.evaluate((n) => (window.__atlas!.engine as unknown as Engine).setClimatologyMonth(n), n);
const sample = (page: Page, at: [number, number]) =>
  page.evaluate((at) => (window.__atlas!.engine as unknown as Engine).sampleClimate(...at), at);
async function open(page: Page, query = '', locale = 'en') {
  await page.goto(`/${locale}/topics/sample-climate/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(async () => (await climate(page)).renderedMonth).toBe((await climate(page)).month);
}
async function beat(page: Page, chapter: string, index: number) {
  expect(
    await page.evaluate(
      ([c, i]) => (window.__atlas!.engine as unknown as Engine).goToClimatologyBeat(c as string, i as number),
      [chapter, index],
    ),
  ).toBe(true);
}

test.describe('sample-climate monthly TimeScene', () => {
  for (const locale of ['en', 'zh'])
    for (const theme of ['paper', 'cinema']) {
      test(`${locale}/${theme}: all authored beats, including repeated months, remain independent`, async ({ page }) => {
        await open(page, `theme=${theme}`, locale);
        const beats = await page.evaluate(() => window.__atlas!.beats());
        expect(beats).toHaveLength(12);
        expect(await page.evaluate(() => window.__atlas!.presets())).toEqual(['world', 'theatre', 'view-region', 'view-java']);
        for (const b of beats) {
          await beat(page, b.chapter, b.index);
          await expect
            .poll(async () => {
              const c = await climate(page);
              return [c.month, c.renderedMonth, c.exploring];
            })
            .toEqual([(await climate(page)).authoredMonth, (await climate(page)).authoredMonth, false]);
          const state = await page.evaluate(() => window.__atlas!.state());
          expect(state).toMatchObject({
            chapter: b.chapter,
            beat: b.index,
            t: null,
            playhead: null,
            presentation: null,
          });
          await expect(page.locator('.clim-beatline')).toContainText(b.caption[locale as 'en' | 'zh']!);
        }
        await expect(page.locator('.ts-timeline')).toHaveCount(0);
        await expect(page.locator('[data-hud-panel="card"]')).not.toBeVisible();
      });
    }
  test('real independent native samples retain full precision and correct units', async ({ page }) => {
    await open(page, 'ch=northeast-monsoon&b=2');
    const s = await sample(page, [105, 0]);
    expect(s.wind).toMatchObject({
      status: 'valid',
      index: 132,
      i: 6,
      j: 6,
      at: [105, 0],
      units: 'm/s',
      pressureHpa: 850,
    });
    expect(s.rain).toMatchObject({
      status: 'valid',
      index: 126,
      at: [106.25, 1.25],
      units: 'mm/day',
    });
    expect((s.wind as { s: number }).s).toBeCloseTo(5.0606457947, 6);
    expect((s.wind as { from: number }).from).toBeCloseTo(347.0119250358, 5);
    await setMonth(page, 7);
    expect(((await sample(page, [103.85, 1.3])).rain as { rate: number }).rate).toBe(4.8847475);
  });
  test('deep-link precedence, invalid months, canonical URL and refresh', async ({ page }) => {
    await open(page, 'ch=northeast-monsoon&b=3&m=7&t=1942&utm=fixture');
    expect(await page.evaluate(() => window.__atlas!.state())).toMatchObject({
      beat: 2,
      month: 7,
      t: null,
      camera: { center: [110, -6], zoom: 4.7 },
    });
    await expect(page.locator('.clim-exploring')).toBeVisible();
    await expect(page).not.toHaveURL(/[?&]t=/);
    await expect(page).toHaveURL(/utm=fixture/);
    await page.reload();
    await page.waitForFunction(() => window.__atlas !== undefined);
    expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
    expect((await climate(page)).month).toBe(7);
    for (const bad of ['13', '2.5', '0', 'NaN', '']) {
      await open(page, `ch=northeast-monsoon&b=3&m=${bad}`);
      expect((await climate(page)).month).toBe(2);
      await expect(page).not.toHaveURL(/[?&]m=/);
    }
    await open(page, 'ch=northeast-monsoon&b=99');
    expect(await page.evaluate(() => window.__atlas!.state())).toMatchObject({
      beat: 0,
      month: 12,
    });
  });
  test('month actions preserve beat, camera and selection, range owns its keys', async ({ page }) => {
    await open(page, 'ch=northeast-monsoon');
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).inspectClimateCell(105, 0));
    const before = await page.evaluate(() => window.__atlas!.state() as unknown as Record<string, unknown>);
    for (const n of [0, 13, 2.5, NaN]) expect(await setMonth(page, n)).toBe(false);
    expect(await setMonth(page, 7)).toBe(true);
    const after = await page.evaluate(() => window.__atlas!.state() as unknown as Record<string, unknown>);
    for (const key of ['chapter', 'beat', 'camera', 'layers', 'highlight'] as const) expect(after[key]).toEqual(before[key]);
    expect((await climate(page)).selected).toEqual({
      kind: 'cell',
      at: [105, 0],
    });
    const range = page.locator('[data-climatology-month]:visible').first();
    await range.focus();
    await page.keyboard.press('Home');
    await expect.poll(async () => (await climate(page)).month).toBe(1);
    await page.keyboard.press('End');
    await expect.poll(async () => (await climate(page)).month).toBe(12);
    expect((await page.evaluate(() => window.__atlas!.state())).chapter).toBe(before.chapter);
    await range.blur();
    await page.keyboard.press('Shift+ArrowRight');
    await expect.poll(async () => (await climate(page)).month).toBe(1);
  });
  test('presentation restores exploration state and map drag remains available', async ({ page }) => {
    await open(page, 'ch=northeast-monsoon&b=3&m=7');
    const before = await page.evaluate(() => window.__atlas!.state() as unknown as Record<string, unknown>);
    await page.keyboard.press('p');
    await expect.poll(async () => (await page.evaluate(() => window.__atlas!.state())).presentation?.beat).toBe(2);
    await page.keyboard.press('Escape');
    const after = await page.evaluate(() => window.__atlas!.state() as unknown as Record<string, unknown>);
    for (const key of ['chapter', 'beat', 'month', 'camera', 'layers'] as const) expect(after[key]).toEqual(before[key]);
    expect((await climate(page)).selected).toBeNull();
    const map = page.locator('.maplibregl-canvas');
    const box = await map.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width * 0.6, box!.y + box!.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.65, box!.y + box!.height * 0.55, { steps: 5 });
    await page.mouse.up();
  });
  test('loads and geometry stay fixed across 24 month commits; latest month wins', async ({ page }) => {
    await open(page, 'ch=northeast-monsoon');
    await expect.poll(async () => Object.values((await climate(page)).layers).every((layer) => layer.status !== 'loading')).toBe(true);
    const before = await climate(page);
    const timings: number[] = [];
    for (let n = 0; n < 24; n++) {
      const start = Date.now();
      const month = (n % 12) + 1;
      await setMonth(page, month);
      await expect.poll(async () => (await climate(page)).renderedMonth).toBe(month);
      timings.push(Date.now() - start);
    }
    await page.evaluate(() => {
      const e = window.__atlas!.engine as unknown as Engine;
      e.setClimatologyMonth(1);
      e.setClimatologyMonth(7);
    });
    await expect.poll(async () => (await climate(page)).renderedMonth).toBe(7);
    expect((await climate(page)).loads).toEqual(before.loads);
    expect((await climate(page)).geometryBuilds).toEqual(before.geometryBuilds);
    test.info().annotations.push({
      type: 'driver-month-p95-ms',
      description: String(timings.sort((a, b) => a - b)[22]),
    });
  });
  test('phone month entry, site index and mutually exclusive details precede prose', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=northeast-monsoon');
    await page.locator('.atlas-panel__toggle[aria-expanded="false"]').click();
    const entry = page.locator('[data-climatology-phone]');
    await expect(entry).toBeVisible();
    await entry.locator('summary').click();
    await expect(entry.locator('[data-climatology-month]')).toBeVisible();
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).selectClimatologySite('site-singapore'));
    await expect(page.locator('[data-climate-site="site-singapore"]')).toBeVisible();
    expect((await climate(page)).selected).toEqual({
      kind: 'site',
      id: 'site-singapore',
    });
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).selectClimatologySite('site-jakarta'));
    expect(await page.evaluate(() => (window.__atlas!.state() as unknown as { highlight: string[] }).highlight)).toEqual(['site-jakarta']);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).inspectClimateCell(105, 0));
    await expect(page.locator('[data-climate-site]')).toHaveCount(0);
    expect((await climate(page)).selected?.kind).toBe('cell');
    expect(await page.evaluate(() => (window.__atlas!.state() as unknown as { highlight: string[] }).highlight)).toEqual([]);
  });
  test('artificial zero, missing and incomplete-year values stay distinct and hidden layers clear the key', async ({ page }) => {
    await open(page, 'ch=same-month');
    expect((await sample(page, [102.5, 2.5])).wind).toMatchObject({ status: 'missing', u: null, s: null });
    expect((await sample(page, [105, 0])).wind).toMatchObject({ status: 'valid', u: 0, v: 0, validYears: 29, from: null });
    await page.evaluate(() => {
      const e = window.__atlas!.engine as unknown as Engine;
      e.inspectClimateCell(105, 0);
      e.toggleMonthlyLayer('fixture-wind', false);
    });
    await expect(page.locator('[data-climate-key]')).not.toContainText('Artificial fixture wind');
    await expect(page.locator('[data-climate-cell]')).not.toContainText('Magnitude of mean vector');
    await expect.poll(async () => (await climate(page)).wind.drawnVectors).toBe(0);
  });
  test('theme, locale and browser history preserve beat overrides', async ({ page }) => {
    await open(page, 'ch=northeast-monsoon&b=3&m=7');
    const initial = await sample(page, [105, 0]);
    await page.evaluate(() => window.__atlas!.setTheme('cinema'));
    expect(await sample(page, [105, 0])).toEqual(initial);
    await page.getByRole('button', { name: 'Language', exact: true }).click();
    await page.getByRole('menuitemradio', { name: '中文', exact: true }).click();
    await page.waitForURL('**/zh/topics/sample-climate/**');
    await page.waitForFunction(() => window.__atlas !== undefined);
    expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
    expect(await page.evaluate(() => window.__atlas!.state())).toMatchObject({ beat: 2, month: 7 });
    await page.evaluate(() => {
      (window.__atlas!.engine as unknown as Engine).selectClimatologySite('site-singapore');
      history.pushState(null, '', '?ch=same-month&b=4&m=12&hl=site-jakarta');
      dispatchEvent(new PopStateEvent('popstate'));
    });
    await expect.poll(async () => (await climate(page)).month).toBe(12);
    expect(await page.evaluate(() => (window.__atlas!.state() as unknown as { highlight: string[] }).highlight)).toEqual(['site-jakarta']);
    await page.goBack();
    await expect.poll(async () => (await climate(page)).month).toBe(7);
    await page.goForward();
    await expect.poll(async () => (await climate(page)).month).toBe(12);
  });
  test('warm monthly resources remain usable offline without external requests', async ({ page, context }) => {
    const external: string[] = [];
    page.on('request', (r) => {
      if (!r.url().startsWith('http://127.0.0.1:') && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) external.push(r.url());
    });
    await open(page, 'ch=northeast-monsoon');
    const before = await climate(page);
    await context.setOffline(true);
    for (const month of [1, 7, 12]) {
      await setMonth(page, month);
      await expect.poll(async () => (await climate(page)).renderedMonth).toBe(month);
      expect((await sample(page, [105, 0])).wind.status).toBe('valid');
    }
    expect((await climate(page)).loads).toEqual(before.loads);
    expect(external).toEqual([]);
    await context.setOffline(false);
  });
  test('one failed resource leaves reading and other layers usable; explicit retry refetches', async ({ page }) => {
    let requests = 0;
    await page.route('**/geo/sample-climate-wind-850-1991-2020.json', (route) => {
      requests++;
      return requests === 1 ? route.abort('failed') : route.continue();
    });
    await open(page, 'ch=northeast-monsoon');
    expect((await sample(page, [105, 0])).wind.status).toBe('error');
    expect((await sample(page, [105, 0])).rain.status).toBe('valid');
    await setMonth(page, 7);
    expect(requests).toBe(1);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).retryClimateLayer('clim-wind'));
    await expect.poll(async () => (await sample(page, [105, 0])).wind.status).toBe('valid');
    expect(requests).toBe(2);
  });
});

/**
 * Monsoons and weather (docs/50): the published monthly-climatology topic.
 * Every one of the 36 beats lands on its authored month with both monthly
 * layers ready (EN/paper and ZH/cinema); the background chapter has its
 * reading note and BG axis segment and indexes the six cities; the chapter
 * 06 safety summary is readable without any interaction; the deep link
 * `ch=northeast-monsoon&b=3&m=7` opens the Java beat exploring July; grid
 * samples are the real NOAA values; the figures, Water links and the Water
 * back-link resolve; a phone reaches the month control and the city index;
 * no external requests.
 */
import { expect, test, type Page } from '@playwright/test';

type Snapshot = {
  month: number;
  renderedMonth: number;
  authoredMonth: number;
  exploring: boolean;
  layers: Record<string, { status: 'loading' | 'ready' | 'error' }>;
  wind: { nativeValid: number; drawnVectors: number };
  rain: { nativeValid: number; cells: number };
};
type Engine = {
  setClimatologyMonth(n: number): boolean;
  sampleClimate(lon: number, lat: number): { wind: Record<string, unknown>; rain: Record<string, unknown> };
  climatology(): Snapshot;
  goToClimatologyBeat(chapter: string, index: number): boolean;
  selectClimatologySite(id: string): boolean;
};
const climate = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).climatology());
const sample = (page: Page, at: [number, number]) =>
  page.evaluate((at) => (window.__atlas!.engine as unknown as Engine).sampleClimate(...at), at);

function external(page: Page) {
  const out: string[] = [];
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith('http://127.0.0.1:') && !url.startsWith('blob:') && !url.startsWith('data:')) out.push(url);
  });
  return out;
}

async function open(page: Page, query = '', locale = 'en') {
  await page.goto(`/${locale}/topics/monsoon-and-weather/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}

test.describe('monsoon-and-weather', () => {
  for (const [locale, theme] of [
    ['en', 'paper'],
    ['zh', 'cinema'],
  ] as const) {
    test(`${locale}/${theme}: all 36 beats land on their own month with the layers they name`, async ({ page }) => {
      test.setTimeout(600_000);
      const requests = external(page);
      await open(page, `theme=${theme}`, locale);
      const beats = await page.evaluate(() => window.__atlas!.beats());
      expect(beats).toHaveLength(36);
      for (const b of beats) {
        expect(await page.evaluate(([c, i]) => (window.__atlas!.engine as unknown as Engine).goToClimatologyBeat(c as string, i as number), [b.chapter, b.index])).toBe(true);
        // Software WebGL on a loaded machine can take seconds to paint a new month.
        await expect
          .poll(
            async () => {
              const c = await climate(page);
              return [c.month === c.authoredMonth, c.renderedMonth === c.month, c.exploring];
            },
            { timeout: 20_000 },
          )
          .toEqual([true, true, false]);
        const state = await page.evaluate(() => window.__atlas!.state() as unknown as { chapter: string; beat: number; layers: string[]; t: null });
        expect(state).toMatchObject({ chapter: b.chapter, beat: b.index, t: null });
        for (const id of ['clim-wind', 'clim-rain'])
          if (state.layers.includes(id)) await expect.poll(async () => (await climate(page)).layers[id]?.status, { timeout: 20_000 }).toBe('ready');
        if (!state.layers.includes('clim-wind')) await expect.poll(async () => (await climate(page)).wind.drawnVectors, { timeout: 20_000 }).toBe(0);
        if (!state.layers.includes('clim-rain')) await expect.poll(async () => (await climate(page)).rain.cells, { timeout: 20_000 }).toBe(0);
        if (state.layers.includes('clim-rain')) await expect.poll(async () => (await climate(page)).rain.cells, { timeout: 20_000 }).toBe(360);
        await expect(page.locator('.clim-beatline')).toContainText(b.caption[locale]!);
      }
      await expect(page.locator('.ts-timeline')).toHaveCount(0);
      expect(requests).toEqual([]);
    });
  }

  test('background: reading note, BG axis segment, six indexed cities, Water link', async ({ page }) => {
    await open(page, 'ch=background');
    await expect(page.locator('.atlas-note')).toContainText('calendar-month means for 1991–2020');
    await expect(page.locator('.atlas-axis')).toContainText('BG');
    for (const id of ['site-singapore', 'site-kuala-lumpur', 'site-jakarta', 'site-hanoi', 'site-bangkok', 'site-manila'])
      expect(await page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).selectClimatologySite(x), id)).toBe(true);
    await expect(page.locator('[data-climate-site="site-manila"]')).toBeVisible();
    await expect(page.locator('a[href$="/en/topics/water/?ch=the-water-cycle"]').first()).toBeAttached();
  });

  test('chapter 06: the shelter rule is the summary, and both figures are in their chapters', async ({ page }) => {
    await open(page, 'ch=thunder-and-shelter');
    await expect(page.getByText('stay there at least 30 minutes after the last thunder').first()).toBeVisible();
    await expect(page.locator('img[src$="figures/monsoon-and-weather-cloud-cutaway.webp"]')).toHaveCount(1);
    await open(page, 'ch=inter-monsoons', 'zh');
    await expect(page.locator('img[src$="figures/monsoon-and-weather-storm-life.webp"]')).toHaveAttribute('alt', /三幅分开的云/);
  });

  test('deep link to the Java beat while exploring July; real samples', async ({ page }) => {
    await open(page, 'ch=northeast-monsoon&b=3&m=7');
    expect(await page.evaluate(() => window.__atlas!.state())).toMatchObject({ beat: 2, month: 7, camera: { center: [110, -6], zoom: 4.7 } });
    await expect(page.locator('.clim-exploring')).toBeVisible();
    expect(await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).setClimatologyMonth(2))).toBe(true);
    await expect.poll(async () => (await climate(page)).exploring).toBe(false);
    expect((await sample(page, [103.853875, 1.294979])).rain).toMatchObject({ status: 'valid', index: 125, rate: 4.3688293 });
    expect((await sample(page, [106.827492, -6.172472])).rain).toMatchObject({ status: 'valid', validYears: 30 });
    expect(await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).setClimatologyMonth(1))).toBe(true);
    expect((await sample(page, [105, 0])).wind).toMatchObject({ status: 'valid', index: 132, pressureHpa: 850, units: 'm/s' });
    const c = await climate(page);
    expect([c.wind.nativeValid, c.rain.nativeValid]).toEqual([399, 360]);
  });

  test('24 month changes fetch nothing new and rebuild no geometry; latest month wins', async ({ page }) => {
    test.setTimeout(600_000);
    await open(page, 'ch=regional-winds');
    const before = (await page.evaluate(() => (window.__atlas!.engine as unknown as { climatology(): Record<string, unknown> }).climatology())) as {
      loads: Record<string, number>;
      geometryBuilds: Record<string, number>;
    };
    expect(before.loads).toEqual({ 'monsoon-and-weather-wind-850-1991-2020': 1, 'monsoon-and-weather-rain-gpcp-1991-2020': 1 });
    const timings: number[] = [];
    for (let n = 0; n < 24; n++) {
      const month = (n % 12) + 1;
      const start = Date.now();
      expect(await page.evaluate((m) => (window.__atlas!.engine as unknown as Engine).setClimatologyMonth(m), month)).toBe(true);
      await expect.poll(async () => (await climate(page)).renderedMonth, { timeout: 60_000 }).toBe(month);
      timings.push(Date.now() - start);
    }
    const after = (await page.evaluate(() => (window.__atlas!.engine as unknown as { climatology(): Record<string, unknown> }).climatology())) as typeof before;
    expect(after.loads).toEqual(before.loads);
    expect(after.geometryBuilds).toEqual(before.geometryBuilds);
    test.info().annotations.push({ type: 'driver-month-p95-ms', description: String(timings.sort((a, b) => a - b)[22]) });
  });

  test('phone: month control and city index from the reading panel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=haze-across-borders');
    await page.locator('.atlas-panel__toggle[aria-expanded="false"]').click();
    const entry = page.locator('[data-climatology-phone]');
    await expect(entry).toBeVisible();
    await entry.locator('summary').click();
    await expect(entry.locator('[data-climatology-month]')).toBeVisible();
    expect(await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).selectClimatologySite('site-jakarta'))).toBe(true);
    await expect(page.locator('[data-climate-site="site-jakarta"]')).toBeVisible();
  });

  test('Water links back here', async ({ page }) => {
    await page.goto('/zh/topics/water/?ch=the-water-cycle');
    await expect(page.locator('a[href$="/zh/topics/monsoon-and-weather/"]').first()).toBeAttached();
  });
});

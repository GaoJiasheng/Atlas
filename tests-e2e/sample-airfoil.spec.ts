/** Browser gates intentionally deferred in the engine sandbox. Run with ATLAS_E2E_PORT=5406. */
import { test, expect, type Page } from '@playwright/test';
type Reading = {
  mode: string;
  angle: number;
  cl: number;
  lift: number;
  fieldReady: boolean;
  inputKey: string;
  pathCount: number;
  pressureCount: number;
  pulseTime: number;
  plot: { current: { x: number; y: number } };
  arrowDirections: { force: string; dir: number[] }[];
};
type Engine = {
  airfoil(): Reading;
  sim(): {
    values: Record<string, number | string | boolean>;
    outputs: Record<string, number | string>;
    table: unknown[];
  };
  setSim(v: Record<string, number | string | boolean>): boolean;
  apply(v: Record<string, unknown>): boolean;
  airfoilSamples(): { pressure: unknown[] | null; paths: unknown[] };
  flow(id: string): { paths: Record<string, { visible: boolean }> };
};
const read = (page: Page) =>
  page.evaluate(() => (window.__atlas!.engine as unknown as Engine).airfoil());
const sim = (page: Page) =>
  page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, v: Record<string, number | string | boolean>) =>
  page.evaluate(
    (v) => (window.__atlas!.engine as unknown as Engine).setSim(v),
    v,
  );
async function ready(page: Page) {
  await expect
    .poll(
      async () => {
        const a = await read(page),
          s = await sim(page);
        return (
          a.fieldReady &&
          a.angle === s.values['angle-deg'] &&
          Math.abs(a.cl - Number(s.outputs['cl-now'])) < 1e-8
        );
      },
      { timeout: 30000 },
    )
    .toBe(true);
}
async function open(
  page: Page,
  query = 'ch=angle-and-stall',
  locale = 'en',
  theme = 'paper',
) {
  await page.goto(`/${locale}/topics/sample-airfoil/?${query}&theme=${theme}`);
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await ready(page);
}
for (const locale of ['en', 'zh'])
  for (const theme of ['paper', 'cinema'])
    test.describe(`${locale} ${theme}`, () => {
      test('signed α0/4/12/16/−16, zero speed, pressure recovery and deep links', async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
        await open(page, undefined, locale, theme);
        for (const angle of [0, 4, 12, 16, -16]) {
          await set(page, { 'angle-deg': angle, 'flow-view': 'pressure' });
          await ready(page);
          const a = await read(page);
          expect(a.plot.current.x).toBe(angle);
          expect(a.plot.current.y).toBeCloseTo(a.cl, 10);
          expect(a.pressureCount).toBe(Math.abs(angle) <= 12 ? 64 : 0);
          expect(a.pathCount).toBe(Math.abs(angle) <= 12 ? 16 : 0);
          expect(a.mode).toBe(
            Math.abs(angle) <= 12 ? 'ideal-attached' : 'separated-illustration',
          );
        }
        await set(page, { 'airspeed-mps': 0 });
        await ready(page);
        expect((await read(page)).mode).toBe('still');
        expect((await read(page)).lift).toBe(0);
        await set(page, { 'angle-deg': 4, 'airspeed-mps': 40 });
        await ready(page);
        expect((await read(page)).pressureCount).toBe(64);
        expect((await read(page)).lift).toBeCloseTo(923.9031443933111, 5);
        await open(page, 'ch=angle-and-stall&b=4', locale, theme);
        expect((await read(page)).angle).toBe(16);
        expect((await read(page)).pressureCount).toBe(0);
      });
      test('record markers, display preservation, physical keep reset and pressure switch', async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await open(page, undefined, locale, theme);
        for (const angle of [-16, 0, 12, 16]) {
          await set(page, { 'angle-deg': angle });
          await ready(page);
          await page.locator('[data-sim-record]').click();
        }
        await expect(page.locator('[data-airfoil-record]')).toHaveCount(4);
        const lift = (await read(page)).lift;
        await set(page, { 'flow-view': 'pressure' });
        expect((await read(page)).lift).toBe(lift);
        expect((await sim(page)).table).toHaveLength(4);
        await set(page, { 'airspeed-mps': 20 });
        await expect.poll(async () => (await sim(page)).table.length).toBe(0);
        await expect(
          page.locator('[aria-live="polite"]', {
            hasText: locale === 'en' ? 'Conditions changed' : '条件改变',
          }),
        ).toBeVisible();
      });
    });
test('rapid updates discard old fields; pause and reduced motion freeze time', async ({
  page,
}) => {
  await open(page);
  await page.evaluate(() => {
    const e = window.__atlas!.engine as unknown as Engine;
    e.setSim({ 'angle-deg': 4 });
    e.setSim({ 'angle-deg': 16 });
    e.setSim({ 'angle-deg': -4 });
  });
  await ready(page);
  expect((await read(page)).angle).toBe(-4);
  expect((await read(page)).pressureCount).toBe(64);
  await page.evaluate(() => window.__atlas!.setPaused(true));
  await page.waitForTimeout(100);
  const a = (await read(page)).pulseTime;
  await page.waitForTimeout(250);
  expect((await read(page)).pulseTime).toBe(a);
  expect((await read(page)).pressureCount).toBe(64);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.__atlas!.setPaused(false));
  const b = (await read(page)).pulseTime;
  await page.waitForTimeout(250);
  expect((await read(page)).pulseTime).toBe(b);
});
test('hidden section, FLOW off and exploded hide particles; bank directions are fixed', async ({
  page,
}) => {
  await open(page);
  const flow = () =>
    page.evaluate(() =>
      Object.values(
        (window.__atlas!.engine as unknown as Engine).flow('section-air')
          ?.paths ?? {},
      ).some((p) => p.visible),
    );
  await expect.poll(flow).toBe(true);
  await page.evaluate(() =>
    (window.__atlas!.engine as unknown as Engine).apply({
      layers: ['airfoil-bench', 'airframe'],
    }),
  );
  await expect.poll(flow).toBe(false);
  await page.evaluate(() =>
    (window.__atlas!.engine as unknown as Engine).apply({
      layers: ['airfoil-bench', 'airframe', 'flight-flows'],
      hidden: ['foil-sample'],
    }),
  );
  await expect.poll(flow).toBe(false);
  await page.evaluate(() =>
    (window.__atlas!.engine as unknown as Engine).apply({
      view: 'exploded',
      hidden: [],
    }),
  );
  await expect.poll(flow).toBe(false);
  await page.evaluate(() =>
    (window.__atlas!.engine as unknown as Engine).apply({
      view: 'assembled',
      explode: 1,
    }),
  );
  await expect.poll(flow).toBe(true);
  await open(page, 'ch=force-directions&b=4');
  await expect
    .poll(async () => (await read(page)).arrowDirections.length)
    .toBe(2);
  const arrows = (await read(page)).arrowDirections;
  expect(arrows.find((a) => a.force === 'gravity')!.dir).toEqual([0, -1, 0]);
  const lift = arrows.find((a) => a.force === 'lift')!.dir;
  expect(lift[1]).toBeCloseTo(0.9396926208, 8);
  expect(lift[2]).toBeCloseTo(-0.3420201433, 8);
});
for (const locale of ['en', 'zh'])
  for (const theme of ['paper', 'cinema'])
    test(`390px ${locale} ${theme}: touch samples and no overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await open(
        page,
        'ch=angle-and-stall&sim=flow-view.pressure',
        locale,
        theme,
      );
      await page
        .getByRole('button', {
          name: locale === 'en' ? 'Read' : '阅读',
          exact: true,
        })
        .click();
      const button = page.locator('.space-airfoil-samples button').first();
      await button.scrollIntoViewIfNeeded();
      const box = (await button.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(390);
    });

/** Published port study: bilingual reading, finite handling timeline and local geography. */
import { expect, test, type Page } from '@playwright/test';

type Span = { from: number[]; to: number[]; centre: number[]; length: number; shown: boolean; matrix: number[] };
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, unknown>; timeline: Record<string, { t: number; duration: number; playing: boolean }>; replays: number };
  setSim(values: Record<string, number | string | boolean>): boolean;
  simSeek(id: string, t: number): boolean;
  span(id: string): Span | null;
  shift(id: string): { offset: number[]; shown: boolean } | null;
  copies(id: string): number | null;
  anchor(id: string): { x: number; y: number; shown: boolean; onScreen: boolean } | null;
  apply(patch: object): boolean;
};
const chapters = ['before-you-start', 'boxes-and-teu', 'the-crane-load-path', 'quay-to-yard', 'an-onward-connection', 'beside-two-straits', 'the-tuas-transition', 'keeping-the-chain-moving'];
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, values: Record<string, number | string | boolean>) => page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const span = (page: Page, id = 'rope-a') => page.evaluate((id) => (window.__atlas!.engine as unknown as Engine).span(id), id);
const shift = (page: Page, id: string) => page.evaluate((id) => (window.__atlas!.engine as unknown as Engine).shift(id), id);
const readout = (page: Page, id: string) => page.locator(`.space-try [data-sim-output="${id}"] dd b`);
async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/container-port/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}

test.describe('container-port', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

  for (const locale of ['en', 'zh']) test(`${locale}: eight chapters and 36 beats have reachable reading and part indexes`, async ({ page }) => {
    await open(page, 'ch=before-you-start', locale);
    expect(await page.evaluate(() => window.__atlas!.chapters())).toEqual(chapters);
    expect(await page.evaluate(() => window.__atlas!.beats().length)).toBe(36);
    for (const id of chapters) {
      await page.evaluate((id) => window.__atlas!.goToChapter(id, { instant: true }), id);
      await expect.poll(() => page.evaluate(() => window.__atlas!.state().chapter)).toBe(id);
      await expect(page.locator('#atlas-panel-title')).not.toBeEmpty();
      await expect(page.locator('.atlas-prose')).not.toBeEmpty();
    }
    const chapterButton = page.locator('.atlas-axis__btn[data-chapter="boxes-and-teu"]');
    await expect(chapterButton).toHaveAccessibleName(new RegExp(locale === 'en' ? 'Boxes and TEU' : '箱子与标准箱单位'));
    await chapterButton.click();
    await expect(page).toHaveURL(/ch=boxes-and-teu/);
    await expect(page.locator('#atlas-panel-title')).toContainText(locale === 'en' ? 'Boxes and TEU' : '箱子与标准箱单位');
    await expect(page.locator('.space-try')).toHaveAttribute('data-chapter', 'boxes-and-teu');
    await expect(page.locator('.space-try')).toContainText(locale === 'en' ? 'Try it' : '试一试');
  });

  test('TEU controls count objects separately, include zero copies and survive a deep URL', async ({ page }) => {
    await open(page, 'ch=boxes-and-teu&sim=n20.2~n40.1');
    expect((await sim(page)).outputs).toMatchObject({ boxes: 3, teu: 4 });
    await expect(readout(page, 'boxes')).toHaveText('3');
    await expect(readout(page, 'teu')).toHaveText('4');
    await page.locator('.space-try [data-sim-control="n40"] button[aria-label$="Next value"]').click();
    await expect.poll(async () => (await sim(page)).outputs.teu).toBe(6);
    await expect(page).toHaveURL(/sim=/);
    await page.reload();
    await page.waitForFunction(() => window.__atlas !== undefined);
    expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
    expect((await sim(page)).outputs).toMatchObject({ boxes: 4, teu: 6 });
    expect(await set(page, { n20: 0, n40: 0 })).toBe(true);
    await expect.poll(() => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).copies('sample-20'))).toBe(0);
    await expect.poll(() => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).copies('sample-40'))).toBe(0);
  });

  test('named snapshots and live lift remain exclusive; replay follows the same box through all four ropes', async ({ page }) => {
    await open(page, 'ch=the-crane-load-path&b=3');
    expect((await sim(page)).values['lift-live']).toBe(false);
    await expect.poll(async () => (await span(page))?.length).toBeCloseTo(21.809, 3);
    await open(page, 'ch=the-crane-load-path&b=5');
    expect((await sim(page)).values['lift-live']).toBe(true);
    const n = (await sim(page)).replays;
    await page.locator('.space-try [data-sim-replay]').click();
    await expect.poll(async () => (await sim(page)).replays).toBe(n + 1);
    await expect.poll(async () => (await sim(page)).timeline['lift-run']?.playing).toBe(true);
    for (const [t, length, spreaderY, z] of [[0, 36.809, 12.891, -18], [12, 21.809, 27.891, -18], [16, 21.809, 27.891, -4], [28, 44.809, 4.891, 10], [30, 44.809, 4.891, 10], [32, 21.809, 27.891, 10]]) {
      expect(await page.evaluate((t) => (window.__atlas!.engine as unknown as Engine).simSeek('lift-run', t), t!)).toBe(true);
      await expect.poll(async () => (await span(page))?.length).toBeCloseTo(length!, 3);
      const frame = await page.evaluate(() => {
        const e = window.__atlas!.engine as unknown as Engine;
        return { t: e.sim().timeline['lift-run']?.t, ropes: ['rope-a', 'rope-b', 'rope-c', 'rope-d'].map((id) => e.span(id)), anchor: e.anchor('rope-a') };
      });
      expect(frame.t).toBe(t);
      for (const r of frame.ropes) {
        expect(r!.shown).toBe(true); expect(r!.length).toBeCloseTo(length!, 3);
        expect(r!.from[1]).toBeCloseTo(50, 3); expect(r!.to[1]).toBeCloseTo(spreaderY! + .3, 3);
        expect(r!.centre[1]).toBeCloseTo((50 + spreaderY! + .3) / 2, 3);
        expect(Math.abs(r!.from[2]! - r!.to[2]!)).toBeLessThan(.001);
        expect(Math.abs(r!.to[2]! - z!)).toBeCloseTo(1, 3);
      }
      expect(frame.anchor?.shown).toBe(true);
    }
    const before = (await sim(page)).outputs['lift-run'];
    await set(page, { n20: 4, cranes: 2 });
    expect((await sim(page)).outputs['lift-run']).toEqual(before);
    expect((await sim(page)).timeline['lift-run']?.t).toBe(32);
  });

  test('an unconfirmed lock holds the source; hide/show and reduced motion keep final spans coherent', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'ch=the-crane-load-path&b=5&theme=cinema');
    await set(page, { 'lock-confirmed': false });
    await expect.poll(async () => (await sim(page)).outputs['lift-status']).toBe('lock-not-confirmed');
    await expect.poll(async () => (await span(page))?.length).toBeCloseTo(36.809, 3);
    await set(page, { 'lock-confirmed': true });
    await expect.poll(async () => (await span(page))?.length).toBeCloseTo(21.809, 3);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).apply({ hidden: ['trolley'] }));
    await expect.poll(async () => (await span(page))?.shown).toBe(false);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).apply({ hidden: [] }));
    await expect.poll(async () => (await span(page))?.shown).toBe(true);
  });

  test('yard retrieval counts blockers and hides absent upper boxes', async ({ page }) => {
    await open(page, 'ch=quay-to-yard&sim=above.2~yard-state.original');
    expect((await sim(page)).outputs).toMatchObject({ rehandles: 2, 'retrieval-lifts': 3 });
    await page.locator('.space-try [data-sim-control="yard-state"] [data-sim-value="retrieved"]').click();
    await expect.poll(async () => (await shift(page, 'yard-target'))?.shown).toBe(true);
    expect((await sim(page)).values['yard-state']).toBe('retrieved');
    expect((await shift(page, 'yard-target'))?.offset[1]).toBeCloseTo(0, 4);
    await set(page, { above: 0 });
    await expect.poll(async () => (await shift(page, 'yard-blocker-a'))?.shown).toBe(false);
    await expect.poll(async () => (await shift(page, 'yard-blocker-b'))?.shown).toBe(false);
    expect((await sim(page)).outputs).toMatchObject({ rehandles: 0, 'retrieval-lifts': 1 });
  });

  test('predict, record and compare the moving bottleneck with an explicit SIM queue', async ({ page }) => {
    await open(page, 'ch=keeping-the-chain-moving');
    await page.locator('.space-try [data-predict="unchanged"]').click();
    await expect.poll(async () => (await sim(page)).outputs['capacity-rate']).toBe(18);
    expect((await sim(page)).outputs).toMatchObject({ queued: 12, bottleneck: 'yard' });
    await expect(page.locator('.space-try__sim[data-tag="sim"]')).toContainText('SIM');
    await page.locator('.space-try [data-sim-record]').click();
    await expect(page.locator('.space-try__table tbody tr')).toHaveCount(1);
    await set(page, { cranes: 1, carriers: 1, yards: 2 });
    expect((await sim(page)).outputs).toMatchObject({ 'capacity-rate': 24, queued: 0, completed: 48, bottleneck: 'carrier' });
    await set(page, { carriers: 2 });
    expect((await sim(page)).outputs).toMatchObject({ 'capacity-rate': 30, queued: 0, completed: 48, bottleneck: 'crane' });
  });

  test('both local coastline views name the two straits; all requests remain same-origin', async ({ page, baseURL }) => {
    const external: string[] = [];
    const origin = new URL(baseURL!).origin;
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol.startsWith('http') && url.origin !== origin) external.push(request.url());
    });
    await open(page, 'ch=beside-two-straits');
    await expect(page.locator('.port-map')).toHaveCount(2);
    await expect(page.locator('.port-map').first()).toContainText('Singapore');
    await expect(page.locator('.port-map').last()).toContainText('Malacca');
    await expect(page.locator('.port-map').last()).toContainText('Singapore');
    await open(page, 'ch=beside-two-straits', 'zh');
    await expect(page.locator('.port-map').last()).toContainText('马六甲');
    await expect(page.locator('.port-map').last()).toContainText('新加坡');
    expect(external).toEqual([]);
  });

  test('phone drawer exposes 44 px count controls without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=boxes-and-teu');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    const next = page.locator('.space-try [data-sim-control="n40"] button[aria-label$="Next value"]');
    await next.scrollIntoViewIfNeeded();
    const rect = (await next.boundingBox())!;
    expect(rect.height).toBeGreaterThanOrEqual(44); expect(rect.x + rect.width).toBeLessThanOrEqual(390);
    await next.click(); await expect.poll(async () => (await sim(page)).outputs.teu).toBe(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

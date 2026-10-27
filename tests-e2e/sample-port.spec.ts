/** Port teaching arithmetic + finite timeline + geometry spans, docs/62 §4. */
import { expect, test, type Page } from '@playwright/test';
type Span = { from: number[]; to: number[]; centre: number[]; length: number; shown: boolean };
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, unknown>; timeline: Record<string, { t: number; duration: number; playing: boolean }>; replays: number };
  setSim(values: Record<string, number | string | boolean>): boolean;
  simSeek(id: string, t: number): boolean;
  span(id: string): Span | null;
  shift(id: string): { offset: number[]; shown: boolean } | null;
  copies(id: string): number | null;
  apply(patch: object): boolean;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, values: Record<string, number | string | boolean>) => page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const span = (page: Page, id = 'rope-a') => page.evaluate((id) => (window.__atlas!.engine as unknown as Engine).span(id), id);
const shift = (page: Page, id: string) => page.evaluate((id) => (window.__atlas!.engine as unknown as Engine).shift(id), id);
async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/sample-port/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
test.describe('sample-port', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });
  test('count, empty repeated samples, URL and bilingual card', async ({ page }) => {
    await open(page, 'ch=count&sim=n20.2~n40.1');
    expect((await sim(page)).outputs.boxes).toBe(3); expect((await sim(page)).outputs.teu).toBe(4);
    await set(page, { n20: 0, n40: 0 });
    await expect.poll(() => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).copies('sample-20'))).toBe(0);
    await expect.poll(() => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).copies('sample-40'))).toBe(0);
    await expect(page).toHaveURL(/sim=/);
    await open(page, 'ch=count&sim=n20.99~n40.99', 'zh');
    expect((await sim(page)).outputs.boxes).toBe(3);
    await expect(page.locator('.space-try')).toContainText('试一试');
  });
  test('deep links show lift end state; seek samples update all four ropes in the same frame', async ({ page }) => {
    await open(page, 'ch=lift');
    await expect.poll(async () => (await sim(page)).timeline['lift-run']?.t).toBe(32);
    await expect.poll(async () => (await span(page))?.length).toBeCloseTo(21.809, 3);
    for (const [t, length, bottom, z] of [[0,36.809,12.891,-19],[12,21.809,27.891,-19],[16,21.809,27.891,-5],[28,44.809,4.891,9],[32,21.809,27.891,9]]) {
      await page.evaluate((t) => (window.__atlas!.engine as unknown as Engine).simSeek('lift-run', t), t!);
      await expect.poll(async () => (await span(page))?.length).toBeCloseTo(length!, 3);
      for (const id of ['rope-a','rope-b','rope-c','rope-d']) {
        const s = (await span(page,id))!;
        expect(s.length).toBeCloseTo(length!, 3); expect(s.to[1]).toBeCloseTo(bottom! + .3, 3);
      }
      expect((await span(page))!.to[2]).toBeCloseTo(z!, 3);
    }
    const diagonal = (await span(page,'diagonal-rope'))!;
    expect(diagonal.length).toBeCloseTo(5, 5); expect(diagonal.centre).toEqual([48,1.5,2]);
  });
  test('lock not confirmed holds the source; unrelated controls preserve lift identity and playhead', async ({ page }) => {
    await open(page, 'ch=lift&sim=lock-confirmed.off');
    await set(page, { 'lock-confirmed': false });
    expect((await sim(page)).outputs['lift-status']).toBe('lock-not-confirmed');
    await expect.poll(async () => (await sim(page)).timeline['lift-run']?.duration).toBe(0);
    await expect.poll(async () => (await span(page))?.length).toBeCloseTo(36.809, 3);
    await set(page, { 'lock-confirmed': true });
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).simSeek('lift-run', 16));
    const before = (await sim(page)).outputs['lift-run'];
    await set(page, { n20: 4, cranes: 2 });
    expect((await sim(page)).outputs['lift-run']).toEqual(before);
    expect((await sim(page)).timeline['lift-run']?.t).toBe(16);
  });
  test('named pose disables live play, then replay restores it', async ({ page }) => {
    await open(page, 'ch=lift&b=2');
    await expect.poll(async () => (await sim(page)).values['lift-live']).toBe(false);
    await expect.poll(async () => (await span(page))?.length).toBeCloseTo(21.809,3);
    await open(page, 'ch=lift&b=3');
    expect((await sim(page)).values['lift-live']).toBe(true);
    const n = (await sim(page)).replays;
    await page.keyboard.press('g');
    await expect.poll(async () => (await sim(page)).replays).toBe(n + 1);
    await expect.poll(async () => (await sim(page)).timeline['lift-run']?.playing).toBe(true);
  });
  test('zero-duration yard shifts keep the target at the bottom and omit absent blockers', async ({ page }) => {
    await open(page, 'ch=yard');
    await set(page, { 'yard-state':'retrieved', above:2 });
    await expect.poll(async () => (await shift(page,'yard-target'))?.offset).toEqual([0,0,10]);
    expect((await shift(page,'yard-blocker-a'))?.offset).toEqual([10,-2.591,0]);
    expect((await shift(page,'yard-blocker-b'))?.offset).toEqual([20,-5.182,0]);
    expect((await sim(page)).outputs['retrieval-lifts']).toBe(3);
    await set(page, { above:0 });
    await expect.poll(async () => (await shift(page,'yard-blocker-a'))?.shown).toBe(false);
    expect((await shift(page,'yard-blocker-b'))?.shown).toBe(false);
    expect((await sim(page)).outputs.rehandles).toBe(0);
  });
  test('capacity follows the bottleneck and clips completions to demand', async ({ page }) => {
    await open(page, 'ch=capacity');
    expect((await sim(page)).outputs).toMatchObject({ 'capacity-rate':18, completed:36, queued:12, bottleneck:'yard' });
    await set(page, { cranes:2 }); expect((await sim(page)).outputs.queued).toBe(12);
    await set(page, { cranes:1, yards:2 }); expect((await sim(page)).outputs).toMatchObject({ 'capacity-rate':24, completed:48, queued:0, bottleneck:'carrier' });
    await set(page, { carriers:2 }); expect((await sim(page)).outputs).toMatchObject({ 'capacity-rate':30, completed:48, bottleneck:'crane' });
  });
  test('span visibility follows hidden endpoints; reduced motion preserves end geometry in cinema', async ({ page }) => {
    await page.emulateMedia({ reducedMotion:'reduce' });
    await open(page, 'ch=lift&theme=cinema');
    await expect.poll(async () => (await span(page))?.length).toBeCloseTo(21.809,3);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).apply({ hidden:['trolley'] }));
    await expect.poll(async () => (await span(page))?.shown).toBe(false);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).apply({ hidden:[] }));
    await expect.poll(async () => (await span(page))?.shown).toBe(true);
  });
  test('phone controls are reachable in the reading drawer', async ({ page }) => {
    await page.setViewportSize({ width:390,height:844 });
    await open(page,'ch=count');
    await page.getByRole('button',{ name:'Read',exact:true }).click();
    const control = page.locator('.space-try [data-sim-control="n40"] button[aria-label$="Next value"]');
    await control.scrollIntoViewIfNeeded();
    expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await control.click(); await expect.poll(async () => (await sim(page)).outputs.teu).toBe(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

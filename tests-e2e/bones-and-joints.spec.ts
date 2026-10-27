/** Published bones-and-joints integration gates. Run externally with ATLAS_E2E_PORT=5445 after build. */
import { expect, test, type Page } from '@playwright/test';

type Joint = { angles: Record<string, number>; position: number[]; quaternion: number[] };
type Engine = {
  joint(id: string): Joint | null;
  sim(): { values: Record<string, unknown>; outputs: Record<string, unknown> };
  setSim(values: Record<string, unknown>): boolean;
  anchor(id: string): { shown: boolean; onScreen: boolean } | null;
};
const read = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const joint = (page: Page, id: string) => page.evaluate((name) => (window.__atlas!.engine as unknown as Engine).joint(name), id);
const pointDistance = (a: number[], b: number[]) => Math.hypot(...a.map((n, i) => n - b[i]!));
async function open(page: Page, query = '', locale = 'en') {
  await page.goto(`/${locale}/topics/bones-and-joints/${query ? `?${query}` : ''}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(() => joint(page, 'elbow.l')).not.toBeNull();
}
const CHAPTERS = [
  ['before-you-start', 4], ['connected-skeleton', 6], ['living-bone', 5], ['joint-connections', 5],
  ['six-synovial-types', 6], ['muscles-and-levers', 6], ['growth-and-repair', 4], ['bone-care', 4],
] as const;

test.describe('bones and joints', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

  for (const locale of ['en', 'zh']) {
    test(`${locale}: every chapter and all forty axis ticks are present`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await open(page, '', locale);
      await expect(page.locator('.atlas-axis__tick[data-beat]')).toHaveCount(40);
      for (const [id, count] of CHAPTERS) {
        await page.locator(`[data-chapter="${id}"]`).first().click();
        await expect.poll(() => page.evaluate(() => window.__atlas!.state().chapter)).toBe(id);
        await expect(page.locator(`.atlas-axis__tick[data-beat^="${id}."]`)).toHaveCount(count);
        for (let beat = 0; beat < count; beat++) {
          await page.locator(`.atlas-axis__tick[data-beat="${id}.${beat}"]`).click();
          await expect.poll(() => page.evaluate(() => (window.__atlas!.state() as { beat?: number | null }).beat)).toBe(beat);
          expect(await page.evaluate(() => window.__atlas!.state().modes.presentation)).toBe(false);
        }
      }
      expect(errors).toEqual([]);
    });
  }

  test('beat links reproduce the stated 150 N and 75 N ideal model readings', async ({ page }) => {
    await open(page, 'ch=muscles-and-levers&b=5');
    expect((await read(page)).outputs['muscle-force']).toBeCloseTo(150, 9);
    expect((await read(page)).outputs['load-arm']).toBeCloseTo(.3, 10);
    await expect(page.locator('.space-plate__reading', { hasText: 'Equivalent pull' })).toContainText('150');
    await expect.poll(async () => (await joint(page, 'elbow.l'))?.angles.flexion).toBe(90);
    const right = (await joint(page, 'hand.r'))!;
    await page.locator('.atlas-axis__tick[data-beat="muscles-and-levers.5"]').click();
    await expect.poll(async () => (await read(page)).outputs['muscle-force']).toBeCloseTo(75, 9);
    await expect.poll(async () => (await joint(page, 'elbow.l'))?.angles.flexion).toBeCloseTo(30, 5);
    expect(pointDistance((await joint(page, 'hand.r'))!.position, right.position)).toBeLessThan(1e-6);
  });

  test('manual controls and a fresh deep link reach the same rig endpoint; leaving lever restores the chapter pose', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'ch=muscles-and-levers&b=5');
    const right = (await joint(page, 'hand.r'))!;
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).setSim({ 'elbow-angle': 60 }));
    await expect.poll(async () => (await joint(page, 'elbow.l'))?.angles.flexion).toBe(60);
    const manual = (await joint(page, 'hand.l'))!;
    await open(page, 'ch=muscles-and-levers&b=5&sim=mode.lever~elbow-angle.60~load-force.20~load-distance.0.3');
    const linked = (await joint(page, 'hand.l'))!;
    expect(pointDistance(manual.position, linked.position)).toBeLessThan(1e-6);
    expect(pointDistance(manual.quaternion, linked.quaternion)).toBeLessThan(1e-6);
    expect(pointDistance((await joint(page, 'hand.r'))!.position, right.position)).toBeLessThan(1e-6);
    await page.locator('[data-chapter="connected-skeleton"]').first().click();
    await expect.poll(async () => (await read(page)).values.mode).toBe('explore');
    await expect.poll(async () => (await joint(page, 'elbow.l'))?.angles.flexion ?? 0).toBe(0);
  });

  test('growth and repair stay qualitative and the corrected protection figure loads', async ({ page }) => {
    await open(page, 'ch=living-bone', 'zh');
    const image = page.locator('img[src*="bones-and-joints-protected-organs"]');
    await expect(image).toHaveCount(1);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth === 1200)).toBe(true);
    await page.locator('[data-chapter="growth-and-repair"]').first().click();
    await expect(page.locator('.space-try')).toHaveCount(0);
    await page.locator('.atlas-axis__tick[data-beat="growth-and-repair.3"]').click();
    await expect(page.locator('body')).toContainText('愈合期限');
  });

  test('phone: the reading drawer and lever controls fit with touch-sized targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=muscles-and-levers&b=5');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    const control = page.locator('.space-try [data-sim-control="elbow-angle"]');
    await expect(control).toBeVisible();
    for (const button of await control.locator('button').all()) {
      const box = await button.boundingBox();
      if (box) expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
});

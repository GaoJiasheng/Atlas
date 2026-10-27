/** Browser gates are deliberately left to the main session, ATLAS_E2E_PORT=5443. */
import { expect, test, type Page } from '@playwright/test';
type Values = Record<string, number | string | boolean>;
type Curve = { x: string; domain: number[]; series: { id: string; points: { x: number; y: number }[] }[]; cursor: { x: number; values: Record<string, number> } };
type Engine = { sim(): { values: Values; outputs: Record<string, number | string>; table: { vary: unknown; values: Record<string, number | string> }[]; curve?: Curve }; setSim(values: Values): boolean };
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, values: Values) => page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const card = (page: Page) => page.locator('.space-try');
const output = (page: Page, id: string) => card(page).locator(`[data-sim-output="${id}"]`);
async function open(page: Page, chapter: string, query = '', locale = 'en') {
  await page.goto(`/${locale}/topics/sample-heat/?ch=${chapter}${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 60_000 });
  await expect.poll(() => page.evaluate(() => window.__atlas!.ready), { timeout: 60_000 }).toBe(true);
}

test.describe('sample-heat explicit analytic experiment', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });
  test('deep-linked time matches outputs, full curve, cursor and manually recorded row', async ({ page }) => {
    await open(page, 'sample-heating', '&sim=elapsed-s.120');
    const s = await sim(page);
    expect(s.outputs['heated-c']).toBeCloseTo(39.285714286, 6);
    expect(s.outputs['heated-j']).toBe(12000);
    expect(s.curve!.x).toBe('elapsed-s'); expect(s.curve!.domain).toEqual([0, 300]);
    const series = s.curve!.series[0]!;
    expect(series.points).toHaveLength(101); expect(series.points[0]!.x).toBe(0); expect(series.points[100]!.x).toBe(300);
    expect(series.points[40]!.x).toBe(120); expect(series.points[40]!.y).toBe(s.outputs['heated-c']);
    expect(s.curve!.cursor.values['heated-c']).toBe(s.outputs['heated-c']);
    await expect(output(page, 'heated-c')).toContainText('39.3');
    await expect(page.locator('.space-plate__reading', { hasText: 'HEATED WATER' })).toContainText('39.3');
    await card(page).locator('[data-sim-record]').click();
    expect((await sim(page)).table[0]!.values['heated-c']).toBe(s.outputs['heated-c']);
  });
  test('waiting and display modes preserve the explicit instant; only valid control steps enter the store', async ({ page }) => {
    await open(page, 'sample-heating', '&sim=elapsed-s.120');
    const before = await sim(page);
    await page.waitForTimeout(900);
    expect((await sim(page)).outputs['heated-c']).toBe(before.outputs['heated-c']);
    for (const key of ['r', 'r', 'e', 'e', 'Space', 'Space']) await page.keyboard.press(key);
    expect((await sim(page)).values['elapsed-s']).toBe(120);
    expect((await sim(page)).outputs['heated-c']).toBe(before.outputs['heated-c']);
    expect(await set(page, { 'elapsed-s': 121 })).toBe(false);
    expect((await sim(page)).values['elapsed-s']).toBe(120);
  });
  test('changing a held condition clears records and updates the curve while keeping elapsed time', async ({ page }) => {
    await open(page, 'sample-heating', '&sim=elapsed-s.60');
    await card(page).locator('[data-sim-record]').click();
    await set(page, { 'elapsed-s': 120 }); await card(page).locator('[data-sim-record]').click();
    expect((await sim(page)).table).toHaveLength(2);
    await card(page).locator('[data-sim-record]').click(); expect((await sim(page)).table).toHaveLength(2);
    await set(page, { 'heater-w': 50 });
    await expect.poll(async () => (await sim(page)).table.length).toBe(0);
    const s = await sim(page); expect(s.values['elapsed-s']).toBe(120); expect(s.outputs['heated-c']).toBeCloseTo(32.142857143, 6);
    expect(s.curve!.cursor.values['heated-c']).toBe(s.outputs['heated-c']);
    await expect(card(page)).toContainText('Conditions changed; start a new record.');
    await card(page).locator('[data-curve-zero]').click(); await expect.poll(async () => (await sim(page)).values['elapsed-s']).toBe(0);
  });
  test('prediction hides readings and the curve until chosen, then condition changes invalidate it', async ({ page }) => {
    await open(page, 'sample-tips');
    await expect(card(page).locator('[data-model-curve]')).toHaveCount(0);
    await expect(output(page, 'metal-c')).toHaveCount(0);
    await card(page).locator('[data-predict="metal"]').click();
    await expect(card(page).locator('[data-model-curve]')).toBeVisible();
    await expect(output(page, 'metal-c')).toContainText('62.9');
    expect((await sim(page)).values['elapsed-s']).toBe(60);
    await set(page, { 'bath-c': 5 });
    await expect(card(page).locator('[data-model-curve]')).toHaveCount(0);
    await expect(card(page).locator('.space-try__reveal')).toHaveCount(0);
  });
  test('cold bath and cold starting water reverse direction without overshoot', async ({ page }) => {
    await open(page, 'sample-tips', '&b=2&sim=bath-c.5~elapsed-s.60');
    let s = await sim(page); expect(s.outputs['metal-c']).toBeCloseTo(12.357588823, 6); expect(s.outputs['plastic-c']).toBeCloseTo(23.096748361, 6); expect(s.outputs['tip-comparison']).toBe('second-warmer');
    await open(page, 'sample-insulation', '&sim=cool-start-c.5~elapsed-s.120~cover.wrapped');
    s = await sim(page); expect(s.outputs['cool-c']).toBeCloseTo(6.378744406, 6); expect(s.outputs['cool-direction']).toBe('warming');
    expect(s.curve!.x).toBe('elapsed-s');
  });
  test('rod contraction and expansion stay in mm while the reference rod is not resized', async ({ page }) => {
    await open(page, 'sample-rod', '&sim=rod-c.85');
    expect((await sim(page)).outputs['rod-delta-mm']).toBeCloseTo(0.072, 9);
    await expect(output(page, 'rod-delta-mm')).toContainText('0.072');
    await set(page, { 'rod-c': 5 }); expect((await sim(page)).outputs['rod-length-mm']).toBeCloseTo(99.976, 9);
    await expect(output(page, 'rod-delta-mm')).toContainText('-0.024');
    await expect(card(page).locator('[data-model-curve]')).toHaveCount(0);
  });
  test('Chinese model table and static curve work with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'sample-cooling', '&sim=elapsed-s.120', 'zh');
    await expect(card(page).locator('[data-model-curve]')).toContainText('模型曲线');
    await card(page).locator('.space-curve__values summary').click();
    await expect(card(page).locator('.space-curve__values tbody tr')).toHaveCount(6);
    await expect(card(page).locator('svg[role="img"]').first()).toHaveAttribute('aria-label', /模型预计/);
    await page.keyboard.press(']'); await expect.poll(async () => (await sim(page)).values['elapsed-s']).toBe(150);
  });
  test('phone drawer controls have 44px targets and no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await open(page, 'sample-heating');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    const next = card(page).locator('[data-sim-control="elapsed-s"] button[aria-label$="Next value"]');
    await next.scrollIntoViewIfNeeded(); const box = (await next.boundingBox())!; expect(box.height).toBeGreaterThanOrEqual(44);
    await next.click(); await expect.poll(async () => (await sim(page)).values['elapsed-s']).toBe(30);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

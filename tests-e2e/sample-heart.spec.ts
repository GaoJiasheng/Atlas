/**
 * SpaceScene heart-and-lungs engine pieces (docs/40 §4, E-HL1–E-HL4) on the
 * placeholder bench `sample-heart`: a deep link draws the table's values at
 * once (balls counted, cells with their own decimals, the heartbeat and the
 * breathing at the bound frequency, the flows at the bound pace); `]` eases
 * the animations to a new frequency and changes the flows' pace; breathing
 * held in stops the breathing; the TYPICAL chip names its sources and opens
 * the source popover; the round shows its segments; Chinese; on a phone the
 * card works in the drawer with 44 px targets.
 */
import { expect, test, type Page } from '@playwright/test';

type Animation = { hz: number; phase: number; on: number } | null;
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, unknown>; sources?: Record<string, string[]> };
  animation(id: string): Animation;
  copies(id: string): number | null;
  flow(id: string): { paths: Record<string, { visible: boolean }>; pace?: number } | null;
};

async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/sample-heart/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const animation = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).animation(x), id);
const copies = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).copies(x), id);
const flow = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).flow(x), id);
const readout = (page: Page, id: string) => page.locator(`.space-try [data-sim-output="${id}"] dd b`);
const BREATHING = ['breathe', 'breathe-left', 'diaphragm-breathe'];

test.describe('sample-heart (SpaceScene table model, hz, tidal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a deep link draws the table at once: balls, decimals, TYPICAL with its sources', async ({ page }) => {
    await open(page, 'ch=sample-air&sim=sample.out');
    const o = (await sim(page)).outputs;
    expect([o.n2, o.o2, o.co2, o.h2o]).toEqual([78, 16, 4, 6]);
    await expect.poll(() => copies(page, 'o2-balls')).toBe(16);
    expect(await copies(page, 'co2-balls')).toBe(4);
    expect(await copies(page, 'h2o-balls')).toBe(6);
    await expect(readout(page, 'co2')).toHaveText('4');
    // The card observes typical outputs only: one TYPICAL line with the row's sources, no SIM line.
    const typical = page.locator('.space-try__sim[data-tag="typical"]');
    await expect(typical).toContainText('TYPICAL');
    await expect(typical.locator('.atlas-src')).toHaveText(['S1', 'S3']);
    await expect(page.locator('.space-try__sim[data-tag="sim"]')).toHaveCount(0);
    expect((await sim(page)).sources?.o2).toEqual(['S1', 'S3']);
    await expect(page.locator('.space-plate__simstate')).toHaveAttribute('data-tag', 'typical');
    // A source superscript opens the source popover.
    await typical.locator('.atlas-src').first().click();
    await expect(page.locator('.atlas-source-pop')).toBeVisible();
    await expect(page.locator('.atlas-source-pop__text')).toContainText('Sample source one');
  });

  test('[ goes back to the air breathed in: 0.04 % with two decimals, the balls follow', async ({ page }) => {
    await open(page, 'ch=sample-air&sim=sample.out');
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('[');
    await expect.poll(async () => (await sim(page)).values.sample).toBe('in');
    await expect(readout(page, 'co2')).toHaveText('0.04');
    await expect(readout(page, 'o2')).toHaveText('21');
    await expect.poll(() => copies(page, 'o2-balls')).toBe(21);
    expect(await copies(page, 'co2-balls')).toBe(0);
    await expect(page.locator('.space-try__sim[data-tag="typical"] .atlas-src')).toHaveText(['S1']);
  });

  test('a deep link plays the heart and the breathing at the bound frequency at once', async ({ page }) => {
    await open(page, 'ch=sample-effort&sim=activity.run');
    await expect.poll(async () => (await animation(page, 'heartbeat'))?.hz).toBeCloseTo(165 / 60, 3);
    for (const id of BREATHING) expect((await animation(page, id))!.hz).toBeCloseTo(40 / 60, 3);
    // Bound together: one phase.
    const phases = await Promise.all(BREATHING.map((id) => animation(page, id)));
    expect(new Set(phases.map((a) => a!.phase)).size).toBe(1);
    expect((await flow(page, 'to-lungs'))?.pace).toBeCloseTo(1.83, 6);
    expect((await flow(page, 'air-right'))?.pace).toBeCloseTo(2, 6);
    await expect(readout(page, 'beats')).toHaveText('165');
    // SIM numbers: the SIM line, no TYPICAL line.
    await expect(page.locator('.space-try__sim[data-tag="sim"]')).toContainText('SIM');
    await expect(page.locator('.space-try__sim[data-tag="typical"]')).toHaveCount(0);
  });

  test('] eases the heartbeat to the new frequency and changes the flows\' pace', async ({ page }) => {
    await open(page, 'ch=sample-effort');
    await expect.poll(async () => (await animation(page, 'heartbeat'))?.hz).toBeCloseTo(1.5, 3);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press(']');
    await expect.poll(async () => (await sim(page)).values.activity).toBe('walk');
    await expect(page).toHaveURL(/sim=activity\.walk/);
    // On its way: some frame shows a frequency between the two.
    let between = false;
    for (let i = 0; i < 40 && !between; i++) {
      const hz = (await animation(page, 'heartbeat'))!.hz;
      between = hz > 1.51 && hz < 115 / 60 - 0.01;
      await page.waitForTimeout(15);
    }
    expect(between).toBe(true);
    await expect.poll(async () => (await animation(page, 'heartbeat'))?.hz, { timeout: 5_000 }).toBeCloseTo(115 / 60, 3);
    expect((await flow(page, 'heart-left'))?.pace).toBeCloseTo(1.28, 6);
    // The phase keeps going (it is integrated, never reset by the change).
    const a = (await animation(page, 'breathe'))!.phase;
    await expect.poll(async () => (await animation(page, 'breathe'))!.phase, { timeout: 5_000 }).not.toBe(a);
  });

  test('breathing held in stops the breathing animations and holds the pose', async ({ page }) => {
    await open(page, 'ch=sample-effort');
    await page.locator('.space-try [data-sim-control="phase"] [data-sim-value="in"]').click();
    await expect.poll(async () => (await animation(page, 'breathe'))?.on).toBe(0);
    expect((await sim(page)).outputs.chest).toBe('bigger');
    await expect(page.locator('.space-try [data-sim-output="chest"]')).toHaveAttribute('data-state', 'bigger');
    // The heart still beats.
    expect((await animation(page, 'heartbeat'))!.on).toBe(1);
  });

  test('the round shows a step\'s segment and the one before it', async ({ page }) => {
    await open(page, 'ch=sample-round&sim=stop.1');
    const shown = async (id: string) => Object.values((await flow(page, id))?.paths ?? {}).some((p) => p.visible);
    await expect.poll(() => shown('to-lungs')).toBe(true);
    await expect.poll(() => shown('exchange-lungs')).toBe(false);
    await expect.poll(() => shown('heart-left')).toBe(true);
    await expect(page.locator('.space-try [data-sim-output="where"]')).toHaveAttribute('data-state', 'to-lungs');
  });

  test('Chinese: the TYPICAL chip and the readouts', async ({ page }) => {
    await open(page, 'ch=sample-air', 'zh');
    await expect(page.locator('.space-try__sim[data-tag="typical"]')).toContainText('典型值');
    await expect(page.locator('.space-try [data-sim-output="o2"] dt')).toContainText('示例氧气');
    await expect(readout(page, 'co2')).toHaveText('0.04');
  });

  test('on a phone the card works in the drawer with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=sample-effort');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    const option = page.locator('.space-try [data-sim-control="activity"] [data-sim-value="run"]');
    await option.scrollIntoViewIfNeeded();
    const box = (await option.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    await option.click();
    await expect.poll(async () => (await sim(page)).values.activity).toBe('run');
    await expect(readout(page, 'beats')).toHaveText('165');
    await expect.poll(async () => (await animation(page, 'heartbeat'))?.hz, { timeout: 5_000 }).toBeCloseTo(2.75, 3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

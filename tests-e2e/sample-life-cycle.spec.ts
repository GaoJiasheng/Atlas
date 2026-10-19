/**
 * SpaceScene life-cycle engine (docs/33 §4, E-M1–E-M2) on the placeholder
 * dish `sample-life-cycle`: a deep link to day 4 puts the marker on the
 * fourth larva and lights it on the ring card; `]` moves one day; another
 * water temperature changes the ring's days and speeds the cycle flow; in
 * the tipping-out chapter every 8 days lets adults fly away and scrubbing
 * the wall takes the eggs; a ring node selects its part; the second ring
 * and its link; the ring in words in Chinese; below 1024 px the ring sits
 * in the try-it card with 44 px targets.
 */
import { expect, test, type Page } from '@playwright/test';

type Anchor = { x: number; y: number; shown: boolean; onScreen: boolean } | null;
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, unknown> };
  anchor(id: string): Anchor;
};

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const anchor = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).anchor(x), id);
const ring = (page: Page) => page.locator('.space-cy-card .space-cy');
const dist = (a: Anchor, b: Anchor) => (a && b ? Math.hypot(a.x - b.x, a.y - b.y) : Infinity);

test.describe('sample-life-cycle (SpaceScene life-cycle model)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a deep link to day 4: the marker on the fourth larva, the ring lights larva 4', async ({ page }) => {
    await open(page, '/en/topics/sample-life-cycle/?ch=one-day&sim=day.4');
    expect((await sim(page)).outputs.stage).toBe('l4');
    await expect(ring(page)).toHaveAttribute('data-stage', 'l4');
    await expect(ring(page).locator('[data-node="l4"]')).toHaveAttribute('data-on', 'true');
    await expect(ring(page).locator('[data-node][data-on]')).toHaveCount(1);
    // The marker (posed to the l4 station) sits over the fourth larva, not the first.
    await expect.poll(async () => dist(await anchor(page, 'follow-marker'), await anchor(page, 'larva-l4')), { timeout: 10_000 }).toBeLessThan(dist(await anchor(page, 'larva-l1'), await anchor(page, 'larva-l4')) / 2);
    await expect(page.locator('.space-try [data-sim-output="stage"]')).toHaveAttribute('data-state', 'l4');
  });

  test('] moves one day: day 2 is the second larva, on the card and in the URL', async ({ page }) => {
    await open(page, '/en/topics/sample-life-cycle/?ch=one-day');
    await page.locator('body').click({ position: { x: 800, y: 450 } });
    await page.keyboard.press(']');
    await page.keyboard.press(']');
    await expect.poll(async () => (await sim(page)).values.day).toBe(2);
    await expect(ring(page)).toHaveAttribute('data-stage', 'l2');
    await expect(page).toHaveURL(/sim=day\.2/);
    await expect(page.locator('.space-try [data-sim-output="days-left"] b')).toHaveText('5.2');
  });

  test('another water temperature: the ring\'s days change and the cycle runs faster', async ({ page }) => {
    await open(page, '/en/topics/sample-life-cycle/?ch=warm-water');
    await expect(ring(page)).toContainText('≈ 7.2 d');
    await expect(ring(page)).toHaveAttribute('aria-label', /Pupa, 1\.9 days/);
    const before = ((await sim(page)).outputs.rate as Record<string, number>)['life-cycle:ring']!;
    await page.locator('.space-try [data-sim-control="temp"] button[aria-label$="Next value"]').click();
    await expect.poll(async () => (await sim(page)).values.temp).toBe(32);
    await expect(ring(page)).toContainText('≈ 6.4 d');
    await expect(ring(page)).toHaveAttribute('aria-label', /Pupa, 1\.7 days/);
    const after = ((await sim(page)).outputs.rate as Record<string, number>)['life-cycle:ring']!;
    expect(after).toBeGreaterThan(before);
    expect(after).toBeCloseTo(7.23 / 6.4, 6);
  });

  test('tipping out every 8 days lets adults fly away; scrubbing the wall takes the eggs', async ({ page }) => {
    await open(page, '/en/topics/sample-life-cycle/?ch=tip-out');
    await expect.poll(async () => (await anchor(page, 'eggs'))?.shown).toBe(true);
    expect((await sim(page)).outputs.adults).toBe('none');
    expect((await anchor(page, 'escaped-adults'))?.shown).toBe(false);
    await page.locator('.space-try [data-sim-control="every"] button[aria-label$="Next value"]').click();
    await expect.poll(async () => (await sim(page)).values.every).toBe(8);
    expect((await sim(page)).outputs.adults).toBe('some');
    await expect.poll(async () => (await anchor(page, 'escaped-adults'))?.shown).toBe(true);
    await page.locator('.space-try [data-sim-control="wipe"] [role="switch"]').click();
    expect((await sim(page)).outputs['eggs-left']).toBe('none');
    await expect.poll(async () => (await anchor(page, 'eggs'))?.shown).toBe(false);
  });

  test('a ring node selects its stage\'s part; 44 px targets', async ({ page }) => {
    await open(page, '/en/topics/sample-life-cycle/?ch=warm-water');
    const node = ring(page).locator('[data-node="pupa"]');
    await node.click();
    await expect.poll(() => page.evaluate(() => (window.__atlas!.state() as unknown as { part: string | null }).part)).toBe('pupa');
    await expect(node).toHaveAttribute('data-picked', 'true');
    const box = await node.locator('.space-cy__target').boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
  });

  test('the second ring and its link; the switch turns it off', async ({ page }) => {
    await open(page, '/en/topics/sample-life-cycle/?ch=two-cycles');
    await expect(ring(page).locator('[data-second]')).toHaveCount(1);
    await expect(ring(page).locator('[data-node2]')).toHaveCount(3);
    const link = page.locator('.space-cy-card .space-cy__link');
    await expect(link).toHaveText('See the grasshopper');
    await expect(link).toHaveAttribute('href', /\/en\/topics\/grasshopper\/\?ch=nerves-and-growing-up$/);
    await page.locator('.space-cy-card [data-cycle-compare]').click();
    await expect(ring(page).locator('[data-second]')).toHaveCount(0);
    expect((await sim(page)).values.compare).toBe(false);
  });

  test('Chinese: the ring in words', async ({ page }) => {
    await open(page, '/zh/topics/sample-life-cycle/?ch=warm-water&sim=temp.20');
    await expect(ring(page)).toHaveAttribute('aria-label', '这个模型里水温 20 °C 时的生活史：卵，等水来；一龄，3.0 天；二龄，1.5 天；三龄，1.6 天；四龄，3.2 天；蛹，4.1 天；成虫，产卵。');
    await expect(ring(page)).toContainText('在水里');
  });

  test('below 1024 px the ring sits in the try-it card, inside the screen, with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 1200 });
    await open(page, '/en/topics/sample-life-cycle/?ch=one-day');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    const inCard = page.locator('.space-try__diagram .space-cy');
    await inCard.scrollIntoViewIfNeeded();
    await expect(inCard).toBeVisible();
    const box = await inCard.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(900);
    const target = inCard.locator('[data-node="l1"] .space-cy__target');
    expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(900);
  });
});

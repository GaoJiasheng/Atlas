/**
 * The mosquito topic (docs/33): day by day in the eggs-and-larvae chapter (a
 * deep link to day 4 lights larva 4 on the ring and moves the marker; `]`
 * walks a day; the head-width records draw steps; predict-then-observe);
 * the water-temperature fair test (32 °C: the ring's days, the faster cycle,
 * the line graph, the prediction); tipping out the water (every 6 days no
 * adult flies away, every 10 some do, scrubbing the wall takes the eggs);
 * the grasshopper's ring and its link; the Chinese page; a 390 × 844 phone.
 */
import { expect, test, type Page } from '@playwright/test';

type Anchor = { x: number; y: number; shown: boolean; onScreen: boolean } | null;
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, unknown> };
  setSim(v: Record<string, unknown>): boolean;
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
const card = (page: Page) => page.locator('.space-try');
const dist = (a: Anchor, b: Anchor) => (a && b ? Math.hypot(a.x - b.x, a.y - b.y) : Infinity);

test.describe('mosquito', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('day 4 after hatching: the fourth larva on the ring and under the marker, its head width', async ({ page }) => {
    await open(page, '/en/topics/mosquito/?ch=eggs-and-larvae&sim=day.4');
    expect((await sim(page)).outputs.stage).toBe('l4');
    await expect(ring(page)).toHaveAttribute('data-stage', 'l4');
    await expect(ring(page).locator('[data-node="l4"]')).toHaveAttribute('data-on', 'true');
    await expect(card(page).locator('[data-sim-output="head-width"] b')).toHaveText('0.99');
    await expect(card(page).locator('[data-sim-output="days-left"] b')).toHaveText('3.2');
    await expect
      .poll(async () => dist(await anchor(page, 'follow-marker'), await anchor(page, 'larva-l4')), { timeout: 10_000 })
      .toBeLessThan(dist(await anchor(page, 'larva-l1'), await anchor(page, 'larva-l4')) / 2);
  });

  test('] walks a day at a time; the head-width records rise in steps', async ({ page }) => {
    await open(page, '/en/topics/mosquito/?ch=eggs-and-larvae');
    await page.locator('body').click({ position: { x: 700, y: 450 } });
    for (let day = 0; day <= 5; day++) {
      await card(page).locator('[data-sim-record]').click();
      if (day < 5) await page.keyboard.press(']');
    }
    await expect.poll(async () => (await sim(page)).values.day).toBe(5);
    await expect(page).toHaveURL(/sim=day\.5/);
    await expect(ring(page)).toHaveAttribute('data-stage', 'l4');
    const line = card(page).locator('.space-chart[data-kind="line"] svg[role="img"]');
    await expect(line).toHaveAttribute('aria-label', /0\.24.*0\.99/);
  });

  test('predict then observe: the head is no wider from day 0 to day 1', async ({ page }) => {
    await open(page, '/en/topics/mosquito/?ch=eggs-and-larvae');
    await card(page).locator('[data-predict="same"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('The same');
    await expect.poll(async () => (await sim(page)).values.day).toBe(1);
  });

  test('warmer water: 32 °C on the ring, a faster cycle, a line graph and the prediction', async ({ page }) => {
    await open(page, '/en/topics/mosquito/?ch=round-the-cycle');
    await expect(ring(page)).toContainText('≈ 7.2 d');
    const before = ((await sim(page)).outputs.rate as Record<string, number>)['life-cycle:ring']!;
    for (const temp of [20, 25, 28, 32]) {
      await page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim({ temp: v }), temp);
      await card(page).locator('[data-sim-record]').click();
    }
    await expect(ring(page)).toContainText('≈ 6.4 d');
    await expect(ring(page)).toHaveAttribute('aria-label', /Pupa, 1\.7 days/);
    expect(((await sim(page)).outputs.rate as Record<string, number>)['life-cycle:ring']!).toBeGreaterThan(before);
    await expect(card(page).locator('[data-sim-output="to-adult"] b')).toHaveText('6.4');
    await expect(card(page).locator('.space-chart[data-kind="line"]')).toBeVisible();
    await card(page).locator('[data-predict="fewer"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('Fewer days');
  });

  test('tipping out the water: every 6 days no adult gets away, every 10 some do; scrubbing takes the eggs', async ({ page }) => {
    await open(page, '/en/topics/mosquito/?ch=breaking-the-cycle&sim=every.6');
    expect((await sim(page)).outputs.adults).toBe('none');
    await expect.poll(async () => (await anchor(page, 'escaped-adults'))?.shown ?? false).toBe(false);
    await expect.poll(async () => (await anchor(page, 'eggs'))?.shown).toBe(true);
    await page.locator('.space-try [data-sim-control="every"] button[aria-label$="Next value"]').click();
    await page.locator('.space-try [data-sim-control="every"] button[aria-label$="Next value"]').click();
    await expect.poll(async () => (await sim(page)).values.every).toBe(10);
    expect((await sim(page)).outputs.adults).toBe('some');
    await expect.poll(async () => (await anchor(page, 'escaped-adults'))?.shown).toBe(true);
    await page.locator('.space-try [data-sim-control="wipe"] [role="switch"]').click();
    expect((await sim(page)).outputs['eggs-left']).toBe('none');
    await expect.poll(async () => (await anchor(page, 'eggs'))?.shown).toBe(false);
  });

  test('the grasshopper ring and its link', async ({ page }) => {
    await open(page, '/en/topics/mosquito/?ch=round-the-cycle&b=5');
    await expect(ring(page).locator('[data-second]')).toHaveCount(1);
    await expect(ring(page).locator('[data-node2]')).toHaveCount(3);
    const link = page.locator('.space-cy-card .space-cy__link');
    await expect(link).toHaveText('See the grasshopper');
    await expect(link).toHaveAttribute('href', /\/en\/topics\/grasshopper\/\?ch=nerves-and-growing-up$/);
    await page.locator('.space-cy-card [data-cycle-compare]').click();
    await expect(ring(page).locator('[data-second]')).toHaveCount(0);
  });

  test('Chinese: the ring in words, the card and the reading panel', async ({ page }) => {
    await open(page, '/zh/topics/mosquito/?ch=round-the-cycle&sim=temp.20');
    await expect(ring(page)).toHaveAttribute('aria-label', '这个模型里水温 20 °C 时的生活史：卵，等水来；一龄，3.0 天；二龄，1.5 天；三龄，1.6 天；四龄，3.2 天；蛹，4.1 天；成虫，产卵。');
    await expect(ring(page)).toContainText('在水里');
    await expect(card(page)).toContainText('试一试');
    await expect(page.locator('body')).toContainText('跟着小点绕一圈');
    await open(page, '/zh/topics/mosquito/?ch=breaking-the-cycle');
    await expect(page.locator('body')).toContainText('倒置存放水桶并擦干水桶边缘');
  });

  test('phone 390 × 844: the try-it card and its ring fit the drawer with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/mosquito/?ch=eggs-and-larvae');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    const inCard = page.locator('.space-try__diagram .space-cy');
    await inCard.scrollIntoViewIfNeeded();
    await expect(inCard).toBeVisible();
    const box = await inCard.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    for (const sel of ['[data-sim-record]', '[data-sim-control="day"] button']) {
      const target = card(page).locator(sel).first();
      await target.scrollIntoViewIfNeeded();
      expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

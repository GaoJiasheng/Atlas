/**
 * SpaceScene energy engine (docs/31 §4, E-EN1–8) on the placeholder block
 * `sample-energy`: a deep link shows the energy-chain card and the energy
 * bars at the run's end (adding up to 100 %), the KEY names stored
 * potential energy; a changed floor redraws the chain and replays the run;
 * a node of the card selects its part; the chain is words for screen
 * readers in both languages; on a phone the chain sits in the try-it card
 * with 44 px targets.
 */
import { expect, test, type Page } from '@playwright/test';

type Bars = Record<string, { potential: number; kinetic: number; lost: number; shown: boolean }>;
type Engine = { energyBars(): Bars; sim(): { timeline: Record<string, { playing: boolean }> } };

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const bars = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).energyBars());
const chainCard = (page: Page) => page.locator('.space-ec-card .space-ec');

test.describe('sample-energy (SpaceScene energy model)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a deep link: the chain card, the bars at the end of the run (100 % in all), stored energy in the KEY', async ({ page }) => {
    await open(page, '/en/topics/sample-energy/?ch=drop-and-swing');
    await expect(chainCard(page)).toHaveAttribute('aria-label', /Tennis ball → Test floor: kinetic energy 100 %/);
    await expect(chainCard(page).locator('[data-link="b-kept"]')).toHaveCount(1);
    await expect.poll(async () => (await bars(page))['bounce-run']?.shown).toBe(true);
    const b = (await bars(page))['bounce-run']!;
    expect(b.potential).toBeCloseTo(55, 3);
    expect(b.kinetic).toBeCloseTo(0, 3);
    expect(b.potential + b.kinetic + b.lost).toBeCloseTo(100, 3);
    await expect(page.locator('.space-ebars [data-bars="0"]')).toContainText('55 %');
    await expect(page.locator('.space-overlay')).toContainText('Potential energy (stored)');
  });

  test('another floor: the chain redraws and the run plays again; the bars still add up to 100 %', async ({ page }) => {
    await open(page, '/en/topics/sample-energy/?ch=drop-and-swing');
    await page.locator('.space-try [data-sim-control="surface"] [data-sim-value="sand"]').click();
    await expect(chainCard(page)).toHaveAttribute('aria-label', /Test floor → At the top of the bounce: potential energy 5 %/);
    await expect.poll(async () => (await sim(page)).timeline['bounce-run']!.playing).toBe(true);
    for (let i = 0; i < 5; i++) {
      const b = (await bars(page))['bounce-run']!;
      expect(Math.abs(b.potential + b.kinetic + b.lost - 100)).toBeLessThan(0.5);
      await page.waitForTimeout(150);
    }
    await expect.poll(async () => (await bars(page))['bounce-run']!.potential, { timeout: 10_000 }).toBeCloseTo(5, 2);
  });

  test('a node of the chain selects its part', async ({ page }) => {
    await open(page, '/en/topics/sample-energy/?ch=pedal');
    await chainCard(page).locator('[data-node="dyn"]').click();
    await expect.poll(() => page.evaluate(() => (window.__atlas!.state() as unknown as { part: string | null }).part)).toBe('bicycle-dynamo');
    await expect(chainCard(page).locator('[data-node="dyn"]')).toHaveAttribute('data-picked', 'true');
  });

  test('Chinese: the chain in words and the bars\' names', async ({ page }) => {
    await open(page, '/zh/topics/sample-energy/?ch=stored');
    await expect(chainCard(page)).toHaveAttribute('aria-label', /这个模型里的能量链：发条 → 玩具车轮: 动能 100 %/);
    await expect(page.locator('.space-ebars [data-bars="2"]')).toContainText('势能');
  });

  test('phone: the chain sits in the try-it card, inside the screen, with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/sample-energy/?ch=at-home');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    const chain = page.locator('.space-try__diagram .space-ec');
    await chain.scrollIntoViewIfNeeded();
    const box = await chain.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    const target = page.locator('.space-try [data-sim-value="kettle"]');
    await target.scrollIntoViewIfNeeded();
    expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

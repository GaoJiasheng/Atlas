/**
 * The energy-conversion topic (docs/31): a deep link shows the energy-chain
 * card, the energy bars at the run's end (100 % in all) and the model
 * readings; a try-it change plays the run, Run again and key G replay it,
 * and the records make a graph; the gas-to-lamp chain redraws for a filament
 * lamp and a node selects its part; predict-then-observe names the outcome;
 * the Chinese page reads in Chinese; on a phone the chain and the card fit
 * the drawer with 44 px targets.
 */
import { expect, test, type Page } from '@playwright/test';

type Run = { t: number; duration: number; playing: boolean; slow: number };
type Bars = Record<string, { potential: number; kinetic: number; lost: number; shown: boolean }>;
type SimInfo = { values: Record<string, unknown>; outputs: Record<string, unknown>; timeline: Record<string, Run>; replays: number };
type Engine = { sim(): SimInfo; setSim(v: Record<string, unknown>): boolean; simSeek(id: string, t: number): boolean; energyBars(): Bars };

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const bars = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).energyBars());
const card = (page: Page) => page.locator('.space-try');
const chainCard = (page: Page) => page.locator('.space-ec-card .space-ec');

test.describe('energy-conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a deep link: the chain card, the bars at the top of the bounce (100 % in all), the readings', async ({ page }) => {
    await open(page, '/en/topics/energy-conversion/?ch=up-high-and-moving');
    await expect(chainCard(page)).toHaveAttribute('aria-label', /Ball → Hitting the floor: kinetic energy 100 %; Hitting the floor → At the top of the bounce: potential energy 55 %/);
    await expect.poll(async () => (await bars(page))['bounce-run']?.shown).toBe(true);
    const b = (await bars(page))['bounce-run']!;
    expect(b.potential).toBeCloseTo(55, 3);
    expect(b.kinetic).toBeCloseTo(0, 3);
    expect(b.potential + b.kinetic + b.lost).toBeCloseTo(100, 3);
    // The swing and the toy are not in this chain: their bars are not drawn.
    expect((await bars(page))['swing-run']?.shown ?? false).toBe(false);
    const s = await sim(page);
    expect(s.outputs['impact-speed']).toBeCloseTo(4.427, 2);
    await expect(card(page).locator('[data-sim-output="bounce-height"]')).toContainText('55');
    await expect(page.locator('.space-plate__reading', { hasText: 'BOUNCE HEIGHT' })).toContainText('55');
    await expect(page.locator('.space-plate__reading', { hasText: 'PANEL OUTPUT' })).toContainText('—');
    await expect(page.locator('.space-overlay')).toContainText('Potential energy (stored)');
  });

  test('a lower drop plays the run; Run again and G replay it; the records make a line graph', async ({ page }) => {
    await open(page, '/en/topics/energy-conversion/?ch=up-high-and-moving');
    await page.keyboard.press('[');
    await expect.poll(async () => (await sim(page)).values.drop).toBe(75);
    await expect.poll(async () => (await sim(page)).timeline['bounce-run']!.playing).toBe(true);
    expect((await sim(page)).timeline['bounce-run']!.slow).toBe(2);
    await expect(card(page).locator('.space-try__slow')).toHaveText('Slowed down 2 times');
    // The bars add up to 100 % all through the run.
    for (let i = 0; i < 4; i++) {
      const b = (await bars(page))['bounce-run']!;
      expect(Math.abs(b.potential + b.kinetic + b.lost - 100)).toBeLessThan(0.5);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).simSeek('bounce-run', 5));
    const before = (await sim(page)).replays;
    await page.keyboard.press('g');
    await expect.poll(async () => (await sim(page)).replays).toBe(before + 1);
    expect((await sim(page)).timeline['bounce-run']!.t).toBeLessThan(0.5);
    await card(page).locator('[data-sim-replay]').click();
    await expect.poll(async () => (await sim(page)).replays).toBe(before + 2);
    for (const drop of [25, 50, 75, 100]) {
      await page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim({ chain: 'bounce', drop: v, surface: 'tile' }), drop);
      await card(page).locator('[data-sim-record]').click();
    }
    const line = card(page).locator('.space-chart[data-kind="line"] svg[role="img"]');
    await expect(line).toHaveAttribute('aria-label', /Bounce height rises/);
    await expect(line).toHaveAttribute('aria-label', /55 cm/);
  });

  test('gas to lamp: a filament lamp needs four times the energy for the same light; a node selects its part', async ({ page }) => {
    await open(page, '/en/topics/energy-conversion/?ch=never-used-up');
    await expect(card(page).locator('[data-sim-output="same-light"]')).toContainText('25');
    await card(page).locator('[data-sim-control="lamp-type"] [data-sim-value="filament"]').click();
    await expect(card(page).locator('[data-sim-output="same-light"]')).toContainText('100');
    await expect(chainCard(page)).toHaveAttribute('aria-label', /Natural gas → Power station: potential energy 100 %/);
    await chainCard(page).locator('[data-node="lamp"]').click();
    await expect.poll(() => page.evaluate(() => (window.__atlas!.state() as unknown as { part: string | null }).part)).toBe('led-lamp');
  });

  test('predict then observe: from the fan to the speaker, less ends in the form we want', async ({ page }) => {
    await open(page, '/en/topics/energy-conversion/?ch=electrical-energy-at-home');
    await card(page).locator('[data-predict="less"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('Observed: Less');
    await expect.poll(async () => (await sim(page)).values.appliance).toBe('speaker');
    expect((await sim(page)).outputs.useful).toBeCloseTo(1, 6);
  });

  test('Chinese: the card, the chain and the reading panel are in Chinese', async ({ page }) => {
    await open(page, '/zh/topics/energy-conversion/?ch=pedal-power&sim=chain.dynamo~speed.15');
    await expect(card(page)).toContainText('试一试');
    await expect(card(page).locator('[data-sim-control="speed"]')).toContainText('km/h');
    await expect(chainCard(page)).toHaveAttribute('aria-label', /发电机/);
    await expect(page.locator('body')).toContainText('踩出来的电能');
    await expect(page.locator('body')).toContainText('发电机并不制造能量');
  });

  test('phone: the chain sits in the try-it card, inside the screen, with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/energy-conversion/?ch=stored-energy');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    for (const winds of [2, 4, 6]) {
      await page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim({ chain: 'windup', winds: v }), winds);
      await page.evaluate(() => document.querySelector<HTMLButtonElement>('.space-try [data-sim-record]')!.click());
    }
    const chain = page.locator('.space-try__diagram .space-ec');
    await chain.scrollIntoViewIfNeeded();
    const cbox = await chain.boundingBox();
    expect(cbox!.x).toBeGreaterThanOrEqual(0);
    expect(cbox!.x + cbox!.width).toBeLessThanOrEqual(390);
    for (const sel of ['[data-sim-replay]', '[data-sim-record]']) {
      const target = card(page).locator(sel).first();
      await target.scrollIntoViewIfNeeded();
      expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    const graph = card(page).locator('.space-chart svg');
    await graph.scrollIntoViewIfNeeded();
    const gbox = await graph.boundingBox();
    expect(gbox!.x + gbox!.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

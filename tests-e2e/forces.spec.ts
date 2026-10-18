/**
 * The forces topic (docs/30): a try-it change plays the run and records into
 * a graph; Run again and key G replay it (one count); predict-then-observe
 * names the state; the Chinese page reads in Chinese; the phone drawer keeps
 * 44 px targets and the graph inside the screen.
 */
import { expect, test, type Page } from '@playwright/test';

type Run = { t: number; duration: number; playing: boolean; slow: number };
type SimInfo = { values: Record<string, unknown>; outputs: Record<string, unknown>; timeline: Record<string, Run>; replays: number };
type Engine = { sim(): SimInfo; setSim(v: Record<string, unknown>): boolean; simSeek(id: string, t: number): boolean };

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const card = (page: Page) => page.locator('.space-try');

test.describe('forces', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a deep link shows the run at its end with the model readings', async ({ page }) => {
    await open(page, '/en/topics/forces/?ch=friction-and-motion&sim=runway.carpet');
    const s = await sim(page);
    expect(s.outputs.distance).toBeCloseTo(19.2, 6);
    const run = s.timeline['car-run']!;
    expect(run.playing).toBe(false);
    expect(run.t).toBe(run.duration);
    await expect(card(page).locator('[data-sim-output="distance"]')).toContainText('19');
    await expect(page.locator('.space-plate__reading', { hasText: 'DISTANCE' })).toContainText('19');
    await expect(page.locator('.space-plate__reading', { hasText: 'PULL TO START' })).toContainText('—');
  });

  test('changing the lane plays the pull; Run again and G replay it; the records make a bar graph', async ({ page }) => {
    await open(page, '/en/topics/forces/?ch=friction-starting');
    await card(page).locator('[data-sim-control="lane"] [data-sim-value="glass"]').click();
    await expect.poll(async () => (await sim(page)).timeline['pull-run']!.playing).toBe(true);
    await expect(card(page).locator('[data-sim-output="f-start"]')).toContainText('0.5');
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).simSeek('pull-run', 9));
    const before = (await sim(page)).replays;
    await page.keyboard.press('g');
    await expect.poll(async () => (await sim(page)).replays).toBe(before + 1);
    expect((await sim(page)).timeline['pull-run']!.t).toBeLessThan(0.5);
    await card(page).locator('[data-sim-replay]').click();
    await expect.poll(async () => (await sim(page)).replays).toBe(before + 2);
    // The other experiments' runs are not touched.
    expect((await sim(page)).timeline['wheel-run']!.playing).toBe(false);
    for (const lane of ['glass', 'wood', 'sandpaper']) {
      await card(page).locator(`[data-sim-control="lane"] [data-sim-value="${lane}"]`).click();
      await card(page).locator('[data-sim-record]').click();
    }
    const bar = card(page).locator('.space-chart[data-kind="bar"] svg[role="img"]');
    await expect(bar).toHaveAttribute('aria-label', /Glass 0\.5 N, Wood 1\.0 N, Sandpaper 1\.8 N; highest for Sandpaper/);
  });

  test('the spring records draw a line graph that bends past 300 g', async ({ page }) => {
    await open(page, '/en/topics/forces/?ch=elastic-spring-force');
    for (let i = 0; i < 8; i++) {
      await card(page).locator('[data-sim-record]').click();
      await page.keyboard.press(']');
    }
    await card(page).locator('[data-sim-record]').click();
    const line = card(page).locator('.space-chart[data-kind="line"] svg[role="img"]');
    await expect(line).toHaveAttribute('aria-label', /rises by 1\.0 cm for every 50 g up to 300 g, then rises faster/);
  });

  test('predict then observe: a hard push from the front stops the rolling car', async ({ page }) => {
    await open(page, '/en/topics/forces/?ch=pushes-and-pulls');
    await card(page).locator('[data-predict="stops"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('Observed: Stops');
    await expect.poll(async () => (await sim(page)).values.push).toBe('front-firm');
  });

  test('the drop is slowed down four times and the two balls land together', async ({ page }) => {
    await open(page, '/en/topics/forces/?ch=gravity-and-weight');
    await expect(card(page).locator('.space-try__slow')).toHaveText('Slowed down 4 times');
    const s = await sim(page);
    expect(s.outputs.landing).toBe('together');
    expect(s.timeline['drop-run']!.slow).toBe(4);
  });

  test('Chinese: the card and the reading panel are in Chinese', async ({ page }) => {
    await open(page, '/zh/topics/forces/?ch=friction-starting');
    await expect(card(page)).toContainText('试一试');
    await expect(card(page).locator('[data-sim-control="lane"]')).toContainText('砂纸');
    await expect(page.locator('body')).toContainText('摩擦力：让东西动起来');
    await expect(page.locator('body')).toContainText('木块和道面之间的摩擦力往回拉');
  });

  test('phone: the card, Run again and the graph fit the drawer with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/forces/?ch=forces-at-work');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    for (const squeeze of ['none', 'light', 'firm']) {
      await page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim({ squeeze: v }), squeeze);
      await page.evaluate(() => document.querySelector<HTMLButtonElement>('.space-try [data-sim-record]')!.click());
    }
    for (const sel of ['[data-sim-replay]', '[data-sim-record]', '[data-sim-value="firm"]']) {
      const target = card(page).locator(sel).first();
      await target.scrollIntoViewIfNeeded();
      const box = await target.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const chart = card(page).locator('.space-chart svg');
    await chart.scrollIntoViewIfNeeded();
    const box = await chart.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

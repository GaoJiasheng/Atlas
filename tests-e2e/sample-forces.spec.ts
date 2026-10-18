/**
 * SpaceScene forces engine (docs/30 §4, F0–F8) on the placeholder bench
 * `sample-forces`: a deep link shows the runs' end states and the readings;
 * a changed value plays the run again, so do "Run again" and key G (one
 * count); a choice records into a bar graph, a step into a line graph, with
 * words for screen readers; predict-then-observe reveals a state; the
 * background chapter's reading note; the phone drawer keeps 44 px targets.
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

test.describe('sample-forces (SpaceScene force model)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a deep link shows each run at its end, the readings and the forces in the KEY', async ({ page }) => {
    await open(page, '/en/topics/sample-forces/?ch=springs&sim=spring-load.400');
    const s = await sim(page);
    expect(s.outputs.extension).toBeCloseTo(9.2, 6);
    for (const run of Object.values(s.timeline)) {
      expect(run.playing).toBe(false);
      expect(run.t).toBe(run.duration);
    }
    await expect(card(page).locator('[data-sim-output="extension"]')).toContainText('9.2');
    // PLATE: the weight row shows the load's weight this chapter observes; the pull row is this chapter's `—`.
    await expect(page.locator('.space-plate__reading', { hasText: 'WEIGHT' })).toContainText('3.9');
    await expect(page.locator('.space-plate__reading', { hasText: 'PULL TO START' })).toContainText('—');
    await expect(page.locator('.space-plate__simstate')).toContainText('SIM LOADED');
    await expect(page.locator('.space-overlay')).toContainText('Elastic spring force');
  });

  test('a changed value plays the run; Run again and G play it from the start (one count); slowed runs say so', async ({ page }) => {
    await open(page, '/en/topics/sample-forces/?ch=falling');
    await expect(card(page).locator('.space-try__slow')).toHaveText('Slowed down 4 times');
    await card(page).locator('[data-sim-control="pair"] [data-sim-value="papers"]').click();
    await expect.poll(async () => (await sim(page)).timeline['drop-run']!.playing).toBe(true);
    const run = (await sim(page)).timeline['drop-run']!;
    expect(run.slow).toBe(4);
    expect(run.duration).toBeCloseTo(1.0, 1);
    // Hold it at the end, then G: from the start again.
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).simSeek('drop-run', 9));
    await expect.poll(async () => (await sim(page)).timeline['drop-run']!.t).toBeCloseTo(1.0, 1);
    const before = (await sim(page)).replays;
    await page.keyboard.press('g');
    await expect.poll(async () => (await sim(page)).replays).toBe(before + 1);
    expect((await sim(page)).timeline['drop-run']!.t).toBeLessThan(0.5);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).simSeek('drop-run', 9));
    await card(page).locator('[data-sim-replay]').click();
    await expect.poll(async () => (await sim(page)).replays).toBe(before + 2);
    // The run does not touch the other apparatus' runs.
    expect((await sim(page)).timeline['wheel-run']!.playing).toBe(false);
  });

  test('records draw a bar graph over a choice and a line graph over a step, with words for screen readers', async ({ page }) => {
    await open(page, '/en/topics/sample-forces/?ch=starting');
    for (const lane of ['glass', 'wood', 'sandpaper']) {
      await card(page).locator(`[data-sim-control="lane"] [data-sim-value="${lane}"]`).click();
      await card(page).locator('[data-sim-record]').click();
    }
    const bar = card(page).locator('.space-chart[data-kind="bar"] svg[role="img"]');
    await expect(bar).toHaveAttribute('aria-label', /Bar graph\. Pull to start for each surface: Glass 0\.5 N, Wood 1\.0 N, Sandpaper 1\.8 N; highest for Sandpaper/);
    await open(page, '/en/topics/sample-forces/?ch=springs');
    for (let i = 0; i < 8; i++) {
      await card(page).locator('[data-sim-record]').click();
      await page.keyboard.press(']');
    }
    await card(page).locator('[data-sim-record]').click();
    const line = card(page).locator('.space-chart[data-kind="line"] svg[role="img"]');
    await expect(line).toHaveAttribute('aria-label', /rises by 1\.0 cm for every 50 g up to 300 g, then rises faster/);
  });

  test('predict then observe a state: the reveal names the state', async ({ page }) => {
    await open(page, '/en/topics/sample-forces/?ch=springs');
    await card(page).locator('[data-predict="back"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('Observed: Stays longer');
    await expect.poll(async () => (await sim(page)).values.unload).toBe(true);
  });

  test('the background chapter: BG on the axis, the reading note, no try-it card', async ({ page }) => {
    await open(page, '/en/topics/sample-forces/?ch=before-you-start');
    await expect(page.locator('.atlas-note')).toContainText('Sample reading note');
    await expect(page.locator('.atlas-axis')).toContainText('BG');
    await expect(card(page)).toHaveCount(0);
  });

  test('phone: the card, Run again and the graph fit the drawer with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/sample-forces/?ch=braking');
    // The reading panel is a drawer on phones: open it.
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

/**
 * MathScene e2e on charts (docs/77 §3, §7): a beat tick changes the scale (the
 * bars ease, the reading line, the CHART card); a reading question where
 * tapping a bar draws a reading line (a help, not checked) and a wrong answer
 * is diagnosed; a table filled by keyboard only (Enter to the next cell); the
 * practice to its summary; zh; and the phone (390×844: a 6-point line graph
 * and the docked tray with no sideways scroll, numbers ≥ 12 px).
 */
import { expect, test, type Page } from '@playwright/test';

type TaskInfo = { id: string | null; kind: string | null; phase: string; done: boolean; tries: number; feedback: { tone: string; code: string | null } | null };
type Engine = { task(): TaskInfo; goToTask(step: string, i: number, o?: { instant?: boolean }): void; solve(): boolean };

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined && typeof (window.__atlas.engine as { goToTask?: unknown }).goToTask === 'function', null, { timeout: 30_000 });
  await page.evaluate(() => window.__atlas!.ready);
  await page.evaluate(() => window.__atlas!.setLegends(true));
}
const info = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).task());
/** The i-th check of a step's pool, or the i-th practice question (from 1). */
const force = (page: Page, step: string, i: number) => page.evaluate(([s, k]) => (window.__atlas!.engine as unknown as Engine).goToTask(s as string, k as number, { instant: true }), [step, i] as const);
const state = (page: Page) => page.evaluate(() => window.__atlas!.state() as unknown as { chapter: string; beat: number });
const tray = (page: Page) => page.locator('[data-hud-panel="task"]');

test.describe('graphs (MathScene charts)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a beat tick rescales the same chart: shorter bars, the same numbers, a reading line and the card', async ({ page }) => {
    await open(page, '/en/topics/graphs/?ch=scales');
    await expect(page.locator('.atlas-axis__tick[data-beat^="scales."]')).toHaveCount(6);
    const bar = page.locator('.ms-svg .ms-chart__bar').nth(2).locator('rect');
    const tall = (await bar.boundingBox())!.height;
    await page.locator('.atlas-axis__tick[data-beat="scales.1"]').click();
    await expect.poll(async () => (await state(page)).beat).toBe(1);
    await expect.poll(async () => (await bar.boundingBox())!.height).toBeLessThan(tall * 0.6);
    await expect(page.locator('.ms-svg .ms-chart__guide')).not.toHaveCount(0);
    await expect(page.locator('.ms-equation')).toContainText('1 gridline = 2');
    await expect(page.locator('.ms-areacard')).toContainText('1 gridline = 2');
    await expect(page.locator('body')).not.toContainText(/\bPrimary [1-6]\b/);
  });

  test('a reading question: tapping a bar draws a reading line, a wrong answer is diagnosed, the right one checks', async ({ page }) => {
    await open(page, '/en/topics/graphs/?ch=scales');
    await force(page, 'scales', 3);
    await expect.poll(async () => (await info(page)).id).toBe('scale-read-five');
    const bar = page.locator('.ms-svg .ms-chart__bar[role="button"]').nth(3);
    await bar.click();
    await expect(bar).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.ms-svg .ms-chart__guide')).toHaveCount(1);
    const box = tray(page).locator('input[data-field="w"]');
    await box.fill('6');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('interval-misread');
    await box.fill('30');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await expect(page.locator('.ms-equation')).toHaveText('30');
  });

  test('a table filled by keyboard only: Enter moves to the next cell, the last one checks', async ({ page }) => {
    await open(page, '/en/topics/graphs/?ch=tables');
    await force(page, 'tables', 1);
    await expect.poll(async () => (await info(page)).kind).toBe('fill-table');
    const cells = tray(page).locator('.ms-input__cell input');
    await expect(cells).toHaveCount(3);
    await cells.first().focus();
    await page.keyboard.type('14');
    await page.keyboard.press('Enter');
    await expect(cells.nth(1)).toBeFocused();
    await page.keyboard.type('11');
    await page.keyboard.press('Enter');
    await page.keyboard.type('25');
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('tally-misread');
    await expect(page.locator('.ms-svg .ms-chart__blank[data-written]')).toHaveCount(3);
    await cells.first().fill('17');
    await cells.nth(2).fill('28');
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('the practice: every question solved, then the summary', async ({ page }) => {
    await open(page, '/en/topics/graphs/?ch=practice');
    for (let i = 1; i <= 8; i++) {
      await force(page, 'practice', i);
      await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
      await page.waitForTimeout(80);
      if (!(await info(page)).done) await tray(page).locator('[data-command="check"]').click();
      await expect.poll(async () => (await info(page)).done).toBe(true);
    }
    await tray(page).locator('.ms-tray__next').click();
    await expect(page.locator('.ms-summary')).toContainText('You got all 8.');
  });

  test('zh: the beat line, the card and the tray speak Chinese', async ({ page }) => {
    await open(page, '/zh/topics/graphs/?ch=pie-charts&b=3');
    await expect(page.locator('.ms-beatline')).toContainText('四分之一');
    await expect(page.locator('.ms-areacard')).toContainText('饼图');
    await page.locator('.atlas-axis__tick[data-beat="pie-charts.5"]').click();
    await expect(tray(page).locator('[data-another]')).toHaveText('再来一道');
  });

  test('phone 390x844: a 6-point line graph and its check fit, numbers are readable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/graphs/?ch=line-graphs&b=2');
    await expect(page.locator('.ms-svg .ms-chart__point')).toHaveCount(6);
    for (const t of await page.locator('.ms-svg .ms-chart__grid text').all()) expect(Number(await t.getAttribute('font-size'))).toBeGreaterThanOrEqual(12);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await force(page, 'line-graphs', 1);
    await expect(page.locator('.ms-tray-dock [data-hud-panel="task"]')).toBeVisible();
    // The points are buttons (and have a hit box) only once the forced check is the task on show;
    // `.all()` snapshots the count at once, so wait for all six first instead of racing the swap.
    await expect.poll(async () => (await info(page)).id).not.toBeNull();
    const hits = page.locator('.ms-svg .ms-chart__point[role="button"] .ms-chart__hit');
    await expect(hits).toHaveCount(6);
    for (const b of await hits.all()) {
      const r = (await b.boundingBox())!;
      expect(Math.min(r.width, r.height)).toBeGreaterThanOrEqual(43.5);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

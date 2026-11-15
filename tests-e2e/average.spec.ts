/**
 * MathScene e2e on averages (docs/78 §3, §7): beat ticks move blocks between
 * towers (each block keeps its identity, the total stays), the average line
 * and the AVERAGE card; an even-out check by pointer (tap a tower to lift its
 * top block, tap another to put it down) and by keyboard only (← → between
 * towers, Enter); with reduced motion the blocks go straight to their place;
 * a decimal average; the practice to its summary; the phone (390×844).
 */
import { expect, test, type Page } from '@playwright/test';

type TaskInfo = { id: string | null; kind: string | null; phase: string; done: boolean; feedback: { tone: string; code: string | null } | null };
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
const tray = (page: Page) => page.locator('[data-hud-panel="task"]');
const blocks = (page: Page) => page.locator('.ms-svg .ms-chart__block:not([data-gone])');

test.describe('average (MathScene towers)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('beat ticks level the towers: blocks move, the total stays, the average line and the card', async ({ page }) => {
    await open(page, '/en/topics/average/?ch=evening-out');
    await expect(blocks(page)).toHaveCount(12);
    await page.locator('.atlas-axis__tick[data-beat="evening-out.1"]').click();
    await expect(blocks(page)).toHaveCount(12);
    await expect(page.locator('.ms-svg .ms-chart__block[data-tone="signal"]')).toHaveCount(2);
    await page.locator('.atlas-axis__tick[data-beat="evening-out.2"]').click();
    await expect(page.locator('.ms-svg .ms-chart__mean')).toContainText('average 4');
    await expect(page.locator('.ms-areacard')).toContainText('4');
    await expect(page.locator('.ms-equation')).toHaveText('2 + 4 + 6 = 12 = 4 + 4 + 4');
  });

  test('even out by pointer: lift, put down, then write the average; a middle number is diagnosed', async ({ page }) => {
    await open(page, '/en/topics/average/?ch=evening-out');
    await force(page, 'evening-out', 2);
    await expect.poll(async () => (await info(page)).id).toBe('even-1-2-9');
    const towers = page.locator('.ms-svg .ms-chart__tower');
    await expect(towers).toHaveCount(3);
    await towers.nth(2).click();
    await expect(towers.nth(2)).toHaveAttribute('data-held');
    await towers.nth(0).click();
    await expect(tray(page)).toContainText('Blocks moved: 1');
    const box = tray(page).locator('input[data-field="w"]');
    await box.fill('2');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('average-as-middle');
    await box.fill('4');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('even out by keyboard only, with reduced motion: blocks go straight to their place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, '/en/topics/average/?ch=evening-out');
    await force(page, 'evening-out', 1);
    await expect.poll(async () => (await info(page)).id).toBe('even-3-5-7');
    const towers = page.locator('.ms-svg .ms-chart__tower');
    await towers.nth(2).focus();
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Enter');
      await page.keyboard.press('ArrowRight');
      await expect(towers.nth(0)).toBeFocused();
      await page.keyboard.press('Enter');
      await page.keyboard.press('ArrowLeft');
    }
    await expect(tray(page)).toContainText('all the same height');
    const t = await page.locator('.ms-svg .ms-chart__block').first().evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(parseFloat(t)).toBeLessThan(0.01);
    await tray(page).locator('input[data-field="w"]').focus();
    await page.keyboard.type('5');
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('a decimal average: 7.5 kg, and 7 is diagnosed as the remainder dropped', async ({ page }) => {
    await open(page, '/en/topics/average/?ch=total-divided');
    await force(page, 'total-divided', 3);
    await expect.poll(async () => (await info(page)).id).toBe('avg-half');
    const box = tray(page).locator('input').first();
    await box.fill('7');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('remainder-dropped');
    await box.fill('7.5');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('the practice: every question solved, then the summary', async ({ page }) => {
    await open(page, '/en/topics/average/?ch=practice');
    for (let i = 1; i <= 7; i++) {
      await force(page, 'practice', i);
      await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
      await page.waitForTimeout(80);
      if (!(await info(page)).done) await tray(page).locator('[data-command="check"]').click();
      await expect.poll(async () => (await info(page)).done).toBe(true);
    }
    await tray(page).locator('.ms-tray__next').click();
    await expect(page.locator('.ms-summary')).toContainText('You got all 7.');
  });

  test('phone 390x844: the towers are finger-sized buttons, nothing scrolls sideways; zh speaks Chinese', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/zh/topics/average/?ch=evening-out');
    await force(page, 'evening-out', 4);
    await expect.poll(async () => (await info(page)).kind).toBe('even-out');
    for (const b of await page.locator('.ms-svg .ms-chart__tower .ms-chart__hit').all()) {
      const r = (await b.boundingBox())!;
      expect(Math.min(r.width, r.height)).toBeGreaterThanOrEqual(43.5);
    }
    await expect(tray(page)).toContainText('点一座塔');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

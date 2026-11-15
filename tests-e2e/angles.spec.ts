/**
 * MathScene e2e on angles (docs/76 §7 P, §8): a beat from the chapter axis (the protractor's two rows); laying the
 * protractor with the tray buttons on a phone and reading the other row diagnosed; laying it by keyboard alone;
 * turning the second arm by keyboard to draw an angle (the other row diagnosed, the slider never reads the size);
 * drawing a parallel line on dot paper by keyboard (a line that only looks parallel diagnosed); the practice to its
 * summary; every check solved through the browser; zh, cinema and the phone (finger-sized buttons, no sideways scroll).
 * No school level is shown anywhere.
 */
import { expect, test, type Page } from '@playwright/test';

type Info = { id: string; kind: string; done: boolean; revealed: boolean; tries: number; feedback: { code: string | null } | null };
type Engine = {
  task(): Info;
  tasks(): { step: string; index: number; id: string; practice: boolean }[];
  goToTask(step: string, index: number, options: { instant: boolean }): void;
  solve(): boolean;
};
const info = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).task());
const state = (page: Page) => page.evaluate(() => window.__atlas!.state() as unknown as { chapter: string; beat: number });
const tray = (page: Page) => page.locator('[data-hud-panel="task"]');
const check = (page: Page) => tray(page).locator('[data-command="check"]').click();
async function open(page: Page, locale = 'en', chapter = 'measuring-angles', beat?: number) {
  await page.goto(`/${locale}/topics/angles/?ch=${chapter}${beat ? `&b=${beat}` : ''}`);
  await page.waitForFunction(() => window.__atlas?.ready, null, { timeout: 30_000 });
  await page.evaluate(() => window.__atlas!.setLegends(true));
}
async function task(page: Page, step: string, index: number, id: string) {
  await page.evaluate(([s, i]) => (window.__atlas!.engine as unknown as Engine).goToTask(s, i, { instant: true }), [step, index] as const);
  await expect.poll(async () => (await info(page)).id).toBe(id);
  await expect(tray(page)).toBeVisible();
}

test.describe('angles', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a beat tick shows the protractor read on its inner row', async ({ page }) => {
    await open(page);
    await page.locator('.atlas-axis__tick[data-beat="measuring-angles.2"]').click();
    await expect.poll(async () => (await state(page)).beat).toBe(2);
    await expect(page.locator('.ms-angle__num--read')).toHaveCount(19);
    await expect(page.locator('.ms-beatline')).toContainText('two rows of numbers');
    await expect(page.locator('body')).not.toContainText(/\bP[1-6]\b|Primary [1-6]/);
  });

  test('lay the protractor by keyboard, then the other row is diagnosed', async ({ page }) => {
    await open(page);
    await task(page, 'measuring-angles', 1, 'ma-measure-50');
    await expect(tray(page).locator('[data-field="w"]')).toHaveCount(0);
    const prot = page.getByRole('slider', { name: /Protractor/ });
    await prot.focus();
    await page.keyboard.press('Home');
    await expect(prot).toHaveAttribute('aria-valuetext', 'centre on the vertex, 0 on an arm');
    await expect(page.locator('.ms-angle__lens')).toHaveCount(1);
    await tray(page).locator('[data-field="w"]').fill('130');
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('wrong-scale');
    await tray(page).locator('[data-field="w"]').fill('50');
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('draw an angle by keyboard: the slider reads the numbers, never the size', async ({ page }) => {
    await open(page, 'en', 'drawing-angles');
    await task(page, 'drawing-angles', 1, 'da-draw-65');
    const arm = page.getByRole('slider', { name: 'The arm you turn' });
    await arm.focus();
    for (let i = 0; i < 11; i++) await page.keyboard.press('Shift+ArrowRight');
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
    await expect(arm).toHaveAttribute('aria-valuetext', 'points at 115 on the inner scale and 65 on the outer scale');
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('wrong-scale');
    await arm.focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press('Shift+ArrowLeft');
    await expect(arm).toHaveAttribute('aria-valuetext', 'points at 65 on the inner scale and 115 on the outer scale');
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('a parallel line on dot paper by keyboard; one that only looks parallel is diagnosed', async ({ page }) => {
    await open(page, 'en', 'perpendicular-and-parallel');
    await task(page, 'perpendicular-and-parallel', 1, 'pp-draw-parallel');
    const paper = page.getByRole('grid', { name: /Dot paper/ });
    await paper.focus();
    for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
    for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('looks-parallel');
    await paper.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('practice: one check per question, then the summary', async ({ page }) => {
    await open(page, 'en', 'practice');
    for (const i of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const id = await page.evaluate((k) => (window.__atlas!.engine as unknown as Engine).tasks().filter((t) => t.practice)[k - 1]!.id, i);
      await task(page, 'practice', i, id);
      await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
      await page.waitForTimeout(100);
      await check(page);
      await expect.poll(async () => (await info(page)).done).toBe(true);
    }
    await tray(page).locator('.ms-tray__next').click();
    await expect(page.locator('.ms-summary')).toContainText('You got all 8.');
  });

  test('every check solves through the browser controller', async ({ page }) => {
    test.setTimeout(240_000);
    await open(page);
    const tasks = await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).tasks());
    const pool = tasks.filter((t) => !t.practice);
    expect(pool).toHaveLength(101);
    for (const t of pool) {
      await task(page, t.step, t.index, t.id);
      await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
      await check(page);
      await expect.poll(async () => (await info(page)).done, { message: t.id }).toBe(true);
    }
  });

  test('Chinese cinema phone: lay the protractor with the buttons, finger-sized, no sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => localStorage.setItem('atlas:theme', 'cinema'));
    await open(page, 'zh', 'drawing-angles');
    await page.evaluate(() => window.__atlas!.setLegends(false));
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cinema');
    await task(page, 'measuring-angles', 2, 'ma-measure-125-left');
    await expect(page.locator('.ms-tray-dock [data-hud-panel="task"]')).toBeVisible();
    for (const b of await page.locator('[data-hud-panel="task"] button:visible').all()) {
      const box = (await b.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(43.5);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await tray(page).getByRole('button', { name: '中心对准顶点' }).click();
    // The protractor lies upright, so its outer 0 is already on the arm pointing left: centred, it is laid.
    await expect(tray(page).locator('[data-field="w"]')).toBeVisible();
    await tray(page).locator('[data-field="w"]').fill('125');
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await expect(tray(page).locator('[data-another]')).toHaveText('再来一道');
  });
});

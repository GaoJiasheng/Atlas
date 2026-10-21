import { expect, test, type Page } from '@playwright/test';

type Info = { id: string; kind: string; done: boolean; revealed: boolean; tries: number; feedback: { code: string | null } | null };
type Shown = { fold: number; turn: number; iso: number; result: { closes: boolean; overlaps: number; missing: number } | null } | null;
type Engine = {
  task(): Info;
  tasks(): { step: string; index: number; id: string; practice: boolean }[];
  goToTask(step: string, index: number, options: { instant: boolean }): void;
  solve(): boolean;
  net(): Shown;
};
const engineInfo = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).task());
const shown = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).net());
const tray = (page: Page) => page.locator('[data-hud-panel="task"]');
const check = (page: Page) => tray(page).locator('[data-command="check"]').click();
const slider = (page: Page) => page.getByRole('slider', { name: 'Fold' });
async function open(page: Page, locale = 'en', chapter = 'cubes-and-hexominoes', beat?: number) {
  await page.goto(`/${locale}/topics/sample-lesson-net/?ch=${chapter}${beat ? `&b=${beat}` : ''}`);
  await page.waitForFunction(() => window.__atlas?.ready);
}
async function task(page: Page, step: string, index: number) {
  await page.evaluate(([s, i]) => (window.__atlas!.engine as unknown as Engine).goToTask(s, i, { instant: true }), [step, index] as const);
  await expect.poll(async () => (await engineInfo(page)).id).toBeTruthy();
  await expect(tray(page)).toBeVisible();
}

test.describe('nets engine fixture', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a beat folds with the FOLD slider by keyboard alone, turns, and goes back to its own fold on the next beat', async ({ page }) => {
    await open(page, 'en', 'cubes-and-hexominoes', 4);
    await expect.poll(async () => (await shown(page))?.fold).toBe(0.5);
    await slider(page).focus();
    await page.keyboard.press('End');
    await expect(slider(page)).toHaveAttribute('aria-valuetext', 'folded up');
    await expect.poll(async () => (await shown(page))?.fold).toBe(1);
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowLeft');
    await expect(slider(page)).toHaveValue('50');
    await expect(slider(page)).toHaveAttribute('aria-valuetext', 'folded half way');
    await page.keyboard.press('Home');
    await expect.poll(async () => (await shown(page))?.fold).toBe(0);
    await page.getByRole('button', { name: 'Turn a quarter to the right' }).click();
    await expect.poll(async () => (await shown(page))?.turn).toBe(2);
    await page.getByRole('button', { name: 'Turn a quarter to the left' }).click();
    await page.getByRole('button', { name: 'Turn a quarter to the left' }).click();
    await expect.poll(async () => (await shown(page))?.turn).toBe(0);
    // Another beat and back: the beat's own fold and turn again.
    await page.locator('.atlas-axis__tick[data-beat="cubes-and-hexominoes.2"]').click();
    await page.locator('.atlas-axis__tick[data-beat="cubes-and-hexominoes.3"]').click();
    await expect.poll(async () => (await shown(page))?.fold).toBe(0.5);
    await expect.poll(async () => (await shown(page))?.turn).toBe(1);
    await expect(slider(page)).toHaveValue('50');
    expect(new URL(page.url()).searchParams.has('fold')).toBe(false);
    await expect(page.locator('body')).not.toContainText(/\bP[1-6]\b|Primary [1-6]/);
  });

  test('complete a net: place, check folds it (two on one face), take away, place again, it closes and stays folded', async ({ page }) => {
    await open(page);
    await task(page, 'cubes-and-hexominoes', 1);
    await expect(slider(page)).toHaveCount(0);
    await page.locator('[data-cand="2,2"]').click();
    await expect(tray(page)).toContainText('Placed 1 / 1');
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).feedback?.code).toBe('overlap-unseen');
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 4000 }).toBe(1);
    await expect(page.locator('.ms-net__note')).toHaveCount(2);
    await expect(page.locator('.ms-net__notes')).toContainText('2 faces here');
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 6000 }).toBe(0);
    await page.locator('[data-cand="2,2"]').click();
    await expect(tray(page)).toContainText('Placed 0 / 1');
    await page.locator('[data-cand="1,0"]').focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('c');
    await expect.poll(async () => (await engineInfo(page)).done).toBe(true);
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 4000 }).toBe(1);
    await page.waitForTimeout(2600);
    expect((await shown(page))?.fold).toBe(1);
    expect((await shown(page))?.result?.closes).toBe(true);
  });

  test('"Show me" folds the answer up; Another one and Skip', async ({ page }) => {
    await open(page);
    await task(page, 'cubes-and-hexominoes', 3);
    for (let i = 0; i < 2; i++) {
      await page.locator('[data-cand="0"]').waitFor();
      await page.locator('[data-cand="1"]').click();
      await check(page);
      await expect.poll(async () => (await engineInfo(page)).tries).toBe(i + 1);
      await expect.poll(async () => (await shown(page))?.fold, { timeout: 6000 }).toBe(0);
      await page.locator('[data-cand="1"]').click();
    }
    await tray(page).locator('[data-show-me]').click();
    await expect.poll(async () => (await engineInfo(page)).revealed).toBe(true);
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 4000 }).toBe(1);
    const before = (await engineInfo(page)).id;
    await tray(page).locator('[data-another]').click();
    await expect.poll(async () => (await engineInfo(page)).id).not.toBe(before);
    await tray(page).locator('[data-skip]').click();
    await expect(tray(page)).toHaveCount(0);
  });

  test('tap a face by arrow keys and Enter; the fold opens after the second hint', async ({ page }) => {
    await open(page);
    await task(page, 'cubes-and-hexominoes', 4);
    await expect(slider(page)).toBeDisabled();
    await tray(page).locator('[data-command="hint"]').click();
    await expect(slider(page)).toBeDisabled();
    await tray(page).locator('[data-command="hint"]').click();
    await expect(slider(page)).toBeEnabled();
    await page.locator('.ms-net__tap[data-face="0"]').focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
    await expect(page.locator('.ms-net__tap[data-face="3"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('.ms-net__tap[data-face="3"]')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('c');
    await expect.poll(async () => (await engineInfo(page)).done).toBe(true);
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 4000 }).toBe(1);
  });

  test('a wrong tap is a neighbour; the fold opens after the first check', async ({ page }) => {
    await open(page);
    await task(page, 'cubes-and-hexominoes', 4);
    await page.locator('.ms-net__tap[data-face="2"]').click();
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).feedback?.code).toBe('adjacent-as-opposite');
    await expect(slider(page)).toBeEnabled();
  });

  test('the practice never opens the fold', async ({ page }) => {
    await open(page, 'en', 'practice');
    await expect(tray(page)).toBeVisible();
    await expect(slider(page)).toBeDisabled();
    await tray(page).getByRole('radio').first().click();
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).done).toBe(true);
    await expect(slider(page)).toBeDisabled();
  });

  test('every task solves through the browser controller', async ({ page }) => {
    await open(page);
    const tasks = await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).tasks());
    const pool = tasks.filter((t) => !t.practice);
    expect(pool).toHaveLength(17);
    for (const t of pool) {
      await task(page, t.step, t.index);
      await expect.poll(async () => (await engineInfo(page)).id).toBe(t.id);
      await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
      await check(page);
      await expect.poll(async () => (await engineInfo(page)).done, { message: t.id }).toBe(true);
    }
  });

  test('Chinese cinema phone: finger-sized places and buttons, the drawing on the stage', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => localStorage.setItem('atlas:theme', 'cinema'));
    await open(page, 'zh');
    await task(page, 'cubes-and-hexominoes', 1);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cinema');
    await expect(page.locator('.ms-tray-dock [data-hud-panel="task"]')).toBeVisible();
    await page.waitForTimeout(400);
    for (const c of await page.locator('.ms-net__cand .ms-net__hit').all()) {
      const box = (await c.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(43.5);
    }
    for (const b of await page.locator('.ms-net-tools button, [data-hud-panel="task"] button:visible').all()) {
      const box = (await b.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(43.5);
    }
    const net = (await page.locator('.ms-net').boundingBox())!;
    expect(net.width).toBeGreaterThanOrEqual(200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.locator('[data-cand="1,0"]').click();
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).done).toBe(true);
  });
});

import { expect, test, type Page } from '@playwright/test';

type Info = { id: string; phase: string; done: boolean; revealed: boolean; feedback: { code: string | null } | null };
type Engine = {
  task(): Info;
  tasks(): { step: string; index: number; id: string }[];
  goToTask(step: string, index: number, options: { instant: boolean }): void;
  solve(): boolean;
};
const engineInfo = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).task());
const tray = (page: Page) => page.locator('[data-hud-panel="task"]');
const check = (page: Page) => tray(page).locator('[data-command="check"]').click();
async function open(page: Page, locale = 'en', chapter = 'scales-and-balances') {
  await page.goto(`/${locale}/topics/sample-lesson-measure/?ch=${chapter}`);
  await page.waitForFunction(() => window.__atlas?.ready);
}
async function task(page: Page, step: string, index: number) {
  await page.evaluate(([s, i]) => (window.__atlas!.engine as unknown as Engine).goToTask(s, i, { instant: true }), [step, index] as const);
  await expect.poll(() => page.evaluate(() => window.__atlas!.state().chapter)).toBe(step);
  await expect(tray(page)).toBeVisible();
}

test.describe('measuring engine fixture', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

  test('chapter ticks unroll the same dial and keyboard rolls it back', async ({ page }) => {
    await open(page);
    await page.locator('.atlas-axis__tick[data-beat="scales-and-balances.1"]').click();
    await expect(page.locator('.ms-inst--dial .ms-inst__face')).toHaveCount(0);
    await expect(page.locator('.ms-inst--dial .ms-inst__axis')).toHaveCount(1);
    await page.keyboard.press('.');
    await expect(page.locator('.ms-inst--dial .ms-inst__face')).toHaveCount(1);
    await expect(page.locator('body')).not.toContainText(/\bP[1-6]\b|Primary [1-6]/);
  });

  test('reading tools are scratch; unit selection, diagnosis and reveal work', async ({ page }) => {
    await open(page);
    await task(page, 'scales-and-balances', 1);
    await tray(page).locator('[data-tool="zoom"]').click();
    await expect(page.locator('.ms-inst__mag')).toBeVisible();
    await tray(page).locator('[data-tool="count"]').click();
    await page.locator('.ms-inst__part').first().click();
    await expect(tray(page)).toContainText('Parts counted: 1');
    await expect(tray(page).locator('[data-command="check"]')).toBeDisabled();
    await tray(page).locator('[data-field="w"]').fill('280');
    await tray(page).getByRole('radio', { name: 'kg', exact: true }).click();
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).feedback?.code).toBe('wrong-unit');
    await check(page);
    await tray(page).locator('[data-show-me]').click();
    await expect.poll(async () => (await engineInfo(page)).revealed).toBe(true);
    await expect(tray(page).locator('.ms-tray__answer')).toContainText('280 g');
    await tray(page).locator('[data-another]').click();
    await expect.poll(async () => (await engineInfo(page)).id).not.toBe('sb-prawns');
    await tray(page).locator('[data-skip]').click();
    await expect(tray(page)).toHaveCount(0);
    await task(page, 'rulers-and-tapes', 2);
    await tray(page).locator('[data-tool="zoom"]').click();
    await expect(page.locator('.ms-inst__mag')).toBeVisible();
  });

  for (const mode of [
    { name: 'line', step: 'rulers-and-tapes', index: 4, keys: ['Shift+ArrowRight', 'Shift+ArrowRight', 'Shift+ArrowRight', 'Shift+ArrowRight', 'ArrowRight'], value: '45' },
    { name: 'arrow', step: 'rulers-and-tapes', index: 8, keys: ['Shift+ArrowRight', 'Shift+ArrowRight', 'Shift+ArrowRight', 'ArrowRight'], value: '35' },
    { name: 'load', step: 'scales-and-balances', index: 2, keys: ['Shift+ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight'], value: '160' },
    { name: 'fill', step: 'jugs-and-two-units', index: 2, keys: ['Shift+ArrowRight', 'Shift+ArrowRight', 'Shift+ArrowRight', 'ArrowRight'], value: '350' },
  ]) test(`set-scale ${mode.name} works entirely by keyboard`, async ({ page }) => {
    await open(page);
    await task(page, mode.step, mode.index);
    const slider = page.getByRole('slider');
    await slider.focus();
    await page.keyboard.press('End');
    await page.keyboard.press('Home');
    for (const key of mode.keys) await page.keyboard.press(key);
    await expect(slider).toHaveAttribute('aria-valuenow', mode.value);
    await page.keyboard.press('c');
    await expect.poll(async () => (await engineInfo(page)).done).toBe(true);
  });

  test('drag a line end; pour using the tray; add and remove balance weights', async ({ page }) => {
    await open(page);
    await task(page, 'rulers-and-tapes', 4);
    const start = await page.getByRole('slider').boundingBox();
    const marks = page.locator('.ms-inst__major');
    const zero = await marks.first().boundingBox();
    const end = await marks.last().boundingBox();
    expect(start && zero && end).toBeTruthy();
    await page.mouse.move(start!.x + start!.width / 2, start!.y + start!.height / 2);
    await page.mouse.down();
    await page.mouse.move(zero!.x + (end!.x - zero!.x) * 0.45, start!.y + start!.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '45');
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).done).toBe(true);
    await task(page, 'jugs-and-two-units', 2);
    for (let i = 0; i < 3; i++) await tray(page).locator('[data-nudge="M"]').click();
    await tray(page).locator('[data-nudge="1"]').click();
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).done).toBe(true);
    await task(page, 'scales-and-balances', 4);
    await tray(page).locator('[data-weight="50"]').click();
    await page.getByRole('button', { name: 'Take the 50 g weight off', exact: true }).click();
    for (const w of [500, 200, 100]) await tray(page).locator(`[data-weight="${w}"]`).click();
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).done).toBe(true);
  });

  test('count parts with roving keys, undo one, then write each part', async ({ page }) => {
    await open(page);
    await task(page, 'scales-and-balances', 3);
    const parts = page.locator('.ms-inst__part');
    await parts.first().focus();
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Enter');
      if (i < 4) await page.keyboard.press('ArrowRight');
    }
    await tray(page).getByRole('button', { name: 'Take back the last part' }).click();
    await expect(tray(page)).toContainText('Parts counted: 4');
    await tray(page).locator('[data-part-more]').click();
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).phase).toBe('input');
    await tray(page).locator('[data-field="w"]').fill('25');
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).feedback?.code).toBe('tick-counting');
    await tray(page).locator('[data-field="w"]').fill('20');
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).done).toBe(true);
  });

  test('compound boxes and straightened view retain the task and state', async ({ page }) => {
    await open(page);
    await task(page, 'jugs-and-two-units', 1);
    await page.getByRole('button', { name: /^Straightened scale/ }).click();
    await tray(page).locator('[data-field="b"]').fill('1');
    await tray(page).locator('[data-field="s"]').fill('25');
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).feedback?.code).toBe('compound-place');
    await tray(page).locator('[data-field="s"]').fill('250');
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).done).toBe(true);
    expect(new URL(page.url()).searchParams.has('answer')).toBe(false);
  });

  test('compare quantities using the same-unit scaffold', async ({ page }) => {
    await open(page);
    await task(page, 'jugs-and-two-units', 3);
    await tray(page).getByRole('button', { name: 'Change to the same unit' }).click();
    await expect(page.locator('.ms-equation')).toContainText('1000');
    const levels = await page.locator('.ms-inst__level').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
    expect(levels[0]).toBeGreaterThan(levels[1]!);
  });

  test('all fixture task phases solve through the browser controller', async ({ page }) => {
    await open(page);
    const tasks = await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).tasks());
    expect(tasks).toHaveLength(32);
    for (const t of tasks) {
      await task(page, t.step, t.index);
      await expect.poll(async () => (await engineInfo(page)).id).toBe(t.id);
      for (let phase = 0; phase < 3 && !(await engineInfo(page)).done; phase++) {
        await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
        await check(page);
      }
      expect((await engineInfo(page)).done, t.id).toBe(true);
    }
  });

  test('Chinese cinema phone: readable instruments, docked tray, finger-sized controls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => localStorage.setItem('atlas:theme', 'cinema'));
    await open(page, 'zh', 'jugs-and-two-units');
    await task(page, 'jugs-and-two-units', 1);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cinema');
    await expect(page.locator('.ms-tray-dock [data-hud-panel="task"]')).toBeVisible();
    await expect(tray(page).locator('[data-another]')).toHaveText('再来一道');
    // Allow the tray's ResizeObserver and the instrument's layout to settle.
    await page.waitForTimeout(400);
    for (const b of await tray(page).locator('button:visible, input:visible').all()) {
      const box = (await b.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(43.5);
    }
    const jug = (await page.locator('.ms-inst__vessel').first().boundingBox())!;
    expect(jug.height).toBeGreaterThanOrEqual(199.5);
    await page.screenshot({ path: 'shots/sample-lesson-measure/zh-cinema/task-phone-compound.png' });
    await tray(page).locator('[data-field="b"]').fill('1');
    await tray(page).locator('[data-field="s"]').fill('250');
    await check(page);
    await expect.poll(async () => (await engineInfo(page)).done).toBe(true);
    await task(page, 'scales-and-balances', 1);
    await page.waitForTimeout(400);
    expect((await page.locator('.ms-inst__dial').boundingBox())!.width).toBeGreaterThanOrEqual(179.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

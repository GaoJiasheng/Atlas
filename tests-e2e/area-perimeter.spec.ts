/**
 * MathScene e2e on the square grid (docs/21 §3, §7): a beat from the chapter
 * axis (the grid, the walk, the number sentence, the AREA card); checks
 * answered by pointer (lay rows of squares, write the area) and by keyboard
 * only (trace the perimeter with the side cursor, write it); a measure with
 * its unit chips (cm written for an area → its diagnosis); a rectangle drawn
 * with the corner handle; a cut; the practice to its summary; zh; and the
 * phone (390×844: the tray docked on the stage, finger-sized controls, no
 * sideways scroll, a count done with the row stepper). No school level is
 * shown anywhere.
 */
import { expect, test, type Page } from '@playwright/test';

type TaskInfo = { step: string; beat: number; slot: string; id: string | null; kind: string | null; phase: string; done: boolean; tries: number; feedback: { tone: string; code: string | null } | null };
type Engine = {
  task(): TaskInfo;
  goToTask(step: string, i: number, o?: { instant?: boolean }): void;
  solve(): boolean;
  practice(): { score: number; summary: boolean; results: { id: string; ok: boolean | null; code: string | null }[] };
};

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const info = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).task());
const force = (page: Page, step: string, i: number) => page.evaluate(([s, k]) => (window.__atlas!.engine as unknown as Engine).goToTask(s as string, k as number, { instant: true }), [step, i] as const);
const state = (page: Page) => page.evaluate(() => window.__atlas!.state() as unknown as { chapter: string; beat: number });
const tray = (page: Page) => page.locator('[data-hud-panel="task"]');

test.describe('area and perimeter (MathScene grid)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a beat tick walks the perimeter: the path, the count, the sentence and the card', async ({ page }) => {
    await open(page, '/en/topics/area-perimeter/?ch=what-is-perimeter');
    await expect(page.locator('.atlas-axis__tick[data-beat^="what-is-perimeter."]')).toHaveCount(5);
    await expect(page.locator('.atlas-axis__tick[data-beat="what-is-perimeter.4"]')).toHaveAttribute('data-shape', 'square');
    await page.locator('.atlas-axis__tick[data-beat="what-is-perimeter.1"]').click();
    await expect.poll(async () => (await state(page)).beat).toBe(1);
    await expect(page.locator('.ms-svg .ms-grid__walk-path')).toHaveCount(1);
    await expect(page.locator('.ms-svg .ms-grid__walk-no')).toHaveCount(14);
    await expect(page.locator('.ms-equation')).toHaveText('14 cm');
    await expect(page.locator('.ms-beatline')).toContainText('The perimeter is 14 cm');
    await expect(page.locator('.ms-areacard')).toContainText('14 cm');
    // Beat 4: squares inside and the walk round, two measures, two units.
    await page.keyboard.press('.');
    await page.keyboard.press('.');
    await expect.poll(async () => (await state(page)).beat).toBe(3);
    await expect(page.locator('.ms-svg .ms-grid__tile')).toHaveCount(12);
    await expect(page.locator('.ms-equation')).toContainText('12 cm²');
    // No school level anywhere on the page.
    await expect(page.locator('body')).not.toContainText(/\bP[1-6]\b|Primary [1-6]|Bridge/);
  });

  test('a check by pointer: lay the rows of squares, then write the area', async ({ page }) => {
    await open(page, '/en/topics/area-perimeter/?ch=what-is-area');
    await force(page, 'what-is-area', 1);
    await expect.poll(async () => (await info(page)).id).toBe('wa-cover-rug');
    await expect(tray(page).locator('[data-command="check"]')).toBeDisabled();
    for (const row of await page.locator('.ms-svg .ms-grid__rowbtn').all()) await row.click();
    await expect(page.locator('.ms-svg .ms-grid__tile')).toHaveCount(15);
    // One square lifted, then laid again by tapping its cell.
    await page.locator('.ms-svg [data-cell="0,0"]').click();
    await expect(page.locator('.ms-svg .ms-grid__tile')).toHaveCount(14);
    await page.locator('.ms-svg [data-cell="0,0"]').click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).phase).toBe('input');
    await tray(page).locator('.ms-key', { hasText: /^1$/ }).click();
    await tray(page).locator('.ms-key', { hasText: /^5$/ }).click();
    await expect(tray(page).locator('input[data-field="w"]')).toHaveValue('15');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await expect(page.locator('.ms-equation')).toHaveText('5 × 3 = 15 square units');
  });

  test('a check with the keyboard only: the side cursor traces the perimeter, then the number', async ({ page }) => {
    await open(page, '/en/topics/area-perimeter/?ch=what-is-perimeter');
    await force(page, 'what-is-perimeter', 1);
    await expect.poll(async () => (await info(page)).id).toBe('wp-trace-card');
    const cursor = page.locator('.ms-svg .ms-grid__cursor');
    await cursor.focus();
    // 5 × 3: along the top, down, back along the bottom, up — Enter traces the side just moved along.
    const walk: [string, number][] = [['ArrowRight', 5], ['ArrowDown', 3], ['ArrowLeft', 5], ['ArrowUp', 3]];
    await page.keyboard.press('Enter');
    let first = true;
    for (const [key, n] of walk) {
      for (let i = first ? 1 : 0; i < n; i++) {
        await page.keyboard.press(key);
        await page.keyboard.press('Enter');
      }
      first = false;
    }
    await expect(page.locator('.ms-svg .ms-grid__traced')).toHaveCount(16);
    // The arrow keys stayed on the grid: still the same chapter.
    expect((await state(page)).chapter).toBe('what-is-perimeter');
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).phase).toBe('input');
    await tray(page).locator('input[data-field="w"]').focus();
    await page.keyboard.type('12');
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('border-squares');
    await tray(page).locator('input[data-field="w"]').fill('16');
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('a measure: the right number with a length unit is diagnosed; the unit chips are a radio group', async ({ page }) => {
    await open(page, '/en/topics/area-perimeter/?ch=square-units');
    await force(page, 'square-units', 1);
    await expect.poll(async () => (await info(page)).id).toBe('su-card-area');
    await tray(page).locator('input[data-field="w"]').fill('12');
    await tray(page).getByRole('radio', { name: 'cm', exact: true }).click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('unit-not-squared');
    await expect(tray(page).locator('.ms-tray__feedback')).toContainText('cm is a unit of length');
    await tray(page).getByRole('radio', { name: 'cm²' }).click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('draw a rectangle with the corner handle (keys), and cut an L shape into two rectangles (taps)', async ({ page }) => {
    await open(page, '/en/topics/area-perimeter/?ch=rectangle-area');
    await force(page, 'rectangle-area', 1);
    await expect.poll(async () => (await info(page)).id).toBe('ra-draw-eighteen');
    const handle = page.locator('.ms-svg .ms-grid__handle');
    await handle.focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
    for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowUp');
    await expect(handle).toHaveAttribute('aria-valuetext', '6 cm by 3 cm');
    // The card shows the drawn sides, never the area before the check.
    await expect(page.locator('.ms-areacard')).not.toContainText('18');
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);

    await force(page, 'composite-area', 1);
    await expect.poll(async () => (await info(page)).id).toBe('ca-cut-the-flat');
    await tray(page).getByRole('button', { name: 'Move the cut up' }).click();
    await tray(page).getByRole('button', { name: 'Move the cut up' }).click();
    await tray(page).getByRole('button', { name: 'Move the cut up' }).click();
    await tray(page).getByRole('button', { name: 'Move the cut up' }).click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).phase).toBe('input');
    // Cut across at 4: 9 × 4 and 5 × 3.
    for (const [f, v] of [['w0', '36'], ['w1', '15'], ['w2', '51']] as const) await tray(page).locator(`input[data-field="${f}"]`).fill(v);
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('practice: one check per question, a diagnosis, then the summary', async ({ page }) => {
    await open(page, '/en/topics/area-perimeter/?ch=practice&b=3');
    expect((await info(page)).id).toBe('q3-rectangle-area');
    await tray(page).locator('input[data-field="w"]').fill('11');
    await tray(page).getByRole('radio', { name: 'cm²' }).click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('sides-added-for-area');
    expect((await info(page)).done).toBe(true);
    await expect(tray(page).getByRole('button', { name: 'See step 06' })).toBeVisible();
    for (const i of [1, 2, 4, 5, 6, 7, 8]) {
      await force(page, 'practice', i);
      for (let k = 0; k < 3 && !(await info(page)).done; k++) {
        await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
        await page.waitForTimeout(100);
        await tray(page).locator('[data-command="check"]').click();
      }
    }
    await tray(page).locator('.ms-tray__next').click();
    await expect(page.locator('.ms-summary')).toContainText('You got 7 of 8.');
  });

  test('zh: the beat line, the card and the check speak Chinese', async ({ page }) => {
    await open(page, '/zh/topics/area-perimeter/?ch=rectangle-area&b=2');
    await expect(page.locator('.ms-beatline')).toContainText('3 行、每行 4 个');
    await expect(page.locator('.ms-areacard')).toContainText('面积');
    await expect(page.locator('.ms-equation')).toHaveText('3 × 4 = 12 cm²');
    await page.locator('.atlas-axis__tick[data-beat="rectangle-area.5"]').click();
    await expect(tray(page)).toBeVisible();
    await expect(tray(page).locator('[data-another]')).toHaveText('再来一道');
    await page.goto('/zh/topics/area-perimeter/?ch=missing-side');
    await page.waitForFunction(() => window.__atlas !== undefined);
    await expect(page.locator('.ms-further')).toHaveText('再往前一步');
  });

  test('phone 390x844: the check docks on the stage, the row stepper lays the squares, targets are finger-sized', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/area-perimeter/?ch=what-is-area');
    await force(page, 'what-is-area', 1);
    await expect.poll(async () => (await info(page)).id).toBe('wa-cover-rug');
    await expect(page.locator('.ms-tray-dock [data-hud-panel="task"]')).toBeVisible();
    const more = tray(page).getByRole('button', { name: 'Lay the next row' });
    for (const b of [more, tray(page).getByRole('button', { name: 'Lift the last row' })]) {
      const box = (await b.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(43.5);
    }
    for (let i = 0; i < 3; i++) await more.click();
    await expect(page.locator('.ms-svg .ms-grid__tile')).toHaveCount(15);
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).phase).toBe('input');
    for (const key of await page.locator('.ms-keypad .ms-key').all()) {
      const b = (await key.boundingBox())!;
      expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(43.5);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

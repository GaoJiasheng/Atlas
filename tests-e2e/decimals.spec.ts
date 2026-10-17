/**
 * MathScene e2e on decimals (docs/29 §3, §8): a beat from the chapter axis
 * (the hundred grid, the number sentence, the beat line); checks answered by
 * pointer (shade a hundred grid with the steppers: a misplaced 0 diagnosed,
 * then right; round on the line: the nearer end, then the rounded number;
 * line two numbers up on the point, then write the sum) and by keyboard only
 * (zoom twice into the number line and place a thousandth); the practice to
 * its summary with the remainder written after the point diagnosed; zh; and
 * the phone (390×844: the tray docked on the stage, finger-sized controls,
 * no sideways scroll). No school level is shown anywhere.
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
const check = (page: Page) => tray(page).locator('[data-command="check"]').click();

test.describe('decimals (MathScene decimals)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a beat tick shows hundredths: the grid, the sentence and the beat line', async ({ page }) => {
    await open(page, '/en/topics/decimals/?ch=hundredths');
    await expect(page.locator('.atlas-axis__tick[data-beat^="hundredths."]')).toHaveCount(5);
    await expect(page.locator('.atlas-axis__tick[data-beat="hundredths.4"]')).toHaveAttribute('data-shape', 'square');
    await page.locator('.atlas-axis__tick[data-beat="hundredths.3"]').click();
    await expect.poll(async () => (await state(page)).beat).toBe(3);
    await expect(page.locator('.ms-equation')).toHaveText('0.07 ≠ 0.7');
    await expect(page.locator('.ms-beatline')).toContainText('Write 0.07');
    // Back one beat with the key: 3 tenths and 5 hundredths.
    await page.keyboard.press(',');
    await expect.poll(async () => (await state(page)).beat).toBe(2);
    await expect(page.locator('.ms-beatline')).toContainText('zero point three five');
    // No school level anywhere on the page.
    await expect(page.locator('body')).not.toContainText(/\bP[1-6]\b|Primary [1-6]|Bridge/);
  });

  test('a check by pointer: shade 0.08, with 8 strips diagnosed as a missing 0 first', async ({ page }) => {
    await open(page, '/en/topics/decimals/?ch=hundredths');
    await force(page, 'hundredths', 1);
    await expect.poll(async () => (await info(page)).id).toBe('hu-shade-008');
    const tenth = tray(page).getByRole('button', { name: '0.1 more' });
    for (let i = 0; i < 8; i++) await tenth.click();
    await expect(tray(page).getByText('Shaded 0.8')).toBeVisible();
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('zero-placeholder');
    await tray(page).getByRole('button', { name: 'Start again' }).click();
    const hundredth = tray(page).getByRole('button', { name: '0.01 more' });
    for (let i = 0; i < 8; i++) await hundredth.click();
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('round on the line: the nearer end, then the rounded number with its place', async ({ page }) => {
    await open(page, '/en/topics/decimals/?ch=rounding');
    await force(page, 'rounding', 1);
    await expect.poll(async () => (await info(page)).id).toBe('ro-746-to-1dp');
    // The lower end first: dropping the 6 is diagnosed.
    await tray(page).locator('[data-end="lo"]').click();
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('round-truncated');
    await tray(page).locator('[data-end="hi"]').click();
    await check(page);
    await expect.poll(async () => (await info(page)).phase).toBe('input');
    await tray(page).locator('input.ms-box--decimal').fill('7.5');
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('line up on the point, then write the sum', async ({ page }) => {
    await open(page, '/en/topics/decimals/?ch=adding-decimals');
    await force(page, 'adding-decimals', 1);
    await expect.poll(async () => (await info(page)).id).toBe('ad-align-56-275');
    // Checked as it starts, lined up on the last digit.
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('aligned-right');
    // The longer number sits one place too far left: move it right until the points line up.
    await tray(page).getByRole('button', { name: 'Move the row right' }).click();
    await check(page);
    await expect.poll(async () => (await info(page)).phase).toBe('input');
    await tray(page).locator('input.ms-box--decimal').fill('8.35');
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('a check with the keyboard only: zoom in twice and place 0.418', async ({ page }) => {
    await open(page, '/en/topics/decimals/?ch=thousandths');
    await force(page, 'thousandths', 1);
    await expect.poll(async () => (await info(page)).id).toBe('th-place-0418');
    const press = async (name: string, times = 1) => {
      const b = tray(page).getByRole('button', { name, exact: true });
      for (let i = 0; i < times; i++) {
        await b.focus();
        await page.keyboard.press('Enter');
      }
    };
    // Tick 4 of the line (0.4), zoom into 0.4–0.5; tick 1 there (0.41), zoom into 0.41–0.42; tick 8 is 0.418.
    await press('One jump on', 5);
    await press('Zoom in here');
    await press('One jump on', 2);
    await press('Zoom in here');
    await press('One jump on', 9);
    await expect(tray(page).getByText('At 0.418')).toBeVisible();
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('practice: one check per question, a remainder after the point diagnosed, then the summary', async ({ page }) => {
    await open(page, '/en/topics/decimals/?ch=practice');
    for (const i of [1, 2, 3, 4, 5, 6, 7]) {
      await force(page, 'practice', i);
      for (let k = 0; k < 3 && !(await info(page)).done; k++) {
        await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
        await page.waitForTimeout(100);
        await check(page);
      }
    }
    await force(page, 'practice', 8);
    await expect.poll(async () => (await info(page)).id).toBe('q8-share-9-dollars');
    await tray(page).locator('input.ms-box--decimal').fill('2.10');
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('remainder-as-decimal');
    expect((await info(page)).done).toBe(true);
    await expect(tray(page).getByRole('button', { name: 'See step 13' })).toBeVisible();
    await tray(page).locator('.ms-tray__next').click();
    await expect(page.locator('.ms-summary')).toContainText('You got 7 of 8.');
  });

  test('zh: the beat line, the sentence and the check speak Chinese', async ({ page }) => {
    await open(page, '/zh/topics/decimals/?ch=rounding&b=3');
    await expect(page.locator('.ms-beatline')).toContainText('写 3.0，不是 2.10');
    await expect(page.locator('.ms-equation')).toHaveText('2.96 ≈ 3.0');
    await page.locator('.atlas-axis__tick[data-beat="rounding.5"]').click();
    await expect(tray(page)).toBeVisible();
    await expect(tray(page).locator('[data-another]')).toHaveText('再来一道');
    await page.goto('/zh/topics/decimals/?ch=times-ten');
    await page.waitForFunction(() => window.__atlas !== undefined);
    await expect(page.locator('.ms-further')).toHaveText('再往前一步');
  });

  test('phone 390x844: the check docks on the stage, the steppers and the keys are finger-sized', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/decimals/?ch=hundredths');
    await force(page, 'hundredths', 1);
    await expect.poll(async () => (await info(page)).id).toBe('hu-shade-008');
    await expect(page.locator('.ms-tray-dock [data-hud-panel="task"]')).toBeVisible();
    const more = tray(page).getByRole('button', { name: '0.01 more' });
    const box = (await more.boundingBox())!;
    expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(43.5);
    for (let i = 0; i < 8; i++) await more.click();
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await force(page, 'tenths', 1);
    await force(page, 'hundredths', 2);
    await expect.poll(async () => (await info(page)).id).toBe('hu-write-4-hundredths');
    for (const key of await page.locator('.ms-keypad .ms-key').all()) {
      const b = (await key.boundingBox())!;
      expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(43.5);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

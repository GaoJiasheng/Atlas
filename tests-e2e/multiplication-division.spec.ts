/**
 * MathScene e2e on whole numbers (docs/19 §3, §8): a beat from the chapter
 * axis (equal groups, the number sentence, the PRODUCT card); checks answered
 * by pointer (deal into equal groups, make an array with the steppers) and by
 * keyboard only (share place-value blocks: share, trade, share, then write the
 * quotient); a remainder too big diagnosed; the practice to its summary with
 * the minivan story's diagnosis; zh; and the phone (390×844: the tray docked
 * on the stage, finger-sized controls, no sideways scroll). No school level is
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

test.describe('multiplication and division (MathScene whole numbers)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a beat tick shows equal groups: the plates, the sentence and the beat line', async ({ page }) => {
    await open(page, '/en/topics/multiplication-division/?ch=equal-groups');
    await expect(page.locator('.atlas-axis__tick[data-beat^="equal-groups."]')).toHaveCount(5);
    await expect(page.locator('.atlas-axis__tick[data-beat="equal-groups.4"]')).toHaveAttribute('data-shape', 'square');
    await page.locator('.atlas-axis__tick[data-beat="equal-groups.3"]').click();
    await expect.poll(async () => (await state(page)).beat).toBe(3);
    await expect(page.locator('.ms-svg .ms-thing')).toHaveCount(12);
    await expect(page.locator('.ms-svg .ms-container')).toHaveCount(4);
    await expect(page.locator('.ms-equation')).toHaveText('4 × 3 = 12');
    await expect(page.locator('.ms-beatline')).toContainText('4 groups of 3 is 4 × 3');
    // Back one beat with the key: the unequal plates.
    await page.keyboard.press(',');
    await expect.poll(async () => (await state(page)).beat).toBe(2);
    await expect(page.locator('.ms-equation')).toHaveText('2 + 5 + 5 = 12');
    // No school level anywhere on the page.
    await expect(page.locator('body')).not.toContainText(/\bP[1-6]\b|Primary [1-6]|Bridge/);
  });

  test('a check by pointer: deal the oranges round by round onto 4 plates', async ({ page }) => {
    await open(page, '/en/topics/multiplication-division/?ch=equal-groups');
    await force(page, 'equal-groups', 1);
    await expect.poll(async () => (await info(page)).id).toBe('eg-plates-4-of-3');
    await expect(tray(page).locator('[data-command="check"]')).toBeDisabled();
    const deal = tray(page).getByRole('button', { name: 'Deal one round' });
    for (let i = 0; i < 3; i++) await deal.click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await expect(tray(page).locator('.ms-tray__feedback')).toContainText('4 groups of 3');
  });

  test('an array made with the steppers: 3 rows of 5', async ({ page }) => {
    await open(page, '/en/topics/multiplication-division/?ch=arrays');
    await force(page, 'arrays', 1);
    await expect.poll(async () => (await info(page)).id).toBe('ar-make-3-rows-of-5');
    const rows = tray(page).getByRole('button', { name: 'One row more' });
    const cols = tray(page).getByRole('button', { name: 'One more in each row' });
    // From 0 × 0 each step adds a row or a column: 5 rows, then 3 in each.
    for (let i = 0; i < 5; i++) await rows.click();
    for (let i = 0; i < 3; i++) await cols.click();
    // 5 rows of 3: the swapped array is diagnosed.
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('groups-size-swapped');
    for (let i = 0; i < 2; i++) await tray(page).getByRole('button', { name: 'One row fewer' }).click();
    for (let i = 0; i < 2; i++) await cols.click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('a check with the keyboard only: share 85 into 5, trading the tens left over', async ({ page }) => {
    await open(page, '/en/topics/multiplication-division/?ch=dividing-in-columns');
    await force(page, 'dividing-in-columns', 1);
    await expect.poll(async () => (await info(page)).id).toBe('dc-share-85-by-5');
    const press = async (name: string) => {
      await tray(page).getByRole('button', { name }).focus();
      await page.keyboard.press('Enter');
    };
    await press('Share the tens');
    // Checked with tens still on the mat: not traded.
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('not-traded');
    // 8 tens shared into 5 leave 3 tens: one trade turns all of them into 30 ones.
    await press('Trade 3 tens for 30 ones');
    await press('Share the ones');
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).phase).toBe('input');
    await tray(page).locator('input[data-field="w"]').focus();
    await page.keyboard.type('17');
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await info(page)).done).toBe(true);
    expect((await state(page)).chapter).toBe('dividing-in-columns');
  });

  test('a remainder bigger than the divisor is diagnosed, then the quotient and remainder are written', async ({ page }) => {
    await open(page, '/en/topics/multiplication-division/?ch=remainders');
    await force(page, 'remainders', 1);
    await expect.poll(async () => (await info(page)).id).toBe('rm-23-in-fives');
    await tray(page).locator('input[data-field="q"]').fill('3');
    await tray(page).locator('input[data-field="r"]').fill('8');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('remainder-too-big');
    await expect(tray(page).locator('.ms-tray__feedback')).toContainText('another bag of 5');
    await tray(page).locator('input[data-field="q"]').fill('4');
    await tray(page).locator('input[data-field="r"]').fill('3');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('practice: one check per question, the minivan story diagnosed, then the summary', async ({ page }) => {
    await open(page, '/en/topics/multiplication-division/?ch=practice&b=6');
    expect((await info(page)).id).toBe('q6-minivans');
    await tray(page).locator('input[data-field="w"]').fill('6');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('remainder-context');
    expect((await info(page)).done).toBe(true);
    await expect(tray(page).getByRole('button', { name: 'See step 08' })).toBeVisible();
    for (const i of [1, 2, 3, 4, 5, 7, 8]) {
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

  test('zh: the beat line, the sentence and the check speak Chinese', async ({ page }) => {
    await open(page, '/zh/topics/multiplication-division/?ch=remainders&b=2');
    await expect(page.locator('.ms-beatline')).toContainText('装满 3 盒，还剩 2 个');
    await expect(page.locator('.ms-equation')).toHaveText('14 ÷ 4 = 3 r 2');
    await page.locator('.atlas-axis__tick[data-beat="remainders.5"]').click();
    await expect(tray(page)).toBeVisible();
    await expect(tray(page).locator('[data-another]')).toHaveText('再来一道');
    await page.goto('/zh/topics/multiplication-division/?ch=two-digit-by-two-digit');
    await page.waitForFunction(() => window.__atlas !== undefined);
    await expect(page.locator('.ms-further')).toHaveText('再往前一步');
  });

  test('phone 390x844: the check docks on the stage, the deal button and the keys are finger-sized', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/multiplication-division/?ch=sharing-and-grouping');
    await force(page, 'sharing-and-grouping', 1);
    await expect.poll(async () => (await info(page)).id).toBe('sg-share-15-kueh');
    await expect(page.locator('.ms-tray-dock [data-hud-panel="task"]')).toBeVisible();
    const deal = tray(page).getByRole('button', { name: 'Deal one round' });
    const box = (await deal.boundingBox())!;
    expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(43.5);
    for (let i = 0; i < 5; i++) await deal.click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).phase).toBe('input');
    for (const key of await page.locator('.ms-keypad .ms-key').all()) {
      const b = (await key.boundingBox())!;
      expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(43.5);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

/**
 * MathScene e2e on measuring (docs/32 §7–§8): a beat from the chapter axis (the
 * magnifier on the tape, the number sentence, the beat line, back a beat with the
 * key); checks answered by pointer (read a dial with the reading tools, a unit
 * diagnosed, then right; put weights on a balance until it is level; tap the small
 * parts, the marks counted diagnosed, then the part written; two boxes for a
 * compound reading, the small part written short diagnosed) and by keyboard only
 * (pour a measuring cup to a mark); the practice to its summary with the two
 * numbers written side by side diagnosed; zh with the step that goes further; and
 * the phone (390×844: the tray docked on the stage, finger-sized controls, no
 * sideways scroll). No school level is shown anywhere.
 */
import { expect, test, type Page } from '@playwright/test';

type TaskInfo = { step: string; beat: number; id: string | null; kind: string | null; phase: string; done: boolean; feedback: { tone: string; code: string | null } | null };
type Engine = {
  task(): TaskInfo;
  goToTask(step: string, i: number, o?: { instant?: boolean }): void;
  solve(): boolean;
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

test.describe('measuring (MathScene instruments)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a beat tick shows what each small part stands for: the magnifier, the sentence and the beat line', async ({ page }) => {
    await open(page, '/en/topics/measuring/?ch=reading-scales');
    await expect(page.locator('.atlas-axis__tick[data-beat^="reading-scales."]')).toHaveCount(6);
    await expect(page.locator('.atlas-axis__tick[data-beat="reading-scales.6"]')).toHaveAttribute('data-shape', 'square');
    await page.locator('.atlas-axis__tick[data-beat="reading-scales.2"]').click();
    await expect.poll(async () => (await state(page)).beat).toBe(2);
    await expect(page.locator('.ms-inst__mag')).toBeVisible();
    await expect(page.locator('.ms-equation')).toHaveText('40 − 30 = 10 · 10 ÷ 2 = 5');
    await expect(page.locator('.ms-beatline')).toContainText('each small part stands for 5 cm');
    await page.keyboard.press(',');
    await expect.poll(async () => (await state(page)).beat).toBe(1);
    await expect(page.locator('.ms-beatline')).toContainText('Not every mark on this measuring tape has a number');
    await expect(page.locator('body')).not.toContainText(/\bP[1-6]\b|Primary [1-6]|Bridge/);
  });

  test('read a dial with the reading tools: kilograms diagnosed, then grams', async ({ page }) => {
    await open(page, '/en/topics/measuring/?ch=weighing-scales');
    await force(page, 'weighing-scales', 1);
    await expect.poll(async () => (await info(page)).id).toBe('ws-fish-450');
    await tray(page).locator('[data-tool="zoom"]').click();
    await expect(page.locator('.ms-inst__mag')).toBeVisible();
    await tray(page).locator('[data-field="w"]').fill('450');
    await tray(page).getByRole('radio', { name: 'kg', exact: true }).click();
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('wrong-unit');
    await expect(tray(page)).toContainText('heavier than five grown-ups');
    await tray(page).getByRole('radio', { name: 'g', exact: true }).click();
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('put weights on the balance until it is level', async ({ page }) => {
    await open(page, '/en/topics/measuring/?ch=mass-and-balances');
    await force(page, 'mass-and-balances', 1);
    await expect.poll(async () => (await info(page)).id).toBe('mb-weights-papaya');
    await tray(page).locator('[data-weight="500"]').click();
    await tray(page).locator('[data-weight="500"]').click();
    await page.getByRole('button', { name: 'Take the 500 g weight off', exact: true }).first().click();
    for (const w of [200, 100]) await tray(page).locator(`[data-weight="${w}"]`).click();
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('tap the small parts, then write what each stands for: the marks counted diagnosed first', async ({ page }) => {
    await open(page, '/en/topics/measuring/?ch=weighing-scales');
    await force(page, 'weighing-scales', 2);
    await expect.poll(async () => (await info(page)).id).toBe('ws-count-20');
    const parts = page.locator('.ms-inst__part');
    await parts.first().focus();
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Enter');
      if (i < 4) await page.keyboard.press('ArrowRight');
    }
    await expect(tray(page)).toContainText('Parts counted: 5');
    await check(page);
    await expect.poll(async () => (await info(page)).phase).toBe('input');
    await tray(page).locator('[data-field="w"]').fill('25');
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('tick-counting');
    await tray(page).locator('[data-field="w"]').fill('20');
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('two boxes for a compound reading: the grams written short diagnosed', async ({ page }) => {
    await open(page, '/en/topics/measuring/?ch=compound-units');
    await force(page, 'compound-units', 1);
    await expect.poll(async () => (await info(page)).id).toBe('cp-rice-1-600');
    await tray(page).locator('[data-field="b"]').fill('1');
    await tray(page).locator('[data-field="s"]').fill('60');
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('compound-place');
    await tray(page).locator('[data-field="s"]').fill('600');
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
    expect(new URL(page.url()).searchParams.has('answer')).toBe(false);
  });

  test('a check with the keyboard only: pour the measuring cup to 350 ml', async ({ page }) => {
    await open(page, '/en/topics/measuring/?ch=millilitres');
    await force(page, 'millilitres', 8);
    await expect.poll(async () => (await info(page)).id).toBe('ml-fill-juice-350');
    const slider = page.getByRole('slider');
    await slider.focus();
    await page.keyboard.press('Home');
    for (const key of ['Shift+ArrowRight', 'Shift+ArrowRight', 'Shift+ArrowRight', 'ArrowRight']) await page.keyboard.press(key);
    await expect(slider).toHaveAttribute('aria-valuenow', '350');
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('practice: one check per question, the two numbers written side by side diagnosed, then the summary', async ({ page }) => {
    await open(page, '/en/topics/measuring/?ch=practice');
    for (const i of [1, 2, 3, 4, 5, 6, 7]) {
      await force(page, 'practice', i);
      for (let k = 0; k < 3 && !(await info(page)).done; k++) {
        await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
        await page.waitForTimeout(100);
        await check(page);
      }
    }
    await force(page, 'practice', 8);
    await expect.poll(async () => (await info(page)).id).toBe('q8-rice-3040');
    await tray(page).locator('[data-field="w"]').fill('340');
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('compound-concatenated');
    expect((await info(page)).done).toBe(true);
    await expect(tray(page).getByRole('button', { name: 'See step 12' })).toBeVisible();
    await tray(page).locator('.ms-tray__next').click();
    await expect(page.locator('.ms-summary')).toContainText('You got 7 of 8.');
  });

  test('zh: the beat line, the sentence and the check speak Chinese; the last step goes further', async ({ page }) => {
    await open(page, '/zh/topics/measuring/?ch=weighing-scales&b=4');
    await expect(page.locator('.ms-beatline')).toContainText('二十二十地数');
    await expect(page.locator('.ms-equation')).toContainText('200 + 4 × 20 = 280');
    await page.locator('.atlas-axis__tick[data-beat="weighing-scales.6"]').click();
    await expect(tray(page)).toBeVisible();
    await expect(tray(page).locator('[data-another]')).toHaveText('再来一道');
    await page.goto('/zh/topics/measuring/?ch=scales-in-decimals');
    await page.waitForFunction(() => window.__atlas !== undefined);
    await expect(page.locator('.ms-further')).toHaveText('再往前一步');
  });

  test('phone 390x844: the check docks on the stage, the controls are finger-sized, no sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/measuring/?ch=millilitres');
    await force(page, 'millilitres', 1);
    await expect.poll(async () => (await info(page)).id).toBe('ml-cup-180');
    await expect(page.locator('.ms-tray-dock [data-hud-panel="task"]')).toBeVisible();
    await page.waitForTimeout(400);
    for (const b of await tray(page).locator('button:visible, input:visible').all()) {
      const box = (await b.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(43.5);
    }
    const cup = (await page.locator('.ms-inst__vessel').first().boundingBox())!;
    expect(cup.height).toBeGreaterThanOrEqual(199.5);
    await tray(page).locator('[data-field="w"]').fill('180');
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

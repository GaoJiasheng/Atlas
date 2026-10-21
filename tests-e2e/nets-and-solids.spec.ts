/**
 * MathScene e2e on nets and solids (docs/39 §7 P, §8): a beat from the chapter axis
 * (a shape that does not fold, its two faces on one face named on the stage); the
 * FOLD slider by keyboard and the two turn buttons, put back by the next beat;
 * completing a net (a place that overlaps folded and diagnosed, then a place that
 * closes and stays folded); "Show me", Another one and Skip; tapping the opposite
 * face (a neighbour diagnosed, the fold opened after the first check) and the
 * bottom of a box by keyboard alone; a choice of nets with the one that is not a
 * cross left out diagnosed; the practice to its summary with the fold locked; every
 * check solved through the browser; zh, cinema and the phone (finger-sized places,
 * no sideways scroll). No school level is shown anywhere.
 */
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
const info = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).task());
const shown = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).net());
const state = (page: Page) => page.evaluate(() => window.__atlas!.state() as unknown as { chapter: string; beat: number });
const tray = (page: Page) => page.locator('[data-hud-panel="task"]');
const check = (page: Page) => tray(page).locator('[data-command="check"]').click();
const slider = (page: Page, name = 'Fold') => page.getByRole('slider', { name });
async function open(page: Page, locale = 'en', chapter = 'many-nets', beat?: number) {
  await page.goto(`/${locale}/topics/nets-and-solids/?ch=${chapter}${beat ? `&b=${beat}` : ''}`);
  await page.waitForFunction(() => window.__atlas?.ready, null, { timeout: 30_000 });
}
async function task(page: Page, step: string, index: number, id: string) {
  await page.evaluate(([s, i]) => (window.__atlas!.engine as unknown as Engine).goToTask(s, i, { instant: true }), [step, index] as const);
  await expect.poll(async () => (await info(page)).id).toBe(id);
  await expect(tray(page)).toBeVisible();
}

test.describe('nets and solids', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a beat tick folds a shape that is not a net: two faces on one, one face open', async ({ page }) => {
    await open(page, 'en', 'fold-to-test');
    await expect(page.locator('.atlas-axis__tick[data-beat^="fold-to-test."]')).toHaveCount(6);
    await page.locator('.atlas-axis__tick[data-beat="fold-to-test.1"]').click();
    await expect.poll(async () => (await state(page)).beat).toBe(1);
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 4000 }).toBe(1);
    expect((await shown(page))?.result?.closes).toBe(false);
    await expect(page.locator('.ms-net__notes')).toContainText('2 faces here');
    await expect(page.locator('.ms-net__notes')).toContainText('nothing here');
    await expect(page.locator('.ms-beatline')).toContainText('two squares land on the same face');
    await page.keyboard.press(',');
    await expect.poll(async () => (await state(page)).beat).toBe(0);
    await expect(page.locator('.ms-beatline')).toContainText('Fold it and look.');
    await expect(page.locator('body')).not.toContainText(/\bP[1-6]\b|Primary [1-6]/);
  });

  test('the FOLD slider by keyboard and the turn buttons; the next beat puts its own fold back', async ({ page }) => {
    await open(page, 'en', 'opening-a-cube', 2);
    await expect.poll(async () => (await shown(page))?.fold).toBe(0.5);
    await slider(page).focus();
    await page.keyboard.press('Home');
    await expect(slider(page)).toHaveAttribute('aria-valuetext', 'flat');
    await expect.poll(async () => (await shown(page))?.fold).toBe(0);
    await page.keyboard.press('End');
    await expect.poll(async () => (await shown(page))?.fold).toBe(1);
    expect((await shown(page))?.result?.closes).toBe(true);
    await page.getByRole('button', { name: 'Turn a quarter to the right' }).click();
    await expect.poll(async () => (await shown(page))?.turn).toBe(1);
    await page.locator('.atlas-axis__tick[data-beat="opening-a-cube.2"]').click();
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 4000 }).toBe(0);
    await expect.poll(async () => (await shown(page))?.turn).toBe(0);
    expect(new URL(page.url()).searchParams.has('fold')).toBe(false);
  });

  test('complete a net: a place that overlaps folds and is diagnosed; a place that closes stays folded', async ({ page }) => {
    await open(page, 'en', 'fold-to-test');
    await task(page, 'fold-to-test', 7, 'ft-complete-row');
    await expect(slider(page)).toHaveCount(0);
    await page.locator('[data-cand="1"]').click();
    await expect(tray(page)).toContainText('Placed 1 / 1');
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('overlap-unseen');
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 4000 }).toBe(1);
    await expect(page.locator('.ms-net__notes')).toContainText('2 faces here');
    await expect(tray(page)).toContainText('both close the same end');
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 6000 }).toBe(0);
    await page.locator('[data-cand="1"]').click();
    await expect(tray(page)).toContainText('Placed 0 / 1');
    await page.locator('[data-cand="2"]').click();
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 4000 }).toBe(1);
    await page.waitForTimeout(2600);
    expect((await shown(page))?.fold).toBe(1);
    expect((await shown(page))?.result?.closes).toBe(true);
  });

  test('"Show me" folds the answer up; Another one and Skip', async ({ page }) => {
    await open(page);
    await task(page, 'many-nets', 8, 'mn-complete-33');
    for (let i = 0; i < 2; i++) {
      await page.locator('[data-cand="1"]').click();
      await check(page);
      await expect.poll(async () => (await info(page)).tries).toBe(i + 1);
      await expect.poll(async () => (await shown(page))?.fold, { timeout: 6000 }).toBe(0);
      await page.locator('[data-cand="1"]').click();
    }
    await tray(page).locator('[data-show-me]').click();
    await expect.poll(async () => (await info(page)).revealed).toBe(true);
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 4000 }).toBe(1);
    const before = (await info(page)).id;
    await tray(page).locator('[data-another]').click();
    await expect.poll(async () => (await info(page)).id).not.toBe(before);
    await tray(page).locator('[data-skip]').click();
    await expect(tray(page)).toHaveCount(0);
    await expect.poll(async () => (await state(page)).chapter).toBe('fold-to-test');
  });

  test('tap the opposite face: a neighbour is diagnosed and opens the fold, the face one apart is right', async ({ page }) => {
    await open(page, 'en', 'opposite-faces');
    await task(page, 'opposite-faces', 1, 'of-opp-141a');
    await expect(slider(page)).toBeDisabled();
    await page.locator('.ms-net__tap[data-face="2"]').click();
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('adjacent-as-opposite');
    await expect(tray(page)).toContainText('Opposite faces never touch');
    await expect(slider(page)).toBeEnabled();
    await page.locator('.ms-net__tap[data-face="3"]').click();
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await expect.poll(async () => (await shown(page))?.fold, { timeout: 4000 }).toBe(1);
  });

  test('tap the bottom of a box with no lid by keyboard alone', async ({ page }) => {
    await open(page, 'en', 'opposite-faces');
    await task(page, 'opposite-faces', 7, 'of-bottom-end');
    await page.locator('.ms-net__tap[data-face="0"]').focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.ms-net__tap[data-face="4"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('.ms-net__tap[data-face="4"]')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('choose all the nets: leaving out the one that is not a cross is diagnosed', async ({ page }) => {
    await open(page);
    await task(page, 'many-nets', 1, 'mn-multi-1');
    await page.locator('[data-option="a"]').click();
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('prototype-only');
    await expect(tray(page)).toContainText('does not look like the cross');
    await page.locator('[data-option="b"]').click();
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('practice: the fold stays locked, one check per question, then the summary', async ({ page }) => {
    await open(page, 'en', 'practice');
    await expect(tray(page)).toBeVisible();
    for (const i of [1, 2, 3, 4, 5, 6, 7]) {
      await task(page, 'practice', i, (await page.evaluate((k) => (window.__atlas!.engine as unknown as Engine).tasks().filter((t) => t.practice)[k - 1]!.id, i)));
      // A net to complete has no slider (it folds when checked); every other question's stays locked.
      if ((await info(page)).kind !== 'complete-net') await expect(slider(page)).toBeDisabled();
      await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
      await page.waitForTimeout(100);
      await check(page);
      await expect.poll(async () => (await info(page)).done).toBe(true);
    }
    await task(page, 'practice', 8, 'q8-cone');
    await page.locator('[data-option="a"]').click();
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('curved-unrolled');
    expect((await info(page)).done).toBe(true);
    await expect(slider(page)).toBeDisabled();
    await tray(page).locator('.ms-tray__next').click();
    await expect(page.locator('.ms-summary')).toContainText('You got 7 of 8.');
  });

  test('every check solves through the browser controller', async ({ page }) => {
    test.setTimeout(240_000);
    await open(page);
    const tasks = await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).tasks());
    const pool = tasks.filter((t) => !t.practice);
    expect(pool).toHaveLength(73);
    for (const t of pool) {
      await task(page, t.step, t.index, t.id);
      await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
      await check(page);
      await expect.poll(async () => (await info(page)).done, { message: t.id }).toBe(true);
    }
  });

  test('Chinese cinema phone: finger-sized places and buttons, no sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => localStorage.setItem('atlas:theme', 'cinema'));
    await open(page, 'zh', 'cuboid-nets');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cinema');
    for (const [step, i, id] of [['many-nets', 7, 'mn-complete-222'], ['cuboid-nets', 1, 'cn-complete-end'], ['prisms-and-pyramids', 7, 'pp-complete-prism']] as const) {
      await task(page, step, i, id);
      await expect(page.locator('.ms-tray-dock [data-hud-panel="task"]')).toBeVisible();
      await page.waitForTimeout(400);
      for (const c of await page.locator('.ms-net__cand .ms-net__hit').all()) {
        const box = (await c.boundingBox())!;
        expect(Math.min(box.width, box.height), id).toBeGreaterThanOrEqual(43.5);
      }
      for (const b of await page.locator('[data-hud-panel="task"] button:visible').all()) {
        const box = (await b.boundingBox())!;
        expect(Math.min(box.width, box.height), id).toBeGreaterThanOrEqual(43.5);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    }
    await expect(tray(page).locator('[data-another]')).toHaveText('再来一道');
    await page.locator('[data-cand="0"]').click();
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });
});

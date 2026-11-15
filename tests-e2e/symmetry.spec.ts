/**
 * MathScene e2e on line symmetry (docs/79 §7 P, §8): a beat folded flat hatches where
 * the halves do not match and a matching one does not; completing a figure by tapping
 * squares (a slide diagnosed, then the partners right), half squares turned with H and
 * corners put down by keyboard alone; "Fold it" opens only after the second hint and
 * folds the stage figure; every check solved through the browser; zh, cinema and the
 * phone (no sideways scroll). No school level is shown anywhere.
 */
import { expect, test, type Page } from '@playwright/test';

type Info = { id: string; kind: string; done: boolean; tries: number; feedback: { code: string | null } | null };
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
async function open(page: Page, locale = 'en', chapter = 'fold-and-match', beat?: number) {
  await page.goto(`/${locale}/topics/symmetry/?ch=${chapter}${beat ? `&b=${beat}` : ''}`);
  await page.waitForFunction(() => window.__atlas?.ready, null, { timeout: 30_000 });
  await page.evaluate(() => window.__atlas!.setLegends(true));
}
async function task(page: Page, step: string, index: number, id: string) {
  await page.evaluate(([s, i]) => (window.__atlas!.engine as unknown as Engine).goToTask(s, i, { instant: true }), [step, index] as const);
  await expect.poll(async () => (await info(page)).id).toBe(id);
  await expect(tray(page)).toBeVisible();
}

test.describe('line symmetry', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a fold that does not match is hatched; one that matches is not', async ({ page }) => {
    await open(page);
    await page.locator('.atlas-axis__tick[data-beat="fold-and-match.1"]').click();
    await expect.poll(async () => (await state(page)).beat).toBe(1);
    await expect(page.locator('.ms-sym__fold[data-folded]')).toHaveCount(1);
    await expect(page.locator('.ms-sym__miss')).toHaveCount(0);
    await page.keyboard.press('.');
    await expect.poll(async () => (await state(page)).beat).toBe(2);
    await expect(page.locator('.ms-sym__miss')).toHaveCount(1);
    await expect(page.locator('.ms-beatline')).toContainText('not a line of symmetry');
    await expect(page.locator('body')).not.toContainText(/\bP[1-6]\b|Primary [1-6]/);
  });

  test('completing by tapping squares: a slide is diagnosed, the partners are right', async ({ page }) => {
    await open(page, 'en', 'mirror-on-grid');
    await task(page, 'mirror-on-grid', 2, 'mg-step');
    const cell = (k: string) => page.locator(`.ms-grid__cellbtn[data-cell="${k}"]`);
    for (const k of ['6,1', '7,1', '7,2', '8,2']) await cell(k).click();
    await check(page);
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('slid-not-flipped');
    await tray(page).getByRole('button', { name: 'Clear' }).click();
    for (const k of ['9,1', '8,1', '8,2', '7,2']) await cell(k).click();
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('half squares by keyboard: Enter lays a square, H turns a half', async ({ page }) => {
    await open(page, 'en', 'completing-figures');
    await task(page, 'completing-figures', 1, 'cf-roof');
    // Partners of (2,1) (3,1) (4,1) (3,2) (4,2) and the half (2,2,se) across x = 5: (7,1) (6,1) (5,1) (6,2) (5,2) and (7,2,sw).
    const cell = (k: string) => page.locator(`.ms-grid__cellbtn[data-cell="${k}"]`);
    for (const k of ['5,1', '6,1', '7,1', '5,2', '6,2']) {
      await cell(k).focus();
      await page.keyboard.press('Enter');
    }
    await cell('7,2').focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press('h');
    await expect(cell('7,2')).toHaveAttribute('aria-label', /SW/);
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('corners put down by keyboard alone', async ({ page }) => {
    await open(page, 'en', 'completing-figures');
    await task(page, 'completing-figures', 5, 'cf-arrow');
    const cursor = page.getByRole('button', { name: /Corner to put down/ });
    await cursor.focus();
    for (const keys of [['ArrowRight'], ['ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowDown'], ['ArrowLeft', 'ArrowLeft'], ['ArrowDown', 'ArrowDown']]) {
      for (const k of keys) await page.keyboard.press(k);
      await page.keyboard.press('Enter');
    }
    await check(page);
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('Fold it opens after the second hint and folds the stage figure', async ({ page }) => {
    await open(page, 'en', 'fold-and-match');
    await task(page, 'fold-and-match', 2, 'fm-z-shape');
    const fold = tray(page).locator('[data-sym-fold]');
    await expect(fold).toBeDisabled();
    await tray(page).locator('[data-command="hint"]').click();
    await expect(fold).toBeDisabled();
    await tray(page).locator('[data-command="hint"]').click();
    await expect(fold).toBeEnabled();
    await fold.click();
    await expect(page.locator('.ms-sym__fold[data-folded]')).toHaveCount(1);
    await expect(page.locator('.ms-sym__miss')).toHaveCount(1);
  });

  test('every check solves through the browser', async ({ page }) => {
    test.setTimeout(240_000);
    await open(page);
    const all = await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).tasks());
    expect(all.length).toBe(53);
    for (const t of all.filter((x) => !x.practice)) {
      await task(page, t.step, t.index, t.id);
      await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
      await check(page);
      await expect.poll(async () => (await info(page)).done, { message: t.id }).toBe(true);
    }
  });

  for (const [locale, theme] of [['zh', 'paper'], ['en', 'cinema']] as const)
    test(`a completion in ${locale} / ${theme} on a phone: no sideways scroll`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ colorScheme: theme === 'cinema' ? 'dark' : 'light' });
      await open(page, locale, 'mirror-on-grid');
      await task(page, 'mirror-on-grid', 1, 'mg-two');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      await expect(page.locator('.ms-grid__cellbtn').first()).toBeAttached();
    });
});

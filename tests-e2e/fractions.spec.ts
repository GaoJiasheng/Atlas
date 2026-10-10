/**
 * MathScene e2e (docs/15 §6.4) on the Fractions lesson: a shade task by tap
 * and by keyboard, a compare task, a lesson task wrong → diagnosis → right, a
 * practice question wrong → diagnosis (one check) and the summary, the URL
 * (task / model, never an answer), the presentation's "your turn" beat
 * answered from the caption card, and the HUD layout at seven sizes.
 */
import { expect, test, type Page } from '@playwright/test';
import { hudLayoutIssues, LAYOUT_SIZES } from './hud-layout';

type TaskInfo = { id: string | null; done: boolean; tries: number; phase: string; feedback: { tone: string; code: string | null } | null };
type Engine = { task(): TaskInfo; practice(): { score: number; summary: boolean; results: { id: string; ok: boolean | null; code: string | null }[] } };

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const info = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).task());
const tray = (page: Page) => page.locator('[data-hud-panel="task"]');

test.describe('fractions (MathScene)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('shade by tapping the parts, then Check', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=non-unit-fractions');
    expect((await info(page)).id).toBe('chocolate-three-eighths');
    await expect(page.locator('[data-command="check"]').first()).toBeDisabled();
    for (const i of [0, 1, 2]) await page.locator(`.ms-svg [data-part="${i}"]`).click();
    await expect(page.locator('.ms-svg [data-part][aria-pressed="true"]')).toHaveCount(3);
    await page.locator('.atlas-bottombar [data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await expect(tray(page).locator('.ms-tray__feedback')).toContainText('Yes.');
    await expect(page.locator('.atlas-bottombar .ms-steps__tick[data-done]')).toHaveCount(1);
  });

  test('shade with the keyboard only: arrows, Enter, C', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=unit-fractions');
    expect((await info(page)).id).toBe('prata-one-quarter');
    await page.locator('.ms-svg [data-part="0"]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.ms-svg [data-part="1"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('.ms-svg [data-part="1"]')).toHaveAttribute('aria-pressed', 'true');
    // The arrow keys stayed in the model: still the same chapter.
    expect((await page.evaluate(() => window.__atlas!.state())).chapter).toBe('unit-fractions');
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);
    // Shift + → goes to the next sub-step.
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('Shift+ArrowRight');
    await expect.poll(async () => (await info(page)).id).toBe('write-one-sixth');
  });

  test('keyboard only: the cut cursor (arrows, Enter) and the number-line marker (Home, arrows)', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=equal-parts&task=3');
    expect((await info(page)).id).toBe('cut-toast-thirds');
    const cursor = page.locator('.ms-svg .ms-cut [role="slider"]');
    await cursor.focus();
    for (const at of [4, 8]) {
      while (Number(await cursor.getAttribute('aria-valuenow')) !== at) await page.keyboard.press(Number(await cursor.getAttribute('aria-valuenow')) < at ? 'ArrowRight' : 'ArrowLeft');
      await page.keyboard.press('Enter');
    }
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await open(page, '/en/topics/fractions/?ch=number-line&task=1');
    expect((await info(page)).id).toBe('place-one-quarter');
    const marker = page.locator('.ms-svg .ms-line [role="slider"]');
    await marker.focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await expect(marker).toHaveAttribute('aria-valuetext', 'one quarter');
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('a picture option has a spoken description; parts that are given do not block the tab order', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=equal-parts&task=1');
    const names = await page.locator('.ms-svg .ms-option').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    expect(names[0]).toBe('Picture A: a kueh cut into 4 equal parts');
    expect(names[1]).toContain('corner to corner');
    expect(names[2]).toContain('parts of different sizes');
    await open(page, '/en/topics/fractions/?ch=adding-like-fractions&task=1');
    // Parts 0 and 1 are given (2/7, locked): the one tab stop is the next free part, and Enter shades it.
    await expect(page.locator('.ms-svg [data-part="1"]')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('.ms-svg [data-part][tabindex="0"]')).toHaveCount(1);
    await page.locator('.ms-svg [data-part][tabindex="0"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.ms-svg [data-part="2"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('phone 390x844: the model keeps room above the tray, the panel is behind one button, keys are finger-sized', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/fractions/?ch=adding-related&task=3');
    await expect(page.locator('.ms-overlay__toggle')).toBeVisible();
    await expect(page.locator('.ms-overlay')).toHaveCount(0);
    await page.locator('.ms-overlay__toggle').click();
    await expect(page.locator('.ms-overlay')).toBeVisible();
    await page.locator('.ms-overlay__toggle').click();
    const box = async (sel: string) => (await page.locator(sel).first().boundingBox())!;
    const diagram = await box('.ms-svg .ms-diagram');
    const trayBox = await box('[data-hud-panel="task"]');
    expect(diagram.height).toBeGreaterThan(60);
    expect(diagram.y + diagram.height).toBeLessThanOrEqual(trayBox.y + 1);
    for (const key of await page.locator('.ms-keypad .ms-key').all()) {
      const b = (await key.boundingBox())!;
      expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(43.5);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('compare: make same-size parts, choose a sign', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=comparing-unlike');
    expect((await info(page)).id).toBe('thirds-and-quarters');
    await tray(page).getByRole('button', { name: 'Make same-size parts' }).click();
    await expect(page.locator('[data-hud-panel="panel02"]')).toContainText('12');
    await tray(page).getByRole('radio', { name: 'is less than' }).click();
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('a lesson task: wrong answer → its diagnosis → right answer; Show me after two tries', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=unit-fractions&task=2');
    expect((await info(page)).id).toBe('write-one-sixth');
    const box = (f: string) => tray(page).locator(`input[data-field="${f}"]`);
    await box('n').fill('1');
    await box('d').fill('5');
    await box('d').press('Enter');
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('part-part');
    await expect(tray(page).locator('.ms-tray__feedback')).toContainText('The bottom number counts all the equal parts');
    await box('d').fill('1');
    await box('n').fill('6');
    await box('n').press('Enter');
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('swapped');
    await expect(tray(page).locator('[data-show-me]')).toBeVisible();
    await tray(page).locator('[data-show-me]').click();
    await expect(tray(page).locator('.ms-tray__answer')).toBeVisible();
    // The keypad writes into the active box.
    await box('n').fill('');
    await box('n').focus();
    await tray(page).locator('.ms-key', { hasText: /^1$/ }).click();
    await box('d').fill('');
    await box('d').focus();
    await tray(page).locator('.ms-key', { hasText: /^6$/ }).click();
    await expect(box('n')).toHaveValue('1');
    await expect(box('d')).toHaveValue('6');
    await page.locator('.atlas-bottombar [data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
    expect((await info(page)).tries).toBe(2);
  });

  test('practice: one check per question, the diagnosis and a revisit link, then the summary', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=practice&task=3');
    expect((await info(page)).id).toBe('q3-quarters-or-eighths');
    await expect(page.locator('.atlas-status')).toContainText('ASSISTS OFF');
    await tray(page).getByRole('radio', { name: 'is less than' }).click();
    await page.locator('.atlas-bottombar [data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('compare-numerators-only');
    expect((await info(page)).done).toBe(true);
    await expect(tray(page).getByRole('button', { name: 'See step 09' })).toBeVisible();
    // Locked: the answer cannot be changed after the check.
    await expect(tray(page).getByRole('radio', { name: 'is greater than' })).toBeDisabled();
    await tray(page).locator('.ms-tray__next').click();
    expect((await info(page)).id).toBe('q4-simplest-eight-twelfths');
    await tray(page).locator('input[data-field="n"]').fill('2');
    await tray(page).locator('input[data-field="d"]').fill('3');
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await info(page)).done).toBe(true);
    const p = await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).practice());
    expect(p.score).toBe(1);
    expect(p.results.find((r) => r.id === 'q3-quarters-or-eighths')).toMatchObject({ ok: false, code: 'compare-numerators-only' });
    await page.evaluate(() => window.__atlas!.goToChapter('practice', { instant: true }));
    await page.evaluate(() => (window.__atlas!.engine as unknown as { goToTask(s: string, i: number): void }).goToTask('practice', 8));
    await tray(page).locator('.ms-tray__next').click();
    await expect(page.locator('.ms-summary')).toContainText('You got 1 of 8.');
    await expect(page.locator('.ms-summary').getByRole('button', { name: 'See step 07' }).first()).toBeVisible();
  });

  test('URL: sub-step and model view are linkable; answers never reach the URL', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=equivalent-fractions&task=2&model=circle');
    const st = await page.evaluate(() => window.__atlas!.state() as unknown as { task: number; model: string; preset: string });
    expect(st.task).toBe(2);
    expect(st.model).toBe('circle');
    expect(st.preset).toBe('circle');
    await expect(page.locator('.ms-svg .ms-circle')).toHaveCount(1);
    await page.locator('[data-preset="bar"]').click();
    await tray(page).locator('.ms-chip', { hasText: '×4' }).click();
    await page.waitForTimeout(400);
    const url = new URL(page.url());
    expect([...url.searchParams.keys()].sort()).toEqual(['ch', 'task']);
  });

  test('presentation: a "your turn" beat is answered on the stage and checked from the caption card', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=non-unit-fractions');
    const beats = await page.evaluate(() => window.__atlas!.beats());
    const ch = beats.filter((b) => b.chapter === 'non-unit-fractions');
    // Example lines and one beat per sub-step: 2 + 3.
    expect(ch).toHaveLength(5);
    const first = beats.findIndex((b) => b.chapter === 'non-unit-fractions');
    await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), first);
    await expect.poll(async () => (await page.evaluate(() => window.__atlas!.state())).presentation?.beat).toBe(0);
    expect((await page.evaluate(() => window.__atlas!.state())).hud).toBe(false);
    await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), first + 2);
    await expect(page.locator('.atlas-present__actions')).toBeVisible();
    for (const i of [0, 1, 2]) await page.locator(`.ms-svg [data-part="${i}"]`).click();
    await page.locator('.atlas-present__actions [data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await page.evaluate(() => window.__atlas!.state())).hud).toBe(true);
  });

  test('presentation auto-play never passes a "your turn" beat until Check passes or Show me is used', async ({ page }) => {
    test.setTimeout(120_000);
    await open(page, '/en/topics/fractions/?ch=non-unit-fractions');
    const beat = async () => (await page.evaluate(() => window.__atlas!.state())).presentation?.beat;
    const first = (await page.evaluate(() => window.__atlas!.beats())).findIndex((b) => b.chapter === 'non-unit-fractions');
    // The last example line, then auto-play: it moves on to the first "your turn" beat (index 2 in the chapter) and waits there.
    await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), first + 1);
    await expect.poll(beat).toBe(1);
    await page.evaluate(() => window.__atlas!.setAutoplay(true));
    await expect.poll(beat, { timeout: 30_000 }).toBe(2);
    await page.waitForTimeout(9_000);
    expect(await beat()).toBe(2);
    expect((await info(page)).done).toBe(false);
    // Answering and checking opens the gate; auto-play then moves on to the next sub-step.
    await page.evaluate(() => (window.__atlas!.engine as unknown as { solve(): boolean }).solve());
    await page.locator('.atlas-present__actions [data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await expect.poll(beat, { timeout: 40_000 }).toBe(3);
    // A second "your turn": two wrong checks, then Show me, also opens the gate.
    await page.evaluate(() => (window.__atlas!.engine as unknown as { answer(c: string): boolean }).answer('part-part'));
    await page.locator('.atlas-present__actions [data-command="check"]').click();
    await page.locator('.atlas-present__actions [data-command="check"]').click();
    await page.waitForTimeout(9_000);
    expect(await beat()).toBe(3);
    await page.locator('.atlas-present__actions [data-show-me]').click();
    await expect.poll(beat, { timeout: 40_000 }).toBe(4);
  });

  for (const locale of ['en', 'zh'] as const) {
    test(`HUD layout (${locale}): no overlap or overflow at 7 sizes`, async ({ page }) => {
      test.setTimeout(180_000);
      await open(page, `/${locale}/topics/fractions/`);
      const problems: string[] = [];
      for (const [width, height] of LAYOUT_SIZES) {
        await page.setViewportSize({ width, height });
        await page.waitForTimeout(400);
        for (const chapter of await page.evaluate(() => window.__atlas!.chapters())) {
          await page.evaluate((id) => window.__atlas!.goToChapter(id, { instant: true }), chapter);
          await page.waitForTimeout(250);
          for (const issue of await hudLayoutIssues(page)) problems.push(`${width}x${height} ${chapter}: ${issue}`);
        }
        // The tallest trays: fraction boxes with the keypad and a button, and a sentence choice.
        for (const [step, i] of [['adding-related', 3], ['practice', 8], ['equivalent-fractions', 3]] as const) {
          await page.evaluate(([s, k]) => (window.__atlas!.engine as unknown as { goToTask(s: string, i: number, o: { instant: boolean }): void }).goToTask(s, k, { instant: true }), [step, i] as const);
          await page.waitForTimeout(300);
          for (const issue of await hudLayoutIssues(page)) problems.push(`${width}x${height} ${step} ${i}: ${issue}`);
        }
      }
      expect(problems).toEqual([]);
    });
  }
});

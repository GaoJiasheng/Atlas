/**
 * MathScene e2e (docs/15 §6.4, §10) on the Fractions lesson: explanation
 * beats from the chapter axis, the beat line and `,` / `.`; a step's check
 * (one task drawn from the pool, opened from the square tick) answered by
 * pointer and by keyboard, wrong → diagnosis → Show me, Another one and Skip;
 * the practice (one check per question, the summary); the URL (chapter and
 * beat, never the drawn task or an answer); the presentation stopping at a
 * check with the tray in its caption card; zh; the phone (390×844, the tray
 * docked on the stage); and the HUD layout at seven sizes in en / zh.
 */
import { expect, test, type Page } from '@playwright/test';
import { hudLayoutIssues, LAYOUT_SIZES } from './hud-layout';

type TaskInfo = { step: string; beat: number; slot: string; id: string | null; done: boolean; tries: number; attempts: number; feedback: { tone: string; code: string | null } | null };
type Engine = {
  task(): TaskInfo;
  goToTask(step: string, i: number, o?: { instant?: boolean }): void;
  solve(): boolean;
  answer(code: string): boolean;
  practice(): { score: number; summary: boolean; results: { id: string; ok: boolean | null; code: string | null }[] };
};

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const info = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).task());
const force = (page: Page, step: string, i: number) => page.evaluate(([s, k]) => (window.__atlas!.engine as unknown as Engine).goToTask(s as string, k as number, { instant: true }), [step, i] as const);
const state = (page: Page) => page.evaluate(() => window.__atlas!.state() as unknown as { chapter: string; beat: number; model: string | null; hud: boolean; presentation: { beat: number } | null });
/** The check tray: in the reading panel (≥ 1024 px) or docked on the stage (below). */
const tray = (page: Page) => page.locator('[data-hud-panel="task"]');

test.describe('fractions (MathScene)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('explanation beats: a tick, the beat line and , . move the stage; the reader follows', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=equivalent-fractions');
    expect((await state(page)).beat).toBe(0);
    await expect(page.locator('.ms-beatline')).toContainText('Shade half of a paper strip');
    await expect(page.locator('.ms-equation')).toBeVisible();
    // Five circles and the check's square on the chapter's segment.
    await expect(page.locator('.atlas-axis__tick[data-beat^="equivalent-fractions."]')).toHaveCount(6);
    await expect(page.locator('.atlas-axis__tick[data-beat="equivalent-fractions.5"]')).toHaveAttribute('data-shape', 'square');
    await page.locator('.atlas-axis__tick[data-beat="equivalent-fractions.2"]').click();
    await expect.poll(async () => (await state(page)).beat).toBe(2);
    await expect(page.locator('.atlas-axis__tick[data-beat="equivalent-fractions.2"]')).toHaveAttribute('data-filled', 'true');
    await expect(page.locator('.ms-beatline')).toContainText('Fold once more');
    await expect(page.locator('.ms-svg [data-part]')).toHaveCount(8);
    // The <Beat n> link of the beat on show is marked; clicking another one moves the stage.
    await expect(page.locator('.atlas-prose [data-task="beat-3"]:visible')).toHaveAttribute('aria-current', 'step');
    await page.locator('.atlas-prose [data-task="beat-4"]:visible').click();
    await expect.poll(async () => (await state(page)).beat).toBe(3);
    await expect(page.locator('.ms-svg .ms-rows')).toHaveCount(1);
    await page.locator('body').click({ position: { x: 700, y: 120 } });
    await page.keyboard.press('.');
    await expect.poll(async () => (await state(page)).beat).toBe(4);
    await page.keyboard.press(',');
    await expect.poll(async () => (await state(page)).beat).toBe(3);
    await page.locator('.ms-beatline__btn').last().click();
    await expect.poll(async () => (await state(page)).beat).toBe(4);
    await expect.poll(() => new URL(page.url()).searchParams.get('b')).toBe('5');
  });

  test('the check: the square tick opens one task from the pool; answered by pointer; attempts, Another one, Skip', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=non-unit-fractions');
    await page.locator('.atlas-axis__tick[data-beat="non-unit-fractions.4"]').click();
    await expect(page.locator('.atlas-reader-top [data-hud-panel="task"]')).toBeVisible();
    expect((await info(page)).slot).toBe('check');
    await force(page, 'non-unit-fractions', 1);
    await expect.poll(async () => (await info(page)).id).toBe('chocolate-three-eighths');
    await expect(tray(page).locator('[data-command="check"]')).toBeDisabled();
    for (const i of [0, 1]) await page.locator(`.ms-svg [data-part="${i}"]`).click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.tone).toBe('wrong');
    await page.locator('.ms-svg [data-part="2"]').click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await expect(tray(page).locator('.ms-tray__feedback')).toContainText('Yes.');
    await expect(tray(page).locator('.ms-attempts span')).toHaveCount(2);
    // Another one: a different task from the same pool.
    await tray(page).locator('[data-another]').click();
    await expect.poll(async () => (await info(page)).id).not.toBe('chocolate-three-eighths');
    expect((await info(page)).done).toBe(false);
    // Skip: nothing is forced, the next chapter opens on its first beat.
    await tray(page).locator('[data-skip]').click();
    await expect.poll(async () => (await state(page)).chapter).toBe('number-line');
    expect((await state(page)).beat).toBe(0);
  });

  test('a check with the keyboard only: arrows, Enter, C; the cut cursor; the number-line marker', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=unit-fractions');
    await force(page, 'unit-fractions', 1);
    await expect.poll(async () => (await info(page)).id).toBe('prata-one-quarter');
    await page.locator('.ms-svg [data-part="0"]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.ms-svg [data-part="1"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('.ms-svg [data-part="1"]')).toHaveAttribute('aria-pressed', 'true');
    // The arrow keys stayed in the model: still the same chapter.
    expect((await state(page)).chapter).toBe('unit-fractions');
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);

    await force(page, 'equal-parts', 3);
    await expect.poll(async () => (await info(page)).id).toBe('cut-toast-thirds');
    const cursor = page.locator('.ms-svg .ms-cut [role="slider"]');
    await cursor.focus();
    for (const at of [4, 8]) {
      while (Number(await cursor.getAttribute('aria-valuenow')) !== at) await page.keyboard.press(Number(await cursor.getAttribute('aria-valuenow')) < at ? 'ArrowRight' : 'ArrowLeft');
      await page.keyboard.press('Enter');
    }
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);

    await force(page, 'number-line', 1);
    await expect.poll(async () => (await info(page)).id).toBe('place-one-quarter');
    const marker = page.locator('.ms-svg .ms-line [role="slider"]');
    await marker.focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowRight');
    await expect(marker).toHaveAttribute('aria-valuetext', 'one quarter');
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('a check: wrong answer → its diagnosis → Show me after two tries; typed answers with the keypad', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=unit-fractions');
    await force(page, 'unit-fractions', 2);
    await expect.poll(async () => (await info(page)).id).toBe('write-one-sixth');
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
    await box('n').fill('');
    await box('n').focus();
    await tray(page).locator('.ms-key', { hasText: /^1$/ }).click();
    await box('d').fill('');
    await box('d').focus();
    await tray(page).locator('.ms-key', { hasText: /^6$/ }).click();
    await expect(box('n')).toHaveValue('1');
    await expect(box('d')).toHaveValue('6');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
    expect((await info(page)).tries).toBe(2);
  });

  test('a picture option has a spoken description; given parts do not block the tab order', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=equal-parts');
    await force(page, 'equal-parts', 1);
    await expect.poll(async () => (await info(page)).id).toBe('kueh-equal-parts');
    const names = await page.locator('.ms-svg .ms-option').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
    expect(names[0]).toBe('Picture A: a kueh cut into 4 equal parts');
    expect(names[1]).toContain('corner to corner');
    expect(names[2]).toContain('parts of different sizes');
    await force(page, 'adding-like-fractions', 1);
    await expect.poll(async () => (await info(page)).id).toBe('add-sevenths');
    await expect(page.locator('.ms-svg [data-part="1"]')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('.ms-svg [data-part][tabindex="0"]')).toHaveCount(1);
    await page.locator('.ms-svg [data-part][tabindex="0"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.ms-svg [data-part="2"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('compare: make same-size parts, choose a sign; the number sentence under the model follows', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=comparing-unlike');
    await force(page, 'comparing-unlike', 1);
    await expect.poll(async () => (await info(page)).id).toBe('thirds-and-quarters');
    await tray(page).getByRole('button', { name: 'Make same-size parts' }).click();
    await expect(page.locator('.ms-equation')).toContainText('12');
    await tray(page).getByRole('radio', { name: 'is less than' }).click();
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('practice: one check per question, the diagnosis and a revisit link, then the summary', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=practice&b=3');
    expect((await info(page)).id).toBe('q3-quarters-or-eighths');
    await expect(page.locator('.atlas-axis__tick[data-beat="practice.2"]')).toHaveAttribute('data-shape', 'square');
    await expect(page.locator('.atlas-status')).toContainText('ASSISTS OFF');
    await tray(page).getByRole('radio', { name: 'is less than' }).click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('compare-numerators-only');
    expect((await info(page)).done).toBe(true);
    await expect(tray(page).getByRole('button', { name: 'See step 09' })).toBeVisible();
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
    await force(page, 'practice', 8);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
    await page.waitForTimeout(100);
    await tray(page).locator('[data-command="check"]').click();
    await tray(page).locator('.ms-tray__next').click();
    await expect(page.locator('.ms-summary')).toContainText('You got 2 of 8.');
    await expect(page.locator('.ms-summary').getByRole('button', { name: 'See step 07' }).first()).toBeVisible();
  });

  test('URL: chapter, beat and model view are linkable; the drawn task and the answers never reach it', async ({ page }) => {
    await open(page, '/en/topics/fractions/?ch=equivalent-fractions&b=3');
    expect((await state(page)).beat).toBe(2);
    await force(page, 'equivalent-fractions', 2);
    await expect.poll(async () => (await info(page)).id).toBe('split-thirds-into-twelfths');
    await page.locator('[data-preset="circle"]').click();
    await expect(page.locator('.ms-svg .ms-circle')).toHaveCount(1);
    await page.locator('[data-preset="bar"]').click();
    await tray(page).locator('.ms-chip', { hasText: '×4' }).click();
    await page.waitForTimeout(400);
    const url = new URL(page.url());
    expect([...url.searchParams.keys()].sort()).toEqual(['b', 'ch']);
    expect(url.searchParams.get('b')).toBe('6');
    // A reload draws the check again from the pool: the task is never in the URL.
    await open(page, url.pathname + url.search);
    expect((await info(page)).slot).toBe('check');
  });

  test('presentation: walks the beats and stops at the check with the tray in the caption card; Skip opens the gate', async ({ page }) => {
    test.setTimeout(120_000);
    await open(page, '/en/topics/fractions/?ch=non-unit-fractions');
    const beats = await page.evaluate(() => window.__atlas!.beats());
    const ch = beats.filter((b) => b.chapter === 'non-unit-fractions');
    // Four explanation beats and the check.
    expect(ch).toHaveLength(5);
    const first = beats.findIndex((b) => b.chapter === 'non-unit-fractions');
    const beat = async () => (await state(page)).presentation?.beat;
    await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), first + 3);
    await expect.poll(beat).toBe(3);
    expect((await state(page)).hud).toBe(false);
    await page.evaluate(() => window.__atlas!.setAutoplay(true));
    await expect.poll(beat, { timeout: 40_000 }).toBe(4);
    await expect(page.locator('.atlas-present__actions [data-command="check"]')).toBeVisible();
    await page.waitForTimeout(9_000);
    expect(await beat()).toBe(4);
    expect((await info(page)).done).toBe(false);
    await page.locator('.atlas-present__actions [data-skip]').click();
    await expect.poll(async () => (await state(page)).presentation?.beat === 0 && (await state(page)).chapter === 'number-line', { timeout: 40_000 }).toBe(true);
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await state(page)).hud).toBe(true);
  });

  test('presentation: answering the check from the caption card opens the gate', async ({ page }) => {
    test.setTimeout(120_000);
    await open(page, '/en/topics/fractions/?ch=unit-fractions');
    const first = (await page.evaluate(() => window.__atlas!.beats())).findIndex((b) => b.chapter === 'unit-fractions');
    await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), first + 4);
    await expect.poll(async () => (await state(page)).presentation?.beat).toBe(4);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
    await page.locator('.atlas-present__actions [data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.tone).toMatch(/correct|phase/);
    if (!(await info(page)).done) {
      await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).solve());
      await page.locator('.atlas-present__actions [data-command="check"]').click();
    }
    await expect.poll(async () => (await info(page)).done).toBe(true);
    await page.evaluate(() => window.__atlas!.setAutoplay(true));
    await expect.poll(async () => (await state(page)).chapter, { timeout: 40_000 }).toBe('non-unit-fractions');
  });

  test('zh: the beat line, the check and the axis speak Chinese', async ({ page }) => {
    await open(page, '/zh/topics/fractions/?ch=equivalent-fractions&b=2');
    await expect(page.locator('.ms-beatline')).toContainText('再对折一次');
    await expect(page.locator('.ms-beatline__no')).toContainText('节拍 2/5');
    await page.locator('.atlas-axis__tick[data-beat="equivalent-fractions.5"]').click();
    await expect(tray(page)).toBeVisible();
    await expect(tray(page).locator('[data-another]')).toHaveText('再来一道');
    await expect(tray(page).locator('[data-skip]')).toHaveText('跳过');
    await expect(page.locator('.ms-index__head').first()).toHaveText('要点');
  });

  test('phone 390x844: the check docks on the stage over the axis, the model keeps room, keys are finger-sized', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/fractions/?ch=adding-related');
    // The axis shows chapter numbers only; beats are stepped with the reader's beat line.
    await expect(page.locator('.atlas-axis__tick').first()).toBeHidden();
    await force(page, 'adding-related', 3);
    await expect.poll(async () => (await info(page)).id).toBe('ribbon-bow-and-bookmark');
    await expect(page.locator('.ms-tray-dock [data-hud-panel="task"]')).toBeVisible();
    const box = async (sel: string) => (await page.locator(sel).first().boundingBox())!;
    // The stage lays the model out above the docked tray once both are measured.
    await expect.poll(async () => (await box('.ms-svg .ms-diagram')).y + (await box('.ms-svg .ms-diagram')).height <= (await box('[data-hud-panel="task"]')).y + 1).toBe(true);
    expect((await box('.ms-svg .ms-diagram')).height).toBeGreaterThan(60);
    for (const key of await page.locator('.ms-keypad .ms-key').all()) {
      const b = (await key.boundingBox())!;
      expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(43.5);
    }
    await expect(page.locator('.ms-overlay__toggle')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
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
        // The tallest checks: fraction boxes with the keypad, a model drawing, a sentence choice.
        for (const [step, i] of [['adding-related', 3], ['practice', 8], ['equivalent-fractions', 3]] as const) {
          await force(page, step, i);
          await page.waitForTimeout(300);
          for (const issue of await hudLayoutIssues(page)) problems.push(`${width}x${height} ${step} ${i}: ${issue}`);
        }
      }
      expect(problems).toEqual([]);
    });
  }
});

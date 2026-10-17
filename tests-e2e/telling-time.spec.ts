/**
 * MathScene e2e on the clock face and the timeline (docs/20 §3, §8): a beat
 * from the chapter axis (the hour hand's track, the lens, the number sentence,
 * the TIME card); a clock set by dragging the minute hand (the hour hand
 * follows) and finished with the tray's hour stepper; a clock set with the
 * keyboard only (PgUp / PgDn an hour, arrows by the snap, crossing 12 moves
 * the hour back); a clock read and written, with its diagnosis; a duration
 * jumped along the timeline with the chips (and one jump taken back), then
 * written; am / pm chips; the practice to its summary; zh; and the phone
 * (390×844: the tray docked on the stage, finger-sized controls, no sideways
 * scroll). No school level is shown anywhere.
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
const hand = (page: Page, which: 'hour' | 'minute') => page.locator(`.ms-svg .ms-clock__handle[data-hand="${which}"]`);

test.describe('telling time (MathScene clock and timeline)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('beat ticks turn the hands: one full turn moves the hour hand one number, then the lens', async ({ page }) => {
    await open(page, '/en/topics/telling-time/?ch=hands-move-together');
    await expect(page.locator('.atlas-axis__tick[data-beat^="hands-move-together."]')).toHaveCount(5);
    await expect(page.locator('.atlas-axis__tick[data-beat="hands-move-together.4"]')).toHaveAttribute('data-shape', 'square');
    await page.locator('.atlas-axis__tick[data-beat="hands-move-together.1"]').click();
    await expect.poll(async () => (await state(page)).beat).toBe(1);
    await expect(page.locator('.ms-svg .ms-clock__track')).toHaveCount(1);
    await expect(page.locator('.ms-equation')).toHaveText('60 min = 1 h');
    await expect(page.locator('.ms-beatline')).toContainText('the hour hand moves only from 2 to 3');
    await page.keyboard.press('.');
    await expect.poll(async () => (await state(page)).beat).toBe(2);
    await expect(page.locator('.ms-svg .ms-clock__lens')).toHaveCount(1);
    await expect(page.locator('.ms-equation')).toHaveText('3.45');
    // No school level anywhere on the page.
    await expect(page.locator('body')).not.toContainText(/\bP[1-6]\b|Primary [1-6]|Bridge/);
  });

  test('set the clock by dragging the minute hand: the hour hand follows, the hour stepper finishes it', async ({ page }) => {
    await open(page, '/en/topics/telling-time/?ch=the-clock-face');
    await force(page, 'the-clock-face', 2);
    await expect.poll(async () => (await info(page)).id).toBe('cf-set-nine-fifteen');
    const minute = hand(page, 'minute');
    await expect(minute).toHaveAttribute('aria-valuenow', '0');
    // Drag the minute knob from 12 round to the 3.
    const knob = (await minute.locator('.ms-clock__knob').boundingBox())!;
    const three = (await page.locator('.ms-svg .ms-clock__tap[aria-label^="Minute hand to 3 "]').boundingBox())!;
    await page.mouse.move(knob.x + knob.width / 2, knob.y + knob.height / 2);
    await page.mouse.down();
    await page.mouse.move(knob.x + knob.width * 2, knob.y + knob.height * 1.5, { steps: 4 });
    await page.mouse.move(three.x + three.width / 2, three.y + three.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect(minute).toHaveAttribute('aria-valuenow', '15');
    // The hour hand moved on with it: still 12, a quarter of the way to 1.
    await expect(hand(page, 'hour')).toHaveAttribute('aria-valuenow', '12');
    await expect(minute).toHaveAttribute('aria-valuetext', /past twelve/);
    for (let i = 0; i < 3; i++) await tray(page).getByRole('button', { name: 'Back an hour' }).click();
    await expect(hand(page, 'hour')).toHaveAttribute('aria-valuenow', '9');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('set the clock with the keyboard only: hours with PgUp / PgDn, minutes with the arrows, back across 12', async ({ page }) => {
    await open(page, '/en/topics/telling-time/?ch=to-the-minute');
    await force(page, 'to-the-minute', 2);
    await expect.poll(async () => (await info(page)).id).toBe('tm-set-ten-fifty-two');
    const minute = hand(page, 'minute');
    await minute.focus();
    // 10:00 → back one minute across 12 is 9:59: the hour goes back with it.
    await page.keyboard.press('ArrowLeft');
    await expect(hand(page, 'hour')).toHaveAttribute('aria-valuenow', '9');
    await expect(minute).toHaveAttribute('aria-valuenow', '59');
    await page.keyboard.press('PageUp');
    await page.keyboard.press('ArrowRight');
    await expect(minute).toHaveAttribute('aria-valuenow', '0');
    await expect(hand(page, 'hour')).toHaveAttribute('aria-valuenow', '11');
    // On to 11:52 is an hour too far: the check names it.
    for (let i = 0; i < 2; i++) await page.keyboard.press('Shift+ArrowLeft');
    for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowRight');
    await expect(minute).toHaveAttribute('aria-valuenow', '52');
    await expect(hand(page, 'hour')).toHaveAttribute('aria-valuenow', '10');
    await page.keyboard.press('PageUp');
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('next-hour');
    await minute.focus();
    await page.keyboard.press('PageDown');
    await page.keyboard.press('c');
    await expect.poll(async () => (await info(page)).done).toBe(true);
    // The arrows stayed on the clock: still the same chapter.
    expect((await state(page)).chapter).toBe('to-the-minute');
  });

  test('read a clock and write the time: the number under the minute hand is diagnosed', async ({ page }) => {
    await open(page, '/en/topics/telling-time/?ch=the-clock-face');
    await force(page, 'the-clock-face', 1);
    await expect.poll(async () => (await info(page)).id).toBe('cf-read-eight-twenty');
    await tray(page).locator('input[data-field="h"]').fill('8');
    await tray(page).locator('input[data-field="m"]').fill('04');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('numeral-as-minutes');
    await expect(tray(page).locator('.ms-tray__feedback')).toContainText('4 fives');
    await tray(page).locator('input[data-field="m"]').fill('20');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('am or pm: the chips are a radio group and the wrong half of the day is diagnosed', async ({ page }) => {
    await open(page, '/en/topics/telling-time/?ch=am-and-pm');
    await force(page, 'am-and-pm', 2);
    await expect.poll(async () => (await info(page)).id).toBe('ap-read-bedtime');
    await tray(page).locator('input[data-field="h"]').fill('8');
    await tray(page).locator('input[data-field="m"]').fill('30');
    await tray(page).getByRole('radio', { name: 'am', exact: true }).click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('am-pm');
    await tray(page).getByRole('radio', { name: 'pm', exact: true }).click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('a duration: jump along the timeline with the chips, take one back, then write the answer', async ({ page }) => {
    await open(page, '/en/topics/telling-time/?ch=how-long');
    await force(page, 'how-long', 1);
    await expect.poll(async () => (await info(page)).id).toBe('hl-library-visit');
    // 8.50 am → 10.15 am: +10 min to the hour, +1 h, then +5 min three times.
    await tray(page).getByRole('button', { name: 'Jump on 10 min' }).click();
    await tray(page).getByRole('button', { name: 'Jump on 1 h' }).click();
    for (let i = 0; i < 4; i++) await tray(page).getByRole('button', { name: 'Jump on 5 min' }).click();
    await expect(page.locator('.ms-svg .ms-tl__jump--mine')).toHaveCount(3);
    // One jump too many: Backspace on a chip takes it back.
    await tray(page).getByRole('button', { name: 'Jump on 5 min' }).focus();
    await page.keyboard.press('Backspace');
    await expect(page.locator('.ms-plate')).toContainText('1 h 25 min');
    await tray(page).locator('input[data-field="h"]').fill('1');
    await tray(page).locator('input[data-field="m"]').fill('65');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('base-100');
    await tray(page).locator('input[data-field="m"]').fill('25');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
  });

  test('practice: one check per question, a diagnosis, then the summary', async ({ page }) => {
    await open(page, '/en/topics/telling-time/?ch=practice&b=7');
    expect((await info(page)).id).toBe('q7-write-seven-twenty-pm');
    await tray(page).locator('input[data-field="h"]').fill('17');
    await tray(page).locator('input[data-field="m"]').fill('20');
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).feedback?.code).toBe('24h-offset');
    expect((await info(page)).done).toBe(true);
    await expect(tray(page).getByRole('button', { name: 'See step 10' })).toBeVisible();
    for (const i of [1, 2, 3, 4, 5, 6, 8]) {
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
    await open(page, '/zh/topics/telling-time/?ch=twenty-four-hour-clock&b=3');
    await expect(page.locator('.ms-beatline')).toContainText('小时数加 12');
    await expect(page.locator('.ms-equation')).toHaveText('3.15 pm = 1515');
    await page.locator('.atlas-axis__tick[data-beat="twenty-four-hour-clock.5"]').click();
    await expect(tray(page)).toBeVisible();
    await expect(tray(page).locator('[data-another]')).toHaveText('再来一道');
    await expect(page.locator('body')).not.toContainText(/\bP[1-6]\b|小[一二三四五六]/);
  });

  test('phone 390x844: the check docks on the stage, the clock steppers are finger-sized, no sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/telling-time/?ch=the-clock-face');
    await force(page, 'the-clock-face', 2);
    await expect.poll(async () => (await info(page)).id).toBe('cf-set-nine-fifteen');
    await expect(page.locator('.ms-tray-dock [data-hud-panel="task"]')).toBeVisible();
    const back = tray(page).getByRole('button', { name: 'Back an hour' });
    for (const b of [back, tray(page).getByRole('button', { name: '5 min on' })]) {
      const box = (await b.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(43.5);
    }
    for (let i = 0; i < 3; i++) await back.click();
    for (let i = 0; i < 3; i++) await tray(page).getByRole('button', { name: '5 min on' }).click();
    await tray(page).locator('[data-command="check"]').click();
    await expect.poll(async () => (await info(page)).done).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

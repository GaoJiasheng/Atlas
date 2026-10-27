/** E-BJ2 integration fixture: declared for Claude's browser gate (docs/57 §4). */
import { expect, test, type Page } from '@playwright/test';

type Reading = { angles: Record<string, number>; position: number[]; quaternion: number[] };
type Engine = { joint(id: string): Reading | null; sim(): { values: Record<string, unknown>; outputs: Record<string, unknown> } };
const joint = (page: Page, id: string) => page.evaluate((name) => (window.__atlas!.engine as unknown as Engine).joint(name), id);
const value = (page: Page, name: string) => page.evaluate((id) => (window.__atlas!.engine as unknown as Engine).sim().values[id], name);
async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/sample-joint/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(() => joint(page, 'elbow.l'), { timeout: 30_000 }).not.toBeNull();
}
const distance = (a: number[], b: number[]) => Math.hypot(...a.map((x, i) => x - b[i]!));

test.describe('numeric rig joint binding', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

  test('deep link and named pose give the same actual hand endpoint and rotation', async ({ page }) => {
    await open(page, 'ch=lever&sim=mode.lever~elbow-angle.90');
    await expect.poll(async () => (await joint(page, 'elbow.l'))?.angles.flexion).toBe(90);
    const driven = (await joint(page, 'hand.l'))!;
    const right = (await joint(page, 'hand.r'))!;
    expect((await joint(page, 'elbow.r'))!.angles.flexion).toBe(25);
    expect((await joint(page, 'forearm.l'))!.angles.pronation).toBe(20);
    await open(page, 'ch=named-pose');
    const named = (await joint(page, 'hand.l'))!;
    expect(distance(named.position, driven.position)).toBeLessThan(1e-6);
    expect(distance(named.quaternion, driven.quaternion)).toBeLessThan(1e-6);
    expect(distance((await joint(page, 'hand.r'))!.position, right.position)).toBeLessThan(1e-6);
  });

  test('manual controls match a fresh deep link and switching chapter restores its pose', async ({ page }) => {
    await open(page, 'ch=lever&sim=mode.lever~elbow-angle.60');
    const right = (await joint(page, 'hand.r'))!;
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press(']');
    await expect.poll(() => value(page, 'elbow-angle')).toBe(90);
    await expect.poll(async () => (await joint(page, 'elbow.l'))?.angles.flexion).toBeCloseTo(90, 5);
    const manual = (await joint(page, 'hand.l'))!;
    await page.reload();
    await expect.poll(() => joint(page, 'hand.l'), { timeout: 30_000 }).not.toBeNull();
    const linked = (await joint(page, 'hand.l'))!;
    expect(distance(manual.position, linked.position)).toBeLessThan(1e-6);
    expect(distance(manual.quaternion, linked.quaternion)).toBeLessThan(1e-6);
    expect(distance((await joint(page, 'hand.r'))!.position, right.position)).toBeLessThan(1e-6);
    await page.evaluate(() => window.__atlas!.goToChapter('before-you-start'));
    await expect.poll(async () => (await joint(page, 'elbow.l'))?.angles.flexion).toBeCloseTo(30, 5);
    expect(await value(page, 'mode')).toBe('explore');
  });

  test('inactive guard preserves the baseline, also in reduced motion and Chinese', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'ch=lever&sim=mode.explore~elbow-angle.120', 'zh');
    expect((await joint(page, 'elbow.l'))!.angles.flexion).toBe(30);
    expect((await joint(page, 'elbow.r'))!.angles.flexion).toBe(25);
    await open(page, 'ch=lever&sim=mode.lever~elbow-angle.120', 'zh');
    expect((await joint(page, 'elbow.l'))!.angles.flexion).toBe(120);
    expect((await joint(page, 'forearm.l'))!.angles.pronation).toBe(20);
  });
});

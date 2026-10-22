/**
 * Flowers and Seeds (docs/41): the published specimen table with the `seeds`
 * model. The background chapter has its reading note; a deep link to cup D
 * on day 7 shows its seedlings tinted pale and hides its seeds; stepping the
 * day from 0 to 7 turns cups A and D into seedlings and leaves B and E as
 * seeds; cup E against A is not a fair test, against D it changes only the
 * warmth, and the rings follow both choices; three recorded laboratory
 * temperatures draw a line that falls all the way; choosing the rubber tree
 * shows the burst fruit in place of the closed one and runs only the
 * bursting flow; the predict-first card answers in Chinese; on a phone the
 * cup card works in the drawer with 44 px targets; the plant topic links
 * here.
 */
import { expect, test, type Page } from '@playwright/test';

type Anchor = { x: number; y: number; shown: boolean; onScreen: boolean } | null;
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, number | string> };
  anchor(id: string): Anchor;
  tint(id: string): { color: string; level: number } | null;
  flow(id: string): { paths: Record<string, { visible: boolean }> } | null;
  setSim(values: Record<string, number | string | boolean>): boolean;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const anchor = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).anchor(x), id);
const tint = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).tint(x), id);
const flowOn = (page: Page, id: string) => page.evaluate((x) => Object.values((window.__atlas!.engine as unknown as Engine).flow(x)?.paths ?? {}).some((p) => p.visible), id);
const set = (page: Page, values: Record<string, number | string | boolean>) => page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const shown = async (page: Page, id: string) => (await anchor(page, id))?.shown ?? false;
const card = (page: Page) => page.locator('.space-try');
const readout = (page: Page, id: string) => card(page).locator(`[data-sim-output="${id}"]`);
const token = (page: Page, name: string) => page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(`--${n}`).trim().toLowerCase(), name);

async function open(page: Page, query: string, lang = 'en') {
  await page.goto(`/${lang}/topics/flower-and-seed/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}

test.describe('flower-and-seed', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('background chapter: reading note, BG axis segment, no card', async ({ page }) => {
    await open(page, 'ch=before-you-start');
    await expect(page.locator('.atlas-note')).toContainText('model study laid out on one round table');
    await expect(page.locator('.atlas-axis')).toContainText('BG');
    await expect(card(page)).toHaveCount(0);
  });

  test('cup D on day 7: seedlings shown and tinted pale, seeds hidden; cup A stays green', async ({ page }) => {
    await open(page, 'ch=a-fair-test-with-seeds&sim=cup.d~day.7');
    const s = await sim(page);
    expect([s.outputs['cup-result'], s.outputs.seedlings, s.outputs['grown-d'], s.outputs['pale-d']]).toEqual(['germinated', 'pale', 1, 1]);
    await expect.poll(() => shown(page, 'seedlings-d')).toBe(true);
    expect(await shown(page, 'seeds-d')).toBe(false);
    await expect.poll(async () => (await tint(page, 'seedlings-d'))?.level).toBe(0.85);
    expect((await tint(page, 'seedlings-d'))!.color).toBe(await token(page, 'seedling-pale'));
    expect((await tint(page, 'seedlings-a'))?.level).toBe(0);
    await expect(readout(page, 'seedlings')).toContainText('Pale');
  });

  test('stepping the day from 0 to 7: A and D germinate, B and E keep their seeds', async ({ page }) => {
    await open(page, 'ch=a-fair-test-with-seeds');
    for (const k of ['a', 'b', 'd', 'e']) await expect.poll(() => shown(page, `seeds-${k}`)).toBe(true);
    await expect(readout(page, 'cup-result')).toHaveAttribute('data-state', 'waiting');
    await card(page).locator('[data-sim-control="day"] button[aria-label$="Next value"]').click();
    await expect.poll(async () => (await sim(page)).values.day).toBe(7);
    await expect.poll(() => shown(page, 'seedlings-a')).toBe(true);
    await expect.poll(() => shown(page, 'seedlings-d')).toBe(true);
    expect(await shown(page, 'seeds-a')).toBe(false);
    expect(await shown(page, 'seeds-b')).toBe(true);
    expect(await shown(page, 'seeds-e')).toBe(true);
    await expect(page).toHaveURL(/sim=[^&]*day\.7/);
    await page.keyboard.press(']');
    await expect.poll(async () => (await sim(page)).values.cup).toBe('b');
    await expect(readout(page, 'cup-result')).toHaveAttribute('data-state', 'not-germinated');
  });

  test('cup E: against A not a fair test, against D only the warmth; the rings follow', async ({ page }) => {
    await open(page, 'ch=a-fair-test-with-seeds&sim=cup.e~against.a~day.7');
    await expect(readout(page, 'changed')).toHaveAttribute('data-state', 'more-than-one');
    await expect.poll(async () => Math.hypot((await anchor(page, 'pick-ring'))!.x - (await anchor(page, 'cup-e'))!.x, (await anchor(page, 'pick-ring'))!.y - (await anchor(page, 'cup-e'))!.y)).toBeLessThan(40);
    await card(page).locator('[data-sim-control="against"] [data-sim-value="d"]').click();
    await expect(readout(page, 'changed')).toHaveAttribute('data-state', 'warmth');
    await expect(readout(page, 'changed')).toContainText('Only the warmth');
    await expect.poll(async () => Math.hypot((await anchor(page, 'ref-ring'))!.x - (await anchor(page, 'cup-d'))!.x, (await anchor(page, 'ref-ring'))!.y - (await anchor(page, 'cup-d'))!.y)).toBeLessThan(40);
    await expect(page.locator('.space-plate__simstate')).toHaveAttribute('data-state', 'not-germinated');
  });

  test('three laboratory temperatures: a line that falls all the way; the half flag at the median', async ({ page }) => {
    await open(page, 'ch=inside-a-seed');
    for (const temp of [14, 17, 20]) {
      await set(page, { temp, 'count-day': 5 });
      await expect.poll(async () => (await sim(page)).outputs['half-day']).toBe({ 14: 9.4, 17: 6.5, 20: 4.3 }[temp]);
      await card(page).locator('[data-sim-record]').click();
    }
    await expect(card(page).locator('.space-try__table tbody tr')).toHaveCount(3);
    await expect(card(page).locator('.space-chart[data-kind="line"] svg[role="img"]')).toHaveAttribute('aria-label', /falls all the way/);
    expect((await sim(page)).outputs.half).toBe('half-or-more');
    await set(page, { temp: 14 });
    await expect.poll(async () => (await sim(page)).outputs.half).toBe('fewer');
  });

  test('rubber tree: the burst fruit replaces the closed one and only the bursting flow runs', async ({ page }) => {
    await open(page, 'ch=seed-dispersal');
    await expect.poll(() => flowOn(page, 'wind-drift')).toBe(true);
    expect(await flowOn(page, 'seed-burst')).toBe(false);
    await expect.poll(() => shown(page, 'rubber-capsule')).toBe(true);
    expect(await shown(page, 'rubber-valves')).toBe(false);
    const rest = (await anchor(page, 'rubber-seeds'))!;
    await set(page, { fruit: 'rubber' });
    await expect(readout(page, 'method')).toHaveAttribute('data-state', 'splitting');
    await expect.poll(() => flowOn(page, 'seed-burst')).toBe(true);
    await expect.poll(() => flowOn(page, 'wind-drift')).toBe(false);
    await expect.poll(() => shown(page, 'rubber-valves')).toBe(true);
    await expect.poll(() => shown(page, 'rubber-capsule')).toBe(false);
    // The seeds are thrown out: they move on the screen.
    await expect.poll(async () => Math.hypot((await anchor(page, 'rubber-seeds'))!.x - rest.x, (await anchor(page, 'rubber-seeds'))!.y - rest.y)).toBeGreaterThan(10);
  });

  test('predict first in Chinese: cup D in the dark germinates', async ({ page }) => {
    await open(page, 'ch=a-fair-test-with-seeds', 'zh');
    await expect(readout(page, 'cup-result')).toContainText('刚放好');
    await card(page).locator('[data-predict="yes"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('发芽了');
    expect((await sim(page)).outputs['cup-result']).toBe('germinated');
  });

  test('on a phone the cup card works in the drawer with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=a-fair-test-with-seeds');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    const option = card(page).locator('[data-sim-control="cup"] [data-sim-value="d"]');
    await option.scrollIntoViewIfNeeded();
    const box = (await option.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    await option.click();
    await expect.poll(async () => (await sim(page)).values.cup).toBe('d');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('the plant topic links here from its flower, fruit and seed chapters', async ({ page }) => {
    for (const ch of ['flowers-and-pollination', 'fruits-and-seeds', 'seed-to-plant']) {
      await page.goto(`/en/topics/plant/?ch=${ch}`);
      await expect(page.locator('a[href*="/en/topics/flower-and-seed/"]').first()).toBeAttached();
    }
  });
});

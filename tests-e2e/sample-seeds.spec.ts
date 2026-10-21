/**
 * The seeds model (docs/41 §4.2 E-S1, §4.6) on the primitive bench
 * `sample-seeds`: a deep link to cup D on day 7 shows its seedlings tinted
 * pale and hides its seeds; stepping the card's day from 0 to 7 turns cups A
 * and D into seedlings and leaves B and E as seeds; the two rings follow the
 * cup and the cup it is compared with; E against A is not a fair test, E
 * against D changes only the warmth; three recorded temperatures draw a line
 * that falls all the way (in Chinese too); the three-part fruit bursts and
 * only its flow runs; the PLATE reads only what the chapter's card observes;
 * on a phone the card works in the drawer with 44 px targets.
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

async function open(page: Page, query: string, lang = 'en') {
  await page.goto(`/${lang}/topics/sample-seeds/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
/** The colour a CSS custom property holds on the page (the stage resolves `token:` against the same). */
const token = (page: Page, name: string) => page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(`--${n}`).trim().toLowerCase(), name);

test.describe('sample-seeds (seeds model)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('background has its reading note, BG axis segment and no card', async ({ page }) => {
    await open(page, 'ch=before-you-start');
    await expect(page.locator('.atlas-note')).toContainText('combines sourced facts by rule');
    await expect(page.locator('.atlas-axis')).toContainText('BG');
    await expect(card(page)).toHaveCount(0);
  });

  test('a deep link to cup D on day 7: seedlings shown and tinted pale, seeds hidden', async ({ page }) => {
    await open(page, 'ch=sample-cups&sim=cup.d~day.7');
    const s = await sim(page);
    expect([s.outputs['cup-result'], s.outputs.seedlings, s.outputs['grown-d'], s.outputs['pale-d']]).toEqual(['germinated', 'pale', 1, 1]);
    await expect.poll(() => shown(page, 'seedlings-d')).toBe(true);
    expect(await shown(page, 'seeds-d')).toBe(false);
    const pale = await token(page, 'seedling-pale');
    await expect.poll(async () => (await tint(page, 'seedlings-d'))?.level).toBe(0.85);
    expect((await tint(page, 'seedlings-d'))!.color).toBe(pale);
    // Cup A's seedlings are lit: no tint.
    expect((await tint(page, 'seedlings-a'))?.level).toBe(0);
    await expect(readout(page, 'cup-result')).toHaveAttribute('data-state', 'germinated');
    await expect(readout(page, 'seedlings')).toContainText('Pale');
  });

  test('stepping the day from 0 to 7: cups A and D grow seedlings, B and E keep their seeds', async ({ page }) => {
    await open(page, 'ch=sample-cups');
    for (const k of ['a', 'b', 'd', 'e']) {
      await expect.poll(() => shown(page, `seeds-${k}`)).toBe(true);
      expect(await shown(page, `seedlings-${k}`)).toBe(false);
    }
    await expect(readout(page, 'cup-result')).toHaveAttribute('data-state', 'waiting');
    await card(page).locator('[data-sim-control="day"] button[aria-label$="Next value"]').click();
    await expect.poll(async () => (await sim(page)).values.day).toBe(7);
    await expect.poll(() => shown(page, 'seedlings-a')).toBe(true);
    await expect.poll(() => shown(page, 'seedlings-d')).toBe(true);
    expect(await shown(page, 'seeds-a')).toBe(false);
    expect(await shown(page, 'seeds-d')).toBe(false);
    expect(await shown(page, 'seeds-b')).toBe(true);
    expect(await shown(page, 'seeds-e')).toBe(true);
    expect(await shown(page, 'seedlings-b')).toBe(false);
    expect(await shown(page, 'seedlings-e')).toBe(false);
    await expect(page).toHaveURL(/sim=[^&]*day\.7/);
    // `]` steps the card's own control: the cup looked at.
    await page.keyboard.press(']');
    await expect.poll(async () => (await sim(page)).values.cup).toBe('b');
    await expect(readout(page, 'cup-result')).toHaveAttribute('data-state', 'not-germinated');
  });

  test('the rings follow the cup and the cup it is compared with; E against D is the fair test', async ({ page }) => {
    await open(page, 'ch=sample-cups&sim=cup.e~against.a~day.7');
    await expect.poll(async () => Math.abs((await anchor(page, 'pick-ring'))!.x - (await anchor(page, 'cup-e'))!.x)).toBeLessThan(15);
    await expect.poll(async () => Math.abs((await anchor(page, 'ref-ring'))!.x - (await anchor(page, 'cup-a'))!.x)).toBeLessThan(15);
    await expect(readout(page, 'changed')).toHaveAttribute('data-state', 'more-than-one');
    await card(page).locator('[data-sim-control="against"] [data-sim-value="d"]').click();
    await expect.poll(async () => Math.abs((await anchor(page, 'ref-ring'))!.x - (await anchor(page, 'cup-d'))!.x)).toBeLessThan(15);
    await expect(readout(page, 'changed')).toHaveAttribute('data-state', 'warmth');
    await expect(readout(page, 'changed')).toContainText('Only the warmth');
    // The PLATE tail names the observed state and the card's control.
    await expect(page.locator('.space-plate__simstate')).toHaveAttribute('data-state', 'not-germinated');
    await expect(page.locator('.space-plate__simstate')).toContainText('CUP E');
  });

  test('three recorded temperatures draw a line that falls all the way; the flag moves with the median', async ({ page }) => {
    await open(page, 'ch=sample-timing', 'zh');
    await expect.poll(async () => (await anchor(page, 'day-marker'))?.shown).toBe(true);
    const day0 = (await anchor(page, 'day-marker'))!.x;
    for (const temp of [14, 17, 20]) {
      await set(page, { temp, 'count-day': 5 });
      await expect.poll(async () => (await sim(page)).outputs['half-day']).toBe({ 14: 9.4, 17: 6.5, 20: 4.3 }[temp]);
      await card(page).locator('[data-sim-record]').click();
    }
    await expect(card(page).locator('.space-try__table tbody tr')).toHaveCount(3);
    const line = card(page).locator('.space-chart[data-kind="line"] svg[role="img"]');
    await expect(line).toHaveAttribute('aria-label', /一直下降/);
    expect((await sim(page)).outputs.half).toBe('half-or-more');
    // The flag stands at day 4.3 on the strip (20 °C): between the marker at day 0 and at day 5.
    await expect.poll(async () => (await anchor(page, 'day-marker'))!.x - day0).toBeGreaterThan(20);
    // Let both eases settle.
    await expect.poll(async () => { const a = (await anchor(page, 'half-flag'))!.x; await page.waitForTimeout(300); return Math.abs((await anchor(page, 'half-flag'))!.x - a); }).toBeLessThan(0.5);
    const day5 = (await anchor(page, 'day-marker'))!.x;
    const flag = (await anchor(page, 'half-flag'))!.x;
    expect((flag - day0) / (day5 - day0)).toBeGreaterThan(0.75);
    expect((flag - day0) / (day5 - day0)).toBeLessThan(0.95);
  });

  test('the three-part fruit bursts and only its flow runs', async ({ page }) => {
    await open(page, 'ch=sample-dispersal&sim=fruit.wing');
    await expect.poll(() => flowOn(page, 'wind-drift')).toBe(true);
    expect(await flowOn(page, 'seed-burst')).toBe(false);
    await expect.poll(() => shown(page, 'burst-seeds')).toBe(true);
    const rest = (await anchor(page, 'burst-seeds'))!;
    await set(page, { fruit: 'burst' });
    await expect(readout(page, 'method')).toHaveAttribute('data-state', 'splitting');
    await expect.poll(() => flowOn(page, 'seed-burst')).toBe(true);
    await expect.poll(() => flowOn(page, 'wind-drift')).toBe(false);
    expect(await flowOn(page, 'water-drift')).toBe(false);
    // Thrown out toward the reader: lower on the screen than at rest.
    await expect.poll(async () => (await anchor(page, 'burst-seeds'))!.y - rest.y).toBeGreaterThan(15);
  });

  test('the PLATE reads only what the chapter observes', async ({ page }) => {
    await open(page, 'ch=sample-timing&sim=temp.14');
    const reading = (name: string) => page.locator('.space-plate__reading', { hasText: name });
    await expect(reading('HALF GERMINATED BY')).toContainText('9.4');
    await expect(reading('SEED TEST DAY')).toContainText('—');
    await open(page, 'ch=sample-cups&sim=day.7');
    await expect(reading('SEED TEST DAY')).toContainText('7');
    await expect(reading('HALF GERMINATED BY')).toContainText('—');
  });

  test('Chinese labels and the predict-then-observe card', async ({ page }) => {
    await open(page, 'ch=sample-cups', 'zh');
    await expect(readout(page, 'cup-result')).toContainText('刚放好');
    await card(page).locator('[data-predict="yes"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('发芽了');
    expect((await sim(page)).outputs['cup-result']).toBe('germinated');
  });

  test('on a phone the card works in the drawer with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=sample-cups');
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
});

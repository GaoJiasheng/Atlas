/** docs/46 §8.1: age brackets, evidence/material distinction, independent
 * controls, replayable links and access to the objects hidden by a beat. */
import { expect, test, type Page } from '@playwright/test';

type Anchor = { x: number; y: number; shown: boolean; onScreen: boolean } | null;
type FossilState = { chapter: string | null; part: string | null; beat: number | null; layers: string[]; camera: unknown; tints: { signal: string[]; cold: string[] } | null };
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, number | string>; try: { observe: string[] } | null; table: unknown[] };
  anchor(id: string): Anchor;
  setSim(values: Record<string, number | string | boolean>): boolean;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const snapshot = (page: Page) => page.evaluate(() => window.__atlas!.state() as unknown as FossilState);
const anchor = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).anchor(x), id);
const set = (page: Page, values: Record<string, number | string | boolean>) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).setSim(x), values);
const shown = async (page: Page, id: string) => (await anchor(page, id))?.shown ?? false;
const card = (page: Page) => page.locator('.space-try');
const choose = (page: Page, control: string, value: string) => card(page).locator(`[data-sim-control="${control}"] [data-sim-value="${value}"]`).click();
const inventory = async (page: Page) => {
  const o = (await sim(page)).outputs;
  return ['direct-count', 'comparison-count', 'inferred-count', 'visible-count'].map((k) => o[k]);
};
async function ready(page: Page) {
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect(page.locator('.atlas-stage canvas').first()).toBeVisible();
}
async function open(page: Page, query: string, lang = 'en') {
  await page.goto(`/${lang}/topics/fossils-and-skeletons/?${query}`);
  await ready(page);
}
const DIRECT = ['sk-skull', 'sk-jaw', 'sk-trunk', 'sk-pelvis', 'sk-arm-l', 'sk-leg-l', 'sk-leg-r'];
const COMPARISON = ['sk-neck', 'sk-ribs', 'sk-arm-r'];
const INFERRED = ['sk-tail-base', 'sk-tail-tip'];

test.describe('fossils-and-skeletons', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('background has the reading caveat and 36 beats, with no unrelated age card', async ({ page }) => {
    await open(page, 'ch=before-you-start');
    await expect(page.locator('.atlas-note')).toContainText('Not a museum specimen inventory');
    await expect(page.locator('.atlas-axis')).toContainText('BG');
    await expect(card(page)).toHaveCount(0);
    expect(await page.evaluate(() => window.__atlas!.beats())).toHaveLength(36);
    expect((await sim(page)).try).toBeNull();
  });

  test('wide and precise retain the same central bracket while only the outer envelope narrows; records replace the same choice', async ({ page }) => {
    await open(page, 'ch=ash-beds-and-ages');
    const bracket = async () => {
      const o = (await sim(page)).outputs;
      return ['bracket-young', 'bracket-old', 'bracket-width', 'envelope-young', 'envelope-old'].map((k) => o[k]);
    };
    expect(await bracket()).toEqual([148, 150, 2, 147.8, 150.2]);
    await expect(card(page)).toContainText('SIM');
    await expect(card(page)).toContainText('not a confidence interval');
    await expect(card(page).locator('[data-sim-output]')).toHaveCount(5);
    await card(page).locator('[data-sim-record]').click();
    await choose(page, 'ash-case', 'precise');
    await expect.poll(bracket).toEqual([148, 150, 2, 147.95, 150.05]);
    await expect(card(page).locator('[data-sim-output="bracket-width"]')).toContainText('2.00');
    await card(page).locator('[data-sim-record]').click();
    await choose(page, 'ash-case', 'wide');
    await card(page).locator('[data-sim-record]').click();
    await expect(card(page).locator('tbody tr')).toHaveCount(2);
    expect((await sim(page)).table).toHaveLength(2);
    expect(await set(page, { 'ash-case': 'not-a-case' })).toBe(false);
    expect((await sim(page)).values['ash-case']).toBe('wide');
  });

  test('direct keeps the documented cast skull, hides precisely five modules, and whole restores them', async ({ page }) => {
    await open(page, 'ch=rebuilding-evidence');
    expect(await inventory(page)).toEqual([7, 3, 2, 12]);
    await expect.poll(() => shown(page, 'sk-tail-tip')).toBe(true);
    const tail = (await anchor(page, 'sk-tail-tip'))!;
    await choose(page, 'evidence-view', 'direct');
    await expect.poll(() => inventory(page)).toEqual([7, 3, 2, 7]);
    for (const id of DIRECT) await expect.poll(() => shown(page, id)).toBe(true);
    for (const id of [...COMPARISON, ...INFERRED]) await expect.poll(() => shown(page, id)).toBe(false);
    // The old tail location must no longer hit the hidden tail mesh.
    const stage = (await page.locator('.atlas-stage').boundingBox())!;
    await page.mouse.click(stage.x + tail.x, stage.y + tail.y);
    expect(INFERRED).not.toContain((await snapshot(page)).part);
    await page.locator('.space-index [data-part="sk-skull"]').click();
    await expect(page.locator('.space-inspector')).toContainText(/cast|replica/i);
    await choose(page, 'evidence-view', 'whole');
    await expect.poll(() => inventory(page)).toEqual([7, 3, 2, 12]);
    for (const id of [...COMPARISON, ...INFERRED]) await expect.poll(() => shown(page, id)).toBe(true);
    await page.locator('.space-index [data-part="sk-tail-tip"]').click();
    await expect(page.locator('.space-index [data-part="sk-tail-tip"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('all nine control combinations stay independent; off-station bindings do not reveal skeletons', async ({ page }) => {
    await open(page, 'ch=rebuilding-evidence');
    for (const [ash, width] of [['wide', 2], ['close', 0.8], ['precise', 2]] as const) {
      for (const [evidence, visible] of [['whole', 12], ['supported', 10], ['direct', 7]] as const) {
        expect(await set(page, { 'ash-case': ash, 'evidence-view': evidence })).toBe(true);
        await expect.poll(() => inventory(page)).toEqual([7, 3, 2, visible]);
        expect((await sim(page)).outputs['bracket-width']).toBeCloseTo(width, 8);
      }
    }
    await page.evaluate(() => window.__atlas!.goToChapter('ash-beds-and-ages', { instant: true }));
    await set(page, { 'evidence-view': 'whole' });
    for (const id of DIRECT) await expect.poll(() => shown(page, id)).toBe(false);
    await expect.poll(() => shown(page, 'ash-low')).toBe(true);
  });

  test('age beat deep link preserves close, camera, layers and highlight through theme, language and reload', async ({ page }) => {
    await open(page, 'ch=ash-beds-and-ages&b=4');
    await expect.poll(async () => (await sim(page)).values['ash-case']).toBe('close');
    const state = await snapshot(page);
    expect(state.layers).toEqual(['age-section']);
    expect(state).toMatchObject({ chapter: 'ash-beds-and-ages', beat: 3, tints: { signal: ['fossil-bed'] } });
    for (const theme of ['cinema', 'paper'] as const) {
      await page.evaluate((x) => window.__atlas!.setTheme(x), theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      expect((await sim(page)).values['ash-case']).toBe('close');
    }
    await page.getByRole('button', { name: 'Language', exact: true }).click();
    await page.locator('[data-dd-item="zh"]').click();
    await ready(page);
    await expect.poll(async () => (await sim(page)).values['ash-case']).toBe('close');
    expect(page.url()).toContain('/zh/topics/fossils-and-skeletons/');
    await expect(card(page)).toContainText('试一试');
    await page.reload();
    await ready(page);
    await expect.poll(async () => (await sim(page)).values['ash-case']).toBe('close');
    const restored = await snapshot(page);
    expect(restored).toMatchObject({ chapter: state.chapter, beat: state.beat, layers: state.layers, camera: state.camera, tints: { signal: ['fossil-bed'] } });
    await expect.poll(async () => (await anchor(page, 'fossil-bed'))?.onScreen).toBe(true);
  });

  test('explicit whole overrides the direct beat on entry and reload; chapter defaults clear an old filter', async ({ page }) => {
    await open(page, 'ch=rebuilding-evidence&b=4&sim=evidence-view.whole');
    await expect.poll(() => inventory(page)).toEqual([7, 3, 2, 12]);
    await expect.poll(() => shown(page, 'sk-tail-tip')).toBe(true);
    await page.reload();
    await ready(page);
    await expect.poll(() => inventory(page)).toEqual([7, 3, 2, 12]);
    await set(page, { 'evidence-view': 'direct', 'ash-case': 'precise' });
    await expect.poll(() => inventory(page)).toEqual([7, 3, 2, 7]);
    await page.evaluate(() => window.__atlas!.goToChapter('before-you-start', { instant: true }));
    await page.evaluate(() => window.__atlas!.goToChapter('rebuilding-evidence', { instant: true }));
    await expect.poll(() => inventory(page)).toEqual([7, 3, 2, 12]);
    expect((await sim(page)).values).toMatchObject({ 'ash-case': 'wide', 'evidence-view': 'whole' });
    await expect.poll(() => shown(page, 'sk-tail-tip')).toBe(true);
  });

  test('an index can select a hidden tail; its explicit model link reveals and selects it', async ({ page }) => {
    await open(page, 'ch=rebuilding-evidence&b=4');
    await expect.poll(() => shown(page, 'sk-tail-tip')).toBe(false);
    await expect(page.locator('.space-index [data-part]')).toHaveCount(12);
    await page.locator('.space-index [data-part="sk-tail-tip"]').click();
    await expect(page.locator('.space-inspector')).toBeVisible();
    expect((await snapshot(page)).part).toBe('sk-tail-tip');
    expect(await shown(page, 'sk-tail-tip')).toBe(false);
    await page.locator('a[href="?ch=rebuilding-evidence&b=1&part=sk-tail-tip"]:visible').click();
    await ready(page);
    await expect.poll(() => shown(page, 'sk-tail-tip')).toBe(true);
    expect((await snapshot(page)).part).toBe('sk-tail-tip');
    expect((await sim(page)).values['evidence-view']).toBe('whole');
  });

  test('all 33 objects can be selected in their chapter index and revealed by the model links', async ({ page }) => {
    test.setTimeout(360_000);
    const checked = new Set<string>();
    for (const chapter of ['body-track-leaf', 'buried-to-exposed', 'ash-beds-and-ages', 'rebuilding-evidence', 'birds-are-dinosaurs', 'singapore-skeletons']) {
      await open(page, `ch=${chapter}`);
      const ids = await page.locator('.space-index [data-part]').evaluateAll((els) => els.map((el) => el.getAttribute('data-part')!));
      for (const id of ids) {
        await page.locator(`.space-index [data-part="${id}"]`).click();
        expect((await snapshot(page)).part).toBe(id);
        await expect(page.locator('.space-inspector')).toBeVisible();
        await page.locator(`a[href^="?ch="][href$="&part=${id}"]:visible`).click();
        await ready(page);
        await expect.poll(() => shown(page, id)).toBe(true);
        expect((await snapshot(page)).part).toBe(id);
        checked.add(id);
      }
    }
    expect(checked.size).toBe(33);
  });

  test('phone Chinese cinema: both cards fit the reading drawer and retain 44 px controls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [ch, control, choice] of [['ash-beds-and-ages', 'ash-case', 'precise'], ['rebuilding-evidence', 'evidence-view', 'direct']]) {
      await open(page, `ch=${ch}&theme=cinema`, 'zh');
      await page.getByRole('button', { name: '阅读', exact: true }).click();
      const pick = card(page).locator(`[data-sim-control="${control}"] [data-sim-value="${choice}"]`);
      await pick.scrollIntoViewIfNeeded();
      await pick.click();
      await expect(card(page)).toContainText('试一试');
      const record = card(page).locator('[data-sim-record]');
      await record.scrollIntoViewIfNeeded();
      await record.click();
      for (const target of [pick, record]) expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await expect(card(page).locator('tbody tr')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'cinema');
    }
  });
});

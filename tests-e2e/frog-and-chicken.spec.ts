/** docs/56: ordinal table controls, shell truth table, isolated beats and accessible specimens.
 * Run externally after build: ATLAS_E2E_PORT=5444 pnpm e2e frog-and-chicken.spec.ts
 * Browser gates are deliberately not executed by the build sandbox.
 */
import { expect, test, type Page } from '@playwright/test';

type Values = Record<string, string | number | boolean>;
type Anchor = { x: number; y: number; shown: boolean; onScreen: boolean };
type Engine = {
  sim(): { values: Values; outputs: Record<string, unknown> };
  setSim(values: Values): boolean;
  apply(patch: Record<string, unknown>): boolean;
  anchor(id: string): Anchor | null;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, values: Values) => page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const anchor = (page: Page, id: string) => page.evaluate((id) => (window.__atlas!.engine as unknown as Engine).anchor(id), id);
const apply = (page: Page, patch: Record<string, unknown>) => page.evaluate((p) => (window.__atlas!.engine as unknown as Engine).apply(p), patch);
const card = (page: Page) => page.locator('.space-try');
const readout = (page: Page, id: string) => card(page).locator(`[data-sim-output="${id}"]`);
async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/frog-and-chicken/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
async function stableAnchor(page: Page, id: string) {
  let previous: Anchor | null = null;
  let current: Anchor | null = null;
  await expect.poll(async () => {
    current = await anchor(page, id);
    const stable = current && previous && current.shown && current.onScreen && Math.hypot(current.x - previous.x, current.y - previous.y) < 0.1;
    previous = current;
    return Boolean(stable);
  }, { intervals: [150] }).toBe(true);
  return current!;
}

test.describe('frog-and-chicken', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

  test('background explains independent sizes and next generations, with thirty static beats', async ({ page }) => {
    await open(page, 'ch=before-you-start');
    await expect(page.locator('.atlas-note')).toContainText(/observation model|development forecast/i);
    await expect(page.locator('.atlas-axis__tick')).toHaveCount(30);
    expect(await page.evaluate(() => window.__atlas!.chapters())).toHaveLength(6);
    await expect(card(page)).toHaveCount(0);
    expect(await page.evaluate(() => window.__atlas!.state())).toMatchObject({ run: false, explode: 0, cutaway: 'none' });
    await expect(page.locator('.space-cy-card')).toHaveCount(0);
  });

  test('the five frog observations select stable markers; adult clamps at the final option', async ({ page }) => {
    await open(page, 'ch=eggs-and-tadpoles');
    const points: Anchor[] = [];
    for (const view of ['egg', 'tadpole', 'hind-legs', 'froglet', 'adult']) {
      await card(page).locator(`[data-sim-control="frog-view"] [data-sim-value="${view}"]`).click();
      await expect(readout(page, 'frog-form')).toHaveAttribute('data-state', view);
      points.push(await stableAnchor(page, 'frog-marker'));
    }
    expect(new Set(points.map((p) => `${p.x},${p.y}`)).size).toBe(5);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press(']');
    await expect.poll(async () => (await sim(page)).values['frog-view']).toBe('adult');
    await expect(page).toHaveURL(/frog-view\.adult/);
  });

  for (const openEgg of [false, true]) for (const fertilised of [false, true]) {
    test(`egg window ${openEgg}, fertilised ${fertilised}: drawn embryo agrees with the independent truth table`, async ({ page }) => {
      await open(page, `ch=inside-the-egg&sim=egg-open.${openEgg ? 'on' : 'off'}~fertilised.${fertilised ? 'on' : 'off'}`);
      expect((await sim(page)).outputs).toMatchObject({
        'egg-view': openEgg ? 'open' : 'closed',
        'embryo-view': openEgg && fertilised ? 'shown' : 'hidden',
        'egg-condition': fertilised ? 'fertilised' : 'unfertilised',
      });
      await expect.poll(async () => (await anchor(page, 'egg-embryo'))?.shown).toBe(openEgg && fertilised);
      await expect(card(page).locator('[data-sim-control="egg-open"] [role="switch"]')).toHaveAttribute('aria-checked', String(openEgg));
      await expect(readout(page, 'egg-condition')).toHaveAttribute('data-state', fertilised ? 'fertilised' : 'unfertilised');
      if (!fertilised) await expect(readout(page, 'egg-condition')).toContainText('warmth does not fertilise');
    });
  }

  test('beat four to five restores fertilisation, and backward to beat one closes the shell', async ({ page }) => {
    await open(page, 'ch=inside-the-egg&b=4');
    expect((await sim(page)).outputs['embryo-view']).toBe('hidden');
    await page.locator('.atlas-axis__tick[data-beat="inside-the-egg.4"]').click();
    await expect.poll(async () => (await sim(page)).outputs['embryo-view']).toBe('shown');
    await expect.poll(async () => (await anchor(page, 'egg-embryo'))?.shown).toBe(true);
    await page.locator('.atlas-axis__tick[data-beat="inside-the-egg.0"]').click();
    await expect.poll(async () => (await sim(page)).outputs['egg-view']).toBe('closed');
    await expect.poll(async () => (await anchor(page, 'egg-embryo'))?.shown).toBe(false);
  });

  test('chapter navigation restores controls, hidden groups and shell after manual changes', async ({ page }) => {
    await open(page, 'ch=inside-the-egg&sim=egg-open.on~fertilised.off');
    await apply(page, { ghosted: ['chicken-cycle'], hidden: ['egg-embryo'], pose: 'egg-window-open' });
    await page.evaluate(() => window.__atlas!.goToChapter('eggs-and-tadpoles', { instant: true }));
    expect((await sim(page)).values).toMatchObject({ 'frog-view': 'egg', 'egg-open': false, fertilised: true });
    await expect.poll(async () => (await anchor(page, 'frog-eggs'))?.shown).toBe(true);
    await expect.poll(async () => (await anchor(page, 'chicken-egg'))?.shown).toBe(false);
    await page.evaluate(() => window.__atlas!.goToChapter('inside-the-egg', { instant: true }));
    expect((await sim(page)).outputs['egg-view']).toBe('closed');
    await expect.poll(async () => (await anchor(page, 'chicken-egg'))?.shown).toBe(true);
    await expect.poll(async () => (await anchor(page, 'frog-eggs'))?.shown).toBe(false);
  });

  test('a hidden embryo remains hidden when the table says shown; ghost does not restore a hidden part', async ({ page }) => {
    await open(page, 'ch=inside-the-egg&sim=egg-open.on');
    await expect.poll(async () => (await anchor(page, 'egg-embryo'))?.shown).toBe(true);
    await apply(page, { hidden: ['egg-embryo'], ghosted: ['chicken-cycle'] });
    await set(page, { fertilised: false });
    await set(page, { fertilised: true });
    expect((await sim(page)).outputs['embryo-view']).toBe('shown');
    await expect.poll(async () => (await anchor(page, 'egg-embryo'))?.shown).toBe(false);
    await apply(page, { hidden: [], ghosted: [] });
    await expect.poll(async () => (await anchor(page, 'egg-embryo'))?.shown).toBe(true);
  });

  test('beat deep link, reload, axis and keyboard reconstruct the same shell and marker', async ({ page }) => {
    await open(page, 'ch=inside-the-egg&b=2');
    const linked = await sim(page);
    const spot = await stableAnchor(page, 'chicken-marker');
    const camera = await page.evaluate(() => window.__atlas!.state().camera);
    await page.reload();
    await page.waitForFunction(() => window.__atlas !== undefined);
    await expect.poll(() => sim(page)).toEqual(linked);
    await page.locator('.atlas-axis__tick[data-beat="inside-the-egg.0"]').click();
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('.');
    await expect.poll(() => sim(page)).toEqual(linked);
    expect(await page.evaluate(() => window.__atlas!.state().camera)).toEqual(camera);
    const after = await stableAnchor(page, 'chicken-marker');
    expect(Math.hypot(after.x - spot.x, after.y - spot.y)).toBeLessThan(2);
    await open(page, 'ch=inside-the-egg&b=2&sim=egg-open.off');
    expect((await sim(page)).outputs['egg-view']).toBe('closed');
  });

  test('comparison chooses four distinct marker positions and links to the existing topics', async ({ page }) => {
    await open(page, 'ch=cycles-compared');
    const spots: Anchor[] = [];
    for (const view of ['frog', 'chicken', 'mosquito', 'plant']) {
      await card(page).locator(`[data-sim-control="compare-view"] [data-sim-value="${view}"]`).click();
      await expect(readout(page, 'comparison')).toHaveAttribute('data-state', view);
      spots.push(await stableAnchor(page, 'comparison-marker'));
    }
    expect(new Set(spots.map((p) => `${p.x},${p.y}`)).size).toBe(4);
    await expect(page.locator('a[href*="/en/topics/mosquito/"]').first()).toBeAttached();
    await expect(page.locator('a[href*="/en/topics/plant/"]').first()).toBeAttached();
  });

  test('index selection opens real specimen details in reading-panel order', async ({ page }) => {
    await open(page, 'ch=the-changing-frog');
    const button = page.locator('.space-index__row[data-part="frog-froglet"]');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.space-inspector__summary')).toBeVisible();
    await expect.poll(async () => (await anchor(page, 'frog-froglet'))?.shown).toBe(true);
    await page.locator('.space-inspector__more').click();
    await expect(page.locator('.space-inspector__detail')).toBeVisible();
  });

  test('Chinese cinema and reduced motion preserve the static egg explanation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'ch=inside-the-egg&b=4&theme=cinema', 'zh');
    await expect(card(page)).toContainText('试一试');
    await expect(readout(page, 'egg-condition')).toContainText('温暖不会使它受精');
    await expect.poll(async () => (await anchor(page, 'egg-embryo'))?.shown).toBe(false);
    await page.locator('.atlas-axis__tick[data-beat="inside-the-egg.4"]').click();
    await expect.poll(async () => (await anchor(page, 'egg-embryo'))?.shown).toBe(true);
    expect((await sim(page)).values.fertilised).toBe(true);
  });

  test('phone drawer offers 44 px controls without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=cycles-compared');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    for (const option of await card(page).locator('[data-sim-control="compare-view"] button').all()) {
      await option.scrollIntoViewIfNeeded();
      const box = (await option.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
    }
    await card(page).locator('[data-sim-value="mosquito"]').click();
    await expect(readout(page, 'comparison')).toHaveAttribute('data-state', 'mosquito');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

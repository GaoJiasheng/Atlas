/**
 * The `living-things` topic (docs/38) in the browser: a deep link to the
 * animal flowchart puts all 32 specimens where the sort model says (on the
 * tray, back in the case, or hidden) and the flowchart card counts the same;
 * `]` asks the next question and the toy car moves; the classmate's tray
 * marks the wrong groups and moving the animals puts the dolphin with the
 * mammals; predict-first reveals that the mushroom stays in the case; the
 * microscope beat has a micrometre scale bar at ×2000; the flowchart card in
 * Chinese; on a phone the flowchart sits in the try-it card with 44 px targets.
 */
import { expect, test, type Page } from '@playwright/test';

type Shift = { offset: number[]; target: number[]; shown: boolean; delay: number } | null;
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, unknown> };
  shift(id: string): Shift;
  apply(patch: Record<string, unknown>): boolean;
};
const SPECIMENS = [
  'toy-car', 'pebble', 'plastic-flower', 'ixora', 'chilli-seedling', 'rhu-sapling', 'birds-nest-fern', 'staghorn-fern', 'moss',
  'mushroom', 'bracket-fungus', 'mouldy-bread', 'yeast', 'bacteria-dish', 'grasshopper', 'beetle', 'spider', 'javan-myna',
  'penguin', 'plantain-squirrel', 'fruit-bat', 'dolphin', 'pangolin', 'snakehead', 'guppy', 'mudskipper', 'shark',
  'tree-frog', 'asian-toad', 'house-gecko', 'python', 'hawksbill-turtle',
];

async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/living-things/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const shift = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).shift(x), id);
const card = (page: Page) => page.locator('.space-key-card .space-key');
const tryCard = (page: Page) => page.locator('.space-try');

/** Every specimen drawn where the model puts it (± 1 mm), and hidden when it is not on this tray. */
async function inSlots(page: Page): Promise<string[]> {
  const v = (await sim(page)).outputs.slots as Record<string, number>;
  const bad: string[] = [];
  for (const id of SPECIMENS) {
    const got = await shift(page, id);
    const shown = v[`${id}:shown`] === 1;
    const want = [v[`${id}:x`]!, v[`${id}:y`]!, v[`${id}:z`]!];
    if (!got) bad.push(`${id}: none`);
    else if (got.shown !== shown) bad.push(`${id}: shown ${got.shown}`);
    else if (shown && got.offset.some((x, i) => Math.abs(x - want[i]!) > 0.001)) bad.push(`${id}: ${got.offset.join()} ≠ ${want.join()}`);
  }
  return bad;
}

test.describe('living-things (classifying living things)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a deep link to the fourth animal question: every specimen in place, the dolphin with the fish', async ({ page }) => {
    await open(page, 'ch=animal-groups&sim=tray.animals~asked-animal.4');
    await expect.poll(() => inSlots(page), { timeout: 15_000 }).toEqual([]);
    // Plants, fungi and the things that are not alive are not on this tray.
    for (const id of ['ixora', 'mushroom', 'toy-car']) expect((await shift(page, id))!.shown).toBe(false);
    const out = (await sim(page)).outputs;
    expect(out['count-u']).toBe(7);
    expect(out['where-dolphin']).toBe('d');
    await expect(card(page)).toHaveAttribute('data-kind', 'chain');
    await expect(card(page).locator('[data-leaf="d"]')).toHaveAttribute('data-count', '5');
    await expect(card(page).locator('[data-node][data-pending]')).toHaveCount(2);
  });

  test('] asks the next question: the toy car joins the animals, then leaves them', async ({ page }) => {
    await open(page, 'ch=alive-or-not');
    await expect.poll(async () => (await sim(page)).outputs['count-u']).toBe(7);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press(']');
    await expect.poll(async () => (await sim(page)).values['q-alive']).toBe('moves');
    await expect(page).toHaveURL(/sim=q-alive\.moves/);
    expect((await sim(page)).outputs['where-toy-car']).toBe('a');
    await page.keyboard.press(']');
    await page.keyboard.press(']');
    await expect.poll(async () => (await sim(page)).values['q-alive']).toBe('grows');
    expect((await sim(page)).outputs['where-toy-car']).toBe('b');
    await expect.poll(() => inSlots(page), { timeout: 15_000 }).toEqual([]);
  });

  test("the classmate's tray: five groups marked wrong; moved, the dolphin is with the mammals", async ({ page }) => {
    await open(page, 'ch=classified-wrongly');
    await expect(card(page)).toHaveAttribute('data-kind', 'arrangement');
    await expect(card(page).locator('[data-wrong]')).toHaveCount(5);
    expect((await sim(page)).outputs.wrong).toBe(7);
    await tryCard(page).locator('[data-sim-control="fix"] [role="switch"]').click();
    await expect.poll(async () => (await sim(page)).outputs.wrong).toBe(0);
    await expect(card(page).locator('[data-wrong]')).toHaveCount(0);
    expect((await sim(page)).outputs['where-dolphin']).toBe('c');
    await expect.poll(() => inSlots(page), { timeout: 15_000 }).toEqual([]);
  });

  test('predict first: the mushroom stays in the case when the plants move', async ({ page }) => {
    await open(page, 'ch=four-big-groups');
    await tryCard(page).locator('[data-predict="with-plants"]').click();
    await expect(tryCard(page).locator('.space-try__reveal')).toContainText('Observed: In the case');
    expect((await sim(page)).outputs['count-a']).toBe(4);
  });

  test('the microscope beat: yeast and bacteria with a micrometre scale bar at ×2000', async ({ page }) => {
    await open(page, 'ch=four-big-groups&b=5');
    await expect(page.locator('.space-gscale__label')).toHaveText(/^\d+ µm · ×2000$/);
  });

  test('Chinese: the animal flowchart in words', async ({ page }) => {
    await open(page, 'ch=animal-groups&sim=tray.animals~asked-animal.6', 'zh');
    await expect(card(page)).toHaveAttribute('aria-label', /^这个模型里的分类流程图：六条腿、身体分三部分？是：A 组，2 件。/);
    await expect(card(page).locator('[data-leaf="x"]')).toHaveAttribute('data-count', '2');
  });

  test('on a phone the flowchart sits in the try-it card with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=make-a-flowchart');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    const inCard = page.locator('.space-try__diagram .space-key');
    await inCard.scrollIntoViewIfNeeded();
    await expect(inCard).toBeVisible();
    await expect(inCard).toHaveAttribute('data-kind', 'two');
    const option = page.locator('.space-try [data-sim-control="first"] [data-sim-value="can-fly"]');
    await option.scrollIntoViewIfNeeded();
    expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await option.click();
    await expect(inCard.locator('[data-leaf="a"]')).toHaveAttribute('data-count', '4');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

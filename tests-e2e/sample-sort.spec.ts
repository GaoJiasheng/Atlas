/**
 * SpaceScene sort engine (docs/38 §4, E-LT1–E-LT5) on the placeholder bench
 * `sample-sort`: a deep link puts every specimen in its slot at once (the
 * stage's shift = the model's slots); `]` asks another question and the
 * specimens move on a lifted arc, one after another; a chain takes more out
 * of the case with each question and lights one more box on the flowchart
 * card; specimens off the tray are hidden; the classmate's tray shows ✗ on
 * the groups with a wrong one and moving them puts each right; a leaf
 * selects its pad; the card in words in Chinese; the µm scale bar; on a
 * phone the flowchart sits in the try-it card in the drawer with 44 px
 * targets.
 */
import { expect, test, type Page } from '@playwright/test';

type Shift = { offset: number[]; target: number[]; shown: boolean; delay: number } | null;
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, unknown> };
  shift(id: string): Shift;
  anchor(id: string): { shown: boolean } | null;
  apply(patch: Record<string, unknown>): boolean;
};
const SPECIMENS = ['sample-ball', 'sample-bead', 'sample-ring', 'sample-cube', 'sample-brick', 'sample-tile', 'sample-cone', 'sample-spike'];

async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/sample-sort/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const shift = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).shift(x), id);
const anchor = (page: Page, id: string) => page.evaluate((x) => (window.__atlas!.engine as unknown as Engine).anchor(x), id);
const slot = (outputs: Record<string, unknown>, id: string) => {
  const v = outputs.slots as Record<string, number>;
  return { offset: [v[`${id}:x`]!, v[`${id}:y`]!, v[`${id}:z`]!], shown: v[`${id}:shown`] === 1 };
};
const card = (page: Page) => page.locator('.space-key-card .space-key');
/** Every specimen drawn where the model puts it (± 1 mm) and hidden where it says so. */
async function inSlots(page: Page): Promise<string[]> {
  const out = (await sim(page)).outputs;
  const bad: string[] = [];
  for (const id of SPECIMENS) {
    const want = slot(out, id);
    const got = await shift(page, id);
    if (!got) bad.push(`${id}: none`);
    else if (got.shown !== want.shown) bad.push(`${id}: shown ${got.shown}`);
    else if (want.shown && got.offset.some((x, i) => Math.abs(x - want.offset[i]!) > 0.001)) bad.push(`${id}: ${got.offset.join()} ≠ ${want.offset.join()}`);
  }
  return bad;
}

test.describe('sample-sort (SpaceScene sort model)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a deep link puts every specimen in its slot at once; the card draws one question', async ({ page }) => {
    await open(page, 'ch=one-question&sim=tray.one~q-one.round');
    await expect.poll(() => inSlots(page), { timeout: 10_000 }).toEqual([]);
    // A jump, not a move: no specimen waited for a turn.
    for (const id of SPECIMENS) expect((await shift(page, id))!.delay).toBe(0);
    await expect(card(page)).toHaveAttribute('data-kind', 'ask');
    await expect(card(page).locator('[data-leaf="a"]')).toHaveAttribute('data-count', '3');
    await expect(card(page).locator('[data-leaf="b"]')).toHaveAttribute('data-count', '5');
    await expect(card(page)).toHaveAttribute('aria-label', 'Flowchart in this model: Round all over? Yes: group A, 3. No: group B, 5.');
    expect((await sim(page)).outputs['where-ball']).toBe('a');
  });

  test('] asks a question: the specimens move on a lifted arc, one after another', async ({ page }) => {
    await open(page, 'ch=one-question');
    await expect.poll(() => inSlots(page), { timeout: 10_000 }).toEqual([]);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press(']');
    await expect.poll(async () => (await sim(page)).values['q-one']).toBe('round');
    await expect(page).toHaveURL(/sim=q-one\.round/);
    // Lifted: the cube goes from its case cell (y 0) to the pad (just below 0); somewhere on the way it is well above both.
    let top = -Infinity;
    for (let i = 0; i < 60 && top < 0.02; i++) {
      top = Math.max(top, (await shift(page, 'sample-cube'))!.offset[1]!);
      await page.waitForTimeout(20);
    }
    expect(top).toBeGreaterThan(0.02);
    // Staggered in the vector's order: the k-th to move waits k × 0.03 s.
    const delays = await Promise.all(SPECIMENS.map(async (id) => (await shift(page, id))!.delay));
    expect(delays.map((d) => Math.round(d * 100) / 100)).toEqual([0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21]);
    await expect.poll(() => inSlots(page), { timeout: 10_000 }).toEqual([]);
  });

  test('a chain: each question takes some out of the case and lights one more box', async ({ page }) => {
    await open(page, 'ch=in-turn');
    await expect(card(page)).toHaveAttribute('data-kind', 'chain');
    // The bead is not on this tray: hidden, no label.
    await expect.poll(async () => (await shift(page, 'sample-bead'))?.shown).toBe(false);
    expect((await anchor(page, 'sample-bead'))?.shown ?? false).toBe(false);
    const left = async () => (await sim(page)).outputs['count-u'];
    expect(await left()).toBe(7);
    await expect(card(page).locator('[data-node][data-pending]')).toHaveCount(2);
    await page.locator('.space-try [data-sim-control="asked"] button[aria-label$="Next value"]').click();
    await expect.poll(left).toBe(5);
    await expect(card(page).locator('[data-node][data-pending]')).toHaveCount(1);
    await expect(card(page).locator('[data-leaf="a"]')).toHaveAttribute('data-count', '2');
    await page.locator('.space-try [data-sim-control="asked"] button[aria-label$="Next value"]').click();
    await expect.poll(left).toBe(0);
    await expect(card(page).locator('[data-node][data-pending]')).toHaveCount(0);
    await expect(card(page).locator('[data-leaf="c"]')).toHaveAttribute('data-count', '2');
    await expect.poll(() => inSlots(page), { timeout: 10_000 }).toEqual([]);
  });

  test("the classmate's tray: ✗ on the wrong groups; moved, every one is right", async ({ page }) => {
    await open(page, 'ch=classmate');
    await expect(card(page)).toHaveAttribute('data-kind', 'arrangement');
    await expect(card(page).locator('[data-wrong]')).toHaveCount(3);
    await expect(card(page).locator('[data-leaf="b"]')).toContainText('✗ 1 wrong');
    expect((await sim(page)).outputs.verdict).toBe('wrong');
    await expect(page.locator('.space-try [data-sim-output="belongs"]')).toHaveAttribute('data-state', 'round');
    const before = (await shift(page, 'sample-ring'))!.target;
    await page.locator('.space-try [data-sim-control="fix"] [role="switch"]').click();
    await expect.poll(async () => (await sim(page)).outputs.wrong).toBe(0);
    await expect(card(page).locator('[data-wrong]')).toHaveCount(0);
    await expect.poll(async () => (await shift(page, 'sample-ring'))!.target.join()).not.toBe(before.join());
    await expect.poll(() => inSlots(page), { timeout: 10_000 }).toEqual([]);
  });

  test('a leaf selects its pad; the selected specimen\'s way is drawn; 44 px leaves', async ({ page }) => {
    await open(page, 'ch=classmate');
    const leaf = card(page).locator('[data-leaf="b"]');
    await leaf.click();
    await expect.poll(() => page.evaluate(() => (window.__atlas!.state() as unknown as { part: string | null }).part)).toBe('pad-3b');
    for (const t of await card(page).locator('.space-key__target').all()) {
      const box = (await t.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    // The ring selected: it sits in B (boxy) but belongs with the round ones.
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).apply({ part: 'sample-ring' }));
    await expect(leaf).toHaveAttribute('data-on', 'true');
    await expect(leaf).toHaveAttribute('aria-current', 'true');
    await expect(leaf).toContainText('Belongs in: Round things');
  });

  test('a chain: the selected specimen\'s way down is drawn in signal', async ({ page }) => {
    await open(page, 'ch=in-turn&sim=tray.chain~asked.2');
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).apply({ part: 'sample-cone' }));
    // The cone: no to round, yes to tall, into B.
    await expect(card(page).locator('[data-node][data-on]')).toHaveCount(2);
    await expect(card(page).locator('[data-line="no-0"]')).toHaveAttribute('data-on', 'true');
    await expect(card(page).locator('[data-line="yes-1"]')).toHaveAttribute('data-on', 'true');
    await expect(card(page).locator('[data-leaf="b"]')).toHaveAttribute('data-on', 'true');
  });

  test('Chinese: the classmate\'s card in words', async ({ page }) => {
    await open(page, 'ch=classmate', 'zh');
    await expect(card(page)).toHaveAttribute('aria-label', '这个模型里的分类流程图：A 组，3 件，圆的东西，1 件放错；B 组，3 件，方的东西，1 件放错；C 组，2 件，尖的东西，1 件放错。');
  });

  test('the magnified cell has a micrometre scale bar', async ({ page }) => {
    await open(page, 'ch=before-you-start&b=2');
    await expect(page.locator('.space-gscale__label')).toHaveText(/^\d+ µm · ×5000$/);
  });

  test('on a phone the flowchart sits in the try-it card with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=two-questions');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    const inCard = page.locator('.space-try__diagram .space-key');
    await inCard.scrollIntoViewIfNeeded();
    await expect(inCard).toBeVisible();
    await expect(inCard).toHaveAttribute('data-kind', 'two');
    const box = (await inCard.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    const target = inCard.locator('[data-leaf="a"] .space-key__target');
    expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const option = page.locator('.space-try [data-sim-control="first"] [data-sim-value="shiny"]');
    await option.scrollIntoViewIfNeeded();
    expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await option.click();
    await expect(inCard.locator('[data-leaf="a"]')).toHaveAttribute('data-count', '4');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

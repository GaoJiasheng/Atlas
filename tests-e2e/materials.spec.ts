/**
 * The materials topic (docs/37): deep links show the model's outcomes and the
 * drawn bench agrees with them (snapped strips and fallen masses, the bend
 * eased to the model's sag at full length, the peg on the strip's end, float
 * levels, the drop and the damp patch, shadow darkness); the five-test table
 * reads in words, never in material numbers; predictions reveal without
 * grading; the Chinese page uses 塑料; the phone drawer keeps 44 px targets;
 * the topics that point here link to it.
 */
import { expect, test, type Page } from '@playwright/test';

type Bend = { value: number; mid: [number, number, number]; tip: [number, number, number]; length: number; shown: boolean };
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, number | string> };
  bend(id: string): Bend | null;
  anchor(id: string): { x: number; y: number; shown: boolean } | null;
  shadows(): Record<string, { casters: Record<string, { dark: number }> }>;
  setSim(values: Record<string, number | string | boolean>): boolean;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const bend = (page: Page, id: string) => page.evaluate((part) => (window.__atlas!.engine as unknown as Engine).bend(part), id);
const anchor = (page: Page, id: string) => page.evaluate((part) => (window.__atlas!.engine as unknown as Engine).anchor(part), id);
const shadows = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).shadows());
const set = (page: Page, values: Record<string, number | string | boolean>) => page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const card = (page: Page) => page.locator('.space-try');
async function open(page: Page, query: string, lang = 'en') {
  await page.goto(`/${lang}/topics/materials/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(() => bend(page, 'bridge-wood')).not.toBeNull();
}
// Strips rest on 6 cm blocks (centre line 6.1 cm up) and in a 15 cm clamp (15.1 cm); the peg's foot starts on the strip's top.
const STRIP_Y = 0.061;
const CLAMP_Y = 0.151;
const PEG_FOOT = 0.152;

test.describe('materials', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('background chapter: reading note, BG axis segment, no card', async ({ page }) => {
    await open(page, 'ch=before-you-start');
    await expect(page.locator('.atlas-note')).toContainText('drawn life size');
    await expect(page.locator('.atlas-axis')).toContainText('BG');
    await expect(card(page)).toHaveCount(0);
  });

  test('strength: five masses on wood bend it a little at full length; glass snaps and the masses fall', async ({ page }) => {
    await open(page, 'ch=strength&sim=strip.wood~masses.5');
    let s = await sim(page);
    expect(s.outputs['strength-result']).toBe('holds');
    expect(s.outputs['strength-bend']).toBe('a-little');
    const sag = Number(s.outputs['bridge-sag']);
    await expect.poll(async () => Math.abs((await bend(page, 'bridge-wood'))!.value - sag)).toBeLessThan(0.0005);
    const wood = (await bend(page, 'bridge-wood'))!;
    expect(wood.mid[1]).toBeCloseTo(STRIP_Y - sag, 3);
    expect(Math.abs(wood.length - 0.3) / 0.3).toBeLessThan(0.005);
    await expect.poll(async () => (await anchor(page, 'bridge-masses'))?.shown).toBe(true);
    const held = (await anchor(page, 'bridge-masses'))!;
    await open(page, 'ch=strength&sim=strip.glass~masses.5');
    s = await sim(page);
    expect(s.outputs['bridge-view']).toBe('glass-snapped');
    await expect.poll(async () => (await anchor(page, 'bridge-glass-snapped'))?.shown).toBe(true);
    expect((await bend(page, 'bridge-glass'))!.shown).toBe(false);
    await expect(card(page).locator('[data-sim-output="strength-result"]')).toContainText('Snaps');
    await expect.poll(async () => (await anchor(page, 'bridge-masses'))!.y - held.y).toBeGreaterThan(10);
  });

  test('strength: rubber and fabric lie on the bench before any mass goes on', async ({ page }) => {
    for (const strip of ['rubber', 'fabric']) {
      await open(page, `ch=strength&sim=strip.${strip}~masses.0`);
      expect((await sim(page)).outputs['strength-result']).toBe('on-bench');
      await expect.poll(async () => (await bend(page, `bridge-${strip}`))!.value).toBeCloseTo(0.06, 4);
    }
  });

  test('flexibility: pushed 2 cm, the peg sits on the wooden strip’s end; ceramic snaps at the clamp', async ({ page }) => {
    await open(page, 'ch=flexibility&sim=strip.wood~push.2');
    await expect.poll(async () => Math.abs((await bend(page, 'bend-wood'))!.value - 0.02)).toBeLessThan(0.0005);
    const tip = (await bend(page, 'bend-wood'))!.tip;
    expect(Math.abs(tip[1] + 0.001 - (PEG_FOOT - 0.02))).toBeLessThan(0.001);
    expect(tip[1]).toBeCloseTo(CLAMP_Y - 0.02, 3);
    await set(page, { strip: 'ceramic' });
    await expect.poll(async () => (await sim(page)).outputs['flex-result']).toBe('snapped');
    await expect.poll(async () => (await anchor(page, 'bend-ceramic-snapped'))?.shown).toBe(true);
  });

  test('float or sink: the big board floats like the small block; steel lies on the floor; the soaked cloth sinks', async ({ page }) => {
    await open(page, 'ch=float-or-sink&sim=block.wood-big');
    let s = await sim(page);
    expect(s.outputs['float-result']).toBe('floats');
    expect(Number(s.outputs['float-rise'])).toBeCloseTo(18 - 0.65 * 6, 6);
    await expect.poll(async () => (await anchor(page, 'float-wood-big'))?.shown).toBe(true);
    const board = (await anchor(page, 'float-wood-big'))!;
    await open(page, 'ch=float-or-sink&sim=block.metal');
    expect((await sim(page)).outputs['float-result']).toBe('sinks');
    await expect.poll(async () => (await anchor(page, 'float-metal'))?.shown).toBe(true);
    expect((await anchor(page, 'float-metal'))!.y - board.y).toBeGreaterThan(30);
    await set(page, { block: 'fabric' });
    await expect.poll(async () => (await sim(page)).outputs['float-result']).toBe('sinks');
    s = await sim(page);
    expect(Number(s.outputs['float-rise'])).toBe(0);
  });

  test('waterproof: a damp patch on cotton and on wood, a bead on glazed tile', async ({ page }) => {
    await open(page, 'ch=waterproof&sim=square.fabric');
    expect((await sim(page)).outputs['drop-result']).toBe('soaks-in');
    await expect.poll(async () => (await anchor(page, 'wet-patch'))?.shown).toBe(true);
    expect((await anchor(page, 'water-bead'))?.shown ?? false).toBe(false);
    await set(page, { square: 'ceramic' });
    await expect.poll(async () => (await anchor(page, 'water-bead'))?.shown).toBe(true);
    expect((await anchor(page, 'wet-patch'))?.shown ?? false).toBe(false);
  });

  test('light through: glass a faint shadow, plastic a lighter one than wood’s full shadow', async ({ page }) => {
    await open(page, 'ch=light-through&sim=square.glass');
    await expect.poll(async () => (await shadows(page))['0']?.casters['sheet-glass']?.dark).toBe(0.1);
    await set(page, { square: 'plastic' });
    await expect.poll(async () => (await shadows(page))['0']?.casters['sheet-plastic']?.dark).toBe(0.6);
    await set(page, { square: 'wood' });
    await expect.poll(async () => (await shadows(page))['0']?.casters['sheet-wood']?.dark).toBe(1);
    expect((await sim(page)).outputs['light-result']).toBe('none');
  });

  test('the five tests together: seven rows, every column an outcome in words (EN and ZH)', async ({ page }) => {
    for (const lang of ['en', 'zh'] as const) {
      await open(page, 'ch=choosing-materials', lang);
      for (const pick of ['wood', 'metal', 'ceramic', 'rubber', 'glass', 'plastic', 'fabric']) {
        await set(page, { pick });
        await card(page).locator('[data-sim-record]').click();
      }
      const table = card(page).locator('table');
      await expect(table.locator('tbody tr')).toHaveCount(7);
      const text = await table.innerText();
      expect(text).not.toMatch(/MPa|GPa|kg\/m|g\/cm|%|\d/);
      if (lang === 'en') for (const word of ['Holds them', 'Snaps', 'Bends onto the bench', 'Bends without breaking', 'Droops by itself', 'Floats', 'Sinks', 'Soaks in', 'Stays on top', 'Most', 'Some', 'None']) expect(text).toContain(word);
      else for (const word of ['托得住', '断了', '弯到台面上', '弯而不断', '自己垂下来', '浮', '沉', '吸进去', '停在上面', '大部分', '一部分', '没有', '塑料']) expect(text).toContain(word);
    }
  });

  test('predict first: the bigger board floats, revealed without grading', async ({ page }) => {
    await open(page, 'ch=float-or-sink');
    await card(page).locator('[data-predict="sinks"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('Floats');
    expect((await sim(page)).values.block).toBe('wood-big');
  });

  test('Chinese cinema: the card and the reading panel are in Chinese, plastic is 塑料', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'ch=strength&theme=cinema&sim=strip.plastic~masses.5', 'zh');
    await expect(card(page)).toContainText('试一试');
    await expect(card(page).locator('[data-sim-output="strength-result"]')).toContainText('弯到台面上');
    await expect(page.locator('body')).toContainText('塑料条');
    await expect(page.locator('body')).not.toContainText('塑胶条');
  });

  test('phone: the card fits the drawer with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=choosing-materials');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    await page.evaluate(() => document.querySelector<HTMLButtonElement>('.space-try [data-sim-record]')!.click());
    for (const selector of ['[data-sim-record]', '[data-predict="most"]', '[data-sim-control="pick"] button']) {
      const target = card(page).locator(selector).first();
      await target.scrollIntoViewIfNeeded();
      expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('light-and-shadows and states-of-matter link here', async ({ page }) => {
    await page.goto('/en/topics/light-and-shadows/?ch=through-or-blocked');
    await expect(page.locator('a[href*="/en/topics/materials/"]').first()).toBeAttached();
    await page.goto('/en/topics/states-of-matter/?ch=mass-and-space');
    await expect(page.locator('a[href*="/en/topics/materials/"]').first()).toBeAttached();
  });
});

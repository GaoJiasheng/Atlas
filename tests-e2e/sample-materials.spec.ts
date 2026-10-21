/** The materials model and the `bend` binding on the primitive bench (docs/37 §4.8). */
import { expect, test, type Page } from '@playwright/test';

type Bend = { value: number; mid: [number, number, number]; tip: [number, number, number]; length: number; shown: boolean };
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, number | string>; table: Record<string, unknown>[] };
  bend(id: string): Bend | null;
  anchor(id: string): { x: number; y: number; shown: boolean } | null;
  shadows(): Record<string, { casters: Record<string, { min: [number, number]; max: [number, number]; dark: number }> }>;
  setSim(values: Record<string, number | string | boolean>): boolean;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const bend = (page: Page, id: string) => page.evaluate((part) => (window.__atlas!.engine as unknown as Engine).bend(part), id);
const anchor = (page: Page, id: string) => page.evaluate((part) => (window.__atlas!.engine as unknown as Engine).anchor(part), id);
const shadows = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).shadows());
const set = (page: Page, values: Record<string, number | string | boolean>) => page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const card = (page: Page) => page.locator('.space-try');
async function open(page: Page, query: string, lang = 'en') {
  await page.goto(`/${lang}/topics/sample-materials/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(() => bend(page, 'bridge-wood')).not.toBeNull();
}
// The strips rest 6.1 cm up (supports 6 cm, 2 mm thick); the clamp holds them at 15.1 cm; the peg's foot starts on the strip's top.
const STRIP_Y = 0.061;
const CLAMP_Y = 0.151;
const PEG_FOOT = 0.152;

test.describe('sample-materials (materials model and bend)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('background has its reading note, BG axis segment and no card', async ({ page }) => {
    await open(page, 'ch=before-you-start');
    await expect(page.locator('.atlas-note')).toContainText('drawn, not written as numbers');
    await expect(page.locator('.atlas-axis')).toContainText('BG');
    await expect(card(page)).toHaveCount(0);
  });

  test('a deep link to glass with five masses: the snapped strip shows, the masses lie on the bench', async ({ page }) => {
    await open(page, 'ch=strength&sim=strip.wood~masses.5');
    await expect.poll(async () => (await anchor(page, 'bridge-masses'))?.shown).toBe(true);
    const held = (await anchor(page, 'bridge-masses'))!;
    await open(page, 'ch=strength&sim=strip.glass~masses.5');
    const s = await sim(page);
    expect(s.outputs['strength-result']).toBe('snapped');
    expect(s.outputs['bridge-view']).toBe('glass-snapped');
    await expect.poll(async () => (await anchor(page, 'bridge-glass-snapped'))?.shown).toBe(true);
    expect((await bend(page, 'bridge-glass'))!.shown).toBe(false);
    expect((await anchor(page, 'bridge-glass'))?.shown ?? false).toBe(false);
    await expect(card(page).locator('[data-sim-output="strength-result"]')).toContainText('Snaps');
    // Fallen: well below where the wooden strip held them (screen y grows downward).
    await expect.poll(async () => (await anchor(page, 'bridge-masses'))!.y - held.y).toBeGreaterThan(20);
  });

  test('] adds a mass: the wooden strip eases down to the model sag, keeping its length; the carrier rides on it', async ({ page }) => {
    await open(page, 'ch=strength&sim=strip.wood~masses.4');
    const before = (await bend(page, 'bridge-wood'))!;
    expect(before.value).toBeCloseTo(Number((await sim(page)).outputs['bridge-sag']), 4);
    await set(page, { strip: 'wood', masses: 5 });
    await expect.poll(async () => {
      const v = (await bend(page, 'bridge-wood'))!.value;
      return v > before.value + 1e-5 && v < Number((await sim(page)).outputs['bridge-sag']) - 1e-5;
    }, { intervals: [16, 16, 32] }).toBe(true);
    const sag = Number((await sim(page)).outputs['bridge-sag']);
    await expect.poll(async () => Math.abs((await bend(page, 'bridge-wood'))!.value - sag)).toBeLessThan(0.0005);
    const now = (await bend(page, 'bridge-wood'))!;
    expect(now.mid[1]).toBeCloseTo(STRIP_Y - sag, 4);
    expect(Math.abs(now.length - 0.3) / 0.3).toBeLessThan(0.005);
    // The keys step the card's own control (strip) as well.
    await page.keyboard.press(']');
    await expect.poll(async () => (await sim(page)).values.strip).toBe('glass');
  });

  test('pushed 2 cm, the peg sits on the wooden strip\'s end; the plastic strip droops by itself', async ({ page }) => {
    await open(page, 'ch=flexibility&sim=strip.wood~push.2');
    await expect.poll(async () => Math.abs((await bend(page, 'bend-wood'))!.value - 0.02)).toBeLessThan(0.0005);
    const tip = (await bend(page, 'bend-wood'))!.tip;
    // The strip's top at its end (centre line + 1 mm) meets the peg's foot, pushed down 2 cm.
    expect(Math.abs(tip[1] + 0.001 - (PEG_FOOT - 0.02))).toBeLessThan(0.001);
    expect(tip[1]).toBeCloseTo(CLAMP_Y - 0.02, 4);
    await set(page, { strip: 'plastic', push: 0 });
    await expect.poll(async () => (await sim(page)).outputs['flex-result']).toBe('droops');
    const droop = Number((await sim(page)).outputs['flex-tip']);
    expect(droop).toBeGreaterThan(0.01);
    await expect.poll(async () => Math.abs((await bend(page, 'bend-plastic'))!.value - droop)).toBeLessThan(0.0005);
  });

  test('the plastic block floats high in the tank, the glass block lies on the floor', async ({ page }) => {
    await open(page, 'ch=float-or-sink&sim=block.plastic');
    const s = await sim(page);
    expect(s.outputs['float-result']).toBe('floats');
    expect(Number(s.outputs['float-rise'])).toBeCloseTo(18 - 0.955 * 3, 6);
    await expect.poll(async () => (await anchor(page, 'float-plastic'))?.shown).toBe(true);
    const floating = (await anchor(page, 'float-plastic'))!;
    await open(page, 'ch=float-or-sink&sim=block.glass');
    expect((await sim(page)).outputs['float-result']).toBe('sinks');
    await expect.poll(async () => (await anchor(page, 'float-glass'))?.shown).toBe(true);
    expect((await anchor(page, 'float-glass'))!.y - floating.y).toBeGreaterThan(40);
  });

  test('a drop soaks into wood (damp patch) and beads on plastic', async ({ page }) => {
    await open(page, 'ch=waterproof&sim=square.wood');
    expect((await sim(page)).outputs['drop-result']).toBe('soaks-in');
    await expect.poll(async () => (await anchor(page, 'wet-patch'))?.shown).toBe(true);
    expect((await anchor(page, 'water-bead'))?.shown ?? false).toBe(false);
    await set(page, { square: 'plastic' });
    await expect.poll(async () => (await anchor(page, 'water-bead'))?.shown).toBe(true);
  });

  test('wood casts a full shadow, glass a faint one', async ({ page }) => {
    await open(page, 'ch=light-through&sim=square.wood');
    await expect.poll(async () => (await shadows(page))['0']?.casters['sheet-wood']?.dark).toBe(1);
    await set(page, { square: 'glass' });
    await expect.poll(async () => (await shadows(page))['0']?.casters['sheet-glass']?.dark).toBe(0.1);
    expect((await sim(page)).outputs['light-result']).toBe('most');
  });

  test('the five tests together: a recorded row per material, every column an outcome in words (EN and ZH)', async ({ page }) => {
    for (const lang of ['en', 'zh'] as const) {
      await open(page, 'ch=all-five', lang);
      for (const pick of ['wood', 'glass', 'plastic']) {
        await set(page, { pick });
        await card(page).locator('[data-sim-record]').click();
      }
      const table = card(page).locator('table');
      await expect(table.locator('tbody tr')).toHaveCount(3);
      const text = await table.innerText();
      expect(text).not.toMatch(/MPa|kg\/m|GPa|%/);
      if (lang === 'en') for (const word of ['Holds them', 'Snaps', 'Bends onto the bench', 'Droops by itself', 'Floats', 'Sinks', 'Soaks in', 'Stays on top', 'Most', 'Some', 'None']) expect(text).toContain(word);
      else for (const word of ['托得住', '断了', '弯到台面上', '自己垂下来', '浮', '沉', '吸进去', '停在上面', '大部分', '一部分', '没有']) expect(text).toContain(word);
    }
  });

  test('prediction reveals the outcome without grading it', async ({ page }) => {
    await open(page, 'ch=strength');
    await card(page).locator('[data-predict="holds"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('Snaps');
    expect((await sim(page)).outputs['strength-result']).toBe('snapped');
  });

  test('Chinese cinema and reduced motion jump the bend to its value', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'ch=strength&theme=cinema&sim=strip.plastic~masses.0', 'zh');
    await expect(card(page)).toContainText('强度测试');
    await set(page, { masses: 5 });
    await expect.poll(async () => (await bend(page, 'bridge-plastic'))!.value).toBeCloseTo(0.06, 6);
    await expect(card(page).locator('[data-sim-output="strength-result"]')).toContainText('弯到台面上');
  });

  test('phone card fits the drawer with 44 px controls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=all-five');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    await page.evaluate(() => document.querySelector<HTMLButtonElement>('.space-try [data-sim-record]')!.click());
    for (const selector of ['[data-sim-record]', '[data-predict="most"]', '[data-sim-control="pick"] button']) {
      const target = card(page).locator(selector).first();
      await target.scrollIntoViewIfNeeded();
      expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

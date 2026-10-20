/**
 * The states-of-matter topic (docs/36): deep links show the model's readings
 * and the drawn water levels agree with them; pouring moves the water from
 * vessel to vessel; the cup's trapped air, hole, bubbles and wet tissue; the
 * syringes spring back; sand drinks up water before its reading rises; the
 * Chinese page reads in Chinese; the phone drawer keeps 44 px targets.
 */
import { expect, test, type Page } from '@playwright/test';

type Fill = { volume: number; level: number; shown: boolean };
type Engine = {
  sim(): { values: Record<string, unknown>; outputs: Record<string, number | string> };
  fill(id: string): Fill | null;
  flow(id: string): { paths: Record<string, { visible: boolean }> } | null;
  anchor(id: string): { x: number; y: number; shown: boolean } | null;
  setSim(values: Record<string, number | string | boolean>): boolean;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const fill = (page: Page, id: string) => page.evaluate((part) => (window.__atlas!.engine as unknown as Engine).fill(part), id);
const card = (page: Page) => page.locator('.space-try');
async function open(page: Page, query: string, lang = 'en') {
  await page.goto(`/${lang}/topics/states-of-matter/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}

test.describe('states-of-matter', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('background chapter: reading note, BG axis segment, no card', async ({ page }) => {
    await open(page, 'ch=before-you-start');
    await expect(page.locator('.atlas-note')).toContainText('drawn life size');
    await expect(page.locator('.atlas-axis')).toContainText('BG');
    await expect(card(page)).toHaveCount(0);
  });

  test('weighing: the stone reads 66.3 g, the sponge 11.5 g, and the bars compare them', async ({ page }) => {
    await open(page, 'ch=mass-and-space');
    await expect(card(page).locator('[data-sim-output="mass"]')).toContainText('66.3');
    await card(page).locator('[data-sim-record]').click();
    await card(page).locator('[data-sim-control="weigh-object"] [data-sim-value="sponge"]').click();
    await expect(card(page).locator('[data-sim-output="mass"]')).toContainText('11.5');
    await card(page).locator('[data-sim-record]').click();
    await expect(card(page).locator('.space-chart[data-kind="bar"] svg[role="img"]')).toHaveAttribute('aria-label', /Stone 66\.3 g.*Sponge 11\.5 g/);
  });

  test('a solid in the water: the stone raises cylinder B to 125 ml and the drawn level agrees', async ({ page }) => {
    await open(page, 'ch=solids&sim=drop-object.stone');
    expect((await sim(page)).outputs.reading).toBe(125);
    const water = (await fill(page, 'cyl-b-water'))!;
    expect(water.volume).toBeCloseTo(125e-6, 9);
    expect(water.level).toBeCloseTo(125e-6 / (Math.PI * 0.0185 ** 2), 6);
    await open(page, 'ch=solids&sim=drop-object.marble');
    await expect(card(page).locator('[data-sim-output="object-volume"]')).toContainText('2.1');
  });

  test('predict then observe: the clay roll raises the water the same as the ball', async ({ page }) => {
    await open(page, 'ch=solids');
    await card(page).locator('[data-predict="same"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('Observed: The same');
    await expect.poll(async () => (await sim(page)).values['drop-object']).toBe('clay-roll');
  });

  for (const [container, liquid, height] of [['glass', 'glass-water', 7.1], ['flask', 'flask-water', 5.0], ['bowl', 'bowl-water', 3.0]] as const) {
    test(`pouring into the ${container}: one drawn level, ${height} cm, still 200 ml`, async ({ page }) => {
      await open(page, `ch=liquids&sim=container.${container}`);
      const s = await sim(page);
      expect(Number(s.outputs.level)).toBeCloseTo(height, 1);
      expect(s.outputs.poured).toBe(200);
      const f = (await fill(page, liquid))!;
      expect(f.shown).toBe(true);
      expect(f.level * 100).toBeCloseTo(Number(s.outputs.level), 1);
      expect((await fill(page, 'cyl-a-water'))!.shown).toBe(false);
    });
  }

  test('the cup: trapped air keeps the tissue dry; a hole lets the air bubble out and the water in', async ({ page }) => {
    await open(page, 'ch=air-is-matter&b=2');
    let s = await sim(page);
    expect(s.outputs.tissue).toBe('dry');
    expect(Number(s.outputs['basin-level'])).toBeCloseTo(14.9, 1);
    expect((await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).anchor('trapped-air')))!.shown).toBe(true);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).setSim({ 'cup-hole': true }));
    await expect.poll(async () => (await sim(page)).outputs.tissue).toBe('wet');
    s = await sim(page);
    expect(Number(s.outputs['basin-level'])).toBeCloseTo(14.1, 1);
    await expect.poll(async () => (await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).flow('escaping-air')))!.paths['cup-hole']!.visible).toBe(true);
    await expect.poll(async () => (await fill(page, 'cup-water'))!.volume).toBeGreaterThan(340e-6);
  });

  test('air has mass: twenty pumps add 4.7 g, and the records draw a straight line', async ({ page }) => {
    await open(page, 'ch=air-is-matter');
    await expect(card(page).locator('[data-sim-output="ball-mass"]')).toContainText('600.0');
    for (let i = 0; i < 5; i++) {
      await card(page).locator('[data-sim-record]').click();
      await page.keyboard.press(']');
    }
    await expect(card(page).locator('[data-sim-output="ball-mass"]')).toContainText('604.7');
    await expect(card(page).locator('[data-sim-output="air-added"]')).toContainText('4.7');
    await expect(card(page).locator('.space-chart[data-kind="line"]')).toBeVisible();
  });

  test('syringes: 4 kg squashes the air to 9.0 ml and leaves water and sand at 20.0 ml; it springs back', async ({ page }) => {
    await open(page, 'ch=gases&sim=load.4');
    const s = await sim(page);
    expect(Number(s.outputs['v-air'])).toBeCloseTo(8.96, 2);
    expect(Number(s.outputs['v-water']).toFixed(1)).toBe('20.0');
    expect(Number(s.outputs['v-sand'])).toBe(20);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).setSim({ load: 0 }));
    await expect.poll(async () => Number((await sim(page)).outputs['v-air'])).toBe(20);
  });

  test('sand: the first 20 ml of water fills the gaps; 100 ml reads 165 ml, not 200', async ({ page }) => {
    await open(page, 'ch=sorting-matter&sim=water-added.20');
    expect((await sim(page)).outputs['sand-reading']).toBe(100);
    expect((await sim(page)).outputs['sand-bubbles']).toBe('rising');
    await open(page, 'ch=sorting-matter&sim=water-added.100');
    expect((await sim(page)).outputs['sand-reading']).toBe(165);
    const water = (await fill(page, 'water-over-sand'))!;
    expect(water.shown).toBe(true);
    expect(water.level).toBeCloseTo(165e-6 / (Math.PI * 0.0185 ** 2), 5);
  });

  test('Chinese: the card and the reading panel are in Chinese', async ({ page }) => {
    await open(page, 'ch=gases', 'zh');
    await expect(card(page)).toContainText('试一试');
    await expect(card(page)).toContainText('每支柱塞上的砝码');
    await expect(page.locator('body')).toContainText('气体会散开，也能被压缩');
    await expect(page.locator('body')).toContainText('水难压得多');
  });

  test('phone: the card fits the drawer with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=liquids');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    for (const sel of ['[data-sim-record]', '[data-sim-value="bowl"]']) {
      const target = card(page).locator(sel).first();
      await target.scrollIntoViewIfNeeded();
      expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});


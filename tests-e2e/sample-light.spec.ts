/** The draft light fixture exercises straight-line mesh projection and the existing sim/HUD contracts. */
import { expect, test, type Page } from '@playwright/test';

type Bounds = { min: [number, number]; max: [number, number] };
type Shadows = Record<string, { casters: Record<string, Bounds>; trail: [number, number][]; rays: number; spot?: { radius: number } }>;
type Sim = { values: Record<string, string | boolean | number>; outputs: Record<string, string | number | Record<string, number>>; timeline: Record<string, unknown> };
type Engine = { sim(): Sim; shadows(): Shadows; setSim(values: Record<string, string | boolean | number>): boolean };
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const shadows = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).shadows());
const card = (page: Page) => page.locator('.space-try');

async function open(page: Page, query: string, lang = 'en') {
  await page.goto(`/${lang}/topics/sample-light/${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined && typeof (window.__atlas.engine as unknown as Engine).shadows === 'function');
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}

async function shadowMatches(page: Page, part = 'card-circle') {
  await expect.poll(async () => {
    const b = (await shadows(page))['0']?.casters[part];
    const s = await sim(page);
    if (!b) return Infinity;
    return Math.max(Math.abs(b.max[0] - b.min[0] - Number(s.outputs['shadow-width'])), Math.abs(b.max[1] - b.min[1] - Number(s.outputs['shadow-height'])));
  }).toBeLessThan(0.2);
}

test.describe('sample-light (SpaceScene light model)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('deep link mesh shadows match the centimetre readings; a key moves the torch smoothly', async ({ page }) => {
    await open(page, '?ch=distance&sim=d-torch.20~d-screen.30');
    await shadowMatches(page);
    expect(await page.evaluate(() => (window.__atlas!.stats() as unknown as { shadowMapUpdates: number }).shadowMapUpdates)).toBe(0);
    expect((await sim(page)).outputs['shadow-height']).toBeGreaterThan(19.9);
    const before = (await shadows(page))['0']!.casters['card-circle']!;
    const start = before.max[1] - before.min[1];
    // Arm the sampler before the key event so slow headless command delivery cannot miss the easing.
    await page.evaluate(() => {
      const bag = window as unknown as { lightMotion: Promise<number[]> };
      bag.lightMotion = new Promise((resolve) => {
        window.addEventListener('keydown', () => {
          const heights: number[] = [];
          const end = performance.now() + 900;
          const sample = () => {
            const b = (window.__atlas!.engine as unknown as Engine).shadows()['0']?.casters['card-circle'];
            if (b) heights.push(b.max[1] - b.min[1]);
            if (performance.now() < end) requestAnimationFrame(sample);
            else resolve(heights);
          };
          sample();
        }, { once: true });
      });
    });
    await page.keyboard.press(']');
    const samples = await page.evaluate(() => (window as unknown as { lightMotion: Promise<number[]> }).lightMotion);
    await expect.poll(async () => (await sim(page)).values['d-torch']).toBe(30);
    await shadowMatches(page);
    const after = Number((await sim(page)).outputs['shadow-height']);
    expect(after).toBeLessThan(start);
    expect(samples.some((h) => h < start - 0.1 && h > after + 0.1)).toBe(true);
    expect((await shadows(page))['0']!.rays).toBeGreaterThanOrEqual(3);
    await expect(page).toHaveURL(/sim=.*d-torch\.30/);
  });

  test('all seven shapes and turns project their real mesh within two millimetres', async ({ page }) => {
    await open(page, '?ch=shapes');
    for (const object of ['card-circle', 'card-square', 'card-triangle', 'card-circle-big', 'tin', 'cone', 'ball']) {
      for (const turn of [0, 45, 90]) {
        await page.evaluate(({ object, turn }) => (window.__atlas!.engine as unknown as Engine).setSim({ object, turn }), { object, turn });
        await shadowMatches(page, object);
      }
    }
    await expect(card(page).locator('[data-sim-output="shadow-shape"]')).toContainText('Circle');
    expect(Object.keys((await sim(page)).timeline)).toHaveLength(0);
  });

  test('the background shows seeing states and aligned or moved hole cards', async ({ page }) => {
    await open(page, '?ch=before-you-start&b=5');
    await expect(card(page)).toHaveCount(0);
    await expect(page.locator('.atlas-note')).toContainText('Sample reading note');
    await expect(page.locator('.atlas-axis')).toContainText('BG');
    expect((await sim(page)).outputs.dot).toBe('yes');
    await expect.poll(async () => Object.keys((await shadows(page))['0']?.casters ?? {}).filter((id) => id.startsWith('hole-card-')).length).toBe(3);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).setSim({ middle: 'moved' }));
    await expect.poll(async () => (await sim(page)).outputs.dot).toBe('no');
    await open(page, '?ch=before-you-start&b=3');
    expect((await sim(page)).outputs.eye).toBe('none');
    await open(page, '?ch=before-you-start&b=4');
    expect((await sim(page)).outputs.eye).toBe('bright');
  });

  test('material choices clear the object, record a bar graph, and the prediction reveals the distance change', async ({ page }) => {
    await open(page, '?ch=materials');
    for (const material of ['clear-glass', 'frosted-glass', 'tracing-paper', 'cardboard']) {
      await card(page).locator(`[data-sim-control="material"] [data-sim-value="${material}"]`).click();
      await expect.poll(async () => (await sim(page)).values.object).toBe('none');
      await card(page).locator('[data-sim-record]').click();
    }
    const graph = card(page).locator('.space-chart[data-kind="bar"] svg[role="img"]');
    await expect(graph).toHaveAttribute('aria-label', /Clear glass 91 %.*Frosted glass 45 %.*Tracing paper 35 %.*Cardboard 0 %/);
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).setSim({ object: 'tin' }));
    expect((await sim(page)).values.material).toBe('none');
    await open(page, '?ch=distance');
    await card(page).locator('[data-predict="smaller"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('Observed:');
    expect((await sim(page)).values['d-torch']).toBe(60);
    await shadowMatches(page);
  });

  test('Sun time uses the shared formatter, hourly chalk marks, and a line graph with clock labels', async ({ page }) => {
    await open(page, '?ch=sun-shadows&sim=time.8');
    await expect(card(page).locator('[data-sim-control="time"]')).toContainText('8.00 am');
    await expect.poll(async () => (await shadows(page))['1']?.trail.length).toBe(1);
    for (let i = 0; i < 3; i++) {
      await card(page).locator('[data-sim-record]').click();
      if (i < 2) await page.keyboard.press(']');
    }
    await expect.poll(async () => (await shadows(page))['1']?.trail.length).toBe(3);
    const graph = card(page).locator('.space-chart[data-kind="line"] svg[role="img"]');
    await expect(graph).toHaveAttribute('aria-label', /8\.00 am.*10\.00 am/);
    await expect(graph).toContainText('8 am');
    const oct = (await shadows(page))['1']!.trail;
    await card(page).locator('[data-sim-control="date"] [data-sim-value="jun-21"]').click();
    await expect.poll(async () => JSON.stringify((await shadows(page))['1']?.trail)).not.toBe(JSON.stringify(oct));
  });

  test('Chinese and the phone drawer retain clock labels, fitting charts and 44 px controls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '?ch=sun-shadows&sim=time.8', 'zh');
    await page.getByRole('button', { name: '阅读', exact: true }).click();
    await expect(card(page).locator('[data-sim-control="time"]')).toContainText('上午 8.00');
    for (let i = 0; i < 2; i++) {
      await card(page).locator('[data-sim-record]').scrollIntoViewIfNeeded();
      await card(page).locator('[data-sim-record]').click();
      if (!i) await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).setSim({ time: 9 }));
    }
    for (const selector of ['[data-sim-record]', '[data-sim-control="time"] button', '[data-sim-value="jun-21"]']) {
      const target = card(page).locator(selector).first();
      await target.scrollIntoViewIfNeeded();
      expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    const graph = card(page).locator('.space-chart svg');
    await graph.scrollIntoViewIfNeeded();
    const box = await graph.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await expect(graph).toHaveAttribute('aria-label', /上午 8\.00.*上午 9\.00/);
  });
});

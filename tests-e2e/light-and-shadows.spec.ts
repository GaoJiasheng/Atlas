/**
 * The light-and-shadows topic (docs/35): the drawn shadows match the model's
 * centimetres; the torch-distance card records a line graph and the
 * prediction reveals the change; the sheets record a bar graph; the hole
 * cards leave a dot only in line; the dark box answers the torch switch; the
 * Sun chapter writes clock times and leaves hourly chalk marks; the Chinese
 * page and the phone drawer work.
 */
import { expect, test, type Page } from '@playwright/test';

type Bounds = { min: [number, number]; max: [number, number] };
type Shadows = Record<string, { casters: Record<string, Bounds>; trail: [number, number][]; rays: number }>;
type Sim = { values: Record<string, string | boolean | number>; outputs: Record<string, string | number | Record<string, number>> };
type Engine = { sim(): Sim; shadows(): Shadows; setSim(values: Record<string, string | boolean | number>): boolean };

const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const shadows = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).shadows());
const card = (page: Page) => page.locator('.space-try');

async function open(page: Page, query: string, lang = 'en') {
  await page.goto(`/${lang}/topics/light-and-shadows/${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined && typeof (window.__atlas.engine as unknown as Engine).shadows === 'function', null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}

/** The projected mesh of `part` on the screen has the model's height and width (within 2 mm). */
async function shadowMatches(page: Page, part: string) {
  await expect
    .poll(async () => {
      const b = (await shadows(page))['0']?.casters[part];
      const s = await sim(page);
      if (!b) return Infinity;
      return Math.max(Math.abs(b.max[0] - b.min[0] - Number(s.outputs['shadow-width'])), Math.abs(b.max[1] - b.min[1] - Number(s.outputs['shadow-height'])));
    })
    .toBeLessThan(0.2);
}

test.describe('light-and-shadows', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('a deep link: the drawn shadow is the model shadow; the torch steps record a falling line graph', async ({ page }) => {
    await open(page, '?ch=torch-distance&sim=d-torch.15');
    await shadowMatches(page, 'card-circle');
    await expect(card(page).locator('[data-sim-output="shadow-height"]')).toContainText('24');
    await expect(page.locator('.space-plate__reading', { hasText: 'SHADOW H' })).toContainText('24');
    for (let i = 0; i < 5; i++) {
      await card(page).locator('[data-sim-record]').click();
      if (i < 4) await page.keyboard.press(']');
    }
    expect((await sim(page)).values['d-torch']).toBe(60);
    await shadowMatches(page, 'card-circle');
    const line = card(page).locator('.space-chart[data-kind="line"] svg[role="img"]');
    await expect(line).toHaveAttribute('aria-label', /falls all the way, from 24 cm/);
  });

  test('predict then observe: moving the torch from 20 to 40 cm makes the shadow smaller', async ({ page }) => {
    await open(page, '?ch=torch-distance');
    await card(page).locator('[data-predict="smaller"]').click();
    await expect(card(page).locator('.space-try__reveal')).toContainText('Observed: Smaller');
    await expect.poll(async () => (await sim(page)).values['d-torch']).toBe(40);
    await shadowMatches(page, 'card-circle');
  });

  test('every object and turn on the bench projects within two millimetres of the model', async ({ page }) => {
    await open(page, '?ch=shape-and-size');
    for (const object of ['card-circle', 'card-square', 'card-triangle', 'card-circle-big', 'tin', 'cone', 'ball'])
      for (const turn of [0, 45, 90]) {
        await page.evaluate(({ object, turn }) => (window.__atlas!.engine as unknown as Engine).setSim({ object, turn }), { object, turn });
        await shadowMatches(page, object);
      }
  });

  test('the sheets clear the object and record a bar graph of 91, 45, 35 and 0 %', async ({ page }) => {
    await open(page, '?ch=through-or-blocked');
    for (const material of ['clear-glass', 'frosted-glass', 'tracing-paper', 'cardboard']) {
      await card(page).locator(`[data-sim-control="material"] [data-sim-value="${material}"]`).click();
      await expect.poll(async () => (await sim(page)).values.object).toBe('none');
      await card(page).locator('[data-sim-record]').click();
    }
    const bar = card(page).locator('.space-chart[data-kind="bar"] svg[role="img"]');
    await expect(bar).toHaveAttribute('aria-label', /Clear glass 91 %.*Frosted glass 45 %.*Tracing paper 35 %.*Cardboard 0 %/);
  });

  test('three holes in line leave a dot; moving the middle card takes it away', async ({ page }) => {
    await open(page, '?ch=straight-lines');
    expect((await sim(page)).outputs.dot).toBe('yes');
    await expect.poll(async () => Object.keys((await shadows(page))['0']?.casters ?? {}).filter((id) => id.startsWith('hole-card-')).length).toBe(3);
    await page.keyboard.press(']');
    await expect.poll(async () => (await sim(page)).outputs.dot).toBe('no');
    await expect(card(page).locator('[data-sim-output="dot"]')).toContainText('No dot');
  });

  test('the dark box: nothing comes out of the hole until T switches the torch in the box on', async ({ page }) => {
    await open(page, '?ch=seeing-light');
    expect((await sim(page)).outputs.eye).toBe('none');
    await expect(card(page).locator('[data-sim-output="eye"]')).toContainText('None');
    await page.keyboard.press('t');
    await expect.poll(async () => (await sim(page)).outputs.eye).toBe('some');
    await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).setSim({ 'box-torch': true, 'in-box': 'mirror' }));
    await expect.poll(async () => (await sim(page)).outputs.eye).toBe('bright');
  });

  test('the part chain fits short names while retaining complete bilingual titles', async ({ page }) => {
    await open(page, '?ch=seeing-light');
    const chain = page.locator('.space-chain');
    const torch = chain.locator('.space-chain__node').filter({ has: page.locator('title', { hasText: /^Small torch ·/ }) });
    const darkness = chain.locator('.space-chain__node').filter({ has: page.locator('title', { hasText: /^Darkness in the box \(drawn\) ·/ }) });
    await expect(torch.locator('.space-chain__name')).toHaveText('TORCH');
    await expect(torch.locator('title')).toHaveText('Small torch · 小手电筒');
    await expect(darkness.locator('.space-chain__name')).toHaveText('DARKNESS');
    await expect(darkness.locator('title')).toHaveText('Darkness in the box (drawn) · 箱里的黑暗（示意）');
    expect((await chain.locator('.space-chain__name').allTextContents()).join(' ')).not.toContain('…');
  });

  test('the Sun: clock times, hourly chalk marks and a line graph that falls and rises', async ({ page }) => {
    await open(page, '?ch=sun-shadows');
    await expect(card(page).locator('[data-sim-control="time"]')).toContainText('8.00 am');
    await expect.poll(async () => (await shadows(page))['1']?.trail.length).toBe(1);
    expect((await sim(page)).outputs['shadow-length']).toBeCloseTo(3.25, 2);
    for (let i = 0; i < 11; i++) {
      await card(page).locator('[data-sim-record]').click();
      if (i < 10) await page.keyboard.press(']');
    }
    await expect.poll(async () => (await shadows(page))['1']?.trail.length).toBe(11);
    expect((await sim(page)).outputs['shadow-points']).toBe('east');
    const line = card(page).locator('.space-chart[data-kind="line"] svg[role="img"]');
    await expect(line).toHaveAttribute('aria-label', /goes up and down/);
  });

  test('Chinese: the card, the clock and the reading panel are in Chinese', async ({ page }) => {
    await open(page, '?ch=sun-shadows', 'zh');
    await expect(card(page)).toContainText('试一试');
    await expect(card(page).locator('[data-sim-control="time"]')).toContainText('上午 8.00');
    await expect(page.locator('body')).toContainText('太阳下的影子');
    await expect(page.locator('body')).toContainText('影子背着太阳');
  });

  test('phone: the card fits the drawer with 44 px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '?ch=through-or-blocked');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    for (const sel of ['[data-sim-record]', '[data-sim-value="frosted-glass"]']) {
      const target = card(page).locator(sel).first();
      await target.scrollIntoViewIfNeeded();
      const box = await target.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

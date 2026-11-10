import { expect, test, type Page, type Request } from '@playwright/test';

const TOPIC = '/en/topics/sample-beat-figure/';
const BEAT = 'ch=dated-evidence&b=';
const SIZES = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
const PLATE = '[data-beat-figure="stage"]';
const READER = '[data-beat-figure="reader"]';
type Box = { x: number; y: number; width: number; height: number };
const apart = (a: Box, b: Box) => a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => !!window.__atlas);
  await page.evaluate(() => window.__atlas!.ready);
}
async function present(page: Page, path: string) {
  await open(page, path);
  await page.evaluate(() => window.__atlas!.setMode('presentation', true, { instant: true }));
  await expect.poll(() => page.evaluate(() => window.__atlas!.state().modes.presentation)).toBe(true);
  await expect(page.locator(PLATE)).toBeVisible();
  await expect.poll(() => page.locator(`${PLATE} img`).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
}
const box = async (page: Page, selector: string) => (await page.locator(selector).boundingBox())!;

for (const viewport of SIZES) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });
    test('the presentation plate clears the caption, title and framed map', async ({ page }) => {
      await present(page, `${TOPIC}?${BEAT}2`);
      const plate = await box(page, PLATE);
      const caption = await box(page, '[data-hud-panel="present"]');
      expect(plate.x).toBeGreaterThanOrEqual(0);
      expect(plate.x + plate.width).toBeLessThanOrEqual(viewport.width);
      expect(plate.y + plate.height).toBeLessThanOrEqual(caption.y);
      expect(apart(plate, await box(page, '[data-hud-panel="present-title"]'))).toBe(true);
      if (viewport.width < 760) expect(caption.y - (plate.y + plate.height)).toBeLessThanOrEqual(12);
      else {
        expect(plate.x + plate.width / 2).toBeGreaterThan(viewport.width / 2);
        expect(plate.y).toBeLessThan(viewport.height / 3);
      }
      // The camera frames the free rect, which must already avoid the plate; the beat's own labels stay out from under it.
      await expect.poll(async () => {
        const [x0, y0, x1, y1] = (await page.locator('[data-hud-frame]').getAttribute('data-hud-frame'))!.split(',').map(Number) as [number, number, number, number];
        const map = await box(page, '[data-hud-frame]');
        return apart(plate, { x: map.x + x0, y: map.y + y0, width: x1 - x0, height: y1 - y0 });
      }).toBe(true);
      for (const label of await page.locator('.ts-co').all()) expect(apart(plate, (await label.boundingBox())!)).toBe(true);
    });

    test('the normal view keeps the figure in the reader, off the map', async ({ page }) => {
      await open(page, `${TOPIC}?${BEAT}2`);
      await page.evaluate(() => window.__atlas!.setReader(true));
      // Drawer layouts keep the reader closed until it is opened.
      const toggle = page.locator('.atlas-panel__toggle');
      if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
      await expect(page.locator(READER)).toBeVisible();
      await expect(page.locator(PLATE)).toHaveCount(0);
      const image = page.locator(`${READER} img`);
      await expect(image).toHaveAttribute('width', '1200');
      await expect(image).toHaveAttribute('height', '900');
      const { beatLine, figure } = await page.locator(READER).evaluate((el) => {
        const line = document.querySelector('.ts-beatline')!;
        return { beatLine: line.getBoundingClientRect().bottom, figure: el.getBoundingClientRect().top };
      });
      expect(figure).toBeGreaterThanOrEqual(beatLine);
    });
  });
}

test('a beat without a figure requests nothing and adds nothing', async ({ page }) => {
  const asked: string[] = [];
  page.on('request', (r: Request) => { if (/_astro\/BeatFigure|illustrations\/figures\//.test(r.url())) asked.push(r.url()); });
  await open(page, `${TOPIC}?${BEAT}1`);
  await expect(page.locator('[data-beat-figure]')).toHaveCount(0);
  await page.evaluate(() => window.__atlas!.setMode('presentation', true, { instant: true }));
  await expect(page.locator('[data-hud-panel="present"]')).toBeVisible();
  await expect(page.locator('[data-beat-figure]')).toHaveCount(0);
  expect(asked).toEqual([]);
});

test('the figure follows the beat, and the plate leaves with the presentation', async ({ page }) => {
  await present(page, `${TOPIC}?${BEAT}2`);
  await page.evaluate(() => window.__atlas!.setMode('presentation', false, { instant: true }));
  await expect(page.locator(PLATE)).toHaveCount(0);
  await expect(page.locator(READER)).toHaveCount(1);
  await page.locator('[data-time-beat="prev"]').evaluate((b: HTMLElement) => b.click());
  await expect(page.locator(READER)).toHaveCount(0);
});

test('a selection stays above the figure, and the body below it', async ({ page }) => {
  await open(page, `${TOPIC}?${BEAT}2`);
  await page.evaluate(() => window.__atlas!.setReader(true));
  await expect(page.locator(READER)).toBeVisible();
  await page.locator('.ts-index__row[data-time-target="site-fixture-centre"]').click();
  await expect(page.locator('.ts-event')).toBeVisible();
  await expect(page.locator(READER)).toBeVisible();
  const top = async (selector: string) => (await page.locator(selector).first().boundingBox())!.y;
  expect(await top('.ts-event')).toBeLessThan(await top(READER));
  expect(await top(READER)).toBeLessThan(await top('.atlas-reader-top + *'));
});

test('hiding the HUD with H puts the figure on the stage', async ({ page }) => {
  await open(page, `${TOPIC}?${BEAT}2`);
  await expect(page.locator(READER)).toHaveCount(1);
  await page.evaluate(() => window.__atlas!.setHud(false));
  await expect(page.locator(PLATE)).toBeVisible();
});

test('invert: false keeps the drawing out of the cinema inversion', async ({ page }) => {
  await open(page, `${TOPIC}?${BEAT}3`);
  await page.evaluate(() => window.__atlas!.setTheme('cinema'));
  const image = page.locator(`${READER} img`);
  await expect(image).toHaveAttribute('data-invert', 'false');
  expect(await image.evaluate((el) => getComputedStyle(el).filter)).not.toContain('invert');
  await open(page, `${TOPIC}?${BEAT}2`);
  await page.evaluate(() => window.__atlas!.setTheme('cinema'));
  expect(await page.locator(`${READER} img`).evaluate((el) => getComputedStyle(el).filter)).toContain('invert');
});

for (const viewport of [{ width: 390, height: 844 }, { width: 1024, height: 768 }, { width: 1440, height: 900 }]) {
  test.describe(`monthly beats ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });
    test('the plate stays clear of the climate key and caption', async ({ page }) => {
      await present(page, '/en/topics/sample-climate/?ch=northeast-monsoon&b=2');
      const plate = await box(page, PLATE);
      expect(plate.y + plate.height).toBeLessThanOrEqual((await box(page, '[data-hud-panel="present"]')).y);
      // The key fills in after its data arrives; the plate follows it down.
      await expect.poll(async () => apart(await box(page, PLATE), await box(page, '[data-hud-panel="present-key"]'))).toBe(true);
    });
  });
}

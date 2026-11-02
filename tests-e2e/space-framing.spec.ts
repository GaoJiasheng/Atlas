/**
 * SpaceScene default HUD framing (docs/67 §9, lib/hud-framing.ts `stageFraming`):
 * the authored view sits in the largest rectangle the HUD blocks leave free,
 * re-fits when a panel folds, leaves a camera the reader moved alone, and is
 * the identity at the 1920 × 1080 design layout.
 */
import { expect, test, type Page } from '@playwright/test';

type Rect = { x0: number; y0: number; x1: number; y1: number };
type Framing = { rect: Rect; scale: number; shift: [number, number] } | null;
type Cam = { position: number[]; target: number[] };

const framing = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as { framing(): Framing }).framing());
const camera = (page: Page) => page.evaluate(() => (window.__atlas!.stats() as { camera?: Cam }).camera ?? null);
const distance = (c: Cam | null) => (c ? Math.hypot(...c.position.map((v, i) => v - c.target[i]!)) : NaN);

async function open(page: Page, width: number, height: number, query = '') {
  await page.setViewportSize({ width, height });
  await page.goto(`/en/topics/aircon/${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(() => framing(page), { timeout: 20_000 }).not.toBeNull();
}

/** The camera has stopped moving (the stage renders on demand; software GL is slow). */
async function settled(page: Page) {
  let last = '';
  await expect
    .poll(async () => {
      const now = JSON.stringify(await camera(page));
      const still = now === last;
      last = now;
      return still;
    }, { timeout: 20_000, intervals: [600] })
    .toBe(true);
}

/** Visible HUD blocks over the stage, in stage pixels. */
const panels = (page: Page) =>
  page.evaluate(() => {
    const stage = document.querySelector('.space-stage')!.getBoundingClientRect();
    return [...document.querySelectorAll('.atlas-scene [data-hud-panel]')]
      .filter((el) => el.getAttribute('data-hud-panel') !== 'perf')
      .flatMap((el) => (el.getAttribute('data-hud-panel') === 'overlay' ? [...el.children] : [el]))
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 1 && r.height > 1 && r.left < stage.right && r.right > stage.left)
      .map((r) => ({ x0: r.left - stage.left, y0: r.top - stage.top, x1: r.right - stage.left, y1: r.bottom - stage.top }));
  });

test('1920 × 1080: the design layout keeps the authored camera (scale 1, no shift)', async ({ page }) => {
  await open(page, 1920, 1080);
  const f = await framing(page);
  expect(f!.scale).toBeCloseTo(1, 6);
  for (const v of f!.shift) expect(Math.abs(v)).toBeLessThan(1e-6);
});

test('1180 × 820: the view sits in a free rectangle between the HUD blocks and re-fits when the reader folds', async ({ page }) => {
  await open(page, 1180, 820);
  await settled(page);
  const f = (await framing(page))!;
  for (const p of await panels(page))
    expect(f.rect.x1 <= p.x0 || f.rect.x0 >= p.x1 || f.rect.y1 <= p.y0 || f.rect.y0 >= p.y1, JSON.stringify({ rect: f.rect, p })).toBe(true);
  const before = distance(await camera(page));
  await page.locator('.atlas-reader__handle').click();
  // The stage widens: more room, so the view grows (the camera comes closer) and stays inside the new free area.
  await expect.poll(async () => (await framing(page))!.scale, { timeout: 20_000 }).toBeGreaterThan(f.scale * 1.2);
  await expect.poll(async () => distance(await camera(page)), { timeout: 20_000 }).toBeLessThan(before * 0.9);
});

test('a camera the reader moved is left alone when the HUD changes, until the next chapter', async ({ page }) => {
  await open(page, 1180, 820);
  await settled(page);
  const box = (await page.locator('.space-stage').boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.55);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.52, box.y + box.height * 0.5, { steps: 6 });
  await page.mouse.up();
  await settled(page);
  const moved = distance(await camera(page));
  await page.locator('.atlas-reader__handle').click();
  await page.waitForTimeout(1500);
  await settled(page);
  // No re-fit: the distance stays where the drag left it (a re-fit for the wider stage would bring it ~half as close).
  expect(Math.abs(distance(await camera(page)) / moved - 1)).toBeLessThan(0.01);
  // The next chapter is an authored view again: framed for the wider stage.
  const chapter = await page.evaluate(() => window.__atlas!.state().chapter);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => page.evaluate(() => window.__atlas!.state().chapter)).not.toBe(chapter);
  await expect.poll(async () => distance(await camera(page)), { timeout: 20_000 }).toBeLessThan(moved * 0.9);
});

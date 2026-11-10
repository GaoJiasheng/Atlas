import { expect, test, type Page } from '@playwright/test';

/**
 * four-taps is an island topic (`basemap.island`, lib/hud-framing.ts `islandZoom`): on a phone the
 * whole-island cameras zoom out until the island fits across the canvas, so Tuas South, its western
 * end, is no longer cut off at the left edge. The map's centre is the free rect's centre
 * (`data-hud-frame`, container px) and its zoom is `stats().zoom`. WEST / EAST: the longitudes of
 * land-sg's land at Tuas South and on Pulau Tekong.
 */
const WEST = 103.6057, EAST = 104.0885;

async function settled(page: Page) {
  expect(await page.evaluate(async () => {
    for (let i = 0; i < 200 && !window.__atlas; i++) await new Promise((resolve) => setTimeout(resolve, 50));
    return window.__atlas?.ready;
  })).toBe(true);
  await expect(page.locator('.ts-geo')).toHaveAttribute('data-status', 'ready');
  // The HUD re-fit eases the camera into the measured free rect (0.6 s after the HUD settles): wait for a still zoom.
  let last = NaN;
  await expect.poll(async () => {
    const zoom = await page.evaluate(() => window.__atlas!.stats().zoom as number);
    const still = zoom === last;
    last = zoom;
    return still;
  }, { intervals: [700], timeout: 15_000 }).toBe(true);
}

/** Page x of a point on the map, from the camera centre, the zoom and the free rect. */
const pageX = (page: Page, lng: number) => page.evaluate((at) => {
  const el = document.querySelector<HTMLElement>('[data-hud-frame]')!;
  const [x0, , x1] = el.dataset.hudFrame!.split(',').map(Number) as [number, number, number, number];
  const camera = window.__atlas!.state().camera as { center: [number, number] };
  const zoom = window.__atlas!.stats().zoom as number;
  return el.getBoundingClientRect().left + (x0 + x1) / 2 + ((at - camera.center[0]) / 360) * 512 * 2 ** zoom;
}, lng);

test.describe('four-taps island fit at 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const query of ['ch=background&b=1', 'ch=background&b=4', 'ch=new-taps&b=4', 'ch=a-reservoir-in-the-city&b=3']) {
    test(`Tuas South is inside the viewport (${query})`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/en/topics/four-taps/?${query}`);
      await settled(page);
      // stats().zoom is rounded to 0.1: at this zoom that moves Tuas by at most a few px, well inside the GAP margin.
      const x = await pageX(page, WEST);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(390);
      // The eastern end (Pulau Tekong) is on the canvas too.
      expect(await pageX(page, EAST)).toBeLessThan(390);
      expect(errors).toEqual([]);
    });
  }

  test('a close-up keeps its zoom (not a whole-island camera)', async ({ page }) => {
    await page.goto('/en/topics/four-taps/?ch=background&b=2');
    await settled(page);
    // Authored zoom 12 less the phone's frame shift (-1.33): the island fit leaves it alone.
    expect(await page.evaluate(() => window.__atlas!.stats().zoom)).toBeCloseTo(10.7, 1);
  });
});

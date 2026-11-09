import { expect, test, type Page } from '@playwright/test';

async function present(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(() => !!window.__atlas);
  await page.evaluate(() => window.__atlas!.ready);
  await page.evaluate(() => window.__atlas!.setMode('presentation', true, { instant: true }));
  await expect.poll(() => page.evaluate(() => window.__atlas!.state().modes.presentation)).toBe(true);
}
const clear = async (page: Page, panel: string) => {
  const box = await page.locator(panel).boundingBox();
  const card = await page.locator('[data-hud-panel="present"]').boundingBox();
  expect(box).not.toBeNull();
  expect(card).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(card!.y);
};

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test.describe(`stage panels at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });
    test('the microscope field shows in the presentation', async ({ page }) => {
      await present(page, '/en/topics/cells/?ch=microscope-try-it&b=1');
      await expect(page.locator('[data-microscope-field][data-location="stage"] canvas')).toBeVisible();
      await clear(page, '[data-stage-panel="microscope"]');
    });
    test('the heating curve shows once the beat reveals it', async ({ page }) => {
      await present(page, '/en/topics/heat/?ch=heating-curves&b=2');
      await expect(page.locator('[data-stage-chart="heat-curve"]')).toBeVisible();
      await expect(page.locator('[data-stage-chart-cursor]')).toHaveAttribute('data-stage-chart-cursor', '120');
      await clear(page, '[data-hud-panel="present-panel"]');
    });
    test('the solar year shows on the daylight chapter', async ({ page }) => {
      await present(page, '/en/topics/sun-earth-moon/?ch=singapore-daylight&b=2');
      await expect(page.locator('[data-stage-chart="solar-year"]')).toBeVisible();
      await clear(page, '[data-hud-panel="present-panel"]');
    });
  });
}

test('the panel leaves with the presentation and the HUD card takes over', async ({ page }) => {
  await present(page, '/en/topics/cells/?ch=microscope-try-it&b=1');
  await expect(page.locator('[data-location="stage"]')).toBeVisible();
  await page.evaluate(() => window.__atlas!.setMode('presentation', false, { instant: true }));
  await expect(page.locator('[data-location="stage"]')).toHaveCount(0);
});

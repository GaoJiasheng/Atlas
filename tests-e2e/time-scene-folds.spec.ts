import { expect, type Locator, type Page } from '@playwright/test';
import { hudTest as test } from './hud-layout';

async function open(page: Page, topic: string) {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`/en/topics/${topic}/`);
  await page.waitForFunction(() => window.__atlas?.state().room);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await page.evaluate(() => {
    window.__atlas!.setLeftColumn('open');
    window.__atlas!.setPlate(true);
    window.__atlas!.setLegends(true);
  });
}
async function keyboardFold(panel: Locator) {
  const header = panel.locator(':scope > .ts-fold__header > [data-fold-control]');
  const body = panel.locator(':scope > .ts-fold__body');
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await header.focus();
  await header.press('Space');
  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await expect(body).toBeHidden();
  await expect(header).toHaveAttribute('data-fold-tab', '');
  await expect(header).toContainText(/\S/);
  const box = await header.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(await body.evaluate((el) => getComputedStyle(el).display)).toBe('none');
  await header.press('Enter');
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect(body).toBeVisible();
}

for (const [topic, plateId] of [
  ['sample-dated-layers', 'plate'],
  ['southeast-asia', 'geography-plate'],
  ['sample-climate', 'climatology-plate'],
] as const) {
  test(`${topic}: overlay and plate reopen by keyboard, persist and restore after stage-only`, async ({ page }) => {
    await open(page, topic);
    const overlay = page.locator('.ts-overlay');
    const plate = page.locator(`[data-hud-panel="${plateId}"]`);
    await keyboardFold(overlay);
    await keyboardFold(plate);
    const header = overlay.locator(':scope > .ts-fold__header > [data-fold-control]');
    const close = overlay.locator('.ts-fold__close');
    if (await close.count()) {
      await close.click();
      await expect(header).toHaveAttribute('aria-expanded', 'false');
      await header.click();
    }
    await plate.locator('[data-fold-control]').first().click();
    await page.evaluate(() => window.__atlas!.setStageOnly(true));
    await expect(overlay.locator(':scope > .ts-fold__body')).toBeHidden();
    await header.click();
    await expect(overlay.locator(':scope > .ts-fold__body')).toBeVisible();
    await page.evaluate(() => window.__atlas!.setStageOnly(false));
    await expect(plate.locator(':scope > .ts-fold__body')).toBeHidden();
    await expect(overlay.locator(':scope > .ts-fold__body')).toBeVisible();
    await page.evaluate(() => window.__atlas!.goToChapter(window.__atlas!.chapters().at(-1)!, { instant: true }));
    await expect(plate.locator('[data-fold-control]').first()).toHaveAttribute('aria-expanded', 'false');
    await page.reload();
    await page.waitForFunction(() => window.__atlas?.ready);
    await expect(plate.locator('[data-fold-control]').first()).toHaveAttribute('aria-expanded', 'false');
    await expect(header).toHaveAttribute('aria-expanded', 'true');
  });
}

test('deep-time inset, geology plate and presentation evidence share host folds', async ({ page }) => {
  await open(page, 'sample-deep-time');
  await page.evaluate(() => window.__atlas!.setCard(true));
  await keyboardFold(page.locator('[data-hud-panel="geology-plate"]'));
  await keyboardFold(page.locator('[data-hud-panel="modern-inset"]'));
  await page.evaluate(() => window.__atlas!.setMode('presentation', true, { instant: true }));
  await keyboardFold(page.locator('[data-hud-panel="present-evidence"]'));
  await keyboardFold(page.locator('[data-hud-panel="reconstruction-age"]'));
});

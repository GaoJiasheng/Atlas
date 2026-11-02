import { expect, type Page } from '@playwright/test';
import { hudTest as test } from './hud-layout';

async function open(page: Page, topic: string, chapter: string) {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`/en/topics/${topic}/?ch=${chapter}`);
  await page.waitForFunction(() => window.__atlas?.ready);
}

async function reopen(page: Page, selector: string) {
  const head = page.locator(selector);
  await expect(head).toBeVisible();
  await expect(head).toHaveAttribute('aria-expanded', 'false');
  const box = (await head.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await head.focus();
  await page.keyboard.press('Space');
  await expect(head).toHaveAttribute('aria-expanded', 'true');
  expect(await page.evaluate(() => window.__atlas!.state().legends)).toBe(true);
}

test('Space KEY and explode controls follow the solver field, reopen by keyboard and retain manual state across chapters', async ({ page }) => {
  await open(page, 'sample-space', 'whole-thing');
  await page.evaluate(() => {
    window.__atlas!.setMode('exploded', true);
    window.__atlas!.setLegends(false);
  });
  const overlay = page.locator('[data-hud-panel="space-overlay"]');
  await expect(overlay.locator('.atlas-legend ul')).toBeHidden();
  await expect(overlay.locator('.space-bar')).toBeHidden();
  await reopen(page, '[data-hud-panel="space-overlay"] .atlas-legend > [data-fold-control]');
  await expect(overlay.locator('.atlas-legend ul')).toBeVisible();
  await expect(overlay.locator('.space-bar')).toBeVisible();
  await page.evaluate(() => {
    const a = window.__atlas!;
    a.setLegends(false);
    a.goToChapter(a.chapters()[1]!, { instant: true });
  });
  await expect(overlay.locator('.atlas-legend > [data-fold-control]')).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => window.__atlas!.state().manual.legendsOpen)).toBe(false);
});

test('Math equation and task keep labelled reopen headers through stage-only and restore', async ({ page }) => {
  await open(page, 'fractions', 'equivalent-fractions');
  await page.evaluate(() => window.__atlas!.setLegends(false));
  await expect(page.locator('.ms-equation')).toBeHidden();
  await reopen(page, '[data-hud-panel="equation"] > [data-fold-control]');
  await expect(page.locator('.ms-equation')).toBeVisible();
  await page.evaluate(() => {
    const a = window.__atlas!;
    (a.engine as unknown as { goToTask(step: string, index: number, opts: { instant: boolean }): void }).goToTask('equivalent-fractions', 0, { instant: true });
    a.setStageOnly(true);
  });
  const task = page.locator('[data-hud-panel="task"]');
  // The reader also folds in stage-only; reveal it to reach its task header.
  await page.evaluate(() => window.__atlas!.setReader(true));
  await expect(task.locator('.ms-tray')).toBeHidden();
  await reopen(page, '[data-hud-panel="task"] > [data-fold-control]');
  await expect(task.locator('.ms-tray')).toBeVisible();
  await page.evaluate(() => window.__atlas!.setStageOnly(false));
  await expect(task.locator('> [data-fold-control]')).toHaveAttribute('aria-expanded', 'true');
});

test('Math net tools fold with KEY and remain keyboard reachable', async ({ page }) => {
  await open(page, 'nets-and-solids', 'many-nets');
  await page.evaluate(() => window.__atlas!.setLegends(false));
  const tools = page.locator('[data-hud-panel="net-tools"]');
  await expect(tools.locator('.ms-net-tools')).toBeHidden();
  await reopen(page, '[data-hud-panel="net-tools"] > [data-fold-control]');
  await expect(tools.locator('.ms-net-tools')).toBeVisible();
  await expect(tools.locator('[data-turn="1"]')).toBeVisible();
});

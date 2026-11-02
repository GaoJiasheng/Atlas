import { expect, type Page } from '@playwright/test';
import { hudLayoutIssues, hudTest as test } from './hud-layout';

async function open(page: Page, topic: string) {
  await page.goto(`/en/topics/${topic}/`);
  await page.waitForFunction(() => window.__atlas);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__atlas!.state().room !== null)).toBe(true);
}
for (const topic of ['aircon', 'ww2', 'fractions']) {
  test(`${topic}: guide button, Shift+/ and Escape share state and registry`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await open(page, topic);
    const toggle = page.locator('.atlas-guide-toggle');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(page.locator('.atlas-guide')).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const keys = await page.evaluate(() => window.__atlas!.keymap());
    await expect(page.locator('.atlas-guide dl > div')).toHaveCount(keys.length);
    if (topic === 'aircon') await expect(page.locator('.atlas-guide')).toContainText('Right-drag');
    if (topic === 'ww2') {
      await expect(page.locator('.atlas-guide')).toContainText('double-click');
      await expect(page.locator('.atlas-guide')).not.toContainText('rotate');
    }
    if (topic === 'fractions') await expect(page.locator('.atlas-guide')).toContainText('Lessons have no rotating camera');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Shift+/');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.locator('.atlas-guide__head button').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('?');
    await page.locator('.atlas-stage').dispatchEvent('pointerdown', { pointerId: 1, pointerType: 'mouse' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
  test(`${topic}: manual folds, metadata, stage-only restore, chapter and reload persistence`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await open(page, topic);
    const cardFold = page.locator('.atlas-card__fold');
    if (await cardFold.isVisible()) {
      await cardFold.click();
      await expect(page.locator('.atlas-card__tab')).toBeVisible();
      await page.locator('.atlas-card__tab').click();
      await expect(page.locator('.atlas-card')).toBeVisible();
    }
    const keyHeader = page.locator('.atlas-legend > .atlas-fold').first();
    if (await keyHeader.isVisible()) {
      await keyHeader.click();
      await expect(keyHeader).toHaveAttribute('aria-expanded', 'false');
      await keyHeader.click();
      await expect(keyHeader).toHaveAttribute('aria-expanded', 'true');
    }
    const plateHeader = page.locator('.atlas-plate [data-hud-panel="plate"] button[aria-expanded]').first();
    if (await plateHeader.isVisible()) {
      await plateHeader.click();
      await expect(plateHeader).toHaveAttribute('aria-expanded', 'false');
      await plateHeader.click();
      await expect(plateHeader).toHaveAttribute('aria-expanded', 'true');
    }
    await page.getByRole('button', { name: 'Show / hide topic details', exact: true }).click();
    await expect(page.locator('.atlas-scene')).toHaveAttribute('data-left', 'compact');
    await expect(page.locator('.atlas-spec')).toBeHidden();
    await page.getByRole('button', { name: 'Fold topic column', exact: true }).click();
    const tab = page.locator('.atlas-left-tab');
    await expect(tab).toBeVisible();
    await expect(tab).toHaveAttribute('aria-expanded', 'false');
    const r = await tab.boundingBox();
    expect(r!.width).toBeGreaterThanOrEqual(44);
    expect(r!.height).toBeGreaterThanOrEqual(44);
    await tab.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.atlas-scene')).toHaveAttribute('data-left', 'open');
    await page.evaluate(() => {
      const a = window.__atlas!;
      a.setCard(false);
      a.setPlate(false);
      a.setLegends(false);
      a.setReader(false);
    });
    const before = await page.evaluate(() => {
      const { reader, card, plate, legends, leftColumn, panels } = window.__atlas!.state();
      return { reader, card, plate, legends, leftColumn, panels };
    });
    await page.keyboard.press('z');
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().stageOnly)).toBe(true);
    await tab.click();
    await expect(page.locator('.atlas-scene')).toHaveAttribute('data-left', 'open');
    await page.locator('[data-stage-only-toggle]').click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const { reader, card, plate, legends, leftColumn, panels } = window.__atlas!.state();
          return { reader, card, plate, legends, leftColumn, panels };
        }),
      )
      .toEqual(before);
    await page.evaluate(() => {
      const a = window.__atlas!;
      a.goToChapter(a.chapters()[1]!, { instant: true });
    });
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().card)).toBe(false);
    await page.reload();
    await page.waitForFunction(() => window.__atlas);
    await page.evaluate(() => window.__atlas!.ready);
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().plate)).toBe(false);
    await page.evaluate(() => window.__atlas!.setLeftColumn('collapsed'));
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().leftColumn)).toBe('collapsed');
  });
  for (const [width, height] of [
    [1180, 820],
    [1366, 1024],
    [1024, 1366],
    [1920, 1080],
    [390, 844],
  ]) {
    test(`${topic}: default room at ${width}×${height}`, async ({ page }) => {
      await page.setViewportSize({ width: width!, height: height! });
      await open(page, topic);
      await expect.poll(() => page.evaluate(() => window.__atlas!.state().room!.meetsShare)).toBe(true);
      await expect.poll(() => hudLayoutIssues(page)).toEqual([]);
      const drawer = height! > width! && width! < 1100;
      await expect(page.locator('.atlas-panel__toggle'))[drawer ? 'toBeVisible' : 'toBeHidden']();
      if (width === 1920) {
        const state = await page.evaluate(() => window.__atlas!.state());
        expect(state.leftColumn).toBe('open');
        expect(state.card).toBe(true);
        expect(state.legends).toBe(true);
      }
      const tab = page.locator('.atlas-left-tab');
      if (await tab.isVisible()) {
        await tab.click();
        await expect(page.locator('.atlas-scene')).toHaveAttribute('data-left', 'open');
      }
    });
  }
}
test.describe('first device visit', () => {
  test.use({ firstRun: true });
  test('auto-opens once, stays closed on second visit', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await open(page, 'aircon');
    await expect(page.locator('.atlas-guide')).toBeVisible();
    await page.locator('.atlas-guide__head button').click();
    await page.reload();
    await page.waitForFunction(() => window.__atlas);
    await page.evaluate(() => window.__atlas!.ready);
    await expect(page.locator('.atlas-guide')).toBeHidden();
  });
});

test.describe('touch controls', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 1180, height: 820 } });
  test('coarse pointers keep readable scale, real tap targets and touch instructions first', async ({ page }) => {
    await open(page, 'aircon');
    expect(
      await page.locator('.atlas-scene').evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--k'))),
    ).toBeGreaterThanOrEqual(1);
    await page.locator('.atlas-guide-toggle').tap();
    const pointer = (await page.locator('.atlas-guide [data-device="pointer"]').boundingBox())!;
    const touch = (await page.locator('.atlas-guide [data-device="touch"]').boundingBox())!;
    expect(touch.y).toBeLessThan(pointer.y);
    await page.locator('.atlas-guide__head button').tap();
    const tab = page.locator('.atlas-left-tab');
    await expect(tab).toBeVisible();
    const r = (await tab.boundingBox())!;
    expect(r.width).toBeGreaterThanOrEqual(44);
    expect(r.height).toBeGreaterThanOrEqual(44);
    await tab.tap();
    await expect(page.locator('.atlas-scene')).toHaveAttribute('data-left', 'open');
  });
});

import { expect, test, type Page } from '@playwright/test';
import { hudLayoutIssues, LAYOUT_SIZES } from './hud-layout';

const TOPICS = ['sample-time', 'sample-space'] as const;

async function openScene(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}

for (const topic of TOPICS) {
  for (const locale of ['en', 'zh'] as const) {
    test(`${topic} (${locale}): HUD layout has no overlap or overflow at 6 sizes`, async ({ page }) => {
      test.setTimeout(120_000);
      await openScene(page, `/${locale}/topics/${topic}/`);
      const problems: string[] = [];
      for (const [width, height] of LAYOUT_SIZES) {
        await page.setViewportSize({ width, height });
        await page.waitForTimeout(400);
        for (const chapter of await page.evaluate(() => window.__atlas!.chapters())) {
          await page.evaluate((id) => window.__atlas!.goToChapter(id, { instant: true }), chapter);
          await page.waitForTimeout(150);
          for (const issue of await hudLayoutIssues(page)) problems.push(`${width}x${height} ${chapter}: ${issue}`);
        }
      }
      expect(problems).toEqual([]);
    });
  }

  test(`${topic}: below 1280 px the VIEW row is a compact menu with every preset`, async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 1200 });
    await openScene(page, `/en/topics/${topic}/`);
    const ids = await page.evaluate(() => window.__atlas!.presets());
    expect(ids.length).toBeGreaterThan(1);
    await expect(page.locator('[data-preset]').first()).toBeHidden();
    const trigger = page.locator('.hud-viewmenu__btn');
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.locator('[data-preset-item]')).toHaveCount(ids.length);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-preset-item]')).toHaveCount(0);
    await trigger.click();
    await page.locator(`[data-preset-item="${ids[1]}"]`).click();
    await expect.poll(async () => (await page.evaluate(() => window.__atlas!.state())).preset).toBe(ids[1]);
    await expect(page.locator('[data-preset-item]')).toHaveCount(0);
    // Wide again: the row is back, the menu is gone.
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator(`[data-preset="${ids[1]}"]`)).toBeVisible();
    await expect(trigger).toBeHidden();
  });

  test(`${topic}: keys and HUD buttons share one state (window.__atlas)`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await openScene(page, `/en/topics/${topic}/`);
    const api = () => page.evaluate(() => window.__atlas!.state());
    const keymap = await page.evaluate(() => window.__atlas!.keymap());

    // Modes: each key flips the mode and its button's pressed state, twice.
    for (const binding of keymap.filter((k) => k.type === 'mode')) {
      const button = page.locator(`[data-mode="${binding.name}"]`);
      const before = (await api()).modes[binding.name];
      await page.keyboard.press(binding.key);
      await expect.poll(async () => (await api()).modes[binding.name]).toBe(!before);
      await expect(button).toHaveAttribute('aria-pressed', String(!before));
      await page.keyboard.press(binding.key);
      await expect.poll(async () => (await api()).modes[binding.name]).toBe(before);
    }

    // Presets: digit keys select the preset and its button.
    for (const binding of keymap.filter((k) => k.type === 'preset').reverse()) {
      await page.keyboard.press(binding.key);
      await expect.poll(async () => (await api()).preset).toBe(binding.name);
      await expect(page.locator(`[data-preset="${binding.name}"]`)).toHaveAttribute('aria-pressed', 'true');
    }

    // SPACE toggles pause; H hides the HUD and ESC brings it back.
    const paused = (await api()).paused;
    await page.keyboard.press(' ');
    await expect.poll(async () => (await api()).paused).toBe(!paused);
    await page.keyboard.press(' ');
    await expect.poll(async () => (await api()).paused).toBe(paused);

    await page.keyboard.press('h');
    await expect.poll(async () => (await api()).hud).toBe(false);
    await expect(page.locator('.atlas-topbar')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await api()).hud).toBe(true);
    await expect(page.locator('.atlas-topbar')).toBeVisible();

    // The test API drives the same state.
    await page.evaluate(() => window.__atlas!.setHud(false));
    await expect(page.locator('.atlas-hud-restore')).toBeVisible();
    await page.locator('.atlas-hud-restore').click();
    await expect.poll(async () => (await api()).hud).toBe(true);
    await page.evaluate(() => window.__atlas!.setTheme('cinema'));
    await expect.poll(async () => (await api()).appliedTheme).toBe('cinema');
    const stats = await page.evaluate(() => window.__atlas!.stats());
    expect(stats.buffer[0]).toBeGreaterThan(0);
  });
}

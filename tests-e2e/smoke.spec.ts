import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const LOCALES = ['en', 'zh'] as const;
const TOPICS = [
  { slug: 'sample-time', chapters: ['first-look', 'second-look', 'third-look'] },
  { slug: 'sample-space', chapters: ['whole-thing', 'pull-apart', 'switch-on'] },
] as const;

/** Headless chromium has no GPU; these are expected and harmless. */
const IGNORED = [/GPU stall/i, /swiftshader/i, /GL Driver Message/i, /WebGL.*(deprecated|fallback)/i, /GroupMarkerNotSet/i];

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  const keep = (text: string) => !IGNORED.some((re) => re.test(text));
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error' && keep(msg.text())) errors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    if (keep(err.message)) errors.push(`pageerror: ${err.message}`);
  });
  return errors;
}

test.beforeEach(async ({ page }) => {
  // Show every chapter (default reader level P3 folds P4+ chapters, which would stop the arrow-key walk).
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('atlas:level', 'P6');
    } catch {
      /* storage unavailable */
    }
  });
});

for (const locale of LOCALES) {
  test(`index (${locale}) lists both sample topics`, async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`/${locale}/`);
    await expect(page.locator('[data-topic]')).toHaveCount(2);
    await page.screenshot({ path: `tests-e2e/__screenshots__/index-${locale}.png` });
    expect(errors).toEqual([]);
  });

  for (const topic of TOPICS) {
    test(`${topic.slug} (${locale}): stage renders, arrows step chapters`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(`/${locale}/topics/${topic.slug}/`);

      // MapLibre (time) or three.js (space) canvas inside the stage.
      const canvas = page.locator('.atlas-stage canvas').first();
      await expect(canvas).toBeVisible({ timeout: 30_000 });
      await expect(canvas).toHaveJSProperty('tagName', 'CANVAS');
      const box = await canvas.boundingBox();
      expect(box?.width).toBeGreaterThan(200);
      expect(box?.height).toBeGreaterThan(150);
      await page.waitForTimeout(1500); // let tiles/models/first frames settle
      await page.screenshot({ path: `tests-e2e/__screenshots__/${topic.slug}-${locale}-ch1.png` });

      // Step through the chapters with the right arrow; the URL tracks the chapter (debounced).
      await page.locator('.atlas-scene').focus().catch(() => {});
      for (const [i, id] of topic.chapters.slice(1).entries()) {
        await page.keyboard.press('ArrowRight');
        await expect.poll(() => page.url(), { timeout: 10_000 }).toContain(`ch=${id}`);
        await page.waitForTimeout(2600); // camera fly / fade finishes
        await page.screenshot({ path: `tests-e2e/__screenshots__/${topic.slug}-${locale}-ch${i + 2}.png` });
      }

      // And back again.
      await page.keyboard.press('ArrowLeft');
      await expect.poll(() => page.url(), { timeout: 10_000 }).toContain(`ch=${topic.chapters[1]}`);

      expect(errors).toEqual([]);
    });
  }
}

test('deep link restores scene state (time + highlight, part + cutaway)', async ({ page }) => {
  await page.goto('/en/topics/sample-time/?ch=second-look&t=2000-03-01&hl=sample-meeting');
  await expect(page.locator('.atlas-stage canvas').first()).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(800);
  await expect(page.getByRole('slider').first()).toBeVisible();
  // The highlighted event label is pinned on the map.
  await expect(page.locator('.ts-label[data-pinned="true"]').first()).toBeAttached();
  // ...and the state survives the URL sync round trip.
  await page.waitForTimeout(600);
  expect(page.url()).toContain('hl=sample-meeting');
  expect(page.url()).toContain('t=2000-03-01');

  await page.goto('/en/topics/sample-space/?ch=pull-apart&cut=half');
  await expect(page.locator('.atlas-stage canvas').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('[data-mode="cutaway"]')).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(600);
  expect(page.url()).toContain('cut=half');
});

test('PWA: manifest linked, manifest and service worker served', async ({ page, request }) => {
  await page.goto('/en/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBe('/manifest.webmanifest');
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.short_name).toBe('Atlas');
  const sw = await request.get('/sw.js');
  expect(sw.ok()).toBe(true);
});

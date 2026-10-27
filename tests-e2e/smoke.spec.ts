import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const LOCALES = ['en', 'zh'] as const;
const TOPICS = [
  { slug: 'sample-time', chapters: ['first-look', 'second-look', 'third-look'] },
  { slug: 'sample-space', chapters: ['whole-thing', 'pull-apart', 'switch-on', 'inside-look'] },
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

const WW2_STATS = { en: '11 chapters · 78 events · 12 maps', zh: '11 章 · 78 个事件 · 12 幅地图' } as const;

for (const locale of LOCALES) {
  test(`index (${locale}) lists published topics only`, async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`/${locale}/`);
    // Draft sample topics are reachable by URL but not listed.
    await expect(page.locator('[data-topic]')).toHaveCount(38);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/ww1/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/southeast-asia/"]`)).toHaveCount(1);
    for (const region of ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'])
      await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/muscles-${region}/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/ww2/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/aircon/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/grasshopper/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/mosquito/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/frog-and-chicken/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/fractions/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/area-perimeter/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/telling-time/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/multiplication-division/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/decimals/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/measuring/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/nets-and-solids/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/b200-server/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/plant/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/digestive-system/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/heart-and-lungs/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/circuits/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/magnets/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/forces/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/energy-conversion/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/light-and-shadows/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/water/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/states-of-matter/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/living-things/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/materials/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/four-taps/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/flower-and-seed/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/inside-the-earth/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/steam-engine/"]`)).toHaveCount(1);
    await expect(page.locator(`[data-topic] a[href$="/${locale}/topics/fossils-and-skeletons/"]`)).toHaveCount(1);
    await expect(page.locator('[data-filter="subject"]:not([data-value=""])')).toHaveCount(6);
    await expect(page.locator('[data-filter="subject"][data-value="science"]')).toBeEnabled();
    await expect(page.locator('[data-filter="subject"][data-value="biology"]')).toBeEnabled();
    await expect(page.locator('[data-filter="subject"][data-value="math"]')).toBeEnabled();
    await expect(page.locator('[data-filter="subject"][data-value="computer"]')).toBeEnabled();
    await expect(page.locator('[data-filter="subject"][data-value="geography"]')).toBeEnabled();
    // Past nine topics the catalogue is one section per subject (SUBJECTS order, empty ones left out).
    await expect(page.locator('[data-catalogue="sections"]')).toHaveCount(1);
    await expect(page.locator('[data-section]')).toHaveCount(6);
    await expect(page.locator('[data-section="geography"] [data-topic]')).toHaveCount(3);
    await expect(page.locator('[data-section="biology"] [data-topic]')).toHaveCount(13);
    await expect(page.locator('[data-section="computer"] [data-topic]')).toHaveCount(1);
    // Card tags: subject, then the stage type (ww1, ww2 and four-taps are Time, aircon, circuits, magnets, forces, energy-conversion, light-and-shadows, water, states-of-matter, living-things, materials, grasshopper, mosquito, frog-and-chicken, plant, flower-and-seed, fossils-and-skeletons, steam-engine, digestive-system, heart-and-lungs, b200-server, inside-the-earth and the six muscle topics are Space, fractions, area-perimeter, multiplication-division, telling-time, decimals, measuring and nets-and-solids are Lessons). No status or sensitivity tags.
    await expect(page.locator('[data-topic] .atlas-badge')).toHaveCount(76);
    await page.locator('[data-filter="subject"][data-value="history"]').click();
    await expect(page.locator('[data-topic]:visible')).toHaveCount(2);
    await expect(page.locator('[data-catalogue-end]')).toBeHidden();
    await page.locator('[data-filter="subject"][data-value="science"]').click();
    await expect(page.locator('[data-topic]:visible')).toHaveCount(12);
    await page.locator('[data-filter="subject"][data-value="biology"]').click();
    await expect(page.locator('[data-topic]:visible')).toHaveCount(13);
    await expect(page.locator('[data-section="history"]')).toBeHidden();
    await page.locator('[data-filter="subject"][data-value="math"]').click();
    await expect(page.locator('[data-topic]:visible')).toHaveCount(7);
    await page.locator('[data-filter="subject"][data-value="computer"]').click();
    await expect(page.locator('[data-topic]:visible')).toHaveCount(1);
    await page.locator('[data-filter="subject"][data-value="geography"]').click();
    await expect(page.locator('[data-topic]:visible')).toHaveCount(3);
    await page.locator('[data-filter="subject"][data-value=""]').click();
    await expect(page.locator('[data-topic]:visible')).toHaveCount(38);
    await page.screenshot({ path: `tests-e2e/__screenshots__/index-${locale}.png` });
    expect(errors).toEqual([]);
  });

  test(`index (${locale}) frontispiece, category icons and plate cards`, async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(`/${locale}/`);
    // Frontispiece: the five featured topics are drawn (the six muscle topics are published but not featured); each drawing opens its topic and has a leader label.
    const front = page.locator('[data-frontispiece] .fp__box--wide');
    await expect(front).toBeVisible();
    await expect(front.locator('.fp__item')).toHaveCount(5);
    await expect(front.locator('.fp__label')).toHaveCount(5);
    await expect(front.locator('.fp__leaders path')).toHaveCount(5);
    await expect(front.locator('.fp__item').first()).toHaveAttribute('href', new RegExp(`/${locale}/topics/grasshopper/$`));
    await expect(front.locator('.fp__item img').first()).toHaveAttribute('alt', locale === 'en' ? 'Inside a Grasshopper' : '一只蝗虫的身体');
    await expect(front.locator('.fp__label').first()).toContainText('蝗虫');
    for (const img of await front.locator('img').all()) {
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    // Category tiles: a line icon each (All + six subjects); every subject now has a topic, so none is dotted or disabled.
    await expect(page.locator('[data-filter="subject"] svg.atlas-subject-icon')).toHaveCount(7);
    await expect(page.locator('[data-filter="subject"][data-soon]')).toHaveCount(0);
    await expect(page.locator('[data-filter="subject"][data-soon] svg[stroke-dasharray]')).toHaveCount(0);
    // Plate cards: one link each, numbered, with a drawing and a stats line counted from the topic data.
    await expect(page.locator('[data-topic] [data-plate]')).toHaveCount(38);
    await expect(page.locator('[data-topic] [data-figure="drawing"] img')).toHaveCount(38);
    const ww2 = page.locator('[data-topic]', { has: page.locator(`a[href$="/${locale}/topics/ww2/"]`) });
    await expect(ww2.locator('[data-stats]')).toHaveText(WW2_STATS[locale]);
    await expect(ww2.locator('.plate__no')).toHaveText(locale === 'en' ? 'Plate 38' : '图版 38');
    await expect(page.locator('[data-topic] [data-stats]:empty')).toHaveCount(0);
    // Reserved image boxes: no layout shift while drawings load.
    const box = await page.locator('[data-topic] [data-figure] img').first().boundingBox();
    expect(Math.abs((box?.width ?? 0) - (box?.height ?? 1))).toBeLessThan(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h2#plates-title')).toBeVisible();
    await expect(page.locator('.atlas-exlibris')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('index: a plate whose drawing fails to load falls back to the dotted placeholder', async ({ page }) => {
  await page.route('**/illustrations/ww1*.webp', (route) => route.abort());
  await page.goto('/en/');
  const ww1 = page.locator('[data-topic]', { has: page.locator('a[href$="/en/topics/ww1/"]') });
  await ww1.scrollIntoViewIfNeeded();
  await expect(ww1.locator('[data-figure="placeholder"] [data-placeholder]')).toBeVisible();
  await expect(ww1.locator('[data-placeholder] svg[data-icon="history"]')).toBeVisible();
  await expect(page.locator('[data-figure="placeholder"]')).toHaveCount(1);
});

test('index on a phone: two-drawing frontispiece, plates stacked, category row scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  await expect(page.locator('[data-frontispiece] .fp__box--wide')).toBeHidden();
  const narrow = page.locator('[data-frontispiece] .fp__box--narrow');
  await expect(narrow).toBeVisible();
  await expect(narrow.locator('.fp__item')).toHaveCount(2);
  const row = page.locator('.home__cats');
  expect(await row.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const card = page.locator('[data-topic] [data-plate]').first();
  const figure = await card.locator('[data-figure]').boundingBox();
  const title = await card.locator('.plate__title').boundingBox();
  expect((figure?.y ?? 0) + (figure?.height ?? 0)).toBeLessThanOrEqual(title?.y ?? 0);
});

for (const locale of LOCALES) {
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
      await expect.poll(() => page.url(), { timeout: 10_000 }).toContain(`ch=${topic.chapters[topic.chapters.length - 2]}`);

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

test('per-topic bloc labels: the ww1 key names the Entente, not the site-wide "Allies"', async ({ page }) => {
  // topic.yaml blocLabels: allied = Allies (Entente) / 协约国, axis = Central Powers / 同盟国.
  await page.goto('/zh/topics/ww1/');
  await expect(page.locator('.atlas-stage canvas').first()).toBeVisible({ timeout: 30_000 });
  const legend = page.locator('.atlas-legend').first();
  await expect(legend).toContainText('协约国');
  await expect(legend).toContainText('同盟国');
  await expect(legend).not.toContainText('轴心国');
  await page.goto('/en/topics/ww1/');
  await expect(page.locator('.atlas-legend').first()).toContainText('Allies (Entente)');
  await expect(page.locator('.atlas-legend').first()).toContainText('Central Powers');
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

test('regional plate (sample-region): no world land, BCE labels, dated rivers, holder key, t round trip', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const geo: string[] = [];
  page.on('request', (r) => {
    const m = /\/geo\/([^/?]+\.json)/.exec(r.url());
    if (m) geo.push(m[1]!);
  });
  await page.goto('/en/topics/sample-region/?ch=second-look&t=-0350');
  await expect(page.locator('.atlas-stage canvas').first()).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(1500);
  // Only the plate's own files: never the world land, the Southeast Asia overlay or modern borders.
  expect(geo).toEqual(expect.arrayContaining(['sample-region-land.json', 'sample-region-rivers.json']));
  for (const world of ['land-50m.json', 'land-10m-sea.json', 'borders-50m.json', 'countries-50m.json']) expect(geo).not.toContain(world);
  // Segment labels and the readout print BCE years, never "-0400-01".
  await expect(page.locator('.ts-seg__date').first()).toHaveText('400 BCE');
  await expect(page.locator('.ts-seg__date', { hasText: /^-\d/ })).toHaveCount(0);
  // 350 BCE: the old course shows, the new one not yet; the modern course never.
  await expect(page.locator('.ts-river[data-river="sample-river-old"]')).toBeAttached();
  await expect(page.locator('.ts-river[data-river="sample-river-new"]')).toHaveCount(0);
  await expect(page.locator('.ts-river[data-river="sample-river-modern"]')).toHaveCount(0);
  // No modern borders mode on a plate; the key lists the states one by one and the approximate border.
  await expect(page.locator('[data-mode="borders"]')).toHaveCount(0);
  const legend = page.locator('.atlas-legend').first();
  for (const name of ['East Sample', 'North Sample', 'West Sample', 'Approximate border']) await expect(legend).toContainText(name);
  // The BCE time survives the URL sync.
  await page.waitForTimeout(600);
  expect(page.url()).toContain('t=-0350');
  expect(errors).toEqual([]);
});

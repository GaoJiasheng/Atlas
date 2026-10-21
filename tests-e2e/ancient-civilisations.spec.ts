import { expect, test, type Page } from '@playwright/test';

/**
 * ancient-civilisations (docs/43, draft): the Old World plate, chapters in date
 * order, BCE and CE labels on one axis (E1), dated river courses, the
 * Southeast Asian sphere layers, and the Chinese text.
 */
type LayerStats = { total: number; visible: number };

async function open(page: Page, query: string, locale = 'en') {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`/${locale}/topics/ancient-civilisations/?${query}`);
  expect(await page.evaluate(async () => {
    for (let i = 0; i < 200 && !window.__atlas; i++) await new Promise((resolve) => setTimeout(resolve, 50));
    return window.__atlas?.ready;
  })).toBe(true);
  await expect(page.locator('.ts-geo')).toHaveAttribute('data-status', 'ready', { timeout: 30_000 });
}

async function beat(page: Page, chapter: string, index: number) {
  const beats = await page.evaluate(() => window.__atlas!.beats());
  const i = beats.findIndex((b) => b.chapter === chapter && b.index === index);
  expect(i).toBeGreaterThanOrEqual(0);
  await page.evaluate((n) => window.__atlas!.goToBeat(n, { instant: true }), i);
}

test('plate files only, chapters in date order, BCE and CE on one axis', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const geo: string[] = [];
  page.on('request', (r) => {
    const m = /\/geo\/([^/?]+\.json)/.exec(r.url());
    if (m) geo.push(m[1]!);
  });
  await open(page, '');
  expect(await page.evaluate(() => window.__atlas!.chapters())).toEqual([
    'background', 'sumerian-cities', 'ancient-egypt', 'indian-subcontinent', 'china', 'greece-and-rome',
    'southeast-asia-seas', 'southeast-asia-kingdoms', 'legacies',
  ]);
  // 3 + 4 + 5 + 5 + 4 + 5 + 5 + 5 + 5 beats.
  expect((await page.evaluate(() => window.__atlas!.beats())).length).toBe(41);
  expect(geo).toEqual(expect.arrayContaining(['ancient-world-plate.json', 'ancient-rivers.json']));
  for (const world of ['land-50m.json', 'land-10m-sea.json', 'borders-50m.json']) expect(geo).not.toContain(world);
  // Segment labels: BCE years, then years 1–999 marked CE, later years bare; never ISO strings.
  const labels = await page.locator('.ts-seg__date').allTextContents();
  expect(labels).toEqual(expect.arrayContaining(['3200 BCE', '508 BCE', '150 CE', '802 CE', '2021']));
  expect(labels.filter((l) => /^-?\d{4}(-\d\d)?$/.test(l) && l !== '2021')).toEqual([]);
  expect(errors).toEqual([]);
});

test('the Yellow River shows its old course before 602 BCE and only today’s upper river after 11 CE', async ({ page }) => {
  await open(page, 'ch=china&t=-1250');
  await expect(page.locator('.ts-river[data-river="river-huang-before-602"]')).toBeAttached();
  await expect(page.locator('.ts-river[data-river="river-huang-old-trunk"]')).toBeAttached();
  await beat(page, 'china', 3); // 105 CE (indices are 0-based)
  await expect(page.locator('.ts-river[data-river="river-huang-before-602"]')).toHaveCount(0);
  await expect(page.locator('.ts-river[data-river="river-huang-old-trunk"]')).toHaveCount(0);
  await expect(page.locator('.ts-river[data-river="river-huang"]')).toBeAttached();
});

test('Southeast Asian kingdoms are dated sphere layers, and the events are labelled', async ({ page }) => {
  await open(page, 'ch=southeast-asia-seas');
  const layers = () => page.evaluate(() => (window.__atlas!.stats() as unknown as { datedLayers: Record<string, LayerStats> }).datedLayers);
  await expect.poll(async () => (await layers())?.['srivijaya-sphere']?.total).toBeGreaterThan(0);
  await beat(page, 'southeast-asia-seas', 2); // 683 CE
  await expect.poll(async () => (await layers())['srivijaya-sphere']?.visible).toBe(1);
  await expect(page.locator('.ts-co[data-id="kedukan-bukit-683"]')).toBeVisible();
  await beat(page, 'southeast-asia-kingdoms', 2); // 1365 CE
  await expect.poll(async () => (await layers())['majapahit-sphere']?.visible).toBe(1);
  await expect.poll(async () => (await layers())['khmer-sphere']?.visible).toBe(1);
  await expect(page.locator('.ts-co[data-id="nagarakretagama-1365"]')).toBeVisible();
});

test('Chinese text: names and the reading note', async ({ page }) => {
  await open(page, 'ch=ancient-egypt', 'zh');
  const reader = page.locator('[data-hud-panel="reader"]');
  await expect(reader).toContainText('古埃及象形文字（学名圣书体）');
  await page.evaluate(() => window.__atlas!.goToChapter('southeast-asia-kingdoms', { instant: true }));
  await expect(reader).toContainText('伊斯干达沙');
  await expect(reader).toContainText('拜里米苏拉');
  await expect(reader).not.toContainText('喔㕭');
  await page.evaluate(() => window.__atlas!.goToChapter('background', { instant: true }));
  await expect(reader).toContainText('空白的地方并不是没有人');
});

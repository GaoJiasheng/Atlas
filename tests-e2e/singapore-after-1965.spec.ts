import { expect, test, type Page } from '@playwright/test';

/** singapore-after-1965 (docs/42): chapters in order, events labelled on their chapter, the reused estates layer, zh. */
type LayerStats = { total: number; visible: number };

async function open(page: Page, query: string, locale = 'en') {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`/${locale}/topics/singapore-after-1965/?${query}`);
  expect(await page.evaluate(async () => {
    for (let i = 0; i < 200 && !window.__atlas; i++) await new Promise((resolve) => setTimeout(resolve, 50));
    return window.__atlas?.ready;
  })).toBe(true);
  await expect(page.locator('.ts-geo')).toHaveAttribute('data-status', 'ready');
}

async function beat(page: Page, chapter: string, index: number) {
  const beats = await page.evaluate(() => window.__atlas!.beats());
  const i = beats.findIndex((b) => b.chapter === chapter && b.index === index);
  expect(i).toBeGreaterThanOrEqual(0);
  await page.evaluate((n) => window.__atlas!.goToBeat(n, { instant: true }), i);
}

test('chapters run in date order and each chapter labels its event', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await open(page, '');
  expect(await page.evaluate(() => window.__atlas!.chapters())).toEqual([
    'background', 'defence', 'symbols', 'neighbours', 'british-withdrawal', 'living-together', 'costs-and-national-day',
  ]);
  for (const [chapter, event, title] of [
    ['defence', 'safti-founded-1966', 'An army from scratch'],
    ['symbols', 'first-national-day-1966', 'the national symbols'],
    ['neighbours', 'konfrontasi-ends-1966', 'Neighbours and Total Defence'],
    ['costs-and-national-day', 'press-detentions-1971', 'Costs, debates and National Day'],
  ] as const) {
    await page.evaluate((id) => window.__atlas!.goToChapter(id, { instant: true }), chapter);
    await expect(page.locator(`.ts-co[data-id="${event}"]`)).toBeVisible();
    await expect(page.locator('[data-hud-panel="reader"]')).toContainText(title);
  }
  // No participants in this topic: no participation card, not an empty frame (docs/06).
  await expect(page.locator('#atlas-card')).toHaveCount(0);
  // Every beat of the topic: 4 + 4 + 5 + 4 + 5 + 4 + 4.
  expect((await page.evaluate(() => window.__atlas!.beats())).length).toBe(30);
  expect(errors).toEqual([]);
});

test('the industrial estates of the land-use topic appear in chapter 04 only', async ({ page }) => {
  await open(page, 'ch=british-withdrawal');
  const estates = () => page.evaluate(() => (window.__atlas!.stats() as unknown as {
    datedLayers: Record<string, LayerStats>;
  }).datedLayers['industrial-estates']);
  await expect.poll(async () => (await estates())?.total).toBeGreaterThan(0);
  expect((await estates())?.visible).toBe(0);
  await beat(page, 'british-withdrawal', 2);
  await expect.poll(async () => (await estates())?.visible).toBe(1);
  await expect(page.locator('.ts-co[data-id="jtc-founded"]')).toBeVisible();
});

test('Chinese: Singapore names and the reading panel', async ({ page }) => {
  await open(page, 'ch=living-together', 'zh');
  const reader = page.locator('[data-hud-panel="reader"]');
  await expect(reader).toContainText('和谐共处：语言与种族和谐');
  await expect(reader).toContainText('奥斯曼渥');
  await expect(reader).not.toContainText('奥斯曼·渥');
  await expect(page.locator('.ts-co[data-id="muslim-law-act-1966"]')).toContainText('回教法执行法令');
  await page.evaluate(() => window.__atlas!.goToChapter('symbols', { instant: true }));
  await expect(reader).toContainText('胡姬');
  await expect(reader).toContainText('《前进吧，新加坡！》');
});

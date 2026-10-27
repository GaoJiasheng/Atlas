import { expect, test, type Page } from '@playwright/test';

type MissionStats = { recordedEvents: number; activeEvents: number; eventMarkers: number; activeBattles: number };
const stats = (page: Page) => page.evaluate(() => window.__atlas!.stats() as unknown as MissionStats);
async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/sample-missions/?${query}`);
  expect(await page.evaluate(async () => {
    for (let i = 0; i < 200 && !window.__atlas; i++) await new Promise((resolve) => setTimeout(resolve, 50));
    return window.__atlas?.ready;
  })).toBe(true);
  await expect.poll(async () => (await stats(page)).recordedEvents).not.toBeUndefined();
}

for (const locale of ['en', 'zh']) {
  test(`${locale}: mission settings, exact-day counts, historical markers and unlocated evidence`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await open(page, 'ch=dated-evidence&b=1', locale);
    await expect.poll(() => stats(page)).toMatchObject({ recordedEvents: 0, activeEvents: 0, eventMarkers: 0 });
    await expect(page.locator('.ts-card__row[data-entity]')).toHaveCount(2);
    expect(await page.locator('.ts-card__row[data-entity]').evaluateAll((rows) => rows.map((row) => row.getAttribute('data-entity')))).toEqual(['programme-a', 'programme-b']);
    await expect(page.locator('.ts-card')).toContainText(locale === 'en' ? 'not the founding dates' : '不是国家成立日期');
    await expect(page.getByText(/KM²/)).toHaveCount(0);
    await expect(page.locator('.ts-state')).not.toContainText(/BATTLES|MOVEMENTS|战斗/);

    await open(page, 'ch=dated-evidence&b=2', locale);
    await expect.poll(() => stats(page)).toMatchObject({ recordedEvents: 2, activeEvents: 2, eventMarkers: 2, activeBattles: 0 });
    await expect(page.locator('.ts-state [data-stat="recorded-events"]')).toContainText(locale === 'en' ? 'Events' : '事件');
    await expect(page.locator('[data-layer="battles"]')).toContainText(locale === 'en' ? 'Events' : '事件');
    await expect(page.locator('.ts-co[data-id="fixture-lunar-outcome"] .ts-co__badge')).toHaveText(locale === 'en' ? 'Moon surface · associated launch centre' : '月面任务 · 关联发射中心');
    const context = await page.evaluate(() => (window.__atlas!.engine.missionContext as unknown as (id: string) => unknown)('fixture-lunar-outcome'));
    expect(context).toEqual({ setting: 'moon-surface', anchorRole: 'associated-launch-centre', anchorSite: 'site-fixture-centre', relatedSites: [], occurredAt: '1969-07-20T20:17:39Z', at: [-80.64861111111112, 28.52472222222222] });
    const lunarRow = page.locator('.ts-index__row[data-event="fixture-lunar-outcome"]');
    expect((await lunarRow.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await lunarRow.click();
    const inspector = page.locator('[data-mission-context="fixture-lunar-outcome"]');
    await expect(inspector).toContainText('1969-07-20T20:17:39Z');
    await expect(inspector).toContainText(locale === 'en' ? 'Map point: associated launch centre' : '地图点：关联发射中心');
    await expect(page.locator('.ts-event__kind')).toHaveText(locale === 'en' ? 'Events' : '事件');

    await open(page, 'ch=dated-evidence&b=3', locale);
    await expect.poll(() => stats(page)).toMatchObject({ recordedEvents: 3, activeEvents: 1, eventMarkers: 2 });
    await expect(page.locator('.ts-co[data-id="fixture-retrospective"]')).toHaveCount(0);
    await page.locator('.ts-index__row[data-event="fixture-retrospective"]').click();
    await expect(page.locator('#ts-event-fixture-retrospective')).toBeVisible();
    await expect(page.locator('.ts-event__mission')).toHaveCount(0);
    await expect(page.getByText(/KM²/)).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('deep-link and presentation state share mission semantics, highlights and both themes', async ({ page }) => {
  await open(page, 'ch=dated-evidence&b=2');
  const linked = await page.evaluate(() => ({ highlight: (window.__atlas!.state() as unknown as { highlight: string[] }).highlight, context: (window.__atlas!.engine.missionContext as unknown as (id: string) => unknown)('fixture-lunar-outcome') }));
  const beats = await page.evaluate(() => window.__atlas!.beats());
  const index = beats.findIndex((beat) => beat.chapter === 'dated-evidence' && beat.index === 1);
  expect(index).toBeGreaterThanOrEqual(0);
  for (const theme of ['paper', 'cinema'] as const) {
    await page.evaluate((value) => window.__atlas!.setTheme(value), theme);
    await page.evaluate((value) => window.__atlas!.goToBeat(value, { instant: true }), index);
    await expect.poll(() => stats(page)).toMatchObject({ recordedEvents: 2, activeEvents: 2, eventMarkers: 2 });
    expect(await page.evaluate(() => ({ highlight: (window.__atlas!.state() as unknown as { highlight: string[] }).highlight, context: (window.__atlas!.engine.missionContext as unknown as (id: string) => unknown)('fixture-lunar-outcome') }))).toEqual(linked);
    await expect(page.locator('.ts-co[data-id="fixture-lunar-outcome"] .ts-co__badge')).toHaveText('Moon surface · associated launch centre');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  }
});

test('phone: chapter evidence has touch targets and preserves unlocated inspector access', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'ch=dated-evidence&b=3');
  const reader = page.locator('.atlas-panel__toggle');
  if (await reader.getAttribute('aria-expanded') === 'false') await reader.click();
  const line = page.locator('.ts-beatline');
  await expect(line).toContainText('3/3');
  const prev = page.locator('[data-time-beat="prev"]');
  const next = page.locator('[data-time-beat="next"]');
  for (const control of [prev, next]) {
    const box = await control.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  await prev.click();
  await expect(line).toContainText('2/3');
  await expect.poll(() => stats(page)).toMatchObject({ recordedEvents: 2, activeEvents: 2, eventMarkers: 2 });
  await next.click();
  await expect(line).toContainText('3/3');
  const row = page.locator('.ts-index__row[data-event="fixture-retrospective"]');
  await row.scrollIntoViewIfNeeded();
  expect((await row.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await row.click();
  await expect(page.locator('#ts-event-fixture-retrospective')).toBeVisible();
  expect(await page.evaluate(() => {
    const line = document.querySelector('.ts-beatline')!;
    const detail = document.querySelector('#ts-event-fixture-retrospective')!;
    const body = document.querySelector('.atlas-prose')!;
    const index = document.querySelector('.ts-index')!;
    const before = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    return before(line, detail) && before(detail, body) && before(body, index);
  })).toBe(true);
  await expect(page.locator('.ts-co[data-id="fixture-retrospective"]')).toHaveCount(0);
});

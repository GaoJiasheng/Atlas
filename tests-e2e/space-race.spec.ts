/** Run outside the build sandbox: CI=1 ATLAS_E2E_PORT=5448 pnpm e2e space-race. */
import { expect, test, type Page } from '@playwright/test';

type Mission = { setting: string; anchorRole: string; anchorSite: string; relatedSites: string[]; occurredAt?: string; at: number[] };
type Engine = { missionContext(id: string): Mission | null };
type State = { chapter: string; beat: number | null; t: string; highlight: string[]; presentation: { chapter: string; beat: number } | null };
const state = (page: Page) => page.evaluate(() => window.__atlas!.state() as unknown as State);
const mission = (page: Page, id: string) => page.evaluate((id) => (window.__atlas!.engine as unknown as Engine).missionContext(id), id);
const reader = (page: Page) => page.locator('[data-hud-panel="reader"]');

async function open(page: Page, query = '', locale = 'en') {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`/${locale}/topics/space-race/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect(page.locator('.ts-geo')).toHaveAttribute('data-status', 'ready');
}

test('all forty beats have accessible evidence and non-war programme statistics', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await open(page);
  expect(await page.evaluate(() => window.__atlas!.chapters())).toEqual([
    'background', 'beeps-and-probes', 'people-in-orbit', 'rehearsals-and-surveys', 'losses-and-tests', 'eight-days', 'robots-and-stations', 'costs-and-connections',
  ]);
  const beats = await page.evaluate(() => window.__atlas!.beats());
  expect(beats).toHaveLength(40);
  for (const chapter of ['beeps-and-probes', 'people-in-orbit', 'rehearsals-and-surveys', 'losses-and-tests', 'eight-days', 'robots-and-stations', 'costs-and-connections']) {
    await page.evaluate((id) => window.__atlas!.goToChapter(id, { instant: true }), chapter);
    await expect.poll(async () => (await state(page)).chapter).toBe(chapter);
    await expect(reader(page).locator(`[data-chapter-body="${chapter}"]`)).toBeVisible();
    expect((await state(page)).highlight).toHaveLength(1);
  }
  await expect(page.locator('.ts-card__row:not(.ts-card__rest)')).toHaveCount(2);
  await expect(page.locator('.ts-svg__band')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(/KM²|BATTLES|MOVEMENTS|Axis powers|Allied powers/);
  await expect.poll(() => page.evaluate(() => (window.__atlas!.stats() as unknown as { recordedEvents: number }).recordedEvents)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('a Moon result labels its actual setting before selection and retains its launch-centre meaning in the inspector', async ({ page }) => {
  await open(page, 'ch=eight-days&b=3');
  await expect.poll(async () => (await state(page)).t).toBe('1969-07-20');
  const marker = page.locator('.ts-co[data-id="ev-eagle-touchdown"]');
  await expect(marker).toBeVisible();
  await expect(marker).toContainText(/Moon surface/i);
  await expect(marker).toContainText(/associated launch centre/i);
  expect(await mission(page, 'ev-eagle-touchdown')).toMatchObject({
    setting: 'moon-surface', anchorRole: 'associated-launch-centre', anchorSite: 'site-kennedy',
    occurredAt: '1969-07-20T20:17:39Z', at: [-80.64861111111112, 28.52472222222222],
  });
  await marker.click();
  await expect(page.locator('.atlas-reader-top .ts-event')).toBeVisible();
  await expect(page.locator('.ts-event')).toContainText(/Moon surface/i);
  await expect(page.locator('.ts-event')).toContainText(/associated launch centre/i);
  await expect(page.locator('.ts-event')).toContainText('1969-07-20T20:17:39Z');
  await expect(page.locator('.ts-event')).toContainText('Collins');
  await page.locator('.ts-event__header button').click();
  await expect(page.locator('.ts-event')).toHaveCount(0);
  expect((await state(page)).highlight).toEqual(['ev-eagle-touchdown']);
  expect((await state(page)).beat).toBe(2);
});

test('beat link, chapter-axis tick and PRESENT reach the same date, evidence and mission context', async ({ page }) => {
  await open(page, 'ch=eight-days&b=3');
  const linked = await state(page);
  const context = await mission(page, 'ev-eagle-touchdown');
  await page.locator('.ts-seg__btn[data-segment="eight-days"]').click({ position: { x: 6, y: 38 } });
  await page.locator('.ts-seg__tick[data-beat="eight-days.2"]').click();
  await expect.poll(async () => (await state(page)).beat).toBe(2);
  const axis = await state(page);
  expect({ t: axis.t, highlight: axis.highlight }).toEqual({ t: linked.t, highlight: linked.highlight });
  expect(await mission(page, 'ev-eagle-touchdown')).toEqual(context);
  await page.keyboard.press('p');
  await expect.poll(async () => (await state(page)).presentation).toMatchObject({ chapter: 'eight-days', beat: 2 });
  expect((await state(page)).highlight).toEqual(linked.highlight);
  expect(await mission(page, 'ev-eagle-touchdown')).toEqual(context);
  await page.keyboard.press('p');
});

test('Chinese preserves historical Singapore time, source mass and timeline-only account meaning', async ({ page }) => {
  await open(page, 'ch=eight-days&b=4', 'zh');
  await expect(reader(page)).toContainText('03:47');
  await expect(reader(page)).toContainText('10:26');
  await expect(reader(page)).toContainText('21.55');
  expect(await mission(page, 'ev-armstrong-step')).toMatchObject({ setting: 'moon-surface', occurredAt: '1969-07-21T02:56:15Z' });
  await page.evaluate(() => window.__atlas!.goToChapter('costs-and-connections', { instant: true }));
  await expect(reader(page)).toContainText(/账目范围|口径/);
  await expect(page.locator('.ts-co[data-id="ev-n-one-costs"]')).toHaveCount(0);
  await expect(page.locator('.ts-co[data-id="ev-costs-human"]')).toHaveCount(0);
  await reader(page).locator('[data-time-target="ev-n-one-costs"]').click();
  await expect(page.locator('.ts-event')).toContainText(/卢布/);
  await expect(page.locator('.ts-event [data-mission-context]')).toHaveCount(0);
  expect(await mission(page, 'ev-n-one-costs')).toBeNull();
  const cooperation = await mission(page, 'ev-apollo-soyuz-dock');
  expect(cooperation?.setting).toBe('earth-orbit');
  expect(cooperation?.relatedSites).toContain('site-baikonur');
  await expect(page.locator('body')).not.toContainText(/轴心|同盟国|控制面积/);
});

test('a phone in cinema retains the reader and uses only local assets', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => { if (/^https?:/.test(r.url()) && !['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname)) external.push(r.url()); });
  await open(page, 'ch=eight-days&b=3');
  await page.evaluate(() => window.__atlas!.setTheme('cinema'));
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(reader(page)).toContainText('Collins');
  await expect(page.locator('.ts-seg__tick[data-beat="eight-days.2"]')).toBeAttached();
  await expect(page.locator('a[href*="/topics/saturn-v/"],a[href*="/topics/sun-earth-moon/"]')).toHaveCount(0);
  expect(external).toEqual([]);
});

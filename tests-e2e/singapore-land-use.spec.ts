import { expect, test, type Page } from '@playwright/test';

/** singapore-land-use (docs/34): dated layers follow the playhead, the PLATE count reads, legend rows toggle, zh. */
type LayerStats = { total: number; visible: number; recent: number; filterUpdates: number };
const dated = (page: Page) => page.evaluate(() => (window.__atlas!.stats() as unknown as {
  datedLayers: Record<string, LayerStats>;
}).datedLayers);

async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/singapore-land-use/?${query}`);
  expect(await page.evaluate(async () => {
    for (let i = 0; i < 200 && !window.__atlas; i++) await new Promise((resolve) => setTimeout(resolve, 50));
    return window.__atlas?.ready;
  })).toBe(true);
  // The layers are fetched and decoded after the map is ready (ten thousand HDB blocks): seconds on a loaded machine.
  await expect.poll(async () => Object.keys(await dated(page)).sort(), { timeout: 20_000 })
    .toEqual(['estates', 'farm-parks', 'hdb-blocks', 'reserves', 'reservoirs']);
}

async function beat(page: Page, chapter: string, index: number) {
  const beats = await page.evaluate(() => window.__atlas!.beats());
  const i = beats.findIndex((b) => b.chapter === chapter && b.index === index);
  expect(i).toBeGreaterThanOrEqual(0);
  await page.evaluate((n) => window.__atlas!.goToBeat(n, { instant: true }), i);
}

test('HDB dots and estates follow the year; the PLATE count and legend row track the layer', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await open(page, 'ch=crowded-city&t=1965');
  // Blocks standing today that were finished by 1965 (dated-layers-report.md).
  await expect.poll(async () => (await dated(page))['hdb-blocks']?.visible).toBe(244);
  expect((await dated(page))['hdb-blocks']).toMatchObject({ total: 10644 });
  const plate = page.locator('[data-hud-panel="plate"]');
  await expect(plate.locator('[data-dated-count="hdb-blocks"] dt')).toHaveText('HDB blocks');
  await expect(plate).toContainText('244');

  // The legend row and LAYERS switch share the store; switching off clears dots, legend row and count.
  const legend = page.locator('.atlas-legend').first();
  const label = 'HDB blocks standing today, by year completed';
  await expect(legend).toContainText(label);
  const toggle = page.locator('[data-layer="hdb-blocks"]');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(legend).not.toContainText(label);
  await expect.poll(async () => (await dated(page))['hdb-blocks']?.visible).toBe(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(legend).toContainText(label);
  await expect.poll(async () => (await dated(page))['hdb-blocks']?.visible).toBe(244);
  // 1990: the last beat of New towns (presentation; the HUD is hidden).
  await beat(page, 'new-towns', 4);
  await expect.poll(async () => (await dated(page))['hdb-blocks']?.visible).toBe(5060);
  await expect(plate).toContainText('5,060');
  // Jurong's area is one piece per coast era: exactly one is visible at any time.
  expect((await dated(page)).estates?.visible).toBe(1);

  expect(errors).toEqual([]);
});

test('farmland, reserves and reservoirs appear in their own years', async ({ page }) => {
  await open(page, 'ch=farms-and-food');
  // 1975: no agrotechnology parks yet; 1986: today's farmland in Lim Chu Kang appears.
  await beat(page, 'farms-and-food', 0);
  await expect.poll(async () => (await dated(page))['farm-parks']?.visible).toBe(0);
  await beat(page, 'farms-and-food', 2);
  await expect.poll(async () => (await dated(page))['farm-parks']?.visible).toBe(1);
  // A chapter switches its layers on at once but re-filters them for the new year on the next map render: a count that
  // was already right (two reserves from 1951 to 1986) can show before the year has moved, so both are polled together,
  // with room for a loaded machine, where that render can come seconds later.
  const reservesAndReservoirs = async () => {
    const d = await dated(page);
    return { reserves: d.reserves?.visible, reservoirs: d.reservoirs?.visible };
  };
  // 1959: the three first reservoirs and the two reserves protected since 1951.
  await page.evaluate(() => window.__atlas!.goToChapter('background', { instant: true }));
  await expect.poll(reservesAndReservoirs, { timeout: 15_000 }).toEqual({ reserves: 2, reservoirs: 3 });
  // 2019: all four reserves and all seventeen reservoirs.
  await page.evaluate(() => window.__atlas!.goToChapter('sharing-the-island', { instant: true }));
  await expect.poll(reservesAndReservoirs, { timeout: 15_000 }).toEqual({ reserves: 4, reservoirs: 17 });
});

test('Chinese: short PLATE label, legend wording and a year scrub', async ({ page }) => {
  await open(page, 'ch=new-towns&t=1979', 'zh');
  await expect.poll(async () => (await dated(page))['hdb-blocks']?.visible).toBe(1598);
  const plate = page.locator('[data-hud-panel="plate"]');
  await expect(plate.locator('[data-dated-count="hdb-blocks"] dt')).toHaveText('组屋');
  await expect(plate).toContainText('1,598');
  await expect(page.locator('.atlas-legend').first()).toContainText('今天还在的组屋，按竣工年份');
  await beat(page, 'new-towns', 0);
  await expect.poll(async () => (await dated(page))['hdb-blocks']?.visible).toBe(263);
});

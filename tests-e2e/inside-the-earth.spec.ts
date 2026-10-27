/** docs/48 §8.2: real table controls, reconstructed poses, beat links and the reading HUD. */
import { expect, test, type Page } from '@playwright/test';

type Values = Record<string, number | string | boolean>;
type Anchor = { x: number; y: number; shown: boolean; onScreen: boolean };
type Engine = {
  sim(): { values: Values; outputs: Record<string, number | string>; table: unknown[] };
  setSim(values: Values): boolean;
  apply(patch: Record<string, unknown>): boolean;
  anchor(id: string): Anchor | null;
};
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, values: Values) => page.evaluate((v) => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const anchor = (page: Page, id: string) => page.evaluate((id) => (window.__atlas!.engine as unknown as Engine).anchor(id), id);
const card = (page: Page) => page.locator('.space-try');
const readout = (page: Page, id: string) => card(page).locator(`[data-sim-output="${id}"]`);
async function open(page: Page, query: string, locale = 'en') {
  await page.goto(`/${locale}/topics/inside-the-earth/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
async function fixedFront(page: Page) {
  await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).apply({ camera: { position: [0, 0, 6.5], target: [0, 0, 0], fov: 34 } }));
}
/** Anchors once they are shown, on screen and no longer moving (the camera and poses ease in). */
async function anchors(page: Page, ids: string[]) {
  let prev: Anchor[] | null = null;
  let cur: Anchor[] = [];
  await expect.poll(async () => {
    cur = (await Promise.all(ids.map((id) => anchor(page, id)))).map((p) => p ?? { x: NaN, y: NaN, shown: false, onScreen: false });
    const still = prev !== null && cur.every((p, i) => Math.abs(p.x - prev![i]!.x) < 0.05 && Math.abs(p.y - prev![i]!.y) < 0.05);
    prev = cur;
    return still && cur.every((p) => p.shown && p.onScreen);
  }, { intervals: [150] }).toBe(true);
  return cur;
}
async function scene(page: Page, ids: string[]) {
  const s = await sim(page);
  const state = await page.evaluate(() => window.__atlas!.state());
  return { values: s.values, outputs: s.outputs, camera: state.camera, spots: await anchors(page, ids),
    labels: await page.locator('.space-leaders').getAttribute('data-want'), layers: state.layers };
}
function sameSpots(a: Anchor[], b: Anchor[]) {
  a.forEach((p, i) => {
    expect(p.shown && p.onScreen).toBe(true);
    expect(Math.abs(p.x - b[i]!.x)).toBeLessThan(2);
    expect(Math.abs(p.y - b[i]!.y)).toBeLessThan(2);
  });
}

test.describe('inside-the-earth', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

  test('all 18 wave inputs, 18 water snapshots and three depths give the independent expected outputs', async ({ page }) => {
    await open(page, 'ch=slip-and-waves');
    for (const kind of ['p', 's']) for (let k = 0; k <= 8; k++) {
      expect(await set(page, { 'wave-kind': kind, 'wave-step': k })).toBe(true);
      const o = (await sim(page)).outputs;
      expect(o['wave-front']).toBe((kind === 'p' ? 4 : 2) * k / 4);
      expect(o['wave-shape']).toBe(k ? `wave-at-${k}` : 'wave-rest');
      expect(o['wave-stage']).toBe(k ? 'travelling' : 'rest');
    }
    await page.evaluate(() => window.__atlas!.goToChapter('moving-the-sea', { instant: true }));
    for (const uplift of [false, true]) for (let q = 0; q <= 8; q++) {
      expect(await set(page, { 'sea-uplift': uplift, 'sea-step': q })).toBe(true);
      const o = (await sim(page)).outputs;
      expect(o['water-shape']).toBe(uplift && q ? `water-at-${q}` : 'water-rest');
      expect(o['water-stage']).toBe(!uplift ? 'no-uplift-in-model' : q === 0 ? 'rest' : q === 1 ? 'displaced' : 'spreading');
    }
    for (const h of [100, 1000, 4000]) {
      await set(page, { 'water-depth': h, 'sea-uplift': false });
      const o = (await sim(page)).outputs;
      expect(Number(o['longwave-ms'])).toBeCloseTo(Math.sqrt(9.8 * h), 8);
      expect(Number(o['longwave-kmh'])).toBeCloseTo(Math.sqrt(9.8 * h) * 3.6, 8);
      await expect(readout(page, 'longwave-ms')).toContainText(Math.sqrt(9.8 * h).toFixed(1));
      await expect(readout(page, 'longwave-kmh')).toContainText((Math.sqrt(9.8 * h) * 3.6).toFixed(1));
      expect(o['water-stage']).toBe('no-uplift-in-model');
    }
  });

  test('fixed camera: the P marker moves right then left, the S marker stays then moves up; both rows remain visible', async ({ page }) => {
    await open(page, 'ch=slip-and-waves&sim=wave-step.0');
    await fixedFront(page);
    const ids = ['wave-p-e', 'wave-s-e'];
    const rest = await anchors(page, ids);
    expect(rest[0]!.y).toBeLessThan(rest[1]!.y);
    await set(page, { 'wave-step': 3 });
    await expect.poll(async () => (await anchor(page, ids[0]!))!.x - rest[0]!.x).toBeGreaterThan(3);
    const third = await anchors(page, ids);
    expect(Math.abs(third[0]!.y - rest[0]!.y)).toBeLessThan(0.3);
    sameSpots([third[1]!], [rest[1]!]);
    await set(page, { 'wave-step': 5 });
    await expect.poll(async () => (await anchor(page, ids[0]!))!.x - rest[0]!.x).toBeLessThan(-3);
    await expect.poll(async () => (await anchor(page, ids[1]!))!.y - rest[1]!.y).toBeLessThan(-3);
    expect(Math.abs((await anchor(page, ids[1]!))!.x - rest[1]!.x)).toBeLessThan(0.3);
    // Inspecting S changes only the readout, never either row's pose.
    const before = await anchors(page, ids);
    await set(page, { 'wave-kind': 's' });
    expect((await sim(page)).outputs['wave-front']).toBe(2.5);
    sameSpots(await anchors(page, ids), before);
  });

  test('fixed camera: sea q1 displaces the centre, q3 spreads either side, and switching off returns glyphs and bed to rest', async ({ page }) => {
    await open(page, 'ch=moving-the-sea&sim=sea-step.0~sea-uplift.on');
    await fixedFront(page);
    const ids = ['sea-column-i', 'sea-column-h', 'sea-column-j', 'sea-column-g', 'sea-column-k', 'sea-bed', 'sea-bed-left', 'sea-bed-right'];
    const rest = await anchors(page, ids);
    await set(page, { 'sea-step': 1 });
    await expect.poll(async () => (await anchor(page, ids[0]!))!.y - rest[0]!.y).toBeLessThan(-3);
    const first = await anchors(page, ids);
    for (const i of [1, 2, 6, 7]) expect(first[i]!.y - rest[i]!.y).toBeGreaterThan(1);
    expect(first[5]!.y - rest[5]!.y).toBeLessThan(-1);
    await set(page, { 'sea-step': 3 });
    await expect.poll(async () => Math.abs((await anchor(page, ids[0]!))!.y - rest[0]!.y)).toBeLessThan(0.3);
    const third = await anchors(page, ids);
    for (const i of [1, 2]) expect(third[i]!.y - rest[i]!.y).toBeLessThan(-1);
    for (const i of [3, 4]) expect(third[i]!.y - rest[i]!.y).toBeGreaterThan(1);
    sameSpots(third.slice(5), first.slice(5));
    await set(page, { 'water-depth': 100 });
    sameSpots(await anchors(page, ids), third);
    await set(page, { 'sea-uplift': false });
    await expect.poll(async () => Math.abs((await anchor(page, 'sea-bed'))!.y - rest[5]!.y)).toBeLessThan(0.3);
    sameSpots(await anchors(page, ids), rest);
  });

  for (const [chapter, beat, ids] of [
    ['slip-and-waves', 4, ['fault-left', 'wave-p-e', 'wave-s-e']],
    ['moving-the-sea', 3, ['sea-bed', 'sea-column-i', 'sea-coast']],
  ] as const) {
    test(`${chapter} beat ${beat}: axis, keyboard, first-load link and reload reconstruct the same camera, labels and snapshots`, async ({ page }) => {
      await open(page, `ch=${chapter}&b=${beat}`);
      const linked = await scene(page, [...ids]);
      await page.reload();
      await page.waitForFunction(() => window.__atlas !== undefined);
      expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
      const refreshed = await scene(page, [...ids]);
      expect({ ...refreshed, spots: [] }).toEqual({ ...linked, spots: [] });
      sameSpots(refreshed.spots, linked.spots);
      await page.locator(`.atlas-axis__tick[data-beat="${chapter}.0"]`).click();
      await page.locator(`.atlas-axis__tick[data-beat="${chapter}.${beat - 1}"]`).click();
      await expect.poll(async () => (await sim(page)).values).toEqual(linked.values);
      await expect.poll(() => page.evaluate(() => window.__atlas!.state().camera)).toEqual(linked.camera);
      const axis = await scene(page, [...ids]);
      expect(axis.outputs).toEqual(linked.outputs);
      expect(axis.layers).toEqual(linked.layers);
      expect(axis.labels).toEqual(linked.labels);
      // Camera flights can take a moment after choosing a beat manually.
      await expect.poll(async () => Math.max(...(await anchors(page, [...ids])).map((p, i) => Math.abs(p.x - linked.spots[i]!.x) + Math.abs(p.y - linked.spots[i]!.y)))).toBeLessThan(2);
      await page.locator(`.atlas-axis__tick[data-beat="${chapter}.${beat - 2}"]`).click();
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.keyboard.press('.');
      await expect.poll(async () => (await sim(page)).values).toEqual(linked.values);
      expect((await sim(page)).outputs).toEqual(linked.outputs);
      expect(await page.evaluate(() => window.__atlas!.state().camera)).toEqual(linked.camera);
    });
  }

  test('every chapter index selects an actually shown model part and opens its details', async ({ page }) => {
    test.setTimeout(300_000);
    await open(page, 'ch=before-you-start');
    const chapters = await page.evaluate(() => window.__atlas!.chapters());
    expect(chapters).toHaveLength(8);
    for (const chapter of chapters) {
      await page.evaluate((id) => window.__atlas!.goToChapter(id, { instant: true }), chapter);
      const buttons = page.locator('.space-index__row[data-part]');
      await expect(buttons.first()).toBeAttached();
      const ids = await buttons.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.part!));
      for (const id of ids) {
        const button = page.locator(`.space-index__row[data-part="${id}"]`);
        await button.click();
        await expect(button).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('.space-inspector__summary')).toBeVisible();
        await expect.poll(async () => (await anchor(page, id))?.shown, { message: `${chapter}: ${id} must remain shown` }).toBe(true);
        await page.locator('.space-inspector__more').click();
        await expect(page.locator('.space-inspector__detail')).toBeVisible();
      }
    }
  });

  test('the two cards share keyboard controls; the sea prediction fixes q3 and records only depth and calculated outputs', async ({ page }) => {
    await open(page, 'ch=slip-and-waves');
    await page.keyboard.press(']');
    await expect.poll(async () => (await sim(page)).values['wave-step']).toBe(1);
    await card(page).locator('[data-sim-control="wave-kind"] [data-sim-value="s"]').click();
    await expect(readout(page, 'wave-front')).toContainText('0.5');
    await expect(page.locator('.space-try__sim[data-tag="sim"]')).toContainText('SIM');
    await expect(card(page).locator('[data-sim-record]')).toHaveCount(0);
    await open(page, 'ch=moving-the-sea');
    await card(page).locator('[data-predict]').first().click();
    await expect(card(page).locator('.space-try__reveal')).toBeVisible();
    const predicted = await sim(page);
    expect(predicted.values).toMatchObject({ 'sea-uplift': true, 'sea-step': 3, 'water-depth': 100 });
    expect(predicted.outputs['longwave-kmh']).toBeCloseTo(112.697826065989, 8);
    await expect(readout(page, 'longwave-kmh')).toContainText('112.7');
    await expect(readout(page, 'longwave-ms')).toContainText('Model long-wave speed if a wave is present');
    for (const h of [100, 1000, 4000]) {
      await set(page, { 'water-depth': h });
      await card(page).locator('[data-sim-record]').click();
    }
    await expect(card(page).locator('.space-try__table tbody tr')).toHaveCount(3);
    const headings = await card(page).locator('.space-try__table th').allTextContents();
    expect(headings.join(' ')).toMatch(/Water depth/);
    expect(headings.join(' ')).toMatch(/Model long-wave speed/);
    expect(headings.join(' ')).not.toMatch(/snapshot|station|observed speed/i);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('[');
    await expect.poll(async () => (await sim(page)).values['water-depth']).toBe(1000);
    await page.keyboard.press('t');
    await expect.poll(async () => (await sim(page)).outputs['water-stage']).toBe('no-uplift-in-model');
    expect(Number((await sim(page)).outputs['longwave-ms'])).toBeGreaterThan(0);
  });

  test('invalid URL values fall back safely, and chapters reset run and experiment controls', async ({ page }) => {
    await open(page, 'ch=slip-and-waves&sim=wave-kind.bad~wave-step.99~sea-step.-1~water-depth.0~unknown.3');
    expect((await sim(page)).values).toMatchObject({ 'wave-kind': 'p', 'wave-step': 0, 'water-depth': 4000, 'sea-step': 0 });
    for (const v of Object.values((await sim(page)).outputs)) if (typeof v === 'number') expect(Number.isFinite(v)).toBe(true);
    await set(page, { 'wave-kind': 's', 'wave-step': 8, 'sea-uplift': false });
    await page.evaluate(() => window.__atlas!.goToChapter('layers-of-earth', { instant: true }));
    expect((await sim(page)).values).toMatchObject({ 'wave-kind': 'p', 'wave-step': 0, 'sea-uplift': true, 'sea-step': 0 });
    await expect(card(page)).toHaveCount(0);
    expect((await page.evaluate(() => window.__atlas!.state())) as { run?: boolean }).toMatchObject({ run: false });
  });

  for (const locale of ['en', 'zh']) for (const theme of ['paper', 'cinema'] as const) {
    test(`phone ${locale}/${theme}: same model, 44 px controls, no horizontal overflow or external runtime requests`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const external: string[] = [], errors: string[] = [];
      page.on('request', (r) => { if (/^https?:/.test(r.url()) && !/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(r.url())) external.push(r.url()); });
      page.on('pageerror', (e) => errors.push(e.message));
      await open(page, 'ch=moving-the-sea&b=3', locale);
      await page.evaluate((theme) => window.__atlas!.setTheme(theme), theme);
      await page.getByRole('button', { name: locale === 'en' ? 'Read' : '阅读', exact: true }).click();
      await expect(card(page)).toContainText(locale === 'en' ? 'Try it' : '试一试');
      for (const sel of ['[data-sim-record]', '[data-sim-control="sea-uplift"] button', '[data-sim-control="water-depth"] button']) {
        const target = card(page).locator(sel).first();
        await target.scrollIntoViewIfNeeded();
        const box = (await target.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(390);
      }
      expect((await sim(page)).values).toMatchObject({ 'sea-step': 3, 'water-depth': 4000 });
      await expect(readout(page, 'longwave-kmh')).toContainText('712.8');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
      expect(errors).toEqual([]);
      expect(external).toEqual([]);
    });
  }

  test('cached topic works offline across all eight chapters', async ({ page, context }) => {
    await open(page, 'ch=before-you-start');
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    // The first visit installs the worker; a controlled reload caches topic data.
    await page.reload();
    await page.waitForFunction(() => window.__atlas !== undefined);
    expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
    await expect.poll(() => page.evaluate(async () => (await caches.match('/topics/inside-the-earth/data.json')) !== undefined)).toBe(true);
    const ids = await page.evaluate(() => window.__atlas!.chapters());
    // The service worker precaches html/js/css/svg/png and caches topic data on first use; the webp
    // illustrations are not in its precache list for any topic, so this checks the scene and reading panel only.
    await context.setOffline(true);
    await page.reload();
    await page.waitForFunction(() => window.__atlas !== undefined);
    expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
    for (const id of ids) {
      await page.evaluate((id) => window.__atlas!.goToChapter(id, { instant: true }), id);
      await expect(page.locator('.space-index__row').first()).toBeAttached();
      expect(await page.evaluate(() => window.__atlas!.state().chapter)).toBe(id);
      expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
    }
    await context.setOffline(false);
  });
});

/** Browser gates are deferred to the main session. Run after build with ATLAS_E2E_PORT=5425. */
import { expect, test, type Page } from '@playwright/test';

type Reading = {
  fieldReady: boolean; angle: number; mode: string; cl: number; lift: number;
  pressureCount: number; pathCount: number; pulseTime: number;
  plot: { current: { x: number; y: number } };
  arrowDirections: { force: string; dir: number[] }[];
};
type Engine = {
  airfoil(): Reading;
  pose(name: string | null): boolean;
  sim(): { values: Record<string, number | string | boolean>; outputs: Record<string, number | string>; table: unknown[] };
  setSim(values: Record<string, number | string | boolean>): boolean;
  anchor(id: string): { x: number; y: number; shown: boolean; onScreen: boolean } | null;
  animation(id: string): { hz: number; phase: number; on: number } | null;
  flow(id: string): { paths: Record<string, { visible: boolean }> } | null;
};
const chapters = ['before-you-start', 'four-forces', 'wing-and-air', 'angle-and-stall', 'changing-direction', 'inside-a-turbofan', 'thin-air', 'flight-and-singapore'];
const read = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).airfoil());
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, values: Record<string, number | string | boolean>) => page.evaluate(v => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
const anchor = (page: Page, id: string) => page.evaluate(id => (window.__atlas!.engine as unknown as Engine).anchor(id), id);
async function ready(page: Page) {
  await expect.poll(async () => {
    const a = await read(page), s = await sim(page);
    return a.fieldReady && a.angle === s.values['angle-deg'] && Math.abs(a.cl - Number(s.outputs['cl-now'])) < 1e-8;
  }, { timeout: 30_000 }).toBe(true);
}
async function open(page: Page, query = 'ch=angle-and-stall', locale = 'en', theme = 'paper') {
  await page.goto(`/${locale}/topics/how-planes-fly/?${query}&theme=${theme}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect(page.locator('.atlas-stage canvas').first()).toBeVisible();
  await ready(page);
}
async function beat(page: Page, chapter: string, index: number) {
  await page.evaluate(({ chapter, index }) => {
    const a = window.__atlas!;
    const n = a.beats().findIndex(b => b.chapter === chapter && b.index === index);
    if (n < 0) throw new Error(`Missing beat ${chapter}/${index + 1}`);
    a.goToBeat(n, { instant: true });
  }, { chapter, index });
}

test('all eight chapters, 38 beats, indexes and prediction-first cards are reachable', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await open(page, 'ch=before-you-start');
  expect(await page.evaluate(() => window.__atlas!.chapters())).toEqual(chapters);
  expect(await page.evaluate(() => window.__atlas!.beats().length)).toBe(38);
  const indexed = new Set<string>();
  for (const [i, chapter] of chapters.entries()) {
    await page.evaluate(id => window.__atlas!.goToChapter(id, { instant: true }), chapter);
    await expect(page.locator('.space-inspector')).toHaveCount(0);
    expect(await page.evaluate(id => window.__atlas!.beats().filter(b => b.chapter === id).length, chapter)).toBe([4, 5, 5, 5, 5, 5, 4, 5][i]);
    const hasCard = ['wing-and-air', 'angle-and-stall', 'thin-air'].includes(chapter);
    await expect(page.locator('.space-try')).toHaveCount(hasCard ? 1 : 0);
    if (hasCard) {
      await expect(page.locator('.space-try [data-predict]')).toHaveCount(3);
      await expect(page.locator('.space-try [data-sim-record]')).toHaveCount(1);
    }
    const rows = page.locator('.space-index__row[data-part]');
    const ids = await rows.evaluateAll(rows => rows.map(r => r.getAttribute('data-part')!));
    for (const id of ids) {
      indexed.add(id);
      const row = page.locator(`.space-index__row[data-part="${id}"]`);
      await row.click({ force: true });
      await expect(row).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.space-inspector')).toBeVisible();
      await expect(page.locator('.space-inspector__summary')).not.toBeEmpty();
    }
  }
  expect(indexed.size).toBe(40);
  const beats = await page.evaluate(() => window.__atlas!.beats());
  for (const b of beats) {
    await beat(page, b.chapter, b.index);
    await expect(page.locator('.space-beatline__caption')).toHaveText(b.caption.en);
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().presentation)).toMatchObject({ chapter: b.chapter, beat: b.index, autoplay: false });
  }
  expect(errors).toEqual([]);
});

for (const locale of ['en', 'zh']) for (const theme of ['paper', 'cinema']) {
  test(`${locale} ${theme}: actual-topic curve, pressure recovery, records and deep links`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, 'ch=angle-and-stall', locale, theme);
    for (const angle of [0, 4, 12, 16, -16]) {
      await set(page, { 'angle-deg': angle, 'flow-view': 'pressure' });
      await ready(page);
      const a = await read(page), attached = Math.abs(angle) <= 12;
      expect(a.plot.current.x).toBe(angle); expect(a.plot.current.y).toBeCloseTo(a.cl, 10);
      expect(a.mode).toBe(attached ? 'ideal-attached' : 'separated-illustration');
      expect(a.pressureCount).toBe(attached ? 64 : 0); expect(a.pathCount).toBe(attached ? 16 : 0);
    }
    await set(page, { 'airspeed-mps': 0 }); await ready(page);
    expect((await read(page)).mode).toBe('still'); expect((await read(page)).lift).toBe(0);
    await set(page, { 'angle-deg': 4, 'airspeed-mps': 40 }); await ready(page);
    expect((await read(page)).lift).toBeCloseTo(923.9031443933111, 5);
    expect((await read(page)).pressureCount).toBe(64);
    for (const angle of [-16, 0, 12, 16]) {
      await set(page, { 'angle-deg': angle }); await ready(page);
      await page.locator('.space-try [data-sim-record]').click();
    }
    await expect(page.locator('[data-airfoil-record]')).toHaveCount(4);
    const recordX = await page.locator('[data-airfoil-record]').evaluateAll(rows => rows.map(row => Number(row.getAttribute('x'))));
    expect(recordX).toEqual([...recordX].sort((a, b) => a - b));
    await set(page, { 'flow-view': 'streamlines' });
    expect((await sim(page)).table).toHaveLength(4);
    await set(page, { 'airspeed-mps': 20 });
    await expect.poll(async () => (await sim(page)).table.length).toBe(0);
    await open(page, 'ch=angle-and-stall&b=4', locale, theme);
    expect((await read(page)).angle).toBe(16); expect((await read(page)).pressureCount).toBe(0);
    await open(page, 'ch=thin-air&b=3', locale, theme);
    expect((await sim(page)).values['altitude-m']).toBe(10000);
    expect((await read(page)).lift).toBeCloseTo(311.8368390074898, 5);
    await open(page, 'ch=changing-direction&b=4', locale, theme);
    await expect.poll(async () => (await read(page)).arrowDirections.filter(a => a.force === 'gravity' || a.force === 'lift').length).toBe(2);
    expect((await read(page)).arrowDirections.find(a => a.force === 'gravity')!.dir).toEqual([0, -1, 0]);
    expect((await read(page)).arrowDirections.find(a => a.force === 'lift')!.dir[2]).toBeCloseTo(-.3420201433, 8);
  });

  test(`390px ${locale} ${theme}: readable card, 44px targets and no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=angle-and-stall&sim=flow-view.pressure', locale, theme);
    await page.getByRole('button', { name: locale === 'en' ? 'Read' : '阅读', exact: true }).click();
    for (const selector of ['[data-predict="less"]', '[data-sim-record]', '.space-airfoil-samples button']) {
      const target = page.locator(selector).first();
      await target.scrollIntoViewIfNeeded();
      expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    const sample = page.locator('.space-airfoil-samples button').first();
    await sample.click();
    await expect(sample).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-predict="less"]').click();
    await expect(page.locator('.space-try__reveal')).toBeVisible();
    expect((await sim(page)).values['angle-deg']).toBe(16);
    await expect(page.locator('[data-hud-panel="reader"]')).toContainText(locale === 'en' ? 'Angle of attack and stall' : '迎角与失速');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
}

test('station masks, static bank vectors, fan during stall and distinct engine spools', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await open(page, 'ch=wing-and-air&b=1');
  await expect.poll(async () => (await anchor(page, 'wing-box-skin'))?.shown).toBe(false);
  for (const id of ['front-spar', 'rear-spar', 'wing-ribs']) await expect.poll(async () => (await anchor(page, id))?.shown).toBe(true);
  await beat(page, 'changing-direction', 3);
  await expect.poll(async () => (await read(page)).arrowDirections.some(a => a.force === 'gravity')).toBe(true);
  const arrows = (await read(page)).arrowDirections;
  expect(arrows.find(a => a.force === 'gravity')!.dir).toEqual([0, -1, 0]);
  const lift = arrows.find(a => a.force === 'lift' && a.dir[2] !== 0)!.dir;
  expect(lift[1]).toBeCloseTo(.9396926208, 8); expect(lift[2]).toBeCloseTo(-.3420201433, 8);
  await beat(page, 'angle-and-stall', 4); await ready(page);
  expect((await read(page)).mode).toBe('separated-illustration');
  await expect.poll(async () => (await anchor(page, 'fan-right'))?.shown).toBe(true);
  const phase = () => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).animation('fan-right-spin')?.phase);
  const before = await phase(); await expect.poll(phase).not.toBe(before);
  await beat(page, 'inside-a-turbofan', 3);
  await expect.poll(() => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).animation('hp-shaft-spin')?.hz)).toBe(.75);
  expect(await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).animation('lp-shaft-spin')?.hz)).toBe(.5);
  await expect.poll(() => page.evaluate(() => Object.values((window.__atlas!.engine as unknown as Engine).flow('engine-bypass')?.paths ?? {}).some(p => p.visible))).toBe(true);
});

test('pause and reduced motion hold the actual-topic flow clock; keyboard moves beats without autoplay', async ({ page }) => {
  await open(page, 'ch=angle-and-stall&b=2');
  await page.evaluate(() => {
    const engine = window.__atlas!.engine as unknown as Engine;
    engine.setSim({ 'angle-deg': 4 });
    engine.setSim({ 'angle-deg': 16 });
    engine.setSim({ 'angle-deg': -4 });
  });
  await ready(page);
  expect((await read(page)).angle).toBe(-4);
  expect((await read(page)).pressureCount).toBe(64);
  await page.evaluate(() => window.__atlas!.setPaused(true));
  await page.waitForTimeout(100);
  const a = (await read(page)).pulseTime;
  await page.waitForTimeout(150); expect((await read(page)).pulseTime).toBe(a);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.__atlas!.setPaused(false));
  const b = (await read(page)).pulseTime;
  await page.waitForTimeout(150); expect((await read(page)).pulseTime).toBe(b);
  await page.locator('.atlas-scene').focus();
  await page.keyboard.press('.');
  await expect.poll(() => page.evaluate(() => window.__atlas!.state().presentation?.beat)).toBe(2);
  expect(await page.evaluate(() => window.__atlas!.state().presentation?.autoplay)).not.toBe(true);
  await page.keyboard.press(',');
  await expect.poll(() => page.evaluate(() => window.__atlas!.state().presentation?.beat)).toBe(1);
});


test('the balanced level-flight beat runs all 23 travel clips and resets on leaving; high-lift raises the spoiler', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await open(page, 'ch=four-forces&b=1');
  const whole = ['fuselage-shell', 'cockpit-glazing', 'wing-left', 'wing-right', 'wing-tip-left', 'wing-tip-right', 'aileron-left', 'aileron-right', 'flap-left', 'flap-right', 'slat-left', 'slat-right', 'spoiler-left', 'tailplane-left', 'tailplane-right', 'elevator-left', 'elevator-right', 'fin', 'rudder', 'nacelle-left', 'nacelle-right', 'fan-left', 'fan-right'];
  const travel = () => page.evaluate(ids => ids.map(id => (window.__atlas!.engine as unknown as Engine).animation(`balanced-travel-${id}`)?.on), whole);
  await expect.poll(travel).toEqual(whole.map(() => 0));
  const rest = (await anchor(page, 'fuselage-shell'))!;
  await beat(page, 'four-forces', 1);
  await expect.poll(travel).toEqual(whole.map(() => 1));
  expect((await sim(page)).values['diagram-case']).toBe('level');
  await expect.poll(async () => {
    const moving = (await anchor(page, 'fuselage-shell'))!;
    return Math.hypot(moving.x - rest.x, moving.y - rest.y);
  }).toBeGreaterThan(3);
  await beat(page, 'four-forces', 2);
  await expect.poll(travel).toEqual(whole.map(() => 0));
  expect((await sim(page)).values['diagram-case']).toBe('axial');
  await open(page, 'ch=four-forces&b=2');
  await expect.poll(travel).toEqual(whole.map(() => 1));
  await beat(page, 'changing-direction', 4);
  await expect.poll(travel).toEqual(whole.map(() => 0));
  // An instant pose still reaches the stage on the next rendered frame.
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  const raised = (await anchor(page, 'spoiler-left'))!;
  expect(raised.shown).toBe(true);
  expect(await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).pose(null))).toBe(true);
  await expect.poll(async () => {
    const rest = (await anchor(page, 'spoiler-left'))!;
    return Math.hypot(rest.x - raised.x, rest.y - raised.y);
  }).toBeGreaterThan(1);
  expect(await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).pose('high-lift-open'))).toBe(true);
  await expect.poll(async () => {
    const restored = (await anchor(page, 'spoiler-left'))!;
    return Math.hypot(restored.x - raised.x, restored.y - raised.y);
  }).toBeLessThan(1);
});

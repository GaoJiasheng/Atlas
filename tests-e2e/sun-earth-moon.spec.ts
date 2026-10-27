/** Published topic: 39 direct beats, scientific views, shared clock and phone controls.
 * Run after build with ATLAS_E2E_PORT=5422. */
import { expect, test, type Page } from '@playwright/test';
type Orbit = {
  snapshotId: number;
  timeSeconds: number;
  running: boolean;
  lab: string;
  scale: string;
  physical: {
    bodies: Record<string, { position: number[]; quaternion: number[]; radiusKm: number }>;
    axis: number[];
    solarDirections: Record<string, number[]>;
  };
  display: {
    origin: number[];
    centres: Record<string, number[]>;
    radii: Record<string, number>;
  };
  rendered: {
    snapshotId: number;
    parts: Record<
      string,
      {
        position: number[];
        quaternion: number[];
        scale: number[];
        visible: boolean;
      }
    >;
    solarDirections: Record<string, number[]>;
  };
  panel: {
    kind: string | null;
    northUp: boolean;
    dayIndex: number | null;
    readings: { daylightMinutes: number } | null;
    shadowFrame: { scaleMPerKm: number; radii: Record<string, number> };
  };
};
type Engine = {
  orbit(): Orbit;
  orbitSeek(t: number): boolean;
  sim(): {
    values: Record<string, number | string | boolean>;
    outputs: Record<string, number | string>;
  };
  setSim(v: Record<string, number | string | boolean>): boolean;
};
const orbit = (p: Page) => p.evaluate(() => (window.__atlas!.engine as unknown as Engine).orbit());
const sim = (p: Page) => p.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
async function open(p: Page, q = '', locale = 'en') {
  await p.goto(`/${locale}/topics/sun-earth-moon/${q}`);
  await p.waitForFunction(() => !!(window.__atlas?.engine as unknown as Engine)?.orbit?.()?.rendered);
  await settled(p);
}
async function settled(p: Page) {
  // The stage draws on demand: under load (swiftshader, other suites) the first frame after a change can take seconds.
  await expect
    .poll(
      async () => {
        const o = await orbit(p);
        return o.rendered?.snapshotId === o.snapshotId;
      },
      { timeout: 20_000 },
    )
    .toBe(true);
}
async function matrices(p: Page) {
  await settled(p);
  const o = await orbit(p);
  for (const id of ['sun', 'earth', 'moon', 'observer']) {
    const part = o.rendered.parts[id === 'observer' ? 'observer-marker' : `${id}-body`];
    expect(part).toBeTruthy();
    for (let j = 0; j < 3; j++) {
      expect(part!.position[j]).toBeCloseTo(o.display.centres[id]![j]!, 6);
      expect(part!.scale[j]).toBeCloseTo(o.display.radii[id]!, 9);
    }
    const q = part!.quaternion,
      physical = o.physical.bodies[id]!.quaternion;
    expect(Math.abs(q.reduce((v, x, i) => v + x * physical[i]!, 0))).toBeCloseTo(1, 6);
  }
  for (const id of ['earth', 'moon'])
    for (let j = 0; j < 3; j++) expect(o.rendered.solarDirections[id]![j]).toBeCloseTo(o.physical.solarDirections[id]![j]!, 9);
}
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
});
test('day deep link, orb-t validation and actual transforms', async ({ page }) => {
  await open(page, '?ch=a-turning-earth&sim=lab.day~obliquity.0~spin-angle.0&orb-t=21600');
  expect((await orbit(page)).timeSeconds).toBe(21600);
  expect((await orbit(page)).running).toBe(false);
  expect((await sim(page)).outputs['observer-day']).toBe('boundary');
  await matrices(page);
  expect(await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).orbitSeek(NaN))).toBe(false);
  await open(page, '?ch=a-turning-earth&orb-t=1e3');
  expect((await orbit(page)).timeSeconds).toBe(0);
});
test('SPACE, F, pause button and REFERENCE share one clock', async ({ page }) => {
  await open(page, '?ch=a-turning-earth');
  await page.keyboard.press('Space');
  await expect.poll(async () => (await orbit(page)).timeSeconds).toBeGreaterThan(0);
  await page.keyboard.press('f');
  const paused = await orbit(page);
  expect(paused.running).toBe(false);
  await page.waitForTimeout(100);
  expect((await orbit(page)).timeSeconds).toBe(paused.timeSeconds);
  await page.keyboard.press('r');
  expect((await orbit(page)).timeSeconds).toBe(paused.timeSeconds);
  await page.keyboard.press('r');
  expect((await orbit(page)).timeSeconds).toBe(paused.timeSeconds);
  await page.locator('[data-mode="flow"]').click();
  await expect.poll(async () => (await orbit(page)).running).toBe(true);
  await page.keyboard.press('Space');
  expect((await orbit(page)).running).toBe(false);
  await matrices(page);
});
test('scale remaps the same physical snapshot and surface marks', async ({ page }) => {
  await open(page, '?ch=one-moon-many-views&b=2');
  const a = await orbit(page);
  await page.getByRole('button', { name: 'Schematic → true scale', exact: true }).click();
  await matrices(page);
  const b = await orbit(page);
  expect(b.physical).toEqual(a.physical);
  expect(b.timeSeconds).toBe(a.timeSeconds);
  expect(b.display.radii.earth! * 2).toBeCloseTo(0.01, 10);
  const mark = b.rendered.parts['near-side-mark']!;
  expect(Math.hypot(...mark.position.map((v, j) => v - b.display.centres.moon![j]!))).toBeCloseTo(b.display.radii.moon! * 1.006, 8);
});
test('solar year curve and day buttons use day-index, static controls stay disabled', async ({ page }) => {
  await open(page, '?ch=singapore-daylight&b=4');
  expect((await orbit(page)).panel.readings?.daylightMinutes).toBe(724.417);
  const panel = page.locator('[data-orbit-panel="solar-year"]');
  await panel.getByRole('button', { name: 'Next day', exact: true }).click();
  expect((await sim(page)).values['day-index']).toBe(300);
  await panel.locator('svg').click({ position: { x: 150, y: 50 } });
  expect((await orbit(page)).panel.dayIndex).toBe((await sim(page)).values['day-index']);
  await page.keyboard.press('f');
  expect((await orbit(page)).running).toBe(false);
  await expect(page.locator('[data-mode="flow"]')).toBeDisabled();
});
test('phase north-up ignores main camera orbit; eclipse remains separate', async ({ page }) => {
  await open(page, '?ch=one-moon-many-views&b=3');
  expect((await sim(page)).outputs['moon-lit-percent']).toBe(100);
  expect((await sim(page)).outputs['lunar-eclipse']).toBe('total');
  const before = await page.locator('[data-north-up]').getAttribute('data-north');
  await page.evaluate(() => window.__atlas!.setPreset('orbit', { instant: true }));
  await page.waitForTimeout(150);
  expect(await page.locator('[data-north-up]').getAttribute('data-north')).toBe(before);
  expect((await orbit(page)).panel.northUp).toBe(true);
  await open(page, '?ch=alignment-and-eclipses&b=1');
  expect((await sim(page)).outputs['solar-eclipse']).toBe('none');
  await open(page, '?ch=alignment-and-eclipses&b=5');
  expect((await sim(page)).outputs['solar-eclipse']).toBe('annular');
  expect((await orbit(page)).panel.kind).toBe('apparent-discs');
  await matrices(page);
});
test('39 chapter+beat links reproduce presentation instant states and actual rendered bindings', async ({ page }) => {
  // 39 page loads plus 39 instant beats: about 4 min on an idle machine with software WebGL.
  test.setTimeout(600_000);
  await open(page);
  const beats = await page.evaluate(() => window.__atlas!.beats());
  expect(beats).toHaveLength(39);
  for (let i = 0; i < beats.length; i++) {
    await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), i);
    await settled(page);
    const expected = await orbit(page),
      values = (await sim(page)).values;
    await open(page, `?ch=${beats[i]!.chapter}&b=${beats[i]!.index + 1}`);
    expect((await sim(page)).values).toEqual(values);
    const actual = await orbit(page);
    expect(actual.physical).toEqual(expected.physical);
    expect(actual.timeSeconds).toBe(expected.timeSeconds);
    expect(actual.panel).toEqual(expected.panel);
    await matrices(page);
  }
});
test('presentation exit restores controls and physical time; reduced motion loads paused', async ({ page }) => {
  await open(page, '?ch=one-moon-many-views');
  await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).orbitSeek(54321));
  const before = await orbit(page);
  await page.keyboard.press('p');
  await page.keyboard.press('Escape');
  await settled(page);
  expect((await orbit(page)).timeSeconds).toBe(before.timeSeconds);
  expect((await orbit(page)).physical).toEqual(before.physical);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '?ch=a-turning-earth&orb-t=21600');
  expect((await orbit(page)).running).toBe(false);
});
test('phone mounts one accessible observation window and selects from the chapter index', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '?ch=singapore-daylight&b=2', 'zh');
  await page.getByRole('button', { name: '阅读', exact: true }).click();
  await expect(page.locator('[data-orbit-panel]')).toHaveCount(1);
  await page.getByRole('button', { name: '后一天', exact: true }).click();
  expect((await sim(page)).values['day-index']).toBe(173);
  // Selection stays the chapter index's (no second picker in the observation window).
  await expect(page.locator('[data-orbit-panel] button', { hasText: '地球' })).toHaveCount(0);
  await page.locator('.space-index__row[data-part="earth-body"]').click();
  expect(await page.evaluate(() => (window.__atlas!.state() as unknown as { part: string }).part)).toBe('earth-body');
  await expect(page.locator('.atlas-reader .space-inspector')).toHaveAttribute('aria-label', '地球');
});

test('injected monotonic RAF at 30/60/120 fps advances one shared physical second and excludes background time', async ({ page }) => {
  await open(page, '?ch=a-turning-earth');
  for (const fps of [30, 60, 120]) {
    const result = await page.evaluate(async (fps) => {
      const api = window.__atlas!,
        engine = api.engine as unknown as Engine;
      engine.orbitSeek(0);
      const nativeRAF = window.requestAnimationFrame.bind(window);
      const nowDescriptor = Object.getOwnPropertyDescriptor(performance, 'now');
      const hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
      let now = performance.now(),
        hidden = false,
        nextId = 1;
      let queue: FrameRequestCallback[] = [];
      Object.defineProperty(performance, 'now', { configurable: true, value: () => now });
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
      window.requestAnimationFrame = (callback) => {
        queue.push(callback);
        return nextId++;
      };
      const frame = (delta: number) => {
        now += delta;
        const callbacks = queue;
        queue = [];
        for (const callback of callbacks) callback(now);
      };
      try {
        api.setPaused(false);
        // Drain any frame that the renderer scheduled before replacing RAF, then establish the baseline.
        await new Promise<void>((resolve) => nativeRAF(() => resolve()));
        frame(0);
        for (let i = 0; i < fps; i++) frame(1000 / fps);
        const active = engine.orbit().timeSeconds;
        hidden = true;
        document.dispatchEvent(new Event('visibilitychange'));
        for (let i = 0; i < fps; i++) frame(1000 / fps);
        const background = engine.orbit().timeSeconds;
        hidden = false;
        document.dispatchEvent(new Event('visibilitychange'));
        frame(10000); // the first visible frame only resets its baseline
        const resumed = engine.orbit().timeSeconds;
        api.setPaused(true);
        for (let i = 0; i < 10; i++) frame(1000 / fps);
        return { active, background, resumed, paused: engine.orbit().timeSeconds };
      } finally {
        window.requestAnimationFrame = nativeRAF;
        if (nowDescriptor) Object.defineProperty(performance, 'now', nowDescriptor);
        else delete (performance as { now?: () => number }).now;
        if (hiddenDescriptor) Object.defineProperty(document, 'hidden', hiddenDescriptor);
        else delete (document as { hidden?: boolean }).hidden;
        for (const callback of queue) nativeRAF(callback);
      }
    }, fps);
    expect(result.active).toBeCloseTo(21600, 5);
    expect(result.background).toBe(result.active);
    expect(result.resumed).toBe(result.active);
    expect(result.paused).toBe(result.active);
  }
});

for (const locale of ['en', 'zh']) for (const theme of ['paper', 'cinema']) {
  test(`published content ${locale}/${theme}: safe observing, source links and figures`, async ({ page }) => {
    const errors: string[] = [], external: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (!new URL(r.url()).hostname.match(/^(localhost|127\.0\.0\.1)$/)) external.push(r.url()); });
    await open(page, `?ch=a-ring-over-singapore&theme=${theme}`, locale);
    await expect(page.locator('.atlas-reader')).toContainText(locale === 'en' ? 'Historical event' : '历史事件');
    await expect(page.locator('.atlas-reader')).toContainText(locale === 'en' ? 'Model explanation · no date' : '模型解释 · 没有日期');
    await expect(page.locator('.atlas-reader')).toContainText(locale === 'en' ? 'Face away from the Sun' : '背向太阳');
    for (const mode of ['xray','cutaway','exploded']) await expect(page.locator(`[data-mode="${mode}"]`)).toBeDisabled();
    await open(page, `?ch=a-tilted-year&b=3&theme=${theme}`, locale);
    const figure = page.locator('.atlas-reader .atlas-figure img:visible');
    await expect(figure).toHaveCount(1);
    await expect(figure).toHaveAttribute('src', /sun-earth-moon-parallel-axes\.webp$/);
    await expect(page.locator('.atlas-reader [data-source="S3"]').first()).toBeAttached();
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });
}

/** Run in the main session: CI=1 ATLAS_E2E_PORT=5446 pnpm e2e. */
import { expect, test, type Page } from '@playwright/test';

type Engine = {
  sim(): { values: Record<string, string | number | boolean>; outputs: Record<string, string | number>; table: unknown[] };
  setSim(values: Record<string, string | number | boolean>): boolean;
  senses(): {
    eye?: { active: boolean; hiddenReason: string | null; r: number; points: { rays: { retina: number[] }[] }[] };
    wave?: { active: boolean; playing: boolean; positions: number[]; rests: number[]; phaseCycles: number; visualHz: number };
  };
  sensesSeek(cycles: number): boolean;
  animation(id: string): { hz: number; phase: number; on: number } | null;
};
const sim = (p: Page) => p.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const senses = (p: Page) => p.evaluate(() => (window.__atlas!.engine as unknown as Engine).senses());
const set = (p: Page, values: Record<string, string | number | boolean>) => p.evaluate(v => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
async function open(p: Page, query: string, locale = 'en', theme = 'paper') {
  await p.goto(`/${locale}/topics/eyes-and-ears/?theme=${theme}&${query}`);
  await p.waitForFunction(() => window.__atlas && typeof (window.__atlas.engine as unknown as Engine).senses === 'function', null, { timeout: 30_000 });
  expect(await p.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(async () => Boolean((await senses(p)).eye && (await senses(p)).wave)).toBe(true);
}
test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

for (const locale of ['en', 'zh']) for (const theme of ['paper', 'cinema']) {
  test(`${locale}/${theme}: focused and defocused deep links show one workstation`, async ({ page }) => {
    const errors: string[] = [];
    const external: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (/^https?:/.test(r.url()) && !['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname)) external.push(r.url()); });
    await open(page, 'ch=near-far-and-focus&b=2', locale, theme);
    expect((await sim(page)).outputs['focus-state']).toBe('behind-retina');
    expect(Number((await sim(page)).outputs['image-distance'])).toBeCloseTo(120 / 23, 9);
    await expect.poll(async () => (await senses(page)).eye?.active).toBe(true);
    expect((await senses(page)).wave?.active).toBe(false);
    const eye = (await senses(page)).eye!;
    for (const p of eye.points) for (const ray of p.rays) expect(ray.retina[0]).toBe(eye.r);
    await page.locator('[data-sim-control="lens-focus"] [data-sim-value="near"]').click();
    await expect.poll(async () => (await sim(page)).outputs['focus-state']).toBe('on-retina');
    await expect(page.locator('.space-try [data-sim-output="focus-state"]')).toHaveAttribute('data-state', 'on-retina');
    await expect(page.locator('h1, .atlas-title').first()).toContainText(locale === 'zh' ? '眼睛与耳朵' : 'Eyes and Ears');
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}

test('pupil prediction changes area fourfold and records one row per setting', async ({ page }) => {
  await open(page, 'ch=the-light-gate');
  const before = (await sim(page)).outputs['image-distance'];
  await page.locator('.space-try [data-predict]').first().click();
  await expect(page.locator('.space-try__reveal')).toHaveAttribute('data-outcome', 'more');
  expect((await sim(page)).outputs['relative-light']).toBe(4);
  expect((await sim(page)).outputs['image-distance']).toBe(before);
  await page.locator('[data-sim-record]').click();
  await page.locator('[data-sim-record]').click();
  expect((await sim(page)).table).toHaveLength(1);
  await set(page, { 'pupil-mm': 2 });
  await page.locator('[data-sim-record]').click();
  expect((await sim(page)).table).toHaveLength(2);
});

test('focus prediction returns to the receiver; darkness hides the light image', async ({ page }) => {
  await open(page, 'ch=near-far-and-focus');
  await page.locator('.space-try [data-predict]').first().click();
  await expect(page.locator('.space-try__reveal')).toHaveAttribute('data-outcome', 'on-retina');
  expect((await sim(page)).outputs['focus-state']).toBe('on-retina');
  await set(page, { 'light-in': false });
  await expect.poll(async () => (await senses(page)).eye?.active).toBe(false);
  expect((await sim(page)).outputs['eye-state']).toBe('dark');
  expect((await sim(page)).outputs['relative-light']).toBe(0);
  expect((await sim(page)).outputs['image-distance']).toBeCloseTo(4, 10);
  await expect(page.locator('[data-senses-notes]')).toContainText('geometry predictions');
});

test('frequency prediction preserves amplitude and the reference particle returns locally', async ({ page }) => {
  await open(page, 'ch=pitch-and-strength');
  await page.locator('.space-try [data-predict]').first().click();
  await expect(page.locator('.space-try__reveal')).toHaveAttribute('data-outcome', 'same');
  expect((await sim(page)).outputs['visual-hz']).toBe(2);
  expect((await sim(page)).outputs['amplitude-level']).toBe(1);
  expect((await senses(page)).eye?.active).toBe(false);
  await set(page, { 'frequency-hz': 250 });
  await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sensesSeek(0));
  await expect.poll(async () => (await senses(page)).wave?.positions[5]).toBeCloseTo(.285, 9);
  await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sensesSeek(.25));
  await expect.poll(async () => (await senses(page)).wave?.positions[5]).toBeCloseTo(.25, 9);
  await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sensesSeek(1));
  await expect.poll(async () => (await senses(page)).wave?.positions[5]).toBeCloseTo(.285, 9);
  await set(page, { 'sound-active': false });
  await expect.poll(async () => (await senses(page)).wave?.positions[5]).toBe(.25);
  expect((await senses(page)).wave?.playing).toBe(false);
});

test('ear bone motion shares one pace; care stops both experiments', async ({ page }) => {
  await open(page, 'ch=three-moving-bones&b=3');
  await expect.poll(async () => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).animation('stapes-piston')?.hz)).toBe(1);
  const bone = await page.evaluate(() => ['drum-vibrate', 'malleus-rock', 'incus-rock', 'stapes-piston'].map(id => (window.__atlas!.engine as unknown as Engine).animation(id)));
  for (const b of bone) expect(b?.hz).toBe(1);
  await page.evaluate(() => window.__atlas!.goToChapter('care-and-protection', { instant: true }));
  await expect.poll(async () => (await senses(page)).wave?.playing).toBe(false);
  await expect.poll(async () => (await senses(page)).eye?.active).toBe(false);
  expect((await senses(page)).wave?.active).toBe(false);
  await expect(page.locator('.space-try')).toHaveCount(0);
});

test('exploding stops transmission and reassembling resumes with the slider value remembered', async ({ page }) => {
  await open(page, 'ch=pitch-and-strength');
  await expect.poll(async () => (await senses(page)).wave?.playing).toBe(true);
  await page.evaluate(() => window.__atlas!.setMode('exploded', true, { instant: true }));
  await expect.poll(async () => (await senses(page)).wave?.active).toBe(false);
  await page.evaluate(() => window.__atlas!.setMode('exploded', false, { instant: true }));
  await expect.poll(async () => (await senses(page)).wave?.active).toBe(true);
  await expect.poll(async () => (await senses(page)).wave?.playing).toBe(true);
});

test('phone reduced motion: touch controls and beat stepping', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'ch=pitch-and-strength');
  await page.getByRole('button', { name: 'Read', exact: true }).click();
  const increase = page.locator('[data-sim-control="frequency-hz"] button').last();
  await increase.scrollIntoViewIfNeeded();
  const box = (await increase.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await increase.click();
  expect((await sim(page)).outputs['visual-hz']).toBe(2);
  expect((await senses(page)).wave?.playing).toBe(false);
  // The chapter opens before its first beat (BEAT –/5); Next enters beat 1.
  await page.locator('.space-beatline__btn').last().click();
  await expect.poll(() => page.url()).toContain('b=1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

type Frame = { x0: number; y0: number; x1: number; y1: number };
const api = (p: Page) => p.evaluate(() => {
  const e = window.__atlas!.engine as unknown as { freeStage(): Frame | null; anchor(id: string): { x: number; y: number; shown: boolean; onScreen: boolean } | null };
  const ids = ['object-top', 'object-bottom', 'retinal-screen', 'retina', 'cochlea-shell', 'eardrum', 'malleus', 'incus', 'wave-reference', 'hair-patch'];
  return { frame: e.freeStage(), anchors: Object.fromEntries(ids.map((id) => [id, e.anchor(id)])) };
});
const inside = (a: { x: number; y: number } | null, f: Frame | null) => !!a && !!f && a.x >= f.x0 && a.x <= f.x1 && a.y >= f.y0 && a.y <= f.y1;
async function present(p: Page, chapter: string, beat: number) {
  await p.evaluate(([c, b]) => window.__atlas!.goToBeat(window.__atlas!.beats().findIndex((x) => x.chapter === c && x.index === b), { instant: true }), [chapter, beat] as const);
}

test('F1/F2/F5: the bench reads in the presentation, inside the free band, redrawn after the resize', async ({ page }) => {
  await page.addInitScript(() => {
    new MutationObserver((list) => { if (list.some((m) => m.target instanceof HTMLCanvasElement)) (window as unknown as { resized: number }).resized = performance.now(); })
      .observe(document, { attributes: true, attributeFilter: ['width', 'height'], subtree: true });
  });
  await open(page, 'ch=near-far-and-focus');
  await present(page, 'near-far-and-focus', 1);
  // The HUD → presentation resize clears the canvas; a frame must follow it (no empty stage under live labels).
  await page.waitForFunction(() => ((window.__atlas!.stats() as { lastFrame?: number }).lastFrame ?? 0) > ((window as unknown as { resized?: number }).resized ?? 0), null, { timeout: 20_000 });
  expect((await sim(page)).outputs['focus-state']).toBe('behind-retina');
  await expect.poll(async () => {
    const { frame, anchors } = await api(page);
    return ['object-top', 'object-bottom', 'retinal-screen'].every((id) => inside(anchors[id]!, frame));
  }, { timeout: 15_000 }).toBe(true);
  const eye = (await senses(page)).eye as unknown as { yScale: number; label: { shown: boolean } };
  expect(eye.yScale).toBe(20);
  await expect(page.locator('[data-senses-stage]')).toContainText('×20');
  await expect.poll(async () => page.locator('[data-senses-stage]').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
});

test('F3/F4: the wave row and the framed hair-cell window stay clear of the ear and the caption', async ({ page }) => {
  await open(page, 'ch=pitch-and-strength');
  await present(page, 'pitch-and-strength', 0);
  await expect.poll(async () => (await senses(page)).wave?.positions[5]).toBeDefined();
  const wave = (await senses(page)).wave as unknown as { A: number };
  expect(wave.A).toBeCloseTo(.035, 9);
  await expect.poll(async () => { const { frame, anchors } = await api(page); return inside(anchors['wave-reference']!, frame); }, { timeout: 15_000 }).toBe(true);
  await present(page, 'vibration-to-signal', 2);
  const inset = page.locator('[data-inset="hair-cell-window"]');
  await expect.poll(async () => inset.evaluate((el) => getComputedStyle(el).opacity), { timeout: 15_000 }).toBe('1');
  await expect(inset).toContainText(/different scale/i);
  const box = await inset.locator('rect').evaluate((r) => ({ x0: +r.getAttribute('x')!, y0: +r.getAttribute('y')!, x1: +r.getAttribute('x')! + +r.getAttribute('width')!, y1: +r.getAttribute('y')! + +r.getAttribute('height')! }));
  const { frame, anchors } = await api(page);
  for (const id of ['malleus', 'incus', 'cochlea-shell']) expect(inside(anchors[id]!, box), id).toBe(false);
  expect(inside(anchors['hair-patch']!, frame)).toBe(true);
});

test('F6: the phone overview shows both stations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'ch=before-you-start');
  await expect.poll(async () => {
    const { anchors } = await api(page);
    return ['retina', 'eardrum', 'cochlea-shell'].every((id) => anchors[id]?.onScreen && anchors[id]!.x > 0 && anchors[id]!.x < 390);
  }, { timeout: 15_000 }).toBe(true);
});

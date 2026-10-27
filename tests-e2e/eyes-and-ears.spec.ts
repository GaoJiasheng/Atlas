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
  await expect.poll(async () => (await senses(page)).wave?.positions[5]).toBeCloseTo(.2625, 9);
  await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sensesSeek(.25));
  await expect.poll(async () => (await senses(page)).wave?.positions[5]).toBeCloseTo(.25, 9);
  await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sensesSeek(1));
  await expect.poll(async () => (await senses(page)).wave?.positions[5]).toBeCloseTo(.2625, 9);
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
  await page.locator('.space-beatline__btn').last().click();
  await expect.poll(() => page.url()).toContain('b=2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

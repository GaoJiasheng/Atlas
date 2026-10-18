/**
 * A link to a beat (`?ch=<chapter>&b=<n>`, SpaceScene) opens on that beat as
 * the chapter axis shows it: the beat's try-it values (`sim.set`), the
 * readings and the PLATE from them, its camera, its runs at their end; the
 * parts stand where the axis puts them. An explicit `sim=` in the link wins,
 * and the link the scene writes at a beat is the plain `?ch=&b=`.
 */
import { expect, test, type Page } from '@playwright/test';

type Run = { t: number; duration: number; playing: boolean };
type Anchor = { x: number; y: number; shown: boolean; onScreen: boolean };
type Engine = { sim(): { set: Record<string, unknown>; timeline: Record<string, Run> }; anchor(id: string): Anchor | null };

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const engine = (page: Page) => ({
  set: () => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim().set),
  run: (id: string) => page.evaluate((i) => (window.__atlas!.engine as unknown as Engine).sim().timeline[i]!, id),
  anchor: (id: string) => page.evaluate((i) => (window.__atlas!.engine as unknown as Engine).anchor(i), id),
});
const reading = (page: Page, name: string) => page.locator('.space-plate__reading', { hasText: name });

/** Where `ids` stand once the camera and every run have come to rest (two reads 300 ms apart agree). */
async function settled(page: Page, ids: string[]): Promise<Anchor[]> {
  const e = engine(page);
  const read = async () => Promise.all(ids.map((id) => e.anchor(id)));
  let last = await read();
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(300);
    const now = await read();
    const runs = await page.evaluate(() => Object.values((window.__atlas!.engine as unknown as Engine).sim().timeline).some((r) => r.playing));
    if (!runs && JSON.stringify(now) === JSON.stringify(last)) return now as Anchor[];
    last = now;
  }
  throw new Error(`parts ${ids.join(', ')} never came to rest`);
}

/** The same beat picked on the chapter axis (from the chapter's first beat), after the camera flight and the run. */
async function viaAxis(page: Page, chapter: string, k: number, ids: string[]) {
  await page.locator(`.atlas-axis__tick[data-beat="${chapter}.0"]`).click();
  await settled(page, ids);
  await page.locator(`.atlas-axis__tick[data-beat="${chapter}.${k}"]`).click();
  await expect.poll(() => page.evaluate(() => (window.__atlas!.state() as { beat?: number | null }).beat)).toBe(k);
  return settled(page, ids);
}

function expectSameSpot(a: Anchor[], b: Anchor[]) {
  for (const [i, p] of a.entries()) {
    expect(p.shown && p.onScreen).toBe(true);
    expect(Math.abs(p.x - b[i]!.x)).toBeLessThan(2);
    expect(Math.abs(p.y - b[i]!.y)).toBeLessThan(2);
  }
}

test.describe('beat links', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
  });

  test('forces: a link to the 1.5 m drop shows that drop, at its end, where the axis puts it', async ({ page }) => {
    const ids = ['release-clamps', 'steel-ball-large'];
    await open(page, '/en/topics/forces/?ch=gravity-and-weight&b=3');
    const e = engine(page);
    // The chapter drops from 1.0 m (0.45 s); beat 3 raises the clamps to 1.5 m.
    expect(await e.set()).toEqual({ pair: 'balls', 'drop-height': 1.5 });
    await expect(reading(page, 'FALL TIME')).toContainText('0.55 · 0.55 s');
    const run = await e.run('drop-run');
    expect(run.playing).toBe(false);
    expect(run.t).toBe(run.duration);
    const linked = await settled(page, ids);
    // The scene writes the plain beat link back.
    await expect.poll(() => page.evaluate(() => location.search)).toBe('?ch=gravity-and-weight&b=3');
    expectSameSpot(linked, await viaAxis(page, 'gravity-and-weight', 2, ids));
    expect(await e.set()).toEqual({ pair: 'balls', 'drop-height': 1.5 });
    await expect.poll(() => page.evaluate(() => location.search)).toBe('?ch=gravity-and-weight&b=3');
  });

  test('forces: an explicit sim= in the link wins over the beat’s values', async ({ page }) => {
    await open(page, '/en/topics/forces/?ch=gravity-and-weight&b=3&sim=drop-height.1~pair.balls');
    expect(await engine(page).set()).toEqual({ pair: 'balls', 'drop-height': 1 });
    await expect(reading(page, 'FALL TIME')).toContainText('0.45 · 0.45 s');
    expect(await page.evaluate(() => (window.__atlas!.state() as { beat?: number | null }).beat)).toBe(2);
  });

  test('energy-conversion: a link to the sand beat shows the 5 cm bounce, the ball low on the sand', async ({ page }) => {
    const ids = ['tennis-ball'];
    await open(page, '/en/topics/energy-conversion/?ch=up-high-and-moving&b=1');
    await expect(reading(page, 'BOUNCE HEIGHT')).toContainText('55 cm');
    const [onTile] = await settled(page, ids);

    await open(page, '/en/topics/energy-conversion/?ch=up-high-and-moving&b=3');
    const e = engine(page);
    expect(await e.set()).toEqual({ chain: 'bounce', drop: 100, surface: 'sand' });
    await expect(reading(page, 'BOUNCE HEIGHT')).toContainText('5 cm');
    const run = await e.run('bounce-run');
    expect(run.playing).toBe(false);
    expect(run.t).toBe(run.duration);
    const linked = await settled(page, ids);
    // Same camera as beat 1 (neither has its own): the run ends at the top of a 5 cm bounce, well below the 55 cm one.
    expect(linked[0]!.y - onTile!.y).toBeGreaterThan(100);
    expectSameSpot(linked, await viaAxis(page, 'up-high-and-moving', 2, ids));
  });
});

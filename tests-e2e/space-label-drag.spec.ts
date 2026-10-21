import { expect, test, type Locator, type Page } from '@playwright/test';

// Software WebGL needs time to load two scenes and settle the damped camera.
test.describe.configure({ timeout: 120_000 });

type Point = { x: number; y: number };
const state = (page: Page) => page.evaluate(() => window.__atlas!.state() as ReturnType<NonNullable<typeof window.__atlas>['state']> & { part: string | null });

async function centre(label: Locator): Promise<Point> {
  const box = await label.boundingBox();
  expect(box).not.toBeNull();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

async function open(page: Page, theme: 'paper' | 'cinema') {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/en/topics/mosquito/?ch=the-adult');
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await page.evaluate((t) => {
    window.__atlas!.setTheme(t);
    window.__atlas!.setPreset('hero', { instant: true });
  }, theme);
  await expect.poll(async () => (await state(page)).preset).toBe('hero');
  const label = page.locator('.space-co[data-id="thorax"] .space-co__hit');
  await expect.poll(() => label.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('all');
  // Allow the label's layout glide and its opacity to finish before taking coordinates.
  await page.waitForTimeout(500);
  return label;
}

async function drag(page: Page, from: Point, to: Point) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
}

async function freed(page: Page, camera: unknown) {
  await expect.poll(async () => (await state(page)).preset, { timeout: 30_000, intervals: [500] }).toBeNull();
  await expect.poll(async () => JSON.stringify((await state(page)).camera)).not.toBe(JSON.stringify(camera));
  await expect.poll(async () => (await state(page)).part).toBeNull();
}

for (const theme of ['paper', 'cinema'] as const) {
  test(`SpaceScene ${theme}: label text selects, but dragging from its 44 px target orbits`, async ({ page }) => {
    const label = await open(page, theme);
    const box = await label.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
    const text = page.locator('.space-co[data-id="thorax"] .space-co__text');
    const point = await centre(text);
    await page.mouse.click(point.x, point.y);
    await expect.poll(async () => (await state(page)).part).toBe('thorax');

    await open(page, theme);
    const before = (await state(page)).camera;
    const from = await centre(label);
    await drag(page, from, { x: from.x + 130, y: from.y + 60 });
    await freed(page, before);
  });

  test(`SpaceScene ${theme}: a drag released on a label keeps the camera free without selecting`, async ({ page }) => {
    const label = await open(page, theme);
    const before = (await state(page)).camera;
    const to = await centre(label);
    const from = { x: to.x + 80, y: to.y + 50 };
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 12 });
    // Rotation can hide the original part. End over a currently interactive
    // placard, following its glide rather than using a stale screen position.
    let overLabel = false;
    let pointer = to;
    for (let attempt = 0; attempt < 12 && !overLabel; attempt++) {
      const end = await page.evaluate((near) => {
        return [...document.querySelectorAll<SVGRectElement>('.space-co:not([data-group]) .space-co__hit')]
          .filter((el) => getComputedStyle(el).pointerEvents === 'all')
          .map((el) => {
            const b = el.getBoundingClientRect();
            return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
          })
          .sort((a, b) => Math.hypot(a.x - near.x, a.y - near.y) - Math.hypot(b.x - near.x, b.y - near.y))[0] ?? null;
      }, pointer);
      if (end) {
        pointer = end;
        await page.mouse.move(end.x, end.y);
        await page.waitForTimeout(100);
        overLabel = await page.evaluate((p) => Boolean(document.elementFromPoint(p.x, p.y)?.closest('.space-co:not([data-group])')), end);
      } else await page.waitForTimeout(100);
    }
    expect(overLabel).toBe(true);
    await page.mouse.up();
    await freed(page, before);
  });

  test(`SpaceScene ${theme}: group labels, leader lines and anchor dots let the orbit through`, async ({ page }) => {
    await open(page, theme);
    for (const selector of ['.space-co__leader', '.space-co__dot', '.space-co[data-group] .space-co__hit']) {
      await expect.poll(() => page.locator(selector).count()).toBeGreaterThan(0);
      expect(await page.locator(selector).evaluateAll((els) => els.every((el) => getComputedStyle(el).pointerEvents === 'none'))).toBe(true);
    }
    const group = page.locator('.space-co[data-id="group:head"] .space-co__text');
    await expect.poll(() => group.locator('..').evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.5);
    const from = await centre(group);
    expect(await page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.closest('.space-co') === null, from)).toBe(true);
    const before = (await state(page)).camera;
    await drag(page, from, { x: from.x + 120, y: from.y + 70 });
    await freed(page, before);
  });

  test(`SpaceScene ${theme}: a drag starting on a leader line reaches the stage`, async ({ page }) => {
    await open(page, theme);
    const from = await page.locator('.space-co__leader').evaluateAll((els) => {
      for (const el of els) {
        const line = el as SVGPathElement;
        if (Number(getComputedStyle(line).opacity) < 0.5 || line.getTotalLength() < 50) continue;
        const point = line.getPointAtLength(line.getTotalLength() * 0.65);
        const matrix = line.getScreenCTM();
        if (!matrix) continue;
        const p = new DOMPoint(point.x, point.y).matrixTransform(matrix);
        if (document.elementFromPoint(p.x, p.y)?.closest('.space-stage')) return { x: p.x, y: p.y };
      }
      return null;
    });
    expect(from).not.toBeNull();
    const before = (await state(page)).camera;
    await drag(page, from!, { x: from!.x + 90, y: from!.y + 40 });
    await freed(page, before);
  });
}


async function abdomenPoint(page: Page): Promise<Point> {
  return page.evaluate(() => {
    const anchor = window.__atlas!.engine.anchor!('abdomen' as never) as unknown as Point;
    const box = document.querySelector('.space-stage')!.getBoundingClientRect();
    return { x: box.x + anchor.x, y: box.y + anchor.y };
  });
}

/** Place the thorax placard over a known pickable point, keeping native hit testing. */
async function coverPoint(page: Page, point: Point) {
  await page.locator('.space-co[data-id="thorax"]').evaluate((label, p) => {
    const hit = label.querySelector<SVGRectElement>('.space-co__hit')!;
    const box = hit.getBBox();
    const svg = (label as SVGGElement).ownerSVGElement!.getBoundingClientRect();
    (label as SVGGElement).style.transform = `translate(${p.x - svg.x - box.x - box.width / 2}px, ${p.y - svg.y - box.y - box.height / 2}px)`;
  }, point);
  expect(await page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.closest('.space-co')?.getAttribute('data-id'), point)).toBe('thorax');
}

test.describe('SpaceScene touch labels', () => {
  test.use({ hasTouch: true });

  test('a native touch tap selects label text and a touch drag orbits without selecting', async ({ page, context }) => {
    await open(page, 'paper');
    const text = page.locator('.space-co[data-id="thorax"] .space-co__text');
    const point = await centre(text);
    await page.touchscreen.tap(point.x, point.y);
    await page.waitForTimeout(100);
    await expect.poll(async () => (await state(page)).part).toBe('thorax');

    const label = await open(page, 'paper');
    const before = (await state(page)).camera;
    const from = await centre(label);
    const client = await context.newCDPSession(page);
    const touches = (x: number, y: number) => [{ x, y, id: 0, radiusX: 1, radiusY: 1, force: 1 }];
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: touches(from.x, from.y) });
    for (let step = 1; step <= 12; step++) {
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: touches(from.x + step * 10, from.y + step * 5) });
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await freed(page, before);
  });

  test('holding an overlapping label never long-presses the model underneath', async ({ page, context }) => {
    await open(page, 'paper');
    const client = await context.newCDPSession(page);
    const touch = (p: Point) => [{ ...p, id: 0, radiusX: 1, radiusY: 1, force: 1 }];
    const point = await abdomenPoint(page);
    expect(await page.evaluate((p) => Boolean(document.elementFromPoint(p.x, p.y)?.closest('.space-stage')), point)).toBe(true);

    // Calibrate the overlap with a native long press on the uncovered model:
    // ordinary model picking must continue to work.
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: touch(point) });
    await expect.poll(async () => (await state(page)).part).not.toBeNull();
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    await page.evaluate(() => {
      window.__atlas!.goToChapter('the-adult', { instant: true });
      window.__atlas!.setPreset('hero', { instant: true });
    });
    await expect.poll(async () => (await state(page)).part).toBeNull();
    await coverPoint(page, point);
    const before = (await state(page)).camera;
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: touch(point) });
    // PartNode's native long-press threshold is 400 ms.
    await page.waitForTimeout(600);
    expect((await state(page)).part).toBeNull();
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: touch({ x: point.x + 100, y: point.y + 50 }) });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await freed(page, before);

    await page.evaluate(() => {
      window.__atlas!.goToChapter('the-adult', { instant: true });
      window.__atlas!.setPreset('hero', { instant: true });
    });
    await coverPoint(page, point);
    await page.touchscreen.tap(point.x, point.y);
    await expect.poll(async () => (await state(page)).part).toBe('thorax');
    await client.detach();
  });

});

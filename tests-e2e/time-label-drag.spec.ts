import { expect, test, type Locator, type Page } from '@playwright/test';

const labelSelector = 'button.ts-co[data-id="hdb-founded"][data-hidden="false"]';
const camera = (page: Page) => page.evaluate(() => window.__atlas!.state().camera);

async function centre(label: Locator) {
  const box = await label.boundingBox();
  expect(box).not.toBeNull();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

async function expectPanned(page: Page, before: Awaited<ReturnType<typeof camera>>) {
  await expect.poll(async () => page.evaluate(() => window.__atlas!.state().preset)).toBeNull();
  await expect.poll(() => camera(page)).not.toEqual(before);
  await expect(page.locator('.ts-event')).toHaveCount(0);
}

async function bareMapPoint(page: Page, label: Locator) {
  const point = await centre(label);
  const result = await page.evaluate(({ x, y }) => {
    for (const [dx, dy] of [[220, 0], [-220, 0], [0, -100], [0, 100]]) {
      const candidate = { x: x + dx!, y: y + dy! };
      if (document.elementFromPoint(candidate.x, candidate.y)?.matches('.maplibregl-canvas')) return candidate;
    }
    return null;
  }, point);
  expect(result).not.toBeNull();
  return result!;
}

for (const theme of ['paper', 'cinema'] as const) {
  test(`TimeScene ${theme}: labels allow native map drags and retain clicks`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/en/topics/singapore-land-use/?ch=crowded-city&t=1965');
    await expect(page.locator('.ts-geo')).toHaveAttribute('data-status', 'ready', { timeout: 30_000 });
    await page.evaluate((value) => {
      window.__atlas!.setTheme(value);
      window.__atlas!.setPreset('world', { instant: true });
    }, theme);
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().preset)).toBe('world');
    const label = page.locator(labelSelector);
    await expect(label).toBeVisible();
    expect((await label.boundingBox())!.width).toBeGreaterThanOrEqual(44);
    expect((await label.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    for (const selector of ['.ts-leader', '.ts-leader__dot']) {
      expect(await page.locator(selector).first().evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none');
    }

    // Start on the button: the map must receive the native down / move / up.
    let before = await camera(page);
    let point = await centre(label);
    const destination = await bareMapPoint(page, label);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(destination.x, destination.y, { steps: 8 });
    await page.mouse.up();
    await expectPanned(page, before);

    await page.keyboard.press('1');
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().preset)).toBe('world');
    await expect(label).toBeVisible();
    before = await camera(page);
    point = await bareMapPoint(page, label);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    // Leaders follow the moving map; finish over the current button position.
    let overLabel = false;
    for (let i = 0; i < 8 && !overLabel; i++) {
      point = await centre(label);
      await page.mouse.move(point.x, point.y, { steps: i === 0 ? 8 : 1 });
      await page.waitForTimeout(80);
      overLabel = await page.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest('button.ts-co')), point);
    }
    expect(overLabel).toBe(true);
    await page.evaluate(() => document.addEventListener('mouseup', (ev) => {
      document.documentElement.dataset.releaseLabel = String(ev.target instanceof Element && Boolean(ev.target.closest('button.ts-co')));
    }, { once: true }));
    await page.mouse.up();
    await expect(page.locator('html')).toHaveAttribute('data-release-label', 'true');
    await expectPanned(page, before);
    await page.keyboard.press('1');
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().preset)).toBe('world');

    // A click still selects the label's own event, without selecting the map below.
    await label.click();
    await expect(page.locator('#ts-event-hdb-founded')).toBeVisible();
    expect(await page.evaluate(() => (window.__atlas!.state() as unknown as { highlight: string[] }).highlight)).toEqual(['hdb-founded']);
    await page.locator('.ts-event__header button').click();
    await label.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#ts-event-hdb-founded')).toBeVisible();
  });
}

test.describe('TimeScene native touch', () => {
  test.use({ hasTouch: true });

  test('a touch drag on a label pans the map and a tap still selects', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/en/topics/singapore-land-use/?ch=crowded-city&t=1965');
    await expect(page.locator('.ts-geo')).toHaveAttribute('data-status', 'ready', { timeout: 30_000 });
    await page.evaluate(() => window.__atlas!.setPreset('world', { instant: true }));
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().preset)).toBe('world');
    const label = page.locator(labelSelector);
    await expect(label).toBeVisible();
    const before = await camera(page);
    const start = await centre(label);
    const end = await bareMapPoint(page, label);
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
    for (let i = 1; i <= 8; i++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: start.x + (end.x - start.x) * i / 8, y: start.y + (end.y - start.y) * i / 8 }],
      });
      await page.waitForTimeout(20);
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expectPanned(page, before);

    const tap = await centre(label);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [tap] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('#ts-event-hdb-founded')).toBeVisible();
    await page.keyboard.press('1');
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().preset)).toBe('world');
    await session.detach();
  });
});

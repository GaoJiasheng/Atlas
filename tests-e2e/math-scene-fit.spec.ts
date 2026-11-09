/**
 * MathScene fit (the QA pass of the shared engine): the keypad inside its card
 * on a phone, in the docked tray and in the presentation; the clock above the
 * timeline on a phone; the jumps' labels clear of the hour labels; a place chart
 * of many equal rows inside the stage; the column working on its own rows; the
 * practice summary reached straight from another chapter; the net's tools above
 * the docked tray on a portrait tablet opened from a link; what stands on a
 * raised balance pan clear of the title.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

type Engine = { goToTask(step: string, i: number, o?: { instant?: boolean }): void; task(): { id: string | null } };
interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
/** Into the presentation at a beat of a chapter (1-based, as the QA names them). */
async function present(page: Page, chapter: string, n: number) {
  const i = await page.evaluate(([c, k]) => window.__atlas!.beats().findIndex((b) => b.chapter === c && b.index === (k as number) - 1), [chapter, n] as const);
  expect(i).toBeGreaterThanOrEqual(0);
  await page.evaluate((k) => window.__atlas!.goToBeat(k, { instant: true }), i);
}
const force = (page: Page, step: string, i: number) => page.evaluate(([s, k]) => (window.__atlas!.engine as unknown as Engine).goToTask(s as string, k as number, { instant: true }), [step, i] as const);
const taskId = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).task().id);
const rect = async (l: Locator) => (await l.boundingBox()) as Box;

async function keysInsideCard(page: Page, card: Locator) {
  const c = await rect(card);
  const keys = await page.locator('.ms-keypad .ms-key').all();
  expect(keys.length).toBeGreaterThanOrEqual(11);
  for (const key of keys) {
    const b = await rect(key);
    expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(43.5);
    expect(b.x).toBeGreaterThanOrEqual(c.x);
    expect(b.x + b.width).toBeLessThanOrEqual(c.x + c.width + 0.5);
    expect(b.y + b.height).toBeLessThanOrEqual(c.y + c.height + 0.5);
  }
  for (const box of await page.locator('.ms-tray .ms-box').all()) {
    const b = await rect(box);
    expect(b.x + b.width).toBeLessThanOrEqual(c.x + c.width + 0.5);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
}

test.describe('MathScene fit', () => {
  test('phone: every key of the keypad sits inside the docked tray', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/decimals/?ch=hundredths');
    await force(page, 'hundredths', 2);
    await expect.poll(() => taskId(page)).toBe('hu-write-4-hundredths');
    await expect(page.locator('.ms-keypad')).toBeVisible();
    await keysInsideCard(page, page.locator('.ms-tray-dock .ms-tray'));
  });

  for (const [topic, chapter] of [['measuring', 'practice'], ['telling-time', 'practice']] as const)
    test(`phone: the keypad and boxes stay inside the presentation card (${topic})`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await open(page, `/en/topics/${topic}/?ch=${chapter}`);
      await present(page, chapter, topic === 'measuring' ? 1 : 8);
      await expect(page.locator('.ms-keypad')).toBeVisible();
      await keysInsideCard(page, page.locator('[data-hud-panel="present"]'));
    });

  test('phone: the clock stands above the timeline, whole and clear of it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/telling-time/?ch=how-long');
    await present(page, 'how-long', 5);
    const clock = await rect(page.locator('.ms-tl .ms-clock__rim').first());
    const line = await rect(page.locator('.ms-tl .ms-line__axis').first());
    const top = await page.evaluate(() => Math.min(...[...document.querySelectorAll('.ms-tl__mark-label, .ms-tl__mark-time')].map((e) => e.getBoundingClientRect().top)));
    expect(clock.x).toBeGreaterThanOrEqual(0);
    expect(clock.x + clock.width).toBeLessThanOrEqual(390);
    expect(clock.y + clock.height).toBeLessThanOrEqual(top + 1);
    expect(clock.y + clock.height).toBeLessThan(line.y);
  });

  for (const size of [{ width: 1024, height: 768 }, { width: 390, height: 844 }])
    test(`the jumps' labels keep clear of the hour labels at ${size.width}`, async ({ page }) => {
      await page.setViewportSize(size);
      await open(page, '/en/topics/telling-time/?ch=starting-time');
      await present(page, 'starting-time', 4);
      await expect(page.locator('.ms-tl__jump text').first()).toBeVisible();
      await page.waitForTimeout(600);
      const touching = await page.evaluate(() => {
        const of = (s: string) => [...document.querySelectorAll(s)].map((e) => e.getBoundingClientRect());
        const jumps = of('.ms-tl__jump text');
        const others = of('.ms-tl .ms-line__num');
        const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        return jumps.filter((a, i) => others.some((b) => hit(a, b)) || jumps.some((b, k) => k !== i && hit(a, b))).length;
      });
      expect(touching).toBe(0);
    });

  test('a place chart of seven equal rows stays on the stage, above the card', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await open(page, '/en/topics/decimals/?ch=multiplying-decimals');
    await present(page, 'multiplying-decimals', 6);
    await force(page, 'multiplying-decimals', 3);
    await expect.poll(() => taskId(page)).toBe('mu-06-times-7');
    // The stage lays out again once the card (with the keypad) has its height.
    await expect
      .poll(async () => {
        const chart = await rect(page.locator('.ms-pvc').first());
        const card = await rect(page.locator('[data-hud-panel="present"]'));
        return chart.y >= 0 && chart.y + chart.height <= card.y;
      })
      .toBe(true);
    await expect(page.locator('.ms-pvc__rowno')).toHaveCount(7);
  });

  test('the column working beside a chart keeps its rows apart', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await open(page, '/en/topics/decimals/?ch=subtracting-decimals');
    await present(page, 'subtracting-decimals', 5);
    await expect(page.locator('.ms-col--decimal .ms-col__digit').first()).toBeVisible();
    await page.waitForTimeout(500);
    const overlap = await page.evaluate(() => {
      const boxes = [...document.querySelectorAll('.ms-col--decimal text')].map((e) => e.getBoundingClientRect());
      return boxes.some((a, i) => boxes.some((b, k) => k > i && a.left + 1 < b.right && b.left + 1 < a.right && a.top + 2 < b.bottom && b.top + 2 < a.bottom));
    });
    expect(overlap).toBe(false);
  });

  test('the practice summary shows when the presentation jumps to it from another chapter, nothing answered', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await open(page, '/en/topics/decimals/?ch=tenths');
    await present(page, 'practice', 9);
    await expect(page.locator('.ms-summary')).toContainText('You got 0 of 8.');
    await expect(page.locator('.ms-summary tbody tr')).toHaveCount(8);
  });

  test('portrait tablet, opened from a link on a net: the stage is laid out and the tools sit above the tray', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await open(page, '/en/topics/nets-and-solids/?ch=practice&b=2');
    await expect(page.locator('.ms-root')).toHaveAttribute('data-stage-free', /^\d+ \d+$/);
    await expect
      .poll(async () => {
        const tools = await rect(page.locator('.ms-net-tools-panel'));
        const tray = await rect(page.locator('.ms-tray-dock .ms-tray'));
        return tools.y + tools.height <= tray.y + 0.5;
      })
      .toBe(true);
    // The left column settles: it does not flip between open and compact.
    const seen = await page.evaluate(async () => {
      const states = new Set<string>();
      for (let i = 0; i < 20; i++) {
        states.add(window.__atlas!.state().leftColumn);
        await new Promise((r) => requestAnimationFrame(r));
      }
      return states.size;
    });
    expect(seen).toBe(1);
  });

  test('a big ball on the raised pan stays under the title', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await open(page, '/en/topics/measuring/?ch=mass-and-balances');
    await present(page, 'mass-and-balances', 1);
    await page.waitForTimeout(500);
    const balance = await rect(page.locator('.ms-bal').first());
    const title = await rect(page.locator('[data-hud-panel="present-title"]'));
    expect(balance.y).toBeGreaterThanOrEqual(title.y + title.height);
  });
});

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
import { measurePainted } from './math-painted';

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

  // With the keypad up the model still has a readable stage above the tray (before the phone tray was compacted: a free
  // rectangle of 252 px, a 184 px drawing; the bus ride's timeline ran 53 px under the tray).
  for (const [topic, chapter, i, id, free, drawn] of [
    ['decimals', 'hundredths', 2, 'hu-write-4-hundredths', 0.32, 0.24],
    ['telling-time', 'timetables', 1, 'tt-bus-ride', 0.16, 0.1],
  ] as const)
    test(`phone, keypad up: the model keeps its stage above the docked tray (${id})`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await open(page, `/en/topics/${topic}/?ch=${chapter}`);
      await force(page, chapter, i);
      await expect.poll(() => taskId(page)).toBe(id);
      await expect(page.locator('.ms-tray-dock .ms-keypad')).toBeVisible();
      const freeH = () => page.evaluate(() => Number(document.querySelector<HTMLElement>('.ms-root')?.dataset.stageFree?.split(' ')[1] ?? 0));
      await expect.poll(freeH).toBeGreaterThanOrEqual(free * 844);
      await expect.poll(async () => (await rect(page.locator('.ms-svg .ms-beat'))).height).toBeGreaterThanOrEqual(drawn * 844);
      // Measured once the stage has laid out again for the tray (a single read could catch the drawing mid-move, still sized for
      // the stage before the tray docked).
      await expect
        .poll(async () => {
          const tray = await rect(page.locator('.ms-tray-dock .ms-tray'));
          const model = await rect(page.locator('.ms-svg .ms-beat'));
          return model.y + model.height <= tray.y - 8;
        })
        .toBe(true);
    });

  test('small phone: the check buttons keep one row and the card tab ends above the docked tray', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await open(page, '/en/topics/decimals/?ch=hundredths');
    await force(page, 'hundredths', 2);
    await expect.poll(() => taskId(page)).toBe('hu-write-4-hundredths');
    await expect(page.locator('.ms-tray-dock .ms-keypad')).toBeVisible();
    const tops = await page.locator('.ms-tray-dock .ms-tray__actions > .ms-btn').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(tops.length).toBeGreaterThanOrEqual(4);
    expect(new Set(tops).size).toBe(1);
    const tray = await rect(page.locator('.ms-tray-dock .ms-tray'));
    const tab = await rect(page.locator('[data-hud-panel="card-tab"]'));
    expect(Math.min(tab.width + 16, tab.height)).toBeGreaterThanOrEqual(44);
    expect(tab.y + tab.height).toBeLessThanOrEqual(tray.y);
  });

  // A short phone (≤ 760 px high) with a check to answer in the docked tray folds the title block's chapter squares and the top
  // bar's status line, keeps the title on one line and packs the tray (the boxes beside "Take back" or the towers' count, seven keys
  // to a row, the jumps' note at the end of the keys); a timeline short of room draws tight. Before, at 375×667 (EN): the bus
  // ride's free stage 205×38 and evening out 205×81, neither drawing its model (ZH: 233×52 and 172×70).
  // What the drawing paints (not its group's bounding box, which counts what a clip path cuts away: a pail's liquid runs far below
  // the pail).
  const drawn = async (page: Page) => {
    const tray = await rect(page.locator('.ms-tray-dock .ms-tray'));
    const { box } = await measurePainted(page);
    const boxes = box ? [{ top: box.top, bottom: box.bottom, width: box.right - box.left }] : [];
    return { tray, boxes };
  };
  /** A model is drawn and, once settled, ends at least 8 px above the tray (the stage's whole pixels against the tray's fractional top: half a pixel either way). */
  const drawnAbove = (page: Page) =>
    expect.poll(async () => {
      const { tray, boxes } = await drawn(page);
      return boxes.length > 0 && boxes.every((b) => b.bottom <= tray.y - 7.5);
    }).toBe(true);
  // Then (before the next fixes): two picture graphs stacked, each picture 3 px; a timeline across noon with no room for the
  // noon's name under its bands (ct-ends, EN: not drawn) or its bands' names run up into the title (ft-film-crosses-noon,
  // ft-family-visit). Now a pair of picture graphs short of height stands side by side, and a tight timeline names noon in its hour
  // label and keeps its bands' shading without their names (the hour labels say am and pm).
  for (const [locale, topic, chapter, i, id, w, h, mw, mh, keys] of [
    ['en', 'decimals', 'hundredths', 2, 'hu-write-4-hundredths', 300, 160, 100, 100, true],
    ['en', 'telling-time', 'timetables', 1, 'tt-bus-ride', 300, 130, 280, 90, true],
    ['zh', 'telling-time', 'timetables', 1, 'tt-bus-ride', 300, 130, 280, 90, true],
    ['en', 'average', 'evening-out', 0, 'even-3-5-7', 300, 150, 200, 90, true],
    ['zh', 'average', 'evening-out', 0, 'even-3-5-7', 300, 150, 200, 90, true],
    ...(['en', 'zh'] as const).flatMap((l) => [
      [l, 'graphs', 'picture-graphs', 9, 'pic-two-keys', 300, 280, 220, 250, false],
      [l, 'sample-lesson-whole', 'clock-and-timeline', 7, 'ct-ends', 300, 125, 260, 120, true],
      [l, 'telling-time', 'finishing-time', 5, 'ft-film-crosses-noon', 300, 135, 260, 120, true],
      [l, 'telling-time', 'finishing-time', 6, 'ft-family-visit', 300, 135, 260, 120, true],
      // The pail's handle stood up into the title: in a short box the pail and its handle stand inside the stage together.
      [l, 'measuring', 'volume-and-litres', 1, 'vl-pail-6', 300, 140, 120, 140, true],
    ] as const),
  ] as const)
    test(`small phone, keypad up: the stage above the tray draws the whole model (${id}, ${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await open(page, `/${locale}/topics/${topic}/?ch=${chapter}`);
      await expect(page.locator('.atlas-rail__item').first()).toBeVisible();
      await force(page, chapter, i);
      await expect.poll(() => taskId(page)).toBe(id);
      // A choice has no keypad: its tray holds the options.
      await expect(page.locator(keys ? '.ms-tray-dock .ms-keypad' : '.ms-tray-dock .ms-choice').first()).toBeVisible();
      await expect(page.locator('.atlas-rail')).toBeHidden();
      await expect(page.locator('[data-hud-panel="title"]')).toBeVisible();
      const free = () => page.evaluate(() => (document.querySelector<HTMLElement>('.ms-root')?.dataset.stageFree ?? '0 0').split(' ').map(Number));
      await expect.poll(async () => (await free())[0]!).toBeGreaterThanOrEqual(w);
      await expect.poll(async () => (await free())[1]!).toBeGreaterThanOrEqual(h);
      // A model is drawn, whole, above the tray.
      await drawnAbove(page);
      const { boxes } = await drawn(page);
      expect(Math.max(...boxes.map((b) => b.width))).toBeGreaterThanOrEqual(mw);
      expect(Math.max(...boxes.map((b) => b.bottom)) - Math.min(...boxes.map((b) => b.top))).toBeGreaterThanOrEqual(mh);
      // Nothing of it runs up into the title block.
      const title = await rect(page.locator('[data-hud-panel="title"]'));
      expect(Math.min(...boxes.map((b) => b.top))).toBeGreaterThanOrEqual(title.y + title.height - 0.5);
      // A picture graph's pictures stay large enough to count.
      const pics = await page.locator('.ms-svg .ms-beat .ms-chart__pics > *').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
      if (pics.length) expect(Math.min(...pics)).toBeGreaterThanOrEqual(14);
      // Every target in the tray stays a finger wide and high.
      for (const b of await page.locator('.ms-tray-dock :is(button, input):visible').all()) {
        const r = await rect(b);
        expect(Math.min(r.width, r.height)).toBeGreaterThanOrEqual(43.5);
      }
    });

  test('small phone: the bus ride keeps its timeline while the child jumps, and the chapter squares come back once it is answered', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await open(page, '/en/topics/telling-time/?ch=timetables');
    await force(page, 'timetables', 1);
    await expect.poll(() => taskId(page)).toBe('tt-bus-ride');
    await expect(page.locator('.atlas-rail')).toBeHidden();
    // The jumps that solve it: 13 50 → 14 00 → 15 00 → 15 05. The drawing stays, whole, above the tray.
    for (const by of [600, 3600, 300]) {
      await page.locator(`.ms-tray [data-hop="${by}"]`).click();
      await drawnAbove(page);
    }
    // 1 h 15 min on the keypad, then Check.
    const [hours, minutes] = await page.locator('.ms-tray .ms-box').all();
    await hours!.click();
    await page.locator('.ms-tray .ms-key', { hasText: /^1$/ }).click();
    await minutes!.click();
    for (const k of ['1', '5']) await page.locator('.ms-tray .ms-key', { hasText: new RegExp(`^${k}$`) }).click();
    await page.locator('.ms-tray [data-command="check"]').click();
    await expect(page.locator('.ms-tray__feedback[data-tone="correct"]')).toBeVisible();
    // The tray stays docked with its feedback; the chapter squares are back, finger-sized, and the stage measured again.
    await expect(page.locator('.ms-tray-dock .ms-tray')).toBeVisible();
    await expect(page.locator('.atlas-rail__item').first()).toBeVisible();
    expect((await rect(page.locator('.atlas-rail__item').first())).height).toBeGreaterThanOrEqual(44);
    const squares = await rect(page.locator('.atlas-rail'));
    await expect.poll(async () => {
      const { tray, boxes } = await drawn(page);
      return boxes.every((b) => b.top >= squares.y + squares.height && b.bottom <= tray.y);
    }).toBe(true);
  });

  // Models that outgrew a short phone's stage even shrunk to 0.75 and so were not drawn at all (EN, free stage → painted height):
  // the rows of a × stacked one under another (40 × 6, 90 × 7, 18 × 4 with its working under them), a share's plates in one row
  // 640 px wide, the thousand grid over its three steppers in rows. Now the rows of a × wrap into groups side by side under one-line
  // heads (the working beside them), the plates stack their places and wrap, the chart takes the columns that stand least tall,
  // and the tray puts the steppers and the share buttons side by side.
  for (const [locale, topic, chapter, i, id, mw, mh] of [
    ['en', 'multiplication-division', 'multiplying-in-columns', 2, 'mc-18-times-4', 240, 110],
    ['zh', 'multiplication-division', 'multiplying-in-columns', 2, 'mc-18-times-4', 240, 110],
    ['en', 'multiplication-division', 'multiplying-tens', 8, 'mt-90-by-7-rows', 200, 120],
    ['en', 'decimals', 'thousandths', 8, 'th-shade-0104', 200, 150],
    ['zh', 'decimals', 'thousandths', 8, 'th-shade-0104', 200, 150],
    ['en', 'decimals', 'dividing-decimals', 1, 'dv-share-735-by-5', 250, 140],
  ] as const)
    test(`small phone: a model too big for the stage keeps a compact layout above the tray (${id}, ${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await open(page, `/${locale}/topics/${topic}/?ch=${chapter}`);
      await force(page, chapter, i);
      await expect.poll(() => taskId(page)).toBe(id);
      await expect(page.locator('.ms-tray-dock .ms-tray')).toBeVisible();
      await drawnAbove(page);
      const { boxes } = await drawn(page);
      expect(Math.max(...boxes.map((b) => b.width))).toBeGreaterThanOrEqual(mw);
      expect(Math.max(...boxes.map((b) => b.bottom)) - Math.min(...boxes.map((b) => b.top))).toBeGreaterThanOrEqual(mh);
      // Shrunk no further than the floor: its smallest printed label stays readable.
      const smallest = await page.locator('.ms-svg .ms-beat :is(.ms-mat__head, .ms-mat__count, .ms-pvc__head, .ms-dgrid__times)').evaluateAll((els) => Math.min(...els.map((e) => e.getBoundingClientRect().height)));
      expect(smallest).toBeGreaterThanOrEqual(7.5);
      for (const b of await page.locator('.ms-tray-dock :is(button, input):visible').all()) {
        const r = await rect(b);
        expect(Math.min(r.width, r.height)).toBeGreaterThanOrEqual(43.5);
      }
    });

  // The chart above a share's plates on a short phone: its discs (ring and printing) never run into each other. Before, at 375×667
  // the 0.1 and 0.01 printings of rings 12 px across ran together ("0.10.10.1"); a ring too small for its printing stays blank, the
  // column's head says what it is worth.
  for (const locale of ['en', 'zh'] as const)
    test(`small phone: the share's place chart keeps every disc apart (dv-share-735-by-5, ${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await open(page, `/${locale}/topics/decimals/?ch=dividing-decimals`);
      await force(page, 'dividing-decimals', 1);
      await expect.poll(() => taskId(page)).toBe('dv-share-735-by-5');
      await drawnAbove(page);
      const discs = page.locator('.ms-svg .ms-pvc .ms-disc:not(.ms-disc--dealt)');
      await expect(discs).toHaveCount(15);
      const crossings = await discs.evaluateAll((els) => {
        const boxes = els.map((e) => e.getBoundingClientRect());
        let n = 0;
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i]!;
            const b = boxes[j]!;
            if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) n++;
          }
        return n;
      });
      expect(crossings).toBe(0);
      // A printing stays inside its own ring.
      const spill = await discs.evaluateAll((els) =>
        els.filter((e) => {
          const ring = e.querySelector('circle')!.getBoundingClientRect();
          const text = e.querySelector('text')?.getBoundingClientRect();
          return !!text && (text.left < ring.left - 0.5 || text.right > ring.right + 0.5);
        }).length,
      );
      expect(spill).toBe(0);
    });

  test('a choice in words draws its model: four elevenths of a strip', async ({ page }) => {
    for (const locale of ['en', 'zh']) {
      await open(page, `/${locale}/topics/fractions/?ch=non-unit-fractions`);
      await force(page, 'non-unit-fractions', 10);
      await expect.poll(() => taskId(page)).toBe('nu-four-elevenths-meaning');
      const bar = page.locator('.ms-svg .ms-beat .ms-bar');
      await expect(bar).toBeVisible();
      expect((await rect(bar)).width).toBeGreaterThanOrEqual(400);
      // The tray holds the three sentences; the stage only the picture they describe.
      await expect(page.locator('.ms-tray .ms-choice')).toHaveCount(3);
    }
  });

  test('small phone: the chapter squares come back when the tray leaves, and fold again on the next check', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await open(page, '/en/topics/decimals/?ch=hundredths');
    await force(page, 'hundredths', 2);
    await expect(page.locator('.ms-tray-dock .ms-tray')).toBeVisible();
    await expect(page.locator('.atlas-rail')).toBeHidden();
    // The chapter bar still reaches every chapter: back to the tenths, on its first beat (no check).
    await page.locator('.atlas-axis__btn[data-chapter="tenths"]').click();
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().chapter)).toBe('tenths');
    await expect(page.locator('.ms-tray-dock .ms-tray')).toBeHidden();
    await expect(page.locator('.atlas-rail__item').first()).toBeVisible();
    expect((await rect(page.locator('.atlas-rail__item').first())).height).toBeGreaterThanOrEqual(44);
    // The stage is measured again: the model starts under the squares.
    const squares = await rect(page.locator('.atlas-rail'));
    await expect.poll(async () => (await rect(page.locator('.ms-svg .ms-beat'))).y).toBeGreaterThanOrEqual(squares.y + squares.height);
    await force(page, 'tenths', 0);
    await expect(page.locator('.ms-tray-dock .ms-tray')).toBeVisible();
    await expect(page.locator('.atlas-rail')).toBeHidden();
  });

  test('tall phone: the chapter squares stay with the tray docked', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/decimals/?ch=hundredths');
    await force(page, 'hundredths', 2);
    await expect(page.locator('.ms-tray-dock .ms-tray')).toBeVisible();
    await expect(page.locator('.atlas-rail__item').first()).toBeVisible();
  });

  // Before, the bus ride's timeline went the moment the child jumped a whole hour (the jumps' labels outgrew the stage); now it
  // keeps the room for the solving jumps from the start.
  test('tall phone: the chapter squares stay and the bus ride keeps its timeline through the jumps', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/en/topics/telling-time/?ch=timetables');
    await force(page, 'timetables', 1);
    await expect.poll(() => taskId(page)).toBe('tt-bus-ride');
    await expect(page.locator('.ms-tray-dock .ms-keypad')).toBeVisible();
    await expect(page.locator('.atlas-rail__item').first()).toBeVisible();
    for (const by of [600, 3600, 300]) {
      await page.locator(`.ms-tray [data-hop="${by}"]`).click();
      await drawnAbove(page);
    }
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

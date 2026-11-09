import { expect, test, type Page } from '@playwright/test';

/** Leader labels (docs/08): portrait presentations keep theirs, every placard is backed, readouts stay clear. */

async function openTopic(page: Page, topic: string, query = '') {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('atlas:guide-seen', '1');
    } catch {
      /* blocked storage */
    }
  });
  await page.goto(`/en/topics/${topic}/${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 45_000 });
  await page.evaluate(() => window.__atlas!.ready);
}

async function goToBeat(page: Page, chapter: string, index: number) {
  const n = await page.evaluate(([c, i]) => window.__atlas!.beats().findIndex((b) => b.chapter === c && b.index === i), [chapter, index] as const);
  expect(n).toBeGreaterThanOrEqual(0);
  await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), n);
}

const shownLabels = (page: Page) =>
  page.evaluate(() => [...document.querySelectorAll<SVGElement>('.space-co[data-id]')].filter((e) => Number(e.style.opacity || 0) > 0.85).map((e) => e.dataset.id!));

const expectLabels = (page: Page) => expect.poll(async () => (await shownLabels(page)).length, { timeout: 20_000 }).toBeGreaterThan(0);

test('a wide presentation title does not take the labels away in portrait', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await openTopic(page, 'energy-conversion');
  await goToBeat(page, 'before-you-start', 0);
  await expectLabels(page);
});

test('every placard has its plate, in cinema too', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openTopic(page, 'mosquito');
  await page.evaluate(() => window.__atlas!.setTheme('cinema'));
  await goToBeat(page, 'the-adult', 0);
  await expectLabels(page);
  const plates = await page.evaluate(() =>
    [...document.querySelectorAll<SVGElement>('.space-co[data-id]')]
      .filter((e) => Number(e.style.opacity || 0) > 0.85)
      .map((e) => Number(getComputedStyle(e.querySelector('.space-co__plate')!).opacity)),
  );
  expect(plates.length).toBeGreaterThan(0);
  for (const opacity of plates) expect(opacity).toBeGreaterThan(0.8);
});

test('placards keep off the energy-bars readout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openTopic(page, 'energy-conversion');
  await goToBeat(page, 'stored-energy', 0);
  await expectLabels(page);
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const block = [...document.querySelectorAll<SVGGElement>('.space-ebars [data-bars]')].find((g) => g.style.opacity !== '0');
          if (!block) return -1;
          const b = block.getBoundingClientRect();
          return [...document.querySelectorAll<SVGElement>('.space-co[data-id]')]
            .filter((e) => Number(e.style.opacity || 0) > 0.85)
            .map((e) => e.querySelector('.space-co__text')!.getBoundingClientRect())
            .filter((r) => r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top).length;
        }),
      { timeout: 20_000 },
    )
    .toBe(0);
});

for (const [width, height] of [
  [1024, 768],
  [1440, 900],
] as const) {
  test(`the reading view labels the chapter's parts at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await openTopic(page, 'aircon', '?ch=whole-machine');
    await expectLabels(page);
  });
}

import { expect, type Page } from '@playwright/test';
import { hudTest as test } from './hud-layout';

async function open(page: Page, topic: string, locale = 'en') {
  await page.goto(`/${locale}/topics/${topic}/`);
  await page.waitForFunction(() => window.__atlas?.ready);
  await expect.poll(() => page.evaluate(() => window.__atlas!.state().room !== null)).toBe(true);
}

test.describe('768x1024 left column', () => {
  test.use({ viewport: { width: 768, height: 1024 } });
  test('title and rail sit on a plate; a clipped rail scrolls and shows its cue', async ({ page }) => {
    await open(page, 'muscles-core');
    const plate = await page.evaluate(() => getComputedStyle(document.querySelector('.atlas-rail')!, '::before').backgroundColor);
    expect(plate).not.toBe('rgba(0, 0, 0, 0)');
    const list = page.locator('.atlas-rail__list');
    const m = await list.evaluate((el) => ({ over: el.scrollHeight - el.clientHeight, end: el.hasAttribute('data-more-end') }));
    expect(m.end).toBe(m.over > 2);
    if (m.over > 2) {
      await list.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
      await expect(list).not.toHaveAttribute('data-more-end', '');
      await expect(list).toHaveAttribute('data-more-start', '');
    }
  });
});

test('Chinese map labels lead with Chinese', async ({ page }) => {
  await open(page, 'ww2', 'zh');
  const placard = page.locator('.ts-co__en:visible').first();
  await expect(placard).toHaveAttribute('lang', 'zh-Hans');
  await expect(page.locator('.ts-terr__en:visible').first()).toHaveAttribute('lang', 'zh-Hans');
});

test.describe('390x844 presentation', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('a long caption is reachable to its last line, and the cue goes when it is', async ({ page }) => {
    await open(page, 'ww2');
    await page.evaluate(() => {
      const a = window.__atlas!;
      const beats = a.beats();
      let best = 0;
      beats.forEach((b, i) => {
        if (b.caption.en.length > beats[best]!.caption.en.length) best = i;
      });
      a.goToBeat(best, { instant: true });
    });
    const caption = page.locator('.atlas-present__caption');
    await expect(caption).toHaveAttribute('data-more-end', '');
    const more = page.locator('.atlas-present__more');
    await expect(more).toBeVisible();
    for (let i = 0; i < 12 && (await more.isVisible()); i++) {
      await more.click();
      await page.waitForTimeout(450);
    }
    await expect(more).toBeHidden();
    const left = await caption.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop);
    expect(left).toBeLessThanOrEqual(2);
    expect(await page.evaluate(() => window.__atlas!.state().presentation)).not.toBeNull();
  });
  test('the title has a backplate and the restore control stays clear of the card', async ({ page }) => {
    await open(page, 'aircon');
    await page.evaluate(() => window.__atlas!.goToBeat(1, { instant: true }));
    const title = page.locator('.atlas-present__title');
    await expect(title).toBeVisible();
    expect(await title.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
    const restore = await page.locator('.atlas-hud-restore').boundingBox();
    const card = await page.locator('.atlas-present__foot').boundingBox();
    expect(restore!.y + restore!.height).toBeLessThanOrEqual(card!.y);
    await expect(page.locator('.atlas-hud-restore kbd')).toBeHidden();
  });
  test('the chip row brings the current chapter into view', async ({ page }) => {
    await open(page, 'ww2');
    await page.evaluate(() => {
      const a = window.__atlas!;
      const beats = a.beats();
      a.goToChapter(beats[beats.length - 1]!.chapter, { instant: true });
    });
    await expect
      .poll(() =>
        page.evaluate(() => {
          const list = document.querySelector('.atlas-rail__list')!.getBoundingClientRect();
          const chip = document.querySelector('.atlas-rail__list [aria-current="step"]')!.getBoundingClientRect();
          return chip.left >= list.left - 1 && chip.right <= list.right + 1;
        }),
      )
      .toBe(true);
  });
});

test.describe('tick targets', () => {
  test.use({ viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: true });
  test('axis ticks are 44 px tall, and a tap below the track still lands on the tick', async ({ page }) => {
    await open(page, 'aircon');
    const box = (await page.locator('.atlas-axis__tick').first().boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x!, y!)?.className ?? '', [box.x + box.width / 2, box.y + 34]);
    expect(String(hit)).toContain('atlas-axis__tick');
  });
});

test.describe('active language first', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('zh: the big title and the PLATE rows are in Chinese', async ({ page }) => {
    await open(page, 'aircon', 'zh');
    await expect(page.locator('.atlas-title__h')).toHaveAttribute('lang', 'zh-Hans');
    const row = page.locator('.space-plate__row dt').first();
    if (await row.isVisible()) expect(await row.textContent()).toMatch(/[一-鿿]/);
  });
  test('a topic with no syllabus links has no such row', async ({ page }) => {
    await open(page, 'ww2');
    await expect(page.locator('.atlas-spec__row dt', { hasText: 'Syllabus links' })).toHaveCount(0);
  });
});

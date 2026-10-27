import { expect, test, type Page } from '@playwright/test';

/** docs/59, draft: sourced port points, camera changes, and no invented ship tracks. */
const chapters = [
  'background', 'setting-sail', 'straits-and-force', 'melaka-and-sri-lanka',
  'hormuz-and-gifts', 'east-african-ports', 'returning-envoys', 'last-voyage-and-evidence',
];
const highlights: string[][][] = [
  [['site-temasek-region'], ['site-melaka'], ['site-calicut', 'site-kochi'], ['site-kilwa'], []],
  [['evt-first-voyage'], ['site-nanjing'], ['site-fuzhou'], ['evt-first-voyage'], []],
  [['site-calicut', 'site-kochi'], ['evt-old-port-1407'], ['evt-old-port-1407'], ['evt-java-report-1407'], ['evt-second-voyage']],
  [['site-melaka'], ['site-melaka'], ['site-galle'], ['evt-captives-1411'], []],
  [['evt-fourth-voyage'], ['site-hormuz'], ['site-calicut'], ['site-bengal-region'], ['evt-samudera-1415']],
  [['evt-fifth-voyage'], ['site-aden'], ['site-mogadishu', 'site-malindi'], ['site-kilwa'], ['site-kilwa']],
  [['evt-sixth-voyage'], ['site-melaka'], [], ['site-nanjing'], []],
  [['evt-seventh-voyage'], ['site-hormuz'], ['evt-final-return'], ['site-temasek-region'], ['site-melaka']],
];

async function open(
  page: Page, query = '', locale = 'en', viewport = { width: 1920, height: 1080 },
) {
  await page.setViewportSize(viewport);
  await page.goto(`/${locale}/topics/zheng-he/?${query}`);
  expect(await page.evaluate(async () => {
    for (let i = 0; i < 200 && !window.__atlas; i++) await new Promise((resolve) => setTimeout(resolve, 50));
    return window.__atlas?.ready;
  })).toBe(true);
  await expect(page.locator('.ts-geo')).toHaveAttribute('data-status', 'ready', { timeout: 30_000 });
}

const body = (page: Page, chapter: string) => page.locator(`[data-chapter-body="${chapter}"]`);

async function chapter(page: Page, id: string) {
  await page.evaluate((id) => window.__atlas!.goToChapter(id, { instant: true }), id);
  await expect.poll(() => page.evaluate(() => window.__atlas!.state().chapter)).toBe(id);
}

test('eight chapters and forty beats: each expected highlighted point has a visible label', async ({ page }) => {
  test.setTimeout(180_000); // Forty camera changes with software WebGL in CI.
  const errors: string[] = [], external: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/^https?:/.test(request.url()) && !/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(request.url())) external.push(request.url());
  });
  await open(page);
  expect(await page.evaluate(() => window.__atlas!.chapters())).toEqual(chapters);
  const beats = await page.evaluate(() => window.__atlas!.beats());
  expect(beats).toHaveLength(40);
  for (const id of chapters) expect(beats.filter((beat) => beat.chapter === id)).toHaveLength(5);
  // Background is readable but does not become an extra numbered axis segment.
  await expect(page.locator('.ts-seg')).toHaveCount(7);
  await expect(page.locator('.ts-seg__tick')).toHaveCount(35);
  for (let i = 0; i < beats.length; i++) {
    const beat = beats[i]!;
    const expected = highlights[chapters.indexOf(beat.chapter)]![beat.index]!;
    await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), i);
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().presentation))
      .toMatchObject({ chapter: beat.chapter, beat: beat.index, autoplay: false });
    await expect.poll(() => page.evaluate(() => (window.__atlas!.state() as unknown as { highlight: string[] }).highlight)).toEqual(expected);
    for (const id of expected) await expect(page.locator(`.ts-co[data-id="${id}"]`), `${beat.chapter} beat ${beat.index + 1}: ${id}`).toBeVisible();
    await expect(page.locator('.ts-arrowhead')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('built runtime data keeps movements and political control empty and distinguishes context sites', async ({ request }) => {
  const response = await request.get('/topics/zheng-he/data.json');
  expect(response.ok()).toBe(true);
  const data = await response.json();
  // The runtime stats do not expose movement counts; inspect the actual bundled payload.
  expect(data.movements).toEqual([]);
  expect(data.control.keyframes).toHaveLength(9);
  for (const frame of data.control.keyframes) expect(frame.features.features).toEqual([]);
  expect(data.events).toHaveLength(30);
  expect(data.events.filter((event: { kind: string }) => event.kind === 'site')).toHaveLength(17);
  expect(data.events.find((event: { id: string }) => event.id === 'site-kilwa').summary.en).toMatch(/not.*confirmed|not.*landing|not.*visit/i);
  expect(data.glossary.terms).toHaveLength(15);
  expect(data.sources.sources).toHaveLength(30);
});

test('Chinese: deaths remain attributed reports and the S2 source opens with its label', async ({ page }) => {
  await open(page, 'ch=straits-and-force', 'zh');
  const text = body(page, 'straits-and-force');
  await expect(text).toContainText('明方记录报告');
  await expect(text).toContainText('没有独立核实');
  await expect(text).toContainText('未知不能填成零');
  await expect(text.locator('.atlas-num').nth(0)).toContainText('5,000');
  await expect(text.locator('.atlas-num').nth(1)).toContainText('170');
  const source = text.locator('.atlas-num [data-source="S2"]').first();
  await expect(source).toHaveText('S2');
  await source.click();
  await expect(page.locator('.atlas-source-pop')).toBeVisible();
  await expect(page.locator('.atlas-source-pop__head')).toContainText('S2');
  await expect(page.locator('.atlas-source-pop__text')).toContainText('Geoff Wade');
  await expect(page.locator('.atlas-source-pop__url')).toHaveAttribute('href', 'https://ari.nus.edu.sg/wp-content/uploads/2018/10/wps04_031.pdf');
  await page.keyboard.press('Escape');
  await expect(page.locator('.atlas-source-pop')).toHaveCount(0);
  await chapter(page, 'hormuz-and-gifts');
  await expect(body(page, 'hormuz-and-gifts')).toContainText('并把他带到中国');
  await expect(body(page, 'hormuz-and-gifts')).toContainText('记载互有矛盾');
});

test('the two inline illustrations load and the monsoon term opens its explanation', async ({ page }) => {
  await open(page, 'ch=hormuz-and-gifts');
  for (const [id, file, caption] of [
    ['hormuz-and-gifts', 'zheng-he-giraffe', 'not a reconstruction of the individual'],
    ['east-african-ports', 'zheng-he-trade-goods', 'not an excavated assemblage'],
  ]) {
    await chapter(page, id!);
    const figure = body(page, id!).locator('.atlas-figure');
    await expect(figure).toHaveCount(1);
    await expect(figure).toContainText(caption!);
    const image = figure.locator('img');
    await expect(image).toHaveAttribute('src', `/illustrations/figures/${file}.webp`);
    await expect(image).toHaveAttribute('alt', /\S+/);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)).toBe(true);
  }
  await chapter(page, 'returning-envoys');
  await body(page, 'returning-envoys').locator('[data-term="term-monsoon"]').click();
  await expect(page.locator('[data-glossary="term-monsoon"]')).toBeVisible();
  await expect(page.locator('.atlas-gloss__def')).toContainText('seasonal change in wind circulation');
});

for (const theme of ['paper', 'cinema'] as const) {
  test(`${theme}: the port plate and readable final chapter remain available`, async ({ page }) => {
    await open(page, `ch=last-voyage-and-evidence&theme=${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('.ts-co[data-id="evt-seventh-voyage"]')).toBeVisible();
    await expect(body(page, 'last-voyage-and-evidence')).toContainText('circumstances and location of his death remain uncertain');
    await expect(body(page, 'last-voyage-and-evidence').locator('a[href*="ancient-civilisations"]')).toHaveCount(2);
    await expect(body(page, 'last-voyage-and-evidence').locator('a[href*="singapore-1819-1965"]')).toHaveCount(1);
  });
}

test('Chinese cinema at 390 × 844: chapter navigation and no horizontal page overflow', async ({ page }) => {
  await open(page, 'ch=setting-sail&theme=cinema', 'zh', { width: 390, height: 844 });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cinema');
  await page.locator('.ts-seg__btn').nth(1).click();
  await expect.poll(() => page.evaluate(() => window.__atlas!.state().chapter)).toBe('straits-and-force');
  await expect(page.locator('.ts-seg[data-state="current"] .ts-seg__no')).toHaveText('02');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: '阅读', exact: true }).click();
  await expect(page.locator('[data-hud-panel="reader"]')).toBeVisible();
  await expect(body(page, 'straits-and-force')).toContainText('没有独立核实');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

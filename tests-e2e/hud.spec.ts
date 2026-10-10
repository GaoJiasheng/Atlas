import { expect, test, type Page } from '@playwright/test';
import { hudLayoutIssues, LAYOUT_SIZES } from './hud-layout';

const TOPICS = ['sample-time', 'sample-space'] as const;

async function openScene(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}

for (const topic of TOPICS) {
  for (const locale of ['en', 'zh'] as const) {
    test(`${topic} (${locale}): HUD layout has no overlap or overflow at 6 sizes`, async ({ page }) => {
      test.setTimeout(120_000);
      await openScene(page, `/${locale}/topics/${topic}/`);
      const problems: string[] = [];
      for (const [width, height] of LAYOUT_SIZES) {
        await page.setViewportSize({ width, height });
        await page.waitForTimeout(400);
        for (const chapter of await page.evaluate(() => window.__atlas!.chapters())) {
          await page.evaluate((id) => window.__atlas!.goToChapter(id, { instant: true }), chapter);
          await page.waitForTimeout(150);
          for (const issue of await hudLayoutIssues(page)) problems.push(`${width}x${height} ${chapter}: ${issue}`);
        }
      }
      expect(problems).toEqual([]);
    });
  }

  test(`${topic}: the VIEW row wraps (no menu, no MODE group); every mode button is in the control panel`, async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 1200 });
    await openScene(page, `/en/topics/${topic}/`);
    const ids = await page.evaluate(() => window.__atlas!.presets());
    expect(ids.length).toBeGreaterThan(1);
    for (const id of ids) await expect(page.locator(`[data-preset="${id}"]`)).toBeVisible();
    await expect(page.locator('.hud-viewmenu')).toHaveCount(0);
    await expect(page.locator('.atlas-topbar [data-mode]')).toHaveCount(0);
    for (const mode of await page.evaluate(() => window.__atlas!.modes()))
      await expect(page.locator(`[data-hud-panel="overlay"] [data-mode="${mode}"]`)).toHaveCount(1);
    if (topic === 'sample-time') {
      // Geographic presets only: chapters are reached through the rail, the rule and ← →.
      const chapters = await page.evaluate(() => window.__atlas!.chapters());
      expect(ids.slice(0, 2)).toEqual(['world', 'theatre']);
      expect(ids.filter((id) => chapters.includes(id))).toEqual([]);
    }
    await page.locator(`[data-preset="${ids[1]}"]`).click();
    await expect.poll(async () => (await page.evaluate(() => window.__atlas!.state())).preset).toBe(ids[1]);
  });

  test(`${topic}: keys and HUD buttons share one state (window.__atlas)`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await openScene(page, `/en/topics/${topic}/`);
    const api = () => page.evaluate(() => window.__atlas!.state());
    const keymap = await page.evaluate(() => window.__atlas!.keymap());

    // Modes: each key flips the mode and its button's pressed state, twice.
    for (const binding of keymap.filter((k) => k.type === 'mode')) {
      const button = page.locator(`[data-mode="${binding.name}"]`);
      const before = (await api()).modes[binding.name];
      await page.keyboard.press(binding.key);
      await expect.poll(async () => (await api()).modes[binding.name]).toBe(!before);
      await expect(button).toHaveAttribute('aria-pressed', String(!before));
      await page.keyboard.press(binding.key);
      await expect.poll(async () => (await api()).modes[binding.name]).toBe(before);
    }

    // Presets: digit keys select the preset and its button.
    for (const binding of keymap.filter((k) => k.type === 'preset').reverse()) {
      await page.keyboard.press(binding.key);
      await expect.poll(async () => (await api()).preset).toBe(binding.name);
      await expect(page.locator(`[data-preset="${binding.name}"]`)).toHaveAttribute('aria-pressed', 'true');
    }

    // SPACE toggles pause where the scene has something to pause (TimeScene has no free-running playback); H hides the HUD and ESC brings it back.
    const paused = (await api()).paused;
    if (paused !== null) {
      await page.keyboard.press(' ');
      await expect.poll(async () => (await api()).paused).toBe(!paused);
      await page.keyboard.press(' ');
      await expect.poll(async () => (await api()).paused).toBe(paused);
    } else {
      expect(keymap.some((k) => k.type === 'pause')).toBe(false);
      expect(await page.evaluate(() => window.__atlas!.setPaused(true))).toBe(false);
    }

    await page.keyboard.press('h');
    await expect.poll(async () => (await api()).hud).toBe(false);
    await expect(page.locator('.atlas-topbar')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await api()).hud).toBe(true);
    await expect(page.locator('.atlas-topbar')).toBeVisible();

    // The test API drives the same state.
    await page.evaluate(() => window.__atlas!.setHud(false));
    await expect(page.locator('.atlas-hud-restore')).toBeVisible();
    await page.locator('.atlas-hud-restore').click();
    await expect.poll(async () => (await api()).hud).toBe(true);
    await page.evaluate(() => window.__atlas!.setTheme('cinema'));
    await expect.poll(async () => (await api()).appliedTheme).toBe('cinema');
    const stats = await page.evaluate(() => window.__atlas!.stats());
    expect(stats.buffer[0]).toBeGreaterThan(0);
  });
}

test('reading panel: collapse is sticky (survives a reload and chapter changes, which only flash the strip); handle and strip toggle it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openScene(page, '/en/topics/sample-time/');
  const reader = page.locator('[data-hud-panel="reader"]');
  const stage = page.locator('.atlas-stage');
  const width = async (l: typeof reader) => (await l.boundingBox())?.width ?? 0;
  const api = () => page.evaluate(() => window.__atlas!.state());
  const stageWide = await width(stage);
  await page.locator('.atlas-reader__handle').click();
  await expect.poll(() => width(reader)).toBeLessThanOrEqual(29);
  await expect.poll(() => width(stage)).toBeGreaterThan(stageWide + 300);
  await expect.poll(async () => (await api()).reader).toBe(false);
  expect(await page.evaluate(() => sessionStorage.getItem('atlas:reader'))).toBe('collapsed');
  await page.waitForTimeout(400);
  expect(page.url()).not.toContain('reader');

  await page.reload();
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(() => width(reader)).toBeLessThanOrEqual(29);

  // A rail row, a timeline node and ← → each change the chapter, never the fold; the strip flashes (two pulses, ~900 ms).
  // Counted by a MutationObserver (a 900 ms window is easy to miss when polling under software GL).
  await page.evaluate(() => {
    const el = document.querySelector('.atlas-reader')!;
    const w = window as unknown as { __flashes: number };
    w.__flashes = 0;
    new MutationObserver((records) => {
      for (const r of records) if (r.oldValue === null && el.hasAttribute('data-flash')) w.__flashes++;
    }).observe(el, { attributes: true, attributeFilter: ['data-flash'], attributeOldValue: true });
  });
  const flashes = () => page.evaluate(() => (window as unknown as { __flashes: number }).__flashes);
  const flashing = page.locator('.atlas-reader[data-flash]');
  await expect(flashing).toHaveCount(0);
  await page.locator('.atlas-rail__item').nth(1).click();
  await expect.poll(async () => (await api()).chapter).toBe('second-look');
  await expect.poll(flashes).toBe(1);
  await expect(page.locator('.atlas-reader__strip')).toBeVisible();
  // Two pulses of the signal outline on the strip (the handle is hidden while folded).
  const animation = await page.locator('.atlas-reader__strip').evaluate((el) => {
    const a = el.getAnimations().find((x) => (x as CSSAnimation).animationName === 'atlas-reader-flash') as CSSAnimation | undefined;
    return a ? { iterations: a.effect?.getTiming().iterations, duration: a.effect?.getTiming().duration } : null;
  });
  if (animation) expect(animation).toEqual({ iterations: 2, duration: 450 });
  await expect(flashing).toHaveCount(0, { timeout: 3000 });
  expect(await width(reader)).toBeLessThanOrEqual(29);
  expect((await api()).reader).toBe(false);

  await page.locator('.ts-rule__node').nth(2).click();
  await expect.poll(async () => (await api()).chapter).toBe('third-look');
  await expect.poll(flashes).toBe(2);
  await expect(flashing).toHaveCount(0, { timeout: 3000 });
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => (await api()).chapter).toBe('second-look');
  await expect.poll(flashes).toBe(3);
  expect(await width(reader)).toBeLessThanOrEqual(29);
  expect((await api()).reader).toBe(false);
  expect(await page.evaluate(() => sessionStorage.getItem('atlas:reader'))).toBe('collapsed');
  await expect(flashing).toHaveCount(0, { timeout: 3000 });

  // Only the strip (or the handle) opens it.
  await page.locator('.atlas-reader__strip').click();
  await expect.poll(() => width(reader)).toBeGreaterThan(300);
  expect(await flashes()).toBe(3);
  await page.locator('.atlas-reader__handle').click();
  await expect.poll(() => width(reader)).toBeLessThanOrEqual(29);
  await page.locator('.atlas-reader__strip').click();
  await expect.poll(() => width(reader)).toBeGreaterThan(300);
  // An open reader does not flash on a chapter change.
  await page.locator('.atlas-rail__item').nth(2).click();
  await expect.poll(async () => (await api()).chapter).toBe('third-look');
  await page.waitForTimeout(300);
  expect(await flashes()).toBe(3);
  // The header carries the chapter summary sentence (sample: its question).
  await expect(page.locator('.atlas-panel__summary')).toHaveText(/Sample question/);
});

test('chapter auto-run: the playhead runs from the span start to the chapter time and lands exactly; the playhead drags, nudges and jumps; any touch cancels the run', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openScene(page, '/en/topics/sample-time/?ch=first-look');
  const api = () => page.evaluate(() => window.__atlas!.state());
  const running = async () => (await api()).running;
  const head = async () => (await api()).playhead!;
  const grab = page.locator('.ts-rule__grab');
  const readout = page.locator('.ts-rule__date');
  await expect.poll(running).toBe(false);
  const p1 = await head(); // first-look rests on its own time

  // Rail row: second-look runs from the previous chapter's time (= p1) to its own. Status line says RUNNING meanwhile.
  await page.locator('.atlas-rail__item').nth(1).click();
  await expect.poll(running, { timeout: 2000 }).toBe(true);
  const early = await head();
  expect(early).toBeGreaterThanOrEqual(p1);
  await expect(page.locator('.atlas-topbar')).toContainText('RUNNING');
  await expect.poll(async () => (await api()).chapter).toBe('second-look');
  await expect.poll(running, { timeout: 10_000 }).toBe(false);
  const p2 = await head();
  expect(p2).toBeGreaterThan(p1);
  expect(early).toBeLessThan(p1 + (p2 - p1) * 0.3);
  await expect(readout).toHaveText(/11 MAR 2000/);
  await expect(page.locator('.atlas-topbar')).not.toContainText('RUNNING');
  expect(page.url()).not.toContain('t='); // the chapter time is the chapter's own baseline, so the URL carries none

  // A second click on the same chapter re-runs it, and ends on exactly the same time.
  await page.locator('.atlas-rail__item').nth(1).click();
  await expect.poll(running, { timeout: 2000 }).toBe(true);
  expect(await head()).toBeLessThan(p2);
  await expect.poll(running, { timeout: 10_000 }).toBe(false);
  expect(await head()).toBe(p2);

  // Timeline node, then the programmatic API, run the same way.
  await page.locator('.ts-rule__node').nth(2).click();
  await expect.poll(running, { timeout: 2000 }).toBe(true);
  await expect.poll(running, { timeout: 10_000 }).toBe(false);
  const p3 = await head();
  expect(p3).toBeGreaterThan(p2);
  await page.evaluate(() => window.__atlas!.runChapter('second-look'));
  await expect.poll(running, { timeout: 2000 }).toBe(true);
  await expect.poll(running, { timeout: 10_000 }).toBe(false);
  expect(await head()).toBe(p2);

  // Dragging the playhead mid-run cancels it, and releasing leaves t where it is.
  await page.locator('.atlas-rail__item').nth(2).click();
  await expect.poll(running, { timeout: 2000 }).toBe(true);
  await page.waitForTimeout(1500);
  const box = (await grab.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 40, cy, { steps: 4 });
  expect(await running()).toBe(false);
  await page.mouse.move(cx - 90, cy, { steps: 8 });
  await page.mouse.up();
  const dropped = await head();
  expect(dropped).toBeLessThan(p3);
  expect(dropped).toBeGreaterThan(p1);
  await page.waitForTimeout(900);
  expect(await head()).toBe(dropped);
  expect(await running()).toBe(false);
  await expect.poll(() => page.url()).toContain('t=2000-0'); // a scrubbed time is written back

  // Keyboard on the focused playhead: Home / End jump to the chapter's span ends, arrows nudge one tick.
  await grab.focus();
  await page.keyboard.press('Home');
  expect(await head()).toBe(p2);
  await page.keyboard.press('End');
  expect(await head()).toBe(p3);
  await page.keyboard.press('ArrowLeft');
  const nudged = await head();
  expect(nudged).toBeLessThan(p3);
  await page.keyboard.press('ArrowRight');
  expect(await head()).toBeGreaterThan(nudged);
  expect((await api()).chapter).toBe('third-look'); // arrows on the playhead never change chapter

  // Clicking the rule scrubs too (and cancels), and Shift+← cancels a run started by ← →.
  await page.keyboard.press('Home');
  await page.locator('.atlas-rail__item').nth(1).click();
  await expect.poll(running, { timeout: 2000 }).toBe(true);
  await page.keyboard.press('Shift+ArrowRight');
  expect(await running()).toBe(false);
  await page.locator('.atlas-rail__item').nth(2).click();
  await expect.poll(running, { timeout: 2000 }).toBe(true);
  const rail = (await page.locator('.ts-rule__rail').boundingBox())!;
  await page.mouse.click(rail.x + rail.width * 0.15, rail.y + 8);
  expect(await running()).toBe(false);
  expect(await head()).toBeLessThan(p2);
});

test('timeline: chapter nodes at least 56 px apart, one bottom bar with the state cluster, lanes on demand', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/en/topics/sample-time/');
  await expect(page.locator('[data-hud-panel^="panel0"]')).toHaveCount(0);
  const alpha = Number(await page.locator('.ts-rule__rail').getAttribute('data-alpha'));
  expect(alpha).toBeGreaterThanOrEqual(0);
  expect(alpha).toBeLessThanOrEqual(1);
  const xs = await page.locator('.ts-rule__nodes > li').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().left + e.getBoundingClientRect().width / 2));
  const sorted = [...xs].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) expect(sorted[i]! - sorted[i - 1]!).toBeGreaterThanOrEqual(55.5);
  await expect(page.locator('.ts-state [data-stat]')).toHaveCount(4);
  // No free-running playback: the bar's only button besides the lanes chevron is PRESENT (= the presentation mode).
  await expect(page.locator('.ts-timeline__play, .ts-timeline__speed')).toHaveCount(0);
  const present = page.locator('.ts-timeline__present');
  await expect(present).toHaveText(/present/i);
  await expect(present).toHaveAttribute('aria-pressed', 'false');
  await present.click();
  await expect.poll(async () => (await page.evaluate(() => window.__atlas!.state())).modes.presentation).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await page.evaluate(() => window.__atlas!.state())).modes.presentation).toBe(false);
  await expect(present).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.ts-lanes')).toHaveCount(0);
  await page.locator('.ts-timeline__lanes').click();
  await expect(page.locator('.ts-lanes svg')).toBeVisible();
});

test('participation card: expands in place, a row selects its entity (map + inspector), ESC folds it', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/en/topics/sample-time/');
  const card = page.locator('[data-hud-panel="card"]');
  await expect(card).toHaveAttribute('data-expanded', 'false');
  await page.locator('.atlas-card__toggle').click();
  await expect(card).toHaveAttribute('data-expanded', 'true');
  const rows = page.locator('.ts-card__row[data-entity]');
  await expect(rows).toHaveCount(3);
  const id = await rows.first().getAttribute('data-entity');
  await rows.first().click();
  await expect.poll(async () => (await page.evaluate(() => window.__atlas!.state() as unknown as { highlight: string[] })).highlight).toEqual([id]);
  await expect(page.locator('.ts-entity')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(card).toHaveAttribute('data-expanded', 'false');
  await expect(page.locator('.ts-entity')).toHaveCount(0);
});

test('PRESENTATION: user-paced beats (keys, dots, click), no auto-advance, ESC and P restore the scene', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/en/topics/sample-time/?ch=first-look');
  const api = () => page.evaluate(() => window.__atlas!.state());
  const beats = await page.evaluate(() => window.__atlas!.beats());
  expect(beats.map((b) => b.chapter)).toEqual(['first-look', 'second-look', 'third-look']);
  const before = await api();

  await page.keyboard.press('p');
  await expect.poll(async () => (await api()).modes.presentation).toBe(true);
  expect((await api()).hud).toBe(false);
  await expect(page.locator('.atlas-present__caption')).toHaveText(/who holds which area/);
  // One segment per chapter (all three have a single beat, so nothing is subdivided); the current one is lit.
  await expect(page.locator('.atlas-present__seg')).toHaveCount(3);
  await expect(page.locator('.atlas-present__tick')).toHaveCount(0);
  await expect(page.locator('.atlas-present__seg[data-state="current"] .atlas-present__no')).toHaveText('01');
  expect((await api()).presentation).toEqual({ chapter: 'first-look', beat: 0, autoplay: false, voice: false });

  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await api()).chapter).toBe('second-look');
  await page.waitForTimeout(2500);
  expect((await api()).chapter).toBe('second-look');
  await page.locator('.atlas-present__chap').nth(2).click();
  await expect.poll(async () => (await api()).chapter).toBe('third-look');
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => (await api()).chapter).toBe('second-look');
  await page.mouse.click(960, 400);
  await expect.poll(async () => (await api()).chapter).toBe('third-look');

  await page.keyboard.press('Escape');
  await expect.poll(async () => (await api()).modes.presentation).toBe(false);
  expect((await api()).hud).toBe(true);
  expect((await api()).presentation).toBeNull();
  await expect.poll(async () => (await api()).chapter).toBe(before.chapter);
  const timeOf = (s: object) => (s as { t?: unknown }).t;
  expect(timeOf(await api())).toEqual(timeOf(before));

  await page.evaluate(() => window.__atlas!.goToBeat(1, { instant: true }));
  await expect.poll(async () => (await api()).modes.presentation).toBe(true);
  await expect.poll(async () => (await api()).chapter).toBe('second-look');
  await page.keyboard.press('p');
  await expect.poll(async () => (await api()).modes.presentation).toBe(false);
  await expect.poll(async () => (await api()).chapter).toBe('first-look');
});

test('PRESENTATION progress bar: chapter segments, beat ticks, header, jumps, beat labels, scrolling caption', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await openScene(page, '/en/topics/ww2/?ch=fall-of-singapore');
  const api = () => page.evaluate(() => window.__atlas!.state());
  const beats = await page.evaluate(() => window.__atlas!.beats());
  const chapters = await page.evaluate(() => window.__atlas!.chapters());
  const own = beats.filter((b) => b.chapter === 'fall-of-singapore');
  expect(own.length).toBeGreaterThan(1);
  expect(own.map((b) => b.index)).toEqual(own.map((_, i) => i));
  expect(own.every((b) => b.caption.en.length > 0)).toBe(true);
  expect((await api()).presentation).toBeNull();

  // Chapter 07, second beat (instant); `goToBeat` enters the presentation.
  const at = beats.findIndex((b) => b.chapter === 'fall-of-singapore');
  await page.evaluate((i) => window.__atlas!.goToBeat(i + 1, { instant: true }), at);
  await expect.poll(async () => (await api()).modes.presentation).toBe(true);
  await expect.poll(async () => (await api()).presentation).toEqual({ chapter: 'fall-of-singapore', beat: 1, autoplay: false, voice: false });

  // Segments: one per chapter, labelled 01..NN, the current one (07) in the signal colour and split into its beats.
  const segs = page.locator('.atlas-present__seg');
  await expect(segs).toHaveCount(chapters.length);
  await expect(page.locator('.atlas-present__no')).toHaveText(chapters.map((_, i) => String(i + 1).padStart(2, '0')));
  const current = page.locator('.atlas-present__seg[data-state="current"]');
  await expect(current.locator('.atlas-present__no')).toHaveText(String(chapters.indexOf('fall-of-singapore') + 1).padStart(2, '0'));
  await expect(current.locator('.atlas-present__tick')).toHaveCount(own.length);
  await expect(current.locator('.atlas-present__tick[data-state="done"]')).toHaveCount(2);
  await expect(page.locator('.atlas-present__seg[data-state="done"]')).toHaveCount(chapters.indexOf('fall-of-singapore'));
  const n = (k: number) => String(k).padStart(2, '0');
  await expect(page.locator('.atlas-present__chapter')).toContainText(`${n(chapters.indexOf('fall-of-singapore') + 1)} / ${n(chapters.length)}`);
  await expect(page.locator('.atlas-present__chapter em')).toHaveText(`2 / ${own.length}`);
  // The progress bar spans the caption card, next to the AUTO-PLAY checkbox (off by default).
  const card = (await page.locator('.atlas-present__foot').boundingBox())!;
  const bar = (await page.locator('.atlas-present__bar').boundingBox())!;
  const auto = (await page.locator('.atlas-present__opts').boundingBox())!;
  expect(bar.width + auto.width).toBeGreaterThan(card.width * 0.85);
  expect(bar.width).toBeLessThanOrEqual(card.width);
  expect(auto.x).toBeGreaterThan(bar.x + bar.width);
  await expect(page.locator('.atlas-present__auto:not(.atlas-present__voice) input')).not.toBeChecked();

  // A beat tick jumps within the chapter; a chapter segment jumps to that chapter's first beat.
  await current.locator('.atlas-present__tick').first().click();
  await expect.poll(async () => (await api()).presentation).toEqual({ chapter: 'fall-of-singapore', beat: 0, autoplay: false, voice: false });
  await segs.nth(0).locator('.atlas-present__chap').click();
  await expect.poll(async () => (await api()).presentation).toEqual({ chapter: chapters[0], beat: 0, autoplay: false, voice: false });

  // Leader labels for the beat's highlighted ids are still on the map with the HUD hidden (cap 6); nothing else.
  await page.evaluate((i) => window.__atlas!.goToBeat(i, { instant: true }), at);
  await expect.poll(async () => (await api()).hud).toBe(false);
  await expect.poll(() => page.locator('.ts-co:not([data-hidden="true"])').count(), { timeout: 8000 }).toBeGreaterThan(0);
  expect(await page.locator('.ts-co').count()).toBeLessThanOrEqual(6);
  expect(await page.locator('.ts-co[data-pinned="false"]').count()).toBe(0);
  await expect(page.locator('.ts-label--place:visible')).toHaveCount(0);
  // Territory names are part of the map: they stay.
  await expect.poll(() => page.locator('.ts-terr').count()).toBeGreaterThan(0);

  // A long caption scrolls inside the card instead of growing it.
  const grown = await page.evaluate(() => {
    const el = document.querySelector('.atlas-present__caption') as HTMLElement;
    el.textContent = 'A long caption that goes on. '.repeat(80);
    const foot = document.querySelector('.atlas-present__foot') as HTMLElement;
    return { scrolls: el.scrollHeight > el.clientHeight, lines: el.clientHeight / Number.parseFloat(getComputedStyle(el).lineHeight), foot: foot.getBoundingClientRect().height };
  });
  expect(grown.scrolls).toBe(true);
  expect(grown.lines).toBeLessThanOrEqual(4.05);
  expect(grown.foot).toBeLessThan(450);

  await page.keyboard.press('Escape');
  await expect.poll(async () => (await api()).presentation).toBeNull();
});

test('LOOK and language are hairline dropdowns in the HUD: menu, Esc, outside click, theme, locale keeps the query', async ({ page }) => {
  await openScene(page, '/en/topics/sample-time/?ch=second-look&t=2000-03-01');
  const look = page.getByRole('button', { name: 'Look' });
  const lang = page.getByRole('button', { name: 'Language' });
  await expect(look).toHaveText(/Look/);
  await expect(lang).toHaveText(/EN/);
  await expect(look).toHaveAttribute('aria-expanded', 'false');

  await look.click();
  await expect(look).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('menuitemradio')).toHaveCount(3);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menuitemradio')).toHaveCount(0);

  await look.click();
  await page.mouse.click(5, 300);
  await expect(page.getByRole('menuitemradio')).toHaveCount(0);

  // Keyboard: Enter opens on the selected item, arrows move, Enter picks.
  await look.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitemradio', { name: 'Auto' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', { name: 'Cinema' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('cinema');
  await expect(look).toBeFocused();
  await look.click();
  await page.getByRole('menuitemradio', { name: 'Paper' }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('paper');

  // Language: path and query string survive the switch.
  await lang.click();
  await expect(page.getByRole('menuitemradio')).toHaveText(['English', '中文']);
  await page.getByRole('menuitemradio', { name: '中文' }).click();
  await page.waitForURL(/\/zh\/topics\/sample-time\/\?.*ch=second-look/);
  expect(page.url()).toContain('t=2000-03-01');
  await expect(page.getByRole('button', { name: '语言' })).toHaveText(/中文/);
});

test('index: LOOK and language dropdowns work with 44 px hit areas', async ({ page }) => {
  await page.goto('/en/?subject=history');
  const look = page.getByRole('button', { name: 'Look' });
  const box = await look.boundingBox();
  expect(box).not.toBeNull();
  const hit = await look.evaluate((el) => {
    const r = getComputedStyle(el, '::after');
    return parseFloat(r.height);
  });
  expect(Math.max(box!.height, hit)).toBeGreaterThanOrEqual(44);
  await look.click();
  await page.getByRole('menuitemradio', { name: 'Cinema' }).click();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('cinema');
  await page.getByRole('button', { name: 'Language' }).click();
  await page.getByRole('menuitemradio', { name: '中文' }).click();
  await page.waitForURL(/\/zh\/\?subject=history/);
  await expect(page.locator('h1')).toHaveText('这个世界值得探索');
});

test('PRESENTATION auto-play: advances by itself after the dwell, input holds it for the beat, remembered for the session', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await openScene(page, '/en/topics/sample-time/?ch=first-look');
  const api = () => page.evaluate(() => window.__atlas!.state());
  await page.evaluate(() => window.__atlas!.goToBeat(0, { instant: true }));
  await expect.poll(async () => (await api()).presentation).toEqual({ chapter: 'first-look', beat: 0, autoplay: false, voice: false });
  // Off: nothing moves on its own.
  await page.waitForTimeout(3000);
  expect((await api()).chapter).toBe('first-look');

  // On (the checkbox): the next beat comes within the dwell (settle 2.3 s + dwell 6–20 s; sample captions are short, so ~6 s).
  await page.locator('.atlas-present__auto:not(.atlas-present__voice) input').check();
  expect((await api()).presentation?.autoplay).toBe(true);
  expect(await page.evaluate(() => sessionStorage.getItem('atlas:autoplay'))).toBe('1');
  const started = Date.now();
  await expect.poll(async () => (await api()).chapter, { timeout: 12_000 }).toBe('second-look');
  expect(Date.now() - started).toBeGreaterThan(5_000);

  // Any input holds it for this beat (the checkbox stays checked).
  await page.keyboard.press('a');
  await page.waitForTimeout(9_000);
  expect((await api()).chapter).toBe('second-look');
  await expect(page.locator('.atlas-present__auto:not(.atlas-present__voice) input')).toBeChecked();

  // The API switch; a reload keeps it for the session.
  expect(await page.evaluate(() => window.__atlas!.setAutoplay(false))).toBe(true);
  await expect.poll(async () => (await api()).presentation?.autoplay).toBe(false);
  await page.evaluate(() => window.__atlas!.setAutoplay(true));
  await page.reload();
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await page.evaluate(() => window.__atlas!.goToBeat(2, { instant: true }));
  await expect.poll(async () => (await api()).presentation?.autoplay).toBe(true);
  // The last beat: auto-play stops there.
  await page.waitForTimeout(9_000);
  expect((await api()).presentation).toEqual({ chapter: 'third-look', beat: 0, autoplay: true, voice: false });
});

test('territory names: on by default, N toggles them (mode `territory`), they follow the keyframes', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await openScene(page, '/en/topics/ww2/?ch=blitzkrieg');
  const api = () => page.evaluate(() => window.__atlas!.state());
  expect(await page.evaluate(() => window.__atlas!.modes())).toContain('territory');
  expect((await api()).modes.territory).toBe(true);
  const names = () => page.locator('.ts-terr[data-text]').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.text));
  await expect.poll(async () => (await names()).length, { timeout: 10_000 }).toBeGreaterThan(2);
  expect((await names()).length).toBeLessThanOrEqual(24);
  expect(await names()).toContain('Germany|德国');
  // EN small caps over Chinese, inside the stage.
  const first = page.locator('.ts-terr[data-text]').first();
  await expect(first.locator('.ts-terr__en')).toBeVisible();
  await expect(first.locator('.ts-terr__zh')).toBeVisible();

  await page.keyboard.press('n');
  await expect.poll(async () => (await api()).modes.territory).toBe(false);
  await expect(page.locator('.ts-terr[data-text]')).toHaveCount(0);
  await page.keyboard.press('n');
  await expect.poll(async () => (await api()).modes.territory).toBe(true);
  await expect.poll(async () => (await names()).length).toBeGreaterThan(2);

  // LABELS (L) hides leader placards, not territory names.
  await page.keyboard.press('l');
  await expect.poll(async () => (await names()).length).toBeGreaterThan(2);
  await page.keyboard.press('l');

  // Another chapter, another keyframe: the names follow who holds what.
  await page.evaluate(() => window.__atlas!.goToChapter('end-and-home', { instant: true }));
  await expect.poll(async () => (await names()).includes('Germany|德国'), { timeout: 10_000 }).toBe(false);
});

/**
 * A fake `speechSynthesis` like Chrome's: `speak` starts an utterance on the next tick (`onstart`), it ends `endMs` later, or 20 ms per character if that is longer (a believable speed; `onend`);
 * `cancel()` fails the one in progress with `error: 'interrupted'`. Every utterance is recorded in `window.__spoken`.
 */
const FAKE_SPEECH = (voices: { name: string; lang: string; localService: boolean }[], endMs = 2000, msPerChar = 20) => `
  class U { constructor(text) { this.text = text; this.lang = ''; this.voice = null; this.rate = 1; this.pitch = 1; this.volume = 1; this.onstart = null; this.onend = null; this.onerror = null; } }
  window.SpeechSynthesisUtterance = U;
  window.__spoken = [];
  let cur = null;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    getVoices: () => ${JSON.stringify(voices)},
    speak(u) {
      cur = u;
      window.__spoken.push({ text: u.text, lang: u.lang, voice: u.voice && u.voice.name, rate: u.rate, pitch: u.pitch, at: performance.now() });
      setTimeout(() => { if (cur === u) { u.onstart && u.onstart({}); u.__t = setTimeout(() => { if (cur === u) { cur = null; u.onend && u.onend({}); } }, Math.max(${endMs}, u.text.length * ${msPerChar})); } }, 0);
    },
    cancel() { if (cur) { const u = cur; cur = null; clearTimeout(u.__t); u.onerror && u.onerror({ error: 'interrupted' }); } },
    pause() {}, resume() {}, speaking: false, addEventListener() {}, removeEventListener() {},
  } });
`;
const FAKE_VOICES = [
  { name: 'Samantha', lang: 'en-US', localService: true },
  { name: 'Daniel', lang: 'en-GB', localService: true },
  { name: 'Meijia', lang: 'zh-TW', localService: true },
  { name: 'Tingting', lang: 'zh-CN', localService: true },
];

for (const [locale, lang, voice] of [['en', 'en-GB', 'Daniel'], ['zh', 'zh-CN', 'Tingting']] as const) {
  test(`PRESENTATION voice (${locale}): speaks exactly the ${locale} caption, auto-play advances only after the utterance ends, a manual jump cancels and restarts`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.addInitScript(FAKE_SPEECH(FAKE_VOICES, 2000));
    await page.setViewportSize({ width: 1920, height: 1080 });
    await openScene(page, `/${locale}/topics/sample-time/?ch=first-look`);
    const api = () => page.evaluate(() => window.__atlas!.state());
    const log = () => page.evaluate(() => window.__atlas!.voiceLog());
    /** The caption utterances only (every sample-time chapter has one beat, so each is announced first: chapter number, title, caption). */
    const captions = async () => (await log()).filter((e) => e.part === 'caption');
    const captionText = async () => (await page.locator('.atlas-present__caption').textContent())!.trim();

    await page.keyboard.press('p');
    await expect.poll(async () => (await api()).modes.presentation).toBe(true);
    expect(await page.evaluate(() => window.__atlas!.setAutoplay(true))).toBe(true);
    const box = page.locator('.atlas-present__voice input');
    await expect(box).toBeEnabled();
    await expect(box).not.toBeChecked();
    expect((await api()).presentation?.voice).toBe(false);
    await box.click();
    await expect(box).toBeChecked();
    await expect.poll(async () => (await api()).presentation?.voice).toBe(true);
    expect(await page.evaluate(() => sessionStorage.getItem('atlas:voice'))).toBe('1');

    // A chapter's first beat: number, title, then the whole caption of the page language (no header, no other language), the page locale's lang, that language's voice.
    const caption1 = await captionText();
    await expect.poll(async () => (await captions()).length, { timeout: 15_000 }).toBe(1);
    expect((await log()).map((e) => e.part)).toEqual(['chapter', 'title', 'caption']);
    expect((await log())[0]!.text).toBe(locale === 'zh' ? '第一章' : 'Chapter one');
    const first = (await captions())[0]!;
    expect(first).toMatchObject({ text: caption1, lang, voice, reason: null });
    expect(first.text).not.toMatch(/^\d{2} \/ \d{2}/);
    if (locale === 'zh') expect(first.text).toMatch(/[\u4e00-\u9fff]/);
    else expect(first.text).not.toMatch(/[\u4e00-\u9fff]/);

    // Nothing advances while it is speaking (2 s long): sampled in one call, so a slow frame cannot blur it.
    await expect.poll(async () => (await captions())[0]!.started).not.toBeNull();
    const mid = await page.evaluate(() => ({ ended: window.__atlas!.voiceLog().filter((e) => e.part === 'caption')[0]!.ended, chapter: window.__atlas!.state().presentation?.chapter }));
    if (mid.ended === null) expect(mid.chapter).toBe('first-look');
    // It ends for real, then (and only then) the presentation moves on and speaks the next chapter's announcement and caption from its start.
    await expect.poll(async () => (await captions())[0]!.reason, { timeout: 5000 }).toBe('end');
    await expect.poll(async () => (await api()).presentation?.chapter, { timeout: 5000 }).toBe('second-look');
    const gap = await page.evaluate(() => {
      const spoken = (window as unknown as { __spoken: { at: number; text: string }[] }).__spoken.filter((u) => u.text.trim() !== '');
      return spoken[3] ? spoken[3].at - window.__atlas!.voiceLog().filter((e) => e.part === 'caption')[0]!.ended! : null;
    });
    if (gap !== null) expect(gap).toBeGreaterThanOrEqual(0);
    const caption2 = await captionText();
    expect(caption2).not.toBe(caption1);
    await expect.poll(async () => (await captions()).length, { timeout: 15_000 }).toBe(2);
    expect((await captions())[1]).toMatchObject({ text: caption2, lang, voice, reason: null });

    // A manual jump cancels the current utterance (no advance from the cancellation) and reads the new beat's caption from the start.
    await expect.poll(async () => (await captions())[1]!.started).not.toBeNull();
    await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => (await api()).presentation?.chapter).toBe('first-look');
    await expect.poll(async () => (await captions())[1]!.reason).toBe('cancelled');
    await expect.poll(async () => (await captions()).length, { timeout: 15_000 }).toBe(3);
    expect((await captions())[2]).toMatchObject({ text: caption1, lang, voice, reason: null });
    await page.waitForTimeout(800);
    expect((await api()).presentation?.chapter).toBe('first-look');

    // Voice off stops it; leaving the presentation cancels.
    expect(await page.evaluate(() => window.__atlas!.setVoice(false))).toBe(true);
    await expect.poll(async () => (await api()).presentation?.voice).toBe(false);
    await expect.poll(async () => (await captions())[2]!.reason).toBe('cancelled');
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await api()).modes.presentation).toBe(false);
  });
}

test('PRESENTATION voice (zh): a chapter\'s first beat speaks number, title, caption; later beats only the caption; a jump cancels the rest', async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(FAKE_SPEECH(FAKE_VOICES, 600));
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/zh/topics/ww2/?ch=fall-of-singapore');
  const api = () => page.evaluate(() => window.__atlas!.state());
  const log = () => page.evaluate(() => window.__atlas!.voiceLog());
  const beats = await page.evaluate(() => window.__atlas!.beats());
  const at = beats.findIndex((b) => b.chapter === 'fall-of-singapore');
  expect(beats.filter((b) => b.chapter === 'fall-of-singapore').length).toBeGreaterThan(2);
  const goTo = (i: number) => page.evaluate((k) => window.__atlas!.goToBeat(k, { instant: true }), i);
  const captionText = async () => (await page.locator('.atlas-present__caption').textContent())!.trim();

  await goTo(at);
  await expect.poll(async () => (await api()).modes.presentation).toBe(true);
  expect(await page.evaluate(() => window.__atlas!.setVoice(true))).toBe(true);
  await expect.poll(async () => (await log()).length, { timeout: 15_000 }).toBe(3);
  const caption1 = await captionText();
  expect((await log()).map((e) => [e.part, e.text])).toEqual([['chapter', '第七章'], ['title', '马来亚与新加坡'], ['caption', caption1]]);
  await expect.poll(async () => (await log())[2]!.reason, { timeout: 5000 }).toBe('end');
  // The parts are ~350 ms apart.
  const [c, t] = await log();
  expect(t!.started! - c!.ended!).toBeGreaterThanOrEqual(300);

  // Beat 2 of the same chapter: the caption only.
  await goTo(at + 1);
  await expect.poll(async () => (await log()).length, { timeout: 15_000 }).toBe(4);
  expect((await log())[3]).toMatchObject({ part: 'caption', text: await captionText() });
  await expect.poll(async () => (await log())[3]!.reason, { timeout: 5000 }).toBe('end');

  // Back to the chapter's first beat, then a jump while the number is still sounding: the title and caption of that sequence never play.
  await goTo(at);
  await expect.poll(async () => (await log()).length, { timeout: 15_000 }).toBe(5);
  await expect.poll(async () => (await log())[4]!.started).not.toBeNull();
  await goTo(at + 2);
  await expect.poll(async () => (await log())[4]!.reason).toBe('cancelled');
  await expect.poll(async () => (await log()).length, { timeout: 15_000 }).toBe(6);
  expect((await log())[5]).toMatchObject({ part: 'caption', text: await captionText() });
  await page.waitForTimeout(1200);
  expect((await log()).map((e) => e.part)).toEqual(['chapter', 'title', 'caption', 'caption', 'chapter', 'caption']);
});

test('PRESENTATION voice: a spurious early `end` is not the end (auto-play keeps waiting)', async ({ page }) => {
  await page.addInitScript(FAKE_SPEECH(FAKE_VOICES, 5, 0));
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/en/topics/sample-time/?ch=first-look');
  const api = () => page.evaluate(() => window.__atlas!.state());
  await page.keyboard.press('p');
  await expect.poll(async () => (await api()).modes.presentation).toBe(true);
  await page.evaluate(() => window.__atlas!.setAutoplay(true));
  await page.locator('.atlas-present__voice input').click();
  await expect.poll(async () => (await page.evaluate(() => window.__atlas!.voiceLog())).length, { timeout: 8000 }).toBe(1);
  await expect.poll(async () => (await page.evaluate(() => window.__atlas!.voiceLog()))[0]!.reason).toBe('spurious-end');
  const chapter = (await api()).presentation?.chapter;
  await page.waitForTimeout(2500);
  expect((await api()).presentation?.chapter).toBe(chapter);
  expect((await api()).presentation?.beat).toBe(0);
});

test('PRESENTATION voice: without a matching voice (or speechSynthesis) the checkbox is disabled with a hint', async ({ page }) => {
  await page.addInitScript(FAKE_SPEECH([{ name: 'Meijia', lang: 'zh-TW', localService: true }]));
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/en/topics/sample-time/?ch=first-look');
  await page.keyboard.press('p');
  await expect.poll(async () => (await page.evaluate(() => window.__atlas!.state())).modes.presentation).toBe(true);
  const label = page.locator('.atlas-present__voice');
  await expect(label.locator('input')).toBeDisabled();
  await expect(label).toHaveAttribute('title', /No voice available/);
  expect(await page.evaluate(() => window.__atlas!.setVoice(true))).toBe(false);
  expect((await page.evaluate(() => window.__atlas!.state())).presentation?.voice).toBe(false);
});

/** `__atlas.state()` of a SpaceScene page (scene snapshot fields included). */
type SpaceState = ReturnType<NonNullable<typeof window.__atlas>['state']> & {
  view: string;
  hidden: string[];
  part: string | null;
  run: boolean;
  camera: { position: number[] } | null;
};

test('sample-space PRESENTATION: beats on the 3D stage (hide, the beat\'s labels, group placards, a named preset camera), ESC restores the scene', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/en/topics/sample-space/?ch=switch-on');
  const api = () => page.evaluate(() => window.__atlas!.state() as SpaceState);

  // Named presets come after the chapter presets, ORBIT and REF.; <FlyTo> in the chapter body flies to one.
  expect((await page.evaluate(() => window.__atlas!.presets())).slice(-3)).toEqual(['orbit', 'reference', 'sample-left']);
  await page.locator('[data-flyto="sample-left"]:visible').click();
  await expect.poll(async () => (await api()).preset).toBe('sample-left');
  await expect.poll(async () => (await api()).camera?.position).toEqual([-2.4, 1, 2.6]);

  // The scene before: ORBIT on, the chapter's X-ray view, hidden back panel and selected drum.
  await page.evaluate(() => window.__atlas!.setPreset('orbit', { instant: true }));
  const before = await api();
  expect(before).toMatchObject({ preset: 'orbit', view: 'xray', hidden: ['sample-panel'], part: 'sample-drum' });

  const beats = await page.evaluate(() => window.__atlas!.beats());
  expect(beats.map((b) => `${b.chapter}.${b.index}`)).toEqual(['whole-thing.0', 'pull-apart.0', 'switch-on.0', 'switch-on.1']);

  // P starts at the current chapter's first beat: the beat's view, hide and labels on top of the chapter.
  await page.keyboard.press('p');
  await expect.poll(async () => (await api()).presentation).toEqual({ chapter: 'switch-on', beat: 0, autoplay: false, voice: false });
  expect((await api()).hud).toBe(false);
  expect(await api()).toMatchObject({ view: 'assembled', hidden: ['sample-panel', 'sample-shroud'], part: 'sample-drum' });
  await expect(page.locator('.atlas-present__caption')).toHaveText(/Sample beat one/);
  await expect(page.locator('.atlas-present__chapter em')).toHaveText('1 / 2');
  // Leader labels stay on with the HUD hidden: exactly the beat's list.
  await expect(page.locator('.atlas-leaders')).toBeVisible();
  await expect(page.locator('.space-leaders')).toHaveAttribute('data-want', 'sample-drum,sample-fins,sample-cap');
  const ids = () => page.locator('.space-co[data-id]').evaluateAll((els) => els.map((e) => (e as SVGElement).dataset.id).sort());
  await expect.poll(ids).toEqual(['sample-cap', 'sample-drum', 'sample-fins']);

  // Next beat (→): the named preset's camera, the chapter's own hide again, two group placards.
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await api()).presentation?.beat).toBe(1);
  expect(await api()).toMatchObject({ view: 'xray', hidden: ['sample-panel'], part: null, camera: { position: [-2.4, 1, 2.6] } });
  await expect(page.locator('.atlas-present__caption')).toHaveText(/Sample beat two/);
  await expect.poll(ids).toEqual(['group:sample-drive', 'group:sample-loop']);
  const loop = page.locator('.space-co[data-id="group:sample-loop"]');
  await expect(loop).toContainText('SAMPLE LOOP');
  await expect(loop).toContainText('示例回路');
  await expect.poll(() => loop.evaluate((e) => Number((e as SVGElement).style.opacity)), { timeout: 10_000 }).toBeGreaterThan(0.9);

  // ← back, a click on the stage forward; the last beat stays.
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => (await api()).presentation?.beat).toBe(0);
  await page.mouse.click(960, 400);
  await expect.poll(async () => (await api()).presentation?.beat).toBe(1);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  expect((await api()).presentation?.beat).toBe(1);

  // ESC: the HUD and the scene as they were (chapter, view, hide, selection, ORBIT).
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await api()).modes.presentation).toBe(false);
  const after = await api();
  expect(after).toMatchObject({ hud: true, presentation: null, chapter: 'switch-on', view: 'xray', hidden: ['sample-panel'], part: 'sample-drum', run: before.run });
  await expect.poll(async () => (await api()).preset).toBe('orbit');
  expect(await page.locator('.atlas-leaders').getAttribute('data-present')).toBeNull();
});

test('sample-space PRESENTATION voice: a beat is spoken once its camera has settled; auto-play moves on after the utterance', async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(FAKE_SPEECH(FAKE_VOICES, 1500));
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/en/topics/sample-space/?ch=switch-on');
  const api = () => page.evaluate(() => window.__atlas!.state());
  const log = () => page.evaluate(() => window.__atlas!.voiceLog());
  const captions = async () => (await log()).filter((e) => e.part === 'caption');

  await page.keyboard.press('p');
  await expect.poll(async () => (await api()).presentation).toEqual({ chapter: 'switch-on', beat: 0, autoplay: false, voice: false });
  expect(await page.evaluate(() => window.__atlas!.setAutoplay(true))).toBe(true);
  await page.locator('.atlas-present__voice input').click();
  await expect.poll(async () => (await api()).presentation?.voice).toBe(true);

  // The chapter's first beat: number, title, caption (en voice).
  await expect.poll(async () => (await captions()).length, { timeout: 15_000 }).toBe(1);
  expect((await log()).map((e) => e.part)).toEqual(['chapter', 'title', 'caption']);
  expect((await log())[0]!.text).toBe('Chapter three');
  expect((await captions())[0]).toMatchObject({ text: (await page.locator('.atlas-present__caption').textContent())!.trim(), lang: 'en-GB', voice: 'Daniel' });

  // It ends; auto-play goes on to beat 2 (the camera flies 1.4 s to the named preset), whose caption is spoken only after the flight.
  await expect.poll(async () => (await captions())[0]!.reason, { timeout: 10_000 }).toBe('end');
  await expect.poll(async () => (await api()).presentation?.beat, { timeout: 5000 }).toBe(1);
  await expect.poll(async () => (await captions()).length, { timeout: 15_000 }).toBe(2);
  await expect.poll(async () => (await captions())[1]!.started).not.toBeNull();
  const [first, second] = await captions();
  expect(second!.text).toMatch(/Sample beat two/);
  // 0.6 s breath + the camera move; the 2.3 s fixed wait or the 4 s fallback would be later.
  const gap = second!.started! - first!.ended!;
  expect(gap).toBeGreaterThanOrEqual(1900);
  expect(gap).toBeLessThan(2800);
  // The last beat: auto-play stops there.
  await page.waitForTimeout(3000);
  expect((await api()).presentation).toMatchObject({ chapter: 'switch-on', beat: 1 });
});

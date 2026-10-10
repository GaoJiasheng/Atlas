import { expect, test, type Locator, type Page } from '@playwright/test';
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

  test(`${topic}: the VIEW row wraps (no menu, no MODE group); every mode button is in the control panel; PRESENT is the only mode in the top bar`, async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 1200 });
    await openScene(page, `/en/topics/${topic}/`);
    const ids = await page.evaluate(() => window.__atlas!.presets());
    expect(ids.length).toBeGreaterThan(1);
    for (const id of ids) await expect(page.locator(`[data-preset="${id}"]`)).toBeVisible();
    await expect(page.locator('.hud-viewmenu')).toHaveCount(0);
    await expect(page.locator('.atlas-topbar [data-mode]')).toHaveCount(1);
    await expect(page.locator('.atlas-topbar [data-mode="presentation"]')).toBeVisible();
    for (const mode of await page.evaluate(() => window.__atlas!.modes()))
      await expect(page.locator(`[data-hud-panel="overlay"] [data-mode="${mode}"]`)).toHaveCount(1);
    // The VIEW group holds views only: chapters are reached through the top bar's number chips, the rail, the rule and ← →.
    const chapters = await page.evaluate(() => window.__atlas!.chapters());
    expect(ids.filter((id) => chapters.includes(id))).toEqual([]);
    if (topic === 'sample-time') expect(ids.slice(0, 2)).toEqual(['world', 'theatre']);
    else expect(ids.slice(0, 2)).toEqual(['orbit', 'reference']);
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
      // Every button of the mode (PRESENT also has one in the top bar) shows the same state.
      const buttons = page.locator(`[data-mode="${binding.name}"]`);
      const before = (await api()).modes[binding.name];
      await page.keyboard.press(binding.key);
      await expect.poll(async () => (await api()).modes[binding.name]).toBe(!before);
      for (const button of await buttons.all()) await expect(button).toHaveAttribute('aria-pressed', String(!before));
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

  await page.locator('.ts-seg__btn').nth(2).click();
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

type TimeState = ReturnType<NonNullable<typeof window.__atlas>['state']> & { t?: string; highlight?: string[]; camera?: { center: [number, number]; zoom: number } };

test('segmented timeline: a segment per chapter (number · YYYY-MM), a chapter lands on its time without an auto-run; the playhead drags, nudges and jumps', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openScene(page, '/en/topics/sample-time/?ch=first-look');
  const api = () => page.evaluate(() => window.__atlas!.state() as TimeState);
  const head = async () => (await api()).playhead!;
  const grab = page.locator('.ts-rule__grab');
  const readout = page.locator('.ts-rule__date');
  expect(await page.evaluate(() => 'runChapter' in window.__atlas!)).toBe(false);
  expect('running' in (await api())).toBe(false);

  // One segment per chapter, labelled at its left boundary; chapters without beats have one tick at their time.
  const segs = page.locator('.ts-seg');
  await expect(segs).toHaveCount(3);
  await expect(page.locator('.ts-seg__no')).toHaveText(['01', '02', '03']);
  await expect(page.locator('.ts-seg__date')).toHaveText(['2000-01', '2000-03', '2000-07']);
  await expect(page.locator('.ts-seg__tick')).toHaveCount(3);
  await expect(page.locator('.ts-seg[data-state="current"] .ts-seg__no')).toHaveText('01');
  await expect(page.locator('.ts-seg[data-state="current"] .ts-seg__tick[data-filled]')).toHaveCount(1);
  const p1 = await head();

  // A segment: the chapter, its time eased in 1.6 s; never RUNNING, and nothing moves after it lands.
  await page.locator('.ts-seg__btn').nth(1).click();
  await expect.poll(async () => (await api()).chapter).toBe('second-look');
  await expect(page.locator('.atlas-topbar')).not.toContainText('RUNNING');
  await expect.poll(head, { timeout: 4000 }).toBeGreaterThan(p1 + 0.1);
  await page.waitForTimeout(2000);
  const p2 = await head();
  await page.waitForTimeout(1500);
  expect(await head()).toBe(p2);
  await expect(readout).toHaveText(/11 MAR 2000/);
  expect(page.url()).not.toContain('t='); // the chapter time is the chapter's own baseline, so the URL carries none
  await expect(page.locator('.ts-seg[data-state="current"] .ts-seg__no')).toHaveText('02');
  await expect(page.locator('.ts-seg[data-state="done"]')).toHaveCount(1);

  // The rail row and ← → behave the same.
  await page.locator('.atlas-rail__item').nth(2).click();
  await expect.poll(async () => (await api()).chapter).toBe('third-look');
  await page.waitForTimeout(2000);
  const p3 = await head();
  expect(p3).toBeGreaterThan(p2);

  // Dragging the playhead scrubs continuous time without changing the chapter; releasing leaves it there.
  const box = (await grab.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 60, cy, { steps: 4 });
  await page.mouse.move(cx - 260, cy, { steps: 8 });
  await page.mouse.up();
  const dropped = await head();
  expect(dropped).toBeLessThan(p3);
  await page.waitForTimeout(900);
  expect(await head()).toBe(dropped);
  expect((await api()).chapter).toBe('third-look');
  await expect.poll(() => page.url()).toContain('t=2000-0'); // a scrubbed time is written back

  // Dragging from a segment's label scrubs too (a press that moves is never a click on the segment).
  const seg0 = (await page.locator('.ts-seg__btn').nth(0).boundingBox())!;
  await page.mouse.move(seg0.x + 30, seg0.y + seg0.height - 6);
  await page.mouse.down();
  await page.mouse.move(seg0.x + 60, seg0.y + seg0.height - 6, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  expect((await api()).chapter).toBe('third-look');
  expect(await head()).toBeLessThan(p2);

  // Keyboard on the focused playhead: Home / End jump to the ends of its segment, arrows nudge one step.
  await grab.focus();
  await page.keyboard.press('End');
  expect(await head()).toBe(p2);
  await page.keyboard.press('Home');
  expect(await head()).toBe(p1);
  await page.keyboard.press('ArrowRight');
  const nudged = await head();
  expect(nudged).toBeGreaterThan(p1);
  await page.keyboard.press('ArrowLeft');
  expect(await head()).toBeLessThan(nudged);
  expect((await api()).chapter).toBe('third-look'); // arrows on the playhead never change chapter
});

test('segmented timeline (ww2): a segment opens its chapter on the first beat, a tick applies its beat (tooltip on hover), ← → land on first beats; segments equal, ticks apart', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await openScene(page, '/en/topics/ww2/?ch=asia-1937');
  const api = () => page.evaluate(() => window.__atlas!.state() as TimeState);
  const chapters = await page.evaluate(() => window.__atlas!.chapters());
  await expect(page.locator('.ts-seg')).toHaveCount(chapters.length);
  await expect(page.locator('[data-hud-panel^="panel0"]')).toHaveCount(0);
  await expect(page.locator('.ts-seg__date').nth(1)).toHaveText('1938-01'); // the first beat is before the chapter time
  await expect(page.locator('.ts-seg__date').nth(2)).toHaveText('1939-09');
  await expect(page.locator('.ts-seg__btn').nth(1)).toHaveAttribute('aria-label', 'Chapter 2: The world before the war, from 1938-01');

  // Equal segments; inside each, ticks at least 10 px apart when there is room.
  const geo = await page.locator('.ts-seg').evaluateAll((els) =>
    els.map((el) => ({ w: el.getBoundingClientRect().width, ticks: [...el.querySelectorAll('.ts-seg__tick')].map((t) => t.getBoundingClientRect().x + t.getBoundingClientRect().width / 2) })),
  );
  const inner = geo.slice(1, -1).map((g) => g.w);
  for (const w of inner) expect(Math.abs(w - inner[0]!)).toBeLessThan(0.6);
  for (const g of geo) {
    const xs = [...g.ticks].sort((a, b) => a - b);
    const room = g.w / Math.max(1, xs.length - 1);
    for (let i = 1; i < xs.length; i++) expect(xs[i]! - xs[i - 1]!).toBeGreaterThanOrEqual(Math.min(10, room) - 0.6);
  }
  await expect(page.locator('.ts-state [data-stat]')).toHaveCount(4);
  await expect(page.locator('.ts-timeline__controls button')).toHaveCount(1);

  // A segment: the chapter on its first beat (time, highlight, camera), no auto-run; the HUD and the reader stay.
  const reader = (await api()).reader;
  // The label row (the track above it belongs to the ticks).
  await page.locator('.ts-seg__btn[data-segment="world-1939"]').click({ position: { x: 6, y: 38 } });
  await expect.poll(async () => (await api()).chapter).toBe('world-1939');
  await expect.poll(async () => (await api()).t).toBe('1938-01-15');
  expect((await api()).highlight).toEqual(['japan', 'manchukuo', 'china']);
  await expect.poll(async () => (await api()).camera?.center, { timeout: 6000 }).toEqual([60, 28]);
  expect(await api()).toMatchObject({ hud: true, presentation: null, reader });
  await expect(page.locator('.atlas-topbar')).toContainText('CHAPTER 02 VIEW'); // a beat's camera is not a free camera
  await page.waitForTimeout(1800); // the 1.6 s ease to the beat's time
  const landed = (await api()).playhead;
  await page.waitForTimeout(1500);
  expect((await api()).playhead).toBe(landed);
  await expect(page.locator('.ts-seg__tick[data-beat="world-1939.0"]')).toHaveAttribute('data-filled', 'true');

  // Hover a tick: its date and the first words of its caption.
  const tick = page.locator('.ts-seg__tick[data-beat="world-1939.2"]');
  await tick.hover();
  await expect(page.locator('.ts-tip')).toBeVisible();
  await expect(page.locator('.ts-tip b')).toHaveText('5 OCT 1938');
  await expect(page.locator('.ts-tip span')).toContainText('March 1938');
  // Click it: that beat's state, in this chapter.
  await tick.click();
  await expect.poll(async () => (await api()).t).toBe('1938-10-05');
  expect((await api()).highlight).toEqual(['anschluss', 'munich-1938']);
  await expect(tick).toHaveAttribute('data-filled', 'true');
  await expect.poll(async () => (await api()).camera?.center, { timeout: 6000 }).toEqual([14.5, 49.3]);
  // A tick of another chapter brings its chapter along.
  await page.locator('.ts-seg__tick[data-beat="poland-1939.1"]').click();
  await expect.poll(async () => (await api()).chapter).toBe('poland-1939');
  await expect.poll(async () => (await api()).t).toBe('1939-09-19');
  expect(await api()).toMatchObject({ hud: true, presentation: null, reader });

  // ← → land on the next chapter's first beat as well.
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await api()).chapter).toBe('blitzkrieg');
  await expect.poll(async () => (await api()).t).toBe('1940-04-09');
  // A deep link (or the API's instant jump) shows the chapter's own state.
  await page.evaluate(() => window.__atlas!.goToChapter('blitzkrieg', { instant: true }));
  await expect.poll(async () => (await api()).t).toBe('1940-06-22');

  // Lanes on demand, on the same mapping.
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

test('PRESENTATION: user-paced beats (keys, dots, a click on the card), no auto-advance, ESC and P restore the scene', async ({ page }) => {
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
  await page.locator('.atlas-present__caption').click();
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

test('PRESENTATION free look (TimeScene): the stage is held while a beat flies in, then pans and zooms; only a plain click on the card advances; ⌄ tucks the card until the next beat', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/en/topics/sample-time/?ch=first-look');
  const api = () => page.evaluate(() => window.__atlas!.state() as TimeState);
  const root = page.locator('.atlas-present');
  await page.keyboard.press('p');
  await expect.poll(async () => (await api()).presentation?.chapter).toBe('first-look');
  // Flying in: the input layer holds the stage, and a click on it does nothing.
  await expect(root).not.toHaveAttribute('data-free', 'true');
  await page.mouse.click(960, 400);
  // Settled (camera and caption): the layer lifts.
  await expect(root).toHaveAttribute('data-free', 'true', { timeout: 6000 });
  expect((await api()).presentation).toMatchObject({ chapter: 'first-look', beat: 0 });
  const beatCamera = (await api()).camera!;

  // Drag and wheel move the map; the beat stays.
  await page.mouse.move(900, 420);
  await page.mouse.down();
  await page.mouse.move(700, 470, { steps: 10 });
  await page.mouse.up();
  await expect.poll(async () => (await api()).camera?.center, { timeout: 4000 }).not.toEqual(beatCamera.center);
  await page.mouse.move(960, 420);
  await page.mouse.wheel(0, -500);
  await expect.poll(async () => (await api()).camera?.zoom ?? 0, { timeout: 6000 }).toBeGreaterThan(beatCamera.zoom + 0.2);
  // A plain click on the map, and a drag that starts on the card, do not advance.
  await page.mouse.click(960, 400);
  const caption = (await page.locator('.atlas-present__caption').boundingBox())!;
  await page.mouse.move(caption.x + caption.width / 2, caption.y + caption.height / 2);
  await page.mouse.down();
  await page.mouse.move(caption.x + caption.width / 2 + 40, caption.y + caption.height / 2, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  expect((await api()).presentation).toMatchObject({ chapter: 'first-look', beat: 0 });

  // A plain click on the card: the next beat takes the camera back (no free look while it flies in).
  await page.locator('.atlas-present__chapter').click();
  await expect.poll(async () => (await api()).chapter).toBe('second-look');
  await expect(root).not.toHaveAttribute('data-free', 'true');
  // Back to the first beat: its own camera again, wherever the reader had left the map.
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => (await api()).camera).toEqual(beatCamera);

  // ⌄ tucks the card into a 24 px strip (caption and bar hidden); the next beat brings it back.
  const foot = page.locator('.atlas-present__foot');
  await page.locator('.atlas-present__tuck').click();
  await expect(foot).toHaveAttribute('data-tucked', 'true');
  expect((await foot.boundingBox())!.height).toBeLessThanOrEqual(27);
  await expect(page.locator('.atlas-present__caption')).toBeHidden();
  expect((await api()).presentation).toMatchObject({ chapter: 'first-look', beat: 0 });
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await api()).chapter).toBe('second-look');
  await expect(foot).not.toHaveAttribute('data-tucked', 'true');
  await expect(page.locator('.atlas-present__caption')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect.poll(async () => (await api()).presentation).toBeNull();
  expect((await api()).chapter).toBe('first-look');
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
  cutaway: string;
  pose: string | null;
  ghosted: string[];
  solo: string | null;
};

test('sample-space organisms: pose, named cut and ghost from the chapter and the URL; a layer\'s ⊙ solos its group; a pair\'s side chips', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/en/topics/sample-space/?ch=inside-look');
  const api = () => page.evaluate(() => window.__atlas!.state() as SpaceState);
  expect(await api()).toMatchObject({ pose: 'sample-open', cutaway: 'none', ghosted: ['sample-core', 'sample-drive', 'sample-loop'], solo: null });
  // ⊙ on the organism layer: that group alone; again (or ESC) back.
  const solo = page.locator('[data-solo="sample-organic"]');
  await solo.click();
  await expect.poll(async () => (await api()).solo).toBe('sample-organic');
  await expect(solo).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await api()).solo).toBeNull();
  // The status line names a named cut; the inspector offers the other side of a pair.
  await page.evaluate(() => window.__atlas!.setMode('cutaway', true));
  await expect(page.locator('.atlas-status')).toContainText(/cutaway 50/i);
  await openScene(page, '/en/topics/sample-space/?ch=whole-thing&pose=sample-open&cut=sample-cross&part=sample-leg');
  expect(await api()).toMatchObject({ chapter: 'whole-thing', pose: 'sample-open', cutaway: 'sample-cross', part: 'sample-leg' });
  await expect(page.locator('.atlas-status')).toContainText(/cutaway cross/i);
  await expect(page.locator('.atlas-status')).toContainText(/SAMPLE LEG · L/);
  await page.locator('.space-inspector [data-side="right"]').click();
  await expect.poll(async () => (await api()).part).toBe('sample-leg-r');
  await expect(page.locator('.space-inspector [data-side="right"]')).toHaveAttribute('aria-pressed', 'true');
});

test('sample-space PRESENTATION: beats on the 3D stage (hide, the beat\'s labels, group placards, a named preset camera), ESC restores the scene', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/en/topics/sample-space/?ch=switch-on');
  const api = () => page.evaluate(() => window.__atlas!.state() as SpaceState);

  // Named presets come after the chapter presets, ORBIT and REF.; <FlyTo> in the chapter body flies to one.
  expect((await page.evaluate(() => window.__atlas!.presets())).slice(-4)).toEqual(['orbit', 'reference', 'sample-left', 'sample-above']);
  await page.locator('[data-flyto="sample-left"]:visible').click();
  await expect.poll(async () => (await api()).preset).toBe('sample-left');
  await expect.poll(async () => (await api()).camera?.position).toEqual([-2.4, 1, 2.6]);

  // The scene before: ORBIT on, the chapter's X-ray view, hidden back panel and selected drum.
  await page.evaluate(() => window.__atlas!.setPreset('orbit', { instant: true }));
  const before = await api();
  expect(before).toMatchObject({ preset: 'orbit', view: 'xray', hidden: ['sample-panel'], part: 'sample-drum' });

  const beats = await page.evaluate(() => window.__atlas!.beats());
  expect(beats.map((b) => `${b.chapter}.${b.index}`)).toEqual([
    'whole-thing.0',
    'pull-apart.0',
    'switch-on.0',
    'switch-on.1',
    'inside-look.0',
    'inside-look.1',
    'inside-look.2',
  ]);

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

  // ← back. Once the beat has settled the stage orbits; a click on the model or on empty space neither advances nor changes the beat's part.
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => (await api()).presentation?.beat).toBe(0);
  await expect(page.locator('.atlas-present')).toHaveAttribute('data-free', 'true', { timeout: 8000 });
  const settled = (await api()).camera;
  await page.mouse.move(900, 450);
  await page.mouse.down();
  await page.mouse.move(700, 420, { steps: 10 });
  await page.mouse.up();
  // Orbit damping is frame-count based: under software GL the camera is written back only seconds after the drag.
  await expect.poll(async () => (await api()).camera, { timeout: 20_000 }).not.toEqual(settled);
  await page.mouse.click(960, 400);
  await page.mouse.click(1880, 120);
  await page.waitForTimeout(500);
  expect(await api()).toMatchObject({ part: 'sample-drum', presentation: { chapter: 'switch-on', beat: 0 } });
  // A plain click on the card: the next beat, and the system has the camera again.
  await page.locator('.atlas-present__caption').click();
  await expect.poll(async () => (await api()).presentation?.beat).toBe(1);
  await expect(page.locator('.atlas-present')).not.toHaveAttribute('data-free', 'true');
  await expect.poll(async () => (await api()).camera?.position).toEqual([-2.4, 1, 2.6]);
  await page.evaluate((last) => window.__atlas!.goToBeat(last, { instant: true }), beats.length - 1);
  await expect.poll(async () => (await api()).presentation).toMatchObject({ chapter: 'inside-look', beat: 2 });
  // The organism beat: a named cut, the pose and the faint machine.
  expect(await api()).toMatchObject({ cutaway: 'sample-cross', pose: 'sample-open', ghosted: ['sample-core', 'sample-drive', 'sample-loop'] });
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  expect((await api()).presentation).toMatchObject({ chapter: 'inside-look', beat: 2 });

  // ESC: the HUD and the scene as they were (chapter, view, hide, selection, ORBIT).
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await api()).modes.presentation).toBe(false);
  const after = await api();
  expect(after).toMatchObject({ hud: true, presentation: null, chapter: 'switch-on', view: 'xray', hidden: ['sample-panel'], part: 'sample-drum', run: before.run });
  await expect.poll(async () => (await api()).preset).toBe('orbit');
  expect(await page.locator('.atlas-leaders').getAttribute('data-present')).toBeNull();
});

test('sample-space camera: a preset then a mode in the same tick end on the preset; H frames the cover camera and the HUD coming back returns', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openScene(page, '/en/topics/sample-space/');
  type Cam = { position: number[]; target: number[]; fov: number };
  const cam = () => page.evaluate(() => (window.__atlas!.stats() as { camera?: Cam }).camera ?? null);

  // The shoot script's order: preset (instant) and a mode switch (snap) in one tick.
  await page.evaluate(() => {
    window.__atlas!.setPreset('sample-left', { instant: true });
    window.__atlas!.setMode('xray', true);
  });
  await expect.poll(async () => (await cam())?.target).toEqual([-0.1, -0.3, 0]);
  expect((await page.evaluate(() => window.__atlas!.state())).preset).toBe('sample-left');
  await page.evaluate(() => window.__atlas!.setMode('xray', false));

  // H: no `views.cover` here, so the model is re-fitted (centred on its bounding sphere); H again goes back.
  const before = (await cam())!;
  await page.keyboard.press('h');
  await expect.poll(async () => (await page.evaluate(() => window.__atlas!.state())).hud).toBe(false);
  await expect.poll(async () => (await cam())?.target, { timeout: 5000 }).not.toEqual(before.target);
  await page.waitForTimeout(1200);
  const cover = (await cam())!;
  await page.keyboard.press('h');
  await expect.poll(async () => (await cam())?.target, { timeout: 5000 }).toEqual(before.target);
  await expect.poll(async () => (await cam())?.position, { timeout: 5000 }).toEqual(before.position);

  // A chapter change while the HUD is hidden places the camera itself: showing the HUD does not fly back.
  await page.keyboard.press('h');
  await expect.poll(async () => (await cam())?.target, { timeout: 5000 }).toEqual(cover.target);
  await page.evaluate(() => window.__atlas!.goToChapter('switch-on', { instant: true }));
  const chapter = (await cam())!;
  await page.keyboard.press('h');
  await page.waitForTimeout(1200);
  expect((await cam())!.target).toEqual(chapter.target);
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
  // Auto-play goes on into the next chapter's first beat.
  await expect.poll(async () => (await api()).presentation, { timeout: 15_000 }).toMatchObject({ chapter: 'inside-look', beat: 0 });
});

for (const topic of TOPICS) {
  for (const [width, height] of [
    [1920, 1080],
    [1280, 720],
  ] as const) {
    test(`${topic} top bar at ${width}x${height}: brand and chapter chips left, VIEW centred with the orange PRESENT at its right end, LOOK and language right`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await openScene(page, `/en/topics/${topic}/`);
      const box = async (selector: string) => (await page.locator(selector).first().boundingBox())!;
      const chapters = await page.evaluate(() => window.__atlas!.chapters());
      await expect(page.locator('.atlas-topbar [data-chapter]')).toHaveCount(chapters.length);
      const brand = await box('.atlas-brand');
      const firstChip = await box('.atlas-topbar [data-chapter]');
      const lastChip = (await page.locator('.atlas-topbar [data-chapter]').last().boundingBox())!;
      const view = await box('.hud-group--view');
      const present = await box('.hud-btn--present');
      const toggles = await box('.atlas-toggles');
      // Left to right, one row: brand, chips, VIEW, PRESENT, LOOK / language.
      expect(brand.x + brand.width).toBeLessThanOrEqual(firstChip.x);
      expect(lastChip.x + lastChip.width).toBeLessThan(view.x);
      expect(view.x + view.width).toBeLessThanOrEqual(present.x + 1);
      expect(present.x + present.width).toBeLessThan(toggles.x);
      expect(Math.abs(brand.y - toggles.y)).toBeLessThan(20);
      expect(Math.abs(brand.y - present.y)).toBeLessThan(20);
      // The VIEW + PRESENT group sits in the middle of the bar.
      const middle = view.x + (present.x + present.width - view.x) / 2;
      expect(Math.abs(middle - width / 2)).toBeLessThan(width * 0.1);
      // PRESENT is the one solid signal-orange button.
      const colours = await page.evaluate(() => {
        const pick = (sel: string) => getComputedStyle(document.querySelector(sel)!).backgroundColor;
        const signal = getComputedStyle(document.documentElement).getPropertyValue('--signal').trim();
        const probe = document.createElement('i');
        probe.style.color = signal;
        document.body.append(probe);
        const expected = getComputedStyle(probe).color;
        probe.remove();
        return { present: pick('.hud-btn--present'), expected, preset: pick('.hud-group--view .hud-btn:not(.on)') };
      });
      expect(colours.present).toBe(colours.expected);
      expect(colours.preset).not.toBe(colours.expected);
      // The doc id leads the status line; the key hint stays under the bar's right half.
      await expect(page.locator('.atlas-status')).toHaveText(/^ATL-[A-Z0-9]+-\d\d · /);
      await expect(page.locator('.atlas-topbar__row .atlas-docid')).toHaveCount(0);
      await expect(page.locator('.atlas-hint')).toBeVisible();
    });
  }

  test(`${topic}: chapter chips mark the current chapter, jump on click, and ← → keep working; phones show the rail's chip row instead`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openScene(page, `/en/topics/${topic}/`);
    const api = () => page.evaluate(() => window.__atlas!.state());
    const chapters = await page.evaluate(() => window.__atlas!.chapters());
    const chip = (id: string) => page.locator(`.atlas-topbar [data-chapter="${id}"]`);
    await expect(chip(chapters[0]!)).toHaveAttribute('aria-current', 'step');
    await expect(chip(chapters[0]!)).toHaveText('01');
    await expect(chip(chapters[1]!)).not.toHaveAttribute('aria-current', 'step');
    await chip(chapters[2]!).click();
    await expect.poll(async () => (await api()).chapter).toBe(chapters[2]);
    await expect(chip(chapters[2]!)).toHaveAttribute('aria-current', 'step');
    await expect(chip(chapters[2]!)).toHaveClass(/\bon\b/);
    await expect(chip(chapters[2]!)).not.toBeFocused(); // keys go to the scene, not the chip
    await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => (await api()).chapter).toBe(chapters[1]);
    await expect(chip(chapters[1]!)).toHaveAttribute('aria-current', 'step');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => (await api()).chapter).toBe(chapters[Math.min(3, chapters.length - 1)]);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.atlas-topbar [data-chapter]').first()).toBeHidden();
    await expect(page.locator('.atlas-topbar [data-mode="presentation"]')).toBeHidden();
    await expect(page.locator('.atlas-rail__item').first()).toBeVisible();
    expect((await page.locator('.atlas-rail__item').first().boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });

  test(`${topic}: the PRESENT button toggles the presentation (aria-pressed, shared with key P and the TOOLS row)`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openScene(page, `/en/topics/${topic}/`);
    const api = () => page.evaluate(() => window.__atlas!.state());
    const present = page.locator('.atlas-topbar [data-mode="presentation"]');
    await expect(present).toHaveText(/present/i);
    await expect(present).toHaveAttribute('aria-pressed', 'false');
    expect((await present.boundingBox())!.height).toBeGreaterThanOrEqual(17);
    await present.click();
    await expect.poll(async () => (await api()).modes.presentation).toBe(true);
    await expect(present).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-hud-panel="overlay"] [data-mode="presentation"]')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('p');
    await expect.poll(async () => (await api()).modes.presentation).toBe(false);
    await expect(present).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('p');
    await expect.poll(async () => (await api()).modes.presentation).toBe(true);
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await api()).modes.presentation).toBe(false);
    await expect(present).toBeVisible();
  });
}

test('bottom panels (SpaceScene): a chevron folds the three into one 28 px bar with their titles, the stage reflows, the choice is per tab; the reader handle works here too', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openScene(page, '/en/topics/sample-space/');
  const api = () => page.evaluate(() => window.__atlas!.state());
  const strip = page.locator('.atlas-panels');
  const stage = page.locator('.atlas-stage');
  const height = async (l: typeof strip) => (await l.boundingBox())?.height ?? 0;
  const fold = page.locator('.atlas-panels__fold');
  const bar = page.locator('.atlas-panels__bar');
  await expect(fold).toBeVisible();
  await expect(fold).toHaveAttribute('aria-expanded', 'true');
  await expect(bar).toBeHidden();
  await expect(page.locator('[data-hud-panel^="panel0"]')).toHaveCount(3);
  // The fold is a 24 px tab on the strip's top edge, left-aligned, chevron down.
  const foldBox = (await fold.boundingBox())!;
  const stripBox = (await strip.boundingBox())!;
  expect(Math.round(foldBox.height)).toBe(24);
  expect(foldBox.width).toBeGreaterThanOrEqual(44);
  expect(Math.abs(foldBox.x - stripBox.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(foldBox.y + foldBox.height - stripBox.y)).toBeLessThanOrEqual(1);
  const chevron = () => fold.locator('i').evaluate((el) => getComputedStyle(el).transform);
  const down = await chevron();
  // The stage ends where the strip starts.
  const stageBox = (await stage.boundingBox())!;
  expect(Math.abs(stageBox.y + stageBox.height - stripBox.y)).toBeLessThanOrEqual(2);
  const openHeight = stageBox.height;
  const canvasOpen = (await api().then(() => page.evaluate(() => window.__atlas!.stats()))).buffer[1];
  expect((await api()).panels).toBe(true);

  await fold.click();
  await expect(strip).toHaveAttribute('data-collapsed', '');
  await expect(bar).toBeVisible();
  await expect(bar).toHaveAttribute('aria-expanded', 'false');
  // The tab stays on the folded bar's top edge, left-aligned, chevron up.
  await expect(fold).toHaveAttribute('aria-expanded', 'false');
  const foldBox2 = (await fold.boundingBox())!;
  const barBox = (await bar.boundingBox())!;
  expect(Math.abs(foldBox2.x - barBox.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(foldBox2.y + foldBox2.height - barBox.y)).toBeLessThanOrEqual(1);
  expect(await chevron()).not.toBe(down);
  for (const id of ['panel01', 'panel02', 'panel03']) await expect(page.locator(`[data-hud-panel="${id}"]`)).toBeHidden();
  expect(Math.round(await height(bar))).toBe(28);
  await expect(bar).toContainText('01');
  await expect(bar).toContainText('ARCHITECTURE');
  await expect(bar).toContainText('DETAIL');
  await expect(bar).toContainText('STATE');
  await expect.poll(() => height(stage)).toBeGreaterThan(openHeight + 100);
  await expect.poll(async () => (await page.evaluate(() => window.__atlas!.stats())).buffer[1]).toBeGreaterThan(canvasOpen!);
  expect((await api()).panels).toBe(false);
  expect(await page.evaluate(() => sessionStorage.getItem('atlas:panels'))).toBe('collapsed');
  await page.waitForTimeout(400);
  expect(page.url()).not.toContain('panels');
  expect(await hudLayoutIssues(page)).toEqual([]);

  // Sticky: a reload and a chapter change keep it folded.
  await page.reload();
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect(strip).toHaveAttribute('data-collapsed', '');
  const chapters = await page.evaluate(() => window.__atlas!.chapters());
  await page.locator(`.atlas-topbar [data-chapter="${chapters[1]}"]`).click();
  await expect.poll(async () => (await api()).chapter).toBe(chapters[1]);
  await expect(strip).toHaveAttribute('data-collapsed', '');

  // The reading panel folds independently of the strip (its handle is host-level, not TimeScene's).
  const reader = page.locator('[data-hud-panel="reader"]');
  await page.locator('.atlas-reader__handle').click();
  await expect.poll(async () => (await reader.boundingBox())?.width ?? 0).toBeLessThanOrEqual(29);
  await expect.poll(async () => (await api()).reader).toBe(false);
  await expect(strip).toHaveAttribute('data-collapsed', '');
  await page.locator('.atlas-reader__strip').click();
  await expect.poll(async () => (await reader.boundingBox())?.width ?? 0).toBeGreaterThan(300);

  await fold.click();
  await expect(strip).not.toHaveAttribute('data-collapsed', '');
  await expect(fold).toHaveAttribute('aria-expanded', 'true');
  expect(await chevron()).toBe(down);
  for (const id of ['panel01', 'panel02', 'panel03']) await expect(page.locator(`[data-hud-panel="${id}"]`)).toBeVisible();
  await expect.poll(() => height(stage)).toBeLessThan(openHeight + 2);
  expect((await api()).panels).toBe(true);
  expect(await page.evaluate(() => sessionStorage.getItem('atlas:panels'))).toBe('open');
  expect(await hudLayoutIssues(page)).toEqual([]);
});

/** The folded tab slides in; let it land before measuring. */
const settled = (tab: Locator) => tab.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)).then(() => undefined));

test('card fold (SpaceScene): a right chevron folds the part chain into a 28 px tab on the stage edge, the Layers panel moves up, per tab', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await openScene(page, '/en/topics/sample-space/');
  const api = () => page.evaluate(() => window.__atlas!.state());
  const card = page.locator('[data-hud-panel="card"]');
  const tab = page.locator('.atlas-card__tab');
  const fold = page.locator('.atlas-card__fold');
  const overlay = page.locator('[data-hud-panel="overlay"] > *').first();
  await expect(fold).toBeVisible();
  await expect(fold).toHaveAttribute('aria-expanded', 'true');
  await expect(tab).toHaveCount(0);
  // The fold is at the header's right end.
  const cardBox = (await card.boundingBox())!;
  const foldBox = (await fold.boundingBox())!;
  expect(foldBox.x + foldBox.width).toBeGreaterThan(cardBox.x + cardBox.width - 14);
  expect(foldBox.y).toBeLessThan(cardBox.y + 40);
  const overlayY = (await overlay.boundingBox())!.y;
  expect((await api()).card).toBe(true);

  await fold.click();
  await expect(card).toBeHidden();
  await expect(tab).toBeVisible();
  await expect(tab).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(async () => Math.round((await tab.boundingBox())!.width)).toBe(28);
  // On the stage's right edge: the HUD layer ends where the docked reader begins.
  const hudBox = (await page.locator('.atlas-hud').boundingBox())!;
  await expect
    .poll(async () => {
      const box = (await tab.boundingBox())!;
      return Math.abs(box.x + box.width - (hudBox.x + hudBox.width));
    })
    .toBeLessThanOrEqual(1);
  await expect(tab).toContainText('PART CHAIN');
  expect(await tab.locator('span').evaluate((el) => getComputedStyle(el).writingMode)).toBe('vertical-rl');
  // The Layers panel took the card's place.
  await expect.poll(async () => (await overlay.boundingBox())!.y).toBeLessThan(overlayY - 100);
  expect((await api()).card).toBe(false);
  expect(await page.evaluate(() => sessionStorage.getItem('atlas:card'))).toBe('collapsed');
  await settled(tab);
  expect(await hudLayoutIssues(page)).toEqual([]);

  // Sticky across a reload; the leader-label obstacles follow (the tab counts, the folded card does not).
  await page.reload();
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect(tab).toBeVisible();
  await expect(card).toBeHidden();

  await tab.click();
  await expect(card).toBeVisible();
  await expect(tab).toHaveCount(0);
  await expect.poll(async () => (await overlay.boundingBox())!.y).toBeGreaterThan(overlayY - 2);
  expect((await api()).card).toBe(true);
  expect(await page.evaluate(() => sessionStorage.getItem('atlas:card'))).toBe('open');
  expect(await hudLayoutIssues(page)).toEqual([]);
});

test('card fold (TimeScene): the fold is separate from the expand-to-list toggle; folded state keeps the participation card mounted', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await openScene(page, '/en/topics/sample-time/');
  const card = page.locator('[data-hud-panel="card"]');
  const toggle = page.locator('.atlas-card__toggle');
  const fold = page.locator('.atlas-card__fold');
  const tab = page.locator('.atlas-card__tab');
  await expect(toggle).toBeVisible();
  await expect(fold).toBeVisible();
  const toggleBox = (await toggle.boundingBox())!;
  const foldBox = (await fold.boundingBox())!;
  expect(foldBox.x).toBeGreaterThanOrEqual(toggleBox.x + toggleBox.width - 1);
  await toggle.click();
  await expect(card).toHaveAttribute('data-expanded', 'true');
  await fold.click();
  await expect(card).toBeHidden();
  await expect(tab).toBeVisible();
  await expect(tab).toContainText('PARTICIPATION');
  await settled(tab);
  expect(await hudLayoutIssues(page)).toEqual([]);
  await tab.click();
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(card).toHaveAttribute('data-expanded', 'false');
});

test('collapsed reader strip: the chapter title is centred in the strip, the number above it, the chevron below', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await openScene(page, '/en/topics/sample-space/');
  await page.locator('.atlas-reader__handle').click();
  const strip = page.locator('.atlas-reader__strip');
  await expect(strip).toBeVisible();
  const s = (await strip.boundingBox())!;
  const mid = s.y + s.height / 2;
  const span = (await strip.locator('span').boundingBox())!;
  const num = (await strip.locator('b').boundingBox())!;
  const chev = (await strip.locator('i').boundingBox())!;
  expect(Math.abs(span.y + span.height / 2 - mid)).toBeLessThanOrEqual(2);
  expect(num.y + num.height).toBeLessThanOrEqual(span.y);
  expect(chev.y).toBeGreaterThanOrEqual(span.y + span.height);
  expect(Math.abs(chev.x + chev.width / 2 - (s.x + s.width / 2))).toBeLessThanOrEqual(2);
  expect(Math.abs(span.x + span.width / 2 - (s.x + s.width / 2))).toBeLessThanOrEqual(2);
});

test('bottom panels: H hides them with the HUD and gives the stage the whole sheet; the TimeScene has no strip and no inset', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openScene(page, '/en/topics/sample-space/');
  const stage = page.locator('.atlas-stage');
  await page.keyboard.press('h');
  await expect.poll(async () => Math.round((await stage.boundingBox())!.height)).toBe(900);
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await stage.boundingBox())!.height).toBeLessThan(800);

  await openScene(page, '/en/topics/sample-time/');
  await expect(page.locator('.atlas-panels')).toHaveCount(0);
  const area = (await page.locator('.atlas-stage-area').boundingBox())!;
  const box = (await page.locator('.atlas-stage').boundingBox())!;
  expect(Math.round(box.height)).toBe(Math.round(area.height));
});

/**
 * Recorded narration (docs/06 语音): with clips for one chapter of sample-time
 * (two tiny ffmpeg beeps in tests-e2e/fixtures/narration, served for the
 * clip names the caption extractor gives that chapter), Voice in the
 * presentation plays them instead of speaking; the next chapter, which has
 * none, is spoken by the (fake) device voice, with exactly the extractor's
 * text. So the page and the extractor agree on every word.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import type { Manifest, ManifestEntry } from '../scripts/audio/lib';
import { NARRATION_VOICES, type NarrationIndex } from '../src/lib/narration-clips';

// page.route must see every request (a service worker would answer some itself).
test.use({ serviceWorkers: 'block' });

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FIXTURES = join(ROOT, 'tests-e2e/fixtures/narration');
/** The manifest the real extractor CLI writes for sample-time (into a temporary audio folder). */
function extract(): Manifest {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-narration-'));
  execFileSync(join(ROOT, 'node_modules/.bin/tsx'), ['scripts/audio/extract.ts', '--topic', 'sample-time'], { cwd: ROOT, env: { ...process.env, ATLAS_AUDIO_DIR: dir }, stdio: 'pipe' });
  return JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')) as Manifest;
}
const manifest = extract();
const entries = (locale: 'en' | 'zh', chapter: string) => manifest.entries.filter((e) => e.locale === locale && e.chapter === chapter);
const textOf = (e: ManifestEntry) => manifest.clips.find((c) => c.hash === e.hash && c.locale === e.locale)!.text;

/** A device voice like Chrome's: each utterance ends 20 ms per character after it starts (at least 600 ms). */
const FAKE_SPEECH = `
  class U { constructor(text) { this.text = text; this.lang = ''; this.voice = null; this.rate = 1; this.pitch = 1; this.volume = 1; this.onstart = null; this.onend = null; this.onerror = null; } }
  window.SpeechSynthesisUtterance = U;
  window.__spoken = [];
  let cur = null;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    getVoices: () => [{ name: 'Daniel', lang: 'en-GB', localService: true }, { name: 'Tingting', lang: 'zh-CN', localService: true }],
    speak(u) {
      cur = u;
      window.__spoken.push(u.text);
      setTimeout(() => { if (cur === u) { u.onstart && u.onstart({}); u.__t = setTimeout(() => { if (cur === u) { cur = null; u.onend && u.onend({}); } }, Math.max(600, u.text.length * 20)); } }, 0);
    },
    cancel() { if (cur) { const u = cur; cur = null; clearTimeout(u.__t); u.onerror && u.onerror({ error: 'interrupted' }); } },
    pause() {}, resume() {}, speaking: false, addEventListener() {}, removeEventListener() {},
  } });
`;

async function openScene(page: Page, url: string) {
  await page.goto(url);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}

for (const locale of ['en', 'zh'] as const) {
  test(`recorded narration (${locale}): a chapter with clips plays them, a chapter without is spoken; both say the extractor's text`, async ({ page }) => {
    test.setTimeout(60_000);
    const recorded = entries(locale, 'first-look');
    const spokenLater = entries(locale, 'second-look');
    expect(recorded.map((e) => e.kind)).toEqual(['chapter', 'title', 'caption']);
    const index: NarrationIndex = { version: 1, en: [], zh: [] };
    index[locale] = recorded.map((e) => e.hash);
    const requests: string[] = [];
    await page.route('**/narration/**', (route) => {
      const url = new URL(route.request().url());
      requests.push(`${url.origin === new URL(page.url()).origin ? '' : url.origin}${url.pathname}${url.search}`);
      if (url.pathname === '/narration/sample-time.json') return route.fulfill({ json: index });
      const clip = recorded.find((e) => url.pathname === `/narration/${locale}/${e.hash}.mp3`);
      if (!clip) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ body: readFileSync(join(FIXTURES, clip.kind === 'caption' ? 'beep-long.mp3' : 'beep-short.mp3')), contentType: 'audio/mpeg' });
    });
    await page.addInitScript(FAKE_SPEECH);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await openScene(page, `/${locale}/topics/sample-time/?ch=first-look`);
    const api = () => page.evaluate(() => window.__atlas!.state());
    const log = () => page.evaluate(() => window.__atlas!.voiceLog());
    const spoken = () => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken.filter((t) => t.trim() !== ''));

    await page.keyboard.press('p');
    await expect.poll(async () => (await api()).modes.presentation).toBe(true);
    const caption1 = (await page.locator('.atlas-present__caption').textContent())!.trim();
    await page.locator('.atlas-present__voice input').click();
    await expect.poll(async () => (await api()).presentation?.voice).toBe(true);
    expect(await page.evaluate(() => window.__atlas!.setAutoplay(true))).toBe(true);

    // Chapter one: its number, title and caption play as the recorded clips, in order, each to its end; nothing is spoken.
    await expect.poll(async () => (await log()).filter((e) => e.source === 'clip' && e.reason === 'end').length, { timeout: 15_000 }).toBe(3);
    const clips = (await log()).slice(0, 3);
    expect(clips.map((e) => [e.part, e.source, e.voice, e.lang, e.text])).toEqual(
      recorded.map((e) => [e.kind, 'clip', NARRATION_VOICES[locale].voice, NARRATION_VOICES[locale].lang, textOf(e)]),
    );
    expect(clips[0]!.text).toBe(locale === 'zh' ? '第一章' : 'Chapter one');
    expect(clips[2]!.text).toBe(caption1);
    expect(clips[1]!.started! - clips[0]!.ended!).toBeGreaterThanOrEqual(300);
    expect(await spoken()).toEqual([]);

    // Auto-play moves on once the last clip ended; chapter two has no clips, so the device speaks it: the extractor's words exactly.
    await expect.poll(async () => (await api()).presentation?.chapter, { timeout: 10_000 }).toBe('second-look');
    await expect.poll(async () => (await log()).filter((e) => e.source === 'speech').length, { timeout: 15_000 }).toBe(3);
    const speech = (await log()).filter((e) => e.source === 'speech');
    expect(speech.map((e) => [e.part, e.text])).toEqual(spokenLater.map((e) => [e.kind, textOf(e)]));
    expect(await spoken()).toEqual(spokenLater.map(textOf));

    // Chapter two again (auto-play off), then back to chapter one while it is being spoken: the speech is cancelled
    // and chapter one's clips play again from memory (no second download).
    expect(await page.evaluate(() => window.__atlas!.setAutoplay(false))).toBe(true);
    const goTo = (i: number) => page.evaluate((k) => window.__atlas!.goToBeat(k, { instant: true }), i);
    const before = (await log()).length;
    await goTo(1);
    await expect.poll(async () => (await log()).slice(before).some((e) => e.source === 'speech' && e.started !== null && e.reason === null), { timeout: 15_000 }).toBe(true);
    await goTo(0);
    await expect.poll(async () => (await log()).slice(before).some((e) => e.source === 'speech' && e.reason === 'cancelled')).toBe(true);
    await expect.poll(async () => (await log()).slice(before).filter((e) => e.source === 'clip' && e.reason === 'end').length, { timeout: 15_000 }).toBe(3);

    // Plain same-origin GETs: the topic's index once, each recorded clip once, nothing for a clip the index does not list, no query strings.
    expect(requests.filter((r) => r.endsWith('.json'))).toEqual(['/narration/sample-time.json']);
    expect(requests.filter((r) => r.endsWith('.mp3')).sort()).toEqual(recorded.map((e) => `/narration/${locale}/${e.hash}.mp3`).sort());
    expect(requests.every((r) => r.startsWith('/narration/') && !r.includes('?'))).toBe(true);

    expect(await page.evaluate(() => window.__atlas!.setVoice(false))).toBe(true);
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await api()).modes.presentation).toBe(false);
  });
}

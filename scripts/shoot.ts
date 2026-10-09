/**
 * `pnpm shoot <topic> [options] [shot names...]` — Playwright QA driver for the
 * technical-plate scenes (docs/08 §7). Port of the industrial-3d-showcase
 * `shoot.py`, driving `window.__atlas` on the built site (`pnpm build` first).
 *
 *   pnpm shoot sample-space                          # every chapter + every mode + hero-clean -> shots/
 *   pnpm shoot sample-space ch01-whole-thing         # only these shots
 *   pnpm shoot sample-time --locale zh --theme cinema --size 3840x2160 --suffix _4k
 *   pnpm shoot sample-time --shots my-shots.json     # custom shot list (format below)
 *   pnpm shoot sample-time --keys                    # every key changes state + its button
 *   pnpm shoot sample-time --layout                  # HUD overlap / overflow at six sizes
 *   pnpm shoot ww2 --beats                           # every presentation beat -> shots/<topic>/<locale>-<theme>/beat-<chapter>-<n>.png
 *   pnpm shoot sample-space --perf --json out.json   # renderer numbers per shot
 *
 * `--locale` and `--theme` take a value, a comma list, or `all` (default: en, paper).
 * `--keys` / `--layout` / `--beats` replace the shot run unless shot names or `--shots` are given.
 *
 * shots.json: { "name": { "chapter": "id", "preset": "id", "modes": { "xray": true }, "hud": false, "wait": 900, "js": "window.__atlas…" } }
 *
 * Exit code 1 on any console error / page error / external request, failed key
 * check or layout issue.
 */
import { createServer, type Server } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import type { AddressInfo } from 'node:net';
import { parseArgs } from 'node:util';
import { gzipSync } from 'node:zlib';
import { chromium, type Browser, type Page } from '@playwright/test';
import { hudLayoutIssues, LAYOUT_SIZES } from '../tests-e2e/hud-layout';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

/** Headless GPU / SwiftShader chatter that is expected and harmless (same list as tests-e2e/smoke.spec.ts). */
const IGNORED = [/Service Worker registration blocked/i, /GPU stall/i, /swiftshader/i, /GL Driver Message/i, /WebGL.*(deprecated|fallback)/i, /GroupMarkerNotSet/i];

const SOFTWARE_GL = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const HARDWARE_GL = ['--enable-gpu', '--ignore-gpu-blocklist', ...(process.platform === 'darwin' ? ['--use-angle=metal'] : [])];

const LOCALES = ['en', 'zh'] as const;
const THEMES = ['paper', 'cinema'] as const;

interface ShotSpec {
  chapter?: string;
  preset?: string;
  modes?: Record<string, boolean>;
  hud?: boolean;
  wait?: number;
  js?: string;
}

interface Stats {
  calls?: number;
  triangles?: number;
  fps?: number;
  features?: number;
  zoom?: number;
  geometries?: number;
  textures?: number;
  buffer?: [number, number];
  pixelRatio?: number;
  gpu?: string;
}

interface KeyResult {
  key: string;
  type: string;
  name: string;
  ok: boolean;
  note: string;
}

interface LayoutResult {
  size: string;
  where: string;
  issues: string[];
}

interface RunReport {
  topic: string;
  locale: string;
  theme: string;
  size: string;
  shots: Record<string, Stats>;
  keys: KeyResult[];
  layout: LayoutResult[];
  /** Presentation beats that did not land (empty = every beat shot). */
  beatFailures: string[];
  /** Beats whose highlighted ids have no label on screen (content issues, not failures). */
  beatNotes: string[];
  /** JavaScript the page loaded (gzip -9 of the files in dist/). */
  js: { files: number; gzKB: number };
  logs: { type: string; text: string }[];
}

/* ------------------------------------------------------------------ */
/* CLI                                                                 */
/* ------------------------------------------------------------------ */

function usage(): never {
  console.error(
    'usage: pnpm shoot <topic> [--locale en|zh|all] [--theme paper|cinema|all] [--size WxH] [--suffix _4k]\n' +
      '                          [--shots file.json] [--keys] [--layout] [--beats] [--perf] [--gpu] [--json out.json] [names...]',
  );
  process.exit(2);
}

function pick<T extends string>(raw: string | undefined, all: readonly T[], fallback: T, flag: string): T[] {
  if (!raw) return [fallback];
  if (raw === 'all') return [...all];
  const out = raw.split(',').map((s) => s.trim());
  for (const v of out) if (!(all as readonly string[]).includes(v)) throw new Error(`--${flag}: "${v}" is not one of ${all.join(', ')}`);
  return out as T[];
}

function parseSize(raw: string): [number, number] {
  const m = /^(\d+)x(\d+)$/i.exec(raw);
  if (!m) throw new Error(`--size: expected WxH, got "${raw}"`);
  return [Number(m[1]), Number(m[2])];
}

/* ------------------------------------------------------------------ */
/* Static server for dist/                                             */
/* ------------------------------------------------------------------ */

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.glb': 'model/gltf-binary',
  '.txt': 'text/plain; charset=utf-8',
};

function serveDist(): Promise<{ server: Server; origin: string }> {
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent((req.url ?? '/').split('?')[0]!);
    let file = normalize(join(DIST, pathname));
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  });
  return new Promise((done) => {
    server.listen(0, '127.0.0.1', () => done({ server, origin: `http://127.0.0.1:${(server.address() as AddressInfo).port}` }));
  });
}

/* ------------------------------------------------------------------ */
/* One page session                                                    */
/* ------------------------------------------------------------------ */

class Session {
  logs: { type: string; text: string }[] = [];
  jsFiles = new Set<string>();
  baseline: Record<string, boolean> = {};
  baselinePaused: boolean | null = null;

  constructor(
    readonly page: Page,
    readonly origin: string,
  ) {}

  static async open(
    browser: Browser,
    origin: string,
    topic: string,
    locale: string,
    theme: string,
    size: [number, number],
  ): Promise<Session> {
    const context = await browser.newContext({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    // tsx compiles with keepNames: page.evaluate callbacks reference a helper that only exists in Node.
    await context.addInitScript(() => {
      (window as unknown as { __name: <T>(fn: T) => T }).__name = (fn) => fn;
    });
    const page = await context.newPage();
    const s = new Session(page, origin);
    page.on('console', (m) => {
      if ((m.type() === 'error' || m.type() === 'warning') && !IGNORED.some((re) => re.test(m.text()))) s.logs.push({ type: m.type(), text: m.text() });
    });
    page.on('pageerror', (e) => {
      if (!IGNORED.some((re) => re.test(e.message))) s.logs.push({ type: 'pageerror', text: e.message });
    });
    page.on('request', (r) => {
      const url = r.url();
      if (!url.startsWith(origin) && !/^(data|blob|about):/.test(url)) s.logs.push({ type: 'external-request', text: url });
    });
    page.on('response', (r) => {
      if (r.url().startsWith(origin) && /\.js$/.test(r.url().split('?')[0]!)) s.jsFiles.add(r.url().slice(origin.length).split('?')[0]!);
      if (r.status() >= 400 && r.url().startsWith(origin)) s.logs.push({ type: 'http-' + r.status(), text: r.url().slice(origin.length) });
    });
    await page.goto(`${origin}/${locale}/topics/${topic}/`);
    await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 60_000 });
    if (!(await page.evaluate(() => window.__atlas!.ready))) throw new Error(`${topic}: stage never became ready`);
    await page.evaluate((t) => window.__atlas!.setTheme(t as 'paper' | 'cinema'), theme);
    await page.waitForTimeout(800);
    const st = await page.evaluate(() => window.__atlas!.state());
    s.baseline = st.modes;
    s.baselinePaused = st.paused;
    return s;
  }

  ev<T>(fn: () => T): Promise<T> {
    return this.page.evaluate(fn);
  }

  state() {
    return this.page.evaluate(() => window.__atlas!.state());
  }

  async stats(): Promise<Stats> {
    return this.page.evaluate(() => window.__atlas!.stats() as Stats);
  }

  /** Put the scene back to its load state, then apply the shot. */
  async apply(spec: ShotSpec): Promise<void> {
    const { page } = this;
    await page.evaluate(
      ([baseline, paused]) => {
        const api = window.__atlas!;
        const now = api.state().modes;
        const base = baseline as Record<string, boolean>;
        // Turn extras off first (REFERENCE / PRESENTATION lock other modes), then restore what was on.
        for (const [id, on] of Object.entries(now)) if (on && !base[id]) api.setMode(id, false);
        for (const [id, on] of Object.entries(base)) if (on && !api.state().modes[id]) api.setMode(id, true);
        api.setHud(true);
        if (paused !== null) api.setPaused(paused as boolean);
      },
      [this.baseline, this.baselinePaused] as const,
    );
    await page.evaluate(
      ([chapter, preset, modes, js]) => {
        const api = window.__atlas!;
        if (chapter) api.goToChapter(chapter, { instant: true });
        if (preset) api.setPreset(preset, { instant: true });
        for (const [id, on] of Object.entries((modes ?? {}) as Record<string, boolean>)) api.setMode(id, on);
        if (js) new Function(js)();
      },
      [spec.chapter ?? null, spec.preset ?? null, spec.modes ?? null, spec.js ?? null] as const,
    );
    if (spec.hud === false) await page.evaluate(() => window.__atlas!.setHud(false));
    await this.settleRun();
    await page.waitForTimeout(spec.wait ?? 900);
  }

  /** A chapter auto-run (the playhead easing to the chapter time) must be over before any shot. */
  async settleRun(): Promise<void> {
    await this.page.waitForFunction(() => !window.__atlas!.state().running, null, { timeout: 30_000 });
  }

  jsSize(): { files: number; gzKB: number } {
    let bytes = 0;
    for (const f of this.jsFiles) {
      const file = join(DIST, f);
      if (existsSync(file)) bytes += gzipSync(readFileSync(file), { level: 9 }).length;
    }
    return { files: this.jsFiles.size, gzKB: Math.round((bytes / 1024) * 10) / 10 };
  }

  async close(): Promise<void> {
    await this.page.context().close();
  }
}

/* ------------------------------------------------------------------ */
/* Shots                                                               */
/* ------------------------------------------------------------------ */

async function defaultShots(s: Session): Promise<Record<string, ShotSpec>> {
  const [chapters, presets, modes] = await Promise.all([
    s.ev(() => window.__atlas!.chapters()),
    s.ev(() => window.__atlas!.presets()),
    s.ev(() => window.__atlas!.modes()),
  ]);
  const shots: Record<string, ShotSpec> = {};
  chapters.forEach((id, i) => {
    shots[`ch${String(i + 1).padStart(2, '0')}-${id}`] = { chapter: id, wait: 1000 };
  });
  const first = chapters[0]!;
  for (const m of modes) {
    if (m === 'presentation') continue;
    const on = !s.baseline[m];
    shots[on ? `mode-${m}` : `mode-${m}-off`] = { chapter: first, modes: { [m]: on }, wait: m === 'reference' || m === 'exploded' ? 2400 : 1000 };
  }
  for (const p of presets) if (!chapters.includes(p) && !/^\d+$/.test(p)) shots[`preset-${p}`] = { chapter: first, preset: p, wait: 1600 };
  shots['hero-clean'] = { chapter: first, hud: false, wait: 1000 };
  return shots;
}

function fmt(n: number | undefined, digits = 0): string {
  return n === undefined ? '-' : n.toFixed(digits);
}

async function runShots(s: Session, o: Options, out: string, report: RunReport): Promise<void> {
  const shots = o.shotsFile ? (JSON.parse(readFileSync(o.shotsFile, 'utf8')) as Record<string, ShotSpec>) : await defaultShots(s);
  const names = o.names.length ? o.names : Object.keys(shots);
  mkdirSync(out, { recursive: true });
  for (const n of names) {
    const spec = shots[n];
    if (!spec) throw new Error(`no such shot "${n}" (have: ${Object.keys(shots).join(', ')})`);
    await s.apply(spec);
    if (o.perf) await s.page.waitForTimeout(2000);
    await s.page.screenshot({ path: join(out, `${n}${o.suffix}.png`) });
    const st = await s.stats();
    report.shots[n] = st;
    console.log(
      `  ${n.padEnd(30)} calls=${fmt(st.calls).padStart(4)} tris=${fmt(st.triangles).padStart(8)} fps=${fmt(st.fps).padStart(3)}` +
        (st.features !== undefined ? ` features=${fmt(st.features)} zoom=${fmt(st.zoom, 1)}` : '') +
        (o.perf ? ` buf=${st.buffer?.join('x')} gpu=${st.gpu ?? '-'}` : ''),
    );
  }
  console.log(`  shots -> ${out}`);
}

/* ------------------------------------------------------------------ */
/* Beats                                                               */
/* ------------------------------------------------------------------ */

/** One screenshot per presentation beat: `beat-<chapter id>-<n>.png` (n = 1-based position inside the chapter). */
async function runBeats(s: Session, o: Options, out: string, report: RunReport): Promise<void> {
  const beats = await s.ev(() => window.__atlas!.beats());
  mkdirSync(out, { recursive: true });
  if (beats.length === 0) console.log('  (this topic has no presentation beats)');
  for (const [i, b] of beats.entries()) {
    const name = `beat-${b.chapter}-${b.index + 1}`;
    await s.apply({ wait: 300 });
    await s.page.evaluate((n) => window.__atlas!.goToBeat(n, { instant: true }), i);
    // The camera snaps; the map needs a few frames for tiles, leader placards and the caption.
    await s.page.waitForTimeout(o.perf ? 2400 : 1500);
    const st = await s.state();
    const landed = st.presentation?.chapter === b.chapter && st.presentation.beat === b.index && st.hud === false;
    if (!landed) report.beatFailures.push(`${name}: state.presentation=${JSON.stringify(st.presentation)} hud=${st.hud}`);
    // Labels for the beat's highlighted ids: a missing one means no anchor on screen (or its layer is off), usually a content issue.
    const missing = await s.page.evaluate(() => {
      const shown = new Set(
        [...document.querySelectorAll<HTMLElement>('.ts-co')].filter((e) => e.dataset.hidden === 'false' && e.style.opacity === '1').map((e) => e.dataset.id),
      );
      const highlight = (window.__atlas!.state() as { highlight?: string[] }).highlight ?? [];
      return highlight.filter((id) => !shown.has(id));
    });
    if (missing.length) report.beatNotes.push(`${name}: no label for ${missing.join(', ')}`);
    await s.page.screenshot({ path: join(out, `${name}${o.suffix}.png`) });
    console.log(`  ${name.padEnd(36)} ${landed ? 'OK' : 'FAIL'}${missing.length ? `  (no label: ${missing.join(', ')})` : ''}`);
  }
  await s.apply({ wait: 300 });
  console.log(`  beats -> ${out} (${beats.length})`);
}

/* ------------------------------------------------------------------ */
/* Keys                                                                */
/* ------------------------------------------------------------------ */

async function runKeys(s: Session, o: Options, report: RunReport): Promise<void> {
  const { page } = s;
  const keymap = await s.ev(() => window.__atlas!.keymap());
  const press = (k: string) => page.keyboard.press(k === ' ' ? 'Space' : k);
  const pressed = (attr: 'preset' | 'mode', name: string) =>
    page.evaluate(([a, n]) => document.querySelector(`[data-${a}="${n}"]`)?.getAttribute('aria-pressed') ?? null, [attr, name] as const);
  const record = (r: KeyResult) => {
    report.keys.push(r);
    console.log(`  key ${JSON.stringify(r.key).padEnd(13)} ${r.type.padEnd(8)} ${r.name.padEnd(14)} ${r.ok ? 'OK' : 'FAIL'}${r.note ? '  ' + r.note : ''}`);
  };

  const firstChapter = (await s.ev(() => window.__atlas!.chapters()))[0];
  await s.apply({ chapter: firstChapter, wait: 800 });

  for (const k of keymap) {
    const base = { key: k.key, type: k.type, name: k.name };
    let ok = true;
    let note = '';
    if (k.type !== 'preset' && k.type !== 'chapter') {
      // A preset can turn a mode on (REF. = REFERENCE), which locks others: start every mode check from the load state.
      await s.apply({ chapter: firstChapter, wait: 600 });
    }
    if (k.type === 'preset') {
      await press(k.key);
      await page.waitForTimeout(250);
      const st = await s.state();
      const btn = await pressed('preset', k.name);
      ok = st.preset === k.name && btn === 'true';
      if (!ok) note = `state.preset=${st.preset} button=${btn}`;
      await page.waitForTimeout(1800); // camera flight
    } else if (k.type === 'mode') {
      const disabled = await page.evaluate((n) => (document.querySelector(`[data-mode="${n}"]`) as HTMLButtonElement | null)?.disabled ?? null, k.name);
      if (disabled !== false) {
        record({ ...base, ok: disabled !== null, note: disabled === null ? 'no button for this mode' : 'button disabled (skipped)' });
        continue;
      }
      const before = (await s.state()).modes[k.name]!;
      await press(k.key);
      await page.waitForTimeout(300);
      const st = await s.state();
      const btn = await pressed('mode', k.name);
      ok = st.modes[k.name] === !before && btn === String(!before);
      if (!ok) note = `state.modes=${st.modes[k.name]} (was ${before}) button=${btn}`;
      await page.waitForTimeout(k.name === 'reference' || k.name === 'exploded' ? 1800 : 200);
      await press(k.key);
      await page.waitForTimeout(k.name === 'reference' || k.name === 'exploded' ? 2400 : 400);
      const back = (await s.state()).modes[k.name];
      if (back !== before) {
        ok = false;
        note += ` not restored (${back})`;
      }
    } else if (k.type === 'pause') {
      const before = (await s.state()).paused;
      await press(k.key);
      await page.waitForTimeout(250);
      ok = (await s.state()).paused === !before;
      if (!ok) note = 'SPACE did not toggle paused';
      await press(k.key);
      await page.waitForTimeout(250);
    } else if (k.type === 'hud') {
      await press(k.key);
      await page.waitForTimeout(900);
      const hidden = !(await s.state()).hud;
      const restoreShown = await page.evaluate(() => {
        const el = document.querySelector('.atlas-hud-restore');
        if (!el) return false;
        const cs = getComputedStyle(el);
        return cs.visibility !== 'hidden' && Number.parseFloat(cs.opacity) > 0.5;
      });
      ok = hidden && restoreShown;
      if (!ok) note = `hud hidden=${hidden} restore-chip=${restoreShown}`;
      await press(k.key);
      await page.waitForTimeout(500);
      if (!(await s.state()).hud) {
        ok = false;
        note += ' H did not restore';
      }
    } else if (k.type === 'escape') {
      await s.ev(() => window.__atlas!.setHud(false));
      await page.waitForTimeout(300);
      await press(k.key);
      await page.waitForTimeout(500);
      ok = (await s.state()).hud;
      if (!ok) note = 'ESC did not restore the HUD';
    } else if (k.type === 'chapter') {
      const chapters = await s.ev(() => window.__atlas!.chapters());
      const here = chapters.indexOf((await s.state()).chapter ?? '');
      const forward = k.key === 'ArrowRight';
      const target = chapters[here + (forward ? 1 : -1)];
      if (target === undefined) {
        record({ ...base, ok: true, note: 'at the end of the chapter list (skipped)' });
        continue;
      }
      await press(k.key);
      await page.waitForTimeout(400);
      const now = (await s.state()).chapter;
      ok = now === target;
      if (!ok) note = `chapter=${now}, expected ${target}`;
      await s.settleRun();
      await press(forward ? 'ArrowLeft' : 'ArrowRight');
      await page.waitForTimeout(600);
      await s.settleRun();
      if ((await s.state()).chapter !== chapters[here]) {
        ok = false;
        note += ' not restored';
      }
    }
    record({ ...base, ok, note });
  }

  // Dragging the stage frees the camera (no preset lit); a preset takes it back.
  const [w, h] = o.size;
  await s.apply({ chapter: firstChapter, wait: 1200 });
  const first = keymap.find((k) => k.type === 'preset');
  if (first) {
    // Light a preset first: a chapter's own view is not a preset (TimeScene has geographic presets only), so "free" must be earned by the drag.
    await page.keyboard.press(first.key);
    await page.waitForTimeout(2400);
    await page.mouse.move(w * 0.5, h * 0.5);
    await page.mouse.down();
    await page.mouse.move(w * 0.5 + 140, h * 0.5 + 30, { steps: 8 });
    await page.mouse.up();
    let free = false;
    // Orbit damping is frame-count based: software GL at ~10 fps takes several seconds to settle before the camera is written back.
    for (let i = 0; i < 64 && !free; i++) {
      await page.waitForTimeout(250);
      free = (await s.state()).preset === null;
    }
    const lit = await page.evaluate(() => document.querySelectorAll('[data-preset][aria-pressed="true"]').length);
    record({ key: 'drag', type: 'camera', name: 'free-camera', ok: free && lit === 0, note: free && lit === 0 ? '' : `preset=${(await s.state()).preset} lit=${lit}` });
    await page.keyboard.press(first.key);
    await page.waitForTimeout(2000);
    const st = await s.state();
    record({ key: first.key, type: 'camera', name: 'preset-after-free', ok: st.preset === first.name, note: st.preset === first.name ? '' : `preset=${st.preset}` });
  }
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

async function runLayout(s: Session, out: string, report: RunReport): Promise<void> {
  const { page } = s;
  const [chapters, presets] = await Promise.all([s.ev(() => window.__atlas!.chapters()), s.ev(() => window.__atlas!.presets())]);
  const extraPresets = presets.filter((p) => !chapters.includes(p) && !/^\d+$/.test(p));
  mkdirSync(out, { recursive: true });
  for (const [w, h] of LAYOUT_SIZES) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(500);
    const issues: string[] = [];
    const check = async (where: string) => {
      for (const i of await hudLayoutIssues(page)) {
        issues.push(`${where}: ${i}`);
        report.layout.push({ size: `${w}x${h}`, where, issues: [i] });
      }
    };
    for (const c of chapters) {
      await s.apply({ chapter: c, wait: 350 });
      await check(c);
    }
    for (const p of extraPresets) {
      await s.apply({ chapter: chapters[0], preset: p, wait: 500 });
      await check(`preset ${p}`);
    }
    await s.apply({ chapter: chapters[0], wait: 800 });
    await page.screenshot({ path: join(out, `layout-${w}x${h}.png`) });
    console.log(`  ${`${w}x${h}`.padEnd(10)} ${issues.length ? issues.length + ' issue(s)' : 'OK'}`);
    for (const i of issues) console.log(`      ${i}`);
  }
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

interface Options {
  topic: string;
  locales: (typeof LOCALES)[number][];
  themes: (typeof THEMES)[number][];
  size: [number, number];
  suffix: string;
  shotsFile?: string;
  keys: boolean;
  layout: boolean;
  beats: boolean;
  perf: boolean;
  gpu: boolean;
  json?: string;
  names: string[];
}

function parse(): Options {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      locale: { type: 'string' },
      theme: { type: 'string' },
      size: { type: 'string', default: '1920x1080' },
      suffix: { type: 'string', default: '' },
      shots: { type: 'string' },
      keys: { type: 'boolean', default: false },
      layout: { type: 'boolean', default: false },
      beats: { type: 'boolean', default: false },
      perf: { type: 'boolean', default: false },
      gpu: { type: 'boolean', default: false },
      json: { type: 'string' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  const [topic, ...names] = positionals;
  if (!topic || values.help) usage();
  return {
    topic,
    locales: pick(values.locale, LOCALES, 'en', 'locale'),
    themes: pick(values.theme, THEMES, 'paper', 'theme'),
    size: parseSize(values.size),
    suffix: values.suffix,
    shotsFile: values.shots,
    keys: values.keys,
    layout: values.layout,
    beats: values.beats,
    perf: values.perf,
    gpu: values.gpu,
    json: values.json,
    names,
  };
}

async function main(): Promise<number> {
  const o = parse();
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('dist/ is missing: run `pnpm build` first (the shoot script serves the built site).');
    return 1;
  }
  if (!existsSync(join(DIST, o.locales[0]!, 'topics', o.topic, 'index.html'))) {
    console.error(`dist/ has no page for topic "${o.topic}" (rebuild with \`pnpm build\`, or check the id).`);
    return 1;
  }
  const checksOnly = (o.keys || o.layout || o.beats) && o.names.length === 0 && !o.shotsFile;
  const { server, origin } = await serveDist();
  const browser = await chromium.launch({ headless: true, args: o.gpu ? HARDWARE_GL : SOFTWARE_GL });
  const reports: RunReport[] = [];
  let failed = false;
  try {
    for (const locale of o.locales) {
      for (const theme of o.themes) {
        const out = join(ROOT, 'shots', o.topic, `${locale}-${theme}`);
        console.log(`\n== ${o.topic} · ${locale} · ${theme} · ${o.size.join('x')}`);
        const s = await Session.open(browser, origin, o.topic, locale, theme, o.size);
        const report: RunReport = { topic: o.topic, locale, theme, size: o.size.join('x'), shots: {}, keys: [], layout: [], beatFailures: [], beatNotes: [], js: { files: 0, gzKB: 0 }, logs: [] };
        try {
          if (!checksOnly) await runShots(s, o, out, report);
          if (o.beats) {
            console.log('  -- beats');
            await runBeats(s, o, out, report);
          }
          if (o.keys) {
            console.log('  -- keys');
            await runKeys(s, o, report);
          }
          if (o.layout) {
            console.log('  -- layout');
            await runLayout(s, out, report);
            await s.page.setViewportSize({ width: o.size[0], height: o.size[1] });
          }
        } finally {
          report.logs = s.logs;
          report.js = s.jsSize();
          await s.close();
        }
        const keyFails = report.keys.filter((k) => !k.ok).length;
        const bad = report.logs.filter((l) => l.type !== 'warning');
        console.log(`  page JS: ${report.js.gzKB} KB gz in ${report.js.files} files`);
        console.log(report.logs.length ? '  console:' : '  console: clean');
        for (const l of report.logs) console.log(`    [${l.type}] ${l.text.slice(0, 300)}`);
        if (o.keys) console.log(`  key failures: ${keyFails}`);
        if (o.layout) console.log(`  layout issues: ${report.layout.length}`);
        if (o.beats) console.log(`  beat failures: ${report.beatFailures.length}`);
        if (keyFails || report.layout.length || report.beatFailures.length || bad.length) failed = true;
        reports.push(report);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  if (o.json) {
    mkdirSync(dirname(resolve(o.json)), { recursive: true });
    writeFileSync(o.json, JSON.stringify(reports, null, 2));
    console.log(`\nreport -> ${o.json}`);
  }
  console.log(failed ? '\nFAILED' : '\nOK');
  return failed ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);

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
 *   pnpm shoot sample-time --layout                  # HUD overlap / overflow / a squeezed stage at eight sizes (incl. 1600x900, 1024x768), after a chapter change and opened from a beat link
 *   pnpm shoot ww2 --beats                           # every presentation beat -> shots/<topic>/<locale>-<theme>/beat-<chapter>-<n>.png
 *   pnpm shoot sample-space --perf --json out.json   # renderer numbers per shot
 *   pnpm shoot fractions --tasks                     # MathScene: every check-pool task (start, a planned wrong answer, solved) and every practice question + the summary
 *
 * `--beats` checks that the energy bars on show add up to 100 % (SpaceScene `energy-bars`), that every `hz`-paced animation plays at its bound frequency (SpaceScene, docs/40 §4.3) and that every try-it `tint` is drawn at its bound blend (SpaceScene, docs/41 E-S1), and shoots a looping exercise beat (SpaceScene exercise mode) again held at its start and end keys
 * (`beat-<chapter>-<n>-start.png` / `-end.png`); SpaceScene: it opens every beat again from its link (`?ch=<chapter>&b=<n>`, a page of its own) and fails a beat whose
 * scene (try-it values, view, layers, camera, hidden parts …) differs from the presentation's, or whose runs are not at their end; it also lists the ids each chapter's own state asks to label (TimeScene `highlight`, SpaceScene `labels`) that have no label on screen at the chapter camera (listed, not failed).
 * `--locale` and `--theme` take a value, a comma list, or `all` (default: en, paper).
 * `--keys` / `--layout` / `--beats` / `--tasks` replace the shot run unless shot names or `--shots` are given.
 * `--keys` also checks `,` / `.` (beats outside the presentation, SpaceScene's chapter axis) where the engine registers them.
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
import { parse as parseYaml } from 'yaml';
import { chromium, type Browser, type Page } from '@playwright/test';
import { hudLayoutIssues, LAYOUT_SIZES } from '../tests-e2e/hud-layout';
import { capacity, fillBounds, fillShapeForPrimitive, levelForVolume } from '../src/engines/space-scene/lib/fill';
import { bendAxisIndex, bendCurve } from '../src/engines/space-scene/lib/bend';
import { solveAirfoil } from '../src/engines/space-scene/lib/sim/airfoil';
import { airfoilInputKey } from '../src/engines/space-scene/lib/sim/airfoil-cache';
import { animationHz, shiftEntry, tintLevel } from '../src/engines/space-scene/lib/sim/bind';
import type { PartsFile } from '../src/engines/space-scene/schema';
import type { MechanismReading } from '../src/engines/space-scene/bridge';
import { LINK_ROLES, PORT_ROLES, ROLE_ENDPOINTS } from '../src/engines/space-scene/lib/mechanism';
import { dragVerdict, type DragSample, type DragVerdict } from './lib/drag-settle';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

/** Headless GPU / SwiftShader chatter that is expected and harmless (same list as tests-e2e/smoke.spec.ts). */
const IGNORED = [/Service Worker registration blocked/i, /GPU stall/i, /swiftshader/i, /GL Driver Message/i, /WebGL.*(deprecated|fallback)/i, /GroupMarkerNotSet/i];

const SOFTWARE_GL = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const HARDWARE_GL = ['--enable-gpu', '--ignore-gpu-blocklist', ...(process.platform === 'darwin' ? ['--use-angle=metal'] : [])];

const LOCALES = ['en', 'zh'] as const;
const THEMES = ['paper', 'cinema'] as const;
/** Planted feet may slide this far (cm) in a standing exercise still before `--beats` notes it. */
const FOOT_SLIP_CM = 3;

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
  /** SpaceScene standing exercise: how far the planted feet still slide (cm). */
  footSlip?: number;
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
  /** Beats whose labelled ids (TimeScene `highlight`, SpaceScene `labels`) have no label on screen (content issues, not failures). */
  beatNotes: string[];
  /** Chapters whose own `state.highlight` / `state.labels` has ids with no label on screen at the chapter camera (content issues, not failures). */
  chapterNotes: string[];
  /** Check tasks whose solution did not end done (MathScene `--tasks`). */
  taskFailures: string[];
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
      '                          [--shots file.json] [--keys] [--layout] [--beats] [--tasks] [--perf] [--gpu] [--json out.json] [names...]',
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
    readonly topic: string,
    readonly locale: string,
    readonly theme: string,
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
    const s = new Session(page, origin, topic, locale, theme);
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
    await s.reopen();
    const st = await page.evaluate(() => window.__atlas!.state());
    s.baseline = st.modes;
    s.baselinePaused = st.paused;
    return s;
  }

  /**
   * Load a page of the site in this session's tab (`path` from the origin)
   * and wait, 60 s at most, for its stage. A full navigation in the same tab
   * gives a fresh document and store and releases the previous WebGL
   * context, so a scene left behind (always-on flows keep drawing while
   * paused) never competes with the one being checked.
   */
  async load(path: string, what: string): Promise<void> {
    const { page } = this;
    await page.goto(`${this.origin}${path}`);
    await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 60_000 });
    const ready = await page.evaluate(() =>
      Promise.race([window.__atlas!.ready, new Promise<boolean>((resolve) => window.setTimeout(() => resolve(false), 60_000))]),
    );
    if (!ready) throw new Error(`${what}: stage never became ready`);
  }

  /** The topic page as the session opened it (after link checks have navigated the tab away): loaded, in the session's theme. */
  async reopen(): Promise<void> {
    await this.load(`/${this.locale}/topics/${this.topic}/`, this.topic);
    await this.page.evaluate((t) => window.__atlas!.setTheme(t as 'paper' | 'cinema'), this.theme);
    await this.page.waitForTimeout(800);
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
    await page.waitForTimeout(spec.wait ?? 900);
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

/**
 * Ids the scene asks to label that have no label on screen. TimeScene: the
 * store's `highlight` against the map placards (`.ts-co`); SpaceScene: the
 * leader labels' list (`data-want` on `.space-leaders`: the beat's `labels`
 * in the presentation, else the chapter's; nothing listed = nothing to check)
 * against the placards (`.space-co[data-id]`, `group:<id>` for a group). A
 * placard counts from opacity 0.85: the stage renders on demand, so a fade
 * can rest one step short of 1 (0.9) until the next frame.
 */
function unlabelled(s: Session): Promise<string[]> {
  return s.page.evaluate(() => {
    if (document.querySelector('.atlas-scene[data-engine="space-scene"]')) {
      const want = (document.querySelector<SVGElement>('.space-leaders')?.dataset.want ?? '').split(',').filter(Boolean);
      const shown = new Set(
        [...document.querySelectorAll<SVGElement>('.space-co[data-id]')].filter((e) => Number(e.style.opacity || 0) > 0.85).map((e) => e.dataset.id),
      );
      return want.filter((id) => !shown.has(id));
    }
    const shown = new Set(
      [...document.querySelectorAll<HTMLElement>('.ts-co')].filter((e) => e.dataset.hidden === 'false' && e.style.opacity === '1').map((e) => e.dataset.id),
    );
    const highlight = (window.__atlas!.state() as { highlight?: string[] }).highlight ?? [];
    return highlight.filter((id) => !shown.has(id));
  });
}

/** The authored beat's rendered scene, including discrete monthly maps. */
type BeatScene = Record<string, unknown> & { unfinished: string[] };
function beatSceneOf(page: Page): Promise<BeatScene | null> {
  return page.evaluate(() => {
    const st = window.__atlas!.state() as unknown as Record<string, unknown>;
    const climate = (window.__atlas!.engine as unknown as {
      climatology?(): { month: number; renderedMonth: number; authoredMonth: number; periodId: string; layers?: Record<string, { status: string }> };
    }).climatology?.();
    const shownLayers = Array.isArray(st.layers) ? (st.layers as string[]) : [];
    if (climate) return {
      notReady: Object.entries(climate.layers ?? {}).filter(([id, l]) => shownLayers.includes(id) && l.status !== 'ready').map(([id, l]) => `${id}:${l.status}`),
      ...Object.fromEntries(['chapter', 'beat', 'month', 'layers', 'highlight', 'camera'].map(k => [k, st[k] ?? null])),
      renderedMonth: climate.renderedMonth,
      authoredMonth: climate.authoredMonth,
      periodId: climate.periodId,
      unfinished: [],
    };
    if (!document.querySelector('.atlas-scene[data-engine="space-scene"]')) return null;
    const keys = ['chapter', 'view', 'part', 'explode', 'run', 'cutaway', 'pose', 'hidden', 'ghosted', 'layers', 'exercise', 'tints', 'sites', 'camera'];
    type Run = { t: number; duration: number; playing: boolean };
    const sim = (window.__atlas!.engine as unknown as { sim?(): { values: Record<string, unknown>; timeline: Record<string, Run> } | null }).sim?.() ?? null;
    return {
      ...Object.fromEntries(keys.map((k) => [k, st[k] ?? null])),
      sim: sim?.values ?? null,
      // Orbit sims (docs/44): the shared snapshot and its outputs, rounded to 1e-6. Snapshot ids differ between loads, and what the
      // stage drew (`rendered`, fades included) is per frame: orbitIssues checks it against the snapshot once the frame lands.
      ...(() => {
        const e = window.__atlas!.engine as unknown as { orbit?(): Record<string, unknown> | null; sim?(): unknown };
        const orbit = e.orbit?.();
        if (!orbit) return {};
        const normalize = (v: unknown): unknown =>
          typeof v === 'number'
            ? Math.round(v * 1e6) / 1e6
            : Array.isArray(v)
              ? v.map(normalize)
              : v && typeof v === 'object'
                ? Object.fromEntries(Object.entries(v).filter(([k]) => k !== 'snapshotId' && k !== 'rendered').map(([k, x]) => [k, normalize(x)]))
                : v;
        return { orbit: normalize(orbit), orbitOutputs: normalize(e.sim?.()) };
      })(),
      airfoil: (()=>{const a=(window.__atlas!.engine as unknown as {airfoil?():{inputKey:string;mode:string;cl:number;lift:number;plot:unknown}}).airfoil?.();return a?{inputKey:a.inputKey,mode:a.mode,cl:a.cl,lift:a.lift,plot:a.plot}:null;})(),
      unfinished: Object.entries(sim?.timeline ?? {})
        .filter(([, r]) => r.playing || r.t !== r.duration)
        .map(([id]) => id),
    };
  });
}

/** Every filled surface uses the model's current volume and agrees with its height reading. */
async function fillIssues(s: Session): Promise<string[]> {
  const path = join(ROOT, 'src/content/topics', s.topic, 'data/parts.json');
  if (!existsSync(path)) return [];
  const file = JSON.parse(readFileSync(path, 'utf8')) as PartsFile;
  if (!file.sim?.bind.some((b) => 'part' in b && b.fill)) return [];
  const ids = file.sim.bind.flatMap((b) => ('part' in b && b.fill ? (typeof b.part === 'string' ? [b.part] : b.part) : []));
  const state = await s.page.evaluate((ids) => {
    const e = window.__atlas!.engine as unknown as {
      sim(): { values: Record<string, unknown>; outputs: Record<string, unknown> };
      fill(id: string): { volume: number; level: number; shown: boolean } | null;
    };
    return { sim: e.sim(), fills: Object.fromEntries(ids.map((id) => [id, e.fill(id)])) };
  }, ids);
  const fills = state.fills;
  const issues: string[] = [];
  for (const b of file.sim.bind) {
    if (!('part' in b) || !b.fill) continue;
    const value = b.control ? state.sim.values[b.control] : state.sim.outputs[b.output!];
    if (typeof value !== 'number') continue;
    for (const id of typeof b.part === 'string' ? [b.part] : b.part) {
      const shape = fillShapeForPrimitive(file.parts.find((p) => p.id === id)?.primitive);
      const drawn = fills[id];
      if (!shape || !drawn) { issues.push(`${id}: no fill geometry on stage`); continue; }
      const below = (b.fill.below ?? 0) * b.fill.per;
      const volume = Math.max(0, Math.min(capacity(shape) - below, value * b.fill.per));
      const level = levelForVolume(shape, below + volume);
      if (Math.abs(drawn.level - level) > 0.0005) issues.push(`${id}: liquid level ${drawn.level} differs from model ${level}`);
      if (volume >= capacity(shape) * 0.001 && Math.abs(drawn.volume - volume) > Math.max(1e-10, volume * 0.001)) issues.push(`${id}: drawn volume ${drawn.volume} differs from model ${volume}`);
      const cup = file.sim.matter?.cup;
      if (cup) {
        const pushed = state.sim.values[cup.place] === 'pushed';
        const from = id === cup.liquids.inside ? 'cup:cup-rise' : (id === cup.liquids.basin && !pushed || id === cup.liquids.around && pushed) ? 'cup:basin-level' : null;
        const output = file.sim.outputs.find((o) => (o.from ?? o.id) === from);
        const reading = output ? state.sim.outputs[output.id] : undefined;
        const unit = from === 'cup:cup-rise' ? 1000 : 100;
        if (typeof reading === 'number' && Math.abs(drawn.level - fillBounds(shape).min - reading / unit) > 0.0005) issues.push(`${id}: liquid surface differs from cup reading ${reading}`);
      }
      const pour = file.sim.matter?.pour;
      if (pour && pour.liquids[String(state.sim.values[pour.container])] === id) {
        const output = file.sim.outputs.find((o) => (o.from ?? o.id) === 'pour:level');
        const reading = output ? state.sim.outputs[output.id] : undefined;
        if (typeof reading === 'number' && Math.abs(drawn.level - fillBounds(shape).min - reading / 100) > 0.0005) issues.push(`${id}: drawn level differs from height reading ${reading} cm`);
      }
    }
  }
  return issues;
}

/** Every bent strip on show draws the model's sag / drop (as lib/bend.ts lays it) and keeps its length. */
async function bendIssues(s: Session): Promise<string[]> {
  const path = join(ROOT, 'src/content/topics', s.topic, 'data/parts.json');
  if (!existsSync(path)) return [];
  const file = JSON.parse(readFileSync(path, 'utf8')) as PartsFile;
  const binds = (file.sim?.bind ?? []).filter((b) => 'part' in b && b.bend);
  if (binds.length === 0) return [];
  const ids = binds.flatMap((b) => ('part' in b ? (typeof b.part === 'string' ? [b.part] : b.part) : []));
  const state = await s.page.evaluate((ids) => {
    const e = window.__atlas!.engine as unknown as {
      sim(): { values: Record<string, unknown>; outputs: Record<string, unknown> };
      bend(id: string): { value: number; length: number; shown: boolean } | null;
    };
    return { sim: e.sim(), bends: Object.fromEntries(ids.map((id) => [id, e.bend(id)])) };
  }, ids);
  const issues: string[] = [];
  for (const b of binds) {
    if (!('part' in b) || !b.bend) continue;
    const bd = b.bend;
    const value = b.control ? state.sim.values[b.control] : state.sim.outputs[b.output!];
    const axis = bendAxisIndex(bd.axis);
    if (typeof value !== 'number' || !axis) continue;
    for (const id of typeof b.part === 'string' ? [b.part] : b.part) {
      const drawn = state.bends[id];
      const p = file.parts.find((x) => x.id === id)?.primitive;
      const length = p && 'size' in p ? (p.size?.[axis.index] ?? 0) : 0;
      if (!drawn) { issues.push(`${id}: no bent strip on stage`); continue; }
      if (!drawn.shown) continue;
      const shape = { mode: bd.mode, length, ...(bd.span !== undefined ? { span: bd.span } : {}), ...(bd.clamp !== undefined ? { clamp: bd.clamp } : {}), ...(bd.reach !== undefined ? { reach: bd.reach } : {}) };
      const want = bendCurve(shape, value * (bd.per ?? 1)).value;
      if (Math.abs(drawn.value - want) > 0.0005) issues.push(`${id}: drawn bend ${drawn.value.toFixed(4)} m differs from the model ${want.toFixed(4)} m`);
      if (Math.abs(drawn.length - length) > length * 0.005) issues.push(`${id}: bent length ${drawn.length.toFixed(4)} m, not ${length} m`);
    }
  }
  return issues;
}

/** Orbit bindings: compare the actual world matrix / illumination uniform with the shared physical snapshot. */
async function orbitIssues(s: Session): Promise<string[]> {
  const path = join(ROOT, 'src/content/topics', s.topic, 'data/parts.json');
  if (!existsSync(path)) return [];
  const file = JSON.parse(readFileSync(path, 'utf8')) as PartsFile;
  if (!file.sim?.orbitRotation) return [];
  await s.page.waitForFunction(() => {
    const o = (window.__atlas!.engine as unknown as { orbit(): any }).orbit();
    return !!o?.rendered && o.snapshotId === o.rendered.snapshotId;
  });
  const o = await s.page.evaluate(() => (window.__atlas!.engine as unknown as { orbit(): any }).orbit());
  const issues: string[] = [];
  const cfg = file.sim.orbitRotation;
  for (const b of file.sim.bind) {
    if (!('part' in b)) continue;
    for (const id of Array.isArray(b.part) ? b.part : [b.part]) {
      const got = o.rendered.parts[id];
      if (!got) {
        issues.push(`${id}: no actual rendered matrix`);
        continue;
      }
      if (b.bodyTransform?.attachment === 'centre') {
        const body = b.bodyTransform.body;
        if (got.position.some((v: number, j: number) => Math.abs(v - o.display.centres[body][j]) > 1e-6))
          issues.push(`${id}: rendered position differs from display snapshot`);
        const q = o.physical.bodies[body].quaternion;
        if (Math.abs(Math.abs(got.quaternion.reduce((v: number, x: number, j: number) => v + x * q[j], 0)) - 1) > 1e-6)
          issues.push(`${id}: rendered quaternion differs`);
        if (b.bodyTransform.scaleWithRadius !== false && got.scale.some((v: number) => Math.abs(v - o.display.radii[body]) > 1e-8))
          issues.push(`${id}: rendered radius differs`);
      }
      if (b.solarIllumination) {
        const body = b.solarIllumination.body;
        if (o.rendered.solarDirections[body]?.some((v: number, j: number) => Math.abs(v - o.physical.solarDirections[body][j]) > 1e-9))
          issues.push(`${id}: solar uniform differs`);
      }
    }
  }
  if (o.scale === 'true-scale' && Math.abs(o.display.radii.earth - cfg.bodies[1].radiusKm * cfg.display.trueScaleMPerKm) > 1e-10)
    issues.push('true scale radius differs');
  if (o.panel.kind === 'phase' && !o.panel.northUp) issues.push('phase window is not north-up');
  if (
    o.panel.shadowFrame &&
    Math.abs(o.panel.shadowFrame.radii.moon / o.panel.shadowFrame.radii.earth - cfg.bodies[2].radiusKm / cfg.bodies[1].radiusKm) > 1e-10
  )
    issues.push('shadow frame does not use one scale');
  return issues;
}

/**
 * Every animation an `hz` binding paces (docs/40 §4.3) plays at the bound
 * frequency now: (output − origin) × per, within 1 % (beats and beat links
 * jump to it; a stage that has not drawn the animation yet is not checked).
 */
async function hzIssues(s: Session): Promise<string[]> {
  const path = join(ROOT, 'src/content/topics', s.topic, 'data/parts.json');
  if (!existsSync(path)) return [];
  const file = JSON.parse(readFileSync(path, 'utf8')) as PartsFile;
  const binds = (file.sim?.bind ?? []).filter((b) => 'animation' in b && b.hz && b.output);
  if (binds.length === 0) return [];
  const ids = binds.flatMap((b) => ('animation' in b ? (typeof b.animation === 'string' ? [b.animation] : b.animation) : []));
  const state = await s.page.evaluate((ids) => {
    const e = window.__atlas!.engine as unknown as {
      sim(): { outputs: Record<string, unknown> };
      animation(id: string): { hz: number; phase: number; on: number } | null;
    };
    return { outputs: e.sim().outputs, animations: Object.fromEntries(ids.map((id) => [id, e.animation(id)])) };
  }, ids);
  const issues: string[] = [];
  for (const b of binds) {
    if (!('animation' in b) || !b.hz) continue;
    const v = state.outputs[b.output!];
    if (typeof v !== 'number') continue;
    const want = animationHz(v, { per: b.hz.per, origin: b.hz.origin ?? 0 });
    for (const id of typeof b.animation === 'string' ? [b.animation] : b.animation) {
      const drawn = state.animations[id];
      if (!drawn) continue;
      if (Math.abs(drawn.hz - want) > Math.max(1e-4, want * 0.01)) issues.push(`${id}: plays at ${drawn.hz} Hz, the model's ${b.output} = ${v} asks for ${want.toFixed(4)} Hz`);
    }
  }
  return issues;
}

/**
 * Every part a try-it `tint` binding colours (docs/41 E-S1: a cup's pale
 * seedlings) is drawn at the bound blend now — (value ÷ full, through its
 * curve) × max, within 0.01 — the last binding on a part winning, as on the
 * stage (beats and beat links jump to it; a part not on stage is not checked).
 */
async function tintIssues(s: Session): Promise<string[]> {
  const path = join(ROOT, 'src/content/topics', s.topic, 'data/parts.json');
  if (!existsSync(path)) return [];
  const file = JSON.parse(readFileSync(path, 'utf8')) as PartsFile;
  const binds = (file.sim?.bind ?? []).filter((b) => 'part' in b && b.tint);
  if (binds.length === 0) return [];
  const ids = [...new Set(binds.flatMap((b) => ('part' in b ? (typeof b.part === 'string' ? [b.part] : b.part) : [])))];
  const state = await s.page.evaluate((ids) => {
    const e = window.__atlas!.engine as unknown as {
      sim(): { values: Record<string, unknown>; outputs: Record<string, unknown> };
      tint(id: string): { color: string; level: number } | null;
    };
    return { sim: e.sim(), tints: Object.fromEntries(ids.map((id) => [id, e.tint(id)])) };
  }, ids);
  const want = new Map<string, { level: number; from: string }>();
  for (const b of binds) {
    if (!('part' in b) || !b.tint) continue;
    const v = b.control ? state.sim.values[b.control] : state.sim.outputs[b.output!];
    const n = typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : 0;
    const level = tintLevel(n, { full: b.tint.full, curve: b.tint.curve ?? 'linear', max: b.tint.max ?? 0.55 });
    for (const id of typeof b.part === 'string' ? [b.part] : b.part) want.set(id, { level, from: `${b.control ?? b.output} = ${JSON.stringify(v)}` });
  }
  const issues: string[] = [];
  for (const [id, w] of want) {
    const drawn = state.tints[id];
    if (!drawn) continue;
    if (Math.abs(drawn.level - w.level) > 0.01) issues.push(`${id}: tinted ${drawn.level}, the binding (${w.from}) asks for ${w.level.toFixed(3)}`);
  }
  return issues;
}

/**
 * Every shifted part (docs/38 §4.3) where the model puts it: its drawn offset
 * equals the model's `slots` value (± 1 mm), and a part the model hides is
 * not drawn (one it shows is, unless its layer is off or the scene hides it).
 */
async function shiftIssues(s: Session): Promise<string[]> {
  const path = join(ROOT, 'src/content/topics', s.topic, 'data/parts.json');
  if (!existsSync(path)) return [];
  const file = JSON.parse(readFileSync(path, 'utf8')) as PartsFile;
  const binds = (file.sim?.bind ?? []).filter((b) => 'part' in b && b.shift && b.output);
  if (binds.length === 0) return [];
  const ids = binds.flatMap((b) => ('part' in b ? (typeof b.part === 'string' ? [b.part] : b.part) : []));
  const state = await s.page.evaluate((ids) => {
    const e = window.__atlas!.engine as unknown as {
      sim(): { outputs: Record<string, unknown> };
      shift(id: string): { offset: number[]; target: number[]; shown: boolean } | null;
    };
    const st = window.__atlas!.state() as unknown as { layers: string[]; hidden: string[] };
    return { outputs: e.sim().outputs, shifts: Object.fromEntries(ids.map((id) => [id, e.shift(id)])), layers: st.layers, hidden: st.hidden };
  }, ids);
  const groupOf = new Map(file.parts.map((p) => [p.id, p.group]));
  const issues: string[] = [];
  for (const b of binds) {
    if (!('part' in b) || !b.output) continue;
    const v = state.outputs[b.output];
    if (!v || typeof v !== 'object') continue;
    for (const id of typeof b.part === 'string' ? [b.part] : b.part) {
      const want = shiftEntry(v as Record<string, number>, id);
      const drawn = state.shifts[id];
      if (!want) continue;
      if (!drawn) { issues.push(`${id}: no shift on stage`); continue; }
      if (!want.shown) {
        if (drawn.shown) issues.push(`${id}: the model hides it, but it is drawn`);
        continue;
      }
      const off = Math.max(...want.offset.map((x, i) => Math.abs(x - drawn.offset[i]!)));
      if (off > 0.001) issues.push(`${id}: drawn at offset ${drawn.offset.join(', ')}, the model says ${want.offset.map((x) => x.toFixed(4)).join(', ')}`);
      const group = groupOf.get(id);
      const visible = (group === undefined || state.layers.includes(group)) && !state.hidden.includes(id);
      if (visible && !drawn.shown) issues.push(`${id}: the model shows it, but it is not drawn`);
    }
  }
  return issues;
}

/** Rigid drawn endpoints, valve states and closed-path visibility share one frame. */
async function mechanismDrawIssues(s: Session): Promise<string[]> {
  const path = join(ROOT, 'src/content/topics', s.topic, 'data/parts.json');
  if (!existsSync(path)) return [];
  const file = JSON.parse(readFileSync(path, 'utf8')) as PartsFile;
  if (!file.mechanisms?.length) return [];
  const readings = await s.page.evaluate((ids) => {
    const engine = window.__atlas!.engine as unknown as {
      mechanism(id: string): MechanismReading | null;
      flow(id: string): { paths: Record<string, { visible: boolean }> } | null;
    };
    return ids.map(({ id, flows }) => ({
      frame: engine.mechanism(id),
      flows: Object.fromEntries(flows.map((flow) => [flow, engine.flow(flow)])),
    }));
  }, file.mechanisms.map((m) => ({ id: m.id, flows: [...new Set(PORT_ROLES.map((p) => m.ports[p].flow.id))] })));
  const issues: string[] = [];
  const distance = (a: readonly number[], b: readonly number[]) => Math.hypot(...a.map((v, k) => v - b[k]!));
  for (const [index, spec] of file.mechanisms.entries()) {
    const read = readings[index]!, frame = read.frame;
    if (!frame) { issues.push(`${spec.id}: no mechanism frame on stage`); continue; }
    if (!Number.isFinite(frame.thetaRad) || frame.linkResidualM >= 1e-9 || frame.clearanceMarginM <= 0)
      issues.push(`${spec.id}: invalid physical frame or insufficient clearance`);
    if (Math.abs(frame.sunAngleRad + frame.planetAngleRad - 2 * frame.thetaRad) > 1e-10)
      issues.push(`${spec.id}: sun/planet phase does not match the shared orbit`);
    for (const role of LINK_ROLES) {
      const binding = spec.parts[role], drawn = frame.parts[binding.part];
      const pair = ROLE_ENDPOINTS[role];
      if (!drawn?.endpoints || drawn.matrix.length !== 16 || drawn.matrix.some((v) => !Number.isFinite(v))) {
        issues.push(`${binding.part}: no finite drawn matrix/endpoints`); continue;
      }
      const length = distance(binding.restEndpoints[0], binding.restEndpoints[1]);
      if (Math.abs(distance(drawn.endpoints[0]!, drawn.endpoints[1]!) - length) > 1e-9)
        issues.push(`${binding.part}: drawn rod changed length`);
      // Display explode translates both endpoints equally; it cannot change the physical direction.
      const a = frame.points[pair[0]]!, b = frame.points[pair[1]]!;
      for (let axis = 0; axis < 2; axis++)
        if (Math.abs((drawn.endpoints[1]![axis]! - drawn.endpoints[0]![axis]!) - (b[axis]! - a[axis]!)) > 1e-9)
          issues.push(`${binding.part}: drawn endpoints disagree with the physical frame`);
    }
    for (const role of PORT_ROLES) {
      const port = spec.ports[role], key = `${port.flow.id}:${port.flow.path}`;
      const open = frame.pistonDirection === 'down' ? role === 'upperIn' || role === 'lowerOut'
        : frame.pistonDirection === 'up' ? role === 'lowerIn' || role === 'upperOut' : false;
      if (frame.ports[role] !== open || frame.gates[key] !== open)
        issues.push(`${key}: valve and gate disagree with piston direction`);
      if (!open && read.flows[port.flow.id]?.paths[port.flow.path]?.visible)
        issues.push(`${key}: closed port still draws particles`);
    }
  }
  return issues;
}

/** Airfoil beats and their links must agree with the resolved scalar snapshot and current field. */
async function airfoilIssues(s:Session):Promise<string[]> {
  const path=join(ROOT,'src/content/topics',s.topic,'data/parts.json');
  if(!existsSync(path))return [];
  const file=JSON.parse(readFileSync(path,'utf8')) as PartsFile;
  const d=file?.sim?.airfoil;if(!d)return [];
  await s.page.waitForFunction(()=>{const e=window.__atlas!.engine as unknown as {airfoil():{fieldReady:boolean}};return e.airfoil()?.fieldReady;},null,{timeout:30000});
  const reading=await s.page.evaluate(()=>{const e=window.__atlas!.engine as unknown as {sim():{values:Record<string,number|string|boolean>};airfoil():{inputKey:string;mode:string;cl:number;lift:number;pathCount:number;pressureCount:number;pathStatuses:{status:string}[];plot:{current:{x:number;y:number}}}};return {a:e.airfoil(),v:e.sim().values};});
  const want=solveAirfoil(d,reading.v),a=reading.a,out:string[]=[];
  if(a.inputKey!==airfoilInputKey(d,reading.v))out.push('airfoil field inputKey is stale');
  if(a.mode!==want.mode||Math.abs(a.cl-want.cl)>1e-8||Math.abs(a.lift-want.lift)>1e-5)out.push('airfoil mode/Cl/lift differs from resolved inputs');
  if(want.mode==='ideal-attached'&&(a.pathCount!==16||a.pressureCount!==64||a.pathStatuses.some(p=>p.status!=='complete')))out.push('attached airfoil field incomplete');
  if(want.mode!=='ideal-attached'&&(a.pathCount||a.pressureCount))out.push('still/stall retains attached paths or pressure');
  const output=file!.sim!.outputs.find(o=>o.id===d.plot.y),y=output?.from==='lift-n'?want.lift:want.cl;
  if(a.plot.current.x!==want.angle||Math.abs(a.plot.current.y-y)>1e-8)out.push('airfoil plot current point is stale');
  return out;
}

/**
 * Every beat opened from its link (`?ch=<chapter>&b=<n>`) in a fresh document of its own, against the scene the presentation
 * showed: a field that differs, or a run not at its end (links jump to the end), is a beat failure.
 */
async function runBeatLinks(s: Session, beats: { chapter: string; index: number }[], shown: Map<string, BeatScene>, report: RunReport): Promise<void> {
  if (shown.size === 0) return;
  const theme = await s.ev(() => window.__atlas!.state().appliedTheme);
  const path = new URL(s.page.url()).pathname;
  // Each link loads in the session's own tab (Session.load: a fresh document
  // and store, the presentation's WebGL context released); the topic is
  // reopened afterwards for the checks that follow.
  const linked = s.page;
  let same = 0;
  for (const b of beats) {
    const name = `beat-${b.chapter}-${b.index + 1}`;
    const want = shown.get(name);
    if (!want) continue;
    const link = `?ch=${encodeURIComponent(b.chapter)}&b=${b.index + 1}`;
    await s.load(`${path}${link}${theme ? `&theme=${theme}` : ''}`, `${name} (link)`);
    await linked.waitForTimeout(400);
    await settleClimate(linked);
    const got = await beatSceneOf(linked);
    const diffs: string[] = [];
    for (const key of Object.keys(want)) {
      if (key === 'unfinished') continue;
      const a = JSON.stringify(got?.[key] ?? null);
      const e = JSON.stringify(want[key] ?? null);
      if (a !== e) diffs.push(`${key} ${a} (presentation ${e})`);
    }
    if (got && got.unfinished.length) diffs.push(`runs not at their end: ${got.unfinished.join(', ')}`);
    for (const issue of [...(await fillIssues(s)), ...(await bendIssues(s))]) report.beatFailures.push(`${name}: link: ${issue}`);
    for (const issue of await shiftIssues(s)) report.beatFailures.push(`${name}: link: ${issue}`);
    for (const issue of await hzIssues(s)) report.beatFailures.push(`${name}: link: ${issue}`);
    for (const issue of await tintIssues(s)) report.beatFailures.push(`${name}: link: ${issue}`);
    for (const issue of await orbitIssues(s)) report.beatFailures.push(`${name}: link: ${issue}`);
    for (const issue of await mechanismDrawIssues(s)) report.beatFailures.push(`${name}: link: ${issue}`);
    for (const issue of await airfoilIssues(s)) report.beatFailures.push(`${name}: link: ${issue}`);
    if (diffs.length) report.beatFailures.push(`${name}: opened from ${link}: ${diffs.join('; ')}`);
    else same++;
    if (diffs.length) console.log(`  ${`${name} (link)`.padEnd(36)} FAIL  ${diffs.join('; ').slice(0, 300)}`);
  }
  // Orbit sims: a link with `orb-t` opens on the same snapshot as seeking the clock there.
  const orbitFile = join(ROOT, 'src/content/topics', s.topic, 'data/parts.json');
  if (beats.length && existsSync(orbitFile) && (JSON.parse(readFileSync(orbitFile, 'utf8')) as PartsFile).sim?.orbitRotation) {
    const b = beats[0]!;
    const link = `?ch=${encodeURIComponent(b.chapter)}&b=${b.index + 1}`;
    await s.load(`${path}${link}`, 'orbit seek');
    await s.page.evaluate(() => (window.__atlas!.engine as unknown as { orbitSeek(t: number): boolean }).orbitSeek(21600));
    await orbitIssues(s);
    const want = await beatSceneOf(s.page);
    await s.load(`${path}${link}&orb-t=21600`, 'orbit time link');
    await orbitIssues(s);
    const got = await beatSceneOf(s.page);
    if (JSON.stringify(want?.orbit) !== JSON.stringify(got?.orbit)) report.beatFailures.push('orb-t=21600 differs from orbitSeek(21600)');
  }
  await s.reopen();
  console.log(`  beat links: ${same} of ${shown.size} open on the presentation's scene`);
}

/** One screenshot per presentation beat: `beat-<chapter id>-<n>.png` (n = 1-based position inside the chapter). */
async function runBeats(s: Session, o: Options, out: string, report: RunReport): Promise<void> {
  const beats = await s.ev(() => window.__atlas!.beats());
  mkdirSync(out, { recursive: true });
  if (beats.length === 0) console.log('  (this topic has no presentation beats)');
  const shown = new Map<string, BeatScene>();
  for (const [i, b] of beats.entries()) {
    const name = `beat-${b.chapter}-${b.index + 1}`;
    await s.apply({ wait: 300 });
    await s.page.evaluate((n) => window.__atlas!.goToBeat(n, { instant: true }), i);
    // The camera snaps; the map needs a few frames for tiles, leader placards and the caption.
    await s.page.waitForTimeout(o.perf ? 2400 : 1500);
    const st = await s.state();
    const landed = st.presentation?.chapter === b.chapter && st.presentation.beat === b.index && st.hud === false;
    if (!landed) report.beatFailures.push(`${name}: state.presentation=${JSON.stringify(st.presentation)} hud=${st.hud}`);
    // Labels the beat asks for: a missing one means no anchor on screen (or its layer is off), usually a content issue.
    // A placard still fading in is not missing: poll a little longer before listing it (the stage renders on demand).
    let missing = await unlabelled(s);
    for (let t = 0; missing.length && t < 12; t++) {
      await s.page.waitForTimeout(250);
      missing = await unlabelled(s);
    }
    if (missing.length) report.beatNotes.push(`${name}: no label for ${missing.join(', ')}`);
    // A monthly map commits its month on a drawn frame once the rain source has settled (slow under software GL): wait, then judge.
    await settleClimate(s.page);
    // The scene this beat shows (SpaceScene), for its link below.
    const scene = landed ? await beatSceneOf(s.page) : null;
    if (scene) shown.set(name, scene);
    if (scene && 'renderedMonth' in scene && (scene.month !== scene.renderedMonth || scene.month !== scene.authoredMonth))
      report.beatFailures.push(`${name}: authored/store/rendered months disagree: ${scene.authoredMonth}/${scene.month}/${scene.renderedMonth}`);
    if (scene && Array.isArray(scene.notReady) && scene.notReady.length > 0) report.beatFailures.push(`${name}: monthly layers on show not ready: ${scene.notReady.join(', ')}`);
    // Energy bars on show (SpaceScene, docs/31 E-EN6) must add up to 100 %: energy is neither made nor lost.
    const bars = await s.page.evaluate(
      () => (window.__atlas!.engine as unknown as { energyBars?(): Record<string, { potential: number; kinetic: number; lost: number; shown: boolean }> }).energyBars?.() ?? {},
    );
    for (const [id, v] of Object.entries(bars))
      if (v.shown && Math.abs(v.potential + v.kinetic + v.lost - 100) > 0.5) report.beatFailures.push(`${name}: energy bars of ${id} add up to ${v.potential + v.kinetic + v.lost}`);
    for (const issue of [...(await fillIssues(s)), ...(await bendIssues(s))]) report.beatFailures.push(`${name}: ${issue}`);
    for (const issue of await shiftIssues(s)) report.beatFailures.push(`${name}: ${issue}`);
    for (const issue of await hzIssues(s)) report.beatFailures.push(`${name}: ${issue}`);
    for (const issue of await tintIssues(s)) report.beatFailures.push(`${name}: ${issue}`);
    for (const issue of await orbitIssues(s)) report.beatFailures.push(`${name}: ${issue}`);
    for (const issue of await mechanismDrawIssues(s)) report.beatFailures.push(`${name}: ${issue}`);
    for (const issue of await airfoilIssues(s)) report.beatFailures.push(`${name}: ${issue}`);
    await s.page.screenshot({ path: join(out, `${name}${o.suffix}.png`) });
    console.log(`  ${name.padEnd(36)} ${landed ? 'OK' : 'FAIL'}${missing.length ? `  (no label: ${missing.join(', ')})` : ''}`);
    // A looping exercise beat (SpaceScene exercise mode) also gets a still at its start and end keys.
    const exercise = (st as { exercise?: { id: string; phase: string } | null }).exercise;
    if (exercise?.phase === 'loop') {
      for (const phase of ['start', 'end'] as const) {
        const held = await s.page.evaluate(
          (p) => (window.__atlas!.engine as unknown as { exercisePhase?(p: string): boolean }).exercisePhase?.(p) ?? false,
          phase,
        );
        if (!held) {
          report.beatFailures.push(`${name}: could not hold exercise "${exercise.id}" at ${phase}`);
          continue;
        }
        await s.page.waitForTimeout(o.perf ? 2400 : 1500);
        await s.page.screenshot({ path: join(out, `${name}-${phase}${o.suffix}.png`) });
        // A standing exercise keeps its feet planted: how far they still slide (cm), noted past FOOT_SLIP_CM.
        const slip = (await s.stats()).footSlip;
        if (slip !== undefined && slip > FOOT_SLIP_CM) report.beatNotes.push(`${name}-${phase}: feet slide ${slip} cm (${exercise.id})`);
        console.log(`  ${`${name}-${phase}`.padEnd(36)} OK  (exercise ${exercise.id}${slip !== undefined ? `, feet slide ${slip} cm` : ''})`);
      }
    }
  }
  await s.apply({ wait: 300 });
  console.log(`  beats -> ${out} (${beats.length})`);
  await runBeatLinks(s, beats, shown, report);
  await runClimateStates(s, o, out, report);
}

/** Wait (bounded) until a monthly map shows the store's month; a no-op for other scenes. Callers still judge the result. */
function settleClimate(page: Page): Promise<unknown> {
  return page
    .waitForFunction(
      () => {
        const c = (window.__atlas!.engine as unknown as { climatology?(): { month: number; renderedMonth: number } }).climatology?.();
        return !c || c.renderedMonth === c.month;
      },
      null,
      { timeout: 10_000 },
    )
    .catch(() => {});
}

/** Monthly field visual states that a narrative need not explicitly author. */
async function runClimateStates(s: Session, o: Options, out: string, report: RunReport): Promise<void> {
  if (!await s.ev(() => typeof window.__atlas!.engine.climatology === 'function')) return;
  const metadata = parseYaml(readFileSync(join(ROOT, 'src/content/topics', s.topic, 'topic.yaml'), 'utf8')) as { monthlyLayers: { id: string; quantity: 'wind' | 'rain' }[] };
  const definitions = metadata.monthlyLayers;
  const active = await s.ev(() => window.__atlas!.state().layers);
  const primary = Object.fromEntries((['wind', 'rain'] as const).map(quantity => [quantity, (definitions.find(layer => layer.quantity === quantity && active.includes(layer.id)) ?? definitions.find(layer => layer.quantity === quantity))?.id]));
  const shots = [
    { name: 'climate-m01', month: 1, wind: true, rain: true },
    { name: 'climate-m07', month: 7, wind: true, rain: true },
    { name: 'climate-m12', month: 12, wind: true, rain: true },
    { name: 'climate-wind-only', month: 1, wind: true, rain: false },
    { name: 'climate-rain-only', month: 1, wind: false, rain: true },
    { name: 'climate-off', month: 1, wind: false, rain: false },
    { name: 'climate-cell', month: 7, wind: true, rain: true },
  ];
  for (const shot of shots) {
    await s.page.evaluate(x => {
      const api = window.__atlas!;
      api.setMode('presentation', false);
      api.setHud(true);
      const e = api.engine as unknown as {
        setClimatologyMonth(n: number): boolean;
        toggleMonthlyLayer(id: string, on: boolean): void;
        inspectClimateCell(lon: number, lat: number): void;
      };
      e.setClimatologyMonth(x.shot.month);
      for (const layer of x.definitions)
        e.toggleMonthlyLayer(layer.id, layer.id === x.primary[layer.quantity] && x.shot[layer.quantity]);
      if (x.shot.name === 'climate-cell') e.inspectClimateCell(105, 0);
    }, {shot, definitions, primary});
    await settleClimate(s.page);
    await s.page.waitForTimeout(350);
    const state = await beatSceneOf(s.page);
    if (state?.month !== shot.month || state.renderedMonth !== shot.month) report.beatFailures.push(`${shot.name}: month did not commit`);
    if (Array.isArray(state?.notReady) && state.notReady.length > 0) report.beatFailures.push(`${shot.name}: monthly layers on show not ready: ${state.notReady.join(', ')}`);
    await s.page.screenshot({ path: join(out, `${shot.name}${o.suffix}.png`) });
  }
  await s.page.setViewportSize({ width: 390, height: 844 });
  const read = s.page.locator('.atlas-panel__toggle[aria-expanded="false"]');
  if (await read.count()) await read.click();
  const entry = s.page.locator('[data-climatology-phone] summary');
  if (await entry.count()) await entry.click();
  await s.page.screenshot({ path: join(out, `climate-phone-months${o.suffix}.png`) });
  await s.page.setViewportSize({ width: o.size[0], height: o.size[1] });
  await s.reopen();
}

/** Ids each chapter's own state asks to label (TimeScene `highlight`, SpaceScene `labels`) with no label on screen at the chapter camera: listed, never a failure. */
async function runChapterHighlights(s: Session, report: RunReport): Promise<void> {
  const chapters = await s.ev(() => window.__atlas!.chapters());
  for (const c of chapters) {
    await s.apply({ chapter: c, wait: 1200 });
    const missing = await unlabelled(s);
    if (missing.length) report.chapterNotes.push(`${c}: no label for ${missing.join(', ')}`);
  }
  await s.apply({ wait: 300 });
  console.log(report.chapterNotes.length ? `  chapter highlights with no label on screen (${report.chapterNotes.length}):` : '  chapter highlights: all on screen');
  for (const n of report.chapterNotes) console.log(`    ${n}`);
}

/* ------------------------------------------------------------------ */
/* Tasks (MathScene)                                                   */
/* ------------------------------------------------------------------ */

interface TaskRow {
  step: string;
  /** 1-based: the pool task of a step's check, or the practice question. */
  index: number;
  id: string;
  kind: string;
  practice: boolean;
  wrong: string | null;
}
interface TaskNow {
  id: string | null;
  done: boolean;
  phase: string;
  feedback: { tone: string; code: string | null } | null;
}

/** The engine's test hooks (MathScene `SceneControls.test`), typed for the shoot script. */
const engine = (s: Session) => ({
  tasks: () => s.page.evaluate(() => (window.__atlas!.engine as unknown as { tasks(): TaskRow[] }).tasks()),
  task: () => s.page.evaluate(() => (window.__atlas!.engine as unknown as { task(): TaskNow }).task()),
  go: (step: string, index: number) =>
    s.page.evaluate(([st, i]) => (window.__atlas!.engine as unknown as { goToTask(s: string, i: number, o: { instant: boolean }): void }).goToTask(st as string, i as number, { instant: true }), [step, index] as const),
  answer: (code: string) => s.page.evaluate((c) => (window.__atlas!.engine as unknown as { answer(c: string): boolean }).answer(c), code),
  solve: () => s.page.evaluate(() => (window.__atlas!.engine as unknown as { solve(): boolean }).solve()),
  check: async () => {
    // Let the view re-register its commands (Check is disabled until something is answered).
    await s.page.waitForTimeout(80);
    return s.page.evaluate(() => window.__atlas!.runCommand('check'));
  },
});

/** Solve the task on show phase by phase (as a child would), checking each phase. */
async function solveAll(s: Session): Promise<boolean> {
  const e = engine(s);
  for (let i = 0; i < 5; i++) {
    if ((await e.task()).done) return true;
    await e.solve();
    await e.check();
  }
  return (await e.task()).done;
}

/** MathScene: every check-pool task at its start (forced as the step's check), with a planned wrong answer checked, and solved; every practice question; the practice summary. */
async function runTasks(s: Session, out: string, report: RunReport): Promise<void> {
  const e = engine(s);
  if (!(await s.ev(() => typeof (window.__atlas!.engine as { tasks?: unknown }).tasks === 'function'))) {
    console.log('  (this topic has no lesson tasks)');
    return;
  }
  const rows = await e.tasks();
  mkdirSync(out, { recursive: true });
  const shot = async (name: string) => {
    await s.page.waitForTimeout(450);
    // A check that plays on the stage (a net folding up, docs/39 §3.5) is shot once it has settled into its held pose.
    await s.page.waitForFunction(() => !document.querySelector('[data-settling]'), null, { timeout: 4000 }).catch(() => undefined);
    await s.page.screenshot({ path: join(out, `${name}.png`) });
  };
  for (const r of rows.filter((x) => !x.practice)) {
    const base = `task-${r.step}-${r.index}`;
    await s.apply({ wait: 200 });
    await e.go(r.step, r.index);
    await shot(base);
    if (r.wrong) {
      await e.answer(r.wrong);
      await e.check();
      const now = await e.task();
      if (now.feedback?.code !== r.wrong && now.feedback?.tone !== 'near') report.taskFailures.push(`${base}: wrong answer "${r.wrong}" was diagnosed as ${JSON.stringify(now.feedback)}`);
      await shot(`${base}-wrong`);
    }
    const ok = await solveAll(s);
    if (!ok) report.taskFailures.push(`${base}: the solution did not finish the task`);
    await shot(`${base}-solved`);
    console.log(`  ${base.padEnd(44)} ${ok ? 'OK' : 'FAIL'}${r.wrong ? `  (wrong: ${r.wrong})` : ''}`);
  }
  const practice = rows.filter((x) => x.practice);
  for (const [i, r] of practice.entries()) {
    await s.apply({ wait: 200 });
    await e.go(r.step, r.index);
    await shot(`practice-q${r.index}`);
    // Every other question answered with its first planned wrong answer, so the summary shows both kinds of row.
    if (i % 2 === 1 && r.wrong) {
      await e.answer(r.wrong);
      await e.check();
    } else await solveAll(s);
    console.log(`  practice-q${r.index}`.padEnd(46) + ((await e.task()).done ? 'OK' : 'FAIL'));
  }
  if (practice.length) {
    const last = practice.at(-1)!;
    await e.go(last.step, last.index);
    await s.page.locator('.ms-tray__next').click();
    await shot('practice-summary');
    console.log('  practice-summary');
  }
  await s.apply({ wait: 300 });
  console.log(`  tasks -> ${out}`);
}

/* ------------------------------------------------------------------ */
/* Keys                                                                */
/* ------------------------------------------------------------------ */

interface SimInfo {
  values: Record<string, unknown>;
  try: { vary: string; also?: string[] } | null;
  /** Timelines on the stage (docs/30 F2) and the "Run again" count. */
  timeline?: Record<string, { t: number; duration: number; playing: boolean }>;
  replays?: number;
}
const simEngine = (s: Session) => ({
  get: () => s.page.evaluate(() => (window.__atlas!.engine as unknown as { sim(): SimInfo | null }).sim()),
  set: (v: Record<string, unknown>) => s.page.evaluate((x) => (window.__atlas!.engine as unknown as { setSim(v: Record<string, unknown>): boolean }).setSim(x), v),
});

/**
 * A try-it key on the first chapter with a try-it card: `]` then `[` must step
 * the varied control one value on and back (from its first value), `T` must
 * flip the card's first switch and back, and the URL must carry `sim`; `G`
 * must count a "Run again" and set a timeline playing from its start.
 */
async function simKey(s: Session, key: string, name: string): Promise<{ ok: boolean; note: string }> {
  const e = simEngine(s);
  for (const c of await s.ev(() => window.__atlas!.chapters())) {
    await s.apply({ chapter: c, wait: 400 });
    const info = await e.get();
    if (!info?.try) continue;
    const press = async (k: string) => {
      await s.page.keyboard.press(k);
      await s.page.waitForTimeout(250);
      return (await e.get())!.values;
    };
    if (name === 'sim-replay') {
      const on = await s.page.evaluate(() => window.__atlas!.commands().some((x) => x.id === 'sim-replay' && !x.disabled));
      if (!on) continue;
      // Let any run started by the chapter change finish first (a slowed fall takes a few seconds).
      await s.page.evaluate(() => {
        const e = window.__atlas!.engine as unknown as { sim(): SimInfo | null; simSeek(id: string, t: number): boolean };
        for (const [id, p] of Object.entries(e.sim()?.timeline ?? {})) e.simSeek(id, p.duration);
      });
      await s.page.waitForTimeout(200);
      const before = (await e.get())!;
      await s.page.keyboard.press(key);
      await s.page.waitForTimeout(120);
      const after = (await e.get())!;
      const started = Object.entries(after.timeline ?? {}).filter(([, p]) => p.playing && p.t < p.duration);
      const ok = (after.replays ?? 0) === (before.replays ?? 0) + 1 && started.length > 0;
      return { ok, note: `${c}: ${ok ? `running again: ${started.map(([id]) => id).join(', ')}` : `replays ${before.replays} → ${after.replays}, playing ${JSON.stringify(after.timeline)}`}` };
    }
    if (name === 'sim-toggle') {
      const id = (await s.page.evaluate(() => window.__atlas!.commands().find((x) => x.id === 'sim-toggle')?.disabled)) ? null : 'ok';
      if (!id) continue;
      const before = info.values;
      const after = await press(key);
      const changed = Object.keys(before).filter((k) => typeof before[k] === 'boolean' && before[k] !== after[k]);
      const back = await press(key);
      const ok = changed.length === 1 && back[changed[0]!] === before[changed[0]!];
      return { ok, note: ok ? `${c}: ${changed[0]}` : `${c}: T changed ${JSON.stringify(changed)}` };
    }
    const vary = info.try.vary;
    const first = (await s.page.evaluate((v) => {
      const cmds = window.__atlas!.commands();
      return cmds.some((x) => x.id === 'sim-next' && !x.disabled) ? v : null;
    }, vary)) as string | null;
    if (!first) continue;
    // From the control's first value: `]` moves on, `[` comes back.
    await press('[');
    await press('[');
    const v0 = (await e.get())!.values[vary];
    const v1 = (await press(']'))[vary];
    await s.page.waitForTimeout(400);
    const url = await s.page.evaluate(() => location.search);
    const v2 = (await press('['))[vary];
    const ok = v1 !== v0 && v2 === v0 && url.includes('sim=');
    return { ok, note: ok ? `${c}: ${vary} ${String(v0)} → ${String(v1)} → ${String(v2)}` : `${c}: ${vary} ${String(v0)} → ${String(v1)} → ${String(v2)}, url ${url}` };
  }
  return { ok: true, note: 'no chapter with a try-it card (skipped)' };
}

async function runKeys(s: Session, o: Options, report: RunReport): Promise<void> {
  const { page } = s;
  let keymap = await s.ev(() => window.__atlas!.keymap());
  const press = (k: string) => page.keyboard.press(k === ' ' ? 'Space' : k);
  const pressed = (attr: 'preset' | 'mode', name: string) =>
    page.evaluate(([a, n]) => document.querySelector(`[data-${a}="${n}"]`)?.getAttribute('aria-pressed') ?? null, [attr, name] as const);
  // Poll instead of a fixed delay: under SwiftShader a heavy stage (268 k triangles) can hold the main thread for seconds.
  const until = async (ok: () => Promise<boolean>, ms = 8000): Promise<boolean> => {
    const end = Date.now() + ms;
    for (;;) {
      if (await ok()) return true;
      if (Date.now() > end) return false;
      await page.waitForTimeout(200);
    }
  };
  const record = (r: KeyResult) => {
    report.keys.push(r);
    console.log(`  key ${JSON.stringify(r.key).padEnd(13)} ${r.type.padEnd(8)} ${r.name.padEnd(14)} ${r.ok ? 'OK' : 'FAIL'}${r.note ? '  ' + r.note : ''}`);
  };

  // A lesson keeps the child's work in memory (--tasks finished every check): start the key checks from a fresh page.
  if (await s.ev(() => typeof (window.__atlas!.engine as { tasks?: unknown }).tasks === 'function')) {
    await page.reload();
    await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 60_000 });
    await page.evaluate(() => window.__atlas!.ready);
  }
  const firstChapter = (await s.ev(() => window.__atlas!.chapters()))[0];
  await s.apply({ chapter: firstChapter, wait: 800 });
  // A lesson's keys are those of where the checks start (the VIEW group of the last check shot is gone after the reload).
  if (await s.ev(() => typeof (window.__atlas!.engine as { tasks?: unknown }).tasks === 'function')) keymap = await s.ev(() => window.__atlas!.keymap());

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
      ok = await until(async () => (await s.state()).preset === k.name && (await pressed('preset', k.name)) === 'true');
      if (!ok) note = `state.preset=${(await s.state()).preset} button=${await pressed('preset', k.name)}`;
      await page.waitForTimeout(1800); // camera flight
    } else if (k.type === 'mode') {
      const disabled = await page.evaluate((n) => (document.querySelector(`[data-mode="${n}"]`) as HTMLButtonElement | null)?.disabled ?? null, k.name);
      if (disabled !== false) {
        record({ ...base, ok: disabled !== null, note: disabled === null ? 'no button for this mode' : 'button disabled (skipped)' });
        continue;
      }
      const before = (await s.state()).modes[k.name]!;
      await press(k.key);
      ok = await until(async () => (await s.state()).modes[k.name] === !before && (await pressed('mode', k.name)) === String(!before));
      if (!ok) note = `state.modes=${(await s.state()).modes[k.name]} (was ${before}) button=${await pressed('mode', k.name)}`;
      await page.waitForTimeout(k.name === 'reference' || k.name === 'exploded' ? 1800 : 200);
      await press(k.key);
      await until(async () => (await s.state()).modes[k.name] === before);
      const back = (await s.state()).modes[k.name];
      if (back !== before) {
        ok = false;
        note += ` not restored (${back})`;
      }
    } else if (k.type === 'command' && k.name.startsWith('sim-')) {
      // SpaceScene try-it keys: `[` `]` step the chapter's varied control, `T` flips its first switch; read back through the test hooks.
      const res = await simKey(s, k.key, k.name);
      record({ ...base, ok: res.ok, note: res.note });
      continue;
    } else if (k.type === 'command') {
      // A fresh check task for each command (a finished one takes no hint, undo or check); the effect is read from the engine's test hooks.
      const e = engine(s);
      const order = ['check', 'hint', 'undo'];
      const row = (await e.tasks()).filter((r) => !r.practice)[Math.max(0, order.indexOf(k.name))];
      if (!row) {
        record({ ...base, ok: true, note: 'no lesson task (skipped)' });
        continue;
      }
      await e.go(row.step, row.index);
      await page.waitForTimeout(300);
      const now = () => s.ev(() => (window.__atlas!.engine as unknown as { task(): { done: boolean; hints: number; answered: boolean } }).task());
      if (k.name === 'check') {
        // The current phase solved, unchecked: C must accept it (done, or on to the next phase).
        await e.solve();
        await page.waitForTimeout(200);
        await press(k.key);
        await page.waitForTimeout(250);
        const after = await e.task();
        ok = after.done || after.feedback?.tone === 'phase' || after.feedback?.tone === 'correct';
        if (!ok) note = `C: ${JSON.stringify(after.feedback)}`;
      } else if (k.name === 'hint') {
        const before = (await now()).hints;
        await press(k.key);
        await page.waitForTimeout(250);
        ok = (await now()).hints === before + 1;
        if (!ok) note = 'I did not show a hint';
      } else if (k.name === 'undo') {
        await e.solve();
        await page.waitForTimeout(200);
        const before = (await now()).answered;
        await press(k.key);
        await page.waitForTimeout(250);
        ok = before && !(await now()).answered;
        if (!ok) note = 'U did not undo the last move';
      }
    } else if (k.type === 'pause') {
      const before = (await s.state()).paused;
      await press(k.key);
      ok = await until(async () => (await s.state()).paused === !before);
      if (!ok) note = 'SPACE did not toggle paused';
      await press(k.key);
      await until(async () => (await s.state()).paused === before);
    } else if (k.type === 'hud') {
      await press(k.key);
      await page.waitForTimeout(900);
      const hidden = !(await s.state()).hud;
      // The chip fades in (0.35 s); on a heavy stage under software GL the cover-camera flight can hold the main thread past 1 s.
      let restoreShown = false;
      for (let i = 0; i < 20 && !restoreShown; i++) {
        restoreShown = await page.evaluate(() => {
          const el = document.querySelector('.atlas-hud-restore');
          if (!el) return false;
          const cs = getComputedStyle(el);
          return cs.visibility !== 'hidden' && Number.parseFloat(cs.opacity) > 0.5;
        });
        if (!restoreShown) await page.waitForTimeout(250);
      }
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
      ok = await until(async () => (await s.state()).hud);
      if (!ok) note = 'ESC did not restore the HUD';
    } else if (k.type === 'beat') {
      // `,` / `.` outside the presentation (SpaceScene's chapter axis): the beat on show moves one step in the flat list and its tick fills.
      const beats = await s.ev(() => window.__atlas!.beats());
      const at = async () => {
        const st = (await s.state()) as unknown as { chapter: string | null; beat?: number | null; presentation: unknown; hud: boolean };
        return { st, i: beats.findIndex((b) => b.chapter === st.chapter && b.index === (st.beat ?? 0)) };
      };
      const filled = (chapter: string | null, beat: number | null | undefined) =>
        page.evaluate(([c, b]) => document.querySelector(`[data-beat="${c}.${b}"]`)?.hasAttribute('data-filled') ?? false, [chapter, beat] as const);
      if (beats.length < 3) {
        record({ ...base, ok: true, note: 'fewer than three beats (skipped)' });
        continue;
      }
      await press('.');
      await until(async () => (await at()).i >= 0 && (await at()).st.beat !== null);
      const first = (await at()).i;
      await press('.');
      await until(async () => (await at()).i === first + 1);
      const a = await at();
      if (k.name === 'next') {
        ok = first >= 0 && a.i === first + 1 && a.st.beat !== null && a.st.presentation === null && a.st.hud && (await until(() => filled(a.st.chapter, a.st.beat), 2000));
        if (!ok) note = `'.' went from flat ${first} to ${a.i} (chapter=${a.st.chapter} beat=${a.st.beat})`;
      } else {
        await press(',');
        await until(async () => (await at()).i === a.i - 1);
        const b = await at();
        ok = b.i === a.i - 1 && (await filled(b.st.chapter, b.st.beat));
        if (!ok) note = `',' went from flat ${a.i} to ${b.i}`;
      }
      await page.waitForTimeout(1200); // camera flight
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
      ok = await until(async () => (await s.state()).chapter === target);
      if (!ok) note = `chapter=${(await s.state()).chapter}, expected ${target}`;
      await press(forward ? 'ArrowLeft' : 'ArrowRight');
      if (!(await until(async () => (await s.state()).chapter === chapters[here]))) {
        ok = false;
        note += ' not restored';
      }
    }
    record({ ...base, ok, note });
  }

  // Dragging the stage frees the camera (no preset lit); a preset takes it back.
  const [w, h] = o.size;
  await s.apply({ chapter: firstChapter, wait: 1200 });
  const presetKeys = keymap.filter((k) => k.type === 'preset');
  // An engine that lights its own VIEW button (MathScene's model switch) has no camera to free.
  const engineOwned = await page.evaluate(() => document.querySelector('[data-presets="engine"]') !== null);
  let first = presetKeys[0];
  if (first && !engineOwned) {
    // Light a preset first: a chapter's own view is not a preset (TimeScene has geographic presets only), so "free" must be earned by the drag.
    // A regional plate's whole-plate view sits at minimum zoom inside its bounds lock, so a drag there cannot move the camera:
    // that view is skipped and the drag is tried from the next preset.
    let free = false;
    let verdict: DragVerdict = 'wait';
    let waited = 0;
    for (const k of presetKeys.slice(0, 3)) {
      first = k;
      await page.keyboard.press(k.key);
      await page.waitForTimeout(2400);
      // The camera is written back (FREE CAMERA) once the damped orbit stops: wait while the live camera still moves (scripts/lib/drag-settle.ts).
      const sample = async (t0: number): Promise<DragSample> => ({
        at: Date.now() - t0,
        free: (await s.state()).preset === null,
        camera: await page.evaluate(() => {
          const cam = (window.__atlas!.stats() as { camera?: unknown }).camera;
          return cam === undefined ? null : JSON.stringify(cam);
        }),
      });
      const t0 = Date.now();
      const samples = [await sample(t0)];
      await page.mouse.move(w * 0.5, h * 0.5);
      await page.mouse.down();
      await page.mouse.move(w * 0.5 + 140, h * 0.5 + 30, { steps: 8 });
      await page.mouse.up();
      for (verdict = 'wait'; verdict === 'wait'; verdict = dragVerdict(samples)) {
        await page.waitForTimeout(250);
        samples.push(await sample(t0));
      }
      free = verdict === 'free';
      waited = samples.at(-1)!.at;
      const locked = !free && (await page.evaluate(() => document.querySelector('[data-region-plate]') !== null));
      if (!locked) break;
    }
    const target = first;
    const lit = await page.evaluate(() => document.querySelectorAll('[data-preset][aria-pressed="true"]').length);
    const why = { wait: '', free: '', still: 'the camera came to rest', unmoved: 'the drag did not move the camera', timeout: 'not freed' }[verdict];
    record({
      key: 'drag',
      type: 'camera',
      name: 'free-camera',
      ok: free && lit === 0,
      note: free && lit === 0 ? '' : `${why} after ${(waited / 1000).toFixed(1)} s: preset=${(await s.state()).preset} lit=${lit}`,
    });
    await page.keyboard.press(target.key);
    // Wait for the preset to be applied (state and lit button), not a fixed delay: the heaviest models stall software GL.
    const back = await until(
      async () => (await s.state()).preset === target.name && (await page.evaluate((n) => document.querySelector(`[data-preset="${n}"]`)?.getAttribute('aria-pressed'), target.name)) === 'true',
    );
    const st = await s.state();
    record({ key: target.key, type: 'camera', name: 'preset-after-free', ok: back, note: back ? '' : `preset=${st.preset}` });
  }
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

/** The layout sizes, with the 1024 × 768 tablet (the reader open beside the stage, the tightest desktop HUD). */
const SHOOT_LAYOUT_SIZES: readonly (readonly [number, number])[] = [...LAYOUT_SIZES.slice(0, 5), [1024, 768], ...LAYOUT_SIZES.slice(5)];

/** Beyond the HUD panels: a stage that keeps its model (`data-stage-free` = the model's room, "w h") at least this size. */
async function stageIssues(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const el = document.querySelector('[data-stage-free]');
    if (!el) return [];
    const [w = 0, h = 0] = (el.getAttribute('data-stage-free') ?? '').split(' ').map(Number);
    const phone = window.innerWidth < 760;
    return w < (phone ? 150 : 200) || h < 100 ? [`stage squeezed: the model has ${w} × ${h} px`] : [];
  });
}

async function runLayout(s: Session, out: string, report: RunReport, locale: string, theme: string): Promise<void> {
  const { page } = s;
  const [chapters, presets] = await Promise.all([s.ev(() => window.__atlas!.chapters()), s.ev(() => window.__atlas!.presets())]);
  const extraPresets = presets.filter((p) => !chapters.includes(p) && !/^\d+$/.test(p));
  mkdirSync(out, { recursive: true });
  for (const [w, h] of SHOOT_LAYOUT_SIZES) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(500);
    const issues: string[] = [];
    const check = async (where: string) => {
      for (const i of [...(await hudLayoutIssues(page)), ...(await stageIssues(page))]) {
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
    // Opened from a link at this size (a shared beat: `?ch=<chapter>&b=2`, the reader and the HUD laid out on load, not after a
    // resize), each in a fresh document (Session.load); then the topic again as the session opened it. Engines without beats
    // ignore `b` and open at the chapter.
    for (const c of chapters) {
      await s.load(`/${locale}/topics/${s.topic}/?ch=${encodeURIComponent(c)}&b=2&theme=${theme}`, `${c} (layout link)`);
      await page.waitForTimeout(700);
      await check(`${c} opened at beat 2`);
    }
    await page.screenshot({ path: join(out, `layout-${w}x${h}-linked.png`) });
    await s.reopen();
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
  tasks: boolean;
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
      tasks: { type: 'boolean', default: false },
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
    tasks: values.tasks,
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
  const checksOnly = (o.keys || o.layout || o.beats || o.tasks) && o.names.length === 0 && !o.shotsFile;
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
        const report: RunReport = { topic: o.topic, locale, theme, size: o.size.join('x'), shots: {}, keys: [], layout: [], beatFailures: [], beatNotes: [], chapterNotes: [], taskFailures: [], js: { files: 0, gzKB: 0 }, logs: [] };
        try {
          if (!checksOnly) await runShots(s, o, out, report);
          if (o.beats) {
            console.log('  -- beats');
            await runBeats(s, o, out, report);
            console.log('  -- chapter highlights');
            await runChapterHighlights(s, report);
          }
          if (o.tasks) {
            console.log('  -- tasks');
            await runTasks(s, out, report);
          }
          if (o.keys) {
            console.log('  -- keys');
            await runKeys(s, o, report);
          }
          if (o.layout) {
            console.log('  -- layout');
            await runLayout(s, out, report, locale, theme);
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
        if (o.beats) for (const f of report.beatFailures) console.log(`    ${f}`);
        if (o.tasks) console.log(`  task failures: ${report.taskFailures.length}`);
        for (const f of report.taskFailures) console.log(`    ${f}`);
        if (keyFails || report.layout.length || report.beatFailures.length || report.taskFailures.length || bad.length) failed = true;
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

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
 * `--beats` shoots a looping exercise beat (SpaceScene exercise mode) again held at its start and end keys
 * (`beat-<chapter>-<n>-start.png` / `-end.png`), and lists the ids each chapter's own state asks to label (TimeScene `highlight`, SpaceScene `labels`) that have no label on screen at the chapter camera (listed, not failed).
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
    const s = new Session(page, origin, topic);
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
    // Labels the beat asks for: a missing one means no anchor on screen (or its layer is off), usually a content issue.
    // A placard still fading in is not missing: poll a little longer before listing it (the stage renders on demand).
    let missing = await unlabelled(s);
    for (let t = 0; missing.length && t < 12; t++) {
      await s.page.waitForTimeout(250);
      missing = await unlabelled(s);
    }
    if (missing.length) report.beatNotes.push(`${name}: no label for ${missing.join(', ')}`);
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
}
const simEngine = (s: Session) => ({
  get: () => s.page.evaluate(() => (window.__atlas!.engine as unknown as { sim(): SimInfo | null }).sim()),
  set: (v: Record<string, unknown>) => s.page.evaluate((x) => (window.__atlas!.engine as unknown as { setSim(v: Record<string, unknown>): boolean }).setSim(x), v),
});

/**
 * A try-it key on the first chapter with a try-it card: `]` then `[` must step
 * the varied control one value on and back (from its first value), `T` must
 * flip the card's first switch and back, and the URL must carry `sim`.
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
    for (const k of presetKeys.slice(0, 3)) {
      first = k;
      await page.keyboard.press(k.key);
      await page.waitForTimeout(2400);
      await page.mouse.move(w * 0.5, h * 0.5);
      await page.mouse.down();
      await page.mouse.move(w * 0.5 + 140, h * 0.5 + 30, { steps: 8 });
      await page.mouse.up();
      // Orbit damping is frame-count based: software GL at ~10 fps takes several seconds to settle before the camera is written back.
      for (let i = 0; i < 64 && !free; i++) {
        await page.waitForTimeout(250);
        free = (await s.state()).preset === null;
      }
      const locked = !free && (await page.evaluate(() => document.querySelector('[data-region-plate]') !== null));
      if (!locked) break;
    }
    const target = first;
    const lit = await page.evaluate(() => document.querySelectorAll('[data-preset][aria-pressed="true"]').length);
    record({ key: 'drag', type: 'camera', name: 'free-camera', ok: free && lit === 0, note: free && lit === 0 ? '' : `preset=${(await s.state()).preset} lit=${lit}` });
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
    const check = async (where: string, target: Page = page) => {
      for (const i of [...(await hudLayoutIssues(target)), ...(await stageIssues(target))]) {
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
    // resize), in a page of its own. Engines without beats ignore `b` and open at the chapter.
    const linked = await page.context().newPage();
    linked.on('console', (m) => {
      if (m.type() === 'error' && !IGNORED.some((re) => re.test(m.text()))) s.logs.push({ type: m.type(), text: m.text() });
    });
    linked.on('pageerror', (e) => {
      if (!IGNORED.some((re) => re.test(e.message))) s.logs.push({ type: 'pageerror', text: e.message });
    });
    try {
      await linked.setViewportSize({ width: w, height: h });
      for (const c of chapters) {
        await linked.goto(`${s.origin}/${locale}/topics/${s.topic}/?ch=${encodeURIComponent(c)}&b=2&theme=${theme}`);
        await linked.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 60_000 });
        await linked.evaluate(() => window.__atlas!.ready);
        await linked.waitForTimeout(700);
        await check(`${c} opened at beat 2`, linked);
      }
      await linked.screenshot({ path: join(out, `layout-${w}x${h}-linked.png`) });
    } finally {
      await linked.close();
    }
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

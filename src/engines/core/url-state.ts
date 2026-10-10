/**
 * Scene state <-> URL query string (docs/02 "URL 状态").
 *
 *   /en/topics/ww2/?ch=fall-of-singapore&t=1942-02-10&layers=control,battles&cam=103.8,1.35,7.5
 *   /en/topics/aircon/?ch=power-on&part=compressor&view=xray&run=1
 *
 * Keys: `ch`, `layers`, `cam`, `theme` (core) and `task`, `model`, `t`, `hl`, `part`, `view`,
 * `explode`, `run`, `cut`, `pose` (engine passthrough). Values equal to the current chapter's
 * target are omitted, so a plain chapter link is just `?ch=<id>`.
 * Unknown query parameters (utm_*, etc.) are preserved.
 *
 * The encode/decode/merge functions are pure and unit-tested; `startUrlSync`
 * is the browser binding (history.replaceState, debounced).
 */
import type { CameraState, SceneState, UrlEngineFields } from './types';
import { decodeCamera, encodeCamera } from './camera';
import { formatTimeParam, parseTimeParam, type TimePoint } from '../../lib/time';
import { isTheme } from '../../theme/theme';

export type UrlState = Partial<SceneState & UrlEngineFields>;

/** Order in which keys are written (most meaningful first). */
export const URL_KEY_ORDER = ['ch', 'task', 'model', 't', 'hl', 'part', 'view', 'explode', 'run', 'cut', 'pose', 'layers', 'cam', 'theme'] as const;
export type UrlKey = (typeof URL_KEY_ORDER)[number];

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VIEW_RE = /^[a-z][a-z0-9-]*$/;

/* ------------------------------------------------------------------ */
/* Value codecs                                                        */
/* ------------------------------------------------------------------ */

function roundTo(n: number, digits: number): string {
  const s = n.toFixed(digits);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

/** Encode one field to its URL string. `null` = cannot be represented. */
function encodeField(key: UrlKey, state: UrlState): string | null {
  switch (key) {
    case 'ch':
      return state.chapter ?? null;
    case 'layers':
      return state.layers ? state.layers.join(',') : null;
    case 'cam':
      return state.camera === undefined ? null : state.camera === null ? '' : encodeCamera(state.camera);
    case 'theme':
      return state.theme ?? null;
    case 't':
      return state.t === undefined ? null : state.t === null ? '' : formatTimeParam(state.t);
    case 'hl':
      return state.highlight === undefined ? null : state.highlight.join(',');
    case 'part':
      return state.part === undefined ? null : (state.part ?? '');
    case 'view':
      return state.view ?? null;
    case 'explode':
      return state.explode === undefined ? null : roundTo(Math.min(1, Math.max(0, state.explode)), 2);
    case 'run':
      return state.run === undefined ? null : state.run ? '1' : '0';
    case 'cut':
      return state.cutaway ?? null;
    case 'pose':
      return state.pose === undefined ? null : (state.pose ?? '');
    case 'task':
      return state.task === undefined ? null : String(state.task);
    case 'model':
      return state.model === undefined ? null : (state.model ?? '');
  }
}

/**
 * Encode `state` as ordered `[key, value]` pairs. With a `baseline` (usually
 * the current chapter's target) fields whose encoded value matches the
 * baseline are dropped; `ch` is always kept.
 */
export function encodeSceneState(state: UrlState, baseline?: UrlState): [UrlKey, string][] {
  const out: [UrlKey, string][] = [];
  for (const key of URL_KEY_ORDER) {
    const value = encodeField(key, state);
    if (value === null) continue;
    if (key !== 'ch' && baseline && encodeField(key, baseline) === value) continue;
    out.push([key, value]);
  }
  return out;
}

/** Parse a query string (or URLSearchParams) into a partial scene state. Invalid values are dropped. */
export function decodeSceneState(input: string | URLSearchParams): UrlState {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;
  const out: UrlState = {};

  const ch = params.get('ch');
  if (ch !== null && ID_RE.test(ch)) out.chapter = ch;

  const layers = params.get('layers');
  if (layers !== null) {
    out.layers = layers === '' ? [] : layers.split(',').filter((l) => ID_RE.test(l));
  }

  const cam = params.get('cam');
  if (cam !== null) {
    if (cam === '') out.camera = null;
    else {
      const decoded: CameraState | null = decodeCamera(cam);
      if (decoded) out.camera = decoded;
    }
  }

  const theme = params.get('theme');
  if (isTheme(theme)) out.theme = theme;

  const t = params.get('t');
  if (t !== null) {
    if (t === '') out.t = null;
    else {
      const parsed: TimePoint | null = parseTimeParam(t);
      if (parsed !== null) out.t = parsed;
    }
  }

  const hl = params.get('hl');
  if (hl !== null) out.highlight = hl === '' ? [] : hl.split(',').filter((id) => ID_RE.test(id));

  const part = params.get('part');
  if (part !== null) {
    if (part === '') out.part = null;
    else if (ID_RE.test(part)) out.part = part;
  }

  const view = params.get('view');
  if (view !== null && VIEW_RE.test(view)) out.view = view;

  const explode = params.get('explode');
  if (explode !== null && explode.trim() !== '') {
    const n = Number(explode);
    if (Number.isFinite(n)) out.explode = Math.min(1, Math.max(0, n));
  }

  const run = params.get('run');
  if (run === '1' || run === 'true') out.run = true;
  else if (run === '0' || run === 'false') out.run = false;

  const cut = params.get('cut');
  if (cut !== null && ID_RE.test(cut)) out.cutaway = cut;

  const pose = params.get('pose');
  if (pose !== null) {
    if (pose === '') out.pose = null;
    else if (ID_RE.test(pose)) out.pose = pose;
  }

  const task = params.get('task');
  if (task !== null && /^[1-9]\d{0,2}$/.test(task)) out.task = Number(task);

  const model = params.get('model');
  if (model !== null) {
    if (model === '') out.model = null;
    else if (VIEW_RE.test(model)) out.model = model;
  }

  return out;
}

/** Encode a query component but keep `,` and `:` readable. */
function encodeComponent(value: string): string {
  return encodeURIComponent(value).replace(/%2C/gi, ',').replace(/%3A/gi, ':');
}

/**
 * Merge encoded scene params into an existing query string: scene keys are
 * replaced, foreign keys kept (after the scene keys). Returns `?...` or ``.
 */
export function mergeSearch(currentSearch: string, entries: readonly [string, string][]): string {
  const sceneKeys = new Set<string>(URL_KEY_ORDER);
  const foreign = [...new URLSearchParams(currentSearch)].filter(([key]) => !sceneKeys.has(key));
  const all = [...entries, ...foreign];
  if (all.length === 0) return '';
  return `?${all.map(([k, v]) => `${encodeComponent(k)}=${encodeComponent(v)}`).join('&')}`;
}

/* ------------------------------------------------------------------ */
/* Browser binding                                                     */
/* ------------------------------------------------------------------ */

export interface UrlSyncOptions {
  /** Current serializable state. */
  read(): UrlState;
  /** Baseline to diff against (the current chapter's target). */
  baseline(state: UrlState): UrlState;
  /** Subscribe to state changes; returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
  debounceMs?: number;
}

const pendingFlushers = new Set<() => void>();

/** Write any debounced URL update now (call before navigating away, e.g. language switch). */
export function flushUrlSync(): void {
  for (const flush of pendingFlushers) flush();
}

/**
 * Keep `location.search` in sync with the scene using `history.replaceState`
 * (no reload, no history spam). Returns a stop function.
 */
export function startUrlSync(options: UrlSyncOptions): () => void {
  const delay = options.debounceMs ?? 250;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const write = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    pendingFlushers.delete(write);
    const state = options.read();
    const search = mergeSearch(window.location.search, encodeSceneState(state, options.baseline(state)));
    if (search === window.location.search) return;
    const url = `${window.location.pathname}${search}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', url);
  };

  const schedule = () => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(write, delay);
    pendingFlushers.add(write);
  };

  const unsubscribe = options.subscribe(schedule);
  const onPageHide = () => write();
  window.addEventListener('pagehide', onPageHide);

  return () => {
    unsubscribe();
    window.removeEventListener('pagehide', onPageHide);
    if (timer !== null) clearTimeout(timer);
    pendingFlushers.delete(write);
  };
}

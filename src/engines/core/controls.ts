/**
 * Scene controls: what an engine registers so the host can draw the HUD
 * (VIEW buttons, status line, spec table, card and bottom panels; engines
 * place the mode buttons themselves, in their control panel),
 * bind the keyboard and drive the `window.__atlas` test API (docs/08 §2, §3, §7).
 *
 * One HUD store per scene island holds the registration plus host-owned UI
 * state that never goes into the URL: HUD visibility, the LABELS switch and
 * which camera preset is active. Buttons, keys and the test API all call the
 * same actions (`createHudActions`), and every `.on` state is derived from
 * stores, never kept in components.
 *
 * Engines register from their View with `useSceneControls()` (context.tsx),
 * which wraps `registerSceneControls()`. Memoize the object you pass: it is
 * re-registered whenever its identity changes.
 */
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { BilingualText } from '../../i18n';
import type { CameraState, SceneTransition } from './types';

/** HUD text: bilingual content or an already-translated UI string. */
export type HudText = BilingualText | string;

/** A camera preset (VIEW button, digit key). */
export interface ScenePreset {
  id: string;
  /** Short button text, e.g. `01`. */
  label: HudText;
  /** Longer name for tooltips, screen readers and the status line. */
  title?: HudText;
  /** Chapter whose own camera this is: entering the chapter makes it active. */
  chapter?: string;
}

/** Colour of a mode button's `.on` state (docs/08 §1 functional colours). */
export type ModeTone = 'ink' | 'xray' | 'hot' | 'cold' | 'cut' | 'signal';

/** A mode switch (letter key; its button sits in the engine's control panel, `widgets/ControlPanel.tsx`). */
export interface SceneMode {
  id: string;
  /** Single lowercase letter. Digits, space, `h` are reserved by the host. */
  key?: string;
  label: HudText;
  on: boolean;
  /** Meaningless in the current state: button disabled, key ignored. */
  disabled?: boolean;
  /** Status-line text while on (e.g. `EXPLODED 70`); defaults to the label. */
  status?: string;
  tone?: ModeTone;
  /** `false`: no button below 760 px wide (phones); the key still works. Default shown. */
  phone?: boolean;
}

/** docs/08 §6 source tags for spec values. */
export type SourceTag = 'fact' | 'ref' | 'reconstruction' | 'simulated';

/** One row of the title block's spec table (`dl`). */
export interface SpecRow {
  id: string;
  /** Shown as EN with the Chinese beneath, whatever the page locale. */
  label: BilingualText;
  value: HudText;
  /** Numbers: render the value in the mono face. */
  mono?: boolean;
  source?: SourceTag;
}

export interface SceneStats {
  /** Drawing-buffer size of the stage canvas, device pixels. */
  buffer: [number, number];
  pixelRatio: number;
  calls?: number;
  triangles?: number;
  fps?: number;
  geometries?: number;
  textures?: number;
  /** Map stages: rendered features and zoom. */
  features?: number;
  zoom?: number;
  gpu?: string;
}

export const PANEL_SLOTS = ['panel01', 'panel02', 'panel03'] as const;
export type PanelSlot = (typeof PANEL_SLOTS)[number];

export interface InstantOption {
  instant: boolean;
}

/** One presentation beat as the test API lists it (`__atlas.beats()`). */
export interface BeatInfo {
  /** Chapter the beat belongs to. */
  chapter: string;
  /** Position inside its chapter (0-based). */
  index: number;
  caption: BilingualText;
}

/** One narrated utterance as `__atlas.voiceLog()` lists it (times are `performance.now()` ms; `null` = not yet). */
export interface VoiceLogEntry {
  text: string;
  lang: string;
  voice: string;
  started: number | null;
  ended: number | null;
  /** How it stopped: `end`, `cancelled`, `spurious-end`, `error:<code>`; `null` while speaking. */
  reason: string | null;
}

/** What an engine registers. Every field is optional. */
export interface SceneControls {
  /** Camera presets, in key order (digit `1` = first). */
  presets?: {
    items: readonly ScenePreset[];
    set(id: string, options: InstantOption): void;
  };
  /** Mode switches. `set` receives `instant: true` when the caller wants the end state now (tests, shots). */
  modes?: {
    items: readonly SceneMode[];
    set(id: string, on: boolean, options: InstantOption): void;
  };
  /** Run / pause (SPACE). Omit when the scene has nothing to pause. */
  pause?: {
    paused: boolean;
    set(paused: boolean): void;
  };
  /**
   * The engine honours the host's LABELS switch (`data-labels="off"` on
   * `.atlas-scene`, or `useHud(s => s.labels)`). The host then adds a
   * `labels` mode on key `L`.
   */
  labels?: boolean;
  /** Renderer numbers for `__atlas.stats()` (merged over the host's canvas defaults). */
  stats?(): Partial<SceneStats>;
  /** Extra spec rows after the host's defaults (subject, chapters, syllabus). */
  specRows?: readonly SpecRow[];
  /** Extra status-line segments, already upper-case. */
  status?: readonly string[];
  /** Title of the top-right schematic card; the host draws the frame, the engine portals into slot `card`. */
  card?: BilingualText;
  /**
   * The card can expand in place: the host turns its header into a toggle
   * (`aria-expanded`) and marks the frame `data-expanded`.
   */
  cardToggle?: {
    expanded: boolean;
    set(expanded: boolean): void;
  };
  /** Titles of the bottom panels; the host draws frame + header, the engine portals into `panel01..03`. */
  panels?: Partial<Record<PanelSlot, BilingualText>>;
  /** Presentation beats (`__atlas.beats()` / `goToBeat()`); `go` enters the presentation when needed. */
  beats?: {
    list(): BeatInfo[];
    go(index: number, options: InstantOption): void;
    /** The beat on show (`__atlas.state().presentation`, with the auto-play switch when the engine has one); `null` when no presentation is running. */
    current(): { chapter: string; beat: number; autoplay?: boolean; voice?: boolean } | null;
    /** Auto-play switch of the presentation (`__atlas.setAutoplay`); omit when the engine has none. */
    setAutoplay?(on: boolean): void;
    /** Voice (caption narration) switch (`__atlas.setVoice`); returns false when the device has no voice. Omit when the engine has none. */
    setVoice?(on: boolean): boolean;
    /** The last 10 utterances of the caption narration (`__atlas.voiceLog()`). */
    voiceLog?(): VoiceLogEntry[];
  };
  /**
   * Chapter auto-run (TimeScene): picking a chapter animates the engine's time
   * from the chapter's span start to its own time. `running` is true while it
   * plays (`__atlas.state().running`); `now` is the continuous time on show
   * (`__atlas.state().playhead`), `null` when the engine has none.
   */
  time?: {
    running(): boolean;
    now(): number | null;
  };
  /** ESC: leave a focus/selection. Return true when something was undone. */
  escape?(): boolean;
}

export interface HudState {
  controls: SceneControls;
  /** HUD visible (`H`). */
  hud: boolean;
  /** Leader / map labels visible (`L`). */
  labels: boolean;
  /** Preset picked explicitly since the last chapter change. */
  presetId: string | null;
  /** The user moved the camera since the last preset / chapter change. */
  cameraFree: boolean;
  /**
   * Reading panel expanded (docked column >= 1024 px; collapsed = a 28 px
   * strip). Kept in sessionStorage by the host, never in the URL.
   */
  reader: boolean;
}

export type HudStore = StoreApi<HudState>;

export function createHudStore(): HudStore {
  return createStore<HudState>()(() => ({
    controls: {},
    hud: true,
    labels: true,
    presetId: null,
    cameraFree: false,
    reader: true,
  }));
}

/**
 * Register an engine's controls with a scene's HUD store. Returns an
 * unregister function (a no-op if another registration replaced this one).
 */
export function registerSceneControls(hud: HudStore, controls: SceneControls): () => void {
  hud.setState({ controls });
  return () => {
    if (hud.getState().controls === controls) hud.setState({ controls: {} });
  };
}

/* ------------------------------------------------------------------ */
/* Derived state (pure)                                                */
/* ------------------------------------------------------------------ */

export const LABELS_MODE_ID = 'labels';
export const LABELS_KEY = 'l';
const RESERVED_KEYS = new Set([' ', 'h', 'escape']);

/** Engine modes plus the host's LABELS switch when the engine supports it. */
export function allModes(controls: SceneControls, labelsOn: boolean, labelsText: HudText): SceneMode[] {
  const modes = [...(controls.modes?.items ?? [])].filter((m) => m.id !== LABELS_MODE_ID);
  if (controls.labels) modes.push({ id: LABELS_MODE_ID, key: LABELS_KEY, label: labelsText, on: labelsOn });
  return modes;
}

/** The active preset id: explicit pick, else the current chapter's own preset, unless the camera was moved. */
export function activePreset(state: Pick<HudState, 'controls' | 'presetId' | 'cameraFree'>, chapter: string | null): string | null {
  if (state.cameraFree) return null;
  const items = state.controls.presets?.items ?? [];
  if (state.presetId && items.some((p) => p.id === state.presetId)) return state.presetId;
  return items.find((p) => p.chapter !== undefined && p.chapter === chapter)?.id ?? null;
}

export interface KeyBinding {
  /** `KeyboardEvent.key` (lower-case letters, `' '` for space). */
  key: string;
  type: 'preset' | 'mode' | 'pause' | 'hud' | 'escape' | 'chapter';
  name: string;
}

/** Every key the host handles for these controls (docs/08 §3). */
export function buildKeymap(controls: SceneControls): KeyBinding[] {
  const out: KeyBinding[] = [];
  (controls.presets?.items ?? []).slice(0, 9).forEach((p, i) => out.push({ key: String(i + 1), type: 'preset', name: p.id }));
  for (const m of allModes(controls, true, '')) {
    const key = m.key?.toLowerCase();
    if (key && key.length === 1 && !RESERVED_KEYS.has(key) && !/\d/.test(key)) out.push({ key, type: 'mode', name: m.id });
  }
  if (controls.pause) out.push({ key: ' ', type: 'pause', name: 'pause' });
  out.push({ key: 'h', type: 'hud', name: 'hud' });
  out.push({ key: 'Escape', type: 'escape', name: 'escape' });
  out.push({ key: 'ArrowLeft', type: 'chapter', name: 'prev' });
  out.push({ key: 'ArrowRight', type: 'chapter', name: 'next' });
  return out;
}

/** `ATL-{first 6 of the topic id, upper-case, no hyphens}-{chapter number, 2 digits}`. */
export function docId(topicId: string, chapterNumber: number): string {
  const topic = topicId.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6);
  return `ATL-${topic}-${String(Math.max(1, chapterNumber)).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/* Actions (shared by buttons, keys and window.__atlas)                */
/* ------------------------------------------------------------------ */

export interface HudActions {
  setPreset(id: string, options?: Partial<InstantOption>): boolean;
  setMode(id: string, on: boolean, options?: Partial<InstantOption>): boolean;
  togglePaused(): void;
  setPaused(paused: boolean): void;
  setHud(on: boolean): void;
  setLabels(on: boolean): void;
  /** Expand / collapse the docked reading panel. */
  setReader(expanded: boolean): void;
  escape(): void;
}

export function createHudActions(hud: HudStore, camera: { suppress(fn: () => void): void }): HudActions {
  const controls = () => hud.getState().controls;
  return {
    setPreset(id, options) {
      const presets = controls().presets;
      if (!presets?.items.some((p) => p.id === id)) return false;
      camera.suppress(() => presets.set(id, { instant: options?.instant ?? false }));
      hud.setState({ presetId: id, cameraFree: false });
      return true;
    },
    setMode(id, on, options) {
      if (id === LABELS_MODE_ID && controls().labels) {
        hud.setState({ labels: on });
        return true;
      }
      const modes = controls().modes;
      const mode = modes?.items.find((m) => m.id === id);
      if (!modes || !mode || (mode.disabled && on)) return false;
      modes.set(id, on, { instant: options?.instant ?? false });
      return true;
    },
    togglePaused() {
      const pause = controls().pause;
      pause?.set(!pause.paused);
    },
    setPaused(paused) {
      controls().pause?.set(paused);
    },
    setHud(on) {
      hud.setState({ hud: on });
    },
    setLabels(on) {
      hud.setState({ labels: on });
    },
    setReader(expanded) {
      hud.setState({ reader: expanded });
    },
    escape() {
      if (!hud.getState().hud) {
        hud.setState({ hud: true });
        return;
      }
      controls().escape?.();
    },
  };
}

/**
 * Keep `presetId` / `cameraFree` in step with the scene store: a chapter
 * change resets to the chapter's own preset; a deep link with its own camera,
 * or any camera write outside `setPreset` (user drag / pan), means FREE CAMERA.
 */
export function trackCamera<S extends { transition: SceneTransition; camera: CameraState | null; chapter: string | null }>(
  hud: HudStore,
  scene: StoreApi<S>,
  baselineCamera: (chapter: string | null) => CameraState | null,
): { suppress(fn: () => void): void; dispose(): void } {
  let suppressed = false;
  const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  const dispose = scene.subscribe((s, prev) => {
    if (s.transition.id !== prev.transition.id) {
      const { reason } = s.transition;
      if (reason === 'chapter' || reason === 'init') hud.setState({ presetId: null, cameraFree: false });
      else if (reason === 'url' || reason === 'state') hud.setState({ presetId: null, cameraFree: !same(s.camera, baselineCamera(s.chapter)) });
      return;
    }
    if (s.camera !== prev.camera && !suppressed) hud.setState({ cameraFree: true });
  });
  // A deep link with its own camera starts free.
  const s0 = scene.getState();
  if (!same(s0.camera, baselineCamera(s0.chapter))) hud.setState({ cameraFree: true });
  return {
    suppress(fn) {
      suppressed = true;
      try {
        fn();
      } finally {
        suppressed = false;
      }
    },
    dispose,
  };
}

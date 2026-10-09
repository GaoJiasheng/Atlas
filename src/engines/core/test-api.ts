/**
 * `window.__atlas`: the test / screenshot API (docs/08 §7), mirroring the
 * industrial-3d-showcase `__showcase` contract. Installed by SceneHost on the
 * client; drives the same actions as the HUD buttons and keys.
 */
import type { SceneStore } from './store';
import type { SceneSnapshot, Theme } from './types';
import {
  activePreset,
  allModes,
  buildKeymap,
  type BeatInfo,
  type HudActions,
  type HudStore,
  type KeyBinding,
  type SceneStats,
  type VoiceLogEntry,
} from './controls';

export type AtlasState = SceneSnapshot & {
  hud: boolean;
  paused: boolean | null;
  labels: boolean;
  /** Reading panel expanded (docked column; the phone sheet ignores it). */
  reader: boolean;
  /** A chapter auto-run is animating the engine's time (TimeScene); always false elsewhere. */
  running: boolean;
  /** The continuous time on show (TimeScene: the playhead as a number); `null` when the engine has none. */
  playhead: number | null;
  /** Active camera preset, `null` = free camera. */
  preset: string | null;
  modes: Record<string, boolean>;
  /** Theme actually applied (`<html data-theme>`). */
  appliedTheme: string | undefined;
  /** The presentation beat on show (`beat` = 0-based position inside the chapter); `null` outside the presentation. */
  presentation: { chapter: string; beat: number; autoplay?: boolean; voice?: boolean } | null;
};

export interface AtlasTestApi {
  /** Resolves `true` once the engine view has mounted and its stage canvas has a size; `false` after 20 s. */
  ready: Promise<boolean>;
  chapters(): string[];
  goToChapter(id: string, options?: { instant?: boolean }): void;
  /** Pick a chapter as the rail does (camera flight, and in TimeScene the time auto-run); a second call re-runs it. */
  runChapter(id: string): void;
  presets(): string[];
  setPreset(id: string, options?: { instant?: boolean }): void;
  modes(): string[];
  setMode(id: string, on: boolean, options?: { instant?: boolean }): void;
  keymap(): KeyBinding[];
  /** Presentation beats in order (empty when the engine has none). */
  beats(): BeatInfo[];
  /** Enter the presentation if needed and go to beat `i` (`instant` default false). */
  goToBeat(index: number, options?: { instant?: boolean }): void;
  /** Run / pause; returns false (and does nothing) when the scene has nothing to pause. */
  setPaused(on: boolean): boolean;
  /** Presentation auto-play on / off; returns false when the engine has no auto-play. */
  setAutoplay(on: boolean): boolean;
  /** Presentation voice (caption narration) on / off; false when the engine has none or the device has no voice. */
  setVoice(on: boolean): boolean;
  /** Debug: the last 10 narrated utterances `{ text, lang, voice, started, ended, reason }`. */
  voiceLog(): VoiceLogEntry[];
  setHud(on: boolean): void;
  setTheme(theme: Theme): void;
  state(): AtlasState;
  stats(): SceneStats;
}

declare global {
  interface Window {
    __atlas?: AtlasTestApi;
  }
}

export interface TestApiDeps {
  store: SceneStore;
  hud: HudStore;
  actions: HudActions;
  chapterIds: readonly string[];
  /** Resolves when the engine view has mounted. */
  mounted: Promise<void>;
  /** The stage element (canvas lookup for `ready` and default stats). */
  stage: () => Element | null;
  setTheme(theme: Theme): void;
}

const READY_TIMEOUT_MS = 20_000;

function stageCanvas(stage: Element | null): HTMLCanvasElement | null {
  if (!stage) return null;
  let best: HTMLCanvasElement | null = null;
  for (const c of stage.querySelectorAll('canvas')) if (!best || c.width * c.height > best.width * best.height) best = c;
  return best;
}

function canvasStats(stage: Element | null): SceneStats {
  const c = stageCanvas(stage);
  if (!c) return { buffer: [0, 0], pixelRatio: window.devicePixelRatio || 1 };
  const css = c.clientWidth || 1;
  return { buffer: [c.width, c.height], pixelRatio: Math.round((c.width / css) * 100) / 100 };
}

export function installTestApi(deps: TestApiDeps): () => void {
  const { store, hud, actions } = deps;

  const ready = deps.mounted.then(
    () =>
      new Promise<boolean>((resolve) => {
        const start = performance.now();
        const poll = () => {
          const c = stageCanvas(deps.stage());
          if (c && c.width > 0 && c.height > 0) resolve(true);
          else if (performance.now() - start > READY_TIMEOUT_MS) resolve(false);
          else window.setTimeout(poll, 100);
        };
        poll();
      }),
  );

  const api: AtlasTestApi = {
    ready,
    chapters: () => [...deps.chapterIds],
    goToChapter: (id, options) => store.getState().goToChapter(id, { instant: options?.instant ?? false }),
    runChapter: (id) => store.getState().goToChapter(id, { instant: false }),
    presets: () => (hud.getState().controls.presets?.items ?? []).map((p) => p.id),
    setPreset: (id, options) => {
      actions.setPreset(id, { instant: options?.instant ?? false });
    },
    modes: () => allModes(hud.getState().controls, hud.getState().labels, '').map((m) => m.id),
    setMode: (id, on, options) => {
      const instant = options?.instant ?? true;
      if (actions.setMode(id, on, { instant }) && instant) store.getState().snap();
    },
    keymap: () => buildKeymap(hud.getState().controls),
    beats: () => hud.getState().controls.beats?.list() ?? [],
    goToBeat: (index, options) => hud.getState().controls.beats?.go(index, { instant: options?.instant ?? false }),
    setPaused: (on) => {
      if (!hud.getState().controls.pause) return false;
      actions.setPaused(on);
      return true;
    },
    setAutoplay: (on) => {
      const set = hud.getState().controls.beats?.setAutoplay;
      if (!set) return false;
      set(on);
      return true;
    },
    setVoice: (on) => hud.getState().controls.beats?.setVoice?.(on) ?? false,
    voiceLog: () => hud.getState().controls.beats?.voiceLog?.() ?? [],
    setHud: (on) => actions.setHud(on),
    setTheme: (theme) => deps.setTheme(theme),
    state: () => {
      const h = hud.getState();
      const snapshot = store.getState().snapshot();
      return {
        ...snapshot,
        hud: h.hud,
        paused: h.controls.pause ? h.controls.pause.paused : null,
        labels: h.labels,
        reader: h.reader,
        running: h.controls.time?.running() ?? false,
        playhead: h.controls.time?.now() ?? null,
        preset: activePreset(h, snapshot.chapter),
        modes: Object.fromEntries(allModes(h.controls, h.labels, '').map((m) => [m.id, m.on])),
        appliedTheme: document.documentElement.dataset.theme,
        presentation: h.controls.beats?.current() ?? null,
      };
    },
    stats: () => ({ ...canvasStats(deps.stage()), ...(hud.getState().controls.stats?.() ?? {}) }),
  };

  window.__atlas = api;
  return () => {
    if (window.__atlas === api) delete window.__atlas;
  };
}

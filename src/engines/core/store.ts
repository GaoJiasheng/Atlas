/**
 * Scene store: one zustand store per scene island holding the serializable
 * `SceneState` plus the engine's extension fields.
 *
 * Chapter targets are cumulative: chapter N's target is the defaults with the
 * `state` of chapters 1..N applied in order. That makes every target a pure
 * function of the chapter list (so URLs are reproducible) while letting
 * authors omit fields that do not change from the previous chapter.
 */
import { createStore, type StoreApi } from 'zustand/vanilla';
import type {
  CameraState,
  Chapter,
  ChapterState,
  EngineExtension,
  SceneSnapshot,
  SceneTransition,
  Theme,
} from './types';
import { isTheme } from '../../theme/theme';
import { normalizeCamera } from './camera';

export interface SceneActions<E extends EngineExtension> {
  /** Jump to a chapter: state becomes the chapter's target, transition bumps. */
  goToChapter(id: string, options?: { instant?: boolean }): void;
  /**
   * Move to the previous/next chapter. Returns the new chapter id, or null
   * at either end.
   */
  stepChapter(delta: 1 | -1): string | null;
  /** User-driven change (no transition bump). */
  patch(partial: Partial<SceneSnapshot<E>>): void;
  toggleLayer(id: string): void;
  setLayers(ids: string[]): void;
  setCamera(camera: CameraState | null): void;
  /** Camera preset: set `camera` and bump the transition (reason `preset`) so the stage flies there. */
  applyCameraPreset(camera: CameraState, options?: { instant?: boolean }): void;
  /** Bump an instant transition (reason `snap`): stages jump to the current state without easing. */
  snap(): void;
  setTheme(theme: Theme | undefined): void;
  /** Apply a deep link: chapter target first, then overrides; instant. */
  hydrate(partial: Partial<SceneSnapshot<E>>): void;
  /** Target state for a chapter (what `goToChapter` would produce). */
  chapterTarget(id: string | null): SceneSnapshot<E>;
  /** Current serializable state (no actions, no transition). */
  snapshot(): SceneSnapshot<E>;
  /**
   * Replace the defaults once the engine data has loaded (they may depend on
   * it) and reset to the current chapter's new target. Call before applying a
   * deep link; instant.
   */
  rebase(defaults: SceneSnapshot<E>): void;
}

export type SceneStoreState<E extends EngineExtension = EngineExtension> = SceneSnapshot<E> & {
  transition: SceneTransition;
} & SceneActions<E>;

export type SceneStore<E extends EngineExtension = EngineExtension> = StoreApi<SceneStoreState<E>>;

export interface CreateSceneStoreOptions<E extends EngineExtension> {
  /** Chapters in display order. */
  chapters: readonly Chapter[];
  /** Starting values for common + engine fields (before any chapter). */
  defaults: SceneSnapshot<E>;
  /** Engine mapping of chapter `state` to extension fields. */
  fromChapterState?: (state: ChapterState) => Partial<E>;
  /** Chapter to start on. Defaults to the first chapter. */
  initialChapter?: string | null;
}

/** Core keys of chapter `state`: layers, camera, theme. */
export function commonFromChapterState(state: ChapterState): Partial<SceneSnapshot<EngineExtension>> {
  const out: Partial<SceneSnapshot<EngineExtension>> = {};
  const { layers, camera, theme } = state;
  if (Array.isArray(layers) && layers.every((l): l is string => typeof l === 'string')) out.layers = [...layers];
  const cam = normalizeCamera(camera);
  if (cam) out.camera = cam;
  if (isTheme(theme)) out.theme = theme;
  return out;
}

/** Cumulative chapter targets keyed by chapter id. */
export function resolveChapterTargets<E extends EngineExtension>(
  chapters: readonly Chapter[],
  defaults: SceneSnapshot<E>,
  fromChapterState: (state: ChapterState) => Partial<E> = () => ({}),
): Map<string, SceneSnapshot<E>> {
  const targets = new Map<string, SceneSnapshot<E>>();
  let acc: SceneSnapshot<E> = { ...defaults };
  for (const chapter of chapters) {
    acc = {
      ...acc,
      ...commonFromChapterState(chapter.state),
      ...fromChapterState(chapter.state),
      chapter: chapter.id,
    };
    targets.set(chapter.id, acc);
  }
  return targets;
}

const SERIALIZABLE_COMMON = ['chapter', 'layers', 'camera', 'theme'] as const;

export function createSceneStore<E extends EngineExtension>(options: CreateSceneStoreOptions<E>): SceneStore<E> {
  const { chapters } = options;
  let defaults = options.defaults;
  let targets = resolveChapterTargets(chapters, defaults, options.fromChapterState);
  let keys = Array.from(new Set<string>([...SERIALIZABLE_COMMON, ...Object.keys(defaults)]));
  const ids = chapters.map((c) => c.id);

  const targetFor = (id: string | null): SceneSnapshot<E> =>
    (id !== null && targets.get(id)) || { ...defaults, chapter: null };

  /** Target with every serializable key present (undefined clears stale values). */
  const fullTarget = (id: string | null): Record<string, unknown> => {
    const target = targetFor(id) as unknown as Record<string, unknown>;
    return Object.fromEntries(keys.map((key) => [key, target[key]]));
  };

  const startId =
    options.initialChapter !== undefined && options.initialChapter !== null && targets.has(options.initialChapter)
      ? options.initialChapter
      : (ids[0] ?? null);

  return createStore<SceneStoreState<E>>()((set, get) => ({
    ...targetFor(startId),
    transition: { id: 0, reason: 'init', instant: true },

    goToChapter(id, opts) {
      if (!targets.has(id)) return;
      const prev = get().transition;
      set({
        ...fullTarget(id),
        transition: { id: prev.id + 1, reason: 'chapter', instant: opts?.instant ?? false },
      } as Partial<SceneStoreState<E>>);
    },

    stepChapter(delta) {
      const current = get().chapter;
      const from = current === null ? (delta > 0 ? -1 : ids.length) : ids.indexOf(current);
      const chapter = chapters[from + delta];
      if (!chapter) return null;
      get().goToChapter(chapter.id);
      return chapter.id;
    },

    patch(partial) {
      set(partial as Partial<SceneStoreState<E>>);
    },

    toggleLayer(id) {
      const layers = get().layers;
      set({ layers: layers.includes(id) ? layers.filter((l) => l !== id) : [...layers, id] } as Partial<
        SceneStoreState<E>
      >);
    },

    setLayers(layers) {
      set({ layers: [...layers] } as Partial<SceneStoreState<E>>);
    },

    setCamera(camera) {
      set({ camera } as Partial<SceneStoreState<E>>);
    },

    applyCameraPreset(camera, opts) {
      const prev = get().transition;
      set({
        camera,
        transition: { id: prev.id + 1, reason: 'preset', instant: opts?.instant ?? false },
      } as Partial<SceneStoreState<E>>);
    },

    snap() {
      const prev = get().transition;
      set({ transition: { id: prev.id + 1, reason: 'snap', instant: true } } as Partial<SceneStoreState<E>>);
    },

    setTheme(theme) {
      set({ theme } as Partial<SceneStoreState<E>>);
    },

    hydrate(partial) {
      const chapter = partial.chapter !== undefined && partial.chapter !== null && targets.has(partial.chapter)
        ? partial.chapter
        : get().chapter;
      const overrides: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(partial)) {
        if (key !== 'chapter' && value !== undefined) overrides[key] = value;
      }
      const prev = get().transition;
      set({
        ...fullTarget(chapter),
        ...overrides,
        transition: { id: prev.id + 1, reason: 'url', instant: true },
      } as Partial<SceneStoreState<E>>);
    },

    chapterTarget(id) {
      return targetFor(id);
    },

    rebase(next) {
      defaults = next;
      targets = resolveChapterTargets(chapters, defaults, options.fromChapterState);
      keys = Array.from(new Set<string>([...SERIALIZABLE_COMMON, ...Object.keys(defaults)]));
      const prev = get().transition;
      set({
        ...fullTarget(get().chapter),
        transition: { id: prev.id + 1, reason: 'init', instant: true },
      } as Partial<SceneStoreState<E>>);
    },

    snapshot() {
      const state = get() as unknown as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const key of keys) if (state[key] !== undefined) out[key] = state[key];
      return out as SceneSnapshot<E>;
    },
  }));
}

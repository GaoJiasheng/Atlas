/**
 * Scene contract shared by every engine (docs/03 "共同契约").
 * Type-only imports from the zod schemas keep zod out of the client bundle.
 */
import type { ComponentType } from 'react';
import type { EngineId, TopicMeta } from '../../content/schema/topic';
import type { ChapterFrontmatter, QuizItem } from '../../content/schema/chapter';
import type { CameraState, GeoCamera, OrbitCamera } from '../../content/schema/camera';
import type { Locale } from '../../i18n';
import type { Theme } from '../../theme/theme';
import type { TimePoint } from '../../lib/time';

export type { TopicMeta, QuizItem, CameraState, GeoCamera, OrbitCamera, Locale, Theme, TimePoint };
export type { EngineId, Subject } from '../../content/schema/topic';
export type { Level } from '../../lib/levels';
export type { Bilingual } from '../../content/schema/common';

/** A chapter = a story node (time) or a step (space). Sorted by `order`. */
export type Chapter = ChapterFrontmatter;

/** Free-form chapter state; core reads `layers`, `camera`, `theme`. */
export type ChapterState = Chapter['state'];

/** Serializable scene state, two-way bound to the URL. */
export interface SceneState {
  chapter: string | null;
  layers: string[];
  camera: CameraState | null;
  theme?: Theme;
}

/** Keys every engine may add on top of `SceneState`, with their URL keys. */
export interface UrlEngineFields {
  /** TimeScene: current time. URL `t`. */
  t?: TimePoint | null;
  /** SpaceScene: selected part. URL `part`. */
  part?: string | null;
  /** SpaceScene: view mode. URL `view`. */
  view?: string;
  /** SpaceScene: explode amount 0..1. URL `explode`. */
  explode?: number;
  /** SpaceScene: running animation. URL `run`. */
  run?: boolean;
  /** TimeScene: emphasised entity / movement / event ids. URL `hl` (comma-separated). */
  highlight?: string[];
  /** SpaceScene: cutaway mode. URL `cut`. */
  cutaway?: 'none' | 'half';
}

/**
 * Engine extension fields. Engines declare a concrete interface (e.g.
 * `TimeSceneExt`) and the store is generic over it.
 */
export type EngineExtension = object;

/** Full serializable state of a scene with engine extension `E`. */
export type SceneSnapshot<E extends EngineExtension = EngineExtension> = SceneState & E;

/** Why the store last changed in a way engines should animate toward. */
export interface SceneTransition {
  /** Increments on every chapter change / URL hydration / camera preset / snap. */
  id: number;
  /**
   * `init` first load · `chapter` chapter change · `url` deep link ·
   * `preset` a camera preset was picked (only `camera` changed) ·
   * `snap` finish running eases now (tests, screenshots; always instant).
   */
  reason: 'init' | 'chapter' | 'url' | 'preset' | 'snap';
  /** Jump without animating (initial load, deep link). */
  instant: boolean;
}

/** docs/03 SceneProps: what a page hands to the scene island. */
export interface SceneProps<D = unknown> {
  topic: TopicMeta;
  chapters: Chapter[];
  /** Engine data, already parsed by the engine's zod schema at build time. */
  data: D;
  locale: Locale;
  initialState?: Partial<SceneState>;
}

/**
 * Props each engine's lazy-loaded view component receives. The view reads and
 * writes scene state via `useScene()` / `useSceneStore()` and renders into the
 * layout slots with `<SceneSlot>`.
 */
export interface EngineViewProps<D = unknown> {
  topic: TopicMeta;
  chapters: Chapter[];
  data: D;
  locale: Locale;
}

/**
 * Engine descriptor: tiny, synchronous, client-safe. Lives in the engine's
 * `index.ts`; the heavy view is loaded lazily via `load()`.
 */
export interface EngineDescriptor<E extends EngineExtension = EngineExtension, D = unknown> {
  id: EngineId;
  /**
   * Default values for the engine extension fields, optionally overriding
   * common defaults (e.g. initial `layers`). Chapter states apply on top.
   */
  defaults(topic: TopicMeta, data: D): E & Partial<SceneState>;
  /**
   * Map a chapter's free-form `state` onto store fields. Common keys
   * (`layers`, `camera`, `theme`) are handled by core; return engine fields
   * here (e.g. TimeScene maps `time` -> `t`).
   */
  fromChapterState(state: ChapterState): Partial<E>;
  /** Accept engine fields decoded from the URL (validate, drop the rest). */
  fromUrl(fields: UrlEngineFields): Partial<E>;
  /** Lazily load the engine view (stage + controls). */
  load(): Promise<{ default: ComponentType<EngineViewProps<D>> }>;
}

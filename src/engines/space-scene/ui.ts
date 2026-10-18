/**
 * Engine-local UI state shared by the View (HUD controls) and the WebGL
 * stage (separate React roots): ORBIT turntable, REFERENCE mode, the
 * presentation (on) and the cover
 * camera (HUD hidden) and the glb's loading state and part bounds, and the
 * try-it card's data tables, predict-then-observe answer and "Run again"
 * count (and the QA hold of a timeline). None of it
 * goes into the URL; a chapter change ends ORBIT and REFERENCE.
 */
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { OrbitCamera } from '../core/types';
import type { SpaceSceneExt } from './index';
import type { ExerciseBody } from '../../lib/anatomy';
import type { SimValues } from './sim-schema';
import type { TableRow } from './lib/sim/trial';

/** What REFERENCE saved on entry, restored when it is switched off. */
export interface ReferenceSave {
  camera: OrbitCamera | null;
  view: SpaceSceneExt['view'];
  explode: number;
  run: boolean;
  presetId: string | null;
  cameraFree: boolean;
}

export interface SpaceUiState {
  /** ORBIT preset: slow turntable until the user drags. */
  orbit: boolean;
  /** REFERENCE mode on (with what to restore). */
  reference: ReferenceSave | null;
  /** Duration (ms) of the next camera move; CameraRig consumes and clears it. */
  nextTweenMs: number | null;
  /**
   * The next transition applies a beat: `authored` when the beat names its
   * own camera (or a preset), else `auto` (an exercise on show is framed by
   * the exercise camera); CameraRig consumes and clears it.
   */
  beatCamera: 'authored' | 'auto' | null;
  /** PRESENTATION on (leader labels stay with the HUD hidden). */
  presenting: boolean;
  /** HUD hidden outside the presentation: the stage frames the cover camera (and goes back when the HUD returns). */
  cover: boolean;
  /** The glb model (topics with `mesh` parts): `none` without one; loading progress 0..1; `failed` shows a note on the stage. */
  model: { state: 'none' | 'loading' | 'ready' | 'failed'; progress: number };
  /** Rest bounds of the glb parts once loaded (the ARCHITECTURE elevation draws them; primitives come from the data). */
  meshBounds: ReadonlyMap<string, { min: readonly number[]; max: readonly number[] }> | null;
  /** QA (`__atlas.engine.test.exerciseBody`): the exercise body style instead of the data's (null = the data's). */
  exerciseBody: ExerciseBody | null;
  /** Try-it data tables by chapter id (in memory only: a reload clears them, like MathScene's work). */
  simTables: Readonly<Record<string, readonly TableRow[]>>;
  /** A predict-then-observe answer: the option picked, and the values and observed reading (a number or a state) before the change. */
  simPredict: { chapter: string; guess: string; before: SimValues; value: number | string } | null;
  /** "Run again" (the try-it button, key G): a count and the timeline outputs it plays from the start (the stage watches the count). */
  simReplay: { n: number; ids: readonly string[] };
  /** QA (`__atlas.engine.simSeek`): hold timeline `id` at model time `t` (a new `n` each request). */
  simSeek: { id: string; t: number; n: number } | null;
}

export type SpaceUiStore = StoreApi<SpaceUiState>;

export function createSpaceUi(): SpaceUiStore {
  return createStore<SpaceUiState>()(() => ({
    orbit: false,
    reference: null,
    nextTweenMs: null,
    beatCamera: null,
    presenting: false,
    cover: false,
    model: { state: 'none', progress: 0 },
    meshBounds: null,
    exerciseBody: null,
    simTables: {},
    simPredict: null,
    simReplay: { n: 0, ids: [] },
    simSeek: null,
  }));
}

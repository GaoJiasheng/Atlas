/**
 * The engine side of the presentation (docs/06 "演示系统（core）"): what an
 * engine implements so `usePresentation` can run beats over its stage. Core
 * owns the beat order, the caption card and progress bar, auto-play, voice,
 * audio clips, the beat keys and leaving / restoring the scene; the engine
 * only says what a beat looks like on its stage.
 */
import type { ReactNode } from 'react';
import type { Chapter, Locale, OrbitCamera } from '../types';
import type { Beat, BeatBase } from './beats';

export interface PresentationAdapter<B extends BeatBase = BeatBase, S = unknown> {
  /** The chapter's own beats from its state; `undefined` or empty = one default beat (summary / question / title as caption). */
  beatsOf(chapter: Chapter): readonly B[] | undefined;
  /** The caption shown and spoken for `beat` in `locale` (plain text). */
  captionOf(beat: Beat<B>, locale: Locale): string;
  /**
   * Put the stage in the beat's state (camera, time, layers, parts …), animated
   * unless `instant`. A returned promise, when the engine has no
   * `afterCameraSettle`, tells auto-play and voice when the beat has settled.
   */
  applyBeat(beat: Beat<B>, options: { instant: boolean }): Promise<void> | void;
  /** The scene before the presentation starts (called once, on entering). */
  saveState(): S;
  /** Put the saved scene back (on leaving: ESC, P, H, "show HUD"). */
  restoreState(state: S): void;
  /**
   * Resolves when the camera has settled after the last `applyBeat`; auto-play
   * and voice start counting then. Omitted (and no promise from `applyBeat`):
   * a fixed `BEAT_SETTLE_MS` after the beat starts.
   */
  afterCameraSettle?: () => Promise<void>;
  /** Called on entering, before `saveState`: leave modes the presentation excludes, drop selections. */
  onEnter?(): void;
  /** The caption card's header segment after the chapter title (TimeScene: the playhead's date); omitted = none. */
  readout?: ReactNode;
}

/**
 * SpaceScene's adapter (space-scene/View.tsx, docs/12 §8 G1): a beat of
 * `spaceChapterState.beats` (validated by `spaceBeat` in space-scene/schema.ts)
 * and the scene it saves on entering.
 */
export interface SpaceBeatSpec extends BeatBase {
  view?: 'assembled' | 'xray' | 'exploded' | 'isolate';
  part?: string | null;
  explode?: number;
  run?: boolean;
  cutaway?: 'none' | 'half';
  /** An orbit camera, or the id of a named preset (its camera only). */
  camera?: OrbitCamera | string;
  layers?: string[];
  /** Parts (or `group:<id>` groups) that get a leader label in this beat only (≤ 6). */
  labels?: string[];
  /** Parts hidden in this beat only (not cumulative). */
  hide?: string[];
}

export interface SpaceSavedState {
  chapter: string | null;
  layers: string[];
  /** The live camera (as the store keeps it, independent of the stage aspect). */
  camera: OrbitCamera | null;
  view: 'assembled' | 'xray' | 'exploded' | 'isolate';
  part: string | null;
  explode: number;
  run: boolean;
  cutaway: 'none' | 'half';
  hidden: string[];
  /** Leader labels of the beat on show (`null` = the chapter's own). */
  labels: string[] | null;
  /** ORBIT turntable on. */
  orbit: boolean;
  /** The VIEW preset lit before, and whether the camera had been moved since. */
  presetId: string | null;
  cameraFree: boolean;
}

export type SpacePresentationAdapter = PresentationAdapter<SpaceBeatSpec, SpaceSavedState>;

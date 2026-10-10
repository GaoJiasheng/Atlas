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
 * What SpaceScene's adapter (E2b, docs/12 §8 G1) will plug in: a beat of
 * `spaceChapterState.beats` and the scene fields it saves. A typed stub so
 * the contract is fixed before the engine side exists; nothing implements it yet.
 */
export interface SpaceBeatSpec extends BeatBase {
  view?: string;
  part?: string | null;
  explode?: number;
  run?: boolean;
  cutaway?: 'none' | 'half';
  camera?: OrbitCamera;
  layers?: string[];
  /** Parts (or groups) that get a leader label in this beat only (≤ 6). */
  labels?: string[];
  /** Parts hidden in this beat only (not cumulative). */
  hide?: string[];
}

export interface SpaceSavedState {
  chapter: string | null;
  layers: string[];
  camera: OrbitCamera | null;
  view?: string;
  part?: string | null;
  explode?: number;
  run?: boolean;
  cutaway?: 'none' | 'half';
}

export type SpacePresentationAdapter = PresentationAdapter<SpaceBeatSpec, SpaceSavedState>;

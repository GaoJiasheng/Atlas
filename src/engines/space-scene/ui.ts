/**
 * Engine-local UI state shared by the View (HUD controls) and the WebGL
 * stage (separate React roots): ORBIT turntable, REFERENCE mode, the
 * presentation (on, and the leader labels of the beat on show) and the cover
 * camera (HUD hidden). None of it
 * goes into the URL; a chapter change ends ORBIT and REFERENCE.
 */
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { OrbitCamera } from '../core/types';
import type { SpaceSceneExt } from './index';

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
  /** PRESENTATION on (leader labels stay with the HUD hidden). */
  presenting: boolean;
  /** Leader labels of the beat on show (`null`: the chapter's own). */
  beatLabels: string[] | null;
  /** HUD hidden outside the presentation: the stage frames the cover camera (and goes back when the HUD returns). */
  cover: boolean;
}

export type SpaceUiStore = StoreApi<SpaceUiState>;

export function createSpaceUi(): SpaceUiStore {
  return createStore<SpaceUiState>()(() => ({ orbit: false, reference: null, nextTweenMs: null, presenting: false, beatLabels: null, cover: false }));
}

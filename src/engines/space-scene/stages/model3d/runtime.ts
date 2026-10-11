/**
 * Per-stage mutable runtime shared by frame callbacks (not React state: it
 * changes every frame). `energy` eases the "run" in and out; `phase` is
 * energy-weighted running time (drives animations and flows that run with
 * `run`); `elapsed` is wall time for always-on effects; `explode` is the
 * eased explode amount every part reads; `shadowDirty` asks for one shadow
 * map update (shadow maps do not auto-update, perf-lessons §2); `moved`
 * counts frames in which a part moved into a pose (labels re-check occlusion);
 * `contract`, `root` and `bonesMoved` carry the MotionDriver's output (rig,
 * contraction, exercise position) to the parts, labels and sites.
 */
import { createContext, useContext } from 'react';
import { Matrix4 } from 'three';

export interface StageRuntime {
  energy: number;
  phase: number;
  elapsed: number;
  explode: number;
  shadowDirty: boolean;
  moved: number;
  /** Contraction per part id (0..1), written by the MotionDriver every frame. */
  contract: Map<string, number>;
  /** The model's root transform (exercise mode turns the body): scene ← model. */
  root: Matrix4;
  /** Counts frames in which the skeleton or the root moved (skinned anchors, sites, labels re-measure). */
  bonesMoved: number;
}

export function createRuntime(run: boolean, explode: number): StageRuntime {
  return { energy: run ? 1 : 0, phase: 0, elapsed: 0, explode, shadowDirty: true, moved: 0, contract: new Map(), root: new Matrix4(), bonesMoved: 0 };
}

export const RuntimeContext = createContext<StageRuntime | null>(null);

export function useRuntime(): StageRuntime {
  const rt = useContext(RuntimeContext);
  if (!rt) throw new Error('useRuntime must be used inside the SpaceScene stage');
  return rt;
}

/**
 * Max frame delta we integrate (s): avoids big jumps after a stall, while
 * slow devices (software WebGL) still finish eases in a handful of frames.
 */
export const MAX_DT = 0.25;

/** Request another frame unless the tab is hidden (demand frameloop). */
export function keepAnimating(invalidate: () => void): void {
  if (typeof document !== 'undefined' && document.hidden) return;
  invalidate();
}

/** `prefers-reduced-motion: reduce` (camera jumps instead of flying). */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

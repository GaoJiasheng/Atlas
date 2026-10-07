/**
 * Per-stage mutable runtime shared by frame callbacks (not React state: it
 * changes every frame). `energy` eases the "run" in and out; `phase` is
 * energy-weighted running time (drives animations and flows that run with
 * `run`); `elapsed` is wall time for always-on effects.
 */
import { createContext, useContext } from 'react';

export interface StageRuntime {
  energy: number;
  phase: number;
  elapsed: number;
}

export function createRuntime(run: boolean): StageRuntime {
  return { energy: run ? 1 : 0, phase: 0, elapsed: 0 };
}

export const RuntimeContext = createContext<StageRuntime | null>(null);

export function useRuntime(): StageRuntime {
  const rt = useContext(RuntimeContext);
  if (!rt) throw new Error('useRuntime must be used inside the SpaceScene stage');
  return rt;
}

/** Max frame delta we integrate (s): avoids jumps after the tab was hidden. */
export const MAX_DT = 0.1;

/** Request another frame unless the tab is hidden (demand frameloop). */
export function keepAnimating(invalidate: () => void): void {
  if (typeof document !== 'undefined' && document.hidden) return;
  invalidate();
}

/** `prefers-reduced-motion: reduce` (camera jumps instead of flying, no glow pulse). */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

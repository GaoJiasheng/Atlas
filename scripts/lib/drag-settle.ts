/**
 * When `pnpm shoot --keys` may judge its "dragging the stage frees the camera"
 * check (scripts/shoot.ts), pure so it is unit-tested (tests/drag-settle.test.ts).
 *
 * SpaceScene writes a drag back to the store (FREE CAMERA) once the damped orbit
 * stops moving. Damping is frame-count based, and the camera counts as moving
 * while it travels more than 0.001 world units a frame, so the time this takes
 * grows with the frame time and the scene's size: a heavy, building-sized model
 * (energy-conversion: ~4 fps under software GL, the camera 25 m out) needs
 * about 20 s. So the check waits while the live camera is still moving, and
 * judges once it has come to rest. An engine without a live camera in its
 * stats (TimeScene) gets a fixed wait.
 */

export interface DragSample {
  /** ms since the drag started (the first sample is taken just before it). */
  at: number;
  /** The scene says no preset is active. */
  free: boolean;
  /** The live camera, serialised, or null when the engine does not report one. */
  camera: string | null;
}

export type DragVerdict = 'wait' | 'free' | 'still' | 'unmoved' | 'timeout';

export interface DragSettleOptions {
  /** The live camera unchanged this long (ms): it has come to rest. */
  still: number;
  /** Give up after this long (ms) even if the camera still moves. */
  cap: number;
  /** Without a live camera: the fixed wait (ms). */
  blind: number;
}

export const DRAG_SETTLE: DragSettleOptions = { still: 2000, cap: 90_000, blind: 16_000 };

/**
 * `free` once a sample is free; `unmoved` (the drag never reached the camera)
 * or `still` (it moved and came to rest, but no preset was released) once the
 * live camera has not changed for `still` ms; `timeout` past the cap; else `wait`.
 */
export function dragVerdict(samples: readonly DragSample[], o: DragSettleOptions = DRAG_SETTLE): DragVerdict {
  const last = samples.at(-1);
  if (!last) return 'wait';
  if (last.free) return 'free';
  if (last.camera === null) return last.at >= o.blind ? 'timeout' : 'wait';
  let since = samples.length - 1;
  while (since > 0 && samples[since - 1]!.camera === last.camera) since--;
  if (last.at - samples[since]!.at >= o.still) return since === 0 ? 'unmoved' : 'still';
  return last.at >= o.cap ? 'timeout' : 'wait';
}

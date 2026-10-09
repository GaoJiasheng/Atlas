/**
 * The playhead: the continuous numeric time the stage renders at.
 *
 * The store keeps `t` as a TimePoint (day / 0.01 Ma precision, in the URL).
 * The playhead moves smoothly between those values: it tweens toward a new
 * chapter's time, follows the scrubber and playback every frame, and is read
 * imperatively by the map (no React render per frame).
 */
export type PlayheadListener = (t: number, prev: number) => void;

export interface TweenOptions {
  from?: number;
  onDone?(completed: boolean): void;
}

export interface Playhead {
  get(): number;
  /** Jump (cancels a running tween). */
  set(t: number): void;
  /**
   * Animate to `t` over `ms` (ease in-out), optionally starting from `from` instead of the
   * current value. `onDone(true)` fires when the tween lands exactly on `t`; `onDone(false)`
   * when anything else (a jump, a drag, a newer tween, destroy) cancels it first.
   */
  tweenTo(t: number, ms: number, options?: TweenOptions): void;
  /** Stop a running tween where it is. */
  cancelTween(): void;
  subscribe(listener: PlayheadListener): () => void;
  destroy(): void;
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

export function createPlayhead(initial: number): Playhead {
  let value = initial;
  let raf = 0;
  let pending: ((completed: boolean) => void) | null = null;
  const listeners = new Set<PlayheadListener>();

  const emit = (next: number) => {
    const prev = value;
    value = next;
    if (prev !== next) for (const l of listeners) l(next, prev);
  };

  const cancelTween = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    const done = pending;
    pending = null;
    done?.(false);
  };

  return {
    get: () => value,
    set(t) {
      cancelTween();
      emit(t);
    },
    tweenTo(t, ms, options) {
      cancelTween();
      if (options?.from !== undefined) emit(options.from);
      const from = value;
      if (ms <= 0 || from === t) {
        emit(t);
        options?.onDone?.(true);
        return;
      }
      pending = options?.onDone ?? null;
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / ms);
        // The last frame lands exactly on `t` (no float drift from the ease).
        emit(k >= 1 ? t : from + (t - from) * easeInOut(k));
        if (k < 1) {
          raf = requestAnimationFrame(step);
          return;
        }
        raf = 0;
        const done = pending;
        pending = null;
        done?.(true);
      };
      raf = requestAnimationFrame(step);
    },
    cancelTween,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      cancelTween();
      listeners.clear();
    },
  };
}

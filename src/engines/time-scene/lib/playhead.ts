/**
 * The playhead: the continuous numeric time the stage renders at.
 *
 * The store keeps `t` as a TimePoint (day / 0.01 Ma precision, in the URL).
 * The playhead moves smoothly between those values: it tweens toward a new
 * chapter's time, follows the scrubber and playback every frame, and is read
 * imperatively by the map (no React render per frame).
 */
export type PlayheadListener = (t: number, prev: number) => void;

export interface Playhead {
  get(): number;
  /** Jump (cancels a running tween). */
  set(t: number): void;
  /** Animate to `t` over `ms` (ease in-out). */
  tweenTo(t: number, ms: number): void;
  cancelTween(): void;
  subscribe(listener: PlayheadListener): () => void;
  destroy(): void;
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

export function createPlayhead(initial: number): Playhead {
  let value = initial;
  let raf = 0;
  const listeners = new Set<PlayheadListener>();

  const emit = (next: number) => {
    const prev = value;
    value = next;
    if (prev !== next) for (const l of listeners) l(next, prev);
  };

  const cancelTween = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  return {
    get: () => value,
    set(t) {
      cancelTween();
      emit(t);
    },
    tweenTo(t, ms) {
      cancelTween();
      const from = value;
      if (ms <= 0 || from === t) return emit(t);
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / ms);
        emit(from + (t - from) * easeInOut(k));
        raf = k < 1 ? requestAnimationFrame(step) : 0;
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

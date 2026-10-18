/**
 * Timeline outputs (docs/30 §4.4 F2, shared with docs/31 E-EN5; pure,
 * unit-tested): a model can give, besides numbers and states, a run of the
 * apparatus over time — the car rolling down the ramp, the block pulled
 * along, two balls falling, the wheel spinning down. A timeline is
 * `{ kind: 'timeline', key, duration, slow, channels }`:
 *
 *  - `channels`: named scalar channels, each either piecewise uniform
 *    acceleration (`segments`: x(t) = x0 + v0 (t − t0) + ½ a (t − t0)² on
 *    [t0, t1], held at the last segment's end value after it, at the first
 *    segment's start before it) or samples (`samples`: [t, x] pairs, ≤ 256,
 *    times ascending, linear in between, held outside);
 *  - `duration` (s, model time): the run ends there; deep links, screenshots,
 *    instant beat changes, REFERENCE, EXPLODED and reduced motion show the
 *    state at `duration` (the end state);
 *  - `slow`: the stage plays it this many times slower than real time (a fall
 *    of 0.45 s shown over 1.8 s; the try-it card says "slowed down 4 times");
 *  - `key`: what the run was worked out from (the model's own inputs): the
 *    stage plays a timeline again from the start only when its key changes.
 *
 * `play` bindings move or turn parts by a channel's value; `stretch`
 * bindings stretch a coil by one; force arrows take a channel as their
 * value (lib/sim/bind.ts, stages/model3d/SimOverlays.tsx).
 */

/** x(t) = x0 + v0 (t − t0) + ½ a (t − t0)² for t in [t0, t1]. */
export interface TimelineSegment {
  t0: number;
  t1: number;
  x0: number;
  v0: number;
  a: number;
}

export type TimelineChannel = { readonly segments: readonly TimelineSegment[] } | { readonly samples: readonly (readonly [number, number])[] };

export interface Timeline {
  kind: 'timeline';
  /** What the run depends on (a new key plays it again from the start). */
  key: string;
  /** Model seconds the run lasts; the end state is the state at this time. */
  duration: number;
  /** Shown this many times slower than real time (1 = real time). */
  slow: number;
  channels: Readonly<Record<string, TimelineChannel>>;
}

/** At most this many samples in a sampled channel. */
export const MAX_SAMPLES = 256;

/** A run that does not move anything (a sub-model switched off). */
export const EMPTY_TIMELINE: Timeline = Object.freeze({ kind: 'timeline', key: '', duration: 0, slow: 1, channels: Object.freeze({}) }) as Timeline;

export function isTimeline(v: unknown): v is Timeline {
  return typeof v === 'object' && v !== null && (v as { kind?: unknown }).kind === 'timeline';
}

/** One segment's value at t (clamped to its span). */
export function segmentValue(s: TimelineSegment, t: number): number {
  const d = Math.min(Math.max(t, s.t0), s.t1) - s.t0;
  return s.x0 + s.v0 * d + 0.5 * s.a * d * d;
}

/** A channel's value at model time t (0 for a channel the timeline does not have). */
export function channelValue(tl: Timeline | undefined | null, name: string, t: number): number {
  const c = tl?.channels[name];
  if (!c) return 0;
  if ('segments' in c) {
    const list = c.segments;
    if (list.length === 0) return 0;
    if (t <= list[0]!.t0) return list[0]!.x0;
    for (const s of list) if (t <= s.t1) return t < s.t0 ? segmentValue(s, s.t0) : segmentValue(s, t);
    return segmentValue(list[list.length - 1]!, Infinity);
  }
  const xs = c.samples;
  if (xs.length === 0) return 0;
  if (t <= xs[0]![0]) return xs[0]![1];
  const last = xs[xs.length - 1]!;
  if (t >= last[0]) return last[1];
  // Binary search for the sample pair around t.
  let lo = 0;
  let hi = xs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid]![0] <= t) lo = mid;
    else hi = mid;
  }
  const [ta, xa] = xs[lo]!;
  const [tb, xb] = xs[hi]!;
  return tb > ta ? xa + ((xb - xa) * (t - ta)) / (tb - ta) : xb;
}

/** A channel's value in the end state. */
export function endValue(tl: Timeline | undefined | null, name: string): number {
  return channelValue(tl, name, tl?.duration ?? 0);
}

/** The largest |value| a channel takes over the run (segments: ends and turning points; samples: every sample). */
export function channelPeak(tl: Timeline | undefined | null, name: string): number {
  const c = tl?.channels[name];
  if (!c) return 0;
  if ('samples' in c) return c.samples.reduce((m, [, x]) => Math.max(m, Math.abs(x)), 0);
  let m = 0;
  for (const s of c.segments) {
    m = Math.max(m, Math.abs(segmentValue(s, s.t0)), Math.abs(segmentValue(s, s.t1)));
    if (s.a !== 0) {
      const turn = s.t0 - s.v0 / s.a;
      if (turn > s.t0 && turn < s.t1) m = Math.max(m, Math.abs(segmentValue(s, turn)));
    }
  }
  return m;
}

/** Uniform acceleration from (x0, v0) over [t0, t1]: one segment. */
export function seg(t0: number, t1: number, x0: number, v0 = 0, a = 0): TimelineSegment {
  return { t0, t1, x0, v0, a };
}

/** Thin samples to at most `MAX_SAMPLES`, always keeping the first and the last. */
export function thinSamples(xs: readonly (readonly [number, number])[]): [number, number][] {
  if (xs.length <= MAX_SAMPLES) return xs.map(([t, x]) => [t, x]);
  const out: [number, number][] = [];
  const step = (xs.length - 1) / (MAX_SAMPLES - 1);
  for (let i = 0; i < MAX_SAMPLES; i++) {
    const [t, x] = xs[Math.round(i * step)]!;
    out.push([t, x]);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Playback (the stage's clock; pure so the rules are tested)          */
/* ------------------------------------------------------------------ */

/** Seconds between a value change and the run starting again (the reader sees the start state first). */
export const AUTO_PLAY_DELAY = 0.4;

/** Where one timeline's playback is: model time `t`, playing or not, a delay (real seconds) before it starts. */
export interface Playback {
  key: string;
  t: number;
  playing: boolean;
  wait: number;
  timeline: Timeline;
}

/** A timeline first seen (page load, a deep link): shown at its end. */
export function startPlayback(tl: Timeline): Playback {
  return { key: tl.key, t: tl.duration, playing: false, wait: 0, timeline: tl };
}

/**
 * A new run of this timeline: a changed key plays it again from the start
 * after `AUTO_PLAY_DELAY` (or jumps to the end: `still`, for instant
 * transitions, REFERENCE, EXPLODED, reduced motion); the same key keeps the
 * playback where it is (another control changed).
 */
export function updatePlayback(p: Playback, tl: Timeline, still: boolean): Playback {
  if (tl.key === p.key) return { ...p, timeline: tl, t: Math.min(p.t, tl.duration) };
  if (still || tl.duration <= 0) return { key: tl.key, t: tl.duration, playing: false, wait: 0, timeline: tl };
  return { key: tl.key, t: 0, playing: true, wait: AUTO_PLAY_DELAY, timeline: tl };
}

/** "Run again" (button, key G): from the start, right away. */
export function replayPlayback(p: Playback): Playback {
  return p.timeline.duration > 0 ? { ...p, t: 0, playing: true, wait: 0 } : p;
}

/** Advance by `dt` real seconds (at 1 ÷ `slow` speed after the wait); true while it is still playing. */
export function stepPlayback(p: Playback, dt: number): boolean {
  if (!p.playing) return false;
  let left = dt;
  if (p.wait > 0) {
    const w = Math.min(p.wait, left);
    p.wait -= w;
    left -= w;
  }
  p.t += left / Math.max(1, p.timeline.slow);
  if (p.t >= p.timeline.duration) {
    p.t = p.timeline.duration;
    p.playing = false;
  }
  return p.playing;
}

/** Stop where it is and show the end state (EXPLODED, REFERENCE, reduced motion, a snap). */
export function endPlayback(p: Playback): void {
  p.t = p.timeline.duration;
  p.playing = false;
  p.wait = 0;
}

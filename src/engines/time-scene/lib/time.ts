/**
 * Numeric time for the TimeScene engine. Every `TimePoint` maps to one number
 * on a continuous axis so the timeline, playback and interpolation can do
 * arithmetic:
 *
 *   ISO date  -> decimal year at the start of the period
 *                ('1942' = 1942.0, '1942-02' = 1942 + 31/365, '-0221' = -221.0)
 *   { ma }    -> negative years (`{ ma: 200 }` = -200_000_000)
 *
 * Both are "years"; the two scales never mix inside one topic (the schema
 * rejects it), so the scale is carried alongside where it matters.
 * Pure functions, unit-tested in tests/time-scene/time.test.ts.
 */
import { isGeoTime, isoDateToMs, type TimePoint, type TimeScale } from '../../../lib/time';

export type { TimePoint, TimeScale };
export type DatePrecision = 'day' | 'month' | 'year';

const MS_PER_DAY = 86_400_000;
const DATE_RE = /^(-?\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

export function clamp(n: number, min: number, max: number): number {
  return n < min ? min : n > max ? max : n;
}

/** UTC ms at 00:00 on 1 January of `year` (works for years < 100 and BCE). */
function yearStartMs(year: number): number {
  const d = new Date(Date.UTC(2000, 0, 1));
  d.setUTCFullYear(year, 0, 1);
  return d.getTime();
}

export function scaleOf(t: TimePoint): TimeScale {
  return isGeoTime(t) ? 'ma' : 'date';
}

/** Precision of an ISO date string (`null` for geological time). */
export function precisionOf(t: TimePoint): DatePrecision | null {
  if (isGeoTime(t)) return null;
  const m = DATE_RE.exec(t);
  if (!m) return null;
  return m[3] ? 'day' : m[2] ? 'month' : 'year';
}

/** TimePoint -> number (see module doc). `NaN` for malformed input. */
export function toNumber(t: TimePoint): number {
  if (isGeoTime(t)) return t.ma === 0 ? 0 : -t.ma * 1e6;
  const ms = isoDateToMs(t);
  if (ms === null) return Number.NaN;
  const year = new Date(ms).getUTCFullYear();
  const start = yearStartMs(year);
  const end = yearStartMs(year + 1);
  return year + (ms - start) / (end - start);
}

/** Number of the first instant *after* the period `t` names (`'1942-02'` -> 1 March 1942). */
export function periodEnd(t: TimePoint): number {
  if (isGeoTime(t)) return toNumber(t);
  const m = DATE_RE.exec(t);
  const ms = isoDateToMs(t);
  if (!m || ms === null) return Number.NaN;
  const d = new Date(ms);
  if (m[3]) d.setUTCDate(d.getUTCDate() + 1);
  else if (m[2]) d.setUTCMonth(d.getUTCMonth() + 1);
  else d.setUTCFullYear(d.getUTCFullYear() + 1);
  const iso = isoFromDate(d, 'day');
  return toNumber(iso);
}

function pad(n: number, width: number): string {
  return String(Math.abs(n)).padStart(width, '0');
}

function isoFromDate(d: Date, precision: DatePrecision): string {
  const y = d.getUTCFullYear();
  const year = `${y < 0 ? '-' : ''}${pad(y, 4)}`;
  if (precision === 'year') return year;
  const month = `${year}-${pad(d.getUTCMonth() + 1, 2)}`;
  if (precision === 'month') return month;
  return `${month}-${pad(d.getUTCDate(), 2)}`;
}

/**
 * Number -> TimePoint on `scale`. Dates are floored to `precision` (default
 * day); geological time is rounded to `maDigits` decimals of Ma (default 2).
 */
export function fromNumber(
  n: number,
  scale: TimeScale,
  options: { precision?: DatePrecision; maDigits?: number } = {},
): TimePoint {
  if (scale === 'ma') {
    const f = 10 ** (options.maDigits ?? 2);
    const ma = Math.round((-n / 1e6) * f) / f;
    return { ma: ma <= 0 ? 0 : ma };
  }
  const year = Math.floor(n);
  const start = yearStartMs(year);
  const end = yearStartMs(year + 1);
  const days = Math.round((end - start) / MS_PER_DAY);
  // Small epsilon so values produced by toNumber() round-trip exactly.
  const day = clamp(Math.floor((n - year) * days + 1e-6), 0, days - 1);
  return isoFromDate(new Date(start + day * MS_PER_DAY), options.precision ?? 'day');
}

/** Fraction 0..1 of the way from `from` to `to` at `t` (clamped; a zero-length span is 0 before, 1 from `from` on). */
export function progressAlong(from: number, to: number, t: number): number {
  if (!(to > from)) return t >= from ? 1 : 0;
  return clamp((t - from) / (to - from), 0, 1);
}

/** Share of each keyframe interval (at its end) over which control areas crossfade (docs/03). */
export const CROSSFADE_WINDOW = 0.3;
/** Opacity the previous keyframe fades down to by the end of the window. */
export const CROSSFADE_FLOOR = 0.4;

export interface KeyframeWindow<K> {
  /** Index of the keyframe at or before `t` (-1 before the first). */
  prevIndex: number;
  /** Index of the keyframe after `t` (-1 after the last). */
  nextIndex: number;
  prev: K | null;
  next: K | null;
  /** 0 until the crossfade window starts, 1 at the next keyframe. */
  blend: number;
  /** prev fades 1 -> 0.4, next fades 0 -> 1 across the window. */
  prevOpacity: number;
  nextOpacity: number;
}

/**
 * Which control keyframes are visible at `t` and how strongly (docs/03):
 * between keyframes A and B, A shows alone until the last 30% of the
 * interval; across that window A fades 1 -> 0.4 and B fades 0 -> 1. At B's own
 * time B is the only keyframe shown. Before the first keyframe nothing shows;
 * after the last, the last stays. `keyframes` must be sorted by `t`.
 */
export function keyframeWindow<K>(keyframes: readonly K[], t: number, timeOf: (k: K) => number): KeyframeWindow<K> {
  let prevIndex = -1;
  for (let i = 0; i < keyframes.length; i++) {
    if (timeOf(keyframes[i] as K) <= t) prevIndex = i;
    else break;
  }
  const nextIndex = prevIndex + 1 < keyframes.length ? prevIndex + 1 : -1;
  const prev = prevIndex >= 0 ? (keyframes[prevIndex] as K) : null;
  const next = nextIndex >= 0 ? (keyframes[nextIndex] as K) : null;

  let blend = 0;
  if (prev && next) {
    const a = timeOf(prev);
    const b = timeOf(next);
    blend = progressAlong(b - (b - a) * CROSSFADE_WINDOW, b, t);
  }
  return {
    prevIndex,
    nextIndex,
    prev,
    next,
    blend,
    prevOpacity: prev ? 1 - (1 - CROSSFADE_FLOOR) * blend : 0,
    nextOpacity: prev && next ? blend : 0,
  };
}

/** A sensible nudge step (Shift+←/→) for a span, in the axis unit (years). */
export function stepFor(span: number, scale: TimeScale): number {
  if (scale === 'ma') return Math.max(span / 100, 1e4);
  if (span <= 12) return 1 / 365;
  if (span <= 100) return 1 / 12;
  return 1;
}

/** Date precision worth showing for a span (readout and URL). */
export function precisionFor(span: number): DatePrecision {
  if (span <= 12) return 'day';
  if (span <= 100) return 'month';
  return 'year';
}

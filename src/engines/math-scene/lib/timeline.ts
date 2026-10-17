/**
 * The timeline (docs/20 §3.2, model A3b), pure: the range a timeline covers
 * (a whole day, a span of hours, or a duration from 0), its hour and minor
 * marks, the arcs of its jumps, and the jumps a child makes on a `duration`
 * check with the tray's chips (+1 h, +10 min, +5 min, +1 min, or back): the
 * chip presses are kept, and a run of minute presses that has not reached an
 * hour mark grows one arc ("+ 20 min"), the way the jumps are drawn in class.
 */
import type { Task, TimelineSpec } from '../schema';
import { DAY, HOUR, MINUTE } from './value';

export interface Range {
  from: number;
  to: number;
  /** Positions are durations from 0 (a duration scale), not times of day. */
  duration: boolean;
}

/** The range a timeline covers. */
export function rangeOf(m: TimelineSpec): Range {
  if (m.scale === 'day') return { from: 0, to: DAY, duration: false };
  if (m.scale === 'duration') return { from: 0, to: m.to ?? 2 * HOUR, duration: true };
  return { from: m.from ?? 0, to: m.to ?? (m.from ?? 0) + 3 * HOUR, duration: false };
}

/** The minor marks' spacing in minutes (default: 1 h on a day, 10 min on a span or duration ≤ 3 h, else 30). */
export function minorOf(m: TimelineSpec): number {
  if (m.minor) return m.minor;
  const r = rangeOf(m);
  if (m.scale === 'day') return 60;
  return r.to - r.from <= 3 * HOUR ? 10 : 30;
}

/** The hour marks of a range (whole hours inside it). */
export function hourMarks(r: Range): number[] {
  const out: number[] = [];
  for (let t = Math.ceil(r.from / HOUR) * HOUR; t <= r.to; t += HOUR) out.push(t);
  return out;
}

/** The minor marks (not on an hour). */
export function minorMarks(r: Range, minor: number): number[] {
  const step = minor * MINUTE;
  if (step >= HOUR) return [];
  const out: number[] = [];
  for (let t = Math.ceil(r.from / step) * step; t <= r.to; t += step) if (t % HOUR !== 0) out.push(t);
  return out;
}

/** The hour labels that fit: every hour, or every 2nd, 3rd, 6th one when an hour is narrower than `minPx`. */
export function labelEvery(r: Range, width: number, minPx: number): number {
  const hours = Math.max(1, (r.to - r.from) / HOUR);
  for (const k of [1, 2, 3, 6]) if ((width / hours) * k >= minPx) return k;
  return 12;
}

/* ------------------------------------------------------------------ */
/* The child's jumps on a duration check                               */
/* ------------------------------------------------------------------ */

/** The tray's chips, in seconds. */
export const HOP_CHIPS = [HOUR, 10 * MINUTE, 5 * MINUTE, MINUTE] as const;

/** Where the jumps start (the time known first) and which way they go. */
export function hopStart(task: Task): { at: number; dir: 1 | -1 } | null {
  if (task.kind !== 'duration') return null;
  if (task.ask === 'start') return task.end === undefined ? null : { at: task.end, dir: -1 };
  return task.start === undefined ? null : { at: task.start, dir: 1 };
}

/** The range the jumps stay in (the task's timeline). */
export function hopRange(task: Task): Range | null {
  return task.model.kind === 'timeline' ? rangeOf(task.model) : null;
}

/** Where the child's jumps have got to. */
export function hopEnd(task: Task, hops: readonly number[]): number | null {
  const s = hopStart(task);
  return s ? hops.reduce((t, h) => t + h, s.at) : null;
}

/** The arcs the child's chip presses draw: an hour press is its own arc; minute presses join until an hour mark is reached. */
export function hopArcs(task: Task, hops: readonly number[]): [number, number][] {
  const s = hopStart(task);
  if (!s) return [];
  const arcs: [number, number][] = [];
  let at = s.at;
  let joining = false;
  for (const h of hops) {
    const to = at + h;
    if (Math.abs(h) < HOUR && joining && arcs.length) arcs[arcs.length - 1]![1] = to;
    else arcs.push([at, to]);
    // Minute presses keep growing this arc until it lands on an hour mark.
    joining = Math.abs(h) < HOUR && to % HOUR !== 0;
    at = to;
  }
  return arcs;
}

/** Can the child press this chip (the point stays on the line)? */
export function canHop(task: Task, hops: readonly number[], by: number): boolean {
  const end = hopEnd(task, hops);
  const r = hopRange(task);
  if (end === null || !r) return false;
  const to = end + by;
  return to >= r.from && to <= r.to;
}

/** The chip presses that get from the known time to the answer: to the next hour mark, whole hours, the minutes left (the solution's jumps). */
export function hopsTo(from: number, to: number): number[] {
  const dir = to >= from ? 1 : -1;
  const out: number[] = [];
  let at = from;
  const left = () => Math.abs(to - at);
  const toMark = () => (dir > 0 ? (HOUR - (at % HOUR)) % HOUR : at % HOUR);
  const fill = (amount: number) => {
    for (const c of [10 * MINUTE, 5 * MINUTE, MINUTE])
      while (amount >= c) {
        out.push(dir * c);
        at += dir * c;
        amount -= c;
      }
  };
  if (toMark() > 0 && toMark() <= left()) fill(toMark());
  while (left() >= HOUR) {
    out.push(dir * HOUR);
    at += dir * HOUR;
  }
  fill(left());
  return out;
}

/** "+ 20 min", "− 1 h" (a jump's label; h / min in both languages, as in a number sentence). */
export function jumpLabel(from: number, to: number): string {
  const d = Math.abs(to - from);
  const h = Math.floor(d / HOUR);
  const m = Math.round((d % HOUR) / MINUTE);
  const text = [h ? `${h} h` : '', m || !h ? `${m} min` : ''].filter(Boolean).join(' ');
  return `${to >= from ? '+' : '−'} ${text}`;
}

/**
 * The clock face (docs/20 §3.1, model A3a), pure: where the hands point, how
 * a drag or a key moves them (the hour hand always follows the minute hand,
 * as on a real clock), the time a `set-clock` check holds, and the sweep from
 * one beat's time to the next. Angles are degrees clockwise from 12.
 *
 * The hand angles are kept unbounded (minute = t / 10, hour = t / 120, second
 * = 6 t, for t seconds since midnight): a CSS transition between two of them
 * turns the hands the right number of times in the right direction, so a
 * `sweep` from 3:00 to 3:30 turns the minute hand half a turn clockwise and
 * one from 3:40 back to 2:45 turns it back anticlockwise.
 */
import type { ClockFaceSpec, ClockModelSpec, Task } from '../schema';
import { clockParts, DAY, HOUR, MINUTE } from './value';

export const HALF_DAY = 12 * HOUR;

/** The minute hand's angle (unbounded): 6° a minute, 0.1° a second. */
export const minuteAngle = (t: number): number => t / 10;
/** The hour hand's angle (unbounded): 30° an hour, 0.5° a minute, 1/120° a second. */
export const hourAngle = (t: number): number => t / 120;
/** The second hand's angle (unbounded): 6° a second. */
export const secondAngle = (t: number): number => 6 * t;

/** An angle on the dial, 0 ≤ a < 360. */
export const dial = (a: number): number => ((a % 360) + 360) % 360;

/** The hands of a face at time `t`: drawn true, or wrong on purpose (`faulty`). */
export function handAngles(t: number, faulty?: ClockFaceSpec['faulty']): { hour: number; minute: number; second: number; swapped: boolean } {
  // The hour hand pointing straight at the hour's number, whatever the minutes (a clock that cannot be real).
  const hour = faulty === 'hour-on-numeral' ? 30 * Math.floor(t / HOUR) : hourAngle(t);
  return { hour, minute: minuteAngle(t), second: secondAngle(t), swapped: faulty === 'hands-swapped' };
}

/** A stopwatch's hands for `elapsed` seconds: the big hand the seconds (6° each), the small dial's hand the minutes of 30 (12° each). */
export function stopwatchAngles(elapsed: number): { seconds: number; minutes: number } {
  return { seconds: 6 * elapsed, minutes: (elapsed / 60) * 12 };
}

/** The pointer's angle from the centre (screen y down), clockwise from 12. */
export function pointerAngle(dx: number, dy: number): number {
  return dial((Math.atan2(dx, -dy) * 180) / Math.PI);
}

/** The signed turn from one dial angle to another, −180 < d ≤ 180. */
export function turn(from: number, to: number): number {
  const d = dial(to - from);
  return d > 180 ? d - 360 : d;
}

/** A set clock's time kept on its dial: within 12 hours, or within the day when its am / pm is set too. */
export function onDial(t: number, ampm: boolean): number {
  const span = ampm ? DAY : HALF_DAY;
  return ((Math.round(t) % span) + span) % span;
}

/** Round to the snap (whole minutes). */
export function snapTo(t: number, snap: number): number {
  const s = snap * MINUTE;
  return Math.round(t / s) * s;
}

/**
 * Drag the minute hand to `angle`: it turns the short way from where it is,
 * so passing 12 clockwise moves the hour on and anticlockwise moves it back;
 * the hour hand follows.
 */
export function dragMinute(t: number, angle: number, snap: number, ampm: boolean): number {
  const d = turn(dial(minuteAngle(t)), angle);
  return onDial(snapTo(t + d * 10, snap), ampm);
}

/** Drag the hour hand to `angle`: it moves in whole hours, the minutes stay. */
export function dragHour(t: number, angle: number, ampm: boolean): number {
  const m = t % HOUR;
  const now = Math.floor((((t % HALF_DAY) + HALF_DAY) % HALF_DAY) / HOUR);
  // The hour whose sector (with this many minutes) the pointer is nearest.
  const want = Math.round(dial(angle - hourAngle(m)) / 30) % 12;
  const d = ((want - now + 18) % 12) - 6;
  return onDial(t + d * HOUR, ampm);
}

/** The minute hand put on numeral `k` (1–12): that many fives, the hour kept. */
export function toNumeral(t: number, k: number, ampm: boolean): number {
  const hourStart = t - (t % HOUR);
  return onDial(hourStart + ((k % 12) * 5) * MINUTE, ampm);
}

/** Step the clock by `by` seconds (the tray's −/+ and the keys). */
export const nudge = (t: number, by: number, snap: number, ampm: boolean): number => onDial(snapTo(t + by, snap), ampm);

/** The time a `set-clock` check starts at: the model's time on its dial. */
export function clockStart(task: Task): number {
  if (task.kind !== 'set-clock' || task.model.kind !== 'clock') return 0;
  return onDial(task.model.time, !!task.ampm);
}

/** The time a set clock shows (the child's, or where it starts). */
export const clockShown = (task: Task, set: number | null): number => (set === null ? clockStart(task) : set);

/** Is the clock set to the target (its 12-hour position; with am / pm, the time of day)? */
export function clockSetRight(task: Task, set: number | null): boolean {
  if (task.kind !== 'set-clock') return false;
  const t = clockShown(task, set);
  return task.ampm ? t === task.target : t % HALF_DAY === task.target % HALF_DAY;
}

/** The faces a clock model draws (one, or the pair). */
export const facesOf = (m: ClockModelSpec): ClockFaceSpec[] => m.pair ?? [m];

/** The time a face reads as (a stopwatch: its elapsed time). */
export function faceTime(f: ClockFaceSpec): number {
  return f.face === 'stopwatch' ? (f.elapsed?.t ?? 0) : f.time;
}

/** How long a sweep from `from` to `to` takes: ≤ 900 ms, long turns compressed (docs/20 §3.1). */
export function sweepMs(from: number, to: number): number {
  const d = Math.abs(to - from);
  if (d === 0) return 0;
  return Math.round(Math.min(900, 380 + 520 * Math.min(1, d / (2 * HOUR))));
}

/** The 12-hour position of a time as `h:mm` (tests, mono labels). */
export function faceLabel(t: number): string {
  const p = clockParts(t);
  return `${p.h12}:${String(p.m).padStart(2, '0')}`;
}

/**
 * How a shifted part moves (docs/38 §4.3 E-LT2; pure, unit-tested): from
 * where it is to its new offset over `ease` seconds, eased in and out, on an
 * arc `lift` high at the middle (picked up and put down); when several parts
 * move at once each starts `stagger` seconds after the one before it in the
 * vector's order. Parts the model hides do not move (they fade where they
 * are) and take no place in the queue.
 */
import { easeInOutCubic, type Vec3 } from '../math';
import type { SimShift } from './bind';

/** Offsets this close count as the same place (scene units). */
const SAME = 1e-9;

const same = (a: Vec3 | undefined, b: Vec3) => a !== undefined && Math.abs(a[0] - b[0]) < SAME && Math.abs(a[1] - b[1]) < SAME && Math.abs(a[2] - b[2]) < SAME;

/**
 * Seconds each part waits before it moves, for parts whose offset changed
 * from `prev` (in vector order: 0, stagger, 2 × stagger …); `hidden`: parts
 * the model does not show (they stay put).
 */
export function shiftDelays(prev: ReadonlyMap<string, Vec3>, next: ReadonlyMap<string, SimShift>, hidden: ReadonlySet<string>): Map<string, number> {
  const moved = [...next].filter(([id, s]) => !hidden.has(id) && !same(prev.get(id), s.offset)).sort((a, b) => a[1].order - b[1].order);
  return new Map(moved.map(([id, s], rank) => [id, rank * s.stagger]));
}

/**
 * Where a part is `t` of the way (0–1, clamped) from `from` to `to`: eased
 * in and out, plus `lift` × sin(π × eased t) on y (the middle is `lift` above
 * the straight line). Writes into `out`.
 */
export function shiftPoint(from: Vec3, to: Vec3, t: number, lift: number, out: Vec3): Vec3 {
  const e = easeInOutCubic(Math.max(0, Math.min(1, t)));
  for (let i = 0; i < 3; i++) out[i] = from[i]! + (to[i]! - from[i]!) * e;
  out[1] += lift * Math.sin(Math.PI * e);
  return out;
}

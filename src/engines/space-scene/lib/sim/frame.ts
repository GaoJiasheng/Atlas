/**
 * Rigid (affine) moves of scene points for the magnet model (pure,
 * unit-tested): a part's frame from its pose and try-it turn and offset, the
 * same stack as PartNode (pose about its pivot → turn about the pivot or the
 * posed centre → offset), without explode, put-aside and animations.
 */
import type { PartTransform } from '../pose';
import type { SimTurn } from './bind';
import { apply3, axisAngle, eulerDeg, IDENTITY3, mul3, type Mat3 } from '../xform';
import { DEG2RAD, type Vec3 } from '../math';

/** An affine move of scene points: x′ = r · x + t. */
export interface Frame {
  r: Mat3;
  t: Vec3;
}

/** Per magnet id: where its part has moved it (magnets without a `part`, or at rest, are not listed). */
export type MagnetFrames = ReadonlyMap<string, Frame>;

export const IDENTITY_FRAME: Frame = { r: IDENTITY3, t: [0, 0, 0] };

export function applyFrame(f: Frame, p: readonly number[]): Vec3 {
  const x = apply3(f.r, p);
  return [x[0] + f.t[0], x[1] + f.t[1], x[2] + f.t[2]];
}

/** Turn `f` about the point `c` by `r` (applied after `f`). */
function turnAbout(f: Frame, r: Mat3, c: Vec3): Frame {
  const rc = apply3(r, c);
  const rt = apply3(r, f.t);
  return { r: mul3(r, f.r), t: [rt[0] + c[0] - rc[0], rt[1] + c[1] - rc[1], rt[2] + c[2] - rc[2]] };
}

/**
 * A part's frame: the pose (offset, then rotate · scale about its pivot,
 * default the part centre), then the turn about its pivot (default the posed
 * centre), then the offset.
 */
export function partFrame(centre: readonly number[], pose: PartTransform, offset: readonly number[] = [0, 0, 0], turn: Pick<SimTurn, 'axis' | 'deg' | 'pivot'> | null = null): Frame {
  const p: Vec3 = pose.pivot ?? [centre[0]!, centre[1]!, centre[2]!];
  const rs = eulerDeg(pose.rotation);
  const r = mul3(rs, [pose.scale[0], 0, 0, 0, pose.scale[1], 0, 0, 0, pose.scale[2]]);
  const rp = apply3(r, p);
  let f: Frame = { r, t: [p[0] + pose.offset[0] - rp[0], p[1] + pose.offset[1] - rp[1], p[2] + pose.offset[2] - rp[2]] };
  if (turn && turn.deg !== 0) f = turnAbout(f, axisAngle(turn.axis, turn.deg * DEG2RAD), turn.pivot ?? applyFrame(f, centre));
  return { r: f.r, t: [f.t[0] + (offset[0] ?? 0), f.t[1] + (offset[1] ?? 0), f.t[2] + (offset[2] ?? 0)] };
}

/** A frame as a cache key (micrometre / 1e-6 steps); '' for no move. */
export function frameKey(f: Frame | undefined): string {
  if (!f) return '';
  const all = [...f.r, ...f.t];
  if (all.every((x, i) => Math.abs(x - (i < 9 ? IDENTITY3[i]! : 0)) < 1e-9)) return '';
  return all.map((x) => (Math.round(x * 1e6) / 1e6).toString()).join(',');
}

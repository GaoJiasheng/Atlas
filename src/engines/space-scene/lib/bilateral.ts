/**
 * Bilateral parts (docs/06 §SpaceScene "organisms", pure, unit-tested). A part
 * with `bilateral` describes one side of a symmetric pair; the data is expanded
 * at build time (parts.json → data.json) into the part and its mirror twin
 * `<id>-r` (or `<id>-l` when the data draws the right side), reflected in the
 * scene plane through the origin normal to `axis` (default `z`: the midline
 * plane z = 0 of a model whose body runs along X with +Z its left side).
 *
 * The twin is a full part: geometry, material, explode direction, the
 * animations aimed at the part, pose entries, and `connects` to other
 * bilateral parts are all mirrored, so every consumer (bounds, labels,
 * elevation, picking, flows) treats it like any other part. A reflection
 * turns a rotation about axis `a` by θ into a rotation about −M·a by θ
 * (an axial vector), Euler angles about the other two axes change sign,
 * and the primitive's own frame is flipped along the same axis (a negative
 * `scale` component, which the geometry bakes with its winding fixed).
 */
import type { Vec3 } from './math';

export type MirrorAxis = 'x' | 'y' | 'z';
export type Side = 'left' | 'right';

/** Normalised `bilateral` setting of a part or a flow. */
export interface BilateralSpec {
  axis: MirrorAxis;
  /** The side the data draws; the twin is the other one. */
  side: Side;
  /** Leader labels name both sides (one placard each); default: the data side only. */
  labelBoth: boolean;
}

export type BilateralInput = true | { axis?: MirrorAxis; side?: Side; labelBoth?: boolean } | undefined;

export function bilateralSpec(b: BilateralInput): BilateralSpec | null {
  if (b === undefined) return null;
  if (b === true) return { axis: 'z', side: 'left', labelBoth: false };
  return { axis: b.axis ?? 'z', side: b.side ?? 'left', labelBoth: b.labelBoth ?? false };
}

export const otherSide = (side: Side): Side => (side === 'left' ? 'right' : 'left');

/** Id of the mirror twin: `<id>-r` for a left-side part, `<id>-l` for a right-side one. */
export function twinId(id: string, spec: Pick<BilateralSpec, 'side'>): string {
  return `${id}-${spec.side === 'left' ? 'r' : 'l'}`;
}

const AXIS: Record<MirrorAxis, number> = { x: 0, y: 1, z: 2 };

/** A point or direction reflected in the plane normal to `axis` through the origin. */
export function mirrorPoint(v: readonly number[], axis: MirrorAxis): Vec3 {
  const out: Vec3 = [v[0] ?? 0, v[1] ?? 0, v[2] ?? 0];
  out[AXIS[axis]] = -(out[AXIS[axis]] ?? 0);
  return out;
}

/** A rotation axis (axial vector) under the same reflection: the other two components change sign. */
export function mirrorAxial(v: readonly number[], axis: MirrorAxis): Vec3 {
  const out: Vec3 = [-(v[0] ?? 0), -(v[1] ?? 0), -(v[2] ?? 0)];
  out[AXIS[axis]] = -(out[AXIS[axis]] ?? 0);
  return out;
}

/** XYZ Euler angles (degrees) of M·R·M: the angles about the other two axes change sign. */
export function mirrorEuler(rotation: readonly number[], axis: MirrorAxis): Vec3 {
  return mirrorAxial(rotation, axis);
}

/** A local scale with the component along `axis` negated (the primitive's own frame flipped). */
export function flipScale(scale: readonly number[] | undefined, axis: MirrorAxis): Vec3 {
  const out: Vec3 = [scale?.[0] ?? 1, scale?.[1] ?? 1, scale?.[2] ?? 1];
  out[AXIS[axis]] = -(out[AXIS[axis]] ?? 0);
  return out;
}

/* ------------------------------------------------------------------ */
/* Data mirroring (structural types: works on the parsed parts.json)   */
/* ------------------------------------------------------------------ */

interface PlacedLike {
  at: readonly number[];
  rotation?: readonly number[] | undefined;
  scale?: readonly number[] | undefined;
}

/** A primitive mirrored: centre reflected, rotation conjugated, own frame flipped. */
export function mirrorPrimitive<P extends PlacedLike>(p: P, axis: MirrorAxis): P {
  const out = { ...p, at: mirrorPoint(p.at, axis), scale: flipScale(p.scale, axis) };
  if (p.rotation) out.rotation = mirrorEuler(p.rotation, axis);
  return out;
}

type RepeatLike = { count: number; axis: readonly number[] } & ({ spacing: number } | { radius: number });

/** A repeat mirrored: a linear repeat's direction is a vector, a radial repeat's axis an axial vector. */
export function mirrorRepeat<R extends RepeatLike>(r: R, axis: MirrorAxis): R {
  return { ...r, axis: 'spacing' in r ? mirrorPoint(r.axis, axis) : mirrorAxial(r.axis, axis) };
}

/** Pose / keyframe transform fields mirrored (pivot and offset are points, rotation Euler angles). */
export function mirrorTransform<T extends { pivot?: readonly number[] | undefined; rotation?: readonly number[] | undefined; offset?: readonly number[] | undefined }>(
  t: T,
  axis: MirrorAxis,
): T {
  const out = { ...t };
  if (t.pivot) out.pivot = mirrorPoint(t.pivot, axis);
  if (t.rotation) out.rotation = mirrorEuler(t.rotation, axis);
  if (t.offset) out.offset = mirrorPoint(t.offset, axis);
  return out;
}

interface AnimationLike {
  id: string;
  target: string;
  kind: string;
  axis?: readonly number[];
  pivot?: readonly number[] | undefined;
  keys?: readonly { rotation?: readonly number[] | undefined; offset?: readonly number[] | undefined }[];
}

/** An animation aimed at the twin: spin axes are axial vectors, the pivot a point, keyframes mirrored. */
export function mirrorAnimation<A extends AnimationLike>(a: A, axis: MirrorAxis, id: string, target: string): A {
  const out = { ...a, id, target };
  if (a.axis) out.axis = mirrorAxial(a.axis, axis);
  if (a.pivot) out.pivot = mirrorPoint(a.pivot, axis);
  if (a.keys) out.keys = a.keys.map((k) => mirrorTransform(k, axis));
  return out;
}

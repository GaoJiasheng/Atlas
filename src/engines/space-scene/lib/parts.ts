/**
 * Part layout maths shared by the WebGL geometry builders, the HUD drawings
 * and the tests (pure, no three.js): proportions of the engineered parts,
 * repeat (instance) transforms, and axis-aligned bounds of a part.
 */
import type { Part, PartRepeat, Primitive } from '../schema';
import { normalize3, type Vec3 } from './math';
import { apply3, axisAngle, eulerDeg, IDENTITY3, mul3, perpendicular, type Mat3 } from './xform';
import { axialHalfHeight, barrelDiscs, coilBox, curvedPanelBox, extrudeBox, grilleBox, latheBox } from './shaped';
import { sweepBox } from './sweep';
import { wingBox } from './wing';

/** Flange bolt heads: across-flats size and height as fractions. */
export const BOLT_HEAD = {
  /** Head radius as a fraction of the land between bolt circle and rim (capped by spacing). */
  radius: 0.42,
  /** Head height as a fraction of flange thickness. */
  height: 0.7,
};

/** Bore of a flange: the bolt circle sits midway between bore and rim. */
export function flangeBore(radius: number, boltRadius: number): number {
  return Math.max(0.18 * radius, boltRadius - (radius - boltRadius));
}

/** Hex bolt head radius for a flange (fits the land and the spacing between bolts). */
export function boltHeadRadius(p: Extract<Primitive, { kind: 'flange' }>): number {
  const land = p.radius - p.boltRadius;
  const spacing = (2 * Math.PI * p.boltRadius) / p.boltCount;
  return Math.max(0.002, Math.min(land * BOLT_HEAD.radius * 2, spacing * 0.32));
}

/** Plate dimensions [x, y, z] of a fins part for its stacking axis. */
export function finPlateSize(p: Extract<Primitive, { kind: 'fins' }>): Vec3 {
  const [a, b, t] = p.size;
  if (p.axis === 'y') return [a, t, b];
  if (p.axis === 'z') return [a, b, t];
  return [t, b, a];
}

/** Centre offsets of the plates of a fins part (centred on the part). */
export function finOffsets(p: Extract<Primitive, { kind: 'fins' }>): Vec3[] {
  const pitch = p.size[2] + p.gap;
  const i = p.axis === 'x' ? 0 : p.axis === 'y' ? 1 : 2;
  return Array.from({ length: p.count }, (_, k) => {
    const v: Vec3 = [0, 0, 0];
    v[i] = (k - (p.count - 1) / 2) * pitch;
    return v;
  });
}

/** Default bend radius of a tube: three pipe radii. */
export function tubeBendRadius(p: Extract<Primitive, { kind: 'tube' }>): number {
  return p.bendRadius ?? p.radius * 3;
}

/** The point halfway along a tube's path (by length, in the primitive's own axes, relative to `at`). */
export function tubeMidpoint(p: Extract<Primitive, { kind: 'tube' }>): Vec3 {
  const pts = p.path;
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i]![0]! - pts[i - 1]![0]!, pts[i]![1]! - pts[i - 1]![1]!, pts[i]![2]! - pts[i - 1]![2]!);
  let left = total / 2;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const len = Math.hypot(b[0]! - a[0]!, b[1]! - a[1]!, b[2]! - a[2]!);
    if (len >= left && len > 0) {
      const k = left / len;
      return [a[0]! + (b[0]! - a[0]!) * k, a[1]! + (b[1]! - a[1]!) * k, a[2]! + (b[2]! - a[2]!) * k];
    }
    left -= len;
  }
  const last = pts[pts.length - 1] ?? [0, 0, 0];
  return [last[0] ?? 0, last[1] ?? 0, last[2] ?? 0];
}

export interface Transform {
  /** Rotation applied first (about the part centre). */
  rotation: Mat3;
  /** Then this offset. */
  offset: Vec3;
}

/** Instance transforms of a `repeat`, in scene axes, relative to the part centre. */
export function repeatTransforms(repeat: PartRepeat | undefined): Transform[] {
  if (!repeat) return [{ rotation: IDENTITY3, offset: [0, 0, 0] }];
  const axis = normalize3(repeat.axis);
  if ('spacing' in repeat) {
    return Array.from({ length: repeat.count }, (_, k) => {
      const d = (k - (repeat.count - 1) / 2) * repeat.spacing;
      return { rotation: IDENTITY3, offset: [axis[0] * d, axis[1] * d, axis[2] * d] as Vec3 };
    });
  }
  const u = perpendicular(axis);
  return Array.from({ length: repeat.count }, (_, k) => {
    const rot = axisAngle(axis, (k / repeat.count) * Math.PI * 2);
    const p = apply3(rot, u);
    return { rotation: rot, offset: [p[0] * repeat.radius, p[1] * repeat.radius, p[2] * repeat.radius] as Vec3 };
  });
}

export interface Box3Like {
  min: Vec3;
  max: Vec3;
}

/** Bounds of a primitive in its own frame (centred on `at`, before `rotation`; `scale` and `mirror` applied). */
export function primitiveLocalBox(p: Primitive): Box3Like {
  const box = unmirroredBox(p);
  // Scale per axis (a negative component, a bilateral twin's flip, swaps the ends), then mirror.
  const s = primitiveScale(p);
  const min = [0, 1, 2].map((i) => Math.min(box.min[i]! * s[i]!, box.max[i]! * s[i]!)) as Vec3;
  const max = [0, 1, 2].map((i) => Math.max(box.min[i]! * s[i]!, box.max[i]! * s[i]!)) as Vec3;
  if (!p.mirror) return { min, max };
  const i = p.mirror === 'x' ? 0 : p.mirror === 'y' ? 1 : 2;
  const lo = min[i]!;
  min[i] = -max[i]!;
  max[i] = -lo;
  return { min, max };
}

/** A primitive's own-axis scale ([1, 1, 1] without `scale`). */
export function primitiveScale(p: Pick<Primitive, 'scale'>): Vec3 {
  return [p.scale?.[0] ?? 1, p.scale?.[1] ?? 1, p.scale?.[2] ?? 1];
}

function unmirroredBox(p: Primitive): Box3Like {
  const sym = (x: number, y: number, z: number): Box3Like => ({ min: [-x, -y, -z], max: [x, y, z] });
  switch (p.kind) {
    case 'box':
      return sym(p.size[0]! / 2, p.size[1]! / 2, p.size[2]! / 2);
    case 'cylinder': {
      const r = Math.max(p.size[0]!, p.size[1]!);
      return sym(r, p.size[2]! / 2, r);
    }
    case 'cone':
      return sym(p.size[0]!, p.size[1]! / 2, p.size[0]!);
    case 'sphere':
      return sym(p.size[0]!, p.size[0]!, p.size[0]!);
    case 'torus': {
      const r = p.size[0]! + p.size[1]!;
      return sym(r, r, p.size[1]!);
    }
    case 'capsule':
      return sym(p.size[0]!, p.size[1]! / 2 + p.size[0]!, p.size[0]!);
    case 'plane':
      return sym(p.size[0]! / 2, p.size[1]! / 2, 0);
    case 'bevelBox':
      return sym(p.size[0] / 2, p.size[1] / 2, p.size[2] / 2);
    case 'tube': {
      const min: Vec3 = [Infinity, Infinity, Infinity];
      const max: Vec3 = [-Infinity, -Infinity, -Infinity];
      for (const pt of p.path)
        for (let i = 0; i < 3; i++) {
          min[i] = Math.min(min[i]!, pt[i]! - p.radius);
          max[i] = Math.max(max[i]!, pt[i]! + p.radius);
        }
      return { min, max };
    }
    case 'flange': {
      const head = p.thickness * BOLT_HEAD.height;
      return { min: [-p.radius, -p.thickness / 2, -p.radius], max: [p.radius, p.thickness / 2 + head, p.radius] };
    }
    case 'fins': {
      const plate = finPlateSize(p);
      const span = p.count * p.size[2] + (p.count - 1) * p.gap;
      const half: Vec3 = [plate[0] / 2, plate[1] / 2, plate[2] / 2];
      half[p.axis === 'x' ? 0 : p.axis === 'y' ? 1 : 2] = span / 2;
      return sym(...half);
    }
    case 'vessel':
      return sym(p.radius, p.length / 2 + p.radius * p.headRatio, p.radius);
    case 'panelHole':
      return sym(p.size[0] / 2, p.size[1] / 2, p.size[2] / 2);
    case 'lathe':
      return latheBox(p);
    case 'extrude':
      return extrudeBox(p);
    case 'curvedPanel':
      return curvedPanelBox(p);
    case 'blades': {
      if (p.layout === 'barrel') {
        const ends = barrelDiscs(p);
        return sym(p.radius * 1.04, Math.max(...ends.map(Math.abs)) + p.thickness * 2, p.radius * 1.04);
      }
      return sym(p.radius, axialHalfHeight(p), p.radius);
    }
    case 'coilBank':
      return coilBox(p);
    case 'grille':
      return grilleBox(p);
    case 'sweep':
      return sweepBox(p);
    case 'wing':
      return wingBox(p);
  }
}

/** Every primitive of a part: the main one, then `extra` (empty for glb-only parts). */
export function partPrimitives(part: Pick<Part, 'primitive' | 'extra'>): Primitive[] {
  return part.primitive ? [part.primitive, ...(part.extra ?? [])] : [];
}

function corners(b: Box3Like): Vec3[] {
  const out: Vec3[] = [];
  for (const x of [b.min[0], b.max[0]]) for (const y of [b.min[1], b.max[1]]) for (const z of [b.min[2], b.max[2]]) out.push([x, y, z]);
  return out;
}

export function emptyBox(): Box3Like {
  return { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
}

export function expandBox(box: Box3Like, p: readonly number[]): void {
  for (let i = 0; i < 3; i++) {
    box.min[i] = Math.min(box.min[i]!, p[i]!);
    box.max[i] = Math.max(box.max[i]!, p[i]!);
  }
}

export function isEmptyBox(box: Box3Like): boolean {
  return !(box.max[0] >= box.min[0]);
}

/**
 * Scene-space bounds of a primitive part at rest (rotation and repeat
 * applied, before explode), or `null` for glb-only parts.
 */
export function partBounds(part: Pick<Part, 'primitive' | 'repeat'> & { extra?: Part['extra'] }, offset: readonly number[] = [0, 0, 0]): Box3Like | null {
  const main = part.primitive;
  if (!main) return null;
  const out = emptyBox();
  for (const p of partPrimitives(part)) {
    const local = corners(primitiveLocalBox(p));
    const rot = eulerDeg(p.rotation);
    // Extras sit at their own `at`; a repeat turns them about the part centre (the main `at`).
    const rel = [p.at[0] - main.at[0], p.at[1] - main.at[1], p.at[2] - main.at[2]];
    for (const t of repeatTransforms(part.repeat)) {
      const m = mul3(t.rotation, rot);
      const c0 = apply3(t.rotation, rel);
      for (const c of local) {
        const q = apply3(m, c);
        expandBox(out, [
          q[0] + c0[0] + t.offset[0] + main.at[0] + offset[0]!,
          q[1] + c0[1] + t.offset[1] + main.at[1] + offset[1]!,
          q[2] + c0[2] + t.offset[2] + main.at[2] + offset[2]!,
        ]);
      }
    }
  }
  return out;
}

/** Rest bounds of the main primitive alone (the leader-label target of a part with `extra`). */
export function mainBounds(part: Pick<Part, 'primitive' | 'repeat'>): Box3Like | null {
  return part.primitive ? partBounds({ primitive: part.primitive, repeat: part.repeat }) : null;
}

/** Union of the rest bounds of all primitive parts (null if none). */
export function modelBounds(parts: readonly (Pick<Part, 'primitive' | 'repeat'> & { extra?: Part['extra'] })[]): Box3Like | null {
  const out = emptyBox();
  for (const part of parts) {
    const b = partBounds(part);
    if (!b) continue;
    expandBox(out, b.min);
    expandBox(out, b.max);
  }
  return isEmptyBox(out) ? null : out;
}

/** A material a part draws with: a family / token / hex ref and an optional family tint. */
export interface MaterialSlot {
  color: string;
  tint?: string;
}

export function materialSlotKey(color: string, tint: string | undefined): string {
  return tint ? `${color}|${tint}` : color;
}

/**
 * The distinct materials of a part, in order of first use: slot 0 is the
 * main primitive's `color` (+ `tint`), then the extras' and a coil bank's
 * `tubeColor`. Pieces index into this list.
 */
export function partMaterialSlots(part: Pick<Part, 'primitive'> & { extra?: Part['extra'] }): MaterialSlot[] {
  const out: MaterialSlot[] = [];
  const seen = new Set<string>();
  const add = (color: string, tint?: string) => {
    const key = materialSlotKey(color, tint);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(tint ? { color, tint } : { color });
  };
  for (const p of partPrimitives(part)) {
    if (!(p.kind === 'coilBank' && p.bends === 'only')) add(p.color, p.tint);
    if (p.kind === 'coilBank') add(p.tubeColor);
  }
  return out;
}

/**
 * Reusing the `plant` topic's procedural parts (docs/41 D13, §3.2): read
 * src/content/topics/plant/data/parts.json (never written), take a part's
 * primitives (or some of them), and move them into this table: about an
 * anchor (the plant part's main `at`), scale by `s`, turn by a rotation `M`,
 * and translate to a target. Positions, `rotation` (M · R), `scale` (s × own)
 * are rewritten; paths, profiles and outlines stay in each primitive's own
 * frame, so the shape is exact. Low segment counts that suited the plant's
 * small drawing are raised for the larger drawing here. Poses' pivots and
 * offsets and animation offsets go through the same map.
 *
 * Scale rule (§3.2): the plant is drawn 1 unit = 50 cm and names its own
 * magnification N (×1 when unnamed); this table is 1 unit = 1 m with group
 * magnification M, so s = 50 ÷ N × M ÷ 100.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Box3, Vector3 } from 'three';
import { partSchema } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { eulerMatrix, orient, r3, type Prim, type V3 } from '../living-things/kit';

export const PLANT_FILE = join(import.meta.dirname, '../../../src/content/topics/plant/data/parts.json');

interface PlantPart {
  id: string;
  primitive: Prim;
  extra?: Prim[];
}
interface PlantData {
  parts: PlantPart[];
  poses: Record<string, Record<string, unknown>>;
  animations: { id: string; keys?: { t: number; offset?: number[] }[] }[];
}

export const plant = JSON.parse(readFileSync(PLANT_FILE, 'utf8')) as PlantData;

export function plantPart(id: string): PlantPart {
  const p = plant.parts.find((q) => q.id === id);
  if (!p) throw new Error(`plant part ${id} not found`);
  return p;
}
/** All primitives of a plant part, main first. */
export const plantPrims = (id: string): Prim[] => {
  const p = plantPart(id);
  return [p.primitive, ...(p.extra ?? [])];
};

/** s = 50 ÷ N_plant × M_here ÷ 100 (§3.2). */
export const scaleFor = (plantMagnification: number, here: number) => (50 / plantMagnification) * here / 100;

export type M3 = number[][];
export const I3: M3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export const mulMV = (m: M3, v: readonly number[]): V3 => [
  m[0]![0]! * v[0]! + m[0]![1]! * v[1]! + m[0]![2]! * v[2]!,
  m[1]![0]! * v[0]! + m[1]![1]! * v[1]! + m[1]![2]! * v[2]!,
  m[2]![0]! * v[0]! + m[2]![1]! * v[1]! + m[2]![2]! * v[2]!,
];
export const mulMM = (a: M3, b: M3): M3 => a.map((row) => [0, 1, 2].map((j) => row[0]! * b[0]![j]! + row[1]! * b[1]![j]! + row[2]! * b[2]![j]!));
export const transpose = (a: M3): M3 => [0, 1, 2].map((i) => [a[0]![i]!, a[1]![i]!, a[2]![i]!]);
/** Rotation about a unit axis by `deg` (Rodrigues), as a row-major matrix. */
export function axisAngle(axis: readonly number[], deg: number): M3 {
  const l = Math.hypot(axis[0]!, axis[1]!, axis[2]!);
  const [x, y, z] = [axis[0]! / l, axis[1]! / l, axis[2]! / l];
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const t = 1 - c;
  return [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
  ];
}
/** The shortest rotation taking unit vector a to unit vector b. */
export function rotateOnto(a: readonly number[], b: readonly number[]): M3 {
  const la = Math.hypot(a[0]!, a[1]!, a[2]!);
  const lb = Math.hypot(b[0]!, b[1]!, b[2]!);
  const u = a.map((x) => x / la);
  const v = b.map((x) => x / lb);
  const axis = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
  const sin = Math.hypot(axis[0]!, axis[1]!, axis[2]!);
  const cos = u[0]! * v[0]! + u[1]! * v[1]! + u[2]! * v[2]!;
  if (sin < 1e-9) return cos > 0 ? I3 : axisAngle(Math.abs(u[0]!) < 0.9 ? [1, 0, 0] : [0, 0, 1], 180);
  return axisAngle(axis, (Math.atan2(sin, cos) * 180) / Math.PI);
}
/** Euler XYZ (degrees, three.js) of a row-major rotation matrix. */
export const eulerOf = (m: M3): V3 => orient([m[0]![0]!, m[1]![0]!, m[2]![0]!], [m[0]![1]!, m[1]![1]!, m[2]![1]!]);

export interface Move {
  /** Plant-scene point that goes to `to` (default: the part's main `at`). */
  anchor: readonly number[];
  to: readonly number[];
  s: number;
  m?: M3;
}
/** A point of the plant scene in this scene. */
export const movePoint = (mv: Move, p: readonly number[]): V3 => {
  const d = mulMV(mv.m ?? I3, [(p[0]! - mv.anchor[0]!) * mv.s, (p[1]! - mv.anchor[1]!) * mv.s, (p[2]! - mv.anchor[2]!) * mv.s]);
  return r3([mv.to[0]! + d[0], mv.to[1]! + d[1], mv.to[2]! + d[2]]);
};
/** A displacement (pose / animation offset) of the plant scene in this scene. */
export const moveVector = (mv: Move, v: readonly number[]): V3 => r3(mulMV(mv.m ?? I3, v.map((x) => x * mv.s)));
/** A rotation given as Euler angles in plant-scene axes (a pose turn about a pivot), in this scene's axes: M · R · Mᵀ. */
export const moveTurn = (mv: Move, euler: readonly number[]): V3 => {
  const m = mv.m ?? I3;
  return eulerOf(mulMM(mulMM(m, eulerMatrix(euler)), transpose(m)));
};

/** Raise segment counts that are coarse at this drawing size. */
function finer(p: Prim, boost: number): Prim {
  const q: Prim = { ...p };
  if (boost <= 1) return q;
  if (p.kind === 'sweep') {
    if (typeof p.segments === 'number') q.segments = Math.min(96, Math.round((p.segments as number) * boost));
    if (typeof p.radial === 'number') q.radial = Math.min(16, Math.round((p.radial as number) * Math.sqrt(boost)));
  }
  if (p.kind === 'lathe' && typeof p.segments === 'number') q.segments = Math.min(32, Math.round((p.segments as number) * Math.sqrt(boost)));
  return q;
}

export interface ReuseOptions extends Partial<Move> {
  /** Primitive indices to keep (0 = main), default all. */
  pick?: number[];
  /** Tint replacements (old → new), to merge material slots or recolour for this table. */
  tints?: Record<string, string>;
  /** Segment boost (×), default 1. */
  boost?: number;
}
/** The primitives of plant part `id` moved into this scene; the first is the new main primitive. */
export function reuse(id: string, opt: ReuseOptions & { s: number; to: readonly number[] }): Prim[] {
  const prims = plantPrims(id);
  const picked = opt.pick ? opt.pick.map((i) => prims[i]!) : prims;
  const mv: Move = { anchor: opt.anchor ?? picked[0]!.at, to: opt.to, s: opt.s, m: opt.m };
  return picked.map((p) => {
    const q = finer(p, opt.boost ?? 1);
    q.at = movePoint(mv, p.at);
    q.rotation = eulerOf(mulMM(mv.m ?? I3, eulerMatrix((p.rotation as number[] | undefined) ?? [0, 0, 0])));
    const own = (p.scale as number[] | undefined) ?? [1, 1, 1];
    q.scale = r3(own.map((x) => x * mv.s));
    if (typeof p.tint === 'string' && opt.tints?.[p.tint]) q.tint = opt.tints[p.tint];
    return q;
  });
}

/** Axis-aligned bounds of a list of primitives (one part), in scene coordinates, built with the stage's geometry. */
export function boundsOf(prims: Prim[]): { min: V3; max: V3; size: V3; centre: V3 } {
  const part = partSchema.parse({ id: 'probe', name: { en: 'p', zh: 'p' }, summary: { en: 'p', zh: 'p' }, detail: { en: 'p', zh: 'p' }, group: 'g', primitive: prims[0], extra: prims.slice(1) });
  const box = new Box3();
  const main = prims[0]!.at;
  for (const piece of partPieces(part as never)) {
    const g = piece.geometry;
    g.computeBoundingBox();
    const mats = piece.matrices ?? [null];
    for (const m of mats) {
      const b = g.boundingBox!.clone();
      if (m) b.applyMatrix4(m);
      box.union(b);
    }
  }
  box.translate(new Vector3(main[0], main[1], main[2]));
  const min = r3([box.min.x, box.min.y, box.min.z]);
  const max = r3([box.max.x, box.max.y, box.max.z]);
  return { min, max, size: r3([max[0] - min[0], max[1] - min[1], max[2] - min[2]]), centre: r3([(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2]) };
}

/**
 * Geometry for the exercise body styles (docs/06 动作模式数据手册 · body
 * styles): the skin without its hands (the stage draws procedural hands), the
 * wire figure's feature edges, and the stand-in wire mesh for a glb without a
 * `skin-wire` node (the skin outline decimated at load).
 *
 * Derived geometries share the source's attribute buffers and only carry a
 * new index, so they skin to the same skeleton with the same bind matrix.
 */
import { BufferAttribute, BufferGeometry, Float32BufferAttribute, Vector3, type Bone, type Matrix4, type Object3D, type Skeleton } from 'three';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';
import { featureEdges, keepTriangles } from '../../lib/hands';

/** A skinned piece's skeleton, bind matrix and the bones' world matrices at rest (geometry.ts `ShapePiece.skin`). */
export interface SkinRest {
  skeleton: Skeleton;
  bindMatrix: Matrix4;
  boneRest: Matrix4[];
}

/** A vertex is part of the hand when it lies this far past the wrist joint, along the forearm, at rest (metres): the wrist itself stays. */
const PAST_WRIST = 0.015;
/** A vertex the arm (or, without a forearm bone to measure along, the hand) carries at least this share of. */
const ARM_WEIGHT = 0.5;

const _p = new Vector3();
const _w = new Vector3();
const _e = new Vector3();

/** Indices into `skeleton.bones` of the given bones and every bone below them (the hands and any finger bones). */
export function boneSet(skeleton: Skeleton, roots: readonly (Object3D | null)[]): Set<number> {
  const out = new Set<number>();
  skeleton.bones.forEach((bone, i) => {
    for (let o: Object3D | null = bone; o; o = o.parent) {
      if (roots.includes(o)) {
        out.add(i);
        break;
      }
    }
  });
  return out;
}

/** Weight of vertex `v` on the bones of `set`. */
function weightOn(skinIndex: BufferAttribute, skinWeight: BufferAttribute, v: number, set: ReadonlySet<number>): number {
  let w = 0;
  for (let k = 0; k < 4; k++) if (set.has(skinIndex.getComponent(v, k))) w += skinWeight.getComponent(v, k);
  return w;
}

/** The triangle index of a geometry as plain numbers (0, 1, 2, … when it has none). */
function indexOf(geometry: BufferGeometry): ArrayLike<number> {
  if (geometry.index) return geometry.index.array;
  const n = geometry.getAttribute('position').count;
  return Array.from({ length: n }, (_, i) => i);
}

function withIndex(source: BufferGeometry, index: number[]): BufferGeometry {
  const out = new BufferGeometry();
  for (const [name, attr] of Object.entries(source.attributes)) out.setAttribute(name, attr);
  out.setIndex(index);
  return out;
}

/**
 * The skinned geometry without the skin's hands, or the geometry itself when
 * it has none: the triangles with a vertex that the arm moves (mostly the
 * hand bone, the forearm or the elbow) and that lies, at rest, past the
 * wrist joint along the forearm. A skin may weight the last centimetres of
 * the forearm to the hand, a decimated one its fingers to the forearm; the
 * wrist plane decides, and the thigh beside a hanging hand (moved by the hip)
 * stays.
 */
export function withoutHands(geometry: BufferGeometry, skin: SkinRest, hands: readonly (Object3D | null)[]): BufferGeometry {
  const si = geometry.getAttribute('skinIndex') as BufferAttribute | undefined;
  const sw = geometry.getAttribute('skinWeight') as BufferAttribute | undefined;
  const pos = geometry.getAttribute('position');
  if (!si || !sw || !pos) return geometry;
  const { skeleton, bindMatrix, boneRest } = skin;
  // Per hand: the bones that carry it (the hand with any finger bones, the forearm, the elbow), the wrist at rest and the forearm's direction.
  const handsAt = hands.flatMap((bone) => {
    const i = bone ? skeleton.bones.indexOf(bone as Bone) : -1;
    if (i < 0) return [];
    const parent = skeleton.bones.indexOf(bone!.parent as Bone);
    const arm = boneSet(skeleton, [bone]);
    for (let o = bone!.parent, n = 0; o && n < 2; o = o.parent, n++) {
      const k = skeleton.bones.indexOf(o as Bone);
      if (k >= 0) arm.add(k);
    }
    const wrist = new Vector3().setFromMatrixPosition(boneRest[i]!);
    const dir = parent >= 0 ? wrist.clone().sub(_e.setFromMatrixPosition(boneRest[parent]!)) : null;
    return [{ arm, hand: boneSet(skeleton, [bone]), wrist, dir: dir && dir.lengthSq() > 1e-8 ? dir.normalize() : null }];
  });
  if (handsAt.length === 0) return geometry;
  // A vertex at rest in the skeleton's frame, through its first bone (quantised positions are scaled by the inverse bind matrices).
  const restPosition = (v: number) => {
    const b = si.getComponent(v, 0);
    _p.fromBufferAttribute(pos, v).applyMatrix4(bindMatrix).applyMatrix4(skeleton.boneInverses[b]!).applyMatrix4(boneRest[b]!);
  };
  const drop = (v: number) =>
    handsAt.some(({ arm, hand, wrist, dir }) => {
      if (!dir) return weightOn(si, sw, v, hand) >= ARM_WEIGHT;
      if (weightOn(si, sw, v, arm) < ARM_WEIGHT) return false;
      restPosition(v);
      return _w.subVectors(_p, wrist).dot(dir) > PAST_WRIST;
    });
  const index = indexOf(geometry);
  const kept = keepTriangles(index, drop);
  return kept.length === index.length ? geometry : withIndex(geometry, kept);
}

/** The feature edges (crease over `angle`°, open borders) as a line-pair geometry on the same attributes. */
export function edgesOf(geometry: BufferGeometry, angle: number): BufferGeometry {
  const pos = geometry.getAttribute('position');
  const flat = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    flat[i * 3] = pos.getX(i);
    flat[i * 3 + 1] = pos.getY(i);
    flat[i * 3 + 2] = pos.getZ(i);
  }
  return withIndex(geometry, featureEdges(flat, indexOf(geometry), angle));
}

/**
 * A low-poly copy of a skinned mesh (edge collapse to about `triangles`
 * triangles), keeping each surviving vertex's skin weights: the stand-in for
 * a glb without its `skin-wire` node. Edge collapse only removes vertices, so
 * every output vertex is one of the input's and takes its joints and weights.
 */
export function decimateSkinned(geometry: BufferGeometry, triangles: number): BufferGeometry {
  const si = geometry.getAttribute('skinIndex') as BufferAttribute;
  const sw = geometry.getAttribute('skinWeight') as BufferAttribute;
  const pos = geometry.getAttribute('position');
  // Position only (no normals: seams would keep their duplicates).
  const src = new BufferGeometry();
  const p = new Float32Array(pos.count * 3);
  const key = new Map<string, number>();
  for (let i = 0; i < pos.count; i++) {
    p[i * 3] = pos.getX(i);
    p[i * 3 + 1] = pos.getY(i);
    p[i * 3 + 2] = pos.getZ(i);
    const k = `${p[i * 3]},${p[i * 3 + 1]},${p[i * 3 + 2]}`;
    if (!key.has(k)) key.set(k, i);
  }
  src.setAttribute('position', new BufferAttribute(p, 3));
  src.setIndex(Array.from(indexOf(geometry)));
  // Vertices left ≈ half the triangles on a closed surface.
  const remove = Math.max(0, key.size - Math.round(triangles / 2));
  const low = new SimplifyModifier().modify(src, remove);
  src.dispose();
  const lp = low.getAttribute('position');
  const positions: number[] = [];
  const joints: number[] = [];
  const weights: number[] = [];
  const index: number[] = [];
  const out = new Map<number, number>();
  const vertex = (from: number): number => {
    let v = out.get(from);
    if (v === undefined) {
      v = out.size;
      out.set(from, v);
      positions.push(p[from * 3]!, p[from * 3 + 1]!, p[from * 3 + 2]!);
      for (let c = 0; c < 4; c++) {
        joints.push(si.getComponent(from, c));
        weights.push(sw.getComponent(from, c));
      }
    }
    return v;
  };
  for (let i = 0; i + 2 < lp.count; i += 3) {
    const from = [i, i + 1, i + 2].map((j) => key.get(`${lp.getX(j)},${lp.getY(j)},${lp.getZ(j)}`));
    // Whole triangles only (a vertex that does not map back drops its triangle).
    if (from.some((f) => f === undefined)) continue;
    index.push(...from.map((f) => vertex(f!)));
  }
  low.dispose();
  const res = new BufferGeometry();
  res.setAttribute('position', new Float32BufferAttribute(positions, 3));
  res.setAttribute('skinIndex', new BufferAttribute(new Uint16Array(joints), 4));
  res.setAttribute('skinWeight', new Float32BufferAttribute(weights, 4));
  res.setIndex(index);
  return res;
}

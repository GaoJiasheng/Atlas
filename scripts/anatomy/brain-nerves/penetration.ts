/**
 * Brain-into-skull penetration (docs/75 §5.2 G3, §15.2): the signed distance from each brain vertex to the
 * skull surface, negative inside the bone.
 *
 * Exact closest point on the skull triangles (uniform grid, search radius `radius`); the side comes from the
 * pseudonormal of the closest feature (face normal, the two faces' normals for an edge, the angle-weighted
 * normal for a vertex: Bærentzen & Aanæs 2005), so a point near a fold or a suture is not misjudged the way a
 * nearest-sample test is. Points with no bone within `radius` are clear (`Infinity`): the bone is thinner than
 * that, so a point that far from every bone surface is not inside one.
 *
 * Used by build.py (CLI: `penetration.ts <in.json> <out.json>`, in = { points, skullPositions, skullIndices },
 * out = { signed, closest })
 * and by tests/space-scene/brain-and-nerves-fit.test.ts on the published GLB.
 */
import { readFileSync, writeFileSync } from 'node:fs';

export interface Penetration {
  /** Signed distance per point, metres; negative = inside the bone; Infinity = no bone within the radius. */
  signed: Float64Array;
  /** The closest skull point per point (xyz triples; NaN when none within the radius). */
  closest: Float64Array;
}

const sub = (a: number[], b: number[]) => [a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!];
const dot = (a: number[], b: number[]) => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;
const cross = (a: number[], b: number[]) => [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!];
const norm = (a: number[]) => {
  const l = Math.hypot(a[0]!, a[1]!, a[2]!);
  return l > 0 ? [a[0]! / l, a[1]! / l, a[2]! / l] : [0, 0, 0];
};

/** Closest point on triangle abc to p (Ericson, Real-Time Collision Detection §5.1.5) and its feature. */
function closest(p: number[], a: number[], b: number[], c: number[]): { q: number[]; feature: 'f' | 'a' | 'b' | 'c' | 'ab' | 'bc' | 'ca' } {
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a);
  const d1 = dot(ab, ap), d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return { q: a, feature: 'a' };
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return { q: b, feature: 'b' };
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    return { q: [a[0]! + v * ab[0]!, a[1]! + v * ab[1]!, a[2]! + v * ab[2]!], feature: 'ab' };
  }
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return { q: c, feature: 'c' };
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    return { q: [a[0]! + w * ac[0]!, a[1]! + w * ac[1]!, a[2]! + w * ac[2]!], feature: 'ca' };
  }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
    return { q: [b[0]! + w * (c[0]! - b[0]!), b[1]! + w * (c[1]! - b[1]!), b[2]! + w * (c[2]! - b[2]!)], feature: 'bc' };
  }
  const denom = 1 / (va + vb + vc), v = vb * denom, w = vc * denom;
  return { q: [a[0]! + ab[0]! * v + ac[0]! * w, a[1]! + ab[1]! * v + ac[1]! * w, a[2]! + ab[2]! * v + ac[2]! * w], feature: 'f' };
}

export function penetration(points: ArrayLike<number>, skullPositions: ArrayLike<number>, skullIndices: ArrayLike<number>, radius = 0.01): Penetration {
  const nv = skullPositions.length / 3, nf = skullIndices.length / 3;
  const P = (i: number) => [skullPositions[3 * i]!, skullPositions[3 * i + 1]!, skullPositions[3 * i + 2]!];
  // Face normals; angle-weighted vertex pseudonormals; edge normals (sum of the faces sharing the edge).
  const fn: number[][] = [];
  const vn = new Float64Array(nv * 3);
  const en = new Map<string, number[]>();
  const ekey = (i: number, j: number) => (i < j ? `${i},${j}` : `${j},${i}`);
  for (let f = 0; f < nf; f++) {
    const ids = [skullIndices[3 * f]!, skullIndices[3 * f + 1]!, skullIndices[3 * f + 2]!];
    const [a, b, c] = ids.map(P) as [number[], number[], number[]];
    const n = norm(cross(sub(b, a), sub(c, a)));
    fn.push(n);
    for (let k = 0; k < 3; k++) {
      const o = P(ids[k]!), u = norm(sub(P(ids[(k + 1) % 3]!), o)), w = norm(sub(P(ids[(k + 2) % 3]!), o));
      const ang = Math.acos(Math.max(-1, Math.min(1, dot(u, w))));
      for (let j = 0; j < 3; j++) vn[3 * ids[k]! + j]! += ang * n[j]!;
      const key = ekey(ids[k]!, ids[(k + 1) % 3]!);
      const e = en.get(key) ?? [0, 0, 0];
      en.set(key, [e[0]! + n[0]!, e[1]! + n[1]!, e[2]! + n[2]!]);
    }
  }
  // Uniform grid of triangle boxes.
  const cell = radius;
  const grid = new Map<string, number[]>();
  const ck = (x: number, y: number, z: number) => `${x},${y},${z}`;
  for (let f = 0; f < nf; f++) {
    const vs = [0, 1, 2].map((k) => P(skullIndices[3 * f + k]!));
    const lo = [0, 1, 2].map((j) => Math.floor(Math.min(...vs.map((v) => v[j]!)) / cell));
    const hi = [0, 1, 2].map((j) => Math.floor(Math.max(...vs.map((v) => v[j]!)) / cell));
    for (let x = lo[0]!; x <= hi[0]!; x++) for (let y = lo[1]!; y <= hi[1]!; y++) for (let z = lo[2]!; z <= hi[2]!; z++) {
      const k = ck(x, y, z);
      const list = grid.get(k);
      if (list) list.push(f);
      else grid.set(k, [f]);
    }
  }
  const n = points.length / 3;
  const signed = new Float64Array(n);
  const near = new Float64Array(n * 3).fill(NaN);
  const seen = new Int32Array(nf).fill(-1);
  for (let i = 0; i < n; i++) {
    const p = [points[3 * i]!, points[3 * i + 1]!, points[3 * i + 2]!];
    const c = p.map((x) => Math.floor(x / cell));
    let best = Infinity, sign = 1;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      for (const f of grid.get(ck(c[0]! + dx, c[1]! + dy, c[2]! + dz)) ?? []) {
        if (seen[f] === i) continue;
        seen[f] = i;
        const ids = [skullIndices[3 * f]!, skullIndices[3 * f + 1]!, skullIndices[3 * f + 2]!];
        const { q, feature } = closest(p, P(ids[0]!), P(ids[1]!), P(ids[2]!));
        const d = sub(p, q), dist = Math.hypot(d[0]!, d[1]!, d[2]!);
        if (dist >= best) continue;
        best = dist;
        near.set(q, 3 * i);
        let pn: number[];
        if (feature === 'f') pn = fn[f]!;
        else if (feature.length === 1) {
          const v = ids['abc'.indexOf(feature)]!;
          pn = [vn[3 * v]!, vn[3 * v + 1]!, vn[3 * v + 2]!];
        } else {
          const [s, t] = [feature[0]!, feature[1]!].map((ch) => ids['abc'.indexOf(ch)]!) as [number, number];
          pn = en.get(ekey(s, t))!;
        }
        sign = dot(d, pn) >= 0 ? 1 : -1;
      }
    }
    signed[i] = best <= radius ? sign * best : Infinity;
  }
  return { signed, closest: near };
}

if (process.argv[1]?.endsWith('penetration.ts') && process.argv.length >= 4) {
  const input = JSON.parse(readFileSync(process.argv[2]!, 'utf8')) as { points: number[]; skullPositions: number[]; skullIndices: number[]; radius?: number };
  const { signed, closest: q } = penetration(input.points, input.skullPositions, input.skullIndices, input.radius);
  writeFileSync(process.argv[3]!, JSON.stringify({ signed: Array.from(signed, (s) => (Number.isFinite(s) ? s : 1)), closest: Array.from(q, (x) => (Number.isFinite(x) ? x : 0)) }));
}

/**
 * Ring sanity for the control keyframes: zero-area rings and rings that cross
 * themselves. MapLibre's triangulation (earcut) turns either into stray wedges
 * across the map (ww1: a band from the Pacific to Montreal), so the pipeline
 * prints both counts after every simplify and the acceptance list wants 0.
 * Touching at a vertex is allowed; only proper crossings count.
 */
import type { Position } from 'geojson';

export interface RingIssues {
  rings: number;
  zeroArea: number;
  selfCrossing: number;
}

type Ring = readonly Position[];

function area(ring: Ring): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j]![0]! - ring[i]![0]!) * (ring[j]![1]! + ring[i]![1]!);
  return Math.abs(a / 2);
}

const orient = (a: Position, b: Position, c: Position) => (b[0]! - a[0]!) * (c[1]! - a[1]!) - (b[1]! - a[1]!) * (c[0]! - a[0]!);

/** Segments i and j (non-adjacent) cross at a point interior to both. */
function cross(a: Position, b: Position, c: Position, d: Position): boolean {
  const o1 = orient(a, b, c);
  const o2 = orient(a, b, d);
  const o3 = orient(c, d, a);
  const o4 = orient(c, d, b);
  return ((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) && ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0));
}

/** True when the closed ring has two segments that properly cross (sweep over x). */
export function selfCrosses(ring: Ring): boolean {
  const n = ring.length - 1;
  if (n < 4) return false;
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (i, j) => Math.min(ring[i]![0]!, ring[i + 1]![0]!) - Math.min(ring[j]![0]!, ring[j + 1]![0]!),
  );
  let active: number[] = [];
  for (const i of order) {
    const a = ring[i]!;
    const b = ring[i + 1]!;
    const lo = Math.min(a[0]!, b[0]!);
    active = active.filter((j) => Math.max(ring[j]![0]!, ring[j + 1]![0]!) >= lo);
    for (const j of active) {
      if (Math.abs(i - j) === 1 || (i === 0 && j === n - 1) || (j === 0 && i === n - 1)) continue;
      if (cross(a, b, ring[j]!, ring[j + 1]!)) return true;
    }
    active.push(i);
  }
  return false;
}

/** Count the rings of polygons (each `[outer, ...holes]`) that have no area or cross themselves. */
export function ringIssues(polygons: Iterable<readonly Ring[]>): RingIssues {
  const out: RingIssues = { rings: 0, zeroArea: 0, selfCrossing: 0 };
  for (const poly of polygons) {
    for (const ring of poly) {
      out.rings++;
      if (ring.length < 4 || area(ring) < 1e-10) out.zeroArea++;
      else if (selfCrosses(ring)) out.selfCrossing++;
    }
  }
  return out;
}

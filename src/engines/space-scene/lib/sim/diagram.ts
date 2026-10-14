/**
 * Circuit-diagram layout (pure, unit-tested; docs/23 §4.3 C2): every edge
 * whose two nodes have a diagram position becomes a right-angled wire through
 * its `via` corners, with its symbol on the longest straight run (at `at`,
 * default the middle) and the wire broken where the symbol sits.
 */
import type { CircuitData, CircuitEdge } from '../../sim-schema';

export type P2 = readonly [number, number];

/** Length of a symbol along its wire (diagram units). */
export const SYMBOL_LENGTH = 30;

export interface DiagramEdge {
  edge: CircuitEdge;
  /** The wire, from the `from` node to the `to` node. */
  points: P2[];
  /** Wire pieces with the symbol's gap left out. */
  wires: P2[][];
  /** Symbol centre and unit direction (along the wire, from → to). */
  at: P2;
  dir: P2;
}

export function diagramEdges(c: CircuitData): DiagramEdge[] {
  const out: DiagramEdge[] = [];
  for (const edge of c.edges) {
    const a = c.nodes[edge.from]?.d;
    const b = c.nodes[edge.to]?.d;
    if (!a || !b) continue;
    const points: P2[] = [a, ...(edge.via ?? []), b];
    // The longest straight run carries the symbol.
    let best = 0;
    let bestLen = -1;
    for (let i = 0; i < points.length - 1; i++) {
      const l = Math.hypot(points[i + 1]![0] - points[i]![0], points[i + 1]![1] - points[i]![1]);
      if (l > bestLen) {
        bestLen = l;
        best = i;
      }
    }
    const p = points[best]!;
    const q = points[best + 1]!;
    const len = Math.max(bestLen, 1e-9);
    const dir: P2 = [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
    const k = edge.at ?? 0.5;
    const at: P2 = [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
    const half = edge.kind === 'wire' ? 0 : Math.min(SYMBOL_LENGTH / 2, len / 2);
    const s0: P2 = [at[0] - dir[0] * half, at[1] - dir[1] * half];
    const s1: P2 = [at[0] + dir[0] * half, at[1] + dir[1] * half];
    const wires: P2[][] = half === 0 ? [points] : [[...points.slice(0, best + 1), s0], [s1, ...points.slice(best + 1)]];
    out.push({ edge, points, wires, at, dir });
  }
  return out;
}

/** Junctions: nodes where three or more drawn wires meet (drawn as dots). */
export function diagramJunctions(c: CircuitData): P2[] {
  const degree = new Map<string, number>();
  for (const e of diagramEdges(c)) for (const n of [e.edge.from, e.edge.to]) degree.set(n, (degree.get(n) ?? 0) + 1);
  return [...degree.entries()].filter(([, d]) => d >= 3).map(([n]) => c.nodes[n]!.d!);
}

/** SVG path data of a polyline. */
export function polylinePath(points: readonly P2[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${round(p[0])} ${round(p[1])}`).join('');
}

const round = (x: number) => Math.round(x * 100) / 100;

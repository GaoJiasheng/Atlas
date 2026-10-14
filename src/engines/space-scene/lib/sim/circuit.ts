/**
 * Circuit model (docs/23 §4.2; pure, unit-tested against the spec's §1.3 table).
 *
 * Nodal analysis: every edge that conducts becomes a conductance between its
 * two nodes; a battery is a Norton source (EMF ÷ r into its positive terminal,
 * in parallel with 1 ÷ r, r = cells × ohms per cell; a cell turned round counts
 * −EMF). Open edges (an open switch, an insulator or nothing in the gap, a
 * bulb unscrewed) are left out. Each connected piece of the graph is grounded
 * at one node and solved by Gaussian elimination with partial pivoting
 * (≤ 32 edges, well under a millisecond); a piece without a battery carries
 * nothing.
 *
 * Quantities (the names outputs give as `from`):
 *   current:<edge>     |I| in amps (a battery: the current it delivers, signed)
 *   volts:<edge>       |V| across the edge (a battery: its terminal voltage)
 *   power:<edge>       watts dissipated (loads and wires)
 *   brightness:<edge>  a lamp's power ÷ the reference power × 100
 *   speed:<edge>       a motor's visible rpm (∝ its voltage: `rpm` at `at` volts)
 *   sound:<edge>       a buzzer: `on` above its threshold current, else `off`
 *   status:<battery>   `open` (< 1 mA), `short` (> `short` A), `over-rating`
 *                      (a lamp in its loop above `over` × its rating), else `closed`
 *   edges              signed current in every edge, from → to (amps)
 */
import type { CircuitData, CircuitEdge, SimValues } from '../../sim-schema';

/** Ohms of a closed switch. */
export const CLOSED_OHMS = 0.001;
export const DEFAULT_EMF = 1.5;
/** Battery current below which a loop counts as open. */
export const OPEN_AMPS = 0.001;
export const SHORT_AMPS = 3;
export const OVER_RATING = 1.5;

export type CircuitStatus = 'open' | 'closed' | 'short' | 'over-rating';

export interface CircuitResult {
  /** Signed current per edge, from → to (amps); 0 for open edges. */
  edges: Record<string, number>;
  /** Voltage across each edge, V(from) − V(to) (a battery: V(to) − V(from), its terminal voltage). */
  volts: Record<string, number>;
  /** Named quantities (see the module doc). */
  quantities: Record<string, number | string | Record<string, number>>;
}

interface Element {
  edge: CircuitEdge;
  /** Conductance (S); 0 = open. */
  g: number;
  /** Battery EMF (V) driving from → to; 0 otherwise. */
  emf: number;
  /** The load this edge carries (loads only). */
  load: CircuitData['loads'][string] | null;
}

const asNumber = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/** What each edge is with these control values: its conductance, EMF and load. */
export function circuitElements(c: CircuitData, values: SimValues): Element[] {
  const closed = c.closed ?? CLOSED_OHMS;
  return c.edges.map((edge): Element => {
    const open: Element = { edge, g: 0, emf: 0, load: null };
    switch (edge.kind) {
      case 'battery': {
        const n = Math.max(1, Math.round(typeof edge.cells === 'string' ? asNumber(values[edge.cells], 1) : (edge.cells ?? 1)));
        const per = edge.emf ?? DEFAULT_EMF;
        let emf = 0;
        for (let i = 1; i <= n; i++) emf += edge.flip?.[String(i)] !== undefined && values[edge.flip[String(i)]!] === true ? -per : per;
        return { edge, g: 1 / (n * (edge.r ?? 0.1)), emf, load: null };
      }
      case 'switch':
        return values[edge.control!] === true ? { edge, g: 1 / closed, emf: 0, load: null } : open;
      case 'wire':
        return { edge, g: 1 / (edge.r ?? closed), emf: 0, load: null };
      case 'gap': {
        const r = c.materials[String(values[edge.control!])];
        return r === undefined ? open : { edge, g: 1 / r, emf: 0, load: null };
      }
      case 'load': {
        if (edge.present !== undefined && values[edge.present] !== true) return open;
        const load = c.loads[edge.load ?? String(values[edge.control!])];
        return load ? { edge, g: 1 / load.r, emf: 0, load } : open;
      }
    }
  });
}

/** Solve `A x = b` in place (partial pivoting); returns x. Singular pivots give 0. */
export function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length;
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(A[i]![k]!) > Math.abs(A[p]![k]!)) p = i;
    if (p !== k) {
      [A[k], A[p]] = [A[p]!, A[k]!];
      [b[k], b[p]] = [b[p]!, b[k]!];
    }
    const piv = A[k]![k]!;
    if (Math.abs(piv) < 1e-15) continue;
    for (let i = k + 1; i < n; i++) {
      const f = A[i]![k]! / piv;
      if (f === 0) continue;
      for (let j = k; j < n; j++) A[i]![j]! -= f * A[k]![j]!;
      b[i]! -= f * b[k]!;
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    const piv = A[i]![i]!;
    if (Math.abs(piv) < 1e-15) continue;
    let s = b[i]!;
    for (let j = i + 1; j < n; j++) s -= A[i]![j]! * x[j]!;
    x[i] = s / piv;
  }
  return x;
}

/** Node voltages: each connected piece of conducting edges grounded at its first node. */
export function nodeVoltages(c: CircuitData, elements: readonly Element[]): Map<string, number> {
  const nodes = Object.keys(c.nodes);
  const parent = new Map(nodes.map((n) => [n, n]));
  const find = (n: string): string => {
    let r = n;
    while (parent.get(r) !== r) r = parent.get(r)!;
    parent.set(n, r);
    return r;
  };
  for (const e of elements) if (e.g > 0) parent.set(find(e.edge.from), find(e.edge.to));
  // Unknowns: every node that is not its piece's root (the root is ground).
  const unknown = nodes.filter((n) => find(n) !== n);
  const index = new Map(unknown.map((n, i) => [n, i]));
  const size = unknown.length;
  const A = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  const b = new Array<number>(size).fill(0);
  for (const e of elements) {
    if (e.g <= 0) continue;
    const a = index.get(e.edge.from);
    const t = index.get(e.edge.to);
    if (a !== undefined) A[a]![a]! += e.g;
    if (t !== undefined) A[t]![t]! += e.g;
    if (a !== undefined && t !== undefined) {
      A[a]![t]! -= e.g;
      A[t]![a]! -= e.g;
    }
    // Norton source: EMF × g pushed into the `to` node, drawn out of `from`.
    if (e.emf !== 0) {
      if (t !== undefined) b[t]! += e.emf * e.g;
      if (a !== undefined) b[a]! -= e.emf * e.g;
    }
  }
  const x = solveLinear(A, b);
  return new Map(nodes.map((n) => [n, index.has(n) ? x[index.get(n)!]! : 0]));
}

/** Solve the circuit for these control values. */
export function solveCircuit(c: CircuitData, values: SimValues): CircuitResult {
  const elements = circuitElements(c, values);
  const v = nodeVoltages(c, elements);
  const edges: Record<string, number> = {};
  const volts: Record<string, number> = {};
  const quantities: CircuitResult['quantities'] = {};
  for (const e of elements) {
    const id = e.edge.id;
    const dv = v.get(e.edge.from)! - v.get(e.edge.to)!;
    // A battery's current from → to through it: (EMF − (V(to) − V(from))) × g.
    const i = e.g <= 0 ? 0 : e.emf !== 0 || e.edge.kind === 'battery' ? (e.emf + dv) * e.g : dv * e.g;
    edges[id] = clean(i);
    volts[id] = clean(e.edge.kind === 'battery' ? -dv : dv);
  }
  // Pieces of the graph (for each battery's status: the loads in its own loop).
  const piece = pieces(c, elements);
  for (const e of elements) {
    const id = e.edge.id;
    const i = edges[id]!;
    quantities[`current:${id}`] = e.edge.kind === 'battery' ? i : Math.abs(i);
    quantities[`volts:${id}`] = Math.abs(volts[id]!);
    quantities[`power:${id}`] = e.edge.kind === 'battery' ? Math.abs(i * volts[id]!) : (i * i) / (e.g || 1);
    if (e.edge.kind === 'load') {
      const p = e.g > 0 ? (i * i) / e.g : 0;
      const l = e.load;
      quantities[`brightness:${id}`] = l?.kind === 'lamp' ? (p / c.reference.power) * 100 : 0;
      quantities[`speed:${id}`] = l?.kind === 'motor' && Math.abs(i) >= OPEN_AMPS ? (l.rpm! * Math.abs(volts[id]!)) / l.at! : 0;
      quantities[`sound:${id}`] = l?.kind === 'buzzer' && Math.abs(i) > l.on! ? 'on' : 'off';
    } else {
      quantities[`brightness:${id}`] = 0;
      quantities[`speed:${id}`] = 0;
      quantities[`sound:${id}`] = 'off';
    }
  }
  for (const e of elements) {
    if (e.edge.kind !== 'battery') continue;
    const i = Math.abs(edges[e.edge.id]!);
    const mine = piece.get(e.edge.from);
    const over = elements.some(
      (x) => x.load?.kind === 'lamp' && piece.get(x.edge.from) === mine && x.g > 0 && (edges[x.edge.id]! ** 2) / x.g > (c.over ?? OVER_RATING) * x.load.rated!,
    );
    quantities[`status:${e.edge.id}`] = i < OPEN_AMPS ? 'open' : i > (c.short ?? SHORT_AMPS) ? 'short' : over ? 'over-rating' : 'closed';
  }
  quantities.edges = edges;
  return { edges, volts, quantities };
}

/** Root node of each node's conducting piece. */
function pieces(c: CircuitData, elements: readonly Element[]): Map<string, string> {
  const parent = new Map(Object.keys(c.nodes).map((n) => [n, n]));
  const find = (n: string): string => (parent.get(n) === n ? n : find(parent.get(n)!));
  for (const e of elements) if (e.g > 0) parent.set(find(e.edge.from), find(e.edge.to));
  return new Map(Object.keys(c.nodes).map((n) => [n, find(n)]));
}

/** Round off solver noise (1e-12 A in an edge with no source). */
const clean = (x: number) => (Math.abs(x) < 1e-9 ? 0 : x);

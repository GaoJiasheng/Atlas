/**
 * Per-holder colours (`topic.colorBy: entity`, docs/06 "TimeScene" · 按国配色).
 * A map of many small states needs more distinguishable fills than the three
 * blocs: each entity carries `color: token:holder-N` (N = 1 … 8, tokens.css),
 * chosen so that two holders sharing a frontier in any keyframe never share a
 * colour. `holderAdjacency` finds those pairs in `control.json` (either
 * shape), `assignHolderColours` colours the graph (DSatur, least-used colour
 * first so the palette stays balanced), `colourConflicts` checks an existing
 * assignment. scripts/geo/lib/colour-holders.ts and `pnpm validate` use them.
 * Pure; unit-tested in tests/time-scene/holders.test.ts.
 */
import type { Position } from 'geojson';
import type { ControlFile, Entity, TimeSceneGeoData } from '../schema';
import { decodeControl } from './control';

/** Number of `--holder-N` tokens. */
export const HOLDER_COLOURS = 8;

export const holderToken = (n: number): string => `token:holder-${n}`;

/** `token:holder-3` -> 3; anything else -> null. */
export function holderIndex(color: string | undefined): number | null {
  const m = /^token:holder-([1-9]\d*)$/.exec(color ?? '');
  const n = m ? Number(m[1]) : Number.NaN;
  return n >= 1 && n <= HOLDER_COLOURS ? n : null;
}

/**
 * The data as the engine draws it: with `colorBy: entity`, an entity without a
 * colour of its own gets `token:holder-N` by its position in entities.json
 * (a fallback; run colour-holders.ts for an adjacency-aware assignment).
 */
export function withEntityColours<D extends Pick<TimeSceneGeoData, 'entities'>>(data: D, colorBy: 'bloc' | 'entity' | undefined): D {
  if (colorBy !== 'entity' || data.entities.every((e) => e.color)) return data;
  return { ...data, entities: data.entities.map((e, i): Entity => (e.color ? e : { ...e, color: holderToken((i % HOLDER_COLOURS) + 1) })) };
}

/** Undirected holder graph: holder -> holders it shares a frontier with in some keyframe. */
export type Adjacency = Map<string, Set<string>>;

type TopoGeometry = { type: string; arcs?: unknown; properties?: { holder?: unknown } };

function link(adj: Adjacency, a: string, b: string): void {
  if (a === b) return;
  (adj.get(a) ?? adj.set(a, new Set()).get(a)!).add(b);
  (adj.get(b) ?? adj.set(b, new Set()).get(b)!).add(a);
}

/** Arc indices of a TopoJSON Polygon / MultiPolygon (a negative index is the reversed arc ~i). */
function arcIds(g: TopoGeometry): number[] {
  const out: number[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'number') out.push(v < 0 ? ~v : v);
    else if (Array.isArray(v)) v.forEach(walk);
  };
  walk(g.arcs);
  return out;
}

/**
 * Holders that share a border in any keyframe. TopoJSON: two holders on one
 * arc. Plain GeoJSON: two holders on one segment (endpoints equal to 1e-6°).
 * Holders that only touch at a corner are not neighbours.
 */
export function holderAdjacency(control: ControlFile): Adjacency {
  const adj: Adjacency = new Map();
  const users = (key: string | number, holder: string, map: Map<string | number, Set<string>>) => (map.get(key) ?? map.set(key, new Set()).get(key)!).add(holder);
  const pairs = (map: Map<string | number, Set<string>>) => {
    for (const set of map.values()) {
      const list = [...set];
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) link(adj, list[i]!, list[j]!);
    }
  };
  if ('topology' in control) {
    const objects = control.topology.objects as Record<string, { geometries?: TopoGeometry[] } & TopoGeometry>;
    for (const kf of control.keyframes) {
      const object = objects[kf.object];
      const geometries = object?.geometries ?? (object ? [object] : []);
      const byArc = new Map<string | number, Set<string>>();
      for (const g of geometries) {
        const holder = g.properties?.holder;
        if (typeof holder !== 'string') continue;
        if (!adj.has(holder)) adj.set(holder, new Set());
        for (const id of arcIds(g)) users(id, holder, byArc);
      }
      pairs(byArc);
    }
    return adj;
  }
  const key = (p: Position) => `${Math.round((p[0] ?? 0) * 1e6)},${Math.round((p[1] ?? 0) * 1e6)}`;
  for (const kf of decodeControl(control)) {
    const bySeg = new Map<string | number, Set<string>>();
    for (const f of kf.features.features) {
      const holder = f.properties.holder;
      if (!adj.has(holder)) adj.set(holder, new Set());
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const poly of polys)
        for (const ring of poly)
          for (let i = 0; i + 1 < ring.length; i++) {
            const a = key(ring[i]!);
            const b = key(ring[i + 1]!);
            if (a !== b) users(a < b ? `${a}|${b}` : `${b}|${a}`, holder, bySeg);
          }
    }
    pairs(bySeg);
  }
  return adj;
}

export interface ColourResult {
  /** holder -> colour number 1 … `colours`. */
  colours: Map<string, number>;
  /** Neighbouring holders left with the same colour (only when the graph needs more than `colours`). */
  conflicts: [string, string][];
}

/**
 * Colour the holder graph so neighbours differ (DSatur: the holder with the
 * most differently coloured neighbours next, ties by degree then id; it takes
 * the least-used colour none of its neighbours has). `keep` pins colours that
 * are already written down (an existing entities.json) when they fit.
 */
export function assignHolderColours(adj: Adjacency, options: { colours?: number; keep?: ReadonlyMap<string, number> } = {}): ColourResult {
  const k = options.colours ?? HOLDER_COLOURS;
  const colours = new Map<string, number>();
  const used = new Array<number>(k + 1).fill(0);
  const neighbours = (id: string) => adj.get(id) ?? new Set<string>();
  const ids = [...adj.keys()].sort();
  // Pinned colours first, as long as no already-pinned neighbour has the same one.
  for (const id of ids) {
    const c = options.keep?.get(id);
    if (c === undefined || c < 1 || c > k) continue;
    if ([...neighbours(id)].some((n) => colours.get(n) === c)) continue;
    colours.set(id, c);
    used[c]!++;
  }
  const conflicts: [string, string][] = [];
  while (colours.size < ids.length) {
    let best: string | null = null;
    let bestSat = -1;
    let bestDeg = -1;
    for (const id of ids) {
      if (colours.has(id)) continue;
      const sat = new Set([...neighbours(id)].map((n) => colours.get(n)).filter((c) => c !== undefined)).size;
      const deg = neighbours(id).size;
      if (sat > bestSat || (sat === bestSat && deg > bestDeg)) {
        best = id;
        bestSat = sat;
        bestDeg = deg;
      }
    }
    const id = best!;
    const taken = new Set([...neighbours(id)].map((n) => colours.get(n)));
    let pick = 0;
    for (let c = 1; c <= k; c++) if (!taken.has(c) && (pick === 0 || used[c]! < used[pick]!)) pick = c;
    if (pick === 0) {
      // More neighbours than colours: reuse the least-used colour and report the clash.
      pick = 1;
      for (let c = 2; c <= k; c++) if (used[c]! < used[pick]!) pick = c;
      for (const n of neighbours(id)) if (colours.get(n) === pick) conflicts.push([id, n].sort() as [string, string]);
    }
    colours.set(id, pick);
    used[pick]!++;
  }
  return { colours, conflicts };
}

/** Neighbouring holders that share a colour (`colourOf` returns any comparable key, e.g. the colour ref). */
export function colourConflicts(adj: Adjacency, colourOf: (id: string) => string | undefined): [string, string][] {
  const out: [string, string][] = [];
  for (const [a, set] of adj)
    for (const b of set) {
      if (a >= b) continue;
      const ca = colourOf(a);
      if (ca !== undefined && ca === colourOf(b)) out.push([a, b]);
    }
  return out.sort((x, y) => (x[0] === y[0] ? x[1].localeCompare(y[1]) : x[0].localeCompare(y[0])));
}

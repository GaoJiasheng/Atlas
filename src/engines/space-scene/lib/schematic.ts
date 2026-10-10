/**
 * Layout maths for the SpaceScene HUD drawings (pure, unit-tested):
 *
 *  - partChain: the top-right card — groups as columns, parts as numbered
 *    nodes, `connects` as orthogonal hairlines; flowLinks: which of those
 *    lines a flow with `parts` runs along
 *  - elevation: the ARCHITECTURE panel — every primitive part's rest bounds
 *    projected on the section plane, with a scale bar step
 *  - labelBudget: leader-label count by camera distance (placement:
 *    leader-layout.ts)
 */
import type { Part, PartGroup, SectionPlane } from '../schema';
import { explodeOffset } from './explode';
import { partBounds } from './parts';

/* ------------------------------------------------------------------ */
/* Part chain (card)                                                   */
/* ------------------------------------------------------------------ */

export interface ChainNode {
  id: string;
  group: string;
  /** 1-based part number in data order (also used by the ARCHITECTURE panel). */
  n: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChainLink {
  a: string;
  b: string;
  /** Group both ends belong to (null when the link crosses groups). */
  group: string | null;
  d: string;
}

export interface ChainColumn {
  id: string;
  x: number;
  w: number;
}

export interface ChainLayout {
  width: number;
  height: number;
  header: number;
  /** Rows: the compact pitch was used (a column longer than `compactAfter`). */
  compact: boolean;
  columns: ChainColumn[];
  nodes: ChainNode[];
  links: ChainLink[];
}

export type ChainPart = Pick<Part, 'id' | 'group' | 'connects'> & { context?: boolean | undefined };

/** Parts that are numbered and drawn in the chain: every part except `context` scenery. */
export function numberedParts<P extends { context?: boolean | undefined }>(parts: readonly P[]): P[] {
  return parts.filter((p) => !p.context);
}

/**
 * Lay the part chain out in a `width`-wide box; height follows the longest
 * column. Groups without parts (flow-only groups) get no column; context
 * parts are left out. When a column has more than `compactAfter` rows the
 * row pitch drops to `compactRow`.
 */
export function partChain(
  parts: readonly ChainPart[],
  groups: readonly Pick<PartGroup, 'id'>[],
  width = 330,
  opts: { header?: number; row?: number; compactRow?: number; compactAfter?: number; gap?: number; pad?: number } = {},
): ChainLayout {
  const header = opts.header ?? 16;
  const gap = opts.gap ?? 22;
  const pad = opts.pad ?? 6;
  const list = numberedParts(parts);
  const used = new Set(list.map((p) => p.group));
  const cols = groups.length > 0 ? groups.map((g) => g.id).filter((id) => used.has(id)) : [...used].filter((g): g is string => g !== undefined);
  const counts = new Map<string, number>();
  for (const p of list) if (p.group !== undefined) counts.set(p.group, (counts.get(p.group) ?? 0) + 1);
  const longest = Math.max(1, ...counts.values());
  const compact = longest > (opts.compactAfter ?? 10);
  const row = compact ? (opts.compactRow ?? 16) : (opts.row ?? 19);
  const nodeH = compact ? row - 3 : row - 6;
  const colW = (width - pad * 2 - gap * (cols.length - 1)) / Math.max(1, cols.length);
  const columns = cols.map((id, i) => ({ id, x: pad + i * (colW + gap), w: colW }));
  const nodes: ChainNode[] = [];
  const rowsUsed = new Map<string, number>();
  list.forEach((p, i) => {
    const c = columns.find((col) => col.id === p.group);
    if (!c || p.group === undefined) return;
    const r = rowsUsed.get(p.group) ?? 0;
    rowsUsed.set(p.group, r + 1);
    nodes.push({ id: p.id, group: p.group, n: i + 1, x: c.x, y: header + 6 + r * row, w: c.w, h: nodeH });
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const links: ChainLink[] = [];
  let lane = 0;
  for (const p of list) {
    for (const q of p.connects) {
      const key = chainKey(p.id, q);
      if (seen.has(key)) continue;
      seen.add(key);
      const a = byId.get(p.id);
      const b = byId.get(q);
      if (!a || !b) continue;
      const ay = a.y + a.h / 2;
      const by = b.y + b.h / 2;
      let d: string;
      if (a.group === b.group) {
        // Same column: a bracket on the left edge.
        const x = a.x;
        const off = 3 + (lane++ % 3) * 2;
        d = `M${x} ${ay}H${x - off}V${by}H${x}`;
      } else {
        const [l, r] = a.x < b.x ? [a, b] : [b, a];
        const ly = l === a ? ay : by;
        const ry = l === a ? by : ay;
        const x1 = l.x + l.w;
        const x2 = r.x;
        const mid = (x1 + x2) / 2 + ((lane++ % 3) - 1) * 3;
        d = `M${x1} ${ly}H${mid}V${ry}H${x2}`;
      }
      links.push({ a: a.id, b: b.id, group: a.group === b.group ? a.group : null, d });
    }
  }
  const rows = Math.max(1, ...[...rowsUsed.values()]);
  return { width, height: header + 6 + rows * row, header, compact, columns, nodes, links };
}

/** Order-free key of a link between two parts. */
export function chainKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Where a flow with `parts` passes a chain link: the flow and the fraction (0..1) along its part list. */
export interface FlowLinkHit {
  flow: string;
  u: number;
}

/**
 * Chain links each flow runs along (consecutive pairs of its `parts`), keyed
 * by `chainKey`; `u` is the pair's midpoint as a fraction of the part list.
 * The first flow listed wins a link two flows share.
 */
export function flowLinks(flows: readonly { id: string; parts?: readonly string[] | undefined }[]): Map<string, FlowLinkHit> {
  const out = new Map<string, FlowLinkHit>();
  for (const f of flows) {
    const ids = f.parts ?? [];
    for (let i = 0; i + 1 < ids.length; i++) {
      const key = chainKey(ids[i]!, ids[i + 1]!);
      if (!out.has(key)) out.set(key, { flow: f.id, u: (i + 0.5) / (ids.length - 1) });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Elevation (ARCHITECTURE panel)                                      */
/* ------------------------------------------------------------------ */

export interface ElevationRect {
  id: string;
  /** `''` for a context part without a group. */
  group: string;
  /** Scenery (context part): drawn hatched, outside the zones. */
  context: boolean;
  /** Plane coordinates, model units; v points up for elevations, towards the viewer for a plan. */
  u0: number;
  u1: number;
  v0: number;
  v1: number;
  /** Depth along the view axis (larger = nearer), for back-to-front drawing. */
  depth: number;
}

export interface Elevation {
  rects: ElevationRect[];
  u0: number;
  u1: number;
  v0: number;
  v1: number;
}

/** [u axis, v axis, view axis] indices for a section plane. */
export function planeAxes(plane: SectionPlane): [number, number, number] {
  if (plane === 'zy') return [2, 1, 0];
  if (plane === 'xz') return [0, 2, 1];
  return [0, 1, 2];
}

/**
 * Rest bounds of every primitive part projected on the section plane
 * (exploded by `explode` 0..1 along each part's explode direction),
 * sorted back to front.
 */
export function elevation(
  parts: readonly (Pick<Part, 'id' | 'group' | 'primitive' | 'repeat' | 'explode'> & { context?: boolean | undefined })[],
  plane: SectionPlane,
  explode = 0,
): Elevation {
  const [u, v, w] = planeAxes(plane);
  const rects: ElevationRect[] = [];
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (const p of parts) {
    // Context parts never explode.
    const b = partBounds(p, p.context ? [0, 0, 0] : explodeOffset(p.explode, explode));
    if (!b) continue;
    const r: ElevationRect = {
      id: p.id,
      group: p.group ?? '',
      context: p.context === true,
      u0: b.min[u]!,
      u1: b.max[u]!,
      v0: b.min[v]!,
      v1: b.max[v]!,
      depth: b.max[w]!,
    };
    rects.push(r);
    u0 = Math.min(u0, r.u0);
    u1 = Math.max(u1, r.u1);
    v0 = Math.min(v0, r.v0);
    v1 = Math.max(v1, r.v1);
  }
  rects.sort((a, b) => a.depth - b.depth);
  return rects.length ? { rects, u0, u1, v0, v1 } : { rects, u0: -1, u1: 1, v0: -1, v1: 1 };
}

/** A "nice" scale-bar length (1, 2 or 5 × 10^n) near a quarter of `span`. */
export function scaleStep(span: number): number {
  const raw = Math.max(1e-6, span / 4);
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p;
}

/* ------------------------------------------------------------------ */
/* Leader labels                                                       */
/* ------------------------------------------------------------------ */

/**
 * How many leader labels a camera distance allows (master-spec J: fewer in
 * close-ups): `ratio` = camera distance / model bounding radius.
 */
export function labelBudget(ratio: number, max = 10, min = 3): number {
  const k = Math.min(1, Math.max(0, (ratio - 1.6) / (3.4 - 1.6)));
  return Math.round(min + (max - min) * k);
}

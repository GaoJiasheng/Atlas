/**
 * The array model's arithmetic and layout (docs/19 §3.1, model A1): how many
 * things a layout holds, its groups, its rows and columns, the two parts of a
 * split, and where every thing sits — in a unit frame the stage scales — so
 * that the same thing keeps its place in the list from one beat to the next
 * (loose → in groups → in rows: each one moves, it is never redrawn). Pure.
 */
import type { ArrayLayoutSpec, ArrayModelSpec, Model } from '../schema';

/** Largest scatter or groups (things) and rows (cells; dots may go to 14 × 14) a stage draws (docs/19 §3.1). */
export const ARRAY_MAX_THINGS = 60;
export const ARRAY_MAX_ROWS = 12;
export const ARRAY_MAX_DOT_ROWS = 14;

export type Layout = 'scatter' | 'groups' | 'rows';

/** The layout of a spec (a pair has none of its own). */
export const layoutOf = (s: ArrayLayoutSpec): Layout | null => s.layout ?? (s.rows && s.cols ? 'rows' : s.groups || s.sizes ? 'groups' : s.count ? 'scatter' : null);

/** The sizes of the groups (`sizes`, else `groups` × `size`, cars as filled). */
export function groupSizes(s: ArrayLayoutSpec): number[] {
  if (s.filled) return [...s.filled];
  if (s.sizes) return [...s.sizes];
  return Array.from({ length: s.groups ?? 0 }, () => s.size ?? 0);
}

/** Things a layout holds (in groups or rows, plus what is left over). */
export function thingCount(s: ArrayLayoutSpec): number {
  switch (layoutOf(s)) {
    case 'scatter':
      return s.count ?? 0;
    case 'groups':
      return groupSizes(s).reduce((a, b) => a + b, 0) + (s.extra ?? 0);
    case 'rows':
      return (s.rows ?? 0) * (s.cols ?? 0) + (s.extra ?? 0);
    default:
      return 0;
  }
}

/** The equal-groups fact a layout shows: groups × each (+ left over); `null` when the groups are not equal. */
export function factOf(s: ArrayLayoutSpec): { groups: number; each: number; extra: number; total: number } | null {
  const layout = layoutOf(s);
  if (layout === 'rows') return { groups: s.rows!, each: s.cols!, extra: s.extra ?? 0, total: thingCount(s) };
  if (layout === 'groups') {
    const sizes = groupSizes(s);
    if (sizes.length === 0 || sizes.some((x) => x !== sizes[0])) return null;
    return { groups: sizes.length, each: sizes[0]!, extra: s.extra ?? 0, total: thingCount(s) };
  }
  return null;
}

/** The two parts of a split rows layout: rows (or columns) in each part. */
export function splitParts(s: ArrayLayoutSpec): { axis: 'rows' | 'cols'; first: number; second: number } | null {
  if (layoutOf(s) !== 'rows') return null;
  if (s.split?.rows) return { axis: 'rows', first: s.split.rows[0]!, second: s.rows! - s.split.rows[0]! };
  if (s.split?.cols) return { axis: 'cols', first: s.split.cols[0]!, second: s.cols! - s.split.cols[0]! };
  return null;
}

/** A cut of an array task (`"r5"`: after row 5, `"c3"`: after column 3). */
export function parseArrayCut(key: string | null | undefined): { axis: 'rows' | 'cols'; at: number } | null {
  const m = /^([rc])(\d{1,2})$/.exec(key ?? '');
  return m ? { axis: m[1] === 'r' ? 'rows' : 'cols', at: Number(m[2]) } : null;
}

/* ------------------------------------------------------------------ */
/* Positions                                                           */
/* ------------------------------------------------------------------ */

/** Seeded points spread over the unit square, none closer than they need to be (a fixed "blue noise" scatter). */
export function scatterPoints(count: number, seed = 7, aspect = 0.5): [number, number][] {
  let s = (seed * 2654435761) >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: [number, number][] = [];
  // Best of k candidates: the one farthest from the points already placed (Mitchell's algorithm).
  for (let i = 0; i < count; i++) {
    let best: [number, number] = [rand(), rand()];
    let bestD = -1;
    for (let k = 0; k < 40; k++) {
      const c: [number, number] = [0.06 + rand() * 0.88, 0.1 + rand() * 0.8];
      // Distances on the tray itself (it is `aspect` as tall as it is wide).
      const d = out.reduce((m, p) => Math.min(m, (p[0] - c[0]) ** 2 + ((p[1] - c[1]) * aspect) ** 2), Infinity);
      if (d > bestD) {
        bestD = d;
        best = c;
      }
    }
    out.push(best);
  }
  return out;
}

/** Columns and rows of things inside one group of `n` (a compact block, like a hand would put them). */
export function packOf(n: number): { cols: number; rows: number } {
  if (n <= 0) return { cols: 1, rows: 1 };
  const cols = n <= 3 ? n : n === 4 ? 2 : n <= 6 ? 3 : n <= 8 ? 4 : n === 9 ? 3 : Math.ceil(n / 2) <= 6 ? Math.ceil(n / 2) : 4;
  return { cols, rows: Math.ceil(n / cols) };
}

/** The things of a model, in order, whatever the layout (beats keep this order so each thing moves to its new place). */
export function thingsOf(m: Model): number {
  if (m.kind !== 'array') return 0;
  if (m.pair) return m.pair.reduce((s, p) => s + thingCount(p), 0);
  return thingCount(m);
}

/** Every layout a model draws (a pair draws two). */
export const layoutsOf = (m: ArrayModelSpec): ArrayLayoutSpec[] => m.pair ?? [m];

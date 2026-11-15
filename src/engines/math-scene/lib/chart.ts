/**
 * Chart arithmetic (docs/77 §3.1, docs/78 §3, model A7): the axis and its
 * gridlines, a category's value, a pie's parts (from 12 o'clock, clockwise),
 * a table's cells and blanks, tally bundles, pictures for a value, a line's
 * rises and falls, the moves that even towers out and which block goes where
 * when the towers change (so a block keeps its identity as it moves). The
 * stage, the checks, the cards and validate all read charts through here. Pure.
 */
import type { ChartModelSpec, ChartSpec } from '../schema';
import { toImproper, type Frac } from './fraction';

export type ChartLike = ChartSpec | ChartModelSpec;

/** The charts a model draws: one, or the two of a pair. */
export const chartItems = (m: ChartModelSpec): ChartSpec[] => m.pair ?? [m];

export interface ChartAxis {
  from: number;
  to: number;
  step: number;
  /** Every how many gridlines a number is written. */
  labels: number;
}

/** The categories' values (missing values count as 0). */
export const catValues = (c: ChartLike): number[] => (c.cats ?? []).map((x) => x.value ?? 0);

/** The categories that are data (not a "?" frame). */
export const knownCats = (c: ChartLike) => (c.cats ?? []).filter((x) => !c.ghost?.includes(x.id));

/** Sum of a chart's data (the ghosts left out). */
export const chartTotal = (c: ChartLike): number => knownCats(c).reduce((a, x) => a + (x.value ?? 0), 0);

/** The axis: as written, or for towers and strips one block a gridline up to the tallest. */
export function axisOf(c: ChartLike): ChartAxis {
  if (c.axis) return { from: c.axis.from, to: c.axis.to, step: c.axis.step, labels: c.axis.labels };
  const all = [...catValues(c), ...(c.was ?? []), c.mean ?? 0, c.pooled ? chartTotal(c) : 0];
  return { from: 0, to: Math.max(1, Math.ceil(Math.max(...all))), step: 1, labels: 1 };
}

/** The gridline values from the bottom up. */
export function gridValues(a: ChartAxis): number[] {
  const out: number[] = [];
  for (let v = a.from; v <= a.to + 1e-9; v += a.step) out.push(v);
  return out;
}

/** Is the value on a gridline? */
export const onGridline = (a: ChartAxis, v: number): boolean => Math.abs((v - a.from) / a.step - Math.round((v - a.from) / a.step)) < 1e-9;

/** The gridlines just below and above a value between them (`null` on a gridline). */
export function gridlinesAround(a: ChartAxis, v: number): [number, number] | null {
  if (onGridline(a, v)) return null;
  const k = Math.floor((v - a.from) / a.step);
  return [a.from + k * a.step, a.from + (k + 1) * a.step];
}

/** A category's value (`null`: no such category). */
export function catValue(c: ChartLike, id: string): number | null {
  const x = c.cats?.find((k) => k.id === id);
  return x ? (x.value ?? 0) : null;
}

/** Pictures for a value: whole pictures and whether half a picture ends the row. */
export function iconsOf(value: number, per: number): { whole: number; half: boolean } {
  const whole = Math.floor(value / per);
  return { whole, half: value - whole * per > 0 };
}

/* ------------------------------------------------------------------ */
/* Pie                                                                  */
/* ------------------------------------------------------------------ */

export interface PiePart {
  id: string;
  /** Degrees clockwise from 12 o'clock. */
  start: number;
  end: number;
  frac: Frac | null;
}

/** The parts of a pie, from 12 o'clock clockwise. */
export function pieParts(c: ChartLike): PiePart[] {
  let at = 0;
  return (c.pie ?? []).map((s) => {
    const deg = s.frac ? (360 * s.frac.n) / s.frac.d : (s.deg ?? 0);
    const part = { id: s.id, start: at, end: at + deg, frac: s.frac ?? null };
    at += deg;
    return part;
  });
}

/** The sum of a pie's fractions as a fraction (`null` when a part is in degrees). */
export function pieSum(c: ChartLike): Frac | null {
  let n = 0;
  let d = 1;
  for (const s of c.pie ?? []) {
    if (!s.frac) return null;
    const f = toImproper(s.frac);
    n = n * f.d + f.n * d;
    d *= f.d;
  }
  return { n, d };
}

/** How many a pie's part stands for (its fraction of the total), `null` when it is not a whole number or unknown. */
export function sliceValue(c: ChartLike, id: string): number | null {
  const s = c.pie?.find((x) => x.id === id);
  if (!s?.frac || !c.total) return null;
  const v = (c.total * s.frac.n) / s.frac.d;
  return Number.isInteger(v) ? v : null;
}

/* ------------------------------------------------------------------ */
/* Table                                                                */
/* ------------------------------------------------------------------ */

export interface TableBlank {
  key: string;
  row: string;
  col: string;
}

/** A cell (`null`: no such row or column). */
export function tableCell(c: ChartLike, row: string, col: string): number | '?' | null {
  const t = c.table;
  const r = t?.rows.find((x) => x.id === row);
  const i = t?.cols.findIndex((x) => x.id === col) ?? -1;
  if (!r || i < 0) return null;
  return r.cells[i] ?? null;
}

/** Every "?" of a table, in reading order (`row.col`). */
export function tableBlanks(c: ChartLike): TableBlank[] {
  const t = c.table;
  if (!t) return [];
  return t.rows.flatMap((r) => r.cells.flatMap((v, i) => (v === '?' ? [{ key: `${r.id}.${t.cols[i]!.id}`, row: r.id, col: t.cols[i]!.id }] : [])));
}

/** A table's numbers with the blanks filled from `fill` (`null` where still unknown). */
export function tableFilled(c: ChartLike, fill: Readonly<Record<string, number>>): Record<string, number | null> {
  const t = c.table;
  const out: Record<string, number | null> = {};
  if (!t) return out;
  for (const r of t.rows) r.cells.forEach((v, i) => (out[`${r.id}.${t.cols[i]!.id}`] = v === '?' ? (fill[`${r.id}.${t.cols[i]!.id}`] ?? null) : v));
  return out;
}

/** What each blank must hold so that the total row and column add up (and a tallied row matches its tally); `null` when a blank cannot be worked out. */
export function tableSolution(c: ChartLike): Record<string, number> | null {
  const t = c.table;
  if (!t) return null;
  const cells = tableFilled(c, {});
  const key = (r: string, col: string) => `${r}.${col}`;
  // A tallied row: its first value cell is the tally.
  for (const r of t.rows) if (r.tally !== undefined && cells[key(r.id, t.cols[0]!.id)] === null) cells[key(r.id, t.cols[0]!.id)] = r.tally;
  const totalRow = t.rows.find((r) => r.total);
  const totalCol = t.cols.find((x) => x.total);
  const plainRows = t.rows.filter((r) => !r.total);
  const plainCols = t.cols.filter((x) => !x.total);
  for (let pass = 0; pass < 6; pass++) {
    // Down each column: the total row is the rows added.
    if (totalRow)
      for (const col of t.cols) {
        const parts = plainRows.map((r) => cells[key(r.id, col.id)]);
        const total = cells[key(totalRow.id, col.id)] ?? null;
        const unknown = parts.filter((v) => v === null).length;
        if (total === null && unknown === 0) cells[key(totalRow.id, col.id)] = parts.reduce((a: number, v) => a + v!, 0);
        else if (total !== null && unknown === 1) {
          const r = plainRows.find((x) => cells[key(x.id, col.id)] === null)!;
          cells[key(r.id, col.id)] = total - parts.reduce((a: number, v) => a + (v ?? 0), 0);
        }
      }
    // Along each row: the total column is the columns added.
    if (totalCol)
      for (const r of t.rows) {
        const parts = plainCols.map((x) => cells[key(r.id, x.id)]);
        const total = cells[key(r.id, totalCol.id)] ?? null;
        const unknown = parts.filter((v) => v === null).length;
        if (total === null && unknown === 0) cells[key(r.id, totalCol.id)] = parts.reduce((a: number, v) => a + v!, 0);
        else if (total !== null && unknown === 1) {
          const x = plainCols.find((k) => cells[key(r.id, k.id)] === null)!;
          cells[key(r.id, x.id)] = total - parts.reduce((a: number, v) => a + (v ?? 0), 0);
        }
      }
  }
  const out: Record<string, number> = {};
  for (const b of tableBlanks(c)) {
    const v = cells[b.key];
    if (v === null || v === undefined || v < 0) return null;
    out[b.key] = v;
  }
  return out;
}

/** A value a question points at: a category or point, a pie's part, a table cell (`row.col`) or a table row (its first column). */
export function valueOf(c: ChartLike, key: string): number | null {
  if (c.type === 'pie') return sliceValue(c, key);
  if (c.type === 'table' && c.table) {
    const [row, col] = key.includes('.') ? key.split('.') : [key, c.table.cols[0]!.id];
    const v = tableCell(c, row!, col!);
    return typeof v === 'number' ? v : null;
  }
  return catValue(c, key);
}

/** Tally marks for a number: bundles of five and the strokes left. */
export const tallyOf = (n: number): { bundles: number; rest: number } => ({ bundles: Math.floor(n / 5), rest: n % 5 });

/* ------------------------------------------------------------------ */
/* Line                                                                 */
/* ------------------------------------------------------------------ */

/** The rise (+) or fall (−) of each part of a line, from one point to the next. */
export function lineChanges(c: ChartLike): { from: string; to: string; change: number }[] {
  const cats = c.cats ?? [];
  return cats.slice(1).map((x, i) => ({ from: cats[i]!.id, to: x.id, change: (x.value ?? 0) - (cats[i]!.value ?? 0) }));
}

/** The largest rise along a line (`null`: it never rises). */
export function biggestRise(c: ChartLike): { from: string; to: string; change: number } | null {
  const ups = lineChanges(c).filter((x) => x.change > 0);
  if (ups.length === 0) return null;
  return ups.reduce((a, b) => (b.change > a.change ? b : a));
}

/* ------------------------------------------------------------------ */
/* Towers (docs/78)                                                     */
/* ------------------------------------------------------------------ */

/** The moves (one block each, from the tallest tower to the shortest) that level whole-block towers; `null` when they cannot be levelled. */
export function levelMoves(towers: readonly number[]): [number, number][] | null {
  const total = towers.reduce((a, b) => a + b, 0);
  if (towers.length === 0 || towers.some((v) => !Number.isInteger(v)) || total % towers.length !== 0) return null;
  const h = [...towers];
  const out: [number, number][] = [];
  const level = total / towers.length;
  while (h.some((v) => v !== level)) {
    const from = h.indexOf(Math.max(...h));
    const to = h.indexOf(Math.min(...h));
    h[from]!--;
    h[to]!++;
    out.push([from, to]);
  }
  return out;
}

/** Fewest blocks to move to level the towers (each block above the level moves once). */
export const fewestMoves = (towers: readonly number[]): number | null => {
  const moves = levelMoves(towers);
  return moves ? moves.length : null;
};

/**
 * Which block is which as towers change (whole blocks; a half block on top keeps its own key): a tower keeps its
 * lower blocks; the blocks a shrinking tower loses (top first) are the ones a growing tower gains, in order, so a
 * moved block keeps its key and the stage can slide it across. New blocks get new keys.
 */
export function blockKeys(prevKeys: readonly (readonly string[])[] | null, cur: readonly number[], fresh = 'b'): string[][] {
  const counts = cur.map((v) => Math.floor(v));
  if (!prevKeys || prevKeys.length !== cur.length) return counts.map((n, i) => Array.from({ length: n }, (_, k) => `${fresh}${i}-${k}`));
  const kept = prevKeys.map((keys, i) => keys.slice(0, Math.min(keys.length, counts[i]!)));
  const spare = prevKeys.flatMap((keys, i) => [...keys.slice(counts[i]!)].reverse());
  const used = new Set(prevKeys.flat());
  let n = 0;
  const unused = (i: number) => {
    let k = `${fresh}${i}-n${n++}`;
    while (used.has(k)) k = `${fresh}${i}-n${n++}`;
    used.add(k);
    return k;
  };
  return kept.map((keys, i) => {
    const out = [...keys];
    while (out.length < counts[i]!) out.push(spare.shift() ?? unused(i));
    return out;
  });
}

/** The average of numbers. */
export const meanOf = (values: readonly number[]): number => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

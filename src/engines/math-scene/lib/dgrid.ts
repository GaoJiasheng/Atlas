/**
 * The hundred grid and the thousand grid (docs/29 §3.2, model A6a): a whole
 * is a square cut into ten strips (tenths), each strip into ten squares
 * (hundredths); the thousandths are the ten slivers of one square, drawn in
 * a magnifier. Shading always goes the same way: whole after whole, strips
 * from the left, squares in a strip from the top, so 0.35 is three whole
 * strips and the top five squares of the fourth. Everything is counted in
 * thousandths (whole numbers), so a run of 0.3 and a run of 0.05 add without
 * a float. The stage, the card, the plate, the checks and the tests read
 * these. Pure.
 */
import type { DecimalGridModelSpec, DecimalGridSpec } from '../schema';
import { thousandths, type Decimal } from './decimal';

export type GridLevel = 10 | 100 | 1000;
export type RunTone = 'cold' | 'hot' | 'signal';

/** Thousandths in one cell of the grid: a strip (level 10) or a square. */
export const cellTh = (level: GridLevel): number => (level === 10 ? 100 : 10);
/** Cells in one whole: ten strips, or a hundred squares. */
export const cellsPerWhole = (level: GridLevel): number => (level === 10 ? 10 : 100);
/** Places a level can show: tenths, hundredths, thousandths. */
export const levelPlaces = (level: GridLevel): number => (level === 10 ? 1 : level === 100 ? 2 : 3);

/** Thousandths of a decimal (`null` past three places). */
export const th = (d: Decimal): number | null => thousandths(d);

export interface Run {
  /** Thousandths. */
  value: number;
  tone: RunTone;
}

/** The runs a grid shades, in order: `given` (its tone), then `runs`. */
export function runsOf(g: DecimalGridSpec): Run[] {
  const out: Run[] = [];
  const tone: RunTone = g.tone === 'hot' ? 'hot' : 'cold';
  if (g.given) out.push({ value: th(g.given) ?? 0, tone });
  for (const r of g.runs ?? []) out.push({ value: th(r.value) ?? 0, tone: r.tone });
  return out;
}

/** Total thousandths shaded. */
export const shadedTh = (g: DecimalGridSpec): number => runsOf(g).reduce((s, r) => s + r.value, 0);

/** Wholes a grid draws: its `wholes`, or as many as the shading needs. */
export function wholesOf(g: DecimalGridSpec, extra = 0): number {
  return Math.max(g.wholes ?? 1, Math.ceil(Math.max(shadedTh(g), extra) / 1000) || 1);
}

/** Where a cell sits: whole, strip (0 = left), square in the strip (0 = top). */
export function cellPlace(level: GridLevel, i: number): { whole: number; strip: number; square: number } {
  const per = cellsPerWhole(level);
  const whole = Math.floor(i / per);
  const k = i % per;
  return level === 10 ? { whole, strip: k, square: 0 } : { whole, strip: Math.floor(k / 10), square: k % 10 };
}

export interface CellFill {
  cell: number;
  tone: RunTone;
  /** Slivers covered, `from` … `to` of 10 (a whole cell is 0 … 10). */
  from: number;
  to: number;
}

/** The cells the runs cover, in fill order, each piece in its run's tone (a cell may hold the end of one run and the start of the next). */
export function fills(level: GridLevel, runs: readonly Run[]): CellFill[] {
  const size = cellTh(level);
  const out: CellFill[] = [];
  let at = 0;
  for (const r of runs) {
    let left = r.value;
    while (left > 0) {
      const cell = Math.floor(at / size);
      const inCell = at % size;
      const take = Math.min(left, size - inCell);
      const unit = size / 10;
      out.push({ cell, tone: r.tone, from: inCell / unit, to: (inCell + take) / unit });
      at += take;
      left -= take;
    }
  }
  return out;
}

/** Cells only partly covered (their slivers drawn in the magnifier). */
export function partialCells(level: GridLevel, runs: readonly Run[]): number[] {
  const total = runs.reduce((s, r) => s + r.value, 0);
  return total % cellTh(level) ? [Math.floor(total / cellTh(level))] : [];
}

/** The cell a magnifier opens (`zoom.at`, in hundredths from the start), `null` without one. */
export function zoomCell(g: DecimalGridSpec): number | null {
  if (!g.zoom) return null;
  const t = th(g.zoom.at);
  return t === null ? null : Math.floor(t / 10);
}

/** The cells lit for a trade: ten strips (a whole), ten squares (a strip), or the magnifier's ten slivers. */
export function tradeCells(g: DecimalGridSpec): number[] {
  if (!g.trade) return [];
  const level = g.level as GridLevel;
  if (g.trade === 't>O') return Array.from({ length: cellsPerWhole(level) }, (_, i) => i);
  if (g.trade === 'h>t') return Array.from({ length: 10 }, (_, i) => i);
  return zoomCell(g) !== null ? [zoomCell(g)!] : [];
}

/** The crossed-out part: the last `crossed` thousandths of what is shaded, as cells. */
export function crossedCells(g: DecimalGridSpec): CellFill[] {
  if (!g.crossed) return [];
  const total = shadedTh(g);
  const take = th(g.crossed) ?? 0;
  return fills(g.level as GridLevel, [{ value: total - take, tone: 'cold' }, { value: take, tone: 'signal' }]).filter((f) => f.tone === 'signal');
}

/** The grids a model draws: one, or the pair side by side. */
export const gridsOf = (m: DecimalGridModelSpec): DecimalGridSpec[] => (m.pair ? m.pair : [m]);

/* ------------------------------------------------------------------ */
/* Shading on a check (shade-decimal)                                  */
/* ------------------------------------------------------------------ */

export interface GridShading {
  /** Cells shaded (strips at level 10, squares otherwise), by index in fill order. */
  cells: number[];
  /** Slivers of the next free square (level 1000). */
  slivers: number;
}

/** Thousandths a shading makes. */
export const shadingTh = (level: GridLevel, s: GridShading): number => s.cells.length * cellTh(level) + (level === 1000 ? s.slivers : 0);

/** The first `n` thousandths shaded in fill order (whole cells, then slivers at level 1000). */
export function fillTo(level: GridLevel, n: number, totalCells: number): GridShading {
  const size = cellTh(level);
  const full = Math.max(0, Math.min(totalCells, Math.floor(n / size)));
  return { cells: Array.from({ length: full }, (_, i) => i), slivers: level === 1000 && full < totalCells ? Math.max(0, n - full * size) : 0 };
}

/** The square a magnifier follows on a check: the first square not shaded. */
export function nextFree(cells: readonly number[], totalCells: number): number | null {
  for (let i = 0; i < totalCells; i++) if (!cells.includes(i)) return i;
  return null;
}

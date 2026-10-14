/**
 * Square-grid geometry (docs/21 §3, model A4): the figures of a `grid` model
 * as sets of unit cells (plus half-cell triangles), and what is measured on
 * them — area (cells, two halves make one), perimeter (unit sides between a
 * cell inside and one outside), the boundary walked in order from the top-left
 * corner, the squares along the edge, the pieces a straight cut makes, the
 * corner notch of an L shape, dimension lengths. Coordinates are grid points
 * with y up: cell (x, y) is the square [x, x+1] × [y, y+1]. The figures'
 * coordinates are their true lengths in the model's unit, also when the
 * picture is not drawn to scale. Pure: no DOM, no zod.
 */
import type { GridDim, GridFigure, GridModelSpec } from '../schema';

export type Rect4 = readonly [number, number, number, number];
export type Corner = 'ne' | 'nw' | 'se' | 'sw';
export interface Half {
  x: number;
  y: number;
  c: Corner;
}
export interface Cut {
  axis: 'x' | 'y';
  at: number;
}
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const cellKey = (x: number, y: number) => `${x},${y}`;
export const halfKey = (h: Half) => `${h.x},${h.y},${h.c}`;
export function parseCell(key: string): [number, number] {
  const [x, y] = key.split(',').map(Number);
  return [x!, y!];
}
export function parseHalf(key: string): Half | null {
  const [x, y, c] = key.split(',');
  return c && ['ne', 'nw', 'se', 'sw'].includes(c) ? { x: Number(x), y: Number(y), c: c as Corner } : null;
}
export const isHalfKey = (key: string) => key.split(',').length === 3;

/** `x:5` / `y:4` (state, samples) ↔ a cut. */
export const cutKey = (c: Cut) => `${c.axis}:${c.at}`;
export function parseCut(key: string | null | undefined): Cut | null {
  const m = /^([xy]):(\d+)$/.exec(key ?? '');
  return m ? { axis: m[1] as 'x' | 'y', at: Number(m[2]) } : null;
}

/* ------------------------------------------------------------------ */
/* Edges                                                               */
/* ------------------------------------------------------------------ */

/** A unit side: `h3,2` runs (3,2)→(4,2); `v3,2` runs (3,2)→(3,3). */
export const edgeKey = (o: 'h' | 'v', x: number, y: number) => `${o}${x},${y}`;
export function edgeEnds(key: string): [[number, number], [number, number]] {
  const o = key[0];
  const [x, y] = key.slice(1).split(',').map(Number) as [number, number];
  return o === 'h' ? [[x, y], [x + 1, y]] : [[x, y], [x, y + 1]];
}
export function edgeMid(key: string): [number, number] {
  const [[x1, y1], [x2, y2]] = edgeEnds(key);
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}

/** The four sides of a cell: bottom, top, left, right. */
export function cellSides(x: number, y: number): string[] {
  return [edgeKey('h', x, y), edgeKey('h', x, y + 1), edgeKey('v', x, y), edgeKey('v', x + 1, y)];
}

/* ------------------------------------------------------------------ */
/* Figures → cells                                                     */
/* ------------------------------------------------------------------ */

function rectCells([x, y, w, h]: Rect4, out: Set<string>) {
  for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) out.add(cellKey(x + i, y + j));
}

/** Even–odd test of a point against a polygon. */
function inside(px: number, py: number, poly: readonly (readonly [number, number])[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Cells whose centres lie inside a rectilinear polygon. */
export function rasterize(poly: readonly (readonly [number, number])[]): Set<string> {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const out = new Set<string>();
  for (let x = Math.min(...xs); x < Math.max(...xs); x++) for (let y = Math.min(...ys); y < Math.max(...ys); y++) if (inside(x + 0.5, y + 0.5, poly)) out.add(cellKey(x, y));
  return out;
}

/** What is wrong with a polygon as a rectilinear figure (sides across or up, simple). */
export function polyIssues(poly: readonly (readonly [number, number])[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]!;
    const [x2, y2] = poly[(i + 1) % poly.length]!;
    if (x1 !== x2 && y1 !== y2) out.push(`side (${x1},${y1})→(${x2},${y2}) is not across or up`);
    if (x1 === x2 && y1 === y2) out.push(`corner (${x1},${y1}) is repeated`);
  }
  if (out.length) return out;
  let twice = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]!;
    const [x2, y2] = poly[(i + 1) % poly.length]!;
    twice += x1 * y2 - x2 * y1;
  }
  // A simple polygon covers exactly its shoelace area in cells; a crossing one does not.
  if (Math.abs(twice) / 2 !== rasterize(poly).size) out.push('the sides cross each other');
  return out;
}

/** The cells of a figure (halves not included). */
export function figureCells(f: GridFigure): Set<string> {
  const out = new Set<string>();
  if (f.rect) rectCells(f.rect, out);
  for (const r of f.rects ?? []) rectCells(r, out);
  for (const [x, y] of f.cells ?? []) out.add(cellKey(x, y));
  if (f.poly) for (const k of rasterize(f.poly)) out.add(k);
  return out;
}

export function figureHalves(f: GridFigure): Half[] {
  return (f.halves ?? []).map(([x, y, c]) => ({ x, y, c }));
}

/** The rectangles a figure is made of (`rect`, `rects`), else none. */
export function figureRects(f: GridFigure): Rect4[] {
  return f.rect ? [f.rect] : (f.rects ?? []);
}

/* ------------------------------------------------------------------ */
/* Measures                                                            */
/* ------------------------------------------------------------------ */

export function bboxOf(cells: Iterable<string>, halves: readonly Half[] = []): Box {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const take = (x: number, y: number) => {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x + 1);
    y1 = Math.max(y1, y + 1);
  };
  for (const k of cells) take(...parseCell(k));
  for (const h of halves) take(h.x, h.y);
  return Number.isFinite(x0) ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : { x: 0, y: 0, w: 0, h: 0 };
}

/** Unit sides with a cell of the set on one side only (unordered). */
export function boundaryEdges(cells: ReadonlySet<string>): Set<string> {
  const out = new Set<string>();
  for (const k of cells) {
    const [x, y] = parseCell(k);
    const across: [string, string][] = [
      [edgeKey('h', x, y), cellKey(x, y - 1)],
      [edgeKey('h', x, y + 1), cellKey(x, y + 1)],
      [edgeKey('v', x, y), cellKey(x - 1, y)],
      [edgeKey('v', x + 1, y), cellKey(x + 1, y)],
    ];
    for (const [e, n] of across) if (!cells.has(n)) out.add(e);
  }
  return out;
}

/** Every unit side of every cell (the sides a child may trace, inside ones included). */
export function allSides(cells: ReadonlySet<string>): Set<string> {
  const out = new Set<string>();
  for (const k of cells) for (const e of cellSides(...parseCell(k))) out.add(e);
  return out;
}

type Dir = 'E' | 'S' | 'W' | 'N';
const STEP: Record<Dir, [number, number]> = { E: [1, 0], S: [0, -1], W: [-1, 0], N: [0, 1] };
const RIGHT: Record<Dir, Dir> = { E: 'S', S: 'W', W: 'N', N: 'E' };
const LEFT: Record<Dir, Dir> = { E: 'N', N: 'W', W: 'S', S: 'E' };
const edgeFrom = (x: number, y: number, d: Dir) => (d === 'E' ? edgeKey('h', x, y) : d === 'W' ? edgeKey('h', x - 1, y) : d === 'N' ? edgeKey('v', x, y) : edgeKey('v', x, y - 1));

/**
 * The boundary in walking order: from the top-left corner along the top to the
 * right, round the shape with the inside on the right hand (a pinch point turns
 * right first), then any other loop. The perimeter is its length.
 */
export function walkOrder(cells: ReadonlySet<string>): string[] {
  const boundary = boundaryEdges(cells);
  const used = new Set<string>();
  const out: string[] = [];
  const topLeft = () => {
    let best: [number, number] | null = null;
    for (const e of boundary) {
      if (used.has(e) || e[0] !== 'h') continue;
      const [[x, y]] = edgeEnds(e);
      if (!best || y > best[1] || (y === best[1] && x < best[0])) best = [x, y];
    }
    return best;
  };
  for (let start = topLeft(); start; start = topLeft()) {
    let [x, y] = start;
    // Inside below the side: walk east (inside on the right); a hole's top side has the inside above: walk west from its far end.
    let d: Dir = cells.has(cellKey(x, y - 1)) ? 'E' : 'W';
    if (d === 'W') x += 1;
    for (let guard = 0; guard <= boundary.size; guard++) {
      const e = edgeFrom(x, y, d);
      if (used.has(e) || !boundary.has(e)) break;
      used.add(e);
      out.push(e);
      x += STEP[d][0];
      y += STEP[d][1];
      const next: Dir | undefined = [RIGHT[d], d, LEFT[d]].find((n) => {
        const k = edgeFrom(x, y, n);
        return boundary.has(k) && !used.has(k);
      });
      if (!next) break;
      d = next;
    }
  }
  for (const e of boundary) if (!used.has(e)) out.push(e);
  return out;
}

/** Grid points along the first `n` sides of a walk (for drawing the path). */
export function walkPoints(order: readonly string[], n: number): [number, number][] {
  const pts: [number, number][] = [];
  for (const e of order.slice(0, n)) {
    const [a, b] = edgeEnds(e);
    const last = pts.at(-1);
    if (!last) {
      // The first side: start at the end that the second side does not touch.
      const second = order[1] ? edgeEnds(order[1]) : null;
      const touches = (p: [number, number]) => !!second && second.some((q) => q[0] === p[0] && q[1] === p[1]);
      const [s, t] = touches(a) && !touches(b) ? [b, a] : [a, b];
      pts.push(s, t);
    } else pts.push(last[0] === a[0] && last[1] === a[1] ? b : a);
  }
  return pts;
}

/** Cells with at least one side on the boundary (the "squares along the edge"). */
export function borderCells(cells: ReadonlySet<string>): Set<string> {
  const out = new Set<string>();
  for (const k of cells) {
    const [x, y] = parseCell(k);
    if ([cellKey(x, y - 1), cellKey(x, y + 1), cellKey(x - 1, y), cellKey(x + 1, y)].some((n) => !cells.has(n))) out.add(k);
  }
  return out;
}

/** The cells as one rectangle, or `null`. */
export function rectOf(cells: ReadonlySet<string>): Box | null {
  if (cells.size === 0) return null;
  const b = bboxOf(cells);
  return b.w * b.h === cells.size ? b : null;
}

/** The two pieces a straight cut along a grid line makes (`null` when it misses the figure). */
export function piecesAfter(cells: ReadonlySet<string>, cut: Cut): [Set<string>, Set<string>] | null {
  const a = new Set<string>();
  const b = new Set<string>();
  for (const k of cells) {
    const [x, y] = parseCell(k);
    ((cut.axis === 'x' ? x : y) < cut.at ? a : b).add(k);
  }
  return a.size && b.size ? [a, b] : null;
}

/** Grid lines that cross the figure (the cuts a child may place). */
export function cutLines(cells: ReadonlySet<string>): Cut[] {
  const b = bboxOf(cells);
  const out: Cut[] = [];
  for (let x = b.x + 1; x < b.x + b.w; x++) out.push({ axis: 'x', at: x });
  for (let y = b.y + 1; y < b.y + b.h; y++) out.push({ axis: 'y', at: y });
  return out;
}

/** Cuts that leave two rectangles. */
export function rectCuts(cells: ReadonlySet<string>): Cut[] {
  return cutLines(cells).filter((c) => {
    const p = piecesAfter(cells, c);
    return !!p && !!rectOf(p[0]) && !!rectOf(p[1]);
  });
}

/**
 * The area counted twice when an L shape is taken as its full-height column
 * plus its full-width row (docs/21 §3.3 `overlap-counted`): the notch is the
 * bounding box less the figure, one rectangle at a corner; `null` otherwise.
 */
export function cornerOverlap(cells: ReadonlySet<string>): number | null {
  const b = bboxOf(cells);
  const notch = new Set<string>();
  for (let x = b.x; x < b.x + b.w; x++) for (let y = b.y; y < b.y + b.h; y++) if (!cells.has(cellKey(x, y))) notch.add(cellKey(x, y));
  const n = rectOf(notch);
  if (!n) return null;
  const atCorner = (n.x === b.x || n.x + n.w === b.x + b.w) && (n.y === b.y || n.y + n.h === b.y + b.h);
  return atCorner ? (b.w - n.w) * (b.h - n.h) : null;
}

/** Everything the lesson measures on one figure. */
export interface Facts {
  cells: Set<string>;
  halves: Half[];
  /** Whole cells; halves; area = whole + halves / 2. */
  whole: number;
  halfCount: number;
  area: number;
  /** Unit sides round it (`null` with half cells: a slanted side is not counted in units). */
  perimeter: number | null;
  box: Box;
  /** One rectangle (no halves). */
  rect: boolean;
  square: boolean;
  /** Boundary in walking order. */
  walk: string[];
  /** Squares along the edge. */
  border: number;
  /** The rectangles it is made of, when given as `rect` / `rects`. */
  parts: Rect4[];
}

export function factsOf(f: GridFigure): Facts {
  const cells = figureCells(f);
  const halves = figureHalves(f);
  const box = bboxOf(cells, halves);
  const rect = halves.length === 0 && !!rectOf(cells);
  const walk = walkOrder(cells);
  return {
    cells,
    halves,
    whole: cells.size,
    halfCount: halves.length,
    area: cells.size + halves.length / 2,
    perimeter: halves.length ? null : walk.length,
    box,
    rect,
    square: rect && box.w === box.h,
    walk,
    border: borderCells(cells).size,
    parts: figureRects(f),
  };
}

/* ------------------------------------------------------------------ */
/* The model                                                           */
/* ------------------------------------------------------------------ */

/** The figure a task or the card is about: by id, else the first one that is not a ghost outline. */
export function figureOf(m: GridModelSpec, id?: string): GridFigure | null {
  if (id) return m.figures.find((f) => f.id === id) ?? null;
  return m.figures.find((f) => f.tone !== 'ghost') ?? m.figures[0] ?? null;
}

/** Ends of a dimension line (grid points) and its length. */
export function dimEnds(m: GridModelSpec, d: GridDim): { from: [number, number]; to: [number, number]; length: number; figure: GridFigure | null } | null {
  if (d.from && d.to) return { from: d.from, to: d.to, length: Math.abs(d.to[0] - d.from[0]) + Math.abs(d.to[1] - d.from[1]), figure: figureOf(m, d.figure) };
  const f = figureOf(m, d.figure);
  if (!f || !d.side) return null;
  const b = factsOf(f).box;
  const ends: Record<NonNullable<GridDim['side']>, [[number, number], [number, number]]> = {
    top: [[b.x, b.y + b.h], [b.x + b.w, b.y + b.h]],
    bottom: [[b.x, b.y], [b.x + b.w, b.y]],
    left: [[b.x, b.y], [b.x, b.y + b.h]],
    right: [[b.x + b.w, b.y], [b.x + b.w, b.y + b.h]],
  };
  const [from, to] = ends[d.side];
  return { from, to, length: d.side === 'top' || d.side === 'bottom' ? b.w : b.h, figure: f };
}

/** The grid's extent in cells: what the figures, dimension lines and hatching cover, at least `cols × rows`. */
export function extentOf(m: GridModelSpec): Box {
  let x1 = m.cols ?? 0;
  let y1 = m.rows ?? 0;
  for (const f of m.figures) {
    const b = factsOf(f).box;
    x1 = Math.max(x1, b.x + b.w);
    y1 = Math.max(y1, b.y + b.h);
  }
  for (const [x, y, w, h] of m.crossed ?? []) {
    x1 = Math.max(x1, x + w);
    y1 = Math.max(y1, y + h);
  }
  return { x: 0, y: 0, w: Math.max(1, x1), h: Math.max(1, y1) };
}

/** Sum of the labelled (known) dimension lengths on a figure (the `missing-side` sum). */
export function labelledSum(m: GridModelSpec, f: GridFigure): number {
  let sum = 0;
  for (const d of m.dims ?? []) {
    if (d.unknown) continue;
    const e = dimEnds(m, d);
    if (e && (e.figure === f || (!d.figure && !d.side && e.figure === figureOf(m)))) sum += e.length;
  }
  return sum;
}

/** Does the model print a known length for this side of the figure? */
export function labels(m: GridModelSpec, f: GridFigure, orientation: 'across' | 'up'): boolean {
  return (m.dims ?? []).some((d) => {
    if (d.unknown) return false;
    const e = dimEnds(m, d);
    if (!e || e.figure !== f) return false;
    return orientation === 'across' ? e.from[1] === e.to[1] : e.from[0] === e.to[0];
  });
}

/** Cells of a figure in reading order (top row first, left to right): how tiles are laid in a beat. */
export function readingOrder(cells: Iterable<string>): string[] {
  return [...cells].sort((a, b) => {
    const [ax, ay] = parseCell(a);
    const [bx, by] = parseCell(b);
    return by - ay || ax - bx;
  });
}

/** The cells in row `y` of a figure, left to right. */
export function rowCells(cells: Iterable<string>, y: number): string[] {
  return readingOrder([...cells].filter((k) => parseCell(k)[1] === y));
}

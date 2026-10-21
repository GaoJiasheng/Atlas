/**
 * What a screen reader hears of a net (docs/39 §3.7): the flat net as a
 * shape — "6 squares: a row of 4; one square above the 2nd; one below the
 * 3rd", rectangles by their sizes, other faces by what edge they hang on —
 * never whether it folds; a folded solid by its name and faces (no name
 * when the name is what is asked); the "2 faces here" / "nothing here"
 * notes when they are drawn. Also the solid's faces as the SOLID card writes
 * them (`6 faces · 6 squares`, `2 flat faces · 1 curved face`) and the
 * short label of a tapped face.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { SolidClass, SolidSpec, Task } from '../schema';
import { foldResult, netCells, pieceShapes, type Net, type P2 } from './net';
import { capsOf, wrapLength } from './curved';
import { faceCounts, faceIds, flatAndCurved, isCurved, solidClass, type FaceShape } from './solid';
import { foldOf, shapeOf, type SolidNet } from './net-view';
import { childSpec, foldedOf, netOfSpec, taskNetSpec } from './net-tasks';

const ordinal = (k: number, locale: Locale): string => {
  if (locale === 'zh') return String(k);
  const s = k % 10 === 1 && k % 100 !== 11 ? 'st' : k % 10 === 2 && k % 100 !== 12 ? 'nd' : k % 10 === 3 && k % 100 !== 13 ? 'rd' : 'th';
  return `${k}${s}`;
};
const num = (v: number): string => String(Math.round(v * 10) / 10);
const sep = (locale: Locale) => t(locale, 'math.net.desc.sep');

/** A solid's name in the lesson's words. */
export const solidName = (c: SolidClass, locale: Locale): string => t(locale, `math.net.solid.${c}`);

/** `6 squares`, `1 curved face`: a count of one shape. */
function shapeCount(shape: FaceShape, n: number, locale: Locale): string {
  if (shape === 'curved') return t(locale, n === 1 ? 'math.net.curved.one' : 'math.net.curved', { n });
  return t(locale, 'math.net.count', { n, shape: t(locale, n === 1 ? `math.net.shape.${shape}` : `math.net.shapes.${shape}`) });
}

/** A net's pieces the same way (`5 faces · 5 squares` for a box with no lid; a net that does not fold keeps its count). */
export function netFacesText(spec: SolidNet, locale: Locale): string {
  const net = spec.layout ? netOfSpec(spec) : null;
  if (!net) return solidFacesText(spec.solid, locale);
  const shapes = pieceShapes(net);
  const counts = [...new Set(shapes)].map((shape) => ({ shape, n: shapes.filter((s) => s === shape).length }));
  return [t(locale, 'math.net.faces', { n: shapes.length }), ...counts.map((c) => shapeCount(c.shape, c.n, locale))].join(' · ');
}

/** The solid's faces: `6 faces · 6 squares`, `5 faces · 2 triangles · 3 rectangles`, `2 flat faces · 1 curved face`. */
export function solidFacesText(s: SolidSpec, locale: Locale): string {
  const dot = ' · ';
  if (isCurved(s)) {
    const fc = flatAndCurved(s);
    return [...(fc.flat ? [t(locale, fc.flat === 1 ? 'math.net.flat.one' : 'math.net.flat', { n: fc.flat })] : []), shapeCount('curved', fc.curved, locale)].join(dot);
  }
  const counts = faceCounts(s);
  const n = counts.reduce((a, c) => a + c.n, 0);
  return [t(locale, 'math.net.faces', { n }), ...counts.map((c) => shapeCount(c.shape, c.n, locale))].join(dot);
}

/* ------------------------------------------------------------------ */
/* A flat net                                                           */
/* ------------------------------------------------------------------ */

/** Squares in a row with the rest just above or below it (the cross, the 1-4-1 nets), else row by row from the top. */
function cellsText(cells: P2[], locale: Locale): string {
  const has = new Set(cells.map((c) => c.join(',')));
  // The row across, or a column read from the top (turned a quarter: then "above" is to the right).
  for (const flip of [false, true]) {
    const pts = cells.map(([x, y]) => (flip ? ([-y, x] as P2) : ([x, y] as P2)));
    const at = new Set(pts.map((p) => p.join(',')));
    let best: P2[] = [];
    for (const [x, y] of pts) {
      if (at.has(`${x - 1},${y}`)) continue;
      const run: P2[] = [];
      while (at.has(`${x + run.length},${y}`)) run.push([x + run.length, y]);
      if (run.length > best.length) best = run;
    }
    if (best.length < 3) continue;
    const row = new Set(best.map((p) => p.join(',')));
    const rest = pts.filter((p) => !row.has(p.join(',')));
    const parts: string[] = [t(locale, 'math.net.desc.row', { n: best.length })];
    let ok = true;
    for (const [x, y] of rest) {
      const k = best.findIndex((p) => p[0] === x) + 1;
      const side = best[0]![1] + 1 === y ? 'above' : best[0]![1] - 1 === y ? 'below' : null;
      if (!k || !side) {
        ok = false;
        break;
      }
      parts.push(t(locale, flip ? (side === 'above' ? 'math.net.desc.right' : 'math.net.desc.left') : `math.net.desc.${side}`, { k: ordinal(k, locale) }));
    }
    if (ok) return t(locale, 'math.net.desc.cells', { n: cells.length, parts: parts.join(sep(locale)) });
  }
  // Row by row from the top: how many, in which columns.
  const xs = cells.map((c) => c[0]);
  const x0 = Math.min(...xs);
  const ys = [...new Set(cells.map((c) => c[1]))].sort((a, b) => b - a);
  const rows = ys.map((y) => {
    const inRow = cells.filter((c) => c[1] === y).map((c) => c[0] - x0 + 1).sort((a, b) => a - b);
    const a = inRow[0]!;
    const b = inRow.at(-1)!;
    return inRow.length === 1 ? t(locale, 'math.net.desc.rowAt1', { a }) : b - a + 1 === inRow.length ? t(locale, 'math.net.desc.rowAt', { n: inRow.length, a, b }) : t(locale, 'math.net.desc.rowSome', { n: inRow.length, cols: inRow.join(', ') });
  });
  return has.size ? t(locale, 'math.net.desc.rows', { n: cells.length, rows: rows.join(sep(locale)) }) : '';
}

/** Which edge of a piece another hangs on (from the flat drawing). */
function edgeSide(net: Net, child: number): 'top' | 'bottom' | 'left' | 'right' | 'edge' {
  const n = net.nodes[child]!;
  const p = n.parent === null ? null : net.nodes[n.parent]!;
  if (!p || !n.hinge) return 'edge';
  const c = p.poly.reduce<P2>((s, v) => [s[0] + v[0] / p.poly.length, s[1] + v[1] / p.poly.length], [0, 0]);
  const m: P2 = [(n.hinge[0][0] + n.hinge[1][0]) / 2 - c[0], (n.hinge[0][1] + n.hinge[1][1]) / 2 - c[1]];
  const a = Math.atan2(m[1], m[0]);
  const deg = (a * 180) / Math.PI;
  if (Math.abs(deg - 90) < 30) return 'top';
  if (Math.abs(deg + 90) < 30) return 'bottom';
  if (Math.abs(deg) < 30) return 'right';
  if (Math.abs(Math.abs(deg) - 180) < 30) return 'left';
  return 'edge';
}

/** Rectangles and other faces, each by the edge it hangs on. */
function piecesText(net: Net, locale: Locale): string {
  const shapes = pieceShapes(net);
  const counter = new Map<string, number>();
  const names = shapes.map((s) => {
    const k = (counter.get(s) ?? 0) + 1;
    counter.set(s, k);
    return t(locale, 'math.net.desc.named', { shape: t(locale, `math.net.shape.${s}`), i: k });
  });
  const size = (i: number) => {
    const n = net.nodes[i]!;
    if (n.poly.length !== 4) return '';
    const w = Math.hypot(n.poly[1]![0] - n.poly[0]![0], n.poly[1]![1] - n.poly[0]![1]);
    const h = Math.hypot(n.poly[2]![0] - n.poly[1]![0], n.poly[2]![1] - n.poly[1]![1]);
    return t(locale, 'math.net.desc.size', { w: num(w), h: num(h) });
  };
  const order = [net.root, ...net.nodes.map((_, i) => i).filter((i) => i !== net.root)];
  const parts = order.map((i) => {
    const n = net.nodes[i]!;
    const piece = `${names[i]}${size(i)}`;
    if (n.parent === null) return piece;
    const side = edgeSide(net, i);
    return t(locale, side === 'edge' ? 'math.net.desc.onEdge' : 'math.net.desc.on', { piece, of: names[n.parent]!, side: side === 'edge' ? '' : t(locale, `math.net.desc.side.${side}`) });
  });
  return t(locale, 'math.net.desc.pieces', { n: net.nodes.length, parts: parts.join(sep(locale)) });
}

/** A curved net: the curved face opened out and where the circles are. */
function curvedText(spec: SolidNet, locale: Locale): string {
  const s = spec.solid;
  if (s.type !== 'cylinder' && s.type !== 'cone') return '';
  const caps = capsOf(s, spec.curved);
  const side = s.type === 'cylinder' ? t(locale, 'math.net.desc.curvedRect', { w: num(wrapLength(s, spec.curved)) }) : t(locale, spec.curved?.lateral === 'triangle' ? 'math.net.desc.triangleSide' : 'math.net.desc.fan');
  const capText = caps.map((c) => t(locale, s.type === 'cone' ? 'math.net.desc.capArc' : c.edge === 'top' ? 'math.net.desc.capTop' : 'math.net.desc.capBottom'));
  return [side, ...capText].join(sep(locale));
}

/** A flat net as a shape (never whether it folds). */
export function describeFlat(spec: SolidNet, locale: Locale): string {
  if (isCurved(spec.solid)) return curvedText(spec, locale);
  const net = netOfSpec(spec);
  if (!net) return '';
  const cells = netCells(net);
  return cells ? cellsText(cells, locale) : piecesText(net, locale);
}

/** A net or a solid on the stage: flat, part folded, folded (with its notes), the name left out when it is asked. */
export function describeNet(spec: SolidNet, locale: Locale, opts: { fold?: number; hideName?: boolean } = {}): string {
  const fold = opts.fold ?? foldOf(spec);
  const name = opts.hideName ? t(locale, 'math.net.desc.aSolid') : solidName(solidClass(spec.solid), locale);
  if (spec.solid.type === 'sphere') return t(locale, 'math.net.desc.solid', { name, faces: solidFacesText(spec.solid, locale) });
  if (fold >= 1) {
    const notes: string[] = [];
    const shape = shapeOf(spec);
    if (shape.kind === 'poly') {
      const r = foldResult(shape.net);
      if (r.overlaps.length) notes.push(t(locale, 'math.net.twoFaces'));
      if (r.missing.length) notes.push(t(locale, 'math.net.nothing'));
      if (r.sizeMismatch.length && !r.overlaps.length) notes.push(t(locale, 'math.net.gap'));
    }
    if (!spec.layout && !spec.curved) return t(locale, 'math.net.desc.solid', { name, faces: solidFacesText(spec.solid, locale) });
    return [t(locale, 'math.net.desc.folded', { net: describeFlat(spec, locale) }), ...notes].join(' ');
  }
  const flat = describeFlat(spec, locale);
  return fold <= 0 ? flat : t(locale, 'math.net.desc.folding', { net: flat, n: Math.round(fold * 100) });
}

/** The sentence under a net check (docs/39 §3.5): `6 faces?`, then the faces given and placed (`5 + 1 = 6`), then once checked whether it closes; `? opposite ●`, `? = bottom`. Never the answer first. */
export function netLines(task: Task, s: { nplaced: string[] }, locale: Locale, done: boolean): string[] {
  if (task.kind === 'tap-face') return [t(locale, task.ask === 'opposite' ? (done ? 'math.net.work.oppositeDone' : 'math.net.work.opposite') : done ? 'math.net.work.bottomDone' : 'math.net.work.bottom', { mark: '●' })];
  if (task.kind !== 'complete-net') return [];
  const spec = taskNetSpec(task);
  const net = spec ? netOfSpec(spec) : null;
  if (!spec || !net) return [];
  const faces = faceIds(spec.solid).length - (spec.open ? 1 : 0);
  if (!s.nplaced.length) return [t(locale, 'math.net.work.faces', { n: faces })];
  const sum = `${net.nodes.length} + ${s.nplaced.length} = ${net.nodes.length + s.nplaced.length}`;
  if (!done) return [sum];
  const mine = childSpec(task, s.nplaced);
  const r = mine ? foldedOf(mine) : null;
  if (!r) return [sum];
  const what = r.closes ? 'math.net.work.closes' : r.sizeMismatch ? 'math.net.work.gap' : r.overlaps ? 'math.net.work.overlap' : 'math.net.work.open';
  return [`${sum} · ${t(locale, what)}`];
}

/** A choose option's words when it has no text: the solid it names, or yes / no about folding. */
export function optionText(o: { solid?: SolidClass; folds?: boolean }, locale: Locale): string {
  if (o.solid) return solidName(o.solid, locale);
  return t(locale, o.folds ? 'math.net.folds.yes' : 'math.net.folds.no');
}

/** The short label of a face tapped (the attempts line): the square's place, the face's name. */
export function tappedLabel(task: Task, node: number): string {
  const spec = taskNetSpec(task);
  const net = spec ? netOfSpec(spec) : null;
  return (net?.nodes[node]?.key ?? String(node + 1)).toLocaleUpperCase('en');
}

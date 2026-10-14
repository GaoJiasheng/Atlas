/**
 * The square grid (docs/21 §3.1, model A4) in the technical-plate line style:
 * hairline grid lines in ink (a slightly heavier line every 5), figures as
 * cold / hot outlines, unit squares laid as signal fills with a hairline gap,
 * walked or traced sides as thick signal lines with their running count,
 * dimension lines with extension lines, arrowheads and the length in the
 * middle ("?" for the unknown), cuts, a hatched missing corner, the unit
 * square's legend and "Not drawn to scale".
 *
 * Read-only for an explanation beat or a picture option; on a check the
 * child's layer is live: lay squares (tap a cell or a half, a row at a time
 * with the row heads, or ←→↑↓ + Enter), trace sides (tap a side, or move the
 * side cursor along the grid lines and press Enter), draw a rectangle from
 * the fixed bottom-left corner (tap a grid point, drag the corner handle, or
 * ←→↑↓ on it), cut along a grid line (tap the line, or the cut cursor).
 * "Show me" draws the answer as dashed ink.
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { GridDim, GridFigure, GridModelSpec, Task } from '../schema';
import type { Action, TaskState } from '../lib/state';
import { figureRows, taskFigure } from '../lib/state';
import { cutPieces } from '../lib/check';
import {
  allSides,
  boundaryEdges,
  cellKey,
  dimEnds,
  edgeEnds,
  edgeKey,
  edgeMid,
  extentOf,
  factsOf,
  figureOf,
  halfKey,
  isHalfKey,
  parseCell,
  parseCut,
  parseHalf,
  piecesAfter,
  readingOrder,
  rectOf,
  walkOrder,
  walkPoints,
  type Box,
  type Cut,
  type Half,
} from '../lib/grid';
import { squared, unitText } from '../lib/value';
import type { Rect } from './layout';

export interface GridModelProps {
  defs: string;
  box: Rect;
  model: GridModelSpec;
  locale: Locale;
  label: string;
  task?: Task | null;
  state?: TaskState | null;
  editable?: boolean;
  act?(a: Action): void;
  /** "Show me": the solved state, dashed. */
  ghost?: TaskState | null;
  /** A picture option: small, no note or corner texts. */
  mini?: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const DIM_GAP = 18;

function useReducedMotion(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOn(mq.matches);
    const f = () => setOn(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  return on;
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

interface Frame {
  X(x: number): number;
  Y(y: number): number;
  sx: number;
  sy: number;
  span: Box;
  /** Pixel box of the drawing (grid span). */
  px: Rect;
}

function frameOf(m: GridModelSpec, box: Rect, opts: { pad: number; left: number; right: number; top: number; bottom: number; max: number }): Frame {
  const ext = extentOf(m);
  const span: Box = { x: ext.x - opts.pad, y: ext.y - opts.pad, w: ext.w + 2 * opts.pad, h: ext.h + 2 * opts.pad };
  const aw = Math.max(20, box.w - opts.left - opts.right);
  const ah = Math.max(20, box.h - opts.top - opts.bottom);
  const s = clamp(Math.min(aw / span.w, ah / span.h), 4, opts.max);
  let sx = s;
  let sy = s;
  if (m.show === 'none') {
    // Not to scale: a very long, thin figure is drawn less thin (the lengths are in the labels).
    const ratio = span.w / span.h;
    if (ratio > 2.6) sy = Math.min(ah / span.h, s * (ratio / 2.6));
    else if (ratio < 1 / 2.6) sx = Math.min(aw / span.w, s * (1 / ratio / 2.6));
  }
  const W = span.w * sx;
  const H = span.h * sy;
  const ox = box.x + opts.left + (aw - W) / 2;
  const oy = box.y + opts.top + (ah - H) / 2;
  return { X: (x) => ox + (x - span.x) * sx, Y: (y) => oy + (span.y + span.h - y) * sy, sx, sy, span, px: { x: ox, y: oy, w: W, h: H } };
}

/* ------------------------------------------------------------------ */
/* Pieces of drawing                                                   */
/* ------------------------------------------------------------------ */

const cellRect = (F: Frame, k: string, inset = 0) => {
  const [x, y] = parseCell(k);
  return { x: F.X(x) + inset, y: F.Y(y + 1) + inset, width: Math.max(0, F.sx - 2 * inset), height: Math.max(0, F.sy - 2 * inset) };
};

/** A half cell's triangle (square corner at `c`), pulled in by `inset` px. */
function halfPoints(F: Frame, h: Half, inset = 0): string {
  const corners = { sw: [h.x, h.y], se: [h.x + 1, h.y], nw: [h.x, h.y + 1], ne: [h.x + 1, h.y + 1] } as const;
  const order: Record<Half['c'], (keyof typeof corners)[]> = { sw: ['nw', 'sw', 'se'], se: ['sw', 'se', 'ne'], nw: ['ne', 'nw', 'sw'], ne: ['nw', 'ne', 'se'] };
  const pts = order[h.c].map((k) => [F.X(corners[k][0]), F.Y(corners[k][1])] as const);
  const cx = pts.reduce((s, q) => s + q[0], 0) / 3;
  const cy = pts.reduce((s, q) => s + q[1], 0) / 3;
  return pts.map(([x, y]) => `${x + Math.sign(cx - x) * inset},${y + Math.sign(cy - y) * inset}`).join(' ');
}

const edgeLine = (F: Frame, e: string) => {
  const [[x1, y1], [x2, y2]] = edgeEnds(e);
  return { x1: F.X(x1), y1: F.Y(y1), x2: F.X(x2), y2: F.Y(y2) };
};

const edgesPath = (F: Frame, edges: Iterable<string>) =>
  [...edges]
    .map((e) => {
      const l = edgeLine(F, e);
      return `M${l.x1} ${l.y1}L${l.x2} ${l.y2}`;
    })
    .join('');

/** The two legs of a half cell (unit sides from its square corner) and its slanted side. */
function legsOf(h: Half): [string, string] {
  const { x, y, c } = h;
  const across = c === 'sw' || c === 'se' ? edgeKey('h', x, y) : edgeKey('h', x, y + 1);
  const up = c === 'sw' || c === 'nw' ? edgeKey('v', x, y) : edgeKey('v', x + 1, y);
  return [across, up];
}
function hypotenuse(h: Half): [[number, number], [number, number]] {
  const { x, y, c } = h;
  return c === 'sw' || c === 'ne' ? [[x, y + 1], [x + 1, y]] : [[x, y], [x + 1, y + 1]];
}

/** The outline of whole cells and half cells: a leg a half shares with a cell is inside; a leg on its own is outside. */
function outlineEdges(cells: ReadonlySet<string>, halves: readonly Half[]): Set<string> {
  const out = boundaryEdges(cells);
  for (const h of halves) for (const leg of legsOf(h)) if (out.has(leg)) out.delete(leg);
  else out.add(leg);
  return out;
}

/** Seams of a composite figure: sides between two of its rectangles. */
function seamsOf(f: GridFigure): string[] {
  if (!f.rects) return [];
  const union = boundaryEdges(factsOf(f).cells);
  const out = new Set<string>();
  for (const r of f.rects) {
    const cells = new Set<string>();
    for (let i = 0; i < r[2]; i++) for (let j = 0; j < r[3]; j++) cells.add(cellKey(r[0] + i, r[1] + j));
    for (const e of boundaryEdges(cells)) if (!union.has(e)) out.add(e);
  }
  return [...out];
}

/** Squares laid by a beat on a figure: cells, halves, big squares. */
function beatTiles(m: GridModelSpec, f: GridFigure): { cells: string[]; halves: string[]; big: { x: number; y: number; size: number }[] } {
  const spec = m.tiles?.[f.id];
  const facts = factsOf(f);
  const order = readingOrder(facts.cells);
  if (spec === undefined) return { cells: [], halves: [], big: [] };
  if (spec === 'all') return { cells: order, halves: facts.halves.map(halfKey), big: [] };
  if (typeof spec === 'number') return { cells: order.slice(0, spec), halves: [], big: [] };
  if (spec.size) {
    const s = spec.size;
    const b = facts.box;
    const big: { x: number; y: number; size: number }[] = [];
    for (let y = b.y + b.h - s; y >= b.y; y -= s)
      for (let x = b.x; x + s <= b.x + b.w; x += s) {
        let fits = true;
        for (let i = 0; i < s && fits; i++) for (let j = 0; j < s && fits; j++) fits = facts.cells.has(cellKey(x + i, y + j));
        if (fits) big.push({ x, y, size: s });
      }
    return { cells: [], halves: [], big: big.slice(0, spec.count ?? big.length) };
  }
  const rows = [...new Set(order.map((k) => parseCell(k)[1]))].slice(0, spec.rows ?? 0);
  return { cells: order.filter((k) => rows.includes(parseCell(k)[1])), halves: [], big: [] };
}

/** Where a dimension line goes: its ends in px, the side it stands off to, the label. */
function dimGeometry(F: Frame, m: GridModelSpec, d: GridDim, locale: Locale) {
  const e = dimEnds(m, d);
  if (!e) return null;
  const across = e.from[1] === e.to[1];
  const fig = e.figure;
  const cells = fig ? factsOf(fig).cells : new Set<string>();
  let out: 1 | -1;
  if (d.side) out = d.side === 'top' || d.side === 'left' ? -1 : 1;
  // A side with the figure above it has its dimension below (screen +y); with the figure to its right, on its left.
  else if (across) out = cells.has(cellKey(Math.min(e.from[0], e.to[0]) + Math.floor(Math.abs(e.to[0] - e.from[0]) / 2), e.from[1])) ? 1 : -1;
  else out = cells.has(cellKey(e.from[0], Math.min(e.from[1], e.to[1]) + Math.floor(Math.abs(e.to[1] - e.from[1]) / 2))) ? -1 : 1;
  const unit = m.unit === 'unit' ? '' : ` ${unitText(m.unit, locale, e.length)}`;
  const text = d.unknown ? '?' : `${e.length}${unit}`;
  return { x1: F.X(e.from[0]), y1: F.Y(e.from[1]), x2: F.X(e.to[0]), y2: F.Y(e.to[1]), across, out, text, tone: d.tone, unknown: !!d.unknown };
}

function Dim({ g, defs }: { g: NonNullable<ReturnType<typeof dimGeometry>>; defs: string }) {
  const off = g.out * DIM_GAP;
  if (g.across) {
    const y = g.y1 + off;
    const [a, b] = g.x1 < g.x2 ? [g.x1, g.x2] : [g.x2, g.x1];
    return (
      <g className="ms-gdim" data-tone={g.tone} data-unknown={g.unknown || undefined} aria-hidden="true">
        {g.tone && <line className="ms-gdim__edge" x1={a} x2={b} y1={g.y1} y2={g.y1} />}
        <line className="ms-gdim__ext" x1={a} x2={a} y1={g.y1 + g.out * 4} y2={y + g.out * 5} />
        <line className="ms-gdim__ext" x1={b} x2={b} y1={g.y1 + g.out * 4} y2={y + g.out * 5} />
        <line className="ms-gdim__line" x1={a + 1} x2={b - 1} y1={y} y2={y} markerStart={`url(#${defs}-arrow)`} markerEnd={`url(#${defs}-arrow)`} />
        <text x={(a + b) / 2} y={y + (g.out < 0 ? -6 : 15)} textAnchor="middle">
          {g.text}
        </text>
      </g>
    );
  }
  const x = g.x1 + off;
  const [a, b] = g.y1 < g.y2 ? [g.y1, g.y2] : [g.y2, g.y1];
  return (
    <g className="ms-gdim" data-tone={g.tone} data-unknown={g.unknown || undefined} aria-hidden="true">
      {g.tone && <line className="ms-gdim__edge" x1={g.x1} x2={g.x1} y1={a} y2={b} />}
      <line className="ms-gdim__ext" x1={g.x1 + g.out * 4} x2={x + g.out * 5} y1={a} y2={a} />
      <line className="ms-gdim__ext" x1={g.x1 + g.out * 4} x2={x + g.out * 5} y1={b} y2={b} />
      <line className="ms-gdim__line" x1={x} x2={x} y1={a + 1} y2={b - 1} markerStart={`url(#${defs}-arrow)`} markerEnd={`url(#${defs}-arrow)`} />
      <text x={x + (g.out < 0 ? -6 : 6)} y={(a + b) / 2 + 4} textAnchor={g.out < 0 ? 'end' : 'start'}>
        {g.text}
      </text>
    </g>
  );
}

/** The figure in words (its accessible name): "a rectangle: 4 cm by 3 cm". */
export function describeFigure(m: GridModelSpec, f: GridFigure, locale: Locale): string {
  const facts = factsOf(f);
  const u = m.unit === 'unit' ? '' : ` ${unitText(m.unit, locale)}`;
  const shape = facts.square ? t(locale, 'math.grid.square') : facts.rect ? t(locale, 'math.grid.rect') : f.poly ? t(locale, 'math.grid.rectilinear', { n: f.poly.length }) : t(locale, 'math.grid.shape');
  const size = locale === 'zh' ? `长 ${facts.box.w}${u}，宽 ${facts.box.h}${u}` : `${facts.box.w}${u} by ${facts.box.h}${u}`;
  return t(locale, 'math.grid.figure', { shape, size });
}

/* ------------------------------------------------------------------ */
/* The model                                                           */
/* ------------------------------------------------------------------ */

export function GridModel(p: GridModelProps) {
  const { model: m, defs, locale, task, state } = p;
  const reduced = useReducedMotion();
  const editable = !!p.editable && !!p.act && !!task && !!state;
  const phase = task && state ? state.phase : 0;
  const modelPhase = editable && phase === 0;
  const kind = task?.kind;
  const fig = task ? taskFigure(task) : null;
  const rowHeads = modelPhase && kind === 'count-squares';
  const dims = p.mini ? [] : (m.dims ?? []);
  const has = (side: 'top' | 'bottom' | 'left' | 'right') =>
    dims.some((d) => d.side === side || (!d.side && d.from && d.to && ((side === 'top' || side === 'bottom') === (d.from[1] === d.to[1])))) || (kind === 'draw-rectangle' && (side === 'top' || side === 'left'));
  const F = frameOf(m, p.box, {
    pad: kind === 'draw-rectangle' || m.show === 'none' ? 0 : p.mini ? 0.5 : 1,
    left: (has('left') ? 58 : p.mini ? 4 : 14) + (rowHeads ? 48 : 0),
    right: has('right') ? 58 : p.mini ? 4 : 14,
    top: has('top') ? 36 : p.mini ? 4 : 12,
    bottom: (has('bottom') ? 36 : p.mini ? 4 : 12) + (!p.mini && m.note ? 30 : 0) + (!p.mini && (m.legend || m.notToScale) ? 26 : 0),
    max: m.show === 'none' ? 110 : p.mini ? 40 : 84,
  });
  const out: ReactNode[] = [];

  /* grid lines / points */
  if (m.show !== 'none') {
    const { span } = F;
    const lines: ReactNode[] = [];
    if (m.show === 'cells') {
      for (let x = Math.ceil(span.x); x <= span.x + span.w; x++) lines.push(<line key={`x${x}`} data-major={x % 5 === 0 || undefined} x1={F.X(x)} x2={F.X(x)} y1={F.Y(span.y)} y2={F.Y(span.y + span.h)} />);
      for (let y = Math.ceil(span.y); y <= span.y + span.h; y++) lines.push(<line key={`y${y}`} data-major={y % 5 === 0 || undefined} x1={F.X(span.x)} x2={F.X(span.x + span.w)} y1={F.Y(y)} y2={F.Y(y)} />);
    } else {
      for (let x = Math.ceil(span.x); x <= span.x + span.w; x++) for (let y = Math.ceil(span.y); y <= span.y + span.h; y++) lines.push(<circle key={`${x},${y}`} cx={F.X(x)} cy={F.Y(y)} r={1.3} />);
    }
    out.push(
      <g key="grid" className="ms-grid__lines" data-show={m.show} aria-hidden="true">
        {lines}
      </g>,
    );
  }

  /* the cut pieces drawn apart */
  const shownCut: Cut | null = task?.kind === 'split-figure' && state ? (cutPieces(task, state.cut) ? parseCut(state.cut) : null) : m.apart && m.cuts?.[0] ? { axis: m.cuts[0].x !== undefined ? 'x' : 'y', at: (m.cuts[0].x ?? m.cuts[0].y)! } : null;
  const shift = (k: string) => {
    if (!shownCut) return { dx: 0, dy: 0 };
    const [x, y] = isHalfKey(k) ? [parseHalf(k)!.x, parseHalf(k)!.y] : parseCell(k);
    const before = (shownCut.axis === 'x' ? x : y) < shownCut.at;
    return shownCut.axis === 'x' ? { dx: before ? -4 : 4, dy: 0 } : { dx: 0, dy: before ? 4 : -4 };
  };
  const pieceGroups = (cells: Set<string>): [Set<string>, { dx: number; dy: number }][] => {
    if (!shownCut) return [[cells, { dx: 0, dy: 0 }]];
    const pieces = piecesAfter(cells, shownCut);
    if (!pieces) return [[cells, { dx: 0, dy: 0 }]];
    return pieces.map((pc) => [pc, shift([...pc][0]!)] as [Set<string>, { dx: number; dy: number }]);
  };

  /* hatched missing parts */
  for (const [i, [x, y, w, h]] of (m.crossed ?? []).entries()) {
    out.push(
      <g key={`cross${i}`} className="ms-grid__crossed" aria-hidden="true">
        <rect x={F.X(x)} y={F.Y(y + h)} width={w * F.sx} height={h * F.sy} fill={`url(#${defs}-hatch)`} />
        <rect className="ms-grid__crossed-edge" x={F.X(x)} y={F.Y(y + h)} width={w * F.sx} height={h * F.sy} />
      </g>,
    );
  }

  /* figures (lettered A, B … when there are several to compare) */
  const named = m.figures.filter((f) => f.tone !== 'ghost');
  for (const f of m.figures) {
    const facts = factsOf(f);
    const groups = pieceGroups(facts.cells);
    out.push(
      <g key={`f-${f.id}`} className="ms-grid__figure" data-tone={f.tone} aria-hidden="true">
        {groups.map(([cells, d], gi) => (
          <g key={gi} transform={d.dx || d.dy ? `translate(${d.dx} ${d.dy})` : undefined}>
            {f.tone !== 'ghost' && (
              <path
                className="ms-grid__fill"
                d={[...cells]
                  .map((k) => {
                    const r = cellRect(F, k);
                    return `M${r.x - 0.3} ${r.y - 0.3}h${r.width + 0.6}v${r.height + 0.6}h${-r.width - 0.6}Z`;
                  })
                  .join('')}
              />
            )}
            <path className="ms-grid__outline" d={edgesPath(F, outlineEdges(cells, facts.halves))} />
          </g>
        ))}
        {facts.halves.map((h) => {
          const d = shift(halfKey(h));
          const [a, b] = hypotenuse(h);
          return (
            <g key={halfKey(h)} transform={d.dx || d.dy ? `translate(${d.dx} ${d.dy})` : undefined}>
              <polygon className="ms-grid__fill ms-grid__half" points={halfPoints(F, h)} />
              <line className="ms-grid__outline" x1={F.X(a[0])} y1={F.Y(a[1])} x2={F.X(b[0])} y2={F.Y(b[1])} />
            </g>
          );
        })}
        {!shownCut && seamsOf(f).length > 0 && <path className="ms-grid__seam" d={edgesPath(F, seamsOf(f))} />}
        {named.length > 1 && f.tone !== 'ghost' && (
          <text className="ms-grid__name" x={F.X(facts.box.x)} y={F.Y(facts.box.y + facts.box.h) - 7}>
            {'ABCD'[named.indexOf(f)]}
          </text>
        )}
      </g>,
    );
  }

  /* squares laid: the beat's, or the child's */
  const tilesOn: { cells: string[]; halves: string[]; big: { x: number; y: number; size: number }[] }[] = [];
  if (task && state && fig) tilesOn.push({ cells: state.tiles.filter((k) => !isHalfKey(k)), halves: state.tiles.filter(isHalfKey), big: [] });
  else if (!task) for (const f of m.figures) tilesOn.push(beatTiles(m, f));
  tilesOn.forEach((tl, ti) => {
    const rowOf = (k: string) => parseCell(k)[1];
    const top = Math.max(...tl.cells.map(rowOf), 0);
    out.push(
      <g key={`tiles${ti}`} className="ms-grid__tiles" aria-hidden="true">
        {tl.cells.map((k) => {
          const d = shift(k);
          return <rect key={k} className="ms-grid__tile" style={{ ['--d' as string]: `${(top - rowOf(k)) * 70}ms` }} {...cellRect(F, k, F.sx > 14 ? 1.5 : 0.8)} transform={d.dx || d.dy ? `translate(${d.dx} ${d.dy})` : undefined} />;
        })}
        {tl.halves.map((k) => {
          const h = parseHalf(k)!;
          return <polygon key={k} className="ms-grid__tile" points={halfPoints(F, h, F.sx > 14 ? 2.2 : 1)} />;
        })}
        {tl.big.map((b, i) => (
          <rect key={`b${i}`} className="ms-grid__tile ms-grid__tile--big" style={{ ['--d' as string]: `${i * 120}ms` }} x={F.X(b.x) + 2} y={F.Y(b.y + b.size) + 2} width={b.size * F.sx - 4} height={b.size * F.sy - 4} />
        ))}
      </g>,
    );
  });
  // Every half cell says it is one half (two of them make one square).
  if (F.sx >= 26) {
    const halves = m.figures.flatMap((f) => factsOf(f).halves);
    if (halves.length)
      out.push(
        <g key="halfnames" className="ms-grid__halfname" aria-hidden="true">
          {halves.map((h) => {
            const c = { sw: [0.3, 0.3], se: [0.7, 0.3], nw: [0.3, 0.7], ne: [0.7, 0.7] }[h.c];
            return (
              <text key={halfKey(h)} x={F.X(h.x + c[0]!)} y={F.Y(h.y + c[1]!) + 4} textAnchor="middle">
                ½
              </text>
            );
          })}
        </g>,
      );
  }

  /* squares along the edge (beat) */
  if (!task && m.border) {
    const f = m.figures.find((x) => x.id === m.border);
    if (f) {
      const facts = factsOf(f);
      const boundary = boundaryEdges(facts.cells);
      const border = readingOrder(facts.cells).filter((k) => {
        const [x, y] = parseCell(k);
        return [cellKey(x, y - 1), cellKey(x, y + 1), cellKey(x - 1, y), cellKey(x + 1, y)].some((n) => !facts.cells.has(n));
      });
      const corners = border.filter((k) => {
        const [x, y] = parseCell(k);
        return [`h${x},${y}`, `h${x},${y + 1}`, `v${x},${y}`, `v${x + 1},${y}`].filter((e) => boundary.has(e)).length >= 2;
      });
      out.push(
        <g key="border" className="ms-grid__border" aria-hidden="true">
          {border.map((k) => (
            <rect key={k} {...cellRect(F, k, 3)} />
          ))}
          {corners.flatMap((k) => {
            const [x, y] = parseCell(k);
            return [`h${x},${y}`, `h${x},${y + 1}`, `v${x},${y}`, `v${x + 1},${y}`]
              .filter((e) => boundary.has(e))
              .map((e) => <line key={`${k}${e}`} className="ms-grid__corner-side" {...edgeLine(F, e)} />);
          })}
        </g>,
      );
    }
  }

  /* opposite sides in pairs (beat) */
  if (!task && m.sides === 'pairs') {
    const f = figureOf(m);
    if (f) {
      const b = factsOf(f).box;
      out.push(
        <g key="pairs-sides" className="ms-grid__sides" aria-hidden="true">
          <line data-tone="cold" x1={F.X(b.x)} x2={F.X(b.x + b.w)} y1={F.Y(b.y + b.h)} y2={F.Y(b.y + b.h)} />
          <line data-tone="cold" x1={F.X(b.x)} x2={F.X(b.x + b.w)} y1={F.Y(b.y)} y2={F.Y(b.y)} />
          <line data-tone="hot" x1={F.X(b.x)} x2={F.X(b.x)} y1={F.Y(b.y)} y2={F.Y(b.y + b.h)} />
          <line data-tone="hot" x1={F.X(b.x + b.w)} x2={F.X(b.x + b.w)} y1={F.Y(b.y)} y2={F.Y(b.y + b.h)} />
        </g>,
      );
    }
  }

  /* the walk round (beat): the path, a dot running along it, the count */
  if (!task && m.walk) {
    for (const f of m.figures) {
      const spec = m.walk[f.id];
      if (spec === undefined) continue;
      const order = walkOrder(factsOf(f).cells);
      const n = spec === 'all' ? order.length : spec;
      if (n <= 0) continue;
      const pts = walkPoints(order, n).map(([x, y]) => [F.X(x), F.Y(y)] as const);
      const d = `M${pts.map(([x, y]) => `${x} ${y}`).join('L')}${n === order.length ? 'Z' : ''}`;
      const end = pts.at(-1)!;
      const counts = F.sx >= 24 && m.show !== 'none';
      out.push(
        <g key={`walk-${f.id}-${n}`} className="ms-grid__walk" aria-hidden="true">
          <path className="ms-grid__walk-path" d={d} pathLength={1} />
          {counts &&
            order.slice(0, n).map((e, i) => {
              const [mx, my] = edgeMid(e);
              const [[x1, y1], [x2, y2]] = edgeEnds(e);
              const across = y1 === y2;
              const inside = across ? factsOf(f).cells.has(cellKey(Math.min(x1, x2), y1)) : factsOf(f).cells.has(cellKey(x1, Math.min(y1, y2)));
              // Outside the figure; just inside it when dimension lines stand outside.
              const out = (m.dims?.length ?? 0) > 0 ? !inside : inside;
              const dx = across ? 0 : out ? -10 : 10;
              const dy = across ? (out ? 12 : -6) : 4;
              return (
                <text key={e} className="ms-grid__walk-no" data-tucked={(m.dims?.length ?? 0) > 0 || undefined} style={{ ['--d' as string]: `${Math.round((i / n) * 760)}ms` }} x={F.X(mx) + dx} y={F.Y(my) + dy} textAnchor="middle">
                  {i + 1}
                </text>
              );
            })}
          <circle className="ms-grid__walk-dot" cx={reduced ? end[0] : pts[0]![0]} cy={reduced ? end[1] : pts[0]![1]} r={5}>
            {!reduced && <animateMotion dur="0.8s" fill="freeze" path={`M0 0${pts.map(([x, y]) => `L${x - pts[0]![0]} ${y - pts[0]![1]}`).join('')}`} />}
          </circle>
          {!counts && (
            <text className="ms-grid__walk-count" x={end[0] + 9} y={end[1] - 9}>
              {n}
            </text>
          )}
        </g>,
      );
    }
  }

  /* cuts (beat) */
  if (!task)
    for (const [i, c] of (m.cuts ?? []).entries()) {
      const f = figureOf(m);
      if (!f) continue;
      const b = factsOf(f).box;
      const l = c.x !== undefined ? { x1: F.X(c.x), x2: F.X(c.x), y1: F.Y(b.y) + 10, y2: F.Y(b.y + b.h) - 10 } : { x1: F.X(b.x) - 10, x2: F.X(b.x + b.w) + 10, y1: F.Y(c.y!), y2: F.Y(c.y!) };
      out.push(<line key={`cut${i}`} className="ms-grid__cut" {...l} aria-hidden="true" />);
    }

  /* a beat's pieces drawn apart: each says its size */
  if (!task && shownCut) {
    const f = figureOf(m);
    const pieces = f ? piecesAfter(factsOf(f).cells, shownCut) : null;
    const u = m.unit === 'unit' ? '' : ` ${unitText(m.unit, locale)}`;
    pieces?.forEach((pc, i) => {
      const r = rectOf(pc);
      if (!r) return;
      const d = shownCut.axis === 'x' ? { dx: i === 0 ? -4 : 4, dy: 0 } : { dx: 0, dy: i === 0 ? 4 : -4 };
      out.push(
        <text key={`piece${i}`} className="ms-grid__piece" x={F.X(r.x + r.w / 2) + d.dx} y={F.Y(r.y + r.h / 2) + d.dy + 5} textAnchor="middle" aria-hidden="true">
          {`${r.w}${u} × ${r.h}${u}`}
        </text>,
      );
    });
  }

  /* dimension lines */
  for (const [i, d] of dims.entries()) {
    const g = dimGeometry(F, m, d, locale);
    if (g) out.push(<Dim key={`dim${i}`} g={g} defs={defs} />);
  }

  /* the child's layer */
  if (task && state) out.push(<TaskLayer key="task" {...p} F={F} editable={editable} modelPhase={modelPhase} rowHeads={rowHeads} />);

  /* the note, the legend, "Not drawn to scale" */
  if (!p.mini) {
    const bottom = F.px.y + F.px.h + (has('bottom') ? 36 : 6);
    if (m.note)
      out.push(
        <text key="note" className="ms-grid__note" x={F.px.x + F.px.w / 2} y={bottom + 18} textAnchor="middle">
          {tx(m.note, locale)}
        </text>,
      );
    const cornerY = bottom + (m.note ? 30 : 0) + 18;
    const right = F.px.x + F.px.w;
    if (m.notToScale)
      out.push(
        <text key="nts" className="ms-grid__corner" x={right} y={cornerY} textAnchor="end">
          {t(locale, 'math.grid.notToScale')}
        </text>,
      );
    if (m.legend) {
      const side = clamp(Math.min(F.sx, F.sy), 10, 22);
      const x = m.notToScale ? F.px.x : right - side - 52;
      out.push(
        <g key="legend" className="ms-grid__legend" aria-hidden="true">
          <rect x={x} y={cornerY - side + 3} width={side} height={side} />
          <text x={x + side + 6} y={cornerY}>
            1 {unitText(squared(m.unit), locale, 1)}
          </text>
        </g>,
      );
    }
  }

  const figure = figureOf(m);
  const name = p.label || (figure ? describeFigure(m, figure, locale) : '');
  return (
    <g className="ms-grid" data-show={m.show} role={editable ? 'group' : 'img'} aria-label={name}>
      {out}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* The child's layer on a check                                        */
/* ------------------------------------------------------------------ */

type LayerProps = GridModelProps & { F: Frame; editable: boolean; modelPhase: boolean; rowHeads: boolean };

function TaskLayer(p: LayerProps) {
  const { task, state } = p;
  if (!task || !state) return null;
  switch (task.kind) {
    case 'count-squares':
      return <CountLayer {...p} />;
    case 'trace-perimeter':
      return <TraceLayer {...p} />;
    case 'draw-rectangle':
      return <DrawLayer {...p} />;
    case 'split-figure':
      return <CutLayer {...p} />;
    default:
      return null;
  }
}

/** Lay squares: every cell and half cell is a button; row heads lay a whole row. */
function CountLayer({ task, state, F, act, modelPhase, rowHeads, ghost, locale }: LayerProps) {
  const fig = task ? taskFigure(task) : null;
  const keys = useMemo(() => (fig ? [...readingOrder(fig.facts.cells), ...fig.facts.halves.map(halfKey)] : []), [fig]);
  const [focus, setFocus] = useState(0);
  const refs = useRef<Record<string, SVGGElement | null>>({});
  if (!task || !state || !fig) return null;
  const rows = figureRows(task);
  const rowNo = (y: number) => rows.findIndex((r) => r.y === y) + 1;
  const colNo = (k: string) => {
    const [x] = isHalfKey(k) ? [parseHalf(k)!.x] : parseCell(k);
    return x - fig.facts.box.x + 1;
  };
  const posOf = (k: string): [number, number] => {
    if (isHalfKey(k)) {
      const h = parseHalf(k)!;
      return [h.x + 0.5, h.y + 0.5];
    }
    const [x, y] = parseCell(k);
    return [x + 0.5, y + 0.5];
  };
  const move = (from: string, dir: 'l' | 'r' | 'u' | 'd') => {
    const [x, y] = posOf(from);
    const cand = keys.filter((k) => k !== from).map((k) => ({ k, p: posOf(k) }));
    const ok = cand.filter(({ p: [cx, cy] }) => (dir === 'r' ? cx > x + 0.01 && Math.abs(cy - y) < 0.01 : dir === 'l' ? cx < x - 0.01 && Math.abs(cy - y) < 0.01 : dir === 'u' ? cy > y + 0.01 : cy < y - 0.01));
    const best = ok.sort((a, b) => Math.hypot(a.p[0] - x, (a.p[1] - y) * 1.5) - Math.hypot(b.p[0] - x, (b.p[1] - y) * 1.5))[0];
    return best?.k ?? null;
  };
  const onKey = (k: string) => (e: KeyboardEvent<SVGGElement>) => {
    const dir = e.key === 'ArrowRight' ? 'r' : e.key === 'ArrowLeft' ? 'l' : e.key === 'ArrowUp' ? 'u' : e.key === 'ArrowDown' ? 'd' : null;
    if (dir) {
      e.preventDefault();
      const next = move(k, dir);
      if (next) {
        setFocus(keys.indexOf(next));
        refs.current[next]?.focus();
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      act?.({ do: 'tile', key: k });
    }
  };
  const stop = keys[Math.min(focus, keys.length - 1)];
  return (
    <g className="ms-grid__count" data-keys="arrows">
      {modelPhase &&
        keys.map((k) => {
          const half = isHalfKey(k);
          const r = half ? null : cellRect(F, k);
          const on = state.tiles.includes(k);
          return (
            <g
              key={k}
              ref={(el) => {
                refs.current[k] = el;
              }}
              className="ms-grid__cellbtn"
              role="button"
              tabIndex={k === stop ? 0 : -1}
              aria-pressed={on}
              aria-label={t(locale, half ? 'math.grid.half' : 'math.grid.cell', { r: rowNo(half ? parseHalf(k)!.y : parseCell(k)[1]), c: colNo(k) })}
              data-cell={k}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                setFocus(keys.indexOf(k));
                act?.({ do: 'tile', key: k });
              }}
              onKeyDown={onKey(k)}
            >
              {r ? <rect className="ms-grid__hit" {...r} /> : <polygon className="ms-grid__hit" points={halfPoints(F, parseHalf(k)!)} />}
            </g>
          );
        })}
      {rowHeads && <RowHeads rows={rows} state={state} F={F} box={fig.facts.box} act={act} locale={locale} />}
      {ghost && (
        <g className="ms-grid__ghost" aria-hidden="true">
          {ghost.tiles.filter((k) => !isHalfKey(k)).map((k) => (
            <rect key={k} {...cellRect(F, k, 2)} />
          ))}
          {ghost.tiles.filter(isHalfKey).map((k) => (
            <polygon key={k} points={halfPoints(F, parseHalf(k)!, 2.5)} />
          ))}
        </g>
      )}
    </g>
  );
}

/** A 40 px head at the start of each row: lay the whole row, or lift it. */
function RowHeads({ rows, state, F, box, act, locale }: { rows: { y: number; keys: string[] }[]; state: TaskState; F: Frame; box: Box; act: GridModelProps['act']; locale: Locale }) {
  return (
    <g className="ms-grid__rows">
      {rows.map((r, i) => {
        const full = r.keys.every((k) => state.tiles.includes(k));
        const h = Math.min(44, F.sy);
        const y = F.Y(r.y + 0.5) - h / 2;
        const x = F.X(box.x) - 46;
        return (
          <g
            key={r.y}
            className="ms-grid__rowbtn"
            role="button"
            tabIndex={0}
            aria-pressed={full}
            aria-label={t(locale, full ? 'math.grid.rowLift' : 'math.grid.rowLay', { r: i + 1 })}
            data-row={r.y}
            onClick={() => act?.({ do: 'row', y: r.y, on: !full })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                act?.({ do: 'row', y: r.y, on: !full });
              }
            }}
          >
            <rect className="ms-grid__rowhit" x={x} y={y} width={40} height={h} />
            <path className="ms-grid__rowglyph" d={`M${x + 14} ${y + h / 2 - 5}l9 5l-9 5Z`} />
          </g>
        );
      })}
    </g>
  );
}

/** Trace sides: tap a side; the side cursor moves along the grid lines (arrows) and Enter traces. */
function TraceLayer({ task, state, F, act, modelPhase, ghost, locale }: LayerProps) {
  const fig = task ? taskFigure(task) : null;
  const sides = useMemo(() => (fig ? new Set(allSides(fig.facts.cells)) : new Set<string>()), [fig]);
  const walk = fig?.facts.walk ?? [];
  // The pen: a grid point and the side it last moved along (the side Enter traces).
  const [pen, setPen] = useState<{ at: [number, number]; side: string } | null>(null);
  if (!task || !state || !fig) return null;
  const first = walk[0] ?? [...sides][0]!;
  const cur = pen && sides.has(pen.side) ? pen : { at: edgeEnds(first)[1], side: first };
  const go = (dx: number, dy: number) => {
    const [x, y] = cur.at;
    const to: [number, number] = [x + dx, y + dy];
    const side = dx > 0 ? edgeKey('h', x, y) : dx < 0 ? edgeKey('h', x - 1, y) : dy > 0 ? edgeKey('v', x, y) : edgeKey('v', x, y - 1);
    if (sides.has(side)) setPen({ at: to, side });
  };
  const key = (e: KeyboardEvent<SVGGElement>) => {
    const d = e.key === 'ArrowRight' ? [1, 0] : e.key === 'ArrowLeft' ? [-1, 0] : e.key === 'ArrowUp' ? [0, 1] : e.key === 'ArrowDown' ? [0, -1] : null;
    if (d) {
      e.preventDefault();
      go(d[0]!, d[1]!);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      act?.({ do: 'edge', key: cur.side });
    }
  };
  // Traced sides in walking order (the ones inside after), numbered when "Walk round" is on.
  const traced = [...walk.filter((e) => state.edges.includes(e)), ...state.edges.filter((e) => !walk.includes(e))];
  const n = walk.length;
  return (
    <g className="ms-grid__trace">
      {traced.map((e) => (
        <line key={e} className="ms-grid__traced" data-inside={!walk.includes(e) || undefined} {...edgeLine(F, e)} />
      ))}
      {state.walked &&
        traced.map((e, i) => {
          const [mx, my] = edgeMid(e);
          const across = edgeEnds(e)[0][1] === edgeEnds(e)[1][1];
          return (
            <text key={`n${e}`} className="ms-grid__walk-no" style={{ ['--d' as string]: `${Math.round((i / Math.max(1, traced.length)) * 760)}ms` }} x={F.X(mx) + (across ? 0 : 11)} y={F.Y(my) + (across ? -6 : 4)} textAnchor="middle">
              {i + 1}
            </text>
          );
        })}
      {modelPhase && (
        <>
          {[...sides].map((e) => (
            <line
              key={`hit${e}`}
              className="ms-grid__sidehit"
              data-side={e}
              {...edgeLine(F, e)}
              onPointerDown={(ev) => {
                if (ev.button !== 0) return;
                ev.preventDefault();
                setPen({ at: edgeEnds(e)[1], side: e });
                act?.({ do: 'edge', key: e });
              }}
            />
          ))}
          <g
            className="ms-grid__cursor"
            role="button"
            tabIndex={0}
            data-keys="arrows"
            aria-label={t(locale, 'math.grid.sides')}
            aria-description={t(locale, 'math.grid.sideAt', { n: state.edges.length, total: n, state: state.edges.includes(cur.side) ? t(locale, 'math.grid.traced.on') : '' })}
            aria-pressed={state.edges.includes(cur.side)}
            data-cursor={cur.side}
            onKeyDown={key}
          >
            <line className="ms-grid__cursor-line" {...edgeLine(F, cur.side)} />
            <circle className="ms-grid__pen" cx={F.X(cur.at[0])} cy={F.Y(cur.at[1])} r={5} />
          </g>
        </>
      )}
      {ghost && <path className="ms-grid__ghost-line" d={edgesPath(F, ghost.edges)} aria-hidden="true" />}
    </g>
  );
}

/** Draw a rectangle from the fixed bottom-left corner: tap a grid point, drag or key the corner handle. */
function DrawLayer({ task, state, F, act, modelPhase, ghost, locale, model: m, defs }: LayerProps) {
  const dragging = useRef(false);
  if (!task || !state) return null;
  const cols = m.cols ?? 12;
  const rows = m.rows ?? 10;
  const pointAt = (e: PointerEvent<SVGElement>) => {
    const box = (e.currentTarget as SVGGraphicsElement).ownerSVGElement?.getBoundingClientRect();
    if (!box) return null;
    const gx = Math.round((e.clientX - box.left - F.X(0)) / F.sx);
    const gy = Math.round((F.Y(0) - (e.clientY - box.top)) / F.sy);
    return [clamp(gx, 1, cols), clamp(gy, 1, rows)] as const;
  };
  const r = state.rect;
  const [w, h] = r ?? [1, 1];
  const key = (e: KeyboardEvent<SVGGElement>) => {
    const d = e.key === 'ArrowRight' ? [1, 0] : e.key === 'ArrowLeft' ? [-1, 0] : e.key === 'ArrowUp' ? [0, 1] : e.key === 'ArrowDown' ? [0, -1] : e.key === 'Home' ? [-cols, -rows] : null;
    if (!d) return;
    e.preventDefault();
    // The handle starts at 1 × 1: the first key moves on from there.
    act?.({ do: 'rect', w: w + d[0]!, h: h + d[1]! });
  };
  const u = m.unit === 'unit' ? '' : ` ${unitText(m.unit, locale)}`;
  const g = ghost?.rect;
  return (
    <g className="ms-grid__draw">
      {modelPhase && (
        <rect
          className="ms-grid__drawhit"
          x={F.X(0)}
          y={F.Y(rows)}
          width={cols * F.sx}
          height={rows * F.sy}
          aria-hidden="true"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            dragging.current = true;
            (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            const pt = pointAt(e);
            if (pt) act?.({ do: 'rect', w: pt[0], h: pt[1] });
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            const pt = pointAt(e);
            if (pt) act?.({ do: 'rect', w: pt[0], h: pt[1] });
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
        />
      )}
      <circle className="ms-grid__origin" cx={F.X(0)} cy={F.Y(0)} r={4} aria-hidden="true" />
      {r && (
        <g aria-hidden="true">
          <rect className="ms-grid__drawn" x={F.X(0)} y={F.Y(h)} width={w * F.sx} height={h * F.sy} />
          <Dim g={{ x1: F.X(0), y1: F.Y(h), x2: F.X(w), y2: F.Y(h), across: true, out: -1, text: `${w}${u}`, tone: undefined, unknown: false }} defs={defs} />
          <Dim g={{ x1: F.X(0), y1: F.Y(0), x2: F.X(0), y2: F.Y(h), across: false, out: -1, text: `${h}${u}`, tone: undefined, unknown: false }} defs={defs} />
        </g>
      )}
      {g && <rect className="ms-grid__ghost-rect" x={F.X(0)} y={F.Y(g[1])} width={g[0] * F.sx} height={g[1] * F.sy} aria-hidden="true" />}
      {modelPhase && (
        <g
          className="ms-grid__handle"
          role="slider"
          tabIndex={0}
          data-keys="arrows"
          aria-label={t(locale, 'math.grid.handle')}
          aria-valuemin={1}
          aria-valuemax={cols}
          aria-valuenow={r ? w : 0}
          aria-valuetext={r ? t(locale, 'math.grid.handleValue', { w: `${w}${u}`, h: `${h}${u}` }) : '—'}
          onKeyDown={key}
          transform={`translate(${F.X(r ? w : 1)} ${F.Y(r ? h : 1)})`}
        >
          <circle className="ms-grid__handle-hit" r={22} />
          <circle className="ms-grid__handle-dot" r={7} />
        </g>
      )}
    </g>
  );
}

/** Cut along a grid line: tap the line, or move the cut cursor (←→ up-and-down cuts, ↑↓ cuts across) and press Enter. */
function CutLayer({ task, state, F, act, modelPhase, ghost, locale, model: m }: LayerProps) {
  const fig = task ? taskFigure(task) : null;
  const [cursor, setCursor] = useState<Cut | null>(null);
  if (!task || !state || !fig) return null;
  const b = fig.facts.box;
  const cur: Cut = cursor ?? { axis: 'x', at: b.x + Math.floor(b.w / 2) || b.x + 1 };
  const cut = parseCut(state.cut);
  const lineOf = (c: Cut) => (c.axis === 'x' ? { x1: F.X(c.at), x2: F.X(c.at), y1: F.Y(b.y) + 12, y2: F.Y(b.y + b.h) - 12 } : { x1: F.X(b.x) - 12, x2: F.X(b.x + b.w) + 12, y1: F.Y(c.at), y2: F.Y(c.at) });
  const key = (e: KeyboardEvent<SVGGElement>) => {
    const step = e.key === 'ArrowRight' ? ['x', 1] : e.key === 'ArrowLeft' ? ['x', -1] : e.key === 'ArrowUp' ? ['y', 1] : e.key === 'ArrowDown' ? ['y', -1] : null;
    if (step) {
      e.preventDefault();
      const axis = step[0] as 'x' | 'y';
      const lo = axis === 'x' ? b.x + 1 : b.y + 1;
      const hi = axis === 'x' ? b.x + b.w - 1 : b.y + b.h - 1;
      const from = cur.axis === axis ? cur.at : axis === 'x' ? b.x + Math.floor(b.w / 2) : b.y + Math.floor(b.h / 2);
      setCursor({ axis, at: clamp(cur.axis === axis ? from + (step[1] as number) : from, lo, hi) });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const k = `${cur.axis}:${cur.at}`;
      act?.({ do: 'gridcut', cut: state.cut === k ? null : k });
    }
  };
  const tap = (e: PointerEvent<SVGRectElement>) => {
    if (e.button !== 0) return;
    const box = (e.currentTarget as SVGGraphicsElement).ownerSVGElement?.getBoundingClientRect();
    if (!box) return;
    const gx = (e.clientX - box.left - F.X(0)) / F.sx;
    const gy = (F.Y(0) - (e.clientY - box.top)) / F.sy;
    const nx = clamp(Math.round(gx), b.x + 1, b.x + b.w - 1);
    const ny = clamp(Math.round(gy), b.y + 1, b.y + b.h - 1);
    const c: Cut = Math.abs(gx - nx) * F.sx <= Math.abs(gy - ny) * F.sy ? { axis: 'x', at: nx } : { axis: 'y', at: ny };
    setCursor(c);
    const k = `${c.axis}:${c.at}`;
    act?.({ do: 'gridcut', cut: state.cut === k ? null : k });
  };
  const pieces = cut && cutPieces(task, state.cut) ? piecesAfter(fig.facts.cells, cut) : null;
  const u = m.unit === 'unit' ? '' : ` ${unitText(m.unit, locale)}`;
  const g = parseCut(ghost?.cut);
  return (
    <g className="ms-grid__split">
      {pieces?.map((pc, i) => {
        const r = rectOf(pc);
        if (!r) return null;
        const d = cut!.axis === 'x' ? { dx: i === 0 ? -4 : 4, dy: 0 } : { dx: 0, dy: i === 0 ? 4 : -4 };
        return (
          <text key={i} className="ms-grid__piece" x={F.X(r.x + r.w / 2) + d.dx} y={F.Y(r.y + r.h / 2) + d.dy + 5} textAnchor="middle" aria-hidden="true">
            {`${r.w}${u} × ${r.h}${u}`}
          </text>
        );
      })}
      {cut && <line className="ms-grid__cut ms-grid__cut--mine" {...lineOf(cut)} aria-hidden="true" />}
      {g && <line className="ms-grid__ghost-line" {...lineOf(g)} aria-hidden="true" />}
      {modelPhase && (
        <>
          <rect className="ms-grid__cuthit" x={F.X(b.x)} y={F.Y(b.y + b.h)} width={b.w * F.sx} height={b.h * F.sy} onPointerDown={tap} aria-hidden="true" />
          <g
            className="ms-grid__cutcursor"
            role="slider"
            tabIndex={0}
            data-keys="arrows"
            aria-label={t(locale, 'math.grid.cursor')}
            aria-valuemin={1}
            aria-valuemax={Math.max(b.w, b.h) - 1}
            aria-valuenow={cur.at}
            aria-valuetext={t(locale, cur.axis === 'x' ? 'math.grid.cutUp' : 'math.grid.cutAcross', { n: cur.axis === 'x' ? cur.at - b.x : cur.at - b.y }) + (state.cut === `${cur.axis}:${cur.at}` ? t(locale, 'math.grid.cutHere') : '')}
            onKeyDown={key}
          >
            <line className="ms-grid__cursor-line" {...lineOf(cur)} />
          </g>
        </>
      )}
    </g>
  );
}

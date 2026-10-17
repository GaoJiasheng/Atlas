/**
 * The hundred grid and the thousand grid (docs/29 §3.2, model A6a), in the
 * fraction wall's flat language: a whole is a square, a tenth is a strip
 * (cut top to bottom, as Singapore textbooks draw it), a hundredth a small
 * square in a strip (hairlines, a slightly heavier line every five), a
 * thousandth one of the ten slivers of a square, shown in a magnifier — a
 * ring round the square, two leader lines and the square blown up beside the
 * grid (under it on a narrow stage), "×10" by the leader, as a technical
 * plate draws "detail A". Shading runs in a fixed order: whole after whole,
 * strips from the left, squares in a strip from the top. Colour says whose:
 * given cold, added signal, a second amount hot, taken away ink slash.
 *
 * On a shade-decimal check the squares (or the strips at level 10) are
 * buttons (tap, or arrows and Enter: ← → a strip, ↑ ↓ a square; + / − a
 * hundredth, Shift a tenth); a button under each strip shades or clears it
 * (44 px: on a phone a square is narrower than a finger); at level 1000 the
 * magnifier follows the next free square and its slivers are buttons.
 */
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { BeatMove, DecimalGridModelSpec, Task } from '../schema';
import type { Action, TaskState } from '../lib/state';
import { cellPlace, cellsPerWhole, cellTh, crossedCells, fills, gridsOf, nextFree, runsOf, tradeCells, wholesOf, zoomCell, type CellFill, type GridLevel } from '../lib/dgrid';
import { formatDecimal } from '../lib/decimal';
import { gridCells, shadedValue } from '../lib/decimal-tasks';
import { DimLine } from './svg';
import type { Rect } from './layout';

export interface DecimalGridProps {
  defs: string;
  box: Rect;
  model: DecimalGridModelSpec;
  locale: Locale;
  label: string;
  move?: BeatMove | null;
  /** A shade-decimal check. */
  task?: Task | null;
  state?: TaskState | null;
  editable?: boolean;
  act?(a: Action): void;
  /** "Show me": the amount to shade, in thousandths (dashed). */
  ghost?: number | null;
  mini?: boolean;
  /** Drawn over a number line (a beat's `under`): this size and place, the wholes side by side with no gap, so 0…1 of the grid is 0…1 of the line. */
  fit?: { x: number; y: number; s: number };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const GAP = 22;
const STRIP_BTN = 44;

interface WholeAt {
  x: number;
  y: number;
}

/** One grid's geometry: wholes side by side, each a square of side `s`. */
function wholeRect(at: WholeAt, s: number, level: GridLevel, cell: number, gap = GAP): { x: number; y: number; w: number; h: number } {
  const p = cellPlace(level, cell);
  const cw = s / 10;
  const x = at.x + p.whole * (s + gap) + p.strip * cw;
  return level === 10 ? { x, y: at.y, w: cw, h: s } : { x, y: at.y + p.square * cw, w: cw, h: cw };
}

/** The fill of one cell piece: a whole cell, or slivers `from` … `to` of it (thin strips across the cell). */
function piece(r: { x: number; y: number; w: number; h: number }, f: CellFill): { x: number; y: number; w: number; h: number } {
  if (f.from === 0 && f.to === 10) return r;
  return { x: r.x + (r.w * f.from) / 10, y: r.y, w: (r.w * (f.to - f.from)) / 10, h: r.h };
}

export function DecimalGrid(p: DecimalGridProps) {
  const { model: m, box, locale } = p;
  const grids = gridsOf(m);
  const live = !!p.editable && p.task?.kind === 'shade-decimal' && !!p.state && p.state.phase === 0;
  const task = p.task?.kind === 'shade-decimal' ? p.task : null;
  const level = (task ? task.level : grids[0]!.level) as GridLevel;
  // The child's shading on a check, the grid's own runs on a beat.
  const childWholes = task ? Math.ceil(gridCells(task) / cellsPerWhole(level)) : 0;
  const wholes = grids.map((g) => (task ? childWholes : wholesOf(g)));
  const magnifier = level === 1000 && (task ? true : grids.some((g) => g.zoom));
  const totalWholes = wholes.reduce((a, b) => a + b, 0);
  const wide = box.w >= box.h * 1.15;
  const labelH = grids.some((g) => g.labels && g.labels !== 'none') ? 24 : 0;
  const below = (live ? STRIP_BTN + 10 : 0) + labelH + 30;
  const pairGap = grids.length > 1 ? 56 : 0;
  // The square: as large as the box allows (the magnifier, 0.62 of a square, beside it or under it), never past a readable size.
  const magShare = magnifier ? 0.62 : 0;
  const gap = p.fit ? 0 : GAP;
  const gaps = (totalWholes - grids.length) * gap + pairGap * (grids.length - 1);
  const sW = (box.w - 24 - gaps - (wide && magnifier ? 70 : 0)) / (totalWholes + (wide ? magShare : 0));
  const sH = (box.h - below - 26 - (!wide && magnifier ? 50 : 0)) / (wide ? 1 : 1 + magShare);
  const s = p.fit ? p.fit.s : clamp(Math.min(sW, sH), p.mini ? 40 : 110, p.mini ? 200 : 460);
  const mag = magnifier ? s * magShare : 0;
  const cw = s / 10;
  const gridsW = wholes.reduce((sum, n) => sum + n * s + (n - 1) * gap, 0) + pairGap * (grids.length - 1);
  const contentW = wide && magnifier ? gridsW + 70 + mag : Math.max(gridsW, mag);
  const contentH = (wide || !magnifier ? s : s + 50 + mag) + below;
  const x0 = p.fit ? p.fit.x : box.x + (box.w - contentW) / 2;
  const y0 = p.fit ? p.fit.y : box.y + Math.max(26, (box.h - contentH) / 2 + 22);
  const out: ReactNode[] = [];
  let gx = x0;
  const origins: WholeAt[] = [];
  grids.forEach((_, gi) => {
    origins.push({ x: gx, y: y0 });
    gx += wholes[gi]! * s + (wholes[gi]! - 1) * gap + pairGap;
  });

  /* the child's shading (a check) */
  const locked = task ? Math.round((task.start?.units ?? 0) / 1000) : 0;
  const childCells = new Set(p.state && task ? p.state.dcells : []);
  const childFills: CellFill[] = [];
  if (task && p.state) {
    const lockedCells = Math.floor(locked / cellTh(level));
    for (const c of p.state.dcells) childFills.push({ cell: c, tone: c < lockedCells ? 'cold' : 'signal', from: 0, to: 10 });
  }
  const nextCell = task && p.state ? nextFree(p.state.dcells, gridCells(task)) : null;

  grids.forEach((g, gi) => {
    const at = origins[gi]!;
    const fl = task ? childFills : fills(level, runsOf(g));
    const crossed = task ? [] : crossedCells(g);
    const lit = task ? [] : tradeCells(g);
    const n = wholes[gi]!;
    const cells = n * cellsPerWhole(level);
    const zc = task ? nextCell : zoomCell(g);
    const ghostFills = p.ghost !== null && p.ghost !== undefined && task ? fills(level, [{ value: p.ghost, tone: 'signal' }]) : [];
    out.push(
      <g key={`g${gi}`} className="ms-dgrid__grid" data-tone={g.tone ?? undefined}>
        {Array.from({ length: n }, (_, w) => {
          const x = at.x + w * (s + gap);
          return (
            <g key={`w${w}`}>
              <rect className="ms-dgrid__whole" x={x} y={at.y} width={s} height={s} />
              {level !== 10 && <path className="ms-dgrid__hair" d={Array.from({ length: 9 }, (_, i) => `M${x} ${at.y + (i + 1) * cw}h${s}`).join('')} />}
              {level !== 10 && <path className="ms-dgrid__five" d={`M${x} ${at.y + 5 * cw}h${s}`} />}
              <path className="ms-dgrid__strip" d={Array.from({ length: 9 }, (_, i) => `M${x + (i + 1) * cw} ${at.y}v${s}`).join('')} />
              {g.quarters && level !== 10 && (
                <path className="ms-dgrid__quarters" d={[25, 50, 75].map((k) => `M${x + (Math.floor(k / 10) + 1) * cw} ${at.y}v${(k % 10) * cw}h${-cw}v${s - (k % 10) * cw}`).join('')} />
              )}
            </g>
          );
        })}
        {fl.map((f, i) => {
          const r = piece(wholeRect(at, s, level, f.cell, gap), f);
          return <rect key={`f${i}`} className="ms-dgrid__fill" data-tone={f.tone} x={r.x + 0.5} y={r.y + 0.5} width={Math.max(0, r.w - 1)} height={Math.max(0, r.h - 1)} style={{ animationDelay: p.move === 'shade' ? `${Math.min(700, i * 6)}ms` : undefined }} />;
        })}
        {crossed.map((f, i) => {
          const r = piece(wholeRect(at, s, level, f.cell, gap), f);
          return (
            <g key={`x${i}`} className="ms-dgrid__crossed">
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={`url(#${p.defs}-hatch)`} />
            </g>
          );
        })}
        {lit.length > 0 && <path className="ms-dgrid__lit" d={lit.map((c) => { const r = wholeRect(at, s, level, c, gap); return `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}Z`; }).join('')} />}
        {ghostFills.map((f, i) => {
          const r = piece(wholeRect(at, s, level, f.cell, gap), f);
          return <rect key={`gh${i}`} className="ms-dgrid__ghost" x={r.x + 2} y={r.y + 2} width={Math.max(0, r.w - 4)} height={Math.max(0, r.h - 4)} />;
        })}
        {gap === 0 && n > 1 && <path className="ms-dgrid__seam" d={Array.from({ length: n - 1 }, (_, w) => `M${at.x + (w + 1) * s} ${at.y}v${s}`).join('')} />}
        {g.labels && g.labels !== 'none' &&
          Array.from({ length: n * 10 }, (_, k) => {
            const r = wholeRect(at, s, 10, k, gap);
            const value = g.labels === 'tenths' ? formatDecimal({ units: (k + 1) * 100_000, dp: 1 }) : String((k + 1) * 10);
            return (
              <text key={`l${k}`} className="ms-dgrid__label" x={r.x + r.w / 2} y={at.y + s + 17} textAnchor="middle">
                {value}
              </text>
            );
          })}
        {zc !== null && magnifier && cells > zc && <Magnifier key="mag" {...p} at={at} s={s} level={level} cell={zc} fills={fl} mag={mag} wide={wide} gridsRight={x0 + gridsW} live={live} />}
      </g>,
    );
  });
  // "1 whole" over the first square.
  out.push(<DimLine key="dim" x1={origins[0]!.x} x2={origins[0]!.x + s} y={y0 - 14} label={t(locale, 'math.whole')} defs={p.defs} />);
  if (live && task && p.state) out.push(<ShadeLayer key="live" {...p} task={task} state={p.state} at={origins[0]!} s={s} level={level} wholes={wholes[0]!} childCells={childCells} locked={Math.floor(locked / cellTh(level))} />);
  return (
    <g className="ms-dgrid" role={live ? 'group' : 'img'} aria-label={p.label} data-move={p.move ?? undefined}>
      {out}
    </g>
  );
}

/** The magnifier: the square at `cell` ringed, leader lines, the square blown up into ten slivers. */
function Magnifier(p: DecimalGridProps & { at: WholeAt; s: number; level: GridLevel; cell: number; fills: CellFill[]; mag: number; wide: boolean; gridsRight: number; live: boolean }) {
  const r = wholeRect(p.at, p.s, p.level, p.cell);
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const ring = r.w * 0.95;
  const M = p.mag;
  const mx = p.wide ? p.gridsRight + 70 : p.at.x + (p.s - M) / 2;
  const my = p.wide ? p.at.y + (p.s - M) / 2 : p.at.y + p.s + 50 + (p.live ? STRIP_BTN + 10 : 0);
  const covered = p.fills.filter((f) => f.cell === p.cell);
  const sliverOn = (k: number) => covered.some((f) => k >= f.from && k < f.to);
  const toneOf = (k: number) => covered.find((f) => k >= f.from && k < f.to)?.tone ?? null;
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(p.locale, key, vars);
  const act = p.act;
  const slivers = p.task?.kind === 'shade-decimal' ? (p.state?.slivers ?? 0) : 0;
  const pick = (k: number) => act?.({ do: 'slivers', n: slivers === k + 1 ? k : k + 1 });
  // Leader lines from the ring to the near corners of the detail.
  const a1 = p.wide ? [cx + ring * 0.7, cy - ring * 0.7, mx, my] : [cx - ring * 0.7, cy + ring * 0.7, mx, my];
  const a2 = p.wide ? [cx + ring * 0.7, cy + ring * 0.7, mx, my + M] : [cx + ring * 0.7, cy + ring * 0.7, mx + M, my];
  return (
    <g className="ms-dgrid__mag" aria-hidden={p.live ? undefined : true}>
      <circle className="ms-dgrid__ring" cx={cx} cy={cy} r={ring} />
      <line className="ms-dgrid__leader" x1={a1[0]} y1={a1[1]} x2={a1[2]} y2={a1[3]} />
      <line className="ms-dgrid__leader" x1={a2[0]} y1={a2[1]} x2={a2[2]} y2={a2[3]} />
      <text className="ms-dgrid__times" x={(a1[0]! + a1[2]!) / 2 + (p.wide ? 0 : -14)} y={(a1[1]! + a1[3]!) / 2 - 8} textAnchor="middle">
        ×10
      </text>
      <rect className="ms-dgrid__whole" x={mx} y={my} width={M} height={M} />
      {Array.from({ length: 10 }, (_, k) => {
        const tone = p.task?.kind === 'shade-decimal' ? (k < slivers ? 'signal' : null) : sliverOn(k) ? toneOf(k) : null;
        return tone ? <rect key={`s${k}`} className="ms-dgrid__fill" data-tone={tone} x={mx + (k * M) / 10 + 0.5} y={my + 0.5} width={M / 10 - 1} height={M - 1} /> : null;
      })}
      <path className="ms-dgrid__strip" d={Array.from({ length: 9 }, (_, i) => `M${mx + ((i + 1) * M) / 10} ${my}v${M}`).join('')} />
      {p.live &&
        Array.from({ length: 10 }, (_, k) => (
          <rect
            key={`b${k}`}
            className="ms-dgrid__btn"
            role="button"
            tabIndex={0}
            aria-pressed={k < slivers}
            aria-label={T('math.dgrid.sliver', { n: k + 1 })}
            x={mx + (k * M) / 10}
            y={my}
            width={M / 10}
            height={M}
            onPointerDown={(e: PointerEvent<SVGRectElement>) => {
              if (e.button !== 0) return;
              e.preventDefault();
              pick(k);
            }}
            onKeyDown={(e: KeyboardEvent<SVGRectElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pick(k);
              }
            }}
          />
        ))}
    </g>
  );
}

/** The squares (or strips) as buttons, and a button under each strip. */
function ShadeLayer(p: DecimalGridProps & { task: Extract<Task, { kind: 'shade-decimal' }>; state: TaskState; at: WholeAt; s: number; level: GridLevel; wholes: number; childCells: Set<number>; locked: number }) {
  const { task, state, level, s, at } = p;
  const total = gridCells(task);
  const [focus, setFocus] = useState(p.locked < total ? p.locked : 0);
  const refs = useRef<(SVGRectElement | null)[]>([]);
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(p.locale, key, vars);
  const act = p.act;
  const now = Math.round(shadedValue(task, state).units / 1000);
  const fine = level === 10 ? 100 : 10;
  const key = (i: number) => (e: KeyboardEvent<SVGRectElement>) => {
    const strips = level === 10 ? 1 : 10;
    const move = (to: number) => {
      e.preventDefault();
      const next = clamp(to, p.locked, total - 1);
      setFocus(next);
      refs.current[next]?.focus();
    };
    if (e.key === 'ArrowRight') move(i + strips);
    else if (e.key === 'ArrowLeft') move(i - strips);
    else if (e.key === 'ArrowDown' && level !== 10) move(i + 1);
    else if (e.key === 'ArrowUp' && level !== 10) move(i - 1);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      act?.({ do: 'dcell', cell: i });
    } else if (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_') {
      e.preventDefault();
      const step = e.shiftKey || e.key === '_' ? 100 : fine;
      act?.({ do: 'dfill', th: now + (e.key === '+' || e.key === '=' ? step : -step) });
    }
  };
  const stop = clamp(focus, 0, total - 1);
  const strips = p.wholes * 10;
  return (
    <g className="ms-dgrid__live" data-keys="arrows">
      {Array.from({ length: total }, (_, i) => {
        if (i < p.locked) return null;
        const r = wholeRect(at, s, level, i);
        const c = cellPlace(level, i);
        return (
          <rect
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="ms-dgrid__btn"
            role="button"
            tabIndex={i === stop ? 0 : -1}
            aria-pressed={p.childCells.has(i)}
            aria-label={level === 10 ? T('math.dgrid.strip', { s: c.whole * 10 + c.strip + 1 }) : T('math.dgrid.cell', { s: c.whole * 10 + c.strip + 1, q: c.square + 1 })}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            onPointerDown={(e: PointerEvent<SVGRectElement>) => {
              if (e.button !== 0) return;
              e.preventDefault();
              setFocus(i);
              act?.({ do: 'dcell', cell: i });
            }}
            onKeyDown={key(i)}
          />
        );
      })}
      {Array.from({ length: strips }, (_, k) => {
        const r = wholeRect(at, s, 10, k);
        const per = level === 10 ? 1 : 10;
        const on = Array.from({ length: per }, (_, j) => k * per + j).every((c) => p.childCells.has(c));
        if ((k + 1) * per <= p.locked) return null;
        return (
          <g key={`sb${k}`} className="ms-dgrid__stripbtn" data-on={on || undefined}>
            <rect
              role="button"
              tabIndex={0}
              aria-label={T(on ? 'math.dgrid.stripClear' : 'math.dgrid.stripFill', { s: k + 1 })}
              x={r.x + 1}
              y={at.y + s + 8}
              width={r.w - 2}
              height={STRIP_BTN}
              rx={4}
              onPointerDown={(e: PointerEvent<SVGRectElement>) => {
                if (e.button !== 0) return;
                e.preventDefault();
                act?.({ do: 'dstrip', strip: k, on: !on });
              }}
              onKeyDown={(e: KeyboardEvent<SVGRectElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  act?.({ do: 'dstrip', strip: k, on: !on });
                }
              }}
            />
            <path className="ms-dgrid__stripmark" d={`M${r.x + r.w / 2} ${at.y + s + 18}v${STRIP_BTN - 20}`} aria-hidden="true" />
          </g>
        );
      })}
    </g>
  );
}


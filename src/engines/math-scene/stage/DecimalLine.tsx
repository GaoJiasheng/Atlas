/**
 * The decimal number line and its zoom (docs/29 §3.4, model A6c), in
 * engineering-ruler grammar: a full-width line per level, top down; the step
 * of the line above that is blown up drawn heavier with a bracket under it,
 * two hairline leaders from its ends down to the ends of the next line and
 * "×10" beside them (a technical plate's "detail A"). Marks are open rings
 * with their value, a read-the-line arrow a small triangle above, the
 * halfway mark a short dashed tick; rounding bolds the nearer end and a
 * signal arrow runs from the mark to it. A second scale (`dual`) prints the
 * smaller unit under the line.
 *
 * On a place check each line is a slider (← → a step, Enter: zoom into the
 * step / place the mark, Esc: close the deepest line); a tap on a line above
 * the deepest opens that step, a tap on the deepest places the mark. On a
 * rounding check the two ends are 44 px buttons (← → and Enter).
 */
import { useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { BeatMove, DecimalLineSpec, Task } from '../schema';
import type { Action, TaskState } from '../lib/state';
import { cmp, eq, formatDecimal, scale, share, type Decimal } from '../lib/decimal';
import { levelsFor, levelsOf, roundingEnds, tickOf, valueAt, type LineLevel } from '../lib/dline';
import { decOf, placedValue } from '../lib/decimal-tasks';
import { unitText, type Unit } from '../lib/value';
import type { Rect } from './layout';

export interface DecimalLineProps {
  defs: string;
  box: Rect;
  model: DecimalLineSpec;
  locale: Locale;
  label: string;
  move?: BeatMove | null;
  task?: Task | null;
  state?: TaskState | null;
  editable?: boolean;
  act?(a: Action): void;
  /** "Show me". */
  ghost?: TaskState | null;
  mini?: boolean;
  /** Under a hundred grid (a beat's `under`): the line's ends and height, so its 0…1 lies under the grid's 0…1. */
  frame?: { x: number; w: number; y: number };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Advance of one character (mono, 0.6 em) of a mark's value (13 px), the halfway value (11 px), a smaller-unit reading (12 px). */
const MARK_CH = 7.8;
const HALF_CH = 6.6;
const DUAL_CH = 7.2;
/** A tick's number (14 px). */
const NUM_CH = 8.4;
const D = (d: Decimal) => formatDecimal(d);

export function DecimalLine(p: DecimalLineProps) {
  const { model: m, box, locale, task, state } = p;
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);
  const placing = task?.kind === 'place' && !!state;
  const rounding = task?.kind === 'round-on-line' && !!state;
  const live = !!p.editable && !!task && !!state && state.phase === 0;
  const levels: LineLevel[] = placing ? levelsFor(m, state!.zoomPath) : levelsOf(m).filter((l): l is LineLevel => !!l);
  const depth = placing && task?.kind === 'place' ? (task.zoom ?? 0) : 0;
  const n = Math.max(1, levels.length);
  const w = p.frame ? p.frame.w : clamp(box.w - (p.mini ? 20 : 110), p.mini ? 80 : 260, 1080);
  const dualH = m.dual ? 22 : 0;
  const gap = clamp((box.h - 70) / n, p.mini ? 40 : 100, 190);
  const x0 = p.frame ? p.frame.x : box.x + (box.w - w) / 2;
  const top = p.frame ? p.frame.y : box.y + Math.max(46, (box.h - gap * (n - 1) - 60 - dualH) / 2 + 34);
  const yOf = (i: number) => top + i * gap;
  const X = (l: LineLevel, v: Decimal) => x0 + share(v, l.from, l.to) * w;
  const marks = m.marks ?? (rounding && task?.kind === 'round-on-line' ? [task.value] : []);
  // Rounding: the nearer end, once the child has chosen it (a check) or as the beat says.
  const nearest = m.nearest ?? (rounding && task?.kind === 'round-on-line' && state && (state.phase > 0 || p.ghost) ? roundingEnds(task.value, task.to).nearest : undefined);
  const out: ReactNode[] = [];
  const unit = m.unit ? unitText(m.unit as Unit, locale) : '';
  // Labels: the ends, the whole numbers, every tick, none (zoomed lines: their ends and, with room, every tick).
  const labelled = (l: LineLevel, i: number, k: number) => {
    if (rounding && task?.kind === 'round-on-line' && task.labels === 'hidden' && (k === 0 || k === l.steps)) return false;
    const v = valueAt(l, k);
    const kind = i === 0 ? m.labels : w / l.steps > 64 ? 'all' : 'ends';
    if (kind === 'none') return false;
    if (kind === 'all') {
      // Every tick, unless their numbers would touch: then every second (or fifth) one, the ends always.
      const longest = Math.max(D(l.from).length, D(l.to).length, D(valueAt(l, 1)).length);
      const stride = [1, 2, 5, 10].find((n) => (w / l.steps) * n >= longest * NUM_CH + 8) ?? 10;
      return k % stride === 0 || k === l.steps;
    }
    if (kind === 'wholes') return v.units % 1_000_000 === 0 || k === 0 || k === l.steps;
    return k === 0 || k === l.steps;
  };

  // The ends of a line as they are written (3.0 keeps its 0), the ticks between with the step's places.
  const tickText = (l: LineLevel, k: number) => D(k === 0 ? l.from : k === l.steps ? l.to : valueAt(l, k));
  const below = m.dual ? 58 : 38;
  // The deepest line each mark lies on: its value above the ring, its smaller-unit reading under the line.
  const placed = marks.map((mk) => {
    const li = levels.indexOf([...levels].reverse().find((l) => cmp(mk, l.from) >= 0 && cmp(mk, l.to) <= 0) ?? levels.at(-1)!);
    const at = levels[li];
    return { mk, li, x: at ? X(at, mk) : 0, dual: m.dual ? D(scale(mk, String(m.dual.factor).length - 1) ?? mk) : '' };
  });
  // A mark's value that would touch the one before it on its line goes a row higher, on a hairline leader.
  const rowOf: number[] = [];
  placed
    .map((pm, k) => ({ ...pm, k }))
    .sort((a, b) => a.li - b.li || a.x - b.x)
    .forEach((pm, i, all) => {
      const prev = all[i - 1];
      const touches = prev && prev.li === pm.li && pm.x - prev.x < ((D(prev.mk).length + D(pm.mk).length) * MARK_CH) / 2 + 6;
      rowOf[pm.k] = touches ? ((rowOf[prev.k] ?? 0) + 1) % 2 : 0;
    });
  // A tick's smaller-unit reading gives way to a mark's at the same place (drawn once, the mark's), and to one it would touch.
  const dualTaken = (i: number, x: number, text: string) => placed.some((pm) => pm.li === i && Math.abs(pm.x - x) < ((pm.dual.length + text.length) * DUAL_CH) / 2 + 4);
  levels.forEach((l, i) => {
    const y = yOf(i);
    const next = levels[i + 1];
    const zoomed = next ? tickOf(l, next.from) : null;
    out.push(
      <g key={`l${i}`} className="ms-dline__level" data-level={i}>
        <line className="ms-line__axis" x1={x0 - 12} x2={x0 + w + 12} y1={y} y2={y} />
        {Array.from({ length: l.steps + 1 }, (_, k) => {
          const v = valueAt(l, k);
          const x = X(l, v);
          const whole = v.units % 1_000_000 === 0;
          const big = k === 0 || k === l.steps || whole;
          const bold = !!nearest && i === levels.length - 1 && eq(v, nearest) && (k === 0 || k === l.steps);
          return (
            <g key={k}>
              <line className={bold ? 'ms-line__major ms-dline__nearest' : big ? 'ms-line__major' : 'ms-line__minor'} x1={x} x2={x} y1={y - (big ? 11 : 7)} y2={y + (big ? 11 : 7)} />
              {labelled(l, i, k) && (
                <text className="ms-line__num ms-dline__num" x={x} y={y + 30} textAnchor="middle" data-bold={bold || undefined}>
                  {tickText(l, k)}
                </text>
              )}
              {m.dual && labelled(l, i, k) && !dualTaken(i, x, D(scale(v, String(m.dual.factor).length - 1) ?? v)) && (
                <text className="ms-dline__dual" x={x} y={y + 50} textAnchor="middle">
                  {D(scale(v, String(m.dual.factor).length - 1) ?? v)}
                </text>
              )}
            </g>
          );
        })}
        {unit && (
          <text className="ms-dline__unit" x={x0 + w + 20} y={y + 4}>
            {unit}
          </text>
        )}
        {m.dual && (
          <text className="ms-dline__unit ms-dline__unit--dual" x={x0 + w + 20} y={y + 54}>
            {unitText(m.dual.unit as Unit, locale)}
          </text>
        )}
        {zoomed !== null && next && (
          <g className="ms-dline__zoom" aria-hidden="true">
            <line className="ms-dline__seg" x1={X(l, next.from)} x2={X(l, next.to)} y1={y} y2={y} />
            <path className="ms-dline__bracket" d={`M${X(l, next.from)} ${y + below}v6H${X(l, next.to)}v-6`} />
            <line className="ms-dline__leader" x1={X(l, next.from)} y1={y + below + 6} x2={x0} y2={yOf(i + 1) - 14} />
            <line className="ms-dline__leader" x1={X(l, next.to)} y1={y + below + 6} x2={x0 + w} y2={yOf(i + 1) - 14} />
            <text className="ms-dline__times" x={(X(l, next.to) + x0 + w) / 2 + 14} y={(y + yOf(i + 1)) / 2} textAnchor="start">
              ×10
            </text>
          </g>
        )}
      </g>,
    );
  });
  const last = levels.at(-1);
  if (last) {
    const y = yOf(levels.length - 1);
    // Halfway between the ends, dashed. Its value sits above the line unless a mark's value is there: then it goes
    // under the line on a longer dashed leader, or, when that tick already has its number under the line, is left to it.
    if (m.halfway) {
      const mid: Decimal = { units: (last.from.units + last.to.units) / 2, dp: last.step.dp };
      const hx = X(last, mid);
      const text = D(mid);
      const crowded = placed.some((pm) => pm.li === levels.length - 1 && Math.abs(pm.x - hx) < (D(pm.mk).length * MARK_CH + text.length * HALF_CH) / 2 + 6);
      const k = tickOf(last, mid);
      const underTaken = k !== null && labelled(last, levels.length - 1, k);
      out.push(
        <g key="half" className="ms-dline__half" aria-hidden="true" data-under={(crowded && !underTaken) || undefined}>
          <line x1={hx} x2={hx} y1={y - 18} y2={crowded && !underTaken ? y + 17 : y + 4} />
          {!crowded ? (
            <text x={hx} y={y - 24} textAnchor="middle">
              {text}
            </text>
          ) : (
            !underTaken && (
              <text x={hx} y={y + 30} textAnchor="middle">
                {text}
              </text>
            )
          )}
        </g>,
      );
    }
    // Marks: on the deepest line they lie on.
    placed.forEach(({ mk, li, x, dual }, k) => {
      const at = levels[li]!;
      out.push(
        <g key={`mk${k}`} className="ms-dline__mark ms-line__point">
          <circle cx={x} cy={yOf(li)} r={6.5} />
          {rowOf[k] ? <line className="ms-dline__tag" x1={x} x2={x} y1={yOf(li) - 9} y2={yOf(li) - 28} /> : null}
          <text x={x} y={yOf(li) - 16 - (rowOf[k] ?? 0) * 18} textAnchor="middle">
            {D(mk)}
          </text>
          {m.dual && (
            <text className="ms-dline__dual ms-dline__dual--mark" x={x} y={yOf(li) + 50} textAnchor="middle">
              {dual}
            </text>
          )}
        </g>,
      );
      if (nearest && li === levels.length - 1) {
        const nx = X(at, nearest);
        out.push(<path key={`nr${k}`} className="ms-dline__toward" pathLength={1} d={`M${x + (nx > x ? 9 : -9)} ${yOf(li) - 36}Q${(x + nx) / 2} ${yOf(li) - 56} ${nx} ${yOf(li) - 18}`} markerEnd={`url(#${p.defs}-arrow)`} />);
      }
    });
    if (m.arrow) {
      const at = [...levels].reverse().find((l) => tickOf(l, m.arrow!) !== null) ?? last;
      const x = X(at, m.arrow);
      const ay = yOf(levels.indexOf(at));
      out.push(
        <g key="arrow" className="ms-line__arrow" aria-label={T('math.line.arrow')}>
          <path d={`M${x} ${ay - 9}l-8 -16h16Z`} />
          <line x1={x} x2={x} y1={ay - 25} y2={ay - 46} />
        </g>,
      );
    }
  }
  /* a place check: the child's mark, the zoom sliders, "Show me" */
  if (placing && task?.kind === 'place' && state && last) {
    const v = placedValue(task, state);
    if (v) {
      const x = X(last, v);
      out.push(
        <g key="mine" className="ms-dline__mine" aria-hidden="true">
          <path d={`M${x} ${yOf(levels.length - 1) - 9}l-9 -17h18Z`} />
        </g>,
      );
    }
    if (p.ghost) {
      const target = decOf(task.target);
      const gl = levelsFor(m, p.ghost.zoomPath).at(-1);
      const gy = top + (p.ghost.zoomPath.length) * gap;
      if (target && gl) out.push(<circle key="ghost" className="ms-dline__ghost" cx={x0 + share(target, gl.from, gl.to) * w} cy={gy} r={11} />);
    }
    if (live) levels.forEach((l, i) => out.push(<LevelSlider key={`s${i}`} {...p} level={l} index={i} y={yOf(i)} x0={x0} w={w} zoom={i < depth} />));
  }
  /* a rounding check: the two ends */
  if (rounding && task?.kind === 'round-on-line' && state && last) {
    const e = roundingEnds(task.value, task.to);
    const y = yOf(levels.length - 1);
    out.push(<RoundEnds key="ends" {...p} lo={e.lo} hi={e.hi} x0={x0} w={w} y={y} hidden={task.labels === 'hidden'} />);
  }
  return (
    <g className="ms-dline" role={live ? 'group' : 'img'} aria-label={p.label} data-move={p.move ?? undefined}>
      {out}
    </g>
  );
}

/** One line of a place check as a slider: a step to zoom into (lines above the deepest), or a tick to place on. */
function LevelSlider(p: DecimalLineProps & { level: LineLevel; index: number; y: number; x0: number; w: number; zoom: boolean }) {
  const { level: l, state, locale } = p;
  const steps = p.zoom ? l.steps - 1 : l.steps;
  const current = p.zoom ? (state?.zoomPath[p.index] ?? 0) : (state?.place ?? 0);
  const [cursor, setCursor] = useState<number | null>(null);
  const at = clamp(cursor ?? current, 0, steps);
  const fire = (k: number) => p.act?.(p.zoom ? { do: 'zoom', level: p.index, seg: k } : { do: 'dplace', tick: k });
  const valueText = p.zoom ? t(locale, 'math.dline.zoom', { from: D(valueAt(l, at)), to: D(valueAt(l, at + 1)) }) : D(valueAt(l, at));
  const key = (e: KeyboardEvent<SVGRectElement>) => {
    const go = (k: number) => {
      e.preventDefault();
      setCursor(clamp(k, 0, steps));
    };
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') go(at + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') go(at - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(steps);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fire(at);
    } else if (e.key === 'Escape' && (state?.zoomPath.length ?? 0) > 0) {
      e.preventDefault();
      p.act?.({ do: 'zoom', level: (state?.zoomPath.length ?? 1) - 1, seg: null });
    }
  };
  const tap = (e: PointerEvent<SVGRectElement>) => {
    if (e.button !== 0) return;
    const b = (e.currentTarget as SVGGraphicsElement).ownerSVGElement?.getBoundingClientRect();
    if (!b) return;
    const rel = clamp((e.clientX - b.left - p.x0) / p.w, 0, 1) * l.steps;
    const k = p.zoom ? clamp(Math.floor(rel), 0, l.steps - 1) : Math.round(rel);
    setCursor(k);
    fire(k);
  };
  const cx = p.zoom ? p.x0 + ((at + 0.5) / l.steps) * p.w : p.x0 + (at / l.steps) * p.w;
  return (
    <g className="ms-dline__slider">
      <rect
        className="ms-dline__hit"
        role="slider"
        tabIndex={0}
        data-keys="arrows"
        aria-label={t(locale, 'math.dline.cursor', { from: D(l.from), to: D(l.to) })}
        aria-valuemin={0}
        aria-valuemax={steps}
        aria-valuenow={at}
        aria-valuetext={valueText}
        x={p.x0 - 22}
        y={p.y - 30}
        width={p.w + 44}
        height={60}
        onKeyDown={key}
        onPointerDown={tap}
      />
      <path className="ms-dline__caret" d={`M${cx} ${p.y + 14}l-7 12h14Z`} aria-hidden="true" />
    </g>
  );
}

/** The two ends of a rounding line as buttons (a radio group). */
function RoundEnds(p: DecimalLineProps & { lo: Decimal; hi: Decimal; x0: number; w: number; y: number; hidden: boolean }) {
  const { state, locale } = p;
  const chosen = state?.end ?? null;
  const live = !!p.editable && !!state && state.phase === 0;
  const ghostEnd = p.ghost?.end ?? null;
  const pick = (side: 'lo' | 'hi') => live && p.act?.({ do: 'end', side });
  const key = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      pick(e.key === 'ArrowLeft' ? 'lo' : 'hi');
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(chosen ?? 'lo');
    }
  };
  return (
    <g className="ms-dline__ends" role="radiogroup" aria-label={t(locale, 'math.tray.nearer')} onKeyDown={key} data-keys="arrows">
      {(['lo', 'hi'] as const).map((side) => {
        const v = side === 'lo' ? p.lo : p.hi;
        const x = side === 'lo' ? p.x0 : p.x0 + p.w;
        return (
          <g key={side} className="ms-dline__end" data-on={chosen === side || undefined} data-ghost={ghostEnd === side || undefined}>
            <rect
              role="radio"
              tabIndex={live ? (chosen === side || (chosen === null && side === 'lo') ? 0 : -1) : undefined}
              aria-checked={chosen === side}
              aria-label={t(locale, 'math.dline.end', { v: p.hidden ? '?' : D(v) })}
              x={x - 34}
              y={p.y + 12}
              width={68}
              height={44}
              rx={8}
              onPointerDown={(e: PointerEvent<SVGRectElement>) => {
                if (e.button !== 0) return;
                e.preventDefault();
                pick(side);
              }}
            />
            {p.hidden && <text className="ms-dline__num" x={x} y={p.y + 41} textAnchor="middle">?</text>}
          </g>
        );
      })}
    </g>
  );
}

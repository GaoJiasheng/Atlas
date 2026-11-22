/**
 * The angle model on the stage (docs/76 §3.1, model A5): arms from one vertex
 * (rays, lines through it), arcs with their size or a letter, right-angle
 * squares, a protractor drawn as the real thing (a half circle, a tick every
 * degree, longer every 5° and 10°, two rows of numbers: outer 0 on the left,
 * inner 0 on the right; the row being read heavier in signal, the other
 * faded), the folded paper right-angle tester, a full turn marked in degrees,
 * shapes with their corners marked, and dot paper with lines, gaps and
 * right-angle marks. A pair or a set shares one scale (long arms look long).
 *
 * Beats move in place when the parts stay the same (`turn`: arms turn, arcs
 * and their sizes follow; the protractor turns), a remount plays `lay` (the
 * protractor or tester slides in), `overlay` (the cold angle slides onto the
 * hot one) or `fold` (the tester folds up). Checks: `measure-angle` drags and
 * turns the protractor (a slider: arrows move it, [ ] turn it, Shift × 15),
 * and once it is laid shows a magnifier on the second arm; `draw-angle` turns
 * the second arm (a slider: ← → 1°, Shift 10°; read as the numbers it points
 * at, never the size); `draw-segment` picks dots (arrow keys and Enter).
 * Reduced motion: everything jumps to place.
 */
import { useEffect, useRef, useState, type KeyboardEvent, type MutableRefObject, type PointerEvent, type ReactNode, type RefObject } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { AngleModelSpec, AngleSpec, BeatMove, Task } from '../schema';
import type { Action, TaskState } from '../lib/state';
import type { Rect } from './layout';
import { angleItems, arcRadius, arcSpan, arcValue, armLen, at, boundsOf, corners, norm, PROTRACTOR_R, reading, type P2, type Row } from '../lib/angle';
import { drawnSegment, drawProtractor, laid, laidRow, protractorRest, segmentSolution, armFor, angleSpecOf } from '../lib/angle-tasks';
import { describeAngle } from '../lib/angle-description';

export interface AngleModelProps {
  model: AngleModelSpec;
  box: Rect;
  defs: string;
  locale: Locale;
  label: string;
  move?: BeatMove | null;
  task?: Task | null;
  state?: TaskState | null;
  editable?: boolean;
  act?(a: Action): void;
  /** "Show me": the answer drawn in ink dashes. */
  ghost?: boolean;
  /** An option's small picture. */
  mini?: boolean;
  /** A scale shared with other pictures (px per unit, at most). */
  unit?: number;
}

const TURN_MS = 760;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const shortest = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

/** A drawing part way between two of the same shape (directions the short way round, arcs as numbers). */
function between2(a: AngleSpec, b: AngleSpec, k: number): AngleSpec {
  const dir = (x: number, y: number) => norm(x + shortest(x, y) * k);
  const num = (x: number, y: number) => x + (y - x) * k;
  return {
    ...b,
    rays: b.rays?.map((r, i) => ({ ...r, dir: a.rays?.[i] ? dir(a.rays[i]!.dir, r.dir) : r.dir })),
    lines: b.lines?.map((l, i) => ({ ...l, dir: a.lines?.[i] ? dir(a.lines[i]!.dir, l.dir) % 180 : l.dir })),
    arcs: b.arcs?.map((c, i) => {
      const p = a.arcs?.[i];
      return p ? { ...c, from: num(p.from, c.from), to: num(p.to, c.to), value: c.value } : c;
    }),
    protractor: b.protractor && a.protractor ? { ...b.protractor, rot: dir(a.protractor.rot, b.protractor.rot) } : b.protractor,
    tester: b.tester && a.tester ? { ...b.tester, dir: dir(a.tester.dir, b.tester.dir) } : b.tester,
  };
}

/** Where a turn starts on a fresh drawing: every arm on the first, every arc shut. */
function collapsed(s: AngleSpec): AngleSpec {
  const first = s.rays?.[0]?.dir ?? s.lines?.[0]?.dir ?? 0;
  return { ...s, rays: s.rays?.map((r, i) => (i === 0 ? r : { ...r, dir: first })), arcs: s.arcs?.map((a) => ({ ...a, to: a.from })) };
}

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** The drawing on show: eased from the last one when only its numbers change. */
function useTurning(spec: AngleSpec, move: BeatMove | null | undefined, live: boolean): AngleSpec {
  const full = (spec.arcs ?? []).some((a) => arcSpan(a) >= 360);
  const start = !live && !reducedMotion() && (move === 'turn' || full) ? collapsed(spec) : spec;
  const [shown, setShown] = useState<AngleSpec>(start);
  const shownRef = useRef<AngleSpec>(start);
  const key = JSON.stringify(spec);
  useEffect(() => {
    if (live || reducedMotion()) {
      shownRef.current = spec;
      setShown(spec);
      return;
    }
    const from = shownRef.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / TURN_MS);
      const s = k >= 1 ? spec : between2(from, spec, ease(k));
      shownRef.current = s;
      setShown(s);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, live]);
  return shown;
}

/* ------------------------------------------------------------------ */
/* Frame: one scale for every drawing in a row                         */
/* ------------------------------------------------------------------ */

interface Frame {
  /** px per unit */
  k: number;
  /** each drawing's vertex (or origin) in px, and its cell */
  cells: { ox: number; oy: number; cell: Rect; extent: Rect }[];
  labelH: number;
}

type B = { x0: number; y0: number; x1: number; y1: number };
const union = (a: B, b: B): B => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) });
const circleB = (c: P2, r: number): B => ({ x0: c[0] - r, y0: c[1] - r, x1: c[0] + r, y1: c[1] + r });

/** The bounds a check needs: the drawing, the protractor anywhere round the vertex and where it lies at the start, the arm turned anywhere. */
function taskBounds(spec: AngleSpec, task: Task | null | undefined): B {
  let b = boundsOf(spec);
  if (task?.kind === 'measure-angle') {
    b = union(b, circleB([0, 0], PROTRACTOR_R * 1.08));
    if (task.place) b = union(b, circleB(protractorRest(task), PROTRACTOR_R * 1.08));
  }
  if (task?.kind === 'draw-angle') b = union(b, circleB([0, 0], 1.3));
  return b;
}

function frameOf(items: AngleSpec[], box: Rect, task: Task | null | undefined, mini: boolean, captions: boolean, unit?: number): Frame {
  const n = items.length;
  const gap = n > 1 ? clamp(box.w * 0.04, 10, 36) : 0;
  const labelH = captions ? (mini ? 0 : 30) : 0;
  const notes = items.some((s) => s.notToScale) && !mini ? 24 : 0;
  const cellW = (box.w - gap * (n - 1)) / n;
  const cellH = box.h - labelH - notes;
  const bs = items.map((s) => (n === 1 ? taskBounds(s, task) : boundsOf(s)));
  const pad = mini ? 6 : 16;
  const cap = mini ? 220 : items.some((s) => s.paper) ? 64 : items.some((s) => s.polygon) ? 120 : 300;
  const k = Math.min(unit ?? cap, cap, ...bs.map((b) => Math.min((cellW - 2 * pad) / Math.max(0.2, b.x1 - b.x0), (cellH - 2 * pad) / Math.max(0.2, b.y1 - b.y0))));
  const cells = bs.map((b, i) => {
    const cell: Rect = { x: box.x + i * (cellW + gap), y: box.y, w: cellW, h: cellH };
    const w = (b.x1 - b.x0) * k;
    const h = (b.y1 - b.y0) * k;
    const left = cell.x + (cell.w - w) / 2;
    const top = cell.y + (cell.h - h) / 2;
    return { ox: left - b.x0 * k, oy: top + b.y1 * k, cell, extent: { x: left, y: top, w, h: h + (captions && !mini ? labelH : 0) } };
  });
  return { k, cells, labelH };
}

/* ------------------------------------------------------------------ */
/* Pieces                                                               */
/* ------------------------------------------------------------------ */

interface Px {
  k: number;
  ox: number;
  oy: number;
}
const toPx = (f: Px, u: P2): P2 => [f.ox + u[0] * f.k, f.oy - u[1] * f.k];
const fmt = (v: number) => Math.round(v * 10) / 10;

/** An arc from one direction anticlockwise to another, radius r px round c (screen y down). */
export function arcPath(c: P2, r: number, from: number, to: number): string {
  const span = to - from;
  if (span >= 359.99) {
    const a = at(from, r);
    const b = at(from + 180, r);
    return `M ${fmt(c[0] + a[0])} ${fmt(c[1] - a[1])} A ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(c[0] + b[0])} ${fmt(c[1] - b[1])} A ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(c[0] + a[0])} ${fmt(c[1] - a[1])}`;
  }
  const a = at(from, r);
  const b = at(to, r);
  return `M ${fmt(c[0] + a[0])} ${fmt(c[1] - a[1])} A ${fmt(r)} ${fmt(r)} 0 ${span > 180 ? 1 : 0} 0 ${fmt(c[0] + b[0])} ${fmt(c[1] - b[1])}`;
}
const tone = (x?: string) => (x ? ` ms-angle--${x}` : '');

/**
 * A protractor at a centre (px), turned `rot`, radius R px. `only` / `numR` / `numScale` are for the magnifier: one row of
 * numbers, set just inside the ticks (a fraction of R) and drawn smaller, so the 4× lens holds the ticks and their number.
 */
function Protractor({ c, R, rot, row, marks, dot, faint, crossed, dense, ghost, className, keep, step, only, numR, numScale = 1 }: { c: P2; R: number; rot: number; row?: Row | null; keep?: readonly number[]; step?: number; marks?: { at: number; row: Row; tone?: string }[]; dot?: number; faint?: boolean; crossed?: boolean; dense: boolean; ghost?: boolean; className?: string; only?: Row; numR?: number; numScale?: number }) {
  const p = (dir: number, r: number): P2 => {
    const q = at(dir, r);
    return [c[0] + q[0], c[1] - q[1]];
  };
  const ticks: ReactNode[] = [];
  for (let d = 0; d <= 180; d++) {
    const long = d % 10 === 0;
    const mid = d % 5 === 0;
    if (!long && !mid && !dense) continue;
    const len = long ? 0.12 : mid ? 0.075 : 0.042;
    const a = p(rot + d, R);
    const b = p(rot + d, R * (1 - len));
    ticks.push(<line key={`t${d}`} className={`ms-angle__tick${long ? ' ms-angle__tick--long' : ''}`} x1={fmt(a[0])} y1={fmt(a[1])} x2={fmt(b[0])} y2={fmt(b[1])} />);
    // The inner row's ticks near the centre, for the long ones.
    if (long) {
      const i1 = p(rot + d, R * 0.58);
      const i2 = p(rot + d, R * 0.52);
      ticks.push(<line key={`i${d}`} className="ms-angle__tick" x1={fmt(i1[0])} y1={fmt(i1[1])} x2={fmt(i2[0])} y2={fmt(i2[1])} />);
    }
  }
  const size = Math.max(12, R * 0.058);
  const nums: ReactNode[] = [];
  // A small protractor numbers every 20° (a 10° label needs about 22 px of curve), a tiny one (the stage above a phone's
  // keypad) every 30°, and always where an arm lies.
  const every = step ?? (R >= 190 ? 10 : R >= 90 ? 20 : 30);
  const held = [...(keep ?? []), ...(marks ?? []).map((m) => m.at)];
  const kept = (dir: number) => held.some((d) => Math.abs(shortest(d, dir)) < 0.5);
  // Numbered every 20°, a number kept at an arm off the 20s would crowd the ones 10° either side of it: those give way.
  const crowded = (dir: number) => every > 10 && !only && held.some((d) => Math.abs(shortest(d, dir)) >= 0.5 && Math.abs(shortest(d, dir)) < every - 0.5);
  for (let v = 0; v <= 180; v += 10) {
    for (const r of ['outer', 'inner'] as const) {
      if (only && r !== only) continue;
      const dir = r === 'inner' ? rot + v : rot + 180 - v;
      if (!kept(dir) && (v % every !== 0 || crowded(dir))) continue;
      const rr = R * (numR ?? (r === 'outer' ? 0.8 : 0.67));
      // On a small protractor (and in the lens) a number under an arm is struck through by it: it sits just beside the arm, in
      // the 10° the crowding rule cleared, as the printed numbers sit beside their ticks. The flat edge's 0 and 180 stay put.
      const edge = Math.abs(shortest(dir, rot)) < 0.5 || Math.abs(shortest(dir, rot + 180)) < 0.5;
      const struck = (every > 10 || !!only) && !edge && kept(dir);
      const side = norm(dir - rot) > 170 ? -1 : 1;
      const q = p(struck ? dir + side * ((size * numScale * 1.05) / rr) * (180 / Math.PI) : dir, rr);
      const lit = marks?.find((m) => m.row === r && Math.abs(norm(m.at) - norm(dir)) < 0.5);
      nums.push(
        <text
          key={`${r}${v}`}
          className={`ms-angle__num ms-angle__num--${r}${row === r ? ' ms-angle__num--read' : row ? ' ms-angle__num--dim' : ''}${lit ? ` ms-angle__num--lit${tone(lit.tone ?? 'hot')}` : ''}`}
          x={fmt(q[0])}
          y={fmt(q[1] + size * numScale * 0.35)}
          fontSize={fmt((r === 'outer' ? size : size * 0.92) * numScale)}
          textAnchor="middle"
          transform={`rotate(${fmt(-(dir - 90))} ${fmt(q[0])} ${fmt(q[1])})`}
        >
          {v}
        </text>,
      );
    }
  }
  const e1 = p(rot, R);
  const e2 = p(rot + 180, R);
  const body = `M ${fmt(e1[0])} ${fmt(e1[1])} A ${fmt(R)} ${fmt(R)} 0 0 0 ${fmt(e2[0])} ${fmt(e2[1])} Z`;
  const cr = Math.max(6, R * 0.04);
  const dotAt = dot === undefined ? null : p(dot, R * 1.04);
  return (
    <g className={`ms-angle__protractor${faint ? ' ms-angle__protractor--faint' : ''}${ghost ? ' ms-angle__protractor--ghost' : ''}${className ? ` ${className}` : ''}`}>
      <path className="ms-angle__protractor-body" d={body} />
      <path className="ms-angle__protractor-inner" d={arcPath(c, R * 0.55, rot, rot + 180)} />
      {ticks}
      {nums}
      <line className="ms-angle__protractor-centre" x1={fmt(c[0] - cr)} y1={fmt(c[1])} x2={fmt(c[0] + cr)} y2={fmt(c[1])} transform={`rotate(${fmt(-rot)} ${fmt(c[0])} ${fmt(c[1])})`} />
      <line className="ms-angle__protractor-centre" x1={fmt(c[0])} y1={fmt(c[1] - cr)} x2={fmt(c[0])} y2={fmt(c[1] + cr)} transform={`rotate(${fmt(-rot)} ${fmt(c[0])} ${fmt(c[1])})`} />
      {dotAt && <circle className="ms-angle__rim-dot" cx={fmt(dotAt[0])} cy={fmt(dotAt[1])} r={Math.max(4, R * 0.022)} />}
      {crossed && <line className="ms-angle__strike" x1={fmt(p(rot + 160, R)[0])} y1={fmt(p(rot + 160, R)[1])} x2={fmt(p(rot + 20, R * 0.2)[0])} y2={fmt(p(rot + 20, R * 0.2)[1])} />}
    </g>
  );
}

/** The folded right-angle tester: a quarter of a circle of paper, its creases. */
function Tester({ c, r, dir, fold }: { c: P2; r: number; dir: number; fold?: boolean }) {
  const p = (d: number, rr: number): P2 => {
    const q = at(d, rr);
    return [c[0] + q[0], c[1] - q[1]];
  };
  const a = p(dir, r);
  const b = p(dir + 90, r);
  const crease = p(dir + 45, r);
  return (
    <g className={`ms-angle__tester${fold ? ' ms-angle__tester--fold' : ''}`}>
      <path className="ms-angle__tester-paper" d={`M ${fmt(c[0])} ${fmt(c[1])} L ${fmt(a[0])} ${fmt(a[1])} ${arcPath(c, r, dir, dir + 90).replace(/^M [^A]+/, '')} Z`} />
      <line className="ms-angle__tester-crease" x1={fmt(c[0])} y1={fmt(c[1])} x2={fmt(crease[0])} y2={fmt(crease[1])} />
      <path className="ms-angle__tester-square" d={`M ${fmt(p(dir, r * 0.2)[0])} ${fmt(p(dir, r * 0.2)[1])} L ${fmt(p(dir + 45, r * 0.2 * Math.SQRT2)[0])} ${fmt(p(dir + 45, r * 0.2 * Math.SQRT2)[1])} L ${fmt(p(dir + 90, r * 0.2)[0])} ${fmt(p(dir + 90, r * 0.2)[1])}`} />
      <line className="ms-angle__tester-edge" x1={fmt(c[0])} y1={fmt(c[1])} x2={fmt(a[0])} y2={fmt(a[1])} />
      <line className="ms-angle__tester-edge" x1={fmt(c[0])} y1={fmt(c[1])} x2={fmt(b[0])} y2={fmt(b[1])} />
    </g>
  );
}

/** Text placed outside a point in a direction (px offset). */
const away = (q: P2, dir: number, px: number): P2 => {
  const d = at(dir, px);
  return [q[0] + d[0], q[1] - d[1]];
};

/** One drawing (rays, lines, arcs, squares, protractor, tester, ring, shape, paper). */
function Drawing({ spec, f, locale, mini, dense, extra }: { spec: AngleSpec; f: Px; locale: Locale; mini: boolean; dense: boolean; extra?: ReactNode }) {
  const out: ReactNode[] = [];
  const V = toPx(f, [0, 0]);
  const fs = mini ? 12 : clamp(f.k * 0.085, 15, 21);

  if (spec.paper) return <Paper spec={spec} f={f} locale={locale} mini={mini} extra={extra} />;
  if (spec.polygon) return <Shape spec={spec} f={f} mini={mini} />;

  if (spec.ring) {
    const R = f.k * 1.0;
    out.push(<circle key="ring" className="ms-angle__ring" cx={fmt(V[0])} cy={fmt(V[1])} r={fmt(R)} />);
    for (let d = 0; d < 360; d += 10) {
      const a = toPx(f, at(d, 1.0));
      const b = toPx(f, at(d, d % 90 === 0 ? 0.86 : 0.93));
      out.push(<line key={`rt${d}`} className={`ms-angle__tick${d % 90 === 0 ? ' ms-angle__tick--long' : ''}`} x1={fmt(a[0])} y1={fmt(a[1])} x2={fmt(b[0])} y2={fmt(b[1])} />);
    }
    for (const d of [0, 90, 180, 270]) {
      const q = toPx(f, at(d, 1.12));
      out.push(<text key={`rl${d}`} className="ms-angle__num" x={fmt(q[0])} y={fmt(q[1] + fs * 0.35)} fontSize={fmt(fs)} textAnchor="middle">{`${d}°`}</text>);
    }
  }

  const p = spec.protractor;
  if (p) {
    const R = PROTRACTOR_R * f.k;
    out.push(
      <g key="prot" className={p.away ? 'ms-angle__lay ms-angle__lay--away' : 'ms-angle__lay'}>
        <Protractor c={V} R={R} rot={p.rot} row={p.row ?? null} marks={p.marks} dot={p.dot} faint={p.faint} crossed={p.crossed} dense={dense && R >= 170} keep={[...(spec.rays ?? []).map((r) => r.dir), ...(spec.lines ?? []).flatMap((l) => [l.dir, l.dir + 180]), ...(p.dot === undefined ? [] : [p.dot])]} />
      </g>,
    );
  }
  if (spec.tester && !spec.tester.away) out.push(<g key="tester" className="ms-angle__lay"><Tester c={V} r={f.k * 0.55} dir={spec.tester.dir} fold={spec.tester.fold} /></g>);

  // Arcs: inside ones first, an arc holding another drawn further out.
  const r0 = arcRadius(spec) * f.k;
  const arcs = spec.arcs ?? [];
  const rings = arcs.map((a) => arcs.filter((b) => b !== a && b.from >= a.from - 0.01 && b.to <= a.to + 0.01 && arcSpan(b) < arcSpan(a)).length);
  arcs.forEach((a, i) => {
    const r = r0 * (1 + 0.42 * rings[i]!);
    const span = arcSpan(a);
    out.push(<path key={`arc${i}`} className={`ms-angle__arc${tone(a.tone ?? 'cold')}${a.dashed ? ' ms-angle__arc--dashed' : ''}`} d={arcPath(V, r, a.from, a.to)} />);
    const deg = a.deg ? `${a.value ?? Math.round(span)}°` : '';
    const text = a.label && a.label !== '?' && deg ? `${a.label} = ${deg}` : (a.label ?? deg);
    if (text) {
      const mid = a.from + span / 2;
      const q = away(V, mid, r + (span < 30 ? 22 : 15) + (text.length > 4 ? 8 : 0));
      out.push(
        <text key={`al${i}`} className={`ms-angle__label${tone(a.tone ?? 'cold')}${a.label === '?' ? ' ms-angle__label--unknown' : ''}`} x={fmt(q[0])} y={fmt(q[1] + fs * 0.35)} fontSize={fmt(fs)} textAnchor="middle">
          {text}
        </text>,
      );
    }
  });
  for (const [a, b] of spec.square ?? []) {
    const s = r0 * 0.6;
    const lo = Math.abs(norm(b - a) - 90) < 0.01 ? a : b;
    const q1 = toPx(f, at(lo, s / f.k));
    const q2 = toPx(f, [at(lo, s / f.k)[0] + at(lo + 90, s / f.k)[0], at(lo, s / f.k)[1] + at(lo + 90, s / f.k)[1]]);
    const q3 = toPx(f, at(lo + 90, s / f.k));
    out.push(<path key={`sq${a}`} className="ms-angle__square" d={`M ${fmt(q1[0])} ${fmt(q1[1])} L ${fmt(q2[0])} ${fmt(q2[1])} L ${fmt(q3[0])} ${fmt(q3[1])}`} />);
  }

  // Arms: lines through the vertex, then rays.
  (spec.lines ?? []).forEach((l, i) => {
    const len = armLen(spec, l.len);
    const a = toPx(f, at(l.dir, len));
    const b = toPx(f, at(l.dir + 180, len));
    out.push(<line key={`ln${i}`} className={`ms-angle__arm${tone(l.tone)}${l.dashed ? ' ms-angle__arm--dashed' : ''}`} x1={fmt(a[0])} y1={fmt(a[1])} x2={fmt(b[0])} y2={fmt(b[1])} />);
    if (l.labels)
      l.labels.forEach((name, j) => {
        const q = away(j === 0 ? a : b, j === 0 ? l.dir : l.dir + 180, fs * 0.9);
        out.push(<text key={`ll${i}${j}`} className="ms-angle__point" x={fmt(q[0])} y={fmt(q[1] + fs * 0.35)} fontSize={fmt(fs)} textAnchor="middle">{name}</text>);
      });
  });
  (spec.rays ?? []).forEach((r, i) => {
    const e = toPx(f, at(r.dir, armLen(spec, r.len)));
    out.push(<line key={`ray${i}`} className={`ms-angle__arm${tone(r.tone)}${r.dashed ? ' ms-angle__arm--dashed' : ''}`} x1={fmt(V[0])} y1={fmt(V[1])} x2={fmt(e[0])} y2={fmt(e[1])} />);
    if (r.label) {
      const q = away(e, r.dir, fs * 0.9);
      out.push(<text key={`rl${i}`} className="ms-angle__point" x={fmt(q[0])} y={fmt(q[1] + fs * 0.35)} fontSize={fmt(fs)} textAnchor="middle">{r.label}</text>);
    }
    if (spec.names && i === 0) {
      const m = toPx(f, at(r.dir, armLen(spec, r.len) * 0.62));
      const q = away(m, r.dir - 90, fs);
      out.push(<text key="arm-name" className="ms-angle__name" x={fmt(q[0])} y={fmt(q[1] + fs * 0.35)} fontSize={fmt(fs * 0.92)} textAnchor="middle">{t(locale, 'math.angle.arm')}</text>);
    }
  });
  if (extra) out.push(<g key="extra">{extra}</g>);
  if (spec.rays?.length || spec.lines?.length) {
    out.push(<circle key="v" className="ms-angle__vertex" cx={fmt(V[0])} cy={fmt(V[1])} r={mini ? 2.5 : 3.5} />);
    const arms = [...(spec.rays ?? []).map((r) => r.dir), ...(spec.lines ?? []).flatMap((l) => [l.dir, l.dir + 180])];
    // The vertex's letter (or name) goes where no arm is: opposite the arms' mean direction.
    const sx = arms.reduce((s, d) => s + Math.cos((d * Math.PI) / 180), 0);
    const sy = arms.reduce((s, d) => s + Math.sin((d * Math.PI) / 180), 0);
    const open = Math.hypot(sx, sy) < 1e-6 ? 270 : (Math.atan2(-sy, -sx) * 180) / Math.PI;
    const text = spec.vertex?.label ?? (spec.names ? t(locale, 'math.angle.vertex') : null);
    if (text) {
      const q = away(V, open, fs * (text.length > 1 ? 1.6 : 1));
      out.push(<text key="vl" className={spec.vertex?.label ? 'ms-angle__point' : 'ms-angle__name'} x={fmt(q[0])} y={fmt(q[1] + fs * 0.35)} fontSize={fmt(fs)} textAnchor="middle">{text}</text>);
    }
  }
  return <g>{out}</g>;
}

/** A shape with its corners marked: a right-angle square, an arc (cold smaller, hot greater), a letter. */
function Shape({ spec, f, mini }: { spec: AngleSpec; f: Px; mini: boolean }) {
  const poly = spec.polygon!;
  const pts = poly.points.map((q) => toPx(f, q as P2));
  const cs = corners(poly.points as P2[]);
  const xs = poly.points.map((q) => q[0]);
  const ys = poly.points.map((q) => q[1]);
  const r = Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 0.16 * f.k;
  const fs = mini ? 12 : clamp(r * 0.5, 13, 20);
  const out: ReactNode[] = [<path key="poly" className={`ms-angle__shape${tone(poly.tone)}`} d={`M ${pts.map((q) => `${fmt(q[0])} ${fmt(q[1])}`).join(' L ')} Z`} />];
  (poly.marks ?? []).forEach((m, i) => {
    const c = cs[i]!;
    const at0 = toPx(f, c.at);
    if (m === 'right') {
      const s = r * 0.6;
      const q1 = away(at0, c.from, s);
      const q2 = away(q1, c.from + 90, s);
      const q3 = away(at0, c.from + 90, s);
      out.push(<path key={`m${i}`} className="ms-angle__square" d={`M ${fmt(q1[0])} ${fmt(q1[1])} L ${fmt(q2[0])} ${fmt(q2[1])} L ${fmt(q3[0])} ${fmt(q3[1])}`} />);
    } else if (m === 'smaller' || m === 'greater') {
      out.push(<path key={`m${i}`} className={`ms-angle__arc${tone(m === 'smaller' ? 'cold' : 'hot')}`} d={arcPath(at0, r * (m === 'smaller' ? 1 : 0.8), c.from, c.to)} />);
    } else if (m) {
      out.push(<path key={`a${i}`} className="ms-angle__arc ms-angle--cold" d={arcPath(at0, r * 0.8, c.from, c.to)} />);
      const q = away(at0, c.from + c.size / 2, r * 0.8 + fs * 0.9);
      out.push(<text key={`m${i}`} className="ms-angle__label ms-angle--cold" x={fmt(q[0])} y={fmt(q[1] + fs * 0.35)} fontSize={fmt(fs)} textAnchor="middle">{m}</text>);
    }
  });
  return <g>{out}</g>;
}

/** Dot paper: dots, lines with named ends, points, right-angle marks, gaps measured. */
function Paper({ spec, f, mini, extra }: { spec: AngleSpec; f: Px; locale: Locale; mini: boolean; extra?: ReactNode }) {
  const p = spec.paper!;
  const out: ReactNode[] = [];
  const fs = mini ? 12 : clamp(f.k * 0.36, 13, 19);
  if ((p.show ?? 'dots') === 'dots')
    for (let y = 0; y < p.rows; y++) for (let x = 0; x < p.cols; x++) {
      const q = toPx(f, [x, y]);
      out.push(<circle key={`d${x},${y}`} className="ms-angle__dot" cx={fmt(q[0])} cy={fmt(q[1])} r={mini ? 1.6 : 2.4} />);
    }
  for (const g of p.gaps ?? []) {
    const a = toPx(f, g.from as P2);
    const b = toPx(f, g.to as P2);
    const mid: P2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const horizontal = Math.abs(a[1] - b[1]) < 1;
    out.push(
      <g key={`g${g.from.join(',')}-${g.to.join(',')}`} className="ms-angle__gap">
        <line x1={fmt(a[0])} y1={fmt(a[1])} x2={fmt(b[0])} y2={fmt(b[1])} />
        <text x={fmt(mid[0] + (horizontal ? 0 : fs * 0.7))} y={fmt(mid[1] + (horizontal ? -fs * 0.5 : fs * 0.35))} fontSize={fmt(fs * 0.9)} textAnchor={horizontal ? 'middle' : 'start'}>
          {g.label}
        </text>
      </g>,
    );
  }
  p.segments.forEach((s, i) => {
    const a = toPx(f, s.from as P2);
    const b = toPx(f, s.to as P2);
    out.push(<line key={`s${i}`} className={`ms-angle__arm${tone(s.tone)}${s.dashed ? ' ms-angle__arm--dashed' : ''}`} x1={fmt(a[0])} y1={fmt(a[1])} x2={fmt(b[0])} y2={fmt(b[1])} />);
    if (s.labels) {
      const dir = (Math.atan2(s.to[1] - s.from[1], s.to[0] - s.from[0]) * 180) / Math.PI;
      const qa = away(a, dir + 180, fs * 0.8);
      const qb = away(b, dir, fs * 0.8);
      out.push(<text key={`sa${i}`} className="ms-angle__point" x={fmt(qa[0])} y={fmt(qa[1] + fs * 0.35)} fontSize={fmt(fs)} textAnchor="middle">{s.labels[0]}</text>);
      out.push(<text key={`sb${i}`} className="ms-angle__point" x={fmt(qb[0])} y={fmt(qb[1] + fs * 0.35)} fontSize={fmt(fs)} textAnchor="middle">{s.labels[1]}</text>);
    }
  });
  for (const c of p.corners ?? []) {
    const o = toPx(f, c.at as P2);
    const s = Math.min(f.k * 0.32, 16);
    const da = Math.atan2(c.a[1], c.a[0]);
    const db = Math.atan2(c.b[1], c.b[0]);
    const q1: P2 = [o[0] + Math.cos(da) * s, o[1] - Math.sin(da) * s];
    const q3: P2 = [o[0] + Math.cos(db) * s, o[1] - Math.sin(db) * s];
    const q2: P2 = [q1[0] + q3[0] - o[0], q1[1] + q3[1] - o[1]];
    out.push(<path key={`c${c.at.join(',')}`} className="ms-angle__square" d={`M ${fmt(q1[0])} ${fmt(q1[1])} L ${fmt(q2[0])} ${fmt(q2[1])} L ${fmt(q3[0])} ${fmt(q3[1])}`} />);
  }
  if (extra) out.push(<g key="extra">{extra}</g>);
  for (const q of p.points ?? []) {
    const o = toPx(f, q.at as P2);
    out.push(<circle key={`p${q.label}`} className={`ms-angle__vertex${tone(q.tone)}`} cx={fmt(o[0])} cy={fmt(o[1])} r={mini ? 2.6 : 4} />);
    out.push(<text key={`pl${q.label}`} className="ms-angle__point" x={fmt(o[0] - fs * 0.7)} y={fmt(o[1] - fs * 0.5)} fontSize={fmt(fs)} textAnchor="middle">{q.label}</text>);
  }
  return <g>{out}</g>;
}

/* ------------------------------------------------------------------ */
/* The model                                                            */
/* ------------------------------------------------------------------ */

export function AngleModel(p: AngleModelProps) {
  const { model, box, locale, task, state } = p;
  const mini = !!p.mini;
  const items = angleItems(model);
  const single = items.length === 1;
  const live = !!task && !!state && (task.kind === 'measure-angle' || task.kind === 'draw-angle' || task.kind === 'draw-segment');
  const shownSpec = useTurning(items[0]!, p.move, live || !single);
  const shown = single ? [shownSpec] : items;
  const captions = shown.some((s) => !!s.label);
  const F = frameOf(shown, box, live ? task : null, mini, captions, p.unit);
  // The drawing's extent as it ends (a turn eases inside it): the number sentence goes under this, not under a frame on the way.
  const end = single ? frameOf(items, box, live ? task : null, mini, captions, p.unit) : F;
  const dense = !mini && box.w >= 600;
  const svgRef = useRef<SVGGElement>(null);
  const [drag, setDrag] = useState<null | 'move' | 'turn' | 'arm'>(null);
  const [cursor, setCursor] = useState<P2>([0, 0]);
  const grab = useRef<P2>([0, 0]);
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);

  const out: ReactNode[] = [];
  shown.forEach((spec, i) => {
    const c = F.cells[i]!;
    const f: Px = { k: F.k, ox: c.ox, oy: c.oy };
    const extra = i === 0 && live ? <Live {...p} f={f} spec={spec} drag={drag} setDrag={setDrag} svgRef={svgRef} cursor={cursor} setCursor={setCursor} grab={grab} T={T} /> : null;
    out.push(
      <g key={`d${i}`} className="ms-angle__item">
        <Drawing spec={spec} f={f} locale={locale} mini={mini} dense={dense} extra={extra} />
        {spec.label && !mini && (
          <text className="ms-angle__caption" x={fmt(c.cell.x + c.cell.w / 2)} y={fmt(c.cell.y + c.cell.h + 20)} textAnchor="middle">
            {tx(spec.label, locale)}
          </text>
        )}
      </g>,
    );
  });
  if (shown.some((s) => s.notToScale) && !mini)
    out.push(
      <text key="nts" className="ms-angle__nts" x={fmt(box.x + box.w - 4)} y={fmt(box.y + box.h - 6)} textAnchor="end">
        {T('math.angle.notToScale')}
      </text>,
    );
  for (const c of end.cells) out.push(<rect key={`ext${c.extent.x}`} className="ms-angle__extent" x={fmt(c.extent.x)} y={fmt(c.extent.y)} width={fmt(c.extent.w)} height={fmt(c.extent.h)} fill="none" stroke="none" />);
  const aria = `${p.label}${p.label ? ' · ' : ''}${shown.map((s) => describeAngle(s, locale)).join(' · ')}`;
  return (
    <g ref={svgRef} className="ms-angle" role={live && p.editable ? 'group' : 'img'} aria-label={aria} data-move={p.move ?? undefined}>
      {out}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* A check: the protractor, the arm, the dots                           */
/* ------------------------------------------------------------------ */

interface LiveProps extends AngleModelProps {
  f: Px;
  spec: AngleSpec;
  drag: null | 'move' | 'turn' | 'arm';
  setDrag(d: null | 'move' | 'turn' | 'arm'): void;
  svgRef: RefObject<SVGGElement | null>;
  cursor: P2;
  setCursor(p: P2): void;
  grab: MutableRefObject<P2>;
  T(key: Parameters<typeof t>[1], vars?: Record<string, string | number>): string;
}

function Live(p: LiveProps) {
  const { task, state, f, T } = p;
  if (!task || !state) return null;
  const act = (a: Action) => (p.editable ? p.act?.(a) : undefined);
  /** The pointer in arm units (y up). */
  const unitsOf = (e: PointerEvent<SVGElement>): P2 | null => {
    const b = p.svgRef.current?.ownerSVGElement?.getBoundingClientRect();
    if (!b) return null;
    return [(e.clientX - b.left - f.ox) / f.k, (f.oy - (e.clientY - b.top)) / f.k];
  };
  const capture = (which: 'move' | 'turn' | 'arm') => (e: PointerEvent<SVGGElement>) => {
    if (e.button !== 0 || !p.editable) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    p.setDrag(which);
  };
  const release = (e: PointerEvent<SVGGElement>) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    p.setDrag(null);
  };
  const out: ReactNode[] = [];
  const R = PROTRACTOR_R * f.k;

  if (task.kind === 'measure-angle') {
    const pos = state.apos ?? protractorRest(task);
    const rot = state.arot;
    const c = toPx(f, pos);
    const isLaid = laid(task, state);
    const row = laidRow(task, state);
    const placing = task.place && state.phase === 0;
    const grab = p.grab;
    const keys = (e: KeyboardEvent<SVGGElement>) => {
      const big = e.shiftKey;
      const stepU = big ? 0.2 : 0.05;
      const moves: Record<string, P2> = { ArrowRight: [stepU, 0], ArrowLeft: [-stepU, 0], ArrowUp: [0, stepU], ArrowDown: [0, -stepU] };
      if (e.key in moves) {
        const m = moves[e.key]!;
        act({ do: 'aput', x: pos[0] + m[0], y: pos[1] + m[1] });
      } else if (e.key === '[' || e.key === ']') act({ do: 'aturn', to: rot + (e.key === '[' ? 1 : -1) * (big ? 15 : 1) });
      else if (e.key === 'Home') act({ do: 'acentre' });
      else return;
      e.preventDefault();
    };
    const knob = toPx(f, [pos[0] + at(rot + 90, PROTRACTOR_R + 0.1)[0], pos[1] + at(rot + 90, PROTRACTOR_R + 0.1)[1]]);
    if (task.place) {
      out.push(
        <g
          key="prot"
          className="ms-angle__handle"
          role="slider"
          tabIndex={placing && p.editable ? 0 : -1}
          aria-label={T('math.angle.protractorHandle')}
          aria-valuemin={0}
          aria-valuemax={359}
          aria-valuenow={Math.round(rot)}
          aria-valuetext={isLaid ? T('math.angle.protractorLaid') : state.apos && Math.hypot(pos[0], pos[1]) < 1e-6 ? T('math.angle.protractorCentred', { rot: Math.round(rot) }) : T('math.angle.protractorAway')}
          data-laid={isLaid || undefined}
          onKeyDown={placing ? keys : undefined}
          onPointerDown={
            placing
              ? (e) => {
                  const u = unitsOf(e);
                  if (u) grab.current = [u[0] - pos[0], u[1] - pos[1]];
                  capture('move')(e);
                }
              : undefined
          }
          onPointerMove={(e) => {
            if (p.drag !== 'move' || !e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
            const u = unitsOf(e);
            if (u) act({ do: 'aput', x: u[0] - grab.current[0], y: u[1] - grab.current[1] });
          }}
          onPointerUp={release}
        >
          <Protractor c={c} R={R} rot={rot} row={row} dense={p.box.w >= 600 && R >= 170} keep={(angleSpecOf(task)?.rays ?? []).map((r) => r.dir)} />
        </g>,
      );
      if (placing)
        out.push(
          <g
            key="knob"
            className="ms-angle__knob-handle"
            aria-label={T('math.angle.turnKnob')}
            onPointerDown={capture('turn')}
            onPointerMove={(e) => {
              if (p.drag !== 'turn' || !e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
              const u = unitsOf(e);
              if (u) act({ do: 'aturn', to: (Math.atan2(u[1] - pos[1], u[0] - pos[0]) * 180) / Math.PI - 90 });
            }}
            onPointerUp={release}
          >
            <circle className="ms-angle__knob" cx={fmt(knob[0])} cy={fmt(knob[1])} r={22} />
            <circle className="ms-angle__knob-dot" cx={fmt(knob[0])} cy={fmt(knob[1])} r={6} />
          </g>,
        );
    }
    // Laid (or drawn in place): a magnifier on where the second arm crosses the scale.
    if (task.place && isLaid && row) {
      const arms = (angleSpecOf(task)?.rays ?? []).map((r) => r.dir);
      const second = arms.find((d) => Math.abs(reading(rot, d, row)) > 0.5);
      if (second !== undefined) out.push(<Lens key="lens" f={f} rot={rot} row={row} dir={second} T={T} />);
    }
    if (p.ghost && task.place && !isLaid) {
      const arms = (angleSpecOf(task)?.rays ?? []).map((r) => r.dir);
      out.push(<Protractor key="ghost" c={toPx(f, [0, 0])} R={R} rot={norm(arms[0] ?? 0)} dense={false} ghost />);
    }
  }

  if (task.kind === 'draw-angle') {
    const base = norm(angleSpecOf(task)?.rays?.[0]?.dir ?? 0);
    const dir = state.adir ?? base;
    const pr = drawProtractor(task);
    const V = toPx(f, [0, 0]);
    if (state.aprot) out.push(<Protractor key="prot" c={V} R={R} rot={pr.rot} row={pr.row} dense={p.box.w >= 600 && R >= 170} keep={[base]} />);
    if (p.ghost) {
      const g = toPx(f, at(armFor(task, task.target), 1.18));
      out.push(<line key="ghost" className="ms-angle__arm ms-angle__arm--ghost" x1={fmt(V[0])} y1={fmt(V[1])} x2={fmt(g[0])} y2={fmt(g[1])} />);
    }
    const end = toPx(f, at(dir, 1.18));
    const inner = Math.round(reading(pr.rot, dir, 'inner'));
    const keys = (e: KeyboardEvent<SVGGElement>) => {
      const step = e.shiftKey ? 10 : 1;
      const sign = task.open === 'ccw' ? 1 : -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') act({ do: 'aarm', dir: dir + sign * step });
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') act({ do: 'aarm', dir: dir - sign * step });
      else return;
      e.preventDefault();
    };
    out.push(
      <g
        key="arm"
        className="ms-angle__handle"
        role="slider"
        tabIndex={p.editable ? 0 : -1}
        aria-label={T('math.angle.secondArm')}
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={Math.round(dir)}
        aria-valuetext={state.adir === null ? T('math.angle.armNotTurned') : T('math.angle.armReading', { inner, outer: 180 - inner })}
        onKeyDown={keys}
        onPointerDown={capture('arm')}
        onPointerMove={(e) => {
          if (p.drag !== 'arm' || !e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
          const u = unitsOf(e);
          if (u && Math.hypot(u[0], u[1]) > 0.08) act({ do: 'aarm', dir: (Math.atan2(u[1], u[0]) * 180) / Math.PI });
        }}
        onPointerUp={release}
      >
        <line className="ms-angle__handle-hit" x1={fmt(V[0])} y1={fmt(V[1])} x2={fmt(end[0])} y2={fmt(end[1])} />
        <line className="ms-angle__arm ms-angle--signal" x1={fmt(V[0])} y1={fmt(V[1])} x2={fmt(end[0])} y2={fmt(end[1])} />
        <circle className="ms-angle__knob" cx={fmt(end[0])} cy={fmt(end[1])} r={22} />
        <circle className="ms-angle__knob-dot" cx={fmt(end[0])} cy={fmt(end[1])} r={6} />
      </g>,
    );
  }

  if (task.kind === 'draw-segment') {
    const paper = p.spec.paper;
    if (!paper) return null;
    const seg = drawnSegment(task, state);
    const picked = [...(task.from ? [task.from as P2] : []), ...state.dpts];
    if (seg) {
      const a = toPx(f, seg[0]);
      const b = toPx(f, seg[1]);
      out.push(<line key="mine" className="ms-angle__arm ms-angle--signal" x1={fmt(a[0])} y1={fmt(a[1])} x2={fmt(b[0])} y2={fmt(b[1])} />);
    }
    if (p.ghost) {
      const sol = segmentSolution(task);
      if (sol) {
        const a = toPx(f, sol[0]);
        const b = toPx(f, sol[1]);
        out.push(<line key="ghost" className="ms-angle__arm ms-angle__arm--ghost" x1={fmt(a[0])} y1={fmt(a[1])} x2={fmt(b[0])} y2={fmt(b[1])} />);
      }
    }
    for (const q of picked) {
      const o = toPx(f, q);
      out.push(<circle key={`pk${q.join(',')}`} className="ms-angle__picked" cx={fmt(o[0])} cy={fmt(o[1])} r={7} />);
    }
    const cur = p.cursor;
    const keys = (e: KeyboardEvent<SVGGElement>) => {
      const m: Record<string, P2> = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
      if (e.key in m) p.setCursor([clamp(cur[0] + m[e.key]![0], 0, paper.cols - 1), clamp(cur[1] + m[e.key]![1], 0, paper.rows - 1)]);
      else if (e.key === 'Enter' || e.key === ' ') act({ do: 'dot', x: cur[0], y: cur[1] });
      else return;
      e.preventDefault();
    };
    const hit = Math.max(22, f.k * 0.45);
    const dots: ReactNode[] = [];
    for (let y = 0; y < paper.rows; y++)
      for (let x = 0; x < paper.cols; x++) {
        const o = toPx(f, [x, y]);
        dots.push(
          <circle
            key={`h${x},${y}`}
            className="ms-angle__dot-hit"
            data-dot={`${x},${y}`}
            cx={fmt(o[0])}
            cy={fmt(o[1])}
            r={fmt(Math.min(hit, f.k / 2))}
            onPointerDown={(e) => {
              if (e.button !== 0 || !p.editable) return;
              e.preventDefault();
              p.setCursor([x, y]);
              act({ do: 'dot', x, y });
            }}
          />,
        );
      }
    const co = toPx(f, cur);
    const on = picked.some((q) => q[0] === cur[0] && q[1] === cur[1]);
    out.push(
      <g
        key="dots"
        className="ms-angle__dots"
        role="grid"
        tabIndex={p.editable ? 0 : -1}
        aria-label={T('math.angle.dotPaper')}
        aria-activedescendant={undefined}
        onKeyDown={keys}
      >
        {dots}
        <circle className="ms-angle__cursor" cx={fmt(co[0])} cy={fmt(co[1])} r={11} aria-hidden="true" />
        <text className="ms-angle__said" aria-live="polite">{`${T('math.angle.dot', { x: cur[0] + 1, y: cur[1] + 1 })}${on ? ` · ${T('math.angle.dotPicked')}` : ''}`}</text>
      </g>,
    );
  }
  return <g className="ms-angle__live">{out}</g>;
}

/**
 * A magnifier, behind the flat edge, on the ticks where the other arm crosses the rim (docs/76 §3.2: 4 times, so the 1° ticks
 * are far enough apart to count). Only the row being read is numbered in it, set just inside the ticks and drawn small
 * (about 15 px once magnified), so the lens holds the ticks and the nearest ten together.
 */
function Lens({ f, rot, row, dir, T }: { f: Px; rot: number; row: Row | null; dir: number; T: LiveProps['T'] }) {
  const R = PROTRACTOR_R * f.k;
  const zoom = 4;
  // Wide enough at 4× to hold a 10° stretch of rim: the tens either side of an arm between them (on a tiny protractor, above a
  // phone's keypad, the lens holds more of the rim than its numbers fit: those go every 20°).
  const lr = Math.max(46, Math.min(120, f.k * 0.5));
  // The numbers in the lens read about 15 px whatever the protractor's size (they are drawn at the protractor's size × zoom).
  const numScale = Math.min(0.5, 15 / (Math.max(12, R * 0.058) * zoom));
  // Below the flat edge, its top clear of it.
  const centre = toPx(f, at(rot - 90, lr / f.k + 0.08));
  const rim = toPx(f, at(dir, PROTRACTOR_R * 0.9));
  const id = `ms-angle-lens-${Math.round(dir)}-${Math.round(rot)}`;
  const arm = toPx(f, at(dir, 1.18));
  const V = toPx(f, [0, 0]);
  return (
    <g className="ms-angle__lens" aria-label={T('math.angle.lens')}>
      <defs>
        <clipPath id={id}>
          <circle cx={fmt(centre[0])} cy={fmt(centre[1])} r={fmt(lr)} />
        </clipPath>
      </defs>
      <line className="ms-angle__lens-leader" x1={fmt(centre[0])} y1={fmt(centre[1])} x2={fmt(rim[0])} y2={fmt(rim[1])} />
      <circle className="ms-angle__lens-glass" cx={fmt(centre[0])} cy={fmt(centre[1])} r={fmt(lr)} />
      <g clipPath={`url(#${id})`}>
        <g transform={`translate(${fmt(centre[0])} ${fmt(centre[1])}) scale(${zoom}) translate(${fmt(-rim[0])} ${fmt(-rim[1])})`}>
          <Protractor c={V} R={R} rot={rot} row={row} dense keep={[dir]} step={R >= 90 ? 10 : 20} only={row ?? 'inner'} numR={0.85} numScale={numScale} />
          <line className="ms-angle__arm ms-angle--cold" x1={fmt(V[0])} y1={fmt(V[1])} x2={fmt(arm[0])} y2={fmt(arm[1])} />
        </g>
      </g>
      <circle className="ms-angle__lens-rim" cx={fmt(centre[0])} cy={fmt(centre[1])} r={fmt(lr)} />
    </g>
  );
}

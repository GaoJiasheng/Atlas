/**
 * The clock face (docs/20 §3.1, model A3a) in hairline ink: a 1.5 px rim and
 * a hairline inner ring, 60 minute marks (every fifth longer), the numbers
 * 1–12, and the optional layers — `05 … 55` outside, `13 … 24` inside, lit
 * marks, the hour hand's sweep hatched, a duration band inside the rim (a
 * ring for each full hour, cold / hot ends), the am / pm plate, a lens on the
 * hour hand's tip, a stopwatch dial. The hands point as on a real clock (the
 * hour hand moves 0.5° a minute); `faulty` draws a clock wrong on purpose.
 *
 * The hands turn by CSS transform on unbounded angles (`lib/clock.ts`), so a
 * `sweep` beat turns them from the last beat's time the right way round in
 * ≤ 900 ms; reduced motion draws the new time at once.
 *
 * On a `set-clock` check the hands are live: drag the minute hand (the hour
 * hand follows; past 12 the hour moves on or back), drag the hour hand (whole
 * hours), tap a number (the minute hand jumps there), or use the hands as
 * sliders — the minute hand ← → one snap step (Shift five), PgUp / PgDn an
 * hour, Home 12 o'clock; the hour hand ← → an hour. The hand in use is signal.
 */
import { useContext, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import { NotationContext } from '../../../lib/rich-text';
import type { BeatMove, ClockFaceSpec, ClockModelSpec, Task } from '../schema';
import type { Action, TaskState } from '../lib/state';
import { clockShown, dial, dragHour, dragMinute, facesOf, faceTime, HALF_DAY, handAngles, hourAngle, minuteAngle, nudge, onDial, pointerAngle, stopwatchAngles, sweepMs, toNumeral } from '../lib/clock';
import { ampmText, clockParts, HOUR, MINUTE } from '../lib/value';
import { clockPastWords, clockWords, durationWords } from '../lib/words';
import type { Rect } from './layout';

export interface ClockModelProps {
  box: Rect;
  model: ClockModelSpec;
  locale: Locale;
  label: string;
  defs: string;
  move?: BeatMove | null;
  /** A set-clock check (live hands) and its state. */
  task?: Task | null;
  state?: TaskState | null;
  editable?: boolean;
  act?(a: Action): void;
  /** "Show me": the target's hands, dashed. */
  ghost?: number | null;
  /** The time to show instead of the model's (a timeline's clock: where the jumps have got to). */
  time?: number;
  mini?: boolean;
}

const rad = (deg: number) => (deg * Math.PI) / 180;
/** A point at `deg` (clockwise from 12) and radius `r` from (0, 0). */
const at = (deg: number, r: number) => ({ x: Math.sin(rad(deg)) * r, y: -Math.cos(rad(deg)) * r });
const pad2 = (n: number) => String(n).padStart(2, '0');
/** The numbers sit inside the minute marks; the minute hand reaches past them to the marks, the hour hand halfway. */
const NUMERAL_R = 0.72;
const HOUR_LEN = 0.5;
const MINUTE_LEN = 0.84;

/** Where the clock goes in a box: the faces side by side (and the lens), their radius. */
export function clockLayout(m: ClockModelSpec, box: { w: number; h: number }, mini = false): { r: number; n: number; lens: boolean; labelH: number; ext: number } {
  const faces = facesOf(m);
  const n = faces.length;
  const lens = !mini && n === 1 && m.zoom === 'hour';
  const labelH = !mini && n > 1 ? 34 : 0;
  // How far past the rim a face reaches (the five-minute labels, the stopwatch's crown).
  const ext = faces.some((f) => f.minuteLabels) ? 1.2 : faces.some((f) => f.face === 'stopwatch') ? 1.16 : 1.06;
  if (mini) return { r: Math.max(12, Math.min(box.w, box.h) / 2 - 6), n, lens, labelH, ext };
  const across = n + (lens ? 1.15 : 0) + (n - 1) * 0.25;
  const r = Math.min((box.h - labelH - 16) / (2 * ext), (box.w - 24) / (2 * ext * across), box.h * 0.36, 300);
  return { r: Math.max(36, Math.floor(r)), n, lens, labelH, ext };
}

/** The 12-hour reading of a face (the aria label, the card's words). */
export function clockReading(f: ClockFaceSpec, t: number, locale: Locale): string {
  if (f.face === 'stopwatch') return durationWords(f.elapsed?.t ?? 0, ['m', 's'], locale);
  return f.ampm === 'show' ? clockWords(t, '12', locale) : clockPastWords(t, locale);
}

/** A tapered hand pointing up from the centre: `len` long, `w` wide at the base, a short tail. */
function handPath(len: number, w: number, tail: number): string {
  return `M${-w / 2} ${tail}L${-w * 0.28} ${-len}L${w * 0.28} ${-len}L${w / 2} ${tail}Z`;
}

/** Keeps a hand's last angle so a `sweep` turns it from there (a re-render mid-turn keeps the turn). */
function useSweep(time: number, sweep: boolean): number {
  const ref = useRef({ to: time, ms: 0 });
  if (ref.current.to !== time) ref.current = { to: time, ms: sweep ? sweepMs(ref.current.to, time) : 0 };
  return ref.current.ms;
}

interface FaceProps {
  f: ClockFaceSpec;
  cx: number;
  cy: number;
  r: number;
  time: number;
  defs: string;
  locale: Locale;
  mini?: boolean;
  sweep: boolean;
  /** The hand being moved (signal). */
  active?: 'hour' | 'minute' | null;
  ghost?: number | null;
}

function Face({ f, cx, cy, r, time, defs, locale, mini, sweep, active, ghost }: FaceProps) {
  const notation = useContext(NotationContext);
  const ms = useSweep(time, sweep);
  const out: ReactNode[] = [];
  const stopwatch = f.face === 'stopwatch';
  const ring = r * 0.94;
  const numSize = mini ? Math.max(8, r * 0.2) : Math.max(13, r * 0.15);
  // Rim, inner ring, marks.
  out.push(<circle key="rim" className="ms-clock__rim" cx={0} cy={0} r={r} />);
  out.push(<circle key="ring" className="ms-clock__ring" cx={0} cy={0} r={ring} />);
  if (stopwatch && !mini) {
    out.push(<rect key="crown" className="ms-clock__crown" x={-r * 0.07} y={-r * 1.15} width={r * 0.14} height={r * 0.09} rx={2} />);
    out.push(<line key="stem" className="ms-clock__rim" x1={0} x2={0} y1={-r * 1.06} y2={-r} />);
  }
  const lit = new Set(f.highlightTicks ?? []);
  if (f.ticks !== 'none' || stopwatch)
    for (let i = 0; i < 60; i++) {
      const five = i % 5 === 0;
      if (f.ticks === 'fives' && !five && !stopwatch) continue;
      const a = at(i * 6, ring);
      const b = at(i * 6, ring - (five ? r * 0.085 : r * 0.04));
      out.push(<line key={`t${i}`} className={lit.has(i) ? 'ms-clock__tick ms-clock__tick--lit' : five ? 'ms-clock__tick ms-clock__tick--five' : 'ms-clock__tick'} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />);
    }
  // A duration band inside the rim: one ring for each hour started, from the start's minute to the end's.
  if (f.arc && !stopwatch) {
    const total = Math.max(0, f.arc.to - f.arc.from);
    const start = dial(minuteAngle(f.arc.from));
    const rings = Math.max(1, Math.ceil(total / HOUR));
    for (let k = 0; k < rings; k++) {
      const span = Math.min(HOUR, total - k * HOUR) / 10;
      if (span <= 0) break;
      const r1 = ring - r * 0.1 - k * r * 0.075;
      const r0 = r1 - r * 0.06;
      out.push(<path key={`arc${k}`} className="ms-clock__arc" d={band(start, start + Math.min(span, 359.9), r0, r1)} style={{ fill: `url(#${defs}-fine)` }} />);
      if (span >= 360 && !mini)
        out.push(
          <text key={`arc${k}h`} className="ms-clock__arc-label" x={at(start + 12, r0 - r * 0.06).x} y={at(start + 12, r0 - r * 0.06).y + 4} textAnchor="middle">
            1 h
          </text>,
        );
    }
    const end = dial(minuteAngle(f.arc.to));
    out.push(<path key="arcA" className="ms-clock__end ms-clock__end--cold" d={tri(start, r * 1.02, r * 0.06)} />);
    out.push(<path key="arcB" className="ms-clock__end ms-clock__end--hot" d={tri(end, r * 1.02, r * 0.06)} />);
  }
  // The hour hand's sweep, hatched.
  if (f.hourTrack && !stopwatch) {
    const from = f.hourTrack === true ? time - (time % HOUR) : f.hourTrack.from;
    const a0 = hourAngle(from);
    const a1 = hourAngle(time);
    if (a1 > a0) out.push(<path key="track" className="ms-clock__track" d={wedge(a0, a1, r * 0.56)} style={{ fill: `url(#${defs}-hatch)` }} />);
  }
  // Numbers.
  if (stopwatch) {
    for (let k = 1; k <= 12; k++) {
      const p = at(k * 30, r * 0.76);
      out.push(
        <text key={`n${k}`} className="ms-clock__num ms-clock__num--small" x={p.x} y={p.y} dy="0.35em" textAnchor="middle" fontSize={numSize * 0.7}>
          {k * 5}
        </text>,
      );
    }
    // The small minute dial (30 minutes round).
    const sc = { x: 0, y: -r * 0.36 };
    const sr = r * 0.2;
    out.push(<circle key="sub" className="ms-clock__ring" cx={sc.x} cy={sc.y} r={sr} />);
    for (let i = 0; i < 30; i++) {
      const a = at(i * 12, sr);
      const b = at(i * 12, sr - (i % 5 === 0 ? sr * 0.22 : sr * 0.11));
      out.push(<line key={`s${i}`} className="ms-clock__tick" x1={sc.x + a.x} y1={sc.y + a.y} x2={sc.x + b.x} y2={sc.y + b.y} />);
    }
    if (!mini)
      out.push(
        <text key="subname" className="ms-clock__small" x={sc.x} y={sc.y + sr * 0.5} textAnchor="middle">
          min
        </text>,
      );
  } else if (f.numerals) {
    for (let k = 1; k <= 12; k++) {
      const p = at(k * 30, r * NUMERAL_R);
      out.push(
        <text key={`n${k}`} className="ms-clock__num" x={p.x} y={p.y} dy="0.35em" textAnchor="middle" fontSize={numSize}>
          {k}
        </text>,
      );
    }
  }
  // The small rings need room: a small face keeps its numbers only.
  if (f.inner24 && !stopwatch && !mini && r >= 100)
    for (let k = 1; k <= 12; k++) {
      const p = at(k * 30, r * 0.56);
      out.push(
        <text key={`i${k}`} className="ms-clock__small ms-clock__small--inner" x={p.x} y={p.y} dy="0.35em" textAnchor="middle" fontSize={Math.max(10, r * 0.07)}>
          {k + 12}
        </text>,
      );
    }
  if (f.minuteLabels && !stopwatch && !mini && r >= 80)
    for (let k = 1; k < 12; k++) {
      const p = at(k * 30, r * 1.1);
      out.push(
        <text key={`m${k}`} className="ms-clock__small" x={p.x} y={p.y} dy="0.35em" textAnchor="middle" fontSize={Math.max(10, r * 0.065)}>
          {pad2(k * 5)}
        </text>,
      );
    }
  // The am / pm plate.
  if (f.ampm && !stopwatch) {
    const w = r * 0.34;
    const h = Math.max(16, r * 0.15);
    out.push(
      <g key="ampm" className="ms-clock__plate" data-ask={f.ampm === 'ask' || undefined}>
        <rect x={-w / 2} y={r * 0.3} width={w} height={h} rx={2} />
        <text x={0} y={r * 0.3 + h / 2} dy="0.35em" textAnchor="middle" fontSize={Math.max(11, h * 0.62)}>
          {f.ampm === 'ask' ? '?' : ampmText(clockParts(time).pm, notation)}
        </text>
      </g>,
    );
  }
  // Hands.
  const hands: ReactNode[] = [];
  const tr = (deg: number) => ({ transform: `rotate(${deg}deg)`, transitionDuration: `${ms}ms` });
  if (stopwatch) {
    const sw = stopwatchAngles(f.elapsed?.t ?? 0);
    const sc = -r * 0.36;
    hands.push(
      <g key="sub" transform={`translate(0 ${sc})`}>
        <g className="ms-clock__hand ms-clock__hand--minute" style={tr(sw.minutes)}>
          <path d={handPath(r * 0.17, Math.max(2, r * 0.025), r * 0.03)} />
        </g>
      </g>,
      <g key="sec" className="ms-clock__hand ms-clock__hand--sweep" style={tr(sw.seconds)}>
        <path d={handPath(r * 0.86, Math.max(2, r * 0.02), r * 0.16)} />
      </g>,
    );
  } else {
    const a = handAngles(time, f.faulty);
    const hourLen = r * HOUR_LEN;
    const minLen = r * MINUTE_LEN;
    // Swapped on purpose: the long thin hand where the hour hand should be.
    const [hl, hw, ml, mw] = a.swapped ? [minLen, r * 0.03, hourLen, r * 0.065] : [hourLen, r * 0.065, minLen, r * 0.03];
    const litHour = f.lit === 'hour' || f.lit === 'both' || active === 'hour';
    const litMin = f.lit === 'minute' || f.lit === 'both' || active === 'minute';
    hands.push(
      <g key="h" className="ms-clock__hand ms-clock__hand--hour" data-lit={litHour || undefined} style={tr(a.hour)}>
        <path d={handPath(hl, Math.max(3, hw), r * 0.08)} />
      </g>,
      <g key="m" className="ms-clock__hand ms-clock__hand--minute" data-lit={litMin || undefined} data-delay={f.lit === 'both' || undefined} style={tr(a.minute)}>
        <path d={handPath(ml, Math.max(2, mw), r * 0.1)} />
      </g>,
    );
    if (f.second)
      hands.push(
        <g key="s" className="ms-clock__hand ms-clock__hand--second" style={tr(a.second)}>
          <line x1={0} y1={r * 0.18} x2={0} y2={-r * 0.86} />
          <circle cx={0} cy={r * 0.13} r={Math.max(2.5, r * 0.025)} />
        </g>,
      );
    if (ghost !== null && ghost !== undefined) {
      const g = handAngles(ghost);
      hands.push(
        <g key="gh" className="ms-clock__ghost" aria-hidden="true">
          <path d={handPath(hourLen, r * 0.065, r * 0.08)} transform={`rotate(${dial(g.hour)})`} />
          <path d={handPath(minLen, r * 0.03, r * 0.1)} transform={`rotate(${dial(g.minute)})`} />
        </g>,
      );
    }
    // Lit hands are named (a leader from the hand out past the rim).
    if (!mini)
      for (const [which, deg, len] of [
        ['hour', a.hour, hl],
        ['minute', a.minute, ml],
      ] as const) {
        if (!(which === 'hour' ? f.lit === 'hour' || f.lit === 'both' : f.lit === 'minute' || f.lit === 'both')) continue;
        // Out between the numbers (half a number past the hand), clear of the five-minute labels.
        const p0 = at(dial(deg), len * 0.7);
        const p1 = at(dial(deg) + 15, r * (f.minuteLabels ? 1.24 : 1.12));
        const right = p1.x >= 0;
        hands.push(
          <g key={`lead-${which}`} className="ms-clock__leader" data-delay={(which === 'minute' && f.lit === 'both') || undefined}>
            <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} />
            <line x1={p1.x} y1={p1.y} x2={p1.x + (right ? 18 : -18)} y2={p1.y} />
            <text x={p1.x + (right ? 22 : -22)} y={p1.y} dy="0.35em" textAnchor={right ? 'start' : 'end'}>
              {t(locale, which === 'hour' ? 'math.clock.hourHand' : 'math.clock.minuteHand')}
            </text>
          </g>,
        );
      }
  }
  hands.push(<circle key="cap" className="ms-clock__cap" cx={0} cy={0} r={Math.max(3, r * 0.035)} />);
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {out}
      {hands}
    </g>
  );
}

/** A ring band from `a0` to `a1` (degrees) between radii `r0` and `r1`. */
function band(a0: number, a1: number, r0: number, r1: number): string {
  const p = (a: number, r: number) => at(a, r);
  const large = a1 - a0 > 180 ? 1 : 0;
  const A = p(a0, r1);
  const B = p(a1, r1);
  const C = p(a1, r0);
  const D = p(a0, r0);
  return `M${A.x} ${A.y}A${r1} ${r1} 0 ${large} 1 ${B.x} ${B.y}L${C.x} ${C.y}A${r0} ${r0} 0 ${large} 0 ${D.x} ${D.y}Z`;
}

/** A wedge from the centre between two angles (unbounded; at most a full turn). */
function wedge(a0: number, a1: number, r: number): string {
  const span = Math.min(359.9, a1 - a0);
  const A = at(a0, r);
  const B = at(a0 + span, r);
  return `M0 0L${A.x} ${A.y}A${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${B.x} ${B.y}Z`;
}

/** A small triangle outside the rim pointing in at angle `a`. */
function tri(a: number, r: number, s: number): string {
  const tip = at(a, r);
  const l = at(a - (s / r) * 57.3, r + s * 1.4);
  const rr = at(a + (s / r) * 57.3, r + s * 1.4);
  return `M${tip.x} ${tip.y}L${l.x} ${l.y}L${rr.x} ${rr.y}Z`;
}

/** The part `[t0, t1]` of a ray from the centre at `deg` (radii `r0`–`r1`) inside a circle about `c` of radius `rad`. */
function rayInCircle(deg: number, r0: number, r1: number, c: { x: number; y: number }, rad: number): [number, number] | null {
  const u = at(deg, 1);
  // |t·u − c|² = rad²  →  t² − 2 t (u·c) + |c|² − rad² = 0
  const b = u.x * c.x + u.y * c.y;
  const disc = b * b - (c.x * c.x + c.y * c.y - rad * rad);
  if (disc <= 0) return null;
  const t0 = Math.max(r0, b - Math.sqrt(disc));
  const t1 = Math.min(r1, b + Math.sqrt(disc));
  return t1 > t0 ? [t0, t1] : null;
}

/**
 * The lens on the hour hand's tip (docs/20 §3.1 `zoom`): the face between the tip and the numbers, magnified — the
 * marks, the numbers either side and the hands as far as they cross it — with two hairlines to the spot it shows.
 * Only what falls inside the lens is drawn (the number sentence is placed under the drawing's box).
 */
function Lens({ f, cx, cy, r, lx, ly, lr, time, defs, numSize }: { f: ClockFaceSpec; cx: number; cy: number; r: number; lx: number; ly: number; lr: number; time: number; defs: string; numSize: number }) {
  const a = handAngles(time, f.faulty);
  const hourDeg = dial(a.hour);
  const c0 = at(hourDeg, r * 0.68);
  const spot = r * 0.27;
  const k = lr / spot;
  const map = (q: { x: number; y: number }) => ({ x: lx + (q.x - c0.x) * k, y: ly + (q.y - c0.y) * k });
  const near = (q: { x: number; y: number }, pad = 0) => Math.hypot(q.x - c0.x, q.y - c0.y) <= spot + pad;
  const id = `${defs}-lens`;
  const parts: ReactNode[] = [];
  const ring = r * 0.94;
  for (let i = 0; i < 60; i++) {
    const q0 = at(i * 6, ring);
    const q1 = at(i * 6, ring - (i % 5 === 0 ? r * 0.085 : r * 0.04));
    if (!near(q0, r * 0.05) && !near(q1, r * 0.05)) continue;
    const m0 = map(q0);
    const m1 = map(q1);
    parts.push(<line key={`t${i}`} className={i % 5 === 0 ? 'ms-clock__tick ms-clock__tick--five' : 'ms-clock__tick'} x1={m0.x} y1={m0.y} x2={m1.x} y2={m1.y} />);
  }
  for (let n = 1; n <= 12; n++) {
    const q = at(n * 30, r * NUMERAL_R);
    if (!near(q, numSize)) continue;
    const m = map(q);
    parts.push(
      <text key={`n${n}`} className="ms-clock__num" x={m.x} y={m.y} dy="0.35em" textAnchor="middle" fontSize={numSize * k}>
        {n}
      </text>,
    );
  }
  for (const [key, deg, len, w] of [
    ['h', hourDeg, r * HOUR_LEN, r * 0.065],
    ['m', dial(a.minute), r * MINUTE_LEN, r * 0.03],
  ] as const) {
    const seg = rayInCircle(deg, 0, len, c0, spot * 1.05);
    if (!seg) continue;
    const p0 = map(at(deg, seg[0]));
    const p1 = map(at(deg, seg[1]));
    // The hand tapers to 0.56 of its width at the tip.
    const width = w * (1 - 0.44 * (seg[1] / len)) * k;
    parts.push(<line key={key} className={`ms-clock__lens-hand ms-clock__lens-hand--${key}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} strokeWidth={Math.max(2, width)} />);
  }
  const spotAt = { x: cx + c0.x, y: cy + c0.y };
  return (
    <g className="ms-clock__lens" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <circle cx={lx} cy={ly} r={lr} />
        </clipPath>
      </defs>
      <circle className="ms-clock__spot" cx={spotAt.x} cy={spotAt.y} r={spot} />
      <line className="ms-clock__lens-line" x1={spotAt.x} y1={spotAt.y - spot} x2={lx} y2={ly - lr} />
      <line className="ms-clock__lens-line" x1={spotAt.x} y1={spotAt.y + spot} x2={lx} y2={ly + lr} />
      <circle className="ms-clock__lens-bg" cx={lx} cy={ly} r={lr} />
      <g clipPath={`url(#${id})`}>{parts}</g>
      <circle className="ms-clock__lens-rim" cx={lx} cy={ly} r={lr} />
    </g>
  );
}

export function ClockModel(p: ClockModelProps) {
  const { model: m, box, locale, defs } = p;
  const faces = facesOf(m);
  const L = clockLayout(m, box, p.mini);
  const r = L.r;
  const live = !!p.editable && !!p.task && p.task.kind === 'set-clock' && !!p.state && p.state.phase === 0;
  const setTask = p.task?.kind === 'set-clock' ? p.task : null;
  const shown = setTask ? clockShown(setTask, p.state?.clock ?? null) : (p.time ?? faceTime(faces[0]!));
  const gap = r * 0.5;
  const lensR = r * 0.55;
  const totalW = L.n * 2 * r * L.ext + (L.n - 1) * gap + (L.lens ? gap + 2 * lensR : 0);
  const x0 = box.x + (box.w - totalW) / 2;
  const cy = box.y + (box.h - L.labelH) / 2;
  const [active, setActive] = useState<'hour' | 'minute' | null>(null);
  const svgRef = useRef<SVGGElement>(null);
  const centre = (i: number) => ({ x: x0 + r * L.ext + i * (2 * r * L.ext + gap), y: cy });

  const out: ReactNode[] = faces.map((f, i) => {
    const c = centre(i);
    const time = i === 0 ? shown : faceTime(f);
    return (
      <g key={`f${i}`}>
        <Face f={f} cx={c.x} cy={c.y} r={r} time={time} defs={defs} locale={locale} mini={p.mini} sweep={p.move === 'sweep'} active={live ? active : null} ghost={i === 0 ? p.ghost : null} />
        {L.labelH > 0 && f.label && (
          <text className="ms-array__title" x={c.x} y={c.y + r * L.ext + 24} textAnchor="middle">
            {tx(f.label, locale)}
          </text>
        )}
      </g>
    );
  });
  if (L.lens) {
    const c = centre(0);
    out.push(<Lens key="lens" f={faces[0]!} cx={c.x} cy={c.y} r={r} lx={c.x + r * L.ext + gap + lensR} ly={c.y} lr={lensR} time={shown} defs={defs} numSize={Math.max(13, r * 0.15)} />);
  }

  if (live && setTask && p.state) {
    const c = centre(0);
    const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);
    const ampm = !!setTask.ampm;
    const snap = setTask.snap;
    const set = (v: number) => p.act?.({ do: 'clock', t: v });
    // The stage SVG is drawn 1:1 (its viewBox is its size in CSS pixels).
    const angleOf = (e: PointerEvent<SVGElement>) => {
      const b = svgRef.current?.ownerSVGElement?.getBoundingClientRect();
      return b ? pointerAngle(e.clientX - b.left - c.x, e.clientY - b.top - c.y) : null;
    };
    const drag = (which: 'hour' | 'minute') => ({
      onPointerDown(e: PointerEvent<SVGGElement>) {
        if (e.button !== 0) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setActive(which);
      },
      onPointerMove(e: PointerEvent<SVGGElement>) {
        if (active !== which || !e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
        const a = angleOf(e);
        if (a !== null) set(which === 'minute' ? dragMinute(shown, a, snap, ampm) : dragHour(shown, a, ampm));
      },
      onPointerUp(e: PointerEvent<SVGGElement>) {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
        setActive(null);
      },
    });
    const keys = (which: 'hour' | 'minute') => (e: KeyboardEvent<SVGGElement>) => {
      const go = (v: number) => {
        e.preventDefault();
        set(v);
      };
      const step = which === 'hour' ? HOUR : snap * MINUTE * (e.shiftKey ? 5 : 1);
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') go(nudge(shown, step, snap, ampm));
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') go(nudge(shown, -step, snap, ampm));
      else if (e.key === 'PageUp') go(nudge(shown, HOUR, snap, ampm));
      else if (e.key === 'PageDown') go(nudge(shown, -HOUR, snap, ampm));
      else if (e.key === 'Home') go(onDial(shown - (shown % HALF_DAY), ampm));
    };
    const reading = clockReading({ ...faces[0]!, ampm: ampm ? 'show' : undefined }, shown, locale);
    const parts = clockParts(shown);
    const a = handAngles(shown);
    const knob = Math.max(22, r * 0.08);
    // Tap a number: the minute hand jumps there.
    out.push(
      <g key="nums" className="ms-clock__taps">
        {Array.from({ length: 12 }, (_, i) => {
          const k = i + 1;
          const q = at(k * 30, r * NUMERAL_R);
          return (
            <circle
              key={k}
              className="ms-clock__tap"
              cx={c.x + q.x}
              cy={c.y + q.y}
              r={Math.max(22, r * 0.1)}
              role="button"
              tabIndex={-1}
              aria-label={T('math.clock.toNumeral', { n: k, m: (k % 12) * 5 })}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                set(toNumeral(shown, k, ampm));
              }}
            />
          );
        })}
      </g>,
    );
    for (const which of ['hour', 'minute'] as const) {
      const deg = dial(which === 'hour' ? a.hour : a.minute);
      const len = which === 'hour' ? r * HOUR_LEN : r * MINUTE_LEN;
      const tip = at(deg, len);
      out.push(
        <g
          key={`handle-${which}`}
          className="ms-clock__handle"
          role="slider"
          tabIndex={0}
          aria-label={T(which === 'hour' ? 'math.clock.hourHand' : 'math.clock.minuteHand')}
          aria-valuemin={which === 'hour' ? 1 : 0}
          aria-valuemax={which === 'hour' ? 12 : 59}
          aria-valuenow={which === 'hour' ? parts.h12 : parts.m}
          aria-valuetext={reading}
          data-hand={which}
          onKeyDown={keys(which)}
          onFocus={() => setActive(which)}
          onBlur={() => setActive(null)}
          {...drag(which)}
        >
          <line className="ms-clock__handle-hit" x1={c.x} y1={c.y} x2={c.x + tip.x} y2={c.y + tip.y} />
          <circle className="ms-clock__knob" cx={c.x + tip.x} cy={c.y + tip.y} r={knob} />
          <circle className="ms-clock__knob-dot" cx={c.x + tip.x} cy={c.y + tip.y} r={Math.max(4, r * 0.022)} />
        </g>,
      );
    }
  }
  const aria = live ? p.label : `${p.label}${p.label ? ' · ' : ''}${faces.map((f, i) => clockReading(f, i === 0 ? shown : faceTime(f), locale)).join(' · ')}`;
  return (
    <g ref={svgRef} className="ms-clock" role={live ? 'group' : 'img'} aria-label={aria} data-move={p.move ?? undefined}>
      {out}
    </g>
  );
}

/** Where the hands of a face point, in words (a picture option's alt text: a wrong clock is described, not read). */
export function describeClock(f: ClockFaceSpec, locale: Locale): string {
  if (f.face === 'stopwatch') return durationWords(f.elapsed?.t ?? 0, ['m', 's'], locale);
  const a = handAngles(f.time, f.faulty);
  const [hourDeg, minDeg] = a.swapped ? [a.minute, a.hour] : [a.hour, a.minute];
  const numeral = (n: number) => ((n + 11) % 12) + 1;
  const hd = dial(hourDeg);
  const h = Math.floor(hd / 30);
  const hour = Math.abs(hd - h * 30) < 0.01 ? t(locale, 'math.clock.on', { n: numeral(h) }) : t(locale, 'math.clock.between', { a: numeral(h), b: numeral(h + 1) });
  const mm = Math.round(dial(minDeg) / 6) % 60;
  const minute = mm % 5 === 0 ? t(locale, 'math.clock.on', { n: numeral(mm / 5) }) : t(locale, 'math.clock.mark', { m: mm });
  return t(locale, 'math.clock.hands', { hour, minute });
}

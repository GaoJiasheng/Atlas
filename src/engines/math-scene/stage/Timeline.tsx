/**
 * The timeline (docs/20 §3.2, model A3b) in engineering-ruler grammar: a
 * horizontal rule with the whole hours long and labelled (12-hour time as the
 * hour over a small am / pm; 24-hour time in the lesson's notation; both, the
 * 24-hour labels above the line and the 12-hour ones below; a duration scale
 * 0, 1 h, 2 h), the minor marks short. The morning and the afternoon can lie
 * in two faint bands with noon and midnight marked; times are marked with a
 * small triangle and a label (cold the start, hot the end); jumps are arcs
 * ("+ 20 min" at the top, forwards above the line, back below it) that a
 * `jump` beat draws one after the other. A clock face beside the line can
 * show the time at its last mark.
 *
 * On a `duration` check the child jumps with the tray's chips: each run of
 * jumps is a signal arc from the time known, the point reached is a signal
 * ring, and the clock beside the line (with `clock: true`) follows it. "Show
 * me" draws the solution's jumps dashed.
 */
import { useContext, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import { NotationContext } from '../../../lib/rich-text';
import type { BeatMove, Task, TimelineSpec } from '../schema';
import type { TaskState } from '../lib/state';
import { hopArcs, hopEnd, hopStart, hourMarks, jumpLabel, labelEvery, minorMarks, minorOf, rangeOf } from '../lib/timeline';
import { ampmText, clockParts, clockText, DAY, durationText, HOUR, naturalUnits } from '../lib/value';
import { ClockModel } from './ClockModel';
import type { Rect } from './layout';

export interface TimelineProps {
  box: Rect;
  model: TimelineSpec;
  locale: Locale;
  label: string;
  defs: string;
  move?: BeatMove | null;
  /** A duration check: the child's jumps. */
  task?: Task | null;
  state?: TaskState | null;
  /** "Show me": the solution's jumps. */
  ghost?: TaskState | null;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The time the clock beside the line shows: where the child's jumps are, else the last mark (or jump), else the start. */
export function timelineNow(m: TimelineSpec, task: Task | null | undefined, state: TaskState | null | undefined): number {
  if (task && state && task.kind === 'duration') return hopEnd(task, state.hops) ?? rangeOf(m).from;
  return m.marks?.at(-1)?.at ?? m.jumps?.at(-1)?.[1] ?? rangeOf(m).from;
}

export function Timeline(p: TimelineProps) {
  const m = p.model;
  const notation = useContext(NotationContext);
  const { box, locale } = p;
  const r = rangeOf(m);
  // The clock beside the line, when there is room for both (a phone draws the line alone).
  const clockSide = m.clock && box.w >= 560 ? Math.floor(clamp(Math.min(box.h * 0.62, box.w * 0.3), 90, 340)) : 0;
  const left = box.x + (clockSide ? clockSide + 48 : 50);
  const right = box.x + box.w - 40;
  const width = clockSide ? right - left : Math.min(right - left, 1300);
  const x0 = clockSide ? left : box.x + (box.w - width) / 2;
  const X = (t: number) => x0 + ((t - r.from) / Math.max(1, r.to - r.from)) * width;
  const both = m.labels === 'both' && !r.duration;
  const out: ReactNode[] = [];
  const under: ReactNode[] = [];
  const live = p.task?.kind === 'duration' && p.state ? p.task : null;
  const arcMax = clamp(box.h * 0.22, 24, 64);
  const arcH = (a: number, b: number) => clamp(Math.abs(X(b) - X(a)) * 0.45, 14, arcMax);
  // Above the line, bottom up: the 24-hour labels (both), the arcs, then the marks' labels, then the bands' names.
  const above24 = both ? 30 : 0;
  const forward = [...(m.jumps ?? []), ...(live && p.state ? hopArcs(live, [...p.state.hops, ...(p.ghost?.hops ?? [])]) : [])].filter(([a, b]) => b > a);
  const maxUp = forward.length ? Math.max(...forward.map(([a, b]) => arcH(a, b))) + 22 : 0;
  const hasMarks = (m.marks?.length ?? 0) > 0;
  const markOff = above24 + Math.max(maxUp, 26) + 12;
  const topOff = hasMarks ? markOff + ((m.marks ?? []).some((k) => k.label) ? 22 : 0) + 18 : above24 + maxUp + 12;
  // The whole drawing (labels above, hour labels and arcs back below) centred in the box, the line where that puts it.
  const below = 56;
  const y = Math.round(box.y + Math.max(topOff, (box.h - topOff - below) / 2 + topOff));
  const markTime = y - markOff;
  const topmost = y - topOff;

  /* the morning and the afternoon */
  if (m.bands === 'ampm' && !r.duration) {
    const bandTop = Math.round(topmost - 6);
    const bandH = y + 50 - bandTop;
    for (const [from, to, key, name] of [
      [0, 12 * HOUR, 'am', 'math.timeline.morning'],
      [12 * HOUR, DAY, 'pm', 'math.timeline.afternoon'],
    ] as const) {
      const a = Math.max(from, r.from);
      const b = Math.min(to, r.to);
      if (b <= a) continue;
      under.push(
        <g key={`band-${key}`} className="ms-tl__band" data-band={key}>
          <rect x={X(a)} y={bandTop} width={X(b) - X(a)} height={bandH} />
          <text className="ms-tl__band-name" x={(X(a) + X(b)) / 2} y={bandTop - 8} textAnchor="middle">
            {`${ampmText(key === 'pm', notation).toLocaleUpperCase('en')} · ${t(locale, name)}`}
          </text>
        </g>,
      );
    }
    for (const at of [0, 12 * HOUR, DAY])
      if (at >= r.from && at <= r.to)
        under.push(
          <g key={`edge${at}`} className="ms-tl__edge">
            {/* Above the labels on the line only (they stay readable), and under the hour labels to the band's foot. */}
            <line x1={X(at)} x2={X(at)} y1={bandTop - 2} y2={y - 12 - above24} />
            <line x1={X(at)} x2={X(at)} y1={y + 48} y2={bandTop + bandH} />
            <text x={X(at)} y={bandTop + bandH + 14} textAnchor="middle">
              {t(locale, at === 12 * HOUR ? 'math.timeline.noon' : 'math.timeline.midnight')}
            </text>
          </g>,
        );
  }

  /* the rule, its minor and hour marks */
  out.push(<line key="axis" className="ms-line__axis" x1={x0 - 10} x2={x0 + width + 10} y1={y} y2={y} />);
  for (const t of minorMarks(r, minorOf(m))) out.push(<line key={`n${t}`} className="ms-line__minor" x1={X(t)} x2={X(t)} y1={y - 6} y2={y + 6} />);
  const hours = hourMarks(r);
  const every = labelEvery(r, width, m.labels === '12h' ? 40 : 58);
  const hourLabel = (t: number, mode: '12' | '24'): ReactNode => {
    if (r.duration) return `${t / HOUR === 0 ? '0' : `${t / HOUR} h`}`;
    if (mode === '24') return t === DAY ? clockText(0, '24', notation).replace(/^00/, '24') : clockText(t, '24', notation);
    const parts = clockParts(t === DAY ? 0 : t);
    return (
      <>
        <tspan>{parts.h12}</tspan>
        <tspan className="ms-tl__ampm" x={X(t)} dy="1.15em">
          {ampmText(t !== DAY && parts.pm, notation)}
        </tspan>
      </>
    );
  };
  for (const t of hours) {
    const labelled = ((t - (hours[0] ?? 0)) / HOUR) % every === 0;
    out.push(
      <g key={`h${t}`}>
        <line className="ms-line__major" x1={X(t)} x2={X(t)} y1={y - 11} y2={y + 11} />
        {labelled && (
          <text className="ms-line__num" x={X(t)} y={y + 30} textAnchor="middle">
            {hourLabel(t, m.labels === '24h' ? '24' : '12')}
          </text>
        )}
        {labelled && both && (
          <text className="ms-line__num ms-tl__num24" x={X(t)} y={y - 20} textAnchor="middle">
            {hourLabel(t, '24')}
          </text>
        )}
      </g>,
    );
  }

  /* arcs: the beat's jumps, the child's, the solution's */
  const arcPath = (a: number, b: number, lift = 0) => {
    const h = arcH(a, b) + lift;
    const dir = b >= a ? -1 : 1;
    return `M${X(a)} ${y + dir * 3}Q${(X(a) + X(b)) / 2} ${y + dir * 2 * h} ${X(b)} ${y + dir * 3}`;
  };
  const arc = (key: string, a: number, b: number, cls: string, delay: number, landed = true) => {
    const dir = b >= a ? -1 : 1;
    const h = arcH(a, b);
    out.push(
      <g key={key} className={`ms-tl__jump ${cls}`} style={{ animationDelay: `${delay}ms` }} aria-hidden="true">
        <path d={arcPath(a, b)} />
        <text x={(X(a) + X(b)) / 2} y={y + dir * (h + 10) + (dir > 0 ? 10 : 0)} textAnchor="middle">
          {jumpLabel(a, b)}
        </text>
        <circle className="ms-tl__land" cx={X(a)} cy={y} r={3.5} />
        {landed && <circle className="ms-tl__land" cx={X(b)} cy={y} r={4.5} />}
      </g>,
    );
  };
  const jumps = m.jumps ?? [];
  // One after the other, the last done within 900 ms (380 ms each).
  const stagger = p.move === 'jump' ? Math.min(160, 520 / Math.max(1, jumps.length)) : 0;
  jumps.forEach(([a, b], i) => arc(`j${i}-${a}-${b}`, a, b, '', i * stagger));

  if (live && p.state) {
    hopArcs(live, p.state.hops).forEach(([a, b], i) => arc(`hop${i}-${a}`, a, b, 'ms-tl__jump--mine', 0));
    const start = hopStart(live);
    const end = hopEnd(live, p.state.hops);
    if (start)
      out.push(
        <path key="from" className={`ms-tl__mark ms-tl__mark--${live.ask === 'start' ? 'hot' : 'cold'}`} d={`M${X(start.at)} ${y - 8}l-7 -13h14Z`} aria-hidden="true" />,
      );
    if (end !== null && p.state.hops.length > 0) out.push(<circle key="now" className="ms-tl__now" cx={X(end)} cy={y} r={7} aria-hidden="true" />);
    if (p.ghost) hopArcs(live, p.ghost.hops).forEach(([a, b], i) => out.push(<path key={`g${i}`} className="ms-tl__ghost" d={arcPath(a, b, 10)} aria-hidden="true" />));
  }

  /* marks: a triangle on the line, its time (and label) above the arcs, a hairline between */
  (m.marks ?? []).forEach((mk, i) => {
    const x = X(mk.at);
    const time = r.duration ? durationText(mk.at, naturalUnits(mk.at), locale, true) : clockText(mk.at, m.labels === '24h' ? '24' : '12', notation, locale, true);
    out.push(
      <g key={`k${i}`} className="ms-tl__mark-group" data-tone={mk.tone}>
        <path className={`ms-tl__mark ms-tl__mark--${mk.tone}`} d={`M${x} ${y - 4}l-7 -13h14Z`} />
        {markTime + 8 < y - 17 - above24 && <line className="ms-tl__mark-lead" x1={x} x2={x} y1={markTime + 8} y2={y - 17 - (above24 ? above24 - 4 : 0)} />}
        <text className="ms-tl__mark-time" x={x} y={markTime} textAnchor="middle">
          {time}
        </text>
        {mk.label && (
          <text className="ms-tl__mark-label" x={x} y={markTime - 20} textAnchor="middle">
            {tx(mk.label, locale)}
          </text>
        )}
      </g>,
    );
  });

  /* the clock beside the line */
  if (m.clock) {
    const now = timelineNow(m, p.task, p.state);
    const cb: Rect = { x: box.x + 8, y: box.y + (box.h - clockSide) / 2, w: clockSide, h: clockSide };
    out.push(
      <ClockModel key="clock" box={cb} model={{ kind: 'clock', time: now, face: 'clock', numerals: true, ticks: 'minutes', ampm: m.labels === '24h' ? undefined : 'show' }} time={now} locale={locale} label="" defs={p.defs} move={p.move === 'jump' || live ? 'sweep' : null} />,
    );
  }

  return (
    <g className="ms-tl" role="img" aria-label={p.label} data-move={p.move ?? undefined}>
      {under}
      {out}
    </g>
  );
}

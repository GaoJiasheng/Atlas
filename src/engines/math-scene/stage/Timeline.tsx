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
 * show the time at its last mark (above the line on a phone, where the two
 * would not fit side by side).
 *
 * On a `duration` check the child jumps with the tray's chips: each run of
 * jumps is a signal arc from the time known, the point reached is a signal
 * ring, and the clock beside the line (with `clock: true`) follows it. "Show
 * me" draws the solution's jumps dashed.
 */
import { timelineNow } from './timeline-now';
import { useContext, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import { NotationContext } from '../../../lib/rich-text';
import type { BeatMove, Task, TimelineSpec } from '../schema';
import type { TaskState } from '../lib/state';
import { solvedState } from '../lib/solve';
import { hopArcs, hopEnd, hopStart, hourMarks, jumpLabel, labelEvery, minorMarks, minorOf, markRows, placeJumpLabels, rangeOf, type LabelBox } from '../lib/timeline';
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
/** The clock above the line: the gap under it, and the smallest it is still worth drawing. */
const CLOCK_GAP = 14;
const CLOCK_MIN = 84;
/** The highest a jump's arc rises on a short stage. */
const TIGHT_ARC = 18;
/** The most a tight drawing raises its marks' times when it has height to spare. */
const TIGHT_LIFT = 16;
/** About how wide a text is: `perChar` for Latin and digits, a full square for a Chinese character. */
const textWidth = (s: string, perChar: number) => [...s].reduce((n, c) => n + (c.charCodeAt(0) > 0x2e7f ? 13.5 : perChar), 0);

export function Timeline(p: TimelineProps) {
  const m = p.model;
  const notation = useContext(NotationContext);
  const { box, locale } = p;
  const r = rangeOf(m);
  // The clock beside the line when there is room for both; otherwise above it (below).
  const clockSide = m.clock && box.w >= 560 ? Math.floor(clamp(Math.min(box.h * 0.62, box.w * 0.3), 90, 340)) : 0;
  const both = m.labels === 'both' && !r.duration;
  const out: ReactNode[] = [];
  const under: ReactNode[] = [];
  const live = p.task?.kind === 'duration' && p.state ? p.task : null;
  const hours = hourMarks(r);
  const hourHalf = r.duration ? 14 : m.labels === '24h' || both ? 22 : 12;
  const twoLine = !r.duration && m.labels !== '24h';
  const drawnArcs = [...(m.jumps ?? []), ...(live && p.state ? hopArcs(live, p.state.hops) : [])];
  // A duration check keeps room for the jumps that solve it from the start, so the drawing neither moves nor goes when the child
  // jumps (nor when "Show me" draws them).
  const solvedArcs = live ? [...(m.jumps ?? []), ...hopArcs(live, solvedState(live).hops)] : [];

  // Above the line, bottom up: the 24-hour labels (both), the arcs, then the marks' labels, then the bands' names.
  const above24 = both ? 30 : 0;
  const hasMarks = (m.marks?.length ?? 0) > 0;
  const markTimeText = (at: number) => (r.duration ? durationText(at, naturalUnits(at), locale, true) : clockText(at, m.labels === '24h' ? '24' : '12', notation, locale, true));
  const bandRoom = m.bands === 'ampm' ? 24 : 0;
  // Noon or midnight on the line: its name under the morning and afternoon bands (y + 64), below the hour labels.
  const edgeBelow = m.bands === 'ampm' && !r.duration && [0, 12 * HOUR, DAY].some((at) => at >= r.from && at <= r.to) ? 68 : 0;
  const edgeName = (at: number) => (at === 12 * HOUR ? t(locale, 'math.timeline.noon') : at === 0 || at === DAY ? t(locale, 'math.timeline.midnight') : null);
  /**
   * The drawing laid out in this box. `tight` (a short stage, as above a phone's docked tray, where the full drawing does not fit):
   * a longer line (the jumps' labels stack less), lower arcs, the marks' times without their words (the prompt says what they
   * are), less margin above them and under one-line hour labels.
   */
  const plan = (tight: boolean) => {
    const left = box.x + (clockSide ? clockSide + 48 : tight ? 26 : 50);
    const right = box.x + box.w - (tight ? 26 : 40);
    const width = clockSide ? right - left : Math.min(right - left, 1300);
    const x0 = clockSide ? left : box.x + (box.w - width) / 2;
    const X = (t: number) => x0 + ((t - r.from) / Math.max(1, r.to - r.from)) * width;
    const every = labelEvery(r, width, m.labels === '12h' ? 40 : 58);
    const everyOther = hours.filter((t) => ((t - (hours[0] ?? 0)) / HOUR) % every === 0);
    // Tight, noon and midnight are named in their own hour labels (not under the bands): always labelled, a neighbour too close
    // to them unlabelled.
    const edges = tight && twoLine && edgeBelow ? hours.filter((t) => t % (12 * HOUR) === 0) : [];
    const half = (t: number) => (edges.includes(t) ? Math.max(hourHalf, textWidth(edgeName(t) ?? '', 6.6) / 2 + 2) : hourHalf);
    const labelledHours = edges.length ? [...new Set([...everyOther.filter((t) => edges.every((e) => t === e || Math.abs(X(t) - X(e)) > hourHalf + half(e) + 8)), ...edges])].sort((a, b) => a - b) : everyOther;
    /* The jumps' labels, clear of the hour labels and of each other. */
    const hourBoxes: LabelBox[] = labelledHours.flatMap((t) => [
      { x0: X(t) - half(t), x1: X(t) + half(t), y0: 18, y1: twoLine ? 48 : 34 },
      ...(both ? [{ x0: X(t) - 22, x1: X(t) + 22, y0: -32, y1: -18 }] : []),
    ]);
    const arcMax = tight ? TIGHT_ARC : clamp(box.h * (m.clock && !clockSide ? 0.12 : 0.22), 24, 64);
    const arcH = (a: number, b: number) => clamp(Math.abs(X(b) - X(a)) * 0.45, tight ? 10 : 14, arcMax);
    const shape = ([a, b]: [number, number]) => ({ x0: X(a), x1: X(b), rise: arcH(a, b), back: b < a, width: jumpLabel(a, b).length * 7.8 });
    const labelY = placeJumpLabels(drawnArcs.map(shape), hourBoxes);
    const solvedY = placeJumpLabels(solvedArcs.map(shape), hourBoxes);
    const up = (arcs: [number, number][], ys: number[]) => Math.max(0, ...ys.map((v, i) => (arcs[i]![1] > arcs[i]![0] ? -v : 0)));
    const down = (arcs: [number, number][], ys: number[]) => Math.max(0, ...ys.map((v, i) => (arcs[i]![1] < arcs[i]![0] ? v + 8 : 0)));
    const forward = [...drawnArcs, ...solvedArcs].filter(([a, b]) => b > a);
    const highestLabel = Math.max(up(drawnArcs, labelY), up(solvedArcs, solvedY));
    const maxUp = forward.length ? Math.max(Math.max(...forward.map(([a, b]) => arcH(a, b))) + (tight ? 14 : 22), highestLabel + (tight ? 4 : 12)) : 0;
    const worded = !tight && (m.marks ?? []).some((k) => k.label);
    const rowOfMark = markRows((m.marks ?? []).map((k) => ({ x: X(k.at), width: Math.max(textWidth(markTimeText(k.at), 9.6), worded && k.label ? textWidth(tx(k.label, locale), 7) : 0) })));
    const markRowH = worded ? 42 : 22;
    const markOff = above24 + Math.max(maxUp, tight ? 20 : 26) + (tight ? 8 : 12);
    // Tight, the morning and afternoon bands keep their shading but not their names (the hour labels say am, noon and pm): only
    // the band's top edge stands above the drawing.
    const bandEdge = tight && m.bands === 'ampm' && !r.duration ? 6 : 0;
    const topOff = (hasMarks ? markOff + Math.max(0, ...rowOfMark) * markRowH + (worded ? 22 : 0) + (tight ? 12 : 18) : above24 + maxUp + 12) + bandEdge;
    // Below the line: the hour labels, or further when an arc going back has pushed its label past them.
    const below = Math.max(tight ? (twoLine ? 50 : 40) : 56, edges.length ? 0 : edgeBelow, down(drawnArcs, labelY), down(solvedArcs, solvedY));
    // On a narrow stage the clock goes above the line, as large as the height left allows; with too little left, the line alone.
    const spare = m.clock && !clockSide ? Math.floor(Math.min(box.h - topOff - below - bandRoom - CLOCK_GAP, box.w * 0.62, 240)) : 0;
    const clockAbove = spare >= CLOCK_MIN ? spare : 0;
    const drop = clockAbove ? clockAbove + CLOCK_GAP + bandRoom : 0;
    // Tight with a little height to spare (and no clock to take it): the marks' times stand further above the jumps' labels.
    const lift = tight && hasMarks && !drop ? clamp(box.h - topOff - below, 0, TIGHT_LIFT) : 0;
    return { edgeInLabel: edges.length > 0, bandNames: !bandEdge, X, x0, width, labelledHours, arcH, labelY, worded, rowOfMark, markRowH, markOff: markOff + lift, topOff: topOff + lift, below, clockAbove, drop, need: Math.max(drop + topOff + below, clockSide) };
  };
  const full = plan(false);
  const { edgeInLabel, bandNames, X, x0, width, labelledHours, arcH, labelY, worded, rowOfMark, markRowH, markOff, topOff, below, clockAbove, drop, need } = box.h >= full.need ? full : plan(true);
  // Whole or not at all, as every model under its minimum (Stage.tsx): a line with no room for its labels is not drawn half
  // under the docked tray.
  if (box.h < need) return null;
  // The whole drawing (labels above, hour labels and arcs back below) centred in what is left, the line where that puts it.
  const y = Math.round(box.y + drop + Math.max(topOff, (box.h - drop - topOff - below) / 2 + topOff));
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
          {bandNames && (
            <text className="ms-tl__band-name" x={(X(a) + X(b)) / 2} y={bandTop - 8} textAnchor="middle">
              {`${ampmText(key === 'pm', notation).toLocaleUpperCase('en')} · ${t(locale, name)}`}
            </text>
          )}
        </g>,
      );
    }
    // Tight, noon or midnight is named in its hour label instead of under the bands.
    for (const at of [0, 12 * HOUR, DAY])
      if (at >= r.from && at <= r.to)
        under.push(
          <g key={`edge${at}`} className="ms-tl__edge">
            {/* Above the labels on the line only (they stay readable), and under the hour labels to the band's foot. */}
            <line x1={X(at)} x2={X(at)} y1={bandTop - 2} y2={y - 12 - above24} />
            {!edgeInLabel && <line x1={X(at)} x2={X(at)} y1={y + 48} y2={bandTop + bandH} />}
            {!edgeInLabel && (
              <text x={X(at)} y={bandTop + bandH + 14} textAnchor="middle">
                {edgeName(at)}
              </text>
            )}
          </g>,
        );
  }

  /* the rule, its minor and hour marks */
  out.push(<line key="axis" className="ms-line__axis" x1={x0 - 10} x2={x0 + width + 10} y1={y} y2={y} />);
  for (const t of minorMarks(r, minorOf(m))) out.push(<line key={`n${t}`} className="ms-line__minor" x1={X(t)} x2={X(t)} y1={y - 6} y2={y + 6} />);
  const hourLabel = (t: number, mode: '12' | '24'): ReactNode => {
    if (r.duration) return `${t / HOUR === 0 ? '0' : `${t / HOUR} h`}`;
    if (mode === '24') return t === DAY ? clockText(0, '24', notation).replace(/^00/, '24') : clockText(t, '24', notation);
    const parts = clockParts(t === DAY ? 0 : t);
    const edgeWord = edgeInLabel ? edgeName(t) : null;
    return (
      <>
        <tspan>{parts.h12}</tspan>
        <tspan className="ms-tl__ampm" x={X(t)} dy="1.15em">
          {edgeWord ?? ampmText(t !== DAY && parts.pm, notation)}
        </tspan>
      </>
    );
  };
  for (const t of hours) {
    const labelled = labelledHours.includes(t);
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
  let drawn = 0;
  const arc = (key: string, a: number, b: number, cls: string, delay: number, landed = true) => {
    const baseline = labelY[drawn++]!;
    out.push(
      <g key={key} className={`ms-tl__jump ${cls}`} style={{ animationDelay: `${delay}ms` }} aria-hidden="true">
        <path d={arcPath(a, b)} />
        <text x={(X(a) + X(b)) / 2} y={y + baseline} textAnchor="middle">
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
    const time = markTimeText(mk.at);
    const textY = markTime - rowOfMark[i]! * markRowH;
    out.push(
      <g key={`k${i}`} className="ms-tl__mark-group" data-tone={mk.tone}>
        <path className={`ms-tl__mark ms-tl__mark--${mk.tone}`} d={`M${x} ${y - 4}l-7 -13h14Z`} />
        {textY + 8 < y - 17 - above24 && <line className="ms-tl__mark-lead" x1={x} x2={x} y1={textY + 8} y2={y - 17 - (above24 ? above24 - 4 : 0)} />}
        <text className="ms-tl__mark-time" x={x} y={textY} textAnchor="middle">
          {time}
        </text>
        {mk.label && worded && (
          <text className="ms-tl__mark-label" x={x} y={textY - 20} textAnchor="middle">
            {tx(mk.label, locale)}
          </text>
        )}
      </g>,
    );
  });

  /* the clock beside the line, or above it */
  if (clockSide || clockAbove) {
    const now = timelineNow(m, p.task, p.state);
    const cb: Rect = clockSide ? { x: box.x + 8, y: box.y + (box.h - clockSide) / 2, w: clockSide, h: clockSide } : { x: box.x + (box.w - clockAbove) / 2, y: box.y, w: clockAbove, h: clockAbove };
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

export { timelineNow } from './timeline-now';

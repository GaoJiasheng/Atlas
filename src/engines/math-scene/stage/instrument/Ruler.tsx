/**
 * A ruler and a tape (docs/32 §3.2): one straight scale in its look — a
 * school ruler (a pale strip, its 0 mark `inset` in from the end, its left
 * end broken off when `broken`), a measuring tape (a strip with a hook at 0),
 * a metre rule (a wooden strip with end caps), a height chart standing up
 * with a sliding head board, a path with a post at every mark (the numbered
 * ones taller). On it: a thing laid end to end (two hairlines drop from its
 * ends to the marks), a line drawn from its start, an arrow; a second scale
 * of the small unit's totals along the other edge (`dual`), brackets, break
 * lines over a skipped stretch. The child's line end or arrow is a slider.
 */
import type { ReactNode } from 'react';
import type { Locale } from '../../../core/types';
import type { InstrumentSpec } from '../../schema';
import type { Scale } from '../../lib/instrument';
import { DoorGlyph, LengthGlyph } from '../glyphs/measure';
import { Brackets } from './Brackets';
import { straightTrack, type StraightFrame, type Track } from './geometry';
import { Handle } from './Handle';
import { CountArcs, Marks, SkipBreaks } from './Scale';

export interface StraightProps {
  s: InstrumentSpec;
  sc: Scale;
  f: StraightFrame;
  defs: string;
  locale: Locale;
  /** The line's end or the arrow, as drawn now (the child's on a set-scale). */
  line?: { from: number; to: number } | null;
  arrow?: number | null;
  head?: number | null;
  /** "Show me": the target dashed. */
  ghost?: number | null;
  /** Parts counted (arcs): the overlay's, or the child's. */
  counted?: number[];
  /** The child moves the line's end or the arrow. */
  handle?: { value: number; min: number; label: string; valueText: string; onSet(v: number): void } | null;
  /** Drawn over the scale (the parts as buttons). */
  children?: ReactNode;
  /** A `slide` beat: the thing moves along to its new place (ms); counting arcs drawn one after the other (`jump`). */
  slideMs?: number;
  stagger?: boolean;
}

/** The track of the second scale (`dual`): the same marks along the far edge, pointing back in. */
export function dualTrack(s: InstrumentSpec, sc: Scale, f: StraightFrame): Track {
  const len = Math.hypot(f.track.at(sc.to).x - f.track.at(sc.from).x, f.track.at(sc.to).y - f.track.at(sc.from).y);
  const p0 = f.track.at(sc.from);
  if (f.vertical) return straightTrack(s, sc, { x: f.body.x + f.body.w, y: p0.y }, { x: 0, y: -1 }, len, { x: -1, y: 0 }, f.track.marks.major * 0.8);
  return straightTrack(s, sc, { x: p0.x, y: f.body.y + f.body.h }, { x: 1, y: 0 }, len, { x: 0, y: -1 }, f.track.marks.major * 0.8);
}

/** Count on a vertical chart's free edge, clear of its person and both number columns. */
export function countingTrack(f: StraightFrame): Track {
  if (!f.vertical) return f.track;
  return {
    ...f.track,
    at: (v) => ({ ...f.track.at(v), x: f.body.x + f.body.w + 2, nx: -1, ny: 0 }),
  };
}

function Body({ s, f }: { s: InstrumentSpec; f: StraightFrame }) {
  const { x, y, w, h } = f.body;
  const look = s.look ?? (s.type === 'ruler' ? 'ruler' : 'tape');
  if (look === 'path') {
    return (
      <g className="ms-inst__road" aria-hidden="true">
        <rect x={x} y={y} width={w} height={h} />
        <line x1={x} x2={x + w} y1={y + h / 2} y2={y + h / 2} strokeDasharray="10 8" />
      </g>
    );
  }
  if (s.broken && !f.vertical) {
    // The left end broken off: a jagged edge.
    const n = 5;
    const jag = Array.from({ length: n + 1 }, (_, i) => `${x + (i % 2 ? 7 : 0)} ${y + (i * h) / n}`).join('L');
    return <path className="ms-inst__body" data-look={look} d={`M${jag}L${x + w} ${y + h}V${y}Z`} />;
  }
  return (
    <g aria-hidden="true">
      <rect className="ms-inst__body" data-look={look} x={x} y={y} width={w} height={h} rx={look === 'ruler' ? 3 : 1} />
      {look === 'tape' && !f.vertical && <path className="ms-inst__hook" d={`M${x} ${y - 8}V${y + h * 0.3}h-7V${y - 8}Z`} />}
      {look === 'metre-rule' && !f.vertical && <path className="ms-inst__cap" d={`M${x} ${y}h6v${h}h-6ZM${x + w - 6} ${y}h6v${h}h-6Z`} />}
      {/* The floor either side of the strip (not across it: the 0 there stays clear). */}
      {look === 'height-chart' && f.vertical && f.floor !== null && <path className="ms-inst__wall" d={`M${f.thing.x - 10} ${f.floor}H${x}M${x + w} ${f.floor}h40`} />}
    </g>
  );
}

export function StraightInstrument(p: StraightProps) {
  const { s, sc, f } = p;
  const T = f.track;
  const at = (v: number) => T.at(v);
  const thing = s.object;
  const out: ReactNode[] = [];

  /* the thing laid on the scale */
  if (thing) {
    const a = at(thing.from.units);
    const b = at(thing.to.units);
    if (!f.vertical) {
      // Drawn from 0 and moved into place, so a `slide` beat moves it along the scale.
      const y = f.thing.y + f.thing.h;
      const w = b.x - a.x;
      out.push(
        <g key={`thing-${thing.kind}`} className="ms-inst__thing" style={{ transform: `translateX(${a.x}px)`, transitionDuration: `${p.slideMs ?? 0}ms` }}>
          <LengthGlyph kind={thing.kind} x0={0} x1={w} y={y} h={f.thing.h} tone={thing.tone} />
          <line className="ms-inst__drop" x1={0} x2={0} y1={y - f.thing.h * 0.2} y2={a.y} />
          <line className="ms-inst__drop" x1={w} x2={w} y1={y - f.thing.h * 0.2} y2={b.y} />
        </g>,
      );
    } else {
      const w = Math.min(f.thing.w * 0.5, 90);
      const x = f.body.x - w - 18;
      out.push(
        <g key="thing" className="ms-inst__thing">
          {thing.kind === 'door' ? <DoorGlyph x={x} y={a.y} top={b.y} w={w} tone={thing.tone === 'hot' ? 'hot' : 'cold'} /> : <rect className={`ms-glyph ms-glyph--${thing.tone}`} x={x + w * 0.3} y={b.y} width={w * 0.4} height={a.y - b.y} />}
          <line className="ms-inst__drop" x1={x + w} x2={b.x} y1={b.y} y2={b.y} />
        </g>,
      );
    }
  }

  /* a line drawn along the scale */
  const line = p.line ?? null;
  if (line && line.to > line.from) {
    const a = at(line.from);
    const b = at(line.to);
    const y = f.vertical ? 0 : f.body.y - 9;
    out.push(<line key="line" className="ms-inst__line" data-tone={s.line?.tone ?? 'signal'} x1={a.x} x2={b.x} y1={f.vertical ? a.y : y} y2={f.vertical ? b.y : y} />);
  }

  /* an arrow (a tape) or the head board (a height chart) */
  const arrow = (v: number, cls: string, key: string) => {
    const q = at(v);
    if (f.vertical) return <path key={key} className={cls} d={`M${q.x - 2} ${q.y}l-16 -9v18Z`} />;
    // A path's posts stand up from the road: its arrow points up from under the road.
    if (s.look === 'path') {
      const y = f.body.y + f.body.h + 4;
      return <path key={key} className={cls} d={`M${q.x} ${y}l-9 16h18Z M${q.x} ${y + 16}v16`} />;
    }
    const y = f.body.y - 4;
    return <path key={key} className={cls} d={`M${q.x} ${y}l-9 -16h18Z M${q.x} ${y - 16}v-16`} />;
  };
  if (p.arrow !== null && p.arrow !== undefined) out.push(arrow(p.arrow, 'ms-inst__arrow', 'arrow'));
  if (p.head !== null && p.head !== undefined) {
    const q = at(p.head);
    const r = f.personRadius;
    const hx = f.body.x - 26 - r;
    const top = q.y + 4;
    // A cropped chart cuts the torso below its lowest mark, after the whole
    // head and shoulders. The full-height chart still meets its floor.
    const cropped = sc.from > 0;
    const bottom = at(sc.from).y;
    const feet = cropped ? Math.max(bottom, top + r * 3.6) : bottom;
    const hem = cropped ? `L${hx + r * 0.65} ${feet}l${-r * 0.35} -4l${-r * 0.6} 8l${-r * 0.35} -4H${hx - r * 1.9}` : '';
    out.push(
      <g key="head" className="ms-inst__head">
        <circle className="ms-inst__person" cx={hx} cy={top + r} r={r} />
        <path className="ms-inst__person" data-cropped={cropped || undefined} d={`M${hx - r * 1.9} ${feet}V${top + r * 3.2}Q${hx - r * 1.8} ${top + r * 2.2} ${hx} ${top + r * 2.2}Q${hx + r * 1.8} ${top + r * 2.2} ${hx + r * 1.9} ${top + r * 3.2}V${feet}${hem}Z`} />
        <rect className="ms-inst__board" x={hx - r - 8} y={q.y - 4} width={f.body.x - (hx - r - 8)} height={8} />
      </g>,
    );
  }
  if (p.ghost !== null && p.ghost !== undefined) {
    if (s.line || (!s.arrow && !s.head)) {
      const a = at(line?.from ?? sc.from);
      const b = at(p.ghost);
      out.push(<line key="ghost" className="ms-inst__ghost" x1={a.x} x2={b.x} y1={f.body.y - 9} y2={f.body.y - 9} />);
    } else out.push(arrow(p.ghost, 'ms-inst__ghost-arrow', 'ghost'));
  }

  const marksSide = f.track.marks.major;
  return (
    <g className="ms-inst ms-inst--straight" data-vertical={f.vertical || undefined}>
      <Body s={s} f={f} />
      <Marks s={s} sc={sc} track={T} gap={6} />
      {s.dual && <Marks s={s} sc={sc} track={dualTrack(s, sc, f)} gap={4} totals className="ms-inst__marks ms-inst__marks--dual" />}
      <SkipBreaks s={s} track={T} depth={f.vertical ? f.body.w : f.body.h} />
      {p.counted && <CountArcs sc={sc} track={countingTrack(f)} parts={p.counted} stagger={p.stagger} />}
      {out}
      <Brackets s={s} track={T} offset={f.vertical ? f.body.w + 18 + (p.counted ? 50 : 0) : f.body.h + (s.dual ? 26 : 16)} defs={p.defs} locale={p.locale} />
      {p.children}
      {p.handle && (
        <Handle
          track={T}
          value={p.handle.value}
          min={p.handle.min}
          max={sc.to}
          minor={sc.minor}
          major={sc.major}
          label={p.handle.label}
          valueText={p.handle.valueText}
          onSet={p.handle.onSet}
          hit={f.vertical ? { x: at(p.handle.value).x - 24, y: at(p.handle.value).y - 22, w: 48, h: 44 } : { x: at(p.handle.value).x - 22, y: f.body.y - 40, w: 44, h: 44 + marksSide }}
        >
          <circle className="ms-inst__grip" cx={at(p.handle.value).x - (f.vertical ? 12 : 0)} cy={f.vertical ? at(p.handle.value).y : f.body.y - 9} r={8} />
        </Handle>
      )}
    </g>
  );
}


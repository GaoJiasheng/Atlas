/**
 * A dial scale (docs/32 §3.2): a number line bent into a circle — 0 at the
 * top, clockwise, full scale short of 0 so the two never meet — with its pan
 * above (what is weighed sits on it), its unit printed large on the face, a
 * needle from the centre (the child's in signal, "Show me" dashed). `t`
 * straightens it (the `unroll`, and the straightened view): every mark moves
 * on its own path to the same mark on a straight line, numbers with it, the
 * face fading out and the line in; 0 and 1 are exact.
 */
import type { ReactNode } from 'react';
import type { InstrumentSpec } from '../../schema';
import { dialAngle, rimPoint, type Scale } from '../../lib/instrument';
import { unitText, type Unit } from '../../lib/value';
import { LoadGlyph, loadAspect } from '../glyphs/measure';
import { blendTrack, type DialFrame } from './geometry';
import { Handle } from './Handle';
import { CountArcs, Marks } from './Scale';

export interface DialProps {
  s: InstrumentSpec;
  sc: Scale;
  f: DialFrame;
  unit: Unit;
  /** The needle (the child's on a set-scale). */
  value: number;
  mine?: boolean;
  ghost?: number | null;
  counted?: number[];
  stagger?: boolean;
  /** 0: the dial · 1: straightened. */
  t: number;
  /** The needle's turn to a new value (a `sweep` beat), ms. */
  sweepMs?: number;
  handle?: { label: string; valueText: string; onSet(v: number): void } | null;
  children?: ReactNode;
}

export function DialInstrument(p: DialProps) {
  const { s, sc, f, t } = p;
  const track = blendTrack(f.track, f.line, t);
  const { c, r } = f;
  const face = 1 - t;
  // The needle turns by transform (a `sweep` is its transition, in value order, never the short way round).
  const needle = (v: number, cls: string, key: string) => (
    <g key={key} transform={`translate(${c.x} ${c.y})`}>
      <g className="ms-inst__turn" style={{ transform: `rotate(${dialAngle(s, sc, v)}deg)`, transitionDuration: `${p.sweepMs ?? 0}ms` }}>
        <line className={cls} x1={0} y1={r * 0.14} x2={0} y2={-r * 0.8} />
      </g>
    </g>
  );
  const pointer = (v: number, cls: string, key: string) => {
    const q = f.line.at(v);
    return <path key={key} className={cls} d={`M${q.x} ${q.y - 4}l-8 -15h16Z`} />;
  };
  const load = s.load;
  const lw = Math.min(f.pan.w * 0.7, f.pan.h * 0.9 * (load ? loadAspect(load) : 1));
  const lh = load ? Math.min(f.pan.h * 0.78, lw / loadAspect(load)) : 0;
  const panY = f.pan.y + f.pan.h * 0.86;
  return (
    <g className="ms-inst ms-inst--dial">
      {face > 0 && (
      <g className="ms-inst__face" style={{ opacity: face }} aria-hidden="true">
        <line className="ms-inst__stem" x1={c.x} x2={c.x} y1={panY} y2={c.y - r} />
        <path className="ms-inst__pan" d={`M${f.pan.x} ${panY}h${f.pan.w}l-${f.pan.w * 0.08} ${f.pan.h * 0.1}h-${f.pan.w * 0.84}Z`} />
        {load && f.pan.h > 30 && <LoadGlyph kind={load} box={{ x: c.x - lw / 2, y: panY - lh, w: lw, h: lh }} tone={s.tone === 'hot' ? 'hot' : 'cold'} />}
        <circle className="ms-inst__dial" cx={c.x} cy={c.y} r={r} />
        <circle className="ms-inst__rim" cx={c.x} cy={c.y} r={r * 0.94} />
      </g>
      )}
      {t < 0.5 ? (
        <g style={{ opacity: 1 - 2 * t }}>
          {p.ghost !== null && p.ghost !== undefined && needle(p.ghost, 'ms-inst__needle ms-inst__needle--ghost', 'ghost')}
          {needle(p.value, p.mine ? 'ms-inst__needle ms-inst__needle--mine' : 'ms-inst__needle', 'needle')}
          <circle className="ms-inst__hub" cx={c.x} cy={c.y} r={Math.max(4, r * 0.045)} />
        </g>
      ) : (
        <g style={{ opacity: 2 * t - 1 }}>
          {p.ghost !== null && p.ghost !== undefined && pointer(p.ghost, 'ms-inst__ghost-arrow', 'ghost')}
          {pointer(p.value, p.mine ? 'ms-inst__arrow ms-inst__arrow--mine' : 'ms-inst__arrow', 'pointer')}
        </g>
      )}
      {t > 0 && <line className="ms-inst__axis" style={{ opacity: t }} x1={f.line.at(sc.from).x - 10} x2={f.line.at(sc.to).x + 10} y1={f.lineRect.y} y2={f.lineRect.y} />}
      <Marks s={s} sc={sc} track={track} gap={t > 0.5 ? 6 : 4} />
      {p.counted && <CountArcs sc={sc} track={track} parts={p.counted} stagger={p.stagger} lift={(1 - t) * (r * 0.06 + 3) + 2} />}
      {face > 0 && (
        <text className="ms-inst__unit" style={{ opacity: face }} x={c.x} y={c.y + r * 0.42} textAnchor="middle" dominantBaseline="central" fontSize={Math.max(16, r * 0.17)} aria-hidden="true">
          {unitText(p.unit, 'en')}
        </text>
      )}
      {p.children}
      {p.handle && (
        <Handle
          track={t >= 0.5 ? f.line : f.track}
          value={p.value}
          min={sc.from}
          max={sc.to}
          minor={sc.minor}
          major={sc.major}
          label={p.handle.label}
          valueText={p.handle.valueText}
          onSet={p.handle.onSet}
          hit={t >= 0.5 ? { x: f.line.at(p.value).x - 22, y: f.lineRect.y - 44, w: 44, h: 50 } : { cx: c.x, cy: c.y, r: r * 0.86 }}
        >
          {t < 0.5 && <circle className="ms-inst__grip" cx={rimPoint(c.x, c.y, r * 0.8, dialAngle(s, sc, p.value)).x} cy={rimPoint(c.x, c.y, r * 0.8, dialAngle(s, sc, p.value)).y} r={8} />}
        </Handle>
      )}
    </g>
  );
}

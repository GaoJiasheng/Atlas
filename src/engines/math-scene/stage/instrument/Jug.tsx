/**
 * A measuring jug (docs/32 §3.2): the container's outline by `shape` (a
 * beaker with a lip, a cup with a handle, a big jug, a pail; a bottle and a
 * bowl only to compare by looking, `scale: false`), the scale up its right
 * side, the liquid a flat level (no meniscus, D10) in the given tone (the
 * child's pour in signal, "Show me" a dashed level), and the eye-level line
 * across at the level with a small eye at its end (`eye`). `t` straightens
 * the scale as for the dial.
 */
import { useId, type ReactNode } from 'react';
import type { InstrumentSpec } from '../../schema';
import type { Scale } from '../../lib/instrument';
import { EyeGlyph } from '../glyphs/measure';
import type { Rect } from '../layout';
import { blendTrack, type JugFrame } from './geometry';
import { Handle } from './Handle';
import { CountArcs, Marks } from './Scale';
import { Brackets } from './Brackets';
import type { Locale } from '../../../core/types';

/** The container's outline in its box. */
export function jugPath(shape: NonNullable<InstrumentSpec['shape']>, b: Rect): string {
  const { x, y, w, h } = b;
  switch (shape) {
    case 'beaker':
      return `M${x - w * 0.06} ${y}L${x} ${y + h * 0.04}V${y + h}H${x + w}V${y}`;
    case 'cup':
    case 'jug':
      return `M${x} ${y}V${y + h}H${x + w}V${y + h * 0.04}L${x + w + w * 0.08} ${y}`;
    case 'pail':
      return `M${x} ${y}L${x + w * 0.08} ${y + h}H${x + w * 0.92}L${x + w} ${y}`;
    case 'bottle': {
      const n = w * 0.32;
      return `M${x + w / 2 - n / 2} ${y}V${y + h * 0.16}Q${x} ${y + h * 0.22} ${x} ${y + h * 0.34}V${y + h}H${x + w}V${y + h * 0.34}Q${x + w} ${y + h * 0.22} ${x + w / 2 + n / 2} ${y + h * 0.16}V${y}`;
    }
    case 'bowl':
      return `M${x} ${y}Q${x + w * 0.04} ${y + h} ${x + w / 2} ${y + h}Q${x + w * 0.96} ${y + h} ${x + w} ${y}`;
    case 'bottle-jug':
      return `M${x + w * 0.3} ${y}V${y + h * 0.1}L${x} ${y + h * 0.2}V${y + h}H${x + w}V${y + h * 0.2}L${x + w * 0.7} ${y + h * 0.1}V${y}`;
  }
}

/** The inside the liquid fills (the outline closed along the top). */
const insidePath = (shape: NonNullable<InstrumentSpec['shape']>, b: Rect) => `${jugPath(shape, b)}Z`;

export interface JugProps {
  s: InstrumentSpec;
  sc: Scale | null;
  f: JugFrame;
  /** The level (the child's on a set-scale). */
  value: number | null;
  mine?: boolean;
  ghost?: number | null;
  counted?: number[];
  stagger?: boolean;
  t: number;
  fillMs?: number;
  defs: string;
  locale: Locale;
  handle?: { label: string; valueText: string; onSet(v: number): void } | null;
  children?: ReactNode;
}

export function JugInstrument(p: JugProps) {
  const { s, sc, f, t } = p;
  const shape = s.shape ?? 'jug';
  const clip = `ms-jug${useId().replace(/[^a-z0-9]/gi, '')}`;
  const b = f.body;
  // A container to compare by looking (no scale) is drawn full of its liquid.
  const level = p.value !== null ? f.levelY(p.value) : s.scale === false && s.liquid ? f.levelY(0) : null;
  const track = f.track && f.line ? blendTrack(f.track, f.line, t) : f.track;
  const face = 1 - t;
  return (
    <g className="ms-inst ms-inst--jug">
      <defs>
        <clipPath id={clip}>
          <path d={insidePath(shape, b)} />
        </clipPath>
      </defs>
      {face > 0 && (
      <g style={{ opacity: face }}>
        {level !== null && (
          <g clipPath={`url(#${clip})`}>
            <rect
              className="ms-inst__liquid"
              data-mine={p.mine || undefined}
              data-tone={s.tone}
              x={b.x - b.w * 0.2}
              y={b.y}
              width={b.w * 1.4}
              height={b.h * 1.2}
              style={{ transform: `translateY(${level - b.y}px)`, transitionDuration: `${p.fillMs ?? 0}ms` }}
            />
          </g>
        )}
        {level !== null && (
          <line className="ms-inst__level" data-mine={p.mine || undefined} x1={b.x} x2={b.x + b.w} y1={b.y} y2={b.y} style={{ transform: `translateY(${level - b.y}px)`, transitionDuration: `${p.fillMs ?? 0}ms` }} />
        )}
        {p.ghost !== null && p.ghost !== undefined && <line className="ms-inst__ghost" x1={b.x} x2={b.x + b.w} y1={f.levelY(p.ghost)} y2={f.levelY(p.ghost)} />}
        <path className="ms-inst__vessel" d={jugPath(shape, b)} />
        {shape === 'cup' && <path className="ms-inst__vessel" d={`M${b.x} ${b.y + b.h * 0.2}h${-b.w * 0.22}v${b.h * 0.42}h${b.w * 0.22}`} />}
        {shape === 'pail' && <path className="ms-inst__vessel" d={`M${b.x} ${b.y}Q${b.x + b.w / 2} ${b.y - b.h * 0.45} ${b.x + b.w} ${b.y}`} />}
        {s.eye && level !== null && (
          <g className="ms-inst__eye">
            <line x1={b.x - 24} x2={b.x + b.w + 120} y1={level} y2={level} />
            <EyeGlyph x={b.x + b.w + 136} y={level} r={8} />
          </g>
        )}
      </g>
      )}
      {t > 0 && sc && f.line && (
        <g style={{ opacity: t }}>
          <line className="ms-inst__axis" x1={f.line.at(sc.from).x - 10} x2={f.line.at(sc.to).x + 10} y1={f.lineRect.y} y2={f.lineRect.y} />
          {p.value !== null && <path className={p.mine ? 'ms-inst__arrow ms-inst__arrow--mine' : 'ms-inst__arrow'} d={`M${f.line.at(p.value).x} ${f.lineRect.y - 4}l-8 -15h16Z`} />}
        </g>
      )}
      {sc && track && <Marks s={s} sc={sc} track={track} gap={5} />}
      {sc && f.track && t === 0 && <Brackets s={s} track={f.track} offset={f.track.marks.major + f.track.font * 3.2 + 18} defs={p.defs} locale={p.locale} />}
      {sc && track && p.counted && <CountArcs sc={sc} track={track} parts={p.counted} stagger={p.stagger} />}
      {p.children}
      {p.handle && sc && f.track && f.line && (
        <Handle
          track={t >= 0.5 ? f.line : f.track}
          value={p.value ?? sc.from}
          min={sc.from}
          max={sc.to}
          minor={sc.minor}
          major={sc.major}
          label={p.handle.label}
          valueText={p.handle.valueText}
          onSet={p.handle.onSet}
          hit={t >= 0.5 ? { x: f.line.at(p.value ?? sc.from).x - 22, y: f.lineRect.y - 44, w: 44, h: 50 } : { x: b.x, y: f.levelY(p.value ?? sc.from) - 22, w: b.w, h: 44 }}
        >
          {t < 0.5 && <circle className="ms-inst__grip" cx={b.x + b.w / 2} cy={f.levelY(p.value ?? sc.from)} r={8} />}
        </Handle>
      )}
    </g>
  );
}

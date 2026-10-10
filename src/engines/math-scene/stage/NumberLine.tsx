/**
 * Number line (docs/15 §4.3): engineering-ruler grammar — whole-number ticks
 * tall and numbered, interval ticks short — with a marker the child places
 * (`role="slider"`: tap the line, drag, ← → one jump, Home / End), an arrow
 * to read, labelled points (order task), the jumps drawn as numbered arcs
 * (tick-counting feedback), an aligned strip above (one whole), and the
 * "Show me" position as a dashed ring.
 */
import { useCallback, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import { fractionWords } from '../lib/words';
import { toMixed } from '../lib/fraction';
import { SvgFrac } from './svg';

export interface LinePoint {
  pos: number;
  label: { n: number; d: number; w?: number };
  tone?: 'cold' | 'hot' | 'mine';
}

export interface NumberLineProps {
  defs: string;
  x: number;
  y: number;
  w: number;
  from: number;
  to: number;
  intervals: number;
  labels: 'ends' | 'wholes' | 'all' | 'none';
  /** Marker position in intervals from `from` (`null` = not placed). */
  marker?: number | null;
  onPlace?(at: number): void;
  arrow?: number | null;
  points?: LinePoint[];
  /** Jumps drawn from 0 to here, numbered (counting jumps, not marks). */
  arcs?: number | null;
  withBar?: boolean;
  ghost?: number | null;
  /** L: every jump labelled with its size (1/n), like the parts of a bar. */
  tickLabels?: boolean;
  label: string;
  locale: Locale;
}

export function NumberLine(p: NumberLineProps) {
  const total = (p.to - p.from) * p.intervals;
  const step = p.w / total;
  const xAt = (pos: number) => p.x + pos * step;
  const interactive = !!p.onPlace;
  const drag = useRef(false);
  const svgPos = useCallback(
    (e: { clientX: number; currentTarget: Element }) => {
      const svg = (e.currentTarget as SVGGraphicsElement).ownerSVGElement;
      const box = svg?.getBoundingClientRect();
      if (!box) return 0;
      return Math.round((e.clientX - box.left - p.x) / step);
    },
    [p.x, step],
  );
  const words = (pos: number) => {
    const f = toMixed({ n: pos + p.from * p.intervals, d: p.intervals });
    return fractionWords(f, p.locale);
  };
  const onKey = (e: KeyboardEvent<SVGGElement>) => {
    if (!p.onPlace) return;
    const at = p.marker ?? 0;
    const go = (v: number) => {
      e.preventDefault();
      p.onPlace!(Math.min(total, Math.max(0, v)));
    };
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') go(at + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') go(at - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(total);
  };
  const down = (e: PointerEvent<SVGElement>) => {
    if (!p.onPlace || e.button !== 0) return;
    e.preventDefault();
    drag.current = true;
    p.onPlace(Math.min(total, Math.max(0, svgPos(e))));
    const target = e.currentTarget;
    const move = (ev: globalThis.PointerEvent) => {
      if (drag.current) p.onPlace!(Math.min(total, Math.max(0, svgPos({ clientX: ev.clientX, currentTarget: target }))));
    };
    const up = () => {
      drag.current = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const whole = (i: number) => i % p.intervals === 0;
  const tickLabel = (i: number) => {
    if (whole(i)) {
      const n = p.from + i / p.intervals;
      return p.labels === 'none' || (p.labels === 'ends' && i !== 0 && i !== total) ? null : <text key={`n${i}`} className="ms-line__num" x={xAt(i)} y={p.y + 30} textAnchor="middle">{n}</text>;
    }
    if (p.labels !== 'all') return null;
    const f = toMixed({ n: i + p.from * p.intervals, d: p.intervals });
    return <SvgFrac key={`f${i}`} cx={xAt(i)} cy={p.y + 26} n={f.n} d={f.d} w={f.w} size={11} className="ms-line__frac" />;
  };
  return (
    <g className="ms-line" role="group" aria-label={p.label}>
      {p.withBar && p.to - p.from === 1 && (
        <g className="ms-line__bar" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <rect key={i} className="ms-part__shape" data-mark={p.marker !== null && p.marker !== undefined && i < p.marker ? 'mine' : undefined} x={xAt(i)} y={p.y - 52} width={step} height={34} />
          ))}
          <rect className="ms-outline" x={p.x} y={p.y - 52} width={p.w} height={34} />
        </g>
      )}
      <line className="ms-line__axis" x1={p.x - 10} x2={p.x + p.w + 10} y1={p.y} y2={p.y} />
      {Array.from({ length: total + 1 }, (_, i) => (
        <g key={i}>
          <line className={whole(i) ? 'ms-line__major' : 'ms-line__minor'} x1={xAt(i)} x2={xAt(i)} y1={p.y - (whole(i) ? 10 : 6)} y2={p.y + (whole(i) ? 10 : 6)} />
          {tickLabel(i)}
        </g>
      ))}
      {p.tickLabels &&
        step >= 26 &&
        Array.from({ length: total }, (_, i) => <SvgFrac key={`u${i}`} cx={xAt(i + 0.5)} cy={p.y + 22} n={1} d={p.intervals} size={10} className="ms-line__frac" />)}
      {p.arcs !== null && p.arcs !== undefined && p.arcs > 0 && (
        <g className="ms-line__arcs" aria-hidden="true">
          {Array.from({ length: p.arcs }, (_, i) => (
            <g key={i}>
              <path d={`M${xAt(i)} ${p.y - 4}Q${xAt(i + 0.5)} ${p.y - 26} ${xAt(i + 1)} ${p.y - 4}`} />
              <text x={xAt(i + 0.5)} y={p.y - 22} textAnchor="middle">{i + 1}</text>
            </g>
          ))}
        </g>
      )}
      {(p.points ?? []).map((pt, i) => (
        <g key={`p${i}`} className="ms-line__point" data-tone={pt.tone}>
          <circle cx={xAt(pt.pos)} cy={p.y} r={6} />
          <SvgFrac cx={xAt(pt.pos)} cy={p.y - 30} n={pt.label.n} d={pt.label.d} w={pt.label.w} size={12} />
        </g>
      ))}
      {p.arrow !== null && p.arrow !== undefined && (
        <g className="ms-line__arrow" aria-label={t(p.locale, 'math.line.arrow')}>
          <path d={`M${xAt(p.arrow)} ${p.y - 8}l-8 -16h16Z`} />
          <line x1={xAt(p.arrow)} x2={xAt(p.arrow)} y1={p.y - 24} y2={p.y - 46} />
        </g>
      )}
      {p.ghost !== null && p.ghost !== undefined && <circle className="ms-ghost__ring" cx={xAt(p.ghost)} cy={p.y} r={13} aria-hidden="true" />}
      {interactive && <rect className="ms-line__hit" x={p.x - 22} y={p.y - 26} width={p.w + 44} height={52} onPointerDown={down} aria-hidden="true" />}
      {interactive && (
        <g
          className="ms-line__marker"
          role="slider"
          tabIndex={0}
          aria-label={t(p.locale, 'math.line.marker')}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={p.marker ?? 0}
          aria-valuetext={p.marker === null || p.marker === undefined ? t(p.locale, 'math.line.unplaced') : words(p.marker)}
          data-keys="arrows"
          data-placed={p.marker !== null && p.marker !== undefined ? '' : undefined}
          onKeyDown={onKey}
          transform={`translate(${xAt(p.marker ?? 0)} ${p.y})`}
        >
          <rect className="ms-line__marker-hit" x={-22} y={-58} width={44} height={60} onPointerDown={down} />
          <path className="ms-line__marker-head" d="M0 -6l-10 -20h20Z" />
          <circle className="ms-line__marker-dot" r={5} />
        </g>
      )}
    </g>
  );
}

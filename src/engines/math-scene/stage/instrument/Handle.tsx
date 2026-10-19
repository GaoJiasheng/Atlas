/**
 * What the child moves on an instrument (docs/32 §3.4 `set-scale`): a line's
 * end, a tape's arrow, a dial's needle, a jug's level. One slider for all of
 * them: drag it (the value under the pointer, snapped to the marks), or the
 * keys — ← → (↑ ↓) one small part, Shift one numbered gap, Home back to the
 * start, End to the scale's end. `aria-valuetext` is the child's own reading.
 * The hit area is at least 44 px.
 */
import { useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import type { Track } from './geometry';

export interface HandleProps {
  track: Track;
  value: number;
  min: number;
  max: number;
  minor: number;
  major: number;
  label: string;
  valueText: string;
  onSet(v: number): void;
  /** The hit area (page coordinates). */
  hit: { x: number; y: number; w: number; h: number } | { cx: number; cy: number; r: number };
  children: ReactNode;
}

export function Handle(p: HandleProps) {
  const drag = useRef(false);
  const set = (v: number) => p.onSet(Math.max(p.min, Math.min(p.max, v)));
  const at = (e: PointerEvent<SVGGElement>) => {
    const svg = (e.currentTarget as SVGGraphicsElement).ownerSVGElement;
    const b = svg?.getBoundingClientRect();
    if (!b) return;
    set(p.track.valueAt({ x: e.clientX - b.left, y: e.clientY - b.top }));
  };
  const key = (e: KeyboardEvent<SVGGElement>) => {
    const step = e.shiftKey ? p.major : p.minor;
    const go = (v: number) => {
      e.preventDefault();
      set(v);
    };
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') go(p.value + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') go(p.value - step);
    else if (e.key === 'PageUp') go(p.value + p.major);
    else if (e.key === 'PageDown') go(p.value - p.major);
    else if (e.key === 'Home') go(p.min);
    else if (e.key === 'End') go(p.max);
  };
  return (
    <g
      className="ms-inst__handle"
      role="slider"
      tabIndex={0}
      data-keys="arrows"
      aria-label={p.label}
      aria-valuemin={p.min / 1_000_000}
      aria-valuemax={p.max / 1_000_000}
      aria-valuenow={p.value / 1_000_000}
      aria-valuetext={p.valueText}
      onKeyDown={key}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        drag.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        (e.currentTarget as SVGGElement).focus({ preventScroll: true });
      }}
      onPointerMove={(e) => {
        if (drag.current) at(e);
      }}
      onPointerUp={(e) => {
        if (drag.current) at(e);
        drag.current = false;
      }}
      onPointerCancel={() => {
        drag.current = false;
      }}
    >
      {'r' in p.hit ? <circle className="ms-inst__hit" cx={p.hit.cx} cy={p.hit.cy} r={Math.max(22, p.hit.r)} /> : <rect className="ms-inst__hit" x={p.hit.x} y={p.hit.y} width={Math.max(44, p.hit.w)} height={Math.max(44, p.hit.h)} />}
      {p.children}
    </g>
  );
}


/**
 * The cut task's whole (docs/15 §2.1 `cut`): an uncut object over a ruler of
 * marks. Tap the object to put a cut at the nearest mark (tap a cut to take
 * it away), drag a cut to move it, or use the cursor (`role="slider"`: ← →
 * move, Enter / Space cuts). After an unequal try the parts show their
 * lengths in marks; "Show me" draws the right cuts dashed.
 */
import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import { segments } from '../lib/check';
import { ObjectDetail, objectPath, type BarObject } from './svg';

export interface CutBarProps {
  defs: string;
  x: number;
  y: number;
  w: number;
  h: number;
  snap: number;
  cuts: number[];
  object?: BarObject;
  onCut?(at: number): void;
  onMove?(from: number, to: number): void;
  measure?: boolean;
  ghost?: number[] | null;
  label: string;
  locale: Locale;
}

export function CutBar(p: CutBarProps) {
  const [cursor, setCursor] = useState(Math.round(p.snap / 2));
  const step = p.w / p.snap;
  const xAt = (g: number) => p.x + g * step;
  const gridOf = (clientX: number, el: Element) => {
    const box = (el as SVGGraphicsElement).ownerSVGElement?.getBoundingClientRect();
    return box ? Math.round((clientX - box.left - p.x) / step) : 0;
  };
  const inside = (g: number) => g > 0 && g < p.snap;
  const tap = (e: PointerEvent<SVGRectElement>) => {
    if (!p.onCut || e.button !== 0) return;
    const g = gridOf(e.clientX, e.currentTarget);
    if (inside(g)) {
      setCursor(g);
      p.onCut(g);
    }
  };
  const grab = (from: number) => (e: PointerEvent<SVGRectElement>) => {
    if (!p.onMove || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    let to = from;
    const move = (ev: globalThis.PointerEvent) => {
      to = gridOf(ev.clientX, el);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      if (to === from) p.onCut?.(from);
      else if (inside(to) && !p.cuts.includes(to)) p.onMove?.(from, to);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const key = (e: KeyboardEvent<SVGGElement>) => {
    const go = (g: number) => {
      e.preventDefault();
      setCursor(Math.min(p.snap - 1, Math.max(1, g)));
    };
    if (e.key === 'ArrowRight') go(cursor + 1);
    else if (e.key === 'ArrowLeft') go(cursor - 1);
    else if (e.key === 'Home') go(1);
    else if (e.key === 'End') go(p.snap - 1);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      p.onCut?.(cursor);
    }
  };
  const segs = segments(p.cuts, p.snap);
  const sorted = [0, ...[...p.cuts].sort((a, b) => a - b)];
  const every = step >= 22 ? 1 : step >= 11 ? 2 : 4;
  return (
    <g className="ms-cut" role="group" aria-label={p.label}>
      <path className="ms-part__shape" d={objectPath(p.object, p.x, p.y, p.w, p.h)} />
      <ObjectDetail object={p.object} x={p.x} y={p.y} w={p.w} h={p.h} parts={0} />
      <path className="ms-outline" d={objectPath(p.object, p.x, p.y, p.w, p.h)} />
      {p.onCut && <rect className="ms-cut__hit" x={p.x} y={p.y} width={p.w} height={p.h} onPointerDown={tap} aria-hidden="true" />}
      <g className="ms-cut__ruler" aria-hidden="true">
        <line x1={p.x} x2={p.x + p.w} y1={p.y + p.h + 10} y2={p.y + p.h + 10} />
        {Array.from({ length: p.snap + 1 }, (_, g) => (
          <g key={g}>
            <line x1={xAt(g)} x2={xAt(g)} y1={p.y + p.h + 10} y2={p.y + p.h + (g % every === 0 ? 18 : 14)} />
            {g % every === 0 && (
              <text x={xAt(g)} y={p.y + p.h + 31} textAnchor="middle">
                {g}
              </text>
            )}
          </g>
        ))}
      </g>
      {p.cuts.map((g) => (
        <g key={g} className="ms-cut__line">
          <line x1={xAt(g)} x2={xAt(g)} y1={p.y - 8} y2={p.y + p.h + 8} />
          {p.onMove && <rect className="ms-cut__grab" x={xAt(g) - 12} y={p.y - 10} width={24} height={p.h + 20} onPointerDown={grab(g)} aria-hidden="true" />}
        </g>
      ))}
      {p.measure &&
        segs.map((len, i) => (
          <text key={`m${i}`} className="ms-cut__measure" x={xAt(sorted[i]! + len / 2)} y={p.y - 14} textAnchor="middle">
            {len}
          </text>
        ))}
      {p.ghost?.map((g) => <line key={`g${g}`} className="ms-ghost__cut ms-ghost__cut--strong" x1={xAt(g)} x2={xAt(g)} y1={p.y - 12} y2={p.y + p.h + 12} aria-hidden="true" />)}
      {p.onCut && (
        <g
          className="ms-cut__cursor"
          role="slider"
          tabIndex={0}
          aria-label={t(p.locale, 'math.cut.cursor')}
          aria-valuemin={1}
          aria-valuemax={p.snap - 1}
          aria-valuenow={cursor}
          aria-valuetext={t(p.locale, 'math.cut.at', { n: cursor, total: p.snap, state: p.cuts.includes(cursor) ? t(p.locale, 'math.cut.here') : '' })}
          data-keys="arrows"
          onKeyDown={key}
          transform={`translate(${xAt(cursor)} ${p.y})`}
        >
          <path className="ms-cut__caret" d="M0 -4l-8 -14h16Z" />
          <line className="ms-cut__guide" x1={0} x2={0} y1={0} y2={p.h} />
        </g>
      )}
    </g>
  );
}

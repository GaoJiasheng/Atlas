/**
 * Shared SVG pieces of the technical-plate models (docs/15 §4.3): hatch
 * patterns, a stacked fraction, a dimension line ("1 whole"), object outlines
 * drawn as orthographic line art (toast, kueh, chocolate, ribbon, prata …),
 * and the pointer + keyboard paths every tappable part shares (tap, drag to
 * paint, roving focus with the arrow keys, Enter / Space).
 */
import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

/** Pattern ids are per stage (several SVGs may share a page: the stage and the HUD thumbnails). */
export function Defs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={`${id}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="7" className="ms-hatch__line" />
      </pattern>
      <pattern id={`${id}-fine`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
        <line x1="0" y1="0" x2="0" y2="5" className="ms-fine__line" />
      </pattern>
      <marker id={`${id}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M0 0.8L7 4L0 7.2" className="ms-arrowhead" />
      </marker>
    </defs>
  );
}

/** A stacked fraction centred on (cx, cy): numerator, bar, denominator (and a whole number to the left). */
export function SvgFrac({ cx, cy, n, d, w, size = 14, className }: { cx: number; cy: number; n: number | string; d: number | string; w?: number; size?: number; className?: string }) {
  const half = Math.max(String(n).length, String(d).length) * size * 0.32 + 2;
  const wx = w ? cx - half - size * 0.45 : 0;
  return (
    <g className={className ? `ms-frac ${className}` : 'ms-frac'} aria-hidden="true">
      {w ? (
        <text x={wx} y={cy + size * 0.36} fontSize={size * 1.2} textAnchor="middle">
          {w}
        </text>
      ) : null}
      <text x={cx} y={cy - size * 0.3} fontSize={size} textAnchor="middle">
        {n}
      </text>
      <line x1={cx - half} x2={cx + half} y1={cy} y2={cy} />
      <text x={cx} y={cy + size * 1.02} fontSize={size} textAnchor="middle">
        {d}
      </text>
    </g>
  );
}

/** Dimension line with arrowheads at both ends and a label above (the engineering "1 whole"). */
export function DimLine({ x1, x2, y, label, defs }: { x1: number; x2: number; y: number; label: string; defs: string }) {
  return (
    <g className="ms-dim" aria-hidden="true">
      <line x1={x1} x2={x1} y1={y - 5} y2={y + 9} />
      <line x1={x2} x2={x2} y1={y - 5} y2={y + 9} />
      <line x1={x1 + 1} x2={x2 - 1} y1={y} y2={y} markerStart={`url(#${defs}-arrow)`} markerEnd={`url(#${defs}-arrow)`} />
      <text x={(x1 + x2) / 2} y={y - 7} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

export type BarObject = 'strip' | 'toast' | 'kueh' | 'chocolate' | 'ribbon' | 'bottle' | 'cake';

/** Clip path of an object seen from above / the side (the parts are drawn inside it). */
export function objectPath(object: BarObject | undefined, x: number, y: number, w: number, h: number): string {
  switch (object) {
    case 'toast': {
      // A slice of bread: a domed crust on top.
      const r = Math.min(h * 0.32, w * 0.12);
      return `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;
    }
    case 'ribbon': {
      const n = Math.min(10, h * 0.3);
      return `M${x} ${y}H${x + w}L${x + w - n} ${y + h / 2}L${x + w} ${y + h}H${x}L${x + n} ${y + h / 2}Z`;
    }
    default:
      return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
  }
}

/** Line-art details drawn over the parts: layers of kueh lapis, the crust of toast, squares of chocolate. */
export function ObjectDetail({ object, x, y, w, h, parts }: { object: BarObject | undefined; x: number; y: number; w: number; h: number; parts: number }) {
  const out: ReactNode[] = [];
  if (object === 'kueh') {
    // Kueh lapis seen from above: thin layer lines across the whole.
    for (let i = 1; i < 7; i++) out.push(<line key={`l${i}`} x1={x} x2={x + w} y1={y + (h * i) / 7} y2={y + (h * i) / 7} className="ms-detail" />);
  } else if (object === 'toast') {
    const inset = Math.min(6, h * 0.08);
    out.push(<path key="crust" d={objectPath('toast', x + inset, y + inset, w - 2 * inset, h - 2 * inset)} className="ms-detail" />);
  } else if (object === 'chocolate' && parts > 0) {
    const pw = w / parts;
    const inset = Math.min(5, pw * 0.12, h * 0.1);
    for (let i = 0; i < parts; i++) out.push(<rect key={`c${i}`} x={x + i * pw + inset} y={y + inset} width={pw - 2 * inset} height={h - 2 * inset} className="ms-detail" />);
  } else if (object === 'cake') {
    out.push(<line key="top" x1={x} x2={x + w} y1={y + h * 0.22} y2={y + h * 0.22} className="ms-detail" />);
  } else if (object === 'bottle') {
    out.push(<line key="neck" x1={x + w * 0.08} x2={x + w * 0.08} y1={y} y2={y + h} className="ms-detail" />);
  }
  return <g aria-hidden="true">{out}</g>;
}

/* ------------------------------------------------------------------ */
/* Tappable parts: tap, drag to paint, roving focus                    */
/* ------------------------------------------------------------------ */

export interface PartsInput {
  count: number;
  marked(i: number): boolean;
  toggle(i: number): void;
  /** Parts that cannot be marked (given parts in an addition). */
  locked?(i: number): boolean;
  enabled: boolean;
}

/**
 * Pointer + keyboard for a row of parts. Returns handlers for the container
 * (drag across parts paints them all the same way) and per-part props
 * (roving tabindex; ← → move between parts, Enter / Space toggles).
 */
export function useParts({ count, marked, toggle, locked, enabled }: PartsInput) {
  const [focus, setFocus] = useState(0);
  const paint = useRef<boolean | null>(null);
  const refs = useRef<(SVGGElement | null)[]>([]);

  const partAt = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)?.closest<SVGGElement>('[data-part]');
    const i = el ? Number(el.dataset.part) : NaN;
    return Number.isInteger(i) ? i : null;
  };
  const end = useCallback(() => {
    paint.current = null;
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
  }, []);

  const container = {
    onPointerMove(e: PointerEvent<SVGGElement>) {
      if (paint.current === null) return;
      const i = partAt(e.clientX, e.clientY);
      if (i !== null && !locked?.(i) && marked(i) !== paint.current) toggle(i);
    },
  };

  // The one part in the tab order (roving tabindex): the remembered one, or the next free part when it is locked (given parts come first in an addition).
  const start = Math.max(0, Math.min(focus, count - 1));
  let stop = -1;
  for (let n = 0; n < count && stop < 0; n++) if (!locked?.((start + n) % count)) stop = (start + n) % count;
  const part = (i: number) => ({
    ref: (el: SVGGElement | null) => {
      refs.current[i] = el;
    },
    'data-part': i,
    role: 'button',
    tabIndex: enabled && !locked?.(i) ? (i === stop ? 0 : -1) : undefined,
    'aria-pressed': marked(i),
    'aria-disabled': !enabled || locked?.(i) ? true : undefined,
    onPointerDown(e: PointerEvent<SVGGElement>) {
      if (!enabled || locked?.(i) || e.button !== 0) return;
      e.preventDefault();
      // Touch captures the pointer to the first element: release it so the drag reaches the other parts.
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
      paint.current = !marked(i);
      setFocus(i);
      toggle(i);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    },
    onKeyDown(e: KeyboardEvent<SVGGElement>) {
      if (!enabled) return;
      // Arrows skip parts that cannot be marked (they are not focusable).
      const move = (to: number, dir: 1 | -1) => {
        e.preventDefault();
        let next = Math.min(count - 1, Math.max(0, to));
        while (next >= 0 && next < count && locked?.(next)) next += dir;
        if (next < 0 || next >= count) return;
        setFocus(next);
        refs.current[next]?.focus();
      };
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') move(i + 1, 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') move(i - 1, -1);
      else if (e.key === 'Home') move(0, 1);
      else if (e.key === 'End') move(count - 1, -1);
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!locked?.(i)) toggle(i);
      }
    },
  });
  return { container, part };
}

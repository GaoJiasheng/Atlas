/**
 * A drawing kept inside its box (a phone's stage above the docked tray): what it paints, measured in the stage's coordinates
 * (clipped parts and invisible hit areas left out), and the scale and shift that bring it inside the box, or nothing when it
 * would have to shrink past legibility (whole or not at all, as every model under its minimum).
 */
import type { Rect } from './layout';

/** The least a drawing is shrunk to fit; any smaller and it is not drawn. */
export const FIT_MIN = 0.75;

const SHAPES = 'circle, ellipse, image, line, path, polygon, polyline, rect, text, use';
const shown = (v: string) => v !== 'none' && v !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(v);

/** The painted extent of what `g` holds, in `g`'s user space (`g` itself untransformed); null when nothing is painted. */
export function paintedBox(g: SVGGraphicsElement): Rect | null {
  const base = g.getCTM()?.inverse();
  if (!base) return null;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const local = (m: DOMMatrix) => base.multiply(m);
  for (const el of g.querySelectorAll<SVGGraphicsElement>(SHAPES)) {
    if (el.closest('clipPath, mask, defs, pattern, marker')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const painted = el instanceof SVGTextElement || el instanceof SVGImageElement || el instanceof SVGUseElement ? shown(cs.fill) || shown(cs.stroke) : (shown(cs.fill) && Number(cs.fillOpacity) > 0) || (shown(cs.stroke) && Number(cs.strokeOpacity) > 0 && Number.parseFloat(cs.strokeWidth) > 0);
    if (!painted) continue;
    let faded = false;
    for (let e: Element | null = el; e && e !== g; e = e.parentElement) if (Number(getComputedStyle(e).opacity) < 0.05) faded = true;
    if (faded) continue;
    const m = el.getCTM();
    if (!m) continue;
    const bb = el.getBBox();
    if (bb.width === 0 && bb.height === 0) continue;
    let r = box(bb, local(m));
    // Clipped by an ancestor below `g`: only what shows counts.
    for (let e: Element | null = el; e && e !== g; e = e.parentElement) {
      const ref = /url\(["']?#([^"')]+)/.exec(e.getAttribute('clip-path') ?? '');
      const shape = ref ? document.getElementById(ref[1]!)?.firstElementChild : null;
      const em = (e as SVGGraphicsElement).getCTM?.();
      if (!(shape instanceof SVGGraphicsElement) || !em) continue;
      const c = box(shape.getBBox(), local(em));
      r = { x: Math.max(r.x, c.x), y: Math.max(r.y, c.y), w: Math.min(r.x + r.w, c.x + c.w) - Math.max(r.x, c.x), h: Math.min(r.y + r.h, c.y + c.h) - Math.max(r.y, c.y) };
    }
    if (r.w <= 0 || r.h <= 0) continue;
    x0 = Math.min(x0, r.x);
    y0 = Math.min(y0, r.y);
    x1 = Math.max(x1, r.x + r.w);
    y1 = Math.max(y1, r.y + r.h);
  }
  return Number.isFinite(x0) ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}

function box(bb: DOMRect, m: DOMMatrix): Rect {
  const pts = [new DOMPoint(bb.x, bb.y), new DOMPoint(bb.x + bb.width, bb.y), new DOMPoint(bb.x, bb.y + bb.height), new DOMPoint(bb.x + bb.width, bb.y + bb.height)].map((p) => p.matrixTransform(m));
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

/** The transform that brings `painted` inside `into` ('' when it is inside already), or null when it cannot fit legibly. */
export function fitTransform(painted: Rect, into: Rect, slack = 1): string | null {
  const inside = painted.x >= into.x - slack && painted.y >= into.y - slack && painted.x + painted.w <= into.x + into.w + slack && painted.y + painted.h <= into.y + into.h + slack;
  if (inside) return '';
  // A drawing laid out wider than any phone (a row of plates for each share) keeps its width: only its height is fitted.
  const byHeight = Math.min(1, into.h / painted.h);
  const s = Math.min(byHeight, into.w / painted.w) >= FIT_MIN ? Math.min(byHeight, into.w / painted.w) : byHeight;
  if (s < FIT_MIN) return null;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));
  const left = painted.w * s > into.w ? into.x + (into.w - painted.w * s) / 2 : clamp(painted.x + (painted.w * (1 - s)) / 2, into.x, into.x + into.w - painted.w * s);
  const top = clamp(painted.y, into.y, into.y + into.h - painted.h * s);
  const r = (v: number) => Math.round(v * 1000) / 1000;
  return `translate(${r(left - painted.x * s)} ${r(top - painted.y * s)}) scale(${r(s)})`;
}

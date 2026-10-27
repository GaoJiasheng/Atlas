/** Enlarged-window border (docs/58 F4): the stage-pixel frame around the parts of an inset. */
export interface InsetBox { x0: number; y0: number; x1: number; y1: number; shown: boolean; onScreen: boolean }
export interface InsetRect { x: number; y: number; w: number; h: number }

/**
 * Union of the on-show, on-screen part boxes, padded by `pad` and kept inside
 * the stage; null when none of the parts is on show (the frame is not drawn).
 */
export function insetRect(boxes: readonly (InsetBox | undefined)[], width: number, height: number, pad = 10): InsetRect | null {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const b of boxes) {
    if (!b || !b.shown || !b.onScreen || !(b.x1 >= b.x0) || !(b.y1 >= b.y0)) continue;
    x0 = Math.min(x0, b.x0); y0 = Math.min(y0, b.y0); x1 = Math.max(x1, b.x1); y1 = Math.max(y1, b.y1);
  }
  if (!Number.isFinite(x0) || width <= 0 || height <= 0) return null;
  x0 = Math.max(1, x0 - pad); y0 = Math.max(1, y0 - pad);
  x1 = Math.min(width - 1, x1 + pad); y1 = Math.min(height - 1, y1 + pad);
  if (x1 - x0 < 4 || y1 - y0 < 4) return null;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

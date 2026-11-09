import { PAD, segmentThroughRect, type LeaderPlace, type ScreenRect } from './leader-layout';

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

/** Height of the frame's title line above its top edge ("Enlarged schematic · different scale"). */
const INSET_TITLE = 16;

/** Hard border rule, also checked during the DOM placards' glide and fade: the dashed frame
 * (and its title) never crosses a placard or a leader's horizontal run. A part inside the
 * window is labelled inside it, or from outside with a leader that enters the window once
 * to reach it (a callout into a magnified view); other leaders stay out of the window.
 * `titles` are the measured title lines: no placard or leader segment crosses them. */
export function leaderClearOfInsets(p: LeaderPlace, ax: number, ay: number, insets: readonly ScreenRect[], titles: readonly ScreenRect[] = []): boolean {
  if (titles.some(t => (p.x0 < t.x1 && p.x1 > t.x0 && p.y0 < t.y1 && p.y1 > t.y0) ||
    segmentThroughRect(p.sx,p.sy,p.ex,p.sy,t,0) || segmentThroughRect(p.ex,p.sy,ax,ay,t,0))) return false;
  return insets.every(r => {
    const inside = ax > r.x0 && ax < r.x1 && ay > r.y0 && ay < r.y1;
    if (inside && p.x0 >= r.x0 + PAD && p.x1 <= r.x1 - PAD &&
      p.y0 >= r.y0 + PAD && p.y1 <= r.y1 - PAD &&
      Math.min(p.sx,p.ex) > r.x0 && Math.max(p.sx,p.ex) < r.x1) return true;
    const clear = !(p.x0 < r.x1+PAD && p.x1 > r.x0-PAD && p.y0 < r.y1+PAD && p.y1 > r.y0-PAD-INSET_TITLE) &&
      !segmentThroughRect(p.sx,p.sy,p.ex,p.sy,r,0);
    // From an outside elbow, a straight leg into a convex window crosses its border exactly once.
    return clear && (inside || !segmentThroughRect(p.ex,p.sy,ax,ay,r,0));
  });
}

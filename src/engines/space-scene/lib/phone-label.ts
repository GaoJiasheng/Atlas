/**
 * The single leader label of a phone presentation (stage under 760 px wide;
 * pure, unit-tested; docs/70 "手机演示标注"):
 *
 *  - which: the beat's focus part, `beat.part`, else the first of
 *    `beat.labels`. A `group:<id>` is not a part: it is never promoted to the
 *    focus and no later entry is tried
 *  - where: a placard whose whole touch target (at least 44 × 44 px, the box
 *    `LeaderLabels` gives its hit rectangle) lies inside the safe band and
 *    clear of the focus part's screen box and of every HUD block; the leader
 *    runs clear of the HUD too. No such place: no label
 *
 * The narrow stage rarely has room beside the part, so unlike the column
 * layout (`leader-layout.ts`) a placard may also sit above or below it, with
 * the leader leaving from the placard's bottom or top edge.
 */
import { LEADER, segmentThroughRect, type LeaderFrame, type LeaderItem, type LeaderPlace, type ScreenRect, type Side } from './leader-layout';
import { labelGroup } from './labels';

/** Smallest touch target, px. */
export const PHONE_TARGET = 44;
/** The touch target starts this far left of the placard, px. */
const TARGET_INSET = 4;
/** The focus part's box is kept this far from the touch target, px. */
const FOCUS_GAP = 6;
/** Longest leader (share of the stage's shorter side). */
const MAX_LEADER_SHARE = 0.6;
/** A leader leaving a top or bottom edge reads less like the other leaders. */
const W_VERTICAL = 24;
const W_PREV_Y = 0.25;
const W_PREV_X = 0.1;

export interface BeatFocus {
  part?: string | null;
  labels?: readonly string[];
}

/** The part a beat is about, or `null` when it names none. */
export function beatFocusPart(beat: BeatFocus | null | undefined): string | null {
  if (!beat) return null;
  if (beat.part) return beat.part;
  const first = beat.labels?.[0];
  return first !== undefined && labelGroup(first) === null ? first : null;
}

/** The touch target of a placard at (x0, y0): its `w × h` box, grown to at least 44 × 44 around its middle. */
export function phoneTarget(x0: number, y0: number, w: number, h: number): ScreenRect {
  const tw = Math.max(PHONE_TARGET, w + 2 * TARGET_INSET);
  const th = Math.max(PHONE_TARGET, h + 2 * TARGET_INSET);
  const top = y0 + h / 2 - th / 2;
  return { x0: x0 - TARGET_INSET, y0: top, x1: x0 - TARGET_INSET + tw, y1: top + th };
}

const clash = (a: ScreenRect, b: ScreenRect, pad: number) => a.x0 < b.x1 + pad && a.x1 > b.x0 - pad && a.y0 < b.y1 + pad && a.y1 > b.y0 - pad;

/** The leader for a placard, set towards its anchor; `null` when the anchor is level with and under the placard. */
function route(item: LeaderItem, x0: number, y0: number): { side: Side; sx: number; sy: number; ex: number; vertical: boolean } | null {
  const x1 = x0 + item.w;
  const y1 = y0 + item.h;
  const room = LEADER.ELBOW + LEADER.INSET;
  const sy = y0 + item.lead;
  if (item.ax >= x1 + room) return { side: 'L', sx: x1 + LEADER.INSET, sy, ex: x1 + LEADER.INSET + LEADER.ELBOW, vertical: false };
  if (item.ax <= x0 - room) return { side: 'R', sx: x0 - LEADER.INSET, sy, ex: x0 - LEADER.INSET - LEADER.ELBOW, vertical: false };
  if (item.ay > y0 && item.ay < y1) return null;
  const x = Math.min(Math.max(item.ax, x0 + LEADER.INSET), x1 - LEADER.INSET);
  return { side: item.ax >= (x0 + x1) / 2 ? 'L' : 'R', sx: x, sy: item.ay > y0 ? y1 + 2 : y0 - 2, ex: x, vertical: true };
}

/** The best safe place for the one label, or `null`. `f.left … f.bottom` is the safe band. */
export function placePhoneLabel(item: LeaderItem, f: LeaderFrame): LeaderPlace | null {
  const { ax, ay, w, h } = item;
  if (w <= 0 || h <= 0) return null;
  if (ax < f.left || ax > f.right || ay < f.top || ay > f.bottom) return null;
  if (f.obstacles.some((r) => ax >= r.x0 && ax <= r.x1 && ay >= r.y0 && ay <= r.y1)) return null;
  const origin = phoneTarget(0, 0, w, h);
  const minX = f.left - origin.x0;
  const maxX = f.right - origin.x1;
  const minY = f.top - origin.y0;
  const maxY = f.bottom - origin.y1;
  if (maxX < minX || maxY < minY) return null;

  const focus: ScreenRect = item.bounds ?? { x0: ax, y0: ay, x1: ax, y1: ay };
  const xs = [focus.x0 - FOCUS_GAP - origin.x1, focus.x1 + FOCUS_GAP - origin.x0, ax - w / 2, minX, maxX];
  const ys = [focus.y0 - FOCUS_GAP - origin.y1, focus.y1 + FOCUS_GAP - origin.y0, ay - item.lead];
  for (let y = minY; y <= maxY; y += LEADER.STEP) ys.push(y);
  if (item.prev) {
    xs.push(item.prev.x0);
    ys.push(item.prev.y0);
  }
  const maxLeader = Math.min(f.width, f.height) * MAX_LEADER_SHARE;

  let best: LeaderPlace | null = null;
  let bestCost = Infinity;
  for (const rawX of xs) {
    const x0 = Math.min(Math.max(rawX, minX), maxX);
    for (const rawY of ys) {
      const y0 = Math.min(Math.max(rawY, minY), maxY);
      const target = phoneTarget(x0, y0, w, h);
      if (clash(target, focus, FOCUS_GAP - 0.5)) continue;
      if (f.obstacles.some((r) => clash(target, r, LEADER.PAD))) continue;
      const lead = route(item, x0, y0);
      if (!lead) continue;
      const length = Math.hypot(ax - lead.ex, ay - lead.sy) + Math.abs(lead.ex - lead.sx);
      if (length > maxLeader) continue;
      let cost = length + (lead.vertical ? W_VERTICAL : 0);
      if (item.prev && item.prev.side === lead.side) cost += W_PREV_Y * Math.abs(item.prev.y0 - y0) + W_PREV_X * Math.abs(item.prev.x0 - x0);
      if (cost >= bestCost) continue;
      if (f.obstacles.some((r) => segmentThroughRect(lead.sx, lead.sy, lead.ex, lead.sy, r, 0) || segmentThroughRect(lead.ex, lead.sy, ax, ay, r, 0))) continue;
      const place: LeaderPlace = { id: item.id, side: lead.side, x0, y0, x1: x0 + w, y1: y0 + h, sx: lead.sx, sy: lead.sy, ex: lead.ex };
      // The barrier rule (the enlarged windows) judges the whole touch target.
      if (f.accept && !f.accept({ ...place, ...target }, item)) continue;
      bestCost = cost;
      best = place;
    }
  }
  return best;
}

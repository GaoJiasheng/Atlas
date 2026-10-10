/**
 * Leader-label placement for the SpaceScene stage (pure, unit-tested; the
 * rules of TimeScene's map leaders, docs/06 "引线标注"):
 *
 *  - two aligned columns, one each side of the model. A column sits at the
 *    edge of the free band when HUD blocks bound it, else no further out than
 *    22 % / 78 % of the stage, and moves in towards the anchors on its side
 *    (their parts' screen bounds) as far as that edge allows
 *  - each placard goes where it costs least: on its anchor's side, level with
 *    its anchor as far as the stacking allows, in its column (a placard may
 *    leave the column and sit just beside its part when that is much closer),
 *    with the leader at most 35 % of the stage width
 *  - hard limits: inside the stage band, clear of the HUD blocks, of the other
 *    placards and of every labelled anchor; a left-hand placard (text set
 *    right) has its anchor to its right, a right-hand one to its left, so the
 *    leader never runs across the text
 *  - soft limits: placards keep off the labelled parts' screen bounds (other
 *    parts strongly, their own part less), leaders do not cross each other or
 *    run through a placard, and a placard keeps its side and place while the
 *    camera moves (hysteresis). Placards may sit over the model where no
 *    labelled part is.
 *
 * Items come in priority order (the selected part, groups, larger parts); a
 * placard with no legal place is left out.
 */

export type Side = 'L' | 'R';

export interface ScreenRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface LeaderItem {
  id: string;
  /** Projected anchor, stage px. */
  ax: number;
  ay: number;
  /** Placard box (text and the side triangle), and the leader's height inside it from the top. */
  w: number;
  h: number;
  lead: number;
  /** On-screen bounds of the labelled part (or group). */
  bounds: ScreenRect | null;
  /** Where the placard was last frame (keeps it steady while the camera moves). */
  prev: { side: Side; x0: number; y0: number } | null;
}

export interface LeaderFrame {
  /** Stage size, px. */
  width: number;
  height: number;
  /** Free band between the HUD blocks. */
  left: number;
  right: number;
  top: number;
  bottom: number;
  /** HUD blocks over the stage. */
  obstacles: readonly ScreenRect[];
}

export interface LeaderPlace {
  id: string;
  side: Side;
  /** Placard box. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Leader: from (sx, sy) a short horizontal to ex, then straight to the anchor. */
  sx: number;
  sy: number;
  ex: number;
}

export const LEADER = {
  /** Minimum gap between placards, px. */
  GAP: 8,
  /** Horizontal leader stub, px. */
  ELBOW: 16,
  /** Leader start, px from the placard edge. */
  INSET: 6,
  /** Stage margin, px. */
  EDGE: 14,
  /** HUD blocks are kept this far away, px. */
  PAD: 8,
  /** Outermost column position when no HUD block bounds the band (share of the stage width). */
  COLUMN_SHARE: 0.22,
  /** Longest leader (share of the stage width). */
  MAX_LEADER_SHARE: 0.35,
  /** Narrowest column, px (two columns need twice this plus gaps). */
  MIN_COL: 120,
  /** Vertical search step, px. */
  STEP: 6,
} as const;

/* Costs (px-equivalents). */
const W_DY = 1;
const W_DX = 0.15;
const W_OTHER = 600;
const W_OWN = 260;
const W_BESIDE = 90;
const W_NEAR = 130;
const W_WRONG_SIDE = 150;
/** Anchors this close (px) to the middle of the two columns keep the side they had. */
const SIDE_HYSTERESIS = 40;
const W_PREV_Y = 0.25;
const W_PREV_X = 0.1;
const W_CROSS = 320;
const W_THROUGH = 700;

const overlap = (a: ScreenRect, b: ScreenRect) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

const hits = (a: ScreenRect, b: ScreenRect, pad: number) => a.x0 < b.x1 + pad && a.x1 > b.x0 - pad && a.y0 < b.y1 + pad && a.y1 > b.y0 - pad;

/** Do segments p1–p2 and p3–p4 cross (proper intersection)? */
function segmentsCross(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): boolean {
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (Math.abs(d) < 1e-9) return false;
  const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
  const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  return t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98;
}

/** Does segment a–b pass through rectangle r (shrunk by 2 px)? */
function segmentThroughRect(ax: number, ay: number, bx: number, by: number, r: ScreenRect): boolean {
  const x0 = r.x0 + 2;
  const x1 = r.x1 - 2;
  const y0 = r.y0 + 2;
  const y1 = r.y1 - 2;
  if (x1 <= x0 || y1 <= y0) return false;
  // Liang–Barsky clip (no allocation: this runs for every candidate place).
  const dx = bx - ax;
  const dy = by - ay;
  span.t0 = 0;
  span.t1 = 1;
  return clip(-dx, ax - x0) && clip(dx, x1 - ax) && clip(-dy, ay - y0) && clip(dy, y1 - ay);
}

/** The parameter span of the segment still inside the rectangle (Liang–Barsky). */
const span = { t0: 0, t1: 1 };

/** One Liang–Barsky edge test: narrows `span`, false once the segment misses. */
function clip(p: number, q: number): boolean {
  if (Math.abs(p) < 1e-9) return q >= 0;
  const r = q / p;
  if (p < 0) span.t0 = Math.max(span.t0, r);
  else span.t1 = Math.min(span.t1, r);
  return span.t0 <= span.t1;
}

/**
 * The anchor's own side: the left third of the band → L, the right third → R,
 * the middle third the nearer column (keeping its previous side while the
 * two are about as near).
 */
export function naturalSide(f: LeaderFrame, cols: { L: number; R: number }, x: number, prev: Side | null = null): Side {
  const third = (f.right - f.left) / 3;
  if (x < f.left + third) return 'L';
  if (x > f.right - third) return 'R';
  const dl = Math.abs(x - cols.L);
  const dr = Math.abs(cols.R - x);
  if (prev && Math.abs(dl - dr) < SIDE_HYSTERESIS) return prev;
  return dl <= dr ? 'L' : 'R';
}

/** Can the band hold two columns? */
export function twoColumns(f: LeaderFrame, colW: number): boolean {
  return f.right - f.left >= 2 * Math.max(LEADER.MIN_COL, colW * 0.6) + 6 * LEADER.GAP;
}

/**
 * Column positions: `L` = the right edge of the left column, `R` = the left
 * edge of the right column. Each sits at the band edge when HUD blocks bound
 * it, else no further out than 22 % / 78 % of the stage, and moves in
 * towards its anchors' parts (never past them, never out of the band).
 */
export function columnEdges(items: readonly LeaderItem[], f: LeaderFrame): { L: number; R: number; two: boolean } {
  const colW = items.reduce<number>((m, i) => Math.max(m, i.w), LEADER.MIN_COL);
  const two = twoColumns(f, colW);
  const mid = (f.left + f.right) / 2;
  const baseL = f.left + colW;
  const baseR = f.right - colW;
  const innerL = two ? Math.max(baseL, Math.min(f.width * LEADER.COLUMN_SHARE, mid - 3 * LEADER.GAP)) : baseL;
  const innerR = two ? Math.min(baseR, Math.max(f.width * (1 - LEADER.COLUMN_SHARE), mid + 3 * LEADER.GAP)) : baseR;
  let minL = Infinity;
  let maxR = -Infinity;
  const third = (f.right - f.left) / 3;
  for (const i of items) {
    // Columns follow the anchors in the outer thirds (the middle third goes either way).
    if (two && i.ax < f.left + third) minL = Math.min(minL, i.bounds ? Math.min(i.bounds.x0, i.ax) : i.ax);
    else if (two && i.ax <= f.right - third) continue;
    else maxR = Math.max(maxR, i.bounds ? Math.max(i.bounds.x1, i.ax) : i.ax);
  }
  const reach = 2 * LEADER.ELBOW;
  const L = Number.isFinite(minL) ? Math.max(baseL, Math.min(innerL, minL - reach)) : innerL;
  const R = Number.isFinite(maxR) ? Math.min(baseR, Math.max(innerR, maxR + reach)) : innerR;
  return { L, R, two };
}

/**
 * Leader start for a placard box: a left-hand (L) placard has its anchor to
 * its right and leaves from its right edge, a right-hand (R) one the other
 * way round; `null` when the anchor is not beside the box on that side.
 */
function leaderStart(side: Side, x0: number, x1: number, y0: number, item: LeaderItem): { sx: number; sy: number; ex: number } | null {
  const sy = y0 + item.lead;
  const room = LEADER.ELBOW + LEADER.INSET;
  if (side === 'L') return item.ax >= x1 + room ? { sx: x1 + LEADER.INSET, sy, ex: x1 + LEADER.INSET + LEADER.ELBOW } : null;
  return item.ax <= x0 - room ? { sx: x0 - LEADER.INSET, sy, ex: x0 - LEADER.INSET - LEADER.ELBOW } : null;
}

/** Re-placement passes after the greedy one (each placard again, with all the others in place). */
const REFINE_PASSES = 2;

/**
 * Place the placards: a greedy pass in priority order, then each placard is
 * placed again with all the others in place (a placard placed early may have
 * to make way for a later one's leader). Unplaceable items are left out.
 */
export function layoutLeaders(items: readonly LeaderItem[], f: LeaderFrame): LeaderPlace[] {
  const cols = columnEdges(items, f);
  const byId = new Map(items.map((i) => [i.id, i]));
  const placed = new Map<string, { place: LeaderPlace; cost: number }>();
  for (const item of items) {
    const best = bestPlace(item, items, byId, [...placed.values()].map((p) => p.place), f, cols);
    if (best) placed.set(item.id, best);
  }
  for (let pass = 0; pass < REFINE_PASSES; pass++) {
    let changed = false;
    for (const item of items) {
      const mine = placed.get(item.id);
      const others = [...placed.values()].filter((p) => p.place.id !== item.id).map((p) => p.place);
      const best = bestPlace(item, items, byId, others, f, cols);
      if (!best) continue;
      if (!mine || best.cost < mine.cost - 1) {
        placed.set(item.id, best);
        changed = true;
      } else {
        // Its own cost may have changed with the others' moves.
        mine.cost = Math.min(mine.cost, best.cost);
      }
    }
    if (!changed) break;
  }
  // Priority order, as the items came.
  return items.flatMap((i) => {
    const p = placed.get(i.id);
    return p ? [p.place] : [];
  });
}

/** The cheapest legal place for `item` given the placards already placed, or null. */
function bestPlace(
  item: LeaderItem,
  items: readonly LeaderItem[],
  byId: ReadonlyMap<string, LeaderItem>,
  placed: readonly LeaderPlace[],
  f: LeaderFrame,
  cols: { L: number; R: number; two: boolean },
): { place: LeaderPlace; cost: number } | null {
  if (item.h > f.bottom - f.top) return null;
  const maxLeader = f.width * LEADER.MAX_LEADER_SHARE;
  const minX = LEADER.EDGE;
  const maxX = f.width - LEADER.EDGE;
  const sides: Side[] = cols.two ? ['L', 'R'] : ['R', 'L'];
  let best: LeaderPlace | null = null;
  let bestCost = Infinity;
  const natural = cols.two ? naturalSide(f, cols, item.ax, item.prev?.side ?? null) : 'R';
  const area = item.w * item.h;
  for (const side of sides) {
    // Box left edges: the column, beside the part's bounds, beside the anchor.
    const own = item.bounds;
    const reach = 2 * LEADER.ELBOW;
    const xs: [number, number][] =
      side === 'L'
        ? [
            [cols.L - item.w, 0],
            [(own ? Math.min(own.x0, item.ax) : item.ax) - reach - item.w, W_BESIDE],
            [item.ax - reach - item.w, W_NEAR],
          ]
        : [
            [cols.R, 0],
            [(own ? Math.max(own.x1, item.ax) : item.ax) + reach, W_BESIDE],
            [item.ax + reach, W_NEAR],
          ];
    for (let k = 0; k < xs.length; k++) {
      const [x0raw, xCost] = xs[k]!;
      const x0 = Math.min(Math.max(x0raw, minX), maxX - item.w);
      if (x0 < minX - 0.5) continue;
      // Skip an x already tried for this side.
      if (xs.slice(0, k).some(([xr]) => Math.abs(Math.min(Math.max(xr, minX), maxX - item.w) - x0) < 4)) continue;
      const x1 = x0 + item.w;
      const desired = item.ay - item.lead;
      const ys: number[] = [];
      for (let y = f.top; y <= f.bottom - item.h; y += LEADER.STEP) ys.push(y);
      ys.push(Math.min(Math.max(desired, f.top), f.bottom - item.h));
      if (item.prev && item.prev.side === side) ys.push(Math.min(Math.max(item.prev.y0, f.top), f.bottom - item.h));
      for (const y0 of ys) {
        const box: ScreenRect = { x0, y0, x1, y1: y0 + item.h };
        const lead = leaderStart(side, x0, x1, y0, item);
        if (!lead) continue;
        const len = Math.hypot(item.ax - lead.ex, item.ay - lead.sy) + LEADER.ELBOW;
        if (len > maxLeader) continue;
        if (f.obstacles.some((r) => hits(box, r, LEADER.PAD))) continue;
        if (placed.some((p) => hits(box, p, LEADER.GAP / 2))) continue;
        if (items.some((o) => o.ax > x0 - LEADER.PAD && o.ax < x1 + LEADER.PAD && o.ay > y0 - LEADER.PAD && o.ay < box.y1 + LEADER.PAD)) continue;
        let cost = xCost + W_DY * Math.abs(lead.sy - item.ay) + W_DX * Math.abs(item.ax - lead.ex);
        if (side !== natural) cost += W_WRONG_SIDE;
        if (item.prev && item.prev.side === side) cost += W_PREV_Y * Math.abs(item.prev.y0 - y0) + W_PREV_X * Math.abs(item.prev.x0 - x0);
        if (cost >= bestCost) continue;
        for (const o of items) {
          if (!o.bounds) continue;
          const a = overlap(box, o.bounds);
          if (a > 0) cost += (a / area) * (o.id === item.id ? W_OWN : W_OTHER);
        }
        if (cost >= bestCost) continue;
        for (const p of placed) {
          const pa = byId.get(p.id)!;
          if (segmentsCross(lead.ex, lead.sy, item.ax, item.ay, p.ex, p.sy, pa.ax, pa.ay)) cost += W_CROSS;
          if (segmentThroughRect(lead.ex, lead.sy, item.ax, item.ay, p)) cost += W_THROUGH;
          if (segmentThroughRect(p.ex, p.sy, pa.ax, pa.ay, box)) cost += W_THROUGH;
        }
        if (cost < bestCost) {
          bestCost = cost;
          best = { id: item.id, side, x0, y0, x1, y1: box.y1, ...lead };
        }
      }
    }
  }
  return best ? { place: best, cost: bestCost } : null;
}

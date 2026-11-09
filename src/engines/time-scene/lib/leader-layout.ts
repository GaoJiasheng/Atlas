/**
 * Where leader placards go (docs/08 §5), as a pure function of the measured
 * placards, their projected anchors and the free band. Placards keep to two
 * columns while those columns are near their anchors; a placard whose column
 * is far away is pulled in beside its own anchor, because a name at the end of
 * a long leader reads as naming the land under it. The pull is continuous, so
 * placards ride along during a camera flight.
 */
export interface LeaderBox { x: number; y: number; w: number; h: number }
export interface LeaderInput { key: string; w: number; h: number; sx: number; sy: number; side: 'L' | 'R' | null }
export interface LeaderBand { left: number; right: number; top: number; bottom: number; u: number; obstacles: readonly LeaderBox[] }
export interface LeaderSlot extends LeaderBox { side: 'L' | 'R' }

/** Design px (× band.u). */
const GAP = 8;
const EDGE = 22;
const ELBOW = 14;
const MIN_COL = 120;
const SIDE_HYSTERESIS = 40;
/** The longest horizontal run from a placard to its anchor. */
export const LEADER_REACH = 44;
/** Outermost column position (share of the stage width) when no HUD panel bounds the band. */
const COLUMN_SHARE = 0.22;
/** Keep a placard this far off an anchor that belongs to another placard. */
const ANCHOR_CLEAR = 6;

const hits = (a: LeaderBox, b: LeaderBox) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function placeLeaders(items: readonly LeaderInput[], band: LeaderBand, width: number, height: number): Map<string, LeaderSlot | null> {
  const out = new Map<string, LeaderSlot | null>();
  const { u } = band;
  const room = band.right - band.left;
  const gap = GAP * u;
  const elbow = ELBOW * u;
  const reach = LEADER_REACH * u;
  const twoColumns = room >= 2 * MIN_COL * u + 6 * gap;
  const oneColumn = room >= MIN_COL * u + 2 * gap;
  const shown = items.filter((e) => {
    const on = oneColumn && e.sx >= 0 && e.sx <= width && e.sy >= 0 && e.sy <= height;
    if (!on) out.set(e.key, null);
    return on;
  });
  if (!shown.length) return out;

  const colW = Math.max(...shown.map((e) => e.w), MIN_COL * u);
  const baseL = band.left + colW;
  const baseR = band.right - colW;
  const middle = (band.left + band.right) / 2;
  const innerL = twoColumns ? Math.max(baseL, Math.min(width * COLUMN_SHARE, middle - 3 * gap)) : baseL;
  const innerR = twoColumns ? Math.min(baseR, Math.max(width * (1 - COLUMN_SHARE), middle + 3 * gap)) : baseR;
  const third = room / 3;
  const preferred = new Map<string, 'L' | 'R'>();
  for (const e of shown) {
    let side: 'L' | 'R' = 'R';
    if (twoColumns) {
      if (e.sx < band.left + third) side = 'L';
      else if (e.sx > band.right - third) side = 'R';
      else {
        const dl = Math.abs(e.sx - innerL);
        const dr = Math.abs(innerR - e.sx);
        side = dl <= dr ? 'L' : 'R';
        if (e.side && e.side !== side && Math.abs(dl - dr) < SIDE_HYSTERESIS * u) side = e.side;
      }
    }
    preferred.set(e.key, side);
  }
  const anchorsOf = (s: 'L' | 'R') => shown.filter((e) => preferred.get(e.key) === s).map((e) => e.sx);
  const anchorsL = anchorsOf('L');
  const anchorsR = anchorsOf('R');
  const xL = anchorsL.length ? Math.max(baseL, Math.min(innerL, Math.min(...anchorsL) - 2 * elbow)) : innerL;
  const xR = anchorsR.length ? Math.min(baseR, Math.max(innerR, Math.max(...anchorsR) + 2 * elbow)) : innerR;

  /** Left edge of the placard on `s`: the column, pulled in to within `reach` of the anchor and never on it. */
  const xFor = (e: LeaderInput, s: 'L' | 'R') => s === 'L'
    ? Math.min(Math.max(xL, e.sx - reach), e.sx - elbow) - e.w
    : Math.max(Math.min(xR, e.sx + reach), e.sx + elbow);
  const margin = EDGE * u;
  const restY = (e: LeaderInput) => Math.min(Math.max(e.sy - e.h * 0.35, band.top), band.bottom - e.h);
  const fits = (e: LeaderInput, s: 'L' | 'R') => {
    const box = { x: xFor(e, s), y: restY(e), w: e.w, h: e.h };
    return box.x >= margin && box.x + box.w <= width - margin && !band.obstacles.some((r) => hits(box, r));
  };

  const cols: Record<'L' | 'R', LeaderInput[]> = { L: [], R: [] };
  for (const e of shown) {
    const first = preferred.get(e.key)!;
    const other = first === 'L' ? 'R' : 'L';
    const side = fits(e, first) || !fits(e, other) ? first : other;
    cols[side].push(e);
  }

  const slots: LeaderSlot[] = [];
  for (const side of ['L', 'R'] as const) {
    const col = cols[side].sort((a, z) => a.sy - z.sy);
    const xs = col.map((e) => xFor(e, side));
    const overlapX = (i: number, j: number) => xs[i]! < xs[j]! + col[j]!.w && xs[i]! + col[i]!.w > xs[j]!;
    const ys = col.map(restY);
    for (let i = 1; i < col.length; i++) for (let j = 0; j < i; j++) if (overlapX(i, j)) ys[i] = Math.max(ys[i]!, ys[j]! + col[j]!.h + gap);
    for (let i = col.length - 1; i >= 0; i--) {
      ys[i] = Math.min(ys[i]!, band.bottom - col[i]!.h);
      for (let j = i + 1; j < col.length; j++) if (overlapX(i, j)) ys[i] = Math.min(ys[i]!, ys[j]! - col[i]!.h - gap);
    }
    col.forEach((e, i) => slots.push({ side, x: xs[i]!, y: ys[i]!, w: e.w, h: e.h }));
  }

  // A last pass over both columns: step a placard clear of panels, the other column and other placards' anchors, else hide it.
  const ordered = [...cols.L, ...cols.R];
  const placed: LeaderBox[] = [];
  ordered.forEach((e, i) => {
    const slot = slots[i]!;
    const dots = shown.filter((o) => o.key !== e.key).map((o) => ({ x: o.sx - ANCHOR_CLEAR, y: o.sy - ANCHOR_CLEAR, w: 2 * ANCHOR_CLEAR, h: 2 * ANCHOR_CLEAR }));
    const blockers = [...band.obstacles, ...placed, ...dots];
    const at = (y: number) => ({ ...slot, y });
    const free = (y: number) => y >= band.top - 1 && y + slot.h <= band.bottom + 1 && !blockers.some((b) => hits(at(y), b));
    const tries = [slot.y, ...blockers.filter((b) => hits(slot, b)).flatMap((b) => [b.y + b.h + gap, b.y - slot.h - gap])].sort((a, z) => Math.abs(a - slot.y) - Math.abs(z - slot.y));
    const y = tries.find(free);
    if (y === undefined) { out.set(e.key, null); return; }
    const box = at(y);
    placed.push(box);
    out.set(e.key, box);
  });
  return out;
}

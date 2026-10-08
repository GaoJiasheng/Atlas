/**
 * Which entities the "Participation and area" card (HUD `card` slot) draws
 * when there are more than fit its height. Pure and unit-tested.
 *
 * Rule: if every entity fits at the minimum row height, draw them all in data
 * order. Otherwise draw at most `maxRows` (12) rows, as many as fit once one
 * slim row is reserved for the rest, and collapse everything else into that
 * muted "+N others / 另 N 方" row. Rows are picked
 *   (a) entities that hold control area at some keyframe first, largest peak
 *       area first,
 *   (b) then the others by join date (earliest first),
 * ties broken by data order. The picked rows are drawn in that rank order.
 */
import type { EntityN } from './model';

/** Most entity rows ever drawn once the card has to collapse. */
export const BAND_MAX_ROWS = 12;

export interface BandRowPlan {
  /** Entities to draw, top to bottom. */
  rows: EntityN[];
  /** Entities folded into the "+N others" row (0 = no such row). */
  hidden: number;
}

export interface BandRowInput {
  entities: readonly EntityN[];
  /** Area per keyframe by entity id (`controlAreas`). */
  areas: ReadonlyMap<string, readonly number[]>;
  /** Height available for rows (same unit as the two heights below). */
  availableHeight: number;
  /** Smallest row height at which a label (EN + 中文 lines) does not collide with the next row. */
  minRowHeight: number;
  /** Height of the collapsed "+N others" row. */
  collapsedHeight: number;
  maxRows?: number;
}

/** Entities ranked for display: controlled area (largest first), then join date. */
export function rankBandEntities(entities: readonly EntityN[], areas: ReadonlyMap<string, readonly number[]>): EntityN[] {
  const peak = (e: EntityN) => Math.max(0, ...(areas.get(e.entity.id) ?? []));
  const order = new Map(entities.map((e, i) => [e, i]));
  return [...entities].sort((a, b) => {
    const pa = peak(a);
    const pb = peak(b);
    if (pa > 0 !== pb > 0) return pa > 0 ? -1 : 1;
    if (pa > 0 && pa !== pb) return pb - pa;
    return a.joined - b.joined || order.get(a)! - order.get(b)!;
  });
}

export function planBandRows(input: BandRowInput): BandRowPlan {
  const { entities, areas, availableHeight, minRowHeight, collapsedHeight, maxRows = BAND_MAX_ROWS } = input;
  const fits = Math.floor(availableHeight / minRowHeight);
  if (entities.length <= fits) return { rows: [...entities], hidden: 0 };
  const room = Math.floor((availableHeight - collapsedHeight) / minRowHeight);
  const shown = Math.max(1, Math.min(maxRows, room, entities.length));
  const rows = rankBandEntities(entities, areas).slice(0, shown);
  return { rows, hidden: entities.length - rows.length };
}

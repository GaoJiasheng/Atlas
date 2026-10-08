/**
 * Which entities the "Participation and area" card (HUD `card` slot) draws
 * when there are more than fit its height. Pure and unit-tested.
 *
 * Rule: if every entity fits at the minimum row height, draw them all in data
 * order. Otherwise draw at most `maxRows` (12) rows, as many as fit once one
 * slim row is reserved for the rest, and collapse everything else into that
 * muted "+N others / 另 N 方" row. Rows are ranked by relevance at the
 * playhead time `t`:
 *   (a) entities at war at `t` that hold control area at `t`, largest area
 *       first,
 *   (b) then the other entities at war at `t`, by join date (earliest first),
 * ties broken by data order. Entities not at war at `t` (before `joined`,
 * after `left`) are never drawn once the card collapses; they count in
 * "+N others".
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
  /** Playhead time (numeric, lib/time.ts). */
  t: number;
  /** Control area at `t` by entity id (km², 0 = none; missing = 0). */
  areaNow: ReadonlyMap<string, number>;
  /** Height available for rows (same unit as the two heights below). */
  availableHeight: number;
  /** Smallest row height at which a label (EN + 中文 lines) does not collide with the next row. */
  minRowHeight: number;
  /** Height of the collapsed "+N others" row. */
  collapsedHeight: number;
  maxRows?: number;
}

/** True while `t` is inside the entity's `joined` .. `left` window (`left` itself counts). */
export const atWarAt = (e: EntityN, t: number): boolean => t >= e.joined && t <= e.left;

/** Entities at war at `t`, ranked: controlled area at `t` (largest first), then join date. */
export function rankBandEntities(entities: readonly EntityN[], t: number, areaNow: ReadonlyMap<string, number>): EntityN[] {
  const area = (e: EntityN) => areaNow.get(e.entity.id) ?? 0;
  const order = new Map(entities.map((e, i) => [e, i]));
  return entities
    .filter((e) => atWarAt(e, t))
    .sort((a, b) => {
      const pa = area(a);
      const pb = area(b);
      if (pa > 0 !== pb > 0) return pa > 0 ? -1 : 1;
      if (pa > 0 && pa !== pb) return pb - pa;
      return a.joined - b.joined || order.get(a)! - order.get(b)!;
    });
}

export function planBandRows(input: BandRowInput): BandRowPlan {
  const { entities, t, areaNow, availableHeight, minRowHeight, collapsedHeight, maxRows = BAND_MAX_ROWS } = input;
  const fits = Math.floor(availableHeight / minRowHeight);
  if (entities.length <= fits) return { rows: [...entities], hidden: 0 };
  const room = Math.floor((availableHeight - collapsedHeight) / minRowHeight);
  const ranked = rankBandEntities(entities, t, areaNow);
  const shown = Math.min(ranked.length, Math.max(1, Math.min(maxRows, room)));
  const rows = ranked.slice(0, shown);
  return { rows, hidden: entities.length - rows.length };
}

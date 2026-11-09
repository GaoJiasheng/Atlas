/** Screen-only event spacing. Source coordinates still drive geography and cameras. */
import { projectNearCentre, type LngLat } from './geo';

export type DisplayOffset = readonly [number, number];
export const MAX_EVENT_DISPLAY_OFFSET = 96;

/** Authored offsets hold from this map zoom in (regional beats) … */
const DISPLAY_OFFSET_FULL_ZOOM = 4.2;
/** … and reach their floor at this zoom (a whole-ocean view). */
const DISPLAY_OFFSET_FLOOR_ZOOM = 2.5;
/** Nine slots on the 96 px ring stay 44.7 px apart: every mark keeps a 44 px target of its own. */
export const DISPLAY_OFFSET_MIN_SCALE = 0.68;

/** Share of an authored offset to draw at `zoom`, so a spread cluster does not cover an ocean when zoomed out. */
export function displayOffsetScale(zoom: number): number {
  const t = Math.max(0, Math.min(1, (zoom - DISPLAY_OFFSET_FLOOR_ZOOM) / (DISPLAY_OFFSET_FULL_ZOOM - DISPLAY_OFFSET_FLOOR_ZOOM)));
  return Math.round((DISPLAY_OFFSET_MIN_SCALE + (1 - DISPLAY_OFFSET_MIN_SCALE) * t) * 25) / 25;
}

export function scaledDisplayOffset(offset: DisplayOffset, scale: number): DisplayOffset {
  return [offset[0] * scale, offset[1] * scale];
}

type Point = { x: number; y: number };
type DisplayPoint = { id: string; at: LngLat; displayOffset?: DisplayOffset };

/** Project into the visible world copy, then apply CSS-pixel offsets right/down. */
export function eventDisplayPoint(
  project: (at: LngLat) => Point,
  event: Pick<DisplayPoint, 'at' | 'displayOffset'>,
  centreX: number,
  scale = 1,
): Point {
  const point = projectNearCentre(project, event.at, centreX);
  return { x: point.x + (event.displayOffset?.[0] ?? 0) * scale, y: point.y + (event.displayOffset?.[1] ?? 0) * scale };
}

/** Closest visible mark inside its 44px square target; stable ties follow data order. */
export function eventAtDisplayPoint(
  events: readonly DisplayPoint[],
  project: (at: LngLat) => Point,
  point: Point,
  radius = 22,
  scale = 1,
): string | null {
  let best: { id: string; distance: number } | null = null;
  for (const event of events) {
    const display = eventDisplayPoint(project, event, point.x, scale);
    const dx = display.x - point.x;
    const dy = display.y - point.y;
    if (Math.abs(dx) > radius || Math.abs(dy) > radius) continue;
    const distance = Math.hypot(dx, dy);
    if (!best || distance < best.distance) best = { id: event.id, distance };
  }
  return best?.id ?? null;
}

/**
 * Hairline leg from a shifted mark back to its source anchor (mark-local px, origin = mark centre):
 * starts `gap` px short of the anchor and ends on the mark's ring of radius `r`; null when too short to draw.
 */
export function displayLeg(offset: DisplayOffset, r: number, gap = 6): { x1: number; y1: number; x2: number; y2: number } | null {
  const [dx, dy] = offset;
  const length = Math.hypot(dx, dy);
  if (length <= r + gap) return null;
  const ux = dx / length;
  const uy = dy / length;
  return { x1: -ux * (length - gap), y1: -uy * (length - gap), x2: -ux * r, y2: -uy * r };
}

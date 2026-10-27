/** Screen-only event spacing. Source coordinates still drive geography and cameras. */
import { projectNearCentre, type LngLat } from './geo';

export type DisplayOffset = readonly [number, number];
export const MAX_EVENT_DISPLAY_OFFSET = 96;

type Point = { x: number; y: number };
type DisplayPoint = { id: string; at: LngLat; displayOffset?: DisplayOffset };

/** Project into the visible world copy, then apply CSS-pixel offsets right/down. */
export function eventDisplayPoint(
  project: (at: LngLat) => Point,
  event: Pick<DisplayPoint, 'at' | 'displayOffset'>,
  centreX: number,
): Point {
  const point = projectNearCentre(project, event.at, centreX);
  return { x: point.x + (event.displayOffset?.[0] ?? 0), y: point.y + (event.displayOffset?.[1] ?? 0) };
}

/** Closest visible mark inside its 44px square target; stable ties follow data order. */
export function eventAtDisplayPoint(
  events: readonly DisplayPoint[],
  project: (at: LngLat) => Point,
  point: Point,
  radius = 22,
): string | null {
  let best: { id: string; distance: number } | null = null;
  for (const event of events) {
    const display = eventDisplayPoint(project, event, point.x);
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

/**
 * Small planar helpers on [lng, lat] polylines (good enough for arrows a few
 * hundred km long; no great-circle maths). Pure, unit-tested.
 */
export type LngLat = [number, number];
type Pos = readonly number[];

function seg(a: Pos, b: Pos): number {
  return Math.hypot((b[0] ?? 0) - (a[0] ?? 0), (b[1] ?? 0) - (a[1] ?? 0));
}

export function lineLength(coords: readonly Pos[]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) total += seg(coords[i - 1]!, coords[i]!);
  return total;
}

/**
 * The part of the line from its start to `fraction` (0..1) of its length,
 * ending exactly at the interpolated head. Always returns >= 2 positions
 * when the input has >= 2 (a zero-length stub at fraction 0).
 */
export function sliceLine(coords: readonly Pos[], fraction: number): LngLat[] {
  const out: LngLat[] = [];
  const first = coords[0];
  if (!first) return out;
  out.push([first[0] ?? 0, first[1] ?? 0]);
  if (coords.length < 2) return out;
  const f = Math.min(1, Math.max(0, fraction));
  let remaining = lineLength(coords) * f;
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1]!;
    const b = coords[i]!;
    const len = seg(a, b);
    if (remaining >= len && i < coords.length - 1) {
      out.push([b[0] ?? 0, b[1] ?? 0]);
      remaining -= len;
      continue;
    }
    const k = len === 0 ? 1 : Math.min(1, remaining / len);
    out.push([(a[0] ?? 0) + ((b[0] ?? 0) - (a[0] ?? 0)) * k, (a[1] ?? 0) + ((b[1] ?? 0) - (a[1] ?? 0)) * k]);
    break;
  }
  return out;
}

/** Point at `fraction` of the line's length. */
export function pointAlong(coords: readonly Pos[], fraction: number): LngLat | null {
  const slice = sliceLine(coords, fraction);
  return slice[slice.length - 1] ?? null;
}

/** Centroid of the largest outer ring (label anchor for an area). */
export function areaLabelPoint(polygons: readonly (readonly (readonly Pos[])[])[]): LngLat | null {
  let best: { area: number; x: number; y: number } | null = null;
  for (const poly of polygons) {
    const ring = poly[0];
    if (!ring || ring.length < 3) continue;
    let a = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [x0 = 0, y0 = 0] = ring[j]!;
      const [x1 = 0, y1 = 0] = ring[i]!;
      const f = x0 * y1 - x1 * y0;
      a += f;
      cx += (x0 + x1) * f;
      cy += (y0 + y1) * f;
    }
    if (a === 0) continue;
    const area = Math.abs(a / 2);
    if (!best || area > best.area) best = { area, x: cx / (3 * a), y: cy / (3 * a) };
  }
  return best ? [best.x, best.y] : null;
}

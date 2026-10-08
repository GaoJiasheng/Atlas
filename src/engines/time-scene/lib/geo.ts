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

/** Great-circle length (km) of a [lng, lat] polyline. Longitudes may run past ±180 (unwrapped paths). */
export function lineLengthKm(coords: readonly Pos[]): number {
  const R = 6371.0088;
  const rad = Math.PI / 180;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1]!;
    const b = coords[i]!;
    const dLat = ((b[1] ?? 0) - (a[1] ?? 0)) * rad;
    const dLng = ((b[0] ?? 0) - (a[0] ?? 0)) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos((a[1] ?? 0) * rad) * Math.cos((b[1] ?? 0) * rad) * Math.sin(dLng / 2) ** 2;
    total += 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  return total;
}

/**
 * Make a path's longitudes continuous: where two consecutive points differ by
 * more than 180° the second (and everything after it) is moved by a multiple of
 * 360° so the segment takes the short way. Authors write the jump
 * (`[179.5, 42]` then `[-179.5, 42]`, schema longitudes stay in -180..180);
 * MapLibre draws longitudes past ±180 in the neighbouring world copy.
 */
export function unwrapPath(coords: readonly Pos[]): LngLat[] {
  const out: LngLat[] = [];
  let offset = 0;
  let prev = coords[0]?.[0] ?? 0;
  for (const p of coords) {
    const lon = p[0] ?? 0;
    const d = lon + offset - prev;
    if (d > 180) offset -= 360 * Math.round(d / 360);
    else if (d < -180) offset += 360 * Math.round(-d / 360);
    const x = lon + offset;
    out.push([x, p[1] ?? 0]);
    prev = x;
  }
  return out;
}

/**
 * `unwrapPath`, then the whole path is moved by a multiple of 360° so its
 * centre lies in the main world copy (-180..180). One consistent copy for
 * drawing, labels and the theatre fit.
 */
export function unwrapPathCentred(coords: readonly Pos[]): LngLat[] {
  const out = unwrapPath(coords);
  if (out.length === 0) return out;
  let min = Infinity;
  let max = -Infinity;
  for (const p of out) {
    if (p[0] < min) min = p[0];
    if (p[0] > max) max = p[0];
  }
  const shift = -360 * Math.round((min + max) / 2 / 360);
  return shift === 0 ? out : out.map((p) => [p[0] + shift, p[1]] as LngLat);
}

/**
 * The world copy of `lng` (`lng`, `lng - 360`, `lng + 360`) whose projected x
 * is closest to `centreX`. MapLibre draws every world copy, but `project()` of
 * a position in a copy that is off-screen returns off-screen pixels; anything
 * that follows a position (leader anchors, place names) must pick the copy the
 * camera is looking at. `xOf` maps a longitude to its screen x.
 */
export function pickWorldCopy(lng: number, xOf: (lng: number) => number, centreX: number): number {
  let best = lng;
  let bestD = Math.abs(xOf(lng) - centreX);
  for (const candidate of [lng - 360, lng + 360]) {
    const d = Math.abs(xOf(candidate) - centreX);
    if (d < bestD) {
      best = candidate;
      bestD = d;
    }
  }
  return best;
}

/** Screen position of `at` in the world copy nearest `centreX`; also returns the longitude used. */
export function projectNearCentre(
  project: (p: LngLat) => { x: number; y: number },
  at: LngLat,
  centreX: number,
): { x: number; y: number; lng: number } {
  const lng = pickWorldCopy(at[0], (l) => project([l, at[1]]).x, centreX);
  const p = project([lng, at[1]]);
  return { x: p.x, y: p.y, lng };
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

/**
 * Make a ring longitude-continuous (used by scripts/build-geo.ts). Rings from
 * world-atlas that cross ±180° jump from 180 to -180 in one segment, which a
 * planar renderer draws as a line across the whole world. Each position is
 * shifted by a multiple of 360° so no segment spans more than 180°, then the
 * whole ring is moved by a multiple of 360° so its bounding-box centre lies in
 * [-180, 180] (MapLibre wraps the overhang into the neighbouring world copy).
 * A ring that winds around a pole ends 360° from where it started; it is
 * closed along that pole (|lat| = 90; Web Mercator clamps it to the edge).
 */
export function unwrapRing(ring: readonly Pos[]): LngLat[] {
  const out: LngLat[] = [];
  let offset = 0;
  let prev = ring[0]?.[0] ?? 0;
  for (const p of ring) {
    const lon = p[0] ?? 0;
    const d = lon + offset - prev;
    if (d > 180) offset -= 360 * Math.round(d / 360);
    else if (d < -180) offset += 360 * Math.round(-d / 360);
    const x = lon + offset;
    out.push([x, p[1] ?? 0]);
    prev = x;
  }
  const first = out[0];
  const last = out[out.length - 1];
  if (!first || !last) return out;
  if (Math.abs(last[0] - first[0]) > 180) {
    const meanLat = out.reduce((sum, p) => sum + p[1], 0) / out.length;
    const pole = meanLat < 0 ? -90 : 90;
    out.push([last[0], pole], [first[0], pole], [first[0], first[1]]);
  }
  let min = Infinity;
  let max = -Infinity;
  for (const p of out) {
    if (p[0] < min) min = p[0];
    if (p[0] > max) max = p[0];
  }
  const shift = -360 * Math.round((min + max) / 2 / 360);
  return shift === 0 ? out : out.map((p) => [p[0] + shift, p[1]] as LngLat);
}

/* ------------------------------------------------------------------ */
/* Areas                                                               */
/* ------------------------------------------------------------------ */

/** WGS84 equatorial radius (m), as used by geojson-area / turf. */
const EARTH_RADIUS = 6_378_137;
const RAD = Math.PI / 180;

/**
 * Area of a ring on the sphere in km² (absolute; Chamberlain & Duquette
 * 2007, the method of geojson-area / turf). Good to well under 1% at the
 * scales a topic draws.
 */
export function ringAreaKm2(ring: readonly Pos[]): number {
  const n = ring.length;
  if (n < 3) return 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    const a = ring[i]!;
    const b = ring[(i + 1) % n]!;
    const c = ring[(i + 2) % n]!;
    total += ((c[0] ?? 0) - (a[0] ?? 0)) * RAD * Math.sin((b[1] ?? 0) * RAD);
  }
  return Math.abs((total * EARTH_RADIUS * EARTH_RADIUS) / 2) / 1e6;
}

/** Area of a Polygon / MultiPolygon in km² (outer rings minus holes). */
export function areaKm2(geometry: { type: 'Polygon'; coordinates: readonly (readonly Pos[])[] } | { type: 'MultiPolygon'; coordinates: readonly (readonly (readonly Pos[])[])[] }): number {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let total = 0;
  for (const poly of polys) {
    poly.forEach((ring, i) => {
      total += (i === 0 ? 1 : -1) * ringAreaKm2(ring);
    });
  }
  return Math.max(0, total);
}

/** Ground metres per CSS pixel in Web Mercator at `zoom` and latitude `lat` (512 px tiles). */
export function metresPerPixel(zoom: number, lat: number): number {
  return (Math.cos(lat * RAD) * 2 * Math.PI * EARTH_RADIUS) / (512 * 2 ** zoom);
}

/**
 * A round scale-bar length (1, 2, 5 × 10^k km, or metres below 1 km) that
 * fits in `maxPx` at `mPerPx`. Returns the bar's length in px and its label.
 */
export function scaleBar(mPerPx: number, maxPx: number): { px: number; metres: number; label: string } {
  const maxM = mPerPx * maxPx;
  if (!(maxM > 0) || !Number.isFinite(maxM)) return { px: 0, metres: 0, label: '' };
  const exp = 10 ** Math.floor(Math.log10(maxM));
  const metres = [5, 2, 1].map((m) => m * exp).find((m) => m <= maxM) ?? exp;
  const label = metres >= 1000 ? `${groupThousands(metres / 1000)} km` : `${metres} m`;
  return { px: metres / mPerPx, metres, label };
}

function groupThousands(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

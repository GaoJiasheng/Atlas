/**
 * Territory names on the map (who holds what at `t`): the pure part.
 *
 *  - `polylabel`: pole of inaccessibility of a polygon (the interior point
 *    farthest from its edges) and that distance, the radius of the largest
 *    inscribed circle. Mapbox's polylabel algorithm (grid of cells, best-first
 *    refinement with a priority queue), written out here.
 *  - `labelGeometry`: per control feature, the anchor and inscribed radius of
 *    its largest polygon in Web Mercator "degree" units (x = lng, y = Mercator
 *    y scaled to degrees), so screen px = units × `pxPerUnit(zoom)` at any zoom.
 *  - `labelText`: the map text of a feature, `properties.label` without its
 *    parenthetical (the map shows "Denmark", the label says "Denmark (German-occupied)"),
 *    else the holder's name.
 *  - `tierFor`, `pairCrossfade`, `placeLabels`: size tier by screen area,
 *    keyframe crossfade pairing, greedy collision placement.
 *
 * No DOM, no MapLibre; unit-tested in tests/time-scene/territory.test.ts.
 */
type Pos = readonly number[];
type Ring = readonly Pos[];
type Polygon = readonly Ring[];

export interface PoleResult {
  x: number;
  y: number;
  /** Distance to the nearest edge (inscribed-circle radius); 0 for degenerate polygons. */
  r: number;
}

/* ------------------------------------------------------------------ */
/* polylabel                                                           */
/* ------------------------------------------------------------------ */

function segDistSq(px: number, py: number, a: Pos, b: Pos): number {
  let x = a[0] ?? 0;
  let y = a[1] ?? 0;
  let dx = (b[0] ?? 0) - x;
  let dy = (b[1] ?? 0) - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0] ?? 0;
      y = b[1] ?? 0;
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = px - x;
  dy = py - y;
  return dx * dx + dy * dy;
}

/** Signed distance from a point to the polygon outline: positive inside, negative outside (holes count as outside). */
export function signedDistance(x: number, y: number, polygon: Polygon): number {
  let inside = false;
  let minSq = Infinity;
  for (const ring of polygon) {
    for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
      const a = ring[i]!;
      const b = ring[j]!;
      const ay = a[1] ?? 0;
      const by = b[1] ?? 0;
      if (ay > y !== by > y && x < (((b[0] ?? 0) - (a[0] ?? 0)) * (y - ay)) / (by - ay) + (a[0] ?? 0)) inside = !inside;
      minSq = Math.min(minSq, segDistSq(x, y, a, b));
    }
  }
  return minSq === 0 || !Number.isFinite(minSq) ? 0 : (inside ? 1 : -1) * Math.sqrt(minSq);
}

interface Cell {
  x: number;
  y: number;
  h: number;
  d: number;
  max: number;
}

const cell = (x: number, y: number, h: number, polygon: Polygon): Cell => {
  const d = signedDistance(x, y, polygon);
  return { x, y, h, d, max: d + h * Math.SQRT2 };
};

/** Max-heap on `max`. */
class CellQueue {
  private items: Cell[] = [];
  get size() {
    return this.items.length;
  }
  push(c: Cell) {
    const a = this.items;
    a.push(c);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p]!.max >= a[i]!.max) break;
      [a[p], a[i]] = [a[i]!, a[p]!];
      i = p;
    }
  }
  pop(): Cell | undefined {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0 && last) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l]!.max > a[m]!.max) m = l;
        if (r < a.length && a[r]!.max > a[m]!.max) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i]!, a[m]!];
        i = m;
      }
    }
    return top;
  }
}

function centroidCell(polygon: Polygon): Cell {
  const ring = polygon[0] ?? [];
  let area = 0;
  let x = 0;
  let y = 0;
  for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
    const a = ring[i]!;
    const b = ring[j]!;
    const f = (a[0] ?? 0) * (b[1] ?? 0) - (b[0] ?? 0) * (a[1] ?? 0);
    x += ((a[0] ?? 0) + (b[0] ?? 0)) * f;
    y += ((a[1] ?? 0) + (b[1] ?? 0)) * f;
    area += f * 3;
  }
  const first = ring[0];
  if (area === 0) return cell(first?.[0] ?? 0, first?.[1] ?? 0, 0, polygon);
  return cell(x / area, y / area, 0, polygon);
}

/**
 * Pole of inaccessibility of `polygon` (outer ring first, then holes) to
 * within `precision` (same units as the coordinates; default 1/150 of the
 * larger bbox side). `maxProbes` bounds the work on very detailed outlines.
 */
export function polylabel(polygon: Polygon, precision?: number, maxProbes = 6000): PoleResult {
  const outer = polygon[0] ?? [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of outer) {
    const x = p[0] ?? 0;
    const y = p[1] ?? 0;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, r: 0 };
  const width = maxX - minX;
  const height = maxY - minY;
  const eps = precision ?? Math.max(width, height) / 150;
  const size = Math.min(width, height);
  if (!(size > 0) || !(eps > 0)) return { x: minX + width / 2, y: minY + height / 2, r: 0 };

  const queue = new CellQueue();
  let best = centroidCell(polygon);
  const box = cell(minX + width / 2, minY + height / 2, 0, polygon);
  if (box.d > best.d) best = box;
  let probes = 2;
  const consider = (x: number, y: number, h: number) => {
    const c = cell(x, y, h, polygon);
    probes++;
    if (c.max > best.d + eps) queue.push(c);
    if (c.d > best.d) best = c;
  };
  // Cover the bbox with square cells of the shorter side (thin shapes get a row of them).
  const h0 = size / 2;
  for (let x = minX; x < maxX; x += size) for (let y = minY; y < maxY; y += size) consider(x + h0, y + h0, h0);
  while (queue.size > 0 && probes < maxProbes) {
    const c = queue.pop()!;
    if (c.max - best.d <= eps) break;
    const h = c.h / 2;
    consider(c.x - h, c.y - h, h);
    consider(c.x + h, c.y - h, h);
    consider(c.x - h, c.y + h, h);
    consider(c.x + h, c.y + h, h);
  }
  return { x: best.x, y: best.y, r: Math.max(0, best.d) };
}

/* ------------------------------------------------------------------ */
/* Web Mercator in degree units                                        */
/* ------------------------------------------------------------------ */

const MAX_LAT = 85.0511;
const DEG = 180 / Math.PI;

/** Mercator y of a latitude, scaled so one unit = one degree of longitude at the equator. */
export function mercY(lat: number): number {
  const phi = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat)) / DEG;
  return DEG * Math.log(Math.tan(Math.PI / 4 + phi / 2));
}

export function latOfMercY(y: number): number {
  return DEG * (2 * Math.atan(Math.exp(y / DEG)) - Math.PI / 2);
}

/** Screen px per Mercator degree unit at `zoom` (512 px world). */
export function pxPerUnit(zoom: number): number {
  return (512 * 2 ** zoom) / 360;
}

function ringArea(ring: Ring): number {
  let a = 0;
  for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++) a += ((ring[j]![0] ?? 0) - (ring[i]![0] ?? 0)) * ((ring[j]![1] ?? 0) + (ring[i]![1] ?? 0));
  return Math.abs(a / 2);
}

/** Drop vertices closer than `tol` to the last kept one (keeps the ring closed); polylabel only needs the rough outline. */
function thin(ring: Ring, tol: number): Pos[] {
  if (ring.length <= 8 || !(tol > 0)) return ring as Pos[];
  const out: Pos[] = [ring[0]!];
  const tolSq = tol * tol;
  for (let i = 1; i < ring.length - 1; i++) {
    const p = ring[i]!;
    const q = out[out.length - 1]!;
    const dx = (p[0] ?? 0) - (q[0] ?? 0);
    const dy = (p[1] ?? 0) - (q[1] ?? 0);
    if (dx * dx + dy * dy >= tolSq) out.push(p);
  }
  out.push(ring[ring.length - 1]!);
  return out.length >= 4 ? out : (ring as Pos[]);
}

/**
 * Anchor, inscribed radius and area of a feature's largest polygon. The
 * numbers live in a Float64Array: Chromium 153 was seen handing back another
 * object's double for a plain numeric field of these long-lived, cached
 * objects (an engine field-representation bug); typed-array storage is
 * copied by value and immune.
 */
export class LabelGeometry {
  /** Anchor in lng/lat (pole of inaccessibility of the largest polygon). */
  readonly at: [number, number];
  /** That polygon in Mercator units, thinned (for testing other spots inside it). */
  readonly poly: Pos[][];
  private readonly v: Float64Array;
  constructor(mx: number, my: number, r: number, area: number, poly: Pos[][]) {
    this.v = Float64Array.of(mx, my, r, area);
    this.at = [mx, latOfMercY(my)];
    this.poly = poly;
  }
  /** Anchor in Mercator units (for lerps and screen distances). */
  get mx(): number {
    return this.v[0]!;
  }
  get my(): number {
    return this.v[1]!;
  }
  /** Inscribed-circle radius in Mercator units. */
  get r(): number {
    return this.v[2]!;
  }
  /** Area of the largest polygon (outer minus holes) in Mercator units². */
  get area(): number {
    return this.v[3]!;
  }
}

/** Polygons smaller than this (Mercator units², ~ a 0.3° square) take the centroid instead of the full search. */
const TINY_AREA = 0.1;

/** Pole, radius and area of one polygon already in Mercator units. */
function geometryOfPolygon(merc: Pos[][], area: number): LabelGeometry {
  if (area < TINY_AREA) {
    const c = centroidCell(merc);
    // Tiny polygons are never labelled by area anyway; an equal-area circle is close enough for the radius.
    return new LabelGeometry(c.x, c.y, Math.sqrt(area / Math.PI) * 0.7, area, merc);
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of merc[0]!) {
    minX = Math.min(minX, p[0]!);
    maxX = Math.max(maxX, p[0]!);
    minY = Math.min(minY, p[1]!);
    maxY = Math.max(maxY, p[1]!);
  }
  const precision = Math.max(maxX - minX, maxY - minY) / 150;
  const poly = merc.map((ring) => thin(ring, precision / 3));
  const pole = polylabel(poly, precision);
  return new LabelGeometry(pole.x, pole.y, pole.r, area, poly);
}

/**
 * Label geometry of a feature's polygons, largest first: the largest, then
 * up to `max - 1` more that are at least `share` of its area (an empire's
 * home island when its largest polygon is off screen). Mercator units.
 */
export function labelGeometries(polygons: readonly Polygon[], max = 6, share = 0.02): LabelGeometry[] {
  const all: { merc: Pos[][]; area: number }[] = [];
  for (const poly of polygons) {
    if (!poly[0] || poly[0].length < 4) continue;
    const merc = poly.map((ring) => ring.map((p) => [p[0] ?? 0, mercY(p[1] ?? 0)]));
    const area = merc.reduce((sum, ring, i) => sum + (i === 0 ? 1 : -1) * ringArea(ring), 0);
    if (area > 0) all.push({ merc, area });
  }
  all.sort((a, b) => b.area - a.area);
  const largest = all[0]?.area ?? 0;
  return all
    .filter((p, i) => i === 0 || (p.area >= largest * share && p.area >= TINY_AREA))
    .slice(0, max)
    .map((p) => geometryOfPolygon(p.merc, p.area));
}

/** Anchor, inscribed radius and area of a feature's largest polygon, in Mercator units. Null for empty geometry. */
export function labelGeometry(polygons: readonly Polygon[]): LabelGeometry | null {
  return labelGeometries(polygons, 1)[0] ?? null;
}

/** Unit directions to try, sideways first (labels are wide). */
const D = Math.SQRT1_2;
const DIRECTIONS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [D, D],
  [-D, D],
  [D, -D],
  [-D, -D],
  [0, 1],
  [0, -1],
];

/**
 * Other spots inside the polygon, in Mercator offsets from the pole, where a
 * label needing `need` units of clearance still fits: rings at ½, 1, 1½, 2 and
 * 3 inscribed radii in eight directions, nearest first. Used when the pole's
 * spot is covered (a HUD panel, a leader placard, another name).
 */
export function alternativeSpots(g: Pick<LabelGeometry, 'mx' | 'my' | 'r' | 'poly'>, need: number): { dx: number; dy: number }[] {
  const out: { dx: number; dy: number }[] = [];
  if (!(g.r > 0)) return out;
  for (const k of [0.5, 1, 1.5, 2, 3]) {
    for (const [ux, uy] of DIRECTIONS) {
      const dx = ux * k * g.r;
      const dy = uy * k * g.r;
      if (signedDistance(g.mx + dx, g.my + dy, g.poly) >= need) out.push({ dx, dy });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

export interface Bilingual {
  en: string;
  zh: string;
}

/** Strip a trailing parenthetical (ASCII or full-width) and spaces. */
export function shortName(s: string): string {
  const out = s.replace(/\s*[(（][^()（）]*[)）]\s*$/u, '').trim();
  return out || s.trim();
}

/** Map text of a control feature: its `label` (short form), else the holder entity's name. */
export function labelText(label: Bilingual | undefined, holderName: Bilingual | undefined): Bilingual | null {
  const src = label ?? holderName;
  if (!src) return null;
  return { en: shortName(src.en), zh: shortName(src.zh) };
}

/* ------------------------------------------------------------------ */
/* Tiers                                                               */
/* ------------------------------------------------------------------ */

export type Tier = 1 | 2 | 3;

/** Minimum on-screen area (px²) per tier, largest first; below the last no label. */
export const TIER_MIN_AREA: Record<Tier, number> = {
  1: 140_000,
  2: 40_000,
  3: 9_000,
};

/** Size tier for an on-screen area (px²); null below the smallest threshold. */
export function tierFor(areaPx: number, thresholds: Record<Tier, number> = TIER_MIN_AREA): Tier | null {
  if (areaPx >= thresholds[1]) return 1;
  if (areaPx >= thresholds[2]) return 2;
  if (areaPx >= thresholds[3]) return 3;
  return null;
}

/* ------------------------------------------------------------------ */
/* Crossfade pairing                                                   */
/* ------------------------------------------------------------------ */

export interface FadeCandidate {
  key: string;
  holder: string;
  /** Same text in both keyframes is required for a pair. */
  text: string;
  /** Screen position (px). */
  x: number;
  y: number;
}

export interface FadePair<C> {
  prev: C | null;
  next: C | null;
}

/**
 * Match outgoing and incoming labels during a keyframe crossfade: the same
 * holder with the same text whose anchors are less than `maxPx` apart become
 * one label that moves (lerp) instead of two that fade. Each label pairs at
 * most once, closest first. `samePlace` may pair farther ones too (the
 * controller passes "each anchor lies inside the other's area": the same
 * territory reshaped, so the label glides). Unpaired labels come back alone.
 */
export function pairCrossfade<C extends FadeCandidate>(prev: readonly C[], next: readonly C[], maxPx = 40, samePlace?: (a: C, b: C) => boolean): FadePair<C>[] {
  const options: { i: number; j: number; d: number }[] = [];
  prev.forEach((a, i) =>
    next.forEach((b, j) => {
      if (a.holder !== b.holder || a.text !== b.text) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < maxPx || samePlace?.(a, b)) options.push({ i, j, d });
    }),
  );
  options.sort((a, b) => a.d - b.d);
  const usedP = new Set<number>();
  const usedN = new Set<number>();
  const out: FadePair<C>[] = [];
  for (const o of options) {
    if (usedP.has(o.i) || usedN.has(o.j)) continue;
    usedP.add(o.i);
    usedN.add(o.j);
    out.push({ prev: prev[o.i]!, next: next[o.j]! });
  }
  prev.forEach((a, i) => {
    if (!usedP.has(i)) out.push({ prev: a, next: null });
  });
  next.forEach((b, j) => {
    if (!usedN.has(j)) out.push({ prev: null, next: b });
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* Placement                                                           */
/* ------------------------------------------------------------------ */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlaceCandidate {
  key: string;
  text: string;
  /** Label centre (px). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Higher first (screen area). */
  priority: number;
  /** Other centres to try, in order, when (x, y) is taken (computed only then). */
  alternatives?: () => { x: number; y: number }[];
}

const overlaps = (a: Box, b: Box, pad: number) => a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;

/**
 * Greedy placement in priority order: a label is kept when its box lies inside
 * `stage` (minus `margin`), clears every obstacle (leader placards, HUD panels)
 * and every label already kept (`pad` px apart), and no kept label with the same
 * text is within `sameTextPx`; when its own spot is taken, its `alternatives`
 * are tried in order (`alt` = index used, -1 for its own spot). At most `cap`
 * labels.
 */
export function placeLabels<C extends PlaceCandidate>(
  candidates: readonly C[],
  opts: {
    stage: { w: number; h: number };
    obstacles: readonly Box[];
    cap: number;
    pad?: number;
    margin?: number;
    sameTextPx?: number;
  },
): (C & { at: { x: number; y: number }; alt: number })[] {
  const pad = opts.pad ?? 6;
  const margin = opts.margin ?? 4;
  const sameText = opts.sameTextPx ?? 260;
  const kept: (C & { at: { x: number; y: number }; alt: number })[] = [];
  const boxes: Box[] = [];
  const free = (c: C, x: number, y: number): Box | null => {
    const box = { x: x - c.w / 2, y: y - c.h / 2, w: c.w, h: c.h };
    if (box.x < margin || box.y < margin || box.x + box.w > opts.stage.w - margin || box.y + box.h > opts.stage.h - margin) return null;
    if (opts.obstacles.some((o) => overlaps(box, o, pad))) return null;
    if (boxes.some((o) => overlaps(box, o, pad))) return null;
    return box;
  };
  for (const c of [...candidates].sort((a, b) => b.priority - a.priority)) {
    if (kept.length >= opts.cap) break;
    if (kept.some((k) => k.text === c.text && Math.hypot(k.at.x - c.x, k.at.y - c.y) < sameText)) continue;
    let at = { x: c.x, y: c.y };
    let alt = -1;
    let box = free(c, c.x, c.y);
    if (!box && c.alternatives) {
      for (const [i, spot] of c.alternatives().entries()) {
        box = free(c, spot.x, spot.y);
        if (box) {
          at = spot;
          alt = i;
          break;
        }
      }
    }
    if (!box) continue;
    kept.push({ ...c, at, alt });
    boxes.push(box);
  }
  return kept;
}

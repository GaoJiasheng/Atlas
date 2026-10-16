/**
 * Regional plate (`topic.basemap.region`, docs/06 "TimeScene" · 区域底图): the
 * stage is one region printed on the sheet, not a window on the world. The
 * plate's `bounds` hold its land; around them the sheet is plain paper (the
 * frame, drawn over the map layers) with a hairline neat line on the edge. The
 * camera limit is `maxBounds` widened to the stage's aspect ratio
 * (`aspectBounds`): zoomed all the way out the whole plate fits with paper
 * around it, and no zoom or pan reaches past the sheet to the world. Pure;
 * unit-tested in tests/time-scene/region.test.ts.
 */
import type { Feature, FeatureCollection } from 'geojson';
import type { LngLatBox, RegionBasemap } from '../../../content/schema/topic';
import type { LngLat } from './geo';

/** Default camera margin around the plate: this share of its span on each side. */
export const REGION_MARGIN = 0.08;

/** The camera limit: `maxBounds`, else `bounds` widened by REGION_MARGIN (clamped to the Mercator world). */
export function regionMaxBounds(region: Pick<RegionBasemap, 'bounds' | 'maxBounds'>): LngLatBox {
  if (region.maxBounds) return region.maxBounds;
  const [w, s, e, n] = region.bounds;
  const dx = (e - w) * REGION_MARGIN;
  const dy = (n - s) * REGION_MARGIN;
  const r = (v: number) => Math.round(v * 1000) / 1000;
  return [r(Math.max(-180, w - dx)), r(Math.max(-85, s - dy)), r(Math.min(180, e + dx)), r(Math.min(85, n + dy))];
}

const DEG = 180 / Math.PI;
const mercY = (lat: number) => DEG * Math.log(Math.tan(Math.PI / 4 + Math.max(-85, Math.min(85, lat)) / DEG / 2));
const latOf = (y: number) => DEG * (2 * Math.atan(Math.exp(y / DEG)) - Math.PI / 2);

/**
 * `box` widened (never narrowed) about its centre, in Mercator, to the aspect
 * ratio `width : height` of the stage, clamped to the Mercator world. MapLibre
 * keeps the viewport inside its `maxBounds`, so this is the camera limit at
 * which the whole `box` still fits on screen.
 */
export function aspectBounds(box: LngLatBox, width: number, height: number): LngLatBox {
  const [w, s, e, n] = box;
  if (!(width > 0 && height > 0)) return box;
  const x0 = w;
  const x1 = e;
  const y0 = mercY(s);
  const y1 = mercY(n);
  const want = width / height;
  let dx = x1 - x0;
  let dy = y1 - y0;
  if (dx / dy < want) dx = dy * want;
  else dy = dx / want;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const r = (v: number) => Math.round(v * 1000) / 1000;
  return [r(Math.max(-180, cx - dx / 2)), r(Math.max(-85, latOf(cy - dy / 2))), r(Math.min(180, cx + dx / 2)), r(Math.min(85, latOf(cy + dy / 2)))];
}

const ring = ([w, s, e, n]: LngLatBox, ccw: boolean): LngLat[] =>
  ccw ? [[w, s], [e, s], [e, n], [w, n], [w, s]] : [[w, s], [w, n], [e, n], [e, s], [w, s]];

/**
 * The sheet around the plate: a `kind: frame` polygon over the whole Mercator
 * world with the plate cut out (hole = `bounds`, RFC 7946 winding), and the
 * `kind: edge` neat line along `bounds`.
 */
export function regionFrame(region: Pick<RegionBasemap, 'bounds'>): FeatureCollection {
  const outer: LngLatBox = [-180, -85, 180, 85];
  const features: Feature[] = [
    { type: 'Feature', properties: { kind: 'frame' }, geometry: { type: 'Polygon', coordinates: [ring(outer, true), ring(region.bounds, false)] } },
    { type: 'Feature', properties: { kind: 'edge' }, geometry: { type: 'LineString', coordinates: ring(region.bounds, true) } },
  ];
  return { type: 'FeatureCollection', features };
}

/** Graticule spacing for a plate: 5° for a region up to 60° across, else 10°. */
export function graticuleStep([w, s, e, n]: LngLatBox): number {
  return Math.max(e - w, n - s) <= 60 ? 5 : 10;
}

/** Graticule lines inside the plate only (meridians and parallels on multiples of the step). */
export function regionGraticule(bounds: LngLatBox): FeatureCollection {
  const [w, s, e, n] = bounds;
  const step = graticuleStep(bounds);
  const features: Feature[] = [];
  const line = (coordinates: LngLat[]): Feature => ({ type: 'Feature', properties: { major: false }, geometry: { type: 'LineString', coordinates } });
  for (let lon = Math.ceil(w / step) * step; lon <= e; lon += step) if (lon > w && lon < e) features.push(line([[lon, s], [lon, n]]));
  for (let lat = Math.ceil(s / step) * step; lat <= n; lat += step) {
    if (lat <= s || lat >= n) continue;
    const coords: LngLat[] = [];
    // Parallels are straight in Mercator: two points do, but a few more keep MapLibre's tiling honest.
    for (let k = 0; k <= 4; k++) coords.push([w + ((e - w) * k) / 4, lat]);
    features.push(line(coords));
  }
  return { type: 'FeatureCollection', features };
}

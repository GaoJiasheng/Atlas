/**
 * The GeoStage's MapLibre style, built from the theme tokens and the topic's
 * basemap: base land (Natural Earth 1:50m, or the regional plate's own land),
 * the regional 1:10m Southeast Asia land, the island-scale land
 * (`basemap.local`), the regional plate's rivers and sheet
 * (`basemap.region`), then the data layers (control, participation,
 * reference, movements, events, sites). Pure: no DOM, no MapLibre runtime, so
 * the style is unit-tested (tests/time-scene/geo-style.test.ts); the
 * controller (controller.ts) builds it once and re-applies its paint on a theme
 * change.
 */
import type { ExpressionSpecification, FilterSpecification, LayerSpecification, StyleSpecification } from 'maplibre-gl';
import type { Feature, FeatureCollection } from 'geojson';
import { BASE_LAYER_IDS, buildMapStyle } from '../../../../theme/map-style';
import type { ThemeTokens } from '../../../../theme/theme';
import type { RegionBasemap } from '../../../../content/schema/topic';
import type { LngLat } from '../../lib/geo';
import { regionFrame } from '../../lib/region';
import { localLandFilter } from '../../lib/localLand';

/* ------------------------------------------------------------------ */
/* Ids and constants                                                   */
/* ------------------------------------------------------------------ */

export const SRC = {
  prev: 'ts-control-prev',
  next: 'ts-control-next',
  participation: 'ts-participation',
  borders: 'ts-borders-mesh',
  graticule: 'ts-graticule',
  reference: 'ts-reference',
  movements: 'ts-movements',
  events: 'ts-events',
  sites: 'ts-sites',
} as const;

/** The regional plate's own sources (`basemap.region`): the river lines and the sheet around the plate. */
export const REGION = {
  rivers: 'ts-rivers',
  frame: 'ts-frame',
  riverLine: 'ts-rivers-line',
  riverRec: 'ts-rivers-rec',
  frameFill: 'ts-frame-fill',
  frameEdge: 'ts-frame-edge',
} as const;

export const LAYER = {
  graticule: 'ts-graticule',
  prevFill: 'ts-control-prev-fill',
  prevHatch: 'ts-control-prev-hatch',
  prevLine: 'ts-control-prev-line',
  /** The frontier along `certainty: approximate` areas, dashed. */
  prevDash: 'ts-control-prev-dash',
  nextFill: 'ts-control-next-fill',
  nextHatch: 'ts-control-next-hatch',
  nextLine: 'ts-control-next-line',
  nextDash: 'ts-control-next-dash',
  partFill: 'ts-participation-fill',
  partLine: 'ts-participation-line',
  borders: 'ts-borders',
  reference: 'ts-reference-line',
  moveTrail: 'ts-movements-trail',
  moveLine: 'ts-movements-line',
  eventRing: 'ts-events-ring',
  eventDot: 'ts-events-dot',
  /** Invisible hit targets under the site markers (HTML). */
  siteHit: 'ts-sites-hit',
} as const;

/** Scene layer id (LayerToggles) -> map layers it shows. `base` is always on. */
export const GROUPS: Record<string, string[]> = {
  control: [LAYER.prevFill, LAYER.prevHatch, LAYER.prevLine, LAYER.prevDash, LAYER.nextFill, LAYER.nextHatch, LAYER.nextLine, LAYER.nextDash],
  participation: [LAYER.partFill, LAYER.partLine],
  borders: [LAYER.borders],
  movements: [LAYER.moveTrail, LAYER.moveLine],
  battles: [LAYER.eventRing, LAYER.eventDot],
  sites: [LAYER.siteHit],
};

/**
 * Regional 1:10m land (Southeast Asia, `public/geo/land-10m-sea.json`, built by
 * scripts/build-geo.ts): close-ups of Singapore and Johor (zoom 9-11) need more
 * than the 1:50m coastline. Drawn from zoom 7 and fully at 8 above the 50m land:
 * the box (`frame`) fades in in the water colour and hides the 50m land under
 * it, the 10m land and coastline sit on top. Fetched only once the camera is at
 * zoom >= 6.5 over the box, so other topics never load it.
 */
export const HI = { src: 'ts-land-hi', mask: 'ts-land-hi-mask', fill: 'ts-land-hi-fill', edge: 'ts-land-hi-edge' } as const;
export const HI_BBOX: [number, number, number, number] = [95, -9, 125, 22];
export const HI_MIN_ZOOM = 7;
export const HI_LOAD_ZOOM = 6.5;

export function hiResLayers(tk: ThemeTokens): LayerSpecification[] {
  const fade: ExpressionSpecification = ['interpolate', ['linear'], ['zoom'], HI_MIN_ZOOM, 0, HI_MIN_ZOOM + 1, 1];
  const kind = (k: string): FilterSpecification => ['==', ['get', 'kind'], k];
  return [
    { id: HI.mask, type: 'fill', source: HI.src, minzoom: HI_MIN_ZOOM, filter: kind('frame'), paint: { 'fill-color': tk.water || '#dde2df', 'fill-opacity': fade, 'fill-antialias': false } },
    { id: HI.fill, type: 'fill', source: HI.src, minzoom: HI_MIN_ZOOM, filter: kind('land'), paint: { 'fill-color': tk.land || '#e1dbcc', 'fill-antialias': true } },
    { id: HI.edge, type: 'line', source: HI.src, minzoom: HI_MIN_ZOOM, filter: kind('coast'), paint: { 'line-color': tk['land-edge'] || 'rgba(42, 40, 36, 0.3)', 'line-width': 1.2, 'line-opacity': fade } },
  ];
}

/**
 * Island-scale land (`topic.basemap.local`, e.g. `public/geo/land-sg.json`
 * from URA planning areas, scripts/geo/lib/local-land.ts): drawn above the
 * 1:10m land from zoom 9.4, fully at 9.6. Its `mask` geometry (the coarse
 * polygons it replaces, buffered) fades in in the water colour, its `land`
 * is filled and stroked as the coast; dated land (lib/localLand.ts) is
 * re-filtered by the controller to the one era at the playhead. An optional
 * `coast-today` line is today's coastline as a dashed ink reference (it
 * follows the names switch, N). Fetched once the map has loaded, only for
 * topics that set it; the map may then zoom to `basemap.maxZoom`.
 */
export const LOCAL = { src: 'ts-land-local', mask: 'ts-land-local-mask', fill: 'ts-land-local-fill', edge: 'ts-land-local-edge', today: 'ts-land-local-today' } as const;
export const LOCAL_MIN_ZOOM = 9.4;
/** A short fade: in between, two coastlines at half strength read as a ghosted double edge. */
export const LOCAL_FADE = 0.2;
/** Default map zoom ceiling (world to one island); `basemap.maxZoom` raises it. */
export const MAX_ZOOM = 10;

/** Today's coastline over a dated island coast (`kind: coast-today`): ink at this opacity, 0.8 px, dash [2, 2]. */
export const COAST_TODAY = { opacity: 0.35, width: 0.8, dash: [2, 2] } as const;

export function localLandLayers(tk: ThemeTokens): LayerSpecification[] {
  const fade: ExpressionSpecification = ['interpolate', ['linear'], ['zoom'], LOCAL_MIN_ZOOM, 0, LOCAL_MIN_ZOOM + LOCAL_FADE, 1];
  const kind = (k: string): FilterSpecification => ['==', ['get', 'kind'], k];
  return [
    { id: LOCAL.mask, type: 'fill', source: LOCAL.src, minzoom: LOCAL_MIN_ZOOM, filter: kind('mask'), paint: { 'fill-color': tk.water || '#dde2df', 'fill-opacity': fade, 'fill-antialias': false } },
    { id: LOCAL.fill, type: 'fill', source: LOCAL.src, minzoom: LOCAL_MIN_ZOOM, filter: localLandFilter(null), paint: { 'fill-color': tk.land || '#e1dbcc', 'fill-opacity': fade, 'fill-antialias': true } },
    { id: LOCAL.edge, type: 'line', source: LOCAL.src, minzoom: LOCAL_MIN_ZOOM, filter: localLandFilter(null), paint: { 'line-color': tk['land-edge'] || 'rgba(42, 40, 36, 0.3)', 'line-width': 1.2, 'line-opacity': fade } },
    {
      id: LOCAL.today,
      type: 'line',
      source: LOCAL.src,
      minzoom: LOCAL_MIN_ZOOM,
      filter: kind('coast-today'),
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': tk.ink || '#2a2824',
        'line-width': COAST_TODAY.width,
        'line-opacity': ['interpolate', ['linear'], ['zoom'], LOCAL_MIN_ZOOM, 0, LOCAL_MIN_ZOOM + LOCAL_FADE, COAST_TODAY.opacity],
        'line-dasharray': [...COAST_TODAY.dash],
      },
    },
  ];
}

/** REFERENCE fade-in / fade-out of the adjacent keyframe's outlines (ms). */
export const REFERENCE_MS = 2000;
/** Dash of an approximate frontier (line widths). */
export const APPROX_DASH = [3, 2];

/** Flowing dash: the classic stepped dasharray sequence (~12 fps). */
export const DASH_SEQUENCE: number[][] = [
  [0, 4, 3],
  [0.5, 4, 2.5],
  [1, 4, 2],
  [1.5, 4, 1.5],
  [2, 4, 1],
  [2.5, 4, 0.5],
  [3, 4, 0],
  [0, 0.5, 3, 3.5],
  [0, 1, 3, 3],
  [0, 1.5, 3, 2.5],
  [0, 2, 3, 2],
  [0, 2.5, 3, 1.5],
  [0, 3, 3, 1],
  [0, 3.5, 3, 0.5],
];
export const DASH_STEP_MS = 83;

export const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

/** 10° graticule as GeoJSON lines (meridians to ±80°, parallels −80…80). */
export function graticule(): FeatureCollection {
  const features: Feature[] = [];
  const line = (coordinates: LngLat[], major: boolean): Feature => ({
    type: 'Feature',
    properties: { major },
    geometry: { type: 'LineString', coordinates },
  });
  for (let lon = -180; lon < 180; lon += 10) features.push(line([[lon, -80], [lon, 80]], lon === 0));
  for (let lat = -80; lat <= 80; lat += 10) {
    const coords: LngLat[] = [];
    for (let lon = -180; lon <= 180; lon += 10) coords.push([lon, lat]);
    features.push(line(coords, lat === 0));
  }
  return { type: 'FeatureCollection', features };
}

/* ------------------------------------------------------------------ */
/* Style                                                               */
/* ------------------------------------------------------------------ */

/** Data layers on top of the base map. Paint is token-driven; re-applied on theme change. */
export function dataLayers(tk: ThemeTokens): LayerSpecification[] {
  const ink = tk.ink || '#2a2824';
  const control = (source: string, fill: string, hatch: string, line: string, dash: string): LayerSpecification[] => [
    { id: fill, type: 'fill', source, paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0, 'fill-antialias': false } },
    { id: hatch, type: 'fill', source, paint: { 'fill-pattern': ['get', 'pattern'], 'fill-opacity': 0 } },
    {
      id: line,
      type: 'line',
      source,
      filter: ['!=', ['get', 'dash'], true],
      layout: { 'line-join': 'round' },
      // Colour and width come with the feature: the frontier between holders is one ink hairline (`--line`, 0.8 px);
      // control data without topology has no frontier, so its polygons are outlined in their holder's colour (heavier when highlighted).
      paint: { 'line-color': ['get', 'lc'], 'line-width': ['get', 'lw'], 'line-opacity': 0 },
    },
    {
      // The same, dashed, where an area is only approximately known (`certainty: approximate`).
      id: dash,
      type: 'line',
      source,
      filter: ['==', ['get', 'dash'], true],
      layout: { 'line-join': 'round' },
      paint: { 'line-color': ['get', 'lc'], 'line-width': ['get', 'lw'], 'line-opacity': 0, 'line-dasharray': APPROX_DASH },
    },
  ];
  return [
    {
      id: LAYER.graticule,
      type: 'line',
      source: SRC.graticule,
      paint: {
        'line-color': ink,
        'line-width': 0.5,
        'line-opacity': ['case', ['get', 'major'], 0.4, 0.22],
      },
    },
    {
      id: LAYER.borders,
      type: 'line',
      source: SRC.borders,
      layout: { visibility: 'none', 'line-join': 'round' },
      paint: { 'line-color': ink, 'line-opacity': 0.4, 'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.4, 6, 0.9] },
    },
    ...control(SRC.prev, LAYER.prevFill, LAYER.prevHatch, LAYER.prevLine, LAYER.prevDash),
    ...control(SRC.next, LAYER.nextFill, LAYER.nextHatch, LAYER.nextLine, LAYER.nextDash),
    {
      id: LAYER.partFill,
      type: 'fill',
      source: SRC.participation,
      paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['*', 0.3, ['get', 'flash']] },
    },
    {
      id: LAYER.partLine,
      type: 'line',
      source: SRC.participation,
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['+', ['case', ['get', 'hl'], 1.6, 1], ['*', 2, ['get', 'flash']]],
        'line-opacity': 0.9,
      },
    },
    {
      id: LAYER.reference,
      type: 'line',
      source: SRC.reference,
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': ink,
        'line-width': 1.2,
        'line-dasharray': [4, 3],
        'line-opacity': 0,
        'line-opacity-transition': { duration: REFERENCE_MS, delay: 0 },
      },
    },
    {
      id: LAYER.moveTrail,
      type: 'line',
      source: SRC.movements,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': ['get', 'color'], 'line-width': ['get', 'width'], 'line-opacity': ['*', 0.3, ['get', 'op']] },
    },
    {
      id: LAYER.moveLine,
      type: 'line',
      source: SRC.movements,
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['get', 'width'],
        'line-opacity': ['get', 'op'],
        'line-dasharray': DASH_SEQUENCE[0] as number[],
      },
    },
    {
      id: LAYER.eventRing,
      type: 'circle',
      source: SRC.events,
      paint: {
        'circle-radius': ['get', 'r'],
        'circle-color': tk.paper || '#e9e4d8',
        // `o` is 0 for square-marked kinds: the circle stays as the click target only.
        'circle-opacity': ['*', 0.55, ['get', 'o']],
        'circle-stroke-color': ['get', 'stroke'],
        'circle-stroke-width': ['get', 'sw'],
        'circle-stroke-opacity': ['get', 'o'],
      },
    },
    {
      id: LAYER.eventDot,
      type: 'circle',
      source: SRC.events,
      paint: {
        'circle-radius': ['get', 'dot'],
        'circle-color': ['get', 'color'],
        'circle-opacity': ['get', 'o'],
      },
    },
    {
      id: LAYER.siteHit,
      type: 'circle',
      source: SRC.sites,
      layout: { visibility: 'none' },
      paint: { 'circle-radius': 7, 'circle-color': ink, 'circle-opacity': 0, 'circle-stroke-width': 0 },
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Regional plate: rivers and the sheet around it                      */
/* ------------------------------------------------------------------ */

/** Filter of a river layer: the courses in `ids` (the ones that exist at `t`), solid or reconstructed (dashed). */
export function riverFilter(ids: readonly string[], reconstructed: boolean): FilterSpecification {
  return ['all', ['==', ['get', 'rec'], reconstructed], ['in', ['get', 'id'], ['literal', [...ids]]]];
}

/** River hairlines (above the land, under the data): solid courses, and reconstructed ones dashed. */
export function riverLayers(tk: ThemeTokens): LayerSpecification[] {
  const color = tk.rivers || '#86a3a8';
  const width: ExpressionSpecification = ['interpolate', ['linear'], ['zoom'], 4, 0.6, 8, 1.3];
  return [
    { id: REGION.riverLine, type: 'line', source: REGION.rivers, filter: riverFilter([], false), layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': color, 'line-width': width } },
    { id: REGION.riverRec, type: 'line', source: REGION.rivers, filter: riverFilter([], true), layout: { 'line-join': 'round' }, paint: { 'line-color': color, 'line-width': width, 'line-dasharray': [4, 2.5] } },
  ];
}

/** The sheet around the plate in the paper colour (no coastline), and the plate's neat line; over every map layer. */
export function frameLayers(tk: ThemeTokens): LayerSpecification[] {
  const kind = (k: string): FilterSpecification => ['==', ['get', 'kind'], k];
  return [
    { id: REGION.frameFill, type: 'fill', source: REGION.frame, filter: kind('frame'), paint: { 'fill-color': tk.paper || '#e9e4d8', 'fill-antialias': false } },
    { id: REGION.frameEdge, type: 'line', source: REGION.frame, filter: kind('edge'), paint: { 'line-color': tk.line || 'rgba(42, 40, 36, 0.6)', 'line-width': 0.8 } },
  ];
}

/* ------------------------------------------------------------------ */
/* The whole style                                                     */
/* ------------------------------------------------------------------ */

export interface GeoStyleOptions {
  tokens: ThemeTokens;
  /** World land (`public/geo/land-50m.json`, base-prefixed); not loaded on a regional plate. */
  landUrl: string;
  graticule: FeatureCollection;
  /** `basemap.local`: island-scale land drawn above zoom 9.4. */
  local?: string | null;
  /** `basemap.region`: a regional plate instead of the world. */
  region?: Pick<RegionBasemap, 'bounds'> | null;
}

/**
 * The style of one topic. Without `region` it is the world map (base land from
 * `landUrl`, the 1:10m Southeast Asia overlay, `local` land if set). With
 * `region` the base `land` source starts empty and is filled with the plate's
 * land once fetched (`kind: land` filled, `kind: coast` stroked, so the cut
 * edges of the plate get no coastline), there is no world land and no 1:10m
 * overlay, rivers sit above the land and the sheet covers everything outside
 * the plate.
 */
export function buildGeoStyle(options: GeoStyleOptions): StyleSpecification {
  const { tokens, region } = options;
  const local = region ? null : (options.local ?? null);
  const style = buildMapStyle({ sources: { land: region ? EMPTY : options.landUrl }, tokens, name: 'atlas-time-scene' }) as unknown as StyleSpecification;
  for (const id of Object.values(SRC)) {
    style.sources[id] = { type: 'geojson', data: id === SRC.graticule ? options.graticule : EMPTY };
  }
  // The control fills: MapLibre's default tile simplification (0.375) leaves wedges at zoom 0-3 (BC, Brazil, Italy).
  for (const id of [SRC.prev, SRC.next]) style.sources[id] = { type: 'geojson', data: EMPTY, tolerance: 0.05 };
  let regional: LayerSpecification[];
  if (region) {
    style.sources[REGION.rivers] = { type: 'geojson', data: EMPTY };
    style.sources[REGION.frame] = { type: 'geojson', data: regionFrame(region) };
    for (const layer of style.layers) {
      if (layer.id === BASE_LAYER_IDS.land) (layer as { filter?: FilterSpecification }).filter = ['==', ['get', 'kind'], 'land'];
      if (layer.id === BASE_LAYER_IDS.landEdge) (layer as { filter?: FilterSpecification }).filter = ['==', ['get', 'kind'], 'coast'];
    }
    regional = riverLayers(tokens);
  } else {
    style.sources[HI.src] = { type: 'geojson', data: EMPTY };
    regional = [...hiResLayers(tokens), ...(local ? localLandLayers(tokens) : [])];
    if (local) style.sources[LOCAL.src] = { type: 'geojson', data: EMPTY };
  }
  style.layers.splice(style.layers.findIndex((l) => l.id === BASE_LAYER_IDS.landEdge) + 1, 0, ...regional);
  style.layers.push(...dataLayers(tokens));
  if (region) style.layers.push(...frameLayers(tokens));
  return style;
}

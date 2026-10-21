/**
 * The per-topic manifest `scripts/geo/<slug>/sources.json`: datasets, OHM
 * relation sets, georeferenced maps, keyframe recipes and the optional
 * `pipeline` block (`pipelineConfig` fills in the defaults).
 */

export interface Dataset {
  ref: string;
  title: string;
  url: string;
  file: string;
  page?: string;
  author?: string;
  license: string;
  role: string;
  /**
   * data.gov.sg dataset id (`d_…`): fetch.ts asks the data.gov.sg API
   * (`poll-download`) for the current signed download link instead of using
   * `url`, which stays the human-readable dataset page.
   */
  datagov?: string;
  /**
   * Overpass QL (OpenStreetMap, ODbL): fetch.ts posts it to the Overpass API
   * at build time, keeps the response as `<file>.osm.json` and writes the
   * osmtogeojson conversion to `file` (GeoJSON, read by the `geojson` selector).
   */
  overpass?: string;
}

export interface ControlPoint {
  name: string;
  /** Known position [lng, lat] (decimal degrees, WGS84). */
  lnglat: [number, number];
  /** Position on the source map: SVG user units (after all transforms), or raster pixels (x right, y down). */
  svg: [number, number];
}

export interface SvgSource {
  dataset: string;
  /** Map projection model fitted to the control points, or `auto`. */
  projection: string;
  /** Fill colour (lower-case #rrggbb) or `clip:<clipPath id>` -> class name. */
  classes: Record<string, string>;
  /** Fills that are land (the rest of the frame is sea, unless `sea` is given). */
  land: string[];
  /** Fills that are sea, for maps drawn on a land-coloured background. */
  sea?: string[];
  /** SVG-unit boxes [x0, y0, x1, y1] (legends, insets): shapes entirely inside are ignored. */
  exclude?: [number, number, number, number][];
  /** Residual budget in km (docs/09 §5.3: 30 Europe, 60 Asia-Pacific). */
  maxResidualKm: number;
  controlPoints: ControlPoint[];
  /** Use the control points of another `svg` source drawn on the same base map (same viewBox and coastline). */
  controlPointsFrom?: string;
}

/** A raster (PNG / JPG) map traced by georef-raster.ts. */
export interface RasterSource {
  dataset: string;
  projection: string;
  /** Fill colour (lower-case #rrggbb) -> class name; several colours may share a class. */
  palette: Record<string, string>;
  /** RGB distance within which a pixel matches a palette colour (anti-aliasing, JPEG noise). */
  tolerance: number;
  /** Classes that are land (`_land`), and classes that are sea (`_sea`). */
  land: string[];
  sea: string[];
  /** Pixel boxes [x0, y0, x1, y1] (legends, insets): treated as unknown and filled from around them. */
  exclude?: [number, number, number, number][];
  /**
   * Connected patches smaller than this (pixels) join the surrounding class
   * (default 12); per class as { class: px, default: px }, e.g. a high value
   * for `_sea` so lettering drawn in sea-grey inside land disappears.
   */
  minRegionPx?: number | Record<string, number>;
  maxResidualKm: number;
  controlPoints: ControlPoint[];
}

export interface OhmSet {
  date: string;
  /** relation id -> expected name (checked against the export). */
  relations: Record<string, string>;
}

/** A geometry selector used by compose.ts steps. */
export type GeomSpec =
  /** CShapes polygons of these GW codes valid on the keyframe date (or on `at`); `partsAt` keeps only the parts containing these points. */
  | { cshapes: number[]; partsAt?: [number, number][]; at?: string }
  /** An OpenHistoricalMap relation from the keyframe's OHM set (or from `set`). */
  | { ohm: number; set?: string }
  | { admin1: string; names: string[] }
  | { svg: string; class: string | string[]; coastFillKm?: number }
  | { svgFrame: string }
  | { raster: string; class: string | string[]; coastFillKm?: number }
  | { rasterFrame: string }
  /** The parts (single polygons) of a geometry that contain any of the points — or, with `drop`, all the other parts. */
  | { parts: GeomSpec; at: [number, number][]; drop?: boolean }
  | { bbox: [number, number, number, number] }
  /**
   * Features of a GeoJSON dataset (its `file` in raw/), filtered by attribute:
   * `where` keeps features whose property equals the value or one of the
   * values; `match` keeps features whose property matches the regular
   * expression (case-insensitive). Both are ANDed. URA Master Plan land use:
   * `{ "geojson": "ura-landuse", "where": { "LU_DESC": ["RESERVOIR", "WATERBODY"] } }`;
   * OpenStreetMap: `{ "geojson": "osm-water", "match": { "name": "^MacRitchie" } }`.
   */
  | { geojson: string; where?: Record<string, string | number | (string | number)[]>; match?: Record<string, string> }
  /**
   * The single polygons of `of` whose area lies at least `minShare` (default
   * 0.5) inside `within`: selects one dataset's parcels by another dataset's
   * outline without mixing their edges (URA waterbody parcels that make up the
   * OpenStreetMap polygon named "MacRitchie Reservoir").
   */
  | { overlap: GeomSpec; within: GeomSpec; minShare?: number }
  | { union: GeomSpec[] }
  | { intersect: [GeomSpec, GeomSpec] }
  | { difference: [GeomSpec, GeomSpec] };

export interface Step {
  /** Short note shown in logs and kept on the features as `note`. */
  note: string;
  holder: string;
  label?: { en: string; zh: string };
  /** Source reference ids from SOURCES.md, e.g. ["G1", "G2"]. */
  src: string[];
  from: GeomSpec;
  clip?: GeomSpec;
  minus?: GeomSpec;
}

export interface Keyframe {
  id: string;
  t: string;
  /** CShapes gwcode -> holder (or holder + label) for the sovereign base; omit (with no `cshapes` dataset) for a topic without one. */
  base?: Record<string, string | { holder: string; label?: { en: string; zh: string } }>;
  /** OHM relation set used by `ohm` selectors in this keyframe (omit when none is used). */
  ohm?: string;
  /** How the keyframe was made, for SOURCES.md. */
  method: string;
  steps: Step[];
  /** Views rendered by check.ts: [lng, lat, zoom] plus the source image shown beside it. */
  checks: { name: string; center: [number, number]; zoom: number; source?: string }[];
}

/** [west, south, east, north] in degrees. */
export type Box = [number, number, number, number];

/** A focus box: plain (the searched fine interval) or with its own fixed interval in km. */
export type FocusEntry = Box | { box: Box; fineKm: number };

/** The optional `pipeline` block of sources.json; every field falls back to `PIPELINE_DEFAULTS`. */
export interface Pipeline {
  /** Keyframes the size budget is planned for (the budget is pro rata for fewer). */
  plannedKeyframes?: number;
  /** control.json size budget in MB for `plannedKeyframes` keyframes. */
  budgetMB?: number;
  /**
   * Boxes that keep the fine interval (the theatres the chapters zoom into). A
   * `{ box, fineKm }` entry keeps its own fixed interval instead of the
   * searched one (an island-scale box inside a regional one, docs/28 P3); it
   * wins over the boxes after it where they overlap.
   */
  focus?: FocusEntry[];
  /** Auto search: start at this fine interval (km) and add `fineStepKm` until the file fits. */
  fineStartKm?: number;
  fineStepKm?: number;
  /** Interval (km) outside the focus boxes. */
  coarseKm?: number;
  /** `dp` (Douglas–Peucker) or `weighted` (Visvalingam). */
  method?: 'dp' | 'weighted';
  /** TopoJSON quantisation (grid points across the data extent). */
  quantization?: number;
  /** Detached parts under these areas (km²) are dropped, inside / outside the focus boxes. */
  islandsKm2?: { focus?: number; coarse?: number };
  coast?: {
    /** Cut control areas to the basemap land (`--no-coast` overrides). */
    enabled?: boolean;
    /** Repo-relative basemap land (GeoJSON or TopoJSON) used everywhere. */
    land?: string;
    /** Repo-relative finer land used inside `detailBox`; both null = no detail region. */
    detailLand?: string | null;
    detailBox?: Box | null;
    /**
     * No coast step inside this box (simplify.ts): no water erased, no gap
     * filled. For a topic whose features there are already clipped to their
     * own dated coast in compose (Singapore by era, docs/28 P2), which the
     * basemap's one coastline of today would otherwise undo. Null = none.
     */
    excludeBox?: Box | null;
    /** Extent of the control data; coast and water outside it are ignored. */
    worldBox?: Box;
    /** Reach (km) within which uncovered land goes to the nearest holder. */
    gapKm?: number;
    /** Detached pieces under this (km²) are dropped after the coast step (and inside `detailBox` the island floor). */
    islandKm2?: number;
    /** Basemap coast thinning (km) outside the focus boxes. */
    outsideKm?: number;
    /** Deviation is not measured for vertices this close (km) to the basemap coast. */
    skipKm?: number;
  };
  /** compose.ts: light pre-simplification of each step (m) and the sliver filter of the final dissolve (km²). */
  compose?: { lightM?: number; sliverKm2?: number };
  /** simplify.ts post-quantisation clean: vertex snap (degrees, at least one grid cell) and the smallest ring kept (km²). */
  clean?: { snapDeg?: number; sliverKm2?: number };
  /** Island-scale basemap (local-land.ts): a dataset dissolved into one land layer for `basemap.local` topics. */
  localLand?: LocalLand;
  /** Regional plate land (region-land.ts, `basemap.region` topics); read by that step only. */
  regionLand?: RegionLand;
  /** check.ts colours: holder id -> #rrggbb (unlisted holders get a colour hashed from their id). */
  checkColors?: Record<string, string>;
  /** Repo-relative folder for check.ts screenshots. */
  shots?: string;
}

/** `pipeline.regionLand`: knobs of region-land.ts (Natural Earth 1:10m land clipped to the plate). */
export interface RegionLand {
  /** Cut this far (degrees) outside the plate; the GeoStage's paper frame covers it. Default 0.25. */
  padDeg?: number;
  /** Douglas–Peucker tolerance (km); grows by half while over budget. Default 1. */
  simplifyKm?: number;
  /** Smaller islands and lakes are dropped (km²). Default 4. */
  minIslandKm2?: number;
  /** Quantisation grid cells across the plate. Default 50000. */
  quantization?: number;
  /** File size budget (KB). Default 200. */
  budgetKB?: number;
  /** Simplify with mapshaper (keep-shapes + clean) before cutting the plate, instead of per-ring Douglas–Peucker. Default false. */
  mapshaper?: boolean;
}

/**
 * `pipeline.localLand`: the high-resolution land of a city- or island-scale
 * topic (docs/17 C1), built by local-land.ts into `public/geo/<id>.json` and
 * drawn by the GeoStage above `minZoom` when topic.yaml sets
 * `basemap: { local: <id> }`.
 */
export interface LocalLand {
  /** File stem under public/geo/ and the TopoJSON object name, e.g. `land-sg`. */
  id: string;
  /** Polygon dataset (GeoJSON in raw/) dissolved into the land, e.g. the URA planning areas. */
  dataset: string;
  /**
   * Inland water cut out of the land (rivers, canals, bays inside the planning
   * areas): the polygons of `dataset` matching `where`, at least `minKm2`, except
   * those lying at least `keepShare` inside a feature of `keep` (optionally only
   * the features whose properties match the `keepMatch` regular expressions):
   * reservoirs made by flooding a valley, which keyframes tint by year and must
   * stay land-coloured before they exist. Estuary reservoirs are left out of
   * `keep`: before their dam they were river mouths, i.e. water.
   */
  water?: { dataset: string; where: Record<string, string | string[]>; minKm2: number; keep?: string; keepMatch?: Record<string, string>; keepShare?: number };
  /** Douglas–Peucker interval (m). */
  simplifyM: number;
  /** Detached parts under this (km²) are dropped. */
  minIslandKm2: number;
  /** Repo-relative coarser basemap whose polygons inside `replaceBox` the local land replaces (painted in the water colour under it). */
  replaces: string;
  /** [w, s, e, n]: coarser land polygons that intersect the local land inside this box are masked. */
  replaceBox: Box;
  /** Buffer (m) of the mask around the replaced polygons, so their coastline stroke is hidden too. */
  maskBufferM: number;
  /** Size budget (KB) of the written file. */
  budgetKB: number;
  /**
   * The island coast by date (docs/28 §3.3): one whole `kind: land` coast per
   * era with `from` / `to` (`[from, to)`; the first may leave out `from`, the
   * last `to`), all in the same TopoJSON so the shoreline the eras share is
   * stored once. Without `eras` the file holds one undated land (land-sg).
   */
  eras?: LocalLandEra[];
  /** Also write today's coastline (the exterior rings of today's land) as `kind: coast-today`, the GeoStage's dashed reference line. */
  coastToday?: boolean;
}

/**
 * One era of `pipeline.localLand.eras`: today's land (dissolved `dataset`
 * minus `water`, unsimplified) clipped to `outline`, minus every `minus`,
 * plus every `plus`, then simplified with the other eras. Each path is a
 * polygon GeoJSON traced from a source map (lines.ts, georef-*.ts), relative
 * to the topic folder when it starts with `work/` or `raw/`, else to the repo.
 */
export interface LocalLandEra {
  /** Era id, e.g. `L0`; also names the decoded copy `work/coast-<id>.geojson` (compose's `geojson` selector reads it). */
  id: string;
  from?: string;
  to?: string;
  /** Keep only the land inside this traced outline (a whole-island coast from an old survey). */
  outline?: string;
  /** Land that was still sea in this era (reclaimed later): erased. */
  minus?: string[];
  /** Land of this era that is gone today (islands dug away, sand bars): added. */
  plus?: string[];
  /** Map source ids (`G#`) written on the feature as `src`. */
  src?: string[];
}

export interface Sources {
  datasets: Record<string, Dataset>;
  ohm?: Record<string, OhmSet>;
  svg?: Record<string, SvgSource>;
  raster?: Record<string, RasterSource>;
  keyframes: Keyframe[];
  pipeline?: Pipeline;
}

/** `Pipeline` with every default filled in. Paths stay repo-relative, as written in the manifest. */
export interface PipelineConfig {
  plannedKeyframes: number;
  budgetMB: number;
  focus: FocusEntry[];
  fineStartKm: number;
  fineStepKm: number;
  coarseKm: number;
  method: 'dp' | 'weighted';
  quantization: number;
  islandsKm2: { focus: number; coarse: number };
  coast: {
    enabled: boolean;
    land: string;
    detailLand: string | null;
    detailBox: Box | null;
    excludeBox: Box | null;
    worldBox: Box;
    gapKm: number;
    islandKm2: number;
    outsideKm: number;
    skipKm: number;
  };
  compose: { lightM: number; sliverKm2: number };
  clean: { snapDeg: number; sliverKm2: number };
  localLand: LocalLand | null;
  checkColors: Record<string, string>;
  shots: string;
}

/** The values ww2 was built with; a topic overrides them field by field in `pipeline`. */
export const PIPELINE_DEFAULTS: Omit<PipelineConfig, 'shots'> = {
  plannedKeyframes: 12,
  budgetMB: 2.0,
  focus: [
    [-12, 28, 62, 72], // Europe, North Africa coast, Middle East
    [88, -12, 160, 56], // East and Southeast Asia, western Pacific
  ],
  fineStartKm: 1.5,
  fineStepKm: 0.25,
  coarseKm: 50,
  method: 'dp',
  quantization: 400_000,
  islandsKm2: { focus: 20, coarse: 300 },
  coast: {
    enabled: true,
    land: 'public/geo/land-50m.json',
    // scripts/build-geo.ts `SEA_BBOX`: the 1:10m basemap drawn at high zoom.
    detailLand: 'public/geo/land-10m-sea.json',
    detailBox: [95, -9, 125, 22],
    excludeBox: null,
    // Antarctica is closed along the pole, which a planar clip would choke on.
    worldBox: [-180, -60, 180, 86],
    gapKm: 6,
    islandKm2: 2,
    outsideKm: 2,
    skipKm: 15,
  },
  compose: { lightM: 300, sliverKm2: 5 },
  clean: { snapDeg: 0.005, sliverKm2: 1 },
  localLand: null,
  checkColors: {},
};

/** The manifest's `pipeline` block over `PIPELINE_DEFAULTS`; `slug` names the default screenshot folder. */
export function pipelineConfig(manifest: Sources, slug: string): PipelineConfig {
  const p = manifest.pipeline ?? {};
  const d = PIPELINE_DEFAULTS;
  const c = p.coast ?? {};
  const config: PipelineConfig = {
    plannedKeyframes: p.plannedKeyframes ?? d.plannedKeyframes,
    budgetMB: p.budgetMB ?? d.budgetMB,
    focus: p.focus ?? d.focus,
    fineStartKm: p.fineStartKm ?? d.fineStartKm,
    fineStepKm: p.fineStepKm ?? d.fineStepKm,
    coarseKm: p.coarseKm ?? d.coarseKm,
    method: p.method ?? d.method,
    quantization: p.quantization ?? d.quantization,
    islandsKm2: { focus: p.islandsKm2?.focus ?? d.islandsKm2.focus, coarse: p.islandsKm2?.coarse ?? d.islandsKm2.coarse },
    coast: {
      enabled: c.enabled ?? d.coast.enabled,
      land: c.land ?? d.coast.land,
      detailLand: c.detailLand === undefined ? d.coast.detailLand : c.detailLand,
      detailBox: c.detailBox === undefined ? d.coast.detailBox : c.detailBox,
      excludeBox: c.excludeBox ?? d.coast.excludeBox,
      worldBox: c.worldBox ?? d.coast.worldBox,
      gapKm: c.gapKm ?? d.coast.gapKm,
      islandKm2: c.islandKm2 ?? d.coast.islandKm2,
      outsideKm: c.outsideKm ?? d.coast.outsideKm,
      skipKm: c.skipKm ?? d.coast.skipKm,
    },
    compose: { lightM: p.compose?.lightM ?? d.compose.lightM, sliverKm2: p.compose?.sliverKm2 ?? d.compose.sliverKm2 },
    clean: { snapDeg: p.clean?.snapDeg ?? d.clean.snapDeg, sliverKm2: p.clean?.sliverKm2 ?? d.clean.sliverKm2 },
    localLand: p.localLand ?? d.localLand,
    checkColors: p.checkColors ?? d.checkColors,
    shots: p.shots ?? `docs/screenshots/${slug}`,
  };
  if ((config.coast.detailLand === null) !== (config.coast.detailBox === null)) {
    throw new Error('sources.json pipeline.coast: `detailLand` and `detailBox` must both be set or both be null');
  }
  if (config.method !== 'dp' && config.method !== 'weighted') throw new Error(`sources.json pipeline.method: "${String(config.method)}" is not dp or weighted`);
  return config;
}

/** Control points of an svg source (its own, or those of the source it shares a base map with). */
export function svgControlPoints(sources: Sources, id: string): ControlPoint[] {
  const src = sources.svg?.[id];
  if (!src) throw new Error(`unknown svg source ${id}`);
  if (!src.controlPointsFrom) return src.controlPoints;
  return svgControlPoints(sources, src.controlPointsFrom);
}

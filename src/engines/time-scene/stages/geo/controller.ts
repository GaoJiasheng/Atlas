/**
 * GeoStage controller: owns the MapLibre map and drives it imperatively from
 * the scene store (layers, highlight, camera transitions) and the playhead
 * (time). React only mounts/unmounts it (GeoStage.tsx); nothing here renders
 * through React, so scrubbing and playback never re-render the tree.
 *
 * The map is drawn as an engineering plate (docs/08 §5): paper land, pale
 * water, hairline coast / borders / 10° graticule, control areas as a faint
 * bloc tint plus a 45° hatch, movements as thin flow lines with a small
 * arrowhead, events as hollow rings with a dot (massacres / atrocities as
 * hollow squares, sieges with a dashed outer ring), static `site` points on
 * their own layer, territory names for who holds what (territory.ts), leader
 * labels for what the chapter emphasises (leaders.ts) and a scale bar. Entity colours follow the bloc valid at `t` (lib/bloc.ts).
 *
 * Loaded lazily (dynamic import) so MapLibre stays out of the View chunk.
 */
import { Map as MlMap, Marker, type ExpressionSpecification, type FilterSpecification, type GeoJSONSource, type LayerSpecification, type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, FeatureCollection } from 'geojson';
import { feature as topoFeature } from 'topojson-client';
import type { SceneStore } from '../../../core/store';
import type { GeoCamera, Locale } from '../../../core/types';
import { isGeoCamera } from '../../../core/camera';
import { BASE_LAYER_IDS, buildMapStyle } from '../../../../theme/map-style';
import { readThemeTokens, resolveColorRef, type ThemeTokens } from '../../../../theme/theme';
import { t as translate, tx, withBase } from '../../../../i18n';
import type { TimeSceneExt } from '../../index';
import { entityBlocAt, type TimeModel } from '../../lib/model';
import type { SceneEvent } from '../../schema';
import { sideAt, warStatusAt } from '../../lib/bloc';
import { blocLabel } from '../../lib/blocLabels';
import type { BlocLabels } from '../../../../content/schema/topic';
import type { Playhead } from '../../lib/playhead';
import { frameAt, type Frame } from '../../lib/frame';
import { areaLabelPoint, metresPerPixel, pickWorldCopy, pointAlong, projectNearCentre, scaleBar, type LngLat } from '../../lib/geo';
import { referencePair } from '../../lib/stats';
import { formatTime } from '../../lib/format';
import { createLeaders, intersects, type LeaderItem } from './leaders';
import { createTerritoryLabels } from './territory';

export interface GeoControllerOptions {
  container: HTMLElement;
  /** Layer over the map for leader placards (HTML). */
  labelRoot: HTMLElement;
  /** Scale bar element (bottom-left of the free stage band). */
  scaleRoot: HTMLElement;
  /** Layer over the map for territory names (outside the host LABELS / HUD switches). */
  territoryRoot: HTMLElement;
  store: SceneStore<TimeSceneExt>;
  playhead: Playhead;
  model: TimeModel;
  locale: Locale;
  /** The topic's own bloc names (`topic.blocLabels`); the UI strings when absent. */
  blocLabels?: BlocLabels;
  onSelectEvent(id: string): void;
}

export interface GeoController {
  setLocale(locale: Locale): void;
  /** Host `leaders` <svg> (slot); leader paths are drawn into it. */
  setLeadersSvg(svg: SVGSVGElement | null): void;
  setGraticule(on: boolean): void;
  /** Territory names (N): who holds each control area, sized by its area on screen. */
  setTerritory(on: boolean): void;
  /** REFERENCE: outline the adjacent control keyframe in dashed ink (2 s fade). */
  setReference(on: boolean, instant: boolean): void;
  /**
   * PRESENTATION: leader labels for the highlighted ids only (cap 6) and no
   * place / entity name labels, so the caption and the map agree.
   */
  setPresentation(on: boolean): void;
  /** Re-measure the leader labels now (the presentation card appeared or changed size). */
  refreshLabels(): void;
  /** Camera that fits all topic data (the `theatre` preset). */
  fitCamera(): GeoCamera | null;
  stats(): { features: number; zoom: number };
  destroy(): void;
}

/* ------------------------------------------------------------------ */
/* Ids and constants                                                   */
/* ------------------------------------------------------------------ */

const SRC = {
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

const LAYER = {
  graticule: 'ts-graticule',
  prevFill: 'ts-control-prev-fill',
  prevHatch: 'ts-control-prev-hatch',
  prevLine: 'ts-control-prev-line',
  nextFill: 'ts-control-next-fill',
  nextHatch: 'ts-control-next-hatch',
  nextLine: 'ts-control-next-line',
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
const GROUPS: Record<string, string[]> = {
  control: [LAYER.prevFill, LAYER.prevHatch, LAYER.prevLine, LAYER.nextFill, LAYER.nextHatch, LAYER.nextLine],
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
const HI = { src: 'ts-land-hi', mask: 'ts-land-hi-mask', fill: 'ts-land-hi-fill', edge: 'ts-land-hi-edge' } as const;
const HI_BBOX: [number, number, number, number] = [95, -9, 125, 22];
const HI_MIN_ZOOM = 7;
const HI_LOAD_ZOOM = 6.5;

function hiResLayers(tk: ThemeTokens): LayerSpecification[] {
  const fade: ExpressionSpecification = ['interpolate', ['linear'], ['zoom'], HI_MIN_ZOOM, 0, HI_MIN_ZOOM + 1, 1];
  const kind = (k: string): FilterSpecification => ['==', ['get', 'kind'], k];
  return [
    { id: HI.mask, type: 'fill', source: HI.src, minzoom: HI_MIN_ZOOM, filter: kind('frame'), paint: { 'fill-color': tk.water || '#dde2df', 'fill-opacity': fade, 'fill-antialias': false } },
    { id: HI.fill, type: 'fill', source: HI.src, minzoom: HI_MIN_ZOOM, filter: kind('land'), paint: { 'fill-color': tk.land || '#e1dbcc', 'fill-antialias': true } },
    { id: HI.edge, type: 'line', source: HI.src, minzoom: HI_MIN_ZOOM, filter: kind('coast'), paint: { 'line-color': tk['land-edge'] || 'rgba(42, 40, 36, 0.3)', 'line-width': 1.2, 'line-opacity': fade } },
  ];
}

/** Event kinds drawn as a hollow square (HTML marker) instead of the ring + dot. */
const SQUARE_KINDS = new Set<string>(['massacre', 'atrocity']);
/** Event kinds drawn as a hollow triangle (epidemic, famine, sinking); no sides, ink only. */
const TRIANGLE_KINDS = new Set<string>(['disaster']);
/** Hairline triangle for the `disaster` mark (stroke follows `color` in CSS). */
const TRIANGLE_SVG =
  '<svg viewBox="0 0 10 10" width="100%" height="100%" aria-hidden="true"><path d="M5 0.9L9.5 9.1H0.5Z" fill="var(--ts-fill)" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linejoin="miter"/></svg>';
/** Event kinds drawn in the cold tone instead of the attacker's colour. */
const COLD_KINDS = new Set<string>(['evacuation', 'liberation']);
/** Ring radius of an event mark in px. */
const eventRadius = (e: SceneEvent, active: boolean, hl: boolean) => (3 + 2 * e.importance) * (active ? 1.15 : 1) + (hl ? 1.5 : 0);

/** Bloc tint under the hatch (docs/08 §5: low saturation, ~.28). */
const CONTROL_TINT = 0.28;
/** Tint multiplier of a highlighted holder (its outline would also run along the coast, so the area itself is drawn stronger). */
const HIGHLIGHT_TINT = 1.7;
/** Width of the frontier between two holders (px). */
const FRONTIER_PX = 0.8;
/** Modern country names (borders on): a secondary class, only close in and away from territory names. */
const MAX_PLACE_LABELS = 8;
const PLACE_MIN_ZOOM = 5;
const PLACE_CLEAR_PX = 60;
/** Leader labels shown for a presentation beat (its highlighted ids). */
const PRESENTATION_MAX_LABELS = 6;
const HIT_RADIUS = 22; // 44px hit box around events
const PULSE_MS = 900;
const FLY_MS = 2200;
const REFERENCE_MS = 2000;
const CAMERA_WRITE_DEBOUNCE = 250;
/** Hatch tile in CSS px (one 45° line per tile). */
const HATCH_PX = 7;
const SCALE_MAX_PX = 120;

/** Flowing dash: the classic stepped dasharray sequence (~12 fps). */
const DASH_SEQUENCE: number[][] = [
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
const DASH_STEP_MS = 83;

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

/** 10° graticule as GeoJSON lines (meridians to ±80°, parallels −80…80). */
function graticule(): FeatureCollection {
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
function dataLayers(tk: ThemeTokens): LayerSpecification[] {
  const ink = tk.ink || '#2a2824';
  const control = (source: string, fill: string, hatch: string, line: string): LayerSpecification[] => [
    { id: fill, type: 'fill', source, paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0, 'fill-antialias': false } },
    { id: hatch, type: 'fill', source, paint: { 'fill-pattern': ['get', 'pattern'], 'fill-opacity': 0 } },
    {
      id: line,
      type: 'line',
      source,
      layout: { 'line-join': 'round' },
      // Colour and width come with the feature: the frontier between holders is one ink hairline (`--line`, 0.8 px);
      // control data without topology has no frontier, so its polygons are outlined in their holder's colour (heavier when highlighted).
      paint: { 'line-color': ['get', 'lc'], 'line-width': ['get', 'lw'], 'line-opacity': 0 },
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
    ...control(SRC.prev, LAYER.prevFill, LAYER.prevHatch, LAYER.prevLine),
    ...control(SRC.next, LAYER.nextFill, LAYER.nextHatch, LAYER.nextLine),
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

/** A 45° hatch tile in `color` (transparent ground), for `fill-pattern`. */
function hatchImage(color: string, pixelRatio: number): ImageData | null {
  const size = Math.round(HATCH_PX * pixelRatio);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 0.8 * pixelRatio;
  ctx.lineCap = 'square';
  ctx.beginPath();
  for (const k of [-size, 0, size]) {
    ctx.moveTo(k, size);
    ctx.lineTo(k + size, 0);
  }
  ctx.stroke();
  return ctx.getImageData(0, 0, size, size);
}

/* ------------------------------------------------------------------ */
/* Controller                                                          */
/* ------------------------------------------------------------------ */

export function createGeoController(options: GeoControllerOptions): GeoController {
  const { container, store, playhead, model } = options;
  let locale = options.locale;
  let tokens = readThemeTokens();
  const landUrl = withBase('/geo/land-50m.json');
  const landHiUrl = withBase('/geo/land-10m-sea.json');
  const countriesUrl = withBase('/geo/countries-50m.json');
  const bordersUrl = withBase('/geo/borders-50m.json');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const pixelRatio = Math.min(3, Math.max(1, Math.round(window.devicePixelRatio || 1)));
  const graticuleData = graticule();
  let graticuleOn = true;
  let territoryOn = true;
  let referenceOn = false;
  let presenting = false;

  const baseStyle = (tk: ThemeTokens) =>
    buildMapStyle({ sources: { land: landUrl }, tokens: tk, name: 'atlas-time-scene' }) as unknown as StyleSpecification;

  const style = baseStyle(tokens);
  for (const id of Object.values(SRC)) style.sources[id] = { type: 'geojson', data: id === SRC.graticule ? graticuleData : EMPTY };
  style.sources[HI.src] = { type: 'geojson', data: EMPTY };
  style.layers.splice(style.layers.findIndex((l) => l.id === BASE_LAYER_IDS.landEdge) + 1, 0, ...hiResLayers(tokens));
  style.layers.push(...dataLayers(tokens));

  const initial = store.getState();
  const cam = isGeoCamera(initial.camera) ? initial.camera : null;
  const map = new MlMap({
    container,
    style,
    ...(cam
      ? { center: cam.center, zoom: cam.zoom, pitch: cam.pitch ?? 0, bearing: cam.bearing ?? 0 }
      : model.bounds
        ? { bounds: model.bounds, fitBoundsOptions: { padding: 48 } }
        : { center: [0, 20] as [number, number], zoom: 1.5 }),
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    maxZoom: 10,
    minZoom: 0.5,
    fadeDuration: 0,
    maxPitch: 60,
  });
  map.touchZoomRotate.disableRotation();

  const disposers: (() => void)[] = [];
  let loaded = false;
  let destroyed = false;

  /* ---------- errors: warn, never throw into the console as errors ---------- */
  map.on('error', (e) => console.warn('[atlas] map:', e.error?.message ?? e));

  /* ---------- focus: clicking the map must not steal keyboard focus ---------- */
  const canvas = map.getCanvas();
  let pointerAt = 0;
  const onPointerDown = () => (pointerAt = performance.now());
  const onCanvasFocus = () => {
    if (performance.now() - pointerAt < 600) canvas.blur();
  };
  container.addEventListener('pointerdown', onPointerDown, true);
  canvas.addEventListener('focus', onCanvasFocus);
  disposers.push(() => {
    container.removeEventListener('pointerdown', onPointerDown, true);
    canvas.removeEventListener('focus', onCanvasFocus);
  });

  /* ---------- resize ---------- */
  const resizeObserver = new ResizeObserver(() => map.resize());
  resizeObserver.observe(container);
  disposers.push(() => resizeObserver.disconnect());

  /* ---------- helpers ---------- */
  const source = (id: string) => map.getSource(id) as GeoJSONSource | undefined;
  const tr = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) => translate(locale, key, vars);

  /** Colour of entity `id` at numeric time `t`: its override, else its bloc at `t`; neutral while not at war (lib/bloc.ts). */
  const entityColor = (id: string, t: number): string => {
    const en = model.entities.get(id);
    if (en?.entity.color && warStatusAt(en.entity, t) === 'at-war') return resolveColorRef(en.entity.color, tokens) || tokens['accent-neutral'];
    return tokens[`accent-${entityBlocAt(model, id, t)}` as 'accent-axis'] || tokens['accent-neutral'] || '#888';
  };
  /** Colour of the side entity `id` fights on at `t` (movement lines), whether or not it is inside its joined / left window. */
  const sideColor = (id: string, t: number): string => {
    const en = model.entities.get(id)?.entity;
    if (!en) return tokens['accent-neutral'] || '#888';
    if (en.color) return resolveColorRef(en.color, tokens) || tokens['accent-neutral'];
    return tokens[`accent-${sideAt(en, t)}` as 'accent-axis'] || tokens['accent-neutral'] || '#888';
  };
  /** Hatch images are shared per colour: one per bloc, one per entity with its own colour. */
  const hatchId = (entityId: string, t: number) => {
    const en = model.entities.get(entityId)?.entity;
    return en?.color && warStatusAt(en, t) === 'at-war' ? `ts-hatch-e-${entityId}` : `ts-hatch-b-${entityBlocAt(model, entityId, t)}`;
  };
  /** Colour of every entity at `t` in one string: source signatures redraw when an entity changes side or leaves / joins the war. */
  const entities = [...model.entities.keys()];
  const blocSig = (t: number) => entities.map((id) => entityBlocAt(model, id, t).slice(0, 2)).join('');

  /** Inspector line for an entity at `t`: bloc and join date; "no longer at war" / "not yet at war" outside its window. */
  const entityNote = (id: string, t: number): string => {
    const en = model.entities.get(id)?.entity;
    if (!en) return '';
    const status = warStatusAt(en, t);
    if (status === 'after') return `${blocLabel(options.blocLabels, 'out', locale)}${en.left !== undefined ? ` · ${formatTime(en.left, locale)}` : ''}`;
    if (status === 'before') return tr('time.bloc.notYet');
    return `${blocLabel(options.blocLabels, entityBlocAt(model, id, t), locale)} · ${tr('time.joinedOn', { date: formatTime(en.joined, locale) })}`;
  };

  const layersOn = () => new Set(store.getState().layers);
  const highlight = () => store.getState().highlight ?? [];

  /* ---------- hatch patterns (one per entity, rebuilt on theme change) ---------- */
  const applyHatches = () => {
    const images = new Map<string, string>();
    for (const bloc of ['axis', 'allied', 'neutral'] as const) images.set(`ts-hatch-b-${bloc}`, tokens[`accent-${bloc}`] || '#888');
    for (const { entity } of model.entities.values()) {
      if (entity.color) images.set(`ts-hatch-e-${entity.id}`, resolveColorRef(entity.color, tokens) || tokens['accent-neutral']);
    }
    for (const [id, color] of images) {
      const image = hatchImage(color, pixelRatio);
      if (!image) continue;
      if (map.hasImage(id)) map.updateImage(id, image);
      else map.addImage(id, image, { pixelRatio });
    }
  };

  /* ---------- visibility ---------- */
  const applyVisibility = () => {
    if (!loaded) return;
    const on = layersOn();
    for (const [group, ids] of Object.entries(GROUPS)) {
      for (const id of ids) map.setLayoutProperty(id, 'visibility', on.has(group) ? 'visible' : 'none');
    }
    map.setLayoutProperty(LAYER.graticule, 'visibility', graticuleOn ? 'visible' : 'none');
    if (on.has('borders')) void ensureCountries();
  };

  /* ---------- borders (lazy: only fetched when first shown): the frontier mesh and the country names ---------- */
  type CountryLabel = { name: string; at: LngLat; rank: number };
  let countryLabels: CountryLabel[] | null = null;
  let countriesLoading = false;
  const fetchJson = async <T,>(url: string): Promise<T> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return (await res.json()) as T;
  };
  const ensureCountries = async () => {
    if (countryLabels || countriesLoading) return;
    countriesLoading = true;
    try {
      const [mesh, fc] = await Promise.all([fetchJson<Parameters<typeof topoFeature>[0]>(bordersUrl), fetchJson<FeatureCollection>(countriesUrl)]);
      if (destroyed) return;
      // Country-country frontiers only (shared arcs, no coastline): one MultiLineString.
      source(SRC.borders)?.setData(topoFeature(mesh, mesh.objects.borders as Parameters<typeof topoFeature>[1]) as Feature);
      countryLabels = fc.features.map((f) => {
        const p = (f.properties ?? {}) as { name?: string; lx?: number; ly?: number; rank?: number };
        return { name: p.name ?? '', at: [p.lx ?? 0, p.ly ?? 0] as LngLat, rank: p.rank ?? 999 };
      });
      requestRender();
    } catch (err) {
      console.warn('[atlas] borders unavailable:', err);
    } finally {
      countriesLoading = false;
    }
  };

  /* ---------- per-frame rendering (coalesced to one rAF) ---------- */
  let renderQueued = 0;
  const signatures: Record<string, string> = {};
  const featureCounts: Record<string, number> = {};
  let lastFrame: Frame | null = null;
  let activeEvents: Set<string> | null = null;

  const setIfChanged = (id: string, sig: string, data: () => FeatureCollection) => {
    if (signatures[id] === sig) return;
    signatures[id] = sig;
    const fc = data();
    featureCounts[id] = fc.features.length;
    source(id)?.setData(fc);
  };

  /**
   * One keyframe as map features: the polygons (tint and hatch) and, for the edge layer, the frontier between
   * holders when the data has topology (the coast is the basemap's own line, so it gets no second one), else
   * the polygon outlines.
   */
  const controlFc = (index: number, hl: Set<string>, t: number): FeatureCollection => {
    const kf = model.keyframes[index]?.keyframe;
    if (!kf) return EMPTY;
    const frontier = kf.frontier;
    const lineColor = tokens.line || tokens.ink || '#2a2824';
    const features: Feature[] = kf.features.features.map((f) => {
      const color = entityColor(f.properties.holder, t);
      const marked = hl.has(f.properties.holder);
      return {
        type: 'Feature',
        geometry: f.geometry,
        properties: {
          holder: f.properties.holder,
          color,
          pattern: hatchId(f.properties.holder, t),
          hl: marked,
          // A highlighted holder is tinted stronger where its outline is not drawn.
          tint: frontier && marked ? HIGHLIGHT_TINT : 1,
          lc: color,
          lw: frontier ? 0 : marked ? 2.8 : 1,
        },
      };
    });
    // The fill layers never draw a line, but they still evaluate their colour and pattern on it: give it harmless ones.
    if (frontier) features.push({ type: 'Feature', geometry: frontier, properties: { lc: lineColor, lw: FRONTIER_PX, color: lineColor, pattern: 'ts-hatch-b-neutral', tint: 0 } });
    return { type: 'FeatureCollection', features };
  };

  /** The adjacent keyframe for REFERENCE: its frontier (else its outlines) as dashed ink lines, nothing filled. */
  const referenceFc = (index: number): FeatureCollection => {
    const kf = model.keyframes[index]?.keyframe;
    if (!kf) return EMPTY;
    if (kf.frontier) return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: kf.frontier, properties: {} }] };
    return { type: 'FeatureCollection', features: kf.features.features.map((f) => ({ type: 'Feature', geometry: f.geometry, properties: {} })) };
  };

  /** Polygons of an entity in the keyframe currently dominant at `frame`. */
  const entityGeometry = (frame: Frame) => {
    const idx = frame.control.blend >= 0.5 && frame.control.nextIndex >= 0 ? frame.control.nextIndex : frame.control.prevIndex;
    const kf = model.keyframes[idx]?.keyframe;
    const byHolder = new Map<string, Feature[]>();
    for (const f of kf?.features.features ?? []) {
      const list = byHolder.get(f.properties.holder) ?? [];
      list.push(f as unknown as Feature);
      byHolder.set(f.properties.holder, list);
    }
    return byHolder;
  };

  const entityAnchor = (features: Feature[] | undefined): LngLat | null => {
    if (!features) return null;
    const polys = features.flatMap((f) =>
      f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [],
    );
    return areaLabelPoint(polys);
  };

  const render = () => {
    renderQueued = 0;
    if (!loaded || destroyed) return;
    const t = playhead.get();
    const hlList = highlight();
    const hl = new Set(hlList);
    const hlSig = hlList.join(',');
    const themeSig = `${tokens['accent-axis']}|${tokens.ink}|${tokens.line}|${blocSig(t)}`;
    const frame = frameAt(model, t, hlList);
    lastFrame = frame;
    const on = layersOn();

    /* control: two sources, crossfaded (tint, hatch and edge together) */
    const { control } = frame;
    setIfChanged(SRC.prev, `${control.prevIndex}|${hlSig}|${themeSig}`, () => controlFc(control.prevIndex, hl, t));
    setIfChanged(SRC.next, `${control.nextIndex}|${hlSig}|${themeSig}`, () => controlFc(control.nextIndex, hl, t));
    const fade = (prefix: 'prev' | 'next', o: number) => {
      map.setPaintProperty(prefix === 'prev' ? LAYER.prevFill : LAYER.nextFill, 'fill-opacity', ['*', CONTROL_TINT * o, ['get', 'tint']]);
      map.setPaintProperty(prefix === 'prev' ? LAYER.prevHatch : LAYER.nextHatch, 'fill-opacity', o);
      map.setPaintProperty(prefix === 'prev' ? LAYER.prevLine : LAYER.nextLine, 'line-opacity', o);
    };
    fade('prev', control.prevOpacity);
    fade('next', control.nextOpacity);

    /* reference: the adjacent keyframe as dashed outlines */
    const pair = referencePair(model, frame);
    setIfChanged(SRC.reference, `${referenceOn ? pair?.other : -1}`, () =>
      referenceOn && pair ? referenceFc(pair.other) : EMPTY,
    );

    /* participation: entity areas light up on `joined` */
    const geometry = entityGeometry(frame);
    const partFeatures: Feature[] = [];
    for (const p of frame.participation) {
      for (const f of geometry.get(p.entityId) ?? []) {
        partFeatures.push({
          type: 'Feature',
          geometry: f.geometry,
          properties: { color: entityColor(p.entityId, t), flash: Math.round(p.flash * 50) / 50, hl: hl.has(p.entityId) },
        });
      }
    }
    const partSig = `${control.prevIndex}/${control.nextIndex}/${control.blend >= 0.5}|${frame.participation
      .map((p) => `${p.entityId}:${Math.round(p.flash * 50)}`)
      .join(',')}|${hlSig}|${themeSig}`;
    setIfChanged(SRC.participation, partSig, () => ({ type: 'FeatureCollection', features: partFeatures }));

    /* movements: thin flow lines, width 1–3 px by strength */
    const moveFeatures: Feature[] = frame.movements
      .filter((mv) => mv.coords.length >= 2)
      .map((mv) => {
        const id = mv.m.movement.id;
        const base = 1 + 2 * Math.sqrt((mv.m.movement.strength ?? 0) / model.maxStrength);
        return {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: mv.coords },
          properties: { id, color: sideColor(mv.m.movement.holder, mv.m.start), width: hl.has(id) ? base + 0.8 : base, op: mv.opacity },
        };
      });
    setIfChanged(
      SRC.movements,
      `${frame.movements.map((m) => `${m.m.movement.id}:${m.progress.toFixed(4)}:${m.opacity.toFixed(2)}`).join(',')}|${hlSig}|${themeSig}`,
      () => ({ type: 'FeatureCollection', features: moveFeatures }),
    );
    updateArrowheads(frame, on.has('movements'));

    /* events: hollow ring (hairline) + dot sized by importance; squares and siege rings are HTML (updateMarks) */
    const eventFeatures: Feature[] = frame.events.map((ef) => {
      const en = model.events.find((x) => x.event.id === ef.id)!;
      const e = en.event;
      const isHl = hl.has(e.id);
      const color = eventColor(e, en.start);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: e.at },
        properties: {
          id: e.id,
          r: eventRadius(e, ef.active, isHl),
          dot: 0.8 + 0.7 * e.importance,
          color,
          stroke: isHl ? tokens.signal : ef.active ? color : tokens['ink-2'],
          sw: isHl ? 1.6 : 1,
          o: SQUARE_KINDS.has(e.kind) || TRIANGLE_KINDS.has(e.kind) ? 0 : ef.active || isHl ? 1 : 0.6,
        },
      };
    });
    setIfChanged(
      SRC.events,
      `${frame.events.map((e) => `${e.id}:${e.active ? 1 : 0}`).join(',')}|${hlSig}|${themeSig}`,
      () => ({ type: 'FeatureCollection', features: eventFeatures }),
    );

    /* one-shot pulse when an event becomes active */
    const nowActive = new Set(frame.events.filter((e) => e.active).map((e) => e.id));
    if (activeEvents && on.has('battles') && !reducedMotion) {
      for (const id of nowActive) if (!activeEvents.has(id)) pulse(id);
    }
    activeEvents = nowActive;

    /* sites: static points, independent of `t` (hit targets here, diamonds in updateMarks) */
    setIfChanged(SRC.sites, `${on.has('sites')}`, () =>
      on.has('sites')
        ? {
            type: 'FeatureCollection',
            features: model.sites.map((e) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: e.at }, properties: { id: e.id } })),
          }
        : EMPTY,
    );
    updateMarks(frame, on, hl, hlSig);

    updateDashAnimation(on.has('movements') && frame.movements.length > 0);
    updateLeaders(frame);
    updateTerritory(false);
    updateLabels();
  };

  const requestRender = () => {
    if (!renderQueued && !destroyed) renderQueued = requestAnimationFrame(render);
  };
  disposers.push(() => cancelAnimationFrame(renderQueued));

  /* ---------- arrowheads (small HTML markers at each movement's head) ---------- */
  const arrows = new Map<string, Marker>();
  const updateArrowheads = (frame: Frame, visible: boolean) => {
    const seen = new Set<string>();
    if (visible) {
      for (const mv of frame.movements) {
        const id = mv.m.movement.id;
        seen.add(id);
        let marker = arrows.get(id);
        if (!marker) {
          const el = document.createElement('div');
          el.className = 'ts-arrowhead';
          el.innerHTML = '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M6 0.8 L10.6 11 L6 8.4 L1.4 11 Z"/></svg>';
          marker = new Marker({ element: el, rotationAlignment: 'viewport', pitchAlignment: 'viewport' });
          marker.setLngLat(mv.head).addTo(map);
          arrows.set(id, marker);
        }
        marker.getElement().style.setProperty('--ts-color', sideColor(mv.m.movement.holder, mv.m.start));
        marker.setLngLat(mv.head);
        marker.getElement().style.opacity = mv.opacity < 1 ? String(mv.opacity) : '';
        orientArrow(marker, mv.tail, mv.head);
      }
    }
    for (const [id, marker] of arrows) {
      if (!seen.has(id)) {
        marker.remove();
        arrows.delete(id);
      }
    }
  };
  const orientArrow = (marker: Marker, tail: LngLat, head: LngLat) => {
    const a = map.project(tail);
    const b = map.project(head);
    if (a.x === b.x && a.y === b.y) return;
    // Screen angle, 0 = up, clockwise.
    marker.setRotation((Math.atan2(b.x - a.x, a.y - b.y) * 180) / Math.PI);
  };
  const reorientArrows = () => {
    if (!lastFrame) return;
    for (const mv of lastFrame.movements) {
      const marker = arrows.get(mv.m.movement.id);
      if (marker) orientArrow(marker, mv.tail, mv.head);
    }
  };

  /* ---------- flowing dash ---------- */
  let dashRaf = 0;
  let dashStep = 0;
  let dashLast = 0;
  const dashTick = (now: number) => {
    dashRaf = requestAnimationFrame(dashTick);
    if (now - dashLast < DASH_STEP_MS) return;
    dashLast = now;
    dashStep = (dashStep + 1) % DASH_SEQUENCE.length;
    map.setPaintProperty(LAYER.moveLine, 'line-dasharray', DASH_SEQUENCE[dashStep]);
  };
  const updateDashAnimation = (run: boolean) => {
    if (run && !reducedMotion && !document.hidden) {
      if (!dashRaf) dashRaf = requestAnimationFrame(dashTick);
    } else if (dashRaf) {
      cancelAnimationFrame(dashRaf);
      dashRaf = 0;
    }
  };
  const onVisibility = () => requestRender();
  document.addEventListener('visibilitychange', onVisibility);
  disposers.push(() => {
    document.removeEventListener('visibilitychange', onVisibility);
    cancelAnimationFrame(dashRaf);
  });

  /** Mark colour: cold tone for evacuations / liberations, else the attacker at the event's start, else ink. */
  const eventColor = (e: SceneEvent, start: number): string => {
    if (COLD_KINDS.has(e.kind)) return tokens.cold || tokens.ink;
    return e.sides ? sideColor(e.sides.attacker, start) : tokens.ink;
  };

  /* ---------- HTML marks: hollow squares, siege rings, site diamonds ---------- */
  const marks = new Map<string, Marker>();
  let marksSig = '';
  const updateMarks = (frame: Frame, on: Set<string>, hl: Set<string>, hlSig: string) => {
    const battles = on.has('battles');
    const sitesOn = on.has('sites');
    const sig = `${battles ? frame.events.map((e) => `${e.id}:${e.active ? 1 : 0}`).join(',') : '-'}|${sitesOn}|${hlSig}`;
    if (sig === marksSig) return;
    marksSig = sig;
    const want = new Map<string, { at: LngLat; className: string; size: number; active: boolean; hl: boolean; color?: string }>();
    if (battles) {
      for (const ef of frame.events) {
        const en = model.events.find((x) => x.event.id === ef.id)!;
        const e = en.event;
        const isHl = hl.has(e.id);
        const r = eventRadius(e, ef.active, isHl);
        if (SQUARE_KINDS.has(e.kind)) {
          want.set(`square:${e.id}`, { at: e.at, className: 'ts-mark ts-mark--square', size: Math.round(r * 1.8), active: ef.active, hl: isHl });
        } else if (TRIANGLE_KINDS.has(e.kind)) {
          want.set(`triangle:${e.id}`, { at: e.at, className: 'ts-mark ts-mark--triangle', size: Math.round(r * 2), active: ef.active, hl: isHl });
        } else if (e.kind === 'siege') {
          want.set(`siege:${e.id}`, {
            at: e.at,
            className: 'ts-mark ts-mark--siege',
            size: Math.round(2 * r + 8),
            active: ef.active,
            hl: isHl,
            color: eventColor(e, en.start),
          });
        }
      }
    }
    if (sitesOn) {
      for (const e of model.sites) want.set(`site:${e.id}`, { at: e.at, className: 'ts-mark ts-mark--site', size: 9, active: true, hl: hl.has(e.id) });
    }
    for (const [key, marker] of marks) {
      if (!want.has(key)) {
        marker.remove();
        marks.delete(key);
      }
    }
    for (const [key, m] of want) {
      let marker = marks.get(key);
      if (!marker) {
        const el = document.createElement('div');
        el.className = m.className;
        const body = document.createElement('span');
        if (m.className.includes('--triangle')) body.innerHTML = TRIANGLE_SVG;
        el.appendChild(body);
        marker = new Marker({ element: el, anchor: 'center' }).setLngLat(m.at).addTo(map);
        marks.set(key, marker);
      }
      const el = marker.getElement();
      el.style.setProperty('--ts-size', `${m.size}px`);
      if (m.color) el.style.setProperty('--ts-color', m.color);
      el.dataset.active = String(m.active);
      el.dataset.hl = String(m.hl);
    }
  };

  /* ---------- pulses: an expanding hairline ring ---------- */
  const pulseTimers = new Set<ReturnType<typeof setTimeout>>();
  const pulse = (id: string) => {
    const en = model.events.find((x) => x.event.id === id);
    if (!en) return;
    const e = en.event;
    const el = document.createElement('div');
    el.className = SQUARE_KINDS.has(e.kind) ? 'ts-pulse ts-pulse--square' : 'ts-pulse';
    el.style.setProperty('--ts-color', eventColor(e, en.start));
    el.style.setProperty('--ts-size', `${(3 + 2 * e.importance) * 2}px`);
    const marker = new Marker({ element: el }).setLngLat(e.at).addTo(map);
    const timer = setTimeout(() => {
      marker.remove();
      pulseTimers.delete(timer);
    }, PULSE_MS);
    pulseTimers.add(timer);
  };
  disposers.push(() => {
    for (const timer of pulseTimers) clearTimeout(timer);
  });

  /* ---------- leader labels (highlighted ids + events in their window) ---------- */
  const scaleRoot = options.scaleRoot;
  const leaders = createLeaders({
    map,
    container,
    labelRoot: options.labelRoot,
    onSelect: (id) => options.onSelectEvent(id),
    // PRESENTATION: the HUD panels are on their way out (they keep `visibility` for the fade), so only the caption card and title block count.
    panelFilter: (el) => !presenting || (el.getAttribute('data-hud-panel') ?? '').startsWith('present'),
    onBand: (band) => {
      // Scale bar: bottom-left of the stage above the dock, or right of the left column when that is in the way.
      const box = { x: 28 * band.u, y: band.bottom - scaleRoot.offsetHeight, w: scaleRoot.offsetWidth, h: scaleRoot.offsetHeight };
      if (band.obstacles.some((r) => intersects(box, r))) box.x = band.left;
      scaleRoot.style.transform = `translate(${box.x.toFixed(1)}px, ${box.y.toFixed(1)}px)`;
      // HUD panels moved, appeared or hid (H): territory and place names re-check what they collide with.
      if (loaded) {
        updateTerritory(true);
        resolveLabelCollisions();
      }
    },
  });
  disposers.push(() => leaders.destroy());

  /* ---------- territory names (who holds what at `t`; N) ---------- */
  const territory = createTerritoryLabels({ map, container, root: options.territoryRoot, model });
  disposers.push(() => territory.destroy());
  let territorySig = '';
  /**
   * Re-place territory names when what they depend on changed (keyframe pair,
   * blend in 5 % steps, highlight, leader placards, switches) or on `force`
   * (camera settled, HUD band changed); otherwise only move / fade them.
   */
  const updateTerritory = (force: boolean) => {
    const frame = lastFrame;
    if (!loaded || !frame) return;
    const on = territoryOn && layersOn().has('control');
    const { control } = frame;
    const boxes = leaders.boxes();
    const sig = [
      on,
      control.prevIndex,
      control.nextIndex,
      Math.round(control.blend * 20),
      highlight().join(','),
      presenting,
      boxes.map((b) => `${Math.round(b.x / 8)},${Math.round(b.y / 8)}`).join(';'),
    ].join('|');
    if (!force && sig === territorySig) {
      territory.reproject(control.nextIndex >= 0 ? control.blend : 0);
      return;
    }
    territorySig = sig;
    if (!on) {
      territory.place(null);
      return;
    }
    // Highlighted entities get a leader placard; their unlabelled areas skip the territory name.
    const skip = new Set(layersOn().has('control') || layersOn().has('participation') ? highlight() : []);
    const band = leaders.band();
    territory.place({
      prevIndex: control.prevIndex,
      nextIndex: control.nextIndex,
      blend: control.blend,
      skipHolders: skip,
      obstacles: [...boxes, ...(band?.obstacles ?? []).map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height }))],
    });
  };

  const dateText = (from: Parameters<typeof formatTime>[0], to?: Parameters<typeof formatTime>[0]) => {
    const a = formatTime(from, locale);
    const s = to !== undefined ? `${a} – ${formatTime(to, locale)}` : a;
    return locale === 'en' ? s.toLocaleUpperCase('en') : s;
  };

  const updateLeaders = (frame: Frame) => {
    const on = layersOn();
    const hl = new Set(highlight());
    const items: LeaderItem[] = [];
    if (on.has('battles')) {
      for (const ef of frame.events) {
        if (!ef.active && !hl.has(ef.id)) continue;
        if (presenting && !hl.has(ef.id)) continue;
        const e = model.events.find((x) => x.event.id === ef.id)!.event;
        items.push({
          key: `event:${e.id}`,
          id: e.id,
          kind: 'event',
          en: e.title.en,
          zh: e.title.zh,
          note: tx(e.summary, locale),
          date: dateText(e.t, e.until),
          at: e.at,
          pinned: hl.has(e.id),
          clickable: true,
        });
      }
    }
    if (on.has('sites')) {
      for (const e of model.sites) {
        if (!hl.has(e.id)) continue;
        items.push({
          key: `event:${e.id}`,
          id: e.id,
          kind: 'event',
          en: e.title.en,
          zh: e.title.zh,
          note: tx(e.summary, locale),
          at: e.at,
          pinned: true,
          clickable: true,
        });
      }
    }
    if (on.has('movements')) {
      for (const m of model.movements) {
        const mv = m.movement;
        if (!hl.has(mv.id)) continue;
        const live = frame.movements.find((x) => x.m === m);
        const path = m.path;
        // Middle of the drawn part, so the anchor never sits on the arrowhead.
        const at = (live ? pointAlong(live.coords, 0.5) : playhead.get() > m.end ? pointAlong(path, 0.5) : path[0]) as LngLat | undefined;
        if (!at) continue;
        items.push({
          key: `movement:${mv.id}`,
          id: mv.id,
          kind: 'movement',
          en: mv.label.en,
          zh: mv.label.zh,
          note: mv.strength
            ? `${tr(`time.movementKind.${mv.kind}`)} · ${tr('time.people', { n: mv.strength.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-SG') })}`
            : tr(`time.movementKind.${mv.kind}`),
          date: dateText(mv.from, mv.to),
          at: [at[0] ?? 0, at[1] ?? 0],
          pinned: true,
          clickable: false,
        });
      }
    }
    if (on.has('control') || on.has('participation')) {
      const geometry = entityGeometry(frame);
      for (const id of hl) {
        const en = model.entities.get(id)?.entity;
        const at = entityAnchor(geometry.get(id));
        if (!en || !at) continue;
        items.push({
          key: `entity:${id}`,
          id,
          kind: 'entity',
          en: en.name.en,
          zh: en.name.zh,
          note: entityNote(id, playhead.get()),
          at,
          pinned: true,
          clickable: false,
        });
      }
    }
    leaders.setItems(presenting ? items.filter((i) => i.pinned).slice(0, PRESENTATION_MAX_LABELS) : items);
  };

  /* ---------- place names (modern countries, borders on; HTML markers, max 8, greedy de-overlap) ---------- */
  interface Label {
    key: string;
    text: string;
    at: LngLat;
    priority: number;
  }
  const labels = new Map<string, { marker: Marker; text: string; label: Label }>();

  const labelCandidates = (): Label[] => {
    if (!lastFrame || presenting || !countryLabels || !layersOn().has('borders')) return [];
    const zoom = map.getZoom();
    if (zoom < PLACE_MIN_ZOOM) return [];
    const limit = Math.round(6 * 2 ** Math.max(0, zoom - 1));
    return countryLabels.filter((c) => c.rank <= limit).map((c) => ({ key: `place:${c.name}`, text: c.name, at: c.at, priority: 10 - c.rank / 1000 }));
  };

  const updateLabels = () => {
    if (!loaded) return;
    const bounds = map.getBounds();
    const { width, height } = container.getBoundingClientRect();
    // Test each position in the world copy the camera is looking at (bounds run past ±180 near the antimeridian).
    const project = (q: LngLat) => map.project(q);
    const nearLng = (at: LngLat) => pickWorldCopy(at[0], (lng) => project([lng, at[1]]).x, width / 2);
    const candidates = labelCandidates()
      .filter((l) => bounds.contains([nearLng(l.at), l.at[1]]))
      .sort((a, b) => b.priority - a.priority);
    // A territory name already says it: skip modern names within 60 px of one.
    const named = candidates.length ? territory.centres() : [];
    const chosen: Label[] = [];
    for (const l of candidates) {
      if (chosen.length >= MAX_PLACE_LABELS) break;
      const p = projectNearCentre(project, l.at, width / 2);
      if (p.x < 0 || p.y < 0 || p.x > width || p.y > height) continue;
      if (named.some((c) => Math.hypot(c.x - p.x, c.y - p.y) < PLACE_CLEAR_PX)) continue;
      chosen.push(l);
    }
    const keep = new Set(chosen.map((l) => l.key));
    for (const [key, entry] of labels) {
      if (!keep.has(key)) {
        entry.marker.remove();
        labels.delete(key);
      }
    }
    for (const l of chosen) {
      let entry = labels.get(l.key);
      if (!entry) {
        const el = document.createElement('div');
        el.className = 'ts-label ts-label--place';
        el.appendChild(document.createElement('span'));
        const marker = new Marker({ element: el, anchor: 'center' });
        marker.setLngLat(l.at).addTo(map);
        entry = { marker, text: '', label: l };
        labels.set(l.key, entry);
      }
      entry.label = l;
      const el = entry.marker.getElement();
      if (entry.text !== l.text) {
        (el.firstChild as HTMLElement).textContent = l.text;
        entry.text = l.text;
      }
      entry.marker.setLngLat(l.at);
    }
    resolveLabelCollisions();
  };

  /**
   * Greedy collision pass over the placed markers, on real screen rects:
   * walk place names in priority order and hide any that overlaps (4px
   * padding) a HUD panel, a leader placard, a territory name or one already
   * kept.
   */
  const LABEL_PAD = 4;
  const resolveLabelCollisions = () => {
    const ordered = [...labels.values()].sort((a, b) => b.label.priority - a.label.priority);
    if (labels.size === 0) return;
    const occupied: DOMRect[] = [...leaders.rects(), ...territory.rects()];
    for (const entry of ordered) {
      const el = entry.marker.getElement();
      const rect = (el.firstElementChild ?? el).getBoundingClientRect();
      const hit =
        rect.width > 0 &&
        occupied.some(
          (o) =>
            rect.left < o.right + LABEL_PAD &&
            rect.right > o.left - LABEL_PAD &&
            rect.top < o.bottom + LABEL_PAD &&
            rect.bottom > o.top - LABEL_PAD,
        );
      el.dataset.collided = String(hit);
      if (!hit) occupied.push(rect);
    }
  };

  /* ---------- scale bar (km, from zoom and latitude) ---------- */
  const scaleBarEl = scaleRoot.querySelector('svg');
  const scaleText = scaleRoot.querySelector('span');
  const updateScale = () => {
    const kt = Number.parseFloat(getComputedStyle(scaleRoot).getPropertyValue('--kt')) || 1;
    const { px, label } = scaleBar(metresPerPixel(map.getZoom(), map.getCenter().lat), SCALE_MAX_PX * kt);
    if (!scaleBarEl || !scaleText || !(px > 0)) return;
    const w = Math.round(px);
    const half = Math.round(w / 2);
    scaleBarEl.setAttribute('width', String(w + 2));
    scaleBarEl.setAttribute('viewBox', `-1 0 ${w + 2} 8`);
    scaleBarEl.innerHTML =
      `<rect x="0" y="3" width="${half}" height="3" class="ts-scale__fill"/>` +
      `<rect x="${half}" y="3" width="${w - half}" height="3" class="ts-scale__open"/>` +
      `<path d="M0 0V8M${half} 2V7M${w} 0V8" class="ts-scale__tick"/>`;
    scaleText.textContent = label.toLocaleUpperCase('en');
  };

  /* ---------- clicks on events (44px hit box) ---------- */
  map.on('click', (e) => {
    const on = layersOn();
    const targets = [...(on.has('battles') ? [LAYER.eventRing] : []), ...(on.has('sites') ? [LAYER.siteHit] : [])];
    if (targets.length === 0) return;
    const { x, y } = e.point;
    const hits = map.queryRenderedFeatures(
      [
        [x - HIT_RADIUS, y - HIT_RADIUS],
        [x + HIT_RADIUS, y + HIT_RADIUS],
      ],
      { layers: targets },
    );
    let best: { id: string; d: number } | null = null;
    for (const f of hits) {
      const id = (f.properties as { id?: string }).id;
      const g = f.geometry;
      if (!id || g.type !== 'Point') continue;
      // Tile geometry sits in the main world copy; compare in the copy under the click.
      const p = projectNearCentre((q) => map.project(q), g.coordinates as LngLat, x);
      const d = Math.hypot(p.x - x, p.y - y);
      if (!best || d < best.d) best = { id, d };
    }
    if (best) options.onSelectEvent(best.id);
  });

  /* ---------- regional 1:10m land (lazy: zoomed in over Southeast Asia) ---------- */
  let hiState: 'idle' | 'loading' | 'done' = 'idle';
  const ensureHiResLand = async () => {
    if (hiState !== 'idle' || !loaded || map.getZoom() < HI_LOAD_ZOOM) return;
    const b = map.getBounds();
    const [w, s, e, n] = HI_BBOX;
    if (b.getEast() < w || b.getWest() > e || b.getNorth() < s || b.getSouth() > n) return;
    hiState = 'loading';
    try {
      const res = await fetch(landHiUrl);
      if (!res.ok) throw new Error(`${res.status} ${landHiUrl}`);
      const topo = (await res.json()) as Parameters<typeof topoFeature>[0];
      if (destroyed) return;
      const fc = topoFeature(topo, (topo.objects as Record<string, Parameters<typeof topoFeature>[1]>).sea!) as FeatureCollection;
      source(HI.src)?.setData(fc);
      hiState = 'done';
    } catch (err) {
      hiState = 'idle';
      console.warn('[atlas] regional coastline unavailable:', err);
    }
  };
  map.on('moveend', () => void ensureHiResLand());

  /* ---------- camera ---------- */
  const applyCamera = (camera: GeoCamera, instant: boolean) => {
    const target = { center: camera.center, zoom: camera.zoom, pitch: camera.pitch ?? 0, bearing: camera.bearing ?? 0 };
    if (instant || reducedMotion) map.jumpTo(target);
    else map.flyTo({ ...target, duration: FLY_MS, essential: true });
  };

  let userGesture = false;
  let camTimer: ReturnType<typeof setTimeout> | null = null;
  map.on('movestart', (e) => {
    userGesture = Boolean((e as { originalEvent?: Event }).originalEvent);
  });
  map.on('move', () => {
    reorientArrows();
    updateScale();
  });
  map.on('render', () => {
    leaders.update();
    territory.reproject();
  });
  map.on('moveend', (e) => {
    reorientArrows();
    updateTerritory(true);
    updateLabels();
    // The camera settled: re-measure so the beat's labels sit in the final band right away (no waiting for the slow interval).
    if (presenting) leaders.relayout();
    const fromUser = userGesture || Boolean((e as { originalEvent?: Event }).originalEvent);
    userGesture = false;
    if (!fromUser) return;
    if (camTimer) clearTimeout(camTimer);
    camTimer = setTimeout(() => {
      const c = map.getCenter();
      const r = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;
      const next: GeoCamera = { center: [r(c.lng, 4), r(c.lat, 4)], zoom: r(map.getZoom(), 2) };
      const pitch = r(map.getPitch(), 1);
      const bearing = r(map.getBearing(), 1);
      if (pitch) next.pitch = pitch;
      if (bearing) next.bearing = bearing;
      store.getState().setCamera(next);
    }, CAMERA_WRITE_DEBOUNCE);
  });
  disposers.push(() => {
    if (camTimer) clearTimeout(camTimer);
  });

  /* ---------- store + playhead subscriptions ---------- */
  disposers.push(
    store.subscribe((s, prev) => {
      if (s.transition.id !== prev.transition.id && isGeoCamera(s.camera)) applyCamera(s.camera, s.transition.instant);
      if (s.layers !== prev.layers) {
        applyVisibility();
        requestRender();
      }
      if (s.highlight !== prev.highlight) requestRender();
    }),
  );
  disposers.push(playhead.subscribe(requestRender));

  /* ---------- theme ---------- */
  const applyTheme = () => {
    tokens = readThemeTokens();
    applyHatches();
    const next = baseStyle(tokens);
    for (const layer of [...next.layers, ...hiResLayers(tokens), ...dataLayers(tokens)]) {
      if (!map.getLayer(layer.id) || !('paint' in layer) || !layer.paint) continue;
      for (const [key, value] of Object.entries(layer.paint)) {
        // Animated opacities (control crossfade, reference fade) and the dash are re-applied by render().
        if (layer.id === LAYER.reference && key.startsWith('line-opacity')) continue;
        map.setPaintProperty(layer.id, key, value);
      }
    }
    applyVisibility();
    for (const key of Object.keys(signatures)) delete signatures[key];
    marksSig = '';
    render();
  };
  const themeObserver = new MutationObserver(() => {
    if (loaded) applyTheme();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  disposers.push(() => themeObserver.disconnect());

  /* ---------- go ---------- */
  map.on('load', () => {
    if (destroyed) return;
    loaded = true;
    // The theme may have changed while the style was loading.
    applyTheme();
    void ensureHiResLand();
    updateScale();
    leaders.relayout();
    const s = store.getState();
    if (isGeoCamera(s.camera)) applyCamera(s.camera, true);
  });

  return {
    setLocale(next) {
      if (next === locale) return;
      locale = next;
      for (const entry of labels.values()) entry.text = '';
      if (lastFrame) updateLeaders(lastFrame);
      updateLabels();
    },
    setLeadersSvg(svg) {
      leaders.setSvg(svg);
    },
    setGraticule(on) {
      graticuleOn = on;
      applyVisibility();
    },
    setTerritory(on) {
      if (on === territoryOn) return;
      territoryOn = on;
      updateTerritory(true);
      updateLabels();
    },
    refreshLabels() {
      leaders.relayout();
    },
    setPresentation(on) {
      if (on === presenting) return;
      presenting = on;
      requestRender();
      updateLabels();
      // Placards are a little larger on the presentation stage: measure them again.
      leaders.relayout();
    },
    setReference(on, instant) {
      referenceOn = on;
      if (!loaded) return;
      const duration = instant || reducedMotion ? 0 : REFERENCE_MS;
      map.setPaintProperty(LAYER.reference, 'line-opacity-transition', { duration, delay: 0 });
      map.setPaintProperty(LAYER.reference, 'line-opacity', on ? 0.85 : 0);
      delete signatures[SRC.reference];
      requestRender();
    },
    fitCamera() {
      if (!model.bounds) return null;
      const [w, s, e, n] = model.bounds;
      const fit = map.cameraForBounds(
        [
          [w, s],
          [e, n],
        ],
        { padding: Math.round(Math.min(container.clientWidth, container.clientHeight) * 0.18) },
      );
      if (!fit?.center) return null;
      const c = fit.center as { lng: number; lat: number };
      const r = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;
      return { center: [r(c.lng, 3), r(c.lat, 3)], zoom: r(fit.zoom ?? map.getZoom(), 2) };
    },
    stats() {
      const on = layersOn();
      let features = 0;
      for (const [id, n] of Object.entries(featureCounts)) {
        if (id === SRC.movements && !on.has('movements')) continue;
        if (id === SRC.events && !on.has('battles')) continue;
        if (id === SRC.sites && !on.has('sites')) continue;
        if (id === SRC.participation && !on.has('participation')) continue;
        if ((id === SRC.prev || id === SRC.next) && !on.has('control')) continue;
        features += n;
      }
      if (graticuleOn) features += graticuleData.features.length;
      if (on.has('borders') && countryLabels) features += countryLabels.length;
      return { features, zoom: Math.round(map.getZoom() * 10) / 10 };
    },
    destroy() {
      destroyed = true;
      for (const dispose of disposers) dispose();
      for (const m of arrows.values()) m.remove();
      for (const m of marks.values()) m.remove();
      for (const { marker } of labels.values()) marker.remove();
      arrows.clear();
      marks.clear();
      labels.clear();
      map.remove();
    },
  };
}

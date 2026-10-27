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
 * The style itself is built in style.ts. A regional plate (`basemap.region`)
 * swaps the world for the plate's own land, keeps the camera on the sheet
 * (lib/region.ts), and shows its dated rivers with their names (rivers.ts).
 * Island-scale land (`basemap.local`) with dated coasts shows the one era at
 * the playhead (lib/localLand.ts), today's coastline dashed over it.
 * Frontiers along `certainty: approximate` areas are dashed.
 *
 * Loaded lazily (dynamic import) so MapLibre stays out of the View chunk.
 */
import { Map as MlMap, Marker, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, FeatureCollection } from 'geojson';
import { feature as topoFeature } from 'topojson-client';
import type { SceneStore } from '../../../core/store';
import type { GeoCamera, Locale } from '../../../core/types';
import { isGeoCamera } from '../../../core/camera';
import { readThemeTokens, resolveColorRef, type ThemeTokens } from '../../../../theme/theme';
import { t as translate, tx, withBase } from '../../../../i18n';
import type { TimeSceneExt } from '../../index';
import { entityBlocAt, type TimeModel } from '../../lib/model';
import type { SceneEvent } from '../../schema';
import { sideAt, warStatusAt } from '../../lib/bloc';
import { blocLabel, entityDated, entityWord } from '../../lib/blocLabels';
import type { BasemapOptions, BlocLabels, DatedLayerDef, EntityStrings } from '../../../../content/schema/topic';
import type { Playhead } from '../../lib/playhead';
import { frameAt, type Frame } from '../../lib/frame';
import { areaLabelPoint, metresPerPixel, pickWorldCopy, pointAlong, projectNearCentre, scaleBar, type LngLat } from '../../lib/geo';
import { hasMapAnchor, missionBadge } from '../../lib/missions';
import { referencePair } from '../../lib/stats';
import { formatTime, formatTimeRange } from '../../lib/format';
import { aspectBounds, regionGraticule, regionMaxBounds } from '../../lib/region';
import { parseRivers, riverCollection, riversAt, type RiverN } from '../../lib/rivers';
import { decodeLocalLand, localEraAt, localLandFilter, parseLocalLand, type LocalEra } from '../../lib/localLand';
import { decodeDatedLayer, type DatedLayerLoaded } from '../../lib/datedLayers';
import { createLeaders, intersects, type LeaderItem } from './leaders';
import { createTerritoryLabels } from './territory';
import { createRiverLabels } from './rivers';
import { createDatedMapLayer, type DatedLayerStats, type DatedMapLayer } from './datedLayers';
import { EMPTY, GROUPS, HI, HI_BBOX, HI_LOAD_ZOOM, LAYER, LOCAL, MAX_ZOOM, DASH_SEQUENCE, DASH_STEP_MS, REFERENCE_MS, REGION, SRC, buildGeoStyle, graticule, riverFilter } from './style';

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
  /** The topic's island-scale land or regional plate (`topic.basemap`), and its `maxZoom`. */
  basemap?: BasemapOptions;
  /** The topic's wording for entity dates (`topic.strings`); the UI strings when absent. */
  strings?: EntityStrings;
  /** Optional static point, line or area sources with numeric year windows. */
  datedLayers?: readonly DatedLayerDef[];
  onSelectEvent(id: string): void;
  /** The island-scale land (`basemap.local`) has loaded: whether it has a `coast-today` line (the legend lists it). */
  onLocalLand?(info: { coastToday: boolean }): void;
  /** Dates have been indexed once; the PLATE can calculate counts without scanning features. */
  onDatedLayers?(info: DatedLayerLoaded[]): void;
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
  /** Regional plate: the camera that shows the whole plate (the first preset); null on the world map. */
  plateCamera(): GeoCamera | null;
  stats(): { features: number; eventMarkers?: number; zoom: number; datedLayers: Record<string, DatedLayerStats> };
  destroy(): void;
}

/* ------------------------------------------------------------------ */
/* Ids and constants                                                   */
/* ------------------------------------------------------------------ */

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
/** An approximate area (`certainty: approximate`): its tint and hatch this much lighter. */
const APPROX_TINT = 0.7;
const APPROX_HATCH = 0.55;
/** Modern country names (borders on): a secondary class, only close in and away from territory names. */
const MAX_PLACE_LABELS = 8;
const PLACE_MIN_ZOOM = 5;
const PLACE_CLEAR_PX = 60;
/** Leader labels shown for a presentation beat (its highlighted ids). */
const PRESENTATION_MAX_LABELS = 6;
const HIT_RADIUS = 22; // 44px hit box around events
const PULSE_MS = 900;
const FLY_MS = 2200;
const CAMERA_WRITE_DEBOUNCE = 250;
/** Hatch tile in CSS px (one 45° line per tile). */
const HATCH_PX = 7;
const SCALE_MAX_PX = 120;

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
  const localLand = options.basemap?.local ?? null;
  const landLocalUrl = localLand ? withBase(`/geo/${localLand}.json`) : null;
  const countriesUrl = withBase('/geo/countries-50m.json');
  const bordersUrl = withBase('/geo/borders-50m.json');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const pixelRatio = Math.min(3, Math.max(1, Math.round(window.devicePixelRatio || 1)));
  /** A regional plate (`basemap.region`): no world land, no modern borders, the camera kept on the plate. */
  const region = options.basemap?.region ?? null;
  const regionLandUrl = region ? withBase(`/geo/${region.land}.json`) : null;
  const riversUrl = region?.rivers ? withBase(`/geo/${region.rivers}.json`) : null;
  const graticuleData = region ? regionGraticule(region.bounds) : graticule();
  let graticuleOn = true;
  let territoryOn = true;
  let referenceOn = false;
  let presenting = false;
  const datedLayers: DatedMapLayer[] = [];

  /** Camera limit of a regional plate: its `maxBounds` widened to the stage's aspect ratio (re-set on resize). */
  const plateLimit = () => aspectBounds(regionMaxBounds(region!), container.clientWidth, container.clientHeight);
  const styleFor = (tk: ThemeTokens) => buildGeoStyle({ tokens: tk, landUrl, graticule: graticuleData, local: localLand, region });
  const style = styleFor(tokens);

  const initial = store.getState();
  const cam = isGeoCamera(initial.camera) ? initial.camera : null;
  const map = new MlMap({
    container,
    style,
    ...(cam
      ? { center: cam.center, zoom: cam.zoom, pitch: cam.pitch ?? 0, bearing: cam.bearing ?? 0 }
      : region
        ? { bounds: region.bounds, fitBoundsOptions: { padding: 0 } }
        : model.bounds
          ? { bounds: model.bounds, fitBoundsOptions: { padding: 48 } }
          : { center: [0, 20] as [number, number], zoom: 1.5 }),
    // A regional plate: the viewport never leaves the sheet, so the rest of the world is out of reach (this also floors the zoom at the whole plate).
    ...(region ? { maxBounds: plateLimit() } : {}),
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    maxZoom: options.basemap?.maxZoom ?? MAX_ZOOM,
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
  const resizeObserver = new ResizeObserver(() => {
    map.resize();
    if (region) map.setMaxBounds(plateLimit());
  });
  resizeObserver.observe(container);
  disposers.push(() => resizeObserver.disconnect());

  /* ---------- helpers ---------- */
  const source = (id: string) => map.getSource(id) as GeoJSONSource | undefined;
  const tr = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) => translate(locale, key, vars);

  /** Some control area is only approximately known: the hatch fades per feature and the dashed frontier layers are drawn. */
  const approximate = model.keyframes.some((k) => k.keyframe.features.features.some((f) => f.properties.certainty === 'approximate'));

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
    const date = (p: Parameters<typeof formatTime>[0]) => formatTime(p, locale, model.datePrecision, model.mixedEra);
    if (status === 'after') {
      const left = en.left !== undefined ? entityDated(options.strings, 'left', date(en.left), locale) : null;
      return left ?? `${blocLabel(options.blocLabels, 'out', locale)}${en.left !== undefined ? ` · ${date(en.left)}` : ''}`;
    }
    if (status === 'before') return entityWord(options.strings, 'notYet', locale);
    return `${blocLabel(options.blocLabels, entityBlocAt(model, id, t), locale)} · ${entityDated(options.strings, 'joined', date(en.joined), locale)}`;
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
      // A regional plate has no modern borders.
      const show = on.has(group) && !(region && group === 'borders');
      for (const id of ids) map.setLayoutProperty(id, 'visibility', show ? 'visible' : 'none');
    }
    map.setLayoutProperty(LAYER.graticule, 'visibility', graticuleOn ? 'visible' : 'none');
    // Today's coastline over a dated island coast is a reference line, read with the names (N).
    if (localLand && !region) map.setLayoutProperty(LOCAL.today, 'visibility', territoryOn ? 'visible' : 'none');
    for (const layer of datedLayers) layer.setVisible(on.has(layer.id));
    if (on.has('borders') && !region) void ensureCountries();
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
    // Topology with any frontier: the edges are frontiers (certain ones solid, approximate ones dashed), not outlines.
    const edges = Boolean(frontier || kf.frontierApprox);
    const lineColor = tokens.line || tokens.ink || '#2a2824';
    const features: Feature[] = kf.features.features.map((f) => {
      const color = entityColor(f.properties.holder, t);
      const marked = hl.has(f.properties.holder);
      const approx = f.properties.certainty === 'approximate';
      return {
        type: 'Feature',
        geometry: f.geometry,
        properties: {
          holder: f.properties.holder,
          color,
          pattern: hatchId(f.properties.holder, t),
          hl: marked,
          // A highlighted holder is tinted stronger where its outline is not drawn; an approximate area lighter.
          tint: (edges && marked ? HIGHLIGHT_TINT : 1) * (approx ? APPROX_TINT : 1),
          ho: approx ? APPROX_HATCH : 1,
          lc: color,
          lw: edges ? 0 : marked ? 2.8 : 1,
          dash: !edges && approx,
        },
      };
    });
    // The fill layers never draw a line, but they still evaluate their colour and pattern on it: give it harmless ones.
    const edge = (geometry: NonNullable<typeof frontier>, dash: boolean): Feature => ({
      type: 'Feature',
      geometry,
      properties: { lc: lineColor, lw: FRONTIER_PX, color: lineColor, pattern: 'ts-hatch-b-neutral', tint: 0, ho: 0, dash },
    });
    if (frontier) features.push(edge(frontier, false));
    if (kf.frontierApprox) features.push(edge(kf.frontierApprox, true));
    return { type: 'FeatureCollection', features };
  };

  /** The adjacent keyframe for REFERENCE: its frontier (else its outlines) as dashed ink lines, nothing filled. */
  const referenceFc = (index: number): FeatureCollection => {
    const kf = model.keyframes[index]?.keyframe;
    if (!kf) return EMPTY;
    const frontiers = [kf.frontier, kf.frontierApprox].filter((g) => g !== undefined);
    if (frontiers.length) return { type: 'FeatureCollection', features: frontiers.map((geometry) => ({ type: 'Feature', geometry, properties: {} })) };
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
    // The largest polygon on screen (Italy's mainland, not Libya), else the largest overall.
    const width = container.clientWidth;
    const height = container.clientHeight;
    return areaLabelPoint(polys, (at) => {
      const p = projectNearCentre((q) => map.project(q), at, width / 2);
      return p.x >= 0 && p.y >= 0 && p.x <= width && p.y <= height;
    });
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
      map.setPaintProperty(prefix === 'prev' ? LAYER.prevHatch : LAYER.nextHatch, 'fill-opacity', approximate ? ['*', o, ['get', 'ho']] : o);
      map.setPaintProperty(prefix === 'prev' ? LAYER.prevLine : LAYER.nextLine, 'line-opacity', o);
      if (approximate) map.setPaintProperty(prefix === 'prev' ? LAYER.prevDash : LAYER.nextDash, 'line-opacity', o);
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
          properties: { id, color: sideColor(mv.m.movement.holder, mv.m.start), width: hl.has(id) ? base + 0.8 : base, op: mv.opacity, persist: mv.persisting },
        };
      });
    setIfChanged(
      SRC.movements,
      `${frame.movements.map((m) => `${m.m.movement.id}:${m.progress.toFixed(4)}:${m.opacity.toFixed(2)}`).join(',')}|${hlSig}|${themeSig}`,
      () => ({ type: 'FeatureCollection', features: moveFeatures }),
    );
    updateArrowheads(frame, on.has('movements'));

    /* events: hollow ring (hairline) + dot sized by importance; squares and siege rings are HTML (updateMarks) */
    const eventFeatures: Feature[] = frame.events.flatMap((ef): Feature[] => {
      const en = model.events.find((x) => x.event.id === ef.id)!;
      const e = en.event;
      if (!hasMapAnchor(e)) return [];
      const isHl = hl.has(e.id);
      const color = eventColor(e, en.start);
      return [{
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
      }];
    });
    setIfChanged(
      SRC.events,
      `${frame.events.map((e) => `${e.id}:${e.active ? 1 : 0}`).join(',')}|${hlSig}|${themeSig}`,
      () => ({ type: 'FeatureCollection', features: eventFeatures }),
    );

    /* one-shot pulse when an event becomes active */
    const nowActive = new Set(frame.events.filter((e) => e.active && hasMapAnchor(model.events.find((item) => item.event.id === e.id)!.event)).map((e) => e.id));
    if (activeEvents && on.has('battles') && !reducedMotion) {
      for (const id of nowActive) if (!activeEvents.has(id)) pulse(id);
    }
    activeEvents = nowActive;

    /* sites: static points, independent of `t` (hit targets here, diamonds in updateMarks) */
    setIfChanged(SRC.sites, `${on.has('sites')}`, () =>
      on.has('sites')
        ? {
            type: 'FeatureCollection',
            features: model.sites.filter(hasMapAnchor).map((e) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: e.at }, properties: { id: e.id } })),
          }
        : EMPTY,
    );
    updateMarks(frame, on, hl, hlSig);

    updateRivers(t);
    updateLocalEra(t);
    for (const layer of datedLayers) {
      layer.setTheme(tokens, datedColor(layer.def, t));
      layer.update(t);
    }
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
        // A built line (`persist`) that is finished has no head.
        if (mv.persisting) continue;
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
    if (e.kind === 'milestone' || e.kind === 'mission') return tokens.ink;
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
        if (!hasMapAnchor(e)) continue;
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
      for (const e of model.sites.filter(hasMapAnchor)) want.set(`site:${e.id}`, { at: e.at, className: 'ts-mark ts-mark--site', size: 9, active: true, hl: hl.has(e.id) });
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
    if (!hasMapAnchor(e)) return;
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

  /* ---------- rivers of a regional plate (dated courses; names follow N) ---------- */
  let rivers: RiverN[] = [];
  const riverLabels = createRiverLabels(map);
  disposers.push(() => riverLabels.destroy());
  let riverSig = '';
  /** Show the courses that exist at `t`: re-filter the layers (and the names) only when that set changes. */
  const updateRivers = (t: number) => {
    if (!region || !rivers.length) return;
    const ids = riversAt(rivers, t);
    const sig = `${ids.join(',')}|${territoryOn}|${locale}`;
    if (sig === riverSig) return;
    riverSig = sig;
    map.setFilter(REGION.riverLine, riverFilter(ids, false));
    map.setFilter(REGION.riverRec, riverFilter(ids, true));
    riverLabels.show(territoryOn ? new Set(ids) : null, locale);
    riverLabels.resolve([...leaders.rects(), ...territory.rects()]);
  };
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
    const s = formatTimeRange(from, to, locale, model.datePrecision, model.mixedEra);
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
        if (!hasMapAnchor(e)) continue;
        items.push({
          key: `event:${e.id}`,
          id: e.id,
          kind: 'event',
          badge: missionBadge(e, locale) ?? undefined,
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
      for (const e of model.sites.filter(hasMapAnchor)) {
        if (!hl.has(e.id)) continue;
        items.push({
          key: `event:${e.id}`,
          id: e.id,
          kind: 'event',
          badge: missionBadge(e, locale) ?? undefined,
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
    if (region) riverLabels.resolve([...leaders.rects(), ...territory.rects()]);
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
    if (region || hiState !== 'idle' || !loaded || map.getZoom() < HI_LOAD_ZOOM) return;
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

  /* ---------- island-scale land (topic.basemap.local; fetched once the map has loaded) ---------- */
  /** Dated coasts of the local land (null: undated, drawn as it is); the era on show (-1 = none yet). */
  let localEras: LocalEra[] | null = null;
  let localEra = -1;
  const loadLocalLand = async () => {
    if (!landLocalUrl || !localLand) return;
    try {
      const res = await fetch(landLocalUrl);
      if (!res.ok) throw new Error(`${res.status} ${landLocalUrl}`);
      const topo = (await res.json()) as Parameters<typeof topoFeature>[0];
      if (destroyed) return;
      const fc = decodeLocalLand(topo, localLand);
      if (!fc) throw new Error(`${landLocalUrl} has no object "${localLand}"`);
      const parsed = parseLocalLand(fc);
      localEras = parsed.eras;
      localEra = -1;
      // One era at a time, filtered before the data arrives: never two coasts on screen at once.
      updateLocalEra(playhead.get());
      source(LOCAL.src)?.setData(parsed.collection);
      options.onLocalLand?.({ coastToday: parsed.coastToday });
    } catch (err) {
      console.warn('[atlas] island-scale coastline unavailable:', err);
    }
  };
  /** Dated local land: show the coast of the era at `t` (re-filter the fill and edge only when the era changes). */
  const updateLocalEra = (t: number) => {
    if (!localEras || !loaded) return;
    const era = localEraAt(localEras, t);
    if (era === null || era === localEra) return;
    localEra = era;
    map.setFilter(LOCAL.fill, localLandFilter(era));
    map.setFilter(LOCAL.edge, localLandFilter(era));
  };

  /* ---------- optional dated data layers (one static GPU source per definition) ---------- */
  const datedColor = (def: DatedLayerDef, t: number) =>
    def.color ? resolveColorRef(def.color, tokens) : def.holder ? entityColor(def.holder, t) : tokens.ink;
  const loadDatedLayers = async () => {
    const definitions = options.datedLayers ?? [];
    if (!definitions.length) return;
    const results = await Promise.allSettled(definitions.map(async (def) => {
      const topo = await fetchJson<Parameters<typeof topoFeature>[0]>(withBase(`/geo/${def.file}.json`));
      const collection = decodeDatedLayer(topo, def.file);
      if (!collection) throw new Error(`${def.file}.json has no object "${def.file}"`);
      return { def, collection };
    }));
    if (destroyed) return;
    for (const result of results) {
      if (result.status === 'rejected') {
        console.warn('[atlas] dated layer unavailable:', result.reason);
        continue;
      }
      const { def, collection } = result.value;
      const t = playhead.get();
      datedLayers.push(createDatedMapLayer(map, def, collection, tokens, datedColor(def, t), t));
    }
    applyVisibility();
    options.onDatedLayers?.(datedLayers.map(({ id, index }) => ({ id, index })));
    requestRender();
  };

  /* ---------- regional plate: its land (into the base `land` source) and its rivers ---------- */
  const loadRegion = async () => {
    if (!region || !regionLandUrl) return;
    const land = (async () => {
      const res = await fetch(regionLandUrl);
      if (!res.ok) throw new Error(`${res.status} ${regionLandUrl}`);
      const topo = (await res.json()) as Parameters<typeof topoFeature>[0];
      if (destroyed) return;
      const objects = topo.objects as Record<string, Parameters<typeof topoFeature>[1]>;
      const obj = objects[region.land] ?? Object.values(objects)[0];
      if (!obj) throw new Error(`${regionLandUrl} has no object "${region.land}"`);
      source('land')?.setData(topoFeature(topo, obj) as FeatureCollection);
    })();
    const water = (async () => {
      if (!riversUrl) return;
      const res = await fetch(riversUrl);
      if (!res.ok) throw new Error(`${res.status} ${riversUrl}`);
      const raw: unknown = await res.json();
      if (destroyed) return;
      rivers = parseRivers(raw);
      source(REGION.rivers)?.setData(riverCollection(rivers));
      riverLabels.set(rivers);
      riverSig = '';
      requestRender();
    })();
    for (const result of await Promise.allSettled([land, water])) {
      if (result.status === 'rejected') console.warn('[atlas] regional plate unavailable:', result.reason);
    }
  };

  /* ---------- camera ---------- */
  const applyCamera = (camera: GeoCamera, instant: boolean) => {
    const target = { center: camera.center, zoom: camera.zoom, pitch: camera.pitch ?? 0, bearing: camera.bearing ?? 0 };
    if (instant || reducedMotion) map.jumpTo(target);
    else map.flyTo({ ...target, duration: FLY_MS, essential: true });
  };

  let userGesture = false;
  let camTimer: ReturnType<typeof setTimeout> | null = null;
  map.on('movestart', (e) => {
    userGesture = userGesture || Boolean((e as { originalEvent?: Event }).originalEvent);
  });
  // A wheel zoom's movestart carries no originalEvent: mark it here so the camera is written back too.
  map.on('wheel', () => {
    userGesture = true;
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
      if (s.transition.id !== prev.transition.id && isGeoCamera(s.camera)) {
        // The transition takes the camera: a pan / zoom still waiting to be written back is dropped.
        if (camTimer) clearTimeout(camTimer);
        camTimer = null;
        userGesture = false;
        applyCamera(s.camera, s.transition.instant);
      }
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
    for (const layer of styleFor(tokens).layers) {
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
    void loadLocalLand();
    void loadRegion();
    void loadDatedLayers();
    updateScale();
    leaders.relayout();
    const s = store.getState();
    if (isGeoCamera(s.camera)) applyCamera(s.camera, true);
  });

  return {
    setLocale(next) {
      if (next === locale) return;
      locale = next;
      updateRivers(playhead.get());
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
      applyVisibility();
      updateRivers(playhead.get());
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
    plateCamera() {
      if (!region) return null;
      const [w, s, e, n] = region.bounds;
      const fit = map.cameraForBounds(
        [
          [w, s],
          [e, n],
        ],
        { padding: 0 },
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
      if (on.has('borders') && countryLabels && !region) features += countryLabels.length;
      if (region) features += riverSig ? riverSig.split('|')[0]!.split(',').filter(Boolean).length : 0;
      const dated = Object.fromEntries(datedLayers.map((layer) => [layer.id, layer.stats()]));
      for (const layer of datedLayers) if (on.has(layer.id)) features += dated[layer.id]!.visible;
      return { features, eventMarkers: on.has('battles') ? featureCounts[SRC.events] ?? 0 : 0, zoom: Math.round(map.getZoom() * 10) / 10, datedLayers: dated };
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

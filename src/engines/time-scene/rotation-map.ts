/**
 * The rotation map (docs/72 E-CD2–E-CD4): today's coastlines and evidence points turned with a plate
 * model's rotation file, recomputed for every age the playhead passes through. A separate MapLibre
 * path, chosen by GeoStage before the historical controller creates any source; lazy-loaded for
 * `basemap.rotation` topics only.
 *
 * Scheduling: the age is quantised to the topic's `maDigits`; one geometry update is in flight at a
 * time and only the newest age waits behind it (intermediate ages are dropped, never queued). While
 * the playhead moves the coarse level of detail is drawn; 300 ms after it stops, the fine one.
 * Layers that show today's measurements (`present-only`) appear only at 0.0 Ma and never rotate.
 */
import { Map as MlMap, type GeoJSONSource, type MapMouseEvent, type StyleSpecification, type ExpressionSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import type { GeoCamera, Locale } from '../core/types';
import { isGeoCamera } from '../core/camera';
import { createMapHudFraming } from './lib/hud-framing';
import { globeFitZoom } from './lib/globeFit';
import { readThemeTokens, type ThemeTokens } from '../../theme/theme';
import { withBase } from '../../i18n';
import type { GeoController, GeoControllerOptions } from './stages/geo/controller';
import { decodeTopologyObject } from './lib/control';
import { createRotationModel, type RotationFile, type RotationModel } from './lib/plateRotation';
import { prepareLayer, rotateLayer, validAt, type PreparedLayer } from './lib/rotatedGeometry';
import { graticule } from './stages/geo/style';
import { createLeaders, type LeaderItem } from './stages/geo/leaders';
import type { FossilsFile, GpsFile, RotationManifest, RotationPointsFile } from './rotation-schema';

/** The zoom ceiling shared with the reconstruction map: no island-scale claim for rotated coastlines. */
export const ROTATION_MAX_ZOOM = 3.6;
const FINE_AFTER_MS = 300;
/** GPS arrows: 10 mm a year is drawn as 2.5° of arc (a display scale, docs/72 S30). */
export const GPS_DEG_PER_MM = 0.25;

export interface RotationText { title: { en: string; zh: string }; summary: { en: string; zh: string }; sources: string[] }
export interface RotationObjects {
  manifest: RotationManifest;
  points: RotationPointsFile;
  fossils: FossilsFile | null;
  gps: GpsFile | null;
  text: Record<string, RotationText>;
}
export interface RotationStats {
  selectedMa: number;
  modelId: string;
  status: 'loading' | 'ready' | 'unavailable';
  lod: 'scrub' | 'full';
  projection: 'globe' | 'mercator';
  geometryUpdates: number;
  verticesDrawn: number;
  featuresDrawn: number;
  presentOnlyVisible: boolean;
  lastUpdateMs: number;
  /** Main-thread time of each recent geometry update (rotation + GeoJSON assembly), ms. */
  updateMs: number[];
  inFlight: number;
}
export interface RotationApi {
  stats(): RotationStats;
  objects(): RotationObjects | null;
  /** Today's [lon, lat] of an object carried to the selected age (null when it does not exist then). */
  positionAt(id: string, ma?: number): [number, number] | null;
  subscribe(listener: () => void): () => void;
  /** Fly to an object where it is at the selected age. */
  focus(id: string): void;
  /** The object the reader picked (map or index); its detail shows in the reader until the highlight changes. */
  selected(): string | null;
  select(id: string, fly: boolean): void;
  /** QA: the map centre and container-local screen points of [lon, lat] (null on the far side of the globe). */
  probe(points: [number, number][]): { center: [number, number]; zoom: number; screen: ([number, number] | null)[] };
}

const quantize = (ma: number, digits: number) => { const k = 10 ** digits; return Math.round(Math.max(0, ma) * k) / k; };
const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

const SRC = { land: 'cd-src-land', shelf: 'cd-src-shelf', objects: 'cd-src-objects', fossils: 'cd-src-fossils', trail: 'cd-src-trail', seafloor: 'cd-src-seafloor', stripes: 'cd-src-stripes', gps: 'cd-src-gps', graticule: 'cd-src-graticule' } as const;

function style(tokens: ThemeTokens, projection: 'globe' | 'mercator'): StyleSpecification {
  const hl = (on: unknown, off: unknown): ExpressionSpecification => ['case', ['boolean', ['feature-state', 'hl'], false], on, off] as ExpressionSpecification;
  return {
    version: 8,
    name: 'atlas-rotation',
    ...(projection === 'globe' ? { projection: { type: 'globe' } } : {}),
    transition: { duration: 0, delay: 0 },
    sources: Object.fromEntries(Object.values(SRC).map((id) => [id, { type: 'geojson', data: id === SRC.graticule ? graticule() : EMPTY, maxzoom: 4, ...(id === SRC.objects || id === SRC.fossils || id === SRC.gps ? { promoteId: 'id' } : {}) }])) as StyleSpecification['sources'],
    layers: [
      { id: 'cd-water', type: 'background', paint: { 'background-color': tokens.water } },
      { id: 'cd-seafloor', type: 'fill', source: SRC.seafloor, layout: { 'fill-sort-key': ['get', 'band'], visibility: 'none' },
        paint: { 'fill-color': ['interpolate-lab', ['linear'], ['get', 'olderThanMa'], 0, tokens.hot, 90, tokens.lamp, 180, tokens.cold], 'fill-opacity': 0.55, 'fill-antialias': false } },
      { id: 'cd-stripes', type: 'fill', source: SRC.stripes, filter: ['==', ['get', 'sign'], 'positive'], layout: { visibility: 'none' }, paint: { 'fill-color': tokens.ink, 'fill-opacity': 0.55, 'fill-antialias': false } },
      { id: 'cd-graticule', type: 'line', source: SRC.graticule, paint: { 'line-color': tokens['land-edge'], 'line-opacity': 0.35, 'line-width': 0.5 } },
      { id: 'cd-shelf', type: 'fill', source: SRC.shelf, layout: { visibility: 'none' }, paint: { 'fill-color': tokens.land, 'fill-opacity': 0.45, 'fill-antialias': false } },
      { id: 'cd-land', type: 'fill', source: SRC.land, layout: { visibility: 'none' }, paint: { 'fill-color': tokens.land, 'fill-antialias': true } },
      { id: 'cd-land-edge', type: 'line', source: SRC.land, layout: { visibility: 'none' }, paint: { 'line-color': tokens['land-edge'], 'line-opacity': 0.4, 'line-width': 0.5 } },
      { id: 'cd-trail', type: 'line', source: SRC.trail, layout: { visibility: 'none', 'line-join': 'round' }, paint: { 'line-color': tokens.signal, 'line-width': 1.4, 'line-dasharray': [2, 1.5] } },
      { id: 'cd-gps-arrows', type: 'line', source: SRC.gps, filter: ['==', ['get', 'role'], 'arrow'], layout: { visibility: 'none', 'line-cap': 'round' }, paint: { 'line-color': tokens.ink, 'line-width': hl(2.6, 1.6) } },
      { id: 'cd-gps', type: 'circle', source: SRC.gps, filter: ['==', ['get', 'role'], 'station'], layout: { visibility: 'none' }, paint: { 'circle-radius': hl(6, 4), 'circle-color': tokens.paper, 'circle-stroke-color': tokens.ink, 'circle-stroke-width': hl(2, 1.2) } },
      { id: 'cd-ridges', type: 'circle', source: SRC.gps, filter: ['==', ['get', 'role'], 'ridge'], layout: { visibility: 'none' }, paint: { 'circle-radius': hl(6, 0), 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': tokens.signal, 'circle-stroke-width': hl(2, 0) } },
      { id: 'cd-fossils', type: 'circle', source: SRC.fossils, layout: { visibility: 'none' }, paint: { 'circle-radius': hl(5, 3), 'circle-color': hl(tokens.signal, tokens.fossil), 'circle-stroke-color': tokens.ink, 'circle-stroke-width': 0.8, 'circle-opacity': hl(1, 0.8) } },
      ...(['glacial', 'belt', 'site'] as const).map((kind) => ({
        id: kind === 'glacial' ? 'cd-glacial' : kind === 'belt' ? 'cd-belts' : 'cd-singapore', type: 'circle' as const, source: SRC.objects, filter: ['==', ['get', 'kind'], kind] as ExpressionSpecification, layout: { visibility: 'none' as const },
        paint: { 'circle-radius': hl(8, 6), 'circle-color': kind === 'site' ? tokens.signal : tokens.paper, 'circle-stroke-color': kind === 'glacial' ? tokens.cold : kind === 'belt' ? tokens.hot : tokens.ink, 'circle-stroke-width': hl(2.4, 1.8) },
      })),
    ],
  } as StyleSpecification;
}

/** Shared by the map and the reader panels: one fetch per file per page. */
const files = new Map<string, Promise<unknown>>();
export function loadGeo<T>(stem: string): Promise<T> {
  let p = files.get(stem);
  if (!p) {
    p = fetch(withBase(`/geo/${stem}.json`)).then((r) => { if (!r.ok) throw new Error(`Local geometry unavailable: ${stem}`); return r.json(); });
    files.set(stem, p);
    p.catch(() => files.delete(stem));
  }
  return p as Promise<T>;
}

export async function loadRotationObjects(manifestStem: string): Promise<RotationObjects> {
  const manifest = await loadGeo<RotationManifest>(manifestStem);
  const [points, fossils, gps, text] = await Promise.all([
    loadGeo<RotationPointsFile>(manifest.objects.points),
    manifest.objects.fossils ? loadGeo<FossilsFile>(manifest.objects.fossils) : null,
    manifest.objects.gps ? loadGeo<GpsFile>(manifest.objects.gps) : null,
    loadGeo<{ objects: Record<string, RotationText> }>(`${manifest.objects.points}-text`).then((t) => t.objects, () => ({})),
  ]);
  return { manifest, points, fossils, gps, text };
}

export function createRotationMap(options: GeoControllerOptions): GeoController & { rotation: RotationApi } {
  const config = options.basemap!.rotation!;
  const { store, playhead } = options;
  const digits = options.model.maDigits ?? 1;
  const initial = store.getState();
  const camera = isGeoCamera(initial.camera) ? initial.camera : { center: [20, 10] as [number, number], zoom: 2 };
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  let loaded = false;
  let destroyed = false;
  let graticuleOn = true;
  let locale: Locale = options.locale;
  let presenting = false;
  const listeners = new Set<() => void>();
  const emit = () => { for (const l of listeners) l(); };
  const stats: RotationStats = { selectedMa: NaN, modelId: '', status: 'loading', lod: 'full', projection: config.projection, geometryUpdates: 0, verticesDrawn: 0, featuresDrawn: 0, presentOnlyVisible: false, lastUpdateMs: 0, updateMs: [], inFlight: 0 };

  const map = new MlMap({
    container: options.container,
    style: style(readThemeTokens(), config.projection),
    center: camera.center, zoom: Math.min(ROTATION_MAX_ZOOM, camera.zoom),
    bearing: camera.bearing ?? 0, pitch: camera.pitch ?? 0,
    minZoom: 0, maxZoom: ROTATION_MAX_ZOOM,
    renderWorldCopies: config.projection === 'mercator' ? false : true,
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    fadeDuration: 0,
  });
  map.touchZoomRotate.disableRotation();
  options.container.dataset.projection = config.projection;
  const hudFraming = createMapHudFraming(map, options.container, {
    reducedMotion, hud: options.hud, clampZoom: (z) => Math.min(ROTATION_MAX_ZOOM, z),
    // A globe that would only just overflow the free rect sits whole inside it, its rim clear of the HUD.
    ...(config.projection === 'globe' ? { fitZoom: (zoom: number, center: [number, number], rect: { x0: number; y0: number; x1: number; y1: number }, box: { height: number }) => globeFitZoom(zoom, center[1], box.height, rect.x1 - rect.x0, rect.y1 - rect.y0) } : {}),
  });
  map.on('error', (e) => console.warn('[atlas] map:', e.error?.message ?? e));
  const canvas = map.getCanvas();
  let pointerAt = 0;
  const onPointerDown = () => (pointerAt = performance.now());
  const onCanvasFocus = () => { if (performance.now() - pointerAt < 600) canvas.blur(); };
  options.container.addEventListener('pointerdown', onPointerDown, true);
  canvas.addEventListener('focus', onCanvasFocus);
  // Rotated present-day coastlines make no ground-distance claim.
  options.scaleRoot.hidden = true;

  /* ---------- data ---------- */
  let objects: RotationObjects | null = null;
  let model: RotationModel | null = null;
  const prepared: { land?: Record<'scrub' | 'full', PreparedLayer>; shelf?: Record<'scrub' | 'full', PreparedLayer> } = {};
  const presentLoaded = new Set<string>();
  const layerOf = (id: string) => objects?.manifest.layers.find((l) => l.id === id);

  const ready = (async () => {
    const manifest = await loadGeo<RotationManifest>(config.file);
    stats.modelId = manifest.modelId;
    const plateLayer = async (id: string) => {
      const def = manifest.layers.find((l) => l.id === id);
      if (!def?.lod) return undefined;
      const topo = await loadGeo<unknown>(def.file);
      return { scrub: prepareLayer(decodeTopologyObject(topo, def.lod.scrub)), full: prepareLayer(decodeTopologyObject(topo, def.lod.full)) };
    };
    const [rot, land, shelf, objs] = await Promise.all([
      loadGeo<RotationFile>(manifest.rotations), plateLayer('cd-land'), plateLayer('cd-shelf'), loadRotationObjects(config.file),
    ]);
    model = createRotationModel(rot);
    prepared.land = land;
    prepared.shelf = shelf;
    objects = objs;
  })();

  /* ---------- the selected age and the update loop ---------- */
  const selectedMa = () => quantize(-playhead.get() / 1e6, digits);
  let busy = false;
  let again = false;
  let moving = false;
  let fineTimer: ReturnType<typeof setTimeout> | null = null;
  let drawnKey = '';
  const layerOn = (id: string) => store.getState().layers.includes(id);

  const positionAt = (id: string, ma = stats.selectedMa): [number, number] | null => {
    if (!objects || !model) return null;
    const point = objects.points.points.find((p) => p.id === id) ?? objects.points.labels.find((p) => p.id === id) ?? objects.fossils?.points.find((p) => p.id === id);
    if (point) return validAt(point, ma) ? model.rotatePoint(point.plateId, ma, point.at) : null;
    const group = objects.fossils?.groups.find((g) => g.id === id);
    if (group) return positionAt(group.representative, ma);
    const today = objects.gps?.stations.find((s) => s.id === id) ?? objects.gps?.present.find((s) => s.id === id);
    return today && ma === 0 ? today.at : null;
  };

  const objectFeatures = (ma: number): FeatureCollection<Point> => {
    const out: Feature<Point>[] = [];
    for (const p of objects?.points.points ?? []) {
      const at = validAt(p, ma) ? model!.rotatePoint(p.plateId, ma, p.at) : null;
      if (at) out.push({ type: 'Feature', id: p.id, properties: { id: p.id, kind: p.kind }, geometry: { type: 'Point', coordinates: at } });
    }
    return { type: 'FeatureCollection', features: out };
  };
  const fossilFeatures = (ma: number): FeatureCollection<Point> => ({
    type: 'FeatureCollection',
    features: (objects?.fossils?.points ?? []).flatMap((p) => {
      const at = validAt(p, ma) ? model!.rotatePoint(p.plateId, ma, p.at) : null;
      return at ? [{ type: 'Feature' as const, id: p.id, properties: { id: p.id, groups: p.groups.join(' ') }, geometry: { type: 'Point' as const, coordinates: at } }] : [];
    }),
  });
  /** Singapore's model path from the selected age to today, one point per 1 Myr (DS07). */
  const trail = (ma: number): FeatureCollection<LineString> => {
    const site = objects?.points.points.find((p) => p.kind === 'site');
    if (!site || !model || ma <= 0) return EMPTY as FeatureCollection<LineString>;
    const coords: [number, number][] = [];
    for (let t = Math.min(ma, site.from); t >= 0; t = t > 1 && t - 1 > 0 ? t - 1 : t > 0 ? 0 : -1) {
      if (!validAt(site, t)) continue;
      const p = model.rotatePoint(site.plateId, t, site.at)!;
      if (coords.length) { const prev = coords[coords.length - 1]![0]; while (p[0] - prev > 180) p[0] -= 360; while (p[0] - prev < -180) p[0] += 360; }
      coords.push(p);
      if (t === 0) break;
    }
    return { type: 'FeatureCollection', features: coords.length > 1 ? [{ type: 'Feature', properties: { id: 'site-singapore-trail' }, geometry: { type: 'LineString', coordinates: coords } }] : [] };
  };

  const setSource = (id: string, data: FeatureCollection) => (map.getSource(id) as GeoJSONSource).setData(data, true);

  const update = async () => {
    if (destroyed || !loaded || !model) return;
    if (busy) { again = true; return; }
    const ma = selectedMa();
    const lod: 'scrub' | 'full' = moving ? 'scrub' : 'full';
    const key = `${ma}|${lod}|${store.getState().layers.join(',')}`;
    stats.selectedMa = ma;
    if (key === drawnKey) { emit(); return; }
    busy = true;
    stats.inFlight = 1;
    const t0 = performance.now();
    const land = rotateLayer(prepared.land![lod], model, ma);
    const shelf = layerOn('cd-shelf') && prepared.shelf ? rotateLayer(prepared.shelf[lod], model, ma) : null;
    const objs = objectFeatures(ma);
    const fossils = layerOn('cd-fossils') && objects?.fossils ? fossilFeatures(ma) : null;
    const path = layerOn('cd-singapore') ? trail(ma) : EMPTY;
    const spent = performance.now() - t0;
    stats.updateMs = [...stats.updateMs.slice(-59), Math.round(spent * 100) / 100];
    try {
      await Promise.all([
        setSource(SRC.land, land.collection),
        shelf ? setSource(SRC.shelf, shelf.collection) : Promise.resolve(),
        setSource(SRC.objects, objs),
        fossils ? setSource(SRC.fossils, fossils) : Promise.resolve(),
        setSource(SRC.trail, path),
      ]);
    } catch { /* a superseded or destroyed source */ }
    busy = false;
    stats.inFlight = 0;
    if (destroyed) return;
    drawnKey = key;
    stats.geometryUpdates++;
    stats.lod = lod;
    stats.verticesDrawn = land.vertices + (shelf?.vertices ?? 0);
    stats.featuresDrawn = land.features + (shelf?.features ?? 0) + objs.features.length + (fossils?.features.length ?? 0);
    stats.lastUpdateMs = Math.round(spent * 100) / 100;
    stats.status = 'ready';
    options.container.dataset.rotationStatus = 'ready';
    present(ma);
    names();
    leadersFor();
    emit();
    if (again) { again = false; void update(); }
  };

  /** Layers that show today's measurements: on only at 0.0 Ma, loaded the first time they are wanted. */
  const present = (ma: number) => {
    const today = ma === 0;
    stats.presentOnlyVisible = today;
    for (const def of objects?.manifest.layers ?? []) {
      if (def.motion !== 'present-only') continue;
      const want = today && layerOn(def.id);
      const ids = def.id === 'cd-gps' ? ['cd-gps', 'cd-gps-arrows'] : def.id === 'cd-seafloor' ? ['cd-seafloor', 'cd-ridges'] : def.id === 'cd-stripes' ? ['cd-stripes'] : [def.id];
      for (const id of ids) if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', want ? 'visible' : 'none');
      if (want && !presentLoaded.has(def.id)) {
        presentLoaded.add(def.id);
        if (def.id === 'cd-gps') {
          const gps = objects!.gps;
          if (gps) void setSource(SRC.gps, gpsFeatures(gps));
        } else void loadGeo<FeatureCollection>(def.file).then((fc) => { if (!destroyed) void setSource(def.id === 'cd-seafloor' ? SRC.seafloor : SRC.stripes, fc); }, () => { presentLoaded.delete(def.id); });
      }
    }
    // The ridge anchors belong to the sea-floor and stripe chapters; they draw with the GPS source.
    if (today && (layerOn('cd-seafloor') || layerOn('cd-stripes')) && !presentLoaded.has('cd-gps') && objects?.gps) { presentLoaded.add('cd-gps'); void setSource(SRC.gps, gpsFeatures(objects.gps)); }
    if (map.getLayer('cd-ridges')) map.setLayoutProperty('cd-ridges', 'visibility', today && (layerOn('cd-seafloor') || layerOn('cd-stripes')) ? 'visible' : 'none');
  };

  const gpsFeatures = (gps: GpsFile): FeatureCollection => {
    const features: Feature[] = [];
    for (const s of gps.stations) {
      const [lon, lat] = s.at;
      const dLat = s.vNorthMm * GPS_DEG_PER_MM;
      const dLon = (s.vEastMm * GPS_DEG_PER_MM) / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
      const tip: [number, number] = [lon + dLon, lat + dLat];
      const ang = Math.atan2(dLat, dLon * Math.cos((lat * Math.PI) / 180));
      const len = Math.hypot(dLat, dLon * Math.cos((lat * Math.PI) / 180));
      const head = Math.max(0.4, len * 0.3);
      const wing = (a: number): [number, number] => [tip[0] - (head * Math.cos(ang + a)) / Math.max(0.2, Math.cos((lat * Math.PI) / 180)), tip[1] - head * Math.sin(ang + a)];
      features.push({ type: 'Feature', id: `${s.id}-arrow`, properties: { id: `${s.id}-arrow`, role: 'arrow' }, geometry: { type: 'MultiLineString', coordinates: [[s.at, tip], [wing(0.45), tip, wing(-0.45)]] } });
      features.push({ type: 'Feature', id: s.id, properties: { id: s.id, role: 'station' }, geometry: { type: 'Point', coordinates: s.at } });
    }
    for (const r of gps.present) features.push({ type: 'Feature', id: r.id, properties: { id: r.id, role: 'ridge' }, geometry: { type: 'Point', coordinates: r.at } });
    return { type: 'FeatureCollection', features };
  };

  /* ---------- visibility of plate layers ---------- */
  const PLATE_LAYERS: Record<string, string[]> = { 'cd-land': ['cd-land', 'cd-land-edge'], 'cd-shelf': ['cd-shelf'], 'cd-glacial': ['cd-glacial'], 'cd-belts': ['cd-belts'], 'cd-singapore': ['cd-singapore', 'cd-trail'], 'cd-fossils': ['cd-fossils'] };
  const applyLayers = () => {
    if (!loaded) return;
    for (const [id, mapLayers] of Object.entries(PLATE_LAYERS)) for (const l of mapLayers) map.setLayoutProperty(l, 'visibility', layerOn(id) ? 'visible' : 'none');
    namesRoot.hidden = !layerOn('cd-names');
  };

  /* ---------- names (today's continent names and supercontinent names in their windows) ---------- */
  const namesRoot = document.createElement('div');
  namesRoot.className = 'cd-names';
  namesRoot.setAttribute('aria-hidden', 'true');
  options.labelRoot.appendChild(namesRoot);
  const nameEls = new Map<string, HTMLElement>();
  const namePositions = new Map<string, [number, number]>();
  /** Rendered width of each name, measured when its text is set (never per frame). */
  const nameWidth = new Map<string, number>();
  const names = () => {
    if (!objects || !model) return;
    const ma = stats.selectedMa;
    for (const l of objects.points.labels) {
      let el = nameEls.get(l.id);
      if (!el) { el = document.createElement('span'); el.className = 'cd-name'; el.dataset.id = l.id; el.dataset.super = String(l.window[1] > 0); namesRoot.appendChild(el); nameEls.set(l.id, el); }
      // Only on a change: a text write is a childList mutation, which makes the HUD room re-measure.
      const text = locale === 'zh' ? l.name.zh : l.name.en;
      if (el.textContent !== text) { el.textContent = text; nameWidth.set(l.id, el.offsetWidth); }
      const inWindow = ma <= l.window[0] && ma >= l.window[1];
      const at = inWindow && validAt(l, ma) ? model.rotatePoint(l.plateId, ma, l.at) : null;
      if (at) namePositions.set(l.id, at); else namePositions.delete(l.id);
    }
    placeNames();
  };
  /** Hidden on the far side of the globe. */
  const facing = (at: [number, number], min = 0.15) => {
    if (config.projection !== 'globe') return true;
    const c = map.getCenter();
    const r = Math.PI / 180;
    const cos = Math.sin(at[1] * r) * Math.sin(c.lat * r) + Math.cos(at[1] * r) * Math.cos(c.lat * r) * Math.cos((at[0] - c.lng) * r);
    return cos > min;
  };
  const placeNames = () => {
    // A name gives way to the placards of highlighted objects (they carry the reading for this beat).
    const boxes = leaders.boxes();
    const obstacles = leaders.band()?.obstacles ?? [];
    for (const [id, el] of nameEls) {
      const at = namePositions.get(id);
      if (!at || !facing(at)) { el.style.opacity = '0'; continue; }
      const p = map.project(at);
      // Names under a HUD block (from the leaders' last measure, container-local) give way too.
      const half = (nameWidth.get(id) || 120) / 2;
      const hidden = store.getState().highlight.includes(id) || boxes.some((r) => p.x > r.x - 60 && p.x < r.x + r.w + 60 && p.y > r.y - 14 && p.y < r.y + r.h + 14)
        || obstacles.some((r) => p.x + half > r.x && p.x - half < r.x + r.width && p.y + 9 > r.y && p.y - 9 < r.y + r.height);
      el.style.opacity = hidden ? '0' : '1';
      el.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px) translate(-50%, -50%)`;
    }
  };

  /* ---------- leader placards for highlighted objects ---------- */
  const leaders = createLeaders({
    map, container: options.container, labelRoot: options.labelRoot, locale: () => locale,
    onSelect: (id) => selectObject(id, false),
  });
  const title = (id: string) => objects?.text[id]?.title ?? objects?.points.labels.find((l) => l.id === id)?.name ?? null;
  const leadersFor = () => {
    if (!objects) return;
    const items: LeaderItem[] = [];
    for (const id of store.getState().highlight) {
      const at = positionAt(id);
      const t = title(id);
      if (!at || !t || !facing(at)) continue;
      const summary = objects.text[id]?.summary;
      items.push({ key: `cd:${id}`, id, kind: 'event', en: t.en, zh: t.zh, note: summary ? (locale === 'zh' ? summary.zh : summary.en) : '', at, pinned: true, clickable: !presenting });
    }
    // setItems re-measures only when a placard's text changes; a new age only moves the anchors.
    leaders.setItems(items);
    emphasise();
  };
  /** Feature-state emphasis for highlighted map points (groups emphasise every member). Feature state
   * outlives setData, so it is rewritten only when the highlight changes, not for every age. */
  let emphasised = '';
  const emphasise = () => {
    if (!objects) return;
    const key = store.getState().highlight.join(',');
    if (key === emphasised) return;
    emphasised = key;
    for (const src of [SRC.objects, SRC.fossils, SRC.gps]) map.removeFeatureState({ source: src });
    for (const id of store.getState().highlight) {
      const group = objects.fossils?.groups.find((g) => g.id === id);
      for (const member of group ? group.members : [id]) for (const src of [SRC.objects, SRC.fossils, SRC.gps]) map.setFeatureState({ source: src, id: member }, { hl: true });
      if (objects.gps?.stations.some((s) => s.id === id)) map.setFeatureState({ source: SRC.gps, id: `${id}-arrow` }, { hl: true });
    }
  };

  /* ---------- selection ---------- */
  let selected: string | null = null;
  const selectObject = (id: string, fly: boolean) => {
    if (presenting) return;
    selected = id;
    store.getState().patch({ highlight: [id] });
    if (fly) focus(id);
    emit();
  };
  const focus = (id: string) => {
    const at = positionAt(id);
    if (!at) return;
    const zoom = Math.max(map.getZoom(), 2);
    store.getState().applyCameraPreset({ center: [Math.round(at[0] * 1e4) / 1e4, Math.round(at[1] * 1e4) / 1e4], zoom: Math.min(ROTATION_MAX_ZOOM, hudFraming.storedZoom(zoom)) }, { instant: false });
  };
  const onClick = (e: MapMouseEvent) => {
    if (presenting || !objects) return;
    const r = 22;
    const box: [[number, number], [number, number]] = [[e.point.x - r, e.point.y - r], [e.point.x + r, e.point.y + r]];
    const layers = ['cd-glacial', 'cd-belts', 'cd-singapore', 'cd-gps', 'cd-fossils'].filter((l) => map.getLayer(l) && map.getLayoutProperty(l, 'visibility') === 'visible');
    const hits = layers.length ? map.queryRenderedFeatures(box, { layers }) : [];
    let best: { id: string; d: number } | null = null;
    for (const h of hits) {
      const id = String(h.properties?.id ?? '');
      const [x, y] = (h.geometry as Point).coordinates as [number, number];
      const p = map.project([x, y]);
      const d = Math.hypot(p.x - e.point.x, p.y - e.point.y);
      if (id && (!best || d < best.d)) best = { id, d };
    }
    if (best) selectObject(best.id, false);
  };
  map.on('click', onClick);

  /* ---------- camera ---------- */
  let gesture = false;
  let cameraTimer: ReturnType<typeof setTimeout> | null = null;
  const applyCamera = (next: GeoCamera, instant: boolean) => {
    const target = hudFraming.target(next);
    if (instant || reducedMotion) map.jumpTo(target);
    else map.flyTo({ ...target, duration: 2200, essential: true });
  };
  const unStore = store.subscribe((state, previous) => {
    if (state.transition.id !== previous.transition.id && isGeoCamera(state.camera)) {
      if (cameraTimer) clearTimeout(cameraTimer);
      cameraTimer = null;
      gesture = false;
      applyCamera(state.camera, state.transition.instant);
    }
    if (state.layers !== previous.layers) { applyLayers(); void update(); }
    if (state.highlight !== previous.highlight) {
      if (selected && !state.highlight.includes(selected)) { selected = null; emit(); }
      leadersFor();
      placeNames();
    }
  });
  let lastMa = NaN;
  const onPlayhead = () => {
    if (!loaded) return;
    // The same quantised age is the same frame: no coarse pass, no work.
    const ma = selectedMa();
    if (ma === lastMa) return;
    lastMa = ma;
    moving = true;
    if (fineTimer) clearTimeout(fineTimer);
    fineTimer = setTimeout(() => { moving = false; fineTimer = null; void update(); }, FINE_AFTER_MS);
    void update();
  };
  const unPlayhead = playhead.subscribe(onPlayhead);
  const applyTheme = () => {
    if (!loaded || destroyed) return;
    // Paint-only: geometry is never uploaded again for a theme switch.
    for (const layer of style(readThemeTokens(), config.projection).layers) {
      if ('paint' in layer && layer.paint) for (const [key, value] of Object.entries(layer.paint)) map.setPaintProperty(layer.id, key, value);
    }
  };
  const observer = new MutationObserver(applyTheme);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const resizeObserver = new ResizeObserver(() => { if (!destroyed) map.resize(); });
  resizeObserver.observe(options.container);
  map.on('move', placeNames);
  map.on('moveend', () => leadersFor());
  map.on('load', () => {
    ready.then(() => {
      if (destroyed) return;
      loaded = true;
      applyTheme();
      applyLayers();
      const state = store.getState();
      if (isGeoCamera(state.camera)) applyCamera(state.camera, true);
      void update();
    }, () => {
      stats.status = 'unavailable';
      options.container.dataset.rotationStatus = 'unavailable';
      emit();
    });
  });
  map.on('render', () => leaders.update());
  map.on('idle', placeNames);
  map.on('wheel', () => { gesture = true; });
  map.on('movestart', (event) => { gesture ||= Boolean((event as { originalEvent?: Event }).originalEvent); });
  map.on('moveend', (event) => {
    const user = gesture || Boolean((event as { originalEvent?: Event }).originalEvent);
    gesture = false;
    if (!user) return;
    if (cameraTimer) clearTimeout(cameraTimer);
    cameraTimer = setTimeout(() => {
      if (destroyed) return;
      const center = map.getCenter();
      const round = (value: number, d: number) => Math.round(value * 10 ** d) / 10 ** d;
      const next: GeoCamera = { center: [round(center.lng, 4), round(center.lat, 4)], zoom: hudFraming.storedZoom(map.getZoom()) };
      store.getState().setCamera(next);
    }, 250);
  });

  const api: RotationApi = {
    stats: () => ({ ...stats, updateMs: [...stats.updateMs] }),
    objects: () => objects,
    positionAt,
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
    focus: (id) => focus(id),
    selected: () => selected,
    select: (id, fly) => selectObject(id, fly),
    probe: (points) => {
      const c = map.getCenter();
      return { center: [c.lng, c.lat], zoom: map.getZoom(), screen: points.map((p) => { if (!facing(p, 0)) return null; const s = map.project(p); return [s.x, s.y]; }) };
    },
  };
  return {
    rotation: api,
    setLocale(next) { locale = next; names(); leadersFor(); },
    setLeadersSvg(svg) { leaders.setSvg(svg); },
    setTerritory() {}, setReference() {},
    setPresentation(on) { presenting = on; hudFraming.setPresentation(on); leadersFor(); },
    refreshLabels() { leaders.relayout(); },
    setGraticule(on) {
      graticuleOn = on;
      if (loaded) map.setLayoutProperty('cd-graticule', 'visibility', on ? 'visible' : 'none');
    },
    fitCamera: () => ({ center: [20, 10], zoom: 2 }),
    plateCamera: () => null,
    stats: () => ({ features: stats.featuresDrawn, zoom: map.getZoom(), datedLayers: {} }),
    destroy() {
      destroyed = true;
      if (fineTimer) clearTimeout(fineTimer);
      hudFraming.destroy();
      leaders.destroy();
      unStore(); unPlayhead(); observer.disconnect(); resizeObserver.disconnect();
      options.container.removeEventListener('pointerdown', onPointerDown, true);
      canvas.removeEventListener('focus', onCanvasFocus);
      if (cameraTimer) clearTimeout(cameraTimer);
      namesRoot.remove();
      options.scaleRoot.hidden = false;
      listeners.clear();
      map.remove();
      void graticuleOn;
    },
  };
}

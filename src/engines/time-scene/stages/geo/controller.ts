/**
 * GeoStage controller: owns the MapLibre map and drives it imperatively from
 * the scene store (layers, highlight, camera transitions) and the playhead
 * (time). React only mounts/unmounts it (GeoStage.tsx); nothing here renders
 * through React, so scrubbing and playback never re-render the tree.
 *
 * Loaded lazily (dynamic import) so MapLibre stays out of the View chunk.
 */
import { Map as MlMap, Marker, type GeoJSONSource, type LayerSpecification, type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, FeatureCollection } from 'geojson';
import type { SceneStore } from '../../../core/store';
import type { GeoCamera, Locale } from '../../../core/types';
import { isGeoCamera } from '../../../core/camera';
import { buildMapStyle } from '../../../../theme/map-style';
import { readThemeTokens, resolveColorRef, type ThemeTokens } from '../../../../theme/theme';
import { tx, withBase } from '../../../../i18n';
import type { TimeSceneExt } from '../../index';
import type { TimeModel } from '../../lib/model';
import type { Playhead } from '../../lib/playhead';
import { frameAt, type Frame } from '../../lib/frame';
import { areaLabelPoint, type LngLat } from '../../lib/geo';

export interface GeoControllerOptions {
  container: HTMLElement;
  store: SceneStore<TimeSceneExt>;
  playhead: Playhead;
  model: TimeModel;
  locale: Locale;
  onSelectEvent(id: string): void;
}

export interface GeoController {
  setLocale(locale: Locale): void;
  destroy(): void;
}

/* ------------------------------------------------------------------ */
/* Ids and constants                                                   */
/* ------------------------------------------------------------------ */

const SRC = {
  prev: 'ts-control-prev',
  next: 'ts-control-next',
  participation: 'ts-participation',
  countries: 'ts-countries',
  movements: 'ts-movements',
  events: 'ts-events',
} as const;

const LAYER = {
  prevFill: 'ts-control-prev-fill',
  prevLine: 'ts-control-prev-line',
  nextFill: 'ts-control-next-fill',
  nextLine: 'ts-control-next-line',
  partFill: 'ts-participation-fill',
  partLine: 'ts-participation-line',
  borders: 'ts-borders',
  moveGlow: 'ts-movements-glow',
  moveLine: 'ts-movements-line',
  eventGlow: 'ts-events-glow',
  events: 'ts-events',
} as const;

/** Scene layer id (LayerToggles) -> map layers it shows. `base` is always on. */
const GROUPS: Record<string, string[]> = {
  control: [LAYER.prevFill, LAYER.prevLine, LAYER.nextFill, LAYER.nextLine],
  participation: [LAYER.partFill, LAYER.partLine],
  borders: [LAYER.borders],
  movements: [LAYER.moveGlow, LAYER.moveLine],
  battles: [LAYER.eventGlow, LAYER.events],
};
const GLOW_LAYERS: string[] = [LAYER.moveGlow, LAYER.eventGlow];

const CONTROL_FILL = 0.42;
const MAX_LABELS = 12;
const HIT_RADIUS = 22; // 44px hit box around events
const PULSE_MS = 900;
const FLY_MS = 2200;
const CAMERA_WRITE_DEBOUNCE = 250;

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

/* ------------------------------------------------------------------ */
/* Style                                                               */
/* ------------------------------------------------------------------ */

function num(v: string | undefined, fallback: number): number {
  const n = Number.parseFloat(v ?? '');
  return Number.isFinite(n) ? n : fallback;
}

/** Data layers on top of the base map. Paint is token-driven; re-applied on theme change. */
function dataLayers(tk: ThemeTokens): LayerSpecification[] {
  const glow = num(tk['glow-strength'], 0);
  const glowBlur = num(tk['glow-blur'], 0);
  const controlFill = (source: string, id: string): LayerSpecification => ({
    id,
    type: 'fill',
    source,
    paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0 },
  });
  const controlLine = (source: string, id: string): LayerSpecification => ({
    id,
    type: 'line',
    source,
    layout: { 'line-join': 'round' },
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ['case', ['get', 'hl'], 3, 1.2],
      'line-opacity': 0,
    },
  });
  return [
    controlFill(SRC.prev, LAYER.prevFill),
    controlLine(SRC.prev, LAYER.prevLine),
    controlFill(SRC.next, LAYER.nextFill),
    controlLine(SRC.next, LAYER.nextLine),
    {
      id: LAYER.partFill,
      type: 'fill',
      source: SRC.participation,
      paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['*', 0.5, ['get', 'flash']] },
    },
    {
      id: LAYER.partLine,
      type: 'line',
      source: SRC.participation,
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['+', ['case', ['get', 'hl'], 3, 1.8], ['*', 3, ['get', 'flash']]],
        'line-opacity': 0.9,
      },
    },
    {
      id: LAYER.borders,
      type: 'line',
      source: SRC.countries,
      layout: { visibility: 'none', 'line-join': 'round' },
      paint: { 'line-color': tk['ink-muted'] || '#65553f', 'line-opacity': 0.45, 'line-width': 0.8, 'line-dasharray': [3, 2] },
    },
    {
      id: LAYER.moveGlow,
      type: 'line',
      source: SRC.movements,
      layout: { 'line-cap': 'round', 'line-join': 'round', visibility: glow > 0 ? 'visible' : 'none' },
      paint: {
        'line-color': tk.glow || 'transparent',
        'line-width': ['*', 3, ['get', 'width']],
        'line-blur': Math.max(2, glowBlur),
        'line-opacity': 0.35 * glow,
      },
    },
    {
      id: LAYER.moveLine,
      type: 'line',
      source: SRC.movements,
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['get', 'width'],
        'line-dasharray': DASH_SEQUENCE[0] as number[],
      },
    },
    {
      id: LAYER.eventGlow,
      type: 'circle',
      source: SRC.events,
      layout: { visibility: glow > 0 ? 'visible' : 'none' },
      paint: {
        'circle-color': tk.glow || 'transparent',
        'circle-radius': ['*', 2.2, ['get', 'r']],
        'circle-blur': 1,
        'circle-opacity': ['*', 0.8 * glow, ['get', 'o']],
      },
    },
    {
      id: LAYER.events,
      type: 'circle',
      source: SRC.events,
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': ['get', 'r'],
        'circle-opacity': ['get', 'o'],
        'circle-stroke-color': ['case', ['get', 'hl'], tk.ink || '#2b2117', tk.surface || '#fbf6ea'],
        'circle-stroke-width': ['case', ['get', 'hl'], 3, 1.5],
        'circle-stroke-opacity': ['get', 'o'],
      },
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Controller                                                          */
/* ------------------------------------------------------------------ */

export function createGeoController(options: GeoControllerOptions): GeoController {
  const { container, store, playhead, model } = options;
  let locale = options.locale;
  let tokens = readThemeTokens();
  const landUrl = withBase('/geo/land-50m.json');
  const countriesUrl = withBase('/geo/countries-50m.json');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  const baseStyle = (tk: ThemeTokens) =>
    buildMapStyle({ sources: { land: landUrl }, tokens: tk, name: 'atlas-time-scene' }) as unknown as StyleSpecification;

  const style = baseStyle(tokens);
  for (const id of Object.values(SRC)) style.sources[id] = { type: 'geojson', data: EMPTY };
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

  const entityColor = (id: string): string => {
    const en = model.entities.get(id)?.entity;
    if (en?.color) return resolveColorRef(en.color, tokens) || tokens['accent-neutral'];
    return tokens[`accent-${en?.bloc ?? 'neutral'}` as 'accent-axis'] || tokens['accent-neutral'] || '#888';
  };

  const layersOn = () => new Set(store.getState().layers);
  const highlight = () => store.getState().highlight ?? [];

  /* ---------- visibility ---------- */
  const applyVisibility = () => {
    if (!loaded) return;
    const on = layersOn();
    const glow = num(tokens['glow-strength'], 0) > 0;
    for (const [group, ids] of Object.entries(GROUPS)) {
      for (const id of ids) {
        const visible = on.has(group) && (!GLOW_LAYERS.includes(id) || glow);
        map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      }
    }
    if (on.has('borders')) void ensureCountries();
  };

  /* ---------- countries (lazy: only fetched when borders are first shown) ---------- */
  type CountryLabel = { name: string; at: LngLat; rank: number };
  let countryLabels: CountryLabel[] | null = null;
  let countriesLoading = false;
  const ensureCountries = async () => {
    if (countryLabels || countriesLoading) return;
    countriesLoading = true;
    try {
      const res = await fetch(countriesUrl);
      if (!res.ok) throw new Error(`${res.status} ${countriesUrl}`);
      const fc = (await res.json()) as FeatureCollection;
      if (destroyed) return;
      source(SRC.countries)?.setData(fc);
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
  let lastFrame: Frame | null = null;
  let activeEvents: Set<string> | null = null;

  const setIfChanged = (id: string, sig: string, data: () => FeatureCollection) => {
    if (signatures[id] === sig) return;
    signatures[id] = sig;
    source(id)?.setData(data());
  };

  const controlFc = (index: number, hl: Set<string>): FeatureCollection => {
    const kf = model.keyframes[index]?.keyframe;
    if (!kf) return EMPTY;
    return {
      type: 'FeatureCollection',
      features: kf.features.features.map((f) => ({
        type: 'Feature',
        geometry: f.geometry,
        properties: { holder: f.properties.holder, color: entityColor(f.properties.holder), hl: hl.has(f.properties.holder) },
      })),
    };
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

  const render = () => {
    renderQueued = 0;
    if (!loaded || destroyed) return;
    const t = playhead.get();
    const hlList = highlight();
    const hl = new Set(hlList);
    const hlSig = hlList.join(',');
    const frame = frameAt(model, t, hlList);
    lastFrame = frame;
    const on = layersOn();

    /* control: two sources, crossfaded */
    const { control } = frame;
    setIfChanged(SRC.prev, `${control.prevIndex}|${hlSig}|${tokens['accent-axis']}`, () => controlFc(control.prevIndex, hl));
    setIfChanged(SRC.next, `${control.nextIndex}|${hlSig}|${tokens['accent-axis']}`, () => controlFc(control.nextIndex, hl));
    map.setPaintProperty(LAYER.prevFill, 'fill-opacity', CONTROL_FILL * control.prevOpacity);
    map.setPaintProperty(LAYER.prevLine, 'line-opacity', 0.85 * control.prevOpacity);
    map.setPaintProperty(LAYER.nextFill, 'fill-opacity', CONTROL_FILL * control.nextOpacity);
    map.setPaintProperty(LAYER.nextLine, 'line-opacity', 0.85 * control.nextOpacity);

    /* participation: entity areas light up on `joined` */
    const geometry = entityGeometry(frame);
    const partFeatures: Feature[] = [];
    for (const p of frame.participation) {
      for (const f of geometry.get(p.entityId) ?? []) {
        partFeatures.push({
          type: 'Feature',
          geometry: f.geometry,
          properties: { color: entityColor(p.entityId), flash: Math.round(p.flash * 50) / 50, hl: hl.has(p.entityId) },
        });
      }
    }
    const partSig = `${control.prevIndex}/${control.nextIndex}/${control.blend >= 0.5}|${frame.participation
      .map((p) => `${p.entityId}:${Math.round(p.flash * 50)}`)
      .join(',')}|${hlSig}|${tokens['accent-axis']}`;
    setIfChanged(SRC.participation, partSig, () => ({ type: 'FeatureCollection', features: partFeatures }));

    /* movements */
    const moveFeatures: Feature[] = frame.movements
      .filter((mv) => mv.coords.length >= 2)
      .map((mv) => {
        const id = mv.m.movement.id;
        const base = 2.5 + 4 * Math.sqrt(mv.m.movement.strength / model.maxStrength);
        return {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: mv.coords },
          properties: { id, color: entityColor(mv.m.movement.holder), width: hl.has(id) ? base + 2.5 : base },
        };
      });
    setIfChanged(
      SRC.movements,
      `${frame.movements.map((m) => `${m.m.movement.id}:${m.progress.toFixed(4)}`).join(',')}|${hlSig}|${tokens['accent-axis']}`,
      () => ({ type: 'FeatureCollection', features: moveFeatures }),
    );
    updateArrowheads(frame, on.has('movements'));

    /* events */
    const eventFeatures: Feature[] = frame.events.map((ef) => {
      const e = model.events.find((x) => x.event.id === ef.id)!.event;
      const isHl = hl.has(e.id);
      const r = (4 + 3 * e.importance) * (ef.active ? 1.15 : 1) + (isHl ? 2 : 0);
      const color = e.sides ? entityColor(e.sides.attacker) : tokens.ink;
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: e.at },
        properties: { id: e.id, r, color, o: ef.active || isHl ? 1 : 0.55, hl: isHl },
      };
    });
    setIfChanged(
      SRC.events,
      `${frame.events.map((e) => `${e.id}:${e.active ? 1 : 0}`).join(',')}|${hlSig}|${tokens.ink}|${tokens['accent-axis']}`,
      () => ({ type: 'FeatureCollection', features: eventFeatures }),
    );

    /* one-shot pulse when an event becomes active */
    const nowActive = new Set(frame.events.filter((e) => e.active).map((e) => e.id));
    if (activeEvents && on.has('battles') && !reducedMotion) {
      for (const id of nowActive) if (!activeEvents.has(id)) pulse(id);
    }
    activeEvents = nowActive;

    updateDashAnimation(on.has('movements') && frame.movements.length > 0);
    updateLabels();
  };

  const requestRender = () => {
    if (!renderQueued && !destroyed) renderQueued = requestAnimationFrame(render);
  };
  disposers.push(() => cancelAnimationFrame(renderQueued));

  /* ---------- arrowheads (HTML markers at each movement's head) ---------- */
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
          el.innerHTML =
            '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M10 2 L18 18 L10 13.5 L2 18 Z"/></svg>';
          marker = new Marker({ element: el, rotationAlignment: 'viewport', pitchAlignment: 'viewport' });
          marker.setLngLat(mv.head).addTo(map);
          arrows.set(id, marker);
        }
        marker.getElement().style.setProperty('--ts-color', entityColor(mv.m.movement.holder));
        marker.setLngLat(mv.head);
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

  /* ---------- pulses ---------- */
  const pulseTimers = new Set<ReturnType<typeof setTimeout>>();
  const pulse = (id: string) => {
    const e = model.events.find((x) => x.event.id === id)?.event;
    if (!e) return;
    const el = document.createElement('div');
    el.className = 'ts-pulse';
    el.style.setProperty('--ts-color', e.sides ? entityColor(e.sides.attacker) : tokens.ink);
    el.style.setProperty('--ts-size', `${(4 + 3 * e.importance) * 2}px`);
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

  /* ---------- labels (HTML markers, max 12, greedy de-overlap) ---------- */
  interface Label {
    key: string;
    text: string;
    at: LngLat;
    priority: number;
    pinned: boolean;
    color?: string;
    kind: 'entity' | 'event' | 'movement' | 'place';
  }
  const labels = new Map<string, { marker: Marker; text: string; label: Label }>();
  /** Collision priority: lower = wins. Highlighted labels beat everything, then events > entities > movements > places. */
  const KIND_RANK: Record<Label['kind'], number> = { event: 1, entity: 2, movement: 3, place: 4 };
  const rankOf = (l: Label) => (l.pinned ? 0 : KIND_RANK[l.kind]);

  const labelCandidates = (): Label[] => {
    const frame = lastFrame;
    if (!frame) return [];
    const on = layersOn();
    const hl = new Set(highlight());
    const out: Label[] = [];

    if (on.has('control') || on.has('participation')) {
      for (const [holder, features] of entityGeometry(frame)) {
        const en = model.entities.get(holder)?.entity;
        if (!en) continue;
        const polys = features.flatMap((f) =>
          f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [],
        );
        const at = areaLabelPoint(polys);
        if (!at) continue;
        out.push({ key: `entity:${holder}`, text: tx(en.name, locale), at, priority: 40, pinned: hl.has(holder), color: entityColor(holder), kind: 'entity' });
      }
    }
    if (on.has('battles')) {
      for (const ef of frame.events) {
        const e = model.events.find((x) => x.event.id === ef.id)!.event;
        if (!ef.active && !hl.has(e.id)) continue;
        out.push({ key: `event:${e.id}`, text: tx(e.title, locale), at: e.at, priority: 50 + 5 * e.importance, pinned: hl.has(e.id), kind: 'event' });
      }
    }
    if (on.has('movements')) {
      for (const mv of frame.movements) {
        const m = mv.m.movement;
        // At the movement's origin: never under the moving arrowhead.
        const origin = mv.coords[0] ?? mv.head;
        out.push({ key: `movement:${m.id}`, text: tx(m.label, locale), at: origin, priority: 30, pinned: hl.has(m.id), color: entityColor(m.holder), kind: 'movement' });
      }
    }
    if (on.has('borders') && countryLabels) {
      const zoom = map.getZoom();
      const limit = Math.round(6 * 2 ** Math.max(0, zoom - 1));
      for (const c of countryLabels) {
        if (c.rank > limit) continue;
        out.push({ key: `place:${c.name}`, text: c.name, at: c.at, priority: 10 - c.rank / 1000, pinned: false, kind: 'place' });
      }
    }
    return out;
  };

  const updateLabels = () => {
    if (!loaded) return;
    const bounds = map.getBounds();
    const { width, height } = container.getBoundingClientRect();
    const candidates = labelCandidates()
      .filter((l) => l.pinned || bounds.contains(l.at))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.priority - a.priority);
    const chosen: Label[] = [];
    for (const l of candidates) {
      if (!l.pinned && chosen.length >= MAX_LABELS) break;
      const p = map.project(l.at);
      if (!l.pinned && (p.x < 0 || p.y < 0 || p.x > width || p.y > height)) continue;
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
        el.className = `ts-label ts-label--${l.kind}`;
        const span = document.createElement('span');
        el.appendChild(span);
        // Events: below the dot. Movements: just below their origin.
        const below = l.kind === 'event' || l.kind === 'movement';
        const marker = new Marker({ element: el, anchor: below ? 'top' : 'center', offset: below ? [0, 12] : [0, 0] });
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
      el.dataset.pinned = String(l.pinned);
      if (l.color) el.style.setProperty('--ts-color', l.color);
      else el.style.removeProperty('--ts-color');
    }
    resolveLabelCollisions();
  };

  /**
   * Greedy collision pass over the placed markers, on real screen rects:
   * walk labels in priority order (highlighted > events > entities >
   * movements > places) and hide any label that overlaps (4px padding) one
   * already kept. Highlighted labels are never hidden. At most ~12 rects.
   */
  const LABEL_PAD = 4;
  const resolveLabelCollisions = () => {
    const ordered = [...labels.values()].sort(
      (a, b) => rankOf(a.label) - rankOf(b.label) || b.label.priority - a.label.priority,
    );
    const occupied: DOMRect[] = [];
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
      const hide = hit && !entry.label.pinned;
      el.dataset.collided = String(hide);
      if (!hide) occupied.push(rect);
    }
  };

  /* ---------- clicks on events (44px hit box) ---------- */
  map.on('click', (e) => {
    if (!layersOn().has('battles')) return;
    const { x, y } = e.point;
    const hits = map.queryRenderedFeatures(
      [
        [x - HIT_RADIUS, y - HIT_RADIUS],
        [x + HIT_RADIUS, y + HIT_RADIUS],
      ],
      { layers: [LAYER.events] },
    );
    let best: { id: string; d: number } | null = null;
    for (const f of hits) {
      const id = (f.properties as { id?: string }).id;
      const g = f.geometry;
      if (!id || g.type !== 'Point') continue;
      const p = map.project(g.coordinates as [number, number]);
      const d = Math.hypot(p.x - x, p.y - y);
      if (!best || d < best.d) best = { id, d };
    }
    if (best) options.onSelectEvent(best.id);
  });

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
  map.on('move', reorientArrows);
  map.on('moveend', (e) => {
    reorientArrows();
    updateLabels();
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
    const next = baseStyle(tokens);
    for (const layer of [...next.layers, ...dataLayers(tokens)]) {
      if (!map.getLayer(layer.id) || !('paint' in layer) || !layer.paint) continue;
      for (const [key, value] of Object.entries(layer.paint)) {
        // Opacity of control layers and the dash are animated; render() re-applies them.
        map.setPaintProperty(layer.id, key, value);
      }
    }
    applyVisibility();
    for (const key of Object.keys(signatures)) delete signatures[key];
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
    const s = store.getState();
    if (isGeoCamera(s.camera)) applyCamera(s.camera, true);
  });

  return {
    setLocale(next) {
      if (next === locale) return;
      locale = next;
      for (const entry of labels.values()) entry.text = '';
      updateLabels();
    },
    destroy() {
      destroyed = true;
      for (const dispose of disposers) dispose();
      for (const m of arrows.values()) m.remove();
      for (const { marker } of labels.values()) marker.remove();
      arrows.clear();
      labels.clear();
      map.remove();
    },
  };
}

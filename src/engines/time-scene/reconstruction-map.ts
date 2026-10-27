/** A separate MapLibre path, selected before the historical controller creates any sources. */
import { Map as MlMap, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { GeoCamera } from '../core/types';
import { isGeoCamera } from '../core/camera';
import { readThemeTokens } from '../../theme/theme';
import { withBase } from '../../i18n';
import type { GeoController, GeoControllerOptions } from './stages/geo/controller';
import type { ReconstructionManifest } from './deep-time';
import { decodeTopologyObject } from './lib/control';
import { createReconstructionFrames, type ReconstructionStats } from './lib/reconstruction';
import { buildReconstructionStyle, RECONSTRUCTION_GRATICULE, RECONSTRUCTION_SOURCE } from './reconstruction-style';

/** The only zoom ceiling for reconstructed main maps; no island-scale modern overlay. */
export const RECONSTRUCTION_MAX_ZOOM = 3.6;
export const RECONSTRUCTION_LATITUDE = 85.051129;

export function createReconstructionMap(options: GeoControllerOptions, manifest: ReconstructionManifest): GeoController {
  const { store, playhead } = options;
  const initial = store.getState();
  const camera = isGeoCamera(initial.camera) ? initial.camera : { center: [0, 10] as [number, number], zoom: 1.1 };
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  let loaded = false;
  let destroyed = false;
  let graticuleOn = true;
  let features = 0;
  let sourceGeneration = 0;
  const geometryLayers = ['ts-reconstruction-land', 'ts-reconstruction-coast', 'ts-reconstruction-unavailable'];
  let gesture = false;
  let cameraTimer: ReturnType<typeof setTimeout> | null = null;
  const map = new MlMap({
    container: options.container,
    style: buildReconstructionStyle(readThemeTokens()),
    center: camera.center, zoom: Math.min(RECONSTRUCTION_MAX_ZOOM, camera.zoom),
    bearing: camera.bearing ?? 0, pitch: camera.pitch ?? 0,
    minZoom: 0, maxZoom: RECONSTRUCTION_MAX_ZOOM,
    renderWorldCopies: false,
    maxBounds: [[-180, -RECONSTRUCTION_LATITUDE], [180, RECONSTRUCTION_LATITUDE]],
    attributionControl: false,
    fadeDuration: 0,
  });
  // A modern scale bar implies measured ground distance; reconstructed geometry has no such claim.
  options.scaleRoot.hidden = true;
  const frames = createReconstructionFrames({
    manifest,
    async load(frame, signal) {
      const response = await fetch(withBase(`/geo/${frame.file}.json`), { signal });
      if (!response.ok) throw new Error(`Reconstruction frame unavailable: ${frame.id}`);
      const raw: unknown = await response.json();
      // Ignore obsolete work before decoding, even when a fetch implementation ignores abort.
      if (signal.aborted) throw new Error('Reconstruction frame superseded');
      const collection = decodeTopologyObject(raw, frame.file);
      if (!collection.features.some((f) => f.properties?.kind === 'land')) throw new Error('Reconstruction frame has no land');
      for (const f of collection.features) {
        const p = f.properties;
        if (p?.modelId !== manifest.modelId || p.frameMa !== frame.t.ma) throw new Error('Reconstruction frame metadata mismatch');
      }
      return collection;
    },
    async apply(collection) {
      if (destroyed || !loaded) return;
      const current = ++sourceGeneration;
      // Source worker updates are asynchronous: hide old geometry immediately.
      for (const id of geometryLayers) map.setLayoutProperty(id, 'visibility', 'none');
      features = 0;
      const source = map.getSource(RECONSTRUCTION_SOURCE) as GeoJSONSource;
      if (!collection.features.length) { source.setData(collection); return; }
      await source.setData(collection, true);
      if (destroyed || current !== sourceGeneration) return;
      for (const id of geometryLayers) map.setLayoutProperty(id, 'visibility', 'visible');
      features = collection.features.length;
    },
    onChange(stats) {
      options.container.dataset.reconstructionStatus = stats.status;
      options.onReconstruction?.(stats);
    },
  });
  const selectedMa = () => -playhead.get() / 1e6;
  const applyCamera = (next: GeoCamera, instant: boolean) => {
    const target = { center: next.center, zoom: Math.min(RECONSTRUCTION_MAX_ZOOM, next.zoom), bearing: next.bearing ?? 0, pitch: next.pitch ?? 0 };
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
  });
  const unPlayhead = playhead.subscribe(() => { if (loaded) void frames.select(selectedMa()); });
  const applyTheme = () => {
    if (!loaded || destroyed) return;
    // Paint-only theme update preserves one decoded source and never uploads geometry again.
    for (const layer of buildReconstructionStyle(readThemeTokens()).layers) {
      if ('paint' in layer && layer.paint) {
        for (const [key, value] of Object.entries(layer.paint)) map.setPaintProperty(layer.id, key, value);
      }
    }
  };
  const observer = new MutationObserver(applyTheme);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const resizeObserver = new ResizeObserver(() => { if (!destroyed) map.resize(); });
  resizeObserver.observe(options.container);
  map.on('load', () => {
    if (destroyed) return;
    loaded = true;
    applyTheme();
    map.setLayoutProperty(RECONSTRUCTION_GRATICULE, 'visibility', graticuleOn ? 'visible' : 'none');
    void frames.select(selectedMa());
  });
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
      const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits;
      const next: GeoCamera = { center: [round(center.lng, 4), round(center.lat, 4)], zoom: round(map.getZoom(), 2) };
      if (map.getPitch()) next.pitch = round(map.getPitch(), 1);
      if (map.getBearing()) next.bearing = round(map.getBearing(), 1);
      store.getState().setCamera(next);
    }, 250);
  });
  return {
    setLocale() {}, setLeadersSvg() {}, setTerritory() {}, setReference() {}, setPresentation() {}, refreshLabels() {},
    setGraticule(on) {
      graticuleOn = on;
      if (loaded) map.setLayoutProperty(RECONSTRUCTION_GRATICULE, 'visibility', on ? 'visible' : 'none');
    },
    fitCamera: () => ({ center: [0, 10], zoom: 1.1 }),
    plateCamera: () => null,
    stats: () => ({ features, zoom: map.getZoom(), datedLayers: {}, reconstruction: frames.stats() }),
    reconstructionStats: (): ReconstructionStats => frames.stats(),
    destroy() {
      destroyed = true;
      sourceGeneration++;
      frames.destroy();
      unStore(); unPlayhead(); observer.disconnect(); resizeObserver.disconnect();
      if (cameraTimer) clearTimeout(cameraTimer);
      options.scaleRoot.hidden = false;
      map.remove();
    },
  };
}

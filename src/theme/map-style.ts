/**
 * Build a MapLibre style from the active theme tokens. No tiles, no glyphs,
 * no sprites: every source is local GeoJSON so the map works offline and in
 * the Capacitor build. Phase 2 (GeoStage) adds its data layers on top of the
 * base layers produced here and rebuilds the style when the theme changes.
 */
import type { StyleSpecification, LayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import type { GeoJSON } from 'geojson';
import { readThemeTokens, type ThemeTokens } from './theme';

/** A GeoJSON source: inline data or a URL (already prefixed with the site base). */
export type GeoJsonInput = GeoJSON | string;

export interface BaseMapSources {
  land: GeoJsonInput;
  water?: GeoJsonInput;
  rivers?: GeoJsonInput;
}

export interface MapStyleOptions {
  sources: BaseMapSources;
  /** Token values; defaults to reading <html>'s computed style. */
  tokens?: Partial<ThemeTokens>;
  /** Name shown in devtools. */
  name?: string;
}

export const BASE_LAYER_IDS = {
  background: 'atlas-background',
  land: 'atlas-land',
  landEdge: 'atlas-land-edge',
  water: 'atlas-water',
  rivers: 'atlas-rivers',
  riversGlow: 'atlas-rivers-glow',
} as const;

function num(value: string | undefined, fallback: number): number {
  const n = Number.parseFloat(value ?? '');
  return Number.isFinite(n) ? n : fallback;
}

/** Fallbacks match the paper theme so a style can be built without a DOM. */
const FALLBACK: Pick<ThemeTokens, 'land' | 'land-edge' | 'water' | 'rivers' | 'glow' | 'glow-blur' | 'glow-strength'> = {
  land: '#e1dbcc',
  'land-edge': 'rgba(42, 40, 36, 0.3)',
  water: '#dde2df',
  rivers: '#c3cfcb',
  glow: 'transparent',
  'glow-blur': '0px',
  'glow-strength': '0',
};

export function buildMapStyle(options: MapStyleOptions): StyleSpecification {
  const tokens: Partial<ThemeTokens> =
    options.tokens ?? (typeof document !== 'undefined' ? readThemeTokens() : {});
  const tk = (name: keyof typeof FALLBACK): string => tokens[name] || FALLBACK[name];

  const glowStrength = num(tk('glow-strength'), 0);
  const glowBlur = num(tk('glow-blur'), 0);

  const sources: StyleSpecification['sources'] = {
    land: { type: 'geojson', data: options.sources.land },
  };
  if (options.sources.water) sources.water = { type: 'geojson', data: options.sources.water };
  if (options.sources.rivers) sources.rivers = { type: 'geojson', data: options.sources.rivers };

  const layers: LayerSpecification[] = [
    // Ocean = background, so only land/lakes need geometry.
    { id: BASE_LAYER_IDS.background, type: 'background', paint: { 'background-color': tk('water') } },
    { id: BASE_LAYER_IDS.land, type: 'fill', source: 'land', paint: { 'fill-color': tk('land'), 'fill-antialias': true } },
    {
      id: BASE_LAYER_IDS.landEdge,
      type: 'line',
      source: 'land',
      paint: { 'line-color': tk('land-edge'), 'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.4, 6, 1.2] },
    },
  ];

  if (options.sources.water) {
    layers.push({ id: BASE_LAYER_IDS.water, type: 'fill', source: 'water', paint: { 'fill-color': tk('water') } });
  }

  if (options.sources.rivers) {
    if (glowStrength > 0) {
      layers.push({
        id: BASE_LAYER_IDS.riversGlow,
        type: 'line',
        source: 'rivers',
        paint: {
          'line-color': tk('rivers'),
          'line-width': ['interpolate', ['linear'], ['zoom'], 2, 1.5, 7, 4],
          'line-blur': glowBlur,
          'line-opacity': 0.5 * glowStrength,
        },
      });
    }
    layers.push({
      id: BASE_LAYER_IDS.rivers,
      type: 'line',
      source: 'rivers',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': tk('rivers'), 'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.4, 7, 1.6] },
    });
  }

  return {
    version: 8,
    name: options.name ?? 'atlas',
    sources,
    layers,
  };
}

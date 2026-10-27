import type { ExpressionSpecification, FilterSpecification, LineLayerSpecification } from 'maplibre-gl';
import type { FeatureCollection, Polygon } from 'geojson';
import type { ThemeTokens } from '../../../../theme/theme';
import type { ClimateData } from '../../lib/climate';

/** One immutable geometry per native cell, with all twelve months retained in properties. */
export function rainGeometry(data: ClimateData): FeatureCollection<Polygon> {
  const g = data.resource.grid;
  return {
    type: 'FeatureCollection',
    features: Array.from({ length: g.nx * g.ny }, (_, index) => {
      const i = index % g.nx,
        j = Math.floor(index / g.nx),
        x = g.lon0 + i * g.dlon,
        y = g.lat0 + j * g.dlat;
      const w = x - g.dlon / 2,
        e = x + g.dlon / 2,
        s = y - g.dlat / 2,
        n = y + g.dlat / 2;
      const properties: Record<string, number> = { index };
      data.frames.forEach((f, month) => {
        properties[`v${month + 1}`] = f.values[index]!;
        properties[`ok${month + 1}`] = f.valid[index]!;
        properties[`n${month + 1}`] = f.validYears[index]!;
      });
      return {
        type: 'Feature',
        id: index,
        properties,
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [w, s],
              [e, s],
              [e, n],
              [w, n],
              [w, s],
            ],
          ],
        },
      };
    }),
  };
}
export function rainPaint(month: number, tk: ThemeTokens) {
  const valid: ExpressionSpecification = ['==', ['get', `ok${month}`], 1];
  const colors = Array.from({ length: 7 }, (_, i) => tk[`rain-${i}` as keyof ThemeTokens]);
  const color: ExpressionSpecification = [
    'step',
    ['get', `v${month}`],
    colors[0]!,
    1,
    colors[1]!,
    2,
    colors[2]!,
    4,
    colors[3]!,
    8,
    colors[4]!,
    16,
    colors[5]!,
    32,
    colors[6]!,
  ];
  return {
    color,
    opacity: ['case', valid, 0.55, 0] as ExpressionSpecification,
    lineOpacity: ['case', valid, 0.35, 0] as ExpressionSpecification,
  };
}

/** Id of the 1:50m coastline drawn again above the climate fills (climatologyController). */
export const COAST_OVER_CLIMATE = 'clim-land-edge-over';

/**
 * The 1:50m coastline as a layer to sit above the rain cells. Without a regional plate it fades
 * out from zoom 7 to 8, exactly as the 1:10m Southeast Asia land and its own coast fade in
 * (style.ts `hiResLayers`); the original 1:50m edge stays under the 1:10m mask, so a close-up
 * never shows the coarse and the detailed coastline side by side. A regional plate has no
 * 1:10m land, keeps its coast-only filter and never fades.
 */
export function coastOverClimate(tk: ThemeTokens, fadeForHighDetail: boolean): LineLayerSpecification {
  return {
    id: COAST_OVER_CLIMATE,
    type: 'line',
    source: 'land',
    ...(fadeForHighDetail ? {} : { filter: ['==', ['get', 'kind'], 'coast'] as FilterSpecification }),
    paint: {
      'line-color': tk['land-edge'] || 'rgba(42, 40, 36, 0.3)',
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.4, 6, 1.2],
      ...(fadeForHighDetail ? { 'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 8, 0] as ExpressionSpecification } : {}),
    },
  };
}

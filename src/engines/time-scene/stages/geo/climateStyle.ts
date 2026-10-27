import type { ExpressionSpecification } from 'maplibre-gl';
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

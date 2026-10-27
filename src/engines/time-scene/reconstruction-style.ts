/** Self-contained style: no modern land, borders, place labels, rivers, tiles or glyphs. */
import type { StyleSpecification } from 'maplibre-gl';
import type { ThemeTokens } from '../../theme/theme';
import { graticule } from './stages/geo/style';
import { RECONSTRUCTION_EMPTY } from './lib/reconstruction';

export const RECONSTRUCTION_SOURCE = 'ts-reconstruction';
export const RECONSTRUCTION_GRATICULE = 'ts-reconstruction-graticule';
export function buildReconstructionStyle(tokens: Pick<ThemeTokens, 'water' | 'land' | 'land-edge' | 'paper'>): StyleSpecification {
  return {
    version: 8,
    name: 'atlas-reconstructed-land',
    transition: { duration: 0, delay: 0 },
    sources: {
      [RECONSTRUCTION_SOURCE]: { type: 'geojson', data: RECONSTRUCTION_EMPTY },
      [RECONSTRUCTION_GRATICULE]: { type: 'geojson', data: graticule() },
    },
    layers: [
      { id: 'ts-reconstruction-water', type: 'background', paint: { 'background-color': tokens.water } },
      { id: 'ts-reconstruction-land', type: 'fill', source: RECONSTRUCTION_SOURCE,
        filter: ['==', ['get', 'kind'], 'land'], paint: { 'fill-color': tokens.land, 'fill-antialias': true } },
      { id: RECONSTRUCTION_GRATICULE, type: 'line', source: RECONSTRUCTION_GRATICULE,
        paint: { 'line-color': tokens['land-edge'], 'line-opacity': 0.3, 'line-width': 0.5 } },
      { id: 'ts-reconstruction-coast', type: 'line', source: RECONSTRUCTION_SOURCE,
        filter: ['==', ['get', 'kind'], 'coast'],
        paint: { 'line-color': tokens['land-edge'], 'line-width': 0.8 } },
      // Missing source sampling is paper, visibly distinct from known model water.
      { id: 'ts-reconstruction-unavailable', type: 'fill', source: RECONSTRUCTION_SOURCE,
        filter: ['==', ['get', 'kind'], 'unavailable'],
        paint: { 'fill-color': tokens.paper, 'fill-antialias': false } },
    ],
  };
}

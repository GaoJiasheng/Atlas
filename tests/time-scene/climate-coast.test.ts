/** One coastline in monthly close-ups: the 1:50m coast over the rain cells hands over to the 1:10m coast. */
import { describe, expect, it } from 'vitest';
import { coastOverClimate, COAST_OVER_CLIMATE } from '../../src/engines/time-scene/stages/geo/climateStyle';
import { hiResLayers, HI, HI_MIN_ZOOM } from '../../src/engines/time-scene/stages/geo/style';

const tk = { 'land-edge': '#2a2824', land: '#e1dbcc', water: '#dde2df' } as unknown as Parameters<typeof coastOverClimate>[0];

describe('coastOverClimate', () => {
  it('fades out over exactly the zooms where the 1:10m land and coast fade in', () => {
    const layer = coastOverClimate(tk, true);
    expect(layer).toMatchObject({ id: COAST_OVER_CLIMATE, type: 'line', source: 'land' });
    expect(layer.filter).toBeUndefined();
    expect(layer.paint?.['line-opacity']).toEqual(['interpolate', ['linear'], ['zoom'], HI_MIN_ZOOM, 1, HI_MIN_ZOOM + 1, 0]);
    const hiEdge = hiResLayers(tk).find((l) => l.id === HI.edge) as { paint: Record<string, unknown> };
    expect(hiEdge.paint['line-opacity']).toEqual(['interpolate', ['linear'], ['zoom'], HI_MIN_ZOOM, 0, HI_MIN_ZOOM + 1, 1]);
    expect(layer.paint?.['line-color']).toBe('#2a2824');
  });

  it('on a regional plate keeps the coast-only filter and never fades', () => {
    const layer = coastOverClimate(tk, false);
    expect(layer.filter).toEqual(['==', ['get', 'kind'], 'coast']);
    expect(layer.paint?.['line-opacity']).toBeUndefined();
  });
});

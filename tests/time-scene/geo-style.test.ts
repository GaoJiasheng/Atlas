/**
 * The GeoStage style (stages/geo/style.ts): the world map is unchanged by the
 * regional plate; a plate draws no world land, no 1:10m overlay, its own land
 * (coast stroked, cut edges not), rivers above the land and the paper sheet over
 * everything outside the plate.
 */
import { describe, expect, it } from 'vitest';
import type { FeatureCollection } from 'geojson';
import { BASE_LAYER_IDS } from '../../src/theme/map-style';
import { buildGeoStyle, graticule, GROUPS, HI, LAYER, LOCAL, REGION, riverFilter, SRC } from '../../src/engines/time-scene/stages/geo/style';
import type { ThemeTokens } from '../../src/theme/theme';

const tokens = { land: '#e1dbcc', water: '#dde2df', paper: '#e9e4d8', ink: '#2a2824', line: 'rgba(0,0,0,.6)', rivers: '#86a3a8' } as ThemeTokens;
const base = { tokens, landUrl: '/geo/land-50m.json', graticule: graticule() };

describe('GeoStage style', () => {
  it('world map: land-50m, the Southeast Asia overlay, data layers; no plate sources', () => {
    const style = buildGeoStyle(base);
    expect((style.sources.land as { data: unknown }).data).toBe('/geo/land-50m.json');
    expect(style.sources[HI.src]).toBeDefined();
    expect(style.sources[REGION.rivers]).toBeUndefined();
    expect(style.sources[REGION.frame]).toBeUndefined();
    const ids = style.layers.map((l) => l.id);
    expect(ids.slice(0, 3)).toEqual([BASE_LAYER_IDS.background, BASE_LAYER_IDS.land, BASE_LAYER_IDS.landEdge]);
    expect(ids.slice(3, 6)).toEqual([HI.mask, HI.fill, HI.edge]);
    expect(ids).not.toContain(REGION.frameFill);
    expect(ids).not.toContain(LOCAL.fill);
    expect(style.layers.find((l) => l.id === BASE_LAYER_IDS.land)).not.toHaveProperty('filter');
    expect(ids.at(-1)).toBe(LAYER.siteHit);
  });

  it('control frontiers: solid and dashed (approximate) layers, both in the control group', () => {
    const style = buildGeoStyle(base);
    const line = style.layers.find((l) => l.id === LAYER.prevLine)!;
    const dash = style.layers.find((l) => l.id === LAYER.prevDash)!;
    expect(line).toMatchObject({ filter: ['!=', ['get', 'dash'], true] });
    expect(dash).toMatchObject({ filter: ['==', ['get', 'dash'], true], paint: { 'line-dasharray': [3, 2] } });
    expect(GROUPS.control).toEqual(expect.arrayContaining([LAYER.prevDash, LAYER.nextDash]));
  });

  it('island land (basemap.local) as before, plus today’s coastline (dashed ink, empty for undated land)', () => {
    const style = buildGeoStyle({ ...base, local: 'land-sg' });
    const ids = style.layers.map((l) => l.id);
    expect(ids.slice(3, 10)).toEqual([HI.mask, HI.fill, HI.edge, LOCAL.mask, LOCAL.fill, LOCAL.edge, LOCAL.today]);
    for (const id of [LOCAL.fill, LOCAL.edge]) expect(style.layers.find((l) => l.id === id)).toMatchObject({ filter: ['==', ['get', 'kind'], 'land'] });
    expect(style.layers.find((l) => l.id === LOCAL.today)).toMatchObject({
      type: 'line',
      source: LOCAL.src,
      minzoom: 9.4,
      filter: ['==', ['get', 'kind'], 'coast-today'],
      paint: { 'line-color': '#2a2824', 'line-width': 0.8, 'line-dasharray': [2, 2], 'line-opacity': ['interpolate', ['linear'], ['zoom'], 9.4, 0, 9.6, 0.35] },
    });
  });

  it('regional plate: no world land, its land filled and its coast stroked, rivers, the sheet on top', () => {
    const style = buildGeoStyle({ ...base, local: 'ignored', region: { bounds: [100, 20, 125, 44] } });
    expect((style.sources.land as { data: FeatureCollection }).data).toEqual({ type: 'FeatureCollection', features: [] });
    expect(JSON.stringify(style)).not.toContain('land-50m');
    expect(style.sources[HI.src]).toBeUndefined();
    expect(style.sources[LOCAL.src]).toBeUndefined();
    expect(style.layers.find((l) => l.id === BASE_LAYER_IDS.land)).toMatchObject({ filter: ['==', ['get', 'kind'], 'land'] });
    expect(style.layers.find((l) => l.id === BASE_LAYER_IDS.landEdge)).toMatchObject({ filter: ['==', ['get', 'kind'], 'coast'] });
    const ids = style.layers.map((l) => l.id);
    expect(ids.slice(3, 5)).toEqual([REGION.riverLine, REGION.riverRec]);
    expect(ids.slice(-2)).toEqual([REGION.frameFill, REGION.frameEdge]);
    expect(style.layers.find((l) => l.id === REGION.frameFill)).toMatchObject({ paint: { 'fill-color': '#e9e4d8' } });
    expect(style.layers.find((l) => l.id === REGION.riverRec)).toMatchObject({ paint: { 'line-dasharray': [4, 2.5] } });
    expect(Object.keys(style.sources)).toEqual(expect.arrayContaining([SRC.prev, SRC.next, SRC.graticule]));
  });

  it('river filters pick the courses that exist now', () => {
    expect(riverFilter(['a', 'b'], true)).toEqual(['all', ['==', ['get', 'rec'], true], ['in', ['get', 'id'], ['literal', ['a', 'b']]]]);
  });
});

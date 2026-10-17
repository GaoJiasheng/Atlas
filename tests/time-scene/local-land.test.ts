/**
 * Island-scale land by date (lib/localLand.ts, schema `localLandIssues`):
 * the two-era fixture (tests/time-scene/fixtures/dated-island.json) shows
 * exactly one coast at any time, today's coastline is found, an undated file
 * (four-taps' land-sg) passes through untouched, and the validator rejects
 * overlapping, gappy or half-dated eras.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { decodeLocalLand, ERA_PROP, localEraAt, localLandFilter, parseLocalLand } from '../../src/engines/time-scene/lib/localLand';
import { localLandIssues, timeSceneTopicIssues, type TimeSceneGeoData } from '../../src/engines/time-scene/schema';
import { toNumber } from '../../src/engines/time-scene/lib/time';

const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const fixture = () => read(join(import.meta.dirname, 'fixtures/dated-island.json'));
const landSg = () => read(join(import.meta.dirname, '../../public/geo/land-sg.json'));

describe('island land by date', () => {
  it('tags each dated coast with its era and finds today’s coastline', () => {
    const fc = decodeLocalLand(fixture(), 'dated-island')!;
    const parsed = parseLocalLand(fc);
    expect(parsed.coastToday).toBe(true);
    expect(parsed.eras).toEqual([
      { index: 0, from: -Infinity, to: toNumber('1900-01-01') },
      { index: 1, from: toNumber('1900-01-01'), to: Infinity },
    ]);
    const land = parsed.collection.features.filter((f) => f.properties?.kind === 'land');
    expect(land.map((f) => f.properties?.[ERA_PROP])).toEqual([0, 1]);
    expect(land.map((f) => f.properties?.id)).toEqual(['early', 'late']);
    // The mask and the line are not eras.
    expect(parsed.collection.features.filter((f) => f.properties?.[ERA_PROP] !== undefined)).toHaveLength(2);
  });

  it('exactly one era at the playhead, the boundary belonging to the later one', () => {
    const eras = parseLocalLand(decodeLocalLand(fixture(), 'dated-island')!).eras!;
    expect(localEraAt(eras, toNumber('1819-02-06'))).toBe(0);
    expect(localEraAt(eras, toNumber('1899-12-31'))).toBe(0);
    expect(localEraAt(eras, toNumber('1900-01-01'))).toBe(1);
    expect(localEraAt(eras, toNumber('1965-08-09'))).toBe(1);
    expect(localEraAt([], 1900)).toBeNull();
  });

  it('outside every era: the earliest before them, the latest begun one after or in a gap', () => {
    const eras = [
      { index: 0, from: 1800, to: 1850 },
      { index: 1, from: 1860, to: 1900 },
    ];
    expect(localEraAt(eras, 1700)).toBe(0);
    expect(localEraAt(eras, 1855)).toBe(0);
    expect(localEraAt(eras, 1950)).toBe(1);
  });

  it('layer filter: kind land, and the era when there is one', () => {
    expect(localLandFilter(null)).toEqual(['==', ['get', 'kind'], 'land']);
    expect(localLandFilter(1)).toEqual(['all', ['==', ['get', 'kind'], 'land'], ['==', ['get', ERA_PROP], 1]]);
  });

  it('an undated file (land-sg) is passed through as it is', () => {
    const fc = decodeLocalLand(landSg(), 'land-sg')!;
    const parsed = parseLocalLand(fc);
    expect(parsed.eras).toBeNull();
    expect(parsed.coastToday).toBe(false);
    expect(parsed.collection).toBe(fc);
    expect(decodeLocalLand(landSg(), 'no-such-object')).toBeNull();
  });
});

describe('basemap.local validation', () => {
  const geometries = (topo: { objects: Record<string, { geometries: { properties: Record<string, unknown>; type: string }[] }> }) => topo.objects['dated-island']!.geometries;

  it('the fixture and land-sg pass', () => {
    expect(localLandIssues(fixture(), 'dated-island')).toEqual([]);
    expect(localLandIssues(landSg(), 'land-sg')).toEqual([]);
  });

  it('needs the named object and some land', () => {
    expect(localLandIssues(fixture(), 'land-sg')[0]).toMatch(/expected a TopoJSON with an object "land-sg"/);
    const topo = fixture();
    geometries(topo).splice(1, 2);
    expect(localLandIssues(topo, 'dated-island')).toEqual(['basemap.local: object "dated-island" has no kind: land geometry']);
  });

  it('rejects overlapping and gappy eras, half-dated land and bad dates', () => {
    const overlap = fixture();
    geometries(overlap)[2]!.properties.from = '1890-01-01';
    expect(localLandIssues(overlap, 'dated-island')).toEqual(['dated land: geometry #2 overlaps geometry #1 (it starts before geometry #1 ends)']);
    const gap = fixture();
    geometries(gap)[2]!.properties.from = '1910-01-01';
    expect(localLandIssues(gap, 'dated-island')).toEqual(['dated land: gap between geometry #1 and geometry #2 (no era in force in between)']);
    const half = fixture();
    delete geometries(half)[2]!.properties.from;
    expect(localLandIssues(half, 'dated-island')).toEqual(['dated land: 1 of 2 kind: land geometries have no from / to (each era is one whole coast; date every one)']);
    const bad = fixture();
    geometries(bad)[1]!.properties.to = '1900-13-01';
    expect(localLandIssues(bad, 'dated-island')).toContain('geometry #1: to "1900-13-01" is not a date');
  });

  it('rejects unknown kinds, a polygon as today’s coast and dates off the land', () => {
    const topo = fixture();
    geometries(topo)[0]!.properties.from = '1900';
    geometries(topo)[3]!.type = 'Polygon';
    geometries(topo).push({ type: 'Polygon', properties: { kind: 'reef' } });
    const issues = localLandIssues(topo, 'dated-island');
    expect(issues).toContain('geometry #0: only kind: land carries from / to');
    expect(issues).toContain('geometry #3: kind coast-today must be a LineString or MultiLineString (has Polygon)');
    expect(issues).toContain('geometry #4: kind must be one of mask, land, coast-today (has "reef")');
  });

  it('is reported against the land file by the topic check', () => {
    const topo = fixture();
    geometries(topo)[2]!.properties.from = '1890-01-01';
    const data = { entities: [], control: { keyframes: [] }, events: [], movements: [] } as unknown as TimeSceneGeoData;
    const issues = timeSceneTopicIssues({ basemap: { local: 'dated-island' } }, data, () => topo);
    expect(issues).toEqual([{ level: 'error', file: 'public/geo/dated-island.json', message: expect.stringContaining('overlaps') }]);
  });
});

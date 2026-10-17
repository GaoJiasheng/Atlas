/**
 * The island coast by date in the pipeline (scripts/geo/lib/local-eras.ts,
 * run by local-land.ts with `pipeline.localLand.eras`): the recipe checks,
 * where an era's traced inputs are read from, the properties each era is
 * written with (what lib/localLand.ts and `pnpm validate` read), today's
 * coastline as lines, and the per-layer topology folded into one object
 * that still passes the validator.
 */
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { coastTodayLines, eraInputPath, eraProperties, eraRecipeIssues, foldTopology } from '../scripts/geo/lib/local-eras';
import { localLandIssues } from '../src/engines/time-scene/schema';

const ROOT = join(import.meta.dirname, '..');

describe('local land eras (pipeline)', () => {
  const eras = [
    { id: 'L0', to: '1823-01-01', minus: ['work/town-water.geojson'], src: ['G1', 'G5'] },
    { id: 'L1', from: '1823-01-01', to: '1887-01-01' },
    { id: 'L2', from: '1887-01-01' },
  ];

  it('accepts eras that tile time; names the bad ones by id', () => {
    expect(eraRecipeIssues(eras)).toEqual([]);
    expect(eraRecipeIssues([eras[0]!, { ...eras[1]!, from: '1822-01-01' }, eras[2]!])).toEqual(['L1 overlaps L0 (it starts before L0 ends)']);
    expect(eraRecipeIssues([eras[0]!, eras[2]!])).toEqual(['gap between L0 and L2 (no era in force in between)']);
    expect(eraRecipeIssues([eras[0]!, { ...eras[1]!, id: 'L0' }, eras[2]!])).toEqual(['duplicate era id L0']);
  });

  it('reads work/ and raw/ inputs from the topic folder, anything else from the repo', () => {
    expect(eraInputPath('/t/scripts/geo/x', 'work/a.geojson')).toBe('/t/scripts/geo/x/work/a.geojson');
    expect(eraInputPath('/t/scripts/geo/x', 'raw/b.geojson')).toBe('/t/scripts/geo/x/raw/b.geojson');
    expect(eraInputPath('/t/scripts/geo/x', 'public/geo/land-sg.json')).toBe(join(ROOT, 'public/geo/land-sg.json'));
  });

  it('writes kind, id, the window and the sources', () => {
    expect(eraProperties(eras[0]!)).toEqual({ kind: 'land', id: 'L0', to: '1823-01-01', src: ['G1', 'G5'] });
    expect(eraProperties(eras[2]!)).toEqual({ kind: 'land', id: 'L2', from: '1887-01-01' });
  });

  it('today’s coastline is the exterior rings (no inland water)', () => {
    const outer = [[0, 0], [4, 0], [4, 4], [0, 0]];
    const hole = [[1, 1], [2, 1], [2, 2], [1, 1]];
    const islet = [[6, 6], [7, 6], [7, 7], [6, 6]];
    expect(coastTodayLines([[outer, hole], [islet]])).toEqual([outer, islet]);
  });

  it('folds the per-layer objects into one, shared arcs kept, and the result validates', () => {
    const topo = {
      type: 'Topology' as const,
      arcs: [
        [[103.6, 1.2], [104.1, 1.2], [104.1, 1.5], [103.6, 1.5], [103.6, 1.2]],
        [[103.7, 1.25], [104.0, 1.25], [104.0, 1.42], [103.7, 1.42], [103.7, 1.25]],
      ],
      objects: {
        mask: { type: 'GeometryCollection', geometries: [{ type: 'Polygon', arcs: [[0]], properties: { kind: 'mask' } }] },
        'era-0': { type: 'GeometryCollection', geometries: [{ type: 'Polygon', arcs: [[1]], properties: eraProperties({ id: 'A', to: '1900-01-01' }) }] },
        'era-1': { type: 'GeometryCollection', geometries: [{ type: 'Polygon', arcs: [[1]], properties: eraProperties({ id: 'B', from: '1900-01-01' }) }, { type: null }] },
        today: { type: 'GeometryCollection', geometries: [{ type: 'MultiLineString', arcs: [[1]], properties: { kind: 'coast-today' } }] },
      },
    };
    const folded = foldTopology(topo, ['mask', 'era-0', 'era-1', 'today'], 'land-x');
    expect(Object.keys(folded.objects)).toEqual(['land-x']);
    expect(folded.arcs).toBe(topo.arcs);
    const kinds = ((folded.objects as Record<string, unknown>)['land-x'] as { geometries: { properties: { kind: string } }[] }).geometries.map((g) => g.properties.kind);
    expect(kinds).toEqual(['mask', 'land', 'land', 'coast-today']);
    expect(localLandIssues(folded, 'land-x')).toEqual([]);
  });
});

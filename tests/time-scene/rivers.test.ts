import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseRivers, riverCollection, riverLabel, riversAt } from '../../src/engines/time-scene/lib/rivers';
import { riversFile } from '../../src/engines/time-scene/schema';
import { toNumber } from '../../src/engines/time-scene/lib/time';

const sample = JSON.parse(readFileSync(join(import.meta.dirname, '../../public/geo/sample-region-rivers.json'), 'utf8'));

describe('dated rivers', () => {
  it('the sample rivers file passes the schema', () => {
    expect(riversFile.safeParse(sample).success).toBe(true);
  });

  it('a course shows while from <= t < to (BCE windows; a modern course stays hidden)', () => {
    const rivers = parseRivers(sample);
    expect(rivers.map((r) => r.id)).toEqual(['sample-river', 'sample-river-old', 'sample-river-new', 'sample-river-modern']);
    expect(riversAt(rivers, toNumber('-0400'))).toEqual(['sample-river', 'sample-river-old']);
    expect(riversAt(rivers, toNumber('-0300'))).toEqual(['sample-river', 'sample-river-new']);
    expect(riversAt(rivers, toNumber('-0221'))).toEqual(['sample-river', 'sample-river-new']);
    expect(riversAt(rivers, toNumber('1900'))).toEqual(['sample-river', 'sample-river-new', 'sample-river-modern']);
    expect(rivers.find((r) => r.id === 'sample-river-old')!.reconstructed).toBe(true);
  });

  it('reads TopoJSON too (first object)', () => {
    const topo = {
      type: 'Topology',
      arcs: [[[0, 0], [1, 1]]],
      objects: { r: { type: 'GeometryCollection', geometries: [{ type: 'LineString', arcs: [0], properties: { id: 'ji', name: { en: 'Ji', zh: '济水' }, to: '-0602' } }] } },
    };
    const rivers = parseRivers(topo);
    expect(rivers).toHaveLength(1);
    expect(rivers[0]!.to).toBe(-602);
    expect(riversAt(rivers, -700)).toEqual(['ji']);
    expect(riversAt(rivers, -602)).toEqual([]);
  });

  it('labels sit half-way along the longest line, kept upright', () => {
    const flat = riverLabel([[[0, 0], [10, 0]]])!;
    expect(flat.at).toEqual([5, 0]);
    expect(flat.angle).toBe(0);
    // Running north-east on screen: rotated anticlockwise (negative in CSS), upright either way round.
    const ne = riverLabel([[[0, 0], [10, 10]]])!;
    const sw = riverLabel([[[10, 10], [0, 0]]])!;
    expect(ne.angle).toBeLessThan(0);
    expect(ne.angle).toBeGreaterThanOrEqual(-90);
    expect(sw.angle).toBeCloseTo(ne.angle, 5);
    expect(riverLabel([[[1, 1]]])).toBeNull();
  });

  it('map features carry id and the reconstructed flag', () => {
    const fc = riverCollection(parseRivers(sample));
    expect(fc.features[1]!.properties).toEqual({ id: 'sample-river-old', rec: true });
    expect(fc.features[0]!.geometry.type).toBe('MultiLineString');
  });

  it('rejects a course that ends before it starts and duplicate ids', () => {
    const bad = structuredClone(sample);
    bad.features[2].properties.to = '-0400';
    bad.features[3].properties.id = 'sample-river';
    const issues = riversFile.safeParse(bad).error!.issues.map((i) => i.message).join(' | ');
    expect(issues).toMatch(/`to` must be after `from`/);
    expect(issues).toMatch(/duplicate river id "sample-river"/);
  });
});

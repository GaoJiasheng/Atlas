import { describe, expect, it } from 'vitest';
import { controlFile, timeSceneGeoData } from '../../src/engines/time-scene/schema';
import { decodeControl, decodeTopologyObject } from '../../src/engines/time-scene/lib/control';
import { buildTimeModel } from '../../src/engines/time-scene/lib/model';
import entities from '../../src/content/topics/sample-time/data/entities.json';
import control from '../../src/content/topics/sample-time/data/control.json';
import movements from '../../src/content/topics/sample-time/data/movements.json';
import events from '../../src/content/topics/sample-time/data/events.json';
import sources from '../../src/content/topics/sample-time/data/sources.json';

/**
 * A quantised topology (scale 1, translate 0) of two unit squares:
 *   arc 0  the edge x = 1, (1,0) -> (1,1)            delta-coded
 *   arc 1  the left square's other three sides, (1,1) -> (0,1) -> (0,0) -> (1,0)
 *   arc 2  the right square's other three sides, (1,0) -> (2,0) -> (2,1) -> (1,1)
 * `A` holds both squares (the right one wound clockwise, the way d3 / mapshaper write outer rings),
 * `B` only the left one, as a MultiPolygon.
 */
const topology = {
  type: 'Topology',
  transform: { scale: [1, 1], translate: [0, 0] },
  arcs: [
    [[1, 0], [0, 1]],
    [[1, 1], [-1, 0], [0, -1], [1, 0]],
    [[1, 0], [1, 0], [0, 1], [-1, 0]],
  ],
  objects: {
    A: {
      type: 'GeometryCollection',
      geometries: [
        { type: 'Polygon', arcs: [[0, 1]], properties: { holder: 'north-sample' } },
        { type: 'Polygon', arcs: [[0, -3]], properties: { holder: 'east-sample', label: { en: 'East', zh: '东' } } },
        { type: null, properties: { holder: 'east-sample' } },
      ],
    },
    B: {
      type: 'GeometryCollection',
      geometries: [{ type: 'MultiPolygon', arcs: [[[0, 1]]], properties: { holder: 'north-sample' } }],
    },
  },
};

const shoelace = (ring: number[][]) => {
  let a = 0;
  for (let i = 0; i + 1 < ring.length; i++) a += ring[i]![0]! * ring[i + 1]![1]! - ring[i + 1]![0]! * ring[i]![1]!;
  return a / 2;
};

const topoControl = (patch: Record<string, unknown> = {}) => ({
  topology,
  keyframes: [
    { t: '2000-01-01', object: 'A' },
    { t: '2000-06-01', object: 'B' },
  ],
  ...patch,
});

describe('TopoJSON control keyframes', () => {
  it('decodes an object to a FeatureCollection with GeoJSON winding and properties', () => {
    const fc = decodeTopologyObject(topology, 'A');
    expect(fc.type).toBe('FeatureCollection');
    expect(fc.features).toHaveLength(2); // the null geometry is dropped
    expect(fc.features.map((f) => f.properties?.holder)).toEqual(['north-sample', 'east-sample']);
    expect(fc.features[1]!.properties?.label).toEqual({ en: 'East', zh: '东' });
    for (const f of fc.features) {
      expect(f.geometry.type).toBe('Polygon');
      const ring = (f.geometry as GeoJSON.Polygon).coordinates[0]!;
      expect(ring[0]).toEqual(ring[ring.length - 1]);
      expect(shoelace(ring)).toBeCloseTo(1); // counter-clockwise, area 1
    }
    expect((fc.features[0]!.geometry as GeoJSON.Polygon).coordinates[0]).toEqual([[1, 0], [1, 1], [0, 1], [0, 0], [1, 0]]);
    expect(decodeTopologyObject(topology, 'B').features[0]!.geometry.type).toBe('MultiPolygon');
  });

  it('rejects an unknown object name', () => {
    expect(() => decodeTopologyObject(topology, 'nope')).toThrow(/no object "nope"/);
  });

  it('decodes both shapes to the same keyframe list shape; the plain shape passes through', () => {
    const plain = controlFile.parse(control);
    expect(decodeControl(plain)).toBe(plain.keyframes);
    const topo = controlFile.parse(topoControl());
    const decoded = decodeControl(topo);
    expect(decoded.map((k) => k.t)).toEqual(['2000-01-01', '2000-06-01']);
    expect(decoded[0]!.features.features).toHaveLength(2);
    expect(decoded[1]!.features.features).toHaveLength(1);
  });

  it('feeds the model like the plain shape does', () => {
    const data = timeSceneGeoData.parse({ entities, control: topoControl(), movements, events, sources });
    const model = buildTimeModel(data, []);
    expect(model.keyframes).toHaveLength(2);
    expect(model.keyframes[0]!.keyframe.features.features).toHaveLength(2);
    expect(model.bounds![0]).toBeLessThanOrEqual(0);
    const plain = buildTimeModel(timeSceneGeoData.parse({ entities, control, movements, events, sources }), []);
    expect(plain.keyframes).toHaveLength(3);
  });

  it('validates holders of decoded features against the entities', () => {
    const bad = structuredClone(topoControl()) as { topology: typeof topology };
    bad.topology.objects.A.geometries[0]!.properties.holder = 'nobody';
    const result = timeSceneGeoData.safeParse({ entities, control: bad, movements, events, sources });
    expect(result.success).toBe(false);
    expect(result.success ? [] : result.error.issues.map((i) => i.message)).toContain('unknown entity "nobody"');
  });

  it('checks the topology loosely but firmly', () => {
    const message = (raw: unknown) => {
      const r = controlFile.safeParse(raw);
      return r.success ? null : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    };
    expect(message(topoControl())).toBeNull();
    expect(message(topoControl({ keyframes: [{ t: '2000-01-01', object: 'Z' }] }))).toMatch(/keyframes\.0\.object: topology has no object "Z"/);
    expect(message(topoControl({ topology: { ...topology, arcs: 'x' } }))).toMatch(/topology\.arcs/);
    expect(message(topoControl({ topology: { ...topology, objects: [] } }))).toMatch(/topology\.objects/);
    expect(message(topoControl({ topology: { type: 'Nope', arcs: [], objects: {} } }))).toMatch(/topology\.type/);
    expect(message(topoControl({ keyframes: [{ t: '2000-06-01', object: 'A' }, { t: '2000-01-01', object: 'B' }] }))).toMatch(/strictly ascending/);
    // A keyframe cannot carry both shapes' fields, and plain keyframes cannot sit beside a topology.
    expect(message(topoControl({ keyframes: [{ t: '2000-01-01', features: { type: 'FeatureCollection', features: [] } }] }))).not.toBeNull();
  });

  it('reports ring problems of the decoded geometry (out of range coordinates)', () => {
    const wide = { ...topology, transform: { scale: [1000, 1], translate: [0, 0] } };
    const r = controlFile.safeParse(topoControl({ topology: wide }));
    expect(r.success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { datedLayerDef, datedLayers, topicSchema } from '../../src/content/schema/topic';
import { datedLayerIssues, eventSchema, timeChapterLayerIssues, timeChapterState, timeSceneGeoData, timeSceneIds, timeSceneTopicIssues } from '../../src/engines/time-scene/schema';
import entities from '../../src/content/topics/sample-time/data/entities.json';
import control from '../../src/content/topics/sample-time/data/control.json';
import movements from '../../src/content/topics/sample-time/data/movements.json';
import events from '../../src/content/topics/sample-time/data/events.json';
import sources from '../../src/content/topics/sample-time/data/sources.json';

const label = { en: 'Sample blocks', zh: '示例楼宇' };
const layer = datedLayerDef.parse({ id: 'sample-blocks', file: 'sample-blocks-data', kind: 'point', holder: 'north-sample', label, count: true });
const data = timeSceneGeoData.parse({ entities, control, movements, events, sources });
const point = (properties: Record<string, unknown> = { f: 1960, h: 12 }) => ({ type: 'Point', coordinates: [103.84, 1.34], properties });
const topology = (geometries: unknown[] = [point()]) => ({ type: 'Topology', arcs: [], objects: { [layer.file]: { type: 'GeometryCollection', geometries } } });

describe('dated layer definitions', () => {
  it('requires a holder or a known theme color token', () => {
    expect(datedLayerDef.safeParse({ ...layer, holder: undefined }).success).toBe(false);
    expect(datedLayerDef.safeParse({ ...layer, holder: undefined, color: 'token:cold' }).success).toBe(true);
    for (const color of ['#fff', 'red', 'token:missing-color']) expect(datedLayerDef.safeParse({ ...layer, color }).success).toBe(false);
  });

  it('reserves built-in layer ids and rejects duplicate topic layer ids', () => {
    expect(datedLayers.safeParse([layer, layer]).success).toBe(false);
    for (const id of ['control', 'sites', 'base']) expect(datedLayers.safeParse([{ ...layer, id }]).success).toBe(false);
    expect(datedLayerDef.safeParse({ ...layer, id: 'Bad ID' }).success).toBe(false);
    expect(datedLayerDef.safeParse({ ...layer, file: '../elsewhere' }).success).toBe(false);
  });

  it('only accepts dated overlays for TimeScene GeoStage topics', () => {
    const topic = { id: 'sample-topic', title: label, subtitle: label, subject: 'history', mode: 'time', engine: 'time-scene', stage: 'geo', datedLayers: [layer] };
    expect(topicSchema.safeParse(topic).success).toBe(true);
    expect(topicSchema.safeParse({ ...topic, stage: 'diagram' }).success).toBe(false);
  });

  it('includes dated layer ids in the shared id namespace', () => {
    expect(timeSceneIds(data, { datedLayers: [layer] })).toContainEqual({ kind: 'dated layer', id: 'sample-blocks' });
  });

  it('validates chapter and beat references against this topic, including built-ins', () => {
    const state = timeChapterState.parse({ layers: ['base', layer.id, 'missing-layer'], beats: [{ caption: label, layers: ['control', layer.id, 'another-missing-layer'] }] });
    expect(timeChapterLayerIssues(state, [layer])).toEqual([
      'state.layers: unknown layer "missing-layer"',
      'state.beats.0.layers: unknown layer "another-missing-layer"',
    ]);
    expect(timeChapterState.safeParse({ layers: ['Bad ID'] }).success).toBe(false);
  });
});

describe('dated overlay file validation', () => {
  it('checks files and layer holder ids', () => {
    expect(timeSceneTopicIssues({ datedLayers: [layer] }, data, () => topology())).toEqual([]);
    const issues = timeSceneTopicIssues({ datedLayers: [{ ...layer, holder: 'unknown-holder' }] }, data, () => undefined);
    expect(issues.map((issue) => issue.message)).toEqual([
      'dated layer "sample-blocks": unknown entity "unknown-holder"',
      'dated layer "sample-blocks": file not found',
    ]);
  });

  it('requires one TopoJSON object named after the file', () => {
    expect(datedLayerIssues(topology(), layer)).toEqual([]);
    expect(datedLayerIssues({ type: 'FeatureCollection', features: [] }, layer)).not.toEqual([]);
    expect(datedLayerIssues({ ...topology(), objects: { wrong: { type: 'GeometryCollection', geometries: [] } } }, layer).join()).toContain('expected a TopoJSON object "sample-blocks-data"');
    expect(datedLayerIssues({ ...topology(), objects: { ...topology().objects, extra: { type: 'GeometryCollection', geometries: [] } } }, layer).join()).toContain('expected only');
    expect(datedLayerIssues(topology([{ type: null, properties: { f: 1960 } }]), layer)).toEqual(['dated layer: every feature must have a non-null geometry']);
  });

  it('requires finite numeric f/u and a nonempty [f, u) interval', () => {
    for (const properties of [{ f: '1960' }, {}, { f: Infinity }, { f: 1960, u: Infinity }, { f: 1960, u: 1960 }, { f: 1960, u: 1959 }])
      expect(datedLayerIssues(topology([point(properties)]), layer)).not.toEqual([]);
    expect(datedLayerIssues(topology([point({ f: 1960.5, u: 1961, h: 25 })]), layer)).toEqual([]);
  });

  it('accepts certainty and numeric floor metadata, rejecting malformed values', () => {
    for (const certainty of ['certain', 'approximate']) expect(datedLayerIssues(topology([point({ f: 1960, certainty })]), layer)).toEqual([]);
    for (const properties of [{ f: 1960, certainty: 'guess' }, { f: 1960, h: 'housing' }, { f: 1960, h: -1 }])
      expect(datedLayerIssues(topology([point(properties)]), layer)).not.toEqual([]);
  });

  it('matches point, line and area declarations to geometry, including multi geometries', () => {
    const line = { type: 'LineString', arcs: [0], properties: { f: 1960 } };
    const polygon = { type: 'Polygon', arcs: [[0]], properties: { f: 1960 } };
    const wire = (geometry: unknown, arc: number[][]) => ({ type: 'Topology', arcs: [arc], objects: { [layer.file]: { type: 'GeometryCollection', geometries: [geometry] } } });
    const lineFile = wire(line, [[103.83, 1.33], [103.84, 1.34]]);
    const areaFile = wire(polygon, [[103.83, 1.33], [103.84, 1.33], [103.84, 1.34], [103.83, 1.33]]);
    expect(datedLayerIssues(lineFile, { ...layer, kind: 'line' })).toEqual([]);
    expect(datedLayerIssues(areaFile, { ...layer, kind: 'area' })).toEqual([]);
    expect(datedLayerIssues(lineFile, layer)).not.toEqual([]);
    expect(datedLayerIssues(areaFile, { ...layer, kind: 'line' })).not.toEqual([]);
    expect(datedLayerIssues(topology([{ ...point(), type: 'MultiPoint', coordinates: [[103.84, 1.34]] }]), layer)).toEqual([]);
  });
});

describe('neutral milestone events', () => {
  it('accepts a milestone without sides or result', () => {
    const milestone = eventSchema.parse({ id: 'sample-milestone', t: '1960', at: [103.84, 1.34], kind: 'milestone', importance: 2, title: label, summary: label });
    expect(milestone.kind).toBe('milestone');
    expect(milestone.sides).toBeUndefined();
    expect(milestone.result).toBeUndefined();
  });
});

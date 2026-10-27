import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { monthlyResourceIssues } from '../scripts/lib/monthly-resources';
import { topicSchema } from '../src/content/schema/topic';

const topic = topicSchema.parse(
  JSON.parse(readFileSync(join(import.meta.dirname, '../src/content/topics/sample-climate/topic.yaml'), 'utf8')),
);
const sources = new Set(['S22', 'S25', 'S32', 'S101', 'S102', 'S103', 'S199']);
const readGeo = (stem: string) => JSON.parse(readFileSync(join(import.meta.dirname, '../public/geo', `${stem}.json`), 'utf8'));
const smallTopic = () => ({
  ...topic,
  monthlyLayers: topic.monthlyLayers!.filter((layer) => layer.id === 'fixture-rain'),
});

describe('monthly public resources: build/validate cross-checks', () => {
  it('accepts real native arrays and deliberately offset artificial arrays', () => {
    expect(monthlyResourceIssues(topic, sources, readGeo)).toEqual([]);
  });
  it('reports missing local resources and unknown declared sources', () => {
    const value = smallTopic();
    value.monthlyLayers[0] = { ...value.monthlyLayers[0]!, sources: ['S999'] };
    expect(monthlyResourceIssues(value, sources, () => undefined)).toEqual([
      {
        file: 'topic.yaml',
        message: 'monthlyLayers.0.sources.0: unknown source S999',
      },
      {
        file: 'public/geo/sample-climate-fixture-rain.json',
        message: 'monthly layer "fixture-rain": file not found',
      },
    ]);
  });
  it('checks the KEY display-rule sources (climatology.keySources)', () => {
    const value = { ...smallTopic(), climatology: { ...topic.climatology!, keySources: ['S199', 'S998'] } };
    expect(monthlyResourceIssues(value, sources, readGeo)).toEqual([
      { file: 'topic.yaml', message: 'climatology.keySources.1: unknown source S998' },
    ]);
  });
  it('checks resource quantity, period, sources and source-chip agreement', () => {
    const value = smallTopic();
    const resource = readGeo('sample-climate-fixture-rain');
    resource.period.id = 'different-period';
    expect(monthlyResourceIssues(value, sources, () => resource).map((issue) => issue.message)).toContain(
      'period.id: must match topic periodId',
    );
    resource.period.id = value.climatology!.periodId;
    resource.sources = ['S999'];
    expect(monthlyResourceIssues(value, sources, () => resource).map((issue) => issue.message)).toContain('sources.0: unknown source S999');
    resource.sources = ['S25'];
    expect(monthlyResourceIssues(value, sources, () => resource).map((issue) => issue.message)).toContain(
      'sources: must match the monthly layer sources',
    );
    expect(monthlyResourceIssues(value, sources, () => readGeo('sample-climate-fixture-wind')).map((issue) => issue.message)).toContain(
      'kind: must match layer quantity',
    );
  });
  it('reports the exact malformed array path without repairing bad data', () => {
    const resource = readGeo('sample-climate-fixture-rain');
    resource.frames[0].values[0] = -1;
    const issues = monthlyResourceIssues(smallTopic(), sources, () => resource);
    expect(
      issues.some(
        (issue) => issue.file === 'public/geo/sample-climate-fixture-rain.json' && issue.message.startsWith('frames.0.values.0:'),
      ),
    ).toBe(true);
    expect(resource.frames[0].values[0]).toBe(-1);
  });
  it('does not apply climate resource rules to chronological topics', () => {
    expect(
      monthlyResourceIssues({ temporalMode: 'chronological' }, sources, () => {
        throw new Error('must not read');
      }),
    ).toEqual([]);
  });
  it('accepts static basemaps but rejects dated GeoJSON and TopoJSON properties', () => {
    const value = { ...smallTopic(), basemap: { local: 'static-land' } };
    const land = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: { kind: 'land' }, geometry: null }],
    };
    const read = (stem: string) => (stem === 'static-land' ? land : readGeo(stem));
    expect(monthlyResourceIssues(value, sources, read)).toEqual([]);
    const dated = {
      ...land.features[0]!,
      properties: { kind: 'land', from: '2000' },
    };
    expect(
      monthlyResourceIssues(value, sources, (stem) => (stem === 'static-land' ? { ...land, features: [dated] } : readGeo(stem))),
    ).toContainEqual({
      file: 'public/geo/static-land.json',
      message: 'static-land.features.0.properties.from: climatology basemaps must be undated',
    });
    const topo = {
      type: 'Topology',
      objects: { rivers: { geometries: [{ properties: { to: '2100' } }] } },
    };
    expect(monthlyResourceIssues(value, sources, (stem) => (stem === 'static-land' ? topo : readGeo(stem)))[0]?.message).toContain(
      'properties.to',
    );
  });
});

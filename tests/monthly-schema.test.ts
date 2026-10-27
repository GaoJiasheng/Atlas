import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { topicSchema } from '../src/content/schema/topic';
import { engineSchemas } from '../src/engines/schemas';

const rawTopic = () => JSON.parse(readFileSync(join(import.meta.dirname, '../src/content/topics/sample-climate/topic.yaml'), 'utf8'));
const schemas = engineSchemas('time-scene', 'geo', 'climatology');
const bi = { en: 'Fixture', zh: '测试' };
const site = {
  id: 'site-one',
  kind: 'site',
  at: [103.85, 1.3],
  importance: 1,
  title: bi,
  summary: bi,
  sources: ['S1'],
};
const rawData = () => ({
  entities: [],
  movements: [],
  control: { keyframes: [] },
  events: [site],
  sources: { sources: [{ id: 'S1', text: bi }] },
});

function topicIssue(edit: (value: any) => void, path: string) {
  const value = rawTopic();
  edit(value);
  const result = topicSchema.safeParse(value);
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error.issues.some((issue) => issue.path.join('.') === path)).toBe(true);
}

describe('monthly authoring restrictions beyond normal date topics', () => {
  it.each(['base', 'control', 'borders', 'movements', 'battles', 'participation', 'labels', 'sites'])(
    'reserves built-in layer id %s',
    (id) => {
      topicIssue((topic) => {
        topic.monthlyLayers[0].id = id;
      }, 'monthlyLayers.0.id');
    },
  );
  it.each(['../remote', 'geo/wind', 'https://example.org/wind'])('rejects non-local resource stem %s', (file) => {
    topicIssue((topic) => {
      topic.monthlyLayers[0].file = file;
    }, 'monthlyLayers.0.file');
  });
  it('requires layer quantities, labels, periods and legal source metadata', () => {
    topicIssue((topic) => {
      topic.monthlyLayers = [];
    }, 'monthlyLayers');
    topicIssue((topic) => {
      topic.monthlyLayers[0].quantity = 'temperature';
    }, 'monthlyLayers.0.quantity');
    topicIssue((topic) => {
      topic.monthlyLayers[0].label.en = '';
    }, 'monthlyLayers.0.label.en');
    topicIssue((topic) => {
      topic.monthlyLayers[0].periodId = 'other-period';
    }, 'monthlyLayers.0.periodId');
    topicIssue((topic) => {
      topic.monthlyLayers[0].sources = ['SX01'];
    }, 'monthlyLayers.0.sources.0');
    topicIssue((topic) => {
      topic.monthlyLayers[0].sources = [];
    }, 'monthlyLayers.0.sources');
    topicIssue((topic) => {
      topic.monthlyLayers[0].id = topic.monthlyLayers[1].id;
    }, 'monthlyLayers.1.id');
  });
  it('does not leak the new fields into chronological or other engines', () => {
    topicIssue((topic) => {
      topic.temporalMode = 'chronological';
      delete topic.climatology;
    }, 'monthlyLayers');
    topicIssue((topic) => {
      topic.engine = 'math-scene';
      topic.stage = 'svg';
    }, 'temporalMode');
    topicIssue((topic) => {
      topic.climatology.initialMonth = 2.5;
    }, 'climatology.initialMonth');
    topicIssue((topic) => {
      topic.climatology.periodId = 'Not legal';
    }, 'climatology.periodId');
  });
  it('retains source-reference validation and forbids nonempty historical datasets', () => {
    expect(schemas.data.safeParse(rawData()).success).toBe(true);
    for (const value of [
      { ...rawData(), entities: [{ id: 'state-one' }] },
      { ...rawData(), movements: [{ id: 'route-one' }] },
      { ...rawData(), events: [{ ...site, sources: ['S999'] }] },
      { ...rawData(), events: [{ ...site, until: '2020' }] },
      { ...rawData(), events: [{ ...site, sides: { attacker: 'unlisted', defender: 'another' } }] },
      { ...rawData(), events: [{ ...site, forces: { unlisted: 1 } }] },
      { ...rawData(), extraFile: {} },
    ])
      expect(schemas.data.safeParse(value).success).toBe(false);
  });
  it('checks site indices and unknown author keys through the shared schema entry', () => {
    const state = {
      month: 1,
      index: ['unknown-site'],
      beats: [{ month: 1, caption: bi }],
    };
    const data = schemas.data.parse(rawData());
    expect(schemas.chapterIssues!(state, data)).toEqual(['state.index: unknown site "unknown-site"']);
    for (const [key, value] of Object.entries({
      windMode: 'arrows',
      readingAnchor: 'figure-one',
      preset: 'view-region',
      factIds: ['F1'],
      figure: 'figure-one',
    }))
      expect(
        schemas.chapterState.safeParse({
          month: 1,
          beats: [{ month: 1, caption: bi, [key]: value }],
        }).success,
      ).toBe(false);
  });
});

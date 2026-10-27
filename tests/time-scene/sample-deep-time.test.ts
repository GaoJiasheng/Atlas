/** This draft fixture exercises the full build loader with explicitly synthetic TEST/DESIGN material. */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { topicSchema } from '../../src/content/schema/topic';
import { loadDeepTime } from '../../src/engines/time-scene/deep-time-build';
import { deepTimeBundleSchema, type DeepTimeBundle } from '../../src/engines/time-scene/deep-time';
import { filterModernPoints, frameAt } from '../../src/engines/time-scene/lib/deepTime';
import { parseEngineData } from '../../src/engines/schemas';

const root = resolve('src/content/topics/sample-deep-time');
const json = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));
const topic = topicSchema.parse(parse(readFileSync(resolve(root, 'topic.yaml'), 'utf8')));
const raw = Object.fromEntries(readdirSync(resolve(root, 'data')).filter((name) => name.endsWith('.json'))
  .map((name) => [name.slice(0, -5), json(resolve(root, 'data', name))]));
const loaded = loadDeepTime(topic, raw, (stem) => json(resolve('public/geo', `${stem}.json`)));
const bundle = deepTimeBundleSchema.parse(loaded.deepTime) as DeepTimeBundle;

describe('draft deep-time engine fixture', () => {
  it('is explicitly draft and loads through the actual engine data pipeline', () => {
    expect(topic.status).toBe('draft');
    expect(topic.maDigits).toBe(3);
    expect(topic.subtitle.en).toContain('TEST/DESIGN');
    expect(() => parseEngineData('time-scene', 'geo', loaded, 'sample-deep-time')).not.toThrow();
    expect(bundle.reconstruction.frames.map((frame) => frame.t.ma)).toEqual([250, 230, 150, 100, 70, 65, 0]);
    expect(frameAt(bundle.reconstruction, 66)).toMatchObject({ frameMa: 70, deltaMa: 4 });
  });

  it('retains independent intervals, boundary overlaps, references and aggregate suppression counts', () => {
    for (const [selectedMa, count] of [[70, 2], [80, 2], [120, 0], [140, 1], [100, 1]]) {
      expect(filterModernPoints(bundle.points, { selectedMa: selectedMa!, cards: bundle.cards })).toMatchObject({
        fossilsTotal: 4, fossilsVisible: count, referencePointsTotal: 2, referenceCardsTotal: 4,
      });
    }
    expect(bundle.inset?.suppression).toEqual({ countryCode: 'MY', collections: 2, occurrences: 3 });
    expect(bundle.points.filter((point) => point.kind === 'fossil-collection' && point.countryCode === 'MY')).toEqual([]);
    const my = bundle.cards.filter((card) => card.countryCode === 'MY');
    expect(my).toHaveLength(1);
    for (const key of ['at', 'geometry', 'coordinates', 'centroid']) expect(my[0]).not.toHaveProperty(key);
  });

  it('rejects a missing frame rather than silently replacing it with modern land', () => {
    expect(() => loadDeepTime(topic, raw, (stem) => stem === 'sample-de-land-65' ? undefined : json(resolve('public/geo', `${stem}.json`))))
      .toThrow('sample-de-land-65.json: file not found');
  });
});

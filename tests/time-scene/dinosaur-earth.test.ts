import { compactDeepTimeData } from '../../src/engines/time-scene/deep-time-transport';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { loadDeepTime } from '../../src/engines/time-scene/deep-time-build';
import { topicSchema } from '../../src/content/schema/topic';
import { timeChapterState, timeSceneGeoData } from '../../src/engines/time-scene/schema';
import { filterModernPoints, frameAt, snapshotReferenceId } from '../../src/engines/time-scene/lib/deepTime';

const dir = resolve('src/content/topics/dinosaur-earth');
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const topic = () => topicSchema.parse(parse(readFileSync(resolve(dir, 'topic.yaml'), 'utf8')));
const chapters = () => readdirSync(resolve(dir, 'chapters')).filter((f) => f.endsWith('.mdx')).sort().map((f) => {
  const text = readFileSync(resolve(dir, 'chapters', f), 'utf8');
  const [, front, body] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text)!;
  return { ...parse(front!), body: body! };
});
const data = () => {
  const raw = Object.fromEntries(readdirSync(resolve(dir, 'data')).filter((f) => f.endsWith('.json')).map((f) => [f.slice(0, -5), read(resolve(dir, 'data', f))]));
  return timeSceneGeoData.parse(loadDeepTime(topic(), raw, (stem) => read(resolve('public/geo', `${stem}.json`))));
};

describe('published Dinosaur Earth: captions and evidence agree with the shipped model', () => {
  it('has the approved 8 bilingual chapters, 35 exact captions and Ma bindings', () => {
    expect(topic()).toMatchObject({ status: 'published', maDigits: 3, subject: 'geography', engine: 'time-scene' });
    const cs = chapters();
    expect(cs.map((c) => c.id)).toEqual(['background', 'triassic-world', 'jurassic-world', 'cretaceous-world', 'fossil-atlas', 'southeast-asian-finds', 'impact-boundary', 'earth-today']);
    expect(cs.map((c) => c.state.beats.length)).toEqual([3, 4, 4, 4, 5, 5, 5, 5]);
    const approved = readFileSync(resolve('docs/47-dinosaur-earth-content-spec.md'), 'utf8').split('\n').filter((line) => /^\| `b\d{2}-\d`/.test(line)).map((line) => line.split('|').map((cell) => cell.trim()));
    const beats = cs.flatMap((c) => timeChapterState.parse(c.state).beats!);
    expect(beats).toHaveLength(35);
    expect(approved).toHaveLength(35);
    beats.forEach((beat, i) => {
      expect(beat.caption.en).toBe(approved[i]![4]);
      expect(beat.caption.zh).toBe(approved[i]![5]);
      expect(beat.caption.en.split(/\s+/).length).toBeLessThanOrEqual(45);
      expect(beat.t).toEqual({ ma: Number(approved[i]![2]!.split('/')[0]!.trim()) });
      expect(beat.camera?.zoom ?? 0).toBeLessThanOrEqual(3.6);
    });
    for (const c of cs) {
      expect(c.body).toContain('<Lang en>'); expect(c.body).toContain('<Lang zh>');
      expect((c.body.match(/<More\b/g) ?? []).length).toBeGreaterThanOrEqual(2);
      for (const layer of c.state.layers ?? []) expect(['base', 'fossils-modern']).toContain(layer);
    }
  });

  it('ships only the ten real model ages; 66 selects70 and65 selects65', () => {
    const bundle = data().deepTime!;
    expect(bundle.reconstruction.frames.map((f) => f.t.ma)).toEqual([250, 230, 200, 170, 150, 130, 100, 70, 65, 0]);
    expect(frameAt(bundle.reconstruction, 66)).toMatchObject({ selectedMa: 66, frameMa: 70, deltaMa: 4 });
    expect(frameAt(bundle.reconstruction, 65)).toMatchObject({ frameMa: 65, deltaMa: 0 });
    expect(frameAt(bundle.reconstruction, 32.5)).toMatchObject({ frameMa: 65, deltaMa: 32.5 });
    expect(existsSync(resolve('public/geo/de-land-66.json'))).toBe(false);
  });

  it('retains occurrence ages and excludes all precise Malaysian fossil sites', () => {
    const bundle = data().deepTime!;
    const fossils = bundle.points.filter((p) => p.kind === 'fossil-collection');
    expect(fossils).toHaveLength(1274);
    expect(fossils.reduce((n, p) => n + p.occurrenceAges.length, 0)).toBe(2103);
    expect(new Set(fossils.map((p) => p.countryCode)).size).toBe(61);
    expect(fossils.some((p) => p.countryCode === 'MY')).toBe(false);
    const example = fossils.find((p) => p.id === 'pbdb-col-24178')!;
    expect(example.occurrenceAges).toHaveLength(3);
    expect(bundle.references?.['6837']).toContain('Wedel, R. L. Cifelli');
    for (const point of fossils) for (const age of point.occurrenceAges) expect(bundle.references?.[snapshotReferenceId(age.basis)!]).toBeTruthy();
    expect(example.occurrenceAges.every((a) => a.olderMa === 121.4 && a.youngerMa === 100.5 && a.basis.en.length > 10 && a.sources.length)).toBe(true);
    expect(bundle.inset!.suppression).toEqual({ countryCode: 'MY', collections: 3, occurrences: 3 });
    const my = bundle.cards.filter((c) => c.countryCode === 'MY'); expect(my).toHaveLength(1);
    for (const key of ['at', 'coordinates', 'geometry', 'centroid']) expect(my[0]).not.toHaveProperty(key);
    expect(bundle.points.find((p) => p.id === 'site-singapore-modern')?.at).toEqual([103.816925, 1.366587]);
    expect(bundle.points.find((p) => p.id === 'site-chicxulub-modern')?.at).toEqual([-89.5, 21.333333]);
    const counts = filterModernPoints(bundle.points, { selectedMa: 66, cards: bundle.cards });
    expect(counts).toMatchObject({ queryWindowMa: [61, 71], fossilsTotal: 1274, referencePointsTotal: 2, referenceCardsTotal: 4 });
  });

  it('stays under the map asset budget including all sanitized metadata', () => {
    const total = readdirSync(resolve('public/geo')).filter((f) => f.startsWith('de-') && f.endsWith('.json')).reduce((n, f) => n + statSync(resolve('public/geo', f)).size, 0);
    const compact = compactDeepTimeData(data()) as ReturnType<typeof data>;
    expect(compact.deepTime?.points).toEqual([]);
    expect(compact.deepTime?.land).toBeUndefined();
    const topicBytes = Buffer.byteLength(JSON.stringify(compact));
    expect(total + topicBytes).toBeLessThanOrEqual(2_000_000);
  });
});

import { describe, expect, it } from 'vitest';
import {
  deepTimeMa, modernPointSchema, referenceCardSchema, modernInsetConfigSchema,
  modernInsetManifestSchema, reconstructionManifestSchema, reconstructionFrameIssues,
  modernReferenceIssues, sourceReferenceIssues,
  type ModernPoint, type FossilCollection, type ReferenceCard,
} from '../../src/engines/time-scene/deep-time';
import { frameAt, fossilQueryWindow, filterModernPoints, derivePbdbCollections, type PbdbOccurrence } from '../../src/engines/time-scene/lib/deepTime';
import { toNumber, fromNumber } from '../../src/engines/time-scene/lib/time';
import { parseTimeParam, formatTimeParam } from '../../src/lib/time';

// All synthetic ages and counts are TEST/DESIGN, never content facts.
const bi = { en: 'TEST', zh: '测试' };
const ages = [250, 230, 200, 170, 150, 130, 100, 70, 65, 0];
const manifest = reconstructionManifestSchema.parse({
  version: 1, modelId: 'test-model', modelLabel: bi, coordinateSpace: 'reconstructed',
  geometryMeaning: 'exposed-land', method: bi, sources: ['S1'],
  frames: ages.map((ma) => ({ id: `k${ma}`, t: { ma }, file: `test-${ma}`, sampleBounds: [-180, -90, 180, 90], sources: ['S1'] })),
});
function fossil(id: string, intervals: [number, number][]): FossilCollection {
  return { id, coordinateSpace: 'modern', at: [10, 10], title: bi, summary: bi, sources: ['S1'],
    kind: 'fossil-collection', pbdbCollectionId: id, countryCode: 'TH', precision: bi,
    occurrenceAges: intervals.map(([olderMa, youngerMa], i) => ({ pbdbOccurrenceId: `${id}-${i}`, olderMa, youngerMa, basis: bi, sources: ['S1'] })),
  };
}
const reference: ModernPoint = { id: 'reference', kind: 'reference', role: 'singapore', coordinateSpace: 'modern', at: [0, 0], title: bi, summary: bi, sources: ['S1'] };
const card: ReferenceCard = { id: 'card', kind: 'reference-card', role: 'regional-find', coordinateSpace: 'modern', title: bi, summary: bi, detail: bi, regionLabel: bi, countryCode: 'MY', precision: 'region-only', sources: ['S1'] };

describe('deep-time finite Ma and hold-older samples', () => {
  it('reuses the existing geological numeric axis and exact thousandths', () => {
    expect(toNumber({ ma: 200 })).toBe(-200000000);
    expect(fromNumber(-251902000, 'ma', { maDigits: 3 })).toEqual({ ma: 251.902 });
  });
  it.each(['201.4ma', '143.1ma', '251.902ma'])('preserves %s in URL codecs', (value) => {
    expect(formatTimeParam(parseTimeParam(value)!)).toBe(value);
  });
  it.each([[250, 250], [230, 230], [201.4, 230], [150, 150], [66, 70], [65, 65], [32.5, 65], [0, 0]])('selects %s Ma as frame %s', (q, expected) => {
    const result = frameAt(manifest, q)!;
    expect(result.frameMa).toBe(expected);
    expect(result.deltaMa).toBeCloseTo(expected - q, 9);
  });
  it('clamps out-of-topic geological ages before choosing the sample', () => {
    expect(frameAt(manifest, 251.902)).toMatchObject({ selectedMa: 250, frameMa: 250, deltaMa: 0 });
  });
  it.each([NaN, Infinity, -Infinity, -1, Number.MAX_VALUE])('rejects invalid/overflowed Ma %s', (ma) => {
    expect(deepTimeMa.safeParse({ ma }).success).toBe(false);
    if (ma < 0 && Number.isFinite(ma)) expect(frameAt(manifest, ma)?.selectedMa).toBe(0);
    else expect(() => frameAt(manifest, ma)).toThrow();
  });
  it('rejects dates, duplicate frame ages, unknown fields, duplicate files and out-of-order frames', () => {
    for (const bad of [
      { ...manifest, surprise: 1 },
      { ...manifest, frames: [{ ...manifest.frames[0]!, t: '2000' }] },
      { ...manifest, frames: [manifest.frames[0], manifest.frames[0]] },
      { ...manifest, frames: [...manifest.frames].reverse() },
      { ...manifest, frames: manifest.frames.map((f) => ({ ...f, file: 'same-file' })) },
    ]) expect(reconstructionManifestSchema.safeParse(bad).success).toBe(false);
  });
});

describe('modern find occurrence intervals', () => {
  const points = [fossil('a', [[75, 65]]), fossil('b', [[90, 80]]), fossil('c', [[66, 66]])];
  it('uses closed overlap boundaries rather than midpoint ages', () => {
    expect(fossilQueryWindow(70)).toEqual([65, 75]);
    expect(filterModernPoints(points, { selectedMa: 70 })).toMatchObject({ fossilsTotal: 3, fossilsVisible: 2, ageOverlapCount: 2 });
    expect(filterModernPoints(points, { selectedMa: 80 })).toMatchObject({ queryWindowMa: [75, 85], fossilsVisible: 2 });
    expect(fossilQueryWindow(0)).toEqual([0, 5]);
  });
  it('preserves gaps between occurrences in a collection', () => {
    const disjoint = [fossil('gap', [[145, 140], [100, 95]])];
    expect(filterModernPoints(disjoint, { selectedMa: 120 }).fossilsVisible).toBe(0);
    expect(filterModernPoints(disjoint, { selectedMa: 140 }).fossilsVisible).toBe(1);
    expect(filterModernPoints(disjoint, { selectedMa: 100 }).fossilsVisible).toBe(1);
    expect(disjoint[0]!.occurrenceAges).toHaveLength(2);
  });
  it('hiding symbols changes visible counts but keeps total/overlap and restores them on reopening', () => {
    for (const options of [{ fossilsEnabled: false }, { fossilsEnabled: false, insetVisible: false }]) {
      expect(filterModernPoints(points, { selectedMa: 70, ...options })).toMatchObject({ fossilsTotal: 3, ageOverlapCount: 2, fossilsVisible: 0 });
    }
    expect(filterModernPoints(points, { selectedMa: 70 }).fossilsVisible).toBe(2);
    expect(filterModernPoints(points, { selectedMa: 70, insetVisible: false })).toMatchObject({ fossilsTotal: 3, ageOverlapCount: 2, fossilsVisible: 2, visiblePoints: [] });
  });
  it('references/cards do not count as fossils and remain independent from ages and fossil layer', () => {
    const references = [reference, { ...reference, id: 'reference-2' }];
    const cards = Array.from({ length: 4 }, (_, i) => ({ ...card, id: `card-${i}` }));
    const filtered = filterModernPoints([...points, ...references], { selectedMa: 200, cards, fossilsEnabled: false });
    expect(filtered).toMatchObject({ fossilsVisible: 0, referencePointsTotal: 2, referenceCardsTotal: 4 });
    expect(filtered.visiblePoints).toEqual(references);
  });
  it('all-mesozoic has no query window and view clipping does not change record totals', () => {
    expect(filterModernPoints(points, { selectedMa: 0, fossilMode: 'all-mesozoic', bounds: [90, -10, 120, 25] })).toMatchObject({ queryWindowMa: null, fossilsTotal: 3, fossilsVisible: 3, fossilsInView: 0, ageOverlapCount: 0 });
  });
});

describe('PBDB derivation and protected modern positions', () => {
  const row: PbdbOccurrence = { occurrenceId: '1', collectionId: 'one', countryCode: 'TH', at: [10, 10], olderMa: 75, youngerMa: 65 };
  it('deduplicates occurrences stably before grouping, while same-position collections remain distinct', () => {
    const result = derivePbdbCollections([row, { ...row }, { ...row, occurrenceId: '2' }, { ...row, occurrenceId: '3', collectionId: 'two' }]);
    expect(result).toMatchObject({ unionOccurrences: 3, publicOccurrences: 3 });
    expect(result.collections).toHaveLength(2);
    expect(result.collections[0]!.occurrences.map((o) => o.occurrenceId)).toEqual(['1', '2']);
  });
  it('suppresses MY occurrences and collections before producing any public position object', () => {
    const result = derivePbdbCollections([row, { ...row, occurrenceId: '2', collectionId: 'my-a', countryCode: 'MY' }, { ...row, occurrenceId: '3', collectionId: 'my-a', countryCode: 'MY' }, { ...row, occurrenceId: '4', collectionId: 'my-b', countryCode: 'MY' }]);
    expect(result).toMatchObject({ publicOccurrences: 1, suppressedCollections: 2, suppressedOccurrences: 3 });
    expect(result.collections).toHaveLength(1);
    expect(JSON.stringify(result.collections)).not.toContain('my-a');
    expect(result.collections.every((p) => p.countryCode !== 'MY')).toBe(true);
  });
  it('reports excluded missing positions without treating 0/0 as missing', () => {
    const result = derivePbdbCollections([{ ...row, at: [0, 0] }, { ...row, occurrenceId: '2', at: null }]);
    expect(result).toMatchObject({ missingCoordinates: 1, publicOccurrences: 1 });
    expect(result.collections[0]!.at).toEqual([0, 0]);
  });
  it('fails on contradictory duplicates, collection coordinate conflicts, and illegal ages', () => {
    for (const second of [{ ...row, at: [20, 20] as [number, number] }, { ...row, occurrenceId: '2', at: [20, 20] as [number, number] }, { ...row, olderMa: 60 }, { ...row, youngerMa: NaN }]) {
      expect(() => derivePbdbCollections([row, second])).toThrow();
    }
  });
  it('strictly rejects MY fossil positions and any card coordinate field; permits a coordinate-free MY card', () => {
    expect(modernPointSchema.safeParse({ ...fossil('protected', [[100, 95]]), countryCode: 'MY' }).success).toBe(false);
    expect(referenceCardSchema.safeParse(card).success).toBe(true);
    for (const key of ['at', 'geometry', 'coordinates', 'centroid']) expect(referenceCardSchema.safeParse({ ...card, [key]: [10, 10] }).success).toBe(false);
    expect(modernPointSchema.safeParse(reference).success).toBe(true);
  });
  it('validates occurrence intervals and required bilingual basis/source fields', () => {
    const good = fossil('valid', [[66, 66]]);
    expect(modernPointSchema.safeParse(good).success).toBe(true);
    for (const occurrenceAges of [[], [{ ...good.occurrenceAges[0], olderMa: 65 }], [{ ...good.occurrenceAges[0], basis: { en: 'Only EN' } }], [{ ...good.occurrenceAges[0], sources: [] }]]) expect(modernPointSchema.safeParse({ ...good, occurrenceAges }).success).toBe(false);
  });
});

describe('modern cross-file validation', () => {
  it('resolves sources down to individual occurrence ages and rejects unknown country links and duplicate collections/occurrences', () => {
    expect(sourceReferenceIssues(fossil('a', [[100, 95]]), new Set())).toHaveLength(2);
    expect(sourceReferenceIssues(fossil('a', [[100, 95]]), new Set(['S1']))).toEqual([]);
    expect(modernReferenceIssues([fossil('a', [[100, 95]]), { ...fossil('a', [[100, 95]]), id: 'b' }], [{ ...card, linkedCountryFeatureId: 'MY' }], new Set())).toEqual(expect.arrayContaining([expect.stringContaining('duplicate collection'), expect.stringContaining('duplicate occurrence'), expect.stringContaining('unknown country')]));
  });
  it('requires exactly the three bounded modern views and valid local asset stems', () => {
    const config = { file: 'test-modern', land: 'test-land', countries: 'test-countries', label: bi, defaultView: 'world', defaultVisible: true, ageWindowHalfWidthMa: 5,
      views: [{ id: 'world', label: bi, bounds: [-180, -85, 180, 85] }, { id: 'southeast-asia', label: bi, bounds: [90, -10, 120, 25] }, { id: 'mexico', label: bi, bounds: [-105, 10, -80, 30] }] };
    expect(modernInsetConfigSchema.safeParse(config).success).toBe(true);
    expect(modernInsetConfigSchema.safeParse({ ...config, file: 'https://remote.invalid/file' }).success).toBe(false);
    expect(modernInsetConfigSchema.safeParse({ ...config, views: [...config.views.slice(0, 2), config.views[0]] }).success).toBe(false);
    expect(modernInsetManifestSchema.safeParse({ version: 1, pointFiles: ['one'], cardFiles: ['one'], suppression: { countryCode: 'MY', collections: 0, occurrences: 0 } }).success).toBe(false);
  });
});

describe('reconstructed frame topology', () => {
  const frame = manifest.frames[0]!;
  function topology(coordinates: number[][], kind = 'land', type = 'Polygon') {
    return { type: 'Topology', objects: { [frame.file]: { type: 'GeometryCollection', geometries: [{ type, arcs: type === 'Polygon' ? [[0]] : [0], properties: { kind, modelId: manifest.modelId, frameMa: frame.t.ma } }] } }, arcs: [coordinates] };
  }
  const square = [[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]];
  it('accepts a finite closed nonempty land frame and verifies the exact object/model/age', () => {
    expect(reconstructionFrameIssues(topology(square), frame, manifest.modelId)).toEqual([]);
    expect(reconstructionFrameIssues(topology(square), frame, 'wrong-model')).not.toEqual([]);
    expect(reconstructionFrameIssues(topology(square), { ...frame, t: { ma: 66 } }, manifest.modelId)).not.toEqual([]);
    expect(reconstructionFrameIssues(topology(square), { ...frame, file: 'missing' }, manifest.modelId)).not.toEqual([]);
  });
  it('rejects zero-area, crossing, unclosed, invalid coordinates and cross-dateline segments', () => {
    for (const points of [
      [[0, 0], [1, 0], [2, 0], [0, 0]],
      [[0, 0], [4, 4], [4, 0], [1, 5], [0, 0]],
      [[0, 0], [2, 0], [2, 2], [0, 2]],
      [[0, 0], [NaN, 0], [2, 2], [0, 0]],
      [[-179, 0], [179, 0], [179, 2], [-179, 0]],
    ]) expect(reconstructionFrameIssues(topology(points), frame, manifest.modelId)).not.toEqual([]);
  });
  it('rejects coast polygons and cut edges styled as coast', () => {
    expect(reconstructionFrameIssues(topology(square, 'coast'), frame, manifest.modelId)).toContain('frame must contain nonempty land');
    expect(reconstructionFrameIssues(topology([[179, 0], [179, 2]], 'coast', 'LineString'), { ...frame, sampleBounds: [-180, -89, 179, 90] }, manifest.modelId)).toEqual(expect.arrayContaining([expect.stringContaining('coast includes frame cut edge')]));
    expect(reconstructionFrameIssues(topology([[180, 0], [180, 2]], 'coast', 'LineString'), frame, manifest.modelId)).toEqual(expect.arrayContaining([expect.stringContaining('coast includes frame cut edge')]));
  });
});

describe('hold-older query clamping differs from author-data validation', () => {
  it('clamps a finite negative query to the youngest model sample', () => {
    const m = { version: 1 as const, modelId: 'test-model', modelLabel: { en: 'TEST', zh: '测试' }, coordinateSpace: 'reconstructed' as const, geometryMeaning: 'exposed-land' as const, method: { en: 'TEST', zh: '测试' }, sources: ['S1'], frames: [250, 70, 65, 0].map((ma) => ({ id: `frame-${ma}`, file: `land-${ma}`, t: { ma }, sampleBounds: [-180, -90, 180, 90] as [number, number, number, number], sources: ['S1'] })) };
    expect(frameAt(m, -10)).toMatchObject({ selectedMa: 0, frameMa: 0, deltaMa: 0 });
    expect(frameAt(m, 251.902)).toMatchObject({ selectedMa: 250, frameMa: 250, deltaMa: 0 });
  });
});

import { describe, expect, it } from 'vitest';
import type { Feature } from 'geojson';
import { datedLayerDef } from '../../src/content/schema/topic';
import { catalogueAnchorValid, catalogueFile } from '../../src/engines/time-scene/catalogueSchema';
import { catalogueItems, cataloguePage, magnitudeRadius, nearestCatalogue, type CatalogueLayer } from '../../src/engines/time-scene/lib/catalogue';
import { datedLayerIssues, timeCatalogueIndexIssues, timeChapterState, timeSceneGeoData, timeSceneTopicIssues } from '../../src/engines/time-scene/schema';

const text = { en: 'Reference record', zh: '参考记录' };
const def = datedLayerDef.parse({ id: 'science-reference', file: 'science-reference', kind: 'point', color: 'token:cold', label: text, temporal: { mode: 'reference', note: text, release: '2026 snapshot' }, catalogue: { file: 'science-catalogue' } });
const point = (id = 'science-a', properties: Record<string, unknown> = {}): Feature => ({ type: 'Feature', properties: { id, ...properties }, geometry: { type: 'Point', coordinates: [103.8, 1.3] } });
const entry = (id = 'science-a') => ({ id, title: text, summary: text, at: [103.8, 1.3], sources: ['S1'], rows: [{ key: 'missing', label: text, value: null }] });
const topo = (properties: Record<string, unknown>[] = [{ id: 'science-a' }]) => ({ type: 'Topology', arcs: [], objects: { 'science-reference': { type: 'GeometryCollection', geometries: properties.map((p) => ({ type: 'Point', coordinates: [103.8, 1.3], properties: p })) } } });
const data = timeSceneGeoData.parse({ entities: [], movements: [], events: [], control: { keyframes: [{ t: '1815-04-10', features: { type: 'FeatureCollection', features: [] } }] }, sources: { sources: [{ id: 'S1', text }] } });
const issues = (entries: unknown[] = [entry()], raw = topo()) => timeSceneTopicIssues({ datedLayers: [def] }, data, (file) => file === def.file ? raw : { entries });

describe('catalogue validation contract', () => {
  it('accepts a one-to-one join and preserves null', () => {
    expect(issues()).toEqual([]);
    expect(catalogueFile.parse({ entries: [entry()] }).entries[0]!.rows[0]!.value).toBeNull();
  });
  it('rejects reference dates, typo modes, empty release and untranslated notes', () => {
    for (const property of [{ id: 'science-a', f: 1815 }, { id: 'science-a', u: 2000 }]) expect(datedLayerIssues(topo([property]), def).length).toBeGreaterThan(0);
    for (const temporal of [{ mode: 'future' }, { ...def.temporal, release: '' }, { ...def.temporal, relase: 'typo' }, { ...def.temporal, note: { en: 'Reference' } }]) expect(datedLayerDef.safeParse({ ...def, temporal }).success).toBe(false);
    expect(datedLayerDef.safeParse({ ...def, recent: true }).success).toBe(false);
  });
  it('requires nonempty EN/ZH catalogue fields, including units and textual values', () => {
    const bad = { en: 'Untranslated' };
    for (const e of [{ ...entry(), title: bad }, { ...entry(), title: { en: '  ', zh: '参考' } }, { ...entry(), summary: { en: 'Reference', zh: '  ' } }, { ...entry(), summary: bad }, { ...entry(), rows: [{ key: 'row', label: bad, value: null }] }, { ...entry(), rows: [{ key: 'row', label: text, value: bad }] }, { ...entry(), rows: [{ key: 'row', label: text, value: 1, unit: bad }] }]) expect(catalogueFile.safeParse({ entries: [e] }).success).toBe(false);
  });
  it('rejects duplicate keys, nonfinite numeric values, missing and unknown sources', () => {
    for (const e of [{ ...entry(), rows: [{ key: 'x', label: text, value: NaN }] }, { ...entry(), rows: [entry().rows[0], entry().rows[0]] }, { ...entry(), sources: [] }]) expect(catalogueFile.safeParse({ entries: [e] }).success).toBe(false);
    expect(issues([{ ...entry(), sources: ['S999'] }])).toContainEqual(expect.objectContaining({ file: 'public/geo/science-catalogue.json', message: expect.stringContaining('science-a: unknown source') }));
  });
  it('rejects orphans, repeated geometries, and global collisions without double-registering joins', () => {
    expect(issues([]).map((e) => e.message).join()).toContain('science-a: feature has no catalogue');
    expect(issues([entry('unknown')]).map((e) => e.message).join()).toContain('unknown: entry must join exactly one');
    expect(issues([entry()], topo([{ id: 'science-a' }, { id: 'science-a' }])).map((e) => e.message).join()).toContain('duplicate geometry id');
    const repeated = timeSceneTopicIssues({ datedLayers: [def, { ...def, id: 'another-layer' }] }, data, (file) => file === def.file ? topo() : { entries: [entry()] });
    expect(repeated.map((e) => e.message).join()).toContain('science-a: duplicate global id');
    expect(issues([entry(def.id)], topo([{ id: def.id }])).map((e) => e.message).join()).toContain('duplicate global id');
  });
  it('checks exact point coordinates, 250m line tolerance and polygon holes', () => {
    expect(catalogueAnchorValid([103.8, 1.3], point())).toBe(true);
    expect(catalogueAnchorValid([103.8001, 1.3], point())).toBe(false);
    const line: Feature = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 0]] } };
    expect(catalogueAnchorValid([0.5, 0.002], line)).toBe(true);
    expect(catalogueAnchorValid([0.5, 0.003], line)).toBe(false);
    const polygon: Feature = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]], [[0.5, 0.5], [1.5, 0.5], [1.5, 1.5], [0.5, 1.5], [0.5, 0.5]]] } };
    expect(catalogueAnchorValid([0.2, 0.2], polygon)).toBe(true);
    expect(catalogueAnchorValid([1, 1], polygon)).toBe(false);
    expect(issues([{ ...entry(), at: [100, 0] }]).map((e) => e.message).join()).toContain('at is not on its geometry');
  });
  it('checks chapter and beat catalogue indices against known layers and entries', () => {
    const state = timeChapterState.parse({ catalogueIndex: [{ layerId: def.id, ids: ['unknown-id'] }], beats: [{ caption: text, catalogueIndex: [{ layerId: 'missing-layer' }] }] });
    const errors = timeCatalogueIndexIssues(state, [def], () => ({ entries: [entry()] }));
    expect(errors.join()).toContain('unknown-id'); expect(errors.join()).toContain('missing-layer');
  });
  it('rejects null magnitude and non-point radius encoding; reproduces all radii', () => {
    expect([6, 7.75, 9.5, 10].map(magnitudeRadius)).toEqual([2, 5, 8, 8]);
    const encoded = { ...def, encoding: { radius: { property: 'mag' as const, min: 6 as const, max: 9.5 as const, px: [2, 8] as [2, 8] } } };
    expect(datedLayerIssues(topo([{ id: 'science-a', mag: null }]), encoded).join()).toContain('finite mag');
    expect(datedLayerDef.safeParse({ ...encoded, kind: 'line' }).success).toBe(false);
  });
});

describe('catalogue search and hit contract', () => {
  const entries = catalogueFile.parse({ entries: Array.from({ length: 51 }, (_, i) => ({ ...entry(`record-${String(i).padStart(2, '0')}`), title: { en: `Record ${i}`, zh: `记录${i}` } })) }).entries;
  it('paginates 50/1, searches both languages and resolves equal-distance hits by id', () => {
    expect(cataloguePage(entries, '', 0).rows).toHaveLength(50);
    expect(cataloguePage(entries, '', 1).rows.map((e) => e.id)).toEqual(['record-50']);
    expect(cataloguePage(entries, '记录50', 0).rows.map((e) => e.id)).toEqual(['record-50']);
    expect(cataloguePage(entries, 'RECORD-50', 0).rows).toHaveLength(1);
    expect(nearestCatalogue([{ id: 'ph-q-b', distance: 10 }, { id: 'ph-q-a', distance: 10 }])).toBe('ph-q-a');
    expect(nearestCatalogue([{ id: 'ph-q-b', distance: 22.01 }])).toBeNull();
  });
  it('offers only enabled, loaded, currently visible records and intersects explicit ids', () => {
    const layer: CatalogueLayer = { id: def.id, def: { ...def, temporal: { mode: 'dated' } }, status: 'ready', entries: catalogueFile.parse({ entries: [entry('a'), entry('b'), entry('c')] }).entries, features: { type: 'FeatureCollection', features: [point('a', { f: 2000 }), point('b', { f: 2000 }), point('c', { f: 2001 })] } };
    const groups = [{ layerId: def.id }];
    expect(catalogueItems([layer], [def.id], 2000, groups).map((e) => e.id)).toEqual(['a', 'b']);
    expect(catalogueItems([layer], [def.id], 2001, groups)).toHaveLength(3);
    expect(catalogueItems([layer], [], 2001, groups)).toEqual([]);
    expect(catalogueItems([{ ...layer, status: 'loading' }], [def.id], 2001, groups)).toEqual([]);
    expect(catalogueItems([layer], [def.id], 2001, [{ layerId: def.id, ids: ['b'] }]).map((e) => e.id)).toEqual(['b']);
  });
  it('searches 10k rows with p95 below100ms', () => {
    const many = Array.from({ length: 10000 }, (_, i) => ({ ...entries[0]!, id: `search-${i}` }));
    const times = Array.from({ length: 20 }, () => { const start = performance.now(); cataloguePage(many, 'search-999', 0); return performance.now() - start; }).sort((a, b) => a - b);
    expect(times[18]).toBeLessThan(100);
  });
});

/**
 * Frozen PH-D01–07 → local TimeScene geometry/catalogues. No network or input writes.
 * Run: pnpm tsx scripts/geo/plates-and-hazards/build-data.ts
 * Optional ATLAS_PH_RESEARCH_DIR points at another copy of the frozen data/ directory.
 * Every published file is reproducible; audits live below topic/provenance/ so the
 * strict runtime data/*.json loader never receives build-only audit records.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { Feature, Geometry, Position } from 'geojson';
import { feature as topoFeature } from 'topojson-client';
import { catalogueAnchorValid, catalogueFile, type CatalogueEntry } from '../../../src/engines/time-scene/catalogueSchema';
import { toNumber } from '../../../src/engines/time-scene/lib/time';
import { isIsoDate } from '../../../src/lib/time';
import { sourcesFile } from '../../../src/content/schema/sources';
import { mergeSourcesMd, sourcesBlock } from '../../sources-md';

const ROOT = resolve(import.meta.dirname, '../../..');
const INPUT = process.env.ATLAS_PH_RESEARCH_DIR ?? '/Users/gavin/work/atlas/art/research/plates-and-hazards/data';
const AUDIT = resolve(ROOT, 'src/content/topics/plates-and-hazards/provenance');
const SNAPSHOT = '2026-10-26';
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const bi = (en: string, zh = en) => ({ en, zh });
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Source files have heterogeneous factual columns; the shipping whitelist is explicit below.
type Raw = Record<string, any>;
const read = (name: string): Raw => JSON.parse(readFileSync(resolve(INPUT, name), 'utf8'));
const inventory = read('inventory.json');
const inputRecords: Raw[] = [];
const manifest = readFileSync(resolve(INPUT, 'INVENTORY.md'), 'utf8');
for (const match of manifest.matchAll(/\| `([^`]+)` \| [\d,]+ \| `([a-f0-9]{64})`/g)) {
  const name = match[1]!, expected = match[2]!;
  const bytes = readFileSync(resolve(INPUT, name));
  assert.equal(hash(bytes), expected, `frozen input hash mismatch: ${name}`);
  const metadata = inventory.files[name] ?? {};
  inputRecords.push({ file: name, bytes: bytes.length, sha256: expected, url: metadata.url ?? null, downloaded: SNAPSHOT });
}
assert.equal(inputRecords.length, 26, 'every INVENTORY-listed dataset/support hash must be checked');

type Layer = { id: string; features: Feature[]; entries: CatalogueEntry[]; inputs: string[]; licence: string; modifications: string };
const layers: Layer[] = [];
const pd = 'Public domain source facts; CC BY-NC-SA 4.0 original Atlas catalogue text';
const odc = 'ODC-BY 1.0 source database; CC BY-NC-SA 4.0 original Atlas catalogue text';
const row = (key: string, en: string, zh: string, value: CatalogueEntry['rows'][number]['value']) => ({ key, label: bi(en, zh), value });
const entry = (id: string, title: CatalogueEntry['title'], summary: CatalogueEntry['summary'], at: number[], sources: string[], rows: CatalogueEntry['rows']): CatalogueEntry => ({ id, title, summary, at: at as [number, number], sources, rows });
const point = (id: string, at: Position, properties: Raw = {}): Feature => ({ type: 'Feature', geometry: { type: 'Point', coordinates: at }, properties: { id, ...properties } });

/** A conservative spherical distance to a point on the straight lon/lat segment
 * MapLibre draws; its local projection picks a candidate, then haversine measures
 * the candidate distance in metres. This upper-bounds the true nearest distance. */
function segmentDistance(p: Position, a: Position, b: Position): number {
  const rad = Math.PI / 180, scale = Math.cos(p[1]! * rad);
  const ax = (a[0]! - p[0]!) * scale, ay = a[1]! - p[1]!;
  const dx = (b[0]! - a[0]!) * scale, dy = b[1]! - a[1]!;
  const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)));
  const x = a[0]! + t * (b[0]! - a[0]!), y = a[1]! + t * (b[1]! - a[1]!);
  const dlat = (y - p[1]!) * rad, dlon = (x - p[0]!) * rad;
  return 6371008.8 * 2 * Math.asin(Math.min(1, Math.sqrt(Math.sin(dlat / 2) ** 2 + Math.cos(p[1]! * rad) * Math.cos(y * rad) * Math.sin(dlon / 2) ** 2)));
}
function simplifyDP(points: Position[], toleranceM: number): Position[] {
  if (points.length <= 2) return points;
  const first = points[0]!, last = points[points.length - 1]!;
  let farthest = toleranceM, index = -1;
  for (let i = 1; i < points.length - 1; i++) {
    const distance = segmentDistance(points[i]!, first, last);
    if (distance > farthest) { farthest = distance; index = i; }
  }
  return index < 0 ? [first, last] : [...simplifyDP(points.slice(0, index + 1), toleranceM).slice(0, -1), ...simplifyDP(points.slice(index), toleranceM)];
}
function percentile(values: number[]) {
  values.sort((a, b) => a - b);
  return { count: values.length, p50M: values[Math.floor(values.length * .5)] ?? 0, p95M: values[Math.floor(values.length * .95)] ?? 0, maxM: values.at(-1) ?? 0 };
}
function noLongChords(geometry: Geometry): void {
  if (geometry.type === 'Point' || geometry.type === 'MultiPoint' || geometry.type === 'GeometryCollection') return;
  const lines = geometry.type === 'LineString' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates.flat() : geometry.coordinates;
  for (const line of lines) for (let i = 1; i < line.length; i++) assert.ok(Math.abs(line[i]![0]! - line[i - 1]![0]!) <= 180, 'antimeridian long chord');
}
const pb = read('pb-steps.geojson').features as Feature[];
const classMap: Record<string, string> = { OSR: 'divergent', CRB: 'divergent', OTF: 'transform', CTF: 'transform', SUB: 'subduction', OCB: 'convergent', CCB: 'convergent' };
const classNames: Record<string, [string, string]> = { divergent: ['Divergent boundary', '张裂型边界'], transform: ['Transform boundary', '转换型边界'], subduction: ['Subduction boundary', '俯冲边界'], convergent: ['Other convergent boundary', '其他汇聚边界'] };
const seenSeq = new Map<number, number>(), classCounts: Record<string, number> = {};
const originalLines = new Map<string, Position[]>();
for (const suffix of ['divergent', 'transform', 'subduction', 'convergent']) layers.push({ id: `ph-plate-${suffix}`, features: [], entries: [], inputs: ['pb-steps.geojson'], licence: odc, modifications: 'Exact STEPCLASS subsets; stable SEQNUM-part ids; DP 900 m; TopoJSON quantization 1000000; no coastal clipping.' });
for (const f of pb) {
  assert.equal(f.geometry.type, 'LineString');
  const p = f.properties!, code = p.STEPCLASS as string, suffix = classMap[code];
  assert.ok(suffix, `unknown STEPCLASS: ${code}`);
  const seq = Number(p.SEQNUM); assert.ok(Number.isInteger(seq));
  const part = (seenSeq.get(seq) ?? 0) + 1; seenSeq.set(seq, part);
  const id = `ph-step-${seq}-${part}`, coords = (f.geometry as GeoJSON.LineString).coordinates;
  noLongChords(f.geometry); originalLines.set(id, coords);
  const layer = layers.find((candidate) => candidate.id === `ph-plate-${suffix}`)!;
  layer.features.push({ type: 'Feature', properties: { id }, geometry: { type: 'LineString', coordinates: simplifyDP(coords, 900) } });
  assert.ok(classNames[suffix]);
  layer.entries.push(entry(id, bi(`${p.PLATEBOUND}/${code}`), bi('PB2002 step.', 'PB2002线段。'), coords[0]!, ['S37'], [row('sequence', 'SEQNUM', '原序号', seq)]));
  classCounts[code] = (classCounts[code] ?? 0) + 1;
}
assert.equal(pb.length, 5824); assert.equal(seenSeq.size, 5819);
assert.deepEqual([...seenSeq].filter(([, parts]) => parts > 1).map(([seq]) => seq).sort((a, b) => a - b), [1152, 1465, 2795, 4924, 4946]);
assert.deepEqual(classCounts, { OTF: 1147, OSR: 1875, OCB: 341, CTF: 457, CRB: 474, CCB: 401, SUB: 1129 });
assert.deepEqual(layers.map((layer) => layer.features.length), [2349, 1604, 1129, 742]);
assert.equal(read('pb-boundaries.geojson').features.length, 241);
const plates = read('pb-plates.geojson').features; assert.equal(plates.length, 54); assert.equal(new Set(plates.map((f: Raw) => f.properties.Code)).size, 52);

/** Search only candidate points proved inside actual source polygons. No bbox
 * centre is accepted as a geographic anchor without polygon containment. */
function interior(feature: Feature): [number, number] {
  assert.ok(feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon');
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  for (const rings of polygons) {
    const exterior = rings[0]!;
    const xs = exterior.map((p) => p[0]!), ys = exterior.map((p) => p[1]!);
    const minX = Math.min(...xs), minY = Math.min(...ys), width = Math.max(...xs) - minX, height = Math.max(...ys) - minY;
    for (let grid = 2; grid <= 64; grid *= 2) for (let y = 1; y < grid; y++) for (let x = 1; x < grid; x++) {
      const at: [number, number] = [minX + width * x / grid, minY + height * y / grid];
      if (catalogueAnchorValid(at, feature)) return at;
    }
  }
  throw new Error('no verified interior anchor');
}
const orogens = read('pb-orogens.geojson').features as Feature[];
assert.equal(orogens.length, 13);
const orogenLayer: Layer = { id: 'ph-orogens', features: [], entries: [], inputs: ['pb-orogens.geojson'], licence: odc, modifications: 'Original polygons, no simplification or clipping; verified interior anchor; names kept.' };
for (const f of orogens) {
  const name = String(f.properties!.Name), id = `ph-orogen-${slug(name)}`;
  noLongChords(f.geometry);
  orogenLayer.features.push({ ...f, properties: { id } });
  orogenLayer.entries.push(entry(id, bi(name), bi('Model broad boundary zone; not a danger zone.', '模型中的宽边界区，不是危险区。'), interior(f), ['S37'], [row('version', 'Reference model', '参考模型', bi('PB2002 / Bird 2003'))]));
}
layers.push(orogenLayer);

const volcanoes = read('gvp-holocene-volcanoes.geojson');
assert.equal(volcanoes.numberMatched, 1214); assert.equal(volcanoes.numberReturned, 1214); assert.equal(volcanoes.features.length, 1214);
const episodes = read('gvp-holocene-eruptions.geojson'); assert.equal(episodes.features.length, 11089);
const selectedEpisodes = episodes.features.filter((f: Raw) => [16231, 15589, 22275].includes(f.properties.Eruption_Number)); assert.equal(selectedEpisodes.length, 3);
const commonNames: Record<number, string> = { 264040: '坦博拉', 262000: '喀拉喀托', 332010: '基拉韦厄' };
const settingTranslation = (setting: string | null): string => setting === null ? '未记录' : setting
  .replace('Subduction zone', '俯冲带').replace('Rift zone', '裂谷带').replace('Intraplate', '板内')
  .replace('Continental crust (> 25 km)', '大陆地壳（>25 km）').replace('Oceanic crust (< 15 km)', '大洋地壳（<15 km）')
  .replace('Intermediate crust (15-25 km)', '中等厚度地壳（15–25 km）').replace('Crustal thickness unknown', '地壳厚度未知');
const evidenceTranslation: Record<string, string> = { 'Eruption Dated': '喷发有年代记录', 'Evidence Credible': '证据可信', 'Evidence Uncertain': '证据不确定' };
const episodeLabels: Record<string, string> = {
  Eruption_Number: '喷发记录编号', Activity_Type: '活动分类', ExplosivityIndexMax: '最大爆发指数', ExplosivityIndexModifier: '爆发指数修饰标记',
  StartDateYearModifier: '起年修饰标记', StartDateYear: '起年', StartDateYearUncertainty: '起年不确定量', StartDateDayModifier: '起日修饰标记',
  StartDateMonth: '起月', StartDateDay: '起日', StartDateDayUncertainty: '起日不确定量', EndDateYearModifier: '止年修饰标记',
  EndDateYear: '止年', EndDateYearUncertainty: '止年不确定量', EndDateDayModifier: '止日修饰标记', EndDateMonth: '止月', EndDateDay: '止日', EndDateDayUncertainty: '止日不确定量',
};
const volcanoLayer: Layer = { id: 'ph-volcano-catalogue', features: [], entries: [], inputs: ['gvp-holocene-volcanoes.geojson', 'gvp-holocene-eruptions.geojson'], licence: pd, modifications: '1214 original points; whitelist factual setting/evidence/number and 3 selected episode records; photos/captions/credits/Geological_Summary excluded.' };
for (const f of volcanoes.features) {
  const p = f.properties, number = Number(p.Volcano_Number), id = `gvp-${number}`, at = f.geometry.coordinates;
  volcanoLayer.features.push(point(id, at));
  const rows = [row('setting', 'Tectonic setting', '构造环境', p.Tectonic_Setting === null ? null : bi(p.Tectonic_Setting, settingTranslation(p.Tectonic_Setting))), row('evidence', 'Evidence category', '证据分类', p.Evidence_Category === null ? null : bi(p.Evidence_Category, evidenceTranslation[p.Evidence_Category] ?? `目录原分类：${p.Evidence_Category}`))];
  for (const episode of selectedEpisodes.filter((e: Raw) => e.properties.Volcano_Number === number)) {
    const ep = episode.properties;
    for (const [key, val] of Object.entries(ep)) {
      if (['Volcano_Number', 'Volcano_Name', 'ActivityArea', 'ActivityUnit', 'StartEvidenceMethod'].includes(key)) continue;
      assert.ok(episodeLabels[key], `episode column needs a Chinese label: ${key}`);
      rows.push(row(`episode-${ep.Eruption_Number}-${slug(key)}`, `${ep.Eruption_Number} ${key}`, `${ep.Eruption_Number} ${episodeLabels[key]}`, typeof val === 'number' || val === null ? val : bi(String(val), key === 'Activity_Type' && val === 'Confirmed Eruption' ? '已确认喷发' : `原记录：${val}`)));
    }
  }
  volcanoLayer.entries.push(entry(id, bi(p.Volcano_Name, commonNames[number] ? `${commonNames[number]} / ${p.Volcano_Name}` : p.Volcano_Name), bi('Holocene GVP v5.4.0; not live.', 'GVP v5.4.0全新世目录，非实时。'), at, ['S604'], rows));
}
layers.push(volcanoLayer);

const quakes = read('usgs-2000-2024-m6.geojson');
assert.equal(quakes.features.length, 3729);
const start = Date.parse('2000-01-01T00:00:00Z'), end = Date.parse('2025-01-01T00:00:00Z');
const quakeLayer: Layer = { id: 'ph-quake-sample', features: [], entries: [], inputs: ['usgs-2000-2024-m6.geojson', 'usgs-2004-parent-snapshot.geojson', 'usgs-2022-sumatra.geojson'], licence: pd, modifications: 'Frozen reviewed M>=6 sample [2000-01-01,2025-01-01) UTC; exact coordinates, magnitude and magType retained; f from UTC day using shared toNumber; original epoch/updated/status retained in catalogue.' };
for (const f of quakes.features) {
  const p = f.properties, rawId = f.id, id = `ph-q-${slug(rawId)}`;
  assert.ok(p.time >= start && p.time < end); assert.ok(Number.isFinite(p.mag) && p.mag >= 6); assert.equal(p.status, 'reviewed');
  const day = new Date(p.time).toISOString().slice(0, 10), at = f.geometry.coordinates.slice(0, 2);
  assert.ok(isIsoDate(day)); const fTime = toNumber(day); assert.ok(Number.isFinite(fTime));
  quakeLayer.features.push(point(id, at, { f: fTime, mag: p.mag }));
  const sources = rawId === 'us6000gzyg' ? ['S604', 'S602'] : rawId === 'official20041226005853450_30' ? ['S604', 'S54'] : ['S604'];
  quakeLayer.entries.push(entry(id, bi(rawId), bi(`${day}; reviewed M${p.mag} (${p.magType}).`, `${day}；已审核M${p.mag}（${p.magType}）。`), at, sources, [
    row('depth', 'Depth km', '深度km', f.geometry.coordinates[2]), row('epoch', 'UTC epoch ms', 'UTC毫秒戳', p.time),
    row('updated', 'Updated ms', '更新毫秒戳', p.updated),
  ]));
}
assert.ok(quakeLayer.entries.some((item) => item.id === 'ph-q-us6000gzyg'));
assert.ok(quakeLayer.entries.some((item) => item.id === 'ph-q-official20041226005853450-30'));
layers.push(quakeLayer);

const crosswalk: Array<{ eventId: string; day: string; nceiId: number; gvpNumber?: number; episode?: number; usgsId?: string; nceiAt?: [number, number]; sourceEventValidity?: number }> = [
  { eventId: 'event-tambora-1815', day: '1815-04-10', nceiId: 613, gvpNumber: 264040, episode: 16231 },
  { eventId: 'event-krakatau-1883', day: '1883-08-27', nceiId: 1142, gvpNumber: 262000, episode: 15589 },
  { eventId: 'event-sumatra-2004', day: '2004-12-26', nceiId: 2439, usgsId: 'official20041226005853450_30' },
  { eventId: 'event-anak-2018', day: '2018-12-22', nceiId: 5699, gvpNumber: 262000, episode: 22275 },
];
for (const association of crosswalk) {
  const table = read(`ncei-tsunami-events-${association.day.slice(0, 4)}.json`);
  assert.equal(table.items.length, table.totalItems);
  const item = table.items.find((item: Raw) => item.id === association.nceiId); assert.ok(item);
  assert.equal(`${item.year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`, association.day);
  association.nceiAt = [item.longitude, item.latitude];
  association.sourceEventValidity = item.eventValidity;
}
const observationReports: Raw[] = [];
for (const [year, nceiId, rawCount, mappedCount, pageCount] of [[1883, 1142, 102, 99, 2], [2004, 2439, 2177, 2155, 22], [2018, 5699, 410, 410, 5]]) {
  const name = `ncei-runups-${nceiId}.json`, raw = read(name), day = crosswalk.find((event) => event.nceiId === nceiId)!.day;
  assert.equal(raw.eventId, nceiId); assert.equal(raw.totalItems, rawCount); assert.equal(raw.items.length, rawCount); assert.equal(raw.retrievalPages.length, pageCount);
  assert.equal(new Set(raw.items.map((item: Raw) => item.id)).size, rawCount);
  raw.retrievalPages.forEach((page: Raw, i: number) => { const url = new URL(page.url); assert.equal(url.searchParams.get('page'), String(i + 1)); assert.equal(url.searchParams.get('tsunamiEventId'), String(nceiId)); assert.match(page.sha256, /^[a-f0-9]{64}$/); assert.ok(page.bytes > 0); });
  const layer: Layer = { id: `ph-observations-${year}`, features: [], entries: [], inputs: [name, `ncei-tsunami-events-${year}.json`], licence: pd, modifications: 'Only original valid positions; f uses crosswalk source-event day, not arrival. Whitelist raw measurement type/doubtful/id/event/location/version; no height or arrival values. Missing-coordinate rows logged in audit, not geocoded.' };
  const excluded: Raw[] = [];
  for (const p of raw.items) {
    assert.equal(p.tsunamiEventId, nceiId);
    if (!Number.isFinite(p.longitude) || !Number.isFinite(p.latitude) || Math.abs(p.longitude) > 180 || Math.abs(p.latitude) > 90) { excluded.push({ id: p.id, reason: 'missing or invalid source coordinates' }); continue; }
    const id = `ph-r-${nceiId}-${p.id}`, at = [p.longitude, p.latitude];
    layer.features.push(point(id, at, { f: toNumber(day) }));
    const location = p.locationName ?? p.country ?? `NCEI ${p.id}`;
    layer.entries.push(entry(id, bi(location), bi(`Event ${nceiId}; ${SNAPSHOT} snapshot.`, `源事件${nceiId}；${SNAPSHOT}快照。`), at, ['S605', 'S606'], [
      row('measurement-type', 'Type code', '类型码', p.typeMeasurementId ?? null),
      row('doubtful', 'Doubtful', '原疑问标记', p.doubtful === undefined ? null : bi(p.doubtful, p.doubtful === 'y' ? 'y：源记录标疑' : p.doubtful === 'n' ? 'n：源记录未标疑' : `原码：${p.doubtful}`)),
    ]));
  }
  assert.equal(layer.features.length, mappedCount);
  observationReports.push({ eventId: nceiId, raw: rawCount, mappable: mappedCount, excluded, retrievalPages: raw.retrievalPages, note: 'Individual response hashes preserved from frozen wrapper; original page bytes are not separately present for rehashing.' });
  layers.push(layer);
}
assert.equal(observationReports.reduce((sum, item) => sum + item.excluded.length, 0), 25);

/** Calendar-day assertions use the existing engine scale, including BCE/CE and
 * leap years; no epoch/year division or hand-built fractional dates. */
assert.ok(toNumber('-0001-12-31') < toNumber('0001-01-01'));
assert.equal(toNumber('2000-01-01'), 2000);
assert.equal(toNumber('2000-03-01'), 2000 + 60 / 366);
const quakeDates = ['1999-12-31', '2000-01-01', '2004-12-25', '2004-12-26', '2024-12-31'];
const synthetic = ['2000-01-01', '2004-12-26', '2024-12-31'].map(toNumber);
assert.deepEqual(quakeDates.map((day) => synthetic.filter((f) => f <= toNumber(day)).length), [0, 1, 1, 2, 3]);
assert.deepEqual(['2004-12-25', '2004-12-26', '2004-12-27'].map((day) => [toNumber('2004-12-26'), toNumber('2004-12-26')].filter((f) => f <= toNumber(day)).length), [0, 2, 2]);

/** Plain TopoJSON, one named object. Points intentionally have no transform, so
 * their source positions round-trip exactly. PB arcs alone use a 1e6 global grid. */
function topology(layer: Layer): Raw {
  const quantized = layer.id.startsWith('ph-plate-'), q = 1_000_000;
  const arcs: number[][][] = [];
  const addArc = (points: Position[]) => {
    const index = arcs.length;
    if (quantized) {
      let prevX = 0, prevY = 0;
      arcs.push(points.map(([x, y]) => { const nx = Math.round((x! + 180) / 360 * q), ny = Math.round((y! + 90) / 180 * q); const p = [nx - prevX, ny - prevY]; prevX = nx; prevY = ny; return p; }));
    } else arcs.push(points.map((p) => [...p]));
    return index;
  };
  const geometries = layer.features.map(({ geometry: g, properties }) => {
    if (g.type === 'Point') return { type: g.type, coordinates: g.coordinates, properties };
    if (g.type === 'LineString') return { type: g.type, arcs: [addArc(g.coordinates)], properties };
    if (g.type === 'Polygon') return { type: g.type, arcs: g.coordinates.map((ring) => [addArc(ring)]), properties };
    if (g.type === 'MultiPolygon') return { type: g.type, arcs: g.coordinates.map((polygon) => polygon.map((ring) => [addArc(ring)])), properties };
    throw new Error(`unsupported geometry ${g.type}`);
  });
  return { type: 'Topology', ...(quantized ? { transform: { scale: [360 / q, 180 / q], translate: [-180, -90] } } : {}), objects: { [layer.id]: { type: 'GeometryCollection', geometries } }, arcs };
}
const outputRecords: Raw[] = [], allIds = new Set<string>(), globalResiduals: number[] = [], seaResiduals: number[] = [];
let geometryBytes = 0, catalogueBytes = 0, pbBytes = 0;
const write = (path: string, value: unknown): { bytes: number; sha256: string } => { const text = JSON.stringify(value); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text + '\n'); return { bytes: Buffer.byteLength(text) + 1, sha256: hash(text + '\n') }; };
for (const layer of layers) {
  layer.entries.sort((a, b) => a.id.localeCompare(b.id));
  catalogueFile.parse({ entries: layer.entries });
  const topo = topology(layer);
  const decoded = topoFeature(topo as never, topo.objects[layer.id]) as unknown as { features: Feature[] };
  assert.equal(decoded.features.length, layer.features.length);
  const byId = new Map(decoded.features.map((f) => [String(f.properties!.id), f]));
  assert.equal(byId.size, layer.features.length);
  for (const item of layer.entries) {
    assert.ok(!allIds.has(item.id), `id collision: ${item.id}`); allIds.add(item.id);
    const f = byId.get(item.id)!; assert.ok(f, `missing joined feature ${item.id}`); assert.ok(catalogueAnchorValid(item.at, f), `invalid geographic anchor ${item.id}`); noLongChords(f.geometry);
    if (f.geometry.type === 'Point') assert.deepEqual(item.at, f.geometry.coordinates);
    const original = originalLines.get(item.id);
    if (original && f.geometry.type === 'LineString') {
      for (const p of original) {
        let d = Infinity;
        for (let i = 1; i < f.geometry.coordinates.length; i++) d = Math.min(d, segmentDistance(p, f.geometry.coordinates[i - 1]!, f.geometry.coordinates[i]!));
        globalResiduals.push(d);
        if (p[0]! >= 95 && p[0]! <= 125 && p[1]! >= -9 && p[1]! <= 22) seaResiduals.push(d);
      }
    }
  }
  assert.equal(layer.entries.length, layer.features.length);
  const geoPath = `public/geo/${layer.id}.json`, cataloguePath = `public/geo/ph-catalogue-${layer.id.slice(3)}.json`;
  const geometry = write(resolve(ROOT, geoPath), topo), catalogue = write(resolve(ROOT, cataloguePath), { entries: layer.entries });
  assert.ok(catalogue.bytes <= 2_000_000, `${cataloguePath} per-file catalogue budget`);
  geometryBytes += geometry.bytes; catalogueBytes += catalogue.bytes;
  if (layer.id.startsWith('ph-plate-')) pbBytes += geometry.bytes;
  outputRecords.push({ file: geoPath, ...geometry, count: layer.features.length, inputs: layer.inputs, licence: layer.licence.startsWith('ODC') ? 'ODC-BY 1.0' : 'Public domain factual geometry', modifications: layer.modifications });
  outputRecords.push({ file: cataloguePath, ...catalogue, count: layer.entries.length, inputs: layer.inputs, licence: layer.licence, modifications: layer.modifications });
}
const residuals = { method: 'Each original vertex to nearest candidate on decoded straight lon/lat segment, measured by haversine (R=6371008.8m); conservative upper bound. Includes quantization error.', seaBounds: [95, -9, 125, 22], global: percentile(globalResiduals), southeastAsia: percentile(seaResiduals) };
assert.ok(residuals.global.maxM <= 10000); assert.ok(residuals.southeastAsia.maxM <= 2000);
assert.ok(pbBytes <= 600000, 'four PB layer budget'); assert.ok(geometryBytes <= 2_000_000, 'geometry total budget'); assert.ok(catalogueBytes <= 5_000_000, `catalogue total budget ${catalogueBytes}`);
const crosswalkFile = 'src/content/topics/plates-and-hazards/provenance/ph-crosswalk.json';
const crosswalkStats = write(resolve(ROOT, crosswalkFile), { associations: crosswalk, method: 'Explicit fact-checked event IDs; never joined by nearest point or USGS tsunami flag.', sources: ['S54', 'S602', 'S603', 'S604'] });
assert.ok(crosswalkStats.bytes < 5000);
outputRecords.push({ file: crosswalkFile, ...crosswalkStats, licence: 'Public domain facts; CC BY-NC-SA 4.0 original Atlas selection', inputs: ['ncei-tsunami-events-1815.json', 'ncei-tsunami-events-1883.json', 'ncei-tsunami-events-2004.json', 'ncei-tsunami-events-2018.json', 'usgs-2004-parent-snapshot.geojson', 'usgs-2022-sumatra.geojson'] });
const report = { snapshot: SNAPSHOT, inputHashChecks: { checked: inputRecords.length, mismatches: 0 }, pb: { parts: 5824, sequenceNumbers: 5819, plateFeatures: 54, plateCodes: 52, boundaries: 241, orogens: 13, splitSequences: [1152, 1465, 2795, 4924, 4946], classCounts, residuals }, gvp: { volcanoes: 1214, eruptionRecords: 11089, selectedEpisodes: [16231, 15589, 22275] }, usgs: { rows: 3729, window: ['2000-01-01T00:00:00Z', '2025-01-01T00:00:00Z'], upperExclusive: true, allReviewed: true, exactPointCoordinates: true }, observations: observationReports, bytes: { geometry: geometryBytes, catalogues: catalogueBytes, fourPbLayers: pbBytes }, outputs: outputRecords };
write(resolve(AUDIT, 'conversion-report.json'), report);
write(resolve(AUDIT, 'provenance.json'), { inputs: inputRecords, outputs: outputRecords, modernReference: 'PB2002 / Bird2003; GVP v5.4.0; Natural Earth 50m/SEA10m; fixed reference at every K1–K7, never historical islands or annual drift.', inputBytes: inventory.dataset_bytes, prefetchedBytes: inventory.prefetched_bytes_including_support_and_diagnostic, auditHashes: 'This file and conversion-report intentionally omit self-referential hashes; all shipping geometry, catalogues and crosswalk are hashed.', attribution: ['Peter Bird (2003), DOI 10.1029/2001GC000252; Hugo Ahlenius/Nordpil and fraxen conversion contributors, ODC-BY 1.0.', 'Venzke/compiler, Smithsonian GVP v5.4.0, DOI 10.5479/si.GVP.VOTW5-2026.5.4; database compilation only, no photographs.', 'NOAA/NGDC/WDS Global Historical Tsunami Database, DOI 10.7289/V5PN93H7; compiled facts only, no third-party attachments.', 'USGS ComCat factual records; no third-party linked products.'] });
const sourceText = `# Map provenance · plates-and-hazards\n\nRebuild: \`pnpm tsx scripts/geo/plates-and-hazards/build-data.ts\`. Input override: \`ATLAS_PH_RESEARCH_DIR\` (frozen data directory). No network, no research input writes. Snapshot ${SNAPSHOT}; factual recheck/access date 2026-10-27 is separate.\n\nK1–K7 are seven empty control frames: no control polygons, registration, self-intersections or control-area residuals. Modern PB2002/Natural Earth/GVP references do not change with the calendar; no reconstruction of 1815/1883 island coasts. Native WGS84; no map registration. Existing land-50m/land-10m-sea files reused once, including existing unwrapped coast longitudes. PB oceanic boundaries are never land-clipped.\n\nAll 26 INVENTORY-listed input/support SHA-256 checks pass. Frozen dataset inputs ${inventory.dataset_bytes} bytes; including support/diagnostics ${inventory.prefetched_bytes_including_support_and_diagnostic} bytes. Published geometry ${geometryBytes} bytes; catalogues ${catalogueBytes} bytes; four PB subsets ${pbBytes} bytes. Details, exact input/output hashes, source URLs, modifications, licences and excluded coordinate IDs: [provenance](../provenance/provenance.json), [conversion report](../provenance/conversion-report.json), [explicit crosswalk](../provenance/ph-crosswalk.json). Audits stay outside runtime data/*.json.\n\nPB original 5819 sequence numbers produce 5824 geometry parts; split IDs 1152/1465/2795/4924/4946 retain both pieces. Four subsets 2349/1604/1129/742; 13 original orogens. DP tolerance 900m with 1e6 grid; original-vertex residuals including quantization: global p50 ${residuals.global.p50M.toFixed(3)}m, p95 ${residuals.global.p95M.toFixed(3)}m, max ${residuals.global.maxM.toFixed(3)}m; SEA [95,-9,125,22] p50 ${residuals.southeastAsia.p50M.toFixed(3)}m, p95 ${residuals.southeastAsia.p95M.toFixed(3)}m, max ${residuals.southeastAsia.maxM.toFixed(3)}m. Method: conservative haversine distance to straight lon/lat segment; every source vertex measured. Lines use source endpoint anchors within250m; polygon anchors are checked inside the original unsimplified polygon, never accepted by bbox alone. No antimeridian segment spans over180°.\n\nGVP 1214 exact positions, 11089 episode rows audited, three selected episodes with raw date uncertainty preserved. No geological summaries, photo links, captions or credits ship. USGS3729 reviewed catalogue M≥6 rows: strict UTC end-exclusive window; exact magnitude, magType, depth, UTC epoch/update and status remain visible in catalogue. Magnitude is catalogue scale, not uniform Mw, a rate or prediction.\n\nNCEI observations raw102/2177/410; mapped99/2155/410; 25 excluded rows logged without guessed coordinates. Type codes and source doubtful flags kept. No height/arrival numbers are emitted; source-event f makes the group appear together and is not arrival playback. Page URL/hash/bytes preserved from frozen wrapper; original page responses are not separately available for rehashing. Exact point coordinates round-trip through unquantized TopoJSON.\n\nLicence families: PB geometry ODC-BY1.0 (Bird2003; Hugo Ahlenius/Nordpil/fraxen contributors); PB catalogue source database ODC-BY1.0 with original Atlas text CC BY-NC-SA4.0. GVP/USGS/NCEI factual geometry public domain; original catalogue text/selection CC BY-NC-SA4.0. Natural Earth existing basemap public domain. No BY-SA/NC-SA source mixing, no GVP images, third-party ComCat products or NOAA poster reproduction. Exact per-file mapping is in provenance.\n`;
const numberedSources = sourcesFile.parse(JSON.parse(readFileSync(resolve(ROOT, 'src/content/topics/plates-and-hazards/data/sources.json'), 'utf8')));
writeFileSync(resolve(ROOT, 'src/content/topics/plates-and-hazards/data/SOURCES.md'), mergeSourcesMd(sourceText, sourcesBlock(numberedSources.sources), 'plates-and-hazards'));
writeFileSync(resolve(ROOT, 'scripts/geo/plates-and-hazards/SOURCES-GEO.md'), sourceText.replaceAll('(../provenance/', '(../../../src/content/topics/plates-and-hazards/provenance/'));
process.stdout.write(`${JSON.stringify({ layers: layers.length, inputsVerified: inputRecords.length, geometryBytes, catalogueBytes, pbBytes, residuals }, null, 2)}\n`);

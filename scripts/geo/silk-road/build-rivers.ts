/**
 * G2 (docs/73 §3.2): the river layer of the Silk Roads plate,
 * public/geo/silk-road-rivers.json (riversFile, docs/06 「区域底图」).
 *
 *   pnpm tsx scripts/geo/silk-road/build-rivers.ts
 *
 * Only Natural Earth 1:10m (public domain; raw/ne/, downloaded from
 * naciscdn.org, SHA-256 in SOURCES-GEO.md):
 * - `rivers_lake_centerlines` v5.0.0, picked by `name_en`, clipped to the
 *   plate, simplified (mapshaper DP 500 m). The Yellow River is kept only
 *   between Lanzhou (103.7° E) and Zhengzhou (113.546° E, the same cut as
 *   ancient-rivers.json): its lower course of today dates from 1855 and is
 *   wrong for the whole period of this topic, so it is not drawn.
 * - `lakes` v5.0.0: the outer rings of the Aral Sea (north and south parts
 *   of today's lake, not its 14th-century shore) and Lake Issyk-Kul, as lines.
 * Nothing is copied from ancient-rivers.json (it holds CC BY-SA courses).
 */
import { readFileSync } from 'node:fs';
import type { Feature, FeatureCollection, LineString, MultiLineString, Position } from 'geojson';
import { mapshaperApi, writeJson } from '../lib/common';

const DIR = 'scripts/geo/silk-road';
const BOX = [-12, -12, 135, 58];
const HUANG = [103.7, 113.546];

/** Natural Earth `name_en` values → river id and bilingual name. */
const RIVERS: { id: string; ne: string[]; en: string; zh: string }[] = [
  { id: 'amu-darya', ne: ['Amu Darya'], en: 'Amu Darya', zh: '阿姆河' },
  { id: 'syr-darya', ne: ['Syr Dar'], en: 'Syr Darya', zh: '锡尔河' },
  { id: 'zeravshan', ne: ['Zeravshan'], en: 'Zeravshan', zh: '泽拉夫尚河' },
  { id: 'tarim', ne: ['Tarim'], en: 'Tarim', zh: '塔里木河' },
  { id: 'ili', ne: ['Ili'], en: 'Ili', zh: '伊犁河' },
  { id: 'volga', ne: ['Volga'], en: 'Volga', zh: '伏尔加河' },
  { id: 'don', ne: ['Don'], en: 'Don', zh: '顿河' },
  { id: 'tigris', ne: ['Tigris'], en: 'Tigris', zh: '底格里斯河' },
  { id: 'euphrates', ne: ['Euphrates'], en: 'Euphrates', zh: '幼发拉底河' },
  { id: 'indus', ne: ['Indus'], en: 'Indus', zh: '印度河' },
  { id: 'ganges', ne: ['Ganges'], en: 'Ganges', zh: '恒河' },
  { id: 'nile', ne: ['Nile'], en: 'Nile', zh: '尼罗河' },
  { id: 'wei', ne: ['Wei'], en: 'Wei', zh: '渭河' },
  { id: 'yangtze', ne: ['Yangtze'], en: 'Yangtze', zh: '长江' },
  { id: 'huang', ne: ['Yellow', 'Huang'], en: 'Yellow River', zh: '黄河' },
];
const LAKES: { id: string; ne: RegExp; en: string; zh: string }[] = [
  { id: 'aral', ne: /Aral Sea$/, en: 'Aral Sea', zh: '咸海' },
  { id: 'issyk-kul', ne: /^Issyk-Kul$/, en: 'Issyk-Kul', zh: '伊塞克湖' },
];

const ms = mapshaperApi();
async function read(shp: string, extra = ''): Promise<FeatureCollection> {
  const out = await ms.applyCommands(`-i ${DIR}/raw/ne/${shp} -clip bbox=${BOX.join(',')} ${extra} -o out.json format=geojson precision=0.00001`, {});
  return JSON.parse(out['out.json']!.toString()) as FeatureCollection;
}

const lines = (g: LineString | MultiLineString): Position[][] => (g.type === 'LineString' ? [g.coordinates] : g.coordinates);
const centre = await read('ne_10m_rivers_lake_centerlines.shp', '-simplify dp interval=500 keep-shapes');
const out: Feature[] = [];
const counts: string[] = [];
for (const r of RIVERS) {
  let parts = centre.features.filter((f) => r.ne.includes(String(f.properties?.name_en))).flatMap((f) => lines(f.geometry as LineString | MultiLineString));
  if (r.id === 'huang') {
    // Keep the runs between the two cuts; a run leaving the band ends at its last vertex inside it.
    parts = parts.flatMap((p) => {
      const runs: Position[][] = [];
      let run: Position[] = [];
      for (const pt of p) {
        if (pt[0]! >= HUANG[0]! && pt[0]! <= HUANG[1]!) run.push(pt);
        else if (run.length) (runs.push(run), (run = []));
      }
      if (run.length) runs.push(run);
      return runs.filter((x) => x.length >= 2);
    });
  }
  if (!parts.length) throw new Error(`no Natural Earth geometry for ${r.en}`);
  counts.push(`${r.id} ${parts.length}`);
  out.push({ type: 'Feature', properties: { id: `river-${r.id}`, name: { en: r.en, zh: r.zh } }, geometry: { type: 'MultiLineString', coordinates: parts } });
}

const lakes = await read('ne_10m_lakes.shp', '-simplify dp interval=500 keep-shapes');
for (const l of LAKES) {
  const hits = lakes.features.filter((f) => l.ne.test(String(f.properties?.name_en)));
  const rings = hits.flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates[0]!] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates.map((p) => p[0]!) : []));
  if (!rings.length) throw new Error(`no Natural Earth lake for ${l.en}`);
  counts.push(`${l.id} ${rings.length} ring(s)`);
  out.push({ type: 'Feature', properties: { id: `lake-${l.id}`, name: { en: l.en, zh: l.zh } }, geometry: { type: 'MultiLineString', coordinates: rings } });
}

const file = 'public/geo/silk-road-rivers.json';
writeJson(file, { type: 'FeatureCollection', features: out });
console.log(`${file}: ${out.length} features (${counts.join(', ')}), ${(readFileSync(file).length / 1024).toFixed(0)} KB`);

/**
 * G2 (docs/43 §3.2): the river layer of the Old World plate,
 * public/geo/ancient-rivers.json (riversFile, docs/06 「区域底图」).
 *
 *   pnpm tsx scripts/geo/ancient-civilisations/build-rivers.ts
 *
 * - Today's rivers: Natural Earth 1:10m `rivers_lake_centerlines` v5.0.0
 *   (public domain; raw/ne/, downloaded from naciscdn.org, SHA-256 in
 *   SOURCES-GEO.md), picked by `name_en`, clipped to the plate, simplified
 *   (mapshaper DP 500 m). The Yellow River is kept only west of the start of
 *   the reconstructed course (113.546° E, near Zhengzhou): its lower course of
 *   today dates from 1855 and is not drawn.
 * - Tonlé Sap: the outer ring of the Natural Earth 1:10m `lakes` polygon, as a line.
 * - Two reconstructed Yellow River courses, copied unchanged from
 *   public/geo/warring-states-rivers.json (traced from Kanguole's Commons map,
 *   CC BY-SA 4.0; docs/27 G1): the shared trunk Zhengzhou → Puyang (`to` 11 CE)
 *   and the course before 602 BCE (`to` -0602). That file has no geometry for
 *   the 602 BCE – 11 CE course beyond Puyang or for any course after 11 CE;
 *   neither is drawn (SOURCES-GEO.md, known gaps).
 * Rivers named in the spec that Natural Earth does not have (Musi, Brantas)
 * are not drawn.
 */
import { readFileSync } from 'node:fs';
import type { Feature, FeatureCollection, LineString, MultiLineString, Position } from 'geojson';
import { mapshaperApi, writeJson } from '../lib/common';

const DIR = 'scripts/geo/ancient-civilisations';
const BOX = [-12, -12, 135, 58];
const HUANG_CUT = 113.546;

/** Natural Earth `name_en` values → river id and bilingual name (Chinese: zh.wikipedia / docs/43 §3.2). */
const RIVERS: { id: string; ne: string[]; en: string; zh: string; label?: Position }[] = [
  { id: 'tigris', ne: ['Tigris'], en: 'Tigris', zh: '底格里斯河' },
  { id: 'euphrates', ne: ['Euphrates'], en: 'Euphrates', zh: '幼发拉底河' },
  { id: 'nile', ne: ['Nile'], en: 'Nile', zh: '尼罗河' },
  { id: 'indus', ne: ['Indus'], en: 'Indus', zh: '印度河' },
  { id: 'jhelum', ne: ['Jhelum'], en: 'Jhelum', zh: '杰赫勒姆河' },
  { id: 'chenab', ne: ['Chenab'], en: 'Chenab', zh: '杰纳布河' },
  { id: 'ravi', ne: ['Ravi'], en: 'Ravi', zh: '拉维河' },
  { id: 'sutlej', ne: ['Sutlej'], en: 'Sutlej', zh: '萨特莱杰河' },
  { id: 'beas', ne: ['Beas'], en: 'Beas', zh: '比亚斯河' },
  { id: 'ganges', ne: ['Ganges'], en: 'Ganges', zh: '恒河' },
  { id: 'yamuna', ne: ['Yamuna'], en: 'Yamuna', zh: '亚穆纳河' },
  { id: 'huang', ne: ['Yellow', 'Huang'], en: 'Yellow River', zh: '黄河' },
  { id: 'wei', ne: ['Wei'], en: 'Wei', zh: '渭河' },
  { id: 'yangtze', ne: ['Yangtze'], en: 'Yangtze', zh: '长江' },
  { id: 'mekong', ne: ['Mekong'], en: 'Mekong', zh: '湄公河' },
  { id: 'chao-phraya', ne: ['Chao Phraya'], en: 'Chao Phraya', zh: '湄南河' },
  { id: 'yom', ne: ['Yom'], en: 'Yom', zh: '永河' },
  { id: 'tiber', ne: ['Tiber'], en: 'Tiber', zh: '台伯河' },
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
  let parts = centre.features
    .filter((f) => r.ne.includes(String(f.properties?.name_en)))
    .flatMap((f) => lines(f.geometry as LineString | MultiLineString));
  if (r.id === 'huang') {
    // Keep the runs west of the cut; a run crossing it is cut at its last vertex west of the line.
    parts = parts.flatMap((p) => {
      const runs: Position[][] = [];
      let run: Position[] = [];
      for (const pt of p) {
        if (pt[0]! <= HUANG_CUT) run.push(pt);
        else if (run.length) (runs.push(run), (run = []));
      }
      if (run.length) runs.push(run);
      return runs.filter((x) => x.length >= 2);
    });
  }
  if (!parts.length) throw new Error(`no Natural Earth geometry for ${r.en}`);
  counts.push(`${r.id} ${parts.length}`);
  out.push({ type: 'Feature', properties: { id: `river-${r.id}`, name: { en: r.en, zh: r.zh }, ...(r.label ? { label: r.label } : {}) }, geometry: { type: 'MultiLineString', coordinates: parts } });
}

const lakes = await read('ne_10m_lakes.shp');
const tonle = lakes.features.find((f) => /^Tonl.+ Sap$/.test(String(f.properties?.name_en)));
if (!tonle || (tonle.geometry.type !== 'Polygon' && tonle.geometry.type !== 'MultiPolygon')) throw new Error('no Tonle Sap polygon in Natural Earth lakes');
const rings = tonle.geometry.type === 'Polygon' ? [tonle.geometry.coordinates[0]!] : tonle.geometry.coordinates.map((p) => p[0]!);
out.push({ type: 'Feature', properties: { id: 'river-tonle-sap', name: { en: 'Tonlé Sap', zh: '洞里萨湖' } }, geometry: { type: 'MultiLineString', coordinates: rings } });

// The two reconstructed courses, unchanged from the Warring States river file (CC BY-SA 4.0).
const ws = JSON.parse(readFileSync('public/geo/warring-states-rivers.json', 'utf8')) as FeatureCollection;
const take = (id: string) => {
  const f = ws.features.find((x) => x.properties?.id === id);
  if (!f || f.geometry.type !== 'LineString') throw new Error(`warring-states-rivers.json has no LineString ${id}`);
  return f.geometry.coordinates;
};
out.push({
  type: 'Feature',
  properties: { id: 'river-huang-old-trunk', name: { en: 'Yellow River', zh: '黄河' }, to: '0011', reconstructed: true },
  geometry: { type: 'LineString', coordinates: take('huang-before-11-ad-57') },
});
out.push({
  type: 'Feature',
  properties: { id: 'river-huang-before-602', name: { en: 'Yellow River', zh: '黄河' }, to: '-0602', reconstructed: true },
  geometry: { type: 'LineString', coordinates: take('huang-before-602-bc-58') },
});

const file = 'public/geo/ancient-rivers.json';
writeJson(file, { type: 'FeatureCollection', features: out });
console.log(`${file}: ${out.length} rivers (${counts.join(', ')}, tonle-sap ${rings.length} ring, 2 reconstructed), ${(readFileSync(file).length / 1024).toFixed(0)} KB`);

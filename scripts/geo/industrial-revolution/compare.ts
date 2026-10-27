/** Offline provenance comparisons; no browser or source download. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { feature } from 'topojson-client';
import type { FeatureCollection, Position } from 'geojson';
const root = resolve(import.meta.dirname, '../../..');
const source = process.env.ATLAS_IR_RESEARCH ?? '/Users/gavin/work/atlas/art/research/industrial-revolution/data';
const tools = process.env.ATLAS_GEO_TOOLS ?? '/Users/gavin/work/atlas/scripts/geo/.tools';
const requireTool = createRequire(join(tools, 'package.json'));
const proj = requireTool('mproj') as { pj_init(s: string): object; pj_transform_point(a: object, b: object, p: Position): void };
const out = join(import.meta.dirname, 'qa'); mkdirSync(out, { recursive: true });
function read(name: string) { return JSON.parse(readFileSync(name, 'utf8')) as FeatureCollection; }
function decode(name: string) {
  const top = JSON.parse(readFileSync(join(root, `public/geo/${name}.json`), 'utf8'));
  return feature(top, top.objects[name]) as unknown as FeatureCollection;
}
function lines(value: unknown): Position[][] {
  if (!Array.isArray(value) || !value.length) return [];
  return Array.isArray(value[0]) && typeof value[0][0] === 'number' ? [value as Position[]] : value.flatMap(lines);
}
function panel(fc: FeatureCollection, box: number[], x: number, y: number, w: number, h: number, native = false) {
  const [west = 0, south = 0, east = 0, north = 0] = box;
  const cos = native ? 1 : Math.cos((south + north) / 2 * Math.PI / 180);
  const scale = Math.min(w / ((east - west) * cos), h / (north - south));
  const offsetX = x + (w - (east - west) * cos * scale) / 2, offsetY = y + (h - (north - south) * scale) / 2;
  const coords = fc.features.flatMap(f => 'coordinates' in f.geometry ? lines(f.geometry.coordinates) : []);
  return `<path d="${coords.map(r => r.map((p, i) => `${i ? 'L' : 'M'}${(offsetX + (p[0]! - west) * cos * scale).toFixed(2)},${(offsetY + (north - p[1]!) * scale).toFixed(2)}`).join('')).join('')}" fill="none" stroke="#333" stroke-width="0.35"/>`;
}
async function save(name: string, body: string, height: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="${height}" viewBox="0 0 1500 ${height}"><rect width="1500" height="${height}" fill="white"/><g font-family="sans-serif" font-size="20" fill="#111">${body}</g></svg>`;
  const file = join(out, `${name}.png`); await sharp(Buffer.from(svg)).png().toFile(file);
  console.log(file);
}
const coalNative = JSON.parse(execFileSync('python3', [join(import.meta.dirname, 'read-bgs.py'), source], { maxBuffer: 30_000_000, encoding: 'utf8' })) as FeatureCollection;
const coalWgs = structuredClone(coalNative), from = proj.pj_init('+init=epsg:27700'), to = proj.pj_init('+proj=longlat +datum=WGS84');
for (const f of coalWgs.features) for (const line of lines('coordinates' in f.geometry ? f.geometry.coordinates : [])) for (const p of line) proj.pj_transform_point(from, to, p);
await save('bgs-native-wgs84-production', `<text x="20" y="32">BGS Coal-bearing strata: 622 GB features; modern geology, not dated workings</text><text x="20" y="68">Native EPSG:27700</text><text x="520" y="68">Full EPSG:4326 transformation</text><text x="1020" y="68">Production DP 500m; all rings retained</text>${panel(coalNative, [150000, 60000, 670000, 910000], 20, 100, 450, 740, true)}${panel(coalWgs, [-8, 49.5, 2, 59.5], 520, 100, 450, 740)}${panel(decode('industrial-coal-strata'), [-8, 49.5, 2, 59.5], 1020, 100, 450, 740)}<text x="20" y="885">Contains British Geological Survey materials © UKRI 2026. OGL 3.0. Each panel fits its declared CRS.</text>`, 920);
const railSource = read(join(source, 'rshapes-through-1914-continent.geojson')), railOutput = decode('industrial-rail-rshapes');
let body = '<text x="20" y="32">RShapes selected continental coverage: source / production; construction year, not steam traction</text>';
for (const [row, year] of [1834, 1914].entries()) {
  const y = row * 540 + 60;
  const before = { ...railSource, features: railSource.features.filter(f => Number(f.properties?.year) <= year) }, after = { ...railOutput, features: railOutput.features.filter(f => Number(f.properties?.f) <= year) };
  body += `<text x="20" y="${y + 22}">${year} source: ${before.features.length} original lids</text><text x="770" y="${y + 22}">${year} production: ${after.features.reduce((n, f) => n + Number(f.properties?.n), 0)} lids in ${after.features.length} same-year runs</text>${panel(before, [-12, 32, 60, 69], 20, y + 40, 700, 470)}${panel(after, [-12, 32, 60, 69], 770, y + 40, 700, 470)}`;
}
body += '<text x="20" y="1160">RShapes 1.0 / ETH Zürich. CC BY-NC-SA 4.0. Whole-feature main-island exclusion; no OHM/BY-SA input.</text>';
await save('rshapes-1834-1914-source-production', body, 1200);
writeFileSync(join(out, 'README.md'), '# Offline geometry review\n\nGenerated with `pnpm tsx scripts/geo/industrial-revolution/compare.ts`; no browser or remote tiles.\n\nBGS image: native projected strata, full WGS84 conversion and production geometry, each independently fit to its labelled CRS. This checks broad distribution and component preservation, not geodetic accuracy. OGL 3.0.\n\nRShapes image: same geographic extent before/after simplification for 1834 and 1914; every original lid kept, merged only into same-year connected runs. CC BY-NC-SA 4.0; no CC BY-SA content. These are source/production comparisons, not runtime screenshots.\n');

/** G18 reference-only registration from identifiable NE river junctions.
 * Five independently identified junctions seed a diagnostic fit. Further NE
 * nodes match blue pixels within 5 px; this does not independently verify them.
 */
import sharp from 'sharp';
import { candidates, evaluate } from '../lib/fit';
import { writeJson } from '../lib/common';
import type { ControlPoint } from '../lib/manifest';
import { array, object, pair, readJson, required, string } from './strict-input';
const dir = 'scripts/geo/warring-states';
interface ReferencePoint extends ControlPoint { coordinateSource: string; snapPx?: number }
const seedRows: [string, [number, number], [number, number]][] = [
  ['Wei–Yellow confluence', [110.293468, 34.623155], [462, 573]],
  ['Jing–Wei confluence', [109.070974, 34.470038], [383, 588]],
  ['Fen–Yellow confluence', [110.554861, 35.458604], [486, 502]],
  ['Han–Yangtze confluence', [114.289561, 30.566352], [822, 959]],
  ['Jialing–Yangtze confluence', [106.586843, 29.585639], [217, 1030]],
];
const seeds: ReferencePoint[] = seedRows.map(([name, lnglat, svg]) => ({ name, lnglat, svg,
  coordinateSource: 'Natural Earth 10m rivers named endpoint; source junction visually identified' }));
const candidate = required(candidates('equirectangular+affine', seeds)[0], 'G18 preliminary projection');
const fit = evaluate(candidate.proj, 'affine', seeds);
const a = fit.model.toLngLat(0, 0), b = fit.model.toLngLat(1, 0), c = fit.model.toLngLat(0, 1);
const A = b[0] - a[0], B = c[0] - a[0], C = b[1] - a[1], D = c[1] - a[1], det = A * D - B * C;
if (!Number.isFinite(det) || Math.abs(det) < Number.EPSILON) throw new Error('G18 preliminary affine model is singular');
const inverse = (longitude: number, latitude: number): [number, number] => [
  (D * (longitude - a[0]) - B * (latitude - a[1])) / det,
  (-C * (longitude - a[0]) + A * (latitude - a[1])) / det,
];
const image = await sharp(`${dir}/raw/G18.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const selected: ReferencePoint[] = [];
for (const value of array(object(readJson(`${dir}/raw/ne-rivers.geojson`)).features)) {
  const feature = object(value), name = string(object(feature.properties).name);
  if (!['Luan', 'Hai', 'Huai', 'Han', 'Fen', 'Wei', 'Jing', 'Ying', 'Jialing', 'Gan', 'Yangtze'].includes(name)) continue;
  const geometry = object(feature.geometry);
  if (geometry.type !== 'LineString' && geometry.type !== 'MultiLineString') throw new Error(`${name}: expected river lines`);
  const lines = geometry.type === 'MultiLineString' ? array(geometry.coordinates) : [geometry.coordinates];
  for (const value of lines) {
    const line = array(value).map((vertex) => pair(array(vertex).slice(0, 2)));
    if (!line.length) throw new Error(`${name}: empty river line`);
    for (const index of [0, Math.floor(line.length * .2), Math.floor(line.length * .4), Math.floor(line.length * .6), Math.floor(line.length * .8), line.length - 1]) {
      const point = required(line[index], `${name} vertex ${index}`);
      const [u, v] = inverse(...point);
      if (u < 20 || v < 20 || u > image.info.width - 20 || v > image.info.height - 20) continue;
      if ([...seeds, ...selected].some((p) => Math.hypot(p.svg[0] - u, p.svg[1] - v) < 35)) continue;
      let best: { svg: [number, number]; distance: number } | undefined;
      for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
        const x = Math.round(u) + dx, y = Math.round(v) + dy, offset = (y * image.info.width + x) * 4;
        const red = required(image.data[offset], 'red pixel'), green = required(image.data[offset + 1], 'green pixel'), blue = required(image.data[offset + 2], 'blue pixel');
        if (!(red < 100 && green > 85 && green < 180 && blue > 120 && blue > red + 50)) continue;
        const distance = Math.hypot(x - u, y - v);
        if (!best || distance < best.distance) best = { svg: [x, y], distance };
      }
      if (best) selected.push({ name: `${name} NE river vertex ${selected.length}`, lnglat: point, svg: best.svg, snapPx: best.distance,
        coordinateSource: 'NE named river vertex; anchored nearest blue path within 5px; reference-only map' });
    }
  }
}
const points = [...seeds, ...selected];
const results = candidates('auto', points).map((candidate) => evaluate(candidate.proj, candidate.kind, points))
  .sort((a, b) => a.report.looRmsKm - b.report.looRmsKm);
const best = required(results[0], 'G18 fit result');
writeJson(`${dir}/g18-registration.json`, { controlPoints: points, report: best.report, method: 'Visual junction anchors and reproducible nearest-blue NE endpoint matches. G18 is not used to reconstruct any historical geometry.' }, true);
console.log('G18', points.length, best.report.rmsKm, best.report.maxKm, best.report.looRmsKm);
const manifest = object(readJson(`${dir}/sources.json`));
object(manifest.raster).G18 = { dataset: 'G18', projection: 'auto', palette: { '#c6ecff': '_sea', '#a8c68f': '_land' }, tolerance: 20, land: ['_land'], sea: ['_sea'], maxResidualKm: 40, controlPoints: points };
writeJson(`${dir}/sources.json`, manifest, true);
writeJson(`${dir}/work/raster-G18-fit.json`, best.report, true);

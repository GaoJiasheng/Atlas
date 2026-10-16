/** Locate worst source-to-final boundary deviations, including intentional coast erasures. */
import { feature } from 'topojson-client';
import { pointInPolygon, writeJson } from '../lib/common';
import { array, features, object, pair, polygons, readJson, required, string, topology } from './strict-input';
const dir = 'scripts/geo/warring-states';
const control = object(readJson('src/content/topics/warring-states/data/control.json'));
const sourceTopology = topology(control.topology);
const region = topology(readJson('public/geo/warring-states-region.json'));
const land = features(feature(region, required(Object.values(region.objects)[0], 'region object')))
  .filter((item) => object(item.properties).kind === 'land').flatMap((item) => polygons(item.geometry));
type Point = [number, number];
type Segment = [Point, Point];
const rings = (value: unknown) => features(value).flatMap((item) => polygons(item.geometry)).flat();
const segments = (rings: Point[][]): Segment[] => rings.flatMap((ring) => ring.slice(1).map((point, index) => [required(ring[index], 'segment start'), point]));
function near([longitude, latitude]: Point, segments: Segment[]): number {
  const cosine = Math.cos(latitude * Math.PI / 180);
  let best = Infinity;
  for (const [a, b] of segments) {
    const x = (a[0] - longitude) * cosine, y = a[1] - latitude;
    const dx = (b[0] - a[0]) * cosine, dy = b[1] - a[1], squared = dx * dx + dy * dy;
    const t = squared ? Math.max(0, Math.min(1, -(x * dx + y * dy) / squared)) : 0;
    best = Math.min(best, Math.hypot(x + t * dx, y + t * dy));
  }
  return best * 111.195;
}
const coast = segments(land.flat());
interface Deviation { holder: string; point: Point; km: number }
const output: { id: string; worst: Deviation[] }[] = [];
for (const value of array(control.keyframes)) {
  const id = string(object(value).object);
  const original = readJson(`${dir}/work/${id}.geojson`);
  const final = feature(sourceTopology, required(sourceTopology.objects[id], `${id} topology object`));
  const boundaries = segments(rings(final)), worst: Deviation[] = [];
  for (const item of features(original)) {
    for (const ring of polygons(item.geometry).flat()) {
      for (let index = 0; index < ring.length; index += 2) {
        const point = required(ring[index], 'source sample');
        if (!land.some((polygon) => pointInPolygon(point, polygon)) || near(point, coast) < 15) continue;
        const km = near(point, boundaries), last = worst.at(-1);
        if (worst.length < 5 || last === undefined || km > last.km) {
          worst.push({ holder: string(object(item.properties).holder), point, km });
          worst.sort((a, b) => b.km - a.km);
          worst.length = Math.min(worst.length, 5);
        }
      }
    }
  }
  output.push({ id, worst });
  console.log(id, worst[0]);
}
writeJson(`${dir}/deviation-audit.json`, output, true);

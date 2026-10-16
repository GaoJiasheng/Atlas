/** Area retention distinguishes removed internal seams from lost territory. */
import { feature } from 'topojson-client';
type GeometryObject = Exclude<Parameters<typeof feature>[1], string>;
import { writeJson } from '../lib/common';
import { array, number, object, readJson, required, string, topology as narrowTopology } from './strict-input';
const dir = 'scripts/geo/warring-states';
const control = object(readJson('src/content/topics/warring-states/data/control.json'));
const topology = narrowTopology(control.topology);
function ring(value: unknown): number {
  const points = array(value).map((value) => {
    const point = array(value);
    return [number(point[0]), number(point[1])] as const;
  });
  if (points.length === 0) return 0;
  const cosine = Math.cos(points.reduce((sum, point) => sum + point[1], 0) / points.length * Math.PI / 180);
  let sum = 0;
  for (let index = 1; index < points.length; index++) {
    const previous = required(points[index - 1], 'previous ring vertex');
    const current = required(points[index], 'current ring vertex');
    sum += previous[0] * current[1] - current[0] * previous[1];
  }
  return Math.abs(sum) * 0.5 * cosine * 111.195 ** 2;
}
function area(value: unknown): number {
  const geometry = object(value);
  const polygons = geometry.type === 'Polygon' ? [array(geometry.coordinates)] : array(geometry.coordinates).map(array);
  return polygons.reduce((sum, polygon) => {
    const [outer, ...holes] = polygon;
    return sum + Math.max(0, ring(required(outer, 'polygon outer ring')) - holes.reduce<number>((subtotal, hole) => subtotal + ring(hole), 0));
  }, 0);
}
function features(value: unknown): Record<string, unknown>[] { return array(object(value).features).map(object); }
function holder(value: Record<string, unknown>): string { return string(object(value.properties).holder); }
interface Row { holder: string; sourceKm2: number; finalKm2: number; changePct: number }
const output: { id: string; rows: Row[] }[] = [];
for (const value of array(control.keyframes)) {
  const id = string(object(value).object);
  const source = features(readJson(`${dir}/work/${id}.geojson`));
  const geometry: GeometryObject = required(topology.objects[id], `${id} topology object`);
  const final = features(feature(topology, geometry));
  const rows: Row[] = [];
  for (const original of source) {
    const id = holder(original);
    if (rows.some((row) => row.holder === id)) continue;
    const before = source.filter((item) => holder(item) === id).reduce((sum, item) => sum + area(item.geometry), 0);
    const after = final.filter((item) => holder(item) === id).reduce((sum, item) => sum + area(item.geometry), 0);
    rows.push({ holder: id, sourceKm2: before, finalKm2: after, changePct: (after / before - 1) * 100 });
  }
  output.push({ id, rows });
}
writeJson(`${dir}/area-audit.json`, { method: 'Spherical-local planar area approximation, sufficient for material-loss diagnostics; coastline clipping changes are expected', frames: output }, true);
for (const frame of output) console.log(frame.id, frame.rows.filter((row) => Math.abs(row.changePct) > 3).map((row) => [row.holder, row.changePct.toFixed(2)]));

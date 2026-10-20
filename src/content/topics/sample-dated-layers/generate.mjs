/** Deterministic synthetic fixture, never a source of historical land-use data. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const directory = fileURLToPath(new URL('./', import.meta.url));
const land = JSON.parse(readFileSync(`${root}public/geo/land-sg.json`, 'utf8'));
const decoded = feature(land, land.objects['land-sg']);
const polygons = decoded.features.find((item) => item.properties.kind === 'land').geometry.coordinates;
const ringArea = (ring) => Math.abs(ring.reduce((a, p, i) => {
  const q = ring[(i + 1) % ring.length];
  return a + p[0] * q[1] - q[0] * p[1];
}, 0));
const mainland = [...polygons].sort((a, b) => ringArea(b[0]) - ringArea(a[0]))[0];
function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
const onMainland = (point) => inRing(point, mainland[0]) && !mainland.slice(1).some((ring) => inRing(point, ring));
let seed = 34041959;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
// Recognisable urban neighbourhood centres; offsets and all buildings are invented.
const centres = [
  [103.797, 1.294], [103.850, 1.335], [103.845, 1.370], [103.934, 1.325],
  [103.945, 1.352], [103.948, 1.373], [103.887, 1.373], [103.893, 1.394],
  [103.910, 1.404], [103.849, 1.350], [103.764, 1.315], [103.731, 1.350],
  [103.747, 1.385], [103.787, 1.438], [103.819, 1.447], [103.838, 1.429],
  [103.749, 1.359], [103.904, 1.302], [103.872, 1.351], [103.817, 1.282],
];
function location(index) {
  const centre = centres[index % centres.length];
  for (;;) {
    const radius = Math.sqrt(-2 * Math.log(Math.max(random(), 1e-9)));
    const angle = 2 * Math.PI * random();
    const direction = (index % centres.length) * 0.37;
    const x = radius * Math.cos(angle) * 0.0045;
    const y = radius * Math.sin(angle) * 0.0028;
    const point = [
      +(centre[0] + x * Math.cos(direction) - y * Math.sin(direction)).toFixed(6),
      +(centre[1] + x * Math.sin(direction) + y * Math.cos(direction)).toFixed(6),
    ];
    if (onMainland(point)) return point;
  }
}
const blocks = Array.from({ length: 11000 }, (_, i) => ({
  type: 'Point',
  coordinates: location(i),
  properties: {
    id: `sample-block-${String(i + 1).padStart(5, '0')}`,
    f: i < 500 ? 1959 : i < 2000 ? 1965 : i < 5000 ? 1970 : i < 10000 ? 2019 : 1980,
    ...(i < 1000 ? { u: 1980 } : {}),
    h: 4 + i % 37,
  },
})).sort((a, b) => a.properties.f - b.properties.f);

function topology(name, geometries, arcs = []) {
  return { type: 'Topology', objects: { [name]: { type: 'GeometryCollection', geometries } }, arcs };
}
function save(name, content) {
  writeFileSync(`${root}public/geo/${name}.json`, `${JSON.stringify(content)}\n`);
}
save('sample-dated-blocks', topology('sample-dated-blocks', blocks));
save('sample-dated-rail', topology('sample-dated-rail', [
  { type: 'LineString', arcs: [0], properties: { f: 1965, u: 1980 } },
  { type: 'LineString', arcs: [1], properties: { f: 1980 } },
], [
  [[103.842, 1.328], [103.846, 1.332], [103.851, 1.335], [103.855, 1.340]],
  [[103.842, 1.328], [103.847, 1.335], [103.850, 1.343], [103.849, 1.351]],
]));
save('sample-dated-gardens', topology('sample-dated-gardens', [
  { type: 'Polygon', arcs: [[0]], properties: { f: 1959, u: 1980, certainty: 'approximate' } },
  { type: 'Polygon', arcs: [[1]], properties: { f: 1980, certainty: 'approximate' } },
  { type: 'Polygon', arcs: [[2]], properties: { f: 2019 } },
], [
  [[103.811, 1.301], [103.819, 1.300], [103.823, 1.305], [103.817, 1.309], [103.810, 1.306], [103.811, 1.301]],
  [[103.813, 1.302], [103.821, 1.301], [103.825, 1.307], [103.819, 1.312], [103.811, 1.308], [103.813, 1.302]],
  [[103.930, 1.344], [103.937, 1.343], [103.941, 1.348], [103.936, 1.352], [103.930, 1.350], [103.930, 1.344]],
]));
// Only this sample uses these synthetic control patches. K2 is deliberately empty.
const patch = (holder, coordinates, label) => ({
  type: 'Feature', properties: { holder, label, src: ['G2'] },
  geometry: { type: 'Polygon', coordinates: [coordinates] },
});
const fc = (features) => ({ type: 'FeatureCollection', features });
const control = { keyframes: [
  { t: '1959', features: fc([patch('housing', [[103.786, 1.288], [103.801, 1.288], [103.805, 1.297], [103.797, 1.302], [103.785, 1.297], [103.786, 1.288]], { en: 'Early sample patch', zh: '早期示例色块' })]) },
  { t: '1966', features: fc([]) },
  { t: '2019', features: fc([patch('housing', [[103.930, 1.343], [103.943, 1.341], [103.950, 1.350], [103.944, 1.359], [103.931, 1.356], [103.930, 1.343]], { en: 'Late sample patch', zh: '后期示例色块' })]) },
] };
writeFileSync(`${directory}data/control.json`, `${JSON.stringify(control, null, 2)}\n`);

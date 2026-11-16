/**
 * sample-plate-rotation (docs/72 §4.6): synthetic TEST/DESIGN files for the rotation map engine,
 * independent of the continental-drift content. Three plates, a fixed-plate switch at 100 Ma, a ring
 * round the South Pole, a ring across the antimeridian, two points, one group of two records.
 * No scientific claim. Run: pnpm tsx scripts/geo/sample-plate-rotation/build.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const out = (stem: string, value: unknown) => writeFileSync(resolve(root, `public/geo/${stem}.json`), `${JSON.stringify(value)}\n`);
const bi = (en: string, zh: string) => ({ en, zh });

/** TEST poles [age, lat, lon, angle]. Plate 3 follows plate 1 up to 100 Ma and plate 2 from 100 Ma. */
const rotations = {
  version: 1, modelId: 'test-three-plates', anchorPlateId: 0,
  sequences: [
    { moving: 1, fixed: 0, poles: [[0, 90, 0, 0], [100, 0, 0, 20], [200, 0, 0, 40]] },
    { moving: 2, fixed: 0, poles: [[0, 90, 0, 0], [200, 90, 0, -60]] },
    { moving: 3, fixed: 1, poles: [[0, 90, 0, 0], [100, 90, 0, 10]] },
    { moving: 3, fixed: 2, poles: [[100, 90, 0, 10], [200, 90, 0, 10]] },
  ],
};

type Ring = [number, number][];
const close = (r: Ring): Ring => [...r, r[0]!];
/** Round the South Pole at 65° S (plate 1). */
const cap = (step: number): Ring => { const r: Ring = []; for (let lon = -180; lon < 180; lon += step) r.push([lon, -65]); return close(r); };
/** Across the antimeridian, 170° E to 170° W (plate 2). */
const dateline = (step: number): Ring => {
  const r: Ring = [];
  for (let lon = 170; lon < 190; lon += step) r.push([lon > 180 ? lon - 360 : lon, 10]);
  for (let lat = 10; lat < 30; lat += step) r.push([-170, lat]);
  for (let lon = 190; lon > 170; lon -= step) r.push([lon > 180 ? lon - 360 : lon, 30]);
  for (let lat = 30; lat > 10; lat -= step) r.push([170, lat]);
  return close(r);
};
/** A square block (plate 3). */
const block = (step: number): Ring => {
  const r: Ring = [];
  for (let lon = 90; lon < 110; lon += step) r.push([lon, -5]);
  for (let lat = -5; lat < 15; lat += step) r.push([110, lat]);
  for (let lon = 110; lon > 90; lon -= step) r.push([lon, 15]);
  for (let lat = 15; lat > -5; lat -= step) r.push([90, lat]);
  return close(r);
};
const features = [
  { ring: cap, props: { plateId: 1, from: 200, to: 0, kind: 'cap' } },
  { ring: dateline, props: { plateId: 2, from: 150, to: 0, kind: 'dateline' } },
  { ring: block, props: { plateId: 3, from: 200, to: 0, kind: 'block' } },
];
const arcs: Ring[] = [];
const object = (step: (f: number) => number) => ({
  type: 'GeometryCollection',
  geometries: features.map((f, i) => { arcs.push(f.ring(step(i))); return { type: 'Polygon', arcs: [[arcs.length - 1]], properties: f.props }; }),
});
const full = object((i) => (i === 0 ? 5 : 1));
const scrub = object((i) => (i === 0 ? 20 : 5));
out('spr-land', { type: 'Topology', arcs, objects: { full, scrub } });
out('spr-rotations', rotations);

out('spr-points', {
  version: 1,
  points: [
    { id: 'spr-site', kind: 'site', at: [100, 5], plateId: 3, from: 200, to: 0 },
    { id: 'spr-glacial', kind: 'glacial', at: [0, -75], plateId: 1, from: 200, to: 0 },
  ],
  labels: [
    { id: 'spr-name-cap', at: [60, -78], plateId: 1, from: 200, to: 0, window: [200, 0], name: bi('TEST cap', '测试极盖') },
    { id: 'spr-name-early', at: [100, 12], plateId: 3, from: 200, to: 0, window: [200, 120], name: bi('TEST early block', '测试早期地块') },
  ],
});
out('spr-fossils', {
  version: 1,
  points: [
    { id: 'pbdb-col-1', kind: 'fossil', at: [-30, -70], plateId: 1, from: 200, to: 0, cc: 'AQ', groups: ['spr-group'], occ: [{ n: '1', name: 'TEST taxon', older: 190, younger: 180, ref: 'R1' }] },
    { id: 'pbdb-col-2', kind: 'fossil', at: [175, 20], plateId: 2, from: 150, to: 0, cc: 'FJ', groups: ['spr-group'], occ: [{ n: '2', name: 'TEST taxon', older: 140, younger: 130, ref: 'R1' }] },
  ],
  groups: [{ id: 'spr-group', members: ['pbdb-col-1', 'pbdb-col-2'], representative: 'pbdb-col-1' }],
  references: { R1: 'TEST/DESIGN reference: Atlas synthetic fixture, no publication.' },
});
const text = (en: string, zh: string, sen: string, szh: string) => ({ title: bi(en, zh), summary: bi(sen, szh), sources: ['S1'] });
out('spr-points-text', {
  version: 1,
  objects: {
    'spr-site': text('TEST site', '测试站点', 'TEST/DESIGN: a point on plate 3, which follows plate 1 until 100 Ma and plate 2 from 100 Ma.', '测试／设计：板块 3 上的点；100 Ma 以前随板块 1，从 100 Ma 起随板块 2。'),
    'spr-glacial': text('TEST polar point', '测试极区点', 'TEST/DESIGN: a point inside the ring round the South Pole (plate 1).', '测试／设计：环绕南极的环内的一个点（板块 1）。'),
    'spr-group': text('TEST group', '测试组', 'TEST/DESIGN: two records on two plates; the representative is on plate 1.', '测试／设计：两块板块上的两条记录；代表点在板块 1。'),
    'spr-name-cap': text('TEST cap', '测试极盖', 'TEST/DESIGN: label on plate 1, shown at every age.', '测试／设计：板块 1 上的标注，任何年代都显示。'),
    'spr-name-early': text('TEST early block', '测试早期地块', 'TEST/DESIGN: label shown only from 200 to 120 Ma.', '测试／设计：只在 200 至 120 Ma 显示的标注。'),
  },
});
out('spr-manifest', {
  version: 1, modelId: 'test-three-plates', modelLabel: bi('TEST three-plate model', '测试三板块模型'), plateLabel: 'TEST MODEL',
  coordinateSpace: 'rotated-present-day', rangeMa: [200, 0], rotations: 'spr-rotations',
  layers: [
    { id: 'cd-land', file: 'spr-land', kind: 'fill', motion: 'plate', lod: { scrub: 'scrub', full: 'full' } },
    { id: 'cd-names', file: 'spr-points', kind: 'label', motion: 'plate', select: 'label' },
    { id: 'cd-glacial', file: 'spr-points', kind: 'point', motion: 'plate', select: 'glacial' },
    { id: 'cd-fossils', file: 'spr-fossils', kind: 'point', motion: 'plate', select: 'fossil' },
    { id: 'cd-singapore', file: 'spr-points', kind: 'point', motion: 'plate', select: 'site' },
  ],
  objects: { points: 'spr-points', fossils: 'spr-fossils' },
  method: bi('TEST/DESIGN: synthetic plates and poles for engine assertions; no scientific claim.', '测试／设计：用于引擎断言的合成板块与旋转极；不作科学主张。'),
  sources: ['S1'],
});

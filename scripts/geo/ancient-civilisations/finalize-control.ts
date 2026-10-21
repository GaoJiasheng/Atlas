/**
 * G3 last step (docs/43 §3.3): after simplify.ts, mark every control feature
 * `certainty: "approximate"` (Cliopatria's own authors call the polygons one
 * version with unquantified uncertainty: dashed borders, lighter tint) and
 * append the empty frame K16 (600 CE: no control areas; Southeast Asia is
 * drawn as dated spheres instead). Fails on any zero-area or self-crossing ring.
 *
 *   pnpm tsx scripts/geo/ancient-civilisations/finalize-control.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import type { FeatureCollection, Position } from 'geojson';
import { ringIssues } from '../lib/rings';

const FILE = 'src/content/topics/ancient-civilisations/data/control.json';
const EMPTY = { id: 'K16', t: '0600' };

type Geometry = { type: string; arcs?: unknown; properties?: Record<string, unknown> };
type Topology = Parameters<typeof feature>[0] & { objects: Record<string, { type: string; geometries: Geometry[] }> };
const control = JSON.parse(readFileSync(FILE, 'utf8')) as { topology: Topology; keyframes: { t: string; object: string }[] };

let count = 0;
for (const obj of Object.values(control.topology.objects))
  for (const g of obj.geometries) {
    g.properties = { ...g.properties, certainty: 'approximate' };
    count++;
  }
if (!control.topology.objects[EMPTY.id]) control.topology.objects[EMPTY.id] = { type: 'GeometryCollection', geometries: [] };
control.keyframes = [...control.keyframes.filter((k) => k.object !== EMPTY.id), { t: EMPTY.t, object: EMPTY.id }];

const polys: Position[][][] = [];
for (const k of control.keyframes) {
  const fc = feature(control.topology, control.topology.objects[k.object] as Parameters<typeof feature>[1]) as unknown as FeatureCollection;
  for (const f of fc.features) {
    if (f.geometry.type === 'Polygon') polys.push(f.geometry.coordinates);
    else if (f.geometry.type === 'MultiPolygon') polys.push(...f.geometry.coordinates);
  }
}
const rings = ringIssues(polys);
if (rings.zeroArea || rings.selfCrossing) throw new Error(`control.json has bad rings: ${JSON.stringify(rings)}`);

// Same layout as simplify.ts writes: one arc per line, one geometry per line.
const { arcs, objects, ...head } = control.topology as unknown as { arcs: unknown[]; objects: Record<string, { type: string; geometries: Geometry[] }> };
const text = [
  '{',
  '  "topology": {',
  ...Object.entries(head).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`),
  '    "arcs": [',
  arcs.map((a) => `      ${JSON.stringify(a)}`).join(',\n'),
  '    ],',
  '    "objects": {',
  Object.entries(objects)
    .map(([k, o]) => `      ${JSON.stringify(k)}: {\n        "type": ${JSON.stringify(o.type)},\n        "geometries": [${o.geometries.length ? `\n${o.geometries.map((g) => `          ${JSON.stringify(g)}`).join(',\n')}\n        ` : ''}]\n      }`)
    .join(',\n'),
  '    }',
  '  },',
  '  "keyframes": [',
  control.keyframes.map((k) => `    ${JSON.stringify(k)}`).join(',\n'),
  '  ]',
  '}',
  '',
].join('\n');
writeFileSync(FILE, text);
console.log(`${FILE}: ${control.keyframes.length} keyframes (${EMPTY.id} empty), ${count} features marked approximate, ${(text.length / 1024).toFixed(0)} KB; rings: ${rings.rings}, zero-area ${rings.zeroArea}, self-crossing ${rings.selfCrossing}`);

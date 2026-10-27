/** Build the Zheng He plate from the pinned preparation GeoJSON, not inferred coastlines.
 * pnpm tsx scripts/geo/zheng-he/build-land.ts --source <ne-10m-land.geojson>
 * Source SHA and limits: SOURCES-GEO.md. Tools: the existing geo pipeline.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import { mapshaper } from '../lib/common';
import { regionTopology } from '../lib/region';
import { ringIssues } from '../lib/rings';

const { values } = parseArgs({ options: { source: { type: 'string' } } });
if (!values.source) throw new Error('--source <ne-10m-land.geojson> is required');
const raw = readFileSync(values.source);
const sha256 = createHash('sha256').update(raw).digest('hex');
if (sha256 !== '1ac90796408bc6ad6911d69448485d3c4dbf2190370080368a09976e1c9f7416') throw new Error('Source SHA256 differs from the preparation inventory');
const source = JSON.parse(raw.toString()) as FeatureCollection;
const box: [number, number, number, number] = [34.75, -15.25, 125.25, 37.25];
const land = await mapshaper(`-i land.json -clip bbox=${box.join(',')} -simplify dp interval=500 keep-shapes -clean`, { land: source });
const built = regionTopology(land, box, 'zheng-he-land', { tolerance: 0, minAreaDeg2: 1 / (111.32 ** 2 * Math.cos(11 * Math.PI / 180)), quantization: 1_000_000 });
const fc = feature(built.topology as unknown as Parameters<typeof feature>[0], built.topology.objects['zheng-he-land'] as Parameters<typeof feature>[1]) as unknown as FeatureCollection;
const polygons = fc.features.filter((f) => f.properties?.kind === 'land').flatMap((f) => f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : []);
const rings = ringIssues(polygons);
if (rings.zeroArea || rings.selfCrossing) throw new Error(JSON.stringify(rings));
const text = JSON.stringify(built.topology);
if (Buffer.byteLength(text) > 2_000_000) throw new Error('Plate exceeds 2 MB');
writeFileSync('public/geo/zheng-he-land.json', text);
process.stdout.write(`${Buffer.byteLength(text)} bytes; ${built.polygons} polygons; ${built.vertices} vertices; ${built.coastArcs} coast arcs; ${JSON.stringify(rings)}\n`);

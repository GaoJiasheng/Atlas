/**
 * Heat's built production/local-QA JavaScript transfer audit; no browser required.
 * Run after pnpm build: pnpm tsx scripts/geo/heat/bundle-audit.ts [--dist dist]
 *
 * Production uses the repository budget's selected-feature closure. Local QA also
 * loads test-hooks on localhost, as SpaceSceneEntry does. gzip-9 matches shoot.ts;
 * gzip-6 matches js-budget.ts. Fetched topic JSON and GLB are reported separately.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { measureBudgets, staticClosure, type Chunk } from '../../js-budget';

const args = process.argv.slice(2);
const distAt = args.indexOf('--dist');
if (args.length !== 0 && !(args.length === 2 && distAt === 0 && args[1])) {
  throw new Error('Usage: pnpm tsx scripts/geo/heat/bundle-audit.ts [--dist dist]');
}
const dist = resolve(distAt < 0 ? 'dist' : args[distAt + 1]!);
const graph = JSON.parse(readFileSync(resolve(dist, '_astro/js-budget-graph.json'), 'utf8')) as Record<string, Chunk>;
// Astro removes CSS-only JS stubs after the graph is emitted. They have no
// transferred code and cannot appear in the actual built import closure.
for (const chunk of Object.values(graph)) {
  chunk.imports = chunk.imports.filter(id => existsSync(resolve(dist, id)));
}
const moduleChunk = (suffix: string) => {
  const id = Object.entries(graph).find(([, chunk]) => chunk.modules.some(module => module.endsWith(suffix)))?.[0];
  if (!id) throw new Error(`Missing built module ${suffix}; run pnpm build first`);
  return id;
};
const source = (id: string) => readFileSync(resolve(dist, id));
const bytes = (ids: readonly string[], level: 6 | 9) =>
  [...new Set(ids)].reduce((sum, id) => sum + gzipSync(source(id), { level }).length, 0);
const kb = (size: number) => Number((size / 1024).toFixed(3));
const production = measureBudgets(dist, ['heat'])[0]!;
const hooks = moduleChunk('/src/engines/space-scene/test-hooks.ts');
const gltf = moduleChunk('/src/engines/space-scene/stages/model3d/GltfSource.tsx');
const curve = moduleChunk('/src/engines/space-scene/lib/sim/curve.ts');
const tryCurve = moduleChunk('/src/engines/space-scene/explorer/TryCurve.tsx');
const localhost = [...new Set([...production.files, ...staticClosure([hooks], graph)])].sort();
const localOnly = localhost.filter(id => !production.files.includes(id));
const json = source('topics/heat/data.json');
const data = JSON.parse(json.toString()) as { parts: { parts: { mesh?: unknown }[] } };
const meshParts = data.parts.parts.filter(part => part.mesh).length;
const glbPath = resolve(dist, 'models/heat-apparatus.glb');

console.log(JSON.stringify({
  topic: 'heat',
  dist,
  method: 'Static selected-feature production closure; localhost adds test-hooks static imports. Each emitted file is gzipped separately. KB = 1024 bytes.',
  production: {
    files: production.files.length,
    gzip6KB: kb(bytes(production.files, 6)),
    gzip9KB: kb(bytes(production.files, 9)),
    budgetKB: production.budgetKB,
  },
  localhostAcceptance: {
    files: localhost.length,
    gzip9KB: kb(bytes(localhost, 9)),
    extraOverProductionGzip9KB: kb(bytes(localOnly, 9)),
    extraChunks: localOnly.map(id => ({ file: id, gzip9Bytes: bytes([id], 9) })),
  },
  gltf: {
    meshParts,
    chunk: gltf,
    gzip9Bytes: bytes([gltf], 9),
    gzip9KB: kb(bytes([gltf], 9)),
    localhostExcludingThisChunkGzip9KB: kb(bytes(localhost.filter(id => id !== gltf), 9)),
    bundledModules: graph[gltf]!.modules,
    explanation: 'Adding the first mesh part activates GLTFLoader, the inline meshopt decoder and SkeletonUtils. Geometry remains in the fetched GLB.',
  },
  curveChunks: {
    files: [curve, tryCurve],
    gzip9KB: kb(bytes([curve, tryCurve], 9)),
  },
  separatelyFetched: {
    topicJson: { file: 'topics/heat/data.json', rawBytes: json.length, gzip6Bytes: gzipSync(json).length, gzip9Bytes: gzipSync(json, { level: 9 }).length },
    glb: { file: 'models/heat-apparatus.glb', rawBytes: statSync(glbPath).size },
  },
}, null, 2));

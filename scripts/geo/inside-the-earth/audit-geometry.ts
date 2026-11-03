/** CPU-only audit: actual engine meshes and label probes, never rendered QA.
 * pnpm tsx scripts/geo/inside-the-earth/audit-geometry.ts [workspace-output.json]
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Box3, Matrix4, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three';
import { loadGeology } from './load-geology';
import { parse as yaml } from 'yaml';
import { partsFile, type Part } from '../../../src/engines/space-scene/schema';
import { eachPieces, partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { anchorHalf, anchorOffset, anchorPoint } from '../../../src/engines/space-scene/stages/model3d/shapes';

const topic = resolve(dirname(fileURLToPath(import.meta.url)), '../../../src/content/topics/inside-the-earth');
const args=process.argv.slice(2);
const arg=(name:string,fallback:string)=>args.includes(name)?args[args.indexOf(name)+1]!:fallback;
const file = partsFile.parse(JSON.parse(readFileSync(arg('--input',resolve(topic, 'data/parts.json')), 'utf8')));
const meshPath=arg('--mesh',file.model ? resolve(topic,'../../../../public',file.model.slice(1)) : '');
const meshPieces=meshPath ? await loadGeology(meshPath) : new Map();
const material = new MeshBasicMaterial();
type Built = { part: Part; meshes: Mesh[]; pieces: number; triangles: number };
const built = new Map<string, Built>();
const restMatrices = new Map<Mesh, Matrix4>();
const owner = new Map<Mesh, string>();
for (const part of file.parts) {
  const each = file.animations.some(a => a.target === part.id && 'each' in a && a.each);
  const pieces = part.mesh ? meshPieces.get(part.mesh)! : each ? eachPieces(part) : partPieces(part);
  const meshes: Mesh[] = [];
  let triangles = 0;
  for (const piece of pieces) {
    triangles += (piece.geometry.index?.count ?? piece.geometry.getAttribute('position').count) / 3 * (piece.matrices?.length ?? 1);
    for (const matrix of piece.matrices ?? [new Matrix4()]) {
      const mesh = new Mesh(piece.geometry, material);
      mesh.matrixAutoUpdate = false;
      mesh.matrix.copy((part.mesh ? new Matrix4() : new Matrix4().makeTranslation(...part.primitive!.at)).multiply(matrix));
      mesh.updateMatrixWorld(true);
      restMatrices.set(mesh, mesh.matrix.clone());
      owner.set(mesh, part.id);
      meshes.push(mesh);
    }
  }
  built.set(part.id, { part, meshes, pieces: pieces.length, triangles });
}
const count = (members: Built[]) => ({ logicalParts: members.length, materialPieces: members.reduce((n, p) => n + p.pieces, 0), triangles: members.reduce((n, p) => n + p.triangles, 0) });
const groups = Object.fromEntries(file.groups.map((g) => [g.id, count([...built.values()].filter((p) => p.part.group === g.id))]));
const chapters = readdirSync(resolve(topic, 'chapters')).filter((p) => p.endsWith('.mdx')).sort().map((name) => {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(resolve(topic, 'chapters', name), 'utf8'));
  if (!frontmatter) throw new Error(`${name}: missing frontmatter`);
  const chapter = yaml(frontmatter[1]!) as { id: string; state: { layers: string[]; hide: string[] } };
  return { id: chapter.id, ...count([...built.values()].filter((p) => chapter.state.layers.includes(p.part.group!) && !chapter.state.hide.includes(p.part.id))) };
});

// Match probes.tsx's five rays and .02 near-target exclusion. Only the
// tested rest/slipped states are included: slipped entries are translations.
function probe(id: string, cameraPosition: readonly number[], group: string, slipped = false) {
  const part = built.get(id)!.part;
  const offset = (key: string): [number, number, number] => slipped ? file.poses!['fault-slipped']!.parts[key]?.offset ?? [0, 0, 0] : [0, 0, 0];
  const pos = new Vector3(...(part.mesh ? [0,0,0] as const : part.primitive!.at)).add(new Vector3(...offset(id)));
  // GltfSource/SceneRoot use measured GLB bounds after loading. The CPU
  // loader has already baked the rest transform into the geometry.
  const box=part.mesh ? built.get(id)!.meshes.reduce((box,mesh)=>box.expandByObject(mesh),new Box3()) : null;
  const center = box ? box.getCenter(new Vector3()).toArray() : anchorOffset(part);
  const point = box ? center : anchorPoint(part);
  const half = box ? box.getSize(new Vector3()).multiplyScalar(.5).toArray() : anchorHalf(part);
  const camera = new Vector3(...cameraPosition);
  const occluders = [...built.values()].filter((p) => p.part.id !== id && p.part.group === group).flatMap((p) => p.meshes);
  for (const mesh of occluders) {
    mesh.matrix.copy(new Matrix4().makeTranslation(...offset(owner.get(mesh)!)).multiply(restMatrices.get(mesh)!));
    mesh.updateMatrixWorld(true);
  }
  const rays = [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => {
    const target = i === 0 ? pos.clone().add(new Vector3(...point)) : pos.clone().add(new Vector3(center[0] + sx! * half[0] * 0.5, center[1] + sy! * half[1] * 0.5, center[2] + Math.sign(camera.z - (pos.z + center[2])) * half[2] * 0.5));
    const direction = target.clone().sub(camera);
    const hits = new Raycaster(camera, direction.clone().normalize(), 0, direction.length() - 0.02).intersectObjects(occluders, false);
    return { target: target.toArray(), blockedBy: [...new Set(hits.map((hit) => owner.get(hit.object as Mesh)!))], firstHit: hits[0]?.point.toArray() ?? null };
  });
  for (const mesh of occluders) { mesh.matrix.copy(restMatrices.get(mesh)!); mesh.updateMatrixWorld(true); }
  return { id, pose: slipped ? 'fault-slipped' : null, camera: cameraPosition, anchor: pos.clone().add(new Vector3(...point)).toArray(), clearEngineProbe: rays.some((r) => r.blockedBy.length === 0), rays };
}
const earthCamera = file.presets!.find((p) => p.id === 'earth-view')!.camera.position;
const faultCamera = file.presets!.find((p) => p.id === 'fault-view')!.camera.position;
const edgeCamera = file.presets!.find((p) => p.id === 'edge-view')!.camera.position;
const volcanoCamera = file.presets!.find((p) => p.id === 'volcano-view')!.camera.position;
const probes = [
  ...['earth-crust', 'earth-mantle', 'earth-outer-core', 'earth-inner-core'].map((id) => probe(id, earthCamera, 'planet-shells')),
  probe('fault-focus', faultCamera, 'ground-and-waves'),
  probe('fault-focus', faultCamera, 'ground-and-waves', true),
  probe('fault-epicentre', faultCamera, 'ground-and-waves', true),
  ...['fault-left','fault-right'].flatMap(id=>[probe(id,faultCamera,'ground-and-waves'),probe(id,faultCamera,'ground-and-waves',true)]),
  ...['edge-sub-right','edge-melt','collision-fold'].map(id=>probe(id,edgeCamera,'boundary-blocks')),
  probe('volcano-cone',volcanoCamera,'volcano-system'),
];
const report = {
  method: 'CPU Three.js engine geometry and exact five label-probe coordinates; front-sided opaque meshes; translation-only fault-slipped pose. Material-piece counts exclude ground, shadows and flows and are not measured draw calls.',
  exclusions: 'No WebGL rendering, shader/material appearance, HUD layout, responsive camera fitting, phone touch interaction, flow rendering, offline cache or GPU performance validation.',
  inventory: count([...built.values()]), groups, chapters,
  parts:[...built.values()].map(p=>({id:p.part.id,triangles:p.triangles,materialPieces:p.pieces,source:p.part.mesh?'GLB':'primitive'})),probes,
};
const json = `${JSON.stringify(report, null, 2)}\n`;
if (process.argv[2] && !process.argv[2].startsWith('--')) {
  const output = resolve(process.argv[2]);
  const path = relative(process.cwd(), output);
  if (path.startsWith('..') || isAbsolute(path)) throw new Error('Output must be inside the current workspace');
  writeFileSync(output, json);
}
process.stdout.write(json);
for (const { meshes } of built.values()) for (const mesh of meshes) mesh.geometry.dispose();
material.dispose();

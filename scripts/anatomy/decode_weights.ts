/** Decode the published compressed GLB, not a build-time or Blender copy. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';

function required<T>(value: T | null | undefined, label: string): T {
  if (value === null || value === undefined) throw new Error(`Missing ${label}`);
  return value;
}
type Vec3 = [number, number, number];
type Bounds = [Vec3, Vec3];
type Endpoints = [Vec3[], Vec3[]];
type Shares = Record<string, number>;
type Vertex = { p: Vec3; u: number; parent: number };
type Component = { bounds: Bounds; endpoints: Endpoints; count: number };
const axes = [0, 1, 2] as const;
const newBounds = (): Bounds => [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
function extendBounds(bounds: Bounds, p: Vec3) {
  for (const a of axes) {
    bounds[0][a] = Math.min(bounds[0][a], p[a]);
    bounds[1][a] = Math.max(bounds[1][a], p[a]);
  }
}
function transform(m: ArrayLike<number>, p: ArrayLike<number>): Vec3 {
  const x = required(p[0], 'position x'), y = required(p[1], 'position y'), z = required(p[2], 'position z');
  const coordinate = (i: number) => required(m[i], `matrix ${i}`) * x
    + required(m[i + 4], `matrix ${i + 4}`) * y
    + required(m[i + 8], `matrix ${i + 8}`) * z + required(m[i + 12], `matrix ${i + 12}`);
  return [coordinate(0), coordinate(1), coordinate(2)];
}
const require = createRequire(import.meta.url);
const { ALL_EXTENSIONS } = await import(pathToFileURL(require.resolve('@gltf-transform/extensions', {
  paths: [dirname(require.resolve('@gltf-transform/functions'))],
})).href) as typeof import('@gltf-transform/extensions');
const root = dirname(fileURLToPath(import.meta.url));
const topicIndex = process.argv.indexOf('--topic');
if (topicIndex < 0) throw new Error('Missing --topic argument');
const topic = required(process.argv[topicIndex + 1], 'topic');
if (!['chest', 'back', 'shoulders', 'arms', 'legs', 'core'].includes(topic)) throw new Error(`Unknown topic: ${topic}`);
const bytes = await readFile(resolve(root, `../../public/models/muscles-${topic}.glb`));
await MeshoptDecoder.ready;
const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).readBinary(bytes);
await doc.transform(dequantize());
const rows = [];
let triangles = 0;
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  triangles += mesh.listPrimitives().reduce((sum, prim) => sum + (prim.getIndices()?.getCount()
    ?? required(prim.getAttribute('POSITION'), `${node.getName()}: POSITION`).getCount()) / 3, 0);
  if (!['region', 'neighbour'].includes(String(node.getExtras().role ?? mesh.getExtras().role))) continue;
  const skin = required(node.getSkin(), `${node.getName()}: skin`);
  const binds = required(skin.getInverseBindMatrices(), `${node.getName()}: inverse bind matrices`);
  const jointNodes = skin.listJoints(), names = jointNodes.map(j => j.getName().replace(/^joint\./, ''));
  const shares: Shares = {}, endpoints: Endpoints = [[], []];
  const vertices: Vertex[] = [];
  const welded = new Map<string, number>();
  function find(index: number): number {
    let vertex = required(vertices[index], `vertex ${index}`);
    while (vertex.parent !== index) {
      const parent = required(vertices[vertex.parent], `parent vertex ${vertex.parent}`);
      vertex.parent = parent.parent;
      index = vertex.parent;
      vertex = required(vertices[index], `ancestor vertex ${index}`);
    }
    return index;
  }
  function union(a: number, b: number) {
    required(vertices[find(b)], 'component root').parent = find(a);
  }
  const bounds = newBounds();
  const bins: [Shares, Shares, Shares] = [{}, {}, {}];
  let count = 0;
  for (const prim of mesh.listPrimitives()) {
    const J = required(prim.getAttribute('JOINTS_0'), `${node.getName()}: JOINTS_0`);
    const W = required(prim.getAttribute('WEIGHTS_0'), `${node.getName()}: WEIGHTS_0`);
    const U = required(prim.getAttribute('_U'), `${node.getName()}: _U`);
    const P = required(prim.getAttribute('POSITION'), `${node.getName()}: POSITION`);
    const indices = prim.getIndices();
    const idx = indices ? Array.from(required(indices.getArray(), 'index array'))
      : Array.from({ length: P.getCount() }, (_, i) => i);
    const used = new Set(idx);
    const remap = new Map<number, number>();
    for (const i of used) {
      const j: number[] = [], w: number[] = [], p: number[] = [];
      J.getElement(i, j); W.getElement(i, w); P.getElement(i, p);
      const u = U.getScalar(i), v: Vec3 = [0, 0, 0];
      if (Math.abs(w.reduce((sum, x) => sum + x, 0) - 1) > .002 || w.some(x => !Number.isFinite(x) || x < 0)) {
        throw new Error(`${node.getName()}: invalid weights`);
      }
      for (const [k, weight] of w.entries()) {
        if (weight <= 0) continue;
        const jointIndex = required(j[k], `joint index ${k}`);
        const joint = required(jointNodes[jointIndex], `joint ${jointIndex}`);
        const jointName = required(names[jointIndex], `joint name ${jointIndex}`);
        const bind: number[] = [];
        binds.getElement(jointIndex, bind);
        const pos = transform(joint.getWorldMatrix(), transform(bind, p));
        for (const a of axes) v[a] += pos[a] * weight;
        shares[jointName] = (shares[jointName] ?? 0) + weight;
        const bin = bins[u < .1 ? 0 : u > .9 ? 2 : 1];
        bin[jointName] = (bin[jointName] ?? 0) + weight;
      }
      count++;
      const id = vertices.length;
      vertices.push({ p: v, u, parent: id }); remap.set(i, id);
      const key = v.map(x => Math.round(x * 1e6)).join(',');
      const previous = welded.get(key);
      if (previous !== undefined) union(id, previous); else welded.set(key, id);
      extendBounds(bounds, v);
      if (u <= .0001) endpoints[0].push(v);
      if (u >= .9999) endpoints[1].push(v);
    }
    const vertexId = (offset: number) => required(remap.get(required(idx[offset], `triangle index ${offset}`)), 'remapped vertex');
    for (let i = 0; i < idx.length; i += 3) {
      const a = vertexId(i);
      union(a, vertexId(i + 1)); union(a, vertexId(i + 2));
    }
  }
  for (const [key, value] of Object.entries(shares)) shares[key] = value / count;
  for (const bin of bins) {
    const sum = Object.values(bin).reduce((a, b) => a + b, 0);
    for (const [key, value] of Object.entries(bin)) bin[key] = value / sum;
  }
  const components = new Map<number, Component>();
  vertices.forEach((v, i) => {
    const componentRoot = find(i);
    let component = components.get(componentRoot);
    if (component === undefined) {
      component = { bounds: newBounds(), endpoints: [[], []], count: 0 };
      components.set(componentRoot, component);
    }
    component.count++;
    extendBounds(component.bounds, v.p);
    if (v.u <= .0001) component.endpoints[0].push(v.p);
    if (v.u >= .9999) component.endpoints[1].push(v.p);
  });
  rows.push({ name: node.getName(), count, shares, endpoints, bounds, bins, components: [...components.values()] });
}
const parents = Object.fromEntries(doc.getRoot().listNodes().filter(n => n.getName().startsWith('joint.')).map(n => {
  const parentName = n.getParentNode()?.getName();
  return [n.getName().replace(/^joint\./, ''), parentName?.startsWith('joint.') ? parentName.replace(/^joint\./, '') : null];
}));
const skins = doc.getRoot().listSkins().map(skin => skin.listJoints().map(j => j.getName().replace(/^joint\./, '')));
await writeFile(resolve(root, `cache/${topic}-weights-decoded.json`), JSON.stringify({
  topic, bytes: bytes.length, triangles, sha256: createHash('sha256').update(bytes).digest('hex'), parents, skins, rows,
}));

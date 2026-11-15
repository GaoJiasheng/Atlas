/**
 * brain-nerves GLB helper (no Blender):
 *   extract <in.glb> <out.json> <node> [<node> …]  decoded world positions / triangles of named nodes
 *   write <in.json> <out.glb>                       raw (unoptimised) GLB from build.py's node list
 * The raw GLB goes through optimize.ts (static path) like every other anatomy region.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

const [mode, a, b, ...rest] = process.argv.slice(2);
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

interface NodeIn {
  name: string;
  positions: number[];
  normals: number[];
  indices: number[];
  extras: Record<string, unknown>;
  attributes?: Record<string, { size: 1 | 3; values: number[] }>;
}

if (mode === 'extract') {
  if (!a || !b) throw new Error('extract <in.glb> <out.json> <node…>');
  const doc = await io.read(a);
  const out: Record<string, { positions: number[]; indices: number[] }> = {};
  for (const n of doc.getRoot().listNodes()) {
    if (!rest.includes(n.getName())) continue;
    const m = n.getWorldMatrix(), positions: number[] = [], indices: number[] = [];
    for (const p of n.getMesh()?.listPrimitives() ?? []) {
      const pos = p.getAttribute('POSITION'), off = positions.length / 3;
      if (!pos) throw new Error(`no positions in ${n.getName()}`);
      const v = [0, 0, 0];
      for (let i = 0; i < pos.getCount(); i++) {
        pos.getElement(i, v);
        positions.push(m[0] * v[0]! + m[4] * v[1]! + m[8] * v[2]! + m[12], m[1] * v[0]! + m[5] * v[1]! + m[9] * v[2]! + m[13],
          m[2] * v[0]! + m[6] * v[1]! + m[10] * v[2]! + m[14]);
      }
      for (const i of p.getIndices()?.getArray() ?? []) indices.push(i + off);
    }
    out[n.getName()] = { positions, indices };
  }
  for (const want of rest) if (!out[want]) throw new Error(`node ${want} not in ${a}`);
  await writeFile(b, JSON.stringify(out));
} else if (mode === 'write') {
  if (!a || !b) throw new Error('write <in.json> <out.glb>');
  const nodes: NodeIn[] = JSON.parse(await readFile(a, 'utf8'));
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scene = doc.createScene();
  const material = doc.createMaterial('anatomy').setBaseColorFactor([0.7, 0.66, 0.6, 1]).setRoughnessFactor(0.8);
  for (const n of nodes) {
    const prim = doc.createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(n.positions)).setBuffer(buffer))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(n.normals)).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(n.indices)).setBuffer(buffer))
      .setMaterial(material);
    for (const [semantic, attr] of Object.entries(n.attributes ?? {}))
      prim.setAttribute(semantic, doc.createAccessor().setType(attr.size === 1 ? 'SCALAR' : 'VEC3').setArray(new Float32Array(attr.values)).setBuffer(buffer));
    const mesh = doc.createMesh(n.name).addPrimitive(prim);
    scene.addChild(doc.createNode(n.name).setMesh(mesh).setExtras(n.extras));
  }
  await io.write(b, doc);
} else {
  throw new Error('mode: extract | write');
}

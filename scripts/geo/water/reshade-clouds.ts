/** Re-bake only the COLOR_0 of the two cloud meshes in the shipped water.glb (shade from scenery.ts).
 * Every other compressed stream is copied byte for byte, so accepted meshes keep their fingerprints.
 * Run: pnpm tsx scripts/geo/water/reshade-clouds.ts */
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { NodeIO, type Node } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { Vector3, Matrix4 } from 'three';
import { cloudColour } from './scenery';

const FILE = 'public/models/water.glb', METRICS = 'scripts/geo/water/comparisons';
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const glb = fs.readFileSync(FILE), jsonLength = glb.readUInt32LE(12);
const gltf = JSON.parse(glb.subarray(20, 20 + jsonLength).toString());
const bin = glb.subarray(28 + jsonLength);
const doc = await io.readBinary(glb);
const nodeOf = (name: string) => doc.getRoot().listNodes().find((n) => n.getName() === name)!;
const replaced = new Map<number, Uint8Array>();
for (const name of ['cumulus', 'rain-cloud']) {
  const node = nodeOf(name), prim = node.getMesh()!.listPrimitives()[0]!, position = prim.getAttribute('POSITION')!, colour = prim.getAttribute('COLOR_0')!;
  const world = new Matrix4().fromArray(node.getWorldMatrix()), p = new Vector3(), out = new Uint8Array(colour.getCount() * 4);
  for (let i = 0; i < position.getCount(); i++) {
    p.fromArray(position.getElement(i, [0, 0, 0])).applyMatrix4(world);
    const c = cloudColour(p.y, name === 'rain-cloud');
    [c.r, c.g, c.b].forEach((v, a) => { out[i * 4 + a] = Math.round((Math.round(v * 127) / 127) * 255); });
  }
  const glNode = gltf.nodes.find((n: { name: string }) => n.name === name);
  const view = gltf.accessors[gltf.meshes[glNode.mesh].primitives[0].attributes.COLOR_0].bufferView;
  replaced.set(view, MeshoptEncoder.encodeGltfBuffer(out, colour.getCount(), 4, 'ATTRIBUTES'));
}
// Repack buffer 0 in its existing order; the fallback buffer's layout is untouched.
type View = { buffer: number; byteOffset?: number; byteLength: number; extensions?: { EXT_meshopt_compression?: { buffer: number; byteOffset?: number; byteLength: number } } };
const slots = (gltf.bufferViews as View[]).map((view, index) => ({ view, index, c: view.extensions?.EXT_meshopt_compression })).filter((s) => (s.c ? s.c.buffer : s.view.buffer) === 0);
slots.sort((a, b) => (a.c?.byteOffset ?? a.view.byteOffset ?? 0) - (b.c?.byteOffset ?? b.view.byteOffset ?? 0));
const chunks: Buffer[] = [];
let offset = 0;
for (const s of slots) {
  const at = s.c?.byteOffset ?? s.view.byteOffset ?? 0, length = s.c?.byteLength ?? s.view.byteLength;
  const bytes = Buffer.from(replaced.get(s.index) ?? bin.subarray(at, at + length));
  if (s.c) { s.c.byteOffset = offset; s.c.byteLength = bytes.length; } else { s.view.byteOffset = offset; }
  chunks.push(bytes);
  offset += bytes.length;
  const pad = (4 - (offset % 4)) % 4;
  if (pad) { chunks.push(Buffer.alloc(pad)); offset += pad; }
}
gltf.buffers[0].byteLength = offset;
const json = Buffer.from(JSON.stringify(gltf));
const jsonPad = Buffer.alloc((4 - (json.length % 4)) % 4, 0x20);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + jsonPad.length + offset, 8);
header.writeUInt32LE(json.length + jsonPad.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(offset, 0); binHeader.writeUInt32LE(0x004e4942, 4);
const output = Buffer.concat([header, json, jsonPad, binHeader, ...chunks]);
fs.writeFileSync(FILE, output);

// Same fingerprint as tests/water-rebuild.test.ts; the clouds' geometry is unchanged, only their colours.
const after = await io.readBinary(output);
const fingerprint = (node: Node) => createHash('sha256').update(JSON.stringify({ matrix: node.getWorldMatrix(), attributes: node.getMesh()!.listPrimitives().map((p) => ({ attributes: p.listSemantics().map((s) => [s, Array.from(p.getAttribute(s)!.getArray()!)]), indices: Array.from(p.getIndices()!.getArray()!), material: p.getMaterial()!.getExtras() })) })).digest('hex');
for (const file of ['round2-before-metrics.json', 'round2-final-metrics.json']) {
  const path = `${METRICS}/${file}`, data = JSON.parse(fs.readFileSync(path, 'utf8'));
  for (const name of ['cumulus', 'rain-cloud']) data.acceptedFingerprints[name] = fingerprint(after.getRoot().listNodes().find((n) => n.getName() === name)!);
  if (file.includes('final')) { data.glbBytesAfter = output.length; data.sha256 = createHash('sha256').update(output).digest('hex'); }
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}
console.log(`water.glb ${glb.length} -> ${output.length} bytes`);

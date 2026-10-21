/** Static anatomy: meshopt codec roundtrip, strict node/attribute/budget gates. */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { type Document, type NodeIO, type vec3 } from '@gltf-transform/core';
import type { EXTMeshoptCompression } from '@gltf-transform/extensions';
import { weld, reorder, quantize, prune, dequantize } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { z } from 'zod';

const manifestSchema = z.object({
  expectedNodes: z.array(z.string()),
  output: z.string(),
  /** The "Changes for Atlas" sentence of this model's attribution (one per manifest). */
  changes: z.string().min(1),
  /** Extra source lines, e.g. a BodyParts3D 4.0 replacement mesh, each naming its licence. */
  attribution: z.array(z.string()).optional(),
  budgets: z.object({ total: z.object({
    maxBytes: z.number(), maxTriangles: z.number(), targetBytes: z.number(), targetTriangles: z.number(),
  }) }),
});

/** Z-Anatomy attribution (CC BY-SA 4.0, share-alike), the manifest's changes and the model's own licence. */
export function staticCopyright(manifest: { output: string; changes: string; attribution?: string[] }): string {
  return [
    'Z-Anatomy — The open source atlas of anatomy, CC BY-SA 4.0',
    '(https://github.com/LluisV/Z-Anatomy), derived from BodyParts3D, © The Database Center',
    'for Life Science (CC BY-SA 2.1 Japan as stated by Z-Anatomy; BodyParts3D is now',
    'CC BY 4.0, https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html).',
    ...(manifest.attribution ?? []),
    `Changes for Atlas: ${manifest.changes}`,
    `Static meshes; no rig, weights, fibres or attachment sites. ${manifest.output} is licensed`,
    'CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).',
  ].join('\n');
}
const frameSchema = z.object({ floorY: z.number(), statureM: z.number() });

interface Cloud {
  name: string;
  role: unknown;
  points: vec3[];
  faces: vec3[];
  u: number[];
  closed: boolean;
}

export async function optimizeStatic(
  root: string, topic: string, io: NodeIO, document: Document, compression: typeof EXTMeshoptCompression,
) {
  const cache = resolve(root, 'cache');
  const manifest = manifestSchema.parse(JSON.parse(await readFile(resolve(root, topic, 'manifest.json'), 'utf8')));
  const frame = frameSchema.parse(JSON.parse(await readFile(resolve(root, topic, 'organs.json'), 'utf8')));
  const expected = new Set(manifest.expectedNodes);
  function verify(doc: Document) {
    const nodes = doc.getRoot().listNodes();
    if (nodes.length !== expected.size || new Set(nodes.map(n => n.getName())).size !== expected.size)
      throw new Error('Static node count/uniqueness');
    if (doc.getRoot().listSkins().length || doc.getRoot().listAnimations().length)
      throw new Error('Static region has rig/animation');
    for (const n of nodes) {
      const mesh = n.getMesh();
      if (!expected.has(n.getName()) || !mesh || n.getSkin()) throw new Error(`Unexpected static node ${n.getName()}`);
      const role = n.getExtras().role;
      for (const p of mesh.listPrimitives()) {
        const pos = p.getAttribute('POSITION');
        if (!pos?.getArray()) throw new Error('Missing positions');
        for (const s of ['JOINTS_0', 'WEIGHTS_0', '_FIBRE'])
          if (p.getAttribute(s)) throw new Error(`Static ${n.getName()} carries ${s}`);
        if (role === 'tube') {
          const u = p.getAttribute('_U');
          if (!u || u.getCount() !== pos.getCount()) throw new Error(`Missing tube _U: ${n.getName()}`);
          let lo = Infinity, hi = -Infinity;
          for (let i = 0; i < u.getCount(); i++) {
            const x = u.getScalar(i);
            if (!Number.isFinite(x) || x < 0 || x > 1) throw new Error('Invalid tube station');
            lo = Math.min(lo, x); hi = Math.max(hi, x);
          }
          if (lo > .001 || hi < .999) throw new Error(`Tube _U endpoints: ${n.getName()}`);
        }
        for (const s of p.listSemantics()) {
          const array = p.getAttribute(s)?.getArray();
          if (!array) throw new Error(`Missing static attribute ${n.getName()} ${s}`);
          for (const v of array) if (!Number.isFinite(v)) throw new Error(`Nonfinite ${n.getName()} ${s}`);
        }
      }
    }
  }
  for (const n of document.getRoot().listNodes()) {
    const mesh = n.getMesh();
    if (!mesh) continue;
    if (typeof n.getExtras().closed !== 'boolean') throw new Error(`Missing closed ${n.getName()}`);
    mesh.setExtras({ ...n.getExtras() });
    for (const p of mesh.listPrimitives()) {
      p.setAttribute('TEXCOORD_0', null);
      if (n.getName() === 'skin-wire') p.setAttribute('NORMAL', null);
      const u = p.getAttribute('_U');
      if (u) {
        const array = u.getArray();
        if (!array) throw new Error(`Missing tube stations: ${n.getName()}`);
        u.setArray(new Float32Array(Array.from(array, v => Math.round(v * 32768) / 32768)));
      }
    }
  }
  verify(document);
  await document.transform(weld(), reorder({ encoder: MeshoptEncoder }), quantize({
    pattern: /^(POSITION|NORMAL)$/, quantizePosition: 16, quantizeNormal: 12,
  }), prune({ keepLeaves: true, keepAttributes: true }));
  document.createExtension(compression).setRequired(true).setEncoderOptions({ method: compression.EncoderMethod.QUANTIZE });
  document.getRoot().getAsset().copyright = staticCopyright(manifest);
  const bytes = await io.writeBinary(document);
  const decoded = await io.readBinary(bytes);
  verify(decoded);
  await decoded.transform(dequantize());
  const clouds: Cloud[] = [];
  const primitiveCounts = new Map<string, number>();
  for (const n of decoded.getRoot().listNodes()) {
    const mesh = n.getMesh();
    if (!mesh) throw new Error(`Missing decoded mesh ${n.getName()}`);
    const closed = mesh.getExtras().closed;
    if (typeof closed !== 'boolean') throw new Error(`Missing decoded closed ${n.getName()}`);
    const m = n.getWorldMatrix(), points: vec3[] = [], faces: vec3[] = [], u: number[] = [];
    const primitives = mesh.listPrimitives();
    primitiveCounts.set(n.getName(), primitives.length);
    for (const p of primitives) {
      const pos = p.getAttribute('POSITION'), offset = points.length;
      if (!pos) throw new Error(`Missing decoded positions ${n.getName()}`);
      const stations = p.getAttribute('_U');
      for (let i = 0; i < pos.getCount(); i++) {
        const v: vec3 = [0, 0, 0];
        pos.getElement(i, v);
        points.push([
          m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
          m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
          m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14],
        ]);
        if (stations) u.push(stations.getScalar(i));
      }
      const ix = p.getIndices()?.getArray();
      if (!ix) throw new Error(`Missing decoded indices ${n.getName()}`);
      for (let i = 0; i < ix.length; i += 3) {
        const a = ix[i], b = ix[i + 1], c = ix[i + 2];
        if (a === undefined || b === undefined || c === undefined) throw new Error(`Incomplete triangle ${n.getName()}`);
        faces.push([a + offset, b + offset, c + offset]);
      }
    }
    clouds.push({ name: n.getName(), role: n.getExtras().role, points, faces, u, closed });
  }
  const shell = clouds.find(n => n.name === 'skin-outline');
  if (!shell || shell.points.length === 0) throw new Error('Missing skin-outline points');
  const ys = shell.points.map(p => p[1]);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  if (Math.abs(minY - frame.floorY) > .003 || Math.abs(maxY - minY - frame.statureM) > .003)
    throw new Error('Static coordinate/floor/stature drift');
  for (const n of clouds) {
    const x = n.points.reduce((s, p) => s + p[0], 0) / n.points.length;
    if (n.name.endsWith('.l') && x <= 0 || n.name.endsWith('.r') && x >= 0) throw new Error('Side mismatch ' + n.name);
  }
  const table = clouds.map(n => {
    const primitives = primitiveCounts.get(n.name);
    if (primitives === undefined) throw new Error(`Missing primitive count ${n.name}`);
    return { node: n.name, role: n.role, triangles: n.faces.length, primitives, closed: n.closed, skinned: false };
  });
  const triangles = table.reduce((s, n) => s + n.triangles, 0), b = manifest.budgets.total;
  if (bytes.byteLength > b.maxBytes || triangles > b.maxTriangles) throw new Error('Hard budget exceeded');
  if (bytes.byteLength > b.targetBytes || triangles > b.targetTriangles) throw new Error('Soft budget exceeded');
  const wire = table.find(n => n.node === 'skin-wire');
  if (!wire || wire.triangles < 3000 || wire.triangles > 5000) throw new Error('Wire triangle range');
  const output = resolve(root, '../../public/models', manifest.output);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, bytes);
  await writeFile(resolve(cache, `${topic}-decoded.json`), JSON.stringify(clouds));
  for (const e of decoded.getRoot().listExtensionsUsed()) if (e.extensionName === 'EXT_meshopt_compression') e.dispose();
  for (const mesh of decoded.getRoot().listMeshes()) for (const p of mesh.listPrimitives()) p.setAttribute('_U', null);
  await decoded.transform(prune({ keepLeaves: true }));
  const auditBuffer = decoded.createBuffer('audit');
  for (const a of decoded.getRoot().listAccessors()) a.setBuffer(auditBuffer);
  for (const buffer of decoded.getRoot().listBuffers()) if (buffer !== auditBuffer) buffer.dispose();
  await io.write(resolve(cache, `${topic}-audit.glb`), decoded);
  const summary = {
    output, bytes: bytes.byteLength, triangles, nodeCount: table.length,
    drawCalls: table.reduce((s, n) => s + n.primitives, 0), sha256: createHash('sha256').update(bytes).digest('hex'),
    nodes: table, rig: false, extensions: ['KHR_mesh_quantization', 'EXT_meshopt_compression'],
    coordinateCheck: { minY, maxY, statureM: maxY - minY },
  };
  await writeFile(resolve(cache, `${topic}-optimize-stats.json`), JSON.stringify(summary, null, 2) + '\n');
  console.table(table);
  console.log(JSON.stringify(summary));
}

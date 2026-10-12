/** Optimize the Blender GLB and verify engine-facing geometry and skin data. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { NodeIO, type vec3 } from '@gltf-transform/core';
import { weld, quantize, reorder, prune } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { repairExportedSkin } from './repair_exported_skin.ts';

function required<T>(value: T | null | undefined, label: string): T {
  if (value === null || value === undefined) throw new Error(`Missing ${label}`);
  return value;
}

interface Part {
  id: string;
  exportGroup?: string;
  sides: string;
  exportTriangleCap?: number;
  triangleCap?: number;
}
interface Manifest {
  parts: Part[];
  expectedNodes: string[];
  skinNodes: string[];
  budgets: { total: { maxBytes: number; maxTriangles: number; targetBytes: number; targetTriangles: number } };
}
interface Rig {
  joints: { name: string; node: string; position: vec3; axes: Record<string, vec3> }[];
  units: string;
  coordinates: { up: string; front: string; left: string };
  coordinateCheck: { sternum: vec3 };
  floorY: number;
  sourceChestCentre: vec3;
}

const require = createRequire(import.meta.url);
// extensions is already an installed dependency of functions; no package changes.
const extensionPath = require.resolve('@gltf-transform/extensions', {
  paths: [dirname(require.resolve('@gltf-transform/functions'))],
});
const { ALL_EXTENSIONS, EXTMeshoptCompression } = await import(pathToFileURL(extensionPath).href) as typeof import('@gltf-transform/extensions');
const root = dirname(fileURLToPath(import.meta.url));
const cache = resolve(root, 'cache');
const topicIndex = process.argv.indexOf('--topic');
const topic = topicIndex < 0 ? 'chest' : process.argv[topicIndex + 1];
if (!topic || !['chest','back','shoulders','arms','legs','core'].includes(topic)) throw new Error('Invalid --topic');
const output = resolve(root, `../../public/models/muscles-${topic}.glb`);
const manifest: Manifest = JSON.parse(await readFile(resolve(root, `${topic}/manifest.json`), 'utf8'));
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder,
});
const document = await io.read(resolve(cache, `${topic}-raw.glb`));
const expected = manifest.parts.flatMap((p) =>
  p.exportGroup ? [p.exportGroup] : p.sides === 'bilateral' ? [p.id + '.l', p.id + '.r'] : [p.id]);
const uniqueExpected = new Set<string>([...expected, ...manifest.skinNodes]);
const rig: Rig = JSON.parse(await readFile(resolve(root, `${topic}/rig.json`), 'utf8'));
const expectedNodes = new Set<string>(manifest.expectedNodes);
for (const name of [...uniqueExpected, `${topic}-rig`, ...rig.joints.map((j) => j.node)]) {
  if (!expectedNodes.has(name)) throw new Error(`Manifest node allowlist incomplete: ${name}`);
}
function verifyNodes(doc: typeof document) {
  const names = doc.getRoot().listNodes().map((n) => n.getName());
  for (const name of names) if (!expectedNodes.has(name)) throw new Error(`Unexpected node: ${name}`);
  if (new Set(names).size !== names.length) throw new Error('Duplicate node names');
  for (const name of expectedNodes) if (!names.includes(name)) throw new Error(`Missing node: ${name}`);
}
verifyNodes(document);
const meshNodes = document.getRoot().listNodes().filter((n) => n.getMesh());
if (meshNodes.length !== uniqueExpected.size) throw new Error(`Expected ${uniqueExpected.size} mesh nodes, found ${meshNodes.length}`);
for (const name of uniqueExpected) {
  if (!meshNodes.some((n) => n.getName() === name)) throw new Error(`Missing node: ${name}`);
}
for (const node of meshNodes) {
  const mesh = required(node.getMesh(), `${node.getName()}: mesh`);
  // Engine reads mesh extras; Blender object properties can initially be node extras.
  const closed = node.getExtras().closed ?? mesh.getExtras().closed;
  if (typeof closed !== 'boolean') throw new Error(`Missing closedness: ${node.getName()}`);
  const extras = node.getExtras();
  if (manifest.skinNodes.includes(node.getName()) && node.getName() !== 'skin-outline') {
    delete extras.sourceNodes; extras.sourceNode = 'skin-outline'; node.setExtras(extras);
  }
  const context = Object.fromEntries(['includesHands','wristOpening','renderIntent','rigidJoint','sourceNode']
    .filter((key) => extras[key] !== undefined).map((key) => [key, extras[key]]));
  mesh.setExtras({ ...mesh.getExtras(), closed, role: extras.role, layer: extras.layer, ...context });
  // Schematic edges and opaque context do not consume source UVs.
  if (node.getExtras().role === 'skin') for (const primitive of mesh.listPrimitives()) {
    primitive.setAttribute('TEXCOORD_0', null);
    if (node.getName() === 'skin-wire') primitive.setAttribute('NORMAL', null);
  }
  const skin = node.getSkin();
  if (!skin) throw new Error(`Unskinned mesh: ${node.getName()}`);
  for (const primitive of mesh.listPrimitives()) {
    const count = required(primitive.getAttribute('POSITION'), `${node.getName()}: POSITION`).getCount();
    for (const semantic of ['JOINTS_0', 'WEIGHTS_0']) {
      if (primitive.getAttribute(semantic)?.getCount() !== count) throw new Error(`${node.getName()}: missing ${semantic}`);
    }
    const muscle = ['region', 'neighbour'].includes(String(node.getExtras().role));
    if (muscle) {
      for (const semantic of ['_U', '_FIBRE', 'TEXCOORD_0']) {
        if (primitive.getAttribute(semantic)?.getCount() !== count) throw new Error(`${node.getName()}: missing ${semantic}`);
      }
      const u = required(primitive.getAttribute('_U'), `${node.getName()}: _U`);
      const fibre = required(primitive.getAttribute('_FIBRE'), `${node.getName()}: _FIBRE`);
      const vector: number[] = [];
      let min = Infinity, max = -Infinity;
      for (let i = 0; i < count; i++) {
        const value = u.getScalar(i);
        min = Math.min(min, value); max = Math.max(max, value);
        fibre.getElement(i, vector);
        if (!Number.isFinite(value) || value < -1e-5 || value > 1.00001 || Math.abs(Math.hypot(...vector) - 1) > .002) {
          throw new Error(`${node.getName()}: invalid fibre parameter at vertex ${i}`);
        }
      }
      if (min > .001 || max < .999) throw new Error(`${node.getName()}: _U must span 0–1`);
    }
    const weights = required(primitive.getAttribute('WEIGHTS_0'), `${node.getName()}: WEIGHTS_0`);
    const joints = required(primitive.getAttribute('JOINTS_0'), `${node.getName()}: JOINTS_0`);
    const weight: number[] = [], joint: number[] = [];
    for (let i = 0; i < count; i++) {
      weights.getElement(i, weight); joints.getElement(i, joint);
      if (weight.some((v) => !Number.isFinite(v) || v < 0) || Math.abs(weight.reduce((a,b) => a+b,0)-1) > .002) {
        throw new Error(`${node.getName()}: invalid skin weights`);
      }
      if (joint.some((v) => !Number.isInteger(v) || v < 0 || v >= skin.listJoints().length)) {
        throw new Error(`${node.getName()}: invalid skin joint index`);
      }
    }
  }
}
for (const joint of rig.joints) {
  const exportedJoint = document.getRoot().listNodes().find((n) => n.getName() === joint.node);
  if (!exportedJoint) throw new Error(`Missing joint: ${joint.name}`);
  const matrix = exportedJoint.getWorldMatrix();
  const position: vec3 = [matrix[12],matrix[13],matrix[14]];
  if (Math.hypot(...position.map((v,i) => v-required(joint.position[i], `${joint.name}: position ${i}`))) > .0001) throw new Error(`Joint position mismatch: ${joint.name}`);
  console.log('RIG POSITION',joint.name,JSON.stringify(position));
  for (const vector of Object.values(joint.axes)) {
    if (Math.abs(Math.hypot(...vector)-1) > .001) throw new Error(`Invalid axis: ${joint.name}`);
  }
}
// New regions carry more named muscles than chest. Keep custom accessors float32,
// but remove sub-display precision before lossless meshopt encoding. Binary-grid
// rounding avoids wasting bytes on noisy mantissas; directions remain unit within
// 0.0003 and fibre endpoints stay exactly 0/1. Chest retains its original bytes.
if (topic !== 'chest') {
  const rounded = new Set<unknown>();
  for (const node of meshNodes) for (const primitive of required(node.getMesh(), 'mesh').listPrimitives()) {
    for (const [semantic, grid] of [['_U',topic === 'legs' ? 4096 : 32768],['_FIBRE',4096],['TEXCOORD_0',topic === 'legs' ? 512 : 8192]] as const) {
      const attribute = primitive.getAttribute(semantic);
      if (!attribute || rounded.has(attribute)) continue;
      const values = required(attribute.getArray(), semantic);
      attribute.setArray(new Float32Array(Array.from(values, (v) => Math.round(v*grid)/grid)));
      rounded.add(attribute);
    }
  }
}
await document.transform(
  weld(),
  reorder({ encoder: MeshoptEncoder }),
  quantize({ pattern: /^(POSITION|NORMAL|TEXCOORD_\d+|WEIGHTS_\d+)$/,
    quantizePosition: 16, quantizeNormal: 12, quantizeTexcoord: 16, quantizeWeight: 16 }),
  prune({ keepLeaves: true, keepAttributes: true }),
);
// Final quantization and exported normal seams can add thin-shell pairs.
// Synchronize on the final bind geometry, without modifying region muscles.
for (const node of meshNodes.filter((n) => n.getExtras().role === 'skin')) {
  const skin=required(node.getSkin(), 'mannequin skin');
  const jointNames=skin.listJoints().map((j) => j.getName().replace(/^joint\./, ''));
  const worlds=skin.listJoints().map((j) => j.getWorldMatrix());
  const binds=required(skin.getInverseBindMatrices(), 'skin binds');
  const transform=(m:number[], p:vec3):vec3 => [0,1,2].map((i) =>
    required(m[i], 'matrix')*p[0]+required(m[i+4], 'matrix')*p[1]+required(m[i+8], 'matrix')*p[2]+required(m[i+12], 'matrix')) as vec3;
  for (const primitive of required(node.getMesh(), 'mannequin mesh').listPrimitives()) {
    const pos=required(primitive.getAttribute('POSITION'), 'skin positions');
    const wa=required(primitive.getAttribute('WEIGHTS_0'), 'skin weights');
    const ja=required(primitive.getAttribute('JOINTS_0'), 'skin indices');
    const encodeWeights=(values:number[]):number[] => {
      const rounded=values.map((v) => Math.round(v*65535));
      const largest=rounded.indexOf(Math.max(...rounded));
      rounded[largest]=required(rounded[largest], 'largest influence')+65535-rounded.reduce((a,b) => a+b,0);
      return rounded.map((v) => v/65535);
    };
    // Exact unit sums keep bind points independent of later weight changes.
    for (let i=0;i<wa.getCount();i++) {const w:number[]=[];wa.getElement(i,w);wa.setElement(i,encodeWeights(w));}
    const points:vec3[]=[],weights:Record<string,number>[]=[];
    for (let i=0;i<pos.getCount();i++) {
      const p:vec3=[0,0,0],w:number[]=[],j:number[]=[];pos.getElement(i,p);wa.getElement(i,w);ja.getElement(i,j);
      for (const a of [0,1,2] as const) p[a]=Math.fround(p[a]);
      for (let k=0;k<4;k++) w[k]=Math.fround(required(w[k], 'dequantized weight'));
      const out:vec3=[0,0,0],vector:Record<string,number>={};
      for (let k=0;k<4;k++) {
        const weight=required(w[k], 'weight'),joint=required(j[k], 'joint');
        if (!weight) continue;
        const bind:number[]=[];binds.getElement(joint,bind);
        const v=transform(required(worlds[joint], 'joint world'),transform(bind,p));
        for (const a of [0,1,2] as const) out[a]+=v[a]*weight;
        vector[required(jointNames[joint], 'joint name')]=weight;
      }
      points.push(out);weights.push(vector);
    }
    const indices=Array.from(required(primitive.getIndices()?.getArray(), 'skin triangles'));
    const faces:number[][]=[];for (let i=0;i<indices.length;i+=3) faces.push(indices.slice(i,i+3));
    const file=resolve(cache, `${topic}-${node.getName()}-shell-finalize.json`);
    await writeFile(file,JSON.stringify({points,faces,weights,joints:Object.fromEntries(rig.joints.map((j) => [j.name,j.position]))}));
    execFileSync('python3',[resolve(root,'finalize_shell.py'),file],{stdio:'inherit'});
    const repaired: {weights:Record<string,number>[]; stats:unknown}=JSON.parse(await readFile(file,'utf8'));
    for (let i=0;i<repaired.weights.length;i++) {
      const vector=required(repaired.weights[i], 'repaired weights');
      const entries=Object.entries(vector).sort(([a],[b]) => jointNames.indexOf(a)-jointNames.indexOf(b));
      wa.setElement(i,encodeWeights([0,1,2,3].map((k) => entries[k]?.[1] ?? 0)));
      ja.setElement(i,[0,1,2,3].map((k) => entries[k] ? jointNames.indexOf(required(entries[k], 'entry')[0]) : 0));
    }
    await writeFile(resolve(cache,`${topic}-${node.getName()}-shell-finalize-stats.json`),JSON.stringify(repaired.stats,null,2)+'\n');
  }
}
// Keep _U and _FIBRE float32: their engine units must survive quantization.
document.createExtension(EXTMeshoptCompression).setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
document.getRoot().getAsset().copyright = `Muscle and bone meshes: Z-Anatomy — The open source atlas of anatomy, CC BY-SA 4.0
(https://github.com/LluisV/Z-Anatomy), derived from BodyParts3D, © The Database Center
for Life Science (CC BY-SA 2.1 Japan as stated by Z-Anatomy; BodyParts3D is now
CC BY 4.0, https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html).
Changes for Atlas: structures selected per body region, simplified, re-rigged,
fibre and attachment data added. This model (muscles-${topic}.glb) is licensed
CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).`;
const bytes = await repairExportedSkin(io, await io.writeBinary(document), root, topic);
// Read the compressed bytes back with the same offline decoder used by the viewer.
const decoded = await io.readBinary(bytes);
verifyNodes(decoded);
coordinateCheck(decoded);
for (const node of decoded.getRoot().listNodes().filter((n) => n.getMesh())) {
  if (!['region', 'neighbour'].includes(String(node.getExtras().role))) continue;
  for (const primitive of required(node.getMesh(), `${node.getName()}: mesh`).listPrimitives()) {
    for (const semantic of ['_U', '_FIBRE', 'TEXCOORD_0', 'JOINTS_0', 'WEIGHTS_0']) {
      if (!primitive.getAttribute(semantic)) throw new Error(`${node.getName()}: decoded output lost ${semantic}`);
    }
    if (topic !== 'chest') {
      const u = required(primitive.getAttribute('_U'), '_U');
      const fibre = required(primitive.getAttribute('_FIBRE'), '_FIBRE');
      const weights = required(primitive.getAttribute('WEIGHTS_0'), 'WEIGHTS_0');
      const f: number[] = [], w: number[] = [];
      for (let i=0;i<u.getCount();i++) {
        fibre.getElement(i,f); weights.getElement(i,w);
        if (!Number.isFinite(u.getScalar(i)) || u.getScalar(i)<0 || u.getScalar(i)>1 || Math.abs(Math.hypot(...f)-1)>.0003 ||
            Math.abs(w.reduce((sum,value)=>sum+value,0)-1)>.002) throw new Error(`${node.getName()}: decoded fibre/weight precision failed`);
      }
    }

  }
}
const table = decoded.getRoot().listNodes().filter((n) => n.getMesh()).map((node) => {
  const mesh = required(node.getMesh(), `${node.getName()}: mesh`);
  const triangles = mesh.listPrimitives().reduce((sum,p) => sum + (p.getIndices()?.getCount() ?? required(p.getAttribute('POSITION'), `${node.getName()}: POSITION`).getCount()) / 3, 0);
  return { node: node.getName(), triangles, primitives: mesh.listPrimitives().length,
    closed: mesh.getExtras().closed, skinned: Boolean(node.getSkin()) };
});
for (const row of table) {
  if (manifest.skinNodes.includes(row.node) && row.node !== 'skin-outline') {
    if (row.node === 'skin-wire' && (row.triangles < 3000 || row.triangles > 5000)) throw new Error('skin-wire triangle range failed');
    continue;
  }
  const part = required(manifest.parts.find((p) => p.exportGroup === row.node || row.node === p.id || row.node === p.id+'.l' || row.node === p.id+'.r'), `${row.node}: manifest part`);
  const cap = part.exportTriangleCap ?? part.triangleCap;
  if (cap && row.triangles > cap) throw new Error(`${row.node}: ${row.triangles} triangles > cap ${cap}`);
}
const triangles = table.reduce((sum,r) => sum+r.triangles,0);
const budgets = manifest.budgets.total;
if (bytes.byteLength > budgets.maxBytes || triangles > budgets.maxTriangles) {
  throw new Error(`Hard budget exceeded: ${bytes.byteLength} bytes, ${triangles} triangles`);
}
if (bytes.byteLength > budgets.targetBytes || triangles > budgets.targetTriangles) {
  throw new Error(`Soft budget exceeded: ${bytes.byteLength} bytes / ${triangles} triangles`);
}
await mkdir(dirname(output), { recursive: true });
await writeFile(output, bytes);
// A dequantized audit copy lets Blender inspect the final compressed output offline.
const { dequantize } = await import('@gltf-transform/functions');
await decoded.transform(dequantize());
for (const extension of decoded.getRoot().listExtensionsUsed()) {
  if (extension.extensionName === 'EXT_meshopt_compression') extension.dispose();
}
// Blender's glTF importer rejects scalar custom attributes, so the audit copy carries geometry only.
for (const mesh of decoded.getRoot().listMeshes()) {
  for (const primitive of mesh.listPrimitives()) {
    for (const semantic of ['_U', '_FIBRE']) {
      const attribute = primitive.getAttribute(semantic);
      if (attribute) { primitive.setAttribute(semantic, null); attribute.dispose(); }
    }
  }
}
const auditBuffer = decoded.createBuffer('audit');
for (const accessor of decoded.getRoot().listAccessors()) accessor.setBuffer(auditBuffer);
for (const buffer of decoded.getRoot().listBuffers()) {
  if (buffer !== auditBuffer) buffer.dispose();
}
const auditPath = resolve(cache, `${topic}-audit.glb`);
await io.write(auditPath, decoded);
const audit = await io.read(auditPath);
for (const node of audit.getRoot().listNodes().filter((n) => n.getMesh())) {
  for (const primitive of required(node.getMesh(), `${node.getName()}: mesh`).listPrimitives()) {
    if (!primitive.getAttribute('POSITION')?.getArray()) throw new Error(`Audit copy lost geometry: ${node.getName()}`);
  }
}
const summary = { output, bytes: bytes.byteLength, triangles, nodeCount: decoded.getRoot().listNodes().length, drawCalls: table.reduce((sum, r) => sum + r.primitives, 0), nodes: table, extensions: ['KHR_mesh_quantization','EXT_meshopt_compression'] };
await writeFile(resolve(cache, `${topic}-optimize-stats.json`), JSON.stringify(summary,null,2)+'\n');
console.table(table);
console.log(`FINAL ${output}: ${bytes.byteLength.toLocaleString()} bytes (${(bytes.byteLength / 1e6).toFixed(3)} MB), ${triangles.toLocaleString()} triangles`);

function coordinateCheck(doc: typeof document) {
  const axes = [0, 1, 2] as const;
  const transform = (m: number[], p: vec3): vec3 => {
    const row = (i: number) => required(m[i], 'matrix component')*p[0]
      +required(m[i+4], 'matrix component')*p[1]+required(m[i+8], 'matrix component')*p[2]
      +required(m[i+12], 'matrix component');
    return [row(0), row(1), row(2)];
  };
  const clouds = new Map<string, vec3[]>();
  for (const node of doc.getRoot().listNodes().filter((n) => n.getMesh())) {
    const skin = required(node.getSkin(), `${node.getName()}: skin`);
    const worlds = skin.listJoints().map((j) => j.getWorldMatrix());
    const binds = required(skin.getInverseBindMatrices(), `${node.getName()}: inverse bind matrices`);
    const points: vec3[] = [];
    for (const primitive of required(node.getMesh(), `${node.getName()}: mesh`).listPrimitives()) {
      const pos = required(primitive.getAttribute('POSITION'), `${node.getName()}: POSITION`);
      const weights = required(primitive.getAttribute('WEIGHTS_0'), `${node.getName()}: WEIGHTS_0`);
      const joints = required(primitive.getAttribute('JOINTS_0'), `${node.getName()}: JOINTS_0`);
      for (let i=0;i<pos.getCount();i++) {
        const p: vec3=[0,0,0], w: number[]=[], j: number[]=[];
        pos.getElement(i,p); weights.getElement(i,w); joints.getElement(i,j);
        const out: vec3=[0,0,0];
        for (let k=0;k<4;k++) {
          const weight = required(w[k], `weight ${k}`);
          if (!weight) continue;
          const joint = required(j[k], `joint index ${k}`);
          const bind: number[]=[]; binds.getElement(joint,bind);
          const v=transform(required(worlds[joint], `joint matrix ${joint}`),transform(bind,p));
          for (const a of axes) out[a]+=v[a]*weight;
        }
        points.push(out);
      }
    }
    clouds.set(node.getName(),points);
  }
  const mean = (points: vec3[]): vec3 => {
    const average = (i: typeof axes[number]) => points.reduce((sum,p) => sum+p[i],0)/points.length;
    return [average(0), average(1), average(2)];
  };
  const skin = required(clouds.get('skin-outline'), 'skin-outline cloud');
  const minY=Math.min(...skin.map((p) => p[1])), maxY=Math.max(...skin.map((p) => p[1]));
  if (topic !== 'chest') {
    if (rig.units !== 'm' || rig.coordinates.up !== '+Y' || rig.coordinates.front !== '+Z' || rig.coordinates.left !== '+X' ||
        !(maxY-minY>1.4 && maxY-minY<2.2) || Math.abs(minY-rig.floorY)>.003) throw new Error('Decoded regional coordinate/scale/floor check failed');
    for (const [name, points] of clouds) {
      if (name.endsWith('.l') && mean(points)[0] <= 0) throw new Error(`Left side misplaced: ${name}`);
      if (name.endsWith('.r') && mean(points)[0] >= 0) throw new Error(`Right side misplaced: ${name}`);
    }
    console.log('DECODED REGIONAL COORDINATE CHECK', topic, maxY-minY, minY);
    return;
  }
  const clavicle=mean(required(clouds.get('clavicle.l'), 'clavicle.l cloud'));
  const spine=mean(required(clouds.get('thoracic-spine'), 'thoracic-spine cloud'));
  // Sternum is merged into thorax. The midline anterior thorax patch must still
  // lie at the source sternum centroid recorded by the independent build gate.
  const sternum=rig.coordinateCheck.sternum;
  const thorax=required(clouds.get('thorax'), 'thorax cloud');
  const nearest=Math.min(...thorax.map((p) => Math.hypot(...axes.map((i) => p[i]-sternum[i]))));
  if (rig.units !== 'm' || rig.coordinates.up !== '+Y' || rig.coordinates.front !== '+Z' || rig.coordinates.left !== '+X' ||
      !(maxY-minY>1.4 && maxY-minY<2.2) || clavicle[0]<=0 || sternum[2]<=spine[2] ||
      nearest>.025 || Math.abs(minY-rig.floorY)>.003) throw new Error('Decoded coordinate/scale/floor check failed');
  console.log('DECODED COORDINATE CHECK',JSON.stringify({unit:'m',up:'+Y',front:'+Z',left:'+X',sternum,spine,leftClavicle:clavicle,
    statureM:maxY-minY,floorY:minY,sourceChestCentre:rig.sourceChestCentre,sourceFloorY:minY+rig.sourceChestCentre[2]}));
}

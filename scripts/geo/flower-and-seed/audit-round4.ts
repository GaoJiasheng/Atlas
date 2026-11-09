/** Audit the actual meshopt deliverable, with round-3 assets kept outside git. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
const dir = process.argv[2] ?? '/tmp/flower-and-seed-round4';
const changed = new Set(['fig-cut','red-flower','nectar-bat']);
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const before = await io.read(`${dir}/before/flower-and-seed.glb`), after = await io.read('public/models/flower-and-seed.glb');
await before.transform(dequantize()); await after.transform(dequantize());
const retained: string[] = [];
function material(m: any) {
 const fields = ['BaseColorFactor','EmissiveFactor','EmissiveStrength','MetallicFactor','RoughnessFactor','NormalScale','OcclusionStrength','AlphaMode','AlphaCutoff','DoubleSided','Extras'];
 const result: Record<string,unknown> = Object.fromEntries(fields.map(k=>[k,m[`get${k}`]?.()]));
 for(const key of ['BaseColor','Normal','MetallicRoughness','Occlusion','Emissive']) {
  const tex = m[`get${key}Texture`](), info = m[`get${key}TextureInfo`]();
  result[key+'Texture'] = tex ? { image:hash(tex.getImage()),mime:tex.getMimeType(),info:Object.fromEntries(['TexCoord','WrapS','WrapT','MagFilter','MinFilter'].map(k=>[k,info[`get${k}`]()])) } : null;
 }
 return result;
}
for (const n of before.getRoot().listNodes()) {
 if(changed.has(n.getName())) continue;
 const q = after.getRoot().listNodes().find(x=>x.getName()===n.getName());
 assert(q, `${n.getName()} missing`);
 assert.deepEqual(q.getWorldMatrix(),n.getWorldMatrix(),`${n.getName()} frame`);
 assert.deepEqual(q.getExtras(),n.getExtras(),`${n.getName()} extras`);
 const mesh=n.getMesh(); if(!mesh)continue;
 const ps=mesh.listPrimitives(), qs=q.getMesh()!.listPrimitives();
 assert.equal(qs.length,ps.length);
 for(const [i,p] of ps.entries()) {
  const r=qs[i]!;
  assert.deepEqual(r.listSemantics(),p.listSemantics());
  for(const semantic of [...p.listSemantics(),'INDICES']) {
   const a = semantic==='INDICES' ? p.getIndices()! : p.getAttribute(semantic)!;
   const b = semantic==='INDICES' ? r.getIndices()! : r.getAttribute(semantic)!;
   const bytes=(v:any)=>new Uint8Array(v.getArray().buffer,v.getArray().byteOffset,v.getArray().byteLength);
   assert.equal(hash(bytes(a)),hash(bytes(b)),`${n.getName()} ${semantic}`);
  }
  assert.deepEqual(material(r.getMaterial()),material(p.getMaterial()),`${n.getName()} material`);
 }
 retained.push(n.getName());
}
// The accepted bat finish is retained byte-for-byte; only limb geometry changed.
const oldBat=before.getRoot().listMeshes().find(m=>m.getName()==='nectar-bat')!.listPrimitives()[0]!;
const newBat=after.getRoot().listMeshes().find(m=>m.getName()==='nectar-bat')!.listPrimitives()[0]!;
assert.deepEqual(material(newBat.getMaterial()),material(oldBat.getMaterial()),'Accepted bat coat/material drift');
assert.equal(hash(fs.readFileSync(`${dir}/before/parts.json`)),hash(fs.readFileSync('src/content/topics/flower-and-seed/data/parts.json')), 'parts.json changed (text or interactions)');
const metrics=JSON.parse(fs.readFileSync('scripts/geo/flower-and-seed/evidence/metrics.json','utf8'));
const bytes=fs.readFileSync('public/models/flower-and-seed.glb');
assert(bytes.length<=1_500_000); assert(metrics.totalTriangles<350_000);
const result={assetSha256:hash(bytes),retainedIdentical:retained,changed:[...changed],partsJsonByteIdentical:true,batFinishUnchanged:true,metrics};
fs.writeFileSync(`${dir}/regression-audit.json`,JSON.stringify(result,null,2)+'\n');
console.log(`${retained.length} untouched meshes: identical attributes, indices, transforms, extras, materials and embedded images. parts.json byte-identical. ${bytes.length} bytes; ${metrics.totalTriangles} triangles.`);

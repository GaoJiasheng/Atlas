/** Independent decoded-deliverable and editorial regression audit. */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
const dir='scripts/geo/flower-and-seed/evidence';
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const before=await io.read(`${dir}/round3-before/flower-and-seed.glb`), after=await io.read('public/models/flower-and-seed.glb');
await before.transform(dequantize()); await after.transform(dequantize());
const rebuilt=new Set(['nectar-bat','coconut','fern-fronds','fern-underside','fig-cut','red-flower','durian-flowers','ripe-figs','sea-almond-cut','moss-cushion']);
const hash=(v:Uint8Array)=>createHash('sha256').update(v).digest('hex');
const retained=[];
for(const m of before.getRoot().listMeshes()) {
 if(rebuilt.has(m.getName()))continue;
 const n=after.getRoot().listMeshes().find(n=>n.getName()===m.getName())!;
 const p=m.listPrimitives()[0]!,q=n.listPrimitives()[0]!;
 for(const key of p.listSemantics()) {
  const a=p.getAttribute(key)!.getArray()!,b=q.getAttribute(key)!.getArray()!;
  if(hash(new Uint8Array(a.buffer,a.byteOffset,a.byteLength))!==hash(new Uint8Array(b.buffer,b.byteOffset,b.byteLength)))throw Error(`${m.getName()}: changed ${key}`);
 }
 if(JSON.stringify(p.getIndices()!.getArray())!==JSON.stringify(q.getIndices()!.getArray()))throw Error(`${m.getName()}: changed indices`);
 const a=p.getMaterial()!, b=q.getMaterial()!;
 if(a.getRoughnessFactor()!==b.getRoughnessFactor() || JSON.stringify(a.getExtras())!==JSON.stringify(b.getExtras()))throw Error(`${m.getName()}: material drift`);
 for(const key of ['getBaseColorTexture','getNormalTexture','getMetallicRoughnessTexture'] as const) {
  const x=a[key]()?.getImage(),y=b[key]()?.getImage();
  if((x?hash(x):null)!==(y?hash(y):null))throw Error(`${m.getName()}: texture drift`);
 }
 retained.push(m.getName());
}
const live=JSON.parse(fs.readFileSync('src/content/topics/flower-and-seed/data/parts.json','utf8')), old=JSON.parse(fs.readFileSync(`${dir}/round3-before/parts.json`,'utf8'));
function strings(x:any,p=''):any[]{if(!x||typeof x!=='object')return [];if(typeof x.en==='string'&&typeof x.zh==='string')return [[p,x]];return Object.entries(x).flatMap(([k,v])=>strings(v,`${p}/${k}`));}
if(JSON.stringify(strings(live))!==JSON.stringify(strings(old)))throw Error('Editorial wording changed');
for(const k of ['sim','flows','animations','poses','views','presets','groups','spec','telemetry'])if(JSON.stringify(live[k])!==JSON.stringify(old[k]))throw Error(`${k} interaction drift`);
if(JSON.stringify(live.parts.map((p:any)=>[p.id,p.connects,p.explode,p.repeat]))!==JSON.stringify(old.parts.map((p:any)=>[p.id,p.connects,p.explode,p.repeat])))throw Error('Part identity or relationships changed');
fs.writeFileSync(`${dir}/round3-regression-audit.json`,JSON.stringify({assetSha256:hash(fs.readFileSync('public/models/flower-and-seed.glb')),retainedIdentical:retained,rebuilt:[...rebuilt],bilingualStringsUnchanged:strings(live).length,interactionsUnchanged:true},null,2)+'\n');
console.log(`Identical decoded meshes/materials: ${retained.length}; unchanged bilingual fields: ${strings(live).length}; interaction contract preserved.`);

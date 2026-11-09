/** Preserve accepted decoded surfaces and the complete teaching contract.
 * Optional baseline GLB and parts JSON paths; defaults to the Git HEAD read.
 * No Git writes. Counts include every authored primitive and instance. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {partsFile} from '../../../src/engines/space-scene/schema.ts';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
const original=process.argv[2]?fs.readFileSync(process.argv[2]):execFileSync('git',['show','HEAD:public/models/states-of-matter.glb'],{maxBuffer:4e6});
const oldParts=JSON.parse(process.argv[3]?fs.readFileSync(process.argv[3],'utf8'):execFileSync('git',['show','HEAD:src/content/topics/states-of-matter/data/parts.json'],{encoding:'utf8',maxBuffer:1e6}));
const current=JSON.parse(fs.readFileSync('src/content/topics/states-of-matter/data/parts.json','utf8'));assert.deepEqual(current,oldParts);
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}),shipped=fs.readFileSync(`public${current.model}`),before=await io.readBinary(original),after=await io.readBinary(shipped);await before.transform(dequantize());await after.transform(dequantize());
const kept=[];for(const node of before.getRoot().listNodes()){
 if(!node.getMesh()||['sponge','ice-cube'].includes(node.getName()))continue;
 const next=after.getRoot().listNodes().find(n=>n.getName()===node.getName());assert.ok(next);assert.deepEqual(next.getWorldMatrix(),node.getWorldMatrix());
 for(const [i,p]of node.getMesh().listPrimitives().entries()){
  const q=next.getMesh().listPrimitives()[i];assert.deepEqual(q.getIndices().getArray(),p.getIndices().getArray());
  for(const name of p.listSemantics())assert.deepEqual(q.getAttribute(name).getArray(),p.getAttribute(name).getArray(),`${node.getName()} ${name}`);
  const a=p.getMaterial(),b=q.getMaterial();assert.deepEqual([b.getBaseColorFactor(),b.getRoughnessFactor(),b.getMetallicFactor(),b.getAlphaMode(),b.getExtras()],[a.getBaseColorFactor(),a.getRoughnessFactor(),a.getMetallicFactor(),a.getAlphaMode(),a.getExtras()]);
 }kept.push(node.getName());
}
function metrics(doc,bytes){const perPart={};for(const part of partsFile.parse(current).parts){let triangles=0,draws=0;if(part.mesh){const mesh=doc.getRoot().listNodes().find(n=>n.getName()===part.mesh).getMesh();for(const p of mesh.listPrimitives()){triangles+=p.getIndices().getCount()/3;draws++;}}else for(const p of partPieces(part)){draws++;if(!p.lines)triangles+=(p.geometry.index?.count??p.geometry.getAttribute('position').count)/3*(p.matrices?.length??1);p.geometry.dispose();}perPart[part.id]={triangles,draws};}return {bytes,triangles:Object.values(perPart).reduce((s,p)=>s+p.triangles,0),draws:Object.values(perPart).reduce((s,p)=>s+p.draws,0),heroes:{ice:perPart['ice-cube'],sponge:perPart.sponge}};}
const normalHash=createHash('sha256');
for(const id of [...kept].sort()){const n=before.getRoot().listNodes().find(n=>n.getName()===id);normalHash.update(id);for(const p of n.getMesh().listPrimitives()){const a=p.getAttribute('NORMAL').getArray();normalHash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}}
const acceptedNormalSha256=normalHash.digest('hex');
const result={acceptedNormalSha256,acceptedMeshesPreserved:kept,allPartDataIdentical:true,before:metrics(before,original.length),after:metrics(after,shipped.length),sha256:createHash('sha256').update(shipped).digest('hex')};assert.ok(result.after.bytes<=1500000);assert.ok(result.after.triangles<=350000);fs.writeFileSync('scripts/geo/states-of-matter/evidence/polish-audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));

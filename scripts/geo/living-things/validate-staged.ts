/** Decoded model contract check; --staging checks the optional offline candidate. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Box3,Vector3,Matrix4} from 'three';
import {partsFileBase} from '../../../src/engines/space-scene/schema';
import {partBounds} from '../../../src/engines/space-scene/lib/parts';
const staged=process.argv.includes('--staging');
const file=partsFileBase.parse(JSON.parse(readFileSync(staged?'/tmp/atlas-living-polish/parts.json':'src/content/topics/living-things/data/parts.json','utf8')));
const baseline=process.argv.indexOf('--baseline');
if(baseline>=0){
 const previous=partsFileBase.parse(JSON.parse(readFileSync(process.argv[baseline+1]!,'utf8')));
 assert.deepEqual(file.parts.map(p=>p.id),previous.parts.map(p=>p.id));
 assert.deepEqual(file.sim,previous.sim);
 assert.deepEqual(file.presets,previous.presets);
}
await MeshoptDecoder.ready;
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(staged?'/tmp/atlas-living-polish/living-things.glb':'public/models/living-things.glb');
await doc.transform(dequantize());
let total=0;
for(const part of file.parts.filter(p=>p.mesh)){
 const node=doc.getRoot().listNodes().find(n=>n.getName()===part.mesh);assert(node,part.id);
 const primitive=node.getMesh()!.listPrimitives()[0]!,p=primitive.getAttribute('POSITION')!,n=primitive.getAttribute('NORMAL')!,c=primitive.getAttribute('COLOR_0')!,ix=primitive.getIndices()!;
 assert(p&&n&&c&&ix,`${part.id} complete vertex attributes`);total+=ix.getCount()/3;
 const actual=new Box3(),world=new Matrix4().fromArray(node.getWorldMatrix());
 for(let i=0;i<p.getCount();i++){
  const a=p.getElement(i,[0,0,0]);actual.expandByPoint(new Vector3(a[0],a[1],a[2]).applyMatrix4(world));
  assert(n.getElement(i,[0,0,0]).every(Number.isFinite),`${part.id} finite normal`);
 }
 const proxy=partBounds(part)!;
 for(const side of ['min','max']as const){
  // X/Z proxy intentionally symmetrizes the footprint about its sort anchor.
  for(let k=0;k<3;k++)assert(side==='min'?actual[side].getComponent(k)>=proxy[side][k]!-3e-6:actual[side].getComponent(k)<=proxy[side][k]!+3e-6,`${part.id}: ${side}[${k}] outside simulation envelope`);
 }
 assert(Math.abs(actual.min.y-.015)<.00002,`${part.id} floor`);
 assert(actual.max.y-actual.min.y<=.12,`${part.id} height`);
 for(const k of [0,2])assert(Math.max(actual.max.getComponent(k)-part.primitive!.at[k]!,part.primitive!.at[k]!-actual.min.getComponent(k))<=.03621,`${part.id} footprint`);
}
console.log(`${staged?'Candidate':'Live model'}: ${file.parts.length} parts; ${baseline>=0?'part IDs/order, sorting and presets identical to baseline; ':''}${total} sculpted triangles; all decoded meshes fit their simulation envelopes and case cells.`);

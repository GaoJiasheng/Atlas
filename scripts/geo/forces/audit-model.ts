/** Runtime geometry/behavior audit, using actual meshopt decoding and engine builders. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Vector3,Matrix4,Euler} from 'three';
import {dequantize} from '@gltf-transform/functions';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {lerpTransform,toTransform} from '../../../src/engines/space-scene/lib/pose';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {eachPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
const baseline=JSON.parse(fs.readFileSync('scripts/geo/forces/evidence/baseline/parts.json','utf8'));
const raw=JSON.parse(fs.readFileSync('src/content/topics/forces/data/parts.json','utf8'));
const data=partsFile.parse(raw);
assert.deepEqual(raw.parts.map((p:{id:string})=>p.id),baseline.parts.map((p:{id:string})=>p.id));
const poses=structuredClone(raw.poses),sim=structuredClone(raw.sim);
for(const id of ['brake-light','brake-firm'])delete poses[id]['brake-cable'];
for(const binding of sim.bind)if(binding.control==='squeeze'&&Array.isArray(binding.part))binding.part=binding.part.filter((id:string)=>id!=='brake-cable');
assert.deepEqual(poses,baseline.poses,'original poses changed');assert.deepEqual(sim,baseline.sim,'original force model or bindings changed');
for(const key of ['groups','views','presets','spec','telemetry','units'])assert.deepEqual(raw[key],baseline[key],`behavior changed: ${key}`);
const wheels=data.parts.find(p=>p.id==='car-wheels')!;assert(!wheels.mesh);const pcs=eachPieces(wheels);
for(const pc of pcs){assert.equal(pc.matrices?.length,4);assert.equal(pc.pivots?.length,4);pc.geometry.dispose();}
await MeshoptDecoder.ready;
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(`public${data.model}`);
await doc.transform(dequantize());
const scene=doc.getRoot().getDefaultScene()??doc.getRoot().listScenes()[0]!;
const names=new Set(scene.listChildren().map(n=>n.getName()));
for(const p of data.parts.filter(p=>p.mesh))assert(names.has(p.mesh!),`missing from default scene: ${p.id}`);
for(const node of doc.getRoot().listNodes())for(const prim of node.getMesh()?.listPrimitives()??[]){for(const semantic of ['POSITION','NORMAL']){const array=prim.getAttribute(semantic)?.getArray();assert(array&&Array.from(array).every(Number.isFinite),`${node.getName()} ${semantic}`);}}
const brake=doc.getRoot().listNodes().find(n=>n.getName()==='brake-caliper');
if(raw.parts.find((p:{id:string,mesh?:string})=>p.id==='brake-caliper')?.mesh&&brake){
 const prim=brake.getMesh()!.listPrimitives()[0]!,position=prim.getAttribute('POSITION')!,colors=prim.getAttribute('COLOR_0')!,world=new Matrix4().fromArray(brake.getWorldMatrix());
 const pads:number[]=[];
 for(let i=0;i<position.getCount();i++){
  const v=new Vector3().fromArray(position.getElement(i,[0,0,0])).applyMatrix4(world),c=colors.getElement(i,[0,0,0]);
  if(Math.max(...c)<.06&&v.x>.539&&v.x<.581&&v.y>.457&&v.y<.470)pads.push(Math.abs(v.z+.12));
 }
 assert(pads.length>10,'no actual rubber pad vertices');
 const inner=Math.min(...pads),firm=raw.poses['brake-firm']['brake-caliper'].scale[2],light=raw.poses['brake-light']['brake-caliper'].scale[2];
 assert(inner*firm<=.0095+.0001,'firm pose leaves pads clear of actual rim');
 assert(inner*light>=.0090,'light pose penetrates rim excessively');
 console.log(JSON.stringify({actualPadInnerRest:inner,actualLight:inner*light,actualFirm:inner*firm,rimOuterZ:.0095}));
}
const cable=doc.getRoot().listNodes().find(n=>n.getName()==='brake-cable')!;
const cp=cable.getMesh()!.listPrimitives()[0]!,ca=cp.getAttribute('POSITION')!,cc=cp.getAttribute('COLOR_0')!,cw=new Matrix4().fromArray(cable.getWorldMatrix());
const endpoints=[new Vector3(.815,.52,-.075),new Vector3(.561,.544,-.154)].map(nominal=>{
 const sum=new Vector3();let count=0;
 for(let i=0;i<ca.getCount();i++)if(cc.getElement(i,[0,0,0])[0]!>.4){const v=new Vector3().fromArray(ca.getElement(i,[0,0,0])).applyMatrix4(cw);if(v.distanceTo(nominal)<.014){sum.add(v);count++;}}
 assert(count>10);return sum.divideScalar(count);
});
let cableError=0,cableSamples=0;
const states=[undefined,'brake-light','brake-firm'] as const;
for(const from of states)for(const to of states){if(from===to)continue;
 for(let i=0;i<=40;i++){
  const t=i/40,p=lerpTransform(toTransform(from?raw.poses[from]['brake-cable']:undefined),toTransform(to?raw.poses[to]['brake-cable']:undefined),t),pv=new Vector3(...p.pivot!);
  const rotation=new Matrix4().makeRotationFromEuler(new Euler(...p.rotation.map(v=>v*Math.PI/180) as [number,number,number],'XYZ')).scale(new Vector3(...p.scale));
  const affine=new Matrix4().makeTranslation(...pv.toArray()).multiply(rotation).multiply(new Matrix4().makeTranslation(...pv.clone().negate().toArray()));
  const fixed=endpoints[0]!.clone().applyMatrix4(affine),moving=endpoints[1]!.clone().applyMatrix4(affine),target=endpoints[1]!.clone();
  const caliper=lerpTransform(toTransform(from?raw.poses[from]['brake-caliper']:undefined),toTransform(to?raw.poses[to]['brake-caliper']:undefined),t);
  target.z=-.12+(target.z+.12)*caliper.scale[2];
  cableError=Math.max(cableError,fixed.distanceTo(endpoints[0]!),moving.distanceTo(target));cableSamples++;
 }
}
assert(cableError<.0001,'cable ferrule leaves stop during pose tween');console.log(JSON.stringify({decodedFerrules:endpoints.map(p=>p.toArray()),cableSamples,maxCableGapMm:cableError*1000,interpolation:'engine lerpTransform'}));
assert(fs.statSync(`public${data.model}`).size<=1_500_000);
console.log('PASS: part ids, original lesson state and teaching numbers preserved; cable poses added; four coherent wheel pivots per material; every GLB part in default scene; finite decoded positions/normals; GLB below1.5 MB.');

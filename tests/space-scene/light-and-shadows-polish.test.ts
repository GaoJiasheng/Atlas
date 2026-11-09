/** Verify the geometry and data the renderer actually consumes. */
import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Vector3,Matrix4} from 'three';
import {partsFile} from '../../src/engines/space-scene/schema';
import {partPieces} from '../../src/engines/space-scene/stages/model3d/geometry';
import {projectShadow} from '../../src/engines/space-scene/lib/sim/shadow';
import {evaluateSim} from '../../src/engines/space-scene/lib/sim';
import {resolveSimValues} from '../../src/engines/space-scene/lib/sim/controls';
const data=partsFile.parse(JSON.parse(fs.readFileSync('src/content/topics/light-and-shadows/data/parts.json','utf8')));
const before=JSON.parse(fs.readFileSync('scripts/geo/light-and-shadows/before-rebuild.json','utf8'));
const part=(id:string)=>data.parts.find(p=>p.id===id)!;
function vertices(id:string){return partPieces(part(id)).flatMap(piece=>(piece.matrices??[new Matrix4()]).flatMap(m=>Array.from({length:piece.geometry.getAttribute('position').count},(_,i)=>new Vector3().fromBufferAttribute(piece.geometry.getAttribute('position'),i).applyMatrix4(m).add(new Vector3(...part(id).primitive!.at)))));}
describe('light courtyard realism rebuild',()=>{
 it('preserves every part id, chapter mechanism and teaching input',()=>{
  expect(data.parts.map(p=>p.id)).toEqual(before.parts.map((p:{id:string})=>p.id));
  expect(data.sim).toEqual(partsFile.parse(before).sim);
 });
 it('keeps the real pole exactly 1 m above the receiving pavement and 5 cm thick',()=>{
  const points=vertices('pole');expect(Math.max(...points.map(p=>p.y))).toBeCloseTo(1.05,5);
  const shaft=part('pole').primitive!;expect(shaft.kind).toBe('lathe');
  if(shaft.kind==='lathe')expect(Math.max(...shaft.profile.map(p=>p[0]))).toBe(.025);
 });
 it('seats the wooden shaft on the blind socket floor and the wall foundation on ground',()=>{
  const p=part('pole'),shaft=partPieces(p).find(piece=>piece.slot===0)!;
  const a=shaft.geometry.getAttribute('position');expect(Math.min(...Array.from({length:a.count},(_,i)=>a.getY(i)))+p.primitive!.at[1]).toBeCloseTo(.08,5);
  expect(Math.min(...vertices('north-arrow').map(p=>p.y))).toBeCloseTo(0,5);
 });
 it('decodes the shipped mesh and keeps every receiver vertex at or below y=.05',async()=>{
  await MeshoptDecoder.ready;const file='public/models/light-and-shadows.glb';expect(fs.statSync(file).size).toBeLessThan(1_500_000);
  const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(file);await doc.transform(dequantize());
  const node=doc.getRoot().listNodes().find(n=>n.getName()==='courtyard')!,p=node.getMesh()!.listPrimitives()[0]!,positions=p.getAttribute('POSITION')!,world=new Matrix4().fromArray(node.getWorldMatrix());
  const points=Array.from({length:positions.getCount()},(_,i)=>new Vector3(...positions.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix4(world));
  // Same max-height rule as ShadowCast.tsx, rather than a token/proxy check.
  expect(Math.max(...points.map(p=>p.y))).toBeCloseTo(.05,4);
  expect(Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))).toBeCloseTo(11,3);
  expect(p.getIndices()!.getCount()/3).toBeGreaterThan(10000);
  expect(part('courtyard').extra).toBeUndefined();
  expect(Math.max(...vertices('north-arrow').map(p=>p.y))).toBeGreaterThan(.4);
 });
 it('projects the authored shaft tip using the actual Sun model inputs',()=>{
  const sim=data.sim!,set=resolveSimValues(sim,{time:8,date:'oct-20'}),o=evaluateSim(sim,set) as Record<string,unknown>,v=o['sun-at'] as number[]|{x:number;y:number;z:number};
  const dir=Array.isArray(v)?v:[v.x,v.y,v.z],tip=vertices('pole').reduce((a,b)=>a.y>b.y?a:b),hit=projectShadow([10,tip.y,0],[0,1,0,-.05],[dir[0]!,dir[1]!,dir[2]!,0]);
  expect(Math.hypot(hit[0]-10,hit[2])).toBeCloseTo(3.25,2);
 });
});

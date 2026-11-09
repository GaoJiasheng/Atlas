/** Check the shipping asset, not the builder's idealised source meshes. */
import {readFileSync,statSync} from 'node:fs';
import {describe,it,expect,beforeAll} from 'vitest';
import {NodeIO,type Document} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Matrix4,Vector3,Ray} from 'three';
import {partsFile} from '../src/engines/space-scene/schema';
import {partPieces} from '../src/engines/space-scene/stages/model3d/geometry';
import {W,E,B,A} from '../scripts/geo/how-planes-fly/layout';
const file=partsFile.parse(JSON.parse(readFileSync('src/content/topics/how-planes-fly/data/parts.json','utf8')));
let document:Document;
beforeAll(async()=>{await MeshoptDecoder.ready;document=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(`public${file.model}`);await document.transform(dequantize());});
const vertices=(name:string)=>{const node=document.getRoot().listNodes().find(n=>n.getName()===name)!,g=node.getMesh()!.listPrimitives()[0]!,p=g.getAttribute('POSITION')!,m=new Matrix4().fromArray(node.getWorldMatrix());return Array.from({length:p.getCount()},(_,i)=>new Vector3(...p.getElement(i,[0,0,0])as[number,number,number]).applyMatrix4(m));};
describe('shipping aircraft lofts',()=>{
 it('decodes every named part locally, fits the meshopt limit and retains the taught part identities',()=>{
  expect(statSync(`public${file.model}`).size).toBeLessThan(1_500_000);
  for(const p of file.parts.filter(p=>p.mesh)){const node=document.getRoot().listNodes().find(n=>n.getName()===p.mesh);expect(node?.getMesh()?.listPrimitives()).toHaveLength(1);const g=node!.getMesh()!.listPrimitives()[0]!;expect(g.getMaterial()!.getExtras().atlasSurface).toBe(true);for(const a of g.listAttributes())expect(Array.from(a.getArray()!).every(Number.isFinite)).toBe(true);}
  const before=JSON.parse(readFileSync('scripts/geo/how-planes-fly/evidence/before-parts.json','utf8'));expect(file.parts.map(p=>p.id)).toEqual(before.parts.map((p:{id:string})=>p.id));expect(file.animations).toHaveLength(before.animations.length);
 });
 it('has a blunt nose, separate inset panes and a nose-only cockpit selection anchor',()=>{
  const points=vertices('fuselage-shell'),tip=points.filter(p=>p.x< -1.97);
  expect(tip.length).toBeGreaterThan(10);expect(Math.max(...tip.map(p=>Math.abs(p.z)))).toBeGreaterThan(.025);
  const panes=vertices('cockpit-glazing');expect(Math.max(...panes.map(p=>p.x))).toBeLessThan(-1.39);expect(Math.min(...panes.map(p=>p.z))).toBeLessThan(-.13);expect(Math.max(...panes.map(p=>p.z))).toBeGreaterThan(.13);
 });
 it('closes the fuselage behind the recessed glazing for section fills and keeps rotor axes centred',()=>{
  const points=vertices('fuselage-shell'),node=document.getRoot().listNodes().find(n=>n.getName()==='fuselage-shell')!,ix=node.getMesh()!.listPrimitives()[0]!.getIndices()!,hit=new Vector3();
  for(const side of [-1,1]){const ray=new Ray(new Vector3(-1.78875,1.09,0),new Vector3(0,Math.cos(.49625),side*Math.sin(.49625))),distances:number[]=[];
   for(let i=0;i<ix.getCount();i+=3){const p=ray.intersectTriangle(points[ix.getScalar(i)]!,points[ix.getScalar(i+1)]!,points[ix.getScalar(i+2)]!,false,hit);if(p)distances.push(p.distanceTo(ray.origin));}
   expect(distances.some(d=>d>.1&&d<.2)).toBe(true);
  }
  const shell=vertices('engine-shell'),shellIndices=document.getRoot().listNodes().find(n=>n.getName()==='engine-shell')!.getMesh()!.listPrimitives()[0]!.getIndices()!,coreRay=new Ray(new Vector3(-.55,.92,-2.8),new Vector3(1,0,0));let crossings=0;
  for(let i=0;i<shellIndices.getCount();i+=3)if(coreRay.intersectTriangle(shell[shellIndices.getScalar(i)]!,shell[shellIndices.getScalar(i+1)]!,shell[shellIndices.getScalar(i+2)]!,false,hit))crossings++;
  expect(crossings).toBe(0); // OGV annulus must never contain a solid fan hub.
  for(const id of ['compressor-rotor','hp-turbine-rotor','lp-turbine-rotor']){const m=document.getRoot().listNodes().find(n=>n.getName()===id)!.getWorldMatrix();expect(m[13]).toBeCloseTo(.8,4);expect(m[14]).toBeCloseTo(-2.8,4);}
 });
 it('keeps the wings rising and the moving tail/control meshes on their authored hinges',()=>{
  for(const side of ['left','right']){
   const vs=vertices('wing-'+side),root=vs.filter(p=>Math.abs(p.z)>.28&&Math.abs(p.z)<.32),tip=vs.filter(p=>Math.abs(p.z)>1.65);
   const slat=vertices('slat-'+side).filter(p=>Math.abs(Math.abs(p.z)-.96)<.001),seat=vs.filter(p=>Math.abs(Math.abs(p.z)-.96)<.001),gap=Math.min(...seat.map(p=>p.x))-Math.max(...slat.map(p=>p.x));expect(gap).toBeGreaterThan(.0005);expect(gap).toBeLessThan(.004);
   const mid=(a:Vector3[])=>a.reduce((s,p)=>s+p.y,0)/a.length;expect(mid(tip)-mid(root)).toBeGreaterThan(.10);
  }
  for(const id of ['tailplane-left','tailplane-right','fin']){
   const ps=vertices(id),vertical=id==='fin',near=ps.filter(p=>vertical?p.y<1.32:Math.abs(p.z)<.12),far=ps.filter(p=>vertical?p.y>1.82:Math.abs(p.z)>.65),axis=(p:Vector3)=>vertical?p.z:p.y;
   const thickness=(a:Vector3[])=>Math.max(...a.map(axis))-Math.min(...a.map(axis));expect(thickness(near)).toBeGreaterThan(thickness(far));
  }
 });
 it('keeps each independently displayed station below 350k triangles including decoded instances',()=>{
  const triangles=(id:string)=>{const p=file.parts.find(p=>p.id===id)!;if(p.mesh){const node=document.getRoot().listNodes().find(n=>n.getName()===p.mesh)!;return node.getMesh()!.listPrimitives()[0]!.getIndices()!.getCount()/3;}return partPieces(p).reduce((s,q)=>s+(q.geometry.index?.count??q.geometry.getAttribute('position').count)/3*(q.matrices?.length??1),0);};
  for(const ids of [W,E,B,A])expect(ids.reduce((s,id)=>s+triangles(id),0)).toBeLessThan(350000);
 });
});

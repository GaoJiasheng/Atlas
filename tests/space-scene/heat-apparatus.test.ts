/** The compressed delivery asset, runtime source-material contract and mesh shape. */
import fs from 'node:fs';
import sharp from 'sharp';
import {beforeAll,describe,it,expect} from 'vitest';
import {NodeIO,type Document} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Mesh,MeshStandardMaterial,Texture,Matrix4,Matrix3,Vector3,PerspectiveCamera} from 'three';
import {gltfSurface} from '../../src/engines/space-scene/stages/model3d/GltfSource';
import {partsFile} from '../../src/engines/space-scene/schema';
import {partFrame,applyFrame} from '../../src/engines/space-scene/lib/sim/frame';
import {toTransform} from '../../src/engines/space-scene/lib/pose';
import {partPieces} from '../../src/engines/space-scene/stages/model3d/geometry';
const root=new URL('../../',import.meta.url);
const read=(p:string)=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const data=partsFile.parse(read('src/content/topics/heat/data/parts.json'));
let doc:Document;
beforeAll(async()=>{await MeshoptDecoder.ready;doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(new URL('public'+data.model,root).pathname);await doc.transform(dequantize());});
describe('heat rebuilt delivery apparatus',()=>{
 it('keeps every teaching part ID and stays below the full-scene geometry and byte budgets',()=>{
  const before=read('scripts/geo/heat/baseline-parts.json');expect(data.parts.map(p=>p.id)).toEqual(before.parts.map((p:{id:string})=>p.id));
  expect(fs.statSync(new URL('public'+data.model,root)).size).toBeLessThanOrEqual(1_500_000);
  let triangles=0;
  for(const node of doc.getRoot().listNodes())for(const p of node.getMesh()?.listPrimitives()??[])triangles+=(p.getIndices()?.getCount()??p.getAttribute('POSITION')!.getCount())/3;
  for(const p of data.parts.filter(p=>!p.mesh))for(const piece of partPieces(p))triangles+=(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);
  // Includes all layers together plus a conservative meniscus allowance.
  expect(triangles+5000).toBeLessThan(350_000);
 });
 it('keeps the heavy probe-stand feet outside the hotplate and cooling vessel',()=>{
  const heater=data.parts.find(p=>p.id==='heater')!.primitive!;
  const heatingStand=data.parts.find(p=>p.id==='heater-probe-support')!.primitive!;
  const coolingStand=data.parts.find(p=>p.id==='cooler-probe-support')!.primitive!;
  if(heater.kind!=='bevelBox'||heatingStand.kind!=='bevelBox'||coolingStand.kind!=='bevelBox')throw new Error('Missing cast feet');
  expect(heatingStand.at[0]+heatingStand.size[0]!/2).toBeLessThan(heater.at[0]-heater.size[0]!/2);
  expect(coolingStand.at[0]+coolingStand.size[0]!/2).toBeLessThan(.55-.045);
  expect(heatingStand.at[1]-heatingStand.size[1]!/2).toBeCloseTo(.75,8);
 });
 it('leaves a physical gap between the relocated probe-stand and spoon-holder shoes',()=>{
  const stand=data.parts.find(p=>p.id==='retort-stand')!.primitive!,holder=data.parts.find(p=>p.id==='bath-holder')!.primitive!;
  if(stand.kind!=='bevelBox'||holder.kind!=='bevelBox')throw new Error('Missing cast shoes');
  expect(holder.at[2]-holder.size[2]!/2-(stand.at[2]+stand.size[2]!/2)).toBeGreaterThan(.010);
  const socket=data.parts.find(p=>p.id==='retort-stand')!.extra!.find(p=>p.kind==='lathe'&&Math.abs(p.at[1]-.774)<1e-8)!;
  expect(Math.abs(socket.at[2]-stand.at[2])+.009).toBeLessThan(stand.size[2]!/2);
 });
 it('places each horizontal boss thumbscrew head outside the open seat',()=>{
  for(const id of ['probe-clamp','heater-probe-support','cooler-probe-support','bath-holder']){
   const part=data.parts.find(p=>p.id===id)!;
   const pieces=[part.primitive!,...part.extra!];
   const thread=pieces.find(p=>p.kind==='coil'&&p.rotation?.[2]===90)!;
   const head=pieces.find(p=>p.kind==='bevelBox'&&Math.abs(p.size[0]!-.003)<1e-8&&Math.abs(p.size[1]!-.011)<1e-8)!;
   expect(head.at[0]).toBeLessThan(thread.at[0]);
  }
 });
 it('decodes smooth finite meshes, and beaker mouths remain open around an integrated spout',()=>{
  for(const node of doc.getRoot().listNodes()){
   const mesh=node.getMesh();if(!mesh)continue;const p=mesh.listPrimitives()[0]!,pos=p.getAttribute('POSITION')!,norm=p.getAttribute('NORMAL')!;
   expect(Array.from(pos.getArray()!).every(Number.isFinite)).toBe(true);expect(Array.from(norm.getArray()!).every(Number.isFinite)).toBe(true);
   if(!node.getName().includes('beaker'))continue;
   const at=read('scripts/geo/heat/baseline-parts.json').parts.find((p:{id:string})=>p.id===node.getName()).primitive.at;
   const matrix=new Matrix4().fromArray(node.getWorldMatrix());
   const xyz=Array.from({length:pos.getCount()},(_,i)=>new Vector3(...pos.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix4(matrix).sub(new Vector3(...at as [number,number,number])).toArray());
   // Dequantize preserves local centimetre-scale vertices; read bounds rather than node names alone.
   const x=xyz.map(p=>p[0]!),y=xyz.map(p=>p[1]!);
   expect(Math.max(...x)-Math.min(...x)).toBeGreaterThan(.098);
   expect(Math.max(...y)-Math.min(...y)).toBeCloseTo(.1208,3);
   const indices=p.getIndices()!;
   for(let i=0;i<indices.getCount();i+=3){const tri=[0,1,2].map(k=>xyz[indices.getScalar(i+k)]!);if(tri.every(q=>q[1]!>.110))expect(tri.every(q=>Math.hypot(q[0]!,q[2]!)>.040)).toBe(true);}
  }
 });
 it('delivers planar floor normals and nondegenerate beaker pole triangles after meshopt decoding',()=>{
  for(const node of doc.getRoot().listNodes().filter(n=>n.getName().includes('beaker'))){
   const p=node.getMesh()!.listPrimitives()[0]!,pos=p.getAttribute('POSITION')!,normal=p.getAttribute('NORMAL')!,ix=p.getIndices()!;
   const matrix=new Matrix4().fromArray(node.getWorldMatrix()),nm=new Matrix3().getNormalMatrix(matrix);
   const at=data.parts.find(q=>q.id===node.getName())!.mesh===node.getName()?read('scripts/geo/heat/baseline-parts.json').parts.find((q:{id:string})=>q.id===node.getName()).primitive.at:null;
   const vertices=Array.from({length:pos.getCount()},(_,i)=>new Vector3(...pos.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix4(matrix).sub(new Vector3(...at as [number,number,number])));
   let floorCount=0;
   for(let i=0;i<vertices.length;i++){const q=vertices[i]!;if((Math.abs(q.y)<.000003||Math.abs(q.y-.005)<.000003)&&Math.hypot(q.x,q.z)<.034){
    const n=new Vector3(...normal.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix3(nm).normalize();
    expect(Math.hypot(n.x,n.z)).toBeLessThan(.001);expect(Math.abs(n.y)).toBeGreaterThan(.99999);floorCount++;
   }}
   expect(floorCount).toBeGreaterThanOrEqual(2);
   for(let i=0;i<ix.getCount();i+=3){const a=vertices[ix.getScalar(i)]!,b=vertices[ix.getScalar(i+1)]!,c=vertices[ix.getScalar(i+2)]!;expect(b.clone().sub(a).cross(c.clone().sub(a)).length()).toBeGreaterThan(1e-12);}
  }
 });
 it('keeps the bath probe separate from both spoon handles in the authored hero and close-up views',()=>{
  const probe=data.parts.find(p=>p.id==='probe')!.primitive!;
  for(const id of ['view-hero','view-probe','view-spoons']){
   const c=data.presets!.find(p=>p.id===id)!.camera,cam=new PerspectiveCamera(c.fov,16/9,.001,100);cam.position.fromArray(c.position);cam.lookAt(new Vector3(...c.target));cam.updateMatrixWorld();
   const project=(x:number,z:number)=>new Vector3(x,.905,z).project(cam).x*960;
   const px=project(probe.at[0],probe.at[2]);
   for(const x of [-.567,-.533])expect(Math.abs(px-project(x,.095))).toBeGreaterThan(25);
  }
 });
 it('uses the actual authored pose transforms for the rising flask column and sphere-only warming',()=>{
  const liquid=data.parts.find(p=>p.id==='expansion-thermometer')!.primitive!;
  expect(liquid.kind).toBe('lathe');if(liquid.kind!=='lathe')throw new Error('Missing capillary');
  const top=liquid.at[1]+Math.max(...liquid.profile.map(q=>q[1])),bottom=liquid.at[1];
  const levels=['liquid-column-start','liquid-column-warm'].map(id=>{
   const frame=partFrame(liquid.at,toTransform(data.poses![id]!.parts['expansion-thermometer']));
   expect(applyFrame(frame,[.4,bottom,-.24])[1]).toBeCloseTo(bottom,8);
   return applyFrame(frame,[.4,top,-.24])[1];
  });
  expect(levels[1]!-bottom).toBeCloseTo((levels[0]!-bottom)*1.9,8);expect(levels[1]).toBeLessThan(1.038);
  const ring=data.parts.find(p=>p.id==='expansion-ring')!;
  expect([ring.primitive,...ring.extra!].some(p=>p?.color==='wood')).toBe(true);
  const support=ring.extra!.find(p=>p.kind==='lathe'&&Math.abs(p.at[2]+.248)<1e-8)!;
  expect(support).toBeDefined();if(support.kind!=='lathe')throw new Error('Missing ring head support');
  expect(support.at[1]+Math.max(...support.profile.map(q=>q[1]))).toBeCloseTo(ring.primitive!.at[1]-.004,8);
  // The load-bearing pad is wholly outside the real 44 mm opening.
  expect(Math.abs(support.at[2]-ring.primitive!.at[2])-.004).toBeGreaterThan(.022);
  const links=ring.extra!.filter(p=>p.kind==='sweep'&&p.closed);expect(links).toHaveLength(10);
  for(const p of links)expect(p.kind==='sweep'&&p.path.length).toBe(32);
  expect(Object.keys(data.poses!['ball-ring-warm']!.parts)).toEqual(['expansion-ball']);
  const ball=data.parts.find(p=>p.id==='expansion-ball')!.primitive!;
  expect(ball.color).toBe('brass');if(ball.kind!=='lathe')throw new Error('Missing brass sphere');
  const radius=Math.max(...ball.profile.map(q=>q[0]));expect(radius).toBeCloseTo(.020,8);
  const warm=toTransform(data.poses!['ball-ring-warm']!.parts['expansion-ball']);
  expect(radius*warm.scale[0]).toBeGreaterThan(.022);expect(radius).toBeLessThan(.022);
  expect(applyFrame(partFrame(ball.at,warm),[.24,.885,-.22])[1]).toBeCloseTo(.885,8);
 });
 it('carries real alpha decals through the runtime glTF material styling path',async()=>{
  const prim=doc.getRoot().listNodes().find(n=>n.getName()==='bath-beaker')!.getMesh()!.listPrimitives()[0]!,mat=prim.getMaterial()!;
  expect(mat.getExtras().atlasSurface).toBe(true);expect(mat.getAlphaMode()).toBe('BLEND');
  const bytes=mat.getBaseColorTexture()!.getImage()!;const image=await sharp(Buffer.from(bytes)).ensureAlpha().raw().toBuffer();
  const alpha=Array.from({length:image.length/4},(_,i)=>image[i*4+3]!);expect(alpha.reduce((a,b)=>Math.min(a,b),255)).toBeLessThan(30);expect(alpha.reduce((a,b)=>Math.max(a,b),0)).toBe(255);
  const source=new MeshStandardMaterial({map:new Texture(),transparent:true,roughness:mat.getRoughnessFactor(),metalness:0});source.userData.atlasSurface=true;
  const surface=gltfSurface(new Mesh(undefined,source))!,target=new MeshStandardMaterial();
  surface.style(target);surface.fade(target,1,false);
  expect(target.map).toBe(source.map);expect(target.opacity).toBe(1);expect(target.transparent).toBe(true);expect(target.depthWrite).toBe(false);expect(target.roughness).toBe(.08);
 });
});

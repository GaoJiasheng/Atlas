import {describe,it,expect,beforeAll} from 'vitest';
import fs from 'node:fs';
import {Vector3,Matrix4} from 'three';
import {NodeIO,type Document} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {partsFile} from '../src/engines/space-scene/schema';
import {partPieces} from '../src/engines/space-scene/stages/model3d/geometry';
const raw=JSON.parse(fs.readFileSync('src/content/topics/plant/data/parts.json','utf8'));
const baseline=JSON.parse(fs.readFileSync('scripts/geo/plant/baseline-parts.json','utf8'));
const file=partsFile.parse(raw);
let doc:Document;
beforeAll(async()=>{await MeshoptDecoder.ready;doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public/models/plant.glb');await doc.transform(dequantize());});
describe('plant compiled specimens',()=>{
 it('preserves teaching identities, chapter targets and live animation/pose inputs',()=>{
  expect(raw.parts.map((p:{id:string})=>p.id)).toEqual(baseline.parts.map((p:{id:string})=>p.id));
  expect(raw.animations).toEqual(baseline.animations);expect(raw.poses).toEqual(baseline.poses);expect(raw.flows).toEqual(baseline.flows);expect(raw.units).toEqual(baseline.units);
  const nodes=new Set(doc.getRoot().listNodes().map(n=>n.getName()));for(const part of file.parts.filter(p=>p.mesh))expect(nodes.has(part.mesh!)).toBe(true);
  const left=doc.getRoot().listNodes().find(n=>n.getName()==='splitting-pod')!,right=doc.getRoot().listNodes().find(n=>n.getName()==='splitting-pod-r')!;
  for(const node of [left,right]){const a=node.getMesh()!.listPrimitives()[0]!.getAttribute('POSITION')!,matrix=new Matrix4().fromArray(node.getWorldMatrix()),points=Array.from({length:a.getCount()},(_,i)=>new Vector3(...a.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix4(matrix));expect(Math.min(...points.map(p=>p.x))).toBeLessThan(-.835);expect(Math.max(...points.map(p=>p.x))).toBeGreaterThan(-.570);expect(Math.max(...points.map(p=>p.x))).toBeLessThan(-.550);}expect(file.poses!['pod-split']!.parts['splitting-pod-r']).toBeDefined();
 });
 it('budgets actual decoded indexed meshes plus every remaining primitive, including twins',()=>{
  expect(fs.statSync('public/models/plant.glb').size).toBeLessThanOrEqual(1_500_000);
  const meshes=new Map(doc.getRoot().listNodes().map(n=>[n.getName(),n.getMesh()]));let triangles=0;
  for(const p of file.parts){if(p.mesh)triangles+=meshes.get(p.mesh)!.listPrimitives().reduce((s,g)=>s+g.getIndices()!.getCount()/3,0);else{const pieces=partPieces(p);for(const piece of pieces){if(!piece.lines)triangles+=(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);piece.geometry.dispose();}}}
  expect(triangles).toBeLessThanOrEqual(350_000);
 });
 it('uses finite normals, relief geometry and the renderer-supported source-material opt-in',()=>{
  for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives()){
   expect(p.getMaterial()!.getExtras().atlasSurface).toBe(true);expect(p.getMaterial()!.getMetallicFactor()).toBe(0);expect(p.getAttribute('COLOR_0')).toBeTruthy();
   for(const key of ['POSITION','NORMAL','COLOR_0']){const a=p.getAttribute(key)!;expect(Array.from(a.getArray()!).every(Number.isFinite)).toBe(true);}
   expect(doc.getRoot().listTextures()).toHaveLength(0);
  }
 });
});

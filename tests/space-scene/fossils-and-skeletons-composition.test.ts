import { readFileSync } from 'node:fs';
import { PerspectiveCamera, Vector3, Matrix4 } from 'three';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { describe, it, expect } from 'vitest';
import { museumHudCamera, museumHudLayouts } from '../../scripts/geo/fossils-and-skeletons/museum-framing';
import { partsFile } from '../../src/engines/space-scene/schema';
const path='src/content/topics/fossils-and-skeletons/';
const file=partsFile.parse(JSON.parse(readFileSync(`${path}data/parts.json`,'utf8')));
const authored=file.presets!.find(p=>p.id==='museum-close')!.camera;
const elevation=(c:typeof authored)=>Math.atan2(c.position[1]-c.target[1],Math.hypot(c.position[0]-c.target[0],c.position[2]-c.target[2]))*180/Math.PI;
describe('fossils museum composition after HUD placement',()=>{
 it('keeps chapter and every explicit beat at the shared 30 degree museum view, with frame hidden in 00–06',()=>{
  expect(elevation(authored)).toBeCloseTo(30,2);
  const chapter=JSON.parse(readFileSync(`${path}chapters/07-singapore-skeletons.mdx`,'utf8').split('---')[1]!);
  expect(chapter.state.camera).toEqual(authored);
  for(const beat of chapter.state.beats)expect(typeof beat.camera==='string'?beat.camera:beat.camera).toEqual(typeof beat.camera==='string'?'museum-close':authored);
  for(const name of ['00-before-you-start','01-body-track-leaf','02-buried-to-exposed','03-layers-in-order','04-ash-beds-and-ages','05-rebuilding-evidence','06-birds-are-dinosaurs']){
   const c=JSON.parse(readFileSync(`${path}chapters/${name}.mdx`,'utf8').split('---')[1]!);
   expect(c.state.hide).toContain('study-plinth');
   for(const b of c.state.beats)expect(b.hide).toContain('study-plinth');
  }
 });
 it('projects every actual bone vertex into the free stage, filling it without entering HUD or reader panels',async()=>{
  await MeshoptDecoder.ready;
  const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(`public${file.model}`);
  await doc.transform(dequantize());
  const nodes=doc.getRoot().listNodes().filter(n=>n.getName().endsWith('-study'));
  for(const {width,height,panels} of museumHudLayouts){
   const {camera,framing}=museumHudCamera(authored,width,height,panels);
   expect(framing).not.toBeNull();
   expect(elevation(camera)).toBeCloseTo(30,2);
   const c=new PerspectiveCamera(camera.fov,width/height,.05,1000);
   c.position.fromArray(camera.position);c.lookAt(...camera.target);c.updateMatrixWorld();
   let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
   for(const node of nodes){
    const m=new Matrix4().fromArray(node.getWorldMatrix());
    const p=node.getMesh()!.listPrimitives()[0]!.getAttribute('POSITION')!,v:number[]=[];
    for(let i=0;i<p.getCount();i++){
     p.getElement(i,v);const q=new Vector3(v[0],v[1],v[2]).applyMatrix4(m).project(c);
     const x=(q.x*.5+.5+framing!.shift[0])*width,y=(-q.y*.5+.5-framing!.shift[1])*height;
     minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
    }
   }
   const rect=framing!.rect;
   expect(minX).toBeGreaterThanOrEqual(rect.x0);expect(maxX).toBeLessThanOrEqual(rect.x1);
   expect(minY).toBeGreaterThanOrEqual(rect.y0);expect(maxY).toBeLessThanOrEqual(rect.y1);
   expect((maxX-minX)/(rect.x1-rect.x0)).toBeGreaterThan(.70);
  }
 });
});

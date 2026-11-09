import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Box3, Vector3, Color, type Mesh } from 'three';
import { resolveMaterialLook } from '../src/engines/space-scene/lib/color';
import { partsFile } from '../src/engines/space-scene/schema';

const file=partsFile.parse(JSON.parse(fs.readFileSync('src/content/topics/magnets/data/parts.json','utf8')));
const baseline=partsFile.parse(JSON.parse(fs.readFileSync('scripts/geo/magnets/evidence/baseline-parts.json','utf8')));
describe('magnets rebuild: render-facing geometry and count contract',()=>{
 it('keeps the teaching identities, repeats and simulation contracts',()=>{
  expect(file.parts.map(p=>p.id)).toEqual(baseline.parts.map((p:{id:string})=>p.id));
  expect(file.sim).toEqual(baseline.sim);
  expect(file.parts.find(p=>p.id==='em-cells')?.repeat).toEqual(baseline.parts.find(p=>p.id==='em-cells')!.repeat);
 });
 it('loads with the actual engine GLTFLoader and shows one complete cell per count slice',async()=>{
  const bytes=fs.readFileSync(`public${file.model}`);expect(bytes.length).toBeLessThan(1_500_000);
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  gltf.scene.updateMatrixWorld(true);
  const node=gltf.scene.getObjectByName('em-cells') as Mesh;
  expect(node?.isMesh).toBe(true);expect(node.geometry.index).toBe(null);
  const pos=node.geometry.getAttribute('position'),half=pos.count/2;
  expect(half%3).toBe(0);
  for(let copy=0;copy<2;copy++){
   const b=new Box3(),v=new Vector3();
   for(let i=copy*half;i<(copy+1)*half;i++)b.expandByPoint(v.fromBufferAttribute(pos,i).applyMatrix4(node.matrixWorld));
   expect(b.getCenter(new Vector3()).x).toBeCloseTo(.361+copy*.018,4);
   expect(b.max.z-b.min.z).toBeGreaterThan(.060);
   expect(b.max.y-b.min.y).toBeGreaterThan(.017);
  }
  const mat=Array.isArray(node.material)?node.material[0]!:node.material;
  expect(mat.userData.atlasSurface).toBe(true);
  const authored=file.parts.find(p=>p.id==='em-cells')!.material!;
  const color=node.geometry.getAttribute('color');expect(color).toBeDefined();
  // Read decoded cap vertices. The real renderer multiplies these colours by
  // its family/tint colour, so a theme-background tint would blacken cinema.
  let cap=0;
  const point=new Vector3();
  for(let i=0;i<pos.count;i++){
   point.fromBufferAttribute(pos,i).applyMatrix4(node.matrixWorld);
   if(point.z>.0205&&point.z<.0213&&Math.abs(point.x-.361)<.0026)cap=Math.max(cap,color.getX(i),color.getY(i),color.getZ(i));
  }
  expect(cap).toBeGreaterThan(.3);
  for(const theme of ['paper','cinema'] as const){
   const look=resolveMaterialLook(authored.color,{},theme,authored.tint),factor=new Color(look.color);
   expect(Math.min(factor.r,factor.g,factor.b)*cap).toBeGreaterThan(.3);
  }

 });
});

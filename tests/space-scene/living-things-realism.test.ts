/** Anatomical and pipeline regressions; visual judgement is recorded in REBUILD-3D. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe,it,expect } from 'vitest';
import { Box3, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { partsFileBase } from '../../src/engines/space-scene/schema';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { partBounds } from '../../src/engines/space-scene/lib/parts';
import { buildBird,buildBirdSculpture } from '../../scripts/geo/kits/bird';
import { MODELS,specimen } from '../../scripts/geo/living-things/models';
import { modelBounds,modelGeometry } from '../../scripts/geo/living-things/bake';
import { scaleModel,place } from '../../scripts/geo/living-things/kit';

describe('living-things sculpture anatomy and fitting',()=>{
 it('ships a local compressed GLB that the runtime decoder loads within the byte and triangle budgets',async()=>{
  const file=partsFileBase.parse(JSON.parse(readFileSync('src/content/topics/living-things/data/parts.json','utf8')));
  expect(file.model).toBe('/models/living-things.glb');
  const bytes=readFileSync(`public${file.model}`);
  expect(bytes.byteLength).toBeLessThanOrEqual(1_500_000);
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  expect(json.extensionsRequired).toContain('EXT_meshopt_compression');
  expect(json.buffers.every((b:{uri?:string})=>!b.uri)).toBe(true);
  expect(json.images??[]).toHaveLength(0);
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  gltf.scene.updateMatrixWorld(true);
  let total=0;
  for(const part of file.parts){
   if(part.mesh){
    let mesh:Mesh|null=null;
    gltf.scene.getObjectByName(part.mesh)?.traverse(node=>{if(node instanceof Mesh)mesh=node;});
    expect(mesh,part.id).not.toBeNull();
    const loaded=mesh as unknown as Mesh,g=loaded.geometry;
    expect(g.hasAttribute('color'),part.id).toBe(true);
    expect(g.hasAttribute('normal'),part.id).toBe(true);
    total+=(g.index?.count??g.getAttribute('position').count)/3;
    const box=new Box3().setFromObject(loaded),envelope=partBounds(part)!;
    expect(box.min.y,part.id).toBeCloseTo(.015,5);
    for(const side of ['min','max']as const)for(let k=0;k<3;k++){
     const actual=box[side].getComponent(k),bound=envelope[side][k]!;
     expect(side==='min'?actual>=bound-3e-6:actual<=bound+3e-6,`${part.id} ${side}[${k}]`).toBe(true);
    }
   }else for(const piece of partPieces(part)){
    if(!piece.lines)total+=(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);
    piece.geometry.dispose();
   }
  }
  expect(file.parts.filter(p=>p.mesh)).toHaveLength(28);
  expect(total).toBeLessThanOrEqual(300_000);
  gltf.scene.traverse(node=>{if(node instanceof Mesh){node.geometry.dispose();for(const m of Array.isArray(node.material)?node.material:[node.material])m.dispose();}});
 });
 it('preserves the fossils bird API and exact legacy default geometry',()=>{
  expect(createHash('sha256').update(JSON.stringify(buildBird())).digest('hex')).toBe('8e2960eed6432881aff0fe7c34fde26b6c852d5a527eb2b95b91e106c5642d2d');
 });
 it('myna has three forward digits and one opposing hallux on each foot',()=>{
  const bird=buildBirdSculpture('myna');
  for(const foot of [0,1]){
   const toes=bird.digits.filter(d=>d.foot===foot);expect(toes).toHaveLength(4);
   expect(toes.filter(d=>d.tip[0]>d.root[0])).toHaveLength(3);
   expect(toes.filter(d=>d.tip[0]<d.root[0])).toHaveLength(1);
   expect(new Set(toes.map(d=>d.tip[2])).size).toBe(4);
  }
  bird.pieces.forEach(p=>p.geometry.dispose());
 });
 it('penguin has three web-support toes and a reduced rear digit per foot',()=>{
  const bird=buildBirdSculpture('penguin');
  for(const foot of [0,1]){
   const toes=bird.digits.filter(d=>d.foot===foot);expect(toes).toHaveLength(4);
   expect(toes.filter(d=>d.tip[2]>d.root[2])).toHaveLength(3);
   expect(toes.filter(d=>d.tip[2]<d.root[2])).toHaveLength(1);
  }
  bird.pieces.forEach(p=>p.geometry.dispose());
 });
 it('authored custom surfaces survive fitting and placement without changing the sorting home',()=>{
  const raw=specimen('fruit-bat'),b=modelBounds(raw),k=.71,offset:[number,number,number]=[.2,.3,-.4];
  const result=place(scaleModel(raw,k),offset),after=modelBounds(result);
  for(const side of ['min','max']as const)for(let i=0;i<3;i++)expect(after[side][i]).toBeCloseTo(b[side][i]!*k+offset[i]!,6);
  expect(result.primitive.at[0]).toBe(offset[0]);expect(result.primitive.at[2]).toBe(offset[2]);
 });
 it('all models have finite smooth normals and fit the existing specimen cells',()=>{
  for(const id of Object.keys(MODELS)){
   const raw=specimen(id),b=modelBounds(raw),home=raw.primitive.at;
   const reach=Math.max(b.max[0]-home[0],home[0]-b.min[0],b.max[2]-home[2],home[2]-b.min[2]);
   const fitted=scaleModel(raw,Math.min(1,.036/reach)),g=modelGeometry(fitted);g.computeBoundingBox();
   const box=g.boundingBox as Box3;expect(box.max.y-box.min.y,id).toBeLessThan(.12);
   const n=g.getAttribute('normal'),p=g.getAttribute('position');
   expect(p.count,id).toBeGreaterThan(0);
   let finite=true;for(let i=0;i<n.count;i++)finite &&= Number.isFinite(n.getX(i)+n.getY(i)+n.getZ(i));
   expect(finite,id).toBe(true);
   g.dispose();
  }
 },120000);
});

/** Anatomical and pipeline regressions; visual judgement is recorded in REBUILD-3D. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe,it,expect,vi } from 'vitest';
import sharp from 'sharp';
import { Box3, BufferGeometry, Float32BufferAttribute, Mesh } from 'three';
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
  expect(json.images).toHaveLength(1);
  expect(json.images[0]).toMatchObject({mimeType:'image/png',bufferView:expect.any(Number)});
  expect(json.images[0].uri).toBeUndefined();
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  // GLTFLoader owns texture/UV/material interpretation; only image decoding
  // is supplied offline, since this regression runs without a browser.
  vi.stubGlobal('self',globalThis);
  vi.stubGlobal('createImageBitmap',async(blob:Blob)=>{
   const image=await sharp(Buffer.from(await blob.arrayBuffer())).metadata();
   return {width:image.width,height:image.height,close(){}};
  });
  const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'').finally(()=>vi.unstubAllGlobals());
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
    expect(g.hasAttribute('uv'),part.id).toBe(true);
    const uv=g.getAttribute('uv');
    expect(uv.count,part.id).toBe(g.getAttribute('position').count);
    let minU=Infinity,maxU=-Infinity,minV=Infinity,maxV=-Infinity,finiteUv=true;
    for(let i=0;i<uv.count;i++){
     const u=uv.getX(i),v=uv.getY(i);finiteUv &&= Number.isFinite(u)&&Number.isFinite(v);
     minU=Math.min(minU,u);maxU=Math.max(maxU,u);minV=Math.min(minV,v);maxV=Math.max(maxV,v);
    }
    expect(finiteUv,`${part.id} finite UVs`).toBe(true);
    expect(maxU-minU,`${part.id} U range`).toBeGreaterThan(.001);
    expect(maxV-minV,`${part.id} V range`).toBeGreaterThan(.001);
    // A two-axis range alone also passes collinear UVs, which cannot give a
    // tangent-space finish. Check triangles spread throughout each sculpture.
    const triangleCount=(g.index?.count??uv.count)/3;
    let mappedSamples=0;
    for(let sample=0;sample<64;sample++){
     const start=Math.floor(sample*triangleCount/64)*3;
     const a=g.index?.getX(start)??start,b=g.index?.getX(start+1)??start+1,c=g.index?.getX(start+2)??start+2;
     const area=Math.abs((uv.getX(b)-uv.getX(a))*(uv.getY(c)-uv.getY(a))-(uv.getY(b)-uv.getY(a))*(uv.getX(c)-uv.getX(a)));
     if(area>1e-9)mappedSamples++;
    }
    expect(mappedSamples,`${part.id} sampled UV triangle area`).toBeGreaterThan(0);
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
 it('preserves authored UV charts through merge, placement and back-face duplication',()=>{
  const source=new BufferGeometry();
  source.setAttribute('position',new Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3));
  source.setAttribute('normal',new Float32BufferAttribute([0,0,1,0,0,1,0,0,1],3));
  const authored=[.125,.25,3.5,.25,.125,1.75];
  source.setAttribute('uv',new Float32BufferAttribute(authored,2));source.setIndex([0,1,2]);source.userData.twoSided=true;
  const model={primitive:{kind:'__mesh',at:[2,3,4] as [number,number,number],geometry:source,color:'tissue'},extra:[]};
  const merged=modelGeometry(model),uv=merged.getAttribute('uv');
  expect(uv.count).toBe(6);
  expect(Array.from(uv.array)).toEqual([...authored,...authored]);
  expect(Array.from(source.getAttribute('uv').array)).toEqual(authored);
  expect(merged.getAttribute('position').getX(0)).toBe(2);
  expect(merged.getAttribute('position').getY(0)).toBe(3);
  expect(merged.getAttribute('position').getZ(0)).toBe(4);
  merged.dispose();source.dispose();
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

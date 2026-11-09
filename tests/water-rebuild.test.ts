import { describe,it,expect,vi } from 'vitest';
import fs from 'node:fs';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { dequantize } from '@gltf-transform/functions';
import { partsFile } from '../src/engines/space-scene/schema';
import { Matrix4, Vector3, Mesh, Texture, Raycaster, Box3, Triangle } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gltfSurface } from '../src/engines/space-scene/stages/model3d/GltfSource';
import { createPartMaterial, stylePartMaterial } from '../src/engines/space-scene/stages/model3d/materials';
import { resolveMaterialLook } from '../src/engines/space-scene/lib/color';
import { bakeFlowPath } from '../src/engines/space-scene/lib/flow-curve';
import { partPieces } from '../src/engines/space-scene/stages/model3d/geometry';
import { toTransform } from '../src/engines/space-scene/lib/pose';
import { partFrame, applyFrame } from '../src/engines/space-scene/lib/sim/frame';
import {pipelineScene} from '../scripts/geo/water/pipeline-visibility';
import {parse as parseYaml} from 'yaml';
import {fitCameraToAspect} from '../src/engines/space-scene/lib/camera';
const before=JSON.parse(fs.readFileSync('scripts/geo/water/baseline-parts.json','utf8'));
const after=JSON.parse(fs.readFileSync('src/content/topics/water/data/parts.json','utf8'));
describe('water scenery rebuild',()=>{
 it('keeps the pipeline midpoint visible in the two actual beat cameras through the production ray pattern',async()=>{
  const scene=await pipelineScene();
  try{
   expect(scene.cast([6.55,4.8,11.3]).every(r=>r.blocker==='forest-hill')).toBe(true);
   for(const [filename,index]of [['01-one-island-four-taps.mdx',2],['07-every-drop.mdx',0]] as const){
    const state=parseYaml(fs.readFileSync('src/content/topics/water/chapters/'+filename,'utf8').split('---')[1]!).state,beat={...state,...state.beats[index]},camera=typeof beat.camera==='string'?after.presets.find((p:{id:string})=>p.id===beat.camera).camera:beat.camera;
    const rays=scene.cast(camera.position,'johor-main',beat.layers);
    expect(rays[0]!.blocker,filename+' midpoint').toBeNull();expect(rays.filter(r=>!r.blocker).length).toBeGreaterThanOrEqual(3);
    const cam=new (await import('three')).PerspectiveCamera(camera.fov,16/9,.001,100);cam.position.fromArray(camera.position);cam.lookAt(new Vector3().fromArray(camera.target));cam.updateMatrixWorld();
    const ndc=new Vector3().fromArray(scene.center).project(cam);expect(Math.abs(ndc.x)).toBeLessThan(.85);expect(Math.abs(ndc.y)).toBeLessThan(.85);
    for(const label of beat.labels)expect(scene.cast(camera.position,label,beat.layers).some(r=>!r.blocker),filename+'/'+label).toBe(true);
    for(const aspect of [16/9,4/3,390/844]){
     const fitted=fitCameraToAspect(camera,aspect);
     expect(scene.cast(fitted.position,'johor-main',beat.layers)[0]!.blocker,filename+'/'+aspect+' fitted midpoint').toBeNull();
    }
   }
  }finally{scene.dispose();}
 });
 it('preserves teaching objects, flows, animation endpoints and all chapter references',()=>{
  expect(after.parts.map((p:any)=>p.id)).toEqual(before.parts.map((p:any)=>p.id));
  for(const key of ['flows','animations','groups','spec','telemetry','views','presets'])expect(JSON.stringify(after[key])).toBe(JSON.stringify(before[key]));
  for(const key of ['storm','dry-spell'])expect(after.poses[key]).toEqual(before.poses[key]);
  expect(partsFile.safeParse(after).success).toBe(true);
  for(let i=0;i<before.parts.length;i++)for(const key of ['name','short','summary','group','connects','explode','shell','context'])expect(after.parts[i][key],`${before.parts[i].id}.${key}`).toEqual(before.parts[i][key]);
  const drainBefore=before.parts.find((p:any)=>p.id==='drains'),drainAfter=structuredClone(after.parts.find((p:any)=>p.id==='drains'));
  delete drainAfter.primitive.segments;for(const p of drainAfter.extra)delete p.segments;
  expect(drainAfter).toEqual(drainBefore);
 });
 it('ships an actually decodable mesh with budget and source-surface opt-in',async()=>{
  expect(fs.statSync('public/models/water.glb').size).toBeLessThanOrEqual(1_500_000);
  await MeshoptDecoder.ready;
  const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public/models/water.glb');await doc.transform(dequantize());
  let tris=0;for(const p of after.parts.filter((p:any)=>p.mesh)){
   const node=doc.getRoot().listNodes().find(n=>n.getName()===p.mesh)!;
   expect(node,p.id).toBeDefined();const prim=node.getMesh()!.listPrimitives()[0]!;
   expect(prim.getMaterial()!.getExtras().atlasSurface).toBe(true);
   expect(prim.getAttribute('NORMAL')).toBeTruthy();expect(prim.getAttribute('COLOR_0')).toBeTruthy();tris+=prim.getIndices()!.getCount()/3;
   for(const k of ['POSITION','NORMAL','COLOR_0'])expect(Array.from(prim.getAttribute(k)!.getArray()!).every(Number.isFinite)).toBe(true);
  }expect(tris).toBeLessThan(300_000);
  const unchanged=partsFile.parse(after).parts.filter(p=>!p.mesh).reduce((n,p)=>n+partPieces(p).reduce((n,piece)=>n+(piece.lines?0:(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1)),0),0);
  expect(tris+unchanged).toBeLessThanOrEqual(350_000);
  // The actual nine leaves have aligned hinges and 6:1 span:height, not square gates.
  const gate=doc.getRoot().listNodes().find(n=>n.getName()==='crest-gates')!,p=gate.getMesh()!.listPrimitives()[0]!.getAttribute('POSITION')!,matrix=new Matrix4().fromArray(gate.getWorldMatrix()),world=[];
  for(let i=0;i<p.getCount();i++)world.push(new Vector3().fromArray(p.getElement(i,[0,0,0])).applyMatrix4(matrix));
  const minY=Math.min(...world.map(p=>p.y)),maxY=Math.max(...world.map(p=>p.y));expect(maxY-minY).toBeLessThan(.017);
  for(let i=0;i<9;i++)for(const edge of [-.037,.037])expect(world.some(p=>Math.abs(p.z-(.32+i*.08+edge))<.0004)).toBe(true);
  const pivot=after.poses['gates-open']['crest-gates'].pivot;expect(pivot).toEqual([-1.715,-.032,.64]);
  const frame=partFrame(pivot,toTransform(after.poses['gates-open']['crest-gates']));
  for(let i=0;i<9;i++){
   const hinge:[number,number,number]=[pivot[0],pivot[1],.32+i*.08];
   const moved=applyFrame(frame,hinge);expect(moved[0]).toBeCloseTo(hinge[0],8);expect(moved[1]).toBeCloseTo(hinge[1],8);expect(moved[2]).toBeCloseTo(hinge[2],8);
   const top=applyFrame(frame,[hinge[0],hinge[1]+.0123,hinge[2]]);expect(top[0]).toBeLessThan(hinge[0]);expect(top[1]).toBeLessThan(hinge[1]+.0123);
  }
 });
 it('passes shipped vertex colours and physical surfaces through the production loader and material adapter',async()=>{
  // Decode embedded PNG bytes through the production GLTFLoader. This small
  // ImageBitmap stand-in supplies real pixels without opening a browser.
  vi.stubGlobal('self',globalThis);
  vi.stubGlobal('createImageBitmap',async(blob:Blob)=>{
   const decoded=await sharp(Buffer.from(await blob.arrayBuffer())).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   return {data:decoded.data,width:decoded.info.width,height:decoded.info.height,close(){}};
  });
  const bytes=fs.readFileSync('public/models/water.glb');
  const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const texture=new Texture();
  for(const theme of ['paper','cinema'] as const)for(const part of after.parts.filter((p:any)=>p.mesh)){
   const mesh=gltf.scene.getObjectByName(part.mesh) as Mesh,surface=gltfSurface(mesh)!;
   expect(surface,part.id).toBeDefined();expect(mesh.geometry.getAttribute('color')).toBeDefined();
   if(theme==='paper'&&part.id==='city-blocks'){
    mesh.updateMatrixWorld(true);
    const deck=new Raycaster(new Vector3(-.126,.008,-.86),new Vector3(0,0,-1),0,.23);
    expect(deck.intersectObject(mesh,false), 'city slab void deck remains open through both sides').toHaveLength(0);
    // Conservatively include the complete building envelopes, even voids.
    // No tree triangle may intersect a facade, roof or floor envelope.
    const boxes:Box3[]=[];
    for(let row=0;row<3;row++)for(let i=0;i<4;i++){
     const x=-.45+i*.35,z=-1+row*.28,point=(i+row)%3===0,w=point?.112:.220,d=point?.112:.084,h=point?.23+(i%2)*.03+.053:.145+row*.008+.04;
     boxes.push(new Box3(new Vector3(x-w/2,-.002,z-d/2),new Vector3(x+w/2,h,z+d/2)));
    }
    const pos=mesh.geometry.getAttribute('position'),ids=mesh.geometry.getAttribute('_tree_id'),idx=mesh.geometry.index!,tri=new Triangle();
    expect(ids).toBeDefined();
    for(let i=0;i<idx.count;i+=3){
     if(ids.getX(idx.getX(i))<=0)continue;
     tri.set(new Vector3().fromBufferAttribute(pos,idx.getX(i)).applyMatrix4(mesh.matrixWorld),new Vector3().fromBufferAttribute(pos,idx.getX(i+1)).applyMatrix4(mesh.matrixWorld),new Vector3().fromBufferAttribute(pos,idx.getX(i+2)).applyMatrix4(mesh.matrixWorld));
     expect(boxes.some(b=>b.intersectsTriangle(tri)),'urban crown / building clearance').toBe(false);
    }
    const window=new Raycaster(new Vector3(-.126,.075,-.90),new Vector3(0,0,-1),0,.15);
    const hit=window.intersectObject(mesh,false)[0]!;
    expect(hit,'recessed city window exists').toBeDefined();
    expect(hit.point.z).toBeLessThan(-.968);
   }
   if(theme==='paper'&&part.id==='hdb-block'){
    mesh.updateMatrixWorld(true);
    for(const x of [.10,.135,.17])for(const y of [.21,.232,.245]){
     const ray=new Raycaster(new Vector3(x,y,.65),new Vector3(0,0,-1));
     const hits=ray.intersectObject(mesh,false);
     expect(hits.length).toBeGreaterThan(0);
     expect(hits[0]!.point.z,`kitchen cutaway at ${x},${y}`).toBeLessThan(.556);
    }
   }
   const pm=createPartMaterial(),look=resolveMaterialLook(part.material.color,{},theme,part.material.tint);
   stylePartMaterial(pm,{look,kit:{roughness:()=>texture,normal:()=>texture,albedo:()=>null,dispose(){}},signal:'#cc6328',cold:'#4f7f8c',cut:'#b8973c',ink:'#2a2824',rim:.35,tint:.05,hatchPx:7});
   surface.style(pm.material);
   if(['forest-hill','city-blocks'].includes(part.id)){
    expect(pm.material.map).toBe(surface.source.map);expect(pm.material.map?.image).toBeDefined();
    expect(pm.material.alphaTest).toBe(surface.source.alphaTest);expect(surface.source.transparent).toBe(false);
    expect(mesh.geometry.getAttribute('uv')).toBeDefined();
   }
   expect(pm.material.vertexColors).toBe(true);expect(pm.material.color.toArray()).toEqual([1,1,1]);
   expect(pm.material.normalMap).toBeNull();expect(pm.material.roughnessMap).toBeNull();
   expect(pm.material.roughness).toBe(part.id==='crest-gates'?.38:.86);expect(pm.material.metalness).toBe(part.id==='crest-gates'?.72:0);
   for(const opacity of [1,.12,0]){
    surface.fade(pm.material,opacity,false);expect(pm.material.opacity).toBe(opacity);
    if(['forest-hill','city-blocks'].includes(part.id)){
     // The fade scales the cutoff with opacity, so a ghosted cutout keeps the same alpha silhouette.
     expect(pm.material.alphaTest).toBeCloseTo(surface.source.alphaTest*pm.material.opacity,8);
     for(const mapAlpha of [0,.1,.29,.31,.6,1])expect(mapAlpha*pm.material.opacity>=pm.material.alphaTest).toBe(opacity===0||mapAlpha>=surface.source.alphaTest);
     // Opaque cutouts resolve edges through MSAA coverage; blended fades keep their opacity.
     expect(pm.material.alphaToCoverage).toBe(opacity===1);
    }
   }
   pm.material.dispose();
  }
  vi.unstubAllGlobals();
  texture.dispose();gltf.scene.traverse(node=>{if(node instanceof Mesh){node.geometry.dispose();for(const m of Array.isArray(node.material)?node.material:[node.material])m.dispose();}});
 });

 it('retains all 31 trees, a distant-view leaf mask, and every accepted mesh',async()=>{
  await MeshoptDecoder.ready;
  const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public/models/water.glb');
  const metrics=JSON.parse(fs.readFileSync('scripts/geo/water/comparisons/round2-final-metrics.json','utf8'));
  for(const [part,count]of [['forest-hill',27],['city-blocks',4]] as const){
   const node=doc.getRoot().listNodes().find(n=>n.getName()===part)!;
   expect((node.getExtras().treeInstances as unknown[]).length).toBe(count);
   expect(new Set(Array.from(node.getMesh()!.listPrimitives()[0]!.getAttribute('_TREE_ID')!.getArray()!))).toEqual(new Set(Array.from({length:count+1},(_,i)=>i)));
  }
  const packed=doc.getRoot().listNodes().find(n=>n.getName()==='forest-hill')!.getExtras().understoreyPlants as [number,number,number,number][];
  const plants=packed.map(p=>({at:p.slice(0,3) as [number,number,number],maxRadius:p[3]}));
  expect(plants.length).toBe(32);
  const channels=before.flows.find((f:any)=>f.id==='runoff').paths.filter((p:any)=>p.id.startsWith('hill-')).map((p:any)=>bakeFlowPath(p.path).points);
  for(const plant of plants)for(const path of channels)for(let i=0;i<path.length;i+=3)expect(Math.hypot(plant.at[0]-path[i]!,plant.at[2]-path[i+2]!) - plant.maxRadius).toBeGreaterThan(.014);
  const baselineAsset=JSON.parse(fs.readFileSync('scripts/geo/water/comparisons/round2-before-metrics.json','utf8'));
  expect(metrics.acceptedFingerprints).toEqual(baselineAsset.acceptedFingerprints);
  for(const [name,hash]of Object.entries(baselineAsset.acceptedFingerprints)){
   const node=doc.getRoot().listNodes().find(n=>n.getName()===name)!;
   const actual=createHash('sha256').update(JSON.stringify({matrix:node.getWorldMatrix(),attributes:node.getMesh()!.listPrimitives().map(p=>({attributes:p.listSemantics().map(s=>[s,Array.from(p.getAttribute(s)!.getArray()!)]),indices:Array.from(p.getIndices()!.getArray()!),material:p.getMaterial()!.getExtras()}))})).digest('hex');
   expect(actual,name).toBe(hash);
  }
  await doc.transform(dequantize());
  for(const id of ['forest-hill','city-blocks']){
   const p=doc.getRoot().listNodes().find(n=>n.getName()===id)!.getMesh()!.listPrimitives()[0]!,uv=p.getAttribute('TEXCOORD_0')!,idx=p.getIndices()!;let leaves=0;
   for(let i=0;i<idx.getCount();i+=3)if([0,1,2].some(k=>{const a=uv.getElement(idx.getScalar(i+k),[0,0]);return Math.abs(a[0]!-.75)>.01||Math.abs(a[1]!-.75)>.01;}))leaves++;
   expect(leaves,id+' retains every authored leaf triangle').toBe(metrics.protectedLeafTriangles[id]);
   // Quantization must not turn the token's warm neutral bark into red roots.
   const tag=p.getAttribute('_TREE_ID')!,color=p.getAttribute('COLOR_0')!;
   for(let i=0;i<tag.getCount();i++){
    const t=uv.getElement(i,[0,0]);if(tag.getScalar(i)===0||Math.abs(t[0]!-.75)>.01||Math.abs(t[1]!-.75)>.01)continue;
    const c=color.getElement(i,[0,0,0]);expect(c[1]).toBeGreaterThan(0);expect(c[2]).toBeGreaterThan(0);
    expect(c[0]!/c[1]!).toBeGreaterThan(.85);expect(c[0]!/c[1]!).toBeLessThan(1.45);
    expect(c[1]!/c[2]!).toBeGreaterThan(.90);expect(c[1]!/c[2]!).toBeLessThan(1.85);
   }
  }
  const cutoff=doc.getRoot().listMaterials().find(m=>m.getName()==='tropical-scenery-alpha-clusters')!.getAlphaCutoff();
  const png=doc.getRoot().listTextures()[0]!.getImage()!,{data,info}=await sharp(Buffer.from(png)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const {leafAtlas}=await import('../scripts/geo/water/vegetation');
  const authored=await sharp(await leafAtlas()).ensureAlpha().raw().toBuffer();
  expect(data.equals(authored),'shipped WebP preserves every authored RGBA pixel').toBe(true);
  const white=((Math.floor(info.height*.75)*info.width+Math.floor(info.width*.75))*4);
  expect([...data.subarray(white,white+4)]).toEqual([255,255,255,255]);
  // The last 1x1 mip must still pass alphaTest. This checks actual embedded atlas pixels,
  // since sparse cutouts can vanish on GPU even when close-up cards look fine.
  const tile=info.width/2;
  for(const [ox,oy]of [[0,0],[tile,0],[0,tile]]){
   let alpha=0,holes=0;
   for(let y=0;y<tile;y++)for(let x=0;x<tile;x++){const a=data[((y+oy!)*info.width+x+ox!)*4+3]!;alpha+=a/255;if(a<70)holes++;}
   expect(alpha/(tile*tile)).toBeGreaterThan(cutoff+.025);expect(holes/(tile*tile)).toBeGreaterThan(.12);
  }
 });
});

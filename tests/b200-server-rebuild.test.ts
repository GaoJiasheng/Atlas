import {readFileSync,statSync,existsSync} from 'node:fs';
import {beforeAll,describe,it,expect} from 'vitest';
import {Box3,Mesh,MeshStandardMaterial,Color,Matrix4,SkinnedMesh,Vector3,Raycaster,Quaternion} from 'three';
import {GLTFLoader,type GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer';
import {partsFile} from '../src/engines/space-scene/schema';
import {partCopies} from '../src/engines/space-scene/lib/parts';
import {partPieces,eachPieces} from '../src/engines/space-scene/stages/model3d/geometry';
import {gltfSurface} from '../src/engines/space-scene/stages/model3d/GltfSource';
import {resolveMaterialLook} from '../src/engines/space-scene/lib/color';
import {sampleAngles,anglesQuat} from '../src/engines/space-scene/lib/rig';
const raw=JSON.parse(readFileSync('src/content/topics/b200-server/data/parts.json','utf8'));
const baseline=JSON.parse(readFileSync('scripts/geo/b200-server/source-parts.json','utf8'));
const original=partsFile.parse(baseline),data=partsFile.parse(raw),part=(id:string)=>data.parts.find(p=>p.id===id)!;
let gltf:GLTF;
const mesh=(id:string)=>gltf.scene.getObjectByName(id) as Mesh;
const hit=(id:string,x:number,z:number)=>new Raycaster(new Vector3(x,.6,z),new Vector3(0,-1,0)).intersectObject(mesh(id),false).length>0;
describe('B200 museum rebuild: shipped asset and teaching contract',()=>{
 beforeAll(async()=>{await MeshoptDecoder.ready;const bytes=readFileSync(`public${data.model}`);gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);},20000);
 it('keeps every selection, teaching name, group, tray pose, flow and view',()=>{
  expect(raw.parts.map((p:{id:string})=>p.id)).toEqual(baseline.parts.map((p:{id:string})=>p.id));
  for(const old of original.parts){const live=data.parts.find((p:{id:string})=>p.id===old.id);for(const key of ['name','short','summary','group','connects','explode','context','shell'])expect((live as unknown as Record<string,unknown>)[key],`${old.id}.${key}`).toEqual((old as unknown as Record<string,unknown>)[key]);if(old.id!=='bezel')expect(live!.detail).toEqual(old.detail);}
  for(const key of ['poses','flows','views','presets','spec','telemetry'])expect((data as unknown as Record<string,unknown>)[key],key).toEqual((original as unknown as Record<string,unknown>)[key]);
  expect(existsSync('public/illustrations/figures/b200-gpu-tray.webp')).toBe(false);
 });
 it('contains eight SXM module footprints and two CPU sockets in decoded geometry',()=>{
  for(const x of [-.1575,-.0525,.0525,.1575])for(const z of [-.152,.152])expect(hit('gpu-modules',x,z)).toBe(true);
  expect(hit('gpu-modules',0,0)).toBe(false);
  for(const x of [-.107,.107])expect(hit('cpus',x,-.13)).toBe(true);
  expect(hit('cpus',0,-.13)).toBe(false);
  for(const x of [-.08,.08])expect(hit('nvswitch-chips',x,0)).toBe(true);
  expect(partCopies(part('gpu-dies'))).toHaveLength(16);
  expect(partCopies(part('hbm-stacks'))).toHaveLength(64);
 });
 it('renders 32 keyed DIMM boards and 20 open fan cassettes',()=>{
  const dimm=part('dimms'),dimmPrims=[dimm.primitive!,...(dimm.extra??[])];
  const boards=partCopies(dimm).filter(c=>{const p=dimmPrims[c.primitive]!;return p.kind==='extrude'&&Math.abs(p.depth-.0015)<1e-8;});
  expect(boards).toHaveLength(32);
  expect(boards.every(c=>{const p=dimmPrims[c.primitive]!;return p.kind==='extrude'&&p.shape.length===8;})).toBe(true);
  const fan=part('fan-modules'),prims=[fan.primitive!,...(fan.extra??[])];
  expect(partCopies(fan).filter(c=>{const p=prims[c.primitive]!;return p.kind==='extrude'&&p.depth===.078;})).toHaveLength(20);
  for(const p of prims)if(p.kind==='extrude'&&p.depth===.078)expect(p.holes![0]!.length).toBe(48);
 });
 it('loads 40 independently centred rotors through actual Three skinning',()=>{
  const fan=mesh('fan-rotors') as SkinnedMesh;expect(fan.isSkinnedMesh).toBe(true);expect(fan.skeleton.bones).toHaveLength(40);
  fan.skeleton.update();const bounds=new Box3().setFromObject(fan);
  expect(bounds.min.x).toBeGreaterThan(-.22);expect(bounds.max.x).toBeLessThan(.22);
  expect(bounds.min.y).toBeGreaterThan(.09);expect(bounds.max.y).toBeLessThan(.45);
  expect(bounds.min.z).toBeGreaterThan(.34);expect(bounds.max.z).toBeLessThan(.45);
  const p=fan.geometry.getAttribute('position'),j=fan.geometry.getAttribute('skinIndex'),w=fan.geometry.getAttribute('skinWeight'),representatives=new Map<number,number>();
  for(let i=0;i<p.count;i++){expect(w.getX(i)).toBeCloseTo(1,4);if(!representatives.has(j.getX(i)))representatives.set(j.getX(i),i);}
  expect(representatives.size).toBe(40);
  const before=[...representatives].map(([bone,i])=>({bone,i,p:fan.applyBoneTransform(i,new Vector3().fromBufferAttribute(p,i)),centre:fan.skeleton.bones[bone]!.getWorldPosition(new Vector3())}));
  for(const [name,spec] of Object.entries(data.rig!.joints)){const clip=data.animations.find(a=>a.target===`joint:${name}`)!;if(clip.kind!=='sequence')throw Error('Missing rotor clip');const angles=sampleAngles(clip.keys,.317,true),again=sampleAngles(clip.keys,1.817,true);expect(angles.rotation).toBeCloseTo(again.rotation!,5);gltf.scene.getObjectByName(spec.node)!.quaternion.fromArray(anglesQuat(spec.axes,angles));}
  gltf.scene.updateMatrixWorld(true);fan.skeleton.update();
  for(const sample of before){const after=fan.applyBoneTransform(sample.i,new Vector3().fromBufferAttribute(p,sample.i));expect(after.distanceTo(sample.centre)).toBeCloseTo(sample.p.distanceTo(sample.centre),5);expect(after.distanceTo(sample.p)).toBeGreaterThan(.001);}
  for(const bone of fan.skeleton.bones)bone.quaternion.copy(new Quaternion());gltf.scene.updateMatrixWorld(true);
 });
 it('keeps PCB laminate dark in both actual material themes',()=>{
  const css=readFileSync('src/theme/tokens.css','utf8');
  for(const theme of ['paper','cinema'] as const){
   const at=css.indexOf(`:root[data-theme="${theme}"] {`),tokens=Object.fromEntries([...css.slice(at,css.indexOf('\n}',at)).matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map(m=>[m[1]!,m[2]!]));
   const boards=[part('gpu-baseboard').primitive!,part('motherboard').primitive!,...[part('dimms').primitive!,...(part('dimms').extra??[])].filter(p=>p.kind==='extrude'&&p.depth===.0015)];
   for(const p of boards){const look=resolveMaterialLook(p.color,tokens,theme,p.tint);expect(Math.max(...new Color(look.color).toArray()),`${theme} PCB`).toBeLessThan(.08);}
  }
 });
 it('seats CPU and GPU thermal feet on their actual package surfaces',()=>{
  const cpu=new Box3().setFromObject(mesh('cpus')),cooler=new Box3().setFromObject(mesh('cpu-heatsinks'));
  expect(Math.abs(cooler.min.y-cpu.max.y)).toBeLessThan(.0003);
  const gpu=part('gpu-heatsinks'),base=[gpu.primitive!,...(gpu.extra??[])].filter(p=>p.kind==='bevelBox'&&p.color==='copper');
  const dies=part('gpu-dies'),dieBox=new Box3();
  for(const q of partPieces(dies))for(const m of q.matrices??[new Matrix4()]){q.geometry.computeBoundingBox();dieBox.union(q.geometry.boundingBox!.clone().applyMatrix4(m).translate(new Vector3(...dies.primitive!.at)));}
  for(const p of base)if(p.kind==='bevelBox')expect(Math.abs(p.at[1]-p.size[1]/2-dieBox.max.y)).toBeLessThan(.0003);
  expect(base).toHaveLength(2);
 });
 it('passes shipped surface values through the actual engine material adapter',()=>{
  for(const id of ['bezel','gpu-modules','cpu-heatsinks','u2-drives','scale-figure','fan-rotors']){
   const loaded=mesh(id),source=loaded.material as MeshStandardMaterial;
   const target=new MeshStandardMaterial({color:'#9b9e97'}),color=target.color.clone().multiply(source.color);
   const surface=gltfSurface(loaded);expect(surface,`${id} surface opt-in`).toBeDefined();surface!.style(target);
   expect(target.color.toArray()).toEqual(color.toArray());expect(target.roughness).toBe(source.roughness);
   expect(target.metalness).toBe(source.metalness);expect(target.vertexColors).toBe(source.vertexColors);
   expect(target.normalMap).toBe(null);expect(target.roughnessMap).toBe(null);
  }
 });
 it('keeps the 1.70m silhouette and complete-topic performance budgets',()=>{
  const box=new Box3().setFromObject(mesh('scale-figure'));expect(box.max.y-box.min.y).toBeCloseTo(1.70,2);expect(box.min.y).toBeCloseTo(0,3);
  expect(statSync(`public${data.model}`).size).toBeLessThanOrEqual(1_500_000);
  let triangles=0;for(const p of data.parts){if(p.mesh)triangles+=mesh(p.mesh).geometry.index!.count/3;else for(const q of data.animations.some(a=>a.target===p.id&&'each'in a&&a.each)?eachPieces(p):partPieces(p))triangles+=(q.geometry.index?.count??q.geometry.getAttribute('position').count)/3*(q.matrices?.length??1);}
  expect(triangles).toBeLessThanOrEqual(350_000);
 });
});

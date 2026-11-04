/** Surgical museum rebuild: shared sauropod sculpture/surface and display X
 * stagger only. Theropod buffers, myna, cameras, simulation and editorial
 * text are preserved. pnpm tsx .../build-sauropods.ts */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { Matrix4 } from 'three';
import { diplodocidStudy } from './sauropod-study';
import { museumBoneGeometry } from './sculpt-museum';
import { swapMuseumMesh } from './swap-museum-mesh';
import { boneSurface, BONE_ALBEDO, BONE_ROUGHNESS } from './bone-surface';
import type { Part } from '../../../src/engines/space-scene/schema';

export async function buildSauropods(){
const path='src/content/topics/fossils-and-skeletons/data/parts.json';
const file=JSON.parse(fs.readFileSync(path,'utf8'));
await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const previous=fs.readFileSync(`public${file.model}`);
const primitives=diplodocidStudy(0,0);
const geometry=museumBoneGeometry({primitive:primitives[0],extra:primitives.slice(1)} as Part);
const layout=JSON.parse(fs.readFileSync('scripts/geo/fossils-and-skeletons/model-layout.json','utf8')).studies.museum;
geometry.applyMatrix4(new Matrix4().makeScale(layout.scale,layout.scale,layout.scale));
const uv=geometry.getAttribute('uv');let uvSpan=1;
for(let i=0;i<uv.count;i++)uvSpan=Math.max(uvSpan,Math.abs(uv.getX(i)),Math.abs(uv.getY(i)));
for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)/uvSpan+1)/2,(uv.getY(i)/uvSpan+1)/2);
const fresh=new Document(),buffer=fresh.createBuffer(),mesh=fresh.createMesh('diplodocid-bones'),primitive=fresh.createPrimitive();
for(const [name,type]of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0']] as const){
 const a=geometry.getAttribute(name);
 primitive.setAttribute(type,fresh.createAccessor().setType(name==='uv'?'VEC2':'VEC3').setArray(new Float32Array(a.array)).setBuffer(buffer));
}
mesh.addPrimitive(primitive);
fresh.createScene('sauropod-build').addChild(fresh.createNode('sauropod-build').setMesh(mesh));
await fresh.transform(weld(),dedup());
// Normal-aware simplification keeps curved cortex and articular shoulders;
// position-only simplification makes them large, visibly flat triangles.
const indices=primitive.getIndices()!,positions=primitive.getAttribute('POSITION')!,normals=primitive.getAttribute('NORMAL')!;
const [reduced]=MeshoptSimplifier.simplifyWithAttributes(new Uint32Array(indices.getArray()!),new Float32Array(positions.getArray()!),3,new Float32Array(normals.getArray()!),3,[.08,.08,.08],null,Math.min(Math.floor(indices.getCount()*.22/3)*3,64_500*3),.0007);
indices.setArray(new Uint32Array(reduced));
// COLOR_0 is linear reflectance, multiplied by token:fossil at runtime.
// Bake after simplification: surface detail must not increase triangle count.
const surface=boneSurface(new Float32Array(positions.getArray()!),new Float32Array(normals.getArray()!),new Uint32Array(reduced));
primitive.setAttribute('COLOR_0',fresh.createAccessor().setType('VEC3').setArray(surface.colors).setBuffer(buffer));
primitive.setMaterial(fresh.createMaterial('mineralised-cortex').setBaseColorFactor([BONE_ALBEDO,BONE_ALBEDO,BONE_ALBEDO,1]).setRoughnessFactor(BONE_ROUGHNESS).setMetallicFactor(0).setExtras({atlasSurface:true}));
await fresh.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizeNormal:10}));
const origin=primitives[0]!.at;
const anchor=origin.map((v,i)=>[0,2+layout.lift,0][i]!+layout.scale*(v-layout.center[i]));
for(const p of file.parts.filter((p:Part)=>p.id.endsWith('-study')))p.material={color:'plastic',tint:'token:fossil'};
const rowSpacing=.3*layout.scale;
const bytes=swapMuseumMesh(previous,Buffer.from(await io.writeBinary(fresh)),anchor,rowSpacing);
// Move each plinth and its four contact patches with the skeleton. Preserve
// the accepted 30-degree chapter/beat cameras and all teaching data.
const plinth=file.parts.find((p:Part)=>p.id==='study-plinth');
const platforms=[plinth.primitive,...plinth.extra.slice(0,2)];
platforms.forEach((p:any,i:number)=>p.at[0]=Number(((i-1)*rowSpacing).toFixed(6)));
plinth.extra.slice(2).forEach((p:any,i:number)=>{
 const row=Math.floor(i/4)-1,x=i%4<2?-.29:.46;
 p.at[0]=Number((layout.scale*(row*.3+x-.04-layout.center[0])).toFixed(6));
});
if(bytes.length>2_500_000)throw new Error('Museum asset exceeds 2.5 MB.');
fs.writeFileSync(`public${file.model}`,bytes);
fs.writeFileSync(path,JSON.stringify(file,null,2)+'\n');
const tris=mesh.listPrimitives().reduce((sum,p)=>sum+p.getIndices()!.getCount()/3,0);
console.log(JSON.stringify({perStudy:tris,threeStudies:tris*3,assetBytes:bytes.length,surface:surface.stats}));
geometry.dispose();
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await buildSauropods();

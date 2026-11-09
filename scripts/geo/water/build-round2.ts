/** pnpm tsx scripts/geo/water/build-round2.ts [iteration=1]
 * Keeps the accepted round-1 meshes byte-for-byte in decoded accessor space.
 * Only forest-hill and city-blocks are replaced; no teaching data is regenerated.
 */
import fs from 'node:fs';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { Document, NodeIO, Logger, VertexLayout, type Node as GltfNode } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions';
import { weld, meshopt, simplifyPrimitive, mergeDocuments, prune, compactPrimitive, joinPrimitives } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import { Mesh, MeshBasicMaterial, DoubleSide, Raycaster, Vector3, BufferGeometry, Float32BufferAttribute } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { catchmentTerrain, Sculpture } from './scenery';
import { variants, treeSites, urbanSites, instantiateTree, opaqueUV, leafAtlas, understorey, random } from './vegetation';
import { estate } from './estate';
import { combineScenery } from './combine-glb';
import { bakeFlowPath } from '../../../src/engines/space-scene/lib/flow-curve';
import { compressPosition } from '../living-things/compress-position';
import { withLabelPoints } from './label-points';
const iteration=Number(process.argv[2]??1),output='scripts/geo/water/comparisons';
const source=process.env.WATER_ROUND1_GLB??'public/models/water.glb';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().setVertexLayout(VertexLayout.SEPARATE).registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const original=await io.read(source),doc=new Document().setLogger(new Logger(Logger.Verbosity.ERROR)),buffer=doc.createBuffer(),scene=doc.createScene('water-round2');
const pngAtlas=await leafAtlas(),scratch=fs.mkdtempSync(path.join(tmpdir(),'atlas-water-atlas-'));
let atlas:Buffer;
try{
 fs.writeFileSync(path.join(scratch,'atlas.png'),pngAtlas);
 // -exact preserves RGB even at alpha=0, so GPU mip filtering also stays equal.
 execFileSync('cwebp',['-quiet','-lossless','-exact','-m','6',path.join(scratch,'atlas.png'),'-o',path.join(scratch,'atlas.webp')]);
 atlas=fs.readFileSync(path.join(scratch,'atlas.webp'));
}finally{fs.rmSync(scratch,{recursive:true,force:true});}
const decodedPNG=await sharp(pngAtlas).ensureAlpha().raw().toBuffer(),decodedWebP=await sharp(atlas).ensureAlpha().raw().toBuffer();if(!decodedPNG.equals(decodedWebP))throw Error('Lossless atlas changed RGBA pixels');
doc.createExtension(EXTTextureWebP).setRequired(true);
const texture=doc.createTexture('original-tropical-leaf-clusters').setImage(atlas).setMimeType('image/webp');
const material=doc.createMaterial('tropical-scenery-alpha-clusters').setBaseColorFactor([1,1,1,1]).setBaseColorTexture(texture).setAlphaMode('MASK').setAlphaCutoff(.25).setDoubleSided(true).setRoughnessFactor(.86).setMetallicFactor(0).setExtras({atlasSurface:true});
const outline=JSON.parse(fs.readFileSync('scripts/geo/water/baseline-parts.json','utf8')).parts.find((p:any)=>p.id==='forest-hill').primitive.shape;
const base=catchmentTerrain(outline),mesh=new Mesh(base,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld(true);const ray=new Raycaster();
const ground=(x:number,z:number)=>{ray.set(new Vector3(x,2,z),new Vector3(0,-1,0));return ray.intersectObject(mesh,false)[0]?.point.y??.10;};
const treeForms=variants(),instances:any[]=[];
const terrain=new Sculpture();terrain.add(base,'f-elastic',.30);
const forest=[opaqueUV(terrain.finish())];
for(let i=0;i<treeSites.length;i++){
 const at=[...treeSites[i]!] as [number,number,number];at[1]=ground(at[0],at[2]);
 const form=treeForms[i%7===0?3:i%6===0?2:i%2]!,h=.34+(.5+.5*Math.sin(i*7.43))*.23;
 const g=instantiateTree(form,at,h,730+i,ground);g.setAttribute('treeId',new Float32BufferAttribute(new Float32Array(g.getAttribute('position').count).fill(i+1),1));forest.push(g);instances.push({part:'forest-hill',variant:form.name,at,height:h,seed:730+i});
}
// Layered ground vegetation, with clear runoff corridors and no new tree boles.
const understoryRandom=random(914),runoff=JSON.parse(fs.readFileSync('scripts/geo/water/baseline-parts.json','utf8')).flows.find((f:any)=>f.id==='runoff').paths.filter((p:any)=>p.id.startsWith('hill-')).flatMap((p:any)=>{const a=bakeFlowPath(p.path).points,points:number[][]=[];for(let i=0;i<a.length;i+=3)points.push([a[i]!,a[i+1]!,a[i+2]!]);return points;});
let shrubs=0;const shrubSites:any[]=[];
for(let attempt=0;attempt<600&&shrubs<32;attempt++){
 const x=1.04+understoryRandom()*2.05,z=-1.17+understoryRandom()*.90;
 ray.set(new Vector3(x,2,z),new Vector3(0,-1,0));const hit=ray.intersectObject(mesh,false)[0];if(!hit)continue;
 if(runoff.some((p:number[])=>Math.hypot(x-p[0]!,z-p[2]!)<.23))continue;
 const at:[number,number,number]=[x,hit.point.y-.001,z],height=.065+understoryRandom()*.065;
 const g=understorey(at,height,1870+shrubs);shrubSites.push({at,height,maxRadius:height*1.65});
 g.setAttribute('treeId',new Float32BufferAttribute(new Float32Array(g.getAttribute('position').count),1));forest.push(g);shrubs++;
}
const city=[estate()];for(let i=0;i<urbanSites.length;i++){
 const form=treeForms[i%2===0?2:3]!,at=urbanSites[i]!;
 const g=instantiateTree(form,at,.13+(i%2)*.012,990+i);g.setAttribute('treeId',new Float32BufferAttribute(new Float32Array(g.getAttribute('position').count).fill(i+1),1));city.push(g);instances.push({part:'city-blocks',variant:form.name,at,height:.13+(i%2)*.012,seed:990+i});
}
for(const g of [forest[0]!,city[0]!])g.setAttribute('treeId',new Float32BufferAttribute(new Float32Array(g.getAttribute('position').count),1));
function add(id:string,g:BufferGeometry){
 const p=doc.createPrimitive().setMaterial(material);
 for(const [name,semantic,type] of [['position','POSITION','VEC3'],['normal','NORMAL','VEC3'],['color','COLOR_0','VEC3'],['uv','TEXCOORD_0','VEC2']]as const)p.setAttribute(semantic,doc.createAccessor().setBuffer(buffer).setType(type).setArray(new Float32Array(g.getAttribute(name).array)));
 p.setAttribute('_TREE_ID',doc.createAccessor().setBuffer(buffer).setType('SCALAR').setArray(new Float32Array(g.getAttribute('treeId').array)));
 p.setIndices(doc.createAccessor().setBuffer(buffer).setType('SCALAR').setArray(new Uint32Array(g.index!.array)));
 scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(p)).setExtras({closed:false,treeInstances:instances.filter(p=>p.part===id).map(({part,seed,height,...p})=>({...p,at:p.at.map((n:number)=>Number(n.toFixed(6)))})),understoreyShrubs:id==='forest-hill'?shrubs:0,understoreyPlants:id==='forest-hill'?shrubSites.map(p=>[...p.at.map((n:number)=>Number(n.toFixed(6))),Math.ceil(p.maxRadius*1e6)/1e6]):[]}));
}
add('forest-hill',mergeGeometries(forest));add('city-blocks',mergeGeometries(city));
await doc.transform(weld());
const protectedLeafTriangles:Record<string,number>={};
for(const m of doc.getRoot().listMeshes()){
 const p=m.listPrimitives()[0]!,uv=p.getAttribute('TEXCOORD_0')!,idx=p.getIndices()!,leaves:number[]=[],opaque:number[]=[];
 for(let i=0;i<idx.getCount();i+=3){const tri=[idx.getScalar(i),idx.getScalar(i+1),idx.getScalar(i+2)],isLeaf=tri.some(j=>{const a=uv.getElement(j,[0,0]);return Math.abs(a[0]!-.75)>.01||Math.abs(a[1]!-.75)>.01;});(isLeaf?leaves:opaque).push(...tri);}
 protectedLeafTriangles[m.getName()]=leaves.length/3;
 const foliage=compactPrimitive(p.clone().setIndices(doc.createAccessor().setBuffer(buffer).setType('SCALAR').setArray(new Uint32Array(leaves))));
 const solid=compactPrimitive(p.clone().setIndices(doc.createAccessor().setBuffer(buffer).setType('SCALAR').setArray(new Uint32Array(opaque))));
 simplifyPrimitive(solid,{simplifier:MeshoptSimplifier,ratio:m.getName()==='city-blocks'?.39:.42,error:.00045,lockBorder:false});
 const joined=joinPrimitives([solid,foliage]);m.removePrimitive(p).addPrimitive(joined);p.dispose();solid.dispose();foliage.dispose();
}
await doc.transform(prune());console.log({protectedLeafTriangles});
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:12,quantizeNormal:8,quantizeColor:8,quantizeTexcoord:12}));
const replacementBytes=compressPosition(await io.writeBinary(doc),12);
const replacement=await io.readBinary(replacementBytes);
const accepted=original.getRoot().listNodes().filter(n=>n.getMesh()&&!['forest-hill','city-blocks'].includes(n.getName()));
const fingerprint=(node:any)=>createHash('sha256').update(JSON.stringify({matrix:node.getWorldMatrix(),attributes:node.getMesh().listPrimitives().map((p:any)=>({attributes:p.listSemantics().map((s:string)=>[s,Array.from(p.getAttribute(s).getArray())]),indices:Array.from(p.getIndices().getArray()),material:p.getMaterial().getExtras()}))})).digest('hex');
const fingerprints=Object.fromEntries(accepted.map(n=>[n.getName(),fingerprint(n)]));
for(const n of original.getRoot().listNodes())if(['forest-hill','city-blocks'].includes(n.getName()))n.dispose();
const map=mergeDocuments(original,replacement),targetScene=original.getRoot().listScenes()[0]!;
for(const n of replacement.getRoot().listScenes()[0]!.listChildren())targetScene.addChild(map.get(n)! as GltfNode);
for(const s of original.getRoot().listScenes().slice(1))s.dispose();
await original.transform(prune());
for(const n of accepted)if(fingerprint(n)!==fingerprints[n.getName()])throw Error('Accepted mesh changed: '+n.getName());
const buffers=original.getRoot().listBuffers();for(const a of original.getRoot().listAccessors())a.setBuffer(buffers[0]!);for(const b of buffers.slice(1))b.dispose();
const binary=withLabelPoints(combineScenery(fs.readFileSync(source),replacementBytes));if(binary.length>1_500_000)throw Error('GLB budget: '+binary.length);
const before=JSON.parse(fs.readFileSync(`${output}/round2-before-metrics.json`,'utf8'));
for(const [name,hash]of Object.entries(before.acceptedFingerprints))if(fingerprints[name]!==hash)throw Error('Committed round-1 baseline changed: '+name);
const after={...before.after};for(const id of ['forest-hill','city-blocks'])after[id]=original.getRoot().listNodes().find(n=>n.getName()===id)!.getMesh()!.listPrimitives()[0]!.getIndices()!.getCount()/3;
const triangles=Object.values(after).reduce((a:any,b:any)=>a+b,0) as number;if(triangles>350_000)throw Error('Triangle budget: '+triangles);
fs.writeFileSync('public/models/water.glb',binary);
const metrics={iteration,trianglesBefore:before.trianglesAfter,trianglesAfter:triangles,perPartBefore:{'forest-hill':before.after['forest-hill'],'city-blocks':before.after['city-blocks']},perPartAfter:{'forest-hill':after['forest-hill'],'city-blocks':after['city-blocks']},drawCallsBefore:60,drawCallsAfter:60,glbBytesBefore:before.glbBytesAfter,glbBytesAfter:binary.length,atlasBytes:texture.getImage()!.length,atlasMime:'image/webp',atlasLosslessRGBA:true,protectedLeafTriangles,acceptedMeshesUnchanged: Object.keys(fingerprints),acceptedFingerprints:fingerprints,treeInstances:instances,sha256:createHash('sha256').update(binary).digest('hex')};
fs.writeFileSync(`${output}/round2-iteration${iteration}-metrics.json`,JSON.stringify(metrics,null,2)+'\n');fs.writeFileSync(`${output}/round2-final-metrics.json`,JSON.stringify(metrics,null,2)+'\n');
fs.writeFileSync(`${output}/final-asset.json`,JSON.stringify({glb:'public/models/water.glb',sha256:metrics.sha256,bytes:binary.length,trianglesOnScreen:triangles,drawCallsEstimate:60,geometryCode:['scripts/geo/water/scenery.ts','scripts/geo/water/vegetation.ts','scripts/geo/water/estate.ts'],method:'Lossless accepted-mesh splice; decoded meshopt GLB; CPU studio PBR + sampled RoomEnvironment + ACES + actual embedded alpha atlas with mip filtering',enginePatch:'applied in GltfSource.tsx: alphaTest scales with fade opacity; alpha-to-coverage while opaque',GPUAcceptance:'Claude GPU acceptance 2026-11-09'},null,2)+'\n');console.log({iteration,triangles,glbBytes:binary.length,atlasBytes:metrics.atlasBytes});

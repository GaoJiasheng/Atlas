/** Surgical residual polish: preserve all accepted meshes and all topic data.
 * Usage: pnpm tsx scripts/geo/states-of-matter/polish-batch.mjs [baseline.glb] [--only sponge|ice-cube]
 * `--only` regenerates one of the two parts and keeps the other exactly as shipped.
 * The baseline is immutable; repeat iterations never accumulate deformation. */
import fs from 'node:fs';
import {Document,NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression,KHRTextureTransform} from '@gltf-transform/extensions';
import {weld,dedup,meshopt,prune,mergeDocuments,simplifyPrimitive} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import {BufferAttribute,Color} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {preserveNormalStreams} from './preserve-normal-streams.mjs';
import {celluloseSponge,foamMaps} from './cellulose-sponge.mjs';
import {clearIce} from './round2-forms.mjs';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const SPONGE_NORMAL_SCALE=.9;
const args=process.argv.slice(2),onlyAt=args.indexOf('--only'),only=onlyAt>=0?args.splice(onlyAt,2)[1]:undefined;
const baseline=args[0]??'public/models/states-of-matter.glb',REBUILT=['ice-cube','sponge'].filter(id=>!only||id===only);
if(!REBUILT.length)throw new Error(`--only takes ice-cube or sponge`);
const encoder={...MeshoptEncoder,encodeGltfBuffer:(s,c,z,m)=>m==='ATTRIBUTES'?MeshoptEncoder.encodeVertexBufferLevel(s,c,z,3,0):MeshoptEncoder.encodeGltfBuffer(s,c,z,m)};
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':encoder,'meshopt.decoder':MeshoptDecoder});
const bytes=fs.readFileSync(baseline),doc=await io.readBinary(bytes);
const css=fs.readFileSync('src/theme/tokens.css','utf8'),token=n=>new Color(css.match(new RegExp(`--${n}:\\s*(#[a-f0-9]{6})`,'i'))[1]),P=Object.fromEntries(['ink','cold','hot','paper','neutral','bone'].map(k=>[k,token(k)]));
const replacement=new Document(),buffer=replacement.createBuffer(),scene=replacement.createScene();
for(const id of REBUILT){
 const old=doc.getRoot().listNodes().find(n=>n.getName()===id),op=old.getMesh().listPrimitives()[0];let g;
 if(id==='ice-cube')g=mergeGeometries(clearIce({},P).map(g=>{g.setAttribute('layer',new BufferAttribute(new Float32Array(g.getAttribute('position').count).fill(g.userData.iceLayer),1));return g.index?g.toNonIndexed():g;}));
 else{g=celluloseSponge();g.translate(-.45,.035,.14);}

 const prim=replacement.createPrimitive();for(const [a,s]of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0'],['uv','TEXCOORD_0']]){const attr=g.getAttribute(a);if(!attr)continue;prim.setAttribute(s,replacement.createAccessor().setType(attr.itemSize===4?'VEC4':attr.itemSize===2?'VEC2':'VEC3').setArray(new Float32Array(attr.array)).setBuffer(buffer));}
 prim.setIndices(replacement.createAccessor().setType('SCALAR').setArray(g.index?new Uint32Array(g.index.array):Uint32Array.from({length:g.getAttribute('position').count},(_,i)=>i)).setBuffer(buffer));
 if(id==='ice-cube')prim.setAttribute('_LAYER',replacement.createAccessor().setType('SCALAR').setArray(new Float32Array(g.getAttribute('layer').array)).setBuffer(buffer));
 const material=replacement.createMaterial(id).setBaseColorFactor(op.getMaterial().getBaseColorFactor()).setRoughnessFactor(op.getMaterial().getRoughnessFactor()).setMetallicFactor(0).setAlphaMode(id==='ice-cube'?'BLEND':'OPAQUE').setDoubleSided(id==='sponge').setExtras({atlasSurface:true});prim.setMaterial(material);
 if(id==='sponge'){
  // Fine open cells: baked normal and occlusion maps of the same cell structure.
  const maps=await foamMaps(),m=prim.getMaterial();
  m.setBaseColorTexture(replacement.createTexture('cellulose-fine-cells-occlusion').setImage(maps.occlusionJpg).setMimeType('image/jpeg'));
  m.setNormalTexture(replacement.createTexture('cellulose-fine-cells-normal').setImage(maps.normalJpg).setMimeType('image/jpeg'));
  m.setNormalScale(SPONGE_NORMAL_SCALE).setExtras({atlasSurface:true,atlasMicrostructure:true});
  // Tile-unit UVs are stored normalised (so they quantise) and scaled back by
  // a texture transform shared by both maps.
  const uv=prim.getAttribute('TEXCOORD_0'),values=new Float32Array(uv.getArray()),min=[Infinity,Infinity],max=[-Infinity,-Infinity];
  for(let i=0;i<values.length;i++){min[i%2]=Math.min(min[i%2],values[i]);max[i%2]=Math.max(max[i%2],values[i]);}
  const range=max.map((v,k)=>v-min[k]);for(let i=0;i<values.length;i++)values[i]=(values[i]-min[i%2])/range[i%2];uv.setArray(values);
  const transform=replacement.createExtension(KHRTextureTransform);
  for(const info of [m.getBaseColorTextureInfo(),m.getNormalTextureInfo()])info.setExtension('KHR_texture_transform',transform.createTransform().setOffset(min).setScale(range));
  fs.mkdirSync('scripts/geo/states-of-matter/evidence',{recursive:true});fs.writeFileSync('scripts/geo/states-of-matter/evidence/cellulose-sponge.json',JSON.stringify({structure:g.userData.spongeStructure,mouths:g.userData.mouths,normalBytes:maps.normalJpg.length,occlusionBytes:maps.occlusionJpg.length},null,1));
 }
 const node=replacement.createNode(id).setMesh(replacement.createMesh(id).addPrimitive(prim));scene.addChild(node);
}
await replacement.transform(weld());
// Ice flat windows simplify independently of inclusions and fracture sheets;
// retain its thin crack topology rather than collapse it with the outer shell.
const ice=replacement.getRoot().listMeshes().find(m=>m.getName()==='ice-cube')?.listPrimitives()[0];
if(ice){
const layer=ice.getAttribute('_LAYER'),attributes=new Float32Array(ice.getAttribute('NORMAL').getCount()*4);
for(let i=0;i<attributes.length/4;i++){attributes.set(ice.getAttribute('NORMAL').getElement(i,[0,0,0]),i*4);attributes[i*4+3]=ice.getAttribute('COLOR_0').getElement(i,[0,0,0,0])[3];}
simplifyPrimitive(ice,{simplifier:{...MeshoptSimplifier,simplify:(indices,positions,stride,_target,_error,flags)=>{const out=[];for(let rank=0;rank<5;rank++){const selected=[];for(let k=0;k<indices.length;k+=3)if(layer.getScalar(indices[k])===rank)selected.push(indices[k],indices[k+1],indices[k+2]);const [ix]=MeshoptSimplifier.simplifyWithAttributes(new Uint32Array(selected),positions,stride,attributes,4,rank===4?[2,2,2,4]:[.2,.2,.2,1],null,Math.min(selected.length,[400,150,1000,1350,2000][rank]*3),rank===4?.008:.08,rank===4?[]:flags);out.push(...ix);}return [new Uint32Array(out),0];}},ratio:.25,error:.0015,lockBorder:true});
}
// Spend the entropy budget on the cavity mouths rather than imperceptible
// detail: 50 micrometre coordinates, and normals and cavity occlusion in steps
// fine enough not to band across the large, flat triangles of the faces.
for(const mesh of replacement.getRoot().listMeshes())for(const p of mesh.listPrimitives()){
 if(mesh.getName()!=='sponge')continue;
 for(const [s,step]of [['POSITION',.00005],['NORMAL',1/31],['COLOR_0',1/24]]){const a=p.getAttribute(s);a.setArray(new Float32Array(a.getArray()).map(v=>Math.round(v/step)*step));}
}
await replacement.transform(dedup(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:13,quantizeNormal:8,quantizeColor:8,quantizeTexcoord:14}));
if(ice){
const il=ice.getAttribute('_LAYER'),ix=ice.getIndices(),tri=[];for(let i=0;i<ix.getCount();i+=3){const ids=[0,1,2].map(k=>ix.getScalar(i+k));const[a,b,c]=ids.map(id=>ice.getAttribute('POSITION').getElement(id,[0,0,0])),e=b.map((v,k)=>v-a[k]),f=c.map((v,k)=>v-a[k]),nx=e[1]*f[2]-e[2]*f[1],ny=e[2]*f[0]-e[0]*f[2],nz=e[0]*f[1]-e[1]*f[0];tri.push({ids,rank:il.getScalar(ids[0]),up:ny/(Math.hypot(nx,ny,nz)||1)});}
// The blended ice writes no depth, so index order is paint order: the dish's
// underside and outer wall go first and its upward floor last.
tri.sort((a,b)=>a.rank-b.rank||(a.rank===0?a.up-b.up:0));ix.setArray(new Uint32Array(tri.flatMap(t=>t.ids)));ice.setAttribute('_LAYER',null);il.dispose();
}
const map=mergeDocuments(doc,replacement);
for(const id of REBUILT){const old=doc.getRoot().listNodes().find(n=>n.getName()===id),source=replacement.getRoot().listNodes().find(n=>n.getName()===id),copy=map.get(source);old.setMesh(copy.getMesh()).setMatrix(copy.getMatrix());copy.dispose();}
// The donor scene has no remaining nodes; do not accumulate empty scenes on
// repeated surgical rebuilds.
for(const scene of replacement.getRoot().listScenes())map.get(scene).dispose();
for(const scene of doc.getRoot().listScenes())if(scene!==doc.getRoot().getDefaultScene()&&!scene.listChildren().length)scene.dispose();
// Remove only now-unreferenced resources; no quantisation of accepted meshes.
await doc.transform(prune());
const targetBuffer=doc.getRoot().listBuffers()[0];for(const a of doc.getRoot().listAccessors())a.setBuffer(targetBuffer);for(const b of doc.getRoot().listBuffers().slice(1))b.dispose();
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.FILTER});
const output=preserveNormalStreams(bytes,await io.writeBinary(doc),REBUILT),counts=Object.fromEntries(doc.getRoot().listMeshes().map(m=>[m.getName(),m.listPrimitives().reduce((s,p)=>s+p.getIndices().getCount()/3,0)]));
console.log({bytes:output.length,triangles:Object.values(counts).reduce((a,b)=>a+b,0),ice:counts['ice-cube'],sponge:counts.sponge});
fs.writeFileSync('/private/tmp/states-of-matter-candidate.glb',output);
if(output.length>1500000)throw new Error('1.5 MB budget exceeded');
fs.writeFileSync('public/models/states-of-matter.glb',output);

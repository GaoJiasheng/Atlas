/** Round-2 shipping-path audit. Run with pnpm exec tsx; no browser or GPU.
 * Unlike the original counter, this counts every glTF primitive and rejects
 * nodes whose additional primitives the production first-mesh route discards.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {parseShippingGLB} from './node-gltf.ts';
import {MeshStandardMaterial,PropertyBinding} from 'three';
import {parse as parseYaml} from 'yaml';
import {partsFile} from '../../../src/engines/space-scene/schema.ts';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
import {gltfSurface} from '../../../src/engines/space-scene/stages/model3d/GltfSource.tsx';

const root='scripts/geo/states-of-matter',topic='src/content/topics/states-of-matter';
const accepted=['bicycle-wheel','floor-pump','ball-pump','balloon-pump','basketball','balloon-round','balloon-long','torch','bench','side-table','sand-grains'];
// Captured from the committed round-1 chapters before implementation began.
const chapterHashes={
 '00-before-you-start.mdx':'e0f10edeecad7f473a973a063bb6613766be951e1700837097de580b2bd46100',
 '01-mass-and-space.mdx':'36d5fa37b2e4b89c7d5b05bc36f6f9d7fc1f528ed8bdf40f1da467de3a190852',
 '02-solids.mdx':'b27accb4617d1e19f6757b97075a08d6fbd6886f606a6605125888d8b5c8aabc',
 '03-liquids.mdx':'bddd00e6d5a9a3ce2a2186c63c1290e779292464c55f1170b731ec4fc943fad8',
 '04-air-is-matter.mdx':'72c1974db7af4b9ffdc375926cdc76d619f407618b086c00495ea5bccba1b640',
 '05-gases.mdx':'dc61a100ef24ed7942bbade114ce5d722a789b7fabc84fbeb82d47481709ae62',
 '06-sorting-matter.mdx':'765e50e6ed661559ad6a6dbdaada9a4cbca2eff21c6387893bb80ce344cce981',
};
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const old=read(`${root}/evidence/round1-parts.json`),raw=read(`${topic}/data/parts.json`),file=partsFile.parse(raw);
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const [baseline,shipping]=await Promise.all([io.read(`${root}/evidence/round1.glb`),io.read(`public${file.model}`)]);
await baseline.transform(dequantize());await shipping.transform(dequantize());
const nodes=doc=>new Map(doc.getRoot().listNodes().map(n=>[n.getName(),n]));
const beforeNodes=nodes(baseline),afterNodes=nodes(shipping);
const almost=(a,b,tolerance,message)=>{
 assert.equal(a.length,b.length,`${message}: length`);let delta=0;
 for(let i=0;i<a.length;i++)delta=Math.max(delta,Math.abs(a[i]-b[i]));
 assert.ok(delta<=tolerance,`${message}: max delta ${delta} > ${tolerance}`);return delta;
};
const material=m=>({base:m.getBaseColorFactor(),roughness:m.getRoughnessFactor(),metalness:m.getMetallicFactor(),alphaMode:m.getAlphaMode(),alphaCutoff:m.getAlphaCutoff(),doubleSided:m.getDoubleSided(),extras:m.getExtras()});
const preserved=[];
for(const id of accepted){
 const a=structuredClone(old.parts.find(p=>p.id===id)),b=raw.parts.find(p=>p.id===id);if(id==='bench')a.material={color:'wood',tint:'#d3b58b'};if(id==='side-table')a.material={color:'wood',tint:'#c9a57a'};assert.deepEqual(b,a,`${id}: accepted part data changed`);
 const x=beforeNodes.get(a.mesh),y=afterNodes.get(b.mesh);assert.ok(x&&y,`${id}: missing node`);
 almost(x.getWorldMatrix(),y.getWorldMatrix(),1e-9,`${id}: world transform`);
 const ap=x.getMesh().listPrimitives(),bp=y.getMesh().listPrimitives();assert.equal(bp.length,ap.length,`${id}: primitive count`);
 let maxDecodedDelta=0;
 for(let j=0;j<ap.length;j++){
  assert.equal(bp[j].getMode(),ap[j].getMode(),`${id}: primitive mode`);
  assert.deepEqual(bp[j].listSemantics().sort(),ap[j].listSemantics().sort(),`${id}: attributes`);
  assert.deepEqual(bp[j].getIndices().getArray(),ap[j].getIndices().getArray(),`${id}: triangle connectivity`);
  for(const semantic of ap[j].listSemantics()){
   const aa=ap[j].getAttribute(semantic),bb=bp[j].getAttribute(semantic);assert.equal(bb.getType(),aa.getType(),`${id}/${semantic}: type`);
   maxDecodedDelta=Math.max(maxDecodedDelta,almost(aa.getArray(),bb.getArray(),1e-7,`${id}/${semantic}: decoded values`));
  }
  assert.deepEqual(material(bp[j].getMaterial()),material(ap[j].getMaterial()),`${id}: material changed`);
 }
 preserved.push({id,primitives:ap.length,maxDecodedDelta});
}
assert.deepEqual(raw.parts.map(p=>p.id),old.parts.map(p=>p.id),'part ids/order');
for(const key of new Set([...Object.keys(old),...Object.keys(raw)]))if(!['parts','model'].includes(key))assert.deepEqual(raw[key],old[key],`${key}: teaching contract changed`);
const semantics=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['primitive','extra','mesh','material'].includes(k)));
for(const p of raw.parts)assert.deepEqual(semantics(p),semantics(old.parts.find(q=>q.id===p.id)),`${p.id}: text/labels/explode/attachment metadata changed`);
const chapterNames=fs.readdirSync(`${topic}/chapters`).filter(n=>n.endsWith('.mdx')).sort();
assert.deepEqual(chapterNames,Object.keys(chapterHashes).sort(),'chapter inventory');
for(const name of chapterNames)assert.equal(hash(fs.readFileSync(`${topic}/chapters/${name}`)),chapterHashes[name],`${name}: chapter/beat/text changed`);

function counts(data,doc){
 const ns=nodes(doc),byPart={};
 for(const p of partsFile.parse(data).parts){
  if(p.mesh){
   const node=ns.get(p.mesh);assert.ok(node,`${p.id}: missing source node ${p.mesh}`);
   let triangles=0,draws=0;const visit=n=>{for(const primitive of n.getMesh()?.listPrimitives()??[]){assert.equal(primitive.getMode(),4,`${p.id}: triangle mode required`);triangles+=(primitive.getIndices()?.getCount()??primitive.getAttribute('POSITION').getCount())/3;draws++;}for(const child of n.listChildren())visit(child);};visit(node);
   assert.ok(draws>0,`${p.id}: source node has no geometry`);byPart[p.id]={triangles,draws};
  }else{
   const pieces=partPieces(p);byPart[p.id]={triangles:pieces.reduce((sum,x)=>sum+(x.geometry.index?.count??x.geometry.getAttribute('position').count)/3*(x.matrices?.length??1),0),draws:pieces.length};
   for(const piece of pieces)piece.geometry.dispose();
  }
 }
 return {triangles:Object.values(byPart).reduce((s,p)=>s+p.triangles,0),draws:Object.values(byPart).reduce((s,p)=>s+p.draws,0),byPart};
}
const before={...counts(old,baseline),glbBytes:fs.statSync(`${root}/evidence/round1.glb`).size};
const after={...counts(raw,shipping),glbBytes:fs.statSync(`public${file.model}`).size};

// Native GLTFLoader owns meshopt, texture UV/alpha interpretation and material
// construction. Only image decoding is substituted with Sharp in Node.
globalThis.self=globalThis;
globalThis.createImageBitmap=async blob=>{const meta=await sharp(Buffer.from(await blob.arrayBuffer())).metadata();return {width:meta.width,height:meta.height,close(){}};};
const bytes=fs.readFileSync(`public${file.model}`);
const gltf=await parseShippingGLB(bytes);
const materialRoute=[];
for(const p of file.parts.filter(p=>p.mesh)){
 const node=gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(p.mesh));assert.ok(node,`${p.id}: GLTFLoader name route`);
 const meshes=[];node.traverse(o=>{if(o.isMesh)meshes.push(o);});
 // GltfSource.findMesh returns just the first descendant. A source with more
 // than one mesh must fail, even though its offline renderer could draw all.
 assert.equal(meshes.length,1,`${p.id}: production first-mesh route would discard ${meshes.length-1} source meshes`);
 const mesh=meshes[0];assert.ok(!Array.isArray(mesh.material),`${p.id}: production single-material route`);
 const surface=gltfSurface(mesh);assert.ok(surface,`${p.id}: missing atlasSurface opt-in`);
 const target=new MeshStandardMaterial({color:'#ffffff'});surface.style(target);surface.fade(target,1,false);
 assert.deepEqual(target.color.toArray(),surface.source.color.toArray(),`${p.id}: source colour route`);
 assert.equal(target.map,surface.source.map,`${p.id}: base colour/alpha texture route`);
 assert.equal(target.alphaTest,surface.source.alphaTest,`${p.id}: alpha cutoff route`);
 assert.equal(target.roughness,surface.source.roughness,`${p.id}: roughness route`);
 assert.equal(target.metalness,surface.source.metalness,`${p.id}: metalness route`);
 assert.equal(target.opacity,surface.source.opacity,`${p.id}: source opacity route`);
 assert.equal(target.vertexColors,surface.source.vertexColors,`${p.id}: vertex colour route`);
 materialRoute.push({id:p.id,sourceMeshes:meshes.length,draws:1,textureDelivered:!!target.map,alphaTest:target.alphaTest,opacity:target.opacity,transparent:target.transparent,sourceNormalMap:!!surface.source.normalMap,normalMapDelivered:!!target.normalMap});target.dispose();
}
assert.ok(after.draws<=90,`all-parts draws ${after.draws} > 90`);
assert.ok(after.triangles<=350000,`all-parts triangles ${after.triangles} > 350000`);
assert.ok(after.glbBytes<=1500000,`GLB ${after.glbBytes} > 1500000 bytes`);
const views=[];
for(const name of chapterNames){const text=fs.readFileSync(`${topic}/chapters/${name}`,'utf8'),frontmatter=parseYaml(text.split(/^---$/m)[1]),state=frontmatter.state;for(const [beat,st]of [state,...(state.beats??[]).map(b=>({...state,...b}))].entries()){
 const visible=file.parts.filter(p=>(!p.group||(st.layers??[]).includes(p.group))&&!(st.hide??[]).includes(p.id));views.push({chapter:frontmatter.id,beat,triangles:visible.reduce((s,p)=>s+after.byPart[p.id].triangles,0),draws:visible.reduce((s,p)=>s+after.byPart[p.id].draws,0)});
}}
const result={passed:true,productionRoute:'GLTFLoader + gltfSurface; one source mesh per part enforced',geometryTolerance:1e-7,acceptedPreserved:preserved,partIdsAndTeachingContractUnchanged:true,chaptersSha256:chapterHashes,before,after,materialRoute,authoredViews:views,glbSha256:hash(bytes)};
fs.writeFileSync(`${root}/evidence/audit-round2.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify({passed:true,preservedA:preserved.length,before:{triangles:before.triangles,draws:before.draws,glbBytes:before.glbBytes},after:{triangles:after.triangles,draws:after.draws,glbBytes:after.glbBytes},materialRoute},null,2));

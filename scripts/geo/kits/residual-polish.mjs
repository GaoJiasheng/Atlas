/** Build-time helpers for the eight-topic residual pass. No runtime imports. */
import fs from 'node:fs';
import {Document,NodeIO,Logger} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,meshopt,simplify,simplifyPrimitive} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
export const evidence='/tmp/atlas-residual-polish-2026-11-05';
/** Adjust one leaf node after decoding/measurement; keep compressed geometry
 * untouched. Ten decimal places are far finer than the specimen's quantizer. */
export function fitLeafNode(path,id,origin,scale){
 const src=fs.readFileSync(path),oldLength=src.readUInt32LE(12),j=JSON.parse(src.subarray(20,20+oldLength).toString()),n=j.nodes.find(n=>n.name===id);
 if(!n||n.matrix||n.children?.length||!(scale>0&&scale<=1))throw Error('Expected a leaf SRT node and uniform contraction');
 const round=v=>Math.round(v*1e10)/1e10;
 n.scale=(n.scale??[1,1,1]).map(v=>round(v*scale));
 n.translation=(n.translation??[0,0,0]).map((v,k)=>round(origin[k]+scale*(v-origin[k])));
 let txt=JSON.stringify(j);txt+=' '.repeat((4-Buffer.byteLength(txt)%4)%4);const json=Buffer.from(txt),rest=src.subarray(20+oldLength),out=Buffer.alloc(20+json.length+rest.length);
 src.copy(out,0,0,12);out.writeUInt32LE(out.length,8);out.writeUInt32LE(json.length,12);out.writeUInt32LE(0x4e4f534a,16);json.copy(out,20);rest.copy(out,20+json.length);fs.writeFileSync(path,out);
}
export async function io(){await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);return new NodeIO().setLogger(new Logger(Logger.Verbosity.ERROR)).registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});}
export async function compile(path,items,{ratio=1,error=.0001,position=16,normal=12,normalWeight=0}={}){
 const doc=new Document().setLogger(new Logger(Logger.Verbosity.ERROR)),buffer=doc.createBuffer(),scene=doc.createScene('residual-polish');
 doc.getRoot().getAsset().copyright='Original Atlas build-time geometry; repository MIT licence. No third-party meshes or photographic textures.';
 for(const {id,geometry:g,at=[0,0,0],material={roughness:.82,metalness:0},extras={closed:true}} of items){
  const p=doc.createPrimitive(),m=doc.createMaterial(id).setBaseColorFactor([1,1,1,1]).setRoughnessFactor(material.roughness).setMetallicFactor(material.metalness).setExtras(material.extras??{atlasSurface:true});p.setMaterial(m);
  for(const [a,s]of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0'],['uv','TEXCOORD_0'],['uv1','TEXCOORD_1']]){const v=g.getAttribute(a);if(v)p.setAttribute(s,doc.createAccessor().setBuffer(buffer).setType('VEC'+v.itemSize).setArray(new Float32Array(v.array)));}
  p.setIndices(doc.createAccessor().setBuffer(buffer).setType('SCALAR').setArray(new Uint32Array(g.index?.array??Array.from({length:g.getAttribute('position').count},(_,i)=>i))));
  scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(p)).setTranslation(at).setExtras(extras));
 }
 const codec=await io();await doc.transform(weld());if(ratio<1){if(normalWeight){for(const mesh of doc.getRoot().listMeshes()){const p=mesh.listPrimitives()[0],attrs=new Float32Array(p.getAttribute('NORMAL').getArray()),simplifier={...MeshoptSimplifier,simplify:(indices,positions,stride,target,error,flags)=>MeshoptSimplifier.simplifyWithAttributes(indices,positions,stride,attrs,3,[normalWeight,normalWeight,normalWeight],null,target,error,flags)};simplifyPrimitive(p,{simplifier,ratio,error,lockBorder:true});}}else await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio,error,lockBorder:true}));}
 await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:position,quantizeNormal:normal,quantizeColor:8,quantizeTexcoord:16}));
 await codec.write(path,doc);return doc;
}
/** Raw GLB surgery preserves every retained compressed attribute stream. Only
 * shared index streams are compacted, losslessly, to remove superseded ranges.
 * Materials and node metadata come from the accepted asset. */
export async function install(target,candidate,names,{compactDefaults=false}={}){
 await io();
 const read=path=>{const b=fs.readFileSync(path),n=b.readUInt32LE(12);return {json:JSON.parse(b.subarray(20,20+n).toString()),bin:b.subarray(28+n)};};
 const base=read(target),fresh=read(candidate),j=base.json,c=fresh.json;
 const oldViews=j.bufferViews.length,oldAccess=j.accessors.length;
 const sources=j.bufferViews.map(()=>base.bin);
 for(const v of c.bufferViews){j.bufferViews.push(structuredClone(v));sources.push(fresh.bin);}
 for(const a of c.accessors){const q=structuredClone(a);q.bufferView+=oldViews;j.accessors.push(q);}
 for(const id of names){
  const node=j.nodes.find(n=>n.name===id),cn=c.nodes.find(n=>n.name===id);if(!node||!cn)throw Error('Missing replacement '+id);
  const old=j.meshes[node.mesh].primitives[0],mesh=structuredClone(c.meshes[cn.mesh]);
  for(const p of mesh.primitives){p.indices+=oldAccess;for(const k in p.attributes)p.attributes[k]+=oldAccess;p.material=old.material;}
  j.meshes[node.mesh]=mesh;
  for(const k of ['translation','rotation','scale','matrix']){delete node[k];if(cn[k])node[k]=cn[k];}
 }
 j.extensionsUsed=[...new Set([...(j.extensionsUsed??[]),...(c.extensionsUsed??[])])];j.extensionsRequired=[...new Set([...(j.extensionsRequired??[]),...(c.extensionsRequired??[])])];
 const refs=[];
 for(const m of j.meshes)for(const p of m.primitives){refs.push([p,'indices']);for(const k in p.attributes)refs.push([p.attributes,k]);for(const t of p.targets??[])for(const k in t)refs.push([t,k]);}
 for(const s of j.skins??[])if(s.inverseBindMatrices!==undefined)refs.push([s,'inverseBindMatrices']);
 for(const a of j.animations??[])for(const s of a.samplers)refs.push([s,'input'],[s,'output']);
 const used=[...new Set(refs.map(([o,k])=>o[k]))].sort((a,b)=>a-b),accessMap=new Map(used.map((id,i)=>[id,i]));
 j.accessors=used.map(id=>j.accessors[id]);for(const [o,k]of refs)o[k]=accessMap.get(o[k]);
 const viewRefs=j.accessors.map(a=>[a,'bufferView']);for(const image of j.images??[])if(image.bufferView!==undefined)viewRefs.push([image,'bufferView']);
 const views=[...new Set(viewRefs.map(([o,k])=>o[k]))].sort((a,b)=>a-b),viewMap=new Map(views.map((id,i)=>[id,i]));
 const chunks=[];let length=0,fallback=0;
 const output=[];
 for(const id of views){const v=structuredClone(j.bufferViews[id]),e=v.extensions?.EXT_meshopt_compression,bin=sources[id];let data;
  if(e){data=bin.subarray(e.byteOffset??0,(e.byteOffset??0)+e.byteLength);
   if(compactDefaults&&e.mode==='ATTRIBUTES'){const decoded=new Uint8Array(e.count*e.byteStride);MeshoptDecoder.decodeGltfBuffer(decoded,e.count,e.byteStride,data,e.mode);const packed=MeshoptEncoder.encodeVertexBufferLevel(decoded,e.count,e.byteStride,3,0);if(packed.length<data.length)data=packed;}

   if(e.mode==='TRIANGLES'){
    const decoded=new Uint8Array(e.count*e.byteStride);MeshoptDecoder.decodeGltfBuffer(decoded,e.count,e.byteStride,data,e.mode,e.filter);
    const attrs=j.accessors.filter(a=>a.bufferView===id),count=attrs.reduce((n,a)=>n+a.count,0),compact=new Uint8Array(count*e.byteStride);let offset=0;
    for(const a of attrs){const n=a.count*e.byteStride;compact.set(decoded.subarray(a.byteOffset??0,(a.byteOffset??0)+n),offset);a.byteOffset=offset;offset+=n;}
    data=MeshoptEncoder.encodeGltfBuffer(compact,count,e.byteStride,'TRIANGLES');e.count=count;v.byteLength=compact.length;
   }
   e.buffer=0;e.byteOffset=length;e.byteLength=data.length;v.buffer=1;v.byteOffset=fallback;fallback+=v.byteLength;
  }else{data=bin.subarray(v.byteOffset??0,(v.byteOffset??0)+v.byteLength);v.buffer=0;v.byteOffset=length;}
  chunks.push(Buffer.from(data));length+=data.length;const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}output.push(v);
 }
 for(const [o,k]of viewRefs)o[k]=viewMap.get(o[k]);j.bufferViews=output;j.buffers=[{byteLength:length},{byteLength:fallback,extensions:{EXT_meshopt_compression:{fallback:true}}}];
 if(compactDefaults){for(const v of j.bufferViews){delete v.target;if(v.byteOffset===0)delete v.byteOffset;if(v.extensions?.EXT_meshopt_compression?.byteOffset===0)delete v.extensions.EXT_meshopt_compression.byteOffset;}for(const m of j.meshes)delete m.name;for(const n of j.nodes)if(n.extras?.closed===true){delete n.extras.closed;if(!Object.keys(n.extras).length)delete n.extras;}delete j.asset.generator;j.asset.copyright='Gao Jiasheng / Atlas, 2026. MIT; see LICENSE.';for(const a of j.accessors){if(a.byteOffset===0)delete a.byteOffset;if(a.normalized===false)delete a.normalized;}for(const m of j.meshes)for(const p of m.primitives)if(p.mode===4)delete p.mode;for(const s of j.scenes??[])delete s.name;for(const t of j.textures??[])delete t.name;for(const i of j.images??[])delete i.name;for(const m of j.materials??[]){delete m.name;if(JSON.stringify(m.pbrMetallicRoughness?.baseColorFactor)==='[1,1,1,1]')delete m.pbrMetallicRoughness.baseColorFactor;if(m.alphaMode==='OPAQUE')delete m.alphaMode;if(m.doubleSided===false)delete m.doubleSided;}}
 let txt=JSON.stringify(j);txt+=' '.repeat((4-Buffer.byteLength(txt)%4)%4);const jb=Buffer.from(txt),out=Buffer.alloc(28+jb.length+length);out.writeUInt32LE(0x46546c67);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(jb.length,12);out.writeUInt32LE(0x4e4f534a,16);jb.copy(out,20);out.writeUInt32LE(length,20+jb.length);out.writeUInt32LE(0x004e4942,24+jb.length);Buffer.concat(chunks).copy(out,28+jb.length);if(out.length>1_500_000)throw Error('GLB byte ceiling exceeded: '+out.length);fs.writeFileSync(target,out);return out.length;
}

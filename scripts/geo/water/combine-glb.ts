/** Splice compressed leaf meshes without decoding/re-quantizing accepted assets.
 * Supports this topic's single-scene, rigid, embedded, one-primitive GLBs only.
 * Every referenced buffer view is copied; discarded geometry consumes no bytes.
 */
import { Buffer } from 'node:buffer';
export function combineScenery(accepted:Uint8Array,replacements:Uint8Array){
 const parse=(data:Uint8Array)=>{const b=Buffer.from(data),n=b.readUInt32LE(12);return {json:JSON.parse(b.subarray(20,20+n).toString()),bin:b.subarray(28+n)};};
 const inputs=[parse(accepted),parse(replacements)],chunks:Buffer[]=[],out:any={asset:{version:'2.0',generator:'Atlas water lossless scenery replacement',copyright:'Original procedural Atlas scenery and leaf atlas. MIT, repository LICENSE.'},scene:0,scenes:[{name:'water',nodes:[]}],nodes:[],meshes:[],materials:[],textures:[],images:[],samplers:[],accessors:[],bufferViews:[],buffers:[],extensionsUsed:['EXT_meshopt_compression','KHR_mesh_quantization'],extensionsRequired:['EXT_meshopt_compression','KHR_mesh_quantization']};
 let byteLength=0,fallbackLength=0;
 inputs.forEach(({json,bin},source)=>{
  const maps=new Map<string,Map<number,number>>();
  function item(table:string,index:number):number{
   const map=maps.get(table)??new Map();maps.set(table,map);const existing=map.get(index);if(existing!==undefined)return existing;
   const old=json[table]?.[index];if(!old)throw Error(`Missing ${table}[${index}]`);
   const value=structuredClone(old),newIndex=out[table].length;map.set(index,newIndex);out[table].push(value);
   const remap=(field:string,to:string)=>{if(value[field]!==undefined)value[field]=item(to,value[field]);};
   if(table==='nodes'){
    if(value.children?.length||value.skin!==undefined)throw Error('Expected leaf rigid scenery nodes');
    remap('mesh','meshes');
   }else if(table==='meshes')for(const p of value.primitives){
    if(p.targets)throw Error('No morph targets in water scenery');
    for(const a in p.attributes)p.attributes[a]=item('accessors',p.attributes[a]);
    if(p.indices!==undefined)p.indices=item('accessors',p.indices);
    if(p.material!==undefined)p.material=item('materials',p.material);
   }else if(table==='materials'){
    for(const slot of [value.pbrMetallicRoughness?.baseColorTexture,value.pbrMetallicRoughness?.metallicRoughnessTexture,value.normalTexture,value.occlusionTexture,value.emissiveTexture])if(slot)slot.index=item('textures',slot.index);
   }else if(table==='textures'){remap('source','images');remap('sampler','samplers');if(value.extensions?.EXT_texture_webp)value.extensions.EXT_texture_webp.source=item('images',value.extensions.EXT_texture_webp.source);}
   else if(table==='images'){if(value.uri)throw Error('No external image URI');remap('bufferView','bufferViews');}
   else if(table==='accessors'){if(value.sparse)throw Error('No sparse scenery accessors');remap('bufferView','bufferViews');}
   else if(table==='bufferViews'){
    const compression=value.extensions?.EXT_meshopt_compression;
    const at=compression?.byteOffset??value.byteOffset??0,len=compression?.byteLength??value.byteLength;
    if((compression?.buffer??value.buffer)!==0)throw Error('Expected embedded binary payload');
    const bytes=bin.subarray(at,at+len);if(bytes.length!==len)throw Error('Truncated binary');
    chunks.push(bytes);const padding=(4-(byteLength+bytes.length)%4)%4;
    if(compression){compression.byteOffset=byteLength;compression.buffer=0;value.buffer=1;value.byteOffset=fallbackLength;fallbackLength+=value.byteLength;fallbackLength+= (4-fallbackLength%4)%4;}
    else {value.byteOffset=byteLength;value.buffer=0;}
    byteLength+=bytes.length;if(padding){chunks.push(Buffer.alloc(padding));byteLength+=padding;}
   }
   return newIndex;
  }
  for(let i=0;i<json.nodes.length;i++){
   const node=json.nodes[i],replace=['forest-hill','city-blocks'].includes(node.name);
   if(node.mesh!==undefined&&replace===(source===1))out.scenes[0].nodes.push(item('nodes',i));
  }
 });
 out.extensionsUsed=[...new Set(inputs.flatMap(x=>x.json.extensionsUsed??[]))];out.extensionsRequired=[...new Set(inputs.flatMap(x=>x.json.extensionsRequired??[]))];
 out.buffers=[{byteLength},{byteLength:fallbackLength,extensions:{EXT_meshopt_compression:{fallback:true}}}];
 for(const table of ['samplers','textures','images'])if(out[table].length===0)delete out[table];
 const raw=Buffer.from(JSON.stringify(out)),j=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,32)]),bin=Buffer.concat(chunks),b=Buffer.alloc(28+j.length+bin.length);
 b.writeUInt32LE(0x46546c67,0);b.writeUInt32LE(2,4);b.writeUInt32LE(b.length,8);b.writeUInt32LE(j.length,12);b.writeUInt32LE(0x4e4f534a,16);j.copy(b,20);b.writeUInt32LE(bin.length,20+j.length);b.writeUInt32LE(0x004e4942,24+j.length);bin.copy(b,28+j.length);return b;
}

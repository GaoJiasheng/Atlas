/** Replace a mesh in the topic's geometry-only GLB while copying every retained
 * compressed buffer verbatim. In particular, never re-encode theropod normals:
 * repeated octahedral filtering changes their quantised values by one unit.
 */
type Json=Record<string,any>;
function unpack(bytes:Buffer):{json:Json;bin:Buffer}{
 const length=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+length).toString());
 const start=20+length;return {json,bin:bytes.subarray(start+8,start+8+bytes.readUInt32LE(start))};
}
export function swapMuseumMesh(original:Buffer,replacement:Buffer,anchor:number[]):Buffer{
 const base=unpack(original),fresh=unpack(replacement),json=base.json;
 json.asset.copyright='Original Atlas procedural dinosaur studies: dinosaur-skeleton.ts, sauropod-study.ts and sculpt-museum.ts. CC0-1.0; https://creativecommons.org/publicdomain/zero/1.0/ . No scans or third-party meshes.';
 if(json.skins||json.animations||json.images)throw new Error('This surgical writer supports the geometry-only fossil asset.');
 const nodes=json.nodes.filter((n:Json)=>n.name.endsWith('-study')),meshId=nodes[0].mesh;
 const center=[...nodes.find((n:Json)=>n.name==='apollonia-study').translation];
 const newNode=fresh.json.nodes.find((n:Json)=>n.mesh!==undefined);
 for(const node of nodes){
  const offset=node.translation.map((v:number,i:number)=>v-center[i]);
  node.translation=anchor.map((v,i)=>v+(newNode.translation?.[i]??0)+offset[i]);
  node.scale=newNode.scale??[1,1,1];
 }
 const accessors:Json[]=[],views:Json[]=[],chunks:Buffer[]=[];
 let physical=0,virtual=0;
 const maps=new Map<object,{accessors:Map<number,number>;views:Map<number,number>}>();
 function copyAccessor(source:typeof base,index:number):number{
  let mapping=maps.get(source);if(!mapping){mapping={accessors:new Map(),views:new Map()};maps.set(source,mapping);}
  if(mapping.accessors.has(index))return mapping.accessors.get(index)!;
  const accessor=structuredClone(source.json.accessors[index]);
  if(accessor.sparse)throw new Error('Unexpected sparse accessor.');
  const vi=accessor.bufferView;
  if(!mapping.views.has(vi)){
   const view=structuredClone(source.json.bufferViews[vi]),compression=view.extensions?.EXT_meshopt_compression;
   if(!compression)throw new Error('Expected locally meshopt-compressed geometry.');
   const padding=(4-physical%4)%4;if(padding){chunks.push(Buffer.alloc(padding));physical+=padding;}
   chunks.push(source.bin.subarray(compression.byteOffset,compression.byteOffset+compression.byteLength));
   compression.buffer=0;compression.byteOffset=physical;physical+=compression.byteLength;
   virtual=Math.ceil(virtual/4)*4;view.buffer=1;view.byteOffset=virtual;virtual+=view.byteLength;
   mapping.views.set(vi,views.length);views.push(view);
  }
  accessor.bufferView=mapping.views.get(vi)!;
  mapping.accessors.set(index,accessors.length);accessors.push(accessor);return accessors.length-1;
 }
 // Clone before changing json.accessors; all existing non-museum mesh/node
 // metadata and every buffer payload remain the original authoring data.
 json.meshes=json.meshes.map((mesh:Json,i:number)=>{
  const source=i===meshId?fresh:base;
  const output=structuredClone(i===meshId?fresh.json.meshes[newNode.mesh]:mesh);
  for(const p of output.primitives){
   p.indices=copyAccessor(source,p.indices);
   p.attributes=Object.fromEntries(Object.entries(p.attributes).map(([name,index])=>[name,copyAccessor(source,index as number)]));
  }
  return output;
 });
 json.accessors=accessors;json.bufferViews=views;
 json.buffers=[{byteLength:Math.ceil(physical/4)*4},{byteLength:Math.ceil(virtual/4)*4,extensions:{EXT_meshopt_compression:{fallback:true}}}];
 for(const key of ['extensionsUsed','extensionsRequired'])json[key]=[...new Set([...(json[key]??[]),...(fresh.json[key]??[])])];
 const raw=Buffer.from(JSON.stringify(json)),text=Buffer.alloc(Math.ceil(raw.length/4)*4,32);raw.copy(text);
 const bin=Buffer.concat(chunks,Math.ceil(physical/4)*4),output=Buffer.alloc(12+8+text.length+8+bin.length);
 output.writeUInt32LE(0x46546c67,0);output.writeUInt32LE(2,4);output.writeUInt32LE(output.length,8);
 output.writeUInt32LE(text.length,12);output.writeUInt32LE(0x4e4f534a,16);text.copy(output,20);
 output.writeUInt32LE(bin.length,20+text.length);output.writeUInt32LE(0x004e4942,24+text.length);bin.copy(output,28+text.length);
 return output;
}

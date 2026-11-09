/** Keep accepted gill/plant bytes while removing superseded fish geometry.
 * Every retained compressed stream is copied verbatim, including indices.
 * The old packet shares one TRIANGLES index stream across all four meshes.
 * Its sequential edge/vertex caches and delta state make its compressed ranges
 * inseparable without re-encoding. Consequently that whole stream stays;
 * only the gill/plant index accessors remain. Retired index slots are necessary
 * decoder input, not drawable geometry: their accessors, meshes, nodes and all
 * retired attribute streams are removed.
 * The original anatomy GLB is never passed through a decoder or rewritten.
 */
import {unpack} from './append-glb';
type J=Record<string,any>;
const clone=<T>(value:T):T=>JSON.parse(JSON.stringify(value));
const align=(n:number)=>Math.ceil(n/4)*4;
function pack(json:J,bin:Buffer):Buffer{
 const raw=Buffer.from(JSON.stringify(json)),text=Buffer.alloc(align(raw.length),32);raw.copy(text);
 const out=Buffer.alloc(28+text.length+align(bin.length));
 out.writeUInt32LE(0x46546c67);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
 out.writeUInt32LE(text.length,12);out.writeUInt32LE(0x4e4f534a,16);text.copy(out,20);
 out.writeUInt32LE(align(bin.length),20+text.length);out.writeUInt32LE(0x004e4942,24+text.length);bin.copy(out,28+text.length);
 return out;
}
export async function compactAccepted(bytes:Buffer){
 const source=unpack(bytes),j=source.json;
 // This intentionally handles the topic's meshopt packet, not arbitrary glTF.
 if(j.buffers.length!==2||!j.buffers[1].extensions?.EXT_meshopt_compression?.fallback||j.textures||j.skins||j.animations)
  throw new Error('Unexpected accepted packet layout; review compaction before changing it');
 const nodes=['gills','plant-specimen'].map(name=>{
  const found=j.nodes.filter((n:J)=>n.name===name);
  if(found.length!==1||found[0].children||found[0].skin!==undefined)throw new Error(`Expected one standalone accepted ${name}`);
  return clone(found[0]);
 });
 const meshIds=nodes.map(n=>n.mesh),meshes=meshIds.map(i=>clone(j.meshes[i]));
 const accessorIds=[...new Set<number>(meshes.flatMap(m=>m.primitives.flatMap((p:J)=>[p.indices,...Object.values(p.attributes)])))].sort((a,b)=>a-b);
 const materialIds=[...new Set<number>(meshes.flatMap(m=>m.primitives.map((p:J)=>p.material)))];
 const indexIds=new Set<number>(meshes.flatMap(m=>m.primitives.map((p:J)=>p.indices)));
 const accessors=accessorIds.map(i=>clone(j.accessors[i])),views:J[]=[],chunks:Buffer[]=[];
 const copiedViews=new Map<number,number>(),indexViews=new Set<number>();
 let physicalBytes=0,virtualBytes=0,copiedAttributeBytes=0,copiedStreamBytes=0,retainedSharedIndexBytes=0;
 function appendView(view:J,encoded:Buffer){
  const padding=align(physicalBytes)-physicalBytes;if(padding)chunks.push(Buffer.alloc(padding));physicalBytes+=padding;
  const x=view.extensions.EXT_meshopt_compression;
  x.buffer=0;x.byteOffset=physicalBytes;x.byteLength=encoded.length;
  view.buffer=1;view.byteOffset=align(virtualBytes);virtualBytes=view.byteOffset+view.byteLength;
  chunks.push(encoded);physicalBytes+=encoded.length;views.push(view);return views.length-1;
 }
 for(let i=0;i<accessorIds.length;i++){
  const id=accessorIds[i]!,a=accessors[i],old=j.bufferViews[a.bufferView],x=old.extensions?.EXT_meshopt_compression;
  if(!x||x.buffer!==0||old.buffer!==1||a.sparse)throw new Error('Expected compressed non-sparse accepted accessor');
  const encoded=source.bin.subarray(x.byteOffset??0,(x.byteOffset??0)+x.byteLength);
  if(indexIds.has(id)){
   if(x.mode!=='TRIANGLES'||a.type!=='SCALAR'||a.componentType!==5123)throw new Error('Unexpected shared accepted index format');
   indexViews.add(a.bufferView);
  }else if(j.accessors.some((other:J,k:number)=>other.bufferView===a.bufferView&&!accessorIds.includes(k))){
   throw new Error('Accepted attribute stream also contains retired geometry');
  }
  const oldIndex=a.bufferView;
  let mapped=copiedViews.get(oldIndex);
  if(mapped===undefined){
   mapped=appendView(clone(old),encoded);copiedViews.set(oldIndex,mapped);copiedStreamBytes+=encoded.length;
   if(indexIds.has(id))retainedSharedIndexBytes+=encoded.length;else copiedAttributeBytes+=encoded.length;
  }
  a.bufferView=mapped;
 }
 let unreferencedDecodedIndexBytes=0;
 for(const viewId of indexViews){
  const view=j.bufferViews[viewId],stride=view.extensions.EXT_meshopt_compression.byteStride;
  const ranges=accessorIds.filter(id=>indexIds.has(id)&&j.accessors[id].bufferView===viewId)
   .map(id=>{const a=j.accessors[id];return [a.byteOffset??0,(a.byteOffset??0)+a.count*stride] as const;}).sort((a,b)=>a[0]-b[0]);
  let end=0,referenced=0;
  for(const [lo,hi]of ranges){referenced+=Math.max(0,hi-Math.max(lo,end));end=Math.max(end,hi);}
  unreferencedDecodedIndexBytes+=view.byteLength-referenced;
 }
 for(const [i,n]of nodes.entries())n.mesh=i;
 for(const mesh of meshes)for(const p of mesh.primitives){
  p.indices=accessorIds.indexOf(p.indices);p.material=materialIds.indexOf(p.material);
  for(const key of Object.keys(p.attributes))p.attributes[key]=accessorIds.indexOf(p.attributes[key]);
 }
 const bin=Buffer.concat(chunks),result:J={asset:clone(j.asset),accessors,bufferViews:views,
  buffers:[{byteLength:bin.length},{byteLength:virtualBytes,extensions:{EXT_meshopt_compression:{fallback:true}}}],
  materials:materialIds.map(i=>clone(j.materials[i])),meshes,nodes,scenes:[{nodes:nodes.map((_,i)=>i)}],
  extensionsUsed:clone(j.extensionsUsed),extensionsRequired:clone(j.extensionsRequired)};
 const compact=pack(result,bin);
 return {bytes:compact,stats:{sourceBytes:bytes.length,compactBytes:compact.length,removedBytes:bytes.length-compact.length,copiedAttributeBytes,copiedStreamBytes,retainedSharedIndexBytes,unreferencedDecodedIndexBytes}};
}

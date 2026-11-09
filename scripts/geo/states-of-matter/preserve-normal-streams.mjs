/** Octahedral normal filtering is not an exact decode/re-encode round trip.
 * Keep every accepted normal stream byte-for-byte; only the two rebuilt parts
 * receive new normal filtering. No approximate normal-comparison allowance. */
import assert from 'node:assert/strict';
const align=n=>Math.ceil(n/4)*4;
function unpack(bytes){const n=bytes.readUInt32LE(12),at=20+n;return {json:JSON.parse(bytes.subarray(20,at)),bin:bytes.subarray(at+8,at+8+bytes.readUInt32LE(at))};}
export function preserveNormalStreams(original,rewritten){
 const old=unpack(Buffer.from(original)),next=unpack(Buffer.from(rewritten)),replacements=new Map();
 for(const node of old.json.nodes){
  if(node.mesh===undefined||['sponge','ice-cube'].includes(node.name))continue;
  const out=next.json.nodes.find(n=>n.name===node.name);assert.ok(out);
  for(const [i,p]of old.json.meshes[node.mesh].primitives.entries()){
   const q=next.json.meshes[out.mesh].primitives[i],a=old.json.accessors[p.attributes.NORMAL],b=next.json.accessors[q.attributes.NORMAL],v=old.json.bufferViews[a.bufferView],w=next.json.bufferViews[b.bufferView],x=v.extensions.EXT_meshopt_compression;
   assert.equal(x.filter,'OCTAHEDRAL');assert.equal(a.count,b.count);assert.equal(v.byteLength,w.byteLength);assert.equal(x.count,w.extensions.EXT_meshopt_compression.count);
   // A per-mesh normal view must not contain another semantic's bytes.
   assert.equal(next.json.accessors.filter(a=>a.bufferView===b.bufferView).length,1);
   next.json.accessors[q.attributes.NORMAL]={...a,bufferView:b.bufferView};
   w.extensions.EXT_meshopt_compression={...x,buffer:0};
   replacements.set(b.bufferView,old.bin.subarray(x.byteOffset??0,(x.byteOffset??0)+x.byteLength));
  }
 }
 const chunks=[];let length=0;
 for(const [i,view]of next.json.bufferViews.entries()){
  const x=view.extensions?.EXT_meshopt_compression;
  const data=x?(replacements.get(i)??next.bin.subarray(x.byteOffset??0,(x.byteOffset??0)+x.byteLength)):next.bin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength);
  const padding=align(length)-length;if(padding)chunks.push(Buffer.alloc(padding));length+=padding;
  if(x){x.byteOffset=length;x.byteLength=data.length;x.buffer=0;}else{assert.equal(view.buffer,0);view.byteOffset=length;}
  chunks.push(data);length+=data.length;
 }
 const bin=Buffer.concat(chunks);next.json.buffers[0].byteLength=bin.length;
 const raw=Buffer.from(JSON.stringify(next.json)),json=Buffer.alloc(align(raw.length),32);raw.copy(json);
 const result=Buffer.alloc(28+json.length+align(bin.length));result.writeUInt32LE(0x46546c67);result.writeUInt32LE(2,4);result.writeUInt32LE(result.length,8);result.writeUInt32LE(json.length,12);result.writeUInt32LE(0x4e4f534a,16);json.copy(result,20);result.writeUInt32LE(align(bin.length),20+json.length);result.writeUInt32LE(0x004e4942,24+json.length);bin.copy(result,28+json.length);return result;
}

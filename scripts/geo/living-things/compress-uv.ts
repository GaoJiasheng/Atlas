/** Repeated UV charts cannot use normalized-short quantization. Encode those
 * float streams with meshopt's standard EXPONENTIAL filter (12 significant
 * bits), retaining both repeats and smooth seam interpolation. No runtime code.
 * VertexLayout.SEPARATE makes every UV bufferView independent. */
import { MeshoptEncoder,MeshoptDecoder } from 'meshoptimizer';
export function compressUV(binary:Uint8Array):Uint8Array {
 const src=Buffer.from(binary),jsonLength=src.readUInt32LE(12),json=JSON.parse(src.subarray(20,20+jsonLength).toString()),bin=src.subarray(28+jsonLength);
 const uvViews=new Set<number>();
 for(const mesh of json.meshes)for(const prim of mesh.primitives){const a=json.accessors[prim.attributes.TEXCOORD_0];if(a.componentType===5126)uvViews.add(a.bufferView);}
 const chunks:Uint8Array[]=[];let length=0;
 for(const [i,view]of json.bufferViews.entries()){
  const ext=view.extensions?.EXT_meshopt_compression;
  let data:Uint8Array;
  if(ext){
   data=bin.subarray(ext.byteOffset??0,(ext.byteOffset??0)+ext.byteLength);
   if(uvViews.has(i)){
    if(ext.byteStride!==8)throw new Error('UV compression requires separate VEC2 stream');
    const decoded=new Uint8Array(ext.count*ext.byteStride);MeshoptDecoder.decodeGltfBuffer(decoded,ext.count,ext.byteStride,data,ext.mode,ext.filter);
    const filtered=MeshoptEncoder.encodeFilterExp(new Float32Array(decoded.buffer),ext.count,8,12,'SharedComponent');
    data=MeshoptEncoder.encodeGltfBuffer(filtered,ext.count,8,'ATTRIBUTES');ext.filter='EXPONENTIAL';
   }
   ext.byteOffset=length;ext.byteLength=data.byteLength;ext.buffer=0;
  }else{data=bin.subarray(view.byteOffset??0,(view.byteOffset??0)+view.byteLength);view.byteOffset=length;view.buffer=0;}
  chunks.push(data);length+=data.byteLength;
  const padding=(4-length%4)%4;if(padding){chunks.push(new Uint8Array(padding));length+=padding;}
 }
 json.buffers[0].byteLength=length;
 let jsonText=JSON.stringify(json);jsonText+=' '.repeat((4-jsonText.length%4)%4);const jb=Buffer.from(jsonText);
 const result=Buffer.alloc(28+jb.length+length);result.writeUInt32LE(0x46546c67,0);result.writeUInt32LE(2,4);result.writeUInt32LE(result.length,8);result.writeUInt32LE(jb.length,12);result.writeUInt32LE(0x4e4f534a,16);jb.copy(result,20);result.writeUInt32LE(length,20+jb.length);result.writeUInt32LE(0x004e4942,24+jb.length);
 let offset=28+jb.length;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}
 return result;
}

/** Repacks the written GLB: float attributes take the exponential filter only when it decodes bit-for-bit. */
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
export async function filterNormals(bytes,doc){
 await MeshoptEncoder.ready;
 const b=Buffer.from(bytes),jsonLength=b.readUInt32LE(12),json=JSON.parse(b.subarray(20,20+jsonLength)),binStart=28+jsonLength,bin=b.subarray(binStart),extra=new Map();
 // Exponential prediction is used only when a decode proves bit-for-bit
 // equality. It recovers storage from the original binary-grid float fields.
 const floats=new Set();await MeshoptDecoder.ready;
 for(const node of doc.getRoot().listNodes())if(node.getMesh()){
  const jn=json.nodes.find(n=>n.name===node.getName());
  node.getMesh().listPrimitives().forEach((p,pi)=>{for(const semantic of ['_U','_FIBRE','TEXCOORD_0']){
   const a=p.getAttribute(semantic),id=json.meshes[jn.mesh].primitives[pi].attributes[semantic];if(!a||a.getArray().constructor!==Float32Array||floats.has(id))continue;floats.add(id);
   const stride=a.getElementSize()*4,raw=new Uint8Array(a.getArray().buffer,a.getArray().byteOffset,a.getArray().byteLength),filtered=MeshoptEncoder.encodeFilterExp(a.getArray(),a.getCount(),stride,24,'Separate'),encoded=MeshoptEncoder.encodeGltfBuffer(filtered,a.getCount(),stride,'ATTRIBUTES'),decoded=new Uint8Array(raw.length);MeshoptDecoder.decodeGltfBuffer(decoded,a.getCount(),stride,encoded,'ATTRIBUTES','EXPONENTIAL');if(Buffer.compare(Buffer.from(raw),Buffer.from(decoded))!==0)continue;
   const view=json.bufferViews.length;json.bufferViews.push({buffer:1,byteOffset:0,byteLength:raw.length,byteStride:stride,target:34962,extensions:{EXT_meshopt_compression:{buffer:0,byteOffset:0,byteLength:encoded.length,byteStride:stride,count:a.getCount(),mode:'ATTRIBUTES',filter:'EXPONENTIAL'}}});extra.set(view,Buffer.from(encoded));json.accessors[id]={...json.accessors[id],bufferView:view,byteOffset:0};
  }});
 }
 const used=new Set(json.accessors.map(a=>a.bufferView)),viewMap=new Map(),views=[],chunks=[];let offset=0,fallback=0;
 for(let i=0;i<json.bufferViews.length;i++){
  if(!used.has(i))continue;
  const v=json.bufferViews[i],e=v.extensions.EXT_meshopt_compression;let data=extra.get(i)??bin.subarray(e.byteOffset,e.byteOffset+e.byteLength);
  if(e.mode==='ATTRIBUTES'){await MeshoptDecoder.ready;const raw=new Uint8Array(e.count*e.byteStride);MeshoptDecoder.decodeGltfBuffer(raw,e.count,e.byteStride,data,e.mode);const packed=MeshoptEncoder.encodeVertexBufferLevel(raw,e.count,e.byteStride,3,0);if(packed.length<data.length)data=Buffer.from(packed);}
  viewMap.set(i,views.length);views.push(v);e.byteOffset=offset;e.buffer=0;e.byteLength=data.length;v.buffer=1;v.byteOffset=fallback;fallback+=Math.ceil(v.byteLength/4)*4;chunks.push(data,Buffer.alloc((4-data.length%4)%4));offset+=Math.ceil(data.length/4)*4;
 }
 json.bufferViews=views;json.accessors.forEach(a=>a.bufferView=viewMap.get(a.bufferView));json.buffers[0].byteLength=offset;json.buffers[1].byteLength=fallback;
 for(const a of json.accessors){delete a.name;if(a.normalized===false)delete a.normalized;if(a.byteOffset===0)delete a.byteOffset;}for(const m of json.meshes)delete m.name;for(const n of json.nodes)if(n.extras)delete n.extras.sourceNodes;for(const s of json.skins)delete s.name;
 const j=Buffer.from(JSON.stringify(json)),jp=Buffer.concat([j,Buffer.alloc((4-j.length%4)%4,32)]),bp=Buffer.concat(chunks),head=Buffer.alloc(20),bh=Buffer.alloc(8);head.writeUInt32LE(0x46546c67);head.writeUInt32LE(2,4);head.writeUInt32LE(28+jp.length+bp.length,8);head.writeUInt32LE(jp.length,12);head.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(bp.length);bh.writeUInt32LE(0x004e4942,4);return Buffer.concat([head,jp,bh,bp]);
}

/** Append geometry without touching a byte of the anatomy binary payload.
 * All inherited nodes, accessors, mesh indices, textures and materials keep
 * their indices. This handles compressed virtual buffers as well as raw ones. */
import {createHash} from 'node:crypto';
type J=Record<string,any>;
export function unpack(b:Buffer):{json:J;bin:Buffer}{const n=b.readUInt32LE(12),s=20+n;return {json:JSON.parse(b.subarray(20,s).toString()),bin:b.subarray(s+8,s+8+b.readUInt32LE(s))};}
export function appendGlb(baseBytes:Buffer,addBytes:Buffer):Buffer{
 const base=unpack(baseBytes),extra=unpack(addBytes),j=base.json,e=extra.json;
 const offsets=Object.fromEntries(['accessors','bufferViews','materials','meshes','nodes','buffers'].map(k=>[k,(j[k]??[]).length]));
 const binaryOffset=Math.ceil(base.bin.length/4)*4;
 const physical=(e.buffers as J[]).findIndex(b=>!b.extensions?.EXT_meshopt_compression?.fallback);
 const mapBuffer=(i:number)=>i===physical?0:offsets.buffers+(i>physical?i-1:i);
 for(const v of e.bufferViews){
  const old=v.buffer;v.buffer=mapBuffer(old);if(old===physical)v.byteOffset=(v.byteOffset??0)+binaryOffset;
  const x=v.extensions?.EXT_meshopt_compression;if(x){x.buffer=mapBuffer(x.buffer);x.byteOffset=(x.byteOffset??0)+binaryOffset;}
 }
 for(const a of e.accessors){if(a.bufferView!==undefined)a.bufferView+=offsets.bufferViews;}
 for(const m of e.meshes)for(const p of m.primitives){if(p.indices!==undefined)p.indices+=offsets.accessors;for(const k of Object.keys(p.attributes))p.attributes[k]+=offsets.accessors;if(p.material!==undefined)p.material+=offsets.materials;}
 for(const n of e.nodes){if(n.mesh!==undefined)n.mesh+=offsets.meshes;if(n.children)n.children=n.children.map((x:number)=>x+offsets.nodes);}
 j.buffers.push(...e.buffers.filter((_:J,i:number)=>i!==physical));
 for(const k of ['accessors','bufferViews','materials','meshes','nodes']){j[k]??=[];j[k].push(...e[k]??[]);}
 for(const scene of e.scenes)j.scenes[j.scene??0].nodes.push(...scene.nodes.map((x:number)=>x+offsets.nodes));
 for(const k of ['extensionsUsed','extensionsRequired'])j[k]=[...new Set([...(j[k]??[]),...(e[k]??[])])];
 const bin=Buffer.concat([base.bin,Buffer.alloc(binaryOffset-base.bin.length),extra.bin]);j.buffers[0].byteLength=bin.length;
 j.asset.extras={...j.asset.extras,benchRebuild:'2026-11-05',anatomySha256:createHash('sha256').update(baseBytes).digest('hex'),anatomyBinPrefixBytes:base.bin.length};
 const raw=Buffer.from(JSON.stringify(j)),json=Buffer.alloc(Math.ceil(raw.length/4)*4,32);raw.copy(json);
 const out=Buffer.alloc(28+json.length+Math.ceil(bin.length/4)*4);out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(json.length,12);out.writeUInt32LE(0x4e4f534a,16);json.copy(out,20);out.writeUInt32LE(Math.ceil(bin.length/4)*4,20+json.length);out.writeUInt32LE(0x004e4942,24+json.length);bin.copy(out,28+json.length);return out;
}

/** Append original continuous teaching meshes to a byte-preserving copy of
 * the audited anatomy GLB. Quantised authored nodes keep the packet <4 MB.
 * pnpm tsx scripts/geo/bones-and-joints/build-cortex.mjs */
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {BufferAttribute,BufferGeometry} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {appendRound2} from './round2-mesh.mjs';
import {MeshoptSimplifier} from 'meshoptimizer';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
import {partsFile} from '../../../src/engines/space-scene/schema.ts';
await MeshoptSimplifier.ready;
const partsPath='src/content/topics/bones-and-joints/data/parts.json';
const owned=JSON.parse(readFileSync(partsPath,'utf8'));
const data=partsFile.parse(owned),cortical=data.parts.find(p=>p.id==='bone-cortex');
const flap=cortical.extra.at(-1);
const sheet=partPieces({...cortical,mesh:undefined,primitive:flap,extra:undefined})[0].geometry;
sheet.translate(...flap.at.map((v,i)=>v-cortical.primitive.at[i]));
sheet.deleteAttribute('uv');sheet.deleteAttribute('normal');
if(!sheet.index)sheet.setIndex(Array.from({length:sheet.getAttribute('position').count},(_,i)=>i));
function geometry(rawPath,target,offset=0,flap=false){
 const raw=JSON.parse(readFileSync(rawPath,'utf8'));let pos=new Float32Array(raw.position),idx=new Uint32Array(raw.index),signed=0;
 for(let i=0;i<idx.length;i+=3){const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3;
  signed+=pos[a]*(pos[b+1]*pos[c+2]-pos[b+2]*pos[c+1])+pos[a+1]*(pos[b+2]*pos[c]-pos[b]*pos[c+2])+pos[a+2]*(pos[b]*pos[c+1]-pos[b+1]*pos[c]);}
 if(signed<0)for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];
 [idx]=MeshoptSimplifier.simplify(idx,pos,3,target*3,.0002,['LockBorder','ErrorAbsolute']);
 const [remap,count]=MeshoptSimplifier.compactMesh(idx),packed=new Float32Array(count*3);
 for(let i=0;i<remap.length;i++)if(remap[i]!==0xffffffff)packed.set(pos.subarray(i*3,i*3+3),remap[i]*3);
 let g=new BufferGeometry().setAttribute('position',new BufferAttribute(packed,3)).setIndex(new BufferAttribute(idx,1));
 if(flap)g=mergeGeometries([g,sheet]);
 // Retain a sharp coronal cut with smooth normals on all organic surfaces.
 const mp=g.getAttribute('position'),mi=g.index.array,positions=[],indices=[],vertices=new Map();
 for(let i=0;i<mi.length;i+=3){const a=mi[i],b=mi[i+1],c=mi[i+2];
  const ax=mp.getX(b)-mp.getX(a),ay=mp.getY(b)-mp.getY(a),az=mp.getZ(b)-mp.getZ(a);
  const bx=mp.getX(c)-mp.getX(a),by=mp.getY(c)-mp.getY(a),bz=mp.getZ(c)-mp.getZ(a);
  const nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
  const cut=flap&&nz/Math.max(1e-20,Math.hypot(nx,ny,nz))>.975;
  for(const old of [a,b,c]){const key=old+':'+cut;let j=vertices.get(key);
   if(j===undefined){j=positions.length/3;vertices.set(key,j);positions.push(mp.getX(old),mp.getY(old),mp.getZ(old));}indices.push(j);}
 }
 g=new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(positions),3)).setIndex(indices);g.computeVertexNormals();
 if(offset){const p=g.getAttribute('position'),n=g.getAttribute('normal');for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+offset*n.getX(i),p.getY(i)+offset*n.getY(i),p.getZ(i)+offset*n.getZ(i));}
 return g;
}
const base=readFileSync('public/models/bones-and-joints.glb'),jl=base.readUInt32LE(12);
const gltf=JSON.parse(base.subarray(20,20+jl).toString('utf8')),bh0=20+jl;
const oldBin=base.subarray(bh0+8,bh0+8+base.readUInt32LE(bh0));let length=oldBin.length;const chunks=[oldBin];
function accessor(a,type,componentType,min,max,normalized=false){
 const b=Buffer.from(a.buffer,a.byteOffset,a.byteLength),view=gltf.bufferViews.length;
 gltf.bufferViews.push({buffer:0,byteOffset:length,byteLength:b.length});chunks.push(b);length+=b.length;
 const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}
 const index=gltf.accessors.length;gltf.accessors.push({bufferView:view,componentType,count:a.length/(type==='VEC3'?3:1),type,...(normalized?{normalized:true}:{}),...(min?{min,max}:{})});return index;
}
const report=[];
function append(name,g,translation,scale=1){
 const p=g.getAttribute('position'),n=g.getAttribute('normal');
 const qp=Int16Array.from(p.array,v=>Math.round(v*1e5)),qn=Int8Array.from(n.array,v=>Math.max(-127,Math.min(127,Math.round(v*127))));
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<qp.length;i++){min[i%3]=Math.min(min[i%3],qp[i]);max[i%3]=Math.max(max[i%3],qp[i]);}
 const attrs={POSITION:accessor(qp,'VEC3',5122,min,max),NORMAL:accessor(qn,'VEC3',5120,undefined,undefined,true)};
 const indices=p.count<65536?new Uint16Array(g.index.array):new Uint32Array(g.index.array);
 const index=accessor(indices,'SCALAR',p.count<65536?5123:5125);
 const mesh=gltf.meshes.length;gltf.meshes.push({name,primitives:[{attributes:attrs,indices:index,mode:4}]});
 const node=gltf.nodes.length;gltf.nodes.push({name,mesh,translation,scale:[scale*1e-5,scale*1e-5,scale*1e-5],extras:{closed:true,license:'CC BY-SA 4.0',generator:'scripts/geo/bones-and-joints/'}});
 gltf.scenes[gltf.scene??0].nodes.push(node);report.push({name,triangles:indices.length/3});
}
append('polished-cortex',geometry('/tmp/bones-polish/cortex-raw.json',28000,0,true),[2,0,0]);
for(const [i,id] of ['clot','soft','hard','remodelled'].entries()){
 const name=`polished-repair-${id}`;append(name,geometry(`/tmp/bones-polish/repair-${id}-raw.json`,8000),[[1.46,1.82,2.18,2.54][i],0,0],.74);
 const part=owned.parts.find(p=>p.id===`repair-stage-${id}`);part.mesh=name;part.material={color:'tissue',tint:'token:bone'};delete part.primitive;delete part.extra;
}
const skins=[['clot',1.46,'token:muscle-3'],['soft',1.82,'token:cold']];
owned.parts=owned.parts.filter(p=>!['repair-clot-skin','repair-soft-skin'].includes(p.id));
for(const [id,x,tint] of skins){
 const name=`polished-repair-${id}-skin`;append(name,geometry(`/tmp/bones-polish/repair-${id}-skin-raw.json`,4000,.0006),[x,0,0],.74);
 owned.parts.push({id:`repair-${id}-skin`,name:{en:`${id==='clot'?'Clot':'Soft callus'} colour surface`,zh:id==='clot'?'血肿着色面':'软骨痂着色面'},summary:{en:id==='clot'?'Blood collects around the broken ends.':'Soft tissue bridges the broken ends.',zh:id==='clot'?'血液聚集在断端周围。':'软组织连接断端。'},detail:{en:id==='clot'?'Torn vessels release blood at a fracture. This clot occupies the space around the broken ends [S34].':'A soft callus forms around the broken ends. It helps hold them together before new bone replaces it [S34].',zh:id==='clot'?'骨折会撕裂血管。凝血块占据断端周围的空隙 [S34]。':'断端周围形成软骨痂。新骨替代它之前，它帮助连接断端 [S34]。'},group:'bone-section',context:true,mesh:name,material:{color:'tissue',tint},castShadow:false});
}
const cp=owned.parts.find(p=>p.id==='bone-cortex');cp.mesh='polished-cortex';cp.material={color:'tissue',tint:'token:bone'};delete cp.primitive;delete cp.extra;
appendRound2(owned,append);
gltf.buffers[0].byteLength=length;
for(const key of ['extensionsUsed','extensionsRequired']){gltf[key]??=[];if(!gltf[key].includes('KHR_mesh_quantization'))gltf[key].push('KHR_mesh_quantization');}
gltf.asset.copyright+='; Original polished teaching meshes: Atlas, CC BY-SA 4.0 (2026-11-03)';
let json=Buffer.from(JSON.stringify(gltf));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
const bin=Buffer.concat(chunks),header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);
jh.writeUInt32LE(json.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
const output='public/models/bones-and-joints-polished.glb';writeFileSync(output,Buffer.concat([header,jh,json,bh,bin]));
owned.model='/models/bones-and-joints-polished.glb';writeFileSync(partsPath,JSON.stringify(owned,null,2)+'\n');
// Material skins inherit every authored hide/ghost/highlight state of the
// existing stage. The semantic index, selection ids, poses and part count stay.
for(const file of readdirSync('src/content/topics/bones-and-joints/chapters').filter(f=>f.endsWith('.mdx'))){
 const path='src/content/topics/bones-and-joints/chapters/'+file,source=readFileSync(path,'utf8');
 const updated=source.replace(/^state: (\{.*\})$/m,(_,text)=>{const state=JSON.parse(text);
  for(const st of [state,...(state.beats??[])])for(const [id] of skins){const parent=`repair-stage-${id}`,skin=`repair-${id}-skin`;
   for(const key of ['hide','ghost'])if(st[key]){st[key]=st[key].filter(x=>x!==skin);if(st[key].includes(parent))st[key].push(skin);}
   for(const key of ['signal','cold'])if(st.highlight?.[key]){st.highlight[key]=st.highlight[key].filter(x=>x!==skin);if(st.highlight[key].includes(parent))st.highlight[key].push(skin);}
  }return 'state: '+JSON.stringify(state);});
 if(updated!==source)writeFileSync(path,updated);
}
console.log(JSON.stringify({output,meshes:report,bytes:28+json.length+bin.length,originalBinaryBytes:oldBin.length}));

/** Original sculpted shell plus attached enlarged branchial folds; baked once. */
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;
import {spawnSync} from 'node:child_process';
import {BufferAttribute,BufferGeometry,Color} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {partSchema} from '../../../src/engines/space-scene/schema';
import {gillDetails} from './build-parts';
let cached:BufferGeometry|undefined;
export function gillMesh(){
 if(cached)return cached.clone();
 const process=spawnSync('python3',[new URL('./gill-head.py',import.meta.url).pathname],{maxBuffer:16*1024*1024});
 if(process.status!==0)throw Error(process.stderr.toString());
 const b=process.stdout,n=b.readUInt32LE(0),indices=b.readUInt32LE(4);
 const array=(at:number,count:number)=>new Float32Array(Uint8Array.from(b.subarray(at,at+count*4)).buffer);
 const shell=new BufferGeometry().setAttribute('position',new BufferAttribute(array(8,n*3),3)).setAttribute('normal',new BufferAttribute(array(8+n*12,n*3),3)).setIndex(new BufferAttribute(new Uint32Array(Uint8Array.from(b.subarray(8+n*24,8+n*24+indices*4)).buffer),1));
 // Retain the implicit silhouette within 0.1 mm; discard redundant interior
 // tessellation before baking, so the CPU audit and shipped packet agree.
 const [reduced]=MeshoptSimplifier.simplify(new Uint32Array(shell.index!.array),new Float32Array(shell.getAttribute('position').array),3,Math.floor(indices*.35/3)*3,.0006,['LockBorder']);
 const [remap,count]=MeshoptSimplifier.compactMesh(reduced);
 for(const key of ['position','normal']){const old=shell.getAttribute(key),next=new Float32Array(count*3);for(let i=0;i<remap.length;i++)if(remap[i]!==0xffffffff)for(let k=0;k<3;k++)next[remap[i]!*3+k]=old.getComponent(i,k);shell.setAttribute(key,new BufferAttribute(next,3));}
 shell.setIndex(new BufferAttribute(reduced,1));
 shell.translate(1.04,.17,.27);
 const colored=(g:BufferGeometry,hex:string)=>{const c=new Color(hex),count=g.getAttribute('position').count,values=new Float32Array(count*3);for(let i=0;i<count;i++)values.set(c.toArray(),i*3);g.setAttribute('color',new BufferAttribute(values,3));g.deleteAttribute('uv');g.deleteAttribute('atlasSection');return g.index?g.toNonIndexed():g;};
 const all=[colored(shell,'#8a8378')],details=gillDetails();
 for(const primitive of details){
  const p=partSchema.parse({id:'gill-build-piece',name:{en:'Build piece',zh:'构建面'},context:true,summary:{en:'Build surface',zh:'构建面'},detail:{en:'Original build surface.',zh:'原创构建面。'},primitive});
  for(const piece of partPieces(p)){
   const g=piece.geometry.clone();g.translate(...primitive.at);
   all.push(colored(g,primitive.color==='eye'?'#2a2824':primitive.color==='glass'?'#4f7f8c':'#b47f70'));piece.geometry.dispose();g.dispose();
  }
 }
 cached=mergeGeometries(all)!;all.forEach(g=>g.dispose());shell.dispose();
 return cached.clone();
}

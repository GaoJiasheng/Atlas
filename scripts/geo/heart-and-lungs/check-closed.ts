/** Exhaustive containment against the decoded renderer-bound closed skin.
 * A projected triangle grid evaluates BOTH outer skin intersections at every
 * gill vertex; no bounding-box or independent shape proxy can pass this gate.
 */
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Matrix4,Vector3} from 'three';
type P=[number,number,number];
export async function auditClosedGills(){
 await MeshoptDecoder.ready;
 const parts=JSON.parse(fs.readFileSync('src/content/topics/heart-and-lungs/data/parts.json','utf8'));
 const d=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public'+parts.model);await d.transform(dequantize());
 const points=(id:string)=>{const node=d.getRoot().listNodes().find(n=>n.getName()===id)!,p=node.getMesh()!.listPrimitives()[0]!,a=p.getAttribute('POSITION')!,w=new Matrix4().fromArray(node.getWorldMatrix());return {primitive:p,vertices:Array.from({length:a.getCount()},(_,i)=>new Vector3(...a.getElement(i,[0,0,0]) as P).applyMatrix4(w).toArray() as P)};};
 const cell=.0015,grid=new Map<string,P[][]>(),key=(x:number,y:number)=>`${Math.floor(x/cell)},${Math.floor(y/cell)}`;
 for(const id of ['fish-body','gill-cover']){
  const {primitive,vertices}=points(id),ix=primitive.getIndices()!;
  for(let k=0;k<ix.getCount();k+=3){const tri=[0,1,2].map(j=>vertices[ix.getScalar(k+j)]!);
   const lo=[0,1].map(a=>Math.floor(Math.min(...tri.map(p=>p[a]!))/cell)),hi=[0,1].map(a=>Math.floor(Math.max(...tri.map(p=>p[a]!))/cell));
   for(let x=lo[0]!;x<=hi[0]!;x++)for(let y=lo[1]!;y<=hi[1]!;y++){const k=`${x},${y}`,list=grid.get(k)??[];list.push(tri);grid.set(k,list);}
  }
 }
 const gills=points('gills').vertices,outside:{point:P;lo:number;hi:number}[]=[],clearances:number[]=[];
 for(const point of gills){const [x,y,z]=point;let lo=Infinity,hi=-Infinity;
  for(const [a,b,c] of grid.get(key(x,y))??[]){
   const den=(b![1]-c![1])*(a![0]-c![0])+(c![0]-b![0])*(a![1]-c![1]);if(Math.abs(den)<1e-15)continue;
   const u=((b![1]-c![1])*(x-c![0])+(c![0]-b![0])*(y-c![1]))/den,v=((c![1]-a![1])*(x-c![0])+(a![0]-c![0])*(y-c![1]))/den,w=1-u-v;
   if(Math.min(u,v,w)<-1e-8)continue;const hit=u*a![2]+v*b![2]+w*c![2];lo=Math.min(lo,hit);hi=Math.max(hi,hit);
  }
  const clearance=Math.min(z-lo,hi-z);clearances.push(clearance);
  if(clearance<0||!Number.isFinite(clearance))outside.push({point,lo,hi});
 }
 return {model:parts.model,vertices:gills.length,outsideCount:outside.length,minimumClearance:Math.min(...clearances),outside:outside.slice(0,20)};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const r=await auditClosedGills();console.log(JSON.stringify(r,null,2));if(r.outsideCount)process.exitCode=1;}

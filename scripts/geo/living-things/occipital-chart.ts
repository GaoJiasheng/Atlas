/** Split a small rear cranial chart AFTER simplification. Every triangle uses
 * one projection; no triangle interpolates between the polar and cap charts. */
import type {Document,Primitive,Buffer as GLBuffer} from '@gltf-transform/core';
import {Matrix4,Vector3} from 'three';
export function occipitalChart(doc:Document,buffer:GLBuffer,p:Primitive,matrix:number[]):void{
 const semantics=p.listSemantics(),attrs=semantics.map(s=>p.getAttribute(s)!),arrays=semantics.map(()=>[] as number[]),indices:number[]=[],vertices=new Map<string,number>(),ix=p.getIndices()!,pos=p.getAttribute('POSITION')!,world=new Matrix4().fromArray(matrix);
 for(let t=0;t<ix.getCount();t+=3){
  const ids=[0,1,2].map(k=>ix.getScalar(t+k)),points=ids.map(i=>new Vector3(...pos.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix4(world)),centre=points.reduce((a,b)=>a.add(b),new Vector3()).divideScalar(3);
  const cap=centre.z<-.2870&&centre.y>.053&&Math.abs(centre.x+.18)<.008;
  ids.forEach((src,j)=>{const key=`${src}:${cap?1:0}`;let id=vertices.get(key);if(id===undefined){id=vertices.size;vertices.set(key,id);attrs.forEach((a,k)=>{const v=cap&&semantics[k]==='TEXCOORD_0'?[(points[j]!.x+.18)/.012,(points[j]!.y-.060)/.012]:a.getElement(src,Array(a.getElementSize()).fill(0));arrays[k]!.push(...v);});}indices.push(id);});
 }
 attrs.forEach((a,k)=>p.setAttribute(semantics[k]!,doc.createAccessor().setBuffer(buffer).setType(a.getType()).setArray(new Float32Array(arrays[k]!))));
 ix.setArray(new Uint32Array(indices));
}

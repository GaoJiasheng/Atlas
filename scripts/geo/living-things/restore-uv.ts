/** Keep UV charts out of the position-only simplifier's seam constraints.
 * meshopt selects existing vertices (it does not move them). For each selected
 * corner, recover its authored chart coordinate; choose the continuous branch
 * across the triangle and split only the real chart seams. */
import { type Primitive,type Document,type Buffer as GLBuffer } from '@gltf-transform/core';
const key=(p:Primitive,i:number)=>['POSITION','NORMAL','COLOR_0'].flatMap(s=>p.getAttribute(s)!.getElement(i,[0,0,0])).join(',');
export function detachUV(p:Primitive):Map<string,number[][]>{
 const uv=p.getAttribute('TEXCOORD_0')!,map=new Map<string,number[][]>();
 for(let i=0;i<uv.getCount();i++){const k=key(p,i),q=uv.getElement(i,[0,0]),existing=map.get(k)??[];if(!existing.some(v=>v[0]===q[0]&&v[1]===q[1]))existing.push(q);map.set(k,existing);}
 p.setAttribute('TEXCOORD_0',null);return map;
}
export function restoreUV(doc:Document,buffer:GLBuffer,p:Primitive,map:Map<string,number[][]>):void {
 const sem=p.listSemantics(),attrs=sem.map(s=>p.getAttribute(s)!),out=sem.map(()=>[] as number[]),uvs:number[]=[],indices:number[]=[],vertices=new Map<string,number>(),ix=p.getIndices()!;
 for(let t=0;t<ix.getCount();t+=3){
  const ids=[0,1,2].map(j=>ix.getScalar(t+j)),candidates=ids.map(i=>map.get(key(p,i))!);
  if(candidates.some(c=>!c))throw new Error('Simplifier moved an authored vertex');
  let chosen:number[][]=[],score=Infinity;
  for(const a of candidates[0]!)for(const b of candidates[1]!)for(const c of candidates[2]!){
   const d=(x:number[],y:number[])=>Math.hypot(x[0]!-y[0]!,x[1]!-y[1]!);const s=d(a,b)+d(b,c)+d(c,a);
   if(s<score){score=s;chosen=[a,b,c];}
  }
  ids.forEach((src,j)=>{
   const du=Math.floor(Math.min(...chosen.map(q=>q[0]!))),dv=Math.floor(Math.min(...chosen.map(q=>q[1]!)));
   const uv=[chosen[j]![0]!-du,chosen[j]![1]!-dv],k=`${src}:${uv[0]}:${uv[1]}`;let id=vertices.get(k);
   if(id===undefined){id=vertices.size;vertices.set(k,id);attrs.forEach((a,k)=>out[k]!.push(...a.getElement(src,Array(a.getElementSize()).fill(0))));uvs.push(...uv);}
   indices.push(id);
  });
 }
 attrs.forEach((a,i)=>a.setArray(new Float32Array(out[i]!)));
 p.setAttribute('TEXCOORD_0',doc.createAccessor().setType('VEC2').setBuffer(buffer).setArray(new Float32Array(uvs)));ix.setArray(new Uint32Array(indices));
}

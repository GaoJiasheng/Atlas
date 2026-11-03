/** Build-time charts in specimen metres. One UV unit spans 12 mm; native
 * sweep charts retain their arc-length / mean-circumference convention. */
import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';

export function gridUV(g:BufferGeometry,n:number,m:number):void {
 const p=g.getAttribute('position'),uv:number[]=[],lengths:number[]=[0];
 const distance=(a:number,b:number)=>Math.hypot(p.getX(a)-p.getX(b),p.getY(a)-p.getY(b),p.getZ(a)-p.getZ(b));
 for(let i=1;i<=n;i++){
  let d=0;for(let j=0;j<=m;j++)d+=distance(i*(m+1)+j,(i-1)*(m+1)+j)/(m+1);
  lengths.push(lengths[i-1]!+d);
 }
 let width=0;
 for(let i=0;i<=n;i++)for(let j=1;j<=m;j++)width+=distance(i*(m+1)+j,i*(m+1)+j-1)/(n+1);
 for(let i=0;i<=n;i++)for(let j=0;j<=m;j++)uv.push(lengths[i]!/.012,j/m*width/.012);
 g.setAttribute('uv',new Float32BufferAttribute(uv,2));
}

/** Six planar charts for meshes without parameter topology (implicit joints,
 * merged feather studies). Split only at chart boundaries, never interpolate
 * between projections across a triangle. No changes to positions or normals. */
export function projectedUV(src:BufferGeometry):BufferGeometry {
 const p=src.getAttribute('position'),ix=src.index,ids:number[]=[],maps=new Map<string,number>(),uv:number[]=[];
 const arrays=new Map(Object.keys(src.attributes).map(k=>[k,[] as number[]]));
 const a=new Vector3(),b=new Vector3(),c=new Vector3();
 for(let t=0;t<(ix?.count??p.count);t+=3){
  const corners=[0,1,2].map(j=>ix?.getX(t+j)??t+j);
  a.fromBufferAttribute(p,corners[0]!);b.fromBufferAttribute(p,corners[1]!).sub(a);c.fromBufferAttribute(p,corners[2]!).sub(a);b.cross(c);
  const axis=Math.abs(b.x)>Math.abs(b.y)?(Math.abs(b.x)>Math.abs(b.z)?0:2):(Math.abs(b.y)>Math.abs(b.z)?1:2);
  const axes=axis===0?[2,1]:axis===1?[0,2]:[0,1];
  for(const k of corners){
   const key=`${axis}:${k}`;let id=maps.get(key);
   if(id===undefined){id=maps.size;maps.set(key,id);
    for(const [name,out] of arrays){const attr=src.getAttribute(name);for(let j=0;j<attr.itemSize;j++)out.push(attr.getComponent(k,j));}
    uv.push(p.getComponent(k,axes[0]!)/.012,p.getComponent(k,axes[1]!)/.012);
   }ids.push(id);
  }
 }
 const out=new BufferGeometry();out.userData={...src.userData};
 for(const [name,array]of arrays)out.setAttribute(name,new Float32BufferAttribute(array,src.getAttribute(name).itemSize));
 out.setAttribute('uv',new Float32BufferAttribute(uv,2));out.setIndex(ids);return out;
}

/** Build-time sculpture surfaces. No runtime dependency; meshes are baked locally. */
import { BufferGeometry, Float32BufferAttribute, CatmullRomCurve3, Vector3, SphereGeometry } from 'three';
import type { Prim } from './kit';
import { gridUV } from './uv';
export type P = [number,number,number];
export const mesh = (geometry:BufferGeometry,color:string,tint?:string):Prim => ({kind:'__mesh', at:[0,0,0], geometry, color, ...(tint?{tint}:{})});
export function surface(n:number,m:number,fn:(u:number,v:number)=>P,closed=false):BufferGeometry {
 const p:number[]=[],ix:number[]=[];
 for(let i=0;i<=n;i++)for(let j=0;j<=m;j++)p.push(...fn(i/n,j/m));
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){
  const a=i*(m+1)+j,b=a+m+1;ix.push(a,b,a+1,b,b+1,a+1);
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();gridUV(g,n,m);
 if(closed){ // Weld periodic seam normals without collapsing the UV-like parameter grid.
  const norm=g.getAttribute('normal');for(let i=0;i<=n;i++){
   const a=i*(m+1),b=a+m,v=new Vector3().fromBufferAttribute(norm,a).add(new Vector3().fromBufferAttribute(norm,b)).normalize();norm.setXYZ(a,v.x,v.y,v.z);norm.setXYZ(b,v.x,v.y,v.z);
  }
 }
 return g;
}
/** Smooth variable elliptical section along an arbitrary centreline; tapered caps. */
export function tube(points:P[],radii:number[],flat=1,radial=16,segments=24):BufferGeometry {
 const curve=new CatmullRomCurve3(points.map(p=>new Vector3(...p)));
 const frame=curve.computeFrenetFrames(segments,false);
 return outward(surface(segments,radial,(u,v)=>{
  const q=u*(radii.length-1),i=Math.min(radii.length-2,Math.floor(q)),t=q-i;
  const r=radii[i]!*(1-t)+radii[i+1]!*t,c=curve.getPoint(u),a=v*Math.PI*2,k=Math.min(segments,Math.round(u*segments));
  return c.addScaledVector(frame.normals[k]!,Math.cos(a)*r).addScaledVector(frame.binormals[k]!,Math.sin(a)*r*flat).toArray() as P;
 },true));
}
export function orb(at:P,size:P,segments=24,rings=16):BufferGeometry {
 const g=new SphereGeometry(1,segments,rings);g.scale(...size).translate(...at);return g;
}
function outward(g:BufferGeometry):BufferGeometry {const ix=g.index!;for(let i=0;i<ix.count;i+=3){const a=ix.getX(i);ix.setX(i,ix.getX(i+1));ix.setX(i+1,a);}g.computeVertexNormals();return g;}

/** Build-time implicit sculpting for soft joints. Marching tetrahedra avoids
 * the self-intersection a swept tube develops at a folded frog knee. */
import {BufferGeometry,Float32BufferAttribute,Vector3} from 'three';
import type {V3} from './kit';
const mix=(a:V3,b:V3,t:number):V3=>a.map((v,k)=>v+(b[k]!-v)*t)as V3;
export function foldedLimb(path:V3[],radii:number[]):BufferGeometry{
 const min:V3=[Infinity,Infinity,Infinity],max:V3=[-Infinity,-Infinity,-Infinity];
 path.forEach((p,i)=>p.forEach((v,k)=>{min[k]=Math.min(min[k]!,v-radii[i]!*1.6);max[k]=Math.max(max[k]!,v+radii[i]!*1.6);}));
 const maxSpan=Math.max(...max.map((v,k)=>v-min[k]!)),step=maxSpan/40;
 const cells=max.map((v,k)=>Math.max(8,Math.ceil((v-min[k]!)/step)))as V3;
 const smoothMin=(a:number,b:number,k:number)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
 const distance=(p:V3)=>{
  let d=Infinity;
  for(let i=0;i<path.length-1;i++){
   const a=path[i]!,b=path[i+1]!,ba=b.map((v,k)=>v-a[k]!)as V3,pa=p.map((v,k)=>v-a[k]!)as V3;
   const h=Math.max(0,Math.min(1,pa.reduce((s,v,k)=>s+v*ba[k]!,0)/ba.reduce((s,v)=>s+v*v,0)));
   const q=mix(a,b,h),r=radii[i]!*(1-h)+radii[i+1]!*h;
   const bulge=1+.18*Math.sin(Math.PI*h);
   const v=Math.hypot(p[0]-q[0],(p[1]-q[1])*1.08,p[2]-q[2])-r*bulge;
   d=smoothMin(d,v,.0009);
  }
  return d;
 };
 const nx=cells[0]+1,ny=cells[1]+1,nz=cells[2]+1,values=new Float32Array(nx*ny*nz);
 const at=(x:number,y:number,z:number):V3=>[min[0]+x/cells[0]*(max[0]-min[0]),min[1]+y/cells[1]*(max[1]-min[1]),min[2]+z/cells[2]*(max[2]-min[2])];
 const index=(x:number,y:number,z:number)=>(x*ny+y)*nz+z;
 for(let x=0;x<nx;x++)for(let y=0;y<ny;y++)for(let z=0;z<nz;z++)values[index(x,y,z)]=distance(at(x,y,z));
 const offsets:V3[]=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
 const tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],edges=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
 const positions:number[]=[],normals:number[]=[];
 const normal=(p:V3)=>{const e=.00003;return new Vector3(...[0,1,2].map(k=>{const a=[...p]as V3,b=[...p]as V3;a[k]!+=e;b[k]!-=e;return distance(a)-distance(b);})as V3).normalize();};
 const triangle=(a:V3,b:V3,c:V3)=>{
  const n=normal(mix(mix(a,b,.5),c,1/3)),cross=new Vector3(...b).sub(new Vector3(...a)).cross(new Vector3(...c).sub(new Vector3(...a)));
  if(cross.dot(n)<0)[b,c]=[c,b];
  for(const p of [a,b,c]){positions.push(...p);normals.push(...normal(p).toArray());}
 };
 for(let x=0;x<cells[0];x++)for(let y=0;y<cells[1];y++)for(let z=0;z<cells[2];z++){
  const ps=offsets.map(o=>at(x+o[0],y+o[1],z+o[2])),ds=offsets.map(o=>values[index(x+o[0],y+o[1],z+o[2])]!);
  if(ds.every(d=>d>=0)||ds.every(d=>d<0))continue;
  for(const t of tetra){const points:V3[]=[];for(const [a,b]of edges){const ia=t[a!]!,ib=t[b!]!,da=ds[ia]!,db=ds[ib]!;if((da<0)===(db<0))continue;points.push(mix(ps[ia]!,ps[ib]!,da/(da-db)));}
   if(points.length===3)triangle(points[0]!,points[1]!,points[2]!);
   else if(points.length===4){
    const centre=points.reduce((a,p)=>a.map((v,k)=>v+p[k]!/4)as V3,[0,0,0]as V3),N=normal(centre),U=new Vector3(...points[0]!).sub(new Vector3(...centre)).normalize(),V=new Vector3().crossVectors(N,U);
    points.sort((a,b)=>Math.atan2(new Vector3(...a).sub(new Vector3(...centre)).dot(V),new Vector3(...a).sub(new Vector3(...centre)).dot(U))-Math.atan2(new Vector3(...b).sub(new Vector3(...centre)).dot(V),new Vector3(...b).sub(new Vector3(...centre)).dot(U)));
    triangle(points[0]!,points[1]!,points[2]!);triangle(points[0]!,points[2]!,points[3]!);
   }
  }
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setAttribute('normal',new Float32BufferAttribute(normals,3));return g;
}

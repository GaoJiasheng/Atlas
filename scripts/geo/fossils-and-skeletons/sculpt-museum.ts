/** Curved cortical surfaces for thin diplodocid bones. The kit supplies the
 * anatomical outline and real openings; subdivision plus a thickness/bow field
 * makes iliac/scapular blades and neural arches three-dimensional bone rather
 * than flat signboards. All generated geometry is original, CC0 with the GLB.
 */
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Euler, Matrix4, Vector3 } from 'three';
import type { Part, Primitive } from '../../../src/engines/space-scene/schema';
import { mergeBaked, partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';

function roundOutline(shape: [number,number][]): [number,number][] {
 const span=Math.max(...shape.map(v=>v[0]))-Math.min(...shape.map(v=>v[0]));
 const count=Math.min(100,shape.length*(span>.35?3:1));
 const curve=new CatmullRomCurve3(shape.map(([x,y])=>new Vector3(x,y,0)),true,'centripetal');
 if(shape.length===12&&span<.35){
  // Retain the broad neural-spine crown. Uniform half-step samples collapse
  // its two top corners into one pointed tip; round just those corners.
  return shape.flatMap((_,i)=>((i===3||i===4)?[i-.22,i+.22]:[i]).map(t=>{const p=curve.getPoint((t+shape.length)/shape.length%1);return [p.x,p.y] as [number,number];}));
 }
 return Array.from({length:count},(_,i)=>{const p=curve.getPoint((i+.5)/count);return [p.x,p.y];});
}
function curvedCortex(g:BufferGeometry,side:number,large:boolean):BufferGeometry {
 const p=g.getAttribute('position'),n=g.getAttribute('normal'),uv=g.getAttribute('uv');
 const vertices:number[]=[],normals:number[]=[],uvs:number[]=[];
 g.computeBoundingBox();const box=g.boundingBox!,w=box.max.x-box.min.x,h=box.max.y-box.min.y;
 const cx=(box.max.x+box.min.x)/2,cy=(box.max.y+box.min.y)/2;
 type V={p:number[];n:number[];uv:number[]};
 const vertex=(i:number):V=>({p:[p.getX(i),p.getY(i),p.getZ(i)],n:[n.getX(i),n.getY(i),n.getZ(i)],uv:[uv.getX(i),uv.getY(i)]});
 const mid=(a:V,b:V):V=>({p:a.p.map((v,i)=>(v+b.p[i]!)/2),n:a.n.map((v,i)=>(v+b.n[i]!)/2),uv:a.uv.map((v,i)=>(v+b.uv[i]!)/2)});
 function emit(v:V){
  const [x,y,z]=v.p as [number,number,number],u=(x-cx)/w,t=(y-cy)/h;
  // Convex articular base grading to a thinner, concave upper blade.
  const thick=.72+.34*(1-t),fy=-.34/h;
  const k=large?.24:.13,bow=side*k*(w*u*u-h*t*t*.38+w*u*t*.25);
  const bx=side*k*(2*u+t*.25),by=side*k*(-.76*t+w/h*u*.25);
  vertices.push(x,y,z*thick+bow);
  const nx=v.n[0]!-v.n[2]!*bx/thick,ny=v.n[1]!-v.n[2]!*(z*fy+by)/thick,nz=v.n[2]!/thick;
  const len=Math.hypot(nx,ny,nz)||1;normals.push(nx/len,ny/len,nz/len);uvs.push(...v.uv);
 }
 function tri(a:V,b:V,c:V,level:number){
  if(level===0){emit(a);emit(b);emit(c);return;}
  const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);tri(a,ab,ca,level-1);tri(ab,b,bc,level-1);tri(ca,bc,c,level-1);tri(ab,bc,ca,level-1);
 }
 for(let i=0;i<p.count;i+=3)tri(vertex(i),vertex(i+1),vertex(i+2),large&&Math.abs(n.getZ(i))>.999?1:0);
 g.dispose();return new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(vertices),3)).setAttribute('normal',new BufferAttribute(new Float32Array(normals),3)).setAttribute('uv',new BufferAttribute(new Float32Array(uvs),2));
}
export function museumBoneGeometry(part:Part):BufferGeometry {
 const origin=part.primitive!.at;
 const list=[part.primitive!,...(part.extra??[])].flatMap((p:Primitive)=>{
  const extruded=p.kind==='extrude';
  const input=extruded?{...p,shape:roundOutline(p.shape),rotation:[0,0,0] as [number,number,number]}:p;
  const pieces=partPieces({primitive:input});
  const transform=new Matrix4().makeTranslation(p.at[0]-origin[0],p.at[1]-origin[1],p.at[2]-origin[2]);
  if(extruded){const r=p.rotation??[0,0,0];transform.multiply(new Matrix4().makeRotationFromEuler(new Euler(...r.map(v=>v*Math.PI/180) as [number,number,number])));}
  return pieces.map(piece=>({geometry:extruded?curvedCortex(piece.geometry,Math.sign(p.at[2]-origin[2])||1,p.kind==='extrude'&&Math.max(...p.shape.map(v=>Math.abs(v[0])))>.22):piece.geometry,matrices:(piece.matrices??[new Matrix4()]).map(m=>transform.clone().multiply(m))}));
 });
 return mergeBaked(list);
}

/** Curved cortical surfaces for thin diplodocid bones. The kit supplies the
 * anatomical outline and real openings; subdivision plus a thickness/bow field
 * makes iliac/scapular blades and neural arches three-dimensional bone rather
 * than flat signboards. All generated geometry is original, CC0 with the GLB.
 */
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Euler, Matrix4, ShapeUtils, Vector2, Vector3 } from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Part, Primitive } from '../../../src/engines/space-scene/schema';
import { mergeBaked, partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';

function roundOutline(shape: [number,number][]): [number,number][] {
 const span=Math.max(...shape.map(v=>v[0]))-Math.min(...shape.map(v=>v[0]));
 const count=Math.min(100,shape.length*(span>.35?3:1));
 const curve=new CatmullRomCurve3(shape.map(([x,y])=>new Vector3(x,y,0)),true,'centripetal');
 if(shape.length===12&&span<.35){
  // Round both crown corners with three samples, preserving the broad top.
  // Spend density on the visible crown rather than the hidden arch base.
  return shape.flatMap((_,i)=>((i===3||i===4)?[i-.24,i,i+.24]:[i]).map(t=>{const p=curve.getPoint((t+shape.length)/shape.length%1);return [p.x,p.y] as [number,number];}));
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
/** A closed cortical solid, with a rounded rim and continuously varying
 * thickness, concavity and buttress. No planar front/back slab surfaces.
 * A triangulated contour supports concave peduncles/acromion faithfully. */
function girdleCortex(p:Extract<Primitive,{kind:'extrude'}>,side:number):BufferGeometry {
 const shape=roundOutline(p.shape),contour=shape.map(v=>new Vector2(...v));
 const faces=ShapeUtils.triangulateShape(contour,[]),vertices:number[]=[],normals:number[]=[],uv:number[]=[];
 const xs=shape.map(p=>p[0]),ys=shape.map(p=>p[1]),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),w=xmax-xmin,h=ymax-ymin;
 const scapula=p.shape.length===19;
 const surface=(x:number,y:number,front:number)=>{
  let distance=Infinity;
  for(let i=0;i<shape.length;i++){
   const a=shape[i]!,b=shape[(i+1)%shape.length]!,dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
   distance=Math.min(distance,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));
  }
  const u=(x-xmin)/w,v=(y-ymin)/h;
  const rim=Math.sqrt(Math.max(0,1-Math.exp(-distance/(p.depth*.16))));
  const thick=p.depth*(scapula?.28+.38*Math.exp(-v*5):.25+.28*Math.exp(-(((u-.43)/.23)**2)));
  const bow=side*(scapula?.027*Math.sin(v*Math.PI)-.013*u:.023*Math.sin(u*Math.PI)+.012*v*v);
  const ridge=side*(scapula?.009*Math.exp(-(((u-.32-v*.3)/.12)**2))*Math.sin(v*Math.PI):.008*Math.exp(-(((v-.30)/.17)**2))*Math.sin(u*Math.PI));
  return bow+ridge+front*thick*rim;
 };
 const emit=(a:XY,b:XY,c:XY,front:number,level:number)=>{
  if(level){const mid=(a:XY,b:XY):XY=>[(a[0]+b[0])/2,(a[1]+b[1])/2],ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);emit(a,ab,ca,front,level-1);emit(ab,b,bc,front,level-1);emit(ca,bc,c,front,level-1);emit(ab,bc,ca,front,level-1);return;}
  for(const [x,y] of front>0?[a,b,c]:[c,b,a]){
   vertices.push(x,y,surface(x,y,front));uv.push((x-xmin)/w,(y-ymin)/h);
   const e=p.depth*.0003;
   const dx=(surface(x+e,y,front)-surface(x-e,y,front))/(2*e),dy=(surface(x,y+e,front)-surface(x,y-e,front))/(2*e);
   const normal=new Vector3(-front*dx,-front*dy,front).normalize();
   // The two cortex faces meet tangentially at the rounded rim. At the exact
   // contour a symmetric difference samples both sides of the distance field;
   // use the outward contour normal there instead of a false face normal.
   for(let i=0;i<shape.length;i++){
    const a=shape[i]!,b=shape[(i+1)%shape.length]!,ex=b[0]-a[0],ey=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*ex+(y-a[1])*ey)/(ex*ex+ey*ey)));
    if(Math.hypot(x-a[0]-t*ex,y-a[1]-t*ey)<1e-8){const sign=ShapeUtils.isClockWise(contour)?-1:1;normal.set(sign*ey,-sign*ex,0).normalize();break;}
   }
   normals.push(...normal.toArray());
  }
 };
 for(const f of faces)for(const side of [-1,1])emit(shape[f[0]!]!,shape[f[1]!]!,shape[f[2]!]!,side,3);
 const raw=new BufferGeometry().setAttribute('position',new BufferAttribute(new Float32Array(vertices),3)).setAttribute('normal',new BufferAttribute(new Float32Array(normals),3)).setAttribute('uv',new BufferAttribute(new Float32Array(uv),2));
 const result=mergeVertices(raw,1e-7);raw.dispose();return result;
}
type XY=[number,number];
export function museumBoneGeometry(part:Part):BufferGeometry {
 const origin=part.primitive!.at;
 const list=[part.primitive!,...(part.extra??[])].flatMap((p:Primitive)=>{
  const extruded=p.kind==='extrude';
  const input=extruded?{...p,shape:roundOutline(p.shape),rotation:[0,0,0] as [number,number,number]}:p;
  const girdle=extruded&&(p.shape.length===19||p.shape.length===24)&&!p.holes?.length;
  const pieces=girdle?[{geometry:girdleCortex(p,Math.sign(p.at[2]-origin[2])||1),matrices:null}]:partPieces({primitive:input});
  const transform=new Matrix4().makeTranslation(p.at[0]-origin[0],p.at[1]-origin[1],p.at[2]-origin[2]);
  if(extruded){const r=p.rotation??[0,0,0];transform.multiply(new Matrix4().makeRotationFromEuler(new Euler(...r.map(v=>v*Math.PI/180) as [number,number,number])));}
  return pieces.map(piece=>({geometry:extruded&&!girdle?curvedCortex(piece.geometry,Math.sign(p.at[2]-origin[2])||1,p.kind==='extrude'&&Math.max(...p.shape.map(v=>Math.abs(v[0])))>.22):piece.geometry,matrices:(piece.matrices??[new Matrix4()]).map(m=>transform.clone().multiply(m))}));
 });
 return mergeBaked(list);
}

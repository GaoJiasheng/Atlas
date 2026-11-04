/** Asian toad dermis. Warts, cranial crests and parotoids are displacement
 * of the skin itself: there are no overlaid caps, tubes or gland shells. */
import { Color,Float32BufferAttribute,SphereGeometry,Vector3 } from 'three';
import { modelGeometry } from '../bake';
import { mesh } from '../sculpture';
import { projectedUV } from '../uv';
import { rng,type Model,type Prim } from '../kit';
const BASE=new Color('#796849'),TIP=new Color('#302d22');
interface Wart { centre:Vector3;radius:number;height:number;dark:number;stretch:number; }
interface Relief { height:number;dark:number; }
const profile=(r2:number)=>r2<1?(1-r2)**3:0;
/** Compact cubic support has zero height AND zero slope at the skin join. */
export function dermalRelief(q:Vector3,n:Vector3,warts:Wart[],cranial=false):Relief {
 let height=0,dark=0;
 for(const w of warts){
  const d=q.clone().sub(w.centre),axial=d.dot(n),r2=(d.lengthSq()-axial*axial)/(w.radius*w.radius)+axial*axial/(w.radius*w.radius*w.stretch*w.stretch);
  const f=profile(Math.max(0,r2));height+=w.height*f;dark=Math.max(dark,w.dark*f*f);
 }
 if(cranial&&n.y>0){
  // Kidney outlines curve around the back of each orbit; all relief is grown
  // from whichever continuous torso/head skin is actually underneath it.
  for(const side of [-1,1]){
   const u=(q.x-.0068)/.0058,z=side*q.z-(.0090+.00065*Math.sin(u*2.4));
   const f=profile(u*u+(z/.0031)**2)*Math.min(1,n.y*3);
   height+=.00125*f;dark=Math.max(dark,.34*f);
   const path=[[.0205,.0035],[.0183,.0050],[.0155,.0062],[.0120,.0075],[.0104,.0087]];
   let distance=Infinity;
   for(let i=0;i<path.length-1;i++){
    const a=path[i]!,b=path[i+1]!,dx=b[0]!-a[0]!,dz=b[1]!-a[1]!,t=Math.max(0,Math.min(1,((q.x-a[0]!)*dx+(side*q.z-a[1]!)*dz)/(dx*dx+dz*dz)));
    distance=Math.min(distance,Math.hypot(q.x-a[0]!-dx*t,side*q.z-a[1]!-dz*t));
   }
   // Raised enough to read as the dark bony ridge at specimen distance.
   const crest=profile((distance/.00100)**2)*Math.min(1,n.y*3);
   height+=.00090*crest;dark=Math.max(dark,crest);
  }
 }
 return {height,dark};
}
function colour(q:Vector3,n:Vector3,dark:number):Color {
 const m=.5+.5*Math.sin(q.x*1480+Math.sin(q.z*1900))*Math.sin(q.z*1200+q.y*800);
 return BASE.clone().lerp(new Color('#4d4934'),m*.12).lerp(new Color('#b5a782'),Math.max(0,-n.y)*.5).lerp(TIP,dark);
}
export function wartyToad(model:Model):Model {
 const random=rng(86503),pieces:Prim[]=[],bodyParts=[model.primitive,...model.extra];
 for(let part=0;part<bodyParts.length;part++){
  const prim=bodyParts[part]!;
  // Legacy ball warts, gland ellipsoids and detached eye-colour crest sweeps.
  if(part>=2&&part<=11)continue;
  if(prim.kind==='lathe'&&prim.color==='abrasive'&&Math.abs(prim.at[0]-.008)<.0001)continue;
  if(prim.kind==='sweep'&&prim.color==='eye'&&Array.isArray(prim.radius)&&Math.abs((prim.radius as number[])[1]!-.00048)<1e-8)continue;
  const skin=prim.color==='abrasive'||prim.tint==='#6b5c3e';
  if(!skin){
   if(prim.color==='eye'||prim.color==='enamel'){
    const g=modelGeometry({primitive:prim,extra:[]}),uv=g.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setXY(i,.5,.5);pieces.push(mesh(g,'tissue','#ffffff'));
   }else pieces.push(prim);
   continue;
  }
  const cranial=part<2,centre=cranial?new Vector3(part===0?0:.0165,part===0?.0122:.0142,0):null;
  const axes=cranial?new Vector3(...(part===0?[.01775,.010224,.01491]:[.0092,.00644,.010304]) as [number,number,number]):null;
  // Resolution goes into the uninterrupted skin rather than separate wart
  // caps. The tiny ventral regions receive fewer vertices during baking.
  let g=cranial?new SphereGeometry(1,128,part===0?72:80):modelGeometry({primitive:prim,extra:[]});
  if(cranial)g.scale(axes!.x,axes!.y,axes!.z).translate(centre!.x,centre!.y,centre!.z);
  const p=g.getAttribute('position'),n=g.getAttribute('normal'),ix=g.index!,warts:Wart[]=[];
  const makeWart=(q:Vector3,normal:Vector3)=>{
   if(normal.y<-.18||q.y<.003)return;
   const radius=(cranial?.00055:.00030)+Math.pow(random(),1.5)*(cranial?.00069:.00042);
   warts.push({centre:q,radius,height:radius*(.26+random()*.40),stretch:.75+random()*.55,dark:random()<.70?.90:.08});
  };
  if(cranial){
   // Uniform solid-angle samples with area rejection avoid latitude rows.
   for(let j=0;j<(part===0?220:95);j++){
    const y=random()*2-1,a=random()*Math.PI*2,r=Math.sqrt(1-y*y),q=new Vector3(Math.cos(a)*r,y,Math.sin(a)*r).multiply(axes!).add(centre!);
    const normal=q.clone().sub(centre!).divide(axes!).divide(axes!).normalize();makeWart(q,normal);
   }
  }else{
   for(let i=0;i<ix.count;i+=3){
    const ids=[ix.getX(i),ix.getX(i+1),ix.getX(i+2)],a=new Vector3().fromBufferAttribute(p,ids[0]!),b=new Vector3().fromBufferAttribute(p,ids[1]!),d=new Vector3().fromBufferAttribute(p,ids[2]!);
    const count=b.sub(a).cross(d.sub(a)).length()*.5/.0000055;
    if(random()>=count)continue;
    const u=Math.sqrt(random()),v=random(),weights=[1-u,u*(1-v),u*v],q=new Vector3(),normal=new Vector3();
    ids.forEach((id,j)=>{q.addScaledVector(new Vector3().fromBufferAttribute(p,id),weights[j]!);normal.addScaledVector(new Vector3().fromBufferAttribute(n,id),weights[j]!);});makeWart(q,normal.normalize());
   }
  }
  const colors:number[]=[],e=.000012;
  const baseNormal=(q:Vector3)=>q.clone().sub(centre!).divide(axes!).divide(axes!).normalize();
  const project=(q:Vector3)=>{const t=q.clone().sub(centre!).divide(axes!).normalize();return t.multiply(axes!).add(centre!);};
  const raised=(q:Vector3)=>{const normal=baseNormal(q);return q.clone().addScaledVector(normal,dermalRelief(q,normal,warts,cranial).height);};
  for(let i=0;i<p.count;i++){
   const q=new Vector3().fromBufferAttribute(p,i),normal=cranial?baseNormal(q):new Vector3().fromBufferAttribute(n,i).normalize(),relief=dermalRelief(q,normal,warts,cranial);
   const U=new Vector3(Math.abs(normal.x)<.8?1:0,Math.abs(normal.x)<.8?0:1,0).addScaledVector(normal,-(Math.abs(normal.x)<.8?normal.x:normal.y)).normalize(),V=new Vector3().crossVectors(normal,U);
   let out:Vector3;
   if(cranial){
    const du=raised(project(q.clone().addScaledVector(U,e))).sub(raised(project(q.clone().addScaledVector(U,-e)))),dv=raised(project(q.clone().addScaledVector(V,e))).sub(raised(project(q.clone().addScaledVector(V,-e))));out=du.cross(dv).normalize();
   }else{
    const dhU=(dermalRelief(q.clone().addScaledVector(U,e),normal,warts).height-dermalRelief(q.clone().addScaledVector(U,-e),normal,warts).height)/(2*e),dhV=(dermalRelief(q.clone().addScaledVector(V,e),normal,warts).height-dermalRelief(q.clone().addScaledVector(V,-e),normal,warts).height)/(2*e);
    out=normal.clone().addScaledVector(U,-dhU).addScaledVector(V,-dhV).normalize();
   }
   const pos=q.clone().addScaledVector(normal,relief.height),c=colour(q,normal,relief.dark);p.setXYZ(i,pos.x,pos.y,pos.z);n.setXYZ(i,out.x,out.y,out.z);colors.push(c.r,c.g,c.b);
  }
  g.setAttribute('color',new Float32BufferAttribute(colors,3));
  // Preserve the round-3 physical 12 mm chart scale and the existing dry
  // skin finish. Split projection charts per triangle, never across one.
  if(cranial){g.deleteAttribute('uv');const charted=projectedUV(g);g.dispose();g=charted;}
  g.userData.dermalIntegrated=true;pieces.push(mesh(g,'tissue','#ffffff'));
 }
 return {primitive:pieces[0]!,extra:pieces.slice(1)};
}

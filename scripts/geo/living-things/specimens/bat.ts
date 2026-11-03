/** Lesser short-nosed fruit bat: original surface study after NParks photographs.
 * Four elongated digits carry each membrane, with free thumb and digit-II claws.
 * The short tail stays free of the reduced interfemoral membrane. */
import { BufferGeometry, Float32BufferAttribute, CatmullRomCurve3, Vector3 } from 'three';
import { mesh, orb, tube, surface, type P } from '../sculpture';
import { rng, type Model, type Prim } from '../kit';
const FUR='#76573b',MEMBRANE='#42352c',BONE='#71604e',DARK='#221e1b';
export function sculptedFruitBat():Model {
 const pieces:Prim[]=[];
 const put=(g:BufferGeometry,tint:string,color='tissue')=>{if(tint===MEMBRANE||tint==='#5d4738')g.userData.twoSided=true;pieces.push(mesh(g,color,tint));};
 const line=(p:P[],r:number[],tint:string,radial=10,n=16)=>put(tube(p,r,1,radial,n),tint);
 // Continuous furry torso, broad shoulders and narrow abdomen; not a capsule.
 put(tube([[0,.006,0],[0,.012,.001],[0,.023,.002],[0,.031,.001],[0,.037,.002]], [.0001,.0038,.0067,.0084,.0040],.8,32,40),FUR,'fabric');
 put(tube([[0,.033,.002],[0,.037,.003],[0,.040,.004]],[.006,.0042,.0045],.9,24,20),FUR,'fabric');
 const headCentres=new CatmullRomCurve3([[-.003,.043],[0,.044],[.004,.0435],[.008,.0428],[.012,.0414],[.0148,.041]].map(([z,y])=>new Vector3(0,y!,z!)));
 const headRadii=new CatmullRomCurve3([[.0001,.0001],[.0048,.0055],[.0062,.0061],[.0045,.0042],[.0030,.0025],[.0020,.0012]].map(([x,y])=>new Vector3(x,y,0)));
 const head=surface(42,32,(u,v)=>{const c=headCentres.getPoint(u),r=headRadii.getPoint(u),a=-v*Math.PI*2;return [Math.cos(a)*r.x,c.y+Math.sin(a)*r.y,c.z];});
 put(head,FUR,'fabric');
 put(orb([0,.041,.0143],[.0027,.00165,.0012],20,12),'#453a34');
 for(const side of [-1,1]){
  put(orb([side*.0013,.0415,.0150],[.0006,.00042,.00020],12,8),DARK,'eye');
  put(orb([side*.00465,.0448,.0078],[.00115,.0013,.0007],24,16),DARK,'eye');
  put(orb([side*.0048,.0452,.0084],[.00028,.00028,.00018],12,8),'#d6c6a3','eye');
  // Cupped ear pinna, broad rounded tip, pale border. Tragus not a cone.
  const ear=(u:number,v:number):P=>{
   const w=Math.sin(Math.PI*u)*.0045*(1-.28*u),a=(v-.5)*Math.PI;
   return [side*(.0048+u*.0032+Math.sin(a)*w),.046+u*.008,.0012+Math.cos(a)*w*.56+.0008*Math.sin(Math.PI*u)];
  };
  put(surface(20,12,ear),'#5d4738');
  for(const v of [0,1])line(Array.from({length:12},(_,i)=>ear(i/11,v)),Array(12).fill(.00029),'#c8b79a',6,24);
  // Arms bend at elbow before the long radius/ulna reaches the carpus.
  const S:P=[side*.006,.032,.001],E:P=[side*.014,.039,-.001],W:P=[side*.023,.034,.002];
  line([S,E,W],[.0017,.0013,.00085],FUR,16,24);
  line([[side*.013,.0386,-.0015],[side*.018,.0365,.0001],W],[.0006,.00055,.0004],BONE,8,16);
  const curves:P[][]=[
   [W,[side*.028,.033,.004],[side*.032,.029,.006]],
   [W,[side*.031,.027,.005],[side*.038,.018,.005]],
   [W,[side*.028,.018,.002],[side*.033,.006,.001]],
   [W,[side*.021,.011,-.001],[side*.021,-.004,-.001]],
  ];
  // Interdigital lobes have a concave free edge and camber between fingers.
  for(let k=0;k<3;k++){
   const A=curves[k]!,B=curves[k+1]!;
   const point=(c:P[],u:number):P=>new CatmullRomCurve3(c.map(p=>new Vector3(...p))).getPoint(u).toArray() as P;
   put(surface(22,12,(u,v)=>{
    // Pull the free trailing edge toward the wrist between finger tips.
    const edge=1-.20*Math.sin(Math.PI*v)*Math.pow(u,3),a=point(A,u*edge),b=point(B,u*edge);
    return a.map((x,j)=>x*(1-v)+b[j]!*v+(j===2?.0017*Math.sin(Math.PI*v)*Math.sin(Math.PI*u)+.00016*Math.sin(u*58+k)*Math.sin(Math.PI*v):0)) as P;
   }),MEMBRANE);
  }
  // Plagiopatagium spans fifth digit to the ankle and body flank.
  const ankle:P=[side*.005,.002,-.002],V=curves[3]![2]!;
  put(surface(20,12,(u,v)=>{
   const left: P=[S[0]*(1-u)+ankle[0]*u,S[1]*(1-u)+ankle[1]*u,S[2]*(1-u)+ankle[2]*u];
   const right:P=[W[0]*(1-u)+V[0]*u,W[1]*(1-u)+V[1]*u,W[2]*(1-u)+V[2]*u];
   return [left[0]*(1-v)+right[0]*v,left[1]*(1-v)+right[1]*v+.002*Math.sin(Math.PI*v)*Math.pow(u,2),left[2]*(1-v)+right[2]*v+.0015*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)];
  }),MEMBRANE);
  // Propatagium is bounded by shoulder, elbow and wrist; rounded leading edge.
  put(surface(12,10,(u,v)=>{
   const a:P=[S[0]*(1-u)+W[0]*u,S[1]*(1-u)+W[1]*u,S[2]*(1-u)+W[2]*u];
   const b:P=u<.5?S.map((x,j)=>x*(1-u*2)+E[j]!*u*2) as P:E.map((x,j)=>x*(2-u*2)+W[j]!*(u*2-1)) as P;
   return a.map((x,j)=>x*(1-v)+b[j]!*v+(j===2?.0008*Math.sin(Math.PI*v):0)) as P;
  }),MEMBRANE);
  curves.forEach((c,k)=>{
   line(c,[.00038,.00027,.00010],BONE,8,22);
   put(orb(c[1]!,[.00048,.00042,.00036],12,8),BONE);
   if(k===0){const e=c[2]!;line([e,[e[0]+side*.0011,e[1]+.0011,e[2]],[e[0]+side*.001,e[1]-.0008,e[2]]],[.00036,.00027,.00003],DARK,6,10);}
  });
  line([W,[W[0]-side*.0012,W[1]+.004,W[2]+.001],[W[0]-side*.003,W[1]+.006,W[2]+.001]],[.0008,.0006,.0003],BONE,10,16);
  line([[W[0]-side*.003,W[1]+.006,W[2]+.001],[W[0]-side*.004,W[1]+.006,W[2]+.001],[W[0]-side*.0042,W[1]+.0038,W[2]+.001]],[.0004,.0003,.00002],DARK,8,12);
  line([[side*.0045,.010,-.001],[side*.008,.004,-.002],ankle],[.0016,.0011,.0007],FUR,12,18);
  for(let j=0;j<5;j++){
   const root:P=[ankle[0]+side*(j-2)*.0004,ankle[1],ankle[2]],end:P=[root[0]+side*(j-2)*.00045,root[1]-.0035+(j===0?.0007:0),root[2]+.0008];
   line([root,[end[0],end[1]+.001,end[2]],end],[.00042,.00035,.00022],BONE,8,12);
   line([end,[end[0],end[1]-.0007,end[2]+.0007],[end[0],end[1]-.0003,end[2]+.0010]],[.00022,.00018,.00002],DARK,6,8);
  }
 }
 line([[0,.007,-.002],[0,.003,-.004],[0,.001,-.003]],[.0007,.00045,.00008],FUR,10,12);
 // Directional short fur follows torso and cheeks; varied short tapered tufts.
 const random=rng(211),positions:number[]=[],indices:number[]=[];
 for(let i=0;i<1000;i++){
  const u=random(),a=random()*Math.PI*2,y=.010+u*.026,r=.0035+.0048*Math.sin(u*Math.PI*.72),x=Math.cos(a)*r,z=.001+Math.sin(a)*r*.8;
  const length=.00065+random()*.0011,offset=positions.length/3,w=.00015;
  positions.push(x-w,y,z,x+w,y,z,x+Math.cos(a)*length*.35,y-length,z+Math.sin(a)*length*.45);indices.push(offset,offset+1,offset+2);
 }

 for(let i=0;i<250;i++){
  const u=.15+random()*.52,a=random()*Math.PI*2,c=headCentres.getPoint(u),r=headRadii.getPoint(u),x=Math.cos(a)*r.x,y=c.y+Math.sin(a)*r.y,z=c.z;
  const off=positions.length/3,w=.00010,len=.00045+random()*.0005;
  positions.push(x-w,y,z,x+w,y,z,x+Math.cos(a)*len*.25,y-len*.3,z-len);indices.push(off,off+1,off+2);
 }
 const fur=new BufferGeometry();fur.setAttribute('position',new Float32BufferAttribute(positions,3));fur.setIndex(indices);fur.computeVertexNormals();fur.userData.twoSided=true;put(fur,'#846546','fabric');
 // Short nape collar is warmer than the belly coat.

 return {primitive:pieces[0]!,extra:pieces.slice(1)};
}

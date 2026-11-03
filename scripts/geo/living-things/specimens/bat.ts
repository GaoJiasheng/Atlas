/** Lesser short-nosed fruit bat: original surface study after NParks photographs.
 * Four elongated digits carry each membrane, with free thumb and digit-II claws.
 * The short tail stays free of the reduced interfemoral membrane. */
import { BufferGeometry, Float32BufferAttribute, CatmullRomCurve3, Vector3, Color } from 'three';
import { mesh, orb, tube, surface, type P } from '../sculpture';
import { rng, type Model, type Prim } from '../kit';
const FUR='#6b5442',MEMBRANE='#42352c',BONE='#71604e',DARK='#221e1b';
export function sculptedFruitBat():Model {
 const pieces:Prim[]=[];
 const coat:BufferGeometry[]=[];
 const put=(g:BufferGeometry,tint:string,color='tissue')=>{
  if(color==='fabric')coat.push(g);
  else {const uv=g.getAttribute('uv');if(uv)for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*.0001,uv.getY(i)*.0001);}
  if(tint===MEMBRANE||tint==='#5d4738')g.userData.twoSided=true;pieces.push(mesh(g,color,tint));};
 const line=(p:P[],r:number[],tint:string,radial=10,n=16)=>put(tube(p,r,1,radial,n),tint,tint===FUR?'fabric':'tissue');
 // Continuous furry torso, broad shoulders and narrow abdomen; not a capsule.
 put(tube([[0,.006,0],[0,.012,.001],[0,.023,.002],[0,.031,.001],[0,.037,.002]], [.0001,.0038,.0067,.0084,.0040],.8,32,40),FUR,'fabric');
 put(tube([[0,.033,.002],[0,.037,.003],[0,.040,.004]],[.006,.0042,.0045],.9,24,20),FUR,'fabric');
 const headCentres=new CatmullRomCurve3([[-.004,.043],[0,.044],[.004,.044],[.009,.043],[.015,.0417],[.020,.0408],[.021,.0405]].map(([z,y])=>new Vector3(0,y!,z!)));
 const headRadii=new CatmullRomCurve3([[.0001,.0001],[.0048,.0052],[.0061,.0058],[.0049,.0044],[.0033,.0027],[.0026,.0017],[.0002,.0002]].map(([x,y])=>new Vector3(x,y,0)));
 const head=surface(42,32,(u,v)=>{const c=headCentres.getPoint(u),r=headRadii.getPoint(u),a=-v*Math.PI*2;return [Math.cos(a)*r.x,c.y+Math.sin(a)*r.y,c.z];});
 put(head,FUR,'fabric');
 put(orb([0,.0409,.0200],[.00265,.0017,.00125],20,12),'#453a34');
 put(tube([[0,.0385,.009],[0,.0389,.014],[0,.0392,.019]],[.0027,.0024,.0018],.45,20,22),FUR,'fabric');
 for(const side of [-1,1]){
  line([[side*.0015,.0396,.020],[side*.003,.0395,.015],[side*.0041,.040,.010]],[.00011,.00014,.00005],DARK,6,16);
  put(orb([side*.00135,.04145,.02095],[.0006,.00042,.00020],12,8),DARK,'eye');
  put(orb([side*.0049,.0445,.0091],[.00175,.00165,.00135],24,16),DARK,'eye');
  put(orb([side*.0051,.0452,.01025],[.00030,.00030,.00020],12,8),'#d6c6a3','eye');
  // Cupped ear pinna, broad rounded tip, pale border. Tragus not a cone.
  const ear=(u:number,v:number):P=>{
   const w=Math.sqrt(Math.sin(Math.PI*u))*.0038*(1-.10*u),a=(v-.5)*Math.PI;
   return [side*(.0048+u*.0018+Math.sin(a)*w),.046+u*.0069,.0012+Math.cos(a)*w*.56+.0008*Math.sin(Math.PI*u)];
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
   put(surface(16,8,(u,v)=>{
    // Pull the free trailing edge toward the wrist between finger tips.
    const edge=1-.20*Math.sin(Math.PI*v)*Math.pow(u,3),a=point(A,u*edge),b=point(B,u*edge);
    return a.map((x,j)=>x*(1-v)+b[j]!*v+(j===2?.0017*Math.sin(Math.PI*v)*Math.sin(Math.PI*u)+.00016*Math.sin(u*58+k)*Math.sin(Math.PI*v):0)) as P;
   }),MEMBRANE);
  }
  // Plagiopatagium spans fifth digit to the ankle and body flank.
  const ankle:P=[side*.005,.002,-.002],V=curves[3]![2]!;
  put(surface(16,8,(u,v)=>{
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
 // Even, area-weighted short coat on the actual head, neck, torso and
 // upper-limb surfaces. Roots are sampled on the skin, never on a proxy shell.
 const random=rng(211),positions:number[]=[],indices:number[]=[],colours:number[]=[],uvs:number[]=[];
 const brown=new Color(FUR),mantle=new Color('#a57238'),hairTip=new Color('#a49877');
 for(const g of coat){
  const p=g.getAttribute('position'),n=g.getAttribute('normal'),ix=g.index!,skinColors:number[]=[];
  const coatColour=(q:Vector3)=>{
   const collar=Math.exp(-Math.pow((q.y-.034)/.005,2))*.80;
   return brown.clone().lerp(mantle,collar).lerp(new Color('#a29574'),Math.max(0,.021-q.y)*8);
  };
  for(let i=0;i<p.count;i++){const c=coatColour(new Vector3().fromBufferAttribute(p,i));skinColors.push(c.r,c.g,c.b);}
  g.setAttribute('color',new Float32BufferAttribute(skinColors,3));
  for(let t=0;t<ix.count;t+=3){
   const ids=[ix.getX(t),ix.getX(t+1),ix.getX(t+2)],a=new Vector3().fromBufferAttribute(p,ids[0]!),b=new Vector3().fromBufferAttribute(p,ids[1]!),c=new Vector3().fromBufferAttribute(p,ids[2]!);
   const area=b.clone().sub(a).cross(c.clone().sub(a)).length()*.5,count=area/0.0000016;
   const number=Math.floor(count)+(random()<count%1?1:0);
   for(let i=0;i<number;i++){
    const u=Math.sqrt(random()),v=random(),weights=[1-u,u*(1-v),u*v],root=new Vector3(),normal=new Vector3();
    ids.forEach((id,j)=>{root.addScaledVector(new Vector3().fromBufferAttribute(p,id),weights[j]!);normal.addScaledVector(new Vector3().fromBufferAttribute(n,id),weights[j]!);});normal.normalize();
    // Muzzle tip stays nearly bare, cheeks and crown have shorter fur.
    const face=root.z>.010,length=(.00024+random()*.00028)*(face?.60:1),w=.000035+random()*.000025;
    const groom=new Vector3(0,-.65,root.y>.039?-.8:0).addScaledVector(normal,.45).normalize();
    const tangent=new Vector3().crossVectors(normal,groom).normalize();if(tangent.lengthSq()<.1)tangent.set(1,0,0);
    const end=root.clone().addScaledVector(groom,length),off=positions.length/3,col=coatColour(root);
    const points=[root.clone().addScaledVector(tangent,-w),root.clone().addScaledVector(tangent,w),end];
    points.forEach((q,j)=>{positions.push(...q.toArray());const c=col.clone().lerp(hairTip,j===2?.25:0);colours.push(c.r,c.g,c.b);uvs.push(q.y/.012,q.x/.012);});indices.push(off,off+1,off+2);
   }
  }
 }
 const fur=new BufferGeometry();fur.setAttribute('position',new Float32BufferAttribute(positions,3));fur.setAttribute('color',new Float32BufferAttribute(colours,3));fur.setAttribute('uv',new Float32BufferAttribute(uvs,2));fur.setIndex(indices);fur.computeVertexNormals();fur.userData.twoSided=true;pieces.push(mesh(fur,'fabric',FUR));
 return {primitive:pieces[0]!,extra:pieces.slice(1)};
}

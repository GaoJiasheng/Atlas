/** Lesser short-nosed fruit bat: original surface study after NParks photographs.
 * Four elongated digits carry each membrane, with free thumb and digit-II claws.
 * The short tail stays free of the reduced interfemoral membrane. */
import { BufferGeometry, Float32BufferAttribute, CatmullRomCurve3, Vector3, Color, Mesh, MeshBasicMaterial, Raycaster, DoubleSide } from 'three';
import { mesh, orb, tube, surface, type P } from '../sculpture';
import { rng, type Model, type Prim } from '../kit';
const FUR='#6b5442',MEMBRANE='#42352c',BONE='#71604e',DARK='#221e1b';
export function sculptedFruitBat():Model {
 const pieces:Prim[]=[];
 const coat:BufferGeometry[]=[];
 const put=(g:BufferGeometry,tint:string,color='tissue')=>{
  if(color==='fabric')coat.push(g);
  else {const uv=g.getAttribute('uv');if(uv)for(let i=0;i<uv.count;i++)uv.setXY(i,0,0);}
  if(tint===MEMBRANE||tint==='#5d4738')g.userData.twoSided=true;pieces.push(mesh(g,color,tint));};
 const line=(p:P[],r:number[],tint:string,radial=10,n=16)=>put(tube(p,r,1,radial,n),tint,tint===FUR?'fabric':'tissue');
 // Continuous furry torso, broad shoulders and narrow abdomen; not a capsule.
 put(tube([[0,.006,0],[0,.012,.001],[0,.023,.002],[0,.031,.001],[0,.037,.002]], [.0001,.0038,.0067,.0084,.0040],.8,32,40),FUR,'fabric');
 put(tube([[0,.033,.002],[0,.037,.003],[0,.040,.004]],[.006,.0042,.0045],.9,24,20),FUR,'fabric');
 // A high rounded vault stops above the orbits, then drops onto a short,
 // deep, nearly parallel-sided muzzle (Cynopterus brachyotis photo studies).
 const sections=[
  [-.005,.043,.0001,.0001],[-.004,.044,.0040,.0047],
  [-.001,.0448,.0062,.0068],[.002,.0450,.0069,.0071],
  [.0045,.0450,.0068,.0070],[.006,.0445,.0064,.0065],
  [.0073,.0430,.0056,.0046],[.0088,.0418,.0044,.0035],
  [.0105,.0416,.0040,.00325],[.0122,.0416,.0039,.00315],
  [.0127,.0417,.0033,.0028],[.0130,.0417,.0001,.0001],
 ];
 const headCentres=new CatmullRomCurve3(sections.map(([z,y])=>new Vector3(0,y!,z!)));
 const headRadii=new CatmullRomCurve3(sections.map(([, ,x,y])=>new Vector3(x,y,0)));
 const head=surface(80,64,(u,v)=>{
  // Start the periodic chart under the chin: a simplified triangle straddling
  // the UV seam samples the coarsest mip, so it must not sit on the cheek.
  const c=headCentres.getPoint(u),r=headRadii.getPoint(u),a=-v*Math.PI*2-Math.PI/2;
  const x=Math.cos(a)*r.x,y=c.y+Math.sin(a)*r.y,z=c.z;
  const cheek=.00042*Math.exp(-Math.pow((z-.0078)/.003,2)-Math.pow((y-.0418)/.0028,2));
  return [x+Math.sign(x)*cheek,y,z];
 },true);
 head.userData.anatomy='cranial-skin';
 put(head,FUR,'fabric');
 const faceProxy=new Mesh(head,new MeshBasicMaterial({side:DoubleSide})),ray=new Raycaster();
 const onFace=(q:Vector3,N:Vector3)=>{
  for(let i=0;i<24;i++){ray.set(q.clone().addScaledVector(N,.025),N.clone().negate());const hit=ray.intersectObject(faceProxy,false)[0];if(hit)return hit.point;q.x*=.985;q.y=.044+(q.y-.044)*.985;}
  throw new Error('Bat eye footprint missed cranial skin');
 };
 // Rounded jaw ends under the lip, with no straight projecting lower plank.
 put(tube([[0,.0384,.005],[0,.0386,.009],[0,.0389,.0118],[0,.0394,.0129]],[.0038,.0033,.0025,.0002],.53,24,24),FUR,'fabric');
 // Small squarish grey-pink rhinarium, with a deep sagittal groove.
 const signedPower=(x:number,p:number)=>Math.sign(x)*Math.pow(Math.abs(x),p);
 const nose=surface(24,48,(u,v)=>{
  const a=u*Math.PI,b=-v*Math.PI*2,front=Math.max(0,Math.cos(a));
  const x=.0019*Math.sin(a)*signedPower(Math.cos(b),.70);
  const y=.0417+.00125*Math.sin(a)*signedPower(Math.sin(b),.75);
  return [x,y,.0133+.00075*Math.cos(a)-.00042*front*Math.exp(-Math.pow(x/.00038,2))];
 },true);
 const reverse=(g:BufferGeometry)=>{const ix=g.index!,n=g.getAttribute('normal');for(let i=0;i<ix.count;i+=3){const b=ix.getX(i+1);ix.setX(i+1,ix.getX(i+2));ix.setX(i+2,b);}for(let i=0;i<n.count;i++)n.setXYZ(i,-n.getX(i),-n.getY(i),-n.getZ(i));return g;};
 put(reverse(nose),'#786560');
 for(const side of [-1,1]){
  // Each naris has an outer alar wall, rolled flare and a real deep lumen.
  const N=new Vector3(side*.36,.18,.92).normalize(),U=new Vector3(N.z,0,-N.x).normalize(),V=new Vector3().crossVectors(N,U);
  const c=new Vector3(side*.00118,.04205,.01355),cols:number[]=[];
  const profile=new CatmullRomCurve3([[.00088,-.00080],[.00086,-.00028],[.00073,.00038],[.00058,.00052],[.00043,.00030],[.00037,-.00025],[.00012,-.00105]].map(([r,z])=>new Vector3(r,z,0)));
  const naris=surface(24,40,(u,v)=>{
   const q=profile.getPoint(u),a=-v*Math.PI*2;
   const col=new Color('#8b706a').lerp(new Color('#211b19'),Math.max(0,(u-.58)/.42));cols.push(col.r,col.g,col.b);
   return c.clone().addScaledVector(U,Math.cos(a)*q.x).addScaledVector(V,Math.sin(a)*q.x*.78).addScaledVector(N,q.y).toArray() as P;
  },true);
  naris.setAttribute('color',new Float32BufferAttribute(cols,3));naris.userData.anatomy='tubular-nostril';put(naris,'#8b706a');
 }
 // Paired upper-lip lobes continue beneath the rhinarium, with an actual
 // shallow median cleft rather than a painted line at the chin.
 const lipPad=surface(24,40,(u,v)=>{
  const a=u*Math.PI,b=-v*Math.PI*2-Math.PI/2,front=Math.max(0,Math.cos(a));
  const x=.00305*Math.sin(a)*Math.cos(b),y=.03965+.00075*Math.sin(a)*Math.sin(b);
  const lobes=.00024*Math.exp(-Math.pow((Math.abs(x)-.00145)/.00075,2));
  const cleft=.00035*Math.exp(-Math.pow(x/.00043,2));
  return [x,y,.01285+.00092*Math.cos(a)+front*(lobes-cleft)];
 },true);
 {const ix=lipPad.index!,n=lipPad.getAttribute('normal');for(let i=0;i<ix.count;i+=3){const b=ix.getX(i+1);ix.setX(i+1,ix.getX(i+2));ix.setX(i+2,b);}for(let i=0;i<n.count;i++)n.setXYZ(i,-n.getX(i),-n.getY(i),-n.getZ(i));}
 put(lipPad,FUR,'fabric');
 line([[0,.0407,.01350],[0,.04045,.01346],[0,.0402,.01340]],[.00006,.00005,.00002],DARK,6,12);
 for(const side of [-1,1]){
  // Mouth follows the fleshy lip rather than projecting in front of the nose.
  line([[0,.0396,.01345],[side*.0017,.03935,.0134],[side*.0028,.0392,.0120],[side*.0038,.03955,.0097]],[.00006,.00007,.00006,.00002],DARK,6,20);
  // True 2.2 mm eyeballs, sunk only 0.7 mm into the orbital skin: their
  // poles stand 1.5 mm proud. Oblique axes keep both eyes facing forward.
  const N=new Vector3(side*.52,.13,.844).normalize(),U=new Vector3(N.z,0,-N.x).normalize(),eyeV=new Vector3().crossVectors(N,U);
  const skin=onFace(new Vector3(side*.0045,.0468,.0066),N),centre=skin.clone().addScaledVector(N,-.0007),R=.0022;
  const eyePoint=(theta:number,a:number,r=R)=>centre.clone().addScaledVector(N,Math.cos(theta)*r).addScaledVector(U,Math.sin(theta)*Math.cos(a)*r).addScaledVector(eyeV,Math.sin(theta)*Math.sin(a)*r);
  const eyeColours:number[]=[];
  const eye=surface(24,40,(u,v)=>{
   const theta=u*Math.PI,a=-v*Math.PI*2;
   const radial=(.5+.5*Math.sin(a*31+Math.sin(a*11)*1.6))*.25+.10*Math.sin(theta*95+a*7);
   const iris=new Color('#5c3519').lerp(new Color('#997043'),Math.max(0,radial));
   const col=theta<.51?new Color('#090a08'):theta<1.02?iris:new Color('#231f1a');
   if(theta>.94&&theta<1.02)col.lerp(new Color('#161410'),(theta-.94)/.08);
   eyeColours.push(col.r,col.g,col.b);
   return eyePoint(theta,a).toArray() as P;
  },true);
  reverse(eye); // polar chart (theta, clockwise azimuth)
  eye.setAttribute('color',new Float32BufferAttribute(eyeColours,3));
  eye.userData.anatomy='eyeball';eye.userData.radius=R;eye.userData.proud=.0015;
  put(eye,'#ffffff','cornea');
  // Thin wet dark lid margin hugs the globe. The surrounding furry orbit
  // blends out to the cranial surface instead of floating over the skin.
  const lidTheta=(a:number)=>.98+.22*Math.cos(2*a)+side*.035*Math.sin(a);
  const lid=surface(6,64,(s,t)=>{
   const a=-t*Math.PI*2,theta=lidTheta(a)+s*.055;
   return eyePoint(theta,a,R+.000025+.000055*Math.sin(Math.PI*s)).toArray() as P;
  },true);reverse(lid);put(lid,'#302821');
  const orbit=surface(10,64,(s,t)=>{
   const a=-t*Math.PI*2-Math.PI/2,start=lidTheta(a)+.055; // UV seam under the eye
   // Roll the furred lid back over the buried globe. The entire back edge
   // intersects cranial skin; projecting a wide ring onto the crown folded
   // the outer canthus over itself at oblique viewing angles.
   return eyePoint(start+s*(1.8-start),a,R+.00005+.00004*Math.sin(Math.PI*s)).toArray() as P;
  },true);reverse(orbit);put(orbit,FUR,'fabric');
  // Broad oval pinnae with rounded upper margins, shallow conchal cups and
  // pale whitish rims. Small left/right differences retain natural attitude.
  const ear=(r:number,t:number):P=>{
   const a=t*Math.PI*2,w=.00255+side*.00008;
   return [side*(.0067+Math.cos(a)*r*w+Math.sin(a)*r*.00075),.0500+Math.sin(a)*r*(.00385+side*.0001),.0003+.00145*(1-r*r)+.0005*r*Math.sin(a)];
  };
  put(surface(24,64,ear),'#5d4738');
  line(Array.from({length:49},(_,i)=>ear(1,i/48)),Array(49).fill(.00022),'#d0c7ad',8,64);
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
 (faceProxy.material as MeshBasicMaterial).dispose();
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
    const face=root.y>.039,length=(.00024+random()*.00028)*(face?.60:1),w=.000035+random()*.000025;
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

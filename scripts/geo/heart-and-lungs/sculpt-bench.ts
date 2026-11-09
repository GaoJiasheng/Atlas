/** Build-time bony-fish and Capsicum sculpture. Metric centre lines follow bench.ts;
 * no renderer extensions, runtime meshes or photographic decals are used. */
import {BufferGeometry,Float32BufferAttribute,Vector3,CatmullRomCurve3} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {surface, shell, flip} from '../living-things/specimens/botanical-surfaces';
import {tube, orb, type P} from '../living-things/sculpture';
import {FISH_AT,PLANT_AT,GILL_HINGE} from './bench';
const add=(a:P,b:P):P=>a.map((v,i)=>v+b[i]!) as P;
const mix=(a:P,b:P,t:number):P=>a.map((v,i)=>v+(b[i]!-v)*t) as P;
function color(g:BufferGeometry,v:number|P=1){const a=g.getAttribute('position');g.setAttribute('color',new Float32BufferAttribute(Array.from({length:a.count},()=>typeof v==='number'?[v,v,v]:v).flat(),3));return g;}
function join(gs:BufferGeometry[],origin:P){for(const g of gs){g.deleteAttribute('uv');if(!g.getAttribute('color'))color(g);}const g=mergeGeometries(gs,false)!;g.translate(...origin);for(const s of gs)s.dispose();return g;}
const profile=[[-.106,.0046,.0083,0],[-.101,.0085,.0092,-.0025],[-.095,.013,.011,-.003],[-.086,.0195,.0148,-.0015],[-.076,.025,.017,.0005],[-.062,.030,.020,.002],[-.035,.031,.020,.001],[0,.0285,.018,.0005],[.035,.021,.014,0],[.065,.010,.007,0],[.086,.0045,.003,0]];
function shape(x:number){
 let i=0;while(i<profile.length-2&&x>profile[i+1]![0]!)i++;
 const a=profile[i]!,b=profile[i+1]!,prev=profile[Math.max(0,i-1)]!,next=profile[Math.min(profile.length-1,i+2)]!,t=Math.max(0,Math.min(1,(x-a[0]!)/(b[0]!-a[0]!))),dx=b[0]!-a[0]!;
 const at=(j:number)=>{const m0=(b[j]!-prev[j]!)/(b[0]!-prev[0]!),m1=(next[j]!-a[j]!)/(next[0]!-a[0]!);return (2*t*t*t-3*t*t+1)*a[j]!+(t*t*t-2*t*t+t)*dx*m0+(-2*t*t*t+3*t*t)*b[j]!+(t*t*t-t*t)*dx*m1;};
 return {h:at(1),z:at(2),c:at(3)};
}
// One sampled opercular boundary drives BOTH the skin recess and hinged cover.
// Their overlap cannot diverge when the cranial section profile is refined.
const COVER_OUTLINE:[number,number][]=[[.003,.017],[.024,.019],[.034,.012],[.041,.013],[.035,.007],[.032,-.006],[.024,-.021],[.007,-.021],[.002,-.012],[.001,.006]];
const COVER_CURVE=new CatmullRomCurve3(COVER_OUTLINE.map(([x,y])=>new Vector3(x,y,0)),true,'catmullrom',.10);
const COVER_POLY=Array.from({length:96},(_,i)=>COVER_CURVE.getPoint(i/96));
function chamberMask(x:number,y:number){
 x+=.073;let inside=false,d=Infinity;
 for(let i=0,j=COVER_POLY.length-1;i<COVER_POLY.length;j=i++){
  const a=COVER_POLY[i]!,b=COVER_POLY[j]!,dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));
  d=Math.min(d,Math.hypot(x-a.x-t*dx,y-a.y-t*dy));
  if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }
 const t=inside?Math.max(0,Math.min(1,(d-.0009)/.0035)):0;return t*t*(3-2*t);
}
/** The actual flank: no cylinder/ellipsoid body. Arched back, breast, peduncle,
 * compressed cross-section, orbital shoulder and carved opercular recess. */
export function fishSculpt(){
 const gs:BufferGeometry[]=[];
 const body=flip(surface(72,80,(u,v)=>{
  const a=v*Math.PI*2,d=u<=.44?u/.44*.0305:.0305+(u-.44)/.56*.1615,x=-.106+d+.006*Math.sin(a)**2*Math.exp(-u*90),s=shape(x),Y=(u===0?.0046:s.h)*Math.cos(a),Z=(u===0?.0083:s.z)*Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**.65,cheek=.0018*Math.exp(-(((x+.079)/.011)**2)-((Y-.008)/.013)**2);
  const gy=Y+s.c,head=Math.exp(-(((x+.089)/.016)**6)),t=Math.max(0,Math.min(1,(x+.106)/.022));
  // Maxilla slopes back under the orbital bone; the dentary is a lower,
  // separately rounded ridge. Both are sculpted into the continuous head.
  const jawY=-.0025-.0055*t,stop=Math.max(0,Math.min(1,(-.081-x)/.004)),mouth=stop*stop*(3-2*stop);
  const jawFold=.0012*Math.exp(-(((gy-jawY)/.0012)**2))*head*mouth;
  const dentary=.0005*Math.exp(-(((gy-jawY+.0020)/.0020)**2))*head*mouth;
  const orbitD=Math.hypot((x+.085)/.0074,(gy-.0075)/.0070);
  const orbital=.00065*Math.exp(-(((orbitD-1.04)/.16)**2));
  const preop=.00075*Math.exp(-(((x+.074+.15*gy)/.0013)**2))*Math.exp(-(((gy+.002)/.018)**4));
  let z=Z+Math.sign(Z)*(cheek+orbital+dentary-jawFold-preop);
  const cavity=chamberMask(x,gy);
  if(Z>0)z-=.009*cavity;
  return [x,Y+s.c,z] as P;
 }));
 const p=body.getAttribute('position'),cs:number[]=[];
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),h=shape(x).h;
  const dors=.45+.43*(1-y/(h+.0001))*.5,band=.16*Math.exp(-((Math.sin((x+.028)*107)/.25)**2))*Math.max(0,(y/h+.5));
  const cavity=z>0?chamberMask(x,y):0;
  const jawT=Math.max(0,Math.min(1,(x+.106)/.022)),jawY=-.0025-.0055*jawT,stop=Math.max(0,Math.min(1,(-.081-x)/.004)),crease=.30*Math.exp(-(((y-jawY)/.0012)**2))*Math.exp(-(((x+.089)/.016)**6))*stop*stop*(3-2*stop);
  const c=Math.max(.23,dors-band-crease)*(1-.62*cavity);cs.push(c,c,c);
 }
 body.setAttribute('color',new Float32BufferAttribute(cs,3));gs.push(body);
 // Sculpture of both eyes: orbital rim, globe, convex cornea and iris/pupil.
 for(const sign of [-1,1]){
  // One continuous convex ocular surface. Pigmented iris/pupil regions share
  // the same corneal bulge, eliminating the former stacked bead-like globes.
  const eye=surface(16,48,(u,v)=>{
   const a=v*Math.PI*2,x=-.085+.0063*u*Math.cos(a),y=.0075+.0059*u*Math.sin(a),s=shape(x),Y=y-s.c;
   const cheek=.0018*Math.exp(-(((x+.079)/.011)**2)-((Y-.008)/.013)**2);
   const z=s.z*Math.max(.005,1-(Y/s.h)**2)**.325+cheek+.00010+.00085*(1-u*u);
   return [x,y,sign*z] as P;
  });
  const ocular:number[]=[],ep=eye.getAttribute('position');for(let i=0;i<=16;i++)for(let j=0;j<=48;j++){const u=i/16,y=ep.getY(i*49+j),skin=.45+.43*(1-y/shape(ep.getX(i*49+j)).h)*.5,t=Math.max(0,Math.min(1,(u-.80)/.15)),c=u<.64?.008:.75*(1-t)+skin*t;ocular.push(c,c,c);}
  eye.setAttribute('color',new Float32BufferAttribute(ocular,3));gs.push(sign===1?eye:flip(eye));
  // Paired narial recesses are inset in the continuous cranial surface.
  gs.push(color(orb([-.099,.0015,sign*.0098],[.00085,.00055,.00035],20,12),.12));
 }
 // Broad terminal gape, premaxillary lip and separately projecting mandible.
 // The mouth sits below the eye/forehead axis rather than at a cone tip.
 const mouthPoint=(a:number):P=>[-.106+.006*Math.sin(a)**2,0+.0046*Math.cos(a),.0083*Math.sin(a)];
 // A recessed oral cavity has depth, an upper palate and lower floor. It is
 // open at the actual water-route entrance, not a dark disc on the snout.
 gs.push(color(surface(8,48,(u,v)=>{const a=v*2*Math.PI,p=mouthPoint(a);return [p[0]+.008*u,p[1],p[2]*(1-.10*u)] as P;}),.075));
 gs.push(color(orb([-.0945,0,0],[.0004,.0028,.005],24,12),.055));
 for(const upper of [true,false]){
  const pts=Array.from({length:25},(_,i)=>{const a=(upper?-Math.PI/2:Math.PI/2)+i*Math.PI/24,p=mouthPoint(a);p[0]-=.00005;return p;});
  gs.push(color(tube(pts,Array(25).fill(upper?.00028:.00040),1,10,24),upper?.52:.64));
 }
 // Each fin is a cambered two-sided membrane with raised rays; the caudal
 // rays root across the peduncle rather than at one artificial fan point.
 function fin(n:number,root:(u:number)=>P,edge:(u:number)=>P,ray=.00038){
  const point=(u:number,v:number)=>{const a=root(u),b=edge(u),p=mix(a,b,v);p[2]+=.0012*Math.sin(u*Math.PI)*Math.sin(v*Math.PI)+.00035*Math.sin(u*n*Math.PI*2)*v;return p;};
  const patch=shell(surface(n*2,6,point),.00024);
  gs.push(color(patch,.61));
  for(let k=0;k<=n;k++){const u=k/n;gs.push(color(tube([0,.25,.5,.75,1].map(v=>add(point(u,v),[0,0,.00022])),[ray,ray*.9,ray*.7,ray*.5,.000055],1,6,8),.40));}
 }
 fin(18,u=>[.081+.007*Math.sin(u*Math.PI),(u-.5)*.009,0],u=>[.113+.020*Math.abs(2*u-1)**1.2,.034*(2*u-1),.0015*Math.sin(u*5)],.00038);
 // The spinous dorsal has individually unequal spine lengths and real
 // interspinal scallops, unlike a rounded solid hump. Soft dorsal rays sweep.
 const heights=[.001,.019,.028,.030,.028,.026,.024,.022,.020,.017,.013,.010,.006,.001];
 const spine=(u:number)=>{const q=u*13,i=Math.min(12,Math.floor(q)),t=q-i;return heights[i]!*(1-t)+heights[i+1]!*t-.0021*Math.sin(Math.PI*t);};
 fin(13,u=>[-.052+.070*u,shape(-.052+.070*u).h+shape(-.052+.070*u).c,0],u=>[-.052+.076*u,shape(-.052+.070*u).h+shape(-.052+.070*u).c+spine(u),0],.00048);
 fin(12,u=>[.024+.038*u,shape(.024+.038*u).h,0],u=>[.028+.040*u,shape(.024+.038*u).h+.015*Math.sin(Math.PI*u)**.65-.0008*Math.sin(u*12*Math.PI)**2,0],.00034);
 fin(11,u=>[.019+.042*u,-shape(.019+.042*u).h+.003,0],u=>[.027+.040*u,-shape(.019+.042*u).h-.015*Math.sin(Math.PI*u)**.6+.0008*Math.sin(u*11*Math.PI)**2,0],.00032);
 for(const sign of [-1,1]){
  fin(12,u=>[-.034+.004*u,-.011+.003*u,sign*.017],u=>[-.026+.034*u,-.018-.017*Math.sin(u*Math.PI),sign*(.021+.012*Math.sin(u*Math.PI))]);
  fin(8,u=>[-.015+.007*u,-.026,sign*.005],u=>[-.009+.019*u,-.032-.013*Math.sin(u*Math.PI),sign*(.008+.009*Math.sin(u*Math.PI))],.00029);
  // Lateral-line canal: low, articulated relief follows actual body curvature.
  gs.push(color(tube(Array.from({length:15},(_,k)=>{const x=-.03+k*.007;return [x,.009,sign*(shape(x).z*.94+.00022)] as P;}),Array(15).fill(.00018),1,7,28),.57));
 }
 return join(gs,FISH_AT);
}
/** Four branchial arches; each carries two hemibranch rows of tapered,
 * curved filaments, plus short inward-directed rakers. No box stacks. */
export function gillSculpt(){
 const gs:BufferGeometry[]=[];
 for(let k=0;k<4;k++){
  const arch=(u:number):P=>[-.069+k*.007+.013*(2*u-1)**2,.023*Math.cos(Math.PI*u)*(1-k*.07),.0115+.003*Math.sin(Math.PI*u)+k*.0007];
  gs.push(color(tube(Array.from({length:17},(_,i)=>arch(i/16)),Array(17).fill(.0009),1,12,32),.78));
  const count=126-k*6;
  for(let j=0;j<count;j++){
   const t=(j+.45+.19*Math.sin(j*2.39+k))/count,a=arch(t),len=(.001+.012*Math.sin(Math.PI*t)**1.1)*(1-k*.06)*(1+.035*Math.sin(j*.43+k)+.012*Math.sin(j*2.4+k));
   for(const side of [-1,1]){
    const end=add(a,[len,.004*Math.cos(t*Math.PI),side*.0018]);
    // A primary filament is a flattened, tapered respiratory blade, not a
    // round rod. Each blade's camber and reach vary along the arch.
    const blade=shell(surface(3,1,(u,v)=>{
     const p=mix(a,end,u),w=.00034*(.2+.8*Math.sin(Math.PI*(.16+.84*u))**.6)*(1+.08*Math.sin(j*1.7));
     p[1]+=(2*v-1)*w+.0008*Math.sin(Math.PI*u)*Math.cos(t*Math.PI);
     p[2]+=side*.0005*Math.sin(Math.PI*u)+.000025*Math.cos(u*6*Math.PI)*(2*v-1);
     return p;
    }),.000065);
    gs.push(color(blade,.80+.065*Math.sin(j*.36+k)));
   }
   if(j%7===0){const r=add(a,[-.0032,-.0005*Math.cos(t*Math.PI),-.0008]);gs.push(color(tube([a,mix(a,r,.6),r],[.00042,.00029,.000015],1,6,5),.50));}
  }
 }
 for(const g of gs){const p=g.getAttribute('position');for(let i=0;i<p.count;i++)p.setXYZ(i,-.070+(p.getX(i)+.070)*.70,p.getY(i)*.80,p.getZ(i));const n=g.getAttribute('normal');for(let i=0;i<n.count;i++){const v=new Vector3(n.getX(i)/.70,n.getY(i)/.80,n.getZ(i)).normalize();n.setXYZ(i,v.x,v.y,v.z);}}
 return join(gs,FISH_AT);
}
/** Convex operculum: raised radial bone contours, softly scalloped posterior
 * margin and a thin real edge. The original front hinge/pivot is preserved. */
export function coverSculpt(){
 const curve=COVER_CURVE;
 const frontZ=GILL_HINGE[2]-FISH_AT[2];
 const zAt=(x:number,y:number)=>{const s=shape(x-.073),q=(y-s.c)/s.h;return s.z*Math.max(.005,1-q*q)**.325-frontZ;};
 const g=shell(surface(16,64,(u,v)=>{
  const p=curve.getPoint(v),x=.014+(p.x-.014)*u,y=p.y*u;
  // The preopercle is an angular crescent, not concentric decorative wires.
  const groove=.00025*Math.exp(-(((x-(.004+.20*Math.max(0,-y)))/.0011)**2));
  const ridge=.00018*Math.exp(-(((y-(.010-.72*x))/.0018)**2));
  return [x,y,zAt(x,y)+.00025+.00012*(1-u*u)-groove+ridge] as P;
 }),.00040);
 const c=g.getAttribute('position'),pigment:number[]=[];
 for(let i=0;i<c.count;i++){
  const x=c.getX(i),y=c.getY(i),h=shape(x-.073).h,tone=.45+.43*(1-y/(h+.0001))*.5-.07*Math.exp(-(((x-.003-.20*Math.max(0,-y))/.0014)**2));pigment.push(tone,tone,tone);
 }
 g.setAttribute('color',new Float32BufferAttribute(pigment,3));const contours:BufferGeometry[]=[g];
 // The subopercular edge overlaps the throat as a thin curved bony ledge.
 const margin=Array.from({length:21},(_,i)=>{const p=curve.getPoint(.02+.43*i/20);return [p.x,p.y,zAt(p.x,p.y)+.00020] as P;});
 contours.push(color(tube(margin,Array(21).fill(.00021),1,6,20),.43));
 return join(contours,GILL_HINGE);
}
/** Thirteen leaves as before (2 cotyledons + 10 true blades + apical leaf),
 * individually curved, petiolate and veined; teaching tubes keep old routes. */
export function plantSculpt(){
 const gs:BufferGeometry[]=[];
 const stem=[ [0,.081,0],[.00675,.18,0],[.0045,.288,.0045] ] as P[];
 gs.push(color(tube(stem,[.0048,.0036,.0021],1,20,40),.69));
 const leaves:{at:P;dir:P;l:number;w:number;seed:number}[]=[];
 for(const sign of [1,-1]){
  leaves.push({at:[.0054,.189,0],dir:[sign,sign===-1?.30:.28,.15*sign],l:.0765*(1+.05*sign),w:.01935,seed:sign});
  leaves.push({at:[.0063,sign===1?.243:.237,.00225],dir:[.25*sign,sign===1?.45:.37,sign],l:.099*(1-.05*sign),w:.04275,seed:sign+4});
  leaves.push({at:[.0045,sign===1?.279:.273,.0045],dir:[sign,sign===1?.7:.58,-.2*sign],l:.0675*(1+.06*sign),w:.0288,seed:sign+7});
 }
 leaves.push({at:[.00315,.2835,.0045],dir:[.1,.95,.2],l:.0225,w:.0099,seed:11});
 for(const [k,y] of [.205,.250,.267].entries())for(const sign of [-1,1]){const a=(k*70+25)*Math.PI/180;leaves.push({at:[.006,y+(sign===1?.0025:0),0],dir:[Math.cos(a)*sign,.42+sign*.08,Math.sin(a)*sign],l:(.019-k*.002)*4.5*(sign===1?.92:1.04),w:(.0085-k*.0008)*4.5,seed:13+k*2+sign});}
 for(const L of leaves){
  const d=new Vector3(...L.dir).normalize(),across=new Vector3().crossVectors(d,new Vector3(0,1,.03)).normalize().applyAxisAngle(d,.70*Math.sin(L.seed*2.3)+.32),N=new Vector3().crossVectors(across,d).normalize();
  const point=(u:number,s:number):P=>{
   const w=L.w*.5*(u<=.105?0:Math.sin(Math.PI*(u-.105)/.895)**.82)*(1-.22*u)*(1+.025*Math.sin(u*23+L.seed+s)*s);
   const flowLeaf=[5,8,-1].includes(L.seed),centre=new Vector3(...L.at).addScaledVector(d,L.l*u).addScaledVector(across,flowLeaf?0:L.l*.030*Math.sin(u*3+L.seed)*u).addScaledVector(N,flowLeaf?0:L.l*.045*Math.sin(Math.PI*u));
   if(!flowLeaf)centre.y-=L.l*(.24+.11*Math.cos(L.seed))*u*u;
   return centre.addScaledVector(across,w*s).addScaledVector(N,w*(.26*Math.abs(s)**1.4+.07*Math.sin(u*11+L.seed)*s*s)).toArray() as P;
  };
  const blade=shell(surface(20,6,(u,v)=>point(.105+.895*u,2*v-1)),.00036);
  color(blade,.74+.1*Math.sin(L.seed));gs.push(blade);
  gs.push(color(tube([L.at,point(.07,0),point(.15,0)],[.0015,.001,.0008],1,8,6),.74));
  gs.push(color(tube(Array.from({length:19},(_,j)=>point(.11+.88*j/18,0)),Array.from({length:19},(_,j)=>.00070*(1-j/19)+.00005),1,6,12),1.10));
  // Five to six alternate veins meet the midrib; no printed line texture.
  for(let j=0;j<5;j++)for(const side of [-1,1]){
   const t=.21+j*.125+side*.014;
   const pts=Array.from({length:5},(_,i)=>{const q=i/4,p=point(Math.min(.98,t+.18*q),side*.91*Math.sin(q*Math.PI/2));p[0]+=N.x*.00040;p[1]+=N.y*.00040;p[2]+=N.z*.00040;return p;});
   gs.push(color(tube(pts,[.00025,.00023,.00018,.00012,.000045],1,5,6),1.02));
  }
 }
 return join(gs,PLANT_AT);
}
/** A granular continuous soil surface, inset below the real pot lip. */
export function soilSculpt(){
 const g=shell(surface(12,64,(u,v)=>{const r=.0603*Math.sqrt(u),a=v*2*Math.PI,x=r*Math.cos(a),z=r*Math.sin(a),h=.0012*Math.sin(x*830+z*117)*Math.sin(z*710-x*83)+.0007*Math.cos(x*340-z*430);return [x,.0815+h*(1-u*.65),z] as P;}),.0015);
 color(g,.40);return join([g],PLANT_AT);
}
export function tubeSculpt(tint:'water'|'food'){
 const dx=(tint==='water'?-1:1)*.0072*.34,dz=.0072*.62;
 return join([color(tube([[dx,.081,dz],[.00675+dx,.18,dz],[.0045+dx,.288,.0045+dz]],[.00187,.00187,.00187],1,16,40))],PLANT_AT);
}
export const SCULPT_FACTS={gillArches:4,hemibranchRows:8,filaments:[252,240,228,216],leafBlades:13,pairedFins:4,unpairedFins:4};

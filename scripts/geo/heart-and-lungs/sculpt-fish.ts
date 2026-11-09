/** Round four: a new traced perch loft, continuous fleshy jaws and curved
 * branchial pocket. Geometry is baked; no renderer change or photo decal. */
import fs from 'node:fs';
import {MeshoptSimplifier} from 'meshoptimizer';
import {BufferGeometry,Float32BufferAttribute,Vector3,CatmullRomCurve3,Color,MeshBasicMaterial} from 'three';
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';
import {mergeVertices,mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {surface,shell,flip} from '../living-things/specimens/botanical-surfaces';
import {tube,orb,type P} from '../living-things/sculpture';
import {FISH_AT,GILL_HINGE} from './bench';
import {PERCH_SECTIONS,PERCH_EYE} from './perch-trace';
const css=fs.readFileSync('src/theme/tokens.css','utf8'),paper=css.slice(css.indexOf(':root[data-theme="paper"] {'));
const token=(name:string)=>new Color(paper.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`,'i'))![1]);
const BONE=token('bone'),OLIVE=token('seedling'),DARK=token('ink'),OCHRE=token('cut'),FIN=token('hot'),NEUTRAL=token('neutral');
const ratio=(c:Color):P=>[c.r/BONE.r,c.g/BONE.g,c.b/BONE.b];
const clamp=(t:number)=>Math.max(0,Math.min(1,t));
const smooth=(t:number)=>{t=clamp(t);return t*t*(3-2*t);};
const mix=(a:P,b:P,t:number):P=>a.map((v,i)=>v+(b[i]!-v)*t) as P;
function paint(g:BufferGeometry,c:P|((p:P,i:number)=>P)){
 const a=g.getAttribute('position'),v:number[]=[];for(let i=0;i<a.count;i++)v.push(...(typeof c==='function'?c([a.getX(i),a.getY(i),a.getZ(i)],i):c));g.setAttribute('color',new Float32BufferAttribute(v,3));return g;
}
function join(gs:BufferGeometry[],origin:P){for(const g of gs){g.deleteAttribute('uv');if(!g.getAttribute('color'))paint(g,[1,1,1]);}const g=mergeGeometries(gs,false)!;g.translate(...origin);for(const p of gs)p.dispose();return g;}
function shape(x:number){
 const p=PERCH_SECTIONS;let k=0;while(k<p.length-2&&x>p[k+1]![0]!)k++;
 const a=p[k]!,b=p[k+1]!,prev=p[Math.max(0,k-1)]!,next=p[Math.min(p.length-1,k+2)]!,t=clamp((x-a[0]!)/(b[0]!-a[0]!)),dx=b[0]!-a[0]!;
 const at=(j:number)=>{const m0=(b[j]!-prev[j]!)/(b[0]!-prev[0]!),m1=(next[j]!-a[j]!)/(next[0]!-a[0]!);return (2*t*t*t-3*t*t+1)*a[j]!+(t*t*t-2*t*t+t)*dx*m0+(-2*t*t*t+3*t*t)*b[j]!+(t*t*t-t*t)*dx*m1;};
 const top=at(1),bottom=at(2);return {top,bottom,h:(top-bottom)/2,c:(top+bottom)/2,z:at(3)};
}
function skin(x:number,y:number):P{
 const s=shape(x),t=clamp((y-s.bottom)/(s.top-s.bottom));
 // Actual palette pigments in linear light. Golden flanks, olive dorsal
 // field, pale belly and six distinct broad melanophore bars.
 const c=OCHRE.clone().lerp(OLIVE,.43).multiplyScalar(.40);
 c.lerp(BONE.clone().multiplyScalar(.43),.82*(1-smooth(t/.42)));
 c.lerp(OLIVE.clone().multiplyScalar(.16),.66*smooth((t-.63)/.37));
 let bar=0;const centers=[-.028,-.004,.020,.042,.061,.078];
 centers.forEach((center,k)=>{const w=.0048-.00035*k,shift=.0018*Math.sin(y*110+k*.9);bar=Math.max(bar,Math.exp(-Math.pow((x-center-shift)/w,4)));});
 c.lerp(DARK.clone().multiplyScalar(.075),bar*.94*smooth((t-.12)/.31));
 const cheek=smooth((-.037-x)/.045)*Math.exp(-(((y+.003)/.025)**2));
 c.lerp(BONE.clone().lerp(FIN,.04).multiplyScalar(.35),.33*cheek);
 // Fine pigment variation belongs to the dermis, never a photographed map.
 c.multiplyScalar(1+.035*Math.sin(x*3100+y*1700)*Math.sin(x*1600-y*2700));return ratio(c);
}
const eyeX=PERCH_EYE[0]!,eyeY=PERCH_EYE[1]!,eyeR=.0064;
function power(x:number){return .50-.24*smooth((x+.083)/.012)*(1-smooth((x+.027)/.012));}
function bodyPoint(x:number,a:number):P{
 const s=shape(x),co=Math.cos(a),si=Math.sin(a),y=s.c+s.h*co;
 let z=s.z*Math.sign(si)*Math.abs(si)**(2*power(x));
 const socket=Math.exp(-(((Math.hypot((x-eyeX)/.0052,(y-eyeY)/.0050)-.97)/.22)**2));
 const infra=.00055*Math.exp(-(((x+.099)/.012)**4)-(((y-.0035)/.0028)**2));
 const cheek=.0007*Math.exp(-(((x+.088)/.010)**2)-(((y+.006)/.012)**2));
 z+=si*(cheek+infra-.00035*socket);
 return [x,y,z];
}
function sideZ(x:number,y:number){const s=shape(x);
 if(x<-.072){const relief=.0008*Math.exp(-(((x+.090)/.012)**2)-(((y+.005)/.012)**2)),maxilla=.0008*Math.exp(-(((x+.103)/.015)**4)-(((y-(-.003-.20*(x+.115)))/.0019)**2)),socket=-.0005*Math.exp(-(((Math.hypot((x-eyeX)/.0055,(y-eyeY)/.0052)-.98)/.21)**2));return (s.z+relief+maxilla+socket)*Math.sqrt(Math.max(0,1-((y-s.c)/s.h)**2));}
 return bodyPoint(x,Math.acos(Math.max(-1,Math.min(1,(y-s.c)/s.h))))[2];}
const smoothMax=(a:number,b:number,k:number)=>{const h=clamp(.5+.5*(a-b)/k);return a*h+b*(1-h)+k*h*(1-h);};
/** Carved oral passage, open anteriorly and rounded at the pharynx. */
function oralField(x:number,y:number,z:number){
 const t=smooth((x+.105)/.028),h=.0048+.015*t,w=.014+.004*t,cy=-.0010+.002*t;
 const radial=(Math.hypot((y-cy)/h,z/(z>=0?w:.0075+.0065*t))-1)*Math.min(w,h);
 return smoothMax(radial,x+.068,.005);
}
function cranialField(x:number,y:number,z:number){
 const s=shape(x),relief=.0008*Math.exp(-(((x+.090)/.012)**2)-(((y+.005)/.012)**2));
 const maxilla=.0008*Math.exp(-(((x+.103)/.015)**4)-(((y-(-.003-.20*(x+.115)))/.0019)**2));
 const socket=-.0005*Math.exp(-(((Math.hypot((x-eyeX)/.0055,(y-eyeY)/.0052)-.98)/.21)**2));
 const crease=.00040*Math.exp(-(((x+.102)/.017)**6)-(((y-(-.005-.20*(x+.114)))/.00070)**2));
 const zz=s.z+relief+maxilla+socket-crease;
 const outer=(Math.hypot((y-s.c)/s.h,z/zz)-1)*Math.min(s.h,zz);
 const cap=-.122+.004*((y+.002)/.019)**2+.004*(z/.015)**2;
 const capped=smoothMax(outer,cap-x,.0015);
 return smoothMax(capped,-oralField(x,y,z),.00075);
}
export let CRANIAL_STATS={before:0,after:0,errorMetres:0};
function cranialMesh(){
 const n=84,lo:P=[-.123,-.033,-.027],hi:P=[-.070,.039,.027],mc=new MarchingCubes(n,new MeshBasicMaterial(),false,false,120000);mc.isolation=0;
 for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++)mc.field[z*n*n+y*n+x]=-cranialField(lo[0]+(hi[0]-lo[0])*x/n,lo[1]+(hi[1]-lo[1])*y/n,lo[2]+(hi[2]-lo[2])*z/n);
 mc.update();const count=mc.geometry.drawRange.count,g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(mc.geometry.getAttribute('position').array.slice(0,count*3),3));
 const p=g.getAttribute('position'),normals:number[]=[];
 for(let i=0;i<p.count;i++){
  const x=lo[0]+(p.getX(i)+1)*.5*(hi[0]-lo[0]),y=lo[1]+(p.getY(i)+1)*.5*(hi[1]-lo[1]),z=lo[2]+(p.getZ(i)+1)*.5*(hi[2]-lo[2]),e=.000015;
  p.setXYZ(i,x,y,z);const N=new Vector3(cranialField(x+e,y,z)-cranialField(x-e,y,z),cranialField(x,y+e,z)-cranialField(x,y-e,z),cranialField(x,y,z+e)-cranialField(x,y,z-e)).normalize();normals.push(...N.toArray());
 }
 g.setAttribute('normal',new Float32BufferAttribute(normals,3));
 paint(g,p=>{const inner=oralField(...p);return Math.abs(inner)<.00045&&Math.abs(p[2])<.012&&p[0]<-.079?ratio(DARK.clone().multiplyScalar(.032)):skin(p[0],p[1]);});
 const result=mergeVertices(g,.000005),attributes:number[]=[];
 const rp=result.getAttribute('position'),rn=result.getAttribute('normal'),rc=result.getAttribute('color');
 for(let i=0;i<rp.count;i++)attributes.push(rn.getX(i),rn.getY(i),rn.getZ(i),rc.getX(i),rc.getY(i),rc.getZ(i));
 const [indices,error]=MeshoptSimplifier.simplifyWithAttributes(new Uint32Array(result.index!.array),new Float32Array(rp.array),3,new Float32Array(attributes),6,[.001,.001,.001,.001,.001,.001],null,24000,.00009,['LockBorder','ErrorAbsolute']);
 CRANIAL_STATS={before:result.index!.count/3,after:indices.length/3,errorMetres:error};result.setIndex(Array.from(indices));mc.geometry.dispose();(mc.material as MeshBasicMaterial).dispose();g.dispose();return result;
}
// Smooth opercle contour with a posterior flat spine, not a rectangular shield.
const COVER_POINTS:P[]=[[.000,.018,0],[.007,.023,0],[.018,.025,0],[.027,.023,0],[.034,.019,0],[.036,.016,0],[.033,.013,0],[.034,.003,0],[.031,-.010,0],[.025,-.020,0],[.014,-.023,0],[.006,-.023,0],[-.001,-.018,0],[-.003,-.004,0]];
const COVER=new CatmullRomCurve3(COVER_POINTS.map(p=>new Vector3(...p)),true,'catmullrom',.22);
const POLY=Array.from({length:128},(_,i)=>COVER.getPoint(i/128));
function coverDistance(x:number,y:number){x+=.073;let inside=false,d=Infinity;for(let i=0,j=POLY.length-1;i<POLY.length;j=i++){
 const a=POLY[i]!,b=POLY[j]!,dx=b.x-a.x,dy=b.y-a.y,t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy));d=Math.min(d,Math.hypot(x-a.x-t*dx,y-a.y-t*dy));
 if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/dy+a.x)inside=!inside;
 }return inside?d:-d;
}
let membranes:BufferGeometry[]=[];
export function fishMembraneSculpt(){return join(membranes,FISH_AT);}
export function fishSculpt(){
 membranes=[];const gs:BufferGeometry[]=[];
 // Continuous SDF head, with flesh around the carved oral passage.
 gs.push(cranialMesh());
 const body=flip(surface(32,56,(u,v)=>bodyPoint(-.075+.162*u,v*2*Math.PI))),pos=body.getAttribute('position'),ix=body.index!,keep:number[]=[];
 for(let k=0;k<ix.count;k+=3){const v=[ix.getX(k),ix.getX(k+1),ix.getX(k+2)];if(v.some(i=>pos.getZ(i)>0&&coverDistance(pos.getX(i),pos.getY(i))>.0005))continue;keep.push(...v);}body.setIndex(keep);
 paint(body,p=>skin(p[0],p[1]));gs.push(body);
 // Rounded contour-aligned pocket: gradual concavity, continuous derivative
 // across the rim and no hard planar side/back walls.
 const bowl=flip(surface(14,96,(u,v)=>{
  const edge=COVER.getPoint(v),r=u*1.30,x=-.073+.014+(edge.x-.014)*r,ss=shape(x),y=Math.max(ss.bottom+.00003,Math.min(ss.top-.00003,-.001+(edge.y+.001)*r));
  const t=smooth((r-.55)/.45),depth=.011*(1-t)+.022*Math.exp(-(((x+.074)/.014)**4)-((y/.018)**4));return [x,y,sideZ(x,y)-depth+.00003] as P;
 }));paint(bowl,p=>{const d=coverDistance(p[0],p[1]);return skin(p[0],p[1]).map(c=>c*(1-.78*smooth(d/.007))) as P;});gs.push(bowl);
 // Overlapping ctenoid scales: continuous along the trunk and over the nape.
 // Nine vertices per scale suffice; all are batched with the skin in one draw.
 const rows=40,cols=60,dx=.151/cols,da=2*Math.PI/rows;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  const x0=-.071+c*dx+(r%2)*dx*.5,a0=(r+.5)*da;
  const g=flip(surface(1,3,(u,v)=>{
   const q=2*v-1,x=x0+(u-.5)*dx*1.28-.00055*q*q*u,a=a0+(v-.5)*da*1.08,p=bodyPoint(x,a),s=shape(x);
   const n=new Vector3(0,Math.cos(a)/s.h,Math.sin(a)/s.z).normalize(),lift=(-.000012+.000075*u*u)*Math.cos(q*Math.PI/2)**2;
   return new Vector3(...p).addScaledVector(n,lift).toArray() as P;
  }));
  const p=g.getAttribute('position');let hidden=false;for(let i=0;i<p.count;i++)if(p.getZ(i)>0&&coverDistance(p.getX(i),p.getY(i))>-.0005)hidden=true;
  if(hidden){g.dispose();continue;}
  paint(g,(p,i)=>skin(p[0],p[1]).map(c=>c*(i>=4?.84:1+.04*Math.sin(r*2.7+c))) as P);gs.push(g);
 }
 // Small convex eye set into the cranial socket: bronze iris and black pupil
 // share a bulging surface, with a thin dark circumorbital rim.
 for(const sign of [-1,1]){
  const eye=surface(12,40,(u,v)=>{const a=v*2*Math.PI,x=eyeX+eyeR*u*Math.cos(a),y=eyeY+eyeR*.94*u*Math.sin(a);return [x,y,sign*(sideZ(x,y)+.0002+.0010*(1-u*u))] as P;});
  paint(eye,(_,i)=>{const u=Math.floor(i/41)/12,j=i%41;const c=u<.48?DARK.clone().multiplyScalar(.018):u>.90?DARK.clone().multiplyScalar(.10):OCHRE.clone().lerp(FIN,.15+.06*Math.sin(j*2.3)).multiplyScalar(.55+.12*Math.sin(j*3.4));return ratio(c);});gs.push(sign===1?eye:flip(eye));
  const z=sideZ(eyeX-.0011,eyeY+.0013)+.00117;gs.push(paint(orb([eyeX-.0011,eyeY+.0013,sign*z],[.00024,.00018,.00009],12,8),ratio(BONE.clone().multiplyScalar(.80))));
  for(const [x,y,r] of [[-.1095,.013,.00045],[-.106,.015,.00037]]){const p:P=[x!,y!,sign*(sideZ(x!,y!)+.00002)];gs.push(paint(orb(p,[r!,r!*.64,.00009],12,8),ratio(DARK.clone().multiplyScalar(.10))));}
 }
 // A tail-root cap joins the peduncle into the caudal fin root.
 const cap=surface(3,48,(u,v)=>{const a=v*2*Math.PI;return [.087+.001*(1-u*u),.004*u*Math.cos(a),.0032*u*Math.sin(a)] as P;});gs.push(paint(cap,p=>skin(p[0],p[1])));
 // A fin is a continuous cambered web spanning irregular ray stations.
 // Sag is between rays, not a stack of thick extruded radial cards.
 function fin(roots:P[],tips:P[],kind:'spines'|'soft'|'red',ray=.00020,stiff=0){
  const n=tips.length-1,stations=tips.map((_,i)=>i===0?0:i===n?1:(i+.13*Math.sin(i*2.1))/n);
  function at(u:number,v:number):P{
   let k=0;while(k<n-1&&u>stations[k+1]!)k++;const t=clamp((u-stations[k]!)/(stations[k+1]!-stations[k]!)),root=mix(roots[k]!,roots[k+1]!,t),edge=mix(tips[k]!,tips[k+1]!,t);
   const sag=(kind==='spines'?.0017:.00065)*Math.sin(Math.PI*t),p=mix(root,edge,v);p[1]-=Math.sign(edge[1]-root[1])*sag*v;
   p[2]+=.0008*Math.sin(u*Math.PI)*Math.sin(v*Math.PI)+.00030*Math.sin(Math.PI*t)*Math.sin(v*Math.PI);return p;
  }
  const patch=shell(surface(n*3,4,at),.000022);
  paint(patch,p=>{const blotch=kind==='spines'?Math.exp(-(((p[0]-.012)/.012)**4)-(((p[1]-.042)/.016)**4)):0,c=kind==='red'?FIN.clone().multiplyScalar(.65):NEUTRAL.clone().lerp(OCHRE,.20).multiplyScalar(.45);return ratio(c.lerp(DARK.clone().multiplyScalar(.025),blotch*.98));});membranes.push(patch);
  for(let k=0;k<=n;k++){
   const u=stations[k]!,pts=[0,.2,.4,.6,.8,1].map(v=>at(u,v));
   const pigment=kind==='red'?FIN.clone().multiplyScalar(.55):OCHRE.clone().lerp(OLIVE,.30).multiplyScalar(.22);
   gs.push(paint(tube(pts,[ray,ray*.84,ray*.66,ray*.43,ray*.20,.000006],.75,5,5),ratio(pigment)));
   if(kind!=='spines'&&k>=stiff&&k>0&&k<n)for(const side of [-1,1]){
    const pts=[0,.5,1].map(t=>at(u+side*.28/n*t,.57+.43*t));gs.push(paint(tube(pts,[ray*.4,ray*.19,.000006],.8,4,3),ratio(pigment)));
   }
  }
 }
 const stations=(n:number,f:(u:number,i:number)=>P)=>Array.from({length:n},(_,i)=>f(i/(n-1),i));
 const top=(x:number)=>shape(x).top;
 const heights=[.002,.020,.028,.030,.028,.027,.025,.023,.020,.018,.015,.011,.006,.001];
 fin(stations(14,u=>[-.055+.074*u,top(-.055+.074*u)-.0004,0]),stations(14,(u,i)=>[-.055+.080*u,top(-.055+.074*u)+heights[i]!,0]),'spines',.00022);
 // Soft dorsal/anal form swept quadrilaterals; their tips do not follow a circle.
 const soft=[.004,.016,.019,.0195,.019,.018,.0175,.016,.0145,.013,.011,.008,.005,.001];
 fin(stations(14,u=>[.025+.037*u,top(.025+.037*u)-.0003,0]),stations(14,(u,i)=>[.029+.048*u,top(.025+.037*u)+soft[i]!,.0004*Math.sin(i)]),'soft',.00022,1);
 const anal=[.001,.011,.018,.020,.020,.019,.0175,.016,.014,.011,.007,.001];
 fin(stations(12,u=>[.020+.035*u,shape(.020+.035*u).bottom+.0004,0]),stations(12,(u,i)=>[.024+.045*u,shape(.020+.035*u).bottom-anal[i]!*.86,0]),'red',.00023,2);
 fin(stations(19,u=>[.085+.002*Math.sin(u*Math.PI),-.004+.008*u,0]),stations(19,u=>[.120+.011*Math.abs(2*u-1)**1.4,.027*(2*u-1),.0006*Math.sin(u*7)]),'soft',.00025);
 for(const sign of [-1,1]){
  fin(stations(13,u=>[-.038+.003*u,-.010+.005*u,sign*.0195]),stations(13,u=>[-.027+.031*u,-.013-.017*Math.sin(u*Math.PI*.87),sign*(.020+.012*Math.sin(u*Math.PI))]),'soft',.00016);
  fin(stations(6,u=>[-.038+.006*u,-.027,sign*.007]),stations(6,u=>[-.031+.027*u,-.030-.014*Math.sin(u*Math.PI*.8),sign*(.008+.009*Math.sin(u*Math.PI))]),'red',.00022,1);
  const pts=stations(28,u=>{const x=-.032+.112*u,s=shape(x),y=s.c+.28*s.h;return [x,y,sign*(sideZ(x,y)+.00012)] as P;});gs.push(paint(tube(pts,Array(28).fill(.000055),1,5,27),p=>skin(p[0],p[1]).map(c=>c*.67) as P));
 }
 const far=coverSculpt(8,56);far.translate(-FISH_AT[0],-FISH_AT[1],-FISH_AT[2]);far.scale(1,1,-1.003);flip(far);gs.push(far);
 return join(gs,FISH_AT);
}
/** A thin curved opercle: its rim follows the same contour as the pocket,
 * preopercular relief sweeps around the cheek; the hinge is entirely hidden. */
export function coverSculpt(n=12,m=80){
 const front=GILL_HINGE[2]-FISH_AT[2];
 const point=(u:number,v:number):P=>{const edge=COVER.getPoint(v),x=.014+(edge.x-.014)*u,y=-.001+(edge.y+.001)*u,xx=x-.073;
  const pre=.003+.002*Math.exp(-(((y-.005)/.014)**2))-.35*Math.max(0,-y),groove=.00024*Math.exp(-(((x-pre)/.0012)**2));
  const ridge=.00035*Math.exp(-(((x-pre-.0025)/.0016)**2)),bone=.00065*Math.exp(-(((x-.019)/.011)**2)-(((y-.006)/.018)**2));
  return [x,y,sideZ(xx,y)-front+.00025+bone+ridge-groove];};
 const g=shell(surface(n,m,point),.00018);paint(g,p=>skin(p[0]-.073,p[1]));
 const pieces=[g];
 for(let row=0;row<9;row++)for(let col=0;col<7;col++){
  const x=.004+col*.0028+(row%2)*.0013,y=-.018+row*.0031;
  if(coverDistance(x-.073,y)<.002)continue;
  const scale=surface(1,3,(u,v)=>{const xx=x+(u-.5)*.0032-.0003*(2*v-1)**2,yy=y+(v-.5)*.0034;
   // Evaluate the bony surface at x/y directly, not polar angle inversion.
   const pre=.003+.002*Math.exp(-(((yy-.005)/.014)**2))-.35*Math.max(0,-yy);
   const z=sideZ(xx-.073,yy)-front+.00025+.00065*Math.exp(-(((xx-.019)/.011)**2)-(((yy-.006)/.018)**2))+.00035*Math.exp(-(((xx-pre-.0025)/.0016)**2))-.00024*Math.exp(-(((xx-pre)/.0012)**2));
   return [xx,yy,z+.000055*u*u*Math.cos((v-.5)*Math.PI)**2] as P;
  });paint(scale,(p,i)=>skin(p[0]-.073,p[1]).map(c=>c*(i>=4?.83:1)) as P);pieces.push(scale);
 }
 return join(pieces,GILL_HINGE);
}

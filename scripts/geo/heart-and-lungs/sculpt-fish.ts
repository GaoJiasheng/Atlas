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
function skin(x:number,y:number,lining=0):P{
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
 if(x<-.080&&y<.008){
  // Pale lips at the gape, a shaded border round the maxilla and a fainter lower-jaw line.
  const lip=Math.exp(-((Math.min(Math.abs(y-upperMargin(x)),Math.abs(y-lowerMargin(x)))/.0011)**2))*smooth((RICTUS[0]+.002-x)/.004);
  c.lerp(BONE.clone().lerp(FIN,.10).multiplyScalar(.50),.45*lip);
  const border=Math.exp(-((maxillaInside(x,y)/.00065)**2))*smooth((x-(UPPER_LIP[0]+.004))/.004);
  c.lerp(DARK.clone().multiplyScalar(.10),.30*border);
  c.lerp(DARK.clone().multiplyScalar(.12),.22*Math.exp(-((segment2(x,y,[-.1130,-.0118],JAW_JOINT)/.00080)**2)));
 }
 if(lining>0)c.lerp(OCHRE.clone().lerp(FIN,.35).lerp(DARK,.55).multiplyScalar(.10),lining);
 const orbital=Math.exp(-(((Math.hypot(x-PERCH_EYE[0]!,(y-PERCH_EYE[1]!)/.94)-.00495)/.00035)**2));
 c.lerp(OCHRE.clone().lerp(DARK,.50).multiplyScalar(.16),orbital*.85);
 c.multiplyScalar(1+.035*Math.sin(x*3100+y*1700)*Math.sin(x*1600-y*2700));return ratio(c);
}
const eyeX=PERCH_EYE[0]!,eyeY=PERCH_EYE[1]!,eyeR=.0049;
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
const smoothMin=(a:number,b:number,k:number)=>-smoothMax(-a,-b,k);
/** Buccal cavity behind the jaws, rounded at the pharynx. */
function pharynxField(x:number,y:number,z:number){
 // Narrower at the front, where the cheeks close the gape behind the lips.
 const t=smooth((x+.105)/.028),narrow=1-.42*smooth((-.0935-x)/.012),h=.0048+.015*t+.0005*smooth((x+.077)/.005),w=(.014+.004*t+.0007*smooth((x+.077)/.005))*narrow,cy=-.0010+.002*t;
 const radial=(Math.hypot((y-cy)/h,z/(z>=0?w:(.0075+.0065*t)*narrow))-1)*Math.min(w,h);
 return smoothMax(radial,x+.068,.0035);
}
/* Snout and jaws, from Pmau img_33558 (side) and Dellex Barsch3 (front):
 * a blunt rounded snout whose upper lip is the most anterior point, subequal
 * jaws, the lower jaw dropped about its joint so the mouth is open for the
 * teaching water inlet, the gape closing at a corner under the front of the
 * eye, a maxilla plate ending under the middle of the eye, and two nostrils
 * per side between the eye and the snout. Fish frame, metres. */
const NOSE_TIP=-.1247,WIDTH_FROM=-.096;
/** Mouth corner, upper-lip and lower-lip fronts (open-mouth pose), jaw joint and maxilla end. */
const RICTUS:[number,number]=[-.0957,-.0031],UPPER_LIP:[number,number]=[-.1240,.0040],LOWER_LIP:[number,number]=[-.1233,-.0042];
const JAW_JOINT:[number,number]=[-.0870,-.0078],MAXILLA_END:[number,number]=[-.0906,-.0041];
const upperMargin=(x:number)=>RICTUS[1]+(x-RICTUS[0])*(UPPER_LIP[1]-RICTUS[1])/(UPPER_LIP[0]-RICTUS[0]);
const lowerMargin=(x:number)=>RICTUS[1]+(x-RICTUS[0])*(LOWER_LIP[1]-RICTUS[1])/(LOWER_LIP[0]-RICTUS[0]);
/** Side-view front of the snout above the mouth and of the chin below it:
 * a blunt nose that rounds over within the last 3 mm, as in img_33558. */
function frontX(y:number){return y>=0?-.1244+Math.min(.0045,.0024*Math.max(0,(y-.0048)/.0055)**2.6):-.1236+Math.min(.0045,.0040*Math.max(0,(-.0050-y)/.0042)**2.4);}
/** Half-width: the traced head from the eye back; a blunt taper to the snout ahead of it. */
function headHalfWidth(x:number){
 const s=shape(x);if(x>=WIDTH_FROM)return s.z;
 const w0=shape(WIDTH_FROM).z,p=w0*Math.pow(clamp((x-NOSE_TIP)/(WIDTH_FROM-NOSE_TIP)),.42),b=smooth((WIDTH_FROM-x)/.007);
 return s.z*(1-b)+p*b;
}
function segment2(x:number,y:number,a:[number,number],b:[number,number]){
 const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
/** The maxilla plate above the gape: signed depth inside its outline (metres).
 * Its slender front runs under the snout; its expanded end lies under the eye. */
function maxillaInside(x:number,y:number){
 const along=clamp((x+.1130)/(MAXILLA_END[0]+.1130)),low=upperMargin(Math.min(x,RICTUS[0]))-.0004-.0007*smooth((x-RICTUS[0])/.004),top=upperMargin(x)+.0009+.0024*along**1.8;
 const mid=(top+low)/2,half=Math.max(.0004,(top-low)/2),end=MAXILLA_END[0]+.0002-x-.0014*((y-mid)/half)**2;
 // Soft minimum: a hard one creases the plate's relief and its shading.
 return smoothMin(smoothMin(top-y,y-low,.0007),smoothMin(end,x+.1140,.0012),.0007);
}
/** Closed lip line between the end of the open gape and the mouth corner. */
const lipLine=(x:number)=>(upperMargin(x)+lowerMargin(x))/2;
/** Lateral bone and skin relief, in metres outward. */
function headRelief(x:number,y:number){
 const relief=.0008*Math.exp(-(((x+.090)/.012)**2)-(((y+.005)/.012)**2));
 const socket=-.0005*Math.exp(-(((Math.hypot((x-eyeX)/.0055,(y-eyeY)/.0052)-.98)/.21)**2));
 if(x>-.080||y>.006)return relief+socket;
 const plate=.00017*smooth(maxillaInside(x,y)/.0015);
 const fold=.00013*Math.exp(-(((y-lipLine(x))/.00080)**2))*smooth((x+.1085)/.004)*smooth((RICTUS[0]+.0006-x)/.0016);
 // Lip groove behind the premaxilla, and the lower border of the lower jaw.
 const lipGroove=.00014*Math.exp(-(((y-(upperMargin(x)+.0022))/.00075)**2))*smooth((x-(UPPER_LIP[0]+.0008))/.002)*smooth((-.112-x)/.004);
 const jawLine=.00012*Math.exp(-((segment2(x,y,[-.1130,-.0118],JAW_JOINT)/.00075)**2));
 return relief+socket+plate-fold-lipGroove-jawLine;
}
/** Outer skin of the closed head volume, before the mouth is opened. */
function headOuter(x:number,y:number,z:number){
 const s=shape(x),zz=Math.max(headHalfWidth(x)+headRelief(x,y),1e-5);
 return smoothMax((Math.hypot((y-s.c)/s.h,z/zz)-1)*Math.min(s.h,zz),frontX(y)-x,.0008);
}
/** The open mouth: a midline passage between the lips into the buccal cavity,
 * plus the lateral gape between the lips. */
function mouthField(x:number,y:number,z:number){
 const front=smooth((-.1015-x)/.006),k=clamp((x-UPPER_LIP[0])/.02);
 const hO=.0041-.0004*k,wO=.0049-.0006*k,passage=(Math.hypot((y+.0002)/hO,z/wO)-1)*Math.min(hO,wO),pharynx=pharynxField(x,y,z);
 const lead=smoothMin(passage,pharynx,.0012)*front+pharynx*(1-front);
 // The lips part along the front of the gape; the opening narrows to a point
 // and the lips meet in a shallow fold back to the corner.
 const shut=smooth((x+.1150)/.0100),close=(upperMargin(x)-lowerMargin(x))/2*shut;
 return smoothMin(lead,Math.max(y-upperMargin(x)+close,lowerMargin(x)+close-y)+.0012*shut,.0007);
}
function cranialField(x:number,y:number,z:number){
 // Fleshy lips: a slight roll along the cut rim of the mouth.
 const mouth=mouthField(x,y,z),lip=.00030*Math.exp(-((mouth/.0008)**2))*smooth((-.1120-x)/.006);
 return smoothMax(headOuter(x,y,z),-mouth,.0008)-lip;
}
/** Near-side skin offset at (x, y), found on the head field itself. */
function headSurfaceZ(x:number,y:number){let a=0,b=.03;for(let k=0;k<40;k++){const m=(a+b)/2;if(cranialField(x,y,m)<0)a=m;else b=m;}return (a+b)/2;}
export let CRANIAL_STATS:{before:number;after:number;errorMetres:number;skin?:number;lining?:number}={before:0,after:0,errorMetres:0};
function cranialMesh(){
 const n=176,lo:P=[-.1262,-.033,-.027],hi:P=[-.0703,.039,.027],mc=new MarchingCubes(n,new MeshBasicMaterial(),false,false,700000);mc.isolation=0;
 for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++)mc.field[z*n*n+y*n+x]=-cranialField(lo[0]+(hi[0]-lo[0])*x/n,lo[1]+(hi[1]-lo[1])*y/n,lo[2]+(hi[2]-lo[2])*z/n);
 mc.update();const count=mc.geometry.drawRange.count,g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(mc.geometry.getAttribute('position').array.slice(0,count*3),3));
 const p=g.getAttribute('position'),normals:number[]=[];
 for(let i=0;i<p.count;i++){
  const x=lo[0]+(p.getX(i)+1)*.5*(hi[0]-lo[0]),y=lo[1]+(p.getY(i)+1)*.5*(hi[1]-lo[1]),z=lo[2]+(p.getZ(i)+1)*.5*(hi[2]-lo[2]),e=.000015;
  p.setXYZ(i,x,y,z);const N=new Vector3(cranialField(x+e,y,z)-cranialField(x-e,y,z),cranialField(x,y+e,z)-cranialField(x,y-e,z),cranialField(x,y,z+e)-cranialField(x,y,z-e)).normalize();normals.push(...N.toArray());
 }
 g.setAttribute('normal',new Float32BufferAttribute(normals,3));
 // Mouth lining and lips: dark where the surface lies inside the closed head, pale lip rims at the gape.
 paint(g,p=>{const depth=-headOuter(...p),lining=smooth((depth-.0002)/.0007);return skin(p[0],p[1],lining);});
 const result=mergeVertices(g,.000005),attributes:number[]=[];
 const rp=result.getAttribute('position'),rn=result.getAttribute('normal'),rc=result.getAttribute('color');
 for(let i=0;i<rp.count;i++)attributes.push(rn.getX(i),rn.getY(i),rn.getZ(i),rc.getX(i),rc.getY(i),rc.getZ(i));
 // Spend the triangle budget on the visible skin and lips: the buccal lining
 // deep inside the head is simplified separately and much harder. Both parts
 // lock their shared border, so the surface stays closed.
 const source=result.index!.array,skinIx:number[]=[],liningIx:number[]=[];
 for(let k=0;k<source.length;k+=3){
  const c=[0,1,2].map(j=>[0,1,2].map(a=>rp.getComponent(source[k+a]!,j)).reduce((s,v)=>s+v,0)/3) as P;
  (-headOuter(...c)>.0016&&c[0]>-.110?liningIx:skinIx).push(source[k]!,source[k+1]!,source[k+2]!);
 }
 const simplify=(ix:number[],target:number,error:number)=>MeshoptSimplifier.simplifyWithAttributes(new Uint32Array(ix),new Float32Array(rp.array),3,new Float32Array(attributes),6,[.001,.001,.001,.001,.001,.001],null,target,error,['LockBorder','ErrorAbsolute']);
 const [inner,innerError]=simplify(liningIx,Math.round(liningIx.length*.03/3)*3,.003),[outer,outerError]=simplify(skinIx,27600-inner.length,.00004);
 const indices=new Uint32Array([...outer,...inner]),error=Math.max(innerError,outerError);
 CRANIAL_STATS={before:result.index!.count/3,after:indices.length/3,errorMetres:error,skin:outer.length/3,lining:inner.length/3} as typeof CRANIAL_STATS;result.setIndex(Array.from(indices));mc.geometry.dispose();(mc.material as MeshBasicMaterial).dispose();g.dispose();return result;
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
export function fishMembraneSculpt(){return membranes.map(g=>{g.translate(...FISH_AT);return g;});}
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
  paint(eye,(_,i)=>{const u=Math.floor(i/41)/12,j=i%41;const c=u<.62?DARK.clone().multiplyScalar(.018):u>.92?DARK.clone().multiplyScalar(.10):OCHRE.clone().lerp(OLIVE,.48+.05*Math.sin(j*2.3)).multiplyScalar(.15+.025*Math.sin(j*3.4));return ratio(c);});gs.push(sign===1?eye:flip(eye));
  const z=sideZ(eyeX-.0011,eyeY+.0013)+.00117;gs.push(paint(orb([eyeX-.0011,eyeY+.0013,sign*z],[.00024,.00018,.00009],12,8),ratio(BONE.clone().multiplyScalar(.80))));
  // Anterior and posterior nostrils (Pmau img_33558): small dark openings in a pale raised rim.
  for(const [x,y,r] of [[-.1085,.0118,.00040],[-.1022,.0143,.00050]]){const z=headSurfaceZ(x!,y!);
   gs.push(paint(orb([x!,y!,sign*(z+.00002)],[r!*1.6,r!*1.2,.00016],18,10),p=>{const d=Math.hypot((p[0]-x!)/(r!*1.6),(p[1]-y!)/(r!*1.2));return d<.58?ratio(DARK.clone().multiplyScalar(.06)):skin(p[0],p[1]).map(c=>c*1.12) as P;}));}
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
  // Single thin, cambered surface. Runtime uses one DoubleSide transparent
  // draw per fin, so each fin sorts independently; the raised rays stay solid.
  const patch=surface(n*3,6,at);
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
 const g=shell(surface(n,m,point),.000065);paint(g,p=>skin(p[0]-.073,p[1]));
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

/** Shared muscle-series gym reconstruction. Metres; +Y up, bar/grip +X,
 * bench pad top at origin with head toward -Z; column feet at origin.
 * Independent catalogue study, not a branded replica. Every surface is relief.
 * All primitives intentionally share the engine's neutral equipment material,
 * allowing the existing animation path to merge one draw per attached piece.
 */
import type { Primitive } from '../../../src/engines/space-scene/schema';
export interface GymShape { primitive: Primitive; extra?: Primitive[] }
type V = [number,number,number]; type P = [number,number];
const color = 'token:neutral';
const box=(size:V,at:V,bevel=.003,rotation?:V):Primitive=>({kind:'bevelBox',size,at,bevel:Math.min(bevel,Math.min(...size)*.24),color,...(rotation?{rotation}:{})});
const ring=(profile:P[],at:V,axis:'x'|'y'|'z'='x',segments=40):Primitive=>({kind:'lathe',profile,at,segments,color,...(axis==='x'?{rotation:[0,0,90] as V}:axis==='z'?{rotation:[90,0,0] as V}:{})});
const disc=(radius:number,length:number,at:V,axis:'x'|'y'|'z'='x',bore=0,bevel=.002):Primitive=>{
 const b=Math.min(bevel,length*.24,radius*.2),h=length/2;
 return ring([[bore,-h],[radius-b,-h],[radius,-h+b],[radius,h-b],[radius-b,h],[bore,h],...(bore>0?[[bore,-h] as P]:[])],at,axis);
};
const rod=(radius:number,length:number,at:V,axis:'x'|'y'|'z'='y')=>disc(radius,length,at,axis,0,Math.min(.001,radius*.1));
const extrude=(shape:P[],depth:number,at:V,rotation?:V,holes?:P[][],bevel=.001):Primitive=>({kind:'extrude',shape,depth,at,color,bevel,...(holes?{holes}:{}),...(rotation?{rotation}:{})});
const circle=(x:number,y:number,r:number,n=32):P[]=>Array.from({length:n},(_,k)=>[x+r*Math.cos(-2*Math.PI*k/n),y+r*Math.sin(-2*Math.PI*k/n)]);
const assembly=(p:Primitive[]):GymShape=>({primitive:p[0]!,extra:p.slice(1)});
const beam=(a:V,b:V,width:number,depth=width):Primitive=>{
 const d=b.map((v,i)=>v-a[i]!) as V,len=Math.hypot(...d),mid=a.map((v,i)=>(v+b[i]!)/2) as V;
 // All frame braces lie in YZ. Rotation about X points local +Y along b-a.
 return box([width,len,depth],mid,.002,[Math.atan2(d[2],d[1])*180/Math.PI,0,0]);
};
const bolt=(at:V,axis:'x'|'y'|'z'='x')=>disc(.008,.006,at,axis,0,.0005);
/** Raised 300 mm rim, dished web and 50.4 mm through-bore; existing plate count and dimensions retained. */
export function gymBarbellShape():GymShape {
 const p:Primitive[]=[rod(.014,1.37,[0,0,0],'x')];
 for(const s of [-1,1]){
  p.push(disc(.025,.415,[s*.8925,0,0],'x'),disc(.037,.027,[s*.692,0,0],'x',.0145));
  const x=s*.7375,h=.0125;
  p.push(ring([[.0252,-h],[.046,-h],[.049,-.008],[.125,-.008],[.132,-h],[.146,-h],[.15,-.0085],[.15,.0085],[.146,h],[.132,h],[.125,.008],[.049,.008],[.046,h],[.0252,h],[.0252,-h]],[x,0,0]));
  // Lock collar beyond the plate: open through-bore, raised lever and pivot.
  p.push(disc(.037,.033,[s*.768,0,0],'x',.0251),box([.022,.009,.05],[s*.768,.037,.01],.003,[18,0,0]),bolt([s*.788,.031,-.014]));
  p.push(disc(.0225,.003,[s*1.098,0,0],'x'),disc(.009,.004,[s*1.097,0,0],'x'));
  // Machined sleeve scoring and two grip-index grooves are actual relief.
  for(let k=0;k<12;k++)p.push(disc(.02514,.00055,[s*(.862+k*.019),0,0],'x',.0249,.00008));
  for(const mark of [.405,.455])p.push(disc(.01415,.002,[s*mark,0,0],'x',.0139,.00015));
 }
 return assembly(p);
}
/** 330 mm fixed round dumbbell; original 140 mm head and 130 mm hand clearance retained. */
export function gymDumbbellShape():GymShape {
 const p:Primitive[]=[ring([[0,-.075],[.014,-.075],[.017,-.05],[.017,0],[.017,.05],[.014,.075],[0,.075]],[0,0,0])];
 for(const s of [-1,1]){
  p.push(ring([[0,-.042],[.045,-.042],[.045,-.045],[.053,-.045],[.064,-.039],[.07,-.027],[.07,.027],[.064,.039],[.053,.045],[.045,.045],[.045,.042],[0,.042]],[s*.12,0,0]));
  p.push(disc(.045,.0015,[s*.164,0,0],'x',0,.0003),disc(.010,.002,[s*.164,0,0],'x'));
  p.push(disc(.023,.008,[s*.070,0,0],'x'));
 }
 // Fine, bounded machining score: avoids a featureless chrome handle close-up.
 for(let k=0;k<20;k++)p.push(disc(.01718,.00065,[-.048+k*.005,0,0],'x',.0169,.0001));
 return assembly(p);
}
/** Upholstered seat/back with rolled piping, plywood base and connected steel spine. */
export function gymBenchShape(incline=0):GymShape {
 const a=incline*Math.PI/180,hinge=.18,seat=.42,back=.768,gap=.012,p:Primitive[]=[];
 const pad=(length:number,center:V,angle:number)=>{
  p.push(box([.3,.06,length],center,.014,[angle,0,0]));
  // Sewn piping is a rounded, narrow annular extrusion around the cushion.
  const outline=(w:number,l:number,r:number):P[]=>{
   const cs:P[]=[[-w/2+r,-l/2+r],[w/2-r,-l/2+r],[w/2-r,l/2-r],[-w/2+r,l/2-r]];
   return cs.flatMap((c,k)=>Array.from({length:7},(_,j)=>{const t=[Math.PI,1.5*Math.PI,0,.5*Math.PI][k]!+j/6*Math.PI/2;return [c[0]+r*Math.cos(t),c[1]+r*Math.sin(t)] as P;}));
  };
  const theta=angle*Math.PI/180;
  p.push(extrude(outline(.299,length-.001,.016),.0025,[0,center[1]-.017*Math.cos(theta),center[2]-.017*Math.sin(theta)],[90+angle,0,0],[outline(.293,length-.007,.013).reverse()],.0006));
  p.push(box([.272,.012,length-.025],[center[0],center[1]-.037*Math.cos(angle*Math.PI/180),center[2]-.037*Math.sin(angle*Math.PI/180)],.004,[angle,0,0]));
 };
 pad(seat,[0,-.03,hinge+seat/2],0);
 pad(back,[0,-.03+Math.sin(a)*(back/2+gap),hinge-Math.cos(a)*(back/2+gap)],incline);
 // Two-foot stance; all rubber shoes meet y=-.45 floor.
 for(const z of [-.43,.45]){
  p.push(box([.57,.055,.075],[0,-.4175,z],.006));
  for(const x of [-.255,.255])p.push(box([.085,.018,.10],[x,-.441,z],.004));
 }
 p.push(beam([0,-.39,-.43],[0,-.13,-.25],.06),beam([0,-.39,.45],[0,-.095,.37],.06),box([.065,.065,.90],[0,-.36,.01],.003));
 // Twin upper rails connect the legs without crossing the central prop's
 // swept volume. Cross-ties sit at the leg and hinge mounting stations.
 for(const x of [-.07,.07])p.push(box([.035,.045,.88],[x,-.12,.005],.003));
 for(const z of [-.25,.18,.37])p.push(box([.175,.045,.055],[0,-.12,z],.003));
 p.push(box([.245,.018,.10],[0,-.082,.37],.002));
 const backAttach:V=[0,-.09+Math.sin(a)*.40,hinge-Math.cos(a)*.40];
 p.push(beam([0,-.12,hinge],backAttach,.05),disc(.022,.34,[0,-.085,hinge],'x'),bolt([.175,-.085,hinge]),bolt([-.175,-.085,hinge]));
 for(const distance of [.16,.61]){const y=-.082+Math.sin(a)*distance,z=hinge-Math.cos(a)*distance;p.push(box([.245,.012,.045],[0,y,z],.002,[incline,0,0]));}
 // Adjustable support lands in the ladder; it remains connected when flat.
 const lower:V=[0,-.277,-.276],middle=lower.map((v,i)=>v+(backAttach[i]!-v)*.62) as V;
 // A cross-pin bears on both ladder notches; the telescoping prop is captured
 // between that pin and the back-pad mounting spindle, never hung in the gap.
 p.push(beam(lower,middle,.045),beam(middle,backAttach,.032),rod(.008,.125,lower,'x'),rod(.008,.085,backAttach,'x'));
 for(const x of [-.064,.064])p.push(bolt([x,lower[1],lower[2]]));
 const lock=lower.map((v,i)=>v+(middle[i]!-v)*.78) as V;
 p.push(rod(.005,.066,lock,'x'),disc(.012,.009,[.036,lock[1],lock[2]],'x'));
 for(const x of [-.046,.046]){
  p.push(box([.008,.035,.53],[x,-.306,-.19],.0015));
  for(let k=0;k<7;k++)p.push(extrude([[0,0],[.012,0],[.012,.018],[.025,.026],[.03,.026],[.03,-.013],[0,-.013]],.008,[x,-.285,-.40+k*.065],[0,90,0]));
 }
 for(const x of [-.285,.285])p.push(disc(.032,.022,[x,-.405,-.43],'x',.006));
 p.push(box([.22,.03,.055],[0,-.36,.45],.003));
 p.push({kind:'tube',path:[[-.08,-.36,.45],[-.08,-.36,.61],[.08,-.36,.61],[.08,-.36,.45]],radius:.009,bendRadius:.025,at:[0,0,0],color});
 return assembly(p);
}
/** J-cups carry the existing bar axis exactly: x=+/-.6, y=hook, z=0. */
export function gymRackShape(hook:number):GymShape {
 const top=Math.max(.65,hook+.30),p:Primitive[]=[];
 for(const x of [-.6,.6]){
  const n=Math.min(16,Math.max(4,Math.floor((top-.20)/.075))),holes=Array.from({length:n},(_,k)=>circle(0,.14+k*(top-.27)/(n-1),.009,24));
  p.push(extrude([[-.03,0],[.03,0],[.03,top],[-.03,top]],.06,[x,0,-.075],undefined,holes,.0015));
  p.push(box([.10,.045,.68],[x,.0275,-.075],.006));
  for(const z of [-.375,.225])p.push(box([.12,.016,.10],[x,.008,z],.003));
  // Bent steel J-cup with rounded concave cradle and upturned retaining lip.
  const y=hook-.014;
  p.push(extrude([[-.065,-.045],[.040,-.045],[.052,-.032],[.052,.035],[.038,.035],[.038,-.006],[-.065,-.006]],.062,[x,y,0],[0,-90,0],undefined,.0015));
  p.push(box([.058,.006,.055],[x,hook-.017,-.002],.001),rod(.010,.080,[x,hook-.055,-.075],'x'),bolt([x+.045,hook-.055,-.075]));
  p.push(beam([x,.06,-.30],[x,.38,-.075],.035));
 }
 p.push(box([1.2,.045,.045],[0,.055,-.31],.003));
 return assembly(p);
}
/** Sheave about X with deep V groove, bearing hub and two-sided safety cheeks. */
export function gymPulleyShape():GymShape {
 const p:Primitive[]=[ring([[.006,-.017],[.029,-.017],[.041,-.014],[.041,-.010],[.034,0],[.041,.010],[.041,.014],[.029,.017],[.006,.017],[.006,-.017]],[0,0,0])];
 for(const x of [-.025,.025]){
  p.push(extrude([[-.038,-.036],[.028,-.036],[.045,-.015],[.045,.020],[.028,.041],[-.024,.041],[-.038,.024]],.006,[x,0,0],[0,90,0],[circle(0,0,.007,24)],.001));
 }
 p.push(rod(.006,.064,[0,0,0],'x'),bolt([.034,0,0]),bolt([-.034,0,0]));
 return assembly(p);
}
// The runtime output wheel is a separate attached piece. Keep its carriage in
// this shared factory as well so the stage cannot draw an unsupported sheave.
export function gymOutputPulleyShape():GymShape {
 const wheel=gymPulleyShape();
 return assembly([box([.085,.15,.10],[0,0,-.080],.005),box([.105,.16,.012],[0,0,-.131],.002),... [wheel.primitive,...wheel.extra??[]]]);
}
/** Adjustable single cable tower: 16 discrete weights, two through guide rods,
 * selector stem/pin, guarded top/bottom sheaves, pulley carriage and full cable path.
 * `pulley=0` omits only the movable sheave, which runtime attaches at authored anchor.
 */
export function gymColumnShape(pulley=0):GymShape {
 const p:Primitive[]=[box([.50,.055,.68],[0,.0275,-.20],.006)];
 for(const x of [-.20,.20]){
  p.push(box([.055,2.17,.055],[x,1.1125,-.28],.003));
  p.push(box([.075,.018,.11],[x,.009,.09],.003));
  p.push(rod(.008,1.96,[x*.55,1.10,-.27]));
 }
 p.push(box([.455,.060,.11],[0,2.17,-.26],.005),box([.06,2.12,.06],[0,1.10,-.03],.003));
 for(let k=0;k<16;k++){
  const y=.12+k*.034;
  // Guide-rod holes run vertically through every plate.
  p.push(extrude([[-.17,-.07],[.17,-.07],[.18,-.056],[.18,.056],[.17,.07],[-.17,.07],[-.18,.056],[-.18,-.056]],.029,[0,y,-.27],[90,0,0],[circle(-.11,0,.0084,20),circle(.11,0,.0084,20),circle(0,0,.010,20)],.001));
 }
 p.push(rod(.008,.68,[0,.43,-.27]),rod(.005,.18,[0,.351,-.175],'z'),disc(.014,.018,[0,.351,-.080],'z'));
 for(const y of [.073,.66])for(const x of [-.11,.11])p.push(disc(.016,.018,[x,y,-.27],'y',.0084));
 const add=(shape:GymShape,at:V)=>{for(const pp of [shape.primitive,...shape.extra??[]])p.push({...pp,at:pp.at.map((v,i)=>v+at[i]!) as V});};
 add(gymPulleyShape(),[0,2.11,-.27]);add(gymPulleyShape(),[0,2.11,-.045]);add(gymPulleyShape(),[0,.095,-.045]);
 p.push(box([.06,.06,.25],[0,2.17,-.15],.003));
 // Two cable runs connect the stack up and back down, with a return sheave.

 p.push({kind:'tube',path:[[0,.67,-.304],[0,2.11,-.304],[0,2.144,-.27],[0,2.144,-.045],[0,2.11,-.011],[0,.095,-.011],[0,.061,-.045],[0,.095,-.079],[0,2.16,-.079]],radius:.0028,bendRadius:.03,at:[0,0,0],color});
 // Actual through-hole ladder on the face; no dark discs pretending to be holes.
 p.push(extrude([[-.028,.15],[.028,.15],[.028,2.08],[-.028,2.08]],.005,[0,0,.003],undefined,Array.from({length:16},(_,k)=>circle(0,.21+k*.12,.006,24)),.0005));
 if(pulley>0){
  const y=Math.min(2.10,Math.max(.10,pulley));
  add(gymOutputPulleyShape(),[0,y,.10]);
 }
 // Output sheave centre is z=0, the same anchor used by Equipment.tsx.
 return assembly(p.map(pp=>({...pp,at:[pp.at[0],pp.at[1],pp.at[2]-.1] as V})));
}

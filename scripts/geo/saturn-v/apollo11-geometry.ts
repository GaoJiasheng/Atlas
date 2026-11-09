/** AS-506 / CSM-107 Columbia / LM-5 Eagle. Build-time reconstruction from
 * NASA Saturn V News Reference, Apollo 11 Press Kit and mission photographs.
 * Named components are kept together under the original 33 selection IDs. */
import {BufferGeometry,Float32BufferAttribute,Vector2,Vector3,Quaternion,Shape,Path,ShapeGeometry,CatmullRomCurve3,TorusGeometry,Matrix4,Color,ExtrudeGeometry} from 'three';
import {sourceIO} from './source';
import {toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {dequantize} from '@gltf-transform/functions';
import {Hardware as BaseHardware,palette as P,surface,type V} from './museum-geometry';
const T=Math.PI*2;
class Hardware extends BaseHardware {
 override ring(at:V,r:number,t:number,c=P.silver){return this.add(new TorusGeometry(r,t,t>.018?10:6,r>1?64:r>.4?40:24).rotateX(Math.PI/2).translate(...at),c);}
}
type XY=[number,number];
function facet(h:Hardware,points:V[],color=P.silver){
 const p=points.flat(),ix:number[]=[];for(let i=1;i<points.length-1;i++)ix.push(0,i,i+1);
 const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(p,3)).setIndex(ix);g.computeVertexNormals();return h.add(g,color);
}
function pipe(h:Hardware,points:V[],r:number,c=P.silver,segments=12){return h.pipe(points,r,c,segments);}
function body(h:Hardware,at:V,r:number,length:number,color=P.silver,axis:V=[0,1,0]){
 const head=Math.min(r,length*.23),profile:number[][]=[[0,-length/2]];for(let i=0;i<=8;i++){const a=-Math.PI/2+i*Math.PI/16;profile.push([r*Math.cos(a),-length/2+head+head*Math.sin(a)]);}
 profile.push([r,length/2-head]);for(let i=1;i<=8;i++){const a=i*Math.PI/16;profile.push([r*Math.cos(a),length/2-head+head*Math.sin(a)]);}profile.push([0,length/2]);
 const g=h.lathe([0,0,0],profile,color,24);g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),new Vector3(...axis).normalize())).translate(...at);return g;
}
function flange(h:Hardware,at:V,r:number,axis:V=[0,1,0],count=12){
 const q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),new Vector3(...axis).normalize());
 const ring=h.lathe([0,0,0],[[r*.76,-.025],[r,-.025],[r,.025],[r*.76,.025],[r*.76,-.025]],P.grey,32);ring.applyQuaternion(q).translate(...at);
 for(let i=0;i<count;i++){const a=T*i/count,p=new Vector3(Math.cos(a)*r*.9,.03,Math.sin(a)*r*.9).applyQuaternion(q).add(new Vector3(...at));
  h.lathe([0,0,0],[[0,0],[r*.045,0],[r*.045,.027],[0,.027]],P.silver,6).applyQuaternion(q).translate(p.x,p.y,p.z);
 }
}
/** Machined upper pump interface: central aperture and lightening/bolt
 * holes are through-holes, not dark discs painted on a mounting plate. */
function pumpInterface(h:Hardware){
 const shape=new Shape();shape.absellipse(0,0,.56,.44,0,T,false,0);
 const centre=new Path();centre.absellipse(0,0,.29,.23,0,T,true,0);shape.holes.push(centre);
 for(let k=0;k<12;k++){const a=T*k/12,p=new Path();p.absarc(.435*Math.cos(a),.34*Math.sin(a),.037,0,T,true);shape.holes.push(p);}
 const g=new ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false,curveSegments:12,steps:1});
 h.add(g.rotateX(-Math.PI/2).translate(.77,4.87,.05),P.grey);
 // The existing annular housing flange carries the plate's inner rim.
}
function dish(h:Hardware,at:V,r:number,normal:V,depth=.26,color=P.silver){
 const q=new Quaternion().setFromUnitVectors(new Vector3(0,0,1),new Vector3(...normal).normalize());
 const g=surface(8,48,(u,v)=>{const a=T*v,rr=r*u;return [rr*Math.cos(a),rr*Math.sin(a),depth*u*u];});g.applyQuaternion(q).translate(...at);h.add(g,color);
 const rim=Array.from({length:49},(_,i)=>new Vector3(r*Math.cos(T*i/48),r*Math.sin(T*i/48),depth).applyQuaternion(q).add(new Vector3(...at)).toArray() as V);pipe(h,rim,.009,color,48);
 const f=new Vector3(0,0,r*r/(4*depth)).applyQuaternion(q).add(new Vector3(...at));
 for(let i=0;i<3;i++){const a=T*i/3,p=new Vector3(r*.92*Math.cos(a),r*.92*Math.sin(a),depth).applyQuaternion(q).add(new Vector3(...at));h.rod(p.toArray() as V,f.toArray() as V,.009,P.grey);}
 body(h,f.toArray() as V,.027,.08,P.grey,normal);
}
/** Smooth nozzle with integrated ring/tube relief. The F-1 exit envelope is
 * intentionally unchanged, preserving the independently tested five-mouth fit. */
function nozzle(h:Hardware,profile:XY[],color=P.grey,radial=96,rows=26,ribs=0){
 const curve=new CatmullRomCurve3(profile.map(([r,y])=>new Vector3(r,y,0)),false,'centripetal');
 const pts=curve.getPoints(rows);const g=h.lathe([0,0,0],pts.map(v=>[v.x,v.y]),color,radial);
 // Real open inner wall, throat and rolled exit lip; no black painted cap.
 h.lathe([0,0,0],pts.map(v=>[Math.max(.018,v.x-.018),v.y]).reverse(),P.dark,radial);
 const low=pts[0]!,hi=pts.at(-1)!;h.lathe([0,0,0],[[low.x,low.y],[low.x-.018,low.y],[low.x,low.y]],color,radial);h.lathe([0,0,0],[[hi.x,hi.y],[hi.x-.018,hi.y]],color,radial);
 if(ribs){
  const c=curve.getPoints(32),radial=ribs===178?712:ribs*4;
  const ribbed=surface(32,radial,(u,v)=>{const k=Math.min(31,Math.floor(u*32)),t=u*32-k,a=T*v,p=c[k]!.clone().lerp(c[k+1]!,t);const count=ribs===178?(p.y<1.2?0:p.y<2.65?356:178):ribs,rr=p.x+(count?.006*Math.cos(T*count*v):0);return [rr*Math.sin(a),p.y,rr*Math.cos(a)];});
  // Replace outer bell by a single continuous corrugated surface.
  const index=h.pieces.indexOf(g);h.pieces.splice(index,1);g.dispose();h.add(ribbed,color);
 }
 return {g,curve};
}
function radiusAt(curve:CatmullRomCurve3,y:number){let lo=0,hi=1;for(let i=0;i<18;i++){const t=(lo+hi)/2;if(curve.getPoint(t).y<y)lo=t;else hi=t;}return curve.getPoint((lo+hi)/2).x;}
export function f1(at:V,outer=false){const h=new Hardware();
 const {curve}=nozzle(h,[[1.839,0],[1.65,.55],[1.42,1.18],[1.10,1.94],[.74,2.67],[.48,3.18],[.47,3.46],[.55,3.72]],P.glass,96,28,178);
 for(const [,y] of [[1.82,.10],[1.68,.48],[1.54,.87],[1.41,1.2],[1.29,1.5],[1.15,1.82],[1.0,2.13],[.85,2.43],[.70,2.71],[.59,2.94]] as XY[])h.ring([0,y,0],radiusAt(curve,y)+.007,.012,P.silver);
 // Turbine exhaust collector around the nozzle extension, with its hatbands.
 h.ring([0,1.20,0],1.455,.105,P.grey);
 for(let i=0;i<18;i++){const a=T*i/18;pipe(h,[[1.38*Math.sin(a),1.11,1.38*Math.cos(a)],[1.56*Math.sin(a),1.2,1.56*Math.cos(a)],[1.4*Math.sin(a),1.30,1.4*Math.cos(a)]],.012,P.silver,4);}
 // Combustion chamber, LOX dome, injector flange and gimbal bearing.
 body(h,[0,3.99,0],.56,1.14,P.silver);flange(h,[0,4.32,0],.62,[0,1,0],18);
 body(h,[0,4.64,0],.43,.5,P.grey);h.lathe([0,4.94,0],[[0,0],[.26,0],[.26,.20],[.19,.26],[0,.26]],P.silver,48);
 // Common-shaft fuel/LOX turbopump, volute castings and turbine (aft).
 body(h,[.77,4.38,.05],.40,1.12,P.grey);
 for(const yy of [3.85,4.32,4.90])flange(h,[.77,yy,.05],yy===4.32?.46:.34,[0,1,0],16);
 const volute=surface(8,64,(u,v)=>{const a=T*v,rad=.28+.075*v;return [.77+(rad+.07*Math.cos(T*u))*Math.cos(a),4.44+.11*Math.sin(T*u),.05+(rad+.07*Math.cos(T*u))*Math.sin(a)];});h.add(volute,P.silver);
 body(h,[.77,3.83,.05],.34,.40,P.grey);flange(h,[.77,3.68,.05],.37,[0,1,0],12);
 pumpInterface(h);
 // Open oval engine-interface rail carried by the pump housing.
 const panel=Array.from({length:49},(_,i)=>{const a=T*i/48;return [.80+.65*Math.cos(a),5.02,.08+.48*Math.sin(a)] as V;});pipe(h,panel,.022,P.grey,48);
 for(const z of [-.35,.42])h.rod([.35,4.92,z],[1.24,4.92,z],.018,P.grey);
 // Paired rigid high-pressure ducts wrap from pump to injector; each has
 // flanges at the pump outlet, elbow and chamber valve, as the F-1 photos.
 for(const z of [-.31,.35]){
  pipe(h,[[.93,4.4,z],[1.12,4.72,z],[.63,5.0,z],[0,5.0,z],[-.73,4.94,z],[-.92,4.63,z],[-.72,4.1,z],[-.42,3.96,z]],z<0?.155:.125,P.silver,22);
  for(const x of [-.54,.3])flange(h,[x,4.98,z],z<0?.19:.16,[1,0,0],8);
  body(h,[-.78,4.20,z],.19,.37,P.grey);flange(h,[-.78,4.37,z],.23);body(h,[-.78,4.42,z],.17,.12,P.dark);for(const x of [-.89,-.67])h.rod([x,4.48,z-.09],[x,4.48,z+.09],.009,P.silver);
 }
 // Gas generator at the opposite side, turbine inlet, heat exchanger and
 // exhaust duct enter the collector tangentially, rather than a token ring.
 body(h,[-.83,3.74,.67],.20,.70,P.grey);flange(h,[-.83,3.98,.67],.23);
 pipe(h,[[-.83,3.66,.67],[-1.08,3.94,.65],[-.72,4.40,-.45],[.77,4.38,-.73]],.09,P.grey,20);
 body(h,[1.15,2.75,-.46],.23,1.05,P.grey);for(let j=0;j<8;j++)h.ring([1.15,2.28+j*.05,-.46],.235,.009,P.silver);flange(h,[1.15,3.15,-.46],.26);
 pipe(h,[[.77,4.38,-.85],[1.29,4.06,-.66],[1.31,3.44,-.47],[1.15,2.75,-.46],[1.08,1.68,-.57],[1.18,1.2,-.86]],.18,P.grey,22);
 // GOX lines, valve actuators and harness have connected endpoints.
 for(const z of [-.48,.48]){
  pipe(h,[[-.73,4.1,z],[-1.10,3.63,z],[-.90,3.25,z],[.30,3.0,z],[1.15,2.75,-.46]],.026,P.silver,18);
  body(h,[-.86,4.24,z],.09,.22,P.dark,[1,0,0]);
 }
 for(let k=0;k<3;k++){const a=k*T/3;pipe(h,[[.23*Math.sin(a),4.95,.23*Math.cos(a)],[.64*Math.sin(a),4.65,.64*Math.cos(a)],[.62*Math.sin(a),3.7,.62*Math.cos(a)]],.028,P.silver,8);}
 if(outer)for(const a of [Math.PI/2,Math.PI]){
  const p:V=[1.0*Math.sin(a),3.2,1.0*Math.cos(a)],q:V=[.66*Math.sin(a),5.2,.66*Math.cos(a)];
  body(h,[(p[0]+q[0])/2,4.2,(p[2]+q[2])/2],.095,1.4,P.grey,new Vector3(...q).sub(new Vector3(...p)).toArray() as V);h.rod(p,q,.042,P.silver);
  h.sphere(p,[.11,.11,.11],P.grey);h.sphere(q,[.11,.11,.11],P.grey);
 }
 const g=h.merge();return g.scale(1,1.11,1).translate(...at);
}
export function j2(at:V,steer=true){const h=new Hardware();
 const {curve}=nozzle(h,[[1,0],[.88,.42],[.70,.85],[.53,1.25],[.33,1.62],[.21,1.90],[.23,2.08]],P.glass,80,24,48);
 for(let i=0;i<13;i++){const y=.05+i*.123;h.ring([0,y,0],radiusAt(curve,y)+.006,.009,P.silver);}
 h.ring([0,1.06,0],.65,.056,P.grey);body(h,[0,2.24,0],.26,.48,P.silver);flange(h,[0,2.44,0],.29);
 // Two independent turbopumps on opposite sides, not F-1 castings reused.
 body(h,[-.48,2.29,0],.19,.67,P.grey,[0,0,1]);body(h,[.46,2.32,0],.22,.58,P.grey,[0,0,1]);
 for(const x of [-.48,.46])for(const z of [-.30,.3])flange(h,[x,2.3,z],.23,[0,0,1],10);
 // Tall inlet ducts with bellows and triangular restraint links (NASA R-16).
 for(const x of [-.48,.46]){
  body(h,[x,2.74,0],.13,.44,P.silver);
  for(const y of [2.59,2.65,2.81,2.87])h.ring([x,y,0],.142,.018,P.grey);
  for(const z of [-.16,.16]){h.rod([x-.17,2.57,z],[x+.17,2.88,z],.014);h.rod([x+.17,2.57,z],[x-.17,2.88,z],.014);}
 }
 // Hydrogen start tank, unequal transfer ducts, gas generator and exhaust.
 body(h,[-.19,2.72,.42],.044,.10,P.grey);
 pipe(h,[[-.48,2.18,.28],[-.57,2.02,.44],[-.20,1.88,.48],[.49,2.19,.30]],.115,P.silver,16);
 pipe(h,[[.46,2.32,-.25],[.65,2.04,-.22],[.66,1.60,-.20],[.42,1.06,-.48]],.10,P.grey,16);
 body(h,[.35,1.87,.35],.13,.48,P.grey);flange(h,[.35,2.02,.35],.15);
 pipe(h,[[.35,1.87,.35],[.28,2.12,-.32],[-.48,2.29,-.25]],.044,P.silver,12);
 pipe(h,[[-.19,2.4,.42],[-.65,2.35,.40],[-.61,1.75,.32],[-.28,1.91,.17]],.022,P.silver,12);
 for(const z of [-.31,.31])pipe(h,[[-.48,2.3,z],[-.63,2.13,z],[-.37,1.85,z],[.15,1.91,z]],.028,P.silver,12);
 if(steer)for(const a of [0,Math.PI/2]){const p:V=[.45*Math.sin(a),1.4,.45*Math.cos(a)],q:V=[.19*Math.sin(a),2.93,.19*Math.cos(a)];h.rod(p,q,.035);body(h,[(p[0]+q[0])/2,2.2,(p[2]+q[2])/2],.065,.8,P.grey,new Vector3(...q).sub(new Vector3(...p)).toArray() as V);}
 h.lathe([0,0,0],[[.19,2.45],[.17,2.69],[.11,2.91],[.07,2.91],[.13,2.69],[.15,2.45]],P.grey,48);
 h.lathe([0,2.91,0],[[0,0],[.12,0],[.15,.06],[.12,.10],[0,.10]],P.silver,40);
 return h.merge().scale(1,1.125,1).translate(...at);
}
export function spacecraftEngine(kind:'sps'|'descent'|'ascent'){
 const h=new Hardware();const cfg={sps:{r:1.25,y:91,len:4.06},descent:{r:.72,y:86.15,len:1.5},ascent:{r:.43,y:88.6,len:.8}}[kind];const {r,y,len}=cfg;
 const {curve}=nozzle(h,[[r,y],[r*.86,y+len*.17],[r*.64,y+len*.38],[r*.37,y+len*.60],[r*(kind==='sps'?1/Math.sqrt(62.5):.16),y+len*.76],[r*.18,y+len*.83]],P.glass,96,26);
 for(let i=0;i<(kind==='sps'?3:2);i++){const t=.17+i*.23;h.ring([0,y+len*t,0],radiusAt(curve,y+len*t)+.006,.012,P.silver);}
 body(h,[0,y+len*.90,0],r*(kind==='sps'?.24:.22),len*.20,P.grey);flange(h,[0,y+len*.84,0],r*.25,[0,1,0],12);
 for(let k=0;k<2;k++){const a=k*Math.PI;pipe(h,[[r*.18*Math.cos(a),y+len,0],[r*.31*Math.cos(a),y+len*.88,.05],[r*.29*Math.cos(a),y+len*.72,0]],r*.027,P.silver,12);}
 if(kind==='sps'){
  // Ablative extension has discrete hatband reinforcement and seam battens.
  for(let k=0;k<12;k++){const a=T*k/12;pipe(h,[.01,.1,.2,.32,.45,.6].map(t=>{const yy=y+len*t,rr=radiusAt(curve,yy)+.006;return [rr*Math.sin(a),yy,rr*Math.cos(a)] as V;}),.008,P.silver,8);}
  for(const s of [-1,1]){h.rod([s*.45,y+len*.7,0],[s*.38,y+len*.96,0],.045);body(h,[s*.43,y+len*.86,0],.073,.5,P.grey);}
 } else if(kind==='ascent'){
  // APS protective cover is an irregular faceted cone over the chamber.
  for(let k=0;k<8;k++){const a=T*k/8,b=T*(k+1)/8;facet(h,[[.24*Math.sin(a),89.37,.24*Math.cos(a)],[.24*Math.sin(b),89.37,.24*Math.cos(b)],[.50*Math.sin(b),89.65,.50*Math.cos(b)],[.50*Math.sin(a),89.65,.50*Math.cos(a)]],P.dark);}
 }
 return h.merge();
}
export function rcsQuad(h:Hardware,at:V,angle:number,scale=1){const q=new Hardware();
 body(q,[0,0,0],.09*scale,.18*scale,P.grey,[0,0,1]);
 // Four chambers/nozzles; both opposed vertical and tangential pairs are open.
 for(const d of [[0,1,0],[0,-1,0],[1,0,0],[-1,0,0]] as V[]){
  const g=new Hardware();nozzle(g,[[.085*scale,0],[.060*scale,.085*scale],[.026*scale,.18*scale],[.029*scale,.23*scale]],P.grey,32,10);
  body(g,[0,.255*scale,0],.035*scale,.08*scale,P.silver);
  q.pieces.push(g.merge().applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,-1,0),new Vector3(...d))).translate(d[0]*.35*scale,d[1]*.35*scale,.045));
 }
 q.plate([0,0,-.09],[[-.16,-.15],[.16,-.15],[.16,.15],[-.16,.15]],.08,P.silver);
 for(const s of [-1,1])pipe(q,[[s*.13,-.12,-.04],[s*.13,.12,-.04],[0,.15,.02]],.012*scale,P.grey,8);
 h.pieces.push(q.merge().rotateY(angle).translate(...at));
}
function curvedPanel(h:Hardware,r:number,y0:number,y1:number,a0:number,a1:number,color=P.silver){return h.add(surface(1,Math.max(4,Math.ceil((a1-a0)*32)),(u,v)=>{const a=a0+(a1-a0)*v;return [r*Math.sin(a),y0+(y1-y0)*u,r*Math.cos(a)];},false),color);}
const smEdges=[0,50,120,180,230,300,360].map(x=>x*Math.PI/180);
const smMiddle=(k:number)=>(smEdges[k]!+smEdges[k+1]!)/2;
export function serviceModule(){const h=new Hardware();
 h.lathe([0,0,0],[[1.95,94],[1.95,98.5],[1.93,98.5],[1.93,94],[1.95,94]],P.silver,128);
 for(const y of [94.04,98.16,98.43])h.ring([0,y,0],1.96,.022,P.grey);
 // Six radial webs and central cylindrical thrust shell, visible in cutaway.
 h.lathe([0,0,0],[[.58,94.1],[.58,98.39],[.54,98.39],[.54,94.1],[.58,94.1]],P.grey,64);
 for(let k=0;k<6;k++){
  const a=smEdges[k]!,s=Math.sin(a),c=Math.cos(a);
  facet(h,[[.58*s,94.12,.58*c],[1.90*s,94.12,1.90*c],[1.90*s,98.35,1.90*c],[.58*s,98.35,.58*c]],P.grey);
  for(const y of [94.16,98.3])h.rod([.58*s,y,.58*c],[1.9*s,y,1.9*c],.036,P.silver);
  h.rod([1.91*s,94.16,1.91*c],[1.91*s,98.3,1.91*c],.028,P.grey);
 }
 // Apollo 11 ECS radiators (sectors 2/5) and EPS radiator upper panels.
 for(let k=0;k<6;k++){
  const a=smMiddle(k);
  curvedPanel(h,1.969,97.63,98.35,a-.40,a+.40,P.white);
  for(let j=0;j<6;j++){const y=97.70+j*.10;pipe(h,Array.from({length:7},(_,i)=>{const t=a-.32+i*.64/6;return [1.978*Math.sin(t),y,1.978*Math.cos(t)] as V;}),.009,P.grey,6);}
  if(k===1||k===4){
   curvedPanel(h,1.974,94.22,95.52,a-.49,a+.49,P.white);
   for(let j=0;j<13;j++){const y=94.28+j*.098;pipe(h,Array.from({length:13},(_,i)=>{const t=a-.46+i*.92/12;return [1.987*Math.sin(t),y,1.987*Math.cos(t)] as V;}),.010,P.silver,12);}
  }
  // Bay closure seams and discrete inspection port edges follow each sector.
  const outline:V[]=[[1.963*Math.sin(a-.45),95.63,1.963*Math.cos(a-.45)],[1.963*Math.sin(a-.45),97.48,1.963*Math.cos(a-.45)],[1.963*Math.sin(a+.45),97.48,1.963*Math.cos(a+.45)],[1.963*Math.sin(a+.45),95.63,1.963*Math.cos(a+.45)]];
  for(let i=0;i<4;i++)h.rod(outline[i]!,outline[(i+1)%4]!,.009,P.grey);
 }
 for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;rcsQuad(h,[2.005*Math.sin(a),97.25,2.005*Math.cos(a)],a,.93);}
 // Four 31-inch high gain dishes with one central gimbal and dish support frame.
 const at:V=[2.65,93.85,2.65];h.rod([1.35,94.15,1.35],at,.048);body(h,at,.12,.24,P.grey,[1,0,1]);
 for(const x of [-.30,.30])for(const y of [-.42,.42]){
  const p:V=[at[0]+x,at[1]+y,at[2]-x];h.rod(at,p,.018,P.grey);dish(h,p,.39,[1,-.10,1],.12,P.grey);
 }
 // Two VHF scimitars, two S-band omni heads and an attached CM umbilical.
 for(const k of [0,3]){const a=k*T/6;h.plate([0,0,0],[[-.19,0],[-.13,.17],[.02,.29],[.16,.28],[.07,.09]],.023,P.white).rotateY(a).translate(1.97*Math.sin(a),94.11,1.97*Math.cos(a));}
 for(const k of [1,4]){const a=k*T/6;body(h,[1.99*Math.sin(a),96.25,1.99*Math.cos(a)],.075,.10,P.grey,[Math.sin(a),0,Math.cos(a)]);}
 pipe(h,[[0,98.44,1.96],[0,98.68,1.90],[0,98.84,1.65]],.08,P.white,12);
 return h.merge();
}
export function serviceStorage(){const h=new Hardware();
 // SPS oxidizer/fuel sump and storage vessels occupy sectors 2,3,5,6.
 for(const [sector,radius] of [[1,.57],[2,.57],[4,.57],[5,.57]] as XY[]){
  const a=smMiddle(sector),p:V=[1.24*Math.sin(a),96.25,1.24*Math.cos(a)];
  body(h,p,radius,3.90,P.silver);
  for(const y of [94.80,97.62]){h.ring([p[0],y,p[2]],radius+.012,.025,P.grey);for(const s of [-1,1])h.rod([p[0]+s*radius*.8,y,p[2]],[1.915*Math.sin(a+s*.20),y,1.915*Math.cos(a+s*.20)],.023);}
  pipe(h,[[p[0],94.35,p[2]],[p[0]*.75,94.14,p[2]*.75],[p[0]*.24,94.20,p[2]*.24],[p[0]*.24,94.66,p[2]*.24]],.045,P.grey,12);
  body(h,[p[0]*.24,94.33,p[2]*.24],.072,.15,P.grey);
 }
 // NASA specifies two 40-inch spherical pressurant tanks, vertically
 // stacked in the upper centre tunnel, not small ellipsoidal placeholders.
 for(const y of [96.70,97.84]){h.sphere([0,y,0],[.508,.508,.508],P.silver);h.ring([0,y,0],.514,.010,P.grey);for(const side of [-1,1])h.rod([side*.514,y,0],[side*.545,y,0],.012,P.grey);}
 // Sector IV: different cryogenic vessels, vertically staggered for actual
 // clearance, and three 44-by-22-inch fuel-cell cans on an attached deck.
 const a=smMiddle(3),s=Math.sin(a),c=Math.cos(a);
 for(const yy of [97.06,97.10])h.add(surface(1,16,(u,v)=>{const theta=smEdges[3]!+(smEdges[4]!-smEdges[3]!)*v,r=.59+1.32*u;return [r*Math.sin(theta),yy,r*Math.cos(theta)];},false),P.grey);
 curvedPanel(h,.59,97.06,97.10,smEdges[3]!,smEdges[4]!,P.grey);curvedPanel(h,1.91,97.06,97.10,smEdges[3]!,smEdges[4]!,P.grey);
 for(const [radial,tangent] of [[.91,0],[1.46,-.34],[1.46,.34]] as XY[]){
  const x=radial*s+tangent*c,z=radial*c-tangent*s,y=97.72;body(h,[x,y,z],.28,1.10,P.grey);
  for(let k=0;k<6;k++)h.ring([x,97.42+k*.115,z],.285,.008,P.silver);
  for(const side of [-1,1])h.rod([x+side*.18,97.27,z],[x+side*.23,97.10,z],.022,P.grey);
  pipe(h,[[x+.10,98.18,z],[x+.10,98.30,z],[.9*s,98.30,.9*c]],.014,P.silver,8);
 }
 for(const [radius,radial,theta,ys]of [[.40,1.50,213,[94.65,95.85]],[.33,.95,205,[95.23,96.43]]] as [number,number,number,number[]][]){
  const angle=theta*Math.PI/180,dx=Math.sin(angle),dz=Math.cos(angle);
  for(const y of ys){
   const p:V=[radial*dx,y,radial*dz];
   if(radius>.35){const profile:XY[]=[];for(let i=0;i<=8;i++){const aa=-Math.PI/2+i*Math.PI/16;profile.push([radius*Math.cos(aa),-.04+radius*Math.sin(aa)]);}profile.push([radius,.04]);for(let i=1;i<=8;i++){const aa=i*Math.PI/16;profile.push([radius*Math.cos(aa),.04+radius*Math.sin(aa)]);}h.lathe(p,profile,P.silver,32);}
   else h.sphere(p,[radius,radius,radius],P.silver);
   h.ring(p,radius+.004,.012,P.grey);
   if(radial>1)h.rod([p[0]+dx*(radius+.004),y,p[2]+dz*(radius+.004)],[1.925*dx,y,1.925*dz],.018,P.grey);
   else h.rod([p[0]-dx*(radius+.004),y,p[2]-dz*(radius+.004)],[.585*dx,y,.585*dz],.018,P.grey);
   pipe(h,[p,[p[0]*.65,y,p[2]*.65],[.35*s,97.0,.35*c]],.018,P.silver,12);
  }
 }
 return h.merge();
}
/** Cone is triangulated in unrolled angle/height space with genuine apertures.
 * Reveal walls connect inner/outer skins; glass is recessed inside each frame. */
export function commandModule(){const h=new Hardware(),bottom=101,top=104;
 const radius=(y:number)=>1.95-1.51*(y-bottom)/3+.025*Math.sin(Math.PI*(y-bottom)/3);
 const shell=new Shape([new Vector2(-Math.PI,bottom),new Vector2(Math.PI,bottom),new Vector2(Math.PI,top),new Vector2(-Math.PI,top)]);
 const holes:{a:number;y:number;points:XY[]}[]=[];
 // Central hatch, side observation windows, and paired upper rendezvous windows.
 for(const [a,y,shape] of [[0,102.26,[[-.14,-.14],[.14,-.14],[.14,.14],[-.14,.14]]],[-1.08,102.35,[[-.19,-.14],[.19,-.14],[.17,.17],[-.17,.17]]],[1.08,102.35,[[-.19,-.14],[.19,-.14],[.17,.17],[-.17,.17]]],[-.43,103.24,[[-.14,-.10],[.16,-.10],[.10,.18],[-.10,.18]]],[.43,103.24,[[-.16,-.10],[.14,-.10],[.10,.18],[-.10,.18]]]] as [number,number,XY[]][]){
  const pts=shape.map(([x,dy])=>[a+x/radius(y),y+dy] as XY);holes.push({a,y,points:pts});shell.holes.push(new Path(pts.map(p=>new Vector2(...p))));
 }
 for(const inset of [0,.055]){
  const g=new ShapeGeometry(shell,16),p=g.getAttribute('position');
  // Subdivide long planar triangles before bending around the cone.
  const positions:number[]=[],ix:number[]=[];const idx=g.index!;
  for(let t=0;t<idx.count;t+=3){const v=[0,1,2].map(k=>new Vector2(p.getX(idx.getX(t+k)),p.getY(idx.getX(t+k))));
   const n=Math.max(1,Math.ceil(Math.max(v[0]!.distanceTo(v[1]!),v[1]!.distanceTo(v[2]!),v[2]!.distanceTo(v[0]!))/.16));const rows:number[][]=[];
   for(let i=0;i<=n;i++){rows[i]=[];for(let j=0;j<=n-i;j++){const aa=v[0]!.clone().multiplyScalar(1-(i+j)/n).addScaledVector(v[1]!,i/n).addScaledVector(v[2]!,j/n),r=radius(aa.y)-inset;rows[i]!.push(positions.length/3);positions.push(r*Math.sin(aa.x),aa.y,r*Math.cos(aa.x));}}
   for(let i=0;i<n;i++)for(let j=0;j<n-i;j++){ix.push(rows[i]![j]!,rows[i+1]![j]!,rows[i]![j+1]!);if(j<n-i-1)ix.push(rows[i+1]![j]!,rows[i+1]![j+1]!,rows[i]![j+1]!);}
  }
  const skin=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(positions,3)).setIndex(ix);const normals:number[]=[];for(let i=0;i<positions.length;i+=3){const x=positions[i]!,y=positions[i+1]!,z=positions[i+2]!,r=Math.hypot(x,z),n=new Vector3(x/r,1.51/3-.025*Math.PI/3*Math.cos(Math.PI*(y-bottom)/3),z/r).normalize().multiplyScalar(inset?-1:1);normals.push(...n.toArray());}skin.setAttribute('normal',new Float32BufferAttribute(normals,3));h.add(skin,inset?P.grey:P.silver);g.dispose();
 }
 for(const {points} of holes){
  const pos=(a:number,y:number,inset=0):V=>[(radius(y)-inset)*Math.sin(a),y,(radius(y)-inset)*Math.cos(a)];
  for(let i=0;i<points.length;i++){const p=points[i]!,q=points[(i+1)%points.length]!;facet(h,[pos(...p),pos(...q),pos(...q,.055),pos(...p,.055)],P.grey);h.rod(pos(...p,-.012),pos(...q,-.012),.014,P.grey);}
  facet(h,points.map(([aa,yy])=>pos(aa,yy,.040)),P.dark);
 }
 // Rounded hatch seam follows the conic pressure shell, plus 3 hinges/handle.
 const hatch:XY[]=[[-.30,101.64],[.30,101.64],[.38,101.76],[.38,102.70],[.29,102.82],[-.29,102.82],[-.38,102.70],[-.38,101.76]];
 const hatchCurve=new CatmullRomCurve3(hatch.map(([x,y])=>new Vector3(x,y,0)),true,'centripetal');
 const hp=hatchCurve.getPoints(96).map(({x,y})=>[x,y,Math.sqrt((radius(y)+.018)**2-x*x)] as V);pipe(h,hp,.012,P.grey,96);
 for(const y of [101.88,102.19,102.51])body(h,[-.38,y,Math.sqrt(radius(y)**2-.38**2)+.02],.035,.12,P.grey,[0,1,0]);
 pipe(h,[[.18,101.90,radius(101.9)+.03],[.28,101.9,radius(101.9)+.075],[.32,102.02,radius(102.02)+.075]],.018,P.grey,8);
 for(const y of [101.08,103.86])h.ring([0,y,0],radius(y)+.007,.012,P.grey);
 // CM RCS recessed thruster ports in the aft cone; no raised painted circles.
 for(let k=0;k<6;k++){const a=(k+.5)*T/6,y=101.25;body(h,[(radius(y)+.01)*Math.sin(a),y,(radius(y)+.01)*Math.cos(a)],.047,.06,P.dark,[Math.sin(a),.25,Math.cos(a)]);}
 return h.merge();
}
export function launchEscape(){const h=new Hardware();
 // BPC travels and disappears with the tower, exposing the metallic CM in orbit.
 h.lathe([0,0,0],[[1.975,98.53],[1.975,98.64],[.47,101.55],[.45,101.62],[.41,101.62],[1.94,98.53]],P.white,128);
 for(let k=0;k<8;k++){const a=k*T/8;h.rod([1.973*Math.sin(a),98.64,1.973*Math.cos(a)],[.47*Math.sin(a),101.55,.47*Math.cos(a)],.006,P.grey);}
 // Clear hatch window opening and flush access-cover outlines on the BPC.
 for(const s of [-1,1])body(h,[s*.48,99.63,1.32],.11,.015,P.grey,[0,.46,1]);
 for(let k=0;k<4;k++){
  const a=Math.PI/4+k*Math.PI/2,b=a+Math.PI/2;
  const pt=(t:number,ang:number):V=>[(1.02-.59*t)*Math.sin(ang),100.60+4.04*t,(1.02-.59*t)*Math.cos(ang)];
  h.rod(pt(0,a),pt(1,a),.045,P.white);body(h,pt(0,a),.074,.22,P.white);
  for(let j=0;j<3;j++){h.rod(pt(j/3,a),pt((j+1)/3,b),.026,P.white);h.rod(pt(j/3,b),pt((j+1)/3,a),.026,P.white);h.rod(pt((j+1)/3,a),pt((j+1)/3,b),.032,P.white);}
  const n=new Hardware();nozzle(n,[[.15,0],[.12,.14],[.055,.31],[.057,.39]],P.grey,40,12);const dir=new Vector3(Math.sin(a)*.62,-1,Math.cos(a)*.62).normalize();h.pieces.push(n.merge().applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,-1,0),dir)).translate(.40*Math.sin(a),104.36,.40*Math.cos(a)));
 }
 h.lathe([0,0,0],[[.27,104.38],[.38,104.67],[.38,108.55],[.34,108.70],[.34,110.35],[.26,110.7],[0,111]],P.white,96);
 for(const y of [104.7,108.5,109.25,110.35])h.ring([0,y,0],y<108.6?.385:.345,.012,P.grey);
 // Two stowed canard panels conform to the motor. Abort deployment is not
 // falsely depicted on the nominal Apollo 11 launch stack.
 for(const a of [0,Math.PI]){
  curvedPanel(h,.347,109.35,110.30,a-.65,a+.65,P.white);
  for(const side of [-1,1])h.rod([.35*Math.sin(a+side*.65),109.35,.35*Math.cos(a+side*.65)],[.35*Math.sin(a+side*.65),110.3,.35*Math.cos(a+side*.65)],.008,P.grey);
  h.rod([-.21,109.36,.29*Math.cos(a)],[.21,109.36,.29*Math.cos(a)],.022,P.grey);
 }
 // Two canted tower-jettison exhausts and one transverse pitch motor port.
 for(const s of [-1,1]){body(h,[s*.34,108.95,0],.09,.23,P.grey,[s*.5,-1,0]);flange(h,[s*.37,108.85,0],.10,[s*.5,-1,0],6);}
 body(h,[0,109.40,.34],.065,.12,P.dark,[0,0,1]);
 return h.merge();
}
/** NASA's authored pressure-cabin facet topology, equipment bay and unequal
 * tank covers, with original open apertures and independently built fittings. */
export async function ascentCabin(){const h=new Hardware();
 const doc=await (await sourceIO()).read('scripts/geo/saturn-v/nasa-lm-source.glb');await doc.transform(dequantize());
 const skin=new Set(['polySurfac','pCube2','pCube27','pCube28','pCube29','polySurfa2','pCylinder9','pCylinde10','pCylinder4','pCylinder5']);
 for(const node of doc.getRoot().listNodes()){
  if(!skin.has(node.getName()))continue;
  for(const primitive of node.getMesh()?.listPrimitives()??[]){
   let g=new BufferGeometry();const position=primitive.getAttribute('POSITION')!,normal=primitive.getAttribute('NORMAL');
   g.setAttribute('position',new Float32BufferAttribute(position.getArray()!,3));if(normal)g.setAttribute('normal',new Float32BufferAttribute(normal.getArray()!,3));
   const index=primitive.getIndices();if(index)g.setIndex(Array.from(index.getArray()!));if(!normal)g.computeVertexNormals();
   g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix())).scale(1.22,1.32,1.22).translate(0,85.98,0);
   // A pressure cabin's blanket facets are planar; the source's averaged
   // normals make the front look pinched. Preserve curved regions while
   // splitting genuine facet boundaries at a 12-degree dihedral.
   const old=g;g=toCreasedNormals(g,Math.PI/15);if(g!==old)old.dispose();
   const name=node.getName(),mat=primitive.getMaterial()!.getName();
   h.add(g,mat.startsWith('blinn6')?P.dark:P.silver);
   if(name==='polySurfac'){const p=g.getAttribute('position'),n=g.getAttribute('normal'),c=g.getAttribute('color'),black=new Color(P.dark);for(let i=0;i<p.count;i++)if(p.getZ(i)>1.65&&p.getY(i)>90.85&&p.getY(i)<91.75&&n.getZ(i)>.25)c.setXYZ(i,black.r,black.g,black.b);}
  }
 }
 // Hatch latch, external handrails and porch attachment on the actual hatch
 // station rather than a second floating rectangular hatch over its skin.
 h.rod([.35,89.92,1.65],[.35,90.12,1.65],.017,P.grey);
 for(const x of [-.47,.47])pipe(h,[[x,89.45,1.69],[x,89.58,1.78],[x,90.02,1.82]],.018,P.silver,10);
 // Docking tunnel attaches the crew cabin to the retained independent port.
 h.lathe([0,0,0],[[.43,91.92],[.43,92.51],[.38,92.51],[.38,91.92],[.43,91.92]],P.silver,64);
 h.ring([0,92.27,0],.44,.025,P.grey);
 // APS cover, support cross and paired RCS outriggers.
 for(const s of [-1,1]){
  h.rod([s*.65,89.1,.6],[s*.9,89.65,.6],.052);h.rod([s*.65,89.1,-.6],[s*.95,89.7,-.6],.052);
  for(const zz of [-1,1]){
   // The four diagonal corner quads must have different radial orientations;
   // putting all four on the lateral axis eliminates one translation axis.
   const at:V=[s*1.60,90.55,zz*1.55],a=Math.atan2(at[0],at[2]);
   h.rod([s*1.28,90.51,zz*1.23],at,.045,P.silver);
   h.rod([s*1.30,90.20,zz*1.27],at,.027,P.grey);rcsQuad(h,at,a,.82);
  }
 }
 // Apollo 11 deployed rendezvous radar dish and steerable S-band, both
 // on separate gimballed truss mounts; VHF whips and docking target remain.
 h.rod([.10,91.9,.80],[.10,92.55,.85],.043,P.silver);dish(h,[.10,92.55,.85],.36,[0,.15,1],.13,P.grey);
 h.rod([-1.0,91.75,.10],[-1.39,92.30,.12],.033,P.silver);dish(h,[-1.39,92.30,.12],.26,[-.5,.10,1],.10,P.grey);
 for(const [x,z] of [[.76,-.52],[-.77,-.80]] as XY[]){
  h.rod([x,92.00,z],[x,92.80,z],.009,P.silver);for(const d of [-1,1])h.rod([x,92.43,z],[x+d*.18,92.33,z],.006,P.grey);
 }
 h.rod([.42,92.12,-.15],[.42,92.75,-.15],.016,P.grey);
 for(const s of [-1,1])h.rod([.42,92.72,-.15],[.42+s*.14,92.58,-.15],.010,P.silver);
 return h.merge();
}
export function descentStage(){const h=new Hardware();
 // LM-5 cruciform: four tank/equipment quadrants, re-entrant attachment bays.
 const outline:XY[]=[[-.94,2.1],[.94,2.1],[.94,1.48],[1.48,1.48],[2.1,.94],[2.1,-.94],[1.48,-1.48],[.94,-1.48],[.94,-2.1],[-.94,-2.1],[-.94,-1.48],[-1.48,-1.48],[-2.1,-.94],[-2.1,.94],[-1.48,1.48],[-.94,1.48]];
 for(let i=0;i<outline.length;i++){
  const a=outline[i]!,b=outline[(i+1)%outline.length]!,black=[0,4,8,12].includes(i);
  blanket(h,[[a[0],87.05,a[1]],[a[0],88.80,a[1]],[b[0],88.80,b[1]],[b[0],87.05,b[1]]],black?P.dark:P.gold,113+i);
  h.rod([a[0],87.06,a[1]],[a[0],88.79,a[1]],.014,P.grey);
  blanket(h,[[a[0],88.8,a[1]],[b[0],88.8,b[1]],[b[0]*.37,88.8,b[1]*.37],[a[0]*.37,88.8,a[1]*.37]],P.gold,212+i);
 }
 // Four square propellant bays surround the engine (Apollo 11 press
 // kit, Descent Stage). Their pressure vessels must survive a real cutaway,
 // not disappear behind the foil in every evidence view.
 for(const a of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
  const x=1.42*Math.sin(a),z=1.42*Math.cos(a);body(h,[x,87.95,z],.62,1.58,P.silver);
  for(const y of [87.55,88.35]){
   h.lathe([x,y,z],[[.622,-.018],[.640,-.018],[.640,.018],[.622,.018]],P.grey,32);
   for(const side of [-1,1])h.rod([x+side*.64*Math.cos(a),y,z-side*.64*Math.sin(a)],[x+side*.78*Math.cos(a),y,z-side*.78*Math.sin(a)],.018,P.grey);
  }
  pipe(h,[[x,87.16,z],[x*.76,87.13,z*.76],[.24*Math.sin(a),87.12,.24*Math.cos(a)]],.025,P.grey,10);
 }
 // Four full-height webs with their edge flanges: two parallel beam pairs.
 // The central bay stays clear for the descent engine; no imaginary radial
 // spoke cage replaces the real cruciform load path.
 for(const a of [0,Math.PI/2])for(const offset of [-.78,.78]){
  h.plate([0,0,0],[[-2.08,87.13],[2.08,87.13],[2.08,88.76],[-2.08,88.76]],.026,P.grey).rotateY(a).translate(Math.sin(a)*offset,0,Math.cos(a)*offset);
  for(const y of [87.15,88.74])h.plate([0,0,0],[[-2.08,-.055],[2.08,-.055],[2.08,.055],[-2.08,.055]],.024,P.silver).rotateX(Math.PI/2).rotateY(a).translate(Math.sin(a)*offset,y,Math.cos(a)*offset);
 }
 // Primary crossed structural beams around the central engine opening.
 for(const a of [0,Math.PI/2])for(const x of [-.78,.78]){
  const g=h.plate([0,0,0],[[-2.08,-.12],[2.08,-.12],[2.08,.12],[-2.08,.12]],.05,P.grey);g.rotateY(a).translate(Math.sin(a)*x,87.10,Math.cos(a)*x);
 }
 h.lathe([0,0,0],[[.72,87.08],[.72,88.82],[.77,88.82],[.77,87.08]],P.grey,64);
 for(const x of [-.85,.85])for(const z of [-.65,.65])h.rod([x,88.8,z],[x*.9,89.2,z*.9],.055,P.silver);
 // Eagle MESA, EASEP stowage and battery/equipment doors: door folds and
 // fastener edges differ by quadrant; no Apollo 15 rover or ALSEP inventory.
 const mesa:V[]=[[-1.98,87.30,.94],[-1.98,88.32,.94],[-1.98,88.32,-.72],[-1.98,87.30,-.72]];
 blanket(h,mesa,P.gold,512);for(let i=0;i<4;i++)h.rod(mesa[i]!,mesa[(i+1)%4]!,.014,P.grey);
 for(const y of [87.35,88.25])for(const z of [-.65,.80])body(h,[-2.0,y,z],.025,.04,P.grey,[-1,0,0]);
 for(const x of [-.49,.49])h.plate([x,87.93,-2.107],[[-.42,-.51],[.42,-.51],[.42,.51],[-.42,.51]],.02,P.grey);
 // Landing radar antenna under the aft stage: canted three-panel assembly.
 const radar=h.plate([0,0,0],[[-.33,-.18],[.33,-.18],[.33,.18],[-.33,.18]],.036,P.grey);radar.rotateX(-.42).translate(0,86.88,-1.30);
 for(const x of [-.22,.22])h.rod([x,87.12,-1.1],[x,86.88,-1.3],.018);
 return h.merge();
}
/** Irregular folded blankets share exact boundaries. Smooth baseline plus
 * sparse directional sharp folds avoids regular quilt/cotton-ball surfaces. */
function blanket(h:Hardware,corners:V[],color:string,seed:number){
 const [a,b,c,d]=corners as [V,V,V,V],n=new Vector3(...b).sub(new Vector3(...a)).cross(new Vector3(...d).sub(new Vector3(...a))).normalize();
 let state=seed;const rand=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 const folds=Array.from({length:13},()=>({x:rand(),y:rand(),angle:rand()*T,width:.018+rand()*.04,len:.2+rand()*.42,height:(rand()-.4)*.085}));
 h.add(surface(14,16,(u,v)=>{
  const p=a.map((x,i)=>x*(1-u)*(1-v)+b[i]!*u*(1-v)+c[i]!*u*v+d[i]!*(1-u)*v) as V;let z=0;
  for(const f of folds){const dx=u-f.x,dy=v-f.y,aa=dx*Math.cos(f.angle)+dy*Math.sin(f.angle),bb=-dx*Math.sin(f.angle)+dy*Math.cos(f.angle);z+=f.height*Math.exp(-Math.abs(bb)/f.width)*Math.max(0,1-Math.abs(aa)/f.len);}
  z*=Math.min(1,Math.min(u,v,1-u,1-v)*14);return [p[0]+n.x*z,p[1]+n.y*z,p[2]+n.z*z];
 },false),color);
}
export function landingGear(){const h=new Hardware();
 for(let k=0;k<4;k++){
  const angle=k*Math.PI/2,rot=(p:V):V=>[p[0]*Math.cos(angle)+p[2]*Math.sin(angle),p[1],-p[0]*Math.sin(angle)+p[2]*Math.cos(angle)];
  const top:V=[0,88.48,2.03],knuckle:V=[0,86.20,4.02],pad:V=[0,85.74,4.25];
  // Continuous primary strut runs all the way to the pad, with overlap into
  // telescopic lower tube, trunnions and axial sleeve bands.
  h.rod(rot(top),rot(knuckle),.105,P.gold);h.rod(rot(knuckle),rot(pad),.071,P.silver);
  const root=new Vector3(...top),axis=new Vector3(...knuckle).sub(root),q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),axis.clone().normalize()),len=axis.length();
  const wrap=surface(40,32,(u,v)=>{const a=T*v,r=.12+.014*Math.sin(u*83+v*37+k)+.012*Math.cos(u*46-v*23)+.006*Math.sin(u*127+v*19+k*2.7);return new Vector3(r*Math.cos(a),u*len,r*Math.sin(a)).applyQuaternion(q).add(root).toArray() as V;});wrap.rotateY(angle);h.add(wrap,P.gold);
  for(const t of [.12,.41,.73,.92]){const p=root.clone().addScaledVector(axis,t),g=h.ring([0,0,0],.127,.012,P.silver);g.applyQuaternion(q).translate(p.x,p.y,p.z).rotateY(angle);}
  for(const s of [-1,1]){
   const attach:V=[s*.84,87.27,1.78],joint:V=[s*.30,86.62,3.56];
   h.rod(rot(attach),rot(knuckle),.061,P.gold);h.rod(rot(attach),rot(joint),.043,P.grey);h.rod(rot(joint),rot(knuckle),.043,P.grey);h.rod(rot(joint),rot([0,87.62,2.75]),.032,P.silver);
   for(const p of [attach,joint]){h.sphere(rot(p),[.075,.075,.075],P.grey);body(h,rot(p),.045,.16,P.silver,rot([1,0,0]).map((v,i)=>i===1?0:v) as V);}
  }
  h.sphere(rot(top),[.14,.12,.14],P.grey);h.sphere(rot(pad),[.10,.10,.10],P.grey);
  const g=h.lathe([0,0,0],[[0,85.60],[.27,85.60],[.44,85.63],[.47,85.68],[.46,85.73],[.36,85.79],[.16,85.77],[.08,85.73],[0,85.73]],P.gold,64);g.translate(0,0,4.25).rotateY(angle);
  // LM-5 footpad blanket: crinkled foil lies on the dished metal pad,
  // surrounding the machined central universal-joint fitting (AS11-40-5917).
  let padSeed=881+k*193;const random=()=>((padSeed=(Math.imul(padSeed,1664525)+1013904223)>>>0)/4294967296);
  const creases=Array.from({length:140},()=>({x:(random()-.5)*.90,z:(random()-.5)*.90,angle:random()*T,width:.007+random()*.012,len:.04+random()*.09,height:.010+random()*.022}));
  const padFoil=(u:number,v:number):V=>{const a=T*v,r=(.105+.385*u)*(1+.014*u**3*(Math.sin(37*v+k)+.6*Math.sin(71*v+1.7*k))),x=r*Math.sin(a),z=r*Math.cos(a);let ridge=0;
   for(const f of creases){const dx=x-f.x,dz=z-f.z,t=dx*Math.cos(f.angle)+dz*Math.sin(f.angle),d=-dx*Math.sin(f.angle)+dz*Math.cos(f.angle);ridge+=f.height*Math.exp(-Math.abs(d)/f.width)*Math.max(0,1-Math.abs(t)/f.len);}
   const y=(r<.16?85.735+(r-.08)/.08*.04:r<.36?85.775+(r-.16)/.20*.02:r<.46?85.795-(r-.36)*.65:85.730-(r-.46)*1.65)+.022+Math.min(.055,ridge)*(.25+.75*Math.sin(Math.PI*u));
   return [x,y,z];};
  h.add(surface(24,128,(u,v)=>{const p=padFoil(u,v);return rot([p[0],p[1],4.25+p[2]]);}),P.gold);
  // Blanket wraps down over the metal rim. Vary narrow angular creases by
  // leg, with shared top-edge vertices so there is no floating second sheet.
  const skirtFolds=Array.from({length:43},()=>({a:random()*T,width:.018+random()*.055,depth:.004+random()*.012}));
  h.add(surface(5,128,(u,v)=>{const a=T*v,edge=padFoil(1,v),edgeR=Math.hypot(edge[0],edge[2]);let crinkle=0;
   for(const f of skirtFolds){const d=Math.atan2(Math.sin(a-f.a),Math.cos(a-f.a));crinkle+=f.depth*Math.exp(-Math.abs(d)/f.width);}
   const r=edgeR*(1-u)+.445*u+Math.sin(Math.PI*u)*crinkle,y=edge[1]*(1-u)+85.615*u;
   return rot([r*Math.sin(a),y,4.25+r*Math.cos(a)]);
  }),P.gold);
  h.lathe([0,0,0],[[.065,85.73],[.12,85.73],[.13,85.78],[.105,85.81],[.065,85.81],[.065,85.73]],P.silver,48).translate(0,0,4.25).rotateY(angle);
  const loRoot=new Vector3(...knuckle),loAxis=new Vector3(...pad).sub(loRoot),loQ=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),loAxis.clone().normalize());
  h.add(surface(16,32,(u,v)=>{const a=T*v,r=.083+.010*Math.sin(u*44+v*37+k)+.006*Math.sin(u*65-v*17),p=new Vector3(r*Math.cos(a),u*loAxis.length()*.98,r*Math.sin(a)).applyQuaternion(loQ).add(loRoot);return rot(p.toArray() as V);}),P.gold);
  // Three 67-inch surface-sensing probes are folded/bent after touchdown.
  // The forward ladder leg has no probe on LM-5.
  if(k!==0)pipe(h,[rot([.14,85.73,4.20]),rot([.21,85.66,4.34]),rot([.24,85.64,5.65])],.012,P.silver,3);
 }
 return h.merge();
}
export function crewCouches(){const h=new Hardware();
 // Block-II foldable couches: supine back, hip, raised knee and bent leg pan.
 // AFJ's Weber photograph and labelled folding-couch drawing control the
 // silhouette. These are not upright lounge chairs inside the launch stack.
 const stations:XY[]=[[101.72,-.90],[101.68,-.70],[101.55,-.12],[101.74,.37],[102.34,.66]];
 for(const x of [-.65,0,.65]){
  for(const side of [-1,1]){
   const path=stations.map(([y,z],i)=>[x+side*(i===0?.18:.245),y,z] as V);
   pipe(h,path,.024,P.dark,24);
   // Fold pivots and fore/aft locking collars are real attached relief.
   for(const [y,z] of [stations[2]!,stations[3]!]){
    body(h,[x+side*.25,y,z],.047,.060,P.grey,[1,0,0]);
    h.lathe([0,0,0],[[0,0],[.018,0],[.018,.012],[0,.012]],P.silver,12).rotateZ(-Math.PI/2).translate(x+side*.284,y,z);
   }
   if(x!==0){
    h.rod([x+side*.245,101.57,-.10],[x+side*.30,101.99,-.10],.022,P.grey);
    body(h,[x+side*.30,101.87,-.10],.034,.18,P.grey);
    pipe(h,[[x+side*.30,101.99,-.10],[x+side*.30,102.03,-.22],[x+side*.30,102.04,-.32]],.018,P.grey,8);
    body(h,[x+side*.30,102.055,-.30],.035,.09,P.dark,[0,0,1]);
   }
  }
  // Curved, doubled shoulder bracket and tensioned Armalon cloth panels.
  for(const y of [101.685,101.72])pipe(h,[[x-.245,y,-.69],[x-.21,y,-.92],[x,y,-1.00],[x+.21,y,-.92],[x+.245,y,-.69]],.016,P.grey,20);
  for(let j=1;j<stations.length-1;j++){
   const a=stations[j]!,b=stations[j+1]!;
   const cloth=(u:number,v:number):V=>[x+(v-.5)*.43,a[0]*(1-u)+b[0]*u-.028*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)+.011*Math.sin(7*Math.PI*u+.7*x)*Math.sin(Math.PI*v),a[1]*(1-u)+b[1]*u];
   h.add(surface(8,10,cloth,false),P.grey);
   // Turned cloth hems and lacing grommets have actual thickness. They
   // belong to the fabric edge instead of a generic perforated plate.
   for(const side of [0,1]){
    pipe(h,Array.from({length:9},(_,k)=>{const p=cloth(k/8,side*.94+.03);p[1]+=.006;return p;}),.005,P.silver,8);
    if(j!==2)for(const u of [.16,.50,.84]){const p=cloth(u,side*.90+.05);h.add(new TorusGeometry(.011,.0035,4,8).rotateX(-Math.PI/2).translate(p[0],p[1]+.005,p[2]),P.dark);}
   }
  }
  for(const side of [-1,1]){
   const pad=h.plate([0,0,0],[[-.085,-.105],[.085,-.105],[.105,-.065],[.09,.105],[-.09,.105],[-.105,-.065]],.028,P.grey);
   pad.rotateX(-Math.PI/2).translate(x+side*.105,101.75,-.82);
   const strap=surface(12,1,(u,v)=>[x+side*.17*(1-u)+(v-.5)*.032,101.72*(1-u)+101.60*u+.01*Math.sin(Math.PI*u),-.65+.54*u],false);h.add(strap,P.dark);
  }
  // Steel foot pan has a real central notch separating the heel restraints.
  h.plate([x,102.24,.69],[[-.24,0],[-.24,.25],[-.08,.25],[-.045,.07],[.045,.07],[.08,.25],[.24,.25],[.24,0]],.016,P.silver);
  pipe(h,[[x-.245,102.34,.66],[x-.25,102.39,.74],[x-.18,102.40,.82],[x,102.40,.85],[x+.18,102.40,.82],[x+.25,102.39,.74],[x+.245,102.34,.66]],.018,P.dark,18);
  for(const side of [-1,1])pipe(h,[[x+side*.16,102.27,.71],[x+side*.16,102.31,.76],[x+side*.10,102.33,.76]],.012,P.grey,6);
  h.add(surface(1,8,(u,v)=>[x+(v-.5)*.45,101.58+.014*Math.sin(Math.PI*v),-.12+u*.035],false),P.dark);
  const buckle=h.plate([0,0,0],[[-.035,-.028],[.035,-.028],[.035,.028],[-.035,.028]],.014,P.silver);buckle.rotateX(-Math.PI/2).translate(x,101.61,-.10);
 }
 // One head beam and two side stabilizers carry eight attenuator struts,
 // rather than assigning an imaginary independent support pair to each seat.
 h.rod([-.94,101.69,-.72],[.94,101.69,-.72],.035,P.grey);
 h.rod([-.94,101.55,-.12],[.94,101.55,-.12],.027,P.grey);
 for(const side of [-1,1])pipe(h,[[side*.94,101.69,-.72],[side*.94,101.55,-.12],[side*.94,101.74,.37]],.029,P.grey,10);
 const shock=(a:V,b:V)=>{const axis=new Vector3(...b).sub(new Vector3(...a)),mid=new Vector3(...a).lerp(new Vector3(...b),.55);h.rod(a,b,.018,P.silver);body(h,mid.toArray() as V,.033,axis.length()*.58,P.grey,axis.toArray() as V);};
 for(const side of [-1,1]){
  for(const [y,z]of [[101.69,-.72],[101.55,-.12]])shock([side*.94,y!,z!],[side*1.25,y!,z!]);
  shock([side*.82,101.69,-.72],[side*.82,101.23,-.72]);
  shock([side*.94,101.74,.37],[side*.94,101.74,.86]);
 }
 return h.merge();
}
export function instrumentUnit(){const h=new Hardware();
 h.lathe([0,0,0],[[3.305,84.67],[3.305,85.59],[3.24,85.59],[3.24,84.67],[3.305,84.67]],P.dark,128);
 for(const y of [84.7,85.56])h.ring([0,y,0],3.31,.02,P.grey);
 // Curved cold plates and LVDC/LVDA, ST-124 platform, telemetry/command
 // racks follow the circumferential mounting rail inside the IU, not a fan.
 const equipment=[{a:.16,w:.60,h:.52},{a:.59,w:.42,h:.46},{a:1.0,w:.52,h:.57},{a:1.44,w:.34,h:.46},{a:1.86,w:.58,h:.62},{a:2.30,w:.48,h:.49},{a:2.74,w:.60,h:.51},{a:3.21,w:.52,h:.60},{a:3.66,w:.42,h:.42},{a:4.16,w:.58,h:.55},{a:4.66,w:.51,h:.44},{a:5.18,w:.46,h:.60},{a:5.70,w:.42,h:.51}];
 for(const {a,w,h:height}of equipment){
  curvedPanel(h,3.235,84.80,85.46,a-w/6.4,a+w/6.4,P.silver);
  const g=h.plate([0,0,0],[[-w/2,-height/2],[w/2,-height/2],[w/2,height/2],[-w/2,height/2]],.17,P.grey);g.rotateY(a+Math.PI).translate(3.12*Math.sin(a),85.12,3.12*Math.cos(a));
  for(let j=0;j<4;j++){const yy=84.95+j*.09;pipe(h,[[3.02*Math.sin(a-.06),yy,3.02*Math.cos(a-.06)],[3.02*Math.sin(a+.06),yy,3.02*Math.cos(a+.06)]],.012,P.silver,1);}
  pipe(h,[[3.00*Math.sin(a),84.88,3.0*Math.cos(a)],[3.0*Math.sin(a),84.78,3.0*Math.cos(a)],[3.12*Math.sin(a+.18),84.76,3.12*Math.cos(a+.18)]],.018,P.grey,10);
 }
 for(const y of [84.76,85.48])h.ring([0,y,0],3.18,.018,P.silver);
 // ST-124 platform and three pneumatic spheres are confined to their sector.
 const a=3.5;body(h,[2.9*Math.sin(a),85.1,2.9*Math.cos(a)],.22,.46,P.silver);
 for(let i=0;i<2;i++){const aa=4.45+i*.11;h.sphere([2.94*Math.sin(aa),85.18,2.94*Math.cos(aa)],[.13,.13,.13],P.silver);}
 return h.merge();
}
/** Curved pressure vessel profiles, common domes, circumferential welds and
 * sump/pressurization connections. One common bulkhead belongs to LH2. */
export function stageTank(id:string){const h=new Hardware();
 const configs:Record<string,{r:number;lo:number;hi:number;depth:number;shared?:number;lower?:boolean}>={
 'sic-fuel':{r:4.95,lo:8.85,hi:21.15,depth:2.55},'sic-oxidiser':{r:4.95,lo:22.65,hi:41.25,depth:2.55},
 'sii-fuel':{r:4.93,lo:50.59,hi:65.2,depth:1.8,shared:50.59},'sii-oxidiser':{r:4.93,lo:47.0,hi:52.35,depth:1.8,shared:50.55,lower:true},
 'sivb-fuel':{r:3.20,lo:73.54,hi:83.4,depth:1.2,shared:73.54},'sivb-oxidiser':{r:3.20,lo:71.5,hi:74.7,depth:1.2,shared:73.50,lower:true}};
 const q=configs[id]!,r=q.r;let profile:XY[]=[];
 if(q.lower){
  // Lower LOX dome bulges into the hydrogen vessel above its equator.
  for(let i=0;i<=16;i++){const a=i*Math.PI/32;profile.push([r*Math.sin(a),q.lo+q.depth*(1-Math.cos(a))]);}
  profile.push([r,q.shared!]);for(let i=1;i<=16;i++){const a=i*Math.PI/32;profile.push([r*Math.cos(a),q.shared!+q.depth*Math.sin(a)]);}
 }else{
  const lower=q.shared!==undefined?q.shared!-q.depth:q.lo;
  for(let i=0;i<=16;i++){const a=i*Math.PI/32;profile.push([r*Math.sin(a),lower+q.depth*(1-Math.cos(a))]);}
  profile.push([r,q.hi-q.depth]);for(let i=1;i<=16;i++){const a=i*Math.PI/32;profile.push([r*Math.cos(a),q.hi-q.depth+q.depth*Math.sin(a)]);}
 }
 if(id==='sic-fuel')sicFuelPressureShell(h);else h.lathe([0,0,0],profile,id.endsWith('fuel')?P.grey:P.silver,80);
 // A common dome curves UP into LH2, not down into LOX. Replace LH2 lower
 // cap with that exact opposing curvature, with a 40mm insulation gap.
 if(q.shared!==undefined&&!q.lower){
  h.pieces.pop()!.dispose();profile=[];
  for(let i=0;i<=16;i++){const a=i*Math.PI/32;profile.push([r*Math.sin(a),q.shared!+q.depth*Math.cos(a)]);}
  profile.push([r,q.hi-q.depth]);for(let i=1;i<=16;i++){const a=i*Math.PI/32;profile.push([r*Math.cos(a),q.hi-q.depth+q.depth*Math.sin(a)]);}h.lathe([0,0,0],profile,P.grey,80);
 }
 // Thin annular anti-slosh baffles inside the barrel, with an open centre.
 const eqLow=q.lower?q.lo+q.depth:q.shared??q.lo+q.depth,eqHigh=q.lower?q.shared!:q.hi-q.depth;
 const baffles=id.startsWith('sivb')?1:id==='sic-oxidiser'?12:id==='sic-fuel'?8:q.lower?3:4;
 if(eqHigh>eqLow)for(let i=1;i<=baffles;i++){const y=eqLow+(eqHigh-eqLow)*i/(baffles+1);h.lathe([0,0,0],[[r-.24,y-.012],[r-.02,y-.012],[r-.02,y+.012],[r-.24,y+.012],[r-.24,y-.012]],P.grey,48);}
 // AS-506 press kit, S-IVB Restart: exactly nine cold helium spheres
 // inside LH2. Each has a retaining band and two wall standoffs.
 if(id==='sivb-fuel')for(let k=0;k<9;k++){
  const a=T*k/9,x=2.64*Math.sin(a),z=2.64*Math.cos(a),y=74.65;
  h.sphere([x,y,z],[.32,.32,.32],P.silver);h.ring([x,y,z],.323,.009,P.grey);
  for(const side of [-1,1]){const dx=side*.17*Math.cos(a),dz=-side*.17*Math.sin(a);h.rod([x+dx+.27*Math.sin(a),y,z+dz+.27*Math.cos(a)],[3.18*Math.sin(a)+dx,y,3.18*Math.cos(a)+dz],.018,P.grey);}
 }
 if(id==='sic-oxidiser')for(let k=0;k<4;k++){
  const a=k*T/4+Math.PI/4,x=3.28*Math.sin(a),z=3.28*Math.cos(a);body(h,[x,q.hi-3.0,z],.22,2.1,P.grey);
  for(const y of [q.hi-3.65,q.hi-2.35]){h.ring([x,y,z],.225,.012,P.grey);const wall=y>q.hi-q.depth?r*Math.sqrt(1-((y-(q.hi-q.depth))/q.depth)**2):r;h.rod([x+.23*Math.sin(a),y,z+.23*Math.cos(a)],[(wall-.015)*Math.sin(a),y,(wall-.015)*Math.cos(a)],.022,P.grey);}
 }
 const bottomEquator=q.lower?q.lo+q.depth:q.shared??q.lo+q.depth;
 for(const y of [bottomEquator,q.hi-q.depth])h.ring([0,y,0],r+.006,.017,P.silver);
 if(!q.lower){const top=q.hi,vx=id==='sic-fuel'?1.2:0,vy=id==='sic-fuel'?q.hi-q.depth+q.depth*Math.sqrt(1-(vx/r)**2):top;body(h,[vx,vy+.025,0],.10,.15,P.grey);flange(h,[vx,vy-.01,0],.16,[0,1,0],8);}
 // S-IC's five LOX downcomers pass through the fuel tank in sealed tunnels.
 if(id==='sic-fuel')for(const points of sicFeeds('fuel'))pipe(h,points,.14,P.grey,20);
 if(id==='sic-oxidiser')for(const points of sicFeeds('oxygen'))pipe(h,points,.18,P.silver,24);
 if(!id.endsWith('fuel')){
  const y=q.lo;body(h,[0,y-.02,0],.18,.25,P.grey);flange(h,[0,y+.04,0],.25);
  pipe(h,[[0,y,0],[0,y-.3,0],[r*.25,y-.4,0]],.14,P.silver,12);
 }
 return h.merge();
}
/** Shared authored feed centre-lines. Geometry and FLOW use these exact paths,
 * so visual plumbing cannot quietly diverge from the rendered simulator. */
export function sicFeeds(kind:'fuel'|'oxygen'):V[][]{
 const centres:XY[]=[[0,0],[0,-3.8],[-3.8,0],[0,3.8],[3.8,0]];
 return centres.map(([x,z],i)=>{const a=i===0?0:(i-1)*Math.PI/2,local=(xx:number,yy:number,zz:number):V=>[x+xx*Math.cos(a)+zz*Math.sin(a),yy,z-xx*Math.sin(a)+zz*Math.cos(a)];
  if(kind==='oxygen')return [[x,25.9,z],[x,23.8,z],[x,8.0,z],local(.30,6.0,0),local(.77,4.38*1.11,.05)] as V[];
  const root=local(-.57,0,.35),rho=Math.hypot(root[0],root[2]),y=8.85+2.55*(1-Math.sqrt(1-(rho/4.95)**2));
  return [[root[0],y+.04,root[2]],[root[0],7.8,root[2]],local(-.78,6.2,.35),local(-.78,4.20*1.11,.35)];
 });
}
function sicFuelPressureShell(h:Hardware){
 const radius=4.95,lo=8.85,hi=21.15,depth=2.55,centres:XY[]=[[0,0],[0,-3.8],[-3.8,0],[0,3.8],[3.8,0]],hole=.24;
 h.lathe([0,0,0],[[radius,lo+depth],[radius,hi-depth]],P.grey,128);
 const dome=(x:number,z:number,top:boolean)=>top?hi-depth+depth*Math.sqrt(Math.max(0,1-(x*x+z*z)/(radius*radius))):lo+depth-depth*Math.sqrt(Math.max(0,1-(x*x+z*z)/(radius*radius)));
 type Vertex={p:V;n:V};
 const holes=centres.map(([x,z])=>Array.from({length:48},(_,i)=>[x+hole*Math.cos(-T*i/48),z+hole*Math.sin(-T*i/48)] as XY));
 const cross=(a:XY,b:XY,v:Vertex)=>(b[0]-a[0])*(v.p[2]-a[1])-(b[1]-a[1])*(v.p[0]-a[0]);
 for(const top of [false,true]){
  const source=surface(16,80,(u,v)=>{const a=T*v,r=radius*Math.sin(u*Math.PI/2),x=r*Math.sin(a),z=r*Math.cos(a);return [x,dome(x,z,top),z];}),p=source.getAttribute('position'),idx=source.index!,positions:number[]=[],normals:number[]=[];
  const vertex=(i:number):Vertex=>{const pp:V=[p.getX(i),p.getY(i),p.getZ(i)],n=new Vector3(pp[0]/radius**2,(pp[1]-(top?hi-depth:lo+depth))/depth**2,pp[2]/radius**2).normalize();return {p:pp,n:n.toArray() as V};};
  const mix=(a:Vertex,b:Vertex,t:number):Vertex=>{const pp=a.p.map((x,i)=>x+(b.p[i]!-x)*t) as V;pp[1]=dome(pp[0],pp[2],top);const nn=new Vector3(...a.n).lerp(new Vector3(...b.n),t).normalize().toArray() as V;return {p:pp,n:nn};};
  const clip=(poly:Vertex[],a:XY,b:XY,inside:boolean)=>{const out:Vertex[]=[];for(let i=0;i<poly.length;i++){const v=poly[i]!,w=poly[(i+1)%poly.length]!,dv=cross(a,b,v),dw=cross(a,b,w),iv=inside?dv<=0:dv>=0,iw=inside?dw<=0:dw>=0;if(iv)out.push(v);if(iv!==iw)out.push(mix(v,w,dv/(dv-dw)));}return out;};
  const subtract=(poly:Vertex[],hole:XY[])=>{const output:Vertex[][]=[];let pending=poly;for(let i=0;i<hole.length&&pending.length;i++){const a=hole[i]!,b=hole[(i+1)%hole.length]!,outside=clip(pending,a,b,false);if(outside.length>=3)output.push(outside);pending=clip(pending,a,b,true);}return output;};
  for(let t=0;t<idx.count;t+=3){let polys:Vertex[][]=[[0,1,2].map(k=>vertex(idx.getX(t+k)))];
   for(let i=0;i<holes.length;i++){const [x,z]=centres[i]!;polys=polys.flatMap(poly=>{const xs=poly.map(v=>v.p[0]),zs=poly.map(v=>v.p[2]);return Math.max(...xs)<x-hole||Math.min(...xs)>x+hole||Math.max(...zs)<z-hole||Math.min(...zs)>z+hole?[poly]:subtract(poly,holes[i]!);});}
   for(const poly of polys)for(let i=1;i<poly.length-1;i++)for(const v of [poly[0]!,poly[i]!,poly[i+1]!]){positions.push(...v.p);normals.push(...v.n);}
  }
  h.add(new BufferGeometry().setAttribute('position',new Float32BufferAttribute(positions,3)).setAttribute('normal',new Float32BufferAttribute(normals,3)),P.grey);source.dispose();
 }
 // Fuel-side tunnel walls meet both perforated domes. The oxygen pipe has
 // a distinct, smaller radius and a real air/insulation gap to this wall.
 for(const [x,z] of centres){h.add(surface(1,144,(u,v)=>{const a=T*v,xx=x+hole*Math.cos(a),zz=z+hole*Math.sin(a),y=dome(xx,zz,false)*(1-u)+dome(xx,zz,true)*u;return [xx,y,zz];}),P.grey);}
 return h;
}

/** Protected identifying feature: the J-2 start tank remains a true sphere
 * after the engine's station calibration. Appended after hardware decimation. */
export function j2StartTank(at:V){const h=new Hardware();
 h.sphere([-.19,2.40,.42],[.31,.31/1.125,.31],P.silver);
 h.ring([0,0,0],.311,.005,P.grey).rotateX(Math.PI/2).scale(1,1/1.125,1).translate(-.19,2.40,.42);
 return h.merge().scale(1,1.125,1).translate(...at);
}

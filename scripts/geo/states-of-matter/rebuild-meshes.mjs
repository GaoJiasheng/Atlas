/** Original Atlas CC0 meshes. Metres, Y up; one welded mesh per selectable part.
 * No borrowed scans/textures. Runtime source finish uses GltfSource.atlasSurface.
 */
import fs from 'node:fs';
import {Document,NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,weld,meshopt,simplifyPrimitive} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {BufferAttribute,BufferGeometry,Color,Vector2,Vector3,Euler,Quaternion,LatheGeometry,SphereGeometry,TubeGeometry,CatmullRomCurve3,TorusGeometry,Shape,ExtrudeGeometry} from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {connectedSponge} from './sponge-connected.mjs';
import {refineSponge} from './refine-sponge.mjs';
import {spongeMicroAO} from './sponge-micro-ao.mjs';
import {crumpledCloth} from './cloth-sculpt.mjs';
import {clearIce} from './round2-forms.mjs';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts.ts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color.ts';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
import {partsFile} from '../../../src/engines/space-scene/schema.ts';
const TAU=Math.PI*2;
// Technical-plate palette, resolved from the real paper tokens at build time.
const css=fs.readFileSync('src/theme/tokens.css','utf8');
const token=n=>new Color(css.match(new RegExp(`--${n}:\\s*(#[a-f0-9]{6})`,'i'))[1]);
const P={ink:token('ink'),metal:token('ink-3').lerp(token('paper'),.35),cold:token('cold'),hot:token('hot'),paper:token('paper'),neutral:token('neutral'),bone:token('bone')};
const v=a=>new Vector3(...a),plus=(a,b)=>a.map((x,i)=>x+b[i]);
function paint(g,color,variation){
 const p=g.getAttribute('position'),a=new Float32Array(p.count*3),base=typeof color==='string'?P[color]:color;
 for(let i=0;i<p.count;i++){const c=base.clone();if(variation)c.multiplyScalar(variation(p.getX(i),p.getY(i),p.getZ(i),i));a.set(c.toArray(),i*3);}
 g.setAttribute('color',new BufferAttribute(a,3));g.deleteAttribute('uv');return g;
}
function put(g,at=[0,0,0],axis){if(axis)g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),v(axis).normalize()));g.translate(...at);return g;}
const lathe=(rows,at,color='metal',axis,segments=80)=>paint(put(new LatheGeometry(rows.map(p=>new Vector2(...p)),segments),at,axis),color);
const box=(size,at,color='ink',r=.002)=>paint(put(new RoundedBoxGeometry(...size,3,Math.min(r,Math.min(...size)*.45)),at),color);
const ell=(at,size,color,detail=32)=>paint(put(new SphereGeometry(1,detail,Math.floor(detail/2)).scale(...size),at),color);
function line(a,b,r,color='metal',radial=10){const g=new TubeGeometry(new CatmullRomCurve3([v(a),v(b)]),1,r,radial,false);return paint(g,color);}
function hose(points,r,color='ink',segments=64,radial=12){return paint(new TubeGeometry(new CatmullRomCurve3(points.map(v)),segments,r,radial,false),color);}
function ring(at,r,t,color='metal',axis=[0,0,1],segments=144){const g=new TorusGeometry(r,t,8,segments);g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,0,1),v(axis).normalize()));return paint(g.translate(...at),color);}
const closed=(rows)=>[[0,rows[0][1]],...rows,[0,rows.at(-1)[1]]];
function gauge(at,r=.023){
 // Dial is real geometry: recessed cream face, bevelled bezel, raised ticks,
 // centre pin and needle. No invented calibration numbers.
 const gs=[lathe([[0,-.008],[r*.9,-.008],[r,-.005],[r,.003],[r*.9,.005],[r*.86,.004],[r*.86,0],[0,0]],at,'ink',[0,0,1]),lathe(closed([[r*.85,.0002],[r*.85,.0008]]),at,'paper',[0,0,1])];
 for(let i=0;i<=24;i++){const a=(-130+i*260/24)*Math.PI/180,ri=r*(i%4?.71:.61),ro=r*.78;gs.push(line(plus(at,[Math.sin(a)*ri,Math.cos(a)*ri,.0011]),plus(at,[Math.sin(a)*ro,Math.cos(a)*ro,.0011]),r*.013,'ink',6));}
 gs.push(line(plus(at,[-r*.17,-r*.1,.0018]),plus(at,[r*.46,r*.48,.0018]),r*.025,'hot',8),ell(plus(at,[0,0,.0018]),[r*.08,r*.08,.001],'metal',16));return gs;
}
function foot(at,width=.16,depth=.055){
 const shape=new Shape();shape.moveTo(-width*.5,-depth*.25);shape.bezierCurveTo(-width*.62,depth*.62,-width*.28,depth*.7,-width*.12,depth*.3);shape.quadraticCurveTo(0,depth*.08,width*.12,depth*.3);shape.bezierCurveTo(width*.28,depth*.7,width*.62,depth*.62,width*.5,-depth*.25);shape.quadraticCurveTo(width*.35,-depth*.47,0,-depth*.4);shape.quadraticCurveTo(-width*.35,-depth*.47,-width*.5,-depth*.25);
 const g=new ExtrudeGeometry(shape,{depth:.009,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:3,steps:1,curveSegments:12});g.rotateX(Math.PI/2);g.translate(at[0],.013,at[2]);return paint(g,'ink');
}
function wheel(p){
 const c=p.primitive.at,major=.288,t=.022,gs=[];
 // Tyre has rounded shoulders, a central rolling band, and shallow sipes.
 const g=new TorusGeometry(major,t,20,192),pos=g.getAttribute('position');
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),a=Math.atan2(y,x),rho=Math.hypot(x,y),b=Math.atan2(z,rho-major);const tread=Math.pow(Math.max(0,Math.cos(a*96+2.4*Math.sin(b*3))),16)*.0007*Math.max(0,Math.cos(b));pos.setXYZ(i,x*(1-tread/rho),y*(1-tread/rho),z);}
 g.computeVertexNormals();gs.push(paint(g,'ink'));
 // Double-wall rim: real 22 mm axial width and recessed spoke bed.
 gs.push(lathe([[.265,-.008],[.267,-.011],[.283,-.011],[.286,-.009],[.286,-.007],[.272,-.007],[.269,0],[.272,.007],[.286,.007],[.286,.009],[.283,.011],[.267,.011],[.265,.008],[.265,-.008]],[0,0,0],'metal',[0,0,1],192));
 gs.push(lathe(closed([[.006,-.058],[.006,-.047],[.012,-.045],[.013,-.035],[.011,-.022],[.01,0],[.011,.022],[.013,.035],[.012,.045],[.006,.047],[.006,.058]]),[0,0,0],'metal',[0,0,1],80));
 // Two 18-hole flanges and 36 three-cross tangent-laced spokes. Each flange
 // alternates leading/trailing, 60 degrees rim-to-hub offset (= three holes).
 for(const side of [-1,1]){
  const sh=new Shape();sh.absarc(0,0,.023,0,TAU,false);const hole=new Shape();hole.absarc(0,0,.011,0,TAU,true);sh.holes.push(hole);
  for(let j=0;j<18;j++){const a=j*TAU/18+(side===1?TAU/36:0),h=new Shape();h.absarc(.019*Math.cos(a),.019*Math.sin(a),.0013,0,TAU,true);sh.holes.push(h);}
  const flange=new ExtrudeGeometry(sh,{depth:.0022,steps:1,bevelEnabled:true,bevelThickness:.0003,bevelSize:.0003,bevelSegments:2,curveSegments:6});flange.translate(0,0,side*.029-.0011);gs.push(paint(flange,'metal'));
  for(let j=0;j<18;j++){
   const a=j*TAU/18+(side===1?TAU/36:0),b=a+(j%2?1:-1)*Math.PI/3,A=[.019*Math.cos(a),.019*Math.sin(a),side*(.0304+(j%2?.0014:-.0014))],B=[.266*Math.cos(b),.266*Math.sin(b),side*.004];
   // Elbow bends through the flange; trailing wire is lifted at final crossing.
   const D=v(B).sub(v(A)).normalize(),end=v(B).addScaledVector(D,-.009).toArray();gs.push(hose([plus(A,[0,0,-side*.003]),A,plus(A,D.clone().multiplyScalar(.006).toArray()),end],.00095,'metal',5,8));gs.push(line(end,B,.00155,'neutral',8));
  }
 }
 // Axle retention: two bevelled hex nuts with circular through bores.
 for(const side of [-1,1]){const outline=new Shape();for(let j=0;j<6;j++){const a=j*TAU/6;const x=.0098*Math.cos(a),y=.0098*Math.sin(a);if(j===0)outline.moveTo(x,y);else outline.lineTo(x,y);}outline.closePath();const bore=new Shape();bore.absarc(0,0,.00615,0,TAU,true);outline.holes.push(bore);const nut=new ExtrudeGeometry(outline,{depth:.006,bevelEnabled:true,bevelSize:.0005,bevelThickness:.0005,bevelSegments:2,curveSegments:6,steps:1});nut.translate(0,0,side*.052-.003);gs.push(paint(nut,'metal'));}
 const a=35*Math.PI/180,rad=[Math.sin(a),-Math.cos(a),0],valve=rad.map(x=>x*.255);
 gs.push(lathe(closed([[.0025,-.014],[.0031,-.012],[.0031,.011],[.004,.014]]),valve,'neutral',rad,24));
 // Axle is actually captured by the two uprights, not hovering in front.
 gs.push(box([.18,.016,.14],[0,.008-c[1],0],'ink',.004));
 for(const side of [-1,1])gs.push(hose([[side*.07,.016-c[1],0],[side*.064,.1-c[1],side*.045],[0,0,side*.051]],.006,'ink',28));
 return gs.map(g=>g.translate(...c));
}
function ball(p){
 const c=p.primitive.at,R=p.primitive.size[0],gs=[];
 // Four loops partition the surface into exactly eight panels. The two side
 // channels bow in space (not offset planar tori). Two great-circle channels
 // are x=0 and z=0; each side loop cuts two of their four faces once.
 const seam=(x,y,z)=>Math.min(Math.abs(x),Math.abs(z),Math.abs(Math.abs(x)-(.60-.16*y*y))*.9)*R;
 // Each seam is an explicit shared mesh boundary. Sampling an implicit
 // distance on a latitude grid made a visible sawtooth in round 1.
 const ppBody=[],nnBody=[],ccBody=[],iiBody=[];
 const phiMax=Math.acos((1-Math.sqrt(1-4*.16*.44))/(2*.16));
 function bodyPoint(phi,theta,sx,sz){
  const n=v([sx*Math.cos(phi)*Math.sin(theta),Math.sin(phi),sz*Math.cos(phi)*Math.cos(theta)]),d=seam(n.x,n.y,n.z),f=Math.exp(-Math.pow(d/.00155,4)),r=R-.0009*f;
  const tangent=new Vector3().crossVectors(n,new Vector3(0,1,0)).normalize(),up=new Vector3().crossVectors(n,tangent),normal=n.clone();
  for(const t of [tangent,up]){const epsilon=.0002,a=n.clone().addScaledVector(t,epsilon).normalize(),b=n.clone().addScaledVector(t,-epsilon).normalize(),dr=(-.0009*Math.exp(-Math.pow(seam(a.x,a.y,a.z)/.00155,4))+.0009*Math.exp(-Math.pow(seam(b.x,b.y,b.z)/.00155,4)))/(2*epsilon);normal.addScaledVector(t,-dr/R);}
  return {p:n.multiplyScalar(r),n:normal.normalize(),c:P.hot.clone().multiplyScalar(.65).lerp(P.ink,f*.99)};
 }
 for(const sx of [-1,1])for(const sz of [-1,1])for(const outer of [false,true]){
  const lat=outer?Array.from({length:57},(_,i)=>-phiMax+2*phiMax*i/56):[...Array.from({length:9},(_,i)=>-Math.PI/2+(Math.PI/2-phiMax)*i/9),...Array.from({length:57},(_,i)=>-phiMax+2*phiMax*i/56),...Array.from({length:9},(_,i)=>phiMax+(Math.PI/2-phiMax)*(i+1)/9)];
  const base=ppBody.length/3,COLS=16;
  for(const phi of lat){const y=Math.sin(phi),theta=Math.asin(Math.min(1,(.60-.16*y*y)/Math.max(1e-8,Math.cos(phi)))),lo=outer?theta:0,hi=outer?Math.PI/2:theta,w=hi-lo;
   for(let i=0;i<=COLS;i++){const edge=Math.min(w*.2,.0018/(R*Math.max(.08,Math.cos(phi))));let t=i===0?lo:i===COLS?hi:i===1?lo+edge:i===COLS-1?hi-edge:lo+edge+(w-2*edge)*(i-1)/(COLS-2);const q=bodyPoint(phi,t,sx,sz);ppBody.push(...q.p.toArray());nnBody.push(...q.n.toArray());ccBody.push(...q.c.toArray());}
  }
  for(let j=0;j<lat.length-1;j++)for(let i=0;i<COLS;i++){const a=base+j*(COLS+1)+i,b=a+1,c=a+COLS+1;if(sx*sz>0)iiBody.push(a,b,c,b,c+1,c);else iiBody.push(a,c,b,b,c,c+1);}
 }
 const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(new Float32Array(ppBody),3));g.setAttribute('normal',new BufferAttribute(new Float32Array(nnBody),3));g.setAttribute('color',new BufferAttribute(new Float32Array(ccBody),3));g.setIndex(iiBody);gs.push(g);
 // Raised moulded grain, Fibonacci distribution avoids a UV seam or polar
 // bands. Smooth analytic dome normals keep the small hex fans rounded.
 const pp=[],nn=[],cc=[],ix=[];const N=5800;
 for(let j=0;j<N;j++){const y=1-2*(j+.5)/N,a=j*Math.PI*(3-Math.sqrt(5)),h=Math.sqrt(1-y*y),n=v([Math.cos(a)*h,y,Math.sin(a)*h]);if(seam(n.x,n.y,n.z)<.0024)continue;const u=new Vector3().crossVectors(n,new Vector3(0,1,0)).normalize(),w=new Vector3().crossVectors(n,u),r=.00135*(.88+.12*Math.sin(j*7.3)),base=pp.length/3;
  pp.push(...n.clone().multiplyScalar(R+.00018).toArray());nn.push(...n.toArray());const color=P.hot.clone().multiplyScalar(.65*(.95+.1*Math.sin(j*1.9)));cc.push(...color.toArray());
  for(let k=0;k<6;k++){const d=u.clone().multiplyScalar(Math.cos(k*TAU/6)).addScaledVector(w,Math.sin(k*TAU/6));pp.push(...n.clone().multiplyScalar(R-.00002).addScaledVector(d,r).toArray());nn.push(...n.clone().addScaledVector(d,.22).normalize().toArray());cc.push(...color.toArray());}
  for(let k=0;k<6;k++)ix.push(base,base+1+k,base+1+(k+1)%6);
 }
 const pebbles=new BufferGeometry();pebbles.setAttribute('position',new BufferAttribute(new Float32Array(pp),3));pebbles.setAttribute('normal',new BufferAttribute(new Float32Array(nn),3));pebbles.setAttribute('color',new BufferAttribute(new Float32Array(cc),3));pebbles.setIndex(ix);gs.push(pebbles);
 gs.forEach(g=>g.rotateX(.45).rotateZ(.17));
 const vd=v([.35,-.35,.87]).normalize(),va=vd.clone().multiplyScalar(R-.0001).toArray();gs.push(lathe([[.00125,-.0008],[.0032,-.0008],[.0036,0],[.003,.0003],[.00125,.0003],[.00125,-.0008]],va,'ink',vd.toArray(),24));
 return gs.map(g=>g.translate(...c));
}
export function floorHosePoints(at){
 const radial=[Math.sin(35*Math.PI/180),-Math.cos(35*Math.PI/180),0],end=plus([-1.45,.345,-.15],radial.map(x=>x*.241)),start=plus(at,[-.02,.035,.004]);
 return [start,plus(at,[-.045,.034,.05]),[end[0]+.035,.025,end[2]+.05],[end[0],end[1]-.02,end[2]+.02],end];
}
export function ballHosePoints(p){const old=p.extra.find(e=>e.kind==='tube');return old.path.map(x=>plus(x,old.at));}
function pump(p,kind){
 const gs=[];
 if(kind==='floor'){
  const at=p.primitive.at;gs.push(foot(at));
  gs.push(lathe(closed([[.022,.015],[.024,.023],[.024,.036],[.019,.043],[.019,.508],[.022,.514],[.022,.526],[.011,.531]]),at,'cold'));
  gs.push(lathe(closed([[.005,.526],[.005,.578],[.009,.582]]),at,'metal'));
  const h=plus(at,[0,.592,0]);gs.push(lathe(closed([[.009,-.085],[.012,-.082],[.012,-.026],[.01,-.02],[.01,.02],[.012,.026],[.012,.082],[.009,.085]]),h,'ink',[1,0,0]));
  for(const side of [-1,1])for(let j=0;j<6;j++)gs.push(ring(plus(h,[side*(.035+j*.007),0,0]),.012,.0005,'neutral',[1,0,0],32));
  gs.push(...gauge(plus(at,[0,.074,.036]),.023),line(plus(at,[0,.038,0]),plus(at,[0,.067,.024]),.009,'ink'));
  const radial=[Math.sin(35*Math.PI/180),-Math.cos(35*Math.PI/180),0],end=plus([-1.45,.345,-.15],radial.map(x=>x*.241));
  gs.push(hose(floorHosePoints(at),.004));
  gs.push(lathe(closed([[.006,-.01],[.007,-.006],[.006,.008]]),end,'ink',radial,32),box([.004,.018,.006],plus(end,[.007,.005,0]),'neutral',.001));
 }else if(kind==='ball'){
  const at=[.1775,.0215,-.04],axis=[1,0,0];
  gs.push(lathe(closed([[.008,-.09],[.019,-.087],[.0215,-.079],[.0215,.077],[.019,.087],[.009,.093]]),at,'cold',axis));
  gs.push(lathe(closed([[.006,-.1205],[.006,-.09]]),at,'metal',axis),lathe(closed([[.007,-.046],[.009,-.042],[.009,.042],[.007,.046]]),[.057,.0215,-.04],'ink',[0,0,1]));
  for(let j=0;j<7;j++)gs.push(ring([.057,.0215,-.04+(j-3)*.011],.009,.00045,'neutral',[0,0,1],32));
  gs.push(lathe(closed([[.009,.087],[.009,.098],[.006,.103]]),at,'ink',axis));
  gs.push(hose(ballHosePoints(p),.0034));
  const nd=p.extra.filter(e=>e.kind==='tube')[1],ends=nd.path.map(x=>plus(x,nd.at));gs.push(line(...ends,.0012,'metal',10),lathe(closed([[.004,-.004],[.004,.004]]),ends[0],'neutral',v(ends[1]).sub(v(ends[0])).toArray(),24));
 }else{
  const at=p.primitive.at;
  // Rear T-grip, exposed sliding piston shaft, seal collar and straight
  // barrel. The earlier footed, flared body read as a dispenser in the sheets.
  gs.push(lathe(closed([[.007,-.043],[.009,-.039],[.009,-.012],[.008,0],[.009,.012],[.009,.039],[.007,.043]]),plus(at,[0,.009,0]),'ink',[1,0,0],48));
  gs.push(lathe(closed([[.0045,.017],[.0045,.057]]),at,'metal',[0,1,0],48));
  gs.push(lathe(closed([[.012,.051],[.016,.054],[.016,.061],[.014,.064],[.014,.134],[.016,.138],[.016,.146],[.010,.150]]),at,'cold',[0,1,0],80));
  gs.push(lathe(closed([[.010,.147],[.010,.150],[.0038,.152],[.0012,.160],[.0009,.165]]),at,'ink',[0,1,0],64));
  for(let j=0;j<3;j++)gs.push(ring(plus(at,[0,.076+j*.017,0]),.0141,.00035,'neutral',[0,1,0],32));
  for(const side of [-1,1])for(let j=0;j<2;j++)gs.push(ring(plus(at,[side*(.023+j*.010),.009,0]),.009,.0004,'neutral',[1,0,0],24));

 }
 return gs;
}
function balloon(p,long=false){
 const gs=[],origin=long?[.41,0,-.31]:p.primitive.at;
 if(!long){
  // Smooth monotone cubic profile through measured silhouette landmarks.
  const pts=[[.004,0],[.006,.008],[.008,.018],[.017,.029],[.039,.047],[.058,.073],[.065,.099],[.057,.124],[.035,.143],[0,.1495]];
  const curve=new CatmullRomCurve3(pts.map(([r,y])=>v([r,y,0])));const rows=curve.getPoints(64).map(p=>[Math.max(0,p.x),p.y]);const skin=lathe(rows,[0,0,0],'hot',[0,1,0],96),ps=skin.getAttribute('position');for(let i=0;i<ps.count;i++){const x=ps.getX(i),y=ps.getY(i),z=ps.getZ(i),r=Math.hypot(x,z),a=Math.atan2(z,x),wrinkle=.00045*Math.exp(-(((y-.012)/.009)**2))*(Math.sin(7*a+40*y)+.42*Math.sin(11*a-50*y+.3));if(r>.001&&y<.03)ps.setXYZ(i,x*(1+wrinkle/r),y,z*(1+wrinkle/r));}skin.computeVertexNormals();gs.push(skin);
  gs.push(ring([0,.0025,0],.0053,.0012,'hot',[0,1,0],64));
  // Pump-connected balloon is untied: the rolled cuff actually surrounds the
  // nozzle. A tied round balloon here would contradict the pumping flow.

  return gs.map(g=>g.scale(.32,.4,.32).translate(...origin));
 }
 // Modelling balloon: rounded closed tip, a long subtly bent body, drawn neck,
 // overhand knot and flared rolled mouth. No capsule-to-knot intersection.
 const rows=new CatmullRomCurve3([[0,.004],[.002,.006],[.003,.011],[.010,.018],[.018,.025],[.023,.036],[.024,.052],[.0235,.14],[.0225,.174]].map(([r,y])=>v([r,y,0]))).getPoints(64).map(q=>[Math.max(0,q.x),q.y]);
 for(let i=1;i<=24;i++){const a=i*Math.PI/48;rows.push([.0225*Math.cos(a),.174+.025*Math.sin(a)]);}

 const body=lathe(rows,[0,.024,0],'cold',[1,0,0],64),ps=body.getAttribute('position');for(let i=0;i<ps.count;i++)ps.setY(i,ps.getY(i)+.0015*Math.sin(ps.getX(i)*Math.PI/.199));body.computeVertexNormals();gs.push(body);
 gs.push(hose([[.004,.024,0],[.001,.028,.002],[-.003,.024,.003],[.001,.020,-.002],[.003,.024,-.002],[-.001,.028,0]],.0021,'cold',32,12));
 gs.push(lathe([[.0015,-.004],[.005,-.004],[.0055,-.003],[.0035,.001],[.0015,.001],[.0015,-.004]],[-.004,.024,0],'cold',[1,0,0],40));
 return gs.map(g=>g.scale(.38,.45,.45).translate(...origin));
}
function torch(p){
 const origin=p.primitive.at,at=[origin[0],.05,.255],axis=[1,0,0],gs=[];
 gs.push(lathe([[0,0],[.01,0],[.013,.002],[.013,.01],[.012,.012],[.012,.099],[.014,.113],[.018,.128],[.021,.136],[.021,.155],[.02,.16],[.0187,.16],[.0187,.154],[.017,.14],[.004,.134],[0,.134]],at,'ink',axis,112));
 // Dish reflector has a real recessed paraboloid, raised emitter and socket.
 const rows=[];for(let i=0;i<=24;i++){const r=.002+i*.0007;rows.push([r,.137+.019*(r/.0188)**2]);}rows.push([.0188,.158],[.0195,.159],[.0195,.162],[.0179,.162],[.0179,.159]);gs.push(lathe(rows.reverse(),at,'metal',axis,112));
 gs.push(lathe(closed([[.0025,.136],[.0028,.139],[.0018,.14]]),at,'bone',axis,32));
 for(const x of [.006,.01,.019,.022,.095,.098,.127,.13,.134,.158])gs.push(ring(plus(at,[x,0,0]),x>.12?.0205:.013,.00065,'ink',axis,80));
 // Helical crossing grip grooves are physically raised below 0.2 mm.
 for(let k=0;k<16;k++)for(const sign of [-1,1]){const path=[];for(let i=0;i<=15;i++){const x=.028+.062*i/15,a=k*TAU/16+sign*x*100;path.push(plus(at,[x,.01205*Math.cos(a),.01205*Math.sin(a)]));}gs.push(hose(path,.00016,'ink',15,4));}
 gs.push(ell(plus(at,[.105,.014,0]),[.006,.0028,.004],'ink',24));
 // Two padded saddles hold the body, leaving the optical head clear.
 for(const x of [.025,.085]){
  const s=new Shape();s.moveTo(-.018,0);s.lineTo(.018,0);s.lineTo(.018,.052);s.lineTo(.014,.05);
  for(let j=0;j<=32;j++){const a=j*Math.PI/32;s.lineTo(.014*Math.cos(a),.05-.014*Math.sin(a));}
  s.lineTo(-.018,.052);s.closePath();
  const cradle=new ExtrudeGeometry(s,{depth:.012,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.0006,bevelThickness:.0004});cradle.rotateY(Math.PI/2).translate(at[0]+x-.006,0,at[2]);gs.push(paint(cradle,'neutral'),ring([at[0]+x,.05,at[2]],.0125,.0015,'ink',axis,48));
 }
 return gs;
}

function bench(p){
 const at=p.primitive.at,side=p.id==='side-table',width=side?.8:1.8,depth=side?.6:.7,cx=at[0],gs=[box([width,.04,depth],[cx,-.02,0],'bone',.006)];
 // Mortised hardwood aprons connect the top and 65 mm legs in all directions.
 const hx=width/2-.06,hz=depth/2-.055;
 for(const x of [-hx,hx])for(const z of [-hz,hz]){gs.push(box([.06,.735,.06],[cx+x,-.4075,z],'neutral',.002));gs.push(box([.062,.018,.062],[cx+x,-.774,z],'ink',.003));}
 for(const z of [-hz,hz])gs.push(box([width-.09,.095,.026],[cx,-.089,z],'neutral',.002));
 for(const x of [-hx,hx]){gs.push(box([.026,.095,depth-.09],[cx+x,-.089,0],'neutral',.002),box([.03,.043,depth-.1],[cx+x,-.60,0],'neutral',.002));}
 gs.push(box([width-.14,.043,.03],[cx,-.60,0],'neutral',.002));return gs;
}
function grains(p){
 // Worn quartz/mineral grains: irregular bulk, conchoidal depressions and
 // unequal mineral inclusions, not flattened rotational pebbles.
 const gs=[];
 for(let j=0;j<[p.primitive,...p.extra].length;j++){
  const q=[p.primitive,...p.extra][j],r=Math.max(...q.profile.map(x=>x[0]));
  const g=new SphereGeometry(1,32,22),pos=g.getAttribute('position'),cs=new Float32Array(pos.count*3),base=[P.bone,P.neutral,P.paper][j%3].clone().lerp(P.bone,.25);
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),macro=.13*Math.sin(x*4+j)*Math.sin(z*5+.5*j)+.10*Math.cos(y*6-j),scar=.035*Math.sin(13*x+7*z+j)*Math.cos(11*y-3*x),d=1+macro+scar;
   pos.setXYZ(i,x*r*d*q.scale[0],y*r*(.78+.13*Math.sin(j*2.4))*d*q.scale[1],z*r*d*q.scale[2]);
   const mineral=.77+.23*(.5+.5*Math.tanh(Math.sin(12*x+8*z+j)+Math.sin(9*y-5*z+j*.7)));
   cs.set(base.clone().multiplyScalar(mineral).toArray(),i*3);
  }
  g.setAttribute('color',new BufferAttribute(cs,3));g.deleteAttribute('uv');g.computeVertexNormals();g.applyQuaternion(new Quaternion().setFromEuler(new Euler(...q.rotation.map(d=>d*Math.PI/180))));g.computeBoundingBox();g.translate(q.at[0],.012-g.boundingBox.min.y,q.at[2]);gs.push(g);
 }return gs;
}
function tissue(p){return crumpledCloth(p,P);}
function ice(p){return clearIce(p,P);}
function counts(file){let tris=0,calls=0;const byPart={};for(const p of partsFile.parse(file).parts){const ps=partPieces(p);const t=ps.reduce((s,x)=>s+(x.geometry.index?.count??x.geometry.getAttribute('position').count)/3*(x.matrices?.length??1),0);byPart[p.id]={triangles:t,draws:ps.length};tris+=t;calls+=ps.length;for(const x of ps)x.geometry.dispose();}return {triangles:tris,draws:calls,byPart};}
export async function rebuildMeshes(data){
 const before=JSON.parse(fs.readFileSync('scripts/geo/states-of-matter/evidence/round1-metrics.json','utf8')).after,doc=new Document(),buf=doc.createBuffer(),scene=doc.createScene('states-of-matter');doc.getRoot().getAsset().copyright='Original Atlas procedural models, CC0-1.0. Reference photographs used for observation only; see topic data/SOURCES.md.';
 const jobs={'bicycle-wheel':wheel,'basketball':ball,'floor-pump':p=>pump(p,'floor'),'ball-pump':p=>pump(p,'ball'),'balloon-pump':p=>pump(p,'balloon'),'balloon-round':balloon,'balloon-long':p=>balloon(p,true),'torch':torch,'bench':bench,'side-table':bench,'sand-grains':grains,'sponge':p=>connectedSponge(p,P),'tissue':tissue,'ice-cube':ice};

 // The cylinder foot and engraved graduations share one graphite powder finish.
 for(const id of ['cylinder-a','cylinder-b','cylinder-c'])for(const q of data.parts.find(p=>p.id===id).extra??[])if(q.color==='powder')q.tint='token:ink';
 const originalParsed=partsFile.parse(data);
 const current=counts(data),after={...current,byPart:{...current.byPart}};
 const pumped=data.flows.find(f=>f.id==='pumped-air');pumped.spread=.00065;const balloonPath=pumped.paths.find(p=>p.id==='balloon').path;balloonPath[0][1]=.073;balloonPath[balloonPath.length-1][1]=.195;
 for(const [id,build] of Object.entries(jobs)){
  const p=data.parts.find(p=>p.id===id),at=p.primitive.at;
  if(id==='floor-pump'||id==='ball-pump'){
   const points=id==='floor-pump'?floorHosePoints(at):ballHosePoints(p),curve=new CatmullRomCurve3(points.map(v)),sample=curve.getPoints(32).map(p=>p.toArray()),entry=curve.getPoint(0).addScaledVector(curve.getTangent(0),-.008).toArray();
   const path=id==='floor-pump'?data.flows.find(f=>f.id==='tyre-air'):data.flows.find(f=>f.id==='pumped-air').paths.find(p=>p.id==='ball');
   if(id==='floor-pump')path.path=[...path.path.slice(0,2),entry,...sample,...path.path.slice(4)];
   else{const valve=path.path[3],needle=sample.at(-1),line=Array.from({length:8},(_,i)=>v(needle).lerp(v(valve),(i+1)/8).toArray());path.path=[path.path[0],entry,...sample,...line,...path.path.slice(4)];}
   path.path=path.path.map(p=>p.map(x=>Number(x.toFixed(6))));
  }
  const gs=build(p);if(id==='ice-cube')for(const g of gs)g.setAttribute('iceLayer',new BufferAttribute(new Float32Array(g.getAttribute('position').count).fill(g.userData.iceLayer),1));const g=mergeGeometries(gs.map(g=>{g.deleteAttribute('uv');return g.index?g.toNonIndexed():g;}));g.translate(-at[0],-at[1],-at[2]);
  const prim=doc.createPrimitive();for(const [name,semantic] of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']]){const a=g.getAttribute(name);prim.setAttribute(semantic,doc.createAccessor().setType(a.itemSize===4?'VEC4':'VEC3').setArray(new Float32Array(a.array)).setBuffer(buf));}
  if(id==='ice-cube')prim.setAttribute('_LAYER',doc.createAccessor().setType('SCALAR').setArray(new Float32Array(g.getAttribute('iceLayer').array)).setBuffer(buf));
  const rough=id.includes('balloon')&&!id.includes('pump')?.34:id==='basketball'?.78:id==='ice-cube'?.04:id==='torch'?.34:id==='sand-grains'?.83:id==='tissue'?.92:id==='sponge'?.96:.52;
  prim.setMaterial(doc.createMaterial(id).setBaseColorFactor(id==='sponge'?[...token('en-light').lerp(P.hot,.10).multiplyScalar(.60).toArray(),1]:[1,1,1,1]).setRoughnessFactor(rough).setMetallicFactor(['torch','bicycle-wheel'].includes(id)?.65:0).setAlphaMode(id==='ice-cube'?'BLEND':'OPAQUE').setDoubleSided(id==='tissue'||id==='sponge').setExtras({atlasSurface:true}));
  scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(prim)).setTranslation(at).setExtras({closed:!['tissue','bicycle-wheel'].includes(id)}));
  // Bench and side table keep main's wood tint over their token vertex colours (acceptance 2026-11-09: a white bench vanished into the paper plate).
  p.mesh=id;p.material=id==='bench'?{color:'wood',tint:'#d3b58b'}:id==='side-table'?{color:'wood',tint:'#c9a57a'}:{color:'plastic',tint:'#ffffff'};delete p.primitive;delete p.extra;
  after.byPart[id]={triangles:g.getAttribute('position').count/3,draws:1};for(const x of gs)x.dispose();g.dispose();
 }
 const staticIds=['balance-a','balance-b','beam-balance','syringe-rack','plunger-air','plunger-water','plunger-sand','sand-heap','sugar-heap','balance-stand'];
 const tokens={};for(const m of css.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi))if(!tokens[m[1]])tokens[m[1]]=m[2];
 for(const id of staticIds){
  const p=data.parts.find(p=>p.id===id),parsed=originalParsed.parts.find(x=>x.id===id),at=p.primitive.at,slots=partMaterialSlots(parsed),gs=[];
  for(const piece of partPieces(parsed)){
   const slot=slots[piece.slot??0],look=resolveMaterialLook(slot.color,tokens,'paper',slot.tint);
   if(look.opacity<1)throw new Error(`Static bake attempted on transparent ${id}`);
   for(const matrix of piece.matrices??[null]){const g=piece.geometry.clone();if(matrix)g.applyMatrix4(matrix);g.translate(...at);paint(g,new Color(look.color));gs.push(g.index?g.toNonIndexed():g);}
  }
  const g=mergeGeometries(gs);g.translate(...at.map(x=>-x));const pr=doc.createPrimitive();
  for(const [a,b] of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']])pr.setAttribute(b,doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.getAttribute(a).array)).setBuffer(buf));
  pr.setMaterial(doc.createMaterial(id).setBaseColorFactor([1,1,1,1]).setRoughnessFactor(id==='beam-balance'?.34:.58).setMetallicFactor(id==='beam-balance'?.65:.05).setExtras({atlasSurface:true}));
  scene.addChild(doc.createNode(id).setMesh(doc.createMesh(id).addPrimitive(pr)).setTranslation(at).setExtras({closed:true}));
  after.byPart[id]={triangles:g.getAttribute('position').count/3,draws:1};p.mesh=id;p.material={color:'plastic',tint:'#ffffff'};delete p.primitive;delete p.extra;for(const x of gs)x.dispose();g.dispose();
 }
 await MeshoptEncoder.ready;await MeshoptSimplifier.ready;await doc.transform(weld());
 for(const m of doc.getRoot().listMeshes()){
  const id=m.getName();if(id==='bicycle-wheel'||staticIds.includes(id))continue;
  for(const p of m.listPrimitives()){
   const dense=id==='sponge'?{position:p.getAttribute('POSITION').getArray(),normal:p.getAttribute('NORMAL').getArray(),color:p.getAttribute('COLOR_0').getArray()}:null;
   const attributes=['sponge','ice-cube'].includes(id)?new Float32Array(p.getAttribute('NORMAL').getCount()*4):null;if(attributes)for(let i=0;i<p.getAttribute('NORMAL').getCount();i++){attributes.set(p.getAttribute('NORMAL').getElement(i,[0,0,0]),i*4);attributes[i*4+3]=id==='ice-cube'?p.getAttribute('COLOR_0').getElement(i,[0,0,0,0])[3]:p.getAttribute('COLOR_0').getElement(i,[0,0,0])[0];}
   const layer=p.getAttribute('_LAYER');
   const normalAware=attributes?{...MeshoptSimplifier,simplify:(indices,positions,stride,target,_error,flags)=>{
    if(id==='sponge')return MeshoptSimplifier.simplifyWithAttributes(indices,positions,stride,attributes,4,[1,1,1,.25],null,target,.1,[...flags,'RegularizeLight']);
    const output=[];let maxError=0;for(let rank=0;rank<5;rank++){const selected=[];for(let i=0;i<indices.length;i+=3)if(Math.round(layer.getScalar(indices[i]))===rank)selected.push(indices[i],indices[i+1],indices[i+2]);
     const [reduced,error]=MeshoptSimplifier.simplifyWithAttributes(new Uint32Array(selected),positions,stride,attributes,4,rank===4?[2,2,2,4]:[.1,.1,.1,.4],null,[400,150,500,500,2600][rank]*3,rank===4?.008:.1,rank===4?[]:flags);output.push(...reduced);maxError=Math.max(maxError,error);}
    return [new Uint32Array(output),maxError];
   }}:MeshoptSimplifier;

   simplifyPrimitive(p,{simplifier:normalAware,ratio:id==='sponge'?Math.min(1,30000/(p.getIndices().getCount()/3)):id==='tissue'?.22:id==='ice-cube'?.28:.32,error:id==='basketball'?.00012:id==='sponge'?.0012:id==='tissue'?.0035:id==='ice-cube'?.0015:id==='sand-grains'?.00018:id==='balloon-long'?.0002:id==='balloon-round'?.0003:.00045,lockBorder:id!=='sponge'});
   if(dense){refineSponge(p,dense,doc,buf);await spongeMicroAO(doc,p,buf);}
  }
 }

 // Six-bit colour precision before the required eight-bit glTF container.
 // This retains all physical relief while improving entropy of painted grain.
 for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives()){const a=p.getAttribute('COLOR_0');a.setArray(new Float32Array(a.getArray()).map(v=>Math.round(v*63)/63));}
 for(const m of doc.getRoot().listMeshes())if(['sponge','tissue','ice-cube'].includes(m.getName()))for(const p of m.listPrimitives()){
  const precision=m.getName()==='sponge'?31:m.getName()==='ice-cube'?127:31;
  const normal=p.getAttribute('NORMAL');normal.setArray(new Float32Array(normal.getArray()).map(v=>Math.round(v*precision)/precision));
  if(m.getName()==='sponge'){const color=p.getAttribute('COLOR_0');color.setArray(new Float32Array(color.getArray()).map(v=>[.055,.3,.65,1].reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a)));}
  const pos=p.getAttribute('POSITION');pos.setArray(new Float32Array(pos.getArray()).map(v=>Math.round(v/(m.getName()==='sponge'?.00005:.00003))*(m.getName()==='sponge'?.00005:.00003)));
 }
 await doc.transform(dedup(),meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:13,quantizeNormal:8,quantizeColor:8,quantizeTexcoord:10}));
 for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives()){const uv=p.getAttribute('TEXCOORD_0');if(uv)uv.setArray(Uint8Array.from(uv.getArray(),v=>Math.round(v/65535*255))).setNormalized(true);const ix=p.getIndices(),keep=[];for(let i=0;i<ix.getCount();i+=3){const a=ix.getScalar(i),b=ix.getScalar(i+1),c=ix.getScalar(i+2);if(a!==b&&b!==c&&a!==c)keep.push(a,b,c);}ix.setArray(new Uint32Array(keep));}
 // Meshopt may reorder disconnected islands. Keep glaze/dish, inclusions,
 // fracture films, then the exterior windows in the actual shipping index order.
 const icePrim=doc.getRoot().listMeshes().find(m=>m.getName()==='ice-cube').listPrimitives()[0],layer=icePrim.getAttribute('_LAYER'),iceIx=icePrim.getIndices(),iceTriangles=[];
 for(let i=0;i<iceIx.getCount();i+=3){const ids=[0,1,2].map(k=>iceIx.getScalar(i+k)),rank=layer.getScalar(ids[0]);iceTriangles.push({ids,rank});}iceTriangles.sort((a,b)=>a.rank-b.rank);iceIx.setArray(new Uint32Array(iceTriangles.flatMap(t=>t.ids)));icePrim.setAttribute('_LAYER',null);layer.dispose();
 for(const n of doc.getRoot().listNodes()){const t=n.getMesh()?.listPrimitives().reduce((s,p)=>s+p.getIndices().getCount()/3,0);if(t)after.byPart[n.getName()].triangles=t;}
 after.triangles=Object.values(after.byPart).reduce((s,x)=>s+x.triangles,0);after.draws=Object.values(after.byPart).reduce((s,x)=>s+x.draws,0);
 const topicEncoder={...MeshoptEncoder,encodeGltfBuffer:(source,count,size,mode)=>mode==='ATTRIBUTES'?MeshoptEncoder.encodeVertexBufferLevel(source,count,size,3,0):MeshoptEncoder.encodeGltfBuffer(source,count,size,mode)};
 const bytes=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':topicEncoder}).writeBinary(doc);
 fs.writeFileSync('scripts/geo/states-of-matter/evidence/metrics.json',JSON.stringify({before,after:{...after,glbBytes:bytes.length}},null,2));console.log('metrics',after.triangles,after.draws,bytes.length);fs.writeFileSync('/private/tmp/states-of-matter-candidate.glb',bytes);fs.writeFileSync('scripts/geo/states-of-matter/evidence/candidate-parts.json',JSON.stringify({...data,model:'/models/states-of-matter.glb'}));if(process.env.ATLAS_DRAFT==='1')return true;if(after.triangles>350_000)throw new Error(`Triangle budget exceeded: ${after.triangles}`);if(bytes.length>1_500_000)throw new Error(`GLB ${bytes.length} bytes exceeds budget`);fs.mkdirSync('public/models',{recursive:true});fs.writeFileSync('public/models/states-of-matter.glb',bytes);data.model='/models/states-of-matter.glb';
 fs.writeFileSync('scripts/geo/states-of-matter/evidence/metrics.json',JSON.stringify({before,after:{...after,glbBytes:bytes.length}},null,2));console.log(`Rebuild ${after.triangles} triangles, ${after.draws} estimated draws, GLB ${bytes.length} bytes`);
}

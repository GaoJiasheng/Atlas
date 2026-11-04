/** Original anatomical reconstruction from Gray 904, 916–918 and 923.
 * Continuous relief auricle and implicit, blended ossicle surfaces: no scanned assets.
 * Coordinates follow this topic's enlarged, independently scaled teaching stations.
 */
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, MeshBasicMaterial, Vector3 } from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import { Document, NodeIO } from '@gltf-transform/core';
import { MeshoptSimplifier } from 'meshoptimizer';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
export type V3 = [number, number, number];
type Part = Record<string, any>;
const bi = (en: string, zh: string) => ({en,zh});
const vec = (p: V3) => new Vector3(...p);
const curve = (p: V3[], closed = false) => new CatmullRomCurve3(p.map(vec), closed, 'centripetal');
const tube = (at: V3, path: V3[], radius: number | number[], more: Part = {}): Part => ({kind:'sweep', at,path,radius,radial:24,segments:100,caps:'round',color:'tissue',tint:'token:bone',...more});
const f = (n: number) => Number(n.toFixed(6));
const sampled = (p: V3[], n=80) => curve(p).getPoints(n).map(v=>v.toArray() as V3);

/** One annulus with a real meatus opening. Front/back meet in a rounded free edge.
 * Folds are displaced into the SAME skin, not tubes laid on a flat plaque. */
export function pinnaMesh(): BufferGeometry {
  const outline = curve([[.19,.47,0],[.13,.70,0],[-.04,.83,0],[-.24,.80,0],[-.41,.62,0],[-.49,.34,0],[-.48,.02,0],[-.40,-.30,0],[-.24,-.60,0],[-.08,-.73,0],[.07,-.67,0],[.12,-.50,0],[.075,-.33,0],[.17,-.22,0],[.21,-.05,0],[.18,.18,0]],true);
  const ridgePaths = [
    {p:[[-.20,-.39,0],[-.29,-.13,0],[-.27,.12,0],[-.15,.34,0],[-.12,.57,0]] as V3[],w:.046,h:.105},
    {p:[[-.16,.33,0],[-.02,.45,0],[.05,.61,0]] as V3[],w:.038,h:.092},
    {p:[[-.24,.20,0],[-.12,.15,0],[.03,.13,0],[.12,.19,0]] as V3[],w:.037,h:.075},
  ].map(r=>({...r,p:sampled(r.p,70)}));
  function dist(x:number,y:number,p:V3[]) {
    let d=Infinity; for(let i=0;i<p.length-1;i++) {const a=p[i]!,b=p[i+1]!,dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));d=Math.min(d,(x-a[0]-t*dx)**2+(y-a[1]-t*dy)**2);}return Math.sqrt(d);
  }
  const N=208, R=96, pos:number[]=[], uv:number[]=[], ix:number[]=[];
  const cx=.075, cy=-.16;
  for(let side=0;side<2;side++) for(let j=0;j<=R;j++) for(let i=0;i<N;i++) {
    const t=i/N, r=(1-Math.cos(Math.PI*j/R))/2, edge=outline.getPoint(t);
    // Inner opening is aligned to the conchal floor, not the silhouette centroid.
    const a=2*Math.PI*t, hx=cx+.065*Math.cos(a), hy=cy+.080*Math.sin(a);
    const x=hx*(1-r)+edge.x*r, y=hy*(1-r)+edge.y*r;
    const concha=Math.exp(-(((x-.015)/.16)**2+((y+.10)/.24)**2));
    const lobule=Math.exp(-(((x+.025)/.17)**2+((y+.58)/.19)**2));
    const helix=.13*Math.exp(-(((r-.915)/.07)**2))*(1-.70*lobule);
    const scapha=-.032*Math.exp(-(((r-.73)/.12)**2))*(1-lobule);
    let z=-.10-.12*concha+helix+scapha+.085*lobule;
    for(const ridge of ridgePaths) z+=ridge.h*Math.exp(-((dist(x,y,ridge.p)/ridge.w)**2));
    // Cartilage ends above the lobule. Smoothly remove ridge endpoint domes
    // and the scapha/helix trough here: fat/skin form one soft convex pad.
    const q=Math.max(0,Math.min(1,(-y-.22)/.14)),soft=q*q*(3-2*q);
    const lobeFront=-.10+.092*Math.exp(-(((x+.10)/.23)**2+((y+.55)/.25)**2));
    z=z*(1-soft)+lobeFront*soft;
    // Tragus and antitragus, separated by the intertragic notch.
    z+=.15*Math.exp(-(((x-.15)/.051)**2+((y+.115)/.09)**2));
    z+=(1-soft)*.115*Math.exp(-(((x+.015)/.075)**2+((y+.35)/.070)**2));
    // Blend relief down at the free edge; rounded thickness instead of an extruded wall.
    const edgeT=Math.max(0,(r-.90)/.10),blend=Math.sqrt(Math.max(0,1-edgeT*edgeT)), back=-.175-.06*concha-.025*lobule;
    z=side===0 ? -.125+(z+.125)*blend : -.125+(back+.125)*blend;
    if(side===1) z-=.065*Math.sqrt(Math.max(0,1-r*r));
    pos.push(.90+x,y,z); uv.push(t,r);
  }
  const stride=(R+1)*N;
  for(let s=0;s<2;s++) for(let j=0;j<R;j++) for(let i=0;i<N;i++) {
    const a=s*stride+j*N+i,b=s*stride+j*N+(i+1)%N,c=b+N,d=a+N;
    if(s===0) ix.push(a,d,b,b,d,c); else ix.push(a,b,d,b,c,d);
  }
  // Wall at meatus, joining conchal depression to posterior auricular skin.
  for(let i=0;i<N;i++) {const a=i,b=(i+1)%N;ix.push(a,stride+a,b,b,stride+a,stride+b);}
  const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(new Float32Array(pos),3));
  g.setAttribute('uv',new BufferAttribute(new Float32Array(uv),2));g.setIndex(ix);const welded=mergeVertices(g,1e-6);welded.computeVertexNormals();g.dispose();return welded;
}

type Field = (x:number,y:number,z:number)=>number;
function ellipsoid(c:V3,r:V3): Field {return (x,y,z)=>(Math.sqrt(((x-c[0])/r[0])**2+((y-c[1])/r[1])**2+((z-c[2])/r[2])**2)-1)*Math.min(...r);}
function branch(p:V3[], radii:number[], flat=1): Field {
  const c=curve(p), points=c.getPoints(60);
  return (x,y,z)=>{
    let best=Infinity;
    for(let i=0;i<points.length-1;i++) {
      const a=points[i]!,b=points[i+1]!,dx=b.x-a.x,dy=b.y-a.y,dz=(b.z-a.z)/flat;
      const t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy+(z-a.z)/flat*dz)/(dx*dx+dy*dy+dz*dz)));
      const u=(i+t)/(points.length-1)*(radii.length-1),k=Math.min(radii.length-2,Math.floor(u));
      const r=radii[k]!+(radii[k+1]!-radii[k]!)*(u-k);
      best=Math.min(best,Math.hypot(x-a.x-t*dx,y-a.y-t*dy,(z-a.z)/flat-t*dz)-r);
    }return best;
  };
}
function union(fields:Field[],k=.014):Field {return (x,y,z)=>fields.reduce((a,g)=>{const b=g(x,y,z),h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;},1e5);}
function implicit(field:Field,lo:V3,hi:V3,n=64):BufferGeometry {
  const mc=new MarchingCubes(n,new MeshBasicMaterial(),false,false,65000);mc.isolation=0;
  for(let z=0;z<n;z++) for(let y=0;y<n;y++) for(let x=0;x<n;x++) {
    mc.field[z*n*n+y*n+x]=-field(lo[0]+(hi[0]-lo[0])*x/n,lo[1]+(hi[1]-lo[1])*y/n,lo[2]+(hi[2]-lo[2])*z/n);
  }
  mc.update();
  const count=mc.geometry.drawRange.count;
  const p=mc.geometry.getAttribute('position'),norm=mc.geometry.getAttribute('normal');
  const positions=new Float32Array(count*3),normals=new Float32Array(count*3);
  for(let i=0;i<count;i++) for(let j=0;j<3;j++) {
    positions[i*3+j]=lo[j]!+(p.array[i*3+j]!+1)*.5*(hi[j]!-lo[j]!);
    normals[i*3+j]=norm.array[i*3+j]!/(hi[j]!-lo[j]!);
  }
  const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(positions,3));g.setAttribute('normal',new BufferAttribute(normals,3));g.normalizeNormals();
  mc.geometry.dispose();(mc.material as MeshBasicMaterial).dispose();return g;
}
export function ossicleMeshes():Record<string,BufferGeometry> {
  const malleus=union([
    ellipsoid([1.685,.27,-.065],[.097,.122,.077]),
    ellipsoid([1.745,.26,-.065],[.041,.072,.068]),
    branch([[1.66,.19,-.065],[1.637,.11,-.055],[1.602,.040,-.045],[1.578,-.012,-.045],[1.566,-.047,-.045]],[.048,.040,.028,.012],.62),
    branch([[1.64,.12,-.055],[1.586,.14,-.010],[1.556,.121,.005]],[.036,.025,.006]),
    branch([[1.65,.12,-.09],[1.735,.126,-.15],[1.76,.13,-.16]],[.022,.014,.003]),
  ]);
  const incus=union([
    ellipsoid([1.884,.275,-.065],[.112,.096,.073]),
    branch([[1.89,.30,-.065],[1.96,.325,-.083],[2.037,.292,-.095]],[.065,.043,.013],.72),
    branch([[1.893,.245,-.055],[1.966,.142,-.049],[2.015,.027,-.047],[2.075,-.046,-.050],[2.125,-.040,-.050]],[.057,.041,.025,.019,.026],.77),
    ellipsoid([2.127,-.04,-.05],[.022,.034,.030]),
  ]);
  const stapes=union([
    ellipsoid([2.155,-.040,-.050],[.039,.035,.032]),
    branch([[2.17,-.04,-.05],[2.213,.023,-.047],[2.29,.053,-.045],[2.385,.048,-.045]],[.027,.019,.017,.023],.8),
    branch([[2.17,-.04,-.05],[2.224,-.111,-.054],[2.31,-.136,-.053],[2.385,-.123,-.05]],[.027,.022,.020,.024],.8),
    ellipsoid([2.395,-.040,-.050],[.017,.114,.066]),
  ],.008);
  return {
    malleus:implicit((x,y,z)=>Math.max(malleus(x,y,z),x-1.774),[1.50,-.19,-.19],[1.80,.42,.045],64),
    incus:implicit(incus,[1.73,-.10,-.16],[2.17,.39,.04],64),
    stapes:implicit(stapes,[2.105,-.17,-.13],[2.43,.09,.035],64),
  };
}

/** Continuous meatal bend with a gradually opened longitudinal wall. The
 * cartilaginous portal stays complete; the medial cut exposes the drum. */
export function canalMesh(): BufferGeometry {
  const c=curve(canalPath), rows=64, cols=24;
  const pos:number[]=[], ix:number[]=[];
  const radii=[.070,.10,.125,.12,.17];
  for(let side=0;side<2;side++) for(let j=0;j<=rows;j++) {
    const t=j/rows, centre=c.getPoint(t), tangent=c.getTangent(t).normalize();
    const n=new Vector3(0,1,0).addScaledVector(tangent,-tangent.y).normalize();
    const b=new Vector3().crossVectors(tangent,n).normalize();
    const k=Math.min(3,Math.floor(t*4)),r0=radii[k]!+(radii[k+1]!-radii[k]!)*(t*4-k),r=r0+(side===0?.024:0);
    const q=Math.max(0,Math.min(1,(t-.28)/.25)),gap=(q*q*(3-2*q))*Math.PI*132/180;
    for(let i=0;i<=cols;i++) {
      const a=Math.PI/2+gap/2+i/cols*(2*Math.PI-gap);
      const shapeY=1+.14*(1-t),shapeB=1-.07*(1-t);
      const p=centre.clone().addScaledVector(n,r*Math.cos(a)*shapeY).addScaledVector(b,r*Math.sin(a)*shapeB);
      pos.push(p.x,p.y,p.z);
    }
  }
  const stride=(rows+1)*(cols+1);
  for(let side=0;side<2;side++) for(let j=0;j<rows;j++) for(let i=0;i<cols;i++) {
    const a=side*stride+j*(cols+1)+i,b=a+1,d=a+cols+1,c=d+1;
    if(side===0) ix.push(a,b,d,b,c,d);else ix.push(a,d,b,b,d,c);
  }
  // Rounded wall-thickness rims; no cap spans the lumen.
  for(let j=0;j<rows;j++) for(const i of [0,cols]) {
    const a=j*(cols+1)+i,b=a+cols+1;
    if(i===0) ix.push(a,b,a+stride,b,b+stride,a+stride);else ix.push(a,a+stride,b,b,a+stride,b+stride);
  }
  for(const j of [0,rows]) for(let i=0;i<cols;i++) {
    const a=j*(cols+1)+i,b=a+1;
    if(j===0) ix.push(a,a+stride,b,b,a+stride,b+stride);else ix.push(a,b,a+stride,b,b+stride,a+stride);
  }
  const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(new Float32Array(pos),3));g.setIndex(ix);
  const welded=mergeVertices(g,1e-6);welded.computeVertexNormals();g.dispose();return welded;
}

export const EAR_MM=.052;
export const INCUS_JOINT:V3=[1.774,.27,-.065];
export const INCUS_SCALE=.69;
export const incusPoint=(p:V3):V3=>p.map((v,i)=>f(INCUS_JOINT[i]!+(v-INCUS_JOINT[i]!)*INCUS_SCALE)) as V3;
export const STAPES_HEAD:V3=[2.155,-.04,-.05];
export const stapesPoint=(p:V3):V3=>p.map((v,i)=>f(incusPoint(STAPES_HEAD)[i]!+(v-STAPES_HEAD[i]!)*.5)) as V3;
export const OVAL_WINDOW=stapesPoint([2.415,-.04,-.05]);
export const INNER_SCALE=.4;
export const innerPoint=(p:V3):V3=>p.map((v,i)=>f(OVAL_WINDOW[i]!+(v-[2.415,-.04,-.05][i]!)*INNER_SCALE)) as V3;

export const canalPath:V3[]=[[.975,-.16,-.20],[.99,-.15,-.31],[1.11,-.105,-.28],[1.24,-.068,-.19],[1.36,-.075,-.10],[1.51,-.065,-.045]];
export const coilPath:V3[]=Array.from({length:111},(_,i)=>{const t=i/110,a=Math.PI+t*Math.PI*5,r=.47*(1-t)+.035;return [f(2.97+r*Math.cos(a)),f(-.04+r*Math.sin(a)),f(-.18+.40*t)];});
// A right-handed orthonormal frame, two vertical planes and one horizontal plane.
const u:V3=[Math.SQRT1_2,0,Math.SQRT1_2],v:V3=[0,1,0],w:V3=[-Math.SQRT1_2,0,Math.SQRT1_2];
export const vestibule:V3=[2.48,.205,-.255];
export const canalPlanes=[{name:'anterior',a:u,b:v,r:.36,h:.42},{name:'posterior',a:w,b:v,r:.40,h:.39},{name:'lateral',a:u,b:w,r:.37,h:.36}];
export const balancePaths=canalPlanes.map(({a,b,r,h})=>Array.from({length:65},(_,i)=>{
  const theta=-Math.PI/2+.34+i/64*(2*Math.PI-.68);
  return [0,1,2].map(j=>f(vestibule[j]!+a[j]!*r*Math.cos(theta)+b[j]!*h*(1+Math.sin(theta)))) as V3;
}));

export function polishEar(parts:Part[], data?:{flows:Part[],animations:Part[]}) {
  const part=(id:string)=>parts.find(p=>p.id===id)!;
  for(const id of ['pinna','canal','malleus','incus','stapes']) {
    const p=part(id);delete p.primitive;delete p.extra;p.mesh=id;p.material={color:'tissue',tint:['pinna','canal'].includes(id)?'token:muscle-1':'token:bone'};
  }
  part('pinna').detail=bi('The pinna is the visible outer part of the ear. Its curled rim (helix), inner ridges, bowl (concha), small flaps and soft lobe lead towards the ear canal. [S7]\n\nThe sculpted shape follows Gray’s anatomy drawings. Skin details and differences between people are left out. The eye and ear are enlarged by different amounts. [S31]','耳廓是外面看得见的耳部。卷起的外缘（耳轮）、内侧隆起、碗状的耳甲腔、小软骨片和柔软的耳垂通向外耳道。[S7]\n\n雕塑外形依据格雷解剖图，省略皮肤细节和个体差异。眼睛与耳朵的放大程度不同。[S31]');
  part('canal').detail=bi('The ear canal runs inwards from the pinna in a gentle S-bend and ends at the slanted eardrum. It does not extend through the middle ear into the cochlea. [S7]\n\nThe front wall is cut open so you can see the air passage. The path is shortened for display. Keep objects out of the ear canal. [S18, S31]','外耳道从耳廓向内微微弯成 S 形，止于斜置的鼓膜，不会穿过中耳通入耳蜗。[S7]\n\n前侧管壁切开，让通道显露出来。路径为展示而缩短。不要把物品伸进耳道。[S18, S31]');
  // Closed thin conical membrane, with the inward umbo at the manubrium tip.
  const drum=part('eardrum');drum.primitive={kind:'lathe',at:[1.51,-.065,-.045],profile:[[0,.057],[.045,.045],[.12,.018],[.19,-.009],[.226,-.020],[.228,-.015],[.19,-.003],[.12,.024],[.045,.051],[0,.063]],segments:64,rotation:[0,0,-72],scale:[1,1,.80],color:'membrane',tint:'token:bone'};
  drum.extra=[{kind:'lathe',at:[1.51,-.065,-.045],profile:[[.220,-.024],[.234,-.021],[.236,-.012],[.228,-.006],[.220,-.024]],segments:64,rotation:[0,0,-72],scale:[1,1,.80],color:'tissue',tint:'token:bone'}];
  part('malleus').detail=bi('The malleus has a rounded head joined to the incus and a tapering handle fixed along the eardrum, ending at its centre. It is one of the three ossicles. [S7, S8]\n\nThe shape follows Gray’s drawing of the bone. It rocks slowly to show movement along the chain. This does not measure how much the bones amplify movement or the delay between them. [S31]','锤骨的圆头连接砧骨，渐细的柄贴着鼓膜，一直伸到鼓膜中心，是三块听小骨之一。[S7, S8]\n\n外形依据格雷解剖图。它缓慢摆动，显示骨链怎样传递运动，不测量听骨放大运动的倍数或彼此间的延迟。[S31]');
  part('incus').detail=bi('The incus is the middle bone in the chain. Its body joins the malleus. A short projection points backwards, and a long curved projection reaches the head of the stapes. [S7, S8]\n\nThe shape follows Gray’s drawing of the bone. Small joints and ligaments are left out. [S31]','砧骨位于骨链中间，体部连接锤骨。短突向后伸出，弯曲的长突伸到镫骨头。[S7, S8]\n\n外形依据格雷解剖图，省略细小关节与韧带。[S31]');
  const co=part('cochlea-shell');co.primitive=tube([0,0,0],coilPath,coilPath.map((_,i)=>f(.145-.07*i/110)),{radial:20,segments:180,caps:'round',hollow:.016});co.extra=[{kind:'lathe',at:[2.97,-.04,0],profile:[[0,-.25],[.08,-.245],[.14,-.23],[.17,-.16],[.165,-.10],[.14,0],[.12,.08],[.09,.16],[.05,.21],[.02,.235],[0,.24]],rotation:[90,0,0],segments:48,color:'tissue',tint:'token:bone'}];
  co.detail=bi('The cochlea is the curled hearing structure in the inner ear: a cone-shaped coil of about two and a half turns. Movement at the oval window disturbs its fluid and sends a wave along the basilar membrane. [S7]\n\nThe coil is shown closed from outside. A separate enlarged strip shows the membrane and sensory cells. [S31]','耳蜗是内耳中卷曲的听觉结构，像约两圈半的锥形螺旋。卵圆窗处的运动扰动液体，使波沿基底膜传播。[S7]\n\n螺旋从外面看是封闭的。独立放大条带显示膜与感受细胞。[S31]');
  const bal=part('balance-context');
  const loops=balancePaths.map(path=>tube([0,0,0],path,path.map((_,j)=>f(.034+.035*Math.exp(-(((j-5)/4)**2)))),{segments:80,radial:16,tint:'token:bone'}));
  bal.primitive=loops[0];bal.extra=[...loops.slice(1),tube([0,0,0],[[2.46,-.04,-.18],[2.48,.10,-.24],vestibule,[2.49,.29,-.25]],[.085,.14,.14,.08],{radial:20,segments:32,section:{flat:.85}})];
  bal.connects=['cochlea-shell','oval-window'];
  bal.detail=bi('The three semicircular canals lie beside the cochlea, each in a different direction, roughly at right angles to the others. Each has one swollen end (ampulla), and all join a chamber called the vestibule. They help with balance, a different role from hearing. [S8]\n\nThe model sets the canals at exact right angles to make the three directions clear. It does not simulate balance or fluid responses. [S31]','三条半规管位于耳蜗旁，方向各不相同，彼此大约成直角。每条有一个膨大的末端（壶腹），都连到称为前庭的腔室。它们帮助维持平衡，作用与听觉不同。[S8]\n\n模型让三条管严格成直角，方便看清三个方向，不模拟平衡或液体响应。[S31]');
  // An attached funnel at the anterior-inferior middle-ear wall, then the narrow
  // isthmus and widening pharyngeal cartilage; rear half opened for context.
  part('eustachian-tube').extra=[tube([0,0,0],[[1.54,-.04,-.16],[1.77,-.03,-.19],[2.05,-.02,-.21],[2.38,-.04,-.20]],[.23,.245,.22,.15],{hollow:.022,section:{u:170},up:[0,0,-1],caps:'none',segments:40,radial:16,tint:'token:muscle-1'})];
  part('eustachian-tube').detail=bi('The Eustachian tube connects the middle ear to the throat and helps balance pressure across the eardrum. Hearing signals reach the brain through the auditory nerve. [S8]\n\nA piece of the middle-ear floor shows where the tube starts. It narrows, then widens towards the throat. The model does not simulate opening, swallowing or pressure changes. [S31]','咽鼓管连接中耳与咽部，帮助平衡鼓膜两侧气压。听觉信号经听神经传向大脑。[S8]\n\n一小块中耳底壁显示管道起点。管道先变窄，再朝咽部变宽。不模拟开放、吞咽或气压变化。[S31]');
  part('eustachian-tube').primitive=tube([0,0,0],[[1.77,-.15,-.17],[1.85,-.23,-.18],[1.99,-.40,-.22],[2.15,-.64,-.24],[2.31,-.83,-.23]],[.15,.12,.075,.085,.12],{hollow:.022,section:{u:240},up:[0,0,-1],caps:'none',segments:48,radial:20,tint:'token:muscle-1'});

  // All labyrinth structures share ONE transform about the oval window.
  // Radii, walls and the modiolus scale with the paths, retaining the hollow coil.
  for(const id of ['cochlea-shell','balance-context']) for(const shape of [part(id).primitive,...(part(id).extra??[])]) {
    shape.at=innerPoint(shape.at);
    if(shape.path) shape.path=shape.path.map((p:V3)=>p.map(v=>f(v*INNER_SCALE)));
    if(shape.radius) shape.radius=Array.isArray(shape.radius)?shape.radius.map((r:number)=>f(r*INNER_SCALE)):f(shape.radius*INNER_SCALE);
    if(shape.hollow) shape.hollow=f(shape.hollow*INNER_SCALE);
    if(shape.profile) shape.profile=shape.profile.map((p:number[])=>p.map(v=>f(v*INNER_SCALE)));
  }
  const window=part('oval-window').primitive;
  window.at=OVAL_WINDOW;window.profile=window.profile.map((p:number[])=>p.map(v=>f(v*.5)));
  // Keep the partial middle-ear floor against the relocated vestibule/window.
  const wall=part('eustachian-tube').extra[0];
  wall.path=wall.path.map((p:V3)=>[f(1.54+(p[0]-1.54)*(OVAL_WINDOW[0]-1.54)/(2.415-1.54)),p[1],p[2]]);
  // The nerve must still emerge from the cochlear core after resizing.
  const nerve=part('auditory-nerve').primitive;
  const nerveOldAt:V3=[3.01,.12,-.22];
  const nervePath:V3[]=[nerveOldAt,...nerve.path.slice(1).map((p:V3)=>p.map((v,i)=>v+nerveOldAt[i]!) as V3)].map(innerPoint);
  nerve.at=nervePath[0];nerve.path=nervePath.map(p=>p.map((v,i)=>f(v-nervePath[0]![i]!)));nerve.radius=nerve.radius.map((r:number)=>f(r*INNER_SCALE));
  if(data) {
    const animation=data.animations.find(a=>a.target==='incus');if(animation?.pivot) animation.pivot=incusPoint(animation.pivot);
    const signal=data.flows.find(f=>f.id==='auditory-signal');
    if(signal) signal.path=[...signal.path.slice(0,4),...nervePath];
  }

}

export async function writeEarModel(extra:Record<string,BufferGeometry>={},labelPoints:Record<string,V3>={}) {
  const meshes:Record<string,BufferGeometry>={pinna:pinnaMesh(),canal:canalMesh(),...ossicleMeshes(),...extra};
  for(const [id,transform] of [['incus',incusPoint],['stapes',stapesPoint]] as const) {
    const a=meshes[id]!.getAttribute('position');
    for(let i=0;i<a.count;i++) a.setXYZ(i,...transform([a.getX(i),a.getY(i),a.getZ(i)]));
  }
  await MeshoptSimplifier.ready;
  // Error-bounded offline decimation retains the existing smooth normals.
  // 0.0003 scene unit is 0.006 mm at the middle-ear reconstruction scale.
  const budgets:Record<string,[number,number]>={pinna:[24000,.0005],canal:[6000,.0003],malleus:[5000,.0003],incus:[5000,.00025],stapes:[5000,.00015],
    'ciliary-ring':[8500,.00018],'iris-aperture-small':[14000,.00018],'iris-aperture-large':[14000,.00018]};
  const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('eyes-and-ears');
  doc.getRoot().getAsset().copyright='Atlas original procedural anatomy, 2026. CC0-1.0. Reference: public-domain Gray’s Anatomy plates; no source geometry or image textures.';
  for(const [name,source] of Object.entries(meshes)) {
    const g = mergeVertices(source, 1e-6);
    const before=(g.index?.count??g.getAttribute('position').count)/3;
    const budget=budgets[name];let error=0;
    if(budget&&g.index) {
      const result=MeshoptSimplifier.simplifyWithAttributes(new Uint32Array(g.index.array),new Float32Array(g.getAttribute('position').array),3,
        new Float32Array(g.getAttribute('normal').array),3,[.01,.01,.01],null,budget[0]*3,budget[1],['LockBorder','ErrorAbsolute']);
      g.setIndex(new BufferAttribute(result[0],1));error=result[1];
    }
    // Drop unused vertices after decimation (also reduces startup uploads).
    const indices=new Uint32Array(g.index!.array);
    const [remap,count]=MeshoptSimplifier.compactMesh(indices);
    for(const name of Object.keys(g.attributes)) {
      const a=g.getAttribute(name),array=new Float32Array(count*a.itemSize);
      for(let i=0;i<remap.length;i++) if(remap[i]!==0xffffffff)
        for(let j=0;j<a.itemSize;j++) array[remap[i]!*a.itemSize+j]=a.array[i*a.itemSize+j]!;
      g.setAttribute(name,new BufferAttribute(array,a.itemSize));
    }
    g.setIndex(new BufferAttribute(indices,1));
    const primitive=doc.createPrimitive();
    for(const [attr,semantic] of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0']] as const) {
      const a=g.getAttribute(attr);if(a) primitive.setAttribute(semantic,doc.createAccessor().setType(attr==='uv'?'VEC2':'VEC3').setArray(new Float32Array(a.array)).setBuffer(buffer));
    }
    if(g.index) primitive.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(g.index.array)).setBuffer(buffer));
    scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(primitive)).setExtras({closed:name!=='canal',sourceTriangles:before,triangles:g.index!.count/3,simplificationError:error,...(labelPoints[name]?{labelPoint:labelPoints[name]}:{})}));
  }
  const output=resolve(import.meta.dirname,'../../../public/models/eyes-and-ears.glb');mkdirSync(dirname(output),{recursive:true});
  await new NodeIO().write(output,doc);
  return meshes;
}

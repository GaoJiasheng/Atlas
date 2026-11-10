/** Original build-time sculptures. No photograph textures or runtime generation.
 * Organic forms use continuous isosurfaces and curved, tapered branch lofts.
 * Architecture is assembled from real wall openings, galleries and pilotis.
 */
import { BufferGeometry, Float32BufferAttribute, BoxGeometry, CylinderGeometry, CatmullRomCurve3, Vector3, Matrix4, Quaternion, Color, MeshBasicMaterial, Mesh, Raycaster, DoubleSide, ShapeUtils, Vector2 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import fs from 'node:fs';
import { bakeFlowPath } from '../../../src/engines/space-scene/lib/flow-curve';
export type V=[number,number,number];
const css=fs.readFileSync('src/theme/tokens.css','utf8');
const body=css.slice(css.indexOf(':root[data-theme="paper"] {'),css.indexOf('\n}',css.indexOf(':root[data-theme="paper"] {')));
export const palette=Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map(m=>[m[1]!,m[2]!]));
const col=(name:string,k=1)=>new Color(palette[name]!).multiplyScalar(k);
const v=(p:V)=>new Vector3(...p);
export class Sculpture {
 pieces:BufferGeometry[]=[];
 add(g:BufferGeometry,token='paper',gain=1){
  const c=col(token,gain),p=g.getAttribute('position'),a=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++)a.set(c.toArray(),i*3);
  g.setAttribute('color',new Float32BufferAttribute(a,3));g.deleteAttribute('uv');
  if(!g.index)g=mergeVertices(g,1e-6);this.pieces.push(g);return this;
 }
 box(at:V,size:V,token='paper',bevel=0,gain=1){const g=bevel&&Math.min(...size)>.025&&Math.max(...size)>.1?new RoundedBoxGeometry(...size,1,Math.min(bevel,...size.map(x=>x*.15))):new BoxGeometry(...size);return this.add(g.translate(...at),token,gain);}
 tube(points:V[],r0:number,r1:number,token='ink-2',segments=12,radial=10,caps:boolean|'end'=true){
  const curve=new CatmullRomCurve3(points.map(v)),frames=curve.computeFrenetFrames(segments,false),pos:number[]=[],ix:number[]=[];
  for(let j=0;j<=segments;j++){const p=curve.getPoint(j/segments),r=r0*(1-j/segments)+r1*j/segments;for(let i=0;i<=radial;i++){const a=i/radial*Math.PI*2,dir=frames.normals[j]!.clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[j]!,Math.sin(a));pos.push(...p.clone().addScaledVector(dir,r).toArray());}}
  for(let j=0;j<segments;j++)for(let i=0;i<radial;i++){const a=j*(radial+1)+i,b=a+radial+1;ix.push(a,b,a+1,a+1,b,b+1);}
  for(const end of (caps==='end'?[segments]:caps?[0,segments]:[])){const center=pos.length/3;pos.push(...curve.getPoint(end/segments).toArray());for(let i=0;i<radial;i++){const a=end*(radial+1)+i;if(end===0)ix.push(center,a+1,a);else ix.push(center,a,a+1);}}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(pos,3));g.setIndex(ix);g.computeVertexNormals();
  const normals=g.getAttribute('normal');for(let j=0;j<=segments;j++){
   const a=j*(radial+1),b=a+radial,n=new Vector3().fromBufferAttribute(normals,a).add(new Vector3().fromBufferAttribute(normals,b)).normalize();
   normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z);
  }
  return this.add(g,token);
 }
 cylinder(at:V,r:number,h:number,token='neutral',axis:V=[0,1,0],rTop=r){const g=new CylinderGeometry(rTop,r,h,32,1);g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),v(axis).normalize()));return this.add(g.translate(...at),token);}
 finish(){const g=mergeGeometries(this.pieces);this.pieces.forEach(x=>x.dispose());return g;}
}
function rng(seed:number){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
const smoothMin=(a:number,b:number,k:number)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
/** Height shading baked into the cloud meshes: dark enough at the base and crown to read on paper as well as on the dark plate. */
export const CLOUD_AT:Record<'cumulus'|'rain-cloud',V>={cumulus:[-2.12,1.055,-.25],'rain-cloud':[1.03,1.0,-.61]};
export function cloudColour(y:number,rain:boolean){const t=Math.max(0,Math.min(1,(y-CLOUD_AT[rain?'rain-cloud':'cumulus'][1])/(rain?.33:.6)));return col('paper',(rain?.08:.15)+Math.sqrt(t)*(rain?.31:.43));}
export function cloud(rain=false,round=1){
 const n=rain?100:88,mc=new MarchingCubes(n,new MeshBasicMaterial(),false,false,150000);mc.isolation=0;
 const rand=rng(rain?83:17),lobes:{p:V;r:V}[]=[];
 // Interpenetrating unequal rising turrets, blended into one condensation body.
 const roots=rain?[[-.78,.06,0,.28],[-.37,.12,.03,.34],[.03,.18,-.04,.38],[.44,.10,.02,.32],[.79,.05,0,.26]]:[[-.55,.10,.01,.27],[-.16,.18,.02,.37],[.27,.09,-.04,.29],[.55,.02,0,.21],[-.04,.52,-.03,.23]];
 for(const [x,y,z,r]of roots as [number,number,number,number][]){lobes.push({p:[x,y,z],r:[r*1.05,r,r*.84]});for(let j=0;j<12;j++){const a=rand()*Math.PI*2,b=rand()*1.9-.4,s=r*(.24+rand()*.14);lobes.push({p:[x+Math.cos(a)*Math.cos(b)*r*.97,y+Math.sin(b)*r*.95,z+Math.sin(a)*Math.cos(b)*r*.82],r:[s,s*(.8+rand()*.4),s]});}}
 const lo:V=[-1.2,-.18,-.6],hi:V=[1.2,1.0,.6];
 for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const px=lo[0]+(hi[0]-lo[0])*x/n,py=lo[1]+(hi[1]-lo[1])*y/n,pz=lo[2]+(hi[2]-lo[2])*z/n;let d=99;
  for(const l of lobes){const q=Math.sqrt(((px-l.p[0])/l.r[0])**2+((py-l.p[1])/l.r[1])**2+((pz-l.p[2])/l.r[2])**2)-1;d=smoothMin(d,q*Math.min(...l.r),.022);}
  // Small-scale cauliflower undulations belong to the surface, never separate spheres.
  d+=.003*Math.sin(px*47+Math.sin(pz*23))*Math.sin(py*53+pz*17)+.0015*Math.sin(px*91+py*45)*Math.cos(pz*83);
  const base=-.055+(round>=2?.004*Math.sin(px*18)*Math.cos(pz*19):0);
  d=Math.max(d,base-py);mc.field[z*n*n+y*n+x]=-d;
 }
 mc.update();const count=mc.geometry.drawRange.count,raw=mc.geometry.getAttribute('position'),p=new Float32Array(count*3);
 const scale:V=rain?[1.23,.55,.68]:[.7,.7,.7],at:V=CLOUD_AT[rain?'rain-cloud':'cumulus'];
 for(let i=0;i<count;i++)for(let a=0;a<3;a++)p[i*3+a]=(lo[a]!+(raw.array[i*3+a]!+1)/2*(hi[a]!-lo[a]!))*scale[a]!+at[a]!;
 let g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g=mergeVertices(g,1e-5);g.computeVertexNormals();
 const c=new Float32Array(g.getAttribute('position').count*3),pos=g.getAttribute('position');
 for(let i=0;i<pos.count;i++)c.set(cloudColour(pos.getY(i),rain).toArray(),i*3);
 g.setAttribute('color',new Float32BufferAttribute(c,3));mc.geometry.dispose();(mc.material as MeshBasicMaterial).dispose();return g;
}
/** Curved double-sided lenticular leaves with raised midrib and downward tips. */
function leaf(s:Sculpture,p:Vector3,length:number,width:number,angle:number,tilt:number,shade:number){
 const pos:number[]=[],ix:number[]=[],q=new Quaternion().setFromAxisAngle(new Vector3(0,1,0),angle),vertices:V[]=[[0,0,0],[length*.4,length*.10,width],[length*.5,length*.20,0],[length*.43,length*.10,-width],[length,-length*.07,0]];
 for(const a of vertices){const z=v(a);z.y+=z.x*tilt;pos.push(...z.applyQuaternion(q).add(p).toArray());}
 const front=[0,2,1,0,3,2,1,2,4,2,3,4];ix.push(...front);
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(pos,3));g.setIndex(ix);g.computeVertexNormals(); // split opposite normals, then recompute each side
 s.add(g,'f-elastic',shade);
}
export function tree(s:Sculpture,at:V,h:number,seed:number,urban=false,_round=1,ground?:(x:number,z:number)=>number){
 const rand=rng(seed),origin=v(at),r=h*(urban?.034:.026),lean=(rand()-.5)*h*.13;
 const fork=origin.clone().add(new Vector3(lean,h*(urban?.22+rand()*.12:.39+rand()*.19),(rand()-.5)*h*.1));
 const trunk=[at,origin.clone().add(new Vector3(lean*.4,h*.23,0)).toArray() as V,fork.toArray() as V];
 s.tube(trunk,r,r*.62,'ink-2',8,12);
 // Broad blade-like buttresses merge into the trunk, rather than a radial fan of rods.
 for(let i=0;i<3;i++){
  const a=i*2.399+rand()*.8,dir=new Vector3(Math.cos(a),0,Math.sin(a)),side=new Vector3(-Math.sin(a),0,Math.cos(a)),tip=origin.clone().addScaledVector(dir,r*(2.2+rand()));
  const root=new BufferGeometry(),pts=[origin.clone().addScaledVector(dir,r*.45).add(new Vector3(0,h*.13,0)),tip.clone().addScaledVector(side,r*.12),origin.clone().addScaledVector(side,r*.7),origin.clone().addScaledVector(side,-r*.7),tip.clone().addScaledVector(side,-r*.12)];
  for(const p of pts.slice(1))p.y=(ground?.(p.x,p.z)??at[1])-.0015;
  root.setAttribute('position',new Float32BufferAttribute(pts.flatMap(p=>p.toArray()),3));root.setIndex([0,1,2,0,3,4,0,4,1,0,2,3]);root.computeVertexNormals();s.add(root,'ink-2');
 }
 const branches=5+Math.floor(rand()*2);
 for(let i=0;i<branches;i++){
  const a=i*2.399+rand()*.8,span=h*(urban?.61:.42)*(.70+rand()*.40);
  const start=v(trunk[1]!).lerp(fork,.65+rand()*.35);
  const end=start.clone().add(new Vector3(Math.cos(a)*span,h*(.22+rand()*.25),Math.sin(a)*span)),mid=start.clone().lerp(end,.5).add(new Vector3(0,h*.07,0));
  const limb=[start.toArray() as V,mid.toArray() as V,end.toArray() as V];
  s.tube(limb,r*.60,r*.08,'ink-2',7,10);const limbCurve=new CatmullRomCurve3(limb.map(v));
  for(let j=0;j<6;j++){
   const t=.24+j*.14,start=limbCurve.getPoint(t),b=a+(j%2?1:-1)*(.55+rand()*.75);
   const tip=start.clone().add(new Vector3(Math.cos(b)*h*(.16+rand()*.09),h*(.08+rand()*.12),Math.sin(b)*h*(.16+rand()*.09)));
   const twig=[start.toArray() as V,start.clone().lerp(tip,.55).add(new Vector3(0,h*.04,0)).toArray() as V,tip.toArray() as V];
   s.tube(twig,r*.16,r*.012,'ink-2',4,6);const twigCurve=new CatmullRomCurve3(twig.map(v));
   // Alternate leaf sprays on connected, curved terminal shoots. Unequal leaf
   // size/orientation breaks repetition while retaining a coherent leafy crown.
   for(let k=0;k<15;k++){
    const t=.10+k/15*.89,p=twigCurve.getPoint(t),angle=b+(k%2?1:-1)*(1.0+rand()*.65);
    leaf(s,p,h*(urban?.100:.115)*(.7+rand()*.6),h*(urban?.027:.034),angle,(rand()-.5)*.7,Math.round((.12+rand()*.25)*24)/24);
   }
  }
 }
}
/** Smooth continuous catchment terrain on the exact original reservoir boundary. */
export function catchmentTerrain(outline:number[][]){
 const top:number[]=[],sides:number[]=[],contour=outline.map(p=>new Vector2(p[0],p[1]));
 const original=JSON.parse(fs.readFileSync('scripts/geo/water/baseline-parts.json','utf8'));
 const runoff=original.flows.find((f:any)=>f.id==='runoff').paths.filter((p:any)=>p.id.startsWith('hill-')).map((p:any)=>bakeFlowPath(p.path).points as Float32Array);
 const height=(x:number,z:number)=>{
  const xx=x+.025*Math.sin(z*17),zz=z+.027*Math.sin(x*11);
  let y=.10+.215*Math.exp(-(((xx-1.38)/.26)**2+((zz+.86)/.28)**2)*1.7)+.26*Math.exp(-(((xx-2.76)/.25)**2+((zz+.86)/.32)**2)*1.7)+.028*Math.exp(-(((xx-2.18)/.47)**2+((zz+1.12)/.10)**2));
  // Carve to the renderer's actual arc-length samples. The broad concave
  // channel accommodates triangle interpolation and the original .007 spread.
  for(const path of runoff)for(let i=0;i<path.length;i+=3){
   const distance2=(x-path[i]!)**2+(z-path[i+2]!)**2;
   if(distance2<.01)y=Math.min(y,path[i+1]!-.030+distance2*15);
  }
  return y;
 };
 function emit(a:Vector2,b:Vector2,c:Vector2,depth=0){
  if(depth<5&&Math.max(a.distanceTo(b),b.distanceTo(c),c.distanceTo(a))>.055){const ab=a.clone().lerp(b,.5),bc=b.clone().lerp(c,.5),ca=c.clone().lerp(a,.5);emit(a,ab,ca,depth+1);emit(ab,b,bc,depth+1);emit(ca,bc,c,depth+1);emit(ab,bc,ca,depth+1);return;}
  for(const p of [a,c,b])top.push(p.x,height(p.x,p.y),p.y);
 }
 for(const t of ShapeUtils.triangulateShape(contour,[]))emit(contour[t[0]!]!,contour[t[1]!]!,contour[t[2]!]!);
 for(let i=0;i<contour.length;i++){const a=contour[i]!,b=contour[(i+1)%contour.length]!;for(let j=0;j<24;j++){const p=a.clone().lerp(b,j/24),q=a.clone().lerp(b,(j+1)/24),py=height(p.x,p.y),qy=height(q.x,q.y);sides.push(p.x,0,p.y,q.x,qy,q.y,p.x,py,p.y,p.x,0,p.y,q.x,0,q.y,q.x,qy,q.y);}}
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(top,3));const welded=mergeVertices(g,1e-6);welded.computeVertexNormals();const side=new BufferGeometry();side.setAttribute('position',new Float32BufferAttribute(sides,3));side.computeVertexNormals();side.setIndex(Array.from({length:sides.length/3},(_,i)=>i));return mergeGeometries([welded,side]);
}
export function forest(base:BufferGeometry,round=1){
 const s=new Sculpture();s.add(base,'f-elastic',.30);
 const terrain=new Mesh(base,new MeshBasicMaterial({side:DoubleSide}));terrain.updateMatrixWorld();const ray=new Raycaster();

 // Unequal species heights, layered canopy, gaps above the reservoir shoreline.
 const sites:V[]=[[1.12,0,-1.12],[1.2,0,-.95],[1.18,0,-.7],[1.3,0,-.55],[1.48,0,-.6],[1.52,0,-1.08],[1.33,0,-.36],[1.55,0,-.3],[1.68,0,-1.08],[1.6,0,-.92],[1.25,0,-1.05],[1.45,0,-.98],[2.62,0,-1.12],[2.85,0,-1.1],[2.95,0,-.95],[2.65,0,-.62],[2.9,0,-.62],[2.8,0,-.4],[2.6,0,-.3],[2.92,0,-.32],[2.7,0,-.82],[2.4,0,-.3],[2.42,0,-1.12],[2.05,0,-1.12],[1.9,0,-1.1],[2.25,0,-1.13],[1.62,0,-.42]];
 for(let i=0;i<sites.length;i++){const p=sites[i]!;ray.set(new Vector3(p[0],2,p[2]),new Vector3(0,-1,0));p[1]=ray.intersectObject(terrain,false)[0]?.point.y??.10;tree(s,p,.29+(.5+.5*Math.sin(i*7.43))*.26,730+i,false,round,(x,z)=>{ray.set(new Vector3(x,2,z),new Vector3(0,-1,0));return ray.intersectObject(terrain,false)[0]?.point.y??p[1];});}

 return s.finish();
}
/** Parametric slab block. Every visible opening has a reveal, frame and sill. */
export function hdb(s:Sculpture,center:V,w:number,h:number,d:number,floors:number,bays:number,cut=false,round=1,estate=false){
 const [cx,cy,cz]=center,f=h/floors,bw=w/bays,back=cz-d/2;
 const box=(x:number,y:number,z:number,sx:number,sy:number,sz:number,t='paper')=>{
  const min:V=[cx+x-sx/2,cy+y-sy/2,cz+z-sz/2],max:V=[cx+x+sx/2,cy+y+sy/2,cz+z+sz/2];
  // Subtract the original kitchen teaching opening from ALL architectural
  // solids, including floors and party walls. Pipes, sink and tap stay put.
  const lo:V=[.085,.191,.555],hi:V=[.185,.264,.64];
  const emit=(a:V,b:V)=>{if(b.every((v,i)=>v-a[i]!>1e-7))s.box(a.map((v,i)=>(v+b[i]!)/2) as V,b.map((v,i)=>v-a[i]!) as V,t,.0005,estate&&t==='ink-2'?.45:1);};
  if(!cut||min.some((v,i)=>v>=hi[i]!)||max.some((v,i)=>v<=lo[i]!)){emit(min,max);return;}
  const a=min.map((v,i)=>Math.max(v,lo[i]!)) as V,b=max.map((v,i)=>Math.min(v,hi[i]!)) as V;
  emit(min,[a[0],max[1],max[2]]);emit([b[0],min[1],min[2]],max);
  emit([a[0],min[1],min[2]],[b[0],a[1],max[2]]);emit([a[0],b[1],min[2]],[b[0],max[1],max[2]]);
  emit([a[0],a[1],min[2]],[b[0],b[1],a[2]]);emit([a[0],a[1],b[2]],[b[0],b[1],max[2]]);
 };
 box(0,.002,0,w*1.06,.004,d*1.15,'neutral');
 // Open ground floor: real pilotis, access through front and rear.
 for(let b=0;b<=bays;b++)for(const z of [-d*.34,d*.33])box(-w/2+b*bw,f*.5,z,w*.017,f,d*.075,'neutral');
 for(let floor=1;floor<=floors;floor++){
  const y=floor*f;box(0,y,0,w,.003,d*.96,'neutral');
  if(floor===floors)break;
  for(let b=0;b<bays;b++){
   const x=-w/2+(b+.5)*bw,kitchen=cut&&Math.abs(cx+x-.135)<bw*.6&&(y>.18&&y<.26);
   // Party wall / recessed dwelling. Front wall is split around window void.
   box(x-bw*.5,y+f*.5,0,.003,f,d*.88);
   box(x,y+f*.49,-d*.14,bw*.93,f*.92,d*.50);
   if(!kitchen){
    box(x,y+f*.14,d*.46,bw,.28*f,d*.08);box(x,y+f*.91,d*.46,bw,.18*f,d*.08);
    for(const sign of [-1,1])box(x+sign*bw*.40,y+f*.55,d*.46,bw*.19,f*.54,d*.08);
    // Glazing sits inside the reveal, with actual projecting mullions.
    box(x,y+f*.55,d*.40,bw*.61,f*.56,.001,estate?'ink-2':'cold');
    for(const sign of (w>.25?[-1,0,1]:[]))box(x+sign*bw*.30,y+f*.55,d*.47,.001,f*.57,.002,'ink-3');
    if(w>.25||estate)box(x,y+f*.54,d*.475,bw*.63,.001,.002,'ink-3');
    if(w>.25||estate)box(x,y+f*.27,d*.48,bw*.67,.0015,.006,'neutral');
   }
   // Common gallery at rear with continuous parapet and open space above it.
   box(x,y+f*.40,-d*.49,bw,f*.32,d*.035,'neutral');
   box(x,y+f*.5,-d*.26,bw*.22,f*.82,.002,'ink-2');
  }
 }
 // End walls have window openings and stair/lift tower joins the slab.
 for(const sign of [-1,1]){
  if(!cut&&!estate){box(sign*w*.5,h*.54,0,.004,h-f,d*.88);continue;}
  for(let floor=1;floor<floors;floor++){
   const y=floor*f;
   box(sign*w*.5,y+f*.16,0,.004,f*.32,d*.88);
   box(sign*w*.5,y+f*.90,0,.004,f*.20,d*.88);
   for(const z of [-1,1])box(sign*w*.5,y+f*.56,z*d*.37,.004,f*.48,d*.14);
   box(sign*(w*.5-.0018),y+f*.56,0,.001,f*.48,d*.60,estate?'ink-2':'cold');
   box(sign*(w*.5+.0003),y+f*.56,0,.003,f*.48,.001,'ink-3');
  }
 }
 box(-w*.29,h*.55,-d*.48,w*.105,h-f*.9,d*.27,'neutral');
 for(let floor=1;floor<floors;floor++)box(-w*.29,floor*f+f*.6,-d*.625,w*.06,f*.19,.001,'ink-2');
 // Parapet around roof, raised lift overrun. Tank is a separate teaching part.
 box(0,h+.006,d*.48,w,.012,.003);box(0,h+.006,-d*.48,w,.012,.003);
 box(-w*.29,h+.018,-d*.28,w*.16,.036,d*.58,'neutral');
 if(round>=2&&(w>.25||estate)){ // Genuine slender gallery supports and service risers.
  for(let b=0;b<=bays;b++)box(-w*.5+b*bw,h*.52,-d*.49,.0018,h-f,d*.04);
  s.tube([[cx+w*.46,cy+h,back-.003],[cx+w*.46,cy+.01,back-.003]],.0011,.0011,'ink-3',2,8);
 }
 if(estate){
  for(const sign of [-1,1])box(sign*w*.5,h+.006,0,.003,.012,d);
 }
}
function pointBlock(s:Sculpture,at:V,h:number,_round:number){
 const [x,y,z]=at,w=.105,d=.095,f=h/15;
 s.box([x,y+h*.5,z],[w*.37,h,d*.37],'neutral');
 for(let face=0;face<4;face++){
  const rot=new Matrix4().makeRotationY(face*Math.PI/2),side=new Sculpture();
  // Each wing is separate from the core, leaving a deep vertical re-entrant corner.
  for(const sign of [-1,1]){
   const bx=sign*w*.30;
   side.box([bx,y+f*.5,d*.27],[w*.055,f,d*.12],'neutral');
   side.box([bx,y+(h+f)*.5,d*.15],[w*.38,h-f,d*.22],'paper');
   for(const edge of [-1,1])side.box([bx+edge*w*.17,y+(h+f)*.5,d*.31],[w*.045,h-f,d*.16],'paper');
   for(let floor=1;floor<15;floor++){
    const fy=y+floor*f;
    side.box([bx,fy+f*.14,d*.36],[w*.43,f*.32,d*.20],'neutral');
    side.box([bx,fy+f*.55,d*.28],[w*.29,f*.43,.0008],'ink-2');
    side.box([bx,fy+f*.55,d*.345],[.001,f*.45,.002],'paper');
   }
  }
  const g=side.finish().applyMatrix4(rot).translate(x,0,z);s.pieces.push(g);
 }
 s.box([x,y+h+.010,z],[w*.38,.020,d*.38],'neutral',.001);
}
export function city(round=1){const s=new Sculpture();
 for(let row=0;row<3;row++)for(let i=0;i<4;i++){
  const x=-.45+i*.35,z=-1+row*.28;
  if((i+row)%3===0){ // compact point tower, four corner dwellings around a core
   const h=.23+(i%2)*.03,d=.095,w=.105;pointBlock(s,[x,0,z],h,round);
   s.box([x, h+.014,z],[w*.40,.028,d*.43],'neutral',.001);
  }else {hdb(s,[x,0,z],.205,.145+row*.008,.070,9,4,false,round);s.box([x+.05,.1585+row*.008,z],[.034,.025,.04],'neutral',.001);}
 }
 for(const [i,p]of ([[ -.61,0,-.85],[-.08,0,-.59],[.45,0,-.82],[.76,0,-.52]] as V[]).entries())tree(s,p,.13,990+i,true,round);
 return s.finish();
}
export function barrage(_round=1){const s=new Sculpture();
 s.box([-1.69,-.046,.64],[.095,.028,.85],'neutral',.002);
 for(let i=0;i<10;i++){const z=.28+i*.08;
  // Hydrodynamic rounded noses below a narrow bridge, no tall dam wall.
  s.box([-1.69,-.020,z],[.080,.026,.006],'paper',.001);
  s.cylinder([-1.733,-.020,z],.003,.026,'paper');
  // Small pitched service pavilion on the pier, as in the barrage photographs.
  s.box([-1.688,-.004,z],[.018,.003,.012],'paper',.0005);
  for(const x of [-1.694,-1.682])for(const dz of [-.004,.004])s.tube([[x,-.002,z+dz],[x,.007,z+dz]],.00045,.00045,'neutral',1,6);
  const roof=new BufferGeometry();roof.setAttribute('position',new Float32BufferAttribute([-1.699,.007,z-.008,-1.677,.007,z-.008,-1.677,.007,z+.008,-1.699,.007,z+.008,-1.688,.013,z],3));roof.setIndex([0,4,1,1,4,2,2,4,3,3,4,0]);roof.computeVertexNormals();s.add(roof,'paper');
 }
 s.box([-1.654,-.006,.64],[.023,.008,.85],'paper',.001);
 for(const x of [-1.667,-1.64]){
  s.tube([[x,.012,.215],[x,.012,1.065]],.0012,.0012,'ink-3',2,8);
  for(let j=0;j<=36;j++){const z=.22+j*.023;s.tube([[x,-.002,z],[x,.012,z]],.00065,.00065,'ink-3',1,6);}
 }
 return s.finish();}
export const gatePivot:V=[-1.715,-.032,.64];
export function gates(_round=1){const s=new Sculpture();
 for(let i=0;i<9;i++){const z=.32+i*.08;
  s.box([-1.715,-.0258,z],[.002,.0123,.074],'ink-3',.0003);
  s.cylinder([-1.715,-.032,z],.0015,.074,'neutral',[0,0,1]);
  for(let j=0;j<6;j++)s.box([-1.7132,-.026,z-.032+j*.0128],[.002,.010,.0012],'neutral',.00015);
  s.box([-1.715,-.0197,z],[.003,.001,.074],'neutral');
 }
 return s.finish();}
/** Sweeping accessible grass roof and open courtyard; schematic footprint. */
export function pumpHouse(round=1){const s=new Sculpture(),N=96,pos:number[]=[],ix:number[]=[];
 const cx=-1.48,cz=1.10,rx=.22,rz=.125;
 for(let j=0;j<2;j++)for(let i=0;i<=N;i++){const a=-Math.PI*.15+i/N*Math.PI*1.78,r=j===0?1:.48,h=.010+.025*(i/N);pos.push(cx+rx*r*Math.cos(a),h,cz+rz*r*Math.sin(a));}
 for(let i=0;i<N;i++){const a=i,b=i+1,c=N+1+i,d=c+1;ix.push(a,c,b,b,c,d);}
 const roof=new BufferGeometry();roof.setAttribute('position',new Float32BufferAttribute(pos,3));roof.setIndex(ix);roof.computeVertexNormals();s.add(roof,'seedling',.65);
 for(let i=0;i<N;i++){const a=-Math.PI*.15+i/N*Math.PI*1.78,b=-Math.PI*.15+(i+1)/N*Math.PI*1.78,h=.010+.025*(i/N);
  for(const r of [1,.48])s.tube([[cx+rx*r*Math.cos(a),h-.003,cz+rz*r*Math.sin(a)],[cx+rx*r*Math.cos(b),h-.0025,cz+rz*r*Math.sin(b)]],.002,.002,'paper',1,8);
  if(i%3===0){const x=cx+rx*Math.cos(a),z=cz+rz*Math.sin(a);s.box([x,h*.46,z],[.002,h*.92,.002],'paper');}
  if(i%2===0){const g=new BufferGeometry(),x1=cx+rx*Math.cos(a),z1=cz+rz*Math.sin(a),x2=cx+rx*Math.cos(b+Math.PI*1.78/N),z2=cz+rz*Math.sin(b+Math.PI*1.78/N);g.setAttribute('position',new Float32BufferAttribute([x1,0,z1,x1,h-.004,z1,x2,0,z2,x2,h-.003,z2],3));g.setIndex([0,1,2,2,1,3]);g.computeVertexNormals();s.add(g,'cold',.45);}

 }
 if(round>=2){
  for(let j=0;j<7;j++)s.box([-1.57+j*.016,.027,1.20],[.014,.002,.025],'ink-2');
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute([-1.345,.047,1.09,-1.375,.060,1.15,-1.415,.047,1.16,-1.385,.044,1.10],3));g.setIndex([0,1,3,1,2,3]);g.computeVertexNormals();s.add(g,'paper');
  for(const p of [[-1.345,.047,1.09],[-1.375,.060,1.15],[-1.415,.047,1.16]] as V[])s.tube([[p[0],0,p[2]],p],.0007,.0007,'ink-3',1,8);
 }
 // Pump gallery behind the grass roof; seven modelled outfall mouths.
 s.box([-1.665,-.008,1.135],[.055,.005,.145],'neutral');
 s.box([-1.665,.036,1.135],[.059,.004,.149],'paper');
 s.box([-1.640,.013,1.135],[.005,.043,.145],'paper');
 for(const z of [1.061,1.209])s.box([-1.665,.013,z],[.055,.043,.004],'paper');
 for(let i=0;i<7;i++){const z=1.073+i*.020;
  for(const offset of [-.0075,.0075])s.box([-1.690,.013,z+offset],[.004,.043,.003],'paper');
  s.box([-1.687,.013,z],[.001,.027,.011],'ink-2');
  for(let row=0;row<4;row++)s.box([-1.691,.003+row*.006,z],[.002,.001,.011],'ink-3');
 }

 for(let i=0;i<7;i++){const z=1.083+i*.0155;
  s.tube([[-1.665,-.015,z],[-1.70,-.015,z],[-1.745,-.021,z]],.005,.005,'ink-3',5,16,false);
  // A real annular collar and visible inner wall, with no disk across the bore.
  const p:number[]=[],ix:number[]=[],N=32;
  for(const x of [-1.7435,-1.749])for(const r of [.006,.0042])for(let j=0;j<=N;j++){const a=j/N*Math.PI*2;p.push(x,-.021+Math.cos(a)*r,z+Math.sin(a)*r);}
  const ring=N+1;for(let j=0;j<N;j++)for(const [a,b] of [[0,2*ring],[ring,3*ring],[0,ring],[2*ring,3*ring]]){const u=a!+j,v=b!+j;ix.push(u,v,u+1,u+1,v,v+1);}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();s.add(g,'ink-3');
 }
 return s.finish();}

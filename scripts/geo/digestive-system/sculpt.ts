/** Original anatomical teaching sculptures. Reference morphology is recorded in
 * REBUILD-3D.md. Continuous SDF molar; displaced tissue layers; tapered villi.
 * No scan, photograph texture, decal, or runtime geometry generation.
 */
import { BufferGeometry, Float32BufferAttribute, MeshBasicMaterial, Vector3, CatmullRomCurve3, Color } from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { readFileSync } from 'node:fs';
import { finishTooth } from './tooth-finish';
export type V3 = [number,number,number];
type Field=(x:number,y:number,z:number)=>number;
const pi=Math.PI, clamp=(v:number)=>Math.max(0,Math.min(1,v));
const css=readFileSync('src/theme/tokens.css','utf8').split(':root[data-theme="cinema"]')[0]!;
const tokens=Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1]!,m[2]!]));
const bone=new Color(tokens.bone!);
function paint(g:BufferGeometry,token:string):BufferGeometry {
 const c=new Color(tokens[token]!);c.setRGB(c.r/bone.r,c.g/bone.g,c.b/bone.b);
 const a=new Float32Array(g.getAttribute('position').count*3);for(let i=0;i<a.length;i+=3)a.set(c.toArray(),i);
 g.setAttribute('color',new Float32BufferAttribute(a,3));return g;
}
function mesh(p:number[],ix:number[],color:string){
 const clean:number[]=[];const a=new Vector3(),b=new Vector3(),c=new Vector3();
 for(let i=0;i<ix.length;i+=3){a.fromArray(p,ix[i]!*3);b.fromArray(p,ix[i+1]!*3);c.fromArray(p,ix[i+2]!*3);if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-22)clean.push(ix[i]!,ix[i+1]!,ix[i+2]!);}
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setIndex(clean);g.computeVertexNormals();return paint(g,color);
}
function joined(gs:BufferGeometry[],at:V3):BufferGeometry {
 const list=gs.map(g=>{const r=g.index?g.toNonIndexed():g;r.deleteAttribute('uv');return r;});
 const m=mergeGeometries(list,false)!;m.translate(...at);const w=mergeVertices(m,1e-7);m.dispose();list.forEach(g=>g.dispose());return w;
}
const smoothMin=(a:number,b:number,k:number)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
function ell(c:V3,r:V3):Field{return(x,y,z)=>(Math.hypot((x-c[0])/r[0],(y-c[1])/r[1],(z-c[2])/r[2])-1)*Math.min(...r);}
function branch(path:V3[],radii:number[],flat=1):Field {
 const curve=new CatmullRomCurve3(path.map(p=>new Vector3(...p)),false,'centripetal'),points=curve.getPoints(20);
 const bound=Array.from({length:3},(_,k)=>[Math.min(...path.map(p=>p[k]!))-Math.max(...radii),Math.max(...path.map(p=>p[k]!))+Math.max(...radii)]);
 return(x,y,z)=>{if([x,y,z].some((v,k)=>v<bound[k]![0]!||v>bound[k]![1]!))return .1;let d=Infinity;for(let i=0;i<points.length-1;i++){
  const a=points[i]!,b=points[i+1]!,dx=b.x-a.x,dy=b.y-a.y,dz=(b.z-a.z)/flat,t=clamp(((x-a.x)*dx+(y-a.y)*dy+(z-a.z)/flat*dz)/(dx*dx+dy*dy+dz*dz));
  const u=(i+t)/(points.length-1)*(radii.length-1),k=Math.min(radii.length-2,Math.floor(u)),r=radii[k]!+(radii[k+1]!-radii[k]!)*(u-k);
  d=Math.min(d,Math.hypot(x-a.x-t*dx,y-a.y-t*dy,(z-a.z)/flat-t*dz)-r);
 }return d;};
}
function implicit(f:Field,lo:V3,hi:V3,n:number,color:string,front=0):BufferGeometry {
 const mc=new MarchingCubes(n,new MeshBasicMaterial(),false,false,200000);mc.isolation=0;
 for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++)mc.field[z*n*n+y*n+x]=-f(lo[0]+(hi[0]-lo[0])*x/n,lo[1]+(hi[1]-lo[1])*y/n,lo[2]+(hi[2]-lo[2])*z/n);
 mc.update();const count=mc.geometry.drawRange.count,src=mc.geometry.getAttribute('position'),ns=mc.geometry.getAttribute('normal'),p=new Float32Array(count*3),norm=new Float32Array(count*3);
 for(let i=0;i<count;i++){for(let k=0;k<3;k++){p[i*3+k]=lo[k]!+(src.array[i*3+k]!+1)*.5*(hi[k]!-lo[k]!);norm[i*3+k]=ns.array[i*3+k]!/(hi[k]!-lo[k]!);}}
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setAttribute('normal',new Float32BufferAttribute(norm,3));g.normalizeNormals();
 const positions=g.getAttribute('position'),normals=g.getAttribute('normal');for(let i=0;i<positions.count;i++)if(positions.getZ(i)>front-.00042&&positions.getZ(i)<front+.00005)normals.setXYZ(i,0,0,1);
 mc.geometry.dispose();(mc.material as MeshBasicMaterial).dispose();return paint(g,color);
}
/** Tapered curved anatomical vessels; endpoints overlap their genuine branches. */
function vessel(path:V3[],rs:number[],color:string,radial=10,segments=30):BufferGeometry {
 const c=new CatmullRomCurve3(path.map(p=>new Vector3(...p)),false,'centripetal'),p:number[]=[],ix:number[]=[];
 for(let j=0;j<=segments;j++){
  const t=j/segments,q=c.getPoint(t),v=c.getTangent(t),u=new Vector3(0,0,1).addScaledVector(v,-v.z).normalize(),w=new Vector3().crossVectors(v,u).normalize();
  const s=t*(rs.length-1),i=Math.min(rs.length-2,Math.floor(s)),r=rs[i]!+(rs[i+1]!-rs[i]!)*(s-i);
  for(let k=0;k<radial;k++){const a=2*pi*k/radial;const pt=q.clone().addScaledVector(u,r*Math.cos(a)).addScaledVector(w,r*Math.sin(a));p.push(...pt.toArray());}
 }
 for(let j=0;j<segments;j++)for(let k=0;k<radial;k++){const a=j*radial+k,b=j*radial+(k+1)%radial;ix.push(a,b,a+radial,b,b+radial,a+radial);}
 // Sealed terminal discs; their tiny radii taper below close-up visibility.
 for(const j of [0,segments]){const mid=p.length/3;p.push(...c.getPoint(j/segments).toArray());for(let k=0;k<radial;k++){const a=j*radial+k,b=j*radial+(k+1)%radial;if(j===0)ix.push(mid,b,a);else ix.push(mid,a,b);}}
 return mesh(p,ix,color);
}
export function tooth():BufferGeometry {
 // Five unequal occlusal cusp peaks in the SAME enamel surface. The mesial
 // pair is broader than the distal three; valleys form the grinding table.
 const cusps=[[-.016,-.012,.013],[-.013,.012,.011],[.012,-.012,.012],[.017,.010,.010],[.024,-.002,.006]];
 const crown=(inset:number):Field=>(x,y,z)=>{
  const taper=(1-.13*Math.exp(-(((y+.001)/.013)**2)))*(1-.10*clamp((y-.018)/.025)**2),rx=.032*taper-inset,rz=.023*taper-inset;
  const side=(Math.pow((Math.abs(x)/rx)**4+(Math.abs(z)/rz)**4,.25)-1)*.022;
  let top=.032-inset;for(const [cx,cz,h] of cusps as number[][])top+=h!*Math.exp(-(((x-cx!)/.010)**2+((z-cz!)/.009)**2));
  // A smooth shoulder joins the rounded sides to the grinding table; a hard
  // max here makes an artificial sharp perimeter around every cusp.
  return Math.max(-.006+inset-y,-smoothMin(-side,top-y,.0022));
 };
 const rootL=branch([[-.013,-.002,0],[-.017,-.030,0],[-.022,-.060,-.002],[-.028,-.079,-.003]],[.014,.012,.0075,.0015],.76);
 const rootR=branch([[.014,-.002,0],[.018,-.027,0],[.021,-.054,.001],[.019,-.075,.003]],[.013,.010,.0065,.0015],.79);
 const root:Field=(x,y,z)=>smoothMin(rootL(x,y,z),rootR(x,y,z),.003);
 const outerCrown=crown(0),innerCrown=crown(.0026);
 const solid:Field=(x,y,z)=>smoothMin(innerCrown(x,y,z),root(x,y,z),.004);
 const chamber=ell([0,.015,0],[.014,.013,.008]);
 const canals=[branch([[-.007,.013,0],[-.014,-.014,0],[-.021,-.056,-.001],[-.027,-.078,-.003]],[.005,.0026,.0015,.0005],.85),branch([[.008,.012,0],[.016,-.013,0],[.020,-.054,.001],[.019,-.074,.003]],[.005,.0026,.0014,.0005],.85)];
 const horns=[branch([[-.009,.019,0],[-.014,.027,-.005],[-.016,.033,-.009]],[.004,.003,.0008]),branch([[.008,.020,0],[.014,.027,-.005],[.017,.032,-.009]],[.004,.0025,.0008])];
 const pulp:Field=(x,y,z)=>[...canals,...horns].reduce((d,f)=>smoothMin(d,f(x,y,z),.0015),chamber(x,y,z));
 // A single contiguous tooth volume is clipped geometrically at its true
 // section plane. Its material interfaces share the SAME split vertices,
 // eliminating cracks from independently marched enamel/dentine/pulp caps.
 const toothSolid:Field=(x,y,z)=>smoothMin(outerCrown(x,y,z),root(x,y,z),.004);
 const region=(token:string):V3=>{const c=new Color(tokens[token]!);return[c.r/bone.r,c.g/bone.g,c.b/bone.b];};
 const full=implicit(toothSolid,[-.040,-.086,-.030],[.040,.056,.030],112,'bone');
 const gs=[finishTooth(full,toothSolid,(x,y,z)=>Math.min(innerCrown(x,y,z),y),(x,y,z)=>-pulp(x,y,z),{enamel:region('bone'),dentine:region('mannequin'),pulp:region('muscle-2')})];
 // The alveolar segment is fitted around the real root contours. A scalloped
 // crest follows the cervical margin, with a septum between the two sockets.
 const boneField:Field=(x,y,z)=>{
  const top=-.010+.004*Math.cos(x*85)+.002*Math.sin(z*140),side=(Math.pow((Math.abs(x)/.049)**6+(Math.abs(z+.003)/.028)**6,1/6)-1)*.025;
  let d=Math.max(side,-.092-y,y-top,-root(x,y,z)+.0011,z-.001);
  // Open trabecular spaces on the actual section, bounded by the cortical rim.
  if(d<=0&&z>-.006&&Math.abs(x)<.043&&y<-.015&&y>-.086){
   const gx=Math.floor(x/.010),gy=Math.floor((y+.09)/.010);
   for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){
    const u=gx+i,v=gy+j,random=(n:number)=>{const q=Math.sin(u*127.1+v*311.7+n*73.3)*43758.5453;return q-Math.floor(q);};
    const cx=(u+.2+.6*random(1))*.010,cy=-.09+(v+.2+.6*random(2))*.010;
    const rx=.0022+.001*random(3),ry=.0024+.0014*random(4),q=(Math.hypot((x-cx)/rx,(y-cy)/ry,(z+.0007)/.0024)-1)*rx;d=Math.max(d,-q);
   }
  }return d;
 };
 gs.unshift(implicit(boneField,[-.056,-.099,-.036],[.056,.006,.008],80,'bone',.001));
 // Gingiva encircles one cervical opening. It must not descend as an isolated
 // wedge into the exposed interradicular septum between the two roots.
 const cervicalOpening=ell([0,-.004,0],[.031,.027,.022]);
 const gumField:Field=(x,y,z)=>Math.max(ell([0,-.007,-.001],[.049,.012,.028])(x,y,z),-Math.min(solid(x,y,z),cervicalOpening(x,y,z))+.00045,z-.0013);
 gs.push(implicit(gumField,[-.055,-.022,-.035],[.055,.010,.008],76,'muscle-1',.0013));
 // Apical vessels split into the two root canals, then branch below the horns.
 for(const s of [-1,1]){
  const x=s<0?-.026:.019,yy=s<0?-.078:-.074;
  gs.push(vessel([[x,yy,.0002],[s*.020,-.050,.0002],[s*.014,-.014,.0002],[s*.008,.017,.0002]],[.00045,.0007,.00085,.0004],'muscle-3',10,40));
  gs.push(vessel([[s*.008,.013,.0002],[s*.012,.021,.0002],[s*.016,.027,-.0001]],[.00055,.0004,.0001],'muscle-3',8,16));
 }
 return joined(gs,[.5,0,.05]);
}
/** A curved, bounded tissue layer. Top/bottom and cut edges share exact
 * boundary coordinates; the cut edge is a real cross-section of the layer. */
function patch(top:(x:number,z:number)=>number,bottom:(x:number,z:number)=>number,color:string,nx=32,nz=20,width=.12,depth=.05,cutRelief?:(x:number,y:number)=>number):BufferGeometry {
 const p:number[]=[],ix:number[]=[],stride=(nx+1)*(nz+1);
 const point=(i:number,j:number,fn:typeof top)=>{
  const u=i/nx*2-1,v=j/nz*2-1;
  // Slightly round the excised patch corners, without a box silhouette.
  const x=u*width/2*(1-.055*Math.abs(v)**10),z=v*depth/2*(1-.055*Math.abs(u)**10);return [x,fn(x,z),z] as V3;
 };
 for(const f of [top,bottom])for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)p.push(...point(i,j,f));
 for(let s=0;s<2;s++)for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const a=s*stride+j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;if(s===0)ix.push(a,c,b,b,c,d);else ix.push(a,b,c,b,d,c);
 }
 const edge:number[]=[];for(let i=0;i<=nx;i++)edge.push(i);for(let j=1;j<=nz;j++)edge.push(j*(nx+1)+nx);for(let i=nx-1;i>=0;i--)edge.push(nz*(nx+1)+i);for(let j=nz-1;j>0;j--)edge.push(j*(nx+1));
 for(let i=0;i<edge.length;i++){
  const a=edge[i]!,b=edge[(i+1)%edge.length]!;
  if(cutRelief&&a>=nz*(nx+1)&&b>=nz*(nx+1))continue;
  ix.push(a,b,a+stride,b,b+stride,a+stride);
 }
 // A gridded cut mucosal face exposes blind gland recesses, rather than tubes
 // stuck onto the section. The perimeter remains exactly fitted to both layers.
 let frontStart=-1;
 if(cutRelief){
  frontStart=ix.length;
  const start=p.length/3,ny=28;
  for(let k=0;k<=ny;k++)for(let i=0;i<=nx;i++){
   const roof=point(i,nz,top),floor=point(i,nz,bottom),t=k/ny,y=floor[1]+t*(roof[1]-floor[1]);
   const fade=Math.min(1,Math.sin(pi*t)*8)*Math.min(1,i*2,(nx-i)*2);
   p.push(roof[0],y,roof[2]-cutRelief(roof[0],y)*fade);
  }
  for(let k=0;k<ny;k++)for(let i=0;i<nx;i++){
   const a=start+k*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;ix.push(a,b,c,b,d,c);
  }
 }
 // Cut faces have geometric normals separate from the smoothly folded roof.
 const g=mesh(p,ix,color).toNonIndexed();g.computeVertexNormals();
 // Keep smooth analytic normals on the top and bottom sampled surfaces.
 const ns=g.getAttribute('normal'),ps=g.getAttribute('position'),e=.00001;
 for(let i=0;i<nx*nz*12;i++){
  const x=ps.getX(i),z=ps.getZ(i),f=i<nx*nz*6?top:bottom,sign=i<nx*nz*6?1:-1;
  const n=new Vector3(-(f(x+e,z)-f(x-e,z))/(2*e),1,-(f(x,z+e)-f(x,z-e))/(2*e)).normalize().multiplyScalar(sign);ns.setXYZ(i,...n.toArray());
 }
 // Preserve smooth normals across the sampled gland recesses. Recomputing
 // normals after toNonIndexed would turn every recess into tiny shiny facets.
 if(cutRelief){
  const zAt=(x:number,y:number)=>{
   const u=x/(width/2*.945),z=depth/2*(1-.055*Math.abs(u)**10),lo=bottom(x,z),hi=top(x,z),t=clamp((y-lo)/(hi-lo));
   const fade=Math.min(1,Math.sin(pi*t)*8)*Math.min(1,(1-Math.abs(u))*nx);
   return z-cutRelief(x,y)*fade;
  };
  for(let i=frontStart;i<ps.count;i++){
   const x=ps.getX(i),y=ps.getY(i),n=new Vector3(-(zAt(x+e,y)-zAt(x-e,y))/(2*e),-(zAt(x,y+e)-zAt(x,y-e))/(2*e),1).normalize();
   ns.setXYZ(i,...n.toArray());
  }
 }
 return g;
}
export function stomach():BufferGeometry {
 const curve=(x:number,z:number)=>.0025*(x/.06)**2+.003*(z/.025)**2+.001*Math.sin(x*40+z*50);
 const levels=[-.021,-.011,-.001,.009,.019,.027];
 const gs:BufferGeometry[]=[];
 const colors=['muscle-1','muscle-2','muscle-3','neutral','muscle-1'];
 // Broad unequal rugae are rounded folds, with shorter anastomosing ridges.
 // Their submucosal core follows the mucosa instead of leaving a flat shelf.
 const folds=[[-.052,.0095,.0072,1.1],[-.021,.0105,.0102,2.5],[.014,.0088,.0082,.4],[.050,.011,.0069,3.7]];
 const ruga=(x:number,z:number)=>{
  let y=.027+curve(x,z);
  for(const [base,width,height,phase] of folds){
   const centre=base!+.0035*Math.sin(z*68+phase!)+.0014*Math.sin(z*127+phase!*1.4);
   y+=height!*(.86+.14*Math.cos(z*61+phase!))*Math.exp(-(((x-centre)/width!)**2));
  }
  for(const [cx,cz,tilt] of [[-.034,-.013,.7],[.002,.012,-.8],[.033,-.005,.5]])
   y+=.0038*Math.exp(-(((x-cx!-tilt!*z)/.0085)**2+((z-cz!)/.012)**2));
  return y;
 };
 const foldedCore=(x:number,z:number)=>.019+curve(x,z)+.40*(ruga(x,z)-.027-curve(x,z));
 const pits:V3[]=[];
 for(let i=0;i<20;i++)for(let j=0;j<8;j++){
  const x=-.057+i*.0059+.00045*Math.sin(j*4.1+i),z=-.023+j*.0064+.00055*Math.sin(i*2.7+j);pits.push([x,z,.0016*(1+.23*Math.sin(i*1.9+j))]);
 }
 const surface=(x:number,z:number)=>{let y=ruga(x,z);for(const [a,b,d] of pits){const q=((x-a)/.0012)**2+((z-b)/.00115)**2;if(q<12)y-=d*Math.exp(-q);}return y;};
 for(let i=0;i<5;i++){
  const glandRecess=(x:number,y:number)=>{
   let depth=0;
   for(let k=0;k<16;k++){
    const cx=-.054+k*.0072,roof=ruga(cx,.0235),base=foldedCore(cx,.0235)+.0013;
    if(y<base||y>roof-.0006)continue;
    const t=(y-base)/(roof-base),centre=cx+.0007*Math.sin(t*4+k*1.7),width=.00065+.00035*(1-t);
    depth=Math.max(depth,.00125*Math.exp(-(((x-centre)/width)**2))*Math.min(1,t*10));
   }
   return depth;
  };
  const g=patch(i===4?surface:(x,z)=>i===3?foldedCore(x,z):levels[i+1]!+curve(x,z),(x,z)=>i===4?foldedCore(x,z):levels[i]!+curve(x,z),colors[i]!,i===4?160:24,i===4?72:12,.12,.05,i===4?glandRecess:undefined);
  if(i===4){const ps=g.getAttribute('position'),cs=g.getAttribute('color'),a=new Color(tokens['muscle-1']!),b=new Color(tokens['muscle-3']!);
   for(let j=0;j<ps.count;j++){const x=ps.getX(j),y=ps.getY(j),z=ps.getZ(j);if(Math.abs(y-surface(x,z))<.00002){const d=clamp((ruga(x,z)-surface(x,z))/.0018),c=a.clone().lerp(b,d*.52);cs.setXYZ(j,c.r/bone.r,c.g/bone.g,c.b/bone.b);}}
  }gs.push(g);
 }
 // The three muscular layers are genuine relief bundles on the front cut.
 // Their ends lie in their own tissue layer: oblique, transverse, longitudinal.
 for(let i=0;i<25;i++){
  const phase=i*2.399,x=-.056+i*.0046+.00065*Math.sin(phase),y=curve(x,.0235),r=.00028+.00009*Math.sin(phase*.7);
  gs.push(vessel([[x,-.008+y,.0244],[x+.0015,-.005+y,.0251],[x+.003,-.002+y,.0248]],[r,r*1.15,r*.8],'muscle-1',8,8));
  gs.push(vessel([[x-.0016,.003+y,.0246],[x,.0034+y,.0251],[x+.0014,.0037+y,.0246]],[r,r*1.25,r],'muscle-3',8,6));
  gs.push(vessel([[x,-.016+y,.0242],[x+.00012,-.016+y,.0252],[x,-.016+y,.0258]],[r,r*1.5,r*.8],'muscle-2',8,5));
 }
 return joined(gs,[.72,0,.05]);
}
/** Leaf/finger villus skin with a curved centreline and rounded, narrowing tip.
 * Rings merge tangentially into a wide basal skirt rather than sitting on it. */
function villus(x:number,z:number,height:number,radius:number,lean:number,phase:number,half=false):BufferGeometry {
 const nr=half?32:16,stem=half?40:8,cap=half?8:5,nt=stem+cap,p:number[]=[],ix:number[]=[];
 const capHeight=radius*1.10;
 for(let j=0;j<=nt;j++){
  const q=j<=stem?j/stem:1,theta=j<=stem?0:(j-stem)/cap*pi/2;
  const yy=j<=stem?(height-capHeight)*q:height-capHeight+capHeight*Math.sin(theta),t=yy/height;
  const r=radius*(.50+.53*Math.sin(pi*(t*.84+.05)))*(1+.40*Math.exp(-t*18))*(j<=stem?1:Math.cos(theta));
  for(let k=0;k<=nr;k++){
   const a=half?pi+pi*k/nr:2*pi*k/nr;
   // Epithelial relief is submillimetre at ×100, with staggered cell courses.
   const cell=half?1-.012*(Math.cos(a*24+Math.sin(yy*1250))**16+Math.cos(yy*2600+.24*Math.sin(a*11))**16):1;
   const ruffle=(1+.018*Math.sin(a*5+t*11+phase))*cell;
   const angle=half?0:phase*.8+.24*Math.sin(t*pi+phase),flat=half?.64:.52+.19*Math.sin(phase*1.7);
   const xx=r*Math.cos(a)*ruffle,zz=r*flat*Math.sin(a)*ruffle;
   p.push(x+lean*t*t+.0018*Math.sin(t*pi)*Math.cos(phase)+xx*Math.cos(angle)-zz*Math.sin(angle),.009+yy+.001*Math.sin(phase)*t*(1-t),z+xx*Math.sin(angle)+zz*Math.cos(angle)+.0015*Math.sin(t*pi)*Math.sin(phase));
  }
 }
 for(let j=0;j<nt;j++)for(let k=0;k<nr;k++){const a=j*(nr+1)+k,b=a+1;ix.push(a,a+nr+1,b,b,a+nr+1,b+nr+1);}
 if(half){
  // Continuous exposed lamina propria across the deliberately cut front face.
  for(let j=0;j<nt;j++){
   const a=j*(nr+1),b=a+nr,c=a+nr+1,d=c+nr;ix.push(a,b,c,b,d,c);
  }
 }
 return mesh(p,ix,'muscle-1');
}
export function villiField():BufferGeometry {
 const gs:BufferGeometry[]=[];
 // 56 unequal profiles in a deterministic inhibited scatter. The minimum
 // spacing prevents intersecting bases without leaving a visible row lattice.
 // At ×100, 0.052–0.076 m is 0.52–0.76 mm in life.
 const random=(n:number)=>{const q=Math.sin(n*127.1+73.7)*43758.5453123;return q-Math.floor(q);};
 const positions:V3[]=[];
 for(let attempt=0;positions.length<56&&attempt<20000;attempt++){
  const x=-.055+random(attempt*7+1)*.111,z=-.045+random(attempt*7+2)*.092;
  if(positions.some(p=>Math.hypot(p[0]-x,p[2]-z)<.0105))continue;
  positions.push([x,0,z]);
  const phase=random(attempt*7+3)*2*pi,h=.052+.024*random(attempt*7+4),r=.0045+.0010*random(attempt*7+5);
  gs.push(villus(x,z,h,r,.0032*(random(attempt*7+6)*2-1),phase));
 }
 if(positions.length!==56)throw new Error('Villus scatter failed to fill the patch');
 return joined(gs,[.94,0,.05]);
}
export function villiBlock():BufferGeometry {
 const curve=(x:number,z:number)=>.001*(x/.065)**2+.0015*Math.sin(z*40+x*25);
 const gs=[patch((x,z)=>.009+curve(x,z),(x,z)=>-.011+curve(x,z),'muscle-2',44,32,.13,.11)];
 const z=.049,h=.073,r=.0082;
 // Exposed villus rises at the front of the lining. Its lamina propria, intact
 // back epithelium and vascular bed are one selectable object, as before.
 const skin=villus(0,z,h,r,.002,.8,true);gs.push(skin);
 // Thin differentiated epithelium along the two cut edges is real relief.
 const skinPositions=skin.getAttribute('position');
 for(const edge of [0,32]){
  const rim:V3[]=[];
  for(let row=0;row<=48;row++){
   const i=row*33+edge;
   rim.push([skinPositions.getX(i),skinPositions.getY(i),skinPositions.getZ(i)+.00015]);
  }
  gs.push(vessel(rim,[.00040,.00040,.00035,.00020],'bone',10,64));
 }
 // Blind-ended lacteal occupies the centre and branches into basal lymphatic.
 gs.push(vessel([[-.030,-.002,.030],[-.009,.002,.035],[0,.012,z+.001],[.0004,.040,z+.001],[.0015,.072,z+.001],[.0016,.0725,z+.001],[.00165,.073,z+.001],[.0017,.0732,z+.001]],[.001,.0011,.0016,.0013,.0012,.0010,.0006,.0001],'bone',14,72));
 // Connected subepithelial capillary mesh, sampled around the same bent,
 // fusiform outline as the epithelial specimen. Every edge has a shared node;
 // no vessels end between the two trunks or float outside the lamina propria.
 const rows=12,cols=4,net:V3[][]=[];
 for(let j=0;j<rows;j++){
  const yy=.014+j*.00565,t=(yy-.009)/h;
  const rad=r*(.50+.53*Math.sin(pi*(t*.84+.05)))*(1+.40*Math.exp(-t*18));
  const cx=.002*t*t+.0018*Math.sin(t*pi)*Math.cos(.8),zz=z+.0015*Math.sin(t*pi)*Math.sin(.8);
  const row:V3[]=[];
  for(let k=0;k<cols;k++){
   const u=-1+k*2/(cols-1),wobble=k===0||k===cols-1?0:.12*Math.sin(j*1.7+k*2.4);
   row.push([cx+(u+wobble)*rad*.68,yy+((k===0||k===cols-1)?0:.0009*Math.sin(j*2.3+k)),zz+.0012+.0016*(1-u*u)]);
  }
  net.push(row);
 }
 // Larger basal arteriolar and venular branches enter, then narrow into the net.
 // Keep their approach inside the basal tissue. A control point at z=.055
 // sits on the exposed front cut face and makes two false crescent marks.
 // The branches emerge only into the villus, above the curved block roof.
 for(const k of [0,cols-1]){
  const sign=k===0?-1:1,entry=net[0]![k]!;
  gs.push(vessel([[sign*.025,-.004,.030],[sign*.009,.003,.035],entry],[.001,.00085,.00055],'muscle-3',12,32));
 }
 for(let j=0;j<rows-1;j++)for(let k=0;k<cols;k++){
  const a=net[j]![k]!,b=net[j+1]![k]!,mid:V3=[(a[0]+b[0])*.5+.00032*Math.sin(j*2.4+k),(a[1]+b[1])*.5,(a[2]+b[2])*.5+.00018];
  const radius=k===0||k===cols-1?.00044-.00020*j/(rows-1):.00024;
  gs.push(vessel([a,mid,b],[radius,radius*1.05,radius*.98],'muscle-3',8,8));
 }
 // Staggered cross branches make unequal interconnected polygonal capillary
 // spaces rather than a stack of isolated rungs across two plain blood tubes.
 for(let j=0;j<rows;j++)for(let k=0;k<cols-1;k++){
  if(j>0&&j<rows-1&&(j+k)%3===1)continue;
  const a=net[j]![k]!,b=net[j]![k+1]!,mid:V3=[(a[0]+b[0])*.5,(a[1]+b[1])*.5+.0006*Math.sin(j*1.9+k),(a[2]+b[2])*.5+.00018];
  gs.push(vessel([a,mid,b],[.00022,.00026,.00022],'muscle-3',8,8));
 }
 // Only the lacteal is blind-ended. The apical blood arcade joins both trunks.
 gs.push(vessel([net[rows-1]![0]!,[.0015,.0802,z+.0015],net[rows-1]![cols-1]!],[.00024,.00028,.00024],'muscle-3',10,20));
 return joined(gs,[.94,0,.05]);
}

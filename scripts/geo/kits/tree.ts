/** Original deterministic mangrove studies. Geometry is built off-line, never
 * fetched at runtime. Leaves are individually transformed copies of a curved
 * elliptic blade; branches, root paths and leaf density have seeded variation.
 * Dimensions/counts describe the teaching model, not a surveyed tree. */
import { BufferGeometry, Float32BufferAttribute, Matrix4, Euler, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import type { Primitive, Part } from '../../../src/engines/space-scene/schema';
type V3 = [number, number, number];
const bark = { color: 'wood', tint: 'token:neutral' } as const;
const leafMaterial = { color: 'tissue', tint: 'token:seedling' } as const;
const plus=(a:V3,b:V3):V3=>a.map((v,i)=>v+b[i]!) as V3;
export function seeded(seed:number) {return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
const curve=(at:V3,path:V3[],radius:number[],segments=20,radial=16):Primitive=>({kind:'sweep',at,path,radius,radial,segments,section:'round',closed:false,caps:'flat',...bark});
export function ellipticLeaf(at:V3,length=.066,width=.024,rotation:V3=[0,0,0]):Primitive {
 return {kind:'sweep',at,path:[[0,0,0],[length*.20,length*.025,0],[length*.48,length*.045,0],[length*.76,length*.015,0],[length,-length*.05,0]],radius:[.0001,width*.36,width*.5,width*.38,.00003],section:{flat:.09},up:[0,1,0],radial:12,segments:20,closed:false,caps:'round',rotation,...leafMaterial};
}
/** Shared curled leaf surface, closed by two thin surfaces. No faceted lens,
 * flat polygon, regular fan, or solid canopy proxy. Petiole is in the blade. */
export function leafGeometry(length:number,width:number,curl=.09):BufferGeometry {
 const positions:number[]=[],indices:number[]=[];const rows=14,cols=2;
 for(let side=0;side<2;side++)for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++) {
  const t=i/rows,u=j/cols*2-1;
  const half=width*.5*Math.pow(Math.sin(Math.PI*t),.78)*(1-.12*t);
  positions.push(length*t,length*(.045*Math.sin(Math.PI*t)-curl*t*t*t)+width*(.14*u*u+.035*u)*Math.sin(Math.PI*t)+(side?-.00016:.00016)*(1-u*u)*Math.sin(Math.PI*t),u*half);
 }
 const stride=cols+1,layer=(rows+1)*stride;
 for(let side=0;side<2;side++)for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
  const a=side*layer+i*stride+j,b=a+stride;
  if(side)indices.push(a,b,a+1,a+1,b,b+1);else indices.push(a,a+1,b,a+1,b+1,b);
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function bakePrimitives(models:Primitive[]):BufferGeometry {
 const geometries:BufferGeometry[]=[];
 for(const primitive of models)for(const p of partPieces({primitive} as Part)){
  if(!p.lines)for(const m of p.matrices??[new Matrix4()]){
   const g=p.geometry.clone().applyMatrix4(new Matrix4().makeTranslation(...primitive.at).multiply(m));
   g.deleteAttribute('uv');geometries.push(g.index?g.toNonIndexed():g);
  }
  p.geometry.dispose();
 }
 const out=mergeGeometries(geometries)!;geometries.forEach(g=>g.dispose());return out;
}
export interface TreeStudy { wood:Primitive[]; leaves: {at:V3;length:number;width:number;rotation:V3;curlVariant:number}[] }
/** Named first-order branches are deliberately not angular sectors. Recursive
 * forks vary in length, elevation, azimuth and subdivision. Leaf clumps grow
 * at terminal twigs; the interior and several crown windows remain open. */
export function branchingTree(at:V3,options:{height:number;spread:number;lean?:number;species?:'api'|'bakau';seed?:number}):TreeStudy {
 const {height:h,spread:w,lean=.012,species='api',seed=species==='api'?144:981}=options;
 const rand=seeded(seed),wood:Primitive[]=[],leaves:TreeStudy['leaves']=[];
 let twigIndex=0;
 const trunk=(t:number):V3=>[lean*t+Math.sin(t*3.5)*.009,h*t,.012*Math.sin(t*2.3)];
 wood.push(curve(at,[-.035,0,.16,.34,.52,.70,.87].map(t=>trunk(t)),[.036,.033,.027,.022,.016,.010,.002],40,48));
 function branch(start:V3,end:V3,r:number,depth:number) {
  const mid:V3=[(start[0]+end[0])*.5+(rand()-.5)*.015,(start[1]+end[1])*.5+.015,(start[2]+end[2])*.5+(rand()-.5)*.018];
  wood.push(curve(at,[start,mid,end],[r,r*.67,r*.30],r>.008?18:10,r>.008?20:10));
  if(depth) {
   const direction=Math.atan2(end[2]-start[2],end[0]-start[0]);
   const forks=depth===2?3:2;
   for(let k=0;k<forks;k++){
    const az=direction+(k-(forks-1)/2)*(.75+rand()*.65)+(rand()-.5)*.5;
    const reach=w*(depth===2?.24:.16)*(.65+rand()*.65);
    branch(end,[end[0]+Math.cos(az)*reach,end[1]+h*(.045+rand()*.095),end[2]+Math.sin(az)*reach],r*(.43+rand()*.12),depth-1);
   }
  } else {
   const pairs=twigIndex++%3===0?4:5;
   const az=Math.atan2(end[2]-start[2],end[0]-start[0]);
   for(let i=0;i<pairs;i++){
    const t=.25+i*.65/(pairs-1),node=start.map((v,k)=>v+(end[k]!-v)*t) as V3;
    for(const side of [-1,1]) {
     const len=(species==='api'?.061:.072)*(.74+rand()*.48);
     leaves.push({at:plus(at,node),length:len,width:len*(species==='api'?.34:.42),rotation:[-28+rand()*55,-az*180/Math.PI+side*(40+rand()*38),-28+rand()*65],curlVariant:rand()});
    }
   }
  }
 }
 // Avoid a bowl of same-height forks: api has a spreading, leaning axis;
 // bakau a taller leader and several low branch origins for aerial roots.
 const limbs=species==='api'?[
  [.34,-2.80,.49,.65],[.41,-.87,.55,.73],[.52,1.05,.46,.81],[.63,2.35,.34,.91],[.71,-1.58,.32,1.00],[.76,.20,.29,.98],
 ]:[
  [.33,-2.45,.45,.61],[.43,-.18,.50,.69],[.50,1.30,.47,.75],[.61,-1.40,.42,.86],[.69,2.60,.30,.95],[.78,.52,.29,1.04],
 ];
 for(const [level,az,reach,top] of limbs as [number,number,number,number][]){
  const start=trunk(level),end:V3=[start[0]+Math.cos(az)*w*reach,start[1]+h*(top-level)*.52,start[2]+Math.sin(az)*w*reach];
  branch(start,end,.013*(1-level*.45),2);
 }
 return {wood,leaves:leaves.slice(0,336)};
}
/** `wood` and `leaves` bake the two finishes separately (bark and foliage
 * are separate glb nodes, one material each); `all` keeps them together. */
export function treeGeometry(study:TreeStudy,which:'all'|'wood'|'leaves'='all'):BufferGeometry {
 if(which==='wood')return bakePrimitives(study.wood);
 const pieces=which==='all'?[bakePrimitives(study.wood)]:[];
 // Sixteen canonical blades are reused for all leaf transforms, then baked
 // into a single static buffer (one draw, no per-frame matrix updates).
 const blades=Array.from({length:16},(_,i)=>leafGeometry(1,.4,.02+i*.003));
 for(const leaf of study.leaves){
  const matrix=new Matrix4().makeRotationFromEuler(new Euler(...leaf.rotation.map(v=>v*Math.PI/180) as V3));
  matrix.scale(new Vector3(leaf.length,leaf.length,leaf.width/.4));matrix.setPosition(...leaf.at);
  const g=blades[Math.min(15,Math.floor(leaf.curlVariant*16))]!.clone().applyMatrix4(matrix);g.deleteAttribute('uv');pieces.push(g.toNonIndexed());
 }
 const g=mergeGeometries(pieces)!;pieces.forEach(p=>p.dispose());blades.forEach(p=>p.dispose());return g;
}
/** Twelve wandering cable roots; each carries six asymmetrically scattered
 * vertical roots. Their feet are on the exact interpolated cable path. */
export function pencilRootSystem(at:V3,options:{sectors?:number;reach?:number;height?:number;radius?:number}={}) {
 const {sectors=12,reach=.30,height=.095,radius=.0025}=options,rand=seeded(836);
 const lateral:Primitive[]=[],pencils:Primitive[]=[];
 for(let i=0;i<sectors;i++){
  const az=i*2.39996+(rand()-.5)*.8,extent=reach*(.67+rand()*.34);
  const path:V3[]=[[0,-.033,0]];
  for(let j=1;j<=6;j++){
   const d=extent*(j-.90+rand()*.85)/6,theta=az+.2*Math.sin(j*.8+i);
   path.push([d*Math.cos(theta),-.033+(rand()-.5)*.006,d*Math.sin(theta)]);
  }
  lateral.push(curve(at,path,[.012,.009,.007,.005,.004,.003,.002],18,8));
  for(let j=1;j<=6;j++){
   const base=path[j]!,h=height*(.47+rand()*.82),r=radius*(.70+rand()*.30);
   pencils.push(curve(at,[base,[base[0]+(rand()-.5)*.004,h*.35,base[2]+(rand()-.5)*.005],[base[0]+(rand()-.5)*.009,h,base[2]+(rand()-.5)*.009]],[r,r*.85,r*.12],7,8));
  }
 }
 return {lateral,pencils};
}
/** Twelve unequal arches; six attached forks. Origins span the trunk and
 * actual low branch station. Root feet and branchlets share no polar ring. */
export function propRootSystem(at:V3,options:{sectors?:number;spread?:number;attachment?:number}={}):Primitive[] {
 const {sectors=6,spread=.27,attachment=.32}=options,rand=seeded(743),roots:Primitive[]=[];
 const tree=branchingTree(at,{height:.78,spread:.27,species:'bakau'});
 for(let i=0;i<sectors*2;i++){
  const az=i*2.39996+(rand()-.5)*.9,reach=spread*(.66+rand()*.50),h=attachment*(.43+rand()*1.14);
  let start:V3=[.012*h/.78+Math.sin(h/.78*3.5)*.009,h,.012*Math.sin(h/.78*2.3)];
  if(i===2||i===7)start=(tree.wood[i===2?1:14] as Extract<Primitive,{kind:'sweep'}>).path[1]!;
  const p1:V3=[start[0]+Math.cos(az)*reach*.38,start[1]*.92,start[2]+Math.sin(az)*reach*.38];
  const p2:V3=[Math.cos(az)*reach*.78,start[1]*.48,Math.sin(az)*reach*.78];
  const foot:V3=[Math.cos(az+.08)*reach,-.029,Math.sin(az+.08)*reach];
  roots.push(curve(at,[start,p1,p2,foot],[.011+rand()*.006,.010,.007,.003],24,16));
  if(i%2===0){
   const az2=az+.28+rand()*.35;
   roots.push(curve(at,[p2,[Math.cos(az2)*reach*.94,start[1]*.26,Math.sin(az2)*reach*.94],[Math.cos(az2)*reach*1.12,-.03,Math.sin(az2)*reach*1.12]],[.006,.0045,.002],16,12));
  }
 }
 return roots;
}

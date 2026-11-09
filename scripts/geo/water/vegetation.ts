/** Original leaf-cluster atlas and four reusable, asymmetric tropical tree forms.
 * Variants are instantiated at build time and merged into the two scenery parts;
 * the existing loader consumes one geometry/material per teaching part.
 */
import { CatmullRomCurve3, BufferGeometry, Float32BufferAttribute, Vector3, Matrix4, Quaternion, Color } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import sharp, { type OverlayOptions } from 'sharp';
import fs from 'node:fs';
import { Sculpture, palette, type V } from './scenery';
export const random=(seed:number)=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
export function opaqueUV(g:BufferGeometry){
 if(!g.hasAttribute('uv')){const uv=new Float32Array(g.getAttribute('position').count*2);for(let i=0;i<uv.length;i+=2){uv[i]=.75;uv[i+1]=.75;}g.setAttribute('uv',new Float32BufferAttribute(uv,2));}return g;
}
const point=(p:Vector3)=>p.toArray() as V;
/** Curved card: its crease changes the actual surface normal; alpha only cuts
 * out small blades and rachises. Cards have no crown-shaped opaque backing. */
function spray(s:Sculpture,root:Vector3,axis:Vector3,length:number,kind:number,rand:()=>number){
 const a=axis.clone().normalize(),u=new Vector3(0,1,0).cross(a).normalize();if(u.length()<.1)u.set(1,0,0);
 u.applyAxisAngle(a,rand()*Math.PI*2);const n=new Vector3().crossVectors(u,a).normalize(),w=length*(kind===1?.56:.44),positions:number[]=[],uv:number[]=[],indices:number[]=[];
 const tile=kind===1?[.5,0]:kind===2?[0,.5]:[0,0];
 for(let j=0;j<2;j++)for(const sign of [-1,1]){
  const t=j,p=root.clone().addScaledVector(a,t*length).addScaledVector(u,sign*w*.5).addScaledVector(n,sign*t*length*.045);
  positions.push(...p.toArray());uv.push(tile[0]!+(sign===-1?.020:.480),tile[1]!+.480-t*.460);
 }
 indices.push(0,1,2,1,3,2);
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 const c=new Color(palette['f-elastic']!).multiplyScalar(.95+Math.round(rand()*4)*.10),colors=new Float32Array(12);for(let i=0;i<4;i++)colors.set(c.toArray(),i*3);g.setAttribute('color',new Float32BufferAttribute(colors,3));s.pieces.push(g);
}
/** Roots start inside soil; child branches start inside their parent limb.
 * Their start-cap triangles are buried and can be omitted without changing any
 * exposed silhouette. Keep every distal cap. */
class VegetationWood extends Sculpture {
 override tube(points:V[],r0:number,r1:number,token='ink-2',segments=12,radial=10,caps:boolean|'end'='end'){
  return super.tube(points,r0,r1,token,segments,radial,caps);
 }
}
export interface TreeVariant { wood:BufferGeometry; foliage:BufferGeometry; kind:number; name:string }
export function treeVariant(kind:number,seed:number):TreeVariant{
 const rand=random(seed),s=new VegetationWood(),leaves=new Sculpture(),rain=kind===1,angsana=kind===2;
 const r=rain?.035:.025,lean=(rand()-.5)*.13,fork=rain?.29:angsana?.38:.58;
 const trunk=[new Vector3(0,0,0),new Vector3(lean*.4,.25,0),new Vector3(lean,fork,.025)];
 if(!rain&&!angsana)trunk.push(new Vector3(lean*1.1,.76,.028));
 const trunkCurve=new CatmullRomCurve3(trunk);
 s.tube(trunk.map(point),r,r*(rain?.70:.52),'ink-2',10,16);
 // Irregular buttresses, with broad connected blade surfaces at the trunk.
 for(let i=0;i<4;i++){
  const a=i*2.399+rand()*.65,dir=new Vector3(Math.cos(a),0,Math.sin(a)),side=new Vector3(-dir.z,0,dir.x);
  const positions:number[]=[],indices:number[]=[],steps=6;
  for(let j=0;j<=steps;j++){
   const t=j/steps,center=dir.clone().multiplyScalar(r*(.40+t*(2.0+rand()*.08))),width=r*(.55*(1-t)+.04),height=.14*(1-t)**2.3;
   for(const [sideSign,upper]of [[-1,0],[1,0],[-1,1],[1,1]])positions.push(...center.clone().addScaledVector(side,sideSign!*width*(upper?.20:1)).setY(upper?height:0).toArray());
   if(j<steps)for(const [a,b]of [[0,2],[2,3],[3,1]]){const q=j*4;indices.push(q+a!,q+a!+4,q+b!,q+b!,q+a!+4,q+b!+4);}
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();s.add(g,'ink-2',.7);
 }
 const limbs=rain?4:angsana?5:6;
 for(let i=0;i<limbs;i++){
  const angle=i*2.399+rand()*.9,start=trunkCurve.getPoint(!rain&&!angsana?.58+(i%3)*.14:.62+rand()*.36),radius=(rain?.69:angsana?.34:.34)*(.72+rand()*.45);

  const end=start.clone().add(new Vector3(Math.cos(angle)*radius,(rain?.27:.31)+rand()*.15,Math.sin(angle)*radius));
  if(!rain&&!angsana)end.y=.91+rand()*.16;
  if(angsana)end.y=.72+rand()*.24;
  const shoulder=start.clone().lerp(end,.22).add(new Vector3(0,rain?.14:angsana?.09:.05,0)),mid=start.clone().lerp(end,.60).add(new Vector3(0,rain?.13:angsana?.10:.045,0)),limbPoints=[start,shoulder,mid,end],limbCurve=new CatmullRomCurve3(limbPoints);
  s.tube(limbPoints.map(point),r*(.42+rand()*.18),r*.07,'ink-2',10,10);
  for(let j=0;j<(rain?4:3);j++){
   const t=rain?.23+j*.23:.29+j*.30,base=limbCurve.getPoint(t);
   const az=angle+(j%2?1:-1)*(.55+rand()*1.6),span=(angsana?.12:.14)+rand()*(angsana?.08:.10);
   const tip=base.clone().add(new Vector3(Math.cos(az)*span,.06+rand()*.10,Math.sin(az)*span));
   if(rain)tip.y=.63+rand()*.11-.05*(Math.hypot(tip.x,tip.z)/.9)**2;
   if(angsana)tip.y=.64+rand()*.40-.04*(Math.hypot(tip.x,tip.z)/.8)**2;
   const bend=base.clone().lerp(tip,.5).add(new Vector3(0,.025,0));
   s.tube([point(base),point(bend),point(tip)],r*.15,r*.018,'ink-2',3,6);
   for(let k=0;k<(rain?8:4);k++){
    const tt=.14+k/(rain?8:4)*.85,root=new CatmullRomCurve3([base,bend,tip]).getPoint(tt);
    const az2=rand()*Math.PI*2,span2=.08+rand()*.07,dir=new Vector3(Math.cos(az2)*span2,(angsana?-.045:.03)+rand()*.07,Math.sin(az2)*span2);
    if(rain)dir.y=.68+rand()*.08-root.y;
    const terminal=root.clone().add(dir);
    s.tube([point(root),point(terminal)],r*.033,0,'ink-2',1,3,false);
    for(let n=0;n<3;n++){
     const t2=.22+n/3*.75,anchor=root.clone().lerp(terminal,t2),a=az2+(n%2?1:-1)*(.55+rand());
     const direction=new Vector3(Math.cos(a),angsana?-.8+rand()*2.4:.15+rand()*.4,Math.sin(a));
     spray(leaves,anchor,direction,(rain?.13:angsana?.22:.16)*(.75+rand()*.45),kind,rand);
    }
   }
  }
 }
 // Lower, drooping lateral sprays distinguish angsana from emergents and rain trees.
 if(angsana)for(let i=0;i<12;i++){
  const a=rand()*Math.PI*2,base=new Vector3(Math.cos(a)*.28,.61+rand()*.18,Math.sin(a)*.28),end=base.clone().add(new Vector3(Math.cos(a)*.17,-.12,Math.sin(a)*.17));
  // Connect directly to the trunk instead of suspending the lateral branch.
  s.tube([point(trunk[2]!),point(base),point(end)],r*.18,r*.008,'ink-2',5,6);
  for(let k=0;k<4;k++)spray(leaves,base.clone().lerp(end,k/4),new Vector3(Math.cos(a+.5),-.6,Math.sin(a+.5)),.18,kind,rand);
 }
 const wood=opaqueUV(s.finish()),bark=wood.getAttribute('color');for(let i=0;i<bark.count;i++)bark.setXYZ(i,bark.getX(i)*.62,bark.getY(i)*.62,bark.getZ(i)*.62);
 return {wood,foliage:leaves.finish(),kind,name:rain?'rain-tree':angsana?'angsana':seed===103?'emergent-a':'emergent-b'};
}
export function variants(){return [treeVariant(0,103),treeVariant(0,217),treeVariant(1,339),treeVariant(2,457)];}
export const treeSites:V[]=[[1.12,0,-1.12],[1.2,0,-.95],[1.18,0,-.7],[1.3,0,-.55],[1.48,0,-.6],[1.52,0,-1.08],[1.33,0,-.36],[1.55,0,-.3],[1.68,0,-1.08],[1.6,0,-.92],[1.25,0,-1.05],[1.45,0,-.98],[2.62,0,-1.12],[2.85,0,-1.1],[2.95,0,-.95],[2.65,0,-.62],[2.9,0,-.62],[2.8,0,-.4],[2.6,0,-.3],[2.92,0,-.32],[2.7,0,-.82],[2.4,0,-.3],[2.42,0,-1.12],[2.05,0,-1.12],[1.9,0,-1.1],[2.25,0,-1.13],[1.62,0,-.42]];
export const urbanSites:V[]=[[-.82,0,-1.03],[-.83,0,-.62],[-.68,0,-.24],[.72,0,-.23]];
export function treeMatrix(at:V,h:number,seed:number){const rand=random(seed);return new Matrix4().compose(new Vector3(...at),new Quaternion().setFromAxisAngle(new Vector3(0,1,0),rand()*Math.PI*2),new Vector3(h*(.87+rand()*.25),h,h*(.87+rand()*.25)));}
export function instantiateTree(variant:TreeVariant,at:V,h:number,seed:number,ground?:(x:number,z:number)=>number){
 const rand=random(seed),m=treeMatrix(at,h,seed);rand();rand();rand();
 const copies=[variant.wood,variant.foliage].map((g,index)=>{
  const copy=g.clone().applyMatrix4(m),p=copy.getAttribute('position'),c=copy.getAttribute('color'),tone=.86+Math.round(rand()*5)*.05,hue=1+(Math.round(rand()*4)-2)*.01625;
  for(let i=0;i<p.count;i++){
   if(index===0&&g.getAttribute('position').getY(i)<.0015)p.setY(i,(ground?.(p.getX(i),p.getZ(i))??at[1])-.001);
   c.setXYZ(i,c.getX(i)*tone*hue,c.getY(i)*tone,c.getZ(i)*tone);
  }
  return copy;
 });return mergeGeometries(copies);
}
/** Pack three generated botanical albedos, retaining their alpha. The original
 * source and exact prompt are versioned beside this script. The fourth tile is
 * opaque white for token-coloured wood/terrain/architecture. */
export async function leafAtlas(){
 const input=fs.readFileSync('scripts/geo/water/leaf-clusters-generated-v1.png'),meta=await sharp(input).metadata(),half=Math.floor(meta.width!/2),inner=220;
 const layers:OverlayOptions[]=[];
 for(let kind=0;kind<3;kind++){
  const tile=await sharp(input).extract({left:kind===1?half:0,top:kind===2?half:0,width:half,height:half}).resize(inner,inner).ensureAlpha().raw().toBuffer();
  // Locate the petiole in the lower central band, then seat it on the UV root.
  let anchorX=inner/2,anchorY=inner-1;
  outer:for(let y=inner-1;y>inner*.72;y--){let weight=0,sum=0;for(let x=inner*.32|0;x<inner*.68;x++){const a=tile[(y*inner+x)*4+3]!;if(a>64){weight+=a;sum+=x*a;}}if(weight>0){anchorX=sum/weight;anchorY=y;break outer;}}
  const png=await sharp(tile,{raw:{width:inner,height:inner,channels:4}}).png().toBuffer();
  layers.push({input:png,left:(kind===1?256:0)+Math.round(128-anchorX),top:(kind===2?256:0)+246-anchorY});
 }
 layers.push({input:await sharp({create:{width:256,height:256,channels:4,background:{r:255,g:255,b:255,alpha:1}}}).png().toBuffer(),left:256,top:256});
 return sharp({create:{width:512,height:512,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers).png({palette:true,colours:64}).toBuffer();
}
/** Low multi-stem understorey shrubs: no additional tree trunks. The forest
 * reference photographs have vegetation between the emergent boles too. */
export function understorey(at:V,h:number,seed:number){
 const rand=random(seed),wood=new VegetationWood(),leaves=new Sculpture(),origin=new Vector3(...at);
 for(let j=0;j<6;j++){
  const a=j*2.399+rand(),tip=origin.clone().add(new Vector3(Math.cos(a)*h*.42,h*(.52+rand()*.4),Math.sin(a)*h*.42)),mid=origin.clone().lerp(tip,.55).add(new Vector3(0,h*.18,0));
  wood.tube([point(origin),point(mid),point(tip)],h*.012,h*.002,'ink-2',3,5);
  for(let k=0;k<2;k++)spray(leaves,mid.clone().lerp(tip,.2+k*.65),new Vector3(Math.cos(a+(k?-.4:.8)),.2,Math.sin(a+(k?-.4:.8))),h*(.7+rand()*.25),0,rand);
 }
 return mergeGeometries([opaqueUV(wood.finish()),leaves.finish()]);
}

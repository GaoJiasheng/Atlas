/** Original build-time hardware surfaces. Metres, Y up, Apollo 11 configuration.
 * NASA mission photographs and Saturn V News Reference constrain the visible
 * stations. This is a photographic reconstruction, not manufacturing CAD.
 */
import fs from 'node:fs';
import {BufferGeometry,Float32BufferAttribute,LatheGeometry,Vector2,Vector3,Matrix4,Quaternion,CatmullRomCurve3,TubeGeometry,TorusGeometry,Shape,ShapeGeometry,ExtrudeGeometry,SphereGeometry,Color,Mesh,MeshBasicMaterial,Raycaster,DoubleSide} from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {sourceIO} from './source';
import {dequantize} from '@gltf-transform/functions';
type XY=[number,number];
export type V=[number,number,number];
const css=fs.readFileSync('src/theme/tokens.css','utf8');
const section=css.slice(css.indexOf(':root[data-theme="paper"] {'),css.indexOf(':root[data-theme="cinema"] {'));
const tokens=Object.fromEntries([...section.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1]!,m[2]!]));
export const palette={white:tokens.paper!,silver:tokens.mannequin!,grey:tokens['ink-3']!,dark:tokens.ink!,gold:tokens.cut!,red:tokens.hot!,glass:tokens['ink-2']!};
const TAU=Math.PI*2;
function finish(g:BufferGeometry,hex:string){
 const col=new Color(hex),a=g.getAttribute('position'),c:number[]=[];
 // Vertex values are linear. The engine multiplies these by its enamel family.
 // Keep hardware colours constant in paper and cinema, like the real paint.
 const base=new Color('#ffffff');
 for(let i=0;i<a.count;i++)c.push(col.r/base.r,col.g/base.g,col.b/base.b);
 g.setAttribute('color',new Float32BufferAttribute(c,3));return g;
}
export class Hardware {
 pieces:BufferGeometry[]=[];
 add(g:BufferGeometry,c=palette.silver){this.pieces.push(finish(g,c));return g;}
 lathe(at:V,profile:number[][],c=palette.silver,segments=96){return this.add(new LatheGeometry(profile.map(p=>new Vector2(p[0],p[1])),segments).translate(...at),c);}
 ring(at:V,r:number,t:number,c=palette.silver){return this.add(new TorusGeometry(r,t,t>.06?12:6,r>1?72:r>.4?48:24).rotateX(Math.PI/2).translate(...at),c);}
 rod(a:V,b:V,r:number,c=palette.silver){return this.pipe([a,b],r,c,1);}
 pipe(points:V[],r:number,c=palette.silver,segs=20){return this.add(new TubeGeometry(new CatmullRomCurve3(points.map(p=>new Vector3(...p))),points.length===2?1:Math.max(segs,points.length*3),r,r>.12?12:8,false),c);}
 sphere(at:V,scale:V,c=palette.silver){return this.add(new SphereGeometry(1,Math.max(...scale)<.06?8:Math.max(...scale)<.20?16:32,Math.max(...scale)<.06?6:Math.max(...scale)<.20?10:20).scale(...scale).translate(...at),c);}
 plate(at:V,shape:number[][],depth:number,c=palette.silver){const s=new Shape(shape.map(p=>new Vector2(p[0],p[1])));return this.add(new ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:2,steps:1,curveSegments:12}).translate(0,0,-depth/2).translate(...at),c);}
 merge(){const raw=this.pieces.map(g=>{const p=g.index?g.toNonIndexed():g.clone();p.deleteAttribute('uv');return p;});const g=mergeVertices(mergeGeometries(raw)!,.000001);raw.forEach(g=>g.dispose());this.pieces.forEach(g=>g.dispose());return g;}
}
export function surface(rows:number,cols:number,fn:(u:number,v:number)=>V,wrap=true){
 const p:number[]=[],ix:number[]=[];const w=wrap?cols:cols+1;
 for(let y=0;y<=rows;y++)for(let x=0;x<w;x++)p.push(...fn(y/rows,x/cols));
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*w+x,b=y*w+(wrap?(x+1)%cols:x+1),c=b+w,d=a+w;ix.push(a,b,d,b,c,d);}
 const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(p,3)).setIndex(ix);g.computeVertexNormals();return g;
}
function painted(g:BufferGeometry,fn:(x:number,y:number,z:number)=>string){const p=g.getAttribute('position'),c:number[]=[],base=new Color('#ffffff');for(let i=0;i<p.count;i++){const col=new Color(fn(p.getX(i),p.getY(i),p.getZ(i)));c.push(col.r/base.r,col.g/base.g,col.b/base.b);}g.setAttribute('color',new Float32BufferAttribute(c,3));return g;}
/** Annular skin including actual corrugated relief. Paint boundaries are sampled
 * at their stations; no overlapping black slabs and no black geometry floating. */
export function stageSkin(id:string){
 const h=new Hardware();
 const configs:Record<string,{r:number;low:number;high:number;bands:XY[];black:(y:number,a:number)=>boolean}>={
 'sic-shell':{r:5.03,low:5.5,high:42.06,bands:[[5.5,9.2],[20.2,25.5],[38.2,42.06]],black:(y,a)=>y<17.5&&Math.cos(4*a)>.0||y>38.8&&Math.cos(4*a)<0},
 'sii-shell':{r:5.03,low:42.06,high:66.9,bands:[[42.06,46.5],[63.8,66.9]],black:(y,a)=>y<45.8&&Math.cos(4*a)>.0||y>64.2&&Math.cos(4*a)<0},
 'sivb-shell':{r:3.305,low:71.5,high:84.67,bands:[[71.5,73],[82.5,84.67]],black:(y,a)=>y>82.5&&Math.cos(4*a)>.0},
 };
 const q=configs[id]!;
 const stations=[q.low,q.high,...q.bands.flat(),...(id==='sic-shell'?[17.5,38.8]:id==='sii-shell'?[45.8,64.2]:[82.5])].sort((a,b)=>a-b).filter((v,i,a)=>i===0||v-a[i-1]!>.0001);
 for(let j=0;j<stations.length-1;j++){
  const lo=stations[j]!,hi=stations[j+1]!,corr=q.bands.some(([a,b])=>(lo+hi)/2>a&&(lo+hi)/2<b),n=384;
  const g=surface(1,n,(u,v)=>{const a=v*TAU,r=q.r+(corr?.022*(.5+.5*Math.cos(96*a)):0);return [r*Math.sin(a),lo+(hi-lo)*u,r*Math.cos(a)];});
  painted(g,(x,_y,z)=>q.black((lo+hi)/2,Math.atan2(x,z))?palette.dark:palette.white);h.pieces.push(g);
 }
 // Annular end faces and an inner skin allow honest cutaways.
 h.lathe([0,0,0],[[q.r,q.low],[q.r-.065,q.low],[q.r-.065,q.high],[q.r,q.high]],palette.grey,128);
 for(const y of [...new Set(q.bands.flat())])h.ring([0,y,0],q.r+.022,.025,palette.white);
 // Longitudinal cable tunnel follows the actual single axial service chase.
 h.pipe([[0,q.low+.3,q.r+.05],[0,q.high-.3,q.r+.05]],.105,palette.white,1);
 // Access ports and disconnect plates are mounted on the shell, not random greeble.
 for(const y of id==='sic-shell'?[10.3,25.9,37.5]:id==='sii-shell'?[47.6,62.6]:[74.2,81.6]){
  h.plate([0,y,q.r+.07],[[-.23,-.3],[.23,-.3],[.23,.3],[-.23,.3]],.035,palette.silver);
  for(const s of [-1,1])for(const t of [-1,1])h.sphere([s*.19,y+t*.25,q.r+.095],[.024,.024,.012],palette.grey);
 }
 if(id==='sivb-shell'){
  h.lathe([0,0,0],[[5.03,66.9],[3.305,71.5],[3.24,71.5],[4.96,66.9],[5.03,66.9]],palette.white,128);
  // Tapered interstage stiffeners lie on the conical skin.
  for(let i=0;i<96;i++){const a=TAU*i/96;h.rod([5.05*Math.sin(a),66.95,5.05*Math.cos(a)],[3.33*Math.sin(a),71.48,3.33*Math.cos(a)],.023,palette.white);}
 }
 if(id==='sic-shell'){
  const font=new FontLoader().parse(JSON.parse(fs.readFileSync('node_modules/three/examples/fonts/helvetiker_bold.typeface.json','utf8')));
  for(let side=0;side<4;side++)for(const [j,letter]of [...'USA'].entries()){const g=new ShapeGeometry(font.generateShapes(letter,1.1),4);g.computeBoundingBox();const center=(g.boundingBox!.min.x+g.boundingBox!.max.x)/2,p=g.getAttribute('position');for(let i=0;i<p.count;i++){const a=(p.getX(i)-center)/5.033+side*Math.PI/2+Math.PI/4,y=32-j*1.6+p.getY(i);p.setXYZ(i,5.07*Math.sin(a),y,5.07*Math.cos(a));}g.computeVertexNormals();h.add(g,palette.red);}
  // White quarter fairings flare over each outer engine; curved cross sections
  // have a rounded crown and merge tangentially into the thrust skirt.
  for(let k=0;k<4;k++){
   const a=k*Math.PI/2;
   const g=surface(14,32,(u,v)=>{const t=(v-.5)*Math.PI,bulge=1.05*(1-u)**1.35,xx=Math.sin(t)*1.26*(1-u)**.6,zz=5.0+bulge*Math.cos(t);return [xx*Math.cos(a)+zz*Math.sin(a),4.5+u*6.4,-xx*Math.sin(a)+zz*Math.cos(a)];},false);h.add(g,palette.white);
  }
 }
 return h.merge();
}
/** Bell profile is smoothly sampled rather than a seven-segment cone. */
export function engine(at:V,r:number,height:number,type:'f1'|'j2'|'sps'|'lm'){
 // One millimetre radial allowance keeps the nominal mouth separation
 // intact after meshopt position quantization.
 if(type==='f1')r-=.001;
 const h=new Hardware(),profile:number[][]=[];
 const bellFraction=type==='f1'||type==='j2'?.64:.76;
 const radius=(t:number)=>r*(.20+.80*(1-t)**1.15);
 for(let i=0;i<=(r<.3?6:24);i++){const t=i/(r<.3?6:24);profile.push([radius(t),at[1]-height/2+t*height*bellFraction]);}
 const neckTop=(type==='f1'||type==='j2')?at[1]+height*.34:at[1]+height/2;
 profile.push([r*.20,neckTop],[r*.16,neckTop]);
 for(let i=(r<.3?6:24);i>=0;i--){const t=i/(r<.3?6:24);profile.push([Math.max(.025,radius(t)-r*.025),at[1]-height/2+t*height*bellFraction]);}profile.push(profile[0]!);
 h.lathe([at[0],0,at[2]],profile,palette.glass,r<.3?24:type==='f1'?64:48);
 h.ring([at[0],at[1]-height/2+.025,at[2]],r-r*.025-.002,r*.025,palette.dark);
 const atY=(t:number)=>at[1]-height/2+t*height*bellFraction;
 // Cooling-tube banks, their circumference clamps, and the F-1 turbine-exhaust
 // collector at the nozzle-extension boundary are physical surface relief.
 for(let j=1;j<(r<.3?1:type==='lm'?2:7);j++){const t=j/11;h.ring([at[0],atY(t),at[2]],radius(t)+r*.012,r*.008,palette.silver);}
 const n=type==='f1'?64:type==='j2'?24:0;
 for(let j=0;j<n;j++){const a=TAU*j/n,pts:V[]=[];for(let k=0;k<7;k++){const t=.02+k/7*.98;pts.push([at[0]+(radius(t)+.012)*Math.sin(a),atY(t),at[2]+(radius(t)+.012)*Math.cos(a)]);}h.add(new TubeGeometry(new CatmullRomCurve3(pts.map(p=>new Vector3(...p))),8,r*.005,4,false),palette.silver);}
 if(type==='f1'||type==='j2'){
  const y=at[1]+height*.34;
  h.lathe([at[0],y,at[2]],[[0,-r*.32],[r*.18,-r*.32],[r*.27,-r*.22],[r*.29,0],[r*.26,r*.21],[r*.18,r*.26],[0,r*.26]],palette.silver,48);
  h.sphere([at[0]+r*.47,y-.03,at[2]],[r*.32,r*.27,r*.31],palette.grey);
  const pump=h.lathe([0,0,0],[[0,-r*.31],[r*.18,-r*.31],[r*.30,-r*.28],[r*.32,-r*.20],[r*.32,r*.20],[r*.30,r*.28],[r*.18,r*.31],[0,r*.31]],palette.silver,48);
  pump.rotateX(Math.PI/2).translate(at[0]+r*.47,y,at[2]);
  for(const side of [-1,1]){
   const flange=h.ring([0,0,0],r*.30,r*.025,palette.grey);flange.rotateX(Math.PI/2).translate(at[0]+r*.47,y,at[2]+side*r*.28);
   for(let j=0;j<12;j++){const a=j*TAU/12;h.sphere([at[0]+r*.47+r*.255*Math.sin(a),y+r*.255*Math.cos(a),at[2]+side*r*.315],[r*.019,r*.019,r*.014],palette.grey);}
  }
  for(const side of [-1,1]){
   const center:V=[at[0]+side*r*.62,y+r*.17,at[2]];
   const flange=h.ring([0,0,0],r*.13,r*.018,palette.grey);
   flange.rotateZ(Math.PI/2).translate(...center);
   for(let j=0;j<8;j++){const a=j*TAU/8;h.sphere([center[0],center[1]+r*.13*Math.sin(a),center[2]+r*.13*Math.cos(a)],[r*.011,r*.011,r*.011],palette.grey);}
  }
  // The front fuel-transfer elbow runs diagonally between the side pump
  // and injector housing, as in the NASA close-ups, rather than a mirror pair.
  h.pipe([[at[0]+r*.47,y,at[2]+r*.25],[at[0]+r*.1,y-r*.12,at[2]+r*.55],[at[0]-r*.46,y-r*.23,at[2]+r*.28]],r*.065,palette.grey,16);
  // Separate LOX and fuel feed elbows enter the pump housings and injector.
  h.pipe([[at[0]-r*.50,y+r*.25,at[2]],[at[0]-r*.75,y+r*.06,at[2]],[at[0]-r*.70,y-r*.28,at[2]],[at[0]-r*.28,y-r*.35,at[2]]],r*.11,palette.silver,16);
  h.pipe([[at[0]+r*.48,y+r*.4,at[2]],[at[0]+r*.79,y+r*.35,at[2]],[at[0]+r*.90,y-r*.12,at[2]],[at[0]+r*.42,y-r*.35,at[2]]],r*.085,palette.silver,16);
  for(let side=-1;side<=1;side+=2){
   h.lathe([at[0]+side*r*.56,y-r*.40,at[2]+r*.18],[[0,-r*.13],[r*.13,-r*.13],[r*.16,-r*.07],[r*.16,r*.07],[r*.13,r*.13],[0,r*.13]],palette.grey,32);
   h.pipe([[at[0]+side*r*.56,y-r*.40,at[2]+r*.18],[at[0]+side*r*.70,y-r*.05,at[2]+r*.35],[at[0]+side*r*.31,y+r*.20,at[2]+r*.24]],r*.035,palette.silver,12);
  }
  const t=type==='f1'?.28:.63;
  h.ring([at[0],atY(t),at[2]],radius(t)+r*.06,type==='f1'?r*.09:r*.04,palette.grey);
  h.pipe([[at[0]+r*.48,y,at[2]],[at[0]+r*.83,y-height*.17,at[2]],[at[0]+r*.72,atY(t)+r*.2,at[2]],[at[0]+radius(t),atY(t),at[2]]],r*.075,palette.silver,20);
  h.pipe([[at[0]-r*.16,y+r*.1,at[2]],[at[0]-r*.56,y+r*.1,at[2]],[at[0]-r*.64,y-r*.38,at[2]],[at[0]-r*.32,y-r*.54,at[2]]],r*.075,palette.silver,20);
  for(let k=0;k<4;k++){const a=k*Math.PI/2;h.rod([at[0]+r*.18*Math.sin(a),y+r*.2,at[2]+r*.18*Math.cos(a)],[at[0]+r*.24*Math.sin(a),y+r*.24,at[2]+r*.24*Math.cos(a)],r*.045);}
  // A dished heat shield above each F-1 separates bell radiation from hardware.
  if(type==='j2'){
   // The spherical hydrogen start tank is the identifying J-2 feature in
   // NASA R-16; the F-1 has no corresponding sphere.
   h.sphere([at[0]-.28*r,y+.03*r,at[2]+.48*r],[.34*r,.36*r,.34*r],palette.grey);
   h.pipe([[at[0]-.28*r,y-.3*r,at[2]+.48*r],[at[0]-.5*r,y-.45*r,at[2]+.34*r],[at[0]-.25*r,y-.52*r,at[2]+.16*r]],.035*r,palette.silver,10);
  }
  if(type==='f1')h.lathe([at[0],at[1]+height*.36,at[2]],[[r*.24,-.10],[r*.48,-.03],[r*.54,.06],[r*.50,.13],[r*.24,.04]],palette.grey,64);
 }
 return h.merge();
}
export function fins(){const h=new Hardware();for(let k=0;k<4;k++){
 const g=h.plate([0,0,0],[[0,4.1],[2.05,4.1],[2.05,5.5],[0,9.7]],.16,palette.white);
 // Airfoil bevel is explicit; root is on the outside of the curved fairing.
 g.rotateY(k*Math.PI/2).translate(5.18*Math.cos(k*Math.PI/2),0,-5.18*Math.sin(k*Math.PI/2));
 }return h.merge();}
export function escapeTower(){const h=new Hardware();
 for(let k=0;k<4;k++){
  const a=Math.PI/4+k*Math.PI/2,b=a+Math.PI/2;
  const pt=(t:number,ang:number):V=>[(.95-.51*t)*Math.sin(ang),100.5+t*4.2,(.95-.51*t)*Math.cos(ang)];
  h.rod(pt(0,a),pt(1,a),.049,palette.white);
  for(let j=0;j<3;j++){h.rod(pt(j/3,a),pt((j+1)/3,b),.032,palette.white);h.rod(pt(j/3,b),pt((j+1)/3,a),.032,palette.white);h.rod(pt((j+1)/3,a),pt((j+1)/3,b),.036,palette.white);}
  const nozzle=engine([0,0,0],.16,.42,'lm');nozzle.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,-1,0),new Vector3(Math.sin(a)*.55,-1,Math.cos(a)*.55).normalize())).translate(.36*Math.sin(a),104.6,.36*Math.cos(a));h.pieces.push(nozzle);
 }
 h.lathe([0,0,0],[[.22,104.4],[.38,104.65],[.38,109.6],[.33,109.8],[.33,110.15],[.25,110.5],[0,111]],palette.white,96);
 for(const y of [104.8,109.5,110.1])h.ring([0,y,0],y<110?.386:.335,.018,palette.grey);
 return h.merge();}
export function probe(){const h=new Hardware();h.lathe([0,0,0],[[.32,103.96],[.32,104.03],[.12,104.09],[.065,104.5],[.11,104.69],[.08,104.78],[0,104.8]],palette.silver,64);
 for(let i=0;i<3;i++){const a=i*TAU/3;h.rod([.27*Math.sin(a),104.02,.27*Math.cos(a)],[.10*Math.sin(a),104.58,.10*Math.cos(a)],.022);h.add(new SphereGeometry(1,20,12).scale(.035,.04,.035).translate(.1*Math.sin(a),104.66,.1*Math.cos(a)));}return h.merge();}
function quad(h:Hardware,at:V,a:number,scale=1){const local=new Hardware();
 // Four physically hollow thrusters: up/down and opposed tangential nozzles.
 for(const dir of [[0,1,0],[0,-1,0],[1,0,0],[-1,0,0]] as V[]){const g=engine([0,0,0],.09*scale,.24*scale,'lm');g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,-1,0),new Vector3(...dir))).translate(dir[0]*.18*scale,dir[1]*.18*scale,0);local.pieces.push(g);}
 local.plate([0,0,-.05],[[-.14,-.13],[.14,-.13],[.14,.13],[-.14,.13]],.14,palette.grey);
 const g=local.merge().rotateY(a).translate(...at);h.pieces.push(g);
}
export function serviceModule(){const h=new Hardware();
 h.lathe([0,0,0],[[1.95,94],[1.95,101],[1.88,101],[1.88,94],[1.95,94]],palette.silver,128);
 for(const y of [94.1,100.75,100.95])h.ring([0,y,0],1.958,.023,palette.grey);
 for(let k=0;k<6;k++){
  const a=TAU*k/6;
  h.rod([1.958*Math.sin(a),94.2,1.958*Math.cos(a)],[1.958*Math.sin(a),100.8,1.958*Math.cos(a)],.018,palette.grey);
  // Flush sector radiator panels are curved, with raised coolant channels.
  if(k===1||k===2||k===4||k===5){const g=surface(1,24,(u,v)=>{const t=a+(v-.5)*.70;return [1.97*Math.sin(t),94.65+u*2.4,1.97*Math.cos(t)];},false);h.add(g,palette.white);
   for(let j=0;j<16;j++){const y=94.72+j/15*2.26;h.pipe(Array.from({length:9},(_,i)=>{const t=a+(i/8-.5)*.66;return [1.982*Math.sin(t),y,1.982*Math.cos(t)] as V;}),.012,palette.silver,12);}
  }
  for(let j=0;j<5;j++)h.rod([1.98*Math.sin(a-.18),100.1+j*.12,1.98*Math.cos(a-.18)],[1.98*Math.sin(a+.18),100.1+j*.12,1.98*Math.cos(a+.18)],.018,palette.grey);
  h.plate([0,0,0],[[-.18,-.14],[.18,-.14],[.18,.14],[-.18,.14]],.025,palette.grey).rotateY(a).translate(1.976*Math.sin(a),99.8,1.976*Math.cos(a));
 }
 for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;quad(h,[2.03*Math.sin(a),99.4,2.03*Math.cos(a)],a);}
 // Apollo 11 high-gain antenna: four parabolic dishes, common gimbal and boom.
 const origin:V=[1.4,94.6,1.4];h.rod(origin,[2.6,93.85,2.6],.055);h.sphere([2.6,93.85,2.6],[.16,.16,.16],palette.grey);
 for(const x of [-.4,.4])for(const y of [-.4,.4]){
  h.rod([2.6,93.85,2.6],[2.8+x,93.9+y,2.8-x],.024,palette.grey);
  const g=surface(12,48,(u,v)=>{const r=u*.36,a=v*TAU;return [r*Math.cos(a),r*Math.sin(a),.14*(r/.36)**2];});g.rotateY(Math.PI/4).translate(2.8+x,93.9+y,2.8-x);h.add(g,palette.grey);
  h.rod([2.8+x,93.9+y,2.8-x],[2.98+x,93.9+y,2.98-x],.012);
 }
 return h.merge();}
export function commandModule(){const h=new Hardware();
 const profile:number[][]=[];for(let i=0;i<=32;i++){const t=i/32;profile.push([1.95-1.51*t+.045*Math.sin(Math.PI*t),101+3*t]);}for(let i=32;i>=0;i--){const t=i/32;profile.push([1.87-1.51*t,101+3*t]);}h.lathe([0,0,0],profile,palette.silver,128);
 h.ring([0,101.12,0],1.90,.024,palette.grey);h.ring([0,103.95,0],.48,.025,palette.grey);
 // Hatch and five recessed glass panes have independent raised frames.
 const hatch=surface(10,10,(u,v)=>{const x=(v-.5)*.78,y=101.75+u*.95,r=1.95-(y-101)*1.51/3+.045*Math.sin(Math.PI*(y-101)/3)+.035;return [x,y,Math.sqrt(r*r-x*x)];},false);h.add(hatch,palette.grey);
 const rim:V[]=[];for(const [a,b]of [[[-.37,101.77],[-.37,102.68]],[[-.37,102.68],[.37,102.68]],[[.37,102.68],[.37,101.77]],[[.37,101.77],[-.37,101.77]]] as [XY,XY][]){for(let j=0;j<9;j++){const x=a[0]+(b[0]-a[0])*j/8,y=a[1]+(b[1]-a[1])*j/8,r=1.95-(y-101)*1.51/3+.045*Math.sin(Math.PI*(y-101)/3)+.055;rim.push([x,y,Math.sqrt(r*r-x*x)]);}}rim.push(rim[0]!);h.pipe(rim,.017,palette.silver,64);
 for(const a of [-62,-26,0,26,62]){
  const rad=a*Math.PI/180,y=a===0?102.20:Math.abs(a)<40?103.15:102.6,r=1.95-(y-101)*1.51/3+.05;
  const shape:XY[]=[[-.15,-.14],[.15,-.14],[.13,.15],[-.13,.15]];
  h.plate([0,0,0],shape.map(p=>p.map(x=>x*1.24)),.035,palette.grey).rotateX(-.466).rotateY(rad).translate(r*Math.sin(rad),y,r*Math.cos(rad));
  h.plate([0,0,0],shape,.04,palette.dark).rotateX(-.466).rotateY(rad).translate((r+.025)*Math.sin(rad),y,(r+.025)*Math.cos(rad));
 }
 return h.merge();}
/** Irregular foil triangles form crinkles in geometry, no photograph or shader
 * displacement dependency. Border vertices remain exactly on shared seams. */
export function foilPanel(h:Hardware,corners:V[],color=palette.gold,seed=0){
 const [a,b,c,d]=corners as [V,V,V,V],rows=20,cols=18;
 let state=seed+991;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 // Irregular crease segments, each with its own length, width and sign. Foil
 // has sharp folds and broad slack areas; periodic waves produce quilted skin.
 const folds=Array.from({length:19},()=>({x:random(),y:random(),a:random()*TAU,len:.1+random()*.5,w:.012+random()*.035,h:(random()-.42)*.10}));
 const n=new Vector3(...b).sub(new Vector3(...a)).cross(new Vector3(...d).sub(new Vector3(...a))).normalize();
 const g=surface(rows,cols,(u,v)=>{
  const p=a.map((x,i)=>x*(1-u)*(1-v)+b[i]!*u*(1-v)+c[i]!*u*v+d[i]!*(1-u)*v) as V;
  let ridge=0;
  for(const f of folds){const dx=u-f.x,dy=v-f.y,t=dx*Math.cos(f.a)+dy*Math.sin(f.a),q=-dx*Math.sin(f.a)+dy*Math.cos(f.a);ridge+=f.h*Math.exp(-Math.abs(q)/f.w)*Math.max(0,1-Math.abs(t)/f.len);}
  const edge=Math.min(1,Math.min(u,v,1-u,1-v)*12);ridge*=edge;
  return [p[0]+n.x*ridge,p[1]+n.y*ridge,p[2]+n.z*ridge];
 },false);h.add(g,color);
}

export function descent(){const h=new Hardware();
 // The tank quadrants surround the central engine bay in a cruciform plan.
 const outline:XY[]=[[-.92,2.12],[.92,2.12],[1.47,1.60],[2.12,.92],[2.12,-.92],[1.60,-1.47],[.92,-2.12],[-.92,-2.12],[-1.47,-1.60],[-2.12,-.92],[-2.12,.92],[-1.60,1.47]];
 for(let i=0;i<outline.length;i++){const a=outline[i]!,b=outline[(i+1)%outline.length]!,c=[0,2,5,8].includes(i)?palette.dark:palette.gold;foilPanel(h,[[a[0],87.05,a[1]],[a[0],88.8,a[1]],[b[0],88.8,b[1]],[b[0],87.05,b[1]]],c,i);
  h.rod([a[0],87.05,a[1]],[a[0],88.8,a[1]],.018,palette.grey);
  foilPanel(h,[[a[0],88.8,a[1]],[b[0],88.8,b[1]],[b[0]*.34,88.8,b[1]*.34],[a[0]*.34,88.8,a[1]*.34]],palette.gold,i+14);
 }
 h.lathe([0,88.8,0],[[.72,0],[.72,-1.75],[.78,-1.75],[.78,0],[.72,0]],palette.grey,64);
 for(const x of [-.85,.85])for(const z of [-.65,.65]){h.rod([x,88.8,z],[x*.9,89.18,z*.9],.065,palette.silver);h.ring([x,88.84,z],.10,.018,palette.grey);}
 // Forward equipment blanket, porch and black thermal shields sit on structure.
 // The forward black blanket is the outer skin itself; a second wrinkled
 // sheet at the same station would intersect it and create false bald patches.
 for(const x of [-1,1])h.plate([0,0,0],[[-.3,-.12],[.3,-.12],[.24,.22],[-.24,.22]],.025,palette.dark).rotateX(Math.PI/2).translate(x*1.25,88.95,.6);
 return h.merge();}
export function gear(){const h=new Hardware();
 for(let k=0;k<4;k++){
  const a=k*Math.PI/2,rot=(p:V):V=>[p[0]*Math.cos(a)+p[2]*Math.sin(a),p[1],-p[0]*Math.sin(a)+p[2]*Math.cos(a)];
  const top:V=[0,88.45,2.02],joint:V=[0,86.85,3.7],pad:V=[0,85.72,4.25];
  h.rod(rot(top),rot(joint),.105,palette.gold);
  const root=new Vector3(...rot(top)),end=new Vector3(...rot(joint)),axis=end.clone().sub(root),length=axis.length(),q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),axis.normalize());
  const blanket=surface(22,20,(u,v)=>{const a=v*TAU,r=.125+.014*Math.sin(u*77+v*32+k)+.009*Math.sin(u*39-v*55);const p=new Vector3(r*Math.cos(a),u*length,r*Math.sin(a)).applyQuaternion(q).add(root);return p.toArray() as V;});h.add(blanket,palette.gold);h.rod(rot(joint),rot(pad),.062,palette.silver);
  for(const s of [-1,1]){
   h.rod(rot([s*.84,87.22,1.75]),rot(joint),.064,palette.gold);
   h.rod(rot([s*.84,87.22,1.75]),rot([s*.88,86.45,3.02]),.047,palette.grey);
   h.rod(rot([s*.88,86.45,3.02]),rot(joint),.047,palette.grey);
   h.rod(rot([s*.88,86.45,3.02]),rot([0,87.5,2.65]),.037,palette.silver);
  }
  h.sphere(rot(joint),[.14,.14,.14],palette.grey);
  const g=new LatheGeometry([[0,0],[.3,0],[.46,.045],[.47,.08],[.43,.14],[.28,.17],[.08,.12],[0,.12]].map(p=>new Vector2(...p as [number,number])),64).translate(0,85.6,4.25).rotateY(a);h.add(g,palette.gold);
  // Three contact probes; the ladder/forward leg deliberately has none.
  if(k!==0)h.pipe([rot([.15,85.71,4.15]),rot([.32,85.65,4.4]),rot([.32,85.65,4.9])],.015,palette.silver,3);
 }
 return h.merge();}
export function ladder(){const h=new Hardware();for(const s of [-1,1])h.pipe([[s*.24,89.1,1.8],[s*.24,88.7,2.45],[s*.24,86.2,4.05]],.029);
 for(let i=0;i<9;i++){const t=i/8;h.rod([-.24,88.65-t*2.4,2.48+t*1.53],[.24,88.65-t*2.4,2.48+t*1.53],.025);}
 h.plate([0,0,0],[[-.43,-.29],[.43,-.29],[.43,.29],[-.43,.29]],.035,palette.silver).rotateX(Math.PI/2).translate(0,89.08,2.06);return h.merge();}
/** Retain NASA's non-regular cabin, side tanks and antenna supports. Recolour
 * each material region to plate tokens and bake to one selectable surface. */
export async function ascent(){
 const io=await sourceIO(),doc=await io.read('scripts/geo/saturn-v/nasa-lm-source.glb');await doc.transform(dequantize());
 const h=new Hardware();
 const exclude=new Set(['pPipe1','pPipe2','polySurfa1','pCylinder1','pCylinder2','pCylinder3','pCylinder6','pCylinder7','pCylinder8','pCylinde11','pCube3','pPlane1','pPlane2','group13 p2','group13 pC']);
 for(const node of doc.getRoot().listNodes()){
  const name=node.getName();if(exclude.has(name)||name.startsWith('group31')||name.startsWith('group73')||name.startsWith('group74')||name.startsWith('group75')&&!['group75 g1','group75 g2','group75 g3','group75 gr','group75 p7','group75 p8'].includes(name))continue;
  for(const p of node.getMesh()?.listPrimitives()??[]){
   const pos=p.getAttribute('POSITION')!,normal=p.getAttribute('NORMAL'),g=new BufferGeometry();
   g.setAttribute('position',new Float32BufferAttribute(pos.getArray()!,3));if(normal)g.setAttribute('normal',new Float32BufferAttribute(normal.getArray()!,3));
   const idx=p.getIndices();if(idx)g.setIndex(Array.from(idx.getArray()!));if(!normal)g.computeVertexNormals();
   g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));
   g.computeBoundingBox();const b=g.boundingBox!;
   if(b.min.x>-.3&&b.max.z>1.60&&b.min.y>4.35){g.translate(-.035,-4.4,-1.62).rotateX(-Math.PI/2).translate(.035,4.4,1.62);}
   g.scale(1.22,1.32,1.22).translate(0,85.98,0);
   const mat=p.getMaterial()!.getName();
   const color=mat.startsWith('blinn6')||['pCube2','pCube28','pCube29'].includes(name)?palette.dark:mat.startsWith('blinn1S')?palette.grey:palette.silver;
   h.add(g,color);
   if(name==='polySurfac'){const p=g.getAttribute('position'),n=g.getAttribute('normal'),c=g.getAttribute('color'),col=new Color(palette.dark);for(let i=0;i<p.count;i++)if(p.getZ(i)>1.65&&p.getY(i)>90.85&&p.getY(i)<91.75&&n.getZ(i)>.25)c.setXYZ(i,col.r,col.g,col.b);}
  }
 }
 // Source windows are painted silver. Add real recessed triangular glazing in
 // the forward canted facets, with a raised pressure-seal frame and reveals.
 return h.merge();
}
/** Clip the pressure skin at each actual window aperture. The planar glass
 * sits behind its seal, so no paint/decal can stand in for a real opening. */
export function windows(cabin:BufferGeometry){const h=new Hardware(),mesh=new Mesh(cabin.clone(),new MeshBasicMaterial({side:DoubleSide})),ray=new Raycaster();mesh.updateMatrixWorld();
 const zAt=(x:number,y:number)=>{ray.set(new Vector3(x,y,6),new Vector3(0,0,-1));return ray.intersectObject(mesh)[0]?.point.z??1.65;};
 const apertures:XY[][]=[];
 for(const side of [-1,1]){const poly:XY[]=[[-.32,.24],[.32,.24],[side>0?-.18:.18,-.25]],cx=side*.65,cy=91.22,points=poly.map(([x,y])=>[x+cx,y+cy] as XY);apertures.push(points);
  const corners=points.map(([x,y])=>new Vector3(x,y,zAt(x,y))),normal=corners[1]!.clone().sub(corners[0]!).cross(corners[2]!.clone().sub(corners[0]!)).normalize(),zPlane=(x:number,y:number)=>corners[0]!.z-(normal.x*(x-corners[0]!.x)+normal.y*(y-corners[0]!.y))/normal.z;
  const g=h.plate([cx,cy,0],poly,.035,palette.dark),pos=g.getAttribute('position');for(let i=0;i<pos.count;i++)pos.setZ(i,zPlane(pos.getX(i),pos.getY(i))+.018+pos.getZ(i));g.computeVertexNormals();
  for(let i=0;i<3;i++){const a=points[i]!,b=points[(i+1)%3]!;h.rod([a[0],a[1],zPlane(...a)+.055],[b[0],b[1],zPlane(...b)+.055],.020,palette.grey);}
 }
 type Vertex={p:V;n:V;c:V};
 const result:{p:number[];n:number[];c:number[]}={p:[],n:[],c:[]},p=cabin.getAttribute('position'),n=cabin.getAttribute('normal'),c=cabin.getAttribute('color'),ix=cabin.index;
 const vertex=(i:number):Vertex=>({p:[p.getX(i),p.getY(i),p.getZ(i)],n:[n.getX(i),n.getY(i),n.getZ(i)],c:[c.getX(i),c.getY(i),c.getZ(i)]});
 const mix=(a:Vertex,b:Vertex,t:number):Vertex=>Object.fromEntries(['p','n','c'].map(k=>[k,(a[k as keyof Vertex]).map((v,i)=>v+(b[k as keyof Vertex][i]!-v)*t)])) as Vertex;
 const cross=(a:XY,b:XY,v:Vertex)=>(b[0]-a[0])*(v.p[1]-a[1])-(b[1]-a[1])*(v.p[0]-a[0]);
 const clip=(poly:Vertex[],a:XY,b:XY,inside:boolean)=>{const out:Vertex[]=[];for(let i=0;i<poly.length;i++){const v=poly[i]!,w=poly[(i+1)%poly.length]!,dv=cross(a,b,v),dw=cross(a,b,w),iv=inside?dv<=0:dv>=0,iw=inside?dw<=0:dw>=0;if(iv)out.push(v);if(iv!==iw)out.push(mix(v,w,dv/(dv-dw)));}return out;};
 const subtract=(poly:Vertex[],hole:XY[])=>{const output:Vertex[][]=[];let pending=poly;for(let i=0;i<3&&pending.length;i++){const a=hole[i]!,b=hole[(i+1)%3]!,outside=clip(pending,a,b,false);if(outside.length>=3)output.push(outside);pending=clip(pending,a,b,true);}return output;};
 for(let t=0;t<(ix?.count??p.count);t+=3){const tri=[0,1,2].map(k=>vertex(ix?ix.getX(t+k):t+k));let polys=[tri];
  if(tri.every(v=>v.p[2]>.9)&&tri.some(v=>v.n[2]>.25))for(const hole of apertures)polys=polys.flatMap(poly=>subtract(poly,hole));
  for(const poly of polys)for(let i=1;i<poly.length-1;i++)for(const v of [poly[0]!,poly[i]!,poly[i+1]!]){result.p.push(...v.p);result.n.push(...v.n);result.c.push(...v.c);}
 }
 const cut=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(result.p,3)).setAttribute('normal',new Float32BufferAttribute(result.n,3)).setAttribute('color',new Float32BufferAttribute(result.c,3));cabin.copy(mergeVertices(cut,.000001));cut.dispose();mesh.geometry.dispose();(mesh.material as MeshBasicMaterial).dispose();return h.merge();}
export function couches(){const h=new Hardware();for(const x of [-.65,0,.65]){
 for(const s of [-1,1])h.pipe([[x+s*.24,101.6,.87],[x+s*.24,101.8,-.38],[x+s*.24,102.48,-.55]],.023,palette.silver);
 for(let j=0;j<8;j++){const y=101.78+j*.072,z=-.32-j*.035;h.rod([x-.23,y,z],[x+.23,y,z],.019,palette.grey);}
 h.add(surface(6,10,(u,v)=>[x+(v-.5)*.44,101.78-.045*Math.sin(Math.PI*u)*Math.sin(Math.PI*v),-.25+u*.98]),palette.grey);
 h.add(surface(8,8,(u,v)=>[x+(v-.5)*.44,101.80+u*.66,-.34-u*.25+.035*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)]),palette.grey);
 }return h.merge();}

export function adapter(){const h=new Hardware();
 for(let k=0;k<4;k++){
  for(const inner of [false,true]){const g=surface(1,64,(u,v)=>{const y=85.59+8.41*u,r=3.305-1.355*u-(inner?.065:0),a=k*Math.PI/2+.004+v*(Math.PI/2-.008);return [r*Math.sin(a),y,r*Math.cos(a)];},false);h.add(g,inner?palette.grey:palette.white);}
  const a=k*Math.PI/2;h.rod([3.31*Math.sin(a),85.61,3.31*Math.cos(a)],[1.96*Math.sin(a),93.99,1.96*Math.cos(a)],.024,palette.grey);
  for(const y of [85.70,93.84]){const r=3.305-1.355*(y-85.59)/8.41;for(let j=1;j<10;j++){const a=(k+j/10)*Math.PI/2;h.sphere([r*Math.sin(a),y,r*Math.cos(a)],[.018,.018,.018],palette.grey);}}
 }h.ring([0,85.62,0],3.30,.042,palette.grey);h.ring([0,93.96,0],1.96,.035,palette.grey);return h.merge();
}
export function instrumentUnit(){const h=new Hardware();h.lathe([0,0,0],[[3.305,84.67],[3.305,85.59],[3.24,85.59],[3.24,84.67],[3.305,84.67]],palette.dark,128);for(const y of [84.7,85.56])h.ring([0,y,0],3.31,.02,palette.grey);for(let i=0;i<12;i++){const a=TAU*i/12;h.plate([0,0,0],[[-.14,-.2],[.14,-.2],[.14,.2],[-.14,.2]],.02,palette.grey).rotateY(a).translate(3.32*Math.sin(a),85.13,3.32*Math.cos(a));}return h.merge();}

/** Offline z-buffer PBR preview using decoded shipping GLB and engine primitives.
 * Reuses fossils studio raster and RoomEnvironment integration; no browser.
 * pnpm tsx scripts/geo/how-planes-fly/preview-studio.ts <slug> <round> [baseline]
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {BufferAttribute,BufferGeometry,Matrix3,Matrix4,PerspectiveCamera,OrthographicCamera,Vector3,Color} from 'three';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {prepareStudio,studioShade,studioRigs,aces} from '../kits/aircraft-studio-cpu';
import {partsFile,type Part} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts';
import {W as AIRCRAFT,E as ENGINE_PARTS} from './layout';
const slug=process.argv[2]??'how-planes-fly',prefix=process.argv[3]??'round1';
const baseline=process.argv[4];
const file=partsFile.parse(JSON.parse(fs.readFileSync(baseline??`src/content/topics/${slug}/data/parts.json`,'utf8')));
const out=`scripts/geo/${slug}/evidence/${prefix}`;fs.mkdirSync(out,{recursive:true});
const meshes=new Map<string,BufferGeometry>();
if(file.model){
 await MeshoptDecoder.ready;
 const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(`public${file.model}`);await doc.transform(dequantize());
 for(const node of doc.getRoot().listNodes()){
  const prim=node.getMesh()?.listPrimitives()[0];if(!prim)continue;const g=new BufferGeometry();
  for(const [name,type]of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']]as const){const a=prim.getAttribute(type);if(a)g.setAttribute(name,new BufferAttribute(new Float32Array(a.getArray()!),3));}
  const material=prim.getMaterial();g.userData.surface=material?.getExtras().atlasSurface===true?{factor:material.getBaseColorFactor().slice(0,3),roughness:material.getRoughnessFactor(),metalness:material.getMetallicFactor()}:null;
  const idx=prim.getIndices();if(idx)g.setIndex(new BufferAttribute(new Uint32Array(idx.getArray()!),1));
  g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));meshes.set(node.getName(),g);
 }
}
let currentCut:number|undefined;
type Surface={positions:Float32Array;normals:Float32Array;colors:Float32Array;rgb:Color;floor:boolean;opacity:number;envIntensity:number;roughness:number;metalness:number;id:string};
const tokens:Record<string,Record<string,string>>={paper:{},cinema:{}};
// Always resolve the new fossil tint from the actual theme tokens.
const css=fs.readFileSync('src/theme/tokens.css','utf8');
for(const theme of ['paper','cinema']){
 const at=css.indexOf(`:root[data-theme="${theme}"] {`),body=css.slice(at,css.indexOf('\n}',at));
 Object.assign(tokens[theme]!,Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1]!,m[2]!] )));
}
function surfaces(parts:Part[],theme:string,explode=false){
 const result:Surface[]=[];
 for(const part of parts){
  const slots=partMaterialSlots(part),offset=new Vector3(...(part.primitive?.at??[0,0,0]));
  if(explode)offset.add(new Vector3(...part.explode.dir).normalize().multiplyScalar(part.explode.dist));
  const pieces=part.mesh?[{geometry:meshes.get(part.mesh)!,matrices:null,slot:0}]:partPieces(part);
  for(const piece of pieces){if('lines'in piece&&piece.lines)continue;
   const g=piece.geometry, ps=g.getAttribute('position'), ns=g.getAttribute('normal'),idx=g.index;
   const slot=part.mesh?part.material??slots[0]:slots[piece.slot??0];
   const look=resolveMaterialLook(slot?.color??'plastic',tokens[theme]!,theme as 'paper'|'cinema',slot?.tint);
   // Powder ink is retained as authored by the topic (technical-plate palette).
   const rgb=new Color(look.color),surface=g.userData.surface;
   if(surface)rgb.setRGB(rgb.r*surface.factor[0],rgb.g*surface.factor[1],rgb.b*surface.factor[2]);
   if(slot?.color==='abrasive')rgb.multiplyScalar(.65); // mean of the existing sand albedo map
   for(const matrix of piece.matrices??[new Matrix4()]){
    const n=(idx?.count??ps.count),positions=new Float32Array(n*3),normals=new Float32Array(n*3),colors=new Float32Array(n*3),nm=new Matrix3().getNormalMatrix(matrix);
    const v=new Vector3(),normal=new Vector3();
    for(let i=0;i<n;i++){const j=idx?idx.getX(i):i;v.fromBufferAttribute(ps,j).applyMatrix4(matrix);if(!part.mesh||explode)v.add(offset);normal.fromBufferAttribute(ns,j).applyMatrix3(nm).normalize();positions.set(v.toArray(),i*3);normals.set(normal.toArray(),i*3);const vc=g.getAttribute('color');colors.set(vc?[vc.getX(j),vc.getY(j),vc.getZ(j)]:[1,1,1],i*3);}
    result.push({positions,normals,colors,rgb,floor:part.context===true,opacity:look.opacity,envIntensity:look.envIntensity,roughness:surface?.roughness??look.roughness*.92,metalness:surface?.metalness??look.metalness,id:part.id});
   }
  }
 }
 return result;
}
prepareStudio();
const W=900,H=700;
function render(shapes:Surface[],camera:PerspectiveCamera,theme:string,caption:string){
 const depth=new Float32Array(W*H).fill(Infinity),rgb=new Float32Array(W*H*3),normal=new Float32Array(W*H*3);
 const shadowW=1200,sd=new Float32Array(shadowW*shadowW).fill(Infinity);
 const shadowCam=new OrthographicCamera(-8,8,8,-8,.1,60);shadowCam.position.set(6,20,10);shadowCam.lookAt(0,0,0);shadowCam.updateMatrixWorld();shadowCam.updateProjectionMatrix();
 const sm=new Matrix4().multiplyMatrices(shadowCam.projectionMatrix,shadowCam.matrixWorldInverse);
 const cm=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
 // Screen barycentric rasterizer. Smooth interpolated vertex normals, real depth.
 function raster(s:Surface,matrix:Matrix4,width:number,height:number,shade:boolean){
  const points=s.positions,ns=s.normals,v=new Vector3(),q:number[]=new Array(9),iw:number[]=new Array(3);
  for(let t=0;t<points.length;t+=9){
   if(shade){const a=new Vector3().fromArray(points,t),b=new Vector3().fromArray(points,t+3),c=new Vector3().fromArray(points,t+6);if(b.sub(a).cross(c.sub(a)).dot(camera.position.clone().sub(a))<=0)continue;}
   for(let k=0;k<3;k++){v.fromArray(points,t+k*3);const e=matrix.elements;iw[k]=1/(e[3]!*v.x+e[7]!*v.y+e[11]!*v.z+e[15]!);v.applyMatrix4(matrix);q[k*3]=(v.x*.5+.5)*width;q[k*3+1]=(-v.y*.5+.5)*height;q[k*3+2]=v.z;}
   // A close-up can leave the distant skull/tail behind its near plane.
   // Reject crossing triangles instead of projecting them across the image.
   if([q[2]!,q[5]!,q[8]!].some(z=>z < -1 || z > 1))continue;
   const ax=q[0]!,ay=q[1]!,bx=q[3]!,by=q[4]!,cx=q[6]!,cy=q[7]!;
   const d=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(d)<1e-7)continue;
   const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(width-1,Math.ceil(Math.max(ax,bx,cx)));
   const y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(height-1,Math.ceil(Math.max(ay,by,cy)));
   if(x0>x1||y0>y1)continue;
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    let a=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/d,b=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/d,c=1-a-b;
    if(a<0||b<0||c<0)continue;const z=a*q[2]!+b*q[5]!+c*q[8]!;const pi=y*width+x;
    if(!shade){if(!s.floor&&z<sd[pi]!)sd[pi]=z;continue;}
    if(z>=depth[pi]!)continue;
    const total=a*iw[0]!+b*iw[1]!+c*iw[2]!;a=a*iw[0]!/total;b=b*iw[1]!/total;c=c*iw[2]!/total;
    const n=pi*3;normal[n]=a*ns[t]!+b*ns[t+3]!+c*ns[t+6]!;normal[n+1]=a*ns[t+1]!+b*ns[t+4]!+c*ns[t+7]!;normal[n+2]=a*ns[t+2]!+b*ns[t+5]!+c*ns[t+8]!;
    let shadow=1;
    if(file.views.shadows!=='none'&&s.floor){v.set(a*points[t]!+b*points[t+3]!+c*points[t+6]!,a*points[t+1]!+b*points[t+4]!+c*points[t+7]!,a*points[t+2]!+b*points[t+5]!+c*points[t+8]!).applyMatrix4(sm);const sx=Math.floor((v.x*.5+.5)*shadowW),sy=Math.floor((-.5*v.y+.5)*shadowW);if(sx>=0&&sy>=0&&sx<shadowW&&sy<shadowW&&v.z>sd[sy*shadowW+sx]!+.0003)shadow=.65;}
    const len=Math.hypot(normal[n]!,normal[n+1]!,normal[n+2]!)||1;
    const nrm:[number,number,number]=[normal[n]!/len,normal[n+1]!/len,normal[n+2]!/len];
    const position=new Vector3(a*points[t]!+b*points[t+3]!+c*points[t+6]!,a*points[t+1]!+b*points[t+4]!+c*points[t+7]!,a*points[t+2]!+b*points[t+5]!+c*points[t+8]!);
    const view=camera.position.clone().sub(position).normalize();
    // Back faces are culled by the engine. Interpolation on a silhouette can
    // leave a tiny negative dot; skip those samples too.
    if(nrm[0]*view.x+nrm[1]*view.y+nrm[2]*view.z<=0)continue;depth[pi]=z;
    const base=s.rgb.toArray().map((v,i)=>v*(a*s.colors[t+i]!+b*s.colors[t+3+i]!+c*s.colors[t+6+i]!)) as [number,number,number];
    const lit=studioShade(base,nrm,view.toArray() as [number,number,number],theme as 'paper'|'cinema',s.roughness,s.metalness,s.envIntensity);
    const alpha=s.opacity;for(let k=0;k<3;k++)rgb[n+k]=rgb[n+k]!*(1-alpha)+lit[k]!*shadow*alpha;

   }
  }
 }
 for(const s of shapes)raster(s,sm,shadowW,shadowW,false);
 for(const s of [...shapes].sort((a,b)=>b.opacity-a.opacity))raster(s,cm,W,H,true);
 const output=new Uint8Array(W*H*3),bg=new Color(theme==='paper'?'#e9e4d8':'#1f2124'),color=new Color();
 for(let i=0;i<W*H;i++){if(depth[i]===Infinity)color.copy(bg);else color.fromArray(aces([rgb[i*3]!,rgb[i*3+1]!,rgb[i*3+2]!],studioRigs[theme as 'paper'|'cinema'].exposure));color.convertLinearToSRGB();output[i*3]=Math.round(color.r*255);output[i*3+1]=Math.round(color.g*255);output[i*3+2]=Math.round(color.b*255);}
 return sharp(output,{raw:{width:W,height:H,channels:3}}).composite([{input:Buffer.from(`<svg width="${W}" height="${H}"><rect x="0" y="0" width="1600" height="43" fill="${theme==='paper'?'#e9e4d8':'#1f2124'}"/><text x="20" y="28" font-family="sans-serif" font-size="19" fill="${theme==='paper'?'#2a2824':'#e7e5df'}">${caption} · offline CPU depth raster; engine studio rig / CPU PBR + sampled RoomEnvironment</text></svg>`)}]).png();
}

/** Match the engine's section plane with vertex/normal interpolation. */
function clipSurfaces(shapes:Surface[],z:number):Surface[]{return shapes.map(s=>{
 const positions:number[]=[],normals:number[]=[],colors:number[]=[];
 for(let t=0;t<s.positions.length;t+=9){
  let polygon=[0,1,2].map(k=>({p:Array.from(s.positions.slice(t+k*3,t+k*3+3)),n:Array.from(s.normals.slice(t+k*3,t+k*3+3)),c:Array.from(s.colors.slice(t+k*3,t+k*3+3))}));
  const clipped:typeof polygon=[];
  for(let i=0;i<polygon.length;i++){const a=polygon[i]!,b=polygon[(i+1)%polygon.length]!,inside=a.p[2]!<=z,next=b.p[2]!<=z;if(inside)clipped.push(a);if(inside!==next){const f=(z-a.p[2]!)/(b.p[2]!-a.p[2]!);clipped.push({p:a.p.map((v,j)=>v+(b.p[j]!-v)*f),n:a.n.map((v,j)=>v+(b.n[j]!-v)*f),c:a.c.map((v,j)=>v+(b.c[j]!-v)*f)});}}
  polygon=clipped;for(let i=1;i+1<polygon.length;i++)for(const v of [polygon[0]!,polygon[i]!,polygon[i+1]!]){positions.push(...v.p);normals.push(...v.n);colors.push(...v.c);}
 }return {...s,positions:new Float32Array(positions),normals:new Float32Array(normals),colors:new Float32Array(colors)};
});}
const cam=(position:number[],target:number[],fov=30)=>{const c=new PerspectiveCamera(fov,W/H,.01,100);c.position.fromArray(position);c.lookAt(new Vector3().fromArray(target));c.updateMatrixWorld();return c;};
const byIds=(ids:readonly string[])=>file.parts.filter(p=>ids.includes(p.id));
const plane=byIds(AIRCRAFT),engine=byIds(ENGINE_PARTS),board=byIds(['inverter-board']);
const shots=slug==='how-planes-fly'?[
 {name:'front',parts:plane,camera:cam([-8,1.23,0],[0,1.1,0])},
 {name:'three-quarter',parts:plane,camera:cam([-2,.55,7],[0,1.12,0])},
 {name:'hero',parts:plane,camera:cam([-5,3.7,6],[0,1.12,0])},
 {name:'profile',parts:plane,camera:cam([0,1.4,9],[0,1.1,0])},
 {name:'nose-close',parts:byIds(['fuselage-shell','cockpit-glazing']),camera:cam([-1.72,1.27,1.7],[-1.68,1.13,0],29)},
 {name:'wing-root',parts:plane,camera:cam([-.9,.2,2.4],[-.1,1.03,.3],34)},
 {name:'tail-close',parts:plane,camera:cam([3.4,2.2,2.0],[1.65,1.43,0],35)},
 {name:'engine-front',parts:engine,camera:cam([-3.8,1.1,-2.5],[-.1,.8,-2.8])},
 {name:'engine-three-quarter',parts:engine,camera:cam([-1.8,2.6,.3],[-.1,.8,-2.8]),cut:-2.8},
 {name:'engine-profile',parts:engine,camera:cam([-.1,1.05,2.2],[-.1,.8,-2.8]),cut:-2.8},
 {name:'engine-blades',parts:byIds(['compressor-bank','compressor-rotor','hp-shaft','lp-shaft']),camera:cam([-.75,1.25,-1.85],[-.26,.84,-2.8],32),cut:-2.8},
]:[
 {name:'front',parts:board,camera:cam([.872,.69,.73],[.872,.49,.02],29)},
 {name:'three-quarter',parts:board,camera:cam([1.2,.88,.53],[.857,.49,.02],29)},
 {name:'profile',parts:board,camera:cam([1.5,.57,.02],[.872,.49,.02],29)},
 {name:'caps-close',parts:board,camera:cam([.98,.68,.12],[.88,.515,-.025],34)},
 {name:'installed',parts:file.parts.filter(p=>p.group==='outdoor'&&!['outdoor-top','outdoor-front','outdoor-side'].includes(p.id)),camera:cam([1.8,1.25,1.7],[.65,.29,0],30)},
];
const stats=Object.fromEntries(file.parts.map(p=>{const pieces=p.mesh?[{geometry:meshes.get(p.mesh)!,matrices:null}]:partPieces(p);return[p.id,{triangles:pieces.reduce((s,q)=>s+(q.geometry.index?.count??q.geometry.getAttribute('position').count)/3*(q.matrices?.length??1),0),draws:pieces.length}];}));
fs.writeFileSync(`${out}/counts.json`,JSON.stringify(stats,null,2));
const hash=(path:string)=>createHash('sha256').update(fs.readFileSync(path)).digest('hex');
fs.writeFileSync(`${out}/manifest.json`,JSON.stringify({partsSHA256:hash(baseline??`src/content/topics/${slug}/data/parts.json`),modelSHA256:file.model?hash(`public${file.model}`):null,lightingSHA256:hash('src/engines/space-scene/stages/model3d/Lighting.tsx'),rig:studioRigs,shots:shots.map(s=>({name:s.name,position:s.camera.position.toArray(),fov:s.camera.fov})),limitation:'CPU PBR and sampled RoomEnvironment; no GPU, HUD or shadow-map acceptance.'},null,2));
for(const shot of shots){
 if(process.env.ATLAS_PREVIEW_SHOT&&!process.env.ATLAS_PREVIEW_SHOT.split(',').includes(shot.name))continue;
 currentCut='cut'in shot?shot.cut:undefined;
 for(const theme of ['paper','cinema']as const){if(theme==='cinema'&&!['three-quarter','engine-profile'].includes(shot.name))continue;
  const shapes=surfaces(shot.parts,theme);
  await render(currentCut===undefined?shapes:clipSurfaces(shapes,currentCut),shot.camera,theme,`${slug} / ${prefix} / ${shot.name} / ${theme}`).toFile(`${out}/${shot.name}-${theme}.png`);console.log(out+'/'+shot.name+'-'+theme);
 }
}

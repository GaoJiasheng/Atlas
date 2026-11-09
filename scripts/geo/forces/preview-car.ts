/** Offline z-buffer raster of actual engine geometry. Lighting-matched CPU PBR,
 * not a browser/GPU acceptance image. No browser, WebGL, or runtime downloads.
 * pnpm tsx scripts/geo/fossils-and-skeletons/studio-preview.ts [prefix] [baseline-dir]
 */
import fs from 'node:fs';
import { prepareStudio, studioShade, studioRigs, aces } from './hardware-studio-cpu';
import sharp from 'sharp';
import { BufferAttribute, BufferGeometry, Matrix4, Matrix3, PerspectiveCamera, OrthographicCamera, Vector3, Color } from 'three';

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { partsFile, type Part } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { resolveMaterialLook } from '../../../src/engines/space-scene/lib/color';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
const prefix=process.argv[2]??'round1';
const dir=`scripts/geo/forces/evidence/${prefix}`;
const file=partsFile.parse(JSON.parse(fs.readFileSync(`${dir}/parts.json`,'utf8')));
const out=`${dir}/comparisons`;fs.mkdirSync(out,{recursive:true});
await MeshoptDecoder.ready;
const doc=file.model ? await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(`${dir}/forces.glb`):null;
if(doc)await doc.transform(dequantize());
const meshes=new Map<string,BufferGeometry>();
for(const node of doc?.getRoot().listNodes()??[]){
 const prim=node.getMesh()?.listPrimitives()[0];if(!prim)continue;const g=new BufferGeometry();
 for(const [name,type] of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']] as const){const a=prim.getAttribute(type);if(a)g.setAttribute(name,new BufferAttribute(new Float32Array(a.getArray()!),3));}
 const material=prim.getMaterial();g.userData.surface=material?.getExtras().atlasSurface===true?{factor:material.getBaseColorFactor().slice(0,3),roughness:material.getRoughnessFactor(),metalness:material.getMetallicFactor()}:null;
 const idx=prim.getIndices();if(idx)g.setIndex(new BufferAttribute(new Uint32Array(idx.getArray()!),1));
 g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));meshes.set(node.getName(),g);
}
fs.writeFileSync(`${out}/${prefix}-mesh-bounds.json`,JSON.stringify(Object.fromEntries([...meshes].map(([id,g])=>{g.computeBoundingBox();return [id,{min:g.boundingBox!.min.toArray(),max:g.boundingBox!.max.toArray()}];})),null,2));
type Surface={positions:Float32Array;normals:Float32Array;colors:Float32Array;rgb:Color;floor:boolean;opacity:number;roughness:number;metalness:number;environment:number;id:string};
const tokens:Record<string,Record<string,string>>={paper:{bone:'#e0d6bf','ink-2':'#555047',neutral:'#8a8378',cold:'#4f7f8c','f-drag':'#93602e',lamp:'#ffc96b',mannequin:'#bfb8ac','ink-3':'#857d70','muscle-3':'#8f6a62','carbon-dioxide':'#5e554e'},cinema:{bone:'#cfc5af','ink-2':'#b9b4a8',neutral:'#938c80',cold:'#78a4ae','f-drag':'#d0a16c',lamp:'#ffd88f',mannequin:'#6f7174','ink-3':'#8c877c','muscle-3':'#70443f','carbon-dioxide':'#8a786a'}};
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
    result.push({positions,normals,colors,rgb,floor:part.context===true,opacity:look.opacity,roughness:surface?.roughness??look.roughness*.92,metalness:surface?.metalness??look.metalness,environment:look.envIntensity,id:part.id});
   }
  }
 }
 return result;
}
prepareStudio();
const measurements:Record<string,unknown>={};
const W=Number(process.env.ATLAS_PREVIEW_WIDTH??900),H=Number(process.env.ATLAS_PREVIEW_HEIGHT??600);
function render(shapes:Surface[],camera:PerspectiveCamera,theme:string,caption:string){
 const coverage=new Map<string,Set<number>>();
 const ids=new Array<string>(W*H).fill(''),depth=new Float32Array(W*H).fill(Infinity),rgb=new Float32Array(W*H*3),normal=new Float32Array(W*H*3);
 const shadowW=1200,sd=new Float32Array(shadowW*shadowW).fill(Infinity);
 const shadowCam=new OrthographicCamera(-8,8,8,-8,.1,60);shadowCam.position.set(6,20,10);shadowCam.lookAt(0,0,0);shadowCam.updateMatrixWorld();shadowCam.updateProjectionMatrix();
 const sm=new Matrix4().multiplyMatrices(shadowCam.projectionMatrix,shadowCam.matrixWorldInverse);
 const cm=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
 // Screen barycentric rasterizer. Smooth interpolated vertex normals, real depth.
 function raster(s:Surface,matrix:Matrix4,width:number,height:number,shade:boolean){
  const points=s.positions,ns=s.normals,v=new Vector3(),q:number[]=new Array(9),iw:number[]=new Array(3);
  for(let t=0;t<points.length;t+=9){
   if(shade&&s.opacity===1){const a=new Vector3().fromArray(points,t),b=new Vector3().fromArray(points,t+3),c=new Vector3().fromArray(points,t+6);if(b.sub(a).cross(c.sub(a)).dot(camera.position.clone().sub(a))<=0)continue;}
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
    if(s.id==='toy-car'||s.id==='car-wheels'){let mask=coverage.get(s.id);if(!mask){mask=new Set();coverage.set(s.id,mask);}mask.add(pi);}
    if(z>=depth[pi]!)continue;if(s.opacity===1)depth[pi]=z;ids[pi]=s.id;
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
    if(nrm[0]*view.x+nrm[1]*view.y+nrm[2]*view.z<=0)continue;
    const base=s.rgb.toArray().map((v,i)=>v*(a*s.colors[t+i]!+b*s.colors[t+3+i]!+c*s.colors[t+6+i]!)) as [number,number,number];
    const lit=studioShade(base,nrm,view.toArray() as [number,number,number],theme as 'paper'|'cinema',s.roughness,s.metalness,undefined,s.environment);
    const alpha=s.opacity;for(let k=0;k<3;k++)rgb[n+k]=rgb[n+k]!*(1-alpha)+lit[k]!*shadow*alpha;

   }
  }
 }
 for(const s of shapes)raster(s,sm,shadowW,shadowW,false);
 for(const s of [...shapes].sort((a,b)=>b.opacity-a.opacity))raster(s,cm,W,H,true);
 const output=new Uint8Array(W*H*3),bg=new Color(theme==='paper'?'#e9e4d8':'#1f2124'),color=new Color();
 for(let i=0;i<W*H;i++){if(depth[i]===Infinity)color.copy(bg);else color.fromArray(aces([rgb[i*3]!,rgb[i*3+1]!,rgb[i*3+2]!],studioRigs[theme as 'paper'|'cinema'].exposure));color.convertLinearToSRGB();output[i*3]=Math.round(color.r*255);output[i*3+1]=Math.round(color.g*255);output[i*3+2]=Math.round(color.b*255);}
 const bonePixels=ids.flatMap((id,i)=>(id==='toy-car'||id==='car-wheels')?[[output[i*3]!,output[i*3+1]!,output[i*3+2]!]]:[]);
 const median=(xs:number[])=>xs.sort((a,b)=>a-b)[Math.floor(xs.length*.5)]??0;
 const med=[0,1,2].map(c=>median(bonePixels.map(p=>p[c]!)));
 measurements[caption]={perPart:Object.fromEntries([...coverage].map(([id,mask])=>[id,{projectedPixels:mask.size,visiblePixels:ids.filter(x=>x===id).length,visibleFraction:ids.filter(x=>x===id).length/mask.size}])),pixels:bonePixels.length,medianRGB:med,medianHex:'#'+med.map(v=>v.toString(16).padStart(2,'0')).join(''),p10:median(bonePixels.map(p=>p[0]!).sort((a,b)=>a-b).slice(0,Math.ceil(bonePixels.length*.2))),p90:median(bonePixels.map(p=>p[0]!).sort((a,b)=>b-a).slice(0,Math.ceil(bonePixels.length*.2)))};
 return sharp(output,{raw:{width:W,height:H,channels:3}}).composite([{input:Buffer.from(`<svg width="${W}" height="${H}"><rect width="${W}" height="35" fill="${theme==='paper'?'#e9e4d8':'#1f2124'}"/><text x="15" y="24" font-family="sans-serif" font-size="15" fill="${theme==='paper'?'#2a2824':'#e7e5df'}">${caption} · CPU engine studio / ACES</text></svg>`)}]).png();
}
const ids=['toy-car','car-wheels'];
const car=file.parts.filter(p=>ids.includes(p.id));
const C=new Vector3(-.47,.034,.2);
const cam=(p:number[],t:number[]=[0,0,0],fov=28)=>{const c=new PerspectiveCamera(fov,W/H,.0001,10);c.position.fromArray(p).add(C);c.lookAt(new Vector3().fromArray(t).add(C));c.updateMatrixWorld();return c;};
const shots=[
{name:'three-quarter',p:[.13,.075,.155],t:[0,0,0],ref:'car-toy.jpg'},
{name:'profile',p:[-.015,.037,-.23],t:[0,0,0],ref:'car-profile.jpg'},
{name:'front',p:[.19,.022,-.013],t:[0,.001,0],ref:'car-grille.jpg'},
{name:'detail',p:[.105,.028,.018],t:[.039,-.003,0],ref:'car-grille.jpg'},
{name:'cinema',p:[.13,.075,.155],t:[0,0,0],ref:'car-toy.jpg',theme:'cinema'},
];
for(const shot of shots){
 const theme=shot.theme??'paper';
 await render(surfaces(car,theme),cam(shot.p,shot.t),theme,`${prefix} · ${shot.name}`).toFile(`${out}/car-${shot.name}.png`);
 const ref=`scripts/geo/forces/refs/${shot.ref}`;
 if(fs.existsSync(ref)){
  const image=await sharp(ref).resize(W,H,{fit:'contain',background:'#e9e4d8'}).png().toBuffer();
  await sharp({create:{width:W*2,height:H,channels:3,background:'#e9e4d8'}}).composite([{input:`${out}/car-${shot.name}.png`,left:0,top:0},{input:image,left:W,top:0}]).png().toFile(`${out}/sheet-car-${shot.name}.png`);
 }
 console.log(shot.name);
}
fs.writeFileSync(`${out}/coverage.json`,JSON.stringify(measurements,null,2));

/** Offline geometry acceptance: uses the ENGINE's actual partPieces, material
 * resolver and the fossils CPU GGX/RoomEnvironment/ACES implementation.
 * Numerical preview; finish normal maps, transparency sorting and GPU contact
 * shadows remain acceptance limits. No browser or GL context is created. */
import fs from 'node:fs';
import sharp from 'sharp';
import { Color, Matrix4, Vector3, PerspectiveCamera, BufferGeometry } from 'three';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { resolveMaterialLook } from '../../../src/engines/space-scene/lib/color';
import { prepareStudio, studioShade, aces, studioRigs } from '../fossils-and-skeletons/studio-cpu';
import type { Part } from '../../../src/engines/space-scene/schema';
export type V3=[number,number,number];
/** Check the actual Lighting component consumed by Model3DStage, not a token file. */
export function assertEngineStudio(){
 const source=fs.readFileSync('src/engines/space-scene/stages/model3d/Lighting.tsx','utf8');
 for(const theme of ['paper','cinema'] as const){
  const block=source.match(new RegExp(theme+': \\{([\\s\\S]*?)\\n  \\}'))?.[1];if(!block)throw new Error('Missing engine studio '+theme);
  const rig=studioRigs[theme];
  for(const [name,i]of [['key',0],['fill',1],['rim',2]] as const){
   const entry=block.match(new RegExp(name+": \\[([^\\]]+)"))?.[1];if(!entry)throw new Error('Missing engine light '+name);
   const hex=entry.match(/'([^']+)'/)![1]!,power=Number(entry.split(',')[1]);
   if(hex!==rig.lights[i]![0]||power!==rig.lights[i]![1])throw new Error('CPU/engine light drift '+theme+'/'+name);
  }
  for(const key of ['exposure','env'] as const){const value=Number(block.match(new RegExp(key+': ([\\d.]+)'))?.[1]);if(value!==rig[key])throw new Error('CPU/engine drift '+key);}
  const hemi=block.match(/hemi: \[([^\]]+)/)![1]!,colors=[...hemi.matchAll(/'([^']+)'/g)].map(m=>new Color(m[1]!).toArray());
  if(Number(hemi.split(',')[2])!==rig.hemi[2]||JSON.stringify(colors)!==JSON.stringify([rig.hemi[0],rig.hemi[1]]))throw new Error('CPU/engine hemisphere drift');
 }
 for(const [name,values]of [['KEY','0.55, 1, 0.7'],['FILL','-1, 0.35, 0.45'],['RIM','-1, 0.45, -0.7']])if(!source.includes(`const ${name}_DIR: Vec3 = normalize3([${values}])`))throw new Error('CPU/engine direction drift');
}
export function themeTokens(theme='paper') {
 const css=fs.readFileSync('src/theme/tokens.css','utf8');
 const root=css.slice(css.indexOf(':root {'),css.indexOf('[data-theme="cinema"]'));
 const cinema=css.slice(css.indexOf('[data-theme="cinema"]'));
 const tokens:Record<string,string>={};
 for(const text of [root,...(theme==='cinema'?[cinema]:[])])for(const m of text.matchAll(/--([\w-]+):\s*([^;]+);/g))tokens[m[1]!]=m[2]!.trim();
 for(let i=0;i<5;i++)for(const k of Object.keys(tokens))tokens[k]=tokens[k]!.replace(/var\(--([\w-]+)\)/g,(_,name)=>tokens[name]??'#888888');
 return tokens;
}
export function measureParts(parts:Part[]) {
 let triangles=0,calls=0; const byPart:Record<string,{triangles:number;calls:number}>={};
 for(const p of parts){let n=0,d=0;for(const g of partPieces(p)){if(!g.lines){n+=(g.geometry.index?.count??g.geometry.getAttribute('position').count)/3*(g.matrices?.length??1);d++;}g.geometry.dispose();}byPart[p.id]={triangles:n,calls:d};triangles+=n;calls+=d;}
 return {triangles,calls,byPart};
}
let environmentMaps:number[][]|undefined;
function sampledEnvironment(d:V3,roughness:number){
 environmentMaps??=JSON.parse(fs.readFileSync('/private/tmp/fossils-fix-2026-11-04/room-radiance-v2.json','utf8')) as number[][];
 const map=environmentMaps[roughness>=.85?0:roughness>=.65?1:roughness>=.45?2:3]!,W=96,H=48;
 const x=((Math.atan2(d[2],d[0])/(2*Math.PI)+1)%1)*W-.5,y=Math.acos(Math.max(-1,Math.min(1,d[1])))/Math.PI*H-.5,ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy;
 const at=(a:number,b:number)=>map[Math.max(0,Math.min(H-1,b))*W+((a%W+W)%W)]!;
 return (at(ix,iy)*(1-u)+at(ix+1,iy)*u)*(1-v)+(at(ix,iy+1)*(1-u)+at(ix+1,iy+1)*u)*v;
}
export async function renderParts(parts:Part[],opts:{out:string;camera:{position:V3;target:V3;fov?:number};theme?:'paper'|'cinema';width?:number;height?:number;meshGeometries?:Record<string,BufferGeometry>;meshSurfaces?:Record<string,{roughness:number;metalness:number;opacity?:number}>}) {
 assertEngineStudio();prepareStudio();const theme=opts.theme??'paper',W=opts.width??720,H=opts.height??720,tokens=themeTokens(theme);
 const bg=new Color(tokens.paper??'#e9e4d8').convertLinearToSRGB().toArray().map(c=>Math.round(c*255));
 const pixels=Buffer.alloc(W*H*3);for(let i=0;i<W*H;i++)for(let k=0;k<3;k++)pixels[i*3+k]=bg[k]!;
 const depth=new Float64Array(W*H).fill(Infinity),camera=new PerspectiveCamera(opts.camera.fov??35,W/H,.001,1000);camera.position.fromArray(opts.camera.position);camera.lookAt(new Vector3(...opts.camera.target));camera.updateMatrixWorld();
 const vp=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),eye=camera.position;
 const srgb=(x:number)=>Math.round(255*Math.max(0,Math.min(1,x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055)));
 for(const p of parts){const painted=new Uint8Array(W*H);const slots=partMaterialSlots(p);for(const piece of (p.mesh&&opts.meshGeometries?.[p.id]?[{geometry:opts.meshGeometries[p.id]!.clone(),matrices:null,slot:0,lines:false}]:partPieces(p))){
 if(piece.lines)continue;const g=piece.geometry,ps=g.getAttribute('position'),ns=g.getAttribute('normal'),ix=g.index,slot=slots[piece.slot??0]!,look=resolveMaterialLook(slot.color,tokens,theme,slot.tint),base=new Color(look.color).toArray() as V3;Object.assign(look,opts.meshSurfaces?.[p.id]??{});
 for(const matrix of piece.matrices??[new Matrix4()]){
 const world=matrix.clone();world.premultiply(new Matrix4().makeTranslation(...p.primitive!.at));
 const vertexColors=g.getAttribute('color');
 const verts=Array.from({length:ps.count},(_,i)=>{const pos=new Vector3().fromBufferAttribute(ps,i).applyMatrix4(world),n=new Vector3().fromBufferAttribute(ns,i).transformDirection(world),v=eye.clone().sub(pos).normalize(),screen=pos.clone().applyMatrix4(vp);const albedo=base.map((c,k)=>c*(vertexColors?vertexColors.getComponent(i,k):1)) as V3;let rgb=studioShade(albedo,n.toArray() as V3,v.toArray() as V3,theme,Math.max(.045,look.roughness*(p.mesh?1:.92)),look.metalness,(d,r)=>sampledEnvironment(d,r)*look.envIntensity);rgb=rgb.map((c,k)=>c+base[k]!*look.glow) as V3;const c=aces(rgb,studioRigs[theme].exposure);return {x:(screen.x*.5+.5)*W,y:(.5-screen.y*.5)*H,z:screen.z,c:c.map(srgb)};});
 for(let j=0;j<(ix?.count??ps.count);j+=3){const a=verts[ix?ix.getX(j):j]!,b=verts[ix?ix.getX(j+1):j+1]!,c=verts[ix?ix.getX(j+2):j+2]!;if([a,b,c].some(v=>v.z< -1||v.z>1))continue;const den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(den)<1e-8)continue;
 for(let y=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y)));y<=Math.min(H-1,Math.ceil(Math.max(a.y,b.y,c.y)));y++)for(let x=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x)));x<=Math.min(W-1,Math.ceil(Math.max(a.x,b.x,c.x)));x++){
 const u=((b.y-c.y)*(x+.5-c.x)+(c.x-b.x)*(y+.5-c.y))/den,v=((c.y-a.y)*(x+.5-c.x)+(a.x-c.x)*(y+.5-c.y))/den,w=1-u-v;if(u<0||v<0||w<0)continue;const z=a.z*u+b.z*v+c.z*w,k=y*W+x;if(z>=depth[k]!)continue;if(look.opacity<1&&painted[k])continue;painted[k]=1;depth[k]=z;for(let d=0;d<3;d++)pixels[k*3+d]=Math.round((a.c[d]!*u+b.c[d]!*v+c.c[d]!*w)*look.opacity+pixels[k*3+d]!*(1-look.opacity));}}
 }g.dispose();}}
 await sharp(pixels,{raw:{width:W,height:H,channels:3}}).png().toFile(opts.out);
}

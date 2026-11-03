/** Offline z-buffer raster of actual engine geometry. Approximate studio lighting,
 * not a browser/GPU acceptance image. No browser, WebGL, or runtime downloads.
 * pnpm tsx scripts/geo/fossils-and-skeletons/polish-preview.ts [prefix] [baseline-dir]
 */
import fs from 'node:fs';
import sharp from 'sharp';
import { BufferAttribute, BufferGeometry, Matrix4, Matrix3, PerspectiveCamera, OrthographicCamera, Vector3, Color } from 'three';
import { museumHudCamera, museumHudLayouts } from './museum-framing';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { partsFile, type Part } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { resolveMaterialLook } from '../../../src/engines/space-scene/lib/color';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
const prefix=process.argv[2]??'polish', baseline=process.argv[3];
const file=partsFile.parse(JSON.parse(fs.readFileSync(baseline?`${baseline}/parts.json`:'src/content/topics/fossils-and-skeletons/data/parts.json','utf8')));
const out='/private/tmp/fossils-polish-2026-11-03';fs.mkdirSync(out,{recursive:true});
await MeshoptDecoder.ready;
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(baseline?`${baseline}/model.glb`:`public${file.model}`);
await doc.transform(dequantize());
const meshes=new Map<string,BufferGeometry>();
for(const node of doc.getRoot().listNodes()){
 const prim=node.getMesh()?.listPrimitives()[0];if(!prim)continue;const g=new BufferGeometry();
 for(const [name,type] of [['position','POSITION'],['normal','NORMAL']] as const){const a=prim.getAttribute(type)!;g.setAttribute(name,new BufferAttribute(new Float32Array(a.getArray()!),3));}
 const idx=prim.getIndices();if(idx)g.setIndex(new BufferAttribute(new Uint32Array(idx.getArray()!),1));
 g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));meshes.set(node.getName(),g);
}
fs.writeFileSync(`${out}/${prefix}-mesh-bounds.json`,JSON.stringify(Object.fromEntries([...meshes].map(([id,g])=>{g.computeBoundingBox();return [id,{min:g.boundingBox!.min.toArray(),max:g.boundingBox!.max.toArray()}];})),null,2));
type Surface={positions:Float32Array;normals:Float32Array;rgb:Color;floor:boolean;opacity:number;catcher?:boolean};
const tokens:Record<string,Record<string,string>>={paper:{bone:'#e0d6bf','ink-2':'#555047',neutral:'#8a8378',cold:'#4f7f8c','f-drag':'#93602e',lamp:'#ffc96b',mannequin:'#bfb8ac','ink-3':'#857d70','muscle-3':'#8f6a62','carbon-dioxide':'#5e554e'},cinema:{bone:'#cfc5af','ink-2':'#b9b4a8',neutral:'#938c80',cold:'#78a4ae','f-drag':'#d0a16c',lamp:'#ffd88f',mannequin:'#6f7174','ink-3':'#8c877c','muscle-3':'#70443f','carbon-dioxide':'#8a786a'}};
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
   const rgb=new Color(look.color);
   if(slot?.color==='abrasive')rgb.multiplyScalar(.65); // mean of the existing sand albedo map
   for(const matrix of piece.matrices??[new Matrix4()]){
    const n=(idx?.count??ps.count),positions=new Float32Array(n*3),normals=new Float32Array(n*3),nm=new Matrix3().getNormalMatrix(matrix);
    const v=new Vector3(),normal=new Vector3();
    for(let i=0;i<n;i++){const j=idx?idx.getX(i):i;v.fromBufferAttribute(ps,j).applyMatrix4(matrix);if(!part.mesh||explode)v.add(offset);normal.fromBufferAttribute(ns,j).applyMatrix3(nm).normalize();positions.set(v.toArray(),i*3);normals.set(normal.toArray(),i*3);}
    result.push({positions,normals,rgb,floor:part.context===true,opacity:look.opacity});
   }
  }
 }
 return result;
}
const W=Number(process.env.ATLAS_PREVIEW_WIDTH??1520),H=Number(process.env.ATLAS_PREVIEW_HEIGHT??1023), light=new Vector3(.3,1,.5).normalize();
function render(shapes:Surface[],camera:PerspectiveCamera,theme:string,caption:string,hud=false){
 const depth=new Float32Array(W*H).fill(Infinity),rgb=new Float32Array(W*H*3),normal=new Float32Array(W*H*3);
 const shadowW=1200,sd=new Float32Array(shadowW*shadowW).fill(Infinity);
 const shadowCam=new OrthographicCamera(-8,8,8,-8,.1,60);shadowCam.position.set(6,20,10);shadowCam.lookAt(0,0,0);shadowCam.updateMatrixWorld();shadowCam.updateProjectionMatrix();
 const sm=new Matrix4().multiplyMatrices(shadowCam.projectionMatrix,shadowCam.matrixWorldInverse);
 const cm=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
 // Screen barycentric rasterizer. Smooth interpolated vertex normals, real depth.
 function raster(s:Surface,matrix:Matrix4,width:number,height:number,shade:boolean){
  const points=s.positions,ns=s.normals,v=new Vector3(),q:number[]=new Array(9);
  for(let t=0;t<points.length;t+=9){
   for(let k=0;k<3;k++){v.fromArray(points,t+k*3).applyMatrix4(matrix);q[k*3]=(v.x*.5+.5)*width;q[k*3+1]=(-v.y*.5+.5)*height;q[k*3+2]=v.z;}
   const ax=q[0]!,ay=q[1]!,bx=q[3]!,by=q[4]!,cx=q[6]!,cy=q[7]!;
   const d=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(d)<1e-7)continue;
   const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(width-1,Math.ceil(Math.max(ax,bx,cx)));
   const y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(height-1,Math.ceil(Math.max(ay,by,cy)));
   if(x0>x1||y0>y1)continue;
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const a=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/d,b=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/d,c=1-a-b;
    if(a<0||b<0||c<0)continue;const z=a*q[2]!+b*q[5]!+c*q[8]!;const pi=y*width+x;
    if(!shade){if(!s.floor&&z<sd[pi]!)sd[pi]=z;continue;}
    if(z>=depth[pi]!)continue;if(s.opacity===1)depth[pi]=z;
    const n=pi*3;normal[n]=a*ns[t]!+b*ns[t+3]!+c*ns[t+6]!;normal[n+1]=a*ns[t+1]!+b*ns[t+4]!+c*ns[t+7]!;normal[n+2]=a*ns[t+2]!+b*ns[t+5]!+c*ns[t+8]!;
    let shadow=1;
    if(file.views.shadows!=='none'&&s.floor){v.set(a*points[t]!+b*points[t+3]!+c*points[t+6]!,a*points[t+1]!+b*points[t+4]!+c*points[t+7]!,a*points[t+2]!+b*points[t+5]!+c*points[t+8]!).applyMatrix4(sm);const sx=Math.floor((v.x*.5+.5)*shadowW),sy=Math.floor((-.5*v.y+.5)*shadowW);if(sx>=0&&sy>=0&&sx<shadowW&&sy<shadowW&&v.z>sd[sy*shadowW+sx]!+.0003)shadow=.65;}
    const len=Math.hypot(normal[n]!,normal[n+1]!,normal[n+2]!)||1;
    const lambert=Math.max(0,(normal[n]!*light.x+normal[n+1]!*light.y+normal[n+2]!*light.z)/len);
    const bright=s.catcher?1:(theme==='cinema'?.22:.33)+.67*lambert;
    const alpha=s.opacity;rgb[n]=rgb[n]!*(1-alpha)+s.rgb.r*bright*shadow*alpha;rgb[n+1]=rgb[n+1]!*(1-alpha)+s.rgb.g*bright*shadow*alpha;rgb[n+2]=rgb[n+2]!*(1-alpha)+s.rgb.b*bright*shadow*alpha;
   }
  }
 }
 for(const s of shapes)raster(s,sm,shadowW,shadowW,false);
 for(const s of [...shapes].sort((a,b)=>b.opacity-a.opacity))raster(s,cm,W,H,true);
 const output=new Uint8Array(W*H*3),bg=new Color(theme==='paper'?'#e9e4d8':'#1f2124'),color=new Color();
 for(let i=0;i<W*H;i++){if(depth[i]===Infinity)color.copy(bg);else color.setRGB(rgb[i*3]!,rgb[i*3+1]!,rgb[i*3+2]!);color.convertLinearToSRGB();output[i*3]=Math.round(color.r*255);output[i*3+1]=Math.round(color.g*255);output[i*3+2]=Math.round(color.b*255);}
 const panels=hud?museumHudLayouts.find(l=>l.width===W)?.panels??museumHudLayouts[0]!.panels:[];
 const overlay=panels.map(p=>`<rect x="${p.x0}" y="${p.y0}" width="${p.x1-p.x0}" height="${p.y1-p.y0}" fill="${theme==='paper'?'#f1ede4':'#303134'}" opacity=".92"/><text x="${p.x0+10}" y="${p.y0+24}" fill="${theme==='paper'?'#555047':'#b9b4a8'}" font-size="14">HUD clearance proxy</text>`).join('');
 return sharp(output,{raw:{width:W,height:H,channels:3}}).composite([{input:Buffer.from(`<svg width="${W}" height="${H}">${overlay}<rect x="0" y="0" width="1600" height="43" fill="${theme==='paper'?'#e9e4d8':'#1f2124'}"/><text x="20" y="28" font-family="sans-serif" font-size="19" fill="${theme==='paper'?'#2a2824':'#e7e5df'}">${caption} · offline CPU depth raster; approximate lighting</text></svg>`)}]).png();
}
const museum=file.parts.filter(p=>p.id.endsWith('-study')),bird=file.parts.filter(p=>p.id.startsWith('myna-')&&p.id!=='myna-feather'),skeleton=file.parts.filter(p=>p.group==='skeleton');
const platform=file.parts.find(p=>p.context)!;
const cam=(position:number[],target:number[],fov=34)=>{const c=new PerspectiveCamera(fov,W/H,.05,100);c.position.fromArray(position);c.lookAt(new Vector3().fromArray(target));c.updateMatrixWorld();return c;};
const preset=file.presets!.find(p=>p.id==='museum-close')!.camera;
const hud=museumHudLayouts.find(l=>l.width===W)??museumHudLayouts[0]!;
const fitted=museumHudCamera(preset,W,H,hud.panels);
const fittedCamera=cam(fitted.camera.position,fitted.camera.target);
if(fitted.framing){const [x,y]=fitted.framing.shift;fittedCamera.setViewOffset(W,H,-x*W,y*H,W,H);}
const shots=[
 {name:'museum-hud-paper',parts:[...museum,platform],camera:fittedCamera,theme:'paper',hud:true},
 {name:'museum-hud-cinema',parts:[...museum,platform],camera:fittedCamera,theme:'cinema',hud:true},
 {name:'museum-paper',parts:[...museum,platform],camera:cam(preset.position,preset.target),theme:'paper'},
 {name:'museum-cinema',parts:[...museum,platform],camera:cam(preset.position,preset.target),theme:'cinema'},
 {name:'museum-side',parts:museum,camera:cam([0,4,15],[0,1,0]),theme:'paper'},
 {name:'museum-bones-close',parts:[museum[1]!],camera:cam([-.2,2.8,3.2],[-.65,1.2,0],43),theme:'paper'},
 {name:'bird-side',parts:bird,camera:cam([-.4,2.4,6],[-.55,1.8,0]),theme:'paper'},
 {name:'bird-oblique',parts:bird,camera:cam([2.3,3,5.5],[-.7,1.8,0]),theme:'paper'},
 {name:'bird-thigh-close',parts:bird,camera:cam([-.7,1.4,2.1],[-.85,1.25,.1],34),theme:'paper'},
 {name:'skeleton',parts:skeleton,camera:cam([0,3,15],[0,1.5,0]),theme:'paper'},
 {name:'skeleton-close',parts:skeleton,camera:cam([-4,3,3],[-2.5,2,0],42),theme:'paper'},
 {name:'skeleton-exploded',parts:skeleton,camera:cam([0,3,17],[0,1.5,0]),theme:'paper',explode:true}
];
for(const shot of shots){if(process.env.ATLAS_PREVIEW_SHOT&&!process.env.ATLAS_PREVIEW_SHOT.split(',').includes(shot.name))continue;await render(surfaces(shot.parts,shot.theme,shot.explode),shot.camera,shot.theme,`${prefix} · ${shot.name}`,shot.hud).toFile(`${out}/${prefix}-${shot.name}.png`);console.log(shot.name);}

/** Offline z-buffer raster of actual engine geometry. Lighting-matched CPU PBR,
 * not a browser/GPU acceptance image. No browser, WebGL, or runtime downloads.
 * pnpm tsx scripts/geo/water/preview.ts [prefix] [--baseline]
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { toTransform } from '../../../src/engines/space-scene/lib/pose';
import { partFrame, applyFrame } from '../../../src/engines/space-scene/lib/sim/frame';
import { prepareStudio, studioShade, studioRigs, aces } from '../fossils-and-skeletons/studio-cpu';
import sharp from 'sharp';
import { BufferAttribute, BufferGeometry, Matrix4, Matrix3, PerspectiveCamera, OrthographicCamera, Vector3, Color, Box3 } from 'three';

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { partsFile, type Part } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { resolveMaterialLook } from '../../../src/engines/space-scene/lib/color';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
const prefix=process.argv[2]??'round1', baseline=process.argv.includes('--baseline')?'scripts/geo/water':undefined;
const file=partsFile.parse(JSON.parse(fs.readFileSync(baseline?`${baseline}/baseline-parts.json`:'src/content/topics/water/data/parts.json','utf8')));
const modelBytes=file.model?fs.readFileSync(`public${file.model}`):null,modelSHA256=modelBytes?createHash('sha256').update(modelBytes).digest('hex'):null;
const out=process.env.ATLAS_PREVIEW_OUT??'scripts/geo/water/comparisons';fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(`${out}/${prefix}-provenance.json`,JSON.stringify({model:file.model,sha256:modelSHA256,lighting:'Production Lighting.tsx + sampled RoomEnvironment + studio-cpu.ts; actual atlasSurface, sRGB and ACES',foliage:'Actual embedded lossless atlas, UVs, alpha cutoff and linear trilinear mip chain; no regenerated geometry',GPU:false},null,2)+'\n');
await MeshoptDecoder.ready;
const doc=file.model?await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).readBinary(modelBytes!):null;
if(doc)await doc.transform(dequantize());
const meshes=new Map<string,BufferGeometry>(),anchors=new Map<string,number[]>();
for(const node of doc?.getRoot().listNodes()??[]){
 const prim=node.getMesh()?.listPrimitives()[0];if(!prim)continue;const g=new BufferGeometry();
 for(const [name,type] of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0'],['uv','TEXCOORD_0'],['treeId','_TREE_ID']] as const){const a=prim.getAttribute(type);if(a)g.setAttribute(name,new BufferAttribute(new Float32Array(a.getArray()!),name==='uv'?2:name==='treeId'?1:3));}
 const material=prim.getMaterial(),image=material?.getBaseColorTexture()?.getImage();
 const map=image?await sharp(Buffer.from(image)).ensureAlpha().raw().toBuffer({resolveWithObject:true}):null;g.userData.texture=map?leafTexture(map.data,map.info.width,map.info.height,material?.getAlphaCutoff()??.5):null;
 g.userData.surface=material?.getExtras().atlasSurface===true?{factor:material.getBaseColorFactor().slice(0,3),roughness:material.getRoughnessFactor(),metalness:material.getMetallicFactor(),twoSided:material.getDoubleSided()}:null;
 const idx=prim.getIndices();if(idx)g.setIndex(new BufferAttribute(new Uint32Array(idx.getArray()!),1));
 const world=new Matrix4().fromArray(node.getWorldMatrix());g.applyMatrix4(world);anchors.set(node.getName(),world.elements.slice(12,15));meshes.set(node.getName(),g);
}
fs.writeFileSync(`${out}/${prefix}-mesh-bounds.json`,JSON.stringify(Object.fromEntries([...meshes].map(([id,g])=>{g.computeBoundingBox();return [id,{min:g.boundingBox!.min.toArray(),max:g.boundingBox!.max.toArray()}];})),null,2));
/** Extract an actual shipped tree for unobscured four-view studies. City
 * architecture has hard, planar face components; leaves are green and the
 * curved trunk/branch components have volume. No geometry is regenerated.
 */
function isolatedUrbanTree(source:BufferGeometry){
 const pos=source.getAttribute('position'),color=source.getAttribute('color'),index=source.index!,parent=new Int32Array(pos.count);
 for(let i=0;i<parent.length;i++)parent[i]=i;
 const find=(i:number):number=>{while(parent[i]!==i){parent[i]=parent[parent[i]!]!;i=parent[i]!;}return i;};
 for(let i=0;i<index.count;i+=3){const a=find(index.getX(i));parent[find(index.getX(i+1))]=a;parent[find(index.getX(i+2))]=a;}
 const components=new Map<number,{lo:number[];hi:number[];green:boolean}>();
 for(let i=0;i<pos.count;i++){
  const root=find(i),c=components.get(root)??{lo:[Infinity,Infinity,Infinity],hi:[-Infinity,-Infinity,-Infinity],green:false};
  for(let k=0;k<3;k++){const v=k===0?pos.getX(i):k===1?pos.getY(i):pos.getZ(i);c.lo[k]=Math.min(c.lo[k]!,v);c.hi[k]=Math.max(c.hi[k]!,v);}
  c.green ||= color.getY(i)>color.getX(i)*1.15&&color.getY(i)>color.getZ(i)*1.4;
  components.set(root,c);
 }
 const kept=new Set([...components].filter(([,c])=>{
  const x=(c.lo[0]!+c.hi[0]!)/2,z=(c.lo[2]!+c.hi[2]!)/2;
  return Math.hypot(x+.61,z+.85)<.16&&c.hi[1]!<.21&&(c.green||c.hi.every((v,i)=>v-c.lo[i]!>1e-5));
 }).map(([id])=>id));
 const indices:number[]=[];for(let i=0;i<index.count;i+=3)if(kept.has(find(index.getX(i))))indices.push(index.getX(i),index.getX(i+1),index.getX(i+2));
 if(indices.length<300)throw Error('Urban tree extraction lost its silhouette');
 const result=source.clone();result.setIndex(indices);return result;
}
function isolateTree(source:BufferGeometry,id:number){
 const index=source.index!,tag=source.getAttribute('treeId'),kept:number[]=[];
 if(!tag)return source;
 for(let i=0;i<index.count;i+=3)if(Math.round(tag.getX(index.getX(i)))===id)kept.push(index.getX(i),index.getX(i+1),index.getX(i+2));
 const g=source.clone();g.setIndex(kept);return g;
}
const urbanStudy=meshes.has('city-blocks')?(meshes.get('city-blocks')!.hasAttribute('treeId')?isolateTree(meshes.get('city-blocks')!,1):isolatedUrbanTree(meshes.get('city-blocks')!)):null;
type Mip={pixels:Float32Array;width:number;height:number};
type LeafTexture={levels:Mip[];width:number;height:number;alphaCutoff:number};
function leafTexture(bytes:Buffer,width:number,height:number,alphaCutoff:number):LeafTexture{
 const pixels=new Float32Array(bytes.length);
 for(let i=0;i<bytes.length;i++){const c=bytes[i]!/255;pixels[i]=i%4===3?c:c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}
 const levels:Mip[]=[{pixels,width,height}];
 while(width>1||height>1){
  const old=levels.at(-1)!,w=Math.max(1,width/2),h=Math.max(1,height/2),p=new Float32Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)for(let k=0;k<4;k++)for(let j=0;j<2;j++)for(let i=0;i<2;i++)p[(y*w+x)*4+k]!+=old.pixels[(Math.min(old.height-1,y*2+j)*old.width+Math.min(old.width-1,x*2+i))*4+k]!/4;
  width=w;height=h;levels.push({pixels:p,width,height});
 }
 return {levels,width:levels[0]!.width,height:levels[0]!.height,alphaCutoff};
}
type Surface={uvs:Float32Array;texture:LeafTexture|null;castShadow:boolean;positions:Float32Array;normals:Float32Array;colors:Float32Array;rgb:Color;floor:boolean;opacity:number;roughness:number;metalness:number;twoSided:boolean;id:string};
const tokens:Record<string,Record<string,string>>={paper:{bone:'#e0d6bf','ink-2':'#555047',neutral:'#8a8378',cold:'#4f7f8c','f-drag':'#93602e',lamp:'#ffc96b',mannequin:'#bfb8ac','ink-3':'#857d70','muscle-3':'#8f6a62','carbon-dioxide':'#5e554e'},cinema:{bone:'#cfc5af','ink-2':'#b9b4a8',neutral:'#938c80',cold:'#78a4ae','f-drag':'#d0a16c',lamp:'#ffd88f',mannequin:'#6f7174','ink-3':'#8c877c','muscle-3':'#70443f','carbon-dioxide':'#8a786a'}};
// Always resolve topic materials from the actual theme tokens.
const css=fs.readFileSync('src/theme/tokens.css','utf8');
for(const theme of ['paper','cinema']){
 const at=css.indexOf(`:root[data-theme="${theme}"] {`),body=css.slice(at,css.indexOf('\n}',at));
 Object.assign(tokens[theme]!,Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1]!,m[2]!] )));
}
function surfaces(parts:Part[],theme:string,explode=false,isolateUrban=false,tree?:number){
 const result:Surface[]=[];
 for(const part of parts){
  const slots=partMaterialSlots(part),offset=new Vector3(...(part.primitive?.at??[0,0,0]));
  if(explode)offset.add(new Vector3(...part.explode.dir).normalize().multiplyScalar(part.explode.dist));
  const pieces=part.mesh?[{geometry:tree!==undefined?isolateTree(meshes.get(part.mesh)!,tree):isolateUrban&&part.id==='city-blocks'&&urbanStudy?urbanStudy:meshes.get(part.mesh)!,matrices:null,slot:0}]:partPieces(part);
  for(const piece of pieces){if('lines'in piece&&piece.lines)continue;
   const g=piece.geometry, ps=g.getAttribute('position'), ns=g.getAttribute('normal'),idx=g.index;
   const slot=part.mesh?part.material??slots[0]:slots[piece.slot??0];
   const look=resolveMaterialLook(slot?.color??'plastic',tokens[theme]!,theme as 'paper'|'cinema',slot?.tint);
   // Powder ink is retained as authored by the topic (technical-plate palette).
   const rgb=new Color(look.color),surface=g.userData.surface;
   if(surface)rgb.setRGB(rgb.r*surface.factor[0],rgb.g*surface.factor[1],rgb.b*surface.factor[2]);
   if(slot?.color==='abrasive')rgb.multiplyScalar(.65); // mean of the existing sand albedo map
   for(const matrix of piece.matrices??[new Matrix4()]){
    const poseName=process.env.ATLAS_PREVIEW_POSE,pose=poseName?file.poses?.[poseName]?.parts[part.id]:undefined;
    const frame=partFrame(anchors.get(part.mesh??'')??offset.toArray(),toTransform(typeof pose==='object'?pose:undefined));
    const e=frame.r,frameMatrix=new Matrix4().set(e[0],e[1],e[2],frame.t[0],e[3],e[4],e[5],frame.t[1],e[6],e[7],e[8],frame.t[2],0,0,0,1),poseNormal=new Matrix3().getNormalMatrix(frameMatrix);
    const n=(idx?.count??ps.count),uvs=new Float32Array(n*2),positions=new Float32Array(n*3),normals=new Float32Array(n*3),colors=new Float32Array(n*3),nm=new Matrix3().getNormalMatrix(matrix);
    const v=new Vector3(),normal=new Vector3();
    for(let i=0;i<n;i++){const j=idx?idx.getX(i):i,uv=g.getAttribute('uv');if(uv){uvs[i*2]=uv.getX(j);uvs[i*2+1]=uv.getY(j);}v.fromBufferAttribute(ps,j).applyMatrix4(matrix);if(!part.mesh||explode)v.add(offset);v.fromArray(applyFrame(frame,v.toArray()));normal.fromBufferAttribute(ns,j).applyMatrix3(nm).applyMatrix3(poseNormal).normalize();positions.set(v.toArray(),i*3);normals.set(normal.toArray(),i*3);const vc=g.getAttribute('color');colors.set(vc?[vc.getX(j),vc.getY(j),vc.getZ(j)]:[1,1,1],i*3);}
    result.push({castShadow:part.castShadow!==false&&!part.context,uvs,texture:g.userData.texture??null,positions,normals,colors,rgb,floor:part.context===true,opacity:look.opacity,roughness:surface?.roughness??look.roughness*.92,metalness:surface?.metalness??look.metalness,twoSided:surface?.twoSided??false,id:part.id});
   }
  }
 }
 return result;
}
prepareStudio();
const W=Number(process.env.ATLAS_PREVIEW_WIDTH??800),H=Number(process.env.ATLAS_PREVIEW_HEIGHT??600);
function render(shapes:Surface[],camera:PerspectiveCamera,theme:string,caption:string,_hud=false){
 const ids=new Array<string>(W*H).fill(''),depth=new Float32Array(W*H).fill(Infinity),rgb=new Float32Array(W*H*3),normal=new Float32Array(W*H*3);
 // Transparent water must composite over the studio paper, even where there
 // is no opaque mesh behind it. Solve the small inverse of the same ACES map.
 const paper=new Color(theme==='paper'?'#e9e4d8':'#1f2124').toArray(),clear:[number,number,number]=[1,1,1];
 for(let pass=0;pass<8;pass++)for(let c=0;c<3;c++){let lo=0,hi=8;for(let j=0;j<24;j++){clear[c]=(lo+hi)/2;if(aces(clear,studioRigs[theme as 'paper'|'cinema'].exposure)[c]!<paper[c]!)lo=clear[c]!;else hi=clear[c]!;}clear[c]=(lo+hi)/2;}
 for(let i=0;i<W*H;i++)rgb.set(clear,i*3);
 const shadowW=1200,sd=new Float32Array(shadowW*shadowW).fill(Infinity);
 const shadowCam=new OrthographicCamera(-8,8,8,-8,.1,60);shadowCam.position.set(6,20,10);shadowCam.lookAt(0,0,0);shadowCam.updateMatrixWorld();shadowCam.updateProjectionMatrix();
 const sm=new Matrix4().multiplyMatrices(shadowCam.projectionMatrix,shadowCam.matrixWorldInverse);
 const cm=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
 // Screen barycentric rasterizer. Smooth interpolated vertex normals, real depth.
 function raster(s:Surface,matrix:Matrix4,width:number,height:number,shade:boolean){
  const points=s.positions,ns=s.normals,v=new Vector3(),q:number[]=new Array(9),iw:number[]=new Array(3);
  for(let t=0;t<points.length;t+=9){
   if(shade&&s.opacity===1&&!s.twoSided){const a=new Vector3().fromArray(points,t),b=new Vector3().fromArray(points,t+3),c=new Vector3().fromArray(points,t+6);if(b.sub(a).cross(c.sub(a)).dot(camera.position.clone().sub(a))<=0)continue;}
   for(let k=0;k<3;k++){v.fromArray(points,t+k*3);const e=matrix.elements;iw[k]=1/(e[3]!*v.x+e[7]!*v.y+e[11]!*v.z+e[15]!);v.applyMatrix4(matrix);q[k*3]=(v.x*.5+.5)*width;q[k*3+1]=(-v.y*.5+.5)*height;q[k*3+2]=v.z;}
   // A close-up can leave distant scenery behind its near plane.
   // Reject crossing triangles instead of projecting them across the image.
   if([q[2]!,q[5]!,q[8]!].some(z=>z < -1 || z > 1))continue;
   const ax=q[0]!,ay=q[1]!,bx=q[3]!,by=q[4]!,cx=q[6]!,cy=q[7]!;
   const d=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(d)<1e-7)continue;
   const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(width-1,Math.ceil(Math.max(ax,bx,cx)));
   const y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(height-1,Math.ceil(Math.max(ay,by,cy)));
   if(x0>x1||y0>y1)continue;
   // The production texture uses linear mip filtering. Estimate the triangle's
   // UV footprint in screen pixels, then trilinearly sample its linear mip chain.
   let mip=0,blend=0;
   if(s.texture){
    const at=t/3*2,u0=s.uvs[at]!,v0=s.uvs[at+1]!,du1=s.uvs[at+2]!-u0,du2=s.uvs[at+4]!-u0,dv1=s.uvs[at+3]!-v0,dv2=s.uvs[at+5]!-v0,det=(bx-ax)*(cy-ay)-(cx-ax)*(by-ay);
    const udx=(du1*(cy-ay)-du2*(by-ay))/det,udy=((bx-ax)*du2-(cx-ax)*du1)/det,vdx=(dv1*(cy-ay)-dv2*(by-ay))/det,vdy=((bx-ax)*dv2-(cx-ax)*dv1)/det;
    const lod=Math.min(s.texture.levels.length-1,Math.max(0,Math.log2(Math.max(Math.hypot(udx,vdx),Math.hypot(udy,vdy))*s.texture.width)));
    mip=Math.floor(lod);blend=lod-mip;
   }
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    let a=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/d,b=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/d,c=1-a-b;
    if(a<0||b<0||c<0)continue;const z=a*q[2]!+b*q[5]!+c*q[8]!;const pi=y*width+x;
    if(!shade){if(!s.floor&&z<sd[pi]!)sd[pi]=z;continue;}

    if(z>=depth[pi]!)continue;
    const total=a*iw[0]!+b*iw[1]!+c*iw[2]!;a=a*iw[0]!/total;b=b*iw[1]!/total;c=c*iw[2]!/total;
    let tex:[number,number,number]=[1,1,1];
    if(s.texture){
     const map=s.texture,u=a*s.uvs[(t/3)*2]!+b*s.uvs[(t/3+1)*2]!+c*s.uvs[(t/3+2)*2]!,v=a*s.uvs[(t/3)*2+1]!+b*s.uvs[(t/3+1)*2+1]!+c*s.uvs[(t/3+2)*2+1]!;
     const sample=(level:number,k:number)=>{
      const m=map.levels[Math.min(map.levels.length-1,level)]!,px=Math.max(0,Math.min(m.width-1,u*m.width-.5)),py=Math.max(0,Math.min(m.height-1,v*m.height-.5)),x0=Math.floor(px),y0=Math.floor(py),fx=px-x0,fy=py-y0;
      const at=(x:number,y:number)=>m.pixels[(Math.min(m.height-1,y)*m.width+Math.min(m.width-1,x))*4+k]!;
      return (at(x0,y0)*(1-fx)+at(x0+1,y0)*fx)*(1-fy)+(at(x0,y0+1)*(1-fx)+at(x0+1,y0+1)*fx)*fy;
     };
     const value=(k:number)=>sample(mip,k)*(1-blend)+sample(mip+1,k)*blend;
     if(value(3)<map.alphaCutoff)continue;
     tex=[value(0),value(1),value(2)];
    }
    const n=pi*3;normal[n]=a*ns[t]!+b*ns[t+3]!+c*ns[t+6]!;normal[n+1]=a*ns[t+1]!+b*ns[t+4]!+c*ns[t+7]!;normal[n+2]=a*ns[t+2]!+b*ns[t+5]!+c*ns[t+8]!;
    let shadow=1;
    if(file.views.shadows!=='none'&&s.floor){v.set(a*points[t]!+b*points[t+3]!+c*points[t+6]!,a*points[t+1]!+b*points[t+4]!+c*points[t+7]!,a*points[t+2]!+b*points[t+5]!+c*points[t+8]!).applyMatrix4(sm);const sx=Math.floor((v.x*.5+.5)*shadowW),sy=Math.floor((-.5*v.y+.5)*shadowW);if(sx>=0&&sy>=0&&sx<shadowW&&sy<shadowW&&v.z>sd[sy*shadowW+sx]!+.0003)shadow=.65;}
    const len=Math.hypot(normal[n]!,normal[n+1]!,normal[n+2]!)||1;
    const nrm:[number,number,number]=[normal[n]!/len,normal[n+1]!/len,normal[n+2]!/len];
    const position=new Vector3(a*points[t]!+b*points[t+3]!+c*points[t+6]!,a*points[t+1]!+b*points[t+4]!+c*points[t+7]!,a*points[t+2]!+b*points[t+5]!+c*points[t+8]!);
    const view=camera.position.clone().sub(position).normalize();
    // Back faces are culled by the engine. Interpolation on a silhouette can
    // leave a tiny negative dot; skip those samples too.
    if(nrm[0]*view.x+nrm[1]*view.y+nrm[2]*view.z<=0){if(s.twoSided){nrm[0]*=-1;nrm[1]*=-1;nrm[2]*=-1;}else continue;}
    if(s.opacity===1)depth[pi]=z;ids[pi]=s.id;
    const base=s.rgb.toArray().map((v,i)=>v*tex[i]!*(a*s.colors[t+i]!+b*s.colors[t+3+i]!+c*s.colors[t+6+i]!)) as [number,number,number];
    const lit=studioShade(base,nrm,view.toArray() as [number,number,number],theme as 'paper'|'cinema',s.roughness,s.metalness);
    const alpha=s.opacity;for(let k=0;k<3;k++)rgb[n+k]=rgb[n+k]!*(1-alpha)+lit[k]!*shadow*alpha;

   }
  }
 }
 if(file.views.shadows!=='none')for(const s of shapes)if(s.castShadow)raster(s,sm,shadowW,shadowW,false);
 for(const s of [...shapes].sort((a,b)=>b.opacity-a.opacity))raster(s,cm,W,H,true);
 const output=new Uint8Array(W*H*3),bg=new Color(theme==='paper'?'#e9e4d8':'#1f2124'),color=new Color();
 for(let i=0;i<W*H;i++){if(ids[i]==='')color.copy(bg);else color.fromArray(aces([rgb[i*3]!,rgb[i*3+1]!,rgb[i*3+2]!],studioRigs[theme as 'paper'|'cinema'].exposure));color.convertLinearToSRGB();output[i*3]=Math.round(color.r*255);output[i*3+1]=Math.round(color.g*255);output[i*3+2]=Math.round(color.b*255);}
 const overlay='';
 return sharp(output,{raw:{width:W,height:H,channels:3}}).composite([{input:Buffer.from(`<svg width="${W}" height="${H}">${overlay}<rect x="0" y="0" width="1600" height="43" fill="${theme==='paper'?'#e9e4d8':'#1f2124'}"/><text x="20" y="28" font-family="sans-serif" font-size="19" fill="${theme==='paper'?'#2a2824':'#e7e5df'}">${caption} · CPU PBR</text></svg>`)}]).png();
}
// Verify the reused numerical rig and its JSX consumers, not a token snapshot.
// The production GLTFLoader/material adapter are exercised separately by water tests.
const rigSource=fs.readFileSync('src/engines/space-scene/stages/model3d/Lighting.tsx','utf8');
for(const expression of ['gl.toneMappingExposure = rig.exposure','intensity={rig.key[1]}','intensity={rig.fill[1]}','intensity={rig.rim[1]}','<Environment intensity={rig.env} />','position={at(KEY_DIR, far)}','position={at(FILL_DIR, far)}','position={at(RIM_DIR, far)}'])if(!rigSource.includes(expression))throw Error('Studio consumer changed: '+expression);
for(const theme of ['paper','cinema'] as const){
 const block=rigSource.match(new RegExp(theme+': \\{([\\s\\S]*?)\\n  \\}'))![1]!;
 for(const [key,index]of [['key',0],['fill',1],['rim',2]] as const){const m=block.match(new RegExp(key+": \\[\\s*'([^']+)', ([\\d.]+)"))!;if(m[1]!==studioRigs[theme].lights[index]![0]||Number(m[2])!==studioRigs[theme].lights[index]![1])throw Error('CPU studio rig drift');}
 if(Number(block.match(/exposure: ([\d.]+)/)![1])!==studioRigs[theme].exposure)throw Error('Exposure drift');
 const hemi=block.match(/hemi: \[([^\]]+)\]/)![1]!,hex=[...hemi.matchAll(/'(#[0-9a-f]+)'/g)].map(m=>new Color(m[1]!).toArray());
 if(JSON.stringify(hex)!==JSON.stringify([studioRigs[theme].hemi[0],studioRigs[theme].hemi[1]])||Number(hemi.split(',')[2])!==studioRigs[theme].hemi[2])throw Error('Hemisphere drift');
 if(Number(block.match(/env: ([\d.]+)/)![1])!==studioRigs[theme].env)throw Error('Environment drift');
 for(const [i,name] of ['KEY','FILL','RIM'].entries()){
  const direction=rigSource.match(new RegExp('const '+name+'_DIR: Vec3 = normalize3\\(\\[([^\\]]+)'))![1]!.split(',').map(Number);
  if(JSON.stringify(direction)!==JSON.stringify(studioRigs[theme].lights[i]![2]))throw Error('Light direction drift');
 }

}
const cam=(position:number[],target:number[],fov=34)=>{const c=new PerspectiveCamera(fov,W/H,.001,100);c.position.fromArray(position);c.lookAt(new Vector3().fromArray(target));c.updateMatrixWorld();return c;};
const group=(ids:string[])=>file.parts.filter(p=>ids.includes(p.id));
const shots:{name:string;ids:string[];position:number[];target:number[];fov?:number;theme?:string;tree?:number}[]=[];
function hero(name:string,ids:string[],center:number[],size:number,refFront=false){
 const [x,y,z]=center as [number,number,number];
 const dirs=refFront?[[0,0,-3],[-1.5,-.35,-2.8],[3,.15,0],[.65,.4,1.1]]:[[0,.08,3],[1.5,.7,2.8],[3,.15,0],[.65,.4,1.1]];
 for(const [i,d]of dirs.entries())shots.push({name:name+'-'+['front','three-quarter','profile','detail'][i],ids,position:[x+d[0]!*size,y+d[1]!*size,z+d[2]!*size],target:center,fov:34});
}
hero('cumulus',['cumulus'],[-2.12,1.23,-.25],.66);
hero('rain-cloud',['rain-cloud'],[1.03,1.13,-.61],1.40);
hero('forest',['forest-hill'],[2.05,.35,-.72],1.28);
hero('city',['city-blocks'],[-.12,.12,-.70],.82);
hero('hdb',['hdb-block','roof-tank'],[.21,.23,.55],.29,true);
hero('barrage',['barrage','crest-gates'],[-1.69,-.015,.64],.48,true);
hero('green-roof',['pump-house'],[-1.49,.04,1.105],.22);
shots.push({name:'forest-branch-detail',ids:['forest-hill'],position:[1.45,.50,-.50],target:[1.20,.40,-.95]});
shots.push({name:'urban-tree-detail',ids:['city-blocks'],position:[-.90,.14,-.06],target:[-.61,.075,-.23]});
hero('urban-tree',['city-blocks'],[-.61,.08,-.23],.16);
shots.push({name:'outfalls-detail',ids:['pump-house'],position:[-1.89,.045,1.26],target:[-1.715,-.016,1.14],fov:34});
shots.push({name:'kitchen-cutaway',ids:['hdb-block','kitchen-tap','house-sewer','roof-tank'],position:[.29,.30,.94],target:[.135,.229,.57],fov:34});
shots.push({name:'roof-tank-detail',ids:['hdb-block','roof-tank'],position:[.44,.57,.78],target:[.27,.455,.55]});
shots.push({name:'hdb-corridor',ids:['hdb-block','roof-tank'],position:[-.35,.28,-.24],target:[.21,.22,.55]});
shots.push({name:'hdb-void-deck',ids:['hdb-block'],position:[.32,.04,.73],target:[.22,.022,.55]});
shots.push({name:'gates-detail',ids:['barrage','crest-gates'],position:[-1.91,.045,.81],target:[-1.71,-.02,.68]});
shots.push({name:'green-roof-aerial',ids:['pump-house'],position:[-1.2,.55,1.63],target:[-1.49,.04,1.1]});
for(const theme of ['paper','cinema'])shots.push({name:'whole-'+theme,ids:file.parts.map(p=>p.id),position:[6.55,4.8,11.3],target:[.45,.2,0],fov:30,theme});
// Actual decoded instances: no regenerated botanical specimen in evidence.
for(const [name,part,tree,center,size] of [
 ['emergent','forest-hill',3,[1.18,.40,-.70],.28],
 ['angsana','city-blocks',2,[-.08,.07,-.20],.11],
] as [string,string,number,number[],number][]){
 const start=shots.length;hero(name,[part],center,size);
 for(const shot of shots.slice(start))shot.tree=tree;
}
shots.push({name:'forest-interior',ids:['forest-hill'],position:[1.05,.25,-.20],target:[1.49,.48,-.89],fov:54});
shots.push({name:'city-slab-gallery',ids:['city-blocks'],position:[.13,.092,-1.18],target:[-.10,.085,-1],fov:35,tree:0});
shots.push({name:'city-slab-front',ids:['city-blocks'],position:[.10,.085,-.64],target:[-.10,.085,-1],fov:34,tree:0});
shots.push({name:'city-void-deck',ids:['city-blocks'],position:[-.01,.013,-.86],target:[-.10,.009,-1],fov:35,tree:0});
shots.push({name:'city-point-detail',ids:['city-blocks'],position:[-.10,.012,-.55],target:[-.45,.145,-1],fov:34,tree:0});
// Fit the actual decoded specimen, using only referenced indices. A cloned
// geometry retains other instances' unused attributes, so attribute bounds
// would frame the whole estate rather than this tree.
for(const [name,part,id] of [['urban-tree','city-blocks',1],['angsana','city-blocks',2],['emergent','forest-hill',3]] as const){
 const source=meshes.get(part);if(!source?.hasAttribute('treeId'))continue;
 const study=isolateTree(source,id),p=study.getAttribute('position'),box=new Box3(),v=new Vector3();
 for(const j of study.index!.array)box.expandByPoint(v.fromBufferAttribute(p,j));
 const center=box.getCenter(new Vector3()),size=box.getSize(new Vector3()),scale=Math.max(size.x,size.z,size.y*1.33)*.58;
 for(const shot of shots.filter(s=>s.name.startsWith(name+'-'))){
  const view=shot.name.slice(name.length+1),direction=view==='front'?[0,0,3]:view==='profile'?[3,0,0]:view==='detail'?[.65,0,1.1]:[1.5,0,2.8];
  const target=center.clone();if(view==='detail')target.y=box.min.y+size.y*.72;
  shot.target=target.toArray();shot.position=[target.x+direction[0]!*scale,box.min.y+size.y*(view==='detail'?.25:.10),target.z+direction[2]!*scale];
  shot.tree=id;
 }
}
// Gate front is its seaward face (the barrage runs along Z), not its narrow end.
for(const shot of shots){
 // Match the ground-level Singapore forest photographs; the whole-scene
 // studies retain the elevated canopy/layout view separately.
 if(['forest-front','forest-three-quarter','forest-profile'].includes(shot.name)){shot.position[1]=.16;shot.target[1]=.38;}
 if(shot.name==='city-front'||shot.name==='city-profile')shot.position[1]=.025;
 if(shot.name==='hdb-profile')shot.fov=39;
 if(shot.name==='barrage-front'){shot.position=[-3.05,.05,.84];shot.target=[-1.69,-.015,.64];}
 if(shot.name==='barrage-three-quarter'){shot.position=[-2.87,.48,1.42];shot.target=[-1.69,-.015,.64];}
 if(shot.name==='barrage-profile'){shot.position=[-3.05,-.005,.64];shot.target=[-1.69,-.015,.64];}
}
const rendered:string[]=[];
const wanted=process.env.ATLAS_PREVIEW_SHOT?.split(',');if(wanted)shots.sort((a,b)=>wanted.indexOf(a.name)-wanted.indexOf(b.name));
for(const shot of shots){if(process.env.ATLAS_PREVIEW_SHOT&&!process.env.ATLAS_PREVIEW_SHOT.split(',').includes(shot.name))continue;const theme=shot.theme??'paper';await render(surfaces(group(shot.ids),theme,false,shot.name.startsWith('urban-tree'),shot.tree),cam(shot.position,shot.target,shot.fov),theme,`${prefix} / ${shot.name} / engine studio + ACES`).toFile(`${out}/${prefix}-${shot.name}.png`);rendered.push(shot.name);console.log(shot.name);}
fs.writeFileSync(`${out}/${prefix}-render-manifest.json`,JSON.stringify({modelSHA256:modelSHA256,shots:Object.fromEntries(rendered.map(name=>[name,createHash('sha256').update(fs.readFileSync(`${out}/${prefix}-${name}.png`)).digest('hex')]))},null,2)+'\n');

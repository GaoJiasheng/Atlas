/** No browser/WebGL. Rasterizes the shipped meshopt GLB with the installed
 * engine's studio PBR/ACES numerical counterpart. RoomEnvironment is sampled
 * by the reused fossils renderer; this remains CPU evidence, not GPU approval.
 * pnpm tsx scripts/geo/saturn-v/preview-studio.ts round1 [paper|cinema]
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {BufferGeometry,Float32BufferAttribute,Matrix4,Vector3,Color,OrthographicCamera,PerspectiveCamera} from 'three';
import {prepareStudio,studioShade,studioRigs,aces} from '../fossils-and-skeletons/studio-cpu';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color';
type V=[number,number,number];type Surface={id:string;g:BufferGeometry;r:number;m:number;rgb:Color;double:boolean};
const round=process.argv[2]??'round1',theme=process.argv[3]==='cinema'?'cinema':'paper';
const out=`${process.env.ATLAS_PREVIEW_OUT??'scripts/geo/saturn-v/comparisons'}/${round}-${theme}`;fs.mkdirSync(out,{recursive:true});
const data=partsFile.parse(JSON.parse(fs.readFileSync(round==='baseline'?'scripts/geo/saturn-v/baseline/parts.json':'src/content/topics/saturn-v/data/parts.json','utf8')));
const css=fs.readFileSync('src/theme/tokens.css','utf8'),at=css.indexOf(`:root[data-theme="${theme}"] {`),body=css.slice(at,css.indexOf('\n}',at));
const tokens=Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1],m[2]]));
// Verify the renderer's consumed rig, not a design token or a stale preview
// constant. An engine change must invalidate these offline material sheets.
const lightingSource=fs.readFileSync('src/engines/space-scene/stages/model3d/Lighting.tsx','utf8');
for(const mode of ['paper','cinema'] as const){
 const block=lightingSource.match(new RegExp(mode+': \u007b([\\s\\S]*?)\\n  \u007d'))?.[1];
 if(!block)throw new Error('Missing engine rig '+mode);
 const numbers=(text:string)=>text.split(',').map(x=>Number(x.trim()));
 const hemi=block.match(/hemi: \[([^\]]+)/)![1]!,colors=[...hemi.matchAll(/'(#[0-9a-f]+)'/g)].map(x=>new Color(x[1]!).toArray());
 const current=studioRigs[mode];
 const actual={hemi:[...colors,Number(hemi.split(',')[2])],lights:['key','fill','rim'].map((name,i)=>{
  const entry=block.match(new RegExp(name+': \\[([^\\]]+)'))![1]!,hex=entry.match(/'(#[0-9a-f]+)'/)![1]!;
  const direction=numbers(lightingSource.match(new RegExp('const '+['KEY','FILL','RIM'][i]+'_DIR[^\\n]*normalize3\\(\\[([^\\]]+)'))![1]!);
  return [hex,Number(entry.split(',')[1]),direction];
 }),env:Number(block.match(/env: ([\d.]+)/)![1]),exposure:Number(block.match(/exposure: ([\d.]+)/)![1])};
 if(JSON.stringify(actual)!==JSON.stringify(current))throw new Error('CPU studio differs from consumed engine rig '+mode);
}
await MeshoptDecoder.ready;prepareStudio();
const surfaces:Surface[]=[];
const modelPath=process.env.SATURN_MODEL_FILE??`public${data.model}`;
const doc=data.model?await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(modelPath):null;
if(doc)await doc.transform(dequantize());
for(const p of data.parts){
 if(p.mesh&&doc){
  const node=doc.getRoot().listNodes().find(n=>n.getName()===p.mesh)!,prim=node.getMesh()!.listPrimitives()[0]!,g=new BufferGeometry();
  for(const [key,sem]of [['position','POSITION'],['normal','NORMAL'],['color','COLOR_0']]as const){const a=prim.getAttribute(sem);if(a)g.setAttribute(key,new Float32BufferAttribute(a.getArray()!,3));}
  g.setIndex(Array.from(prim.getIndices()!.getArray()!));g.applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()));
  const mat=prim.getMaterial()!,look=resolveMaterialLook(p.primitive?.color??p.material!.color,tokens,theme,p.primitive?.tint??p.material?.tint);
  surfaces.push({id:p.id,g,r:mat.getRoughnessFactor(),m:mat.getMetallicFactor(),rgb:new Color(look.color),double:mat.getDoubleSided()});
 }else for(const piece of partPieces(p)){
  if(piece.lines)continue;const slot=partMaterialSlots(p)[piece.slot??0]!,look=resolveMaterialLook(slot.color,tokens,theme,slot.tint);
  for(const matrix of piece.matrices??[new Matrix4()]){const g=piece.geometry.clone().applyMatrix4(matrix).translate(...p.primitive!.at);surfaces.push({id:p.id,g,r:look.roughness*.92,m:look.metalness,rgb:new Color(look.color),double:false});}piece.geometry.dispose();
 }
}
const W=720,H=900;
const shots:Record<string,{ids:string[];center:V;direction:V;extent:number;ref:string;minY?:number;cutZ?:number;distance?:number;fov?:number;note?:string}>={};
function series(name:string,ids:string[],center:V,extent:number,refs:string[]){
 for(const [i,[view,dir]]of (Object.entries({front:[0,0,1],quarter:[.72,.25,1],profile:[1,0,0]}) as [string,V][]).entries())shots[`${name}-${view}`]={ids,center,direction:dir,extent,ref:refs[Math.min(i,refs.length-1)]!};
}
series('stack',data.parts.filter(p=>p.group!=='lander'&&!['sic-fuel','sic-oxidiser','sii-fuel','sii-oxidiser','sivb-fuel','sivb-oxidiser','sm-tanks','cm-couches'].includes(p.id)).map(p=>p.id),[0,55.5,0],119,['stack-elevation.png','stack-0.jpg','stack-elevation.png']);
series('f1',['f1-centre'],[0,3.4,0],8,['f1-0-upright.jpg','f1-fact-drawing.png','f1-1-upright.jpg']);
series('j2',['j2-centre'],[0,44.3,0],4.4,['j2-front-elevation.png','j2-0.jpg','j2-rear-elevation.png']);
series('csm',['sm-shell','sm-engine','cm-shell','cm-heatshield','cm-probe'],[0,96.7,0],12.8,['csm-elevation.png','csm-side-elevation.png','csm-elevation.png']);
series('les',['les-tower','cm-shell','cm-probe'],[0,105,0],13.5,['les-summary-elevation.png','les-0.jpg','les-summary-elevation.png']);
series('lm',data.parts.filter(p=>p.group==='lander').map(p=>p.id),[0,89.2,0],14.8,['lm-elevation.png','lm-drawing.png','lm-profile.png']);
shots['stack-detail']={ids:['sic-shell','sic-fins','f1-centre','f1-outer'],center:[0,6.6,0],extent:15,direction:[.8,-.35,1],ref:'sic-elevation-detail.png'};
shots['f1-detail']={ids:['f1-centre'],center:[.3,4.8,0],extent:4,direction:[.9,.55,1],ref:'f1-pump.png'};
shots['j2-detail']={ids:['j2-centre'],center:[.2,45.25,0],extent:2.8,direction:[.8,.2,1],ref:'j2-start-tank.png'};
shots['csm-detail']={ids:['sm-shell'],center:[1.3,96,1],extent:6,direction:[1,.2,1],ref:'sm-elevation-detail.png'};
shots['les-detail']={ids:['les-tower','cm-probe'],center:[0,102.8,0],extent:6.4,direction:[.6,0,1],ref:'les-summary-truss.png'};
shots['lm-detail']={ids:data.parts.filter(p=>p.group==='lander').map(p=>p.id),center:[0,90.7,1.3],extent:5.6,direction:[.72,.25,1],ref:'lm-drawing.png'};
shots['couches-detail']={ids:['cm-couches'],center:[0,99.4,.1],extent:3.2,direction:[.12,.95,1],ref:'crewcouch.jpg'};
shots['probe-detail']={ids:['cm-probe'],center:[0,101.9,0],extent:1.3,direction:[.7,.3,1],ref:'probe-summary-detail.png'};
shots['lm-rear-photo']={ids:data.parts.filter(p=>p.group==='lander').map(p=>p.id),center:[0,87.6,0],extent:14.8,direction:[.7,0,-1],distance:14,fov:48,ref:'lm-front-1.jpg',note:'AS11-40-5927: EASEP bay is open in the photograph; model shows its closed flight closure.'};
// Independent feature views make the new pressure domes and bay contents
// reviewable; outer spacecraft skin cannot hide weak internal geometry.
shots['f1-quarter']!.direction=[.70,.75,1];
Object.assign(shots['f1-front']!,{direction:[.20,.9,1],center:[0,3.65,0],extent:6.1,minY:1.30,note:'NASA assembly photo: nozzle extension not fitted. Full contour checked in R-1 quarter drawing.'});
Object.assign(shots['f1-profile']!,{direction:[-1,.08,.18],center:[0,3.56,0],extent:5.5,minY:1.30,ref:'f1-side-upright.png',note:'NASA assembly photo: nozzle extension not fitted. Hardware view only.'});

shots['f1-detail']!.direction=[.25,1.55,1];shots['f1-detail']!.extent=4.3;
Object.assign(shots['j2-quarter']!,{direction:[-1,.2,1],ref:'j2-quarter-upright.png',note:'Smithsonian NASM A19760773000 DSH03: close quarter hardware view; ground frame omitted.'});
Object.assign(shots['j2-profile']!,{direction:[-1,.10,.35],ref:'j2-museum-upright.png',note:'Smithsonian NASM A19760773000: component study; ground support frame omitted.'});
Object.assign(shots['csm-profile']!,{direction:[1,0,0],ref:'csm-side-elevation.png'});
shots['sm-interior']={ids:['sm-tanks'],center:[0,96.25,0],extent:5.4,direction:[0,1,-.04],ref:'sm-sector-layout.png'};
shots['sm-cutaway']={ids:['sm-tanks','sm-shell','sm-engine'],center:[0,96.2,0],extent:7.6,direction:[.8,.5,1],ref:'sm-sector-layout.png',cutZ:0};
shots['cm-detail']={ids:['cm-shell'],center:[0,100.0,0],extent:4.8,direction:[0,.1,1],ref:'cm-window-layout.png'};
shots['iu-detail']={ids:['iu-ring'],center:[0,85.12,0],extent:8.9,direction:[.7,1.0,1],ref:'iu-interior.png'};
shots['sii-tank-detail']={ids:['sii-fuel','sii-oxidiser'],center:[0,55.8,0],extent:24,direction:[.6,.25,1],ref:'sii-cutaway-upright.png',cutZ:0,note:'Tank geometry only; outer skin and engines omitted to expose the common bulkhead.'};
shots['sivb-tank-detail']={ids:['sivb-fuel','sivb-oxidiser'],center:[0,77.2,0],extent:16,direction:[.6,.25,1],ref:'sivb-cutaway-upright.png',cutZ:0,note:'Tank geometry only; AS-506 has nine cold helium spheres. External stage hardware omitted.'};
shots['tank-detail']={ids:['sic-fuel','sic-oxidiser'],center:[0,25,0],extent:37,direction:[.6,.2,1],ref:'sic-tanks-section.png',cutZ:0};
shots['lm-ascent-photo']={ids:['lm-ascent','lm-windows','lm-ascent-engine','lm-docking-port'],center:[0,90.9,0],extent:6.2,direction:[.05,.8,1],ref:'lm5-ascent-photo.png'};
shots['lm-descent-cutaway']={ids:['lm-descent','lm-descent-engine'],center:[0,87.95,0],extent:6.9,direction:[.55,.7,1],ref:'lm-drawing.png',cutZ:0,note:'Apollo 11 press kit: four propellant bays around the central engine; original structural reconstruction.'};
shots['lm-leg-detail']={ids:['lm-legs','lm-ladder','lm-descent'],center:[0,87.2,2.5],extent:6.2,direction:[.9,.35,1],ref:'lm-drawing.png'};
shots['lm-hatch-photo']={ids:['lm-ascent','lm-windows','lm-ladder','lm-descent'],center:[0,90.45,1.25],extent:5.9,direction:[.72,-.55,1],ref:'as11-40-5863.jpg',note:'AS11-40-5863: open hatch and EVA in photo; compare canted glazing and skin. Model hatch closed.'};
shots['lm-pad-photo']={ids:['lm-legs'],center:[0,85.95,4.25],extent:1.9,direction:[.5,.45,1],ref:'as11-40-5917.jpg'};
series('polish-ascent',['lm-ascent','lm-windows','lm-docking-port'],[0,90.8,0],6.7,['polish-ascent-front.jpg','polish-ascent-quarter.jpg','polish-ascent-profile.jpg']);
shots['polish-ascent-detail']={ids:['lm-ascent','lm-windows'],center:[0,91.2,1.5],extent:3.5,direction:[0,.12,1],ref:'polish-windows.jpg'};
shots['polish-target-detail']={ids:['lm-ascent'],center:[.04,91.10,1.961],extent:1.3,direction:[.25,.15,1],ref:'polish-target.jpg'};
series('polish-descent',['lm-descent','lm-descent-engine'],[0,87.95,0],5.8,['polish-descent-front.jpg','polish-descent-quarter.jpg','polish-descent-profile.jpg']);
shots['polish-descent-detail']={ids:['lm-descent'],center:[0,87.95,2.1],extent:2.2,direction:[.25,.18,1],ref:'polish-foil.jpg'};
const selected=process.env.SATURN_SHOTS?new RegExp(process.env.SATURN_SHOTS):null;
const manifestPath=`${out}/render-manifest.json`,manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):{};
const assetSHA256=data.model?createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex'):null;
function render(shot:typeof shots[string]){
 const cam=shot.fov?new PerspectiveCamera(shot.fov,W/H,.01,1000):new OrthographicCamera(-shot.extent*W/H/2,shot.extent*W/H/2,shot.extent/2,-shot.extent/2,.01,1000);
 cam.position.fromArray(shot.center).add(new Vector3(...shot.direction).normalize().multiplyScalar(shot.distance??200));cam.lookAt(new Vector3(...shot.center));cam.updateMatrixWorld();cam.updateProjectionMatrix();
 const matrix=new Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse),depth=new Float32Array(W*H).fill(Infinity),rgb=new Float32Array(W*H*3),normals=new Float32Array(W*H*3),material=new Float32Array(W*H*2),world=new Float32Array(W*H*3),bg=new Color(tokens.paper!);for(let i=0;i<W*H;i++)rgb.set([bg.r,bg.g,bg.b],i*3);
 const v=new Vector3(),view=new Vector3().fromArray(shot.direction).normalize(),projected:number[]=[],shaded:number[]=[],invW:number[]=[];
 for(const s of surfaces.filter(s=>shot.ids.includes(s.id))){const g=s.g,p=g.getAttribute('position'),n=g.getAttribute('normal'),c=g.getAttribute('color'),idx=g.index;
  projected.length=0;shaded.length=0;invW.length=0;
  for(let i=0;i<p.count;i++){
   v.fromBufferAttribute(p,i);const e=matrix.elements;invW.push(1/(e[3]!*v.x+e[7]!*v.y+e[11]!*v.z+e[15]!));v.applyMatrix4(matrix);projected.push((v.x*.5+.5)*W,(-v.y*.5+.5)*H,v.z);
   const albedo:V=[s.rgb.r*(c?c.getX(i):1),s.rgb.g*(c?c.getY(i):1),s.rgb.b*(c?c.getZ(i):1)];
   // Store vertex albedo; Three shades the interpolated normal per fragment.
   shaded.push(...albedo);
  }
  for(let t=0;t<(idx?.count??p.count);t+=3){const ia=(idx?idx.getX(t):t)*3,ib=(idx?idx.getX(t+1):t+1)*3,ic=(idx?idx.getX(t+2):t+2)*3;
   if(shot.minY!==undefined&&[ia/3,ib/3,ic/3].every(i=>p.getY(i)<shot.minY!))continue;
   if(shot.cutZ!==undefined&&[ia/3,ib/3,ic/3].every(i=>p.getZ(i)>shot.cutZ!))continue;
   const ax=projected[ia]!,ay=projected[ia+1]!,bx=projected[ib]!,by=projected[ib+1]!,cx=projected[ic]!,cy=projected[ic+1]!;
   const d=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(d)<1e-8)continue;
   for(let y=Math.max(0,Math.floor(Math.min(ay,by,cy)));y<=Math.min(H-1,Math.ceil(Math.max(ay,by,cy)));y++)for(let x=Math.max(0,Math.floor(Math.min(ax,bx,cx)));x<=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx)));x++){
    const a=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/d,b=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/d,c=1-a-b;if(a<0||b<0||c<0)continue;const z=a*projected[ia+2]!+b*projected[ib+2]!+c*projected[ic+2]!,i=y*W+x;if(z>=depth[i]!)continue;
    const q=a*invW[ia/3]!+b*invW[ib/3]!+c*invW[ic/3]!,fa=a*invW[ia/3]!/q,fb=b*invW[ib/3]!/q,fc=c*invW[ic/3]!/q;
    // Orthographic fragment clipping, matching Three's world-space plane.
    if(shot.cutZ!==undefined&&fa*p.getZ(ia/3)+fb*p.getZ(ib/3)+fc*p.getZ(ic/3)>shot.cutZ)continue;
    if(shot.minY!==undefined&&fa*p.getY(ia/3)+fb*p.getY(ib/3)+fc*p.getY(ic/3)<shot.minY)continue;
    depth[i]=z;
    for(let k=0;k<3;k++){rgb[i*3+k]=fa*shaded[ia+k]!+fb*shaded[ib+k]!+fc*shaded[ic+k]!;normals[i*3+k]=fa*n.array[ia+k]!+fb*n.array[ib+k]!+fc*n.array[ic+k]!;world[i*3+k]=fa*p.array[ia+k]!+fb*p.array[ib+k]!+fc*p.array[ic+k]!;}
    material[i*2]=s.r;material[i*2+1]=s.m;
   }
  }
 }
 const bytes=Buffer.alloc(W*H*3);for(let i=0;i<W*H;i++){
  let color:V=[bg.r,bg.g,bg.b];
  if(depth[i]!==Infinity){
   const normal=new Vector3(normals[i*3]!,normals[i*3+1]!,normals[i*3+2]!).normalize(),fragmentView=shot.fov?cam.position.clone().sub(new Vector3(world[i*3]!,world[i*3+1]!,world[i*3+2]!)).normalize():view;if(normal.dot(fragmentView)<0)normal.negate();
   color=aces(studioShade([rgb[i*3]!,rgb[i*3+1]!,rgb[i*3+2]!],normal.toArray() as V,fragmentView.toArray() as V,theme,material[i*2]!,material[i*2+1]!),studioRigs[theme].exposure);
  }
  for(let k=0;k<3;k++){const x=Math.max(0,color[k]!);bytes[i*3+k]=Math.round(255*Math.min(1,x<=.0031308?x*12.92:1.055*x**(1/2.4)-.055));}
 }return bytes;
}
for(const [name,shot]of Object.entries(shots)){
 if(selected&&!selected.test(name))continue;
 const bytes=render(shot),png=await sharp(bytes,{raw:{width:W,height:H,channels:3}}).png().toBuffer();fs.writeFileSync(`${out}/${name}-render.png`,png);
 const ref=`scripts/geo/saturn-v/refs/${shot.ref}`;if(!fs.existsSync(ref))continue;
 const right=await sharp(ref).resize(W,H,{fit:'contain',background:tokens.paper}).png().toBuffer();
 const title=Buffer.from(`<svg width="1440" height="55"><rect width="1440" height="55" fill="#e9e4d8"/><text x="20" y="22" font-size="16">${name} · ${round} · engine studio ${theme} / ACES · CPU</text><text x="740" y="22" font-size="16">${(shot.ref.startsWith('j2-museum')||shot.ref==='j2-quarter-upright.png')?'Smithsonian NASM':shot.ref==='crewcouch.jpg'?'Weber Aircraft / AFJ':'NASA'} · ${shot.ref} · feature audit</text><text x="20" y="44" font-size="13">${shot.note??'Local compressed GLB, engine material multiplier, RoomEnvironment sampling. GPU acceptance pending.'}</text></svg>`);
 await sharp({create:{width:W*2,height:H+55,channels:3,background:tokens.paper}}).composite([{input:png,top:55,left:0},{input:right,top:55,left:W},{input:title,top:0,left:0}]).png().toFile(`${out}/${name}-comparison.png`);
 manifest[name]={assetSHA256,theme,projection:shot.fov?'perspective':'orthographic',fov:shot.fov??null,distance:shot.distance??200,center:shot.center,direction:shot.direction,extent:shot.extent,ref:shot.ref,cutZ:shot.cutZ??null,minY:shot.minY??null,shading:'interpolated-fragment-normals',rig:studioRigs[theme]};
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 console.log(`${out}/${name}-comparison.png`);
}

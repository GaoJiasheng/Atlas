/** Browser-free preview of decoded delivery meshes and engine-generated primitives.
 * Reuses fossil studio GGX / sampled RoomEnvironment / ACES, actual theme tokens,
 * actual authored cameras, alpha decals and simulation liquid fill. CPU ≠ GPU acceptance.
 */
import fs from 'node:fs';
import sharp from 'sharp';
import {Color,Box3,Matrix3,Matrix4,PerspectiveCamera,Vector3,BufferGeometry,BufferAttribute} from 'three';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {prepareStudio,studioShade,studioRigs,aces} from '../fossils-and-skeletons/studio-cpu';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color';
import {resolveSimValues} from '../../../src/engines/space-scene/lib/sim/controls';
import {evaluateSim} from '../../../src/engines/space-scene/lib/sim';
import {simEffects} from '../../../src/engines/space-scene/lib/sim/bind';
import {fillShapeForPrimitive} from '../../../src/engines/space-scene/lib/fill';
import {createFillGeometry,updateFillGeometry} from '../../../src/engines/space-scene/stages/model3d/fillGeometry';
import {fitCameraToAspect} from '../../../src/engines/space-scene/lib/camera';
import {fitCameraToHud,freeStageRect} from '../../../src/engines/space-scene/lib/hud-framing';
import {museumHudLayouts} from '../fossils-and-skeletons/museum-framing';
import {parse as yaml} from 'yaml';
import {partFrame,applyFrame} from '../../../src/engines/space-scene/lib/sim/frame';
import {toTransform} from '../../../src/engines/space-scene/lib/pose';
const round=process.argv[2]??'round1',baseline=round==='before';
const out=`scripts/geo/heat/comparisons/${round}`;fs.mkdirSync(out,{recursive:true});
const data=partsFile.parse(JSON.parse(fs.readFileSync(process.env.HEAT_PARTS_FILE??(baseline?'scripts/geo/heat/baseline-parts.json':'src/content/topics/heat/data/parts.json'),'utf8')));
const W=Number(process.env.HEAT_WIDTH??900),H=Number(process.env.HEAT_HEIGHT??720);
const tokens:Record<string,Record<string,string>>={paper:{},cinema:{}};const css=fs.readFileSync('src/theme/tokens.css','utf8');
for(const theme of ['paper','cinema']){const start=css.indexOf(`:root[data-theme="${theme}"] {`),body=css.slice(start,css.indexOf('\n}',start));Object.assign(tokens[theme]!,Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1]!,m[2]!])));}
type Texture={pixels:Uint8Array;width:number;height:number};
type Source={id:string;g:BufferGeometry;matrix:Matrix4;slot:{color:string;tint?:string};surface?:{roughness:number;metalness:number;texture?:Texture}};
const sources:Source[]=[];
if(data.model){await MeshoptDecoder.ready;const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(process.env.HEAT_MODEL_FILE??('public'+data.model));await doc.transform(dequantize());
 for(const node of doc.getRoot().listNodes()){const p=data.parts.find(p=>p.mesh===node.getName()),prim=node.getMesh()?.listPrimitives()[0];if(!p||!prim)continue;
  const g=new BufferGeometry();for(const [attr,semantic,n] of [['position','POSITION',3],['normal','NORMAL',3],['uv','TEXCOORD_0',2]] as const){const a=prim.getAttribute(semantic);if(a)g.setAttribute(attr,new BufferAttribute(Float32Array.from(a.getArray()!),n));}const ix=prim.getIndices();if(ix)g.setIndex(new BufferAttribute(Uint32Array.from(ix.getArray()!),1));
  const mat=prim.getMaterial(),src:Source={id:p.id,g,matrix:new Matrix4().fromArray(node.getWorldMatrix()),slot:p.material!};
  if(mat?.getExtras().atlasSurface){src.surface={roughness:mat.getRoughnessFactor(),metalness:mat.getMetallicFactor()};const image=mat.getBaseColorTexture()?.getImage();if(image){const {data:pixels,info}=await sharp(Buffer.from(image)).ensureAlpha().raw().toBuffer({resolveWithObject:true});src.surface.texture={pixels,width:info.width,height:info.height};}}
  sources.push(src);
 }
}
for(const p of data.parts){if(p.mesh)continue;const slots=partMaterialSlots(p);for(const piece of partPieces(p)){if(piece.lines)continue;for(const m of piece.matrices??[new Matrix4()])sources.push({id:p.id,g:piece.geometry,matrix:new Matrix4().makeTranslation(...p.primitive!.at).multiply(m),slot:slots[piece.slot??0]!});}}
const counts:Record<string,{triangles:number;calls:number}>={};for(const src of sources){const c=counts[src.id]??{triangles:0,calls:0};c.triangles+=(src.g.index?.count??src.g.getAttribute('position').count)/3;c.calls++;counts[src.id]=c;}
fs.writeFileSync(`${out}/counts.json`,JSON.stringify({total:Object.values(counts).reduce((a,b)=>a+b.triangles,0),calls:Object.values(counts).reduce((a,b)=>a+b.calls,0),parts:counts},null,2));
if(process.env.HEAT_COUNTS==='1')process.exit(0);
prepareStudio();
type Shot={name:string;ids:string[];position:number[];target:number[];ref?:string;refCrop?:{left:number;top:number;width:number;height:number};fov?:number;theme?:'paper'|'cinema';values?:Record<string,number|string>;pose?:string;region?:'flask'|'gravesande'};
const stand=['retort-stand','probe-clamp'];const cup=['bath-beaker'];const thermometer=['probe','probe-marker'];const heater=['heater'];
const shots:Shot[]=[];
const bounds=new Map<string,Box3>();for(const s of sources){s.g.computeBoundingBox();const box=s.g.boundingBox!.clone().applyMatrix4(s.matrix);bounds.set(s.id,bounds.has(s.id)?bounds.get(s.id)!.union(box):box);}
const framingAudit:Record<string,unknown>={};
for(const [hero,ids,target,d,ref] of [
 ['stand',stand,[-.607,.89,.055],.65,'Retort_stand_with_a_clamp.jpg'],
 ['beaker',cup,[-.55,.81,.08],.34,'Schott_Duran_Beaker_low_form_100ml.jpg'],
 ['thermometer',thermometer,[-.580,.875,.102],.53,'Laboratory_thermometer-04.jpg'],
 ['hotplate',heater,[.15,.771,.10],.32,'Hot_plate_with_magnetic_stirrer_01.jpg'],
 ['spoons',['metal-spoon','plastic-spoon'],[-.55,.865,.095],.40,'Spoons.jpg'],
] as [string,string[],number[],number,string][]){
 for(const [angle,v] of [['front',[0,.025,1]],['three-quarter',[.50,.23,.95]],['profile',[1,.05,.015]]] as [string,number[]][]){shots.push({name:`${hero}-${angle}`,ids,target,position:target.map((x,i)=>x+v[i]!*d),ref});}
 const close:Record<string,{target:number[];v:number[];d:number;ref:string}>={stand:{target:[-.603,.97,.055],v:[.5,.3,.9],d:.23,ref:'Clamp_holder_with_utility_clamp.jpg'},beaker:{target:[-.58,.864,.08],v:[.35,.7,.9],d:.15,ref:'Glass_100ml_beaker.jpg'},thermometer:{target:[-.580,.788,.102],v:[.15,.1,1],d:.10,ref:'Laboratory_thermometer-04.jpg'},hotplate:{target:[.15,.766,.176],v:[.3,.3,1],d:.17,ref:'Laboratory_hot_plate.JPG'}};
 close.spoons={target:[-.55,.80,.095],v:[.15,.2,1],d:.14,ref:'Brass_teaspoon.jpg'};
 const c=close[hero]!;shots.push({name:`${hero}-detail`,ids,target:c.target,position:c.target.map((x,i)=>x+c.v[i]!*c.d),ref:c.ref});
}

for(const [hero,ids,target,d,ref] of [
 ['flask',['bench','expansion-thermometer'],[.4,.896,-.24],.64,'Round_bottom_flask_1.jpg'],
 ['gravesande',['expansion-ball','expansion-ring','bench'],[.245,.891,-.205],.55,"Gravesande's_ring_and_ball.png"],
] as [string,string[],number[],number,string][]){
 for(const [angle,v] of [['front',[0,.045,1]],['three-quarter',[.65,.30,.95]],['profile',[1,.05,0]]] as [string,number[]][])
  shots.push({name:`${hero}-${angle}`,ids,target,position:target.map((x,i)=>x+v[i]!*d),ref,region:hero as 'flask'|'gravesande'});
 const detail=hero==='flask'?[.401,.875,-.24]:[.24,.893,-.22];
 shots.push({name:`${hero}-detail`,ids,target:detail,position:[detail[0]!+.06,detail[1]!+.035,detail[2]!+.16],ref:hero==='flask'?'Round_bottom_flask_500ml.jpg':'eisco-ball-ring.jpg',region:hero as 'flask'|'gravesande'});
 for(const theme of ['paper','cinema'] as const)for(const state of ['start','warm'])shots.push({name:`${hero}-${state}-${theme}`,ids,target,position:[target[0]!+.24,target[1]!+.12,target[2]!+.65],theme,region:hero as 'flask'|'gravesande',pose:hero==='flask'?`liquid-column-${state}`:`ball-ring-${state}`});
}
shots.push({name:'match-flask-school-demo',ids:['bench','expansion-thermometer'],region:'flask',target:[.4,.896,-.24],position:[.4,.94,.43],ref:'purdue-liquid.jpg',refCrop:{left:55,top:0,width:65,height:150}});
for(const theme of ['paper','cinema'] as const)shots.push({name:`beaker-floor-${theme}`,ids:cup,target:[-.55,.763,.08],position:[-.51,.99,.13],theme,ref:'Glass_100ml_beaker.jpg'});

shots.push(
 {name:'match-stand-front',ids:stand,target:[-.607,.89,.055],position:[-.607,.94,.95],ref:'Retort_stand_with_a_clamp.jpg',refCrop:{left:320,top:180,width:400,height:1080}},
 {name:'match-clamp-profile',ids:['probe-clamp'],target:[-.607,.97,.055],position:[-.607,1.25,.08],ref:'Clamp_holder_with_utility_clamp.jpg'},
 {name:'match-beaker-front',ids:cup,target:[-.55,.81,.08],position:[-.55,.824,.48],ref:'Schott_Duran_Beaker_low_form_100ml.jpg'},
 {name:'match-beaker-spout',ids:cup,target:[-.595,.865,.08],position:[-.595,.867,.135],ref:'Glass_100ml_beaker.jpg',refCrop:{left:100,top:290,width:180,height:180}},
 {name:'match-thermometer-scale',ids:thermometer,target:[-.580,.85,.102],position:[-.580,.85,.182],ref:'Lab_thermometer.JPG',refCrop:{left:490,top:0,width:95,height:520}},
 {name:'match-thermometer-bulb',ids:thermometer,target:[-.580,.780,.102],position:[-.580,.780,.157],ref:'Laboratory_thermometer-04.jpg',refCrop:{left:800,top:325,width:105,height:40}},
 {name:'match-hotplate-front',ids:heater,target:[.15,.771,.10],position:[.15,1.04,.57],ref:'Hot_plate_with_magnetic_stirrer_01.jpg',refCrop:{left:300,top:185,width:350,height:415}},
 {name:'match-spoon-bowl',ids:['metal-spoon'],target:[-.567,.80,.095],position:[-.567,.80,.18],ref:'Spoons.jpg',refCrop:{left:450,top:215,width:155,height:210}},
);
for(const id of ['view-hero','view-probe','view-heater','view-cooler']){const c=data.presets!.find(p=>p.id===id)!.camera;for(const theme of ['paper','cinema'] as const)shots.push({name:`${id}-${theme}`,ids:data.parts.filter(p=>p.context||id==='view-hero'||p.group===(id==='view-probe'?'transfer':'curves')).map(p=>p.id).filter(i=>!['wrap','air-gap'].includes(i)),position:c.position,target:c.target,fov:c.fov,theme});}
// Full authored chapter/beat audit uses each state's real hide/layer and camera data.
if(process.env.HEAT_BEATS==='1')for(const file of fs.readdirSync('src/content/topics/heat/chapters').filter(f=>f.endsWith('.mdx'))){const chapter=yaml(fs.readFileSync('src/content/topics/heat/chapters/'+file,'utf8').split('---')[1]!),state=chapter.state;for(const [i,beat] of state.beats.entries()){const s={...state,...beat};const camera=typeof s.camera==='string'?data.presets!.find(p=>p.id===s.camera)!.camera:s.camera;shots.push({name:`beat-${file.slice(0,2)}-${i+1}`,ids:data.parts.filter(p=>(p.context||s.layers.includes(p.group))&&!s.hide?.includes(p.id)).map(p=>p.id),position:camera.position,target:camera.target,fov:camera.fov,values:{...state.sim?.set,...beat.sim?.set}});}}
async function render(shot:Shot){
 const theme=shot.theme??'paper';let cam={position:shot.position as [number,number,number],target:shot.target as [number,number,number],fov:shot.fov??30};
 const isAuthored=shot.name.startsWith('view-')||shot.name.startsWith('beat-');
 const panels=isAuthored&&process.env.HEAT_HUD==='1'?(museumHudLayouts.find(l=>l.width===W)??museumHudLayouts[0]!).panels:[];
 if(isAuthored)cam=fitCameraToAspect(cam,W/H) as typeof cam;
 if(isAuthored&&data.views.hudFrame&&panels.length){const boxes=data.views.hudFrame.parts.filter(id=>shot.ids.includes(id)).flatMap(id=>{const box=bounds.get(id);if(!box)return [];const center=box.getCenter(new Vector3()).toArray() as [number,number,number],half=box.getSize(new Vector3()).multiplyScalar(.5).toArray() as [number,number,number];return [{center,half,minRadiusPx:data.views.hudFrame?.primary?.part===id?data.views.hudFrame.primary.minRadiusPx:undefined}];});cam=fitCameraToHud(cam,boxes,W,H,freeStageRect(W,H,panels),{panels}) as typeof cam;}
 const camera=new PerspectiveCamera(cam.fov,W/H,.001,100);camera.position.fromArray(cam.position);camera.lookAt(new Vector3().fromArray(cam.target));camera.updateMatrixWorld();const projection=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
 const projected=Object.fromEntries(shot.ids.filter(id=>id!=='bench').flatMap(id=>{const box=bounds.get(id);if(!box)return [];const pts=Array.from({length:8},(_,k)=>new Vector3(...box.min.toArray().map((v,i)=>k&(1<<i)?box.max.toArray()[i]!:v) as [number,number,number]).applyMatrix4(projection));return [[id,{x0:Math.min(...pts.map(p=>(p.x*.5+.5)*W)),x1:Math.max(...pts.map(p=>(p.x*.5+.5)*W)),y0:Math.min(...pts.map(p=>(.5-p.y*.5)*H)),y1:Math.max(...pts.map(p=>(.5-p.y*.5)*H))}]];}));
 framingAudit[shot.name]={camera:cam,panels,projected};

 const values=resolveSimValues(data.sim!,shot.values??{}),effects=simEffects(data.sim!,values,evaluateSim(data.sim!,values));
 const triangles:{screen:number[];reciprocalW:number[];lit:number[];uv:number[];texture?:Texture;opacity:number;z:number}[]=[];
 for(const src of sources){if(!shot.ids.includes(src.id))continue;let g=src.g;const fill=effects.fill.get(src.id);if(fill){const shape=fillShapeForPrimitive(data.parts.find(p=>p.id===src.id)!.primitive)!;g=createFillGeometry(shape,fill.meniscus);updateFillGeometry(g,shape,fill.volume,fill.below,fill.meniscus);g.setIndex(new BufferAttribute(Uint32Array.from(g.index!.array.slice(0,g.drawRange.count)),1));}
  const look=resolveMaterialLook(src.slot.color,tokens[theme]!,theme,src.slot.tint),p=g.getAttribute('position'),n=g.getAttribute('normal'),uv=g.getAttribute('uv'),idx=g.index,pose=shot.pose?data.poses?.[shot.pose]?.parts[src.id]:undefined,frame=partFrame(data.parts.find(p=>p.id===src.id)?.primitive?.at??src.matrix.elements.slice(12,15),toTransform(pose)),fm=new Matrix4().set(frame.r[0],frame.r[1],frame.r[2],frame.t[0],frame.r[3],frame.r[4],frame.r[5],frame.t[1],frame.r[6],frame.r[7],frame.r[8],frame.t[2],0,0,0,1),nm=new Matrix3().getNormalMatrix(fm.clone().multiply(src.matrix)),rgb=new Color(look.color).toArray();const points:number[][]=[],lights:number[][]=[],reciprocalW:number[]=[],include:boolean[]=[];
  for(let i=0;i<p.count;i++){
   const restPoint=new Vector3().fromBufferAttribute(p,i).applyMatrix4(src.matrix);const point=new Vector3(...applyFrame(frame,restPoint.toArray()));include.push(!shot.region||src.id!=='bench'||restPoint.y<=.751||(shot.region==='flask'?restPoint.x>.35:restPoint.x<.35));const normal=new Vector3().fromBufferAttribute(n,i).applyMatrix3(nm).normalize(),view=camera.position.clone().sub(point).normalize();
   const offset=effects.offset.get(src.id);if(offset)point.add(new Vector3(...offset));
   reciprocalW.push(-1/point.clone().applyMatrix4(camera.matrixWorldInverse).z);
   const q=point.clone().applyMatrix4(projection);points.push([(q.x*.5+.5)*W,(.5-q.y*.5)*H,q.z]);
   lights.push(studioShade(rgb as [number,number,number],normal.toArray() as [number,number,number],view.toArray() as [number,number,number],theme,src.surface?.roughness??look.roughness*.92,src.surface?.metalness??look.metalness));
  }
  for(let t=0;t<(idx?.count??p.count);t+=3){const ids=[0,1,2].map(k=>idx?idx.getX(t+k):t+k);const screen=ids.flatMap(i=>points[i]!);if(ids.some(i=>!include[i]))continue;if(ids.some(i=>points[i]![2]! < -1||points[i]![2]!>1))continue;triangles.push({screen,reciprocalW:ids.map(i=>reciprocalW[i]!),lit:ids.flatMap(i=>lights[i]!),uv:ids.flatMap(i=>uv?[uv.getX(i),uv.getY(i)]:[0,0]),texture:src.surface?.texture,opacity:src.surface?1:look.opacity,z:(screen[2]!+screen[5]!+screen[8]!)/3});}
 }
 // Painter's transparent layer plus opaque depth; texture alpha is sampled per pixel.
 triangles.sort((a,b)=>Number(!!a.texture||a.opacity<1)-Number(!!b.texture||b.opacity<1)||b.z-a.z);
 const bg=new Color(tokens[theme]!.paper),color=new Float32Array(W*H*3);const hit=new Uint8Array(W*H),depth=new Float32Array(W*H).fill(Infinity);
 for(let i=0;i<W*H;i++)color.set(bg.toArray(),i*3);
 for(const tri of triangles){const [ax,ay,,bx,by,,cx,cy]=tri.screen as number[],d=(by!-cy!)*(ax!-cx!)+(cx!-bx!)*(ay!-cy!);if(Math.abs(d)<1e-8)continue;
  // Single-sided metal is culled; glass decals are double-sided in the delivered asset.
  if(d>0&&!tri.texture)continue;
  const x0=Math.max(0,Math.floor(Math.min(ax!,bx!,cx!))),x1=Math.min(W-1,Math.ceil(Math.max(ax!,bx!,cx!))),y0=Math.max(0,Math.floor(Math.min(ay!,by!,cy!))),y1=Math.min(H-1,Math.ceil(Math.max(ay!,by!,cy!)));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const a=((by!-cy!)*(x+.5-cx!)+(cx!-bx!)*(y+.5-cy!))/d,b=((cy!-ay!)*(x+.5-cx!)+(ax!-cx!)*(y+.5-cy!))/d,c=1-a-b;if(a<0||b<0||c<0)continue;
   const pi=y*W+x,z=a*tri.screen[2]!+b*tri.screen[5]!+c*tri.screen[8]!;if(z>=depth[pi]!)continue;
   let alpha=tri.opacity,tint=[1,1,1];if(tri.texture){const tex=tri.texture,wa=a*tri.reciprocalW[0]!,wb=b*tri.reciprocalW[1]!,wc=c*tri.reciprocalW[2]!,sum=wa+wb+wc,u=(wa*tri.uv[0]!+wb*tri.uv[2]!+wc*tri.uv[4]!)/sum,v=(wa*tri.uv[1]!+wb*tri.uv[3]!+wc*tri.uv[5]!)/sum,i=(Math.min(tex.height-1,Math.max(0,Math.floor(v*tex.height)))*tex.width+Math.min(tex.width-1,Math.max(0,Math.floor(u*tex.width))))*4;alpha*=tex.pixels[i+3]!/255;tint=[0,1,2].map(k=>{const s=tex.pixels[i+k]!/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4;});}
   if(alpha<.001)continue;const i=pi;if(!tri.texture&&alpha===1)depth[i]=z;hit[i]=1;for(let k=0;k<3;k++){const lit=a*tri.lit[k]!+b*tri.lit[3+k]!+c*tri.lit[6+k]!;color[i*3+k]=color[i*3+k]!*(1-alpha)+lit*tint[k]!*alpha;}
  }
 }
 const pixels=new Uint8Array(W*H*3);const tmp=new Color();for(let i=0;i<W*H;i++){if(hit[i])tmp.fromArray(aces([color[i*3]!,color[i*3+1]!,color[i*3+2]!],studioRigs[theme].exposure));else tmp.copy(bg);tmp.convertLinearToSRGB();pixels.set([tmp.r,tmp.g,tmp.b].map(x=>Math.round(x*255)),i*3);}
 const overlay=panels.filter(p=>p.x0<W).map(p=>`<rect x="${p.x0}" y="${p.y0}" width="${p.x1-p.x0}" height="${p.y1-p.y0}" fill="${theme==='paper'?'#f1ede4':'#303134'}" opacity=".94"/><text x="${p.x0+10}" y="${p.y0+25}" fill="${theme==='paper'?'#555047':'#b9b4a8'}" font-size="18">HUD bounds proxy</text>`).join('');
 const png=await sharp(pixels,{raw:{width:W,height:H,channels:3}}).composite(panels.length?[{input:Buffer.from(`<svg width="${W}" height="${H}">${overlay}</svg>`)}]:[]).png().toBuffer();await sharp(png).toFile(`${out}/${shot.name}.png`);
 if(shot.ref){const path='scripts/geo/heat/refs/'+shot.ref;if(fs.existsSync(path)){let reference=sharp(path);if(shot.refCrop)reference=sharp(await reference.extract(shot.refCrop).toBuffer());const ref=await reference.rotate(shot.ref==='Laboratory_thermometer-04.jpg'?90:shot.ref==='Spoons.jpg'?180:shot.ref==='Brass_teaspoon.jpg'?-90:0,{background:'#f6f3ed'}).resize(W,H,{fit:'contain',background:'#f6f3ed'}).png().toBuffer();await sharp({create:{width:W*2,height:H+50,channels:3,background:'#e9e4d8'}}).composite([{input:png,left:0,top:50},{input:ref,left:W,top:50},{input:Buffer.from(`<svg width="1800" height="50"><text x="15" y="30" fill="#2a2824" font-size="20">${round} · ${shot.name} · decoded delivery / engine studio + ACES</text><text x="915" y="30" font-size="17">Reference study · ${shot.ref}</text></svg>`),left:0,top:0}]).png().toFile(`${out}/${shot.name}-comparison.png`);}}
 console.log(`${round}/${shot.name}`);
}
for(const shot of shots){if(process.env.HEAT_SHOT&&!new RegExp(process.env.HEAT_SHOT).test(shot.name))continue;await render(shot);}

fs.writeFileSync(`${out}/framing.json`,JSON.stringify(framingAudit,null,2));

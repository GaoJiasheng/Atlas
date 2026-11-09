/** Browser-free review of the exact decoded topic GLB. Reuses the fossils
 * numerical studio (GGX, sampled RoomEnvironment, ACES), not Workbench.
 * CPU filtering and muscle micrograin are approximations; GPU acceptance is separate.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { Matrix4, Matrix3, Quaternion, Vector3, Color, Box3, OrthographicCamera, PerspectiveCamera } from 'three';
import { prepareStudio, studioShade, studioRigs, aces, roomFingerprint } from '../rebuild-evidence/studio-cpu';
import { resolveMaterialLook } from '../../../src/engines/space-scene/lib/color';
import { anglesQuat, foldAngles, mirrorSignedAxes, midlineNormal } from '../../../src/engines/space-scene/lib/rig';

export type V = [number, number, number];
export interface Surface { id:string; positions:Float32Array; normals:Float32Array; rgb:Color; roughness:number; metalness:number; envIntensity?:number; glow?:number; depthPush?:number; alphas?:Float32Array; polygonOffset?:[number,number]; }
export type Theme = 'paper' | 'cinema';
export function tokens(theme:Theme){
 const css=fs.readFileSync('src/theme/tokens.css','utf8'),start=css.indexOf(`:root[data-theme="${theme}"] {`);
 return Object.fromEntries([...css.slice(start,css.indexOf('\n}',start)).matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1]!,m[2]!]));
}
/** Compare against the executing Lighting.tsx rig, not a sentinel/token file. */
export function verifyRig(){
 const source=fs.readFileSync('src/engines/space-scene/stages/model3d/Lighting.tsx','utf8');
 // Check that the values above actually reach the renderer and its materials.
 for(const binding of ['gl.toneMappingExposure = rig.exposure','scene.environmentIntensity = intensity','<Environment intensity={rig.env}'])if(!source.includes(binding))throw Error(`Studio executing binding changed: ${binding}`);
 const stage=fs.readFileSync('src/engines/space-scene/stages/model3d/Model3DStage.tsx','utf8');
 if(/(?:flat|linear)\s*:\s*true|toneMapping\s*:|outputColorSpace\s*:/.test(stage))throw Error('Stage overrides R3F colour defaults; review CPU tone mapping');
 const req=createRequire(import.meta.url),fiberDir=path.dirname(req.resolve('@react-three/fiber'));
 const fiberFiles=fs.readdirSync(fiberDir).filter(n=>n.startsWith('events-')&&n.endsWith('.esm.js'));
 const renderer=fiberFiles.map(n=>fs.readFileSync(path.join(fiberDir,n),'utf8')).join('\n');
 if(!renderer.includes('gl.toneMapping = flat ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping')||!renderer.includes('gl.outputColorSpace = linear ? THREE.LinearSRGBColorSpace : THREE.SRGBColorSpace'))throw Error('Installed R3F ACES/sRGB binding changed');
 const mannequin=fs.readFileSync('src/engines/space-scene/stages/model3d/Mannequin.tsx','utf8');
 if(!/new MeshStandardMaterial\(\{ roughness: 0\.85, metalness: 0, envMapIntensity: 0\.35/.test(mannequin))throw Error('Executing mannequin material changed');
 const materials=fs.readFileSync('src/engines/space-scene/stages/model3d/materials.ts','utf8');
 if(!materials.includes('material.emissive.set(look.color).multiplyScalar(material.vertexColors ? 0 : look.glow)'))throw Error('Executing tissue emission binding changed');
 for(const theme of ['paper','cinema'] as const){
  const s=source.match(new RegExp(`${theme}: \\{([\\s\\S]*?)\\n  \\}`))![1]!;
  for(const [key,value] of Object.entries({exposure:studioRigs[theme].exposure,env:studioRigs[theme].env})){
   if(Number(s.match(new RegExp(`${key}: ([\\d.]+)`))![1])!==value)throw Error(`${theme} studio ${key} drift`);
  }
  for(const [i,key] of ['key','fill','rim'].entries()){
   const match=s.match(new RegExp(`${key}: \\['([^']+)', ([\\d.]+)\\]`))!;
   if(match[1]!==studioRigs[theme].lights[i]![0]||Number(match[2])!==studioRigs[theme].lights[i]![1])throw Error(`${theme} ${key} drift`);
  }
  const hemi=s.match(/hemi: \['([^']+)', '([^']+)', ([\d.]+)\]/)!;
  const actual=[new Color(hemi[1]).toArray(),new Color(hemi[2]).toArray(),Number(hemi[3])];
  if(JSON.stringify(actual)!==JSON.stringify(studioRigs[theme].hemi))throw Error(`${theme} hemisphere drift`);
 }
 for(const [i,name] of ['KEY','FILL','RIM'].entries()){
  const direction=source.match(new RegExp(`const ${name}_DIR: Vec3 = normalize3\\(\\[([^\\]]+)`))![1]!.split(',').map(Number);
  if(JSON.stringify(direction)!==JSON.stringify(studioRigs.paper.lights[i]![2]))throw Error(`${name} direction drift`);
 }
 return {source:'src/engines/space-scene/stages/model3d/Lighting.tsx',executingSourceSha256:createHash('sha256').update(source+stage+renderer+mannequin+materials).digest('hex'),roomFingerprint,rigs:studioRigs,backend:'CPU depth raster; GGX / sampled installed RoomEnvironment / material emission / ACES / sRGB',limits:'No GPU, shader derivative micrograin, screen AA, shadows or exercise contact acceptance. Roughness map uses its approximate mean.'};
}
export async function loadTopic(topic:string,baseline=false,theme:Theme='paper',mode:'anatomy'|'body'|'exercise'='anatomy',pose?:Record<string,Record<string,number>>,overrideFile?:string){
 await MeshoptDecoder.ready;
 const file=overrideFile??(baseline?`scripts/anatomy/cache/evidence-baseline/muscles-${topic}.glb`:`public/models/muscles-${topic}.glb`);
 const content=JSON.parse(fs.readFileSync(baseline?`scripts/anatomy/cache/evidence-baseline/muscles-${topic}-parts.json`:`src/content/topics/muscles-${topic}/data/parts.json`,'utf8'));
 const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(file);
 await doc.transform(dequantize());
 if(pose){
  const all=doc.getRoot().listNodes();
  // MotionDriver consumes the TOPIC DATA joint specs; source export axes can
  // differ on the right side and are not a substitute for executing inputs.
  const specs=new Map<string,any>(Object.entries(content.rig?.joints as Record<string,any>??{}).map(([name,spec])=>[name,{...spec,name}]));
  const plans=[];
  for(const [name,angles] of Object.entries(pose)){
   const spec=specs.get(name),node=all.find(n=>n.getName()===spec?.node);if(!node)throw Error(`Missing posed ${name}`);
   const left=specs.get(name.replace(/\.r$/,'.l')),leftNode=all.find(n=>n.getName()===left?.node);
   let sceneAxes=spec.axes;
   if(name.endsWith('.r')&&leftNode){const a=new Matrix4().fromArray(leftNode.getWorldMatrix()).elements,b=new Matrix4().fromArray(node.getWorldMatrix()).elements;sceneAxes=mirrorSignedAxes(left.axes,spec.axes,midlineNormal([a[12]!,a[13]!,a[14]!],[b[12]!,b[13]!,b[14]!]));}
   const parent=node.getParentNode(),pq=new Quaternion(),p=new Vector3(),scale=new Vector3();
   new Matrix4().fromArray(parent?.getWorldMatrix()??new Matrix4().toArray()).decompose(p,pq,scale);pq.invert();
   const localAxes=Object.fromEntries(Object.entries(sceneAxes).map(([key,axis])=>[key,new Vector3(...axis as V).normalize().applyQuaternion(pq).toArray() as V]));
   const q=anglesQuat(localAxes,foldAngles(sceneAxes,angles));
   plans.push({node,q:new Quaternion(...q).multiply(new Quaternion(...node.getRotation())).toArray() as [number,number,number,number]});
  }
  for(const plan of plans)plan.node.setRotation(plan.q);
 }
 const specs=new Map<string,any>();
 for(const p of content.parts){if(p.mesh){specs.set(p.mesh,p);if(p.bilateral)specs.set(p.mesh.replace(/\.l$/,'.r'),p);}}
 const result:Surface[]=[];
 for(const node of doc.getRoot().listNodes()){
  const name=node.getName(),mesh=node.getMesh();if(!mesh)continue;
  const part=specs.get(name.replace(/^exercise-/,'')),isBody=['skin-outline','skin-hand.l','skin-hand.r'].includes(name);
  if(mode==='exercise'?!isBody&&!name.startsWith('exercise-'):mode==='body'?!isBody:!part||part.context)continue;
  const skin=node.getSkin(),ibm=skin?.getInverseBindMatrices(),joints=skin?.listJoints();
  const transforms=joints?.map((j,i)=>new Matrix4().fromArray(j.getWorldMatrix()).multiply(new Matrix4().fromArray(ibm!.getElement(i,new Array(16).fill(0)))));
  for(const g of mesh.listPrimitives()){
   const ps=g.getAttribute('POSITION')!,ns=g.getAttribute('NORMAL'),idx=g.getIndices(),js=g.getAttribute('JOINTS_0'),ws=g.getAttribute('WEIGHTS_0');
   const count=idx?.getCount()??ps.getCount(),positions=new Float32Array(count*3),normals=new Float32Array(count*3),col=g.getAttribute('COLOR_0'),alphas=col?new Float32Array(count):undefined;
   const world=new Matrix4().fromArray(node.getWorldMatrix()),nm=new Matrix3().getNormalMatrix(world);
   const point=new Vector3(),normal=new Vector3(),work=new Vector3(),workN=new Vector3(),sum=new Vector3(),sumN=new Vector3();
   for(let i=0;i<count;i++){
    const k=idx?idx.getScalar(i):i;point.fromArray(ps.getElement(k,[0,0,0]));normal.fromArray(ns?.getElement(k,[0,0,0])??[0,0,1]);
    if(transforms&&js&&ws){
     const ji=js.getElement(k,[0,0,0,0]),weights=ws.getElement(k,[0,0,0,0]);sum.set(0,0,0);sumN.set(0,0,0);
     for(let a=0;a<4;a++){if(!weights[a])continue;const m=transforms[ji[a]!]!;work.copy(point).applyMatrix4(m).multiplyScalar(weights[a]!);sum.add(work);workN.copy(normal).transformDirection(m).multiplyScalar(weights[a]!);sumN.add(workN);}
     point.copy(sum);normal.copy(sumN).normalize();
    }else{point.applyMatrix4(world);normal.applyMatrix3(nm).normalize();}
    positions.set(point.toArray(),i*3);normals.set(normal.toArray(),i*3);if(alphas)alphas[i]=col!.getElement(k,[])[3]??1;
   }
   const look=isBody?{color:tokens(theme).mannequin!,roughness:.85,metalness:0,envIntensity:.35}:resolveMaterialLook(part.material?.color??'muscle',tokens(theme),theme,part.material?.tint);
   result.push({id:name,positions,normals,alphas,rgb:new Color(look.color),depthPush:mode==='exercise'&&isBody?.06:0,roughness:look.roughness*(isBody?1:.92),metalness:look.metalness,envIntensity:look.envIntensity,glow:alphas?0:('glow' in look?look.glow:0)});
  }
 }
 return result;
}
export function bounds(shapes:Surface[]){const box=new Box3();const p=new Vector3();for(const s of shapes)for(let i=0;i<s.positions.length;i+=3)box.expandByPoint(p.fromArray(s.positions,i));return box;}
export async function render(shapes:Surface[],file:string,opts:{theme?:Theme;angle?:number;target?:V;height?:number;width?:number;size?:number;caption?:string;camera?:{position:V;target:V;fov:number}}={}){
 const theme=opts.theme??'paper',W=opts.width??640,H=opts.height??800,box=bounds(shapes),target=opts.target?new Vector3(...opts.target):box.getCenter(new Vector3()),span=opts.size??box.getSize(new Vector3()).y*1.12;
 const camera=opts.camera?new PerspectiveCamera(opts.camera.fov,W/H,.001,100):new OrthographicCamera(-span*W/H/2,span*W/H/2,span/2,-span/2,.01,100),angle=(opts.angle??0)*Math.PI/180;
 if(opts.camera){camera.position.fromArray(opts.camera.position);camera.lookAt(new Vector3(...opts.camera.target));}else{camera.position.copy(target).add(new Vector3(Math.sin(angle)*5,.05,Math.cos(angle)*5));camera.lookAt(target);}camera.updateMatrixWorld();camera.updateProjectionMatrix();
 const cm=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),depth=new Float32Array(W*H).fill(Infinity),rgb=new Float32Array(W*H*3),normal=new Float32Array(W*H*3),rough=new Float32Array(W*H),metal=new Float32Array(W*H),envIntensity=new Float32Array(W*H),coord=new Float32Array(W*H*3);
 const glow=new Float32Array(W*H),alpha=new Float32Array(W*H),baseSeen=new Uint8Array(W*H),baseValid=new Uint8Array(W*H);
 const base=shapes.some(s=>s.alphas)?new Float32Array(W*H*13):new Float32Array(0);
 const q=new Float32Array(9),iw=new Float32Array(3),p=new Vector3(),a3=new Vector3(),b3=new Vector3(),c3=new Vector3(),view=new Vector3();
 for(const s of shapes){const ps=s.positions,ns=s.normals;for(let t=0;t<ps.length;t+=9){
  a3.fromArray(ps,t);b3.fromArray(ps,t+3);c3.fromArray(ps,t+6);if(b3.sub(a3).cross(c3.sub(a3)).dot(view.copy(camera.position).sub(a3))<=0)continue;
  for(let j=0;j<3;j++){p.fromArray(ps,t+j*3);const e=cm.elements;iw[j]=1/(e[3]!*p.x+e[7]!*p.y+e[11]!*p.z+e[15]!);p.applyMatrix4(cm);q[j*3]=(p.x*.5+.5)*W;q[j*3+1]=(.5-p.y*.5)*H;q[j*3+2]=p.z;if(s.depthPush){const pushed=new Vector3().fromArray(ps,t+j*3).applyMatrix4(camera.matrixWorldInverse);pushed.z-=s.depthPush;pushed.applyMatrix4(camera.projectionMatrix);q[j*3+2]=pushed.z;}}
  if([q[2],q[5],q[8]].some(z=>z! < -1 || z! > 1))continue;
  const ax=q[0]!,ay=q[1]!,bx=q[3]!,by=q[4]!,cx=q[6]!,cy=q[7]!,d=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(d)<1e-8)continue;
  for(let y=Math.max(0,Math.floor(Math.min(ay,by,cy)));y<=Math.min(H-1,Math.ceil(Math.max(ay,by,cy)));y++)for(let x=Math.max(0,Math.floor(Math.min(ax,bx,cx)));x<=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx)));x++){
   let a=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/d,b=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/d,c=1-a-b;if(a<0||b<0||c<0)continue;
   // 24-bit depth and gl.polygonOffset: factor*slope + units*resolution.
   const dzdx=((q[5]!-q[8]!)*(ay-cy)+(q[8]!-q[2]!)*(by-cy))/d;
   const dzdy=((q[5]!-q[8]!)*(cx-ax)+(q[8]!-q[2]!)*(cx-bx))/d;
   const bias=s.polygonOffset?s.polygonOffset[0]*Math.max(Math.abs(dzdx),Math.abs(dzdy))+s.polygonOffset[1]*2/(2**24-1):0;
   const z=Math.round((a*q[2]!+b*q[5]!+c*q[8]!+bias)*(2**24-1)/2)*2/(2**24-1),i=y*W+x,k=i*3;if(z>depth[i]!)continue;
   const denom=a*iw[0]!+b*iw[1]!+c*iw[2]!;a=a*iw[0]!/denom;b=b*iw[1]!/denom;c=c*iw[2]!/denom;
   if(s.alphas){const a0=a*s.alphas[t/3]!+b*s.alphas[t/3+1]!+c*s.alphas[t/3+2]!;if(a0<.002)continue;alpha[i]=a0;if(!baseSeen[i]){baseSeen[i]=1;baseValid[i]=Number.isFinite(depth[i])?1:0;const z=i*13;for(let j=0;j<3;j++){base[z+j]=rgb[k+j]!;base[z+3+j]=normal[k+j]!;base[z+6+j]=coord[k+j]!;}base[z+9]=rough[i]!;base[z+10]=metal[i]!;base[z+11]=envIntensity[i]!;base[z+12]=glow[i]!;}}
   else alpha[i]=0;
   depth[i]=z;rough[i]=s.roughness;metal[i]=s.metalness;envIntensity[i]=s.envIntensity??1;glow[i]=s.glow??0;
   for(let j=0;j<3;j++){rgb[k+j]=[s.rgb.r,s.rgb.g,s.rgb.b][j]!;normal[k+j]=a*ns[t+j]!+b*ns[t+3+j]!+c*ns[t+6+j]!;coord[k+j]=a*ps[t+j]!+b*ps[t+3+j]!+c*ps[t+6+j]!;}
  }
 }}
 prepareStudio();const output=new Uint8Array(W*H*3),bg=new Color(theme==='paper'?'#e9e4d8':'#1f2124'),color=new Color(),baseColor=new Color();
 for(let i=0;i<W*H;i++){
  const k=i*3;if(depth[i]===Infinity)color.copy(bg);else{
   p.fromArray(normal,k).normalize();view.copy(camera.position).sub(a3.fromArray(coord,k)).normalize();
   const lit=studioShade([rgb[k]!,rgb[k+1]!,rgb[k+2]!],p.toArray() as V,view.toArray() as V,theme,rough[i]!,metal[i]!,undefined,envIntensity[i]!);
   // stylePartMaterial adds albedo * look.glow to outgoing radiance.
   for(let j=0;j<3;j++)lit[j]!+=rgb[k+j]!*glow[i]!;
   color.fromArray(aces(lit,studioRigs[theme].exposure));
  }if(alpha[i]!>0){const z=i*13;if(!baseValid[i])baseColor.copy(bg);else{p.fromArray(base,z+3).normalize();view.copy(camera.position).sub(a3.fromArray(base,z+6)).normalize();const light=studioShade([base[z]!,base[z+1]!,base[z+2]!],p.toArray()as V,view.toArray()as V,theme,base[z+9]!,base[z+10]!,undefined,base[z+11]!);for(let j=0;j<3;j++)light[j]!+=base[z+j]!*base[z+12]!;baseColor.fromArray(aces(light,studioRigs[theme].exposure));}color.lerp(baseColor,1-alpha[i]!);}
  color.convertLinearToSRGB();output[k]=Math.round(color.r*255);output[k+1]=Math.round(color.g*255);output[k+2]=Math.round(color.b*255);
 }
 fs.mkdirSync(path.dirname(file),{recursive:true});
 await sharp(output,{raw:{width:W,height:H,channels:3}}).png().toFile(file);
 return {file,triangles:shapes.reduce((n,s)=>n+s.positions.length/9,0),draws:shapes.length,camera:{angle:opts.angle??0,target:target.toArray(),height:span},width:W,height:H};
}
export async function compare(renderPath:string,referencePath:string,out:string,caption:string,referenceCaption='Historical reference · PD Gray / Carter'){
 const h=800,w=640;
 const left=await sharp(renderPath).resize(w,h,{fit:'contain',background:'#e9e4d8'}).png().toBuffer(),right=await sharp(referencePath).resize(w,h,{fit:'contain',background:'#faf8f2'}).png().toBuffer();
 const title=Buffer.from(`<svg width="1280" height="62"><rect width="1280" height="62" fill="#e9e4d8"/><text x="18" y="23" font-family="sans-serif" font-size="16" fill="#2a2824">${caption.replaceAll('&amp;','&').replaceAll('&','&amp;').replaceAll('<','&lt;')}</text><text x="18" y="47" font-family="sans-serif" font-size="14">Decoded GLB · CPU engine studio / ACES</text><text x="658" y="47" font-family="sans-serif" font-size="14">${referenceCaption}</text></svg>`);
 await sharp({create:{width:w*2,height:h+62,channels:3,background:'#e9e4d8'}}).composite([{input:left,left:0,top:62},{input:right,left:w,top:62},{input:title,left:0,top:0}]).png().toFile(out);
}

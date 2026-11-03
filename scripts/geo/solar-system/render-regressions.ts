/** Offline regression of real primitive geometry and the solar shader's zero-flag branch.
 * CPU geometry/material reconstruction only: not a WebGL/PBR, interaction or timing test.
 * pnpm tsx scripts/geo/solar-system/render-regressions.ts
 */
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {Color,Matrix4,Matrix3,Vector3,Quaternion,PerspectiveCamera} from 'three';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color';
import {orbitSnapshot} from '../../../src/engines/space-scene/lib/sim/orbit-rotation';
import {orbitDisplay,bodyPlacement} from '../../../src/engines/space-scene/lib/sim/orbit-projection';
import type {Theme} from '../../../src/theme/theme';

const out='/tmp/atlas-solar-system-polish/regressions';mkdirSync(out,{recursive:true});
const css=readFileSync('src/theme/tokens.css','utf8'),materialSource=readFileSync('src/engines/space-scene/stages/model3d/materials.ts','utf8');
if(!materialSource.includes('if (vEmission > 0.5 && vEmission < 3.5)'))throw new Error('Solar opt-in guard changed; re-audit CPU neutral-path check.');
function themeTokens(theme:Theme){
 const paper=css.slice(css.indexOf(':root[data-theme="paper"]')),cinema=css.slice(css.indexOf(':root[data-theme="cinema"]'));
 const source=theme==='paper'?paper.slice(0,paper.indexOf('}')):cinema.slice(0,cinema.indexOf('}'));
 const raw=Object.fromEntries([...source.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(x=>[x[1]!,x[2]!.trim()]));
 for(let i=0;i<6;i++)for(const [key,value] of Object.entries(raw))raw[key]=value.replace(/var\(--([\w-]+)\)/g,(_,name:string)=>raw[name]??'#888888');
 return raw;
}
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const encode=(v:number)=>Math.round(255*(clamp(v)<=.0031308?12.92*clamp(v):1.055*clamp(v)**(1/2.4)-.055));
type Draw={v:Float32Array;indices:Uint32Array;color:[number,number,number];alpha:number;metal:number;rough:number;glow:number;closed:boolean;emission:number;z:number};
const W=600,H=500;
const report:any={method:'CPU geometry/material reconstruction; not WebGL/PBR. Same real partPieces geometry before and after adding the exact solar opt-in guard. Default orbit snapshot and authored assembled cameras. No procedural surface maps, room reflections, dynamic orbit guide overlays, or live GPU validation.',shaderGuard:'vEmission > 0.5 && vEmission < 3.5',results:[]};
for(const topic of ['aircon','sun-earth-moon']){
 const data=partsFile.parse(JSON.parse(readFileSync(`src/content/topics/${topic}/data/parts.json`,'utf8')));
 const orbit=data.sim?.orbitRotation,values=Object.fromEntries(data.sim?.controls.map(c=>[c.id,c.default])??[]);
 const snapshot=orbit?orbitSnapshot(orbit,values):null,display=orbit&&snapshot?orbitDisplay(orbit,snapshot,String(values['scale-mode'])):null;
 const pose=data.views!.assembled!.camera!,camera=new PerspectiveCamera(pose.fov,W/H,.001,1000);camera.position.fromArray(pose.position);camera.lookAt(new Vector3(...pose.target));camera.updateMatrixWorld();
 const project=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),light=new Vector3(-3,5,7).normalize(),eye=camera.position.clone();
 for(const theme of ['paper','cinema'] as const){
  const tokens=themeTokens(theme),draws:Draw[]=[];let triangleCount=0,flagged=0;
  for(const part of data.parts){
   if(!part.primitive)throw new Error(`Expected primitive regression part: ${topic}/${part.id}`);
   const slots=partMaterialSlots(part),main=part.primitive.at,partMatrix=new Matrix4().makeTranslation(...main);
   const binding=data.sim?.bind.find(b=>'part' in b&&(Array.isArray(b.part)?b.part.includes(part.id):b.part===part.id)&&b.bodyTransform);
   if(binding&&'part' in binding&&binding.bodyTransform&&snapshot&&display){
    const placement=bodyPlacement(snapshot,display,binding.bodyTransform);
    partMatrix.compose(new Vector3(...placement.position),new Quaternion(...placement.quaternion),new Vector3().setScalar(placement.scale));
   }
   for(const piece of partPieces(part)){
    if(piece.lines)continue;
    const slot=slots[piece.slot??0]!,look=resolveMaterialLook(slot.color,tokens,theme,slot.tint),color=new Color().set(look.color);
    const p=piece.geometry.getAttribute('position'),n=piece.geometry.getAttribute('normal'),index=piece.geometry.index;
    const indices=index?new Uint32Array(index.array):Uint32Array.from({length:p.count},(_,i)=>i);
    const emission=piece.geometry.getAttribute('_emission');if(emission)for(let i=0;i<emission.count;i++)if(emission.getX(i)!==0)flagged++;
    for(const local of piece.matrices??[new Matrix4()]){
     const m=partMatrix.clone().multiply(local),nm=new Matrix3().getNormalMatrix(m),vertices=new Float32Array(p.count*7),v=new Vector3(),normal=new Vector3();let centerDepth=0;
     for(let i=0;i<p.count;i++){
      v.fromBufferAttribute(p,i).applyMatrix4(m);normal.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();
      const toEye=eye.clone().sub(v).normalize(),diff=Math.max(0,normal.dot(light)),spec=Math.pow(Math.max(0,normal.dot(light.clone().add(toEye).normalize())),12+80*(1-look.roughness));
      const shade=.25+.75*diff+spec*(.06+.18*look.metalness)+look.glow;
      const z=-v.clone().applyMatrix4(camera.matrixWorldInverse).z;v.applyMatrix4(project);vertices.set([(v.x*.5+.5)*W,(-v.y*.5+.5)*H,z,normal.x,normal.y,normal.z,shade],i*7);centerDepth+=z;
     }
     triangleCount+=indices.length/3;
     draws.push({v:vertices,indices,color:[color.r,color.g,color.b],alpha:look.opacity,metal:look.metalness,rough:look.roughness,glow:look.glow,closed:!look.doubleSided,emission:0,z:centerDepth/p.count});
    }
    piece.geometry.dispose();
   }
  }
  if(flagged)throw new Error(`${topic} unexpectedly carries ${flagged} nonzero solar emission attributes`);
  draws.sort((a,b)=>Number(a.alpha<.999)-Number(b.alpha<.999)||(a.alpha<.999?b.z-a.z:0));
  function render(after:boolean){
   const bg=new Color().set(tokens.paper!),pixels=new Float32Array(W*H*3),depth=new Float32Array(W*H).fill(Infinity);
   for(let i=0;i<W*H;i++)pixels.set([bg.r,bg.g,bg.b],i*3);
   for(const d of draws){
    const {v,indices}=d;
    for(let i=0;i<indices.length;i+=3){
     const a=indices[i]!*7,b=indices[i+1]!*7,c=indices[i+2]!*7,ax=v[a]!,ay=v[a+1]!,bx=v[b]!,by=v[b+1]!,cx=v[c]!,cy=v[c+1]!;
     const area=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(area)<1e-7||v[a+2]!<=0||v[b+2]!<=0||v[c+2]!<=0)continue;
     if(d.closed&&area>0)continue;
     const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx))),y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(H-1,Math.ceil(Math.max(ay,by,cy)));
     for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const wa=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/area,wb=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/area,wc=1-wa-wb;if(wa<0||wb<0||wc<0)continue;
      const z=wa*v[a+2]!+wb*v[b+2]!+wc*v[c+2]!,at=y*W+x;if(z>depth[at]!)continue;
      let illumination=wa*v[a+6]!+wb*v[b+6]!+wc*v[c+6]!;
      // Exact shared shader opt-in condition: ordinary primitive default _emission=0.
      if(after&&d.emission>.5&&d.emission<3.5)throw new Error('Regression topic activated solar override');
      for(let k=0;k<3;k++)pixels[at*3+k]=d.color[k]!*illumination*d.alpha+pixels[at*3+k]!*(1-d.alpha);
      if(d.alpha>=.999)depth[at]=z;
     }
    }
   }
   return Buffer.from(pixels.map(encode));
  }
  const before=render(false),after=render(true),diff=Buffer.alloc(before.length);let different=0,maxDifference=0;
  const background=new Color(tokens.paper!),bgBytes=[encode(background.r),encode(background.g),encode(background.b)];
  let shadedPixels=0;for(let i=0;i<W*H;i++)if(before[i*3]!==bgBytes[0]||before[i*3+1]!==bgBytes[1]||before[i*3+2]!==bgBytes[2])shadedPixels++;
  if(shadedPixels<100)throw new Error(`${topic}/${theme}: blank regression render`);
  for(let i=0;i<before.length;i++){const d=Math.abs(before[i]!-after[i]!);diff[i]=d;different+=Number(d!==0);maxDifference=Math.max(maxDifference,d)}
  const name=`${topic}-${theme}`,beforePng=await sharp(before,{raw:{width:W,height:H,channels:3}}).png().toBuffer(),afterPng=await sharp(after,{raw:{width:W,height:H,channels:3}}).png().toBuffer();
  writeFileSync(`${out}/${name}-before.png`,beforePng);writeFileSync(`${out}/${name}-after.png`,afterPng);await sharp(diff,{raw:{width:W,height:H,channels:3}}).png().toFile(`${out}/${name}-diff.png`);
  const caption=(s:string)=>Buffer.from(`<svg width="600" height="32"><rect width="600" height="32" fill="#1f2124"/><text x="12" y="22" fill="#e9e4d8" font-size="14" font-family="sans-serif">${s} · CPU RECONSTRUCTION</text></svg>`);
  await sharp({create:{width:W*2,height:H+32,channels:3,background:'#1f2124'}}).composite([{input:beforePng,left:0,top:32},{input:afterPng,left:W,top:32},{input:caption(`${topic} / ${theme} / BEFORE`),left:0,top:0},{input:caption(`${topic} / ${theme} / AFTER SOLAR OPT-IN`),left:W,top:0}]).png().toFile(`${out}/${name}-comparison.png`);
  const result={topic,theme,triangles:triangleCount,shadedPixels,nonzeroEmissionAttributes:flagged,differentChannelBytes:different,maxDifference,pngBytesEqual:beforePng.equals(afterPng),sha256:createHash('sha256').update(beforePng).digest('hex')};report.results.push(result);console.log(result);
 }
}
writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');
console.log(out);

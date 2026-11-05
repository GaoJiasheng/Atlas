/** Offline inspection of the actual generated meshes. No browser or GPU.
 * pnpm tsx scripts/geo/cells/preview.ts [--input parts.json] [--out /private/tmp/atlas-cells-previews] [--only regex] [--counts]
 * python3 scripts/geo/cells/render-preview.py /private/tmp/atlas-cells-previews/*.json
 * Smooth shaded CPU form previews approximate lighting/materials; they do not replace runtime HUD QA.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { BufferAttribute, BufferGeometry, Euler, Matrix3, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { partsFile, type Part } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { anchorPoint } from '../../../src/engines/space-scene/stages/model3d/shapes';
import { partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { resolveMaterialLook } from '../../../src/engines/space-scene/lib/color';

const args = process.argv.slice(2);
const arg = (key: string, fallback: string) => { const i=args.indexOf(key); return i < 0 ? fallback : args[i+1] ?? fallback; };
const input=arg('--input','src/content/topics/cells/data/parts.json');
const out=arg('--out','/private/tmp/atlas-cells-previews');
const only=new RegExp(arg('--only','.*'));
const raw=JSON.parse(readFileSync(input,'utf8')) as {model?:string};
const data=partsFile.parse(raw);
mkdirSync(out,{recursive:true});
const width=900,height=750;
const vec=(v: readonly number[])=>new Vector3(v[0],v[1],v[2]);
const bytes=(a:Float32Array|Uint32Array)=>Buffer.from(a.buffer,a.byteOffset,a.byteLength).toString('base64');
type Source={part:Part;geometry:BufferGeometry;matrix:Matrix4;material:{color:string;tint?:string}};
const sources:Source[]=[];
const meshLabelPoints=new Map<string,Vector3>();
await MeshoptDecoder.ready;
const glb=data.model ? await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(arg('--asset',`public${data.model}`)) : undefined;
// Extras are authored in the quantised node's local frame. Capture world
// points before dequantize changes that frame, matching production GLTFLoader.
if(glb)for(const part of data.parts.filter(p=>p.mesh)){
  const node=glb.getRoot().listNodes().find(n=>n.getName()===part.mesh);
  const point=node?.getExtras().labelPoint;
  if(Array.isArray(point)&&point.length===3&&point.every(Number.isFinite))meshLabelPoints.set(part.id,vec(point).applyMatrix4(new Matrix4().fromArray(node!.getWorldMatrix())));
}
if(glb)await glb.transform(dequantize());
for(const part of data.parts){
  if(part.primitive){
    const slots=partMaterialSlots(part);
    for(const piece of partPieces(part)){
      if(piece.lines)continue;
      for(const copy of piece.matrices??[new Matrix4()])sources.push({part,geometry:piece.geometry,matrix:new Matrix4().makeTranslation(...part.primitive.at).multiply(copy),material:slots[piece.slot??0]!});
    }
  }else if(part.mesh && glb){
    const root=glb.getRoot().listNodes().find(n=>n.getName()===part.mesh);
    if(!root)throw new Error(`Missing GLB node ${part.mesh}`);
    root.traverse(node=>{
      for(const primitive of node.getMesh()?.listPrimitives()??[]){
        const positions=primitive.getAttribute('POSITION');
        if(!positions)continue;
        const geometry=new BufferGeometry();
        geometry.setAttribute('position',new BufferAttribute(Float32Array.from(positions.getArray()!),3));
        const normals=primitive.getAttribute('NORMAL');
        if(normals)geometry.setAttribute('normal',new BufferAttribute(Float32Array.from(normals.getArray()!),3));
        const index=primitive.getIndices();
        if(index)geometry.setIndex(new BufferAttribute(Uint32Array.from(index.getArray()!),1));
        if(!normals)geometry.computeVertexNormals();
        sources.push({part,geometry,matrix:new Matrix4().fromArray(node.getWorldMatrix()),material:part.material!});
      }
    });
  }
}
const counts:Record<string,number>={};
for(const s of sources){const n=(s.geometry.index?.count??s.geometry.getAttribute('position').count)/3;counts[s.part.group??'context']=(counts[s.part.group??'context']??0)+n;}
writeFileSync(`${out}/counts.json`,JSON.stringify({input,total:Object.values(counts).reduce((a,b)=>a+b,0),groups:counts},null,2)+'\n');
console.log(JSON.stringify({input,total:Object.values(counts).reduce((a,b)=>a+b,0),groups:counts}));
if(args.includes('--counts'))process.exit(0);

type Camera={position:readonly number[];target:readonly number[];fov?:number};
type Shot={camera:Camera;groups?:string[];parts?:string[];pose?:string|null;hide?:string[];labels?:string[];selected?:string;objective?:number;caption?:string};
const preset=(id:string)=>data.presets?.find(p=>p.id===id)?.camera;
const shots:Record<string,Shot>={
  pair:{camera:preset('pair-hero')??{position:[0,.28,.65],target:[0,.12,0]},groups:['animal-cell','plant-cell']},
  'animal-front':{camera:{position:[.1,.11,.27],target:[.1,.1,0]},groups:['animal-cell'],labels:['animal-membrane','animal-cytoplasm','animal-nucleus']},
  'animal-oblique':{camera:preset('animal-oblique')??{position:[.30,.23,.22],target:[.1,.1,0]},groups:['animal-cell']},
  'animal-nucleus':{camera:{position:[.115,.115,.1],target:[.115,.1,.005]},groups:['animal-cell']},
  'animal-organelles':{camera:{position:[.09,.09,.13],target:[.09,.09,.004]},groups:['animal-cell']},
  'plant-front':{camera:{position:[-.1,.12,.34],target:[-.1,.12,0]},groups:['plant-cell'],labels:['plant-cell-wall','plant-membrane','plant-cytoplasm','plant-vacuole']},
  'plant-oblique':{camera:{position:[.09,.29,.27],target:[-.1,.12,0]},groups:['plant-cell']},
  'plant-chloroplasts':{camera:{position:[-.05,.12,.08],target:[-.1,.149,.018]},groups:['plant-cell']},
  'scope-whole':{camera:preset('scope-whole')??{position:[.62,.4,.65],target:[.2,.18,0]},groups:['microscope-bench']},
  'scope-front':{camera:{position:[.20,.26,.77],target:[.20,.18,0]},groups:['microscope-bench']},
  'scope-stage':{camera:preset('scope-stage-close')??{position:[.42,.26,.32],target:[.18,.17,0]},groups:['microscope-bench']},
  'scope-high':{camera:{position:[.42,.26,.32],target:[.18,.20,0]},groups:['microscope-bench'],pose:'scope-high'},
  'scope-eyepiece':{camera:{position:[.30,.39,.20],target:[.18,.32,.008]},groups:['microscope-bench']},
  'scope-knobs':{camera:{position:[.43,.22,.18],target:[.27,.16,0]},groups:['microscope-bench']},
  'onion-patch':{camera:{position:[-.1,.04,.28],target:[-.1,.02,.03]},parts:['onion-patch']},
  'animal-mitochondria':{camera:{position:[.135,.132,.053],target:[.135,.123,.003]},groups:['animal-cell']},
  'plant-mitochondria':{camera:{position:[-.121,.091,.052],target:[-.121,.086,.02]},groups:['plant-cell']},
};
// Use the chapter's actual camera, hide list, selected part, label list and objective state.
for(const file of readdirSync('src/content/topics/cells/chapters').filter(f=>f.endsWith('.mdx'))){
  const raw=readFileSync(`src/content/topics/cells/chapters/${file}`,'utf8').split('---')[1]!;
  const chapter=JSON.parse(raw) as {state?:Record<string,unknown>};
  const state=chapter.state??{};
  const beats=(state.beats??[]) as Record<string,unknown>[];
  for(const [i,beat] of beats.entries()){
    const s={...state,...beat};
    const labels=(s.labels??[]) as string[];
    const selected=s.part as string|undefined;
    const caption=(s.caption as {en?:string}|undefined)?.en??'';
    const cam=typeof s.camera==='string'?preset(s.camera):s.camera as Camera;
    if(!cam)continue;
    const sim=(s.sim as {set?:{objective?:number}}|undefined)?.set;
    shots[`beat-${file.slice(0,2)}-${i+1}`]={camera:cam,pose:s.pose as string|null,hide:s.hide as string[]|undefined,labels,selected,objective:sim?.objective,caption};
  }
}
const css=readFileSync('src/theme/tokens.css','utf8');
const themeTokens=(theme:'paper'|'cinema')=>{
  const section=theme==='paper'?css.slice(css.indexOf(':root[data-theme="paper"]')):css.slice(css.indexOf(':root[data-theme="cinema"]'));
  const tokens:Record<string,string>={};
  for(const match of section.slice(0,section.indexOf('\n}')).matchAll(/(--[\w-]+):\s*([^;]+);/g))tokens[match[1]!]=match[2]!.trim();
  for(let i=0;i<3;i++)for(const [k,v] of Object.entries(tokens))tokens[k]=v.replace(/var\((--[\w-]+)\)/g,(_,key:string)=>tokens[key]??'#888888');
  return Object.fromEntries(Object.entries(tokens).map(([k,v])=>[k.slice(2),v]));
};
for(const [name,shot] of Object.entries(shots)){
  if(!only.test(name))continue;
  const camera=new PerspectiveCamera(shot.camera.fov??30,width/height,.0001,1000);
  camera.position.copy(vec(shot.camera.position));camera.lookAt(vec(shot.camera.target));camera.updateMatrixWorld();
  const projection=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  const meshes:unknown[]=[];
  const labels:unknown[]=[];
  let triangles=0;
  const seen=new Set<string>();
  for(const s of sources){
    const {part,geometry:g}=s;
    if(shot.hide?.includes(part.id)||shot.groups&&!shot.groups.includes(part.group??'')||shot.parts&&!shot.parts.includes(part.id))continue;
    const poseName=shot.pose??(shot.objective===40?'scope-high':shot.objective===10?'scope-low':'scope-scan');
    const pose=data.poses?.[poseName]?.parts[part.id];
    const transform=new Matrix4();
    if(pose){
      const pivot=vec(pose.pivot??part.primitive?.at??[0,0,0]),offset=vec(pose.offset??[0,0,0]),r=pose.rotation??[0,0,0],scale=pose.scale??1;
      const sv=typeof scale==='number'?[scale,scale,scale]:scale;
      transform.makeTranslation(pivot.x+offset.x,pivot.y+offset.y,pivot.z+offset.z).multiply(new Matrix4().makeRotationFromEuler(new Euler(r[0]*Math.PI/180,r[1]*Math.PI/180,r[2]*Math.PI/180))).multiply(new Matrix4().makeScale(sv[0]!,sv[1]!,sv[2]!)).multiply(new Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z));
    }
    const m=transform.clone().multiply(s.matrix),normalMatrix=new Matrix3().getNormalMatrix(m);
    const p=g.getAttribute('position'),n=g.getAttribute('normal');
    const position=new Float32Array(p.count*3),normal=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){
      const world=new Vector3().fromBufferAttribute(p,i).applyMatrix4(m),screen=world.clone().applyMatrix4(projection);
      position.set([(screen.x+1)*width/2,(1-screen.y)*height/2,-world.clone().applyMatrix4(camera.matrixWorldInverse).z],i*3);
      const norm=new Vector3().fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize();normal.set([norm.x,norm.y,norm.z],i*3);
    }
    const index=g.index?Uint32Array.from(g.index.array):Uint32Array.from({length:p.count},(_,i)=>i);
    const paper=resolveMaterialLook(s.material.color,themeTokens('paper'),'paper',s.material.tint),cinema=resolveMaterialLook(s.material.color,themeTokens('cinema'),'cinema',s.material.tint);
    meshes.push({id:part.id,position:bytes(position),normal:bytes(normal),index:bytes(index),paper,cinema});triangles+=index.length/3;
    if(!seen.has(part.id)&&shot.labels?.includes(part.id)){
      seen.add(part.id);
      let point:Vector3;
      if(part.primitive)point=vec(anchorPoint(part)).add(vec(part.primitive.at));
      else if(meshLabelPoints.has(part.id))point=meshLabelPoints.get(part.id)!.clone();
      else {g.computeBoundingBox();point=g.boundingBox!.getCenter(new Vector3()).applyMatrix4(s.matrix);}
      point.applyMatrix4(transform).applyMatrix4(projection);
      labels.push({id:part.id,text:part.name.en,x:(point.x+1)*width/2,y:(1-point.y)*height/2});
    }
  }
  writeFileSync(`${out}/${name}.json`,JSON.stringify({width,height,name,caption:shot.caption,labels,triangles,meshes}));
  console.log(`${name}: ${triangles} triangles`);
}

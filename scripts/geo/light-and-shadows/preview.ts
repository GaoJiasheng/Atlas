/** pnpm tsx scripts/geo/light-and-shadows/preview.ts round1 */
import fs from 'node:fs';
import sharp from 'sharp';
import { BufferGeometry, Float32BufferAttribute, Matrix4, Vector3 } from 'three';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { projectShadow } from '../../../src/engines/space-scene/lib/sim/shadow';
import { evaluateSim } from '../../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../../src/engines/space-scene/lib/sim/controls';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { renderParts, measureParts, type V3 } from '../kits/rebuild-studio';
import type { Part } from '../../../src/engines/space-scene/schema';
const round=process.argv[2]??'final',out=`scripts/geo/light-and-shadows/evidence/${round}`;fs.mkdirSync(out,{recursive:true});
const data=JSON.parse(fs.readFileSync('src/content/topics/light-and-shadows/data/parts.json','utf8'));
await MeshoptDecoder.ready;const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public/models/light-and-shadows.glb');await doc.transform(dequantize());
const node=doc.getRoot().listNodes().find(n=>n.getName()==='courtyard')!,prim=node.getMesh()!.listPrimitives()[0]!,g=new BufferGeometry(),world=new Matrix4().fromArray(node.getWorldMatrix());
for(const [name,attr] of [['POSITION','position'],['NORMAL','normal'],['COLOR_0','color']])g.setAttribute(attr!,new Float32BufferAttribute(prim.getAttribute(name!)!.getArray()!,3));
g.setIndex(Array.from(prim.getIndices()!.getArray()!));g.applyMatrix4(world);const pivot=data.parts.find((p:Part)=>p.id==='courtyard').primitive.at;g.translate(-pivot[0],-pivot[1],-pivot[2]);
const parts=data.parts.filter((p:Part)=>['courtyard','pole','north-arrow'].includes(p.id));
// Project the REAL caster geometry with the SAME sim vector and helper as ShadowCast.
// A single depth-tested surface represents the overlay; GPU feathering remains a limit.
const parsed=partsFile.parse(data),values=resolveSimValues(parsed.sim!,{time:8,date:'oct-20'}),outputs=evaluateSim(parsed.sim!,values) as Record<string,unknown>,sv=outputs['sun-at'] as {x:number;y:number;z:number};
const shadowPositions:number[]=[];
const pole=parsed.parts.find(p=>p.id==='pole')!;
for(const piece of partPieces(pole))for(const m of piece.matrices??[new Matrix4()]){
 const q=piece.geometry.index?piece.geometry.toNonIndexed():piece.geometry.clone(),a=q.getAttribute('position');for(let i=0;i<a.count;i++){
 const p=new Vector3().fromBufferAttribute(a,i).applyMatrix4(m).add(new Vector3(...pole.primitive!.at));
 const hit=projectShadow(p.toArray() as V3,[0,1,0,-.05],[sv.x,sv.y,sv.z,0]);shadowPositions.push(hit[0],.0503,hit[2]);
 }}
const shadow=new BufferGeometry();shadow.setAttribute('position',new Float32BufferAttribute(shadowPositions,3));shadow.setAttribute('normal',new Float32BufferAttribute(Array.from({length:shadowPositions.length},(_,i)=>i%3===1?1:0),3));
parts.push({id:'preview-shadow',mesh:'preview-shadow',primitive:{kind:'plane',at:[0,0,0],size:[1,1],color:'rubber'}});
const views:Record<string,{position:V3;target:V3;fov:number;ref:string}>={
 front:{position:[10,4.8,13],target:[10,.05,0],fov:49,ref:'singapore'},
 threequarter:{position:[18,9,12],target:[10,.05,0],fov:49,ref:'epwell'},
 profile:{position:[23,2.7,0],target:[10,.15,0],fov:49,ref:'singapore'},
 detail:{position:[10.44,.38,.65],target:[10,.14,0],fov:38,ref:'school-pole'},
 'pole-front':{position:[10,.85,2.6],target:[10,.50,0],fov:32,ref:'school-pole'},
 'pole-profile':{position:[12.6,.85,0],target:[10,.50,0],fov:32,ref:'school-pole'},
 'pole-threequarter':{position:[11.8,1.8,2.4],target:[10,.50,0],fov:40,ref:'school-pole'},
 plan:{position:[10,15,.001],target:[10,0,0],fov:45,ref:'north'},
};
if(!process.argv.includes('--sweep-only'))for(const theme of ['paper','cinema'] as const)for(const [name,camera]of Object.entries(views)){
 await renderParts(parts,{out:`${out}/${name}-${theme}.png`,camera,theme,width:800,height:700,meshGeometries:{courtyard:g,'preview-shadow':shadow},meshSurfaces:{courtyard:{roughness:.88,metalness:0},'preview-shadow':{roughness:1,metalness:0,opacity:.45}}});
 const ref=await sharp(`scripts/geo/light-and-shadows/refs/${camera.ref}.jpg`).resize(800,700,{fit:'contain',background:'#f2eee6'}).toBuffer();
 const label=Buffer.from(`<svg width="1600" height="52"><rect width="1600" height="52" fill="#e9e4d8"/><text x="20" y="32" font-family="sans-serif" font-size="19">${round} / ${name} / ${theme} — actual engine geometry + studio / ACES</text><text x="825" y="32" font-family="sans-serif" font-size="18">Reference: ${camera.ref}; design context, not an exact-site replica</text></svg>`);
 await sharp({create:{width:1600,height:752,channels:3,background:'#e9e4d8'}}).composite([{input:`${out}/${name}-${theme}.png`,left:0,top:52},{input:ref,left:800,top:52},{input:label,left:0,top:0}]).png().toFile(`${out}/${name}-${theme}-comparison.png`);
}
const before=JSON.parse(fs.readFileSync('scripts/geo/light-and-shadows/before-rebuild.json','utf8')),stats=measureParts(data.parts),old=measureParts(before.parts),meshStats=JSON.parse(fs.readFileSync('scripts/geo/light-and-shadows/mesh-stats.json','utf8'));stats.triangles+=meshStats.triangles-stats.byPart.courtyard!.triangles;stats.byPart.courtyard!.triangles=meshStats.triangles;
fs.writeFileSync(`${out}/counts.json`,JSON.stringify({before:old,after:stats,glb:meshStats},null,2)+'\n');console.log(out);
// Whole-topic sweep: apply the SAME default sim effects used by the stage,
// so the torch/screen are not incorrectly superimposed at their authored zero.
const {simEffects}=await import('../../../src/engines/space-scene/lib/sim/bind');
const defaultValues=resolveSimValues(parsed.sim!,{}),defaultOutput=evaluateSim(parsed.sim!,defaultValues),effects=simEffects(parsed.sim!,defaultValues,defaultOutput);
const benchIds=['torch','torch-stand','track','object-holder','card-circle','screen-board','screen-stand','bench-table'];
const bench=structuredClone(parsed.parts.filter(p=>benchIds.includes(p.id)));
for(const p of bench){const offset=effects.offset.get(p.id)??[0,0,0];for(const q of [p.primitive!,...(p.extra??[])])q.at=q.at.map((x,i)=>x+offset[i]!) as V3;}
for(const theme of ['paper','cinema'] as const)await renderParts(bench,{out:`${out}/sweep-bench-${theme}.png`,theme,camera:data.views.cover,width:1000,height:800});
const dark=parsed.parts.filter(p=>['box','box-torch','box-ball','box-inside'].includes(p.id));
for(const theme of ['paper','cinema'] as const)await renderParts(dark,{out:`${out}/sweep-dark-box-${theme}.png`,theme,camera:{position:[-.9,1.10,.4],target:[-.45,.85,-.18],fov:40},width:800,height:700});

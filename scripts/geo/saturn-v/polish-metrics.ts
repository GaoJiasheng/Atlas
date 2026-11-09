/** Count decoded shipping geometry, including retained topic primitives. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts';
const evidence=process.argv[2]??'/tmp/atlas-leftover-polish';
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const result:Record<string,unknown>={};
for(const [slug,name,model]of [['saturn-v','saturn','saturn-v.glb'],['heat','heat','heat-apparatus.glb'],['water','water','water.glb']] as const){
 const metrics:Record<string,unknown>={};
 for(const when of ['before','after']){
  const json=when==='before'?`${evidence}/before/${name}-parts.json`:`src/content/topics/${slug}/data/parts.json`,file=partsFile.parse(JSON.parse(fs.readFileSync(json,'utf8'))),path=when==='before'?`${evidence}/before/${model}`:`public${file.model}`,bytes=fs.readFileSync(path),doc=await io.readBinary(bytes),perPart:Record<string,{triangles:number;draws:number}>={};
  for(const p of file.parts){
   if(p.mesh){const node=doc.getRoot().listNodes().find(n=>n.getName()===p.mesh)!,prims=node.getMesh()!.listPrimitives();perPart[p.id]={triangles:prims.reduce((n,p)=>n+(p.getIndices()?.getCount()??p.getAttribute('POSITION')!.getCount())/3,0),draws:prims.length};}
   else{let triangles=0;for(const piece of partPieces(p)){if(!piece.lines)triangles+=(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);piece.geometry.dispose();}perPart[p.id]={triangles,draws:partMaterialSlots(p).length};}
  }
  metrics[when]={triangles:Object.values(perPart).reduce((n,p)=>n+p.triangles,0),draws:Object.values(perPart).reduce((n,p)=>n+p.draws,0),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),perPart};
 }
 const a=JSON.parse(fs.readFileSync(`src/content/topics/${slug}/data/parts.json`,'utf8')),b=JSON.parse(fs.readFileSync(`${evidence}/before/${name}-parts.json`,'utf8'));
 const strings=(x:unknown):unknown[]=>{if(Array.isArray(x))return x.flatMap(strings);if(x&&typeof x==='object'){const o=x as Record<string,unknown>;if(typeof o.en==='string'&&typeof o.zh==='string')return [o];return Object.values(o).flatMap(strings);}return [];};
 if(JSON.stringify(strings(a))!==JSON.stringify(strings(b)))throw Error(slug+' display text changed');
 result[slug]={...metrics,displayText:'All EN/ZH pairs unchanged'};
}
fs.writeFileSync('scripts/geo/saturn-v/leftover-metrics.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,(key,v)=>key==='perPart'?undefined:v,2));

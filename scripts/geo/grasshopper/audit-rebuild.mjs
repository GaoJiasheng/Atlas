/** Counts the decoded shipped geometry through the engine's bilateral and
 * visibility contracts, for every authored chapter and beat. No FPS claims. */
import fs from 'node:fs';
import {parse} from 'yaml';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {partsFile} from '../../../src/engines/space-scene/schema.ts';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
import {resolveAllPartDisplays} from '../../../src/engines/space-scene/lib/visibility.ts';
await MeshoptDecoder.ready;
for(const topic of ['grasshopper','mosquito']){
 const result={};
 for(const before of [true,false]){
  const data=partsFile.parse(JSON.parse(fs.readFileSync(before?`scripts/geo/${topic}/source-parts.json`:`src/content/topics/${topic}/data/parts.json`))),meshCounts={};
  if(data.model){const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public'+data.model);for(const node of doc.getRoot().listNodes()){const p=node.getMesh()?.listPrimitives()[0];if(p)meshCounts[node.getName()]=p.getIndices().getCount()/3;}}
  const counts={};for(const p of data.parts){if(p.mesh){counts[p.id]={triangles:meshCounts[p.mesh],calls:1};continue;}let triangles=0,calls=0;for(const piece of partPieces(p)){triangles+=piece.lines?0:(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);calls++;}counts[p.id]={triangles,calls};}
  const states=[];for(const file of fs.readdirSync(`src/content/topics/${topic}/chapters`).filter(p=>p.endsWith('.mdx'))){const c=parse(fs.readFileSync(`src/content/topics/${topic}/chapters/${file}`,'utf8').split('---')[1]),base=c.state;for(const [i,beat] of [base,...base.beats??[]].entries()){const state={...base,...beat,part:beat.part??base.part??null,hidden:beat.hide??base.hide??[],ghosted:beat.ghost??base.ghost??[]},visible=resolveAllPartDisplays(data.parts,state);let triangles=0,calls=0;for(const [id,d] of visible)if(d.visible){triangles+=counts[id].triangles;calls+=counts[id].calls;}states.push({chapter:c.id,beat:i,triangles,calls});}}
  result[before?'before':'after']={inventoryTriangles:Object.values(counts).reduce((a,b)=>a+b.triangles,0),inventoryCalls:Object.values(counts).reduce((a,b)=>a+b.calls,0),glbBytes:data.model?fs.statSync('public'+data.model).size:0,maxAuthoredTriangles:Math.max(...states.map(s=>s.triangles)),maxAuthoredCalls:Math.max(...states.map(s=>s.calls)),states,parts:counts};
 }
 fs.writeFileSync(`scripts/geo/${topic}/performance.json`,JSON.stringify(result,null,2)+'\n');console.log(topic,Object.fromEntries(Object.entries(result).map(([k,v])=>[k,{triangles:v.inventoryTriangles,maxAuthored:v.maxAuthoredTriangles,calls:v.maxAuthoredCalls,bytes:v.glbBytes}])));
}

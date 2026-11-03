/** Conservative chapter triangle bounds, before frustum/sim culling. No GPU/FPS claim. */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, EXTTextureWebP, KHRMeshQuantization } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';

await MeshoptDecoder.ready;
const doc=await new NodeIO().registerExtensions([EXTMeshoptCompression,EXTTextureWebP,KHRMeshQuantization]).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('public/models/solar-system.glb');
const meshCounts=new Map(doc.getRoot().listNodes().map(n=>[n.getName(),n.getMesh()?.listPrimitives().reduce((a,p)=>a+(p.getIndices()?.getCount()??0)/3,0)??0]));
const base=partsFile.parse(JSON.parse(readFileSync('scripts/geo/solar-system/baseline-parts.json','utf8')));
const live=partsFile.parse(JSON.parse(readFileSync('src/content/topics/solar-system/data/parts.json','utf8')));
const proposed=partsFile.parse(JSON.parse(readFileSync('scripts/geo/solar-system/proposed-parts.json','utf8')));
const triangleCache=new WeakMap<object,number>();
function triangles(p:typeof live.parts[number]){
 const cached=triangleCache.get(p);if(cached!==undefined)return cached;
 if(p.mesh){const n=meshCounts.get(p.mesh)!;triangleCache.set(p,n);return n;}
 const total=partPieces(p).reduce((sum,piece)=>{
  const count=(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);
  piece.geometry.dispose();return sum+count;
 },0);
 triangleCache.set(p,total);return total;
}
const frames=[];
for(const name of readdirSync('src/content/topics/solar-system/chapters').filter(n=>n.endsWith('.mdx')).sort()){
 const text=readFileSync(`src/content/topics/solar-system/chapters/${name}`,'utf8');
 const chapter=JSON.parse(text.split('---')[1]!);
 for(const [i,beat] of chapter.state.beats.entries()){
  const state={...chapter.state,...beat};
  const visible=(p:typeof live.parts[number])=>(!p.group||state.layers.includes(p.group))&&!state.hide.includes(p.id);
  const sum=(file:typeof live)=>file.parts.filter(visible).reduce((n,p)=>n+triangles(p),0);
  frames.push({chapter:chapter.id,beat:i+1,before:sum(base),live:sum(live),proposed:sum(proposed)});
 }
}
const parts=live.parts.map(p=>({id:p.id,before:triangles(base.parts.find(q=>q.id===p.id)!),live:triangles(p),proposed:triangles(proposed.parts.find(q=>q.id===p.id)!)}));
const report={kind:'Conservative visible triangle bound before frustum/sim culling; not GPU statistics',max:{before:Math.max(...frames.map(f=>f.before)),live:Math.max(...frames.map(f=>f.live)),proposed:Math.max(...frames.map(f=>f.proposed))},sumAllParts:{before:parts.reduce((n,p)=>n+p.before,0),live:parts.reduce((n,p)=>n+p.live,0),proposed:parts.reduce((n,p)=>n+p.proposed,0)},frames,parts};
writeFileSync('scripts/geo/solar-system/triangle-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(report.max,report.sumAllParts);

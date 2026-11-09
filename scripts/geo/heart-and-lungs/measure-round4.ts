/** Compare actual pre-round runtime container with current bound geometry. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {unpack} from './append-glb';
import {partsFile} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
const root='/tmp/atlas-heart-round4';
function measure(partsPath:string,modelPath:string){
 const parts=partsFile.parse(JSON.parse(fs.readFileSync(partsPath,'utf8'))),bytes=fs.readFileSync(modelPath),glb=unpack(bytes);
 const counts=Object.fromEntries(parts.parts.map(p=>{
  if(p.mesh){const node=glb.json.nodes.find((n:any)=>n.name===p.mesh),prims=glb.json.meshes[node.mesh].primitives;return [p.id,{triangles:prims.reduce((s:number,q:any)=>s+glb.json.accessors[q.indices].count/3,0),drawCalls:prims.length}];}
  const pieces=partPieces(p),n={triangles:0,drawCalls:pieces.length};for(const q of pieces){if(!q.lines)n.triangles+=(q.geometry.index?.count??q.geometry.getAttribute('position').count)/3*(q.matrices?.length??1);q.geometry.dispose();}return [p.id,n];
 }));
 return {file:modelPath,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),parts:Object.fromEntries(['fish-body','gill-cover','gills','plant-specimen'].map(id=>[id,counts[id]])),allTriangles:Object.values(counts).reduce((n,c)=>n+c.triangles,0),allDraws:Object.values(counts).reduce((n,c)=>n+c.drawCalls,0)};
}
const result={before:measure(`${root}/before/parts.json`,`${root}/before/heart-and-lungs-bench.glb`),after:measure('src/content/topics/heart-and-lungs/data/parts.json','public/models/heart-and-lungs-bench.glb'),note:'Conservative all-authored geometry, including bilateral primitive expansion; excludes shadow-pass multiplication, floor and flow overlays.'};
fs.writeFileSync(`${root}/metrics.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));

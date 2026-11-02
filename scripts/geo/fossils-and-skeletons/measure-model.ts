/** Complete tessellation counts, including hidden studies, rather than the
 * back-face-culled triangle subset in the offline projection images.
 * Usage: pnpm tsx scripts/geo/fossils-and-skeletons/measure-model.ts [parts.json]
 */
import fs from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';

const path=process.argv[2]??'src/content/topics/fossils-and-skeletons/data/parts.json';
const data=partsFile.parse(JSON.parse(fs.readFileSync(path,'utf8')));
const meshTriangles=new Map<string,number>();
if(data.model){
 await MeshoptDecoder.ready;
 const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(`public${data.model}`);
 for(const node of doc.getRoot().listNodes())meshTriangles.set(node.getName(),node.getMesh()!.listPrimitives().reduce((n,p)=>n+(p.getIndices()?.getCount()??p.getAttribute('POSITION')!.getCount())/3,0));
}
const studies:Record<string,{parts:number;triangles:number;pieces:number}>={};
for(const part of data.parts){
 const key=part.id.startsWith('myna-')?'bird':part.id.endsWith('-study')?'museum':part.group??'context';
 const count=studies[key]??={parts:0,triangles:0,pieces:0};count.parts++;
 if(part.mesh){count.triangles+=meshTriangles.get(part.mesh)!;count.pieces++;}
 else for(const piece of partPieces(part)){
  if(!piece.lines)count.triangles+=(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);
  count.pieces++;piece.geometry.dispose();
 }
}
const total=Object.values(studies).reduce((a,b)=>({parts:a.parts+b.parts,triangles:a.triangles+b.triangles,pieces:a.pieces+b.pieces}),{parts:0,triangles:0,pieces:0});
console.log(JSON.stringify({studies,total,assetBytes:data.model?fs.statSync(`public${data.model}`).size:0},null,2));

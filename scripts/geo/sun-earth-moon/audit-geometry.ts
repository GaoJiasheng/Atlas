/** CPU inventory of live parts and the prepared model. No draw-call/FPS claim. */
import { readFileSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
const root=resolve(import.meta.dirname,'../../..');
const file=partsFile.parse(JSON.parse(readFileSync(resolve(root,'src/content/topics/sun-earth-moon/data/parts.json'),'utf8')));
const parts=Object.fromEntries(file.parts.map(p=>{
 const pieces=partPieces(p);let tris=0;
 for(const piece of pieces){tris+=(piece.geometry.index?.count??piece.geometry.getAttribute('position').count)/3*(piece.matrices?.length??1);piece.geometry.dispose();}
 return [p.id,tris];
}));
const doc=await new NodeIO().read(resolve(root,'public/models/sun-earth-moon/surfaces.glb'));
const prepared=Object.fromEntries(doc.getRoot().listNodes().map(n=>[n.getName(),n.getMesh()!.listPrimitives().reduce((s,p)=>s+p.getIndices()!.getCount()/3,0)]));
// OrbitDriver's actual six-sided uncapped tubes: 12 triangles per segment.
// Plane: four outline strokes, one normal, 24 arc stations; rays: one ray +
// 128 terminator segments. NaN pen lifts do not emit triangles.
const guideTriangles=12*(128+128+29+1+129+1);
const guideIds=['lunar-track','earth-track','orbital-plane','node-line','light-ray-guide','scale-ruler'];
const permanent=Object.entries(parts).filter(([id])=>!guideIds.includes(id));
const before=permanent.reduce((s,[,n])=>s+n,0)+guideTriangles;
const after=permanent.reduce((s,[id,n])=>s+(prepared[id]??n),0)+guideTriangles;
const report={method:'CPU generated triangle inventory, conservative all-body/all-guide visibility; excludes UI, optional ground and GPU draw-call/FPS measurements',liveBefore:before,liveAfter:before,preparedAfter:after,parts,prepared,guideTriangles};
writeFileSync(resolve(root,'public/models/sun-earth-moon/triangle-audit.json'),JSON.stringify(report,null,2)+'\n');
process.stdout.write(JSON.stringify(report,null,2)+'\n');

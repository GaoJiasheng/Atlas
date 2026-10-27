/** CPU-only audit. No browser/GPU performance claim. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PerspectiveCamera, Vector3 } from 'three';
import { partsFileBase } from '../../../src/engines/space-scene/schema';
import { partBounds, partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { partPieces } from '../../../src/engines/space-scene/stages/model3d/geometry';
import { buildParts } from './build-parts';
import { fitCameraToAspect } from '../../../src/engines/space-scene/lib/camera';
const data=partsFileBase.parse(buildParts());
const all=new Map(data.parts.map(p=>[p.id,p]));
const viewTargets: Record<string,string[]>={
  hero: ['bakau-tree','giant-mudskipper','api-tree','mud-bank','tidal-water'],
  'habitat-view':['giant-mudskipper','fiddler-crabs','tree-crabs','heron','bakau-tree','mud-bank','tidal-water'],
  'roots-view':['api-lateral','api-pencil','api-tree','bakau-prop'],
  'tide-view':['tidal-water','burrow-mouth','fiddler-crabs','tree-crabs','bakau-tree'],
  'animal-view':['giant-mudskipper','fiddler-crabs'],
  'gill-view':['giant-mudskipper','gill-inset'],
  'web-view':['giant-mudskipper','heron','small-fish','algae-patch','bakau-tree','fallen-leaves','tree-crabs','fiddler-crabs'],
  'microbe-view':['bacteria-inset','fungi-inset'],
};
const projections=[];
for(const preset of [...data.presets!,{id:'gill-view',camera:{position:[1.9,.9,2.2],target:[.65,.15,.18],fov:32}},{id:'microbe-view',camera:{position:[1.4,.8,.9],target:[1.05,.2,0],fov:28}}]) {
 for(const [name,aspect] of [['desktop',16/9],['phone',390/844]] as const) {
  const fitted=fitCameraToAspect(preset.camera as Parameters<typeof fitCameraToAspect>[0],aspect);
  const c=new PerspectiveCamera(fitted.fov,aspect,.001,100);
  c.position.fromArray(fitted.position); c.lookAt(new Vector3().fromArray(fitted.target)); c.updateMatrixWorld();
  for(const id of viewTargets[preset.id]!) {
   const p=all.get(id)!;
   const b=partBounds(p)!;
   const anchor=[0,1,2].map(k=>(b.min[k]!+b.max[k]!)/2);
   const q=new Vector3().fromArray(anchor).project(c);
   projections.push({view:preset.id,viewport:name,id,anchor,ndc:q.toArray().map(x=>+x.toFixed(3)),inside:Math.abs(q.x)<=1&&Math.abs(q.y)<=1&&q.z>=-1&&q.z<=1});
  }
 }
}
const rows=[];let totalTriangles=0,totalCalls=0;
for(const p of data.parts) {
 const b=partBounds(p)!;let triangles=0,piecesCount=0;
 for(const piece of partPieces(p)) {const g=piece.geometry; triangles+=(g.index?.count ?? g.getAttribute('position').count)/3*(piece.matrices?.length??1);piecesCount++;g.dispose();}
 totalTriangles+=triangles;totalCalls+=partMaterialSlots(p).length;
 rows.push({id:p.id,context:!!p.context,extras:p.extra?.length??0,slots:partMaterialSlots(p).length,pieces:piecesCount,triangles,bounds:b});
}
const overlaps=[];
for(const [i,a] of data.parts.entries()) for(const b of data.parts.slice(i+1)) {
 const aa=partBounds(a)!,bb=partBounds(b)!;
 const extent=[0,1,2].map(k=>Math.min(aa.max[k]!,bb.max[k]!)-Math.max(aa.min[k]!,bb.min[k]!));
 if(extent.every(x=>x>0)) overlaps.push({a:a.id,b:b.id,extent:extent.map(x=>+x.toFixed(5))});
}
const explodedOverlaps=[];
for(const [i,a] of data.parts.entries()) for(const b of data.parts.slice(i+1)) {
 const offset=(p: typeof a)=>{const e=p.explode;const n=Math.hypot(...e.dir)||1;return e.dir.map(x=>x*e.dist/n);};
 const aa=partBounds(a,offset(a))!,bb=partBounds(b,offset(b))!;
 const extent=[0,1,2].map(k=>Math.min(aa.max[k]!,bb.max[k]!)-Math.max(aa.min[k]!,bb.min[k]!));
 if(extent.every(x=>x>0)) explodedOverlaps.push({a:a.id,b:b.id,extent:extent.map(x=>+x.toFixed(5))});
}
const output={method:'CPU primitive geometry, conservative boxes and numerical camera projection. No browser, screenshots, GPU calls, shadows or occlusion validation.',referenceReadOnly:[{url:'https://commons.wikimedia.org/wiki/File:Ring-legged_Fiddler_Crab_(Uca_annulipes)_(15748699382).jpg',author:'Bernard Dupont',licence:'CC BY-SA 2.0',use:'Read-only verification of anatomical facts. No traced shape, texture, image or mesh is incorporated.'}],selectable:rows.filter(r=>!r.context).length,context:rows.filter(r=>r.context).length,baseMaterialSlotCalls:totalCalls,geometryTriangles:totalTriangles,parts:rows,projections,conservativeOverlaps:overlaps,explodedConservativeOverlaps:explodedOverlaps,anatomy:{crabs:{walkingLegsPerSpecimen:8,chelipedArms:2,pincers:2,eyeStalks:2,eyes:2,extras:16},mudskipper:{eyes:2,pectoralFins:2,tailFins:1,dorsalFins:1},heron:{legs:2,neck:1,bill:1}},checks:{finiteBounds:rows.every(r=>[...r.bounds.min,...r.bounds.max].every(Number.isFinite)),extraCap:rows.every(r=>r.extras<=16),allRelevantAnchorsInFrustum:projections.every(p=>p.inside)}};
const out=join(import.meta.dirname,'../../../src/content/topics/mangrove-food-web/authoring/geometry-audit.json');
mkdirSync(join(out,'..'),{recursive:true});
writeFileSync(out,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({selectable:output.selectable,context:output.context,baseCalls:totalCalls,triangles:totalTriangles,projections:projections.length,offscreen:projections.filter(p=>!p.inside),conservativeOverlaps:overlaps.length,explodedConservativeOverlaps:explodedOverlaps.length,checks:output.checks},null,2));

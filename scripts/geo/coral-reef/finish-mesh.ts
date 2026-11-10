/** Error-bounded offline mesh reduction; no runtime dependencies beyond GLB. */
import {compressModel} from './compress-model';
import { NodeIO } from '@gltf-transform/core';
import { dedup, simplifyPrimitive, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
const path=process.argv[2];
if(!path)throw new Error('Pass the original generated coral GLB.');
await MeshoptSimplifier.ready;
const io=new NodeIO(),doc=await io.read(path);
const count=()=>doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((s,p)=>s+(p.getIndices()?.getCount()??0)/3,0),0);
const before=count();
// Weld removes duplicate seam vertices; the simplifier collapses only triangles
// within a relative surface-error bound (at most ~0.6 mm on the largest colony).
await doc.transform(weld());
for (const mesh of doc.getRoot().listMeshes()) {
  // Broad limestone has no organic silhouette or fine calice detail. Its
  // conservative error cap is under 0.2% of the zone span; keep shared borders.
  const terrain = ['reef-flat','reef-crest','reef-slope'].includes(mesh.getName());
  // Hair-scale cilia have no redundant triangles; the larva is authored at its final density.
  if (mesh.getName() === 'larva-inset') continue;
  // The food-web coral is a small copy of the boulder study and never fills the frame.
  const webCopy = mesh.getName() === 'web-coral';
  for (const primitive of mesh.listPrimitives()) simplifyPrimitive(primitive, {
    simplifier:MeshoptSimplifier,ratio:terrain ? .17 : webCopy ? .2 : .43,error:terrain ? .0018 : webCopy ? .0035 : .001,lockBorder:true,
  });
}
await doc.transform(dedup());
await io.write(path,doc);
console.log(`Coral mesh finish: ${before} -> ${count()} triangles`);

await compressModel(path);

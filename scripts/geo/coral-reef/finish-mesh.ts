/** Error-bounded offline mesh reduction; no runtime dependencies beyond GLB. */
import { NodeIO } from '@gltf-transform/core';
import { dedup, simplify, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
const path=process.argv[2];
if(!path)throw new Error('Pass the original generated coral GLB.');
await MeshoptSimplifier.ready;
const io=new NodeIO(),doc=await io.read(path);
const count=()=>doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((s,p)=>s+(p.getIndices()?.getCount()??0)/3,0),0);
const before=count();
// Weld removes duplicate seam vertices; the simplifier collapses only triangles
// within a relative surface-error bound (at most ~0.6 mm on the largest colony).
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.43,error:.001,lockBorder:true}),dedup());
await io.write(path,doc);
console.log(`Coral mesh finish: ${before} -> ${count()} triangles`);

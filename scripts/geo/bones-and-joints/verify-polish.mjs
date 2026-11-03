/** Decode the published model with a second GLTF implementation. Read only. */
import {createRequire} from 'node:module';
import {dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {MeshoptDecoder} from 'meshoptimizer';
const require=createRequire(import.meta.url);
const {ALL_EXTENSIONS}=await import(pathToFileURL(require.resolve('@gltf-transform/extensions',{paths:[dirname(require.resolve('@gltf-transform/functions'))]})));
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const doc=await io.read('public/models/bones-and-joints-polished.glb');
let triangles=0;
for(const mesh of doc.getRoot().listMeshes())for(const p of mesh.listPrimitives()){
 triangles+=p.getIndices().getCount()/3;
 for(const attr of ['POSITION','NORMAL'])if(Array.from(p.getAttribute(attr).getArray()).some(x=>!Number.isFinite(x)))throw Error(`Nonfinite ${mesh.getName()}: ${attr}`);
}
// Alternative specimens share a packet; measure-polish.ts bounds visible beats.
console.log(JSON.stringify({meshNodes:doc.getRoot().listNodes().filter(n=>n.getMesh()).length,triangles,decoded:'finite'}));

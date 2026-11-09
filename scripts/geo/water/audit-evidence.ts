/** Prove which reviewed views remain valid after a local scenery-only correction.
 * Run before the final production build replaces dist/models/water.glb.
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { dequantize } from '@gltf-transform/functions';
const hash=(a:Uint8Array)=>createHash('sha256').update(a).digest('hex');
await MeshoptDecoder.ready;
async function fingerprint(path:string){
 const bytes=fs.readFileSync(path),doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read(path);
 await doc.transform(dequantize());
 const nodes=Object.fromEntries(doc.getRoot().listNodes().map(node=>{
  const p=node.getMesh()!.listPrimitives()[0]!,parts=[JSON.stringify(node.getWorldMatrix()),JSON.stringify(p.getMaterial()!.getExtras())];
  for(const attr of [...p.listAttributes(),p.getIndices()!])parts.push(hash(new Uint8Array(attr.getArray()!.buffer,attr.getArray()!.byteOffset,attr.getArray()!.byteLength)));
  return [node.getName(),createHash('sha256').update(parts.join('\n')).digest('hex')];
 }));return {sha256:hash(bytes),nodes};
}
const previous=await fingerprint('dist/models/water.glb'),current=await fingerprint('public/models/water.glb');
const unchanged=Object.keys(current.nodes).filter(id=>current.nodes[id]===previous.nodes[id]);
const changed=Object.keys(current.nodes).filter(id=>current.nodes[id]!==previous.nodes[id]);
const result={previous,current,unchanged,changed,method:'Decoded attributes, indices, material extras and node world matrices hashed; studio settings unchanged.'};
fs.writeFileSync('scripts/geo/water/comparisons/evidence-provenance.json',JSON.stringify(result,null,2)+'\n');console.log({unchanged,changed});
